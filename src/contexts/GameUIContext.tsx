import { createContext, useContext, ReactNode, useRef, useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { ResourceType } from '../types/game';
import { formatResourceAmount } from '../utils/formatters';

// Game UI data interface
interface GameUIData {
  resources: {
    food: string;
    wood: string;
    skin: string;
    settlers: string;
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
    return {
      resources: {
        food: formatResourceAmount(state.resources[ResourceType.Food], ResourceType.Food),
        wood: formatResourceAmount(state.resources[ResourceType.Wood], ResourceType.Wood),
        skin: formatResourceAmount(state.resources[ResourceType.Skin], ResourceType.Skin),
        settlers: formatResourceAmount(state.resources[ResourceType.Settlers], ResourceType.Settlers),
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
      const newResources = {
        food: formatResourceAmount(state.resources[ResourceType.Food], ResourceType.Food),
        wood: formatResourceAmount(state.resources[ResourceType.Wood], ResourceType.Wood),
        skin: formatResourceAmount(state.resources[ResourceType.Skin], ResourceType.Skin),
        settlers: formatResourceAmount(state.resources[ResourceType.Settlers], ResourceType.Settlers),
      };

      const newSeason = {
        current: state.currentSeason,
        progress: Math.floor(state.seasonProgress),
        days: Math.floor(state.daysInSeason),
      };

      // Only update if values actually changed (prevent unnecessary renders)
      setUiData((prev) => {
        if (
          prev.resources.food === newResources.food &&
          prev.resources.wood === newResources.wood &&
          prev.resources.skin === newResources.skin &&
          prev.resources.settlers === newResources.settlers &&
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
          resources: newResources,
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
