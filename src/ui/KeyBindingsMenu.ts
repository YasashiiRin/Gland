import Phaser from 'phaser';
import { controlsState, currentBindings, saveBindings } from '../state/controls';
import {
  ACTIONS,
  assignKey,
  clearKey,
  DEFAULT_BINDINGS,
  keyName,
  MAX_KEYS_PER_ACTION,
  type ActionId,
} from '../systems/KeyBindings';
import { menuButton, type MenuButton } from './menuButton';
import { inkText, UI_COLORS } from './uiStyle';
import { woodPanel } from './uiSkin';

const PANEL_W = 480;
const PANEL_H = 470;
const ROW_H = 27;
const PAGES: { title: string; actions: ActionId[] }[] = [
  { title: 'Thao tác', actions: ACTIONS.filter((a) => !a.id.startsWith('hotbar')).map((a) => a.id) },
  { title: 'Thanh công cụ', actions: ACTIONS.filter((a) => a.id.startsWith('hotbar')).map((a) => a.id) },
];
const LABELS = Object.fromEntries(ACTIONS.map((a) => [a.id, a.label])) as Record<ActionId, string>;
const BACKSPACE = 8;
const ESC = 27;

/**
 * "Phím điều khiển" (from the settings): every action with its two key slots.
 * Click a slot, then press the new key (Backspace clears it, Esc cancels).
 */
export class KeyBindingsMenu {
  private readonly root: Phaser.GameObjects.Container;
  private readonly rows: { label: Phaser.GameObjects.Text; slots: MenuButton[] }[] = [];
  private readonly tabs: MenuButton[] = [];
  private readonly status: Phaser.GameObjects.Text;
  private page = 0;
  private waiting: { action: ActionId; slot: number } | null = null;
  private readonly onKey = (e: KeyboardEvent) => this.capture(e.keyCode);

  constructor(private readonly scene: Phaser.Scene, depth: number) {
    const cx = scene.scale.width / 2;
    const left = cx - PANEL_W / 2;
    const top = scene.scale.height / 2 - PANEL_H / 2;
    this.root = scene.add.container(0, 0).setDepth(depth).setVisible(false);
    // Blocks clicks from reaching the settings panel underneath.
    const shield = scene.add.rectangle(0, 0, scene.scale.width, scene.scale.height, 0x000000, 0.35).setOrigin(0, 0).setInteractive();
    this.root.add([shield, woodPanel(scene, left, top, PANEL_W, PANEL_H), inkText(scene, cx, top + 24, 'Phím điều khiển', 18).setOrigin(0.5)]);

    PAGES.forEach((p, i) => {
      const tab = menuButton(scene, cx + (i === 0 ? -80 : 80), top + 56, 150, p.title, () => this.showPage(i));
      this.tabs.push(tab);
      this.root.add(tab.parts);
    });
    const rowCount = Math.max(...PAGES.map((p) => p.actions.length));
    for (let r = 0; r < rowCount; r++) {
      const y = top + 92 + r * ROW_H;
      const label = inkText(scene, left + 24, y, '', 13).setOrigin(0, 0.5);
      const slots = Array.from({ length: MAX_KEYS_PER_ACTION }, (_, s) =>
        menuButton(scene, left + 296 + s * 110, y, 100, '', () => this.startWaiting(r, s), 12),
      );
      this.rows.push({ label, slots });
      this.root.add([label, ...slots.flatMap((b) => b.parts)]);
    }
    this.status = scene.add
      .text(cx, top + PANEL_H - 62, '', { fontFamily: 'sans-serif', fontSize: '12px', color: UI_COLORS.inkSoft, align: 'center', wordWrap: { width: PANEL_W - 40 } })
      .setOrigin(0.5);
    const reset = menuButton(scene, cx - 90, top + PANEL_H - 28, 170, 'Khôi phục mặc định', () => this.reset());
    const done = menuButton(scene, cx + 100, top + PANEL_H - 28, 110, 'Xong', () => this.close());
    this.root.add([this.status, ...reset.parts, ...done.parts]);
  }

  get isOpen(): boolean {
    return this.root.visible;
  }

  open(): void {
    this.root.setVisible(true);
    this.showPage(this.page);
    this.say('Bấm vào một ô rồi bấm phím mới. Mỗi việc gán được 2 phím.');
  }

  close(): void {
    this.stopWaiting();
    this.root.setVisible(false);
  }

  private showPage(i: number): void {
    this.stopWaiting();
    this.page = i;
    this.tabs.forEach((t, k) => t.box.setStrokeStyle(k === i ? 3 : 2, k === i ? 0xf0c060 : UI_COLORS.edge));
    this.refresh();
  }

  private refresh(): void {
    const bindings = currentBindings();
    const actions = PAGES[this.page].actions;
    this.rows.forEach((row, r) => {
      const action = actions[r];
      row.label.setVisible(!!action).setText(action ? LABELS[action] : '');
      row.slots.forEach((b, s) => {
        b.parts.forEach((o) => (o as unknown as Phaser.GameObjects.Components.Visible).setVisible(!!action));
        if (!action) return;
        const waiting = this.waiting?.action === action && this.waiting.slot === s;
        b.text.setText(waiting ? 'Bấm phím…' : keyName(bindings[action][s]));
        b.box.setStrokeStyle(waiting ? 3 : 2, waiting ? 0xf0c060 : UI_COLORS.edge);
      });
    });
  }

  private startWaiting(row: number, slot: number): void {
    const action = PAGES[this.page].actions[row];
    if (!action) return;
    this.stopWaiting();
    this.waiting = { action, slot };
    controlsState.capturing = true;
    this.scene.input.keyboard?.once('keydown', this.onKey);
    this.say(`Bấm phím mới cho "${LABELS[action]}" · Backspace: xoá phím này · Esc: huỷ`);
    this.refresh();
  }

  private stopWaiting(): void {
    if (!this.waiting) return;
    this.scene.input.keyboard?.off('keydown', this.onKey);
    this.waiting = null;
    controlsState.capturing = false;
    controlsState.flushPending = true; // don't let that key press also do its action
  }

  private capture(code: number): void {
    const w = this.waiting;
    if (!w) return;
    let bindings = currentBindings();
    if (code === ESC) this.say('Đã huỷ.');
    else if (code === BACKSPACE) {
      bindings = clearKey(bindings, w.action, w.slot);
      this.say(`Đã xoá một phím của "${LABELS[w.action]}".`);
    } else {
      const r = assignKey(bindings, w.action, w.slot, code);
      bindings = r.bindings;
      this.say(r.takenFrom ? `"${LABELS[w.action]}": ${keyName(code)} (đã gỡ khỏi "${LABELS[r.takenFrom]}")` : `"${LABELS[w.action]}": ${keyName(code)}`);
    }
    saveBindings(bindings);
    this.waiting = null;
    controlsState.capturing = false;
    controlsState.flushPending = true;
    this.refresh();
  }

  private reset(): void {
    this.stopWaiting();
    saveBindings(DEFAULT_BINDINGS);
    this.say('Đã khôi phục phím mặc định.');
    this.refresh();
  }

  private say(text: string): void {
    this.status.setText(text);
  }
}
