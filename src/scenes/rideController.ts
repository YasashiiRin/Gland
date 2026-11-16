import Phaser from 'phaser';
import { TILE } from '../config/constants';
import { ITEMS, type ItemId, type VehicleAbility } from '../data/items';
import type { Player } from '../entities/Player';
import { gameState } from '../state/GameState';
import { hasItem } from '../systems/InventorySystem';
import { DIRECTIONS } from '../systems/movement';

/** The rider's legs are hidden below this row of the 16x32 player frame (they're "in" the seat). */
const RIDER_CROP_HEIGHT = 23;
/** How far below the player's feet the vehicle's ground line sits. */
const VEHICLE_DROP = 4;

/**
 * Mounting/dismounting vehicles and drawing the ridden vehicle under the
 * player. Calls `onEnterTile` each time the rider reaches a new tile so the
 * map can apply the vehicle's ability (tilling, harvesting...).
 */
export class RideController {
  private image?: Phaser.GameObjects.Image;
  private lastTile = '';

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    private readonly onEnterTile: (tile: { x: number; y: number }, ability: VehicleAbility) => void,
  ) {}

  get ability(): VehicleAbility | null {
    return gameState.riding ? (ITEMS[gameState.riding].vehicle?.ability ?? 'none') : null;
  }

  /** Using a vehicle item: get on (or switch vehicles), or get off if already riding it. */
  toggle(itemId: ItemId, allowed: boolean): string {
    if (gameState.riding === itemId) {
      gameState.riding = null;
      return `Xuống ${ITEMS[itemId].name.toLowerCase()}`;
    }
    if (!allowed) return 'Không đi xe ở đây được';
    gameState.riding = itemId;
    this.lastTile = '';
    return `Lên ${ITEMS[itemId].name.toLowerCase()}`;
  }

  update(): void {
    // The key item was sold, stored or dropped: you can't keep riding it.
    if (gameState.riding && !hasItem(gameState.inventory, gameState.riding, 1)) gameState.riding = null;
    this.syncSprite();
    const ability = this.ability;
    if (!ability) return;
    const tile = { x: Math.floor(this.player.x / TILE), y: Math.floor(this.player.y / TILE) };
    const key = `${tile.x},${tile.y}`;
    if (key === this.lastTile) return;
    this.lastTile = key;
    this.onEnterTile(tile, ability);
  }

  private syncSprite(): void {
    const riding = gameState.riding;
    const textureKey = riding ? `vehicle_${riding}` : '';
    if (!riding || !this.scene.textures.exists(textureKey)) {
      this.image?.destroy();
      this.image = undefined;
      if (this.player.isCropped) this.player.setCrop();
      return;
    }
    if (!this.image || this.image.texture.key !== textureKey) {
      this.image?.destroy();
      this.image = this.scene.add.image(0, 0, textureKey, 0).setOrigin(0.5, 1);
    }
    this.image
      .setFrame(DIRECTIONS.indexOf(this.player.direction))
      .setPosition(this.player.x, this.player.y + VEHICLE_DROP)
      // Facing the viewer, the vehicle's front (handlebars, hood, cart board)
      // is between us and the rider, so it draws on top; otherwise below.
      .setDepth(this.player.depth + (this.player.direction === 'down' ? 0.5 : -0.5));
    this.player.setCrop(0, 0, 16, RIDER_CROP_HEIGHT);
  }
}
