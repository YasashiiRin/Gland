import type Phaser from 'phaser';
import { TILE } from '../config/constants';
import type { TaskKind } from '../systems/npc/config';
import type { Direction } from '../systems/movement';
import { artScale } from './hd';
import { swingTool } from './toolSwing';
import { feedAnimals, standAt, workCell, type Worker } from './villagerChores';
import { walkFrame, type Agent } from './villagerAgents';

type Pt = { x: number; y: number };
const DIRS = ['down', 'left', 'right', 'up'];

/** What a villager does once they stand at their spot (villagers.ts decides it from the timetable). */
export type Pose =
  /** Gone indoors / out of the village (to bed, the market, school). */
  | { kind: 'hide' }
  /** Still on the way somewhere (the timetable has them walking). */
  | { kind: 'walk' }
  | { kind: 'stand'; dir: string; busy: boolean }
  | { kind: 'sit'; dir: string; depth?: number }
  | { kind: 'work'; dir: string; job: string; task: TaskKind }
  | { kind: 'garden' }
  | { kind: 'feed' }
  | { kind: 'nap' };

/** Where to be and what to do there; `speed` overrides the walking speed (children running). */
export interface Plan {
  at: Pt;
  pose: Pose;
  speed?: number;
}

export interface PoseActor extends Worker {
  key: string;
}

/** Walking: the steps follow the distance covered, so they never slide or stutter. */
export function drawWalking(s: Phaser.GameObjects.Sprite, p: PoseActor, a: Agent): void {
  if (s.texture.key !== p.key) s.setTexture(p.key);
  s.anims.stop();
  s.setCrop().setAngle(0).setFrame(walkFrame(a)).setPosition(a.x, a.y).setDepth(a.y);
}

/** Standing on their spot, doing what the pose says. */
export function drawPose(scene: Phaser.Scene, s: Phaser.GameObjects.Sprite, p: PoseActor, pose: Pose, a: Agent, time: number): void {
  if (pose.kind !== 'sit' && s.texture.key !== p.key) s.setTexture(p.key);
  if (pose.kind !== 'sit' && pose.kind !== 'nap') s.setCrop().setAngle(0);
  switch (pose.kind) {
    case 'hide':
    case 'walk':
      return standAt(s, a.x, a.y, a.dir, time, false);
    case 'stand':
      return standAt(s, a.x, a.y, pose.dir, time, pose.busy);
    case 'sit':
      return sit(scene, s, p, a, pose.dir, pose.depth ?? a.y);
    case 'work':
      return workCell(scene, s, p, { x: (a.x - TILE / 2) / TILE, y: (a.y - TILE + 2) / TILE }, pose.dir as Direction, pose.job, pose.task, time);
    case 'garden':
      standAt(s, a.x, a.y, 'right', time, false);
      if (time >= p.nextMove) {
        p.nextMove = time + 2600;
        swingTool(scene, s, Math.random() < 0.33 ? 'watering_can' : 'hoe', 'right');
      }
      return;
    case 'feed':
      return feedAnimals(scene, s, p, a.x, a.y, time);
    case 'nap':
      s.anims.stop();
      s.setCrop().setFrame(0).setAngle(90).setPosition(a.x, a.y).setDepth(a.y);
  }
}

/**
 * Seated: the NPC's own sitting picture ("<key>_sit", same layout as the walk sheet)
 * when there is one, else the standing sprite cut off at the knees and lowered.
 */
function sit(scene: Phaser.Scene, s: Phaser.GameObjects.Sprite, p: PoseActor, a: Pt, dir: string, depth: number): void {
  s.anims.stop();
  const frame = DIRS.indexOf(dir) * 4;
  const seated = `${p.key}_sit`;
  if (scene.textures.exists(seated)) {
    s.setTexture(seated, frame).setAngle(0).setCrop().setPosition(a.x, a.y).setDepth(depth);
    return;
  }
  if (s.texture.key !== p.key) s.setTexture(p.key);
  const k = artScale(scene, p.key);
  s.setAngle(0).setFrame(frame).setCrop(0, 0, 16 * k, 22 * k).setPosition(a.x, a.y + 9).setDepth(depth);
}
