import horror from '../data/horror.json';
import type { EnergyState } from './EnergySystem';
import type { HorrorMode } from './HorrorSystem';
import type { ItemStats } from './StatsSystem';

/**
 * Sanity ("tinh thần"): every scare at night chips it away, a little more
 * each time that night. Low sanity slows you down, and below a threshold the
 * ghosts stop just scaring you and start attacking. Sleep and daylight bring
 * it back. All numbers live in horror.json → "sanity".
 */
const S = horror.sanity;

export const DEFAULT_MAX_SANITY = S.max;

export function createInitialSanity(): EnergyState {
  return { current: S.max, max: S.max };
}

/** What happened to you tonight (reset when the new day starts). */
export interface HauntState {
  scares: number;
  hits: number;
}

export function createHauntState(): HauntState {
  return { scares: 0, hits: 0 };
}

/** Sanity lost to the Nth scare of the night (0-based): 12, 16, 20 … up to 30; halved in mild mode. */
export function scareLoss(scaresTonight: number, mode: HorrorMode): number {
  if (mode === 'off') return 0;
  const loss = Math.min(S.scareLossMax, S.scareLoss + scaresTonight * S.scareLossStep);
  return mode === 'mild' ? loss * S.mildLossMultiplier : loss;
}

export function sanityRatio(s: EnergyState): number {
  return s.max > 0 ? s.current / s.max : 0;
}

/** Each full 10% of sanity lost costs 3% movement speed (as a negative stat). */
export function sanitySpeedPenalty(s: EnergyState): ItemStats {
  const lostTenths = Math.floor((1 - sanityRatio(s)) * 10 + 1e-9);
  return { speed: -lostTenths * S.speedPenaltyPer10Lost };
}

/** Ghosts only lay hands on you in full horror mode, at night, once your nerve is nearly gone. */
export function ghostsCanAttack(s: EnergyState, mode: HorrorMode, night: boolean): boolean {
  return mode === 'on' && night && sanityRatio(s) < S.attackBelow;
}

/** Health lost to the Nth ghost hit of the night (0-based): 5%, 10%, 15% … of max, up to 25%. */
export function ghostHitDamage(hitsTonight: number, maxHealth: number): number {
  return maxHealth * Math.min(S.hitDamageMaxRatio, S.hitDamageRatio * (hitsTonight + 1));
}

export function ghostHitEnergyLoss(maxEnergy: number): number {
  return maxEnergy * S.hitEnergyRatio;
}

export function daylightRegen(minutes: number): number {
  return (S.daylightRegenPerHour * minutes) / 60;
}

/** A scare may make you lose control: your legs give way (60% or 80% speed) for 2 seconds. */
export function rollPanic(random: () => number = Math.random): { multiplier: number; ms: number } | null {
  if (random() >= S.panicChance) return null;
  const options = S.panicMultipliers;
  return { multiplier: options[Math.floor(random() * options.length) % options.length], ms: S.panicMs };
}

export const GHOST_ATTACK = { everyMs: S.attackEveryMs as [number, number], speed: S.ghostSpeed };
