import { describe, expect, it } from 'vitest';
import { NPC_CONFIG as cfg } from '../src/systems/npc/config';
import { checkHarvestDone, checkHaulDone, completeTask, newFieldDay, newFieldGrid, pickCrop, pickTask, pileSize, rainOn, reserve } from '../src/systems/npc/field';
import type { FieldGrid } from '../src/systems/npc/types';

const grid = (cols = 4, rows = 2): FieldGrid => newFieldGrid(cols, rows, 1234, cfg);

function doTask(g: FieldGrid, cell: number, kind: Parameters<typeof completeTask>[2], day = 1, raining = false): FieldGrid {
  return completeTask(g, cell, kind, day, raining, cfg);
}

function sowAll(g: FieldGrid): FieldGrid {
  for (let i = 0; i < g.cells.length; i++) g = doTask(doTask(g, i, 'hoe'), i, 'sow');
  return g;
}

describe('NPC field cells', () => {
  it('goes UNTILLED -> TILLED -> SEEDED -> GROWING -> MATURE -> TILLED', () => {
    let g = grid(1, 1);
    g = doTask(g, 0, 'hoe');
    expect(g.cells[0].state).toBe('TILLED');
    g = doTask(g, 0, 'sow');
    expect(g.cells[0].state).toBe('SEEDED');
    expect(g.cells[0].cropType).toBe(g.cropType);
    const days = cfg.crops.find((c) => c.id === g.cropType)!.growDays;
    for (let d = 1; d <= days; d++) {
      g = doTask(g, 0, 'water', d);
      g = newFieldDay(g, d + 1, 1234, cfg);
    }
    expect(g.cells[0].state).toBe('MATURE');
    g = doTask(g, 0, 'harvest');
    expect(g.cells[0].state).toBe('TILLED');
    expect(g.harvestedThisSeason).toBe(1);
  });

  it('grows only on watered days, dies after a missed day once watered', () => {
    let g = sowAll(grid(1, 1));
    g = newFieldDay(g, 2, 1, cfg); // never watered yet: just waits
    expect(g.cells[0].state).toBe('SEEDED');
    g = doTask(g, 0, 'water', 2);
    g = newFieldDay(g, 3, 1, cfg);
    expect(g.cells[0]).toMatchObject({ state: 'GROWING', growthDay: 1, wateredToday: false });
    g = newFieldDay(g, 4, 1, cfg); // missed day 3
    expect(g.cells[0].state).toBe('DEAD');
  });

  it('rain waters every planted cell', () => {
    let g = rainOn(sowAll(grid()));
    expect(g.cells.every((c) => c.wateredToday)).toBe(true);
    g = newFieldDay(g, 2, 1, cfg);
    expect(g.cells.every((c) => c.growthDay === 1)).toBe(true);
  });

  it('picks jobs by priority: harvest, water, fertilise, sow, hoe', () => {
    let g = grid(2, 1);
    expect(pickTask(g, null, 1, cfg)?.kind).toBe('hoe');
    g = doTask(g, 0, 'hoe');
    expect(pickTask(g, null, 1, cfg)).toEqual({ cell: 0, kind: 'sow' });
    g = doTask(g, 0, 'sow');
    expect(pickTask(g, null, 1, cfg)).toEqual({ cell: 0, kind: 'water' });
    g = doTask(g, 0, 'water');
    expect(pickTask(g, null, 1, cfg)).toEqual({ cell: 0, kind: 'fertilize' });
    g = doTask(g, 0, 'fertilize');
    expect(pickTask(g, null, 1, cfg)).toEqual({ cell: 1, kind: 'hoe' });
    // fertilised again 7 days later
    expect(pickTask(g, null, cfg.field.fertilizeEveryDays, cfg)?.kind).toBe('hoe');
    expect(pickTask(g, null, 1 + cfg.field.fertilizeEveryDays, cfg)).toEqual({ cell: 0, kind: 'fertilize' });
  });

  it('husband takes the left half, wife the right, and they help once their half is done', () => {
    let g = grid(4, 1);
    expect(pickTask(g, 0, 1, cfg)?.cell).toBeLessThan(2);
    expect(pickTask(g, 1, 1, cfg)?.cell).toBeGreaterThanOrEqual(2);
    g = doTask(doTask(g, 0, 'hoe'), 1, 'hoe');
    g = { ...g, phase: 'hauling' }; // sowing closed: the left half has nothing left
    expect(pickTask(g, 0, 1, cfg)?.cell).toBeGreaterThanOrEqual(2);
  });

  it('a reserved cell is not handed to a second worker', () => {
    let g = grid(1, 2);
    const first = pickTask(g, null, 1, cfg)!;
    g = reserve(g, first.cell, 'a');
    expect(pickTask(g, null, 1, cfg)?.cell).not.toBe(first.cell);
  });

  it('makes a pile per 20% harvested, then hauls, then a new different crop the next day', () => {
    let g = grid(5, 2); // 10 cells: a pile every 2
    expect(pileSize(g, cfg)).toBe(2);
    g = sowAll(g);
    g = { ...g, cells: g.cells.map((c) => ({ ...c, state: 'MATURE' as const })) };
    for (let i = 0; i < 9; i++) g = doTask(g, i, 'harvest');
    expect(g.piles).toBe(4);
    expect(checkHarvestDone(g).phase).toBe('growing'); // one cell still out
    g = checkHarvestDone(doTask(g, 9, 'harvest'));
    expect(g.phase).toBe('hauling');
    expect(g.piles).toBe(5);
    g = checkHaulDone({ ...g, piles: 0 }, 3, false);
    expect(g).toMatchObject({ phase: 'done', restDay: 3 });
    const crop = g.cropType;
    g = newFieldDay(g, 4, 1234, cfg);
    expect(g.phase).toBe('growing');
    expect(g.cropType).not.toBe(crop);
    expect(g.previousCrop).toBe(crop);
  });

  it('the crop draw is repeatable and never repeats the last crop', () => {
    for (let s = 0; s < 30; s++) {
      expect(pickCrop(99, s, 'rice', cfg)).not.toBe('rice');
      expect(pickCrop(99, s, 'rice', cfg)).toBe(pickCrop(99, s, 'rice', cfg));
    }
  });
});
