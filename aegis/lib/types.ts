/**
 * Core type definitions for Aegis state management
 */

// Task status lifecycle
export type TaskStatus = 'pending' | 'active' | 'completed' | 'avoided';

// Task priority levels
export type TaskPriority = 'high' | 'medium' | 'low';

// Core Task entity
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string; // ISO timestamp
  scheduledFor?: string; // ISO date (YYYY-MM-DD)
  completedAt?: string; // ISO timestamp
  avoidedAt?: string; // ISO timestamp
  focusTime: number; // Total minutes focused on this task
}

// Focus session state
export interface FocusSession {
  isActive: boolean;
  taskId: string | null;
  startTime: number | null; // Unix timestamp (ms)
  pausedTime: number | null; // Unix timestamp (ms)
  elapsedTime: number; // Seconds elapsed
  duration: number; // Target duration in seconds (default 1500 = 25 min)
}

// Daily statistics (derived from tasks)
export interface DailyStats {
  date: string; // ISO date (YYYY-MM-DD)
  tasksCompleted: number;
  tasksAvoided: number;
  totalFocusTime: number; // Minutes
  sessionsCompleted: number;
}

// Insight types for analysis
export type InsightType = 'momentum' | 'friction' | 'focus' | 'completion';

export interface Insight {
  type: InsightType;
  message: string;
  severity: 'positive' | 'neutral' | 'warning';
}

// Analysis data structure
export interface DailyAnalysis {
  date: string;
  stats: DailyStats;
  insights: Insight[];
  narrative?: string; // AI-generated narrative analysis
  narrativeLoading?: boolean;
  narrativeError?: string;
}
