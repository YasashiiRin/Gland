import maps from './maps.json';

export type MapKey = keyof typeof maps;

export interface MapInfo {
  /** File name in public/assets/maps without extension. */
  file: string;
  displayName: string;
  /** The central-Vietnam province this map belongs to (the farm and village are in Quảng Bình). */
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

/** Maps that have their own scene class; every other map is a scenery-only province map. */
const DEDICATED_SCENE_MAPS: readonly MapKey[] = ['Farm', 'House', 'Town'];

/** Keys of the province maps (Hà Tĩnh, Quảng Trị, ...), each run by a ProvinceScene. */
export const PROVINCE_MAP_KEYS: readonly MapKey[] = MAP_KEYS.filter((key) => !DEDICATED_SCENE_MAPS.includes(key));
