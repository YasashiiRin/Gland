import world from '../data/world.json';
import { isMapKey, MAPS, type MapKey } from '../data/maps';
import { minimapColor, type MinimapData } from './MinimapSystem';

/**
 * The world map: every outdoor map laid out where its roads meet the
 * neighbours' (positions in tiles, src/data/world.json). Indoor places (the
 * house, the mine) are shown at the door you entered them by.
 */
export interface WorldPlacement {
  key: MapKey;
  x: number;
  y: number;
  width: number;
  height: number;
  /** "Hà Tĩnh", or "Nông trại · Quảng Bình" when the area isn't named after its province. */
  label: string;
}

export interface WorldRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

const POSITIONS = world.positions as Record<string, Point | undefined>;
const ANCHORS = world.anchors as Record<string, (Point & { map: string }) | undefined>;

/** Keys of the maps that have a place on the world map, north first. */
export function worldMapKeys(): MapKey[] {
  return Object.keys(POSITIONS)
    .filter(isMapKey)
    .sort((a, b) => (POSITIONS[a]?.y ?? 0) - (POSITIONS[b]?.y ?? 0));
}

export function worldLabel(key: MapKey): string {
  const info = MAPS[key];
  return info.displayName === info.province ? info.province : `${info.displayName} · ${info.province}`;
}

/** Places each map; `sizeOf` gives a map's size in tiles (read from its Tiled file). */
export function worldPlacements(sizeOf: (key: MapKey) => { width: number; height: number }): WorldPlacement[] {
  return worldMapKeys().map((key) => {
    const pos = POSITIONS[key] ?? { x: 0, y: 0 };
    return { key, x: pos.x, y: pos.y, ...sizeOf(key), label: worldLabel(key) };
  });
}

/** The smallest rectangle around every placed map. */
export function worldBounds(placements: readonly WorldPlacement[]): WorldRect {
  if (placements.length === 0) return { x: 0, y: 0, width: 1, height: 1 };
  const x0 = Math.min(...placements.map((p) => p.x));
  const y0 = Math.min(...placements.map((p) => p.y));
  const x1 = Math.max(...placements.map((p) => p.x + p.width));
  const y1 = Math.max(...placements.map((p) => p.y + p.height));
  return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
}

/**
 * Where the player is on the world map (in world tiles), given the current
 * map and tile; null for a place that isn't on the world map at all.
 */
export function playerWorldTile(mapKey: string, tileX: number, tileY: number): Point | null {
  const pos = POSITIONS[mapKey];
  if (pos) return { x: pos.x + tileX, y: pos.y + tileY };
  const anchor = ANCHORS[mapKey];
  const host = anchor ? POSITIONS[anchor.map] : undefined;
  return anchor && host ? { x: host.x + anchor.x, y: host.y + anchor.y } : null;
}

interface TmjLayer {
  name: string;
  data?: number[];
}

/** Minimap colors straight from a Tiled map's JSON (for maps that aren't loaded as a scene). */
export function minimapFromTmj(tmj: { width: number; height: number; layers: TmjLayer[] }): MinimapData {
  const ground = tmj.layers.find((l) => l.name === 'ground')?.data ?? [];
  const decor = tmj.layers.find((l) => l.name === 'decor')?.data ?? [];
  const colors: number[] = [];
  for (let i = 0; i < tmj.width * tmj.height; i++) colors.push(minimapColor(ground[i] || undefined, decor[i] || undefined));
  return { width: tmj.width, height: tmj.height, colors };
}

/** Clamps a zoom (screen pixels per tile) between "whole world fits" and a close-up. */
export function clampZoom(zoom: number, fitZoom: number, maxZoom = 16): number {
  return Math.min(maxZoom, Math.max(fitZoom, zoom));
}
