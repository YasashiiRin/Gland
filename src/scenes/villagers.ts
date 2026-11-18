import type Phaser from 'phaser';
import { TILE } from '../config/constants';
import { TILE_GID } from '../config/tileGids';
import { gameState } from '../state/GameState';
import { findPath, type TilePath } from '../systems/gridPath';
import { clockMinuteOfDay } from '../systems/TimeSystem';
import { householdRoles, isTravel, phaseAt, type Activity, type Role } from '../systems/VillagerSchedule';
import { FOLK_KEYS, createFolkAnims } from './ambientLife';
import { artScale } from './hd';
import { inRect, type Homestead } from './homesteads';
import { readProp } from './worldSprites';

const HOUSES = new Set(['house_a', 'house_b', 'house_c', 'thatched_house', 'stilt_house']);
const SHOPS = /^shophouse_\d$/;
/** Households this close to the camera (tiles) live on screen; their fields are looked up a little further out. */
const ACTIVE_TILES = 40;
const PLAN_TILES = 60;
const WALK = 22;
/** A game minute lasts 0.7 s, so this is how far a villager walks in one (px). */
const PX_PER_GAME_MINUTE = WALK * 0.7;

interface Member {
  role: Role;
  key: string;
  child: boolean;
  activity?: Activity;
  progress: number;
  sprite?: Phaser.GameObjects.Sprite;
  nextPuff: number;
}

interface Household {
  door: { x: number; y: number };
  yard?: { x0: number; x1: number; y0: number; y1: number };
  members: Member[];
  planned: boolean;
  field?: TilePath;
  school?: TilePath;
}

/**
 * The people living in the village houses (part B of the homesteads): a
 * shopkeeper in each shophouse, someone living alone or a couple with a child
 * in each house. Farmers walk to the nearest paddy at dawn, hoe it in
 * three-hour spells with a half-hour sit down, and come home in the
 * afternoon; children walk to the village school. Their day follows the
 * clock (VillagerSchedule); paths are found when the camera comes near.
 */
export class Villagers {
  private readonly households: Household[] = [];
  private readonly schools: { x: number; y: number }[] = [];
  /** Paddy tiles some household already works (so each family has its own patch, spread over the fields). */
  private readonly claimed = new Set<string>();

  constructor(
    private readonly scene: Phaser.Scene,
    map: Phaser.Tilemaps.Tilemap,
    private readonly ground: Phaser.Tilemaps.TilemapLayer,
    private readonly decor: Phaser.Tilemaps.TilemapLayer,
    homesteads: Homestead[],
    taken: (h: Homestead) => boolean,
  ) {
    createFolkAnims(scene);
    let seed = 0;
    for (const o of map.getObjectLayer('objects')?.objects ?? []) {
      if (o.name !== 'prop') continue;
      const sprite = readProp(o, 'sprite') ?? '';
      const front = { x: Math.floor(((o.x ?? 0) + (o.width ?? 0) / 2) / TILE), y: Math.floor(((o.y ?? 0) + (o.height ?? 0)) / TILE) };
      if (sprite === 'school') this.schools.push(front);
      const shop = SHOPS.test(sprite);
      if (!shop && !HOUSES.has(sprite)) continue;
      const home = homesteads.find((h) => inRect(h, front.x, front.y));
      if (home && (home.vacant || taken(home))) continue; // empty, or a player's house
      const yard = home ? { x0: home.x0 + 1, x1: home.x1 - 1, y0: home.y1 - 2, y1: home.y1 - 1 } : undefined;
      seed++;
      const members = householdRoles(seed, shop).map((role, i) => ({
        role,
        key: FOLK_KEYS[(seed * 7 + i * 3 + (i === 1 ? 1 : 0)) % FOLK_KEYS.length],
        child: role === 'child',
        progress: 0,
        nextPuff: 0,
      }));
      this.households.push({ door: front, yard, members, planned: false });
    }
  }

