import type Phaser from 'phaser';
import { TILE } from '../config/constants';
import { timeControl } from '../state/timeControl';
import { isWorldInputBlocked } from '../state/uiState';
import { childAtHome, childAtPasture, clampToRadius } from '../systems/npc/child';
import { NPC_CONFIG } from '../systems/npc/config';
import type { FamilyState, Npc, Place } from '../systems/npc/types';
import { FOLK_KEYS, createFolkAnims } from './ambientLife';
import { artScale, hdScale } from './hd';
import type { FamilyGeo, NpcWorld } from './npcWorld';
import { cellMiddle } from './villageFields';
import { follow } from './villagerChores';
import { HouseAnimals } from './villageAnimals';
import { AgentPlanner, createAgent, moveAgent, WALK_SPEED, type Agent } from './villagerAgents';
import { drawPose, drawWalking, type Plan, type PoseActor } from './villagerPoses';

/** Animals (and the decision to draw anyone) only near the camera; the people themselves live everywhere. */
const ACTIVE_TILES = 46;
/** Drawn when within the camera view plus this margin (px). */
const VIEW_MARGIN = 3 * TILE;
/** Children running about at play (px a second). */
const RUN = 40;

interface Person extends PoseActor {
  child: boolean;
  /** Their body in the world: walks about whether drawn or not. */
  agent?: Agent;
  sprite?: Phaser.GameObjects.Sprite;
  load?: Phaser.GameObjects.Image;
  /** Where a child at play is running to. */
  goal?: Pt;
}

interface Household {
  geo: FamilyGeo;
  people: Person[];
  animals: HouseAnimals;
}

type Pt = { x: number; y: number };
const px = (t: Pt): Pt => ({ x: t.x * TILE + TILE / 2, y: t.y * TILE + TILE - 2 });
const pick = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)];
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * The village farm families as people who are really there: each has a body
 * (villagerAgents) that walks at a steady pace, finding its way round houses
 * and fences, to wherever the timetable (systems/npc) wants them, and only
 * then takes up the job: tea in the yard, a field cell, feeding the pigs…
 * They go about it all the time, near the camera or not; only the drawing is
 * skipped far away. Talking to one makes them stop.
 */
