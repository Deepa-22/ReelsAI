import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI } from '@/lib/openai';
import type { AICreativeBrief } from '@/lib/cinematic-renderer';

export interface StoryScene {
  index: number;
  title: string;            // Short scene label (text overlay)
  description: string;      // What's happening — for the user to read
  imagePrompt: string;      // Full DALL-E prompt with consistent character + style baked in
  narration: string;        // What the voice reads aloud (1-2 sentences)
  emoji: string;            // Accent emoji
  textStyle?: 'top' | 'bottom' | 'middle';
}

export interface StoryPlan {
  title: string;
  hook: string;             // Scroll-stopping opener
  ctaText: string;          // Last-scene call to action
  character: string;        // The shared character description (consistent across all scenes)
  styleGuide: string;       // The shared visual style description
  brief: AICreativeBrief;   // Existing creative brief (palette, particles, etc.)
  scenes: StoryScene[];
  hashtags: string[];
  viralScore: number;
}

const VISUAL_STYLES: Record<string, string> = {
  illustrated: 'soft modern flat illustration, warm pastel palette, smooth shapes, 2D editorial style, hand-drawn feel, no text in image, no captions',
  photographic: 'cinematic photograph, shallow depth of field, soft warm lighting, 35mm lens look, photorealistic, no text in image',
  anime: 'modern anime style, soft shading, expressive eyes, studio Ghibli inspired, vibrant but warm palette, no text in image',
  watercolor: 'soft watercolor painting style, gentle brush strokes, dreamy pastel tones, organic edges, artistic, no text in image',
  pixar: 'Pixar 3D animation style, soft volumetric lighting, expressive character, warm cinematic palette, no text in image',
  minimal: 'minimal flat illustration, single accent colour, clean geometric shapes, lots of negative space, editorial poster style, no text in image',
};

