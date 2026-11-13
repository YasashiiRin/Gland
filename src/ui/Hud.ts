import Phaser from 'phaser';
import { SEASON_LABELS, WEATHER_LABELS } from '../config/time';
import type { TimeState } from '../systems/TimeSystem';
import { clockLabel } from '../systems/TimeSystem';

const TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
  fontSize: '18px',
  color: '#fff6e0',
};

const WEATHER_ICON: Record<string, string> = { sunny: '☀', rainy: '🌧' };

/** Small on-screen labels: location + clock (top-left) and controls hint (bottom). */
export class Hud {
  private readonly location: Phaser.GameObjects.Text;
  private readonly locationBg: Phaser.GameObjects.Rectangle;
  private readonly clock: Phaser.GameObjects.Text;
  private readonly clockBg: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene) {
    this.locationBg = scene.add.rectangle(12, 12, 10, 34, 0x3a2f24, 0.85).setOrigin(0, 0).setStrokeStyle(2, 0xc9a66b);
    this.location = scene.add.text(24, 19, '', TEXT_STYLE);

    const { width } = scene.scale;
    this.clockBg = scene.add
      .rectangle(width - 12, 12, 10, 34, 0x24304a, 0.85)
      .setOrigin(1, 0)
      .setStrokeStyle(2, 0x9bb8d9);
    this.clock = scene.add.text(width - 24, 19, '', { ...TEXT_STYLE, align: 'right' }).setOrigin(1, 0);

    const hint = 'WASD / phím mũi tên: đi lại    Giữ Shift: chạy    E: tương tác';
    scene.add
      .text(width / 2, scene.scale.height - 14, hint, { ...TEXT_STYLE, fontSize: '15px', color: '#f0e6d0' })
      .setOrigin(0.5, 1)
      .setShadow(1, 1, '#000000', 2, false, true)
      .setAlpha(0.85);
  }

  setLocation(name: string): void {
    this.location.setText(name);
    this.locationBg.setSize(this.location.width + 24, 34);
  }

  setTime(time: TimeState): void {
    const icon = WEATHER_ICON[time.weather] ?? '';
    const text = `${clockLabel(time)}   ${icon} ${WEATHER_LABELS[time.weather]}\nNgày ${time.day} mùa ${SEASON_LABELS[time.season]}, năm ${time.year}`;
    this.clock.setText(text);
    this.clockBg.setSize(this.clock.width + 24, this.clock.height + 14);
    this.clock.setY(12 + 7);
  }
}
