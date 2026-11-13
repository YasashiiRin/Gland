import shops from './shops.json';
import type { ItemId } from './items';

export type ShopId = keyof typeof shops;

export interface ShopDef {
  name: string;
  openHour: number;
  closeHour: number;
  /** 0 = first day of the season, matching (day-1) % 7; one weekday is closed. */
  closedWeekday: number;
  stock: ItemId[];
}

export const SHOPS: Record<ShopId, ShopDef> = shops as Record<ShopId, ShopDef>;

export function isShopId(value: string): value is ShopId {
  return value in shops;
}
