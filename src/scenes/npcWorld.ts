import Phaser from 'phaser';
import { TILE } from '../config/constants';
import { MINUTES_PER_TICK, MS_PER_TICK } from '../config/time';
import { EventBus, GameEvents } from '../events/EventBus';
import { net } from '../net/NetSession';
import { gameState } from '../state/GameState';
import { timeControl } from '../state/timeControl';
import { npcMinute } from '../systems/npc/clock';
import { NPC_CONFIG } from '../systems/npc/config';
import { createFamily } from '../systems/npc/families';
import { endTalk, simulateFamily, startTalk, type SimEnv, type SimEvent } from '../systems/npc/sim';
import type { FamilyLayout, FamilyState, Place } from '../systems/npc/types';
import { inRect, type Homestead, type Paddy } from './homesteads';
import { readProp } from './worldSprites';

/** Where a family's places are on this map (tiles). */
export interface FamilyGeo {
  home: Homestead;
  paddy: Paddy | null;
  /** Field size in cells. */
  cells: { cols: number; rows: number } | null;
  spots: Record<Exclude<Place, 'market'>, { x: number; y: number }>;
}

type Tile = { x: number; y: number };

/**
 * Keeps the village farm families of this map going (the host or a lone
 * player runs the simulation for every family, near or not; guests get the
 * host's state) and knows where their home, field, pasture and the school are.
 * Off screen nothing is drawn and nobody path-finds: the families live on in
 * systems/npc by their timetable; villagers.ts draws the near ones.
 */
export class NpcWorld {
  readonly geos: FamilyGeo[] = [];
  private readonly envs = new Map<string, SimEnv>();
  private lastTickAt = 0;
  private readonly onTick = () => (this.lastTickAt = performance.now());
  /** People who said goodbye since the villagers last looked (they show the line and clear it). */
  farewells: SimEvent[] = [];

  constructor(
    map: Phaser.Tilemaps.Tilemap,
    homesteads: Homestead[],
    paddies: Paddy[],
    walkable: (x: number, y: number) => boolean,
    taken: (h: Homestead) => boolean,
  ) {
    const school = schoolSpot(map);
    const k = NPC_CONFIG.field.cellTiles;
    for (const home of homesteads) {
      if (home.vacant || home.members < 1 || taken(home)) continue;
      const paddy = paddies.find((p) => p.key === home.key) ?? null;
      const cells = paddy ? { cols: Math.ceil((paddy.x1 - paddy.x0 + 1) / k), rows: Math.ceil((paddy.y1 - paddy.y0 + 1) / k) } : null;
      const gate = { x: home.gate.x, y: home.gate.y - 2 };
      const field = paddy ? { x: paddy.bridgeX, y: paddy.roadY } : gate;
      const pastureGuess = paddy ? { x: Math.round((paddy.x0 + paddy.x1) / 2), y: paddy.side === 'north' ? paddy.y0 - 6 : paddy.y1 + 6 } : { x: home.x1 + 8, y: home.gate.y };
      const notPaddy = (x: number, y: number) => walkable(x, y) && !paddies.some((p) => inRect(p, x, y)) && !inRect(home, x, y);
      const pasture = nearestTile(pastureGuess, notPaddy) ?? gate;
      const geo: FamilyGeo = { home, paddy, cells, spots: { home: gate, field, pasture, school: school ?? { x: gate.x + 40, y: gate.y } } };
      this.geos.push(geo);
      this.envs.set(home.key, { layout: layoutOf(geo), raining: () => gameState.time.weather === 'rainy', cfg: NPC_CONFIG });
    }
    this.lastTickAt = performance.now();
    EventBus.on(GameEvents.TimeTick, this.onTick);
  }

  destroy(): void {
    EventBus.off(GameEvents.TimeTick, this.onTick);
  }

  /** The NPC clock, moving on smoothly between the 10-minute ticks of the game clock. */
  minute(): number {
    return Math.floor(this.exactMinute());
  }

  /** The same with the fraction of the minute (for smooth walking). */
  exactMinute(): number {
    const base = npcMinute(gameState.time);
    if (timeControl.paused) return base;
    const extra = ((performance.now() - this.lastTickAt) / MS_PER_TICK) * MINUTES_PER_TICK;
    return base + Phaser.Math.Clamp(extra, 0, MINUTES_PER_TICK - 0.001);
  }

  family(key: string): FamilyState | undefined {
    return gameState.npcFamilies[key];
  }

  /** Runs every family up to now (host / alone only). */
  update(): void {
    if (net.role === 'guest') return;
    const now = this.minute();
    let next: Record<string, FamilyState> | null = null;
    for (const geo of this.geos) {
      const key = geo.home.key;
      const env = this.envs.get(key)!;
      const fam = gameState.npcFamilies[key] ?? createFamily(descriptor(geo), now, NPC_CONFIG);
      if (fam.simMinute >= now && gameState.npcFamilies[key]) continue;
      const r = simulateFamily(fam, env, now);
      this.farewells.push(...r.events);
      (next ??= { ...gameState.npcFamilies })[key] = r.family;
    }
    if (next) gameState.npcFamilies = next;
  }

  /** The player talks to someone: true if they stop, false if they only say goodbye. */
  talk(familyKey: string, npcId: string): boolean {
    const fam = gameState.npcFamilies[familyKey];
    const env = this.envs.get(familyKey);
    if (!fam || !env) return false;
    if (net.role === 'guest') return true; // the host runs the families: just chat
    const r = startTalk(fam, npcId, Math.max(fam.simMinute, this.minute()), env);
    gameState.npcFamilies = { ...gameState.npcFamilies, [familyKey]: r.family };
    return !r.farewell;
  }

  stopTalking(familyKey: string, npcId: string): void {
    const fam = gameState.npcFamilies[familyKey];
    if (fam) gameState.npcFamilies = { ...gameState.npcFamilies, [familyKey]: endTalk(fam, npcId) };
  }
}

function descriptor(geo: FamilyGeo) {
  const h = geo.home;
  return { key: h.key, members: h.members, grazer: !!h.livestock, chickens: h.feature === 'chickens', fieldCells: geo.cells };
}

/** Walking minutes between places: the straight (Manhattan) distance, a bit longer for the bends. */
function layoutOf(geo: FamilyGeo): FamilyLayout {
  const t = NPC_CONFIG.travel;
  return {
    minutes(from: Place, to: Place): number {
      if (from === 'market' || to === 'market') return NPC_CONFIG.market.walkMinutes;
      const a = geo.spots[from];
      const b = geo.spots[to];
      return Math.round(((Math.abs(a.x - b.x) + Math.abs(a.y - b.y)) * t.pathFactor) / t.walkTilesPerMinute);
    },
  };
}

/** Just outside the school's door. */
function schoolSpot(map: Phaser.Tilemaps.Tilemap): Tile | null {
  const o = (map.getObjectLayer('objects')?.objects ?? []).find((p) => p.name === 'prop' && readProp(p, 'sprite') === 'school');
  if (!o) return null;
  const x = Math.floor(((o.x ?? 0) + (o.width ?? 0) / 2) / TILE);
  return readProp(o, 'facing') === 'up' ? { x, y: Math.floor((o.y ?? 0) / TILE) - 1 } : { x, y: Math.floor(((o.y ?? 0) + (o.height ?? 0)) / TILE) + 1 };
}

function nearestTile(from: Tile, ok: (x: number, y: number) => boolean, radius = 12): Tile | null {
  for (let r = 0; r <= radius; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) === r && ok(from.x + dx, from.y + dy)) return { x: from.x + dx, y: from.y + dy };
      }
    }
  }
  return null;
}
