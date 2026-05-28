import { NextRequest, NextResponse } from 'next/server';
import type { AISceneData, AICreativeBrief } from '@/lib/cinematic-renderer';
import { getOpenAI } from '@/lib/openai';

export interface AIStoryAnalysis {
  title: string;
  hook: string;
  ctaText: string;
  scenes: AISceneData[];
  brief: AICreativeBrief;
  overallMood: string;
  viralScore: number;
  suggestedHashtags: string[];
}

// ── Smart fallback (only used when no OpenAI key or call fails) ────────────────

const FALLBACK_CHARACTERS: Record<string, string[]> = {
  COOKING: ['🍝', '✨', '🔥'], TRAVEL: ['✈️', '🌴', '☀️'], WEDDING: ['💍', '💕', '🥂'],
  PETS: ['🐾', '❤️', '✨'],   FITNESS: ['💪', '🔥', '⚡'],   BABY: ['👶', '💕', '🌟'],
  CAFE: ['☕', '🌿', '✨'],     LUXURY: ['👑', '💎', '✨'],    BIRTHDAY: ['🎂', '🎉', '🎁'],
  FASHION: ['👗', '✨', '💃'],  REAL_ESTATE: ['🏠', '✨', '🔑'], FESTIVAL: ['🎉', '🎊', '✨'],
  COUPLE: ['💑', '💕', '🌹'],  VLOG: ['🎬', '✨', '📸'],       FOOD_BUSINESS: ['🍔', '🔥', '😋'],
};

const FALLBACK_PALETTES: Record<string, AICreativeBrief['palette']> = {
  COOKING: { primary: '#ff8c42', secondary: '#ffd166', overlay: '#1a0a05', shadow: '#0a0503' },
  TRAVEL:  { primary: '#4ecdc4', secondary: '#ff6b6b', overlay: '#0a1a2a', shadow: '#020a14' },
  WEDDING: { primary: '#f7cad0', secondary: '#fae1dd', overlay: '#1a0a15', shadow: '#0a0408' },
  PETS:    { primary: '#ffd166', secondary: '#ef476f', overlay: '#1a0f05', shadow: '#0a0703' },
  FITNESS: { primary: '#00f5d4', secondary: '#9b5de5', overlay: '#001a14', shadow: '#000a08' },
  BABY:    { primary: '#fcd5ce', secondary: '#f8edeb', overlay: '#1a0f0f', shadow: '#0a0707' },
  LUXURY:  { primary: '#d4af37', secondary: '#bf9b30', overlay: '#1a1305', shadow: '#0a0703' },
  CAFE:    { primary: '#c69e6e', secondary: '#8b5a3c', overlay: '#1a0f08', shadow: '#0a0703' },
  DEFAULT: { primary: '#8b5cf6', secondary: '#ec4899', overlay: '#0a0518', shadow: '#04020a' },
};

const TRANSITIONS: AISceneData['transition'][] = ['dissolve', 'zoom-punch', 'slide-left', 'blur-out', 'light-leak', 'dissolve'];
const KB_STYLES: AISceneData['kenBurnsStyle'][] = ['zoom-in', 'pan-right', 'zoom-out', 'pan-up', 'zoom-in', 'pan-left'];
const LIGHTING: AISceneData['lightingEffect'][] = ['soft-glow', 'light-leak', 'sparkle-burst', 'lens-flare', 'color-flash'];

