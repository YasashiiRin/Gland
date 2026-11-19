import type Phaser from 'phaser';

/** An area outlined on the big map (world tiles): a landmark, or someone's plot. Nothing may be taken there. */
export interface ZoneBox {
  x: number;
  y: number;
  w: number;
  h: number;
  mine: boolean;
  landmark: boolean;
  /** Who lives there (a player's house), if anyone. */
  owner?: string;
}

/** Where a plot's house stands inside it (tiles from its corner; scenes/homesteads.ts HOUSE_MIDDLE). */
export const HOUSE_IN_PLOT = { x: 9.5, y: 6.5 };

/**
 * Landmarks (gold, shaded) and other people's plots (red, once zoomed in) where
 * nothing may be felled, mined or cut; my own plot in green with a little house.
 * Returns where my house was drawn (screen px) and its size, for the label.
 */
export function drawZones(
  g: Phaser.GameObjects.Graphics,
  zones: ZoneBox[],
  toScreen: (x: number, y: number) => { x: number; y: number },
  zoom: number,
  fitZoom: number,
): { x: number; y: number; size: number } | null {
  let home: { x: number; y: number; size: number } | null = null;
  for (const z of zones) {
    const a = toScreen(z.x, z.y);
    const w = z.w * zoom;
    const h = z.h * zoom;
    if (z.mine) {
      g.fillStyle(0x6fdc5a, 0.25).fillRect(a.x, a.y, w, h).lineStyle(2, 0x6fdc5a, 1).strokeRect(a.x, a.y, w, h);
      const c = toScreen(z.x + HOUSE_IN_PLOT.x, z.y + HOUSE_IN_PLOT.y);
      home = { x: c.x, y: c.y, size: Math.max(6, Math.min(14, zoom * 2)) };
    } else if (z.landmark) {
      g.fillStyle(0xffd060, 0.16).fillRect(a.x, a.y, w, h).lineStyle(2, 0xffd060, 0.95).strokeRect(a.x, a.y, w, h);
    } else if (zoom >= fitZoom * 1.6) {
      g.lineStyle(1, 0xe0604f, 0.85).strokeRect(a.x, a.y, w, h);
    }
  }
  // A red dot on every player's house (named by WorldMap).
  for (const z of zones) {
    if (!z.owner) continue;
    const p = toScreen(z.x + HOUSE_IN_PLOT.x, z.y + HOUSE_IN_PLOT.y);
    g.fillStyle(0xffffff, 1).fillCircle(p.x, p.y + (z.mine ? 12 : 0), 5).fillStyle(0xd8261c, 1).fillCircle(p.x, p.y + (z.mine ? 12 : 0), 3.5);
  }
  if (home) {
    const { x, y, size: s } = home;
    g.fillStyle(0xffffff, 1).fillTriangle(x - s - 1, y, x, y - s - 1, x + s + 1, y);
    g.fillStyle(0xd9822b, 1).fillTriangle(x - s, y, x, y - s, x + s, y);
    g.fillStyle(0xf4e4c1, 1).fillRect(x - s * 0.7, y, s * 1.4, s);
    g.fillStyle(0x6b3e1f, 1).fillRect(x - s * 0.2, y + s * 0.3, s * 0.4, s * 0.7);
  }
  return home;
}
