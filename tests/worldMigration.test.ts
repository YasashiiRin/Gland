import { describe, expect, it } from 'vitest';
import { createInitialState } from '../src/state/GameState';
import { moveToBigWorld } from '../src/state/worldMigration';
import { PASTURE, vehicleHome } from '../src/data/garage';
import type { GameState } from '../src/state/GameState';

function oldSave(): GameState {
  const s = createInitialState();
  return {
    ...s,
    currentMap: 'Farm' as GameState['currentMap'],
    farmPlots: { '3,4': { tilled: true, growthDay: 0, wateredToday: false }, 'QuangBinh:5,6': { tilled: true, growthDay: 0, wateredToday: false } },
    placedObjects: {
      'Farm:1,1': { kind: 'chest', chest: { slots: [{ itemId: 'wood', quantity: 7 }, null] } },
      'QuangBinh:9,9': { kind: 'scarecrow' },
    },
    vehicles: { motorbike: { mapKey: 'Farm', x: 1, y: 1, facing: 'down' } },
    livestock: [{ id: 'c', kind: 'cow', mapKey: 'Farm' as GameState['currentMap'], x: 0, y: 0, hunger: 0, growth: 0 }],
  } as GameState;
}

describe('moving an old save into the big world', () => {
  it('wakes the player in Quảng Bình and keeps big-world things', () => {
    const s = moveToBigWorld(oldSave());
    expect(s.currentMap).toBe('QuangBinh');
    expect(Object.keys(s.farmPlots)).toEqual(['QuangBinh:5,6']);
    expect(Object.keys(s.placedObjects)).toEqual(['QuangBinh:9,9']);
  });

  it('stores the old farm objects and chest contents in the warehouse', () => {
    const items = moveToBigWorld(oldSave()).warehouse.slots.filter(Boolean).map((x) => `${x?.itemId}:${x?.quantity}`);
    expect(items).toContain('chest:1');
    expect(items).toContain('wood:7');
  });

  it('sends vehicles to their bays and animals to the meadow', () => {
    const s = moveToBigWorld(oldSave());
    expect(s.vehicles.motorbike).toEqual(vehicleHome('motorbike'));
    expect(s.livestock[0]).toMatchObject({ mapKey: PASTURE.mapKey, x: PASTURE.x });
  });

  it('leaves a big-world save alone', () => {
    const s = moveToBigWorld(createInitialState());
    expect(s.currentMap).toBe('QuangBinh');
  });
});
