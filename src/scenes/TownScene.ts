import Phaser from 'phaser';
import { TILE } from '../config/constants';
import { randomLine } from '../data/dialogues';
import { ITEMS, type ItemId } from '../data/items';
import { NPC_IDS, NPCS, scheduleEntryAt, type NpcId } from '../data/npcs';
import { SHOPS } from '../data/shops';
import { EventBus, GameEvents, type NpcInteractedPayload, type ShopOpenRequestedPayload } from '../events/EventBus';
import { gameState } from '../state/GameState';
import { portraitKey } from './PreloadScene';
import {
  giveGift,
  isBirthday,
  reactionFor,
  type GiftReaction,
} from '../systems/RelationshipSystem';
import { isShopOpen } from '../systems/ShopSystem';
import { absoluteDayNumber, clockMinuteOfDay } from '../systems/TimeSystem';
import type { Direction } from '../systems/movement';
import { MapScene } from './MapScene';

const REACTION_LINES: Record<GiftReaction, string> = {
  loved: 'Ồ, đây đúng là thứ mình thích nhất! Cảm ơn nhiều nhé!',
  liked: 'Cảm ơn bạn, mình thích món này đấy.',
  disliked: 'À... cảm ơn, nhưng mình không hợp món này lắm.',
  hated: 'Ơ... (có vẻ không thích món này chút nào).',
  neutral: 'Cảm ơn bạn đã tặng quà.',
};

const GIFTABLE_CATEGORIES = new Set(['crop', 'material', 'food', 'fish']);

export class TownScene extends MapScene {
  private shopZones: Phaser.GameObjects.Zone[] = [];
  private npcZones = new Map<NpcId, Phaser.GameObjects.Zone>();
  private npcSprites: Phaser.GameObjects.Image[] = [];

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

    this.npcSprites.forEach((s) => s.destroy());
    this.npcSprites = [];
    this.npcZones.clear();
    const hour = Math.floor(clockMinuteOfDay(gameState.time) / 60);
    for (const npcId of NPC_IDS) {
      const def = NPCS[npcId];
      const entry = scheduleEntryAt(def, hour);
      if (entry.mapKey !== 'Town') continue;
      const sprite = this.add.image(entry.x * TILE + TILE / 2, entry.y * TILE + TILE / 2, portraitKey(npcId));
      sprite.setDisplaySize(TILE, TILE);
      sprite.setDepth(entry.y * TILE + TILE / 2 - 1);
      this.npcSprites.push(sprite);
      const zone = this.add
        .zone(entry.x * TILE, entry.y * TILE, TILE, TILE)
        .setOrigin(0, 0);
      this.npcZones.set(npcId, zone);
    }
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

  protected override tryTalkToNpc(): boolean {
    let foundId: NpcId | null = null;
    for (const [npcId, zone] of this.npcZones) {
      if (this.isNearAnyZone([zone])) {
        foundId = npcId;
        break;
      }
    }
    if (!foundId) return false;

    const stack = gameState.inventory.slots[gameState.equippedSlot];
    const def = ITEMS[stack?.itemId as ItemId]?.category;
    const canGift = !!stack && GIFTABLE_CATEGORIES.has(def ?? '');

    if (canGift && stack) {
      const weekIndex = Math.floor((absoluteDayNumber(gameState.time) - 1) / 7);
      const birthday = isBirthday(foundId, gameState.time.season, gameState.time.day);
      const result = giveGift(gameState.relationships, foundId, stack.itemId, weekIndex, birthday);
      gameState.relationships = result.relationships;

      if (!result.capped) {
        const slots = gameState.inventory.slots.slice();
        const q = slots[gameState.equippedSlot]!.quantity;
        slots[gameState.equippedSlot] = q > 1 ? { itemId: stack.itemId, quantity: q - 1 } : null;
        gameState.inventory = { slots };
      }

      const line = result.capped
        ? 'Hôm nay bạn tặng quà cho mình đủ rồi, hẹn tuần sau nhé!'
        : REACTION_LINES[reactionFor(foundId, stack.itemId)];
      const payload: NpcInteractedPayload = { npcId: foundId, kind: 'gift', line };
      EventBus.emit(GameEvents.NpcInteracted, payload);
    } else {
      const payload: NpcInteractedPayload = { npcId: foundId, kind: 'talk', line: randomLine(foundId) };
      EventBus.emit(GameEvents.NpcInteracted, payload);
    }
    return true;
  }
}
