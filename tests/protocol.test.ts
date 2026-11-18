import { describe, expect, it } from 'vitest';
import { makeRoomCode, normalizeRoomCode, pickShared, ROOM_CODE_LENGTH, SHARED_KEYS } from '../src/net/protocol';
import { createInitialState } from '../src/state/GameState';

describe('net protocol', () => {
  it('makes 6-character codes without look-alike characters', () => {
    const code = makeRoomCode();
    expect(code).toHaveLength(ROOM_CODE_LENGTH);
    expect(code).not.toMatch(/[01OIL]/);
  });

  it('normalizes typed codes and rejects bad ones', () => {
    expect(normalizeRoomCode(' k7m-2qx ')).toBe('K7M2QX');
    expect(normalizeRoomCode('ABC')).toBeNull();
    expect(normalizeRoomCode('ABCDE0')).toBeNull(); // 0 is never used
  });

  it('shares only farm-wide state, as an independent copy', () => {
    const state = createInitialState();
    state.farmPlots = { '1,1': { tilled: true, growthDay: 0, wateredToday: false } };
    const world = pickShared(state);
    expect(Object.keys(world).sort()).toEqual([...SHARED_KEYS].sort());
    expect(world).not.toHaveProperty('inventory');
    expect(world).not.toHaveProperty('energy');
    world.farmPlots['1,1'].tilled = false;
    expect(state.farmPlots['1,1'].tilled).toBe(true);
  });
});

describe('co-op sleeping and profiles', () => {
  it('ends the day only when every player is in bed', async () => {
    const { everyoneAsleep } = await import('../src/net/protocol');
    const players = [{ id: 'host' }, { id: 'a' }, { id: 'b' }];
    expect(everyoneAsleep(players, new Set(['host', 'a']))).toBe(false);
    expect(everyoneAsleep(players, new Set(['host', 'a', 'b']))).toBe(true);
    expect(everyoneAsleep([{ id: 'host' }], new Set(['host']))).toBe(true);
    expect(everyoneAsleep([], new Set())).toBe(false);
  });

  it('keeps only personal things in a profile', async () => {
    const { pickProfile } = await import('../src/net/protocol');
    const profile = pickProfile(createInitialState());
    expect(Object.keys(profile).sort()).toEqual(['buffs', 'energy', 'equippedSlot', 'hunger', 'inventory', 'playerHealth', 'profession', 'sanity', 'skills']);
  });
});
