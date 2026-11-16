import items from './items.json';
import type { ItemStats } from '../systems/StatsSystem';

export type ItemId = keyof typeof items;

export type ItemCategory = 'tool' | 'seed' | 'crop' | 'material' | 'food' | 'fish' | 'furniture' | 'vehicle';

export interface FoodDef {
  /** Energy restored when eaten. */
  energy: number;
  /** If set, the item's `stats` apply for this many game minutes after eating. */
  buffMinutes?: number;
}

export interface ItemDef {
  name: string;
  category: ItemCategory;
  stackable: boolean;
  sellPrice?: number;
  description: string;
  /** Stat bonuses: while held (weapons), while riding (vehicles) or after eating (food buffs). */
  stats?: ItemStats;
  food?: FoodDef;
}

export const ITEMS: Record<ItemId, ItemDef> = items as Record<ItemId, ItemDef>;
export const ITEM_IDS = Object.keys(items) as ItemId[];

export function isItemId(value: string): value is ItemId {
  return value in items;
}

export const MAX_STACK = 999;

/** How much energy using this item once costs. Non-tools cost nothing. */
export const TOOL_ENERGY_COST: Partial<Record<ItemId, number>> = {
  hoe: 2,
  watering_can: 1,
  axe: 3,
  pickaxe: 3,
  scythe: 1,
  fishing_rod: 3,
  sword: 1,
};
