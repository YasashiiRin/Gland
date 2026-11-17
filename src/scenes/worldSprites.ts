import Phaser from 'phaser';
import { TILE } from '../config/constants';
import { BIOME_TREE_TEXTURES, isTreeGid, TILE_GID } from '../config/tileGids';
import { ChunkedImages } from './chunkedImages';

/**
 * Tree sprite keys (generated into public/assets/sprites/trees, loaded via
 * pack.json). The border forest is mostly bamboo hedges and areca palms, as
 * around a Vietnamese village; choppable trees are broadleaf or banana.
 */
const FOREST_TEXTURES: readonly string[] = ['tree_bamboo', 'tree_bamboo', 'tree_areca', 'tree_bamboo', 'tree_oak_1'];
const CHOPPABLE_TEXTURES = ['tree_oak_0', 'tree_oak_1', 'tree_banana'] as const;
/** Where the trunk base sits inside the 48x64 tree sprite. */
const TREE_BASE_Y = 60;
const TREE_HEIGHT = 64;

/** Depths for props that should never cover the player. */
const DEPTH_FLOOR_PROP = -1.5; // rugs: above the ground layer, under everything else
const DEPTH_WALL_PROP = -0.5; // windows/paintings: on top of wall tiles

export function readProp(obj: Phaser.Types.Tilemaps.TiledObject, name: string): string | undefined {
  const props = obj.properties as { name: string; value: unknown }[] | undefined;
  const found = props?.find((p) => p.name === name);
  return typeof found?.value === 'string' ? found.value : undefined;
}

function tileHash(x: number, y: number): number {
  return (Math.imul(x, 73856093) ^ Math.imul(y, 19349663)) >>> 0;
}

/**
 * Every "prop" object of a map (buildings, furniture, the shipping bin): the
 * sprite `prop_<sprite>` is bottom-aligned and centred on the object's
 * footprint and depth-sorted by that bottom edge, like the player. Drawn
 * near the camera only (call update() each frame).
 */
export function createProps(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap): ChunkedImages {
  const images = new ChunkedImages(scene);
  for (const o of map.getObjectLayer('objects')?.objects ?? []) {
    if (o.name !== 'prop') continue;
    const key = `prop_${readProp(o, 'sprite') ?? ''}`;
    if (!scene.textures.exists(key)) {
      console.warn(`Missing prop sprite "${key}"`);
      continue;
    }
    const x = (o.x ?? 0) + (o.width ?? 0) / 2;
    const bottom = (o.y ?? 0) + (o.height ?? 0);
    const layer = readProp(o, 'layer');
    const depth = layer === 'floor' ? DEPTH_FLOOR_PROP : layer === 'wall' ? DEPTH_WALL_PROP : bottom - 2;
    images.add({ x, y: bottom, key, originX: 0.5, originY: 1, depth });
  }
  return images;
}

/**
 * Big tree sprites standing on every TRUNK (choppable), FOREST (border) and
 * ORCHARD tile of the decor layer. The tile itself is invisible and only
 * provides collision; the sprite fades out while the player walks behind its
 * canopy. Only trees near the camera exist at any time (see ChunkedImages).
 */
export class TreeSprites {
  private readonly images: ChunkedImages;

  /** `looks` picks the map's own border-forest and orchard sprites (see maps.json). */
  constructor(
    private readonly scene: Phaser.Scene,
    decor: Phaser.Tilemaps.TilemapLayer,
    looks: { forestTrees?: readonly string[]; orchardTree?: string } = {},
  ) {
    this.images = new ChunkedImages(scene);
    decor.forEachTile((tile) => {
      if (!isTreeGid(tile.index)) return;
      const h = tileHash(tile.x, tile.y);
      const forest = tile.index === TILE_GID.FOREST;
      const pool: readonly string[] =
        BIOME_TREE_TEXTURES[tile.index] !== undefined
          ? [BIOME_TREE_TEXTURES[tile.index]]
          : tile.index === TILE_GID.ORCHARD
          ? [looks.orchardTree ?? 'tree_oak_0']
          : forest
            ? (looks.forestTrees ?? FOREST_TEXTURES)
            : CHOPPABLE_TEXTURES;
      const texture = pool[h % pool.length];
      if (!scene.textures.exists(texture)) return;
      const jitterX = forest ? (h % 7) - 3 : 0;
      const baseY = tile.y * TILE + TILE - 2;
      this.images.add({
        x: tile.x * TILE + TILE / 2 + jitterX,
        y: baseY,
        key: texture,
        originX: 0.5,
        originY: TREE_BASE_Y / TREE_HEIGHT,
        depth: baseY,
        id: `${tile.x},${tile.y}`,
      });
    });
  }

  /** A quick sideways shake when an axe hits but the tree doesn't fall yet. */
  shake(x: number, y: number): void {
    const sprite = this.images.get(`${x},${y}`);
    if (!sprite) return;
    const baseX = x * TILE + TILE / 2;
    this.scene.tweens.add({ targets: sprite, x: baseX + 1.5, duration: 45, yoyo: true, repeat: 2, onComplete: () => sprite.setX(baseX) });
  }

  /** The tree topples (tilts and fades) and its sprite is removed. */
  fell(x: number, y: number, towardRight: boolean): void {
    const sprite = this.images.remove(`${x},${y}`);
    if (!sprite) return;
    this.scene.tweens.add({
      targets: sprite,
      angle: towardRight ? 80 : -80,
      alpha: 0,
      duration: 650,
      ease: 'Quad.easeIn',
      onComplete: () => sprite.destroy(),
    });
  }

  /**
   * Each frame: keeps the trees around the camera alive, and makes them
   * see-through while the player (feet at px,py) is behind their canopy.
   */
  update(view: Phaser.Geom.Rectangle, px: number, py: number): void {
    this.images.update(view);
    for (const sprite of this.images.images()) {
      const behind = Math.abs(sprite.x - px) < 20 && py < sprite.y - 4 && py > sprite.y - 56;
      const alpha = behind ? 0.45 : 1;
      if (sprite.alpha !== alpha) sprite.setAlpha(alpha);
    }
  }
}
