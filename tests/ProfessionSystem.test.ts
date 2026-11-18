import { describe, expect, it } from 'vitest';
import { becomeThayPhap, bookChance, cast, dailyLinhLuc, ghostDropChance, learn, passiveReached, reorder, sanityLossMultiplier } from '../src/systems/ProfessionSystem';

describe('Thầy pháp', () => {
  it('starts with 5 linh lực and gains one a day up to 100', () => {
    let p = becomeThayPhap();
    expect(p.linhLuc).toBe(5);
    p = dailyLinhLuc(p);
    expect(p.linhLuc).toBe(6);
    expect(dailyLinhLuc({ ...p, linhLuc: 100 }).linhLuc).toBe(100);
  });

  it('learns a skill once and pays 0.4 linh lực for Khai nhãn', () => {
    const p = learn(becomeThayPhap(), 'khai_nhan')!;
    expect(learn(p, 'khai_nhan')).toBeNull();
    const r = cast(p, 'khai_nhan');
    expect('state' in r && r.state.linhLuc).toBe(4.6);
    expect(cast({ ...p, linhLuc: 0.3 }, 'khai_nhan')).toEqual({ reason: 'Không đủ linh lực' });
    expect(cast(becomeThayPhap(), 'khai_nhan')).toEqual({ reason: 'Chưa học kỹ năng này' });
  });

  it('passives follow the current linh lực', () => {
    expect(passiveReached({ ...becomeThayPhap(), linhLuc: 10 }, 10)).toBe(true);
    expect(passiveReached({ ...becomeThayPhap(), linhLuc: 9.6 }, 10)).toBe(false);
  });

  it('reorders the skill bar', () => {
    expect(reorder(['khai_nhan'], 0, 0)).toEqual(['khai_nhan']);
    const bar = ['a', 'b', 'c'] as never[];
    expect(reorder(bar, 0, 2)).toEqual(['b', 'c', 'a']);
  });

  it('drop chances follow the agreed numbers', () => {
    expect(bookChance(10)).toBeCloseTo(0.05);
    expect(bookChance(1000)).toBe(0.5);
    expect(ghostDropChance(0.05)).toBeCloseTo(0.005);
    expect(sanityLossMultiplier(becomeThayPhap())).toBe(1.5);
    expect(sanityLossMultiplier(null)).toBe(1);
  });
});
