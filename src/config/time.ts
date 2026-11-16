/**
 * A day runs from 6:00 to 6:00 the next morning (24 in-game hours). Nobody
 * is forced to bed: if you stay up, the new day simply begins at dawn.
 */
export const DAY_START_CLOCK_MINUTES = 6 * 60;
export const DAY_LENGTH_MINUTES = 24 * 60;

/** How fast the clock ticks: every MINUTES_PER_TICK of game time take MS_PER_TICK of real time. */
export const MINUTES_PER_TICK = 10;
export const MS_PER_TICK = 7000;

export const SEASON_LENGTH_DAYS = 28;

export const SEASON_ORDER = ['spring', 'summer', 'fall', 'winter'] as const;
export type Season = (typeof SEASON_ORDER)[number];

export const SEASON_LABELS: Record<Season, string> = {
  spring: 'Xuân',
  summer: 'Hạ',
  fall: 'Thu',
  winter: 'Đông',
};

export type Weather = 'sunny' | 'rainy';

export const WEATHER_LABELS: Record<Weather, string> = {
  sunny: 'Nắng',
  rainy: 'Mưa',
};

/** Chance of rain the next day, per season (rest of the days are sunny). */
export const RAIN_CHANCE: Record<Season, number> = {
  spring: 0.3,
  summer: 0.15,
  fall: 0.35,
  winter: 0.2,
};

/** Clock minutes (0-1439, 0 = midnight) at which night starts/ends, used for the darkness overlay. */
export const DUSK_START = 18 * 60;
export const NIGHT_START = 20 * 60;
export const DAWN_START = 5 * 60;
export const DAWN_END = 6 * 60;
export const MAX_NIGHT_ALPHA = 0.7;
