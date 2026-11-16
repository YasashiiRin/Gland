import Phaser from 'phaser';

/**
 * A real HTML text box laid over the canvas (Phaser has no text input of its
 * own). Positioned in game coordinates and kept aligned when the canvas is
 * resized; removed automatically when the scene shuts down.
 */
export function createHtmlInput(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  options: { placeholder?: string; value?: string; maxLength?: number; uppercase?: boolean } = {},
): HTMLInputElement {
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = options.placeholder ?? '';
  input.value = options.value ?? '';
  input.maxLength = options.maxLength ?? 16;
  input.spellcheck = false;
  input.autocomplete = 'off';
  Object.assign(input.style, {
    position: 'fixed',
    zIndex: '10',
    font: 'bold 18px "Trebuchet MS", "Segoe UI", sans-serif',
    color: '#4a2c18',
    background: '#f1ddb0',
    border: '3px solid #2b1a10',
    borderRadius: '6px',
    padding: '4px 8px',
    textAlign: 'center',
    textTransform: options.uppercase ? 'uppercase' : 'none',
    userSelect: 'text',
    outline: 'none',
  } satisfies Partial<CSSStyleDeclaration>);
  // Keys typed here must not also move the farmer or toggle menus.
  input.addEventListener('keydown', (e) => e.stopPropagation());
  document.body.appendChild(input);

  const place = () => {
    const rect = scene.game.canvas.getBoundingClientRect();
    const k = rect.width / scene.scale.width;
    input.style.left = `${rect.left + (x - width / 2) * k}px`;
    input.style.top = `${rect.top + (y - 18) * k}px`;
    input.style.width = `${width * k - 22}px`;
    input.style.fontSize = `${18 * k}px`;
  };
  place();
  scene.scale.on(Phaser.Scale.Events.RESIZE, place);
  window.addEventListener('resize', place);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.scale.off(Phaser.Scale.Events.RESIZE, place);
    window.removeEventListener('resize', place);
    input.remove();
  });
  return input;
}
