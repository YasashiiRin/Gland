import Phaser from 'phaser';
import Peer, { type DataConnection } from 'peerjs';
import {
  isNetMessage,
  makeRoomCode,
  MAX_PLAYERS,
  PEER_PREFIX,
  type LobbyPlayer,
  type MeetingPoint,
  type NetMessage,
  type NewDayInfo,
  type PlayerProfile,
  type PlayerPose,
  type SharedWorld,
} from './protocol';
import type { WorldPatch } from './worldPatch';

export type NetRole = 'offline' | 'host' | 'guest';

/** Events emitted on `net.events`. */
export const NetEvents = {
  Lobby: 'net:lobby',
  Start: 'net:start',
  World: 'net:world',
  Time: 'net:time',
  /** A world patch from someone else: { from, patch }. */
  Patch: 'net:patch',
  Error: 'net:error',
  /** Who is in bed changed: string[] of player ids. */
  Sleepers: 'net:sleepers',
  /** Host: a guest sent their personal profile: { name, profile }. */
  Profile: 'net:profile',
  Disconnected: 'net:disconnected',
  /** Someone taught me a skill: { from (name), skill }. */
  Teach: 'net:teach',
} as const;

/**
 * The multiplayer connection (PeerJS / WebRTC). The host's browser owns the
 * shared world; guests connect to it by room code. The host relays guests'
 * positions to each other, so guests only ever talk to the host.
 */
class NetSession {
  readonly events = new Phaser.Events.EventEmitter();
  role: NetRole = 'offline';
  roomCode = '';
  myId = 'local';
  myName = 'Nông dân';
  /** Everyone in the room, including me. */
  players: LobbyPlayer[] = [];
  /** Latest pose of every other player, by id. */
  readonly poses = new Map<string, PlayerPose>();
  /** Set by the host once the game has started, so late joiners get the world straight away. */
  worldProvider?: () => SharedWorld;
  /** Host: a returning guest's saved inventory/energy/skills, by name. */
  profileProvider?: (name: string) => PlayerProfile | undefined;
  /** Ids of players who are in bed waiting for the day to end. */
  readonly sleepers = new Set<string>();
  /** Guest: a profile the host handed back when we joined (consumed by the lobby). */
  receivedProfile?: PlayerProfile;
  /** Guest: where the host asked us to appear (their map and start point). */
  meetingPoint?: MeetingPoint;
  private meetingProvider?: () => MeetingPoint;

  private peer?: Peer;
  private hostConn?: DataConnection;
  private readonly guests = new Map<string, DataConnection>();

  get online(): boolean {
    return this.role !== 'offline';
  }

  /** Opens a room. Resolves with the room code once the signalling server accepted it. */
  host(name: string): Promise<string> {
    this.reset();
    this.myName = name;
    const code = makeRoomCode();
    return new Promise((resolve, reject) => {
      const peer = new Peer(PEER_PREFIX + code);
      this.peer = peer;
      peer.on('open', () => {
        this.role = 'host';
        this.roomCode = code;
        this.myId = 'host';
        this.players = [{ id: 'host', name, host: true }];
        this.events.emit(NetEvents.Lobby, this.players);
        resolve(code);
      });
      peer.on('error', (err) => {
        if (this.role === 'offline') reject(err);
        else this.events.emit(NetEvents.Error, String(err));
      });
      peer.on('connection', (conn) => this.acceptGuest(conn));
    });
  }

  /** Joins a room by code. Resolves once connected (the lobby list arrives as an event). */
  join(code: string, name: string): Promise<void> {
    this.reset();
    this.myName = name;
    return new Promise((resolve, reject) => {
      const peer = new Peer();
      this.peer = peer;
      peer.on('error', (err) => {
        if (this.role === 'offline') reject(err);
        else this.events.emit(NetEvents.Error, String(err));
      });
      peer.on('open', (id) => {
        const conn = peer.connect(PEER_PREFIX + code, { reliable: true });
        this.hostConn = conn;
        conn.on('open', () => {
          this.role = 'guest';
          this.roomCode = code;
          this.myId = id;
          conn.send({ t: 'hello', name } satisfies NetMessage);
          resolve();
        });
        conn.on('data', (data) => this.onGuestData(data));
        conn.on('close', () => this.lostHost());
        conn.on('error', (err) => this.events.emit(NetEvents.Error, String(err)));
      });
    });
  }

