import Phaser from 'phaser';
import { ITEM_IDS, type ItemId } from '../data/items';

export function iconTextureKey(itemId: ItemId): string {
  return `item_icon_${itemId}`;
}

const INK = 0x2a201c;

type Draw = (g: Phaser.GameObjects.Graphics) => void;

function tool(bladeColor: number, bladeDraw: (g: Phaser.GameObjects.Graphics) => void): Draw {
  return (g) => {
    // Diagonal brown handle, common to every hand tool.
    g.lineStyle(2, 0x8a6a4a, 1);
    g.lineBetween(4, 14, 11, 4);
    g.lineStyle(1, INK, 1);
    g.lineBetween(4, 14, 11, 4);
    bladeDraw(g);
    void bladeColor;
  };
}

function seedPacket(tieColor: number): Draw {
  return (g) => {
    g.fillStyle(0xb98f5a, 1);
    g.fillRoundedRect(3, 5, 10, 9, 2);
    g.lineStyle(1, INK, 1);
    g.strokeRoundedRect(3, 5, 10, 9, 2);
    g.fillStyle(tieColor, 1);
    g.fillRect(3, 5, 10, 3);
    g.lineStyle(1, INK, 1);
    g.lineBetween(3, 8, 13, 8);
    g.fillStyle(0xd9c7a0, 1);
    g.fillTriangle(6, 9, 10, 9, 8, 12);
  };
}

