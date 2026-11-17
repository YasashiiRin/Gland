import config from '../data/fishPonds.json';
import type { ItemId } from '../data/items';

/**
 * The prebuilt ponds of the landmark zones: drop fingerlings (cá giống) in,
 * wait a few days for them to grow, then net them out. Fish belong to whoever
 * stocked them. When the season turns the ponds start afresh: fish nobody
 * collected are gone (the pond keeps only its own wild fish, for the rod).
 */
export interface PondStock {
  owner: string;
  /** The fish it grows into. */
  fishId: ItemId;
  /** Absolute day it went into the pond. */
  day: number;
  /** Season stamp (see seasonStamp) it was stocked in. */
  season: number;
}

/** Pond key ("Map:x,y" of the pond's top-left tile) -> what swims in it. */
export type FishPonds = Record<string, PondStock[]>;

export const FISH_POND = config;

export function isFryItem(itemId: string): boolean {
  return itemId in config.fry;
}

/** Which fish a fingerling grows into (random, weighted by repeats in the data). */
export function fishForFry(fryId: string, random: () => number = Math.random): ItemId | null {
  const pool = (config.fry as Record<string, string[]>)[fryId];
  if (!pool?.length) return null;
  return pool[Math.floor(random() * pool.length)] as ItemId;
}

export function ownedBy(ponds: FishPonds, pondKey: string, owner: string): PondStock[] {
  return (ponds[pondKey] ?? []).filter((s) => s.owner === owner);
}

export function isGrown(stock: PondStock, today: number): boolean {
  return today - stock.day >= config.growDays;
}

/** Puts one fingerling in the pond, or null when this owner's share of the pond is full. */
export function stockPond(ponds: FishPonds, pondKey: string, stock: PondStock): FishPonds | null {
  if (ownedBy(ponds, pondKey, stock.owner).length >= config.maxPerOwner) return null;
  return { ...ponds, [pondKey]: [...(ponds[pondKey] ?? []), stock] };
}

export interface PondCatch {
  ponds: FishPonds;
  /** Grown fish netted, by kind. */
  caught: Partial<Record<ItemId, number>>;
  /** This owner's fish still growing, and the days until the next one is ready. */
  growing: number;
  daysLeft: number;
}

/** Nets out every grown fish `owner` stocked in this pond; the young ones stay. */
export function collectPond(ponds: FishPonds, pondKey: string, owner: string, today: number): PondCatch {
  const caught: Partial<Record<ItemId, number>> = {};
  const left: PondStock[] = [];
  let daysLeft = Infinity;
  for (const s of ponds[pondKey] ?? []) {
    if (s.owner === owner && isGrown(s, today)) caught[s.fishId] = (caught[s.fishId] ?? 0) + 1;
    else {
      left.push(s);
      if (s.owner === owner) daysLeft = Math.min(daysLeft, config.growDays - (today - s.day));
    }
  }
  const next = { ...ponds };
  if (left.length) next[pondKey] = left;
  else delete next[pondKey];
  const growing = left.filter((s) => s.owner === owner).length;
  return { ponds: next, caught, growing, daysLeft: growing ? daysLeft : 0 };
}

/** A new season: fish stocked in earlier seasons are gone. */
export function pruneFishPonds(ponds: FishPonds, stamp: number): FishPonds {
  const out: FishPonds = {};
  for (const [key, list] of Object.entries(ponds)) {
    const kept = list.filter((s) => s.season === stamp);
    if (kept.length) out[key] = kept;
  }
  return out;
}
