import type Phaser from 'phaser';
import type { ItemId } from '../data/items';

type Draw = (g: Phaser.GameObjects.Graphics) => void;
const INK = 0x2a201c;

/** A side-view fish: body colour, belly colour, length (px) and optional stripes/spots. */
function fish(body: number, belly: number, len = 8, marks?: (g: Phaser.GameObjects.Graphics) => void): Draw {
  return (g) => {
    g.fillStyle(body, 1);
    g.fillEllipse(8, 8, len, 4.2);
    g.fillTriangle(8 - len / 2 - 3, 8, 8 - len / 2 + 1, 4.5, 8 - len / 2 + 1, 11.5);
    g.fillStyle(belly, 1);
    g.fillEllipse(8.5, 9.2, len - 2, 1.8);
    marks?.(g);
    g.lineStyle(1, INK, 1);
    g.strokeEllipse(8, 8, len, 4.2);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(8 + len / 2 - 1.6, 7.2, 0.8);
  };
}

/** A side-view young farm animal. */
function animal(body: number, head: number, extra?: (g: Phaser.GameObjects.Graphics) => void): Draw {
  return (g) => {
    g.fillStyle(body, 1);
    g.fillEllipse(7, 9, 9, 5.5);
    g.fillRect(4, 11, 1.5, 3);
    g.fillRect(9, 11, 1.5, 3);
    g.fillStyle(head, 1);
    g.fillCircle(12, 7.5, 2.8);
    extra?.(g);
    g.lineStyle(1, INK, 1);
    g.strokeEllipse(7, 9, 9, 5.5);
    g.strokeCircle(12, 7.5, 2.8);
    g.fillStyle(INK, 1);
    g.fillCircle(12.8, 6.8, 0.5);
  };
}

