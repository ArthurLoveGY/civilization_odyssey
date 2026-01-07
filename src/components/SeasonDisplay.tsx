import { memo } from 'react';
import { useGameUI } from '../contexts/GameUIContext';
import { getSeasonColor, getSeasonEmoji, formatSeasonDay, formatProgress } from '../utils/formatters';
import { cn } from '../utils/cn';

export const SeasonDisplay = memo(() => {
  const uiData = useGameUI();
  const season = uiData.season.current as any;
  const progress = uiData.season.progress;
  const days = uiData.season.days;

  const seasonColor = getSeasonColor(season);
  const seasonEmoji = getSeasonEmoji(season);
  const seasonText = formatSeasonDay(days, season);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{seasonEmoji}</span>
          <div>
            <div className={cn('text-2xl font-bold', seasonColor)}>{seasonText}</div>
            <div className="text-sm text-gray-600 dark:text-gray-500">季节进度</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{formatProgress(progress)}</div>
          <div className="text-xs text-gray-600 dark:text-gray-500">完成度</div>
        </div>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out',
            'bg-gradient-to-r',
            season === 'spring' && 'from-green-600 to-green-400',
            season === 'summer' && 'from-yellow-600 to-yellow-400',
            season === 'autumn' && 'from-orange-600 to-orange-400',
            season === 'winter' && 'from-blue-600 to-blue-400'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
});

SeasonDisplay.displayName = 'SeasonDisplay';
