import type Phaser from 'phaser';
import { clampToRadius } from '../systems/npc/child';
import { stepTowards } from './villagerChores';

/** Running about at play (px a second). */
export const RUN = 40;

/** A child at play (villagers.ts). */
export interface Player {
  key: string;
  index: number;
  /** Where they are running to. */
  goal?: { x: number; y: number };
}

/** The closest other child on screen, if any. */
export function nearestOther(s: Phaser.GameObjects.Sprite, children: Phaser.GameObjects.Sprite[]): { s: Phaser.GameObjects.Sprite; d: number } | null {
  let best: { s: Phaser.GameObjects.Sprite; d: number } | null = null;
  for (const c of children) {
    if (c === s || !c.active || !c.visible) continue;
    const d = Math.hypot(c.x - s.x, c.y - s.y);
    if (!best || d < best.d) best = { s: c, d };
  }
  return best;
}

/** Tag: running round and round the point between the two of them. */
export function chase(p: Player, s: Phaser.GameObjects.Sprite, other: Phaser.GameObjects.Sprite, time: number, delta: number): void {
  s.setCrop().setAngle(0);
  const mx = (s.x + other.x) / 2;
  const my = (s.y + other.y) / 2;
  const a = time / 900 + p.index * Math.PI;
  stepTowards(s, p.key, mx + Math.cos(a) * 28, my + Math.sin(a) * 16, RUN * 1.5, delta);
}

/** Running about within `radius` px of a point, from one spot to the next. */
export function roam(p: Player, s: Phaser.GameObjects.Sprite, centre: { x: number; y: number }, radius: number, delta: number): void {
  s.setCrop().setAngle(0);
  if (!p.goal || Math.hypot(s.x - centre.x, s.y - centre.y) > radius * 1.5) {
    if (!p.goal) s.setPosition(centre.x, centre.y);
    p.goal = centre;
  }
  if (stepTowards(s, p.key, p.goal.x, p.goal.y, RUN * 0.6, delta)) {
    const r = radius * 0.6 * Math.random();
    const a = Math.random() * Math.PI * 2;
    p.goal = clampToRadius(centre.x + Math.cos(a) * r, centre.y + Math.sin(a) * r * 0.5, centre.x, centre.y, radius);
  }
}
