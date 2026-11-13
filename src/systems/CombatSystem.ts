export interface Monster {
  x: number;
  y: number;
  health: number;
  damage: number;
}

export const MONSTER_SIGHT_RANGE = 5; // tiles
export const MONSTER_MOVE_COOLDOWN_MS = 500;

/**
 * One step of simple chase AI: if the player is within sight range, move one
 * tile closer (horizontally or vertically, picking whichever axis has the
 * bigger gap); otherwise stay put. Never moves onto the player's own tile.
 */
export function stepMonsterTowardPlayer(monster: Monster, playerX: number, playerY: number): Monster {
  const dx = playerX - monster.x;
  const dy = playerY - monster.y;
  const dist = Math.abs(dx) + Math.abs(dy);
  if (dist === 0 || dist > MONSTER_SIGHT_RANGE) return monster;
  if (dist <= 1) return monster; // already adjacent; let combat handle it, don't step onto the player

  const moveX = Math.abs(dx) >= Math.abs(dy);
  const nx = monster.x + (moveX ? Math.sign(dx) : 0);
  const ny = monster.y + (moveX ? 0 : Math.sign(dy));
  return { ...monster, x: nx, y: ny };
}

export interface SwordDef {
  damage: number;
}

/** Deals damage to a monster; returns the updated monster and whether it died. */
export function attackMonster(monster: Monster, damage: number): { monster: Monster; killed: boolean } {
  const health = Math.max(0, monster.health - damage);
  return { monster: { ...monster, health }, killed: health <= 0 };
}

export function isAdjacent(ax: number, ay: number, bx: number, by: number): boolean {
  return Math.abs(ax - bx) + Math.abs(ay - by) <= 1;
}
