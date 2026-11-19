import type Phaser from 'phaser';
import { TILE_GID } from '../config/tileGids';
import { gameState } from '../state/GameState';
import { pathLook, type GroundEdit } from '../systems/GroundSystem';
import type { GroundLook } from './groundLook';

const EDGE_FIRST = TILE_GID.PATH_EDGE_FIRST;
/** How see-through the grass creeping back over a bare tile is. */
const FAINT_ALPHA = 0.5;

/** A path tile of the map or of the player (any edge variant). */
export function isPathGid(gid: number | undefined): boolean {
  return gid === TILE_GID.PATH || (gid !== undefined && gid >= EDGE_FIRST && gid < EDGE_FIRST + 16);
}

/**
 * Draws the dirt paths and paving the player made in the grass (GroundSystem):
 * paths join up with their neighbours and the map's own paths, faint grass
 * shows over a path (or an empty plot) going back to grass.
 */
export class GroundPaths {
  constructor(
    private readonly mapKey: string,
    private readonly look: GroundLook,
    private readonly ground: Phaser.Tilemaps.TilemapLayer,
    private readonly decor: Phaser.Tilemaps.TilemapLayer,
  ) {}

  key(x: number, y: number): string {
    return `${this.mapKey}:${x},${y}`;
  }

  edit(x: number, y: number): GroundEdit | undefined {
    return gameState.groundEdits[this.key(x, y)];
  }

  /** Every path of this map (on entering it). */
  drawAll(today: number): void {
    const prefix = `${this.mapKey}:`;
    const tiles: { x: number; y: number }[] = [];
    for (const [key, e] of Object.entries(gameState.groundEdits)) {
      if (!key.startsWith(prefix)) continue;
      const [x, y] = key.slice(prefix.length).split(',').map(Number);
      this.paint(x, y, e, today);
      tiles.push({ x, y });
    }
    for (const t of tiles) this.retileAround(t.x, t.y);
  }

  /** One tile changed (or was removed: `fallback` is what lies there then). */
  redraw(x: number, y: number, today: number, fallback: number = TILE_GID.GRASS): void {
    const e = this.edit(x, y);
    if (e) this.paint(x, y, e, today);
    else {
      this.setFaint(x, y, false);
      if (isPathGid(this.ground.getTileAt(x, y)?.index) || this.ground.getTileAt(x, y)?.index === TILE_GID.PAVING) this.look.put(fallback, x, y);
    }
    this.retileAround(x, y);
  }

  /** Faint grass over a bare tile going back to grass (a see-through grass tile on the decor layer). */
  setFaint(x: number, y: number, on: boolean): void {
    const d = this.decor.getTileAt(x, y);
    if (on) {
      if (d && d.index !== TILE_GID.GRASS) return; // something else stands there
      this.decor.putTileAt(TILE_GID.GRASS, x, y).alpha = FAINT_ALPHA;
    } else if (d?.index === TILE_GID.GRASS) this.decor.removeTileAt(x, y);
  }

  /** Is the decor here just faint grass (it doesn't get in the way of tools)? */
  isFaint(x: number, y: number): boolean {
    return this.decor.getTileAt(x, y)?.index === TILE_GID.GRASS;
  }

  private paint(x: number, y: number, e: GroundEdit, today: number): void {
    const look = pathLook(e, today);
    this.look.put(look === 'stone' ? TILE_GID.PAVING : TILE_GID.PATH, x, y);
    this.setFaint(x, y, look === 'faint');
  }

  /** Edge variants for a path tile and its neighbours, so paths join up. */
  private retileAround(x: number, y: number): void {
    for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) this.retile(x + dx, y + dy);
  }

  private retile(x: number, y: number): void {
    const gid = this.ground.getTileAt(x, y)?.index;
    if (!isPathGid(gid)) return;
    const pathy = (tx: number, ty: number) => {
      const g = this.ground.getTileAt(tx, ty)?.index;
      return g === undefined || isPathGid(g) || g === TILE_GID.DIRT;
    };
    const mask = (pathy(x, y - 1) ? 0 : 1) | (pathy(x + 1, y) ? 0 : 2) | (pathy(x, y + 1) ? 0 : 4) | (pathy(x - 1, y) ? 0 : 8);
    const want = mask === 0 ? TILE_GID.PATH : EDGE_FIRST + mask;
    if (want !== gid) this.look.put(want, x, y);
  }
}
