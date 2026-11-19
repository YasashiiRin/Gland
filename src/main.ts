import Phaser from 'phaser';
import { fitGameSize, GAME_WIDTH, START_GAME_HEIGHT, visibleViewport } from './config/constants';
import { EventBus, GameEvents } from './events/EventBus';
import { closeAllMenus } from './state/uiState';
import { BootScene } from './scenes/BootScene';
import { LobbyScene } from './scenes/LobbyScene';
import { net } from './net/NetSession';
import { MineScene } from './scenes/MineScene';
import { PreloadScene } from './scenes/PreloadScene';
import { ProvinceScene } from './scenes/ProvinceScene';
import { MAP_KEYS } from './data/maps';
import { TitleScene } from './scenes/TitleScene';
import { UIScene } from './scenes/UIScene';
import { gameState } from './state/GameState';
import { sessionFlags } from './state/sessionFlags';
import * as SaveService from './systems/SaveService';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: START_GAME_HEIGHT,
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
    MineScene,
    ...MAP_KEYS.map((key) => new ProvinceScene(key)),
    UIScene,
  ],
});

// Fill the screen: when the window (or phone orientation, or fullscreen)
// changes shape, widen/narrow the canvas to match and lay the UI out again.
let resizeTimer: number | undefined;
function refit(): void {
  const view = visibleViewport();
  const { width, height } = fitGameSize(view.width, view.height);
  if (Math.abs(width - game.scale.gameSize.width) < 4 && Math.abs(height - game.scale.gameSize.height) < 4) return;
  game.scale.setGameSize(width, height);
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
const scheduleRefit = (): void => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(refit, 200);
};
window.addEventListener('resize', scheduleRefit);
window.addEventListener('orientationchange', scheduleRefit);
// Phone browsers show and hide their toolbars without always firing "resize".
window.visualViewport?.addEventListener('resize', scheduleRefit);

// Phones: the first touch asks for fullscreen (Android hides the browser bars
// that would otherwise cover the top of the game; iPhones ignore it, and the
// game is fitted to what stays visible instead).
const goFullscreenOnTouch = (): void => {
  const el = document.documentElement;
  if (!document.fullscreenElement && el.requestFullscreen) el.requestFullscreen({ navigationUI: 'hide' }).catch(() => undefined);
};
window.addEventListener('touchend', goFullscreenOnTouch, { once: true });

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
