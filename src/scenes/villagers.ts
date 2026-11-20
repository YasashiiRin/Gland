import type Phaser from 'phaser';
import { TILE } from '../config/constants';
import { childAtHome, childAtPasture } from '../systems/npc/child';
import { NPC_CONFIG } from '../systems/npc/config';
import type { FamilyState, Npc } from '../systems/npc/types';
import { FOLK_KEYS, createFolkAnims } from './ambientLife';
import { artScale, hdScale } from './hd';
import type { FamilyGeo, NpcWorld } from './npcWorld';
import { cellMiddle } from './villageFields';
import { feedAnimals, follow, standAt, stepTowards, workCell, workGarden, type Worker } from './villagerChores';
import { HouseAnimals } from './villageAnimals';
import { placeOnPath, resetRouteBudget, Routes } from './villagerPaths';
import { chase, nearestOther, roam, RUN, type Player as Playful } from './villagerPlay';

const ACTIVE_TILES = 46;
const DIRS = ['down', 'left', 'right', 'up'];

interface Person extends Worker, Playful {
  key: string;
  child: boolean;
  sprite?: Phaser.GameObjects.Sprite;
  load?: Phaser.GameObjects.Image;
}

interface Household {
  geo: FamilyGeo;
  people: Person[];
  animals: HouseAnimals;
  routes: Routes;
}

type Pt = { x: number; y: number };
const px = (t: Pt): Pt => ({ x: t.x * TILE + TILE / 2, y: t.y * TILE + TILE - 2 });
const pick = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)];

/**
 * Draws the village farm families near the camera from their simulated state
 * (systems/npc): walking their routes, working their field cell by cell,
 * carrying the harvest home, minding the buffalo, tea in the yard. Families
 * off screen have no sprites (they live on in the simulation). Talking to
 * one makes them stop; they cut it short when they have somewhere to be.
 */
