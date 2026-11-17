import { describe, expect, it } from 'vitest';
import { clampZoom, minimapFromTmj, playerWorldTile, worldBounds, worldMapKeys, worldPlacements } from '../src/systems/WorldMapSystem';
import { TILE_GID } from '../src/config/tileGids';

describe('world map', () => {
  it('lists the outdoor maps north to south', () => {
    expect(worldMapKeys()).toEqual(['QuangBinh', 'Hue']);
  });

  it('labels areas with their province', () => {
    const placed = worldPlacements(() => ({ width: 10, height: 10 }));
    expect(placed.find((p) => p.key === 'QuangBinh')?.label).toBe('Quảng Bình');
    expect(placed.find((p) => p.key === 'Hue')?.label).toBe('Huế');
  });

  it('measures the bounds around every map', () => {
    const b = worldBounds([
      { key: 'Hue', x: 0, y: 0, width: 64, height: 48, label: '' },
      { key: 'QuangBinh', x: 0, y: -40, width: 64, height: 40, label: '' },
    ]);
    expect(b).toEqual({ x: 0, y: -40, width: 64, height: 88 });
  });

  it('puts the player on the world map, in the mine at its entrance', () => {
    expect(playerWorldTile('Hue', 10, 2)).toEqual({ x: 30, y: 427 });
    expect(playerWorldTile('Mine', 3, 5)).toEqual({ x: 149, y: 182 });
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
