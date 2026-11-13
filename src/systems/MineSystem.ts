/** A tiny deterministic PRNG (mulberry32) so the same depth always generates the same floor. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type MineTile = 'wall' | 'floor' | 'ore' | 'ladderDown';
export type OreKind = 'copper' | 'iron' | 'gold';

export interface MineFloor {
  width: number;
  height: number;
  tiles: MineTile[][]; // [y][x]
  oreKind: OreKind;
  spawn: { x: number; y: number };
  ladderDown: { x: number; y: number };
  monsters: { x: number; y: number; health: number; damage: number }[];
}

export const FLOOR_WIDTH = 24;
export const FLOOR_HEIGHT = 16;

export function oreKindForDepth(depth: number): OreKind {
  if (depth < 5) return 'copper';
  if (depth < 10) return 'iron';
  return 'gold';
}

/** Monster stats scale gently with depth so deeper floors are genuinely harder. */
export function monsterStatsForDepth(depth: number): { health: number; damage: number } {
  return { health: 10 + depth * 4, damage: 3 + Math.floor(depth / 2) };
}

/**
 * Carves a simple series of overlapping rectangular rooms connected in a
 * chain, in the spirit of a classic roguelike room generator. Deterministic
 * for a given depth, so revisiting the same floor gives the same layout.
 */
export function generateFloor(depth: number): MineFloor {
  const random = seededRandom(depth * 7919 + 13);
  const w = FLOOR_WIDTH;
  const h = FLOOR_HEIGHT;
  const tiles: MineTile[][] = Array.from({ length: h }, () => Array.from({ length: w }, () => 'wall' as MineTile));

  const carveRoom = (cx: number, cy: number, rw: number, rh: number) => {
    const x0 = Math.max(1, cx - Math.floor(rw / 2));
    const y0 = Math.max(1, cy - Math.floor(rh / 2));
    const x1 = Math.min(w - 2, x0 + rw);
    const y1 = Math.min(h - 2, y0 + rh);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) tiles[y][x] = 'floor';
    }
  };
  const carveCorridor = (x0: number, y0: number, x1: number, y1: number) => {
    let x = x0;
    let y = y0;
    while (x !== x1) {
      tiles[y][x] = 'floor';
      x += x < x1 ? 1 : -1;
    }
    while (y !== y1) {
      tiles[y][x] = 'floor';
      y += y < y1 ? 1 : -1;
    }
    tiles[y][x] = 'floor';
  };

  const roomCount = 5 + Math.floor(random() * 3);
  const centers: { x: number; y: number }[] = [];
  for (let i = 0; i < roomCount; i++) {
    const cx = 3 + Math.floor(random() * (w - 6));
    const cy = 3 + Math.floor(random() * (h - 6));
    const rw = 3 + Math.floor(random() * 4);
    const rh = 3 + Math.floor(random() * 3);
    carveRoom(cx, cy, rw, rh);
    centers.push({ x: cx, y: cy });
  }
  for (let i = 1; i < centers.length; i++) {
    carveCorridor(centers[i - 1].x, centers[i - 1].y, centers[i].x, centers[i].y);
  }

  const spawn = centers[0];
  tiles[spawn.y][spawn.x] = 'floor';

  // Ladder down: the floor tile farthest from spawn (by grid distance), so
  // you always have to explore a bit to find it.
  let ladderDown = centers[centers.length - 1];
  let bestDist = -1;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      if (tiles[y][x] !== 'floor') continue;
      const dist = Math.abs(x - spawn.x) + Math.abs(y - spawn.y);
      if (dist > bestDist) {
        bestDist = dist;
        ladderDown = { x, y };
      }
    }
  }
  tiles[ladderDown.y][ladderDown.x] = 'ladderDown';

  // Scatter a handful of ore rocks onto wall tiles adjacent to floors.
  const oreCount = 4 + Math.floor(random() * 4);
  let placed = 0;
  let attempts = 0;
  while (placed < oreCount && attempts < 500) {
    attempts++;
    const x = 1 + Math.floor(random() * (w - 2));
    const y = 1 + Math.floor(random() * (h - 2));
    if (tiles[y][x] !== 'wall') continue;
    const hasFloorNeighbor = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ].some(([nx, ny]) => tiles[ny]?.[nx] === 'floor');
    if (!hasFloorNeighbor) continue;
    tiles[y][x] = 'ore';
    placed++;
  }

  const monsterCount = Math.min(4, 1 + Math.floor(depth / 3));
  const stats = monsterStatsForDepth(depth);
  const monsters: MineFloor['monsters'] = [];
  attempts = 0;
  while (monsters.length < monsterCount && attempts < 500) {
    attempts++;
    const x = 1 + Math.floor(random() * (w - 2));
    const y = 1 + Math.floor(random() * (h - 2));
    if (tiles[y][x] !== 'floor') continue;
    if (Math.abs(x - spawn.x) + Math.abs(y - spawn.y) < 4) continue; // not right on top of the player
    monsters.push({ x, y, health: stats.health, damage: stats.damage });
  }

  return { width: w, height: h, tiles, oreKind: oreKindForDepth(depth), spawn, ladderDown, monsters };
}
