import Phaser from 'phaser';
import { inkText, UI_COLORS, UI_FONT } from './uiStyle';
import { woodPanel, skinButton } from './uiSkin';

/**
 * Shown while you sleep: the screen dims, a small panel shows energy and
 * health filling up as the clock runs on (sleep never skips the day), and
 * "Dậy" gets you up again.
 */
export class SleepWaitOverlay {
  private readonly root: Phaser.GameObjects.Container;
  private readonly countText: Phaser.GameObjects.Text;
  onWakeUp?: () => void;

  constructor(scene: Phaser.Scene, depth: number) {
    const { width, height } = scene.scale;
    this.root = scene.add.container(0, 0).setDepth(depth).setVisible(false);
    const dim = scene.add.rectangle(0, 0, width, height, 0x0a1232, 0.55).setOrigin(0, 0);
    const g = woodPanel(scene, width / 2 - 170, height / 2 - 70, 340, 140);
    const title = inkText(scene, width / 2, height / 2 - 40, 'Zzz… Đang ngủ', 17).setOrigin(0.5);
    this.countText = scene.add
      .text(width / 2, height / 2 - 8, '', { fontFamily: UI_FONT, fontSize: '14px', color: UI_COLORS.inkSoft, align: 'center' })
      .setOrigin(0.5);
    const button = scene.add
      .rectangle(width / 2, height / 2 + 36, 110, 30, UI_COLORS.wood)
      .setStrokeStyle(2, UI_COLORS.edge)
      .setInteractive({ useHandCursor: true });
    const label = scene.add
      .text(width / 2, height / 2 + 36, 'Dậy', { fontFamily: UI_FONT, fontSize: '15px', color: '#fff2d0', fontStyle: 'bold' })
      .setOrigin(0.5);
    button.on('pointerdown', () => this.onWakeUp?.());
    const art = skinButton(button);
    this.root.add([dim, g, title, this.countText, button, ...(art ? [art] : []), label]);
  }

  /** Energy and health, 0..100 %. */
  show(energy: number, health: number): void {
    this.countText.setText(`Sức ${Math.floor(energy)}% · Máu ${Math.floor(health)}%\nĐang hồi sức, bụng đói chậm hơn`);
    this.root.setVisible(true);
  }

  hide(): void {
    this.root.setVisible(false);
  }

  get visible(): boolean {
    return this.root.visible;
  }
}
