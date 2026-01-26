'use client';

import { useEffect, useRef } from 'react';
import { useAegisStore } from '@/lib/store';

/**
 * Detects idle behavior and triggers AI guidance
 * 
 * Trigger conditions:
 * - 8+ minutes idle (no task activity)
 * - Not currently in focus session
 * - At least 5 minutes since last guidance
 * 
 * Does NOT trigger during:
 * - Active focus sessions
 * - Recent guidance (< 5 min ago)
 * - No pending tasks
 */
export function useIdleDetection() {
  const requestGuidance = useAegisStore((state) => state.requestGuidance);
  const canShowGuidance = useAegisStore((state) => state.canShowGuidance);
  const focusSession = useAegisStore((state) => state.focusSession);
  const tasks = useAegisStore((state) => state.tasks);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    // Update last activity when tasks change
    lastActivityRef.current = Date.now();
  }, [tasks.length]);

  useEffect(() => {
    const IDLE_THRESHOLD = 8 * 60 * 1000; // 8 minutes
    const CHECK_INTERVAL = 30 * 1000; // Check every 30 seconds

    const checkIdle = () => {
      // Don't check if we can't show guidance anyway
      if (!canShowGuidance()) {
        return;
      }

      // Don't check if actively focusing
      if (focusSession.isActive && !focusSession.pausedTime) {
        return;
      }

      // Check if we have pending tasks
      const hasPendingTasks = tasks.some(t => t.status === 'pending' || t.status === 'active');
      if (!hasPendingTasks) {
        return;
      }

      // Calculate idle time
      const idleTime = Date.now() - lastActivityRef.current;

      // Trigger guidance if idle too long
      if (idleTime > IDLE_THRESHOLD) {
        requestGuidance('idle');
        // Reset timer after requesting
        lastActivityRef.current = Date.now();
      }
    };

    const interval = setInterval(checkIdle, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [canShowGuidance, focusSession, tasks, requestGuidance]);
}

/**
 * Detects task completion and triggers celebratory guidance
 */
export function useCompletionDetection() {
  const requestGuidance = useAegisStore((state) => state.requestGuidance);
  const canShowGuidance = useAegisStore((state) => state.canShowGuidance);
  const tasks = useAegisStore((state) => state.tasks);
  const prevTasksRef = useRef(tasks);

  useEffect(() => {
    const prevCompleted = prevTasksRef.current.filter(t => t.status === 'completed').length;
    const currentCompleted = tasks.filter(t => t.status === 'completed').length;

    // Task was just completed
    if (currentCompleted > prevCompleted && canShowGuidance()) {
      requestGuidance('completed');
    }

    prevTasksRef.current = tasks;
  }, [tasks, canShowGuidance, requestGuidance]);
}
