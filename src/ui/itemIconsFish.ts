import type Phaser from 'phaser';
import type { ItemId } from '../data/items';

/**
 * Stand-in icons (16 px, drawn in code) for the fish added with the 2000
 * prices and for fish feed, until painted ones are in assets/icons.
 */
type Draw = (g: Phaser.GameObjects.Graphics) => void;

const INK = 0x2a201c;

/** A fish facing right: body `len` long, `tall` high, in `color`, maybe striped. */
function fish(color: number, len = 8, tall = 4, stripe?: number): Draw {
  return (g) => {
    g.fillStyle(color, 1);
    g.fillEllipse(8, 8, len, tall);
    g.fillTriangle(8 - len / 2 - 2, 8, 8 - len / 2 + 1, 8 - tall / 2 - 1, 8 - len / 2 + 1, 8 + tall / 2 + 1);
    if (stripe !== undefined) {
      g.lineStyle(1, stripe, 1);
      g.lineBetween(8 - len / 4, 8 - tall / 2 + 1, 8 - len / 4, 8 + tall / 2 - 1);
      g.lineBetween(8 + len / 8, 8 - tall / 2 + 1, 8 + len / 8, 8 + tall / 2 - 1);
    }
    g.lineStyle(1, INK, 1);
    g.strokeEllipse(8, 8, len, tall);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(8 + len / 2 - 1.5, 7.5, 0.8);
  };
}

const feed: Draw = (g) => {
  g.fillStyle(0xc9a46a, 1);
  g.fillRect(4, 5, 8, 9);
  g.fillStyle(0x8a6a4a, 1);
  g.fillRect(5, 3, 6, 2);
  g.fillStyle(0x9a7a8a, 1);
  g.fillCircle(8, 10, 2);
  g.lineStyle(1, INK, 1);
  g.strokeRect(4, 5, 8, 9);
};

export const FISH_ICONS: Partial<Record<ItemId, Draw>> = {
  tilapia: fish(0x8a9aa8, 8, 5, 0x5a6a78),
  silver_carp: fish(0xc8ccd0, 10, 5),
  linh_fish: fish(0xd8dce0, 6, 3),
  scad: fish(0x6a9ab8, 8, 3.5),
  tuna: fish(0x34506e, 11, 5),
  pomfret: fish(0xd0d4d8, 7, 7),
  red_snapper: fish(0xd8584a, 9, 5),
  indian_mackerel: fish(0x7aa0b8, 8, 3.5, 0x3a5a78),
  hairtail: fish(0xe0e4ea, 13, 2.5),
  barramundi: fish(0x9aa48a, 10, 5),
  fish_feed: feed,
} as Partial<Record<ItemId, Draw>>;
