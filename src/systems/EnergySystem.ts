export interface EnergyState {
  current: number;
  max: number;
}

export const DEFAULT_MAX_ENERGY = 270;

export function createInitialEnergy(): EnergyState {
  return { current: DEFAULT_MAX_ENERGY, max: DEFAULT_MAX_ENERGY };
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

/** Passing out only restores half, per the design doc's "pass out" penalty. */
export function restoreHalf(state: EnergyState): EnergyState {
  return { ...state, current: Math.max(state.current, Math.floor(state.max / 2)) };
}

export function isExhausted(state: EnergyState): boolean {
  return state.current <= 0;
}
