import { DAY_LENGTH_MINUTES } from '../config/time';
import { absoluteDayNumber, type TimeState } from './TimeSystem';

/**
 * Stat bonuses an item can give. Values are additive fractions:
 * speed 0.3 = +30% movement speed, -0.05 = 5% slower.
 */
export interface ItemStats {
  speed?: number;
}

/** A timed bonus, e.g. from food. Expires at an absolute game minute. */
export interface ActiveBuff {
  itemId: string;
  stats: ItemStats;
  untilMinute: number;
}

/** Never slower than this, however many penalties stack up. */
export const MIN_SPEED_MULTIPLIER = 0.3;

/** Game minutes since the very first morning; buffs use it so they survive day changes. */
export function absoluteMinute(time: TimeState): number {
  return absoluteDayNumber(time) * DAY_LENGTH_MINUTES + time.elapsedMinutes;
}

export function activeBuffs(buffs: readonly ActiveBuff[], now: number): ActiveBuff[] {
  return buffs.filter((b) => b.untilMinute > now);
}

/** Adds a buff; eating the same thing again refreshes it instead of stacking. */
export function addBuff(
  buffs: readonly ActiveBuff[],
  itemId: string,
  stats: ItemStats,
  durationMinutes: number,
  now: number,
): ActiveBuff[] {
  const others = activeBuffs(buffs, now).filter((b) => b.itemId !== itemId);
  return [...others, { itemId, stats, untilMinute: now + durationMinutes }];
}

/** Movement speed multiplier from every stat source in effect (vehicle, held weapon, buffs). */
export function speedMultiplier(sources: readonly (ItemStats | undefined)[]): number {
  const bonus = sources.reduce((sum, s) => sum + (s?.speed ?? 0), 0);
  return Math.max(MIN_SPEED_MULTIPLIER, 1 + bonus);
}
