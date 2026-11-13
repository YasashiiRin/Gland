import npcs from './npcs.json';
import type { ItemId } from './items';
import type { MapKey } from './maps';
import type { Season } from '../systems/TimeSystem';

export type NpcId = keyof typeof npcs;

export interface ScheduleEntry {
  hour: number;
  mapKey: MapKey;
  x: number;
  y: number;
}

export interface NpcDef {
  name: string;
  portrait: string;
  birthday: { season: Season; day: number };
  lovedGifts: ItemId[];
  likedGifts: ItemId[];
  dislikedGifts: ItemId[];
  hatedGifts: ItemId[];
  schedule: ScheduleEntry[];
}

export const NPCS: Record<NpcId, NpcDef> = npcs as Record<NpcId, NpcDef>;
export const NPC_IDS = Object.keys(npcs) as NpcId[];

export function isNpcId(value: string): value is NpcId {
  return value in npcs;
}

/** The schedule entry in effect at this hour: the latest entry whose hour has passed. */
export function scheduleEntryAt(def: NpcDef, hour: number): ScheduleEntry {
  let current = def.schedule[0];
  for (const entry of def.schedule) {
    if (entry.hour <= hour) current = entry;
  }
  return current;
}
