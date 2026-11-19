import { seededRandom } from './clock';
import type { NpcConfig } from './config';

/**
 * What a child minding the buffalo (or playing in the yard) does from moment
 * to moment (pure). Staying within reach of the buffalo comes first; a child
 * nearby means a game of tag; otherwise every few minutes they pick between
 * walking after the buffalo, lying on its back and a nap in the grass.
 */
export type PastureDoing = 'follow' | 'ride' | 'nap' | 'chase';

export function childAtPasture(distToBuffaloTiles: number, otherChildTiles: number | null, minute: number, seed: number, cfg: NpcConfig): PastureDoing {
  if (distToBuffaloTiles > cfg.child.buffaloRadiusTiles) return 'follow';
  if (otherChildTiles !== null && otherChildTiles <= cfg.child.playRadiusTiles) return 'chase';
  const pick = seededRandom(seed, Math.floor(minute / cfg.child.behaviourMinutes));
  return pick < 0.4 ? 'follow' : pick < 0.7 ? 'ride' : 'nap';
}

/** At home: tag with a child close by, otherwise running about the yard. */
export function childAtHome(otherChildTiles: number | null, cfg: NpcConfig): 'chase' | 'play' {
  return otherChildTiles !== null && otherChildTiles <= cfg.child.playRadiusTiles ? 'chase' : 'play';
}

/** Keeps a point within `radius` of a centre (for the yard and the buffalo's grazing ground). */
export function clampToRadius(x: number, y: number, cx: number, cy: number, radius: number): { x: number; y: number } {
  const dx = x - cx;
  const dy = y - cy;
  const d = Math.hypot(dx, dy);
  if (d <= radius) return { x, y };
  return { x: cx + (dx / d) * radius, y: cy + (dy / d) * radius };
}
