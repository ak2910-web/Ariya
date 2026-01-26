'use client';

/**
 * Aegis State Provider
 * Initializes the store and provides global access to state
 */

import { useEffect } from 'react';
import { useAegisStore } from './store';

export function AegisProvider({ children }: { children: React.ReactNode }) {
  const tickFocus = useAegisStore((state) => state.tickFocus);
  const focusSession = useAegisStore((state) => state.focusSession);

  // Focus timer tick (runs every second when active)
  useEffect(() => {
    if (!focusSession.isActive || focusSession.pausedTime) return;

    const interval = setInterval(() => {
      tickFocus();
    }, 1000);

    return () => clearInterval(interval);
  }, [focusSession.isActive, focusSession.pausedTime, tickFocus]);

  return <>{children}</>;
}
