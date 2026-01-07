import { createContext, useContext, ReactNode, useRef, useState, useEffect } from 'react';
import { useGameStore, gameActions } from '../store/useGameStore';
import { ResourceType } from '../types/game';
import { formatResourceAmount } from '../utils/formatters';
import Decimal from 'decimal.js';

// Game UI data interface
interface GameUIData {
  // Decimal values for comparison (prevent false negatives)
  resourcesDecimal: {
    food: Decimal;
    wood: Decimal;
    skin: Decimal;
    stone: Decimal;
    meat: Decimal;
    curedMeat: Decimal;
    ideas: Decimal;
    settlers: Decimal;
  };
  // Formatted strings for display
  resources: {
    food: string;
    wood: string;
    skin: string;
    stone: string;
    meat: string;
    curedMeat: string;
    ideas: string;
    settlers: string;
  };
  storageCaps: {
    food: string;
    wood: string;
    skin: string;
    stone: string;
    meat: string;
    curedMeat: string;
  };
  season: {
    current: string;
    progress: number;
    days: number;
  };
  logs: number;
  isPlaying: boolean;
  isPaused: boolean;
}

const GameUIContext = createContext<GameUIData | null>(null);

export const useGameUI = () => {
  const context = useContext(GameUIContext);
  if (!context) {
    throw new Error('useGameUI must be used within GameUIProvider');
  }
  return context;
};

interface GameUIProviderProps {
  children: ReactNode;
  updateInterval?: number;
}

