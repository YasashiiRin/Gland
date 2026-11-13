import Phaser from 'phaser';
import { HOTBAR_SIZE, itemAt, type InventoryState } from '../systems/InventorySystem';
import { slotColor, slotLabel } from './itemVisuals';

const SLOT_SIZE = 40;
const GAP = 4;

/** The always-visible 12-slot hotbar along the bottom of the screen. */
export class Hotbar {
  private readonly boxes: Phaser.GameObjects.Rectangle[] = [];
  private readonly icons: Phaser.GameObjects.Rectangle[] = [];
  private readonly labels: Phaser.GameObjects.Text[] = [];
  private readonly counts: Phaser.GameObjects.Text[] = [];
  private readonly container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, depth: number) {
    const totalWidth = HOTBAR_SIZE * SLOT_SIZE + (HOTBAR_SIZE - 1) * GAP;
    const startX = (scene.scale.width - totalWidth) / 2;
    const y = scene.scale.height - SLOT_SIZE / 2 - 48;

    this.container = scene.add.container(0, 0).setDepth(depth);

    for (let i = 0; i < HOTBAR_SIZE; i++) {
      const x = startX + i * (SLOT_SIZE + GAP) + SLOT_SIZE / 2;
      const box = scene.add
        .rectangle(x, y, SLOT_SIZE, SLOT_SIZE, 0x2a2420, 0.78)
        .setStrokeStyle(2, 0x6b5a46);
      const icon = scene.add.rectangle(x, y, SLOT_SIZE - 12, SLOT_SIZE - 12, 0x888888).setVisible(false);
      const label = scene.add
        .text(x, y, '', { fontFamily: 'sans-serif', fontSize: '11px', color: '#fff6e0' })
        .setOrigin(0.5);
      const count = scene.add
        .text(x + SLOT_SIZE / 2 - 4, y + SLOT_SIZE / 2 - 4, '', {
          fontFamily: 'sans-serif',
          fontSize: '12px',
          color: '#ffffff',
        })
        .setOrigin(1, 1)
        .setShadow(1, 1, '#000000', 2, false, true);
      const keyLabel = scene.add
        .text(x - SLOT_SIZE / 2 + 3, y - SLOT_SIZE / 2 + 2, String((i + 1) % 10), {
          fontFamily: 'sans-serif',
          fontSize: '10px',
          color: '#c9bca6',
        })
        .setOrigin(0, 0);
      this.container.add([box, icon, label, count, keyLabel]);
      this.boxes.push(box);
      this.icons.push(icon);
      this.labels.push(label);
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
      const label = this.labels[i];
      const count = this.counts[i];
      if (stack) {
        icon.setVisible(true).setFillStyle(slotColor(stack.itemId));
        label.setText(slotLabel(stack.itemId));
        count.setText(stack.quantity > 1 ? String(stack.quantity) : '');
      } else {
        icon.setVisible(false);
        label.setText('');
        count.setText('');
      }
      this.boxes[i].setStrokeStyle(2, i === equippedSlot ? 0xffd480 : 0x6b5a46);
    }
  }
}
