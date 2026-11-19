import Phaser from 'phaser';
import { ITEMS } from '../data/items';
import { RECIPES, STATION_NAMES, type RecipeId, type Station } from '../data/recipes';
import { canCraft, ingredientStatus, recipesFor, stationAllows } from '../systems/CraftingSystem';
import type { InventoryState } from '../systems/InventorySystem';
import { iconTextureKey } from './itemIcons';
import { inkText, UI_COLORS, UI_FONT } from './uiStyle';
import { woodPanel, skinButton } from './uiSkin';

const W = 640;
const H = 420;
const LIST_W = 220;
const ROW_H = 40;
const MAX_INGREDIENTS = 4;

interface IngredientRow {
  icon: Phaser.GameObjects.Image;
  name: Phaser.GameObjects.Text;
  count: Phaser.GameObjects.Text;
  status: Phaser.GameObjects.Text;
}

/**
 * Crafting at a bench. Left: every recipe (ones this bench can't make are
 * greyed out with the bench they need). Right: the selected recipe — what it
 * makes, and for each ingredient how many you have, need and are missing.
 */
export class CraftingMenu {
  private readonly root: Phaser.GameObjects.Container;
  private readonly title: Phaser.GameObjects.Text;
  private readonly rows: { box: Phaser.GameObjects.Rectangle; icon: Phaser.GameObjects.Image; name: Phaser.GameObjects.Text }[] = [];
  private readonly detailIcon: Phaser.GameObjects.Image;
  private readonly detailName: Phaser.GameObjects.Text;
  private readonly detailDesc: Phaser.GameObjects.Text;
  private readonly ingredientRows: IngredientRow[] = [];
  private readonly craftBox: Phaser.GameObjects.Rectangle;
  private readonly craftText: Phaser.GameObjects.Text;
  private readonly note: Phaser.GameObjects.Text;
  private station: Station = 'rough';
  private order: RecipeId[] = [];
  private selected: RecipeId | null = null;
  private getInventory?: () => InventoryState;
  private onCraft?: (recipeId: RecipeId) => void;
  onClosed?: () => void;

  constructor(scene: Phaser.Scene, depth: number) {
    const cx = scene.scale.width / 2;
    const cy = scene.scale.height / 2;
    const left = cx - W / 2;
    const top = cy - H / 2;
    this.root = scene.add.container(0, 0).setDepth(depth).setVisible(false);
    const panel = woodPanel(scene, left, top, W, H);
    const g = scene.add.graphics();
    g.fillStyle(UI_COLORS.parchmentDark, 1).fillRect(left + LIST_W + 10, top + 52, 2, H - 70);
    this.title = inkText(scene, cx, top + 28, '', 19).setOrigin(0.5);
    const close = scene.add.rectangle(left + W - 30, top + 28, 30, 28, UI_COLORS.wood).setStrokeStyle(2, UI_COLORS.edge).setInteractive({ useHandCursor: true });
    close.on('pointerdown', () => this.close());
    const closeArt = skinButton(close);
    this.root.add([panel, g, this.title, close, ...(closeArt ? [closeArt] : []), scene.add.text(close.x, close.y, '✕', { fontFamily: UI_FONT, fontSize: '15px', color: '#fff2d0' }).setOrigin(0.5)]);

    // Recipe list
    for (let i = 0; i < 8; i++) {
      const y = top + 70 + i * ROW_H;
      const box = scene.add.rectangle(left + 14 + LIST_W / 2, y, LIST_W - 8, ROW_H - 4, UI_COLORS.parchment).setStrokeStyle(2, UI_COLORS.parchmentDark).setInteractive({ useHandCursor: true });
      const icon = scene.add.image(left + 34, y, iconTextureKey('wood')).setDisplaySize(26, 26);
      const name = scene.add.text(left + 54, y, '', { fontFamily: UI_FONT, fontSize: '13px', color: UI_COLORS.ink, fontStyle: 'bold' }).setOrigin(0, 0.5);
      box.on('pointerdown', () => this.select(i));
      this.rows.push({ box, icon, name });
      this.root.add([box, icon, name]);
    }

    // Detail panel
    const dx = left + LIST_W + 30;
    this.detailIcon = scene.add.image(dx + 24, top + 82, iconTextureKey('wood')).setDisplaySize(44, 44);
    this.detailName = inkText(scene, dx + 58, top + 70, '', 18);
    this.detailDesc = scene.add.text(dx + 58, top + 94, '', { fontFamily: UI_FONT, fontSize: '12px', color: UI_COLORS.inkSoft, wordWrap: { width: W - LIST_W - 110 } });
    const needLabel = inkText(scene, dx, top + 150, 'Nguyên liệu cần:', 14);
    this.root.add([this.detailIcon, this.detailName, this.detailDesc, needLabel]);
    for (let i = 0; i < MAX_INGREDIENTS; i++) {
      const y = top + 186 + i * 36;
      const icon = scene.add.image(dx + 14, y, iconTextureKey('wood')).setDisplaySize(24, 24);
      const name = scene.add.text(dx + 34, y, '', { fontFamily: UI_FONT, fontSize: '14px', color: UI_COLORS.ink }).setOrigin(0, 0.5);
      const count = scene.add.text(dx + 160, y, '', { fontFamily: UI_FONT, fontSize: '14px', color: UI_COLORS.ink, fontStyle: 'bold' }).setOrigin(0, 0.5);
      const status = scene.add.text(dx + 290, y, '', { fontFamily: UI_FONT, fontSize: '13px', fontStyle: 'bold' }).setOrigin(0, 0.5);
      this.ingredientRows.push({ icon, name, count, status });
      this.root.add([icon, name, count, status]);
    }
    this.note = scene.add.text(dx, top + H - 92, '', { fontFamily: UI_FONT, fontSize: '13px', color: '#a8402c', fontStyle: 'bold' });
    this.craftBox = scene.add.rectangle(dx + 170, top + H - 46, 220, 40, 0x4e7a3a).setStrokeStyle(3, UI_COLORS.edge).setInteractive({ useHandCursor: true });
    this.craftText = scene.add.text(this.craftBox.x, this.craftBox.y, '', { fontFamily: UI_FONT, fontSize: '16px', color: '#fff2d0', fontStyle: 'bold' }).setOrigin(0.5);
    this.craftBox.on('pointerdown', () => {
      if (this.selected && this.canMakeSelected()) this.onCraft?.(this.selected);
    });
    this.root.add([this.note, this.craftBox, this.craftText]);
  }

