import { ITEMS, type ItemId } from '../data/items';
import type { ShopDef } from '../data/shops';
import { addItem, type InventoryState } from './InventorySystem';
import type { TimeState } from './TimeSystem';
import { clockMinuteOfDay } from './TimeSystem';

/** Weekday is derived from the day-of-season number rather than stored separately. */
export function weekdayOf(time: TimeState): number {
  return (time.day - 1) % 7;
}

export function isShopOpen(shop: ShopDef, time: TimeState): boolean {
  if (weekdayOf(time) === shop.closedWeekday) return false;
  const hour = Math.floor(clockMinuteOfDay(time) / 60);
  return hour >= shop.openHour && hour < shop.closeHour;
}

export interface PurchaseResult {
  inventory: InventoryState;
  money: number;
  boughtQty: number;
}

/**
 * Buys up to `qty` of an item, limited by both the player's money and however
 * much actually fits in the inventory. Only pays for what was actually added.
 */
export function buyItem(inventory: InventoryState, money: number, itemId: ItemId, qty: number): PurchaseResult {
  const price = ITEMS[itemId].sellPrice ?? 0;
  if (price <= 0 || qty <= 0) return { inventory, money, boughtQty: 0 };

  const affordableQty = Math.floor(money / price);
  const attemptQty = Math.min(qty, affordableQty);
  if (attemptQty <= 0) return { inventory, money, boughtQty: 0 };

  const { state, leftover } = addItem(inventory, itemId, attemptQty);
  const boughtQty = attemptQty - leftover;
  return { inventory: state, money: money - boughtQty * price, boughtQty };
}
