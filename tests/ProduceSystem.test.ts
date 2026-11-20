import { describe, expect, it } from 'vitest';
import { addItem, createEmptyInventory, moveItem, removeItemKg, withQuantity } from '../src/systems/InventorySystem';
import { catchMaxKgChance, dailyCare, maxKgChance, pondMaxKgChance, referenceKg, rollHarvestKg, stackKg, stackValue } from '../src/systems/ProduceSystem';

describe('fish weight', () => {
  it('a catch: 10%, +50% in its peak season, +20% when perfect', () => {
    expect(catchMaxKgChance(false, false)).toBeCloseTo(0.1);
    expect(catchMaxKgChance(true, false)).toBeCloseTo(0.6);
    expect(catchMaxKgChance(false, true)).toBeCloseTo(0.3);
    expect(catchMaxKgChance(true, true)).toBeCloseTo(0.8);
  });

  it('a pond fish: 10%, +10% a day fed, at most 100%', () => {
    expect(pondMaxKgChance(0)).toBeCloseTo(0.1);
    expect(pondMaxKgChance(3)).toBeCloseTo(0.4);
    expect(pondMaxKgChance(20)).toBe(1);
  });

  it('every fish is sold by the kilo, and bites in its peak season', async () => {
    const { FISH, FISH_IDS } = await import('../src/data/fish');
    const { ITEMS } = await import('../src/data/items');
    for (const id of FISH_IDS) {
      expect(ITEMS[id].maxKg, id).toBeGreaterThan(0);
      expect(ITEMS[id].pricePerKg, id).toBeGreaterThan(0);
      expect(FISH[id].peakSeason.every((s) => FISH[id].season.includes(s)), id).toBe(true);
    }
  });
});

describe('produce weight', () => {
  it('chance of full weight: 10% base, care and +50% in season, at most 100%', () => {
    expect(maxKgChance(0, false)).toBeCloseTo(0.1);
    expect(maxKgChance(0.15, true)).toBeCloseTo(0.75);
    expect(maxKgChance(2, true)).toBe(1);
    expect(dailyCare(true, true)).toBeCloseTo(0.1);
    expect(dailyCare(false, true)).toBeCloseTo(0.05);
    expect(dailyCare(false, false)).toBe(0);
  });

  it('rolls each unit: full weight or 50–90% of it', () => {
    expect(rollHarvestKg(4, 1, 1, () => 0.5)).toEqual({ kg: 4, fullUnits: 1 });
    const miss = rollHarvestKg(4, 2, 0, () => 0.5); // each 4 × 0.7
    expect(miss).toEqual({ kg: 5.6, fullUnits: 0 });
  });

  it('values produce by the kilo, other things by the piece', () => {
    expect(stackValue({ itemId: 'watermelon', quantity: 1, kg: 3.5 })).toBe(7000); // 2,000 đ/kg
    expect(stackValue({ itemId: 'wood', quantity: 10 })).toBe(1000);
    expect(referenceKg('watermelon')).toBeCloseTo(2.8);
    expect(stackKg({ itemId: 'watermelon', quantity: 2 })).toBeCloseTo(5.6); // no weight recorded: typical
  });
});

describe('inventory keeps the weight of produce', () => {
  it('adds, merges and removes weight in proportion', () => {
    let inv = addItem(createEmptyInventory(), 'cabbage', 2, 2.4).state;
    inv = addItem(inv, 'cabbage', 1, 1.5).state;
    expect(inv.slots[0]).toEqual({ itemId: 'cabbage', quantity: 3, kg: 3.9 });
    const out = removeItemKg(inv, 'cabbage', 1);
    expect(out.kg).toBeCloseTo(1.3);
    expect(out.state.slots[0]?.kg).toBeCloseTo(2.6);
  });

  it('splits and merges stacks with their weight', () => {
    expect(withQuantity({ itemId: 'pumpkin', quantity: 4, kg: 10 }, 1)).toEqual({ itemId: 'pumpkin', quantity: 1, kg: 2.5 });
    expect(withQuantity({ itemId: 'pumpkin', quantity: 4, kg: 10 }, 0)).toBeNull();
    let inv = createEmptyInventory();
    inv = { slots: inv.slots.map((s, i) => (i === 0 ? { itemId: 'pumpkin', quantity: 1, kg: 3 } : i === 1 ? { itemId: 'pumpkin', quantity: 1, kg: 2 } : s)) };
    inv = moveItem(inv, 0, 1);
    expect(inv.slots[1]).toEqual({ itemId: 'pumpkin', quantity: 2, kg: 5 });
    expect(inv.slots[0]).toBeNull();
  });

  it('things that are not produce carry no weight', () => {
    expect(addItem(createEmptyInventory(), 'wood', 5).state.slots[0]).toEqual({ itemId: 'wood', quantity: 5 });
  });
});
