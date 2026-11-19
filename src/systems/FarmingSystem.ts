import { CROPS, totalGrowthDays, type CropId } from '../data/crops';
import { grassAfter } from './GroundSystem';
import type { Season } from './TimeSystem';

export interface FarmPlot {
  tilled: boolean;
  cropId?: CropId;
  growthDay: number;
  wateredToday: boolean;
  /**
   * Who sowed it, for plots sown on a landmark's prebuilt field: in a shared
   * world only they may harvest it. Plots on your own tilled land have none.
   */
  owner?: string;
  /** Hoed out of grass: left without a crop, grass grows back over it (GroundSystem). */
  fromGrass?: boolean;
  /** Day it last stood without a crop (or was weeded), for grass growing back. */
  bareSince?: number;
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

export function tillPlot(plots: FarmPlots, key: string, fromGrassOn?: number): FarmPlots {
  if (!canTill(plots, key)) return plots;
  const plot: FarmPlot = { tilled: true, growthDay: 0, wateredToday: false };
  if (fromGrassOn !== undefined) Object.assign(plot, { fromGrass: true, bareSince: fromGrassOn });
  return { ...plots, [key]: plot };
}

/** How grown over an empty plot hoed out of grass is (crops keep the weeds down). */
export function plotGrass(plot: FarmPlot | undefined, today: number): 'bare' | 'faint' {
  if (!plot?.fromGrass || plot.cropId || plot.bareSince === undefined) return 'bare';
  return grassAfter(today - plot.bareSince) === 'bare' ? 'bare' : 'faint';
}

/** A stroke of the hoe on an empty plot going back to grass: weeded, it stays bare a while longer. */
export function weedPlot(plots: FarmPlots, key: string, today: number): FarmPlots {
  const plot = plots[key];
  if (!plot?.fromGrass || plot.cropId) return plots;
  return { ...plots, [key]: { ...plot, bareSince: today } };
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

/**
 * Sows straight onto a prebuilt field (reaped rice stubble in a landmark
 * zone): no hoeing needed, and the crop belongs to whoever sowed it.
 */
export function sowField(plots: FarmPlots, key: string, cropId: CropId, owner: string): FarmPlots {
  if (plots[key]?.cropId) return plots;
  return { ...plots, [key]: { tilled: true, cropId, growthDay: 0, wateredToday: plots[key]?.wateredToday ?? false, owner } };
}

/** May `who` harvest this plot? Anyone may, unless someone else sowed it on a landmark field. */
export function mayHarvest(plot: FarmPlot | undefined, who: string): boolean {
  return !plot?.owner || plot.owner === who;
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
  if (plot.owner) nextPlot.owner = plot.owner;

  return { plots: { ...plots, [key]: nextPlot }, harvestedItemId: def.harvestedItemId, quantity };
}

/**
 * Advances every tilled plot by one day: watered (or rained-on) crops grow;
 * crops whose season has ended wither away, leaving bare tilled soil behind.
 * Every plot's watered flag resets for the new day regardless. A plot hoed
 * out of grass that stands empty grows grass back and is gone after a few
 * days (`today`: the new day's number; without it plots never go back).
 */
export function advanceDay(plots: FarmPlots, season: Season, isRaining: boolean, today?: number): FarmPlots {
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
    if (plot.owner) next[key].owner = plot.owner;
    if (plot.fromGrass && today !== undefined) {
      // Without a crop, grass creeps back: after a while the plot is grass again (gone).
      const bareSince = cropId ? undefined : plot.bareSince ?? today;
      if (bareSince !== undefined && grassAfter(today - bareSince) === 'grass') {
        delete next[key];
        continue;
      }
      next[key].fromGrass = true;
      if (bareSince !== undefined) next[key].bareSince = bareSince;
    }
  }
  return next;
}
