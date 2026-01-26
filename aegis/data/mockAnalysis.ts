export interface DailySummary {
  date: string;
  tasksCompleted: number;
  tasksPlanned: number;
  focusTime: number; // in minutes
  distractions: number;
  productivityScore: number; // 0-100
}

export interface TaskOutcome {
  taskTitle: string;
  planned: number;
  actual: number;
  difference: number;
  status: 'on-time' | 'overtime' | 'undertime';
}

export interface FocusFlowData {
  time: string;
  focus: number; // 0-100
  breaks: number;
}

export const mockDailySummary: DailySummary = {
  date: '2026-01-26',
  tasksCompleted: 8,
  tasksPlanned: 12,
  focusTime: 245,
  distractions: 7,
  productivityScore: 82,
};

export const mockTaskOutcomes: TaskOutcome[] = [
  {
    taskTitle: 'Review quarterly reports',
    planned: 60,
    actual: 55,
    difference: -5,
    status: 'undertime',
  },
  {
    taskTitle: 'Team sync meeting',
    planned: 30,
    actual: 35,
    difference: 5,
    status: 'overtime',
  },
  {
    taskTitle: 'Code review',
    planned: 30,
    actual: 30,
    difference: 0,
    status: 'on-time',
  },
  {
    taskTitle: 'Update documentation',
    planned: 45,
    actual: 60,
    difference: 15,
    status: 'overtime',
  },
];

export const mockFocusFlowData: FocusFlowData[] = [
  { time: '09:00', focus: 65, breaks: 0 },
  { time: '10:00', focus: 85, breaks: 0 },
  { time: '11:00', focus: 90, breaks: 1 },
  { time: '12:00', focus: 75, breaks: 2 },
  { time: '13:00', focus: 45, breaks: 3 },
  { time: '14:00', focus: 70, breaks: 1 },
  { time: '15:00', focus: 88, breaks: 0 },
  { time: '16:00', focus: 92, breaks: 0 },
  { time: '17:00', focus: 80, breaks: 1 },
];

export const mockAIInsight = `Good evening, Sir. Your focus performance today was impressive. You maintained deep work for 4 consecutive hours in the afternoon session, which is 23% above your weekly average.

However, I noticed 7 context switches during the morning block. The primary causes were notification interruptions and unscheduled communications.

Recommendation: Tomorrow, consider enabling Do Not Disturb mode during your first work block. Based on your patterns, you achieve peak cognitive performance between 9-11 AM.`;

export const mockTomorrowFix = `Start with code review tasks. Your analysis shows you perform best on technical work in the morning hours. Schedule communication-heavy tasks after 2 PM.`;
