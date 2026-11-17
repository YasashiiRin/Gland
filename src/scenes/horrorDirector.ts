import Phaser from 'phaser';
import { TILE } from '../config/constants';
import { isTreeGid, isWaterGid } from '../config/tileGids';
import type { Player } from '../entities/Player';
import { EventBus, GameEvents, type HorrorScreenPayload } from '../events/EventBus';
import { gameState } from '../state/GameState';
import { isWorldInputBlocked } from '../state/uiState';
import {
  clockHour,
  horrorChance,
  horrorRollSlot,
  isHorrorNight,
  pickHorrorEvent,
  TREE_SCAN_RADIUS,
  WHISPERS,
  type HorrorEventId,
} from '../systems/HorrorSystem';
import { startPanic } from '../state/playerStats';
import { rollPanic, scareLoss } from '../systems/SanitySystem';
import { consume } from '../systems/EnergySystem';
import { GhostAttacker } from './ghostAttack';
import {
  playBabyCry,
  playFootsteps,
  playKnock,
  playSplash,
  playVanish,
  playWhisper,
  playWispChime,
} from '../systems/HorrorAudio';

/** Shared across maps so walking through a door doesn't re-roll the same half hour. */
let lastRolledSlot = -1;
let lastEvent: HorrorEventId | undefined;

interface Haunt {
  kind: 'ghost' | 'follower';
  sprite: Phaser.GameObjects.Image;
  born: number;
  reappear?: boolean;
  lastStep?: number;
  gone?: boolean;
}

const DIR_VECTORS: Record<string, [number, number]> = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] };

/**
 * Night-time horror for a map. Every half hour of the night (8 PM – 5 AM) it
 * rolls against a chance that rises as the night goes on and is higher among
 * trees, and on a hit stages one event at a random moment in that window.
 * Each scare costs sanity (more each time that night) and may make the
 * player panic (slowed to 60–80% for 2 s). Screen-wide effects are sent to
 * the UI scene; ghost attacks at very low sanity live in GhostAttacker.
 */
