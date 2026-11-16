/**
 * Mirrors the tile order baked into scripts/art/tiles.py (GIDs are the Tiled
 * gid, i.e. the Python tile index + 1, since the tileset's firstgid is 1).
 * Keep these two files in sync if the tileset layout changes.
 */
export const TILE_GID = {
  GRASS: 1,
  GRASS2: 2,
  FLOWERS: 3,
  PATH: 4,
  WATER: 5,
  FENCE: 6,
  TRUNK: 7,
  CANOPY: 8,
  ROCK: 9,
  BUSH: 20,
  SOIL: 21,
  /** First of the 16 auto-tiled water-with-bank variants (index 24..39). */
  WATER_EDGE_FIRST: 25,
  WATER_EDGE_LAST: 40,
  /** Invisible collider under building/furniture sprites. */
  BLOCK: 57,
  DIRT: 58,
  /** Border-forest tree: drawn as a tree sprite like TRUNK, but not choppable. */
  FOREST: 61,
  GRASS3: 63,
} as const;

export const TILLABLE_GIDS: readonly number[] = [TILE_GID.GRASS, TILE_GID.GRASS2, TILE_GID.FLOWERS, TILE_GID.GRASS3];

/** Plain water or any of its bank variants — anything you can fish in. */
export function isWaterGid(gid: number | undefined): boolean {
  return gid === TILE_GID.WATER || (gid !== undefined && gid >= TILE_GID.WATER_EDGE_FIRST && gid <= TILE_GID.WATER_EDGE_LAST);
}
