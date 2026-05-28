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

export interface AISceneData {
  originalIndex: number;
  sceneTitle: string;
  narration: string;
  transition: 'dissolve' | 'zoom-punch' | 'slide-left' | 'slide-up' | 'blur-out' | 'light-leak';
  storyBeat: string;
  emotion: string;
  focusPoint: 'center' | 'top' | 'bottom' | 'left' | 'right';
  kenBurnsStyle: 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'pan-up' | 'pan-down';

  // ── NEW: AI-driven creative direction ─────────────────────────────────
  /** Animated emoji characters that float/bounce across this scene */
  characterEmojis?: string[];
  /** Lighting effect during this scene */
  lightingEffect?: 'none' | 'light-leak' | 'soft-glow' | 'color-flash' | 'sparkle-burst' | 'lens-flare';
  /** Hex colour for the flash/glow */
  effectColor?: string;
  /** Caption text style overrides for this scene */
  textStyle?: {
    fontSize?: 'sm' | 'md' | 'lg' | 'xl';
    position?: 'top' | 'middle' | 'bottom';
    color?: string;          // hex
    background?: 'none' | 'pill' | 'highlight';
    animation?: 'fade' | 'slide-up' | 'pop' | 'typewriter' | 'bounce';
    rotation?: number;       // degrees
  };
  /** Emoji shown big in the centre as an accent (only for some scenes) */
  emojiAccent?: string;
}

/** AI-directed visual brief for the entire reel */
export interface AICreativeBrief {
  /** Custom hex colour palette the AI chose for this reel */
  palette?: {
    primary: string;      // hex, dominant accent
    secondary: string;    // hex, secondary accent
    overlay: string;      // hex, full-screen tint at low alpha
    shadow: string;       // hex, vignette shadow
  };
  /** Custom particle FX — AI picks emojis & behaviour */
  particles?: {
    emojis: string[];          // ['🍝', '✨'] etc.
    behaviour: 'rise' | 'fall' | 'drift' | 'burst' | 'orbit';
    density: 'low' | 'medium' | 'high';
    speed: 'slow' | 'medium' | 'fast';
  };
  /** Overall visual style of the reel */
  visualStyle?: 'cinematic-dark' | 'bright-airy' | 'retro-warm' | 'neon-pop' | 'dreamy-pastel' | 'documentary-natural' | 'luxury-gold' | 'high-energy';
  /** Background music vibe the AI suggests */
  musicVibe?: string;
  /** One-line creative concept that describes the reel direction */
  creativeConcept?: string;
}

interface RenderOptions {
  images: HTMLImageElement[];
  category: Category;
  mood: Mood;
  duration: number;
  hook: string;
  title: string;
  ctaText?: string;
  aiScenes?: AISceneData[];
  brief?: AICreativeBrief;
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

// ─── AI-driven helpers ───────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const m = hex.replace('#', '').match(/.{1,2}/g);
  if (!m || m.length < 3) return `rgba(0,0,0,${alpha})`;
  const [r, g, b] = m.map(h => parseInt(h, 16));
  return `rgba(${r},${g},${b},${alpha})`;
}

function applyAIGrade(ctx: CanvasRenderingContext2D, cw: number, ch: number, palette: NonNullable<AICreativeBrief['palette']>) {
  // Overlay tint
  ctx.fillStyle = hexToRgba(palette.overlay, 0.18);
  ctx.fillRect(0, 0, cw, ch);

  // Vignette
  const vig = ctx.createRadialGradient(cw / 2, ch / 2, ch * 0.22, cw / 2, ch / 2, ch * 0.78);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, hexToRgba(palette.shadow, 0.7));
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, cw, ch);

  // Top/bottom mood gradient
  const top = ctx.createLinearGradient(0, 0, 0, ch * 0.25);
  top.addColorStop(0, 'rgba(0,0,0,0.45)');
  top.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, cw, ch * 0.25);

  const btm = ctx.createLinearGradient(0, ch * 0.65, 0, ch);
  btm.addColorStop(0, 'rgba(0,0,0,0)');
  btm.addColorStop(1, hexToRgba(palette.shadow, 0.65));
  ctx.fillStyle = btm;
  ctx.fillRect(0, ch * 0.65, cw, ch * 0.35);
}

