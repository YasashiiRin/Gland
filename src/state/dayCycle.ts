import { pruneWildFields, seasonStamp } from '../systems/WildFieldSystem';
import { ITEMS } from '../data/items';
import { MAP_KEYS } from '../data/maps';
import { advanceAnimalDay } from '../systems/AnimalSystem';
import { advanceLivestockDay } from '../systems/LivestockSystem';
import { restoreBySleep, type EnergyState } from '../systems/EnergySystem';
import { advanceDay as advanceFarmDay, waterPlot } from '../systems/FarmingSystem';
import { addItem } from '../systems/InventorySystem';
import { coopTileKeysOnMap, placedObjectKey, sprinklerTileKeysOnMap } from '../systems/PlacedObjectSystem';
import { advanceResourceDay } from '../systems/ResourceSystem';
import { createHauntState } from '../systems/SanitySystem';
import { absoluteDayNumber, startNewDay, type TimeState } from '../systems/TimeSystem';
import { gameState } from './GameState';

/**
 * Game minute (since 6:00) at which I lay down in bed, or null while awake.
 * Runtime only: hours slept = from here to the next dawn.
 */
export const sleepState = { bedElapsed: null as number | null };

/**
 * Ends the farm's day and starts the next one at 6:00: crops grow, sprinklers
 * water, coops lay eggs, the shipping bin pays out, and tonight's haunting
 * counters reset. Does not touch the player's bars (see wakeUp).
 */
export function endWorldDay(): { time: TimeState; earnings: number } {
  const wasRaining = gameState.time.weather === 'rainy';
  const yesterdayAbsolute = absoluteDayNumber(gameState.time);
  const time = startNewDay(gameState.time);
  gameState.time = time;
  gameState.farmPlots = advanceFarmDay(gameState.farmPlots, time.season, wasRaining);
  gameState.resourceNodes = advanceResourceDay(gameState.resourceNodes, absoluteDayNumber(time));
  gameState.wildFields = pruneWildFields(gameState.wildFields, seasonStamp(time));
  for (const mapKey of MAP_KEYS) {
    // Plots and placed objects share the "Map:x,y" key, so a sprinkler waters the plot under it.
    for (const tileKey of sprinklerTileKeysOnMap(gameState.placedObjects, mapKey)) {
      gameState.farmPlots = waterPlot(gameState.farmPlots, `${mapKey}:${tileKey}`);
    }
    // Chicken coops: yesterday's feeding decides today's happiness and egg.
    for (const tileKey of coopTileKeysOnMap(gameState.placedObjects, mapKey)) {
      const [cx, cy] = tileKey.split(',').map(Number);
      const placed = gameState.placedObjects[placedObjectKey(mapKey, cx, cy)];
      if (!placed?.animal) continue;
      const result = advanceAnimalDay(placed.animal, yesterdayAbsolute);
      placed.animal = result.animal;
      if (result.producedEgg) gameState.inventory = addItem(gameState.inventory, 'egg', 1).state;
    }
  }
  gameState.livestock = gameState.livestock.map(advanceLivestockDay);
  let earnings = 0;
  for (const [itemId, qty] of Object.entries(gameState.shippingBin)) {
    earnings += (ITEMS[itemId as keyof typeof ITEMS].sellPrice ?? 0) * (qty ?? 0);
  }
  gameState.money += earnings;
  gameState.shippingBin = {};
  return { time, earnings };
}

/**
 * The morning after: if I was in bed, each hour slept restores 12.5% of
 * energy, health and sanity (8 hours = full). Staying up restores nothing.
 */
export function wakeUp(hoursSlept: number): void {
  const rest = (bar: EnergyState) => restoreBySleep(bar, hoursSlept);
  if (hoursSlept > 0) {
    gameState.energy = rest(gameState.energy);
    gameState.playerHealth = rest(gameState.playerHealth);
    gameState.sanity = rest(gameState.sanity);
  }
  gameState.haunt = createHauntState();
  sleepState.bedElapsed = null;
}

/** Hours from when I lay down until dawn (0 if I never went to bed). */
export function hoursSlept(dayLengthMinutes: number): number {
  const bed = sleepState.bedElapsed;
  return bed === null ? 0 : Math.max(0, (dayLengthMinutes - bed) / 60);
}
