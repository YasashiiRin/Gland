import Phaser from 'phaser';
import { hdScale, vehicleDrop } from './hd';
import { TILE } from '../config/constants';
import { ITEMS, type ItemId, type VehicleAbility } from '../data/items';
import type { Player } from '../entities/Player';
import { gameState } from '../state/GameState';
import { net } from '../net/NetSession';
import { rideState } from '../state/rideState';
import { EventBus, GameEvents, type ChestOpenRequestedPayload } from '../events/EventBus';

/** Chest key of a vehicle's cargo bed (see UIScene.storageFor). */
export function vehicleStorageKey(vehicleId: string): string {
  return `vehicle:${vehicleId}`;
}
import { DIRECTIONS } from '../systems/movement';
import { nearestParked, parkVehicle, workArea } from '../systems/VehicleSystem';
import { SMOKE_TEXTURE } from './PreloadScene';

/** The rider's legs are hidden below this row of the 16x32 player frame (they're "in" the seat). */
const RIDER_CROP_HEIGHT = 23;
/** How close (px) you must stand to a parked vehicle to get on. */
const MOUNT_RANGE = 40; // vehicles are true size now: a harvester is 5 tiles long
/** Vehicles that take up 2x2 tiles, work a 2x2 area and need a wider collision body. */
const BIG_VEHICLES: ReadonlySet<string> = new Set(['tractor', 'harvester', 'water_truck']);
/** Vehicles with a work mode (Space toggles it), and what it is called. */
const WORK_MODE_NAME = { till: 'Chế độ cày', harvest: 'Chế độ gặt', water: 'Chế độ tưới' } as const;
function isWorkAbility(ability: VehicleAbility | null): ability is keyof typeof WORK_MODE_NAME {
  return !!ability && ability in WORK_MODE_NAME;
}
/** Exhaust smoke: ms between puffs while moving (working tractors puff harder). */
const SMOKE_INTERVAL: Partial<Record<string, number>> = { motorbike: 140, tractor: 110, harvester: 130, water_truck: 150 };

/**
 * Vehicles in the world: draws parked ones, gets the player on and off,
 * draws the ridden one under/over the rider, puffs exhaust smoke, and reports
 * the 2x2 work area of a working tractor/harvester so the map can plough or
 * harvest it.
 */
