import type Phaser from 'phaser';
import { TILE } from '../config/constants';
import { findPath, type TilePath } from '../systems/gridPath';
import type { Place } from '../systems/npc/types';
import type { FamilyGeo } from './npcWorld';

/** Path-finding is costly: at most this many new routes are worked out per frame (the rest walk straight meanwhile). */
let budget = 0;
export function resetRouteBudget(): void {
  budget = 1;
}

/**
 * The walking routes of one family between its places, found on the map the
 * first time the family is seen up close (never for families off screen).
 * The market lies off along the road past the field.
 */
export class Routes {
  private readonly cache = new Map<string, TilePath>();

  constructor(
    private readonly geo: FamilyGeo,
    private readonly walkable: (x: number, y: number) => boolean,
  ) {}

  path(from: Place, to: Place): TilePath {
    if (to === 'market') return [...this.path(from, 'field'), ...this.road()];
    if (from === 'market') return [...this.path(to, 'market')].reverse();
    const key = `${from}>${to}`;
    const back = this.cache.get(`${to}>${from}`);
    if (back) return [...back].reverse();
    const hit = this.cache.get(key);
    if (hit) return hit;
    const a = this.geo.spots[from];
    const b = this.geo.spots[to];
    if (from === to) return [a];
    if (budget <= 0) return [a, b];
    budget--;
    const found = findPath(a, this.walkable, (x, y) => x === b.x && y === b.y, 80000) ?? [a, b];
    this.cache.set(key, found);
    return found;
  }

  private road(): TilePath {
    const p = this.geo.paddy;
    const start = p ? { x: p.bridgeX, y: p.roadY } : this.geo.spots.home;
    return Array.from({ length: 30 }, (_, i) => ({ x: start.x + i + 1, y: start.y }));
  }
}

/** Puts the walker `fraction` of the way along a path; returns the direction they face. */
export function placeOnPath(s: Phaser.GameObjects.Sprite, key: string, path: TilePath, fraction: number): void {
  const f = Math.max(0, Math.min(1, fraction));
  const steps = Math.max(1, path.length - 1);
  const at = f * steps;
  const i = Math.min(steps - 1, Math.floor(at));
  const a = path[Math.min(i, path.length - 1)];
  const b = path[Math.min(i + 1, path.length - 1)];
  const t = at - i;
  const x = (a.x + (b.x - a.x) * t) * TILE + TILE / 2;
  const y = (a.y + (b.y - a.y) * t) * TILE + TILE - 2;
  s.setPosition(x, y).setDepth(y);
  const dir = Math.abs(b.x - a.x) > Math.abs(b.y - a.y) ? (b.x > a.x ? 'right' : 'left') : b.y > a.y ? 'down' : 'up';
  const anim = `${key}-walk-${dir}`;
  if (s.anims.currentAnim?.key !== anim || !s.anims.isPlaying) s.play(anim);
}
