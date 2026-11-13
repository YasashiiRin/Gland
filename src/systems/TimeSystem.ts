import {
  DAWN_END,
  DAWN_START,
  DAY_LENGTH_MINUTES,
  DAY_START_CLOCK_MINUTES,
  DUSK_START,
  MAX_NIGHT_ALPHA,
  NIGHT_START,
  RAIN_CHANCE,
  SEASON_LENGTH_DAYS,
  SEASON_ORDER,
  type Season,
  type Weather,
} from '../config/time';

export type { Season, Weather };

export interface TimeState {
  /** Minutes elapsed since this day started (0 at 6:00). Capped at DAY_LENGTH_MINUTES. */
  elapsedMinutes: number;
  /** Day of the current season, 1-based. */
  day: number;
  season: Season;
  year: number;
  weather: Weather;
}

export function createInitialTime(): TimeState {
  return { elapsedMinutes: 0, day: 1, season: 'spring', year: 1, weather: 'sunny' };
}

/** Advances the clock. Time stops at the end of the day (2:00) until the caller starts a new day. */
export function advanceTime(state: TimeState, deltaMinutes: number): { state: TimeState; passedOut: boolean } {
  const elapsedMinutes = Math.min(DAY_LENGTH_MINUTES, state.elapsedMinutes + deltaMinutes);
  const passedOut = elapsedMinutes >= DAY_LENGTH_MINUTES && state.elapsedMinutes < DAY_LENGTH_MINUTES;
  return { state: { ...state, elapsedMinutes }, passedOut };
}

/** Picks the next day's weather. `random` is injectable so this stays deterministic in tests. */
export function rollWeather(season: Season, random: () => number = Math.random): Weather {
  return random() < RAIN_CHANCE[season] ? 'rainy' : 'sunny';
}

/** Moves to the next day, rolling over season/year as needed and rolling new weather. */
export function startNewDay(state: TimeState, random: () => number = Math.random): TimeState {
  let day = state.day + 1;
  let season = state.season;
  let year = state.year;
  if (day > SEASON_LENGTH_DAYS) {
    day = 1;
    const nextIndex = SEASON_ORDER.indexOf(season) + 1;
    if (nextIndex >= SEASON_ORDER.length) {
      season = SEASON_ORDER[0];
      year += 1;
    } else {
      season = SEASON_ORDER[nextIndex];
    }
  }
  return { elapsedMinutes: 0, day, season, year, weather: rollWeather(season, random) };
}

/** A single ever-increasing day count, for comparing "how many days ago" across season/year boundaries. */
export function absoluteDayNumber(state: TimeState): number {
  const seasonIndex = SEASON_ORDER.indexOf(state.season);
  return (state.year - 1) * SEASON_ORDER.length * SEASON_LENGTH_DAYS + seasonIndex * SEASON_LENGTH_DAYS + state.day;
}

/** Absolute clock minute of day (0-1439), wrapping past midnight. */
export function clockMinuteOfDay(state: TimeState): number {
  return (DAY_START_CLOCK_MINUTES + state.elapsedMinutes) % (24 * 60);
}

export function clockLabel(state: TimeState): string {
  const total = clockMinuteOfDay(state);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * How dark the night overlay should be, 0 (full day) to MAX_NIGHT_ALPHA (full night),
 * ramping smoothly through dusk and dawn.
 */
export function darknessAlpha(state: TimeState): number {
  const t = clockMinuteOfDay(state);
  if (t >= NIGHT_START || t < DAWN_START) return MAX_NIGHT_ALPHA;
  if (t >= DUSK_START && t < NIGHT_START) {
    return ((t - DUSK_START) / (NIGHT_START - DUSK_START)) * MAX_NIGHT_ALPHA;
  }
  if (t >= DAWN_START && t < DAWN_END) {
    return (1 - (t - DAWN_START) / (DAWN_END - DAWN_START)) * MAX_NIGHT_ALPHA;
  }
  return 0;
}