// ── AI emoji particle system ────────────────────────────────────────────────

interface EmojiParticle {
  emoji: string;
  x: number; y: number;
  vx: number; vy: number;
  rotation: number; rotSpeed: number;
  size: number;
  life: number; maxLife: number;
}

function makeEmojiParticles(
  cw: number, ch: number,
  emojis: string[],
  behaviour: 'rise' | 'fall' | 'drift' | 'burst' | 'orbit',
  density: 'low' | 'medium' | 'high',
  speed: 'slow' | 'medium' | 'fast'
): EmojiParticle[] {
  if (!emojis || emojis.length === 0) return [];
  const count = density === 'low' ? 6 : density === 'high' ? 16 : 10;
  const spMul = speed === 'slow' ? 0.5 : speed === 'fast' ? 1.6 : 1;

  return Array.from({ length: count }, () => {
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    const base: EmojiParticle = {
      emoji, x: Math.random() * cw, y: Math.random() * ch,
      vx: 0, vy: 0,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04,
      size: 14 + Math.random() * 18,
      life: Math.random() * 80, maxLife: 120 + Math.random() * 80,
    };
    switch (behaviour) {
      case 'rise':  base.vy = -(0.5 + Math.random() * 1) * spMul; base.vx = (Math.random() - 0.5) * 0.3; base.y = ch * 0.7 + Math.random() * ch * 0.3; break;
      case 'fall':  base.vy = (0.5 + Math.random() * 1) * spMul; base.vx = (Math.random() - 0.5) * 0.3; base.y = -20 - Math.random() * 40; break;
      case 'drift': base.vx = (Math.random() - 0.5) * 0.6 * spMul; base.vy = (Math.random() - 0.5) * 0.6 * spMul; break;
      case 'burst':
        const angle = Math.random() * Math.PI * 2;
        const sp = (0.8 + Math.random() * 1.2) * spMul;
        base.vx = Math.cos(angle) * sp; base.vy = Math.sin(angle) * sp;
        base.x = cw / 2; base.y = ch / 2; break;
      case 'orbit':
        const oAng = Math.random() * Math.PI * 2;
        const r = ch * 0.3;
        base.x = cw / 2 + Math.cos(oAng) * r;
        base.y = ch / 2 + Math.sin(oAng) * r;
        base.vx = -Math.sin(oAng) * spMul; base.vy = Math.cos(oAng) * spMul;
        break;
    }
    return base;
  });
}

function tickEmojiParticles(ps: EmojiParticle[], cw: number, ch: number, behaviour: string) {
  for (const p of ps) {
    p.x += p.vx; p.y += p.vy; p.rotation += p.rotSpeed; p.life++;
    if (p.life > p.maxLife || p.y < -40 || p.y > ch + 40 || p.x < -40 || p.x > cw + 40) {
      p.life = 0;
      if (behaviour === 'rise') { p.y = ch + 10 + Math.random() * 30; p.x = Math.random() * cw; }
      else if (behaviour === 'fall') { p.y = -10 - Math.random() * 30; p.x = Math.random() * cw; }
      else { p.x = Math.random() * cw; p.y = Math.random() * ch; }
    }
  }
}