  update(time: number, delta: number, view: Phaser.Geom.Rectangle): void {
    const minute = clockMinuteOfDay(gameState.time);
    const cx = view.centerX / TILE;
    const cy = view.centerY / TILE;
    for (const h of this.households) {
      const d = Math.max(Math.abs(h.door.x - cx), Math.abs(h.door.y - cy));
      const fieldEnd = h.field?.[h.field.length - 1];
      const fd = fieldEnd ? Math.max(Math.abs(fieldEnd.x - cx), Math.abs(fieldEnd.y - cy)) : Infinity;
      if (d > PLAN_TILES && fd > ACTIVE_TILES) {
        this.sleep(h);
        continue;
      }
      if (!h.planned) this.plan(h);
      if (d > ACTIVE_TILES && fd > ACTIVE_TILES) {
        this.sleep(h);
        continue;
      }
      h.members.forEach((m, i) => this.live(h, m, i, minute, time, delta));
    }
  }

  destroy(): void {
    for (const h of this.households) this.sleep(h);
  }

  private sleep(h: Household): void {
    for (const m of h.members) {
      m.sprite?.destroy();
      m.sprite = undefined;
      m.activity = undefined;
    }
  }

  private walkable = (x: number, y: number): boolean => {
    const g = this.ground.getTileAt(x, y);
    if (!g || g.collides) return false;
    const d = this.decor.getTileAt(x, y);
    return !d || !d.collides;
  };

