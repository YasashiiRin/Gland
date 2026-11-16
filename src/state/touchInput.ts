/**
 * Virtual controls for phones/tablets, written by the on-screen joystick and
 * buttons (UIScene) and read by the map scenes alongside the keyboard.
 */
export const touchInput = {
  /** On-screen controls are showing. */
  enabled: false,
  up: false,
  down: false,
  left: false,
  right: false,
  useQueued: false,
  interactQueued: false,
};

/** True once per tap of the "use" button. */
export function consumeTouchUse(): boolean {
  const v = touchInput.useQueued;
  touchInput.useQueued = false;
  return v;
}

/** True once per tap of the "interact" button. */
export function consumeTouchInteract(): boolean {
  const v = touchInput.interactQueued;
  touchInput.interactQueued = false;
  return v;
}

export type TouchMode = 'auto' | 'on' | 'off';

/** Whether to show touch controls: forced on/off, or auto-detected from the device. */
export function wantsTouchControls(mode: TouchMode): boolean {
  if (mode !== 'auto') return mode === 'on';
  try {
    return window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  } catch {
    return false;
  }
}
