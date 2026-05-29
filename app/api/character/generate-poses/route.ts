/**
 * POST /api/character/generate-poses
 *
 * Generates a batch of character poses via gpt-image-1 and saves them
 * permanently to /public/character/honest-hormones-girl/.
 *
 * This is a ONE-TIME operation per pose. Once generated, the PNGs sit on disk
 * and get reused by Story Mode forever — no more API calls for character images.
 *
 * Body shape:
 *   { poses: [{ filename: "pose-01-morning-tired", prompt: "..." }, ...] }
 *
 * Response:
 *   { results: [{ filename, path, success, error? }, ...] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI } from '@/lib/openai';
import fs from 'fs/promises';
import path from 'path';

interface PoseRequest {
  filename: string;
  prompt: string;
}

interface PoseResult {
  filename: string;
  path?: string;
  success: boolean;
  modelUsed?: string;
  error?: string;
}

const MODEL_CHAIN = ['gpt-image-1', 'dall-e-3', 'dall-e-2'];
const SIZE_BY_MODEL: Record<string, string> = {
  'gpt-image-1': '1024x1536',
  'dall-e-3':    '1024x1792',
  'dall-e-2':    '1024x1024',
};

async function generateOne(openai: ReturnType<typeof getOpenAI>, prompt: string): Promise<{ b64: string; model: string }> {
  let lastError = '';
  for (const model of MODEL_CHAIN) {
    try {
      const resp = await openai.images.generate({
        model,
        prompt: prompt.slice(0, model === 'dall-e-2' ? 1000 : 3900),
        n: 1,
        size: SIZE_BY_MODEL[model] as '1024x1024' | '1024x1536' | '1024x1792',
      });
      const d = resp.data?.[0];
      if (d?.b64_json) return { b64: d.b64_json, model };
      if (d?.url) {
        const imgRes = await fetch(d.url);
        const buf = Buffer.from(await imgRes.arrayBuffer());
        return { b64: buf.toString('base64'), model };
      }
      throw new Error('No image data in response');
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      // hard stop on quota
      if (/quota|insufficient|billing/i.test(lastError)) throw err;
    }
  }
  throw new Error(`All models failed: ${lastError}`);
}

export async function POST(req: NextRequest) {
  let body: { poses: PoseRequest[] };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }); }

  if (!body.poses || !Array.isArray(body.poses) || body.poses.length === 0) {
    return NextResponse.json({ error: 'No poses provided' }, { status: 400 });
  }

  const openai = getOpenAI();
  const outDir = path.join(process.cwd(), 'public', 'character', 'honest-hormones-girl');
  await fs.mkdir(outDir, { recursive: true });

  // Generate sequentially to avoid hitting per-second rate limits
  const results: PoseResult[] = [];
  for (const pose of body.poses) {
    try {
      console.log(`[generate-poses] Generating ${pose.filename}...`);
      const { b64, model } = await generateOne(openai, pose.prompt);
      const buf = Buffer.from(b64, 'base64');
      const filename = `${pose.filename}.png`;
      const filepath = path.join(outDir, filename);
      await fs.writeFile(filepath, buf);
      results.push({
        filename: pose.filename,
        path: `/character/honest-hormones-girl/${filename}`,
        success: true,
        modelUsed: model,
      });
      console.log(`[generate-poses] ✓ ${pose.filename} saved (${model})`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`[generate-poses] ✗ ${pose.filename}: ${errMsg}`);
      results.push({
        filename: pose.filename,
        success: false,
        error: errMsg.slice(0, 200),
      });
    }
  }

  return NextResponse.json({ results });
}
