import type Phaser from 'phaser';
import { TILE } from '../config/constants';
import { DAY_LENGTH_MINUTES } from '../config/time';
import { gameState } from '../state/GameState';
import { findPath, type TilePath } from '../systems/gridPath';
import { currentJob, type FieldJob } from '../systems/NpcFarmSystem';
import { absoluteMinute } from '../systems/StatsSystem';
import { clockMinuteOfDay } from '../systems/TimeSystem';
import { adultDoing, phaseAt, type Doing } from '../systems/VillagerSchedule';
import { FOLK_KEYS, createFolkAnims } from './ambientLife';
import { artScale, hdScale } from './hd';
import type { Homestead } from './homesteads';
import { swingTool } from './toolSwing';
import { HouseAnimals } from './villageAnimals';
import type { PaddyWork, VillageFields } from './villageFields';

const ACTIVE_TILES = 46;
const WALK = 22;
/** A game minute lasts 0.7 s: how far a villager walks in one (px). */
const PX_PER_GAME_MINUTE = WALK * 0.7;
const TOOL: Partial<Record<FieldJob, 'hoe' | 'watering_can' | 'scythe'>> = { hoe: 'hoe', water: 'watering_can', harvest: 'scythe' };
const DIRS = ['down', 'left', 'right', 'up'];

interface Person {
  key: string;
  child: boolean;
  index: number;
  doing?: string;
  progress: number;
  sprite?: Phaser.GameObjects.Sprite;
  load?: Phaser.GameObjects.Image;
  nextMove: number;
}

interface Household {
  home: Homestead;
  work?: PaddyWork;
  people: Person[];
  animals: HouseAnimals;
  route?: TilePath | null;
}

/**
 * The people of the village homesteads (rules: VillagerSchedule.adultDoing and
 * NpcFarmSystem). Out to the household's own paddy at 5:30 to do whatever it
 * needs - hoe, sow, water, fertilise, harvest, carry the sheaves home one by
 * one - resting by the road between spells. Once it's done, one minds the
 * buffalo or cow while the other goes to market; or they rest and walk home.
 * Tea at the yard table till dusk. Children go to school, then play.
 */
export class Villagers {
  private readonly households: Household[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly ground: Phaser.Tilemaps.TilemapLayer,
    private readonly decor: Phaser.Tilemaps.TilemapLayer,
    homesteads: Homestead[],
    private readonly fields: VillageFields,
    taken: (h: Homestead) => boolean,
  ) {
    createFolkAnims(scene);
    homesteads.forEach((home, n) => {
      if (home.vacant || home.members < 1 || taken(home)) return;
      const people: Person[] = [];
      const adults = home.members >= 3 ? 2 : 1;
      for (let i = 0; i < adults; i++) people.push({ key: FOLK_KEYS[((n * 2) % 3) + (i ? 3 : 0)], child: false, index: i, progress: 0, nextMove: 0 });
      if (home.members >= 3) people.push({ key: FOLK_KEYS[4], child: true, index: 2, progress: 0, nextMove: 0 });
      this.households.push({ home, work: fields.works.find((w) => w.paddy.key === home.key), people, animals: new HouseAnimals(scene, home) });
    });
  }

  update(time: number, delta: number, view: Phaser.Geom.Rectangle): void {
    const clock = clockMinuteOfDay(gameState.time);
    const now = absoluteMinute(gameState.time);
    const today = Math.floor(now / DAY_LENGTH_MINUTES);
    const near = (x: number, y: number) => Math.max(Math.abs(x - view.centerX / TILE), Math.abs(y - view.centerY / TILE)) < ACTIVE_TILES;
    for (const h of this.households) {
      const pad = h.work?.paddy;
      if (!near(h.home.gate.x, h.home.gate.y) && !(pad && near(pad.bridgeX, pad.roadY))) {
        this.sleep(h);
        continue;
      }
      if (h.route === undefined && pad) {
        h.route = findPath(h.home.gate, this.walkable, (x, y) => x === pad.bridgeX && y === pad.roadY, 80000);
      }
      const f = pad ? this.fields.state(pad.key) : null;
      const job = f ? currentJob(f, today) : null;
      let idleFor: number | null = null;
      if (f && !job) idleFor = f.doneAt >= 0 && Math.floor(f.doneAt / DAY_LENGTH_MINUTES) === today ? now - f.doneAt : Math.max(0, clock - 6 * 60);
      let grazing: { x: number; y: number; flip: boolean } | null = null;
      for (const p of h.people) {
        if (p.child) {
          this.child(h, p, clock, delta, time);
          continue;
        }
        const plan = pad
          ? adultDoing({ index: p.index, clock, hasJob: !!job, idleFor, livestock: !!h.home.livestock, chickens: h.home.feature === 'chickens' })
          : { doing: (clock >= 330 && clock < 18 * 60 ? 'tea' : 'indoors') as Doing, since: 330 };
        this.adult(h, p, plan.doing, plan.since, clock, delta, time, job, f?.haulProgress ?? 0);
        if (plan.doing === 'herd' && p.sprite) grazing = { x: p.sprite.x + 18, y: p.sprite.y, flip: Math.sin(time / 9000) < 0 };
      }
      h.animals.update(time, clock >= 330 && clock < 18 * 60, grazing);
    }
  }

