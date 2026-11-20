import Phaser from 'phaser';
import { FISH, type FishId } from '../data/fish';
import { ITEMS, type ItemId } from '../data/items';
import { gameState } from '../state/GameState';
import { uiState } from '../state/uiState';
import { createFishingState, fishingOutcome, stepFishing, type FishingState } from '../systems/FishingSystem';
import { biteDelay, strikeWindow } from '../systems/FishSpawnSystem';
import { addItem } from '../systems/InventorySystem';
import { catchMaxKgChance, formatKg, rollUnitKg } from '../systems/ProduceSystem';
import { addXp, levelForXp, XP_REWARDS } from '../systems/SkillSystem';
import { playPickup } from '../systems/SfxSystem';
import { FishingMinigame } from './FishingMinigame';
import { iconTextureKey } from './itemIcons';

type Phase = 'wait' | 'bite' | 'reel';

/** What a treasure chest can hold: an item and how many, or money. */
const TREASURES: { itemId?: ItemId; qty: number; money?: number }[] = [
  { itemId: 'worm', qty: 8 },
  { itemId: 'copper_ore', qty: 6 },
  { itemId: 'iron_ore', qty: 4 },
  { money: 10000, qty: 1 },
  { money: 25000, qty: 1 },
];

/**
 * One cast of the rod, after the map has checked the bait and picked a fish:
 * wait for the bite → strike in time (the bait is used up either way) →
 * reel it in → reward (XP; double XP for a perfect catch; maybe a treasure).
 */
export class FishingSession {
  private readonly ui: FishingMinigame;
  private phase: Phase = 'wait';
  private fishId: FishId | null = null;
  private timer = 0;
  private state: FishingState | null = null;
  /** Ignores the very press that cast the line. */
  private grace = 0;

  constructor(
    scene: Phaser.Scene,
    depth: number,
    private readonly banner: (text: string, color: number) => void,
  ) {
    this.ui = new FishingMinigame(scene, depth);
  }

  get active(): boolean {
    return this.fishId !== null;
  }

  private get level(): number {
    return levelForXp(gameState.skills.fishing);
  }

  start(fishId: FishId): void {
    this.fishId = fishId;
    this.phase = 'wait';
    this.timer = biteDelay(this.level);
    this.grace = 0.4;
    uiState.fishingOpen = true;
  }

  /** `holding`: Space/pointer is down; `pressed`: it went down this frame. */
  update(time: number, dt: number, holding: boolean, pressed: boolean): void {
    const fishId = this.fishId;
    if (!fishId) return;
    const def = FISH[fishId];
    if (this.phase === 'wait') {
      this.ui.showWaiting(time);
      this.grace -= dt;
      if (pressed && this.grace <= 0) return this.end('Kéo cần sớm quá, cá chưa cắn câu', 0x5f4a3a);
      this.timer -= dt;
      if (this.timer <= 0) {
        this.phase = 'bite';
        this.timer = strikeWindow(def.difficulty);
        gameState.rodBait = Math.max(0, gameState.rodBait - 1); // the fish takes the worm either way
      }
      return;
    }
    if (this.phase === 'bite') {
      this.ui.showBite(time);
      if (pressed) {
        this.phase = 'reel';
        this.state = createFishingState(this.level);
        return;
      }
      this.timer -= dt;
      if (this.timer <= 0) this.end('Chậm tay rồi — cá đã ăn mất mồi!', 0x5f3a3a);
      return;
    }
    if (!this.state) return;
    this.state = stepFishing(this.state, Math.min(dt, 0.05), holding, def.difficulty, def.behavior);
    this.ui.showReel(iconTextureKey(fishId), this.state);
    const outcome = fishingOutcome(this.state);
    if (outcome === 'escaped') this.end('Cá đã giãy thoát!', 0x5f3a3a);
    else if (outcome === 'caught') this.caught(fishId, this.state);
  }

  private caught(fishId: FishId, state: FishingState): void {
    const def = FISH[fishId];
    const peak = def.peakSeason.includes(gameState.time.season);
    const maxKg = ITEMS[fishId].maxKg ?? 0;
    const kg = rollUnitKg(maxKg, catchMaxKgChance(peak, state.perfect));
    gameState.inventory = addItem(gameState.inventory, fishId, 1, kg).state;
    const xp = (XP_REWARDS.catchFish + Math.round(def.difficulty / 10)) * (state.perfect ? 2 : 1);
    gameState.skills = addXp(gameState.skills, 'fishing', xp).skills;
    const size = kg >= maxKg ? ` nặng ${formatKg(kg)} — con to nhất!` : ` nặng ${formatKg(kg)}`;
    let text = `Câu được: ${def.name}${size}${state.perfect ? ' ★ Hoàn hảo (x2 kinh nghiệm)' : ''}`;
    if (state.treasureWon) {
      const t = TREASURES[Math.floor(Math.random() * TREASURES.length)];
      if (t.money) {
        gameState.money += t.money;
        text += ` + rương báu: ${t.money.toLocaleString('vi-VN')}₫`;
      } else if (t.itemId) {
        gameState.inventory = addItem(gameState.inventory, t.itemId, t.qty).state;
        text += ` + rương báu: ${t.qty} món`;
      }
    }
    playPickup(gameState.settings);
    this.end(text, 0x3a5f3a);
  }

  private end(text: string, color: number): void {
    this.fishId = null;
    this.state = null;
    this.ui.close();
    uiState.fishingOpen = false;
    this.banner(text, color);
  }
}
