import Phaser from 'phaser';
import { portraitKey } from '../scenes/PreloadScene';

/** A simple "someone is talking" box: portrait, name, one line of text. */
export class DialogueBox {
  private readonly root: Phaser.GameObjects.Container;
  private readonly portrait: Phaser.GameObjects.Image;
  private readonly nameText: Phaser.GameObjects.Text;
  private readonly lineText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, depth: number) {
    const width = scene.scale.width;
    const height = scene.scale.height;
    const boxW = Math.min(620, width - 48);
    const boxH = 120;
    const x = width / 2;
    const y = height - boxH / 2 - 56;

    this.root = scene.add.container(0, 0).setDepth(depth).setVisible(false);
    const panel = scene.add.rectangle(x, y, boxW, boxH, 0x241d17, 0.95).setStrokeStyle(2, 0xc9a66b);
    this.portrait = scene.add.image(x - boxW / 2 + 54, y, '').setDisplaySize(84, 84);
    const portraitFrame = scene.add
      .rectangle(x - boxW / 2 + 54, y, 88, 88, 0x000000, 0)
      .setStrokeStyle(2, 0xc9a66b);
    this.nameText = scene.add
      .text(x - boxW / 2 + 108, y - boxH / 2 + 14, '', {
        fontFamily: 'sans-serif',
        fontSize: '16px',
        color: '#ffe9a8',
      })
      .setOrigin(0, 0);
    this.lineText = scene.add
      .text(x - boxW / 2 + 108, y - 6, '', {
        fontFamily: 'sans-serif',
        fontSize: '15px',
        color: '#fff6e0',
        wordWrap: { width: boxW - 150 },
      })
      .setOrigin(0, 0);
    const hint = scene.add
      .text(x + boxW / 2 - 12, y + boxH / 2 - 10, 'E để đóng', { fontFamily: 'sans-serif', fontSize: '11px', color: '#c9bca6' })
      .setOrigin(1, 1);
    this.root.add([panel, this.portrait, portraitFrame, this.nameText, this.lineText, hint]);
  }

  open(npcId: string, name: string, line: string): void {
    // Re-apply the display size after swapping textures: setDisplaySize scales
    // relative to the frame at the time it's called, which was a blank 1x1
    // placeholder frame at construction time.
    this.portrait.setTexture(portraitKey(npcId)).setDisplaySize(84, 84);
    this.nameText.setText(name);
    this.lineText.setText(line);
    this.root.setVisible(true);
  }

  close(): void {
    this.root.setVisible(false);
  }

  get isOpen(): boolean {
    return this.root.visible;
  }
}
