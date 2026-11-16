import { EventBus, GameEvents } from '../events/EventBus';
import { applySharedWorld, gameState } from '../state/GameState';
import { net, NetEvents } from './NetSession';
import type { SharedWorld } from './protocol';
import { applyPatch, diff, snapshot, type Baseline, type WorldPatch } from './worldPatch';

/** How often (ms) local changes to the shared farm are sent. */
const FLUSH_MS = 150;

/**
 * Keeps the shared farm in step between players: sends what I changed,
 * applies what others changed, and (host) relays guests' changes to each
 * other. Visible maps redraw via GameEvents.WorldPatched.
 */
class WorldSync {
  private base: Baseline | null = null;
  private lastFlush = 0;

  constructor() {
    net.events.on(NetEvents.Patch, (p: { from: string; patch: WorldPatch }) => this.receive(p.from, p.patch));
    net.events.on(NetEvents.World, (world: SharedWorld) => {
      applySharedWorld(world);
      this.rebase();
    });
  }

  /** Forget pending differences: the current state is what everyone has. */
  rebase(): void {
    this.base = snapshot(gameState);
  }

  update(time: number): void {
    if (!net.online) {
      this.base = null;
      return;
    }
    if (!this.base) this.rebase();
    if (time - this.lastFlush < FLUSH_MS) return;
    this.lastFlush = time;
    this.flush();
  }

  private flush(): void {
    if (!this.base) return;
    const patch = diff(gameState, this.base);
    this.base = snapshot(gameState);
    if (patch) net.sendPatch(patch);
  }

  private receive(from: string, patch: WorldPatch): void {
    this.flush(); // send my own pending changes first, so they aren't mistaken for theirs
    applyPatch(gameState, patch);
    this.base = snapshot(gameState);
    if (net.role === 'host') net.sendPatch(patch, from);
    EventBus.emit(GameEvents.WorldPatched, patch);
  }
}

export const worldSync = new WorldSync();
