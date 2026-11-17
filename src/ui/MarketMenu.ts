import Phaser from 'phaser';
import { ITEMS, type ItemId } from '../data/items';
import { SHOPS, type ShopId } from '../data/shops';
import type { InventoryState } from '../systems/InventorySystem';
import { marketBuyPrice, marketSellPrice, stallBuys } from '../systems/ShopSystem';
import { artScale } from '../scenes/hd';
import { iconTextureKey } from './itemIcons';
import { UI_COLORS, UI_FONT } from './uiStyle';

const W = 660;
const H = 430;
const COLS = 4;
const TRAYS = 8;
const TRAY_R = 34;

/** Awning stripes per stall, matching the parasols drawn on the map. */
const AWNING: Record<string, [number, number]> = {
  market_fish: [0x3c6eaa, 0xe8e8e0],
  market_veg: [0x508c46, 0xecc446],
  market_rice: [0xb0322c, 0xf0dca0],
};
const VENDOR_SPRITE: Record<string, string> = { market_fish: 'vendor_fish', market_veg: 'vendor_veg', market_rice: 'vendor_rice' };

export interface MarketHandlers {
  getMoney: () => number;
  getInventory: () => InventoryState;
  /** Returns a reaction line for the vendor's speech bubble. */
  buy: (itemId: ItemId) => string;
  sell: (itemId: ItemId, all: boolean) => string;
}

interface Tray {
  circle: Phaser.GameObjects.Arc;
  icon: Phaser.GameObjects.Image;
  name: Phaser.GameObjects.Text;
  tag: Phaser.GameObjects.Text;
  sellAll: Phaser.GameObjects.Text;
}

/**
 * The open-air market screen: a striped tarp awning with a cardboard sign,
 * the vendor and their speech bubble, and goods laid out on round woven
 * trays ("mẹt") with hand-written price tags. Tabs to buy from or sell to
 * the stall; tap a tray to buy/sell one ("Bán hết" sells the whole lot).
 */
export class MarketMenu {
  private readonly root: Phaser.GameObjects.Container;
  private readonly awning: Phaser.GameObjects.Graphics;
  private readonly title: Phaser.GameObjects.Text;
  private readonly vendor: Phaser.GameObjects.Image;
  private readonly bubble: Phaser.GameObjects.Text;
  private readonly money: Phaser.GameObjects.Text;
  private readonly tabs: { box: Phaser.GameObjects.Rectangle; mode: 'buy' | 'sell' }[] = [];
  private readonly trays: Tray[] = [];
  private shop: ShopId | null = null;
  private mode: 'buy' | 'sell' = 'buy';
  private items: ItemId[] = [];
  private handlers?: MarketHandlers;

