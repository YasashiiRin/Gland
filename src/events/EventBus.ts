import Phaser from 'phaser';
import type { MinimapData } from '../systems/MinimapSystem';
import type { Season, TimeState, Weather } from '../systems/TimeSystem';

/** Global event bus so scenes and systems can talk without importing each other. */
export const EventBus = new Phaser.Events.EventEmitter();

export const GameEvents = {
  MapEntered: 'map:entered',
  TimeTick: 'time:tick',
  DayStarted: 'day:started',
  PassOutRequested: 'time:passOutRequested',
  ShopOpenRequested: 'shop:openRequested',
  ShopClosedMessage: 'shop:closedMessage',
  ChestOpenRequested: 'chest:openRequested',
  NpcInteracted: 'npc:interacted',
  FishingStarted: 'fishing:started',
  /** settings.zoom changed; world cameras re-apply it. */
  ZoomChanged: 'settings:zoomChanged',
  /** Another player changed the shared farm (payload: WorldPatch); maps redraw what's affected. */
  WorldPatched: 'world:patched',
} as const;

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
