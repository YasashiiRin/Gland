import maps from './maps.json';

export type MapKey = keyof typeof maps;

export interface MapInfo {
  /** File name in public/assets/maps without extension. */
  file: string;
  displayName: string;
  /** Vehicles can be driven here (and ridden in/out through its doors). */
  outdoor: boolean;
}

export const MAPS: Record<MapKey, MapInfo> = maps;
export const MAP_KEYS = Object.keys(maps) as MapKey[];

export function isMapKey(value: string): value is MapKey {
  return value in maps;
}
