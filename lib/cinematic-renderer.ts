/**
 * Cinematic Reel Renderer
 * Produces a genuine story-driven vertical video from uploaded photos.
 * Each category gets its own colour grade, transition suite, particle FX,
 * and story-beat text overlays — rendered entirely in the browser via Canvas.
 */

export type Mood =
  | 'CINEMATIC' | 'EMOTIONAL' | 'LUXURY' | 'COZY' | 'VIRAL'
  | 'FAST_PACED' | 'DREAMY' | 'RETRO' | 'MINIMAL' | 'DOCUMENTARY' | 'AESTHETIC';

export type Category =
  | 'COOKING' | 'TRAVEL' | 'BABY' | 'WEDDING' | 'PETS'
  | 'FASHION' | 'FOOD_BUSINESS' | 'CAFE' | 'FITNESS' | 'PRODUCT'
  | 'REAL_ESTATE' | 'FESTIVAL' | 'BIRTHDAY' | 'COUPLE' | 'LUXURY'
  | 'VLOG' | 'OTHER';

interface RenderOptions {
  images: HTMLImageElement[];
  category: Category;
  mood: Mood;
  duration: number;       // seconds
  hook: string;
  title: string;
  onProgress: (pct: number) => void;
}

// ─── Colour grades ───────────────────────────────────────────────────────────

const GRADE: Record<string, { warm: number; sat: number; contrast: number; tint: string; shadow: string }> = {
  COOKING:     { warm: 0.22,  sat: 1.18, contrast: 1.12, tint: 'rgba(255,140,0,0.08)',  shadow: 'rgba(40,15,0,0.55)' },
  TRAVEL:      { warm: 0.05,  sat: 1.22, contrast: 1.15, tint: 'rgba(0,100,200,0.07)',  shadow: 'rgba(0,10,30,0.55)' },
  WEDDING:     { warm: 0.15,  sat: 0.90, contrast: 1.08, tint: 'rgba(255,200,180,0.10)',shadow: 'rgba(30,10,20,0.50)' },
  PETS:        { warm: 0.12,  sat: 1.10, contrast: 1.05, tint: 'rgba(255,220,150,0.06)',shadow: 'rgba(20,10,0,0.45)'  },
  FITNESS:     { warm: -0.05, sat: 1.30, contrast: 1.20, tint: 'rgba(0,200,150,0.07)',  shadow: 'rgba(0,10,20,0.55)'  },
  LUXURY:      { warm: 0.18,  sat: 0.85, contrast: 1.12, tint: 'rgba(200,160,50,0.09)', shadow: 'rgba(10,5,0,0.60)'   },
  CAFE:        { warm: 0.25,  sat: 0.92, contrast: 1.08, tint: 'rgba(200,120,60,0.09)', shadow: 'rgba(30,10,0,0.50)'  },
  BABY:        { warm: 0.14,  sat: 0.88, contrast: 1.02, tint: 'rgba(255,230,210,0.10)',shadow: 'rgba(20,10,10,0.40)' },
  FASHION:     { warm: 0.02,  sat: 1.15, contrast: 1.18, tint: 'rgba(200,0,100,0.06)',  shadow: 'rgba(10,0,10,0.55)'  },
  COUPLE:      { warm: 0.10,  sat: 1.05, contrast: 1.10, tint: 'rgba(255,170,170,0.07)',shadow: 'rgba(20,0,10,0.50)'  },
  DEFAULT:     { warm: 0.08,  sat: 1.10, contrast: 1.10, tint: 'rgba(100,80,200,0.06)', shadow: 'rgba(5,0,15,0.55)'   },
};

// ─── Story beats per category ─────────────────────────────────────────────────

