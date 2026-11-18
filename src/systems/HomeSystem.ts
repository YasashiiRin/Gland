import config from '../data/homes.json';

/**
 * Homes (big world): every village homestead is a walled plot; empty
 * thatched ones can be given to players. Ownership is shared by everyone
 * in a room: home key ("QuangBinh:qb12") -> owner's name.
 */
export type Homes = Record<string, string>;

export interface HomeChoice {
  key: string;
  /** Out in a village, not inside a town or landmark (where new players are best placed). */
  rural: boolean;
}

export function homeKey(mapKey: string, homeId: string): string {
  return `${mapKey}:${homeId}`;
}

/** The home this player owns, if any. */
export function homeOf(homes: Homes, owner: string): string | undefined {
  return Object.keys(homes).find((key) => homes[key] === owner);
}

/**
 * Gives `owner` one of the free homes (village ones first), at random.
 * Unchanged homes and null when every home is taken or they already have one.
 */
export function claimHome(homes: Homes, choices: HomeChoice[], owner: string, random: () => number = Math.random): { homes: Homes; key: string } | null {
  if (homeOf(homes, owner)) return null;
  const free = choices.filter((c) => !(c.key in homes));
  const pool = free.some((c) => c.rural) ? free.filter((c) => c.rural) : free;
  if (!pool.length) return null;
  const pick = pool[Math.floor(random() * pool.length)];
  return { homes: { ...homes, [pick.key]: owner }, key: pick.key };
}

/** Houses players have rebuilt: home key -> the house sprite now standing there. */
export type HomeHouses = Record<string, string>;

export interface Upgrade {
  to: string;
  cost: number;
  name: string;
}

const UPGRADES = config.upgrades as Record<string, Upgrade>;

/** The house standing on a homestead now (its map sprite, unless rebuilt). */
export function houseOn(houses: HomeHouses, key: string, mapSprite: string): string {
  return houses[key] ?? mapSprite;
}

/** The next upgrade for this house, if there is one. */
export function nextUpgrade(house: string): Upgrade | undefined {
  return UPGRADES[house];
}

/** Rebuilds the house one step up, paying for it; null if there is no upgrade or not enough money. */
export function upgradeHouse(houses: HomeHouses, money: number, key: string, current: string): { houses: HomeHouses; money: number } | null {
  const up = nextUpgrade(current);
  if (!up || money < up.cost) return null;
  return { houses: { ...houses, [key]: up.to }, money: money - up.cost };
}

/** Moves `owner` into another free home (their old one becomes free again); null if it is taken. */
export function moveHome(homes: Homes, owner: string, to: string): Homes | null {
  if (to in homes && homes[to] !== owner) return null;
  const next: Homes = {};
  for (const [k, v] of Object.entries(homes)) if (v !== owner) next[k] = v;
  next[to] = owner;
  return next;
}
