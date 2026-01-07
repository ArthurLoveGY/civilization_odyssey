import { useState, useEffect, useRef } from 'react';

/**
 * Hook to throttle value updates to reduce re-renders
 * Only updates the returned value every `delay` milliseconds
 */
export function useThrottledValue<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastUpdatedRef = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdatedRef.current;

    if (timeSinceLastUpdate >= delay) {
      // Enough time has passed, update immediately
      lastUpdatedRef.current = now;
      setThrottledValue(value);
    } else {
      // Not enough time, schedule update for later
      const timeoutId = setTimeout(() => {
        lastUpdatedRef.current = Date.now();
        setThrottledValue(value);
      }, delay - timeSinceLastUpdate);

      return () => clearTimeout(timeoutId);
    }
  }, [value, delay]);

  return throttledValue;
}
