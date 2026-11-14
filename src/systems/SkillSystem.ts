export type SkillId = 'farming' | 'mining' | 'foraging' | 'fishing' | 'combat';

export const SKILL_IDS: SkillId[] = ['farming', 'mining', 'foraging', 'fishing', 'combat'];

export const SKILL_LABELS: Record<SkillId, string> = {
  farming: 'Trồng trọt',
  mining: 'Khai thác',
  foraging: 'Hái lượm',
  fishing: 'Câu cá',
  combat: 'Chiến đấu',
};

export const MAX_LEVEL = 10;

export type SkillXp = Record<SkillId, number>;

export function createInitialSkills(): SkillXp {
  return { farming: 0, mining: 0, foraging: 0, fishing: 0, combat: 0 };
}

/** Cumulative XP needed to REACH a level (level 1 needs 0 — everyone starts there). */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return level * (level - 1) * 25;
}

export function levelForXp(xp: number): number {
  let level = 1;
  while (level < MAX_LEVEL && xp >= xpForLevel(level + 1)) level++;
  return level;
}

/** How much more XP until the next level, or 0 if already at MAX_LEVEL. */
export function xpToNextLevel(xp: number): number {
  const level = levelForXp(xp);
  if (level >= MAX_LEVEL) return 0;
  return xpForLevel(level + 1) - xp;
}

export function addXp(skills: SkillXp, skillId: SkillId, amount: number): { skills: SkillXp; leveledUp: boolean; newLevel: number } {
  const before = levelForXp(skills[skillId]);
  const xp = skills[skillId] + amount;
  const after = levelForXp(xp);
  return { skills: { ...skills, [skillId]: xp }, leveledUp: after > before, newLevel: after };
}

/** XP granted by common actions, in one place so balancing is easy to tweak. */
export const XP_REWARDS = {
  harvestCrop: 3,
  mineOre: 5,
  chopTree: 4,
  cutWeed: 2,
  catchFish: 6,
  killMonster: 8,
} as const;
