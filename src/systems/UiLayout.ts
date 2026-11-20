/**
 * Where the player moved, resized or hid each on-screen block (HUD pieces and
 * phone buttons). Offsets are screen pixels from the block's default place,
 * so a layout survives a window resize. Pure data, no Phaser.
 */
export interface ElementLayout {
  dx: number;
  dy: number;
  scale: number;
  hidden: boolean;
}

export type UiLayout = Partial<Record<string, ElementLayout>>;

export const SCALE_MIN = 0.6;
export const SCALE_MAX = 1.8;
export const SCALE_STEP = 0.1;

const DEFAULT: ElementLayout = { dx: 0, dy: 0, scale: 1, hidden: false };

export function elementOf(layout: UiLayout | undefined, id: string): ElementLayout {
  return { ...DEFAULT, ...(layout?.[id] ?? {}) };
}

function withElement(layout: UiLayout, id: string, change: Partial<ElementLayout>): UiLayout {
  return { ...layout, [id]: { ...elementOf(layout, id), ...change } };
}

export function moveElement(layout: UiLayout, id: string, dx: number, dy: number): UiLayout {
  return withElement(layout, id, { dx: Math.round(dx), dy: Math.round(dy) });
}

/** One step bigger (+1) or smaller (-1), within 60–180%. */
export function scaleElement(layout: UiLayout, id: string, direction: 1 | -1): UiLayout {
  const next = elementOf(layout, id).scale + direction * SCALE_STEP;
  const scale = Math.round(Math.min(SCALE_MAX, Math.max(SCALE_MIN, next)) * 10) / 10;
  return withElement(layout, id, { scale });
}

export function toggleHidden(layout: UiLayout, id: string): UiLayout {
  return withElement(layout, id, { hidden: !elementOf(layout, id).hidden });
}

/**
 * Container transform for a block drawn at its default place: scaled around
 * `pivot` (the middle of its default bounds), then moved by its offset.
 */
export function transformFor(pivot: { x: number; y: number }, el: ElementLayout): { x: number; y: number; scale: number } {
  return { x: pivot.x * (1 - el.scale) + el.dx, y: pivot.y * (1 - el.scale) + el.dy, scale: el.scale };
}

/** Keeps a block's middle on screen: clamps the offset so `pivot + offset` stays inside. */
export function clampOffset(pivot: { x: number; y: number }, dx: number, dy: number, width: number, height: number): { dx: number; dy: number } {
  const x = Math.min(width - 8, Math.max(8, pivot.x + dx));
  const y = Math.min(height - 8, Math.max(8, pivot.y + dy));
  return { dx: x - pivot.x, dy: y - pivot.y };
}
