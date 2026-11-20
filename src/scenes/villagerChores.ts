import type Phaser from 'phaser';
import { TILE } from '../config/constants';
import type { TaskKind } from '../systems/npc/config';
import type { Direction } from '../systems/movement';
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

/**
 * Working a field cell: standing at `tile` facing it, one stroke of the tool
 * (raised, brought down) or a handful thrown as the job starts, then still
 * until the next one (each job lasts about 1.4 s: the stroke and a rest).
 */
export function workCell(scene: Phaser.Scene, s: Phaser.GameObjects.Sprite, p: Worker, tile: { x: number; y: number }, facing: Direction, job: string, kind: TaskKind, time: number): void {
  standAt(s.setCrop().setAngle(0), tile.x * TILE + TILE / 2, tile.y * TILE + TILE - 2, facing, time, false);
  if (p.lastJob === job) return;
  p.lastJob = job;
  const tool = TOOL[kind];
  if (tool) swingTool(scene, s, tool, facing);
  else toss(scene, s, kind === 'fertilize' ? 0x6a5a40 : 0x8fd16a);
}

/** Scattering feed to the chickens and pigs. */
export function feedAnimals(scene: Phaser.Scene, s: Phaser.GameObjects.Sprite, p: Worker, x: number, y: number, time: number): void {
  standAt(s, x, y, 'right', time, true);
  if (time < p.nextMove) return;
  p.nextMove = time + 1500;
  toss(scene, s, 0xe0c070);
}

/** Keeps a point 20 px behind a walking person, for the animal they lead. */
export function follow(p: Worker, s: { x: number; y: number }): void {
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
