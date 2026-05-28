import { NextRequest, NextResponse } from 'next/server';
import { generateVoiceover, VOICE_OPTIONS } from '@/lib/elevenlabs';
import { getSession } from '@/lib/auth';
import { generateVoiceoverScript } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { script, voiceId, mood, duration } = await req.json();

    if (!script) {
      return NextResponse.json({ error: 'Script is required' }, { status: 400 });
    }

    const optimizedScript = await generateVoiceoverScript(script, mood || 'cinematic', duration || 30);
    const selectedVoiceId = voiceId || VOICE_OPTIONS.RACHEL.id;

    const audioBuffer = await generateVoiceover({
      text: optimizedScript,
      voiceId: selectedVoiceId,
      stability: 0.5,
      similarityBoost: 0.75,
    });

    if (!audioBuffer) {
      return NextResponse.json({ error: 'Voiceover generation failed' }, { status: 500 });
    }

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Voiceover error:', error);
    return NextResponse.json({ error: 'Voiceover generation failed' }, { status: 500 });
  }
}
