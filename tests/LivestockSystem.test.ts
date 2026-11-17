import { describe, expect, it } from 'vitest';
import {
  advanceLivestockDay,
  createLivestock,
  pickWander,
  sizeScale,
  steer,
  tickLivestock,
  WHIP_FEAR_RADIUS,
} from '../src/systems/LivestockSystem';

describe('livestock', () => {
  it('gets hungry over time and grazes on grass; buffaloes graze best', () => {
    const cow = createLivestock('a', 'cow', 'QuangBinh', 0, 0);
    expect(tickLivestock(cow, 120, false).hunger).toBeGreaterThan(cow.hunger);
    expect(tickLivestock(cow, 120, true).hunger).toBeLessThan(cow.hunger);
    const hen = createLivestock('b', 'chicken', 'QuangBinh', 0, 0);
    expect(tickLivestock(hen, 120, true).hunger).toBeGreaterThan(tickLivestock({ ...hen, kind: 'buffalo' }, 120, true).hunger);
  });

  it('grows each day when fed, not when starving', () => {
    const fed = { ...createLivestock('a', 'pig', 'Farm', 0, 0), hunger: 10 };
    expect(advanceLivestockDay(fed).growth).toBeGreaterThan(0);
    expect(advanceLivestockDay({ ...fed, hunger: 90 }).growth).toBe(0);
    expect(sizeScale(100)).toBeGreaterThan(sizeScale(0));
  });

  it('runs away from a nearby whip, ignores a far one', () => {
    const near = steer({ x: 10, y: 0 }, { dx: 0, dy: 0 }, { x: 0, y: 0 });
    expect(near.fleeing).toBe(true);
    expect(near.dx).toBeGreaterThan(0);
    const far = steer({ x: WHIP_FEAR_RADIUS + 10, y: 0 }, { dx: 0, dy: 1 }, { x: 0, y: 0 });
    expect(far).toEqual({ dx: 0, dy: 1, fleeing: false });
  });

  it('sometimes stands still to graze', () => {
    expect(pickWander(() => 0.1)).toEqual({ dx: 0, dy: 0 });
    const move = pickWander(() => 0.9);
    expect(Math.hypot(move.dx, move.dy)).toBeCloseTo(1, 2);
  });
});
