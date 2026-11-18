import type Phaser from 'phaser';
import { TILE } from '../config/constants';
import hawkerDefs from '../data/hawkers.json';
import { gameState } from '../state/GameState';
import { findPath, type TilePath } from '../systems/gridPath';
import { clockMinuteOfDay } from '../systems/TimeSystem';
import { createFolkAnims } from './ambientLife';
import { artScale, hdScale } from './hd';
import { inRect, type Homestead } from './homesteads';
import type { TileRect } from './tigers';

interface HawkerDef {
  id: string;
  name: string;
  shopId: string;
  folk: string;
}

interface Hawker {
  def: HawkerDef;
  stops: { x: number; y: number }[];
  sprite?: Phaser.GameObjects.Sprite;
  pole?: Phaser.GameObjects.Image;
  label?: Phaser.GameObjects.Text;
  path?: TilePath;
  progress: number;
  waitUntil: number;
}

const OUT_FROM = 6 * 60;
const HOME_AT = 17 * 60;
const SPEED = 18;
const NEAR_TILES = 44;
const PAUSE_MS = 15000;

/**
 * Gánh hàng rong: there are no food shops, only hawkers carrying their wares
 * on a shoulder pole round the villages from 6:00 to 17:00, stopping at the
 * houses. Walk up to one and interact to buy (each sells a shop's stock).
 */
export class Hawkers {
  private readonly hawkers: Hawker[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    map: Phaser.Tilemaps.Tilemap,
    private readonly ground: Phaser.Tilemaps.TilemapLayer,
    private readonly decor: Phaser.Tilemaps.TilemapLayer,
    homesteads: Homestead[],
  ) {
    createFolkAnims(scene);
    const defs = hawkerDefs as HawkerDef[];
    const villages: TileRect[] = (map.getObjectLayer('objects')?.objects ?? [])
      .filter((o) => o.name === 'village')
      .map((o) => ({ x0: Math.floor((o.x ?? 0) / TILE), y0: Math.floor((o.y ?? 0) / TILE), x1: Math.floor(((o.x ?? 0) + (o.width ?? 0)) / TILE) - 1, y1: Math.floor(((o.y ?? 0) + (o.height ?? 0)) / TILE) - 1 }));
    villages.forEach((v, i) => {
      const stops = homesteads.filter((h) => inRect(v, h.gate.x, h.gate.y)).map((h) => h.gate);
      if (stops.length < 2) return;
      for (const def of [defs[i % defs.length], defs[(i + 1) % defs.length]]) {
        this.hawkers.push({ def, stops, progress: 0, waitUntil: 0 });
      }
    });
  }

  update(time: number, delta: number, view: Phaser.Geom.Rectangle, player: { x: number; y: number }): void {
    const minute = clockMinuteOfDay(gameState.time);
    const out = minute >= OUT_FROM && minute < HOME_AT;
    for (const h of this.hawkers) {
      const at = h.stops[0];
      const near = Math.max(Math.abs(at.x - view.centerX / TILE), Math.abs(at.y - view.centerY / TILE)) < NEAR_TILES;
      if (!out || !near) {
        this.hide(h);
        continue;
      }
      if (!h.sprite) this.show(h);
      this.walk(h, time, delta);
      const close = Math.hypot(h.sprite!.x - player.x, h.sprite!.y - player.y) < 3 * TILE;
      h.label?.setVisible(close).setPosition(h.sprite!.x, h.sprite!.y - 38).setDepth(h.sprite!.depth + 2);
    }
  }

  /** The hawker within reach of the player, if any (interact to buy from them). */
  shopNear(player: { x: number; y: number }): string | null {
    const h = this.hawkers.find((k) => k.sprite && Math.hypot(k.sprite.x - player.x, k.sprite.y - player.y) < 26);
    return h ? h.def.shopId : null;
  }

  destroy(): void {
    this.hawkers.forEach((h) => this.hide(h));
  }

  private show(h: Hawker): void {
    const start = h.stops[Math.floor(Math.random() * h.stops.length)];
    const k = artScale(this.scene, h.def.folk);
    h.sprite = this.scene.add.sprite(start.x * TILE + TILE / 2, start.y * TILE + TILE - 2, h.def.folk, 0).setOrigin(0.5, 1).setScale(1 / k);
    h.pole = this.scene.add.image(0, 0, 'prop_ganh').setOrigin(0.5, 0.5).setScale(hdScale(this.scene, 'prop_ganh'));
    h.label = this.scene.add
      .text(0, 0, h.def.name, { fontSize: '9px', color: '#fff6e0', backgroundColor: '#2b1a10cc' })
      .setPadding(3, 1, 3, 1)
      .setOrigin(0.5, 1)
      .setVisible(false);
    h.path = undefined;
    h.waitUntil = 0;
  }

  private hide(h: Hawker): void {
    h.sprite?.destroy();
    h.pole?.destroy();
    h.label?.destroy();
    h.sprite = h.pole = h.label = undefined;
  }

  private walkable = (x: number, y: number): boolean => {
    const g = this.ground.getTileAt(x, y);
    if (!g || g.collides) return false;
    const d = this.decor.getTileAt(x, y);
    return !d || !d.collides;
  };

  private walk(h: Hawker, time: number, delta: number): void {
    const s = h.sprite!;
    if (!h.path) {
      if (time < h.waitUntil) return this.pose(h, 'down', false);
      const from = { x: Math.floor(s.x / TILE), y: Math.floor((s.y - 1) / TILE) };
      const next = h.stops[Math.floor(Math.random() * h.stops.length)];
      h.path = findPath(from, this.walkable, (x, y) => x === next.x && y === next.y, 6000) ?? undefined;
      h.progress = 0;
      if (!h.path) h.waitUntil = time + 3000;
      return;
    }
    h.progress += SPEED * (delta / 1000);
    const step = Math.floor(h.progress / TILE);
    if (step >= h.path.length - 1) {
      h.path = undefined;
      h.waitUntil = time + PAUSE_MS; // stops at the house, calling out
      return;
    }
    const a = h.path[step];
    const b = h.path[step + 1];
    const f = (h.progress % TILE) / TILE;
    s.setPosition((a.x + (b.x - a.x) * f) * TILE + TILE / 2, (a.y + (b.y - a.y) * f) * TILE + TILE - 2);
    this.pose(h, b.x > a.x ? 'right' : b.x < a.x ? 'left' : b.y > a.y ? 'down' : 'up', true);
  }

  private pose(h: Hawker, dir: string, moving: boolean): void {
    const s = h.sprite!;
    s.setDepth(s.y);
    const anim = `${h.def.folk}-walk-${dir}`;
    if (moving && (s.anims.currentAnim?.key !== anim || !s.anims.isPlaying)) s.play(anim);
    if (!moving) {
      s.anims.stop();
      s.setFrame(0);
    }
    const side = dir === 'left' || dir === 'right';
    h.pole?.setPosition(s.x, s.y - 17).setScale(hdScale(this.scene, 'prop_ganh') * (side ? 0.55 : 1), hdScale(this.scene, 'prop_ganh')).setDepth(s.y + 0.5);
  }
}
