export interface FishingState {
  /** Top of the player-controlled catch bar, 0 (top) to 1 - BAR_HEIGHT (bottom). */
  barY: number;
  barVelocity: number;
  /** Center of the moving fish zone, 0-1. */
  zoneY: number;
  zoneVelocity: number;
  /** 0 (just started) to 1 (caught) or dropping to 0 (escaped). */
  progress: number;
}

export const BAR_HEIGHT = 0.22;
export const GRAVITY = 1.4; // pulls the bar down when not holding
export const LIFT = 2.6; // pushes the bar up while holding
export const MAX_BAR_SPEED = 1.1;
export const CATCH_RATE = 0.5; // progress gained per second while overlapping
export const ESCAPE_RATE = 0.35; // progress lost per second while not overlapping

/** Easy fish have a big, slow zone; hard fish have a small, fast, twitchy one. */
export function zoneHeightFor(difficulty: number): number {
  return Math.max(0.12, 0.34 - difficulty * 0.0018);
}
export function zoneSpeedFor(difficulty: number): number {
  return 0.25 + difficulty * 0.008;
}

export function createFishingState(difficulty: number, random: () => number = Math.random): FishingState {
  return {
    barY: 0.4,
    barVelocity: 0,
    zoneY: 0.2 + random() * 0.6,
    zoneVelocity: zoneSpeedFor(difficulty) * (random() < 0.5 ? 1 : -1),
    progress: 0.4,
  };
}

/** Advances the minigame by `dt` seconds. Call every frame while the minigame is open. */
export function stepFishing(
  state: FishingState,
  dt: number,
  holding: boolean,
  difficulty: number,
  random: () => number = Math.random,
): FishingState {
  const barHeight = BAR_HEIGHT;
  // Y=0 is the top of the track, so "holding = moving up" means velocity
  // becomes more negative; releasing lets gravity pull it back down (+Y).
  let barVelocity = state.barVelocity + (holding ? -LIFT : GRAVITY) * dt;
  barVelocity = Math.max(-MAX_BAR_SPEED, Math.min(MAX_BAR_SPEED, barVelocity));
  let barY = state.barY + barVelocity * dt;
  if (barY < 0) {
    barY = 0;
    barVelocity = 0;
  } else if (barY > 1 - barHeight) {
    barY = 1 - barHeight;
    barVelocity = 0;
  }

  const zoneHeight = zoneHeightFor(difficulty);
  let zoneY = state.zoneY + state.zoneVelocity * dt;
  let zoneVelocity = state.zoneVelocity;
  const halfZone = zoneHeight / 2;
  if (zoneY - halfZone < 0) {
    zoneY = halfZone;
    zoneVelocity = Math.abs(zoneVelocity);
  } else if (zoneY + halfZone > 1) {
    zoneY = 1 - halfZone;
    zoneVelocity = -Math.abs(zoneVelocity);
  }
  // A small chance per second to change direction, so the zone feels alive
  // rather than perfectly bouncing like a ball.
  if (random() < dt * 0.6) zoneVelocity = -zoneVelocity;

  const overlap = barY + barHeight > zoneY - halfZone && barY < zoneY + halfZone;
  const progressDelta = (overlap ? CATCH_RATE : -ESCAPE_RATE) * dt;
  const progress = Math.max(0, Math.min(1, state.progress + progressDelta));

  return { barY, barVelocity, zoneY, zoneVelocity, progress };
}

import { FISH, FISH_IDS, type FishId } from '../data/fish';
import type { MapKey } from '../data/maps';
import type { Season, Weather } from './TimeSystem';

export interface FishContext {
  mapKey: MapKey;
  season: Season;
  hour: number;
  weather: Weather;
}

/** Every fish valid right now for this spot/time, in no particular order. */
export function validFish(ctx: FishContext): FishId[] {
  return FISH_IDS.filter((id) => {
    const def = FISH[id];
    return (
      def.locations.includes(ctx.mapKey) &&
      def.season.includes(ctx.season) &&
      ctx.hour >= def.minHour &&
      ctx.hour < def.maxHour &&
      (def.weather === 'any' || def.weather === ctx.weather)
    );
  });
}

/** Picks one valid fish at random (uniform), or null if nothing bites right now. */
export function pickFish(ctx: FishContext, random: () => number = Math.random): FishId | null {
  const options = validFish(ctx);
  if (options.length === 0) return null;
  return options[Math.floor(random() * options.length)];
}

export type FishingOutcome = 'ongoing' | 'caught' | 'escaped';

export function fishingOutcome(state: FishingState): FishingOutcome {
  if (state.progress >= 1) return 'caught';
  if (state.progress <= 0) return 'escaped';
  return 'ongoing';
}
