/**
 * Where the player currently is, in tiles, for UI that follows them (the
 * minimap). Written by the active map scene every frame; not saved.
 */
export const worldView = {
  playerTileX: 0,
  playerTileY: 0,
  /** The middle of the player's own house on this map, or -1 when they have none here. */
  homeTileX: -1,
  homeTileY: -1,
};
