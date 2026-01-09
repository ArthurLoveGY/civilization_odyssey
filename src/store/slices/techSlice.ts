import { StateCreator } from 'zustand';
import Decimal from 'decimal.js';
import { TechType, TechDefinition, ResourceType, JobType, TechTier } from '../../types/game';

// Tech tree configuration (Era 1 only)
const TECH_TREE: Partial<Record<TechType, TechDefinition>> = {
  [TechType.FlintKnapping]: {
    name: '打制石器',
    description: '学会打制石器，解锁碎石工岗位，手动采集石料+1',
    tier: TechTier.Tribal,
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
    tier: TechTier.Tribal,
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
    tier: TechTier.Tribal,
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
  tradition: new Decimal(0),
  councilGround: {
    lastUsedTime: 0,
    cooldown: COUNCIL_GROUND_COOLDOWN,
  },
  // Era 2
  science: new Decimal(0),  // Scientific knowledge for Era 2 techs
  culture: new Decimal(0),  // Culture points for policy unlocks

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
    if (!tech) {
      return false;
    }

    // Check if player has enough ideas
    if (tech.cost.ideas && state.ideas.lessThan(tech.cost.ideas)) {
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
    if (!tech) {
      return;
    }

    // Deduct ideas
    if (tech.cost.ideas) {
      const ideasCost = tech.cost.ideas;
      set((prevState) => ({
        ideas: prevState.ideas.minus(ideasCost),
      }));
    }

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
      if (!tech?.effects) continue;

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
      if (tech?.effects?.skinDropRateMultiplier) {
        multiplier = multiplier.times(tech.effects.skinDropRateMultiplier);
      }
    }

    return multiplier;
  },

  // Era 2: Check if tech prerequisites are met
  checkPrerequisites: (_techType: TechType) => {
    // For now, all Era 2 techs have no prerequisites
    // This will be expanded when tech tree is fully implemented
    return true;
  },

  // Era 2: Research Era 2 tech (uses science instead of ideas)
  researchTechEra2: (techType: TechType) => {
    const state = get();

    // For now, just call researchTech
    // This will be expanded when Era 2 techs are fully implemented
    state.researchTech(techType); // techType is used here
  },

  // Era 2: Add science (Era 2 knowledge resource)
  addScience: (amount: Decimal) => {
    set((state) => ({
      science: state.science.plus(amount),
    }));
  },

  // Era 2: Add culture (Era 2 policy resource)
  addCulture: (amount: Decimal) => {
    set((state) => ({
      culture: state.culture.plus(amount),
    }));
  },

  // Era 2: Check if can afford science
  canAffordScience: (amount: Decimal) => {
    const state = get();
    return state.science.greaterThanOrEqualTo(amount);
  },

  // Era 2: Check if can afford culture
  canAffordCulture: (amount: Decimal) => {
    const state = get();
    return state.culture.greaterThanOrEqualTo(amount);
  },
});

// Type exports
export interface TechSliceState {
  researched: TechType[];
  ideas: Decimal;
  tradition: Decimal;
  councilGround: {
    lastUsedTime: number;
    cooldown: number;
  };
  // Era 2
  science: Decimal;  // Scientific knowledge for Era 2 techs
  culture: Decimal;  // Culture points for policy unlocks
}

export interface TechActions {
  getAllTechs: () => Partial<Record<TechType, TechDefinition>>;
  getTechDefinition: (techType: TechType) => TechDefinition | undefined;
  isTechResearched: (techType: TechType) => boolean;
  canResearchTech: (techType: TechType) => boolean;
  researchTech: (techType: TechType) => void;
  addIdeas: (amount: Decimal) => void;
  useCouncilGround: () => boolean;
  isCouncilGroundOnCooldown: () => boolean;
  getCouncilGroundCooldownRemaining: () => string;
  getManualActionMultiplier: (resourceType: ResourceType) => Decimal;
  getSkinDropRateMultiplier: () => Decimal;
  // Era 2
  checkPrerequisites: (techType: TechType) => boolean;
  researchTechEra2: (techType: TechType) => void;
  addScience: (amount: Decimal) => void;
  addCulture: (amount: Decimal) => void;
  canAffordScience: (amount: Decimal) => boolean;
  canAffordCulture: (amount: Decimal) => boolean;
}
