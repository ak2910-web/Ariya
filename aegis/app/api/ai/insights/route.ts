import { NextRequest, NextResponse } from 'next/server';
import { generateDailyInsight, isAIAvailable } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    // Check if AI is available
    if (!isAIAvailable()) {
      return NextResponse.json(
        { error: 'OpenAI API not configured. Add OPENAI_API_KEY to .env.local' },
        { status: 503 }
      );
    }

    const data = await request.json();

    // Validate required fields
    if (!data.date || typeof data.tasksCompleted !== 'number') {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Generate insight
    const insight = await generateDailyInsight({
      date: data.date,
      tasksCompleted: data.tasksCompleted,
      tasksAvoided: data.tasksAvoided || 0,
      totalTasks: data.totalTasks,
      focusMinutes: data.focusMinutes,
      sessionsCompleted: data.sessionsCompleted,
      topTask: data.topTask,
    });

    return NextResponse.json({ insight });
  } catch (error: any) {
    console.error('AI Insights Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
