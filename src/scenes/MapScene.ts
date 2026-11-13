import Phaser from 'phaser';
import { DEPTH_ABOVE, FADE_MS, TILE, WORLD_ZOOM } from '../config/constants';
import { ITEMS, TOOL_ENERGY_COST, type ItemId } from '../data/items';
import { isMapKey, MAPS, type MapKey } from '../data/maps';
import { Player, type PlayerInput } from '../entities/Player';
import {
  EventBus,
  GameEvents,
  type DayStartedPayload,
  type MapEnteredPayload,
} from '../events/EventBus';
import { gameState } from '../state/GameState';
import { timeControl } from '../state/timeControl';
import { uiState } from '../state/uiState';
import { consume, isExhausted, restoreFull, restoreHalf } from '../systems/EnergySystem';
import { advanceDay as advanceFarmDay } from '../systems/FarmingSystem';
import { HOTBAR_SIZE, itemAt } from '../systems/InventorySystem';
import type { Direction } from '../systems/movement';
import * as SaveService from '../systems/SaveService';
import { startNewDay } from '../systems/TimeSystem';
import { mapCacheKey, RAIN_TEXTURE, TILESET_TEXTURE } from './PreloadScene';

/** Money lost when passing out, capped so a bad night never wipes someone out. */
const PASS_OUT_MONEY_PENALTY_RATE = 0.1;
const PASS_OUT_MONEY_PENALTY_MAX = 1000;

export interface MapSceneData {
  spawn?: string;
  facing?: Direction;
}

interface Door {
  zone: Phaser.GameObjects.Zone;
  to: MapKey;
  spawn: string;
}

type Keys = Record<
  'up' | 'down' | 'left' | 'right' | 'w' | 'a' | 's' | 'd' | 'shift' | 'interact' | 'useTool',
  Phaser.Input.Keyboard.Key
>;

const HOTBAR_KEY_CODES = [
  Phaser.Input.Keyboard.KeyCodes.ONE,
  Phaser.Input.Keyboard.KeyCodes.TWO,
  Phaser.Input.Keyboard.KeyCodes.THREE,
  Phaser.Input.Keyboard.KeyCodes.FOUR,
  Phaser.Input.Keyboard.KeyCodes.FIVE,
  Phaser.Input.Keyboard.KeyCodes.SIX,
  Phaser.Input.Keyboard.KeyCodes.SEVEN,
  Phaser.Input.Keyboard.KeyCodes.EIGHT,
  Phaser.Input.Keyboard.KeyCodes.NINE,
  Phaser.Input.Keyboard.KeyCodes.ZERO,
  Phaser.Input.Keyboard.KeyCodes.MINUS,
  Phaser.Input.Keyboard.KeyCodes.PLUS,
];

/**
 * Shared logic for every walkable map: loads the Tiled map, places the player
 * at a spawn point, handles collisions, camera, doors to other maps, sleeping
 * in bed (or passing out at 2 AM), and rain for outdoor maps.
 */
export abstract class MapScene extends Phaser.Scene {
  protected player!: Player;
  protected map!: Phaser.Tilemaps.Tilemap;
  protected groundLayer!: Phaser.Tilemaps.TilemapLayer;
  protected decorLayer!: Phaser.Tilemaps.TilemapLayer;
  private keys!: Keys;
  private hotbarKeys: Phaser.Input.Keyboard.Key[] = [];
  private transitioning = false;
  private bedZones: Phaser.GameObjects.Zone[] = [];
  private rain?: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(readonly mapKey: MapKey) {
    super(mapKey);
  }

  /** Outdoor maps show rain; indoor maps never do. Override in Farm/Town. */
  protected get isOutdoor(): boolean {
    return false;
  }

  create(data: MapSceneData): void {
    this.transitioning = false;
    timeControl.paused = false;
    const info = MAPS[this.mapKey];

    this.map = this.make.tilemap({ key: mapCacheKey(info.file) });
    const tileset = this.map.addTilesetImage('farm_tiles', TILESET_TEXTURE);
    if (!tileset) throw new Error(`Tileset missing for map ${this.mapKey}`);

    const ground = this.map.createLayer('ground', tileset, 0, 0);
    const decor = this.map.createLayer('decor', tileset, 0, 0);
    const above = this.map.createLayer('above', tileset, 0, 0);
    if (!ground || !decor || !above) throw new Error(`Map ${this.mapKey} is missing a layer`);

    ground.setDepth(-2);
    decor.setDepth(-1);
    above.setDepth(DEPTH_ABOVE);
    ground.setCollisionByProperty({ collides: true });
    decor.setCollisionByProperty({ collides: true });
    this.groundLayer = ground;
    this.decorLayer = decor;

    const { widthInPixels: w, heightInPixels: h } = this.map;
    this.physics.world.setBounds(0, 0, w, h);

    const spawn = this.findSpawn(data.spawn ?? 'default');
    this.player = new Player(this, spawn.x, spawn.y, data.facing ?? this.defaultFacing(data.spawn));
    this.physics.add.collider(this.player, ground);
    this.physics.add.collider(this.player, decor);

    this.createDoors();
    this.createBeds();
    this.setupCamera(w, h);
    this.setupInput();
    this.setupRain();
    this.afterMapBuilt();

    const onPassOut = () => this.sleepSequence('passedOut');
    EventBus.on(GameEvents.PassOutRequested, onPassOut);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => EventBus.off(GameEvents.PassOutRequested, onPassOut));

