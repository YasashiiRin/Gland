import type Phaser from 'phaser';
import { TILE } from '../config/constants';
import { artScale } from './hd';
import type { Homestead } from './homesteads';

/**
 * A household's animals: a few chickens pecking about the yard by day, and a
 * buffalo or cow that stands by the haystack unless it is out grazing with
 * its minder (villagers.ts moves it then).
 */
export class HouseAnimals {
  private chickens: Phaser.GameObjects.Sprite[] = [];
  beast?: Phaser.GameObjects.Sprite;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly home: Homestead,
  ) {}

  /** Daytime: shows them; at the yard unless `grazing` says where the beast is. */
  update(time: number, daytime: boolean, grazing: { x: number; y: number; flip: boolean } | null): void {
    if (!daytime) return this.hide();
    const h = this.home;
    if (h.feature === 'chickens' && !this.chickens.length) {
      for (let i = 0; i < 4; i++) this.chickens.push(this.add('animal_chicken', 0.7));
    }
    this.chickens.forEach((c, i) => {
      const t = time / 1000 / (3 + i) + i * 2.1;
      const x = (h.x0 + 12 + Math.sin(t) * 3 + (i % 2) * 2) * TILE;
      const y = (h.y0 + 13 + Math.cos(t * 0.7) * 1.5 + (i > 1 ? 1 : 0)) * TILE;
      c.setPosition(x, y).setDepth(y).setFlipX(Math.cos(t) < 0).setFrame(Math.floor(time / 300 + i) % 2);
    });
    if (h.livestock && !this.beast) this.beast = this.add(`animal_${h.livestock}`, 1);
    if (this.beast) {
      const at = grazing ?? { x: (h.x0 + 16) * TILE, y: (h.y0 + 10) * TILE, flip: true };
      this.beast.setPosition(at.x, at.y).setDepth(at.y).setFlipX(at.flip).setFrame(grazing ? Math.floor(time / 600) % 2 : 0);
    }
  }

  hide(): void {
    this.chickens.forEach((c) => c.destroy());
    this.chickens = [];
    this.beast?.destroy();
    this.beast = undefined;
  }

  private add(key: string, size: number): Phaser.GameObjects.Sprite {
    const k = this.scene.textures.exists(key) ? artScale(this.scene, key) : 1;
    return this.scene.add.sprite(0, 0, key, 0).setOrigin(0.5, 1).setScale(size / k);
  }
}
