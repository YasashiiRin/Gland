import Phaser from 'phaser';
import { DAY_LENGTH_MINUTES, SEASON_LABELS, WEATHER_LABELS } from '../config/time';
import type { EnergyState } from '../systems/EnergySystem';
import type { TimeState } from '../systems/TimeSystem';
import { clockLabel } from '../systems/TimeSystem';
import { drawWoodPanel, inkText, UI_COLORS, UI_FONT } from './uiStyle';

const MARGIN = 12;
const CLOCK_W = 200;
const CLOCK_H = 92;
const MONEY_H = 34;
const BAR_W = 22;
const BAR_H = 150;

const WEEKDAYS = ['T.2', 'T.3', 'T.4', 'T.5', 'T.6', 'T.7', 'CN'];
const WEATHER_ICON: Record<string, string> = { sunny: '☀', rainy: '☂' };

/**
 * HUD laid out the way farming games usually do it:
 * - top-right: date, a day/night dial, clock, weather/season, with money below;
 * - bottom-right: vertical energy and health bars (hover for exact values);
 * - a short controls hint above the hotbar that fades out after a while.
 * The location name lives under the minimap (top-left, see Minimap).
 */
export class Hud {
  private readonly container: Phaser.GameObjects.Container;
  private readonly dateText: Phaser.GameObjects.Text;
  private readonly timeText: Phaser.GameObjects.Text;
  private readonly weatherText: Phaser.GameObjects.Text;
  private readonly moneyText: Phaser.GameObjects.Text;
  private readonly dialHand: Phaser.GameObjects.Graphics;
  private readonly dialCenter: { x: number; y: number };
  private readonly energyFill: Phaser.GameObjects.Rectangle;
  private readonly healthFill: Phaser.GameObjects.Rectangle;
  private readonly barTip: Phaser.GameObjects.Text;
  private energy: EnergyState = { current: 0, max: 0 };
  private health: EnergyState = { current: 0, max: 0 };

  constructor(scene: Phaser.Scene, depth: number) {
    const { width, height } = scene.scale;
    this.container = scene.add.container(0, 0).setDepth(depth);
    const g = scene.add.graphics();
    this.container.add(g);

    // --- Clock panel (top-right) ---
    const cx = width - MARGIN - CLOCK_W;
    const cy = MARGIN;
    drawWoodPanel(g, cx, cy, CLOCK_W, CLOCK_H);
    this.dialCenter = { x: cx + 42, y: cy + 62 };
    const { x: dx, y: dy } = this.dialCenter;
    g.fillStyle(UI_COLORS.edge, 1).slice(dx, dy, 31, Math.PI, 0, false).fillPath();
    g.fillStyle(0x8cc4e0, 1).slice(dx, dy, 29, Math.PI, Math.PI * 1.55, false).fillPath(); // morning sky
    g.fillStyle(0xe8a860, 1).slice(dx, dy, 29, Math.PI * 1.55, Math.PI * 1.8, false).fillPath(); // dusk
    g.fillStyle(0x2c3560, 1).slice(dx, dy, 29, Math.PI * 1.8, Math.PI * 2, false).fillPath(); // night
    g.fillStyle(UI_COLORS.wood, 1).fillRect(dx - 33, dy, 66, 4);
    this.dialHand = scene.add.graphics();
    this.dateText = inkText(scene, cx + 80, cy + 12, '', 15).setOrigin(0, 0);
    this.weatherText = inkText(scene, cx + 80, cy + 34, '', 13, UI_COLORS.inkSoft).setOrigin(0, 0);
    this.timeText = inkText(scene, cx + 80, cy + 54, '', 20).setOrigin(0, 0);
    this.container.add([this.dialHand, this.dateText, this.weatherText, this.timeText]);

    // --- Money (under the clock) ---
    const my = cy + CLOCK_H + 4;
    drawWoodPanel(g, cx + 40, my, CLOCK_W - 40, MONEY_H);
    this.moneyText = inkText(scene, width - MARGIN - 14, my + MONEY_H / 2, '', 16, UI_COLORS.gold).setOrigin(1, 0.5);
    this.container.add(this.moneyText);

    // --- Energy / health bars (bottom-right, vertical) ---
    const bx = width - MARGIN - BAR_W;
    const by = height - MARGIN - BAR_H;
    this.energyFill = this.verticalBar(scene, g, bx, by, 0x7ccf5a, 'N');
    this.healthFill = this.verticalBar(scene, g, bx - BAR_W - 8, by, 0xe0604f, '♥');
    this.barTip = scene.add
      .text(bx - BAR_W - 14, by - 4, '', { fontFamily: UI_FONT, fontSize: '13px', color: '#fff6e0', backgroundColor: '#2b1a10cc' })
      .setPadding(5, 3, 5, 3)
      .setOrigin(1, 1)
      .setVisible(false);
    this.container.add(this.barTip);
    this.addBarHover(scene, bx, by, () => `Năng lượng ${Math.round(this.energy.current)}/${this.energy.max}`);
    this.addBarHover(scene, bx - BAR_W - 8, by, () => `Máu ${Math.round(this.health.current)}/${this.health.max}`);

    // --- Controls hint, fades out so it doesn't clutter the screen ---
    const hint = scene.add
      .text(width / 2, height - 64, 'WASD: đi · Shift: chạy · Chuột trái/Space: dùng đồ · Chuột phải/E: tương tác · I: túi đồ · M: bản đồ', {
        fontFamily: UI_FONT,
        fontSize: '13px',
        color: '#fff6e0',
      })
      .setOrigin(0.5, 1)
      .setShadow(1, 1, '#000000', 2, false, true);
    this.container.add(hint);
    scene.tweens.add({ targets: hint, alpha: 0, delay: 20000, duration: 1500 });
  }

