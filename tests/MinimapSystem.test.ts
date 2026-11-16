import { describe, expect, it } from 'vitest';
import { TILE_GID } from '../src/config/tileGids';
import { buildMinimap, minimapColor } from '../src/systems/MinimapSystem';

describe('MinimapSystem', () => {
  it('colors decor over ground, water banks as water, unknown as grass', () => {
    const grass = minimapColor(TILE_GID.GRASS, undefined);
    expect(minimapColor(TILE_GID.GRASS, TILE_GID.TRUNK)).not.toBe(grass);
    expect(minimapColor(TILE_GID.WATER_EDGE_FIRST + 3, undefined)).toBe(minimapColor(TILE_GID.WATER, undefined));
    expect(minimapColor(TILE_GID.PATH, TILE_GID.BLOCK)).toBe(minimapColor(TILE_GID.GRASS, TILE_GID.BLOCK));
    expect(minimapColor(9999, 0)).toBe(grass);
  });

  it('builds one color per tile, row by row', () => {
    const data = buildMinimap(3, 2, (x) => (x === 2 ? TILE_GID.WATER : TILE_GID.GRASS), () => undefined);
    expect(data.colors).toHaveLength(6);
    expect(data.colors[2]).toBe(minimapColor(TILE_GID.WATER, undefined));
    expect(data.colors[0]).toBe(minimapColor(TILE_GID.GRASS, undefined));
  });
});
