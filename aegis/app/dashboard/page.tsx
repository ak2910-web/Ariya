'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import ProgressBar from '@/components/ProgressBar';
import { useAegisStore } from '@/lib/store';
import { useHydrated } from '@/lib/hooks';
import { useIdleDetection, useCompletionDetection } from '@/lib/hooks/useGuidanceDetection';

export default function Dashboard() {
  const router = useRouter();
  const hydrated = useHydrated();
  
  // AI next task suggestion state
  const [aiReason, setAiReason] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  
  // Enable AI guidance detection
  useIdleDetection();
  useCompletionDetection();
  
  const getTodaysTasks = useAegisStore((state) => state.getTodaysTasks);
  const getActiveTask = useAegisStore((state) => state.getActiveTask);
  const getTodaysStats = useAegisStore((state) => state.getTodaysStats);
  const setTaskActive = useAegisStore((state) => state.setTaskActive);
  
  const todaysTasks = getTodaysTasks();
  const activeTask = getActiveTask();
  const stats = getTodaysStats();
  
  const nextTask = activeTask || todaysTasks.find(t => t.status === 'pending');
  const totalTasks = todaysTasks.length;
  const completedTasks = stats.tasksCompleted;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Fetch AI suggestion for next task
  useEffect(() => {
    if (!nextTask || activeTask || aiReason || aiLoading) return;
    
    const pendingTasks = todaysTasks.filter(t => t.status === 'pending');
    if (pendingTasks.length <= 1) return; // No need for AI if only one pending
    
    setAiLoading(true);
    
    fetch('/api/ai/nexttask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tasks: pendingTasks,
        context: {
          completedToday: stats.tasksCompleted,
          focusMinutesToday: stats.totalFocusTime,
        },
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.reason && data.taskId === nextTask.id) {
          setAiReason(data.reason);
        }
      })
      .catch(err => console.error('AI next task failed:', err))
      .finally(() => setAiLoading(false));
  }, [nextTask?.id, activeTask, todaysTasks.length, aiReason, aiLoading]);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const handleStartFocus = () => {
    if (nextTask && nextTask.status !== 'active') {
      setTaskActive(nextTask.id);
    }
    router.push('/focus');
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-800 rounded w-1/3 mb-4"></div>
            <div className="h-6 bg-gray-800 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-light text-gray-100 mb-2">
            Good {getTimeOfDay()}, Sir
          </h1>
          <p className="text-gray-400">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          {/* Debug: Show task counts */}
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-gray-600 mt-2">
              Total tasks: {useAegisStore.getState().tasks.length} | Today's tasks: {todaysTasks.length}
            </p>
          )}
        </motion.div>

        {/* Today's Next Task - Highlighted */}
        {nextTask ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card highlight className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-medium text-purple-400 uppercase tracking-wider">
                    {activeTask ? "Currently Active" : "Today's Next Task"}
                  </h2>
                  <span className="text-xs text-gray-500">
                    {nextTask.priority.toUpperCase()}
                  </span>
                </div>
                
                <h3 className="text-2xl font-medium text-gray-100 mb-2">
                  {nextTask.title}
                </h3>
                
                {nextTask.description && (
                  <p className="text-gray-400 mb-4">
                    {nextTask.description}
                  </p>
                )}
                
                {/* AI Reasoning */}
                {aiReason && !activeTask && (
                  <div className="mb-6 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <p className="text-sm text-purple-300">
                      <span className="font-medium">Jarvis: </span>
                      {aiReason}
                    </p>
                  </div>
                )}
                
                {aiLoading && !aiReason && !activeTask && (
                  <div className="mb-6 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                    <p className="text-sm text-gray-400 animate-pulse">
                      Analyzing next task...
                    </p>
                  </div>
                )}
                
                <div className="flex items-center gap-4">
                  <Button 
                    onClick={handleStartFocus}
                    variant="primary"
                  >
                    {activeTask ? "Continue Focus" : "Start Focus Session"}
                  </Button>
                  
                  {nextTask.focusTime > 0 && (
                    <span className="text-sm text-gray-500">
                      {nextTask.focusTime} min logged
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card>
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No tasks scheduled for today</p>
                <Button onClick={() => router.push('/tasks')} variant="primary">
                  Add Your First Task
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-200">Today's Progress</h2>
              <span className="text-sm text-gray-500">
                {completedTasks} of {totalTasks} tasks
              </span>
            </div>
            <ProgressBar progress={progress} />
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <Card>
            <div className="text-sm text-gray-400 mb-2">Completed</div>
            <div className="text-3xl font-bold text-green-400">{stats.tasksCompleted}</div>
            <div className="text-xs text-gray-500 mt-1">tasks finished</div>
          </Card>

          <Card>
            <div className="text-sm text-gray-400 mb-2">Focus Time</div>
            <div className="text-3xl font-bold text-purple-400">
              {Math.floor(stats.totalFocusTime / 60)}h {stats.totalFocusTime % 60}m
            </div>
            <div className="text-xs text-gray-500 mt-1">deep work</div>
          </Card>

          <Card>
            <div className="text-sm text-gray-400 mb-2">Sessions</div>
            <div className="text-3xl font-bold text-blue-400">{stats.sessionsCompleted}</div>
            <div className="text-xs text-gray-500 mt-1">focus rounds</div>
          </Card>
        </motion.div>

        {/* Task List */}
        {todaysTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-medium text-gray-200">Today's Tasks</h2>
              <Button 
                onClick={() => router.push('/tasks')}
                variant="ghost" 
                size="sm"
              >
                View All →
              </Button>
            </div>
            
            <div className="space-y-3">
              {todaysTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Card className={`hover:border-purple-500/30 ${
                    task.status === 'active' ? 'border-purple-500/50' : ''
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${
                          task.status === 'completed' 
                            ? 'bg-green-500' 
                            : task.status === 'active'
                            ? 'bg-purple-500 animate-pulse'
                            : 'bg-gray-600'
                        }`} />
                        
                        <div>
                          <h3 className={`font-medium ${
                            task.status === 'completed' 
                              ? 'text-gray-500 line-through' 
                              : 'text-gray-200'
                          }`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {task.description}
                            </p>
                          )}
                          {task.focusTime > 0 && (
                            <p className="text-xs text-gray-600 mt-1">
                              {task.focusTime} min focused
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {task.status === 'active' && (
                          <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                            Active
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded ${
                          task.priority === 'high' 
                            ? 'bg-red-900/30 text-red-400' 
                            : task.priority === 'medium'
                            ? 'bg-yellow-900/30 text-yellow-400'
                            : 'bg-gray-800 text-gray-400'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-4"
        >
          <Button onClick={() => router.push('/tasks')} variant="secondary">
            Manage Tasks
          </Button>
          <Button onClick={() => router.push('/analysis')} variant="ghost">
            View Analysis
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
