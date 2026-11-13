import Phaser from 'phaser';
import { GAME_WIDTH } from '../config/constants';
import { applyLoadedState, resetToNewGame } from '../state/GameState';
import * as SaveService from '../systems/SaveService';

const TITLE_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
  color: '#fff6e0',
};

/** The very first screen: start a new game or continue a saved one. */
export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#4a7a4a');
    this.add
      .text(GAME_WIDTH / 2, 140, 'Vườn Nhà Nhỏ', { ...TITLE_STYLE, fontSize: '48px' })
      .setOrigin(0.5)
      .setShadow(2, 3, '#1b3a1b', 0, false, true);
    this.add
      .text(GAME_WIDTH / 2, 190, '(Phiên bản đang phát triển)', { ...TITLE_STYLE, fontSize: '16px', color: '#d8ecd8' })
      .setOrigin(0.5);

    this.makeButton(GAME_WIDTH / 2, 300, 'Chơi mới', () => this.startNewGame());

    const canContinue = SaveService.hasSave();
    this.makeButton(GAME_WIDTH / 2, 370, 'Tiếp tục', () => this.continueGame(), canContinue);
  }

  private startNewGame(): void {
    resetToNewGame();
    this.scene.start('Preload');
  }

  private continueGame(): void {
    const saved = SaveService.load();
    if (!saved) {
      this.startNewGame();
      return;
    }
    applyLoadedState(saved);
    this.scene.start('Preload');
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void, enabled = true): void {
    const width = 220;
    const height = 48;
    const box = this.add
      .rectangle(x, y, width, height, enabled ? 0x3a2f24 : 0x2a241f, enabled ? 0.9 : 0.6)
      .setStrokeStyle(2, enabled ? 0xc9a66b : 0x6b6356);
    const text = this.add
      .text(x, y, label, { ...TITLE_STYLE, fontSize: '20px', color: enabled ? '#fff6e0' : '#8a8378' })
      .setOrigin(0.5);

    if (!enabled) return;
    box.setInteractive({ useHandCursor: true });
    box.on('pointerover', () => box.setFillStyle(0x4a3c2e, 0.95));
    box.on('pointerout', () => box.setFillStyle(0x3a2f24, 0.9));
    box.on('pointerdown', onClick);
    void text;
  }
}
