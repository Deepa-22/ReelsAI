import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI } from '@/lib/openai';

// Try models in order of quality (best → fallback). Whichever your account
// has access to wins. Different models support different sizes.
const MODEL_CHAIN: { model: string; size: string; maxPromptLen: number }[] = [
  { model: 'gpt-image-1', size: '1024x1536', maxPromptLen: 3900 }, // newest, portrait
  { model: 'dall-e-3',    size: '1024x1792', maxPromptLen: 3900 }, // best classic
  { model: 'dall-e-2',    size: '1024x1024', maxPromptLen: 1000 }, // works everywhere, square
];

export async function POST(req: NextRequest) {
  let body: { prompt: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }); }

  const { prompt } = body;
  if (!prompt || prompt.trim().length < 10) {
    return NextResponse.json({ error: 'Prompt too short' }, { status: 400 });
  }

  const openai = getOpenAI();
  const errors: string[] = [];

  for (const cfg of MODEL_CHAIN) {
    try {
      const trimmedPrompt = prompt.slice(0, cfg.maxPromptLen);

      // Minimal params — only what every model accepts
      const response = await openai.images.generate({
        model: cfg.model,
        prompt: trimmedPrompt,
        n: 1,
        size: cfg.size as '1024x1024' | '1024x1536' | '1024x1792' | '512x512' | '256x256',
      });

      const data = response.data?.[0];
      if (!data) throw new Error('Empty data array');

      let dataUrl: string;
      if (data.b64_json) {
        dataUrl = `data:image/png;base64,${data.b64_json}`;
      } else if (data.url) {
        const imgRes = await fetch(data.url);
        if (!imgRes.ok) throw new Error(`fetch ${imgRes.status}`);
        const buf = Buffer.from(await imgRes.arrayBuffer());
        dataUrl = `data:image/png;base64,${buf.toString('base64')}`;
      } else {
        throw new Error('No image data');
      }

      return NextResponse.json({
        imageUrl: dataUrl,
        modelUsed: cfg.model,
        revisedPrompt: data.revised_prompt,
      });

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${cfg.model}: ${msg.slice(0, 90)}`);
      console.warn(`[generate-image] ${cfg.model} failed — trying next:`, msg.slice(0, 120));

      // Hard stops — don't keep trying for these
      if (/quota|insufficient_quota|billing/i.test(msg)) {
        return NextResponse.json({
          error: 'OpenAI quota exceeded — add credits to continue',
          _debug: msg,
        }, { status: 500 });
      }
      if (/safety|content_policy|content policy/i.test(msg)) {
        return NextResponse.json({
          error: 'Image prompt blocked by safety filter. Try a softer description.',
          _debug: msg,
        }, { status: 500 });
      }
      // Otherwise — try next model
    }
  }

  // All models failed
  console.error('[generate-image] All models failed:', errors);
  return NextResponse.json({
    error: 'No supported image model on your account. Try verifying your phone number at platform.openai.com.',
    _debug: errors.join(' | '),
  }, { status: 500 });
}
