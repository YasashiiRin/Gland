import { describe, expect, it } from 'vitest';
import { eligibleEvents, horrorChance, horrorRollSlot, nightDread, pickHorrorEvent, treeChanceMultiplier } from '../src/systems/HorrorSystem';
import { createInitialTime } from '../src/systems/TimeSystem';

const at = (hour: number) => ({ ...createInitialTime(), elapsedMinutes: (hour - 6) * 60 });

describe('HorrorSystem', () => {
  it('rises from 8 PM until 5 AM, and is higher among trees', () => {
    const open = treeChanceMultiplier(0);
    expect(horrorChance(at(19), 'on', 40)).toBe(0);
    expect(horrorChance(at(20), 'on')).toBeCloseTo(0.15 * open);
    expect(horrorChance(at(28), 'on')).toBeCloseTo((0.15 + 8 * 0.06) * open);
    expect(horrorChance(at(29), 'on', 40)).toBe(0); // dawn
    expect(horrorChance(at(23), 'on', 40)).toBeGreaterThan(horrorChance(at(23), 'on', 0));
    expect(horrorChance(at(28), 'on', 999)).toBeCloseTo(0.85);
    expect(horrorChance(at(23), 'mild')).toBeCloseTo(horrorChance(at(23), 'on') / 2);
    expect(horrorChance(at(23), 'off')).toBe(0);
  });

  it('rolls every half hour', () => {
    expect(horrorRollSlot(at(20))).not.toBe(horrorRollSlot({ ...at(20), elapsedMinutes: at(20).elapsedMinutes + 30 }));
  });

  it('dread grows from dusk to the deepest night', () => {
    expect(nightDread(at(12))).toBe(0);
    expect(nightDread(at(21))).toBeLessThan(nightDread(at(25)));
  });

  it('only picks events that fit the place and time', () => {
    const indoor = eligibleEvents({ indoor: true, nearWater: false, hour: 20, mode: 'on' });
    expect(indoor).toContain('knock');
    expect(indoor).not.toContain('ghost_far');
    expect(indoor).not.toContain('jumpscare'); // only after midnight
    const late = eligibleEvents({ indoor: false, nearWater: true, hour: 25, mode: 'on' });
    expect(late).toContain('jumpscare');
    expect(late).toContain('water_ghost');
    expect(late).not.toContain('knock');
    expect(eligibleEvents({ indoor: false, nearWater: true, hour: 25, mode: 'mild' })).not.toContain('jumpscare');
  });

  it('never repeats the previous event', () => {
    for (let i = 0; i < 50; i++) {
      expect(pickHorrorEvent({ indoor: true, nearWater: false, hour: 25, mode: 'on', last: 'knock' })).not.toBe('knock');
    }
  });
});
