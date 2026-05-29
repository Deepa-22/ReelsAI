/**
 * Mascot Scene Backgrounds
 *
 * Drawn entirely in Canvas code using the Honest Hormones brand palette.
 * No image assets — pure procedural backgrounds, ₹0 forever.
 *
 * Each scene draws to fill the canvas, then the mascot is drawn on top.
 */

import { PALETTE } from './mascot-character';

export type SceneName =
  | 'bedroom-morning'
  | 'kitchen-window'
  | 'living-room'
  | 'bathroom-mirror'
  | 'park-outdoors'
  | 'yoga-mat'
  | 'cozy-evening';

export interface SceneStyle {
  bg1: string;       // top of vertical gradient
  bg2: string;       // bottom of vertical gradient
  floor: string;     // floor stripe colour
  accent: string;    // door/window/object accent
  light: string;     // ambient light wash
}

const SCENE_STYLES: Record<SceneName, SceneStyle> = {
  'bedroom-morning': {
    bg1: '#FCE6C9', bg2: '#F0C49C',
    floor: '#C29874',
    accent: '#E8A0B7',
    light: 'rgba(255,225,170,0.18)',
  },
  'kitchen-window': {
    bg1: '#FAF7F4', bg2: '#EFE8DA',
    floor: '#D9C4A0',
    accent: '#A8B9A0',
    light: 'rgba(255,250,230,0.20)',
  },
  'living-room': {
    bg1: '#F5E6D8', bg2: '#D8B89A',
    floor: '#A87F5C',
    accent: '#E8A0B7',
    light: 'rgba(255,210,170,0.18)',
  },
  'bathroom-mirror': {
    bg1: '#E8EEF0', bg2: '#C8D6DC',
    floor: '#A8B5BC',
    accent: '#F5E6D8',
    light: 'rgba(255,255,255,0.20)',
  },
  'park-outdoors': {
    bg1: '#CAE2BA', bg2: '#A8B9A0',
    floor: '#8A9C7F',
    accent: '#FFD680',
    light: 'rgba(255,235,180,0.18)',
  },
  'yoga-mat': {
    bg1: '#F8EEE6', bg2: '#E5C9B8',
    floor: '#E8A0B7',     // pink mat
    accent: '#A8B9A0',
    light: 'rgba(255,225,200,0.16)',
  },
  'cozy-evening': {
    bg1: '#3D2438', bg2: '#1F0E1A',
    floor: '#3A1F2E',
    accent: '#E8A0B7',
    light: 'rgba(232,160,183,0.16)',
  },
};

export const SCENE_LABELS: Record<SceneName, { label: string; emoji: string }> = {
  'bedroom-morning':  { label: 'Bedroom (morning)', emoji: '🛏️' },
  'kitchen-window':   { label: 'Kitchen window',    emoji: '🪟' },
  'living-room':      { label: 'Living room',       emoji: '🛋️' },
  'bathroom-mirror':  { label: 'Bathroom mirror',   emoji: '🪞' },
  'park-outdoors':    { label: 'Park outdoors',     emoji: '🌳' },
  'yoga-mat':         { label: 'Yoga mat',          emoji: '🧘‍♀️' },
  'cozy-evening':     { label: 'Cosy evening',      emoji: '🌙' },
};

