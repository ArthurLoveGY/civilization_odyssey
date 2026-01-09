import { StateCreator } from 'zustand';
import Decimal from 'decimal.js';
import { SocialClass, SocialClassAssignment, ResourceType } from '../../types/game';

// Social class metadata configuration
const SOCIAL_CLASS_CONFIG: Record<SocialClass, {
  name: string;
  description: string;
  icon: string;
  baseConsumption: { food: Decimal; gold?: Decimal };
  baseProduction: { resource?: ResourceType; amount: Decimal };
  taxContribution: Decimal;
  happinessImpact: Decimal;
}> = {
  [SocialClass.Peasant]: {
    name: '农民',
    description: '在田地劳作，产出食物，提供税基',
    icon: '🌾',
    baseConsumption: { food: new Decimal(0.1) }, // 1.0 food/sec
    baseProduction: { resource: ResourceType.Food, amount: new Decimal(0.4) }, // 4.0 food/sec
    taxContribution: new Decimal(1.0), // Base tax multiplier
    happinessImpact: new Decimal(0),
  },
  [SocialClass.Worker]: {
    name: '工人',
    description: '在矿井和工坊工作，产出工业原料',
    icon: '⚒️',
    baseConsumption: { food: new Decimal(0.15) }, // 1.5 food/sec (more than peasants)
    baseProduction: { resource: ResourceType.IronOre, amount: new Decimal(0.05) }, // 0.5 iron ore/sec
    taxContribution: new Decimal(1.5), // Higher tax contribution
    happinessImpact: new Decimal(-5), // Slightly unhappy
  },
  [SocialClass.Scholar]: {
    name: '学者',
    description: '在图书馆研究，消耗食物+黄金，产出科学',
    icon: '📚',
    baseConsumption: { food: new Decimal(0.1), gold: new Decimal(0.01) }, // 0.1 gold/sec
    baseProduction: { resource: ResourceType.Science, amount: new Decimal(0.02) }, // 0.2 science/sec
    taxContribution: new Decimal(0.5), // Lower tax (they consume resources)
    happinessImpact: new Decimal(5), // Slightly happy
  },
};

export interface SocialClassSliceState {
  socialClasses: SocialClassAssignment;
  totalPopulation: Decimal;
  idlePopulation: Decimal;
}

export interface SocialClassActions {
  assignSocialClass: (classType: SocialClass, amount: Decimal) => void;
  removeSocialClass: (classType: SocialClass, amount: Decimal) => void;
  getClassCount: (classType: SocialClass) => Decimal;
  getIdlePopulation: () => Decimal;
  calculateClassProduction: (resourceType: ResourceType) => Decimal;
  calculateClassConsumption: (resourceType: ResourceType) => Decimal;
  calculateTotalTaxBase: () => Decimal;
  initializeEra2Population: (settlers: Decimal) => void; // Convert Settlers → Peasants
}

export const createSocialClassSlice: StateCreator<
  SocialClassSliceState & SocialClassActions,
  [],
  [],
  SocialClassSliceState & SocialClassActions
