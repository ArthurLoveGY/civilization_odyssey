import { StateCreator } from 'zustand';
import Decimal from 'decimal.js';
import { JobType, JobAssignment, ResourceType, Season } from '../../types/game';

// Base production rates per worker per tick (10 TPS = 100ms per tick)
// Golden Ratio: 1 Gatherer produces 3.0 food/sec (enough for 3 people)
const GATHERER_BASE_RATE = new Decimal(0.3);   // 3.0 food/sec
const WOODCUTTER_BASE_RATE = new Decimal(0.05); // 0.5 wood/sec (for bonfire balance)
const STONECUTTER_BASE_RATE = new Decimal(0.01); // 0.1 stone/sec

// Food consumption: 1.0 food/sec per person
const FOOD_CONSUMPTION_PER_PERSON = new Decimal(0.1); // 1.0 food/sec per person

// Season modifiers for food consumption
const SEASON_MODIFIERS: Record<Season, Decimal> = {
  spring: new Decimal(1.0),
  summer: new Decimal(1.0),
  autumn: new Decimal(1.1),
  winter: new Decimal(2.0),
};

// Warmth modifiers (subtractive, minimum 1.0)
const WARMTH_BONFIRE_REDUCTION = new Decimal(0.5);  // Reduces winter penalty
const WARMTH_CLOTHING_REDUCTION = new Decimal(0.3); // Additional reduction if clothed

// Map JobType (singular) to job object key (plural)
const JOB_KEY_MAP: Record<JobType, keyof JobAssignment> = {
  // Era 1 Jobs
  [JobType.Gatherer]: 'gatherers',
  [JobType.Woodcutter]: 'woodcutters',
  [JobType.Stonecutter]: 'stonecutters',
  // Era 2 Jobs
  [JobType.Miner]: 'miners',
  [JobType.Smith]: 'smiths',
  [JobType.Scholar]: 'scholars',
  [JobType.Guard]: 'guards',
};

// Create the tribe slice
export const createTribeSlice: StateCreator<
  TribeSliceState & TribeActions,
  [],
  [],
  TribeSliceState & TribeActions
