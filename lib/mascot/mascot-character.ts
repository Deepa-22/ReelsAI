/**
 * Honest Hormones Mascot Character
 *
 * Drawn entirely in code using Canvas paths. Body parts are independent — each
 * can be transformed separately so the character can walk, wave, drink, etc.
 *
 * This is a Duolingo-level cute mascot — NOT photoreal, NOT Pixar. But it
 * actually animates with REAL motion, runs in the browser, costs ₹0 per video.
 *
 * Use:  drawMascot(ctx, x, y, scale, state)
 *
 * The state object lets the animation system transform each body part:
 *   {
 *     bodyBob: 0,         // vertical body bob (-10..10 px)
 *     bodyScale: 1.0,     // breathing (0.95..1.05)
 *     headTilt: 0,        // head rotation (-0.3..0.3 rad)
 *     headBob: 0,         // head vertical (-5..5 px)
 *     hairSway: 0,        // hair sway (-0.2..0.2 rad)
 *     leftArmAngle: 0,    // shoulder rotation (-1.5..1.5 rad)
 *     rightArmAngle: 0,
 *     leftLegAngle: 0,    // hip rotation (-0.5..0.5 rad)
 *     rightLegAngle: 0,
 *     mouthShape: 'smile', // 'smile'|'frown'|'o'|'flat'|'wide'
 *     eyesClosed: 0,      // 0 = open, 1 = closed (for blink)
 *     eyebrowAngle: 0,    // -0.3..0.3 (worried = up)
 *     leftHandItem: null, // 'glass' for drinking
 *     rightHandItem: null,
 *   }
 */

// ── Brand palette ───────────────────────────────────────────────────────────
export const PALETTE = {
  skin:         '#F4C99E',    // warm honey-brown
  skinShade:    '#D9A87E',
  hair:         '#2A1A1A',    // very dark brown / black
  hairHighlight:'#4A2E2E',
  sweater:      '#F5E6D8',    // cream knit
  sweaterShade: '#E1CFB8',
  pants:        '#8B6F4E',    // soft brown joggers
  pantsShade:   '#6E5538',
  mouth:        '#B85A6E',    // soft pink
  cheek:        '#F19BA8',    // soft rose blush
  eye:          '#2A1A1A',
  white:        '#FFFFFF',
  noseStud:     '#FBB041',    // tiny gold dot
};

export interface MascotState {
  bodyBob: number;       // px vertical body offset (breathing/walking bob)
  bodyScale: number;     // 1.0 = base. 0.95–1.05 for breathing.
  headTilt: number;      // radians
  headBob: number;       // px
  hairSway: number;      // radians
  leftArmAngle: number;  // radians (0 = down at side, +PI/2 = horizontal out, +PI = up)
  rightArmAngle: number;
  leftElbowBend: number; // 0 = straight, +PI/2 = bent 90°
  rightElbowBend: number;
  leftLegLift: number;   // 0 = down, 1 = lifted up
  rightLegLift: number;
  mouthShape: 'smile' | 'frown' | 'o' | 'flat' | 'wide';
  eyesClosed: number;    // 0..1
  eyebrowAngle: number;
  leftHandItem: 'glass' | null;
  rightHandItem: 'glass' | null;
  facingRight: boolean;  // mirrors the character horizontally
}

export const DEFAULT_STATE: MascotState = {
  bodyBob: 0, bodyScale: 1.0,
  headTilt: 0, headBob: 0, hairSway: 0,
  leftArmAngle: 0, rightArmAngle: 0,
  leftElbowBend: 0, rightElbowBend: 0,
  leftLegLift: 0, rightLegLift: 0,
  mouthShape: 'smile',
  eyesClosed: 0, eyebrowAngle: 0,
  leftHandItem: null, rightHandItem: null,
  facingRight: true,
};

// ─── The drawing function ────────────────────────────────────────────────────

/**
 * Draws the mascot at (cx, cy) with given uniform scale.
 * The character's feet sit roughly at (cx, cy + scale * 100).
 * Total character height ≈ scale * 220 px.
 */
