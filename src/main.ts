import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './config/constants';
import { BootScene } from './scenes/BootScene';
import { FarmScene } from './scenes/FarmScene';
import { HouseScene } from './scenes/HouseScene';
import { PreloadScene } from './scenes/PreloadScene';
import { TownScene } from './scenes/TownScene';
import { UIScene } from './scenes/UIScene';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1b1f17',
  pixelArt: true,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  // UI must come last so it draws on top of the map scenes.
  scene: [BootScene, PreloadScene, FarmScene, HouseScene, TownScene, UIScene],
});

declare global {
  interface Window {
    /** Exposed for debugging in the browser console (e.g. window.game.scene.getScenes(true)). */
    game?: Phaser.Game;
  }
}
window.game = game;
