import Phaser from 'phaser';
import { hdScale } from './hd';
import { digsWorm } from '../systems/FishSpawnSystem';
import { FADE_MS, TILE } from '../config/constants';
import type { MineSceneData } from './MineScene';
import { timeControl } from '../state/timeControl';
import { isWaterGid, TILE_GID, TILLABLE_GIDS } from '../config/tileGids';
import { CROPS, cropForSeed } from '../data/crops';
import { formatKg, isWeighted, stackKg, stackValue } from '../systems/ProduceSystem';
import { ITEMS, type ItemId, type VehicleAbility } from '../data/items';
import { consume, isExhausted } from '../systems/EnergySystem';
import { gameState } from '../state/GameState';
import {
  canFertilize,
  canPlant,
  canWater,
  fertilizePlot,
  isInSeason,
  plotMaxKgChance,
  growthFraction,
  harvestPlot,
  isReadyToHarvest,
  plantSeed,
  sowField,
  plotGrass,
  tillPlot,
  waterPlot,
  weedPlot,
  type FarmPlot,
} from '../systems/FarmingSystem';
import { feed as feedAnimal, pet as petAnimal } from '../systems/AnimalSystem';
import { addXp, XP_REWARDS } from '../systems/SkillSystem';
import { playPickup } from '../systems/SfxSystem';
import { addItem, removeItem, withQuantity } from '../systems/InventorySystem';
import { clearEdit, digPath, hoeAction, PAVE_ITEM, pave, unpave, type HoeAction } from '../systems/GroundSystem';
import { GroundPaths } from './groundPaths';
import { absoluteDayNumber } from '../systems/TimeSystem';
import {
  isOccupied,
  placedObjectKey,
  placeObject,
  rollUpMat,
  spreadMat,
  type PlacedObjectKind,
} from '../systems/PlacedObjectSystem';
import { EventBus, GameEvents, type ChestOpenRequestedPayload } from '../events/EventBus';
import { ICON_WORLD_SCALE, iconTextureKey } from '../ui/itemIcons';
import { CROP_TEXTURE, WATER_DROPLET_TEXTURE } from './PreloadScene';
import { MapScene } from './MapScene';
import type { Station } from '../data/recipes';
import { touchedKeys, type WorldPatch } from '../net/worldPatch';
import { HOME_VEHICLE, vehicleHome, WAREHOUSE_KEY } from '../data/garage';
import { recallAll } from '../systems/VehicleSystem';
import { isSowableField, seasonStamp } from '../systems/WildFieldSystem';
import { isMine, ownerName } from '../state/owner';
import { CAN_CAPACITY, canAction, canFillFrom, pourWater, refillCan } from '../systems/WateringCanSystem';

/** Energy the tractor uses per tile it tills (the hand hoe costs 2). */
const TRACTOR_ENERGY_PER_TILE = 1;
const CROP_GROWING_TINT = 0x8fd98f;
const CROP_READY_TINT = 0xffe066;
/** Watered soil just looks darker and damp (multiplied tint), not blue. */
const WATERED_SOIL_TINT = 0xb4a69c;
/** Frames in a crop spritesheet: seeded, sprout, young, grown, ready. */
const CROP_FRAMES = 5;
const DRY_SOIL_TINT = 0xffffff;
const SAFE_ZONE_NOTE = 'Khu an toàn (phố, địa danh, nhà người khác): không được cuốc đất hay xây dựng — trong tường rơm nhà mình thì được';

/**
 * Farming on any world map (big world, phase 2): till, plant, water, harvest,
 * place chests/sprinklers/coops/benches, and use the co-operative's shipping
 * bin, warehouse and the mine entrance wherever the map has them. Plots and
 * placed objects are keyed by map ("QuangBinh:x,y"). Nothing may be tilled or
 * built inside the safe zones (landmarks and towns).
 */
