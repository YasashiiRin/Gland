import { describe, expect, it } from 'vitest';
import {
  barHeightFor,
  createFishingState,
  fishingOutcome,
  fishSpeedFor,
  nextFishTarget,
  stepFishing,
} from '../src/systems/FishingSystem';
import { attachBait, biteDelay, MAX_BAIT, pickFish, strikeWindow, validFish } from '../src/systems/FishSpawnSystem';
import { addItem, countItem, createEmptyInventory } from '../src/systems/InventorySystem';

const still = () => 0.99;

describe('fishing minigame', () => {
  it('a better fisher gets a bigger bar; harder fish swim faster', () => {
    expect(barHeightFor(10)).toBeGreaterThan(barHeightFor(0));
    expect(fishSpeedFor(80)).toBeGreaterThan(fishSpeedFor(10));
  });

  it('holding moves the bar up, releasing lets it fall', () => {
    const s = { ...createFishingState(0, () => 0.5), barY: 0.4 };
    expect(stepFishing(s, 0.3, true, 20, 'smooth', still).barY).toBeLessThan(0.4);
    expect(stepFishing(s, 0.3, false, 20, 'smooth', still).barY).toBeGreaterThan(0.4);
  });

  it('keeps the bar on the track and bounces it off the bottom', () => {
    let s = createFishingState(0, () => 0.5);
    for (let i = 0; i < 100; i++) s = stepFishing(s, 0.05, true, 20, 'smooth', still);
    expect(s.barY).toBeGreaterThanOrEqual(0);
    s = { ...s, barY: 1 - s.barHeight - 0.01, barVelocity: 1.2 };
    s = stepFishing(s, 0.05, false, 20, 'smooth', still);
    expect(s.barVelocity).toBeLessThan(0);
  });

  it('progress rises while the bar covers the fish, falls (and loses "perfect") when not', () => {
    const base = createFishingState(0, () => 0.5);
    const on = stepFishing({ ...base, barY: 0.4, fishY: 0.45, fishTarget: 0.45 }, 0.2, false, 0, 'smooth', still);
    expect(on.progress).toBeGreaterThan(base.progress);
    expect(on.perfect).toBe(true);
    const off = stepFishing({ ...base, barY: 0.0, fishY: 0.9, fishTarget: 0.9 }, 0.2, true, 0, 'smooth', still);
    expect(off.progress).toBeLessThan(base.progress);
    expect(off.perfect).toBe(false);
  });

  it('sinkers head for the bottom, floaters for the top', () => {
    expect(nextFishTarget(0.5, 'sinker', 50, () => 0.1)).toBeGreaterThan(0.6);
    expect(nextFishTarget(0.5, 'floater', 50, () => 0.1)).toBeLessThan(0.4);
  });

  it('reports the outcome', () => {
    expect(fishingOutcome({ progress: 1 })).toBe('caught');
    expect(fishingOutcome({ progress: 0 })).toBe('escaped');
    expect(fishingOutcome({ progress: 0.5 })).toBe('ongoing');
  });
});

describe('which fish bites', () => {
  it('filters by location, season, hour, weather and water', () => {
    const ctx = { mapKey: 'Farm' as const, season: 'spring' as const, hour: 12, weather: 'sunny' as const };
    expect(validFish(ctx)).toContain('carp');
    expect(validFish(ctx)).not.toContain('golden_loach');
    expect(validFish({ ...ctx, weather: 'rainy' })).toContain('grass_carp');
    const sea = validFish({ ...ctx, mapKey: 'QuangBinh', water: 'sea' });
    expect(sea).toContain('anchovy');
    expect(sea).not.toContain('carp');
  });

  it('returns null when nothing matches', () => {
    expect(pickFish({ mapKey: 'Farm', season: 'winter', hour: 3, weather: 'sunny' }, () => 0)).toBeNull();
  });
});

describe('bait and timing', () => {
  it('moves worms onto the rod, up to the limit', () => {
    const inv = addItem(createEmptyInventory(), 'worm', 25).state;
    const r = attachBait(inv, 0);
    expect(r.onRod).toBe(MAX_BAIT);
    expect(countItem(r.inventory, 'worm')).toBe(5);
    expect(attachBait(r.inventory, r.onRod).moved).toBe(0);
  });

  it('bites come sooner for a skilled fisher; hard fish give less time to strike', () => {
    expect(biteDelay(10, () => 1)).toBeLessThan(biteDelay(0, () => 1));
    expect(strikeWindow(90)).toBeLessThan(strikeWindow(10));
  });
});
