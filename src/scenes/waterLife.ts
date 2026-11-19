import Phaser from 'phaser';
import { TILE } from '../config/constants';
import { TILE_GID } from '../config/tileGids';

/**
 * Moving water: small light streaks drifting on the rivers the way they flow
 * (towards the sea), wave crests rolling in to the shore on the sea, foam
 * flickering on the surf and still glints on ponds. Only around the camera;
 * drawn just above the painted ground, below everything standing on it.
 */
const STREAK = 'fx_water_streak';
const CREST = 'fx_water_crest';
const MAX_GLINTS = 90;
const TRIES_PER_FRAME = 6;
const DEPTH = -1.4;
/** A water body narrower than this (tiles) both ways is a pond: it doesn't flow. */
const POND = 7;
const LOOK = 10;

type Kind = 'river' | 'pond' | 'sea' | 'surf';

interface Glint {
  img: Phaser.GameObjects.Image;
  vx: number;
  vy: number;
  born: number;
  life: number;
  peak: number;
}

function kindOf(gid: number | undefined): Kind | 'sea-or-river' | null {
  if (gid === undefined) return null;
  if (gid === TILE_GID.SEA || gid === TILE_GID.SEA_DEEP) return 'sea';
  if (gid === TILE_GID.SURF) return 'surf';
  if (gid === TILE_GID.WATER || gid === TILE_GID.DEEP) return 'sea-or-river';
  if ((gid >= TILE_GID.WATER_EDGE_FIRST && gid <= TILE_GID.WATER_EDGE_LAST) || (gid >= TILE_GID.QUAY_FIRST && gid <= TILE_GID.QUAY_LAST)) {
    return 'sea-or-river';
  }
  return null;
}

function isWet(gid: number | undefined): boolean {
  return kindOf(gid) !== null;
}

