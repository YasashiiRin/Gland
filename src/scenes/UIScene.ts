import { craftingState } from '../state/craftingState';
import { sleepState } from '../state/dayCycle';
import type { Station } from '../data/recipes';
import { MarketMenu } from '../ui/MarketMenu';
import { HorrorOverlay } from '../ui/HorrorOverlay';
import type { HorrorMode } from '../systems/HorrorSystem';
import { TouchControls } from '../ui/TouchControls';
import { touchInput, wantsTouchControls, type TouchMode } from '../state/touchInput';
import { pickProfile, type LobbyPlayer, type PlayerProfile } from '../net/protocol';
import { SleepWaitOverlay } from '../ui/SleepWaitOverlay';
import { UI_FONT } from '../ui/uiStyle';
import { worldSync } from '../net/worldSync';
import { net, NetEvents } from '../net/NetSession';
import { Minimap } from '../ui/Minimap';
import { WorldMap } from '../ui/WorldMap';
import { worldView } from '../state/worldView';
import { NightLights } from '../ui/NightLights';
import { ChoiceMenu, type ChoiceRequest } from '../ui/ChoiceMenu';
import { resetHungerClock, tickHunger } from '../state/hungerClock';
import Phaser from 'phaser';
import { MS_PER_TICK, MINUTES_PER_TICK, SEASON_LABELS, WEATHER_LABELS } from '../config/time';
import { DEPTH_ABOVE } from '../config/constants';
import {
  EventBus,
  GameEvents,
  type ChestOpenRequestedPayload,
  type DayStartedPayload,
  type HorrorScreenPayload,
  type FishingStartedPayload,
  type MapEnteredPayload,
  type NpcInteractedPayload,
  type ShopOpenRequestedPayload,
} from '../events/EventBus';
import { NPCS, isNpcId } from '../data/npcs';
import { isFishId } from '../data/fish';
import { ANIMAL_ITEMS, createLivestock } from '../systems/LivestockSystem';
import type { ItemId } from '../data/items';
import { DialogueBox } from '../ui/DialogueBox';
import { FishingSession } from '../ui/FishingSession';
import { SettingsMenu } from '../ui/SettingsMenu';
import { playClick, playDayChime, playPickup } from '../systems/SfxSystem';
import { gameState, WAREHOUSE_SLOT_COUNT, ZOOM_LEVELS } from '../state/GameState';
import { PASTURE, vehicleHome, WAREHOUSE_KEY } from '../data/garage';
import { ITEMS } from '../data/items';
import { addVehicle, ownsVehicle } from '../systems/VehicleSystem';
import type { InventoryState } from '../systems/InventorySystem';
import { timeControl } from '../state/timeControl';
import { isWorldInputBlocked, uiState } from '../state/uiState';
import { craft } from '../systems/CraftingSystem';
import { addItem, itemAt } from '../systems/InventorySystem';
import { buyFromStall, buyItem, marketBuyPrice, marketSellPrice, sellToStall } from '../systems/ShopSystem';
import { advanceTime, clockMinuteOfDay, darknessAlpha } from '../systems/TimeSystem';
import { restore } from '../systems/EnergySystem';
import { daylightRegen } from '../systems/SanitySystem';
import { ChestMenu } from '../ui/ChestMenu';
import { CraftingMenu } from '../ui/CraftingMenu';
import { Hotbar } from '../ui/Hotbar';
import { Hud } from '../ui/Hud';
import { InventoryMenu } from '../ui/InventoryMenu';
import { ShopMenu } from '../ui/ShopMenu';
import { isShopId, SHOPS, type ShopId } from '../data/shops';

const CHEST_SLOT_COUNT = 18;
const VEHICLE_KEY_PREFIX = 'vehicle:';
/** Where bought animals are let loose on the farm (pixels, open grass south of the barn). */
/** Guests send their bag/energy/skills to the host this often (ms). */
const PROFILE_SEND_MS = 5000;
/** The map on screen, so a rebuilt UI (after a resize) can redraw the minimap. */
let currentMap: MapEnteredPayload | null = null;

