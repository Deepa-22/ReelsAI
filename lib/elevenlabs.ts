const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

export const VOICE_OPTIONS = {
  RACHEL: { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', gender: 'female', accent: 'American' },
  ADAM: { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', gender: 'male', accent: 'American' },
  BELLA: { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', gender: 'female', accent: 'American' },
  DOMI: { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', gender: 'female', accent: 'American' },
  ELLI: { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', gender: 'female', accent: 'American' },
  JOSH: { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', gender: 'male', accent: 'American' },
  ARNOLD: { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', gender: 'male', accent: 'American' },
} as const;

export type VoiceId = keyof typeof VOICE_OPTIONS;

export async function generateVoiceover(params: {
  text: string;
  voiceId: string;
  stability?: number;
  similarityBoost?: number;
}): Promise<ArrayBuffer | null> {
  if (!ELEVENLABS_API_KEY) {
    console.warn('ElevenLabs API key not configured');
    return null;
  }

  const response = await fetch(
    `${ELEVENLABS_API_URL}/text-to-speech/${params.voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: params.text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: params.stability ?? 0.5,
          similarity_boost: params.similarityBoost ?? 0.75,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs error: ${error}`);
  }

  return response.arrayBuffer();
}

export async function getVoiceList(): Promise<Array<{ voice_id: string; name: string }>> {
  if (!ELEVENLABS_API_KEY) return [];

  const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
    headers: { 'xi-api-key': ELEVENLABS_API_KEY },
  });

  if (!response.ok) return [];
  const data = await response.json();
  return data.voices || [];
}