  leave(): void {
    this.reset();
  }

  /** Host: start the game for everyone in the lobby. */
  startGame(world: () => SharedWorld, profileOf: (name: string) => PlayerProfile | undefined, meetAt?: () => MeetingPoint): void {
    this.worldProvider = world;
    this.profileProvider = profileOf;
    this.meetingProvider = meetAt;
    for (const [id, conn] of this.guests) conn.send(this.startMessage(id));
  }

  private startMessage(id: string): NetMessage {
    const world = this.worldProvider?.() as SharedWorld;
    return { t: 'start', you: id, world, profile: this.profileProvider?.(this.nameOf(id)), at: this.meetingProvider?.() };
  }

  /** Host: push the whole shared world (e.g. after a new day starts). */
  broadcastWorld(world: SharedWorld, newDay?: NewDayInfo): void {
    if (newDay) this.setSleepers([]);
    this.toGuests({ t: 'world', world, newDay });
  }

  /** I went to bed (true) or got up again (false). */
  setSleepReady(ready: boolean): void {
    if (this.role === 'guest') this.hostConn?.send({ t: 'sleep', ready } satisfies NetMessage);
    else if (this.role === 'host') this.markSleeper(this.myId, ready);
  }

  /** Guest: send my inventory/energy/skills so the host can save them for me. */
  sendProfile(profile: PlayerProfile): void {
    if (this.role === 'guest') this.hostConn?.send({ t: 'profile', profile } satisfies NetMessage);
  }

  private markSleeper(id: string, ready: boolean): void {
    const next = new Set(this.sleepers);
    if (ready) next.add(id);
    else next.delete(id);
    this.setSleepers([...next]);
  }

  private setSleepers(ids: string[]): void {
    this.sleepers.clear();
    ids.forEach((id) => this.sleepers.add(id));
    if (this.role === 'host') this.toGuests({ t: 'sleepers', ids });
    this.events.emit(NetEvents.Sleepers, ids);
  }

  broadcastTime(time: SharedWorld['time']): void {
    this.toGuests({ t: 'time', time });
  }

  /** Guest: my changes go to the host. Host: my changes (or a guest's, relayed) go to the other guests. */
  sendPatch(patch: WorldPatch, relayFrom?: string): void {
    const msg: NetMessage = { t: 'patch', from: relayFrom ?? this.myId, patch };
    if (this.role === 'host') this.toGuests(msg, relayFrom);
    else if (this.role === 'guest') this.hostConn?.send(msg);
  }

  sendPose(pose: Omit<PlayerPose, 'id'>): void {
    const msg: NetMessage = { t: 'pose', pose: { ...pose, id: this.myId } };
    if (this.role === 'host') this.toGuests(msg);
    else if (this.role === 'guest') this.hostConn?.send(msg);
  }

  /** A Thầy pháp passes a skill on to another player in the room (the host relays it to the right guest). */
  sendTeach(to: string, skill: string): void {
    const msg: NetMessage = { t: 'teach', from: this.myId, to, skill };
    if (this.role === 'host') this.guests.get(to)?.send(msg);
    else if (this.role === 'guest') this.hostConn?.send(msg);
  }

  nameOf(id: string): string {
    return this.players.find((p) => p.id === id)?.name ?? '?';
  }

