import Phaser from 'phaser';

/**
 * Shared look for HUD panels: a dark-edged wooden frame around a warm
 * parchment inset, in the cosy style common to farming games (own colors,
 * drawn with plain shapes — no copied UI art).
 */
export const UI_COLORS = {
  edge: 0x2b1a10,
  wood: 0x8a5a34,
  woodLight: 0xb07a48,
  parchment: 0xf1ddb0,
  parchmentDark: 0xd9bd88,
  ink: '#4a2c18',
  inkSoft: '#7a5434',
  gold: '#8a5a10',
} as const;

export const UI_FONT = '"Trebuchet MS", "Segoe UI", sans-serif';

export function inkText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  size: number,
  color: string = UI_COLORS.ink,
): Phaser.GameObjects.Text {
  return scene.add.text(x, y, text, { fontFamily: UI_FONT, fontSize: `${size}px`, color, fontStyle: 'bold' });
}

/** Draws a framed panel into `g` (outer edge, wood border, optional parchment inset). */
export function drawWoodPanel(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  inset = true,
): void {
  g.fillStyle(UI_COLORS.edge, 1).fillRoundedRect(x, y, w, h, 6);
  g.fillStyle(UI_COLORS.wood, 1).fillRoundedRect(x + 2, y + 2, w - 4, h - 4, 5);
  g.fillStyle(UI_COLORS.woodLight, 1).fillRect(x + 6, y + 3, w - 12, 2);
  if (!inset) return;
  g.fillStyle(UI_COLORS.edge, 0.55).fillRoundedRect(x + 6, y + 6, w - 12, h - 12, 3);
  g.fillStyle(UI_COLORS.parchment, 1).fillRoundedRect(x + 7, y + 7, w - 14, h - 14, 3);
  g.fillStyle(UI_COLORS.parchmentDark, 1).fillRect(x + 8, y + h - 10, w - 16, 2);
}
