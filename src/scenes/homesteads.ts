import type Phaser from 'phaser';
import { TILE } from '../config/constants';
import { homeKey } from '../systems/HomeSystem';
import type { TileRect } from './tigers';
import { readProp } from './worldSprites';

/** A village homestead plot (scripts/art/homesteads.py), in tiles. */
export interface Homestead extends TileRect {
  key: string;
  vacant: boolean;
  house: string;
  /** The middle of the plot's front edge (the tile just outside it). */
  gate: { x: number; y: number };
  /** Who lives there: 0 (empty), 1, or 3 (a couple and a child). */
  members: number;
  livestock: '' | 'buffalo' | 'cow';
  feature: '' | 'pond' | 'chickens';
}

/** A household's paddy in the village fields ("field" objects, scripts/art/villages.py). */
export interface Paddy extends TileRect {
  key: string;
  side: 'north' | 'south';
  /** Where its plank bridge crosses the canal, and the main road's middle row beside it. */
  bridgeX: number;
  roadY: number;
}

export function readPaddies(map: Phaser.Tilemaps.Tilemap, mapKey: string): Paddy[] {
  return (map.getObjectLayer('objects')?.objects ?? [])
    .filter((o) => o.name === 'field')
    .map((o) => {
      const r = rectOf(o);
      const side = readProp(o, 'side') === 'south' ? 'south' : 'north';
      return { ...r, key: homeKey(mapKey, readProp(o, 'homeId') ?? ''), side, bridgeX: Number(readProp(o, 'bridgeX')), roadY: side === 'north' ? r.y1 + 3 : r.y0 - 3 };
    });
}

function rectOf(o: Phaser.Types.Tilemaps.TiledObject): TileRect {
  return {
    x0: Math.floor((o.x ?? 0) / TILE),
    y0: Math.floor((o.y ?? 0) / TILE),
    x1: Math.floor(((o.x ?? 0) + (o.width ?? 0)) / TILE) - 1,
    y1: Math.floor(((o.y ?? 0) + (o.height ?? 0)) / TILE) - 1,
  };
}

function zones(map: Phaser.Tilemaps.Tilemap, kind: string): Phaser.Types.Tilemaps.TiledObject[] {
  return (map.getObjectLayer('objects')?.objects ?? []).filter((o) => o.name === 'zone' && (readProp(o, 'kind') ?? 'landmark') === kind);
}

/** Landmarks and towns: the big safe zones. */
export function landmarkZones(map: Phaser.Tilemaps.Tilemap): TileRect[] {
  return zones(map, 'landmark').map(rectOf);
}

export function readHomesteads(map: Phaser.Tilemaps.Tilemap, mapKey: string): Homestead[] {
  return zones(map, 'home').map((o) => ({
    ...rectOf(o),
    key: homeKey(mapKey, readProp(o, 'homeId') ?? ''),
    vacant: readProp(o, 'vacant') === '1',
    house: readProp(o, 'house') ?? '',
    gate: { x: Number(readProp(o, 'gateX')), y: Number(readProp(o, 'gateY')) },
    members: Number(readProp(o, 'members') ?? '1'),
    livestock: (readProp(o, 'livestock') ?? '') as Homestead['livestock'],
    feature: (readProp(o, 'feature') ?? '') as Homestead['feature'],
  }));
}

export function inRect(r: TileRect, tx: number, ty: number): boolean {
  return tx >= r.x0 && tx <= r.x1 && ty >= r.y0 && ty <= r.y1;
}

/** Where you stand when you come home: in the yard, just inside the gate (world px). */
export function yardSpot(h: Homestead): { x: number; y: number } {
  return { x: h.gate.x * TILE + TILE / 2, y: (h.gate.y - 2) * TILE + TILE / 2 };
}
