import { describe, expect, it } from 'vitest';
import {
  advanceAnimalDay,
  createAnimal,
  feed,
  MAX_FRIENDSHIP,
  MAX_HAPPINESS,
  pet,
} from '../src/systems/AnimalSystem';

describe('feed / pet', () => {
  it('feeding marks the day and is a no-op if fed again the same day', () => {
    const a = createAnimal();
    const fed = feed(a, 5);
    expect(fed.fedOnDay).toBe(5);
    expect(feed(fed, 5)).toBe(fed); // same reference: no-op
  });

  it('petting raises friendship once per day, capped', () => {
    const a = createAnimal();
    const petted = pet(a, 5);
    expect(petted.friendship).toBeGreaterThan(a.friendship);
    expect(pet(petted, 5)).toBe(petted); // already petted today, no-op
    const petted2 = pet(petted, 6);
    expect(petted2.friendship).toBeGreaterThan(petted.friendship);
  });

  it('friendship never exceeds the max', () => {
    let a = { ...createAnimal(), friendship: MAX_FRIENDSHIP - 5 };
    a = pet(a, 1);
    expect(a.friendship).toBe(MAX_FRIENDSHIP);
  });
});

describe('advanceAnimalDay', () => {
  it('raises happiness when fed yesterday, lowers it when not', () => {
    const fedAnimal = feed(createAnimal(), 1);
    const r1 = advanceAnimalDay(fedAnimal, 1, () => 0.99);
    expect(r1.animal.happiness).toBeGreaterThan(fedAnimal.happiness);

    const unfed = createAnimal();
    const r2 = advanceAnimalDay(unfed, 1, () => 0.99); // fedOnDay=-1, never matches "yesterday"=1
    expect(r2.animal.happiness).toBeLessThan(unfed.happiness);
  });

  it('keeps happiness within [0, MAX_HAPPINESS]', () => {
    let a = { ...createAnimal(), happiness: 5 };
    const r = advanceAnimalDay(a, 1, () => 0.99); // not fed yesterday -> big drop, should clamp at 0
    expect(r.animal.happiness).toBe(0);

    a = { ...createAnimal(), happiness: MAX_HAPPINESS - 2, fedOnDay: 1 };
    const r2 = advanceAnimalDay(a, 1, () => 0.99);
    expect(r2.animal.happiness).toBe(MAX_HAPPINESS);
  });

  it('only ever produces an egg if fed the day before', () => {
    const unfed = { ...createAnimal(), happiness: 100, friendship: 1000 };
    const r = advanceAnimalDay(unfed, 1, () => 0); // random always "succeeds", but wasn't fed
    expect(r.producedEgg).toBe(false);
  });

  it('a happy, trusted, fed animal reliably produces an egg', () => {
    const happyFed = { happiness: 100, friendship: 1000, fedOnDay: 1, pettedOnDay: -1 };
    const r = advanceAnimalDay(happyFed, 1, () => 0.01); // low roll beats the high chance
    expect(r.producedEgg).toBe(true);
  });

  it('a neglected, unfed animal essentially never produces an egg', () => {
    const neglected = { happiness: 0, friendship: 0, fedOnDay: -1, pettedOnDay: -1 };
    const r = advanceAnimalDay(neglected, 1, () => 0);
    expect(r.producedEgg).toBe(false);
  });
});
