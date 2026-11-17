import { describe, expect, it } from 'vitest';
import { collectPond, FISH_POND, fishForFry, pruneFishPonds, stockPond, type FishPonds, type PondStock } from '../src/systems/FishPondSystem';

const POND = 'QuangBinh:357,217';
const fry = (owner: string, day: number, season = 0): PondStock => ({ owner, fishId: 'carp', day, season });

describe('FishPondSystem', () => {
  it('stocks fingerlings up to each owner’s share', () => {
    let ponds: FishPonds = {};
    for (let i = 0; i < FISH_POND.maxPerOwner; i++) ponds = stockPond(ponds, POND, fry('An', 1))!;
    expect(stockPond(ponds, POND, fry('An', 1))).toBeNull();
    expect(stockPond(ponds, POND, fry('Bình', 1))).not.toBeNull();
  });

  it('nets only grown fish, and only your own', () => {
    let ponds: FishPonds = {};
    ponds = stockPond(ponds, POND, fry('An', 1))!;
    ponds = stockPond(ponds, POND, fry('An', 3))!;
    ponds = stockPond(ponds, POND, fry('Bình', 1))!;
    const young = collectPond(ponds, POND, 'An', 1 + FISH_POND.growDays - 1);
    expect(young.caught).toEqual({});
    expect(young.daysLeft).toBe(1);
    const got = collectPond(ponds, POND, 'An', 1 + FISH_POND.growDays);
    expect(got.caught).toEqual({ carp: 1 });
    expect(got.growing).toBe(1);
    expect(got.ponds[POND].map((s) => s.owner).sort()).toEqual(['An', 'Bình']);
  });

  it('empties the ponds when the season turns', () => {
    const ponds: FishPonds = { [POND]: [fry('An', 1, 4), fry('An', 20, 5)] };
    expect(pruneFishPonds(ponds, 5)[POND]).toHaveLength(1);
    expect(pruneFishPonds(ponds, 6)).toEqual({});
  });

  it('turns fingerlings into a freshwater fish', () => {
    expect(fishForFry('fish_fry', () => 0)).toBe('carp');
    expect(fishForFry('worm')).toBeNull();
  });
});
