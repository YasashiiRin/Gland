import type Phaser from 'phaser';
import { TILE } from '../config/constants';
import type { TaskKind } from '../systems/npc/config';
import type { Direction } from '../systems/movement';
import type { Homestead } from './homesteads';
import { swingTool } from './toolSwing';

/**
 * What a villager does with their hands (villagers.ts decides when and where):
 * a stroke of the tool on a field cell, weeding, the yard garden, feeding the
 * animals, and leading the buffalo home on a rope.
 */
const DIRS: Direction[] = ['down', 'left', 'right', 'up'];
const TOOL: Partial<Record<TaskKind, 'hoe' | 'watering_can' | 'scythe'>> = { hoe: 'hoe', water: 'watering_can', harvest: 'scythe' };

export interface Worker {
  index: number;
  nextMove: number;
  /** The job last started (one stroke per job). */
  lastJob?: string;
  /** Where an animal led by this person walks: a little behind them (see follow). */
  trail?: { x: number; y: number; flip: boolean };
  lastX?: number;
  lastY?: number;
}

/** Stands still at a spot facing `dir` (busy: a little bob, as when stooping to work). */
export function standAt(s: Phaser.GameObjects.Sprite, x: number, y: number, dir: string, time: number, busy: boolean): void {
  s.anims.stop();
  s.setFrame(DIRS.indexOf(dir as Direction) * 4 + (busy ? Math.floor(time / 400) % 2 : 0)).setPosition(x, y).setDepth(y);
}

/** Walks (animated) to a point, `speed` px a second; true once there. */
export function stepTowards(s: Phaser.GameObjects.Sprite, key: string, x: number, y: number, speed: number, delta: number): boolean {
  const dx = x - s.x;
  const dy = y - s.y;
  const d = Math.hypot(dx, dy);
  const step = (speed * delta) / 1000;
  if (d <= step || d < 0.5) {
    s.setPosition(x, y).setDepth(y);
    return true;
  }
  s.setPosition(s.x + (dx / d) * step, s.y + (dy / d) * step).setDepth(s.y);
  const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
  const anim = `${key}-walk-${dir}`;
  if (s.anims.currentAnim?.key !== anim || !s.anims.isPlaying) s.play(anim);
  return false;
}

/** Working a field cell: standing on it, one stroke of the tool (or a handful thrown) per job. */
export function workCell(scene: Phaser.Scene, s: Phaser.GameObjects.Sprite, p: Worker, tile: { x: number; y: number }, job: string, kind: TaskKind, time: number): void {
  const facing: Direction = p.index % 2 ? 'left' : 'right';
  standAt(s, tile.x * TILE + TILE / 2, tile.y * TILE + TILE - 2, facing, time, kind === 'sow' || kind === 'fertilize');
  if (p.lastJob === job || time < p.nextMove) return;
  p.lastJob = job;
  p.nextMove = time + 250;
  const tool = TOOL[kind];
  if (tool) swingTool(scene, s, tool, facing);
  else toss(scene, s, kind === 'fertilize' ? 0x6a5a40 : 0x8fd16a);
}

/** No paddy: hoeing and watering the vegetable rows of the yard, a tile at a stroke. */
export function workGarden(scene: Phaser.Scene, s: Phaser.GameObjects.Sprite, p: Worker, home: Homestead, time: number): void {
  const k = Math.floor(time / 2600 + p.index * 5) % 12;
  const x = (home.x0 + 3 + (k % 6) + p.index * 8) * TILE + TILE / 2;
  const y = (home.y0 + 14 + Math.floor(k / 6)) * TILE + TILE - 2;
  standAt(s, x, y, 'right', time, false);
  if (time < p.nextMove) return;
  p.nextMove = time + 2600;
  swingTool(scene, s, k % 3 === 2 ? 'watering_can' : 'hoe', 'right');
}

/** Scattering feed to the chickens and pigs. */
export function feedAnimals(scene: Phaser.Scene, s: Phaser.GameObjects.Sprite, p: Worker, x: number, y: number, time: number): void {
  standAt(s, x, y, 'right', time, true);
  if (time < p.nextMove) return;
  p.nextMove = time + 1500;
  toss(scene, s, 0xe0c070);
}

/** Keeps a point 20 px behind a walking person, for the animal they lead. */
export function follow(p: Worker, s: Phaser.GameObjects.Sprite): void {
  const dx = s.x - (p.lastX ?? s.x);
  const dy = s.y - (p.lastY ?? s.y);
  const d = Math.hypot(dx, dy);
  if (d > 0.01) p.trail = { x: s.x - (dx / d) * 20, y: s.y - (dy / d) * 20, flip: dx < 0 };
  p.lastX = s.x;
  p.lastY = s.y;
}

/** Sowing or spreading manure: a handful thrown ahead. */
function toss(scene: Phaser.Scene, s: Phaser.GameObjects.Sprite, color: number): void {
  for (let i = 0; i < 5; i++) {
    const d = scene.add.circle(s.x, s.y - 14, 1.2, color).setDepth(s.depth + 1);
    scene.tweens.add({ targets: d, x: s.x + (Math.random() - 0.5) * 22, y: s.y - 2 + Math.random() * 6, alpha: 0.2, duration: 450, onComplete: () => d.destroy() });
  }
}
