/** Size of one map tile in pixels (art is drawn at this size). */
export const TILE = 16;

/**
 * Internal canvas resolution. The height is fixed; the width follows the
 * screen's shape (see fitGameWidth) so the game fills a laptop or phone
 * screen edge to edge instead of leaving black bars. Maps are drawn zoomed
 * in (settings.zoom) so pixel art stays crisp.
 */
export const GAME_HEIGHT = 540;
export const MIN_GAME_WIDTH = 800;
export const MAX_GAME_WIDTH = 1280;

/** Canvas width that matches a viewport's aspect ratio at GAME_HEIGHT (even, clamped). */
export function fitGameWidth(viewW: number, viewH: number): number {
  if (viewW <= 0 || viewH <= 0) return 960;
  const w = Math.round((GAME_HEIGHT * viewW) / viewH / 2) * 2;
  return Math.min(MAX_GAME_WIDTH, Math.max(MIN_GAME_WIDTH, w));
}

export const GAME_WIDTH = typeof window === 'undefined' ? 960 : fitGameWidth(window.innerWidth, window.innerHeight);

/** Player movement speed in pixels per second. */
export const PLAYER_SPEED = 72;

/** Duration of the fade between maps, in milliseconds. */
export const FADE_MS = 250;

/** Depth used for layers that must draw above everything in the world (tree tops, roofs). */
export const DEPTH_ABOVE = 100000;
