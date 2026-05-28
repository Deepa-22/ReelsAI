import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI } from '@/lib/openai';

export interface AIScene {
  originalIndex: number;
  sceneTitle: string;       // Short label shown on screen  e.g. "Hand-rolled pasta 🍝"
  narration: string;        // What the voiceover says for this scene
  transition: 'dissolve' | 'zoom-punch' | 'slide-left' | 'slide-up' | 'blur-out' | 'light-leak';
  storyBeat: 'intro' | 'buildup' | 'action' | 'climax' | 'reveal' | 'outro';
  emotion: string;          // e.g. "warm", "exciting", "satisfying"
  focusPoint: 'center' | 'top' | 'bottom' | 'left' | 'right'; // where to focus the Ken Burns
  kenBurnsStyle: 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'pan-up' | 'pan-down';
}

export interface AIStoryAnalysis {
  title: string;
  hook: string;              // First 3-second attention grabber
  ctaText: string;           // Call to action for last scene
  scenes: AIScene[];         // Re-ordered and annotated scenes
  overallMood: string;
  viralScore: number;        // 0–100
  suggestedHashtags: string[];
  colorGradeHint: string;    // e.g. "warm golden tones" for cooking
}

export async function POST(req: NextRequest) {
  try {
    const { images, category, mood, title } = await req.json() as {
      images: string[];   // base64 data URLs
      category: string;
      mood: string;
      title?: string;
    };

    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    const openai = getOpenAI();

    // Build vision content: up to 8 images (cost/latency balance)
    const imagesToAnalyze = images.slice(0, 8);

    const imageContent = imagesToAnalyze.map((b64, i) => ({
      type: 'image_url' as const,
      image_url: {
        url: b64,
        detail: 'low' as const,   // 'low' = fast + cheap, still enough to understand content
      },
    }));

    const systemPrompt = `You are an expert AI video director and social media storytelling specialist.
Your job is to analyze a set of photos and create a compelling cinematic story structure for a vertical reel.
You have deep knowledge of what makes content go viral on Instagram Reels and TikTok.
Always respond with valid JSON only — no markdown, no explanation.`;

    const userPrompt = `Analyze these ${imagesToAnalyze.length} photos for a ${category} content reel with ${mood} mood.
${title ? `Project title: "${title}"` : ''}

For each photo (indexed 0 to ${imagesToAnalyze.length - 1}), determine:
- What is actually IN the photo (be specific, not generic)
- What story beat it represents
- The best position in the story sequence

Then create a complete cinematic story structure.

Return ONLY this exact JSON structure (no markdown):
{
  "title": "Compelling reel title based on what you see",
  "hook": "Viral attention-grabbing opening line (max 60 chars, make it emotional/curiosity-driven)",
  "ctaText": "Call to action for the last scene (e.g. 'Recipe in bio 👇', 'Save this! 🔖')",
  "overallMood": "${mood}",
  "viralScore": <number 70-98 based on content potential>,
  "suggestedHashtags": ["#relevant", "#trending", "#hashtags", "<8 total"],
  "colorGradeHint": "specific colour grading description based on the content",
  "scenes": [
    {
      "originalIndex": <0-based index of which uploaded photo this is>,
      "sceneTitle": "<Specific text overlay for THIS photo, max 35 chars, with relevant emoji>",
      "narration": "<What the voiceover says for this scene, 1-2 sentences, conversational>",
      "transition": "<one of: dissolve | zoom-punch | slide-left | slide-up | blur-out | light-leak>",
      "storyBeat": "<one of: intro | buildup | action | climax | reveal | outro>",
      "emotion": "<single emotion word: warm|exciting|satisfying|peaceful|joyful|dramatic|intimate>",
      "focusPoint": "<one of: center | top | bottom | left | right>",
      "kenBurnsStyle": "<one of: zoom-in | zoom-out | pan-left | pan-right | pan-up | pan-down>"
    }
  ]
}

IMPORTANT RULES:
- "scenes" array must be ordered as the story should play (re-order photos for best narrative)
- "originalIndex" tells us which uploaded photo to use for each scene
- sceneTitle must describe what's ACTUALLY IN the photo, not generic category labels
- For cooking: start with ingredients or raw prep, end with the finished dish
- For travel: start with arrival/landscape, end with most beautiful moment
- For pets: start with a cute candid, build to most expressive/funny moment
- For weddings: flow from details → ceremony → emotion → celebration
- Make the hook create FOMO or curiosity — something they can't scroll past
- kenBurnsStyle should match what would look best on that specific photo type`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: userPrompt },
            ...imageContent,
          ],
        },
      ],
      max_tokens: 1500,
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('Empty response from AI');

    const analysis: AIStoryAnalysis = JSON.parse(content);

    // Validate and sanitise
    if (!analysis.scenes || analysis.scenes.length === 0) {
      throw new Error('AI returned no scenes');
    }

    // Ensure all originalIndex values are valid
    analysis.scenes = analysis.scenes.filter(
      s => typeof s.originalIndex === 'number' && s.originalIndex < images.length
    );

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error('Photo analysis error:', err);

    // Graceful fallback — basic structure without AI
    const fallback = buildFallbackAnalysis(
      (await req.json().catch(() => ({ images: [], category: 'OTHER', mood: 'CINEMATIC' }))).images?.length || 1,
      'OTHER',
      'CINEMATIC'
    );
    return NextResponse.json({ analysis: fallback, fallback: true });
  }
}

function buildFallbackAnalysis(count: number, category: string, mood: string): AIStoryAnalysis {
  const beats: AIScene['storyBeat'][] = ['intro', 'buildup', 'action', 'climax', 'reveal', 'outro'];
  const transitions: AIScene['transition'][] = ['dissolve', 'zoom-punch', 'slide-left', 'blur-out', 'light-leak', 'dissolve'];
  return {
    title: 'My Story',
    hook: 'You have to see how this turned out ✨',
    ctaText: 'Save this! 🔖',
    overallMood: mood,
    viralScore: 78,
    suggestedHashtags: ['#reels', '#viral', '#trending'],
    colorGradeHint: 'cinematic',
    scenes: Array.from({ length: count }, (_, i) => ({
      originalIndex: i,
      sceneTitle: `Scene ${i + 1} ✨`,
      narration: 'Watch how this unfolds...',
      transition: transitions[i % transitions.length],
      storyBeat: beats[Math.min(i, beats.length - 1)],
      emotion: 'warm',
      focusPoint: 'center' as const,
      kenBurnsStyle: 'zoom-in' as const,
    })),
  };
}
