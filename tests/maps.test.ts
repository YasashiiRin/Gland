import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import maps from '../src/data/maps.json';

interface TiledProp { name: string; value: unknown }
interface TiledObject { name: string; properties?: TiledProp[] }
interface TiledLayer { name: string; type: string; objects?: TiledObject[] }

function load(file: string): { layers: TiledLayer[] } {
  return JSON.parse(readFileSync(resolve(__dirname, `../public/assets/maps/${file}.tmj`), 'utf8'));
}

const mapEntries = Object.entries(maps);

describe('maps', () => {
  it.each(mapEntries)('%s has the required layers and a default spawn', (_key, info) => {
    const m = load(info.file);
    const names = m.layers.map((l) => l.name);
    expect(names).toEqual(expect.arrayContaining(['ground', 'decor', 'above', 'objects']));
    const objects = m.layers.find((l) => l.name === 'objects')?.objects ?? [];
    expect(objects.some((o) => o.name === 'spawn_default')).toBe(true);
  });

  it.each(mapEntries)('every door in %s leads to an existing map and spawn', (_key, info) => {
    const objects = load(info.file).layers.find((l) => l.name === 'objects')?.objects ?? [];
    for (const door of objects.filter((o) => o.name === 'door')) {
      const to = door.properties?.find((p) => p.name === 'to')?.value as string;
      const spawn = door.properties?.find((p) => p.name === 'spawn')?.value as string;
      expect(Object.keys(maps)).toContain(to);
      const target = load(maps[to as keyof typeof maps].file);
      const targetObjects = target.layers.find((l) => l.name === 'objects')?.objects ?? [];
      expect(targetObjects.map((o) => o.name)).toContain(`spawn_${spawn}`);
    }
  });
});
