import { describe, expect, it } from 'vitest';
import { eligibleEvents, horrorChance, nightDread, pickHorrorEvent } from '../src/systems/HorrorSystem';
import { createInitialTime } from '../src/systems/TimeSystem';

const at = (hour: number) => ({ ...createInitialTime(), elapsedMinutes: (hour - 6) * 60 });

describe('HorrorSystem', () => {
  it('starts at 40% at 8 PM and rises with the night', () => {
    expect(horrorChance(at(19), 'on')).toBe(0);
    expect(horrorChance(at(20), 'on')).toBeCloseTo(0.4);
    expect(horrorChance(at(23), 'on')).toBeCloseTo(0.7);
    expect(horrorChance(at(25), 'on')).toBeCloseTo(0.9);
    expect(horrorChance(at(23), 'mild')).toBeCloseTo(0.35);
    expect(horrorChance(at(23), 'off')).toBe(0);
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
