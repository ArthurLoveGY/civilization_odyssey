import { StateCreator } from 'zustand';
import Decimal from 'decimal.js';
import { ResourceType } from '../../types/game';

export interface TaxState {
  currentRate: Decimal;
  minRate: Decimal;
  maxRate: Decimal;
  lastCollection: number;
  goldIncome: Decimal;
  totalGoldCollected: Decimal;
}

export interface TaxActions {
  setTaxRate: (rate: Decimal) => void;
  collectTax: () => void;
  calculateGoldIncome: () => Decimal;
  getTaxRate: () => Decimal;
  canAdjustTax: (newRate: Decimal) => boolean;
  initializeTaxSystem: () => void;
}

export const createTaxSlice: StateCreator<
  TaxState & TaxActions,
  [],
  [],
  TaxState & TaxActions
> = (set, get) => ({
  // Initial state
  currentRate: new Decimal(0.15), // Start at 15%
  minRate: new Decimal(0.05),     // 5% minimum
  maxRate: new Decimal(0.50),     // 50% maximum
  lastCollection: Date.now(),
  goldIncome: new Decimal(0),
  totalGoldCollected: new Decimal(0),

  // Set tax rate (clamped to min/max)
  setTaxRate: (rate: Decimal) => {
    set((state) => ({
      currentRate: Decimal.max(
        state.minRate,
        Decimal.min(state.maxRate, rate)
      ),
    }));
  },

  // Collect tax (called every tick in game loop)
  collectTax: () => {
    const state = get() as any;

    // Calculate tax base from social classes
    const taxBase = state.calculateTotalTaxBase ? state.calculateTotalTaxBase() : new Decimal(0);

    // Gold income = tax base * tax rate
    const goldIncome = taxBase.times(state.currentRate);

    // Add gold to resources
    if (state.addResource) {
      state.addResource(ResourceType.Gold, goldIncome);
    }

    // Update tax state
    set({
      lastCollection: Date.now(),
      goldIncome: goldIncome,
      totalGoldCollected: state.totalGoldCollected.plus(goldIncome),
    });
  },

  // Calculate projected gold income per tick
  calculateGoldIncome: () => {
    const state = get() as any;
    const taxBase = state.calculateTotalTaxBase ? state.calculateTotalTaxBase() : new Decimal(0);
    return taxBase.times(state.currentRate);
  },

  // Get current tax rate
  getTaxRate: () => {
    return get().currentRate;
  },

  // Check if tax rate can be adjusted
  canAdjustTax: (newRate: Decimal) => {
    const state = get();
    return newRate.greaterThanOrEqualTo(state.minRate) &&
           newRate.lessThanOrEqualTo(state.maxRate);
  },

  // Initialize tax system (when Era 2 starts)
  initializeTaxSystem: () => {
    set({
      currentRate: new Decimal(0.15), // Default 15%
      minRate: new Decimal(0.05),
      maxRate: new Decimal(0.50),
      lastCollection: Date.now(),
      goldIncome: new Decimal(0),
      totalGoldCollected: new Decimal(0),
    });
  },
});
