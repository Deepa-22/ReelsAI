import { NextRequest, NextResponse } from 'next/server';
import type { AISceneData } from '@/lib/cinematic-renderer';
import { getOpenAI } from '@/lib/openai';

export interface AIStoryAnalysis {
  title: string;
  hook: string;
  ctaText: string;
  scenes: AISceneData[];
  overallMood: string;
  viralScore: number;
  suggestedHashtags: string[];
  colorGradeHint: string;
}

// ── Smart fallbacks per category ────────────────────────────────────────────

const CATEGORY_DEFAULTS: Record<string, {
  beats: string[];
  hooks: string[];
  cta: string;
  hashtags: string[];
}> = {
  COOKING: {
    beats: ['Fresh ingredients 🥚', 'Prepping the base 🔪', 'The magic begins 🔥', 'Almost ready ✨', 'The final reveal 🍽️'],
    hooks: ['You have to try this recipe 🍝✨', 'I made this from scratch and wow 😍', 'The secret ingredient changes everything 🤫'],
    cta: 'Recipe in bio 👇',
    hashtags: ['#cooking', '#homemade', '#recipe', '#foodie', '#reels'],
  },
  TRAVEL: {
    beats: ['The journey begins ✈️', 'First impressions 👀', 'Hidden gems 💎', 'Golden hour 🌅', 'Memories forever 🌍'],
    hooks: ['This place doesn\'t look real 😱', 'You need to visit this ASAP ✈️', 'The most beautiful place I\'ve ever seen 🌍'],
    cta: 'Save for your next trip 🗺️',
    hashtags: ['#travel', '#wanderlust', '#travelvlog', '#explore', '#reels'],
  },
  WEDDING: {
    beats: ['The little details 💐', 'Getting ready ✨', 'The big moment 💍', 'Pure emotion 😭', 'Forever begins 💑'],
    hooks: ['The most beautiful day of our lives 💒', 'I cried watching this back 😭', 'This is what forever looks like 💍'],
    cta: 'Tag your person 💕',
    hashtags: ['#wedding', '#bride', '#weddingday', '#love', '#reels'],
  },
  PETS: {
    beats: ['Meet the star 🐾', 'Playtime begins 🎾', 'Too cute 🥹', 'That face tho 😂', 'Pure love ❤️'],
    hooks: ['This little one owns my whole heart 🐾', 'The way they look at me 🥹😭', 'I cannot with how cute this is 😍'],
    cta: 'Follow for daily cuteness 🐾',
    hashtags: ['#pets', '#dogsofinstagram', '#catsofinstagram', '#cutepets', '#reels'],
  },
  FITNESS: {
    beats: ['The grind starts 💪', 'Push through 🔥', 'No limits ⚡', 'Feel the burn 🏋️', 'Results speak 🏆'],
    hooks: ['The transformation you didn\'t see coming 💪', 'This workout changed my body 🔥', 'No more excuses after this ⚡'],
    cta: 'Save this workout 💪',
    hashtags: ['#fitness', '#workout', '#gym', '#fitnessmotivation', '#reels'],
  },
  BABY: {
    beats: ['Tiny moments 👶', 'First discoveries 🌟', 'Pure joy 😍', 'Milestone achieved ✨', 'Forever in my heart 💕'],
    hooks: ['They grow up too fast 😭💕', 'This moment I never want to forget 👶✨', 'The cutest human alive, fight me 😍'],
    cta: 'Save this forever 💕',
    hashtags: ['#baby', '#momlife', '#newborn', '#babymilestone', '#reels'],
  },
  CAFE: {
    beats: ['Good morning vibes ☕', 'The craft ✨', 'Details matter 🌿', 'Perfect cup 😍', 'Come visit us 📍'],
    hooks: ['The vibe in here hits different ☕✨', 'Your new favourite spot 📍', 'This is what mornings should feel like ☀️'],
    cta: 'Visit us this week 📍',
    hashtags: ['#cafe', '#coffee', '#coffeeshop', '#barista', '#reels'],
  },
  LUXURY: {
    beats: ['The arrival ✨', 'Every detail 👑', 'The experience 🥂', 'Pure indulgence 💎', 'This is living 🌟'],
    hooks: ['This is what luxury really looks like ✨', 'Treating myself and I deserve it 👑', 'The details here are insane 💎'],
    cta: 'Save for your dream trip 💎',
    hashtags: ['#luxury', '#lifestyle', '#travel', '#luxurytravel', '#reels'],
  },
  DEFAULT: {
    beats: ['The beginning ✨', 'Building up 🔥', 'The key moment 💫', 'The reveal 🌟', 'That\'s a wrap ❤️'],
    hooks: ['You have to see how this turned out ✨', 'I can\'t believe this came together 🔥', 'Wait for the ending 😍'],
    cta: 'Save this! 🔖',
    hashtags: ['#reels', '#viral', '#trending', '#fyp'],
  },
};

const TRANSITIONS: AISceneData['transition'][] = ['dissolve', 'zoom-punch', 'slide-left', 'blur-out', 'light-leak', 'dissolve'];
const KB_STYLES: AISceneData['kenBurnsStyle'][] = ['zoom-in', 'pan-right', 'zoom-out', 'pan-up', 'zoom-in', 'pan-left'];

