import { clockOfMinute, dayOf, isWeekend, MINUTES_PER_DAY } from './clock';
import type { NpcConfig } from './config';
import { plotSeed } from './families';
import { checkHarvestDone, checkHaulDone, completeTask, newFieldDay, pickTaskOnPlots, rainOn, reserve } from './field';
import { canClaimBuffalo, intentOf, type Ctx, type Intent } from './schedule';
import type { FamilyLayout, FamilyState, Npc, Place } from './types';

/**
 * Runs a family forward minute by minute (pure): the schedule says where
 * everyone should be; people walk there (taking the walking minutes of the
 * layout), work the field cell by cell, carry the harvest home, take the
 * buffalo out and back, go to market. The same code runs for a family on
 * screen, off screen (only its sprites are skipped) and to catch up on the
 * hours that passed while nobody looked (sleep, another map, a closed game).
 */
export interface SimEnv {
  layout: FamilyLayout;
  /** Is it raining at this absolute minute? */
  raining: (minute: number) => boolean;
  cfg: NpcConfig;
}

export type SimEvent = { kind: 'farewell'; npcId: string };

export function makeCtx(minute: number, env: SimEnv): Ctx {
  const day = dayOf(minute);
  return { minute, day, clock: clockOfMinute(minute), weekend: isWeekend(day, env.cfg), raining: env.raining(minute), cfg: env.cfg };
}

function travelMinutes(from: Place, to: Place, env: SimEnv): number {
  if (from === to) return 0;
  if (from === 'market' || to === 'market') return env.cfg.market.walkMinutes;
  return Math.max(env.cfg.travel.minMinutes, env.layout.minutes(from, to));
}

/** Replaces plot `k` of the family's field. */
function setPlot(f: FamilyState, k: number, grid: FamilyState['fields'][number]): void {
  f.fields = f.fields.map((g, i) => (i === k ? grid : g));
}

function finishTask(f: FamilyState, npc: Npc, ctx: Ctx): void {
  const task = npc.currentTask;
  const grid = task ? f.fields[task.plot] : undefined;
  if (!task || !grid) return;
  setPlot(f, task.plot, completeTask(grid, task.cell, task.kind, ctx.day, ctx.raining, ctx.cfg));
  npc.currentTask = null;
  idleOf(f).clear();
}

function dropTask(f: FamilyState, npc: Npc): void {
  const t = npc.currentTask;
  if (t && f.fields[t.plot]) setPlot(f, t.plot, reserve(f.fields[t.plot], t.cell, null));
  npc.currentTask = null;
  idleOf(f).clear();
}

function depart(f: FamilyState, npc: Npc, from: Place, it: Intent, late: boolean, env: SimEnv): void {
  npc.speedMultiplier = late || npc.hurry ? env.cfg.lateness.hurrySpeedMultiplier : 1;
  npc.hurry = false;
  if (it.withBuffalo && f.buffalo?.at === from) f.buffalo = { ...f.buffalo, at: null, ledBy: npc.id };
  npc.position = { from, to: it.place, total: travelMinutes(from, it.place, env), done: 0 };
  npc.state = 'walking';
  npc.pendingSince = -1;
}

function arrive(f: FamilyState, npc: Npc, to: Place, ctx: Ctx): void {
  npc.position = { place: to };
  npc.speedMultiplier = 1;
  if (f.buffalo?.ledBy === npc.id) {
    f.buffalo = { at: to, ledBy: null, outDay: to === 'pasture' ? ctx.day : f.buffalo.outDay };
    if (to === 'home' && f.buffaloReturnClaimedBy === npc.id) f.buffaloReturnClaimedBy = null;
  }
  if (npc.carrying && to === 'home') {
    npc.carrying = false;
    f.yardPiles = [...f.yardPiles, ctx.day].slice(-ctx.cfg.yardPiles.max);
  }
  if (to === 'market') npc.marketUntil = ctx.minute + ctx.cfg.market.stayMinutes;
}

/**
 * Per run: workers who found nothing to do on the field (npc id -> day), so
 * they don't search the whole field every minute while weeding. Only a
 * shortcut: it is forgotten whenever a job is finished or let go (the only
 * ways a new job can turn up within a day), so results are the same without it.
 */
