/**
 * Story Sequencer
 *
 * Plays multiple character poses in sequence as a STORY — like a real reel.
 *
 * Each pose is a "scene" with:
 *   - 3.5s display time
 *   - 0.8s crossfade transition
 *   - Camera zoom + pan (Ken Burns but dramatic)
 *   - Story text overlay
 *   - Particle bursts at scene start
 *   - Mood-specific lighting
 *
 * This is what makes 3 static images FEEL like a real animated story playing out.
 */

import { CharacterAnimator, type CharacterMood, type ParticleType } from './character-animator';

export interface StoryScene {
  imageUrl: string;
  text: string;             // big overlay text for this scene
  mood: CharacterMood;
  particles: ParticleType;
  cameraMove?: 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'pan-up' | 'pan-down' | 'still';
  durationMs?: number;      // default 3500
}

export interface SequencerOptions {
  scenes: StoryScene[];
  crossfadeMs?: number;     // default 800
  cw: number;
  ch: number;
}

interface LoadedScene extends StoryScene {
  image: HTMLImageElement | null;
  animator: CharacterAnimator;
}

export class StorySequencer {
  private scenes: LoadedScene[];
  private cw: number;
  private ch: number;
  private crossfadeMs: number;
  private totalDurationMs: number;

  constructor(opts: SequencerOptions) {
    this.cw = opts.cw;
    this.ch = opts.ch;
    this.crossfadeMs = opts.crossfadeMs ?? 800;

    this.scenes = opts.scenes.map((s) => ({
      ...s,
      durationMs: s.durationMs ?? 3500,
      cameraMove: s.cameraMove ?? 'zoom-in',
      image: null,
      animator: new CharacterAnimator(this.cw, this.ch, {
        mood: s.mood,
        particles: s.particles,
        breathIntensity: 0.6,
        swayIntensity: 0.6,
        kenBurnsIntensity: 0,    // we do our own camera here
        blink: true,
      }),
    }));

    this.totalDurationMs = this.scenes.reduce((sum, s) => sum + (s.durationMs ?? 3500), 0);
  }

  /** Pre-load all scene images. Resolves when ready. */
  async loadImages(): Promise<void> {
    await Promise.all(this.scenes.map(s => new Promise<void>((resolve) => {
      const img = new Image();
      img.onload  = () => { s.image = img; resolve(); };
      img.onerror = () => { resolve(); };       // gracefully skip failed loads
      img.src = s.imageUrl;
    })));
  }

  get duration(): number { return this.totalDurationMs; }

  /** Draw the appropriate scene (or crossfade between two) at elapsed milliseconds. */
  drawFrame(ctx: CanvasRenderingContext2D, elapsedMs: number, absoluteT: number): void {
    const { cw, ch } = this;

    // Find which scene we're in
    let cursor = 0;
    let activeIdx = 0;
    for (let i = 0; i < this.scenes.length; i++) {
      const dur = this.scenes[i].durationMs ?? 3500;
      if (elapsedMs < cursor + dur) { activeIdx = i; break; }
      cursor += dur;
      activeIdx = i;
    }
    const scene = this.scenes[activeIdx];
    const sceneElapsed = elapsedMs - cursor;
    const sceneT = Math.min(1, sceneElapsed / (scene.durationMs ?? 3500));

    // Detect if we're in the crossfade overlap window with the NEXT scene
    const nextIdx = activeIdx + 1;
    const nextScene = nextIdx < this.scenes.length ? this.scenes[nextIdx] : null;
    const timeLeftInScene = (scene.durationMs ?? 3500) - sceneElapsed;
    const inCrossfade = nextScene && timeLeftInScene < this.crossfadeMs;
    const crossfadeProgress = inCrossfade
      ? 1 - (timeLeftInScene / this.crossfadeMs)
      : 0;

    ctx.clearRect(0, 0, cw, ch);

    // ─── Draw current scene with camera motion ─────────────────────────
    if (scene.image) {
      this.drawSceneWithCamera(ctx, scene, sceneT, absoluteT, 1 - crossfadeProgress);
    }

    // ─── Draw next scene on top during crossfade ───────────────────────
    if (inCrossfade && nextScene?.image) {
      this.drawSceneWithCamera(ctx, nextScene as LoadedScene, 0, absoluteT, crossfadeProgress);
    }

    // ─── Big story text overlay ────────────────────────────────────────
    this.drawSceneText(ctx, scene.text, sceneT, 1 - crossfadeProgress);
    if (inCrossfade && nextScene) {
      this.drawSceneText(ctx, nextScene.text, 0, crossfadeProgress);
    }

    // ─── Scene-start particle burst flash ──────────────────────────────
    if (sceneT < 0.12) {
      const burstA = 1 - sceneT / 0.12;
      this.drawBurstFlash(ctx, burstA, scene.mood);
    }

    // ─── Scene progress dots at bottom ────────────────────────────────
    this.drawProgressDots(ctx, activeIdx, sceneT);
  }

