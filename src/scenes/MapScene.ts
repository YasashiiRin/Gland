import Phaser from 'phaser';
import { DEPTH_ABOVE, FADE_MS, TILE } from '../config/constants';
import { setupWorldCamera } from './cameraFit';
import { ITEMS, TOOL_ENERGY_COST, type ItemId } from '../data/items';
import { isWaterGid, TILE_GID } from '../config/tileGids';
import { isMapKey, MAPS, type MapKey } from '../data/maps';
import { Player, type PlayerInput } from '../entities/Player';
import {
  EventBus,
  GameEvents,
  type DayStartedPayload,
  type FishingStartedPayload,
  type MapEnteredPayload,
} from '../events/EventBus';
import { pickFish } from '../systems/FishingSystem';
import { gameState } from '../state/GameState';
import { currentSpeedMultiplier, eatHeldFood } from '../state/playerStats';
import { timeControl } from '../state/timeControl';
import { isWorldInputBlocked, uiState } from '../state/uiState';
import { worldView } from '../state/worldView';
import { buildMinimap } from '../systems/MinimapSystem';
import { consume, isExhausted } from '../systems/EnergySystem';
import { DAY_LENGTH_MINUTES } from '../config/time';
import { endWorldDay, hoursSlept, sleepState, wakeUp } from '../state/dayCycle';
import { addItem, expandInventory, HOTBAR_SIZE, INVENTORY_SIZE, itemAt, removeItem } from '../systems/InventorySystem';
import { craftingState } from '../state/craftingState';
import type { Station } from '../data/recipes';
import type { Direction } from '../systems/movement';
import { addXp, XP_REWARDS } from '../systems/SkillSystem';
import { playPickup, playUseTool } from '../systems/SfxSystem';

import {
  hitResource,
  isCleared,
  resourceKey,
  rollFiberYield,
  rollStoneYield,
  rollWoodYield,
  type ResourceKind,
} from '../systems/ResourceSystem';
import * as SaveService from '../systems/SaveService';
import { absoluteDayNumber, clockMinuteOfDay } from '../systems/TimeSystem';
import { mapCacheKey, RAIN_TEXTURE, TILESET_TEXTURE, WOOD_CHIP_TEXTURE } from './PreloadScene';
import { createProps, readProp, TreeSprites } from './worldSprites';
import { RideController } from './rideController';
import { RemotePlayers } from './remotePlayers';
import { HorrorDirector } from './horrorDirector';
import { net, NetEvents } from '../net/NetSession';
import { everyoneAsleep, pickShared, type NewDayInfo } from '../net/protocol';
import { touchedKeys, type WorldPatch } from '../net/worldPatch';
import { worldSync } from '../net/worldSync';
import { rideState } from '../state/rideState';
import { consumeTouchInteract, consumeTouchUse, touchInput } from '../state/touchInput';

const NO_INPUT = { up: false, down: false, left: false, right: false };

/** How often (ms) this player's position is sent to the others in a room. */
const POSE_SEND_MS = 100;
import type { VehicleAbility } from '../data/items';

/** Fainting (ghost attack): you wake with this share of health and sanity back. */
const FAINT_RESTORE_RATIO = 0.3;
/** Money lost when fainting, capped so a bad night never wipes someone out. */
const PASS_OUT_MONEY_PENALTY_RATE = 0.1;
const PASS_OUT_MONEY_PENALTY_MAX = 1000;

export interface MapSceneData {
  spawn?: string;
  facing?: Direction;
  /** Restart right here (the new day dawning while you're out and about). */
  x?: number;
  y?: number;
}

interface Door {
  zone: Phaser.GameObjects.Zone;
  to: MapKey;
  spawn: string;
}

