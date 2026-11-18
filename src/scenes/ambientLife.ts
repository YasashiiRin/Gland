import Phaser from 'phaser';
import { TILE } from '../config/constants';
import { TILE_GID } from '../config/tileGids';
import { gameState } from '../state/GameState';
import type { Direction } from '../systems/movement';
import { DIRECTIONS } from '../systems/movement';
import { clockMinuteOfDay } from '../systems/TimeSystem';
import { AmbientFields } from './ambientFields';
import { artScale, hdScale } from './hd';
import type { TileRect } from './tigers';

/** Villager sheets drawn by scripts/art/folk.py. */
export const FOLK_KEYS = ['folk_0', 'folk_1', 'folk_2', 'folk_3', 'folk_4', 'folk_5'] as const;
const BICYCLE = 'vehicle_bicycle';
/** Life is only simulated this close to the camera (px). */
const ACTIVE_RADIUS = 34 * TILE;
/** Villagers appear on the roads this close to the camera (px), at most this many per zone. */
const SPAWN_RADIUS = 20 * TILE;
const MAX_WALKERS = 12;
const WALK_SPEED = 22;
const BIKE_SPEED = 52;
const STEPS: Record<Direction, [number, number]> = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] };

function isRoad(gid: number | undefined): boolean {
  if (gid === undefined) return false;
  return gid === TILE_GID.PATH || (gid >= 41 && gid <= 56) || gid === TILE_GID.PAVING || gid === TILE_GID.BRIDGE;
}

interface Walker {
  sprite: Phaser.GameObjects.Sprite;
  bike?: Phaser.GameObjects.Image;
  tx: number;
  ty: number;
  dir: Direction;
  /** Target tile centre (px). */
  goal: { x: number; y: number };
}

interface ZoneLife {
  rect: TileRect;
  roads: { x: number; y: number }[];
  walkers: Walker[];
}

/**
 * Graphics step 4, the villages come alive: villagers under nón lá walk the
 * roads of every town and landmark (a few ride old bicycles), buffaloes
 * plough the paddies and sampans drift on the rivers (AmbientFields). It is
 * all scenery: no physics, no saving, and only near the camera.
 */
