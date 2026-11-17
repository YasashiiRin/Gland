import type Phaser from 'phaser';
import { TILE } from '../config/constants';
import { ITEMS, type ItemId } from '../data/items';
import { gameState } from '../state/GameState';
import { ownerName } from '../state/owner';
import { consume, isExhausted } from '../systems/EnergySystem';
import { collectPond, FISH_POND, fishForFry, isFryItem, ownedBy, stockPond } from '../systems/FishPondSystem';
import { addItem, removeItem } from '../systems/InventorySystem';
import { addXp } from '../systems/SkillSystem';
import { absoluteDayNumber } from '../systems/TimeSystem';
import { seasonStamp } from '../systems/WildFieldSystem';

interface Pond {
  key: string;
  name: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/**
 * The landmark ponds of a map ("fish_pond" objects): hold fingerlings and use
 * them on a pond to stock it, interact with the pond to net your grown fish.
 * Pure rules live in FishPondSystem; this only finds ponds and talks.
 */
export class FishPondsView {
  private readonly ponds: Pond[];

  constructor(mapKey: string, map: Phaser.Tilemaps.Tilemap) {
    this.ponds = (map.getObjectLayer('objects')?.objects ?? [])
      .filter((o) => o.name === 'fish_pond')
      .map((o) => {
        const x0 = Math.floor((o.x ?? 0) / TILE);
        const y0 = Math.floor((o.y ?? 0) / TILE);
        const name = (o.properties as { name: string; value: unknown }[] | undefined)?.find((p) => p.name === 'pondName')?.value;
        return {
          key: `${mapKey}:${x0},${y0}`,
          name: typeof name === 'string' ? name : 'Ao cá',
          x0,
          y0,
          x1: Math.floor(((o.x ?? 0) + (o.width ?? 0)) / TILE) - 1,
          y1: Math.floor(((o.y ?? 0) + (o.height ?? 0)) / TILE) - 1,
        };
      });
  }

  /** The pond covering this tile, if any. */
  pondAt(tile: { x: number; y: number }): Pond | undefined {
    return this.ponds.find((p) => tile.x >= p.x0 && tile.x <= p.x1 && tile.y >= p.y0 && tile.y <= p.y1);
  }

  /** Holding fingerlings, used on `tile`: drop one in. Null if the tile is not a pond. */
  stock(itemId: ItemId, tile: { x: number; y: number }): string | null {
    const pond = this.pondAt(tile);
    if (!isFryItem(itemId)) return null;
    if (!pond) return 'Thả cá giống vào ao cá ở các khu địa danh';
    const fishId = fishForFry(itemId);
    if (!fishId) return null;
    const today = absoluteDayNumber(gameState.time);
    const next = stockPond(gameState.fishPonds, pond.key, {
      owner: ownerName(),
      fishId,
      day: today,
      season: seasonStamp(gameState.time),
    });
    if (!next) return `Phần ao của bạn đã đủ ${FISH_POND.maxPerOwner} con rồi`;
    gameState.fishPonds = next;
    gameState.inventory = removeItem(gameState.inventory, itemId, 1);
    const mine = ownedBy(next, pond.key, ownerName()).length;
    return `Thả 1 cá giống xuống ${pond.name} (${mine} con của bạn) — ${FISH_POND.growDays} ngày nữa cá lớn`;
  }

  /** Interact with a pond: net your grown fish. Null if the tile is not a pond. */
  collect(tile: { x: number; y: number }): string | null {
    const pond = this.pondAt(tile);
    if (!pond) return null;
    const me = ownerName();
    if (!ownedBy(gameState.fishPonds, pond.key, me).length) {
      return `${pond.name}: bạn chưa thả cá ở đây (mua cá giống ở sạp cá)`;
    }
    if (isExhausted(gameState.energy)) return 'Mệt quá, không vớt nổi nữa';
    const result = collectPond(gameState.fishPonds, pond.key, me, absoluteDayNumber(gameState.time));
    const kinds = Object.entries(result.caught) as [ItemId, number][];
    if (!kinds.length) return `Cá còn nhỏ (${result.growing} con) — ${result.daysLeft} ngày nữa mới vớt được`;
    gameState.fishPonds = result.ponds;
    gameState.energy = consume(gameState.energy, FISH_POND.energyCost);
    const got: string[] = [];
    let full = false;
    for (const [fishId, n] of kinds) {
      const added = addItem(gameState.inventory, fishId, n);
      gameState.inventory = added.state;
      full ||= added.leftover > 0;
      got.push(`${n} ${ITEMS[fishId].name}`);
      gameState.skills = addXp(gameState.skills, 'fishing', FISH_POND.xp * n).skills;
    }
    const rest = result.growing ? ` (còn ${result.growing} con đang lớn)` : '';
    return `${full ? 'Túi đầy, rơi mất một ít! ' : ''}Vớt được ${got.join(', ')}${rest}`;
  }
}
