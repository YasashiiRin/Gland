import { PASTURE, vehicleHome } from '../data/garage';
import type { ItemId } from '../data/items';
import { isMapKey } from '../data/maps';
import { addItem } from '../systems/InventorySystem';
import type { GameState } from './GameState';

/** Where you wake up when your save was on a map that no longer exists. */
const FALLBACK_MAP = 'QuangBinh';

function onLiveMap(key: string): boolean {
  const map = key.split(':')[0];
  return key.includes(':') && isMapKey(map);
}

/**
 * Big world, phase 2: the Farm, House and Town maps are gone. A save made
 * before that keeps its money, items and progress: the player wakes up in
 * Quảng Bình, crops on the old farm are lost (the old plot keys had no map),
 * objects placed there (and what their chests held) go into the
 * co-operative's warehouse, vehicles go back to their bays and farm animals
 * to the co-operative's meadow. Saves already in the big world are untouched.
 */
export function moveToBigWorld(state: GameState): GameState {
  const next = { ...state };
  if (!isMapKey(next.currentMap)) {
    next.currentMap = FALLBACK_MAP;
    next.spawnId = 'default';
  }
  next.farmPlots = Object.fromEntries(Object.entries(next.farmPlots).filter(([key]) => onLiveMap(key)));

  let warehouse = next.warehouse;
  const placed = { ...next.placedObjects };
  for (const [key, obj] of Object.entries(placed)) {
    if (onLiveMap(key)) continue;
    warehouse = addItem(warehouse, obj.kind as ItemId, 1).state;
    for (const stack of obj.chest?.slots ?? []) {
      if (stack) warehouse = addItem(warehouse, stack.itemId, stack.quantity).state;
    }
    delete placed[key];
  }
  next.placedObjects = placed;
  next.warehouse = warehouse;

  next.vehicles = Object.fromEntries(
    Object.entries(next.vehicles).map(([id, spot]) => [id, spot && !isMapKey(spot.mapKey) ? vehicleHome(id) : spot]),
  );
  next.livestock = next.livestock.map((a) => (isMapKey(a.mapKey) ? a : { ...a, mapKey: PASTURE.mapKey, x: PASTURE.x, y: PASTURE.y }));
  next.boats = Object.fromEntries(Object.entries(next.boats).filter(([, b]) => isMapKey(b.mapKey)));
  return next;
}
