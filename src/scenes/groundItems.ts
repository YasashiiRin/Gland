import type Phaser from 'phaser';
import { TILE } from '../config/constants';
import { DAY_LENGTH_MINUTES } from '../config/time';
import { isTreeGid } from '../config/tileGids';
import type { ItemId } from '../data/items';
import { net } from '../net/NetSession';
import { gameState } from '../state/GameState';
import { addItem } from '../systems/InventorySystem';
import { bookChance, DROPS } from '../systems/ProfessionSystem';
import { absoluteMinute } from '../systems/StatsSystem';
import { ICON_WORLD_SCALE, iconTextureKey } from '../ui/itemIcons';

const PICK_PX = 14;

/**
 * Things lying about the map to be picked up by walking over them: the
 * Thầy pháp's talisman (a few days apart, anywhere in the wilds) and ancient
 * books (in the woods: each area of radius 20 tiles gets a daily chance of
 * 0.5% per tree in it). The host (or a lone player) rolls once a day per map.
 */
export class GroundItems {
  private readonly images = new Map<string, Phaser.GameObjects.Image>();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly mapKey: string,
    private readonly ground: Phaser.Tilemaps.TilemapLayer,
    private readonly decor: Phaser.Tilemaps.TilemapLayer,
    private readonly blocked: (tx: number, ty: number) => boolean,
  ) {
    if (net.role !== 'guest') this.roll();
  }

  /** Drops an item at a world position (e.g. a book a ghost let fall). */
  drop(itemId: ItemId, x: number, y: number): void {
    const key = `${this.mapKey}:${Math.floor(x / TILE)},${Math.floor(y / TILE)}`;
    gameState.groundItems = { ...gameState.groundItems, [key]: { itemId, day: this.today() } };
  }

  update(time: number, player: { x: number; y: number }, say: (t: string) => void): void {
    const prefix = `${this.mapKey}:`;
    const seen = new Set<string>();
    for (const [key, it] of Object.entries(gameState.groundItems)) {
      if (!key.startsWith(prefix)) continue;
      const [tx, ty] = key.slice(prefix.length).split(',').map(Number);
      const x = tx * TILE + TILE / 2;
      const y = ty * TILE + TILE / 2;
      if (Math.abs(x - player.x) > 500 || Math.abs(y - player.y) > 400) continue;
      seen.add(key);
      let img = this.images.get(key);
      if (!img) {
        img = this.scene.add.image(x, y, iconTextureKey(it.itemId)).setScale(ICON_WORLD_SCALE).setDepth(y + 4);
        this.images.set(key, img);
      }
      img.setY(y - 3 + Math.sin(time / 300 + tx) * 2).setAlpha(0.75 + 0.25 * Math.sin(time / 200 + ty));
      if (Math.hypot(x - player.x, y - (player.y - 6)) < PICK_PX) this.pick(key, it.itemId, say);
    }
    for (const [key, img] of this.images) {
      if (!seen.has(key)) {
        img.destroy();
        this.images.delete(key);
      }
    }
  }

  destroy(): void {
    this.images.forEach((i) => i.destroy());
  }

  private pick(key: string, itemId: ItemId, say: (t: string) => void): void {
    const added = addItem(gameState.inventory, itemId, 1);
    if (added.leftover > 0) return say('Túi đồ đầy, không nhặt được');
    gameState.inventory = added.state;
    const next = { ...gameState.groundItems };
    delete next[key];
    gameState.groundItems = next;
    say(itemId === 'bua_khai_dao' ? 'Nhặt được một lá bùa vàng chữ son…' : 'Nhặt được một cuốn sách cổ!');
  }

  private today(): number {
    return Math.floor(absoluteMinute(gameState.time) / DAY_LENGTH_MINUTES);
  }

  /** Once a day per map: maybe a talisman somewhere in the wilds, maybe books in the woods. */
  private roll(): void {
    const today = this.today();
    if (gameState.groundRolls[this.mapKey] === today) return;
    gameState.groundRolls = { ...gameState.groundRolls, [this.mapKey]: today };
    const next = { ...gameState.groundItems };
    const { width, height } = this.ground.layer;
    const free = (x: number, y: number) => {
      const g = this.ground.getTileAt(x, y);
      const d = this.decor.getTileAt(x, y);
      return !!g && !g.collides && (!d || !d.collides) && !this.blocked(x, y);
    };
    const place = (itemId: ItemId, x0: number, y0: number, w: number, h: number): boolean => {
      for (let i = 0; i < 40; i++) {
        const x = x0 + Math.floor(Math.random() * w);
        const y = y0 + Math.floor(Math.random() * h);
        if (free(x, y)) {
          next[`${this.mapKey}:${x},${y}`] = { itemId, day: today };
          return true;
        }
      }
      return false;
    };
    const onMap = (id: ItemId) => Object.entries(next).filter(([k, v]) => k.startsWith(`${this.mapKey}:`) && v.itemId === id).length;
    if (onMap('bua_khai_dao') === 0 && Math.random() < DROPS.talismanChancePerDay) place('bua_khai_dao', 20, 20, width - 40, height - 40);
    const size = DROPS.areaSize;
    let books = 0;
    for (let ay = 0; ay < height; ay += size) {
      for (let ax = 0; ax < width; ax += size) {
        if (books >= DROPS.maxNewBooksPerDay || onMap('sach_co') >= DROPS.maxBooksOnMap) break;
        let trees = 0;
        for (let y = ay; y < Math.min(height, ay + size); y += 2) {
          for (let x = ax; x < Math.min(width, ax + size); x += 2) if (isTreeGid(this.decor.getTileAt(x, y)?.index)) trees += 4;
        }
        if (trees && Math.random() < bookChance(trees) && place('sach_co', ax, ay, size, size)) books++;
      }
    }
    gameState.groundItems = next;
  }
}
