import type Phaser from 'phaser';
import { UI_COLORS, UI_FONT } from './uiStyle';
import { skinButton } from './uiSkin';

export interface MenuButton {
  box: Phaser.GameObjects.Rectangle;
  text: Phaser.GameObjects.Text;
  /** Everything to add to a container. */
  parts: Phaser.GameObjects.GameObject[];
}

/** A small wooden button with a label (the settings menus' look). */
export function menuButton(scene: Phaser.Scene, x: number, y: number, w: number, label: string, onClick: () => void, size = 13): MenuButton {
  const box = scene.add.rectangle(x, y, w, 26, UI_COLORS.wood).setStrokeStyle(2, UI_COLORS.edge).setInteractive({ useHandCursor: true });
  const text = scene.add.text(x, y, label, { fontFamily: UI_FONT, fontSize: `${size}px`, color: '#fff2d0', fontStyle: 'bold' }).setOrigin(0.5).setStroke('#2b1a10', 3);
  box.on('pointerdown', onClick);
  box.on('pointerover', () => box.setFillStyle(UI_COLORS.woodLight));
  box.on('pointerout', () => box.setFillStyle(UI_COLORS.wood));
  const art = skinButton(box);
  return { box, text, parts: art ? [box, art, text] : [box, text] };
}
