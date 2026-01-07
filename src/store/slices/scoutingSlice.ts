import { StateCreator } from 'zustand';
import Decimal from 'decimal.js';
import { ScoutingEvent, ScoutingResult, ResourceType } from '../../types/game';

const SCOUTING_COOLDOWN = 5000; // 5 seconds

// Create the scouting slice
export const createScoutingSlice: StateCreator<
  ScoutingSliceState & ScoutingActions,
  [],
  [],
  ScoutingSliceState & ScoutingActions
> = (set, get) => ({
  // Initial state
  isScouting: false,
  lastScoutTime: 0,

  // Check if scouting is available (has cooldown elapsed)
  canScout: () => {
    const state = get();
    const now = Date.now();
    const timeSinceLastScout = now - state.lastScoutTime;

    return timeSinceLastScout >= SCOUTING_COOLDOWN;
  },

  // Send scout and get result
  sendScout: () => {
    // Update last scout time
    set({
      lastScoutTime: Date.now(),
      isScouting: true,
    });

    // RNG roll
    const roll = Math.random();
    let result: ScoutingEvent;

    if (roll < 0.6) {
      // 60%: Nothing found
      result = { result: ScoutingResult.Nothing };
    } else if (roll < 0.9) {
      // 30%: Found resources
      const resourceType = Math.random() < 0.5
        ? ResourceType.Wood
        : ResourceType.Stone;
      const amount = new Decimal(5 + Math.random() * 10);  // 5-15 resources

      result = {
        result: ScoutingResult.Resources,
        resources: {
          [resourceType]: amount,
        },
      };
    } else {
      // 10%: Found survivor
      result = {
        result: ScoutingResult.Survivor,
        survivor: true,
      };
    }

    // Reset scouting flag
    set({ isScouting: false });

    return result;
  },
});

// Type exports
export interface ScoutingSliceState {
  isScouting: boolean;
  lastScoutTime: number;
}

export interface ScoutingActions {
  canScout: () => boolean;
  sendScout: () => ScoutingEvent;
}
