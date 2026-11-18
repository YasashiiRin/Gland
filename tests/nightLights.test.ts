import { describe, expect, it } from 'vitest';
import { lampSpotsFor, lampsLit, lampStrength } from '../src/state/nightLights';

describe('oil lamps', () => {
  it('are lit from 18:00 to 21:00 only', () => {
    expect(lampsLit(17 * 60 + 59)).toBe(false);
    expect(lampsLit(18 * 60)).toBe(true);
    expect(lampsLit(20 * 60 + 59)).toBe(true);
    expect(lampsLit(21 * 60)).toBe(false);
    expect(lampStrength(19 * 60)).toBe(1);
    expect(lampStrength(18 * 60 + 5)).toBeCloseTo(1 / 3);
    expect(lampStrength(22 * 60)).toBe(0);
  });

  it('places the glow at each building’s windows and door', () => {
    expect(lampSpotsFor('house_a', 100, 200)).toContainEqual({ x: 100, y: 182, r: 12 });
    expect(lampSpotsFor('casuarina', 0, 0)).toEqual([]);
    expect(lampSpotsFor('_comment', 0, 0)).toEqual([]);
  });
});
