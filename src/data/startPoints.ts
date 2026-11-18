import points from './startPoints.json';
import type { MapKey } from './maps';

/** A place a new game can begin (a "spawn_<spawn>" point on that map). */
export interface StartPoint {
  id: string;
  name: string;
  mapKey: MapKey;
  spawn: string;
  blurb: string;
}

export const START_POINTS: readonly StartPoint[] = points as StartPoint[];
export const DEFAULT_START = START_POINTS[0];

export function startPoint(id: string | undefined): StartPoint {
  return START_POINTS.find((p) => p.id === id) ?? DEFAULT_START;
}
