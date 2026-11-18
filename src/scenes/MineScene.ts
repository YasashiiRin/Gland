import { HD_TILE } from './hd';
import { swingTool } from './toolSwing';
import Phaser from 'phaser';
import { FADE_MS, TILE } from '../config/constants';
import { setupWorldCamera } from './cameraFit';
import { Player, type PlayerInput } from '../entities/Player';
import { EventBus, GameEvents, type MapEnteredPayload } from '../events/EventBus';
import { gameState } from '../state/GameState';
import { currentSpeedMultiplier } from '../state/playerStats';
import { timeControl } from '../state/timeControl';
import { isWorldInputBlocked } from '../state/uiState';
import { consumeTouchInteract, consumeTouchUse, touchInput } from '../state/touchInput';
import {
  attackMonster,
  isAdjacent,
  stepMonsterTowardPlayer,
  type Monster,
} from '../systems/CombatSystem';
import { consume, isExhausted, restoreFull } from '../systems/EnergySystem';
import { addItem } from '../systems/InventorySystem';
import { generateFloor, type MineFloor, type MineTile } from '../systems/MineSystem';
import { addXp, XP_REWARDS } from '../systems/SkillSystem';
import { playHit, playPickup } from '../systems/SfxSystem';

const MINE_TILESET = 'mine_tiles';
const TILE_GID_FOR: Record<MineTile, number> = { floor: 1, wall: 2, ore: 3, ladderDown: 6 };
const ORE_GID_FOR_KIND: Record<string, number> = { copper: 3, iron: 4, gold: 5 };
const ORE_ITEM_FOR_KIND: Record<string, 'copper_ore' | 'iron_ore' | 'gold_ore'> = {
  copper: 'copper_ore',
  iron: 'iron_ore',
  gold: 'gold_ore',
};
const MONSTER_STEP_MS = 500;
const PASS_OUT_MONEY_RATE = 0.1;
const PASS_OUT_MONEY_MAX = 1000;

export interface MineSceneData {
  depth?: number;
}

export class MineScene extends Phaser.Scene {
  private depth = 1;
  private floor!: MineFloor;
  private layer!: Phaser.Tilemaps.TilemapLayer;
  private player!: Player;
  private keys!: Record<'up' | 'down' | 'left' | 'right' | 'w' | 'a' | 's' | 'd' | 'interact' | 'attack', Phaser.Input.Keyboard.Key>;
  private monsters: { data: Monster; sprite: Phaser.GameObjects.Arc }[] = [];
  private monsterTimer = 0;
  private transitioning = false;

  constructor() {
    super('Mine');
  }

  create(data: MineSceneData): void {
    this.transitioning = false;
    timeControl.paused = true; // time doesn't pass underground
    this.depth = data.depth ?? 1;
    this.floor = generateFloor(this.depth);
    gameState.deepestFloor = Math.max(gameState.deepestFloor, this.depth);

    this.buildTilemap();
    this.spawnPlayer();
    this.spawnMonsters();
    this.setupCamera();
    this.setupInput();
    gameState.riding = null; // no vehicles underground
    // No minimap underground (floors are random); the UI shows just the floor name.
    const entered: MapEnteredPayload = { mapKey: 'Mine', displayName: `Hầm mỏ – tầng ${this.depth}` };
    EventBus.emit(GameEvents.MapEntered, entered);

    const cam = this.cameras.main;
    cam.fadeIn(FADE_MS, 0, 0, 0);
  }

  update(_time: number, delta: number): void {
    if (this.transitioning || isWorldInputBlocked()) return;

    this.player.setExhausted(isExhausted(gameState.energy));
    this.player.updateMovement(this.readInput(), currentSpeedMultiplier());

    if (Phaser.Input.Keyboard.JustDown(this.keys.interact) || consumeTouchInteract()) this.tryUseLadder();
    if (Phaser.Input.Keyboard.JustDown(this.keys.attack) || consumeTouchUse()) this.tryAttackOrMine();

    this.monsterTimer += delta;
    if (this.monsterTimer >= MONSTER_STEP_MS) {
      this.monsterTimer = 0;
      this.stepMonsters();
    }
  }

