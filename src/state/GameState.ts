import type { ItemId } from '../data/items';
import type { MapKey } from '../data/maps';
import { createInitialEnergy, createInitialHealth, type EnergyState } from '../systems/EnergySystem';
import type { FarmPlots } from '../systems/FarmingSystem';
import { createEmptyInventory, type InventoryState } from '../systems/InventorySystem';
import type { PlacedObjects } from '../systems/PlacedObjectSystem';
import type { Relationships } from '../systems/RelationshipSystem';
import type { ResourceNodes } from '../systems/ResourceSystem';
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
  /** Tilled/planted plots on the Farm map, keyed by "x,y" tile coordinates. */
  farmPlots: FarmPlots;
  /** Items placed in the shipping bin, sold automatically when the next day starts. */
  shippingBin: Partial<Record<ItemId, number>>;
  playerName: string;
  farmName: string;
  /** Trees/rocks/weeds that have been chopped/mined/cut, keyed by "mapKey:x,y". */
  resourceNodes: ResourceNodes;
  /** Chests, scarecrows and sprinklers the player has placed, keyed by "mapKey:x,y". */
  placedObjects: PlacedObjects;
  relationships: Relationships;
  playerHealth: EnergyState;
  /** Deepest mine floor reached so far (persisted across visits). */
  deepestFloor: number;
}

export const STATE_VERSION = 9;

const STARTING_ITEMS: { itemId: ItemId; quantity: number }[] = [
  { itemId: 'hoe', quantity: 1 },
  { itemId: 'watering_can', quantity: 1 },
  { itemId: 'axe', quantity: 1 },
  { itemId: 'pickaxe', quantity: 1 },
  { itemId: 'scythe', quantity: 1 },
  { itemId: 'sword', quantity: 1 },
  { itemId: 'parsnip_seeds', quantity: 15 },
  { itemId: 'potato_seeds', quantity: 10 },
  { itemId: 'cauliflower_seeds', quantity: 5 },
  { itemId: 'strawberry_seeds', quantity: 5 },
  { itemId: 'green_bean_seeds', quantity: 10 },
];

export function createInitialState(playerName = 'Nông dân', farmName = 'Nông trại nhỏ'): GameState {
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
    farmPlots: {},
    shippingBin: {},
    playerName,
    farmName,
    resourceNodes: {},
    placedObjects: {},
    relationships: {},
    playerHealth: createInitialHealth(),
    deepestFloor: 0,
  };
}

function addStartingItem(inventory: InventoryState, itemId: ItemId, quantity: number): InventoryState {
  const slots = inventory.slots.slice();
  const emptyIndex = slots.findIndex((s) => s === null);
  if (emptyIndex === -1) return inventory;
  slots[emptyIndex] = { itemId, quantity };
  return { slots };
}

/**
 * Shared in-memory state for this session. It's one mutable object so every
 * module that imported `gameState` keeps seeing updates; loading a save or
 * starting a new game therefore mutates this object in place rather than
 * rebinding the export (which other modules wouldn't see).
 */
export const gameState: GameState = createInitialState();

export function applyLoadedState(saved: GameState): void {
  Object.assign(gameState, saved);
}

export function resetToNewGame(playerName?: string, farmName?: string): void {
  Object.assign(gameState, createInitialState(playerName, farmName));
}
