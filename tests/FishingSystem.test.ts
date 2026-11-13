import { describe, expect, it } from 'vitest';
import {
  createFishingState,
  fishingOutcome,
  pickFish,
  stepFishing,
  validFish,
  zoneHeightFor,
  zoneSpeedFor,
} from '../src/systems/FishingSystem';

describe('zone difficulty scaling', () => {
  it('harder fish get a smaller, faster zone', () => {
    expect(zoneHeightFor(70)).toBeLessThan(zoneHeightFor(15));
    expect(zoneSpeedFor(70)).toBeGreaterThan(zoneSpeedFor(15));
  });
});

describe('stepFishing', () => {
  it('holding moves the bar up over time, not holding lets it fall', () => {
    let state = createFishingState(20, () => 0.5);
    const afterHold = stepFishing(state, 0.5, true, 20, () => 0.9);
    expect(afterHold.barY).toBeLessThan(state.barY); // "up" = smaller Y

    state = createFishingState(20, () => 0.5);
    const afterRelease = stepFishing(state, 0.5, false, 20, () => 0.9);
    expect(afterRelease.barY).toBeGreaterThan(state.barY);
  });

  it('keeps the bar within [0, 1-BAR_HEIGHT]', () => {
    let state = createFishingState(20, () => 0.5);
    for (let i = 0; i < 200; i++) state = stepFishing(state, 0.1, true, 20, () => 0.99);
    expect(state.barY).toBeGreaterThanOrEqual(0);
    expect(state.barY).toBeLessThanOrEqual(1 - 0.22 + 1e-9);
  });

  it('progress rises while overlapping and falls while not', () => {
    // Force bar and zone to the same spot: overlap, progress should climb.
    let state = createFishingState(10, () => 0.5);
    state = { ...state, barY: 0.4, zoneY: 0.5 };
    const stepped = stepFishing(state, 0.2, true, 0, () => 0.99); // difficulty 0 keeps zone still-ish
    expect(stepped.progress).toBeGreaterThan(state.progress);
  });

  it('reaches "caught" when progress hits 1 and "escaped" at 0', () => {
    expect(fishingOutcome({ barY: 0, barVelocity: 0, zoneY: 0, zoneVelocity: 0, progress: 1 })).toBe('caught');
    expect(fishingOutcome({ barY: 0, barVelocity: 0, zoneY: 0, zoneVelocity: 0, progress: 0 })).toBe('escaped');
    expect(fishingOutcome({ barY: 0, barVelocity: 0, zoneY: 0, zoneVelocity: 0, progress: 0.5 })).toBe('ongoing');
  });
});

describe('validFish / pickFish', () => {
  it('filters by location, season, hour and weather', () => {
    const springNoon = { mapKey: 'Farm' as const, season: 'spring' as const, hour: 12, weather: 'sunny' as const };
    const options = validFish(springNoon);
    expect(options).toContain('carp');
    expect(options).toContain('perch');
    expect(options).not.toContain('golden_loach'); // Town-only
    expect(options).not.toContain('grass_carp'); // needs rain
  });

  it('rain unlocks the grass carp on the farm', () => {
    const rainyFarm = { mapKey: 'Farm' as const, season: 'summer' as const, hour: 10, weather: 'rainy' as const };
    expect(validFish(rainyFarm)).toContain('grass_carp');
  });

  it('pickFish returns null when nothing matches', () => {
    const midnightWinterFarm = { mapKey: 'Farm' as const, season: 'winter' as const, hour: 2, weather: 'sunny' as const };
    // carp is the only all-season/any-hour fish; at hour 2 (before minHour 6 and the
    // wrap isn't modeled) nothing should be valid except... carp's maxHour is 26 so 2 < 6 fails minHour.
    expect(pickFish(midnightWinterFarm, () => 0)).toBeNull();
  });

  it('pickFish deterministically picks among the valid options via the injected random', () => {
    const ctx = { mapKey: 'Farm' as const, season: 'spring' as const, hour: 12, weather: 'sunny' as const };
    const options = validFish(ctx);
    const picked = pickFish(ctx, () => 0);
    expect(picked).toBe(options[0]);
  });
});
