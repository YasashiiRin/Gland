import type Phaser from 'phaser';
import groundTextures from '../data/groundTextures.json';

export const GROUND_LOOK_TEXTURE = 'ground_hd';

interface GroundTextures {
  tile: number;
  block: number;
  columns: number;
  /** Tiled gid of a ground tile -> its row of block tiles in ground_hd.png. */
  rows: Record<string, number>;
}

const DATA: GroundTextures = groundTextures;

interface TiledTileset {
  firstgid?: number;
  tilecount?: number;
  name?: string;
}

/**
 * Adds the painted-ground tileset to a cached Tiled map JSON (once), after
 * the map's own tilesets, so Phaser builds it with the map.
 */
export function addGroundLookTileset(json: { tilesets?: TiledTileset[] }): void {
  const sets = json.tilesets ?? [];
  if (sets.some((t) => t.name === GROUND_LOOK_TEXTURE)) return;
  const firstgid = Math.max(1, ...sets.map((t) => (t.firstgid ?? 1) + (t.tilecount ?? 0)));
  const count = DATA.columns * Math.max(1, ...Object.values(DATA.rows).map((r) => r + 1));
  sets.push({
    firstgid,
    name: GROUND_LOOK_TEXTURE,
    image: 'tilesets/ground_hd.png',
    tilewidth: DATA.tile,
    tileheight: DATA.tile,
    tilecount: count,
    columns: DATA.columns,
    imagewidth: DATA.tile * DATA.columns,
    imageheight: (count / DATA.columns) * DATA.tile,
    margin: 0,
    spacing: 0,
  } as TiledTileset);
  json.tilesets = sets;
}

/**
 * The painted ground (scripts/art/import_assets.py): a picture of grass,
 * water, earth… is too detailed for one tile, so it is cut into a block of
 * 6 x 6 tiles and each map tile shows the piece for its place in the block.
 * This is only a look: it is a layer drawn over the real ground layer, which
 * keeps the tile ids that the game logic reads (collisions, tilling, water).
 */
export class GroundLook {
  private readonly layer: Phaser.Tilemaps.TilemapLayer | null;
  private readonly firstGid: number;

  constructor(
    map: Phaser.Tilemaps.Tilemap,
    private readonly ground: Phaser.Tilemaps.TilemapLayer,
    depth: number,
  ) {
    const hasArt = ground.scene.textures.exists(GROUND_LOOK_TEXTURE) && Object.keys(DATA.rows).length > 0;
    const tileset = hasArt && map.getTileset(GROUND_LOOK_TEXTURE) ? map.addTilesetImage(GROUND_LOOK_TEXTURE, GROUND_LOOK_TEXTURE) : null;
    this.firstGid = tileset?.firstgid ?? 0;
    this.layer = tileset ? map.createBlankLayer(`${ground.layer.name}_look`, tileset, ground.x, ground.y) : null;
    if (!this.layer) return;
    this.layer.setScale(ground.scaleX, ground.scaleY).setDepth(depth);
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) this.sync(x, y);
    }
  }

  /** Redraws the look of one tile after the ground tile there changed (or its tint). */
  sync(x: number, y: number): void {
    if (!this.layer) return;
    const tile = this.ground.getTileAt(x, y);
    const row = tile ? DATA.rows[String(tile.index)] : undefined;
    if (row === undefined || !tile) {
      if (this.layer.getTileAt(x, y)) this.layer.removeTileAt(x, y);
      return;
    }
    const piece = (y % DATA.block) * DATA.block + (x % DATA.block);
    const look = this.layer.putTileAt(this.firstGid + row * DATA.columns + piece, x, y);
    look.tint = tile.tint;
  }

  /** Puts a ground tile and its look. */
  put(index: number, x: number, y: number): Phaser.Tilemaps.Tile {
    const t = this.ground.putTileAt(index, x, y);
    this.sync(x, y);
    return t;
  }

  destroy(): void {
    this.layer?.destroy();
  }
}