export function drawScene(
  ctx: CanvasRenderingContext2D,
  scene: SceneName,
  cw: number,
  ch: number,
  time: number,    // for animated bg elements (curtains sway, etc.)
): void {
  const style = SCENE_STYLES[scene];

  // Vertical gradient background
  const grad = ctx.createLinearGradient(0, 0, 0, ch);
  grad.addColorStop(0, style.bg1);
  grad.addColorStop(1, style.bg2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, cw, ch);

  // Floor band (lower 25%)
  ctx.fillStyle = style.floor;
  ctx.fillRect(0, ch * 0.78, cw, ch * 0.22);
  // Floor shadow against wall
  const floorGrad = ctx.createLinearGradient(0, ch * 0.78, 0, ch * 0.82);
  floorGrad.addColorStop(0, 'rgba(0,0,0,0.20)');
  floorGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, ch * 0.78, cw, ch * 0.04);

  switch (scene) {
    case 'bedroom-morning':
      drawWindow(ctx, cw * 0.62, ch * 0.18, cw * 0.32, ch * 0.4, time);
      drawSunRays(ctx, cw, ch, time);
      drawBedHint(ctx, cw, ch, style.accent);
      drawWallArt(ctx, cw * 0.15, ch * 0.20, style.accent);
      break;
    case 'kitchen-window':
      drawWindow(ctx, cw * 0.5, ch * 0.18, cw * 0.5, ch * 0.42, time);
      drawSunRays(ctx, cw, ch, time);
      drawPlant(ctx, cw * 0.1, ch * 0.62, time);
      drawPlant(ctx, cw * 0.9, ch * 0.65, time, true);
      break;
    case 'living-room':
      drawLamp(ctx, cw * 0.15, ch * 0.4, time);
      drawCouchHint(ctx, cw, ch, style.accent);
      drawWallArt(ctx, cw * 0.5, ch * 0.20, style.accent);
      drawWallArt(ctx, cw * 0.78, ch * 0.20, style.accent);
      break;
    case 'bathroom-mirror':
      drawMirror(ctx, cw * 0.5, ch * 0.30, cw * 0.55, ch * 0.45);
      drawCounter(ctx, cw, ch, style.accent);
      break;
    case 'park-outdoors':
      drawSun(ctx, cw * 0.78, ch * 0.18);
      drawSunRays(ctx, cw, ch, time);
      drawTree(ctx, cw * 0.13, ch * 0.55, time);
      drawTree(ctx, cw * 0.88, ch * 0.55, time, 0.9);
      drawGrass(ctx, cw, ch);
      break;
    case 'yoga-mat':
      drawWindow(ctx, cw * 0.7, ch * 0.14, cw * 0.28, ch * 0.32, time);
      drawSunRays(ctx, cw, ch, time);
      drawYogaMat(ctx, cw, ch);
      drawPlant(ctx, cw * 0.12, ch * 0.60, time);
      break;
    case 'cozy-evening':
      drawNightSky(ctx, cw, ch, time);
      drawLamp(ctx, cw * 0.20, ch * 0.45, time);
      drawLamp(ctx, cw * 0.80, ch * 0.45, time);
      drawSofaSilhouette(ctx, cw, ch, style.accent);
      break;
  }

  // Ambient light wash (mood-driven)
  ctx.fillStyle = style.light;
  ctx.fillRect(0, 0, cw, ch);

  // Subtle vignette
  const vig = ctx.createRadialGradient(cw / 2, ch / 2, ch * 0.25, cw / 2, ch / 2, ch * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(40,20,30,0.30)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, cw, ch);
}

// ─── Scene element renderers ────────────────────────────────────────────────

function drawWindow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, t: number) {
  // Frame
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x - w / 2, y, w, h);
  // Window glow (golden hour)
  const glass = ctx.createLinearGradient(x, y, x, y + h);
  glass.addColorStop(0, '#FFE3B0');
  glass.addColorStop(1, '#FFC788');
  ctx.fillStyle = glass;
  ctx.fillRect(x - w / 2 + 8, y + 8, w - 16, h - 16);
  // Cross frames
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x - 2, y + 8, 4, h - 16);
  ctx.fillRect(x - w / 2 + 8, y + h / 2 - 2, w - 16, 4);
  // Curtain sway hint (left)
  ctx.fillStyle = 'rgba(200,160,180,0.6)';
  ctx.beginPath();
  ctx.moveTo(x - w / 2 - 4, y);
  ctx.lineTo(x - w / 2 + Math.sin(t) * 4, y);
  ctx.lineTo(x - w / 2 + 8 + Math.sin(t) * 4, y + h * 0.7);
  ctx.lineTo(x - w / 2 - 4, y + h * 0.7);
  ctx.closePath();
  ctx.fill();
}

