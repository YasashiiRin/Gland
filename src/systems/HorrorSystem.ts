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

/** Clock hour on the game's 6:00–26:00 day (e.g. 25 = 1 AM). */
export function clockHour(time: TimeState): number {
  return 6 + Math.floor(time.elapsedMinutes / 60);
}

export function isHorrorNight(time: TimeState): boolean {
  const h = clockHour(time);
  return h >= horror.startHour && h < horror.endHour;
}

/**
 * Chance that something happens during this hour of the night: 40% at 8 PM,
 * +10% per hour after that (90% by 1 AM). Halved in mild mode, zero when off.
 */
export function horrorChance(time: TimeState, mode: HorrorMode): number {
  if (mode === 'off' || !isHorrorNight(time)) return 0;
  const hoursIn = clockHour(time) - horror.startHour;
  const chance = Math.min(horror.maxChance, horror.baseChance + hoursIn * horror.chancePerHour);
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
