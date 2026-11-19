import { describe, expect, it } from 'vitest';
import { findPath } from '../src/systems/gridPath';

describe('grid path', () => {
  it('finds a way round obstacles', () => {
    const wall = new Set(['1,0', '1,1']);
    const path = findPath({ x: 0, y: 0 }, (x, y) => x >= 0 && y >= 0 && x < 3 && y < 3 && !wall.has(`${x},${y}`), (x, y) => x === 2 && y === 0);
    expect(path?.length).toBe(7);
    expect(findPath({ x: 0, y: 0 }, () => false, () => true)).toBeNull();
  });
});
