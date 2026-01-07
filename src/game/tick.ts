import Decimal from 'decimal.js';
import { useGameStore } from '../store/useGameStore';
import { Season, ResourceType, BonfireStatus } from '../types/game';
import { getSeasonalMessage, getStarvationMessage, getFreezingMessage } from '../store/slices/logSlice';

// Base resource generation per tick (without multipliers)
const BASE_FOOD_GENERATION = new Decimal(0.5); // 0.5 food per tick
const BASE_WOOD_GENERATION = new Decimal(0.3); // 0.3 wood per tick
const BASE_SKIN_GENERATION = new Decimal(0.1); // 0.1 skin per tick

// Knowledge generation per idle settler per tick
const IDEAS_PER_IDLE_SETTLER = new Decimal(0.002); // 0.02 ideas/sec = 0.002/tick at 10 TPS

// Days that pass per tick (1 tick = 0.1 day at 10 TPS)
const DAYS_PER_TICK = 0.1;

// Population growth interval (100 ticks = 10 days)
const POPULATION_GROWTH_INTERVAL = new Decimal(100);

let previousSeason: Season = Season.Spring;
let settlersBeforeTick: Decimal = new Decimal(0);
let wasBonfireExtinguished: boolean = false;

// Main game tick function
export const gameTick = () => {
  const state = useGameStore.getState();

  // Track state before tick
  settlersBeforeTick = state.settlers;
  previousSeason = state.currentSeason;
  const bonfireStatusBeforeTick = state.getBonfireStatus();
  wasBonfireExtinguished = bonfireStatusBeforeTick === BonfireStatus.Extinguished;

  // 1. Update season progress
  state.updateSeasonProgress(DAYS_PER_TICK);

  // Check if season changed
  if (state.currentSeason !== previousSeason) {
    state.advanceSeason();
    state.addLog(`季节更替：${getSeasonalMessage(state.currentSeason)}`, 'info');
  }

  // 2. Check bonfire status and apply penalties
  const bonfireStatus = state.getBonfireStatus();
  const bonfirePenaltyActive = bonfireStatus === BonfireStatus.Extinguished;

  // Log warning if bonfire just extinguished
  if (bonfirePenaltyActive && !wasBonfireExtinguished) {
    state.addLog('篝火已熄灭！族人们陷入恐慌，工作效率大幅下降。', 'danger');
  } else if (bonfireStatus === BonfireStatus.LowFuel && !wasBonfireExtinguished) {
    // Randomly log low fuel warning occasionally (10% chance per tick when low)
    if (Math.random() < 0.1) {
      state.addLog('篝火即将熄灭，需要更多木材！', 'warning');
    }
  }

  // 3. Consume bonfire fuel
  state.consumeFuel(state.currentSeason);

  // 3.5. Auto-refuel bonfire if enabled and fuel is low
  const bonfire = (state as any).bonfire;
  if (bonfire && bonfire.autoRefuel) {
    const BONFIRE_LOW_FUEL_THRESHOLD = new Decimal(30);  // 30% threshold
    const currentFuel = bonfire.fuel || new Decimal(0);

    // Auto-refuel when fuel is at or below 30
    if (currentFuel.lessThanOrEqualTo(BONFIRE_LOW_FUEL_THRESHOLD)) {
      const woodAmount = state.resources[ResourceType.Wood] || new Decimal(0);
      const refuelAmount = new Decimal(5);  // Add 5 wood at a time

      // Check if we have enough wood
      if (woodAmount.greaterThanOrEqualTo(refuelAmount)) {
        // Only refuel if not already at max capacity
        const maxFuel = bonfire.maxFuel || new Decimal(100);
        if (currentFuel.lessThan(maxFuel)) {
          state.removeResource(ResourceType.Wood, refuelAmount);
          state.addFuel(refuelAmount);
        }
      }
    }
  }

  // 4. Generate resources (stopped if bonfire extinguished)
  if (!bonfirePenaltyActive) {
    // 4.1 Auto-generate resources from jobs
    const foodProduction = state.calculateJobProduction ? state.calculateJobProduction(ResourceType.Food) : new Decimal(0);
    const woodProduction = state.calculateJobProduction ? state.calculateJobProduction(ResourceType.Wood) : new Decimal(0);
    const stoneProduction = state.calculateJobProduction ? state.calculateJobProduction(ResourceType.Stone) : new Decimal(0);

    // Add job-produced resources (storage cap enforced in addResource)
    if (foodProduction.greaterThan(0)) {
      state.addResource(ResourceType.Food, foodProduction);
    }
    if (woodProduction.greaterThan(0)) {
      state.addResource(ResourceType.Wood, woodProduction);
    }
    if (stoneProduction.greaterThan(0)) {
      state.addResource(ResourceType.Stone, stoneProduction);
    }

    // 4.2 Generate passive resources (nature production, not from jobs)
    const multipliers = state.getSeasonMultiplier();

    // Calculate production with multipliers
    const passiveFoodProduction = BASE_FOOD_GENERATION.times(multipliers.food);
    const passiveWoodProduction = BASE_WOOD_GENERATION.times(multipliers.wood);
    const passiveSkinProduction = BASE_SKIN_GENERATION.times(multipliers.skin);

    // Add passive generated resources (storage cap enforced in addResource)
    state.addResource(ResourceType.Food, passiveFoodProduction);
    state.addResource(ResourceType.Wood, passiveWoodProduction);
    state.addResource(ResourceType.Skin, passiveSkinProduction);
  } else {
    // Bonfire extinguished - 90% penalty to all production
    // Even passive production is reduced because people are struggling to survive

    // 4.1 Job production at 10%
    const foodProduction = state.calculateJobProduction ? state.calculateJobProduction(ResourceType.Food) : new Decimal(0);
    const woodProduction = state.calculateJobProduction ? state.calculateJobProduction(ResourceType.Wood) : new Decimal(0);
    const stoneProduction = state.calculateJobProduction ? state.calculateJobProduction(ResourceType.Stone) : new Decimal(0);

    if (foodProduction.greaterThan(0)) {
      state.addResource(ResourceType.Food, foodProduction.times(new Decimal(0.1)));
    }
    if (woodProduction.greaterThan(0)) {
      state.addResource(ResourceType.Wood, woodProduction.times(new Decimal(0.1)));
    }
    if (stoneProduction.greaterThan(0)) {
      state.addResource(ResourceType.Stone, stoneProduction.times(new Decimal(0.1)));
    }

    // 4.2 Passive production at 10%
    const multipliers = state.getSeasonMultiplier();
    const passiveFoodProduction = BASE_FOOD_GENERATION.times(multipliers.food).times(new Decimal(0.1));
    const passiveWoodProduction = BASE_WOOD_GENERATION.times(multipliers.wood).times(new Decimal(0.1));
    const passiveSkinProduction = BASE_SKIN_GENERATION.times(multipliers.skin).times(new Decimal(0.1));

    state.addResource(ResourceType.Food, passiveFoodProduction);
    state.addResource(ResourceType.Wood, passiveWoodProduction);
    state.addResource(ResourceType.Skin, passiveSkinProduction);
  }

  // 4.3 Generate ideas from idle population (thinkers)
  const idlePop = state.getIdlePopulation ? state.getIdlePopulation() : new Decimal(0);
  if (idlePop.greaterThan(0)) {
    let ideasProduction = idlePop.times(IDEAS_PER_IDLE_SETTLER);

    // Apply 50% penalty if bonfire extinguished or starving
    if (bonfirePenaltyActive) {
      ideasProduction = ideasProduction.times(new Decimal(0.5));
    }

    // Check if starving (food = 0)
    const currentFood = state.getResource(ResourceType.Food);
    if (currentFood.equals(0)) {
      ideasProduction = ideasProduction.times(new Decimal(0.5)); // Additional 50% penalty
      if (bonfirePenaltyActive) {
        ideasProduction = ideasProduction.times(new Decimal(0.5)); // Stack to 25%
      }
    }

    if (ideasProduction.greaterThan(0)) {
      // Directly update ideas state to ensure it works
      useGameStore.setState((prevState) => ({
        ideas: (prevState.ideas || new Decimal(0)).plus(ideasProduction),
      }));
    }
  }

  // 4.4 Snare Traps - Random production and decay
  const trapCount = state.getBuildingCount ? state.getBuildingCount('snareTrap' as any) : new Decimal(0);
  if (trapCount.greaterThan(0)) {
    // Each trap has a chance to produce resources each tick
    // Base rate: 10% chance per tick per trap = 1 resource/sec (at 10 TPS)
    const TRAP_SUCCESS_RATE = 0.001; // Per trap per tick
    const TRAP_DECAY_RATE = 0.01; // 1% chance per tick

    // Check each trap for production
    const trapRoll = Math.random();
    const expectedSuccesses = trapCount.times(TRAP_SUCCESS_RATE).toNumber();
    const actualSuccesses = Math.floor(trapRoll < expectedSuccesses ? expectedSuccesses : 0);

    if (actualSuccesses > 0) {
      // Each successful trap produces: 1 meat + 30% chance of 1 skin
      for (let i = 0; i < actualSuccesses; i++) {
        state.addResource(ResourceType.Meat, new Decimal(1));

        // 30% chance for skin
        if (Math.random() < 0.3) {
          state.addResource(ResourceType.Skin, new Decimal(1));
        }
      }
    }

    // Check for trap decay (1% chance per trap per tick)
    const decayRoll = Math.random();
    const expectedDecays = trapCount.times(TRAP_DECAY_RATE).toNumber();

    if (decayRoll < expectedDecays) {
      // A trap broke!
      const buildings = (state as any).buildings;
      if (buildings && buildings.snareTrap) {
        const currentCount = buildings.snareTrap.count;
        if (currentCount.greaterThan(0)) {
          buildings.snareTrap.count = currentCount.minus(1);
          state.addLog('一个陷阱损坏了。', 'info'); // Gray message
        }
      }
    }
  }

  // 4.5 Drying Racks - Convert meat → cured meat
  const rackCount = state.getBuildingCount ? state.getBuildingCount('dryingRack' as any) : new Decimal(0);
  if (rackCount.greaterThan(0)) {
    const currentMeat = state.getResource(ResourceType.Meat);

    if (currentMeat.greaterThan(0)) {
      // Each rack can process 0.1 meat per tick = 1 meat/sec (at 10 TPS)
      const processingRate = rackCount.times(new Decimal(0.1));
      const actualProcessing = Decimal.min(currentMeat, processingRate);

      if (actualProcessing.greaterThan(0)) {
        state.removeResource(ResourceType.Meat, actualProcessing);
        state.addResource(ResourceType.CuredMeat, actualProcessing);
      }
    }
  }

  // 5. Population consumes food (dynamic calculation based on season and warmth)
  // Uses the Golden Ratio model: 1.0 food/sec per person, modified by season and warmth
  // Multi-resource system: Food (1x), Meat (1x), CuredMeat (5x)
  const totalFoodConsumption = state.calculateFoodConsumption ? state.calculateFoodConsumption() : new Decimal(0);

  // Track remaining consumption needed
  let remainingConsumption = totalFoodConsumption;

  // First, consume from Food (cheapest, save valuable CuredMeat)
  const currentFood = state.getResource(ResourceType.Food);
  if (remainingConsumption.greaterThan(0) && currentFood.greaterThan(0)) {
    const consumeAmount = Decimal.min(currentFood, remainingConsumption);
    state.removeResource(ResourceType.Food, consumeAmount);
    remainingConsumption = remainingConsumption.minus(consumeAmount);
  }

  // Second, consume from Meat (same value as Food, but limited storage)
  if (remainingConsumption.greaterThan(0)) {
    const currentMeat = state.getResource(ResourceType.Meat);
    if (currentMeat.greaterThan(0)) {
      const consumeAmount = Decimal.min(currentMeat, remainingConsumption);
      state.removeResource(ResourceType.Meat, consumeAmount);
      remainingConsumption = remainingConsumption.minus(consumeAmount);
    }
  }

  // Third, consume from CuredMeat (5x value - emergency ration!)
  if (remainingConsumption.greaterThan(0)) {
    const currentCuredMeat = state.getResource(ResourceType.CuredMeat);
    if (currentCuredMeat.greaterThan(0)) {
      // Each unit of CuredMeat provides 5 food points
      const curedMeatNeeded = remainingConsumption.dividedBy(5).ceil();
      const consumeAmount = Decimal.min(currentCuredMeat, curedMeatNeeded);

      // Only consume what we need
      if (consumeAmount.greaterThan(0)) {
        const actualConsumption = consumeAmount.times(5);  // Convert back to food points
        state.removeResource(ResourceType.CuredMeat, consumeAmount);
        remainingConsumption = remainingConsumption.minus(actualConsumption);

        // Cap at 0 (avoid negative due to ceiling)
        if (remainingConsumption.lessThan(0)) {
          remainingConsumption = new Decimal(0);
        }
      }
    }
  }

  // 6. Check for starvation
  // Starvation occurs when ALL food sources are empty
  const totalFoodPoints = state.getResource(ResourceType.Food)
    .plus(state.getResource(ResourceType.Meat))
    .plus(state.getResource(ResourceType.CuredMeat).times(5));  // CuredMeat counts 5x

  settlersBeforeTick = state.settlers; // Update before starvation check
  state.checkStarvation();

  // If starvation occurred
  if (totalFoodPoints.lte(0) && state.settlers.lessThan(settlersBeforeTick)) {
    const deaths = settlersBeforeTick.minus(state.settlers);
    state.addLog(`${getStarvationMessage()} 损失了 ${deaths.toFixed(0)} 名族人。`, 'danger');
  } else if (totalFoodPoints.lte(0) && state.settlers.equals(settlersBeforeTick)) {
    // Food ran out but nobody died yet (grace period)
    state.addLog('食物已经耗尽！族人们正在忍受饥饿...', 'warning');
  }

  // 8. Check for freezing (winter only)
  if (state.currentSeason === Season.Winter) {
    const woodBeforeCheck = state.getResource(ResourceType.Wood);
    settlersBeforeTick = state.settlers; // Update before freeze check

    state.checkFreezing();

    const woodAfterCheck = state.getResource(ResourceType.Wood);

    // If freezing occurred
    if (woodBeforeCheck.lte(0) && state.settlers.lessThan(settlersBeforeTick)) {
      const deaths = settlersBeforeTick.minus(state.settlers);
      state.addLog(`${getFreezingMessage()} 损失了 ${deaths.toFixed(0)} 名族人。`, 'danger');
    } else if (woodAfterCheck.lte(0) && state.settlers.equals(settlersBeforeTick)) {
      // Wood ran out but nobody froze yet
      state.addLog('木材已经耗尽！族人们在严寒中瑟瑟发抖...', 'warning');
    }
  }

  // 9. Check population growth progress
  if (state.canGrowPopulation()) {
    state.updateGrowthProgress(new Decimal(1));

    // Check if growth threshold reached
    if (state.growthProgress.greaterThanOrEqualTo(POPULATION_GROWTH_INTERVAL)) {
      const maxPop = state.getMaxPopulation();

      // Only grow if below max population
      if (state.settlers.lessThan(maxPop)) {
        state.addSettlers(new Decimal(1));
        state.updateGrowthProgress(new Decimal(0)); // Reset progress

        // Add growth message
        const growthMessages = [
          '一对新生儿降生，部落充满了希望。',
          '部落迎来了新的生命。',
        ];
        state.addLog(growthMessages[Math.floor(Math.random() * growthMessages.length)], 'success');
      } else {
        // At max population
        state.updateGrowthProgress(new Decimal(0));
        if (Math.random() < 0.01) { // Occasionally remind player
          state.addLog('人口已达上限，需要建造更多帐篷。', 'warning');
        }
      }
    }
  } else {
    // Conditions not met, reset growth progress
    state.updateGrowthProgress(new Decimal(0));
  }

  // Storage caps are automatically enforced in addResource()
  // Overflow resources are simply lost (cruel mode!)
};
