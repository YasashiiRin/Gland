import type { TaskKind } from './config';

/**
 * The saved state of the village farm families (all plain JSON, kept in
 * GameState.npcFamilies). Times are absolute clock minutes: day * 1440 +
 * minute of the day, where a day starts at 0:00 (see clock.ts).
 */
export type FamilyType = 1 | 2 | 3;
export type Role = 'husband' | 'wife' | 'child';
export type LivestockKind = 'chicken' | 'pig' | 'buffalo';

/** Where someone can be. Home covers the house, the yard and the tea table. */
export type Place = 'home' | 'field' | 'pasture' | 'market' | 'school';

/** What someone is doing once they are at their place. */
export type Activity =
  | 'sleep'
  | 'sweep'
  | 'tea'
  | 'chores'
  | 'feedLivestock'
  | 'eat'
  | 'work'
  | 'lunch'
  | 'weed'
  | 'garden'
  | 'market'
  | 'school'
  | 'play'
  | 'herd'
  | 'porch';

export type NpcStateName = Activity | 'walking' | 'talking';

export type Position =
  | { place: Place }
  /** On the way: `done` of `total` walking minutes (at speed 1) covered. */
  | { from: Place; to: Place; total: number; done: number };

export interface CellTask {
  kind: TaskKind;
  cell: number;
  /** Absolute minute it is finished. */
  until: number;
}

export interface Npc {
  id: string;
  role: Role;
  familyId: string;
  state: NpcStateName;
  currentTask: CellTask | null;
  position: Position;
  speedMultiplier: number;
  /** Carrying a pile of the harvest home. */
  carrying: boolean;
  /** Since when they have been at the wrong place for their schedule (-1: they aren't). */
  pendingSince: number;
  /** Talking to the player until this minute (-1: not talking). */
  talkUntil: number;
  /** Leave in a hurry (+50%) on the next walk (after being cut short in a talk). */
  hurry: boolean;
  /** At the market until this minute. */
  marketUntil: number;
  /** Day of the last market trip finished. */
  marketDoneDay: number;
}

export type CellState = 'UNTILLED' | 'TILLED' | 'SEEDED' | 'GROWING' | 'MATURE' | 'DEAD';

export interface FieldCell {
  state: CellState;
  cropType: string | null;
  growthDay: number;
  wateredToday: boolean;
  missedWaterDays: number;
  /** Has it ever been watered since it was sown (only then can missing a day kill it). */
  everWatered: boolean;
  lastFertilizedDay: number;
  reservedBy: string | null;
}

export type SeasonPhase = 'growing' | 'hauling' | 'done';

export interface FieldGrid {
  cols: number;
  rows: number;
  cells: FieldCell[];
  cropType: string;
  previousCrop: string | null;
  /** How many seasons have been started (with the family seed it decides the crop). */
  seasonIndex: number;
  phase: SeasonPhase;
  harvestedThisSeason: number;
  /** Harvested cells not yet heaped into a pile. */
  looseHarvest: number;
  /** Piles waiting by the road for the trip home. */
  piles: number;
  /** Day the last pile was brought home (no more field work that day). */
  restDay: number;
}

export interface BuffaloState {
  /** Where it stands (null while someone leads it). */
  at: Place | null;
  ledBy: string | null;
  /** Day it was last led out to graze. */
  outDay: number;
}

export interface FamilyState {
  id: string;
  type: FamilyType;
  houseId: string;
  fieldId: string | null;
  pastureId: string | null;
  livestock: LivestockKind[];
  members: Npc[];
  /** 0 on a market day; counts up a day at a time, back to 0 every N days. */
  marketCounter: number;
  buffaloReturnClaimedBy: string | null;
  buffalo: BuffaloState | null;
  field: FieldGrid | null;
  /** Days the piles in the yard were made, oldest first. */
  yardPiles: number[];
  seed: number;
  /** Absolute minute simulated up to. */
  simMinute: number;
}

/** Walking minutes between this family's places (from the map, see layout in the scene). */
export interface FamilyLayout {
  minutes(from: Place, to: Place): number;
}
