/**
 * Character Animator
 *
 * Takes a static character pose PNG and brings it to life on Canvas via:
 *   - Subtle breathing (rhythmic scale)
 *   - Gentle head sway (translation + micro-rotation)
 *   - Eye blink overlay (timed)
 *   - Ken Burns toward face for emotional emphasis
 *   - Mood-driven ambient particles
 *   - Color/lighting overlay per mood
 *   - Subtle vignette pulse
 *
 * Combine multiple of these per scene → static image FEELS alive without paid
 * image-to-video AI.
 *
 * Used by /character-test for preview and Story Mode for production renders.
 */

export type CharacterMood = 'tired' | 'gentle' | 'worried' | 'happy' | 'sad' | 'strong';

export type ParticleType = 'steam' | 'sparkles' | 'hearts' | 'dust' | 'tears' | 'sun-rays' | 'none';

export interface CharacterAnimationOptions {
  /** Mood drives lighting + particle defaults */
  mood: CharacterMood;
  /** Override default particles for this mood */
  particles?: ParticleType;
  /** Ken Burns intensity 0-1 (default 0.5) */
  kenBurnsIntensity?: number;
  /** Breathing intensity 0-1 (default 0.5) */
  breathIntensity?: number;
  /** Head sway intensity 0-1 (default 0.5) */
  swayIntensity?: number;
  /** Enable blinking */
  blink?: boolean;
}

interface CharParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  rotation: number;
  emoji?: string;
}

const MOOD_DEFAULTS: Record<CharacterMood, { particles: ParticleType; lightTone: string; lightAlpha: number }> = {
  tired:   { particles: 'dust',       lightTone: '#F5C490', lightAlpha: 0.12 },
  gentle:  { particles: 'sparkles',   lightTone: '#FFE7C2', lightAlpha: 0.10 },
  worried: { particles: 'dust',       lightTone: '#8E6F8C', lightAlpha: 0.18 },
  happy:   { particles: 'hearts',     lightTone: '#FFC8D9', lightAlpha: 0.10 },
  sad:     { particles: 'tears',      lightTone: '#6F8A9E', lightAlpha: 0.20 },
  strong:  { particles: 'sun-rays',   lightTone: '#FFD680', lightAlpha: 0.12 },
};

export class CharacterAnimator {
  private particles: CharParticle[] = [];

  constructor(
    private readonly cw: number,
    private readonly ch: number,
    private readonly opts: CharacterAnimationOptions,
  ) {
    const ptype = opts.particles ?? MOOD_DEFAULTS[opts.mood].particles;
    this.particles = this.seedParticles(ptype);
  }

