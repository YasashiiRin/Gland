import Phaser from 'phaser';
import { EventBus, GameEvents } from '../events/EventBus';
import { gameState } from '../state/GameState';

/**
 * Applies the player's zoom setting to a world camera: a map that fits on
 * screen at this zoom is centred; a bigger one is followed and clamped to
 * its edges. Re-applies automatically when the zoom setting changes.
 */
export function setupWorldCamera(
  scene: Phaser.Scene,
  mapW: number,
  mapH: number,
  target: Phaser.GameObjects.GameObject & { x: number; y: number },
  background: string,
): void {
  const cam = scene.cameras.main;
  cam.setRoundPixels(true);
  cam.setBackgroundColor(background);

  const apply = () => {
    const zoom = gameState.settings.zoom;
    cam.setZoom(zoom);
    const fits = mapW <= cam.width / zoom && mapH <= cam.height / zoom;
    if (fits) {
      cam.stopFollow();
      cam.removeBounds();
      cam.centerOn(mapW / 2, mapH / 2);
    } else {
      cam.setBounds(0, 0, mapW, mapH);
      cam.startFollow(target, true, 0.15, 0.15);
      cam.centerOn(target.x, target.y);
    }
  };
  apply();
  EventBus.on(GameEvents.ZoomChanged, apply);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => EventBus.off(GameEvents.ZoomChanged, apply));
}
