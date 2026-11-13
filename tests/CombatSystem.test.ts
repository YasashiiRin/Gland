import { describe, expect, it } from 'vitest';
import { attackMonster, isAdjacent, stepMonsterTowardPlayer, type Monster } from '../src/systems/CombatSystem';

describe('stepMonsterTowardPlayer', () => {
  it('does nothing when the player is out of sight range', () => {
    const m: Monster = { x: 0, y: 0, health: 10, damage: 1 };
    expect(stepMonsterTowardPlayer(m, 10, 10)).toEqual(m);
  });

  it('steps one tile along the larger axis toward the player', () => {
    const m: Monster = { x: 0, y: 0, health: 10, damage: 1 };
    const stepped = stepMonsterTowardPlayer(m, 4, 1); // dx=4 > dy=1, should move in x
    expect(stepped.x).toBe(1);
    expect(stepped.y).toBe(0);
  });

  it('does not move onto the player when already adjacent', () => {
    const m: Monster = { x: 0, y: 0, health: 10, damage: 1 };
    expect(stepMonsterTowardPlayer(m, 1, 0)).toEqual(m);
  });

  it('does nothing when standing on the same tile as the player', () => {
    const m: Monster = { x: 2, y: 2, health: 10, damage: 1 };
    expect(stepMonsterTowardPlayer(m, 2, 2)).toEqual(m);
  });
});

describe('attackMonster', () => {
  it('reduces health and reports death at exactly zero', () => {
    const m: Monster = { x: 0, y: 0, health: 10, damage: 1 };
    const r = attackMonster(m, 6);
    expect(r.monster.health).toBe(4);
    expect(r.killed).toBe(false);

    const r2 = attackMonster(r.monster, 4);
    expect(r2.monster.health).toBe(0);
    expect(r2.killed).toBe(true);
  });

  it('never goes below zero health', () => {
    const m: Monster = { x: 0, y: 0, health: 5, damage: 1 };
    expect(attackMonster(m, 999).monster.health).toBe(0);
  });
});

describe('isAdjacent', () => {
  it('is true for the same tile and orthogonal neighbors, false otherwise', () => {
    expect(isAdjacent(2, 2, 2, 2)).toBe(true);
    expect(isAdjacent(2, 2, 3, 2)).toBe(true);
    expect(isAdjacent(2, 2, 2, 3)).toBe(true);
    expect(isAdjacent(2, 2, 3, 3)).toBe(false);
    expect(isAdjacent(2, 2, 4, 2)).toBe(false);
  });
});
