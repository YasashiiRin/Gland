import Phaser from 'phaser';
import { TILE } from '../config/constants';
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
import { addItem } from '../systems/InventorySystem';
import type { Direction } from '../systems/movement';
import { CROP_TEXTURE, SHIPPING_BIN_TEXTURE } from './PreloadScene';
import { MapScene } from './MapScene';

const CROP_GROWING_TINT = 0x8fd98f;
const CROP_READY_TINT = 0xffe066;
const WATERED_SOIL_TINT = 0x9cc3e8;
const DRY_SOIL_TINT = 0xffffff;

export class FarmScene extends MapScene {
  private cropSprites = new Map<string, Phaser.GameObjects.Image>();
  private binZones: Phaser.GameObjects.Zone[] = [];

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
      this.applyGatheringToolEffect(itemId, tile);
    }
  }

  protected override tryPlantFacingTile(seedItemId: ItemId): void {
    const tile = this.player.getFacingTile(TILE);
    const key = plotKey(tile.x, tile.y);
    if (!canPlant(gameState.farmPlots, key)) return;
    const cropId = cropForSeed(seedItemId);
    if (!cropId) return;

    gameState.farmPlots = plantSeed(gameState.farmPlots, key, cropId);
    gameState.inventory = removeOneSeed(gameState, seedItemId);
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

function removeOneSeed(state: typeof gameState, seedItemId: ItemId): typeof gameState.inventory {
  const slots = state.inventory.slots.slice();
  const index = slots.findIndex((s) => s?.itemId === seedItemId);
  if (index === -1) return state.inventory;
  const stack = slots[index]!;
  slots[index] = stack.quantity > 1 ? { itemId: stack.itemId, quantity: stack.quantity - 1 } : null;
  return { slots };
}
