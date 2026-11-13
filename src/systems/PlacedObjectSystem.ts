import type { InventoryState } from './InventorySystem';
import { createEmptyInventory } from './InventorySystem';

export type PlacedObjectKind = 'chest' | 'scarecrow' | 'sprinkler';

export interface PlacedObjectState {
  kind: PlacedObjectKind;
  /** Only chests use this; their own small storage. */
  chest?: InventoryState;
}

export type PlacedObjects = Record<string, PlacedObjectState>;

export function placedObjectKey(mapKey: string, x: number, y: number): string {
  return `${mapKey}:${x},${y}`;
}

export function createPlacedObject(kind: PlacedObjectKind): PlacedObjectState {
  return kind === 'chest' ? { kind, chest: createEmptyInventory() } : { kind };
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
