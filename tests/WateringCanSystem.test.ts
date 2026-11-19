import { describe, expect, it } from 'vitest';
import { CAN_CAPACITY, canAction, canFillFrom, pourWater, refillCan } from '../src/systems/WateringCanSystem';

describe('watering can', () => {
  it('a full can waters 15 times, then is empty until refilled', () => {
    expect(CAN_CAPACITY).toBe(15);
    let water = refillCan();
    for (let i = 0; i < 15; i++) {
      const r = pourWater(water);
      expect(r.poured).toBe(true);
      water = r.water;
    }
    expect(water).toBe(0);
    expect(pourWater(water)).toEqual({ water: 0, poured: false });
  });

  it('fills only next to water', () => {
    const pond = (x: number, y: number) => x === 5 && y === 5;
    expect(canFillFrom({ x: 5, y: 5 }, { x: 0, y: 0 }, pond)).toBe(true); // aiming at it
    expect(canFillFrom({ x: 0, y: 0 }, { x: 4, y: 4 }, pond)).toBe(true); // standing beside it
    expect(canFillFrom({ x: 0, y: 0 }, { x: 3, y: 5 }, pond)).toBe(false);
  });

  it('waters first, fills when it can, says when empty', () => {
    expect(canAction(5, true, false, true)).toBe('water');
    expect(canAction(0, true, false, true)).toBe('fill');
    expect(canAction(0, true, false, false)).toBe('empty');
    expect(canAction(5, true, true, true)).toBe('fill'); // aiming at the water itself
    expect(canAction(CAN_CAPACITY, false, true, true)).toBe('none');
    expect(canAction(3, false, false, false)).toBe('none');
  });
});
