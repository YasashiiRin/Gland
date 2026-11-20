/**
 * Rebindable keyboard controls: each action has up to two keys (DOM key
 * codes, the same numbers as Phaser.Input.Keyboard.KeyCodes). A key belongs
 * to one action at a time: binding it elsewhere takes it off the old one.
 * Pure data, no Phaser.
 */
export const MAX_KEYS_PER_ACTION = 2;

export const ACTIONS = [
  { id: 'up', label: 'Đi lên' },
  { id: 'down', label: 'Đi xuống' },
  { id: 'left', label: 'Sang trái' },
  { id: 'right', label: 'Sang phải' },
  { id: 'use', label: 'Dùng đồ đang cầm' },
  { id: 'interact', label: 'Tương tác / lên xe' },
  { id: 'inventory', label: 'Túi đồ' },
  { id: 'crafting', label: 'Chế tạo' },
  { id: 'minimap', label: 'Bản đồ nhỏ' },
  { id: 'settings', label: 'Cài đặt' },
  { id: 'close', label: 'Đóng bảng' },
  { id: 'ability', label: 'Phép đầu tiên (thầy pháp)' },
  ...Array.from({ length: 12 }, (_, i) => ({ id: `hotbar${i + 1}`, label: `Ô công cụ ${i + 1}` })),
] as const;

export type ActionId = (typeof ACTIONS)[number]['id'];
export const ACTION_IDS: readonly ActionId[] = ACTIONS.map((a) => a.id);
export const HOTBAR_ACTIONS: readonly ActionId[] = ACTION_IDS.filter((id) => id.startsWith('hotbar'));

export type KeyBindings = Record<ActionId, number[]>;
/** What a save keeps: only the actions changed from the defaults need to be there. */
export type SavedBindings = Partial<Record<string, number[]>>;

const K = {
  BACKSPACE: 8, TAB: 9, ENTER: 13, SHIFT: 16, CTRL: 17, ALT: 18, ESC: 27, SPACE: 32,
  LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, MINUS: 189, PLUS: 187,
} as const;
const letter = (c: string): number => c.charCodeAt(0);
const digit = (d: number): number => 48 + d;

export const DEFAULT_BINDINGS: KeyBindings = {
  up: [letter('W'), K.UP],
  down: [letter('S'), K.DOWN],
  left: [letter('A'), K.LEFT],
  right: [letter('D'), K.RIGHT],
  use: [K.SPACE],
  interact: [letter('E')],
  inventory: [letter('I')],
  crafting: [letter('C')],
  minimap: [letter('M')],
  settings: [K.TAB],
  close: [K.ESC],
  ability: [letter('Q')],
  hotbar1: [digit(1)], hotbar2: [digit(2)], hotbar3: [digit(3)], hotbar4: [digit(4)],
  hotbar5: [digit(5)], hotbar6: [digit(6)], hotbar7: [digit(7)], hotbar8: [digit(8)],
  hotbar9: [digit(9)], hotbar10: [digit(0)], hotbar11: [K.MINUS], hotbar12: [K.PLUS],
};

/** The bindings in effect: saved ones over the defaults (new actions get their default). */
export function resolveBindings(saved: SavedBindings | undefined): KeyBindings {
  const out = {} as KeyBindings;
  for (const id of ACTION_IDS) {
    const keys = saved?.[id];
    out[id] = (Array.isArray(keys) ? keys : DEFAULT_BINDINGS[id]).filter((k) => Number.isInteger(k)).slice(0, MAX_KEYS_PER_ACTION);
  }
  return out;
}

/**
 * Puts `code` in slot `slot` (0 or 1) of `action`, taking it off any other
 * action that had it. Returns the new bindings and that other action, if any.
 */
export function assignKey(bindings: KeyBindings, action: ActionId, slot: number, code: number): { bindings: KeyBindings; takenFrom: ActionId | null } {
  let takenFrom: ActionId | null = null;
  const out = {} as KeyBindings;
  for (const id of ACTION_IDS) {
    const keys = bindings[id].filter((k) => k !== code);
    if (id !== action && keys.length !== bindings[id].length) takenFrom = id;
    out[id] = keys;
  }
  const keys = [...out[action]];
  const at = Math.min(Math.max(0, slot), keys.length, MAX_KEYS_PER_ACTION - 1);
  if (at < keys.length) keys[at] = code;
  else keys.push(code);
  out[action] = keys.slice(0, MAX_KEYS_PER_ACTION);
  return { bindings: out, takenFrom };
}

/** Removes the key in slot `slot` of `action`. */
export function clearKey(bindings: KeyBindings, action: ActionId, slot: number): KeyBindings {
  return { ...bindings, [action]: bindings[action].filter((_, i) => i !== slot) };
}

/** Which action a key does, if any. */
export function actionOfKey(bindings: KeyBindings, code: number): ActionId | null {
  return ACTION_IDS.find((id) => bindings[id].includes(code)) ?? null;
}

const NAMES: Record<number, string> = {
  [K.BACKSPACE]: 'Backspace', [K.TAB]: 'Tab', [K.ENTER]: 'Enter', [K.SHIFT]: 'Shift', [K.CTRL]: 'Ctrl', [K.ALT]: 'Alt',
  [K.ESC]: 'Esc', [K.SPACE]: 'Space', [K.LEFT]: '←', [K.UP]: '↑', [K.RIGHT]: '→', [K.DOWN]: '↓',
  [K.MINUS]: '-', [K.PLUS]: '=', 186: ';', 188: ',', 190: '.', 191: '/', 192: '`', 219: '[', 220: '\\', 221: ']', 222: "'",
};

/** A short name to show for a key code. */
export function keyName(code: number | undefined): string {
  if (code === undefined) return '—';
  if (NAMES[code]) return NAMES[code];
  if ((code >= 48 && code <= 57) || (code >= 65 && code <= 90)) return String.fromCharCode(code);
  if (code >= 96 && code <= 105) return `Num ${code - 96}`;
  if (code >= 112 && code <= 123) return `F${code - 111}`;
  return `#${code}`;
}

/** "W / ↑" */
export function keysLabel(bindings: KeyBindings, action: ActionId): string {
  const keys = bindings[action];
  return keys.length ? keys.map(keyName).join(' / ') : '—';
}

/** Only the actions that differ from the defaults (what gets saved). */
export function changedBindings(bindings: KeyBindings): SavedBindings {
  const out: SavedBindings = {};
  for (const id of ACTION_IDS) {
    if (bindings[id].join(',') !== DEFAULT_BINDINGS[id].join(',')) out[id] = [...bindings[id]];
  }
  return out;
}
