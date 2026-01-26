'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Toast from '@/components/Toast';
import { useAegisStore } from '@/lib/store';
import { useHydrated } from '@/lib/hooks';
import type { TaskStatus, TaskPriority } from '@/lib/types';

export default function Tasks() {
  const hydrated = useHydrated();
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const tasks = useAegisStore((state) => state.tasks);
  const addTask = useAegisStore((state) => state.addTask);
  const setTaskActive = useAegisStore((state) => state.setTaskActive);
  const completeTask = useAegisStore((state) => state.completeTask);
  const deleteTask = useAegisStore((state) => state.deleteTask);

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(t => t.status === filter);

  const handleAddTask = () => {
    if (!title.trim()) {
      setToast({ message: 'Task title is required', type: 'error' });
      return;
    }
    
    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      status: 'pending',
      priority,
      scheduledFor: new Date().toISOString().split('T')[0],
    });

    setToast({ message: `Task "${title.trim()}" added successfully`, type: 'success' });
    setTitle('');
    setDescription('');
    setPriority('medium');
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'active':
        return 'bg-purple-500 animate-pulse';
      case 'avoided':
        return 'bg-yellow-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getPriorityStyle = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-900/30 text-red-400';
      case 'medium':
        return 'bg-yellow-900/30 text-yellow-400';
      default:
        return 'bg-gray-800 text-gray-400';
    }
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-800 rounded w-1/3"></div>
            <div className="h-32 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12">
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
      
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-light text-gray-100 mb-2">Tasks</h1>
          <p className="text-gray-400">
            Manage your work and priorities • {tasks.length} total task{tasks.length !== 1 ? 's' : ''}
          </p>
        </motion.div>

        {/* Add Task Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <h2 className="text-lg font-medium text-gray-200 mb-4">Add New Task</h2>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              
              <textarea
                placeholder="Description (optional)"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              
              <div className="flex gap-4">
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
              
              <Button onClick={handleAddTask} variant="primary">
                Add Task
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 mb-6"
        >
          {(['all', 'pending', 'active', 'completed', 'avoided'] as const).map((f) => (
            <Button
              key={f}
              onClick={() => setFilter(f)}
              variant={filter === f ? 'primary' : 'ghost'}
              size="sm"
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </motion.div>

        {/* Task List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
            >
              <Card className={`hover:border-purple-500/30 ${
                task.status === 'active' ? 'border-purple-500/50' : ''
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(task.status)}`} />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-lg font-medium ${
                          task.status === 'completed' 
                            ? 'text-gray-500 line-through' 
                            : 'text-gray-200'
                        }`}>
                          {task.title}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded ${getPriorityStyle(task.priority)}`}>
                          {task.priority}
                        </span>
                        {task.status === 'active' && (
                          <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-gray-400 mb-3">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {task.focusTime > 0 && (
                          <span>Focus: {task.focusTime}m</span>
                        )}
                        <span>
                          Created: {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                        {task.completedAt && (
                          <span className="text-green-500">
                            ✓ Completed: {new Date(task.completedAt).toLocaleDateString()}
                          </span>
                        )}
                        {task.avoidedAt && (
                          <span className="text-yellow-500">
                            Avoided: {new Date(task.avoidedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {task.status === 'pending' && (
                      <Button 
                        onClick={() => setTaskActive(task.id)} 
                        variant="ghost" 
                        size="sm"
                      >
                        Start
                      </Button>
                    )}
                    {task.status === 'active' && (
                      <Button 
                        onClick={() => completeTask(task.id)} 
                        variant="ghost" 
                        size="sm"
                      >
                        Complete
                      </Button>
                    )}
                    {(task.status === 'pending' || task.status === 'active') && (
                      <Button 
                        onClick={() => deleteTask(task.id)} 
                        variant="ghost" 
                        size="sm"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No tasks found</p>
          </div>
        )}
      </div>
    </div>
  );
}
