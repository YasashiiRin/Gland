import Phaser from 'phaser';
import { DAY_LENGTH_MINUTES, SEASON_LABELS, WEATHER_LABELS } from '../config/time';
import { sanityRatio } from '../systems/SanitySystem';
import { hungerRatio } from '../systems/HungerSystem';
import type { EnergyState } from '../systems/EnergySystem';
import type { TimeState } from '../systems/TimeSystem';
import { clockLabel } from '../systems/TimeSystem';
import { STAMINA } from '../systems/StaminaSystem';
import { UI_COLORS, UI_FONT } from './uiStyle';
import { hasSkin, SKIN, skinRound } from './uiSkin';

const MARGIN = 10;
const DIAL_R = 22;
const BAR_W = 8;
const BAR_H = 76;
/** The recovery bar: slimmer and shorter than the energy bar, in the same color. */
const RECOVERY_W = 5;
const RECOVERY_H = 46;
const ENERGY_COLOR = 0x7ccf5a;
const REST_SECONDS = STAMINA.restSecondsToPump;

const SANITY_COLOR = 0x8a7ce0;
const HUNGER_COLOR = 0xe8a040;

/** Fractions of the 6:00→6:00 day: 18:00 sunset, 20:00 full night. */
const SUNSET = 12 / 24;
const NIGHTFALL = 14 / 24;

const WEEKDAYS = ['T.2', 'T.3', 'T.4', 'T.5', 'T.6', 'T.7', 'CN'];

