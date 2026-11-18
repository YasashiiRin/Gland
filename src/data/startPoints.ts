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

/**
 * Where a new game in this province begins: at home - the map gives the
 * player a free thatched house in one of its villages ("home" spawn). The
 * open-country spots are kept as a fallback should every house be taken.
 */
export function pickStart(id: string | undefined): { mapKey: MapKey; spawn: string } {
  return { mapKey: startProvince(id).mapKey, spawn: 'home' };
}
