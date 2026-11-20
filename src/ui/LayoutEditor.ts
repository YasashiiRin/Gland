import Phaser from 'phaser';
import { gameState } from '../state/GameState';
import { clampOffset, elementOf, moveElement, scaleElement, toggleHidden } from '../systems/UiLayout';
import type { LayoutHost, LayoutTarget } from './LayoutHost';
import { menuButton, type MenuButton } from './menuButton';
import { UI_FONT } from './uiStyle';

const PICK = 0xf0c060;
const IDLE = 0xfff2d0;

/**
 * "Chỉnh bố cục": every HUD block and phone button gets a frame; drag a
 * frame to move the block, pick one and use − / + to resize it or hide it.
 */
export class LayoutEditor {
  private readonly root: Phaser.GameObjects.Container;
  private readonly frames: { target: LayoutTarget; box: Phaser.GameObjects.Rectangle; label: Phaser.GameObjects.Text }[] = [];
  private readonly picked: Phaser.GameObjects.Text;
  private readonly hideButton: MenuButton;
  private selected: LayoutTarget | null = null;
  private drag: { target: LayoutTarget; dx: number; dy: number; px: number; py: number } | null = null;
  onClosed?: () => void;

  constructor(private readonly scene: Phaser.Scene, depth: number, private readonly host: LayoutHost) {
    const { width, height } = scene.scale;
    this.root = scene.add.container(0, 0).setDepth(depth).setVisible(false);
    for (const target of host.targets) {
      const box = scene.add.rectangle(0, 0, 10, 10, 0xfff2d0, 0.08).setStrokeStyle(2, IDLE, 0.9).setOrigin(0, 0).setInteractive({ useHandCursor: true });
      const label = scene.add
        .text(0, 0, target.label, { fontFamily: UI_FONT, fontSize: '11px', color: '#fff2d0', backgroundColor: '#2b1a10cc' })
        .setPadding(3, 1, 3, 1)
        .setOrigin(0, 1);
      box.on('pointerdown', (p: Phaser.Input.Pointer) => {
        const el = elementOf(gameState.settings.layout, target.id);
        this.select(target);
        this.drag = { target, dx: el.dx, dy: el.dy, px: p.x, py: p.y };
      });
      this.frames.push({ target, box, label });
      this.root.add([box, label]);
    }
    scene.input.on('pointermove', (p: Phaser.Input.Pointer) => this.onMove(p));
    scene.input.on('pointerup', () => (this.drag = null));

    // Tool bar across the middle of the screen.
    const y = height / 2;
    const bar = scene.add.rectangle(width / 2, y, 560, 78, 0x2b1a10, 0.88).setStrokeStyle(2, PICK);
    const help = scene.add
      .text(width / 2, y - 24, 'Kéo khung để di chuyển · chọn một khối rồi bấm − / + để đổi cỡ', { fontFamily: UI_FONT, fontSize: '12px', color: '#fff2d0' })
      .setOrigin(0.5);
    this.picked = scene.add.text(width / 2 - 270, y + 12, '', { fontFamily: UI_FONT, fontSize: '12px', color: '#f8d48a' }).setOrigin(0, 0.5);
    const minus = menuButton(scene, width / 2 - 20, y + 12, 32, '−', () => this.resize(-1));
    const plus = menuButton(scene, width / 2 + 18, y + 12, 32, '+', () => this.resize(1));
    this.hideButton = menuButton(scene, width / 2 + 82, y + 12, 80, 'Ẩn', () => this.toggleHide(), 12);
    const reset = menuButton(scene, width / 2 + 175, y - 2, 96, 'Mặc định', () => this.reset(), 12);
    const done = menuButton(scene, width / 2 + 175, y + 26, 96, 'Xong', () => this.close(), 12);
    this.root.add([bar, help, this.picked, ...minus.parts, ...plus.parts, ...this.hideButton.parts, ...reset.parts, ...done.parts]);
  }

  get isOpen(): boolean {
    return this.root.visible;
  }

  open(): void {
    this.host.editing = true;
    this.host.apply();
    this.root.setVisible(true);
    this.select(null);
  }

  close(): void {
    this.drag = null;
    this.host.editing = false;
    this.host.apply();
    this.root.setVisible(false);
    this.onClosed?.();
  }

  private onMove(p: Phaser.Input.Pointer): void {
    const d = this.drag;
    if (!d || !this.isOpen || !p.isDown) return;
    const { width, height } = this.scene.scale;
    const at = clampOffset(d.target.pivot, d.dx + p.x - d.px, d.dy + p.y - d.py, width, height);
    gameState.settings.layout = moveElement(gameState.settings.layout, d.target.id, at.dx, at.dy);
    this.changed();
  }

  private resize(direction: 1 | -1): void {
    if (!this.selected) return;
    gameState.settings.layout = scaleElement(gameState.settings.layout, this.selected.id, direction);
    this.changed();
  }

  private toggleHide(): void {
    if (!this.selected) return;
    gameState.settings.layout = toggleHidden(gameState.settings.layout, this.selected.id);
    this.changed();
  }

  private reset(): void {
    gameState.settings.layout = {};
    this.changed();
  }

  private select(target: LayoutTarget | null): void {
    this.selected = target;
    this.changed();
  }

  /** Re-applies the layout and redraws the frames and the tool bar. */
  private changed(): void {
    this.host.apply();
    for (const f of this.frames) {
      const b = f.target.node.getBounds();
      const offered = (f.target.when?.() ?? true) && b.width > 0 && b.height > 0;
      f.box.setVisible(offered);
      f.label.setVisible(offered);
      if (!offered) continue;
      const hidden = elementOf(gameState.settings.layout, f.target.id).hidden;
      f.box.setPosition(b.x - 2, b.y - 2).setSize(b.width + 4, b.height + 4);
      f.box.input?.hitArea.setSize(b.width + 4, b.height + 4);
      f.box.setStrokeStyle(f.target === this.selected ? 3 : 2, f.target === this.selected ? PICK : IDLE, 0.9);
      f.label.setPosition(b.x, b.y - 3).setText(hidden ? `${f.target.label} (ẩn)` : f.target.label);
    }
    const s = this.selected;
    if (!s) {
      this.picked.setText('Chưa chọn khối nào');
      this.hideButton.text.setText('Ẩn');
      return;
    }
    const el = elementOf(gameState.settings.layout, s.id);
    this.picked.setText(`${s.label}: ${Math.round(el.scale * 100)}%`);
    this.hideButton.text.setText(el.hidden ? 'Hiện' : 'Ẩn');
  }
}
