import { TILE } from '../config/constants';
import { MINUTES_PER_TICK, MS_PER_TICK } from '../config/time';
import { findPath } from '../systems/gridPath';
import { NPC_CONFIG } from '../systems/npc/config';

type Pt = { x: number; y: number };

/**
 * A villager's body in the world: where they stand (feet, world px), the way
 * they are walking and how far they have walked (for the steps). It exists
 * whether anyone looks or not; villagers.ts tells it where to go and only
 * draws it near the camera.
 */
export interface Agent {
  x: number;
  y: number;
  /** Waypoints still to walk (px); the last one is the target. */
  path: Pt[];
  /** Where they are heading (null: nowhere yet). */
  target: Pt | null;
  arrived: boolean;
  /** Waiting for a route to be worked out. */
  pending: boolean;
  dir: string;
  /** Distance walked so far (px), for the walking frames. */
  walked: number;
}

/**
 * Walking speed (px a second) matching the timetable's walking minutes:
 * `walkTilesPerMinute` tiles each game minute, a game minute being 0.7 s.
 */
export const WALK_SPEED = (NPC_CONFIG.travel.walkTilesPerMinute * TILE) / (MS_PER_TICK / MINUTES_PER_TICK / 1000);
/** A target moving less than this (px) is followed, not re-planned (a swept yard, a buffalo walking). */
const REPLAN_PX = 10;
/** Closer than this (tiles), walk straight there; farther, find a way round walls and houses. */
const STRAIGHT_TILES = 3;
/** Path-finding is costly: this many new routes per frame at most (the rest wait a frame or two). */
const ROUTES_PER_FRAME = 2;
const MAX_NODES = 40000;
/** Px walked per step frame (4 frames a cycle). */
const STRIDE = 7;

export function createAgent(at: Pt): Agent {
  return { x: at.x, y: at.y, path: [], target: { ...at }, arrived: true, pending: false, dir: 'down', walked: 0 };
}

/** Works out walking routes, a few per frame. */
export class AgentPlanner {
  private budget = 0;

  constructor(private readonly walkable: (x: number, y: number) => boolean) {}

  newFrame(): void {
    this.budget = ROUTES_PER_FRAME;
  }

  /** Waypoints from `from` to `to` (px), or null when this frame's budget is spent (ask again). */
  route(from: Pt, to: Pt): Pt[] | null {
    const a = { x: Math.floor(from.x / TILE), y: Math.floor((from.y - 1) / TILE) };
    const b = { x: Math.floor(to.x / TILE), y: Math.floor((to.y - 1) / TILE) };
    if (Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)) <= STRAIGHT_TILES) return [to];
    if (this.budget <= 0) return null;
    this.budget--;
    // Seats and tables may stand on tiles nobody walks on: getting next to the spot is enough.
    const tiles = findPath(a, this.walkable, (x, y) => Math.max(Math.abs(x - b.x), Math.abs(y - b.y)) <= 1, MAX_NODES);
    if (!tiles) return [to];
    return [...tiles.slice(1).map((t) => ({ x: t.x * TILE + TILE / 2, y: t.y * TILE + TILE - 2 })), to];
  }
}

/**
 * One frame of walking towards `target` at `speed` px/s. A new target far
 * from the old one gets a new route; a target that only shifts a little is
 * followed. Returns true once standing on the target.
 */
export function moveAgent(a: Agent, target: Pt, speed: number, delta: number, planner: AgentPlanner): boolean {
  const moved = !a.target || Math.hypot(a.target.x - target.x, a.target.y - target.y) > REPLAN_PX;
  if (moved || a.pending) {
    a.target = { ...target };
    const route = planner.route(a, target);
    a.pending = route === null;
    a.path = route ?? [];
    a.arrived = false;
  } else {
    a.target = { ...target };
    if (a.path.length) a.path[a.path.length - 1] = { ...target };
    else if (Math.hypot(a.x - target.x, a.y - target.y) > 0.5) a.path = [{ ...target }];
  }
  let left = (speed * delta) / 1000;
  while (left > 0 && a.path.length) {
    const next = a.path[0];
    const dx = next.x - a.x;
    const dy = next.y - a.y;
    const d = Math.hypot(dx, dy);
    if (d > 0.01) a.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
    if (d <= left) {
      a.x = next.x;
      a.y = next.y;
      a.walked += d;
      left -= d;
      a.path.shift();
    } else {
      a.x += (dx / d) * left;
      a.y += (dy / d) * left;
      a.walked += left;
      left = 0;
    }
  }
  a.arrived = !a.pending && a.path.length === 0 && Math.hypot(a.x - target.x, a.y - target.y) <= 0.5;
  return a.arrived;
}

/** The frame of the walking cycle for how far they've walked (rows: down, left, right, up). */
export function walkFrame(a: Agent): number {
  return ['down', 'left', 'right', 'up'].indexOf(a.dir) * 4 + (Math.floor(a.walked / STRIDE) % 4);
}
