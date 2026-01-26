/**
 * Sync service - bridges local state and Supabase
 * Local-first architecture: UI never waits for backend
 */

import { supabase, isBackendAvailable } from './supabase';
import { getCurrentUser } from './auth';
import type { Task, FocusSession, DailyStats } from './types';

/**
 * Sync tasks to Supabase
 */
export async function syncTaskToCloud(task: Task): Promise<boolean> {
  if (!isBackendAvailable()) return false;

  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const { error } = await supabase!
      .from('tasks')
      .upsert({
        id: task.id,
        user_id: user.id,
        title: task.title,
        description: task.description || null,
        status: task.status,
        priority: task.priority,
        focus_time: task.focusTime,
        scheduled_for: task.scheduledFor || null,
        created_at: task.createdAt,
        completed_at: task.completedAt || null,
        avoided_at: task.avoidedAt || null,
        updated_at: new Date().toISOString(),
      } as any); // Type assertion needed due to Supabase typing

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to sync task:', error);
    return false;
  }
}

/**
 * Delete task from Supabase
 */
export async function deleteTaskFromCloud(taskId: string): Promise<boolean> {
  if (!isBackendAvailable()) return false;

  try {
    const { error } = await supabase!
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to delete task:', error);
    return false;
  }
}

/**
 * Fetch all tasks from Supabase
 */
export async function fetchTasksFromCloud(): Promise<Task[]> {
  if (!isBackendAvailable()) return [];

  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase!
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      status: row.status,
      priority: row.priority,
      focusTime: row.focus_time,
      scheduledFor: row.scheduled_for || undefined,
      createdAt: row.created_at,
      completedAt: row.completed_at || undefined,
      avoidedAt: row.avoided_at || undefined,
    }));
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return [];
  }
}

/**
 * Sync focus session to Supabase
 */
export async function syncFocusSessionToCloud(
  taskId: string,
  durationSeconds: number,
  startTime: number,
  endTime?: number
): Promise<boolean> {
  if (!isBackendAvailable()) return false;

  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const { error } = await (supabase!
      .from('focus_sessions')
      .insert as any)({
        user_id: user.id,
        task_id: taskId,
        duration_seconds: durationSeconds,
        started_at: new Date(startTime).toISOString(),
        ended_at: endTime ? new Date(endTime).toISOString() : null,
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to sync focus session:', error);
    return false;
  }
}

/**
 * Sync daily summary to Supabase
 */
export async function syncDailySummaryToCloud(
  date: string,
  stats: DailyStats
): Promise<boolean> {
  if (!isBackendAvailable()) return false;

  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const { error} = await (supabase!
      .from('daily_summaries')
      .upsert as any)({
        user_id: user.id,
        date,
        focus_seconds: stats.totalFocusTime * 60, // Convert minutes to seconds
        tasks_completed: stats.tasksCompleted,
        tasks_avoided: stats.tasksAvoided,
        sessions_completed: stats.sessionsCompleted,
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to sync daily summary:', error);
    return false;
  }
}

/**
 * Merge local and cloud data
 * Strategy: Latest timestamp wins
 */
export function mergeTasks(localTasks: Task[], cloudTasks: Task[]): Task[] {
  const merged = new Map<string, Task>();

  // Add all local tasks
  localTasks.forEach((task) => {
    merged.set(task.id, task);
  });

  // Merge with cloud tasks (latest wins)
  cloudTasks.forEach((cloudTask) => {
    const localTask = merged.get(cloudTask.id);

    if (!localTask) {
      // Cloud task doesn't exist locally, add it
      merged.set(cloudTask.id, cloudTask);
    } else {
      // Both exist, keep the one with latest update
      const localDate = new Date(localTask.createdAt).getTime();
      const cloudDate = new Date(cloudTask.createdAt).getTime();

      if (cloudDate > localDate) {
        merged.set(cloudTask.id, cloudTask);
      }
    }
  });

  return Array.from(merged.values());
}

/**
 * Initial sync on app startup
 */
export async function performInitialSync(localTasks: Task[]): Promise<Task[]> {
  if (!isBackendAvailable()) return localTasks;

  try {
    const user = await getCurrentUser();
    if (!user) return localTasks;

    console.log('🔄 Performing initial sync...');
    
    const cloudTasks = await fetchTasksFromCloud();
    const mergedTasks = mergeTasks(localTasks, cloudTasks);

    console.log(`✅ Synced: ${localTasks.length} local + ${cloudTasks.length} cloud = ${mergedTasks.length} total`);

    return mergedTasks;
  } catch (error) {
    console.error('Initial sync failed:', error);
    return localTasks;
  }
}