export class AmbientLife {
  private readonly zones: ZoneLife[];
  private readonly road = new Set<number>();
  private readonly fields: AmbientFields;
  private nextCheck = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly ground: Phaser.Tilemaps.TilemapLayer,
    decor: Phaser.Tilemaps.TilemapLayer,
    safeZones: TileRect[],
  ) {
    createFolkAnims(scene);
    this.zones = safeZones.map((rect) => {
      const roads: { x: number; y: number }[] = [];
      for (let y = rect.y0; y <= rect.y1; y++) {
        for (let x = rect.x0; x <= rect.x1; x++) {
          if (isRoad(ground.getTileAt(x, y)?.index) && !decor.getTileAt(x, y)) {
            roads.push({ x, y });
            this.road.add(y * ground.layer.width + x);
          }
        }
      }
      return { rect, roads, walkers: [] };
    });
    this.fields = new AmbientFields(scene, ground);
  }

  update(time: number, delta: number, view: Phaser.Geom.Rectangle): void {
    const minute = clockMinuteOfDay(gameState.time);
    if (time >= this.nextCheck) {
      this.nextCheck = time + 1000;
      // Only people who live in the houses walk about now (villagers.ts, hawkers.ts): no random strollers.
      this.populate(view, false);
      this.fields.populate(view, minute);
    }
    for (const z of this.zones) for (const w of z.walkers) this.step(w, delta);
    this.fields.update(time, delta);
  }

  destroy(): void {
    for (const z of this.zones) this.clear(z);
    this.fields.destroy();
  }

  /** Fills the zones near the camera with villagers (by day) and empties the others. */
  private populate(view: Phaser.Geom.Rectangle, daytime: boolean): void {
    const cx = view.centerX;
    const cy = view.centerY;
    for (const z of this.zones) {
      const near =
        daytime &&
        cx > z.rect.x0 * TILE - ACTIVE_RADIUS &&
        cx < (z.rect.x1 + 1) * TILE + ACTIVE_RADIUS &&
        cy > z.rect.y0 * TILE - ACTIVE_RADIUS &&
        cy < (z.rect.y1 + 1) * TILE + ACTIVE_RADIUS;
      if (!near) {
        this.clear(z);
        continue;
      }
      // Big towns: only the streets around the camera are busy. Walkers who wandered far are sent home.
      z.walkers = z.walkers.filter((w) => {
        const far = Math.hypot(w.sprite.x - cx, w.sprite.y - cy) > ACTIVE_RADIUS;
        if (far) {
          w.sprite.destroy();
          w.bike?.destroy();
        }
        return !far;
      });
      const around = z.roads.filter((r) => Math.hypot(r.x * TILE - cx, r.y * TILE - cy) < SPAWN_RADIUS);
      const want = Math.max(around.length ? 2 : 0, Math.min(MAX_WALKERS, Math.floor(around.length / 22)));
      while (z.walkers.length < want) z.walkers.push(this.spawn(around, z.walkers.length));
    }
  }

  private spawn(roads: { x: number; y: number }[], i: number): Walker {
    const at = roads[Math.floor(Math.random() * roads.length)];
    const key = FOLK_KEYS[Math.floor(Math.random() * FOLK_KEYS.length)];
    const k = artScale(this.scene, key);
    const x = at.x * TILE + TILE / 2;
    const y = at.y * TILE + TILE - 2;
    const sprite = this.scene.add.sprite(x, y, key, 0).setOrigin(0.5, 1).setScale(1 / k);
    const w: Walker = { sprite, tx: at.x, ty: at.y, dir: DIRECTIONS[Math.floor(Math.random() * 4)], goal: { x, y } };
    if (i % 4 === 3 && this.scene.textures.exists(BICYCLE)) {
      w.bike = this.scene.add.image(x, y, BICYCLE, 0).setOrigin(0.5, 1).setScale(hdScale(this.scene, BICYCLE));
      sprite.setCrop(0, 0, 16 * k, 23 * k); // legs hidden by the bicycle, like a rider
    }
    return w;
  }

  private clear(z: ZoneLife): void {
    for (const w of z.walkers) {
      w.sprite.destroy();
      w.bike?.destroy();
    }
    z.walkers = [];
  }

  private step(w: Walker, delta: number): void {
    const speed = (w.bike ? BIKE_SPEED : WALK_SPEED) * (delta / 1000);
    const dx = w.goal.x - w.sprite.x;
    const dy = w.goal.y - w.sprite.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= speed) {
      w.sprite.setPosition(w.goal.x, w.goal.y);
      this.chooseNext(w);
    } else {
      w.sprite.setPosition(w.sprite.x + (dx / dist) * speed, w.sprite.y + (dy / dist) * speed);
    }
    const key = `${w.sprite.texture.key}-walk-${w.dir}`;
    if (w.bike) {
      w.sprite.setFrame(DIRECTIONS.indexOf(w.dir) * 4);
      w.bike.setFrame(DIRECTIONS.indexOf(w.dir)).setPosition(w.sprite.x, w.sprite.y + 4).setDepth(w.sprite.y + (w.dir === 'down' ? 0.5 : -0.5));
    } else if (w.sprite.anims.currentAnim?.key !== key) {
      w.sprite.play(key);
    }
    w.sprite.setDepth(w.sprite.y);
  }

  /** Next road tile: mostly straight on, sometimes a turn, back only at a dead end. */
  private chooseNext(w: Walker): void {
    const width = this.ground.layer.width;
    const back: Record<Direction, Direction> = { down: 'up', up: 'down', left: 'right', right: 'left' };
    const open = DIRECTIONS.filter((d) => {
      const [sx, sy] = STEPS[d];
      return d !== back[w.dir] && this.road.has((w.ty + sy) * width + (w.tx + sx));
    });
    let dir: Direction = back[w.dir];
    if (open.length) dir = open.includes(w.dir) && Math.random() < 0.8 ? w.dir : open[Math.floor(Math.random() * open.length)];
    else if (!this.road.has((w.ty + STEPS[dir][1]) * width + (w.tx + STEPS[dir][0]))) return; // stranded: stand still
    w.dir = dir;
    w.tx += STEPS[dir][0];
    w.ty += STEPS[dir][1];
    w.goal = { x: w.tx * TILE + TILE / 2, y: w.ty * TILE + TILE - 2 };
  }
}

/** Walk cycles for the villager sheets (4 directions x 4 frames, like the player). */
export function createFolkAnims(scene: Phaser.Scene): void {
  for (const key of FOLK_KEYS) {
    if (!scene.textures.exists(key)) continue;
    DIRECTIONS.forEach((dir, row) => {
      const anim = `${key}-walk-${dir}`;
      if (scene.anims.exists(anim)) return;
      scene.anims.create({ key: anim, frames: scene.anims.generateFrameNumbers(key, { start: row * 4, end: row * 4 + 3 }), frameRate: 6, repeat: -1 });
    });
  }
}
