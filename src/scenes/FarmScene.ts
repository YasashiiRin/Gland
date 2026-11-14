import Phaser from 'phaser';
import { FADE_MS, TILE } from '../config/constants';
import type { MineSceneData } from './MineScene';
import { timeControl } from '../state/timeControl';
import { TILE_GID, TILLABLE_GIDS } from '../config/tileGids';
import { cropForSeed } from '../data/crops';
import { ITEMS, type ItemId } from '../data/items';
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
import { CROP_TEXTURE, SHIPPING_BIN_TEXTURE } from './PreloadScene';
import { MapScene } from './MapScene';

const CROP_GROWING_TINT = 0x8fd98f;
const CROP_READY_TINT = 0xffe066;
const WATERED_SOIL_TINT = 0x9cc3e8;
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
    const binObj = this.map.getObjectLayer('objects')?.objects.find((o) => o.name === 'shipping_bin');
    if (binObj) {
      this.add
        .image((binObj.x ?? 0) + 10, (binObj.y ?? 0) + 10, SHIPPING_BIN_TEXTURE)
        .setDepth((binObj.y ?? 0) + 10);
    }

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
    } else {
      super.applyToolEffect(itemId, tile);
    }
  }

  protected override tryPlantFacingTile(seedItemId: ItemId): void {
    const tile = this.player.getFacingTile(TILE);
    const key = plotKey(tile.x, tile.y);
    if (!canPlant(gameState.farmPlots, key)) return;
    const cropId = cropForSeed(seedItemId);
    if (!cropId) return;

    gameState.farmPlots = plantSeed(gameState.farmPlots, key, cropId);
    gameState.inventory = removeOneFromInventory(gameState, seedItemId);
    this.spawnOrUpdateCrop(key, tile.x, tile.y, gameState.farmPlots[key]);
  }

  protected override tryHarvestFacingTile(): boolean {
    const tile = this.player.getFacingTile(TILE);
    const key = plotKey(tile.x, tile.y);
    if (!isReadyToHarvest(gameState.farmPlots[key])) return false;

    const result = harvestPlot(gameState.farmPlots, key);
    if (!result) return false;
    gameState.farmPlots = result.plots;
    gameState.inventory = addItem(gameState.inventory, result.harvestedItemId as ItemId, result.quantity).state;

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
    const tile = this.player.getFacingTile(TILE);
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
    const tile = this.player.getFacingTile(TILE);
    const key = placedObjectKey(this.mapKey, tile.x, tile.y);
    const placed = gameState.placedObjects[key];
    if (!placed || placed.kind !== 'chest') return false;
    const payload: ChestOpenRequestedPayload = { chestKey: key };
    EventBus.emit(GameEvents.ChestOpenRequested, payload);
    return true;
  }

  protected override tryUseCoop(): boolean {
    const tile = this.player.getFacingTile(TILE);
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

  private setSoilTint(x: number, y: number, watered: boolean): void {
    const tile = this.groundLayer.getTileAt(x, y);
    if (tile) tile.tint = watered ? WATERED_SOIL_TINT : DRY_SOIL_TINT;
  }

  private spawnOrUpdateCrop(key: string, x: number, y: number, plot: FarmPlot): void {
    const fraction = growthFraction(plot);
    const ready = isReadyToHarvest(plot);
    let sprite = this.cropSprites.get(key);
    if (!sprite) {
      sprite = this.add.image(x * TILE + TILE / 2, y * TILE + TILE / 2, CROP_TEXTURE);
      this.cropSprites.set(key, sprite);
    }
    sprite.setDepth(y * TILE + TILE / 2 - 1);
    const scale = 0.4 + fraction * 0.6;
    sprite.setScale(scale);
    sprite.setTint(ready ? CROP_READY_TINT : CROP_GROWING_TINT);
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
