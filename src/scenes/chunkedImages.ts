import type Phaser from 'phaser';
import { TILE } from '../config/constants';
import { hdScale } from './hd';

/** Chunk size in tiles: sprites are created and destroyed a chunk at a time. */
const CHUNK_TILES = 16;
const CHUNK_PX = CHUNK_TILES * TILE;
/** Extra chunks kept alive around the camera so big sprites never pop in at the edge. */
const MARGIN = 1;

export interface ImageSpec {
  x: number;
  y: number;
  key: string;
  originX: number;
  originY: number;
  depth: number;
  /** Lets the owner find the live image again (e.g. a tree's "x,y" tile). */
  id?: string;
}

/**
 * Sprites for a big map, created only near the camera. A province map can
 * hold tens of thousands of trees; drawing them all costs memory and frame
 * rate, so each 16x16-tile chunk is materialised when it comes into view and
 * destroyed when it's well out of it.
 */
export class ChunkedImages {
  private readonly chunks = new Map<number, ImageSpec[]>();
  private readonly live = new Map<number, Phaser.GameObjects.Image[]>();
  private readonly byId = new Map<string, Phaser.GameObjects.Image>();
  private lastRange = '';

  constructor(private readonly scene: Phaser.Scene) {}

  add(spec: ImageSpec): void {
    const key = chunkKey(Math.floor(spec.x / CHUNK_PX), Math.floor(spec.y / CHUNK_PX));
    const list = this.chunks.get(key);
    if (list) list.push(spec);
    else this.chunks.set(key, [spec]);
  }

  /** The live image with this id, if its chunk is on screen. */
  get(id: string): Phaser.GameObjects.Image | undefined {
    return this.byId.get(id);
  }

  /** Forgets a sprite for good (a felled tree) and hands back its live image, if any, to animate away. */
  remove(id: string): Phaser.GameObjects.Image | undefined {
    for (const list of this.chunks.values()) {
      const i = list.findIndex((s) => s.id === id);
      if (i >= 0) {
        list.splice(i, 1);
        break;
      }
    }
    const image = this.byId.get(id);
    this.byId.delete(id);
    if (image) {
      for (const imgs of this.live.values()) {
        const i = imgs.indexOf(image);
        if (i >= 0) imgs.splice(i, 1);
      }
    }
    return image;
  }

  /** Every live image (for per-frame effects like see-through canopies). */
  *images(): IterableIterator<Phaser.GameObjects.Image> {
    for (const list of this.live.values()) yield* list;
  }

  /** Call each frame with the camera's view: creates/destroys chunks as it moves. */
  update(view: Phaser.Geom.Rectangle): void {
    const cx0 = Math.floor(view.x / CHUNK_PX) - MARGIN;
    const cy0 = Math.floor(view.y / CHUNK_PX) - MARGIN;
    const cx1 = Math.floor((view.x + view.width) / CHUNK_PX) + MARGIN;
    const cy1 = Math.floor((view.y + view.height) / CHUNK_PX) + MARGIN;
    const range = `${cx0},${cy0},${cx1},${cy1}`;
    if (range === this.lastRange) return;
    this.lastRange = range;
    for (const [key, imgs] of this.live) {
      const { cx, cy } = fromKey(key);
      // Keep one more chunk than we create, so walking back and forth over a border doesn't churn.
      if (cx >= cx0 - 1 && cx <= cx1 + 1 && cy >= cy0 - 1 && cy <= cy1 + 1) continue;
      for (const img of imgs) img.destroy();
      this.live.delete(key);
      for (const spec of this.chunks.get(key) ?? []) if (spec.id) this.byId.delete(spec.id);
    }
    for (let cy = cy0; cy <= cy1; cy++) {
      for (let cx = cx0; cx <= cx1; cx++) {
        const key = chunkKey(cx, cy);
        if (this.live.has(key)) continue;
        const specs = this.chunks.get(key);
        if (!specs) continue;
        this.live.set(key, specs.map((s) => this.create(s)));
      }
    }
  }

  private create(s: ImageSpec): Phaser.GameObjects.Image {
    const img = this.scene.add
      .image(s.x, s.y, s.key)
      .setOrigin(s.originX, s.originY)
      .setDepth(s.depth)
      .setScale(hdScale(this.scene, s.key));
    if (s.id) this.byId.set(s.id, img);
    return img;
  }
}

function chunkKey(cx: number, cy: number): number {
  return (cy + 1000) * 4096 + (cx + 1000);
}

function fromKey(key: number): { cx: number; cy: number } {
  return { cx: (key % 4096) - 1000, cy: Math.floor(key / 4096) - 1000 };
}
