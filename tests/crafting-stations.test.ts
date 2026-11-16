import { describe, expect, it } from 'vitest';
import { ingredientStatus, recipesFor, stationAllows } from '../src/systems/CraftingSystem';
import { addItem, createEmptyInventory, expandInventory, INVENTORY_SIZE } from '../src/systems/InventorySystem';

describe('crafting stations and ingredient status', () => {
  it('the starting bench can make a backpack but not the large one', () => {
    expect(stationAllows('rough', 'backpack_cloth')).toBe(true);
    expect(stationAllows('rough', 'backpack_large')).toBe(false);
    expect(stationAllows('carpenter', 'backpack_cloth')).toBe(true);
    expect(stationAllows('carpenter', 'backpack_large')).toBe(true);
    const order = recipesFor('rough');
    expect(order.indexOf('backpack_cloth')).toBeLessThan(order.indexOf('backpack_large'));
  });

  it('says how many of each ingredient you have and are missing', () => {
    let inv = addItem(createEmptyInventory(), 'fiber', 25).state;
    inv = addItem(inv, 'wood', 12).state;
    expect(ingredientStatus(inv, 'backpack_cloth')).toEqual([
      { itemId: 'fiber', need: 40, have: 25, missing: 15 },
      { itemId: 'wood', need: 10, have: 12, missing: 0 },
    ]);
  });

  it('a backpack grows the inventory without touching existing items', () => {
    const inv = addItem(createEmptyInventory(), 'wood', 5).state;
    const bigger = expandInventory(inv, INVENTORY_SIZE + 12);
    expect(bigger.slots).toHaveLength(INVENTORY_SIZE + 12);
    expect(bigger.slots[0]).toEqual(inv.slots[0]);
    expect(expandInventory(bigger, INVENTORY_SIZE)).toBe(bigger); // never shrinks
  });
});
