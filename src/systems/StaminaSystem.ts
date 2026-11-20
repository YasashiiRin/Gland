import config from '../data/stamina.json';
import npcFarm from '../data/npcFarm.json';
import type { EnergyState } from './EnergySystem';

/**
 * Stamina on the move, and the recovery bar ("hồi phục"):
 * - walking / cycling costs a fixed number of energy points per metre
 *   (a full bar walks 7 km, or rides 20 km by bicycle);
 * - while energy is above 0 it slowly regenerates each game hour;
 * - at 0, resting (no exertion) for 30+ real seconds pumps part of the
 *   recovery bar back into energy, with a 20% bonus, when the rest ends.
 * Pure logic: no Phaser.
 */
export const STAMINA = config;

/** Map tiles per real-world metre (shared with the NPC world scale). */
export const TILES_PER_METRE = npcFarm.world.tilesPerMetre;

export type TravelMode = 'walk' | 'bicycle';

const KM_PER_FULL_BAR: Record<TravelMode, number> = {
  walk: config.walkKmPerFullBar,
  bicycle: config.bicycleKmPerFullBar,
};

/** Energy points one metre costs (e.g. 270 / 7000 ≈ 0.0386 on foot). */
export function energyPerMetre(maxEnergy: number, mode: TravelMode): number {
  return maxEnergy / (KM_PER_FULL_BAR[mode] * 1000);
}

/** World pixels to metres. */
export function pixelsToMetres(pixels: number, tileSize: number): number {
  return pixels / tileSize / TILES_PER_METRE;
}

/** Energy after travelling `metres`. */
export function travel(energy: EnergyState, metres: number, mode: TravelMode): EnergyState {
  if (metres <= 0) return energy;
  const cost = metres * energyPerMetre(energy.max, mode);
  return { ...energy, current: Math.max(0, energy.current - cost) };
}

/** Slow regeneration over `minutes` of game time; none at all while the bar is empty. */
export function regenOverTime(energy: EnergyState, minutes: number): EnergyState {
  if (energy.current <= 0 || minutes <= 0) return energy;
  const gain = (energy.max * config.hourlyRegenFraction * minutes) / 60;
  return { ...energy, current: Math.min(energy.max, energy.current + gain) };
}

/** A new game's recovery bar: same size as the energy bar, partly filled. */
export function createInitialRecovery(maxEnergy: number): EnergyState {
  return { current: maxEnergy * config.startRecoveryFraction, max: maxEnergy };
}

function fillRecovery(recovery: EnergyState, points: number): EnergyState {
  return { ...recovery, current: Math.min(recovery.max, recovery.current + Math.max(0, points)) };
}

/** Each new day adds 30% of the recovery bar's size. */
export function dailyRecovery(recovery: EnergyState, days = 1): EnergyState {
  return fillRecovery(recovery, recovery.max * config.dailyRecoveryFraction * days);
}

/** Eating also fills the recovery bar by half of the food's energy. */
export function foodRecovery(recovery: EnergyState, foodEnergy: number): EnergyState {
  return fillRecovery(recovery, foodEnergy * config.foodRecoveryFraction);
}

export interface PumpResult {
  energy: EnergyState;
  recovery: EnergyState;
  /** Energy points actually gained. */
  gained: number;
}

/**
 * Ends a rest of `seconds` (>= 30) at 0 energy: takes `seconds`% of the
 * recovery bar's size (100 s at most) and gives it to energy plus a 20%
 * bonus. Not enough left in the bar: whatever is left moves over, no bonus.
 * Never takes more than energy has room for.
 */
export function pump(energy: EnergyState, recovery: EnergyState, seconds: number): PumpResult {
  const percent = Math.min(seconds, config.pumpMaxSeconds) / 100;
  const want = recovery.max * percent;
  const room = energy.max - energy.current;
  const bonus = recovery.current >= want ? 1 + config.pumpBonus : 1;
  const take = Math.min(want, recovery.current, room / bonus);
  if (take <= 0) return { energy, recovery, gained: 0 };
  const gained = take * bonus;
  return {
    energy: { ...energy, current: Math.min(energy.max, energy.current + gained) },
    recovery: { ...recovery, current: recovery.current - take },
    gained,
  };
}

/** Runtime rest counter (real seconds spent idle at 0 energy). */
export interface RestState {
  seconds: number;
}

/**
 * One frame of the rest counter. It only runs at 0 energy; energy coming
 * back any other way (food, sleep) clears it. Exerting ends the rest: if it
 * lasted 30 s or more, the recovery bar pumps (`pumpSeconds`).
 */
export function tickRest(rest: RestState, energy: EnergyState, exerting: boolean, dtSeconds: number): { rest: RestState; pumpSeconds: number } {
  if (energy.current > 0) return { rest: { seconds: 0 }, pumpSeconds: 0 };
  if (exerting) {
    const pumpSeconds = rest.seconds >= config.restSecondsToPump ? rest.seconds : 0;
    return { rest: { seconds: 0 }, pumpSeconds };
  }
  return { rest: { seconds: rest.seconds + Math.max(0, dtSeconds) }, pumpSeconds: 0 };
}
