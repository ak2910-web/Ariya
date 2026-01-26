import { NextRequest, NextResponse } from 'next/server';
import { generateGuidance, isAIAvailable } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    // Check if AI is available
    if (!isAIAvailable()) {
      return NextResponse.json(
        { error: 'OpenAI API not configured' },
        { status: 503 }
      );
    }

    const data = await request.json();

    // Validate required fields
    if (!data.state) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Generate guidance
    const message = await generateGuidance({
      state: data.state,
      timeIdleMinutes: data.timeIdleMinutes,
      activeTask: data.activeTask,
      pendingTasks: data.pendingTasks,
    });

    return NextResponse.json({ message });
  } catch (error: any) {
    console.error('AI Guidance Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate guidance' },
      { status: 500 }
    );
  }
}
