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
