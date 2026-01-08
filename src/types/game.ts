import Decimal from 'decimal.js';

// Resource types available in the game
export enum ResourceType {
  Food = 'food',
  Wood = 'wood',
  Skin = 'skin',
  Stone = 'stone',
  Meat = 'meat',          // Raw meat from hunting/traps
  CuredMeat = 'curedMeat', // Processed meat (5x food value)
  Ideas = 'ideas',        // Knowledge/Insight for tech research
  Tradition = 'tradition', // Culture/Tradition resource for Era 2 unlock
  Settlers = 'settlers',
}

// Display names for resources (Chinese)
export const RESOURCE_NAMES: Record<ResourceType, string> = {
  [ResourceType.Food]: '浆果',
  [ResourceType.Wood]: '木材',
  [ResourceType.Skin]: '毛皮',
  [ResourceType.Stone]: '石料',
  [ResourceType.Meat]: '生肉',
  [ResourceType.CuredMeat]: '肉干',
  [ResourceType.Ideas]: '理念',
  [ResourceType.Tradition]: '传统',
  [ResourceType.Settlers]: '人口',
};

// Season types
export enum Season {
  Spring = 'spring',
  Summer = 'summer',
  Autumn = 'autumn',
  Winter = 'winter',
}

// Display names for seasons (Chinese)
export const SEASON_NAMES: Record<Season, string> = {
  [Season.Spring]: '春',
  [Season.Summer]: '夏',
  [Season.Autumn]: '秋',
  [Season.Winter]: '冬',
};

// Building types
export enum BuildingType {
  Tent = 'tent',
  Granary = 'granary',
  Woodshed = 'woodshed',
  SkinRack = 'skinRack',
  StoneShed = 'stoneShed',
  SnareTrap = 'snareTrap',    // Semi-auto hunting tool (decays over time)
  DryingRack = 'dryingRack',  // Converts meat → cured meat
  TotemPole = 'totemPole',    // Auto-generates tradition (+0.05/sec)
  Graveyard = 'graveyard',     // Death conversion: each death → 50 tradition
  TribalHall = 'tribalHall',    // Wonder building that completes Era 1
}

// Display names for buildings (Chinese)
export const BUILDING_NAMES: Record<BuildingType, string> = {
  [BuildingType.Tent]: '帐篷',
  [BuildingType.Granary]: '粮仓',
  [BuildingType.Woodshed]: '木材场',
  [BuildingType.SkinRack]: '毛皮棚',
  [BuildingType.StoneShed]: '石料场',
  [BuildingType.SnareTrap]: '陷阱',
  [BuildingType.DryingRack]: '晾肉架',
  [BuildingType.TotemPole]: '图腾柱',
  [BuildingType.Graveyard]: '墓地',
  [BuildingType.TribalHall]: '部落大厅',
};

// Bonfire state
export interface BonfireState {
  isLit: boolean;
  fuel: Decimal;           // Current fuel amount
  maxFuel: Decimal;        // Maximum fuel capacity
  consumptionRate: Decimal; // Wood consumed per tick
  autoRefuel: boolean;     // Whether auto-refuel is enabled
}

// Bonfire status for UI
export enum BonfireStatus {
  Burning = 'burning',      // Normal state (>30% fuel)
  LowFuel = 'lowFuel',      // Warning state (≤30% and >0)
  Extinguished = 'extinguished',  // Penalty state (0 fuel)
}

// Building structure
export interface Building {
  count: Decimal;
  baseCost: Record<ResourceType, Decimal>;
  costMultiplier: Decimal;
}

// Building state
export interface BuildingState {
  buildings: Record<BuildingType, Building>;
}

// Storage caps
export interface StorageCap {
  food: Decimal;
  wood: Decimal;
  skin: Decimal;
  stone: Decimal;
  meat: Decimal;
  curedMeat: Decimal;
  tradition: Decimal;
}

// Scouting result types
export enum ScoutingResult {
  Nothing = 'nothing',
  Resources = 'resources',
  Survivor = 'survivor',
}

// Scouting event
export interface ScoutingEvent {
  result: ScoutingResult;
  resources?: Partial<Record<ResourceType, Decimal>>;
  survivor?: boolean;
}

// Job types for tribe members
export enum JobType {
  Gatherer = 'gatherer',      // Produces food
  Woodcutter = 'woodcutter',  // Produces wood
  Stonecutter = 'stonecutter', // Produces stone (needs tech unlock)
}

// Display names for jobs (Chinese)
export const JOB_NAMES: Record<JobType, string> = {
  [JobType.Gatherer]: '采集者',
  [JobType.Woodcutter]: '伐木工',
  [JobType.Stonecutter]: '碎石工',
};

// Job assignment state
export interface JobAssignment {
  gatherers: Decimal;
  woodcutters: Decimal;
  stonecutters: Decimal;
}

// Tribe state (jobs and idle population)
export interface TribeState {
  jobs: JobAssignment;
}

// Tech types
export enum TechType {
  FlintKnapping = 'flintKnapping',  // Unlocks stonecutter, +1 manual stone
  StoneAxes = 'stoneAxes',          // 2x wood gathering
  Spears = 'spears',                // 1.5x food, 2x skin drop rate
}

