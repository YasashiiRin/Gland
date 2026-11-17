import Phaser from 'phaser';
import type { HorrorScreenPayload } from '../events/EventBus';
import { gameState } from '../state/GameState';
import { playDrone, playHeartbeat, playScreech } from '../systems/HorrorAudio';
import { nightDread } from '../systems/HorrorSystem';
import { UI_FONT } from './uiStyle';

const VIGNETTE_KEY = 'horror_vignette';

/**
 * Screen-wide horror: a dark vignette that closes in as the night deepens,
 * a heartbeat that gets louder after midnight, a low drone, lights that
 * flicker out, whispered words, and the (rare) jump scare.
 */
export class HorrorOverlay {
  private readonly vignette: Phaser.GameObjects.Image;
  private readonly blackout: Phaser.GameObjects.Rectangle;
  private readonly caption: Phaser.GameObjects.Text;
  private readonly face: Phaser.GameObjects.Image;
  private nextBeat = 0;
  private nextDrone = 0;
  private pulse = 0;
  /** Called to make the clock show something wrong for a moment. */
  onClockGlitch?: () => void;

  constructor(private readonly scene: Phaser.Scene, depth: number) {
    const { width, height } = scene.scale;
    if (scene.textures.exists(VIGNETTE_KEY) && scene.textures.get(VIGNETTE_KEY).getSourceImage().width !== width) {
      scene.textures.remove(VIGNETTE_KEY); // the screen changed shape
    }
    if (!scene.textures.exists(VIGNETTE_KEY)) {
      const tex = scene.textures.createCanvas(VIGNETTE_KEY, width, height);
      const ctx = tex?.getContext();
      if (tex && ctx) {
        const g = ctx.createRadialGradient(width / 2, height / 2, height * 0.16, width / 2, height / 2, width * 0.58);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(0.45, 'rgba(0,0,0,0.6)');
        g.addColorStop(1, 'rgba(0,0,0,1)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
        tex.refresh();
      }
    }
    this.vignette = scene.add.image(0, 0, VIGNETTE_KEY).setOrigin(0, 0).setDepth(depth).setAlpha(0);
    this.blackout = scene.add.rectangle(0, 0, width, height, 0x000000, 1).setOrigin(0, 0).setDepth(depth + 1).setAlpha(0);
    this.caption = scene.add
      .text(width / 2, height * 0.68, '', { fontFamily: UI_FONT, fontSize: '20px', color: '#dfe6ea', fontStyle: 'italic' })
      .setOrigin(0.5)
      .setDepth(depth + 2)
      .setAlpha(0)
      .setShadow(0, 0, '#000000', 8, false, true);
    this.face = scene.add.image(width / 2, height / 2, 'horror_face').setDepth(depth + 3).setVisible(false);
  }

  handle(p: HorrorScreenPayload): void {
    if (p.kind === 'flicker') this.flicker();
    else if (p.kind === 'caption' && p.text) this.showCaption(p.text);
    else if (p.kind === 'clockGlitch') this.onClockGlitch?.();
    else if (p.kind === 'jumpscare') this.jumpScare();
  }

  /** Ambient dread; call every frame. */
  update(time: number, active: boolean): void {
    const dread = active && gameState.settings.horror !== 'off' ? nightDread(gameState.time) : 0;
    this.pulse = Math.max(0, this.pulse - 0.04);
    this.vignette.setAlpha(dread > 0 ? Math.min(1, 0.35 + dread * 0.6 + this.pulse * 0.2) : 0);
    if (dread <= 0) return;
    // Heartbeat from about 11 PM, faster and louder towards 2 AM.
    if (dread > 0.45 && time > this.nextBeat) {
      playHeartbeat(gameState.settings, dread);
      this.pulse = 1;
      this.nextBeat = time + 1500 - dread * 650;
    }
    if (dread > 0.6 && time > this.nextDrone) {
      playDrone(gameState.settings, 6, dread);
      this.nextDrone = time + 14000;
    }
  }

  /** The lights go out a few times, unevenly. */
  private flicker(): void {
    const steps = [0.95, 0, 0.85, 0.1, 1, 0.3, 0];
    steps.forEach((a, i) => this.scene.time.delayedCall(i * Phaser.Math.Between(70, 160), () => this.blackout.setAlpha(a)));
    this.pulse = 1;
  }

  private showCaption(text: string): void {
    this.scene.tweens.killTweensOf(this.caption);
    this.caption.setText(text).setAlpha(0).setX(this.scene.scale.width / 2);
    this.scene.tweens.add({ targets: this.caption, alpha: 0.85, duration: 700, yoyo: true, hold: 1800 });
    this.scene.tweens.add({ targets: this.caption, x: '+=2', duration: 60, yoyo: true, repeat: 30 });
  }

  /** Silence and darkness for a moment… then the face. */
  private jumpScare(): void {
    if (gameState.settings.horror !== 'on') return;
    this.blackout.setAlpha(1);
    this.scene.time.delayedCall(650, () => {
      const { height } = this.scene.scale;
      this.face.setVisible(true).setScale((height * 0.85) / this.face.height).setAlpha(1);
      playScreech(gameState.settings);
      this.scene.tweens.add({ targets: this.face, scale: (height * 1.05) / this.face.height, duration: 380, ease: 'Quad.easeIn' });
      this.scene.time.delayedCall(420, () => {
        this.face.setVisible(false);
        this.scene.tweens.add({ targets: this.blackout, alpha: 0, duration: 500 });
      });
    });
  }
}
