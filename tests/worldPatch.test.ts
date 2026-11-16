import { describe, expect, it } from 'vitest';
import { applyPatch, diff, snapshot, touchedKeys } from '../src/net/worldPatch';
import { createInitialState } from '../src/state/GameState';

describe('worldPatch', () => {
  it('reports nothing when nothing changed', () => {
    const s = createInitialState();
    expect(diff(s, snapshot(s))).toBeNull();
  });

  it('sends changed and removed keys, and applies them on the other side', () => {
    const a = createInitialState();
    a.farmPlots = { '1,1': { tilled: true, growthDay: 0, wateredToday: false }, '2,2': { tilled: true, growthDay: 0, wateredToday: false } };
    const b = structuredClone(a);
    const base = snapshot(a);
    a.farmPlots = { '1,1': { ...a.farmPlots['1,1'], wateredToday: true }, '3,3': { tilled: true, growthDay: 0, wateredToday: false } };
    const patch = diff(a, base);
    expect(touchedKeys(patch!, 'farmPlots').sort()).toEqual(['1,1', '2,2', '3,3']);
    applyPatch(b, patch!);
    expect(b.farmPlots).toEqual(a.farmPlots);
  });

  it('merges money and shipping-bin changes from two players as deltas', () => {
    const host = createInitialState();
    host.money = 1000;
    const guest = structuredClone(host);
    const hostBase = snapshot(host);
    const guestBase = snapshot(guest);
    host.money -= 300; // host buys something
    host.shippingBin = { rice: 5 };
    guest.money += 50; // guest earns something at the same time
    guest.shippingBin = { rice: 2, potato: 1 };
    const fromHost = diff(host, hostBase)!;
    const fromGuest = diff(guest, guestBase)!;
    applyPatch(host, fromGuest);
    applyPatch(guest, fromHost);
    expect(host.money).toBe(750);
    expect(guest.money).toBe(750);
    expect(host.shippingBin).toEqual({ rice: 7, potato: 1 });
    expect(guest.shippingBin).toEqual(host.shippingBin);
  });

  it('carries whole slices like the warehouse', () => {
    const a = createInitialState();
    const b = structuredClone(a);
    const base = snapshot(a);
    a.warehouse.slots[0] = { itemId: 'wood', quantity: 20 };
    applyPatch(b, diff(a, base)!);
    expect(b.warehouse.slots[0]).toEqual({ itemId: 'wood', quantity: 20 });
  });
});
