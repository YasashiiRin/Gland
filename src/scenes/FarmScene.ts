import type { Direction } from '../systems/movement';
import { MapScene } from './MapScene';

export class FarmScene extends MapScene {
  constructor() {
    super('Farm');
  }

  protected override defaultFacing(spawn?: string): Direction {
    return spawn === 'fromTown' ? 'left' : 'down';
  }
}
