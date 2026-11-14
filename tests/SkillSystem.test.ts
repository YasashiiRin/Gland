import { describe, expect, it } from 'vitest';
import {
  addXp,
  createInitialSkills,
  levelForXp,
  MAX_LEVEL,
  xpForLevel,
  xpToNextLevel,
} from '../src/systems/SkillSystem';

describe('xpForLevel / levelForXp', () => {
  it('level 1 needs 0 XP', () => {
    expect(xpForLevel(1)).toBe(0);
    expect(levelForXp(0)).toBe(1);
  });

  it('is monotonically increasing', () => {
    let prev = xpForLevel(1);
    for (let lvl = 2; lvl <= MAX_LEVEL; lvl++) {
      const v = xpForLevel(lvl);
      expect(v).toBeGreaterThan(prev);
      prev = v;
    }
  });

  it('levelForXp matches the thresholds exactly at the boundary', () => {
    const lvl5Xp = xpForLevel(5);
    expect(levelForXp(lvl5Xp)).toBe(5);
    expect(levelForXp(lvl5Xp - 1)).toBe(4);
  });

  it('never exceeds MAX_LEVEL however much XP is given', () => {
    expect(levelForXp(1_000_000)).toBe(MAX_LEVEL);
  });
});

describe('xpToNextLevel', () => {
  it('is zero at max level', () => {
    expect(xpToNextLevel(xpForLevel(MAX_LEVEL))).toBe(0);
  });

  it('counts down correctly below max level', () => {
    const need = xpToNextLevel(0);
    expect(need).toBe(xpForLevel(2));
  });
});

describe('addXp', () => {
  it('accumulates XP for just the given skill', () => {
    const skills = createInitialSkills();
    const r = addXp(skills, 'farming', 10);
    expect(r.skills.farming).toBe(10);
    expect(r.skills.mining).toBe(0);
  });

  it('reports leveledUp exactly when a threshold is crossed', () => {
    const skills = createInitialSkills();
    const need = xpForLevel(2);
    const r1 = addXp(skills, 'mining', need - 1);
    expect(r1.leveledUp).toBe(false);
    const r2 = addXp(r1.skills, 'mining', 1);
    expect(r2.leveledUp).toBe(true);
    expect(r2.newLevel).toBe(2);
  });
});
