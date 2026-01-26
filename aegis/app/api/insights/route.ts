import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { DailyStats, Task } from '@/lib/types';

// Create OpenAI client only if API key is available
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(req: NextRequest) {
  try {
    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Add OPENAI_API_KEY to .env.local' },
        { status: 503 }
      );
    }

    const { stats, tasks, date } = await req.json();

    // Build context from today's data
    const completedTasks = tasks.filter((t: Task) => t.status === 'completed');
    const avoidedTasks = tasks.filter((t: Task) => t.status === 'avoided');
    const pendingTasks = tasks.filter((t: Task) => t.status === 'pending');
    const activeTasks = tasks.filter((t: Task) => t.status === 'active');

    const prompt = `You are Aegis, an AI productivity assistant with a deep, philosophical understanding of human work patterns. Analyze today's productivity data and provide a thoughtful, narrative insight.

**Today's Data (${date}):**
- Tasks completed: ${stats.tasksCompleted}
- Tasks avoided: ${stats.tasksAvoided}
- Focus time: ${Math.floor(stats.totalFocusTime / 60)}h ${stats.totalFocusTime % 60}m
- Focus sessions: ${stats.sessionsCompleted}

**Completed Tasks:**
${completedTasks.length > 0 ? completedTasks.map((t: Task) => `- ${t.title} (${t.priority} priority)`).join('\n') : 'None'}

**Avoided Tasks:**
${avoidedTasks.length > 0 ? avoidedTasks.map((t: Task) => `- ${t.title} (${t.priority} priority)`).join('\n') : 'None'}

**Still Pending:**
${pendingTasks.length > 0 ? pendingTasks.map((t: Task) => `- ${t.title} (${t.priority} priority)`).join('\n') : 'None'}

**Active Tasks:**
${activeTasks.length > 0 ? activeTasks.map((t: Task) => `- ${t.title} (${t.priority} priority)`).join('\n') : 'None'}

Write a 3-4 paragraph narrative analysis that:
1. **Opens with a recognition** - Acknowledge what they accomplished or attempted today
2. **Identifies a pattern** - What does the data reveal about their work style, energy, or decision-making?
3. **Offers perspective** - Connect this to deeper productivity principles (momentum, friction, focus quality)
4. **Suggests tomorrow's strategy** - One specific, actionable recommendation based on today's patterns

Tone: Thoughtful, supportive, observant. Like a wise coach who sees more than just the numbers.
Keep it under 200 words. Use "you" to address the user directly.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are Aegis, an AI productivity assistant focused on deep pattern recognition and thoughtful guidance.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    const narrative = completion.choices[0]?.message?.content || 'Unable to generate insights at this time.';

    return NextResponse.json({ narrative });
  } catch (error: any) {
    console.error('Error generating AI insights:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
