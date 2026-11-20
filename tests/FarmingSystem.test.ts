import { describe, expect, it } from 'vitest';
import {
  advanceDay,
  canFertilize,
  canPlant,
  canTill,
  canWater,
  fertilizePlot,
  growthFraction,
  harvestPlot,
  isReadyToHarvest,
  plantSeed,
  plotKey,
  plotMaxKgChance,
  tillPlot,
  waterPlot,
  type FarmPlots,
} from '../src/systems/FarmingSystem';

// Củ cải trắng: winter, 6 days, 1 củ of up to 0.5 kg. Dâu tây: spring, 9 days, regrows in 4.
const PARSNIP_DAYS = 6;

function grown(key: string, crop: 'parsnip' | 'strawberry', season: 'winter' | 'spring', days: number): FarmPlots {
  let plots = plantSeed(tillPlot({}, key), key, crop, season);
  for (let i = 0; i < days; i++) plots = advanceDay(waterPlot(plots, key), season, false);
  return plots;
}

describe('tilling and planting', () => {
  it('tills bare ground and blocks re-tilling a planted plot', () => {
    const key = plotKey(5, 5);
    let plots: FarmPlots = {};
    expect(canTill(plots, key)).toBe(true);
    plots = tillPlot(plots, key);
    expect(plots[key]).toEqual({ tilled: true, growthDay: 0, wateredToday: false });

    plots = plantSeed(plots, key, 'parsnip', 'winter');
    expect(canTill(plots, key)).toBe(false);
    expect(tillPlot(plots, key)).toBe(plots); // no-op, crop untouched
  });

  it('only allows planting on tilled, empty soil', () => {
    const key = plotKey(0, 0);
    expect(canPlant({}, key)).toBe(false);
    let plots = tillPlot({}, key);
    expect(canPlant(plots, key)).toBe(true);
    plots = plantSeed(plots, key, 'potato', 'spring');
    expect(plots[key].cropId).toBe('potato');
    expect(canPlant(plots, key)).toBe(false);
  });
});

describe('watering and growth', () => {
  it('only grows watered or rained-on plots', () => {
    const key = plotKey(1, 1);
    let plots = plantSeed(tillPlot({}, key), key, 'parsnip', 'winter');
    plots = waterPlot(plots, key);
    plots = advanceDay(plots, 'winter', false);
    expect(plots[key].growthDay).toBe(1);
    expect(plots[key].wateredToday).toBe(false);

    // Not watered and no rain: no growth.
    plots = advanceDay(plots, 'winter', false);
    expect(plots[key].growthDay).toBe(1);

    // Rain substitutes for watering.
    plots = advanceDay(plots, 'winter', true);
    expect(plots[key].growthDay).toBe(2);
  });

  it('becomes harvestable once growthDay reaches the total', () => {
    const plots = grown(plotKey(2, 2), 'parsnip', 'winter', PARSNIP_DAYS);
    expect(isReadyToHarvest(plots[plotKey(2, 2)])).toBe(true);
    expect(growthFraction(plots[plotKey(2, 2)])).toBe(1);
  });

  it('a crop out of season keeps growing, just without the in-season bonus', () => {
    const key = plotKey(3, 3);
    let plots = plantSeed(tillPlot({}, key), key, 'parsnip', 'summer');
    expect(plots[key].inSeason).toBe(false);
    plots = advanceDay(plots, 'summer', true);
    expect(plots[key].cropId).toBe('parsnip');
    expect(plots[key].growthDay).toBe(1);
  });
});

describe('care: the chance of full-weight produce', () => {
  it('starts at 10%, +50% in season', () => {
    const key = plotKey(9, 9);
    expect(plotMaxKgChance(plantSeed(tillPlot({}, key), key, 'parsnip', 'summer')[key])).toBeCloseTo(0.1);
    expect(plotMaxKgChance(plantSeed(tillPlot({}, key), key, 'parsnip', 'winter')[key])).toBeCloseTo(0.6);
  });

  it('+5% a day watered, +10% fertilized, only one a day', () => {
    const key = plotKey(10, 10);
    let plots = plantSeed(tillPlot({}, key), key, 'parsnip', 'summer');
    plots = advanceDay(waterPlot(plots, key), 'summer', false); // +0.05
    expect(canFertilize(plots, key)).toBe(true);
    plots = fertilizePlot(waterPlot(plots, key), key); // both today: only the fertilizer counts
    expect(canFertilize(plots, key)).toBe(false);
    plots = advanceDay(plots, 'summer', false); // +0.10
    plots = advanceDay(plots, 'summer', false); // nothing
    expect(plots[key].care).toBeCloseTo(0.15);
    expect(plotMaxKgChance(plots[key])).toBeCloseTo(0.25);
  });

  it('fertilizer needs a crop', () => {
    const key = plotKey(11, 11);
    expect(canFertilize(tillPlot({}, key), key)).toBe(false);
  });
});

describe('harvestPlot', () => {
  it('returns null when not ready, and yields within range when ready', () => {
    const key = plotKey(4, 4);
    expect(harvestPlot(plantSeed(tillPlot({}, key), key, 'parsnip', 'winter'), key)).toBeNull();
    const result = harvestPlot(grown(key, 'parsnip', 'winter', PARSNIP_DAYS), key, () => 0);
    expect(result?.harvestedItemId).toBe('parsnip');
    expect(result?.quantity).toBe(1);
    expect(result?.kg).toBe(0.5); // random 0 < chance: full weight
    expect(result?.fullUnits).toBe(1);
  });

  it('a unit that misses full weight weighs 50–90% of it', () => {
    const key = plotKey(12, 12);
    const result = harvestPlot(grown(key, 'parsnip', 'winter', PARSNIP_DAYS), key, () => 0.99)!;
    expect(result.fullUnits).toBe(0);
    expect(result.kg).toBeGreaterThanOrEqual(0.25);
    expect(result.kg).toBeLessThan(0.5);
  });

  it('clears a non-regrowing crop back to empty tilled soil', () => {
    const key = plotKey(6, 6);
    const result = harvestPlot(grown(key, 'parsnip', 'winter', PARSNIP_DAYS), key)!;
    expect(result.plots[key]).toEqual({ tilled: true, growthDay: 0, wateredToday: false });
  });

  it('a regrowing crop resets to just-before-maturity, its care starting afresh', () => {
    const key = plotKey(7, 7);
    const result = harvestPlot(grown(key, 'strawberry', 'spring', 9), key)!;
    expect(result.plots[key].cropId).toBe('strawberry');
    expect(result.plots[key].growthDay).toBe(5); // 9 - 4
    expect(result.plots[key].care).toBe(0);
    expect(isReadyToHarvest(result.plots[key])).toBe(false);
  });

  it('canWater refuses a plot already watered today', () => {
    const key = plotKey(8, 8);
    let plots = tillPlot({}, key);
    expect(canWater(plots, key)).toBe(true);
    plots = waterPlot(plots, key);
    expect(canWater(plots, key)).toBe(false);
  });
});
