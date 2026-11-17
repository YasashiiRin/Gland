import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { isMapKey, MAP_KEYS, MAPS, PROVINCE_MAP_KEYS } from '../src/data/maps';
import { isTreeGid, isWaterGid, TILE_GID } from '../src/config/tileGids';
import { playerWorldTile, worldMapKeys } from '../src/systems/WorldMapSystem';

interface TmjObject {
  name: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  properties?: { name: string; value: string }[];
}
interface Tmj {
  layers: { name: string; objects?: TmjObject[] }[];
}

const ASSETS = resolve(__dirname, '../public/assets');
const loadMap = (file: string): Tmj => JSON.parse(readFileSync(`${ASSETS}/maps/${file}.tmj`, 'utf8')) as Tmj;
const objectsOf = (tmj: Tmj): TmjObject[] => tmj.layers.find((l) => l.name === 'objects')?.objects ?? [];
const prop = (o: TmjObject, name: string): string | undefined => o.properties?.find((p) => p.name === name)?.value;

describe('world maps', () => {
  it('every door leads to a real map and to a spawn point that exists there', () => {
    for (const key of MAP_KEYS) {
      for (const door of objectsOf(loadMap(MAPS[key].file)).filter((o) => o.name === 'door')) {
        const to = prop(door, 'to') ?? '';
        expect(isMapKey(to), `${key} door to ${to}`).toBe(true);
        if (!isMapKey(to)) continue;
        const spawns = objectsOf(loadMap(MAPS[to].file)).map((o) => o.name);
        expect(spawns, `${key} -> ${to}`).toContain(`spawn_${prop(door, 'spawn')}`);
      }
    }
  });

  it('every prop on a map has a sprite in the asset pack', () => {
    const pack = JSON.parse(readFileSync(`${ASSETS}/sprites/pack.json`, 'utf8')) as { generated: { files: { key: string }[] } };
    const keys = new Set(pack.generated.files.map((f) => f.key));
    for (const key of MAP_KEYS) {
      for (const o of objectsOf(loadMap(MAPS[key].file)).filter((o) => o.name === 'prop')) {
        expect(keys, `${key}: prop_${prop(o, 'sprite')}`).toContain(`prop_${prop(o, 'sprite')}`);
      }
    }
  });

  it('has the two big province maps, Quảng Bình and Huế', () => {
    expect(PROVINCE_MAP_KEYS).toEqual(['QuangBinh', 'Hue']);
    expect(MAPS.QuangBinh.province).toBe('Quảng Bình');
    expect(MAPS.Hue.orchardTree).toBe('tree_pomelo');
  });

  it('treats the sea as fishing water and orchard rows as trees', () => {
    expect(isWaterGid(TILE_GID.SEA)).toBe(true);
    expect(isWaterGid(TILE_GID.SAND)).toBe(false);
    expect(isTreeGid(TILE_GID.ORCHARD)).toBe(true);
  });

  it('lays out the world map so each road meets the next map where you arrive', () => {
    const placed = new Set<string>(worldMapKeys());
    for (const key of worldMapKeys()) {
      for (const door of objectsOf(loadMap(MAPS[key].file)).filter((o) => o.name === 'door')) {
        const to = prop(door, 'to') ?? '';
        if (!placed.has(to) || !isMapKey(to)) continue;
        const spawn = objectsOf(loadMap(MAPS[to].file)).find((o) => o.name === `spawn_${prop(door, 'spawn')}`);
        const from = playerWorldTile(key, ((door.x ?? 0) + (door.width ?? 0) / 2) / 16, ((door.y ?? 0) + (door.height ?? 0) / 2) / 16);
        const arrive = playerWorldTile(to, (spawn?.x ?? 0) / 16, (spawn?.y ?? 0) / 16);
        expect(from && arrive && Math.hypot(from.x - arrive.x, from.y - arrive.y), `${key} -> ${to}`).toBeLessThan(5);
      }
    }
  });
});
