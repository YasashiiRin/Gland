import crops from './crops.json';
import type { ItemId } from './items';
import type { Season } from '../systems/TimeSystem';

export type CropId = keyof typeof crops;

export interface CropDef {
  name: string;
  seedItemId: ItemId;
  harvestedItemId: ItemId;
  season: Season[];
  /** Days spent in each growth stage; the crop is ready once growthDay reaches the sum. */
  growthStages: number[];
  /** If set, after the first harvest the crop regrows and can be harvested again this often. */
  regrowDays?: number;
  /** Random yield range (inclusive) per harvest. */
  harvestYield: [number, number];
}

export const CROPS: Record<CropId, CropDef> = crops as Record<CropId, CropDef>;
export const CROP_IDS = Object.keys(crops) as CropId[];

export function isCropId(value: string): value is CropId {
  return value in crops;
}

/** Map a seed item to the crop it grows, for planting. */
export function cropForSeed(seedItemId: ItemId): CropId | undefined {
  return CROP_IDS.find((id) => CROPS[id].seedItemId === seedItemId);
}

export function totalGrowthDays(def: CropDef): number {
  return def.growthStages.reduce((a, b) => a + b, 0);
}
