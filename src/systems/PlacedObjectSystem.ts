import { createAnimal, type AnimalState } from './AnimalSystem';
import type { InventoryState } from './InventorySystem';
import { createEmptyInventory } from './InventorySystem';

export type PlacedObjectKind = 'chest' | 'scarecrow' | 'sprinkler' | 'chicken_coop' | 'carpenter_bench' | 'sleeping_mat';

export interface PlacedObjectState {
  kind: PlacedObjectKind;
  /** Only chests use this; their own small storage. */
  chest?: InventoryState;
  /** Only chicken_coop uses this; the one chicken living there. */
  animal?: AnimalState;
  /** Only sleeping mats use this: whose mat it is (only they roll it up). */
  owner?: string;
}

export type PlacedObjects = Record<string, PlacedObjectState>;

export function placedObjectKey(mapKey: string, x: number, y: number): string {
  return `${mapKey}:${x},${y}`;
}

export function createPlacedObject(kind: PlacedObjectKind): PlacedObjectState {
  if (kind === 'chest') return { kind, chest: createEmptyInventory() };
  if (kind === 'chicken_coop') return { kind, animal: createAnimal() };
  return { kind };
}

/** All chicken coops on a given map, as "x,y" strings (without the map prefix). */
export function coopTileKeysOnMap(objects: PlacedObjects, mapKey: string): string[] {
  const prefix = `${mapKey}:`;
  return Object.entries(objects)
    .filter(([key, node]) => key.startsWith(prefix) && node.kind === 'chicken_coop')
    .map(([key]) => key.slice(prefix.length));
}

export function isOccupied(objects: PlacedObjects, key: string): boolean {
  return key in objects;
}

export function placeObject(objects: PlacedObjects, key: string, kind: PlacedObjectKind): PlacedObjects {
  if (isOccupied(objects, key)) return objects;
  return { ...objects, [key]: createPlacedObject(kind) };
}

/** All sprinklers' tile coordinates on a given map, as "x,y" strings (without the map prefix). */
export function sprinklerTileKeysOnMap(objects: PlacedObjects, mapKey: string): string[] {
  const prefix = `${mapKey}:`;
  return Object.entries(objects)
    .filter(([key, node]) => key.startsWith(prefix) && node.kind === 'sprinkler')
    .map(([key]) => key.slice(prefix.length));
}

/** Rolls out a sleeping mat (chiếu) for `owner`, or returns the objects unchanged if the tile is taken. */
export function spreadMat(objects: PlacedObjects, key: string, owner: string): PlacedObjects {
  if (isOccupied(objects, key)) return objects;
  return { ...objects, [key]: { kind: 'sleeping_mat', owner } };
}

/**
 * Rolls a mat back up: the objects without it, or null if there is no mat
 * there or it belongs to someone else.
 */
export function rollUpMat(objects: PlacedObjects, key: string, who: string): PlacedObjects | null {
  const mat = objects[key];
  if (mat?.kind !== 'sleeping_mat' || (mat.owner && mat.owner !== who)) return null;
  const next = { ...objects };
  delete next[key];
  return next;
}

/** Tiles ("x,y") of the sleeping mats on a map. */
export function matTileKeysOnMap(objects: PlacedObjects, mapKey: string): string[] {
  const prefix = `${mapKey}:`;
  return Object.entries(objects)
    .filter(([key, node]) => key.startsWith(prefix) && node.kind === 'sleeping_mat')
    .map(([key]) => key.slice(prefix.length));
}
