import Phaser from 'phaser';
import { FADE_MS, TILE } from '../config/constants';
import type { MineSceneData } from './MineScene';
import { timeControl } from '../state/timeControl';
import { TILE_GID, TILLABLE_GIDS } from '../config/tileGids';
import { cropForSeed } from '../data/crops';
import { ITEMS, type ItemId, type VehicleAbility } from '../data/items';
import { consume, isExhausted } from '../systems/EnergySystem';
import { gameState } from '../state/GameState';
import {
  canPlant,
  canTill,
  canWater,
  growthFraction,
  harvestPlot,
  isReadyToHarvest,
  plantSeed,
  plotKey,
  tillPlot,
  waterPlot,
  type FarmPlot,
} from '../systems/FarmingSystem';
import { feed as feedAnimal, pet as petAnimal } from '../systems/AnimalSystem';
import { addXp, XP_REWARDS } from '../systems/SkillSystem';
import { playPickup } from '../systems/SfxSystem';
import { addItem } from '../systems/InventorySystem';
import { absoluteDayNumber } from '../systems/TimeSystem';
import type { Direction } from '../systems/movement';
import {
  isOccupied,
  placedObjectKey,
  placeObject,
  type PlacedObjectKind,
} from '../systems/PlacedObjectSystem';
import { EventBus, GameEvents, type ChestOpenRequestedPayload } from '../events/EventBus';
import { iconTextureKey } from '../ui/itemIcons';
import { CROP_TEXTURE, WATER_DROPLET_TEXTURE } from './PreloadScene';
import { MapScene } from './MapScene';

/** Energy the tractor uses per tile it tills (the hand hoe costs 2). */
const TRACTOR_ENERGY_PER_TILE = 1;
const CROP_GROWING_TINT = 0x8fd98f;
const CROP_READY_TINT = 0xffe066;
/** Watered soil just looks darker and damp (multiplied tint), not blue. */
const WATERED_SOIL_TINT = 0xb4a69c;
/** Frames in a crop spritesheet: seeded, sprout, young, grown, ready. */
const CROP_FRAMES = 5;
const DRY_SOIL_TINT = 0xffffff;

export class FarmScene extends MapScene {
  private cropSprites = new Map<string, Phaser.GameObjects.Image>();
  private binZones: Phaser.GameObjects.Zone[] = [];
  private mineZones: Phaser.GameObjects.Zone[] = [];
  private furnitureSprites = new Map<string, Phaser.GameObjects.Image>();

  constructor() {
    super('Farm');
  }

  protected override defaultFacing(spawn?: string): Direction {
    return spawn === 'fromTown' ? 'left' : 'down';
  }

  protected override get isOutdoor(): boolean {
    return true;
  }

  protected override afterMapBuilt(): void {
    this.binZones = this.createZonesNamed('shipping_bin');
    this.mineZones = this.createZonesNamed('mine_entrance');

    this.dropPlacementsInvalidOnThisMap();
    this.cropSprites.forEach((sprite) => sprite.destroy());
    this.cropSprites.clear();
    for (const [key, plot] of Object.entries(gameState.farmPlots)) {
      const [x, y] = key.split(',').map(Number);
      this.groundLayer.putTileAt(TILE_GID.SOIL, x, y);
      this.setSoilTint(x, y, plot.wateredToday);
      if (plot.cropId) this.spawnOrUpdateCrop(key, x, y, plot);
    }

    this.furnitureSprites.forEach((sprite) => sprite.destroy());
    this.furnitureSprites.clear();
    const prefix = `${this.mapKey}:`;
    for (const [key, obj] of Object.entries(gameState.placedObjects)) {
      if (!key.startsWith(prefix)) continue;
      const [x, y] = key.slice(prefix.length).split(',').map(Number);
      const sprite = this.add.image(x * TILE + TILE / 2, y * TILE + TILE / 2, iconTextureKey(obj.kind as ItemId));
      sprite.setDepth(y * TILE + TILE / 2 - 1);
      this.furnitureSprites.set(key, sprite);
    }
  }

