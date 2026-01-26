/**
 * Aegis Global State Store
 * Single source of truth for all app state with localStorage persistence
 * Now with cloud sync support via Supabase
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, FocusSession, DailyStats, DailyAnalysis, Insight } from './types';
import { 
  syncTaskToCloud, 
  deleteTaskFromCloud, 
  syncFocusSessionToCloud,
  syncDailySummaryToCloud,
  performInitialSync,
} from './sync';

interface AegisState {
  // Core data
  tasks: Task[];
  focusSession: FocusSession;
  dailyStats: Record<string, DailyStats>; // Keyed by ISO date
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  aiInsights: Record<string, DailyAnalysis>; // Keyed by ISO date, includes narrative
  
  // AI Guidance state
  lastGuidanceTime: number | null; // Unix timestamp of last guidance message
  currentGuidance: string | null; // Current Jarvis message
  guidanceVisible: boolean; // Whether guidance is currently shown

  // Computed getters
  getTodaysTasks: () => Task[];
  getActiveTask: () => Task | null;
  getTodaysStats: () => DailyStats;

  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'focusTime'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setTaskActive: (id: string) => void;
  completeTask: (id: string) => void;
  avoidTask: (id: string) => void;

  // Focus actions
  startFocus: (taskId: string, duration?: number) => void;
  pauseFocus: () => void;
  resumeFocus: () => void;
  endFocus: () => void;
  tickFocus: () => void; // Called every second by timer

  // Analysis actions
  computeDailyAnalysis: (date: string) => DailyAnalysis;
  generateAIInsights: (date: string) => Promise<void>;
  getAIInsights: (date: string) => DailyAnalysis | null;
  endDay: () => void;
  
  // AI Guidance actions
  requestGuidance: (state: 'idle' | 'task_switch' | 'completed') => Promise<void>;
  dismissGuidance: () => void;
  canShowGuidance: () => boolean;

  // Sync actions
  syncWithCloud: () => Promise<void>;
  loadTasksFromCloud: () => Promise<void>;

  // Utility
  resetState: () => void;
}

const TODAY = () => new Date().toISOString().split('T')[0];
const NOW = () => new Date().toISOString();

const initialFocusSession: FocusSession = {
  isActive: false,
  taskId: null,
  startTime: null,
  pausedTime: null,
  elapsedTime: 0,
  duration: 1500, // 25 minutes default
};

export const useAegisStore = create<AegisState>()(
  persist(
    (set, get) => ({
      // Initial state
      tasks: [],
      focusSession: initialFocusSession,
      dailyStats: {},
      syncStatus: 'idle',
      aiInsights: {},
      lastGuidanceTime: null,
      currentGuidance: null,
      guidanceVisible: false,

      // Computed getters
      getTodaysTasks: () => {
        const today = TODAY();
        return get().tasks.filter(
          (task) =>
            task.scheduledFor === today ||
            (task.status === 'active' && task.scheduledFor !== today) ||
            (task.status === 'pending' && !task.scheduledFor)
        );
      },

      getActiveTask: () => {
        return get().tasks.find((task) => task.status === 'active') || null;
      },

      getTodaysStats: () => {
        const today = TODAY();
        const existing = get().dailyStats[today];
        if (existing) return existing;

        // Compute on-the-fly
        const todaysTasks = get().tasks.filter(
          (task) =>
            task.scheduledFor === today ||
            task.completedAt?.startsWith(today) ||
            task.avoidedAt?.startsWith(today)
        );

        const stats: DailyStats = {
          date: today,
          tasksCompleted: todaysTasks.filter((t) => t.status === 'completed').length,
          tasksAvoided: todaysTasks.filter((t) => t.status === 'avoided').length,
          totalFocusTime: todaysTasks.reduce((sum, t) => sum + t.focusTime, 0),
          sessionsCompleted: 0, // Will be tracked separately
        };

        return stats;
      },

      // Task actions
      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: NOW(),
          focusTime: 0,
        };

        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));

        // Async sync to cloud (non-blocking)
        syncTaskToCloud(newTask).catch(console.error);
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)),
        }));

        // Async sync to cloud (non-blocking)
        const updatedTask = get().tasks.find(t => t.id === id);
        if (updatedTask) {
          syncTaskToCloud(updatedTask).catch(console.error);
        }
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));

        // Async sync to cloud (non-blocking)
        deleteTaskFromCloud(id).catch(console.error);
      },

      setTaskActive: (id) => {
        set((state) => {
          const currentActive = state.tasks.find((t) => t.status === 'active');

          return {
            tasks: state.tasks.map((task) => {
              // Mark previous active as avoided (soft transition)
              if (task.id === currentActive?.id && task.id !== id) {
                const updated = {
                  ...task,
                  status: 'avoided' as const,
                  avoidedAt: NOW(),
                };
                syncTaskToCloud(updated).catch(console.error);
                return updated;
              }
              // Set new active
              if (task.id === id) {
                const updated = {
                  ...task,
                  status: 'active' as const,
                  scheduledFor: task.scheduledFor || TODAY(),
                };
                syncTaskToCloud(updated).catch(console.error);
                return updated;
              }
              return task;
            }),
          };
        });
      },

      completeTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  status: 'completed' as const,
                  completedAt: NOW(),
                }
              : task
          ),
        }));

        const completedTask = get().tasks.find(t => t.id === id);
        if (completedTask) {
          syncTaskToCloud(completedTask).catch(console.error);
        }
      },

      avoidTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  status: 'avoided' as const,
                  avoidedAt: NOW(),
                }
              : task
          ),
        }));

        const avoidedTask = get().tasks.find(t => t.id === id);
        if (avoidedTask) {
          syncTaskToCloud(avoidedTask).catch(console.error);
        }
      },

      // Focus actions
      startFocus: (taskId, duration = 1500) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task) return;

        // Auto-set task as active if not already
        if (task.status !== 'active') {
          get().setTaskActive(taskId);
        }

        set({
          focusSession: {
            isActive: true,
            taskId,
            startTime: Date.now(),
            pausedTime: null,
            elapsedTime: 0,
            duration,
          },
        });
      },

      pauseFocus: () => {
        const session = get().focusSession;
        if (!session.isActive || session.pausedTime) return;

        set({
          focusSession: {
            ...session,
            pausedTime: Date.now(),
          },
        });
      },

      resumeFocus: () => {
        const session = get().focusSession;
        if (!session.pausedTime || !session.startTime) return;

        const pausedDuration = Date.now() - session.pausedTime;

        set({
          focusSession: {
            ...session,
            startTime: session.startTime + pausedDuration,
            pausedTime: null,
          },
        });
      },

      endFocus: () => {
        const session = get().focusSession;
        if (!session.taskId || !session.startTime) return;

        const finalElapsed = session.pausedTime
          ? Math.floor((session.pausedTime - session.startTime) / 1000)
          : session.elapsedTime;

        const focusMinutes = Math.floor(finalElapsed / 60);

        // Add focus time to task
        get().updateTask(session.taskId, {
          focusTime: (get().tasks.find((t) => t.id === session.taskId)?.focusTime || 0) + focusMinutes,
        });

        // Update daily stats
        const today = TODAY();
        const currentStats = get().getTodaysStats();
        const updatedStats = {
          ...currentStats,
          totalFocusTime: currentStats.totalFocusTime + focusMinutes,
          sessionsCompleted: currentStats.sessionsCompleted + 1,
        };
        
        set((state) => ({
          dailyStats: {
            ...state.dailyStats,
            [today]: updatedStats,
          },
        }));

        // Sync focus session to cloud (non-blocking)
        syncFocusSessionToCloud(
          session.taskId,
          finalElapsed,
          session.startTime,
          Date.now()
        ).catch(console.error);

        // Sync daily stats to cloud (non-blocking)
        syncDailySummaryToCloud(today, updatedStats).catch(console.error);

        // Reset session
        set({ focusSession: initialFocusSession });
      },

      tickFocus: () => {
        const session = get().focusSession;
        if (!session.isActive || !session.startTime || session.pausedTime) return;

        const elapsed = Math.floor((Date.now() - session.startTime) / 1000);

        set({
          focusSession: {
            ...session,
            elapsedTime: elapsed,
          },
        });

        // Auto-end when duration reached
        if (elapsed >= session.duration) {
          get().endFocus();
        }
      },

      // Analysis actions
      computeDailyAnalysis: (date) => {
        const stats = get().dailyStats[date] || get().getTodaysStats();
        const insights: Insight[] = [];

        // Rule-based insights
        if (stats.totalFocusTime >= 90) {
          insights.push({
            type: 'momentum',
            message: 'Strong momentum — over 90 minutes of focused work.',
            severity: 'positive',
          });
        }

        if (stats.tasksAvoided > stats.tasksCompleted && stats.tasksAvoided > 0) {
          insights.push({
            type: 'friction',
            message: 'Decision friction detected — more tasks avoided than completed.',
            severity: 'warning',
          });
        }

        if (stats.tasksCompleted > 3) {
          insights.push({
            type: 'completion',
            message: `Productive day — ${stats.tasksCompleted} tasks completed.`,
            severity: 'positive',
          });
        }

        if (stats.totalFocusTime === 0 && stats.tasksCompleted === 0) {
          insights.push({
            type: 'focus',
            message: 'No focus sessions recorded today.',
            severity: 'neutral',
          });
        }

        return {
          date,
          stats,
          insights,
        };
      },

      generateAIInsights: async (date: string) => {
        // Check if already loading or exists
        const existing = get().aiInsights[date];
        if (existing?.narrativeLoading) return;

        // Set loading state
        set((state) => ({
          aiInsights: {
            ...state.aiInsights,
            [date]: {
              ...get().computeDailyAnalysis(date),
              narrativeLoading: true,
              narrative: undefined,
              narrativeError: undefined,
            },
          },
        }));

        try {
          const stats = get().getTodaysStats();
          const tasks = get().tasks.filter(
            (task) =>
              task.scheduledFor === date ||
              task.completedAt?.startsWith(date) ||
              task.avoidedAt?.startsWith(date)
          );

          // Find top task (most focus time)
          const topTask = tasks
            .filter((t) => t.focusTime > 0)
            .sort((a, b) => b.focusTime - a.focusTime)[0];

          const response = await fetch('/api/ai/insights', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              date,
              tasksCompleted: stats.tasksCompleted,
              tasksAvoided: stats.tasksAvoided,
              totalTasks: tasks.length,
              focusMinutes: stats.totalFocusTime,
              sessionsCompleted: stats.sessionsCompleted,
              topTask: topTask?.title,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || `API returned ${response.status}`);
          }

          const { insight } = await response.json();

          set((state) => ({
            aiInsights: {
              ...state.aiInsights,
              [date]: {
                ...get().computeDailyAnalysis(date),
                narrative: insight,
                narrativeLoading: false,
              },
            },
          }));
        } catch (error: any) {
          console.error('Error generating AI insights:', error);
          set((state) => ({
            aiInsights: {
              ...state.aiInsights,
              [date]: {
                ...get().computeDailyAnalysis(date),
                narrativeLoading: false,
                narrativeError: error.message || 'Failed to generate insights',
              },
            },
          }));
        }
      },

      getAIInsights: (date: string) => {
        return get().aiInsights[date] || null;
      },

      endDay: () => {
        const today = TODAY();
        const stats = get().getTodaysStats();

        // Persist today's stats
        set((state) => ({
          dailyStats: {
            ...state.dailyStats,
            [today]: stats,
          },
        }));

        // Sync to cloud (non-blocking)
        syncDailySummaryToCloud(today, stats).catch(console.error);

        // Mark all active/pending today tasks as avoided
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (
              task.scheduledFor === today &&
              (task.status === 'active' || task.status === 'pending')
            ) {
              const updated = {
                ...task,
                status: 'avoided' as const,
                avoidedAt: NOW(),
              };
              syncTaskToCloud(updated).catch(console.error);
              return updated;
            }
            return task;
          }),
        }));
      },

      // AI Guidance actions
      canShowGuidance: () => {
        const lastTime = get().lastGuidanceTime;
        const now = Date.now();
        const MIN_INTERVAL = 5 * 60 * 1000; // 5 minutes between guidance messages
        
        // Don't show if recently shown
        if (lastTime && (now - lastTime) < MIN_INTERVAL) {
          return false;
        }
        
        // Don't show if user is actively focusing
        if (get().focusSession.isActive && !get().focusSession.pausedTime) {
          return false;
        }
        
        return true;
      },

      requestGuidance: async (state) => {
        // Rate limiting check
        if (!get().canShowGuidance()) {
          return;
        }

        try {
          const activeTask = get().getActiveTask();
          const pendingTasks = get().tasks.filter(t => t.status === 'pending').length;
          
          // Calculate idle time if state is idle
          let timeIdleMinutes: number | undefined;
          if (state === 'idle' && !get().focusSession.isActive) {
            const lastActivity = get().tasks
              .filter(t => t.completedAt || t.avoidedAt)
              .map(t => new Date(t.completedAt || t.avoidedAt!).getTime())
              .sort((a, b) => b - a)[0];
            
            if (lastActivity) {
              timeIdleMinutes = Math.floor((Date.now() - lastActivity) / (60 * 1000));
            }
          }

          const response = await fetch('/api/ai/guidance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              state,
              timeIdleMinutes,
              activeTask: activeTask?.title || null,
              pendingTasks,
            }),
          });

          if (!response.ok) {
            // Silently fail if AI unavailable (quota exceeded, etc.)
            console.warn('AI guidance unavailable');
            return;
          }

          const { message } = await response.json();

          set({
            currentGuidance: message,
            guidanceVisible: true,
            lastGuidanceTime: Date.now(),
          });
        } catch (error: any) {
          // Silent failure - app continues working without guidance
          console.warn('AI guidance unavailable:', error.message);
        }
      },

      dismissGuidance: () => {
        set({
          guidanceVisible: false,
          currentGuidance: null,
        });
      },

      // Sync actions
      syncWithCloud: async () => {
        set({ syncStatus: 'syncing' });
        
        try {
          const localTasks = get().tasks;
          const mergedTasks = await performInitialSync(localTasks);
          
          set({ 
            tasks: mergedTasks,
            syncStatus: 'synced',
          });
        } catch (error) {
          console.error('Sync failed:', error);
          set({ syncStatus: 'error' });
        }
      },

      loadTasksFromCloud: async () => {
        try {
          const cloudTasks = await performInitialSync(get().tasks);
          set({ tasks: cloudTasks });
        } catch (error) {
          console.error('Failed to load tasks from cloud:', error);
        }
      },

      // Utility
      resetState: () => {
        set({
          tasks: [],
          focusSession: initialFocusSession,
          dailyStats: {},
        });
      },
    }),
    {
      name: 'aegis-storage',
      version: 1,
    }
  )
);
