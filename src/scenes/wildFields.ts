import type Phaser from 'phaser';
import { TILE_GID } from '../config/tileGids';
import { gameState } from '../state/GameState';
import { consume, isExhausted } from '../systems/EnergySystem';
import { addItem } from '../systems/InventorySystem';
import { addXp } from '../systems/SkillSystem';
import { isReaped, reapWildRice, seasonStamp, WILD_FIELD, wildFieldKey } from '../systems/WildFieldSystem';

/**
 * The ripe village rice on a province map: reaped tiles show stubble until
 * the season turns. Pure rules live in WildFieldSystem; this only touches tiles.
 */
export class WildRice {
  constructor(
    private readonly mapKey: string,
    private readonly decor: Phaser.Tilemaps.TilemapLayer,
  ) {}

  /** On entering the map (and after someone else reaps): stubble where it was reaped this season. */
  refresh(keys: Iterable<string> = Object.keys(gameState.wildFields)): void {
    const prefix = `${this.mapKey}:`;
    const stamp = seasonStamp(gameState.time);
    for (const key of keys) {
      if (!key.startsWith(prefix) || !isReaped(gameState.wildFields, key, stamp)) continue;
      const [x, y] = key.slice(prefix.length).split(',').map(Number);
      if (this.decor.getTileAt(x, y)?.index === TILE_GID.RICE) this.decor.putTileAt(TILE_GID.STUBBLE, x, y);
    }
  }

  /** Reaps the rice on `tile`; returns what to tell the player, or null if there is no ripe rice there. */
  tryReap(tile: { x: number; y: number }): string | null {
    if (this.decor.getTileAt(tile.x, tile.y)?.index !== TILE_GID.RICE) return null;
    if (isExhausted(gameState.energy)) return 'Mệt quá, không gặt nổi nữa';
    const result = reapWildRice(gameState.wildFields, wildFieldKey(this.mapKey, tile.x, tile.y), seasonStamp(gameState.time));
    if (!result) return null;
    gameState.wildFields = result.fields;
    gameState.energy = consume(gameState.energy, WILD_FIELD.energyCost);
    gameState.skills = addXp(gameState.skills, 'farming', WILD_FIELD.xp).skills;
    this.decor.putTileAt(TILE_GID.STUBBLE, tile.x, tile.y);
    if (result.rice === 0) return 'Gặt lúa…';
    const added = addItem(gameState.inventory, 'rice', result.rice);
    gameState.inventory = added.state;
    return added.leftover > 0 ? 'Túi đồ đầy rồi!' : `+${result.rice} Lúa`;
  }
}
