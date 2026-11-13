import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createInitialState, STATE_VERSION } from '../src/state/GameState';
import { clearSave, hasSave, load, save } from '../src/systems/SaveService';

/**
 * This project's test environment is plain Node (no jsdom), which has no
 * localStorage. A tiny in-memory stand-in is enough for SaveService's needs
 * and keeps the dependency list small.
 */
class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length(): number {
    return this.store.size;
  }
  clear(): void {
    this.store.clear();
  }
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
}

beforeEach(() => {
  vi.stubGlobal('localStorage', new MemoryStorage());
});

describe('SaveService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('reports no save initially, then reports one after saving', () => {
    expect(hasSave()).toBe(false);
    save(createInitialState());
    expect(hasSave()).toBe(true);
  });

  it('round-trips a state with farm plots and inventory intact', () => {
    const state = createInitialState('Linh', 'Trại Xanh');
    state.money = 1234;
    state.farmPlots['5,5'] = { tilled: true, cropId: 'parsnip', growthDay: 2, wateredToday: true };
    save(state);

    const loaded = load();
    expect(loaded).not.toBeNull();
    expect(loaded?.money).toBe(1234);
    expect(loaded?.playerName).toBe('Linh');
    expect(loaded?.farmName).toBe('Trại Xanh');
    expect(loaded?.farmPlots['5,5']).toEqual({ tilled: true, cropId: 'parsnip', growthDay: 2, wateredToday: true });
  });

  it('returns null and does not throw when there is no save', () => {
    expect(load()).toBeNull();
  });

  it('refuses to load a save written by a different state version', () => {
    const state = createInitialState();
    (state as unknown as { version: number }).version = STATE_VERSION + 1;
    save(state);
    expect(load()).toBeNull();
  });

  it('refuses to load corrupted JSON instead of throwing', () => {
    localStorage.setItem('farm-game-save', '{not valid json');
    expect(load()).toBeNull();
  });

  it('clearSave removes the save', () => {
    save(createInitialState());
    expect(hasSave()).toBe(true);
    clearSave();
    expect(hasSave()).toBe(false);
  });

  it('handles a storage that throws (e.g. disabled/private mode) without crashing', () => {
    const throwingStorage: Storage = {
      length: 0,
      clear: () => {},
      key: () => null,
      getItem: () => null,
      removeItem: () => {},
      setItem: () => {
        throw new Error('quota exceeded');
      },
    };
    vi.stubGlobal('localStorage', throwingStorage);
    expect(() => save(createInitialState())).not.toThrow();
  });
});
