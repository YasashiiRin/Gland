import config from '../data/wildFields.json';
import { SEASON_ORDER } from '../config/time';
import type { TimeState } from './TimeSystem';

/**
 * Village rice fields on the province maps: ripe rice that anyone may reap.
 * A reaped tile stays stubble for the rest of the season and is ripe again
 * when the next season starts. Stored as tile key -> season stamp of the harvest.
 */
export type WildFields = Record<string, number>;

export const WILD_FIELD = config;

/** One number per season of the game (changes when a season or year turns over). */
export function seasonStamp(time: Pick<TimeState, 'season' | 'year'>): number {
  return time.year * SEASON_ORDER.length + SEASON_ORDER.indexOf(time.season);
}

export function wildFieldKey(mapKey: string, x: number, y: number): string {
  return `${mapKey}:${x},${y}`;
}

export function isReaped(fields: WildFields, key: string, stamp: number): boolean {
  return fields[key] === stamp;
}

/**
 * Reaps one tile: how many bundles of rice it gives (often 0: it takes a few
 * tiles for a bundle), or null if it was already reaped this season.
 */
export function reapWildRice(
  fields: WildFields,
  key: string,
  stamp: number,
  random: () => number = Math.random,
): { fields: WildFields; rice: number } | null {
  if (isReaped(fields, key, stamp)) return null;
  const roll = random();
  const rice = roll < WILD_FIELD.doubleChance ? 2 : roll < WILD_FIELD.yieldChance ? 1 : 0;
  return { fields: { ...fields, [key]: stamp }, rice };
}

/** Drops harvests from past seasons (those fields have grown back). */
export function pruneWildFields(fields: WildFields, stamp: number): WildFields {
  const out: WildFields = {};
  for (const [key, s] of Object.entries(fields)) if (s === stamp) out[key] = s;
  return out;
}
