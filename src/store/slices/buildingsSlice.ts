import { StateCreator } from 'zustand';
import Decimal from 'decimal.js';
import { BuildingType, ResourceType, StorageCap } from '../../types/game';

// Building configuration
const BUILDING_CONFIG: Record<BuildingType, {
  baseCost: Partial<Record<ResourceType, Decimal>>;
  costMultiplier: Decimal;
  populationBonus?: Decimal;
  storageBonus?: Partial<Record<ResourceType, Decimal>>;
  category?: 'population' | 'storage' | 'survival' | 'culture' | 'wonder' | 'city' | 'industrial';
}> = {
  // Era 1 Buildings
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
  [BuildingType.TribalHall]: {
    baseCost: {
      [ResourceType.Wood]: new Decimal(2000),
      [ResourceType.Stone]: new Decimal(1000),
      [ResourceType.Tradition]: new Decimal(500),
      [ResourceType.Ideas]: new Decimal(1000),
    },
    costMultiplier: new Decimal(1.0), // No exponential scaling for wonder
    category: 'wonder',
  },
  
  // Era 2 Buildings (Kingdom)
  // Tier 1: Order (Prerequisites: None)
  [BuildingType.TaxOffice]: {
    baseCost: {
      [ResourceType.Wood]: new Decimal(500),
      [ResourceType.Ideas]: new Decimal(0),
    },
    costMultiplier: new Decimal(1.5), // Exponential growth
    category: 'city',
  },
  [BuildingType.Aqueduct]: {
    baseCost: {
      [ResourceType.Stone]: new Decimal(100),
      [ResourceType.IronIngot]: new Decimal(50),
    },
    costMultiplier: new Decimal(1.25), // Lower multiplier for infrastructure
    category: 'city',
    populationBonus: new Decimal(15), // +15 housing cap per aqueduct
  },
  [BuildingType.Library]: {
    baseCost: {
      [ResourceType.Wood]: new Decimal(200),
      [ResourceType.Gold]: new Decimal(50),
    },
    costMultiplier: new Decimal(1.3),
    category: 'culture',
  },
  [BuildingType.CityWalls]: {
    baseCost: {
      [ResourceType.Stone]: new Decimal(200),
      [ResourceType.IronIngot]: new Decimal(100),
    },
    costMultiplier: new Decimal(1.4),
    category: 'wonder',
    populationBonus: new Decimal(5), // +5 housing cap per wall segment
  },
  // Tier 2: Industry (Prerequisites: Masonry)
  [BuildingType.DeepMine]: {
    baseCost: {
      [ResourceType.Wood]: new Decimal(100),
      [ResourceType.IronIngot]: new Decimal(20),
    },
    costMultiplier: new Decimal(1.15), // Lower multiplier for production buildings
    category: 'industrial',
  },
  [BuildingType.Smelter]: {
    baseCost: {
      [ResourceType.Stone]: new Decimal(200),
      [ResourceType.Wood]: new Decimal(100),
    },
    costMultiplier: new Decimal(1.15),
    category: 'industrial',
  },
  [BuildingType.Blacksmith]: {
    baseCost: {
      [ResourceType.Wood]: new Decimal(150),
      [ResourceType.IronOre]: new Decimal(50),
    },
    costMultiplier: new Decimal(1.2),
    category: 'industrial',
  },
  // Tier 3: Economy (Prerequisites: Civil Service + Metallurgy)
  [BuildingType.Market]: {
    baseCost: {
      [ResourceType.Wood]: new Decimal(300),
      [ResourceType.Gold]: new Decimal(200),
      [ResourceType.IronIngot]: new Decimal(50),
    },
    costMultiplier: new Decimal(1.8),
    category: 'city',
  },
  [BuildingType.Bank]: {
    baseCost: {
      [ResourceType.Stone]: new Decimal(400),
      [ResourceType.Gold]: new Decimal(300),
      [ResourceType.IronIngot]: new Decimal(100),
    },
    costMultiplier: new Decimal(2.0),
    category: 'city',
  },
  [BuildingType.Barracks]: {
    baseCost: {
      [ResourceType.Wood]: new Decimal(250),
      [ResourceType.Stone]: new Decimal(150),
      [ResourceType.IronIngot]: new Decimal(50),
    },
    costMultiplier: new Decimal(1.5),
    category: 'wonder',
    populationBonus: new Decimal(10), // +10 housing cap for guards
  },
  // Housing
  [BuildingType.House]: {
    baseCost: {
      [ResourceType.Wood]: new Decimal(50),
      [ResourceType.Stone]: new Decimal(30),
    },
    costMultiplier: new Decimal(1.4),
    populationBonus: new Decimal(10), // +10 max pop (better than tent's +5)
    category: 'population',
  },
  [BuildingType.Palace]: {
    baseCost: {
      [ResourceType.Wood]: new Decimal(5000),
      [ResourceType.Stone]: new Decimal(3000),
      [ResourceType.Gold]: new Decimal(2000),
      [ResourceType.IronIngot]: new Decimal(500),
    },
    costMultiplier: new Decimal(1.0), // No exponential scaling for wonder
    category: 'wonder',
  },
};

