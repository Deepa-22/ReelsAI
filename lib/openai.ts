import OpenAI from 'openai';

let _openai: OpenAI | null = null;
export function getOpenAI() {
  if (!_openai) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('The OPENAI_API_KEY environment variable is missing or empty; provide it to use OpenAI features.');
    _openai = new OpenAI({ apiKey: key });
  }
  return _openai;
}

export async function generateStoryScript(params: {
  category: string;
  mood: string;
  imageDescriptions: string[];
  duration: number;
}): Promise<{
  title: string;
  hook: string;
  script: string;
  scenes: Array<{ description: string; narration: string; duration: number }>;
  captions: string[];
  hashtags: string[];
  cta: string;
}> {
  const prompt = `You are an expert viral social media storyteller and AI video director.

Create a compelling story script for a ${params.duration}-second vertical reel.

Category: ${params.category}
Mood/Style: ${params.mood}
Content: ${params.imageDescriptions.join(', ')}

Generate a complete story structure with:
1. A viral hook (first 3 seconds must grab attention)
2. Scene-by-scene breakdown with timing
3. Emotional narration/voiceover script
4. Animated subtitle suggestions
5. Viral captions for Instagram/TikTok
6. Trending hashtags

Return as JSON with fields: title, hook, script, scenes (array with description, narration, duration), captions (array), hashtags (array), cta`;

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    max_tokens: 2000,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('No response from OpenAI');
  return JSON.parse(content);
}

export async function generateVoiceoverScript(
  script: string,
  mood: string,
  duration: number
): Promise<string> {
  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `Convert this script into a natural, emotional voiceover for a ${duration}-second ${mood} reel. Make it conversational, warm, and engaging. Script: ${script}`,
      },
    ],
    max_tokens: 500,
  });
  return response.choices[0].message.content || script;
}

export async function generateCaption(params: {
  category: string;
  mood: string;
  platform: string;
}): Promise<{ caption: string; hashtags: string[] }> {
  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `Generate a viral ${params.platform} caption for a ${params.mood} ${params.category} reel. Include emojis, engagement hooks, and trending hashtags. Return as JSON: {caption, hashtags}`,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 300,
  });
  const content = response.choices[0].message.content;
  return content ? JSON.parse(content) : { caption: '', hashtags: [] };
}

export async function analyzeImage(imageUrl: string): Promise<string> {
  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: imageUrl, detail: 'low' },
          },
          {
            type: 'text',
            text: 'Describe this image in detail for video storytelling: what is shown, the mood, colors, key subjects, and story potential.',
          },
        ],
      },
    ],
    max_tokens: 200,
  });
  return response.choices[0].message.content || 'No description available';
}

export async function calculateViralityScore(params: {
  category: string;
  mood: string;
  duration: number;
  hasVoiceover: boolean;
  hasSubtitles: boolean;
  hasTrendingMusic: boolean;
}): Promise<{ score: number; breakdown: Record<string, number>; suggestions: string[] }> {
  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `Analyze the virality potential of a reel with these parameters: ${JSON.stringify(params)}.
        Score from 0-100 and provide breakdown by category (hook_strength, emotional_impact, pacing, shareability) and 3 improvement suggestions.
        Return as JSON: {score, breakdown: {hook_strength, emotional_impact, pacing, shareability}, suggestions}`,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 400,
  });
  const content = response.choices[0].message.content;
  return content
    ? JSON.parse(content)
    : { score: 75, breakdown: {}, suggestions: [] };
}
