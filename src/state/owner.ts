import { net } from '../net/NetSession';
import { gameState } from './GameState';

/** The name this player's crops and pond fish are recorded under (their room name when playing together). */
export function ownerName(): string {
  return net.online ? net.myName : gameState.playerName;
}

/** In a shared world, may this player take what `owner` sowed or stocked? Alone, everything is yours. */
export function isMine(owner: string | undefined): boolean {
  return !owner || !net.online || owner === net.myName;
}
