import type { ProfessionState } from '../systems/ProfessionSystem';
import type { FamilyState } from '../systems/npc/types';
import type { HomeHouses, Homes } from '../systems/HomeSystem';
import { createInitialHunger } from '../systems/HungerSystem';
import { pickStart } from '../data/startPoints';
import type { FishPonds } from '../systems/FishPondSystem';
import type { WildFields } from '../systems/WildFieldSystem';
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
import type { Livestock } from '../systems/LivestockSystem';
import type { BoatSpot } from '../systems/BoatSystem';
import { CAN_CAPACITY } from '../systems/WateringCanSystem';
import type { GroundEdits } from '../systems/GroundSystem';

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
  /** Waterings left in my watering can (refilled next to water, see WateringCanSystem). */
  wateringCanWater: number;
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
  /** Village rice fields reaped this season (see WildFieldSystem). */
  wildFields: WildFields;
  /** Fingerlings stocked in the landmark ponds, by pond. */
  fishPonds: FishPonds;
  /** Who lives in which homestead (shared): "QuangBinh:qb12" -> player name. */
  homes: Homes;
  /** Houses players have rebuilt (shared): home key -> house sprite. */
  homeHouses: HomeHouses;
  /** The village farm families (shared): home key -> people, field cells, buffalo, piles (systems/npc). */
  npcFamilies: Record<string, FamilyState>;
  /** Dirt paths and paving the player made in the grass (shared): "Map:x,y" -> path (GroundSystem). */
  groundEdits: GroundEdits;
  /** The player's profession (personal): null until a talisman is used. */
  profession: ProfessionState | null;
  /** Things lying on the ground to pick up (shared): "Map:x,y" -> item. */
  groundItems: Record<string, { itemId: ItemId; day: number }>;
  /** The last day each map rolled for new talismans / books (shared). */
  groundRolls: Record<string, number>;
  /** Chests, scarecrows and sprinklers the player has placed, keyed by "mapKey:x,y". */
  placedObjects: PlacedObjects;
  relationships: Relationships;
  playerHealth: EnergyState;
  /** Hunger (Don't Starve style): 150 when full, empties over the day; 0 = starving. */
  hunger: EnergyState;
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
  /** Worms attached to the fishing rod (one is used per bite). */
  rodBait: number;
  /** Farm animals the player has bought (they roam where they were left). */
  livestock: Livestock[];
  /** Rowing boats moved from their moorings: boat id -> where it was left (pixels). */
  boats: Record<string, BoatSpot>;
  /** The boat the player is rowing right now, or null. */
  boating: string | null;
}

export const WAREHOUSE_SLOT_COUNT = 36;

/** 12: big world (no farm/town maps, start point, sleeping mat); older saves start over. */
export const STATE_VERSION = 12;

/** Default camera zoom (world pixels are drawn this many times larger). */
export const DEFAULT_ZOOM = 2;
export const ZOOM_LEVELS: readonly number[] = [1, 2, 3, 4];

/** A new game starts with just the four basic tools (everything else is bought or made). */
const STARTING_ITEMS: { itemId: ItemId; quantity: number }[] = [
  { itemId: 'hoe', quantity: 1 },
  { itemId: 'axe', quantity: 1 },
  { itemId: 'pickaxe', quantity: 1 },
  { itemId: 'watering_can', quantity: 1 },
];

export function createInitialState(playerName = 'Nông dân', farmName = 'Nông trại nhỏ'): GameState {
  let inventory = createEmptyInventory();
  for (const { itemId, quantity } of STARTING_ITEMS) {
    inventory = addStartingItem(inventory, itemId, quantity);
  }
  return {
    version: STATE_VERSION,
    currentMap: 'QuangBinh',
    spawnId: 'default',
    time: createInitialTime(),
    money: 500,
    inventory,
    wateringCanWater: CAN_CAPACITY,
    energy: createInitialEnergy(),
    equippedSlot: 0,
    farmPlots: {},
    shippingBin: {},
    playerName,
    farmName,
    resourceNodes: {},
    wildFields: {},
    fishPonds: {},
    homes: {},
    homeHouses: {},
    npcFamilies: {},
    groundEdits: {},
    profession: null,
    groundItems: {},
    groundRolls: {},
    placedObjects: {},
    relationships: {},
    playerHealth: createInitialHealth(),
    hunger: createInitialHunger(),
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
    rodBait: 0,
    livestock: [],
    boats: {},
    boating: null,
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

/** A fresh game, beginning somewhere in the open country of the chosen province (Quảng Bình by default). */
export function resetToNewGame(playerName?: string, farmName?: string, provinceId?: string): void {
  Object.assign(gameState, createInitialState(playerName, farmName));
  const start = pickStart(provinceId);
  gameState.currentMap = start.mapKey;
  gameState.spawnId = start.spawn;
}

/** Multiplayer: replaces the shared (farm-wide) parts of the state with the host's copy. */
export function applySharedWorld(world: Partial<GameState>): void {
  Object.assign(gameState, structuredClone(world));
}
