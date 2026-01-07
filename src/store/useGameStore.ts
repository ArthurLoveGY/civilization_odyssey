import { create } from 'zustand';
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

// Game control slice
const createGameSlice = (): GameSliceState & GameActions => ({
  currentEra: Era.Tribal,
  isPlaying: false,
  isPaused: false,
  gameSpeed: 1,
  startGame: () => {},
  pauseGame: () => {},
  toggleGame: () => {},
  setGameSpeed: () => {},
});

// Create store without devtools to avoid subscription issues
export const useGameStore = create<GameStore>()((set, get, api) => ({
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
}));

// Export actions directly for UI components
export const gameActions = {
  startGame: () => useGameStore.setState({ isPlaying: true, isPaused: false }),
  pauseGame: () => useGameStore.setState({ isPaused: true }),
  toggleGame: () => useGameStore.setState((s) => ({ isPaused: !s.isPaused })),
  setGameSpeed: (speed: number) => useGameStore.setState({ gameSpeed: speed }),
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
};