> = (set, get) => ({
  // Initial state - all workers unassigned
  jobs: {
    // Era 1 Jobs
    gatherers: new Decimal(0),
    woodcutters: new Decimal(0),
    stonecutters: new Decimal(0),
    // Era 2 Jobs
    miners: new Decimal(0),
    smiths: new Decimal(0),
    scholars: new Decimal(0),
    guards: new Decimal(0),
  },
  
  // Era 2: Job efficiency tracking (0-1 scale)
  jobEfficiency: {
    // Era 1 Jobs
    gatherer: new Decimal(1.0),
    woodcutter: new Decimal(1.0),
    stonecutter: new Decimal(1.0),
    // Era 2 Jobs
    miner: new Decimal(1.0),
    smith: new Decimal(1.0),
    scholar: new Decimal(1.0),
    guard: new Decimal(1.0),
  },

  // Calculate idle population (thinkers)
  getIdlePopulation: () => {
    const state = get() as any;

    const totalPopulation = state.settlers || new Decimal(0);

    const gatherers = state.jobs?.gatherers || new Decimal(0);
    const woodcutters = state.jobs?.woodcutters || new Decimal(0);
    const stonecutters = state.jobs?.stonecutters || new Decimal(0);

    const assignedWorkers = gatherers.plus(woodcutters).plus(stonecutters);

    const result = Decimal.max(0, totalPopulation.minus(assignedWorkers));

    return result;
  },

  // Assign workers to a job
  assignWorker: (jobType: JobType, amount: Decimal) => {
    set((state: any) => {
      const totalPopulation = state.settlers || new Decimal(0);
      const currentJobs = state.jobs || {
        gatherers: new Decimal(0),
        woodcutters: new Decimal(0),
        stonecutters: new Decimal(0),
      };

      // Calculate total assigned workers
      const totalAssigned = currentJobs.gatherers
                            .plus(currentJobs.woodcutters)
                            .plus(currentJobs.stonecutters);

      // Calculate how many more workers we can assign
      const availableWorkers = Decimal.max(0, totalPopulation.minus(totalAssigned));
      const actualAssign = Decimal.min(amount, availableWorkers);

      // Map jobType to the correct key
      const jobKey = JOB_KEY_MAP[jobType];

      // Update job count
      const newJobs = {
        ...currentJobs,
        [jobKey]: currentJobs[jobKey].plus(actualAssign),
      };

      return {
        jobs: newJobs,
      };
    });
  },

  // Remove workers from a job
  removeWorker: (jobType: JobType, amount: Decimal) => {
    set((state: any) => {
      const currentJobs = state.jobs || {
        gatherers: new Decimal(0),
        woodcutters: new Decimal(0),
        stonecutters: new Decimal(0),
      };

      // Map jobType to the correct key
      const jobKey = JOB_KEY_MAP[jobType];
      const currentInJob = currentJobs[jobKey];
      const actualRemove = Decimal.min(amount, currentInJob);

      const newJobs = {
        ...currentJobs,
        [jobKey]: currentInJob.minus(actualRemove),
      };

      return {
        jobs: newJobs,
      };
    });
  },

  // Get worker count for a specific job
  getWorkerCount: (jobType: JobType) => {
    const state = get() as any;
    const jobs = state.jobs || {};
    const jobKey = JOB_KEY_MAP[jobType];
    return jobs[jobKey] || new Decimal(0);
  },

  // Calculate production for a resource based on job assignments and tech multipliers
  calculateJobProduction: (resourceType: ResourceType) => {
    const state = get() as any;
    const jobs = state.jobs || {};
    const researchedTechs = state.researched || [];

    // Base production
    let production = new Decimal(0);
    let multiplier = new Decimal(1);

    if (resourceType === ResourceType.Food) {
      production = (jobs.gatherers || new Decimal(0)).times(GATHERER_BASE_RATE);

      // Check for Spears tech (1.5x food)
      if (researchedTechs.includes('spears')) {
        multiplier = multiplier.times(new Decimal(1.5));
      }
    } else if (resourceType === ResourceType.Wood) {
      production = (jobs.woodcutters || new Decimal(0)).times(WOODCUTTER_BASE_RATE);

      // Check for StoneAxes tech (2x wood)
      if (researchedTechs.includes('stoneAxes')) {
        multiplier = multiplier.times(new Decimal(2));
      }
    } else if (resourceType === ResourceType.Stone) {
      production = (jobs.stonecutters || new Decimal(0)).times(STONECUTTER_BASE_RATE);
      // No tech multiplier for stone yet
    }

    return production.times(multiplier);
  },

  // Check if a job is unlocked (requires specific tech)
  isJobUnlocked: (jobType: JobType) => {
    const state = get() as any;
    const researchedTechs = state.researched || [];

    // Stonecutter requires Flint Knapping tech
    if (jobType === JobType.Stonecutter) {
      return researchedTechs.includes('flintKnapping');
    }

    // Other jobs are unlocked by default
    return true;
  },

  // Calculate dynamic food consumption based on season and warmth
  calculateFoodConsumption: () => {
    const state = get() as any;
    const totalPop = state.settlers || new Decimal(0);
    const currentSeason = state.currentSeason || Season.Spring;
    const bonfire = state.bonfire || {};
    const resources = state.resources || {};
    const skins = resources[ResourceType.Skin] || new Decimal(0);

    // Base consumption: 1.0 food/sec per person
    let seasonModifier = SEASON_MODIFIERS[currentSeason as Season] || new Decimal(1.0);

    // Apply warmth modifiers (only in winter when modifier > 1.0)
    if (seasonModifier.greaterThan(1.0)) {
      // Check if bonfire is lit
      const bonfireStatus = bonfire.status;
      const hasBonfire = bonfireStatus && bonfireStatus !== 'extinguished' && bonfireStatus !== 'extinguishing';

      if (hasBonfire) {
        seasonModifier = seasonModifier.minus(WARMTH_BONFIRE_REDUCTION);
      }

      // Check if population is clothed (skins >= pop)
      const isClothed = skins.greaterThanOrEqualTo(totalPop);
      if (isClothed) {
        seasonModifier = seasonModifier.minus(WARMTH_CLOTHING_REDUCTION);
      }

      // Minimum modifier is 1.0
      seasonModifier = Decimal.max(new Decimal(1.0), seasonModifier);
    }

    // Calculate final consumption: Base * SeasonModifier
    const baseConsumption = totalPop.times(FOOD_CONSUMPTION_PER_PERSON);
    const finalConsumption = baseConsumption.times(seasonModifier);

    return finalConsumption;
  },

  // Get warmth status for UI display
  getWarmthStatus: () => {
    const state = get() as any;
    const currentSeason = state.currentSeason || Season.Spring;
    const bonfire = state.bonfire || {};
    const resources = state.resources || {};
    const totalPop = state.settlers || new Decimal(0);
    const skins = resources[ResourceType.Skin] || new Decimal(0);

    // Only show warmth status in cold seasons
    if (currentSeason === Season.Spring || currentSeason === Season.Summer) {
      return {
        isCold: false,
        isClothed: false,
        hasBonfire: false,
        modifier: new Decimal(1.0),
      };
    }

    const bonfireStatus = bonfire.status;
    const hasBonfire = bonfireStatus && bonfireStatus !== 'extinguished' && bonfireStatus !== 'extinguishing';
    const isClothed = skins.greaterThanOrEqualTo(totalPop);

    let seasonModifier = SEASON_MODIFIERS[currentSeason as Season] || new Decimal(1.0);

    if (seasonModifier.greaterThan(1.0)) {
      if (hasBonfire) {
        seasonModifier = seasonModifier.minus(WARMTH_BONFIRE_REDUCTION);
      }
      if (isClothed) {
        seasonModifier = seasonModifier.minus(WARMTH_CLOTHING_REDUCTION);
      }
      seasonModifier = Decimal.max(new Decimal(1.0), seasonModifier);
    }

    return {
      isCold: seasonModifier.greaterThan(1.0),
      isClothed,
      hasBonfire,
      modifier: seasonModifier,
    };
  },

  // Era 2: Get job efficiency for a specific job type
  getJobEfficiency: (jobType: any) => {
    const state = get() as any;
    const jobEfficiency = state.jobEfficiency || {};
    return jobEfficiency[jobType] || new Decimal(1.0);
  },

  // Era 2: Set job efficiency for a specific job type
  setJobEfficiency: (jobType: any, efficiency: any) => {
    set((state: any) => ({
      jobEfficiency: {
        ...(state.jobEfficiency || {}),
        [jobType]: efficiency,
      },
    }));
  },
});

// Type exports
export interface TribeSliceState {
  jobs: JobAssignment;
  // Era 2: Job efficiency tracking
  jobEfficiency: Record<string, Decimal>;  // Maps job type to efficiency (0-1)
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