  destroy(): void {
    this.households.forEach((h) => this.sleep(h));
  }

  private sleep(h: Household): void {
    h.people.forEach((p) => this.hide(p));
    h.animals.hide();
  }

  private hide(p: Person): void {
    p.sprite?.destroy();
    p.load?.destroy();
    p.sprite = undefined;
    p.load = undefined;
  }

  private walkable = (x: number, y: number): boolean => {
    const g = this.ground.getTileAt(x, y);
    if (!g || g.collides) return false;
    const d = this.decor.getTileAt(x, y);
    return !d || !d.collides;
  };

  /** How far along a walk the person is (they may already be under way when first seen). */
  private advance(p: Person, doing: string, since: number, clock: number, delta: number): void {
    if (p.doing !== doing) {
      p.progress = Math.max(0, clock - since) * PX_PER_GAME_MINUTE;
      p.doing = doing;
    } else {
      p.progress += WALK * (delta / 1000);
    }
  }

  private adult(h: Household, p: Person, doing: Doing, since: number, clock: number, delta: number, time: number, job: FieldJob | null, haul: number): void {
    this.advance(p, doing, since, clock, delta);
    if (doing === 'indoors' || doing === 'market') return this.hide(p);
    const s = this.spriteOf(p);
    s.setCrop();
    this.carry(p, false);
    const { home } = h;
    const route = h.route ?? null;
    const pad = h.work?.paddy;
    const teaX = (home.x0 + 11) * TILE + (p.index ? 13 : -13);
    const teaY = (home.y0 + 12) * TILE - 2;
    if (doing === 'feedChickens') return this.stand(s, (home.x0 + 13) * TILE, (home.y0 + 14) * TILE, 'right', time, true);
    if (doing === 'tea') return this.sit(s, p, teaX, teaY, p.index ? 'left' : 'right');
    if (!route || !pad) return this.stand(s, home.gate.x * TILE + 8, (home.gate.y - 3) * TILE, 'down', time, false);
    const road = (n: number): TilePath => Array.from({ length: n }, (_, i) => ({ x: pad.bridgeX + i + 1, y: pad.roadY }));
    if (doing === 'toField' && !this.walk(s, p, route, p.progress)) return;
    if (doing === 'toMarket') {
      if (!this.walk(s, p, [...route, ...road(30)], p.progress)) return;
      return this.hide(p); // gone off to market
    }
    if (doing === 'fromMarket') {
      if (!this.walk(s, p, [...road(30)].reverse().concat([...route].reverse()), p.progress)) return;
      return this.sit(s, p, teaX, teaY, p.index ? 'left' : 'right');
    }
    if (doing === 'toHome') {
      if (!this.walk(s, p, [...route].reverse(), p.progress)) return;
      return this.sit(s, p, teaX, teaY, p.index ? 'left' : 'right');
    }
    if (doing === 'restRoad') {
      // Sitting on their own side of the road, by their bridge.
      const side = pad.side === 'north' ? -1 : 1;
      return this.sit(s, p, (pad.bridgeX + (p.index ? 2 : -2)) * TILE + 8, (pad.roadY + side) * TILE + (side < 0 ? TILE - 2 : TILE - 2), side < 0 ? 'up' : 'down');
    }
    if (doing === 'herd') {
      const span = pad.x1 - pad.x0;
      const x = (pad.x0 + span * (0.5 + 0.4 * Math.sin(time / 9000))) * TILE;
      const y = (pad.side === 'north' ? pad.y0 - 2 : pad.y1 + 3) * TILE;
      return this.stand(s, x, y, Math.cos(time / 9000) > 0 ? 'right' : 'left', time, false);
    }
    if (job === 'haul') {
      // To and fro between the sheaves on the roadside and home, one sheaf a trip.
      const phase = (haul + p.index * 0.5) % 1;
      const loaded = phase < 0.5;
      const len = (route.length - 1) * TILE;
      this.walk(s, p, loaded ? [...route].reverse() : route, (loaded ? phase : phase - 0.5) * 2 * len);
      return this.carry(p, loaded);
    }
    this.work(s, p, pad, job, time);
  }

