import { describe, expect, it } from 'vitest';
import { START_POINTS, startPoint } from '../src/data/startPoints';
import { isMapKey } from '../src/data/maps';
import { gameState, resetToNewGame } from '../src/state/GameState';
import { matTileKeysOnMap, rollUpMat, spreadMat } from '../src/systems/PlacedObjectSystem';
import { hasItem } from '../src/systems/InventorySystem';

describe('start points', () => {
  it('all lie on a live map', () => {
    for (const p of START_POINTS) expect(isMapKey(p.mapKey)).toBe(true);
    expect(startPoint('nowhere').id).toBe('dong_hoi');
  });

  it('a new game begins at the chosen point with a sleeping mat', () => {
    resetToNewGame('An', undefined, 'thien_mu');
    expect(gameState.currentMap).toBe('Hue');
    expect(gameState.spawnId).toBe('start_thien_mu');
    expect(hasItem(gameState.inventory, 'sleeping_mat', 1)).toBe(true);
    resetToNewGame('An');
    expect(gameState.currentMap).toBe('QuangBinh');
    expect(gameState.spawnId).toBe('start');
  });
});

describe('sleeping mat', () => {
  it('spreads on a free tile and only its owner rolls it up', () => {
    const objects = spreadMat({}, 'Hue:5,5', 'An');
    expect(spreadMat(objects, 'Hue:5,5', 'Bình')).toBe(objects);
    expect(matTileKeysOnMap(objects, 'Hue')).toEqual(['5,5']);
    expect(rollUpMat(objects, 'Hue:5,5', 'Bình')).toBeNull();
    expect(rollUpMat(objects, 'Hue:5,5', 'An')).toEqual({});
    expect(rollUpMat({ 'Hue:1,1': { kind: 'chest' } }, 'Hue:1,1', 'An')).toBeNull();
  });
});
