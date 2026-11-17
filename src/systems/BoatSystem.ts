import type { MapKey } from '../data/maps';

/**
 * Rowing boats moored on the rivers (pure logic). Each boat has an id from
 * the map; once someone rows it away, where it was left is kept in the save.
 * A rowed boat moves only over water (and under bridges).
 */
export interface BoatSpot {
  mapKey: MapKey;
  x: number;
  y: number;
}

/** Rowing speed relative to walking. */
export const ROW_SPEED = 0.85;
/** How close (px) you must stand to a boat to climb in. */
export const BOARD_RANGE = 26;

/** Where a boat is now: moved by someone, or still at its mooring. */
export function boatSpot(boats: Record<string, BoatSpot>, id: string, mooring: BoatSpot): BoatSpot {
  return boats[id] ?? mooring;
}

/** The nearest boat on this map within reach, or null. */
export function nearestBoat(
  boats: { id: string; spot: BoatSpot }[],
  mapKey: MapKey,
  x: number,
  y: number,
  range = BOARD_RANGE,
): string | null {
  let best: string | null = null;
  let bestD = range;
  for (const b of boats) {
    if (b.spot.mapKey !== mapKey) continue;
    const d = Math.hypot(b.spot.x - x, b.spot.y - y);
    if (d <= bestD) {
      bestD = d;
      best = b.id;
    }
  }
  return best;
}

/**
 * Stepping ashore: the first of the four tiles around (tx, ty) that is
 * walkable land, checking the facing direction first. Null = no shore here.
 */
export function landingTile(
  tx: number,
  ty: number,
  facing: { dx: number; dy: number },
  isLand: (x: number, y: number) => boolean,
): { x: number; y: number } | null {
  const dirs = [facing, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 }];
  for (const d of dirs) {
    if (isLand(tx + d.dx, ty + d.dy)) return { x: tx + d.dx, y: ty + d.dy };
  }
  return null;
}
