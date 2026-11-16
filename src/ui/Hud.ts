import Phaser from 'phaser';
import { DAY_LENGTH_MINUTES, SEASON_LABELS, WEATHER_LABELS } from '../config/time';
import type { EnergyState } from '../systems/EnergySystem';
import type { TimeState } from '../systems/TimeSystem';
import { clockLabel } from '../systems/TimeSystem';
import { UI_COLORS, UI_FONT } from './uiStyle';

const MARGIN = 10;
const DIAL_R = 22;
const BAR_W = 8;
const BAR_H = 76;

const WEEKDAYS = ['T.2', 'T.3', 'T.4', 'T.5', 'T.6', 'T.7', 'CN'];

/**
 * Compact HUD:
 * - top-right: one round day/night dial (sun by day, moon at night) with the
 *   clock and money in small pills below; hover the dial for date/weather;
 *   a gear button beside it opens the settings;
 * - bottom-right: two slim vertical bars (energy, health), hover for numbers.
 */
export class Hud {
  private readonly container: Phaser.GameObjects.Container;
  private readonly dial: Phaser.GameObjects.Graphics;
  private readonly dialCenter: { x: number; y: number };
  private readonly timeText: Phaser.GameObjects.Text;
  private readonly moneyText: Phaser.GameObjects.Text;
  private readonly tip: Phaser.GameObjects.Text;
  private readonly energyFill: Phaser.GameObjects.Rectangle;
  private readonly healthFill: Phaser.GameObjects.Rectangle;
  private time?: TimeState;
  private energy: EnergyState = { current: 0, max: 0 };
  private health: EnergyState = { current: 0, max: 0 };
  /** Called when the on-screen gear button is clicked. */
  onSettings?: () => void;

  constructor(scene: Phaser.Scene, depth: number) {
    const { width, height } = scene.scale;
    this.container = scene.add.container(0, 0).setDepth(depth);

    // --- Day/night dial + clock + money (top-right) ---
    this.dialCenter = { x: width - MARGIN - 34, y: MARGIN + DIAL_R + 2 };
    this.dial = scene.add.graphics();
    this.timeText = this.pill(scene, this.dialCenter.x, this.dialCenter.y + DIAL_R + 12, 15);
    this.moneyText = this.pill(scene, this.dialCenter.x, this.dialCenter.y + DIAL_R + 36, 13, UI_COLORS.gold);
    this.container.add([this.dial, this.timeText, this.moneyText]);
    const dialZone = scene.add
      .zone(this.dialCenter.x, this.dialCenter.y, DIAL_R * 2, DIAL_R * 2)
      .setInteractive();
    dialZone.on('pointerover', () => this.showTip(this.dateLine(), this.dialCenter.x - DIAL_R - 6, this.dialCenter.y));
    dialZone.on('pointerout', () => this.tip.setVisible(false));
    this.container.add(dialZone);

    // --- Gear button (opens settings) ---
    const gx = this.dialCenter.x - DIAL_R - 22;
    const gy = MARGIN + 14;
    const gear = scene.add.circle(gx, gy, 13, UI_COLORS.wood).setStrokeStyle(2, UI_COLORS.edge);
    const gearIcon = scene.add.text(gx, gy, '⚙', { fontFamily: UI_FONT, fontSize: '17px', color: '#fff2d0' }).setOrigin(0.5);
    gear.setInteractive({ useHandCursor: true });
    gear.on('pointerdown', () => this.onSettings?.());
    gear.on('pointerover', () => gear.setFillStyle(UI_COLORS.woodLight));
    gear.on('pointerout', () => gear.setFillStyle(UI_COLORS.wood));
    this.container.add([gear, gearIcon]);

    // --- Slim energy / health bars (bottom-right) ---
    const bx = width - MARGIN - BAR_W;
    const by = height - MARGIN - BAR_H;
    this.energyFill = this.slimBar(scene, bx, by, 0x7ccf5a, () => `Năng lượng ${Math.round(this.energy.current)}/${this.energy.max}`);
    this.healthFill = this.slimBar(scene, bx - BAR_W - 6, by, 0xe0604f, () => `Máu ${Math.round(this.health.current)}/${this.health.max}`);

    this.tip = scene.add
      .text(0, 0, '', { fontFamily: UI_FONT, fontSize: '12px', color: '#fff6e0', backgroundColor: '#2b1a10dd' })
      .setPadding(5, 3, 5, 3)
      .setOrigin(1, 0.5)
      .setVisible(false);
    this.container.add(this.tip);
  }