  private buildTilemap(): void {
    const data = this.floor.tiles.map((row) =>
      row.map((t) => {
        if (t === 'ore') return ORE_GID_FOR_KIND[this.floor.oreKind];
        return TILE_GID_FOR[t];
      }),
    );
    const map = this.make.tilemap({ data, tileWidth: HD_TILE, tileHeight: HD_TILE });
    const tileset = map.addTilesetImage(MINE_TILESET, MINE_TILESET, HD_TILE, HD_TILE, 0, 0, 1);
    if (!tileset) throw new Error('Mine tileset missing');
    const layer = map.createLayer(0, tileset, 0, 0);
    if (!layer) throw new Error('Could not create mine layer');
    this.layer = layer;
    layer.setDepth(-2).setScale(0.5); // HD tiles: 32 px art on a 16 px grid

    this.physics.world.setBounds(0, 0, this.floor.width * TILE, this.floor.height * TILE);
    for (let y = 0; y < this.floor.height; y++) {
      for (let x = 0; x < this.floor.width; x++) {
        const t = this.floor.tiles[y][x];
        if (t === 'wall' || t === 'ore') {
          this.layer.getTileAt(x, y)?.setCollision(true, true, true, true, false);
        }
      }
    }
    // Setting collision tile-by-tile (rather than via setCollision on a
    // whole index) leaves Arcade's internal face flags stale, which can push
    // the player sideways at corners; recompute them for the whole layer now.
    this.layer.calculateFacesWithin(0, 0, this.floor.width, this.floor.height);
  }

  private spawnPlayer(): void {
    const { x, y } = this.floor.spawn;
    this.player = new Player(this, x * TILE + TILE / 2, y * TILE + TILE / 2, 'down');
    this.physics.add.collider(this.player, this.layer);
  }

  private spawnMonsters(): void {
    this.monsters = this.floor.monsters.map((m) => {
      const sprite = this.add.circle(m.x * TILE + TILE / 2, m.y * TILE + TILE / 2, 6, 0x8a3a5a);
      sprite.setStrokeStyle(1, 0x2a201c);
      sprite.setDepth(m.y * TILE);
      return { data: { ...m }, sprite };
    });
  }

  private setupCamera(): void {
    setupWorldCamera(this, this.floor.width * TILE, this.floor.height * TILE, this.player, '#15110f');
  }

