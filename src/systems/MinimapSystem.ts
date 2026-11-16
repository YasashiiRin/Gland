import { isWaterGid, TILE_GID } from '../config/tileGids';

/** Overview of a map for the minimap: one RGB color per tile, row by row. */
export interface MinimapData {
  width: number;
  height: number;
  colors: number[];
}

const COLORS = {
  grass: 0x4f8540,
  path: 0xb08a5c,
  water: 0x4a86ad,
  soil: 0x6b4a32,
  tree: 0x2f5a34,
  forest: 0x24432a,
  rock: 0x8c8a88,
  weed: 0x6a9a4c,
  building: 0x8e4a3c,
  wood: 0x8a6a48,
  floor: 0xa0724a,
  wall: 0x4a3428,
} as const;

const GROUND_COLORS: Record<number, number> = {
  [TILE_GID.PATH]: COLORS.path,
  [TILE_GID.DIRT]: COLORS.path,
  [TILE_GID.SOIL]: COLORS.soil,
  12: COLORS.path, // interior doormat
  13: COLORS.floor,
  62: COLORS.floor,
  64: COLORS.path,
};

const DECOR_COLORS: Record<number, number> = {
  [TILE_GID.TRUNK]: COLORS.tree,
  [TILE_GID.FOREST]: COLORS.forest,
  [TILE_GID.ROCK]: COLORS.rock,
  [TILE_GID.BUSH]: COLORS.weed,
  [TILE_GID.BLOCK]: COLORS.building,
  [TILE_GID.FENCE]: COLORS.wood,
  22: COLORS.wood, // sign
  14: COLORS.wall,
  59: COLORS.wall,
  60: COLORS.wall,
};

/** Path edge variants share the path color. */
const PATH_EDGE_FIRST = 41;
const PATH_EDGE_LAST = 56;

/** Picks the minimap color of one tile from its ground and decor tile ids (0/undefined = none). */
export function minimapColor(groundGid: number | undefined, decorGid: number | undefined): number {
  if (decorGid && DECOR_COLORS[decorGid] !== undefined) return DECOR_COLORS[decorGid];
  if (isWaterGid(groundGid)) return COLORS.water;
  if (groundGid !== undefined) {
    if (groundGid >= PATH_EDGE_FIRST && groundGid <= PATH_EDGE_LAST) return COLORS.path;
    if (GROUND_COLORS[groundGid] !== undefined) return GROUND_COLORS[groundGid];
  }
  return COLORS.grass;
}

export function buildMinimap(
  width: number,
  height: number,
  groundAt: (x: number, y: number) => number | undefined,
  decorAt: (x: number, y: number) => number | undefined,
): MinimapData {
  const colors: number[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) colors.push(minimapColor(groundAt(x, y), decorAt(x, y)));
  }
  return { width, height, colors };
}
