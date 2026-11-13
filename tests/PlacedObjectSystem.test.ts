import { describe, expect, it } from 'vitest';
import {
  isOccupied,
  placeObject,
  placedObjectKey,
  sprinklerTileKeysOnMap,
  type PlacedObjects,
} from '../src/systems/PlacedObjectSystem';

describe('placeObject', () => {
  it('places an object and creates an empty inventory for chests', () => {
    const key = placedObjectKey('Farm', 5, 5);
    const objects = placeObject({}, key, 'chest');
    expect(objects[key].kind).toBe('chest');
    expect(objects[key].chest?.slots.length).toBeGreaterThan(0);
  });

  it('refuses to place on an already-occupied tile', () => {
    const key = placedObjectKey('Farm', 5, 5);
    const objects = placeObject({}, key, 'chest');
    const again = placeObject(objects, key, 'scarecrow');
    expect(again).toBe(objects);
    expect(again[key].kind).toBe('chest');
  });

  it('isOccupied reflects presence', () => {
    const key = placedObjectKey('Farm', 1, 1);
    expect(isOccupied({}, key)).toBe(false);
    expect(isOccupied({ [key]: { kind: 'scarecrow' } }, key)).toBe(true);
  });
});

describe('sprinklerTileKeysOnMap', () => {
  it('finds only sprinklers on the given map, stripped of the map prefix', () => {
    const objects: PlacedObjects = {
      'Farm:3,3': { kind: 'sprinkler' },
      'Farm:4,4': { kind: 'chest' },
      'Town:3,3': { kind: 'sprinkler' },
    };
    expect(sprinklerTileKeysOnMap(objects, 'Farm')).toEqual(['3,3']);
  });
});
