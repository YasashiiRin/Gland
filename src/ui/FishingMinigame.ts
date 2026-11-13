import Phaser from 'phaser';
import { BAR_HEIGHT } from '../systems/FishingSystem';
import type { FishingState } from '../systems/FishingSystem';

const TRACK_W = 60;
const TRACK_H = 300;

/** The vertical "reel it in" minigame: a moving fish zone and a player-controlled catch bar. */
export class FishingMinigame {
  private readonly root: Phaser.GameObjects.Container;
  private readonly zone: Phaser.GameObjects.Rectangle;
  private readonly bar: Phaser.GameObjects.Rectangle;
  private readonly progressFill: Phaser.GameObjects.Rectangle;
  private readonly trackTop: number;

  constructor(scene: Phaser.Scene, depth: number) {
    const cx = scene.scale.width / 2;
    const cy = scene.scale.height / 2;
    this.trackTop = cy - TRACK_H / 2;

    this.root = scene.add.container(0, 0).setDepth(depth).setVisible(false);
    const panelBg = scene.add
      .rectangle(cx, cy, TRACK_W + 24, TRACK_H + 24, 0x1c3a52, 0.9)
      .setStrokeStyle(2, 0x9bb8d9);
    const track = scene.add
      .rectangle(cx, cy, TRACK_W, TRACK_H, 0x0d2233, 0.95)
      .setStrokeStyle(1, 0x4a6a86);

    this.zone = scene.add.rectangle(cx, cy, TRACK_W - 6, 40, 0xffe066, 0.55).setOrigin(0.5, 0.5);
    this.bar = scene.add.rectangle(cx, cy, TRACK_W - 14, 10, 0x6fcf6f, 0.9).setOrigin(0.5, 0);

    const barTrackX = cx + TRACK_W / 2 + 26;
    scene.add.rectangle(barTrackX, cy, 14, TRACK_H, 0x1c1814, 0.9).setStrokeStyle(1, 0x6b5a46);
    this.progressFill = scene.add.rectangle(barTrackX, cy + TRACK_H / 2, 10, 0, 0x6fcf6f).setOrigin(0.5, 1);

    const hint = scene.add
      .text(cx, cy + TRACK_H / 2 + 26, 'Giữ Space để kéo lên', {
        fontFamily: 'sans-serif',
        fontSize: '13px',
        color: '#e8f0f6',
      })
      .setOrigin(0.5);

    this.root.add([panelBg, track, this.zone, this.bar, this.progressFill, hint]);
  }

  open(): void {
    this.root.setVisible(true);
  }

  close(): void {
    this.root.setVisible(false);
  }

  refresh(state: FishingState): void {
    this.zone.y = this.trackTop + state.zoneY * TRACK_H;
    this.bar.y = this.trackTop + state.barY * TRACK_H;
    this.bar.height = BAR_HEIGHT * TRACK_H;
    this.progressFill.height = state.progress * TRACK_H;
  }
}
