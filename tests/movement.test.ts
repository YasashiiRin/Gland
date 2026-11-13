import { describe, expect, it } from 'vitest';
import { computeMovement } from '../src/systems/movement';

const none = { up: false, down: false, left: false, right: false };

describe('computeMovement', () => {
  it('stands still with no keys and keeps facing', () => {
    const r = computeMovement(none, 100, 'left');
    expect(r).toEqual({ vx: 0, vy: 0, facing: 'left', moving: false });
  });

  it('moves straight at full speed', () => {
    const r = computeMovement({ ...none, right: true }, 100, 'down');
    expect(r.vx).toBe(100);
    expect(r.vy).toBe(0);
    expect(r.facing).toBe('right');
  });

  it('normalizes diagonal speed', () => {
    const r = computeMovement({ ...none, up: true, right: true }, 100, 'down');
    expect(Math.hypot(r.vx, r.vy)).toBeCloseTo(100);
    expect(r.vx).toBeGreaterThan(0);
    expect(r.vy).toBeLessThan(0);
  });

  it('keeps previous facing on diagonals when it is still pressed', () => {
    expect(computeMovement({ ...none, up: true, right: true }, 100, 'up').facing).toBe('up');
    expect(computeMovement({ ...none, up: true, right: true }, 100, 'down').facing).toBe('right');
  });

  it('cancels opposite keys', () => {
    const r = computeMovement({ ...none, left: true, right: true }, 100, 'up');
    expect(r.moving).toBe(false);
  });
});
