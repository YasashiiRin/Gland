import { TILE } from '../config/constants';
import { gameState } from '../state/GameState';
import { rideState } from '../state/rideState';
import { restState } from '../state/staminaClock';
import { pixelsToMetres, pump, tickRest, travel, type TravelMode } from '../systems/StaminaSystem';

/** A jump longer than this in one frame is a teleport (door, mounting, map load), not travel. */
const MAX_STEP_PX = 32;

/**
 * Per-scene glue for StaminaSystem: charges energy for every metre walked
 * or cycled, runs the rest counter at 0 energy and pumps the recovery bar
 * into energy when a long enough rest ends.
 */
export class StaminaTracker {
  private lastX: number;
  private lastY: number;
  private lastEnergy: number;

  constructor(private readonly player: { x: number; y: number }) {
    this.lastX = player.x;
    this.lastY = player.y;
    this.lastEnergy = gameState.energy.current;
  }

  /** Call once a frame. Returns a message when the recovery bar pumped energy back. */
  update(deltaMs: number): string | null {
    let step = Math.hypot(this.player.x - this.lastX, this.player.y - this.lastY);
    this.lastX = this.player.x;
    this.lastY = this.player.y;
    if (step > MAX_STEP_PX) step = 0;

    const mode = travelMode();
    const moving = !!mode && step > 0;
    // Energy spent since last frame (tools, work...) also counts as exertion.
    const spent = gameState.energy.current < this.lastEnergy;

    let message: string | null = null;
    const { rest, pumpSeconds } = tickRest(restState, gameState.energy, moving || spent, deltaMs / 1000);
    restState.seconds = rest.seconds;
    if (pumpSeconds > 0) {
      const result = pump(gameState.energy, gameState.recovery, pumpSeconds);
      gameState.energy = result.energy;
      gameState.recovery = result.recovery;
      if (result.gained > 0) message = `Hồi phục: +${Math.round(result.gained)} năng lượng`;
    }
    if (moving) gameState.energy = travel(gameState.energy, pixelsToMetres(step, TILE), mode);
    this.lastEnergy = gameState.energy.current;
    return message;
  }
}

/** How the player is getting about right now, or null when it costs no stamina (motor vehicles, boats, riding along). */
function travelMode(): TravelMode | null {
  if (rideState.passengerOf || gameState.boating) return null;
  if (!gameState.riding) return 'walk';
  return gameState.riding === 'bicycle' ? 'bicycle' : null;
}
