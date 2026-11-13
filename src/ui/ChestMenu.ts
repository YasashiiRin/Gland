import Phaser from 'phaser';
import type { InventoryState } from '../systems/InventorySystem';
import { itemAt } from '../systems/InventorySystem';
import { iconTextureKey } from './itemIcons';

const COLS = 6;
const SLOT_SIZE = 40;
const GAP = 6;

/**
 * The chest's own storage grid (opened with E near a placed chest). Clicking
 * an empty slot deposits the player's currently equipped stack into it;
 * clicking a filled slot withdraws it back to the player's inventory.
 */
export class ChestMenu {
  private readonly root: Phaser.GameObjects.Container;
  private readonly nameText: Phaser.GameObjects.Text;
  private readonly slotBoxes: Phaser.GameObjects.Rectangle[] = [];
  private readonly icons: Phaser.GameObjects.Image[] = [];
  private readonly counts: Phaser.GameObjects.Text[] = [];
  private chest: InventoryState | null = null;
  private onDeposit?: (slotIndex: number) => void;
  private onWithdraw?: (slotIndex: number) => void;

  constructor(scene: Phaser.Scene, depth: number, slotCount: number) {
    const rows = Math.ceil(slotCount / COLS);
    const gridW = COLS * SLOT_SIZE + (COLS - 1) * GAP;
    const gridH = rows * SLOT_SIZE + (rows - 1) * GAP;
    const panelW = gridW + 48;
    const panelH = gridH + 90;
    const cx = scene.scale.width / 2;
    const cy = scene.scale.height / 2;

    this.root = scene.add.container(0, 0).setDepth(depth).setVisible(false);
    const panel = scene.add.rectangle(cx, cy, panelW, panelH, 0x241d17, 0.95).setStrokeStyle(2, 0xc9a66b);
    const title = scene.add
      .text(cx, cy - panelH / 2 + 22, 'Rương', { fontFamily: 'sans-serif', fontSize: '18px', color: '#fff6e0' })
      .setOrigin(0.5);
    this.nameText = scene.add
      .text(cx, cy + panelH / 2 - 22, 'Bấm ô trống để cất, ô có đồ để lấy ra', {
        fontFamily: 'sans-serif',
        fontSize: '12px',
        color: '#d8c8a8',
      })
      .setOrigin(0.5);
    this.root.add([panel, title, this.nameText]);

    const gridX = cx - gridW / 2 + SLOT_SIZE / 2;
    const gridY = cy - gridH / 2 + SLOT_SIZE / 2 + 4;
    for (let i = 0; i < slotCount; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = gridX + col * (SLOT_SIZE + GAP);
      const y = gridY + row * (SLOT_SIZE + GAP);
      const box = scene.add.rectangle(x, y, SLOT_SIZE, SLOT_SIZE, 0x3a2f24, 0.9).setStrokeStyle(2, 0x6b5a46);
      box.setInteractive({ useHandCursor: true });
      box.on('pointerdown', () => this.handleClick(i));
      const icon = scene.add.image(x, y, iconTextureKey('wood')).setVisible(false).setDisplaySize(26, 26);
      const count = scene.add
        .text(x + SLOT_SIZE / 2 - 3, y + SLOT_SIZE / 2 - 3, '', { fontFamily: 'sans-serif', fontSize: '11px', color: '#ffffff' })
        .setOrigin(1, 1)
        .setShadow(1, 1, '#000000', 2, false, true);
      this.root.add([box, icon, count]);
      this.slotBoxes.push(box);
      this.icons.push(icon);
      this.counts.push(count);
    }
  }

  bind(onDeposit: (slotIndex: number) => void, onWithdraw: (slotIndex: number) => void): void {
    this.onDeposit = onDeposit;
    this.onWithdraw = onWithdraw;
  }

  open(chest: InventoryState): void {
    this.chest = chest;
    this.root.setVisible(true);
    this.refresh(chest);
  }

  close(): void {
    this.root.setVisible(false);
    this.chest = null;
  }

  get isOpen(): boolean {
    return this.root.visible;
  }

  refresh(chest: InventoryState): void {
    this.chest = chest;
    for (let i = 0; i < this.slotBoxes.length; i++) {
      const stack = itemAt(chest, i);
      if (stack) {
        this.icons[i].setVisible(true).setTexture(iconTextureKey(stack.itemId));
        this.counts[i].setText(stack.quantity > 1 ? String(stack.quantity) : '');
      } else {
        this.icons[i].setVisible(false);
        this.counts[i].setText('');
      }
    }
  }

  private handleClick(slotIndex: number): void {
    if (!this.chest) return;
    if (itemAt(this.chest, slotIndex)) this.onWithdraw?.(slotIndex);
    else this.onDeposit?.(slotIndex);
  }
}
