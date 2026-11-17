import Phaser from 'phaser';
import { TILE } from '../config/constants';
import { isWaterGid, TILE_GID } from '../config/tileGids';
import type { MapKey } from '../data/maps';
import type { Player } from '../entities/Player';
import { gameState } from '../state/GameState';
import { boatSpot, landingTile, nearestBoat, type BoatSpot } from '../systems/BoatSystem';
import { readProp } from './worldSprites';

const RIDER_CROP_HEIGHT = 22;
const OFFSETS: Record<string, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

/** Tiles a boat can float on: any water, and under bridges. */
export function isRowable(gid: number | undefined): boolean {
  return isWaterGid(gid) || gid === TILE_GID.BRIDGE;
}

/**
 * Rowing boats moored on this map's rivers ("boat" objects of the map).
 * E next to one: climb in and row (it moves only over water); E again by
 * the bank: step ashore and the boat stays where you left it.
 */
export class Boats {
  private readonly moorings = new Map<string, BoatSpot>();
  private readonly images = new Map<string, Phaser.GameObjects.Image>();
  private lastGood = { x: 0, y: 0 };

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    private readonly mapKey: MapKey,
    map: Phaser.Tilemaps.Tilemap,
    private readonly ground: Phaser.Tilemaps.TilemapLayer,
    private readonly decor: Phaser.Tilemaps.TilemapLayer,
  ) {
    for (const o of map.getObjectLayer('objects')?.objects ?? []) {
      const id = o.name === 'boat' ? readProp(o, 'boatId') : undefined;
      if (id) this.moorings.set(id, { mapKey, x: o.x ?? 0, y: o.y ?? 0 });
    }
    // A boat being rowed when the map was left stays where it was.
    if (gameState.boating && !this.moorings.has(gameState.boating)) gameState.boating = null;
  }

  private spots(): { id: string; spot: BoatSpot }[] {
    return [...this.moorings].map(([id, m]) => ({ id, spot: boatSpot(gameState.boats, id, m) }));
  }

  /** E: get in or out. Returns a message, or null if no boat is involved. */
  interact(): string | null {
    if (gameState.boating) return this.land();
    const id = nearestBoat(this.spots(), this.mapKey, this.player.x, this.player.y);
    if (!id || gameState.riding) return null;
    const spot = boatSpot(gameState.boats, id, this.moorings.get(id) as BoatSpot);
    gameState.boating = id;
    this.player.setPosition(spot.x, spot.y);
    this.lastGood = { x: spot.x, y: spot.y };
    return 'Lên thuyền — dùng phím di chuyển để chèo, E để cập bờ';
  }

  private land(): string {
    const id = gameState.boating as string;
    const tx = Math.floor(this.player.x / TILE);
    const ty = Math.floor((this.player.y - 1) / TILE);
    const isLand = (x: number, y: number) => {
      const g = this.ground.getTileAt(x, y);
      const d = this.decor.getTileAt(x, y);
      return !!g && !isRowable(g.index) && !g.collides && !d?.collides;
    };
    const shore = landingTile(tx, ty, OFFSETS[this.player.direction], isLand);
    if (!shore) return 'Phải chèo sát bờ mới xuống được';
    gameState.boats = { ...gameState.boats, [id]: { mapKey: this.mapKey, x: Math.round(this.player.x), y: Math.round(this.player.y) } };
    gameState.boating = null;
    this.player.setPosition(shore.x * TILE + TILE / 2, shore.y * TILE + TILE - 2);
    return 'Đã cập bờ';
  }

  /** The ground collider asks this: while rowing, water doesn't block. */
  passesWater(tile: Phaser.Tilemaps.Tile): boolean {
    return !!gameState.boating && isRowable(tile.index);
  }

  /** Call after movement each frame: keeps the boat on the water and draws the boats. */
  update(): void {
    const rowing = gameState.boating;
    if (rowing) {
      const tx = Math.floor(this.player.x / TILE);
      const ty = Math.floor((this.player.y - 1) / TILE);
      if (isRowable(this.ground.getTileAt(tx, ty)?.index)) this.lastGood = { x: this.player.x, y: this.player.y };
      else {
        this.player.setPosition(this.lastGood.x, this.lastGood.y);
        (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
      }
      this.player.setCrop(0, 0, 16, RIDER_CROP_HEIGHT);
    } else if (this.player.isCropped && !gameState.riding) {
      this.player.setCrop();
    }
    for (const { id, spot } of this.spots()) {
      let img = this.images.get(id);
      if (!img) {
        img = this.scene.add.image(0, 0, 'prop_sampan').setOrigin(0.5, 0.75);
        this.images.set(id, img);
      }
      if (id === rowing) {
        const sideways = this.player.direction === 'left' || this.player.direction === 'right';
        img.setPosition(this.player.x, this.player.y + 3).setAngle(sideways ? 0 : 90).setDepth(this.player.depth - 0.5);
      } else {
        img.setPosition(spot.x, spot.y).setAngle(0).setDepth(spot.y - 4);
      }
    }
  }
}
