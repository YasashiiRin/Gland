import { ITEMS } from '../data/items';

/**
 * The watering can (pure, no Phaser): a full can waters `capacity` tiles
 * (items.json); once empty it must be refilled standing next to water.
 */
export const CAN_CAPACITY = ITEMS.watering_can.capacity ?? 15;

/** One watering: the can loses a measure; not possible when it is empty. */
export function pourWater(water: number): { water: number; poured: boolean } {
  if (water <= 0) return { water: 0, poured: false };
  return { water: water - 1, poured: true };
}

export function refillCan(): number {
  return CAN_CAPACITY;
}

/**
 * Can the player fill the can from here: the tile they aim at is water, or
 * water lies right next to where they stand (one tile, diagonals included).
 */
export function canFillFrom(target: { x: number; y: number }, stand: { x: number; y: number }, isWater: (x: number, y: number) => boolean): boolean {
  if (isWater(target.x, target.y)) return true;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) if (isWater(stand.x + dx, stand.y + dy)) return true;
  }
  return false;
}

/**
 * What a stroke of the can does: water the plot if it can be watered and
 * there is water left; otherwise fill up if water is at hand and the can is
 * not full; otherwise tell the player the can is empty (or nothing).
 */
export function canAction(water: number, plotNeedsWater: boolean, aimingAtWater: boolean, waterAtHand: boolean): 'water' | 'fill' | 'empty' | 'none' {
  if (aimingAtWater && water < CAN_CAPACITY) return 'fill';
  if (plotNeedsWater && water > 0) return 'water';
  if (waterAtHand && water < CAN_CAPACITY) return 'fill';
  if (plotNeedsWater) return 'empty';
  return 'none';
}
