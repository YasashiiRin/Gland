import Phaser from 'phaser';
import { touchInput } from '../state/touchInput';
import { UI_COLORS, UI_FONT } from './uiStyle';
import { SKIN, skinButton, skinRound } from './uiSkin';

const STICK_X = 92;
const STICK_R = 46;
const KNOB_R = 20;
/** How far (as a fraction of the stick radius) the thumb must move before it counts as a direction. */
const DEAD_ZONE = 0.3;

export interface TouchHandlers {
  onInventory: () => void;
  onCrafting: () => void;
  onClose: () => void;
}

/**
 * On-screen controls for phones: a virtual joystick (bottom-left) and round
 * buttons (bottom-right) for use / interact / bag / crafting, plus a close
 * button while a menu is open. Supports several fingers at once.
 */
export class TouchControls {
  private readonly root: Phaser.GameObjects.Container;
  private readonly knob: Phaser.GameObjects.Arc;
  /** The painted knob following the drawn one, when the UI skin is there. */
  private readonly knobArt: Phaser.GameObjects.Image | null;
  private readonly closeButton: Phaser.GameObjects.Container;
  private readonly stickY: number;
  private stickPointer: number | null = null;
  /** The joystick, moved/resized as one block (see LayoutHost). */
  private readonly stick: Phaser.GameObjects.Container;
  /** Each block the player may move, resize or hide: the stick and every button. */
  readonly elements: { id: string; label: string; node: Phaser.GameObjects.Container }[] = [];