  private pill(scene: Phaser.Scene, x: number, y: number, size: number, color: string = UI_COLORS.ink): Phaser.GameObjects.Text {
    return scene.add
      .text(x, y, '', { fontFamily: UI_FONT, fontSize: `${size}px`, color, fontStyle: 'bold', backgroundColor: '#f1ddb0' })
      .setPadding(6, 1, 6, 1)
      .setOrigin(0.5);
  }

  private slimBar(scene: Phaser.Scene, x: number, y: number, color: number, tip: () => string): Phaser.GameObjects.Rectangle {
    const frame = scene.add.rectangle(x - 2, y - 2, BAR_W + 4, BAR_H + 4, UI_COLORS.edge, 0.85).setOrigin(0, 0);
    const fill = scene.add.rectangle(x, y + BAR_H, BAR_W, BAR_H, color).setOrigin(0, 1);
    frame.setInteractive();
    frame.on('pointerover', () => this.showTip(tip(), x - 6, y + BAR_H / 2));
    frame.on('pointerout', () => this.tip.setVisible(false));
    this.container.add([frame, fill]);
    return fill;
  }

  private showTip(text: string, x: number, y: number): void {
    this.tip.setText(text).setPosition(x, y).setVisible(true);
  }

  private dateLine(): string {
    const t = this.time;
    if (!t) return '';
    return `${WEEKDAYS[(t.day - 1) % 7]}, ngày ${t.day} mùa ${SEASON_LABELS[t.season]}, năm ${t.year} · ${WEATHER_LABELS[t.weather]}`;
  }

  /** Kept for compatibility: the location name is shown under the minimap. */
  setLocation(_name: string): void {}

  setTime(time: TimeState): void {
    this.time = time;
    this.timeText.setText(clockLabel(time));
    this.drawDial(Math.min(1, time.elapsedMinutes / DAY_LENGTH_MINUTES), time.weather === 'rainy');
  }

  /** Sky color follows the day; the sun (then the moon) travels over an arc. */
  private drawDial(t: number, rainy: boolean): void {
    const { x, y } = this.dialCenter;
    const sky = t < 0.55 ? 0x8cc4e0 : t < 0.7 ? 0xe8a060 : 0x2c3560;
    const g = this.dial.clear();
    g.fillStyle(UI_COLORS.edge, 1).fillCircle(x, y, DIAL_R + 2);
    g.fillStyle(rainy && t < 0.7 ? 0x8a9aa8 : sky, 1).fillCircle(x, y, DIAL_R);
    g.fillStyle(0x6a9a4c, 1).slice(x, y, DIAL_R, 0, Math.PI, false).fillPath(); // ground
    const night = t >= 0.7;
    const phase = night ? (t - 0.7) / 0.3 : t / 0.7;
    const angle = Math.PI + phase * Math.PI;
    const bx = x + Math.cos(angle) * (DIAL_R - 7);
    const by = y + Math.sin(angle) * (DIAL_R - 7) + 2;
    if (night) {
      g.fillStyle(0xf2ecc8, 1).fillCircle(bx, by, 5);
      g.fillStyle(0x2c3560, 1).fillCircle(bx + 2, by - 1, 4);
    } else {
      g.fillStyle(0xffd860, 1).fillCircle(bx, by, 5);
      g.lineStyle(1, 0xffe9a0, 1).strokeCircle(bx, by, 7);
    }
    g.lineStyle(2, UI_COLORS.edge, 1).strokeCircle(x, y, DIAL_R + 1);
  }

  setEnergy(energy: EnergyState): void {
    this.energy = energy;
    const ratio = energy.max > 0 ? energy.current / energy.max : 0;
    this.energyFill.height = Math.max(0, BAR_H * ratio);
    this.energyFill.setFillStyle(ratio > 0.3 ? 0x7ccf5a : ratio > 0.12 ? 0xe0b040 : 0xe0604f);
  }

  setHealth(health: EnergyState): void {
    this.health = health;
    const ratio = health.max > 0 ? health.current / health.max : 0;
    this.healthFill.height = Math.max(0, BAR_H * ratio);
  }

  setMoney(amount: number): void {
    this.moneyText.setText(`${amount.toLocaleString('vi-VN')} ₫`);
  }
}
