import { describe, expect, it } from 'vitest';
import { currentJob, GROW_DAYS, newDay, newField, simulate, strips, stripTile, tilesDone, work } from '../src/systems/NpcFarmSystem';

const DAY = 1200; // game day (6:00 → 2:00) in minutes
const START = 6 * 60;

describe('village paddies', () => {
  it('goes round the whole cycle in order', () => {
    let f = newField(0);
    expect(currentJob(f, 0)).toBe('hoe');
    f = work(f, 1e6, 100, 30, 0);
    expect(f.stage).toBe('tilled');
    expect(currentJob(f, 0)).toBe('sow');
    f = work(f, 1e6, 100, 30, 0);
    expect(f.stage).toBe('growing');
    expect(currentJob(f, 0)).toBe('water');
    f = work(f, 1e6, 100, 30, 0);
    expect(currentJob(f, 0)).toBeNull(); // watered, too young to fertilise
    for (let d = 1; d <= GROW_DAYS; d++) {
      f = newDay(f, d);
      if (d === 2) {
        f = work(f, 1e6, 100, 30, d); // water
        expect(currentJob(f, d)).toBe('fertilize');
      }
      while (currentJob(f, d) === 'water' || currentJob(f, d) === 'fertilize') f = work(f, 1e6, 100, 30, d);
    }
    expect(f.stage).toBe('ripe');
    f = work(f, 1e6, 100, 30, 9);
    expect(f.stage).toBe('cut');
    expect(currentJob(f, 9)).toBe('haul');
    f = work(f, 1e6, 100, 30, 9);
    expect(f.stage).toBe('fallow');
    expect(f.harvests).toBe(1);
  });

  it('does not grow on a day it was not watered', () => {
    const f = { ...newField(0), stage: 'growing' as const, wateredDay: 3, grownDays: 4 };
    expect(newDay(f, 4).grownDays).toBe(5);
    expect(newDay(f, 6).grownDays).toBe(4);
  });

  it('is worked only in the work spells, faster with more hands', () => {
    const tiles = 2048; // a full paddy: hoeing it is 1024 person-minutes
    const one = simulate(newField(0), { workers: 1, tiles, tripMinutes: 60 }, DAY - 1, DAY, START);
    const two = simulate(newField(0), { workers: 2, tiles, tripMinutes: 60 }, DAY - 1, DAY, START);
    expect(one.stage).toBe('fallow');
    expect(one.progress).toBeCloseTo(570 / 1024, 2); // 9.5 hours of spells
    expect(two.stage).toBe('tilled');
  });

  it('a household keeps its paddy going for weeks on end', () => {
    const f = simulate(newField(0), { workers: 2, tiles: 2048, tripMinutes: 60 }, DAY * 40, DAY, START);
    expect(f.harvests).toBeGreaterThanOrEqual(2);
  });

  it('is worked one tile at a time, like the player: rows from the road, back and forth', () => {
    const pad = { x0: 10, x1: 13, y0: 0, y1: 2, side: 'north' as const }; // 4 x 3, road below
    const [left, right] = strips(pad, 2);
    expect(left).toEqual({ a: 10, b: 11, size: 6 });
    expect(right).toEqual({ a: 12, b: 13, size: 6 });
    const order = Array.from({ length: 6 }, (_, k) => stripTile(pad, left, k)).map((t) => [t.x, t.y]);
    expect(order).toEqual([[10, 2], [11, 2], [11, 1], [10, 1], [10, 0], [11, 0]]);
    expect(strips(pad, 1)).toEqual([{ a: 10, b: 13, size: 12 }]);
    expect(tilesDone(0, left)).toBe(0);
    expect(tilesDone(0.5, left)).toBe(3); // 3 single tiles done, not a whole row at once
    expect(tilesDone(1, left)).toBe(6);
  });
});

