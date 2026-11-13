import { describe, expect, it } from 'vitest';
import {
  addItem,
  createEmptyInventory,
  HOTBAR_SIZE,
  hasItem,
  itemAt,
  moveItem,
  removeItem,
} from '../src/systems/InventorySystem';
import { MAX_STACK } from '../src/data/items';

describe('addItem', () => {
  it('fills an empty slot with a stackable item', () => {
    const { state, leftover } = addItem(createEmptyInventory(), 'wood', 5);
    expect(leftover).toBe(0);
    expect(itemAt(state, 0)).toEqual({ itemId: 'wood', quantity: 5 });
  });

  it('stacks onto an existing pile before using a new slot', () => {
    let inv = addItem(createEmptyInventory(), 'wood', 5).state;
    inv = addItem(inv, 'wood', 3).state;
    expect(itemAt(inv, 0)).toEqual({ itemId: 'wood', quantity: 8 });
    expect(itemAt(inv, 1)).toBeNull();
  });

  it('spills into a second stack once the first is full, and reports leftover when totally full', () => {
    let inv = createEmptyInventory();
    inv = addItem(inv, 'wood', MAX_STACK).state;
    const r = addItem(inv, 'wood', 10);
    expect(itemAt(r.state, 0)).toEqual({ itemId: 'wood', quantity: MAX_STACK });
    expect(itemAt(r.state, 1)).toEqual({ itemId: 'wood', quantity: 10 });

    // Fill every slot completely, then nothing more should fit.
    let full = createEmptyInventory();
    for (let i = 0; i < full.slots.length; i++) {
      full = addItem(full, 'wood', MAX_STACK).state;
    }
    const overflow = addItem(full, 'wood', 1);
    expect(overflow.leftover).toBe(1);
  });

  it('gives each non-stackable item its own slot', () => {
    let inv = addItem(createEmptyInventory(), 'hoe', 1).state;
    inv = addItem(inv, 'axe', 1).state;
    expect(itemAt(inv, 0)?.itemId).toBe('hoe');
    expect(itemAt(inv, 1)?.itemId).toBe('axe');
  });
});

describe('hasItem / removeItem', () => {
  it('reports whether enough of an item exists across slots', () => {
    const inv = addItem(createEmptyInventory(), 'wood', 5).state;
    expect(hasItem(inv, 'wood', 5)).toBe(true);
    expect(hasItem(inv, 'wood', 6)).toBe(false);
  });

  it('removes across multiple stacks and clears emptied slots', () => {
    let inv = createEmptyInventory();
    inv = addItem(inv, 'wood', MAX_STACK).state;
    inv = addItem(inv, 'wood', 10).state; // now two stacks: 999 + 10
    inv = removeItem(inv, 'wood', MAX_STACK + 5);
    expect(itemAt(inv, 0)).toBeNull();
    expect(itemAt(inv, 1)).toEqual({ itemId: 'wood', quantity: 5 });
  });

  it('throws when removing more than is available', () => {
    const inv = addItem(createEmptyInventory(), 'wood', 2).state;
    expect(() => removeItem(inv, 'wood', 3)).toThrow();
  });
});

describe('moveItem', () => {
  it('swaps two different items', () => {
    let inv = addItem(createEmptyInventory(), 'hoe', 1).state;
    inv = addItem(inv, 'axe', 1).state;
    inv = moveItem(inv, 0, 1);
    expect(itemAt(inv, 0)?.itemId).toBe('axe');
    expect(itemAt(inv, 1)?.itemId).toBe('hoe');
  });

  it('merges matching stackable items into the destination', () => {
    let inv = addItem(createEmptyInventory(), 'wood', 5).state;
    inv = { slots: inv.slots.map((s, i) => (i === 5 ? { itemId: 'wood', quantity: 3 } : s)) };
    inv = moveItem(inv, 0, 5);
    expect(itemAt(inv, 0)).toBeNull();
    expect(itemAt(inv, 5)).toEqual({ itemId: 'wood', quantity: 8 });
  });

  it('caps a merge at MAX_STACK and leaves the remainder behind', () => {
    let inv = createEmptyInventory();
    inv = { slots: inv.slots.map((s, i) => (i === 0 ? { itemId: 'wood', quantity: MAX_STACK - 2 } : s)) };
    inv = { slots: inv.slots.map((s, i) => (i === 1 ? { itemId: 'wood', quantity: 10 } : s)) };
    inv = moveItem(inv, 1, 0);
    expect(itemAt(inv, 0)).toEqual({ itemId: 'wood', quantity: MAX_STACK });
    expect(itemAt(inv, 1)).toEqual({ itemId: 'wood', quantity: 8 });
  });

  it('is a no-op when moving a slot onto itself', () => {
    const inv = addItem(createEmptyInventory(), 'wood', 5).state;
    expect(moveItem(inv, 0, 0)).toBe(inv);
  });

  it('does nothing when the source slot is empty', () => {
    const inv = createEmptyInventory();
    expect(moveItem(inv, 0, 1)).toBe(inv);
  });
});

it('hotbar occupies the first slots of the inventory', () => {
  expect(HOTBAR_SIZE).toBe(12);
});
