import Phaser from 'phaser';
import { EventBus, GameEvents, type MapEnteredPayload } from '../events/EventBus';
import { Hud } from '../ui/Hud';

/** Runs on top of the map scenes and draws the interface at full resolution. */
export class UIScene extends Phaser.Scene {
  private hud!: Hud;

  constructor() {
    super('UI');
  }

  create(): void {
    this.hud = new Hud(this);
    const onMap = (p: MapEnteredPayload) => this.hud.setLocation(p.displayName);
    EventBus.on(GameEvents.MapEntered, onMap);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => EventBus.off(GameEvents.MapEntered, onMap));
  }
}
