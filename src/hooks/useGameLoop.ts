import { useEffect, useRef } from 'react';
import { useGameUI } from '../contexts/GameUIContext';
import { useGameStore } from '../store/useGameStore';
import { gameTick } from '../game/tick';

const TICKS_PER_SECOND = 10; // 10 TPS
const TICK_INTERVAL = 1000 / TICKS_PER_SECOND; // 100ms per tick

export const useGameLoop = () => {
  // Use GameUIContext for isPlaying and isPaused (prevents subscription loops)
  const { isPlaying, isPaused } = useGameUI();
  // gameSpeed can be accessed directly from store as it changes infrequently
  const gameSpeed = useGameStore((state) => state.gameSpeed);
  const accumulatorRef = useRef(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    if (!isPlaying || isPaused) {
      // Reset timing when game is paused/stopped
      lastTimeRef.current = 0;
      accumulatorRef.current = 0;
      return;
    }

    let animationFrameId: number;
    let tickCount = 0;
    let isFirstFrame = true; // Track if this is the first frame

    const gameLoop = (currentTime: number) => {
      // Initialize lastTime on first frame
      if (isFirstFrame) {
        lastTimeRef.current = currentTime;
        isFirstFrame = false;
        // Don't return - schedule next frame immediately
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }

      // Calculate delta time in milliseconds
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Apply game speed
      const adjustedDelta = deltaTime * gameSpeed;
      accumulatorRef.current += adjustedDelta;

      // Process ticks as many times as we can (with limit to prevent UI freeze)
      let ticksThisFrame = 0;
      const MAX_TICKS_PER_FRAME = 10;
      while (accumulatorRef.current >= TICK_INTERVAL && ticksThisFrame < MAX_TICKS_PER_FRAME) {
        gameTick();
        accumulatorRef.current -= TICK_INTERVAL;
        ticksThisFrame++;
        tickCount++;

        // Log every 100 ticks
        if (tickCount % 100 === 0) {
          console.log('[useGameLoop] Ticks processed:', tickCount);
        }
      }

      // Continue loop
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    // Start the loop
    animationFrameId = requestAnimationFrame(gameLoop);

    // Cleanup
    return () => {
      isFirstFrame = true;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying, isPaused, gameSpeed]);
};
