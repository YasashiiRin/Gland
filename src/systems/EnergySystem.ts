export interface EnergyState {
  current: number;
  max: number;
}

export const DEFAULT_MAX_ENERGY = 270;

export function createInitialEnergy(): EnergyState {
  return { current: DEFAULT_MAX_ENERGY, max: DEFAULT_MAX_ENERGY };
}

/** Player combat health (in the mines) reuses the same {current,max} shape. */
export const DEFAULT_MAX_HEALTH = 100;
export function createInitialHealth(): EnergyState {
  return { current: DEFAULT_MAX_HEALTH, max: DEFAULT_MAX_HEALTH };
}

/** Energy never goes below 0; exceeding 0 just means "exhausted", handled by the caller. */
export function consume(state: EnergyState, amount: number): EnergyState {
  return { ...state, current: Math.max(0, state.current - amount) };
}

export function restore(state: EnergyState, amount: number): EnergyState {
  return { ...state, current: Math.min(state.max, state.current + amount) };
}

/** Full restore, e.g. after a normal night's sleep. */
export function restoreFull(state: EnergyState): EnergyState {
  return { ...state, current: state.max };
}

/** A full night is 8 hours: each hour in bed restores 1/8 (12.5%) of the bar. */
export const SLEEP_HOURS_FOR_FULL = 8;

export function restoreBySleep(state: EnergyState, hours: number): EnergyState {
  return restore(state, (state.max * Math.max(0, hours)) / SLEEP_HOURS_FOR_FULL);
}

/** Passing out only restores half, per the design doc's "pass out" penalty. */
export function restoreHalf(state: EnergyState): EnergyState {
  return { ...state, current: Math.max(state.current, Math.floor(state.max / 2)) };
}

export function isExhausted(state: EnergyState): boolean {
  return state.current <= 0;
}