export const EXTRA_ICONS: Partial<Record<ItemId, Draw>> = {
  worm: (g) => {
    g.lineStyle(2.5, 0xd98a8a, 1);
    g.beginPath();
    g.moveTo(3, 11);
    g.lineTo(6, 8);
    g.lineTo(9, 11);
    g.lineTo(12, 7);
    g.strokePath();
    g.fillStyle(0xb06060, 1);
    g.fillCircle(12.5, 6.5, 1.3);
  },
  whip: (g) => {
    g.lineStyle(2, 0x8a6a4a, 1);
    g.lineBetween(3, 14, 7, 9);
    g.lineStyle(1, 0x5a4030, 1);
    g.beginPath();
    g.moveTo(7, 9);
    g.lineTo(11, 3);
    g.lineTo(14, 5);
    g.lineTo(12, 9);
    g.strokePath();
  },
  animal_chicken: (g) => {
    g.fillStyle(0xf6f0e4, 1);
    g.fillEllipse(7, 10, 8, 6);
    g.fillCircle(11, 6, 2.5);
    g.fillStyle(0xdc3228, 1);
    g.fillRect(10, 3, 2, 1);
    g.fillStyle(0xf0aa28, 1);
    g.fillTriangle(13, 6, 15, 6.5, 13, 7);
    g.lineStyle(1, INK, 1);
    g.strokeEllipse(7, 10, 8, 6);
  },
  animal_pig: animal(0xf0b0ac, 0xf0b0ac, (g) => {
    g.fillStyle(0xe4888c, 1);
    g.fillCircle(14, 8.5, 1.3);
  }),
  animal_cow: animal(0xc48c54, 0xba824c, (g) => {
    g.fillStyle(0xf6ecda, 1);
    g.fillCircle(6, 8, 1.6);
  }),
  animal_buffalo: animal(0x565660, 0x50505a, (g) => {
    g.lineStyle(1, 0xe2d6be, 1);
    g.lineBetween(10, 5, 8, 3);
    g.lineBetween(13, 5, 15, 3);
  }),
  crucian: fish(0xb8b49a, 0xe8e2c8, 7),
  snakehead: fish(0x4a5a3a, 0x9aa080, 11, (g) => {
    g.fillStyle(0x2e3a24, 1);
    for (const x of [5, 8, 11]) g.fillRect(x, 6.5, 1.2, 2);
  }),
  catfish: fish(0x4a4440, 0x8a8278, 10, (g) => {
    g.lineStyle(1, 0x2a2420, 1);
    g.lineBetween(13, 9, 15, 11);
    g.lineBetween(13, 9, 15, 9.5);
  }),
  goby: fish(0xa08a6a, 0xd8c8a4, 7, (g) => {
    g.fillStyle(0x6a5a40, 1);
    g.fillCircle(6, 7.5, 0.8);
    g.fillCircle(9, 8, 0.8);
  }),
  sleeping_mat: (g) => {
    // A rolled sedge mat tied with two red bands.
    g.fillStyle(0xdec484, 1);
    g.fillRect(2, 5, 12, 7);
    g.fillStyle(0xc4a664, 1);
    for (const x of [4, 7, 10]) g.fillRect(x, 5, 1, 7);
    g.fillStyle(0xb03430, 1);
    g.fillRect(5, 5, 1, 7);
    g.fillRect(11, 5, 1, 7);
    g.fillStyle(0xf0e2b0, 1);
    g.fillEllipse(13.5, 8.5, 3, 7);
    g.lineStyle(1, INK, 1);
    g.strokeRect(2.5, 5.5, 11, 6);
  },
  bua_khai_dao: (g) => {
    // A yellow paper talisman with red brush strokes.
    g.fillStyle(0xf2d46a, 1);
    g.fillRect(4, 1, 8, 14);
    g.fillStyle(0xc0302a, 1);
    g.fillRect(7, 3, 2, 1);
    g.fillRect(6, 5, 4, 1);
    g.fillRect(7, 7, 2, 5);
    g.fillRect(5, 9, 6, 1);
    g.fillCircle(8, 13, 1);
    g.lineStyle(1, INK, 1);
    g.strokeRect(4.5, 1.5, 7, 13);
  },
  sach_co: (g) => {
    // An old stitched book, yellowed pages, a dark cover.
    g.fillStyle(0x5a3a2a, 1);
    g.fillRect(2, 3, 12, 11);
    g.fillStyle(0xe8d8a8, 1);
    g.fillRect(4, 4, 9, 9);
    g.fillStyle(0x8a6a4a, 1);
    for (const y of [6, 8, 10]) g.fillRect(6, y, 6, 1);
    g.fillStyle(0xd8b040, 1);
    for (const y of [4, 8, 12]) g.fillRect(2, y, 2, 1);
    g.lineStyle(1, INK, 1);
    g.strokeRect(2.5, 3.5, 11, 10);
  },
  fish_fry: (g) => {
    // A clear bag of water with three little fish.
    g.fillStyle(0xbfe3f2, 0.9);
    g.fillEllipse(8, 10, 10, 9);
    g.fillStyle(0xd8c8a4, 1);
    g.fillRect(6, 3, 4, 3);
    g.fillStyle(0xd6503c, 1);
    g.fillRect(5, 5, 6, 1);
    g.fillStyle(0x6a8aa0, 1);
    for (const [x, y] of [[6, 9], [10, 10], [7, 12]]) g.fillEllipse(x, y, 3, 1.4);
    g.lineStyle(1, INK, 1);
    g.strokeEllipse(8, 10, 10, 9);
  },
  water_truck: (g) => {
    g.fillStyle(0x4680b0, 1);
    g.fillEllipse(6, 7, 9, 7);
    g.fillStyle(0xe8c446, 1);
    g.fillRect(10, 6, 5, 5);
    g.fillStyle(0x2a2420, 1);
    g.fillCircle(5, 12, 2.5);
    g.fillCircle(12, 12, 2);
    g.fillStyle(0x78bee6, 1);
    for (const x of [1, 3]) g.fillRect(x, 12, 1, 2);
    g.lineStyle(1, INK, 1);
    g.strokeEllipse(6, 7, 9, 7);
  },
  anchovy: fish(0xa8c4d4, 0xeef4f6, 7),
  mackerel: fish(0x3a6a90, 0xdfe8ee, 10, (g) => {
    g.lineStyle(1, 0x24486a, 1);
    for (const x of [5, 7, 9, 11]) g.lineBetween(x, 6.2, x + 1, 7.4);
  }),
  grouper: fish(0x9a5a3a, 0xd8a07a, 10, (g) => {
    g.fillStyle(0x6a3a24, 1);
    for (const [x, y] of [[5, 7], [8, 6.5], [10, 8], [7, 8.5]]) g.fillCircle(x, y, 0.7);
  }),
};