const idleRuns = new WeakMap<FamilyState, Map<string, number>>();
const idleOf = (f: FamilyState) => idleRuns.get(f) ?? idleRuns.set(f, new Map()).get(f)!;

/**
 * Field work: finish the job in hand, then take the next. A plot whose
 * harvest is all in has its piles carried home one per trip; that comes after
 * harvesting and watering the other plots (so nothing dies meanwhile) but
 * before the rest.
 */
function fieldWork(f: FamilyState, npc: Npc, ctx: Ctx, env: SimEnv): void {
  if (!f.fields.length) return;
  if (npc.currentTask && ctx.minute >= npc.currentTask.until) finishTask(f, npc, ctx);
  if (npc.currentTask) {
    npc.state = 'work';
    return;
  }
  const half = f.type === 1 ? null : npc.role === 'husband' ? 0 : 1;
  const pick = idleOf(f).get(npc.id) === ctx.day ? null : pickTaskOnPlots(f.fields, half, ctx.day, ctx.cfg);
  const urgent = pick && (pick.kind === 'harvest' || pick.kind === 'water');
  const pile = f.fields.findIndex((g) => g.phase === 'hauling' && g.piles > 0);
  if (!urgent && pile >= 0 && npc.role !== 'child') {
    setPlot(f, pile, { ...f.fields[pile], piles: f.fields[pile].piles - 1 });
    npc.carrying = true;
    depart(f, npc, 'field', { place: 'home', activity: 'tea', since: ctx.minute }, false, env);
    return;
  }
  if (!pick) {
    idleOf(f).set(npc.id, ctx.day);
    npc.state = 'weed';
    return;
  }
  setPlot(f, pick.plot, reserve(f.fields[pick.plot], pick.cell, npc.id));
  npc.currentTask = { kind: pick.kind, plot: pick.plot, cell: pick.cell, until: ctx.minute + ctx.cfg.field.minutes[pick.kind] };
  npc.state = 'work';
}

/** Minutes until this person's schedule moves on (0: it already has). */
export function minutesToNextChange(f: FamilyState, npc: Npc, minute: number, env: SimEnv, horizon: number): number {
  const now = intentOf(npc, f, makeCtx(minute, env));
  const here = 'place' in npc.position ? npc.position.place : npc.position.to;
  if (now.place !== here) return 0;
  for (let k = 1; k <= horizon; k++) {
    const next = intentOf(npc, f, makeCtx(minute + k, env));
    if (next.place !== now.place || next.activity !== now.activity) return k;
  }
  return Infinity;
}

function stepNpc(f: FamilyState, npc: Npc, ctx: Ctx, env: SimEnv, events: SimEvent[]): void {
  const t = ctx.minute;
  const cfg = ctx.cfg;
  if (npc.talkUntil > t) {
    if (minutesToNextChange(f, npc, t, env, cfg.talk.wrapUpMinutes) > cfg.talk.wrapUpMinutes) {
      npc.state = 'talking';
      if (npc.currentTask) npc.currentTask = { ...npc.currentTask, until: npc.currentTask.until + 1 };
      return;
    }
    npc.talkUntil = -1;
    npc.hurry = true;
    events.push({ kind: 'farewell', npcId: npc.id });
  } else if (npc.talkUntil >= 0) npc.talkUntil = -1;

  const pos = npc.position;
  if (!('place' in pos)) {
    const done = pos.done + npc.speedMultiplier;
    npc.position = { ...pos, done };
    npc.state = 'walking';
    if (done >= pos.total) arrive(f, npc, pos.to, ctx);
    return;
  }
  const here = pos.place;
  if (here === 'market' && npc.marketUntil >= 0 && t >= npc.marketUntil) {
    npc.marketDoneDay = ctx.day;
    npc.marketUntil = -1;
  }
  if (canClaimBuffalo(f, npc, ctx)) f.buffaloReturnClaimedBy = npc.id;
  const it = intentOf(npc, f, ctx);
  if (it.place !== here) {
    if (npc.pendingSince < 0) npc.pendingSince = t;
    const late = !it.exempt && t - Math.max(it.since, npc.pendingSince) >= cfg.lateness.toleranceMinutes;
    if (npc.currentTask && t >= npc.currentTask.until) finishTask(f, npc, ctx);
    if (npc.currentTask && !late) return; // finishing the cell in hand
    dropTask(f, npc);
    depart(f, npc, here, it, late, env);
    return;
  }
  npc.pendingSince = -1;
  if (here === 'field' && it.activity === 'work') return fieldWork(f, npc, ctx, env);
  if (npc.currentTask) {
    // Lunch came mid-job: finish the cell, then eat.
    if (t >= npc.currentTask.until) finishTask(f, npc, ctx);
    else return;
  }
  npc.state = it.activity;
}

