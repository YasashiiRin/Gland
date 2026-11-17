import maps from './maps.json';

export type MapKey = keyof typeof maps;

export interface MapInfo {
  /** File name in public/assets/maps without extension. */
  file: string;
  displayName: string;
  /** The central-Vietnam province this map belongs to. */
  province: string;
  /** Vehicles can be driven here (and ridden in/out through its doors). */
  outdoor: boolean;
  /** Sprites for the uncuttable border forest (FOREST tiles); defaults to village bamboo and palms. */
  forestTrees?: string[];
  /** Sprite drawn on ORCHARD tiles (planted rows: pomelo, rubber...). */
  orchardTree?: string;
}

export const MAPS: Record<MapKey, MapInfo> = maps;
export const MAP_KEYS = Object.keys(maps) as MapKey[];

export function isMapKey(value: string): value is MapKey {
  return value in maps;
}

/** Keys of the big world maps (Quảng Bình, Huế), each run by a ProvinceScene. */
export const PROVINCE_MAP_KEYS: readonly MapKey[] = MAP_KEYS;
