import { StateCreator } from 'zustand';
import Decimal from 'decimal.js';
import { BonfireState, BonfireStatus } from '../../types/game';
import { Season } from '../../types/game';
import { useGameStore } from '../useGameStore';

const BONFIRE_BASE_CONSUMPTION = new Decimal(0.1);  // Per tick (1.0 wood/second at 10 TPS)
const BONFIRE_WINTER_MULTIPLIER = new Decimal(2.0);
const BONFIRE_LOW_FUEL_THRESHOLD = new Decimal(30);  // 30 out of 100 max fuel
const BONFIRE_MAX_FUEL = new Decimal(100);

// Create the bonfire slice
export const createBonfireSlice: StateCreator<
  BonfireSliceState & BonfireActions,
  [],
  [],
  BonfireSliceState & BonfireActions
> = (set, get) => ({
  // Initial state
  bonfire: {
    isLit: true,
    fuel: new Decimal(50),  // Start with half fuel
    maxFuel: BONFIRE_MAX_FUEL,
    consumptionRate: BONFIRE_BASE_CONSUMPTION,
    autoRefuel: false,
  },

  // Add fuel manually
  addFuel: (amount: Decimal) => {
    set((state) => {
      const currentFuel = state.bonfire.fuel;
      const maxFuel = state.bonfire.maxFuel;
      const newFuel = Decimal.min(maxFuel, currentFuel.plus(amount));
      const isNowLit = newFuel.greaterThan(0);

      return {
        bonfire: {
          ...state.bonfire,
          fuel: newFuel,
          isLit: isNowLit,
        },
      };
    });
  },

  // Consume fuel each tick (called from game loop)
  consumeFuel: (season: Season) => {
    set((state) => {
      const currentFuel = state.bonfire.fuel;

      // If already extinguished, stay extinguished
      if (currentFuel.equals(0)) {
        return {
          bonfire: {
            ...state.bonfire,
            isLit: false,
          },
        };
      }

      // Get temporary multiplier from event system (e.g., storm debuff)
      const fullState = useGameStore.getState();
      const temporaryMultiplier = fullState.getBonfireConsumptionMultiplier ? fullState.getBonfireConsumptionMultiplier() : 1.0;

      // Calculate base consumption (winter = 2x)
      const baseConsumption = season === Season.Winter
        ? state.bonfire.consumptionRate.times(BONFIRE_WINTER_MULTIPLIER)
        : state.bonfire.consumptionRate;

      // Apply temporary multiplier from events
      const consumptionRate = baseConsumption.times(temporaryMultiplier);

      const newFuel = Decimal.max(0, currentFuel.minus(consumptionRate));
      const isNowExtinguished = newFuel.equals(0);

      return {
        bonfire: {
          ...state.bonfire,
          fuel: newFuel,
          isLit: !isNowExtinguished,
        },
      };
    });
  },

  // Get current bonfire status
  getBonfireStatus: () => {
    const fuel = get().bonfire.fuel;

    if (fuel.equals(0)) {
      return BonfireStatus.Extinguished;
    } else if (fuel.lessThanOrEqualTo(BONFIRE_LOW_FUEL_THRESHOLD)) {
      return BonfireStatus.LowFuel;
    } else {
      return BonfireStatus.Burning;
    }
  },

  // Toggle auto-refuel mode
  setAutoRefuel: (enabled: boolean) => {
    set((state) => ({
      bonfire: {
        ...state.bonfire,
        autoRefuel: enabled,
      },
    }));
  },

  // Relight bonfire (costs wood)
  relightBonfire: () => {
    set((state) => {
      // Only relight if extinguished
      if (state.bonfire.fuel.greaterThan(0)) {
        return state;  // Already lit
      }

      return {
        bonfire: {
          ...state.bonfire,
          fuel: new Decimal(10),  // Start with small amount
          isLit: true,
        },
      };
    });
  },
});

// Type exports
export interface BonfireSliceState {
  bonfire: BonfireState;
}

export interface BonfireActions {
  addFuel: (amount: Decimal) => void;
  consumeFuel: (season: Season) => void;
  getBonfireStatus: () => BonfireStatus;
  setAutoRefuel: (enabled: boolean) => void;
  relightBonfire: () => void;
}
