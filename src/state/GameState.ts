import type { ItemId } from '../data/items';
import type { MapKey } from '../data/maps';
import { createInitialEnergy, type EnergyState } from '../systems/EnergySystem';
import { createEmptyInventory, type InventoryState } from '../systems/InventorySystem';
import { createInitialTime, type TimeState } from '../systems/TimeSystem';

/**
 * Single source of truth for everything that will be saved.
 * Must stay JSON-serializable (no class instances, no Phaser objects).
 */
export interface GameState {
  version: number;
  currentMap: MapKey;
  spawnId: string;
  time: TimeState;
  money: number;
  inventory: InventoryState;
  energy: EnergyState;
  /** Index of the currently selected hotbar slot (0-11). */
  equippedSlot: number;
}

export const STATE_VERSION = 3;

const STARTING_ITEMS: { itemId: ItemId; quantity: number }[] = [
  { itemId: 'hoe', quantity: 1 },
  { itemId: 'watering_can', quantity: 1 },
  { itemId: 'axe', quantity: 1 },
  { itemId: 'pickaxe', quantity: 1 },
  { itemId: 'scythe', quantity: 1 },
  { itemId: 'parsnip_seeds', quantity: 15 },
];

export function createInitialState(): GameState {
  let inventory = createEmptyInventory();
  for (const { itemId, quantity } of STARTING_ITEMS) {
    inventory = addStartingItem(inventory, itemId, quantity);
  }
  return {
    version: STATE_VERSION,
    currentMap: 'House',
    spawnId: 'default',
    time: createInitialTime(),
    money: 500,
    inventory,
    energy: createInitialEnergy(),
    equippedSlot: 0,
  };
}

function addStartingItem(inventory: InventoryState, itemId: ItemId, quantity: number): InventoryState {
  const slots = inventory.slots.slice();
  const emptyIndex = slots.findIndex((s) => s === null);
  if (emptyIndex === -1) return inventory;
  slots[emptyIndex] = { itemId, quantity };
  return { slots };
}

/** Shared in-memory state for this session. SaveService will persist it in Phase 5. */
export const gameState: GameState = createInitialState();
