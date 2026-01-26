export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in-progress' | 'completed';
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  createdAt: Date;
  completedAt?: Date;
}

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Review quarterly reports',
    description: 'Analyze Q4 performance metrics and prepare summary',
    priority: 'high',
    status: 'todo',
    estimatedTime: 60,
    createdAt: new Date('2026-01-26T09:00:00'),
  },
  {
    id: '2',
    title: 'Update project documentation',
    description: 'Document new API endpoints and usage examples',
    priority: 'medium',
    status: 'in-progress',
    estimatedTime: 45,
    actualTime: 30,
    createdAt: new Date('2026-01-25T14:00:00'),
  },
  {
    id: '3',
    title: 'Team sync meeting',
    description: 'Weekly standup with engineering team',
    priority: 'medium',
    status: 'completed',
    estimatedTime: 30,
    actualTime: 35,
    createdAt: new Date('2026-01-26T10:00:00'),
    completedAt: new Date('2026-01-26T10:35:00'),
  },
  {
    id: '4',
    title: 'Code review for PR #234',
    priority: 'high',
    status: 'todo',
    estimatedTime: 30,
    createdAt: new Date('2026-01-26T11:00:00'),
  },
  {
    id: '5',
    title: 'Prepare presentation slides',
    description: 'Create slides for client demo next week',
    priority: 'low',
    status: 'todo',
    estimatedTime: 90,
    createdAt: new Date('2026-01-24T16:00:00'),
  },
];

export const getTodaysNextTask = (): Task | null => {
  const todoTasks = mockTasks.filter(t => t.status === 'todo');
  return todoTasks.length > 0 ? todoTasks[0] : null;
};
