import type Phaser from 'phaser';
import type { ItemId } from '../data/items';
import type { Direction } from '../systems/movement';
import { ICON_WORLD_SCALE, iconTextureKey } from '../ui/itemIcons';

/** Tools that are swung overhead and brought down onto the tile (the rest just bump). */
const SWUNG: ReadonlySet<string> = new Set(['hoe', 'axe', 'pickaxe', 'scythe', 'sword']);

/**
 * The tool in the player's hands as they use it: a hoe (axe, pickaxe…) is
 * raised over the shoulder and brought down hard onto the tile in front, a
 * puff of earth where it lands; the watering can is tipped forward to pour.
 */
export function swingTool(scene: Phaser.Scene, who: { x: number; y: number; depth: number }, itemId: ItemId, facing: Direction): void {
  const key = iconTextureKey(itemId);
  if (!scene.textures.exists(key)) return;
  const side = facing === 'left' ? -1 : 1;
  const img = scene.add.image(who.x + side * 5, who.y - 13, key).setOrigin(0.2, 0.85).setScale(ICON_WORLD_SCALE);
  img.setFlipX(side < 0).setDepth(facing === 'up' ? who.depth - 1 : who.depth + 1);
  if (itemId === 'watering_can') {
    img.setAngle(0);
    scene.tweens.chain({
      targets: img,
      tweens: [
        { angle: side * 55, duration: 140, ease: 'Sine.easeOut' },
        { angle: side * 55, duration: 260 },
        { angle: 0, alpha: 0, duration: 140 },
      ],
      onComplete: () => img.destroy(),
    });
    return;
  }
  if (!SWUNG.has(itemId)) {
    img.destroy();
    return;
  }
  // Raised behind the head, then down in front: angles mirror for the left side.
  const up = side * -150;
  const down = side * 35;
  img.setAngle(side * -40);
  const front = facing === 'down' ? { x: who.x, y: who.y + 2 } : facing === 'up' ? { x: who.x, y: who.y - 16 } : { x: who.x + side * 12, y: who.y - 4 };
  scene.tweens.chain({
    targets: img,
    tweens: [
      { angle: up, y: who.y - 20, duration: 130, ease: 'Quad.easeOut' },
      { angle: down, x: front.x, y: front.y - 6, duration: 90, ease: 'Quad.easeIn' },
      { alpha: 0, duration: 120, delay: 70 },
    ],
    onComplete: () => img.destroy(),
  });
  scene.time.delayedCall(220, () => {
    if (itemId !== 'hoe' && itemId !== 'pickaxe') return;
    for (let i = 0; i < 4; i++) {
      const bit = scene.add.circle(front.x + (Math.random() - 0.5) * 8, front.y, 1.5, itemId === 'hoe' ? 0x7a5636 : 0x8a8a90).setDepth(who.depth + 2);
      scene.tweens.add({ targets: bit, y: bit.y - 4 - Math.random() * 5, x: bit.x + (Math.random() - 0.5) * 10, alpha: 0, duration: 380, onComplete: () => bit.destroy() });
    }
  });
}
