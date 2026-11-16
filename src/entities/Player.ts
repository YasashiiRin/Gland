import Phaser from 'phaser';
import { PLAYER_SPEED } from '../config/constants';
import { computeMovement, type Direction, type MoveInput } from '../systems/movement';

export const PLAYER_TEXTURE = 'player';

/** Frame size of the player spritesheet (4 frames per row, rows: down, left, right, up). */
export const PLAYER_FRAME = { width: 16, height: 32 } as const;

export type PlayerInput = MoveInput;

export class Player extends Phaser.Physics.Arcade.Sprite {
  private facing: Direction = 'down';
  private exhausted = false;

  constructor(scene: Phaser.Scene, x: number, y: number, facing: Direction = 'down') {
    super(scene, x, y, PLAYER_TEXTURE, 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // x/y is the point between the feet, so spawn points and depth sorting line up with tiles.
    this.setOrigin(0.5, 28 / 32);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(10, 6);
    body.setOffset(3, 23);
    body.setCollideWorldBounds(true);

    this.facing = facing;
    this.anims.play(`idle-${facing}`);
  }

  get direction(): Direction {
    return this.facing;
  }

  setExhausted(exhausted: boolean): void {
    this.exhausted = exhausted;
  }

  /** The tile just in front of the player, where tools act and interactions happen. */
  getFacingTile(tileSize: number): { x: number; y: number } {
    const offsets: Record<Direction, [number, number]> = {
      down: [0, 1],
      up: [0, -1],
      left: [-1, 0],
      right: [1, 0],
    };
    const [dx, dy] = offsets[this.facing];
    return {
      x: Math.floor(this.x / tileSize) + dx,
      y: Math.floor(this.y / tileSize) + dy,
    };
  }

  /** Turns to look at a tile (used when aiming with the mouse). Keeps facing if it's our own tile. */
  faceTile(tile: { x: number; y: number }, tileSize: number): void {
    const dx = tile.x - Math.floor(this.x / tileSize);
    const dy = tile.y - Math.floor(this.y / tileSize);
    if (dx === 0 && dy === 0) return;
    if (Math.abs(dx) >= Math.abs(dy)) this.facing = dx > 0 ? 'right' : 'left';
    else this.facing = dy > 0 ? 'down' : 'up';
    if (!this.body?.velocity || (this.body.velocity.x === 0 && this.body.velocity.y === 0)) {
      this.anims.play(`idle-${this.facing}`, true);
    }
  }

  /** Brief squash-and-stretch feedback for using a tool; purely cosmetic. */
  playUseToolFeedback(): void {
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.15,
      scaleY: 0.85,
      duration: 90,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }

  /**
   * There is no "run" button: speed comes only from stats (vehicle, held
   * weapon, food buffs), passed in as `speedMultiplier`.
   */
  updateMovement(input: PlayerInput, speedMultiplier = 1): void {
    const speedScale = this.exhausted ? 0.5 : 1;
    const speed = PLAYER_SPEED * speedMultiplier * speedScale;
    const result = computeMovement(input, speed, this.facing);
    this.setVelocity(result.vx, result.vy);
    this.facing = result.facing;

    const anim = `${result.moving ? 'walk' : 'idle'}-${this.facing}`;
    this.anims.play(anim, true);
    this.anims.timeScale = Math.min(2, Math.max(0.6, speedMultiplier));

    // Things lower on screen draw in front of things above them.
    this.setDepth(this.y);
  }

  halt(): void {
    this.setVelocity(0, 0);
    this.anims.play(`idle-${this.facing}`, true);
  }
}
