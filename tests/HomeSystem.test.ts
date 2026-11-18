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
