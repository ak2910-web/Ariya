import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client (only if API key is available)
const apiKey = process.env.GEMINI_API_KEY;

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' }) : null;

export const isAIAvailable = () => !!model;

export async function generateDailyInsight(data: {
  date: string;
  tasksCompleted: number;
  tasksAvoided: number;
  totalTasks: number;
  focusMinutes: number;
  sessionsCompleted: number;
  topTask?: string;
}): Promise<string> {
  if (!model) {
    throw new Error('Gemini API not configured');
  }

  const prompt = `You are a calm, intelligent AI assistant for a productivity app called Aegis.
Address the user as "Sir".

Summarize the user's day based on the data below.
Be honest, supportive, and concise.
Do not motivate excessively.
Do not shame.
Do not use emojis.

Data for ${data.date}:
- Tasks completed: ${data.tasksCompleted}
- Tasks avoided: ${data.tasksAvoided}
- Total tasks: ${data.totalTasks}
- Focus time: ${data.focusMinutes} minutes
- Focus sessions: ${data.sessionsCompleted}
${data.topTask ? `- Most time spent on: ${data.topTask}` : ''}

Output format (plain text, no markdown):
- 2–3 short sentences summarizing the day
- Then 2 bullet-point insights (use • character)
- Then one clear suggestion for tomorrow (start with "Tomorrow:")`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text() || 'Unable to generate insights at this time.';
}

export async function generateGuidance(data: {
  state: 'idle' | 'task_switch' | 'completed';
  timeIdleMinutes?: number;
  activeTask?: string | null;
  pendingTasks?: number;
}): Promise<string> {
  if (!model) {
    throw new Error('Gemini API not configured');
  }

  const prompt = `You are a Jarvis-style personal assistant for a productivity app.
Address the user as "Sir".

Context:
- User state: ${data.state}
${data.timeIdleMinutes ? `- Idle for: ${data.timeIdleMinutes} minutes` : ''}
${data.activeTask ? `- Active task: ${data.activeTask}` : '- No active task'}
${data.pendingTasks ? `- Pending tasks: ${data.pendingTasks}` : ''}

Gently guide the user to action.
You may ask one light, slightly playful question.
Keep it under 15 words.
Never sound robotic.
Do not use emojis.

Output: One short sentence only.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text() || 'Ready when you are, Sir.';
}

export async function generateNextAction(data: {
  tasks: Array<{
    title: string;
    priority: 'low' | 'medium' | 'high';
    estimated?: number;
  }>;
  timeAvailable?: number;
}): Promise<{ task: string; reason: string }> {
  if (!model) {
    throw new Error('Gemini API not configured');
  }

  const taskList = data.tasks
    .map((t, i) => `${i + 1}. "${t.title}" (${t.priority} priority, ~${t.estimated || 25}min)`)
    .join('\\n');

  const prompt = `You are an AI that selects the best next task for a productivity app.
Address the user as "Sir".

Available tasks:
${taskList}

${data.timeAvailable ? `Time available: ${data.timeAvailable} minutes` : ''}

Choose ONE task by number.
Explain why in one sentence.
Be practical.

Output format (plain text):
Task: <task number>
Reason: <one sentence>`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const content = response.text();
  
  const taskMatch = content.match(/Task:\\s*(\\d+)/);
  const reasonMatch = content.match(/Reason:\\s*(.+)/);
  
  const taskIndex = taskMatch ? parseInt(taskMatch[1]) - 1 : 0;
  const selectedTask = data.tasks[taskIndex]?.title || data.tasks[0]?.title;
  const reason = reasonMatch?.[1]?.trim() || 'This task appears to be the highest priority.';

  return { task: selectedTask, reason };
}
