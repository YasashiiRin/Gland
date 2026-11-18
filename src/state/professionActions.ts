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

/** Another player in the room taught me a skill. Returns what to tell me. */
export function receiveTeaching(from: string, skill: string): string {
  const p = gameState.profession;
  if (!(skill in SKILLS)) return `${from} muốn truyền một phép lạ`;
  const name = SKILLS[skill as SkillId].name;
  if (p?.id !== 'thay_phap') return `${from} muốn truyền phép ${name}, nhưng bạn chưa phải Thầy pháp`;
  const next = learn(p, skill as SkillId);
  if (!next) return `${from} truyền phép ${name} — bạn đã biết phép này rồi`;
  gameState.profession = next;
  return `${from} đã truyền cho bạn phép ${name}!`;
}
