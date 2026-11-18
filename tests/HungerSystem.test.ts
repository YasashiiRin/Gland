import { describe, expect, it } from 'vitest';
import { DAY_LENGTH_MINUTES } from '../src/config/time';
import { createInitialHunger, drainHunger, feed, HUNGER, starvationDamage } from '../src/systems/HungerSystem';
import { ITEMS } from '../src/data/items';

describe('HungerSystem', () => {
  it('empties by perDay over a game day', () => {
    const h = drainHunger(createInitialHunger(), DAY_LENGTH_MINUTES);
    expect(h.current).toBeCloseTo(HUNGER.max - HUNGER.perDay);
    expect(drainHunger(h, DAY_LENGTH_MINUTES * 5).current).toBe(0);
  });

  it('only starving costs health', () => {
    expect(starvationDamage(createInitialHunger(), 60)).toBe(0);
    expect(starvationDamage({ current: 0, max: 150 }, 60)).toBe(HUNGER.starveHealthPerHour);
  });

  it('eating fills the stomach up to its size', () => {
    expect(feed({ current: 140, max: 150 }, 45).current).toBe(150);
    expect(ITEMS.com_nam.food?.hunger).toBeGreaterThan(0);
    expect(ITEMS.potato.food?.hunger).toBeGreaterThan(0);
  });
});
