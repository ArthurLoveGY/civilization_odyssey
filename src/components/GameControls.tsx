import { memo } from 'react';
import { Play, Pause } from 'lucide-react';
import { useGameUI } from '../contexts/GameUIContext';
import { gameActions } from '../store/useGameStore';
import { Button } from './ui/button';
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
      <Button
        onClick={handleToggle}
        size="lg"
        className={cn(
          'font-bold',
          !isRunning ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'
        )}
      >
        {!isRunning ? (
          <>
            <Play className="mr-2 h-5 w-5" />
            开始游戏
          </>
        ) : isCurrentlyPaused ? (
          <>
            <Play className="mr-2 h-5 w-5" />
            继续
          </>
        ) : (
          <>
            <Pause className="mr-2 h-5 w-5" />
            暂停
          </>
        )}
      </Button>
    </div>
  );
});

GameControls.displayName = 'GameControls';
