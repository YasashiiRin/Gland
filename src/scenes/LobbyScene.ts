import Phaser from 'phaser';
import { net, NetEvents } from '../net/NetSession';
import { MAX_PLAYERS, pickShared, type LobbyPlayer, type SharedWorld } from '../net/protocol';
import { isMapKey } from '../data/maps';
import { applySharedWorld, gameState, resetToNewGame } from '../state/GameState';
import { drawTitleBackground } from '../ui/titleBackground';
import { inkText, UI_COLORS, UI_FONT } from '../ui/uiStyle';
import { woodPanel, skinButton } from '../ui/uiSkin';

export interface LobbySceneData {
  mode: 'host' | 'guest';
  name: string;
  code?: string;
}

/**
 * Waiting room. The host gets a room code to share and starts the game when
 * ready; guests connect with the code and wait for the host to start.
 */
export class LobbyScene extends Phaser.Scene {
  private status!: Phaser.GameObjects.Text;
  private codeText!: Phaser.GameObjects.Text;
  private list!: Phaser.GameObjects.Text;
  private data_!: LobbySceneData;

  constructor() {
    super('Lobby');
  }

  create(data: LobbySceneData): void {
    this.data_ = data;
    drawTitleBackground(this);
    const cx = this.scale.width / 2;
    woodPanel(this, cx - 200, 110, 400, 330);
    inkText(this, cx, 140, data.mode === 'host' ? 'Phòng của bạn' : 'Vào phòng', 22).setOrigin(0.5);
    this.codeText = inkText(this, cx, 190, '', 40, '#a8402c').setOrigin(0.5);
    this.status = this.add
      .text(cx, 232, '', { fontFamily: UI_FONT, fontSize: '14px', color: UI_COLORS.inkSoft, align: 'center', wordWrap: { width: 360 } })
      .setOrigin(0.5, 0);
    this.list = inkText(this, cx, 290, '', 17).setOrigin(0.5, 0).setAlign('center').setLineSpacing(6);

    const onLobby = (players: LobbyPlayer[]) => this.showPlayers(players);
    const onError = (msg: string) => this.status.setText(`Lỗi: ${msg}`);
    const onStart = (world: SharedWorld) => this.startAsGuest(world);
    net.events.on(NetEvents.Lobby, onLobby);
    net.events.on(NetEvents.Error, onError);
    net.events.on(NetEvents.Start, onStart);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      net.events.off(NetEvents.Lobby, onLobby);
      net.events.off(NetEvents.Error, onError);
      net.events.off(NetEvents.Start, onStart);
    });

    if (data.mode === 'host') {
      this.status.setText('Đang tạo phòng…');
      net
        .host(data.name)
        .then((code) => {
          this.codeText.setText(code);
          this.status.setText(`Gửi mã này cho bạn bè (tối đa ${MAX_PLAYERS - 1} người).\nBấm "Bắt đầu" khi đã sẵn sàng — bạn bè vẫn vào giữa chừng được.`);
        })
        .catch((err: unknown) => this.status.setText(`Không tạo được phòng: ${String(err)}`));
      this.button(cx - 80, 405, 'Bắt đầu', () => this.startAsHost());
    } else {
      this.codeText.setText(data.code ?? '');
      this.status.setText('Đang kết nối tới chủ phòng…');
      net
        .join(data.code ?? '', data.name)
        .then(() => this.status.setText('Đã vào phòng! Chờ chủ phòng bắt đầu…'))
        .catch((err: unknown) => this.status.setText(`Không vào được phòng: ${String(err)}`));
    }
    this.button(data.mode === 'host' ? cx + 80 : cx, 405, 'Rời phòng', () => {
      net.leave();
      this.scene.start('Title');
    });
  }

  private showPlayers(players: LobbyPlayer[]): void {
    this.list.setText(players.map((p) => `${p.host ? '★ ' : '• '}${p.name}${p.host ? ' (chủ phòng)' : ''}`).join('\n'));
  }

  private startAsHost(): void {
    if (net.role !== 'host') return;
    net.startGame(
      () => pickShared(gameState),
      (name) => gameState.guestProfiles[name],
      () => ({ map: gameState.currentMap, spawn: gameState.spawnId }),
    );
    this.scene.start('Preload');
  }

  private startAsGuest(world: SharedWorld): void {
    // Personal things (inventory, energy, skills) start fresh; the farm is the host's.
    resetToNewGame(this.data_.name);
    applySharedWorld(world);
    // Coming back to a farm we've played on: the host kept our bag, energy and skills.
    if (net.receivedProfile) Object.assign(gameState, structuredClone(net.receivedProfile));
    // Appear where the host started (their map and start point), else in Đồng Hới.
    const at = net.meetingPoint;
    if (at && isMapKey(at.map)) {
      gameState.currentMap = at.map;
      gameState.spawnId = at.spawn;
    }
    gameState.riding = null;
    this.scene.start('Preload');
  }

  private button(x: number, y: number, label: string, onClick: () => void): void {
    const box = this.add.rectangle(x, y, 140, 40, UI_COLORS.wood).setStrokeStyle(3, UI_COLORS.edge).setInteractive({ useHandCursor: true });
    skinButton(box);
    this.add.text(x, y, label, { fontFamily: UI_FONT, fontSize: '17px', fontStyle: 'bold', color: '#fff2d0' }).setOrigin(0.5).setStroke('#2b1a10', 3);
    box.on('pointerover', () => box.setFillStyle(UI_COLORS.woodLight));
    box.on('pointerout', () => box.setFillStyle(UI_COLORS.wood));
    box.on('pointerdown', onClick);
  }
}
