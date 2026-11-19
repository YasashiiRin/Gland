import { hashString, seededRandom } from './clock';
import type { NpcConfig } from './config';
import { newFieldGrid } from './field';
import type { FamilyState, FamilyType, LivestockKind, Npc, Role } from './types';

/**
 * Who lives in a village homestead, decided once from the map (a stable hash
 * of the house key, so every player and every load gets the same family):
 *
 * - a homestead for one: a man alone, no animals;
 * - otherwise a couple (twoPersonShare of them) or a couple with a child;
 *   they keep the map's buffalo/cow (grazed like a buffalo), its chickens,
 *   maybe pigs, and at least one kind of animal.
 */
export interface HomeDescriptor {
  key: string;
  /** People drawn on the map: 1, or 3 for a family. */
  members: number;
  grazer: boolean;
  chickens: boolean;
  /** Size in cells of each plot of its field (empty: the house has no field and keeps a garden). */
  plots: PlotSize[];
}

export interface PlotSize {
  cols: number;
  rows: number;
}

/** Each plot draws its crops from its own seed. */
export function plotSeed(seed: number, plot: number): number {
  return (seed + Math.imul(plot, 0x9e3779b1)) >>> 0;
}

function newNpc(familyId: string, role: Role, index: number): Npc {
  return {
    id: `${familyId}#${index}`,
    role,
    familyId,
    state: 'sleep',
    currentTask: null,
    position: { place: 'home' },
    speedMultiplier: 1,
    carrying: false,
    pendingSince: -1,
    talkUntil: -1,
    hurry: false,
    marketUntil: -1,
    marketDoneDay: -1,
  };
}

export function familyTypeFor(home: HomeDescriptor, seed: number, cfg: NpcConfig): FamilyType {
  if (home.members <= 1) return 1;
  return seededRandom(seed, 1) < cfg.families.twoPersonShare ? 2 : 3;
}

export function createFamily(home: HomeDescriptor, startMinute: number, cfg: NpcConfig): FamilyState {
  const seed = hashString(home.key);
  const type = familyTypeFor(home, seed, cfg);
  const livestock: LivestockKind[] = [];
  if (type > 1) {
    if (home.chickens) livestock.push('chicken');
    if (seededRandom(seed, 2) < cfg.families.pigChance) livestock.push('pig');
    if (home.grazer) livestock.push('buffalo');
    if (!livestock.length) livestock.push('chicken');
  }
  return buildFamily(home.key, type, livestock, home.plots, startMinute, cfg);
}

export function buildFamily(
  key: string,
  type: FamilyType,
  livestock: LivestockKind[],
  plots: PlotSize[],
  startMinute: number,
  cfg: NpcConfig,
): FamilyState {
  const seed = hashString(key);
  const roles: Role[] = type === 1 ? ['husband'] : type === 2 ? ['husband', 'wife'] : ['husband', 'wife', 'child'];
  const hasBuffalo = livestock.includes('buffalo');
  return {
    id: key,
    type,
    houseId: key,
    fieldId: plots.length ? `${key}:field` : null,
    pastureId: hasBuffalo ? `${key}:pasture` : null,
    livestock,
    members: roles.map((r, i) => newNpc(key, r, i)),
    marketCounter: Math.floor(seededRandom(seed, 3) * cfg.market.everyDays[type]),
    buffaloReturnClaimedBy: null,
    buffalo: hasBuffalo ? { at: 'home', ledBy: null, outDay: -1 } : null,
    fields: plots.map((p, k) => newFieldGrid(p.cols, p.rows, plotSeed(seed, k), cfg)),
    yardPiles: [],
    seed,
    simMinute: startMinute,
  };
}

export const memberOf = (f: FamilyState, role: Role): Npc | undefined => f.members.find((m) => m.role === role);

/** Today is a market day for this family. */
export function isMarketDay(f: FamilyState): boolean {
  return f.marketCounter === 0;
}