export abstract class FieldScene extends MapScene {
  private cropSprites = new Map<string, Phaser.GameObjects.Image>();
  /** The dirt paths and paving the player made in the grass. */
  private paths!: GroundPaths;
  private binZones: Phaser.GameObjects.Zone[] = [];
  private mineZones: Phaser.GameObjects.Zone[] = [];
  private warehouseZones: Phaser.GameObjects.Zone[] = [];
  private furnitureSprites = new Map<string, Phaser.GameObjects.Image>();

  protected override get isOutdoor(): boolean {
    return true;
  }

  protected override afterMapBuilt(): void {
    this.binZones = this.createZonesNamed('shipping_bin');
    this.mineZones = this.createZonesNamed('mine_entrance');
    this.warehouseZones = this.createZonesNamed('warehouse', 6);

    this.dropPlacementsInvalidOnThisMap();
    this.paths = new GroundPaths(this.mapKey, this.groundLook, this.groundLayer, this.decorLayer);
    this.cropSprites.forEach((sprite) => sprite.destroy());
    this.cropSprites.clear();
    for (const [key, plot] of Object.entries(gameState.farmPlots)) {
      const at = this.tileOfKey(key);
      if (!at) continue;
      const { x, y } = at;
      this.showSoil(x, y, plot.wateredToday);
      if (plot.cropId) this.spawnOrUpdateCrop(key, x, y, plot);
      if (plotGrass(plot, this.today()) === 'faint') this.paths.setFaint(x, y, true);
    }
    this.paths.drawAll(this.today());

    this.renderPlacedObjects();
  }

  private renderPlacedObjects(): void {
    this.furnitureSprites.forEach((sprite) => sprite.destroy());
    this.furnitureSprites.clear();
    const prefix = `${this.mapKey}:`;
    for (const [key, obj] of Object.entries(gameState.placedObjects)) {
      if (!key.startsWith(prefix)) continue;
      const [x, y] = key.slice(prefix.length).split(',').map(Number);
      // A placed object uses its own sprite if one exists (e.g. the carpenter bench), else its item icon.
      const propKey = `prop_${obj.kind}`;
      const sprite = this.textures.exists(propKey)
        ? this.add.image(x * TILE + TILE / 2, y * TILE + TILE, propKey).setOrigin(0.5, 1).setScale(hdScale(this, propKey))
        : this.add.image(x * TILE + TILE / 2, y * TILE + TILE / 2, iconTextureKey(obj.kind as ItemId)).setScale(ICON_WORLD_SCALE);
      // A mat lies flat on the ground: under everyone standing or lying on it.
      sprite.setDepth(obj.kind === 'sleeping_mat' ? 0.5 : y * TILE + TILE / 2 - 1);
      this.furnitureSprites.set(key, sprite);
    }
  }

  /** Another player tilled/planted/watered/harvested or placed something: redraw those tiles. */
  protected override onWorldPatched(patch: WorldPatch): void {
    super.onWorldPatched(patch);
    for (const key of touchedKeys(patch, 'groundEdits')) {
      const at = this.tileOfKey(key);
      if (at) this.paths.redraw(at.x, at.y, this.today());
    }
    for (const key of touchedKeys(patch, 'farmPlots')) {
      const at = this.tileOfKey(key);
      if (!at) continue;
      const { x, y } = at;
      const plot = gameState.farmPlots[key];
      if (plot) {
        this.showSoil(x, y, plot.wateredToday);
      } else {
        this.groundLook.put(TILE_GID.GRASS, x, y);
      }
      if (plot?.cropId) {
        this.spawnOrUpdateCrop(key, x, y, plot);
      } else {
        this.cropSprites.get(key)?.destroy();
        this.cropSprites.delete(key);
      }
    }
    if (touchedKeys(patch, 'placedObjects').length) this.renderPlacedObjects();
  }

