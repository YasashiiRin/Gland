import { ITEMS, type ItemId } from '../data/items';
import type { ShopDef } from '../data/shops';
import { addItem, removeItemKg, type InventoryState } from './InventorySystem';
import { isWeighted } from './ProduceSystem';
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

// ------------------------------------------------------------------ open-air market stalls

/** What the stall charges you for one of an item. */
export function marketSellPrice(shop: ShopDef, itemId: ItemId): number {
  return Math.ceil((ITEMS[itemId].sellPrice ?? 0) * (shop.sellMarkup ?? 1));
}

/** Whether this stall buys the item from you. */
export function stallBuys(shop: ShopDef, itemId: ItemId): boolean {
  if (!ITEMS[itemId].sellPrice) return false;
  return (shop.buysItems ?? []).includes(itemId) || (shop.buysCategories ?? []).includes(ITEMS[itemId].category);
}

/**
 * What the stall pays you (base price plus the stall's bonus for its speciality):
 * a kilo for produce sold by weight, else one item.
 */
export function marketBuyPrice(shop: ShopDef, itemId: ItemId): number {
  const base = isWeighted(itemId) ? (ITEMS[itemId].pricePerKg ?? 0) : (ITEMS[itemId].sellPrice ?? 0);
  return Math.floor(base * (1 + (shop.buyBonus ?? 0)));
}

/** Sells up to `qty` of an item to a stall for cash right away. */
export function sellToStall(
  inventory: InventoryState,
  money: number,
  shop: ShopDef,
  itemId: ItemId,
  qty: number,
): { inventory: InventoryState; money: number; soldQty: number; earned: number; kg: number } {
  const none = { inventory, money, soldQty: 0, earned: 0, kg: 0 };
  if (!stallBuys(shop, itemId) || qty <= 0) return none;
  const have = inventory.slots.reduce((n, s) => n + (s?.itemId === itemId ? s.quantity : 0), 0);
  const soldQty = Math.min(qty, have);
  if (soldQty === 0) return none;
  const removed = removeItemKg(inventory, itemId, soldQty);
  // Produce is paid by weight, everything else by the piece.
  const earned = isWeighted(itemId) ? Math.floor(removed.kg * marketBuyPrice(shop, itemId)) : soldQty * marketBuyPrice(shop, itemId);
  return { inventory: removed.state, money: money + earned, soldQty, earned, kg: removed.kg };
}

/** Buys one item from a stall at its market price. */
export function buyFromStall(
  inventory: InventoryState,
  money: number,
  shop: ShopDef,
  itemId: ItemId,
): { inventory: InventoryState; money: number; bought: boolean } {
  const price = marketSellPrice(shop, itemId);
  if (money < price) return { inventory, money, bought: false };
  const { state, leftover } = addItem(inventory, itemId, 1);
  if (leftover > 0) return { inventory, money, bought: false };
  return { inventory: state, money: money - price, bought: true };
}
