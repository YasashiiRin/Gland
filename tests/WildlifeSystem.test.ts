import { describe, expect, it } from 'vitest';
import { landingTile, nearestBoat } from '../src/systems/BoatSystem';
import { createBeast, pickDens, stepBeast, TIGER, tigerDamage } from '../src/systems/WildlifeSystem';

const still = { dx: 0, dy: 0 };

describe('tiger', () => {
  it('roars a warning before it attacks', () => {
    const t = createBeast(0, 0);
    const near = { x: 3 * 16, y: 0 };
    const s1 = stepBeast(t, 0.1, near, still);
    expect(s1.roared).toBe(true);
    expect(s1.beast.mode).toBe('warn');
    expect(s1.struck).toBe(false);
    // Still close when the roar ends: it charges and strikes.
    let b = { ...s1.beast, timer: 0 };
    b = stepBeast(b, 0.1, near, still).beast;
    expect(b.mode).toBe('charge');
    let struck = false;
    for (let i = 0; i < 60 && !struck; i++) {
      const s = stepBeast(b, 0.05, near, still);
      b = s.beast;
      struck = s.struck;
    }
    expect(struck).toBe(true);
    expect(b.mode).toBe('rest');
  });

  it('lets you go if you back off during the warning', () => {
    const warned = stepBeast(createBeast(0, 0), 0.1, { x: 40, y: 0 }, still).beast;
    expect(stepBeast(warned, 0.1, { x: TIGER.noticeRange * 2, y: 0 }, still).beast.mode).toBe('roam');
  });

  it('hits very hard', () => {
    expect(tigerDamage(100)).toBeGreaterThanOrEqual(40);
  });

  it('makes its den in deep forest, away from safe zones', () => {
    const tree = (x: number, y: number) => x < 50 && (x + y) % 3 !== 0;
    const dens = pickDens(100, 60, tree, [{ x0: 0, y0: 0, x1: 20, y1: 60 }], 3);
    expect(dens.length).toBeGreaterThan(0);
    for (const d of dens) {
      expect(d.x).toBeGreaterThan(20);
      expect(d.x).toBeLessThan(50);
    }
  });
});

describe('boats', () => {
  it('finds the nearest boat on this map', () => {
    const boats = [
      { id: 'a', spot: { mapKey: 'QuangBinh' as const, x: 0, y: 0 } },
      { id: 'b', spot: { mapKey: 'QuangBinh' as const, x: 15, y: 0 } },
      { id: 'c', spot: { mapKey: 'Hue' as const, x: 1, y: 0 } },
    ];
    expect(nearestBoat(boats, 'QuangBinh', 12, 0)).toBe('b');
    expect(nearestBoat(boats, 'QuangBinh', 200, 0)).toBeNull();
  });

  it('steps ashore on the facing side first, or nowhere', () => {
    const land = (x: number, y: number) => x === 6 && y === 5;
    expect(landingTile(5, 5, { dx: 1, dy: 0 }, land)).toEqual({ x: 6, y: 5 });
    expect(landingTile(5, 5, { dx: 1, dy: 0 }, () => false)).toBeNull();
  });
});