  protected override getTargetHighlightState(): 'none' | 'valid' | 'invalid' {
    const stack = gameState.inventory.slots[gameState.equippedSlot];
    if (stack) {
      const tile = this.actionTile();
      const key = this.plotKey(tile.x, tile.y);
      const def = ITEMS[stack.itemId];

      if (stack.itemId === 'hoe') {
        const act = this.hoeActionAt(tile, key);
        return act === 'none' || act === 'paved' ? 'invalid' : 'valid';
      }
      if (stack.itemId === PAVE_ITEM) return this.paths.edit(tile.x, tile.y)?.kind === 'path' ? 'valid' : 'invalid';
      if (stack.itemId === 'pickaxe' && this.paths.edit(tile.x, tile.y)?.kind === 'stone') return 'valid';
      if (stack.itemId === 'watering_can') {
        const act = this.canActionAt(tile);
        return act === 'water' || act === 'fill' ? 'valid' : 'invalid';
      }
      if (def.category === 'seed') {
        return canPlant(gameState.farmPlots, key) || this.isOpenField(tile) ? 'valid' : 'invalid';
      }
      if (stack.itemId === 'sleeping_mat') return this.canSpreadMat(tile) ? 'valid' : 'invalid';
      if (def.category === 'furniture') {
        const objKey = placedObjectKey(this.mapKey, tile.x, tile.y);
        if (isOccupied(gameState.placedObjects, objKey) || this.decorLayer.getTileAt(tile.x, tile.y) || this.buildBlocked(tile.x, tile.y)) return 'invalid';
        const groundGid = this.groundLayer.getTileAt(tile.x, tile.y)?.index;
        const allowedGids: readonly number[] =
          stack.itemId === 'sprinkler' ? [...TILLABLE_GIDS, TILE_GID.SOIL] : TILLABLE_GIDS;
        return groundGid !== undefined && allowedGids.includes(groundGid) ? 'valid' : 'invalid';
      }
    }
    return super.getTargetHighlightState();
  }

  protected override applyToolEffect(itemId: ItemId, tile: { x: number; y: number }): void {
    const key = this.plotKey(tile.x, tile.y);
    if ((itemId === 'hoe' || itemId === 'axe' || itemId === 'pickaxe') && this.tryRollUpMat(tile)) return;
    if (itemId === 'pickaxe' && this.paths.edit(tile.x, tile.y)?.kind === 'stone') {
      // Prise the paving up: the stone back in the bag, a bare path (grass creeps back from today).
      gameState.groundEdits = unpave(gameState.groundEdits, key, this.today()) ?? gameState.groundEdits;
      gameState.inventory = addItem(gameState.inventory, PAVE_ITEM, 1).state;
      this.paths.redraw(tile.x, tile.y, this.today());
      return;
    }
    if (itemId === 'hoe') {
      this.hoe(tile, key);
    } else if (itemId === 'watering_can') {
      this.useCan(tile);
    } else {
      super.applyToolEffect(itemId, tile);
    }
  }

  private today(): number {
    return absoluteDayNumber(gameState.time);
  }

  /** What the hoe would do here: grass -> dirt path -> plot, clearing grass growing back (GroundSystem). */
  private hoeActionAt(tile: { x: number; y: number }, key: string): HoeAction {
    const gid = this.groundLayer.getTileAt(tile.x, tile.y)?.index;
    const plot = gameState.farmPlots[key];
    const ground = gid === TILE_GID.DIRT ? 'dirt' : gid !== undefined && TILLABLE_GIDS.includes(gid) ? 'grass' : 'other';
    const blocked = !!this.decorLayer.getTileAt(tile.x, tile.y) && !this.paths.isFaint(tile.x, tile.y);
    const act = hoeAction({ edit: this.paths.edit(tile.x, tile.y), plot: plot ? { faint: plotGrass(plot, this.today()) === 'faint' } : undefined, ground, blocked }, this.today());
    return (act === 'dig' || act === 'tillDirt') && this.buildBlocked(tile.x, tile.y) ? 'none' : act;
  }

