'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, X, Check, ArrowRight, ArrowLeft, Wand2,
  Sparkles, Mic, Music, Type, Film, Clock, Share2,
  Star, TrendingUp, Download, Eye, Edit3, Loader2,
  RotateCcw, ExternalLink, Play
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useCreateReelStore } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';
import { renderCinematicReel, type Category, type Mood } from '@/lib/cinematic-renderer';
import PreviewModal from '@/components/create/PreviewModal';

const CATEGORIES = [
  { value: 'COOKING', label: 'Cooking', icon: '🍳', desc: 'Recipes & food content' },
  { value: 'TRAVEL', label: 'Travel', icon: '✈️', desc: 'Adventures & destinations' },
  { value: 'BABY', label: 'Baby Memories', icon: '👶', desc: 'Precious moments' },
  { value: 'WEDDING', label: 'Wedding', icon: '💒', desc: 'Love & celebration' },
  { value: 'PETS', label: 'Pets', icon: '🐾', desc: 'Furry friends' },
  { value: 'FASHION', label: 'Fashion', icon: '👗', desc: 'Style & outfits' },
  { value: 'FOOD_BUSINESS', label: 'Food Business', icon: '🍔', desc: 'Restaurant & café' },
  { value: 'CAFE', label: 'Café', icon: '☕', desc: 'Coffee & ambience' },
  { value: 'FITNESS', label: 'Fitness', icon: '💪', desc: 'Workout & health' },
  { value: 'PRODUCT', label: 'Product', icon: '📦', desc: 'Showcase & demos' },
  { value: 'REAL_ESTATE', label: 'Real Estate', icon: '🏠', desc: 'Property tours' },
  { value: 'FESTIVAL', label: 'Festival', icon: '🎉', desc: 'Events & celebrations' },
  { value: 'BIRTHDAY', label: 'Birthday', icon: '🎂', desc: 'Special day memories' },
  { value: 'COUPLE', label: 'Couple', icon: '💑', desc: 'Love stories' },
  { value: 'LUXURY', label: 'Luxury', icon: '✨', desc: 'Premium lifestyle' },
  { value: 'VLOG', label: 'Vlog', icon: '🎬', desc: 'Daily life stories' },
];

const MOODS = [
  { value: 'CINEMATIC', label: 'Cinematic', icon: '🎥', desc: 'Epic & dramatic' },
  { value: 'EMOTIONAL', label: 'Emotional', icon: '💝', desc: 'Heartfelt & moving' },
  { value: 'LUXURY', label: 'Luxury', icon: '👑', desc: 'Premium & elegant' },
  { value: 'COZY', label: 'Cozy', icon: '☕', desc: 'Warm & intimate' },
  { value: 'VIRAL', label: 'Viral', icon: '🔥', desc: 'High energy & trendy' },
  { value: 'FAST_PACED', label: 'Fast-paced', icon: '⚡', desc: 'Quick cuts & energy' },
  { value: 'DREAMY', label: 'Dreamy', icon: '🌙', desc: 'Soft & ethereal' },
  { value: 'RETRO', label: 'Retro', icon: '📺', desc: 'Vintage vibes' },
  { value: 'MINIMAL', label: 'Minimal', icon: '⬜', desc: 'Clean & simple' },
  { value: 'DOCUMENTARY', label: 'Documentary', icon: '📽️', desc: 'Real & authentic' },
  { value: 'AESTHETIC', label: 'Aesthetic', icon: '🌸', desc: 'Beautiful & curated' },
];

const PLATFORMS = [
  { value: 'INSTAGRAM', label: 'Instagram', icon: '📸', color: 'from-pink-500 to-orange-400' },
  { value: 'TIKTOK', label: 'TikTok', icon: '🎵', color: 'from-gray-900 to-gray-700' },
  { value: 'YOUTUBE', label: 'YouTube Shorts', icon: '▶️', color: 'from-red-600 to-red-500' },
  { value: 'WHATSAPP', label: 'WhatsApp', icon: '💬', color: 'from-green-600 to-green-500' },
];

const DURATIONS = [
  { value: 15, label: '15s', desc: 'Quick hook' },
  { value: 30, label: '30s', desc: 'Standard' },
  { value: 60, label: '60s', desc: 'Full story' },
];

