import type { ItemId } from '../data/items';
import type { MapKey } from '../data/maps';
import { createHauntState, createInitialSanity, type HauntState } from '../systems/SanitySystem';
import { createInitialEnergy, createInitialHealth, type EnergyState } from '../systems/EnergySystem';
import type { FarmPlots } from '../systems/FarmingSystem';
import { createEmptyInventory, type InventoryState } from '../systems/InventorySystem';
import type { PlacedObjects } from '../systems/PlacedObjectSystem';
import type { Relationships } from '../systems/RelationshipSystem';
import { createInitialSkills, type SkillXp } from '../systems/SkillSystem';
import { createQuestState, type QuestState } from '../systems/QuestSystem';
import type { ResourceNodes } from '../systems/ResourceSystem';
import type { ActiveBuff } from '../systems/StatsSystem';
import { addVehicle, type OwnedVehicles } from '../systems/VehicleSystem';
import { DEV_GIVE_ALL_VEHICLES } from '../config/dev';
import { vehicleHome, VEHICLE_IDS } from '../data/garage';
import { ITEMS } from '../data/items';
import type { PlayerProfile } from '../net/protocol';
import type { TouchMode } from './touchInput';
import type { HorrorMode } from '../systems/HorrorSystem';
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
  skills: SkillXp;
  communityFund: QuestState;
  /** touch: on-screen phone controls — auto-detect, always on, or off. */
  settings: { muted: boolean; volume: number; zoom: number; touch: TouchMode; horror: HorrorMode };
  /** Timed stat bonuses from food. */
  buffs: ActiveBuff[];
  /** The vehicle the player is riding right now, or null when on foot. */
  riding: ItemId | null;
  /** Vehicles the player owns and where each is parked. */
  vehicles: OwnedVehicles;
  /** Tractor ploughing / harvester cutting is switched on (vs. just driving). */
  vehicleWorking: boolean;
  /** The big storage in the farm warehouse. */
  warehouse: InventoryState;
  /** Cargo of vehicles that carry things (the ox cart), by vehicle id. Shared by everyone. */
  vehicleStorage: Record<string, InventoryState>;
  /** Sanity ("tinh thần"): lost to night scares, restored by sleep and daylight. */
  sanity: EnergyState;
  /** Scares and ghost hits so far tonight (each one hurts more). Reset each morning. */
  haunt: HauntState;
  /** Host only: each guest's inventory/energy/skills, by name, so they keep them between sessions. */
  guestProfiles: Record<string, PlayerProfile>;
}

export const WAREHOUSE_SLOT_COUNT = 36;

export const STATE_VERSION = 11;

/** Default camera zoom (world pixels are drawn this many times larger). */
export const DEFAULT_ZOOM = 2;
export const ZOOM_LEVELS: readonly number[] = [1, 2, 3, 4];

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
    skills: createInitialSkills(),
    communityFund: createQuestState(),
    settings: { muted: false, volume: 0.6, zoom: DEFAULT_ZOOM, touch: 'auto', horror: 'on' },
    buffs: [],
    riding: null,
    vehicles: DEV_GIVE_ALL_VEHICLES ? grantAllVehicles({}) : {},
    vehicleWorking: false,
    warehouse: { slots: Array.from({ length: WAREHOUSE_SLOT_COUNT }, () => null) },
    guestProfiles: {},
    vehicleStorage: {},
    sanity: createInitialSanity(),
    haunt: createHauntState(),
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

/**
 * Loads a save into the shared state. Fields added after the save was made
 * (e.g. buffs, zoom) fall back to their new-game defaults.
 */
export function applyLoadedState(saved: GameState): void {
  const defaults = createInitialState(saved.playerName, saved.farmName);
  Object.assign(gameState, defaults, saved, { settings: { ...defaults.settings, ...saved.settings } });
  // Vehicles used to be inventory items: turn any such item into an owned, parked vehicle.
  let vehicles = gameState.vehicles;
  const slots = gameState.inventory.slots.map((stack) => {
    if (!stack || ITEMS[stack.itemId].category !== 'vehicle') return stack;
    vehicles = addVehicle(vehicles, stack.itemId, vehicleHome(stack.itemId));
    return null;
  });
  gameState.inventory = { slots };
  gameState.vehicles = DEV_GIVE_ALL_VEHICLES ? grantAllVehicles(vehicles) : vehicles;
  if (gameState.riding && !gameState.vehicles[gameState.riding]) gameState.riding = null;
}

function grantAllVehicles(owned: OwnedVehicles): OwnedVehicles {
  return VEHICLE_IDS.reduce((acc, id) => addVehicle(acc, id, vehicleHome(id)), owned);
}

export function resetToNewGame(playerName?: string, farmName?: string): void {
  Object.assign(gameState, createInitialState(playerName, farmName));
}

/** Multiplayer: replaces the shared (farm-wide) parts of the state with the host's copy. */
export function applySharedWorld(world: Partial<GameState>): void {
  Object.assign(gameState, structuredClone(world));
}
