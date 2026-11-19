import Phaser from 'phaser';
import { HOTBAR_SIZE, itemAt, type InventoryState } from '../systems/InventorySystem';
import { iconTextureKey } from './itemIcons';
import { UI_COLORS } from './uiStyle';
import { skinSlot, woodPanel, type SkinSlot } from './uiSkin';

const SLOT_SIZE = 40;
const GAP = 4;

/** The always-visible 12-slot hotbar along the bottom of the screen. */
export class Hotbar {
  private readonly boxes: Phaser.GameObjects.Rectangle[] = [];
  /** The painted slots, when the UI skin is there. */
  private readonly arts: (SkinSlot | null)[] = [];
  private readonly icons: Phaser.GameObjects.Image[] = [];
  private readonly counts: Phaser.GameObjects.Text[] = [];
  private readonly container: Phaser.GameObjects.Container;
  /** Called with the slot index when a slot is clicked. */
  onSelect?: (slot: number) => void;

  constructor(scene: Phaser.Scene, depth: number) {
    const totalWidth = HOTBAR_SIZE * SLOT_SIZE + (HOTBAR_SIZE - 1) * GAP;
    const startX = (scene.scale.width - totalWidth) / 2;
    const y = scene.scale.height - SLOT_SIZE / 2 - 14;

    this.container = scene.add.container(0, 0).setDepth(depth);
    // One wooden tray along the bottom edge holding all slots.
    const tray = woodPanel(scene, startX - 10, y - SLOT_SIZE / 2 - 8, totalWidth + 20, SLOT_SIZE + 16, false);
    this.container.add(tray);

    for (let i = 0; i < HOTBAR_SIZE; i++) {
      const x = startX + i * (SLOT_SIZE + GAP) + SLOT_SIZE / 2;
      const box = scene.add
        .rectangle(x, y, SLOT_SIZE, SLOT_SIZE, UI_COLORS.parchment, 1)
        .setStrokeStyle(2, UI_COLORS.edge)
        .setInteractive({ useHandCursor: true });
      // Interactive, so the click is captured here and never reaches the map scene below.
      box.on('pointerdown', () => this.onSelect?.(i));
      const icon = scene.add.image(x, y, iconTextureKey('wood')).setVisible(false).setDisplaySize(26, 26);
      const count = scene.add
        .text(x + SLOT_SIZE / 2 - 4, y + SLOT_SIZE / 2 - 4, '', {
          fontFamily: 'sans-serif',
          fontSize: '12px',
          color: '#fff6e0',
        })
        .setOrigin(1, 1)
        .setShadow(1, 1, '#000000', 2, false, true);
      const keyLabel = scene.add
        .text(x - SLOT_SIZE / 2 + 3, y - SLOT_SIZE / 2 + 2, String((i + 1) % 10), {
          fontFamily: 'sans-serif',
          fontSize: '10px',
          color: '#8a6440',
        })
        .setOrigin(0, 0);
      const art = skinSlot(scene, x, y, SLOT_SIZE);
      this.container.add([box, ...(art ? [art.group] : []), icon, count, keyLabel]);
      this.arts.push(art);
      this.boxes.push(box);
      this.icons.push(icon);
      this.counts.push(count);
    }
  }

  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  refresh(inventory: InventoryState, equippedSlot: number): void {
    for (let i = 0; i < HOTBAR_SIZE; i++) {
      const stack = itemAt(inventory, i);
      const icon = this.icons[i];
      const count = this.counts[i];
      if (stack) {
        icon.setVisible(true).setTexture(iconTextureKey(stack.itemId));
        count.setText(stack.quantity > 1 ? String(stack.quantity) : '');
      } else {
        icon.setVisible(false);
        count.setText('');
      }
      const selected = i === equippedSlot;
      this.arts[i]?.setSelected(selected);
      this.boxes[i].setStrokeStyle(selected ? 3 : 2, selected ? 0xd0402c : UI_COLORS.edge);
      this.boxes[i].setFillStyle(selected ? 0xfff0c8 : UI_COLORS.parchment, 1);
    }
  }
}
