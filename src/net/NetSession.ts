import Phaser from 'phaser';
import Peer, { type DataConnection } from 'peerjs';
import {
  isNetMessage,
  makeRoomCode,
  MAX_PLAYERS,
  PEER_PREFIX,
  type LobbyPlayer,
  type NetMessage,
  type PlayerPose,
  type SharedWorld,
} from './protocol';

export type NetRole = 'offline' | 'host' | 'guest';

/** Events emitted on `net.events`. */
export const NetEvents = {
  Lobby: 'net:lobby',
  Start: 'net:start',
  World: 'net:world',
  Time: 'net:time',
  Error: 'net:error',
  Disconnected: 'net:disconnected',
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
  startGame(world: () => SharedWorld): void {
    this.worldProvider = world;
    for (const [id, conn] of this.guests) conn.send({ t: 'start', you: id, world: world() } satisfies NetMessage);
  }

  /** Host: push the whole shared world (e.g. after a new day starts). */
  broadcastWorld(world: SharedWorld): void {
    this.toGuests({ t: 'world', world });
  }

  broadcastTime(time: SharedWorld['time']): void {
    this.toGuests({ t: 'time', time });
  }

  sendPose(pose: Omit<PlayerPose, 'id'>): void {
    const msg: NetMessage = { t: 'pose', pose: { ...pose, id: this.myId } };
    if (this.role === 'host') this.toGuests(msg);
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
        this.players = [...this.players.filter((p) => p.id !== conn.peer), { id: conn.peer, name: data.name.slice(0, 16), host: false }];
        this.toGuests({ t: 'lobby', players: this.players });
        this.events.emit(NetEvents.Lobby, this.players);
        // Joining a game already in progress: hand over the world right away.
        if (this.worldProvider) conn.send({ t: 'start', you: conn.peer, world: this.worldProvider() } satisfies NetMessage);
      } else if (data.t === 'pose' && data.pose.id === conn.peer) {
        this.poses.set(conn.peer, data.pose);
        this.toGuests(data, conn.peer);
      }
    });
    conn.on('close', () => {
      this.guests.delete(conn.peer);
      this.poses.delete(conn.peer);
      this.players = this.players.filter((p) => p.id !== conn.peer);
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
        this.events.emit(NetEvents.Start, data.world);
        break;
      case 'world':
        this.events.emit(NetEvents.World, data.world);
        break;
      case 'time':
        this.events.emit(NetEvents.Time, data.time);
        break;
      case 'pose':
        if (data.pose.id !== this.myId) this.poses.set(data.pose.id, data.pose);
        break;
      case 'left':
        this.poses.delete(data.id);
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
    this.worldProvider = undefined;
  }
}

/** The single multiplayer session for this browser tab. */
export const net = new NetSession();