function drawSunRays(ctx: CanvasRenderingContext2D, cw: number, ch: number, t: number) {
  ctx.save();
  ctx.globalAlpha = 0.18 + Math.sin(t * 0.6) * 0.04;
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i++) {
    const angle = -0.6 + i * 0.15;
    const len = ch * 0.9;
    ctx.fillStyle = 'rgba(255,235,180,0.4)';
    ctx.save();
    ctx.translate(cw * 0.78, ch * 0.1);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-30, len);
    ctx.lineTo(30, len);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function drawBedHint(ctx: CanvasRenderingContext2D, cw: number, ch: number, accent: string) {
  // Bed in background-left
  ctx.fillStyle = '#F8E2D0';
  ctx.fillRect(0, ch * 0.62, cw * 0.45, ch * 0.18);
  ctx.fillStyle = accent;
  ctx.fillRect(0, ch * 0.62, cw * 0.45, 12);
  // Pillows
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < 2; i++) {
    ctx.beginPath();
    ctx.ellipse(cw * 0.06 + i * 22, ch * 0.66, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawWallArt(ctx: CanvasRenderingContext2D, x: number, y: number, accent: string) {
  ctx.strokeStyle = '#3D1F2E';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 16, y - 12, 32, 24);
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.4;
  ctx.fillRect(x - 14, y - 10, 28, 20);
  ctx.globalAlpha = 1;
}

function drawPlant(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, mirror = false) {
  ctx.save();
  ctx.translate(x, y);
  if (mirror) ctx.scale(-1, 1);
  // Pot
  ctx.fillStyle = '#A87F5C';
  ctx.beginPath();
  ctx.moveTo(-12, 0);
  ctx.lineTo(12, 0);
  ctx.lineTo(10, 18);
  ctx.lineTo(-10, 18);
  ctx.closePath();
  ctx.fill();
  // Leaves sway gently
  const sway = Math.sin(t * 0.8) * 0.08;
  ctx.fillStyle = '#7FA37F';
  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.rotate(-0.6 + i * 0.3 + sway);
    ctx.beginPath();
    ctx.ellipse(0, -16, 4, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function drawLamp(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  // Stand
  ctx.strokeStyle = '#3D1F2E';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, y); ctx.lineTo(x, y + 70);
  ctx.stroke();
  // Base
  ctx.fillStyle = '#3D1F2E';
  ctx.beginPath();
  ctx.ellipse(x, y + 72, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Shade
  ctx.fillStyle = '#F5E6D8';
  ctx.beginPath();
  ctx.moveTo(x - 22, y);
  ctx.lineTo(x + 22, y);
  ctx.lineTo(x + 16, y - 22);
  ctx.lineTo(x - 16, y - 22);
  ctx.closePath();
  ctx.fill();
  // Glow
  ctx.globalCompositeOperation = 'lighter';
  const glow = ctx.createRadialGradient(x, y - 8, 0, x, y - 8, 90);
  glow.addColorStop(0, `rgba(255,220,150,${0.28 + Math.sin(t * 0.6) * 0.04})`);
  glow.addColorStop(1, 'rgba(255,220,150,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x - 90, y - 100, 180, 200);
  ctx.globalCompositeOperation = 'source-over';
}

function drawCouchHint(ctx: CanvasRenderingContext2D, cw: number, ch: number, accent: string) {
  // Couch silhouette in background
  ctx.fillStyle = '#C49678';
  ctx.fillRect(cw * 0.35, ch * 0.55, cw * 0.55, ch * 0.25);
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.5;
  // Pillows
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(cw * 0.42 + i * cw * 0.14, ch * 0.58, 16, 11, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawMirror(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#3D1F2E';
  ctx.fillRect(x - w / 2 - 6, y - h / 2 - 6, w + 12, h + 12);
  ctx.fillStyle = '#D8E0E4';
  ctx.fillRect(x - w / 2, y - h / 2, w, h);
  // Reflection highlight
  const refl = ctx.createLinearGradient(x - w / 2, y - h / 2, x + w / 2, y + h / 2);
  refl.addColorStop(0, 'rgba(255,255,255,0.5)');
  refl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = refl;
  ctx.fillRect(x - w / 2, y - h / 2, w, h);
}

function drawCounter(ctx: CanvasRenderingContext2D, cw: number, ch: number, accent: string) {
  ctx.fillStyle = '#FAF7F4';
  ctx.fillRect(0, ch * 0.62, cw, ch * 0.16);
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.6;
  // Bottle, soap pump
  ctx.fillRect(cw * 0.15, ch * 0.55, 14, 14);
  ctx.fillRect(cw * 0.80, ch * 0.55, 14, 14);
  ctx.globalAlpha = 1;
}

function drawSun(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#FFD680';
  ctx.beginPath();
  ctx.arc(x, y, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,235,180,0.5)';
  ctx.beginPath();
  ctx.arc(x, y, 40, 0, Math.PI * 2);
  ctx.fill();
}

function drawTree(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  // Trunk
  ctx.fillStyle = '#8B6F4E';
  ctx.fillRect(-6, 0, 12, 100);
  // Foliage sway
  const sway = Math.sin(t * 0.6) * 0.04;
  ctx.save();
  ctx.rotate(sway);
  ctx.fillStyle = '#7FA37F';
  ctx.beginPath();
  ctx.arc(0, -10, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#90B58F';
  ctx.beginPath();
  ctx.arc(-18, -16, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(18, -16, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

function drawGrass(ctx: CanvasRenderingContext2D, cw: number, ch: number) {
  ctx.strokeStyle = '#7FA37F';
  ctx.lineWidth = 2;
  for (let x = 0; x < cw; x += 8) {
    const h = 6 + (x % 13) * 0.6;
    ctx.beginPath();
    ctx.moveTo(x, ch * 0.78);
    ctx.lineTo(x + 2, ch * 0.78 - h);
    ctx.stroke();
  }
}

function drawYogaMat(ctx: CanvasRenderingContext2D, cw: number, ch: number) {
  ctx.save();
  ctx.translate(cw / 2, ch * 0.85);
  ctx.scale(1, 0.35);
  ctx.fillStyle = '#E8A0B7';
  ctx.beginPath();
  ctx.ellipse(0, 0, cw * 0.42, cw * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#D690A5';
  ctx.beginPath();
  ctx.ellipse(0, -8, cw * 0.42, cw * 0.20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawNightSky(ctx: CanvasRenderingContext2D, cw: number, ch: number, t: number) {
  // Stars
  for (let i = 0; i < 30; i++) {
    const x = (i * 37) % cw;
    const y = (i * 53) % (ch * 0.6);
    const twinkle = 0.5 + Math.sin(t * 1.5 + i) * 0.5;
    ctx.fillStyle = `rgba(255,255,255,${0.3 + twinkle * 0.3})`;
    ctx.beginPath();
    ctx.arc(x, y, 1 + twinkle * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
  // Moon
  ctx.fillStyle = '#FAF7F4';
  ctx.beginPath();
  ctx.arc(cw * 0.78, ch * 0.18, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3D2438';
  ctx.beginPath();
  ctx.arc(cw * 0.78 + 6, ch * 0.18 - 3, 16, 0, Math.PI * 2);
  ctx.fill();
}

function drawSofaSilhouette(ctx: CanvasRenderingContext2D, cw: number, ch: number, accent: string) {
  ctx.fillStyle = '#2C1726';
  ctx.fillRect(cw * 0.1, ch * 0.55, cw * 0.8, ch * 0.25);
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.ellipse(cw * 0.16 + i * cw * 0.20, ch * 0.58, 14, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
