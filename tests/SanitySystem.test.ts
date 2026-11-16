import { describe, expect, it } from 'vitest';
import { ghostHitDamage, ghostsCanAttack, rollPanic, sanitySpeedPenalty, scareLoss } from '../src/systems/SanitySystem';

describe('SanitySystem', () => {
  it('each scare of the night hurts more, up to a cap', () => {
    expect(scareLoss(0, 'on')).toBe(12);
    expect(scareLoss(1, 'on')).toBe(16);
    expect(scareLoss(10, 'on')).toBe(30);
    expect(scareLoss(0, 'mild')).toBe(6);
    expect(scareLoss(0, 'off')).toBe(0);
  });

  it('every 10% of sanity lost slows you by 3%', () => {
    expect(sanitySpeedPenalty({ current: 100, max: 100 }).speed).toBeCloseTo(0);
    expect(sanitySpeedPenalty({ current: 85, max: 100 }).speed).toBeCloseTo(-0.03);
    expect(sanitySpeedPenalty({ current: 30, max: 100 }).speed).toBeCloseTo(-0.21);
  });

  it('ghosts attack only at night in full mode with sanity nearly gone', () => {
    expect(ghostsCanAttack({ current: 10, max: 100 }, 'on', true)).toBe(true);
    expect(ghostsCanAttack({ current: 10, max: 100 }, 'on', false)).toBe(false);
    expect(ghostsCanAttack({ current: 10, max: 100 }, 'mild', true)).toBe(false);
    expect(ghostsCanAttack({ current: 40, max: 100 }, 'on', true)).toBe(false);
  });

  it('ghost hits stack 5%, 10%, 15% … capped at 25%', () => {
    expect(ghostHitDamage(0, 100)).toBeCloseTo(5);
    expect(ghostHitDamage(2, 100)).toBeCloseTo(15);
    expect(ghostHitDamage(9, 100)).toBeCloseTo(25);
  });

  it('panic sometimes slows you to 60% or 80% for 2 seconds', () => {
    expect(rollPanic(() => 0.9)).toBeNull();
    const p = rollPanic(() => 0.1);
    expect(p?.ms).toBe(2000);
    expect([0.6, 0.8]).toContain(p?.multiplier);
  });
});
