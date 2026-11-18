import type Phaser from 'phaser';
import { TILE } from '../config/constants';
import { TILE_GID } from '../config/tileGids';
import { FOLK_KEYS } from './ambientLife';
import { artScale, hdScale } from './hd';

const ACTIVE_RADIUS = 34 * TILE;
const MAX_PLOUGHS = 3;
const MAX_BOATS = 3;
const PLOUGH_SPEED = 10;
const BOAT_SPEED = 9;
/** Buffaloes plough from 6:00 to 17:00; boats are out from 5:00 to 21:00. */
const PLOUGH_HOURS: [number, number] = [6 * 60, 17 * 60];
const BOAT_HOURS: [number, number] = [5 * 60, 21 * 60];

/** A straight stretch of paddy or river, in tiles. */
interface Run {
  id: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

interface Mover {
  run: Run;
  /** Distance along the run (px) and which way it is heading (+1 / -1). */
  pos: number;
  sign: number;
  parts: (Phaser.GameObjects.Sprite | Phaser.GameObjects.Image)[];
}

function runs(ground: Phaser.Tilemaps.TilemapLayer, match: (gid: number | undefined) => boolean, min: number, every: number): Run[] {
  const out: Run[] = [];
  const { width, height } = ground.layer;
  for (let y = 0; y < height; y += every) {
    let start = -1;
    for (let x = 0; x <= width; x++) {
      const ok = x < width && match(ground.getTileAt(x, y)?.index);
      if (ok && start < 0) start = x;
      if (!ok && start >= 0) {
        if (x - start >= min) out.push({ id: out.length, x0: start + 1, y0: y, x1: x - 2, y1: y });
        start = -1;
      }
    }
  }
  return out;
}

/**
 * Buffaloes dragging a plough along the paddies, a ploughman walking behind,
 * and sampans drifting up and down the rivers, near the camera only.
 */
export class AmbientFields {
  private readonly paddies: Run[];
  private readonly rivers: Run[];
  private ploughs: Mover[] = [];
  private boats: Mover[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    ground: Phaser.Tilemaps.TilemapLayer,
  ) {
    this.paddies = runs(ground, (g) => g === TILE_GID.PADDY, 8, 3);
    this.rivers = runs(ground, (g) => g === TILE_GID.WATER || g === TILE_GID.DEEP, 14, 5);
    if (!scene.anims.exists('animal_buffalo_walk') && scene.textures.exists('animal_buffalo')) {
      scene.anims.create({ key: 'animal_buffalo_walk', frames: scene.anims.generateFrameNumbers('animal_buffalo', { start: 0, end: 1 }), frameRate: 3, repeat: -1 });
    }
  }

  populate(view: Phaser.Geom.Rectangle, minute: number): void {
    const inHours = ([a, b]: [number, number]) => minute >= a && minute < b;
    this.ploughs = this.keep(this.ploughs, this.paddies, view, inHours(PLOUGH_HOURS) ? MAX_PLOUGHS : 0, (r) => this.makePlough(r));
    this.boats = this.keep(this.boats, this.rivers, view, inHours(BOAT_HOURS) ? MAX_BOATS : 0, (r) => this.makeBoat(r));
  }

  update(time: number, delta: number): void {
    for (const p of this.ploughs) this.advance(p, PLOUGH_SPEED * (delta / 1000), (x, y, s) => this.placePlough(p, x, y, s));
    for (const b of this.boats) {
      this.advance(b, BOAT_SPEED * (delta / 1000), (x, y, s) => {
        b.parts[0].setPosition(x, y + Math.sin(time / 500 + b.run.id) * 0.8).setFlipX(s < 0).setDepth(y - 6);
      });
    }
  }

  destroy(): void {
    for (const m of [...this.ploughs, ...this.boats]) m.parts.forEach((p) => p.destroy());
    this.ploughs = [];
    this.boats = [];
  }

  /** Keeps the movers on runs still near the camera, adds new ones up to `max`. */
  private keep(list: Mover[], pool: Run[], view: Phaser.Geom.Rectangle, max: number, make: (r: Run) => Mover): Mover[] {
    const near = (r: Run) => Math.hypot(((r.x0 + r.x1) / 2) * TILE - view.centerX, r.y0 * TILE - view.centerY) < ACTIVE_RADIUS;
    const kept = list.filter((m) => {
      const ok = max > 0 && near(m.run);
      if (!ok) m.parts.forEach((p) => p.destroy());
      return ok;
    });
    if (kept.length >= max) return kept;
    const used = new Set(kept.map((m) => m.run.id));
    const dist = (r: Run) => Math.hypot(((r.x0 + r.x1) / 2) * TILE - view.centerX, r.y0 * TILE - view.centerY);
    // The closest rows first (every other one, so teams don't walk side by side).
    const free = pool.filter((r) => !used.has(r.id) && r.id % 2 === 0 && near(r)).sort((a, b) => dist(a) - dist(b));
    for (const r of free) {
      if (kept.length >= max) break;
      kept.push(make(r));
    }
    return kept;
  }

  private advance(m: Mover, step: number, place: (x: number, y: number, sign: number) => void): void {
    const length = (m.run.x1 - m.run.x0) * TILE;
    m.pos += step * m.sign;
    if (m.pos > length || m.pos < 0) {
      m.sign = -m.sign; // turn round at the end of the row
      m.pos = Math.max(0, Math.min(length, m.pos));
    }
    place(m.run.x0 * TILE + TILE / 2 + m.pos, m.run.y0 * TILE + TILE - 1, m.sign);
  }

  private makePlough(run: Run): Mover {
    const s = this.scene;
    const buffalo = s.add.sprite(0, 0, 'animal_buffalo', 0).setOrigin(0.5, 1);
    buffalo.setScale(1 / artScale(s, 'animal_buffalo')).play('animal_buffalo_walk');
    const plough = s.add.image(0, 0, 'prop_plough').setOrigin(0.5, 1).setScale(hdScale(s, 'prop_plough'));
    const key = FOLK_KEYS[run.id % 3]; // the hatted ones
    const man = s.add.sprite(0, 0, key, 0).setOrigin(0.5, 1).setScale(1 / artScale(s, key));
    const m: Mover = { run, pos: 0, sign: 1, parts: [buffalo, plough, man] };
    this.placePlough(m, run.x0 * TILE, run.y0 * TILE + TILE - 1, 1);
    return m;
  }

  /** Buffalo ahead, plough behind it, the ploughman holding the handle. */
  private placePlough(m: Mover, x: number, y: number, sign: number): void {
    const [buffalo, plough, man] = m.parts as [Phaser.GameObjects.Sprite, Phaser.GameObjects.Image, Phaser.GameObjects.Sprite];
    buffalo.setPosition(x, y).setFlipX(sign < 0).setDepth(y);
    plough.setPosition(x - sign * 22, y).setFlipX(sign < 0).setDepth(y - 0.2);
    man.setPosition(x - sign * 32, y + 1).setDepth(y + 1);
    const anim = `${man.texture.key}-walk-${sign > 0 ? 'right' : 'left'}`;
    if (man.anims.currentAnim?.key !== anim && this.scene.anims.exists(anim)) man.play(anim);
  }

  private makeBoat(run: Run): Mover {
    const img = this.scene.add.image(0, 0, 'prop_sampan').setOrigin(0.5, 1).setScale(hdScale(this.scene, 'prop_sampan'));
    return { run, pos: ((run.id * 37) % Math.max(1, run.x1 - run.x0)) * TILE, sign: run.id % 2 ? 1 : -1, parts: [img] };
  }
}
