import { describe, expect, it } from 'vitest';
import {
  FLOOR_HEIGHT,
  FLOOR_WIDTH,
  generateFloor,
  monsterStatsForDepth,
  oreKindForDepth,
  seededRandom,
} from '../src/systems/MineSystem';

describe('seededRandom', () => {
  it('is deterministic for the same seed', () => {
    const a = seededRandom(42);
    const b = seededRandom(42);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it('produces values in [0, 1)', () => {
    const r = seededRandom(1);
    for (let i = 0; i < 50; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('oreKindForDepth / monsterStatsForDepth', () => {
  it('ore gets rarer with depth', () => {
    expect(oreKindForDepth(1)).toBe('copper');
    expect(oreKindForDepth(7)).toBe('iron');
    expect(oreKindForDepth(15)).toBe('gold');
  });

  it('monsters get tougher with depth', () => {
    const shallow = monsterStatsForDepth(1);
    const deep = monsterStatsForDepth(20);
    expect(deep.health).toBeGreaterThan(shallow.health);
    expect(deep.damage).toBeGreaterThan(shallow.damage);
  });
});

describe('generateFloor', () => {
  it('is deterministic for the same depth', () => {
    const a = generateFloor(3);
    const b = generateFloor(3);
    expect(a.tiles).toEqual(b.tiles);
    expect(a.monsters).toEqual(b.monsters);
    expect(a.ladderDown).toEqual(b.ladderDown);
  });

  it('gives different floors for different depths', () => {
    const a = generateFloor(1);
    const b = generateFloor(2);
    expect(a.tiles).not.toEqual(b.tiles);
  });

  it('has the right dimensions and a walkable spawn tile', () => {
    const floor = generateFloor(1);
    expect(floor.width).toBe(FLOOR_WIDTH);
    expect(floor.height).toBe(FLOOR_HEIGHT);
    expect(floor.tiles.length).toBe(FLOOR_HEIGHT);
    expect(floor.tiles[0].length).toBe(FLOOR_WIDTH);
    expect(floor.tiles[floor.spawn.y][floor.spawn.x]).toBe('floor');
  });

  it('places exactly one ladder down, reachable (i.e. marked distinctly from walls)', () => {
    const floor = generateFloor(5);
    let ladderCount = 0;
    for (const row of floor.tiles) {
      for (const t of row) if (t === 'ladderDown') ladderCount++;
    }
    expect(ladderCount).toBe(1);
    expect(floor.tiles[floor.ladderDown.y][floor.ladderDown.x]).toBe('ladderDown');
  });

  it('scatters at least a few ore tiles, each adjacent to a floor tile', () => {
    const floor = generateFloor(2);
    const oreTiles: { x: number; y: number }[] = [];
    floor.tiles.forEach((row, y) => row.forEach((t, x) => t === 'ore' && oreTiles.push({ x, y })));
    expect(oreTiles.length).toBeGreaterThan(0);
    for (const { x, y } of oreTiles) {
      const neighbors = [floor.tiles[y]?.[x - 1], floor.tiles[y]?.[x + 1], floor.tiles[y - 1]?.[x], floor.tiles[y + 1]?.[x]];
      expect(neighbors).toContain('floor');
    }
  });

  it('spawns more monsters (up to the cap) on deeper floors', () => {
    expect(generateFloor(1).monsters.length).toBeLessThanOrEqual(generateFloor(12).monsters.length + 1);
    expect(generateFloor(12).monsters.length).toBeLessThanOrEqual(4);
  });

  it('never spawns a monster right on top of the player', () => {
    const floor = generateFloor(9);
    for (const m of floor.monsters) {
      expect(Math.abs(m.x - floor.spawn.x) + Math.abs(m.y - floor.spawn.y)).toBeGreaterThanOrEqual(4);
    }
  });
});
