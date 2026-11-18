import type Phaser from 'phaser';
import { TILE } from '../config/constants';
import { homeKey } from '../systems/HomeSystem';
import type { TileRect } from './tigers';
import { readProp } from './worldSprites';

/** A walled village plot (scripts/art/homesteads.py), in tiles. */
export interface Homestead extends TileRect {
  key: string;
  vacant: boolean;
  house: string;
  /** The gate in the front wall (the tile just outside it, on the lane). */
  gate: { x: number; y: number };
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
  }));
}

export function inRect(r: TileRect, tx: number, ty: number): boolean {
  return tx >= r.x0 && tx <= r.x1 && ty >= r.y0 && ty <= r.y1;
}

/** Where you stand when you come home: in the yard, just inside the gate (world px). */
export function yardSpot(h: Homestead): { x: number; y: number } {
  return { x: h.gate.x * TILE + TILE / 2, y: (h.gate.y - 2) * TILE + TILE / 2 };
}
