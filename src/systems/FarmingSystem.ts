import { CROPS, totalGrowthDays, type CropId } from '../data/crops';
import type { Season } from './TimeSystem';

export interface FarmPlot {
  tilled: boolean;
  cropId?: CropId;
  growthDay: number;
  wateredToday: boolean;
}

export type FarmPlots = Record<string, FarmPlot>;

export function plotKey(x: number, y: number): string {
  return `${x},${y}`;
}

export function getPlot(plots: FarmPlots, key: string): FarmPlot | undefined {
  return plots[key];
}

/** A tile can be hoed if it isn't already tilled (hoeing a planted plot would destroy the crop). */
export function canTill(plots: FarmPlots, key: string): boolean {
  return !plots[key]?.tilled;
}

export function tillPlot(plots: FarmPlots, key: string): FarmPlots {
  if (!canTill(plots, key)) return plots;
  return { ...plots, [key]: { tilled: true, growthDay: 0, wateredToday: false } };
}

export function canWater(plots: FarmPlots, key: string): boolean {
  return !!plots[key]?.tilled && !plots[key].wateredToday;
}

export function waterPlot(plots: FarmPlots, key: string): FarmPlots {
  const plot = plots[key];
  if (!plot?.tilled) return plots;
  return { ...plots, [key]: { ...plot, wateredToday: true } };
}

export function canPlant(plots: FarmPlots, key: string): boolean {
  const plot = plots[key];
  return !!plot?.tilled && !plot.cropId;
}

export function plantSeed(plots: FarmPlots, key: string, cropId: CropId): FarmPlots {
  if (!canPlant(plots, key)) return plots;
  const plot = plots[key];
  return { ...plots, [key]: { ...plot, cropId, growthDay: 0 } };
}

export function isReadyToHarvest(plot: FarmPlot | undefined): boolean {
  if (!plot?.cropId) return false;
  return plot.growthDay >= totalGrowthDays(CROPS[plot.cropId]);
}

/** 0 (just planted) to 1 (fully grown), for sizing a placeholder sprite. */
export function growthFraction(plot: FarmPlot | undefined): number {
  if (!plot?.cropId) return 0;
  const total = totalGrowthDays(CROPS[plot.cropId]);
  return total > 0 ? Math.min(1, plot.growthDay / total) : 1;
}

export interface HarvestResult {
  plots: FarmPlots;
  harvestedItemId: string;
  quantity: number;
}

/**
 * Harvests a ready plot. Regrowing crops (e.g. strawberries) reset to just
 * before maturity so they ripen again after `regrowDays`; others are cleared
 * back to bare tilled soil.
 */
export function harvestPlot(plots: FarmPlots, key: string, random: () => number = Math.random): HarvestResult | null {
  const plot = plots[key];
  if (!isReadyToHarvest(plot) || !plot?.cropId) return null;
  const def = CROPS[plot.cropId];
  const [min, max] = def.harvestYield;
  const quantity = min + Math.floor(random() * (max - min + 1));

  let nextPlot: FarmPlot;
  if (def.regrowDays) {
    const total = totalGrowthDays(def);
    nextPlot = { tilled: true, cropId: plot.cropId, growthDay: Math.max(0, total - def.regrowDays), wateredToday: plot.wateredToday };
  } else {
    nextPlot = { tilled: true, growthDay: 0, wateredToday: plot.wateredToday };
  }

  return { plots: { ...plots, [key]: nextPlot }, harvestedItemId: def.harvestedItemId, quantity };
}

/**
 * Advances every tilled plot by one day: watered (or rained-on) crops grow;
 * crops whose season has ended wither away, leaving bare tilled soil behind.
 * Every plot's watered flag resets for the new day regardless.
 */
export function advanceDay(plots: FarmPlots, season: Season, isRaining: boolean): FarmPlots {
  const next: FarmPlots = {};
  for (const [key, plot] of Object.entries(plots)) {
    let { cropId, growthDay } = plot;
    const watered = plot.wateredToday || isRaining;

    if (cropId) {
      const def = CROPS[cropId];
      if (!def.season.includes(season)) {
        cropId = undefined;
        growthDay = 0;
      } else if (watered) {
        growthDay += 1;
      }
    }

    next[key] = { tilled: true, cropId, growthDay, wateredToday: false };
  }
  return next;
}