  /** At the work front of the paddy (the row the job has got to), with the right tool. */
  private work(s: Phaser.GameObjects.Sprite, p: Person, pad: PaddyWork['paddy'], job: FieldJob | null, time: number): void {
    const rows = pad.y1 - pad.y0 + 1;
    const f = this.fields.state(pad.key);
    const done = job === 'water' ? f.waterProgress : job === 'fertilize' ? f.fertProgress : f.progress;
    const r = Math.min(rows - 1, Math.floor(done * rows));
    const x = (pad.x0 + Math.round((pad.x1 - pad.x0) * (0.3 + 0.4 * p.index))) * TILE + 8;
    const y = (pad.side === 'north' ? pad.y1 - r : pad.y0 + r) * TILE + TILE - 2;
    const facing = pad.side === 'north' ? 'up' : 'down';
    this.stand(s, x, y, facing, time, false);
    if (time < p.nextMove) return;
    p.nextMove = time + 1300 + p.index * 200;
    const tool = job ? TOOL[job] : undefined;
    if (tool) swingTool(this.scene, s, tool, facing);
    else this.toss(s, job === 'fertilize' ? 0x6a5a40 : 0x8fd16a);
  }

  private child(h: Household, p: Person, clock: number, delta: number, time: number): void {
    const phase = phaseAt('child', clock);
    const doing = phase.activity === 'toSchool' || phase.activity === 'school' ? 'school' : phase.activity === 'indoors' ? 'indoors' : 'yard';
    this.advance(p, doing, phase.since, clock, delta);
    if (doing !== 'yard') return this.hide(p);
    const s = this.spriteOf(p);
    const t = time / 1000 / 5;
    const x = (h.home.x0 + 6 + Math.sin(t) * 3) * TILE;
    const y = (h.home.y0 + 14) * TILE;
    s.setPosition(x, y).setDepth(y);
    const anim = `${p.key}-walk-${Math.cos(t) > 0 ? 'right' : 'left'}`;
    if (s.anims.currentAnim?.key !== anim || !s.anims.isPlaying) s.play(anim);
  }

  private spriteOf(p: Person): Phaser.GameObjects.Sprite {
    if (p.sprite) return p.sprite;
    const k = artScale(this.scene, p.key);
    p.sprite = this.scene.add.sprite(0, 0, p.key, 0).setOrigin(0.5, 1).setScale((p.child ? 0.72 : 1) / k);
    return p.sprite;
  }

  /** Places the walker `progress` px along the path; true once they have arrived. */
  private walk(s: Phaser.GameObjects.Sprite, p: Person, path: TilePath, progress: number): boolean {
    const step = Math.floor(Math.max(0, progress) / TILE);
    if (path.length < 2 || step >= path.length - 1) return true;
    const a = path[step];
    const b = path[step + 1];
    const f = (Math.max(0, progress) % TILE) / TILE;
    const x = (a.x + (b.x - a.x) * f) * TILE + TILE / 2;
    const y = (a.y + (b.y - a.y) * f) * TILE + TILE - 2;
    s.setPosition(x, y).setDepth(y);
    const anim = `${p.key}-walk-${b.x > a.x ? 'right' : b.x < a.x ? 'left' : b.y > a.y ? 'down' : 'up'}`;
    if (s.anims.currentAnim?.key !== anim || !s.anims.isPlaying) s.play(anim);
    return false;
  }

  private stand(s: Phaser.GameObjects.Sprite, x: number, y: number, dir: string, time: number, busy: boolean): void {
    s.anims.stop();
    s.setFrame(DIRS.indexOf(dir) * 4 + (busy ? Math.floor(time / 400) % 2 : 0)).setPosition(x, y).setDepth(y);
  }

  private sit(s: Phaser.GameObjects.Sprite, p: Person, x: number, y: number, dir: string): void {
    const k = artScale(this.scene, p.key);
    s.anims.stop();
    s.setFrame(DIRS.indexOf(dir) * 4).setCrop(0, 0, 16 * k, 22 * k).setPosition(x, y + 9).setDepth(y);
  }

  /** A sheaf of rice over the shoulder while hauling it home. */
  private carry(p: Person, on: boolean): void {
    if (!on) {
      p.load?.destroy();
      p.load = undefined;
      return;
    }
    if (!p.load) p.load = this.scene.add.image(0, 0, 'prop_haystack').setScale(hdScale(this.scene, 'prop_haystack') * 0.32);
    if (p.sprite) p.load.setPosition(p.sprite.x, p.sprite.y - 30).setDepth(p.sprite.depth + 1);
  }

  /** Sowing or spreading manure: a handful thrown ahead. */
  private toss(s: Phaser.GameObjects.Sprite, color: number): void {
    for (let i = 0; i < 5; i++) {
      const d = this.scene.add.circle(s.x, s.y - 14, 1.2, color).setDepth(s.depth + 1);
      this.scene.tweens.add({ targets: d, x: s.x + (Math.random() - 0.5) * 22, y: s.y - 2 + Math.random() * 6, alpha: 0.2, duration: 450, onComplete: () => d.destroy() });
    }
  }
}
