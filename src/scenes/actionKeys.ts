import Phaser from 'phaser';
import { controlsState, currentBindings } from '../state/controls';
import { ACTION_IDS, type ActionId } from '../systems/KeyBindings';

/**
 * A scene's keyboard, read by action ("use", "hotbar3"…) instead of by key,
 * so the player's own bindings apply. Rebuilds itself when they change.
 */
export class ActionKeys {
  private keys = new Map<ActionId, Phaser.Input.Keyboard.Key[]>();
  private version = -1;

  constructor(private readonly kb: Phaser.Input.Keyboard.KeyboardPlugin) {
    this.sync();
  }

  private sync(): void {
    if (this.version === controlsState.version) return;
    this.version = controlsState.version;
    const bindings = currentBindings();
    this.keys = new Map(ACTION_IDS.map((id) => [id, bindings[id].map((code) => this.kb.addKey(code))]));
  }

  isDown(action: ActionId): boolean {
    this.sync();
    return (this.keys.get(action) ?? []).some((k) => k.isDown);
  }

  /** Pressed since the last check (each key's press is used up). */
  justDown(action: ActionId): boolean {
    this.sync();
    let hit = false;
    for (const k of this.keys.get(action) ?? []) if (Phaser.Input.Keyboard.JustDown(k)) hit = true;
    return hit;
  }

  /** Forgets every pending press (e.g. the key just typed into the key menu). */
  flush(): void {
    this.sync();
    for (const list of this.keys.values()) for (const k of list) Phaser.Input.Keyboard.JustDown(k);
  }
}