/** Runs on top of the map scenes: draws the HUD, the night overlay, and owns the game clock. */
export class UIScene extends Phaser.Scene {
  private hud!: Hud;
  private hotbar!: Hotbar;
  private inventoryMenu!: InventoryMenu;
  private shopMenu!: ShopMenu;
  private craftingMenu!: CraftingMenu;
  private chestMenu!: ChestMenu;
  private warehouseMenu!: ChestMenu;
  private activeChestMenu!: ChestMenu;
  private readonly vehicleMenus = new Map<ItemId, ChestMenu>();
  private openChestKey: string | null = null;
  private dialogueBox!: DialogueBox;
  private fishing!: FishingSession;
  private fishingKey!: Phaser.Input.Keyboard.Key;
  private fishingPointerWasDown = true;
  private settingsMenu!: SettingsMenu;
  private nightOverlay!: Phaser.GameObjects.Rectangle;
  private nightLights!: NightLights;
  private choiceMenu!: ChoiceMenu;
  private minimap!: Minimap;
  private worldMap!: WorldMap;
  private dayBanner!: Phaser.GameObjects.Text;
  private sleepOverlay!: SleepWaitOverlay;
  private touchControls!: TouchControls;
  private marketMenu!: MarketMenu;
  private marketShopId: ShopId = 'market_veg';
  private horrorOverlay!: HorrorOverlay;
  private toastText!: Phaser.GameObjects.Text;
  private lastProfileSent = 0;
  private knownPlayers = new Map<string, string>();
  private accumulatorMs = 0;
  private inventoryKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super('UI');
  }

  create(): void {
    resetHungerClock(); // a new game, a loaded save or a resize: count hunger from now
    this.vehicleMenus.clear(); // menus from a previous run were destroyed with the scene
    const { width, height } = this.scale;
    // fillAlpha is fixed at 1 (fully opaque fill color); the overlay's own
    // .alpha (set in updateNightOverlay) is what fades it in and out.
    this.nightOverlay = this.add
      .rectangle(0, 0, width, height, 0x0a1232, 1)
      .setOrigin(0, 0)
      .setDepth(DEPTH_ABOVE - 1)
      .setAlpha(0);
    this.nightLights = new NightLights(this, DEPTH_ABOVE - 0.5);
    this.choiceMenu = new ChoiceMenu(this, DEPTH_ABOVE + 3);
    this.choiceMenu.onPick = (id) => EventBus.emit(GameEvents.ChoiceMade, { id });
    const onChoice = (req: ChoiceRequest) => this.choiceMenu.open(req);
    EventBus.on(GameEvents.ChoiceRequested, onChoice);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off(GameEvents.ChoiceRequested, onChoice);
      this.choiceMenu.close();
    });

    this.hud = new Hud(this, DEPTH_ABOVE);
    this.minimap = new Minimap(this, DEPTH_ABOVE);
    this.worldMap = new WorldMap(this, DEPTH_ABOVE + 2);
    this.minimap.onClick = () => this.openWorldMap();
    this.worldMap.onClosed = () => (uiState.worldMapOpen = false);
    this.hud.setTime(gameState.time);
    this.hud.setEnergy(gameState.energy);
    this.hud.setHealth(gameState.playerHealth);
    this.hud.setMoney(gameState.money);
    this.updateNightOverlay();

    this.hotbar = new Hotbar(this, DEPTH_ABOVE);
    this.hotbar.onSelect = (slot) => {
      gameState.equippedSlot = slot;
    };
    this.hotbar.refresh(gameState.inventory, gameState.equippedSlot);

    this.inventoryMenu = new InventoryMenu(this, DEPTH_ABOVE + 1);
    this.inventoryMenu.bind(
      () => gameState.inventory,
      (next) => {
        gameState.inventory = next;
        this.inventoryMenu.refresh(next);
        this.hotbar.refresh(gameState.inventory, gameState.equippedSlot);
      },
    );

    this.shopMenu = new ShopMenu(this, DEPTH_ABOVE + 1);
    this.shopMenu.bind(
      () => gameState.money,
      (itemId) => {
        if (ITEMS[itemId].category === 'vehicle') {
          // Vehicles aren't carried: a bought one is delivered to the farm warehouse.
          const price = ITEMS[itemId].sellPrice ?? 0;
          if (ownsVehicle(gameState.vehicles, itemId) || gameState.money < price) return;
          gameState.money -= price;
          gameState.vehicles = addVehicle(gameState.vehicles, itemId, vehicleHome(itemId));
          playClick(gameState.settings);
          return;
        }
        const kind = ANIMAL_ITEMS[itemId];
        if (kind) {
          // Animals aren't carried: a bought one is let loose in the farm's pasture.
          const price = ITEMS[itemId].sellPrice ?? 0;
          if (gameState.money < price) return;
          gameState.money -= price;
          const id = `${kind}-${Date.now().toString(36)}`;
          const x = PASTURE.x + Math.round((Math.random() - 0.5) * 48);
          const y = PASTURE.y + Math.round((Math.random() - 0.5) * 32);
          gameState.livestock = [...gameState.livestock, createLivestock(id, kind, PASTURE.mapKey, x, y)];
          playClick(gameState.settings);
          this.showBanner(`${ITEMS[itemId].name} đã được thả ở bãi cỏ hợp tác xã (Đồng Hới)`, 0x3a5f3a);
          return;
        }
        const result = buyItem(gameState.inventory, gameState.money, itemId, 1);
        gameState.inventory = result.inventory;
        gameState.money = result.money;
        if (result.boughtQty > 0) playClick(gameState.settings);
      },
    );

    this.craftingMenu = new CraftingMenu(this, DEPTH_ABOVE + 1);
    this.craftingMenu.onClosed = () => {
      uiState.craftingOpen = false;
    };
    const onCraftOpen = (p: { station: Station }) => this.openCrafting(p.station);
    EventBus.on(GameEvents.CraftingOpenRequested, onCraftOpen);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => EventBus.off(GameEvents.CraftingOpenRequested, onCraftOpen));
    this.craftingMenu.bind(
      () => gameState.inventory,
      (recipeId) => {
        const result = craft(gameState.inventory, recipeId);
        gameState.inventory = result.inventory;
        if (result.crafted) playClick(gameState.settings);
        this.craftingMenu.refresh();
        this.hotbar.refresh(gameState.inventory, gameState.equippedSlot);
      },
    );

    this.chestMenu = new ChestMenu(this, DEPTH_ABOVE + 1, CHEST_SLOT_COUNT);
    this.chestMenu.bind(
      (slotIndex) => this.depositIntoChest(slotIndex),
      (slotIndex) => this.withdrawFromChest(slotIndex),
    );
    this.warehouseMenu = new ChestMenu(this, DEPTH_ABOVE + 1, WAREHOUSE_SLOT_COUNT, 'Nhà kho');
    this.warehouseMenu.bind(
      (slotIndex) => this.depositIntoChest(slotIndex),
      (slotIndex) => this.withdrawFromChest(slotIndex),
    );
    this.activeChestMenu = this.chestMenu;

    this.dialogueBox = new DialogueBox(this, DEPTH_ABOVE + 1);
    const onNpcInteracted = (p: NpcInteractedPayload) => {
      if (!isNpcId(p.npcId)) return;
      this.dialogueBox.open(p.npcId, NPCS[p.npcId].name, p.line);
      uiState.dialogueOpen = true;
    };
    EventBus.on(GameEvents.NpcInteracted, onNpcInteracted);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => EventBus.off(GameEvents.NpcInteracted, onNpcInteracted));

    this.fishing = new FishingSession(this, DEPTH_ABOVE + 1, (text, color) => this.showBanner(text, color));
    const onFishingStarted = (p: FishingStartedPayload) => {
      if (isFishId(p.fishId)) this.fishing.start(p.fishId);
    };
    EventBus.on(GameEvents.FishingStarted, onFishingStarted);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => EventBus.off(GameEvents.FishingStarted, onFishingStarted));

    this.settingsMenu = new SettingsMenu(this, DEPTH_ABOVE + 1);
    this.settingsMenu.bind({
      onVolumeChange: (ratio) => {
        gameState.settings.volume = ratio;
        this.settingsMenu.refresh(gameState.settings);
      },
      onToggleMute: () => {
        gameState.settings.muted = !gameState.settings.muted;
        this.settingsMenu.refresh(gameState.settings);
        playClick(gameState.settings);
      },
      onToggleFullscreen: () => {
        if (this.scale.isFullscreen) this.scale.stopFullscreen();
        else this.scale.startFullscreen();
      },
      onZoomStep: (direction) => {
        const i = ZOOM_LEVELS.indexOf(gameState.settings.zoom);
        const next = ZOOM_LEVELS[Phaser.Math.Clamp((i === -1 ? 1 : i) + direction, 0, ZOOM_LEVELS.length - 1)];
        gameState.settings.zoom = next;
        this.settingsMenu.refresh(gameState.settings);
        EventBus.emit(GameEvents.ZoomChanged);
      },
      onClose: () => this.closeSettings(),
      onHorrorCycle: () => {
        const order: HorrorMode[] = ['on', 'mild', 'off'];
        gameState.settings.horror = order[(order.indexOf(gameState.settings.horror) + 1) % order.length];
        this.settingsMenu.refresh(gameState.settings);
      },
      onTouchCycle: () => {
        const order: TouchMode[] = ['auto', 'on', 'off'];
        gameState.settings.touch = order[(order.indexOf(gameState.settings.touch) + 1) % order.length];
        this.settingsMenu.refresh(gameState.settings);
      },
    });
    this.hud.onSettings = () => this.toggleSettings();

    const onHostTime = (time: typeof gameState.time) => {
      this.regenSanity(time.elapsedMinutes - gameState.time.elapsedMinutes);
      gameState.time = time;
      this.hud.setTime(time);
      this.updateNightOverlay();
      EventBus.emit(GameEvents.TimeTick, { time });
    };
    const onLostHost = () => {
      for (const s of this.scene.manager.getScenes(true)) if (s.scene.key !== 'UI') s.scene.stop();
      this.scene.start('Title', { message: 'Mất kết nối với chủ phòng.' });
    };
    net.events.on(NetEvents.Time, onHostTime);
    net.events.on(NetEvents.Disconnected, onLostHost);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      net.events.off(NetEvents.Time, onHostTime);
      net.events.off(NetEvents.Disconnected, onLostHost);
    });

    const kb = this.input.keyboard;
    if (!kb) throw new Error('Keyboard input is not available');
    kb.addCapture(Phaser.Input.Keyboard.KeyCodes.TAB); // stop the browser from tabbing focus away
    const settingsKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
    settingsKey.on('down', () => this.toggleSettings());
    this.fishingKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.inventoryKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    kb.addKey(Phaser.Input.Keyboard.KeyCodes.M).on('down', () => this.minimap.toggle());
    const craftingKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    craftingKey.on('down', () => this.toggleCrafting());
    const escKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escKey.on('down', () => this.closeTopMenu());
    const interactKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    interactKey.on('down', () => {
      if (uiState.dialogueOpen) this.closeDialogue();
    });

    this.marketMenu = new MarketMenu(this, DEPTH_ABOVE + 1);
    this.marketMenu.onClosed = () => {
      uiState.shopOpen = this.shopMenu.isOpen;
    };
    this.marketMenu.bind({
      getMoney: () => gameState.money,
      getInventory: () => gameState.inventory,
      buy: (itemId) => {
        const shop = SHOPS[this.marketShopId];
        const r = buyFromStall(gameState.inventory, gameState.money, shop, itemId);
        if (!r.bought) return gameState.money < marketSellPrice(shop, itemId) ? 'Thiếu tiền rồi con ơi.' : 'Túi con đầy rồi kìa.';
        gameState.inventory = r.inventory;
        gameState.money = r.money;
        playClick(gameState.settings);
        return Phaser.Utils.Array.GetRandom(['Cảm ơn con nha!', 'Ăn ngon thì ghé nữa nghen!', 'Bán mở hàng cho cô may mắn nè!']);
      },
      sell: (itemId, all) => {
        const shop = SHOPS[this.marketShopId];
        const r = sellToStall(gameState.inventory, gameState.money, shop, itemId, all ? 999 : 1);
        if (!r.soldQty) return 'Món này sạp không mua con ơi.';
        gameState.inventory = r.inventory;
        gameState.money = r.money;
        playPickup(gameState.settings);
        return `Lấy ${r.soldQty} ${ITEMS[itemId].name.toLowerCase()}, gửi con ${(r.soldQty * marketBuyPrice(shop, itemId)).toLocaleString('vi-VN')} ₫ nè.`;
      },
    });
    const onShopOpen = (p: ShopOpenRequestedPayload) => {
      if (!isShopId(p.shopId)) return;
      if (SHOPS[p.shopId].kind === 'market') {
        this.marketShopId = p.shopId;
        this.marketMenu.open(p.shopId);
      } else {
        this.shopMenu.open(p.shopId);
      }
      uiState.shopOpen = true;
    };
    EventBus.on(GameEvents.ShopOpenRequested, onShopOpen);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => EventBus.off(GameEvents.ShopOpenRequested, onShopOpen));

    const onChestOpen = (p: ChestOpenRequestedPayload) => {
      const storage = this.storageFor(p.chestKey);
      if (!storage) return;
      this.openChestKey = p.chestKey;
      this.activeChestMenu = this.menuForStorage(p.chestKey, storage.slots.length);
      this.activeChestMenu.open(storage);
      uiState.chestOpen = true;
    };
    EventBus.on(GameEvents.ChestOpenRequested, onChestOpen);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => EventBus.off(GameEvents.ChestOpenRequested, onChestOpen));

    this.dayBanner = this.add
      .text(width / 2, 70, '', {
        fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
        fontSize: '20px',
        color: '#fff6e0',
        backgroundColor: '#3a2f24',
        padding: { x: 16, y: 10 },
      })
      .setOrigin(0.5, 0)
      .setDepth(DEPTH_ABOVE)
      .setAlpha(0);

    const onMap = (p: MapEnteredPayload) => {
      currentMap = p;
      this.hud.setLocation(p.displayName);
      this.minimap.setMap(p.minimap, p.displayName);
    };
    this.setupMultiplayerUi();
    this.horrorOverlay = new HorrorOverlay(this, DEPTH_ABOVE - 0.5);
    this.horrorOverlay.onClockGlitch = () => this.hud.glitchClock();
    const onHorror = (p: HorrorScreenPayload) => this.horrorOverlay.handle(p);
    EventBus.on(GameEvents.HorrorScreen, onHorror);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => EventBus.off(GameEvents.HorrorScreen, onHorror));
    this.touchControls = new TouchControls(this, DEPTH_ABOVE + 1, {
      onInventory: () => this.toggleInventory(),
      onCrafting: () => this.toggleCrafting(),
      onClose: () => this.closeTopMenu(),
    });
    const onDay = (p: DayStartedPayload) => {
      this.leaveSleepWait(false);
      this.showDayBanner(p);
    };
    EventBus.on(GameEvents.MapEntered, onMap);
    EventBus.on(GameEvents.DayStarted, onDay);
    if (currentMap) onMap(currentMap);
    if (uiState.sleepWait) this.sleepOverlay.show(net.sleepers.size, net.players.length);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off(GameEvents.MapEntered, onMap);
      EventBus.off(GameEvents.DayStarted, onDay);
    });
  }

  update(time: number, delta: number): void {
    worldSync.update(time); // multiplayer: exchange changes to the shared farm
    this.updateTouchControls();
    this.worldMap.update();
    this.horrorOverlay.update(time, !uiState.sleepWait);
    if (net.role === 'guest' && time - this.lastProfileSent > PROFILE_SEND_MS) {
      // Let the host keep my bag/energy/skills in its save.
      this.lastProfileSent = time;
      net.sendProfile(pickProfile(gameState));
    }
    if (Phaser.Input.Keyboard.JustDown(this.inventoryKey)) this.toggleInventory();

    this.hotbar.refresh(gameState.inventory, gameState.equippedSlot);
    this.hud.setEnergy(gameState.energy);
    this.hud.setHealth(gameState.playerHealth);
    this.hud.setSanity(gameState.sanity);
    tickHunger();
    this.hud.setHunger(gameState.hunger);
    this.hud.setMoney(gameState.money);
    this.minimap.setPlayerTile(worldView.playerTileX, worldView.playerTileY);
    this.nightLights.update(time);

    if (this.fishing.active) {
      const pointer = this.input.manager.pointers.some((p) => p.isDown);
      const pressed = Phaser.Input.Keyboard.JustDown(this.fishingKey) || (pointer && !this.fishingPointerWasDown);
      this.fishingPointerWasDown = pointer;
      this.fishing.update(time, delta / 1000, this.fishingKey.isDown || pointer, pressed);
    }

    if (
      timeControl.paused ||
      uiState.inventoryOpen ||
      uiState.shopOpen ||
      uiState.craftingOpen ||
      uiState.chestOpen ||
      uiState.dialogueOpen ||
      uiState.fishingOpen ||
      uiState.settingsOpen ||
      uiState.worldMapOpen
    ) {
      return;
    }

    // In a room the host's clock is the only clock; guests just display it.
    if (net.role === 'guest') return;
    this.accumulatorMs += delta;
    let ticked = false;
    while (this.accumulatorMs >= MS_PER_TICK) {
      this.accumulatorMs -= MS_PER_TICK;
      const result = advanceTime(gameState.time, MINUTES_PER_TICK);
      gameState.time = result.state;
      this.regenSanity(MINUTES_PER_TICK);
      ticked = true;
      if (result.dawn) {
        timeControl.paused = true;
        EventBus.emit(GameEvents.DawnReached);
        break;
      }
    }
    if (ticked) {
      this.hud.setTime(gameState.time);
      this.updateNightOverlay();
      EventBus.emit(GameEvents.TimeTick, { time: gameState.time });
      if (net.role === 'host') net.broadcastTime(gameState.time);
    }
  }

  private closeShop(): void {
    if (this.marketMenu.isOpen) this.marketMenu.close();
    this.shopMenu.close();
    uiState.shopOpen = false;
  }

  private closeCrafting(): void {
    this.craftingMenu.close();
    uiState.craftingOpen = false;
  }

  /** One storage grid per kind of container (sizes differ), created on first use. */
  private menuForStorage(key: string, slotCount: number): ChestMenu {
    if (key === WAREHOUSE_KEY) return this.warehouseMenu;
    if (!key.startsWith(VEHICLE_KEY_PREFIX)) return this.chestMenu;
    const id = key.slice(VEHICLE_KEY_PREFIX.length) as ItemId;
    let menu = this.vehicleMenus.get(id);
    if (!menu) {
      menu = new ChestMenu(this, DEPTH_ABOVE + 1, slotCount, ITEMS[id].name);
      menu.bind(
        (slotIndex) => this.depositIntoChest(slotIndex),
        (slotIndex) => this.withdrawFromChest(slotIndex),
      );
      this.vehicleMenus.set(id, menu);
    }
    return menu;
  }

  /** The storage behind a chest key: a placed chest, the farm warehouse, or a vehicle's cargo bed. */
  private storageFor(key: string): InventoryState | null {
    if (key === WAREHOUSE_KEY) return gameState.warehouse;
    if (key.startsWith(VEHICLE_KEY_PREFIX)) {
      const id = key.slice(VEHICLE_KEY_PREFIX.length) as ItemId;
      const size = ITEMS[id]?.vehicle?.storageSlots ?? 0;
      if (!size) return null;
      return gameState.vehicleStorage[id] ?? { slots: Array.from({ length: size }, () => null) };
    }
    const placed = gameState.placedObjects[key];
    return placed?.kind === 'chest' && placed.chest ? placed.chest : null;
  }

  private setStorage(key: string, storage: InventoryState): void {
    if (key === WAREHOUSE_KEY) gameState.warehouse = storage;
    else if (key.startsWith(VEHICLE_KEY_PREFIX)) {
      gameState.vehicleStorage = { ...gameState.vehicleStorage, [key.slice(VEHICLE_KEY_PREFIX.length)]: storage };
    } else {
      const placed = gameState.placedObjects[key];
      if (placed) placed.chest = storage;
    }
  }

  private closeChest(): void {
    this.activeChestMenu.close();
    uiState.chestOpen = false;
    this.openChestKey = null;
  }

  private closeDialogue(): void {
    this.dialogueBox.close();
    uiState.dialogueOpen = false;
  }

  private toggleSettings(): void {
    if (uiState.settingsOpen) {
      this.closeSettings();
      return;
    }
    if (isWorldInputBlocked()) return; // another menu is open
    this.settingsMenu.open(gameState.settings);
    uiState.settingsOpen = true;
  }

  /** Click on the minimap: the whole world, centred on where you stand. */
  private openWorldMap(): void {
    if (isWorldInputBlocked()) return;
    uiState.worldMapOpen = true;
    this.worldMap.open(currentMap?.mapKey ?? gameState.currentMap, worldView.playerTileX, worldView.playerTileY);
  }

  private closeSettings(): void {
    this.settingsMenu.close();
    uiState.settingsOpen = false;
  }

  private showBanner(text: string, color: number): void {
    const { width } = this.scale;
    const bg = this.add.rectangle(width / 2, 140, 10, 36, color, 0.92).setStrokeStyle(2, 0xffffff).setDepth(DEPTH_ABOVE + 2);
    const label = this.add
      .text(width / 2, 140, text, { fontFamily: 'sans-serif', fontSize: '16px', color: '#fff6e0' })
      .setOrigin(0.5)
      .setDepth(DEPTH_ABOVE + 2);
    bg.setSize(label.width + 32, 36);
    this.tweens.add({
      targets: [bg, label],
      alpha: 0,
      delay: 1800,
      duration: 500,
      onComplete: () => {
        bg.destroy();
        label.destroy();
      },
    });
  }

  /** Moves the player's currently equipped stack into an empty chest/warehouse slot. */
  private depositIntoChest(slotIndex: number): void {
    const key = this.openChestKey;
    const storage = key ? this.storageFor(key) : null;
    if (!key || !storage) return;
    const stack = itemAt(gameState.inventory, gameState.equippedSlot);
    if (!stack) return;

    const slots = storage.slots.slice();
    slots[slotIndex] = stack;
    this.setStorage(key, { slots });

    const invSlots = gameState.inventory.slots.slice();
    invSlots[gameState.equippedSlot] = null;
    gameState.inventory = { slots: invSlots };

    this.activeChestMenu.refresh({ slots });
    this.hotbar.refresh(gameState.inventory, gameState.equippedSlot);
  }

  private withdrawFromChest(slotIndex: number): void {
    const key = this.openChestKey;
    const storage = key ? this.storageFor(key) : null;
    if (!key || !storage) return;
    const stack = itemAt(storage, slotIndex);
    if (!stack) return;

    const { state, leftover } = addItem(gameState.inventory, stack.itemId, stack.quantity);
    if (leftover > 0 && leftover === stack.quantity) return; // inventory totally full; leave it in storage

    gameState.inventory = state;
    const slots = storage.slots.slice();
    slots[slotIndex] = leftover > 0 ? { itemId: stack.itemId, quantity: leftover } : null;
    this.setStorage(key, { slots });

    this.activeChestMenu.refresh({ slots });
    this.hotbar.refresh(gameState.inventory, gameState.equippedSlot);
  }


  /** Phone controls: shown when wanted, swapped for a close button while a menu is open. */
  private updateTouchControls(): void {
    const on = wantsTouchControls(gameState.settings.touch);
    touchInput.enabled = on;
    const menuOpen =
      uiState.inventoryOpen ||
      uiState.shopOpen ||
      uiState.craftingOpen ||
      uiState.chestOpen ||
      uiState.dialogueOpen ||
      uiState.settingsOpen ||
      uiState.worldMapOpen;
    this.touchControls.update(on, menuOpen);
  }

  /** C key / touch button: crafting only works standing at a bench. */
  private toggleCrafting(): void {
    if (uiState.inventoryOpen || uiState.shopOpen || uiState.chestOpen) return;
    if (uiState.craftingOpen) this.closeCrafting();
    else if (craftingState.nearStation) this.openCrafting(craftingState.nearStation);
    else this.toast('Hãy đứng cạnh bàn chế tác (ở sân trước nhà) để chế tạo');
  }

  private openCrafting(station: Station): void {
    if (isWorldInputBlocked()) return;
    this.craftingMenu.open(station);
    uiState.craftingOpen = true;
  }

  /** Esc (or the on-screen close button): closes whichever menu is on top. */
  private closeTopMenu(): void {
    if (this.choiceMenu.isOpen) this.choiceMenu.close();
    else if (uiState.worldMapOpen) this.worldMap.close();
    else if (uiState.settingsOpen) this.closeSettings();
    else if (uiState.dialogueOpen) this.closeDialogue();
    else if (uiState.shopOpen) this.closeShop();
    else if (uiState.craftingOpen) this.closeCrafting();
    else if (uiState.chestOpen) this.closeChest();
    else if (uiState.inventoryOpen) this.toggleInventory();
  }

  private toggleInventory(): void {
    if (uiState.inventoryOpen) {
      this.inventoryMenu.close();
      uiState.inventoryOpen = false;
    } else {
      this.inventoryMenu.open(gameState.inventory);
      uiState.inventoryOpen = true;
    }
  }

  /** Daylight (6:00–18:00) slowly steadies your nerves. */
  private regenSanity(minutes: number): void {
    if (minutes <= 0 || clockMinuteOfDay(gameState.time) >= 18 * 60 || clockMinuteOfDay(gameState.time) < 6 * 60) return;
    gameState.sanity = restore(gameState.sanity, daylightRegen(minutes));
  }

  private updateNightOverlay(): void {
    // The rectangle's own alpha (not fillAlpha) controls how dark the tint looks;
    // fillAlpha was only needed at creation time to pick a fill color.
    this.nightOverlay.setAlpha(darknessAlpha(gameState.time));
  }

  /** Sleeping together, join/leave notices, and storing guests' profiles (host). */
  private setupMultiplayerUi(): void {
    this.sleepOverlay = new SleepWaitOverlay(this, DEPTH_ABOVE + 2);
    this.sleepOverlay.onWakeUp = () => this.leaveSleepWait(true);
    this.toastText = this.add
      .text(this.scale.width / 2, 40, '', { fontFamily: UI_FONT, fontSize: '14px', color: '#fff6e0', backgroundColor: '#2b1a10dd' })
      .setPadding(8, 4, 8, 4)
      .setOrigin(0.5)
      .setDepth(DEPTH_ABOVE + 3)
      .setAlpha(0);
    this.knownPlayers = new Map(net.players.map((p) => [p.id, p.name]));

    const onSleepWait = () => {
      uiState.sleepWait = true;
      if (sleepState.bedElapsed === null) sleepState.bedElapsed = gameState.time.elapsedMinutes;
      net.setSleepReady(true);
      this.sleepOverlay.show(net.sleepers.size, net.players.length);
    };
    const onSleepers = () => {
      if (this.sleepOverlay.visible) this.sleepOverlay.show(net.sleepers.size, net.players.length);
    };
    const onLobby = (players: LobbyPlayer[]) => {
      const now = new Map(players.map((p) => [p.id, p.name]));
      for (const [id, name] of now) if (!this.knownPlayers.has(id)) this.toast(`${name} đã vào nông trại`);
      for (const [id, name] of this.knownPlayers) if (!now.has(id)) this.toast(`${name} đã rời phòng`);
      this.knownPlayers = now;
      onSleepers();
    };
    const onProfile = (p: { name: string; profile: PlayerProfile }) => {
      gameState.guestProfiles = { ...gameState.guestProfiles, [p.name]: p.profile };
    };
    EventBus.on(GameEvents.SleepWaitRequested, onSleepWait);
    net.events.on(NetEvents.Sleepers, onSleepers);
    net.events.on(NetEvents.Lobby, onLobby);
    net.events.on(NetEvents.Profile, onProfile);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off(GameEvents.SleepWaitRequested, onSleepWait);
      net.events.off(NetEvents.Sleepers, onSleepers);
      net.events.off(NetEvents.Lobby, onLobby);
      net.events.off(NetEvents.Profile, onProfile);
    });
  }

  private leaveSleepWait(tellOthers: boolean): void {
    if (!uiState.sleepWait) return;
    uiState.sleepWait = false;
    this.sleepOverlay.hide();
    if (tellOthers) {
      net.setSleepReady(false);
      sleepState.bedElapsed = null; // got up again
    }
  }

  private toast(text: string): void {
    this.toastText.setText(text).setAlpha(1);
    this.tweens.killTweensOf(this.toastText);
    this.tweens.add({ targets: this.toastText, alpha: 0, delay: 2500, duration: 500 });
  }

  private showDayBanner(p: DayStartedPayload): void {
    playDayChime(gameState.settings);
    const earningsLine = p.earnings > 0 ? `\nHôm qua bạn kiếm được ${p.earnings.toLocaleString('vi-VN')} ₫` : '';
    const text = `Ngày ${p.day}, mùa ${SEASON_LABELS[p.season]} — Thời tiết: ${WEATHER_LABELS[p.weather]}${earningsLine}`;
    this.dayBanner.setText(text);
    this.dayBanner.setAlpha(1);
    this.tweens.add({
      targets: this.dayBanner,
      alpha: 0,
      delay: 2800,
      duration: 600,
    });
  }
}
