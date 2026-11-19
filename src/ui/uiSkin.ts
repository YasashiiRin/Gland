import Phaser from 'phaser';
import { drawWoodPanel } from './uiStyle';

/**
 * The painted UI skin (assets/ui/*.png, loaded as "ui_<name>" by the sprite
 * pack, see scripts/art/import_extras.py). Every helper falls back to the
 * code-drawn look when its picture is missing, so the game runs without them.
 */
export const SKIN = {
  panel: 'ui_panel_wood',
  button: 'ui_button',
  buttonHover: 'ui_button_hover',
  slot: 'ui_slot',
  slotSelected: 'ui_slot_selected',
  dayDial: 'ui_day_dial',
  barFrame: 'ui_bar_frame',
  touchButton: 'ui_touch_button',
  joystickBase: 'ui_joystick_base',
  joystickKnob: 'ui_joystick_knob',
  minimapFrame: 'ui_minimap_frame',
  gear: 'ui_gear',
  title: 'ui_title_background',
} as const;

/** Corner sizes of the stretchable pictures (screen px), kept unscaled when the piece grows. */
const PANEL_CORNER = 16;
const BUTTON_CORNER_X = 10;
const BUTTON_CORNER_Y = 8;
const SLOT_CORNER = 8;

export function hasSkin(scene: Phaser.Scene, key: string): boolean {
  return scene.textures.exists(key);
}

/** A wooden panel with a parchment inset: the painted frame stretched to size, or the drawn one. */
export function woodPanel(scene: Phaser.Scene, x: number, y: number, w: number, h: number, inset = true): Phaser.GameObjects.GameObject {
  if (hasSkin(scene, SKIN.panel)) return slice(scene, SKIN.panel, x, y, w, h, PANEL_CORNER, PANEL_CORNER).setOrigin(0, 0);
  const g = scene.add.graphics();
  drawWoodPanel(g, x, y, w, h, inset);
  return g;
}

function slice(scene: Phaser.Scene, key: string, x: number, y: number, w: number, h: number, cx: number, cy: number): Phaser.GameObjects.NineSlice {
  return scene.add.nineslice(x, y, key, undefined, w, h, cx, cx, cy, cy);
}

/**
 * Paints a clickable rectangle as a wooden button: the boards sit over the
 * (still interactive) rectangle, the light one showing under the pointer.
 * Add the returned group to the same container right after `box`, before the
 * label. Null when there is no button picture.
 */
export function skinButton(box: Phaser.GameObjects.Rectangle, enabled = true): Phaser.GameObjects.Container | null {
  const scene = box.scene;
  if (!hasSkin(scene, SKIN.button)) return null;
  const make = (key: string) =>
    slice(scene, key, box.x, box.y, box.width, box.height, BUTTON_CORNER_X, BUTTON_CORNER_Y).setOrigin(box.originX, box.originY);
  const art = make(SKIN.button);
  const group = scene.add.container(0, 0, [art]).setDepth(box.depth);
  if (!enabled) art.setTint(0x8a7a6a);
  else if (hasSkin(scene, SKIN.buttonHover)) {
    const hover = make(SKIN.buttonHover).setVisible(false);
    group.add(hover);
    box.on('pointerover', () => hover.setVisible(true));
    box.on('pointerout', () => hover.setVisible(false));
  }
  box.once(Phaser.GameObjects.Events.DESTROY, () => group.destroy());
  return group;
}

/** An item slot (plain and chosen pictures) centred at (x, y), or null (the caller draws its rectangle). */
export interface SkinSlot {
  group: Phaser.GameObjects.Container;
  setSelected(selected: boolean): void;
  /** Greyed out (a locked bag slot). */
  setDim(dim: boolean): void;
}

export function skinSlot(scene: Phaser.Scene, x: number, y: number, size: number): SkinSlot | null {
  if (!hasSkin(scene, SKIN.slot)) return null;
  const plain = slice(scene, SKIN.slot, x, y, size, size, SLOT_CORNER, SLOT_CORNER);
  const chosen = hasSkin(scene, SKIN.slotSelected)
    ? slice(scene, SKIN.slotSelected, x, y, size, size, SLOT_CORNER, SLOT_CORNER).setVisible(false)
    : null;
  const group = scene.add.container(0, 0, chosen ? [plain, chosen] : [plain]);
  return {
    group,
    setSelected(selected: boolean) {
      if (chosen) chosen.setVisible(selected);
      else plain.setTint(selected ? 0xffd890 : 0xffffff);
    },
    setDim(dim: boolean) {
      plain.setTint(dim ? 0x6a5a4a : 0xffffff);
    },
  };
}

/** A round picture (gear, touch button…) of the given diameter, or null. */
export function skinRound(scene: Phaser.Scene, key: string, x: number, y: number, diameter: number): Phaser.GameObjects.Image | null {
  if (!hasSkin(scene, key)) return null;
  return scene.add.image(x, y, key).setDisplaySize(diameter, diameter);
}
