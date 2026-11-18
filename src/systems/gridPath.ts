/** Tiles as [x, y]. */
export type TilePath = { x: number; y: number }[];

/**
 * Breadth-first search on the tile grid (4 directions) from `start` to the
 * first tile `isGoal` accepts, stepping only on `walkable` tiles and giving
 * up after `maxNodes`. Returns the tiles from start to goal, or null.
 */
export function findPath(
  start: { x: number; y: number },
  walkable: (x: number, y: number) => boolean,
  isGoal: (x: number, y: number) => boolean,
  maxNodes = 12000,
): TilePath | null {
  const key = (x: number, y: number) => `${x},${y}`;
  const prev = new Map<string, string | null>([[key(start.x, start.y), null]]);
  const queue: [number, number][] = [[start.x, start.y]];
  for (let head = 0; head < queue.length && head < maxNodes; head++) {
    const [x, y] = queue[head];
    if (isGoal(x, y) && (x !== start.x || y !== start.y)) {
      const path: TilePath = [];
      for (let k: string | null = key(x, y); k; k = prev.get(k) ?? null) {
        const [px, py] = k.split(',').map(Number);
        path.push({ x: px, y: py });
      }
      return path.reverse();
    }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      const k = key(nx, ny);
      if (prev.has(k) || !walkable(nx, ny)) continue;
      prev.set(k, key(x, y));
      queue.push([nx, ny]);
    }
  }
  return null;
}
