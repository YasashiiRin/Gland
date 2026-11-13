import type { MapKey } from '../data/maps';
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
}

export const STATE_VERSION = 2;

export function createInitialState(): GameState {
  return { version: STATE_VERSION, currentMap: 'House', spawnId: 'default', time: createInitialTime() };
}

/** Shared in-memory state for this session. SaveService will persist it in Phase 5. */
export const gameState: GameState = createInitialState();
