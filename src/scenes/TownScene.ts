import { isShopOpen } from '../systems/ShopSystem';
import { EventBus, GameEvents, type ShopOpenRequestedPayload } from '../events/EventBus';
import { gameState } from '../state/GameState';
import { SHOPS } from '../data/shops';
import type { Direction } from '../systems/movement';
import { MapScene } from './MapScene';

export class TownScene extends MapScene {
  private shopZones: Phaser.GameObjects.Zone[] = [];

  constructor() {
    super('Town');
  }

  protected override defaultFacing(): Direction {
    return 'right';
  }

  protected override get isOutdoor(): boolean {
    return true;
  }

  protected override afterMapBuilt(): void {
    this.shopZones = this.createZonesNamed('shop_seed');
  }

  protected override tryOpenShop(): boolean {
    if (!this.isNearAnyZone(this.shopZones)) return false;
    const shop = SHOPS.seed_shop;
    if (!isShopOpen(shop, gameState.time)) {
      console.info(`${shop.name} hiện đang đóng cửa (mở ${shop.openHour}:00–${shop.closeHour}:00).`);
      return true;
    }
    const payload: ShopOpenRequestedPayload = { shopId: 'seed_shop' };
    EventBus.emit(GameEvents.ShopOpenRequested, payload);
    return true;
  }
}
