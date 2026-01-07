import { StateCreator } from 'zustand';
import Decimal from 'decimal.js';
import { BuildingType, ResourceType, StorageCap } from '../../types/game';

// Building configuration
const BUILDING_CONFIG: Record<BuildingType, {
  baseCost: Partial<Record<ResourceType, Decimal>>;
  costMultiplier: Decimal;
  populationBonus?: Decimal;
  storageBonus?: Partial<Record<ResourceType, Decimal>>;
  category?: 'population' | 'storage' | 'survival' | 'culture';
}> = {
  [BuildingType.Tent]: {
    baseCost: {
      [ResourceType.Wood]: new Decimal(10),
      [ResourceType.Skin]: new Decimal(5),
    },
    costMultiplier: new Decimal(1.2),
    populationBonus: new Decimal(5),  // +5 max pop per tent
    category: 'population',
  },
  [BuildingType.Granary]: {
    baseCost: {
      [ResourceType.Wood]: new Decimal(30),
      [ResourceType.Stone]: new Decimal(10),
    },
    costMultiplier: new Decimal(1.3),
    storageBonus: {
      [ResourceType.Food]: new Decimal(100),
    },
    category: 'storage',
  },
  [BuildingType.Woodshed]: {
    baseCost: {
      [ResourceType.Wood]: new Decimal(20),
      [ResourceType.Stone]: new Decimal(5),
    },
    costMultiplier: new Decimal(1.3),
    storageBonus: {
      [ResourceType.Wood]: new Decimal(100),
    },
    category: 'storage',
  },
  [BuildingType.SkinRack]: {
    baseCost: {
      [ResourceType.Wood]: new Decimal(15),
      [ResourceType.Stone]: new Decimal(5),
    },
    costMultiplier: new Decimal(1.3),
    storageBonus: {
      [ResourceType.Skin]: new Decimal(50),
    },
    category: 'storage',
  },
  [BuildingType.StoneShed]: {
    baseCost: {
      [ResourceType.Wood]: new Decimal(20),
      [ResourceType.Stone]: new Decimal(10),
    },
    costMultiplier: new Decimal(1.3),
    storageBonus: {
      [ResourceType.Stone]: new Decimal(50),
    },
    category: 'storage',
  },
  [BuildingType.SnareTrap]: {
    baseCost: {
      [ResourceType.Wood]: new Decimal(10),
      [ResourceType.Food]: new Decimal(5),  // Bait
    },
    costMultiplier: new Decimal(1.1),  // Lower multiplier since traps decay
    category: 'survival',
  },
  [BuildingType.DryingRack]: {
    baseCost: {
      [ResourceType.Wood]: new Decimal(50),
      [ResourceType.Stone]: new Decimal(10),
    },
    costMultiplier: new Decimal(1.4),
    storageBonus: {
      [ResourceType.Meat]: new Decimal(30),
      [ResourceType.CuredMeat]: new Decimal(100),
    },
    category: 'survival',
  },
  [BuildingType.TotemPole]: {
    baseCost: {
      [ResourceType.Wood]: new Decimal(50),
      [ResourceType.Stone]: new Decimal(20),
      [ResourceType.Ideas]: new Decimal(100),
    },
    costMultiplier: new Decimal(1.8),  // High cost scaling (max 5 recommended)
    category: 'culture',
  },
  [BuildingType.Graveyard]: {
    baseCost: {
      [ResourceType.Stone]: new Decimal(100),
    },
    costMultiplier: new Decimal(1.5),
    category: 'culture',
  },
};

// Base storage caps (without buildings)
const BASE_STORAGE_CAPS: StorageCap = {
  food: new Decimal(100),
  wood: new Decimal(100),
  skin: new Decimal(50),
  stone: new Decimal(50),
  meat: new Decimal(30),
  curedMeat: new Decimal(100),
  tradition: new Decimal(1000),  // Tradition cap
};

// Base max population (without tents)
const BASE_MAX_POPULATION = new Decimal(5);

// Helper: Calculate exponential cost
const calculateBuildingCost = (
  baseCost: Record<ResourceType, Decimal>,
  count: Decimal,
  multiplier: Decimal
): Record<ResourceType, Decimal> => {
  const costs: Record<ResourceType, Decimal> = {} as any;

  Object.entries(baseCost).forEach(([resource, cost]) => {
    // Formula: baseCost * (multiplier ^ count)
    costs[resource as ResourceType] = cost.times(multiplier.pow(count));
  });

  return costs;
};

// Create the buildings slice
export const createBuildingsSlice: StateCreator<
  BuildingsSliceState & BuildingsActions,
  [],
  [],
  BuildingsSliceState & BuildingsActions
