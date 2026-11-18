import { EventBus, GameEvents } from '../events/EventBus';
import { consume } from '../systems/EnergySystem';
import { drainHunger, starvationDamage } from '../systems/HungerSystem';
import { absoluteMinute } from '../systems/StatsSystem';
import { gameState } from './GameState';

/** Longer jumps than this (sleep, loading) never starve you to fainting: you wake weak, not out cold. */
const SKIP_MINUTES = 30;
let lastMinute: number | null = null;

/**
 * Called every frame by the UI scene: empties the stomach by however much
 * game time has passed since last time (clock ticks, sleep, the host's clock
 * for guests) and, on an empty stomach, takes health.
 */
export function tickHunger(): void {
  const now = absoluteMinute(gameState.time);
  if (lastMinute === null || now < lastMinute || now - lastMinute > 24 * 60) {
    lastMinute = now; // first frame, a loaded save or a new game: start counting from here
    return;
  }
  const minutes = now - lastMinute;
  if (minutes <= 0) return;
  lastMinute = now;
  gameState.hunger = drainHunger(gameState.hunger, minutes);
  const damage = starvationDamage(gameState.hunger, minutes);
  if (damage <= 0) return;
  if (minutes > SKIP_MINUTES) {
    gameState.playerHealth = { ...gameState.playerHealth, current: Math.max(1, gameState.playerHealth.current - damage) };
    return;
  }
  gameState.playerHealth = consume(gameState.playerHealth, damage);
  if (gameState.playerHealth.current <= 0) EventBus.emit(GameEvents.PlayerFainted);
}

/** A new game or a loaded save: don't charge the time in between. */
export function resetHungerClock(): void {
  lastMinute = null;
}
