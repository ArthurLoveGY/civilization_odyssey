import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { gameTick } from '../game/tick';

const TICKS_PER_SECOND = 10; // 10 TPS
const TICK_INTERVAL = 1000 / TICKS_PER_SECOND; // 100ms per tick

export const useGameLoop = () => {
  const { isPlaying, isPaused, gameSpeed } = useGameStore();
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

    const gameLoop = (currentTime: number) => {
      // Initialize lastTime on first frame
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
        return; // Skip first frame to prevent burst
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
      }

      // Continue the loop
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    // Start the loop
    animationFrameId = requestAnimationFrame(gameLoop);

    // Cleanup
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying, isPaused, gameSpeed]);
};
