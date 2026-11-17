import Phaser from 'phaser';
import { FISH_SIZE, type FishingState } from '../systems/FishingSystem';

const TRACK_W = 44;
const TRACK_H = 300;

/**
 * Draws the fishing UI: the "waiting for a bite" bobber, the "!" strike
 * prompt, and the reel-in track (fish icon, green catch bar, treasure chest,
 * progress meter and a "perfect" star).
 */
export class FishingMinigame {
  private readonly root: Phaser.GameObjects.Container;
  private readonly reel: Phaser.GameObjects.Container;
  private readonly fish: Phaser.GameObjects.Image;
  private readonly bar: Phaser.GameObjects.Rectangle;
  private readonly chest: Phaser.GameObjects.Rectangle;
  private readonly chestFill: Phaser.GameObjects.Rectangle;
  private readonly progressFill: Phaser.GameObjects.Rectangle;
  private readonly star: Phaser.GameObjects.Text;
  private readonly prompt: Phaser.GameObjects.Text;
  private readonly bobber: Phaser.GameObjects.Arc;
  private readonly trackTop: number;
  private readonly cy: number;

  constructor(private readonly scene: Phaser.Scene, depth: number) {
    const cx = scene.scale.width / 2 + 120;
    this.cy = scene.scale.height / 2;
    this.trackTop = this.cy - TRACK_H / 2;
    this.root = scene.add.container(0, 0).setDepth(depth).setVisible(false);

    this.prompt = scene.add
      .text(scene.scale.width / 2, this.cy - 120, '', {
        fontFamily: 'sans-serif',
        fontSize: '18px',
        color: '#fff6e0',
        stroke: '#2a201c',
        strokeThickness: 4,
        align: 'center',
      })
      .setOrigin(0.5);
    this.bobber = scene.add.circle(scene.scale.width / 2, this.cy - 80, 6, 0xe53935).setStrokeStyle(2, 0xffffff);

    this.reel = scene.add.container(0, 0);
    const frame = scene.add.rectangle(cx, this.cy, TRACK_W + 52, TRACK_H + 24, 0x6b4a2e, 0.97).setStrokeStyle(3, 0x2a201c);
    const water = scene.add.rectangle(cx - 10, this.cy, TRACK_W, TRACK_H, 0x2a7fb0, 1).setStrokeStyle(2, 0x2a201c);
    const deep = scene.add.rectangle(cx - 10, this.cy + TRACK_H / 4, TRACK_W, TRACK_H / 2, 0x1f6390, 0.6);
    this.bar = scene.add.rectangle(cx - 10, this.cy, TRACK_W - 6, 40, 0x7ddc6a, 0.75).setOrigin(0.5, 0).setStrokeStyle(2, 0xd8ffc8);
    this.chest = scene.add.rectangle(cx - 10, this.cy, 14, 11, 0xd9a441).setStrokeStyle(2, 0x5a3a1a);
    this.chestFill = scene.add.rectangle(cx - 18, this.cy, 2, 0, 0xfff07a).setOrigin(0.5, 1);
    this.fish = scene.add.image(cx - 10, this.cy, '__DEFAULT').setScale(1.6);
    const meterBg = scene.add.rectangle(cx + TRACK_W / 2 + 6, this.cy, 10, TRACK_H, 0x1c1814).setStrokeStyle(1, 0x2a201c);
    this.progressFill = scene.add.rectangle(cx + TRACK_W / 2 + 6, this.cy + TRACK_H / 2, 8, 0, 0x7ddc6a).setOrigin(0.5, 1);
    this.star = scene.add.text(cx, this.trackTop - 28, '★ hoàn hảo', { fontFamily: 'sans-serif', fontSize: '12px', color: '#ffe066' }).setOrigin(0.5);
    const hint = scene.add
      .text(cx, this.cy + TRACK_H / 2 + 26, 'Giữ Space / chuột để kéo lên', { fontFamily: 'sans-serif', fontSize: '12px', color: '#e8f0f6' })
      .setOrigin(0.5);
    this.reel.add([frame, water, deep, this.chest, this.chestFill, this.bar, this.fish, meterBg, this.progressFill, this.star, hint]);
    this.root.add([this.reel, this.prompt, this.bobber]);
  }

  /** Waiting for a bite: a bobbing float and a hint. */
  showWaiting(time: number): void {
    this.root.setVisible(true);
    this.reel.setVisible(false);
    this.bobber.setVisible(true).setFillStyle(0xe53935);
    this.bobber.y = this.cy - 80 + Math.sin(time / 300) * 2;
    this.prompt.setText('Đang chờ cá cắn câu…\n(bấm Space lúc thấy "!" để giật cần)').setColor('#fff6e0');
  }

  /** A fish is nibbling: strike now! */
  showBite(time: number): void {
    this.root.setVisible(true);
    this.reel.setVisible(false);
    this.bobber.setVisible(true).setFillStyle(0xffffff);
    this.bobber.y = this.cy - 76 + Math.sin(time / 40) * 4;
    this.prompt.setText('!  GIẬT CẦN  !').setColor('#ffe066');
  }

  showReel(fishIcon: string, state: FishingState): void {
    this.root.setVisible(true);
    this.reel.setVisible(true);
    this.bobber.setVisible(false);
    this.prompt.setText('');
    if (this.scene.textures.exists(fishIcon) && this.fish.texture.key !== fishIcon) this.fish.setTexture(fishIcon);
    this.fish.y = this.trackTop + state.fishY * TRACK_H;
    this.fish.setAngle(Math.max(-30, Math.min(30, state.fishVelocity * 40)));
    this.bar.y = this.trackTop + state.barY * TRACK_H;
    this.bar.height = state.barHeight * TRACK_H;
    this.bar.setFillStyle(this.bar.y < this.fish.y + (FISH_SIZE * TRACK_H) / 2 && this.bar.y + this.bar.height > this.fish.y - (FISH_SIZE * TRACK_H) / 2 ? 0x7ddc6a : 0x9fb48a, 0.75);
    this.progressFill.height = state.progress * TRACK_H;
    this.progressFill.setFillStyle(state.progress < 0.25 ? 0xe5533d : state.progress < 0.6 ? 0xe8c040 : 0x7ddc6a);
    const hasChest = state.treasureY !== null;
    this.chest.setVisible(hasChest);
    this.chestFill.setVisible(hasChest);
    if (state.treasureY !== null) {
      this.chest.y = this.trackTop + state.treasureY * TRACK_H;
      this.chestFill.y = this.chest.y + 6;
      this.chestFill.height = state.treasureProgress * 12;
    }
    this.star.setVisible(state.perfect);
  }

  close(): void {
    this.root.setVisible(false);
  }
}
