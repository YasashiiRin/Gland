import { TILE } from '../config/constants';
import type { ParkedVehicle } from '../systems/VehicleSystem';
import { ITEM_IDS, ITEMS, type ItemId } from './items';

/** Chest key used for the farm warehouse's big storage (not a placed chest). */
export const WAREHOUSE_KEY = 'warehouse';

/** Every vehicle defined in items.json (category "vehicle"). */
export const VEHICLE_IDS: readonly ItemId[] = ITEM_IDS.filter((id) => ITEMS[id].category === 'vehicle');

/** Every player is given a bicycle, kept in the yard of their own home rather than at the warehouse. */
export const HOME_VEHICLE: ItemId = 'bicycle';

/** Vehicles that live in the warehouse bays (bought ones). */
export const WAREHOUSE_VEHICLE_IDS: readonly ItemId[] = VEHICLE_IDS.filter((id) => id !== HOME_VEHICLE);

/**
 * Parking bays in front of the co-operative's warehouse in Quảng Bình, as the
 * tile column of each 2-tile-wide bay. Keep in sync with scripts/art/map_services.py.
 */
const BAY_MAP = 'QuangBinh';
const BAY_TILE_COLUMNS = [260, 263, 266, 269, 272];
const BAY_TILE_ROW = 243;

/** The co-operative's meadow, where bought farm animals are let loose (world pixels). */
export const PASTURE = { mapKey: BAY_MAP, x: 276 * TILE + TILE / 2, y: 247 * TILE } as const;

/** A vehicle's home spot at the warehouse (where it starts and where it's recalled to). */
export function vehicleHome(id: string): ParkedVehicle {
  const index = Math.max(0, WAREHOUSE_VEHICLE_IDS.indexOf(id as ItemId)) % BAY_TILE_COLUMNS.length;
  return { mapKey: BAY_MAP, x: BAY_TILE_COLUMNS[index] * TILE + TILE, y: BAY_TILE_ROW * TILE + TILE - 2, facing: 'down' };
}
