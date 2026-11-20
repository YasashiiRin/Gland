import { describe, expect, it } from 'vitest';
import { clampOffset, elementOf, moveElement, scaleElement, toggleHidden, transformFor } from '../src/systems/UiLayout';

describe('UI layout', () => {
  it('blocks start where they were drawn, full size and shown', () => {
    expect(elementOf({}, 'minimap')).toEqual({ dx: 0, dy: 0, scale: 1, hidden: false });
  });

  it('moves, resizes within 60–180% and hides', () => {
    let l = moveElement({}, 'hotbar', 12.4, -30);
    expect(elementOf(l, 'hotbar')).toMatchObject({ dx: 12, dy: -30 });
    for (let i = 0; i < 20; i++) l = scaleElement(l, 'hotbar', 1);
    expect(elementOf(l, 'hotbar').scale).toBe(1.8);
    for (let i = 0; i < 20; i++) l = scaleElement(l, 'hotbar', -1);
    expect(elementOf(l, 'hotbar').scale).toBe(0.6);
    l = toggleHidden(l, 'hotbar');
    expect(elementOf(l, 'hotbar')).toMatchObject({ hidden: true, dx: 12 });
  });

  it('scales around the middle of the block, then moves it', () => {
    expect(transformFor({ x: 100, y: 50 }, { dx: 0, dy: 0, scale: 1, hidden: false })).toEqual({ x: 0, y: 0, scale: 1 });
    // At 2x around (100, 50): that point stays put.
    const t = transformFor({ x: 100, y: 50 }, { dx: 10, dy: 0, scale: 2, hidden: false });
    expect(t).toEqual({ x: -90, y: -50, scale: 2 });
    expect(t.x + 100 * t.scale).toBe(110);
  });

  it('keeps a block on screen', () => {
    expect(clampOffset({ x: 100, y: 100 }, -500, 20, 800, 600)).toEqual({ dx: -92, dy: 20 });
  });
});
