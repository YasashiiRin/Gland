import Phaser from 'phaser';
import { PLAYER_SPEED, RUN_MULTIPLIER } from '../config/constants';
import { computeMovement, type Direction, type MoveInput } from '../systems/movement';

export const PLAYER_TEXTURE = 'player';

/** Frame size of the player spritesheet (4 frames per row, rows: down, left, right, up). */
export const PLAYER_FRAME = { width: 16, height: 32 } as const;

export interface PlayerInput extends MoveInput {
  run: boolean;
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  private facing: Direction = 'down';

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

  updateMovement(input: PlayerInput): void {
    const speed = PLAYER_SPEED * (input.run ? RUN_MULTIPLIER : 1);
    const result = computeMovement(input, speed, this.facing);
    this.setVelocity(result.vx, result.vy);
    this.facing = result.facing;

    const anim = `${result.moving ? 'walk' : 'idle'}-${this.facing}`;
    this.anims.play(anim, true);
    this.anims.timeScale = input.run ? 1.5 : 1;

    // Things lower on screen draw in front of things above them.
    this.setDepth(this.y);
  }

  halt(): void {
    this.setVelocity(0, 0);
    this.anims.play(`idle-${this.facing}`, true);
  }
}
