import Phaser from 'phaser';
import { touchInput } from '../state/touchInput';
import { UI_COLORS, UI_FONT } from './uiStyle';

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
  private readonly closeButton: Phaser.GameObjects.Container;
  private readonly stickY: number;
  private stickPointer: number | null = null;

  constructor(private readonly scene: Phaser.Scene, depth: number, handlers: TouchHandlers) {
    const { width, height } = scene.scale;
    scene.input.addPointer(2); // joystick + a button at the same time
    this.stickY = height - 96;
    this.root = scene.add.container(0, 0).setDepth(depth);

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
    this.root.add([base, this.knob, pad]);

    this.button(width - 112, height - 82, 32, 'Dùng', () => (touchInput.useQueued = true));
    this.button(width - 62, height - 148, 26, 'Tương\ntác', () => (touchInput.interactQueued = true));
    this.button(width - 170, height - 150, 21, 'Túi', handlers.onInventory);
    this.button(width - 122, height - 200, 21, 'Chế\ntạo', handlers.onCrafting);

    this.closeButton = scene.add.container(width / 2, 26).setDepth(depth + 10).setVisible(false);
    const closeBox = scene.add.rectangle(0, 0, 120, 34, UI_COLORS.wood).setStrokeStyle(3, UI_COLORS.edge).setInteractive();
    closeBox.on('pointerdown', handlers.onClose);
    this.closeButton.add([closeBox, scene.add.text(0, 0, '✕ Đóng', { fontFamily: UI_FONT, fontSize: '16px', color: '#fff2d0', fontStyle: 'bold' }).setOrigin(0.5)]);
  }

  private button(x: number, y: number, r: number, label: string, onTap: () => void): void {
    const circle = this.scene.add.circle(x, y, r, UI_COLORS.wood, 0.85).setStrokeStyle(3, UI_COLORS.edge).setInteractive();
    const text = this.scene.add
      .text(x, y, label, { fontFamily: UI_FONT, fontSize: r > 26 ? '15px' : '12px', color: '#fff2d0', fontStyle: 'bold', align: 'center' })
      .setOrigin(0.5);
    circle.on('pointerdown', () => {
      circle.setFillStyle(UI_COLORS.woodLight, 0.95);
      onTap();
    });
    const up = () => circle.setFillStyle(UI_COLORS.wood, 0.85);
    circle.on('pointerup', up);
    circle.on('pointerout', up);
    this.root.add([circle, text]);
  }

  private moveStick(p: Phaser.Input.Pointer): void {
    const dx = p.x - STICK_X;
    const dy = p.y - this.stickY;
    const dist = Math.min(STICK_R, Math.hypot(dx, dy));
    const angle = Math.atan2(dy, dx);
    this.knob.setPosition(STICK_X + Math.cos(angle) * dist, this.stickY + Math.sin(angle) * dist);
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
    touchInput.up = touchInput.down = touchInput.left = touchInput.right = false;
  }

  /** Called every frame: show/hide, and offer "close" while a menu is open. */
  update(visible: boolean, menuOpen: boolean): void {
    this.root.setVisible(visible && !menuOpen);
    this.closeButton.setVisible(visible && menuOpen);
    if (!visible || menuOpen) {
      if (this.stickPointer !== null) this.resetStick();
    }
  }
}
