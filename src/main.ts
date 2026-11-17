import Phaser from 'phaser';
import { fitGameWidth, GAME_HEIGHT, GAME_WIDTH } from './config/constants';
import { EventBus, GameEvents } from './events/EventBus';
import { closeAllMenus } from './state/uiState';
import { BootScene } from './scenes/BootScene';
import { FarmScene } from './scenes/FarmScene';
import { HouseScene } from './scenes/HouseScene';
import { LobbyScene } from './scenes/LobbyScene';
import { net } from './net/NetSession';
import { MineScene } from './scenes/MineScene';
import { PreloadScene } from './scenes/PreloadScene';
import { ProvinceScene } from './scenes/ProvinceScene';
import { PROVINCE_MAP_KEYS } from './data/maps';
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
  scene: [
    BootScene,
    TitleScene,
    LobbyScene,
    PreloadScene,
    FarmScene,
    HouseScene,
    TownScene,
    MineScene,
    ...PROVINCE_MAP_KEYS.map((key) => new ProvinceScene(key)),
    UIScene,
  ],
});

// Fill the screen: when the window (or phone orientation, or fullscreen)
// changes shape, widen/narrow the canvas to match and lay the UI out again.
let resizeTimer: number | undefined;
function refit(): void {
  const w = fitGameWidth(window.innerWidth, window.innerHeight);
  if (Math.abs(w - game.scale.gameSize.width) < 4) return;
  game.scale.setGameSize(w, GAME_HEIGHT);
  for (const scene of game.scene.getScenes(true)) {
    if (scene.scene.key === 'UI') {
      closeAllMenus();
      scene.scene.restart();
    } else if (scene.scene.key === 'Title') {
      scene.scene.restart();
    }
  }
  EventBus.emit(GameEvents.ZoomChanged); // world cameras re-centre / re-clamp
}
window.addEventListener('resize', () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(refit, 200);
});

// Safety-net autosave: catches anything since the last day-start save if the
// tab is closed or refreshed mid-day. The main autosave is in MapScene,
// right when a new day begins.
window.addEventListener('beforeunload', () => {
  // A guest is playing on the host's farm: the host keeps the save, not the guest.
  if (sessionFlags.gameStarted && net.role !== 'guest') SaveService.save(gameState);
});

declare global {
  interface Window {
    /** Exposed for debugging in the browser console (e.g. window.game.scene.getScenes(true)). */
    game?: Phaser.Game;
    /** Exposed for debugging only; the saved game never reads this directly. */
    gameState?: typeof gameState;
    /** Exposed for debugging only: the multiplayer session. */
    netDebug?: typeof net;
  }
}
window.game = game;
window.gameState = gameState;
window.netDebug = net;
