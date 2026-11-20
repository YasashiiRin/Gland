import { TILE } from '../config/constants';
import { HOME_VEHICLE } from '../data/garage';
import { gameState } from '../state/GameState';
import { addVehicle, ownsVehicle } from '../systems/VehicleSystem';
import { yardSpot, type Homestead } from './homesteads';

/**
 * Every player owns a bicycle: the first time their home is on the map,
 * it's parked in the yard, just beside the gate.
 */
export function ensureHomeBicycle(mapKey: string, home: Homestead | undefined): void {
  if (!home || ownsVehicle(gameState.vehicles, HOME_VEHICLE)) return;
  const yard = yardSpot(home);
  gameState.vehicles = addVehicle(gameState.vehicles, HOME_VEHICLE, {
    mapKey,
    x: Math.round(yard.x + TILE * 1.5),
    y: Math.round(yard.y),
    facing: 'down',
  });
}
