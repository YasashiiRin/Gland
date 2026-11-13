/**
 * Whether the game clock should advance right now. Paused during scene
 * transitions and the sleep sequence so time doesn't tick during a fade.
 * Lives outside GameState because it is runtime-only and must never be saved.
 */
export const timeControl = { paused: false };
