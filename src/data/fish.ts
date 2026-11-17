import fishData from './fish.json';
import type { MapKey } from './maps';
import type { Season, Weather } from '../systems/TimeSystem';

export type FishId = keyof typeof fishData;

/** How a fish swims in the reel-in minigame. */
export type FishBehavior = 'smooth' | 'dart' | 'sinker' | 'floater' | 'mixed';
/** Fresh water (rivers, lakes, ponds) or the sea. */
export type FishWater = 'fresh' | 'sea';

export interface FishDef {
  name: string;
  locations: MapKey[];
  season: Season[];
  minHour: number;
  maxHour: number;
  weather: Weather | 'any';
  difficulty: number;
  sellPrice: number;
  behavior: FishBehavior;
  water: FishWater;
}

export const FISH: Record<FishId, FishDef> = fishData as Record<FishId, FishDef>;
export const FISH_IDS = Object.keys(fishData) as FishId[];

export function isFishId(value: string): value is FishId {
  return value in fishData;
}
