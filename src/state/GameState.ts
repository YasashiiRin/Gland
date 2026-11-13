import type { MapKey } from '../data/maps';

/**
 * Single source of truth for everything that will be saved.
 * Must stay JSON-serializable (no class instances, no Phaser objects).
 */
export interface GameState {
  version: number;
  currentMap: MapKey;
  spawnId: string;
}

export const STATE_VERSION = 1;

export function createInitialState(): GameState {
  return { version: STATE_VERSION, currentMap: 'House', spawnId: 'default' };
}

/** Shared in-memory state for this session. SaveService will persist it in Phase 5. */
export const gameState: GameState = createInitialState();
