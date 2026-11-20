import Phaser from 'phaser';
import { ITEM_IDS, type ItemId } from '../data/items';
import { EXTRA_ICONS } from './itemIconsExtra';
import { CROP_ICONS } from './itemIconsCrops';

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

function oreIcon(speckColor: number): Draw {
  return (g) => {
    g.fillStyle(0x7a7a84, 1);
    g.fillTriangle(3, 11, 8, 3, 13, 11);
    g.fillTriangle(3, 11, 13, 11, 8, 14);
    g.lineStyle(1, INK, 1);
    g.strokeTriangle(3, 11, 8, 3, 13, 11);
    g.strokeTriangle(3, 11, 13, 11, 8, 14);
    g.fillStyle(speckColor, 1);
    for (const [x, y] of [
      [6, 8],
      [9, 6],
      [8, 11],
    ]) {
      g.fillCircle(x, y, 1.2);
    }
  };
}

const ICONS: Partial<Record<ItemId, Draw>> = {
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
  sword: tool(0xcfd8dc, (g) => {
    g.fillStyle(0xcfd8dc, 1);
    g.fillRect(9, 1, 3, 9);
    g.lineStyle(1, INK, 1);
    g.strokeRect(9, 1, 3, 9);
    g.fillStyle(0xd9a441, 1);
    g.fillRect(7, 9, 7, 2);
  }),
  copper_ore: oreIcon(0xd98a52),
  iron_ore: oreIcon(0xb7a890),
  gold_ore: oreIcon(0xe8c030),
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
  chest: (g) => {
    g.fillStyle(0xa5793f, 1);
    g.fillRoundedRect(2, 6, 12, 8, 1);
    g.lineStyle(1, INK, 1);
    g.strokeRoundedRect(2, 6, 12, 8, 1);
    g.fillStyle(0x8a6540, 1);
    g.fillRect(2, 6, 12, 2);
    g.fillStyle(0xe8c874, 1);
    g.fillRect(7, 9, 2, 2);
  },
  scarecrow: (g) => {
    g.lineStyle(1.5, 0x8a6a4a, 1);
    g.lineBetween(8, 4, 8, 14);
    g.lineBetween(3, 7, 13, 7);
    g.fillStyle(0xe8d8b8, 1);
    g.fillCircle(8, 4, 2.4);
    g.lineStyle(1, INK, 1);
    g.strokeCircle(8, 4, 2.4);
    g.fillStyle(0xd9a441, 1);
    g.fillTriangle(5, 2, 11, 2, 8, 5);
  },
  sprinkler: (g) => {
    g.fillStyle(0x9a9aa2, 1);
    g.fillRect(6, 9, 4, 5);
    g.lineStyle(1, INK, 1);
    g.strokeRect(6, 9, 4, 5);
    g.fillStyle(0xb7b7bf, 1);
    g.fillCircle(8, 7, 3);
    g.lineStyle(1, INK, 1);
    g.strokeCircle(8, 7, 3);
    g.fillStyle(0x6ea8c9, 1);
    for (const [dx, dy] of [
      [-4, -2],
      [4, -2],
      [0, -5],
    ]) {
      g.fillCircle(8 + dx, 7 + dy, 1);
    }
  },
  carp: (g) => {
    g.fillStyle(0x7ca8c9, 1);
    g.fillEllipse(8, 8, 7, 4);
    g.fillTriangle(2, 8, 5, 5, 5, 11);
    g.lineStyle(1, INK, 1);
    g.strokeEllipse(8, 8, 7, 4);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(11, 7, 0.8);
  },
  perch: (g) => {
    g.fillStyle(0x8fae5a, 1);
    g.fillEllipse(8, 8, 8, 3.5);
    g.fillTriangle(1, 8, 4, 5, 4, 11);
    g.lineStyle(1, INK, 1);
    g.strokeEllipse(8, 8, 8, 3.5);
    g.lineStyle(1, 0x5a7a3a, 1);
    g.lineBetween(5, 6, 5, 10);
    g.lineBetween(8, 5, 8, 11);
    g.lineBetween(11, 6, 11, 10);
  },
  grass_carp: (g) => {
    g.fillStyle(0xb0a070, 1);
    g.fillEllipse(8, 8, 9, 4.5);
    g.fillTriangle(1, 8, 4, 4, 4, 12);
    g.lineStyle(1, INK, 1);
    g.strokeEllipse(8, 8, 9, 4.5);
  },
  golden_loach: (g) => {
    g.lineStyle(2.5, 0xe8c030, 1);
    g.beginPath();
    g.arc(8, 8, 6, Phaser.Math.DegToRad(40), Phaser.Math.DegToRad(320), false);
    g.strokePath();
    g.lineStyle(1, INK, 1);
    g.beginPath();
    g.arc(8, 8, 6, Phaser.Math.DegToRad(40), Phaser.Math.DegToRad(320), false);
    g.strokePath();
  },
  chicken_coop: (g) => {
    g.fillStyle(0xd9a441, 1);
    g.fillTriangle(2, 7, 14, 7, 8, 1);
    g.lineStyle(1, INK, 1);
    g.strokeTriangle(2, 7, 14, 7, 8, 1);
    g.fillStyle(0xe8d8b8, 1);
    g.fillRect(3, 7, 10, 7);
    g.lineStyle(1, INK, 1);
    g.strokeRect(3, 7, 10, 7);
    g.fillStyle(0x8a6540, 1);
    g.fillRect(7, 10, 3, 4);
  },
  egg: (g) => {
    g.fillStyle(0xf2ead8, 1);
    g.fillEllipse(8, 9, 6, 7);
    g.lineStyle(1, INK, 1);
    g.strokeEllipse(8, 9, 6, 7);
    g.fillStyle(0xffffff, 1);
    g.fillEllipse(6, 6, 2, 1.4);
  },
  com_nam: (g) => {
    // Triangular rice ball with a sesame-salt dusting, on a banana leaf.
    g.fillStyle(0x5f9a4a, 1);
    g.fillEllipse(8, 12, 13, 5);
    g.fillStyle(0xf4efe2, 1);
    g.fillTriangle(3, 12, 8, 3, 13, 12);
    g.lineStyle(1, INK, 1);
    g.strokeTriangle(3, 12, 8, 3, 13, 12);
    g.fillStyle(0x3a3030, 1);
    g.fillRect(6, 9, 1, 1);
    g.fillRect(9, 8, 1, 1);
    g.fillRect(8, 10, 1, 1);
  },
  banh_mi: (g) => {
    // Golden baguette with a slit showing the filling.
    g.fillStyle(0xd9a25a, 1);
    g.fillEllipse(8, 9, 14, 6);
    g.lineStyle(1, INK, 1);
    g.strokeEllipse(8, 9, 14, 6);
    g.fillStyle(0x6fae52, 1);
    g.fillRect(4, 8, 8, 1);
    g.fillStyle(0xc0563c, 1);
    g.fillRect(5, 9, 6, 1);
    g.fillStyle(0xf0c888, 1);
    g.fillRect(4, 7, 3, 1);
  },
  ca_phe_sua_da: (g) => {
    // Tall glass: dark coffee over condensed milk, with ice and a straw.
    g.fillStyle(0xe8e2d0, 1);
    g.fillRect(5, 11, 6, 3);
    g.fillStyle(0x5a3420, 1);
    g.fillRect(5, 5, 6, 6);
    g.fillStyle(0xcfe8f0, 0.9);
    g.fillRect(6, 6, 2, 2);
    g.fillRect(8, 8, 2, 2);
    g.lineStyle(1, INK, 1);
    g.strokeRect(4.5, 3.5, 7, 11);
    g.lineStyle(1, 0xd04a3a, 1);
    g.lineBetween(9, 1, 10, 6);
  },
  rice_seeds: seedPacket(0xd8b84a),
  rice: (g) => {
    // A tied sheaf of golden rice with drooping ears.
    g.fillStyle(0xc8a848, 1);
    g.fillRect(6, 6, 4, 9);
    g.fillStyle(0xe8c860, 1);
    g.fillEllipse(5, 4, 4, 6);
    g.fillEllipse(11, 4, 4, 6);
    g.fillEllipse(8, 3, 4, 6);
    g.fillStyle(0x8a5a30, 1);
    g.fillRect(5, 10, 6, 1);
    g.lineStyle(1, INK, 1);
    g.strokeRect(5.5, 6.5, 5, 8);
  },
  ox_cart: (g) => {
    g.fillStyle(0x8a6040, 1);
    g.fillRect(1, 6, 8, 5);
    g.fillStyle(0x9a6038, 1);
    g.fillRect(9, 5, 6, 5);
    g.fillStyle(0xe8dcbe, 1);
    g.fillRect(13, 3, 1, 2);
    g.fillRect(15, 3, 1, 2);
    g.fillStyle(0x2a2420, 1);
    g.fillCircle(5, 12, 3);
    g.fillRect(10, 10, 1, 4);
    g.fillRect(13, 10, 1, 4);
    g.lineStyle(1, INK, 1);
    g.strokeRect(1.5, 6.5, 7, 4);
  },
  bicycle: (g) => {
    g.lineStyle(1, 0x2a2420, 1);
    g.strokeCircle(4, 11, 3);
    g.strokeCircle(12, 11, 3);
    g.lineStyle(1, 0x3c7a9c, 1);
    g.lineBetween(4, 11, 7, 6);
    g.lineBetween(7, 6, 11, 6);
    g.lineBetween(11, 6, 12, 11);
    g.lineBetween(7, 6, 8, 11);
    g.lineBetween(4, 11, 8, 11);
    g.fillStyle(0x2a2420, 1);
    g.fillRect(6, 4, 3, 1);
    g.fillRect(10, 3, 3, 1);
  },
  motorbike: (g) => {
    g.fillStyle(0x2a2420, 1);
    g.fillCircle(4, 12, 3);
    g.fillCircle(12, 12, 3);
    g.fillStyle(0xac342c, 1);
    g.fillRect(2, 6, 5, 5);
    g.fillRect(10, 5, 3, 7);
    g.fillStyle(0x464242, 1);
    g.fillRect(5, 10, 6, 2);
    g.fillRect(9, 3, 5, 1);
    g.fillStyle(0x2a2420, 1);
    g.fillRect(2, 6, 5, 1);
  },
  tractor: (g) => {
    g.fillStyle(0xc45c28, 1);
    g.fillRect(4, 5, 10, 6);
    g.fillStyle(0x3c3838, 1);
    g.fillRect(10, 2, 1, 3);
    g.fillStyle(0x2a2420, 1);
    g.fillCircle(5, 11, 4);
    g.fillCircle(13, 13, 2);
    g.fillStyle(0x787470, 1);
    g.fillCircle(5, 11, 2);
    g.lineStyle(1, INK, 1);
    g.strokeRect(4.5, 5.5, 9, 5);
  },
  harvester: (g) => {
    g.fillStyle(0x4e8852, 1);
    g.fillRect(2, 4, 9, 8);
    g.fillStyle(0xaac8d2, 1);
    g.fillRect(6, 2, 4, 3);
    g.fillStyle(0xd6b03c, 1);
    g.fillRect(10, 9, 5, 4);
    g.fillStyle(0x32302c, 1);
    g.fillRect(2, 12, 9, 3);
    g.lineStyle(1, INK, 1);
    g.strokeRect(2.5, 4.5, 8, 7);
  },
  gao: (g) => {
    // A small sack of white rice, open at the top.
    g.fillStyle(0xd8c49a, 1);
    g.fillRoundedRect(3, 5, 10, 10, 2);
    g.fillStyle(0xf6f2e6, 1);
    g.fillEllipse(8, 5, 9, 4);
    g.fillStyle(0xffffff, 1);
    g.fillRect(6, 4, 1, 1);
    g.fillRect(9, 5, 1, 1);
    g.lineStyle(1, INK, 1);
    g.strokeRoundedRect(3, 5, 10, 10, 2);
    g.fillStyle(0xb8402c, 1);
    g.fillRect(5, 10, 6, 2);
  },
  backpack_cloth: (g) => {
    // Plain cloth rucksack with a flap and two straps.
    g.fillStyle(0x7a8a5a, 1);
    g.fillRoundedRect(3, 4, 10, 11, 3);
    g.fillStyle(0x93a46c, 1);
    g.fillRoundedRect(3, 4, 10, 5, 2);
    g.lineStyle(1, INK, 1);
    g.strokeRoundedRect(3, 4, 10, 11, 3);
    g.lineStyle(1, 0x4a3a28, 1);
    g.lineBetween(6, 2, 6, 5);
    g.lineBetween(10, 2, 10, 5);
  },
  backpack_large: (g) => {
    // Bigger pack with leather straps and a brass buckle.
    g.fillStyle(0x8a5a34, 1);
    g.fillRoundedRect(2, 3, 12, 12, 3);
    g.fillStyle(0xa8743e, 1);
    g.fillRoundedRect(2, 3, 12, 6, 2);
    g.fillStyle(0x5a3a22, 1);
    g.fillRect(4, 8, 2, 7);
    g.fillRect(10, 8, 2, 7);
    g.fillStyle(0xe0b84a, 1);
    g.fillRect(7, 8, 2, 2);
    g.lineStyle(1, INK, 1);
    g.strokeRoundedRect(2, 3, 12, 12, 3);
  },
  carpenter_bench: (g) => {
    // Sturdy workbench with a vice and a saw.
    g.fillStyle(0x9a6a40, 1);
    g.fillRect(1, 6, 14, 3);
    g.fillStyle(0x6a4428, 1);
    g.fillRect(2, 9, 2, 6);
    g.fillRect(12, 9, 2, 6);
    g.fillStyle(0x8a8a90, 1);
    g.fillRect(11, 4, 3, 2);
    g.fillStyle(0xc8c8d0, 1);
    g.fillTriangle(3, 5, 9, 5, 3, 3);
    g.lineStyle(1, INK, 1);
    g.strokeRect(1.5, 6.5, 13, 2);
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
/** Item icons are 32 x 32 textures; shown in the world at this scale (one tile). */
export const ICON_WORLD_SCALE = 0.5;
const ICON_SIZE = 32;
const DRAWN_SIZE = 16;

/**
 * Makes every item's icon texture: a painted picture when the sprite pack has
 * one (assets/icons, loaded as item_icon_<id>), else the code-drawn 16 px
 * icon blown up to 32 px, so all icons share one size.
 */
export function createItemIconTextures(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  const tmp = '__item_icon_draw';
  for (const id of ITEM_IDS) {
    const key = iconTextureKey(id);
    if (scene.textures.exists(key)) continue;
    g.clear();
    (ICONS[id] ?? EXTRA_ICONS[id] ?? CROP_ICONS[id] ?? ICONS.stone)?.(g);
    g.generateTexture(tmp, DRAWN_SIZE, DRAWN_SIZE);
    const canvas = scene.textures.createCanvas(key, ICON_SIZE, ICON_SIZE);
    const ctx = canvas?.getContext();
    if (canvas && ctx) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(scene.textures.get(tmp).getSourceImage() as CanvasImageSource, 0, 0, ICON_SIZE, ICON_SIZE);
      canvas.refresh();
    }
    scene.textures.remove(tmp);
  }
  g.destroy();
}
