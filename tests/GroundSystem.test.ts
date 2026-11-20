import { describe, expect, it } from 'vitest';
import { advanceDay, plotGrass, plantSeed, tillPlot, weedPlot } from '../src/systems/FarmingSystem';
import { advanceGroundDay, clearEdit, digPath, hoeAction, pathLook, pave, unpave } from '../src/systems/GroundSystem';

const K = 'Map:1,1';

describe('paths in the grass', () => {
  it('a hoed path grows faint grass after 3 days and is grass again after 5', () => {
    let e = digPath({}, K, 10);
    expect(pathLook(e[K], 12)).toBe('bare');
    expect(pathLook(e[K], 13)).toBe('faint');
    e = advanceGroundDay(e, 14);
    expect(e[K]).toBeDefined();
    e = advanceGroundDay(e, 15);
    expect(e[K]).toBeUndefined();
  });

  it('clearing a path again starts the count afresh', () => {
    let e = digPath({}, K, 10);
    e = digPath(e, K, 13);
    expect(pathLook(e[K], 14)).toBe('bare');
    expect(advanceGroundDay(e, 17)[K]).toBeDefined();
  });

  it('paving stops the grass; prising it up lets it grow again from that day', () => {
    let e = pave(digPath({}, K, 1), K)!;
    expect(pathLook(e[K], 100)).toBe('stone');
    expect(advanceGroundDay(e, 100)[K]?.kind).toBe('stone');
    expect(pave({}, K)).toBeNull(); // only on a dirt path
    e = unpave(e, K, 100)!;
    expect(e[K]).toEqual({ kind: 'path', madeDay: 100 });
    expect(advanceGroundDay(e, 105)[K]).toBeUndefined();
    expect(clearEdit(e, K)).toEqual({});
  });

  it('the hoe: grass -> path -> plot, clears what grows back, stops at paving', () => {
    const grass = { ground: 'grass' as const, blocked: false };
    expect(hoeAction(grass, 1)).toBe('dig');
    expect(hoeAction({ ...grass, blocked: true }, 1)).toBe('none');
    expect(hoeAction({ ground: 'dirt', blocked: false }, 1)).toBe('tillDirt');
    expect(hoeAction({ ...grass, edit: { kind: 'path', madeDay: 1 } }, 2)).toBe('tillPath');
    expect(hoeAction({ ...grass, edit: { kind: 'path', madeDay: 1 } }, 4)).toBe('weedPath');
    expect(hoeAction({ ...grass, edit: { kind: 'stone', madeDay: 1 } }, 4)).toBe('paved');
    expect(hoeAction({ ...grass, plot: { faint: true } }, 4)).toBe('weedPlot');
    expect(hoeAction({ ...grass, plot: { faint: false } }, 4)).toBe('none');
  });
});

describe('empty plots going back to grass', () => {
  it('an empty plot hoed out of grass is faint after 3 days, gone after 5', () => {
    let p = tillPlot({}, K, 10);
    expect(plotGrass(p[K], 13)).toBe('faint');
    p = advanceDay(p, 'spring', false, 14);
    expect(p[K]).toBeDefined();
    p = advanceDay(p, 'spring', false, 15);
    expect(p[K]).toBeUndefined();
  });

  it('a crop keeps the grass off; weeding restarts the count', () => {
    let p = plantSeed(tillPlot({}, K, 10), K, 'parsnip', 'winter');
    p = advanceDay(p, 'spring', true, 16);
    expect(p[K]?.cropId).toBe('parsnip');
    expect(plotGrass(p[K], 16)).toBe('bare');
    let q = tillPlot({}, K, 10);
    q = weedPlot(q, K, 13);
    expect(advanceDay(q, 'spring', false, 16)[K]).toBeDefined();
  });

  it('plots not hoed out of grass (old saves, prebuilt fields) never go back', () => {
    const p = advanceDay(tillPlot({}, K), 'spring', false, 99);
    expect(p[K]).toBeDefined();
  });
});
