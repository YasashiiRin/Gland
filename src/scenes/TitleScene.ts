import Phaser from 'phaser';
import { normalizeRoomCode } from '../net/protocol';
import { START_PROVINCES } from '../data/startPoints';
import { applyLoadedState, resetToNewGame } from '../state/GameState';
import * as SaveService from '../systems/SaveService';
import { createHtmlInput } from '../ui/htmlInput';
import { drawTitleBackground } from '../ui/titleBackground';
import { UI_COLORS, UI_FONT } from '../ui/uiStyle';
import type { LobbySceneData } from './LobbyScene';

type Page = 'main' | 'solo' | 'host' | 'join' | 'start';
const NAME_KEY = 'farm-game-player-name';

/** First screen: play alone, open a room for friends, or join one by code. */
export class TitleScene extends Phaser.Scene {
  private menu?: Phaser.GameObjects.Container;
  private inputs: HTMLInputElement[] = [];
  private message?: Phaser.GameObjects.Text;

  constructor() {
    super('Title');
  }

  create(data: { message?: string } = {}): void {
    drawTitleBackground(this);
    this.add
      .text(this.scale.width / 2, 92, 'Làng Việt', { fontFamily: UI_FONT, fontSize: '54px', color: '#fff6e0', fontStyle: 'bold' })
      .setOrigin(0.5)
      .setStroke('#5a3018', 8)
      .setShadow(3, 4, '#2b1a10', 0, true, true);
    this.add
      .text(this.scale.width / 2, 142, 'Nông trại làng quê', { fontFamily: UI_FONT, fontSize: '18px', color: '#fff2d0', fontStyle: 'bold' })
      .setOrigin(0.5)
      .setStroke('#5a3018', 4);
    this.message = this.add
      .text(this.scale.width / 2, 500, data.message ?? '', { fontFamily: UI_FONT, fontSize: '15px', color: '#fff6e0', backgroundColor: '#2b1a10cc' })
      .setPadding(8, 4, 8, 4)
      .setOrigin(0.5)
      .setVisible(!!data.message);
    this.showPage('main');
  }

  /** Kept public: also used by automated browser checks. */
  startNewGame(startId?: string): void {
    resetToNewGame(this.savedName(), undefined, startId);
    this.scene.start('Preload');
  }

  private continueGame(): void {
    const saved = SaveService.load();
    if (!saved) return this.startNewGame();
    applyLoadedState(saved);
    this.scene.start('Preload');
  }

  private showPage(page: Page): void {
    this.menu?.destroy();
    this.inputs.forEach((i) => i.remove());
    this.inputs = [];
    const cx = this.scale.width / 2;
    this.menu = this.add.container(0, 0);
    const panel = this.add.graphics();
    panel.fillStyle(UI_COLORS.edge, 0.55).fillRoundedRect(cx - 170, 188, 340, 280, 10);
    this.menu.add(panel);
    const hasSave = SaveService.hasSave();

    if (page === 'main') {
      this.button(cx, 240, 'Chơi một mình', () => this.showPage('solo'));
      this.button(cx, 310, 'Tạo phòng', () => this.showPage('host'));
      this.button(cx, 380, 'Vào phòng', () => this.showPage('join'));
      this.caption(cx, 440, 'Chơi cùng tối đa 2 người bạn qua mã phòng');
    } else if (page === 'solo') {
      this.button(cx, 240, 'Chơi mới', () => this.showStartPicker((id) => this.startNewGame(id), 'solo'));
      this.button(cx, 310, 'Tiếp tục', () => this.continueGame(), hasSave);
      this.button(cx, 400, '‹ Quay lại', () => this.showPage('main'), true, 160);
    } else if (page === 'host') {
      this.caption(cx, 214, 'Tên của bạn');
      const name = this.textField(cx, 244, { value: this.savedName(), maxLength: 16 });
      this.button(cx, 306, 'Nông trại mới', () => {
        const typed = name.value;
        this.showStartPicker((id) => this.openRoom(typed, 'new', id), 'host');
      });
      this.button(cx, 366, 'Nông trại đã lưu', () => this.openRoom(name.value, 'saved'), hasSave);
      this.button(cx, 432, '‹ Quay lại', () => this.showPage('main'), true, 160);
    } else if (page === 'join') {
      this.caption(cx, 214, 'Tên của bạn');
      const name = this.textField(cx, 244, { value: this.savedName(), maxLength: 16 });
      this.caption(cx, 286, 'Mã phòng (6 ký tự)');
      const code = this.textField(cx, 316, { placeholder: 'VD: K7M2QX', maxLength: 6, uppercase: true });
      this.button(cx, 376, 'Vào phòng', () => this.joinRoom(name.value, code.value));
      this.button(cx, 436, '‹ Quay lại', () => this.showPage('main'), true, 160);
    }
  }