> = (set, get) => ({
  // Initial state
  buildings: {
    tent: {
      count: new Decimal(0),
      baseCost: BUILDING_CONFIG[BuildingType.Tent].baseCost,
      costMultiplier: BUILDING_CONFIG[BuildingType.Tent].costMultiplier,
    },
    granary: {
      count: new Decimal(0),
      baseCost: BUILDING_CONFIG[BuildingType.Granary].baseCost,
      costMultiplier: BUILDING_CONFIG[BuildingType.Granary].costMultiplier,
    },
    woodshed: {
      count: new Decimal(0),
      baseCost: BUILDING_CONFIG[BuildingType.Woodshed].baseCost,
      costMultiplier: BUILDING_CONFIG[BuildingType.Woodshed].costMultiplier,
    },
    skinRack: {
      count: new Decimal(0),
      baseCost: BUILDING_CONFIG[BuildingType.SkinRack].baseCost,
      costMultiplier: BUILDING_CONFIG[BuildingType.SkinRack].costMultiplier,
    },
    stoneShed: {
      count: new Decimal(0),
      baseCost: BUILDING_CONFIG[BuildingType.StoneShed].baseCost,
      costMultiplier: BUILDING_CONFIG[BuildingType.StoneShed].costMultiplier,
    },
    snareTrap: {
      count: new Decimal(0),
      baseCost: BUILDING_CONFIG[BuildingType.SnareTrap].baseCost,
      costMultiplier: BUILDING_CONFIG[BuildingType.SnareTrap].costMultiplier,
    },
    dryingRack: {
      count: new Decimal(0),
      baseCost: BUILDING_CONFIG[BuildingType.DryingRack].baseCost,
      costMultiplier: BUILDING_CONFIG[BuildingType.DryingRack].costMultiplier,
    },
    totemPole: {
      count: new Decimal(0),
      baseCost: BUILDING_CONFIG[BuildingType.TotemPole].baseCost,
      costMultiplier: BUILDING_CONFIG[BuildingType.TotemPole].costMultiplier,
    },
    graveyard: {
      count: new Decimal(0),
      baseCost: BUILDING_CONFIG[BuildingType.Graveyard].baseCost,
      costMultiplier: BUILDING_CONFIG[BuildingType.Graveyard].costMultiplier,
    },
  } as any,

  storageCaps: {
    food: new Decimal(100),
    wood: new Decimal(100),
    skin: new Decimal(50),
    stone: new Decimal(50),
    meat: new Decimal(30),
    curedMeat: new Decimal(100),
    tradition: new Decimal(1000),
  },

  // Get building count
  getBuildingCount: (type: BuildingType) => {
    const buildings = get().buildings as any;
    return buildings[type].count;
  },

  // Get current building cost (with exponential scaling)
  getBuildingCost: (type: BuildingType) => {
    const buildings = get().buildings as any;
    const building = buildings[type];
    return calculateBuildingCost(
      building.baseCost,
      building.count,
      building.costMultiplier
    );
  },

  // Check if player can afford building
  canAffordBuilding: (type: BuildingType) => {
    const buildings = get().buildings as any;
    const building = buildings[type];
    const costs = calculateBuildingCost(
      building.baseCost,
      building.count,
      building.costMultiplier
    );

    const resources = (get() as any).resources || {};

    // Check if we have enough of each required resource
    for (const [resourceType, amount] of Object.entries(costs)) {
      const currentAmount = resources[resourceType] || new Decimal(0);
      if (currentAmount.lessThan(amount)) {
        return false;
      }
    }

    return true;
  },

  // Build a building
  build: (type: BuildingType) => {
    set((state: any) => {
      const buildings = state.buildings as any;
      const building = buildings[type];

      // Calculate cost
      const costs = calculateBuildingCost(
        building.baseCost,
        building.count,
        building.costMultiplier
      );

      // Deduct resources
      const resources = { ...state.resources };
      for (const [resourceType, amount] of Object.entries(costs)) {
        const currentAmount = resources[resourceType] || new Decimal(0);
        resources[resourceType] = currentAmount.minus(amount);
      }

      // Increment building count
      const newBuildings = {
        ...buildings,
        [type]: {
          ...building,
          count: building.count.plus(1),
        },
      };

      // Recalculate storage caps
      const newStorageCaps = { ...state.storageCaps };
      const baseCaps = BASE_STORAGE_CAPS;

      // Add storage bonuses from buildings
      Object.entries(newBuildings).forEach(([buildingType, b]: [string, any]) => {
        const config = BUILDING_CONFIG[buildingType as BuildingType];
        if (config.storageBonus) {
          Object.entries(config.storageBonus).forEach(([resource, bonus]) => {
            const bonusTimesCount = (bonus as Decimal).times(b.count);
            const baseCap = baseCaps[resource as keyof StorageCap] || new Decimal(0);
            newStorageCaps[resource as keyof StorageCap] = baseCap.plus(bonusTimesCount);
          });
        }
      });

      return {
        resources,
        buildings: newBuildings,
        storageCaps: newStorageCaps,
      };
    });
  },

  // Get storage cap for a specific resource
  getStorageCap: (resource: ResourceType) => {
    const state = get();
    const buildings = state.buildings as any;
    const baseCaps = BASE_STORAGE_CAPS;
    const baseCap = baseCaps[resource as keyof StorageCap] || new Decimal(0);

    // Add storage bonuses from buildings
    let bonus = new Decimal(0);
    Object.entries(buildings).forEach(([buildingType, b]: [string, any]) => {
      const config = BUILDING_CONFIG[buildingType as BuildingType];
      if (config.storageBonus && config.storageBonus[resource]) {
        const buildingBonus = config.storageBonus[resource] as Decimal;
        bonus = bonus.plus(buildingBonus.times(b.count));
      }
    });

    return baseCap.plus(bonus);
  },

  // Get max population
  getMaxPopulation: () => {
    const state = get();
    const buildings = state.buildings as any;
    const basePop = BASE_MAX_POPULATION;

    // Add population bonuses from tents
    const tentCount = buildings.tent?.count || new Decimal(0);
    const tentBonus = BUILDING_CONFIG[BuildingType.Tent].populationBonus || new Decimal(0);

    return basePop.plus(tentBonus.times(tentCount));
  },

  // Get building category
  getBuildingCategory: (type: BuildingType) => {
    return BUILDING_CONFIG[type]?.category || 'other';
  },
});

// Type exports
export interface BuildingsSliceState {
  buildings: Record<BuildingType, {
    count: Decimal;
    baseCost: Record<ResourceType, Decimal>;
    costMultiplier: Decimal;
  }>;
  storageCaps: StorageCap;
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
