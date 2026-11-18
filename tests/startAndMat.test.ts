import { describe, expect, it } from 'vitest';
import { pickStart, START_PROVINCES, startProvince } from '../src/data/startPoints';
import { isMapKey } from '../src/data/maps';
import { gameState, resetToNewGame } from '../src/state/GameState';
import { matTileKeysOnMap, rollUpMat, spreadMat } from '../src/systems/PlacedObjectSystem';
import { hasItem } from '../src/systems/InventorySystem';

describe('start provinces', () => {
  it('all lie on a live map and have start spots', () => {
    for (const p of START_PROVINCES) {
      expect(isMapKey(p.mapKey)).toBe(true);
      expect(p.spawns.length).toBeGreaterThan(0);
    }
    expect(startProvince('nowhere').id).toBe('quang_binh');
  });

  it('starts at home in the chosen province', () => {
    expect(pickStart('hue')).toEqual({ mapKey: 'Hue', spawn: 'home' });
  });

  it('a new game begins in the chosen province with a sleeping mat', () => {
    resetToNewGame('An', undefined, 'hue');
    expect(gameState.currentMap).toBe('Hue');
    expect(gameState.spawnId).toBe('home');
    expect(hasItem(gameState.inventory, 'sleeping_mat', 1)).toBe(true);
    resetToNewGame('An');
    expect(gameState.currentMap).toBe('QuangBinh');
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

describe('homesteads on the maps', () => {
  it('every province has free thatched houses for new players, with a gate', async () => {
    const fs = await import('node:fs');
    const files: Record<string, string> = { QuangBinh: 'quang_binh', Hue: 'hue' };
    for (const p of START_PROVINCES) {
      const map = JSON.parse(fs.readFileSync(`public/assets/maps/${files[p.mapKey]}.tmj`, 'utf8')) as {
        layers: { name: string; objects?: { name: string; properties?: { name: string; value: string }[] }[] }[];
      };
      const objects = map.layers.find((l) => l.name === 'objects')?.objects ?? [];
      const prop = (o: { properties?: { name: string; value: string }[] }, n: string) => o.properties?.find((q) => q.name === n)?.value;
      const homes = objects.filter((o) => o.name === 'zone' && prop(o, 'kind') === 'home');
      const vacant = homes.filter((h) => prop(h, 'vacant') === '1');
      expect(vacant.length, p.id).toBeGreaterThanOrEqual(3);
      for (const h of vacant) {
        expect(prop(h, 'house')).toBe('thatched_house');
        expect(Number(prop(h, 'gateX'))).toBeGreaterThan(0);
      }
    }
  });
});
