import { describe, expect, it } from 'vitest';
import { addItem, createEmptyInventory } from '../src/systems/InventorySystem';
import {
  COMMUNITY_FUND_ITEMS,
  createQuestState,
  donateItem,
  remainingItems,
} from '../src/systems/QuestSystem';

describe('remainingItems', () => {
  it('starts with every item needed', () => {
    expect(remainingItems(createQuestState())).toEqual(COMMUNITY_FUND_ITEMS);
  });
});

describe('donateItem', () => {
  it('accepts a needed item the player has, removing it from inventory', () => {
    const inv = addItem(createEmptyInventory(), 'parsnip', 1).state;
    const r = donateItem(createQuestState(), inv, 'parsnip');
    expect(r.donated).toBe(true);
    expect(r.state.donated).toContain('parsnip');
    expect(r.inventory.slots.some((s) => s?.itemId === 'parsnip')).toBe(false);
  });

  it('refuses an item the player does not have', () => {
    const inv = createEmptyInventory();
    const r = donateItem(createQuestState(), inv, 'parsnip');
    expect(r.donated).toBe(false);
    expect(r.state.donated).toEqual([]);
  });

  it('refuses a duplicate donation of an already-donated item', () => {
    let inv = addItem(createEmptyInventory(), 'parsnip', 2).state;
    const first = donateItem(createQuestState(), inv, 'parsnip');
    inv = first.inventory;
    const second = donateItem(first.state, inv, 'parsnip');
    expect(second.donated).toBe(false);
  });

  it('completes once every item has been donated', () => {
    let state = createQuestState();
    let inv = createEmptyInventory();
    for (const id of COMMUNITY_FUND_ITEMS) {
      inv = addItem(inv, id, 1).state;
    }
    for (const id of COMMUNITY_FUND_ITEMS) {
      const r = donateItem(state, inv, id);
      state = r.state;
      inv = r.inventory;
    }
    expect(state.completed).toBe(true);
  });

  it('refuses any further donation once completed', () => {
    const completed = { donated: COMMUNITY_FUND_ITEMS, completed: true };
    const inv = addItem(createEmptyInventory(), 'parsnip', 5).state;
    const r = donateItem(completed, inv, 'parsnip');
    expect(r.donated).toBe(false);
  });
});
