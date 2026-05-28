'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Check, Film, Sparkles, ExternalLink, Lock, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { renderCinematicReel, type Category, type Mood } from '@/lib/cinematic-renderer';
import type { UploadedFile } from '@/lib/store';
import toast from 'react-hot-toast';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  files: UploadedFile[];
  config: {
    title: string;
    category: string | null;
    mood: string | null;
    duration: number;
    platforms: string[];
  };
  hook?: string;
}

const PLATFORMS = [
  { id: 'INSTAGRAM', label: 'Instagram Reels', icon: '📸', desc: '9:16 · 1080×1920' },
  { id: 'TIKTOK',    label: 'TikTok',           icon: '🎵', desc: '9:16 · 1080×1920' },
  { id: 'YOUTUBE',   label: 'YouTube Shorts',   icon: '▶️', desc: '9:16 · 1080×1920' },
  { id: 'WHATSAPP',  label: 'WhatsApp Status',  icon: '💬', desc: '9:16 · 720×1280'  },
];

const RENDER_STEPS = [
  { pct: 0,   label: '🎬 Building story structure...' },
  { pct: 15,  label: '🖼️ Applying colour grade...' },
  { pct: 30,  label: '✨ Adding Ken Burns effects...' },
  { pct: 50,  label: '🎞️ Rendering transitions...' },
  { pct: 65,  label: '💬 Placing text overlays...' },
  { pct: 80,  label: '🔥 Adding cinematic effects...' },
  { pct: 92,  label: '📦 Packaging your reel...' },
  { pct: 100, label: '✅ Done!' },
];

type State = 'idle' | 'rendering' | 'done' | 'error';

