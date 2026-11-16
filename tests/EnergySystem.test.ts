import { describe, expect, it } from 'vitest';
import {
  consume,
  createInitialEnergy,
  DEFAULT_MAX_ENERGY,
  isExhausted,
  restore,
  restoreFull,
  restoreHalf,
} from '../src/systems/EnergySystem';

describe('EnergySystem', () => {
  it('starts full', () => {
    const e = createInitialEnergy();
    expect(e.current).toBe(DEFAULT_MAX_ENERGY);
    expect(isExhausted(e)).toBe(false);
  });

  it('never drops below zero', () => {
    const e = consume(createInitialEnergy(), DEFAULT_MAX_ENERGY + 50);
    expect(e.current).toBe(0);
    expect(isExhausted(e)).toBe(true);
  });

  it('never exceeds max when restoring', () => {
    const e = restore(createInitialEnergy(), 999);
    expect(e.current).toBe(DEFAULT_MAX_ENERGY);
  });

  it('restoreFull sets current back to max', () => {
    const e = restoreFull(consume(createInitialEnergy(), 100));
    expect(e.current).toBe(DEFAULT_MAX_ENERGY);
  });

  it('restoreHalf gives at least half, but never reduces current energy', () => {
    const depleted = consume(createInitialEnergy(), DEFAULT_MAX_ENERGY);
    expect(restoreHalf(depleted).current).toBe(Math.floor(DEFAULT_MAX_ENERGY / 2));

    const high = consume(createInitialEnergy(), 5); // still above half
    expect(restoreHalf(high).current).toBe(high.current);
  });
});

import { restoreBySleep } from '../src/systems/EnergySystem';
describe('restoreBySleep', () => {
  it('restores 12.5% per hour and caps at full', () => {
    expect(restoreBySleep({ current: 0, max: 200 }, 1).current).toBe(25);
    expect(restoreBySleep({ current: 0, max: 200 }, 4).current).toBe(100);
    expect(restoreBySleep({ current: 50, max: 200 }, 12).current).toBe(200);
  });
});