  /** Finds this household's way to the nearest paddy and to the school. */
  private plan(h: Household): void {
    h.planned = true;
    if (h.members.some((m) => m.role === 'farmer')) {
      const free = (x: number, y: number) => this.ground.getTileAt(x, y)?.index === TILE_GID.PADDY && !this.claimed.has(`${x},${y}`);
      // A patch well inside the paddy (not at its edge), with room for two side by side.
      const inside = (x: number, y: number) => free(x, y) && free(x + 1, y) && free(x, y - 2) && free(x, y + 2);
      h.field = findPath(h.door, this.walkable, inside) ?? undefined;
      const end = h.field?.[h.field.length - 1];
      if (end) for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 3; dx++) this.claimed.add(`${end.x + dx},${end.y + dy}`);
    }
    if (h.members.some((m) => m.child) && this.schools.length) {
      const school = this.schools.reduce((a, b) => (dist(a, h.door) < dist(b, h.door) ? a : b));
      if (dist(school, h.door) < 120) {
        h.school = findPath(h.door, this.walkable, (x, y) => x === school.x && y === school.y, 30000) ?? undefined;
      }
    }
  }

  private live(h: Household, m: Member, index: number, minute: number, time: number, delta: number): void {
    const phase = phaseAt(m.role, minute);
    if (m.activity !== phase.activity) {
      // Joining mid-way (the camera just arrived): they have been walking since the phase began.
      m.progress = m.activity === undefined ? Math.max(0, minute - phase.since) * PX_PER_GAME_MINUTE : 0;
      m.activity = phase.activity;
    } else if (isTravel(m.activity)) {
      m.progress += WALK * (delta / 1000);
    }
    const route = m.child ? h.school : h.field;
    let a = m.activity;
    if (!route && (a === 'toField' || a === 'toSchool' || a === 'toHome' || a === 'work' || a === 'rest' || a === 'school')) {
      a = a === 'work' ? 'work' : a === 'school' ? 'indoors' : 'yard'; // no field or school: do it at home
    }
    if (a === 'indoors' || a === 'school') {
      m.sprite?.destroy();
      m.sprite = undefined;
      return;
    }
    const sprite = this.spriteOf(m);
    sprite.setCrop();
    if ((a === 'toField' || a === 'toSchool' || a === 'toHome') && route) {
      const path = a === 'toHome' ? [...route].reverse() : route;
      const done = this.walkAlong(sprite, m, path, m.progress);
      if (!done) return;
    }
    if (a === 'work' || a === 'rest' || ((a === 'toField' || a === 'toSchool') && route)) {
      const end = route ? route[route.length - 1] : h.door;
      const spot = { x: end.x + (index === 1 ? 1 : 0), y: end.y };
      sprite.setPosition(spot.x * TILE + TILE / 2, spot.y * TILE + TILE - 2).setDepth(spot.y * TILE + TILE);
      if (a === 'rest') this.sit(sprite, m);
      else if (a === 'work') this.hoe(sprite, m, time);
      return;
    }
    if (a === 'shop') {
      sprite.anims.stop();
      sprite.setFrame(0).setPosition(h.door.x * TILE + TILE / 2, h.door.y * TILE + TILE - 2).setDepth(h.door.y * TILE + TILE);
      return;
    }
    this.potter(sprite, h, m, index, time);
  }

  private spriteOf(m: Member): Phaser.GameObjects.Sprite {
    if (m.sprite) return m.sprite;
    const k = artScale(this.scene, m.key);
    m.sprite = this.scene.add.sprite(0, 0, m.key, 0).setOrigin(0.5, 1).setScale((m.child ? 0.72 : 1) / k);
    return m.sprite;
  }

  /** Places the walker `progress` px along the path; true once they have arrived. */
  private walkAlong(sprite: Phaser.GameObjects.Sprite, m: Member, path: TilePath, progress: number): boolean {
    const step = Math.floor(progress / TILE);
    if (step >= path.length - 1) return true;
    const a = path[step];
    const b = path[step + 1];
    const f = (progress % TILE) / TILE;
    const x = (a.x + (b.x - a.x) * f) * TILE + TILE / 2;
    const y = (a.y + (b.y - a.y) * f) * TILE + TILE - 2;
    const dir = b.x > a.x ? 'right' : b.x < a.x ? 'left' : b.y > a.y ? 'down' : 'up';
    sprite.setPosition(x, y).setDepth(y);
    const anim = `${m.key}-walk-${dir}`;
    if (sprite.anims.currentAnim?.key !== anim || !sprite.anims.isPlaying) sprite.play(anim);
    return false;
  }

  /** Hoeing: bent over the ground, rising and striking, a puff of earth now and then. */
  private hoe(sprite: Phaser.GameObjects.Sprite, m: Member, time: number): void {
    sprite.anims.stop();
    sprite.setFrame(4 + (Math.floor(time / 450) % 2) * 2); // facing left, two poses
    if (time < m.nextPuff) return;
    m.nextPuff = time + 1300;
    const puff = this.scene.add.circle(sprite.x - 8, sprite.y - 1, 2.5, 0x7a5636, 0.8).setDepth(sprite.depth + 1);
    this.scene.tweens.add({ targets: puff, y: puff.y - 5, alpha: 0, scale: 2, duration: 500, onComplete: () => puff.destroy() });
  }

  /** Sitting down for a rest: legs folded out of sight. */
  private sit(sprite: Phaser.GameObjects.Sprite, m: Member): void {
    const k = artScale(this.scene, m.key);
    sprite.anims.stop();
    sprite.setFrame(0).setCrop(0, 0, 16 * k, 22 * k).setPosition(sprite.x, sprite.y + 9);
  }

  /** At home in the afternoon: strolls between spots of the yard. */
  private potter(sprite: Phaser.GameObjects.Sprite, h: Household, m: Member, index: number, time: number): void {
    const y = h.yard ?? { x0: h.door.x - 1, x1: h.door.x + 1, y0: h.door.y, y1: h.door.y };
    const span = y.x1 - y.x0;
    const t = time / 1000 / (6 + index * 2) + index * 1.7;
    const x = (y.x0 + (Math.sin(t) * 0.5 + 0.5) * span) * TILE + TILE / 2;
    const yy = (index % 2 ? y.y1 : y.y0) * TILE + TILE - 2;
    const moving = Math.abs(Math.cos(t)) > 0.2;
    const dir = Math.cos(t) > 0 ? 'right' : 'left';
    sprite.setPosition(x, yy).setDepth(yy);
    if (moving) {
      const anim = `${m.key}-walk-${dir}`;
      if (sprite.anims.currentAnim?.key !== anim || !sprite.anims.isPlaying) sprite.play(anim);
    } else {
      sprite.anims.stop();
      sprite.setFrame(0);
    }
  }
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
