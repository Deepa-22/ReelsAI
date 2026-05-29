'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Sparkles, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { drawMascot } from '@/lib/mascot/mascot-character';
import { drawScene, SCENE_LABELS, type SceneName } from '@/lib/mascot/mascot-scenes';
import { getActionState, ACTION_LABELS, type ActionName } from '@/lib/mascot/mascot-animations';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const ACTIONS: ActionName[] = [
  'idle', 'wave', 'walk', 'drink', 'stretch', 'sit',
  'sad', 'happy-bounce', 'dance', 'hand-on-heart', 'looking-around', 'thinking',
];
const SCENES: SceneName[] = [
  'bedroom-morning', 'kitchen-window', 'living-room',
  'bathroom-mirror', 'park-outdoors', 'yoga-mat', 'cozy-evening',
];

export default function MascotStudioPage() {
  const [action, setAction] = useState<ActionName>('wave');
  const [scene, setScene]   = useState<SceneName>('bedroom-morning');
  const [text, setText]     = useState('Day 1 of healing PMOS 🤍');
  const [playing, setPlaying] = useState(true);
  const [recording, setRecording] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [lastVideoUrl, setLastVideoUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef(performance.now());
  const rafRef = useRef<number | null>(null);

  // Render loop for live preview
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tick = (now: number) => {
      if (playing) {
        const t = (now - startTimeRef.current) / 1000;
        renderFrame(ctx, canvas.width, canvas.height, t, scene, action, text);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [scene, action, text, playing]);

  // Record + download a 6-second video
  const handleRecord = async () => {
    if (recording) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    setRecording(true);
    setRenderProgress(0);
    setLastVideoUrl(null);

    try {
      const recordDurationS = 6;
      const fps = 30;
      const totalFrames = recordDurationS * fps;
      const stream = canvas.captureStream(fps);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9' : 'video/webm';
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 6_000_000 });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.start(100);

      const ctx = canvas.getContext('2d')!;
      const recordStart = performance.now();
      let frame = 0;

      // Drive the canvas ourselves while recording for clean timing
      await new Promise<void>((resolve) => {
        const step = () => {
          const elapsed = (performance.now() - recordStart) / 1000;
          if (elapsed >= recordDurationS) { resolve(); return; }
          renderFrame(ctx, canvas.width, canvas.height, elapsed, scene, action, text);
          frame++;
          setRenderProgress(Math.round((elapsed / recordDurationS) * 100));
          requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });

      recorder.stop();
      await new Promise<void>((r) => { recorder.onstop = () => r(); });
      stream.getTracks().forEach((t) => t.stop());

      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setLastVideoUrl(url);
      setRenderProgress(100);

      // Auto-download
      const a = document.createElement('a');
      a.href = url;
      const safe = `${action}-${scene}`;
      a.download = `honesthormones-${safe}.webm`;
      a.click();
      toast.success('🎬 Video saved!');
    } catch (e) {
      console.error(e);
      toast.error('Render failed');
    } finally {
      setRecording(false);
    }
  };

  const resetTime = () => { startTimeRef.current = performance.now(); };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">Mascot Studio</h1>
            <Badge variant="pro" className="text-[10px]">₹0 / VIDEO</Badge>
          </div>
          <p className="text-sm text-white/40 mt-0.5">Code-drawn animated mascot. Pick an action + scene + text → record video → upload to YouTube.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6">
        {/* Phone-frame preview */}
        <div className="flex justify-center lg:justify-start">
          <div className="space-y-3">
            <div className="relative" style={{ width: 360 }}>
              <div className="bg-black rounded-[2.5rem] border-4 border-white/15 shadow-2xl overflow-hidden" style={{ width: 360, aspectRatio: '9/16' }}>
                <canvas ref={canvasRef} width={360} height={640} className="w-full h-full block" />
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
            {/* Record button */}
            <Button variant="gradient" className="w-full" onClick={handleRecord} disabled={recording}>
              {recording
                ? <><Loader2 className="h-4 w-4 animate-spin" />Recording… {renderProgress}%</>
                : <><Download className="h-4 w-4" />Record 6-sec video</>}
            </Button>
            {lastVideoUrl && !recording && (
              <a href={lastVideoUrl} download={`honesthormones-${action}-${scene}.webm`}
                 className="text-center block text-xs text-violet-300 hover:underline">
                ⬇ Download again
              </a>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-5">
          {/* Action picker */}
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <div className="text-xs font-semibold text-white/40 uppercase tracking-wider">Action (what she does)</div>
            <div className="grid grid-cols-3 gap-1.5">
              {ACTIONS.map(a => (
                <button key={a} onClick={() => setAction(a)}
                  className={cn('px-2 py-2 rounded-lg text-xs font-medium transition-all text-left flex items-center gap-1.5',
                    action === a ? 'bg-violet-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]' : 'glass text-white/70 hover:text-white')}>
                  <span className="text-base">{ACTION_LABELS[a].emoji}</span>
                  <span className="truncate">{ACTION_LABELS[a].label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Scene picker */}
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <div className="text-xs font-semibold text-white/40 uppercase tracking-wider">Scene (where she is)</div>
            <div className="grid grid-cols-3 gap-1.5">
              {SCENES.map(sc => (
                <button key={sc} onClick={() => setScene(sc)}
                  className={cn('px-2 py-2 rounded-lg text-xs font-medium transition-all text-left flex items-center gap-1.5',
                    scene === sc ? 'bg-pink-500 text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]' : 'glass text-white/70 hover:text-white')}>
                  <span className="text-base">{SCENE_LABELS[sc].emoji}</span>
                  <span className="truncate">{SCENE_LABELS[sc].label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text overlay */}
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <div className="text-xs font-semibold text-white/40 uppercase tracking-wider">Text overlay (caption)</div>
            <textarea value={text} onChange={e => setText(e.target.value)} maxLength={80} rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none" />
            <div className="text-[10px] text-white/30 text-right">{text.length}/80</div>
          </div>

          {/* Quick combos */}
          <div className="glass-card rounded-2xl p-4 space-y-3"
               style={{ background: 'linear-gradient(135deg, rgba(232,160,183,0.10), rgba(139,92,246,0.06))', border: '1px solid rgba(232,160,183,0.3)' }}>
            <div className="text-xs font-semibold text-pink-200 uppercase tracking-wider">🌸 PMOS daily combos</div>
            <div className="grid grid-cols-1 gap-1.5">
              {QUICK_COMBOS.map(c => (
                <button key={c.label} onClick={() => { setAction(c.action); setScene(c.scene); setText(c.text); resetTime(); }}
                  className="text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-violet-500/15 border border-transparent hover:border-violet-500/30 transition-all">
                  <div className="text-xs font-medium text-white">{c.label}</div>
                  <div className="text-[10px] text-white/50">{c.text}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="glass-card rounded-2xl p-4 space-y-2">
            <div className="text-xs font-semibold text-white/40 uppercase tracking-wider">How it works</div>
            <ul className="text-xs text-white/65 space-y-1">
              <li>✅ Character drawn entirely in code — no AI image generation</li>
              <li>✅ Each action animates body parts independently</li>
              <li>✅ Scenes drawn procedurally — sun rays animate, plants sway</li>
              <li>✅ Click <b>Record</b> → 6-sec video downloads as .webm</li>
              <li>✅ Convert to MP4 free at <a href="https://cloudconvert.com/webm-to-mp4" target="_blank" rel="noreferrer" className="text-violet-300 hover:underline">CloudConvert</a></li>
              <li className="text-pink-300">💰 ZERO API cost. Make 1000 videos a day if you want.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── The actual render function — used both for live preview and recording ──
function renderFrame(
  ctx: CanvasRenderingContext2D,
  cw: number, ch: number,
  t: number,
  scene: SceneName,
  action: ActionName,
  text: string,
) {
  // Clear + draw scene background
  ctx.clearRect(0, 0, cw, ch);
  drawScene(ctx, scene, cw, ch, t);

  // Position character — centred horizontally, feet near floor
  const charScale = 1.45;
  const charX = cw / 2;
  const charY = ch * 0.72;
  const state = getActionState(action, t);
  drawMascot(ctx, charX, charY, charScale, state);

  // Caption text overlay
  if (text) {
    drawCaption(ctx, text, cw, ch, t);
  }
}

function drawCaption(ctx: CanvasRenderingContext2D, text: string, cw: number, ch: number, t: number) {
  const fontSize = Math.round(cw * 0.062);
  ctx.font = `800 ${fontSize}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Word wrap
  const maxW = cw * 0.85;
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);

  const lh = fontSize * 1.18;
  const totalH = lines.length * lh;
  const baseY = ch * 0.14;
  const fadeIn = Math.min(1, t / 0.5);

  ctx.save();
  ctx.globalAlpha = fadeIn;
  // Pill background
  const longest = lines.reduce((m, l) => Math.max(m, ctx.measureText(l).width), 0);
  ctx.fillStyle = 'rgba(20,10,15,0.7)';
  roundRect(ctx, cw / 2 - longest / 2 - 18, baseY - 12, longest + 36, totalH + 26, 16);
  ctx.fill();
  // Text
  ctx.shadowColor = 'rgba(0,0,0,0.85)';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#fff';
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], cw / 2, baseY + i * lh + lh / 2);
  }
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── Daily PMOS content combos for one-tap setup ────────────────────────────
const QUICK_COMBOS: { label: string; action: ActionName; scene: SceneName; text: string }[] = [
  { label: '🌅 Morning struggle',  action: 'sad',           scene: 'bedroom-morning', text: 'Day 1 of healing PMOS 🤍' },
  { label: '💧 Hydration win',     action: 'drink',         scene: 'kitchen-window',  text: 'I chose myself today ✨' },
  { label: '🧘 Yoga over HIIT',    action: 'stretch',       scene: 'yoga-mat',        text: 'Cortisol-friendly movement only' },
  { label: '👋 Wave hi to viewers', action: 'wave',          scene: 'living-room',     text: 'Hi friend, you\'re not alone 🌸' },
  { label: '🤍 Hand on heart',     action: 'hand-on-heart', scene: 'cozy-evening',    text: 'Healing is not linear' },
  { label: '🎉 Strong day win',    action: 'happy-bounce',  scene: 'park-outdoors',   text: 'My first regular period in years!' },
  { label: '🤔 Researching',       action: 'thinking',      scene: 'living-room',     text: 'Tests every PMOS girl should ask for' },
  { label: '💃 Healing dance',     action: 'dance',         scene: 'living-room',     text: 'Some days you just dance' },
];
