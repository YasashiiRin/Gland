import Phaser from 'phaser';
import { ITEMS } from '../data/items';
import { INVENTORY_SIZE, itemAt, moveItem, type InventoryState } from '../systems/InventorySystem';
import { slotColor, slotLabel } from './itemVisuals';

const COLS = 12;
const SLOT_SIZE = 38;
const GAP = 4;

/**
 * The full 36-slot inventory grid (12 hotbar + 24 backpack), opened with "I".
 * Click one slot then another to swap or merge their contents.
 */
export class InventoryMenu {
  private readonly root: Phaser.GameObjects.Container;
  private readonly slotBoxes: Phaser.GameObjects.Rectangle[] = [];
  private readonly icons: Phaser.GameObjects.Rectangle[] = [];
  private readonly labels: Phaser.GameObjects.Text[] = [];
  private readonly counts: Phaser.GameObjects.Text[] = [];
  private readonly nameText: Phaser.GameObjects.Text;
  private selected: number | null = null;
  private inventory: InventoryState | null = null;
  private onChange?: (next: InventoryState) => void;

  constructor(scene: Phaser.Scene, depth: number) {
    const rows = Math.ceil(INVENTORY_SIZE / COLS);
    const gridWidth = COLS * SLOT_SIZE + (COLS - 1) * GAP;
    const gridHeight = rows * SLOT_SIZE + (rows - 1) * GAP;
    const panelW = gridWidth + 48;
    const panelH = gridHeight + 96;
    const cx = scene.scale.width / 2;
    const cy = scene.scale.height / 2;

    this.root = scene.add.container(0, 0).setDepth(depth).setVisible(false);

    const panel = scene.add.rectangle(cx, cy, panelW, panelH, 0x241d17, 0.95).setStrokeStyle(2, 0xc9a66b);
    const title = scene.add
      .text(cx, cy - panelH / 2 + 22, 'Túi đồ (I để đóng)', { fontFamily: 'sans-serif', fontSize: '18px', color: '#fff6e0' })
      .setOrigin(0.5);
    this.nameText = scene.add
      .text(cx, cy + panelH / 2 - 22, '', { fontFamily: 'sans-serif', fontSize: '14px', color: '#e8d8b8' })
      .setOrigin(0.5);
    this.root.add([panel, title, this.nameText]);

    const gridX = cx - gridWidth / 2 + SLOT_SIZE / 2;
    const gridY = cy - gridHeight / 2 + SLOT_SIZE / 2 + 6;
    for (let i = 0; i < INVENTORY_SIZE; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = gridX + col * (SLOT_SIZE + GAP);
      const y = gridY + row * (SLOT_SIZE + GAP);
      const box = scene.add.rectangle(x, y, SLOT_SIZE, SLOT_SIZE, 0x3a2f24, 0.9).setStrokeStyle(2, 0x6b5a46);
      box.setInteractive({ useHandCursor: true });
      box.on('pointerdown', () => this.handleClick(i));
      box.on('pointerover', () => this.showName(i));
      const icon = scene.add.rectangle(x, y, SLOT_SIZE - 10, SLOT_SIZE - 10, 0x888888).setVisible(false);
      const label = scene.add
        .text(x, y, '', { fontFamily: 'sans-serif', fontSize: '10px', color: '#fff6e0' })
        .setOrigin(0.5);
      const count = scene.add
        .text(x + SLOT_SIZE / 2 - 3, y + SLOT_SIZE / 2 - 3, '', { fontFamily: 'sans-serif', fontSize: '11px', color: '#ffffff' })
        .setOrigin(1, 1)
        .setShadow(1, 1, '#000000', 2, false, true);
      this.root.add([box, icon, label, count]);
      this.slotBoxes.push(box);
      this.icons.push(icon);
      this.labels.push(label);
      this.counts.push(count);
    }
  }

  /** Called once from UIScene with a getter/setter pair so this stays decoupled from GameState. */
  bind(getInventory: () => InventoryState, onChange: (next: InventoryState) => void): void {
    this.onChange = onChange;
    this.refresh(getInventory());
  }

  open(inventory: InventoryState): void {
    this.selected = null;
    this.refresh(inventory);
    this.root.setVisible(true);
  }

  close(): void {
    this.root.setVisible(false);
    this.selected = null;
  }

  get isOpen(): boolean {
    return this.root.visible;
  }

  refresh(inventory: InventoryState): void {
    this.inventory = inventory;
    for (let i = 0; i < INVENTORY_SIZE; i++) {
      const stack = itemAt(inventory, i);
      if (stack) {
        this.icons[i].setVisible(true).setFillStyle(slotColor(stack.itemId));
        this.labels[i].setText(slotLabel(stack.itemId));
        this.counts[i].setText(stack.quantity > 1 ? String(stack.quantity) : '');
      } else {
        this.icons[i].setVisible(false);
        this.labels[i].setText('');
        this.counts[i].setText('');
      }
      this.slotBoxes[i].setStrokeStyle(2, i === this.selected ? 0xffd480 : 0x6b5a46);
    }
  }

  private handleClick(index: number): void {
    if (!this.inventory) return;
    if (this.selected === null) {
      if (itemAt(this.inventory, index)) this.selected = index;
      this.refresh(this.inventory);
      return;
    }
    if (this.selected === index) {
      this.selected = null;
      this.refresh(this.inventory);
      return;
    }
    const next = moveItem(this.inventory, this.selected, index);
    this.selected = null;
    this.onChange?.(next);
  }

  private showName(index: number): void {
    if (!this.inventory) return;
    const stack = itemAt(this.inventory, index);
    this.nameText.setText(stack ? `${ITEMS[stack.itemId].name} — ${ITEMS[stack.itemId].description}` : '');
  }
}
