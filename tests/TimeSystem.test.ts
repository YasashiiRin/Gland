import { describe, expect, it } from 'vitest';
import { DAY_LENGTH_MINUTES } from '../src/config/time';
import {
  advanceTime,
  clockLabel,
  createInitialTime,
  darknessAlpha,
  rollWeather,
  startNewDay,
} from '../src/systems/TimeSystem';

describe('advanceTime', () => {
  it('starts at 06:00', () => {
    expect(clockLabel(createInitialTime())).toBe('06:00');
  });

  it('advances the clock and wraps past midnight', () => {
    const r = advanceTime(createInitialTime(), 12 * 60 + 30); // 6:00 + 12:30 -> 18:30
    expect(clockLabel(r.state)).toBe('18:30');
    expect(r.dawn).toBe(false);
  });

  it('stops at the next dawn and reports it exactly once', () => {
    const r1 = advanceTime({ ...createInitialTime(), elapsedMinutes: DAY_LENGTH_MINUTES - 5 }, 10);
    expect(r1.state.elapsedMinutes).toBe(DAY_LENGTH_MINUTES);
    expect(r1.dawn).toBe(true);

    const r2 = advanceTime(r1.state, 10);
    expect(r2.state.elapsedMinutes).toBe(DAY_LENGTH_MINUTES);
    expect(r2.dawn).toBe(false);
  });
});

describe('startNewDay', () => {
  it('increments the day and resets the clock', () => {
    const next = startNewDay(createInitialTime(), () => 0.9);
    expect(next.day).toBe(2);
    expect(next.season).toBe('spring');
    expect(next.elapsedMinutes).toBe(0);
  });

  it('rolls over to the next season after 28 days', () => {
    const state = { elapsedMinutes: 0, day: 28, season: 'spring' as const, year: 1, weather: 'sunny' as const };
    const next = startNewDay(state, () => 0.9);
    expect(next.day).toBe(1);
    expect(next.season).toBe('summer');
    expect(next.year).toBe(1);
  });

  it('rolls over to a new year after winter', () => {
    const state = { elapsedMinutes: 0, day: 28, season: 'winter' as const, year: 1, weather: 'sunny' as const };
    const next = startNewDay(state, () => 0.9);
    expect(next.season).toBe('spring');
    expect(next.year).toBe(2);
  });

  it('rolls weather using the injected random source', () => {
    expect(rollWeather('summer', () => 0)).toBe('rainy');
    expect(rollWeather('summer', () => 0.99)).toBe('sunny');
  });
});

describe('darknessAlpha', () => {
  it('is fully bright at noon and fully dark at midnight', () => {
    expect(darknessAlpha({ ...createInitialTime(), elapsedMinutes: 6 * 60 })).toBe(0); // 12:00
    expect(darknessAlpha({ ...createInitialTime(), elapsedMinutes: 18 * 60 })).toBeGreaterThan(0); // 0:00
  });

  it('ramps smoothly through dusk', () => {
    const early = darknessAlpha({ ...createInitialTime(), elapsedMinutes: 12 * 60 }); // 18:00
    const late = darknessAlpha({ ...createInitialTime(), elapsedMinutes: 13 * 60 }); // 19:00
    expect(late).toBeGreaterThan(early);
  });
});