export const GameUIProvider = ({ children, updateInterval = 200 }: GameUIProviderProps) => {
  const [uiData, setUiData] = useState<GameUIData>(() => {
    const state = useGameStore.getState();
    const foodDecimal = state.resources[ResourceType.Food] || new Decimal(0);
    const woodDecimal = state.resources[ResourceType.Wood] || new Decimal(0);
    const skinDecimal = state.resources[ResourceType.Skin] || new Decimal(0);
    const stoneDecimal = state.resources[ResourceType.Stone] || new Decimal(0);
    const meatDecimal = state.resources[ResourceType.Meat] || new Decimal(0);
    const curedMeatDecimal = state.resources[ResourceType.CuredMeat] || new Decimal(0);
    const ideasDecimal = state.ideas || new Decimal(0);
    const settlersDecimal = state.resources[ResourceType.Settlers] || new Decimal(0);

    return {
      resourcesDecimal: {
        food: foodDecimal,
        wood: woodDecimal,
        skin: skinDecimal,
        stone: stoneDecimal,
        meat: meatDecimal,
        curedMeat: curedMeatDecimal,
        ideas: ideasDecimal,
        settlers: settlersDecimal,
      },
      resources: {
        food: formatResourceAmount(foodDecimal, ResourceType.Food),
        wood: formatResourceAmount(woodDecimal, ResourceType.Wood),
        skin: formatResourceAmount(skinDecimal, ResourceType.Skin),
        stone: formatResourceAmount(stoneDecimal, ResourceType.Stone),
        meat: formatResourceAmount(meatDecimal, ResourceType.Meat),
        curedMeat: formatResourceAmount(curedMeatDecimal, ResourceType.CuredMeat),
        ideas: formatResourceAmount(ideasDecimal, ResourceType.Ideas),
        settlers: formatResourceAmount(settlersDecimal, ResourceType.Settlers),
      },
      storageCaps: {
        food: gameActions.getStorageCap ? gameActions.getStorageCap(ResourceType.Food).toFixed(0) : '100',
        wood: gameActions.getStorageCap ? gameActions.getStorageCap(ResourceType.Wood).toFixed(0) : '100',
        skin: gameActions.getStorageCap ? gameActions.getStorageCap(ResourceType.Skin).toFixed(0) : '50',
        stone: gameActions.getStorageCap ? gameActions.getStorageCap(ResourceType.Stone).toFixed(0) : '50',
        meat: gameActions.getStorageCap ? gameActions.getStorageCap(ResourceType.Meat).toFixed(0) : '30',
        curedMeat: gameActions.getStorageCap ? gameActions.getStorageCap(ResourceType.CuredMeat).toFixed(0) : '100',
      },
      season: {
        current: state.currentSeason,
        progress: Math.floor(state.seasonProgress),
        days: Math.floor(state.daysInSeason),
      },
      logs: state.logs.length,
      isPlaying: state.isPlaying,
      isPaused: state.isPaused,
    };
  });

  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const interval = setInterval(() => {
      if (!isMountedRef.current) return;

      const state = useGameStore.getState();
      const foodDecimal = state.resources[ResourceType.Food] || new Decimal(0);
      const woodDecimal = state.resources[ResourceType.Wood] || new Decimal(0);
      const skinDecimal = state.resources[ResourceType.Skin] || new Decimal(0);
      const stoneDecimal = state.resources[ResourceType.Stone] || new Decimal(0);
      const meatDecimal = state.resources[ResourceType.Meat] || new Decimal(0);
      const curedMeatDecimal = state.resources[ResourceType.CuredMeat] || new Decimal(0);
      const ideasDecimal = state.ideas || new Decimal(0);
      const settlersDecimal = state.resources[ResourceType.Settlers] || new Decimal(0);

      const newResourcesDecimal = {
        food: foodDecimal,
        wood: woodDecimal,
        skin: skinDecimal,
        stone: stoneDecimal,
        meat: meatDecimal,
        curedMeat: curedMeatDecimal,
        ideas: ideasDecimal,
        settlers: settlersDecimal,
      };

      const newResources = {
        food: formatResourceAmount(foodDecimal, ResourceType.Food),
        wood: formatResourceAmount(woodDecimal, ResourceType.Wood),
        skin: formatResourceAmount(skinDecimal, ResourceType.Skin),
        stone: formatResourceAmount(stoneDecimal, ResourceType.Stone),
        meat: formatResourceAmount(meatDecimal, ResourceType.Meat),
        curedMeat: formatResourceAmount(curedMeatDecimal, ResourceType.CuredMeat),
        ideas: formatResourceAmount(ideasDecimal, ResourceType.Ideas),
        settlers: formatResourceAmount(settlersDecimal, ResourceType.Settlers),
      };

      const newStorageCaps = {
        food: gameActions.getStorageCap ? gameActions.getStorageCap(ResourceType.Food).toFixed(0) : '100',
        wood: gameActions.getStorageCap ? gameActions.getStorageCap(ResourceType.Wood).toFixed(0) : '100',
        skin: gameActions.getStorageCap ? gameActions.getStorageCap(ResourceType.Skin).toFixed(0) : '50',
        stone: gameActions.getStorageCap ? gameActions.getStorageCap(ResourceType.Stone).toFixed(0) : '50',
        meat: gameActions.getStorageCap ? gameActions.getStorageCap(ResourceType.Meat).toFixed(0) : '30',
        curedMeat: gameActions.getStorageCap ? gameActions.getStorageCap(ResourceType.CuredMeat).toFixed(0) : '100',
      };

      const newSeason = {
        current: state.currentSeason,
        progress: Math.floor(state.seasonProgress),
        days: Math.floor(state.daysInSeason),
      };

      // Only update if values actually changed (prevent unnecessary renders)
      setUiData((prev) => {
        // Compare Decimal values instead of formatted strings to prevent false negatives
        if (
          prev.resourcesDecimal.food.equals(newResourcesDecimal.food) &&
          prev.resourcesDecimal.wood.equals(newResourcesDecimal.wood) &&
          prev.resourcesDecimal.skin.equals(newResourcesDecimal.skin) &&
          prev.resourcesDecimal.stone.equals(newResourcesDecimal.stone) &&
          prev.resourcesDecimal.meat.equals(newResourcesDecimal.meat) &&
          prev.resourcesDecimal.curedMeat.equals(newResourcesDecimal.curedMeat) &&
          prev.resourcesDecimal.ideas.equals(newResourcesDecimal.ideas) &&
          prev.resourcesDecimal.settlers.equals(newResourcesDecimal.settlers) &&
          prev.storageCaps.food === newStorageCaps.food &&
          prev.storageCaps.wood === newStorageCaps.wood &&
          prev.storageCaps.skin === newStorageCaps.skin &&
          prev.storageCaps.stone === newStorageCaps.stone &&
          prev.storageCaps.meat === newStorageCaps.meat &&
          prev.storageCaps.curedMeat === newStorageCaps.curedMeat &&
          prev.season.current === newSeason.current &&
          prev.season.progress === newSeason.progress &&
          prev.season.days === newSeason.days &&
          prev.logs === state.logs.length &&
          prev.isPlaying === state.isPlaying &&
          prev.isPaused === state.isPaused
        ) {
          return prev;
        }

        return {
          resourcesDecimal: newResourcesDecimal,
          resources: newResources,
          storageCaps: newStorageCaps,
          season: newSeason,
          logs: state.logs.length,
          isPlaying: state.isPlaying,
          isPaused: state.isPaused,
        };
      });
    }, updateInterval);

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, [updateInterval]);

  return (
    <GameUIContext.Provider value={uiData}>
      {children}
    </GameUIContext.Provider>
  );
};
