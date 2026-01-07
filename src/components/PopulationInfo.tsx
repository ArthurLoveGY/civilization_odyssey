import { memo, useState, useEffect } from 'react';
import { gameActions, useGameStore } from '../store/useGameStore';
import { cn } from '../utils/cn';
import Decimal from 'decimal.js';

export const PopulationInfo = memo(() => {
  const [settlers, setSettlers] = useState<Decimal>(new Decimal(5));
  const [maxPopulation, setMaxPopulation] = useState<Decimal>(new Decimal(5));
  const [growthProgress, setGrowthProgress] = useState<Decimal>(new Decimal(0));

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const state = useGameStore.getState();
        const currentSettlers = state.settlers || new Decimal(5);
        const currentMaxPop = gameActions.getMaxPopulation ? gameActions.getMaxPopulation() : new Decimal(5);
        const currentProgress = state.growthProgress || new Decimal(0);

        setSettlers(currentSettlers);
        setMaxPopulation(currentMaxPop);
        setGrowthProgress(currentProgress);
      } catch (e) {
        // Ignore
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const percentage = settlers.dividedBy(maxPopulation).times(100).toNumber();
  const atCap = settlers.greaterThanOrEqualTo(maxPopulation);
  const canGrow = gameActions.canGrowPopulation ? gameActions.canGrowPopulation() : false;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 shadow-sm">
      <h3 className="font-bold mb-3 text-gray-900 dark:text-gray-100">人口状况</h3>

      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          当前人口
        </span>
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {settlers.toFixed(0)} / {maxPopulation.toFixed(0)}
        </span>
      </div>

      {/* Population cap progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1">
        <div
          className={cn(
            'h-2.5 rounded-full transition-colors',
            atCap ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {atCap && (
        <div className="text-xs text-red-500 mt-1">
          已达上限，需要建造更多帐篷
        </div>
      )}

      {/* Growth progress (if can grow) */}
      {canGrow && !atCap && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-600 dark:text-gray-400">增长进度</span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {growthProgress.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full"
              style={{ width: `${Math.min(growthProgress.toNumber(), 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            每 10 天增长 1 人口
          </div>
        </div>
      )}
    </div>
  );
});

PopulationInfo.displayName = 'PopulationInfo';
