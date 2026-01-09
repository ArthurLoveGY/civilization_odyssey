import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Decimal from 'decimal.js';
import {
  GameStore,
  GameSliceState,
  GameActions,
} from './types';
import { Era } from '../types/game';
import { createResourceSlice } from './slices/resourceSlice';
import { createSeasonSlice } from './slices/seasonSlice';
import { createPopulationSlice } from './slices/populationSlice';
import { createLogSlice } from './slices/logSlice';
import { createBonfireSlice } from './slices/bonfireSlice';
import { createBuildingsSlice } from './slices/buildingsSlice';
import { createScoutingSlice } from './slices/scoutingSlice';
import { createTribeSlice } from './slices/tribeSlice';
import { createTechSlice } from './slices/techSlice';
import { createEventSlice } from './slices/eventSlice';
// Era 2 Slices
import { createSocialClassSlice } from './slices/socialClassSlice';
import { createTaxSlice } from './slices/taxSlice';
import { createHappinessSlice } from './slices/happinessSlice';
import { deepMergeAndRehydrate, exportSave, importSave, getSaveMetadata, type SaveMetadata } from '../utils/persistence';

// Game control slice
const createGameSlice = (): GameSliceState & GameActions => ({
  currentEra: Era.Tribal,
  isPlaying: false,
  isPaused: false,
  gameSpeed: 1,
  isEraCompleted: false,
  startGame: () => {},
  pauseGame: () => {},
  toggleGame: () => {},
  setGameSpeed: () => {},
  advanceToEra2: () => {},
});

// Create store with persist middleware
// Note: We use persist without devtools to avoid subscription issues
export const useGameStore = create<GameStore>()(
  persist(
    (set, get, api) => ({
      ...createGameSlice(),
      ...createResourceSlice(set, get, api),
      ...createSeasonSlice(set, get, api),
      ...createPopulationSlice(set, get, api),
      ...createLogSlice(set, get, api),
      ...createBonfireSlice(set, get, api),
      ...createBuildingsSlice(set, get, api),
      ...createScoutingSlice(set, get, api),
      ...createTribeSlice(set, get, api),
      ...createTechSlice(set, get, api),
      ...createEventSlice(set, get, api),
      // Era 2 Slices
      ...createSocialClassSlice(set, get, api),
      ...createTaxSlice(set, get, api),
      ...createHappinessSlice(set, get, api),
    }),
    {
      name: 'civ-odyssey-save',
      storage: createJSONStorage(() => localStorage),
      // Custom merge function to rehydrate Decimal instances
      merge: (persistedState: any, currentState) => {
        return deepMergeAndRehydrate(persistedState, currentState);
      },
      // Version for future migrations
      version: 1,
    }
  )
);

