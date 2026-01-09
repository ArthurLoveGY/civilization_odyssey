import Decimal from 'decimal.js';

// Resource types available in the game
export enum ResourceType {
  // Era 1 Resources (Tribal)
  Food = 'food',
  Wood = 'wood',
  Skin = 'skin',
  Stone = 'stone',
  Meat = 'meat',          // Raw meat from hunting/traps
  CuredMeat = 'curedMeat', // Processed meat (5x food value)
  Ideas = 'ideas',        // Knowledge/Insight for tech research
  Tradition = 'tradition', // Culture/Tradition resource for Era 2 unlock
  Settlers = 'settlers',

  // Era 2 Resources (Kingdom)
  Gold = 'gold',          // Currency (not gatherable, obtained via taxation)
  IronOre = 'ironOre',    // Raw mining product
  IronIngot = 'ironIngot', // Refined metal (smelted from iron ore)
  Science = 'science',    // Knowledge advancement (replaces Ideas in Era 2)
  Culture = 'culture',    // Culture points for policy unlocks (replaces Tradition)
  Manpower = 'manpower',  // Labor pool for construction/warfare
}

// Display names for resources (Chinese)
export const RESOURCE_NAMES: Record<ResourceType, string> = {
  // Era 1 Resources
  [ResourceType.Food]: '浆果',
  [ResourceType.Wood]: '木材',
  [ResourceType.Skin]: '毛皮',
  [ResourceType.Stone]: '石料',
  [ResourceType.Meat]: '生肉',
  [ResourceType.CuredMeat]: '肉干',
  [ResourceType.Ideas]: '理念',
  [ResourceType.Tradition]: '传统',
  [ResourceType.Settlers]: '人口',

  // Era 2 Resources
  [ResourceType.Gold]: '黄金',
  [ResourceType.IronOre]: '铁矿石',
  [ResourceType.IronIngot]: '铁锭',
  [ResourceType.Science]: '科学',
  [ResourceType.Culture]: '文化',
  [ResourceType.Manpower]: '人力',
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
  // Era 1 Buildings (Tribal)
  Tent = 'tent',
  Granary = 'granary',
  Woodshed = 'woodshed',
  SkinRack = 'skinRack',
  StoneShed = 'stoneShed',
  SnareTrap = 'snareTrap',
  DryingRack = 'dryingRack',
  TotemPole = 'totemPole',
  Graveyard = 'graveyard',
  TribalHall = 'tribalHall',  // Wonder building that completes Era 1

  // Era 2 Buildings (Kingdom)
  // Tier 1: Order (Prerequisites: None)
  TaxOffice = 'taxOffice',
  Aqueduct = 'aqueduct',
  Library = 'library',
  CityWalls = 'cityWalls',

  // Tier 2: Industry (Prerequisites: Masonry)
  DeepMine = 'deepMine',
  Smelter = 'smelter',
  Blacksmith = 'blacksmith',

  // Tier 3: Economy (Prerequisites: Civil Service + Metallurgy)
  Market = 'market',
  Bank = 'bank',
  Barracks = 'barracks',

  // Housing
  House = 'house',

  // Housing
  Palace = 'palace', // Era 2 wonder
}