export class Villagers {
  private readonly households: Household[] = [];
  private readonly planner: AgentPlanner;
  private talking: { key: string; npcId: string; person: Person } | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly world: NpcWorld,
    walkable: (x: number, y: number) => boolean,
    grazable: (x: number, y: number) => boolean,
    private readonly speak: (x: number, y: number, text: string) => void,
  ) {
    createFolkAnims(scene);
    this.planner = new AgentPlanner(walkable);
    world.geos.forEach((geo, n) => {
      const people = Array.from({ length: geo.home.members >= 3 ? 3 : 1 }, (_, i) => ({ key: FOLK_KEYS[i === 2 ? 4 : ((n * 2) % 3) + (i ? 3 : 0)], child: i === 2, index: i, nextMove: 0 }));
      this.households.push({ geo, people, animals: new HouseAnimals(scene, geo, grazable) });
    });
  }

  update(time: number, delta: number, view: Phaser.Geom.Rectangle, player: Pt): void {
    this.planner.newFrame();
    // Everyone holds still while the clock is stopped (menus open, paused).
    const dt = isWorldInputBlocked() || timeControl.paused ? 0 : delta;
    const minute = this.world.exactMinute();
    const near = (t: Pt) => Math.max(Math.abs(t.x - view.centerX / TILE), Math.abs(t.y - view.centerY / TILE)) < ACTIVE_TILES;
    const children = this.households.flatMap((h) => h.people.filter((p) => p.child && p.agent).map((p) => p.agent!));
    for (const h of this.households) {
      const fam = this.world.family(h.geo.home.key);
      if (!fam) {
        h.people.forEach((p) => this.hideSprite(p));
        h.animals.hide();
        continue;
      }
      let led: { x: number; y: number; flip: boolean } | null = null;
      fam.members.forEach((npc, i) => {
        const p = h.people[i] ?? (h.people[i] = { key: FOLK_KEYS[4], child: npc.role === 'child', index: i, nextMove: 0 });
        p.child = npc.role === 'child';
        this.person(h, fam, npc, p, minute, time, dt, player, children, view);
        if (p.agent) follow(p, p.agent);
        if (fam.buffalo?.ledBy === npc.id && p.trail) led = p.trail;
      });
      for (let i = fam.members.length; i < h.people.length; i++) this.hideSprite(h.people[i]);
      const s = h.geo.spots;
      if (near(s.home) || near(s.field) || near(s.pasture)) {
        const clock = minute % 1440;
        h.animals.update(time, dt, clock >= 5 * 60 && clock < 18 * 60, fam, led);
      } else h.animals.hide();
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
    for (const h of this.households) {
      h.people.forEach((p) => this.hideSprite(p));
      h.animals.hide();
    }
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

  /** Moves one person's body towards their plan, and draws them if the camera is near. */
  private person(h: Household, fam: FamilyState, npc: Npc, p: Person, minute: number, time: number, dt: number, player: Pt, children: Agent[], view: Phaser.Geom.Rectangle): void {
    const a = (p.agent ??= createAgent(this.startPoint(h, fam, npc, p, minute)));
    const plan = this.planOf(h, fam, npc, p, a, time, player, children, minute);
    const there = moveAgent(a, plan.at, plan.speed ?? WALK_SPEED * npc.speedMultiplier, dt, this.planner);
    const gone = there && plan.pose.kind === 'hide';
    const inView = a.x > view.x - VIEW_MARGIN && a.x < view.right + VIEW_MARGIN && a.y > view.y - VIEW_MARGIN && a.y < view.bottom + VIEW_MARGIN * 2;
    if (gone || !inView) return this.hideSprite(p);
    const s = this.spriteOf(p);
    if (there) drawPose(this.scene, s, p, plan.pose, a, time);
    else drawWalking(s, p, a);
    this.carry(p, npc.carrying);
  }

  /** Where someone first stands when the map is loaded: their spot, or part way along their walk. */
  private startPoint(h: Household, fam: FamilyState, npc: Npc, p: Person, minute: number): Pt {
    const pos = npc.position;
    if ('place' in pos) return this.planOf(h, fam, npc, p, null, 0, { x: 0, y: 0 }, [], minute).at;
    const a = this.spotOf(h, pos.from);
    const b = this.spotOf(h, pos.to);
    const f = pos.total > 0 ? Math.min(1, pos.done / pos.total) : 1;
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
  }

  /** The spot of a place: the yard by the gate, the field road by the bridge, the pasture, school, the road to market. */
  private spotOf(h: Household, place: Place): Pt {
    if (place === 'market') {
      const p = h.geo.paddy;
      const start = p ? { x: p.bridgeX, y: p.roadY } : h.geo.spots.home;
      return px({ x: start.x + 30, y: start.y });
    }
    return px(h.geo.spots[place]);
  }

  /** What the timetable wants of this person right now: where to be and what to do there. */
  private planOf(h: Household, fam: FamilyState, npc: Npc, p: Person, a: Agent | null, time: number, player: Pt, children: Agent[], minute: number): Plan {
    const pos = npc.position;
    const home = h.geo.home;
    if (npc.state === 'talking' && a) {
      const dir = Math.abs(player.x - a.x) > Math.abs(player.y - a.y) ? (player.x > a.x ? 'right' : 'left') : player.y > a.y ? 'down' : 'up';
      return { at: { x: a.x, y: a.y }, pose: { kind: 'stand', dir, busy: false } };
    }
    if (!('place' in pos)) return { at: this.spotOf(h, pos.to), pose: { kind: 'walk' } };
    if (npc.state === 'sleep') return { at: { x: (home.x0 + 9) * TILE + TILE / 2, y: (home.y0 + 9) * TILE + TILE - 2 }, pose: { kind: 'hide' } };
    switch (pos.place) {
      case 'market':
      case 'school':
        return { at: this.spotOf(h, pos.place), pose: { kind: 'hide' } };
      case 'field':
        return this.atField(h, fam, npc, p, time);
      case 'pasture':
        if (p.child && a) return this.atPasture(h, fam, p, a, children, minute, time);
        return { at: { x: px(h.geo.spots.pasture).x - 14, y: px(h.geo.spots.pasture).y }, pose: { kind: 'stand', dir: 'right', busy: false } };
    }
    const tea = { x: (home.x0 + 11) * TILE + [-13, 13, 0][p.index], y: (home.y0 + 12) * TILE - 2 + (p.index === 2 ? 12 : 0) };
    switch (npc.state) {
      case 'tea':
      case 'eat':
        return { at: tea, pose: { kind: 'sit', dir: ['right', 'left', 'up'][p.index] } };
      case 'porch':
        return { at: { x: (home.x0 + 8 + p.index * 2) * TILE, y: (home.y0 + 9) * TILE }, pose: { kind: 'sit', dir: 'down' } };
      case 'sweep':
        return {
          at: { x: (home.x0 + 6 + Math.sin(time / 2500) * 3) * TILE, y: (home.y0 + 12) * TILE },
          pose: { kind: 'stand', dir: Math.cos(time / 2500) > 0 ? 'right' : 'left', busy: true },
        };
      case 'feedLivestock':
        return { at: { x: (home.x0 + 13) * TILE, y: (home.y0 + 14) * TILE }, pose: { kind: 'feed' } };
      case 'garden': {
        // Hoeing and watering the vegetable rows of the yard, a tile at a stroke.
        const k = Math.floor(time / 2600 + p.index * 5) % 12;
        return { at: { x: (home.x0 + 3 + (k % 6) + p.index * 8) * TILE + TILE / 2, y: (home.y0 + 14 + Math.floor(k / 6)) * TILE + TILE - 2 }, pose: { kind: 'garden' } };
      }
      case 'play':
        if (a) return this.play(p, a, children, { x: (home.x0 + 8) * TILE, y: (home.y0 + 13) * TILE }, NPC_CONFIG.child.yardRadiusTiles * TILE, (d) => childAtHome(d, NPC_CONFIG), time);
        break;
    }
    return { at: { x: (home.x0 + 9) * TILE, y: (home.y0 + 10) * TILE }, pose: { kind: 'stand', dir: 'down', busy: true } };
  }

  private atField(h: Household, fam: FamilyState, npc: Npc, p: Person, time: number): Plan {
    const pad = h.geo.paddy;
    const plots = h.geo.plots;
    if (!pad || !plots.length || !fam.fields.length) return { at: this.spotOf(h, 'field'), pose: { kind: 'stand', dir: 'down', busy: false } };
    if (npc.state === 'lunch' || npc.state === 'tea') {
      // Lunch in the shade by the road, on their own side of the bridge.
      const side = pad.side === 'north' ? -1 : 1;
      return { at: { x: (pad.bridgeX + (p.index ? 2 : -2)) * TILE + 8, y: (pad.roadY + side) * TILE + TILE - 2 }, pose: { kind: 'sit', dir: side < 0 ? 'up' : 'down' } };
    }
    const task = npc.currentTask;
    const tgrid = task ? fam.fields[task.plot] : undefined;
    if (task && tgrid && plots[task.plot]) {
      // Beside the cell, facing it the way the row is worked (back and forth from the road).
      const at = cellMiddle(plots[task.plot], tgrid, task.cell);
      const forward = Math.floor(task.cell / tgrid.cols) % 2 === 0;
      return { at: px({ x: at.x + (forward ? -1 : 1), y: at.y }), pose: { kind: 'work', dir: forward ? 'right' : 'left', job: `${task.plot}:${task.cell}:${task.kind}`, task: task.kind } };
    }
    // Nothing left today: weeding along their half of the plots, a cell at a time.
    const k = Math.floor(time / 6000 + p.index * 37);
    const plot = Math.floor(k / 40) % plots.length;
    const grid = fam.fields[plot] ?? fam.fields[0];
    const half = Math.ceil(grid.cols / 2);
    const width = fam.type === 1 ? grid.cols : p.index === 0 ? half : Math.max(1, grid.cols - half);
    const lane = k % (width * grid.rows);
    const row = Math.floor(lane / width);
    // Back and forth along each row, so the next cell is always the one beside.
    const step = row % 2 === 0 ? lane % width : width - 1 - (lane % width);
    const col = (fam.type === 1 || p.index === 0 ? 0 : half) + step;
    const at = cellMiddle(plots[plot] ?? plots[0], grid, row * grid.cols + col);
    return { at: px(at), pose: { kind: 'stand', dir: p.index ? 'left' : 'right', busy: true } };
  }

  /** The child minding the buffalo: within reach of it first, then play, ride or nap. */
  private atPasture(h: Household, fam: FamilyState, p: Person, a: Agent, children: Agent[], minute: number, time: number): Plan {
    const beast = h.animals.beast;
    const centre = beast ? { x: beast.x, y: beast.y } : px(h.geo.spots.pasture);
    const d = dist(a, centre) / TILE;
    const other = this.nearestChild(a, children);
    const doing = childAtPasture(d, other ? other.d / TILE : null, minute, fam.seed, NPC_CONFIG);
    if (doing === 'chase' && other) return this.chase(p, a, other.a, time);
    if (doing === 'ride' && beast) return { at: { x: beast.x, y: beast.y - 12 }, pose: { kind: 'sit', dir: beast.flipX ? 'left' : 'right', depth: beast.depth + 1 } };
    if (doing === 'nap' && d < 3) return { at: { x: a.x, y: a.y }, pose: { kind: 'nap' } };
    if (d > 2) return { at: { x: centre.x - 16, y: centre.y }, pose: { kind: 'stand', dir: 'right', busy: false }, speed: RUN };
    return { at: { x: a.x, y: a.y }, pose: { kind: 'stand', dir: beast?.flipX ? 'left' : 'right', busy: false } };
  }

  /** Children at play: tag with the nearest other child, else running about the yard. */
  private play(p: Person, a: Agent, children: Agent[], centre: Pt, radius: number, decide: (d: number | null) => string, time: number): Plan {
    const other = this.nearestChild(a, children);
    if (decide(other ? other.d / TILE : null) === 'chase' && other) return this.chase(p, a, other.a, time);
    if (!p.goal || dist(p.goal, centre) > radius * 1.5) p.goal = centre;
    if (dist(a, p.goal) < 1) {
      const r = radius * 0.6 * Math.random();
      const t = Math.random() * Math.PI * 2;
      p.goal = clampToRadius(centre.x + Math.cos(t) * r, centre.y + Math.sin(t) * r * 0.5, centre.x, centre.y, radius);
    }
    return { at: p.goal, pose: { kind: 'stand', dir: a.dir, busy: false }, speed: RUN * 0.6 };
  }

  /** Tag: running round and round the point between the two of them. */
  private chase(p: Person, a: Agent, other: Agent, time: number): Plan {
    const t = time / 900 + p.index * Math.PI;
    const at = { x: (a.x + other.x) / 2 + Math.cos(t) * 28, y: (a.y + other.y) / 2 + Math.sin(t) * 16 };
    return { at, pose: { kind: 'stand', dir: a.dir, busy: false }, speed: RUN * 1.5 };
  }

  private nearestChild(a: Agent, children: Agent[]): { a: Agent; d: number } | null {
    let best: { a: Agent; d: number } | null = null;
    for (const c of children) {
      if (c === a) continue;
      const d = dist(a, c);
      if (!best || d < best.d) best = { a: c, d };
    }
    return best;
  }

  /** Stops drawing someone (they carry on in the world). */
  private hideSprite(p: Person): void {
    p.sprite?.destroy();
    p.load?.destroy();
    p.sprite = undefined;
    p.load = undefined;
  }

  private spriteOf(p: Person): Phaser.GameObjects.Sprite {
    if (p.sprite) return p.sprite;
    const k = artScale(this.scene, p.key);
    p.sprite = this.scene.add.sprite(0, 0, p.key, 0).setOrigin(0.5, 1).setScale((p.child ? 0.72 : 1) / k);
    return p.sprite;
  }

  /** A pile of the harvest on the head while carrying it home. */
  private carry(p: Person, on: boolean): void {
    if (!on || !p.sprite) {
      p.load?.destroy();
      p.load = undefined;
      return;
    }
    if (!p.load) p.load = this.scene.add.image(0, 0, 'prop_haystack').setScale(hdScale(this.scene, 'prop_haystack') * 0.32);
    p.load.setPosition(p.sprite.x, p.sprite.y - 30).setDepth(p.sprite.depth + 1);
  }
}
