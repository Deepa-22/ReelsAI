/**
 * Replicate Image-to-Video Generation
 * Uses Stable Video Diffusion to turn still photos into real AI-generated video clips
 */

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_KEY;
const REPLICATE_API = 'https://api.replicate.com/v1';

export interface ClipJob {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output: string[] | null;
  error: string | null;
  urls: { get: string };
}

export interface GenerateClipOptions {
  imageUrl: string;        // public URL or base64 data URL
  motionBucketId?: number; // 1–255, higher = more motion (default 127)
  fps?: number;            // frames per second (default 7)
  frames?: number;         // number of frames (14 = 2s, 25 = 3.5s)
  condAug?: number;        // conditioning augmentation 0–1 (default 0.02)
  decodeChunkSize?: number;
}

/**
 * Start an async image-to-video generation job on Replicate.
 * Returns a prediction ID — poll with getClipStatus() until succeeded.
 */
export async function startClipGeneration(opts: GenerateClipOptions): Promise<ClipJob> {
  if (!REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_KEY is not set');
  }

  const response = await fetch(`${REPLICATE_API}/models/stability-ai/stable-video-diffusion/predictions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
      Prefer: 'wait=5',   // wait up to 5s before returning (reduces polling)
    },
    body: JSON.stringify({
      input: {
        input_image: opts.imageUrl,
        video_length: opts.frames ?? 14,       // 14 frames ≈ 2 seconds
        sizing_strategy: 'maintain_aspect_ratio',
        frames_per_second: opts.fps ?? 7,
        motion_bucket_id: opts.motionBucketId ?? 127,
        cond_aug: opts.condAug ?? 0.02,
        decoding_t: opts.decodeChunkSize ?? 7,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Replicate API error ${response.status}: ${err}`);
  }

  return response.json() as Promise<ClipJob>;
}

/**
 * Poll a Replicate prediction until it completes.
 * Calls onProgress(pct) with 0-100 as it progresses.
 */
export async function waitForClip(
  predictionId: string,
  onProgress?: (pct: number) => void,
  timeoutMs = 120_000
): Promise<string> {
  if (!REPLICATE_API_TOKEN) throw new Error('REPLICATE_API_KEY is not set');

  const start = Date.now();
  let attempt = 0;

  while (Date.now() - start < timeoutMs) {
    const res = await fetch(`${REPLICATE_API}/predictions/${predictionId}`, {
      headers: { Authorization: `Bearer ${REPLICATE_API_TOKEN}` },
    });
    const job: ClipJob = await res.json();

    if (job.status === 'succeeded' && job.output?.[0]) {
      onProgress?.(100);
      return job.output[0];
    }

    if (job.status === 'failed' || job.status === 'canceled') {
      throw new Error(`Clip generation ${job.status}: ${job.error || 'unknown error'}`);
    }

    // Estimate progress from elapsed time (SVD typically takes 25-60s)
    const elapsed = Date.now() - start;
    const estimatedTotal = 45_000; // 45s typical
    onProgress?.(Math.min(90, Math.round((elapsed / estimatedTotal) * 90)));

    // Exponential backoff: 2s, 3s, 4s, 5s, 5s, 5s...
    const wait = Math.min(5000, 2000 + attempt * 1000);
    await new Promise((r) => setTimeout(r, wait));
    attempt++;
  }

  throw new Error('Clip generation timed out after 2 minutes');
}

/**
 * High-level helper: start + wait for a clip.
 * Returns the video URL from Replicate's CDN.
 */
export async function generateVideoClip(
  opts: GenerateClipOptions,
  onProgress?: (pct: number) => void
): Promise<string> {
  onProgress?.(0);
  const job = await startClipGeneration(opts);
  onProgress?.(5);

  if (job.status === 'succeeded' && job.output?.[0]) {
    onProgress?.(100);
    return job.output[0];
  }

  return waitForClip(job.id, (p) => onProgress?.(5 + p * 0.95), 120_000);
}

/**
 * Build a scene-specific motion prompt for better results.
 * Gives Replicate context about what kind of motion to generate.
 */
export function buildMotionPrompt(category: string, sceneTitle: string, storyBeat: string): {
  motionBucketId: number;
  fps: number;
  frames: number;
} {
  // Map story beats to motion intensity
  const motionMap: Record<string, number> = {
    intro:    90,   // gentle reveal
    buildup:  110,  // increasing energy
    action:   145,  // active motion (boiling, kneading, moving)
    climax:   160,  // peak energy
    reveal:   80,   // slow reveal for hero shot
    outro:    70,   // slow, peaceful end
  };

  // Category overrides
  const categoryMotion: Record<string, number> = {
    COOKING:  130,  // active kitchen energy
    FITNESS:  155,  // high energy movement
    TRAVEL:   100,  // smooth cinematic pans
    WEDDING:   75,  // soft, emotional
    BABY:      80,  // gentle, slow
    CAFE:      90,  // calm ambient
    LUXURY:    70,  // slow, elegant
  };

  const base = motionMap[storyBeat] ?? 120;
  const catBoost = categoryMotion[category] ? (categoryMotion[category] - 127) / 4 : 0;
  const motionBucketId = Math.max(50, Math.min(200, Math.round(base + catBoost)));

  // Action scenes get more frames = longer clip
  const isHighAction = ['action', 'climax'].includes(storyBeat);
  const frames = isHighAction ? 25 : 14;
  const fps = isHighAction ? 8 : 7;

  return { motionBucketId, fps, frames };
}
