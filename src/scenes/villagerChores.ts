import type Phaser from 'phaser';
import { TILE } from '../config/constants';
import { DAY_LENGTH_MINUTES } from '../config/time';
import { gameState } from '../state/GameState';
import type { Direction } from '../systems/movement';
import { jobFront, strips, stripTile, tilesDone, type FieldJob, type FieldState, type PaddyRect } from '../systems/NpcFarmSystem';
import { absoluteMinute } from '../systems/StatsSystem';
import type { Homestead } from './homesteads';
import { swingTool } from './toolSwing';

/**
 * What a villager does with their hands (villagers.ts decides when): working
 * the paddy one tile at a time like the player, weeding it, the yard garden,
 * and leading the buffalo home.
 */
const DIRS: Direction[] = ['down', 'left', 'right', 'up'];
const TOOL: Partial<Record<FieldJob, 'hoe' | 'watering_can' | 'scythe'>> = { hoe: 'hoe', water: 'watering_can', harvest: 'scythe' };

export interface Worker {
  index: number;
  nextMove: number;
  /** The tile of the strip last worked (one stroke per tile). */
  tile?: number;
  /** Where an animal led by this person walks: a little behind them (see follow). */
  trail?: { x: number; y: number; flip: boolean };
  lastX?: number;
  lastY?: number;
}

export interface PaddyJob {
  paddy: PaddyRect;
  workers: number;
}

/** Stands still at a spot facing `dir` (busy: a little bob, as when stooping to work). */
export function standAt(s: Phaser.GameObjects.Sprite, x: number, y: number, dir: string, time: number, busy: boolean): void {
  s.anims.stop();
  s.setFrame(DIRS.indexOf(dir as Direction) * 4 + (busy ? Math.floor(time / 400) % 2 : 0)).setPosition(x, y).setDepth(y);
}

/**
 * Working the paddy one tile at a time, like the player: standing on the last
 * tile done (or at the row's start), facing the next one, one stroke of the
 * tool per tile, moving on as each is finished (NpcFarmSystem.strips).
 */
export function workPaddy(scene: Phaser.Scene, s: Phaser.GameObjects.Sprite, p: Worker, w: PaddyJob, f: FieldState, job: FieldJob | null, time: number): void {
  const pad = w.paddy;
  const parts = strips(pad, w.workers);
  const strip = parts[p.index % parts.length];
  const today = Math.floor(absoluteMinute(gameState.time) / DAY_LENGTH_MINUTES);
  const k = Math.min(strip.size - 1, tilesDone(jobFront(f, today), strip));
  const next = stripTile(pad, strip, k);
  const away = pad.side === 'north' ? -1 : 1; // rows go away from the road this way
  let at: { x: number; y: number };
  let facing: Direction;
  if (k % (strip.b - strip.a + 1) > 0) {
    const prev = stripTile(pad, strip, k - 1);
    at = { x: prev.x, y: prev.y };
    facing = next.forward ? 'right' : 'left';
  } else {
    at = { x: next.x, y: next.y - away }; // the start of a row: from the row before (or the road)
    facing = away < 0 ? 'up' : 'down';
  }
  standAt(s, at.x * TILE + TILE / 2, at.y * TILE + TILE - 2, facing, time, false);
  if (p.tile === k || time < p.nextMove) return;
  p.tile = k;
  p.nextMove = time + 250; // a stroke takes this long at least
  const tool = job ? TOOL[job] : undefined;
  if (tool) swingTool(scene, s, tool, facing);
  else toss(scene, s, job === 'fertilize' ? 0x6a5a40 : 0x8fd16a);
}

/** Nothing left to do today: weeding along the rows, stooping, a few tiles at a time. */
export function tendPaddy(s: Phaser.GameObjects.Sprite, p: Worker, w: PaddyJob, time: number): void {
  const parts = strips(w.paddy, w.workers);
  const strip = parts[p.index % parts.length];
  const k = Math.floor(time / 4000 + p.index * 37) % strip.size;
  const t = stripTile(w.paddy, strip, k);
  standAt(s, t.x * TILE + TILE / 2, t.y * TILE + TILE - 2, t.forward ? 'right' : 'left', time, true);
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
