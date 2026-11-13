import Phaser from 'phaser';
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
