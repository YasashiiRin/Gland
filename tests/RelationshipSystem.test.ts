import { describe, expect, it } from 'vitest';
import {
  giveGift,
  heartsFor,
  isBirthday,
  reactionFor,
  type Relationships,
} from '../src/systems/RelationshipSystem';

describe('reactionFor', () => {
  it('classifies gifts per the NPC gift lists', () => {
    expect(reactionFor('chu_tu', 'potato')).toBe('loved');
    expect(reactionFor('chu_tu', 'parsnip')).toBe('liked');
    expect(reactionFor('chu_tu', 'strawberry')).toBe('disliked');
    expect(reactionFor('chu_tu', 'stone')).toBe('hated');
    expect(reactionFor('chu_tu', 'fiber')).toBe('neutral');
  });
});

describe('isBirthday', () => {
  it('matches only the exact season/day', () => {
    expect(isBirthday('chu_tu', 'spring', 5)).toBe(true);
    expect(isBirthday('chu_tu', 'spring', 6)).toBe(false);
    expect(isBirthday('chu_tu', 'summer', 5)).toBe(false);
  });
});

describe('giveGift', () => {
  it('adds the right amount of points for each reaction tier', () => {
    let rel: Relationships = {};
    let r = giveGift(rel, 'chu_tu', 'potato', 1, false); // loved: +80
    expect(r.pointsChanged).toBe(80);
    rel = r.relationships;
    r = giveGift(rel, 'co_hanh', 'wood', 1, false); // liked: +45
    expect(r.pointsChanged).toBe(45);
  });

  it('never drops points below zero', () => {
    const rel: Relationships = { chu_tu: { points: 10, giftsThisWeek: 0, lastGiftWeek: 1 } } as Relationships;
    const r = giveGift(rel, 'chu_tu', 'stone', 1, false); // hated: -40
    expect(r.relationships.chu_tu!.points).toBe(0);
  });

  it('doubles the change on the NPC birthday', () => {
    const r = giveGift({}, 'chu_tu', 'potato', 1, true);
    expect(r.pointsChanged).toBe(160);
  });

  it('caps at MAX_GIFTS_PER_WEEK and resets the counter on a new week', () => {
    let rel: Relationships = {};
    let r = giveGift(rel, 'chu_tu', 'potato', 1, false);
    rel = r.relationships;
    r = giveGift(rel, 'chu_tu', 'potato', 1, false);
    rel = r.relationships;
    expect(rel.chu_tu!.giftsThisWeek).toBe(2);

    r = giveGift(rel, 'chu_tu', 'potato', 1, false); // same week, 3rd gift
    expect(r.capped).toBe(true);
    expect(r.pointsChanged).toBe(0);
    rel = r.relationships;

    r = giveGift(rel, 'chu_tu', 'potato', 2, false); // new week: allowed again
    expect(r.capped).toBe(false);
    expect(r.pointsChanged).toBe(80);
  });

  it('heartsFor converts points to hearts, capped at 10', () => {
    expect(heartsFor(undefined)).toBe(0);
    expect(heartsFor({ points: 0, giftsThisWeek: 0, lastGiftWeek: 0 })).toBe(0);
    expect(heartsFor({ points: 125, giftsThisWeek: 0, lastGiftWeek: 0 })).toBe(5);
    expect(heartsFor({ points: 250, giftsThisWeek: 0, lastGiftWeek: 0 })).toBe(10);
    expect(heartsFor({ points: 9999, giftsThisWeek: 0, lastGiftWeek: 0 })).toBe(10);
  });
});
