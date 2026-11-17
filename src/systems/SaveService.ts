import { STATE_VERSION, type GameState } from '../state/GameState';

const SAVE_KEY = 'farm-game-save';

function storageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function hasSave(): boolean {
  if (!storageAvailable()) return false;
  try {
    return localStorage.getItem(SAVE_KEY) !== null;
  } catch {
    return false;
  }
}

export function save(state: GameState): void {
  if (!storageAvailable()) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save the game:', e);
  }
}

/**
 * Loads the save, or null if there isn't one or it can't be used (corrupted,
 * or written by an incompatible older/newer version of the save format).
 */
export function load(): GameState | null {
  if (!storageAvailable()) return null;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (parsed.version !== STATE_VERSION) {
      console.warn(`Save is version ${parsed.version}, expected ${STATE_VERSION}; starting a new game instead.`);
      return null;
    }
    parsed.wildFields ??= {}; // added after save version 11 shipped; older saves just lack it
    parsed.rodBait ??= 0; // fishing bait, farm animals and boats came later still
    parsed.livestock ??= [];
    parsed.boats ??= {};
    parsed.boating = null;
    return parsed;
  } catch (e) {
    console.warn('Could not read the save file:', e);
    return null;
  }
}

export function clearSave(): void {
  if (!storageAvailable()) return;
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* ignore */
  }
}
