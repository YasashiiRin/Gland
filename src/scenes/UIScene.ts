import Phaser from 'phaser';
import { MS_PER_TICK, MINUTES_PER_TICK, SEASON_LABELS, WEATHER_LABELS } from '../config/time';
import { DEPTH_ABOVE } from '../config/constants';
import {
  EventBus,
  GameEvents,
  type ChestOpenRequestedPayload,
  type DayStartedPayload,
  type FishingStartedPayload,
  type MapEnteredPayload,
  type NpcInteractedPayload,
  type ShopOpenRequestedPayload,
} from '../events/EventBus';
import { NPCS, isNpcId } from '../data/npcs';
import { FISH, isFishId } from '../data/fish';
import type { ItemId } from '../data/items';
import {
  createFishingState,
  fishingOutcome,
  stepFishing,
  type FishingState,
} from '../systems/FishingSystem';
import { DialogueBox } from '../ui/DialogueBox';
import { FishingMinigame } from '../ui/FishingMinigame';
import { SettingsMenu } from '../ui/SettingsMenu';
import { playClick, playDayChime, playPickup } from '../systems/SfxSystem';
import { gameState } from '../state/GameState';
import { timeControl } from '../state/timeControl';
import { uiState } from '../state/uiState';
import { craft } from '../systems/CraftingSystem';
import { addXp, XP_REWARDS } from '../systems/SkillSystem';
import { addItem, itemAt } from '../systems/InventorySystem';
import { buyItem } from '../systems/ShopSystem';
import { advanceTime, darknessAlpha } from '../systems/TimeSystem';
import { ChestMenu } from '../ui/ChestMenu';
import { CraftingMenu } from '../ui/CraftingMenu';
import { Hotbar } from '../ui/Hotbar';
import { Hud } from '../ui/Hud';
import { InventoryMenu } from '../ui/InventoryMenu';
import { ShopMenu } from '../ui/ShopMenu';
import { isShopId } from '../data/shops';

const CHEST_SLOT_COUNT = 18;

