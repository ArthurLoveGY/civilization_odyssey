import Decimal from 'decimal.js';
import {
  ResourceType,
  Season,
  LogEntry,
  Era,
  BonfireState,
  BonfireStatus,
  BuildingType,
  StorageCap,
  ScoutingEvent,
  JobAssignment,
  TechType,
  TechDefinition,
  CouncilGroundState,
  SocialClass,
  SocialClassAssignment,
  HappinessStatus,
  HappinessFactors,
  ProductionEfficiency,
} from '../types/game';

// ========================================
// SLICE STATE INTERFACES (Flattened)
// ========================================

export interface ResourceSliceState {
  resources: Record<ResourceType, Decimal>;
  storageCaps: StorageCap;
}

export interface SeasonSliceState {
  currentSeason: Season;
  seasonProgress: number;
  daysInSeason: number;
  totalDays: number;
  daysPerSeason: number;
}

export interface PopulationSliceState {
  settlers: Decimal;
  maxPopulation: Decimal;
  growthProgress: Decimal;
  starvationCounter: number;
  // Era 2: Derived attributes
  housingCap: Decimal;      // Hard cap from buildings (20 + Aqueduct*15 + CityWalls*5)
  security: Decimal;          // 0-100%, affects gold retention rate
  happiness: Decimal;        // 0-100%, affects production efficiency
}

export interface LogSliceState {
  logs: LogEntry[];
  maxLogs: number;
}

export interface GameSliceState {
  currentEra: Era;
  isPlaying: boolean;
  isPaused: boolean;
  gameSpeed: number;
  isEraCompleted: boolean;
}

export interface BonfireSliceState {
  bonfire: BonfireState;
}

export interface BuildingsSliceState {
  buildings: any; // Using any to avoid index type issues
  storageCaps: StorageCap;
}

export interface ScoutingSliceState {
  isScouting: boolean;
  lastScoutTime: number;
}

export interface TribeSliceState {
  jobs: JobAssignment;
  // Era 2: Job efficiency tracking
  jobEfficiency: Record<string, Decimal>;  // Maps job type to efficiency (0-1)
}

export interface TechSliceState {
  researched: TechType[];
  ideas: Decimal;
  tradition: Decimal;
  councilGround: CouncilGroundState;
  // Era 2
  science: Decimal;  // Scientific knowledge for Era 2 techs
  culture: Decimal;  // Culture points for policy unlocks
}

export interface TechSliceState {
  researched: TechType[];
  ideas: Decimal;
  tradition: Decimal;
  councilGround: CouncilGroundState;
  // Era 2
  science: Decimal;  // Scientific knowledge for Era 2 techs
  culture: Decimal;  // Culture points for policy unlocks
}

export interface EventSliceState {
  currentTick: number;
  activeEvents: any[];
  temporaryEffects: any[];
  activeSpecialAction: {
    action: any;
    startTime: number;
  } | null;
}

// Era 2 States
export interface SocialClassSliceState {
  socialClasses: SocialClassAssignment;
  totalPopulation: Decimal;
  idlePopulation: Decimal;
}

export interface TaxSliceState {
  currentRate: Decimal;
  minRate: Decimal;
  maxRate: Decimal;
  lastCollection: number;
  goldIncome: Decimal;
  totalGoldCollected: Decimal;
}

export interface HappinessSliceState {
  currentHappiness: Decimal;
  targetHappiness: Decimal;
  factors: HappinessFactors;
  status: HappinessStatus;
  efficiency: ProductionEfficiency;
}

// Combined store state
export interface GameStore
  extends ResourceSliceState,
    SeasonSliceState,
    PopulationSliceState,
    LogSliceState,
    GameSliceState,
    BonfireSliceState,
    BuildingsSliceState,
    ScoutingSliceState,
    TribeSliceState,
    TechSliceState,
    EventSliceState,
    // Era 2 States
    SocialClassSliceState,
    TaxSliceState,
    HappinessSliceState,
    // Actions
    ResourceActions,
    SeasonActions,
    PopulationActions,
    LogActions,
    GameActions,
    BonfireActions,
    BuildingsActions,
    ScoutingActions,
    TribeActions,
    TechActions,
    EventActions,
    // Era 2 Actions
    SocialClassActions,
    TaxActions,
    HappinessActions {}

// ========================================
// SLICE ACTIONS
// ========================================

export interface ResourceActions {
  addResource: (type: ResourceType, amount: Decimal) => void;
  removeResource: (type: ResourceType, amount: Decimal) => void;
  getResource: (type: ResourceType) => Decimal;
  setResource: (type: ResourceType, amount: Decimal) => void;
  canAfford: (type: ResourceType, amount: Decimal) => boolean;
  canAddResource: (type: ResourceType, amount: Decimal) => boolean;
  addResources: (resources: Partial<Record<ResourceType, Decimal>>) => void;
  removeResources: (resources: Partial<Record<ResourceType, Decimal>>) => void;
}

export interface SeasonActions {
  advanceSeason: () => void;
  updateSeasonProgress: (deltaDays: number) => void;
  getSeasonMultiplier: () => { food: Decimal; wood: Decimal; skin: Decimal; stone: Decimal };
  resetSeason: () => void;
}

