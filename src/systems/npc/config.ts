import raw from '../../data/npcFarm.json';

/**
 * The NPC farm families' numbers (src/data/npcFarm.json), with the 'HH:MM'
 * times turned into clock minutes (0 = midnight) and metres into tiles.
 * Tests can build their own with `parseNpcConfig`.
 */
export type TaskKind = 'hoe' | 'sow' | 'water' | 'fertilize' | 'harvest';

export interface CropDef {
  id: string;
  name: string;
  growDays: number;
  color: string;
}

export interface NpcConfig {
  adult: {
    wake: number;
    sweepUntil: number;
    feedLivestock: number;
    feedMinutes: number;
    breakfast: number;
    toField: number;
    lunchStart: number;
    lunchEnd: number;
    wifeLeaveField: number;
    leaveField: number;
    singleMarketLeave: number;
    dinner: number;
    porch: number;
    sleep: number;
  };
  child: {
    wake: number;
    breakfast: number;
    toSchool: number;
    schoolEnd: number;
    dinner: number;
    sleep: number;
    yardRadiusTiles: number;
    buffaloRadiusTiles: number;
    playRadiusTiles: number;
    behaviourMinutes: number;
  };
  buffalo: { leadOut: number; leadHome: number; wanderRadiusTiles: number };
  market: { stayMinutes: number; walkMinutes: number; everyDays: Record<1 | 2 | 3, number> };
  lateness: { toleranceMinutes: number; hurrySpeedMultiplier: number };
  talk: { wrapUpMinutes: number; maxMinutes: number; rangeTiles: number };
  travel: { walkTilesPerMinute: number; pathFactor: number; minMinutes: number };
  world: { firstWeekday: number; weekendDays: number[]; maxCatchUpDays: number };
  families: { twoPersonShare: number; pigChance: number };
  field: {
    cellTiles: number;
    /** Map tiles (columns, rows) of the paddy each family type works. */
    plotTiles: Record<1 | 2 | 3, [number, number]>;
    minutes: Record<TaskKind, number>;
    fertilizeEveryDays: number;
    deathAfterMissedDays: number;
    pileFraction: number;
  };
  yardPiles: { max: number; lifetimeDays: number };
  crops: CropDef[];
  lines: { greeting: string[]; farewell: string[] };
}

export type RawNpcConfig = typeof raw;

/** '16:30' -> 990. */
export function clockOf(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + (m || 0);
}

function clocks<T extends Record<string, string | number>>(o: T): { [K in keyof T]: number } {
  const out = {} as { [K in keyof T]: number };
  for (const k of Object.keys(o) as (keyof T)[]) {
    const v: string | number = o[k];
    out[k] = typeof v === 'string' ? clockOf(v) : v;
  }
  return out;
}

export function parseNpcConfig(r: RawNpcConfig): NpcConfig {
  const tpm = r.world.tilesPerMetre;
  const child = r.child;
  return {
    adult: clocks(r.adult),
    child: {
      wake: clockOf(child.wake),
      breakfast: clockOf(child.breakfast),
      toSchool: clockOf(child.toSchool),
      schoolEnd: clockOf(child.schoolEnd),
      dinner: clockOf(child.dinner),
      sleep: clockOf(child.sleep),
      yardRadiusTiles: child.yardRadiusM * tpm,
      buffaloRadiusTiles: child.buffaloRadiusM * tpm,
      playRadiusTiles: child.playRadiusM * tpm,
      behaviourMinutes: child.behaviourMinutes,
    },
    buffalo: { leadOut: clockOf(r.buffalo.leadOut), leadHome: clockOf(r.buffalo.leadHome), wanderRadiusTiles: r.buffalo.wanderRadiusM * tpm },
    market: {
      stayMinutes: r.market.stayMinutes,
      walkMinutes: r.market.walkMinutes,
      everyDays: { 1: r.market.everyDaysByFamilyType['1'], 2: r.market.everyDaysByFamilyType['2'], 3: r.market.everyDaysByFamilyType['3'] },
    },
    lateness: r.lateness,
    talk: r.talk,
    travel: r.travel,
    world: { firstWeekday: r.world.firstWeekday, weekendDays: r.world.weekendDays, maxCatchUpDays: r.world.maxCatchUpDays },
    families: r.families,
    field: {
      cellTiles: r.field.cellTiles,
      plotTiles: {
        1: r.field.plotTilesByFamilyType['1'] as [number, number],
        2: r.field.plotTilesByFamilyType['2'] as [number, number],
        3: r.field.plotTilesByFamilyType['3'] as [number, number],
      },
      minutes: r.field.minutes,
      fertilizeEveryDays: r.field.fertilizeEveryDays,
      deathAfterMissedDays: r.field.deathAfterMissedDays,
      pileFraction: r.field.pileFraction,
    },
    yardPiles: r.yardPiles,
    crops: r.crops,
    lines: r.lines,
  };
}

export const NPC_CONFIG: NpcConfig = parseNpcConfig(raw);
