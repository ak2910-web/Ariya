import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    // Validate text
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid text' },
        { status: 400 }
      );
    }
    
    // Check if ElevenLabs is configured
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;
    
    if (!apiKey || !voiceId) {
      return NextResponse.json(
        { error: 'ElevenLabs not configured' },
        { status: 503 }
      );
    }
    
    // Limit text length (safety)
    const limitedText = text.slice(0, 200);
    
    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: limitedText,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.65,        // Calm, controlled
            similarity_boost: 0.75, // Clear resemblance to voice
          },
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      return new NextResponse('Voice generation failed', { status: 500 });
    }
    
    // Return audio stream
    const audioBuffer = await response.arrayBuffer();
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('Voice API error:', error);
    return NextResponse.json(
      { error: error.message || 'Voice generation failed' },
      { status: 500 }
    );
  }
}
