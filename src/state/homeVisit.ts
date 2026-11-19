/**
 * Where you went into your house from (map and spot in front of the door), so
 * the door of the room inside leads back there. Not saved: after loading a
 * game inside, the way out leads to your home's yard.
 */
export const homeVisit = {
  from: null as { map: string; x: number; y: number } | null,
};
