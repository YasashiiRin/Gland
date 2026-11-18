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
