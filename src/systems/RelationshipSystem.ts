import type { ItemId } from '../data/items';
import { NPCS, type NpcId } from '../data/npcs';
import type { Season } from './TimeSystem';

export interface RelationshipState {
  points: number; // 0-250
  giftsThisWeek: number;
  lastGiftWeek: number;
}

export type Relationships = Partial<Record<NpcId, RelationshipState>>;

export const MAX_POINTS = 250;
export const POINTS_PER_HEART = 25;
export const MAX_GIFTS_PER_WEEK = 2;

export function createRelationship(): RelationshipState {
  return { points: 0, giftsThisWeek: 0, lastGiftWeek: -1 };
}

export function heartsFor(state: RelationshipState | undefined): number {
  if (!state) return 0;
  return Math.min(10, Math.floor(state.points / POINTS_PER_HEART));
}

export type GiftReaction = 'loved' | 'liked' | 'disliked' | 'hated' | 'neutral';

function baseReactionValue(reaction: GiftReaction): number {
  switch (reaction) {
    case 'loved':
      return 80;
    case 'liked':
      return 45;
    case 'disliked':
      return -20;
    case 'hated':
      return -40;
    default:
      return 20;
  }
}

export function reactionFor(npcId: NpcId, itemId: ItemId): GiftReaction {
  const def = NPCS[npcId];
  if (def.lovedGifts.includes(itemId)) return 'loved';
  if (def.likedGifts.includes(itemId)) return 'liked';
  if (def.hatedGifts.includes(itemId)) return 'hated';
  if (def.dislikedGifts.includes(itemId)) return 'disliked';
  return 'neutral';
}

export function isBirthday(npcId: NpcId, season: Season, day: number): boolean {
  const b = NPCS[npcId].birthday;
  return b.season === season && b.day === day;
}

export interface GiftResult {
  relationships: Relationships;
  reaction: GiftReaction;
  pointsChanged: number;
  capped: boolean;
}

/**
 * Gives a gift to an NPC. Caps at MAX_GIFTS_PER_WEEK per NPC per week (the
 * counter resets the first time a gift is given in a new week); birthdays
 * double the point change (good gifts feel extra special, bad ones extra bad).
 */
export function giveGift(
  relationships: Relationships,
  npcId: NpcId,
  itemId: ItemId,
  weekIndex: number,
  isNpcBirthday: boolean,
): GiftResult {
  const existing = relationships[npcId] ?? createRelationship();
  const state = existing.lastGiftWeek === weekIndex ? existing : { ...existing, giftsThisWeek: 0, lastGiftWeek: weekIndex };

  if (state.giftsThisWeek >= MAX_GIFTS_PER_WEEK) {
    return { relationships: { ...relationships, [npcId]: state }, reaction: 'neutral', pointsChanged: 0, capped: true };
  }

  const reaction = reactionFor(npcId, itemId);
  const delta = baseReactionValue(reaction) * (isNpcBirthday ? 2 : 1);
  const points = Math.max(0, Math.min(MAX_POINTS, state.points + delta));

  const next: RelationshipState = { points, giftsThisWeek: state.giftsThisWeek + 1, lastGiftWeek: weekIndex };
  return { relationships: { ...relationships, [npcId]: next }, reaction, pointsChanged: points - state.points, capped: false };
}
