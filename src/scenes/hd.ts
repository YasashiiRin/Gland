import type Phaser from 'phaser';
import { TILE } from '../config/constants';

/**
 * HD art ("graphics x2"): sprites and tiles drawn at twice the resolution
 * and shown at half size, so at the default zoom (x2) every art pixel is one
 * screen pixel. World units stay 16 px per tile, so positions, collisions
 * and game logic don't change. Art can move to HD one sprite at a time:
 * pack.json marks HD sprites with "hd": true.
 */
export const HD_TILE = TILE * 2;
export const TILESET_HD_TEXTURE = 'farm_tiles_hd';

/** Texture keys of HD art (filled from the sprite pack at load). */
const HD_KEYS = new Set<string>();

interface PackFile {
  key: string;
  hd?: boolean;
}

/** After loading: flags every HD texture listed in the sprite pack. */
export function markHdTextures(scene: Phaser.Scene, pack: { generated?: { files?: PackFile[] } } | undefined): void {
  for (const f of pack?.generated?.files ?? []) {
    if (f.hd && scene.textures.exists(f.key)) HD_KEYS.add(f.key);
  }
}

/** Display scale for a texture: 0.5 for HD art, 1 otherwise. */
export function hdScale(scene: Phaser.Scene, key: string): number {
  return HD_KEYS.has(key) && scene.textures.exists(key) ? 0.5 : 1;
}

/** Art pixels per world pixel for a texture: 2 for HD art, 1 otherwise. */
export function artScale(scene: Phaser.Scene, key: string): number {
  return 1 / hdScale(scene, key);
}

/**
 * Tiled maps are authored at 16 px tiles; the HD tileset has 32 px tiles.
 * Rewrites the cached map JSON once so Phaser reads it at 32 px (objects
 * keep their 16-px-world coordinates); the layers are then drawn at x0.5.
 */
export function useHdTileset(json: Record<string, unknown> & { tilesets?: Record<string, unknown>[] }): void {
  if (json.__hd) return;
  json.__hd = true;
  json.tilewidth = HD_TILE;
  json.tileheight = HD_TILE;
  for (const ts of json.tilesets ?? []) {
    ts.tilewidth = HD_TILE;
    ts.tileheight = HD_TILE;
    ts.imagewidth = (ts.imagewidth as number) * 2;
    ts.imageheight = (ts.imageheight as number) * 2;
  }
}
