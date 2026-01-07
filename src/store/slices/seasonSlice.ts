import { StateCreator } from 'zustand';
import Decimal from 'decimal.js';
import { SeasonSliceState, SeasonActions } from '../types';
import { Season } from '../../types/game';

const DAYS_PER_SEASON = 90; // Each season lasts 90 days
const SEASON_ORDER = [Season.Spring, Season.Summer, Season.Autumn, Season.Winter];

// Create the season slice
export const createSeasonSlice: StateCreator<
  SeasonSliceState & SeasonActions,
  [],
  [],
  SeasonSliceState & SeasonActions
> = (set, get) => ({
  // Initial state
  currentSeason: Season.Spring,
  seasonProgress: 0, // 0-100 percentage
  daysInSeason: 0,
  totalDays: 0,
  daysPerSeason: DAYS_PER_SEASON,

  // Advance to next season
  advanceSeason: () => {
    const currentIndex = SEASON_ORDER.indexOf(get().currentSeason);
    const nextSeason = SEASON_ORDER[(currentIndex + 1) % SEASON_ORDER.length];

    set(() => ({
      currentSeason: nextSeason,
      daysInSeason: 0,
      seasonProgress: 0,
    }));
  },

  // Update season progress based on delta time
  updateSeasonProgress: (deltaDays) => {
    set((state) => {
      const newDaysInSeason = state.daysInSeason + deltaDays;
      const newTotalDays = state.totalDays + deltaDays;

      // Check if season should advance
      if (newDaysInSeason >= state.daysPerSeason) {
        // Calculate overflow days
        const overflowDays = newDaysInSeason - state.daysPerSeason;
        const currentIndex = SEASON_ORDER.indexOf(state.currentSeason);
        const nextSeason = SEASON_ORDER[(currentIndex + 1) % SEASON_ORDER.length];

        // Move to next season and carry over overflow days
        return {
          currentSeason: nextSeason,
          daysInSeason: overflowDays,
          totalDays: newTotalDays,
          seasonProgress: (overflowDays / state.daysPerSeason) * 100,
        };
      }

      return {
        daysInSeason: newDaysInSeason,
        totalDays: newTotalDays,
        seasonProgress: (newDaysInSeason / state.daysPerSeason) * 100,
      };
    });
  },

  // Get production multipliers based on current season
  getSeasonMultiplier: () => {
    const season = get().currentSeason;

    switch (season) {
      case Season.Spring:
        return {
          food: new Decimal(2.0), // +100%
          wood: new Decimal(1.5), // +50%
          skin: new Decimal(1.0), // normal
          stone: new Decimal(1.0), // normal (not affected by seasons)
        };
      case Season.Summer:
        return {
          food: new Decimal(2.0), // +100%
          wood: new Decimal(2.0), // +100%
          skin: new Decimal(1.2), // +20%
          stone: new Decimal(1.0), // normal
        };
      case Season.Autumn:
        return {
          food: new Decimal(0.5), // +50% (normal production is 1.0)
          wood: new Decimal(0.5), // +50%
          skin: new Decimal(1.5), // +50% (hunting season)
          stone: new Decimal(1.0), // normal
        };
      case Season.Winter:
        return {
          food: new Decimal(0.1), // -90%
          wood: new Decimal(0.25), // +25% (harder to gather)
          skin: new Decimal(0.8), // -20% (animals are scarce)
          stone: new Decimal(0.5), // -50% (harder to gather in winter)
        };
      default:
        return {
          food: new Decimal(1.0),
          wood: new Decimal(1.0),
          skin: new Decimal(1.0),
          stone: new Decimal(1.0),
        };
    }
  },

  // Reset season to initial state
  resetSeason: () => {
    set({
      currentSeason: Season.Spring,
      seasonProgress: 0,
      daysInSeason: 0,
      totalDays: 0,
    });
  },
});
