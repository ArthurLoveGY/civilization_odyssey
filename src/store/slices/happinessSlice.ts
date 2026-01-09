import { StateCreator } from 'zustand';
import Decimal from 'decimal.js';
import { HappinessStatus, HappinessFactors, ProductionEfficiency } from '../../types/game';

export interface HappinessState {
  currentHappiness: Decimal;
  targetHappiness: Decimal;
  factors: HappinessFactors;
  status: HappinessStatus;
  efficiency: ProductionEfficiency;
}

export interface HappinessActions {
  calculateTargetHappiness: () => Decimal;
  updateHappiness: () => void;
  getProductionEfficiency: () => ProductionEfficiency;
  getHappinessStatus: () => HappinessStatus;
  initializeHappinessSystem: () => void;
}

export const createHappinessSlice: StateCreator<
  HappinessState & HappinessActions,
  [],
  [],
  HappinessState & HappinessActions
> = (set, get) => ({
  // Initial state
  currentHappiness: new Decimal(75), // Start at 75% (Content)
  targetHappiness: new Decimal(75),
  factors: {
    taxRate: new Decimal(0),
    foodVariety: new Decimal(0),
    classBalance: new Decimal(0),
    housing: new Decimal(0),
    events: new Decimal(0),
  },
  status: HappinessStatus.Content,
  efficiency: {
    efficiency: new Decimal(1.0), // 100%
    status: HappinessStatus.Content,
    modifier: '正常效率',
  },

  // Calculate target happiness based on all factors
  calculateTargetHappiness: () => {
    const state = get() as any;

    // Base happiness: 50%
    let target = new Decimal(50);

    // Factor 1: Tax rate (negative impact)
    // 0% tax = +10 happiness, 50% tax = -40 happiness
    const taxRate = state.currentRate || new Decimal(0);
    const taxImpact = new Decimal(-100).times(taxRate).plus(10);
    target = target.plus(taxImpact);

    // Factor 2: Food variety (positive impact)
    // Diverse food sources = +10 happiness
    const resources = state.resources || {};
    const hasFood = (resources.food || new Decimal(0)).greaterThan(0);
    const hasMeat = (resources.meat || new Decimal(0)).greaterThan(0);
    const hasCuredMeat = (resources.curedMeat || new Decimal(0)).greaterThan(0);

    const foodVarietyScore = (hasFood ? 1 : 0) + (hasMeat ? 1 : 0) + (hasCuredMeat ? 1 : 0);
    const foodVarietyBonus = new Decimal(foodVarietyScore * 5); // +5 per food type
    target = target.plus(foodVarietyBonus);

    // Factor 3: Social class balance
    // Ideal: 60% peasants, 30% workers, 10% scholars
    const classes = state.socialClasses || {};
    const totalPop = state.settlers || new Decimal(1);

    const peasantRatio = (classes.peasants || new Decimal(0)).dividedBy(totalPop);
    const workerRatio = (classes.workers || new Decimal(0)).dividedBy(totalPop);
    const scholarRatio = (classes.scholars || new Decimal(0)).dividedBy(totalPop);

    // Calculate deviation from ideal (60%, 30%, 10%)
    const idealPeasantRatio = new Decimal(0.6);
    const idealWorkerRatio = new Decimal(0.3);
    const idealScholarRatio = new Decimal(0.1);

    const peasantDeviation = peasantRatio.minus(idealPeasantRatio).abs().times(10);
    const workerDeviation = workerRatio.minus(idealWorkerRatio).abs().times(10);
    const scholarDeviation = scholarRatio.minus(idealScholarRatio).abs().times(10);

    const totalDeviation = peasantDeviation.plus(workerDeviation).plus(scholarDeviation);
    const classBalancePenalty = Decimal.min(20, totalDeviation); // Max -20 penalty
    target = target.minus(classBalancePenalty);

    // Factor 4: Housing (overcrowding penalty)
    const maxPop = state.maxPopulation || new Decimal(10);
    const currentPop = state.settlers || new Decimal(5);

    if (currentPop.greaterThan(maxPop)) {
      const overcrowdingPenalty = currentPop.minus(maxPop).times(5); // -5 per overcapacity person
      target = target.minus(overcrowdingPenalty);
    } else {
      const housingBonus = maxPop.minus(currentPop).times(2); // +2 per spare capacity
      target = target.plus(Decimal.min(10, housingBonus)); // Max +10 bonus
    }

    // Factor 5: Temporary event modifiers
    const eventsModifier = state.factors?.events || new Decimal(0);
    target = target.plus(eventsModifier);

    // Clamp to 0-100 range
    target = Decimal.max(0, Decimal.min(100, target));

    // Update factors for UI display
    set({
      factors: {
        taxRate: taxImpact,
        foodVariety: foodVarietyBonus,
        classBalance: classBalancePenalty,
        housing: new Decimal(0), // Will be updated in housing check
        events: eventsModifier,
      },
    });

    return target;
  },

  // Update happiness (gradually move towards target)
  updateHappiness: () => {
    const state = get();
    const target = state.calculateTargetHappiness();

    // Gradual adjustment: move 5% towards target per tick
    const difference = target.minus(state.currentHappiness);
    const adjustment = difference.times(0.05); // 5% per tick

    let newHappiness = state.currentHappiness.plus(adjustment);
    newHappiness = Decimal.max(0, Decimal.min(100, newHappiness));

    // Determine status
    let status: HappinessStatus;
    let efficiency: ProductionEfficiency;

    if (newHappiness.greaterThanOrEqualTo(90)) {
      status = HappinessStatus.Ecstatic;
      efficiency = {
        efficiency: new Decimal(1.1), // 110%
        status: HappinessStatus.Ecstatic,
        modifier: '狂喜: +10% 产出',
      };
    } else if (newHappiness.greaterThanOrEqualTo(75)) {
      status = HappinessStatus.Happy;
      efficiency = {
        efficiency: new Decimal(1.05), // 105%
        status: HappinessStatus.Happy,
        modifier: '快乐: +5% 产出',
      };
    } else if (newHappiness.greaterThanOrEqualTo(50)) {
      status = HappinessStatus.Content;
      efficiency = {
        efficiency: new Decimal(1.0), // 100%
        status: HappinessStatus.Content,
        modifier: '满足: 正常效率',
      };
    } else if (newHappiness.greaterThanOrEqualTo(20)) {
      status = HappinessStatus.Unhappy;
      // Linear efficiency: 50% + (happiness / 2)
      // At 50%: 50 + 25 = 75%
      // At 20%: 50 + 10 = 60%
      const eff = new Decimal(0.5).plus(newHappiness.dividedBy(200));
      efficiency = {
        efficiency: eff,
        status: HappinessStatus.Unhappy,
        modifier: '不满: ' + eff.times(100).toFixed(0) + '% 效率',
      };
    } else {
      status = HappinessStatus.Rioting;
      efficiency = {
        efficiency: new Decimal(0), // 0%
        status: HappinessStatus.Rioting,
        modifier: '暴乱: 停止生产',
      };
    }

    set({
      currentHappiness: newHappiness,
      targetHappiness: target,
      status: status,
      efficiency: efficiency,
    });
  },

  // Get current production efficiency
  getProductionEfficiency: () => {
    return get().efficiency;
  },

  // Get current happiness status
  getHappinessStatus: () => {
    return get().status;
  },

  // Initialize happiness system (when Era 2 starts)
  initializeHappinessSystem: () => {
    set({
      currentHappiness: new Decimal(75),
      targetHappiness: new Decimal(75),
      factors: {
        taxRate: new Decimal(0),
        foodVariety: new Decimal(0),
        classBalance: new Decimal(0),
        housing: new Decimal(0),
        events: new Decimal(0),
      },
      status: HappinessStatus.Content,
      efficiency: {
        efficiency: new Decimal(1.0),
        status: HappinessStatus.Content,
        modifier: '正常效率',
      },
    });
  },
});
