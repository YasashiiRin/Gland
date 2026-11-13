import Phaser from 'phaser';
import { SEASON_LABELS, WEATHER_LABELS } from '../config/time';
import type { EnergyState } from '../systems/EnergySystem';
import type { TimeState } from '../systems/TimeSystem';
import { clockLabel } from '../systems/TimeSystem';

const TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
  fontSize: '18px',
  color: '#fff6e0',
};

const WEATHER_ICON: Record<string, string> = { sunny: '☀', rainy: '🌧' };

const PANEL_X = 12;
const PANEL_Y = 12;
const PANEL_W = 190;
const ENERGY_BAR_W = 150;

/**
 * Two grouped panels: player status (top-left: location, energy, money) and
 * the clock (top-right). Kept as two tidy boxes rather than scattered pieces.
 */
export class Hud {
  private readonly location: Phaser.GameObjects.Text;
  private readonly energyFill: Phaser.GameObjects.Rectangle;
  private readonly energyLabel: Phaser.GameObjects.Text;
  private readonly moneyText: Phaser.GameObjects.Text;
  private readonly clock: Phaser.GameObjects.Text;
  private readonly clockBg: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene) {
    // --- Status panel (top-left): location / energy / money, one box. ---
    scene.add
      .rectangle(PANEL_X, PANEL_Y, PANEL_W, 104, 0x2a2420, 0.88)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xc9a66b);

    const pad = 14;
    this.location = scene.add.text(PANEL_X + pad, PANEL_Y + 10, '', { ...TEXT_STYLE, fontSize: '17px' });

    const barY = PANEL_Y + 44;
    scene.add
      .rectangle(PANEL_X + pad, barY, ENERGY_BAR_W, 16, 0x1c1814, 0.9)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x6b5a46);
    this.energyFill = scene.add.rectangle(PANEL_X + pad + 2, barY + 2, ENERGY_BAR_W - 4, 12, 0x6fcf6f).setOrigin(0, 0);
    this.energyLabel = scene.add
      .text(PANEL_X + pad + ENERGY_BAR_W / 2, barY + 8, '', { ...TEXT_STYLE, fontSize: '11px' })
      .setOrigin(0.5);

    this.moneyText = scene.add.text(PANEL_X + pad, PANEL_Y + 72, '', { ...TEXT_STYLE, fontSize: '18px', color: '#ffe9a8' });

    // --- Clock panel (top-right): time, weather, date — one box. ---
    const { width } = scene.scale;
    this.clockBg = scene.add
      .rectangle(width - PANEL_X, PANEL_Y, 10, 54, 0x24304a, 0.88)
      .setOrigin(1, 0)
      .setStrokeStyle(2, 0x9bb8d9);
    this.clock = scene.add
      .text(width - PANEL_X - pad, PANEL_Y + 10, '', { ...TEXT_STYLE, fontSize: '16px', align: 'right' })
      .setOrigin(1, 0);

    const hint = 'WASD / phím mũi tên: đi lại    Giữ Shift: chạy    E: tương tác    I: túi đồ    Space: dùng đồ';
    scene.add
      .text(width / 2, scene.scale.height - 14, hint, { ...TEXT_STYLE, fontSize: '15px', color: '#f0e6d0' })
      .setOrigin(0.5, 1)
      .setShadow(1, 1, '#000000', 2, false, true)
      .setAlpha(0.85);
  }

  setLocation(name: string): void {
    this.location.setText(name);
  }

  setTime(time: TimeState): void {
    const icon = WEATHER_ICON[time.weather] ?? '';
    const text = `${clockLabel(time)}  ${icon} ${WEATHER_LABELS[time.weather]}\nNgày ${time.day} mùa ${SEASON_LABELS[time.season]}, năm ${time.year}`;
    this.clock.setText(text);
    this.clockBg.setSize(this.clock.width + 28, this.clock.height + 20);
  }

  setEnergy(energy: EnergyState): void {
    const ratio = energy.max > 0 ? energy.current / energy.max : 0;
    this.energyFill.width = Math.max(0, (ENERGY_BAR_W - 4) * ratio);
    this.energyFill.setFillStyle(ratio > 0.3 ? 0x6fcf6f : 0xe06a5a);
    this.energyLabel.setText(`${Math.round(energy.current)}/${energy.max}`);
  }

  setMoney(amount: number): void {
    this.moneyText.setText(`${amount.toLocaleString('vi-VN')} ₫`);
  }
}