  private hoe(tile: { x: number; y: number }, key: string): void {
    const today = this.today();
    const act = this.hoeActionAt(tile, key);
    if (act === 'none' && this.buildBlocked(tile.x, tile.y) && !gameState.farmPlots[key]) return void this.say(SAFE_ZONE_NOTE);
    if (act === 'paved') return void this.say('Ô này lát đá rồi — cạy lên bằng cuốc chim.');
    if (act === 'weedPath' || act === 'dig') {
      gameState.groundEdits = digPath(gameState.groundEdits, key, today);
      this.paths.redraw(tile.x, tile.y, today);
      return;
    }
    if (act === 'weedPlot') {
      gameState.farmPlots = weedPlot(gameState.farmPlots, key, today);
      this.paths.setFaint(tile.x, tile.y, false);
      return;
    }
    if (act !== 'tillPath' && act !== 'tillDirt') return;
    gameState.groundEdits = clearEdit(gameState.groundEdits, key);
    gameState.farmPlots = tillPlot(gameState.farmPlots, key, act === 'tillPath' ? today : undefined);
    this.groundLook.put(TILE_GID.SOIL, tile.x, tile.y);
    this.setSoilTint(tile.x, tile.y, false);
    this.paths.redraw(tile.x, tile.y, today);
    if (digsWorm()) {
      gameState.inventory = addItem(gameState.inventory, 'worm', 1).state;
      this.say('Đào được 1 con giun! (mồi câu cá)');
    }
  }

  /** Holding stone: lay it on a dirt path (paving stops the grass coming back). */
  protected override tryPave(tile: { x: number; y: number }): boolean {
    const key = this.plotKey(tile.x, tile.y);
    const next = pave(gameState.groundEdits, key);
    if (!next) {
      this.say('Lát đá lên đường đất (cuốc lên cỏ để làm đường trước).');
      return true;
    }
    gameState.groundEdits = next;
    gameState.inventory = removeItem(gameState.inventory, PAVE_ITEM, 1);
    this.paths.redraw(tile.x, tile.y, this.today());
    return true;
  }

  /** What a stroke of the watering can would do on this tile (water it, fill up, or the can is empty). */
  private canActionAt(tile: { x: number; y: number }): ReturnType<typeof canAction> {
    const isWater = (x: number, y: number) => isWaterGid(this.groundLayer.getTileAt(x, y)?.index);
    const stand = { x: Math.floor(this.player.x / TILE), y: Math.floor(this.player.y / TILE) };
    const plot = canWater(gameState.farmPlots, this.plotKey(tile.x, tile.y));
    return canAction(gameState.wateringCanWater, plot, isWater(tile.x, tile.y), canFillFrom(tile, stand, isWater));
  }

  /** The watering can: waters a tilled tile (15 per can), or fills up next to water. */
  private useCan(tile: { x: number; y: number }): void {
    const act = this.canActionAt(tile);
    if (act === 'fill') {
      gameState.wateringCanWater = refillCan();
      this.say(`Đã múc đầy bình (${CAN_CAPACITY}/${CAN_CAPACITY}).`);
      return;
    }
    if (act === 'empty') {
      this.say('Bình hết nước rồi! Ra sát ao, sông, kênh để múc.');
      return;
    }
    if (act !== 'water') return;
    gameState.wateringCanWater = pourWater(gameState.wateringCanWater).water;
    this.waterAt(tile);
    if (gameState.wateringCanWater === 0) this.say('Bình vừa hết nước.');
  }

  /** The watering can or the water truck: dampens a tilled tile, with a splash. */
  private waterAt(tile: { x: number; y: number }): void {
    const key = this.plotKey(tile.x, tile.y);
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
  }

