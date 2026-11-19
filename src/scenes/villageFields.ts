import type Phaser from 'phaser';
import { TILE } from '../config/constants';
import { DAY_LENGTH_MINUTES } from '../config/time';
import { TILE_GID } from '../config/tileGids';
import { net } from '../net/NetSession';
import { gameState } from '../state/GameState';
import { currentJob, jobFront, newField, simulate, strips, stripTile, tilesDone, type FieldState } from '../systems/NpcFarmSystem';
import { absoluteMinute } from '../systems/StatsSystem';
import type { GroundLook } from './groundLook';
import { hdScale } from './hd';
import { inRect, type Homestead, type Paddy } from './homesteads';

const DAY_START = 6 * 60;
/** Paddies within this many tiles of the camera are redrawn as they change. */
const DRAW_TILES = 60;
const SEEDLING = 0x9ad66e;
const YOUNG = 0x6fbf4f;

export interface PaddyWork {
  paddy: Paddy;
  home: Homestead;
  workers: number;
  tiles: number;
  tripMinutes: number;
}

/**
 * Keeps the households' paddies going (the host or a lone player runs
 * NpcFarmSystem up to the clock, even for paddies nobody is near) and draws
 * them: grass, hoed earth, seedlings, flooded rice growing green, ripe gold,
 * stubble, and the sheaves waiting on the roadside.
 */
