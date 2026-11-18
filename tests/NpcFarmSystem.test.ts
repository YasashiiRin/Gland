import { describe, expect, it } from 'vitest';
import { currentJob, GROW_DAYS, newDay, newField, simulate, work } from '../src/systems/NpcFarmSystem';

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
    expect(one.progress).toBeCloseTo(540 / 1024, 2); // 9 hours of spells
    expect(two.stage).toBe('tilled');
  });

  it('a household keeps its paddy going for weeks on end', () => {
    const f = simulate(newField(0), { workers: 2, tiles: 2048, tripMinutes: 60 }, DAY * 40, DAY, START);
    expect(f.harvests).toBeGreaterThanOrEqual(2);
  });
});
