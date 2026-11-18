import Phaser from 'phaser';
import { SKILLS, THAY_PHAP, type ProfessionState, type SkillId } from '../systems/ProfessionSystem';
import { UI_COLORS, UI_FONT } from './uiStyle';

const LINH_COLOR = 0xf08a24;
const BAR_W = 8;
const BAR_H = 76;
const MARGIN = 10;

/**
 * What a Thầy pháp sees on screen besides the usual bars: a small round
 * portrait above the status bars (click it for the profession panel), an
 * orange linh lực bar ("L") beside them, and the skill bar as a column of
 * buttons down the right edge (click one, or press Q for the first, to cast).
 */
export class ProfessionHud {
  private readonly root: Phaser.GameObjects.Container;
  private readonly fill: Phaser.GameObjects.Rectangle;
  private readonly column: Phaser.GameObjects.Container;
  private shownOrder = '';
  onOpenPanel?: () => void;
  onCast?: (skill: SkillId) => void;

  constructor(private readonly scene: Phaser.Scene, depth: number) {
    const { width, height } = scene.scale;
    const step = BAR_W + 8;
    const x = width - MARGIN - BAR_W - 4 * step;
    const y = height - MARGIN - BAR_H;
    this.root = scene.add.container(0, 0).setDepth(depth).setVisible(false);
    const frame = scene.add.rectangle(x - 2, y - 2, BAR_W + 4, BAR_H + 4, UI_COLORS.edge, 0.85).setOrigin(0, 0);
    this.fill = scene.add.rectangle(x, y + BAR_H, BAR_W, BAR_H, LINH_COLOR).setOrigin(0, 1);
    const letter = scene.add
      .text(x + BAR_W / 2, y - 10, 'L', { fontFamily: UI_FONT, fontSize: '13px', fontStyle: 'bold', color: '#f08a24' })
      .setOrigin(0.5)
      .setStroke('#2b1a10', 3);
    // The portrait: a round badge above the bars.
    const ax = width - MARGIN - 2 * step;
    const ay = y - 34;
    const badge = scene.add.circle(ax, ay, 15, 0x3a2418).setStrokeStyle(2, LINH_COLOR).setInteractive({ useHandCursor: true });
    const face = scene.add
      .text(ax, ay, '☯', { fontFamily: UI_FONT, fontSize: '18px', color: '#f8d48a' })
      .setOrigin(0.5);
    badge.on('pointerdown', () => this.onOpenPanel?.());
    this.root.add([frame, this.fill, letter, badge, face]);
    this.column = scene.add.container(0, 0).setDepth(depth);
    scene.input.keyboard?.on('keydown-Q', () => {
      const first = this.shownOrder.split(',')[0];
      if (first) this.onCast?.(first as SkillId);
    });
  }

  update(p: ProfessionState | null, menuOpen: boolean): void {
    this.root.setVisible(!!p);
    if (!p) {
      this.column.removeAll(true);
      this.shownOrder = '';
      return;
    }
    this.fill.height = Math.max(0, (BAR_H * p.linhLuc) / THAY_PHAP.linhLuc.max);
    this.column.setVisible(!menuOpen);
    const order = p.order.join(',');
    if (order !== this.shownOrder) this.buildColumn(p.order);
  }

  private buildColumn(order: SkillId[]): void {
    this.shownOrder = order.join(',');
    this.column.removeAll(true);
    const { width, height } = this.scene.scale;
    order.forEach((skill, i) => {
      const x = width - 32;
      const y = height / 2 - 60 + i * 52;
      const box = this.scene.add.rectangle(x, y, 46, 46, 0x3a2418, 0.92).setStrokeStyle(2, LINH_COLOR).setInteractive({ useHandCursor: true });
      const name = this.scene.add
        .text(x, y - 6, SKILLS[skill].name, { fontFamily: UI_FONT, fontSize: '10px', color: '#fff2d0', align: 'center', wordWrap: { width: 42 } })
        .setOrigin(0.5);
      const cost = this.scene.add.text(x, y + 14, `${SKILLS[skill].cost}`, { fontFamily: UI_FONT, fontSize: '9px', color: '#f8b060' }).setOrigin(0.5);
      const key = i === 0 ? this.scene.add.text(x - 20, y - 20, 'Q', { fontFamily: UI_FONT, fontSize: '9px', color: '#fff2d0' }) : null;
      box.on('pointerdown', () => this.onCast?.(skill));
      this.column.add(key ? [box, name, cost, key] : [box, name, cost]);
    });
  }
}
