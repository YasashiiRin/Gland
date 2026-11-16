/**
 * Multiplayer passenger seat: the id of the friend whose vehicle I'm sitting
 * in, or null. Session-only (never saved); the driver's position moves me.
 */
export const rideState = {
  passengerOf: null as string | null,
};
