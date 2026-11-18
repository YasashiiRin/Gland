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

  it('picks one of the province’s spots at random', () => {
    expect(pickStart('hue', () => 0)).toEqual({ mapKey: 'Hue', spawn: 'start_hue_0' });
    expect(pickStart('hue', () => 0.999).spawn).toBe('start_hue_4');
  });

  it('a new game begins in the chosen province with a sleeping mat', () => {
    resetToNewGame('An', undefined, 'hue');
    expect(gameState.currentMap).toBe('Hue');
    expect(gameState.spawnId).toMatch(/^start_hue_/);
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

describe('start spots on the maps', () => {
  it('exist and lie outside every safe zone', async () => {
    const fs = await import('node:fs');
    const files: Record<string, string> = { QuangBinh: 'quang_binh', Hue: 'hue' };
    for (const p of START_PROVINCES) {
      const map = JSON.parse(fs.readFileSync(`public/assets/maps/${files[p.mapKey]}.tmj`, 'utf8')) as {
        layers: { name: string; objects?: { name: string; x: number; y: number; width: number; height: number }[] }[];
      };
      const objects = map.layers.find((l) => l.name === 'objects')?.objects ?? [];
      const zones = objects.filter((o) => o.name === 'zone');
      for (const spawn of p.spawns) {
        const at = objects.find((o) => o.name === `spawn_${spawn}`);
        expect(at, spawn).toBeDefined();
        const inside = zones.some((z) => at!.x >= z.x && at!.x < z.x + z.width && at!.y >= z.y && at!.y < z.y + z.height);
        expect(inside, spawn).toBe(false);
      }
    }
  });
});