export default function ExportModal({ open, onClose, files, config, hook }: ExportModalProps) {
  const [platform, setPlatform]   = useState('INSTAGRAM');
  const [state, setState]         = useState<State>('idle');
  const [progress, setProgress]   = useState(0);
  const [downloadUrl, setUrl]     = useState<string | null>(null);
  const [errorMsg, setErrorMsg]   = useState('');

  const stepLabel = [...RENDER_STEPS].reverse().find(s => s.pct <= progress)?.label ?? RENDER_STEPS[0].label;

  const imageFiles = files.filter(f => f.type === 'image');

  const handleRender = async () => {
    if (imageFiles.length === 0) { toast.error('Upload at least one photo first!'); return; }

    setState('rendering');
    setProgress(0);
    setUrl(null);

    try {
      // Load HTMLImageElements from preview URLs
      const loadedImages = await Promise.all(
        imageFiles.map(f => new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload  = () => resolve(img);
          img.onerror = reject;
          img.src = f.preview;
        }))
      );

      const blob = await renderCinematicReel({
        images:     loadedImages,
        category:   (config.category as Category) || 'OTHER',
        mood:       (config.mood    as Mood)     || 'CINEMATIC',
        duration:   config.duration,
        hook:       hook || `Watch this amazing ${config.category?.toLowerCase() || ''} story ✨`,
        title:      config.title || 'My Story',
        onProgress: setProgress,
      });

      const url = URL.createObjectURL(blob);
      setUrl(url);
      setState('done');
      toast.success('🎬 Cinematic reel ready!');
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Render failed');
      setState('error');
      toast.error('Render failed. Please try again.');
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    const safe = (config.title || 'storyreel').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    a.download = `${safe}-${config.duration}s.webm`;
    a.click();
    toast.success('Downloading your reel!');
  };

  const reset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setState('idle'); setProgress(0); setUrl(null); setErrorMsg('');
  };

  const handleClose = () => { reset(); onClose(); };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={handleClose} />

        {/* Panel */}
        <motion.div initial={{ opacity: 0, scale: 0.94, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 24 }}
          className="relative glass-card rounded-3xl p-6 w-full max-w-md shadow-2xl"
        >
          <button onClick={handleClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-xl glass flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>

          {/* ── IDLE ──────────────────────────────────────────────── */}
          {state === 'idle' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <Film className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Export Cinematic Reel</h2>
                  <p className="text-xs text-white/40">
                    {imageFiles.length} scene{imageFiles.length !== 1 ? 's' : ''} · {config.duration}s ·&nbsp;
                    {config.mood?.replace('_', ' ') || 'CINEMATIC'} · {config.category || 'OTHER'}
                  </p>
                </div>
              </div>

              {/* What gets rendered */}
              <div className="glass rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">AI render includes</p>
                {[
                  '🎥 Ken Burns camera movement per scene',
                  '🌈 Cinematic colour grade for ' + (config.category || 'your content'),
                  '✨ Smooth transitions between scenes',
                  '💬 Hook text + story beat overlays',
                  useParticleLabel(config.category),
                  '🎬 Letterbox bars + vignette',
                  '📲 9:16 vertical format',
                ].map(feat => (
                  <div key={feat} className="flex items-center gap-2 text-xs text-white/60">
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Platform */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Optimise for</p>
                <div className="grid grid-cols-2 gap-2">
                  {PLATFORMS.map(p => (
                    <button key={p.id} onClick={() => setPlatform(p.id)}
                      className={cn('p-3 rounded-xl text-left transition-all border',
                        platform === p.id
                          ? 'bg-violet-500/15 border-violet-500/50'
                          : 'glass border-transparent hover:border-white/15')}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{p.icon}</span>
                        <div>
                          <p className="text-xs font-medium text-white leading-none">{p.label}</p>
                          <p className="text-[10px] text-white/35 mt-0.5">{p.desc}</p>
                        </div>
                        {platform === p.id && <Check className="h-3.5 w-3.5 text-violet-400 ml-auto" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button variant="glow" size="lg" className="w-full" onClick={handleRender}>
                <Sparkles className="h-5 w-5" />
                Render Cinematic Reel
              </Button>
            </div>
          )}

          {/* ── RENDERING ─────────────────────────────────────────── */}
          {state === 'rendering' && (
            <div className="space-y-8 text-center py-6">
              <div className="relative mx-auto w-fit">
                <div className="h-20 w-20 rounded-3xl bg-violet-500/20 flex items-center justify-center mx-auto">
                  <Film className="h-10 w-10 text-violet-400 animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-3xl border-2 border-violet-500/30 animate-ping" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-1">Rendering your reel…</h3>
                <p className="text-sm text-violet-300 font-medium">{stepLabel}</p>
              </div>

              <div className="space-y-2 max-w-xs mx-auto">
                <Progress value={progress} className="h-3" />
                <p className="text-xs text-white/40">{progress}% complete</p>
              </div>

              {/* Step checklist */}
              <div className="space-y-1 text-left max-w-xs mx-auto">
                {RENDER_STEPS.filter(s => s.pct > 0).map(s => (
                  <div key={s.pct} className={cn('flex items-center gap-2 text-xs transition-all',
                    progress >= s.pct ? 'text-white/70' : 'text-white/20')}>
                    {progress >= s.pct
                      ? <Check className="h-3 w-3 text-green-400 shrink-0" />
                      : <div className="h-3 w-3 rounded-full border border-white/20 shrink-0" />}
                    {s.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── DONE ──────────────────────────────────────────────── */}
          {state === 'done' && downloadUrl && (
            <div className="space-y-5 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.55 }}
                className="text-6xl">🎬</motion.div>

              <div>
                <h3 className="text-xl font-bold text-white">Your cinematic reel is ready!</h3>
                <p className="text-white/40 text-sm mt-1">
                  {imageFiles.length} scenes · {config.duration}s · {config.mood?.replace('_',' ')}
                </p>
              </div>

              {/* Inline video preview */}
              <div className="flex justify-center">
                <div className="relative">
                  <video
                    src={downloadUrl}
                    className="rounded-2xl border-2 border-violet-500/30 shadow-[0_0_30px_rgba(139,92,246,0.4)]"
                    style={{ width: 140, aspectRatio: '9/16' }}
                    autoPlay loop muted playsInline
                  />
                  <Badge variant="pro" className="absolute -top-2 -right-2 text-[10px]">
                    Preview
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <Button variant="glow" size="lg" className="w-full" onClick={handleDownload}>
                  <Download className="h-5 w-5" />
                  Download Reel (.webm)
                </Button>
                <p className="text-xs text-white/25">
                  WebM plays everywhere. Need MP4?{' '}
                  <a href="https://cloudconvert.com/webm-to-mp4" target="_blank" rel="noreferrer"
                    className="text-violet-400 hover:underline inline-flex items-center gap-0.5">
                    Convert free <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </p>
                <Button variant="ghost" size="sm" className="w-full text-white/40 hover:text-white" onClick={reset}>
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  Render again / different options
                </Button>
              </div>
            </div>
          )}

          {/* ── ERROR ─────────────────────────────────────────────── */}
          {state === 'error' && (
            <div className="space-y-6 text-center py-4">
              <div className="text-5xl">😕</div>
              <div>
                <h3 className="text-xl font-bold text-white">Render Failed</h3>
                <p className="text-white/40 text-sm mt-1">{errorMsg || 'Something went wrong.'}</p>
              </div>
              <Button variant="gradient" className="w-full" onClick={reset}>Try Again</Button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function useParticleLabel(category: string | null): string {
  if (!category) return '🎨 Visual effects';
  if (['COOKING', 'CAFE', 'FOOD_BUSINESS'].includes(category)) return '💨 Steam particle effects';
  if (['WEDDING', 'LUXURY', 'BIRTHDAY', 'FESTIVAL'].includes(category)) return '✨ Sparkle particle effects';
  return '🎨 Category-specific effects';
}
