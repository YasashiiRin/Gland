import { describe, expect, it } from 'vitest';
import { advanceDay, harvestPlot, mayHarvest, sowField, type FarmPlots } from '../src/systems/FarmingSystem';
import { isSowableField, regrowFields } from '../src/systems/WildFieldSystem';

const KEY = 'QuangBinh:240,300';

describe('landmark fields', () => {
  it('sows straight onto reaped stubble, owned by the sower', () => {
    expect(isSowableField({ [KEY]: 7 }, KEY, 7)).toBe(true);
    expect(isSowableField({ [KEY]: 6 }, KEY, 7)).toBe(false);
    const plots = sowField({}, KEY, 'parsnip', 'An', 'winter');
    expect(plots[KEY]).toMatchObject({ tilled: true, cropId: 'parsnip', owner: 'An' });
    expect(sowField(plots, KEY, 'potato', 'Bình', 'winter')).toBe(plots); // already sown
    expect(mayHarvest(plots[KEY], 'An')).toBe(true);
    expect(mayHarvest(plots[KEY], 'Bình')).toBe(false);
    expect(mayHarvest({ tilled: true, growthDay: 0, wateredToday: false }, 'Bình')).toBe(true);
  });

  it('keeps the owner as the crop grows and is harvested', () => {
    let plots: FarmPlots = sowField({}, KEY, 'parsnip', 'An', 'winter');
    for (let i = 0; i < 10; i++) plots = advanceDay(plots, 'winter', true);
    expect(plots[KEY].owner).toBe('An');
    expect(harvestPlot(plots, KEY, () => 0)?.plots[KEY].owner).toBe('An');
  });

  it('a new season regrows the rice over unharvested crops', () => {
    const plots: FarmPlots = { ...sowField({}, KEY, 'parsnip', 'An', 'winter'), 'QuangBinh:1,1': { tilled: true, growthDay: 0, wateredToday: false } };
    const out = regrowFields({ [KEY]: 7 }, plots, 8);
    expect(out.fields).toEqual({});
    expect(out.plots[KEY]).toBeUndefined();
    expect(out.plots['QuangBinh:1,1']).toBeDefined();
    const same = regrowFields({ [KEY]: 7 }, plots, 7);
    expect(same.plots[KEY]).toBeDefined();
  });
});
