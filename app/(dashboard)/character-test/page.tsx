'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Sparkles, Film, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CharacterAnimator, type CharacterMood, type ParticleType } from '@/lib/character-animator';
import { StorySequencer, type StoryScene } from '@/lib/story-sequencer';
import { cn } from '@/lib/utils';

const POSES = [
  { id: 'pose-01-morning-tired',  label: 'Morning Tired',  file: '/character/honest-hormones-girl/pose-01-morning-tired.png',  suggestedMood: 'tired'   as CharacterMood, suggestedParticles: 'dust'     as ParticleType },
  { id: 'pose-02-drinking-water', label: 'Drinking Water', file: '/character/honest-hormones-girl/pose-02-drinking-water.png', suggestedMood: 'gentle'  as CharacterMood, suggestedParticles: 'sparkles' as ParticleType },
  { id: 'pose-03-phone-worried',  label: 'Phone Worried',  file: '/character/honest-hormones-girl/pose-03-phone-worried.png',  suggestedMood: 'worried' as CharacterMood, suggestedParticles: 'dust'     as ParticleType },
];

const STORY_SCENES: StoryScene[] = [
  { imageUrl: '/character/honest-hormones-girl/pose-01-morning-tired.png',  text: 'Day 1 of healing PMOS 🤍',  mood: 'tired',   particles: 'dust',     cameraMove: 'zoom-in',  durationMs: 3500 },
  { imageUrl: '/character/honest-hormones-girl/pose-03-phone-worried.png',  text: 'Tried searching for answers…', mood: 'worried', particles: 'dust',     cameraMove: 'zoom-out', durationMs: 3500 },
  { imageUrl: '/character/honest-hormones-girl/pose-02-drinking-water.png', text: 'But I chose myself today ✨', mood: 'gentle',  particles: 'sparkles', cameraMove: 'pan-up',   durationMs: 4000 },
];

const MOODS: { id: CharacterMood; label: string; emoji: string }[] = [
  { id: 'tired',   label: 'Tired',   emoji: '😔' },
  { id: 'gentle',  label: 'Gentle',  emoji: '🌸' },
  { id: 'worried', label: 'Worried', emoji: '😟' },
  { id: 'happy',   label: 'Happy',   emoji: '🥹' },
  { id: 'sad',     label: 'Sad',     emoji: '🥲' },
  { id: 'strong',  label: 'Strong',  emoji: '✨' },
];

type ViewMode = 'sequence' | 'single';

