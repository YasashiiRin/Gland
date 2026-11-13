export type Direction = 'down' | 'left' | 'right' | 'up';

export const DIRECTIONS: readonly Direction[] = ['down', 'left', 'right', 'up'];

export interface MoveInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export interface MoveResult {
  vx: number;
  vy: number;
  facing: Direction;
  moving: boolean;
}

/**
 * Turns pressed keys into a velocity. Diagonals are normalized so the player
 * is not faster when moving diagonally. While moving diagonally the player
 * keeps facing the previous direction if it is still one of the pressed ones.
 */
export function computeMovement(input: MoveInput, speed: number, previous: Direction): MoveResult {
  const dx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const dy = (input.down ? 1 : 0) - (input.up ? 1 : 0);

  if (dx === 0 && dy === 0) {
    return { vx: 0, vy: 0, facing: previous, moving: false };
  }

  const length = Math.hypot(dx, dy);
  const vx = (dx / length) * speed;
  const vy = (dy / length) * speed;

  const horizontal: Direction | null = dx < 0 ? 'left' : dx > 0 ? 'right' : null;
  const vertical: Direction | null = dy < 0 ? 'up' : dy > 0 ? 'down' : null;

  let facing: Direction;
  if (horizontal && vertical) {
    facing = previous === horizontal || previous === vertical ? previous : horizontal;
  } else {
    facing = (horizontal ?? vertical) as Direction;
  }

  return { vx, vy, facing, moving: true };
}
