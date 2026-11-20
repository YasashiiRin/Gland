import { changedBindings, resolveBindings, type KeyBindings } from '../systems/KeyBindings';
import { gameState } from './GameState';

/**
 * Runtime side of the rebindable keys: `version` goes up whenever the
 * bindings change (scenes rebuild their keys), `capturing` while the key
 * menu waits for a key, `flushPending` to drop the key press just captured.
 */
export const controlsState = { version: 0, capturing: false, flushPending: false };

export function currentBindings(): KeyBindings {
  return resolveBindings(gameState.settings.keys);
}

export function saveBindings(bindings: KeyBindings): void {
  gameState.settings.keys = changedBindings(bindings);
  controlsState.version++;
}
