import Phaser from 'phaser';
import { gameState } from '../state/GameState';
import { lampStrength, nightLights } from '../state/nightLights';
import { clockMinuteOfDay } from '../systems/TimeSystem';

const TEXTURE = 'lamp_glow';
const TEX_R = 32;
const MAX_LAMPS = 120;

/**
 * Warm oil-lamp glow in windows and doorways from 18:00 to 21:00, drawn by
 * the UI scene on top of its night overlay (additive), at the screen position
 * of each lamp of the current map. Each lamp flickers a little on its own.
 */
export class NightLights {
  private readonly pool: Phaser.GameObjects.Image[] = [];

  constructor(private readonly scene: Phaser.Scene, depth: number) {
    if (!scene.textures.exists(TEXTURE)) {
      const tex = scene.textures.createCanvas(TEXTURE, TEX_R * 2, TEX_R * 2);
      const ctx = tex?.getContext();
      if (tex && ctx) {
        const g = ctx.createRadialGradient(TEX_R, TEX_R, 0, TEX_R, TEX_R, TEX_R);
        g.addColorStop(0, 'rgba(255,214,130,0.95)');
        g.addColorStop(0.25, 'rgba(255,170,70,0.55)');
        g.addColorStop(0.6, 'rgba(230,120,40,0.18)');
        g.addColorStop(1, 'rgba(200,90,30,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, TEX_R * 2, TEX_R * 2);
        tex.refresh();
      }
    }
    for (let i = 0; i < MAX_LAMPS; i++) {
      this.pool.push(scene.add.image(0, 0, TEXTURE).setBlendMode(Phaser.BlendModes.ADD).setDepth(depth).setVisible(false));
    }
  }

  update(time: number): void {
    const strength = lampStrength(clockMinuteOfDay(gameState.time));
    let used = 0;
    if (strength > 0) {
      const { spots, viewX, viewY, zoom } = nightLights;
      const w = this.scene.scale.width;
      const h = this.scene.scale.height;
      for (const s of spots) {
        if (used >= MAX_LAMPS) break;
        const sx = (s.x - viewX) * zoom;
        const sy = (s.y - viewY) * zoom;
        const rr = s.r * zoom * 2;
        if (sx < -rr || sy < -rr || sx > w + rr || sy > h + rr) continue;
        const flicker = 0.85 + 0.15 * Math.sin(time / 90 + s.x * 0.37) * Math.sin(time / 230 + s.y * 0.11);
        this.pool[used++]
          .setPosition(sx, sy)
          .setScale(rr / TEX_R)
          .setAlpha(strength * flicker)
          .setVisible(true);
      }
    }
    for (let i = used; i < this.pool.length; i++) {
      if (!this.pool[i].visible) break;
      this.pool[i].setVisible(false);
    }
  }
}
