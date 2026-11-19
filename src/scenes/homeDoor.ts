import { TILE } from '../config/constants';
import { EventBus, GameEvents } from '../events/EventBus';
import { gameState } from '../state/GameState';
import { ownerName } from '../state/owner';
import { houseOn, moveHome, nextUpgrade, upgradeHouse } from '../systems/HomeSystem';
import type { ChoiceOption, ChoiceRequest } from '../ui/ChoiceMenu';
import type { Homestead } from './homesteads';

interface Hooks {
  homesteads: () => Homestead[];
  mine: () => Homestead | undefined;
  player: () => { x: number; y: number };
  sleep: () => void;
  /** Step inside your own house (the room of the "Home" map). */
  enter: () => void;
  /** Redraw the map where the player stands (a house was rebuilt, or they moved). */
  redraw: () => void;
  say: (text: string) => void;
}

/**
 * The tile in front of a homestead house's door: just below the house, in line
 * with the yard gate (the house stands on rows 3-8 of the plot, the gate is
 * below row 17; scripts/art/homesteads.py).
 */
export function doorOf(h: Homestead): { x: number; y: number } {
  return { x: h.gate.x, y: h.gate.y - 9 };
}

/**
 * The front door of a homestead. At your own: sleep, or rebuild the house a
 * step up (thatch → mud-walled → tiled, for money). At an empty one: move in
 * (your old home is left empty for others). Shows a ChoiceMenu in the UI.
 */
export class HomeDoor {
  private pending: string | null = null;

  constructor(private readonly hooks: Hooks) {}

  /** Interact pressed: opens the door menu if the player stands at a homestead door. */
  tryOpen(): boolean {
    const p = this.hooks.player();
    const tx = Math.floor(p.x / TILE);
    const ty = Math.floor((p.y - 1) / TILE);
    const home = this.hooks.homesteads().find((h) => {
      const d = doorOf(h);
      return Math.abs(d.x - tx) <= 1 && ty >= d.y - 1 && ty <= d.y + 1;
    });
    if (!home) return false;
    const owner = gameState.homes[home.key];
    if (owner === ownerName()) return this.ask(home, this.ownMenu(home));
    if (owner) {
      this.hooks.say(`Nhà của ${owner}`);
      return true;
    }
    if (!home.vacant) return false; // a villager family lives here
    return this.ask(home, {
      title: 'Nhà tranh bỏ trống',
      note: this.hooks.mine() ? 'Chuyển về đây ở? Nhà cũ sẽ để trống cho người khác (đồ đã đặt ở đó vẫn nằm nguyên).' : 'Về ở nhà này?',
      options: [
        { id: 'home:move', label: 'Chuyển về ở nhà này' },
        { id: 'home:close', label: 'Đóng' },
      ],
    });
  }

  private ownMenu(home: Homestead): ChoiceRequest {
    const house = houseOn(gameState.homeHouses, home.key, home.house);
    const up = nextUpgrade(house);
    const options: ChoiceOption[] = [
      { id: 'home:enter', label: 'Vào nhà' },
      { id: 'home:sleep', label: 'Đi ngủ' },
    ];
    if (up) {
      options.push({ id: 'home:upgrade', label: `Làm lại thành ${up.name} (${up.cost.toLocaleString('vi-VN')} ₫)`, enabled: gameState.money >= up.cost });
    }
    options.push({ id: 'home:close', label: 'Đóng' });
    return { title: 'Nhà của bạn', note: up ? undefined : 'Nhà ngói ba gian: đã là nhà tốt nhất trong làng.', options };
  }

  private ask(home: Homestead, req: ChoiceRequest): boolean {
    this.pending = home.key;
    EventBus.emit(GameEvents.ChoiceRequested, req);
    return true;
  }

  /** The player picked an option of the door menu. */
  onChoice(id: string): void {
    const key = this.pending;
    this.pending = null;
    if (!key || !id.startsWith('home:')) return;
    const home = this.hooks.homesteads().find((h) => h.key === key);
    if (!home) return;
    if (id === 'home:enter') this.hooks.enter();
    if (id === 'home:sleep') this.hooks.sleep();
    if (id === 'home:upgrade') {
      const current = houseOn(gameState.homeHouses, key, home.house);
      const done = upgradeHouse(gameState.homeHouses, gameState.money, key, current);
      if (!done) return this.hooks.say('Chưa đủ tiền');
      gameState.homeHouses = done.houses;
      gameState.money = done.money;
      this.hooks.say(`Đã làm lại nhà thành ${nextUpgrade(current)?.name ?? 'nhà mới'}!`);
      this.hooks.redraw();
    }
    if (id === 'home:move') {
      const homes = moveHome(gameState.homes, ownerName(), key);
      if (!homes) return this.hooks.say('Nhà này đã có người ở');
      gameState.homes = homes;
      this.hooks.say('Đã chuyển về nhà mới — trong tường rơm này bạn muốn làm gì cũng được');
      this.hooks.redraw();
    }
  }
}