function buildFallbackAnalysis(count: number, category: string, mood: string): AIStoryAnalysis {
  const chars = FALLBACK_CHARACTERS[category] || ['✨', '💫', '⭐'];
  const palette = FALLBACK_PALETTES[category] || FALLBACK_PALETTES.DEFAULT;

  return {
    title: `My ${category.charAt(0) + category.slice(1).toLowerCase()} Story`,
    hook: `Wait until you see this ✨`,
    ctaText: 'Save this! 🔖',
    overallMood: mood,
    viralScore: 78,
    suggestedHashtags: [`#${category.toLowerCase()}`, '#reels', '#viral', '#trending', '#fyp'],
    brief: {
      palette,
      particles: { emojis: chars.slice(0, 2), behaviour: 'rise', density: 'medium', speed: 'medium' },
      visualStyle: 'cinematic-dark',
      creativeConcept: `${category.toLowerCase()} story with ${mood.toLowerCase()} mood`,
      musicVibe: 'cinematic',
    },
    scenes: Array.from({ length: count }, (_, i) => ({
      originalIndex: i,
      sceneTitle: `Scene ${i + 1} ${chars[i % chars.length]}`,
      narration: `Story moment ${i + 1}`,
      transition: TRANSITIONS[i % TRANSITIONS.length],
      storyBeat: (['intro', 'buildup', 'action', 'climax', 'reveal', 'outro'] as const)[Math.min(i, 5)],
      emotion: 'warm',
      focusPoint: 'center',
      kenBurnsStyle: KB_STYLES[i % KB_STYLES.length],
      characterEmojis: [chars[i % chars.length]],
      lightingEffect: LIGHTING[i % LIGHTING.length],
      effectColor: palette!.primary,
      textStyle: { fontSize: 'md', position: 'bottom', animation: 'slide-up', background: 'pill' },
      emojiAccent: i === 0 ? chars[0] : undefined,
    })),
  };
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: { images: string[]; category: string; mood: string; title?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { images, category, mood, title } = body;

  if (!images || images.length === 0) {
    return NextResponse.json({ error: 'No images provided' }, { status: 400 });
  }

  try {
    const openai = getOpenAI();
    const imagesToAnalyze = images.slice(0, 6);

    const imageContent = imagesToAnalyze.map((b64) => ({
      type: 'image_url' as const,
      image_url: { url: b64, detail: 'low' as const },
    }));

    const systemPrompt = `You are a world-class AI Creative Director for viral short-form video.
Your job is NOT to apply templates — your job is to look at the actual photos and IMAGINE the perfect reel.

You think like Spike Jonze meets MrBeast meets a Pixar animator. You see the photos as raw material
and design something genuinely creative, unexpected, and visually exciting.

For every reel you direct:
1. You IDENTIFY what's actually in each photo (subjects, mood, setting)
2. You INVENT a creative concept that fits — not a template, an actual idea
3. You CHOOSE specific colours (hex), emojis (as characters), lighting effects, text styles
4. You decide scene order, transitions, story arc to maximize emotional impact
5. Every reel you direct should feel DIFFERENT from every other reel — never formulaic

Reply with valid JSON only — no markdown, no prose, no code fences.`;

    const userPrompt = `Direct a vertical short-form reel from these ${imagesToAnalyze.length} photos.

User chose category: ${category}  (use as guidance, not as a rigid template)
User chose mood:     ${mood}      (interpret creatively — make it actually feel like this)
${title ? `User title: "${title}"` : ''}

Photos are indexed 0–${imagesToAnalyze.length - 1} in order shown.

Now look at each photo. What do you actually see? What story would these specific images tell
if a creative director got hold of them? Be specific. Be inventive. NO generic templates.

Return ONLY this JSON shape:

{
  "title": "Title that reflects what's actually in the photos",
  "hook": "Scroll-stopping first 2-second line (max 50 chars)",
  "ctaText": "Last-scene call to action",
  "overallMood": "${mood}",
  "viralScore": <integer 75-98>,
  "suggestedHashtags": ["#5","#to","#8","#trending","#tags"],

  "brief": {
    "creativeConcept": "<1-sentence description of the reel's creative direction — what makes this reel unique>",
    "visualStyle": "<one of: cinematic-dark | bright-airy | retro-warm | neon-pop | dreamy-pastel | documentary-natural | luxury-gold | high-energy>",
    "musicVibe": "<what kind of music — e.g. 'lo-fi cozy beats', 'epic orchestral', 'pop trap', 'acoustic indie folk'>",
    "palette": {
      "primary":   "#<hex>  — main accent colour pulled from what you see in the photos",
      "secondary": "#<hex>  — complementary accent",
      "overlay":   "#<hex>  — full-screen tint at low alpha, sets the mood",
      "shadow":    "#<hex>  — vignette shadow colour"
    },
    "particles": {
      "emojis":    ["<2-3 emojis that fit the content>"],
      "behaviour": "<rise|fall|drift|burst|orbit>",
      "density":   "<low|medium|high>",
      "speed":     "<slow|medium|fast>"
    }
  },

  "scenes": [
    {
      "originalIndex": <which photo, 0-based>,
      "sceneTitle":    "<text overlay describing what's literally in THIS photo (max 30 chars) + 1 emoji>",
      "narration":     "<1 conversational sentence for this scene's voiceover>",
      "transition":    "<dissolve|zoom-punch|slide-left|slide-up|blur-out|light-leak>",
      "storyBeat":     "<intro|buildup|action|climax|reveal|outro>",
      "emotion":       "<warm|exciting|satisfying|peaceful|joyful|dramatic|intimate>",
      "focusPoint":    "<center|top|bottom|left|right>",
      "kenBurnsStyle": "<zoom-in|zoom-out|pan-left|pan-right|pan-up|pan-down>",
      "characterEmojis":  ["<1-2 emojis that float across this scene>"],
      "lightingEffect":   "<none|light-leak|soft-glow|color-flash|sparkle-burst|lens-flare>",
      "effectColor":      "#<hex hue for the lighting effect>",
      "textStyle": {
        "fontSize":   "<sm|md|lg|xl>",
        "position":   "<top|middle|bottom>",
        "color":      "#<hex>",
        "background": "<none|pill|highlight>",
        "animation":  "<fade|slide-up|pop|typewriter|bounce>",
        "rotation":   <number, degrees, usually 0 but can tilt for energy>
      },
      "emojiAccent": "<single emoji to display BIG in scene centre — optional, only when it fits>"
    }
  ]
}

CREATIVE RULES — follow these:
- Don't repeat the same scene structure every reel. Vary text positions, colours, emojis per scene.
- Match colours to what you ACTUALLY SEE — golden food → warm gold palette; ocean photos → cyan-blue.
- Pick emojis that aren't obvious. A pasta reel doesn't have to use 🍝 — 🤌 or ✨ might hit harder.
- For high-energy scenes use rotation, pop animations, color-flash lighting.
- For emotional scenes use soft-glow, slow narration, intimate text style.
- Order scenes for best story arc — re-order if the photos arrive in the wrong sequence.
- Make scene 1 a HOOK — the most arresting image, biggest text, attention-grabbing.
- Make the final scene a CLIMAX with the CTA.
- Be specific. Be inventive. Never write "Scene 1" or "Story moment" — describe what's there.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: [{ type: 'text', text: userPrompt }, ...imageContent] },
      ],
      max_tokens: 2500,
      response_format: { type: 'json_object' },
      temperature: 0.9,   // ← high for creative variety
    });

    const raw = response.choices[0].message.content;
    if (!raw) throw new Error('Empty AI response');

    const analysis: AIStoryAnalysis = JSON.parse(raw);
    if (!analysis.scenes?.length) throw new Error('No scenes in AI response');

    // Sanitise scene indexes
    analysis.scenes = analysis.scenes
      .filter(s => typeof s.originalIndex === 'number')
      .map(s => ({ ...s, originalIndex: Math.max(0, Math.min(s.originalIndex, images.length - 1)) }));

    return NextResponse.json({ analysis, aiUsed: true });

  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[analyze-photos] Error:', errMsg);
    const fallback = buildFallbackAnalysis(images.length, category, mood);
    return NextResponse.json({
      analysis: fallback,
      aiUsed: false,
      fallback: true,
      _debug: process.env.NODE_ENV === 'development' ? errMsg : undefined,
    });
  }
}
