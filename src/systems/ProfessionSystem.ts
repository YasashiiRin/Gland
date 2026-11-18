import data from '../data/professions.json';

/**
 * Professions (chức nghiệp), starting with the Thầy pháp. One resource,
 * linh lực: starts at 5, +1 a day, up to 100, spent by active skills. Ten
 * passive skills sit at linh lực 10, 20 … 100 and work only while the current
 * linh lực is at or above their mark (all locked placeholders for now).
 * Active skills are learnt only from ancient books (found in the woods, or
 * dropped by a ghost) or from another Thầy pháp.
 */
export type ProfessionId = 'thay_phap';
export type SkillId = keyof typeof data.thay_phap.skills;

export interface ProfessionState {
  id: ProfessionId;
  linhLuc: number;
  /** Active skills learnt. */
  learned: SkillId[];
  /** The skill bar, in the order the player arranged it. */
  order: SkillId[];
}

export const THAY_PHAP = data.thay_phap;
export const DROPS = data.drops;
export const SKILLS = data.thay_phap.skills as Record<SkillId, { name: string; cost: number; seconds: number; description: string }>;

export function becomeThayPhap(): ProfessionState {
  return { id: 'thay_phap', linhLuc: THAY_PHAP.linhLuc.start, learned: [], order: [] };
}

/** A new day: +1 linh lực, up to the max. */
export function dailyLinhLuc(p: ProfessionState): ProfessionState {
  return { ...p, linhLuc: Math.min(THAY_PHAP.linhLuc.max, p.linhLuc + THAY_PHAP.linhLuc.perDay) };
}

export function learn(p: ProfessionState, skill: SkillId): ProfessionState | null {
  if (p.learned.includes(skill)) return null;
  return { ...p, learned: [...p.learned, skill], order: [...p.order, skill] };
}

/** Uses a skill: pays its linh lực, or null with the reason it can't. */
export function cast(p: ProfessionState, skill: SkillId): { state: ProfessionState } | { reason: string } {
  if (!p.learned.includes(skill)) return { reason: 'Chưa học kỹ năng này' };
  const cost = SKILLS[skill].cost;
  if (p.linhLuc + 1e-9 < cost) return { reason: 'Không đủ linh lực' };
  return { state: { ...p, linhLuc: Math.round((p.linhLuc - cost) * 100) / 100 } };
}

/** Is the passive at this mark working right now? (Its effect is still to be designed: always locked for now.) */
export function passiveReached(p: ProfessionState, threshold: number): boolean {
  return p.linhLuc >= threshold;
}

/** Moves a skill on the bar from one slot to another (drag and drop). */
export function reorder(order: SkillId[], from: number, to: number): SkillId[] {
  if (from < 0 || from >= order.length || to < 0 || to >= order.length || from === to) return order;
  const next = [...order];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/** Daily chance of an ancient book appearing in an area with this many trees. */
export function bookChance(trees: number): number {
  return Math.min(DROPS.bookChanceMax, trees * DROPS.bookChancePerTree);
}

/** Chance a ghost drops a book: the first blow's damage (share of max health) / 10 — a 5% blow gives 0.5%. */
export function ghostDropChance(damageRatio: number): number {
  return Math.max(0, damageRatio) * DROPS.ghostDropPerDamage;
}

/** How much more a scare hurts a Thầy pháp (they see the ghosts). */
export function sanityLossMultiplier(p: ProfessionState | null): number {
  return p?.id === 'thay_phap' ? THAY_PHAP.sanityLossMultiplier : 1;
}
