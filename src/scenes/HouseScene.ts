import type { Direction } from '../systems/movement';
import { MapScene } from './MapScene';

export class HouseScene extends MapScene {
  constructor() {
    super('House');
  }

  protected override defaultFacing(spawn?: string): Direction {
    return spawn === 'fromFarm' ? 'up' : 'down';
  }
}
