import { absoluteMinute } from '../systems/StatsSystem';
import { absoluteDayNumber } from '../systems/TimeSystem';
import { dailyRecovery, regenOverTime, type RestState } from '../systems/StaminaSystem';
import { gameState } from './GameState';

/** Runtime only (never saved): real seconds spent resting at 0 energy. */
export const restState: RestState = { seconds: 0 };

let lastMinute: number | null = null;
let lastDay: number | null = null;

/**
 * Called every frame by the UI scene: energy regenerates 1.5% an hour of
 * game time while it's above 0, and each new day tops the recovery bar up by 30%.
 */
export function tickStamina(): void {
  // The recovery bar is as big as the energy bar.
  if (gameState.recovery.max !== gameState.energy.max) {
    gameState.recovery = { max: gameState.energy.max, current: Math.min(gameState.recovery.current, gameState.energy.max) };
  }
  const now = absoluteMinute(gameState.time);
  const day = absoluteDayNumber(gameState.time);
  if (lastMinute === null || lastDay === null || now < lastMinute) {
    lastMinute = now; // first frame, a loaded save or a new game: start counting from here
    lastDay = day;
    return;
  }
  const minutes = now - lastMinute;
  if (minutes > 0) {
    lastMinute = now;
    gameState.energy = regenOverTime(gameState.energy, minutes);
  }
  if (day > lastDay) {
    gameState.recovery = dailyRecovery(gameState.recovery, day - lastDay);
    lastDay = day;
  }
}

/** A new game or a loaded save: don't count the time in between. */
export function resetStaminaClock(): void {
  lastMinute = null;
  lastDay = null;
  restState.seconds = 0;
}
