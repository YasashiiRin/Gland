import items from './items.json';
import type { ItemStats } from '../systems/StatsSystem';

export type ItemId = keyof typeof items;

export type ItemCategory = 'tool' | 'seed' | 'crop' | 'material' | 'food' | 'fish' | 'furniture' | 'vehicle' | 'equipment' | 'bait' | 'animal' | 'fry' | 'relic' | 'fertilizer' | 'fish_feed';

export interface FoodDef {
  /** Energy restored when eaten. */
  energy: number;
  /** Hunger filled when eaten (the stomach holds 150). */
  hunger?: number;
  /** If set, the item's `stats` apply for this many game minutes after eating. */
  buffMinutes?: number;
}

export interface ItemDef {
  name: string;
  category: ItemCategory;
  stackable: boolean;
  sellPrice?: number;
  /** Produce sold by weight: đồng a kilo (sellPrice is then a typical unit's worth). */
  pricePerKg?: number;
  /** Produce: the most one unit can weigh (kg). */
  maxKg?: number;
  /** Produce: what one unit is called (bó, củ, trái…). */
  unit?: string;
  description: string;
  /** Stat bonuses: while held (weapons), while riding (vehicles) or after eating (food buffs). */
  stats?: ItemStats;
  food?: FoodDef;
  vehicle?: VehicleDef;
  /** Watering can: how many waterings a full can holds. */
  capacity?: number;
  /** Equipment: extra inventory slots this backpack gives when worn. */
  backpackSlots?: number;
  /** Relics: using it makes you this profession (a talisman)… */
  unlocks?: string;
  /** …or teaches this active skill (an ancient book). */
  teaches?: string;
}

/**
 * What a vehicle does besides moving faster (its speed lives in `stats`):
 * till = ploughs its 2x2 area, harvest = reaps its 2x2 area (both toggled),
 * storage = has a cargo bed you can open, none = just a ride.
 */
export type VehicleAbility = 'none' | 'till' | 'harvest' | 'water' | 'storage';

export interface VehicleDef {
  ability: VehicleAbility;
  /** Cargo slots (ability "storage"). */
  storageSlots?: number;
  /** How many people fit, driver included (default 1). Extra seats are for friends in a room. */
  seats?: number;
}

export const ITEMS: Record<ItemId, ItemDef> = items as Record<ItemId, ItemDef>;
export const ITEM_IDS = Object.keys(items) as ItemId[];

export function isItemId(value: string): value is ItemId {
  return value in items;
}

export const MAX_STACK = 999;

/**
 * How much energy using this item once costs (of 270). Non-tools cost nothing.
 * 60% lower since 2026-11-20 (the player found a few strokes tired them out).
 */
export const TOOL_ENERGY_COST: Partial<Record<ItemId, number>> = {
  hoe: 0.8,
  watering_can: 0.4,
  axe: 1.2,
  pickaxe: 1.2,
  scythe: 0.4,
  fishing_rod: 1.2,
  whip: 0.4,
  sword: 0.4,
};
