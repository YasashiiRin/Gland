import { DAY_START_CLOCK_MINUTES } from '../../config/time';
import { absoluteMinute } from '../StatsSystem';
import type { TimeState } from '../TimeSystem';
import type { NpcConfig } from './config';

/**
 * The village families keep the wall clock: a day starts at 0:00 (the game's
 * own day turns over at 6:00). An absolute NPC minute is day * 1440 + minute
 * of the day.
 */
export const MINUTES_PER_DAY = 1440;

export function npcMinute(time: TimeState): number {
  return absoluteMinute(time) + DAY_START_CLOCK_MINUTES;
}

export function dayOf(minute: number): number {
  return Math.floor(minute / MINUTES_PER_DAY);
}

export function clockOfMinute(minute: number): number {
  return ((minute % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}

/** 0 = Monday ... 6 = Sunday; day 1 of the game is `firstWeekday`. */
export function weekdayOf(day: number, cfg: NpcConfig): number {
  return (((day - 1 + cfg.world.firstWeekday) % 7) + 7) % 7;
}

export function isWeekend(day: number, cfg: NpcConfig): boolean {
  return cfg.world.weekendDays.includes(weekdayOf(day, cfg));
}

/** A stable 32-bit hash of a string (FNV-1a). */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** A number in [0, 1) from a seed and a few integers, always the same for the same input. */
export function seededRandom(seed: number, ...parts: number[]): number {
  let h = seed >>> 0;
  for (const p of parts) {
    h = Math.imul(h ^ (p >>> 0), 0x9e3779b1) >>> 0;
    h ^= h >>> 15;
  }
  // mulberry32 finaliser
  let t = (h + 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