type Keys = Record<
  'up' | 'down' | 'left' | 'right' | 'w' | 'a' | 's' | 'd' | 'interact' | 'useTool',
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
  protected aboveLayer!: Phaser.Tilemaps.TilemapLayer;
  protected trees!: TreeSprites;
  protected ride!: RideController;
  private remotes!: RemotePlayers;
  protected horror!: HorrorDirector;
  private lastPoseSent = 0;
  private keys!: Keys;
  private hotbarKeys: Phaser.Input.Keyboard.Key[] = [];
  private transitioning = false;
  private targetHighlight!: Phaser.GameObjects.Rectangle;
  private bedZones: Phaser.GameObjects.Zone[] = [];
  private benchZones: Phaser.GameObjects.Zone[] = [];
  private rain?: Phaser.GameObjects.Particles.ParticleEmitter;
  /** Last time (scene clock, ms) the mouse moved / a movement key went down; decides who aims tools. */
  private lastPointerMoveAt = Number.NEGATIVE_INFINITY;
  private lastMoveKeyAt = Number.NEGATIVE_INFINITY;
  /** Tile chosen by the mouse this frame, or null when aiming with the keyboard (facing tile). */
  private mouseAimTile: { x: number; y: number } | null = null;

  constructor(readonly mapKey: MapKey) {
    super(mapKey);
  }

  /** Outdoor maps show rain and allow vehicles (see maps.json "outdoor"). */
  protected get isOutdoor(): boolean {
    return MAPS[this.mapKey].outdoor;
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
    this.aboveLayer = above;

    const { widthInPixels: w, heightInPixels: h } = this.map;
    this.physics.world.setBounds(0, 0, w, h);

    const spawn = data.x !== undefined && data.y !== undefined ? { x: data.x, y: data.y } : this.findSpawn(data.spawn ?? 'default');
    this.player = new Player(this, spawn.x, spawn.y, data.facing ?? this.defaultFacing(data.spawn));
    this.physics.add.collider(this.player, ground);
    this.physics.add.collider(this.player, decor);

    this.createDoors();
    this.createBeds();
    this.benchZones = this.createZonesNamed('craft_bench', 6);
    this.setupCamera(w, h);
    this.setupInput();
    this.setupRain();
    this.targetHighlight = this.add
      .rectangle(0, 0, TILE, TILE, 0x4caf50, 0.4)
      .setOrigin(0, 0)
      .setDepth(1)
      .setVisible(false);
    this.applyResourceNodeVisuals();
    createProps(this, this.map);
    this.trees = new TreeSprites(this, decor);
    if (!this.isOutdoor) gameState.riding = null; // vehicles stay outside
    this.ride = new RideController(this, this.player, this.mapKey, (tiles, ability) => this.onVehicleWork(tiles, ability));
    this.afterMapBuilt();

    this.remotes = new RemotePlayers(this, this.mapKey);
    this.horror = new HorrorDirector(this, this.player, !this.isOutdoor, ground, decor);
    // Guest: the host started a new day (or resynced) — take its world and redraw the map.
    // (worldSync has already applied the new world by the time the restart runs.)
    const onWorld = (p: { newDay?: NewDayInfo }) => {
      if (p.newDay) this.wakeUpAsGuest(p.newDay);
      else if (!this.transitioning) this.scene.restart({ spawn: gameState.spawnId });
    };
    // Host: once everyone in the room is in bed, the day ends for all.
    const onSleepers = () => {
      if (net.role === 'host' && net.sleepers.has(net.myId) && everyoneAsleep(net.players, net.sleepers)) {
        this.sleepSequence();
      }
    };
    net.events.on(NetEvents.Sleepers, onSleepers);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => net.events.off(NetEvents.Sleepers, onSleepers));
    const onPatched = (patch: WorldPatch) => this.onWorldPatched(patch);
    net.events.on(NetEvents.World, onWorld);
    EventBus.on(GameEvents.WorldPatched, onPatched);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      net.events.off(NetEvents.World, onWorld);
      EventBus.off(GameEvents.WorldPatched, onPatched);
    });

    const onDawn = () => this.dawnArrives();
    const onFaint = () => this.faint();
    EventBus.on(GameEvents.DawnReached, onDawn);
    EventBus.on(GameEvents.PlayerFainted, onFaint);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off(GameEvents.DawnReached, onDawn);
      EventBus.off(GameEvents.PlayerFainted, onFaint);
    });

    gameState.currentMap = this.mapKey;
    gameState.spawnId = data.spawn ?? 'default';
    const minimap = buildMinimap(
      this.map.width,
      this.map.height,
      (x, y) => ground.getTileAt(x, y)?.index,
      (x, y) => decor.getTileAt(x, y)?.index,
    );
    const payload: MapEnteredPayload = { mapKey: this.mapKey, displayName: info.displayName, minimap };
    EventBus.emit(GameEvents.MapEntered, payload);
  }

  update(time: number): void {
    if (this.transitioning) return;
    this.syncNetwork(time);
    this.horror.update(time);
    craftingState.nearStation = this.nearestStation();

    this.player.setExhausted(isExhausted(gameState.energy));
    this.trees.updateOcclusion(this.player.x, this.player.y);
    this.ride.update(this.time.now);
    worldView.playerTileX = Math.floor(this.player.x / TILE);
    worldView.playerTileY = Math.floor(this.player.y / TILE);

    if (isWorldInputBlocked()) {
      this.player.updateMovement({ up: false, down: false, left: false, right: false });
      this.targetHighlight.setVisible(false);
      consumeTouchUse(); // a tap that closed a menu must not also swing a tool
      consumeTouchInteract();
      return;
    }

    this.trackMoveKeyPresses();
    // A passenger doesn't steer: the driver's vehicle carries them (see RideController).
    this.player.updateMovement(rideState.passengerOf ? NO_INPUT : this.readInput(), currentSpeedMultiplier());
    this.readHotbarSelection();
    // With touch controls, a finger on the joystick isn't "aiming": tools use the facing tile
    // (tapping the world still aims at the tapped tile, see onWorldPointerDown).
    this.mouseAimTile = !touchInput.enabled && this.lastPointerMoveAt > this.lastMoveKeyAt ? this.pointerAimTile() : null;
    this.updateTargetHighlight();

    if (Phaser.Input.Keyboard.JustDown(this.keys.interact) || consumeTouchInteract()) this.interact();
    if (Phaser.Input.Keyboard.JustDown(this.keys.useTool) || consumeTouchUse()) this.useEquippedTool();
  }

  /** Multiplayer: send my position now and then, and draw the other players. */
  private syncNetwork(time: number): void {
    if (!net.online) return;
    this.remotes.update();
    if (time - this.lastPoseSent < POSE_SEND_MS) return;
    this.lastPoseSent = time;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    net.sendPose({
      map: this.mapKey,
      x: Math.round(this.player.x),
      y: Math.round(this.player.y),
      dir: this.player.direction,
      moving: body.velocity.x !== 0 || body.velocity.y !== 0,
      riding: gameState.riding,
      seatOf: rideState.passengerOf,
    });
  }

  /** E key / right click: harvest, open, talk, sleep, sell... whichever applies first. */
  private interact(): void {
    if (gameState.riding || rideState.passengerOf) {
      // Riding: get off (a driven vehicle stays parked here; a passenger just steps down).
      this.say(this.ride.dismount());
      return;
    }
    if (this.say(this.ride.tryMount())) return;
    if (craftingState.nearStation) {
      EventBus.emit(GameEvents.CraftingOpenRequested, { station: craftingState.nearStation });
      return;
    }
    if (
      !this.tryHarvestFacingTile() &&
      !this.tryOpenChest() &&
      !this.tryTalkToNpc() &&
      !this.tryEnterMine() &&
      !this.tryUseCoop() &&
      !this.tryUseQuestBoard()
    ) {
      if (this.isNearBed()) {
        // In a room you lie down and wait; the day ends when everyone is in bed.
        if (net.online) EventBus.emit(GameEvents.SleepWaitRequested);
        else this.sleepSequence();
      }
      else if (!this.tryOpenShop()) this.tryUseShippingBin();
    }
  }

  /**
   * The tile tools and interactions act on. With the mouse in charge it's the
   * hovered tile when that's next to the player, otherwise the neighbouring
   * tile in the pointer's direction; with the keyboard it's the facing tile.
   */
  protected actionTile(): { x: number; y: number } {
    return this.mouseAimTile ?? this.player.getFacingTile(TILE);
  }

  private pointerAimTile(): { x: number; y: number } | null {
    const pointer = this.input.activePointer;
    const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const px = Math.floor(this.player.x / TILE);
    const py = Math.floor(this.player.y / TILE);
    const tx = Math.floor(world.x / TILE);
    const ty = Math.floor(world.y / TILE);
    const dx = tx - px;
    const dy = ty - py;
    if (dx === 0 && dy === 0) return null; // pointing at yourself: keep the facing tile
    if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) return { x: tx, y: ty };
    // Too far: act on the neighbouring tile in the pointer's main direction.
    return Math.abs(dx) >= Math.abs(dy) ? { x: px + Math.sign(dx), y: py } : { x: px, y: py + Math.sign(dy) };
  }

  private trackMoveKeyPresses(): void {
    const k = this.keys;
    const moveKeys = [k.up, k.down, k.left, k.right, k.w, k.a, k.s, k.d];
    if (moveKeys.some((key) => Phaser.Input.Keyboard.JustDown(key))) this.lastMoveKeyAt = this.time.now;
  }

  /** Left click = use the held tool/seed, right click = interact, aimed at the pointer. */
  private onWorldPointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.transitioning || isWorldInputBlocked()) return;
    this.lastPointerMoveAt = this.time.now;
    this.mouseAimTile = this.pointerAimTile();
    const target = this.actionTile();
    this.player.faceTile(target, TILE);
    if (pointer.rightButtonDown()) this.interact();
    else if (pointer.leftButtonDown()) this.useEquippedTool();
  }

  /** Which way the player looks after arriving. Override per map if needed. */
  protected defaultFacing(_spawn?: string): Direction {
    return 'down';
  }

  /** Extension points for farmable maps (overridden by FarmScene). Harmless no-ops elsewhere. */
  protected afterMapBuilt(): void {}
  protected applyToolEffect(itemId: ItemId, tile: { x: number; y: number }): void {
    if (itemId === 'fishing_rod') {
      this.tryStartFishing(tile);
      return;
    }
    this.applyGatheringToolEffect(itemId, tile);
  }

  private tryStartFishing(tile: { x: number; y: number }): void {
    if (uiState.fishingOpen) return;
    const gid = this.groundLayer.getTileAt(tile.x, tile.y)?.index;
    if (!isWaterGid(gid)) return;

    const hour = Math.floor(clockMinuteOfDay(gameState.time) / 60);
    const fishId = pickFish({ mapKey: this.mapKey, season: gameState.time.season, hour, weather: gameState.time.weather });
    if (!fishId) {
      console.info('Không có cá nào cắn câu lúc này.');
      return;
    }
    const payload: FishingStartedPayload = { fishId };
    EventBus.emit(GameEvents.FishingStarted, payload);
  }
  protected tryPlantFacingTile(_seedItemId: ItemId): void {}
  protected tryHarvestFacingTile(): boolean {
    return false;
  }
  protected tryUseShippingBin(): void {}
  protected tryOpenShop(): boolean {
    return false;
  }
  protected tryPlaceFurniture(_itemId: ItemId): void {}
  protected tryOpenChest(): boolean {
    return false;
  }
  protected tryTalkToNpc(): boolean {
    return false;
  }
  protected tryEnterMine(): boolean {
    return false;
  }
  protected tryUseCoop(): boolean {
    return false;
  }

  private updateTargetHighlight(): void {
    // Riding: tools are put away; a working vehicle shows its own 2x2 area instead.
    const state = gameState.riding ? 'none' : this.getTargetHighlightState();
    if (state === 'none') {
      this.targetHighlight.setVisible(false);
      return;
    }
    const tile = this.actionTile();
    this.targetHighlight
      .setVisible(true)
      .setPosition(tile.x * TILE, tile.y * TILE)
      .setFillStyle(state === 'valid' ? 0x4caf50 : 0xe53935, 0.4);
  }

  /**
   * Whether the tile the player is facing is a valid target for the
   * currently equipped item — shown as a green/red highlight, in the spirit
   * of the cursor-highlight convention common to farming/crafting games.
   * Base implementation covers the gathering tools (valid everywhere, since
   * it's the same check for any map); FarmScene extends this for
   * hoe/watering-can/seeds/furniture.
   */
  protected getTargetHighlightState(): 'none' | 'valid' | 'invalid' {
    const stack = itemAt(gameState.inventory, gameState.equippedSlot);
    if (!stack) return 'none';
    const tile = this.actionTile();

    if (stack.itemId === 'fishing_rod') {
      const gid = this.groundLayer.getTileAt(tile.x, tile.y)?.index;
      return isWaterGid(gid) ? 'valid' : 'invalid';
    }

    const kind =
      stack.itemId === 'axe' ? 'tree' : stack.itemId === 'pickaxe' ? 'rock' : stack.itemId === 'scythe' ? 'weed' : undefined;
    if (!kind) return 'none';
    const gid = this.decorLayer.getTileAt(tile.x, tile.y)?.index;
    const expectedGid = kind === 'tree' ? TILE_GID.TRUNK : kind === 'rock' ? TILE_GID.ROCK : TILE_GID.BUSH;
    return gid === expectedGid ? 'valid' : 'invalid';
  }
  protected tryUseQuestBoard(): boolean {
    return false;
  }

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

  /**
   * Finds zones by object name in the "objects" layer, same pattern as
   * beds/doors. Padded a few pixels beyond the tile itself so standing right
   * next to a solid interactable (a rock, a chest) reliably counts as "near"
   * even though Arcade collision can rest the player flush against its edge
   * with zero true overlap.
   */
  protected createZonesNamed(name: string, pad = 4): Phaser.GameObjects.Zone[] {
    const objects = this.map.getObjectLayer('objects')?.objects ?? [];
    return objects
      .filter((o) => o.name === name)
      .map((o) =>
        this.add
          .zone((o.x ?? 0) - pad, (o.y ?? 0) - pad, (o.width ?? 16) + pad * 2, (o.height ?? 16) + pad * 2)
          .setOrigin(0, 0),
      );
  }

  private goTo(target: MapKey, spawn: string): void {
    if (this.transitioning) return;
    // Vehicles can follow you to other outdoor maps; at an indoor door they're parked outside.
    if (gameState.riding && !MAPS[target].outdoor) this.ride.dismount();
    rideState.passengerOf = null;
    this.beginTransition();
    const facing = this.player.direction;
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(target, { spawn, facing } satisfies MapSceneData);
    });
  }

  /**
   * Guest: the host ended the day. The new world is already applied (by
   * worldSync). If I was in bed I wake up at home, rested by the hours I
   * slept; if I stayed up, the morning just arrives where I'm standing.
   */
  private wakeUpAsGuest(newDay: NewDayInfo): void {
    if (this.transitioning) return;
    const slept = newDay.sleepers.includes(net.myId);
    wakeUp(slept ? hoursSlept(DAY_LENGTH_MINUTES) : 0);
    const t = gameState.time;
    const payload: DayStartedPayload = { time: t, day: t.day, season: t.season, year: t.year, weather: t.weather, earnings: newDay.earnings };
    if (slept) this.goHomeForNewDay(payload);
    else this.newDayInPlace(payload);
  }

  /** Lying down in bed: sleep until 6:00. Each hour slept restores 12.5% (see wakeUp). */
  private sleepSequence(): void {
    if (this.transitioning) return;
    if (sleepState.bedElapsed === null) sleepState.bedElapsed = gameState.time.elapsedMinutes;
    const hours = hoursSlept(DAY_LENGTH_MINUTES);
    const payload = this.startNextDay();
    wakeUp(hours);
    this.goHomeForNewDay(payload);
  }

  /** 6:00 came while I was still up (host/solo): the day turns over where I stand, nothing restored. */
  private dawnArrives(): void {
    if (this.transitioning || net.role === 'guest') return;
    if (uiState.sleepWait || (net.online && net.sleepers.has(net.myId))) {
      this.sleepSequence(); // I was lying in bed waiting for the others
      return;
    }
    const payload = this.startNextDay();
    wakeUp(0);
    this.newDayInPlace(payload);
  }

  /** Host/solo: run the farm's day change, save, and send the new world to the room. */
  private startNextDay(): DayStartedPayload {
    const { time, earnings } = endWorldDay();
    SaveService.save(gameState);
    if (net.role === 'host') {
      net.broadcastWorld(pickShared(gameState), { earnings, sleepers: [...net.sleepers] });
      worldSync.rebase();
    }
    return { time, day: time.day, season: time.season, year: time.year, weather: time.weather, earnings };
  }

  private goHomeForNewDay(payload: DayStartedPayload): void {
    if (gameState.riding) this.ride.dismount();
    gameState.currentMap = 'House';
    gameState.spawnId = 'default';
    this.beginTransition();
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      SaveService.save(gameState);
      this.scene.start('House', { spawn: 'default', facing: 'down' } satisfies MapSceneData);
      // Emitted after scene.start queues the new scene's create(); UI is a separate
      // active scene so it still receives this straight away.
      EventBus.emit(GameEvents.DayStarted, payload);
    });
  }

  /** Redraw this map for the new morning (crops grew…) without moving the player. */
  private newDayInPlace(payload: DayStartedPayload): void {
    const at = { x: Math.round(this.player.x), y: Math.round(this.player.y), facing: this.player.direction };
    this.beginTransition();
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.restart({ spawn: gameState.spawnId, ...at } satisfies MapSceneData);
      EventBus.emit(GameEvents.DayStarted, payload);
    });
  }

  /**
   * Knocked out by a ghost: you come to in your bed at home, a little poorer,
   * with some health and nerve back (no time passes).
   */
  private faint(): void {
    if (this.transitioning) return;
    const penalty = Math.min(PASS_OUT_MONEY_PENALTY_MAX, Math.round(gameState.money * PASS_OUT_MONEY_PENALTY_RATE));
    gameState.money = Math.max(0, gameState.money - penalty);
    gameState.playerHealth = { ...gameState.playerHealth, current: Math.round(gameState.playerHealth.max * FAINT_RESTORE_RATIO) };
    gameState.sanity = { ...gameState.sanity, current: Math.max(gameState.sanity.current, gameState.sanity.max * FAINT_RESTORE_RATIO) };
    if (gameState.riding) this.ride.dismount();
    gameState.currentMap = 'House';
    gameState.spawnId = 'default';
    this.beginTransition();
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('House', { spawn: 'default', facing: 'down' } satisfies MapSceneData);
      EventBus.emit(GameEvents.HorrorScreen, { kind: 'caption', text: `Bạn ngất đi… tỉnh dậy ở nhà (mất ${penalty.toLocaleString('vi-VN')} ₫)` });
    });
  }

  private beginTransition(): void {
    this.transitioning = true;
    timeControl.paused = true;
    this.player.halt();
    this.cameras.main.fadeOut(FADE_MS, 0, 0, 0);
  }

  private setupCamera(w: number, h: number): void {
    setupWorldCamera(this, w, h, this.player, '#1b1f17');
    this.cameras.main.fadeIn(FADE_MS, 0, 0, 0);
  }

  private setupInput(): void {
    const kb = this.input.keyboard;
    if (!kb) throw new Error('Keyboard input is not available');
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = kb.addKeys({
      up: K.UP, down: K.DOWN, left: K.LEFT, right: K.RIGHT,
      w: K.W, a: K.A, s: K.S, d: K.D, interact: K.E, useTool: K.SPACE,
    }) as Keys;
    this.hotbarKeys = HOTBAR_KEY_CODES.map((code) => kb.addKey(code));

    // Mouse: right click is an in-game action, so the browser menu must not pop up.
    this.input.mouse?.disableContextMenu();
    this.input.on('pointermove', () => {
      this.lastPointerMoveAt = this.time.now;
    });
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.onWorldPointerDown(pointer));

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

  /** A working tractor/harvester reached a new 2x2 area. Farm overrides this to plough/harvest. */
  protected onVehicleWork(_tiles: { x: number; y: number }[], _ability: VehicleAbility): void {}

  /**
   * Someone else changed the shared farm: redraw what's visible here. The
   * base map handles felled trees / broken rocks / cut weeds; Farm extends it.
   */
  protected onWorldPatched(patch: WorldPatch): void {
    const prefix = `${this.mapKey}:`;
    const today = absoluteDayNumber(gameState.time);
    for (const key of touchedKeys(patch, 'resourceNodes')) {
      if (!key.startsWith(prefix)) continue;
      const [x, y] = key.slice(prefix.length).split(',').map(Number);
      if (!isCleared(gameState.resourceNodes[key], today)) continue;
      const tile = this.decorLayer.getTileAt(x, y);
      if (!tile || tile.index === TILE_GID.BLOCK) continue;
      if (tile.index === TILE_GID.TRUNK) this.trees.fell(x, y, true);
      this.decorLayer.removeTileAt(x, y);
    }
  }

  /** The crafting bench within reach, if any. Farm adds benches the player has built. */
  protected nearestStation(): Station | null {
    return this.isNearAnyZone(this.benchZones) ? 'rough' : null;
  }

  /** Wearing a backpack grows the bag; it can only be swapped for a bigger one. */
  private wearBackpack(itemId: ItemId): string {
    const size = INVENTORY_SIZE + (ITEMS[itemId].backpackSlots ?? 0);
    if (size <= gameState.inventory.slots.length) return 'Ba lô đang đeo đã đủ to rồi';
    gameState.inventory = expandInventory(removeItem(gameState.inventory, itemId, 1), size);
    playPickup(gameState.settings);
    return `Đã đeo ${ITEMS[itemId].name}: túi đồ có ${size} ô`;
  }

  /** Shows a short message above the player; returns whether there was one. */
  protected say(message: string | null): boolean {
    if (!message) return false;
    this.showFloatingText(this.player.x, this.player.y - 26, message);
    return true;
  }

  private useEquippedTool(): void {
    const stack = itemAt(gameState.inventory, gameState.equippedSlot);
    // While riding, Space / left click is the vehicle's own action (work mode, horn,
    // open the cargo bed); only eating still works from the seat.
    if ((gameState.riding || rideState.passengerOf) && (!stack || ITEMS[stack.itemId].category !== 'food')) {
      this.say(this.ride.action());
      return;
    }
    if (!stack) return;

    if (ITEMS[stack.itemId].category === 'seed') {
      this.tryPlantFacingTile(stack.itemId);
      return;
    }
    if (ITEMS[stack.itemId].category === 'equipment') {
      this.say(this.wearBackpack(stack.itemId));
      return;
    }
    if (ITEMS[stack.itemId].category === 'furniture') {
      this.tryPlaceFurniture(stack.itemId);
      return;
    }
    if (ITEMS[stack.itemId].category === 'food') {
      const message = eatHeldFood();
      if (message) {
        playPickup(gameState.settings);
        this.showFloatingText(this.player.x, this.player.y - 26, message);
      }
      return;
    }

    const cost = TOOL_ENERGY_COST[stack.itemId];
    if (cost === undefined) return; // not a tool; nothing to do
    if (isExhausted(gameState.energy)) return;

    gameState.energy = consume(gameState.energy, cost);
    this.player.playUseToolFeedback();
    playUseTool(gameState.settings);
    const tile = this.actionTile();
    this.applyToolEffect(stack.itemId, tile);
  }

  private readInput(): PlayerInput {
    const k = this.keys;
    return {
      up: k.up.isDown || k.w.isDown || touchInput.up,
      down: k.down.isDown || k.s.isDown || touchInput.down,
      left: k.left.isDown || k.a.isDown || touchInput.left,
      right: k.right.isDown || k.d.isDown || touchInput.right,
    };
  }

  /** Hides the tile(s) for any resource node on this map that is still cleared (not yet respawned). */
  private applyResourceNodeVisuals(): void {
    const prefix = `${this.mapKey}:`;
    for (const [key, node] of Object.entries(gameState.resourceNodes)) {
      if (!key.startsWith(prefix)) continue;
      if (!isCleared(node, absoluteDayNumber(gameState.time))) continue;
      const [xStr, yStr] = key.slice(prefix.length).split(',');
      const x = Number(xStr);
      const y = Number(yStr);
      // Only clear the tile if it still is that resource: after a map redesign
      // an old key may point at a wall/fence that must stay.
      const expected = node.kind === 'tree' ? TILE_GID.TRUNK : node.kind === 'rock' ? TILE_GID.ROCK : TILE_GID.BUSH;
      if (this.decorLayer.getTileAt(x, y)?.index !== expected) continue;
      this.decorLayer.removeTileAt(x, y);
    }
  }

  /** Axe/pickaxe/scythe gathering from trees/rocks/weeds, shared by every map that has them. */
  protected applyGatheringToolEffect(itemId: ItemId, tile: { x: number; y: number }): void {
    const kind: ResourceKind | undefined =
      itemId === 'axe' ? 'tree' : itemId === 'pickaxe' ? 'rock' : itemId === 'scythe' ? 'weed' : undefined;
    if (!kind) return;

    const gid = this.decorLayer.getTileAt(tile.x, tile.y)?.index;
    const expectedGid = kind === 'tree' ? TILE_GID.TRUNK : kind === 'rock' ? TILE_GID.ROCK : TILE_GID.BUSH;
    if (gid !== expectedGid) return;

    const key = resourceKey(this.mapKey, tile.x, tile.y);
    const existing = gameState.resourceNodes[key];
    if (isCleared(existing, absoluteDayNumber(gameState.time))) return;

    const { nodes, broke } = hitResource(gameState.resourceNodes, key, kind, absoluteDayNumber(gameState.time));
    gameState.resourceNodes = nodes;

    if (kind === 'tree') {
      if (broke) this.trees.fell(tile.x, tile.y, this.player.x < tile.x * TILE + TILE / 2);
      else this.trees.shake(tile.x, tile.y);
      this.playBurstEffect(tile.x * TILE + TILE / 2, tile.y * TILE + TILE / 2, WOOD_CHIP_TEXTURE, {
        count: broke ? 10 : 5,
        speed: { min: 50, max: 130 },
        lifespan: 380,
      });
    }

    if (!broke) return;

    this.decorLayer.removeTileAt(tile.x, tile.y);
    if (kind === 'tree') this.aboveLayer.removeTileAt(tile.x, tile.y - 1);

    const worldX = tile.x * TILE + TILE / 2;
    const worldY = tile.y * TILE + TILE / 2;
    playPickup(gameState.settings);
    if (kind === 'tree') {
      const qty = rollWoodYield();
      gameState.inventory = addItem(gameState.inventory, 'wood', qty).state;
      gameState.skills = addXp(gameState.skills, 'foraging', XP_REWARDS.chopTree).skills;
      this.showFloatingText(worldX, worldY, `+${qty} Gỗ`);
    } else if (kind === 'rock') {
      const qty = rollStoneYield();
      gameState.inventory = addItem(gameState.inventory, 'stone', qty).state;
      gameState.skills = addXp(gameState.skills, 'mining', XP_REWARDS.mineOre).skills;
      this.showFloatingText(worldX, worldY, `+${qty} Đá`);
    } else {
      const qty = rollFiberYield();
      gameState.inventory = addItem(gameState.inventory, 'fiber', qty).state;
      gameState.skills = addXp(gameState.skills, 'foraging', XP_REWARDS.cutWeed).skills;
      this.showFloatingText(worldX, worldY, `+${qty} Sợi`);
    }
  }

  /** A short one-shot particle burst at a world position — chop splinters, water droplets, etc. */
  protected playBurstEffect(
    x: number,
    y: number,
    textureKey: string,
    config: {
      count?: number;
      speed?: { min: number; max: number };
      angle?: { min: number; max: number };
      lifespan?: number;
      scale?: { start: number; end: number };
      gravityY?: number;
      tint?: number;
    } = {},
  ): void {
    const emitter = this.add.particles(x, y, textureKey, {
      speed: config.speed ?? { min: 40, max: 110 },
      angle: config.angle ?? { min: 0, max: 360 },
      lifespan: config.lifespan ?? 420,
      scale: config.scale ?? { start: 1, end: 0.4 },
      gravityY: config.gravityY ?? 220,
      tint: config.tint,
      quantity: config.count ?? 6,
      emitting: false,
    });
    emitter.setDepth(DEPTH_ABOVE - 2);
    emitter.explode(config.count ?? 6);
    this.time.delayedCall((config.lifespan ?? 420) + 50, () => emitter.destroy());
  }

  /** A short rising, fading label — used for resource/harvest gains. */
  protected showFloatingText(x: number, y: number, text: string): void {
    const label = this.add
      .text(x, y, text, {
        fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
        fontSize: '13px',
        color: '#fff6e0',
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_ABOVE + 1)
      .setShadow(1, 1, '#000000', 2, false, true);
    this.tweens.add({
      targets: label,
      y: y - 18,
      alpha: 0,
      duration: 900,
      ease: 'Cubic.easeOut',
      onComplete: () => label.destroy(),
    });
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
