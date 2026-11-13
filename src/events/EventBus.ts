import Phaser from 'phaser';

/** Global event bus so scenes and systems can talk without importing each other. */
export const EventBus = new Phaser.Events.EventEmitter();

export const GameEvents = {
  MapEntered: 'map:entered',
} as const;

export interface MapEnteredPayload {
  mapKey: string;
  displayName: string;
}
