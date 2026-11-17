import { describe, expect, it } from 'vitest';
import { clampZoom, minimapFromTmj, playerWorldTile, worldBounds, worldMapKeys, worldPlacements } from '../src/systems/WorldMapSystem';
import { TILE_GID } from '../src/config/tileGids';

describe('world map', () => {
  it('lists the outdoor maps north to south, without the house', () => {
    const keys = worldMapKeys();
    expect(keys[0]).toBe('QuangBinh');
    expect(keys).toContain('Farm');
    expect(keys).not.toContain('House');
  });

  it('labels areas with their province', () => {
    const placed = worldPlacements(() => ({ width: 10, height: 10 }));
    expect(placed.find((p) => p.key === 'Farm')?.label).toBe('Nông trại · Quảng Bình');
    expect(placed.find((p) => p.key === 'Hue')?.label).toBe('Huế');
  });

  it('measures the bounds around every map', () => {
    const b = worldBounds([
      { key: 'Farm', x: 0, y: 0, width: 64, height: 48, label: '' },
      { key: 'QuangBinh', x: 0, y: -40, width: 64, height: 40, label: '' },
    ]);
    expect(b).toEqual({ x: 0, y: -40, width: 64, height: 88 });
  });

  it('puts the player on the world map, indoors at the door', () => {
    expect(playerWorldTile('QuangBinh', 31, 422)).toEqual({ x: 31, y: -3 });
    expect(playerWorldTile('House', 3, 5)).toEqual({ x: 11, y: 9 });
    expect(playerWorldTile('Nowhere', 1, 1)).toBeNull();
  });

  it('colors tiles from a Tiled file and clamps zoom', () => {
    const data = minimapFromTmj({
      width: 2,
      height: 1,
      layers: [
        { name: 'ground', data: [TILE_GID.SEA, TILE_GID.GRASS] },
        { name: 'decor', data: [0, TILE_GID.FOREST] },
      ],
    });
    expect(data.colors[0]).not.toBe(data.colors[1]);
    expect(clampZoom(100, 2)).toBe(16);
    expect(clampZoom(1, 2)).toBe(2);
  });
});
