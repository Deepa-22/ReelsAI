'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wand2, Sparkles, ArrowRight, Loader2, Check, Download, RotateCcw,
  Mic, MicOff, Eye, ExternalLink, Star, TrendingUp, Palette,
  BookOpen, Heart, Plane, Briefcase, GraduationCap, Baby, Image as ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  renderCinematicReel,
  type AISceneData,
  type AICreativeBrief,
  type Category, type Mood,
} from '@/lib/cinematic-renderer';
import type { StoryPlan, StoryScene } from '@/app/api/ai/generate-story/route';

const STARTER_STORIES = [
  { icon: Heart,         label: 'My PCOS journey',         text: 'My PCOS journey — from diagnosis to feeling stronger every day. The shock, the changes, the wins.', mood: 'EMOTIONAL' },
  { icon: Plane,         label: 'Tokyo solo trip',          text: 'My first solo trip to Tokyo. The nerves, the noodle shops, the late-night neon, the moment I realised I could do anything.', mood: 'CINEMATIC' },
  { icon: Briefcase,     label: 'Quitting 9-5',             text: 'The day I quit my corporate job to start my own thing. Fear, the leap, the first client, the freedom.', mood: 'EMOTIONAL' },
  { icon: GraduationCap, label: 'First day of college',     text: 'My first day at college — saying goodbye to home, finding my dorm, making my first friend at orientation.', mood: 'EMOTIONAL' },
  { icon: Baby,          label: 'Baby\'s first year',       text: 'A baby\'s first year — first smile, first steps, first words, first birthday. Tiny milestones that changed everything.', mood: 'EMOTIONAL' },
  { icon: Sparkles,      label: 'Glow-up transformation',   text: 'My glow-up journey — the pivot, the new habits, the confidence, the version of me I always wanted to be.', mood: 'VIRAL' },
];

const VISUAL_STYLES = [
  { id: 'illustrated', label: 'Illustrated',  emoji: '🎨', desc: 'Soft flat illustration' },
  { id: 'photographic', label: 'Cinematic',   emoji: '📸', desc: 'Photoreal cinematic' },
  { id: 'anime',       label: 'Anime',        emoji: '✨', desc: 'Ghibli-style anime' },
  { id: 'watercolor',  label: 'Watercolor',   emoji: '🖌️', desc: 'Dreamy watercolor' },
  { id: 'pixar',       label: 'Pixar 3D',     emoji: '🎬', desc: 'Pixar 3D feel' },
  { id: 'minimal',     label: 'Minimal',      emoji: '◻️', desc: 'Editorial minimal' },
];

const MOODS = [
  { id: 'EMOTIONAL',  label: 'Emotional 💝' },
  { id: 'CINEMATIC',  label: 'Cinematic 🎥' },
  { id: 'VIRAL',      label: 'Viral 🔥' },
  { id: 'DREAMY',     label: 'Dreamy 🌙' },
  { id: 'FAST_PACED', label: 'High-energy ⚡' },
];

type Phase = 'idle' | 'planning' | 'imaging' | 'rendering' | 'done' | 'error';

interface GeneratedImage { sceneIndex: number; imageUrl: string; status: 'pending' | 'generating' | 'done' | 'error'; }