  bind(getInventory: () => InventoryState, onCraft: (recipeId: RecipeId) => void): void {
    this.getInventory = getInventory;
    this.onCraft = onCraft;
  }

  open(station: Station): void {
    this.station = station;
    this.order = recipesFor(station);
    this.title.setText(`${STATION_NAMES[station]} — Chế tạo`);
    this.selected = this.order[0] ?? null;
    this.root.setVisible(true);
    this.refresh();
  }

  close(): void {
    this.root.setVisible(false);
    this.onClosed?.();
  }

  get isOpen(): boolean {
    return this.root.visible;
  }

  private select(i: number): void {
    const id = this.order[i];
    if (!id) return;
    this.selected = id;
    this.refresh();
  }

  private canMakeSelected(): boolean {
    const inv = this.getInventory?.();
    return !!inv && !!this.selected && stationAllows(this.station, this.selected) && canCraft(inv, this.selected);
  }

  refresh(): void {
    const inv = this.getInventory?.();
    if (!inv) return;
    this.rows.forEach((row, i) => {
      const id = this.order[i];
      [row.box, row.icon, row.name].forEach((o) => o.setVisible(!!id));
      if (!id) return;
      const allowed = stationAllows(this.station, id);
      const ready = allowed && canCraft(inv, id);
      row.icon.setTexture(iconTextureKey(RECIPES[id].resultItemId)).setAlpha(allowed ? 1 : 0.4);
      row.name.setText(`${RECIPES[id].name}${ready ? '  ✓' : ''}`).setAlpha(allowed ? 1 : 0.5);
      row.box.setFillStyle(id === this.selected ? 0xffefc0 : UI_COLORS.parchment).setStrokeStyle(2, id === this.selected ? 0xb0402c : UI_COLORS.parchmentDark);
    });

    const id = this.selected;
    if (!id) return;
    const recipe = RECIPES[id];
    this.detailIcon.setTexture(iconTextureKey(recipe.resultItemId));
    this.detailName.setText(recipe.resultQty > 1 ? `${recipe.name} x${recipe.resultQty}` : recipe.name);
    this.detailDesc.setText(ITEMS[recipe.resultItemId].description);
    const status = ingredientStatus(inv, id);
    this.ingredientRows.forEach((row, i) => {
      const s = status[i];
      [row.icon, row.name, row.count, row.status].forEach((o) => o.setVisible(!!s));
      if (!s) return;
      row.icon.setTexture(iconTextureKey(s.itemId));
      row.name.setText(ITEMS[s.itemId].name);
      row.count.setText(`có ${s.have} / cần ${s.need}`);
      row.status.setText(s.missing > 0 ? `thiếu ${s.missing}` : '✓ đủ').setColor(s.missing > 0 ? '#b8322a' : '#3e7a2e');
    });
    const allowed = stationAllows(this.station, id);
    const missing = status.filter((s) => s.missing > 0).length;
    this.note.setText(!allowed ? `Cần ${STATION_NAMES[recipe.station]} để làm món này.` : missing ? `Còn thiếu ${missing} loại nguyên liệu.` : '');
    const ok = allowed && missing === 0;
    this.craftBox.setFillStyle(ok ? 0x4e7a3a : 0x6a5a4a);
    this.craftText.setText(ok ? 'Chế tạo' : allowed ? 'Chưa đủ nguyên liệu' : 'Cần bàn tốt hơn');
  }
}
