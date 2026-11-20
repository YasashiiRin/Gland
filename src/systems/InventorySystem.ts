import { ITEMS, MAX_STACK, type ItemId } from '../data/items';
import { isWeighted, stackKg } from './ProduceSystem';

export interface ItemStack {
  itemId: ItemId;
  quantity: number;
  /** Produce: total weight of the stack in kg (missing = typical weight, see ProduceSystem). */
  kg?: number;
}

/** A stack of `itemId` holding `quantity` units weighing `kg` in all (kg kept only for produce). */
function makeStack(itemId: ItemId, quantity: number, kg: number): ItemStack {
  return isWeighted(itemId) ? { itemId, quantity, kg: Math.round(kg * 100) / 100 } : { itemId, quantity };
}

/** The same stack cut down to `quantity` units, its weight shrunk in proportion (null if none left). */
export function withQuantity(stack: ItemStack, quantity: number): ItemStack | null {
  if (quantity <= 0) return null;
  return makeStack(stack.itemId, quantity, (stackKg(stack) * quantity) / stack.quantity);
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
export function addItem(state: InventoryState, itemId: ItemId, quantity: number, kg?: number): { state: InventoryState; leftover: number } {
  const def = ITEMS[itemId];
  const slots = state.slots.slice();
  let remaining = quantity;
  // Produce: each added unit carries an equal share of the given weight.
  const unitKg = quantity > 0 ? (kg ?? stackKg({ itemId, quantity })) / quantity : 0;

  if (def.stackable) {
    for (let i = 0; i < slots.length && remaining > 0; i++) {
      const slot = slots[i];
      if (slot && slot.itemId === itemId && slot.quantity < MAX_STACK) {
        const add = Math.min(remaining, MAX_STACK - slot.quantity);
        slots[i] = makeStack(itemId, slot.quantity + add, stackKg(slot) + add * unitKg);
        remaining -= add;
      }
    }
  }

  for (let i = 0; i < slots.length && remaining > 0; i++) {
    if (slots[i] === null) {
      const add = def.stackable ? Math.min(remaining, MAX_STACK) : 1;
      slots[i] = makeStack(itemId, add, add * unitKg);
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
  return removeItemKg(state, itemId, quantity).state;
}

/** Removes quantity of an item and tells how much it weighed (produce; 0 otherwise). Throws if there isn't enough. */
export function removeItemKg(state: InventoryState, itemId: ItemId, quantity: number): { state: InventoryState; kg: number } {
  if (!hasItem(state, itemId, quantity)) {
    throw new Error(`Not enough ${itemId} to remove ${quantity}`);
  }
  const slots = state.slots.slice();
  let remaining = quantity;
  let kg = 0;
  for (let i = 0; i < slots.length && remaining > 0; i++) {
    const slot = slots[i];
    if (slot && slot.itemId === itemId) {
      const take = Math.min(remaining, slot.quantity);
      kg += (stackKg(slot) * take) / slot.quantity;
      slots[i] = withQuantity(slot, slot.quantity - take);
      remaining -= take;
    }
  }
  return { state: { slots }, kg: Math.round(kg * 100) / 100 };
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
    const merged = makeStack(src.itemId, total, stackKg(src) + stackKg(dst));
    slots[to] = withQuantity(merged, capped);
    slots[from] = withQuantity(merged, total - capped);
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