export class VillageFields {
  readonly works: PaddyWork[];
  /** What each paddy was last drawn as: its look, and the tiles done / watered per strip. */
  private readonly drawn = new Map<string, { base: string; counts: (readonly [number, number])[] }>();
  private readonly sheafImages = new Map<string, Phaser.GameObjects.Image[]>();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly look: GroundLook,
    private readonly ground: Phaser.Tilemaps.TilemapLayer,
    private readonly decor: Phaser.Tilemaps.TilemapLayer,
    paddies: Paddy[],
    homesteads: Homestead[],
  ) {
    this.works = paddies.flatMap((paddy) => {
      const home = homesteads.find((h) => h.key === paddy.key);
      if (!home) return [];
      const tiles = (paddy.x1 - paddy.x0 + 1) * (paddy.y1 - paddy.y0 + 1);
      const trip = 2 * (Math.abs(home.gate.x - paddy.bridgeX) + Math.abs(home.gate.y - paddy.roadY)) * 1.05;
      return [{ paddy, home, workers: home.members >= 3 ? 2 : 1, tiles, tripMinutes: trip }];
    });
  }

  /** The household's paddy state (created the first time it is seen). */
  state(key: string): FieldState {
    return gameState.npcFields[key] ?? newField(absoluteMinute(gameState.time));
  }

  /** The paddy covering this tile, if any (it belongs to a village household: hands off). */
  paddyAt(tx: number, ty: number): Paddy | undefined {
    return this.works.find((w) => inRect(w.paddy, tx, ty))?.paddy;
  }

  /** Runs every paddy up to now (host / alone only; guests get the host's), then redraws the near ones. */
  update(view: Phaser.Geom.Rectangle): void {
    const now = absoluteMinute(gameState.time);
    if (net.role !== 'guest') {
      const next = { ...gameState.npcFields };
      let changed = false;
      for (const w of this.works) {
        const f = gameState.npcFields[w.paddy.key] ?? newField(now);
        if (f.simMinute >= now && gameState.npcFields[w.paddy.key]) continue;
        next[w.paddy.key] = simulate(f, w, now, DAY_LENGTH_MINUTES, DAY_START);
        changed = true;
      }
      if (changed) gameState.npcFields = next;
    }
    const today = Math.floor(now / DAY_LENGTH_MINUTES);
    const cx = view.centerX / TILE;
    const cy = view.centerY / TILE;
    for (const w of this.works) {
      const p = w.paddy;
      const near = Math.max(Math.abs((p.x0 + p.x1) / 2 - cx) - (p.x1 - p.x0) / 2, Math.abs((p.y0 + p.y1) / 2 - cy) - (p.y1 - p.y0) / 2) < DRAW_TILES;
      if (near) this.draw(w, this.state(p.key), today);
    }
  }

  destroy(): void {
    this.sheafImages.forEach((list) => list.forEach((i) => i.destroy()));
  }

  /**
   * Redraws a paddy as it changes. The job is done one tile at a time (each
   * worker along their strip, see NpcFarmSystem.strips), so usually only the
   * few tiles finished since last time are redrawn.
   */
  private draw(w: PaddyWork, f: FieldState, today: number): void {
    const p = w.paddy;
    const job = currentJob(f, today);
    const front = jobFront(f, today);
    const water = f.wateredDay === today ? 1 : f.waterProgress;
    const base = `${f.stage}|${job}|${f.grownDays}|${f.harvests > 0}`;
    const parts = strips(p, w.workers);
    const counts = parts.map((s) => [tilesDone(front, s), tilesDone(water, s)] as const);
    const before = this.drawn.get(p.key);
    this.drawn.set(p.key, { base, counts });
    parts.forEach((strip, i) => {
      const [done, wet] = counts[i];
      let from = 0;
      let to = strip.size;
      if (before && before.base === base) {
        const [d0, w0] = before.counts[i];
        if (d0 === done && w0 === wet) return;
        from = Math.min(d0, done, w0, wet);
        to = Math.max(d0, done, w0, wet);
      }
      for (let k = from; k < to; k++) {
        const t = stripTile(p, strip, k);
        if (this.ground.getTileAt(t.x, t.y)?.index === TILE_GID.WATER) continue; // a stream through it
        const [g, d, tint] = this.tileLook(f, job, k < done, k < wet);
        this.look.put(g, t.x, t.y);
        if (d) this.decor.putTileAt(d, t.x, t.y).tint = tint;
        else if (this.decor.getTileAt(t.x, t.y)) this.decor.removeTileAt(t.x, t.y);
      }
    });
    if (this.sheafImages.get(p.key)?.length !== f.sheaves) this.drawSheaves(w, f);
  }

  /** Ground, crop and tint of one tile of the paddy. */
  private tileLook(f: FieldState, job: string | null, done: boolean, watered: boolean): [number, number | null, number] {
    const fallow: [number, number | null, number] = f.harvests > 0 ? [TILE_GID.DIRT, TILE_GID.STUBBLE, 0xffffff] : [TILE_GID.GRASS3, null, 0xffffff];
    switch (f.stage) {
      case 'fallow':
        return job === 'hoe' && done ? [TILE_GID.SOIL, null, 0xffffff] : fallow;
      case 'tilled':
        return done ? [TILE_GID.SOIL, TILE_GID.RICE, SEEDLING] : [TILE_GID.SOIL, null, 0xffffff];
      case 'growing': {
        const tint = f.grownDays < 3 ? SEEDLING : f.grownDays < 6 ? YOUNG : 0xb8d060;
        return [watered ? TILE_GID.PADDY : TILE_GID.SOIL, TILE_GID.RICE, tint];
      }
      case 'ripe':
        return job === 'harvest' && done ? [TILE_GID.DIRT, TILE_GID.STUBBLE, 0xffffff] : [TILE_GID.DIRT, TILE_GID.RICE, 0xffffff];
      case 'cut':
        return [TILE_GID.DIRT, TILE_GID.STUBBLE, 0xffffff];
    }
  }

  /** Sheaves of rice stacked on the roadside by the bridge, waiting to be carried home. */
  private drawSheaves(w: PaddyWork, f: FieldState): void {
    const list = this.sheafImages.get(w.paddy.key) ?? [];
    while (list.length > f.sheaves) list.pop()?.destroy();
    while (list.length < f.sheaves) {
      const i = list.length;
      const x = (w.paddy.bridgeX + (i % 4) - 1.5) * TILE + TILE / 2;
      const y = (w.paddy.roadY + (w.paddy.side === 'north' ? -1 : 1)) * TILE + TILE - 2 - Math.floor(i / 4) * 3;
      list.push(this.scene.add.image(x, y, 'prop_haystack').setOrigin(0.5, 1).setScale(hdScale(this.scene, 'prop_haystack') * 0.38).setDepth(y));
    }
    this.sheafImages.set(w.paddy.key, list);
  }
}
