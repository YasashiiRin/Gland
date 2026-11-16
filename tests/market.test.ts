import { describe, expect, it } from 'vitest';
import { SHOPS } from '../src/data/shops';
import { createEmptyInventory, addItem } from '../src/systems/InventorySystem';
import { buyFromStall, marketBuyPrice, marketSellPrice, sellToStall, stallBuys } from '../src/systems/ShopSystem';

describe('open-air market', () => {
  it('each stall buys its own kind of goods', () => {
    expect(stallBuys(SHOPS.market_fish, 'carp')).toBe(true);
    expect(stallBuys(SHOPS.market_fish, 'potato')).toBe(false);
    expect(stallBuys(SHOPS.market_veg, 'potato')).toBe(true);
    expect(stallBuys(SHOPS.market_veg, 'rice')).toBe(true); // all farm produce
    expect(stallBuys(SHOPS.market_rice, 'rice')).toBe(true);
    expect(stallBuys(SHOPS.market_rice, 'carp')).toBe(false);
    expect(stallBuys(SHOPS.market_veg, 'hoe')).toBe(false);
  });

  it('pays a bonus over the base price and charges a markup', () => {
    expect(marketBuyPrice(SHOPS.market_rice, 'rice')).toBe(90); // 75 × 1.2
    expect(marketBuyPrice(SHOPS.market_veg, 'rice')).toBe(82); // 75 × 1.1
    expect(marketSellPrice(SHOPS.market_fish, 'carp')).toBe(48); // 30 × 1.6
  });

  it('sells for cash, only what you have', () => {
    const inv = addItem(createEmptyInventory(), 'potato', 3).state;
    const r = sellToStall(inv, 100, SHOPS.market_veg, 'potato', 5);
    expect(r.soldQty).toBe(3);
    expect(r.money).toBe(100 + 3 * 88);
    expect(r.inventory.slots.some((s) => s?.itemId === 'potato')).toBe(false);
  });

  it('buys one at a time when you can afford it', () => {
    const inv = createEmptyInventory();
    expect(buyFromStall(inv, 10, SHOPS.market_rice, 'gao').bought).toBe(false);
    const r = buyFromStall(inv, 200, SHOPS.market_rice, 'gao');
    expect(r.bought).toBe(true);
    expect(r.money).toBe(200 - 90);
  });
});
