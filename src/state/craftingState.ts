import type { Station } from '../data/recipes';

/** The crafting bench the player is standing at right now (set by the map scene each frame). */
export const craftingState = {
  nearStation: null as Station | null,
};
