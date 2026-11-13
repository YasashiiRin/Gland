import { ITEMS, type ItemId } from '../data/items';

/** Placeholder colors per category until real item icons exist. */
const CATEGORY_COLOR: Record<string, number> = {
  tool: 0x8a6a4a,
  seed: 0xd9a441,
  crop: 0xe8714a,
  material: 0x8c8c94,
  food: 0xe3a6c4,
  fish: 0x4a8fd9,
  furniture: 0xa56bc9,
};

export function slotColor(itemId: ItemId): number {
  return CATEGORY_COLOR[ITEMS[itemId].category] ?? 0x888888;
}

/** Short label drawn on the slot icon (first syllable of the Vietnamese name). */
export function slotLabel(itemId: ItemId): string {
  const name = ITEMS[itemId].name;
  return name.split(' ')[0].slice(0, 3);
}
