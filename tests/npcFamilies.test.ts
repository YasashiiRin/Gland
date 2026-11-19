import { describe, expect, it } from 'vitest';
import { childAtHome, childAtPasture } from '../src/systems/npc/child';
import { NPC_CONFIG as cfg } from '../src/systems/npc/config';
import { createFamily } from '../src/systems/npc/families';

const home = (key: string, members: number) => ({ key, members, grazer: true, chickens: false, plots: [{ cols: 3, rows: 2 }, { cols: 3, rows: 2 }] });

describe('NPC families', () => {
  it('one person: a man alone without animals; otherwise a couple or a family with animals', () => {
    const lone = createFamily(home('a', 1), 0, cfg);
    expect(lone.type).toBe(1);
    expect(lone.members.map((m) => m.role)).toEqual(['husband']);
    expect(lone.livestock).toEqual([]);
    expect(lone.buffalo).toBeNull();
    const types = new Set<number>();
    for (let i = 0; i < 40; i++) {
      const f = createFamily(home(`k${i}`, 3), 0, cfg);
      types.add(f.type);
      expect(f.livestock).toContain('buffalo');
      expect(f.pastureId).not.toBeNull();
      expect(f.members.length).toBe(f.type);
    }
    expect([...types].sort()).toEqual([2, 3]);
  });

  it('the same house always gets the same family', () => {
    expect(createFamily(home('Map:h1', 3), 0, cfg)).toEqual(createFamily(home('Map:h1', 3), 0, cfg));
  });
});

describe('a child minding the buffalo', () => {
  const far = cfg.child.buffaloRadiusTiles + 1;
  it('keeping close to the buffalo comes before play', () => {
    expect(childAtPasture(far, 1, 0, 1, cfg)).toBe('follow');
    expect(childAtPasture(2, 1, 0, 1, cfg)).toBe('chase');
  });

  it('otherwise follows, rides or naps, changing every few minutes', () => {
    const seen = new Set<string>();
    for (let m = 0; m < 2000; m += cfg.child.behaviourMinutes) seen.add(childAtPasture(2, null, m, 7, cfg));
    expect([...seen].sort()).toEqual(['follow', 'nap', 'ride']);
  });

  it('plays tag at home with a child within 10 m', () => {
    expect(childAtHome(cfg.child.playRadiusTiles - 1, cfg)).toBe('chase');
    expect(childAtHome(cfg.child.playRadiusTiles + 1, cfg)).toBe('play');
    expect(childAtHome(null, cfg)).toBe('play');
  });
});