function buildFallbackAnalysis(count: number, category: string, mood: string): AIStoryAnalysis {
  const def = CATEGORY_DEFAULTS[category] || CATEGORY_DEFAULTS.DEFAULT;
  const hook = def.hooks[Math.floor(Math.random() * def.hooks.length)];
  const beats = def.beats;

  return {
    title: `My ${category.charAt(0) + category.slice(1).toLowerCase()} Story`,
    hook,
    ctaText: def.cta,
    overallMood: mood,
    viralScore: 78 + Math.floor(Math.random() * 12),
    suggestedHashtags: def.hashtags,
    colorGradeHint: category.toLowerCase(),
    scenes: Array.from({ length: count }, (_, i) => ({
      originalIndex: i,
      sceneTitle: beats[Math.min(i, beats.length - 1)],
      narration: i === 0 ? hook : `${beats[Math.min(i, beats.length - 1)].replace(/[^\w\s]/g, '')}...`,
      transition: TRANSITIONS[i % TRANSITIONS.length],
      storyBeat: (['intro', 'buildup', 'action', 'climax', 'reveal', 'outro'] as const)[Math.min(i, 5)],
      emotion: 'warm',
      focusPoint: 'center' as const,
      kenBurnsStyle: KB_STYLES[i % KB_STYLES.length],
    })),
  };
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Parse body FIRST — we reference it in the catch block too
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
    const imagesToAnalyze = images.slice(0, 6); // cost/speed balance

    const imageContent = imagesToAnalyze.map((b64) => ({
      type: 'image_url' as const,
      image_url: { url: b64, detail: 'low' as const },
    }));

    const systemPrompt = `You are an expert AI video director and viral social media storytelling specialist.
Analyze the photos and create a cinematic story structure for a vertical reel.
Always respond with valid JSON only — no markdown, no code fences, just raw JSON.`;

    const userPrompt = `Analyze these ${imagesToAnalyze.length} photos for a ${category} reel with ${mood} mood.${title ? ` Title: "${title}"` : ''}

Photos are indexed 0–${imagesToAnalyze.length - 1} in the order they appear below.

Return ONLY this JSON (no markdown):
{
  "title": "Compelling reel title based on what you actually see",
  "hook": "Viral hook line max 60 chars — create curiosity or emotion, something they cannot scroll past",
  "ctaText": "Short call-to-action for last scene e.g. 'Recipe in bio 👇'",
  "overallMood": "${mood}",
  "viralScore": <integer 70-98>,
  "suggestedHashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5"],
  "colorGradeHint": "brief colour grading note e.g. warm golden tones",
  "scenes": [
    {
      "originalIndex": <which photo index this is>,
      "sceneTitle": "<Specific label for THIS exact photo, max 32 chars, with 1 emoji — describe what is ACTUALLY in it>",
      "narration": "<1–2 sentence voiceover for this scene, conversational and emotional>",
      "transition": "<dissolve|zoom-punch|slide-left|slide-up|blur-out|light-leak>",
      "storyBeat": "<intro|buildup|action|climax|reveal|outro>",
      "emotion": "<warm|exciting|satisfying|peaceful|joyful|dramatic|intimate>",
      "focusPoint": "<center|top|bottom|left|right>",
      "kenBurnsStyle": "<zoom-in|zoom-out|pan-left|pan-right|pan-up|pan-down>"
    }
  ]
}

Rules:
- Order scenes for best narrative flow — re-order if needed (use originalIndex to track which photo)
- For COOKING: ingredients first → prep → cooking action → final plated dish
- For TRAVEL: wide establishing shot first → close details → hero moment last
- sceneTitle MUST describe what's literally visible in the photo
- Hook must create FOMO — make them stop scrolling
- kenBurnsStyle: use zoom-in for hero shots, pan for wide scenes, zoom-out for reveals`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: [{ type: 'text', text: userPrompt }, ...imageContent] },
      ],
      max_tokens: 1500,
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const raw = response.choices[0].message.content;
    if (!raw) throw new Error('Empty AI response');

    const analysis: AIStoryAnalysis = JSON.parse(raw);
    if (!analysis.scenes?.length) throw new Error('No scenes in AI response');

    // Sanitise — clamp originalIndex to valid range
    analysis.scenes = analysis.scenes
      .filter(s => typeof s.originalIndex === 'number')
      .map(s => ({ ...s, originalIndex: Math.max(0, Math.min(s.originalIndex, images.length - 1)) }));

    return NextResponse.json({ analysis, aiUsed: true });

  } catch (err) {
    const isNoKey = err instanceof Error && err.message.includes('OPENAI_API_KEY');
    if (!isNoKey) console.error('Photo analysis error:', err);

    // Return a smart category-aware fallback — still much better than nothing
    const fallback = buildFallbackAnalysis(images.length, category, mood);
    return NextResponse.json({ analysis: fallback, aiUsed: false, fallback: true });
  }
}
