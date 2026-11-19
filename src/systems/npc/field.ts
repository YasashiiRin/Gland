import { seededRandom } from './clock';
import type { NpcConfig, TaskKind } from './config';
import type { FieldCell, FieldGrid } from './types';

/**
 * A family's field as a grid of cells, each with its own state machine
 * (pure, no Phaser):
 *
 *   UNTILLED -hoe-> TILLED -sow-> SEEDED/GROWING -(grows on watered days)-> MATURE
 *   -harvest-> TILLED;  a planted cell that misses its water -> DEAD (sown again like TILLED).
 *
 * The whole field grows one crop a season. Every `pileFraction` of the field
 * harvested makes a pile by the road; once all is harvested the piles are
 * carried home, and the day after the last one a new crop (never the same as
 * the last) is drawn from the family's seed.
 */
/** lastFertilizedDay of a cell never fertilised (JSON has no -Infinity). */
export const NEVER = -100000;

export const TASK_PRIORITY: readonly TaskKind[] = ['harvest', 'water', 'fertilize', 'sow', 'hoe'];

function newCell(): FieldCell {
  return { state: 'UNTILLED', cropType: null, growthDay: 0, wateredToday: false, missedWaterDays: 0, everWatered: false, lastFertilizedDay: NEVER, reservedBy: null };
}

/** The crop of season `seasonIndex`: random from the seed, never the previous one. */
export function pickCrop(seed: number, seasonIndex: number, previous: string | null, cfg: NpcConfig): string {
  const pool = cfg.crops.filter((c) => c.id !== previous);
  return pool[Math.floor(seededRandom(seed, seasonIndex, 7) * pool.length)].id;
}

export function cropDays(id: string, cfg: NpcConfig): number {
  return cfg.crops.find((c) => c.id === id)?.growDays ?? 4;
}

export function newFieldGrid(cols: number, rows: number, seed: number, cfg: NpcConfig): FieldGrid {
  return {
    cols,
    rows,
    cells: Array.from({ length: cols * rows }, newCell),
    cropType: pickCrop(seed, 0, null, cfg),
    previousCrop: null,
    seasonIndex: 0,
    phase: 'growing',
    harvestedThisSeason: 0,
    looseHarvest: 0,
    piles: 0,
    restDay: -1,
  };
}

/** 0: the left half (the husband's), 1: the right half (the wife's). */
export function halfOf(grid: FieldGrid, cell: number): 0 | 1 {
  return cell % grid.cols < Math.ceil(grid.cols / 2) ? 0 : 1;
}

export function pileSize(grid: FieldGrid, cfg: NpcConfig): number {
  return Math.max(1, Math.round(grid.cells.length * cfg.field.pileFraction));
}

const planted = (c: FieldCell) => c.state === 'SEEDED' || c.state === 'GROWING';

/** Sowing is open until the first harvest of the season. */
function sowingOpen(grid: FieldGrid): boolean {
  return grid.phase === 'growing' && grid.harvestedThisSeason === 0;
}

/** What this cell needs today, if anything. */
export function cellNeeds(grid: FieldGrid, i: number, day: number, cfg: NpcConfig): TaskKind | null {
  const c = grid.cells[i];
  if (c.state === 'MATURE') return 'harvest';
  if (planted(c)) {
    if (!c.wateredToday) return 'water';
    if (day - c.lastFertilizedDay >= cfg.field.fertilizeEveryDays) return 'fertilize';
    return null;
  }
  if (c.state === 'TILLED' || c.state === 'DEAD') return sowingOpen(grid) ? 'sow' : null;
  return 'hoe';
}

const RANK: Record<TaskKind, number> = { harvest: 0, water: 1, fertilize: 2, sow: 3, hoe: 4 };

/**
 * The next job for a worker: the most urgent free cell of their own half
 * (null: the whole field), else of the other half. Cells are taken in working
 * order, row by row from the road, back and forth. Null: nothing to do.
 */
export function pickTask(grid: FieldGrid, half: 0 | 1 | null, day: number, cfg: NpcConfig): { cell: number; kind: TaskKind } | null {
  let own = -1;
  let ownRank = 99;
  let other = -1;
  let otherRank = 99;
  const split = Math.ceil(grid.cols / 2);
  for (let r = 0; r < grid.rows; r++) {
    for (let k = 0; k < grid.cols; k++) {
      const col = r % 2 === 0 ? k : grid.cols - 1 - k;
      const i = r * grid.cols + col;
      if (grid.cells[i].reservedBy) continue;
      const need = cellNeeds(grid, i, day, cfg);
      if (!need) continue;
      const rank = RANK[need];
      if (half === null || (col < split ? 0 : 1) === half) {
        if (rank < ownRank) [own, ownRank] = [i, rank];
      } else if (rank < otherRank) [other, otherRank] = [i, rank];
      if (ownRank === 0) return { cell: own, kind: 'harvest' };
    }
  }
  if (own >= 0) return { cell: own, kind: TASK_PRIORITY[ownRank] };
  return other >= 0 ? { cell: other, kind: TASK_PRIORITY[otherRank] } : null;
}

