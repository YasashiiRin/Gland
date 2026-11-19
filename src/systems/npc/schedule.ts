import { MINUTES_PER_DAY } from './clock';
import type { NpcConfig } from './config';
import { isMarketDay } from './families';
import { restingToday } from './field';
import type { Activity, FamilyState, Npc, Place } from './types';

/**
 * Where each member of a family should be and what they should be doing at a
 * minute (pure). The clock table of the day comes from npcFarm.json; on top
 * of it come the errands that depend on the family's state: leading the
 * buffalo out and home, the market trip, the day the harvest is all home.
 * Times in the table are departure times; `since` says when the current slot
 * began so the simulation can tell how late someone is.
 */
export interface Ctx {
  minute: number;
  day: number;
  /** Minute of the day, 0 = midnight. */
  clock: number;
  weekend: boolean;
  raining: boolean;
  cfg: NpcConfig;
}

export interface Intent {
  place: Place;
  activity: Activity;
  /** Absolute minute this slot of the schedule began. */
  since: number;
  /** Leading the buffalo along on this walk. */
  withBuffalo?: boolean;
  /** Being late for this does not count (bringing the buffalo home on a market day). */
  exempt?: boolean;
}

const at = (ctx: Ctx, clock: number): number => ctx.day * MINUTES_PER_DAY + clock;

/** Placed at home (or on the way there) for the purpose of the errands. */
export function placeOf(npc: Npc): Place {
  return 'place' in npc.position ? npc.position.place : npc.position.to;
}

/** Who takes the buffalo out to graze today. */
function outLeader(f: FamilyState, ctx: Ctx): Npc | undefined {
  const role = ctx.weekend && f.type === 3 ? 'child' : 'wife';
  return f.members.find((m) => m.role === role);
}

/** Who brings it home today (on a market day: whoever got home first, see claimBuffalo). */
export function homeLeaderId(f: FamilyState, ctx: Ctx): string | null {
  if (ctx.weekend && f.type === 3) return f.members.find((m) => m.role === 'child')?.id ?? null;
  if (isMarketDay(f)) return f.buffaloReturnClaimedBy;
  return f.members.find((m) => m.role === 'wife')?.id ?? null;
}

/** The buffalo should be brought home now (or it was left out since an earlier day). */
export function buffaloDueHome(f: FamilyState, ctx: Ctx): boolean {
  const b = f.buffalo;
  return !!b && b.at === 'pasture' && (ctx.clock >= ctx.cfg.buffalo.leadHome || b.outDay < ctx.day);
}

/** On a market day the first adult home after the buffalo is due takes the job. */
export function canClaimBuffalo(f: FamilyState, npc: Npc, ctx: Ctx): boolean {
  return (
    npc.role !== 'child' &&
    !(ctx.weekend && f.type === 3) &&
    isMarketDay(f) &&
    !f.buffaloReturnClaimedBy &&
    buffaloDueHome(f, ctx) &&
    'place' in npc.position &&
    npc.position.place === 'home'
  );
}

function buffaloErrand(npc: Npc, f: FamilyState, ctx: Ctx): Intent | null {
  const b = f.buffalo;
  if (!b) return null;
  const { leadOut, leadHome } = ctx.cfg.buffalo;
  const here = placeOf(npc);
  const herding: Activity = npc.role === 'child' ? 'herd' : 'work';
  if (b.at === 'home' && b.outDay !== ctx.day && ctx.clock >= leadOut && ctx.clock < leadHome && outLeader(f, ctx)?.id === npc.id) {
    if (here !== 'home') return { place: 'home', activity: 'chores', since: at(ctx, leadOut) };
    return { place: 'pasture', activity: herding, since: at(ctx, leadOut), withBuffalo: true };
  }
  if (buffaloDueHome(f, ctx) && homeLeaderId(f, ctx) === npc.id) {
    const exempt = isMarketDay(f) && !(ctx.weekend && f.type === 3);
    const since = b.outDay < ctx.day ? ctx.minute : at(ctx, leadHome);
    if (here === 'pasture') return { place: 'home', activity: 'tea', since, withBuffalo: true, exempt };
    return { place: 'pasture', activity: herding, since, exempt };
  }
  return null;
}

