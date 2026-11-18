import { describe, expect, it } from 'vitest';
import { claimHome, homeKey, homeOf } from '../src/systems/HomeSystem';

describe('HomeSystem', () => {
  const choices = [
    { key: homeKey('Hue', 'hue1'), rural: false },
    { key: homeKey('Hue', 'hue2'), rural: true },
    { key: homeKey('Hue', 'hue3'), rural: true },
  ];

  it('gives a free village house first, one per player', () => {
    const a = claimHome({}, choices, 'An', () => 0)!;
    expect(a.key).toBe('Hue:hue2');
    expect(homeOf(a.homes, 'An')).toBe('Hue:hue2');
    expect(claimHome(a.homes, choices, 'An')).toBeNull();
    const b = claimHome(a.homes, choices, 'Bình', () => 0)!;
    expect(b.key).toBe('Hue:hue3');
    const c = claimHome(b.homes, choices, 'Chi', () => 0)!;
    expect(c.key).toBe('Hue:hue1'); // only the town house is left
    expect(claimHome(c.homes, choices, 'Dũng')).toBeNull();
  });
});

import { houseOn, moveHome, nextUpgrade, upgradeHouse } from '../src/systems/HomeSystem';

describe('upgrading and moving house', () => {
  it('rebuilds a thatched house step by step, for money', () => {
    expect(nextUpgrade('thatched_house')?.to).toBe('house_c');
    expect(upgradeHouse({}, 100, 'Hue:hue1', 'thatched_house')).toBeNull();
    const a = upgradeHouse({}, 10000, 'Hue:hue1', 'thatched_house')!;
    expect(houseOn(a.houses, 'Hue:hue1', 'thatched_house')).toBe('house_c');
    const b = upgradeHouse(a.houses, a.money, 'Hue:hue1', 'house_c')!;
    expect(b.houses['Hue:hue1']).toBe('house_a');
    expect(b.money).toBe(10000 - 1500 - 4000);
    expect(nextUpgrade('house_a')).toBeUndefined();
  });

  it('moves to a free house only', () => {
    const homes = { 'Hue:hue1': 'An', 'Hue:hue2': 'Bình' };
    expect(moveHome(homes, 'An', 'Hue:hue3')).toEqual({ 'Hue:hue2': 'Bình', 'Hue:hue3': 'An' });
    expect(moveHome(homes, 'An', 'Hue:hue2')).toBeNull();
  });
});
