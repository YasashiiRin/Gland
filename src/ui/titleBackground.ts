import Phaser from 'phaser';

/**
 * Title-screen backdrop drawn with plain shapes: a warm evening sky, misty
 * mountains, terraced rice paddies with water reflections, a tiled-roof
 * cottage and bamboo, and a few storks drifting across.
 */
export function drawTitleBackground(scene: Phaser.Scene): void {
  const { width: W, height: H } = scene.scale;
  if (scene.textures.exists('ui_title_background')) {
    // The painted backdrop (assets/ui/title_background.png), covering the screen.
    const img = scene.add.image(W / 2, H / 2, 'ui_title_background');
    img.setScale(Math.max(W / img.width, H / img.height));
    return;
  }
  const g = scene.add.graphics();

  const sky = [0xf3c98b, 0xf0b98a, 0xe6a184, 0xc98b86, 0x9d7f93];
  sky.forEach((c, i) => g.fillStyle(c, 1).fillRect(0, (i * H * 0.5) / sky.length, W, H * 0.1 + 2));
  g.fillStyle(0xfff0c0, 0.9).fillCircle(W * 0.72, H * 0.27, 34);
  g.fillStyle(0xfff6d8, 0.35).fillCircle(W * 0.72, H * 0.27, 52);

  const ridge = (y: number, amp: number, color: number, seed: number) => {
    const pts: Phaser.Types.Math.Vector2Like[] = [{ x: 0, y: H }];
    for (let x = 0; x <= W; x += 24) {
      pts.push({ x, y: y - amp * (0.5 + 0.5 * Math.sin(x / 90 + seed) * Math.cos(x / 37 + seed * 2)) });
    }
    pts.push({ x: W, y: H });
    g.fillStyle(color, 1).fillPoints(pts, true);
  };
  ridge(H * 0.48, 70, 0x8a7d98, 1);
  ridge(H * 0.55, 50, 0x6f7a7e, 3);
  ridge(H * 0.6, 30, 0x5d7656, 5);

  // Terraced paddies: bands of young rice with thin bright water lines.
  const bands = [0x6f9a4e, 0x7fa856, 0x6a944a, 0x88b05c, 0x739f50, 0x7ea655];
  let y = H * 0.62;
  bands.forEach((c, i) => {
    const h = 26 + i * 8;
    g.fillStyle(c, 1).fillRect(0, y, W, h);
    g.fillStyle(0xd8e6c0, 0.55).fillRect(0, y + h - 3, W, 2);
    for (let x = (i * 17) % 12; x < W; x += 12) g.fillStyle(0x5b8a40, 1).fillRect(x, y + 4 + (x % 7), 2, 5);
    y += h;
  });

  // Cottage on the left: lime-yellow walls, clay-tile roof with upturned ridge ends.
  const hx = W * 0.14;
  const hy = H * 0.62;
  g.fillStyle(0xd9b064, 1).fillRect(hx - 50, hy - 34, 100, 34);
  g.fillStyle(0x6a4428, 1).fillRect(hx - 9, hy - 26, 18, 26);
  g.fillStyle(0xa64e34, 1).fillTriangle(hx - 66, hy - 32, hx + 66, hy - 32, hx, hy - 70);
  g.fillStyle(0x7e3626, 1).fillRect(hx - 52, hy - 72, 104, 6);
  g.fillTriangle(hx - 56, hy - 66, hx - 50, hy - 66, hx - 60, hy - 80);
  g.fillTriangle(hx + 56, hy - 66, hx + 50, hy - 66, hx + 60, hy - 80);

  // Bamboo clumps on the right.
  for (let i = 0; i < 9; i++) {
    const bx = W * 0.86 + i * 9 - 36;
    const lean = (i - 4) * 3;
    g.lineStyle(3, 0x4f6a2e, 1).lineBetween(bx, hy, bx + lean, hy - 130 - (i % 3) * 18);
    g.fillStyle(0x56803a, 0.85).fillEllipse(bx + lean, hy - 120 - (i % 3) * 18, 26, 14);
  }

  // Storks gliding across the sky.
  const storks = scene.add.graphics();
  const drawStork = (sx: number, sy: number) => {
    storks.lineStyle(2, 0xfdf8ee, 1);
    storks.lineBetween(sx - 7, sy - 2, sx, sy + 1);
    storks.lineBetween(sx, sy + 1, sx + 7, sy - 2);
  };
  [
    [W * 0.3, H * 0.16],
    [W * 0.34, H * 0.2],
    [W * 0.38, H * 0.14],
  ].forEach(([sx, sy]) => drawStork(sx, sy));
  scene.tweens.add({ targets: storks, x: W * 0.25, y: -20, duration: 26000, repeat: -1 });
}
