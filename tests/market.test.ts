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
    // Produce is bought by the kilo: rice 2,000 đ/kg.
    expect(marketBuyPrice(SHOPS.market_rice, 'rice')).toBe(2400); // × 1.2
    expect(marketBuyPrice(SHOPS.market_veg, 'rice')).toBe(2200); // × 1.1
    expect(marketSellPrice(SHOPS.market_fish, 'carp')).toBe(7040); // 4,400 × 1.6
  });

  it('sells for cash, only what you have', () => {
    const inv = addItem(createEmptyInventory(), 'potato', 3, 0.6).state; // 3 củ, 0.6 kg
    const r = sellToStall(inv, 100, SHOPS.market_veg, 'potato', 5);
    expect(r.soldQty).toBe(3);
    expect(r.kg).toBe(0.6);
    expect(r.money).toBe(100 + Math.floor(0.6 * 4125)); // 3,750 đ/kg × 1.1
    expect(r.inventory.slots.some((s) => s?.itemId === 'potato')).toBe(false);
  });

  it('buys one at a time when you can afford it', () => {
    const inv = createEmptyInventory();
    expect(buyFromStall(inv, 1000, SHOPS.market_rice, 'gao').bought).toBe(false);
    const r = buyFromStall(inv, 10000, SHOPS.market_rice, 'gao');
    expect(r.bought).toBe(true);
    expect(r.money).toBe(10000 - 4950); // 3,300 × 1.5
  });
});
