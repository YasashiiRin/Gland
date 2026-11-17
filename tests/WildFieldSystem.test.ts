import { describe, expect, it } from 'vitest';
import { isReaped, pruneWildFields, reapWildRice, seasonStamp, wildFieldKey } from '../src/systems/WildFieldSystem';

describe('village rice fields', () => {
  const spring = seasonStamp({ season: 'spring', year: 1 });
  const summer = seasonStamp({ season: 'summer', year: 1 });
  const key = wildFieldKey('QuangTri', 10, 40);

  it('gives a season its own stamp', () => {
    expect(summer).toBe(spring + 1);
    expect(seasonStamp({ season: 'spring', year: 2 })).toBe(spring + 4);
  });

  it('reaps a tile once per season, then it grows back next season', () => {
    const first = reapWildRice({}, key, spring, () => 0.01);
    expect(first?.rice).toBe(2);
    expect(reapWildRice(first?.fields ?? {}, key, spring)).toBeNull();
    expect(isReaped(first?.fields ?? {}, key, summer)).toBe(false);
    expect(reapWildRice(first?.fields ?? {}, key, summer, () => 0.9)?.rice).toBe(0);
  });

  it('forgets harvests from past seasons', () => {
    expect(pruneWildFields({ a: spring, b: summer }, summer)).toEqual({ b: summer });
  });
});