function marketErrand(npc: Npc, f: FamilyState, ctx: Ctx): Intent | null {
  const shopper = f.type === 1 ? 'husband' : 'wife';
  if (npc.role !== shopper || !isMarketDay(f) || npc.marketDoneDay === ctx.day) return null;
  const leave = f.type === 1 ? ctx.cfg.adult.singleMarketLeave : ctx.cfg.adult.wifeLeaveField;
  if (ctx.clock < leave || ctx.clock >= ctx.cfg.adult.sleep) return null;
  return { place: 'market', activity: 'market', since: at(ctx, leave) };
}

function adultIntent(npc: Npc, f: FamilyState, ctx: Ctx): Intent {
  const a = ctx.cfg.adult;
  const c = ctx.clock;
  // Errands wait for the morning, unless someone is out with the buffalo.
  const errand = (c >= a.wake && c < a.sleep) || placeOf(npc) !== 'home' ? buffaloErrand(npc, f, ctx) : null;
  if (errand) return errand;
  if (c < a.wake) return { place: 'home', activity: 'sleep', since: at(ctx, a.sleep) - MINUTES_PER_DAY };
  if (c >= a.sleep) return { place: 'home', activity: 'sleep', since: at(ctx, a.sleep) };
  const market = marketErrand(npc, f, ctx);
  if (market) return market;
  if (c >= a.toField && c < a.leaveField) {
    // Back from market: straight home, not to the field.
    if (restingToday(f.fields, ctx.day) || npc.marketDoneDay === ctx.day) return { place: 'home', activity: 'tea', since: at(ctx, a.toField) };
    const lunch = c >= a.lunchStart && c < a.lunchEnd;
    if (!f.fields.length) return { place: 'home', activity: lunch ? 'eat' : 'garden', since: at(ctx, a.toField) };
    return { place: 'field', activity: lunch ? 'lunch' : 'work', since: at(ctx, a.toField) };
  }
  const home = (activity: Activity, from: number): Intent => ({ place: 'home', activity, since: at(ctx, from) });
  if (c < a.sweepUntil) return home(npc.role === 'husband' ? 'sweep' : 'chores', a.wake);
  if (c < a.breakfast) {
    const feeds = npc.role === 'wife' && f.livestock.some((l) => l === 'chicken' || l === 'pig');
    if (feeds && c >= a.feedLivestock && c < a.feedLivestock + a.feedMinutes) return home('feedLivestock', a.feedLivestock);
    return home(npc.role === 'husband' ? 'tea' : 'chores', a.sweepUntil);
  }
  if (c < a.toField) return home('eat', a.breakfast);
  if (c < a.dinner) return home('tea', a.leaveField);
  if (c < a.porch) return home('eat', a.dinner);
  return home('porch', a.porch);
}

function childIntent(npc: Npc, f: FamilyState, ctx: Ctx): Intent {
  const k = ctx.cfg.child;
  const c = ctx.clock;
  const errand = (c >= k.wake && c < k.sleep) || placeOf(npc) !== 'home' ? buffaloErrand(npc, f, ctx) : null;
  if (errand) return errand;
  if (c < k.wake) return { place: 'home', activity: 'sleep', since: at(ctx, k.sleep) - MINUTES_PER_DAY };
  if (c >= k.sleep) return { place: 'home', activity: 'sleep', since: at(ctx, k.sleep) };
  const home = (activity: Activity, from: number): Intent => ({ place: 'home', activity, since: at(ctx, from) });
  if (!ctx.weekend && c >= k.toSchool && c < k.schoolEnd) return { place: 'school', activity: 'school', since: at(ctx, k.toSchool) };
  const b = f.buffalo;
  if (ctx.weekend && b?.at === 'pasture' && c >= ctx.cfg.buffalo.leadOut && c < ctx.cfg.buffalo.leadHome) {
    return { place: 'pasture', activity: 'herd', since: at(ctx, ctx.cfg.buffalo.leadOut) };
  }
  if (c < k.breakfast) return home('play', k.wake);
  if (c < k.toSchool) return home('eat', k.breakfast);
  if (c < k.dinner) return home('play', ctx.weekend ? k.toSchool : k.schoolEnd);
  if (c < ctx.cfg.adult.porch) return home('eat', k.dinner);
  return home('play', ctx.cfg.adult.porch);
}

export function intentOf(npc: Npc, f: FamilyState, ctx: Ctx): Intent {
  return npc.role === 'child' ? childIntent(npc, f, ctx) : adultIntent(npc, f, ctx);
}