// Tech display names (Chinese)
export const TECH_NAMES: Record<TechType, string> = {
  [TechType.FlintKnapping]: '打制石器',
  [TechType.StoneAxes]: '石斧',
  [TechType.Spears]: '长矛',
};

// Tech research requirements and effects
export interface TechDefinition {
  name: string;
  description: string;
  cost: {
    ideas: Decimal;
    resources?: Partial<Record<ResourceType, Decimal>>;
  };
  effects: {
    gathererMultiplier?: Decimal;      // Food gathering multiplier
    woodcutterMultiplier?: Decimal;    // Wood gathering multiplier
    manualFoodMultiplier?: Decimal;    // Manual food action multiplier
    manualWoodMultiplier?: Decimal;    // Manual wood action multiplier
    manualStoneMultiplier?: Decimal;   // Manual stone action multiplier
    skinDropRateMultiplier?: Decimal;  // Skin drop rate multiplier
    unlocksJob?: JobType;              // Job that becomes available
  };
}

// Tech research state
export interface TechState {
  researched: TechType[];
  ideas: Decimal;  // Current knowledge/ideas resource
}

// Council Ground action state
export interface CouncilGroundState {
  lastUsedTime: number;  // Timestamp of last use
  cooldown: number;       // Cooldown in milliseconds (30000 = 30s)
}

// Game eras
export enum Era {
  Tribal = 'tribal',
  Kingdom = 'kingdom',
  Empire = 'empire',
  Interstellar = 'interstellar',
}

// Resource state - all numeric values use Decimal
export interface ResourceState {
  resources: Record<ResourceType, Decimal>;
  storageCaps: StorageCap;  // Storage limits for each resource
}

// Season state
export interface SeasonState {
  currentSeason: Season;
  seasonProgress: number; // 0-100
  daysInSeason: number;
  totalDays: number;
  daysPerSeason: number;
}

// Population state
export interface PopulationState {
  settlers: Decimal;
  starvationCounter: number;
}

// Log entry types
export enum LogType {
  Info = 'info',
  Warning = 'warning',
  Danger = 'danger',
  Success = 'success',
}

// Log entry structure
export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: LogType;
}

// Log state
export interface LogState {
  logs: LogEntry[];
  maxLogs: number;
}

// Main game state
export interface GameState {
  // Era progression
  currentEra: Era;

  // Game time
  isPlaying: boolean;
  isPaused: boolean;
  gameSpeed: number; // 1 = normal speed

  // Combined from other slices
  resources: ResourceState;
  season: SeasonState;
  population: PopulationState;
  logs: LogState;
}

// Season production multipliers
export interface SeasonMultipliers {
  food: Decimal;
  wood: Decimal;
  skin: Decimal;
  stone: Decimal;
}

// Production rates for resources
export interface ProductionRates {
  [ResourceType.Food]: Decimal;
  [ResourceType.Wood]: Decimal;
  [ResourceType.Skin]: Decimal;
  [ResourceType.Stone]: Decimal;
}

// ========== 事件系统类型 Event System ==========

export enum EventType {
  ResourceLoss = 'resourceLoss',      // 资源损失
  ResourceGain = 'resourceGain',       // 资源获得
  Wisdom = 'wisdom',                   // 智慧/理念
  Debuff = 'debuff',                   // Debuff
  Special = 'special',                 // 特殊互动
}

export enum EventRarity {
  Common = 'common',      // 60%
  Uncommon = 'uncommon',  // 30%
  Rare = 'rare',          // 10%
}

export interface GameEvent {
  id: string;
  name: string;
  description: string;
  type: EventType;
  rarity: EventRarity;
  season?: Season;           // 触发季节限制（可选）
  condition: (state: any) => boolean;  // 触发条件
  effect: (state: any) => EventResult;  // 事件效果
  cooldownTicks: number;     // 冷却时间（ticks）
  lastTriggerTick?: number;  // 上次触发时间
}

export interface EventResult {
  success: boolean;
  message: string;
  logType: 'info' | 'warning' | 'danger' | 'success';
  resources?: Partial<Record<ResourceType, Decimal>>;
  ideas?: Decimal;
  debuff?: TemporaryEffect;
  specialAction?: SpecialAction;
}

export interface SpecialAction {
  id: string;
  name: string;
  description: string;
  duration: number;  // 持续时间（ms）
  onComplete: (state: any) => EventResult;
}

// ========== 临时效果系统 Temporary Effects ==========

export interface TemporaryEffect {
  id: string;
  name: string;
  type: 'debuff' | 'buff';
  startTime: number;    // 开始时间（timestamp）
  duration: number;     // 持续时间（ms）
  modifier: EffectModifier;
}

export type EffectModifier =
  | { type: 'bonfireConsumption'; value: number }  // 篝火消耗倍率
  | { type: 'production'; resource: ResourceType; value: number }  // 产出倍率
  | { type: 'consumption'; resource: ResourceType; value: number }; // 消耗倍率

export interface TemporaryEffectState {
  activeEffects: TemporaryEffect[];
}