  /** Draw a single animated frame.
   *  @param t Continuous time in seconds since animation start
   *  @param sceneT Normalized scene progress 0–1 (for Ken Burns/fade)
   */
  drawFrame(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    t: number,
    sceneT: number = t * 0.1,
  ): void {
    const { cw, ch, opts } = this;
    const breath = opts.breathIntensity ?? 0.5;
    const sway   = opts.swayIntensity   ?? 0.5;
    const kbInt  = opts.kenBurnsIntensity ?? 0.5;
    const moodCfg = MOOD_DEFAULTS[opts.mood];

    ctx.clearRect(0, 0, cw, ch);

    // ─── Layer 0: Subtle background gradient (warm vignette base) ─────────
    const bg = ctx.createRadialGradient(cw / 2, ch * 0.4, ch * 0.2, cw / 2, ch * 0.5, ch * 0.85);
    bg.addColorStop(0, 'rgba(255,235,200,0.0)');
    bg.addColorStop(1, 'rgba(60,30,15,0.35)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    // ─── Layer 1: Character with VISIBLE breathing + sway + head bob ─────
    // Breathing — DRAMATIC chest rise (5% scale, ~3 sec cycle)
    const breathScale = 1 + Math.sin(t * 2.0) * 0.05 * breath;
    // Head sway — clearly visible horizontal drift + rotation
    const swayX   = Math.sin(t * 0.9) * 18 * sway;
    const swayRot = Math.sin(t * 0.5) * 0.025 * sway;
    // Head bob — vertical motion, makes her feel like she's talking/alive
    const bobY    = Math.sin(t * 1.4) * 8 * sway;
    // Ken Burns
    const kbScale = 1.0 + sceneT * 0.12 * kbInt;
    const kbOffsetY = -sceneT * 22 * kbInt;

    ctx.save();
    ctx.translate(cw / 2 + swayX, ch / 2 + kbOffsetY + bobY);
    ctx.rotate(swayRot);
    ctx.scale(breathScale * kbScale, breathScale * kbScale);
    ctx.translate(-cw / 2, -ch / 2);

    // Fit the pose image to canvas (cover style)
    this.drawImageCover(ctx, image, cw, ch);
    ctx.restore();

    // ─── Layer 2: Eye blink overlay (rough — paints brown bar over eye area) ─
    if (opts.blink !== false) {
      const blinkPeriod = 4.5;                  // blink every 4.5s
      const blinkPhase = (t % blinkPeriod) / blinkPeriod;
      // Blink lasts 120ms ≈ 0.027 normalized
      if (blinkPhase > 0.97 || blinkPhase < 0.005) {
        const intensity = blinkPhase > 0.97 ? (blinkPhase - 0.97) / 0.03 : 1 - (blinkPhase / 0.005);
        this.drawBlinkOverlay(ctx, intensity);
      }
    }

    // ─── Layer 3: Mood-driven lighting tint ───────────────────────────────
    ctx.fillStyle = this.hexToRgba(moodCfg.lightTone, moodCfg.lightAlpha + Math.sin(t * 0.6) * 0.04);
    ctx.fillRect(0, 0, cw, ch);

    // ─── Layer 4: Particles ───────────────────────────────────────────────
    this.tickAndDrawParticles(ctx, t);

    // ─── Layer 5: Vignette pulse ──────────────────────────────────────────
    const vAlpha = 0.45 + Math.sin(t * 0.4) * 0.04;
    const vig = ctx.createRadialGradient(cw / 2, ch / 2, ch * 0.2, cw / 2, ch / 2, ch * 0.8);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, `rgba(20,10,5,${vAlpha})`);
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, cw, ch);
  }

  // ─── Helpers ────────────────────────────────────────────────────────────

  private drawImageCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, cw: number, ch: number) {
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;
    const scale = Math.max(cw / iw, ch / ih);
    const w = iw * scale;
    const h = ih * scale;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }

  private drawBlinkOverlay(ctx: CanvasRenderingContext2D, intensity: number) {
    // Rough eye region — works because faces sit ~28-36% from top in our generated portraits
    const { cw, ch } = this;
    const eyeY = ch * 0.30;
    const eyeH = 8 * intensity;
    ctx.save();
    ctx.globalAlpha = 0.55 * intensity;
    ctx.fillStyle = '#3D1F2E';
    // Approximate two eye lines via thin overlay rectangles
    ctx.fillRect(cw * 0.32, eyeY - eyeH / 2, cw * 0.12, eyeH);
    ctx.fillRect(cw * 0.55, eyeY - eyeH / 2, cw * 0.12, eyeH);
    ctx.restore();
  }

  private seedParticles(type: ParticleType): CharParticle[] {
    if (type === 'none') return [];
    const { cw, ch } = this;
    const count = type === 'sparkles' || type === 'hearts' ? 14 :
                  type === 'dust' ? 22 :
                  type === 'steam' ? 12 :
                  type === 'tears' ? 5 :
                  type === 'sun-rays' ? 6 : 0;
    return Array.from({ length: count }, () => this.makeParticle(type, true));
  }

  private makeParticle(type: ParticleType, initial = false): CharParticle {
    const { cw, ch } = this;
    const base: CharParticle = {
      x: Math.random() * cw,
      y: Math.random() * ch,
      vx: 0,
      vy: 0,
      size: 3,
      life: initial ? Math.random() * 200 : 0,
      maxLife: 180 + Math.random() * 120,
      rotation: Math.random() * Math.PI * 2,
    };
    switch (type) {
      case 'steam':
        base.vy = -0.6 - Math.random() * 0.8;
        base.vx = (Math.random() - 0.5) * 0.3;
        base.size = 5 + Math.random() * 6;
        base.y = ch * 0.6 + Math.random() * ch * 0.3;
        break;
      case 'sparkles':
        base.vy = -0.2 + Math.random() * 0.3;
        base.vx = (Math.random() - 0.5) * 0.4;
        base.size = 2 + Math.random() * 4;
        base.emoji = '✨';
        break;
      case 'hearts':
        base.vy = -0.4 - Math.random() * 0.4;
        base.vx = Math.sin(Math.random() * Math.PI * 2) * 0.5;
        base.size = 8 + Math.random() * 6;
        base.y = ch * 0.7 + Math.random() * ch * 0.3;
        base.emoji = '🌸';
        break;
      case 'dust':
        base.vy = -0.15 - Math.random() * 0.25;
        base.vx = (Math.random() - 0.5) * 0.4;
        base.size = 1.5 + Math.random() * 1.5;
        break;
      case 'tears':
        base.vy = 0.6 + Math.random() * 0.4;
        base.vx = 0;
        base.size = 2.5;
        base.x = cw * (0.4 + Math.random() * 0.2);
        base.y = ch * 0.32;
        break;
      case 'sun-rays':
        base.vx = Math.cos(Math.random() * Math.PI * 2) * 0.3;
        base.vy = Math.sin(Math.random() * Math.PI * 2) * 0.3;
        base.size = 4 + Math.random() * 3;
        break;
    }
    return base;
  }

  private tickAndDrawParticles(ctx: CanvasRenderingContext2D, t: number) {
    const type = this.opts.particles ?? MOOD_DEFAULTS[this.opts.mood].particles;
    if (type === 'none' || this.particles.length === 0) return;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      p.rotation += 0.02;

      if (p.life >= p.maxLife || p.y < -20 || p.y > this.ch + 20 || p.x < -20 || p.x > this.cw + 20) {
        this.particles[i] = this.makeParticle(type);
        continue;
      }

      const lifeT = p.life / p.maxLife;
      const alpha = lifeT < 0.2 ? lifeT / 0.2 : lifeT > 0.7 ? (1 - lifeT) / 0.3 : 1;

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha)) * 0.8;
      ctx.translate(p.x, p.y);
      if (p.emoji) {
        ctx.font = `${p.size * 2.4}px system-ui, "Apple Color Emoji", "Segoe UI Emoji"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.emoji, 0, 0);
      } else if (type === 'sun-rays') {
        // Soft golden light dot
        ctx.shadowColor = 'rgba(255,220,150,0.9)';
        ctx.shadowBlur = 18;
        ctx.fillStyle = 'rgba(255,235,180,0.9)';
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'tears') {
        ctx.fillStyle = 'rgba(170,200,230,0.75)';
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 0.6, p.size, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Dust / steam — soft white blob
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
        grad.addColorStop(0, type === 'steam' ? 'rgba(255,255,255,0.5)' : 'rgba(255,250,235,0.45)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private hexToRgba(hex: string, alpha: number): string {
    const m = hex.replace('#', '').match(/.{1,2}/g);
    if (!m || m.length < 3) return `rgba(0,0,0,${alpha})`;
    const [r, g, b] = m.map(h => parseInt(h, 16));
    return `rgba(${r},${g},${b},${alpha})`;
  }
}