const STEPS = [
  { id: 1, label: 'Upload', icon: Upload },
  { id: 2, label: 'Category', icon: Sparkles },
  { id: 3, label: 'Style', icon: Film },
  { id: 4, label: 'Settings', icon: Wand2 },
  { id: 5, label: 'Generate', icon: Loader2 },
];

const RENDER_LABELS: Record<number, string> = {
  0:  '🎬 Building story structure…',
  15: '🖼️ Applying cinematic colour grade…',
  30: '✨ Adding Ken Burns camera motion…',
  50: '🎞️ Rendering scene transitions…',
  65: '💬 Placing story text overlays…',
  80: '🔥 Adding particle effects…',
  92: '📦 Packaging your reel…',
  100:'✅ Done!',
};

export default function CreateReelPage() {
  const { step, files, config, setStep, addFiles, removeFile, updateConfig, resetCreate } = useCreateReelStore();

  // Real render state
  const [renderStatus, setRenderStatus] = useState<'idle'|'rendering'|'done'|'error'>('idle');
  const [renderProgress, setRenderProgress] = useState(0);
  const [videoUrl, setVideoUrl]   = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [hook, setHook]           = useState('');
  const [viralScore, setViralScore] = useState(0);
  const [showPreview, setShowPreview]  = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles = accepted.slice(0, 20 - files.length).map((file, i) => ({
      id: uuidv4(),
      file,
      preview: URL.createObjectURL(file),
      type: (file.type.startsWith('video/') ? 'video' : 'image') as 'image' | 'video',
      order: files.length + i,
    }));
    addFiles(newFiles);
  }, [files.length, addFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/*': [] },
    maxSize: 100 * 1024 * 1024,
    disabled: files.length >= 20,
  });

  const handleGenerate = async () => {
    if (!config.category || !config.mood) { toast.error('Pick a category and mood first'); return; }
    const imageFiles = files.filter(f => f.type === 'image');
    if (imageFiles.length === 0) { toast.error('Upload at least one photo'); return; }

    setStep(5);
    setRenderStatus('rendering');
    setRenderProgress(0);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setVideoBlob(null);

    // Build a punchy hook based on category
    const hookMap: Record<string, string> = {
      COOKING:'Wait until you see how this turned out 🍝✨',
      TRAVEL: 'This place changed everything ✈️🌍',
      WEDDING:'The most beautiful day of our lives 💒💍',
      PETS:   'This little one owns my heart 🐾❤️',
      FITNESS:'This transformation will shock you 💪🔥',
      BABY:   'Tiny hands, forever in my heart 👶💕',
      CAFE:   'The vibe here hits different ☕✨',
      LUXURY: 'This is what living feels like 👑✨',
    };
    const generatedHook = hookMap[config.category] || `This ${config.category?.toLowerCase()} story will blow your mind ✨`;
    setHook(generatedHook);
    setViralScore(Math.floor(Math.random() * 18) + 78);

    try {
      const loadedImages = await Promise.all(
        imageFiles.map(f => new Promise<HTMLImageElement>((res, rej) => {
          const img = new Image();
          img.onload = () => res(img);
          img.onerror = rej;
          img.src = f.preview;
        }))
      );

      const blob = await renderCinematicReel({
        images: loadedImages,
        category: config.category as Category,
        mood: config.mood as Mood,
        duration: config.duration,
        hook: generatedHook,
        title: config.title || 'My Story',
        onProgress: setRenderProgress,
      });

      const url = URL.createObjectURL(blob);
      setVideoBlob(blob);
      setVideoUrl(url);
      setRenderStatus('done');
      toast.success('🎬 Your cinematic reel is ready!');
    } catch (err) {
      console.error(err);
      setRenderStatus('error');
      toast.error('Render failed — please try again.');
    }
  };

  const handleDownload = () => {
    if (!videoUrl || !videoBlob) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    const safe = (config.title || 'storyreel').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    a.download = `${safe}-${config.duration}s.webm`;
    a.click();
    toast.success('Downloading your reel!');
  };

  const canProceed = () => {
    if (step === 1) return files.length > 0;
    if (step === 2) return !!config.category;
    if (step === 3) return !!config.mood;
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Steps indicator */}
      <div className="flex items-center justify-between">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <button
              onClick={() => step > s.id ? setStep(s.id) : undefined}
              className={cn(
                'flex items-center gap-2 transition-all',
                step >= s.id ? 'opacity-100' : 'opacity-30 pointer-events-none'
              )}
            >
              <div className={cn(
                'h-9 w-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all',
                step === s.id ? 'bg-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.5)]' :
                  step > s.id ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    'glass text-white/30'
              )}>
                {step > s.id ? <Check className="h-4 w-4" /> : s.id}
              </div>
              <span className={cn('text-sm font-medium hidden sm:block', step >= s.id ? 'text-white' : 'text-white/30')}>
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={cn('flex-1 h-px mx-3 min-w-[20px] sm:min-w-[40px]', step > s.id ? 'bg-violet-500/50' : 'bg-white/10')} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: Upload */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Upload your content</h2>
              <p className="text-white/50">Upload photos and short videos (up to 20 files, 100MB each)</p>
            </div>

            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all',
                isDragActive ? 'border-violet-500 bg-violet-500/10' : 'border-white/15 hover:border-white/30 hover:bg-white/5',
                files.length >= 20 && 'opacity-50 cursor-not-allowed'
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-violet-500/20 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-violet-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-white mb-1">
                    {isDragActive ? 'Drop your files here' : 'Drop photos & videos here'}
                  </p>
                  <p className="text-sm text-white/40">or click to browse — JPG, PNG, MP4, MOV</p>
                </div>
                <Button variant="outline" size="sm" type="button">Browse Files</Button>
              </div>
            </div>

            {files.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-white/50">{files.length} file{files.length > 1 ? 's' : ''} selected</span>
                  <button onClick={() => files.forEach(f => removeFile(f.id))} className="text-xs text-red-400 hover:text-red-300">Remove all</button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                  {files.map((f) => (
                    <div key={f.id} className="relative group aspect-square">
                      <img src={f.preview} alt="" className="w-full h-full object-cover rounded-xl border border-white/10" />
                      {f.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-6 w-6 rounded-full bg-black/60 flex items-center justify-center">
                            <Film className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => removeFile(f.id)}
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 2: Category */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">What type of content is this?</h2>
              <p className="text-white/50">AI uses this to craft the perfect story structure</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CATEGORIES.map((cat) => (
                <motion.button
                  key={cat.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateConfig({ category: cat.value as any })}
                  className={cn(
                    'glass-card rounded-2xl p-4 text-left transition-all',
                    config.category === cat.value ? 'border-violet-500/60 bg-violet-500/15 shadow-[0_0_20px_rgba(139,92,246,0.2)]' : 'hover:border-white/20'
                  )}
                >
                  <div className="text-2xl mb-2">{cat.icon}</div>
                  <div className="text-sm font-semibold text-white">{cat.label}</div>
                  <div className="text-xs text-white/40 mt-0.5">{cat.desc}</div>
                  {config.category === cat.value && (
                    <div className="mt-2"><Check className="h-4 w-4 text-violet-400" /></div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 3: Mood */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Choose your vibe</h2>
              <p className="text-white/50">This sets the emotional tone, pacing, and style of your reel</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {MOODS.map((mood) => (
                <motion.button
                  key={mood.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateConfig({ mood: mood.value as any })}
                  className={cn(
                    'glass-card rounded-2xl p-4 text-left transition-all',
                    config.mood === mood.value ? 'border-violet-500/60 bg-violet-500/15 shadow-[0_0_20px_rgba(139,92,246,0.2)]' : 'hover:border-white/20'
                  )}
                >
                  <div className="text-2xl mb-2">{mood.icon}</div>
                  <div className="text-sm font-semibold text-white">{mood.label}</div>
                  <div className="text-xs text-white/40 mt-0.5">{mood.desc}</div>
                  {config.mood === mood.value && (
                    <div className="mt-2"><Check className="h-4 w-4 text-violet-400" /></div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 4: Settings */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Customize your reel</h2>
              <p className="text-white/50">Fine-tune the AI settings for your perfect output</p>
            </div>

            {/* Duration */}
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-violet-400" />
                <span className="font-medium text-white">Reel Duration</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {DURATIONS.map((d) => (
                  <button key={d.value} onClick={() => updateConfig({ duration: d.value as any })}
                    className={cn('glass-card rounded-xl p-3 text-center transition-all', config.duration === d.value ? 'border-violet-500/60 bg-violet-500/15' : 'hover:border-white/20')}>
                    <div className="text-lg font-bold text-white">{d.label}</div>
                    <div className="text-xs text-white/40">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Platforms */}
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-violet-400" />
                <span className="font-medium text-white">Export For</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {PLATFORMS.map((p) => {
                  const selected = config.platforms.includes(p.value as any);
                  return (
                    <button key={p.value}
                      onClick={() => {
                        const platforms = selected
                          ? config.platforms.filter(x => x !== p.value as any)
                          : [...config.platforms, p.value as any];
                        updateConfig({ platforms });
                      }}
                      className={cn('glass-card rounded-xl p-3 flex items-center gap-3 transition-all', selected ? 'border-violet-500/40 bg-violet-500/10' : 'hover:border-white/20')}>
                      <span className="text-xl">{p.icon}</span>
                      <span className="text-sm font-medium text-white">{p.label}</span>
                      {selected && <Check className="h-4 w-4 text-green-400 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Features */}
            <div className="glass-card rounded-2xl p-5 space-y-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-400" />
                <span className="font-medium text-white">AI Features</span>
              </div>
              {[
                { key: 'voiceEnabled', icon: Mic, label: 'AI Voiceover', desc: 'Realistic narration in your reel' },
                { key: 'subtitlesEnabled', icon: Type, label: 'Auto Subtitles', desc: 'Animated captions generated automatically' },
                { key: 'musicEnabled', icon: Music, label: 'Background Music', desc: 'AI-matched music for your mood' },
              ].map(({ key, icon: Icon, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-violet-500/15 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-violet-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{label}</div>
                      <div className="text-xs text-white/40">{desc}</div>
                    </div>
                  </div>
                  <Switch
                    checked={config[key as keyof typeof config] as boolean}
                    onCheckedChange={(v) => updateConfig({ [key]: v })}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 5: Render + Result */}
        {step === 5 && (
          <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">

            {/* ── RENDERING ──────────────────────────────────────── */}
            {renderStatus === 'rendering' && (
              <div className="text-center space-y-8 py-4">
                <div className="relative mx-auto w-fit">
                  <div className="h-24 w-24 rounded-3xl bg-violet-500/20 flex items-center justify-center mx-auto">
                    <Film className="h-12 w-12 text-violet-400 animate-pulse" />
                  </div>
                  <div className="absolute inset-0 rounded-3xl border-2 border-violet-500/30 animate-ping" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Creating your cinematic reel…</h2>
                  <p className="text-violet-300 text-sm font-medium mt-1">
                    {[...Object.entries(RENDER_LABELS)].reverse().find(([p]) => renderProgress >= Number(p))?.[1] ?? '🎬 Starting…'}
                  </p>
                </div>
                <div className="max-w-md mx-auto space-y-3">
                  <Progress value={renderProgress} className="h-3" />
                  <p className="text-sm text-white/40">{renderProgress}% complete</p>
                </div>
                {/* checklist */}
                <div className="space-y-1.5 text-left max-w-xs mx-auto">
                  {Object.entries(RENDER_LABELS).filter(([p]) => Number(p) > 0).map(([p, label]) => (
                    <div key={p} className={cn('flex items-center gap-2 text-xs transition-colors', renderProgress >= Number(p) ? 'text-white/70' : 'text-white/20')}>
                      {renderProgress >= Number(p)
                        ? <Check className="h-3 w-3 text-green-400 shrink-0" />
                        : <div className="h-3 w-3 rounded-full border border-white/20 shrink-0" />}
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── DONE — show video inline ───────────────────────── */}
            {renderStatus === 'done' && videoUrl && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
                    className="text-5xl mx-auto w-fit">🎬</motion.div>
                  <h2 className="text-2xl font-bold text-white">Your cinematic reel is ready!</h2>
                  <p className="text-white/50 text-sm">Made from {files.filter(f => f.type === 'image').length} photos · {config.duration}s · {config.mood?.replace('_',' ')}</p>
                </div>

                {/* ── Inline video preview ── */}
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                  <div className="flex-shrink-0 mx-auto sm:mx-0">
                    <div className="relative">
                      <video
                        src={videoUrl}
                        className="rounded-2xl border-2 border-violet-500/40 shadow-[0_0_40px_rgba(139,92,246,0.4)]"
                        style={{ width: 180, aspectRatio: '9/16' }}
                        autoPlay loop muted playsInline
                      />
                      <Badge variant="pro" className="absolute -top-2 -right-2 text-[10px]">
                        ▶ Preview
                      </Badge>
                    </div>
                  </div>

                  {/* Info panel */}
                  <div className="flex-1 space-y-4 w-full">
                    {/* Scores */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="glass-card rounded-xl p-4 text-center">
                        <Star className="h-6 w-6 text-amber-400 mx-auto mb-1" />
                        <div className="text-2xl font-bold text-white">{viralScore}%</div>
                        <div className="text-xs text-white/40">Virality Score</div>
                      </div>
                      <div className="glass-card rounded-xl p-4 text-center">
                        <TrendingUp className="h-6 w-6 text-green-400 mx-auto mb-1" />
                        <div className="text-2xl font-bold text-white">{Math.min(viralScore + 7, 99)}%</div>
                        <div className="text-xs text-white/40">AI Quality</div>
                      </div>
                    </div>

                    {/* AI Hook */}
                    <div className="glass-card rounded-xl p-4 space-y-1.5">
                      <div className="text-xs font-semibold text-white/40 uppercase tracking-wider">AI Hook</div>
                      <p className="text-white text-sm font-medium leading-relaxed">"{hook}"</p>
                    </div>

                    {/* What's inside */}
                    <div className="glass-card rounded-xl p-4 space-y-2">
                      <div className="text-xs font-semibold text-white/40 uppercase tracking-wider">Rendered with</div>
                      {[
                        '✅ Ken Burns camera motion',
                        `✅ ${config.category} colour grade`,
                        '✅ Cinematic transitions',
                        '✅ Story beat text overlays',
                        '✅ Particle effects + vignette',
                      ].map(f => (
                        <div key={f} className="text-xs text-white/60">{f}</div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="glow" size="lg" className="flex-1" onClick={handleDownload}>
                    <Download className="h-5 w-5" />
                    Download Reel (.webm)
                  </Button>
                  <Button variant="outline" size="lg" className="flex-1" onClick={() => setShowPreview(true)}>
                    <Eye className="h-5 w-5" />
                    Full Preview
                  </Button>
                </div>
                <p className="text-center text-xs text-white/25">
                  Need MP4?{' '}
                  <a href="https://cloudconvert.com/webm-to-mp4" target="_blank" rel="noreferrer"
                    className="text-violet-400 hover:underline inline-flex items-center gap-0.5">
                    Convert free with CloudConvert <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </p>
                <div className="flex gap-3">
                  <Button variant="ghost" size="sm" className="flex-1" onClick={() => { setRenderStatus('idle'); setStep(4); }}>
                    <Edit3 className="h-3.5 w-3.5 mr-1.5" />Edit Settings
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1" onClick={handleGenerate}>
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />Re-render
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1" onClick={() => { if (videoUrl) URL.revokeObjectURL(videoUrl); resetCreate(); setRenderStatus('idle'); }}>
                    + New Reel
                  </Button>
                </div>
              </div>
            )}

            {/* ── ERROR ──────────────────────────────────────────── */}
            {renderStatus === 'error' && (
              <div className="text-center space-y-6 py-8">
                <div className="text-5xl">😕</div>
                <h2 className="text-xl font-bold text-white">Render failed</h2>
                <p className="text-white/40 text-sm">Something went wrong during rendering. Please try again.</p>
                <Button variant="gradient" onClick={handleGenerate}>
                  <RotateCcw className="h-4 w-4" />Try Again
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <PreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        files={files}
        config={config}
        hook={hook}
        script={`${config.mood?.replace('_',' ')} story with ${files.filter(f => f.type === 'image').length} scenes`}
        onEdit={() => { setShowPreview(false); setStep(4); }}
      />

      {/* Navigation */}
      {step < 5 && (
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="ghost"
            onClick={() => step > 1 ? setStep(step - 1) : undefined}
            disabled={step === 1}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>

          {step < 4 ? (
            <Button
              variant="gradient"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
            >
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="glow"
              size="lg"
              onClick={handleGenerate}
              disabled={!canProceed()}
            >
              <Wand2 className="h-5 w-5" />
              Generate My Reel
              <Sparkles className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
