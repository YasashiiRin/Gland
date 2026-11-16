import Phaser from 'phaser';
import type { MinimapData } from '../systems/MinimapSystem';
import type { Season, TimeState, Weather } from '../systems/TimeSystem';

/** Global event bus so scenes and systems can talk without importing each other. */
export const EventBus = new Phaser.Events.EventEmitter();

export const GameEvents = {
  MapEntered: 'map:entered',
  TimeTick: 'time:tick',
  DayStarted: 'day:started',
  /** The clock reached 6:00 with the day still running: start the new day. */
  DawnReached: 'time:dawnReached',
  /** A ghost knocked the player's health to 0. */
  PlayerFainted: 'player:fainted',
  ShopOpenRequested: 'shop:openRequested',
  ShopClosedMessage: 'shop:closedMessage',
  ChestOpenRequested: 'chest:openRequested',
  NpcInteracted: 'npc:interacted',
  FishingStarted: 'fishing:started',
  /** settings.zoom changed; world cameras re-apply it. */
  ZoomChanged: 'settings:zoomChanged',
  /** Another player changed the shared farm (payload: WorldPatch); maps redraw what's affected. */
  WorldPatched: 'world:patched',
  /** Multiplayer: the player lay down in bed and waits for everyone else. */
  SleepWaitRequested: 'sleep:waitRequested',
  /** A screen-wide horror effect for the UI (payload: HorrorScreenPayload). */
  HorrorScreen: 'horror:screen',
  /** Open the crafting screen for a bench (payload: { station }). */
  CraftingOpenRequested: 'crafting:openRequested',
} as const;

export interface HorrorScreenPayload {
  kind: 'flicker' | 'caption' | 'jumpscare' | 'clockGlitch';
  text?: string;
}

export interface FishingStartedPayload {
  fishId: string;
}

export interface NpcInteractedPayload {
  npcId: string;
  kind: 'talk' | 'gift';
  line: string;
}

export interface ShopOpenRequestedPayload {
  shopId: string;
}

export interface ChestOpenRequestedPayload {
  chestKey: string;
}

export interface MapEnteredPayload {
  mapKey: string;
  displayName: string;
  /** Overview for the minimap; absent for places without one (the mine). */
  minimap?: MinimapData;
}

export interface TimeTickPayload {
  time: TimeState;
}

export interface DayStartedPayload {
  time: TimeState;
  day: number;
  season: Season;
  year: number;
  weather: Weather;
  earnings: number;
}
