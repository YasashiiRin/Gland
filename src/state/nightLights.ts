import lights from '../data/houseLights.json';

/** A spot of oil-lamp light in the world (px). */
export interface LampSpot {
  x: number;
  y: number;
  r: number;
}

/** Oil lamps are lit at 18:00 and put out at 21:00. */
export const LAMPS_ON_MINUTE = 18 * 60;
export const LAMPS_OFF_MINUTE = 21 * 60;

export function lampsLit(minuteOfDay: number): boolean {
  return minuteOfDay >= LAMPS_ON_MINUTE && minuteOfDay < LAMPS_OFF_MINUTE;
}

/** How bright the lamps are: fading in over the first quarter hour, out over the last ten minutes. */
export function lampStrength(minuteOfDay: number): number {
  if (!lampsLit(minuteOfDay)) return 0;
  return Math.min(1, (minuteOfDay - LAMPS_ON_MINUTE) / 15, (LAMPS_OFF_MINUTE - minuteOfDay) / 10);
}

const TABLE = lights as unknown as Record<string, [number, number, number][]>;

/** The lamp spots of a building sprite placed with its bottom centre at (x, bottom). */
export function lampSpotsFor(sprite: string, x: number, bottom: number): LampSpot[] {
  const list = sprite.startsWith('_') ? undefined : TABLE[sprite];
  return (list ?? []).map(([dx, dy, r]) => ({ x: x + dx, y: bottom + dy, r }));
}

/**
 * The lamps of the map on screen and where its camera looks, shared with the
 * UI scene (which draws the glow above the night overlay). Not saved.
 */
export const nightLights = {
  spots: [] as LampSpot[],
  viewX: 0,
  viewY: 0,
  zoom: 1,
};