  private setupInput(): void {
    const kb = this.input.keyboard;
    if (!kb) throw new Error('Keyboard input is not available');
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = kb.addKeys({
      up: K.UP, down: K.DOWN, left: K.LEFT, right: K.RIGHT,
      w: K.W, a: K.A, s: K.S, d: K.D, interact: K.E, attack: K.SPACE,
    }) as typeof this.keys;

    // Mouse: left click attacks/mines toward the pointer, right click uses the ladder.
    this.input.mouse?.disableContextMenu();
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.transitioning || isWorldInputBlocked()) return;
      if (pointer.rightButtonDown()) {
        this.tryUseLadder();
        return;
      }
      if (!pointer.leftButtonDown()) return;
      const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      const dx = Math.floor(world.x / TILE) - Math.floor(this.player.x / TILE);
      const dy = Math.floor(world.y / TILE) - Math.floor(this.player.y / TILE);
      const step = Math.abs(dx) >= Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) };
      this.player.faceTile(
        { x: Math.floor(this.player.x / TILE) + step.x, y: Math.floor(this.player.y / TILE) + step.y },
        TILE,
      );
      this.tryAttackOrMine();
    });
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

  private facingTile(): { x: number; y: number } {
    return this.player.getFacingTile(TILE);
  }

  private tryUseLadder(): void {
    const px = Math.floor(this.player.x / TILE);
    const py = Math.floor(this.player.y / TILE);
    if (px === this.floor.ladderDown.x && py === this.floor.ladderDown.y) {
      this.goToDepth(this.depth + 1);
    } else if (px === this.floor.spawn.x && py === this.floor.spawn.y) {
      if (this.depth <= 1) this.exitToFarm();
      else this.goToDepth(this.depth - 1);
    }
  }

  private goToDepth(depth: number): void {
    if (this.transitioning) return;
    this.transitioning = true;
    this.player.halt();
    this.cameras.main.fadeOut(FADE_MS, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.restart({ depth } satisfies MineSceneData);
    });
  }

  private exitToFarm(): void {
    if (this.transitioning) return;
    this.transitioning = true;
    this.player.halt();
    this.cameras.main.fadeOut(FADE_MS, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      timeControl.paused = false;
      this.scene.start('QuangBinh', { spawn: 'fromMine', facing: 'down' });
    });
  }

  private tryAttackOrMine(): void {
    const stack = gameState.inventory.slots[gameState.equippedSlot];
    if (!stack) return;
    const tile = this.facingTile();

    if (stack.itemId === 'sword') {
      const target = this.monsters.find((m) => isAdjacent(m.data.x, m.data.y, tile.x, tile.y) || isAdjacent(m.data.x, m.data.y, Math.floor(this.player.x / TILE), Math.floor(this.player.y / TILE)));
      if (!target) return;
      const result = attackMonster(target.data, 15);
      target.data = result.monster;
      if (result.killed) {
        gameState.skills = addXp(gameState.skills, 'combat', XP_REWARDS.killMonster).skills;
        target.sprite.destroy();
        this.monsters = this.monsters.filter((m) => m !== target);
      }
      this.player.playUseToolFeedback();
      playHit(gameState.settings);
    } else if (stack.itemId === 'pickaxe') {
      if (isExhausted(gameState.energy)) return;
      const t = this.floor.tiles[tile.y]?.[tile.x];
      if (t !== 'ore') return;
      gameState.energy = consume(gameState.energy, 3);
      this.floor.tiles[tile.y][tile.x] = 'floor';
      this.layer.putTileAt(TILE_GID_FOR.floor, tile.x, tile.y);
      this.layer.getTileAt(tile.x, tile.y)?.setCollision(false, false, false, false);
      this.layer.calculateFacesWithin(
        Math.max(0, tile.x - 1),
        Math.max(0, tile.y - 1),
        3,
        3,
      );
      const itemId = ORE_ITEM_FOR_KIND[this.floor.oreKind];
      const qty = 1 + Math.floor(Math.random() * 2);
      gameState.inventory = addItem(gameState.inventory, itemId, qty).state;
      gameState.skills = addXp(gameState.skills, 'mining', XP_REWARDS.mineOre).skills;
      this.player.playUseToolFeedback();
      swingTool(this, this.player, 'pickaxe', this.player.direction);
      playPickup(gameState.settings);
    }
  }

  private stepMonsters(): void {
    const px = Math.floor(this.player.x / TILE);
    const py = Math.floor(this.player.y / TILE);
    let tookDamage = 0;
    for (const m of this.monsters) {
      if (isAdjacent(m.data.x, m.data.y, px, py)) {
        tookDamage = Math.max(tookDamage, m.data.damage);
      } else {
        m.data = stepMonsterTowardPlayer(m.data, px, py);
        m.sprite.x = m.data.x * TILE + TILE / 2;
        m.sprite.y = m.data.y * TILE + TILE / 2;
        m.sprite.setDepth(m.data.y * TILE);
      }
    }
    if (tookDamage > 0) {
      gameState.playerHealth = consume(gameState.playerHealth, tookDamage);
      if (gameState.playerHealth.current <= 0) this.passOut();
    }
  }

  private passOut(): void {
    if (this.transitioning) return;
    const penalty = Math.min(PASS_OUT_MONEY_MAX, Math.round(gameState.money * PASS_OUT_MONEY_RATE));
    gameState.money = Math.max(0, gameState.money - penalty);
    gameState.playerHealth = restoreFull(gameState.playerHealth);
    this.exitToFarm();
  }
}
