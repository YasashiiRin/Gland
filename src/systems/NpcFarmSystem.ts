/**
 * The village paddies worked by the households (pure, no Phaser). Each paddy
 * goes round a closed cycle, one job at a time:
 *
 *   fallow --hoe--> tilled --sow--> growing (water every day; fertilise once)
 *   --(grows only on days it was watered)--> ripe --harvest--> cut: sheaves
 *   wait on the roadside --haul, one sheaf a trip--> fallow (stubble) again.
 *
 * Work is counted in person-minutes per tile, so a bigger paddy or a smaller
 * household takes longer. People work in three-hour spells with a half-hour
 * rest (6:00–9:00, 9:30–12:30, 13:00–16:00); the rest of the day is for the
 * animals, the market and tea (VillagerSchedule / villagers.ts).
 */
export type FieldStage = 'fallow' | 'tilled' | 'growing' | 'ripe' | 'cut';
export type FieldJob = 'hoe' | 'sow' | 'water' | 'fertilize' | 'harvest' | 'haul';

export interface FieldState {
  stage: FieldStage;
  /** 0..1 of the current one-off job (hoe, sow, harvest). */
  progress: number;
  /** Days of growth so far (only days it was watered count). */
  grownDays: number;
  /** Absolute day it was last fully watered (-1: never). */
  wateredDay: number;
  /** 0..1 of today's watering. */
  waterProgress: number;
  fertilized: boolean;
  fertProgress: number;
  /** Sheaves waiting on the roadside to be carried home. */
  sheaves: number;
  /** 0..1 of the trip in progress. */
  haulProgress: number;
  /** Harvests brought home so far (0: the paddy has never been worked, still grass). */
  harvests: number;
  /** Absolute game minute the paddy was last simulated up to. */
  simMinute: number;
  /** Absolute minute today's work on it was finished (the household is free from then on). */
  doneAt: number;
}

export const GROW_DAYS = 8;
/** Person-minutes of work per tile of paddy. */
export const RATES: Record<'hoe' | 'sow' | 'water' | 'fertilize' | 'harvest', number> = {
  hoe: 0.5,
  sow: 0.25,
  water: 0.12,
  fertilize: 0.1,
  harvest: 0.4,
};
/** Work spells in clock minutes (a half-hour rest between them). */
export const WORK_SPELLS: [number, number][] = [
  [6 * 60, 9 * 60],
  [9 * 60 + 30, 12 * 60 + 30],
  [13 * 60, 16 * 60],
];

export function newField(simMinute: number): FieldState {
  return { stage: 'fallow', progress: 0, grownDays: 0, wateredDay: -1, waterProgress: 0, fertilized: false, fertProgress: 0, sheaves: 0, haulProgress: 0, harvests: 0, simMinute, doneAt: -1 };
}

export function sheavesFor(tiles: number): number {
  return Math.max(2, Math.ceil(tiles / 300));
}

/** What needs doing on this paddy today (null: nothing until it grows). */
export function currentJob(f: FieldState, today: number): FieldJob | null {
  switch (f.stage) {
    case 'fallow':
      return 'hoe';
    case 'tilled':
      return 'sow';
    case 'growing':
      if (f.wateredDay !== today) return 'water';
      if (!f.fertilized && f.grownDays >= 2) return 'fertilize';
      return null;
    case 'ripe':
      return 'harvest';
    case 'cut':
      return f.sheaves > 0 ? 'haul' : null;
  }
}

export function inWorkSpell(clockMinute: number): boolean {
  return WORK_SPELLS.some(([a, b]) => clockMinute >= a && clockMinute < b);
}

/** Applies `personMinutes` of work to today's job. */
export function work(f: FieldState, personMinutes: number, tiles: number, tripMinutes: number, today: number): FieldState {
  const job = currentJob(f, today);
  if (!job || personMinutes <= 0) return f;
  const next = { ...f };
  if (job === 'haul') {
    next.haulProgress += personMinutes / Math.max(1, tripMinutes);
    while (next.haulProgress >= 1 && next.sheaves > 0) {
      next.haulProgress -= 1;
      next.sheaves -= 1;
    }
    if (next.sheaves === 0) Object.assign(next, { stage: 'fallow', progress: 0, haulProgress: 0, harvests: f.harvests + 1 });
    return next;
  }
  const step = personMinutes / (RATES[job] * tiles);
  if (job === 'water') {
    next.waterProgress = Math.min(1, next.waterProgress + step);
    if (next.waterProgress >= 1) next.wateredDay = today;
    return next;
  }
  if (job === 'fertilize') {
    next.fertProgress = Math.min(1, next.fertProgress + step);
    if (next.fertProgress >= 1) next.fertilized = true;
    return next;
  }
  next.progress = Math.min(1, next.progress + step);
  if (next.progress < 1) return next;
  next.progress = 0;
  if (job === 'hoe') next.stage = 'tilled';
  if (job === 'sow') Object.assign(next, { stage: 'growing', grownDays: 0, wateredDay: -1, waterProgress: 0, fertilized: false, fertProgress: 0 });
  if (job === 'harvest') Object.assign(next, { stage: 'cut', sheaves: sheavesFor(tiles), haulProgress: 0 });
  return next;
}

/** A new day: a paddy watered yesterday grows a day; ripe after GROW_DAYS. */
export function newDay(f: FieldState, today: number): FieldState {
  if (f.stage !== 'growing') return { ...f, waterProgress: 0 };
  const grownDays = f.wateredDay === today - 1 ? f.grownDays + 1 : f.grownDays;
  return { ...f, grownDays, waterProgress: 0, stage: grownDays >= GROW_DAYS ? 'ripe' : 'growing' };
}

export interface FieldWork {
  /** Adults of the household who farm. */
  workers: number;
  tiles: number;
  /** Minutes for one sheaf carried home and back. */
  tripMinutes: number;
}

/**
 * Runs a paddy forward from its simMinute to `toMinute` (absolute minutes,
 * `dayLength` per day, the day starting at clock minute `dayStart`), in steps
 * of at most `step` minutes, so it keeps going while nobody watches.
 */
export function simulate(f: FieldState, w: FieldWork, toMinute: number, dayLength: number, dayStart: number, step = 10): FieldState {
  let cur = f;
  let t = f.simMinute;
  if (toMinute - t > dayLength * 30) t = toMinute - dayLength * 30; // never more than a month to catch up
  while (t < toMinute) {
    const dt = Math.min(step, toMinute - t);
    const day = Math.floor(t / dayLength);
    const nextDay = Math.floor((t + dt) / dayLength);
    const clock = dayStart + (t % dayLength);
    if (inWorkSpell(clock) && currentJob(cur, day)) {
      cur = work(cur, w.workers * dt, w.tiles, w.tripMinutes, day);
      if (!currentJob(cur, day)) cur = { ...cur, doneAt: t + dt };
    }
    if (nextDay > day) cur = newDay(cur, nextDay);
    t += dt;
  }
  return { ...cur, simMinute: toMinute };
}

/** How far down the paddy the visible change of the current job has got (0..1), for drawing it. */
export function jobFront(f: FieldState, today: number): number {
  const job = currentJob(f, today);
  if (job === 'water') return f.waterProgress;
  if (job === 'fertilize') return f.fertProgress;
  if (job === 'hoe' || job === 'sow' || job === 'harvest') return f.progress;
  return 1;
}
