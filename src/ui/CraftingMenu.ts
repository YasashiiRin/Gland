import Phaser from 'phaser';
import { RECIPE_IDS, RECIPES, type RecipeId } from '../data/recipes';
import { ITEMS } from '../data/items';
import { canCraft } from '../systems/CraftingSystem';
import type { InventoryState } from '../systems/InventorySystem';
import { iconTextureKey } from './itemIcons';

const ROW_HEIGHT = 46;

/** Crafting menu (opened with "C"): lists every known recipe, craft one at a time. */
export class CraftingMenu {
  private readonly root: Phaser.GameObjects.Container;
  private readonly rows: {
    icon: Phaser.GameObjects.Image;
    name: Phaser.GameObjects.Text;
    cost: Phaser.GameObjects.Text;
    button: Phaser.GameObjects.Rectangle;
    buttonText: Phaser.GameObjects.Text;
  }[] = [];
  private getInventory?: () => InventoryState;
  private onCraft?: (recipeId: RecipeId) => void;

  constructor(scene: Phaser.Scene, depth: number) {
    const panelW = 380;
    const panelH = 70 + RECIPE_IDS.length * ROW_HEIGHT + 20;
    const cx = scene.scale.width / 2;
    const cy = scene.scale.height / 2;
    const top = cy - panelH / 2;

    this.root = scene.add.container(0, 0).setDepth(depth).setVisible(false);
    const panel = scene.add.rectangle(cx, cy, panelW, panelH, 0x241d17, 0.95).setStrokeStyle(2, 0xc9a66b);
    const title = scene.add
      .text(cx, top + 24, 'Chế tạo (C để đóng)', { fontFamily: 'sans-serif', fontSize: '18px', color: '#fff6e0' })
      .setOrigin(0.5);
    const closeBox = scene.add
      .rectangle(cx, top + panelH - 28, 100, 32, 0x3a2f24, 0.9)
      .setStrokeStyle(2, 0xc9a66b)
      .setInteractive({ useHandCursor: true });
    const closeText = scene.add
      .text(cx, top + panelH - 28, 'Đóng', { fontFamily: 'sans-serif', fontSize: '14px', color: '#fff6e0' })
      .setOrigin(0.5);
    closeBox.on('pointerdown', () => this.close());
    this.root.add([panel, title, closeBox, closeText]);

    RECIPE_IDS.forEach((recipeId, i) => {
      const y = top + 60 + i * ROW_HEIGHT;
      const recipe = RECIPES[recipeId];
      const icon = scene.add.image(cx - panelW / 2 + 32, y, iconTextureKey(recipe.resultItemId)).setDisplaySize(28, 28);
      const name = scene.add
        .text(cx - panelW / 2 + 56, y - 9, recipe.name, { fontFamily: 'sans-serif', fontSize: '14px', color: '#fff6e0' })
        .setOrigin(0, 0.5);
      const costText = recipe.ingredients.map((ing) => `${ing.qty} ${ITEMS[ing.itemId].name}`).join(', ');
      const cost = scene.add
        .text(cx - panelW / 2 + 56, y + 9, costText, { fontFamily: 'sans-serif', fontSize: '12px', color: '#d8c8a8' })
        .setOrigin(0, 0.5);
      const button = scene.add
        .rectangle(cx + panelW / 2 - 46, y, 72, 30, 0x3a5f3a, 0.9)
        .setStrokeStyle(2, 0x8fd98f)
        .setInteractive({ useHandCursor: true });
      const buttonText = scene.add
        .text(button.x, button.y, 'Chế tạo', { fontFamily: 'sans-serif', fontSize: '12px', color: '#fff6e0' })
        .setOrigin(0.5);
      button.on('pointerdown', () => this.onCraft?.(recipeId));
      this.root.add([icon, name, cost, button, buttonText]);
      this.rows.push({ icon, name, cost, button, buttonText });
    });
  }

  bind(getInventory: () => InventoryState, onCraft: (recipeId: RecipeId) => void): void {
    this.getInventory = getInventory;
    this.onCraft = onCraft;
  }

  open(): void {
    this.root.setVisible(true);
    this.refresh();
  }

  close(): void {
    this.root.setVisible(false);
  }

  get isOpen(): boolean {
    return this.root.visible;
  }

  refresh(): void {
    if (!this.getInventory) return;
    const inventory = this.getInventory();
    RECIPE_IDS.forEach((recipeId, i) => {
      const ok = canCraft(inventory, recipeId);
      const row = this.rows[i];
      row.button.setFillStyle(ok ? 0x3a5f3a : 0x4a3a3a, 0.9);
      row.button.setStrokeStyle(2, ok ? 0x8fd98f : 0x8a6a6a);
    });
  }
}

