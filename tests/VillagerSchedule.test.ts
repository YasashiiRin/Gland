import { describe, expect, it } from 'vitest';
import { householdRoles, isTravel, phaseAt } from '../src/systems/VillagerSchedule';
import { findPath } from '../src/systems/gridPath';

describe('village day', () => {
  it('farmers hoe in three-hour spells with a half-hour rest, home in the afternoon', () => {
    expect(phaseAt('farmer', 5 * 60).activity).toBe('indoors');
    expect(phaseAt('farmer', 5 * 60 + 40).activity).toBe('toField');
    expect(phaseAt('farmer', 8 * 60)).toEqual({ activity: 'work', since: 6 * 60 });
    expect(phaseAt('farmer', 9 * 60 + 10).activity).toBe('rest');
    expect(phaseAt('farmer', 10 * 60).activity).toBe('work');
    expect(phaseAt('farmer', 12 * 60 + 40).activity).toBe('rest');
    expect(phaseAt('farmer', 15 * 60 + 10).activity).toBe('toHome');
    expect(phaseAt('farmer', 17 * 60).activity).toBe('yard');
    expect(phaseAt('farmer', 20 * 60).activity).toBe('indoors');
    expect(isTravel('toHome')).toBe(true);
  });

  it('the child goes to school in the morning', () => {
    expect(phaseAt('child', 8 * 60).activity).toBe('school');
    expect(phaseAt('child', 14 * 60).activity).toBe('yard');
  });

  it('households are one person or a couple with a child', () => {
    expect(householdRoles(3, false)).toEqual(['farmer']);
    expect(householdRoles(4, false)).toEqual(['farmer', 'farmer', 'child']);
    expect(householdRoles(4, true)).toEqual(['shopkeeper']);
  });

  it('finds a way round obstacles', () => {
    const wall = new Set(['1,0', '1,1']);
    const path = findPath({ x: 0, y: 0 }, (x, y) => x >= 0 && y >= 0 && x < 3 && y < 3 && !wall.has(`${x},${y}`), (x, y) => x === 2 && y === 0);
    expect(path?.length).toBe(7);
    expect(findPath({ x: 0, y: 0 }, () => false, () => true)).toBeNull();
  });
});

import { adultDoing } from '../src/systems/VillagerSchedule';

describe('a farming adult’s day', () => {
  const base = { index: 0, hasJob: true, idleFor: null, livestock: false, chickens: false };
  it('works the paddy in spells while it needs work', () => {
    expect(adultDoing({ ...base, clock: 5 * 60 }).doing).toBe('indoors');
    expect(adultDoing({ ...base, clock: 5 * 60 + 40 }).doing).toBe('toField');
    expect(adultDoing({ ...base, clock: 7 * 60 }).doing).toBe('work');
    expect(adultDoing({ ...base, clock: 9 * 60 + 10 }).doing).toBe('restRoad');
    expect(adultDoing({ ...base, clock: 16 * 60 + 10 }).doing).toBe('work'); // until 16:30
    expect(adultDoing({ ...base, clock: 16 * 60 + 40 }).doing).toBe('toHome');
    expect(adultDoing({ ...base, clock: 17 * 60 + 20 }).doing).toBe('tea');
    expect(adultDoing({ ...base, clock: 19 * 60 }).doing).toBe('indoors');
  });

  it('with the work done: rest, then tend the paddy — or mind the buffalo and go to market', () => {
    const idle = { ...base, hasJob: false, clock: 10 * 60 };
    expect(adultDoing({ ...idle, idleFor: 10 }).doing).toBe('restRoad');
    expect(adultDoing({ ...idle, idleFor: 40 }).doing).toBe('tend'); // stays out weeding till 16:00
    expect(adultDoing({ ...idle, idleFor: 90 }).doing).toBe('tend');
    expect(adultDoing({ ...idle, idleFor: 90, clock: 16 * 60 + 40 }).doing).toBe('toHome');
    expect(adultDoing({ ...idle, idleFor: 90, livestock: true }).doing).toBe('herd');
    expect(adultDoing({ ...idle, idleFor: 10, livestock: true, index: 1 }).doing).toBe('toMarket');
    expect(adultDoing({ ...idle, idleFor: 100, livestock: true, index: 1 }).doing).toBe('market');
    expect(adultDoing({ ...idle, idleFor: 300, livestock: true, index: 1 }).doing).toBe('fromMarket');
    expect(adultDoing({ ...idle, idleFor: 400, livestock: true, index: 1 }).doing).toBe('tend'); // back from market: to the paddy
  });

  it('feeds the chickens first thing', () => {
    expect(adultDoing({ ...base, chickens: true, clock: 5 * 60 + 32 }).doing).toBe('feedChickens');
  });
});