function drawEmojiParticles(ctx: CanvasRenderingContext2D, ps: EmojiParticle[]) {
  for (const p of ps) {
    const t = p.life / p.maxLife;
    const a = t < 0.15 ? t / 0.15 : t > 0.75 ? (1 - t) / 0.25 : 1;
    if (a <= 0) continue;
    ctx.save();
    ctx.globalAlpha = a * 0.85;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation * 0.3);
    ctx.font = `${p.size}px system-ui, "Apple Color Emoji", "Segoe UI Emoji"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.emoji, 0, 0);
    ctx.restore();
  }
}

// ── Lighting effects ────────────────────────────────────────────────────────

function applyLighting(
  ctx: CanvasRenderingContext2D,
  cw: number, ch: number,
  effect: AISceneData['lightingEffect'],
  color: string,
  t: number
) {
  if (!effect || effect === 'none') return;
  switch (effect) {
    case 'light-leak': {
      const peak = 1 - Math.abs(t - 0.5) * 1.6;
      if (peak <= 0) return;
      const g = ctx.createRadialGradient(cw * 0.85, ch * 0.15, 0, cw * 0.85, ch * 0.15, cw * 0.9);
      g.addColorStop(0, hexToRgba(color, peak * 0.55));
      g.addColorStop(0.3, hexToRgba(color, peak * 0.25));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);
      break;
    }
    case 'soft-glow': {
      const a = 0.18 + Math.sin(t * Math.PI) * 0.12;
      const g = ctx.createRadialGradient(cw / 2, ch / 2, 0, cw / 2, ch / 2, ch * 0.5);
      g.addColorStop(0, hexToRgba(color, a));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);
      break;
    }
    case 'color-flash': {
      const peak = t < 0.12 ? t / 0.12 : 0;
      if (peak <= 0) return;
      ctx.fillStyle = hexToRgba(color, peak * 0.6);
      ctx.fillRect(0, 0, cw, ch);
      break;
    }
    case 'sparkle-burst': {
      if (t < 0.4) {
        const a = 1 - t / 0.4;
        for (let i = 0; i < 28; i++) {
          const sx = Math.random() * cw, sy = Math.random() * ch;
          ctx.beginPath();
          ctx.arc(sx, sy, 1 + Math.random() * 2, 0, Math.PI * 2);
          ctx.fillStyle = hexToRgba(color, a * (0.4 + Math.random() * 0.6));
          ctx.fill();
        }
      }
      break;
    }
    case 'lens-flare': {
      const peak = 1 - Math.abs(t - 0.3) * 1.4;
      if (peak <= 0) return;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const g = ctx.createRadialGradient(cw * 0.7, ch * 0.3, 0, cw * 0.7, ch * 0.3, cw * 0.7);
      g.addColorStop(0, hexToRgba(color, peak * 0.5));
      g.addColorStop(0.5, hexToRgba(color, peak * 0.18));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);
      ctx.restore();
      break;
    }
  }
}

// ─── Main renderer ────────────────────────────────────────────────────────────

// ─── AI-driven KB preset ─────────────────────────────────────────────────────

function getAIKenBurns(style: AISceneData['kenBurnsStyle'], focusPoint: AISceneData['focusPoint']) {
  const focusMap: Record<string, { x: number; y: number }> = {
    center: { x: 0.5, y: 0.5 }, top: { x: 0.5, y: 0.3 },
    bottom: { x: 0.5, y: 0.7 }, left: { x: 0.3, y: 0.5 }, right: { x: 0.7, y: 0.5 },
  };
  const { x: fx, y: fy } = focusMap[focusPoint] || focusMap.center;
  switch (style) {
    case 'zoom-in':  return { s0: 1.00, s1: 1.10, x0: fx, y0: fy, x1: fx + 0.02, y1: fy + 0.01 };
    case 'zoom-out': return { s0: 1.10, s1: 1.00, x0: fx + 0.05, y0: fy + 0.03, x1: fx, y1: fy };
    case 'pan-left': return { s0: 1.05, s1: 1.05, x0: 0.6, y0: fy, x1: 0.4, y1: fy };
    case 'pan-right':return { s0: 1.05, s1: 1.05, x0: 0.4, y0: fy, x1: 0.6, y1: fy };
    case 'pan-up':   return { s0: 1.05, s1: 1.05, x0: fx, y0: 0.65, x1: fx, y1: 0.42 };
    case 'pan-down': return { s0: 1.05, s1: 1.05, x0: fx, y0: 0.38, x1: fx, y1: 0.62 };
    default:         return KB_PRESETS[0];
  }
}

export async function renderCinematicReel(opts: RenderOptions): Promise<Blob> {
  const { images, category, mood, duration, hook, title, ctaText, aiScenes, brief, onProgress } = opts;

  const CW = 540, CH = 960;
  const FPS = 30;
  const TOTAL_FRAMES = duration * FPS;
  const BAR_H = Math.round(CH * 0.06);
  const TRANS_FRAMES = mood === 'FAST_PACED' || mood === 'VIRAL' ? 8 : 18;

  const canvas = document.createElement('canvas');
  canvas.width = CW; canvas.height = CH;
  const ctx = canvas.getContext('2d', { willReadFrequently: false })!;

  // Fallbacks if AI brief is missing
  const fallbackPalette = { primary: '#8b5cf6', secondary: '#ec4899', overlay: '#0a0518', shadow: '#04020a' };
  const palette = brief?.palette ?? fallbackPalette;
  const fallbackTransitions = getTransitions(mood);
  const fallbackBeats = STORY_BEATS[category] || STORY_BEATS.DEFAULT;

  // ── Re-order images using AI scene sequence ──────────────────────────────
  let orderedImages = images;
  let orderedScenes = aiScenes;
  if (aiScenes && aiScenes.length > 0) {
    orderedImages = aiScenes
      .filter(s => s.originalIndex < images.length)
      .map(s => images[s.originalIndex]);
    orderedScenes = aiScenes.filter(s => s.originalIndex < images.length);
  }

  const n = orderedImages.length;
  const framesPerScene = Math.floor((TOTAL_FRAMES - (n - 1) * TRANS_FRAMES) / n);

  // ── AI-driven emoji particles (replaces hardcoded steam/sparkle presets) ─
  const particleEmojis = brief?.particles?.emojis?.filter(Boolean) ?? [];
  const emojiParticles = particleEmojis.length > 0
    ? makeEmojiParticles(CW, CH, particleEmojis,
        brief?.particles?.behaviour ?? 'rise',
        brief?.particles?.density ?? 'medium',
        brief?.particles?.speed ?? 'medium')
    : [];

  // Per-scene KB: use AI data or fallback to presets
  const kbs = orderedImages.map((_, i) => {
    const sceneAI = orderedScenes?.[i];
    return sceneAI
      ? getAIKenBurns(sceneAI.kenBurnsStyle, sceneAI.focusPoint)
      : KB_PRESETS[i % KB_PRESETS.length];
  });

  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9' : 'video/webm';
  const stream = canvas.captureStream(FPS);
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
  recorder.start(100);

  let globalFrame = 0;

  const drawScene = (img: HTMLImageElement, sceneIdx: number, localFrame: number, totalSceneFrames: number) => {
    const t = localFrame / totalSceneFrames;
    const kb = kbs[sceneIdx];
    const aiScene = orderedScenes?.[sceneIdx];

    ctx.clearRect(0, 0, CW, CH);

    // ── Ken Burns (AI-driven direction per scene) ────────────────────
    const scale = kb.s0 + (kb.s1 - kb.s0) * t;
    const cx = (kb.x0 + (kb.x1 - kb.x0) * t) * CW;
    const cy = (kb.y0 + (kb.y1 - kb.y0) * t) * CH;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.translate(-CW / 2, -CH / 2);
    drawImageFill(ctx, img, CW, CH);
    ctx.restore();

    // ── AI-driven colour grade ───────────────────────────────────────
    applyAIGrade(ctx, CW, CH, palette);

    // ── AI-driven lighting effect for THIS scene ─────────────────────
    if (aiScene?.lightingEffect && aiScene.lightingEffect !== 'none') {
      applyLighting(ctx, CW, CH, aiScene.lightingEffect, aiScene.effectColor || palette.primary, t);
    }

    // ── AI emoji particles (rendered above image) ────────────────────
    if (emojiParticles.length > 0) {
      tickEmojiParticles(emojiParticles, CW, CH, brief?.particles?.behaviour ?? 'rise');
      drawEmojiParticles(ctx, emojiParticles);
    }

    // ── Film grain ──────────────────────────────────────────────────
    if (localFrame % 3 === 0) {
      for (let i = 0; i < 600; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`;
        ctx.fillRect(Math.random() * CW, Math.random() * CH, 1, 1);
      }
    }

    // ── Big emoji accent (AI-chosen, on scenes where it fits) ────────
    if (aiScene?.emojiAccent && t > 0.2 && t < 0.7) {
      const ea = t < 0.32 ? (t - 0.2) / 0.12 : t > 0.55 ? (0.7 - t) / 0.15 : 1;
      const bounce = Math.sin(t * Math.PI * 3) * 6;
      ctx.save();
      ctx.globalAlpha = ea * 0.92;
      ctx.font = `${Math.round(CW * 0.18)}px system-ui, "Apple Color Emoji", "Segoe UI Emoji"`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.shadowColor = hexToRgba(palette.primary, 0.6);
      ctx.shadowBlur = 18;
      ctx.fillText(aiScene.emojiAccent, CW / 2, CH * 0.32 + bounce);
      ctx.restore();
    }

    // ── Letterbox ───────────────────────────────────────────────────
    drawBars(ctx, CW, CH, BAR_H);

    // ── Scene title with AI-driven text style ────────────────────────
    const sceneLabel = aiScene?.sceneTitle ?? fallbackBeats[Math.min(sceneIdx, fallbackBeats.length - 1)];
    const ts = aiScene?.textStyle ?? {};
    if (t < 0.82 && sceneLabel) {
      const sizeMul = ts.fontSize === 'sm' ? 0.040 : ts.fontSize === 'lg' ? 0.066 : ts.fontSize === 'xl' ? 0.082 : 0.052;
      const fontSize = Math.round(CW * sizeMul);
      const textColor = ts.color || '#fff';
      // Position
      let yPos: number;
      if (ts.position === 'top')      yPos = BAR_H + fontSize * 1.2;
      else if (ts.position === 'middle') yPos = CH * 0.5;
      else if (ts.position === 'bottom') yPos = CH - BAR_H - fontSize * 1.5;
      else                               yPos = BAR_H + fontSize * 0.9;     // default top-band
      // Animation
      const fa = t < 0.18 ? t / 0.18 : t > 0.62 ? (0.82 - t) / 0.2 : 1;
      let sy = 0;
      const anim = ts.animation || 'slide-up';
      if (anim === 'slide-up')   sy = t < 0.18 ? (1 - t / 0.18) * 18 : 0;
      else if (anim === 'pop')   sy = t < 0.12 ? (1 - t / 0.12) * -14 : 0;
      else if (anim === 'bounce') sy = Math.sin(t * Math.PI * 4) * 3;
      // Optional rotation
      const rot = (ts.rotation || 0) * Math.PI / 180;

      ctx.save();
      ctx.globalAlpha = fa;
      ctx.translate(CW / 2, yPos + sy);
      ctx.rotate(rot);
      ctx.font = `800 ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Pill / highlight background
      if (ts.background === 'pill') {
        const m = ctx.measureText(sceneLabel);
        const padX = fontSize * 0.55, padY = fontSize * 0.4;
        const bw = m.width + padX * 2;
        const bh = fontSize + padY * 2;
        ctx.fillStyle = hexToRgba(palette.primary, 0.85);
        drawRoundedRect(ctx, -bw / 2, -bh / 2, bw, bh, bh / 2);
        ctx.fill();
      } else if (ts.background === 'highlight') {
        const m = ctx.measureText(sceneLabel);
        ctx.fillStyle = hexToRgba(palette.secondary, 0.65);
        ctx.fillRect(-m.width / 2 - 8, -fontSize * 0.55, m.width + 16, fontSize * 1.1);
      }

      ctx.shadowColor = 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = textColor;
      ctx.fillText(sceneLabel, 0, 0);
      ctx.restore();
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
      const baseY = CH / 2 - (lines.length * lh) / 2;
      const slideY = (1 - ha) * 20;
      for (let i = 0; i < lines.length; i++) {
        drawAnimText(ctx, lines[i], CW / 2, baseY + i * lh, ha, slideY, Math.round(CW * 0.072), '#fff', true);
      }
    }

    // ── Narration subtitle (scenes 1+) — AI-specific text ────────────
    if (sceneIdx > 0 && aiScene?.narration && t > 0.12 && t < 0.72) {
      const ta = t < 0.22 ? (t - 0.12) / 0.1 : t > 0.57 ? (0.72 - t) / 0.15 : 1;
      const sy = t < 0.22 ? (1 - (t - 0.12) / 0.1) * 14 : 0;
      // Word-wrap narration at bottom
      const maxW = CW - 48;
      const words = aiScene.narration.split(' ');
      const lines: string[] = [];
      let line = '';
      ctx.font = `500 ${Math.round(CW * 0.042)}px Inter, system-ui, sans-serif`;
      for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
        else line = test;
      }
      if (line) lines.push(line);
      const lh = Math.round(CW * 0.052);
      const baseY = CH - BAR_H - 26 - lines.length * lh;
      for (let i = 0; i < lines.length; i++) {
        drawAnimText(ctx, lines[i], CW / 2, baseY + i * lh, ta * 0.9, sy, Math.round(CW * 0.042), 'rgba(255,255,255,0.88)', true);
      }
    }

    // ── Fallback title for middle scenes (no AI) ─────────────────────
    if (!aiScene && sceneIdx > 0 && sceneIdx < n - 1 && t > 0.1 && t < 0.7) {
      const ta = t < 0.2 ? (t - 0.1) / 0.1 : t > 0.55 ? (0.7 - t) / 0.15 : 1;
      const sy = t < 0.2 ? (1 - (t - 0.1) / 0.1) * 14 : 0;
      drawAnimText(ctx, title || '', CW / 2, CH - BAR_H - 52, ta * 0.9, sy, 15, 'rgba(255,255,255,0.85)', true);
    }

    // ── CTA pill on last scene (uses AI palette for colour) ─────────
    if (sceneIdx === n - 1 && t > 0.35) {
      const ca = Math.min((t - 0.35) / 0.2, 1);
      const ctaLabel = ctaText || (aiScene ? '👇 Save this!' : '👇 Full recipe in bio!');
      const btnW = CW * 0.72, btnH = 40, btnX = (CW - btnW) / 2, btnY = CH - BAR_H - 58;
      ctx.save();
      ctx.globalAlpha = ca;
      ctx.fillStyle = hexToRgba(palette.primary, 0.92);
      drawRoundedRect(ctx, btnX, btnY - btnH / 2, btnW, btnH, 20);
      ctx.fill();
      ctx.shadowColor = hexToRgba(palette.primary, 0.6);
      ctx.shadowBlur = 16;
      ctx.font = `700 14px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.fillText(ctaLabel, CW / 2, btnY);
      ctx.restore();
    }

    // ── Scene dots (palette-coloured) ───────────────────────────────
    const dotR = 2.5, dotSp = 10;
    const dotsX = CW / 2 - ((n - 1) * dotSp) / 2;
    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.arc(dotsX + i * dotSp, CH - BAR_H - 14, dotR, 0, Math.PI * 2);
      ctx.fillStyle = i === sceneIdx ? palette.primary : 'rgba(255,255,255,0.25)';
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

    // ── Progress bar (palette-coloured) ──────────────────────────────
    const prog = globalFrame / TOTAL_FRAMES;
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(0, CH - 3, CW, 3);
    ctx.fillStyle = palette.primary;
    ctx.fillRect(0, CH - 3, CW * prog, 3);
  };

  const renderFrame = async (fn: () => void) => new Promise<void>((resolve) => {
    requestAnimationFrame(() => { fn(); resolve(); });
  });

  // ─── Render loop ───────────────────────────────────────────────────────────
  for (let si = 0; si < n; si++) {
    const img = orderedImages[si];
    const isLast = si === n - 1;

    // Scene frames
    for (let f = 0; f < framesPerScene; f++) {
      await renderFrame(() => {
        drawScene(img, si, f, framesPerScene);
        globalFrame++;
        onProgress(Math.round((globalFrame / TOTAL_FRAMES) * 88));
      });
    }

    // Transition: use AI-specified type, or fallback
    if (!isLast) {
      const nextImg = orderedImages[si + 1];
      const tType = (orderedScenes?.[si]?.transition as Transition) ?? fallbackTransitions[si % fallbackTransitions.length];
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
