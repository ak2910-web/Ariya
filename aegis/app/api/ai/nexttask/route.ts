import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' }) : null;

const isAIAvailable = () => !!model;

/**
 * AI Next Task Suggestion
 * 
 * Analyzes user's pending tasks and intelligently suggests which one to tackle next
 * Provides calm, one-sentence reasoning
 */
export async function POST(req: Request) {
  try {
    if (!isAIAvailable()) {
      return NextResponse.json(
        { error: 'AI not configured' },
        { status: 503 }
      );
    }

    const { tasks, context } = await req.json();

    // Validate input
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json(
        { error: 'No tasks provided' },
        { status: 400 }
      );
    }

    // Build task summary for AI
    const taskList = tasks.map((t, i) => 
      `${i + 1}. "${t.title}" (${t.priority} priority${t.description ? ', ' + t.description : ''}${t.focusTime ? `, ${t.focusTime}min logged` : ''})`
    ).join('\n');

    const currentTime = new Date().toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });

    const prompt = `You are Jarvis, a calm AI assistant helping prioritize work.
Address the user as "Sir".

Current time: ${currentTime}
${context?.completedToday ? `Tasks completed today: ${context.completedToday}` : ''}
${context?.focusMinutesToday ? `Focus time today: ${context.focusMinutesToday} minutes` : ''}

Pending tasks:
${taskList}

Choose ONE task that makes the most sense to do next.
Consider:
- Urgency vs importance
- Time of day
- Mental energy required
- Momentum from what's already done

Respond in this exact format:
TASK: [exact task number, just the number]
REASON: [One calm sentence explaining why, under 20 words]

Example:
TASK: 2
REASON: High priority and ready to complete - good momentum builder.`;

    const response = await model!.generateContent(prompt);
    const result = await response.response;
    const content = result.text();
    
    // Parse response
    const taskMatch = content.match(/TASK:\s*(\d+)/);
    const reasonMatch = content.match(/REASON:\s*(.+)/);

    if (!taskMatch || !reasonMatch) {
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    const taskIndex = parseInt(taskMatch[1]) - 1;
    const reason = reasonMatch[1].trim();

    if (taskIndex < 0 || taskIndex >= tasks.length) {
      return NextResponse.json(
        { error: 'Invalid task index from AI' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      taskId: tasks[taskIndex].id,
      reason,
    });

  } catch (error: any) {
    console.error('Next task AI error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate suggestion' },
      { status: 500 }
    );
  }
}
