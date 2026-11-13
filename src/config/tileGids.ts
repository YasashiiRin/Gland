/**
 * Mirrors the tile order baked into scripts/gen_placeholders.py (GIDs are the
 * Tiled gid, i.e. the Python tile index + 1, since the tileset's firstgid is 1).
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
  SOIL: 21,
} as const;

export const TILLABLE_GIDS: readonly number[] = [TILE_GID.GRASS, TILE_GID.GRASS2, TILE_GID.FLOWERS];
