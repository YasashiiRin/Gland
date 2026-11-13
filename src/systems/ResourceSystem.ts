export type ResourceKind = 'tree' | 'rock' | 'weed';

export interface ResourceNodeState {
  kind: ResourceKind;
  /** Remaining hits before this node breaks. Weeds and rocks start at 1. */
  health: number;
  /** Set once the node breaks; absolute day number it happened on, for respawn timing. */
  clearedOnDay?: number;
}

export type ResourceNodes = Record<string, ResourceNodeState>;

export function resourceKey(mapKey: string, x: number, y: number): string {
  return `${mapKey}:${x},${y}`;
}

export const STARTING_HEALTH: Record<ResourceKind, number> = { tree: 3, rock: 1, weed: 1 };
export const RESPAWN_DAYS: Record<ResourceKind, number> = { tree: 3, rock: 1, weed: 1 };

export const TOOL_FOR_KIND: Record<ResourceKind, string> = { tree: 'axe', rock: 'pickaxe', weed: 'scythe' };

export interface HitResult {
  nodes: ResourceNodes;
  broke: boolean;
}

/**
 * Hits a resource node (creating it at full health on the first hit). Once
 * health reaches 0 the node is marked cleared on `nowDay` so it can respawn
 * later, and the caller should remove/hide the tile and grant the yield.
 */
export function hitResource(nodes: ResourceNodes, key: string, kind: ResourceKind, nowDay: number): HitResult {
  const existing = nodes[key] ?? { kind, health: STARTING_HEALTH[kind] };
  if (existing.clearedOnDay !== undefined) return { nodes, broke: false }; // already cleared, nothing to hit
  const health = existing.health - 1;
  if (health <= 0) {
    return { nodes: { ...nodes, [key]: { kind, health: 0, clearedOnDay: nowDay } }, broke: true };
  }
  return { nodes: { ...nodes, [key]: { kind, health } }, broke: false };
}

/** True while the node should still be hidden/depleted (not enough days have passed to respawn). */
export function isCleared(node: ResourceNodeState | undefined, nowDay: number): boolean {
  if (!node?.clearedOnDay) return false;
  return nowDay - node.clearedOnDay < RESPAWN_DAYS[node.kind];
}

/** Call once per new day: nodes whose respawn window has passed are simply removed (letting the base tile show again). */
export function advanceResourceDay(nodes: ResourceNodes, nowDay: number): ResourceNodes {
  const next: ResourceNodes = {};
  for (const [key, node] of Object.entries(nodes)) {
    if (node.clearedOnDay !== undefined && nowDay - node.clearedOnDay >= RESPAWN_DAYS[node.kind]) {
      continue; // respawned: drop the entry entirely
    }
    next[key] = node;
  }
  return next;
}

export function rollWoodYield(random: () => number = Math.random): number {
  return 3 + Math.floor(random() * 4); // 3-6
}

export function rollStoneYield(random: () => number = Math.random): number {
  return 1 + Math.floor(random() * 3); // 1-3
}

export function rollFiberYield(random: () => number = Math.random): number {
  return 1 + Math.floor(random() * 2); // 1-2
}