// Export actions directly for UI components
export const gameActions = {
  startGame: () => useGameStore.setState({ isPlaying: true, isPaused: false }),
  pauseGame: () => useGameStore.setState({ isPaused: true }),
  toggleGame: () => useGameStore.setState((s) => ({ isPaused: !s.isPaused })),
  setGameSpeed: (speed: number) => useGameStore.setState({ gameSpeed: speed }),
  checkVictoryCondition: () => {
    const state = useGameStore.getState();
    const tribalHallCount = state.getBuildingCount ? state.getBuildingCount('tribalHall' as any) : new Decimal(0);

    if (tribalHallCount.gte(1) && !state.isEraCompleted) {
      useGameStore.setState({ isEraCompleted: true, isPaused: true });
      state.addLog ? state.addLog('部落时代已完成！部落大厅已建成，文明的新篇章即将开始。', 'success') : null;
    }
  },
  addResource: (type: any, amount: any) => useGameStore.getState().addResource(type, amount),
  removeResource: (type: any, amount: any) => useGameStore.getState().removeResource(type, amount),
  removeResources: (resources: any) => {
    const fn = useGameStore.getState().removeResources;
    if (fn) fn(resources);
  },
  getResource: (type: any) => {
    const resources = useGameStore.getState().resources;
    return resources ? resources[type as keyof typeof resources] : new Decimal(0);
  },
  addLog: (message: string, type: any) => useGameStore.getState().addLog(message, type),
  addSettlers: (amount: any) => useGameStore.getState().addSettlers(amount),
  addFuel: (amount: any) => useGameStore.getState().addFuel(amount),
  setAutoRefuel: (enabled: boolean) => useGameStore.getState().setAutoRefuel(enabled),
  canGrowPopulation: () => useGameStore.getState().canGrowPopulation(),
  getBonfireStatus: () => useGameStore.getState().getBonfireStatus(),
  getBuildingCount: (type: any) => useGameStore.getState().getBuildingCount(type),
  getBuildingCost: (type: any) => useGameStore.getState().getBuildingCost(type),
  getStorageCap: (type: any) => useGameStore.getState().getStorageCap(type),
  getMaxPopulation: () => useGameStore.getState().getMaxPopulation(),
  getBuildingCategory: (type: any) => useGameStore.getState().getBuildingCategory(type),
  build: (type: any) => useGameStore.getState().build(type),
  // Tribe actions
  getIdlePopulation: () => useGameStore.getState().getIdlePopulation(),
  assignWorker: (jobType: any, amount: any) => useGameStore.getState().assignWorker(jobType, amount),
  removeWorker: (jobType: any, amount: any) => useGameStore.getState().removeWorker(jobType, amount),
  getWorkerCount: (jobType: any) => useGameStore.getState().getWorkerCount(jobType),
  calculateJobProduction: (resourceType: any) => useGameStore.getState().calculateJobProduction(resourceType),
  isJobUnlocked: (jobType: any) => useGameStore.getState().isJobUnlocked(jobType),
  calculateFoodConsumption: () => useGameStore.getState().calculateFoodConsumption(),
  getWarmthStatus: () => useGameStore.getState().getWarmthStatus(),
  // Tech actions
  getAllTechs: () => useGameStore.getState().getAllTechs(),
  getTechDefinition: (techType: any) => useGameStore.getState().getTechDefinition(techType),
  isTechResearched: (techType: any) => useGameStore.getState().isTechResearched(techType),
  canResearchTech: (techType: any) => useGameStore.getState().canResearchTech(techType),
  researchTech: (techType: any) => useGameStore.getState().researchTech(techType),
  addIdeas: (amount: any) => useGameStore.getState().addIdeas(amount),
  useCouncilGround: () => useGameStore.getState().useCouncilGround(),
  isCouncilGroundOnCooldown: () => useGameStore.getState().isCouncilGroundOnCooldown(),
  getCouncilGroundCooldownRemaining: () => useGameStore.getState().getCouncilGroundCooldownRemaining(),
  getManualActionMultiplier: (resourceType: any) => useGameStore.getState().getManualActionMultiplier(resourceType),
  getSkinDropRateMultiplier: () => useGameStore.getState().getSkinDropRateMultiplier(),
  // Event actions
  checkRandomEvent: (state: any) => useGameStore.getState().checkRandomEvent(state),
  applyTemporaryEffect: (effect: any) => useGameStore.getState().applyTemporaryEffect(effect),
  updateTemporaryEffects: () => useGameStore.getState().updateTemporaryEffects(),
  getBonfireConsumptionMultiplier: () => useGameStore.getState().getBonfireConsumptionMultiplier(),
  setActiveSpecialAction: (action: any) => useGameStore.getState().setActiveSpecialAction(action),
  completeSpecialAction: () => useGameStore.getState().completeSpecialAction(),
  clearSpecialAction: () => useGameStore.getState().clearSpecialAction(),

  // Era 2 Actions
  // Social Class actions
  assignSocialClass: (classType: any, amount: any) => useGameStore.getState().assignSocialClass(classType, amount),
  removeSocialClass: (classType: any, amount: any) => useGameStore.getState().removeSocialClass(classType, amount),
  getClassCount: (classType: any) => useGameStore.getState().getClassCount(classType),
  calculateClassProduction: (resourceType: any) => useGameStore.getState().calculateClassProduction(resourceType),
  calculateClassConsumption: (resourceType: any) => useGameStore.getState().calculateClassConsumption(resourceType),
  calculateTotalTaxBase: () => useGameStore.getState().calculateTotalTaxBase(),
  initializeEra2Population: (settlers: any) => useGameStore.getState().initializeEra2Population(settlers),

  // Tax actions
  setTaxRate: (rate: any) => useGameStore.getState().setTaxRate(rate),
  collectTax: () => useGameStore.getState().collectTax(),
  calculateGoldIncome: () => useGameStore.getState().calculateGoldIncome(),
  getTaxRate: () => useGameStore.getState().getTaxRate(),
  canAdjustTax: (newRate: any) => useGameStore.getState().canAdjustTax(newRate),
  initializeTaxSystem: () => useGameStore.getState().initializeTaxSystem(),

  // Happiness actions
  calculateTargetHappiness: () => useGameStore.getState().calculateTargetHappiness(),
  updateHappiness: () => useGameStore.getState().updateHappiness(),
  getProductionEfficiency: () => useGameStore.getState().getProductionEfficiency(),
  getHappinessStatus: () => useGameStore.getState().getHappinessStatus(),
  initializeHappinessSystem: () => useGameStore.getState().initializeHappinessSystem(),

  // Population derived attributes actions
  calculateHousingCap: () => useGameStore.getState().calculateHousingCap(),
  calculateSecurity: () => useGameStore.getState().calculateSecurity(),

  // Job efficiency tracking
  getJobEfficiency: (jobType: any) => {
    const state = useGameStore.getState();
    const jobEfficiency = state.jobEfficiency || {};
    return jobEfficiency[jobType] || new Decimal(1.0);
  },
  setJobEfficiency: (jobType: any, efficiency: any) => {
    useGameStore.setState((state) => ({
      jobEfficiency: {
        ...state.jobEfficiency,
        [jobType]: efficiency,
      },
    }));
  },

  // Era 2 Tech actions
  checkPrerequisites: (techType: any) => useGameStore.getState().checkPrerequisites(techType),
  researchTechEra2: (techType: any) => useGameStore.getState().researchTechEra2(techType),
  addScience: (amount: any) => useGameStore.getState().addScience(amount),
  addCulture: (amount: any) => useGameStore.getState().addCulture(amount),
  canAffordScience: (amount: any) => useGameStore.getState().canAffordScience(amount),
  canAffordCulture: (amount: any) => useGameStore.getState().canAffordCulture(amount),

  // Era transition action
  advanceToEra2: () => {
    const state = useGameStore.getState();

    // 1. Set current era to Kingdom
    useGameStore.setState({ currentEra: Era.Kingdom });

    // 2. Initialize Era 2 systems
    state.initializeEra2Population(state.settlers);
    state.initializeTaxSystem();
    state.initializeHappinessSystem();

    // 3. Add log message
    state.addLog('时代更迭：部落时代结束，王国时代开始！人民开始新的生活...', 'success');

    // 4. Resume game
    useGameStore.setState({ isPaused: false });
  },

  // Persistence actions
  /**
   * 导出存档为 Base64 字符串
   * @returns Base64 编码的存档
   */
  exportSave: (): string => {
    try {
      return exportSave();
    } catch (error) {
      console.error('Export save failed:', error);
      throw error;
    }
  },

  /**
   * 导入 Base64 存档
   * @param base64String Base64 编码的存档字符串
   */
  importSave: (base64String: string): void => {
    try {
      importSave(base64String);
    } catch (error) {
      console.error('Import save failed:', error);
      throw error;
    }
  },

  /**
   * 获取存档元数据
   * @returns 存档元数据
   */
  getSaveMetadata: (): SaveMetadata | null => {
    return getSaveMetadata();
  },

  resetSave: () => {
    localStorage.removeItem('civ-odyssey-save');
    window.location.reload();
  },
};