  constructor(private readonly scene: Phaser.Scene, depth: number) {
    const cx = scene.scale.width / 2;
    const cy = scene.scale.height / 2;
    const left = cx - W / 2;
    const top = cy - H / 2;
    this.root = scene.add.container(0, 0).setDepth(depth).setVisible(false);

    // Woven bamboo mat background.
    const mat = scene.add.graphics();
    mat.fillStyle(UI_COLORS.edge, 1).fillRoundedRect(left - 4, top - 4, W + 8, H + 8, 8);
    mat.fillStyle(0xcfae78, 1).fillRect(left, top + 40, W, H - 40);
    mat.lineStyle(2, 0xb08e5a, 0.6);
    for (let d = -H; d < W; d += 10) {
      mat.lineBetween(left + Math.max(0, d), top + 40 + Math.max(0, -d), left + Math.min(W, d + H - 40), top + 40 + Math.min(H - 40, W - d));
    }
    mat.lineStyle(1, 0xe6c896, 0.5);
    for (let d = 0; d < W + H; d += 10) mat.lineBetween(left + Math.min(W, d), top + 40 + Math.max(0, d - W), left + Math.max(0, d - (H - 40)), top + 40 + Math.min(H - 40, d));
    this.awning = scene.add.graphics();
    const sign = scene.add.rectangle(cx, top + 30, 300, 34, 0xc8a46e).setStrokeStyle(2, 0x7a5a30).setAngle(-1.5);
    this.title = scene.add.text(cx, top + 30, '', { fontFamily: '"Comic Sans MS", "Chalkboard SE", ' + UI_FONT, fontSize: '20px', color: '#3a2410', fontStyle: 'bold' }).setOrigin(0.5).setAngle(-1.5);
    this.root.add([mat, this.awning, sign, this.title]);

    // Vendor and speech bubble.
    const frame = scene.add.rectangle(left + 82, top + 150, 116, 150, 0x8a5a34).setStrokeStyle(3, UI_COLORS.edge);
    const k = artScale(scene, 'vendor_fish'); // HD vendors are drawn at x2
    this.vendor = scene.add.image(left + 82, top + 230, 'vendor_fish').setOrigin(0.5, 1).setScale(5 / k).setCrop(0, 0, 16 * k, 22 * k);
    this.bubble = scene.add
      .text(left + 24, top + 236, '', { fontFamily: UI_FONT, fontSize: '13px', color: '#2b1a10', backgroundColor: '#fffaf0', wordWrap: { width: 132 } })
      .setPadding(8, 6, 8, 6);
    this.money = scene.add.text(left + 24, top + H - 40, '', { fontFamily: UI_FONT, fontSize: '15px', color: '#4a2c18', fontStyle: 'bold', backgroundColor: '#f1ddb0' }).setPadding(6, 3, 6, 3);
    this.root.add([frame, this.vendor, this.bubble, this.money]);

    // Tabs and close button.
    (['buy', 'sell'] as const).forEach((mode, i) => {
      const box = scene.add.rectangle(left + 250 + i * 130, top + 70, 120, 30, UI_COLORS.wood).setStrokeStyle(2, UI_COLORS.edge).setInteractive({ useHandCursor: true });
      const label = scene.add.text(box.x, box.y, mode === 'buy' ? 'Mua hàng' : 'Bán hàng', { fontFamily: UI_FONT, fontSize: '15px', color: '#fff2d0', fontStyle: 'bold' }).setOrigin(0.5);
      box.on('pointerdown', () => this.setMode(mode));
      this.tabs.push({ box, mode });
      this.root.add([box, label]);
    });
    const close = scene.add.rectangle(left + W - 26, top + 70, 34, 30, UI_COLORS.wood).setStrokeStyle(2, UI_COLORS.edge).setInteractive({ useHandCursor: true });
    close.on('pointerdown', () => this.close());
    this.root.add([close, scene.add.text(close.x, close.y, '✕', { fontFamily: UI_FONT, fontSize: '16px', color: '#fff2d0' }).setOrigin(0.5)]);

    // Goods on round woven trays.
    for (let i = 0; i < TRAYS; i++) {
      const x = left + 260 + (i % COLS) * 110;
      const y = top + 150 + Math.floor(i / COLS) * 145;
      const circle = scene.add.circle(x, y, TRAY_R, 0xd8b47c).setStrokeStyle(4, 0x9a7444).setInteractive({ useHandCursor: true });
      const weave = scene.add.circle(x, y, TRAY_R - 9).setStrokeStyle(1, 0xb08e5a);
      const icon = scene.add.image(x, y, iconTextureKey('wood')).setDisplaySize(38, 38);
      const name = scene.add.text(x, y + TRAY_R + 12, '', { fontFamily: UI_FONT, fontSize: '12px', color: '#3a2410', fontStyle: 'bold', align: 'center' }).setOrigin(0.5);
      const tag = scene.add
        .text(x + 26, y - 30, '', { fontFamily: '"Comic Sans MS", ' + UI_FONT, fontSize: '12px', color: '#3a2410', backgroundColor: '#e2c494' })
        .setPadding(4, 2, 4, 2)
        .setOrigin(0.5)
        .setAngle(8);
      const sellAll = scene.add
        .text(x, y + TRAY_R + 32, 'Bán hết', { fontFamily: UI_FONT, fontSize: '12px', color: '#fff2d0', backgroundColor: '#8a5a34' })
        .setPadding(6, 2, 6, 2)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      circle.on('pointerdown', () => this.tapTray(i, false));
      sellAll.on('pointerdown', () => this.tapTray(i, true));
      this.trays.push({ circle, icon, name, tag, sellAll });
      this.root.add([circle, weave, icon, name, tag, sellAll]);
    }
    this.root.add(scene.add.text(left + 250, top + H - 34, 'Bấm vào mẹt hàng để mua / bán 1 món', { fontFamily: UI_FONT, fontSize: '12px', color: '#4a2c18' }));
  }

