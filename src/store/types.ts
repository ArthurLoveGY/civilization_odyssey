import Decimal from 'decimal.js';
import { ResourceType, Season, LogEntry, Era, BonfireState, BonfireStatus, BuildingType, StorageCap, ScoutingEvent, JobAssignment, TechType, TechDefinition, CouncilGroundState } from '../types/game';

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
}

export interface TechSliceState {
  researched: TechType[];
  ideas: Decimal;
  councilGround: CouncilGroundState;
}

export interface EventSliceState {
  currentTick: number;
  activeEvents: any[];
  temporaryEffects: any[];
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
    EventActions {}

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
}

export interface TechActions {
  getAllTechs: () => Record<TechType, TechDefinition>;
  getTechDefinition: (techType: TechType) => TechDefinition;
  isTechResearched: (techType: TechType) => boolean;
  canResearchTech: (techType: TechType) => boolean;
  researchTech: (techType: TechType) => void;
  addIdeas: (amount: Decimal) => void;
  useCouncilGround: () => boolean;
  isCouncilGroundOnCooldown: () => boolean;
  getCouncilGroundCooldownRemaining: () => string;
  getManualActionMultiplier: (resourceType: ResourceType) => Decimal;
  getSkinDropRateMultiplier: () => Decimal;
}

export interface EventActions {
  checkRandomEvent: (state: any) => { event: any; result: any } | null;
  applyTemporaryEffect: (effect: any) => void;
  updateTemporaryEffects: () => any[];
  getBonfireConsumptionMultiplier: () => number;
}
