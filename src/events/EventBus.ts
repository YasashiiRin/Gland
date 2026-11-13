import Phaser from 'phaser';
import type { Season, TimeState, Weather } from '../systems/TimeSystem';

/** Global event bus so scenes and systems can talk without importing each other. */
export const EventBus = new Phaser.Events.EventEmitter();

export const GameEvents = {
  MapEntered: 'map:entered',
  TimeTick: 'time:tick',
  DayStarted: 'day:started',
  PassOutRequested: 'time:passOutRequested',
} as const;

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