  /** "Bắt đầu ở tỉnh nào?": one button per province; the exact spot is a random one in the open country. */
  private showStartPicker(onPick: (provinceId: string) => void, back: Page): void {
    this.showPage('start');
    const cx = this.scale.width / 2;
    this.caption(cx, 212, 'Bắt đầu ở tỉnh nào?');
    START_PROVINCES.forEach((p, i) => {
      const y = 262 + i * 76;
      this.button(cx, y, p.name, () => onPick(p.id), true, 260);
      this.note(cx, y + 30, p.blurb);
    });
    this.caption(cx, 400, 'Bạn ra đời ngoài đồng, chỉ có một chiếc chiếu để ngủ');
    this.button(cx, 440, '‹ Quay lại', () => this.showPage(back), true, 160);
  }

  private note(x: number, y: number, text: string): void {
    const t = this.add.text(x, y, text, { fontFamily: UI_FONT, fontSize: '11px', color: '#f0e0c0' }).setOrigin(0.5);
    this.menu?.add(t);
  }

  private openRoom(rawName: string, world: 'new' | 'saved', startId?: string): void {
    const name = this.rememberName(rawName);
    if (world === 'saved') {
      const saved = SaveService.load();
      if (saved) applyLoadedState(saved);
      else resetToNewGame(name);
    } else {
      resetToNewGame(name, undefined, startId);
    }
    this.scene.start('Lobby', { mode: 'host', name } satisfies LobbySceneData);
  }

  private joinRoom(rawName: string, rawCode: string): void {
    const code = normalizeRoomCode(rawCode);
    if (!code) {
      this.flash('Mã phòng gồm 6 chữ/số, ví dụ K7M2QX');
      return;
    }
    const name = this.rememberName(rawName);
    this.scene.start('Lobby', { mode: 'guest', name, code } satisfies LobbySceneData);
  }

  private savedName(): string {
    try {
      return localStorage.getItem(NAME_KEY) ?? 'Nông dân';
    } catch {
      return 'Nông dân';
    }
  }

  private rememberName(raw: string): string {
    const name = raw.trim().slice(0, 16) || 'Nông dân';
    try {
      localStorage.setItem(NAME_KEY, name);
    } catch {
      /* private mode: just don't remember it */
    }
    return name;
  }

  private flash(text: string): void {
    this.message?.setText(text).setVisible(true);
  }

  private caption(x: number, y: number, text: string): void {
    const t = this.add
      .text(x, y, text, { fontFamily: UI_FONT, fontSize: '14px', color: '#fff2d0', fontStyle: 'bold' })
      .setOrigin(0.5);
    this.menu?.add(t);
  }

  private textField(x: number, y: number, options: Parameters<typeof createHtmlInput>[4]): HTMLInputElement {
    const el = createHtmlInput(this, x, y, 220, options);
    this.inputs.push(el);
    return el;
  }

  private button(x: number, y: number, label: string, onClick: () => void, enabled = true, width = 240, fontSize = 20): void {
    const box = this.add
      .rectangle(x, y, width, 46, enabled ? UI_COLORS.wood : 0x5a4a3a)
      .setStrokeStyle(3, UI_COLORS.edge);
    const text = this.add
      .text(x, y, label, { fontFamily: UI_FONT, fontSize: `${fontSize}px`, fontStyle: 'bold', color: enabled ? '#fff2d0' : '#a89880' })
      .setOrigin(0.5);
    this.menu?.add([box, text]);
    if (!enabled) return;
    box.setInteractive({ useHandCursor: true });
    box.on('pointerover', () => box.setFillStyle(UI_COLORS.woodLight));
    box.on('pointerout', () => box.setFillStyle(UI_COLORS.wood));
    box.on('pointerdown', onClick);
  }
}