// Display names for buildings (Chinese)
export const BUILDING_NAMES: Record<BuildingType, string> = {
  // Era 1 Buildings
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

  // Era 2 Buildings
  [BuildingType.TaxOffice]: '税务局',
  [BuildingType.Aqueduct]: '水渠',
  [BuildingType.Library]: '图书馆',
  [BuildingType.CityWalls]: '城墙',
  [BuildingType.DeepMine]: '深矿',
  [BuildingType.Smelter]: '冶炼厂',
  [BuildingType.Blacksmith]: '铁匠铺',
  [BuildingType.Market]: '市场',
  [BuildingType.Bank]: '银行',
  [BuildingType.Barracks]: '兵营',
  [BuildingType.House]: '民宅',
  [BuildingType.Palace]: '皇宫',
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
  // Era 1 Resources
  food: Decimal;
  wood: Decimal;
  skin: Decimal;
  stone: Decimal;
  meat: Decimal;
  curedMeat: Decimal;
  tradition: Decimal;

  // Era 2 Resources
  gold: Decimal;
  ironOre: Decimal;
  ironIngot: Decimal;
  science: Decimal;
  manpower: Decimal;
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
  // Era 1 Jobs (Tribal)
  Gatherer = 'gatherer',      // Produces food
  Woodcutter = 'woodcutter',  // Produces wood
  Stonecutter = 'stonecutter', // Produces stone (needs tech unlock)

  // Era 2 Jobs (Kingdom)
  Miner = 'miner',              // Produces iron ore (requires DeepMine)
  Smith = 'smith',              // Processes iron (requires Blacksmith)
  Scholar = 'scholar',          // Produces science (requires Library)
  Guard = 'guard',              // Provides security (requires Barracks)
}

// Display names for jobs (Chinese)
export const JOB_NAMES: Record<JobType, string> = {
  // Era 1 Jobs
  [JobType.Gatherer]: '采集者',
  [JobType.Woodcutter]: '伐木工',
  [JobType.Stonecutter]: '碎石工',

  // Era 2 Jobs
  [JobType.Miner]: '矿工',
  [JobType.Smith]: '铁匠',
  [JobType.Scholar]: '学者',
  [JobType.Guard]: '卫兵',
};

// Job assignment state
export interface JobAssignment {
  // Era 1 Jobs
  gatherers: Decimal;
  woodcutters: Decimal;
  stonecutters: Decimal;

  // Era 2 Jobs
  miners: Decimal;
  smiths: Decimal;
  scholars: Decimal;
  guards: Decimal;
}

// Job configuration (for capacity and upkeep)
export interface JobConfig {
  name: string;
  icon: string;
  description: string;
  requiredBuilding: BuildingType;    // Building required to assign this job
  capacityPerBuilding: Decimal;       // Workers per building
  baseProduction: {
    resource?: ResourceType;
    amount: Decimal;
  };
  upkeep: {
    resource: ResourceType;
    amount: Decimal;
  }[];
}

// Tribe state (jobs and idle population)
export interface TribeState {
  jobs: JobAssignment;
}

// Tech types
export enum TechType {
  // Era 1 Techs (Tribal)
  FlintKnapping = 'flintKnapping',
  StoneAxes = 'stoneAxes',
  Spears = 'spears',

  // Era 2 Techs - Tier 1: Order (Prerequisites: None)
  CivilService = 'civilService',
  Masonry = 'masonry',
  Writing = 'writing',

  // Era 2 Techs - Tier 2: Industry (Prerequisites: Masonry)
  Mining = 'mining',
  Metallurgy = 'metallurgy',

  // Era 2 Techs - Tier 3: Economy (Prerequisites: Civil Service + Metallurgy)
  Currency = 'currency',
}

// Tech display names (Chinese)
export const TECH_NAMES: Record<TechType, string> = {
  // Era 1 Techs
  [TechType.FlintKnapping]: '打制石器',
  [TechType.StoneAxes]: '石斧',
  [TechType.Spears]: '长矛',

  // Era 2 Techs - Tier 1: Order
  [TechType.CivilService]: '文官制度',
  [TechType.Masonry]: '石工术',
  [TechType.Writing]: '书写',

  // Era 2 Techs - Tier 2: Industry
  [TechType.Mining]: '矿业',
  [TechType.Metallurgy]: '冶金',

  // Era 2 Techs - Tier 3: Economy
  [TechType.Currency]: '货币',
};

// Tech tiers (for UI grouping)
export enum TechTier {
  Tribal = 'tribal',              // Era 1 techs
  Order = 'order',                // Era 2 Tier 1
  Industry = 'industry',          // Era 2 Tier 2
  Economy = 'economy',            // Era 2 Tier 3
}

// Tech requirements (prerequisites)
export interface TechRequirements {
  requiredTechs?: TechType[];     // Techs that must be researched first
  requiredResources?: Partial<Record<ResourceType, Decimal>>; // Resources needed to research
}

