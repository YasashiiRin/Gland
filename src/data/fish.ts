import fishData from './fish.json';
import type { MapKey } from './maps';
import type { Season, Weather } from '../systems/TimeSystem';

export type FishId = keyof typeof fishData;

export interface FishDef {
  name: string;
  locations: MapKey[];
  season: Season[];
  minHour: number;
  maxHour: number;
  weather: Weather | 'any';
  difficulty: number;
  sellPrice: number;
}

export const FISH: Record<FishId, FishDef> = fishData as Record<FishId, FishDef>;
export const FISH_IDS = Object.keys(fishData) as FishId[];

export function isFishId(value: string): value is FishId {
  return value in fishData;
}