function setCell(grid: FieldGrid, i: number, patch: Partial<FieldCell>): FieldGrid {
  const cells = grid.cells.slice();
  cells[i] = { ...cells[i], ...patch };
  return { ...grid, cells };
}

export function reserve(grid: FieldGrid, cell: number, by: string | null): FieldGrid {
  return setCell(grid, cell, { reservedBy: by });
}

/** A finished job: the cell moves on (and is free again). */
export function completeTask(grid: FieldGrid, cell: number, kind: TaskKind, day: number, raining: boolean, cfg: NpcConfig): FieldGrid {
  const c = grid.cells[cell];
  const free = { reservedBy: null };
  switch (kind) {
    case 'hoe':
      return setCell(grid, cell, c.state === 'UNTILLED' ? { ...free, state: 'TILLED' } : free);
    case 'sow':
      if (c.state !== 'TILLED' && c.state !== 'DEAD') return setCell(grid, cell, free);
      return setCell(grid, cell, {
        ...free,
        state: 'SEEDED',
        cropType: grid.cropType,
        growthDay: 0,
        wateredToday: raining,
        everWatered: raining,
        missedWaterDays: 0,
        lastFertilizedDay: NEVER,
      });
    case 'water':
      return setCell(grid, cell, planted(c) ? { ...free, wateredToday: true, everWatered: true } : free);
    case 'fertilize':
      return setCell(grid, cell, planted(c) ? { ...free, lastFertilizedDay: day } : free);
    case 'harvest': {
      if (c.state !== 'MATURE') return setCell(grid, cell, free);
      const next = setCell(grid, cell, { ...free, state: 'TILLED', cropType: null, growthDay: 0, wateredToday: false, everWatered: false });
      const size = pileSize(grid, cfg);
      const loose = next.looseHarvest + 1;
      return { ...next, harvestedThisSeason: next.harvestedThisSeason + 1, looseHarvest: loose % size, piles: next.piles + Math.floor(loose / size) };
    }
  }
}

/** Rain waters every planted cell. */
export function rainOn(grid: FieldGrid): FieldGrid {
  if (!grid.cells.some((c) => planted(c) && !c.wateredToday)) return grid;
  return { ...grid, cells: grid.cells.map((c) => (planted(c) ? { ...c, wateredToday: true, everWatered: true } : c)) };
}

/** All harvested: heap the rest into a last pile and start carrying them home. */
export function checkHarvestDone(grid: FieldGrid): FieldGrid {
  if (grid.phase !== 'growing' || grid.harvestedThisSeason === 0) return grid;
  if (grid.cells.some((c) => planted(c) || c.state === 'MATURE')) return grid;
  return { ...grid, phase: 'hauling', piles: grid.piles + (grid.looseHarvest > 0 ? 1 : 0), looseHarvest: 0 };
}

/** The last pile is home: no more field work today. */
export function checkHaulDone(grid: FieldGrid, day: number, anyoneCarrying: boolean): FieldGrid {
  if (grid.phase !== 'hauling' || grid.piles > 0 || anyoneCarrying) return grid;
  return { ...grid, phase: 'done', restDay: day };
}

/** Field work is over for today (the harvest has all been carried home). */
export function restingToday(grid: FieldGrid | null, day: number): boolean {
  return !!grid && grid.phase === 'done' && grid.restDay === day;
}

/**
 * 0:00: cells watered yesterday grow a day (and ripen); a cell that was
 * watered before but missed yesterday dies. After a finished harvest the new
 * season's crop is drawn.
 */
export function newFieldDay(grid: FieldGrid, day: number, seed: number, cfg: NpcConfig): FieldGrid {
  const cells = grid.cells.map((c): FieldCell => {
    if (!planted(c)) return c.wateredToday ? { ...c, wateredToday: false } : c;
    if (c.wateredToday) {
      const growthDay = c.growthDay + 1;
      const ripe = growthDay >= cropDays(c.cropType ?? grid.cropType, cfg);
      return { ...c, growthDay, wateredToday: false, missedWaterDays: 0, state: ripe ? 'MATURE' : 'GROWING' };
    }
    const missed = c.missedWaterDays + 1;
    if (c.everWatered && missed >= cfg.field.deathAfterMissedDays) return { ...c, state: 'DEAD', missedWaterDays: missed, reservedBy: null };
    return { ...c, missedWaterDays: missed };
  });
  let next: FieldGrid = { ...grid, cells };
  if (grid.phase === 'done' && grid.restDay < day) {
    const seasonIndex = grid.seasonIndex + 1;
    const cropType = pickCrop(seed, seasonIndex, grid.cropType, cfg);
    next = { ...next, phase: 'growing', cropType, previousCrop: grid.cropType, seasonIndex, harvestedThisSeason: 0, looseHarvest: 0, piles: 0 };
  }
  return next;
}
