import { describe, expect, it } from 'vitest';
import { restoreBySleep, SLEEP_HOURS_FOR_FULL } from '../src/systems/EnergySystem';
import { SLEEP_HUNGER } from '../src/systems/HungerSystem';

describe('sleeping (no skipping to the next day: rest by the time spent asleep)', () => {
  it('rests a little every minute asleep: a full bar in 8 hours, never more', () => {
    expect(SLEEP_HOURS_FOR_FULL).toBe(8);
    const bar = { current: 0, max: 270 };
    expect(restoreBySleep(bar, 1).current).toBeCloseTo(270 / 8);
    expect(restoreBySleep(bar, 4).current).toBeCloseTo(135);
    expect(restoreBySleep(bar, 20).current).toBe(270);
  });

  it('the stomach empties 60% slower while asleep', () => {
    expect(SLEEP_HUNGER).toBe(0.4);
  });
});
