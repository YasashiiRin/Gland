import Phaser from 'phaser';
import { inkText, UI_COLORS, UI_FONT } from './uiStyle';
import { woodPanel, skinButton } from './uiSkin';

const PANEL_W = 380;
const PANEL_H = 410;
const BAR_W = 180;

export interface SettingsHandlers {
  onVolumeChange: (ratio: number) => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  /** -1 = zoom out one step, +1 = zoom in one step. */
  onZoomStep: (direction: -1 | 1) => void;
  onClose: () => void;
  /** Cycle the phone controls setting: auto → on → off. */
  onTouchCycle: () => void;
  /** Cycle the horror setting: on → mild → off. */
  onHorrorCycle: () => void;
}

const CONTROLS = [
  'WASD / mũi tên: đi lại',
  'Chuột trái / Space: dùng đồ đang cầm · khi lái xe: bật/tắt chế độ cày/gặt, bấm còi',
  'Chuột phải / E: tương tác, thu hoạch · đứng cạnh xe: lên xe · đang lái: xuống xe',
  'I: túi đồ · C: chế tạo · M: bản đồ nhỏ · Tab / ⚙: cài đặt',
];

/** Settings overlay (gear button or Tab): volume, mute, zoom, fullscreen, controls list. */
export class SettingsMenu {
  private readonly root: Phaser.GameObjects.Container;
  private readonly volumeFill: Phaser.GameObjects.Rectangle;
  private readonly volumeLabel: Phaser.GameObjects.Text;
  private readonly muteText: Phaser.GameObjects.Text;
  private readonly zoomText: Phaser.GameObjects.Text;
  private readonly touchText: Phaser.GameObjects.Text;
  private readonly horrorText: Phaser.GameObjects.Text;
  private handlers?: SettingsHandlers;

  constructor(scene: Phaser.Scene, depth: number) {
    const cx = scene.scale.width / 2;
    const cy = scene.scale.height / 2;
    const left = cx - PANEL_W / 2;
    const top = cy - PANEL_H / 2;
    this.root = scene.add.container(0, 0).setDepth(depth).setVisible(false);

    const g = woodPanel(scene, left, top, PANEL_W, PANEL_H);
    const title = inkText(scene, cx, top + 26, 'Cài đặt', 18).setOrigin(0.5);
    const close = this.button(scene, left + PANEL_W - 30, top + 26, 26, '✕', () => this.handlers?.onClose());
    this.root.add([g, title, ...close]);

    // Volume
    const rowX = left + 30;
    let y = top + 64;
    const barX = rowX + 110;
    const barBg = scene.add.rectangle(barX, y, BAR_W, 14, UI_COLORS.edge).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    barBg.on('pointerdown', (p: Phaser.Input.Pointer) => this.handlers?.onVolumeChange(Phaser.Math.Clamp((p.x - barX) / BAR_W, 0, 1)));
    this.volumeFill = scene.add.rectangle(barX + 2, y, 0, 10, 0x7ccf5a).setOrigin(0, 0.5);
    this.volumeLabel = inkText(scene, barX + BAR_W + 10, y, '', 13).setOrigin(0, 0.5);
    this.root.add([inkText(scene, rowX, y, 'Âm lượng', 14).setOrigin(0, 0.5), barBg, this.volumeFill, this.volumeLabel]);

    // Mute
    y += 40;
    const mute = this.button(scene, barX + 70, y, 140, '', () => this.handlers?.onToggleMute());
    this.muteText = mute[mute.length - 1] as Phaser.GameObjects.Text;
    this.root.add([inkText(scene, rowX, y, 'Âm thanh', 14).setOrigin(0, 0.5), ...mute]);

    // Zoom
    y += 40;
    const minus = this.button(scene, barX + 14, y, 28, '−', () => this.handlers?.onZoomStep(-1));
    const plus = this.button(scene, barX + 126, y, 28, '+', () => this.handlers?.onZoomStep(1));
    this.zoomText = inkText(scene, barX + 70, y, '', 15).setOrigin(0.5);
    this.root.add([inkText(scene, rowX, y, 'Thu phóng', 14).setOrigin(0, 0.5), ...minus, ...plus, this.zoomText]);

    // Fullscreen
    y += 40;
    const fs = this.button(scene, barX + 70, y, 140, 'Bật / tắt', () => this.handlers?.onToggleFullscreen());
    this.root.add([inkText(scene, rowX, y, 'Toàn màn hình', 14).setOrigin(0, 0.5), ...fs]);

    // Touch controls (phones)
    y += 40;
    const touch = this.button(scene, barX + 70, y, 140, '', () => this.handlers?.onTouchCycle());
    this.touchText = touch[touch.length - 1] as Phaser.GameObjects.Text;
    this.root.add([inkText(scene, rowX, y, 'Nút cảm ứng', 14).setOrigin(0, 0.5), ...touch]);

    // Night horror
    y += 40;
    const horror = this.button(scene, barX + 70, y, 140, '', () => this.handlers?.onHorrorCycle());
    this.horrorText = horror[horror.length - 1] as Phaser.GameObjects.Text;
    this.root.add([inkText(scene, rowX, y, 'Kinh dị ban đêm', 14).setOrigin(0, 0.5), ...horror]);

    // Controls
    y += 36;
    const controls = scene.add.text(rowX, y, CONTROLS.join('\n'), {
      fontFamily: UI_FONT,
      fontSize: '12px',
      color: UI_COLORS.inkSoft,
      lineSpacing: 3,
    });
    this.root.add(controls);
  }

  private button(
    scene: Phaser.Scene,
    x: number,
    y: number,
    w: number,
    label: string,
    onClick: () => void,
  ): [Phaser.GameObjects.Rectangle, ...Phaser.GameObjects.GameObject[], Phaser.GameObjects.Text] {
    const box = scene.add.rectangle(x, y, w, 26, UI_COLORS.wood).setStrokeStyle(2, UI_COLORS.edge).setInteractive({ useHandCursor: true });
    const text = scene.add.text(x, y, label, { fontFamily: UI_FONT, fontSize: '13px', color: '#fff2d0', fontStyle: 'bold' }).setOrigin(0.5).setStroke('#2b1a10', 3);
    box.on('pointerdown', onClick);
    box.on('pointerover', () => box.setFillStyle(UI_COLORS.woodLight));
    box.on('pointerout', () => box.setFillStyle(UI_COLORS.wood));
    const art = skinButton(box);
    return art ? [box, art, text] : [box, text];
  }

  bind(handlers: SettingsHandlers): void {
    this.handlers = handlers;
  }

  refresh(settings: { volume: number; muted: boolean; zoom: number; touch: string; horror: string }): void {
    this.horrorText.setText(settings.horror === 'on' ? 'Bật' : settings.horror === 'mild' ? 'Nhẹ (không hù)' : 'Tắt');
    this.touchText.setText(settings.touch === 'auto' ? 'Tự động' : settings.touch === 'on' ? 'Luôn bật' : 'Tắt');
    this.volumeFill.width = (BAR_W - 4) * settings.volume;
    this.volumeLabel.setText(`${Math.round(settings.volume * 100)}%`);
    this.muteText.setText(settings.muted ? 'Đang tắt — bật' : 'Đang bật — tắt');
    this.zoomText.setText(`${settings.zoom}x`);
  }

  open(settings: { volume: number; muted: boolean; zoom: number; touch: string; horror: string }): void {
    this.refresh(settings);
    this.root.setVisible(true);
  }

  close(): void {
    this.root.setVisible(false);
  }

  get isOpen(): boolean {
    return this.root.visible;
  }
}
