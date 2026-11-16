import { TILE } from '../config/constants';
import type { ParkedVehicle } from '../systems/VehicleSystem';
import { ITEM_IDS, ITEMS, type ItemId } from './items';

/** Chest key used for the farm warehouse's big storage (not a placed chest). */
export const WAREHOUSE_KEY = 'warehouse';

/** Every vehicle defined in items.json (category "vehicle"). */
export const VEHICLE_IDS: readonly ItemId[] = ITEM_IDS.filter((id) => ITEMS[id].category === 'vehicle');

/**
 * Parking bays in front of the farm warehouse, as the tile column of each
 * 2-tile-wide bay. Keep in sync with build_farm() in scripts/art/maps.py.
 */
const BAY_TILE_COLUMNS = [17, 20, 23, 26];
const BAY_TILE_ROW = 10;

/** A vehicle's home spot at the warehouse (where it starts and where it's recalled to). */
export function vehicleHome(id: string): ParkedVehicle {
  const index = Math.max(0, VEHICLE_IDS.indexOf(id as ItemId)) % BAY_TILE_COLUMNS.length;
  return { mapKey: 'Farm', x: BAY_TILE_COLUMNS[index] * TILE + TILE, y: BAY_TILE_ROW * TILE + TILE - 2, facing: 'down' };
}
