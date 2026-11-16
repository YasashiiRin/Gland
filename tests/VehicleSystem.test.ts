import { describe, expect, it } from 'vitest';
import { addVehicle, nearestParked, parkVehicle, recallAll, workArea } from '../src/systems/VehicleSystem';

const home = (id: string) => ({ mapKey: 'Farm', x: id === 'a' ? 100 : 200, y: 50, facing: 'down' as const });

describe('VehicleSystem', () => {
  it('adds a vehicle once and parks it elsewhere', () => {
    let owned = addVehicle({}, 'a', home('a'));
    owned = addVehicle(owned, 'a', { mapKey: 'Town', x: 0, y: 0, facing: 'up' });
    expect(owned.a?.mapKey).toBe('Farm');
    owned = parkVehicle(owned, 'a', { mapKey: 'Town', x: 5, y: 6, facing: 'left' });
    expect(owned.a).toEqual({ mapKey: 'Town', x: 5, y: 6, facing: 'left' });
    expect(parkVehicle(owned, 'zzz', home('a')).zzz).toBeUndefined();
  });

  it('finds the nearest parked vehicle on the same map only', () => {
    const owned = { a: home('a'), b: home('b'), c: { mapKey: 'Town', x: 101, y: 50, facing: 'down' as const } };
    expect(nearestParked(owned, 'Farm', 110, 50, 20)).toBe('a');
    expect(nearestParked(owned, 'Farm', 150, 50, 20)).toBeNull();
    expect(nearestParked(owned, 'Farm', 110, 50, 20, 'a')).toBeNull();
  });

  it('recalls vehicles that are away, but not the one being ridden', () => {
    const owned = { a: { mapKey: 'Town', x: 1, y: 1, facing: 'down' as const }, b: { mapKey: 'Town', x: 2, y: 2, facing: 'down' as const } };
    const result = recallAll(owned, home, 'b');
    expect(result.recalled).toBe(1);
    expect(result.owned.a).toEqual(home('a'));
    expect(result.owned.b?.mapKey).toBe('Town');
  });

  it('works on the 2x2 tiles around the centre point', () => {
    expect(workArea(32, 32, 16)).toEqual([{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }]);
    expect(workArea(40, 39, 16)[0]).toEqual({ x: 2, y: 1 });
  });
});