const STORY_BEATS: Record<string, string[]> = {
  COOKING: ['✨ The secret recipe', '🧄 Ingredients', '👐 The craft', '🔥 Cooking magic', '🍝 Plating', '😍 Perfection'],
  TRAVEL:  ['✈️ The journey begins', '🌍 Discovering', '📸 Golden moments', '🌅 Magic hour', '💫 Memories made'],
  WEDDING: ['💍 The beginning', '💐 Details', '🥂 Celebration', '💑 Forever', '✨ Pure joy'],
  PETS:    ['🐾 Meet the star', '😂 Playtime', '💤 Sweet moments', '❤️ Best friends', '🐾 Pure love'],
  FITNESS: ['💪 The grind', '🔥 Push harder', '⚡ No limits', '🏆 Results', '✨ Transformation'],
  BABY:    ['👶 Tiny toes', '💕 First moments', '😍 Pure joy', '🌟 Growing up', '❤️ Forever love'],
  CAFE:    ['☕ Good morning', '✨ The craft', '🌿 Fresh & local', '☕ Perfect cup', '😊 Moments'],
  FASHION: ['👗 The look', '✨ Details matter', '💃 Own it', '📸 Editorial', '🔥 Iconic'],
  DEFAULT: ['✨ The story', '🎬 Scene', '💫 Moments', '🌟 Highlight', '❤️ The end'],
};

// ─── Transitions ─────────────────────────────────────────────────────────────

type Transition = 'zoom-punch' | 'slide-left' | 'slide-up' | 'blur-out' | 'light-leak' | 'dissolve';

function getTransitions(mood: Mood): Transition[] {
  const map: Record<string, Transition[]> = {
    FAST_PACED: ['zoom-punch', 'slide-left', 'slide-up', 'zoom-punch'],
    VIRAL:      ['zoom-punch', 'slide-left', 'zoom-punch', 'slide-up'],
    CINEMATIC:  ['dissolve',   'blur-out',   'dissolve',   'light-leak'],
    EMOTIONAL:  ['dissolve',   'light-leak', 'dissolve',   'dissolve'],
    DREAMY:     ['blur-out',   'dissolve',   'light-leak', 'blur-out'],
    COZY:       ['dissolve',   'blur-out',   'dissolve',   'dissolve'],
    LUXURY:     ['dissolve',   'light-leak', 'blur-out',   'dissolve'],
  };
  return map[mood] || ['dissolve', 'slide-left', 'dissolve', 'zoom-punch'];
}

// ─── Ken Burns presets ────────────────────────────────────────────────────────

const KB_PRESETS = [
  { s0: 1.00, s1: 1.10, x0: 0.5, y0: 0.5, x1: 0.55, y1: 0.52 },  // slow zoom center
  { s0: 1.10, s1: 1.00, x0: 0.6, y0: 0.4, x1: 0.5,  y1: 0.5  },  // zoom out left
  { s0: 1.05, s1: 1.12, x0: 0.4, y0: 0.6, x1: 0.5,  y1: 0.5  },  // zoom in right-bottom
  { s0: 1.08, s1: 1.00, x0: 0.5, y0: 0.3, x1: 0.5,  y1: 0.5  },  // zoom out top
  { s0: 1.00, s1: 1.08, x0: 0.3, y0: 0.5, x1: 0.55, y1: 0.5  },  // pan right
  { s0: 1.06, s1: 1.00, x0: 0.5, y0: 0.7, x1: 0.5,  y1: 0.45 },  // pan up
];

// ─── Particles ────────────────────────────────────────────────────────────────

interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; color: string; }

function makeSteamParticles(w: number, h: number, count = 18): Particle[] {
  return Array.from({ length: count }, () => ({
    x: w * 0.3 + Math.random() * w * 0.4,
    y: h * 0.6 + Math.random() * h * 0.2,
    vx: (Math.random() - 0.5) * 0.6,
    vy: -0.8 - Math.random() * 1.2,
    life: 0,
    maxLife: 80 + Math.random() * 60,
    size: 3 + Math.random() * 6,
    color: 'rgba(255,255,255,',
  }));
}

function makeSparkles(w: number, h: number, count = 20): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -0.2 - Math.random() * 0.5,
    life: Math.random() * 120,
    maxLife: 100 + Math.random() * 80,
    size: 1 + Math.random() * 3,
    color: 'rgba(255,220,100,',
  }));
}

function tickParticles(particles: Particle[]): void {
  for (const p of particles) {
    p.x += p.vx; p.y += p.vy; p.life++;
    if (p.life > p.maxLife) { p.life = 0; p.x = p.x + (Math.random() - 0.5) * 20; }
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  for (const p of particles) {
    const t = p.life / p.maxLife;
    const alpha = t < 0.2 ? t / 0.2 : t > 0.7 ? (1 - t) / 0.3 : 1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (1 - t * 0.5), 0, Math.PI * 2);
    ctx.fillStyle = p.color + (alpha * 0.35) + ')';
    ctx.fill();
  }
}