const ICONS: Record<ItemId, Draw> = {
  hoe: tool(0x9a9aa2, (g) => {
    g.fillStyle(0x9a9aa2, 1);
    g.fillRect(8, 2, 6, 3);
    g.lineStyle(1, INK, 1);
    g.strokeRect(8, 2, 6, 3);
  }),
  axe: tool(0xb7b7bf, (g) => {
    g.fillStyle(0xb7b7bf, 1);
    g.fillTriangle(9, 2, 15, 5, 9, 8);
    g.lineStyle(1, INK, 1);
    g.strokeTriangle(9, 2, 15, 5, 9, 8);
  }),
  watering_can: (g) => {
    g.fillStyle(0x6ea8c9, 1);
    g.fillRoundedRect(3, 6, 8, 7, 2);
    g.lineStyle(1, INK, 1);
    g.strokeRoundedRect(3, 6, 8, 7, 2);
    g.fillStyle(0x5a90ac, 1);
    g.fillRect(3, 6, 8, 2);
    g.lineStyle(2, 0x6ea8c9, 1);
    g.lineBetween(10, 7, 14, 4);
    g.lineStyle(1, INK, 1);
    g.lineBetween(10, 7, 14, 4);
    g.fillStyle(0x3d6e86, 1);
    g.fillRect(4, 3, 4, 2);
  },
  pickaxe: tool(0x9a9aa2, (g) => {
    g.fillStyle(0x9a9aa2, 1);
    g.fillTriangle(5, 3, 11, 1, 9, 7);
    g.fillTriangle(11, 1, 15, 5, 9, 7);
    g.lineStyle(1, INK, 1);
    g.strokeTriangle(5, 3, 11, 1, 9, 7);
    g.strokeTriangle(11, 1, 15, 5, 9, 7);
  }),
  scythe: tool(0xc9c9d1, (g) => {
    g.lineStyle(2, 0xc9c9d1, 1);
    g.beginPath();
    g.arc(9, 5, 6, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(200), false);
    g.strokePath();
    g.lineStyle(1, INK, 1);
    g.beginPath();
    g.arc(9, 5, 6, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(200), false);
    g.strokePath();
  }),
  fishing_rod: (g) => {
    g.lineStyle(2, 0x8a6a4a, 1);
    g.lineBetween(3, 14, 13, 3);
    g.lineStyle(1, INK, 1);
    g.lineBetween(3, 14, 13, 3);
    g.lineStyle(1, 0xcfd8dc, 1);
    g.lineBetween(13, 3, 12, 11);
    g.fillStyle(0xb7b7bf, 1);
    g.fillCircle(12, 12, 1.4);
  },

  parsnip_seeds: seedPacket(0xe8d8b8),
  potato_seeds: seedPacket(0xb98f5a),
  cauliflower_seeds: seedPacket(0xf2f2ea),
  strawberry_seeds: seedPacket(0xe85a5a),
  green_bean_seeds: seedPacket(0x6fae52),

  parsnip: (g) => {
    g.fillStyle(0x58a85a, 1);
    g.fillTriangle(8, 2, 10, 5, 6, 5);
    g.fillStyle(0xf0ead6, 1);
    g.fillEllipse(8, 11, 7, 9);
    g.lineStyle(1, INK, 1);
    g.strokeEllipse(8, 11, 7, 9);
    g.fillStyle(0xdcd0ae, 1);
    g.fillEllipse(7, 9, 2, 4);
  },
  potato: (g) => {
    g.fillStyle(0xaf8355, 1);
    g.fillEllipse(8, 9, 11, 8);
    g.lineStyle(1, INK, 1);
    g.strokeEllipse(8, 9, 11, 8);
    g.fillStyle(0x8a6540, 1);
    g.fillCircle(5, 8, 1);
    g.fillCircle(10, 11, 1);
    g.fillCircle(11, 7, 0.8);
  },
  cauliflower: (g) => {
    g.fillStyle(0x6fae52, 1);
    g.fillRect(6, 11, 4, 4);
    for (const [cx, cy] of [
      [8, 7],
      [5, 9],
      [11, 9],
      [6, 6],
      [10, 6],
    ]) {
      g.fillStyle(0xf2f2ea, 1);
      g.fillCircle(cx, cy, 3);
    }
    g.lineStyle(1, INK, 1);
    g.strokeCircle(8, 8, 6);
  },
  strawberry: (g) => {
    g.fillStyle(0x6fae52, 1);
    g.fillTriangle(5, 3, 11, 3, 8, 6);
    g.fillStyle(0xe85a5a, 1);
    g.fillTriangle(4, 6, 12, 6, 8, 14);
    g.lineStyle(1, INK, 1);
    g.strokeTriangle(4, 6, 12, 6, 8, 14);
    g.fillStyle(0xffe066, 1);
    for (const [px, py] of [
      [6, 8],
      [10, 8],
      [7, 11],
      [9, 11],
    ]) {
      g.fillCircle(px, py, 0.6);
    }
  },
  green_bean: (g) => {
    g.lineStyle(3, 0x6fae52, 1);
    g.beginPath();
    g.arc(6, 10, 5, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false);
    g.strokePath();
    g.beginPath();
    g.arc(11, 7, 5, Phaser.Math.DegToRad(190), Phaser.Math.DegToRad(330), false);
    g.strokePath();
    g.lineStyle(1, INK, 1);
    g.beginPath();
    g.arc(6, 10, 5, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false);
    g.strokePath();
  },
  wood: (g) => {
    g.fillStyle(0xb98f5a, 1);
    g.fillCircle(8, 8, 6);
    g.lineStyle(1, INK, 1);
    g.strokeCircle(8, 8, 6);
    g.lineStyle(1, 0x8a6540, 1);
    g.strokeCircle(8, 8, 3.5);
    g.strokeCircle(8, 8, 1.5);
  },
  fiber: (g) => {
    g.lineStyle(1.5, 0xc9b27a, 1);
    for (const dy of [-3, 0, 3]) {
      g.beginPath();
      g.arc(8, 8, 5, Phaser.Math.DegToRad(200 + dy * 4), Phaser.Math.DegToRad(340 + dy * 4), false);
      g.strokePath();
    }
    g.lineStyle(0.75, INK, 0.6);
    for (const dy of [-3, 0, 3]) {
      g.beginPath();
      g.arc(8, 8, 5, Phaser.Math.DegToRad(200 + dy * 4), Phaser.Math.DegToRad(340 + dy * 4), false);
      g.strokePath();
    }
  },
  stone: (g) => {
    g.fillStyle(0xaaaab2, 1);
    g.fillTriangle(3, 11, 8, 3, 13, 11);
    g.fillTriangle(3, 11, 13, 11, 8, 14);
    g.lineStyle(1, INK, 1);
    g.strokeTriangle(3, 11, 8, 3, 13, 11);
    g.strokeTriangle(3, 11, 13, 11, 8, 14);
    g.fillStyle(0xc9c9d1, 1);
    g.fillTriangle(6, 9, 8, 5, 10, 9);
  },
};

/** Draws a small procedural icon for every item once, as a reusable texture. */
export function createItemIconTextures(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  for (const id of ITEM_IDS) {
    g.clear();
    ICONS[id](g);
    g.generateTexture(iconTextureKey(id), 16, 16);
  }
  g.destroy();
}