  private drawSceneWithCamera(
    ctx: CanvasRenderingContext2D,
    scene: LoadedScene,
    sceneT: number,
    absoluteT: number,
    alpha: number,
  ) {
    const { cw, ch } = this;
    if (!scene.image) return;

    // Camera move (dramatic — actual visible motion)
    let scale = 1.0;
    let xOff = 0;
    let yOff = 0;
    switch (scene.cameraMove) {
      case 'zoom-in':    scale = 1.0 + sceneT * 0.18; break;
      case 'zoom-out':   scale = 1.18 - sceneT * 0.18; break;
      case 'pan-left':   scale = 1.10; xOff = (0.5 - sceneT) * cw * 0.12; break;
      case 'pan-right':  scale = 1.10; xOff = (sceneT - 0.5) * cw * 0.12; break;
      case 'pan-up':     scale = 1.10; yOff = (0.5 - sceneT) * ch * 0.10; break;
      case 'pan-down':   scale = 1.10; yOff = (sceneT - 0.5) * ch * 0.10; break;
      default:           scale = 1.05;
    }

    ctx.save();
    ctx.globalAlpha = alpha;

    // Apply camera transform around centre
    ctx.translate(cw / 2 + xOff, ch / 2 + yOff);
    ctx.scale(scale, scale);
    ctx.translate(-cw / 2, -ch / 2);

    // Have the animator render this scene's frame on top of camera transform
    scene.animator.drawFrame(ctx, scene.image, absoluteT, sceneT);

    ctx.restore();
  }

  private drawSceneText(ctx: CanvasRenderingContext2D, text: string, sceneT: number, alpha: number) {
    const { cw, ch } = this;
    if (alpha <= 0 || !text) return;

    // Text fades in/out within the scene
    const textIn  = sceneT < 0.18 ? sceneT / 0.18 : 1;
    const textOut = sceneT > 0.78 ? (1 - sceneT) / 0.22 : 1;
    const textAlpha = Math.min(textIn, textOut) * alpha;
    if (textAlpha <= 0) return;

    // Slide up entry
    const slideY = sceneT < 0.18 ? (1 - sceneT / 0.18) * 30 : 0;

    // Big bold text at lower-center
    const fontSize = Math.round(cw * 0.062);
    ctx.save();
    ctx.globalAlpha = textAlpha;

    // Word wrap
    const maxW = cw * 0.85;
    const words = text.split(' ');
    const lines: string[] = [];
    let line = '';
    ctx.font = `800 ${fontSize}px Inter, system-ui, sans-serif`;
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
      else line = test;
    }
    if (line) lines.push(line);

    const lh = Math.round(fontSize * 1.18);
    const totalH = lines.length * lh;
    const baseY = ch * 0.72 - totalH / 2 + slideY;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Soft pill background behind text
    const longest = lines.reduce((m, l) => Math.max(m, ctx.measureText(l).width), 0);
    ctx.fillStyle = 'rgba(20,10,15,0.55)';
    this.roundRect(ctx, cw / 2 - longest / 2 - 20, baseY - 14, longest + 40, totalH + 28, 18);
    ctx.fill();

    // Text with shadow
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = '#fff';
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], cw / 2, baseY + i * lh + lh / 2);
    }
    ctx.restore();
  }

  private drawBurstFlash(ctx: CanvasRenderingContext2D, alpha: number, mood: CharacterMood) {
    const { cw, ch } = this;
    const colorMap: Record<CharacterMood, string> = {
      tired:   'rgba(255,200,150,',
      gentle:  'rgba(255,220,200,',
      worried: 'rgba(200,170,210,',
      happy:   'rgba(255,200,220,',
      sad:     'rgba(180,200,220,',
      strong:  'rgba(255,235,180,',
    };
    const base = colorMap[mood] || 'rgba(255,220,180,';
    const g = ctx.createRadialGradient(cw / 2, ch / 2, 0, cw / 2, ch / 2, ch * 0.6);
    g.addColorStop(0, base + (alpha * 0.5) + ')');
    g.addColorStop(1, base + '0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, cw, ch);
  }

  private drawProgressDots(ctx: CanvasRenderingContext2D, activeIdx: number, sceneT: number) {
    const { cw, ch } = this;
    const n = this.scenes.length;
    const w = 28;
    const gap = 6;
    const totalW = n * w + (n - 1) * gap;
    const startX = cw / 2 - totalW / 2;
    const y = ch - 22;
    for (let i = 0; i < n; i++) {
      const x = startX + i * (w + gap);
      // Background
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      this.roundRect(ctx, x, y, w, 3, 1.5);
      ctx.fill();
      // Fill
      if (i < activeIdx) {
        ctx.fillStyle = '#fff';
        this.roundRect(ctx, x, y, w, 3, 1.5);
        ctx.fill();
      } else if (i === activeIdx) {
        ctx.fillStyle = '#fff';
        this.roundRect(ctx, x, y, w * sceneT, 3, 1.5);
        ctx.fill();
      }
    }
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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
}