/** Runs on top of the map scenes: draws the HUD, the night overlay, and owns the game clock. */
export class UIScene extends Phaser.Scene {
  private hud!: Hud;
  private hotbar!: Hotbar;
  private inventoryMenu!: InventoryMenu;
  private shopMenu!: ShopMenu;
  private craftingMenu!: CraftingMenu;
  private chestMenu!: ChestMenu;
  private openChestKey: string | null = null;
  private dialogueBox!: DialogueBox;
  private fishingMinigame!: FishingMinigame;
  private fishingFishId: string | null = null;
  private fishingState: FishingState | null = null;
  private fishingKey!: Phaser.Input.Keyboard.Key;
  private settingsMenu!: SettingsMenu;
  private nightOverlay!: Phaser.GameObjects.Rectangle;
  private dayBanner!: Phaser.GameObjects.Text;
  private accumulatorMs = 0;
  private inventoryKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super('UI');
  }

  create(): void {
    const { width, height } = this.scale;
    // fillAlpha is fixed at 1 (fully opaque fill color); the overlay's own
    // .alpha (set in updateNightOverlay) is what fades it in and out.
    this.nightOverlay = this.add
      .rectangle(0, 0, width, height, 0x0a1232, 1)
      .setOrigin(0, 0)
      .setDepth(DEPTH_ABOVE - 1)
      .setAlpha(0);

    this.hud = new Hud(this);
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
        const result = buyItem(gameState.inventory, gameState.money, itemId, 1);
        gameState.inventory = result.inventory;
        gameState.money = result.money;
        if (result.boughtQty > 0) playClick(gameState.settings);
      },
    );

    this.craftingMenu = new CraftingMenu(this, DEPTH_ABOVE + 1);
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

    this.dialogueBox = new DialogueBox(this, DEPTH_ABOVE + 1);
    const onNpcInteracted = (p: NpcInteractedPayload) => {
      if (!isNpcId(p.npcId)) return;
      this.dialogueBox.open(p.npcId, NPCS[p.npcId].name, p.line);
      uiState.dialogueOpen = true;
    };
    EventBus.on(GameEvents.NpcInteracted, onNpcInteracted);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => EventBus.off(GameEvents.NpcInteracted, onNpcInteracted));

    this.fishingMinigame = new FishingMinigame(this, DEPTH_ABOVE + 1);
    const onFishingStarted = (p: FishingStartedPayload) => {
      if (!isFishId(p.fishId)) return;
      this.fishingFishId = p.fishId;
      this.fishingState = createFishingState(FISH[p.fishId].difficulty);
      this.fishingMinigame.open();
      this.fishingMinigame.refresh(this.fishingState);
      uiState.fishingOpen = true;
    };
    EventBus.on(GameEvents.FishingStarted, onFishingStarted);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => EventBus.off(GameEvents.FishingStarted, onFishingStarted));

    this.settingsMenu = new SettingsMenu(this, DEPTH_ABOVE + 1);
    this.settingsMenu.bind(
      (ratio) => {
        gameState.settings.volume = ratio;
        this.settingsMenu.refresh(gameState.settings.volume, gameState.settings.muted);
      },
      () => {
        gameState.settings.muted = !gameState.settings.muted;
        this.settingsMenu.refresh(gameState.settings.volume, gameState.settings.muted);
        playClick(gameState.settings);
      },
      () => {
        if (this.scale.isFullscreen) this.scale.stopFullscreen();
        else this.scale.startFullscreen();
      },
    );

    const kb = this.input.keyboard;
    if (!kb) throw new Error('Keyboard input is not available');
    kb.addCapture(Phaser.Input.Keyboard.KeyCodes.TAB); // stop the browser from tabbing focus away
    const settingsKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
    settingsKey.on('down', () => {
      if (uiState.settingsOpen) this.closeSettings();
      else if (
        !uiState.inventoryOpen &&
        !uiState.shopOpen &&
        !uiState.craftingOpen &&
        !uiState.chestOpen &&
        !uiState.dialogueOpen &&
        !uiState.fishingOpen
      ) {
        this.settingsMenu.open(gameState.settings.volume, gameState.settings.muted);
        uiState.settingsOpen = true;
      }
    });
    this.fishingKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.inventoryKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    const craftingKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    craftingKey.on('down', () => {
      if (uiState.inventoryOpen || uiState.shopOpen || uiState.chestOpen) return;
      if (uiState.craftingOpen) this.closeCrafting();
      else {
        this.craftingMenu.open();
        uiState.craftingOpen = true;
      }
    });
    const escKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escKey.on('down', () => {
      if (uiState.settingsOpen) this.closeSettings();
      else if (uiState.dialogueOpen) this.closeDialogue();
      else if (uiState.shopOpen) this.closeShop();
      else if (uiState.craftingOpen) this.closeCrafting();
      else if (uiState.chestOpen) this.closeChest();
      else if (uiState.inventoryOpen) this.toggleInventory();
    });
    const interactKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    interactKey.on('down', () => {
      if (uiState.dialogueOpen) this.closeDialogue();
    });

    const onShopOpen = (p: ShopOpenRequestedPayload) => {
      if (!isShopId(p.shopId)) return;
      this.shopMenu.open(p.shopId);
      uiState.shopOpen = true;
    };
    EventBus.on(GameEvents.ShopOpenRequested, onShopOpen);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => EventBus.off(GameEvents.ShopOpenRequested, onShopOpen));

    const onChestOpen = (p: ChestOpenRequestedPayload) => {
      const placed = gameState.placedObjects[p.chestKey];
      if (!placed || placed.kind !== 'chest' || !placed.chest) return;
      this.openChestKey = p.chestKey;
      this.chestMenu.open(placed.chest);
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

    const onMap = (p: MapEnteredPayload) => this.hud.setLocation(p.displayName);
    const onDay = (p: DayStartedPayload) => this.showDayBanner(p);
    EventBus.on(GameEvents.MapEntered, onMap);
    EventBus.on(GameEvents.DayStarted, onDay);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off(GameEvents.MapEntered, onMap);
      EventBus.off(GameEvents.DayStarted, onDay);
    });
  }

  update(_time: number, delta: number): void {
    if (Phaser.Input.Keyboard.JustDown(this.inventoryKey)) this.toggleInventory();

    this.hotbar.refresh(gameState.inventory, gameState.equippedSlot);
    this.hud.setEnergy(gameState.energy);
    this.hud.setHealth(gameState.playerHealth);
    this.hud.setMoney(gameState.money);

    if (uiState.fishingOpen && this.fishingState && this.fishingFishId) {
      const dt = delta / 1000;
      this.fishingState = stepFishing(
        this.fishingState,
        dt,
        this.fishingKey.isDown || this.input.activePointer.leftButtonDown(),
        FISH[this.fishingFishId as keyof typeof FISH].difficulty,
      );
      this.fishingMinigame.refresh(this.fishingState);
      const outcome = fishingOutcome(this.fishingState);
      if (outcome !== 'ongoing') this.resolveFishing(outcome);
    }

    if (
      timeControl.paused ||
      uiState.inventoryOpen ||
      uiState.shopOpen ||
      uiState.craftingOpen ||
      uiState.chestOpen ||
      uiState.dialogueOpen ||
      uiState.fishingOpen ||
      uiState.settingsOpen
    ) {
      return;
    }

    this.accumulatorMs += delta;
    let ticked = false;
    while (this.accumulatorMs >= MS_PER_TICK) {
      this.accumulatorMs -= MS_PER_TICK;
      const result = advanceTime(gameState.time, MINUTES_PER_TICK);
      gameState.time = result.state;
      ticked = true;
      if (result.passedOut) {
        timeControl.paused = true;
        EventBus.emit(GameEvents.PassOutRequested);
        break;
      }
    }
    if (ticked) {
      this.hud.setTime(gameState.time);
      this.updateNightOverlay();
      EventBus.emit(GameEvents.TimeTick, { time: gameState.time });
    }
  }

  private closeShop(): void {
    this.shopMenu.close();
    uiState.shopOpen = false;
  }

  private closeCrafting(): void {
    this.craftingMenu.close();
    uiState.craftingOpen = false;
  }

  private closeChest(): void {
    this.chestMenu.close();
    uiState.chestOpen = false;
    this.openChestKey = null;
  }

  private closeDialogue(): void {
    this.dialogueBox.close();
    uiState.dialogueOpen = false;
  }

  private closeSettings(): void {
    this.settingsMenu.close();
    uiState.settingsOpen = false;
  }

  private resolveFishing(outcome: 'caught' | 'escaped'): void {
    const fishId = this.fishingFishId;
    this.fishingMinigame.close();
    uiState.fishingOpen = false;
    this.fishingState = null;
    this.fishingFishId = null;
    if (!fishId) return;

    if (outcome === 'caught') {
      gameState.inventory = addItem(gameState.inventory, fishId as ItemId, 1).state;
      gameState.skills = addXp(gameState.skills, 'fishing', XP_REWARDS.catchFish).skills;
      playPickup(gameState.settings);
      this.showBanner(`Câu được: ${FISH[fishId as keyof typeof FISH].name}!`, 0x3a5f3a);
    } else {
      this.showBanner('Cá đã chạy mất!', 0x5f3a3a);
    }
    this.hotbar.refresh(gameState.inventory, gameState.equippedSlot);
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

  /** Moves the player's currently equipped stack into an empty chest slot. */
  private depositIntoChest(slotIndex: number): void {
    if (!this.openChestKey) return;
    const placed = gameState.placedObjects[this.openChestKey];
    if (!placed?.chest) return;
    const stack = itemAt(gameState.inventory, gameState.equippedSlot);
    if (!stack) return;

    const chestSlots = placed.chest.slots.slice();
    chestSlots[slotIndex] = stack;
    placed.chest = { slots: chestSlots };

    const invSlots = gameState.inventory.slots.slice();
    invSlots[gameState.equippedSlot] = null;
    gameState.inventory = { slots: invSlots };

    this.chestMenu.refresh(placed.chest);
    this.hotbar.refresh(gameState.inventory, gameState.equippedSlot);
  }

  /** Moves a chest slot's contents into the first empty player inventory slot. */
  private withdrawFromChest(slotIndex: number): void {
    if (!this.openChestKey) return;
    const placed = gameState.placedObjects[this.openChestKey];
    if (!placed?.chest) return;
    const stack = itemAt(placed.chest, slotIndex);
    if (!stack) return;

    const { state, leftover } = addItem(gameState.inventory, stack.itemId, stack.quantity);
    if (leftover > 0 && leftover === stack.quantity) return; // inventory totally full; leave it in the chest

    gameState.inventory = state;
    const chestSlots = placed.chest.slots.slice();
    chestSlots[slotIndex] = leftover > 0 ? { itemId: stack.itemId, quantity: leftover } : null;
    placed.chest = { slots: chestSlots };

    this.chestMenu.refresh(placed.chest);
    this.hotbar.refresh(gameState.inventory, gameState.equippedSlot);
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

  private updateNightOverlay(): void {
    // The rectangle's own alpha (not fillAlpha) controls how dark the tint looks;
    // fillAlpha was only needed at creation time to pick a fill color.
    this.nightOverlay.setAlpha(darknessAlpha(gameState.time));
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
