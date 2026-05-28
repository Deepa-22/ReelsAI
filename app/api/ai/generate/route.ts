import { NextRequest, NextResponse } from 'next/server';
import { generateStoryScript, analyzeImage, calculateViralityScore } from '@/lib/openai';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { category, mood, imageUrls, duration } = body;

    if (!category || !mood) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let imageDescriptions: string[] = [];
    if (imageUrls && imageUrls.length > 0) {
      const analysisPromises = imageUrls.slice(0, 5).map((url: string) =>
        analyzeImage(url).catch(() => `${category} content photo`)
      );
      imageDescriptions = await Promise.all(analysisPromises);
    }

    const [script, viralityScore] = await Promise.all([
      generateStoryScript({
        category,
        mood,
        imageDescriptions,
        duration: duration || 30,
      }),
      calculateViralityScore({
        category,
        mood,
        duration: duration || 30,
        hasVoiceover: true,
        hasSubtitles: true,
        hasTrendingMusic: true,
      }),
    ]);

    return NextResponse.json({
      success: true,
      script,
      viralityScore,
    });
  } catch (error) {
    console.error('AI generate error:', error);
    return NextResponse.json(
      { error: 'AI generation failed. Please try again.' },
      { status: 500 }
    );
  }
}