function newDay(f: FamilyState, day: number, cfg: NpcConfig): void {
  f.fields = f.fields.map((g, k) => newFieldDay(g, day, plotSeed(f.seed, k), cfg));
  f.yardPiles = f.yardPiles.filter((d) => day - d < cfg.yardPiles.lifetimeDays);
  f.marketCounter = (f.marketCounter + 1) % cfg.market.everyDays[f.type];
  f.buffaloReturnClaimedBy = null;
}

/** Everyone in bed at home: nothing happens until morning (or midnight). */
function nightSkipTo(f: FamilyState, t: number, cfg: NpcConfig): number | null {
  const clock = clockOfMinute(t);
  const wake = Math.min(cfg.adult.wake, cfg.child.wake);
  const bed = Math.max(cfg.adult.sleep, cfg.child.sleep);
  if (clock >= wake && clock < bed) return null;
  if (f.buffalo?.ledBy || f.members.some((m) => m.state !== 'sleep' || !('place' in m.position) || m.talkUntil >= 0)) return null;
  const day = dayOf(t);
  return clock >= bed ? (day + 1) * MINUTES_PER_DAY : day * MINUTES_PER_DAY + wake;
}

export function simulateFamily(family: FamilyState, env: SimEnv, toMinute: number): { family: FamilyState; events: SimEvent[] } {
  if (toMinute <= family.simMinute) return { family, events: [] };
  const f = structuredClone(family);
  const events: SimEvent[] = [];
  let t = Math.max(f.simMinute, toMinute - env.cfg.world.maxCatchUpDays * MINUTES_PER_DAY);
  let curDay = dayOf(f.simMinute);
  if (dayOf(t) > curDay + 1) curDay = dayOf(t) - 1;
  let rainDay = -1;
  while (t < toMinute) {
    const day = dayOf(t);
    while (curDay < day) newDay(f, ++curDay, env.cfg);
    const skip = nightSkipTo(f, t, env.cfg);
    if (skip !== null && skip > t + 1) {
      t = Math.min(skip, toMinute);
      continue;
    }
    const ctx = makeCtx(t, env);
    if (f.fields.length && ctx.raining && rainDay !== day) {
      f.fields = f.fields.map(rainOn);
      rainDay = day;
    }
    for (const npc of f.members) stepNpc(f, npc, ctx, env, events);
    if (f.fields.length) {
      const carrying = f.members.some((m) => m.carrying);
      f.fields = f.fields.map((g) => checkHaulDone(checkHarvestDone(g), day, carrying));
    }
    t += 1;
  }
  while (curDay < dayOf(toMinute)) newDay(f, ++curDay, env.cfg);
  f.simMinute = toMinute;
  return { family: f, events };
}

/** The player starts talking: the person stops (unless it is time to go: then a quick goodbye). */
export function startTalk(family: FamilyState, npcId: string, minute: number, env: SimEnv): { family: FamilyState; farewell: boolean } {
  const npc = family.members.find((m) => m.id === npcId);
  if (!npc || npc.state === 'sleep') return { family, farewell: false };
  const wrap = env.cfg.talk.wrapUpMinutes;
  if (minutesToNextChange(family, npc, minute, env, wrap) <= wrap) {
    return { family: { ...family, members: family.members.map((m) => (m.id === npcId ? { ...m, hurry: true } : m)) }, farewell: true };
  }
  const members = family.members.map((m) => (m.id === npcId ? { ...m, talkUntil: minute + env.cfg.talk.maxMinutes, state: 'talking' as const } : m));
  return { family: { ...family, members }, farewell: false };
}

export function endTalk(family: FamilyState, npcId: string): FamilyState {
  if (!family.members.some((m) => m.id === npcId && m.talkUntil >= 0)) return family;
  return { ...family, members: family.members.map((m) => (m.id === npcId ? { ...m, talkUntil: -1 } : m)) };
}
