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
  /** "market" = open-air stall that also buys from you (opens the market screen). */
  kind?: 'shop' | 'market';
  vendor?: string;
  greeting?: string;
  /** Market stalls buy any item of these categories… */
  buysCategories?: string[];
  /** …and these specific items. */
  buysItems?: ItemId[];
  /** Extra paid on top of the base price when the stall buys its speciality (0.1 = +10%). */
  buyBonus?: number;
  /** Market selling price = base price × this. */
  sellMarkup?: number;
}

export const SHOPS: Record<ShopId, ShopDef> = shops as Record<ShopId, ShopDef>;

export function isShopId(value: string): value is ShopId {
  return value in shops;
}
