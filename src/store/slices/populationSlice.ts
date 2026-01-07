import { StateCreator } from 'zustand';
import Decimal from 'decimal.js';
import { PopulationSliceState, PopulationActions } from '../types';
import { ResourceType } from '../../types/game';

// Create the population slice
export const createPopulationSlice: StateCreator<
  PopulationSliceState & PopulationActions,
  [],
  [],
  PopulationSliceState & PopulationActions
> = (set, get) => ({
  // Initial state
  settlers: new Decimal(5),
  maxPopulation: new Decimal(5),  // Base max population
  growthProgress: new Decimal(0),  // Growth progress (0-100 ticks)
  starvationCounter: 0,

  // Consume food for population (stub - actual logic is in game/tick.ts)
  consumeFood: () => {
    // This is handled in game/tick.ts to access both population and resources
    // The actual resource modification happens in the tick function
  },

  // Check if population should starve
  checkStarvation: () => {
    set((state: any) => {
      const food = state.resources[ResourceType.Food] || new Decimal(0);
      const meat = state.resources[ResourceType.Meat] || new Decimal(0);
      const curedMeat = state.resources[ResourceType.CuredMeat] || new Decimal(0);
      const currentSettlers = state.settlers as Decimal;

      // Calculate total food points (CuredMeat = 5x value)
      const totalFoodPoints = food.plus(meat).plus(curedMeat.times(5));

      // If all food sources are 0 or negative, settlers die
      if (totalFoodPoints.lte(0)) {
        // 10-30% of population dies from starvation
        const deathPercent = new Decimal(0.1 + Math.random() * 0.2);
        const deaths = currentSettlers.times(deathPercent).floor();
        const survivors = Decimal.max(1, currentSettlers.minus(deaths)); // At least 1 survivor

        return {
          settlers: survivors,
          resources: {
            ...state.resources,
            [ResourceType.Food]: new Decimal(0),
            [ResourceType.Meat]: new Decimal(0),
            [ResourceType.CuredMeat]: new Decimal(0),
          },
          starvationCounter: (state.starvationCounter || 0) + 1,
        };
      }

      // Reset starvation counter if we have food
      return {
        starvationCounter: 0,
      };
    });
  },

  // Check if population freezes in winter (needs wood for heating)
  checkFreezing: () => {
    set((state: any) => {
      const wood = state.resources[ResourceType.Wood];
      const currentSeason = state.currentSeason;
      const currentSettlers = state.settlers as Decimal;

      // In winter, if no wood, settlers freeze
      if (currentSeason === 'winter' && wood.lte(0)) {
        // 5-15% of population freezes
        const deathPercent = new Decimal(0.05 + Math.random() * 0.1);
        const deaths = currentSettlers.times(deathPercent).floor();
        const survivors = Decimal.max(1, currentSettlers.minus(deaths)); // At least 1 survivor

        return {
          settlers: survivors,
          resources: {
            ...state.resources,
            [ResourceType.Wood]: new Decimal(0),
          },
        };
      }

      return state;
    });
  },

  // Add settlers
  addSettlers: (amount) => {
    set((state) => ({
      settlers: state.settlers.plus(amount),
    }));
  },

  // Remove settlers
  removeSettlers: (amount) => {
    set((state) => ({
      settlers: Decimal.max(1, state.settlers.minus(amount)), // At least 1 survivor
    }));
  },

  // Get max population (from buildings or base)
  getMaxPopulation: () => {
    // This will be overridden by buildingsSlice when combined
    return get().maxPopulation;
  },

  // Check if population can grow
  canGrowPopulation: () => {
    const state = get() as any;
    const food = state.resources?.[ResourceType.Food] || new Decimal(0);
    const meat = state.resources?.[ResourceType.Meat] || new Decimal(0);
    const curedMeat = state.resources?.[ResourceType.CuredMeat] || new Decimal(0);
    const settlers = state.settlers;
    const maxPop = state.maxPopulation;
    const bonfireStatus = state.bonfire ? state.getBonfireStatus?.() : 'burning';

    // Calculate total food points (CuredMeat = 5x value)
    const totalFoodPoints = food.plus(meat).plus(curedMeat.times(5));

    // Growth conditions: total food points > 20, bonfire lit, not at max population
    return totalFoodPoints.greaterThan(20) &&
           bonfireStatus !== 'extinguished' &&
           settlers.lessThan(maxPop);
  },

  // Update growth progress
  updateGrowthProgress: (delta) => {
    set((state) => ({
      growthProgress: state.growthProgress.plus(delta),
    }));
  },
});
