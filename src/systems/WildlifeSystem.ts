/**
 * Wild beasts of the deep forest (pure logic): a tiger roams near its den.
 * When someone comes close it first ROARS as a warning and stands its
 * ground; if they keep coming (or stay close) it charges and strikes very
 * hard, then backs off to rest. Walk away during the roar and it lets you go.
 */
export type BeastMode = 'roam' | 'warn' | 'charge' | 'rest';

export interface Beast {
  x: number;
  y: number;
  denX: number;
  denY: number;
  mode: BeastMode;
  /** Seconds left in the current mode (warn / rest). */
  timer: number;
}

export const TIGER = {
  /** Notices you within this many px and roars. */
  noticeRange: 7 * 16,
  /** After the roar: still this close → it charges. */
  attackRange: 5 * 16,
  /** It gives up the chase beyond this. */
  loseRange: 11 * 16,
  /** Seconds of warning (roaring, standing still). */
  warnSeconds: 2.4,
  restSeconds: 8,
  roamSpeed: 20,
  chargeSpeed: 118,
  hitRange: 13,
  /** Damage: this share of max health per strike. */
  damageShare: 0.45,
  /** Stays within this many px of its den while roaming. */
  roamRadius: 12 * 16,
} as const;

export function createBeast(x: number, y: number): Beast {
  return { x, y, denX: x, denY: y, mode: 'roam', timer: 0 };
}

export interface BeastStep {
  beast: Beast;
  /** The tiger just started its warning roar. */
  roared: boolean;
  /** The tiger hit the player this step. */
  struck: boolean;
}

/**
 * Advances one beast by dt seconds. `player` is null when there is no one to
 * hunt (e.g. inside a safe zone or on a boat). `wander` is the roaming
 * heading the scene picked.
 */
export function stepBeast(
  b: Beast,
  dt: number,
  player: { x: number; y: number } | null,
  wander: { dx: number; dy: number },
): BeastStep {
  const dist = player ? Math.hypot(player.x - b.x, player.y - b.y) : Infinity;
  let { x, y, mode, timer } = b;
  let roared = false;
  let struck = false;
  timer = Math.max(0, timer - dt);

  if (mode === 'roam') {
    if (dist < TIGER.noticeRange) {
      mode = 'warn';
      timer = TIGER.warnSeconds;
      roared = true;
    } else {
      const homeD = Math.hypot(x - b.denX, y - b.denY);
      const back = homeD > TIGER.roamRadius ? { dx: (b.denX - x) / homeD, dy: (b.denY - y) / homeD } : wander;
      x += back.dx * TIGER.roamSpeed * dt;
      y += back.dy * TIGER.roamSpeed * dt;
    }
  } else if (mode === 'warn') {
    if (dist > TIGER.noticeRange * 1.15) mode = 'roam';
    else if (timer <= 0) mode = dist < TIGER.attackRange ? 'charge' : 'roam';
  } else if (mode === 'charge' && player) {
    if (dist > TIGER.loseRange) mode = 'roam';
    else if (dist < TIGER.hitRange) {
      struck = true;
      mode = 'rest';
      timer = TIGER.restSeconds;
    } else {
      x += ((player.x - x) / dist) * TIGER.chargeSpeed * dt;
      y += ((player.y - y) / dist) * TIGER.chargeSpeed * dt;
    }
  } else if (mode === 'charge') {
    mode = 'roam';
  } else if (mode === 'rest') {
    // Backs off toward its den, then roams again.
    const homeD = Math.hypot(x - b.denX, y - b.denY);
    if (homeD > 4) {
      x += ((b.denX - x) / homeD) * TIGER.roamSpeed * 2 * dt;
      y += ((b.denY - y) / homeD) * TIGER.roamSpeed * 2 * dt;
    }
    if (timer <= 0) mode = 'roam';
  }
  return { beast: { ...b, x, y, mode, timer }, roared, struck };
}

export function tigerDamage(maxHealth: number): number {
  return Math.round(maxHealth * TIGER.damageShare);
}

/**
 * Picks den tiles for tigers: deep-forest tiles (at least 13 trees in the 9x9 around
 * them), spaced far apart, outside the excluded rectangles (safe zones).
 */
export function pickDens(
  w: number,
  h: number,
  isTree: (x: number, y: number) => boolean,
  excluded: { x0: number; y0: number; x1: number; y1: number }[],
  count: number,
  minGap = 40,
): { x: number; y: number }[] {
  const dens: { x: number; y: number }[] = [];
  const scored: { x: number; y: number; n: number }[] = [];
  for (let y = 6; y < h - 6; y += 5) {
    for (let x = 6; x < w - 6; x += 5) {
      if (isTree(x, y) || excluded.some((r) => x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1)) continue;
      let n = 0;
      for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) if (isTree(x + dx, y + dy)) n++;
      if (n >= 13) scored.push({ x, y, n });
    }
  }
  scored.sort((a, b) => b.n - a.n || a.y - b.y || a.x - b.x);
  for (const s of scored) {
    if (dens.length >= count) break;
    if (dens.every((d) => Math.hypot(d.x - s.x, d.y - s.y) >= minGap)) dens.push({ x: s.x, y: s.y });
  }
  return dens;
}
