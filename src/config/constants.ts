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

/** In portrait the canvas is this wide (the hotbar needs ~720px) and as tall as the screen's shape asks. */
export const PORTRAIT_GAME_WIDTH = 720;
export const MAX_GAME_HEIGHT = 1600;

/**
 * Canvas size for a viewport: landscape screens get the usual 540px-high
 * canvas, phones held upright a 720px-wide one as tall as their screen (so
 * the game can be played in portrait too, no "turn your phone" prompt).
 */
export function fitGameSize(viewW: number, viewH: number): { width: number; height: number } {
  if (viewW <= 0 || viewH <= 0 || viewW >= viewH) return { width: fitGameWidth(viewW, viewH), height: GAME_HEIGHT };
  const h = Math.round((PORTRAIT_GAME_WIDTH * viewH) / viewW / 2) * 2;
  return { width: PORTRAIT_GAME_WIDTH, height: Math.min(MAX_GAME_HEIGHT, Math.max(GAME_HEIGHT, h)) };
}

/** The part of the window really visible (phone browsers' toolbars excluded). */
export function visibleViewport(): { width: number; height: number } {
  const vv = typeof window === 'undefined' ? undefined : window.visualViewport;
  if (vv) return { width: vv.width, height: vv.height };
  return typeof window === 'undefined' ? { width: 960, height: GAME_HEIGHT } : { width: window.innerWidth, height: window.innerHeight };
}

const START_SIZE = fitGameSize(visibleViewport().width, visibleViewport().height);
export const GAME_WIDTH = START_SIZE.width;
export const START_GAME_HEIGHT = START_SIZE.height;

/** A stroke of a tool (hoe, watering can, axe...): the next one can only start this long after (ms). */
export const TOOL_STROKE_MS = 800;

/** Player movement speed in pixels per second. */
export const PLAYER_SPEED = 72;

/** Duration of the fade between maps, in milliseconds. */
export const FADE_MS = 250;

/** Depth used for layers that must draw above everything in the world (tree tops, roofs). */
export const DEPTH_ABOVE = 100000;
