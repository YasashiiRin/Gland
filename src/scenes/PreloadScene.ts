import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/constants';
import { MAP_KEYS, MAPS } from '../data/maps';
import { PLAYER_FRAME, PLAYER_TEXTURE } from '../entities/Player';
import { DIRECTIONS } from '../systems/movement';
import { gameState } from '../state/GameState';

export const TILESET_TEXTURE = 'farm_tiles';

export function mapCacheKey(file: string): string {
  return `map-${file}`;
}

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload(): void {
    this.drawProgressBar();

    this.load.setPath('assets');
    this.load.image(TILESET_TEXTURE, 'tilesets/farm_tiles.png');
    this.load.spritesheet(PLAYER_TEXTURE, 'sprites/player.png', {
      frameWidth: PLAYER_FRAME.width,
      frameHeight: PLAYER_FRAME.height,
    });
    for (const key of MAP_KEYS) {
      const file = MAPS[key].file;
      this.load.tilemapTiledJSON(mapCacheKey(file), `maps/${file}.tmj`);
    }
  }

  create(): void {
    this.createPlayerAnimations();
    this.scene.launch('UI');
    this.scene.start(gameState.currentMap, { spawn: gameState.spawnId });
  }

  private drawProgressBar(): void {
    const width = 320;
    const x = (GAME_WIDTH - width) / 2;
    const y = GAME_HEIGHT / 2;
    this.add.rectangle(GAME_WIDTH / 2, y, width + 8, 24, 0x3a2f24).setStrokeStyle(2, 0xe8d8b8);
    const bar = this.add.rectangle(x, y, 0, 16, 0x8bc34a).setOrigin(0, 0.5);
    this.add
      .text(GAME_WIDTH / 2, y - 32, 'Đang tải…', { fontFamily: 'sans-serif', fontSize: '18px', color: '#e8d8b8' })
      .setOrigin(0.5);
    this.load.on('progress', (value: number) => {
      bar.width = width * value;
    });
  }

  private createPlayerAnimations(): void {
    DIRECTIONS.forEach((dir, row) => {
      const first = row * 4;
      this.anims.create({
        key: `walk-${dir}`,
        frames: this.anims.generateFrameNumbers(PLAYER_TEXTURE, { start: first, end: first + 3 }),
        frameRate: 8,
        repeat: -1,
      });
      this.anims.create({
        key: `idle-${dir}`,
        frames: [{ key: PLAYER_TEXTURE, frame: first }],
      });
    });
  }
}
