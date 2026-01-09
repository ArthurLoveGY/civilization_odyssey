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
  // Era 2: Derived attributes
  housingCap: new Decimal(20),  // Base housing cap for Era 2
  security: new Decimal(100),    // Base security (100%)
  happiness: new Decimal(75),   // Base happiness (75%)

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

  // Era 2: Calculate housing cap from buildings
  calculateHousingCap: () => {
    const state = get() as any;
    const buildings = state.buildings as any;
    const baseCap = new Decimal(20);
    
    // Aqueduct: +15 housing per building
    const aqueductCount = buildings.aqueduct?.count || new Decimal(0);
    const aqueductBonus = aqueductCount.times(15);
    
    // CityWalls: +5 housing per building
    const cityWallsCount = buildings.cityWalls?.count || new Decimal(0);
    const cityWallsBonus = cityWallsCount.times(5);
    
    // Barracks: +10 housing per building
    const barracksCount = buildings.barracks?.count || new Decimal(0);
    const barracksBonus = barracksCount.times(10);
    
    // House: +10 housing per building
    const houseCount = buildings.house?.count || new Decimal(0);
    const houseBonus = houseCount.times(10);
    
    return baseCap.plus(aqueductBonus).plus(cityWallsBonus).plus(barracksBonus).plus(houseBonus);
  },

  // Era 2: Calculate security from buildings and guards
  calculateSecurity: () => {
    const state = get() as any;
    const buildings = state.buildings as any;
    const jobs = state.jobs || {};
    
    // Base security: 100%
    const baseSecurity = new Decimal(100);
    
    // Decay: -0.5 security per total population
    const totalPopulation = state.settlers || new Decimal(0);
    const decay = totalPopulation.times(new Decimal(0.5));
    
    // Defense from guards: +2 security per guard
    const guardCount = jobs.guards || new Decimal(0);
    const guardDefense = guardCount.times(2);
    
    // Defense from CityWalls: +5 security per wall
    const cityWallsCount = buildings.cityWalls?.count || new Decimal(0);
    const wallDefense = cityWallsCount.times(5);
    
    const totalDefense = guardDefense.plus(wallDefense);
    const finalSecurity = baseSecurity.minus(decay).plus(totalDefense);
    
    // Clamp to 0-100 range
    return Decimal.max(0, Decimal.min(100, finalSecurity));
  },

  // Era 2: Update happiness (simplified for now, full calculation in happinessSlice)
  updateHappiness: () => {
    const state = get() as any;
    const currentHappiness = state.happiness || new Decimal(75);
    
    // Simple happiness calculation based on food and security
    const food = state.resources?.[ResourceType.Food] || new Decimal(0);
    const security = state.security || new Decimal(100);
    
    // Food bonus: +10 happiness if food > 50
    const foodBonus = food.greaterThan(50) ? new Decimal(10) : new Decimal(0);
    
    // Security penalty: -0.5 happiness for each security point below 80
    const securityPenalty = security.lessThan(80) ? 
      new Decimal(80).minus(security).times(0.5) : new Decimal(0);
    
    const targetHappiness = currentHappiness.plus(foodBonus).minus(securityPenalty);
    
    // Clamp to 0-100 range
    const newHappiness = Decimal.max(0, Decimal.min(100, targetHappiness));
    
    set({ happiness: newHappiness });
  },
});
