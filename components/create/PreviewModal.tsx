'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Edit3, Check, ChevronLeft, ChevronRight, Maximize2, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { UploadedFile } from '@/lib/store';

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  files: UploadedFile[];
  config: {
    title: string;
    category: string | null;
    mood: string | null;
    duration: number;
  };
  hook?: string;
  script?: string;
  onEdit: () => void;
}

const MOOD_GRADIENTS: Record<string, string> = {
  CINEMATIC: 'from-slate-900 via-violet-950 to-slate-900',
  EMOTIONAL: 'from-rose-950 via-purple-950 to-slate-900',
  VIRAL: 'from-orange-950 via-red-950 to-slate-900',
  COZY: 'from-amber-950 via-orange-950 to-stone-900',
  DREAMY: 'from-indigo-950 via-purple-950 to-violet-950',
  LUXURY: 'from-yellow-950 via-amber-950 to-slate-900',
  FAST_PACED: 'from-cyan-950 via-blue-950 to-slate-900',
  RETRO: 'from-amber-900 via-orange-900 to-red-950',
  MINIMAL: 'from-slate-900 via-slate-800 to-slate-900',
  DOCUMENTARY: 'from-stone-900 via-slate-800 to-stone-900',
  AESTHETIC: 'from-pink-950 via-rose-950 to-purple-950',
};

