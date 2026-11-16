import { describe, expect, it } from 'vitest';
import { activeBuffs, addBuff, MIN_SPEED_MULTIPLIER, speedMultiplier } from '../src/systems/StatsSystem';

describe('StatsSystem', () => {
  it('adds speed bonuses from every source', () => {
    expect(speedMultiplier([])).toBe(1);
    expect(speedMultiplier([{ speed: 0.3 }, undefined, { speed: 0.2 }])).toBeCloseTo(1.5);
    expect(speedMultiplier([{ speed: -0.05 }])).toBeCloseTo(0.95);
  });

  it('never drops below the minimum speed', () => {
    expect(speedMultiplier([{ speed: -5 }])).toBe(MIN_SPEED_MULTIPLIER);
  });

  it('expires buffs and refreshes the same item instead of stacking', () => {
    let buffs = addBuff([], 'coffee', { speed: 0.3 }, 120, 1000);
    buffs = addBuff(buffs, 'coffee', { speed: 0.3 }, 120, 1060);
    expect(buffs).toHaveLength(1);
    expect(buffs[0].untilMinute).toBe(1180);
    buffs = addBuff(buffs, 'bread', { speed: 0.1 }, 60, 1060);
    expect(activeBuffs(buffs, 1150).map((b) => b.itemId)).toEqual(['coffee']);
    expect(activeBuffs(buffs, 1200)).toEqual([]);
  });
});