> = (set, get) => ({
  // Initial state (all zero, initialized when Era 2 starts)
  socialClasses: {
    peasants: new Decimal(0),
    workers: new Decimal(0),
    scholars: new Decimal(0),
  },
  totalPopulation: new Decimal(0),
  idlePopulation: new Decimal(0),

  // Assign population to a social class
  assignSocialClass: (classType: SocialClass, amount: Decimal) => {
    set((state: any) => {
      const currentClasses = state.socialClasses || get().socialClasses;
      const idlePop = get().getIdlePopulation();

      // Can't assign more than idle population
      const actualAssign = Decimal.min(amount, idlePop);

      // Map class type to state key
      const classKey = (classType + 's') as keyof SocialClassAssignment; // peasant → peasants

      return {
        socialClasses: {
          ...currentClasses,
          [classKey]: currentClasses[classKey].plus(actualAssign),
        },
      };
    });
  },

  // Remove population from a social class
  removeSocialClass: (classType: SocialClass, amount: Decimal) => {
    set((state: any) => {
      const currentClasses = state.socialClasses || get().socialClasses;
      const classKey = (classType + 's') as keyof SocialClassAssignment;
      const currentCount = currentClasses[classKey];

      // Can't remove more than currently assigned
      const actualRemove = Decimal.min(amount, currentCount);

      return {
        socialClasses: {
          ...currentClasses,
          [classKey]: currentCount.minus(actualRemove),
        },
      };
    });
  },

  // Get count for a specific social class
  getClassCount: (classType: SocialClass) => {
    const state = get();
    const classes = state.socialClasses || {};
    const classKey = (classType + 's') as keyof SocialClassAssignment;
    return classes[classKey] || new Decimal(0);
  },

  // Calculate idle population (unassigned to any class)
  getIdlePopulation: () => {
    const state = get() as any;
    const totalPop = state.settlers || new Decimal(0);
    const classes = state.socialClasses || get().socialClasses;

    const assigned = classes.peasants
      .plus(classes.workers)
      .plus(classes.scholars);

    return Decimal.max(0, totalPop.minus(assigned));
  },

  // Calculate production from social classes
  calculateClassProduction: (resourceType: ResourceType) => {
    const state = get();
    const classes = state.socialClasses;

    let production = new Decimal(0);

    // Peasants produce food
    if (resourceType === ResourceType.Food) {
      production = production.plus(
        classes.peasants.times(SOCIAL_CLASS_CONFIG[SocialClass.Peasant].baseProduction.amount)
      );
    }

    // Workers produce iron ore
    if (resourceType === ResourceType.IronOre) {
      production = production.plus(
        classes.workers.times(SOCIAL_CLASS_CONFIG[SocialClass.Worker].baseProduction.amount)
      );
    }

    // Scholars produce science
    if (resourceType === ResourceType.Science) {
      production = production.plus(
        classes.scholars.times(SOCIAL_CLASS_CONFIG[SocialClass.Scholar].baseProduction.amount)
      );
    }

    return production;
  },

  // Calculate consumption by social classes
  calculateClassConsumption: (resourceType: ResourceType) => {
    const state = get();
    const classes = state.socialClasses;

    let consumption = new Decimal(0);

    // Food consumption (all classes)
    if (resourceType === ResourceType.Food) {
      consumption = consumption.plus(
        classes.peasants.times(SOCIAL_CLASS_CONFIG[SocialClass.Peasant].baseConsumption.food)
      );
      consumption = consumption.plus(
        classes.workers.times(SOCIAL_CLASS_CONFIG[SocialClass.Worker].baseConsumption.food)
      );
      consumption = consumption.plus(
        classes.scholars.times(SOCIAL_CLASS_CONFIG[SocialClass.Scholar].baseConsumption.food)
      );
    }

    // Gold consumption (scholars only)
    if (resourceType === ResourceType.Gold) {
      const scholarGoldConsumption = SOCIAL_CLASS_CONFIG[SocialClass.Scholar].baseConsumption.gold || new Decimal(0);
      consumption = consumption.plus(
        classes.scholars.times(scholarGoldConsumption)
      );
    }

    return consumption;
  },

  // Calculate total tax base (weighted population)
  calculateTotalTaxBase: () => {
    const state = get();
    const classes = state.socialClasses;

    // Tax base = peasants * 1.0 + workers * 1.5 + scholars * 0.5
    return classes.peasants
      .times(SOCIAL_CLASS_CONFIG[SocialClass.Peasant].taxContribution)
      .plus(classes.workers.times(SOCIAL_CLASS_CONFIG[SocialClass.Worker].taxContribution))
      .plus(classes.scholars.times(SOCIAL_CLASS_CONFIG[SocialClass.Scholar].taxContribution));
  },

  // Initialize Era 2: Convert all Settlers → Peasants
  initializeEra2Population: (settlers: Decimal) => {
    set({
      socialClasses: {
        peasants: settlers,
        workers: new Decimal(0),
        scholars: new Decimal(0),
      },
      totalPopulation: settlers,
      idlePopulation: new Decimal(0),
    });
  },
});
