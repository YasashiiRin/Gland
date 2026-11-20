import config from '../data/produce.json';
import { ITEMS, type ItemId } from '../data/items';

/**
 * Produce sold by weight. A unit (a cabbage, a bunch of water spinach…) weighs
 * up to its item's `maxKg`; at harvest each unit reaches that full weight with
 * a chance that starts at 10% and grows with care:
 * +5% a day watered, +10% a day fertilized (one of them a day), +50% once if
 * the crop was sown in its season. Otherwise it weighs 50–90% of the most.
 * Pure logic, no Phaser.
 */
export const PRODUCE = config;

/** Anything carrying a kg weight: { quantity, kg? } (kg missing = typical weight). */
export interface Weighable {
  itemId: ItemId;
  quantity: number;
  kg?: number;
}

export function isWeighted(itemId: ItemId): boolean {
  const def = ITEMS[itemId];
  return !!def.pricePerKg && !!def.maxKg;
}

/** A typical unit's weight (used when a stack has no recorded weight, e.g. bought at a stall). */
export function referenceKg(itemId: ItemId): number {
  return isWeighted(itemId) ? (ITEMS[itemId].maxKg ?? 0) * config.referenceKgShare : 0;
}

/** Chance (0–1) that a harvested unit reaches its full weight. */
export function maxKgChance(care: number, inSeason: boolean): number {
  return Math.min(1, config.baseMaxKgChance + Math.max(0, care) + (inSeason ? config.inSeasonBonus : 0));
}

/**
 * Chance (0–1) that a fish on the line is full weight: 10%, +50% in its peak
 * season, +20% for a perfect catch (never lost the line).
 */
export function catchMaxKgChance(peakSeason: boolean, perfect: boolean): number {
  return maxKgChance(perfect ? config.fish.perfectCatchBonus : 0, peakSeason);
}

/** Chance (0–1) that a pond fish is full weight: 10%, +10% for each day it was fed. */
export function pondMaxKgChance(fedDays: number): number {
  return maxKgChance(fedDays * config.fish.pondFedBonus, false);
}

/** One day's care: fertilizer beats watering, and only one of them counts. */
export function dailyCare(fertilized: boolean, watered: boolean): number {
  if (fertilized) return config.fertilizerBonus;
  return watered ? config.waterBonus : 0;
}

function round2(kg: number): number {
  return Math.round(kg * 100) / 100;
}

/** One unit's weight. */
export function rollUnitKg(maxKg: number, chance: number, random: () => number = Math.random): number {
  if (random() < chance) return maxKg;
  const [lo, hi] = config.missKgShare;
  return round2(maxKg * (lo + random() * (hi - lo)));
}

/** Total weight of `units` harvested units, and how many reached full weight. */
export function rollHarvestKg(maxKg: number, units: number, chance: number, random: () => number = Math.random): { kg: number; fullUnits: number } {
  let kg = 0;
  let fullUnits = 0;
  for (let i = 0; i < units; i++) {
    const unit = rollUnitKg(maxKg, chance, random);
    if (unit >= maxKg) fullUnits++;
    kg += unit;
  }
  return { kg: round2(kg), fullUnits };
}

export function stackKg(stack: Weighable): number {
  if (!isWeighted(stack.itemId)) return 0;
  return stack.kg ?? stack.quantity * referenceKg(stack.itemId);
}

/** Đồng for `kg` of a weighed item. */
export function valueOfKg(itemId: ItemId, kg: number): number {
  return Math.round(kg * (ITEMS[itemId].pricePerKg ?? 0));
}

/** What a stack is worth at base price: by weight for produce, else by count. */
export function stackValue(stack: Weighable): number {
  if (isWeighted(stack.itemId)) return valueOfKg(stack.itemId, stackKg(stack));
  return (ITEMS[stack.itemId].sellPrice ?? 0) * stack.quantity;
}

/** "2,35 kg" */
export function formatKg(kg: number): string {
  return `${round2(kg).toLocaleString('vi-VN')} kg`;
}
