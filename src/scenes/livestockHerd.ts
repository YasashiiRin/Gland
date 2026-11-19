import Phaser from 'phaser';
import { TILE } from '../config/constants';
import { artScale, vehicleDrop } from './hd';
import { TILLABLE_GIDS, TILE_GID } from '../config/tileGids';
import type { Player } from '../entities/Player';
import { gameState } from '../state/GameState';
import { itemAt } from '../systems/InventorySystem';
import {
  growthLabel,
  hpOf,
  hungerLabel,
  isDead,
  LIVESTOCK,
  RIDEABLE,
  pickWander,
  sizeScale,
  steer,
  tickLivestock,
  WHIP_CRACK_RADIUS,
  type Livestock,
} from '../systems/LivestockSystem';

/** How close (px) you must stand to an animal to climb on it. */
const RIDE_RANGE = 30;
/** The rider's legs are hidden below this row of the 16x32 frame (as on a vehicle). */
const RIDER_CROP_HEIGHT = 23;

/** "No 70% · Máu 90%": how the animal is doing. */
function statsLine(a: Livestock): string {
  return `No ${Math.round(100 - a.hunger)}% (${hungerLabel(a.hunger)}) · Máu ${Math.round(hpOf(a))}%`;
}

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
  /** The animal I am sitting on (a buffalo), if any. */
  private ridden: string | null = null;
  /** Called with a message when an animal dies of hunger. */
  onDeath?: (message: string) => void;

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

  get riding(): boolean {
    return this.ridden !== null;
  }

  /**
   * E next to my buffalo: climb on its back (and see how it is); E again: get
   * off, it stays where we are. Returns a message, or null if no animal is near.
   */
  tryRide(): string | null {
    if (this.ridden) {
      const w = this.walkers.get(this.ridden);
      this.ridden = null;
      this.player.setCrop();
      if (w) {
        (w.sprite.body as Phaser.Physics.Arcade.Body).enable = true;
        w.sprite.setPosition(this.player.x, this.player.y + 2);
        this.player.setPosition(this.player.x, this.player.y - 12); // step down beside it
      }
      return 'Xuống trâu';
    }
    let best: { id: string; d: number } | null = null;
    for (const [id, w] of this.walkers) {
      const a = gameState.livestock.find((x) => x.id === id);
      if (!a || !RIDEABLE.has(a.kind)) continue;
      const d = Math.hypot(w.sprite.x - this.player.x, w.sprite.y - this.player.y);
      if (d < RIDE_RANGE && (!best || d < best.d)) best = { id, d };
    }
    if (!best) return null;
    const a = gameState.livestock.find((x) => x.id === best.id);
    const w = this.walkers.get(best.id);
    if (!a || !w) return null;
    if (a.growth < 50) return `${LIVESTOCK[a.kind].name} còn nhỏ, chưa cưỡi được`;
    this.ridden = best.id;
    (w.sprite.body as Phaser.Physics.Arcade.Body).enable = false;
    w.sprite.setVelocity(0, 0);
    this.player.setPosition(w.sprite.x, w.sprite.y - vehicleDrop(this.scene, `animal_${a.kind}`));
    this.showInfo(best.id);
    return `Cưỡi ${LIVESTOCK[a.kind].name.toLowerCase()} · ${statsLine(a)}`;
  }

  update(time: number): void {
    this.syncSprites();
    const stack = itemAt(gameState.inventory, gameState.equippedSlot);
    const whip = stack?.itemId === 'whip' ? { x: this.player.x, y: this.player.y } : null;
    for (const [id, w] of this.walkers) {
      const animal = gameState.livestock.find((a) => a.id === id);
      if (!animal) continue;
      if (id === this.ridden) {
        this.carryRider(w, animal);
        continue;
      }
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
      this.buryDead();
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

  /** The ridden animal walks under the rider (whose legs are hidden on its back). */
  private carryRider(w: Walker, a: Livestock): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const moving = body.velocity.x !== 0 || body.velocity.y !== 0;
    const dir = this.player.direction;
    if (dir === 'left' || dir === 'right') w.sprite.setFlipX(dir === 'left');
    w.sprite.setPosition(this.player.x, this.player.y + vehicleDrop(this.scene, `animal_${a.kind}`)).setDepth(this.player.depth - 0.5);
    if (moving && !w.sprite.anims.isPlaying) w.sprite.play(`animal_${a.kind}_walk`);
    if (!moving && w.sprite.anims.isPlaying) w.sprite.stop();
    this.player.cropTo(RIDER_CROP_HEIGHT);
  }

  /** Animals dead of hunger leave the herd (and throw their rider). */
  private buryDead(): void {
    const dead = gameState.livestock.filter((a) => a.mapKey === this.mapKey && isDead(a));
    if (!dead.length) return;
    for (const a of dead) {
      if (a.id === this.ridden) this.tryRide();
      this.walkers.get(a.id)?.sprite.destroy();
      this.walkers.delete(a.id);
      this.onDeath?.(`${LIVESTOCK[a.kind].name} của bạn đã chết vì bị bỏ đói`);
    }
    gameState.livestock = gameState.livestock.filter((a) => !dead.includes(a));
  }

  /** A little card above the animal: its name, fullness, health and growth bars. */
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
      .text(0, -28, `${LIVESTOCK[a.kind].name}\n${statsLine(a)}\nLớn ${Math.round(a.growth)}% · ${growthLabel(a.growth)}`, {
        fontFamily: 'sans-serif',
        fontSize: '7px',
        color: '#fff6e0',
        align: 'center',
        resolution: 4,
      })
      .setOrigin(0.5, 0.5);
    const bg = this.scene.add.rectangle(0, -22, 92, 44, 0x3a2a1e, 0.92).setStrokeStyle(1, 0x2a201c);
    this.panel = this.scene.add
      .container(w.sprite.x, w.sprite.y - w.sprite.displayHeight - 4, [
        bg,
        text,
        ...bar(-9, 100 - a.hunger, 0xe8a040), // fullness
        ...bar(-5, hpOf(a), 0xe5533d), // health
        ...bar(-1, a.growth, 0x7ddc6a),
      ])
      .setDepth(10000);
    const panel = this.panel;
    this.scene.time.delayedCall(3500, () => panel.destroy());
  }
}
