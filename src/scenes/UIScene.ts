import Phaser from 'phaser';
import { MS_PER_TICK, MINUTES_PER_TICK, SEASON_LABELS, WEATHER_LABELS } from '../config/time';
import { DEPTH_ABOVE } from '../config/constants';
import {
  EventBus,
  GameEvents,
  type DayStartedPayload,
  type MapEnteredPayload,
  type ShopOpenRequestedPayload,
} from '../events/EventBus';
import { gameState } from '../state/GameState';
import { timeControl } from '../state/timeControl';
import { uiState } from '../state/uiState';
import { buyItem } from '../systems/ShopSystem';
import { advanceTime, darknessAlpha } from '../systems/TimeSystem';
import { Hotbar } from '../ui/Hotbar';
import { Hud } from '../ui/Hud';
import { InventoryMenu } from '../ui/InventoryMenu';
import { ShopMenu } from '../ui/ShopMenu';
import { isShopId } from '../data/shops';

/** Runs on top of the map scenes: draws the HUD, the night overlay, and owns the game clock. */
export class UIScene extends Phaser.Scene {
  private hud!: Hud;
  private hotbar!: Hotbar;
  private inventoryMenu!: InventoryMenu;
  private shopMenu!: ShopMenu;
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
    this.hud.setMoney(gameState.money);
    this.updateNightOverlay();

    this.hotbar = new Hotbar(this, DEPTH_ABOVE);
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
      },
    );

    const kb = this.input.keyboard;
    if (!kb) throw new Error('Keyboard input is not available');
    this.inventoryKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    const escKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escKey.on('down', () => {
      if (uiState.shopOpen) this.closeShop();
      else if (uiState.inventoryOpen) this.toggleInventory();
    });

    const onShopOpen = (p: ShopOpenRequestedPayload) => {
      if (!isShopId(p.shopId)) return;
      this.shopMenu.open(p.shopId);
      uiState.shopOpen = true;
    };
    EventBus.on(GameEvents.ShopOpenRequested, onShopOpen);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => EventBus.off(GameEvents.ShopOpenRequested, onShopOpen));

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
    this.hud.setMoney(gameState.money);

    if (timeControl.paused || uiState.inventoryOpen || uiState.shopOpen) return;

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
