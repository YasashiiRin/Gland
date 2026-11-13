import Phaser from 'phaser';
import { DEPTH_ABOVE, FADE_MS, WORLD_ZOOM } from '../config/constants';
import { isMapKey, MAPS, type MapKey } from '../data/maps';
import { Player, type PlayerInput } from '../entities/Player';
import { EventBus, GameEvents, type MapEnteredPayload } from '../events/EventBus';
import { gameState } from '../state/GameState';
import type { Direction } from '../systems/movement';
import { mapCacheKey, TILESET_TEXTURE } from './PreloadScene';

export interface MapSceneData {
  spawn?: string;
  facing?: Direction;
}

interface Door {
  zone: Phaser.GameObjects.Zone;
  to: MapKey;
  spawn: string;
}

type Keys = Record<'up' | 'down' | 'left' | 'right' | 'w' | 'a' | 's' | 'd' | 'shift', Phaser.Input.Keyboard.Key>;

/**
 * Shared logic for every walkable map: loads the Tiled map, places the player
 * at a spawn point, handles collisions, camera and doors to other maps.
 */
export abstract class MapScene extends Phaser.Scene {
  protected player!: Player;
  protected map!: Phaser.Tilemaps.Tilemap;
  private keys!: Keys;
  private transitioning = false;

  constructor(readonly mapKey: MapKey) {
    super(mapKey);
  }

  create(data: MapSceneData): void {
    this.transitioning = false;
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

    const { widthInPixels: w, heightInPixels: h } = this.map;
    this.physics.world.setBounds(0, 0, w, h);

    const spawn = this.findSpawn(data.spawn ?? 'default');
    this.player = new Player(this, spawn.x, spawn.y, data.facing ?? this.defaultFacing(data.spawn));
    this.physics.add.collider(this.player, ground);
    this.physics.add.collider(this.player, decor);

    this.createDoors();
    this.setupCamera(w, h);
    this.setupInput();

    gameState.currentMap = this.mapKey;
    gameState.spawnId = data.spawn ?? 'default';
    const payload: MapEnteredPayload = { mapKey: this.mapKey, displayName: info.displayName };
    EventBus.emit(GameEvents.MapEntered, payload);
  }

  update(): void {
    if (this.transitioning) return;
    this.player.updateMovement(this.readInput());
  }

  /** Which way the player looks after arriving. Override per map if needed. */
  protected defaultFacing(_spawn?: string): Direction {
    return 'down';
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

  private goTo(target: MapKey, spawn: string): void {
    if (this.transitioning) return;
    this.transitioning = true;
    const facing = this.player.direction;
    this.player.halt();
    this.cameras.main.fadeOut(FADE_MS, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(target, { spawn, facing } satisfies MapSceneData);
    });
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
      w: K.W, a: K.A, s: K.S, d: K.D, shift: K.SHIFT,
    }) as Keys;
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
}

function readProp(obj: Phaser.Types.Tilemaps.TiledObject, name: string): string | undefined {
  const props = obj.properties as { name: string; value: unknown }[] | undefined;
  const found = props?.find((p) => p.name === name);
  return typeof found?.value === 'string' ? found.value : undefined;
}