export class Villagers {
  private readonly households: Household[] = [];
  private talking: { key: string; npcId: string; person: Person } | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly world: NpcWorld,
    walkable: (x: number, y: number) => boolean,
    grazable: (x: number, y: number) => boolean,
    private readonly speak: (x: number, y: number, text: string) => void,
  ) {
    createFolkAnims(scene);
    world.geos.forEach((geo, n) => {
      const people = Array.from({ length: geo.home.members >= 3 ? 3 : 1 }, (_, i) => ({ key: FOLK_KEYS[i === 2 ? 4 : ((n * 2) % 3) + (i ? 3 : 0)], child: i === 2, index: i, nextMove: 0 }));
      this.households.push({ geo, people, animals: new HouseAnimals(scene, geo, grazable), routes: new Routes(geo, walkable) });
    });
  }

  update(time: number, delta: number, view: Phaser.Geom.Rectangle, player: Pt): void {
    resetRouteBudget();
    const minute = this.world.exactMinute();
    const near = (t: Pt) => Math.max(Math.abs(t.x - view.centerX / TILE), Math.abs(t.y - view.centerY / TILE)) < ACTIVE_TILES;
    const children = this.households.flatMap((h) => h.people.filter((p) => p.child && p.sprite).map((p) => p.sprite!));
    for (const h of this.households) {
      const fam = this.world.family(h.geo.home.key);
      const s = h.geo.spots;
      if (!fam || !(near(s.home) || near(s.field) || near(s.pasture))) {
        this.sleep(h);
        continue;
      }
      let led: { x: number; y: number; flip: boolean } | null = null;
      fam.members.forEach((npc, i) => {
        const p = h.people[i] ?? (h.people[i] = { key: FOLK_KEYS[4], child: npc.role === 'child', index: i, nextMove: 0 });
        p.child = npc.role === 'child';
        this.person(h, fam, npc, p, minute, time, delta, player, children);
        if (p.sprite) follow(p, p.sprite);
        if (fam.buffalo?.ledBy === npc.id && p.trail) led = p.trail;
      });
      for (let i = fam.members.length; i < h.people.length; i++) this.hide(h.people[i]);
      const clock = minute % 1440;
      h.animals.update(time, delta, clock >= 5 * 60 && clock < 18 * 60, fam, led);
    }
    this.sayGoodbyes();
    const t = this.talking;
    if (t && (!t.person.sprite || Math.hypot(t.person.sprite.x - player.x, t.person.sprite.y - player.y) > NPC_CONFIG.talk.rangeTiles * TILE * 2)) {
      this.world.stopTalking(t.key, t.npcId);
      this.talking = null;
    }
  }

  /** E next to a villager: they stop for a chat (or say they must be off). False: nobody close. */
  talkNear(player: Pt): boolean {
    let best: { h: Household; p: Person; d: number; i: number } | null = null;
    for (const h of this.households) {
      for (let i = 0; i < h.people.length; i++) {
        const s = h.people[i].sprite;
        if (!s?.visible) continue;
        const d = Math.hypot(s.x - player.x, s.y - player.y);
        if (d < NPC_CONFIG.talk.rangeTiles * TILE && (!best || d < best.d)) best = { h, p: h.people[i], d, i };
      }
    }
    if (!best?.p.sprite) return false;
    const { h, p, i } = best;
    const npc = this.world.family(h.geo.home.key)?.members[i];
    if (!npc) return false;
    const at = p.sprite!;
    if (p.child) {
      this.speak(at.x, at.y - 24, pick(['Dạ con chào cô chú!', 'Hì hì, con đi chơi đây!']));
      return true;
    }
    const stays = this.world.talk(h.geo.home.key, npc.id);
    if (stays) this.talking = { key: h.geo.home.key, npcId: npc.id, person: p };
    this.speak(at.x, at.y - 30, pick(stays ? NPC_CONFIG.lines.greeting : NPC_CONFIG.lines.farewell));
    return true;
  }

  destroy(): void {
    this.households.forEach((h) => this.sleep(h));
  }

  private sayGoodbyes(): void {
    const events = this.world.farewells;
    this.world.farewells = [];
    for (const ev of events) {
      for (const h of this.households) {
        const i = this.world.family(h.geo.home.key)?.members.findIndex((m) => m.id === ev.npcId) ?? -1;
        const s = i >= 0 ? h.people[i]?.sprite : undefined;
        if (s) this.speak(s.x, s.y - 30, pick(NPC_CONFIG.lines.farewell));
        if (i >= 0 && this.talking?.npcId === ev.npcId) this.talking = null;
      }
    }
  }

  private person(h: Household, fam: FamilyState, npc: Npc, p: Person, minute: number, time: number, delta: number, player: Pt, children: Phaser.GameObjects.Sprite[]): void {
    const pos = npc.position;
    if (npc.state === 'sleep' && 'place' in pos) return this.hide(p);
    if (npc.state === 'talking' && p.sprite) {
      const s = p.sprite;
      const dir = Math.abs(player.x - s.x) > Math.abs(player.y - s.y) ? (player.x > s.x ? 'right' : 'left') : player.y > s.y ? 'down' : 'up';
      return standAt(s.setCrop().setAngle(0), s.x, s.y, dir, time, false);
    }
    if (!('place' in pos)) {
      const s = this.spriteOf(p);
      const done = pos.done + Math.max(0, minute - fam.simMinute) * npc.speedMultiplier;
      placeOnPath(s, p.key, h.routes.path(pos.from, pos.to), pos.total > 0 ? done / pos.total : 1);
      return this.carry(p, npc.carrying);
    }
    this.carry(p, false);
    const g = h.geo;
    const home = g.home;
    switch (pos.place) {
      case 'market':
      case 'school':
        return this.hide(p);
      case 'field':
        return this.atField(h, fam, npc, p, time);
      case 'pasture':
        if (p.child) return this.atPasture(h, fam, p, minute, time, delta, children);
        return standAt(this.spriteOf(p), px(g.spots.pasture).x - 14, px(g.spots.pasture).y, 'right', time, false);
    }
    const s = this.spriteOf(p);
    const tea = { x: (home.x0 + 11) * TILE + [-13, 13, 0][p.index], y: (home.y0 + 12) * TILE - 2 + (p.index === 2 ? 12 : 0) };
    switch (npc.state) {
      case 'tea':
      case 'eat':
        return this.sit(s, p, tea.x, tea.y, ['right', 'left', 'up'][p.index]);
      case 'porch':
        return this.sit(s, p, (home.x0 + 8 + p.index * 2) * TILE, (home.y0 + 9) * TILE, 'down');
      case 'sweep': {
        const x = (home.x0 + 6 + Math.sin(time / 2500) * 3) * TILE;
        return standAt(s, x, (home.y0 + 12) * TILE, Math.cos(time / 2500) > 0 ? 'right' : 'left', time, true);
      }
      case 'feedLivestock':
        return feedAnimals(this.scene, s, p, (home.x0 + 13) * TILE, (home.y0 + 14) * TILE, time);
      case 'garden':
        return workGarden(this.scene, s, p, home, time);
      case 'play': {
        const other = nearestOther(s, children);
        const centre = { x: (home.x0 + 8) * TILE, y: (home.y0 + 13) * TILE };
        if (childAtHome(other ? other.d / TILE : null, NPC_CONFIG) === 'chase' && other) return chase(p, s, other.s, time, delta);
        return roam(p, s, centre, NPC_CONFIG.child.yardRadiusTiles * TILE, delta);
      }
      default:
        return standAt(s.setCrop().setAngle(0), (home.x0 + 9) * TILE, (home.y0 + 10) * TILE, 'down', time, true);
    }
  }

  private atField(h: Household, fam: FamilyState, npc: Npc, p: Person, time: number): void {
    const s = this.spriteOf(p);
    const pad = h.geo.paddy;
    const plots = h.geo.plots;
    if (!pad || !plots.length || !fam.fields.length) return this.hide(p);
    if (npc.state === 'lunch' || npc.state === 'tea') {
      // Lunch in the shade by the road, on their own side of the bridge.
      const side = pad.side === 'north' ? -1 : 1;
      return this.sit(s, p, (pad.bridgeX + (p.index ? 2 : -2)) * TILE + 8, (pad.roadY + side) * TILE + TILE - 2, side < 0 ? 'up' : 'down');
    }
    const task = npc.currentTask;
    const tgrid = task ? fam.fields[task.plot] : undefined;
    if (task && tgrid && plots[task.plot]) {
      // Beside the cell, facing it the way the row is worked (back and forth from the road).
      const at = cellMiddle(plots[task.plot], tgrid, task.cell);
      const forward = Math.floor(task.cell / tgrid.cols) % 2 === 0;
      const stand = { x: at.x + (forward ? -1 : 1), y: at.y };
      return workCell(this.scene, s, p, stand, forward ? 'right' : 'left', `${task.plot}:${task.cell}:${task.kind}`, task.kind, time);
    }
    // Nothing left today: weeding here and there in their half of the plots.
    const k = Math.floor(time / 6000 + p.index * 37);
    const plot = Math.floor(k / 7) % plots.length;
    const grid = fam.fields[plot] ?? fam.fields[0];
    const half = Math.ceil(grid.cols / 2);
    const col = fam.type === 1 ? k % grid.cols : p.index === 0 ? k % half : half + (k % Math.max(1, grid.cols - half));
    const cell = (Math.floor(k / 3) % grid.rows) * grid.cols + col;
    const at = cellMiddle(plots[plot] ?? plots[0], grid, cell);
    standAt(s.setCrop().setAngle(0), at.x * TILE + TILE / 2, at.y * TILE + TILE - 2, p.index ? 'left' : 'right', time, true);
  }

  /** The child minding the buffalo: within reach of it first, then play, ride or nap. */
  private atPasture(h: Household, fam: FamilyState, p: Person, minute: number, time: number, delta: number, children: Phaser.GameObjects.Sprite[]): void {
    const s = this.spriteOf(p);
    const beast = h.animals.beast;
    const centre = beast ? { x: beast.x, y: beast.y } : px(h.geo.spots.pasture);
    const dist = Math.hypot(s.x - centre.x, s.y - centre.y) / TILE;
    const other = nearestOther(s, children);
    const doing = childAtPasture(dist, other ? other.d / TILE : null, minute, fam.seed, NPC_CONFIG);
    if (doing === 'chase' && other) return chase(p, s, other.s, time, delta);
    if (doing === 'ride' && beast) {
      s.setAngle(0);
      return this.sit(s, p, beast.x, beast.y - 12, beast.flipX ? 'left' : 'right', beast.depth + 1);
    }
    s.setCrop();
    if (doing === 'nap' && dist < 3) {
      s.anims.stop();
      return void s.setFrame(0).setAngle(90).setDepth(s.y);
    }
    s.setAngle(0);
    if (dist > 2) stepTowards(s, p.key, centre.x - 16, centre.y, RUN, delta);
    else standAt(s, s.x, s.y, beast?.flipX ? 'left' : 'right', time, false);
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
    p.goal = undefined;
  }

  private spriteOf(p: Person): Phaser.GameObjects.Sprite {
    if (p.sprite) {
      // Up from a seat: back to the walking sheet (sit() swaps to the "_sit" one).
      if (p.sprite.texture.key !== p.key) p.sprite.setTexture(p.key, 0);
      return p.sprite;
    }
    const k = artScale(this.scene, p.key);
    p.sprite = this.scene.add.sprite(0, 0, p.key, 0).setOrigin(0.5, 1).setScale((p.child ? 0.72 : 1) / k);
    return p.sprite;
  }

  /**
   * Seated: the NPC's own sitting picture ("<key>_sit", same layout as the walk sheet)
   * when there is one, else the standing sprite cut off at the knees and lowered.
   */
  private sit(s: Phaser.GameObjects.Sprite, p: Person, x: number, y: number, dir: string, depth = y): void {
    s.anims.stop();
    const frame = DIRS.indexOf(dir) * 4;
    const seated = `${p.key}_sit`;
    if (this.scene.textures.exists(seated)) {
      s.setTexture(seated, frame).setAngle(0).setCrop().setPosition(x, y).setDepth(depth);
      return;
    }
    const k = artScale(this.scene, p.key);
    s.setAngle(0).setFrame(frame).setCrop(0, 0, 16 * k, 22 * k).setPosition(x, y + 9).setDepth(depth);
  }

  /** A pile of the harvest on the head while carrying it home. */
  private carry(p: Person, on: boolean): void {
    p.sprite?.setCrop().setAngle(0);
    if (!on) {
      p.load?.destroy();
      p.load = undefined;
      return;
    }
    if (!p.load) p.load = this.scene.add.image(0, 0, 'prop_haystack').setScale(hdScale(this.scene, 'prop_haystack') * 0.32);
    if (p.sprite) p.load.setPosition(p.sprite.x, p.sprite.y - 30).setDepth(p.sprite.depth + 1);
  }
}
