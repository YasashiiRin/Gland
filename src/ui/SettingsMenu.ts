import Phaser from 'phaser';

const PANEL_W = 320;
const PANEL_H = 220;
const BAR_W = 200;

/** A small settings overlay: master volume, mute, fullscreen. Opened with Tab. */
export class SettingsMenu {
  private readonly root: Phaser.GameObjects.Container;
  private readonly volumeFill: Phaser.GameObjects.Rectangle;
  private readonly volumeLabel: Phaser.GameObjects.Text;
  private readonly muteButton: Phaser.GameObjects.Rectangle;
  private readonly muteText: Phaser.GameObjects.Text;
  private onVolumeChange?: (ratio: number) => void;
  private onToggleMute?: () => void;
  private onToggleFullscreen?: () => void;

  constructor(scene: Phaser.Scene, depth: number) {
    const cx = scene.scale.width / 2;
    const cy = scene.scale.height / 2;
    const top = cy - PANEL_H / 2;

    this.root = scene.add.container(0, 0).setDepth(depth).setVisible(false);
    const panel = scene.add.rectangle(cx, cy, PANEL_W, PANEL_H, 0x241d17, 0.96).setStrokeStyle(2, 0xc9a66b);
    const title = scene.add
      .text(cx, top + 22, 'Cài đặt (Tab để đóng)', { fontFamily: 'sans-serif', fontSize: '17px', color: '#fff6e0' })
      .setOrigin(0.5);
    this.root.add([panel, title]);

    const barY = top + 70;
    const barX = cx - BAR_W / 2;
    scene.add.text(cx, barY - 18, 'Âm lượng', { fontFamily: 'sans-serif', fontSize: '13px', color: '#d8c8a8' }).setOrigin(0.5);
    const barBg = scene.add.rectangle(barX, barY, BAR_W, 16, 0x1c1814, 0.9).setOrigin(0, 0.5).setStrokeStyle(1, 0x6b5a46);
    barBg.setInteractive({ useHandCursor: true });
    barBg.on('pointerdown', (p: Phaser.Input.Pointer) => {
      const ratio = Phaser.Math.Clamp((p.x - barX) / BAR_W, 0, 1);
      this.onVolumeChange?.(ratio);
    });
    this.volumeFill = scene.add.rectangle(barX + 2, barY, 0, 12, 0x6fcf6f).setOrigin(0, 0.5);
    this.volumeLabel = scene.add.text(cx, barY + 20, '', { fontFamily: 'sans-serif', fontSize: '12px', color: '#fff6e0' }).setOrigin(0.5);
    this.root.add([barBg, this.volumeFill, this.volumeLabel]);

    this.muteButton = scene.add
      .rectangle(cx, top + 130, 160, 34, 0x3a2f24, 0.9)
      .setStrokeStyle(2, 0xc9a66b)
      .setInteractive({ useHandCursor: true });
    this.muteText = scene.add.text(cx, top + 130, '', { fontFamily: 'sans-serif', fontSize: '14px', color: '#fff6e0' }).setOrigin(0.5);
    this.muteButton.on('pointerdown', () => this.onToggleMute?.());
    this.root.add([this.muteButton, this.muteText]);

    const fsButton = scene.add
      .rectangle(cx, top + 175, 160, 34, 0x3a2f24, 0.9)
      .setStrokeStyle(2, 0xc9a66b)
      .setInteractive({ useHandCursor: true });
    const fsText = scene.add
      .text(cx, top + 175, 'Toàn màn hình', { fontFamily: 'sans-serif', fontSize: '14px', color: '#fff6e0' })
      .setOrigin(0.5);
    fsButton.on('pointerdown', () => this.onToggleFullscreen?.());
    this.root.add([fsButton, fsText]);
  }

  bind(onVolumeChange: (ratio: number) => void, onToggleMute: () => void, onToggleFullscreen: () => void): void {
    this.onVolumeChange = onVolumeChange;
    this.onToggleMute = onToggleMute;
    this.onToggleFullscreen = onToggleFullscreen;
  }

  refresh(volume: number, muted: boolean): void {
    this.volumeFill.width = (BAR_W - 4) * volume;
    this.volumeLabel.setText(`${Math.round(volume * 100)}%`);
    this.muteText.setText(muted ? 'Đã tắt tiếng (bấm để bật)' : 'Đang bật tiếng (bấm để tắt)');
  }

  open(volume: number, muted: boolean): void {
    this.refresh(volume, muted);
    this.root.setVisible(true);
  }

  close(): void {
    this.root.setVisible(false);
  }

  get isOpen(): boolean {
    return this.root.visible;
  }
}
