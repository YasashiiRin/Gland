import { describe, expect, it } from 'vitest';
import {
  advanceResourceDay,
  hitResource,
  isCleared,
  resourceKey,
  rollFiberYield,
  rollStoneYield,
  rollWoodYield,
  type ResourceNodes,
} from '../src/systems/ResourceSystem';

describe('hitResource', () => {
  it('takes 3 hits to fell a tree', () => {
    const key = resourceKey('Farm', 5, 5);
    let nodes: ResourceNodes = {};
    let r = hitResource(nodes, key, 'tree', 1);
    expect(r.broke).toBe(false);
    expect(r.nodes[key].health).toBe(2);
    nodes = r.nodes;
    r = hitResource(nodes, key, 'tree', 1);
    expect(r.broke).toBe(false);
    nodes = r.nodes;
    r = hitResource(nodes, key, 'tree', 1);
    expect(r.broke).toBe(true);
    expect(r.nodes[key].clearedOnDay).toBe(1);
  });

  it('a rock breaks in one hit', () => {
    const key = resourceKey('Farm', 1, 1);
    const r = hitResource({}, key, 'rock', 5);
    expect(r.broke).toBe(true);
    expect(r.nodes[key].clearedOnDay).toBe(5);
  });

  it('hitting an already-cleared node does nothing', () => {
    const key = resourceKey('Farm', 1, 1);
    const cleared: ResourceNodes = { [key]: { kind: 'rock', health: 0, clearedOnDay: 5 } };
    const r = hitResource(cleared, key, 'rock', 6);
    expect(r.broke).toBe(false);
    expect(r.nodes).toBe(cleared);
  });
});

describe('isCleared / advanceResourceDay', () => {
  it('a rock comes back 15 days after it was broken', () => {
    const key = resourceKey('Farm', 2, 2);
    const nodes: ResourceNodes = { [key]: { kind: 'rock', health: 0, clearedOnDay: 10 } };
    expect(isCleared(nodes[key], 24)).toBe(true);
    expect(isCleared(nodes[key], 25)).toBe(false);
  });

  it('a tree grows back 15 days after it was felled (also one felled on day 0)', () => {
    const key = resourceKey('Farm', 3, 3);
    const nodes: ResourceNodes = { [key]: { kind: 'tree', health: 0, clearedOnDay: 0 } };
    expect(isCleared(nodes[key], 14)).toBe(true);
    expect(isCleared(nodes[key], 15)).toBe(false);
  });

  it('advanceResourceDay drops entries whose respawn window has passed', () => {
    const treeKey = resourceKey('Farm', 1, 1);
    const rockKey = resourceKey('Farm', 2, 2);
    const nodes: ResourceNodes = {
      [treeKey]: { kind: 'tree', health: 0, clearedOnDay: 1 }, // grows back day 16
      [rockKey]: { kind: 'rock', health: 0, clearedOnDay: 3 }, // back day 18
    };
    const next = advanceResourceDay(nodes, 18);
    expect(next[treeKey]).toBeUndefined();
    expect(next[rockKey]).toBeUndefined();
  });

  it('advanceResourceDay keeps entries still within their respawn window', () => {
    const key = resourceKey('Farm', 1, 1);
    const nodes: ResourceNodes = { [key]: { kind: 'tree', health: 0, clearedOnDay: 3 } };
    const next = advanceResourceDay(nodes, 4);
    expect(next[key]).toEqual(nodes[key]);
  });
});

describe('yield rolls stay within their documented ranges', () => {
  it('wood is 3-6', () => {
    for (let i = 0; i < 50; i++) {
      const v = rollWoodYield(Math.random);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(6);
    }
  });
  it('stone is 1-3', () => {
    for (let i = 0; i < 50; i++) {
      const v = rollStoneYield(Math.random);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(3);
    }
  });
  it('fiber is 1-2', () => {
    for (let i = 0; i < 50; i++) {
      const v = rollFiberYield(Math.random);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(2);
    }
  });
});
