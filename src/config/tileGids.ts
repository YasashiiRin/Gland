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
  // Province scenery (scripts/art/province_tiles.py)
  SAND: 65,
  SAND2: 66,
  SEA: 67,
  /** Sea meeting the beach: foam over wet sand. */
  SURF: 68,
  TEA: 69,
  BRIDGE: 70,
  CLIFF: 71,
  /** Planted tree drawn with the map's orchardTree sprite (not choppable). */
  ORCHARD: 72,
  /** Huế citadel brick wall. */
  CITADEL: 73,
  /** Pond covered with lotus (still water: you can fish in it). */
  LOTUS: 74,
  /** Stone paving: old-town streets, city streets, the citadel courtyard. */
  PAVING: 75,
  /** Flooded rice-field mud. */
  PADDY: 76,
  /** Ripe village rice (decor): reap it with E or the sickle. */
  RICE: 77,
  /** Rice stubble left after reaping; ripe again next season. */
  STUBBLE: 78,
  /** Sa Huỳnh salt pans. */
  SALT: 79,
  /** Lý Sơn garlic rows (decor). */
  GARLIC: 80,
  // Biome trees: each always drawn with one species (scripts/art/province_tiles.py).
  PINE_TREE: 81,
  BAMBOO_TREE: 82,
  PALM_TREE: 83,
  MANGROVE_TREE: 84,
  MARSH: 85,
  ROCKY: 86,
  DRY_GRASS: 87,
  /** Reeds (decor, walk-through). */
  REEDS: 88,
} as const;

/** The sprite drawn for each biome-tree tile. */
export const BIOME_TREE_TEXTURES: Readonly<Record<number, string>> = {
  [TILE_GID.PINE_TREE]: 'tree_pine',
  [TILE_GID.BAMBOO_TREE]: 'tree_bamboo',
  [TILE_GID.PALM_TREE]: 'tree_coconut',
  [TILE_GID.MANGROVE_TREE]: 'tree_mangrove',
};

/** Decor tiles that stand for a tree sprite (and count as "trees" for the ghosts). */
export function isTreeGid(gid: number | undefined): boolean {
  return (
    gid === TILE_GID.TRUNK ||
    gid === TILE_GID.FOREST ||
    gid === TILE_GID.ORCHARD ||
    (gid !== undefined && BIOME_TREE_TEXTURES[gid] !== undefined)
  );
}

export const TILLABLE_GIDS: readonly number[] = [TILE_GID.GRASS, TILE_GID.GRASS2, TILE_GID.FLOWERS, TILE_GID.GRASS3];

/** Water (with any bank variant) or the sea — anything you can fish in. */
export function isWaterGid(gid: number | undefined): boolean {
  if (gid === TILE_GID.SEA || gid === TILE_GID.SURF || gid === TILE_GID.LOTUS) return true;
  return gid === TILE_GID.WATER || (gid !== undefined && gid >= TILE_GID.WATER_EDGE_FIRST && gid <= TILE_GID.WATER_EDGE_LAST);
}
