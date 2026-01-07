import { memo } from 'react';
import { Play, Pause } from 'lucide-react';
import { useGameUI } from '../contexts/GameUIContext';
import { gameActions } from '../store/useGameStore';
import { cn } from '../utils/cn';

export const GameControls = memo(() => {
  const uiData = useGameUI();

  const isRunning = uiData.isPlaying;
  const isCurrentlyPaused = uiData.isPaused;

  const handleToggle = () => {
    if (!isRunning) {
      gameActions.startGame();
    } else {
      gameActions.toggleGame();
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleToggle}
        className={cn(
          'flex items-center gap-2 px-6 py-3 rounded-lg',
          'font-bold text-white transition-all shadow-sm',
          'active:scale-95',
          !isRunning ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'
        )}
      >
        {!isRunning ? (
          <>
            <Play className="w-5 h-5" />
            开始游戏
          </>
        ) : isCurrentlyPaused ? (
          <>
            <Play className="w-5 h-5" />
            继续
          </>
        ) : (
          <>
            <Pause className="w-5 h-5" />
            暂停
          </>
        )}
      </button>
    </div>
  );
});

GameControls.displayName = 'GameControls';
