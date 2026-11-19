import Phaser from 'phaser';

interface PackFile {
  type: string;
  key: string;
  url: string;
}

/**
 * Loads the painted UI skin ("ui_*" pictures of the sprite pack: title
 * backdrop, panels, buttons) before the title screen, which comes before the
 * main Preload. Without them the title screen keeps its drawn look.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    this.load.setPath('assets');
    this.load.json('pack_boot', 'sprites/pack.json');
  }

  create(): void {
    const pack = this.cache.json.get('pack_boot') as { generated?: { files?: PackFile[] } } | undefined;
    const ui = (pack?.generated?.files ?? []).filter((f) => f.type === 'image' && f.key.startsWith('ui_'));
    if (!ui.length) {
      this.scene.start('Title');
      return;
    }
    for (const f of ui) this.load.image(f.key, f.url);
    this.load.once(Phaser.Loader.Events.COMPLETE, () => this.scene.start('Title'));
    this.load.start();
  }
}
