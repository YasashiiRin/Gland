import type Phaser from 'phaser';
import { TILE } from '../config/constants';
import { TILE_GID } from '../config/tileGids';
import { NPC_CONFIG } from '../systems/npc/config';
import { dayOf } from '../systems/npc/clock';
import { completeTask, cropDays } from '../systems/npc/field';
import type { FamilyState, FieldCell, FieldGrid, PlotRect } from '../systems/npc/types';
import type { GroundLook } from './groundLook';
import { hdScale } from './hd';
import { inRect, type Paddy } from './homesteads';
import type { FamilyGeo, NpcWorld } from './npcWorld';

/** Fields within this many tiles of the camera are redrawn as they change. */
const DRAW_TILES = 60;
const SEEDLING = 0x9ad66e;
const DEAD = 0x8a6a40;
/** Game minutes into a job when the tool comes down (villagerChores.workCell swings as the job starts). */
const STRIKE = 0.35;

/** The map tiles of cell `i` of a family's plot (row 0 lies along the road). */
export function cellRect(p: PlotRect, grid: Pick<FieldGrid, 'cols'>, i: number): { x0: number; x1: number; y0: number; y1: number } {
  const k = NPC_CONFIG.field.cellTiles;
  const c = i % grid.cols;
  const r = Math.floor(i / grid.cols);
  const x0 = p.x0 + c * k;
  const x1 = Math.min(p.x1, x0 + k - 1);
  if (p.side === 'north') return { x0, x1, y0: Math.max(p.y0, p.y1 - (r + 1) * k + 1), y1: p.y1 - r * k };
  return { x0, x1, y0: p.y0 + r * k, y1: Math.min(p.y1, p.y0 + (r + 1) * k - 1) };
}

/** The middle tile of a cell. */
export function cellMiddle(p: PlotRect, grid: Pick<FieldGrid, 'cols'>, i: number): { x: number; y: number } {
  const r = cellRect(p, grid, i);
  return { x: Math.floor((r.x0 + r.x1) / 2), y: Math.floor((r.y0 + r.y1) / 2) };
}

function mix(a: number, b: number, t: number): number {
  const ch = (s: number) => [(a >> s) & 255, (b >> s) & 255];
  return [16, 8, 0].reduce((acc, s) => {
    const [x, y] = ch(s);
    return acc | (Math.round(x + (y - x) * t) << s);
  }, 0);
}

const cropColor = (id: string | null) => parseInt((NPC_CONFIG.crops.find((c) => c.id === id)?.color ?? '#e6c45a').slice(1), 16);

/**
 * Draws the families' fields cell by cell: grass, hoed earth, seedlings
 * greening day by day in the season's crop colour (wet mud once watered),
 * ripe crops, withered ones; the piles of the harvest by the road and in the
 * yard. The village fields are the families': hands off for the player.
 */
