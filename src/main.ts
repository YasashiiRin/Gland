import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './config/constants';
import { BootScene } from './scenes/BootScene';
import { FarmScene } from './scenes/FarmScene';
import { HouseScene } from './scenes/HouseScene';
import { MineScene } from './scenes/MineScene';
import { PreloadScene } from './scenes/PreloadScene';
import { TitleScene } from './scenes/TitleScene';
import { TownScene } from './scenes/TownScene';
import { UIScene } from './scenes/UIScene';
import { gameState } from './state/GameState';
import { sessionFlags } from './state/sessionFlags';
import * as SaveService from './systems/SaveService';

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
  scene: [BootScene, TitleScene, PreloadScene, FarmScene, HouseScene, TownScene, MineScene, UIScene],
});

// Safety-net autosave: catches anything since the last day-start save if the
// tab is closed or refreshed mid-day. The main autosave is in MapScene,
// right when a new day begins.
window.addEventListener('beforeunload', () => {
  if (sessionFlags.gameStarted) SaveService.save(gameState);
});

declare global {
  interface Window {
    /** Exposed for debugging in the browser console (e.g. window.game.scene.getScenes(true)). */
    game?: Phaser.Game;
    /** Exposed for debugging only; the saved game never reads this directly. */
    gameState?: typeof gameState;
  }
}
window.game = game;
window.gameState = gameState;
