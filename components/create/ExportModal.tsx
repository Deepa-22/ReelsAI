'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, X, Check, Instagram, Youtube, Share2,
  Loader2, Sparkles, Film, Lock, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
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
  { id: 'INSTAGRAM', label: 'Instagram Reels', icon: '📸', size: '1080×1920', format: 'MP4 / WebM', free: true },
  { id: 'TIKTOK', label: 'TikTok', icon: '🎵', size: '1080×1920', format: 'MP4 / WebM', free: true },
  { id: 'YOUTUBE', label: 'YouTube Shorts', icon: '▶️', size: '1080×1920', format: 'MP4 / WebM', free: true },
  { id: 'WHATSAPP', label: 'WhatsApp Status', icon: '💬', size: '720×1280', format: 'MP4 / WebM', free: true },
  { id: 'DOWNLOAD', label: 'Download (HD)', icon: '💾', size: '1080×1920', format: 'WebM HD', free: false },
];

const QUALITIES = [
  { id: 'SD', label: 'SD', desc: '720p · Fast', free: true },
  { id: 'HD', label: 'HD', desc: '1080p · Best', free: false },
];

type ExportState = 'idle' | 'rendering' | 'done' | 'error';

export default function ExportModal({ open, onClose, files, config, hook }: ExportModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState('INSTAGRAM');
  const [selectedQuality, setSelectedQuality] = useState('SD');
  const [exportState, setExportState] = useState<ExportState>('idle');
  const [exportProgress, setExportProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateReelVideo = async (): Promise<Blob | null> => {
    const imageFiles = files.filter(f => f.type === 'image');
    if (imageFiles.length === 0) return null;

    const isHD = selectedQuality === 'HD';
    const width = 540;
    const height = 960;
    const fps = 30;
    const durationPerSlide = Math.max(1.5, (config.duration / imageFiles.length));
    const totalDuration = config.duration;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Load all images first
    const loadedImages = await Promise.all(
      imageFiles.map(f => new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = f.preview;
      }))
    );

    const stream = canvas.captureStream(fps);
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';

    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: isHD ? 4_000_000 : 1_500_000 });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

    recorder.start(100);

    const startTime = performance.now();
    const endTime = startTime + totalDuration * 1000;

    const MOOD_COLORS: Record<string, [string, string]> = {
      CINEMATIC: ['#0a0014', '#1a0030'],
      EMOTIONAL: ['#0d0020', '#200010'],
      VIRAL: ['#000d1a', '#001a0d'],
      COZY: ['#1a0d00', '#0d0a00'],
      DREAMY: ['#0a0020', '#100020'],
      LUXURY: ['#0d0a00', '#1a1200'],
      DEFAULT: ['#090b13', '#0d0f1a'],
    };
    const [bg1, bg2] = MOOD_COLORS[config.mood || 'DEFAULT'] || MOOD_COLORS.DEFAULT;

    const getSlideIndex = (elapsed: number) => {
      const idx = Math.floor(elapsed / durationPerSlide) % loadedImages.length;
      return Math.min(idx, loadedImages.length - 1);
    };
    const getSlideProgress = (elapsed: number) => {
      return (elapsed % durationPerSlide) / durationPerSlide;
    };

    await new Promise<void>((resolve) => {
      const drawFrame = () => {
        const now = performance.now();
        const elapsed = (now - startTime) / 1000;
        const totalProgress = elapsed / totalDuration;

        if (now >= endTime) {
          resolve();
          return;
        }

        const slideIdx = getSlideIndex(elapsed);
        const slideProgress = getSlideProgress(elapsed);
        const img = loadedImages[slideIdx];

        // Background gradient
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, bg1);
        grad.addColorStop(1, bg2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Draw image with Ken Burns zoom effect
        const scale = 1.0 + slideProgress * 0.08;
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const canvasAspect = width / height;
        let drawW, drawH, drawX, drawY;
        if (imgAspect > canvasAspect) {
          drawH = height * scale;
          drawW = drawH * imgAspect;
        } else {
          drawW = width * scale;
          drawH = drawW / imgAspect;
        }
        drawX = (width - drawW) / 2;
        drawY = (height - drawH) / 2;

        // Cinematic fade-in/out per slide
        const fadeIn = Math.min(slideProgress * 6, 1);
        const fadeOut = slideProgress > 0.8 ? 1 - (slideProgress - 0.8) * 5 : 1;
        ctx.globalAlpha = Math.min(fadeIn, fadeOut);
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.globalAlpha = 1;

        // Cinematic letterbox bars
        const barH = Math.round(height * 0.07);
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, width, barH);
        ctx.fillRect(0, height - barH, width, barH);

        // Vignette overlay
        const vignette = ctx.createRadialGradient(width / 2, height / 2, height * 0.2, width / 2, height / 2, height * 0.8);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);

        // Hook text overlay (first 2 seconds)
        if (hook && elapsed < 2) {
          const textAlpha = Math.min(elapsed * 3, 1) * (elapsed > 1.5 ? 1 - (elapsed - 1.5) * 2 : 1);
          ctx.globalAlpha = textAlpha;
          ctx.shadowColor = 'rgba(139,92,246,0.8)';
          ctx.shadowBlur = 20;
          ctx.font = `bold ${Math.round(width * 0.055)}px Inter, system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillStyle = '#fff';
          const hookLine = hook.length > 40 ? hook.slice(0, 40) + '...' : hook;
          ctx.fillText(hookLine, width / 2, height * 0.5);
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        }

        // Watermark
        ctx.globalAlpha = 0.5;
        ctx.font = `${Math.round(width * 0.032)}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'right';
        ctx.fillText('StoryReel AI', width - 16, height - barH - 12);
        ctx.globalAlpha = 1;

        // Slide counter dots
        const dotR = 3;
        const dotSpacing = 14;
        const totalDots = loadedImages.length;
        const dotsStartX = width / 2 - ((totalDots - 1) * dotSpacing) / 2;
        loadedImages.forEach((_, i) => {
          ctx.beginPath();
          ctx.arc(dotsStartX + i * dotSpacing, height - barH - 18, dotR, 0, Math.PI * 2);
          ctx.fillStyle = i === slideIdx ? '#8b5cf6' : 'rgba(255,255,255,0.3)';
          ctx.fill();
        });

        // Progress bar at bottom
        ctx.fillStyle = 'rgba(139,92,246,0.8)';
        ctx.fillRect(0, height - 3, width * totalProgress, 3);

        setExportProgress(Math.round(totalProgress * 90));
        requestAnimationFrame(drawFrame);
      };
      requestAnimationFrame(drawFrame);
    });

    recorder.stop();
    await new Promise<void>((r) => { recorder.onstop = () => r(); });
    stream.getTracks().forEach(t => t.stop());
    return new Blob(chunks, { type: mimeType });
  };

  const handleExport = async () => {
    if (files.length === 0) {
      toast.error('No photos to export!');
      return;
    }
    setExportState('rendering');
    setExportProgress(0);
    setDownloadUrl(null);

    try {
      const blob = await generateReelVideo();
      if (!blob) throw new Error('No images to render');

      setExportProgress(100);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setExportState('done');
      toast.success('Reel exported! Click Download to save.');
    } catch (err) {
      console.error(err);
      setExportState('error');
      toast.error('Export failed. Please try again.');
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    const title = config.title || 'my-reel';
    const safeTitle = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    a.download = `storyreel-${safeTitle}-${config.duration}s.webm`;
    a.click();
    toast.success('Downloading your reel!');
  };

  const handleClose = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setExportState('idle');
    setExportProgress(0);
    setDownloadUrl(null);
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative glass-card rounded-3xl p-6 w-full max-w-md shadow-2xl"
        >
          {/* Close */}
          <button onClick={handleClose} className="absolute top-4 right-4 h-8 w-8 rounded-xl glass flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>

          {exportState === 'idle' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="h-9 w-9 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <Download className="h-5 w-5 text-violet-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Export Reel</h2>
                </div>
                <p className="text-white/40 text-sm ml-12">
                  {files.filter(f => f.type === 'image').length} photos · {config.duration}s · {config.mood?.toLowerCase() || 'cinematic'}
                </p>
              </div>

              {/* Platform */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Export For</label>
                <div className="space-y-2">
                  {PLATFORMS.map((p) => (
                    <button key={p.id} onClick={() => setSelectedPlatform(p.id)}
                      className={cn('w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left',
                        selectedPlatform === p.id ? 'bg-violet-500/15 border border-violet-500/40' : 'glass hover:bg-white/8 border border-transparent'
                      )}>
                      <span className="text-xl">{p.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white">{p.label}</div>
                        <div className="text-xs text-white/35">{p.size} · {p.format}</div>
                      </div>
                      {!p.free && <Badge variant="gold" className="text-[10px]"><Lock className="h-2.5 w-2.5 mr-0.5" />Pro</Badge>}
                      {selectedPlatform === p.id && <Check className="h-4 w-4 text-violet-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Quality</label>
                <div className="grid grid-cols-2 gap-2">
                  {QUALITIES.map((q) => (
                    <button key={q.id} onClick={() => q.free && setSelectedQuality(q.id)}
                      className={cn('p-3 rounded-xl text-center transition-all relative',
                        selectedQuality === q.id ? 'bg-violet-500/15 border border-violet-500/40' : 'glass border border-transparent hover:bg-white/8',
                        !q.free && 'opacity-60 cursor-not-allowed'
                      )}>
                      <div className="text-sm font-bold text-white">{q.label}</div>
                      <div className="text-xs text-white/40">{q.desc}</div>
                      {!q.free && <Badge variant="gold" className="text-[10px] absolute top-1 right-1">Pro</Badge>}
                    </button>
                  ))}
                </div>
              </div>

              <Button variant="glow" size="lg" className="w-full" onClick={handleExport}>
                <Film className="h-5 w-5" />
                Render & Export Reel
              </Button>
            </div>
          )}

          {exportState === 'rendering' && (
            <div className="space-y-8 text-center py-4">
              <div className="relative inline-block mx-auto">
                <div className="h-20 w-20 rounded-3xl bg-violet-500/20 flex items-center justify-center mx-auto">
                  <Film className="h-10 w-10 text-violet-400 animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-3xl border-2 border-violet-500/30 animate-ping" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Rendering your reel…</h3>
                <p className="text-white/40 text-sm">Creating cinematic slideshow from {files.filter(f => f.type === 'image').length} photos</p>
              </div>
              <div className="space-y-2">
                <Progress value={exportProgress} className="h-3" />
                <p className="text-sm text-white/40">{exportProgress}%</p>
              </div>
              <div className="flex gap-2 justify-center text-xs text-white/30">
                {['🎬 Frames', '✨ Effects', '🎵 Audio', '📦 Packaging'].map((step, i) => (
                  <span key={step} className={exportProgress > i * 25 ? 'text-violet-400' : ''}>{step}</span>
                ))}
              </div>
            </div>
          )}

          {exportState === 'done' && downloadUrl && (
            <div className="space-y-6 text-center py-2">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
                className="text-6xl">🎉</motion.div>
              <div>
                <h3 className="text-xl font-bold text-white">Your reel is ready!</h3>
                <p className="text-white/40 text-sm mt-1">
                  {config.duration}s · {files.filter(f => f.type === 'image').length} scenes · WebM format
                </p>
              </div>

              {/* Preview */}
              <div className="flex justify-center">
                <video
                  src={downloadUrl}
                  className="w-32 rounded-xl border border-violet-500/30 shadow-glow"
                  style={{ aspectRatio: '9/16' }}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>

              <div className="space-y-3">
                <Button variant="glow" size="lg" className="w-full" onClick={handleDownload}>
                  <Download className="h-5 w-5" />
                  Download Reel (.webm)
                </Button>
                <p className="text-xs text-white/25">
                  WebM plays on all modern devices. Convert to MP4 with{' '}
                  <a href="https://cloudconvert.com/webm-to-mp4" target="_blank" rel="noreferrer" className="text-violet-400 hover:underline inline-flex items-center gap-0.5">
                    CloudConvert <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </p>
                <Button variant="ghost" size="sm" className="w-full" onClick={() => { setExportState('idle'); setDownloadUrl(null); }}>
                  ← Export Again / Different Platform
                </Button>
              </div>
            </div>
          )}

          {exportState === 'error' && (
            <div className="space-y-6 text-center py-4">
              <div className="text-5xl">❌</div>
              <div>
                <h3 className="text-xl font-bold text-white">Export Failed</h3>
                <p className="text-white/40 text-sm mt-1">Something went wrong during rendering. Please try again.</p>
              </div>
              <Button variant="gradient" className="w-full" onClick={() => setExportState('idle')}>Try Again</Button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
