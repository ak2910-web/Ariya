/**
 * Utility hooks and helpers for working with Aegis state
 */

import { useEffect, useState } from 'react';
import { useAegisStore } from './store';

/**
 * Hook to format remaining time in focus session
 */
export function useFocusTimer() {
  const focusSession = useAegisStore((state) => state.focusSession);

  const remaining = Math.max(0, focusSession.duration - focusSession.elapsedTime);
  const progress = (focusSession.elapsedTime / focusSession.duration) * 100;

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return {
    remaining,
    progress,
    formatted: `${minutes}:${seconds.toString().padStart(2, '0')}`,
    isActive: focusSession.isActive,
    isPaused: !!focusSession.pausedTime,
  };
}

/**
 * Hook to get today's task summary
 */
export function useTodaysSummary() {
  const getTodaysTasks = useAegisStore((state) => state.getTodaysTasks);
  const getActiveTask = useAegisStore((state) => state.getActiveTask);
  const getTodaysStats = useAegisStore((state) => state.getTodaysStats);

  const [summary, setSummary] = useState({
    tasks: getTodaysTasks(),
    activeTask: getActiveTask(),
    stats: getTodaysStats(),
  });

  useEffect(() => {
    const unsubscribe = useAegisStore.subscribe(() => {
      setSummary({
        tasks: getTodaysTasks(),
        activeTask: getActiveTask(),
        stats: getTodaysStats(),
      });
    });

    return unsubscribe;
  }, [getTodaysTasks, getActiveTask, getTodaysStats]);

  return summary;
}

/**
 * Hook to check if app is hydrated (client-side)
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
