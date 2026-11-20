import type Phaser from 'phaser';
import { gameState } from '../state/GameState';
import { elementOf, transformFor } from '../systems/UiLayout';

export interface LayoutTarget {
  id: string;
  label: string;
  /** The container that gets moved/scaled/hidden. */
  node: Phaser.GameObjects.Container;
  /** Middle of its default bounds (scaling happens around it). */
  pivot: { x: number; y: number };
  /** Only offered in the editor while this holds (e.g. a profession's blocks). */
  when?: () => boolean;
}

export interface AddOptions {
  /** Wrap the component's root in a container of our own (it shows/hides its root itself). */
  wrap: boolean;
  /** Where to scale around, for a block that is empty at first (else the middle of its bounds). */
  pivot?: { x: number; y: number };
  when?: () => boolean;
}

/**
 * Applies the player's layout (settings.layout) to the on-screen blocks:
 * HUD pieces and phone buttons. A block whose component shows/hides its own
 * root is wrapped in a container of its own, so both can be hidden.
 */
export class LayoutHost {
  readonly targets: LayoutTarget[] = [];
  /** The layout editor is open: hidden blocks show faintly so they can be brought back. */
  editing = false;

  constructor(private readonly scene: Phaser.Scene) {}

  add(id: string, label: string, root: Phaser.GameObjects.Container, options: AddOptions): void {
    let node = root;
    if (options.wrap) {
      node = this.scene.add.container(0, 0).setDepth(root.depth);
      node.add(root);
    }
    const b = node.getBounds();
    const pivot = options.pivot ?? { x: b.centerX, y: b.centerY };
    this.targets.push({ id, label, node, pivot, when: options.when });
    this.apply();
  }

  apply(): void {
    for (const t of this.targets) {
      const el = elementOf(gameState.settings.layout, t.id);
      const { x, y, scale } = transformFor(t.pivot, el);
      t.node.setPosition(x, y).setScale(scale);
      t.node.setVisible(!el.hidden || this.editing);
      t.node.setAlpha(el.hidden && this.editing ? 0.35 : 1);
    }
  }
}
