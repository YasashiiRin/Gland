import provinces from './startPoints.json';
import type { MapKey } from './maps';

/**
 * A province a new game can begin in. The player starts at one of its
 * "spawn_<id>" points, picked at random: always out in the open country,
 * never inside a safe zone (landmarks and towns).
 */
export interface StartProvince {
  id: string;
  name: string;
  mapKey: MapKey;
  spawns: string[];
  blurb: string;
}

export const START_PROVINCES: readonly StartProvince[] = provinces as StartProvince[];

export function startProvince(id: string | undefined): StartProvince {
  return START_PROVINCES.find((p) => p.id === id) ?? START_PROVINCES[0];
}

/** Where a new game in this province begins: a random one of its start spots. */
export function pickStart(id: string | undefined, random: () => number = Math.random): { mapKey: MapKey; spawn: string } {
  const province = startProvince(id);
  return { mapKey: province.mapKey, spawn: province.spawns[Math.floor(random() * province.spawns.length)] };
}