export async function POST(req: NextRequest) {
  let body: {
    storyline: string;
    sceneCount?: number;
    style?: keyof typeof VISUAL_STYLES;
    mood?: string;
  };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }); }

  const { storyline, sceneCount = 6, style = 'illustrated', mood = 'EMOTIONAL' } = body;

  if (!storyline || storyline.trim().length < 5) {
    return NextResponse.json({ error: 'Tell me your story (at least a few words)' }, { status: 400 });
  }

  const styleDescription = VISUAL_STYLES[style] || VISUAL_STYLES.illustrated;

  try {
    const openai = getOpenAI();

    const systemPrompt = `You are an Oscar-winning visual storyteller and Pixar-level creative director.
Your job is to transform a user's storyline into a complete cinematic short-form video plan.

CRITICAL RULES for visual consistency:
1. You must define ONE character with very specific details (age, hair, clothing colour, signature feature).
   That EXACT character description will be injected into every image generation prompt.
2. You must define ONE visual style that's followed in every scene.
3. Each scene's imagePrompt must START with: "[STYLE]. [CHARACTER]. [SCENE]."
   This is how we keep the character looking consistent.
4. NO TEXT, NO CAPTIONS, NO WORDS inside any image — text is added on top later.
5. Vertical 9:16 framing always (mention "vertical portrait composition" in prompts).

You also design the creative brief: hex palette, particle emojis, visual style label, music vibe.

Respond with valid JSON only — no markdown, no code fences.`;

    const userPrompt = `Storyline from user:
"""
${storyline.trim()}
"""

Build a ${sceneCount}-scene cinematic short-form reel from this story.
Target mood: ${mood}
Visual style: ${style} (${styleDescription})

Return ONLY this JSON shape:

{
  "title": "Compelling short title for the reel",
  "hook": "First 2-second viral hook line (max 60 chars). Make it stop the scroll.",
  "ctaText": "Last-scene call to action (e.g. 'Follow for more 💕')",
  "viralScore": <integer 80-97>,
  "hashtags": ["#5", "#to", "#8", "#hashtags"],

  "character": "<ULTRA-DETAILED description of the ONE character in the story. Age, gender, ethnicity-neutral or specific, hair colour and length, eye expression, signature outfit colour, body type. This exact string will be inserted into EVERY image prompt to keep visual consistency. Be very specific.>",

  "styleGuide": "${styleDescription}",

  "brief": {
    "creativeConcept": "<1-sentence creative direction for this reel>",
    "visualStyle": "<one of: cinematic-dark | bright-airy | retro-warm | neon-pop | dreamy-pastel | documentary-natural | luxury-gold | high-energy>",
    "musicVibe": "<music style description>",
    "palette": {
      "primary":   "#<hex matching the emotional tone>",
      "secondary": "#<hex complementary>",
      "overlay":   "#<hex dark background tint>",
      "shadow":    "#<hex deep shadow>"
    },
    "particles": {
      "emojis":    ["<2-3 thematic emojis>"],
      "behaviour": "<rise|fall|drift|burst|orbit>",
      "density":   "<low|medium|high>",
      "speed":     "<slow|medium|fast>"
    }
  },

  "scenes": [
    {
      "index": <0-based>,
      "title": "<Short on-screen text label for this scene, max 30 chars, with 1 emoji>",
      "description": "<1-sentence human-readable summary of what happens in this scene>",
      "imagePrompt": "<COMPLETE DALL-E 3 prompt. Format: '${styleDescription}. [CHARACTER STRING]. [SCENE ACTION + EMOTION + SETTING + LIGHTING]. Vertical portrait composition, 9:16 aspect ratio.'>",
      "narration": "<1-2 conversational sentences for voice narration of THIS scene>",
      "emoji": "<single emoji that captures this scene's emotion>",
      "textStyle": "<top|middle|bottom>"
    }
  ]
}

STORYTELLING RULES:
- Open with a HOOK scene — most striking visual.
- Middle scenes BUILD emotion progressively.
- Close with REVEAL or transformation + CTA.
- For health/journey stories: arc from struggle → action → progress → strength.
- For travel stories: arrival → exploring → discovery → magic moment.
- For personal/emotional: vulnerable opening → action taken → growth → message.
- Make the narration sound HUMAN — not corporate, not robotic.
- Each scene must visually progress the story, not repeat.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      max_tokens: 3000,
      response_format: { type: 'json_object' },
      temperature: 0.85,
    });

    const raw = response.choices[0].message.content;
    if (!raw) throw new Error('Empty AI response');

    const plan: StoryPlan = JSON.parse(raw);
    if (!plan.scenes?.length) throw new Error('No scenes returned');

    // Reinforce the character + style in every prompt (in case AI forgot)
    plan.scenes = plan.scenes.map((s, i) => ({
      ...s,
      index: i,
      imagePrompt: ensureCharacterInPrompt(s.imagePrompt, plan.character, plan.styleGuide),
    }));

    return NextResponse.json({ plan, aiUsed: true });

  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[generate-story] Error:', errMsg);
    return NextResponse.json({
      error: errMsg.includes('429') || errMsg.includes('quota')
        ? 'OpenAI quota exceeded — add credits at platform.openai.com/account/billing'
        : 'Story generation failed. Please try again.',
      _debug: process.env.NODE_ENV === 'development' ? errMsg : undefined,
    }, { status: 500 });
  }
}

/** Make sure the imagePrompt contains the character + style strings */
function ensureCharacterInPrompt(prompt: string, character: string, style: string): string {
  const charLowered = character.toLowerCase().slice(0, 30);
  if (!prompt.toLowerCase().includes(charLowered)) {
    prompt = `${style}. ${character}. ${prompt}`;
  }
  if (!prompt.includes('vertical') && !prompt.includes('9:16') && !prompt.includes('portrait')) {
    prompt = `${prompt} Vertical portrait composition, 9:16 aspect ratio.`;
  }
  if (!prompt.toLowerCase().includes('no text')) {
    prompt = `${prompt} No text, no captions, no words.`;
  }
  return prompt;
}
