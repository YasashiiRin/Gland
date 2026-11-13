/** Size of one map tile in pixels (art is drawn at this size). */
export const TILE = 16;

/** Internal canvas resolution. Maps are drawn with WORLD_ZOOM so pixel art stays crisp. */
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;
export const WORLD_ZOOM = 2;

/** Player movement speed in pixels per second. */
export const PLAYER_SPEED = 72;
export const RUN_MULTIPLIER = 1.6;

/** Duration of the fade between maps, in milliseconds. */
export const FADE_MS = 250;

/** Depth used for layers that must draw above everything in the world (tree tops, roofs). */
export const DEPTH_ABOVE = 100000;
