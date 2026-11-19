import Phaser from 'phaser';
import { hdScale } from './hd';
import { TILE } from '../config/constants';
import { randomLine } from '../data/dialogues';
import { ITEMS, type ItemId } from '../data/items';
import { NPC_IDS, NPCS, scheduleEntryAt, type NpcId } from '../data/npcs';
import { isShopId, SHOPS, type ShopId } from '../data/shops';
import { readProp } from './worldSprites';
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
import { donateItem, remainingItems } from '../systems/QuestSystem';
import { FieldScene } from './FieldScene';

const REACTION_LINES: Record<GiftReaction, string> = {
  loved: 'Ồ, đây đúng là thứ mình thích nhất! Cảm ơn nhiều nhé!',
  liked: 'Cảm ơn bạn, mình thích món này đấy.',
  disliked: 'À... cảm ơn, nhưng mình không hợp món này lắm.',
  hated: 'Ơ... (có vẻ không thích món này chút nào).',
  neutral: 'Cảm ơn bạn đã tặng quà.',
};

const GIFTABLE_CATEGORIES = new Set(['crop', 'material', 'food', 'fish']);

/**
 * Village life on any world map (big world, phase 2): shop doors and market
 * stalls ("shop" objects), the quest board, and villagers standing where
 * their schedule puts them on this map. Builds on FieldScene, so a map can
 * have both.
 */
export abstract class VillageScene extends FieldScene {
  private shopZones: { zone: Phaser.GameObjects.Zone; shopId: ShopId }[] = [];
  private questZones: Phaser.GameObjects.Zone[] = [];
  private npcZones = new Map<NpcId, Phaser.GameObjects.Zone>();
  private npcSprites: Phaser.GameObjects.Image[] = [];

  protected override afterMapBuilt(): void {
    super.afterMapBuilt();
    // Each shop door is an object named "shop" with a shopId property.
    const pad = 4;
    this.shopZones = (this.map.getObjectLayer('objects')?.objects ?? []).flatMap((o) => {
      const shopId = readProp(o, 'shopId');
      if (o.name !== 'shop' || !shopId || !isShopId(shopId)) return [];
      const zone = this.add
        .zone((o.x ?? 0) - pad, (o.y ?? 0) - pad, (o.width ?? TILE) + pad * 2, (o.height ?? TILE) + pad * 2)
        .setOrigin(0, 0);
      return [{ zone, shopId }];
    });
    this.questZones = this.createZonesNamed('quest_board');

    this.npcSprites.forEach((s) => s.destroy());
    this.npcSprites = [];
    this.npcZones.clear();
    const hour = Math.floor(clockMinuteOfDay(gameState.time) / 60);
    for (const npcId of NPC_IDS) {
      const def = NPCS[npcId];
      const entry = scheduleEntryAt(def, hour);
      if (entry.mapKey !== this.mapKey) continue;
      // Walking-style villager sprite (frame 0 = standing, facing down); the
      // portrait is only a fallback if the sprite sheet is missing.
      const npcKey = `npc_${npcId}`;
      const feetY = entry.y * TILE + TILE / 2 + 4;
      const sprite = this.textures.exists(npcKey)
        ? this.add.image(entry.x * TILE + TILE / 2, feetY, npcKey, 0).setOrigin(0.5, 28 / 32).setScale(hdScale(this, npcKey))
        : this.add.image(entry.x * TILE + TILE / 2, entry.y * TILE + TILE / 2, portraitKey(npcId)).setDisplaySize(TILE, TILE);
      sprite.setDepth(feetY);
      this.npcSprites.push(sprite);
      const zone = this.add
        .zone(entry.x * TILE, entry.y * TILE, TILE, TILE)
        .setOrigin(0, 0);
      this.npcZones.set(npcId, zone);
    }
  }

  protected override tryOpenShop(): boolean {
    const near = this.shopZones.find((s) => this.isNearAnyZone([s.zone]));
    if (!near) return false;
    const shop = SHOPS[near.shopId];
    if (!isShopOpen(shop, gameState.time)) {
      this.showFloatingText(this.player.x, this.player.y - 26, `${shop.name} đang đóng cửa (${shop.openHour}:00–${shop.closeHour}:00)`);
      return true;
    }
    const payload: ShopOpenRequestedPayload = { shopId: near.shopId };
    EventBus.emit(GameEvents.ShopOpenRequested, payload);
    return true;
  }

  protected override tryUseQuestBoard(): boolean {
    if (!this.isNearAnyZone(this.questZones)) return false;

    if (gameState.communityFund.completed) {
      this.showFloatingText(this.player.x, this.player.y - 20, 'Quỹ cộng đồng đã hoàn thành. Cảm ơn bạn!');
      return true;
    }

    const stack = gameState.inventory.slots[gameState.equippedSlot];
    const result = donateItem(gameState.communityFund, gameState.inventory, (stack?.itemId ?? 'hoe') as ItemId);
    if (!result.donated) {
      const needed = remainingItems(gameState.communityFund)
        .map((id) => ITEMS[id].name)
        .join(', ');
      console.info(`Quỹ cộng đồng còn cần: ${needed}`);
      this.showFloatingText(this.player.x, this.player.y - 20, `Cần: ${needed}`);
      return true;
    }

    gameState.communityFund = result.state;
    gameState.inventory = result.inventory;
    if (gameState.communityFund.completed) {
      gameState.money += 1000;
      this.showFloatingText(this.player.x, this.player.y - 20, 'Hoàn thành! +1000 ₫');
    } else {
      const left = remainingItems(gameState.communityFund).length;
      this.showFloatingText(this.player.x, this.player.y - 20, `Đã góp! Còn cần ${left} loại`);
    }
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
    if (!foundId) return super.tryTalkToNpc(); // the village farm families (MapScene)

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