  protected override getTargetHighlightState(): 'none' | 'valid' | 'invalid' {
    const stack = gameState.inventory.slots[gameState.equippedSlot];
    if (stack) {
      const tile = this.actionTile();
      const key = plotKey(tile.x, tile.y);
      const def = ITEMS[stack.itemId];

      if (stack.itemId === 'hoe') {
        const gid = this.groundLayer.getTileAt(tile.x, tile.y)?.index;
        const blocked = !!this.decorLayer.getTileAt(tile.x, tile.y);
        const tillable = gid !== undefined && TILLABLE_GIDS.includes(gid) && !blocked && canTill(gameState.farmPlots, key);
        return tillable ? 'valid' : 'invalid';
      }
      if (stack.itemId === 'watering_can') {
        return canWater(gameState.farmPlots, key) ? 'valid' : 'invalid';
      }
      if (def.category === 'seed') {
        return canPlant(gameState.farmPlots, key) ? 'valid' : 'invalid';
      }
      if (def.category === 'furniture') {
        const objKey = placedObjectKey(this.mapKey, tile.x, tile.y);
        if (isOccupied(gameState.placedObjects, objKey) || this.decorLayer.getTileAt(tile.x, tile.y)) return 'invalid';
        const groundGid = this.groundLayer.getTileAt(tile.x, tile.y)?.index;
        const allowedGids: readonly number[] =
          stack.itemId === 'sprinkler' ? [...TILLABLE_GIDS, TILE_GID.SOIL] : TILLABLE_GIDS;
        return groundGid !== undefined && allowedGids.includes(groundGid) ? 'valid' : 'invalid';
      }
    }
    return super.getTargetHighlightState();
  }

  protected override applyToolEffect(itemId: ItemId, tile: { x: number; y: number }): void {
    const key = plotKey(tile.x, tile.y);
    if (itemId === 'hoe') {
      if (!canTill(gameState.farmPlots, key)) return;
      const gid = this.groundLayer.getTileAt(tile.x, tile.y)?.index;
      if (gid === undefined || !TILLABLE_GIDS.includes(gid)) return;
      if (this.decorLayer.getTileAt(tile.x, tile.y)) return; // something (tree/rock/bush) is in the way
      gameState.farmPlots = tillPlot(gameState.farmPlots, key);
      this.groundLayer.putTileAt(TILE_GID.SOIL, tile.x, tile.y);
      this.setSoilTint(tile.x, tile.y, false);
    } else if (itemId === 'watering_can') {
      if (!canWater(gameState.farmPlots, key)) return;
      gameState.farmPlots = waterPlot(gameState.farmPlots, key);
      this.setSoilTint(tile.x, tile.y, true);
      this.playBurstEffect(tile.x * TILE + TILE / 2, tile.y * TILE + TILE / 2 - 6, WATER_DROPLET_TEXTURE, {
        count: 6,
        speed: { min: 20, max: 50 },
        angle: { min: 250, max: 290 },
        lifespan: 350,
        gravityY: 260,
        scale: { start: 1, end: 0.6 },
      });
    } else {
      super.applyToolEffect(itemId, tile);
    }
  }

  protected override tryPlantFacingTile(seedItemId: ItemId): void {
    const tile = this.actionTile();
    const key = plotKey(tile.x, tile.y);
    if (!canPlant(gameState.farmPlots, key)) return;
    const cropId = cropForSeed(seedItemId);
    if (!cropId) return;

    gameState.farmPlots = plantSeed(gameState.farmPlots, key, cropId);
    gameState.inventory = removeOneFromInventory(gameState, seedItemId);
    this.spawnOrUpdateCrop(key, tile.x, tile.y, gameState.farmPlots[key]);
  }

  protected override tryHarvestFacingTile(): boolean {
    return this.harvestAt(this.actionTile());
  }

  /** Tractor tills grass it drives over; the harvester gathers ripe crops it drives over. */
  protected override onRideTile(tile: { x: number; y: number }, ability: VehicleAbility): void {
    if (ability === 'harvest') {
      this.harvestAt(tile);
      return;
    }
    if (ability !== 'till' || isExhausted(gameState.energy)) return;
    const key = plotKey(tile.x, tile.y);
    const before = gameState.farmPlots[key];
    const objKey = placedObjectKey(this.mapKey, tile.x, tile.y);
    if (before || isOccupied(gameState.placedObjects, objKey)) return;
    this.applyToolEffect('hoe', tile);
    if (gameState.farmPlots[key]) gameState.energy = consume(gameState.energy, TRACTOR_ENERGY_PER_TILE);
  }

