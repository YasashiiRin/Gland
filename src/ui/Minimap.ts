import Phaser from 'phaser';
import type { MinimapData } from '../systems/MinimapSystem';
import { drawWoodPanel, inkText, UI_COLORS } from './uiStyle';

const MARGIN = 12;
const MAX_W = 150;
const MAX_H = 112;
const PAD = 8;
const TEXTURE_KEY = 'minimap';

/**
 * Small overview of the current map in the top-left corner, with a blinking
 * dot for the player and the area name underneath. Toggled with M.
 */
export class Minimap {
  private readonly container: Phaser.GameObjects.Container;
  private readonly frame: Phaser.GameObjects.Graphics;
  private readonly image: Phaser.GameObjects.Image;
  private readonly dot: Phaser.GameObjects.Rectangle;
  private readonly label: Phaser.GameObjects.Text;
  private scale = 1;
  private hasMap = false;
  private hidden = false;

  constructor(private readonly scene: Phaser.Scene, depth: number) {
    this.container = scene.add.container(MARGIN, MARGIN).setDepth(depth);
    this.frame = scene.add.graphics();
    this.image = scene.add.image(PAD, PAD, '__DEFAULT').setOrigin(0, 0);
    this.dot = scene.add.rectangle(0, 0, 4, 4, 0xe8402a).setStrokeStyle(1, 0xffffff);
    this.label = inkText(scene, 0, 0, '', 14).setOrigin(0.5, 0.5);
    this.container.add([this.frame, this.image, this.dot, this.label]);
    scene.tweens.add({ targets: this.dot, alpha: 0.35, duration: 450, yoyo: true, repeat: -1 });
  }

  /** Redraws the overview for a newly entered map, or hides it (no data, e.g. in the mine). */
  setMap(data: MinimapData | undefined, name: string): void {
    this.hasMap = !!data;
    if (data) {
      this.scale = Math.max(1, Math.floor(Math.min(MAX_W / data.width, MAX_H / data.height)));
      const w = data.width * this.scale;
      const h = data.height * this.scale;
      if (this.scene.textures.exists(TEXTURE_KEY)) this.scene.textures.remove(TEXTURE_KEY);
      const canvas = this.scene.textures.createCanvas(TEXTURE_KEY, w, h);
      const ctx = canvas?.getContext();
      if (canvas && ctx) {
        data.colors.forEach((color, i) => {
          ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
          ctx.fillRect((i % data.width) * this.scale, Math.floor(i / data.width) * this.scale, this.scale, this.scale);
        });
        canvas.refresh();
        this.image.setTexture(TEXTURE_KEY);
      }
      this.frame.clear();
      drawWoodPanel(this.frame, 0, 0, w + PAD * 2, h + PAD * 2 + 22, false);
      this.frame.fillStyle(UI_COLORS.edge, 1).fillRect(PAD - 1, PAD - 1, w + 2, h + 2);
      this.frame.fillStyle(UI_COLORS.parchment, 1).fillRoundedRect(PAD, h + PAD + 3, w, 18, 3);
      this.label.setPosition(PAD + w / 2, h + PAD + 12);
    } else {
      // No overview (mine): just a small name plate.
      this.frame.clear();
      drawWoodPanel(this.frame, 0, 0, 150, 34);
      this.label.setPosition(75, 17);
    }
    this.label.setText(name);
    this.image.setVisible(this.hasMap);
    this.dot.setVisible(this.hasMap);
    this.container.setVisible(!this.hidden);
  }

  setPlayerTile(x: number, y: number): void {
    if (!this.hasMap) return;
    this.dot.setPosition(PAD + (x + 0.5) * this.scale, PAD + (y + 0.5) * this.scale);
  }

  toggle(): void {
    this.hidden = !this.hidden;
    this.container.setVisible(!this.hidden);
  }
}