export class VillageFields {
  /** Signature each cell was last drawn with, per family. */
  private readonly drawn = new Map<string, string[]>();
  private readonly piles = new Map<string, Phaser.GameObjects.Image[]>();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly look: GroundLook,
    private readonly ground: Phaser.Tilemaps.TilemapLayer,
    private readonly decor: Phaser.Tilemaps.TilemapLayer,
    private readonly paddies: Paddy[],
    private readonly world: NpcWorld,
  ) {}

  /** The paddy covering this tile, if any (it belongs to a village household: hands off). */
  paddyAt(tx: number, ty: number): Paddy | undefined {
    return this.paddies.find((p) => inRect(p, tx, ty));
  }

  update(view: Phaser.Geom.Rectangle): void {
    const cx = view.centerX / TILE;
    const cy = view.centerY / TILE;
    for (const geo of this.world.geos) {
      const fam = this.world.family(geo.home.key);
      const near = (r: { x0: number; x1: number; y0: number; y1: number }) =>
        Math.max(Math.abs((r.x0 + r.x1) / 2 - cx) - (r.x1 - r.x0) / 2, Math.abs((r.y0 + r.y1) / 2 - cy) - (r.y1 - r.y0) / 2) < DRAW_TILES;
      if (!fam || !(near(geo.home) || (geo.paddy && near(geo.paddy)))) {
        this.clearPiles(geo.home.key);
        continue;
      }
      geo.plots.forEach((plot, k) => {
        const grid = fam.fields[k];
        if (grid) this.drawField(`${geo.home.key}#${k}`, plot, this.shown(fam, k, grid));
      });
      this.drawPiles(geo, fam);
    }
  }

  destroy(): void {
    for (const key of this.piles.keys()) this.clearPiles(key);
  }

  /**
   * The field as it looks right now: a job whose stroke has landed already
   * shows its result (the simulation only marks it done when the job ends).
   */
  private shown(fam: FamilyState, plot: number, grid: FieldGrid): FieldGrid {
    const now = this.world.exactMinute();
    let g = grid;
    for (const m of fam.members) {
      const t = m.currentTask;
      if (t && t.plot === plot && m.talkUntil < 0 && now - (t.until - NPC_CONFIG.field.minutes[t.kind]) >= STRIKE) {
        g = completeTask(g, t.cell, t.kind, dayOf(Math.floor(now)), false, NPC_CONFIG);
      }
    }
    return g;
  }

  private drawField(key: string, p: PlotRect, grid: FieldGrid): void {
    const before = this.drawn.get(key) ?? [];
    const now = grid.cells.map((c) => `${c.state}|${c.wateredToday}|${c.growthDay}|${c.cropType}`);
    now.forEach((sig, i) => {
      if (before[i] === sig) return;
      const [g, d, tint] = this.cellLook(grid.cells[i]);
      const r = cellRect(p, grid, i);
      for (let y = r.y0; y <= r.y1; y++) {
        for (let x = r.x0; x <= r.x1; x++) {
          if (this.ground.getTileAt(x, y)?.index === TILE_GID.WATER) continue; // a stream through it
          this.look.put(g, x, y);
          if (d) this.decor.putTileAt(d, x, y).tint = tint;
          else if (this.decor.getTileAt(x, y)) this.decor.removeTileAt(x, y);
        }
      }
    });
    this.drawn.set(key, now);
  }

  /** Ground, plant and tint of a cell. */
  private cellLook(c: FieldCell): [number, number | null, number] {
    switch (c.state) {
      case 'UNTILLED':
        return [TILE_GID.GRASS, null, 0xffffff];
      case 'TILLED':
        return [TILE_GID.SOIL, null, 0xffffff];
      case 'DEAD':
        return [TILE_GID.SOIL, TILE_GID.STUBBLE, DEAD];
      case 'MATURE':
        return [TILE_GID.DIRT, TILE_GID.RICE, cropColor(c.cropType)];
      default: {
        const t = Math.min(1, c.growthDay / Math.max(1, cropDays(c.cropType ?? '', NPC_CONFIG)));
        // Only rice stands in water; other crops just get damp soil.
        const wet = c.wateredToday && c.cropType === 'rice';
        return [wet ? TILE_GID.PADDY : TILE_GID.SOIL, TILE_GID.RICE, mix(SEEDLING, cropColor(c.cropType), t * 0.8)];
      }
    }
  }

  /** Harvest piles: by the road waiting for the trip home, and in the yard (up to 5, three days each). */
  private drawPiles(geo: FamilyGeo, fam: FamilyState): void {
    const want: { x: number; y: number }[] = [];
    const p = geo.paddy;
    const piles = fam.fields.reduce((n, g) => n + g.piles, 0);
    if (p) {
      for (let i = 0; i < piles; i++) {
        want.push({ x: (p.bridgeX + (i % 4) - 1.5) * TILE + TILE / 2, y: (p.roadY + (p.side === 'north' ? -1 : 1)) * TILE + TILE - 2 - Math.floor(i / 4) * 3 });
      }
    }
    fam.yardPiles.forEach((_, i) => want.push({ x: (geo.home.x0 + 3 + i * 1.5) * TILE, y: (geo.home.y0 + 11) * TILE }));
    const list = this.piles.get(geo.home.key) ?? [];
    while (list.length > want.length) list.pop()?.destroy();
    want.forEach((at, i) => {
      list[i] ??= this.scene.add.image(0, 0, 'prop_haystack').setOrigin(0.5, 1).setScale(hdScale(this.scene, 'prop_haystack') * 0.38);
      list[i].setPosition(at.x, at.y).setDepth(at.y);
    });
    this.piles.set(geo.home.key, list);
  }

  private clearPiles(key: string): void {
    this.piles.get(key)?.forEach((i) => i.destroy());
    this.piles.delete(key);
  }
}