  private harvestAt(tile: { x: number; y: number }): boolean {
    const key = plotKey(tile.x, tile.y);
    if (!isReadyToHarvest(gameState.farmPlots[key])) return false;

    const result = harvestPlot(gameState.farmPlots, key);
    if (!result) return false;
    gameState.farmPlots = result.plots;
    gameState.inventory = addItem(gameState.inventory, result.harvestedItemId as ItemId, result.quantity).state;
    gameState.skills = addXp(gameState.skills, 'farming', XP_REWARDS.harvestCrop).skills;
    playPickup(gameState.settings);

    const remaining = gameState.farmPlots[key];
    if (remaining?.cropId) {
      this.spawnOrUpdateCrop(key, tile.x, tile.y, remaining);
    } else {
      this.cropSprites.get(key)?.destroy();
      this.cropSprites.delete(key);
    }
    return true;
  }

  protected override tryPlaceFurniture(itemId: ItemId): void {
    if (itemId !== 'chest' && itemId !== 'scarecrow' && itemId !== 'sprinkler' && itemId !== 'chicken_coop') return;
    const tile = this.actionTile();
    const key = placedObjectKey(this.mapKey, tile.x, tile.y);
    if (isOccupied(gameState.placedObjects, key)) return;
    if (this.decorLayer.getTileAt(tile.x, tile.y)) return; // no tree/rock/bush in the way

    // A sprinkler is meant to sit on a tilled plot (so it can water it); the
    // others are just scenery and belong on plain grass.
    const groundGid = this.groundLayer.getTileAt(tile.x, tile.y)?.index;
    const allowedGids: readonly number[] =
      itemId === 'sprinkler' ? [...TILLABLE_GIDS, TILE_GID.SOIL] : TILLABLE_GIDS;
    if (groundGid === undefined || !allowedGids.includes(groundGid)) return;

    gameState.placedObjects = placeObject(gameState.placedObjects, key, itemId as PlacedObjectKind);
    gameState.inventory = removeOneFromInventory(gameState, itemId);

    const sprite = this.add.image(tile.x * TILE + TILE / 2, tile.y * TILE + TILE / 2, iconTextureKey(itemId));
    sprite.setDepth(tile.y * TILE + TILE / 2 - 1);
    this.furnitureSprites.set(key, sprite);
  }

  protected override tryOpenChest(): boolean {
    const tile = this.actionTile();
    const key = placedObjectKey(this.mapKey, tile.x, tile.y);
    const placed = gameState.placedObjects[key];
    if (!placed || placed.kind !== 'chest') return false;
    const payload: ChestOpenRequestedPayload = { chestKey: key };
    EventBus.emit(GameEvents.ChestOpenRequested, payload);
    return true;
  }

  protected override tryUseCoop(): boolean {
    const tile = this.actionTile();
    const key = placedObjectKey(this.mapKey, tile.x, tile.y);
    const placed = gameState.placedObjects[key];
    if (!placed || placed.kind !== 'chicken_coop' || !placed.animal) return false;

    const today = absoluteDayNumber(gameState.time);
    if (placed.animal.fedOnDay !== today) {
      placed.animal = feedAnimal(placed.animal, today);
      this.showFloatingText(this.player.x, this.player.y - 20, 'Đã cho gà ăn');
    } else if (placed.animal.pettedOnDay !== today) {
      placed.animal = petAnimal(placed.animal, today);
      this.showFloatingText(this.player.x, this.player.y - 20, 'Gà có vẻ vui hơn ♥');
    } else {
      this.showFloatingText(this.player.x, this.player.y - 20, 'Hôm nay đã chăm gà rồi');
    }
    return true;
  }

