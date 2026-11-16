import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/constants';
import { MAP_KEYS, MAPS } from '../data/maps';
import { NPC_IDS, NPCS } from '../data/npcs';

export function portraitKey(npcId: string): string {
  return `portrait_${npcId}`;
}
import { PLAYER_FRAME, PLAYER_TEXTURE } from '../entities/Player';
import { DIRECTIONS } from '../systems/movement';
import { gameState } from '../state/GameState';
import { sessionFlags } from '../state/sessionFlags';
import { createItemIconTextures } from '../ui/itemIcons';

export const TILESET_TEXTURE = 'farm_tiles';
export const RAIN_TEXTURE = 'rain_drop';
export const WOOD_CHIP_TEXTURE = 'wood_chip';
export const WATER_DROPLET_TEXTURE = 'water_droplet';
export const SMOKE_TEXTURE = 'smoke_puff';
export const CROP_TEXTURE = 'crop_plant';

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
    this.load.image('mine_tiles', 'tilesets/mine_tiles.png');
    // Every generated sprite (trees, buildings, furniture, crops, villagers) is
    // listed in this pack, so swapping in real art only means replacing PNGs.
    this.load.pack('generated', 'sprites/pack.json');
    this.load.spritesheet(PLAYER_TEXTURE, 'sprites/player.png', {
      frameWidth: PLAYER_FRAME.width,
      frameHeight: PLAYER_FRAME.height,
    });
    for (const key of MAP_KEYS) {
      const file = MAPS[key].file;
      this.load.tilemapTiledJSON(mapCacheKey(file), `maps/${file}.tmj`);
    }
    for (const npcId of NPC_IDS) {
      this.load.image(portraitKey(npcId), `portraits/${NPCS[npcId].portrait}`);
    }
  }

  create(): void {
    this.createPlayerAnimations();
    this.createRainTexture();
    this.createWoodChipTexture();
    this.createWaterDropletTexture();
    this.createSmokeTexture();
    this.createCropTexture();
    createItemIconTextures(this);
    sessionFlags.gameStarted = true;
    this.scene.launch('UI');
    this.scene.start(gameState.currentMap, { spawn: gameState.spawnId });
  }

  private createRainTexture(): void {
    const g = this.add.graphics();
    g.fillStyle(0xcfe3f5, 1);
    g.fillRect(0, 0, 2, 10);
    g.generateTexture(RAIN_TEXTURE, 2, 10);
    g.destroy();
  }

  /** A small irregular wood-chip, for the burst of splinters when chopping a tree. */
  private createWoodChipTexture(): void {
    const g = this.add.graphics();
    g.fillStyle(0xb98f5a, 1);
    g.fillTriangle(0, 4, 3, 0, 6, 5);
    g.fillStyle(0x8a6540, 1);
    g.fillTriangle(0, 4, 6, 5, 2, 6);
    g.generateTexture(WOOD_CHIP_TEXTURE, 6, 6);
    g.destroy();
  }

  /** A soft grey puff for vehicle exhaust. */
  private createSmokeTexture(): void {
    const g = this.add.graphics();
    g.fillStyle(0x9a9692, 0.7);
    g.fillCircle(5, 5, 5);
    g.fillStyle(0xc8c4bc, 0.8);
    g.fillCircle(4, 4, 3);
    g.generateTexture(SMOKE_TEXTURE, 10, 10);
    g.destroy();
  }

  /** A small round water droplet, for the splash when using the watering can. */
  private createWaterDropletTexture(): void {
    const g = this.add.graphics();
    g.fillStyle(0x6ea8c9, 1);
    g.fillCircle(3, 3, 3);
    g.fillStyle(0xbfe0f0, 0.9);
    g.fillCircle(2, 2, 1);
    g.generateTexture(WATER_DROPLET_TEXTURE, 6, 6);
    g.destroy();
  }

  /** A simple round sprout/plant placeholder; tinted and scaled per growth stage in FarmScene. */
  private createCropTexture(): void {
    const g = this.add.graphics();
    g.fillStyle(0x4a8a4a, 1);
    g.fillRect(7, 6, 2, 10); // stem
    g.fillStyle(0x6fcf6f, 1);
    g.fillEllipse(8, 6, 11, 9); // leafy head
    g.fillStyle(0x8fe08f, 1);
    g.fillEllipse(6, 4, 4, 3);
    g.generateTexture(CROP_TEXTURE, 16, 16);
    g.destroy();
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
