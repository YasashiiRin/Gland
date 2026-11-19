import config from '../data/hunger.json';
import { DAY_LENGTH_MINUTES } from '../config/time';
import type { EnergyState } from './EnergySystem';

/**
 * Hunger ("no / đói"), in the spirit of Don't Starve: the stomach empties a
 * little every game minute, day and night (sleeping too). Eating fills it
 * back. With an empty stomach you lose health until you eat or faint.
 */
export const HUNGER = config;
/** A game day (6:00 to 2:00 the next night) empties the stomach by `perDay`. */
const MINUTES_PER_DAY = DAY_LENGTH_MINUTES;

/** How fast the stomach empties while asleep, compared with awake (60% slower). */
export const SLEEP_HUNGER = 0.4;

export function createInitialHunger(): EnergyState {
  return { current: config.max, max: config.max };
}

/** The stomach after `minutes` of game time. */
export function drainHunger(hunger: EnergyState, minutes: number): EnergyState {
  if (minutes <= 0) return hunger;
  return { ...hunger, current: Math.max(0, hunger.current - (config.perDay * minutes) / MINUTES_PER_DAY) };
}

/** Health lost over `minutes` spent starving (only while the stomach is empty). */
export function starvationDamage(hunger: EnergyState, minutes: number): number {
  return hunger.current <= 0 && minutes > 0 ? (config.starveHealthPerHour * minutes) / 60 : 0;
}

export function feed(hunger: EnergyState, amount: number): EnergyState {
  return { ...hunger, current: Math.min(hunger.max, hunger.current + amount) };
}

/** How full the stomach is, 0..1. */
export function hungerRatio(hunger: EnergyState): number {
  return hunger.max > 0 ? hunger.current / hunger.max : 0;
}
