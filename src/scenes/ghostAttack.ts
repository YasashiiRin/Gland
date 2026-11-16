import Phaser from 'phaser';
import { TILE } from '../config/constants';
import type { Player } from '../entities/Player';
import { EventBus, GameEvents } from '../events/EventBus';
import { gameState } from '../state/GameState';
import { isWorldInputBlocked } from '../state/uiState';
import { consume } from '../systems/EnergySystem';
import { isHorrorNight } from '../systems/HorrorSystem';
import { playHeartbeat, playScreech, playVanish, playWhisper } from '../systems/HorrorAudio';
import { GHOST_ATTACK, ghostHitDamage, ghostHitEnergyLoss, ghostsCanAttack } from '../systems/SanitySystem';

const HIT_RANGE = 11;
const GIVE_UP_MS = 12000;

/**
 * Once sanity is nearly gone (and only in full horror mode, at night), a
 * ghost comes for you: it appears a few steps away and glides after you.
 * If it reaches you it strikes — health (5%, then 10%, 15%… of max) and a
 * bit of energy — then vanishes, and another comes a few seconds later.
 */
export class GhostAttacker {
  private ghost?: Phaser.GameObjects.Image;
  private bornAt = 0;
  private nextAt = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
  ) {
    this.nextAt = scene.time.now + 4000;
  }

  update(time: number, delta: number): void {
    const allowed = ghostsCanAttack(gameState.sanity, gameState.settings.horror, isHorrorNight(gameState.time)) && !isWorldInputBlocked();
    if (!this.ghost) {
      if (allowed && time >= this.nextAt) this.spawn(time);
      return;
    }
    if (!allowed || time - this.bornAt > GIVE_UP_MS) {
      this.vanish(time);
      return;
    }
    const dx = this.player.x - this.ghost.x;
    const dy = this.player.y - 6 - this.ghost.y;
    const dist = Math.hypot(dx, dy);
    if (dist < HIT_RANGE) {
      this.strike();
      this.vanish(time);
      return;
    }
    const step = (GHOST_ATTACK.speed * delta) / 1000;
    this.ghost.x += (dx / dist) * step;
    this.ghost.y += (dy / dist) * step;
    this.ghost.setDepth(this.ghost.y + 8);
    this.ghost.setFlipX(dx < 0);
  }

  private spawn(time: number): void {
    const angle = Math.random() * Math.PI * 2;
    const map = (this.scene as Phaser.Scene & { physics: Phaser.Physics.Arcade.ArcadePhysics }).physics.world.bounds;
    const x = Phaser.Math.Clamp(this.player.x + Math.cos(angle) * TILE * 5, TILE, map.width - TILE);
    const y = Phaser.Math.Clamp(this.player.y + Math.sin(angle) * TILE * 5, TILE, map.height - TILE);
    this.ghost = this.scene.add.image(x, y, 'horror_ghost').setOrigin(0.5, 0.8).setTint(0xffb0b0).setAlpha(0);
    this.scene.tweens.add({ targets: this.ghost, alpha: 0.95, duration: 500 });
    this.bornAt = time;
    playWhisper(gameState.settings, Phaser.Math.Clamp((x - this.player.x) / (TILE * 5), -1, 1));
    playHeartbeat(gameState.settings, 1);
    EventBus.emit(GameEvents.HorrorScreen, { kind: 'caption', text: Phaser.Utils.Array.GetRandom(['…nó tới rồi… CHẠY ĐI…', '…đừng để nó chạm vào…', '…bắt được rồi…']) });
  }

  private strike(): void {
    const s = gameState;
    const damage = ghostHitDamage(s.haunt.hits, s.playerHealth.max);
    s.haunt = { ...s.haunt, hits: s.haunt.hits + 1 };
    s.playerHealth = consume(s.playerHealth, damage);
    s.energy = consume(s.energy, ghostHitEnergyLoss(s.energy.max));
    playScreech(s.settings);
    this.scene.cameras.main.shake(260, 0.014);
    this.scene.cameras.main.flash(220, 160, 0, 0);
    EventBus.emit(GameEvents.HorrorScreen, { kind: 'caption', text: `−${Math.round(damage)} máu` });
    if (s.playerHealth.current <= 0) EventBus.emit(GameEvents.PlayerFainted);
  }

  private vanish(time: number): void {
    const g = this.ghost;
    if (!g) return;
    this.ghost = undefined;
    this.nextAt = time + Phaser.Math.Between(GHOST_ATTACK.everyMs[0], GHOST_ATTACK.everyMs[1]);
    playVanish(gameState.settings);
    this.scene.tweens.add({ targets: g, alpha: 0, duration: 160, onComplete: () => g.destroy() });
  }
}