  protected override tryEnterMine(): boolean {
    if (!this.isNearAnyZone(this.mineZones)) return false;
    timeControl.paused = true;
    this.player.halt();
    this.cameras.main.fadeOut(FADE_MS, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('Mine', { depth: 1 } satisfies MineSceneData);
    });
    return true;
  }

  protected override tryUseShippingBin(): void {
    if (!this.isNearAnyZone(this.binZones)) return;
    const stack = gameState.inventory.slots[gameState.equippedSlot];
    if (!stack) return;
    const def = ITEMS[stack.itemId];
    if (!def.sellPrice) return;

    gameState.shippingBin[stack.itemId] = (gameState.shippingBin[stack.itemId] ?? 0) + stack.quantity;
    const slots = gameState.inventory.slots.slice();
    slots[gameState.equippedSlot] = null;
    gameState.inventory = { slots };
    console.info(`Đã gửi bán ${stack.quantity} ${def.name}`);
  }

  /**
   * Saves made before the farm map was redesigned can have plots/objects that
   * now sit on a path, pond or building. Tilled plots there are dropped and
   * placed objects (plus any chest contents) go back into the inventory.
   */
  private dropPlacementsInvalidOnThisMap(): void {
    const groundOk = (x: number, y: number, allowSoil: boolean): boolean => {
      const gid = this.groundLayer.getTileAt(x, y)?.index;
      const okGround = gid !== undefined && (TILLABLE_GIDS.includes(gid) || (allowSoil && gid === TILE_GID.SOIL));
      return okGround && !this.decorLayer.getTileAt(x, y);
    };
    const plots = { ...gameState.farmPlots };
    let changed = false;
    for (const key of Object.keys(plots)) {
      const [x, y] = key.split(',').map(Number);
      if (!groundOk(x, y, false)) {
        delete plots[key];
        changed = true;
      }
    }
    if (changed) gameState.farmPlots = plots;

    const prefix = `${this.mapKey}:`;
    for (const [key, obj] of Object.entries(gameState.placedObjects)) {
      if (!key.startsWith(prefix)) continue;
      const [x, y] = key.slice(prefix.length).split(',').map(Number);
      if (groundOk(x, y, true) || gameState.farmPlots[`${x},${y}`]) continue;
      let inventory = addItem(gameState.inventory, obj.kind as ItemId, 1).state;
      for (const stack of obj.chest?.slots ?? []) {
        if (stack) inventory = addItem(inventory, stack.itemId, stack.quantity).state;
      }
      gameState.inventory = inventory;
      const rest = { ...gameState.placedObjects };
      delete rest[key];
      gameState.placedObjects = rest;
    }
  }

  private setSoilTint(x: number, y: number, watered: boolean): void {
    const tile = this.groundLayer.getTileAt(x, y);
    if (tile) tile.tint = watered ? WATERED_SOIL_TINT : DRY_SOIL_TINT;
  }

  private spawnOrUpdateCrop(key: string, x: number, y: number, plot: FarmPlot): void {
    const fraction = growthFraction(plot);
    const ready = isReadyToHarvest(plot);
    const sheetKey = `crop_${plot.cropId ?? ''}`;
    let sprite = this.cropSprites.get(key);
    if (!sprite) {
      sprite = this.add.image(0, 0, CROP_TEXTURE);
      this.cropSprites.set(key, sprite);
    }
    sprite.setDepth(y * TILE + TILE / 2 - 1);
    if (this.textures.exists(sheetKey)) {
      // Per-crop growth art, rooted on the tile's bottom edge (tall plants overlap the tile above).
      const frame = ready ? CROP_FRAMES - 1 : Math.min(CROP_FRAMES - 2, Math.floor(fraction * (CROP_FRAMES - 1)));
      sprite.setTexture(sheetKey, frame).setOrigin(0.5, 1).setPosition(x * TILE + TILE / 2, y * TILE + TILE);
      sprite.setScale(1).clearTint();
    } else {
      // Fallback for a crop added to crops.json without its own art yet.
      sprite.setTexture(CROP_TEXTURE).setOrigin(0.5).setPosition(x * TILE + TILE / 2, y * TILE + TILE / 2);
      sprite.setScale(0.4 + fraction * 0.6);
      sprite.setTint(ready ? CROP_READY_TINT : CROP_GROWING_TINT);
    }
  }
}

function removeOneFromInventory(state: typeof gameState, seedItemId: ItemId): typeof gameState.inventory {
  const slots = state.inventory.slots.slice();
  const index = slots.findIndex((s) => s?.itemId === seedItemId);
  if (index === -1) return state.inventory;
  const stack = slots[index]!;
  slots[index] = stack.quantity > 1 ? { itemId: stack.itemId, quantity: stack.quantity - 1 } : null;
  return { slots };
}
