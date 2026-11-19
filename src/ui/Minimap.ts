import Phaser from 'phaser';
import type { MinimapData } from '../systems/MinimapSystem';
import { inkText, UI_COLORS } from './uiStyle';
import { hasSkin, SKIN } from './uiSkin';

const MARGIN = 10;
const MAX_W = 96;
const MAX_H = 72;
const PAD = 4;
const TEXTURE_KEY = 'minimap';
/** The painted frame: its corner size, and how far its wood reaches out round the map. */
const FRAME_CORNER = 14;
const FRAME_INSET = 7;

/**
 * Small overview of the current map in the top-left corner, with a blinking
 * dot for the player and the area name underneath. Toggled with M; a click
 * opens the world map.
 */
export class Minimap {
  private readonly container: Phaser.GameObjects.Container;
  private readonly frame: Phaser.GameObjects.Graphics;
  private readonly image: Phaser.GameObjects.Image;
  private readonly dot: Phaser.GameObjects.Rectangle;
  /** A little house where the player's own home is. */
  private readonly home: Phaser.GameObjects.Graphics;
  /** The painted wooden frame round the map, when the UI skin is there. */
  private readonly woodFrame: Phaser.GameObjects.NineSlice | null;
  private readonly label: Phaser.GameObjects.Text;
  private scale = 1;
  private hasMap = false;
  private hidden = false;
  /** Clicking the minimap (or its name plate) opens the world map. */
  onClick?: () => void;

  constructor(private readonly scene: Phaser.Scene, depth: number) {
    this.container = scene.add.container(MARGIN, MARGIN).setDepth(depth);
    this.frame = scene.add.graphics();
    this.image = scene.add.image(PAD, PAD, '__DEFAULT').setOrigin(0, 0);
    this.dot = scene.add.rectangle(0, 0, 3, 3, 0xe8402a).setStrokeStyle(1, 0xffffff);
    this.label = inkText(scene, 0, 0, '', 11).setOrigin(0.5, 0.5);
    this.home = scene.add.graphics().setVisible(false);
    // Drawn round (0, 0): a white-edged roof over a wall, readable on any ground colour.
    this.home.fillStyle(0xffffff, 1).fillTriangle(-5, -1, 0, -6, 5, -1).fillRect(-4, -1, 8, 6);
    this.home.fillStyle(0xd9822b, 1).fillTriangle(-4, -1, 0, -5, 4, -1);
    this.home.fillStyle(0xf4e4c1, 1).fillRect(-3, -1, 6, 5);
    this.home.fillStyle(0x6b3e1f, 1).fillRect(-1, 1, 2, 3);
    this.woodFrame = hasSkin(scene, SKIN.minimapFrame)
      ? scene.add.nineslice(0, 0, SKIN.minimapFrame, undefined, 112, 112, FRAME_CORNER, FRAME_CORNER, FRAME_CORNER, FRAME_CORNER).setOrigin(0, 0)
      : null;
    this.container.add([this.frame, this.image, ...(this.woodFrame ? [this.woodFrame] : []), this.home, this.dot, this.label]);
    scene.tweens.add({ targets: this.dot, alpha: 0.35, duration: 450, yoyo: true, repeat: -1 });
    for (const target of [this.image, this.label]) {
      target.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.onClick?.());
    }
  }

  /** Redraws the overview for a newly entered map, or hides it (no data, e.g. in the mine). */
  setMap(data: MinimapData | undefined, name: string): void {
    this.hasMap = !!data;
    if (data) {
      // Small maps are drawn several pixels per tile; big ones are drawn 1:1 and shrunk to fit.
      const fit = Math.min(MAX_W / data.width, MAX_H / data.height);
      this.scale = fit >= 1 ? Math.floor(fit) : fit;
      const px = Math.max(1, Math.floor(this.scale));
      const w = Math.round(data.width * this.scale);
      const h = Math.round(data.height * this.scale);
      if (this.scene.textures.exists(TEXTURE_KEY)) this.scene.textures.remove(TEXTURE_KEY);
      const canvas = this.scene.textures.createCanvas(TEXTURE_KEY, data.width * px, data.height * px);
      const ctx = canvas?.getContext();
      if (canvas && ctx) {
        data.colors.forEach((color, i) => {
          ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
          ctx.fillRect((i % data.width) * px, Math.floor(i / data.width) * px, px, px);
        });
        canvas.refresh();
        this.image.setTexture(TEXTURE_KEY).setScale(this.scale / px);
        // The click area was sized for the old texture: make it match the new picture.
        const hit: unknown = this.image.input?.hitArea;
        if (hit instanceof Phaser.Geom.Rectangle) hit.setSize(data.width * px, data.height * px);
      }
      this.frame.clear();
      if (this.woodFrame) {
        // The wood frame hugs the map; the name sits on a plate below it.
        this.woodFrame.setPosition(PAD - FRAME_INSET, PAD - FRAME_INSET).setSize(w + FRAME_INSET * 2, h + FRAME_INSET * 2).setVisible(true);
        const plateY = h + PAD + FRAME_INSET + 1;
        this.frame.fillStyle(UI_COLORS.edge, 0.9).fillRoundedRect(PAD - 2, plateY, w + 4, 15, 3);
        this.frame.fillStyle(UI_COLORS.parchment, 1).fillRoundedRect(PAD, plateY + 2, w, 11, 2);
        this.label.setPosition(PAD + w / 2, plateY + 8);
      } else {
        this.frame.fillStyle(UI_COLORS.edge, 0.9).fillRoundedRect(0, 0, w + PAD * 2, h + PAD * 2 + 15, 4);
        this.frame.fillStyle(UI_COLORS.parchment, 1).fillRoundedRect(PAD, h + PAD + 2, w, 12, 2);
        this.label.setPosition(PAD + w / 2, h + PAD + 8);
      }
    } else {
      // No overview (mine): just a small name plate.
      this.woodFrame?.setVisible(false);
      this.frame.clear();
      this.frame.fillStyle(UI_COLORS.edge, 0.9).fillRoundedRect(0, 0, 110, 20, 4);
      this.frame.fillStyle(UI_COLORS.parchment, 1).fillRoundedRect(3, 3, 104, 14, 3);
      this.label.setPosition(55, 10);
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

  /** The player's own house on this map (-1: none here). */
  setHomeTile(x: number, y: number): void {
    const show = this.hasMap && x >= 0;
    if (this.home.visible !== show) this.home.setVisible(show);
    if (show) this.home.setPosition(PAD + (x + 0.5) * this.scale, PAD + (y + 0.5) * this.scale);
  }

  toggle(): void {
    this.hidden = !this.hidden;
    this.container.setVisible(!this.hidden);
  }
}