// Tech research requirements and effects
export interface TechDefinition {
  name: string;
  description: string;
  tier: TechTier;
  cost: {
    ideas?: Decimal;
    science?: Decimal;
    resources?: Partial<Record<ResourceType, Decimal>>;
  };
  requirements?: TechRequirements;
  effects: {
    gathererMultiplier?: Decimal;      // Food gathering multiplier
    woodcutterMultiplier?: Decimal;    // Wood gathering multiplier
    manualFoodMultiplier?: Decimal;    // Manual food action multiplier
    manualWoodMultiplier?: Decimal;    // Manual wood action multiplier
    manualStoneMultiplier?: Decimal;   // Manual stone action multiplier
    skinDropRateMultiplier?: Decimal;  // Skin drop rate multiplier
    unlocksJob?: JobType;              // Job that becomes available
    unlocksBuilding?: BuildingType;     // Building that becomes available
    unlocksResource?: ResourceType;      // Resource that becomes available
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

// ========== ERA 2: KINGDOM SYSTEMS ==========

// Social class types for Era 2
export enum SocialClass {
  Peasant = 'peasant',   // Base class, produces food, provides tax base
  Worker = 'worker',     // Industrial class, works in mines/foundries
  Scholar = 'scholar',   // Intellectual class, produces science
}

// Display names for social classes (Chinese)
export const SOCIAL_CLASS_NAMES: Record<SocialClass, string> = {
  [SocialClass.Peasant]: '农民',
  [SocialClass.Worker]: '工人',
  [SocialClass.Scholar]: '学者',
};

// Social class assignment state
export interface SocialClassAssignment {
  peasants: Decimal;
  workers: Decimal;
  scholars: Decimal;
}

// Happiness status levels
export enum HappinessStatus {
  Ecstatic = 'ecstatic',   // 90-100%: +10% production bonus
  Happy = 'happy',         // 75-90%: +5% production bonus
  Content = 'content',     // 50-75%: baseline efficiency (100%)
  Unhappy = 'unhappy',     // 20-50%: 50-100% efficiency (linear)
  Rioting = 'rioting',     // 0-20%: 0% production + population loss
}

// Display names for happiness status (Chinese)
export const HAPPINESS_STATUS_NAMES: Record<HappinessStatus, string> = {
  [HappinessStatus.Ecstatic]: '狂喜',
  [HappinessStatus.Happy]: '快乐',
  [HappinessStatus.Content]: '满足',
  [HappinessStatus.Unhappy]: '不满',
  [HappinessStatus.Rioting]: '暴乱',
};

// Factors affecting happiness
export interface HappinessFactors {
  taxRate: Decimal;         // Negative impact (proportional to tax rate)
  foodVariety: Decimal;     // Positive impact (diverse food sources)
  classBalance: Decimal;    // Impact from social class ratios
  housing: Decimal;         // Positive impact (overcrowding penalty)
  events: Decimal;          // Temporary modifiers from events
}

// Production efficiency calculation
export interface ProductionEfficiency {
  efficiency: Decimal;      // 0.0 - 1.0 (0% to 100%)
  status: HappinessStatus;
  modifier: string;         // UI description
}

// Happiness system types
export interface HappinessSystem {
  currentHappiness: Decimal; // 0-100
  targetHappiness: Decimal;  // Calculated target based on factors
  factors: HappinessFactors; // Contributing factors
  status: HappinessStatus;   // Current status
  efficiency: ProductionEfficiency;
}

// Tax system types
export interface TaxSystem {
  currentRate: Decimal;      // 0-1 (e.g., 0.20 = 20%)
  minRate: Decimal;          // Minimum tax rate (e.g., 0.05 = 5%)
  maxRate: Decimal;          // Maximum tax rate (e.g., 0.50 = 50%)
  lastCollection: number;    // Timestamp of last collection
  goldIncome: Decimal;       // Current gold income per tick
  totalGoldCollected: Decimal; // Lifetime gold collected
}