export class HorrorDirector {
  private readonly haunts: Haunt[] = [];
  private pending?: Phaser.Time.TimerEvent;
  private readonly attacker: GhostAttacker;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    private readonly indoor: boolean,
    private readonly ground: Phaser.Tilemaps.TilemapLayer,
    private readonly decor: Phaser.Tilemaps.TilemapLayer,
  ) {
    this.attacker = new GhostAttacker(scene, player);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.pending?.remove());
  }

  update(time: number): void {
    this.updateHaunts(time);
    this.attacker.update(time, this.scene.game.loop.delta);
    const mode = gameState.settings.horror;
    if (mode === 'off' || !isHorrorNight(gameState.time)) return;
    const slot = horrorRollSlot(gameState.time);
    if (slot === lastRolledSlot) return;
    lastRolledSlot = slot;
    if (Math.random() >= horrorChance(gameState.time, mode, this.treesNearby())) return;
    // Strike at an unpredictable moment within the half hour (~21 s of real time).
    this.pending = this.scene.time.delayedCall(Phaser.Math.Between(1000, 18000), () => this.trigger());
  }

  /** Tree tiles (choppable or forest) within a few steps — groves are where they wait. */
  treesNearby(): number {
    if (this.indoor) return 0;
    const px = Math.floor(this.player.x / TILE);
    const py = Math.floor(this.player.y / TILE);
    const r = TREE_SCAN_RADIUS;
    let n = 0;
    for (let y = py - r; y <= py + r; y++) {
      for (let x = px - r; x <= px + r; x++) {
        const gid = this.decor.getTileAt(x, y)?.index;
        if (isTreeGid(gid)) n++;
      }
    }
    return n;
  }

  /** A scare lands: sanity drops (more each time tonight), and sometimes your legs give way. */
  private shaken(): void {
    const mode = gameState.settings.horror;
    const loss = scareLoss(gameState.haunt.scares, mode);
    gameState.haunt = { ...gameState.haunt, scares: gameState.haunt.scares + 1 };
    gameState.sanity = consume(gameState.sanity, loss);
    const panic = rollPanic();
    if (panic) {
      startPanic(panic.multiplier, panic.ms);
      this.scene.cameras.main.shake(panic.ms * 0.4, 0.004);
      this.scene.time.delayedCall(900, () => this.screen({ kind: 'caption', text: 'Chân bạn run lẩy bẩy, không bước nổi…' }));
    }
  }

  private trigger(): void {
    if (isWorldInputBlocked() || gameState.settings.horror === 'off') return;
    const id = pickHorrorEvent({
      indoor: this.indoor,
      nearWater: !!this.nearestWater(8),
      hour: clockHour(gameState.time),
      mode: gameState.settings.horror,
      last: lastEvent,
    });
    if (!id) return;
    lastEvent = id;
    this.run(id);
    this.shaken();
  }

  /** Runs one event right away (also handy for testing from the console). */
  run(id: HorrorEventId): void {
    const s = gameState.settings;
    const pan = Math.random() < 0.5 ? -0.7 : 0.7;
    switch (id) {
      case 'ghost_far':
        this.spawnGhostFar();
        break;
      case 'wisps':
        this.spawnWisps();
        break;
      case 'shadow_follower':
        this.spawnFollower();
        break;
      case 'water_ghost':
        this.waterGhost();
        break;
      case 'footsteps':
        playFootsteps(s, 6, pan);
        if (Math.random() < 0.4) this.scene.time.delayedCall(3200, () => this.screen({ kind: 'caption', text: '…ai đó vừa đi sau lưng bạn…' }));
        break;
      case 'whisper':
        playWhisper(s, pan);
        this.screen({ kind: 'caption', text: Phaser.Utils.Array.GetRandom([...WHISPERS]) });
        break;
      case 'flicker':
        this.screen({ kind: 'flicker' });
        break;
      case 'baby_cry':
        playBabyCry(s, pan);
        this.screen({ kind: 'caption', text: '(Có tiếng trẻ con khóc ở đâu đó…)' });
        break;
      case 'knock':
        playKnock(s);
        this.screen({ kind: 'caption', text: 'Cộc… cộc… cộc…' });
        this.scene.time.delayedCall(2300, () => this.screen({ kind: 'caption', text: 'Cộc… cộc… cộc…' }));
        break;
      case 'clock_glitch':
        this.screen({ kind: 'clockGlitch' });
        break;
      case 'jumpscare':
        this.screen({ kind: 'jumpscare' });
        this.scene.time.delayedCall(650, () => this.scene.cameras.main.shake(380, 0.012));
        break;
    }
  }

  private screen(payload: HorrorScreenPayload): void {
    EventBus.emit(GameEvents.HorrorScreen, payload);
  }

  // ------------------------------------------------------------- world apparitions
  /** A white figure standing far off; it's gone when you come close — and sometimes right behind you. */
  private spawnGhostFar(): void {
    const angle = Math.random() * Math.PI * 2;
    const dist = 7 * TILE;
    const x = Phaser.Math.Clamp(this.player.x + Math.cos(angle) * dist, TILE, this.ground.tilemap.width * TILE - TILE);
    const y = Phaser.Math.Clamp(this.player.y + Math.sin(angle) * dist, TILE * 2, this.ground.tilemap.height * TILE - TILE);
    const sprite = this.scene.add.image(x, y, 'horror_ghost').setOrigin(0.5, 28 / 32).setAlpha(0).setDepth(y);
    this.scene.tweens.add({ targets: sprite, alpha: 0.9, duration: 1600 });
    this.haunts.push({ kind: 'ghost', sprite, born: this.scene.time.now, reappear: Math.random() < 0.4 });
  }

  private spawnGhostBehind(): void {
    const [fx, fy] = DIR_VECTORS[this.player.direction];
    const x = this.player.x - fx * TILE * 1.3;
    const y = this.player.y - fy * TILE * 1.3;
    const sprite = this.scene.add.image(x, y, 'horror_ghost').setOrigin(0.5, 28 / 32).setAlpha(0.95).setDepth(y);
    this.screen({ kind: 'caption', text: '…sau lưng kìa…' });
    playWhisper(gameState.settings, 0);
    this.scene.time.delayedCall(900, () => {
      playVanish(gameState.settings);
      this.screen({ kind: 'flicker' });
      sprite.destroy();
    });
  }

  /** A shadow that keeps its distance behind you, and is gone the moment you turn to face it. */
  private spawnFollower(): void {
    const [fx, fy] = DIR_VECTORS[this.player.direction];
    const x = this.player.x - fx * TILE * 6;
    const y = this.player.y - fy * TILE * 6;
    const sprite = this.scene.add.image(x, y, 'horror_shadow').setOrigin(0.5, 28 / 32).setAlpha(0).setDepth(y);
    this.scene.tweens.add({ targets: sprite, alpha: 0.85, duration: 1200 });
    this.haunts.push({ kind: 'follower', sprite, born: this.scene.time.now, lastStep: 0 });
  }

  private updateHaunts(time: number): void {
    for (const h of this.haunts) {
      if (h.gone) continue;
      const dx = h.sprite.x - this.player.x;
      const dy = h.sprite.y - this.player.y;
      const dist = Math.hypot(dx, dy);
      const age = time - h.born;
      if (h.kind === 'ghost') {
        if (dist < TILE * 3.5 || age > 7500) {
          this.vanish(h, true);
          if (h.reappear) this.scene.time.delayedCall(1300, () => this.spawnGhostBehind());
        }
        continue;
      }
      // follower: creep after the player, staying a few tiles back
      const [fx, fy] = DIR_VECTORS[this.player.direction];
      const facingIt = dist > 0 && (fx * dx + fy * dy) / dist > 0.75;
      if ((facingIt && dist < TILE * 8) || age > 15000) {
        this.vanish(h, facingIt);
        if (facingIt) this.screen({ kind: 'flicker' });
        continue;
      }
      if (dist > TILE * 3) {
        const step = (62 * this.scene.game.loop.delta) / 1000;
        h.sprite.x -= (dx / dist) * step;
        h.sprite.y -= (dy / dist) * step;
        h.sprite.setDepth(h.sprite.y);
        if (time - (h.lastStep ?? 0) > 520) {
          h.lastStep = time;
          playFootsteps(gameState.settings, 1, Phaser.Math.Clamp(dx / (TILE * 6), -1, 1));
        }
      }
    }
    for (let i = this.haunts.length - 1; i >= 0; i--) if (this.haunts[i].gone) this.haunts.splice(i, 1);
  }

  private vanish(h: Haunt, withSound: boolean): void {
    h.gone = true;
    if (withSound) playVanish(gameState.settings);
    this.scene.tweens.add({ targets: h.sprite, alpha: 0, duration: 140, onComplete: () => h.sprite.destroy() });
  }

  /** Ghost lights ("ma trơi") drifting toward you before fading out. */
  private spawnWisps(): void {
    const water = this.nearestWater(10);
    const cx = water ? water.x * TILE + TILE / 2 : this.player.x + Phaser.Math.Between(-80, 80);
    const cy = water ? water.y * TILE + TILE / 2 : this.player.y + Phaser.Math.Between(-60, 60);
    playWispChime(gameState.settings);
    for (let i = 0; i < 5; i++) {
      const x = cx + Phaser.Math.Between(-30, 30);
      const y = cy + Phaser.Math.Between(-24, 24);
      const glow = this.scene.add.circle(x, y, 6, 0x9ff0dc, 0.25).setBlendMode(Phaser.BlendModes.ADD).setDepth(99990);
      const core = this.scene.add.circle(x, y, 2.5, 0xe8fff6, 0.9).setBlendMode(Phaser.BlendModes.ADD).setDepth(99991);
      const parts = [glow, core];
      parts.forEach((p) => p.setAlpha(0));
      this.scene.tweens.add({ targets: parts, alpha: { from: 0, to: 1 }, duration: 1200, delay: i * 250 });
      this.scene.tweens.add({
        targets: parts,
        x: (x + this.player.x) / 2 + Phaser.Math.Between(-20, 20),
        y: (y + this.player.y) / 2 + Phaser.Math.Between(-20, 20) - 10,
        duration: 7000,
        ease: 'Sine.easeInOut',
      });
      this.scene.tweens.add({ targets: parts, scale: 1.4, yoyo: true, repeat: -1, duration: 600 + i * 90 });
      this.scene.tweens.add({ targets: parts, alpha: 0, delay: 7500 + i * 200, duration: 900, onComplete: () => parts.forEach((p) => p.destroy()) });
    }
  }

  /** Something in the pond: rings on the water, then a pale hand rises and sinks. */
  private waterGhost(): void {
    const w = this.nearestWater(8);
    if (!w) return;
    const x = w.x * TILE + TILE / 2;
    const y = w.y * TILE + TILE / 2;
    for (let i = 0; i < 3; i++) {
      const ring = this.scene.add.circle(x, y, 3).setStrokeStyle(1, 0xcfe8f0, 0.8).setDepth(y);
      this.scene.tweens.add({ targets: ring, radius: 14, alpha: 0, delay: i * 400, duration: 1300, onComplete: () => ring.destroy() });
    }
    const hand = this.scene.add.image(x, y + 10, 'horror_hand').setOrigin(0.5, 1).setDepth(y + 1).setCrop(0, 0, 12, 0);
    const reveal = { h: 0 };
    this.scene.tweens.add({
      targets: reveal,
      h: 13,
      delay: 900,
      duration: 900,
      yoyo: true,
      hold: 1300,
      onUpdate: () => {
        hand.setCrop(0, 0, 12, reveal.h);
        hand.setY(y + 10 - reveal.h * 0.4);
      },
      onComplete: () => hand.destroy(),
    });
    playSplash(gameState.settings, Phaser.Math.Clamp((x - this.player.x) / (TILE * 6), -1, 1));
  }

  private nearestWater(radius: number): { x: number; y: number } | null {
    const px = Math.floor(this.player.x / TILE);
    const py = Math.floor(this.player.y / TILE);
    let best: { x: number; y: number } | null = null;
    let bestD = Infinity;
    for (let y = py - radius; y <= py + radius; y++) {
      for (let x = px - radius; x <= px + radius; x++) {
        if (!isWaterGid(this.ground.getTileAt(x, y)?.index)) continue;
        const d = Math.hypot(x - px, y - py);
        if (d < bestD) {
          bestD = d;
          best = { x, y };
        }
      }
    }
    return best;
  }
}
