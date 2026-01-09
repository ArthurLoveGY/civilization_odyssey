import { StateCreator } from 'zustand';
import Decimal from 'decimal.js';
import { ResourceSliceState, ResourceActions } from '../types';
import { ResourceType, StorageCap } from '../../types/game';

// Create the resource slice
export const createResourceSlice: StateCreator<
  ResourceSliceState & ResourceActions,
  [],
  [],
  ResourceSliceState & ResourceActions
> = (set, get) => ({
  // Initial state
  resources: {
    // Era 1 Resources
    [ResourceType.Food]: new Decimal(50),     // Start with 50 food
    [ResourceType.Wood]: new Decimal(20),     // Start with 20 wood
    [ResourceType.Skin]: new Decimal(0),      // Start with 0 skin
    [ResourceType.Stone]: new Decimal(0),     // Start with 0 stone
    [ResourceType.Meat]: new Decimal(0),      // Start with 0 meat
    [ResourceType.CuredMeat]: new Decimal(0), // Start with 0 cured meat
    [ResourceType.Ideas]: new Decimal(0),     // Start with 0 ideas
    [ResourceType.Tradition]: new Decimal(0), // Start with 0 tradition
    [ResourceType.Settlers]: new Decimal(5),  // Start with 5 settlers

     // Era 2 Resources (initialize at 0, added when Era 2 starts)
     [ResourceType.Gold]: new Decimal(0),        // Start with 0 gold
     [ResourceType.IronOre]: new Decimal(0),     // Start with 0 iron ore
     [ResourceType.IronIngot]: new Decimal(0),   // Start with 0 iron ingot
     [ResourceType.Science]: new Decimal(0),     // Start with 0 science
     [ResourceType.Culture]: new Decimal(0),     // Start with 0 culture
     [ResourceType.Manpower]: new Decimal(0),    // Start with 0 manpower
   },
  storageCaps: {
    // Era 1 Resources
    food: new Decimal(100),
    wood: new Decimal(100),
    skin: new Decimal(50),
    stone: new Decimal(50),
    meat: new Decimal(30),      // Meat spoils faster
    curedMeat: new Decimal(100), // Cured meat lasts longer
    tradition: new Decimal(1000), // Tradition cap (Era 2 unlock requires 500)

     // Era 2 Resources
     gold: new Decimal(1000),     // Gold storage cap
     ironOre: new Decimal(500),   // Iron ore cap
     ironIngot: new Decimal(200), // Iron ingot cap
     science: new Decimal(1000),  // Science cap (knowledge is vast)
     culture: new Decimal(1000),   // Culture cap
     manpower: new Decimal(100),  // Manpower cap

     // Ideas has no storage cap (knowledge is unlimited!)
  },

  // Add resource (with storage cap enforcement)
  addResource: (type, amount) => {
    set((state) => {
      const currentAmount = state.resources[type];
      const storageCap = state.storageCaps[type as keyof StorageCap];
      const newAmount = Decimal.min(storageCap, currentAmount.plus(amount));

      return {
        resources: {
          ...state.resources,
          [type]: newAmount,
        },
      };
    });
  },

  // Remove resource
  removeResource: (type, amount) => {
    set((state) => {
      const currentAmount = state.resources[type];
      const newAmount = Decimal.max(0, currentAmount.minus(amount)); // Don't go below 0
      return {
        resources: {
          ...state.resources,
          [type]: newAmount,
        },
      };
    });
  },

  // Get resource amount
  getResource: (type) => {
    return get().resources[type];
  },

  // Set resource to specific amount
  setResource: (type, amount) => {
    set((state) => ({
      resources: {
        ...state.resources,
        [type]: amount,
      },
    }));
  },

  // Check if we can afford something
  canAfford: (type, amount) => {
    return get().resources[type].greaterThanOrEqualTo(amount);
  },

  // Check if we can add resource (won't exceed cap)
  canAddResource: (type, amount) => {
    const state = get();
    const currentAmount = state.resources[type];
    const storageCap = state.storageCaps[type as keyof StorageCap];
    const projectedAmount = currentAmount.plus(amount);

    return projectedAmount.lessThanOrEqualTo(storageCap);
  },

  // Add multiple resources at once
  addResources: (resources) => {
    set((state) => {
      const newResources = { ...state.resources };

      Object.entries(resources).forEach(([type, amount]) => {
        if (amount) {
          const resourceType = type as ResourceType;
          const currentAmount = state.resources[resourceType];
          const storageCap = state.storageCaps[resourceType as keyof StorageCap];
          newResources[resourceType] = Decimal.min(storageCap, currentAmount.plus(amount));
        }
      });

      return {
        resources: newResources,
      };
    });
  },

  // Remove multiple resources at once
  removeResources: (resources) => {
    set((state) => {
      const newResources = { ...state.resources };

      Object.entries(resources).forEach(([type, amount]) => {
        if (amount) {
          const resourceType = type as ResourceType;
          const currentAmount = state.resources[resourceType];
          newResources[resourceType] = Decimal.max(0, currentAmount.minus(amount));
        }
      });

      return {
        resources: newResources,
      };
    });
  },
});
