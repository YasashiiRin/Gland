import type Phaser from 'phaser';
import { TILE } from '../config/constants';
import { isTreeGid } from '../config/tileGids';

const TEXTURE = 'khai_nhan_mist';
const RADIUS_TILES = 26;
const CELL = 4;

/**
 * Khai nhãn ("opening the eyes"): for a minute, drifting grey-violet mist
 * shows where ghosts like to be - the more trees around a spot, the thicker
 * the mist (hauntings are likelier among trees, see HorrorSystem). Safe zones
 * stay clear.
 */
export function castKhaiNhan(
  scene: Phaser.Scene,
  decor: Phaser.Tilemaps.TilemapLayer,
  at: { x: number; y: number },
  safe: (tx: number, ty: number) => boolean,
  seconds: number,
): number {
  if (!scene.textures.exists(TEXTURE)) {
    const tex = scene.textures.createCanvas(TEXTURE, 64, 64);
    const ctx = tex?.getContext();
    if (tex && ctx) {
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(190,180,220,0.9)');
      g.addColorStop(0.6, 'rgba(150,140,190,0.35)');
      g.addColorStop(1, 'rgba(120,110,160,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);
      tex.refresh();
    }
  }
  const cx = Math.floor(at.x / TILE);
  const cy = Math.floor(at.y / TILE);
  let patches = 0;
  for (let gy = cy - RADIUS_TILES; gy <= cy + RADIUS_TILES; gy += CELL) {
    for (let gx = cx - RADIUS_TILES; gx <= cx + RADIUS_TILES; gx += CELL) {
      if (safe(gx, gy)) continue;
      let trees = 0;
      for (let y = gy - 3; y <= gy + 3; y++) for (let x = gx - 3; x <= gx + 3; x++) if (isTreeGid(decor.getTileAt(x, y)?.index)) trees++;
      if (trees < 3) continue;
      const density = Math.min(1, trees / 20);
      const x = gx * TILE + TILE / 2;
      const y = gy * TILE + TILE / 2;
      const mist = scene.add.image(x, y, TEXTURE).setDepth(y + 40).setScale(1.2 + density).setAlpha(0);
      scene.tweens.add({ targets: mist, alpha: 0.25 + 0.55 * density, duration: 1200 });
      scene.tweens.add({ targets: mist, x: x + 10, y: y - 6, duration: 3000 + Math.random() * 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      scene.time.delayedCall(seconds * 1000, () => scene.tweens.add({ targets: mist, alpha: 0, duration: 1500, onComplete: () => mist.destroy() }));
      patches++;
    }
  }
  return patches;
}
