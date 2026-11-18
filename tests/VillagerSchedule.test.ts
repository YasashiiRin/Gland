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
