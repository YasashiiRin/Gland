import { ITEMS, MAX_STACK, type ItemId } from '../data/items';

export interface ItemStack {
  itemId: ItemId;
  quantity: number;
}

export type Slot = ItemStack | null;

export const HOTBAR_SIZE = 12;
export const BACKPACK_SIZE = 24;
export const INVENTORY_SIZE = HOTBAR_SIZE + BACKPACK_SIZE;

export interface InventoryState {
  slots: Slot[];
}

export function createEmptyInventory(): InventoryState {
  return { slots: new Array(INVENTORY_SIZE).fill(null) };
}

/**
 * Adds quantity of an item, stacking onto existing non-full stacks first,
 * then filling empty slots. Mutates nothing; returns a new state plus the
 * quantity that didn't fit (0 if everything was added).
 */
export function addItem(state: InventoryState, itemId: ItemId, quantity: number): { state: InventoryState; leftover: number } {
  const def = ITEMS[itemId];
  const slots = state.slots.slice();
  let remaining = quantity;

  if (def.stackable) {
    for (let i = 0; i < slots.length && remaining > 0; i++) {
      const slot = slots[i];
      if (slot && slot.itemId === itemId && slot.quantity < MAX_STACK) {
        const add = Math.min(remaining, MAX_STACK - slot.quantity);
        slots[i] = { itemId, quantity: slot.quantity + add };
        remaining -= add;
      }
    }
  }

  for (let i = 0; i < slots.length && remaining > 0; i++) {
    if (slots[i] === null) {
      const add = def.stackable ? Math.min(remaining, MAX_STACK) : 1;
      slots[i] = { itemId, quantity: add };
      remaining -= add;
      if (!def.stackable && remaining > 0) {
        // Non-stackable items occupy one slot per unit; loop will find more empty slots.
        continue;
      }
    }
  }

  return { state: { slots }, leftover: remaining };
}

export function hasItem(state: InventoryState, itemId: ItemId, quantity: number): boolean {
  const total = state.slots.reduce((sum, s) => (s && s.itemId === itemId ? sum + s.quantity : sum), 0);
  return total >= quantity;
}

/** Removes quantity of an item across slots. Throws if there isn't enough. */
export function removeItem(state: InventoryState, itemId: ItemId, quantity: number): InventoryState {
  if (!hasItem(state, itemId, quantity)) {
    throw new Error(`Not enough ${itemId} to remove ${quantity}`);
  }
  const slots = state.slots.slice();
  let remaining = quantity;
  for (let i = 0; i < slots.length && remaining > 0; i++) {
    const slot = slots[i];
    if (slot && slot.itemId === itemId) {
      const take = Math.min(remaining, slot.quantity);
      const left = slot.quantity - take;
      slots[i] = left > 0 ? { itemId, quantity: left } : null;
      remaining -= take;
    }
  }
  return { slots };
}

/**
 * Moves/combines the contents of one slot into another (used by drag-and-drop
 * and hotbar reordering). Swaps if the destination holds a different item or
 * a non-stackable item; merges quantities if it's the same stackable item.
 */
export function moveItem(state: InventoryState, from: number, to: number): InventoryState {
  if (from === to) return state;
  const slots = state.slots.slice();
  const src = slots[from];
  const dst = slots[to];
  if (!src) return state;

  const def = ITEMS[src.itemId];
  if (dst && dst.itemId === src.itemId && def.stackable) {
    const total = src.quantity + dst.quantity;
    const capped = Math.min(total, MAX_STACK);
    slots[to] = { itemId: src.itemId, quantity: capped };
    slots[from] = total > capped ? { itemId: src.itemId, quantity: total - capped } : null;
  } else {
    slots[to] = src;
    slots[from] = dst;
  }
  return { slots };
}

export function itemAt(state: InventoryState, slot: number): Slot {
  return state.slots[slot] ?? null;
}

export function countItem(state: InventoryState, itemId: ItemId): number {
  return state.slots.reduce((n, s) => n + (s?.itemId === itemId ? s.quantity : 0), 0);
}

/** Largest inventory possible (base + the biggest backpack); the bag screen is laid out for this. */
export const MAX_INVENTORY_SIZE = INVENTORY_SIZE + 24;

/** Wearing a backpack: grow the inventory to `size` slots (never shrinks, never loses items). */
export function expandInventory(state: InventoryState, size: number): InventoryState {
  if (size <= state.slots.length) return state;
  return { slots: [...state.slots, ...new Array(size - state.slots.length).fill(null)] };
}