export function drawMascot(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  state: MascotState = DEFAULT_STATE,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  if (!state.facingRight) ctx.scale(-1, 1);
  ctx.scale(scale, scale);

  // Body bob/breathing — applies to everything except shadow
  const bodyY = state.bodyBob;
  const bodyS = state.bodyScale;

  // ─── Ground shadow ──────────────────────────────────────────────────
  ctx.save();
  ctx.translate(0, 100);
  ctx.scale(1, 0.25);
  ctx.fillStyle = 'rgba(40,20,30,0.18)';
  ctx.beginPath();
  ctx.arc(0, 0, 55, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.translate(0, bodyY);
  ctx.scale(bodyS, bodyS);

  // ─── Legs (drawn first so they're behind body) ──────────────────────
  drawLeg(ctx, -22, 40, state.leftLegLift,  state.pantsColor || PALETTE.pants);
  drawLeg(ctx,  22, 40, state.rightLegLift, state.pantsColor || PALETTE.pants);

  // ─── Pants (rectangle covering legs at hip) ─────────────────────────
  ctx.fillStyle = PALETTE.pants;
  roundRect(ctx, -38, 18, 76, 36, 14);
  ctx.fill();
  // Drawstring hint
  ctx.strokeStyle = PALETTE.pantsShade;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-6, 24); ctx.lineTo(6, 24); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 24); ctx.lineTo(0, 36); ctx.stroke();

  // ─── Body / sweater ─────────────────────────────────────────────────
  ctx.fillStyle = PALETTE.sweater;
  // Slightly chubby torso shape — wider at bottom
  ctx.beginPath();
  ctx.moveTo(-42, -8);
  ctx.bezierCurveTo(-48, 12, -50, 26, -42, 30);
  ctx.lineTo(42, 30);
  ctx.bezierCurveTo(50, 26, 48, 12, 42, -8);
  ctx.bezierCurveTo(38, -22, -38, -22, -42, -8);
  ctx.closePath();
  ctx.fill();
  // Sweater knit texture hint
  ctx.strokeStyle = PALETTE.sweaterShade;
  ctx.lineWidth = 1.2;
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-38 + Math.abs(i) * 0.5, i * 6);
    ctx.lineTo(38 - Math.abs(i) * 0.5, i * 6);
    ctx.stroke();
  }
  // Sweater neck
  ctx.fillStyle = PALETTE.sweaterShade;
  ctx.beginPath();
  ctx.ellipse(0, -14, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // ─── Arms ───────────────────────────────────────────────────────────
  drawArm(ctx, -32, -12, state.leftArmAngle,  state.leftElbowBend,  state.leftHandItem);
  drawArm(ctx,  32, -12, state.rightArmAngle, state.rightElbowBend, state.rightHandItem);

  // ─── Head (translate up to head position, apply head transforms) ────
  ctx.save();
  ctx.translate(0, -28 + state.headBob);
  ctx.rotate(state.headTilt);

  // Hair behind head
  drawHair(ctx, state.hairSway);

  // Face circle
  ctx.fillStyle = PALETTE.skin;
  ctx.beginPath();
  ctx.arc(0, 0, 36, 0, Math.PI * 2);
  ctx.fill();
  // Soft cheek blush
  ctx.fillStyle = PALETTE.cheek;
  ctx.globalAlpha = 0.55;
  ctx.beginPath(); ctx.arc(-18, 8, 7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc( 18, 8, 7, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  // Hair front (bangs / side wisps)
  drawHairFront(ctx, state.hairSway);

  // Eyebrows
  ctx.strokeStyle = PALETTE.hair;
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  const browLift = state.eyebrowAngle;
  ctx.save();
  ctx.translate(-11, -8 + browLift * 4);
  ctx.rotate(-0.08 + browLift * 0.2);
  ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(5, 0); ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.translate(11, -8 + browLift * 4);
  ctx.rotate(0.08 - browLift * 0.2);
  ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(5, 0); ctx.stroke();
  ctx.restore();

  // Eyes (with blink)
  drawEye(ctx, -11, 0, state.eyesClosed);
  drawEye(ctx,  11, 0, state.eyesClosed);

  // Nose hint + nose stud
  ctx.fillStyle = PALETTE.skinShade;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.ellipse(0, 8, 3, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = PALETTE.noseStud;
  ctx.beginPath();
  ctx.arc(-3, 11, 1.4, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  drawMouth(ctx, 0, 18, state.mouthShape);

  ctx.restore();   // pop head transforms

  ctx.restore();   // pop bodyBob/bodyScale
  ctx.restore();   // pop translate+scale+facing
}

// ─── Body part renderers ─────────────────────────────────────────────────────

function drawHair(ctx: CanvasRenderingContext2D, sway: number) {
  ctx.save();
  ctx.rotate(sway * 0.5);
  ctx.fillStyle = PALETTE.hair;
  // Big hair mass behind the head — long wavy hair
  ctx.beginPath();
  ctx.moveTo(-40, -10);
  ctx.bezierCurveTo(-58, 10, -55, 40, -42, 55);
  ctx.bezierCurveTo(-30, 65, 30, 65, 42, 55);
  ctx.bezierCurveTo(55, 40, 58, 10, 40, -10);
  ctx.bezierCurveTo(38, -30, -38, -30, -40, -10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawHairFront(ctx: CanvasRenderingContext2D, sway: number) {
  ctx.save();
  ctx.rotate(sway * 0.3);
  ctx.fillStyle = PALETTE.hair;
  // Side bangs falling to one side
  ctx.beginPath();
  ctx.moveTo(-30, -30);
  ctx.bezierCurveTo(-25, -34, 8, -34, 22, -26);
  ctx.bezierCurveTo(30, -18, 30, -8, 24, -2);
  ctx.bezierCurveTo(20, -8, 0, -10, -16, -12);
  ctx.bezierCurveTo(-30, -14, -36, -22, -30, -30);
  ctx.closePath();
  ctx.fill();
  // Tiny shine highlight
  ctx.fillStyle = PALETTE.hairHighlight;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.ellipse(8, -22, 6, 2, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawEye(ctx: CanvasRenderingContext2D, x: number, y: number, closed: number) {
  ctx.save();
  ctx.translate(x, y);
  if (closed >= 0.85) {
    // Closed: just a line
    ctx.strokeStyle = PALETTE.eye;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-5, 0); ctx.quadraticCurveTo(0, 1.5, 5, 0); ctx.stroke();
  } else {
    // Open: big oval with iris + sparkle
    ctx.fillStyle = PALETTE.white;
    ctx.beginPath();
    ctx.ellipse(0, 0, 5.5, 6 * (1 - closed * 0.8), 0, 0, Math.PI * 2);
    ctx.fill();
    if (closed < 0.5) {
      ctx.fillStyle = PALETTE.eye;
      ctx.beginPath();
      ctx.ellipse(0, 1, 3.2, 3.8 * (1 - closed * 0.6), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PALETTE.white;
      ctx.beginPath();
      ctx.arc(1.2, -0.5, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawMouth(ctx: CanvasRenderingContext2D, x: number, y: number, shape: MascotState['mouthShape']) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = PALETTE.mouth;
  ctx.fillStyle = PALETTE.mouth;
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  switch (shape) {
    case 'smile':
      ctx.beginPath();
      ctx.moveTo(-7, 0);
      ctx.quadraticCurveTo(0, 6, 7, 0);
      ctx.stroke();
      break;
    case 'wide':
      ctx.beginPath();
      ctx.moveTo(-9, -2);
      ctx.quadraticCurveTo(0, 10, 9, -2);
      ctx.quadraticCurveTo(0, 4, -9, -2);
      ctx.fill();
      break;
    case 'frown':
      ctx.beginPath();
      ctx.moveTo(-7, 3);
      ctx.quadraticCurveTo(0, -3, 7, 3);
      ctx.stroke();
      break;
    case 'o':
      ctx.beginPath();
      ctx.ellipse(0, 1, 3, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'flat':
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(6, 0);
      ctx.stroke();
      break;
  }
  ctx.restore();
}

function drawArm(
  ctx: CanvasRenderingContext2D,
  shoulderX: number,
  shoulderY: number,
  shoulderAngle: number,
  elbowBend: number,
  handItem: MascotState['leftHandItem'],
) {
  ctx.save();
  ctx.translate(shoulderX, shoulderY);
  // Upper arm
  ctx.rotate(shoulderAngle);
  const upperLen = 22;
  ctx.strokeStyle = PALETTE.sweater;
  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, upperLen);
  ctx.stroke();
  // Move to elbow
  ctx.translate(0, upperLen);
  ctx.rotate(elbowBend);
  // Forearm
  const foreLen = 20;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, foreLen);
  ctx.stroke();
  // Hand
  ctx.translate(0, foreLen);
  ctx.fillStyle = PALETTE.skin;
  ctx.beginPath();
  ctx.arc(0, 0, 6, 0, Math.PI * 2);
  ctx.fill();
  // Item in hand
  if (handItem === 'glass') {
    ctx.fillStyle = 'rgba(200,230,255,0.6)';
    ctx.strokeStyle = 'rgba(180,210,235,0.95)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    roundRect(ctx, -7, -4, 14, 16, 2);
    ctx.fill();
    ctx.stroke();
    // Water line
    ctx.fillStyle = 'rgba(140,190,220,0.85)';
    roundRect(ctx, -6, 2, 12, 9, 1);
    ctx.fill();
  }
  ctx.restore();
}

function drawLeg(
  ctx: CanvasRenderingContext2D,
  hipX: number,
  hipY: number,
  lift: number,
  color: string,
) {
  ctx.save();
  ctx.translate(hipX, hipY);
  ctx.rotate(lift * 0.6);              // hip rotation
  // Thigh
  ctx.strokeStyle = color;
  ctx.lineWidth = 22;
  ctx.lineCap = 'round';
  const thighLen = 26 - lift * 6;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, thighLen);
  ctx.stroke();
  // Shin (slight knee bend)
  ctx.translate(0, thighLen);
  ctx.rotate(lift * 0.4);
  const shinLen = 28;
  ctx.lineWidth = 20;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, shinLen);
  ctx.stroke();
  // Foot
  ctx.translate(0, shinLen);
  ctx.fillStyle = PALETTE.skin;
  ctx.beginPath();
  ctx.ellipse(0, 4, 11, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ─── Helper ──────────────────────────────────────────────────────────────────

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

// Type augmentation — allow optional override colour for pants per call
declare module './mascot-character' {
  interface MascotState {
    pantsColor?: string;
  }
}
