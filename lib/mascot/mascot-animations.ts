/**
 * Mascot Animation Library
 *
 * Procedural animations for the Honest Hormones mascot.
 * Each animation is a function: (elapsed time in seconds) → MascotState
 *
 * Combine these with backgrounds + scene compositions to build real animated reels.
 */

import { DEFAULT_STATE, type MascotState } from './mascot-character';

export type ActionName =
  | 'idle'         // default — breathing, occasional blink, hair sway
  | 'wave'         // wave right hand happily
  | 'walk'         // walk in place (legs alternate, body bob)
  | 'drink'        // raise glass to mouth, drink, lower
  | 'stretch'      // arms up, body extends
  | 'sit'          // pose: sitting down (legs folded look)
  | 'sad'          // head down, slumped shoulders
  | 'happy-bounce' // body bouncing up and down with arms out
  | 'dance'        // sways side to side with arm movements
  | 'hand-on-heart'// one hand to chest, gentle nod
  | 'looking-around'  // head turns left-right slowly, curious
  | 'thinking';    // head tilted, finger to chin (approximated)

export interface ActionFrame {
  state: MascotState;
}

// Easing helpers
const ease = {
  inOut: (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  out:   (t: number) => 1 - Math.pow(1 - t, 3),
  sine:  (t: number) => Math.sin(t * Math.PI * 2),
};

/**
 * Get the mascot state for an action at a given time.
 * `loopT` is the time within the action's loop (auto-modded by loopDuration).
 */
export function getActionState(action: ActionName, t: number): MascotState {
  const s: MascotState = { ...DEFAULT_STATE };

  // Idle baseline (everything gets gentle breathing + occasional blink)
  s.bodyScale = 1 + Math.sin(t * 1.6) * 0.025;
  s.bodyBob   = Math.sin(t * 1.6) * 1.2;
  s.hairSway  = Math.sin(t * 0.9) * 0.05;
  // Blink every ~4 sec for ~120ms
  const blinkCycle = (t % 4) / 4;
  s.eyesClosed = (blinkCycle > 0.97) ? (blinkCycle - 0.97) / 0.03 :
                 (blinkCycle < 0.005) ? 1 - blinkCycle / 0.005 : 0;

  switch (action) {
    case 'idle':
      s.mouthShape = 'smile';
      // Gentle head sway
      s.headTilt = Math.sin(t * 0.6) * 0.04;
      s.headBob  = Math.sin(t * 1.6) * 1;
      break;

    case 'wave': {
      // Right arm raises up and waves side to side
      const waveT = (t % 3) / 3;
      // Phase 1 (0-0.3): raise arm
      // Phase 2 (0.3-2.7): wave back and forth
      // Phase 3 (2.7-3): lower arm
      let armAngle: number;
      if (waveT < 0.1) armAngle = ease.out(waveT / 0.1) * (-2.4);
      else if (waveT > 0.9) armAngle = -2.4 * (1 - (waveT - 0.9) / 0.1);
      else armAngle = -2.4;
      s.rightArmAngle = armAngle;
      // Wave: bend at elbow back and forth during phase 2
      if (waveT > 0.1 && waveT < 0.9) {
        s.rightElbowBend = 0.6 + Math.sin((waveT - 0.1) * Math.PI * 6) * 0.35;
      }
      s.mouthShape = 'wide';
      s.headTilt = Math.sin(t * 2) * 0.04;
      break;
    }

    case 'walk': {
      // Walking-in-place: alternating legs + body bob + arm swing
      const walkT = (t * 2) % 1;                    // 2 steps/sec
      const phase = walkT * Math.PI * 2;
      s.bodyBob = Math.abs(Math.sin(phase)) * -4;   // upward bob on each step
      s.leftLegLift  = Math.max(0, Math.sin(phase));
      s.rightLegLift = Math.max(0, -Math.sin(phase));
      // Arms swing opposite to legs
      s.leftArmAngle  =  Math.sin(phase) * 0.45;
      s.rightArmAngle = -Math.sin(phase) * 0.45;
      s.mouthShape = 'smile';
      break;
    }

    case 'drink': {
      // 3-phase: raise glass, drink (head tilts back), lower
      const dT = (t % 4) / 4;
      let armAngle = 0, headTilt = 0, eyes = 0, mouthShape: MascotState['mouthShape'] = 'flat';
      if (dT < 0.3) {
        const p = ease.out(dT / 0.3);
        armAngle = -2.1 * p;
      } else if (dT < 0.5) {
        armAngle = -2.1;
        const p = (dT - 0.3) / 0.2;
        headTilt = -p * 0.25;
        eyes = p * 0.6;
        mouthShape = 'o';
      } else if (dT < 0.75) {
        armAngle = -2.1;
        const p = 1 - (dT - 0.5) / 0.25;
        headTilt = -p * 0.25;
        eyes = p * 0.6;
        mouthShape = 'o';
      } else if (dT < 0.95) {
        const p = 1 - (dT - 0.75) / 0.2;
        armAngle = -2.1 * p;
        mouthShape = 'smile';
      } else {
        mouthShape = 'smile';
      }
      s.rightArmAngle = armAngle;
      s.rightElbowBend = armAngle < -0.5 ? 1.4 : 0;
      s.rightHandItem = 'glass';
      s.headTilt = headTilt;
      s.eyesClosed = Math.max(s.eyesClosed, eyes);
      s.mouthShape = mouthShape;
      break;
    }

    case 'stretch': {
      // 4-phase: arms up slowly, hold, lower
      const sT = (t % 5) / 5;
      let armAngle: number;
      if (sT < 0.3) armAngle = -ease.inOut(sT / 0.3) * 2.9;
      else if (sT < 0.7) armAngle = -2.9;
      else if (sT < 0.95) armAngle = -2.9 * (1 - (sT - 0.7) / 0.25);
      else armAngle = 0;
      s.leftArmAngle = armAngle;
      s.rightArmAngle = armAngle;
      // Body extends slightly when arms are up
      s.bodyScale = 1 + 0.025 + (armAngle < -1.5 ? 0.04 : 0);
      s.bodyBob   = armAngle < -1.5 ? -2 : 0;
      s.mouthShape = sT > 0.4 && sT < 0.6 ? 'o' : 'smile';   // tiny "ahh" while peak stretching
      break;
    }

    case 'sit':
      // Static pose suggesting sitting: legs folded, body lowered, arms gently on lap
      s.bodyBob = 18;
      s.leftLegLift  = 0.95;
      s.rightLegLift = 0.95;
      s.leftArmAngle = 0.4;
      s.rightArmAngle = -0.4;
      s.leftElbowBend = 1.2;
      s.rightElbowBend = 1.2;
      s.mouthShape = 'smile';
      s.headTilt = Math.sin(t * 0.5) * 0.05;
      s.eyebrowAngle = -0.1;
      break;

    case 'sad':
      // Head down, shoulders rolled, slow breathing
      s.headTilt = -0.22;
      s.headBob  = 4;
      s.bodyBob  = 4 + Math.sin(t * 1.2) * 1.2;
      s.bodyScale = 0.98;
      s.mouthShape = 'frown';
      s.eyebrowAngle = -0.3;
      s.leftArmAngle = -0.18;
      s.rightArmAngle = 0.18;
      break;

    case 'happy-bounce': {
      // Bounce 2x/sec, arms swing outward
      const bT = (t * 2) % 1;
      const bounce = Math.abs(Math.sin(bT * Math.PI));
      s.bodyBob = -10 * bounce;
      s.bodyScale = 1 + bounce * 0.05;
      s.leftArmAngle  = -0.6 - bounce * 0.35;
      s.rightArmAngle =  0.6 + bounce * 0.35;
      s.mouthShape = 'wide';
      s.headBob  = -bounce * 4;
      break;
    }

    case 'dance': {
      // Sway side to side, alternating arm raises
      const phase = t * 1.4;
      const sway = Math.sin(phase);
      s.headTilt = sway * 0.18;
      s.bodyBob  = Math.abs(Math.cos(phase)) * -4;
      s.leftArmAngle  = sway > 0 ? -1.4 * sway : -0.2;
      s.rightArmAngle = sway < 0 ?  1.4 * sway :  0.2;
      s.leftElbowBend  = 0.4;
      s.rightElbowBend = 0.4;
      s.mouthShape = 'wide';
      // Step feet to beat
      s.leftLegLift  = Math.max(0, sway) * 0.3;
      s.rightLegLift = Math.max(0, -sway) * 0.3;
      break;
    }

    case 'hand-on-heart':
      // Right hand on chest, gentle nodding
      s.rightArmAngle = -0.9;
      s.rightElbowBend = 1.7;
      s.headTilt = Math.sin(t * 0.8) * 0.05;
      s.headBob = Math.sin(t * 0.8) * 2;
      s.mouthShape = 'smile';
      s.eyebrowAngle = -0.08;
      break;

    case 'looking-around': {
      const look = Math.sin(t * 0.6);
      s.headTilt = look * 0.35;
      s.mouthShape = 'flat';
      break;
    }

    case 'thinking':
      // Right hand near chin (approximated by raised forearm)
      s.rightArmAngle = -1.2;
      s.rightElbowBend = 1.6;
      s.headTilt = 0.15;
      s.mouthShape = 'flat';
      s.eyebrowAngle = -0.18;
      // Slight head sway
      s.headBob = Math.sin(t * 0.6) * 1.5;
      break;
  }

  return s;
}

/** Loop duration in seconds — for sequencing or video planning. */
export const ACTION_LOOP_DURATION: Record<ActionName, number> = {
  idle: 4,
  wave: 3,
  walk: 1,
  drink: 4,
  stretch: 5,
  sit: 5,
  sad: 4,
  'happy-bounce': 1,
  dance: 4.5,
  'hand-on-heart': 4,
  'looking-around': 5,
  thinking: 5,
};

/** Pretty labels for UI buttons */
export const ACTION_LABELS: Record<ActionName, { label: string; emoji: string; mood: string }> = {
  idle:             { label: 'Just standing',  emoji: '🌸', mood: 'gentle' },
  wave:             { label: 'Wave hi',         emoji: '👋', mood: 'happy' },
  walk:             { label: 'Walking',         emoji: '🚶‍♀️', mood: 'gentle' },
  drink:            { label: 'Drinking water',  emoji: '💧', mood: 'gentle' },
  stretch:          { label: 'Stretching',      emoji: '🧘‍♀️', mood: 'strong' },
  sit:              { label: 'Sitting',         emoji: '🪷', mood: 'gentle' },
  sad:              { label: 'Feeling down',    emoji: '🥲', mood: 'sad' },
  'happy-bounce':   { label: 'Happy bounce',    emoji: '🎉', mood: 'happy' },
  dance:            { label: 'Dancing',         emoji: '💃', mood: 'happy' },
  'hand-on-heart':  { label: 'Hand on heart',   emoji: '🤍', mood: 'gentle' },
  'looking-around': { label: 'Looking around',  emoji: '👀', mood: 'gentle' },
  thinking:         { label: 'Thinking',        emoji: '🤔', mood: 'worried' },
};
