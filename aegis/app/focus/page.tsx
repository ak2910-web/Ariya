'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { useAegisStore } from '@/lib/store';
import { useFocusTimer, useHydrated } from '@/lib/hooks';
import { speak, JARVIS_PHRASES } from '@/lib/voice';

export default function Focus() {
  const router = useRouter();
  const hydrated = useHydrated();
  const hasSpokenStartRef = useRef(false);

  const getActiveTask = useAegisStore((state) => state.getActiveTask);
  const getTodaysStats = useAegisStore((state) => state.getTodaysStats);
  const startFocus = useAegisStore((state) => state.startFocus);
  const pauseFocus = useAegisStore((state) => state.pauseFocus);
  const resumeFocus = useAegisStore((state) => state.resumeFocus);
  const endFocus = useAegisStore((state) => state.endFocus);
  const completeTask = useAegisStore((state) => state.completeTask);

  const activeTask = getActiveTask();
  const stats = getTodaysStats();
  const { remaining, progress, formatted, isActive, isPaused } = useFocusTimer();

  const handleStart = () => {
    if (!activeTask) {
      router.push('/tasks');
      return;
    }
    startFocus(activeTask.id);
    
    // Trigger: Focus session starts
    if (!hasSpokenStartRef.current) {
      hasSpokenStartRef.current = true;
      setTimeout(() => {
        speak(JARVIS_PHRASES.FOCUS_START);
      }, 800);
    }
  };

  const handlePause = () => {
    if (isPaused) {
      resumeFocus();
    } else {
      pauseFocus();
    }
  };

  const handleEnd = () => {
    endFocus();
  };

  const handleComplete = () => {
    if (activeTask) {
      completeTask(activeTask.id);
    }
    
    // Trigger: Task completed
    setTimeout(() => {
      speak(JARVIS_PHRASES.TASK_COMPLETE);
    }, 500);
    
    endFocus();
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-80 w-80 bg-gray-800 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!activeTask) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Card className="max-w-md text-center">
          <h2 className="text-2xl font-light text-gray-200 mb-4">No Active Task</h2>
          <p className="text-gray-400 mb-6">
            Start a task from your task list to begin a focus session.
          </p>
          <Button onClick={() => router.push('/tasks')} variant="primary">
            Go to Tasks
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-4xl w-full">
        {/* Exit Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-24 right-6"
        >
          <Button
            onClick={() => router.push('/dashboard')}
            variant="ghost"
            size="sm"
          >
            Exit Focus Mode
          </Button>
        </motion.div>

        {/* Main Focus Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Current Task */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <p className="text-sm text-purple-400 uppercase tracking-wider mb-3">
              Currently Focusing On
            </p>
            <h1 className="text-4xl font-light text-gray-100">
              {activeTask.title}
            </h1>
            {activeTask.description && (
              <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
                {activeTask.description}
              </p>
            )}
          </motion.div>

          {/* Timer Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="relative mb-16"
          >
            {/* Outer Ring */}
            <svg className="w-80 h-80 mx-auto" viewBox="0 0 200 200">
              {/* Background Circle */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="rgba(75, 85, 99, 0.2)"
                strokeWidth="8"
              />
              
              {/* Progress Circle */}
              <motion.circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 90}
                strokeDashoffset={2 * Math.PI * 90 * (1 - progress / 100)}
                transform="rotate(-90 100 100)"
                initial={{ strokeDashoffset: 2 * Math.PI * 90 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 90 * (1 - progress / 100) }}
                transition={{ duration: 0.5 }}
              />
              
              {/* Gradient Definition */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A855F7" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>
            </svg>

            {/* Timer Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div>
                <div className="text-7xl font-light text-gray-100 mb-2">
                  {formatted}
                </div>
                <div className="text-sm text-gray-500">
                  {isActive ? (isPaused ? 'Paused' : 'Stay focused') : 'Ready to start'}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center gap-4 mb-12"
          >
            {!isActive ? (
              <Button
                onClick={handleStart}
                variant="primary"
                size="lg"
                className="px-12"
              >
                Start Session
              </Button>
            ) : (
              <>
                <Button
                  onClick={handlePause}
                  variant="secondary"
                  size="lg"
                  className="px-12"
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button
                  onClick={handleEnd}
                  variant="ghost"
                  size="lg"
                >
                  End Session
                </Button>
              </>
            )}
            
            {remaining === 0 && (
              <Button
                onClick={handleComplete}
                variant="primary"
                size="lg"
              >
                Mark Complete
              </Button>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-3 gap-4 max-w-2xl mx-auto"
          >
            <Card>
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {stats.sessionsCompleted}
              </div>
              <div className="text-xs text-gray-500">Sessions Today</div>
            </Card>
            
            <Card>
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {stats.totalFocusTime}m
              </div>
              <div className="text-xs text-gray-500">Total Focus Time</div>
            </Card>
            
            <Card>
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {activeTask.focusTime}m
              </div>
              <div className="text-xs text-gray-500">This Task</div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Tips */}
        {!isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Pro tip: Close unnecessary tabs, silence notifications, and let the AI help you maintain deep focus.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
