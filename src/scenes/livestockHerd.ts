import Phaser from 'phaser';
import { TILE } from '../config/constants';
import { artScale } from './hd';
import { TILLABLE_GIDS, TILE_GID } from '../config/tileGids';
import type { Player } from '../entities/Player';
import { gameState } from '../state/GameState';
import { itemAt } from '../systems/InventorySystem';
import {
  growthLabel,
  hungerLabel,
  LIVESTOCK,
  pickWander,
  sizeScale,
  steer,
  tickLivestock,
  WHIP_CRACK_RADIUS,
  type Livestock,
} from '../systems/LivestockSystem';

/** Ground an animal can graze on. */
const GRAZING: ReadonlySet<number> = new Set([...TILLABLE_GIDS.filter((g) => g !== TILE_GID.DIRT), TILE_GID.MARSH, TILE_GID.ROCKY]);

interface Walker {
  sprite: Phaser.Physics.Arcade.Sprite;
  wander: { dx: number; dy: number };
  nextTurn: number;
  /** Running from a whip crack until this time. */
  scaredUntil: number;
}

/**
 * The farm animals on this map: they wander, stop to graze, flee from a whip
 * and show their hunger and growth when clicked. Their positions and hunger
 * are written back to the GameState once a second.
 */
export class LivestockHerd {
  private readonly walkers = new Map<string, Walker>();
  private lastSync = 0;
  private lastMinutes: number;
  private panel?: Phaser.GameObjects.Container;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    private readonly mapKey: string,
    private readonly ground: Phaser.Tilemaps.TilemapLayer,
    private readonly decor: Phaser.Tilemaps.TilemapLayer,
  ) {
    this.lastMinutes = gameState.time.elapsedMinutes;
    for (const kind of Object.keys(LIVESTOCK)) {
      const key = `animal_${kind}_walk`;
      if (!scene.anims.exists(key) && scene.textures.exists(`animal_${kind}`)) {
        scene.anims.create({ key, frames: scene.anims.generateFrameNumbers(`animal_${kind}`, { start: 0, end: 1 }), frameRate: 5, repeat: -1 });
      }
    }
  }

  /** The whip cracked at (x, y): every animal close by bolts away for a moment. */
  crack(x: number, y: number): number {
    let n = 0;
    for (const w of this.walkers.values()) {
      if (Math.hypot(w.sprite.x - x, w.sprite.y - y) < WHIP_CRACK_RADIUS) {
        w.scaredUntil = this.scene.time.now + 1800;
        n++;
      }
    }
    return n;
  }

  update(time: number): void {
    this.syncSprites();
    const stack = itemAt(gameState.inventory, gameState.equippedSlot);
    const whip = stack?.itemId === 'whip' ? { x: this.player.x, y: this.player.y } : null;
    for (const [id, w] of this.walkers) {
      const animal = gameState.livestock.find((a) => a.id === id);
      if (!animal) continue;
      if (time > w.nextTurn) {
        w.wander = pickWander();
        w.nextTurn = time + Phaser.Math.Between(1500, 4500);
      }
      const scared = time < w.scaredUntil;
      const dir = steer(w.sprite, w.wander, scared ? { x: this.player.x, y: this.player.y } : whip);
      const speed = LIVESTOCK[animal.kind].speed * (dir.fleeing ? 2.2 : 1);
      w.sprite.setVelocity(dir.dx * speed, dir.dy * speed);
      if (dir.dx !== 0) w.sprite.setFlipX(dir.dx < 0);
      const moving = dir.dx !== 0 || dir.dy !== 0;
      if (moving && !w.sprite.anims.isPlaying) w.sprite.play(`animal_${animal.kind}_walk`);
      if (!moving && w.sprite.anims.isPlaying) w.sprite.stop();
      w.sprite.setDepth(w.sprite.y);
    }
    if (time - this.lastSync > 1000) {
      this.lastSync = time;
      this.writeBack();
    }
  }

  /** Positions and hunger back into the GameState (grazing if standing on grass). */
  private writeBack(): void {
    const now = gameState.time.elapsedMinutes;
    const minutes = now >= this.lastMinutes ? now - this.lastMinutes : now;
    this.lastMinutes = now;
    gameState.livestock = gameState.livestock.map((a) => {
      const w = this.walkers.get(a.id);
      if (!w) return a;
      const tx = Math.floor(w.sprite.x / TILE);
      const ty = Math.floor((w.sprite.y - 1) / TILE);
      const onGrass = GRAZING.has(this.ground.getTileAt(tx, ty)?.index ?? -1);
      return tickLivestock({ ...a, x: Math.round(w.sprite.x), y: Math.round(w.sprite.y) }, minutes, onGrass);
    });
  }

  /** Adds sprites for animals that arrived on this map (just bought) and drops gone ones. */
  private syncSprites(): void {
    const here = gameState.livestock.filter((a) => a.mapKey === this.mapKey);
    for (const a of here) {
      if (!this.walkers.has(a.id)) this.spawn(a);
    }
    for (const [id, w] of this.walkers) {
      if (!here.some((a) => a.id === id)) {
        w.sprite.destroy();
        this.walkers.delete(id);
      }
    }
  }

  private spawn(a: Livestock): void {
    const key = `animal_${a.kind}`;
    if (!this.scene.textures.exists(key)) return;
    const sprite = this.scene.physics.add.sprite(a.x, a.y, key, 0).setOrigin(0.5, 1);
    const k = artScale(this.scene, key);
    sprite.setScale(sizeScale(a.growth) / k);
    const body = sprite.body as Phaser.Physics.Arcade.Body;
    const w = sprite.width * 0.5;
    body.setSize(w, 6 * k).setOffset((sprite.width - w) / 2, sprite.height - 6 * k);
    sprite.setCollideWorldBounds(true);
    this.scene.physics.add.collider(sprite, this.ground);
    this.scene.physics.add.collider(sprite, this.decor);
    sprite.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.showInfo(a.id));
    this.walkers.set(a.id, { sprite, wander: { dx: 0, dy: 0 }, nextTurn: 0, scaredUntil: 0 });
  }

  /** A little card above the animal: its name, hunger and growth bars. */
  private showInfo(id: string): void {
    const a = gameState.livestock.find((x) => x.id === id);
    const w = this.walkers.get(id);
    if (!a || !w) return;
    this.panel?.destroy();
    const bar = (y: number, value: number, color: number) => [
      this.scene.add.rectangle(-30, y, 60, 3, 0x2a201c).setOrigin(0, 0.5),
      this.scene.add.rectangle(-30, y, (60 * value) / 100, 3, color).setOrigin(0, 0.5),
    ];
    const text = this.scene.add
      .text(0, -24, `${LIVESTOCK[a.kind].name}\nĐói ${Math.round(a.hunger)}% · ${hungerLabel(a.hunger)}\nLớn ${Math.round(a.growth)}% · ${growthLabel(a.growth)}`, {
        fontFamily: 'sans-serif',
        fontSize: '7px',
        color: '#fff6e0',
        align: 'center',
        resolution: 4,
      })
      .setOrigin(0.5, 0.5);
    const bg = this.scene.add.rectangle(0, -20, 76, 36, 0x3a2a1e, 0.92).setStrokeStyle(1, 0x2a201c);
    this.panel = this.scene.add
      .container(w.sprite.x, w.sprite.y - w.sprite.displayHeight - 4, [bg, text, ...bar(-5, a.hunger, 0xe5533d), ...bar(-1, a.growth, 0x7ddc6a)])
      .setDepth(10000);
    const panel = this.panel;
    this.scene.time.delayedCall(3500, () => panel.destroy());
  }
}
