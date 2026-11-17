import type { GameState } from '../state/GameState';
import type { Direction } from '../systems/movement';
import type { TimeState } from '../systems/TimeSystem';
import type { WorldPatch } from './worldPatch';

/** Room size: the host plus up to two guests. */
export const MAX_PLAYERS = 3;
export const ROOM_CODE_LENGTH = 6;
/** Peer ids are namespaced so a room code can't collide with other PeerJS apps. */
export const PEER_PREFIX = 'gland-lang-viet-';

/**
 * The parts of GameState that belong to the whole farm and are shared by
 * everyone in the room (owned by the host). Everything else — inventory,
 * energy, skills, where you stand — is personal to each player.
 */
export const SHARED_KEYS = [
  'farmName',
  'time',
  'money',
  'farmPlots',
  'shippingBin',
  'resourceNodes',
  'wildFields',
  'placedObjects',
  'relationships',
  'deepestFloor',
  'communityFund',
  'vehicles',
  'warehouse',
  'vehicleStorage',
] as const satisfies readonly (keyof GameState)[];

export type SharedKey = (typeof SHARED_KEYS)[number];
export type SharedWorld = Pick<GameState, SharedKey>;

export function pickShared(state: GameState): SharedWorld {
  const out: Partial<SharedWorld> = {};
  for (const key of SHARED_KEYS) Object.assign(out, { [key]: structuredClone(state[key]) });
  return out as SharedWorld;
}

/** A guest's personal things, kept in the host's save under the guest's name. */
export const PROFILE_KEYS = ['inventory', 'energy', 'playerHealth', 'sanity', 'skills', 'buffs', 'equippedSlot'] as const satisfies readonly (keyof GameState)[];
export type PlayerProfile = Pick<GameState, (typeof PROFILE_KEYS)[number]>;

export function pickProfile(state: GameState): PlayerProfile {
  const out: Partial<PlayerProfile> = {};
  for (const key of PROFILE_KEYS) Object.assign(out, { [key]: structuredClone(state[key]) });
  return out as PlayerProfile;
}

/** Sent with the world when a new day starts. */
export interface NewDayInfo {
  earnings: number;
  /** Players who were in bed; everyone else passed out at 2 AM. */
  sleepers: string[];
}

/** The day ends once every player in the room is in bed. */
export function everyoneAsleep(players: readonly { id: string }[], sleepers: ReadonlySet<string>): boolean {
  return players.length > 0 && players.every((p) => sleepers.has(p.id));
}

export interface LobbyPlayer {
  id: string;
  name: string;
  host: boolean;
}

/** A player's position, sent ~10 times a second. */
export interface PlayerPose {
  id: string;
  map: string;
  x: number;
  y: number;
  dir: Direction;
  moving: boolean;
  riding: string | null;
  /** Riding as a passenger in this player's vehicle (null when not). */
  seatOf: string | null;
}

export type NetMessage =
  | { t: 'hello'; name: string }
  | { t: 'full' }
  | { t: 'lobby'; players: LobbyPlayer[] }
  | { t: 'start'; you: string; world: SharedWorld; profile?: PlayerProfile }
  | { t: 'world'; world: SharedWorld; newDay?: NewDayInfo }
  | { t: 'sleep'; ready: boolean }
  | { t: 'sleepers'; ids: string[] }
  | { t: 'profile'; profile: PlayerProfile }
  | { t: 'pose'; pose: PlayerPose }
  | { t: 'left'; id: string }
  | { t: 'time'; time: TimeState }
  | { t: 'patch'; from: string; patch: WorldPatch };

/** Room codes avoid look-alike characters (0/O, 1/I/L). */
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function makeRoomCode(random: () => number = Math.random): string {
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) code += CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)];
  return code;
}

export function normalizeRoomCode(input: string): string | null {
  const code = input.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code.length !== ROOM_CODE_LENGTH) return null;
  return [...code].every((c) => CODE_ALPHABET.includes(c)) ? code : null;
}

/** Light runtime check for messages arriving from another machine. */
export function isNetMessage(value: unknown): value is NetMessage {
  return typeof value === 'object' && value !== null && typeof (value as { t?: unknown }).t === 'string';
}
