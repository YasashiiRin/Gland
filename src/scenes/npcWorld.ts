import Phaser from 'phaser';
import { TILE } from '../config/constants';
import { MINUTES_PER_TICK, MS_PER_TICK } from '../config/time';
import { EventBus, GameEvents } from '../events/EventBus';
import { net } from '../net/NetSession';
import { gameState } from '../state/GameState';
import { timeControl } from '../state/timeControl';
import { hashString, npcMinute } from '../systems/npc/clock';
import { NPC_CONFIG } from '../systems/npc/config';
import { createFamily, familyTypeFor, plotSeed, type PlotSize } from '../systems/npc/families';
import { newFieldGrid } from '../systems/npc/field';
import { endTalk, simulateFamily, startTalk, type SimEnv, type SimEvent } from '../systems/npc/sim';
import type { FamilyLayout, FamilyState, Place, PlotRect } from '../systems/npc/types';
import { inRect, type Homestead, type Paddy } from './homesteads';
import { readProp } from './worldSprites';

/** Where a family's places are on this map (tiles). */
export interface FamilyGeo {
  home: Homestead;
  paddy: Paddy | null;
  /** The plots of the paddy the family works, nearest the road first (around its bridge). */
  plots: PlotRect[];
  /** Size in cells of each plot. */
  cells: PlotSize[];
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
      const plots = paddy ? plotsOf(paddy, home) : [];
      const cells = plots.map((p) => ({ cols: Math.ceil((p.x1 - p.x0 + 1) / k), rows: Math.ceil((p.y1 - p.y0 + 1) / k) }));
      const gate = { x: home.gate.x, y: home.gate.y - 2 };
      const field = paddy ? { x: paddy.bridgeX, y: paddy.roadY } : gate;
      const pastureGuess = paddy ? { x: Math.round((paddy.x0 + paddy.x1) / 2), y: paddy.side === 'north' ? paddy.y0 - 6 : paddy.y1 + 6 } : { x: home.x1 + 8, y: home.gate.y };
      const notPaddy = (x: number, y: number) => walkable(x, y) && !paddies.some((p) => inRect(p, x, y)) && !inRect(home, x, y);
      const pasture = nearestTile(pastureGuess, notPaddy) ?? gate;
      const geo: FamilyGeo = { home, paddy, plots, cells, spots: { home: gate, field, pasture, school: school ?? { x: gate.x + 40, y: gate.y } } };
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
      let fam = gameState.npcFamilies[key] ?? createFamily(descriptor(geo), now, NPC_CONFIG);
      const c = geo.cells;
      const fields = Array.isArray(fam.fields) ? fam.fields : [];
      if (fields.length !== c.length || fields.some((g, i) => g.cols !== c[i].cols || g.rows !== c[i].rows)) {
        // The field was laid out differently (an older save): start it afresh.
        const fresh = c.map((p, i) => newFieldGrid(p.cols, p.rows, plotSeed(fam.seed, i), NPC_CONFIG));
        fam = { ...fam, fields: fresh, members: fam.members.map((m) => ({ ...m, currentTask: null })) };
        delete (fam as { field?: unknown }).field;
      } else if (fam.simMinute >= now && gameState.npcFamilies[key]) continue;
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

/**
 * The family's plots: as many as its family type works, each the configured
 * size, one behind the other from the road with a strip of grass between,
 * centred on its bridge (as many as fit in the paddy).
 */
function plotsOf(paddy: Paddy, home: Homestead): PlotRect[] {
  const f = NPC_CONFIG.field;
  const desc = { key: home.key, members: home.members, grazer: !!home.livestock, chickens: home.feature === 'chickens', plots: [] };
  const type = familyTypeFor(desc, hashString(home.key), NPC_CONFIG);
  const [w0, h0] = f.plotTiles[type];
  const w = Math.min(w0, paddy.x1 - paddy.x0 + 1);
  const h = Math.min(h0, paddy.y1 - paddy.y0 + 1);
  const x0 = Phaser.Math.Clamp(paddy.bridgeX - Math.floor(w / 2), paddy.x0, paddy.x1 - w + 1);
  const plots: PlotRect[] = [];
  for (let k = 0; k < f.plots[type]; k++) {
    const from = k * (h + f.plotGapTiles); // rows away from the road
    if (from + h > paddy.y1 - paddy.y0 + 1) break;
    const y0 = paddy.side === 'north' ? paddy.y1 - from - h + 1 : paddy.y0 + from;
    plots.push({ x0, x1: x0 + w - 1, y0, y1: y0 + h - 1, side: paddy.side });
  }
  return plots;
}

function descriptor(geo: FamilyGeo) {
  const h = geo.home;
  return { key: h.key, members: h.members, grazer: !!h.livestock, chickens: h.feature === 'chickens', plots: geo.cells };
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