export default function PreviewModal({
  open, onClose, files, config, hook, script, onEdit
}: PreviewModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const imageFiles = files.filter(f => f.type === 'image');
  const total = imageFiles.length;
  const slideMs = total > 0 ? (config.duration * 1000) / total : 3000;
  const gradient = MOOD_GRADIENTS[config.mood || ''] || MOOD_GRADIENTS.CINEMATIC;

  useEffect(() => {
    if (!open) { setPlaying(false); setCurrentSlide(0); setElapsed(0); }
  }, [open]);

  useEffect(() => {
    if (playing && total > 0) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => {
          const next = prev + 100;
          if (next >= config.duration * 1000) {
            setPlaying(false);
            setCurrentSlide(0);
            return 0;
          }
          setCurrentSlide(Math.floor((next / (config.duration * 1000)) * total));
          return next;
        });
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, total, config.duration]);

  const prev = () => setCurrentSlide(s => Math.max(0, s - 1));
  const next = () => setCurrentSlide(s => Math.min(total - 1, s + 1));
  const togglePlay = () => {
    if (!playing && elapsed >= config.duration * 1000) {
      setElapsed(0); setCurrentSlide(0);
    }
    setPlaying(p => !p);
  };
  const restart = () => { setPlaying(false); setCurrentSlide(0); setElapsed(0); };

  const progress = config.duration > 0 ? (elapsed / (config.duration * 1000)) * 100 : 0;

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          className="relative z-10 flex flex-col sm:flex-row gap-6 items-start max-w-3xl w-full"
          onClick={e => e.stopPropagation()}
        >
          {/* Phone frame — reel preview */}
          <div className="flex-shrink-0 mx-auto sm:mx-0">
            {/* Phone chrome */}
            <div className="relative" style={{ width: 220 }}>
              <div className="relative bg-black rounded-[2.5rem] border-4 border-white/15 shadow-2xl overflow-hidden" style={{ aspectRatio: '9/16' }}>
                {/* Screen content */}
                {imageFiles.length > 0 ? (
                  <div className="relative w-full h-full">
                    <img
                      src={imageFiles[currentSlide]?.preview}
                      alt=""
                      className="w-full h-full object-cover"
                      style={{ transition: playing ? 'none' : 'opacity 0.4s ease' }}
                    />
                    {/* Cinematic gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-b ${gradient} opacity-40`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                    {/* Hook text */}
                    {hook && currentSlide === 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute inset-x-3 top-1/2 -translate-y-1/2 text-center"
                      >
                        <p className="text-white font-bold text-xs leading-tight drop-shadow-lg"
                          style={{ textShadow: '0 0 20px rgba(139,92,246,0.8)' }}>
                          "{hook}"
                        </p>
                      </motion.div>
                    )}

                    {/* Slide counter */}
                    <div className="absolute top-3 right-3">
                      <span className="text-[10px] bg-black/50 text-white/70 px-1.5 py-0.5 rounded-full">
                        {currentSlide + 1}/{total}
                      </span>
                    </div>

                    {/* Mood badge */}
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] bg-violet-600/60 text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                        {config.mood?.replace('_', ' ') || 'CINEMATIC'}
                      </span>
                    </div>

                    {/* Slide dots */}
                    <div className="absolute bottom-8 inset-x-0 flex justify-center gap-1">
                      {imageFiles.map((_, i) => (
                        <button key={i} onClick={() => setCurrentSlide(i)}
                          className={cn('h-1 rounded-full transition-all', i === currentSlide ? 'w-4 bg-violet-400' : 'w-1 bg-white/30')} />
                      ))}
                    </div>

                    {/* Progress bar */}
                    <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white/10">
                      <div className="h-full bg-violet-500 transition-none" style={{ width: `${progress}%` }} />
                    </div>

                    {/* Watermark */}
                    <div className="absolute bottom-3 right-2 text-[9px] text-white/40">StoryReel AI</div>

                    {/* Play overlay */}
                    {!playing && (
                      <button
                        onClick={togglePlay}
                        className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors"
                      >
                        <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Play className="h-6 w-6 text-white fill-current ml-0.5" />
                        </div>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className={`w-full h-full bg-gradient-to-b ${gradient} flex items-center justify-center`}>
                    <p className="text-white/40 text-xs text-center px-4">No photos uploaded</p>
                  </div>
                )}
              </div>

              {/* Playback controls */}
              <div className="flex items-center justify-center gap-3 mt-4">
                <button onClick={restart} className="text-white/40 hover:text-white transition-colors">
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button onClick={prev} disabled={currentSlide === 0}
                  className="text-white/40 hover:text-white disabled:opacity-20 transition-colors">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={togglePlay}
                  className="h-9 w-9 rounded-full bg-violet-600 flex items-center justify-center hover:bg-violet-500 transition-colors">
                  {playing
                    ? <Pause className="h-4 w-4 text-white" />
                    : <Play className="h-4 w-4 text-white fill-current ml-0.5" />}
                </button>
                <button onClick={next} disabled={currentSlide === total - 1}
                  className="text-white/40 hover:text-white disabled:opacity-20 transition-colors">
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button onClick={() => setMuted(m => !m)} className="text-white/40 hover:text-white transition-colors">
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              </div>

              <p className="text-center text-xs text-white/25 mt-2">
                {Math.round(elapsed / 1000)}s / {config.duration}s
              </p>
            </div>
          </div>

          {/* Info panel */}
          <div className="flex-1 space-y-4">
            {/* Close */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Reel Preview</h2>
              <button onClick={onClose} className="h-8 w-8 rounded-xl glass flex items-center justify-center text-white/40 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Reel info */}
            <div className="glass-card rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40 uppercase tracking-wider">Title</span>
                <span className="text-sm font-medium text-white">{config.title || 'Untitled Reel'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40 uppercase tracking-wider">Category</span>
                <span className="text-sm text-white/70">{config.category?.replace('_', ' ') || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40 uppercase tracking-wider">Mood</span>
                <span className="text-sm text-white/70">{config.mood?.replace('_', ' ') || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40 uppercase tracking-wider">Duration</span>
                <span className="text-sm text-white/70">{config.duration}s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40 uppercase tracking-wider">Scenes</span>
                <span className="text-sm text-white/70">{total} photos</span>
              </div>
            </div>

            {/* AI Hook */}
            {hook && (
              <div className="glass-card rounded-2xl p-4 space-y-2">
                <span className="text-xs text-white/40 uppercase tracking-wider">AI Hook</span>
                <p className="text-sm text-white leading-relaxed">"{hook}"</p>
              </div>
            )}

            {/* Script preview */}
            {script && (
              <div className="glass-card rounded-2xl p-4 space-y-2">
                <span className="text-xs text-white/40 uppercase tracking-wider">AI Script</span>
                <p className="text-xs text-white/60 leading-relaxed line-clamp-4">{script}</p>
              </div>
            )}

            {/* Slide thumbnails */}
            <div className="space-y-2">
              <span className="text-xs text-white/40 uppercase tracking-wider">Scenes</span>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {imageFiles.map((f, i) => (
                  <button key={f.id} onClick={() => setCurrentSlide(i)}
                    className={cn('relative shrink-0 h-14 w-10 rounded-lg overflow-hidden border-2 transition-all',
                      i === currentSlide ? 'border-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]' : 'border-white/10 hover:border-white/30'
                    )}>
                    <img src={f.preview} alt="" className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 inset-x-0 bg-black/50 text-[8px] text-white/70 text-center py-0.5">
                      {i + 1}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={onEdit}>
                <Edit3 className="h-4 w-4" />
                Edit Settings
              </Button>
              <Button variant="gradient" className="flex-1" onClick={onClose}>
                <Check className="h-4 w-4" />
                Looks Good!
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