  bind(handlers: MarketHandlers): void {
    this.handlers = handlers;
  }

  get isOpen(): boolean {
    return this.root.visible;
  }

  open(shopId: ShopId): void {
    this.shop = shopId;
    const def = SHOPS[shopId];
    this.title.setText(def.name);
    this.vendor.setTexture(VENDOR_SPRITE[shopId] ?? 'vendor_fish');
    this.drawAwning(AWNING[shopId] ?? [0x3c6eaa, 0xe8e8e0]);
    this.say(def.greeting ?? 'Mua gì đi con!');
    this.setMode('buy');
    this.root.setVisible(true);
  }

  close(): void {
    this.root.setVisible(false);
    this.shop = null;
    this.onClosed?.();
  }

  /** UIScene hooks this to clear its "shop open" flag when ✕ is pressed. */
  onClosed?: () => void;

  private drawAwning([a, b]: [number, number]): void {
    const cx = this.scene.scale.width / 2;
    const left = cx - W / 2;
    const top = this.scene.scale.height / 2 - H / 2;
    const g = this.awning.clear();
    for (let x = 0; x < W; x += 30) {
      g.fillStyle(x % 60 === 0 ? a : b, 1).fillRect(left + x, top, Math.min(30, W - x), 44);
      g.fillCircle(left + x + 15, top + 44, 15); // scalloped edge
    }
  }

  private setMode(mode: 'buy' | 'sell'): void {
    this.mode = mode;
    this.tabs.forEach((t) => t.box.setFillStyle(t.mode === mode ? UI_COLORS.woodLight : UI_COLORS.wood));
    this.refresh();
  }

  private say(text: string): void {
    this.bubble.setText(text);
  }

  refresh(): void {
    if (!this.shop || !this.handlers) return;
    const shop = SHOPS[this.shop];
    const inv = this.handlers.getInventory();
    const owned = (id: ItemId) => inv.slots.reduce((n, s) => n + (s?.itemId === id ? s.quantity : 0), 0);
    this.items =
      this.mode === 'buy'
        ? shop.stock.slice(0, TRAYS)
        : [...new Set(inv.slots.filter((s) => s && stallBuys(shop, s.itemId)).map((s) => s!.itemId))].slice(0, TRAYS);
    this.money.setText(`Tiền: ${this.handlers.getMoney().toLocaleString('vi-VN')} ₫`);
    this.trays.forEach((t, i) => {
      const id = this.items[i];
      const show = !!id;
      [t.circle, t.icon, t.name, t.tag].forEach((o) => o.setVisible(show));
      t.sellAll.setVisible(show && this.mode === 'sell');
      if (!id) return;
      t.icon.setTexture(iconTextureKey(id));
      const price = this.mode === 'buy' ? marketSellPrice(shop, id) : marketBuyPrice(shop, id);
      t.tag.setText(`${price.toLocaleString('vi-VN')}đ`);
      t.name.setText(this.mode === 'buy' ? ITEMS[id].name : `${ITEMS[id].name}\n(có ${owned(id)})`);
    });
    if (this.mode === 'sell' && this.items.length === 0) this.say('Con chưa có món nào sạp này thu mua hết.');
  }

  private tapTray(i: number, all: boolean): void {
    const id = this.items[i];
    if (!id || !this.handlers) return;
    this.say(this.mode === 'buy' ? this.handlers.buy(id) : this.handlers.sell(id, all));
    this.refresh();
  }
}
