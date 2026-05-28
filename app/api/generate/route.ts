import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { generateStoryPrompt, synthesizeVoiceover, createMusicMood, renderReelWithRunway } from '../../../lib/ai';

export async function POST(request: Request) {
  const { projectId, userId, category, mood, assetUrls } = await request.json();

  const storyPrompt = await generateStoryPrompt(category, mood, assetUrls);
  const voice = await synthesizeVoiceover(storyPrompt);
  const music = await createMusicMood(mood);
  const render = await renderReelWithRunway({ story: storyPrompt, assets: assetUrls });

  const reel = await prisma.reel.create({
    data: {
      projectId,
      userId,
      title: `AI Reel • ${category}`,
      status: 'COMPLETED',
      script: storyPrompt,
      voiceover: voice.voiceUrl,
      musicTrack: music.trackUrl,
      videoUrl: render.videoUrl,
    },
  });

  return NextResponse.json({ reel, voice, music });
}