/**
 * Compact HUD:
 * - top-right: one round day/night dial (sun by day, moon at night) with the
 *   clock and money in small pills below; hover the dial for date/weather;
 *   a gear button beside it opens the settings;
 * - bottom-right: three slim vertical bars (energy, health, sanity), hover for numbers.
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
  private readonly sanityFill: Phaser.GameObjects.Rectangle;
  private sanity: EnergyState = { current: 0, max: 0 };
  private hunger: EnergyState = { current: 0, max: 0 };
  private hungerFill!: Phaser.GameObjects.Rectangle;
  private hungerFrame!: Phaser.GameObjects.Rectangle;
  /** The painted frame of a bar (hunger's blinks red), when the UI skin is there. */
  private lastArt: Phaser.GameObjects.Image | null = null;
  private hungerArt: Phaser.GameObjects.Image | null = null;
  /** The frame of the bar slimBar() made last. */
  private lastFrame!: Phaser.GameObjects.Rectangle;
  private time?: TimeState;
  private energy: EnergyState = { current: 0, max: 0 };
  private health: EnergyState = { current: 0, max: 0 };
  private recovery: EnergyState = { current: 0, max: 0 };
  private restSeconds: number | null = null;
  private readonly recoveryFill: Phaser.GameObjects.Rectangle;
  private readonly restText: Phaser.GameObjects.Text;
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
    // The carved wooden ring round the dial, when painted.
    const ring = skinRound(scene, SKIN.dayDial, this.dialCenter.x, this.dialCenter.y, DIAL_R * 2 + 6);
    this.container.add([this.dial, ...(ring ? [ring] : []), this.timeText, this.moneyText]);
    const dialZone = scene.add
      .zone(this.dialCenter.x, this.dialCenter.y, DIAL_R * 2, DIAL_R * 2)
      .setInteractive();
    dialZone.on('pointerover', () => this.showTip(this.dateLine(), this.dialCenter.x - DIAL_R - 6, this.dialCenter.y));
    dialZone.on('pointerout', () => this.tip.setVisible(false));
    this.container.add(dialZone);

    // --- Gear button (opens settings) ---
    const gx = this.dialCenter.x - DIAL_R - 22;
    const gy = MARGIN + 14;
    const painted = skinRound(scene, SKIN.gear, gx, gy, 30);
    if (painted) {
      painted.setInteractive({ useHandCursor: true });
      painted.on('pointerdown', () => this.onSettings?.());
      painted.on('pointerover', () => painted.setTint(0xfff0d8));
      painted.on('pointerout', () => painted.clearTint());
      this.container.add(painted);
    } else {
      const gear = scene.add.circle(gx, gy, 13, UI_COLORS.wood).setStrokeStyle(2, UI_COLORS.edge);
      const gearIcon = scene.add.text(gx, gy, '⚙', { fontFamily: UI_FONT, fontSize: '17px', color: '#fff2d0' }).setOrigin(0.5);
      gear.setInteractive({ useHandCursor: true });
      gear.on('pointerdown', () => this.onSettings?.());
      gear.on('pointerover', () => gear.setFillStyle(UI_COLORS.woodLight));
      gear.on('pointerout', () => gear.setFillStyle(UI_COLORS.wood));
      this.container.add([gear, gearIcon]);
    }

    // --- Slim energy / health bars (bottom-right) ---
    // Each bar has a letter on top: N năng lượng, H máu, T tinh thần, Đ đói.
    const rx = width - MARGIN - RECOVERY_W;
    const bx = rx - 8 - BAR_W;
    const by = height - MARGIN - BAR_H;
    const step = BAR_W + 8;
    this.recoveryFill = this.slimBar(scene, rx, height - MARGIN - RECOVERY_H, ENERGY_COLOR, 'P', () => this.recoveryTip(), RECOVERY_W, RECOVERY_H);
    this.energyFill = this.slimBar(scene, bx, by, ENERGY_COLOR, 'N', () => `Năng lượng ${Math.round(this.energy.current)}/${this.energy.max}`);
    this.healthFill = this.slimBar(scene, bx - step, by, 0xe0604f, 'H', () => `Máu ${Math.round(this.health.current)}/${this.health.max}`);
    this.sanityFill = this.slimBar(scene, bx - step * 2, by, SANITY_COLOR, 'T', () => `Tinh thần ${Math.round(this.sanity.current)}/${this.sanity.max}`);
    this.hungerFill = this.slimBar(scene, bx - step * 3, by, HUNGER_COLOR, 'Đ', () => `No ${Math.round(this.hunger.current)}/${this.hunger.max}${this.hunger.current <= 0 ? ' — đang đói, mất máu!' : ''}`);
    this.hungerFrame = this.lastFrame;
    this.hungerArt = this.lastArt;
    this.restText = scene.add
      .text(width - MARGIN, by - 22, '', { fontFamily: UI_FONT, fontSize: '11px', fontStyle: 'bold', color: '#fff6e0' })
      .setStroke('#2b1a10', 3)
      .setOrigin(1, 1);
    this.container.add(this.restText);

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

  private slimBar(scene: Phaser.Scene, x: number, y: number, color: number, letter: string, tip: () => string, w = BAR_W, h = BAR_H): Phaser.GameObjects.Rectangle {
    const frame = scene.add.rectangle(x - 2, y - 2, w + 4, h + 4, UI_COLORS.edge, 0.85).setOrigin(0, 0);
    const fill = scene.add.rectangle(x, y + h, w, h, color).setOrigin(0, 1);
    const icon = scene.add
      .text(x + w / 2, y - 10, letter, { fontFamily: UI_FONT, fontSize: '13px', fontStyle: 'bold', color: `#${color.toString(16).padStart(6, '0')}` })
      .setOrigin(0.5)
      .setStroke('#2b1a10', 3);
    this.container.add(icon);
    this.lastFrame = frame;
    frame.setInteractive();
    frame.on('pointerover', () => this.showTip(tip(), x - 6, y + h / 2));
    frame.on('pointerout', () => this.tip.setVisible(false));
    const art = hasSkin(scene, SKIN.barFrame) ? scene.add.image(x - 2, y - 2, SKIN.barFrame).setOrigin(0, 0).setDisplaySize(w + 4, h + 4) : null;
    this.lastArt = art;
    this.container.add([frame, ...(art ? [art] : []), fill]);
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
    const sky = t < SUNSET - 0.04 ? 0x8cc4e0 : t < NIGHTFALL ? 0xe8a060 : 0x2c3560;
    const g = this.dial.clear();
    g.fillStyle(UI_COLORS.edge, 1).fillCircle(x, y, DIAL_R + 2);
    g.fillStyle(rainy && t < NIGHTFALL ? 0x8a9aa8 : sky, 1).fillCircle(x, y, DIAL_R);
    g.fillStyle(0x6a9a4c, 1).slice(x, y, DIAL_R, 0, Math.PI, false).fillPath(); // ground
    const night = t >= SUNSET;
    const phase = night ? (t - SUNSET) / (1 - SUNSET) : t / SUNSET;
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

  /** Horror: the clock shows 03:33 in red for a moment. */
  glitchClock(): void {
    this.timeText.setText('03:33').setColor('#c0201a');
    this.timeText.scene.time.delayedCall(2200, () => {
      this.timeText.setColor(UI_COLORS.ink);
      if (this.time) this.timeText.setText(clockLabel(this.time));
    });
  }

  setEnergy(energy: EnergyState): void {
    this.energy = energy;
    const ratio = energy.max > 0 ? energy.current / energy.max : 0;
    this.energyFill.height = Math.max(0, BAR_H * ratio);
    this.energyFill.setFillStyle(ratio > 0.3 ? ENERGY_COLOR : ratio > 0.12 ? 0xe0b040 : 0xe0604f);
  }

  /** The recovery bar; `restSeconds` is the rest counter while energy is at 0 (else null). */
  setRecovery(recovery: EnergyState, restSeconds: number | null): void {
    this.recovery = recovery;
    this.restSeconds = restSeconds;
    const ratio = recovery.max > 0 ? recovery.current / recovery.max : 0;
    this.recoveryFill.height = Math.max(0, RECOVERY_H * ratio);
    const label = restSeconds === null ? '' : restSeconds < REST_SECONDS ? `Nghỉ ${Math.floor(restSeconds)}/${REST_SECONDS}s` : `Nghỉ ${Math.floor(restSeconds)}s ✓`;
    if (this.restText.text !== label) this.restText.setText(label);
  }

  private recoveryTip(): string {
    const line = `Hồi phục ${Math.round(this.recovery.current)}/${Math.round(this.recovery.max)}`;
    if (this.restSeconds === null) return line;
    return `${line} — hết sức: đứng nghỉ ${REST_SECONDS}s rồi đi tiếp để bơm sức`;
  }

  setHealth(health: EnergyState): void {
    this.health = health;
    const ratio = health.max > 0 ? health.current / health.max : 0;
    this.healthFill.height = Math.max(0, BAR_H * ratio);
  }

  /** Sanity bar; it pulses red once the ghosts can attack. */
  setSanity(sanity: EnergyState): void {
    this.sanity = sanity;
    const ratio = sanityRatio(sanity);
    this.sanityFill.height = Math.max(0, BAR_H * ratio);
    const danger = ratio < 0.15 && Math.floor(performance.now() / 400) % 2 === 0;
    this.sanityFill.setFillStyle(danger ? 0xd02a2a : ratio < 0.4 ? 0xb06ad0 : SANITY_COLOR);
  }

  /** Hunger bar; it blinks red while the stomach is empty (losing health). */
  setHunger(hunger: EnergyState): void {
    this.hunger = hunger;
    const ratio = hungerRatio(hunger);
    this.hungerFill.height = Math.max(0, BAR_H * ratio);
    const starving = ratio <= 0.001 || (ratio < 0.15 && Math.floor(performance.now() / 400) % 2 === 0);
    this.hungerFill.setFillStyle(starving ? 0xd02a2a : HUNGER_COLOR);
    const blink = ratio <= 0.001 && Math.floor(performance.now() / 300) % 2 === 0;
    this.hungerFrame.setFillStyle(blink ? 0xd02a2a : UI_COLORS.edge, 0.85);
    if (this.hungerArt) {
      if (blink) this.hungerArt.setTint(0xff4030);
      else this.hungerArt.clearTint();
    }
  }

  setMoney(amount: number): void {
    this.moneyText.setText(`${amount.toLocaleString('vi-VN')} ₫`);
  }
}
