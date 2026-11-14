export interface AnimalState {
  happiness: number; // 0-100
  friendship: number; // 0-1000
  fedOnDay: number; // absolute day last fed, -1 if never
  pettedOnDay: number; // absolute day last petted, -1 if never
}

export const MAX_HAPPINESS = 100;
export const MAX_FRIENDSHIP = 1000;
const HAPPINESS_GAIN_FED = 12;
const HAPPINESS_LOSS_UNFED = 20;
const FRIENDSHIP_GAIN_PET = 15;
const FRIENDSHIP_GAIN_FED = 5;

export function createAnimal(): AnimalState {
  return { happiness: 50, friendship: 0, fedOnDay: -1, pettedOnDay: -1 };
}

export function feed(animal: AnimalState, today: number): AnimalState {
  if (animal.fedOnDay === today) return animal; // already fed today
  return { ...animal, fedOnDay: today };
}

export function pet(animal: AnimalState, today: number): AnimalState {
  if (animal.pettedOnDay === today) return animal; // once per day
  return {
    ...animal,
    pettedOnDay: today,
    friendship: Math.min(MAX_FRIENDSHIP, animal.friendship + FRIENDSHIP_GAIN_PET),
  };
}

export interface AnimalDayResult {
  animal: AnimalState;
  producedEgg: boolean;
}

/**
 * Call once per new day (today = the day that just started). Happiness rises
 * if fed yesterday, falls if not; a happier, more trusting animal is more
 * likely to leave something for you that morning.
 */
export function advanceAnimalDay(animal: AnimalState, yesterday: number, random: () => number = Math.random): AnimalDayResult {
  const wasFedYesterday = animal.fedOnDay === yesterday;
  const happiness = Math.max(
    0,
    Math.min(MAX_HAPPINESS, animal.happiness + (wasFedYesterday ? HAPPINESS_GAIN_FED : -HAPPINESS_LOSS_UNFED)),
  );
  const friendship = wasFedYesterday
    ? Math.min(MAX_FRIENDSHIP, animal.friendship + FRIENDSHIP_GAIN_FED)
    : animal.friendship;

  // Chance of producing something scales with both happiness and friendship;
  // an unfed, neglected animal essentially never does.
  const chance = (happiness / MAX_HAPPINESS) * 0.5 + (friendship / MAX_FRIENDSHIP) * 0.4;
  const producedEgg = wasFedYesterday && random() < chance;

  return { animal: { ...animal, happiness, friendship }, producedEgg };
}
