import Phaser from 'phaser';
import { MAPS, type MapKey } from '../data/maps';
import { mapCacheKey } from '../scenes/PreloadScene';
import {
  clampZoom,
  minimapFromTmj,
  playerWorldTile,
  worldBounds,
  worldPlacements,
  type WorldPlacement,
  type WorldRect,
} from '../systems/WorldMapSystem';
import { inkText, UI_COLORS, UI_FONT } from './uiStyle';
import { woodPanel, skinButton } from './uiSkin';

const TEXTURE_KEY = 'worldmap';
const MARGIN = 16;
const HEADER = 40;
/** Tiles of empty sea/land drawn around the outermost maps. */
const BORDER_TILES = 6;
const BACKDROP = 0x2a5a74;
const ZOOM_STEP = 1.35;

interface TmjJson {
  width: number;
  height: number;
  layers: { name: string; data?: number[]; objects?: TmjObject[] }[];
}

interface TmjObject {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties?: { name: string; value: unknown }[];
}

/** A landmark or town (safe zone) named on the map, in world tiles. */
interface PlaceLabel {
  text: Phaser.GameObjects.Text;
  x: number;
  y: number;
}

/**
 * Full-screen map of every region you can walk to, opened by clicking the
 * minimap. Mouse wheel, the +/− buttons or a two-finger pinch zoom; dragging
 * pans; ⌖ jumps back to the player, shown as a blinking red dot.
 */
export class WorldMap {
  private readonly root: Phaser.GameObjects.Container;
  private readonly image: Phaser.GameObjects.Image;
  private readonly labels: Phaser.GameObjects.Text[] = [];
  private places: PlaceLabel[] = [];
  private readonly marker: Phaser.GameObjects.Arc;
  private readonly hereText: Phaser.GameObjects.Text;
  private readonly loading: Phaser.GameObjects.Text;
  private readonly view: WorldRect;
  private placements: WorldPlacement[] = [];
  private bounds: WorldRect = { x: 0, y: 0, width: 1, height: 1 };
  /** Screen pixels per world tile, and the world tile shown at the view's centre. */
  private zoom = 4;
  private fitZoom = 1;
  private centerX = 0;
  private centerY = 0;
  private player: { x: number; y: number } | null = null;
  private drag: { x: number; y: number } | null = null;
  private pinchDistance = 0;
  onClosed?: () => void;