// Base storage caps (without buildings)
const BASE_STORAGE_CAPS: StorageCap = {
  // Era 1 Resources
  food: new Decimal(100),
  wood: new Decimal(100),
  skin: new Decimal(50),
  stone: new Decimal(50),
  meat: new Decimal(30),
  curedMeat: new Decimal(100),
  tradition: new Decimal(1000),  // Tradition cap

  // Era 2 Resources
  gold: new Decimal(1000),       // Gold storage cap
  ironOre: new Decimal(500),     // Iron ore cap
  ironIngot: new Decimal(200),   // Iron ingot cap
  science: new Decimal(1000),    // Science cap
  manpower: new Decimal(100),    // Manpower cap
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
    // Era 1 Buildings
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
    tribalHall: {
      count: new Decimal(0),
      baseCost: BUILDING_CONFIG[BuildingType.TribalHall].baseCost,
      costMultiplier: BUILDING_CONFIG[BuildingType.TribalHall].costMultiplier,
    },
    
    // Era 2 Buildings (Kingdom)
    // Tier 1: Order
    taxOffice: {
      count: new Decimal(0),
      baseCost: BUILDING_CONFIG[BuildingType.TaxOffice].baseCost,
      costMultiplier: BUILDING_CONFIG[BuildingType.TaxOffice].costMultiplier,
    },
    aqueduct: {
      count: new Decimal(0),
      baseCost: BUILDING_CONFIG[BuildingType.Aqueduct].baseCost,
      costMultiplier: BUILDING_CONFIG[BuildingType.Aqueduct].costMultiplier,
    },
    library: {
      count: new Decimal(0),
      baseCost: BUILDING_CONFIG[BuildingType.Library].baseCost,
      costMultiplier: BUILDING_CONFIG[BuildingType.Library].costMultiplier,
    },
    cityWalls: {
      count: new Decimal(0),
      baseCost: BUILDING_CONFIG[BuildingType.CityWalls].baseCost,
      costMultiplier: BUILDING_CONFIG[BuildingType.CityWalls].costMultiplier,
    },
    // Tier 2: Industry
    deepMine: {
      count: new Decimal(0),
      baseCost: BUILDING_CONFIG[BuildingType.DeepMine].baseCost,
      costMultiplier: BUILDING_CONFIG[BuildingType.DeepMine].costMultiplier,
    },
    smelter: {
      count: new Decimal(0),
      baseCost: BUILDING_CONFIG[BuildingType.Smelter].baseCost,
      costMultiplier: BUILDING_CONFIG[BuildingType.Smelter].costMultiplier,
    },
    blacksmith: {
      count: new Decimal(0),
      baseCost: BUILDING_CONFIG[BuildingType.Blacksmith].baseCost,
      costMultiplier: BUILDING_CONFIG[BuildingType.Blacksmith].costMultiplier,
    },
    // Tier 3: Economy
    market: {
      count: new Decimal(0),
      baseCost: BUILDING_CONFIG[BuildingType.Market].baseCost,
      costMultiplier: BUILDING_CONFIG[BuildingType.Market].costMultiplier,
    },
    bank: {
      count: new Decimal(0),
      baseCost: BUILDING_CONFIG[BuildingType.Bank].baseCost,
      costMultiplier: BUILDING_CONFIG[BuildingType.Bank].costMultiplier,
    },
    barracks: {
      count: new Decimal(0),
      baseCost: BUILDING_CONFIG[BuildingType.Barracks].baseCost,
      costMultiplier: BUILDING_CONFIG[BuildingType.Barracks].costMultiplier,
    },
    // Housing
    house: {
      count: new Decimal(0),
      baseCost: BUILDING_CONFIG[BuildingType.House].baseCost,
      costMultiplier: BUILDING_CONFIG[BuildingType.House].costMultiplier,
    },
    palace: {
      count: new Decimal(0),
      baseCost: BUILDING_CONFIG[BuildingType.Palace].baseCost,
      costMultiplier: BUILDING_CONFIG[BuildingType.Palace].costMultiplier,
    },
  } as any,

  storageCaps: {
    // Era 1 Resources
    food: new Decimal(100),
    wood: new Decimal(100),
    skin: new Decimal(50),
    stone: new Decimal(50),
    meat: new Decimal(30),
    curedMeat: new Decimal(100),
    tradition: new Decimal(1000),
    // Era 2 Resources
    gold: new Decimal(1000),
    ironOre: new Decimal(500),
    ironIngot: new Decimal(200),
    science: new Decimal(1000),
    culture: new Decimal(1000),
    manpower: new Decimal(100),
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

      // Check maxCount for wonder category
      const config = BUILDING_CONFIG[type];
      if (config.category === 'wonder' && building.count.gte(1)) {
        return state; // Max 1 wonder allowed - return unchanged state
      }

      // Track if this is Tribal Hall and it's the first one being built
      const isTribalHall = type === 'tribalHall' as any;
      const isFirstTribalHall = isTribalHall && building.count.equals(0);

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

      // Trigger victory check when Tribal Hall is built
      if (isTribalHall && isFirstTribalHall) {
        // Era completed!
        setTimeout(() => {
          set((s: any) => ({
            ...s,
            isEraCompleted: true,
            isPaused: true,
          }));
          (get() as any).addLog ? (get() as any).addLog('部落时代已完成！部落大厅已建成，文明的新篇章即将开始。', 'success') : null;
        }, 0);
      }

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
