import type Phaser from 'phaser';
import { TILE } from '../config/constants';
import { NPC_CONFIG } from '../systems/npc/config';
import type { FamilyState } from '../systems/npc/types';
import { artScale } from './hd';
import type { FamilyGeo } from './npcWorld';

/** How fast the buffalo ambles about its grazing ground (px a second). */
const GRAZE_SPEED = 7;

/**
 * A family's animals: chickens and pigs about the yard by day; the buffalo
 * (or cow) by the haystack at home, led on a rope, or wandering within its
 * radius of the grazing ground while it is out.
 */
export class HouseAnimals {
  private yard: Phaser.GameObjects.Sprite[] = [];
  beast?: Phaser.GameObjects.Sprite;
  private target?: { x: number; y: number; until: number };

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly geo: FamilyGeo,
    private readonly grazable: (x: number, y: number) => boolean,
  ) {}

  update(time: number, delta: number, daytime: boolean, fam: FamilyState, led: { x: number; y: number; flip: boolean } | null): void {
    const h = this.geo.home;
    if (daytime && !this.yard.length) {
      const kinds = [...(fam.livestock.includes('chicken') ? ['animal_chicken', 'animal_chicken', 'animal_chicken', 'animal_chicken'] : []), ...(fam.livestock.includes('pig') ? ['animal_pig', 'animal_pig'] : [])];
      this.yard = kinds.filter((k) => this.scene.textures.exists(k)).map((k) => this.add(k));
    }
    if (!daytime) this.hideYard();
    this.yard.forEach((c, i) => {
      const pig = c.texture.key === 'animal_pig';
      const t = time / 1000 / (pig ? 6 + i : 3 + i) + i * 2.1;
      const x = (h.x0 + (pig ? 15 : 12) + Math.sin(t) * (pig ? 1.5 : 3) + (i % 2) * 2) * TILE;
      const y = (h.y0 + (pig ? 15 : 13) + Math.cos(t * 0.7) * 1.5 + (i > 1 ? 1 : 0)) * TILE;
      c.setPosition(x, y).setDepth(y).setFlipX(Math.cos(t) < 0).setFrame(Math.floor(time / 300 + i) % 2);
    });
    this.updateBeast(time, delta, daytime, fam, led);
  }

  private updateBeast(time: number, delta: number, daytime: boolean, fam: FamilyState, led: { x: number; y: number; flip: boolean } | null): void {
    const b = fam.buffalo;
    const h = this.geo.home;
    const atHome = !b || b.at === 'home';
    if (!b || (atHome && !daytime) || (b.at === null && !led)) return this.hideBeast();
    this.beast ??= this.add(`animal_${h.livestock || 'buffalo'}`);
    const s = this.beast;
    if (b.ledBy && led) {
      s.setPosition(led.x, led.y).setDepth(led.y).setFlipX(led.flip).setFrame(Math.floor(time / 300) % 2);
      this.target = undefined;
      return;
    }
    if (atHome) {
      s.setPosition((h.x0 + 16) * TILE, (h.y0 + 10) * TILE).setFlipX(true).setFrame(0).setDepth((h.y0 + 10) * TILE);
      return;
    }
    // Out to graze: amble to a spot within the radius, crop the grass a while, move on.
    const c = this.geo.spots.pasture;
    const cx = c.x * TILE + TILE / 2;
    const cy = c.y * TILE + TILE - 2;
    if (!this.target || Math.hypot(s.x - cx, s.y - cy) > NPC_CONFIG.buffalo.wanderRadiusTiles * TILE * 1.2) {
      if (!this.target) s.setPosition(cx, cy);
      this.target = { x: cx, y: cy, until: time + 8000 };
    }
    const t = this.target;
    const dx = t.x - s.x;
    const dy = t.y - s.y;
    const d = Math.hypot(dx, dy);
    if (d > 1) {
      const step = Math.min(d, (GRAZE_SPEED * delta) / 1000);
      s.setPosition(s.x + (dx / d) * step, s.y + (dy / d) * step).setFlipX(dx < 0).setFrame(Math.floor(time / 600) % 2);
    } else if (time > t.until) {
      this.target = this.pickSpot(cx, cy, time);
    } else s.setFrame(0);
    s.setDepth(s.y);
  }

  /** A grassy spot within the grazing radius (a few tries, else back to the middle). */
  private pickSpot(cx: number, cy: number, time: number): { x: number; y: number; until: number } {
    const r = NPC_CONFIG.buffalo.wanderRadiusTiles * TILE;
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.random() * r; // mostly near the middle, sometimes out to the edge
      const x = cx + Math.cos(a) * d;
      const y = cy + Math.sin(a) * d;
      if (this.grazable(Math.floor(x / TILE), Math.floor(y / TILE))) return { x, y, until: time + 6000 + Math.random() * 14000 };
    }
    return { x: cx, y: cy, until: time + 8000 };
  }

  hide(): void {
    this.hideYard();
    this.hideBeast();
  }

  private hideYard(): void {
    this.yard.forEach((c) => c.destroy());
    this.yard = [];
  }

  private hideBeast(): void {
    this.beast?.destroy();
    this.beast = undefined;
    this.target = undefined;
  }

  private add(key: string): Phaser.GameObjects.Sprite {
    const k = this.scene.textures.exists(key) ? artScale(this.scene, key) : 1;
    return this.scene.add.sprite(0, 0, key, 0).setOrigin(0.5, 1).setScale(1 / k);
  }
}
