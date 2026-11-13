import type { Direction } from '../systems/movement';
import { MapScene } from './MapScene';

export class TownScene extends MapScene {
  constructor() {
    super('Town');
  }

  protected override defaultFacing(): Direction {
    return 'right';
  }
}