export class WaterLife {
  private readonly glints: Glint[] = [];
  /** Per tile: its drift (world px per second) and kind, worked out once. */
  private readonly flow = new Map<number, { vx: number; vy: number; kind: Kind }>();
  /** The way rivers run: towards where the map's sea lies (east if it has none). */
  private readonly seaward: { x: number; y: number };

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly ground: Phaser.Tilemaps.TilemapLayer,
  ) {
    makeTextures(scene);
    this.seaward = seaDirection(ground);
  }

  update(time: number, view: Phaser.Geom.Rectangle): void {
    for (let i = this.glints.length - 1; i >= 0; i--) {
      const g = this.glints[i];
      const t = (time - g.born) / g.life;
      if (t >= 1) {
        g.img.destroy();
        this.glints.splice(i, 1);
        continue;
      }
      const dt = this.scene.game.loop.delta / 1000;
      g.img.x += g.vx * dt;
      g.img.y += g.vy * dt;
      g.img.setAlpha(g.peak * Math.sin(Math.PI * t));
    }
    const room = Math.min(MAX_GLINTS, Math.round((view.width * view.height) / 3000));
    for (let k = 0; k < TRIES_PER_FRAME && this.glints.length < room; k++) {
      const tx = Math.floor((view.x + Math.random() * view.width) / TILE);
      const ty = Math.floor((view.y + Math.random() * view.height) / TILE);
      const f = this.flowAt(tx, ty);
      if (f) this.spawn(time, tx, ty, f);
    }
  }

  destroy(): void {
    for (const g of this.glints) g.img.destroy();
    this.glints.length = 0;
  }

  private spawn(time: number, tx: number, ty: number, f: { vx: number; vy: number; kind: Kind }): void {
    const x = (tx + Math.random()) * TILE;
    const y = (ty + Math.random()) * TILE;
    const crest = f.kind === 'sea';
    const img = this.scene.add.image(x, y, crest ? CREST : STREAK).setScale(0.5).setDepth(DEPTH).setAlpha(0);
    // Streaks lie along the way the water moves; crests lie across it.
    const along = Math.abs(f.vy) > Math.abs(f.vx);
    if (crest ? !along : along) img.setAngle(90);
    const pond = f.kind === 'pond';
    this.glints.push({
      img,
      vx: f.vx,
      vy: f.vy,
      born: time,
      life: pond ? 900 + Math.random() * 600 : f.kind === 'surf' ? 700 + Math.random() * 500 : 1600 + Math.random() * 1200,
      peak: f.kind === 'surf' ? 0.9 : pond ? 0.55 : 0.7,
    });
  }

  private flowAt(tx: number, ty: number): { vx: number; vy: number; kind: Kind } | null {
    const key = ty * 100000 + tx;
    const known = this.flow.get(key);
    if (known) return known;
    const base = kindOf(this.ground.getTileAt(tx, ty)?.index);
    if (!base) return null;
    let f: { vx: number; vy: number; kind: Kind };
    if (base === 'sea' || base === 'surf') {
      const shore = this.towardsLand(tx, ty);
      const speed = base === 'surf' ? 2 : 4;
      f = { vx: shore.x * speed, vy: shore.y * speed, kind: base };
    } else {
      const across = this.run(tx, ty, 1, 0);
      const down = this.run(tx, ty, 0, 1);
      if (across < POND && down < POND) f = { vx: 0, vy: 0, kind: 'pond' };
      else if (across >= down) f = { vx: 7 * this.seaward.x, vy: 0, kind: 'river' };
      else f = { vx: 0, vy: 7 * this.seaward.y, kind: 'river' };
    }
    this.flow.set(key, f);
    return f;
  }

  /** How many water tiles in a row pass through (tx, ty) along (dx, dy), up to 2 x LOOK. */
  private run(tx: number, ty: number, dx: number, dy: number): number {
    let n = 1;
    for (const s of [1, -1]) {
      for (let i = 1; i <= LOOK && isWet(this.ground.getTileAt(tx + dx * i * s, ty + dy * i * s)?.index); i++) n++;
    }
    return n;
  }

  /** The unit step towards the nearest dry land (straight lines only); seawards-opposite if none near. */
  private towardsLand(tx: number, ty: number): { x: number; y: number } {
    let best = { x: -this.seaward.x, y: 0 };
    let bestD = Infinity;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      for (let i = 1; i <= LOOK * 2; i++) {
        const tile = this.ground.getTileAt(tx + dx * i, ty + dy * i);
        if (!tile) break;
        if (!isWet(tile.index) || tile.index === TILE_GID.SURF) {
          if (i < bestD) {
            bestD = i;
            best = { x: dx, y: dy };
          }
          break;
        }
      }
    }
    return best;
  }
}

/** Where the sea is from the middle of the map, as a sign on each axis. */
function seaDirection(ground: Phaser.Tilemaps.TilemapLayer): { x: number; y: number } {
  let sx = 0;
  let sy = 0;
  let n = 0;
  const w = ground.layer.width;
  const h = ground.layer.height;
  for (let y = 0; y < h; y += 4) {
    for (let x = 0; x < w; x += 4) {
      const gid = ground.getTileAt(x, y)?.index;
      if (gid === TILE_GID.SEA || gid === TILE_GID.SEA_DEEP) {
        sx += x - w / 2;
        sy += y - h / 2;
        n++;
      }
    }
  }
  if (!n) return { x: 1, y: 1 };
  return { x: sx >= 0 ? 1 : -1, y: sy >= 0 ? 1 : -1 };
}

/** The streak (a short light line, soft at both ends) and the wave crest, drawn at HD size. */
function makeTextures(scene: Phaser.Scene): void {
  if (!scene.textures.exists(STREAK)) {
    const g = scene.add.graphics();
    g.fillStyle(0xeafcff, 0.5).fillRect(0, 0, 2, 2).fillRect(12, 0, 2, 2);
    g.fillStyle(0xffffff, 0.95).fillRect(2, 0, 10, 2);
    g.generateTexture(STREAK, 14, 2);
    g.destroy();
  }
  if (!scene.textures.exists(CREST)) {
    const g = scene.add.graphics();
    g.fillStyle(0xffffff, 0.95).fillRect(4, 0, 10, 2);
    g.fillStyle(0xdff6ff, 0.7).fillRect(0, 2, 4, 2).fillRect(14, 2, 4, 2);
    g.generateTexture(CREST, 18, 4);
    g.destroy();
  }
}
