import type { InventoryState } from './InventorySystem';
import { removeItem } from './InventorySystem';
import type { ItemId } from '../data/items';

/** The one community-fund quest for this version: donate one of each listed crop. */
export const COMMUNITY_FUND_ITEMS: ItemId[] = ['parsnip', 'potato', 'cauliflower', 'strawberry', 'green_bean'];

export interface QuestState {
  /** Which of COMMUNITY_FUND_ITEMS have already been donated. */
  donated: ItemId[];
  completed: boolean;
}

export function createQuestState(): QuestState {
  return { donated: [], completed: false };
}

export function remainingItems(state: QuestState): ItemId[] {
  return COMMUNITY_FUND_ITEMS.filter((id) => !state.donated.includes(id));
}

/**
 * Donates one unit of itemId if it's still needed and the player has it.
 * Returns the unchanged state/inventory if the item isn't needed or isn't held.
 */
export function donateItem(
  state: QuestState,
  inventory: InventoryState,
  itemId: ItemId,
): { state: QuestState; inventory: InventoryState; donated: boolean } {
  if (state.completed || state.donated.includes(itemId) || !COMMUNITY_FUND_ITEMS.includes(itemId)) {
    return { state, inventory, donated: false };
  }
  let nextInventory: InventoryState;
  try {
    nextInventory = removeItem(inventory, itemId, 1);
  } catch {
    return { state, inventory, donated: false }; // doesn't have one
  }
  const donated = [...state.donated, itemId];
  const completed = donated.length >= COMMUNITY_FUND_ITEMS.length;
  return { state: { donated, completed }, inventory: nextInventory, donated: true };
}
