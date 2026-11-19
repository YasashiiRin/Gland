import ground from '../data/ground.json';
import type { ItemId } from '../data/items';

/**
 * Paths the player makes in the grass (pure, no Phaser). A stroke of the hoe
 * on grass leaves a bare dirt path; left alone, grass creeps back: faint after
 * a few days (a sign to clear it again), all grass after a few more. Paving a
 * path with stone stops that for good, until the paving is broken up again.
 * Keys are "Map:x,y" like farm plots; days are absolute day numbers.
 */
export type GroundEditKind = 'path' | 'stone';

export interface GroundEdit {
  kind: GroundEditKind;
  /** Day the path was last cleared (grass grows back counting from it). */
  madeDay: number;
}

export type GroundEdits = Record<string, GroundEdit>;

export const GRASS_FAINT_AFTER = ground.grassFaintAfterDays;
export const GRASS_BACK_AFTER = ground.grassBackAfterDays;
export const PAVE_ITEM = ground.paveItem as ItemId;

/** How grown over a bare tile is after this many days: none yet, faint grass, or grass again (gone). */
export function grassAfter(daysBare: number): 'bare' | 'faint' | 'grass' {
  if (daysBare >= GRASS_BACK_AFTER) return 'grass';
  return daysBare >= GRASS_FAINT_AFTER ? 'faint' : 'bare';
}

/** What a path tile looks like today: bare, faint grass, or paved. */
export function pathLook(edit: GroundEdit, today: number): 'bare' | 'faint' | 'stone' {
  if (edit.kind === 'stone') return 'stone';
  return grassAfter(today - edit.madeDay) === 'faint' ? 'faint' : 'bare';
}

/** A stroke of the hoe on grass: a fresh dirt path. On a path: grass cleared off it again. */
export function digPath(edits: GroundEdits, key: string, today: number): GroundEdits {
  if (edits[key]?.kind === 'stone') return edits;
  return { ...edits, [key]: { kind: 'path', madeDay: today } };
}

/** Lays a stone on a dirt path (null: there is no dirt path there). */
export function pave(edits: GroundEdits, key: string): GroundEdits | null {
  if (edits[key]?.kind !== 'path') return null;
  return { ...edits, [key]: { kind: 'stone', madeDay: edits[key].madeDay } };
}

/** Breaks up the paving: a bare path again, grass starts creeping back from today (null: no paving). */
export function unpave(edits: GroundEdits, key: string, today: number): GroundEdits | null {
  if (edits[key]?.kind !== 'stone') return null;
  return { ...edits, [key]: { kind: 'path', madeDay: today } };
}

/** The path is gone (tilled for planting). */
export function clearEdit(edits: GroundEdits, key: string): GroundEdits {
  if (!(key in edits)) return edits;
  const next = { ...edits };
  delete next[key];
  return next;
}

/** A new day: paths left bare long enough are grass again. */
export function advanceGroundDay(edits: GroundEdits, today: number): GroundEdits {
  let next: GroundEdits | null = null;
  for (const [key, e] of Object.entries(edits)) {
    if (e.kind === 'path' && grassAfter(today - e.madeDay) === 'grass') {
      next ??= { ...edits };
      delete next[key];
    }
  }
  return next ?? edits;
}

export type HoeAction =
  /** Paved: the hoe can't get through (the pickaxe can). */
  | 'paved'
  /** A path growing over: the grass is cleared off it, it stays a path. */
  | 'weedPath'
  /** A bare path: dug over into a plot for planting. */
  | 'tillPath'
  /** An empty plot growing over: weeded. */
  | 'weedPlot'
  /** Grass: a dirt path. */
  | 'dig'
  /** Bare earth (no grass to clear): straight to a plot. */
  | 'tillDirt'
  | 'none';

export interface HoeSpot {
  edit?: GroundEdit;
  /** A farm plot is here; `faint`: empty and grass is creeping back over it. */
  plot?: { faint: boolean };
  ground: 'grass' | 'dirt' | 'other';
  /** Something stands there (a tree, a rock, a bush...). */
  blocked: boolean;
}

/** What a stroke of the hoe does here (grass -> path -> plot; clearing what grows back). */
export function hoeAction(spot: HoeSpot, today: number): HoeAction {
  if (spot.edit?.kind === 'stone') return 'paved';
  if (spot.edit) return pathLook(spot.edit, today) === 'faint' ? 'weedPath' : 'tillPath';
  if (spot.plot) return spot.plot.faint ? 'weedPlot' : 'none';
  if (spot.blocked) return 'none';
  if (spot.ground === 'grass') return 'dig';
  return spot.ground === 'dirt' ? 'tillDirt' : 'none';
}