    gameState.currentMap = this.mapKey;
    gameState.spawnId = data.spawn ?? 'default';
    const payload: MapEnteredPayload = { mapKey: this.mapKey, displayName: info.displayName };
    EventBus.emit(GameEvents.MapEntered, payload);
  }

  update(): void {
    if (this.transitioning) return;

    this.player.setExhausted(isExhausted(gameState.energy));

    if (uiState.inventoryOpen) {
      this.player.updateMovement({ up: false, down: false, left: false, right: false, run: false });
      return;
    }

    this.player.updateMovement(this.readInput());
    this.readHotbarSelection();

    if (Phaser.Input.Keyboard.JustDown(this.keys.interact)) {
      if (!this.tryHarvestFacingTile()) {
        if (this.isNearBed()) this.sleepSequence('manual');
        else this.tryUseShippingBin();
      }
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.useTool)) {
      this.useEquippedTool();
    }
  }

  /** Which way the player looks after arriving. Override per map if needed. */
  protected defaultFacing(_spawn?: string): Direction {
    return 'down';
  }

  /** Extension points for farmable maps (overridden by FarmScene). Harmless no-ops elsewhere. */
  protected afterMapBuilt(): void {}
  protected applyToolEffect(_itemId: ItemId, _tile: { x: number; y: number }): void {}
  protected tryPlantFacingTile(_seedItemId: ItemId): void {}
  protected tryHarvestFacingTile(): boolean {
    return false;
  }
  protected tryUseShippingBin(): void {}

  private findSpawn(id: string): { x: number; y: number } {
    const objects = this.map.getObjectLayer('objects')?.objects ?? [];
    const match =
      objects.find((o) => o.name === `spawn_${id}`) ?? objects.find((o) => o.name === 'spawn_default');
    if (!match || match.x === undefined || match.y === undefined) {
      return { x: this.map.widthInPixels / 2, y: this.map.heightInPixels / 2 };
    }
    return { x: match.x, y: match.y };
  }

  private createDoors(): void {
    const objects = this.map.getObjectLayer('objects')?.objects ?? [];
    const doors: Door[] = [];
    for (const o of objects) {
      if (o.name !== 'door') continue;
      const to = readProp(o, 'to');
      const spawn = readProp(o, 'spawn') ?? 'default';
      if (!to || !isMapKey(to)) {
        console.warn(`Door in ${this.mapKey} points to unknown map "${to}"`);
        continue;
      }
      const zone = this.add.zone(o.x ?? 0, o.y ?? 0, o.width ?? 16, o.height ?? 16).setOrigin(0, 0);
      this.physics.add.existing(zone, true);
      doors.push({ zone, to, spawn });
    }
    for (const door of doors) {
      this.physics.add.overlap(this.player, door.zone, () => this.goTo(door.to, door.spawn));
    }
  }

  private createBeds(): void {
    this.bedZones = this.createZonesNamed('bed');
  }

  private isNearBed(): boolean {
    return this.isNearAnyZone(this.bedZones);
  }

  protected isNearAnyZone(zones: Phaser.GameObjects.Zone[]): boolean {
    const b = this.player.body as Phaser.Physics.Arcade.Body;
    const playerRect = new Phaser.Geom.Rectangle(b.x, b.y, b.width, b.height);
    return zones.some((zone) => Phaser.Geom.Rectangle.Overlaps(zone.getBounds(), playerRect));
  }

  /** Finds zones by object name in the "objects" layer, same pattern as beds/doors. */
  protected createZonesNamed(name: string): Phaser.GameObjects.Zone[] {
    const objects = this.map.getObjectLayer('objects')?.objects ?? [];
    return objects
      .filter((o) => o.name === name)
      .map((o) => this.add.zone(o.x ?? 0, o.y ?? 0, o.width ?? 16, o.height ?? 16).setOrigin(0, 0));
  }

  private goTo(target: MapKey, spawn: string): void {
    if (this.transitioning) return;
    this.beginTransition();
    const facing = this.player.direction;
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(target, { spawn, facing } satisfies MapSceneData);
    });
  }

  /** Falling asleep in bed, or passing out from staying up past 2 AM. Both end the day. */
  private sleepSequence(reason: 'manual' | 'passedOut'): void {
    if (this.transitioning) return;
    this.beginTransition();
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      const wasRaining = gameState.time.weather === 'rainy';
      const nextTime = startNewDay(gameState.time);
      gameState.time = nextTime;
      gameState.farmPlots = advanceFarmDay(gameState.farmPlots, nextTime.season, wasRaining);

      let earnings = 0;
      for (const [itemId, qty] of Object.entries(gameState.shippingBin)) {
        earnings += (ITEMS[itemId as keyof typeof ITEMS].sellPrice ?? 0) * (qty ?? 0);
      }
      gameState.money += earnings;
      gameState.shippingBin = {};

      if (reason === 'passedOut') {
        const penalty = Math.min(PASS_OUT_MONEY_PENALTY_MAX, Math.round(gameState.money * PASS_OUT_MONEY_PENALTY_RATE));
        gameState.money = Math.max(0, gameState.money - penalty);
        gameState.energy = restoreHalf(gameState.energy);
      } else {
        gameState.energy = restoreFull(gameState.energy);
      }

      const payload: DayStartedPayload = {
        time: nextTime,
        day: nextTime.day,
        season: nextTime.season,
        year: nextTime.year,
        weather: nextTime.weather,
        earnings,
      };
      gameState.currentMap = 'House';
      gameState.spawnId = 'default';
      SaveService.save(gameState);

      this.scene.start('House', { spawn: 'default', facing: 'down' } satisfies MapSceneData);
      // Emitted after scene.start queues the new scene's create(); UI is a separate
      // active scene so it still receives this straight away.
      EventBus.emit(GameEvents.DayStarted, payload);
    });
  }

  private beginTransition(): void {
    this.transitioning = true;
    timeControl.paused = true;
    this.player.halt();
    this.cameras.main.fadeOut(FADE_MS, 0, 0, 0);
  }

  private setupCamera(w: number, h: number): void {
    const cam = this.cameras.main;
    cam.setZoom(WORLD_ZOOM);
    cam.setRoundPixels(true);
    cam.setBackgroundColor('#1b1f17');
    const viewW = cam.width / WORLD_ZOOM;
    const viewH = cam.height / WORLD_ZOOM;
    if (w <= viewW && h <= viewH) {
      // Small rooms: keep the whole room centered on screen.
      cam.centerOn(w / 2, h / 2);
    } else {
      cam.setBounds(0, 0, w, h);
      cam.startFollow(this.player, true, 0.15, 0.15);
    }
    cam.fadeIn(FADE_MS, 0, 0, 0);
  }

  private setupInput(): void {
    const kb = this.input.keyboard;
    if (!kb) throw new Error('Keyboard input is not available');
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = kb.addKeys({
      up: K.UP, down: K.DOWN, left: K.LEFT, right: K.RIGHT,
      w: K.W, a: K.A, s: K.S, d: K.D, shift: K.SHIFT, interact: K.E, useTool: K.SPACE,
    }) as Keys;
    this.hotbarKeys = HOTBAR_KEY_CODES.map((code) => kb.addKey(code));

    this.input.on('wheel', (_p: unknown, _o: unknown, _dx: number, dy: number) => {
      if (uiState.inventoryOpen) return;
      const delta = dy > 0 ? 1 : -1;
      gameState.equippedSlot = (gameState.equippedSlot + delta + HOTBAR_SIZE) % HOTBAR_SIZE;
    });
  }

  private readHotbarSelection(): void {
    for (let i = 0; i < this.hotbarKeys.length; i++) {
      if (Phaser.Input.Keyboard.JustDown(this.hotbarKeys[i])) {
        gameState.equippedSlot = i;
      }
    }
  }

  private useEquippedTool(): void {
    const stack = itemAt(gameState.inventory, gameState.equippedSlot);
    if (!stack) return;

    if (ITEMS[stack.itemId].category === 'seed') {
      this.tryPlantFacingTile(stack.itemId);
      return;
    }

    const cost = TOOL_ENERGY_COST[stack.itemId];
    if (cost === undefined) return; // not a tool; nothing to do
    if (isExhausted(gameState.energy)) return;

    gameState.energy = consume(gameState.energy, cost);
    this.player.playUseToolFeedback();
    const tile = this.player.getFacingTile(TILE);
    this.applyToolEffect(stack.itemId, tile);
  }

  private readInput(): PlayerInput {
    const k = this.keys;
    return {
      up: k.up.isDown || k.w.isDown,
      down: k.down.isDown || k.s.isDown,
      left: k.left.isDown || k.a.isDown,
      right: k.right.isDown || k.d.isDown,
      run: k.shift.isDown,
    };
  }

  private setupRain(): void {
    if (!this.isOutdoor || gameState.time.weather !== 'rainy') return;
    const { widthInPixels: w, heightInPixels: h } = this.map;
    // Spawn drops across the full map width just above the top edge; falling
    // at this speed they cross the whole map height before their lifespan ends.
    this.rain = this.add.particles(0, 0, RAIN_TEXTURE, {
      x: { min: 0, max: w },
      y: -8,
      lifespan: (h / 280) * 1000 + 300,
      speedY: { min: 260, max: 320 },
      speedX: -40,
      quantity: 3,
      frequency: 20,
      scale: 1,
      alpha: { start: 0.55, end: 0.35 },
    });
    this.rain.setDepth(DEPTH_ABOVE - 2);
  }
}

function readProp(obj: Phaser.Types.Tilemaps.TiledObject, name: string): string | undefined {
  const props = obj.properties as { name: string; value: unknown }[] | undefined;
  const found = props?.find((p) => p.name === name);
  return typeof found?.value === 'string' ? found.value : undefined;
}