  private verticalBar(
    scene: Phaser.Scene,
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    color: number,
    label: string,
  ): Phaser.GameObjects.Rectangle {
    drawWoodPanel(g, x - 4, y - 22, BAR_W + 8, BAR_H + 26, false);
    g.fillStyle(UI_COLORS.edge, 1).fillRect(x + 2, y, BAR_W - 4, BAR_H - 2);
    const label_ = inkText(scene, x + BAR_W / 2, y - 12, label, 12, '#fff2d0').setOrigin(0.5);
    const fill = scene.add.rectangle(x + 4, y + BAR_H - 4, BAR_W - 8, BAR_H - 6, color).setOrigin(0, 1);
    this.container.add([label_, fill]);
    return fill;
  }

  private addBarHover(scene: Phaser.Scene, x: number, y: number, text: () => string): void {
    const zone = scene.add.zone(x - 4, y - 22, BAR_W + 8, BAR_H + 26).setOrigin(0, 0).setInteractive();
    zone.on('pointerover', () => this.barTip.setText(text()).setVisible(true));
    zone.on('pointerout', () => this.barTip.setVisible(false));
    this.container.add(zone);
  }

  /** Kept for compatibility: the location name is now shown under the minimap. */
  setLocation(_name: string): void {}

  setTime(time: TimeState): void {
    this.dateText.setText(`${WEEKDAYS[(time.day - 1) % 7]}, ngày ${time.day}`);
    this.weatherText.setText(`${WEATHER_ICON[time.weather] ?? ''} ${WEATHER_LABELS[time.weather]} · ${SEASON_LABELS[time.season]}`);
    this.timeText.setText(clockLabel(time));
    // Dial hand sweeps from the left (6:00) to the right (2:00) over the day.
    const t = Math.min(1, time.elapsedMinutes / DAY_LENGTH_MINUTES);
    const angle = Math.PI + t * Math.PI;
    const { x, y } = this.dialCenter;
    this.dialHand.clear();
    this.dialHand.lineStyle(3, 0x2b1a10, 1).lineBetween(x, y, x + Math.cos(angle) * 26, y + Math.sin(angle) * 26);
    this.dialHand.fillStyle(0xd8b04a, 1).fillCircle(x, y, 4);
  }

  setEnergy(energy: EnergyState): void {
    this.energy = energy;
    const ratio = energy.max > 0 ? energy.current / energy.max : 0;
    this.energyFill.height = Math.max(0, (BAR_H - 6) * ratio);
    this.energyFill.setFillStyle(ratio > 0.3 ? 0x7ccf5a : ratio > 0.12 ? 0xe0b040 : 0xe0604f);
  }

  setHealth(health: EnergyState): void {
    this.health = health;
    const ratio = health.max > 0 ? health.current / health.max : 0;
    this.healthFill.height = Math.max(0, (BAR_H - 6) * ratio);
  }

  setMoney(amount: number): void {
    this.moneyText.setText(`${amount.toLocaleString('vi-VN')} ₫`);
  }
}
