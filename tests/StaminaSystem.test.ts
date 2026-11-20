import { describe, expect, it } from 'vitest';
import {
  createInitialRecovery,
  dailyRecovery,
  energyPerMetre,
  foodRecovery,
  pixelsToMetres,
  pump,
  regenOverTime,
  tickRest,
  travel,
} from '../src/systems/StaminaSystem';

const full = { current: 270, max: 270 };
const empty = { current: 0, max: 270 };

describe('StaminaSystem', () => {
  it('a full bar walks 7 km or cycles 20 km', () => {
    expect(energyPerMetre(270, 'walk')).toBeCloseTo(270 / 7000);
    expect(energyPerMetre(270, 'bicycle')).toBeCloseTo(270 / 20000);
    expect(travel(full, 7000, 'walk').current).toBeCloseTo(0);
    expect(travel(full, 3500, 'walk').current).toBeCloseTo(135);
    expect(travel(full, 10000, 'bicycle').current).toBeCloseTo(135);
    expect(travel({ current: 1, max: 270 }, 1000, 'walk').current).toBe(0);
  });

  it('converts pixels to metres (1.1875 tiles per metre)', () => {
    expect(pixelsToMetres(16 * 1.1875, 16)).toBeCloseTo(1);
  });

  it('regenerates 1.5% an hour, but not from empty', () => {
    expect(regenOverTime({ current: 100, max: 270 }, 60).current).toBeCloseTo(104.05);
    expect(regenOverTime({ current: 100, max: 270 }, 10).current).toBeCloseTo(100.675);
    expect(regenOverTime(empty, 600).current).toBe(0);
    expect(regenOverTime({ current: 269.9, max: 270 }, 60).current).toBe(270);
  });

  it('fills the recovery bar daily (30%) and from food (50% of its energy)', () => {
    const r = createInitialRecovery(270);
    expect(r).toEqual({ current: 81, max: 270 });
    expect(dailyRecovery(r).current).toBeCloseTo(162);
    expect(dailyRecovery(r, 5).current).toBe(270);
    expect(foodRecovery(r, 10).current).toBe(86);
  });

  it('counts the rest only at 0 energy and pumps when a 30 s+ rest ends', () => {
    let rest = { seconds: 0 };
    for (let i = 0; i < 29; i++) rest = tickRest(rest, empty, false, 1).rest;
    expect(tickRest(rest, empty, true, 1).pumpSeconds).toBe(0); // only 29 s
    rest = { seconds: 50 };
    expect(tickRest(rest, empty, true, 0.016)).toEqual({ rest: { seconds: 0 }, pumpSeconds: 50 });
    expect(tickRest(rest, { current: 5, max: 270 }, false, 1)).toEqual({ rest: { seconds: 0 }, pumpSeconds: 0 });
  });

  it('pumps n% of the recovery bar with a 20% bonus', () => {
    const r = pump(empty, full, 50); // 135 taken -> +162
    expect(r.recovery.current).toBeCloseTo(135);
    expect(r.energy.current).toBeCloseTo(162);
    const capped = pump(empty, full, 300); // at most 100 s; never more than energy has room for
    expect(capped.energy.current).toBeCloseTo(270);
    expect(capped.recovery.current).toBeCloseTo(270 - 270 / 1.2);
  });

  it('moves what is left without bonus when the bar is short', () => {
    const r = pump(empty, { current: 40, max: 270 }, 30); // wants 81, has 40
    expect(r.energy.current).toBe(40);
    expect(r.recovery.current).toBe(0);
    expect(pump(empty, { current: 0, max: 270 }, 30).gained).toBe(0);
  });
});
