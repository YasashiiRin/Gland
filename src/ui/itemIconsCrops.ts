import type Phaser from 'phaser';
import type { ItemId } from '../data/items';

type Draw = (g: Phaser.GameObjects.Graphics) => void;
const INK = 0x2a201c;

/**
 * Placeholder icons for the 2000-price crops until painted ones are added
 * (see Assets.md): a paper seed packet with the crop's colour, and the
 * produce as a simple coloured shape.
 */
const COLORS: Partial<Record<string, number>> = {
  mustard_greens: 0x5fae4a, lettuce: 0x9bd468, corn: 0xf0c94a, watermelon: 0x3f8f3a, cucumber: 0x4f9a3c,
  water_spinach: 0x3f9e4c, long_bean: 0x6aa84a, glutinous_rice: 0xe8d9a0, sweet_potato: 0xa8506a,
  pumpkin: 0xe08a2c, eggplant: 0x7b4a9a, chili: 0xd8342a, cabbage: 0x9ccf7a, kohlrabi: 0xb6d68a,
  carrot: 0xec7a2a, garlic: 0xf0e8d8,
};
/** Long, thin produce drawn as a pod; big round ones fill the icon. */
const LONG = new Set(['long_bean', 'cucumber', 'eggplant', 'chili', 'carrot', 'corn', 'water_spinach', 'sweet_potato']);
const BIG = new Set(['watermelon', 'pumpkin', 'cabbage']);

function packet(color: number): Draw {
  return (g) => {
    g.fillStyle(0xe8d6ae, 1).fillRect(3, 2, 10, 12);
    g.fillStyle(color, 1).fillCircle(8, 9, 3);
    g.fillStyle(0xcdb88c, 1).fillRect(3, 2, 10, 2);
    g.lineStyle(1, INK, 1).strokeRect(3.5, 2.5, 9, 11);
  };
}

function produce(id: string, color: number): Draw {
  return (g) => {
    g.fillStyle(color, 1);
    if (LONG.has(id)) g.fillEllipse(8, 9, 12, 5);
    else g.fillCircle(8, 9, BIG.has(id) ? 6 : 4.5);
    g.fillStyle(0x4a8a34, 1).fillRect(7, 2, 2, 3);
    g.lineStyle(1, INK, 1);
    if (LONG.has(id)) g.strokeEllipse(8, 9, 12, 5);
    else g.strokeCircle(8, 9, BIG.has(id) ? 6 : 4.5);
  };
}

const fertilizer: Draw = (g) => {
  g.fillStyle(0x8a6a44, 1).fillEllipse(8, 11, 12, 6);
  g.fillStyle(0x6a4e30, 1).fillCircle(6, 10, 1).fillCircle(10, 11, 1).fillCircle(8, 9, 1);
  g.fillStyle(0xe8e0d0, 1).fillCircle(9, 12, 0.8).fillCircle(5, 12, 0.8);
  g.lineStyle(1, INK, 1).strokeEllipse(8, 11, 12, 6);
};

export const CROP_ICONS: Partial<Record<ItemId, Draw>> = { fertilizer } as Partial<Record<ItemId, Draw>>;
for (const [id, color] of Object.entries(COLORS)) {
  if (color === undefined) continue;
  (CROP_ICONS as Record<string, Draw>)[id] = produce(id, color);
  (CROP_ICONS as Record<string, Draw>)[`${id}_seeds`] = packet(color);
}
