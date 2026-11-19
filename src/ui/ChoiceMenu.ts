import Phaser from 'phaser';
import { uiState } from '../state/uiState';
import { inkText, UI_COLORS, UI_FONT } from './uiStyle';
import { woodPanel, skinButton } from './uiSkin';

export interface ChoiceOption {
  id: string;
  label: string;
  enabled?: boolean;
}

/** Shown by the UI scene when a map asks the player to pick (payload of GameEvents.ChoiceRequested). */
export interface ChoiceRequest {
  title: string;
  note?: string;
  options: ChoiceOption[];
}

/**
 * A small wooden panel with a title, a line of text and a column of buttons
 * (e.g. at your front door: sleep / upgrade the house / close). Picking one
 * calls onPick with its id; "Đóng", Esc or a click outside just close it.
 */
export class ChoiceMenu {
  private root?: Phaser.GameObjects.Container;
  onPick?: (id: string) => void;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly depth: number,
  ) {}

  get isOpen(): boolean {
    return !!this.root;
  }

  open(req: ChoiceRequest): void {
    this.close();
    const { width, height } = this.scene.scale;
    const w = 340;
    const h = 96 + req.options.length * 40;
    const x = width / 2 - w / 2;
    const y = height / 2 - h / 2;
    const root = this.scene.add.container(0, 0).setDepth(this.depth);
    const dim = this.scene.add.rectangle(0, 0, width, height, 0x0a1232, 0.35).setOrigin(0, 0).setInteractive();
    dim.on('pointerdown', () => this.close());
    const g = woodPanel(this.scene, x, y, w, h);
    root.add([dim, g, inkText(this.scene, width / 2, y + 24, req.title, 17).setOrigin(0.5)]);
    if (req.note) {
      root.add(
        this.scene.add
          .text(width / 2, y + 50, req.note, { fontFamily: UI_FONT, fontSize: '12px', color: UI_COLORS.inkSoft, align: 'center', wordWrap: { width: w - 40 } })
          .setOrigin(0.5),
      );
    }
    req.options.forEach((opt, i) => {
      const by = y + 84 + i * 40;
      const enabled = opt.enabled !== false;
      const box = this.scene.add.rectangle(width / 2, by, w - 60, 32, enabled ? UI_COLORS.wood : 0x8a7a68).setStrokeStyle(2, UI_COLORS.edge);
      const label = this.scene.add
        .text(width / 2, by, opt.label, { fontFamily: UI_FONT, fontSize: '14px', fontStyle: 'bold', color: enabled ? '#fff2d0' : '#d8ccb8' })
        .setOrigin(0.5)
        .setStroke('#2b1a10', 3);
      if (enabled) {
        box.setInteractive({ useHandCursor: true });
        box.on('pointerover', () => box.setFillStyle(UI_COLORS.woodLight));
        box.on('pointerout', () => box.setFillStyle(UI_COLORS.wood));
        box.on('pointerdown', () => {
          this.close();
          this.onPick?.(opt.id);
        });
      }
      const art = skinButton(box, enabled);
      root.add([box, ...(art ? [art] : []), label]);
    });
    this.root = root;
    uiState.dialogueOpen = true;
  }

  close(): void {
    if (!this.root) return;
    this.root.destroy();
    this.root = undefined;
    uiState.dialogueOpen = false;
  }
}