export interface PopulationActions {
  consumeFood: (amountPerSettler: Decimal) => void;
  checkStarvation: () => void;
  checkFreezing: () => void;
  addSettlers: (amount: Decimal) => void;
  removeSettlers: (amount: Decimal) => void;
  getMaxPopulation: () => Decimal;
  canGrowPopulation: () => boolean;
  updateGrowthProgress: (delta: Decimal) => void;
  // Era 2 Actions
  calculateHousingCap: () => Decimal;
  calculateSecurity: () => Decimal;
  updateHappiness: () => void;
}

export interface LogActions {
  addLog: (message: string, type?: 'info' | 'warning' | 'danger' | 'success') => void;
  clearLogs: () => void;
}

export interface GameActions {
  startGame: () => void;
  pauseGame: () => void;
  toggleGame: () => void;
  setGameSpeed: (speed: number) => void;
  advanceToEra2: () => void;
}

export interface BonfireActions {
  addFuel: (amount: Decimal) => void;
  consumeFuel: (season: Season) => void;
  getBonfireStatus: () => BonfireStatus;
  setAutoRefuel: (enabled: boolean) => void;
  relightBonfire: () => void;
}

export interface BuildingsActions {
  getBuildingCount: (type: BuildingType) => Decimal;
  getBuildingCost: (type: BuildingType) => Record<ResourceType, Decimal>;
  canAffordBuilding: (type: BuildingType) => boolean;
  build: (type: BuildingType) => void;
  getStorageCap: (resource: ResourceType) => Decimal;
  getMaxPopulation: () => Decimal;
  getBuildingCategory: (type: BuildingType) => string;
}

export interface ScoutingActions {
  canScout: () => boolean;
  sendScout: () => ScoutingEvent;
}

export interface TribeActions {
  getIdlePopulation: () => Decimal;
  assignWorker: (jobType: any, amount: Decimal) => void;
  removeWorker: (jobType: any, amount: Decimal) => void;
  getWorkerCount: (jobType: any) => Decimal;
  calculateJobProduction: (resourceType: ResourceType) => Decimal;
  isJobUnlocked: (jobType: any) => boolean;
  calculateFoodConsumption: () => Decimal;
  getWarmthStatus: () => {
    isCold: boolean;
    isClothed: boolean;
    hasBonfire: boolean;
    modifier: Decimal;
  };
  // Era 2: Job efficiency tracking
  getJobEfficiency: (jobType: any) => Decimal;
  setJobEfficiency: (jobType: any, efficiency: any) => void;
}

export interface TechActions {
  getAllTechs: () => Partial<Record<TechType, TechDefinition>>;
  getTechDefinition: (techType: TechType) => TechDefinition | undefined;
  isTechResearched: (techType: TechType) => boolean;
  canResearchTech: (techType: TechType) => boolean;
  researchTech: (techType: TechType) => void;
  addIdeas: (amount: Decimal) => void;
  useCouncilGround: () => boolean;
  isCouncilGroundOnCooldown: () => boolean;
  getCouncilGroundCooldownRemaining: () => string;
  getManualActionMultiplier: (resourceType: ResourceType) => Decimal;
  getSkinDropRateMultiplier: () => Decimal;
  // Era 2
  checkPrerequisites: (techType: TechType) => boolean;
  researchTechEra2: (techType: TechType) => void;
  addScience: (amount: Decimal) => void;
  addCulture: (amount: Decimal) => void;
  canAffordScience: (amount: Decimal) => boolean;
  canAffordCulture: (amount: Decimal) => boolean;
}

export interface EventActions {
  checkRandomEvent: (state: any) => { event: any; result: any } | null;
  applyTemporaryEffect: (effect: any) => void;
  updateTemporaryEffects: () => any[];
  getBonfireConsumptionMultiplier: () => number;
  setActiveSpecialAction: (action: any) => void;
  completeSpecialAction: () => void;
  clearSpecialAction: () => void;
}

// Era 2 Actions
export interface SocialClassActions {
  assignSocialClass: (classType: SocialClass, amount: Decimal) => void;
  removeSocialClass: (classType: SocialClass, amount: Decimal) => void;
  getClassCount: (classType: SocialClass) => Decimal;
  getIdlePopulation: () => Decimal;
  calculateClassProduction: (resourceType: ResourceType) => Decimal;
  calculateClassConsumption: (resourceType: ResourceType) => Decimal;
  calculateTotalTaxBase: () => Decimal;
  initializeEra2Population: (settlers: Decimal) => void;
}

export interface TaxActions {
  setTaxRate: (rate: Decimal) => void;
  collectTax: () => void;
  calculateGoldIncome: () => Decimal;
  getTaxRate: () => Decimal;
  canAdjustTax: (newRate: Decimal) => boolean;
  initializeTaxSystem: () => void;
}

export interface HappinessActions {
  calculateTargetHappiness: () => Decimal;
  updateHappiness: () => void;
  getProductionEfficiency: () => ProductionEfficiency;
  getHappinessStatus: () => HappinessStatus;
  initializeHappinessSystem: () => void;
}
