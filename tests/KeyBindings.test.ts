import { describe, expect, it } from 'vitest';
import {
  actionOfKey,
  assignKey,
  changedBindings,
  clearKey,
  DEFAULT_BINDINGS,
  keyName,
  keysLabel,
  resolveBindings,
} from '../src/systems/KeyBindings';

const Q = 81;
const E = 69;
const F = 70;

describe('key bindings', () => {
  it('fills in defaults for anything not saved', () => {
    const b = resolveBindings({ use: [F] });
    expect(b.use).toEqual([F]);
    expect(b.interact).toEqual(DEFAULT_BINDINGS.interact);
    expect(resolveBindings(undefined)).toEqual(DEFAULT_BINDINGS);
  });

  it('a key belongs to one action: binding it elsewhere takes it off the old one', () => {
    const r = assignKey(DEFAULT_BINDINGS, 'use', 1, E);
    expect(r.bindings.use).toEqual([32, E]);
    expect(r.bindings.interact).toEqual([]);
    expect(r.takenFrom).toBe('interact');
    expect(actionOfKey(r.bindings, E)).toBe('use');
  });

  it('replaces a slot, keeps at most two keys, and clears a slot', () => {
    let b = assignKey(DEFAULT_BINDINGS, 'up', 0, F).bindings;
    expect(b.up).toEqual([F, 38]);
    b = assignKey(b, 'up', 5, Q).bindings; // past the end: the last slot
    expect(b.up).toEqual([F, Q]);
    expect(b.ability).toEqual([]);
    expect(clearKey(b, 'up', 0).up).toEqual([Q]);
  });

  it('saves only what changed', () => {
    expect(changedBindings(DEFAULT_BINDINGS)).toEqual({});
    const b = assignKey(DEFAULT_BINDINGS, 'inventory', 0, F).bindings;
    expect(changedBindings(b)).toEqual({ inventory: [F] });
  });

  it('names keys for the menus', () => {
    expect(keyName(87)).toBe('W');
    expect(keyName(38)).toBe('↑');
    expect(keyName(9)).toBe('Tab');
    expect(keyName(113)).toBe('F2');
    expect(keyName(undefined)).toBe('—');
    expect(keysLabel(DEFAULT_BINDINGS, 'up')).toBe('W / ↑');
  });
});
