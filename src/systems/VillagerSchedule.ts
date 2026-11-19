/**
 * The day of a village household (pure, by clock minute of the day):
 *
 * - farmers (husband and wife, or someone living alone) leave home at 5:30,
 *   hoe their field from 6:00 in spells of three hours with a half-hour sit
 *   down in between, walk home at 15:00, potter about the yard and go in at 18:00;
 * - the child walks to the village school at 6:30, comes back at 11:00 and
 *   plays in the yard until 18:00;
 * - a shopkeeper stands at the shop front from 7:00 to 18:00.
 */
export type Role = 'farmer' | 'child' | 'shopkeeper';
export type Activity = 'indoors' | 'toField' | 'work' | 'rest' | 'toHome' | 'yard' | 'toSchool' | 'school' | 'shop';

export interface Phase {
  activity: Activity;
  /** Clock minute (0 = midnight) this phase began. */
  since: number;
}

type Table = [number, Activity][];

const h = (hours: number, minutes = 0): number => hours * 60 + minutes;

export const SCHEDULES: Record<Role, Table> = {
  farmer: [
    [0, 'indoors'],
    [h(5, 30), 'toField'],
    [h(6), 'work'],
    [h(9), 'rest'],
    [h(9, 30), 'work'],
    [h(12, 30), 'rest'],
    [h(13), 'work'],
    [h(15), 'toHome'],
    [h(15, 40), 'yard'],
    [h(18), 'indoors'],
  ],
  child: [
    [0, 'indoors'],
    [h(6, 30), 'toSchool'],
    [h(7), 'school'],
    [h(11), 'toHome'],
    [h(11, 40), 'yard'],
    [h(18), 'indoors'],
  ],
  shopkeeper: [
    [0, 'indoors'],
    [h(7), 'shop'],
    [h(18), 'indoors'],
  ],
};

/** What someone with this role is doing at this minute of the day. */
export function phaseAt(role: Role, minuteOfDay: number): Phase {
  const table = SCHEDULES[role];
  let current = table[0];
  for (const row of table) if (row[0] <= minuteOfDay) current = row;
  return { activity: current[1], since: current[0] };
}

/** Walking phases: the person is on the road between home and somewhere. */
export function isTravel(a: Activity): boolean {
  return a === 'toField' || a === 'toHome' || a === 'toSchool';
}

/** Household size from a stable number: a third live alone, the rest are a couple with a child at school. */
export function householdRoles(seed: number, shop: boolean): Role[] {
  if (shop) return ['shopkeeper'];
  return seed % 3 === 0 ? ['farmer'] : ['farmer', 'farmer', 'child'];
}

/** What a farming adult is doing (clock minute; see NpcFarmSystem for the paddy's jobs). */
export type Doing =
  | 'indoors'
  | 'toField'
  | 'work'
  | 'restRoad'
  | 'toHome'
  | 'tea'
  | 'herd'
  | 'toMarket'
  | 'market'
  | 'fromMarket'
  | 'feedChickens'
  | 'tend'
  | 'garden';

export interface AdultDay {
  /** 0 or 1: the first and second adult of the household. */
  index: number;
  /** Clock minute of the day (0 = midnight). */
  clock: number;
  /** Does the paddy still need work today? */
  hasJob: boolean;
  /** Minutes since today's paddy work was finished (null if not finished today). */
  idleFor: number | null;
  livestock: boolean;
  chickens: boolean;
}

const WALK_MIN = 40;
const MARKET_AWAY = 240;
export const TO_FIELD = 5 * 60 + 30;
/** Everyone leaves the field at 16:30 (the herder leads the buffalo home). */
export const HOME_TIME = 16 * 60 + 30;
export const BED_TIME = 18 * 60;

/**
 * The day of a farming adult, a closed loop:
 *   5:30 the chickens are fed, then out to the paddy; while it needs work they
 *   work it (3-hour spells, half-hour rest sitting by the road); at 16:00 home.
 *   Once today's work is done: with a buffalo or cow, the first adult takes it
 *   to graze and minds it until 16:00, the second goes to market and back;
 *   without animals they rest by the road half an hour, then tend the paddy
 *   (weeding) until 16:00, so the fields are never empty in working hours.
 *   At home: tea at the table in the yard; indoors from 18:00.
 */
/** A household with no paddy (a lone hut in the wilds): works its garden till 16:30, then tea. */
export function gardenerDoing(clock: number): { doing: Doing; since: number } {
  if (clock < TO_FIELD || clock >= BED_TIME) return { doing: 'indoors', since: 0 };
  if (clock < HOME_TIME) return { doing: 'garden', since: TO_FIELD };
  return { doing: 'tea', since: HOME_TIME };
}

export function adultDoing(a: AdultDay): { doing: Doing; since: number } {
  const c = a.clock;
  if (c < TO_FIELD || c >= BED_TIME) return { doing: 'indoors', since: 0 };
  if (a.chickens && a.index === 0 && c < TO_FIELD + 10) return { doing: 'feedChickens', since: TO_FIELD };
  if (c >= HOME_TIME) return c < HOME_TIME + WALK_MIN ? { doing: 'toHome', since: HOME_TIME } : { doing: 'tea', since: HOME_TIME + WALK_MIN };
  if (a.hasJob || a.idleFor === null) {
    if (c < 6 * 60) return { doing: 'toField', since: TO_FIELD };
    const resting = (c >= 9 * 60 && c < 9 * 60 + 30) || (c >= 12 * 60 + 30 && c < 13 * 60);
    return { doing: resting ? 'restRoad' : 'work', since: 6 * 60 };
  }
  const t = a.idleFor;
  const done = c - t; // clock minute the work was finished
  if (a.livestock && a.index === 0) return { doing: 'herd', since: done };
  if (a.livestock && a.index === 1) {
    if (t < WALK_MIN) return { doing: 'toMarket', since: done };
    if (t < WALK_MIN + MARKET_AWAY) return { doing: 'market', since: done + WALK_MIN };
    if (t < 2 * WALK_MIN + MARKET_AWAY) return { doing: 'fromMarket', since: done + WALK_MIN + MARKET_AWAY };
    return { doing: 'tend', since: done + 2 * WALK_MIN + MARKET_AWAY }; // back from market: out to the paddy
  }
  // No animals to mind: after a rest they stay out tending the paddy (weeding, looking the
  // rice over) like everyone else in the village, until it is time to go home.
  if (t < 30) return { doing: 'restRoad', since: done };
  return { doing: 'tend', since: done + 30 };
}
