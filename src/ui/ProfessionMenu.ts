import Phaser from 'phaser';
import type { EnergyState } from '../systems/EnergySystem';
import { passiveReached, SKILLS, THAY_PHAP, type ProfessionState, type SkillId } from '../systems/ProfessionSystem';
import { uiState } from '../state/uiState';
import { drawWoodPanel, inkText, UI_COLORS, UI_FONT } from './uiStyle';

export interface PanelStats {
  health: EnergyState;
  sanity: EnergyState;
  energy: EnergyState;
  /** Other players standing close by (they can be taught a skill). */
  nearby: { id: string; name: string }[];
}

/**
 * The Thầy pháp panel (click the portrait): the three bars, total linh lực,
 * the ten passive skills at linh lực 10…100 (all locked for now), the active
 * skills learnt, and the skill bar - drag a slot left or right to reorder it.
 */
export class ProfessionMenu {
  private root?: Phaser.GameObjects.Container;
  onReorder?: (from: number, to: number) => void;
  onTeach?: (skill: SkillId, to: { id: string; name: string }) => void;
  onClose?: () => void;

  constructor(private readonly scene: Phaser.Scene, private readonly depth: number) {}

  get isOpen(): boolean {
    return !!this.root;
  }

  open(p: ProfessionState, stats: PanelStats): void {
    this.close();
    const s = this.scene;
    const { width, height } = s.scale;
    const w = Math.min(560, width - 24);
    const h = 430;
    const x0 = width / 2 - w / 2;
    const y0 = height / 2 - h / 2;
    const root = s.add.container(0, 0).setDepth(this.depth);
    const dim = s.add.rectangle(0, 0, width, height, 0x0a1232, 0.4).setOrigin(0, 0).setInteractive();
    dim.on('pointerdown', () => this.close());
    const g = s.add.graphics();
    drawWoodPanel(g, x0, y0, w, h);
    root.add([dim, g, inkText(s, width / 2, y0 + 22, THAY_PHAP.name, 20).setOrigin(0.5)]);
    const text = (x: number, y: number, t: string, size = 12, color: string = UI_COLORS.ink) =>
      s.add.text(x, y, t, { fontFamily: UI_FONT, fontSize: `${size}px`, color, wordWrap: { width: w - 40 } });
    // Bars and linh lực
    const bar = (label: string, e: EnergyState, row: number, color: number) => {
      const y = y0 + 50 + row * 18;
      root.add(text(x0 + 20, y - 7, label));
      root.add(s.add.rectangle(x0 + 110, y, 160, 10, 0x2b1a10).setOrigin(0, 0.5));
      root.add(s.add.rectangle(x0 + 110, y, (160 * e.current) / Math.max(1, e.max), 10, color).setOrigin(0, 0.5));
      root.add(text(x0 + 278, y - 7, `${Math.round(e.current)}/${e.max}`));
    };
    bar('Máu', stats.health, 0, 0xe0604f);
    bar('Tinh thần', stats.sanity, 1, 0x8a7ce0);
    bar('Năng lượng', stats.energy, 2, 0x7ccf5a);
    bar('Linh lực', { current: p.linhLuc, max: THAY_PHAP.linhLuc.max }, 3, 0xf08a24);
    root.add(text(x0 + 330, y0 + 44, `Linh lực: ${p.linhLuc.toFixed(1)}\n+${THAY_PHAP.linhLuc.perDay} mỗi ngày, tối đa ${THAY_PHAP.linhLuc.max}`, 12));
    // Passive skills: ten locked slots at 10…100
    root.add(text(x0 + 20, y0 + 128, 'Kỹ năng bị động (mở theo linh lực hiện tại)', 13).setFontStyle('bold'));
    THAY_PHAP.passiveThresholds.forEach((t, i) => {
      const cx = x0 + 44 + (i % 5) * ((w - 60) / 5);
      const cy = y0 + 170 + Math.floor(i / 5) * 46;
      const reached = passiveReached(p, t);
      root.add(s.add.rectangle(cx, cy, 40, 36, reached ? 0x5a4630 : 0x3a2c22).setStrokeStyle(2, UI_COLORS.edge));
      root.add(s.add.text(cx, cy - 5, '🔒', { fontSize: '14px' }).setOrigin(0.5));
      root.add(text(cx - 14, cy + 6, `${t}`, 10, '#f8d48a'));
    });
    // Active skills learnt
    const ay = y0 + 262;
    root.add(text(x0 + 20, ay, 'Kỹ năng chủ động đã học', 13).setFontStyle('bold'));
    if (!p.learned.length) root.add(text(x0 + 20, ay + 20, 'Chưa học phép nào. Tìm sách cổ trong rừng sâu, hoặc nhặt sách ma đánh rơi.', 11, UI_COLORS.inkSoft));
    p.learned.forEach((k, i) => {
      const line = text(x0 + 20, ay + 20 + i * 30, `• ${SKILLS[k].name} (${SKILLS[k].cost} linh lực): ${SKILLS[k].description}`, 11);
      line.setWordWrapWidth(w - (stats.nearby.length ? 170 : 40));
      root.add(line);
      const to = stats.nearby[0];
      if (!to) return;
      // Passing a skill on: another player standing right beside you.
      const bx = x0 + w - 80;
      const btn = s.add.rectangle(bx, ay + 28 + i * 30, 130, 22, UI_COLORS.wood).setStrokeStyle(2, UI_COLORS.edge).setInteractive({ useHandCursor: true });
      btn.on('pointerdown', () => this.onTeach?.(k, to));
      root.add([btn, s.add.text(bx, ay + 28 + i * 30, `Truyền cho ${to.name}`, { fontFamily: UI_FONT, fontSize: '10px', color: '#fff2d0' }).setOrigin(0.5)]);
    });
    // The skill bar: drag to reorder
    const by = y0 + h - 56;
    root.add(text(x0 + 20, by - 40, 'Thanh phép (kéo để đổi chỗ; ô đầu dùng phím Q)', 12).setFontStyle('bold'));
    const slotW = 70;
    const slotX = (i: number) => x0 + 50 + i * (slotW + 8);
    for (let i = 0; i < 6; i++) root.add(s.add.rectangle(slotX(i), by, slotW, 34, 0x2b1a10, 0.5).setStrokeStyle(1, UI_COLORS.edge));
    p.order.forEach((k: SkillId, i) => {
      const slot = s.add.container(slotX(i), by);
      const box = s.add.rectangle(0, 0, slotW - 4, 30, 0x3a2418).setStrokeStyle(2, 0xf08a24);
      slot.add([box, s.add.text(0, 0, SKILLS[k].name, { fontFamily: UI_FONT, fontSize: '11px', color: '#fff2d0' }).setOrigin(0.5)]);
      slot.setSize(slotW - 4, 30).setInteractive({ draggable: true, useHandCursor: true });
      slot.on('drag', (_p: Phaser.Input.Pointer, dx: number) => slot.setX(dx));
      slot.on('dragend', () => {
        const to = Math.max(0, Math.min(p.order.length - 1, Math.round((slot.x - slotX(0)) / (slotW + 8))));
        if (to !== i) this.onReorder?.(i, to);
        else slot.setX(slotX(i));
      });
      root.add(slot);
    });
    const close = s.add.rectangle(x0 + w - 24, y0 + 22, 26, 26, UI_COLORS.wood).setStrokeStyle(2, UI_COLORS.edge).setInteractive({ useHandCursor: true });
    close.on('pointerdown', () => this.close());
    root.add([close, s.add.text(x0 + w - 24, y0 + 22, '✕', { fontFamily: UI_FONT, fontSize: '14px', color: '#fff2d0' }).setOrigin(0.5)]);
    this.root = root;
    uiState.dialogueOpen = true;
  }

  close(): void {
    if (!this.root) return;
    this.root.destroy();
    this.root = undefined;
    uiState.dialogueOpen = false;
    this.onClose?.();
  }
}
