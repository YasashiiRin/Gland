import type { FishBehavior } from '../data/fish';

/**
 * The reel-in minigame (pure logic, no Phaser). A fish swims up and down a
 * vertical track; the player keeps a green catch bar over it by holding (bar
 * rises) and releasing (gravity pulls it down, with a small bounce off the
 * bottom). Progress fills while the bar covers the fish and drains when it
 * doesn't. Each fish swims in its own style (behavior) and harder fish are
 * faster and twitchier. Sometimes a treasure chest appears: keep the bar on
 * it too to win it. A catch without ever losing progress is "perfect".
 */
export interface FishingState {
  /** Top of the catch bar: 0 (top of track) to 1 - barHeight (bottom). */
  barY: number;
  barVelocity: number;
  barHeight: number;
  /** Centre of the fish, 0-1. */
  fishY: number;
  fishVelocity: number;
  /** Where the fish is heading right now. */
  fishTarget: number;
  /** 0 = escaped, 1 = caught. Starts at 0.3. */
  progress: number;
  /** Still true while progress has never dropped. */
  perfect: boolean;
  /** A treasure chest on the track (null = none), and how full its own meter is. */
  treasureY: number | null;
  treasureProgress: number;
  treasureWon: boolean;
}

export const FISH_SIZE = 0.07; // the fish icon's height on the track
export const GRAVITY = 1.7;
export const LIFT = 3.0;
export const MAX_BAR_SPEED = 1.3;
export const BOUNCE = 0.35; // the bar bounces back up off the bottom at this fraction of its speed
export const CATCH_RATE = 0.28; // progress per second while the bar covers the fish
export const ESCAPE_RATE = 0.22; // progress lost per second while it doesn't
export const TREASURE_RATE = 0.45;
export const TREASURE_CHANCE = 0.15;

/** The catch bar grows with fishing level (0-10): 16% of the track at level 0, 26% at level 10. */
export function barHeightFor(level: number): number {
  return 0.16 + Math.min(10, Math.max(0, level)) * 0.01;
}

/** How fast the fish can swim (track heights per second). */
export function fishSpeedFor(difficulty: number): number {
  return 0.35 + difficulty * 0.012;
}

/** Average seconds between the fish changing its mind about where to go. */
export function fishRestlessness(difficulty: number, behavior: FishBehavior): number {
  const base = Math.max(0.35, 2.2 - difficulty * 0.02);
  return behavior === 'dart' ? base * 0.6 : behavior === 'smooth' ? base * 1.4 : base;
}

/** A new place for the fish to swim to, in its own style. */
export function nextFishTarget(current: number, behavior: FishBehavior, difficulty: number, random: () => number): number {
  const reach = 0.15 + difficulty * 0.006;
  const near = current + (random() * 2 - 1) * reach;
  switch (behavior) {
    case 'sinker':
      return clamp(random() < 0.7 ? 0.65 + random() * 0.35 : near, 0, 1);
    case 'floater':
      return clamp(random() < 0.7 ? random() * 0.35 : near, 0, 1);
    case 'dart':
      return random() < 0.5 ? random() : clamp(near, 0, 1);
    case 'mixed':
      return random() < 0.35 ? random() : clamp(near, 0, 1);
    default:
      return clamp(near, 0, 1);
  }
}

export function createFishingState(level: number, random: () => number = Math.random): FishingState {
  const barHeight = barHeightFor(level);
  const fishY = 0.3 + random() * 0.4;
  return {
    barY: 1 - barHeight,
    barVelocity: 0,
    barHeight,
    fishY,
    fishVelocity: 0,
    fishTarget: fishY,
    progress: 0.3,
    perfect: true,
    treasureY: random() < TREASURE_CHANCE ? 0.1 + random() * 0.8 : null,
    treasureProgress: 0,
    treasureWon: false,
  };
}

function covers(s: { barY: number; barHeight: number }, y: number): boolean {
  return y + FISH_SIZE / 2 > s.barY && y - FISH_SIZE / 2 < s.barY + s.barHeight;
}

/** Advances the minigame by `dt` seconds. Call every frame while the minigame is open. */
export function stepFishing(
  state: FishingState,
  dt: number,
  holding: boolean,
  difficulty: number,
  behavior: FishBehavior,
  random: () => number = Math.random,
): FishingState {
  // The bar: y grows downward, holding pushes it up.
  let barVelocity = clamp(state.barVelocity + (holding ? -LIFT : GRAVITY) * dt, -MAX_BAR_SPEED, MAX_BAR_SPEED);
  let barY = state.barY + barVelocity * dt;
  if (barY < 0) {
    barY = 0;
    barVelocity = 0;
  } else if (barY > 1 - state.barHeight) {
    barY = 1 - state.barHeight;
    barVelocity = barVelocity > 0.3 ? -barVelocity * BOUNCE : 0;
  }

  // The fish: steers toward its target with a capped speed; now and then picks a new one.
  let fishTarget = state.fishTarget;
  if (random() < dt / fishRestlessness(difficulty, behavior) || Math.abs(fishTarget - state.fishY) < 0.02) {
    fishTarget = nextFishTarget(state.fishY, behavior, difficulty, random);
  }
  const maxSpeed = fishSpeedFor(difficulty);
  const accel = behavior === 'dart' ? 9 : behavior === 'smooth' ? 2.5 : 5;
  const wanted = clamp((fishTarget - state.fishY) * 4, -maxSpeed, maxSpeed);
  const fishVelocity = state.fishVelocity + clamp(wanted - state.fishVelocity, -accel * dt, accel * dt);
  const fishY = clamp(state.fishY + fishVelocity * dt, FISH_SIZE / 2, 1 - FISH_SIZE / 2);

  const next = { barY, barHeight: state.barHeight };
  const onFish = covers(next, fishY);
  const progress = clamp(state.progress + (onFish ? CATCH_RATE : -ESCAPE_RATE) * dt, 0, 1);

  let { treasureY, treasureProgress, treasureWon } = state;
  if (treasureY !== null && !treasureWon) {
    treasureProgress = clamp(treasureProgress + (covers(next, treasureY) ? TREASURE_RATE : -TREASURE_RATE / 2) * dt, 0, 1);
    if (treasureProgress >= 1) {
      treasureWon = true;
      treasureY = null;
    }
  }

  return {
    barY,
    barVelocity,
    barHeight: state.barHeight,
    fishY,
    fishVelocity,
    fishTarget,
    progress,
    perfect: state.perfect && (onFish || progress >= state.progress),
    treasureY,
    treasureProgress,
    treasureWon,
  };
}

export type FishingOutcome = 'ongoing' | 'caught' | 'escaped';

export function fishingOutcome(state: Pick<FishingState, 'progress'>): FishingOutcome {
  if (state.progress >= 1) return 'caught';
  if (state.progress <= 0) return 'escaped';
  return 'ongoing';
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}
