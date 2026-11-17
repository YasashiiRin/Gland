import type { GameState } from '../state/GameState';

/**
 * Small "what changed" messages for the shared farm, so every action
 * (tilling, harvesting, chopping, placing, parking, buying...) reaches the
 * other players within a fraction of a second without resending everything.
 *
 * - Keyed records (plots, resource nodes, placed objects, vehicles,
 *   friendships) are compared per key; a changed key carries its new value,
 *   a removed key carries null. Simultaneous edits of one key: last write wins.
 * - Money and the shipping bin are sent as deltas, so two players earning or
 *   spending at the same time both count.
 * - The clock is not here: it has its own message from the host.
 */
export const RECORD_SLICES = ['farmPlots', 'resourceNodes', 'wildFields', 'fishPonds', 'placedObjects', 'vehicles', 'relationships', 'vehicleStorage'] as const;
export const WHOLE_SLICES = ['warehouse', 'communityFund', 'deepestFloor', 'farmName'] as const;

type RecordSlice = (typeof RECORD_SLICES)[number];
type WholeSlice = (typeof WHOLE_SLICES)[number];

export interface WorldPatch {
  records?: Partial<Record<RecordSlice, Record<string, unknown>>>;
  whole?: Partial<Pick<GameState, WholeSlice>>;
  /** Change in money since the last patch. */
  money?: number;
  /** Change in shipping-bin counts per item since the last patch. */
  bin?: Record<string, number>;
}

/** What was last sent/received, to diff the current state against. */
export interface Baseline {
  records: Record<RecordSlice, Record<string, string>>;
  whole: Record<WholeSlice, string>;
  money: number;
  bin: Record<string, number>;
}

export function snapshot(state: GameState): Baseline {
  const records = {} as Baseline['records'];
  for (const slice of RECORD_SLICES) {
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(state[slice] as Record<string, unknown>)) {
      if (value !== undefined) out[key] = JSON.stringify(value);
    }
    records[slice] = out;
  }
  const whole = {} as Baseline['whole'];
  for (const slice of WHOLE_SLICES) whole[slice] = JSON.stringify(state[slice]);
  return { records, whole, money: state.money, bin: { ...(state.shippingBin as Record<string, number>) } };
}

/** Changes in `state` since `base`, or null if nothing changed. */
export function diff(state: GameState, base: Baseline): WorldPatch | null {
  const patch: WorldPatch = {};
  for (const slice of RECORD_SLICES) {
    const now = state[slice] as Record<string, unknown>;
    const before = base.records[slice];
    const changes: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(now)) {
      if (value === undefined) continue;
      const json = JSON.stringify(value);
      if (before[key] !== json) changes[key] = JSON.parse(json);
    }
    for (const key of Object.keys(before)) if (now[key] === undefined) changes[key] = null;
    if (Object.keys(changes).length) (patch.records ??= {})[slice] = changes;
  }
  for (const slice of WHOLE_SLICES) {
    const json = JSON.stringify(state[slice]);
    if (json !== base.whole[slice]) Object.assign((patch.whole ??= {}), { [slice]: JSON.parse(json) });
  }
  if (state.money !== base.money) patch.money = state.money - base.money;
  const bin: Record<string, number> = {};
  const nowBin = state.shippingBin as Record<string, number>;
  for (const id of new Set([...Object.keys(nowBin), ...Object.keys(base.bin)])) {
    const d = (nowBin[id] ?? 0) - (base.bin[id] ?? 0);
    if (d !== 0) bin[id] = d;
  }
  if (Object.keys(bin).length) patch.bin = bin;
  return Object.keys(patch).length ? patch : null;
}

/** Applies someone else's patch to the local state. */
export function applyPatch(state: GameState, patch: WorldPatch): void {
  for (const slice of RECORD_SLICES) {
    const changes = patch.records?.[slice];
    if (!changes) continue;
    const next = { ...(state[slice] as Record<string, unknown>) };
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) delete next[key];
      else next[key] = value;
    }
    Object.assign(state, { [slice]: next });
  }
  if (patch.whole) Object.assign(state, structuredClone(patch.whole));
  if (patch.money) state.money = Math.max(0, state.money + patch.money);
  if (patch.bin) {
    const bin = { ...(state.shippingBin as Record<string, number>) };
    for (const [id, d] of Object.entries(patch.bin)) {
      const n = (bin[id] ?? 0) + d;
      if (n > 0) bin[id] = n;
      else delete bin[id];
    }
    state.shippingBin = bin;
  }
}

/** Keys of a record slice touched by a patch (for redrawing just those tiles). */
export function touchedKeys(patch: WorldPatch, slice: RecordSlice): string[] {
  return Object.keys(patch.records?.[slice] ?? {});
}