export default function StoryPage() {
  const [storyline, setStoryline] = useState('');
  const [sceneCount, setSceneCount] = useState<4 | 6 | 8>(6);
  const [style, setStyle]   = useState('illustrated');
  const [mood, setMood]     = useState('EMOTIONAL');
  const [voiceOn, setVoiceOn] = useState(true);

  const [phase, setPhase]   = useState<Phase>('idle');
  const [plan, setPlan]     = useState<StoryPlan | null>(null);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [renderProgress, setRenderProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = (text: string) => {
    if (!voiceOn || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95; u.pitch = 1.05; u.volume = 0.9;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Female'));
    if (preferred) u.voice = preferred;
    speechRef.current = u;
    window.speechSynthesis.speak(u);
  };

  const stopSpeak = () => { if (typeof window !== 'undefined') window.speechSynthesis?.cancel(); };

  const handleGenerate = async () => {
    if (!storyline.trim() || storyline.trim().length < 10) {
      toast.error('Tell me more — at least a sentence or two ✍️'); return;
    }
    setPhase('planning');
    setPlan(null);
    setImages([]);
    setVideoUrl(null);
    setRenderProgress(0);
    setErrorMsg('');

    // ── PHASE 1 — Story planning via GPT-4o ────────────────────────────────
    let storyPlan: StoryPlan;
    try {
      const res = await fetch('/api/ai/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyline, sceneCount, style, mood }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Story planning failed');
      storyPlan = data.plan;
      setPlan(storyPlan);
      setImages(storyPlan.scenes.map(s => ({ sceneIndex: s.index, imageUrl: '', status: 'pending' as const })));
      toast.success('✨ Story plan ready!');
    } catch (err) {
      setPhase('error');
      setErrorMsg(err instanceof Error ? err.message : 'Story planning failed');
      return;
    }

    // ── PHASE 2 — Generate images via DALL-E 3 (parallel, with live UI) ────
    setPhase('imaging');

    const imageResults: GeneratedImage[] = storyPlan.scenes.map(s => ({
      sceneIndex: s.index, imageUrl: '', status: 'pending' as const,
    }));

    await Promise.all(storyPlan.scenes.map(async (scene, i) => {
      try {
        imageResults[i] = { sceneIndex: scene.index, imageUrl: '', status: 'generating' };
        setImages([...imageResults]);

        const res = await fetch('/api/ai/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: scene.imagePrompt, size: '1024x1792' }),
        });
        const data = await res.json();
        if (!res.ok || !data.imageUrl) throw new Error(data.error || 'Image failed');

        imageResults[i] = { sceneIndex: scene.index, imageUrl: data.imageUrl, status: 'done' };
        setImages([...imageResults]);
      } catch (err) {
        imageResults[i] = { sceneIndex: scene.index, imageUrl: '', status: 'error' };
        setImages([...imageResults]);
        console.error(`Image ${i} failed:`, err);
      }
    }));

    const succeeded = imageResults.filter(r => r.status === 'done');
    if (succeeded.length === 0) {
      setPhase('error');
      setErrorMsg('All images failed — check your OpenAI billing');
      return;
    }
    if (succeeded.length < storyPlan.scenes.length) {
      toast(`Some images failed — using ${succeeded.length}/${storyPlan.scenes.length}`, { icon: '⚠️' });
    } else {
      toast.success(`🎨 All ${succeeded.length} scenes painted!`);
    }

    // ── PHASE 3 — Cinematic render ─────────────────────────────────────────
    setPhase('rendering');
    try {
      const validResults = imageResults.filter(r => r.status === 'done');
      const validScenes  = validResults.map(r => storyPlan.scenes.find(s => s.index === r.sceneIndex)!);

      const loadedImages = await Promise.all(
        validResults.map(r => new Promise<HTMLImageElement>((res, rej) => {
          const img = new Image();
          img.onload = () => res(img);
          img.onerror = rej;
          img.src = r.imageUrl;
        }))
      );

      // Map StoryScenes → AISceneData for the renderer
      const aiScenes: AISceneData[] = validScenes.map((s, i) => ({
        originalIndex: i,
        sceneTitle: s.title,
        narration: s.narration,
        transition: i % 3 === 0 ? 'dissolve' : i % 3 === 1 ? 'light-leak' : 'blur-out',
        storyBeat: i === 0 ? 'intro' : i === validScenes.length - 1 ? 'outro' : 'action',
        emotion: 'warm',
        focusPoint: 'center',
        kenBurnsStyle: ['zoom-in', 'pan-right', 'zoom-out', 'pan-up', 'zoom-in', 'pan-left'][i % 6] as AISceneData['kenBurnsStyle'],
        characterEmojis: [s.emoji],
        lightingEffect: i === 0 ? 'lens-flare' : i === validScenes.length - 1 ? 'sparkle-burst' : (['soft-glow', 'light-leak', 'soft-glow'] as const)[i % 3],
        effectColor: storyPlan.brief?.palette?.primary,
        emojiAccent: i === 0 || i === validScenes.length - 1 ? s.emoji : undefined,
        textStyle: {
          fontSize: i === 0 ? 'xl' : 'md',
          position: s.textStyle ?? 'bottom',
          background: i === 0 ? 'none' : 'pill',
          animation: i % 2 === 0 ? 'slide-up' : 'pop',
        },
      }));

      const blob = await renderCinematicReel({
        images: loadedImages,
        category: 'OTHER' as Category,
        mood: mood as Mood,
        duration: validScenes.length * 4,        // 4s per scene
        hook: storyPlan.hook,
        title: storyPlan.title,
        ctaText: storyPlan.ctaText,
        aiScenes,
        brief: storyPlan.brief,
        onProgress: setRenderProgress,
      });

      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setPhase('done');

      // Speak the hook when the video appears
      if (voiceOn) setTimeout(() => speak(storyPlan.hook), 400);

      toast.success('🎬 Your AI story video is ready!');
    } catch (err) {
      setPhase('error');
      setErrorMsg(err instanceof Error ? err.message : 'Render failed');
    }
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    const safe = (plan?.title || 'story').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    a.download = `storyreel-${safe}.webm`;
    a.click();
    toast.success('Downloading…');
  };

  const reset = () => {
    stopSpeak();
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setPhase('idle'); setPlan(null); setImages([]); setVideoUrl(null);
    setRenderProgress(0); setErrorMsg('');
  };

  const playNarration = () => {
    if (!plan) return;
    if (typeof window !== 'undefined' && window.speechSynthesis.speaking) { stopSpeak(); return; }
    const fullText = `${plan.hook}. ${plan.scenes.map(s => s.narration).join('. ')}. ${plan.ctaText}.`;
    speak(fullText);
  };

  // ─── Phase-based UI ──────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-glow">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">Story Mode</h1>
              <Badge variant="pro" className="text-[10px]">NEW</Badge>
            </div>
            <p className="text-sm text-white/40 mt-0.5">Type a story → AI generates the entire reel with custom images, character, and narration</p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ════ IDLE — story editor ════════════════════════════════════════ */}
        {phase === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Starter chips */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-white/40 uppercase tracking-wider">Start from an example</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STARTER_STORIES.map(s => (
                  <button key={s.label} onClick={() => { setStoryline(s.text); setMood(s.mood); }}
                    className="glass-card rounded-xl p-3 text-left hover:border-violet-500/40 transition-all flex items-start gap-2.5 group">
                    <s.icon className="h-4 w-4 text-violet-400 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="text-sm font-medium text-white">{s.label}</div>
                      <div className="text-xs text-white/40 line-clamp-2 mt-0.5">{s.text}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Story input */}
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <label className="block text-sm font-semibold text-white">
                <Sparkles className="h-4 w-4 inline mr-1 text-violet-400" />
                Tell me your story…
              </label>
              <textarea
                value={storyline}
                onChange={e => setStoryline(e.target.value)}
                rows={5}
                maxLength={500}
                placeholder="My PCOS journey — from diagnosis day to feeling strong again. The shock, the medication, the new routine, the wins…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none leading-relaxed"
              />
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/30">{storyline.length}/500</span>
                <span className="text-white/30">~₹30 per story · {Math.floor(sceneCount * 0.04 * 85)} ₹ cost</span>
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Scene count */}
              <div className="glass-card rounded-2xl p-4 space-y-3">
                <div className="text-xs font-semibold text-white/60 uppercase tracking-wider">Scene Count</div>
                <div className="grid grid-cols-3 gap-2">
                  {[4, 6, 8].map(n => (
                    <button key={n} onClick={() => setSceneCount(n as 4|6|8)}
                      className={cn('py-2 rounded-xl text-sm font-medium transition-all',
                        sceneCount === n ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]' : 'glass text-white/60 hover:text-white')}>
                      {n} scenes
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood */}
              <div className="glass-card rounded-2xl p-4 space-y-3">
                <div className="text-xs font-semibold text-white/60 uppercase tracking-wider">Mood</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {MOODS.map(m => (
                    <button key={m.id} onClick={() => setMood(m.id)}
                      className={cn('px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                        mood === m.id ? 'bg-violet-600 text-white' : 'glass text-white/60 hover:text-white')}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Visual style */}
            <div className="glass-card rounded-2xl p-4 space-y-3">
              <div className="text-xs font-semibold text-white/60 uppercase tracking-wider">Visual Style</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {VISUAL_STYLES.map(s => (
                  <button key={s.id} onClick={() => setStyle(s.id)}
                    className={cn('p-3 rounded-xl text-left transition-all border',
                      style === s.id ? 'bg-violet-500/15 border-violet-500/50' : 'glass border-transparent hover:border-white/15')}>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{s.emoji}</span>
                      <div>
                        <div className="text-sm font-medium text-white">{s.label}</div>
                        <div className="text-xs text-white/40">{s.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Voice */}
            <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-violet-500/15 flex items-center justify-center">
                  {voiceOn ? <Mic className="h-4 w-4 text-violet-400" /> : <MicOff className="h-4 w-4 text-white/30" />}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Voice narration</div>
                  <div className="text-xs text-white/40">Browser reads the story aloud while reel plays (free)</div>
                </div>
              </div>
              <Switch checked={voiceOn} onCheckedChange={setVoiceOn} />
            </div>

            {/* Generate */}
            <Button variant="glow" size="xl" className="w-full group" onClick={handleGenerate}
              disabled={storyline.trim().length < 10}>
              <Wand2 className="h-5 w-5" />
              Generate Story Video
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        )}

        {/* ════ PLANNING ════════════════════════════════════════════════════ */}
        {phase === 'planning' && (
          <motion.div key="planning" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="text-center space-y-6 py-12">
            <div className="relative mx-auto w-fit">
              <div className="h-24 w-24 rounded-3xl bg-violet-500/20 flex items-center justify-center mx-auto">
                <BookOpen className="h-12 w-12 text-violet-400 animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-3xl border-2 border-violet-500/30 animate-ping" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">GPT-4o is writing your story…</h2>
              <p className="text-violet-300 text-sm mt-1">Designing character, scenes, narration, palette</p>
            </div>
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-xs">
              {['🎬 Story arc', '👤 Character', '🎨 Style + palette'].map(s => (
                <div key={s} className="glass-card rounded-xl py-2.5 text-white/60">{s}</div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ════ IMAGING — show scenes appearing live ════════════════════════ */}
        {phase === 'imaging' && plan && (
          <motion.div key="imaging" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">
                Painting your scenes…
                <span className="text-violet-300 ml-2">
                  {images.filter(i => i.status === 'done').length}/{images.length}
                </span>
              </h2>
              <p className="text-white/40 text-sm">DALL-E 3 is bringing each scene to life in your chosen style</p>
            </div>

            {plan.brief?.creativeConcept && (
              <div className="glass-card rounded-xl p-4 text-center">
                <p className="text-white/85 italic">"{plan.brief.creativeConcept}"</p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {plan.scenes.map((scene, i) => {
                const img = images.find(im => im.sceneIndex === scene.index);
                const status = img?.status ?? 'pending';
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="glass-card rounded-xl overflow-hidden">
                    <div className="aspect-[9/16] bg-gradient-to-br from-violet-900/30 to-purple-900/30 relative overflow-hidden">
                      {status === 'done' && img?.imageUrl && (
                        <motion.img initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
                          src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                      )}
                      {status === 'generating' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-violet-300 gap-2">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span className="text-[10px]">painting…</span>
                        </div>
                      )}
                      {status === 'pending' && (
                        <div className="absolute inset-0 flex items-center justify-center text-white/20">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                      {status === 'error' && (
                        <div className="absolute inset-0 flex items-center justify-center text-red-300 text-[10px] text-center px-2">
                          failed
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <div className="text-[10px] font-bold text-violet-300">Scene {i + 1} {scene.emoji}</div>
                      <div className="text-[11px] text-white/70 line-clamp-2 mt-0.5">{scene.description}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ════ RENDERING ════════════════════════════════════════════════════ */}
        {phase === 'rendering' && (
          <motion.div key="rendering" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6 py-12">
            <div className="relative mx-auto w-fit">
              <div className="h-24 w-24 rounded-3xl bg-violet-500/20 flex items-center justify-center mx-auto">
                <Wand2 className="h-12 w-12 text-violet-400 animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-3xl border-2 border-violet-500/30 animate-ping" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Stitching your cinematic reel…</h2>
              <p className="text-violet-300 text-sm mt-1">Ken Burns motion · transitions · colour grade · particles</p>
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <Progress value={renderProgress} className="h-3" />
              <p className="text-xs text-white/40">{renderProgress}%</p>
            </div>
          </motion.div>
        )}

        {/* ════ DONE ════════════════════════════════════════════════════════ */}
        {phase === 'done' && videoUrl && plan && (
          <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="text-center space-y-2">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.55 }}
                className="text-5xl mx-auto w-fit">✨</motion.div>
              <h2 className="text-2xl font-bold text-white">{plan.title}</h2>
              <p className="text-white/60 italic max-w-md mx-auto">"{plan.hook}"</p>
            </div>

            {/* Phone-frame video preview */}
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start justify-center">
              <div className="shrink-0">
                <div className="relative bg-black rounded-[1.8rem] border-4 border-white/15 shadow-2xl overflow-hidden" style={{ width: 220, aspectRatio: '9/16' }}>
                  <video src={videoUrl} className="w-full h-full object-cover" autoPlay loop muted={voiceOn} playsInline />
                  <Badge variant="pro" className="absolute -top-2 -right-2 text-[10px]">▶ Preview</Badge>
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-3" onClick={playNarration}>
                  <Mic className="h-3.5 w-3.5 mr-1.5" />
                  {voiceOn ? 'Play narration' : 'Voice off'}
                </Button>
              </div>

              <div className="flex-1 space-y-3 w-full max-w-md">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-card rounded-xl p-3 text-center">
                    <Star className="h-5 w-5 text-amber-400 mx-auto mb-1" />
                    <div className="text-xl font-bold text-white">{plan.viralScore}%</div>
                    <div className="text-[10px] text-white/40">Virality</div>
                  </div>
                  <div className="glass-card rounded-xl p-3 text-center">
                    <TrendingUp className="h-5 w-5 text-green-400 mx-auto mb-1" />
                    <div className="text-xl font-bold text-white">{plan.scenes.length}</div>
                    <div className="text-[10px] text-white/40">AI scenes</div>
                  </div>
                </div>

                {/* Brief */}
                {plan.brief?.creativeConcept && (
                  <div className="glass-card rounded-xl p-3 space-y-2"
                    style={{ background: plan.brief.palette ? `linear-gradient(135deg, ${plan.brief.palette.primary}22, ${plan.brief.palette.secondary}11)` : undefined,
                             border: plan.brief.palette ? `1px solid ${plan.brief.palette.primary}40` : undefined }}>
                    <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1">
                      <Palette className="h-3 w-3" /> AI Direction
                    </div>
                    <p className="text-xs text-white/85 italic">"{plan.brief.creativeConcept}"</p>
                    {plan.brief.palette && (
                      <div className="flex gap-1">
                        {Object.values(plan.brief.palette).map((c, i) => (
                          <div key={i} className="h-5 w-5 rounded border border-white/20" style={{ background: c }} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Character */}
                {plan.character && (
                  <div className="glass-card rounded-xl p-3 space-y-1">
                    <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Consistent character</div>
                    <p className="text-xs text-white/70 line-clamp-3">{plan.character}</p>
                  </div>
                )}

                {/* Scenes list */}
                <div className="glass-card rounded-xl p-3 space-y-2">
                  <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Story arc</div>
                  {plan.scenes.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span>{s.emoji}</span>
                      <div className="flex-1">
                        <div className="text-white/80">{s.title}</div>
                        <div className="text-white/40 text-[10px]">{s.narration}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Hashtags */}
                {plan.hashtags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {plan.hashtags.map(h => (
                      <span key={h} className="text-[10px] text-violet-300 bg-violet-500/15 px-2 py-0.5 rounded-full border border-violet-500/20">{h}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 max-w-md mx-auto">
              <Button variant="glow" size="lg" className="flex-1" onClick={handleDownload}>
                <Download className="h-5 w-5" /> Download
              </Button>
              <Button variant="outline" size="lg" onClick={reset}>
                <RotateCcw className="h-4 w-4" /> New
              </Button>
            </div>
            <p className="text-center text-xs text-white/30">
              WebM format. Convert to MP4 free at{' '}
              <a href="https://cloudconvert.com/webm-to-mp4" target="_blank" rel="noreferrer" className="text-violet-400 hover:underline inline-flex items-center gap-0.5">
                CloudConvert <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </p>
          </motion.div>
        )}

        {/* ════ ERROR ════════════════════════════════════════════════════════ */}
        {phase === 'error' && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4 py-12">
            <div className="text-5xl">😕</div>
            <h2 className="text-xl font-bold text-white">Something went wrong</h2>
            <p className="text-white/50 text-sm max-w-md mx-auto">{errorMsg}</p>
            <div className="flex gap-3 justify-center">
              <Button variant="gradient" onClick={reset}><RotateCcw className="h-4 w-4" /> Try again</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
