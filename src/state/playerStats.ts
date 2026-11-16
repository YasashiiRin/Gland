import { ITEMS } from '../data/items';
import { restore } from '../systems/EnergySystem';
import { itemAt, removeItem } from '../systems/InventorySystem';
import { absoluteMinute, activeBuffs, addBuff, speedMultiplier, type ItemStats } from '../systems/StatsSystem';
import { gameState } from './GameState';

/**
 * Every stat source in effect right now: the held tool/weapon, the vehicle
 * being ridden and any unexpired food buffs. Food and vehicles only count
 * once used (eaten / ridden), not merely by being held.
 */
export function currentStatSources(): (ItemStats | undefined)[] {
  const held = itemAt(gameState.inventory, gameState.equippedSlot);
  const heldDef = held ? ITEMS[held.itemId] : undefined;
  const heldStats = heldDef && heldDef.category !== 'food' && heldDef.category !== 'vehicle' ? heldDef.stats : undefined;
  const ridingStats = gameState.riding ? ITEMS[gameState.riding].stats : undefined;
  const buffs = activeBuffs(gameState.buffs, absoluteMinute(gameState.time)).map((b) => b.stats);
  return [heldStats, ridingStats, ...buffs];
}

export function currentSpeedMultiplier(): number {
  return speedMultiplier(currentStatSources());
}

/**
 * Eats one of the held food item: restores energy and, if the food has
 * stats + buffMinutes, starts (or refreshes) its timed buff.
 * Returns a short message for floating text, or null if nothing was eaten.
 */
export function eatHeldFood(): string | null {
  const held = itemAt(gameState.inventory, gameState.equippedSlot);
  if (!held) return null;
  const def = ITEMS[held.itemId];
  if (def.category !== 'food' || !def.food) return null;
  if (gameState.energy.current >= gameState.energy.max && !def.food.buffMinutes) return 'Đang no, chưa ăn được';

  gameState.inventory = removeItem(gameState.inventory, held.itemId, 1);
  gameState.energy = restore(gameState.energy, def.food.energy);
  let message = `+${def.food.energy} năng lượng`;
  if (def.stats && def.food.buffMinutes) {
    gameState.buffs = addBuff(gameState.buffs, held.itemId, def.stats, def.food.buffMinutes, absoluteMinute(gameState.time));
    if (def.stats.speed) message += ` · tốc độ +${Math.round(def.stats.speed * 100)}%`;
  }
  return message;
}
