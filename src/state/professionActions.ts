import { ITEMS, type ItemId } from '../data/items';
import { removeItem } from '../systems/InventorySystem';
import { becomeThayPhap, learn, SKILLS, type SkillId } from '../systems/ProfessionSystem';
import { gameState } from './GameState';

/**
 * Using a relic from the bag: a talisman makes you a Thầy pháp, an ancient
 * book teaches its skill (Thầy pháp only). Returns what to tell the player.
 */
export function useRelic(itemId: ItemId): string | null {
  const def = ITEMS[itemId];
  if (def.unlocks === 'thay_phap') {
    if (gameState.profession) return 'Bạn đã là Thầy pháp rồi';
    gameState.profession = becomeThayPhap();
    gameState.inventory = removeItem(gameState.inventory, itemId, 1);
    return 'Bạn đã thành Thầy pháp! Bấm vào hình đại diện trên các thanh để xem linh lực và phép.';
  }
  if (def.teaches) {
    const p = gameState.profession;
    if (p?.id !== 'thay_phap') return 'Chữ trong sách lạ lắm — chỉ Thầy pháp mới đọc được';
    const skill = def.teaches as SkillId;
    const next = learn(p, skill);
    if (!next) return `Bạn đã biết phép ${SKILLS[skill].name}`;
    gameState.profession = next;
    gameState.inventory = removeItem(gameState.inventory, itemId, 1);
    return `Đã học phép ${SKILLS[skill].name}!`;
  }
  return null;
}