export class RideController {
  private image?: Phaser.GameObjects.Image;
  private readonly parked = new Map<string, Phaser.GameObjects.Image>();
  private readonly workHighlight: Phaser.GameObjects.Rectangle;
  private smoke?: Phaser.GameObjects.Particles.ParticleEmitter;
  private lastArea = '';
  private lastPuff = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    private readonly mapKey: string,
    private readonly onWork: (tiles: { x: number; y: number }[], ability: VehicleAbility) => void,
  ) {
    this.workHighlight = scene.add
      .rectangle(0, 0, TILE * 2, TILE * 2, 0xe8c060, 0.22)
      .setStrokeStyle(1, 0xe8c060, 0.8)
      .setOrigin(0, 0)
      .setDepth(0.5)
      .setVisible(false);
  }

  get ability(): VehicleAbility | null {
    return gameState.riding ? (ITEMS[gameState.riding].vehicle?.ability ?? 'none') : null;
  }

  /** E / right click on foot: get on a parked vehicle nearby (or a friend's, as passenger). */
  tryMount(): string | null {
    const seat = this.tryTakeSeat();
    if (seat) return seat;
    const id = nearestParked(gameState.vehicles, this.mapKey, this.player.x, this.player.y, MOUNT_RANGE);
    if (!id) return null;
    // Multiplayer: someone else is already driving it.
    for (const pose of net.poses.values()) {
      if (pose.riding === id) return `${net.nameOf(pose.id)} đang lái xe này`;
    }
    gameState.riding = id as ItemId;
    gameState.vehicleWorking = false;
    const spot = gameState.vehicles[id];
    if (spot) this.player.setPosition(spot.x, spot.y - vehicleDrop(this.scene, `vehicle_${id}`));
    this.lastArea = '';
    return `Lên ${ITEMS[id as ItemId].name.toLowerCase()}`;
  }

  /**
   * Multiplayer: hop onto a friend's vehicle that has a free seat (the ox
   * cart seats two). Returns a message, or null if there's none nearby.
   */
  private tryTakeSeat(): string | null {
    if (!net.online) return null;
    const poses = [...net.poses.values()];
    for (const driver of poses) {
      if (driver.map !== this.mapKey || !driver.riding) continue;
      const seats = ITEMS[driver.riding as ItemId]?.vehicle?.seats ?? 1;
      const taken = 1 + poses.filter((p) => p.seatOf === driver.id).length;
      if (Math.hypot(driver.x - this.player.x, driver.y - this.player.y) > MOUNT_RANGE + 8) continue;
      if (taken >= seats) return `${ITEMS[driver.riding as ItemId].name} đã hết chỗ`;
      rideState.passengerOf = driver.id;
      return `Ngồi ké ${ITEMS[driver.riding as ItemId].name.toLowerCase()} của ${net.nameOf(driver.id)}`;
    }
    return null;
  }

  /** Gets off and leaves the vehicle parked right here (a passenger just steps down). */
  dismount(): string | null {
    if (rideState.passengerOf) {
      rideState.passengerOf = null;
      this.player.setPosition(this.player.x, this.player.y + 10);
      return 'Xuống xe';
    }
    const id = gameState.riding;
    if (!id) return null;
    gameState.vehicles = parkVehicle(gameState.vehicles, id, {
      mapKey: this.mapKey,
      x: Math.round(this.player.x),
      y: Math.round(this.player.y + vehicleDrop(this.scene, `vehicle_${id}`)),
      facing: this.player.direction,
    });
    gameState.riding = null;
    // Step off beside the vehicle rather than standing inside it.
    this.player.setPosition(this.player.x, this.player.y + (BIG_VEHICLES.has(id) ? 14 : 8));
    return `Xuống ${ITEMS[id].name.toLowerCase()}`;
  }

  /** Space / left click while riding: work mode (tractor, harvester), cargo bed (ox cart) or horn. */
  action(): string {
    const vehicle = gameState.riding ?? (rideState.passengerOf ? net.poses.get(rideState.passengerOf)?.riding : null);
    if (vehicle && ITEMS[vehicle as ItemId]?.vehicle?.ability === 'storage') {
      const payload: ChestOpenRequestedPayload = { chestKey: vehicleStorageKey(vehicle) };
      EventBus.emit(GameEvents.ChestOpenRequested, payload);
      return '';
    }
    const ability = this.ability;
    if (isWorkAbility(ability)) {
      gameState.vehicleWorking = !gameState.vehicleWorking;
      this.lastArea = '';
      const what = WORK_MODE_NAME[ability];
      return gameState.vehicleWorking ? `${what}: BẬT` : `${what}: TẮT (chạy thường)`;
    }
    return gameState.riding === 'motorbike' ? 'Bíp bíp!' : '';
  }

  update(time: number): void {
    if (gameState.riding && !gameState.vehicles[gameState.riding]) gameState.riding = null;
    this.followDriver();
    this.syncParked();
    this.syncRidden();
    this.player.setBigBody(!!gameState.riding && BIG_VEHICLES.has(gameState.riding));
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const moving = body.velocity.x !== 0 || body.velocity.y !== 0;
    if (moving) this.puffSmoke(time);

    const ability = this.ability;
    const working = gameState.vehicleWorking && isWorkAbility(ability);
    if (!working || !ability) {
      this.workHighlight.setVisible(false);
      return;
    }
    const tiles = workArea(this.player.x, this.player.y - 4, TILE);
    this.workHighlight.setVisible(true).setPosition(tiles[0].x * TILE, tiles[0].y * TILE);
    const key = `${tiles[0].x},${tiles[0].y}`;
    if (key === this.lastArea) return;
    this.lastArea = key;
    this.onWork(tiles, ability);
  }

  /** Passenger: sit in the back of the friend's vehicle; get off if they park or leave. */
  private followDriver(): void {
    const id = rideState.passengerOf;
    if (!id) return;
    const driver = net.poses.get(id);
    if (!driver || !driver.riding || driver.map !== this.mapKey) {
      rideState.passengerOf = null;
      if (this.player.isCropped) this.player.setCrop();
      return;
    }
    // Sit just behind the driver on the cart bed.
    const back: Record<string, [number, number]> = { down: [0, -5], up: [0, 5], left: [7, 0], right: [-7, 0] };
    const [dx, dy] = back[driver.dir];
    this.player.setPosition(driver.x + dx, driver.y + dy);
    this.player.faceTile(
      { x: Math.floor(this.player.x / TILE) + (driver.dir === 'left' ? -1 : driver.dir === 'right' ? 1 : 0),
        y: Math.floor(this.player.y / TILE) + (driver.dir === 'up' ? -1 : driver.dir === 'down' ? 1 : 0) },
      TILE,
    );
    this.player.setDepth(driver.y - (driver.dir === 'down' ? 1 : -1));
    this.player.cropTo(RIDER_CROP_HEIGHT);
  }

  private syncParked(): void {
    const drivenByOthers = new Set([...net.poses.values()].map((p) => p.riding));
    for (const [id, spot] of Object.entries(gameState.vehicles)) {
      // Hide it while anyone (me or a friend) is driving it.
      const show = !!spot && spot.mapKey === this.mapKey && id !== gameState.riding && !drivenByOthers.has(id);
      let img = this.parked.get(id);
      if (!show || !spot) {
        img?.destroy();
        this.parked.delete(id);
        continue;
      }
      if (!img) {
        if (!this.scene.textures.exists(`vehicle_${id}`)) continue;
        img = this.scene.add.image(0, 0, `vehicle_${id}`, 0).setOrigin(0.5, 1).setScale(hdScale(this.scene, `vehicle_${id}`));
        this.parked.set(id, img);
      }
      img.setFrame(DIRECTIONS.indexOf(spot.facing)).setPosition(spot.x, spot.y).setDepth(spot.y - 2);
    }
  }

  private syncRidden(): void {
    const riding = gameState.riding;
    const textureKey = riding ? `vehicle_${riding}` : '';
    if (!riding || !this.scene.textures.exists(textureKey)) {
      this.image?.destroy();
      this.image = undefined;
      if (this.player.isCropped && !rideState.passengerOf) this.player.setCrop();
      return;
    }
    if (!this.image || this.image.texture.key !== textureKey) {
      this.image?.destroy();
      this.image = this.scene.add.image(0, 0, textureKey, 0).setOrigin(0.5, 1).setScale(hdScale(this.scene, textureKey));
    }
    this.image
      .setFrame(DIRECTIONS.indexOf(this.player.direction))
      .setPosition(this.player.x, this.player.y + vehicleDrop(this.scene, textureKey))
      // Facing the viewer, the vehicle's front (handlebars, hood, cart board)
      // is between us and the rider, so it draws on top; otherwise below.
      .setDepth(this.player.depth + (this.player.direction === 'down' ? 0.5 : -0.5));
    this.player.cropTo(RIDER_CROP_HEIGHT);
  }

  /** Grey exhaust puffs from the back of the vehicle, drifting up and fading. */
  private puffSmoke(time: number): void {
    const riding = gameState.riding;
    const base = riding ? SMOKE_INTERVAL[riding] : undefined;
    if (!base || !this.scene.textures.exists(SMOKE_TEXTURE)) return;
    const interval = gameState.vehicleWorking ? base * 0.6 : base;
    if (time - this.lastPuff < interval) return;
    this.lastPuff = time;
    if (!this.smoke) {
      this.smoke = this.scene.add.particles(0, 0, SMOKE_TEXTURE, {
        lifespan: 800,
        speedX: { min: -8, max: 8 },
        speedY: { min: -22, max: -10 },
        scale: { start: 0.5, end: 1.5 },
        alpha: { start: 0.6, end: 0 },
        emitting: false,
      });
    }
    const dir = this.player.direction;
    const exhaust: Record<string, [number, number]> = {
      // [dx, dy] from the rider's feet: behind the vehicle, near the pipe
      down: [5, -14],
      up: [5, -6],
      left: [12, -10],
      right: [-12, -10],
    };
    const [dx, dy] = riding === 'tractor' ? (dir === 'left' ? [-4, -22] : dir === 'right' ? [4, -22] : [4, -24]) : exhaust[dir];
    this.smoke.setDepth(this.player.depth + 1);
    this.smoke.emitParticleAt(this.player.x + dx, this.player.y + dy, 1);
  }
}
