import type { MapKey } from '../data/maps';

/**
 * Farm animals bought at the shop (pure logic, no Phaser). They live loose
 * in the world where they were left: they wander, graze when they stand on
 * grass (buffaloes and cows best of all), grow day by day if well fed, and
 * shy away from anyone carrying a whip.
 */
export type LivestockKind = 'chicken' | 'pig' | 'buffalo' | 'cow';

export interface Livestock {
  id: string;
  kind: LivestockKind;
  mapKey: MapKey;
  /** Feet position in pixels. */
  x: number;
  y: number;
  /** 0 = full, 100 = starving. */
  hunger: number;
  /** 0 = just born, 100 = fully grown. */
  growth: number;
}

export interface LivestockDef {
  name: string;
  /** Walking speed, px per second (fleeing is twice as fast). */
  speed: number;
  /** Hunger gained per game hour. */
  hungerPerHour: number;
  /** Hunger eaten away per game hour while standing on grass. */
  grazePerHour: number;
  /** Growth per day when well fed. */
  growthPerDay: number;
}

export const LIVESTOCK: Record<LivestockKind, LivestockDef> = {
  chicken: { name: 'Gà', speed: 22, hungerPerHour: 4, grazePerHour: 7, growthPerDay: 14 },
  pig: { name: 'Heo', speed: 18, hungerPerHour: 5, grazePerHour: 7, growthPerDay: 9 },
  buffalo: { name: 'Trâu', speed: 16, hungerPerHour: 5, grazePerHour: 14, growthPerDay: 6 },
  cow: { name: 'Bò', speed: 17, hungerPerHour: 5, grazePerHour: 14, growthPerDay: 7 },
};

/** Shop item id → kind. */
export const ANIMAL_ITEMS: Record<string, LivestockKind> = {
  animal_chicken: 'chicken',
  animal_pig: 'pig',
  animal_buffalo: 'buffalo',
  animal_cow: 'cow',
};

/** Animals keep this far (px) from someone holding a whip. */
export const WHIP_FEAR_RADIUS = 56;
/** A crack of the whip sends animals within this distance (px) running. */
export const WHIP_CRACK_RADIUS = 40;

export function createLivestock(id: string, kind: LivestockKind, mapKey: MapKey, x: number, y: number): Livestock {
  return { id, kind, mapKey, x, y, hunger: 30, growth: 0 };
}

/** Time passing for one animal: hunger rises, grazing (on grass) brings it down. */
export function tickLivestock(animal: Livestock, gameMinutes: number, onGrass: boolean): Livestock {
  const def = LIVESTOCK[animal.kind];
  const hours = gameMinutes / 60;
  const eaten = onGrass ? def.grazePerHour * hours : 0;
  const hunger = clamp(animal.hunger + def.hungerPerHour * hours - eaten, 0, 100);
  return hunger === animal.hunger ? animal : { ...animal, hunger };
}

/** A new morning: a well-fed animal grows; a starving one doesn't. */
export function advanceLivestockDay(animal: Livestock): Livestock {
  const def = LIVESTOCK[animal.kind];
  const fed = (100 - animal.hunger) / 100;
  const gain = animal.hunger >= 80 ? 0 : def.growthPerDay * Math.min(1, fed + 0.2);
  return { ...animal, growth: clamp(animal.growth + gain, 0, 100) };
}

/** Labels for the info panel. */
export function hungerLabel(hunger: number): string {
  return hunger < 25 ? 'No' : hunger < 55 ? 'Hơi đói' : hunger < 80 ? 'Đói' : 'Đói lả';
}

export function growthLabel(growth: number): string {
  return growth >= 100 ? 'Trưởng thành' : growth >= 50 ? 'Đang lớn' : 'Còn nhỏ';
}

/** Drawing scale: a newborn is 65% of adult size. */
export function sizeScale(growth: number): number {
  return 0.65 + 0.35 * (clamp(growth, 0, 100) / 100);
}

/**
 * Where the animal wants to go this moment, as a unit vector (0,0 = stand and
 * graze). Fear of a nearby whip beats everything; otherwise it keeps its
 * wandering heading.
 */
export function steer(
  animal: { x: number; y: number },
  wander: { dx: number; dy: number },
  whip: { x: number; y: number } | null,
): { dx: number; dy: number; fleeing: boolean } {
  if (whip) {
    const dx = animal.x - whip.x;
    const dy = animal.y - whip.y;
    const d = Math.hypot(dx, dy);
    if (d < WHIP_FEAR_RADIUS) {
      return d < 0.01 ? { dx: 1, dy: 0, fleeing: true } : { dx: dx / d, dy: dy / d, fleeing: true };
    }
  }
  return { ...wander, fleeing: false };
}

/** A new random wander heading: often stand still (grazing), else one of 8 directions. */
export function pickWander(random: () => number = Math.random): { dx: number; dy: number } {
  if (random() < 0.45) return { dx: 0, dy: 0 };
  const a = Math.floor(random() * 8) * (Math.PI / 4);
  return { dx: Math.round(Math.cos(a) * 1000) / 1000, dy: Math.round(Math.sin(a) * 1000) / 1000 };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}
