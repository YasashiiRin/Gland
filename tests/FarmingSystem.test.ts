import { describe, expect, it } from 'vitest';
import {
  advanceDay,
  canPlant,
  canTill,
  canWater,
  growthFraction,
  harvestPlot,
  isReadyToHarvest,
  plantSeed,
  plotKey,
  tillPlot,
  waterPlot,
  type FarmPlots,
} from '../src/systems/FarmingSystem';

describe('tilling and planting', () => {
  it('tills bare ground and blocks re-tilling a planted plot', () => {
    const key = plotKey(5, 5);
    let plots: FarmPlots = {};
    expect(canTill(plots, key)).toBe(true);
    plots = tillPlot(plots, key);
    expect(plots[key]).toEqual({ tilled: true, growthDay: 0, wateredToday: false });

    plots = plantSeed(plots, key, 'parsnip');
    expect(canTill(plots, key)).toBe(false);
    expect(tillPlot(plots, key)).toBe(plots); // no-op, crop untouched
  });

  it('only allows planting on tilled, empty soil', () => {
    const key = plotKey(0, 0);
    expect(canPlant({}, key)).toBe(false);
    let plots = tillPlot({}, key);
    expect(canPlant(plots, key)).toBe(true);
    plots = plantSeed(plots, key, 'potato');
    expect(plots[key].cropId).toBe('potato');
    expect(canPlant(plots, key)).toBe(false);
  });
});

describe('watering and growth', () => {
  it('only grows watered or rained-on plots', () => {
    const key = plotKey(1, 1);
    let plots = plantSeed(tillPlot({}, key), key, 'parsnip'); // growthStages sum = 4
    plots = waterPlot(plots, key);
    plots = advanceDay(plots, 'spring', false);
    expect(plots[key].growthDay).toBe(1);
    expect(plots[key].wateredToday).toBe(false);

    // Not watered and no rain: no growth.
    plots = advanceDay(plots, 'spring', false);
    expect(plots[key].growthDay).toBe(1);

    // Rain substitutes for watering.
    plots = advanceDay(plots, 'spring', true);
    expect(plots[key].growthDay).toBe(2);
  });

  it('becomes harvestable once growthDay reaches the total', () => {
    const key = plotKey(2, 2);
    let plots = plantSeed(tillPlot({}, key), key, 'parsnip');
    for (let i = 0; i < 4; i++) {
      plots = waterPlot(plots, key);
      plots = advanceDay(plots, 'spring', false);
    }
    expect(isReadyToHarvest(plots[key])).toBe(true);
    expect(growthFraction(plots[key])).toBe(1);
  });

  it('withers when the season changes, leaving bare tilled soil', () => {
    const key = plotKey(3, 3);
    let plots = plantSeed(tillPlot({}, key), key, 'parsnip');
    plots = advanceDay(plots, 'summer', true);
    expect(plots[key].cropId).toBeUndefined();
    expect(plots[key].tilled).toBe(true);
  });
});

describe('harvestPlot', () => {
  it('returns null when not ready, and yields within range when ready', () => {
    const key = plotKey(4, 4);
    let plots = plantSeed(tillPlot({}, key), key, 'parsnip');
    expect(harvestPlot(plots, key)).toBeNull();

    for (let i = 0; i < 4; i++) {
      plots = waterPlot(plots, key);
      plots = advanceDay(plots, 'spring', false);
    }
    const result = harvestPlot(plots, key, () => 0);
    expect(result).not.toBeNull();
    expect(result?.harvestedItemId).toBe('parsnip');
    expect(result?.quantity).toBe(1);
  });

  it('clears a non-regrowing crop back to empty tilled soil', () => {
    const key = plotKey(6, 6);
    let plots = plantSeed(tillPlot({}, key), key, 'parsnip');
    for (let i = 0; i < 4; i++) plots = advanceDay(waterPlot(plots, key), 'spring', false);
    const result = harvestPlot(plots, key)!;
    expect(result.plots[key]).toEqual({ tilled: true, growthDay: 0, wateredToday: false });
  });

  it('a regrowing crop resets to just-before-maturity instead of clearing', () => {
    const key = plotKey(7, 7);
    let plots = plantSeed(tillPlot({}, key), key, 'strawberry'); // stages sum = 8, regrowDays = 4
    for (let i = 0; i < 8; i++) plots = advanceDay(waterPlot(plots, key), 'spring', false);
    const result = harvestPlot(plots, key)!;
    expect(result.plots[key].cropId).toBe('strawberry');
    expect(result.plots[key].growthDay).toBe(4); // 8 - 4
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