  protected override tryPlantFacingTile(seedItemId: ItemId): void {
    const tile = this.actionTile();
    const key = this.plotKey(tile.x, tile.y);
    const cropId = cropForSeed(seedItemId);
    if (!cropId) return;
    const season = gameState.time.season;
    if (this.isOpenField(tile)) {
      // A landmark's prebuilt field: sow straight onto the stubble, the crop is yours.
      gameState.farmPlots = sowField(gameState.farmPlots, key, cropId, ownerName(), season);
      this.showSoil(tile.x, tile.y, gameState.farmPlots[key].wateredToday);
    } else if (canPlant(gameState.farmPlots, key)) {
      gameState.farmPlots = plantSeed(gameState.farmPlots, key, cropId, season);
    } else return;
    gameState.inventory = removeOneFromInventory(gameState, seedItemId);
    this.spawnOrUpdateCrop(key, tile.x, tile.y, gameState.farmPlots[key]);
    if (!isInSeason(cropId, season)) this.say(`Trái mùa: ${CROPS[cropId].name.toLowerCase()} vẫn lớn nhưng không được +50% cân nặng`);
  }

  /** Fertilizer on a growing crop: counts double the watering towards full-weight produce today. */
  protected override tryFertilizeFacingTile(itemId: ItemId): void {
    const tile = this.actionTile();
    const key = this.plotKey(tile.x, tile.y);
    const plot = gameState.farmPlots[key];
    if (!plot?.cropId) return void this.say('Bón phân vào ô đang có cây');
    if (!canFertilize(gameState.farmPlots, key)) return void this.say('Ô này hôm nay bón rồi');
    gameState.farmPlots = fertilizePlot(gameState.farmPlots, key);
    gameState.inventory = removeOneFromInventory(gameState, itemId);
    const chance = Math.round(plotMaxKgChance(gameState.farmPlots[key]) * 100);
    this.say(`Đã bón phân · khả năng đạt cân tối đa: ${chance}% (+10% từ mai)`);
  }

  protected override tryHarvestFacingTile(): boolean {
    return this.harvestAt(this.actionTile());
  }

  /** A working tractor ploughs, a working harvester reaps, its whole 2x2 area. */
  protected override onVehicleWork(tiles: { x: number; y: number }[], ability: VehicleAbility): void {
    for (const tile of tiles) {
      if (ability === 'harvest') {
        this.harvestAt(tile);
        continue;
      }
      if (ability === 'water') {
        this.waterAt(tile);
        continue;
      }
      if (ability !== 'till' || isExhausted(gameState.energy)) return;
      const key = this.plotKey(tile.x, tile.y);
      if (gameState.farmPlots[key] || isOccupied(gameState.placedObjects, placedObjectKey(this.mapKey, tile.x, tile.y))) continue;
      this.applyToolEffect('hoe', tile);
      if (!gameState.farmPlots[key]) continue;
      gameState.energy = consume(gameState.energy, TRACTOR_ENERGY_PER_TILE);
      this.playBurstEffect(tile.x * TILE + TILE / 2, tile.y * TILE + TILE / 2, WATER_DROPLET_TEXTURE, {
        count: 4,
        speed: { min: 15, max: 40 },
        angle: { min: 200, max: 340 },
        lifespan: 300,
        tint: 0x7a5636,
      });
    }
  }

