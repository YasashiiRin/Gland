import type { GameState } from '../state/GameState';
import type { Direction } from '../systems/movement';
import type { TimeState } from '../systems/TimeSystem';

/** Room size: the host plus up to two guests. */
export const MAX_PLAYERS = 3;
export const ROOM_CODE_LENGTH = 6;
/** Peer ids are namespaced so a room code can't collide with other PeerJS apps. */
export const PEER_PREFIX = 'gland-vuon-nha-nho-';

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
  'placedObjects',
  'relationships',
  'deepestFloor',
  'communityFund',
  'vehicles',
  'warehouse',
] as const satisfies readonly (keyof GameState)[];

export type SharedKey = (typeof SHARED_KEYS)[number];
export type SharedWorld = Pick<GameState, SharedKey>;

export function pickShared(state: GameState): SharedWorld {
  const out: Partial<SharedWorld> = {};
  for (const key of SHARED_KEYS) Object.assign(out, { [key]: structuredClone(state[key]) });
  return out as SharedWorld;
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
}

export type NetMessage =
  | { t: 'hello'; name: string }
  | { t: 'full' }
  | { t: 'lobby'; players: LobbyPlayer[] }
  | { t: 'start'; you: string; world: SharedWorld }
  | { t: 'world'; world: SharedWorld }
  | { t: 'pose'; pose: PlayerPose }
  | { t: 'left'; id: string }
  | { t: 'time'; time: TimeState };

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