  constructor(private readonly scene: Phaser.Scene, depth: number, handlers: TouchHandlers) {
    const { width, height } = scene.scale;
    scene.input.addPointer(2); // joystick + a button at the same time
    this.stickY = height - 96;
    this.root = scene.add.container(0, 0).setDepth(depth);
    this.stick = scene.add.container(0, 0);
    this.root.add(this.stick);
    this.elements.push({ id: 'touch_stick', label: 'Cần điều khiển', node: this.stick });

    const base = scene.add.circle(STICK_X, this.stickY, STICK_R, UI_COLORS.edge, 0.35).setStrokeStyle(3, UI_COLORS.parchment, 0.6);
    this.knob = scene.add.circle(STICK_X, this.stickY, KNOB_R, UI_COLORS.parchment, 0.75).setStrokeStyle(2, UI_COLORS.edge);
    // A generous invisible pad so the thumb doesn't have to land exactly on the stick.
    const pad = scene.add.zone(0, height - 230, 210, 230).setOrigin(0, 0).setInteractive();
    pad.on('pointerdown', (p: Phaser.Input.Pointer) => {
      this.stickPointer = p.id;
      this.moveStick(p);
    });
    scene.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (p.id === this.stickPointer) this.moveStick(p);
    });
    const release = (p: Phaser.Input.Pointer) => {
      if (p.id === this.stickPointer) this.resetStick();
    };
    scene.input.on('pointerup', release);
    scene.input.on('pointerupoutside', release);
    // Painted stick: the drawn circles stay (nearly invisible) underneath.
    const baseArt = skinRound(scene, SKIN.joystickBase, STICK_X, this.stickY, STICK_R * 2 + 8);
    this.knobArt = skinRound(scene, SKIN.joystickKnob, STICK_X, this.stickY, KNOB_R * 2 + 4);
    if (baseArt) base.setAlpha(0.01);
    if (this.knobArt) this.knob.setAlpha(0.01);
    this.stick.add([base, ...(baseArt ? [baseArt] : []), this.knob, ...(this.knobArt ? [this.knobArt] : []), pad]);

    this.button('touch_use', 'Nút Dùng', width - 112, height - 82, 32, 'Dùng', () => (touchInput.useQueued = true));
    this.button('touch_interact', 'Nút Tương tác', width - 62, height - 148, 26, 'Tương\ntác', () => (touchInput.interactQueued = true));
    this.button('touch_bag', 'Nút Túi', width - 170, height - 150, 21, 'Túi', handlers.onInventory);
    this.button('touch_craft', 'Nút Chế tạo', width - 122, height - 200, 21, 'Chế\ntạo', handlers.onCrafting);

    this.closeButton = scene.add.container(width / 2, 26).setDepth(depth + 10).setVisible(false);
    const closeBox = scene.add.rectangle(0, 0, 120, 34, UI_COLORS.wood).setStrokeStyle(3, UI_COLORS.edge).setInteractive();
    closeBox.on('pointerdown', handlers.onClose);
    const closeArt = skinButton(closeBox);
    this.closeButton.add([closeBox, ...(closeArt ? [closeArt] : []), scene.add.text(0, 0, '✕ Đóng', { fontFamily: UI_FONT, fontSize: '16px', color: '#fff2d0', fontStyle: 'bold' }).setOrigin(0.5).setStroke('#2b1a10', 3)]);
  }

  private button(id: string, name: string, x: number, y: number, r: number, label: string, onTap: () => void): void {
    const circle = this.scene.add.circle(x, y, r, UI_COLORS.wood, 0.85).setStrokeStyle(3, UI_COLORS.edge).setInteractive();
    const text = this.scene.add
      .text(x, y, label, { fontFamily: UI_FONT, fontSize: r > 26 ? '15px' : '12px', color: '#fff2d0', fontStyle: 'bold', align: 'center' })
      .setOrigin(0.5)
      .setStroke('#2b1a10', 3);
    const art = skinRound(this.scene, SKIN.touchButton, x, y, r * 2 + 4);
    circle.on('pointerdown', () => {
      circle.setFillStyle(UI_COLORS.woodLight, art ? 0.01 : 0.95);
      art?.setTint(0xffe0b0);
      onTap();
    });
    const up = () => {
      circle.setFillStyle(UI_COLORS.wood, art ? 0.01 : 0.85);
      art?.clearTint();
    };
    circle.on('pointerup', up);
    circle.on('pointerout', up);
    if (art) circle.setFillStyle(UI_COLORS.wood, 0.01).setStrokeStyle(0);
    const node = this.scene.add.container(0, 0, [circle, ...(art ? [art] : []), text]);
    this.root.add(node);
    this.elements.push({ id, label: name, node });
  }

  private moveStick(p: Phaser.Input.Pointer): void {
    // The stick block may have been moved/resized: work in its own coordinates.
    const c = this.stick;
    const dx = (p.x - c.x) / c.scaleX - STICK_X;
    const dy = (p.y - c.y) / c.scaleY - this.stickY;
    const dist = Math.min(STICK_R, Math.hypot(dx, dy));
    const angle = Math.atan2(dy, dx);
    this.knob.setPosition(STICK_X + Math.cos(angle) * dist, this.stickY + Math.sin(angle) * dist);
    this.knobArt?.setPosition(this.knob.x, this.knob.y);
    const nx = (Math.cos(angle) * dist) / STICK_R;
    const ny = (Math.sin(angle) * dist) / STICK_R;
    touchInput.left = nx < -DEAD_ZONE;
    touchInput.right = nx > DEAD_ZONE;
    touchInput.up = ny < -DEAD_ZONE;
    touchInput.down = ny > DEAD_ZONE;
  }

  private resetStick(): void {
    this.stickPointer = null;
    this.knob.setPosition(STICK_X, this.stickY);
    this.knobArt?.setPosition(STICK_X, this.stickY);
    touchInput.up = touchInput.down = touchInput.left = touchInput.right = false;
  }

  /** Called every frame: show/hide, and offer "close" while a menu is open (`editing`: shown for the layout editor). */
  update(visible: boolean, menuOpen: boolean, editing = false): void {
    this.root.setVisible(editing || (visible && !menuOpen));
    this.closeButton.setVisible(!editing && visible && menuOpen);
    if (!visible || menuOpen) {
      if (this.stickPointer !== null) this.resetStick();
    }
  }
}
