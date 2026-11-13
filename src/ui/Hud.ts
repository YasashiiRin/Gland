import Phaser from 'phaser';

const TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
  fontSize: '18px',
  color: '#fff6e0',
};

/** Small on-screen labels: current location (top-left) and controls hint (bottom). */
export class Hud {
  private readonly location: Phaser.GameObjects.Text;
  private readonly locationBg: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene) {
    this.locationBg = scene.add.rectangle(12, 12, 10, 34, 0x3a2f24, 0.85).setOrigin(0, 0).setStrokeStyle(2, 0xc9a66b);
    this.location = scene.add.text(24, 19, '', TEXT_STYLE);

    const hint = 'WASD / phím mũi tên: đi lại    Giữ Shift: chạy';
    const { width, height } = scene.scale;
    scene.add
      .text(width / 2, height - 14, hint, { ...TEXT_STYLE, fontSize: '15px', color: '#f0e6d0' })
      .setOrigin(0.5, 1)
      .setShadow(1, 1, '#000000', 2, false, true)
      .setAlpha(0.85);
  }

  setLocation(name: string): void {
    this.location.setText(name);
    this.locationBg.setSize(this.location.width + 24, 34);
  }
}
