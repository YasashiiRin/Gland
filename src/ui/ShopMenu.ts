import Phaser from 'phaser';
import { ITEMS, type ItemId } from '../data/items';
import { SHOPS, type ShopId } from '../data/shops';
import { iconTextureKey } from './itemIcons';

const ROW_HEIGHT = 44;

/** The seed-shop buying screen: one row per item in stock, buy 1 at a time. */
export class ShopMenu {
  private readonly root: Phaser.GameObjects.Container;
  private readonly moneyText: Phaser.GameObjects.Text;
  private readonly titleText: Phaser.GameObjects.Text;
  private readonly rows: {
    icon: Phaser.GameObjects.Image;
    name: Phaser.GameObjects.Text;
    price: Phaser.GameObjects.Text;
    button: Phaser.GameObjects.Rectangle;
    buttonText: Phaser.GameObjects.Text;
  }[] = [];
  private currentShop: ShopId | null = null;
  private onBuy?: (itemId: ItemId) => void;
  private getMoney?: () => number;

  constructor(scene: Phaser.Scene, depth: number) {
    const maxRows = 6;
    const panelW = 360;
    const panelH = 70 + maxRows * ROW_HEIGHT + 20;
    const cx = scene.scale.width / 2;
    const cy = scene.scale.height / 2;
    const top = cy - panelH / 2;

    this.root = scene.add.container(0, 0).setDepth(depth).setVisible(false);
    const panel = scene.add.rectangle(cx, cy, panelW, panelH, 0x241d17, 0.95).setStrokeStyle(2, 0xc9a66b);
    this.titleText = scene.add
      .text(cx, top + 22, '', { fontFamily: 'sans-serif', fontSize: '18px', color: '#fff6e0' })
      .setOrigin(0.5);
    this.moneyText = scene.add
      .text(cx, top + 44, '', { fontFamily: 'sans-serif', fontSize: '14px', color: '#ffe9a8' })
      .setOrigin(0.5);
    const closeBox = scene.add
      .rectangle(cx, top + panelH - 28, 100, 32, 0x3a2f24, 0.9)
      .setStrokeStyle(2, 0xc9a66b)
      .setInteractive({ useHandCursor: true });
    const closeText = scene.add
      .text(cx, top + panelH - 28, 'Đóng', { fontFamily: 'sans-serif', fontSize: '14px', color: '#fff6e0' })
      .setOrigin(0.5);
    closeBox.on('pointerdown', () => this.close());
    this.root.add([panel, this.titleText, this.moneyText, closeBox, closeText]);

    for (let i = 0; i < maxRows; i++) {
      const y = top + 70 + i * ROW_HEIGHT;
      const icon = scene.add.image(cx - panelW / 2 + 32, y, iconTextureKey('wood')).setDisplaySize(28, 28);
      const name = scene.add
        .text(cx - panelW / 2 + 56, y, '', { fontFamily: 'sans-serif', fontSize: '14px', color: '#fff6e0' })
        .setOrigin(0, 0.5);
      const price = scene.add
        .text(cx + panelW / 2 - 100, y, '', { fontFamily: 'sans-serif', fontSize: '13px', color: '#ffe9a8' })
        .setOrigin(0, 0.5);
      const button = scene.add
        .rectangle(cx + panelW / 2 - 38, y, 60, 28, 0x3a5f3a, 0.9)
        .setStrokeStyle(2, 0x8fd98f)
        .setInteractive({ useHandCursor: true });
      const buttonText = scene.add
        .text(button.x, button.y, 'Mua', { fontFamily: 'sans-serif', fontSize: '13px', color: '#fff6e0' })
        .setOrigin(0.5);
      const row = { icon, name, price, button, buttonText };
      button.on('pointerdown', () => this.handleBuy(i));
      this.root.add([icon, name, price, button, buttonText]);
      this.rows.push(row);
    }
  }

  bind(getMoney: () => number, onBuy: (itemId: ItemId) => void): void {
    this.getMoney = getMoney;
    this.onBuy = onBuy;
  }

  open(shopId: ShopId): void {
    this.currentShop = shopId;
    this.titleText.setText(SHOPS[shopId].name);
    this.root.setVisible(true);
    this.refresh();
  }

  close(): void {
    this.root.setVisible(false);
    this.currentShop = null;
  }

  get isOpen(): boolean {
    return this.root.visible;
  }

  refresh(): void {
    if (!this.currentShop || !this.getMoney) return;
    const money = this.getMoney();
    this.moneyText.setText(`Tiền của bạn: ${money.toLocaleString('vi-VN')} ₫`);
    const stock = SHOPS[this.currentShop].stock;
    this.rows.forEach((row, i) => {
      const itemId = stock[i];
      if (!itemId) {
        [row.icon, row.name, row.price, row.button, row.buttonText].forEach((o) => o.setVisible(false));
        return;
      }
      const def = ITEMS[itemId];
      const price = def.sellPrice ?? 0;
      const canAfford = money >= price;
      [row.icon, row.name, row.price, row.button, row.buttonText].forEach((o) => o.setVisible(true));
      row.icon.setTexture(iconTextureKey(itemId));
      row.name.setText(def.name);
      row.price.setText(`${price.toLocaleString('vi-VN')} ₫`);
      row.button.setFillStyle(canAfford ? 0x3a5f3a : 0x4a3a3a, 0.9);
      row.button.setStrokeStyle(2, canAfford ? 0x8fd98f : 0x8a6a6a);
    });
  }

  private handleBuy(rowIndex: number): void {
    if (!this.currentShop) return;
    const itemId = SHOPS[this.currentShop].stock[rowIndex];
    if (!itemId) return;
    this.onBuy?.(itemId);
    this.refresh();
  }
}
