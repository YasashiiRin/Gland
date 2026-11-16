import horror from '../data/horror.json';
import type { TimeState } from './TimeSystem';

/** "on" = full horror, "mild" = rarer and no jump scares, "off" = none. */
export type HorrorMode = 'on' | 'mild' | 'off';

export type HorrorEventId = keyof typeof horror.events;

interface EventDef {
  weight: number;
  where: 'outdoor' | 'indoor' | 'any';
  fromHour?: number;
  needsWater?: boolean;
  intenseOnly?: boolean;
}

const EVENTS = horror.events as Record<HorrorEventId, EventDef>;
export const HORROR_EVENT_IDS = Object.keys(EVENTS) as HorrorEventId[];
export const WHISPERS: readonly string[] = horror.whispers;

/** Clock hour on the game's 6:00–30:00 day (e.g. 25 = 1 AM, 29 = 5 AM). */
export function clockHour(time: TimeState): number {
  return 6 + Math.floor(time.elapsedMinutes / 60);
}

export function isHorrorNight(time: TimeState): boolean {
  const h = clockHour(time);
  return h >= horror.startHour && h < horror.endHour;
}

/** Game minutes between two rolls for a haunting (so the night keeps coming at you). */
export const HORROR_ROLL_MINUTES = horror.rollEveryMinutes;

/** Which roll window of the night we're in; a new value means "roll again". */
export function horrorRollSlot(time: TimeState): number {
  return Math.floor(time.elapsedMinutes / HORROR_ROLL_MINUTES);
}

/**
 * Trees make it worse: open fields ×0.6, the thick of a bamboo grove or the
 * forest edge up to ×1.6 (scaled by tree tiles within a few steps of you).
 */
export function treeChanceMultiplier(treesNearby: number): number {
  const t = horror.trees;
  const k = Math.min(1, Math.max(0, treesNearby) / t.fullAt);
  return t.minMultiplier + (t.maxMultiplier - t.minMultiplier) * k;
}

export const TREE_SCAN_RADIUS = horror.trees.radius;

/**
 * Chance of a haunting in each half-hour roll: 15% at 8 PM, +6% per hour
 * until 5 AM, times the tree factor, capped at 85%. Halved in mild mode,
 * zero when off.
 */
export function horrorChance(time: TimeState, mode: HorrorMode, treesNearby = 0): number {
  if (mode === 'off' || !isHorrorNight(time)) return 0;
  const hoursIn = (time.elapsedMinutes - (horror.startHour - 6) * 60) / 60;
  const base = horror.baseChance + hoursIn * horror.chancePerHour;
  const chance = Math.min(horror.maxChance, base * treeChanceMultiplier(treesNearby));
  return mode === 'mild' ? chance * horror.mildChanceMultiplier : chance;
}

/** 0 (just after dusk) … 1 (deepest night): drives heartbeat, vignette and drone. */
export function nightDread(time: TimeState): number {
  if (!isHorrorNight(time)) return 0;
  const span = (horror.endHour - horror.startHour) * 60;
  return Math.min(1, (time.elapsedMinutes - (horror.startHour - 6) * 60) / span);
}

export interface HorrorContext {
  indoor: boolean;
  nearWater: boolean;
  hour: number;
  mode: HorrorMode;
  /** The last event, so the same thing doesn't happen twice in a row. */
  last?: HorrorEventId;
}

export function eligibleEvents(ctx: HorrorContext): HorrorEventId[] {
  return HORROR_EVENT_IDS.filter((id) => {
    const e = EVENTS[id];
    if (e.where === 'outdoor' && ctx.indoor) return false;
    if (e.where === 'indoor' && !ctx.indoor) return false;
    if (e.needsWater && !ctx.nearWater) return false;
    if (e.fromHour !== undefined && ctx.hour < e.fromHour) return false;
    if (e.intenseOnly && ctx.mode !== 'on') return false;
    return id !== ctx.last;
  });
}

/** Weighted random pick among the events that fit where and when the player is. */
export function pickHorrorEvent(ctx: HorrorContext, random: () => number = Math.random): HorrorEventId | null {
  const pool = eligibleEvents(ctx);
  const total = pool.reduce((sum, id) => sum + EVENTS[id].weight, 0);
  if (total <= 0) return null;
  let roll = random() * total;
  for (const id of pool) {
    roll -= EVENTS[id].weight;
    if (roll < 0) return id;
  }
  return pool[pool.length - 1];
}