// ─── Text animation helpers ───────────────────────────────────────────────────

function drawAnimText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  alpha: number,
  slideY: number,
  fontSize: number,
  color: string,
  shadow: boolean,
  align: CanvasTextAlign = 'center'
) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.font = `800 ${fontSize}px Inter, system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  if (shadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 3;
  }
  ctx.fillStyle = color;
  ctx.fillText(text, x, y + slideY);
  ctx.restore();
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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

// ─── Image drawing with blurred background fill ───────────────────────────────

function drawImageFill(ctx: CanvasRenderingContext2D, img: HTMLImageElement, cw: number, ch: number) {
  // Step 1: blurred background that fills the entire 9:16 canvas
  ctx.save();
  ctx.filter = 'blur(24px) brightness(0.45) saturate(1.3)';
  const bScale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
  const bw = img.naturalWidth * bScale * 1.1;
  const bh = img.naturalHeight * bScale * 1.1;
  ctx.drawImage(img, (cw - bw) / 2, (ch - bh) / 2, bw, bh);
  ctx.filter = 'none';
  ctx.restore();

  // Step 2: main image, fitted to cover 9:16 keeping aspect ratio
  const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
}

// ─── Colour grading via canvas ───────────────────────────────────────────────

function applyGrade(
  ctx: CanvasRenderingContext2D,
  cw: number, ch: number,
  grade: typeof GRADE[string]
) {
  // Warm/cool tint
  ctx.fillStyle = grade.tint;
  ctx.fillRect(0, 0, cw, ch);

  // Vignette
  const vig = ctx.createRadialGradient(cw / 2, ch / 2, ch * 0.22, cw / 2, ch / 2, ch * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, grade.shadow);
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, cw, ch);

  // Contrast / shadow lift using top+bottom gradient bars
  const topGrad = ctx.createLinearGradient(0, 0, 0, ch * 0.25);
  topGrad.addColorStop(0, 'rgba(0,0,0,0.45)');
  topGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, cw, ch * 0.25);

  const btmGrad = ctx.createLinearGradient(0, ch * 0.65, 0, ch);
  btmGrad.addColorStop(0, 'rgba(0,0,0,0)');
  btmGrad.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = btmGrad;
  ctx.fillRect(0, ch * 0.65, cw, ch * 0.35);
}

// ─── Letterbox bars ───────────────────────────────────────────────────────────

function drawBars(ctx: CanvasRenderingContext2D, cw: number, ch: number, barH: number) {
  ctx.fillStyle = 'rgba(0,0,0,0.88)';
  ctx.fillRect(0, 0, cw, barH);
  ctx.fillRect(0, ch - barH, cw, barH);
}

// ─── Transition rendering ─────────────────────────────────────────────────────

function applyTransition(
  ctx: CanvasRenderingContext2D,
  cw: number, ch: number,
  t: number,                     // 0→1 progress of the transition
  type: Transition
) {
  switch (type) {
    case 'dissolve':
      ctx.fillStyle = `rgba(0,0,0,${t})`;
      ctx.fillRect(0, 0, cw, ch);
      break;

    case 'light-leak': {
      const peak = 1 - Math.abs(t - 0.5) * 2;
      ctx.fillStyle = `rgba(255,240,200,${peak * 0.85})`;
      ctx.fillRect(0, 0, cw, ch);
      break;
    }

    case 'blur-out':
      // Simulated with a white flash + darkening
      ctx.fillStyle = `rgba(255,255,255,${t * 0.5})`;
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = `rgba(0,0,0,${t * 0.4})`;
      ctx.fillRect(0, 0, cw, ch);
      break;

    case 'zoom-punch': {
      // A fast dark flash
      const flash = t < 0.5 ? t * 2 : (1 - t) * 2;
      ctx.fillStyle = `rgba(0,0,0,${flash * 0.95})`;
      ctx.fillRect(0, 0, cw, ch);
      break;
    }

    case 'slide-left': {
      ctx.fillStyle = `rgba(0,0,0,${t * 0.7})`;
      ctx.fillRect(0, 0, cw * t, ch);
      break;
    }

    case 'slide-up': {
      ctx.fillStyle = `rgba(0,0,0,${t * 0.7})`;
      ctx.fillRect(0, 0, cw, ch * t);
      break;
    }
  }
}

// ─── Main renderer ────────────────────────────────────────────────────────────

export async function renderCinematicReel(opts: RenderOptions): Promise<Blob> {
  const { images, category, mood, duration, hook, title, onProgress } = opts;

  const CW = 540, CH = 960;
  const FPS = 30;
  const TOTAL_FRAMES = duration * FPS;
  const BAR_H = Math.round(CH * 0.06);
  const TRANS_FRAMES = mood === 'FAST_PACED' || mood === 'VIRAL' ? 8 : 18;

  const canvas = document.createElement('canvas');
  canvas.width = CW; canvas.height = CH;
  const ctx = canvas.getContext('2d', { willReadFrequently: false })!;

  const grade = GRADE[category] || GRADE.DEFAULT;
  const transitions = getTransitions(mood);
  const beats = STORY_BEATS[category] || STORY_BEATS.DEFAULT;
  const n = images.length;
  const framesPerScene = Math.floor((TOTAL_FRAMES - transitions.length * TRANS_FRAMES) / n);

  // Particles for this category
  const useParticles = ['COOKING', 'CAFE', 'FOOD_BUSINESS'].includes(category);
  const useSparkles = ['WEDDING', 'LUXURY', 'BIRTHDAY', 'FESTIVAL'].includes(category);
  const particles = useParticles ? makeSteamParticles(CW, CH) :
                    useSparkles  ? makeSparkles(CW, CH) : [];

  // KB preset per scene
  const kbs = images.map((_, i) => KB_PRESETS[i % KB_PRESETS.length]);

  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9' : 'video/webm';
  const stream = canvas.captureStream(FPS);
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
  recorder.start(100);

  let globalFrame = 0;

  const drawScene = (img: HTMLImageElement, sceneIdx: number, localFrame: number, totalSceneFrames: number) => {
    const t = localFrame / totalSceneFrames; // 0→1
    const kb = kbs[sceneIdx];

    // ── Background + image ──────────────────────────────────────────
    ctx.clearRect(0, 0, CW, CH);

    // Ken Burns transform
    const scale = kb.s0 + (kb.s1 - kb.s0) * t;
    const cx = (kb.x0 + (kb.x1 - kb.x0) * t) * CW;
    const cy = (kb.y0 + (kb.y1 - kb.y0) * t) * CH;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.translate(-CW / 2, -CH / 2);
    drawImageFill(ctx, img, CW, CH);
    ctx.restore();

    // ── Colour grade ────────────────────────────────────────────────
    applyGrade(ctx, CW, CH, grade);

    // ── Particles ───────────────────────────────────────────────────
    if (particles.length > 0) {
      tickParticles(particles);
      drawParticles(ctx, particles);
    }

    // ── Film grain ──────────────────────────────────────────────────
    if (localFrame % 3 === 0) {
      for (let i = 0; i < 600; i++) {
        const gx = Math.random() * CW;
        const gy = Math.random() * CH;
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`;
        ctx.fillRect(gx, gy, 1, 1);
      }
    }

    // ── Letterbox ───────────────────────────────────────────────────
    drawBars(ctx, CW, CH, BAR_H);

    // ── Story beat text ─────────────────────────────────────────────
    const beat = beats[Math.min(sceneIdx, beats.length - 1)];

    // Beat label (slides up from bottom of top bar)
    if (t < 0.75) {
      const fadeAlpha = t < 0.15 ? t / 0.15 : t > 0.55 ? (0.75 - t) / 0.2 : 1;
      const slideY = t < 0.15 ? (1 - t / 0.15) * 10 : 0;
      drawAnimText(ctx, beat, CW / 2, BAR_H / 2, fadeAlpha, slideY, 13, '#fff', false);
    }

    // ── Hook text (scene 0 only) ─────────────────────────────────────
    if (sceneIdx === 0 && hook) {
      const ha = t < 0.15 ? t / 0.15 : t > 0.65 ? (1 - (t - 0.65) / 0.2) : 1;
      const maxW = CW - 48;
      const words = hook.split(' ');
      const lines: string[] = [];
      let line = '';
      ctx.font = `800 ${Math.round(CW * 0.072)}px Inter, system-ui, sans-serif`;
      for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
        else line = test;
      }
      if (line) lines.push(line);
      const lh = Math.round(CW * 0.082);
      const totalH = lines.length * lh;
      const baseY = CH / 2 - totalH / 2;
      const slideY = (1 - ha) * 20;
      for (let i = 0; i < lines.length; i++) {
        drawAnimText(ctx, lines[i], CW / 2, baseY + i * lh, ha, slideY, Math.round(CW * 0.072), '#fff', true);
      }
    }

    // ── Title (scene 1+) ─────────────────────────────────────────────
    if (sceneIdx > 0 && sceneIdx < n - 1 && t > 0.1 && t < 0.7) {
      const ta = t < 0.2 ? (t - 0.1) / 0.1 : t > 0.55 ? (0.7 - t) / 0.15 : 1;
      const slideY = t < 0.2 ? (1 - (t - 0.1) / 0.1) * 14 : 0;
      drawAnimText(ctx, title || '', CW / 2, CH - BAR_H - 52, ta * 0.9, slideY, 15, 'rgba(255,255,255,0.85)', true);
    }

    // ── CTA on last scene ────────────────────────────────────────────
    if (sceneIdx === n - 1 && t > 0.35) {
      const ca = t > 0.35 ? Math.min((t - 0.35) / 0.2, 1) : 0;
      const cta = '👇 Full recipe in bio!';
      const btnW = CW * 0.7, btnH = 40, btnX = (CW - btnW) / 2, btnY = CH - BAR_H - 56;
      ctx.save();
      ctx.globalAlpha = ca;
      ctx.fillStyle = 'rgba(139,92,246,0.85)';
      drawRoundedRect(ctx, btnX, btnY - btnH / 2, btnW, btnH, 20);
      ctx.fill();
      ctx.font = `700 14px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.fillText(cta, CW / 2, btnY);
      ctx.restore();
    }

    // ── Scene dots ──────────────────────────────────────────────────
    const dotR = 2.5, dotSp = 10;
    const dotsX = CW / 2 - ((n - 1) * dotSp) / 2;
    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.arc(dotsX + i * dotSp, CH - BAR_H - 14, dotR, 0, Math.PI * 2);
      ctx.fillStyle = i === sceneIdx ? '#8b5cf6' : 'rgba(255,255,255,0.25)';
      ctx.fill();
    }

    // ── Watermark ───────────────────────────────────────────────────
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('StoryReel AI', CW - 12, CH - BAR_H - 18);
    ctx.restore();

    // ── Progress bar ────────────────────────────────────────────────
    const prog = globalFrame / TOTAL_FRAMES;
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(0, CH - 3, CW, 3);
    ctx.fillStyle = '#8b5cf6';
    ctx.fillRect(0, CH - 3, CW * prog, 3);
  };

  const renderFrame = async (fn: () => void) => new Promise<void>((resolve) => {
    requestAnimationFrame(() => { fn(); resolve(); });
  });

  // ─── Render loop ───────────────────────────────────────────────────────────
  for (let si = 0; si < n; si++) {
    const img = images[si];
    const isLast = si === n - 1;

    // Scene frames
    for (let f = 0; f < framesPerScene; f++) {
      await renderFrame(() => {
        drawScene(img, si, f, framesPerScene);
        globalFrame++;
        onProgress(Math.round((globalFrame / TOTAL_FRAMES) * 88));
      });
    }

    // Transition frames (except after last scene)
    if (!isLast) {
      const nextImg = images[si + 1];
      const tType = transitions[si % transitions.length];
      for (let f = 0; f < TRANS_FRAMES; f++) {
        await renderFrame(() => {
          const tp = f / TRANS_FRAMES;
          if (tp < 0.5) {
            drawScene(img, si, framesPerScene - 1, framesPerScene);
          } else {
            drawScene(nextImg, si + 1, 0, framesPerScene);
          }
          applyTransition(ctx, CW, CH, tp, tType);
          globalFrame++;
        });
      }
    }
  }

  onProgress(95);
  recorder.stop();
  await new Promise<void>((r) => { recorder.onstop = () => r(); });
  stream.getTracks().forEach((t) => t.stop());
  onProgress(100);

  return new Blob(chunks, { type: mimeType });
}