  // ---------------------------------------------------------------- host side
  private acceptGuest(conn: DataConnection): void {
    conn.on('open', () => {
      if (this.players.length >= MAX_PLAYERS) {
        conn.send({ t: 'full' } satisfies NetMessage);
        setTimeout(() => conn.close(), 500);
        return;
      }
      this.guests.set(conn.peer, conn);
    });
    conn.on('data', (data) => {
      if (!isNetMessage(data)) return;
      if (data.t === 'hello') {
        if (!this.guests.has(conn.peer)) return;
        // Names identify saved guest profiles, so keep them unique in the room.
        let name = data.name.slice(0, 16) || 'Khách';
        while (this.players.some((p) => p.name === name && p.id !== conn.peer)) name = `${name.slice(0, 13)} ${this.players.length + 1}`;
        this.players = [...this.players.filter((p) => p.id !== conn.peer), { id: conn.peer, name, host: false }];
        this.toGuests({ t: 'lobby', players: this.players });
        this.events.emit(NetEvents.Lobby, this.players);
        // Joining a game already in progress: hand over the world right away.
        if (this.worldProvider) conn.send(this.startMessage(conn.peer));
      } else if (data.t === 'sleep') {
        this.markSleeper(conn.peer, data.ready);
      } else if (data.t === 'profile') {
        this.events.emit(NetEvents.Profile, { name: this.nameOf(conn.peer), profile: data.profile });
      } else if (data.t === 'patch') {
        this.events.emit(NetEvents.Patch, { from: conn.peer, patch: data.patch });
      } else if (data.t === 'teach' && data.from === conn.peer) {
        if (data.to === this.myId) this.events.emit(NetEvents.Teach, { from: this.nameOf(conn.peer), skill: data.skill });
        else this.guests.get(data.to)?.send(data);
      } else if (data.t === 'pose' && data.pose.id === conn.peer) {
        this.poses.set(conn.peer, data.pose);
        this.toGuests(data, conn.peer);
      }
    });
    conn.on('close', () => {
      this.guests.delete(conn.peer);
      this.poses.delete(conn.peer);
      this.players = this.players.filter((p) => p.id !== conn.peer);
      if (this.sleepers.has(conn.peer)) this.markSleeper(conn.peer, false);
      this.toGuests({ t: 'left', id: conn.peer });
      this.toGuests({ t: 'lobby', players: this.players });
      this.events.emit(NetEvents.Lobby, this.players);
    });
  }

  private toGuests(msg: NetMessage, exceptId?: string): void {
    for (const [id, conn] of this.guests) if (id !== exceptId && conn.open) conn.send(msg);
  }

  // ---------------------------------------------------------------- guest side
  private onGuestData(data: unknown): void {
    if (!isNetMessage(data)) return;
    switch (data.t) {
      case 'full':
        this.events.emit(NetEvents.Error, 'Phòng đã đủ người (tối đa 3).');
        this.reset();
        break;
      case 'lobby':
        this.players = data.players;
        this.events.emit(NetEvents.Lobby, this.players);
        break;
      case 'start':
        this.myId = data.you;
        this.receivedProfile = data.profile;
        this.meetingPoint = data.at;
        this.events.emit(NetEvents.Start, data.world);
        break;
      case 'world':
        this.events.emit(NetEvents.World, { world: data.world, newDay: data.newDay });
        break;
      case 'sleepers':
        this.setSleepers(data.ids);
        break;
      case 'time':
        this.events.emit(NetEvents.Time, data.time);
        break;
      case 'patch':
        this.events.emit(NetEvents.Patch, { from: data.from, patch: data.patch });
        break;
      case 'pose':
        if (data.pose.id !== this.myId) this.poses.set(data.pose.id, data.pose);
        break;
      case 'left':
        this.poses.delete(data.id);
        break;
      case 'teach':
        if (data.to === this.myId) this.events.emit(NetEvents.Teach, { from: this.nameOf(data.from), skill: data.skill });
        break;
      default:
        break;
    }
  }

  private lostHost(): void {
    if (this.role !== 'guest') return;
    this.reset();
    this.events.emit(NetEvents.Disconnected);
  }

  private reset(): void {
    this.hostConn?.close();
    for (const conn of this.guests.values()) conn.close();
    this.guests.clear();
    this.peer?.destroy();
    this.peer = undefined;
    this.hostConn = undefined;
    this.role = 'offline';
    this.roomCode = '';
    this.myId = 'local';
    this.players = [];
    this.poses.clear();
    this.sleepers.clear();
    this.worldProvider = undefined;
    this.profileProvider = undefined;
    this.receivedProfile = undefined;
  }
}

/** The single multiplayer session for this browser tab. */
export const net = new NetSession();
