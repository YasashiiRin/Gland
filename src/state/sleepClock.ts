import { restoreBySleep, type EnergyState } from '../systems/EnergySystem';
import { absoluteMinute } from '../systems/StatsSystem';
import { gameState } from './GameState';
import { uiState } from './uiState';

/**
 * Sleeping (the player's rule, 2026-11-20): lying down does not skip to the
 * next day. The clock runs on as usual; every game minute asleep restores a
 * little energy, health and nerve (a full bar in 8 hours: EnergySystem.restoreBySleep)
 * while the stomach empties 60% slower (hungerClock). You get up when you
 * choose, or by yourself once rested.
 */

export function fullyRested(): boolean {
  const full = (b: EnergyState) => b.current >= b.max;
  return full(gameState.energy) && full(gameState.playerHealth);
}

let lastMinute: number | null = null;

/** Called every frame by the UI scene: rests the sleeper by the game time since last frame. */
export function tickSleep(): void {
  const now = absoluteMinute(gameState.time);
  if (!uiState.sleepWait || lastMinute === null || now < lastMinute || now - lastMinute > 24 * 60) {
    lastMinute = now;
    return;
  }
  const minutes = now - lastMinute;
  if (minutes <= 0) return;
  lastMinute = now;
  const hours = minutes / 60;
  gameState.energy = restoreBySleep(gameState.energy, hours);
  gameState.playerHealth = restoreBySleep(gameState.playerHealth, hours);
  gameState.sanity = restoreBySleep(gameState.sanity, hours);
}