  private harvestAt(tile: { x: number; y: number }): boolean {
    const key = this.plotKey(tile.x, tile.y);
    if (!isReadyToHarvest(gameState.farmPlots[key])) return false;
    if (!isMine(gameState.farmPlots[key]?.owner)) {
      this.say(`Ruộng này do ${gameState.farmPlots[key]?.owner} gieo — để người ấy gặt`);
      return true;
    }

    const result = harvestPlot(gameState.farmPlots, key);
    if (!result) return false;
    gameState.farmPlots = result.plots;
    const itemId = result.harvestedItemId as ItemId;
    gameState.inventory = addItem(gameState.inventory, itemId, result.quantity, result.kg).state;
    const full = result.fullUnits > 0 ? ` · ${result.fullUnits} đạt tối đa` : '';
    this.say(`+${result.quantity} ${ITEMS[itemId].unit ?? ''} ${ITEMS[itemId].name.toLowerCase()} (${formatKg(result.kg)})${full}`);
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
    if (itemId === 'sleeping_mat') {
      this.say(this.spreadMatAt(this.actionTile()));
      return;
    }
    if (itemId !== 'chest' && itemId !== 'scarecrow' && itemId !== 'sprinkler' && itemId !== 'chicken_coop' && itemId !== 'carpenter_bench') return;
    const tile = this.actionTile();
    const key = placedObjectKey(this.mapKey, tile.x, tile.y);
    if (isOccupied(gameState.placedObjects, key)) return;
    if (this.decorLayer.getTileAt(tile.x, tile.y)) return; // no tree/rock/bush in the way
    if (this.buildBlocked(tile.x, tile.y)) {
      this.say(SAFE_ZONE_NOTE);
      return;
    }

    // A sprinkler is meant to sit on a tilled plot (so it can water it); the
    // others are just scenery and belong on plain grass.
    const groundGid = this.groundLayer.getTileAt(tile.x, tile.y)?.index;
    const allowedGids: readonly number[] =
      itemId === 'sprinkler' ? [...TILLABLE_GIDS, TILE_GID.SOIL] : TILLABLE_GIDS;
    if (groundGid === undefined || !allowedGids.includes(groundGid)) return;

    gameState.placedObjects = placeObject(gameState.placedObjects, key, itemId as PlacedObjectKind);
    gameState.inventory = removeOneFromInventory(gameState, itemId);

    this.renderPlacedObjects();
  }

  /** Rolls the sleeping mat out on `tile`: anywhere on open ground, safe zones included (it isn't building). */
  private spreadMatAt(tile: { x: number; y: number }): string | null {
    const key = placedObjectKey(this.mapKey, tile.x, tile.y);
    if (!this.canSpreadMat(tile)) return 'Không trải chiếu ở đây được (vướng đồ hoặc dưới nước)';
    gameState.placedObjects = spreadMat(gameState.placedObjects, key, ownerName());
    gameState.inventory = removeOneFromInventory(gameState, 'sleeping_mat');
    this.renderPlacedObjects();
    return 'Trải chiếu ra — đứng cạnh chiếu bấm E để ngủ';
  }

  private canSpreadMat(tile: { x: number; y: number }): boolean {
    const gid = this.groundLayer.getTileAt(tile.x, tile.y)?.index;
    return !isOccupied(gameState.placedObjects, placedObjectKey(this.mapKey, tile.x, tile.y))
      && !this.decorLayer.getTileAt(tile.x, tile.y)
      && gid !== undefined && !isWaterGid(gid);
  }

  /** A hoe, axe or pickaxe on your mat rolls it back up into your bag. True if there was a mat. */
  private tryRollUpMat(tile: { x: number; y: number }): boolean {
    const key = placedObjectKey(this.mapKey, tile.x, tile.y);
    if (gameState.placedObjects[key]?.kind !== 'sleeping_mat') return false;
    const next = rollUpMat(gameState.placedObjects, key, ownerName());
    if (!next) {
      this.say('Chiếu của người khác — để họ tự cuộn');
      return true;
    }
    const added = addItem(gameState.inventory, 'sleeping_mat', 1);
    if (added.leftover > 0) {
      this.say('Túi đồ đầy, không cất chiếu được');
      return true;
    }
    gameState.placedObjects = next;
    gameState.inventory = added.state;
    this.renderPlacedObjects();
    this.say('Cuộn chiếu lại, cất vào túi');
    return true;
  }

  /** Also counts carpenter benches the player has built and placed on the farm. */
  protected override nearestStation(): Station | null {
    const prefix = `${this.mapKey}:`;
    for (const [key, obj] of Object.entries(gameState.placedObjects)) {
      if (obj.kind !== 'carpenter_bench' || !key.startsWith(prefix)) continue;
      const [x, y] = key.slice(prefix.length).split(',').map(Number);
      if (Math.hypot(x * TILE + TILE / 2 - this.player.x, y * TILE + TILE / 2 - this.player.y) < 24) return 'carpenter';
    }
    return super.nearestStation();
  }

