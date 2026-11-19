import { describe, expect, it } from 'vitest';
import { NPC_CONFIG as cfg } from '../src/systems/npc/config';
import { buildFamily } from '../src/systems/npc/families';
import { simulateFamily, startTalk, type SimEnv } from '../src/systems/npc/sim';
import type { FamilyState, FamilyType, LivestockKind, Npc } from '../src/systems/npc/types';

const T = (day: number, hh: number, mm = 0) => day * 1440 + hh * 60 + mm;
const env = (raining = false): SimEnv => ({ layout: { minutes: () => 20 }, raining: () => raining, cfg });

function family(type: FamilyType, livestock: LivestockKind[] = [], market = false, field = { cols: 4, rows: 2 }): FamilyState {
  const f = buildFamily('test:home', type, livestock, field, T(1, 0), cfg);
  return { ...f, marketCounter: market ? 0 : 1 };
}

function run(f: FamilyState, to: number, e = env()): FamilyState {
  return simulateFamily(f, e, to).family;
}

const who = (f: FamilyState, role: Npc['role']) => f.members.find((m) => m.role === role)!;
const where = (n: Npc) => ('place' in n.position ? n.position.place : `->${n.position.to}`);

describe('NPC family day (Monday = day 1)', () => {
  it('the husband: sweep, breakfast, field at 7:00, lunch, home at 16:30, tea, dinner, porch, bed', () => {
    let f = family(3);
    const at = (h: number, m = 0) => {
      f = run(f, T(1, h, m));
      return who(f, 'husband');
    };
    expect(at(5, 10).state).toBe('sweep');
    expect(at(6, 45).state).toBe('eat');
    expect(where(at(7, 5))).toBe('->field');
    expect(where(at(7, 30))).toBe('field');
    expect(['work', 'weed']).toContain(at(9).state);
    expect(at(12).state).toBe('lunch');
    expect(where(at(16, 35))).toBe('->home');
    expect(at(17, 30).state).toBe('tea');
    expect(at(18, 30).state).toBe('eat');
    expect(at(20).state).toBe('porch');
    expect(at(22).state).toBe('sleep');
  });

  it('the wife feeds the chickens at 5:30 and leads the buffalo out at 7:00, home at 16:00', () => {
    let f = family(2, ['chicken', 'buffalo']);
    f = run(f, T(1, 5, 35));
    expect(who(f, 'wife').state).toBe('feedLivestock');
    f = run(f, T(1, 7, 5));
    expect(where(who(f, 'wife'))).toBe('->pasture');
    expect(f.buffalo?.ledBy).toBe(who(f, 'wife').id);
    f = run(f, T(1, 7, 30));
    expect(f.buffalo?.at).toBe('pasture');
    expect(where(who(f, 'wife'))).toBe('->field');
    f = run(f, T(1, 16, 5));
    expect(where(who(f, 'wife'))).toBe('->pasture');
    f = run(f, T(1, 16, 40));
    expect(where(who(f, 'husband'))).toBe('->home'); // left at 16:30
    f = run(f, T(1, 17, 0));
    expect(f.buffalo).toMatchObject({ at: 'home', ledBy: null });
  });

  it('market day: the wife goes at 16:00 for 20 minutes; whoever is home first fetches the buffalo', () => {
    let f = family(2, ['buffalo'], true);
    f = run(f, T(1, 16, 5));
    expect(where(who(f, 'wife'))).toBe('->market');
    f = run(f, T(1, 16, 50)); // 45 min walk
    expect(who(f, 'wife').state).toBe('market');
    f = run(f, T(1, 16, 55)); // husband home at 16:50
    expect(f.buffaloReturnClaimedBy).toBe(who(f, 'husband').id);
    expect(where(who(f, 'husband'))).toBe('->pasture');
    f = run(f, T(1, 17, 10));
    expect(where(who(f, 'wife'))).toBe('->home');
    expect(who(f, 'wife').marketDoneDay).toBe(1);
    f = run(f, T(1, 18, 0));
    expect(f.buffalo?.at).toBe('home');
    expect(where(who(f, 'wife'))).toBe('home');
  });

  it('a man alone goes to market at 15:00 on his market day', () => {
    let f = family(1, [], true);
    f = run(f, T(1, 15, 5));
    expect(where(who(f, 'husband'))).toBe('->market');
    f = run(f, T(1, 16, 20)); // 45 min there, 20 min at market, then straight home
    expect(where(who(f, 'husband'))).toBe('->home');
    f = run(f, T(1, 17, 0));
    expect(where(who(f, 'husband'))).toBe('home');
  });

  it('a man alone markets every 3 days, a couple daily, a family every other day', () => {
    const days = (type: FamilyType) => {
      let f = family(type, [], true);
      const seen: number[] = [];
      for (let d = 1; d <= 6; d++) {
        f = run(f, T(d, 17, 0));
        if (f.marketCounter === 0) seen.push(d);
      }
      return seen;
    };
    expect(days(1)).toEqual([1, 4]);
    expect(days(2)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(days(3)).toEqual([1, 3, 5]);
  });

  it('the child goes to school on weekdays and plays in the yard after', () => {
    let f = family(3);
    f = run(f, T(1, 6, 35));
    expect(where(who(f, 'child'))).toBe('->school');
    f = run(f, T(1, 12));
    expect(who(f, 'child').state).toBe('school');
    f = run(f, T(1, 17));
    expect(who(f, 'child').state).toBe('play');
  });

  it('weekend: the child takes the buffalo out and minds it, the mother goes straight to the field', () => {
    let f = family(3, ['buffalo'], false);
    f = { ...f, simMinute: T(6, 0) }; // Saturday
    f = run(f, T(6, 7, 5));
    expect(f.buffalo?.ledBy).toBe(who(f, 'child').id);
    expect(where(who(f, 'wife'))).toBe('->field');
    f = run(f, T(6, 12));
    expect(who(f, 'child').state).toBe('herd');
    expect(f.buffalo?.at).toBe('pasture');
    f = run(f, T(6, 16, 5));
    expect(f.buffalo?.ledBy).toBe(who(f, 'child').id);
    f = run(f, T(6, 17));
    expect(f.buffalo?.at).toBe('home');
  });

  it('farms season after season: sows, waters, harvests, carries the piles home', () => {
    let f = family(2, ['chicken']);
    let mostPiles = 0;
    for (let d = 1; d <= 30; d++) {
      f = run(f, T(d, 20));
      mostPiles = Math.max(mostPiles, f.yardPiles.length);
    }
    expect(f.field!.seasonIndex).toBeGreaterThanOrEqual(2);
    expect(mostPiles).toBeGreaterThan(0);
    expect(mostPiles).toBeLessThanOrEqual(cfg.yardPiles.max);
    expect(f.field!.cells.some((c) => c.state === 'DEAD')).toBe(false);
  });

  it('yard piles last 3 days', () => {
    let f = { ...family(1), yardPiles: [1, 1, 2] };
    f = run(f, T(4, 0, 1));
    expect(f.yardPiles).toEqual([2]);
  });

  it('rain waters the field for them', () => {
    let f = family(2);
    f = run(f, T(2, 16), env(false));
    expect(f.field!.cells.some((c) => c.state === 'SEEDED' || c.state === 'GROWING')).toBe(true);
    f = run(f, T(3, 6), env(true));
    const planted = f.field!.cells.filter((c) => c.state === 'GROWING' || c.state === 'SEEDED');
    expect(planted.every((c) => c.wateredToday)).toBe(true);
  });

  it('catching up in one go gives the same result as minute by minute', () => {
    const start = family(3, ['chicken', 'buffalo'], true);
    const once = run(start, T(5, 13, 7));
    let step = start;
    for (let t = T(1, 0); t < T(5, 13, 7); t += 7) step = run(step, Math.min(t + 7, T(5, 13, 7)));
    expect(JSON.stringify(step)).toBe(JSON.stringify(once));
  });

  it('a talk is cut short 5 minutes before the next slot, then they hurry off (+50%)', () => {
    let f = run(family(1), T(1, 16, 20));
    const id = who(f, 'husband').id;
    const talk = startTalk(f, id, T(1, 16, 20), env());
    expect(talk.farewell).toBe(false);
    f = talk.family;
    const r = simulateFamily(f, env(), T(1, 16, 26));
    expect(r.events).toEqual([{ kind: 'farewell', npcId: id }]);
    f = run(r.family, T(1, 16, 32));
    expect(where(who(f, 'husband'))).toBe('->home');
    expect(who(f, 'husband').speedMultiplier).toBe(cfg.lateness.hurrySpeedMultiplier);
  });

  it('talking right before leaving: just a goodbye', () => {
    const f = run(family(1), T(1, 16, 27));
    expect(startTalk(f, who(f, 'husband').id, T(1, 16, 27), env()).farewell).toBe(true);
  });

  it('more than 30 minutes late: drops the job and hurries', () => {
    let f = run(family(1), T(1, 16, 29));
    const h = who(f, 'husband');
    f = { ...f, members: [{ ...h, currentTask: { kind: 'hoe', cell: 0, until: T(1, 23) } }] };
    f = run(f, T(1, 16, 50));
    expect(where(who(f, 'husband'))).toBe('field');
    f = run(f, T(1, 17, 1));
    expect(where(who(f, 'husband'))).toBe('->home');
    expect(who(f, 'husband').speedMultiplier).toBe(1.5);
    expect(f.field!.cells[0].reservedBy).toBeNull();
  });
});
