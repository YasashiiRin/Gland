import type { Direction } from './movement';

/** Where an owned vehicle is parked (x/y = world pixels of its ground point). */
export interface ParkedVehicle {
  mapKey: string;
  x: number;
  y: number;
  facing: Direction;
}

/** Owned vehicles by vehicle id; a vehicle being ridden keeps its last parking spot here. */
export type OwnedVehicles = Partial<Record<string, ParkedVehicle>>;

export function ownsVehicle(owned: OwnedVehicles, id: string): boolean {
  return owned[id] !== undefined;
}

/** Adds a newly bought (or dev-granted) vehicle at its home spot; no-op if already owned. */
export function addVehicle(owned: OwnedVehicles, id: string, home: ParkedVehicle): OwnedVehicles {
  return ownsVehicle(owned, id) ? owned : { ...owned, [id]: home };
}

export function parkVehicle(owned: OwnedVehicles, id: string, spot: ParkedVehicle): OwnedVehicles {
  return ownsVehicle(owned, id) ? { ...owned, [id]: spot } : owned;
}

/** Closest parked vehicle on a map within `maxDistance` pixels (ignoring `excludeId`), or null. */
export function nearestParked(
  owned: OwnedVehicles,
  mapKey: string,
  x: number,
  y: number,
  maxDistance: number,
  excludeId: string | null = null,
): string | null {
  let best: string | null = null;
  let bestDist = maxDistance;
  for (const [id, spot] of Object.entries(owned)) {
    if (!spot || spot.mapKey !== mapKey || id === excludeId) continue;
    const d = Math.hypot(spot.x - x, spot.y - y);
    if (d <= bestDist) {
      best = id;
      bestDist = d;
    }
  }
  return best;
}

/** Sends every vehicle (except the one being ridden) back to its home spot. */
export function recallAll(
  owned: OwnedVehicles,
  homeOf: (id: string) => ParkedVehicle,
  ridingId: string | null,
): { owned: OwnedVehicles; recalled: number } {
  const next: OwnedVehicles = { ...owned };
  let recalled = 0;
  for (const [id, spot] of Object.entries(owned)) {
    if (!spot || id === ridingId) continue;
    const home = homeOf(id);
    if (spot.mapKey !== home.mapKey || spot.x !== home.x || spot.y !== home.y) {
      next[id] = home;
      recalled++;
    }
  }
  return { owned: next, recalled };
}

/**
 * The 2x2 block of tiles a large vehicle (tractor, harvester) works on: the
 * four tiles whose shared corner is nearest the vehicle's centre point.
 */
export function workArea(x: number, y: number, tileSize: number): { x: number; y: number }[] {
  const tx = Math.round(x / tileSize) - 1;
  const ty = Math.round(y / tileSize) - 1;
  return [
    { x: tx, y: ty },
    { x: tx + 1, y: ty },
    { x: tx, y: ty + 1 },
    { x: tx + 1, y: ty + 1 },
  ];
}