  protected override tryOpenChest(): boolean {
    if (this.isNearAnyZone(this.warehouseZones)) {
      // The warehouse: open its big storage and call every vehicle back to its bay.
      // The bicycle lives at home, not at the warehouse: it stays where it is.
      const homeOf = (id: string) => (id === HOME_VEHICLE ? (gameState.vehicles[id] ?? vehicleHome(id)) : vehicleHome(id));
      const { owned, recalled } = recallAll(gameState.vehicles, homeOf, gameState.riding);
      gameState.vehicles = owned;
      if (recalled > 0) this.say(`Đã gọi ${recalled} xe về nhà kho`);
      const payload: ChestOpenRequestedPayload = { chestKey: WAREHOUSE_KEY };
      EventBus.emit(GameEvents.ChestOpenRequested, payload);
      return true;
    }
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
    if (gameState.riding) this.ride.dismount();
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

    // The bin keeps what each item is worth (đồng), paid out next morning.
    const value = stackValue(stack);
    gameState.shippingBin[stack.itemId] = (gameState.shippingBin[stack.itemId] ?? 0) + value;
    const slots = gameState.inventory.slots.slice();
    slots[gameState.equippedSlot] = null;
    gameState.inventory = { slots };
    const weight = isWeighted(stack.itemId) ? ` (${formatKg(stackKg(stack))})` : '';
    this.say(`Gửi bán ${stack.quantity} ${def.name.toLowerCase()}${weight}: ${value.toLocaleString('vi-VN')} ₫ sáng mai`);
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
      const at = this.tileOfKey(key);
      if (!at) continue;
      if (!groundOk(at.x, at.y, false)) {
        delete plots[key];
        changed = true;
      }
    }
    if (changed) gameState.farmPlots = plots;

    const prefix = `${this.mapKey}:`;
    for (const [key, obj] of Object.entries(gameState.placedObjects)) {
      if (!key.startsWith(prefix)) continue;
      const [x, y] = key.slice(prefix.length).split(',').map(Number);
      if (groundOk(x, y, true) || gameState.farmPlots[this.plotKey(x, y)]) continue;
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

  /** A farm plot's key on this map. */
  private plotKey(x: number, y: number): string {
    return placedObjectKey(this.mapKey, x, y);
  }

  /** The tile of a plot/object key if it belongs to this map. */
  private tileOfKey(key: string): { x: number; y: number } | null {
    const prefix = `${this.mapKey}:`;
    if (!key.startsWith(prefix)) return null;
    const [x, y] = key.slice(prefix.length).split(',').map(Number);
    return { x, y };
  }

  /**
   * A reaped rice tile of a landmark field, not sown yet this season: seeds go
   * straight in (no hoe; the zone's fields can't be tilled by hand).
   */
  private isOpenField(tile: { x: number; y: number }): boolean {
    const key = this.plotKey(tile.x, tile.y);
    return !gameState.farmPlots[key]?.cropId
      && this.decorLayer.getTileAt(tile.x, tile.y)?.index === TILE_GID.STUBBLE
      && isSowableField(gameState.wildFields, key, seasonStamp(gameState.time));
  }

  /** Draws a plot's soil (over field stubble, which is cleared away). */
  private showSoil(x: number, y: number, watered: boolean): void {
    if (this.decorLayer.getTileAt(x, y)?.index === TILE_GID.STUBBLE) this.decorLayer.removeTileAt(x, y);
    this.groundLook.put(TILE_GID.SOIL, x, y);
    this.setSoilTint(x, y, watered);
  }

  private setSoilTint(x: number, y: number, watered: boolean): void {
    const tile = this.groundLayer.getTileAt(x, y);
    if (tile) tile.tint = watered ? WATERED_SOIL_TINT : DRY_SOIL_TINT;
    this.groundLook.sync(x, y);
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
      sprite.setScale(hdScale(this, sheetKey)).clearTint();
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
  slots[index] = withQuantity(stack, stack.quantity - 1);
  return { slots };
}
