import { StateCreator } from 'zustand';
import Decimal from 'decimal.js';
import { TechType, TechDefinition, ResourceType, JobType } from '../../types/game';

// Tech tree configuration
const TECH_TREE: Record<TechType, TechDefinition> = {
  [TechType.FlintKnapping]: {
    name: '打制石器',
    description: '学会打制石器，解锁碎石工岗位，手动采集石料+1',
    cost: {
      ideas: new Decimal(70),  // Reduced from 150 for faster first unlock
      resources: {
        [ResourceType.Stone]: new Decimal(20),
      },
    },
    effects: {
      manualStoneMultiplier: new Decimal(2),  // +1 stone (base 1 -> 2)
      unlocksJob: JobType.Stonecutter,
    },
  },
  [TechType.StoneAxes]: {
    name: '石斧',
    description: '制作石斧，伐木效率翻倍',
    cost: {
      ideas: new Decimal(200),
      resources: {
        [ResourceType.Wood]: new Decimal(50),
        [ResourceType.Stone]: new Decimal(30),
      },
    },
    effects: {
      woodcutterMultiplier: new Decimal(2),
      manualWoodMultiplier: new Decimal(2),
    },
  },
  [TechType.Spears]: {
    name: '长矛',
    description: '制作长矛，食物获取效率x1.5，毛皮掉落率翻倍',
    cost: {
      ideas: new Decimal(180),
      resources: {
        [ResourceType.Wood]: new Decimal(40),
      },
    },
    effects: {
      gathererMultiplier: new Decimal(1.5),
      manualFoodMultiplier: new Decimal(1.5),
      skinDropRateMultiplier: new Decimal(2),
    },
  },
};

// Council Ground configuration
const COUNCIL_GROUND_COST = {
  food: new Decimal(5),
};
const COUNCIL_GROUND_REWARD = {
  ideas: new Decimal(15),  // Buffed from 10-20 to flat 15
};
const COUNCIL_GROUND_COOLDOWN = 30000; // 30 seconds in milliseconds

// Create the tech slice
export const createTechSlice: StateCreator<
  TechSliceState & TechActions,
  [],
  [],
  TechSliceState & TechActions
> = (set, get) => ({
  // Initial state
  researched: [],
  ideas: new Decimal(0),
  councilGround: {
    lastUsedTime: 0,
    cooldown: COUNCIL_GROUND_COOLDOWN,
  },

  // Get all available techs
  getAllTechs: () => {
    return TECH_TREE;
  },

  // Get tech definition
  getTechDefinition: (techType: TechType) => {
    return TECH_TREE[techType];
  },

  // Check if tech is researched
  isTechResearched: (techType: TechType) => {
    const state = get();
    return state.researched.includes(techType);
  },

  // Check if tech can be researched (has prerequisites)
  canResearchTech: (techType: TechType) => {
    const state = get();

    // Already researched
    if (state.researched.includes(techType)) {
      return false;
    }

    const tech = TECH_TREE[techType];

    // Check if player has enough ideas
    if (state.ideas.lessThan(tech.cost.ideas)) {
      return false;
    }

    // Check if player has enough resources
    if (tech.cost.resources) {
      const resources = (get() as any).resources || {};
      for (const [resourceType, amount] of Object.entries(tech.cost.resources)) {
        const currentAmount = resources[resourceType] || new Decimal(0);
        if (currentAmount.lessThan(amount)) {
          return false;
        }
      }
    }

    return true;
  },

  // Research a tech
  researchTech: (techType: TechType) => {
    const state = get();

    // Double-check if can research
    if (!state.canResearchTech(techType)) {
      return;
    }

    const tech = TECH_TREE[techType];

    // Deduct ideas
    set((prevState) => ({
      ideas: prevState.ideas.minus(tech.cost.ideas),
    }));

    // Deduct resources
    if (tech.cost.resources) {
      for (const [resourceType, amount] of Object.entries(tech.cost.resources)) {
        const removeResource = (get() as any).removeResource;
        if (removeResource) {
          removeResource(resourceType as ResourceType, amount);
        }
      }
    }

    // Add to researched list
    set((prevState) => ({
      researched: [...prevState.researched, techType],
    }));
  },

  // Add ideas (from idle population or council ground)
  addIdeas: (amount: Decimal) => {
    set((state) => ({
      ideas: state.ideas.plus(amount),
    }));
  },

  // Council Ground action
  useCouncilGround: () => {
    const state = get();
    const now = Date.now();
    const timeSinceLastUse = now - state.councilGround.lastUsedTime;

    // Check cooldown
    if (timeSinceLastUse < state.councilGround.cooldown) {
      return false; // Still on cooldown
    }

    // Check if player has enough food
    const resources = (get() as any).resources || {};
    const currentFood = resources[ResourceType.Food] || new Decimal(0);

    if (currentFood.lessThan(COUNCIL_GROUND_COST.food)) {
      return false; // Not enough food
    }

    // Deduct food cost
    const removeResource = (get() as any).removeResource;
    if (removeResource) {
      removeResource(ResourceType.Food, COUNCIL_GROUND_COST.food);
    }

    // Add ideas reward
    set((prevState) => ({
      ideas: prevState.ideas.plus(COUNCIL_GROUND_REWARD.ideas),
      councilGround: {
        ...prevState.councilGround,
        lastUsedTime: now,
      },
    }));

    return true; // Success
  },

  // Check if Council Ground is on cooldown
  isCouncilGroundOnCooldown: () => {
    const state = get();
    const now = Date.now();
    const timeSinceLastUse = now - state.councilGround.lastUsedTime;
    return timeSinceLastUse < state.councilGround.cooldown;
  },

  // Get remaining cooldown time in seconds
  getCouncilGroundCooldownRemaining: () => {
    const state = get();
    const now = Date.now();
    const timeSinceLastUse = now - state.councilGround.lastUsedTime;
    const remaining = Math.max(0, state.councilGround.cooldown - timeSinceLastUse);
    return (remaining / 1000).toFixed(1); // Return in seconds with 1 decimal
  },

  // Get tech multiplier for manual actions
  getManualActionMultiplier: (resourceType: ResourceType) => {
    const state = get();
    let multiplier = new Decimal(1);

    for (const techType of state.researched) {
      const tech = TECH_TREE[techType];
      if (!tech.effects) continue;

      if (resourceType === ResourceType.Food && tech.effects.manualFoodMultiplier) {
        multiplier = multiplier.times(tech.effects.manualFoodMultiplier);
      }
      if (resourceType === ResourceType.Wood && tech.effects.manualWoodMultiplier) {
        multiplier = multiplier.times(tech.effects.manualWoodMultiplier);
      }
      if (resourceType === ResourceType.Stone && tech.effects.manualStoneMultiplier) {
        multiplier = multiplier.times(tech.effects.manualStoneMultiplier);
      }
    }

    return multiplier;
  },

  // Get skin drop rate multiplier
  getSkinDropRateMultiplier: () => {
    const state = get();
    let multiplier = new Decimal(1);

    for (const techType of state.researched) {
      const tech = TECH_TREE[techType];
      if (tech.effects?.skinDropRateMultiplier) {
        multiplier = multiplier.times(tech.effects.skinDropRateMultiplier);
      }
    }

    return multiplier;
  },
});

// Type exports
export interface TechSliceState {
  researched: TechType[];
  ideas: Decimal;
  councilGround: {
    lastUsedTime: number;
    cooldown: number;
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
