import { describe, expect, it } from 'vitest';
import { MAX_STACK } from '../src/data/items';
import { addItem, createEmptyInventory } from '../src/systems/InventorySystem';
import { buyItem, isShopOpen, weekdayOf } from '../src/systems/ShopSystem';
import { createInitialTime } from '../src/systems/TimeSystem';
import { SHOPS } from '../src/data/shops';

const shop = SHOPS.seed_shop; // open 9-17, closed on weekday 6

describe('weekdayOf', () => {
  it('cycles 0-6 starting from day 1', () => {
    expect(weekdayOf({ ...createInitialTime(), day: 1 })).toBe(0);
    expect(weekdayOf({ ...createInitialTime(), day: 7 })).toBe(6);
    expect(weekdayOf({ ...createInitialTime(), day: 8 })).toBe(0);
  });
});

describe('isShopOpen', () => {
  it('is closed before opening and at/after closing time', () => {
    const before = { ...createInitialTime(), day: 1, elapsedMinutes: 0 }; // 06:00
    const atClose = { ...createInitialTime(), day: 1, elapsedMinutes: (17 - 6) * 60 }; // 17:00
    expect(isShopOpen(shop, before)).toBe(false);
    expect(isShopOpen(shop, atClose)).toBe(false);
  });

  it('is open during business hours on a non-closed day', () => {
    const open = { ...createInitialTime(), day: 1, elapsedMinutes: (10 - 6) * 60 }; // 10:00, day 1 -> weekday 0
    expect(isShopOpen(shop, open)).toBe(true);
  });

  it('is closed all day on its weekly closed day', () => {
    const open = { ...createInitialTime(), day: 7, elapsedMinutes: (10 - 6) * 60 }; // day7 -> weekday 6
    expect(isShopOpen(shop, open)).toBe(false);
  });
});

describe('buyItem', () => {
  it('charges only for what is bought and adds it to the inventory', () => {
    const result = buyItem(createEmptyInventory(), 100, 'parsnip_seeds', 3); // price 10 each
    expect(result.boughtQty).toBe(3);
    expect(result.money).toBe(70);
  });

  it('buys as many as affordable when money is short, and no more', () => {
    const result = buyItem(createEmptyInventory(), 25, 'parsnip_seeds', 10); // price 10 -> affords 2
    expect(result.boughtQty).toBe(2);
    expect(result.money).toBe(5);
  });

  it('does nothing when the player cannot afford even one', () => {
    const result = buyItem(createEmptyInventory(), 5, 'parsnip_seeds', 1);
    expect(result.boughtQty).toBe(0);
    expect(result.money).toBe(5);
  });

  it('only pays for what actually fit in the inventory', () => {
    let inv = createEmptyInventory();
    // Fill every slot with a full, unrelated stack so nothing else can fit.
    for (let i = 0; i < inv.slots.length; i++) {
      inv = addItem(inv, 'wood', MAX_STACK).state;
    }
    const result = buyItem(inv, 1000, 'parsnip_seeds', 5);
    expect(result.boughtQty).toBe(0);
    expect(result.money).toBe(1000);
  });
});