  constructor(private readonly scene: Phaser.Scene, depth: number) {
    const w = scene.scale.width;
    const h = scene.scale.height;
    this.view = { x: MARGIN + 10, y: MARGIN + HEADER, width: w - MARGIN * 2 - 20, height: h - MARGIN * 2 - HEADER - 10 };
    this.root = scene.add.container(0, 0).setDepth(depth).setVisible(false);

    const shade = scene.add.rectangle(0, 0, w, h, 0x000000, 0.55).setOrigin(0, 0).setInteractive();
    const frame = woodPanel(scene, MARGIN, MARGIN, w - MARGIN * 2, h - MARGIN * 2);
    const v = this.view;
    const sea = scene.add.rectangle(v.x, v.y, v.width, v.height, BACKDROP).setOrigin(0, 0).setInteractive({ draggable: false });
    this.image = scene.add.image(0, 0, '__DEFAULT').setOrigin(0, 0);
    const maskShape = scene.make.graphics({}).fillStyle(0xffffff).fillRect(v.x, v.y, v.width, v.height);
    this.image.setMask(maskShape.createGeometryMask());
    this.marker = scene.add.circle(0, 0, 5, 0xe8402a).setStrokeStyle(2, 0xffffff);
    scene.tweens.add({ targets: this.marker, scale: 1.5, alpha: 0.5, duration: 500, yoyo: true, repeat: -1 });
    this.hereText = inkText(scene, 0, 0, 'Bạn ở đây', 12, '#fff2d0').setOrigin(0.5, 1).setStroke('#2b1a10', 3);

    const title = inkText(scene, MARGIN + 18, MARGIN + 12, 'Bản đồ miền Trung', 18);
    const hint = scene.add
      .text(w / 2, MARGIN + 22, 'Lăn chuột / chụm hai ngón hoặc nút +/− để phóng to · kéo để di chuyển', {
        fontFamily: UI_FONT,
        fontSize: '12px',
        color: UI_COLORS.inkSoft,
      })
      .setOrigin(0.5);
    this.loading = inkText(scene, w / 2, h / 2, 'Đang vẽ bản đồ…', 18, '#fff2d0').setOrigin(0.5).setVisible(false);
    this.root.add([shade, frame, sea, this.image, this.marker, this.hereText, title, hint, this.loading]);

    const buttons: [string, () => void][] = [
      ['✕', () => this.close()],
      ['⌖', () => this.centerOnPlayer()],
      ['−', () => this.zoomBy(1 / ZOOM_STEP)],
      ['+', () => this.zoomBy(ZOOM_STEP)],
    ];
    buttons.forEach(([text, action], i) => {
      const x = w - MARGIN - 30 - i * 38;
      const box = scene.add.rectangle(x, MARGIN + 22, 32, 28, UI_COLORS.wood).setStrokeStyle(2, UI_COLORS.edge).setInteractive({ useHandCursor: true });
      box.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, e: Phaser.Types.Input.EventData) => {
        e.stopPropagation();
        action();
      });
      const art = skinButton(box);
      this.root.add([box, ...(art ? [art] : []), scene.add.text(x, MARGIN + 22, text, { fontFamily: UI_FONT, fontSize: '17px', color: '#fff2d0', fontStyle: 'bold' }).setOrigin(0.5).setStroke('#2b1a10', 3)]);
    });

    sea.on('pointerdown', (p: Phaser.Input.Pointer) => (this.drag = { x: p.x, y: p.y }));
    scene.input.on('pointerup', () => (this.drag = null));
    scene.input.on('pointermove', (p: Phaser.Input.Pointer) => this.onPointerMove(p));
    scene.input.on('wheel', (p: Phaser.Input.Pointer, _o: unknown, _dx: number, dy: number) => {
      if (this.isOpen && this.inView(p.x, p.y)) this.zoomBy(dy > 0 ? 1 / ZOOM_STEP : ZOOM_STEP, p.x, p.y);
    });
    scene.input.addPointer(1); // a second finger for pinch zoom
  }

  get isOpen(): boolean {
    return this.root.visible;
  }

  /** Opens the map centred on the player (mapKey/tile = where they stand now). */
  open(mapKey: string, tileX: number, tileY: number): void {
    // The first time, fetch the province maps that aren't loaded (only the current one is),
    // draw the overview once, then let the big map files go again.
    const missing = worldPlacements(() => ({ width: 1, height: 1 }))
      .map((p) => p.key)
      .filter((key) => !this.scene.textures.exists(TEXTURE_KEY) && !this.tmj(key));
    if (missing.length > 0) {
      this.loading.setVisible(true);
      this.root.setVisible(true);
      this.scene.load.setPath('assets');
      for (const key of missing) this.scene.load.tilemapTiledJSON(mapCacheKey(MAPS[key].file), `maps/${MAPS[key].file}.tmj`);
      this.scene.load.once('complete', () => {
        this.loading.setVisible(false);
        this.open(mapKey, tileX, tileY);
        for (const key of missing) if (key !== mapKey) this.scene.cache.tilemap.remove(mapCacheKey(MAPS[key].file));
      });
      this.scene.load.start();
      return;
    }
    this.buildTexture();
    this.player = playerWorldTile(mapKey, tileX, tileY);
    const v = this.view;
    this.fitZoom = Math.min(v.width / this.bounds.width, v.height / this.bounds.height);
    this.zoom = clampZoom(Math.max(this.fitZoom * 2, 4), this.fitZoom);
    this.root.setVisible(true);
    this.centerOnPlayer();
  }

  close(): void {
    if (!this.isOpen) return;
    this.root.setVisible(false);
    this.drag = null;
    this.onClosed?.();
  }

  /** Called every frame while open: handles a two-finger pinch. */
  update(): void {
    if (!this.isOpen) return;
    const a = this.scene.input.pointer1;
    const b = this.scene.input.pointer2;
    if (a?.isDown && b?.isDown) {
      const d = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
      if (this.pinchDistance > 0 && d > 0) this.zoomBy(d / this.pinchDistance, (a.x + b.x) / 2, (a.y + b.y) / 2);
      this.pinchDistance = d;
      this.drag = null;
    } else {
      this.pinchDistance = 0;
    }
  }

  private buildTexture(): void {
    this.placements = worldPlacements((key) => {
      const tmj = this.tmj(key);
      return { width: tmj?.width ?? 1, height: tmj?.height ?? 1 };
    });
    const b = worldBounds(this.placements);
    this.bounds = { x: b.x - BORDER_TILES, y: b.y - BORDER_TILES, width: b.width + BORDER_TILES * 2, height: b.height + BORDER_TILES * 2 };
    if (!this.scene.textures.exists(TEXTURE_KEY)) {
      const canvas = this.scene.textures.createCanvas(TEXTURE_KEY, this.bounds.width, this.bounds.height);
      const ctx = canvas?.getContext();
      if (canvas && ctx) {
        for (const p of this.placements) {
          const tmj = this.tmj(p.key);
          if (!tmj) continue;
          const data = minimapFromTmj(tmj);
          const img = ctx.createImageData(data.width, data.height);
          data.colors.forEach((c, i) => {
            img.data.set([(c >> 16) & 255, (c >> 8) & 255, c & 255, 255], i * 4);
          });
          ctx.putImageData(img, p.x - this.bounds.x, p.y - this.bounds.y);
        }
        canvas.refresh();
      }
    }
    this.image.setTexture(TEXTURE_KEY);
    this.labels.forEach((l) => l.destroy());
    this.labels.length = 0;
    for (const p of this.placements) {
      const label = inkText(this.scene, 0, 0, p.label, 13, '#fff2d0').setOrigin(0.5).setStroke('#2b1a10', 4);
      this.labels.push(label);
      this.root.addAt(label, this.root.getIndex(this.marker));
    }
    this.places.forEach((l) => l.text.destroy());
    this.places = [];
    for (const p of this.placements) {
      const objects = this.tmj(p.key)?.layers.find((l) => l.name === 'objects')?.objects ?? [];
      for (const o of objects) {
        const name = o.name === 'zone' ? o.properties?.find((q) => q.name === 'zoneName')?.value : undefined;
        if (typeof name !== 'string') continue;
        const text = inkText(this.scene, 0, 0, `◆ ${name}`, 11, '#ffe6a8').setOrigin(0.5).setStroke('#2b1a10', 3);
        this.root.addAt(text, this.root.getIndex(this.marker));
        this.places.push({ text, x: p.x + (o.x + o.width / 2) / 16, y: p.y + (o.y + o.height / 2) / 16 });
      }
    }
  }

  private tmj(key: MapKey): TmjJson | undefined {
    const entry = this.scene.cache.tilemap.get(mapCacheKey(MAPS[key].file)) as { data?: TmjJson } | undefined;
    return entry?.data;
  }

  private centerOnPlayer(): void {
    const target = this.player ?? { x: this.bounds.x + this.bounds.width / 2, y: this.bounds.y + this.bounds.height / 2 };
    this.centerX = target.x;
    this.centerY = target.y;
    this.layout();
  }

  /** Zooms keeping the world point under (sx, sy) in place (default: the view's centre). */
  private zoomBy(factor: number, sx?: number, sy?: number): void {
    const v = this.view;
    const px = sx ?? v.x + v.width / 2;
    const py = sy ?? v.y + v.height / 2;
    const before = this.toWorld(px, py);
    this.zoom = clampZoom(this.zoom * factor, this.fitZoom);
    const after = this.toWorld(px, py);
    this.centerX += before.x - after.x;
    this.centerY += before.y - after.y;
    this.layout();
  }

  private onPointerMove(p: Phaser.Input.Pointer): void {
    if (!this.isOpen || !this.drag || !p.isDown) return;
    this.centerX -= (p.x - this.drag.x) / this.zoom;
    this.centerY -= (p.y - this.drag.y) / this.zoom;
    this.drag = { x: p.x, y: p.y };
    this.layout();
  }

  private inView(x: number, y: number): boolean {
    const v = this.view;
    return x >= v.x && x <= v.x + v.width && y >= v.y && y <= v.y + v.height;
  }

  private toWorld(sx: number, sy: number): { x: number; y: number } {
    const v = this.view;
    return { x: this.centerX + (sx - (v.x + v.width / 2)) / this.zoom, y: this.centerY + (sy - (v.y + v.height / 2)) / this.zoom };
  }

  private toScreen(wx: number, wy: number): { x: number; y: number } {
    const v = this.view;
    return { x: v.x + v.width / 2 + (wx - this.centerX) * this.zoom, y: v.y + v.height / 2 + (wy - this.centerY) * this.zoom };
  }

  /** Keeps the world in view, then places the picture, labels and the player marker. */
  private layout(): void {
    const b = this.bounds;
    const halfW = this.view.width / 2 / this.zoom;
    const halfH = this.view.height / 2 / this.zoom;
    this.centerX = b.width / 2 <= halfW ? b.x + b.width / 2 : Phaser.Math.Clamp(this.centerX, b.x + halfW, b.x + b.width - halfW);
    this.centerY = b.height / 2 <= halfH ? b.y + b.height / 2 : Phaser.Math.Clamp(this.centerY, b.y + halfH, b.y + b.height - halfH);
    const origin = this.toScreen(b.x, b.y);
    this.image.setPosition(origin.x, origin.y).setScale(this.zoom);
    this.placements.forEach((p, i) => {
      const at = this.toScreen(p.x + p.width / 2, p.y + p.height / 2);
      this.labels[i]?.setPosition(at.x, at.y).setVisible(this.inView(at.x, at.y));
    });
    // Landmark names once zoomed in enough for them not to pile up on each other.
    const showPlaces = this.zoom >= this.fitZoom * 1.6;
    for (const l of this.places) {
      const at = this.toScreen(l.x, l.y);
      l.text.setPosition(at.x, at.y).setVisible(showPlaces && this.inView(at.x, at.y));
    }
    const here = this.player ? this.toScreen(this.player.x + 0.5, this.player.y + 0.5) : null;
    const show = !!here && this.inView(here.x, here.y);
    this.marker.setVisible(show);
    this.hereText.setVisible(show);
    if (here) {
      this.marker.setPosition(here.x, here.y);
      this.hereText.setPosition(here.x, here.y - 9);
    }
  }
}
