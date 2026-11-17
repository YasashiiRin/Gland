import Phaser from 'phaser';
import { PLAYER_TEXTURE } from '../entities/Player';
import { artScale, hdScale } from './hd';
import { net } from '../net/NetSession';
import { DIRECTIONS } from '../systems/movement';
import { UI_FONT } from '../ui/uiStyle';

/** Tints so friends are easy to tell apart from you and from each other. */
const TINTS = [0xffd8a8, 0xb8e0ff];
/** How quickly a remote sprite catches up with its latest network position (0..1 per frame). */
const SMOOTHING = 0.3;

interface Remote {
  sprite: Phaser.GameObjects.Sprite;
  label: Phaser.GameObjects.Text;
  vehicle?: Phaser.GameObjects.Image;
}

/** Draws the other players who are on this map, smoothing between network updates. */
export class RemotePlayers {
  private readonly remotes = new Map<string, Remote>();

  constructor(private readonly scene: Phaser.Scene, private readonly mapKey: string) {
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.remotes.clear());
  }

  update(): void {
    if (!net.online) return;
    const seen = new Set<string>();
    let index = 0;
    for (const pose of net.poses.values()) {
      index++;
      if (pose.map !== this.mapKey) continue;
      seen.add(pose.id);
      let r = this.remotes.get(pose.id);
      if (!r) {
        const sprite = this.scene.add.sprite(pose.x, pose.y, PLAYER_TEXTURE, 0).setOrigin(0.5, 28 / 32).setScale(hdScale(this.scene, PLAYER_TEXTURE));
        sprite.setTint(TINTS[(index - 1) % TINTS.length]);
        const label = this.scene.add
          .text(pose.x, pose.y - 34, net.nameOf(pose.id), {
            fontFamily: UI_FONT,
            fontSize: '9px',
            color: '#fff6e0',
            backgroundColor: '#2b1a10aa',
          })
          .setPadding(2, 0, 2, 0)
          .setOrigin(0.5, 1)
          .setResolution(2);
        r = { sprite, label };
        this.remotes.set(pose.id, r);
      }
      const s = r.sprite;
      s.x += (pose.x - s.x) * SMOOTHING;
      s.y += (pose.y - s.y) * SMOOTHING;
      s.anims.play(`${pose.moving ? 'walk' : 'idle'}-${pose.dir}`, true);
      s.setDepth(s.y);
      r.label.setPosition(s.x, s.y - 30).setDepth(s.y + 1).setText(net.nameOf(pose.id));
      this.syncVehicle(r, pose.riding, pose.dir);
      if (pose.seatOf) this.cropRider(r.sprite); // sitting in a friend's vehicle
    }
    for (const [id, r] of this.remotes) {
      if (seen.has(id)) continue;
      r.sprite.destroy();
      r.label.destroy();
      r.vehicle?.destroy();
      this.remotes.delete(id);
    }
  }

  private syncVehicle(r: Remote, riding: string | null, dir: (typeof DIRECTIONS)[number]): void {
    const key = riding ? `vehicle_${riding}` : '';
    if (!riding || !this.scene.textures.exists(key)) {
      r.vehicle?.destroy();
      r.vehicle = undefined;
      if (r.sprite.isCropped) r.sprite.setCrop();
      return;
    }
    if (!r.vehicle || r.vehicle.texture.key !== key) {
      r.vehicle?.destroy();
      r.vehicle = this.scene.add.image(0, 0, key, 0).setOrigin(0.5, 1).setScale(hdScale(this.scene, key));
    }
    r.vehicle
      .setFrame(DIRECTIONS.indexOf(dir))
      .setPosition(r.sprite.x, r.sprite.y + 4)
      .setDepth(r.sprite.depth + (dir === 'down' ? 0.5 : -0.5));
    this.cropRider(r.sprite);
  }

  /** Hides a rider's legs (the vehicle covers them). */
  private cropRider(sprite: Phaser.GameObjects.Sprite): void {
    const k = artScale(this.scene, PLAYER_TEXTURE);
    sprite.setCrop(0, 0, 16 * k, 23 * k);
  }
}
