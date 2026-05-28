import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI } from '@/lib/openai';

export async function POST(req: NextRequest) {
  let body: { prompt: string; size?: '1024x1792' | '1792x1024' | '1024x1024' };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }); }

  const { prompt, size = '1024x1792' } = body;   // vertical default

  if (!prompt || prompt.trim().length < 10) {
    return NextResponse.json({ error: 'Prompt too short' }, { status: 400 });
  }

  try {
    const openai = getOpenAI();

    // Trim prompt to DALL-E 3 max length (4000 chars)
    const trimmedPrompt = prompt.slice(0, 3900);

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: trimmedPrompt,
      n: 1,
      size,
      quality: 'standard',      // 'standard' = $0.04, 'hd' = $0.08 per image
      style: 'vivid',           // vivid colours pop more for social
      response_format: 'b64_json',
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) throw new Error('No image returned');

    const dataUrl = `data:image/png;base64,${b64}`;
    return NextResponse.json({
      imageUrl: dataUrl,
      revisedPrompt: response.data?.[0]?.revised_prompt,
    });

  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[generate-image] Error:', errMsg);

    const isQuota = errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('billing');
    const isModeration = errMsg.includes('safety') || errMsg.includes('moderation') || errMsg.includes('400');

    return NextResponse.json({
      error: isQuota
        ? 'OpenAI quota exceeded — add credits to continue'
        : isModeration
          ? 'Image prompt was rejected by safety filter. Try rephrasing.'
          : 'Image generation failed. Please try again.',
      _debug: process.env.NODE_ENV === 'development' ? errMsg : undefined,
    }, { status: 500 });
  }
}
