import Phaser from 'phaser';
import { TILE } from '../config/constants';
import { isTreeGid } from '../config/tileGids';
import type { Player } from '../entities/Player';
import { EventBus, GameEvents } from '../events/EventBus';
import { gameState } from '../state/GameState';
import { consume } from '../systems/EnergySystem';
import { pickWander } from '../systems/LivestockSystem';
import { playRoar } from '../systems/WildAudio';
import { createBeast, pickDens, stepBeast, tigerDamage, type Beast } from '../systems/WildlifeSystem';

/** Tigers per province map. */
const TIGER_COUNT = 5;

interface Tiger {
  beast: Beast;
  sprite: Phaser.GameObjects.Sprite;
  wander: { dx: number; dy: number };
  nextTurn: number;
}

/** A rectangle in tiles (a safe "zone" object of the map). */
export interface TileRect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/**
 * Tigers living in the deep forest of the big province maps. They never
 * enter the safe landmark zones and leave you alone while you are in one
 * or out on a boat. They roar before they attack (see WildlifeSystem).
 */
export class Tigers {
  private readonly tigers: Tiger[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    decor: Phaser.Tilemaps.TilemapLayer,
    private readonly safeZones: TileRect[],
    private readonly say: (text: string) => void,
  ) {
    if (!scene.textures.exists('animal_tiger')) return;
    if (!scene.anims.exists('animal_tiger_walk')) {
      scene.anims.create({ key: 'animal_tiger_walk', frames: scene.anims.generateFrameNumbers('animal_tiger', { start: 0, end: 1 }), frameRate: 6, repeat: -1 });
    }
    const isTree = (x: number, y: number) => isTreeGid(decor.getTileAt(x, y)?.index);
    const dens = pickDens(decor.layer.width, decor.layer.height, isTree, safeZones, TIGER_COUNT);
    for (const d of dens) {
      const x = d.x * TILE + TILE / 2;
      const y = d.y * TILE + TILE;
      const sprite = scene.add.sprite(x, y, 'animal_tiger', 0).setOrigin(0.5, 1);
      this.tigers.push({ beast: createBeast(x, y), sprite, wander: { dx: 0, dy: 0 }, nextTurn: 0 });
    }
  }

  private playerIsSafe(): boolean {
    if (gameState.boating) return true;
    const tx = Math.floor(this.player.x / TILE);
    const ty = Math.floor(this.player.y / TILE);
    return this.safeZones.some((z) => tx >= z.x0 && tx <= z.x1 && ty >= z.y0 && ty <= z.y1);
  }

  update(time: number, delta: number): void {
    if (this.tigers.length === 0) return;
    const prey = this.playerIsSafe() ? null : { x: this.player.x, y: this.player.y };
    for (const t of this.tigers) {
      if (time > t.nextTurn) {
        t.wander = pickWander();
        t.nextTurn = time + Phaser.Math.Between(2000, 5000);
      }
      const before = t.beast;
      const step = stepBeast(t.beast, Math.min(0.05, delta / 1000), prey, t.wander);
      t.beast = step.beast;
      const dx = t.beast.x - before.x;
      const moving = Math.abs(dx) + Math.abs(t.beast.y - before.y) > 0.01;
      t.sprite.setPosition(t.beast.x, t.beast.y).setDepth(t.beast.y);
      if (dx !== 0) t.sprite.setFlipX(dx < 0);
      if (t.beast.mode === 'warn') t.sprite.setFlipX(this.player.x < t.beast.x);
      if (moving && !t.sprite.anims.isPlaying) t.sprite.play('animal_tiger_walk');
      if (!moving && t.sprite.anims.isPlaying) t.sprite.stop();
      t.sprite.anims.timeScale = t.beast.mode === 'charge' ? 3 : 1;
      if (step.roared) this.roar(t);
      if (step.struck) this.strike();
    }
  }

  private roar(t: Tiger): void {
    playRoar(gameState.settings, Phaser.Math.Clamp((t.beast.x - this.player.x) / (TILE * 6), -1, 1));
    this.scene.cameras.main.shake(400, 0.004);
    this.scene.tweens.add({ targets: t.sprite, scaleX: 1.15, scaleY: 1.15, yoyo: true, duration: 180, repeat: 2 });
    this.say('Hổ gầm cảnh báo! Lùi ra xa ngay!');
  }

  private strike(): void {
    const s = gameState;
    const damage = tigerDamage(s.playerHealth.max);
    s.playerHealth = consume(s.playerHealth, damage);
    this.scene.cameras.main.shake(320, 0.02);
    this.scene.cameras.main.flash(260, 180, 20, 0);
    this.say(`Hổ vồ! −${damage} máu`);
    if (s.playerHealth.current <= 0) EventBus.emit(GameEvents.PlayerFainted);
  }
}
