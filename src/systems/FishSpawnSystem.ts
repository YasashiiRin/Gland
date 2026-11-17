import { FISH, FISH_IDS, type FishId, type FishWater } from '../data/fish';
import type { MapKey } from '../data/maps';
import type { InventoryState } from './InventorySystem';
import { countItem, removeItem } from './InventorySystem';
import type { Season, Weather } from './TimeSystem';

export interface FishContext {
  mapKey: MapKey;
  season: Season;
  hour: number;
  weather: Weather;
  /** Fresh water or the sea; leave out to allow both. */
  water?: FishWater;
}

/** Every fish valid right now for this spot/time, in no particular order. */
export function validFish(ctx: FishContext): FishId[] {
  return FISH_IDS.filter((id) => {
    const def = FISH[id];
    return (
      def.locations.includes(ctx.mapKey) &&
      def.season.includes(ctx.season) &&
      ctx.hour >= def.minHour &&
      ctx.hour < def.maxHour &&
      (def.weather === 'any' || def.weather === ctx.weather) &&
      (ctx.water === undefined || def.water === ctx.water)
    );
  });
}

/**
 * Picks one valid fish, or null if nothing bites. Common (easy) fish are
 * picked more often than rare (hard) ones: weight = 110 - difficulty.
 */
export function pickFish(ctx: FishContext, random: () => number = Math.random): FishId | null {
  const options = validFish(ctx);
  if (options.length === 0) return null;
  const weights = options.map((id) => Math.max(10, 110 - FISH[id].difficulty));
  let roll = random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < options.length; i++) {
    roll -= weights[i];
    if (roll < 0) return options[i];
  }
  return options[options.length - 1];
}

// ------------------------------------------------------------------ bait

/** How many worms fit on the rod at once. */
export const MAX_BAIT = 20;

/** Moves worms from the bag onto the rod (up to MAX_BAIT on the rod). */
export function attachBait(inventory: InventoryState, onRod: number): { inventory: InventoryState; onRod: number; moved: number } {
  const moved = Math.min(countItem(inventory, 'worm'), MAX_BAIT - onRod);
  if (moved <= 0) return { inventory, onRod, moved: 0 };
  return { inventory: removeItem(inventory, 'worm', moved), onRod: onRod + moved, moved };
}

/** Chance that a swing of the hoe turns up a worm. */
export const WORM_CHANCE = 0.12;

export function digsWorm(random: () => number = Math.random): boolean {
  return random() < WORM_CHANCE;
}

// ------------------------------------------------------------------ waiting for a bite

/** Seconds from the cast until a fish bites (shorter for a better fisher). */
export function biteDelay(level: number, random: () => number = Math.random): number {
  return 2 + random() * 6 * (1 - Math.min(10, level) * 0.04);
}

/** Seconds you have to strike after the "!" before the fish spits the bait out. */
export function strikeWindow(difficulty: number): number {
  return Math.max(0.35, 0.8 - difficulty * 0.004);
}