export default function CharacterTestPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('sequence');
  const [playing, setPlaying] = useState(true);
  const [poseIdx, setPoseIdx] = useState(0);
  const [mood, setMood] = useState<CharacterMood>('tired');
  const [particles, setParticles] = useState<ParticleType>('dust');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animatorRef = useRef<CharacterAnimator | null>(null);
  const sequencerRef = useRef<StorySequencer | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const startTimeRef = useRef(performance.now());
  const rafRef = useRef<number | null>(null);

  const pose = POSES[poseIdx];

  // Build sequencer when entering sequence mode
  useEffect(() => {
    if (viewMode !== 'sequence') return;
    const seq = new StorySequencer({ cw: 360, ch: 640, scenes: STORY_SCENES, crossfadeMs: 800 });
    seq.loadImages().then(() => {
      sequencerRef.current = seq;
      startTimeRef.current = performance.now();
    });
    return () => { sequencerRef.current = null; };
  }, [viewMode]);

  // Single-pose: load image + sync mood
  useEffect(() => {
    if (viewMode !== 'single') return;
    setMood(pose.suggestedMood);
    setParticles(pose.suggestedParticles);
    const img = new Image();
    img.src = pose.file;
    img.onload = () => { imageRef.current = img; };
    startTimeRef.current = performance.now();
    return () => { imageRef.current = null; };
  }, [viewMode, pose.file, pose.suggestedMood, pose.suggestedParticles]);

  // Single-pose: rebuild animator with maxed intensity for visibility
  useEffect(() => {
    if (viewMode !== 'single') return;
    animatorRef.current = new CharacterAnimator(360, 640, {
      mood, particles,
      breathIntensity: 1.0,
      swayIntensity: 1.0,
      kenBurnsIntensity: 0.6,
      blink: true,
    });
  }, [viewMode, mood, particles]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tick = (now: number) => {
      const t = (now - startTimeRef.current) / 1000;
      const elapsedMs = now - startTimeRef.current;

      if (viewMode === 'sequence' && sequencerRef.current && playing) {
        const loopElapsed = elapsedMs % sequencerRef.current.duration;
        sequencerRef.current.drawFrame(ctx, loopElapsed, t);
      } else if (viewMode === 'single' && animatorRef.current && imageRef.current && playing) {
        const sceneT = (t % 6) / 6;
        animatorRef.current.drawFrame(ctx, imageRef.current, t, sceneT);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [viewMode, playing]);

  const resetTime = () => { startTimeRef.current = performance.now(); };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">Character Animation Lab</h1>
            <Badge variant="pro" className="text-[10px]">LIVE</Badge>
          </div>
          <p className="text-sm text-white/40 mt-0.5">3 poses → animated story reel. No paid AI. Just code.</p>
        </div>
      </div>

      {/* View mode switch */}
      <div className="flex gap-2">
        <button onClick={() => setViewMode('sequence')}
          className={cn('flex-1 p-3 rounded-xl border-2 transition-all flex items-center gap-3',
            viewMode === 'sequence' ? 'border-violet-500 bg-violet-500/15' : 'border-white/10 hover:border-white/30')}>
          <Film className="h-5 w-5 text-violet-300" />
          <div className="text-left">
            <div className="text-sm font-semibold text-white">▶ Story Sequence (recommended)</div>
            <div className="text-[10px] text-white/50">All 3 poses play as a real reel — crossfade + text + camera</div>
          </div>
        </button>
        <button onClick={() => setViewMode('single')}
          className={cn('flex-1 p-3 rounded-xl border-2 transition-all flex items-center gap-3',
            viewMode === 'single' ? 'border-pink-500 bg-pink-500/15' : 'border-white/10 hover:border-white/30')}>
          <User className="h-5 w-5 text-pink-300" />
          <div className="text-left">
            <div className="text-sm font-semibold text-white">Single Pose Test</div>
            <div className="text-[10px] text-white/50">Inspect one pose with maxed-out aliveness</div>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6">
        {/* Phone-frame preview */}
        <div className="flex justify-center lg:justify-start">
          <div className="space-y-3">
            <div className="relative" style={{ width: 360 }}>
              <div className="bg-black rounded-[2.5rem] border-4 border-white/15 shadow-2xl overflow-hidden" style={{ width: 360, aspectRatio: '9/16' }}>
                <canvas ref={canvasRef} width={360} height={640} className="w-full h-full" />
              </div>
              <Badge variant="pro" className="absolute -top-2 -right-2 text-[10px]">▶ LIVE</Badge>
            </div>
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="icon-sm" onClick={() => setPlaying(p => !p)}>
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="icon-sm" onClick={resetTime}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-5">
          {viewMode === 'sequence' && (
            <>
              <div className="glass-card rounded-2xl p-4 space-y-3"
                   style={{ background: 'linear-gradient(135deg, rgba(232,160,183,0.10), rgba(139,92,246,0.08))', border: '1px solid rgba(232,160,183,0.3)' }}>
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-pink-300" />
                  <div className="text-xs font-semibold text-pink-200 uppercase tracking-wider">Now playing: Day 1 PMOS Story (10.5s loop)</div>
                </div>
                <div className="space-y-2 text-xs text-white/75">
                  {STORY_SCENES.map((scene, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white/5">
                      <span className="font-bold text-violet-300 shrink-0">Scene {i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-white">"{scene.text}"</div>
                        <div className="text-[10px] text-white/40 mt-0.5">
                          {scene.cameraMove} · {scene.mood} mood · {scene.particles} · {(scene.durationMs ?? 0) / 1000}s
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-2xl p-4 space-y-2">
                <div className="text-xs font-semibold text-white/40 uppercase tracking-wider">What's happening on screen</div>
                <ul className="text-xs text-white/70 space-y-1.5">
                  <li>🎬 <b>Crossfade transitions</b> — scenes blend smoothly</li>
                  <li>📷 <b>Camera moves</b> — zoom-in, zoom-out, pan-up (dramatic, visible)</li>
                  <li>💬 <b>Story text overlays</b> — fade-in slide-up, pill background</li>
                  <li>🫁 <b>Visible breathing</b> — 5% scale rhythm</li>
                  <li>🌬️ <b>Head sway + bob</b> — alive, not frozen</li>
                  <li>👁️ <b>Blinking</b> — every 4.5 sec</li>
                  <li>✨ <b>Particles</b> shift with scene mood</li>
                  <li>💡 <b>Light burst</b> at the start of each scene</li>
                  <li>📊 <b>Progress dots</b> at the bottom</li>
                </ul>
              </div>
            </>
          )}

          {viewMode === 'single' && (
            <>
              <div className="glass-card rounded-2xl p-4 space-y-3">
                <div className="text-xs font-semibold text-white/40 uppercase tracking-wider">Character Pose</div>
                <div className="grid grid-cols-3 gap-2">
                  {POSES.map((p, i) => (
                    <button key={p.id} onClick={() => setPoseIdx(i)}
                      className={cn('rounded-xl overflow-hidden border-2 transition-all',
                        i === poseIdx ? 'border-violet-500' : 'border-white/10 hover:border-white/30')}>
                      <img src={p.file} alt={p.label} className="w-full h-24 object-cover" />
                      <div className="p-1.5 bg-black/50 text-[10px] text-white text-center">{p.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="glass-card rounded-2xl p-4 space-y-3">
                <div className="text-xs font-semibold text-white/40 uppercase tracking-wider">Mood</div>
                <div className="flex flex-wrap gap-1.5">
                  {MOODS.map(m => (
                    <button key={m.id} onClick={() => setMood(m.id)}
                      className={cn('px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1',
                        mood === m.id ? 'bg-violet-600 text-white' : 'glass text-white/65 hover:text-white')}>
                      <span>{m.emoji}</span>{m.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
