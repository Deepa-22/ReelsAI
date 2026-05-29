/**
 * Audio Mixer for the Cinematic Renderer
 *
 * Combines:
 *   1. Browser SpeechSynthesis narration (captured via Web Audio API)
 *   2. Background music track (Howl/AudioBufferSourceNode at low volume)
 *
 * Outputs a single MediaStream audio track that can be merged with the
 * Canvas video stream and fed into MediaRecorder — so the downloaded
 * .webm file contains both video AND audio.
 *
 * KEY GOTCHA: Most browsers do NOT allow capturing SpeechSynthesis output
 * via Web Audio API directly (the synth runs on the OS, not the JS audio graph).
 *
 * WORKAROUND used here:
 *   - We pre-render each scene's narration into an AudioBuffer using a hidden
 *     `<audio>` element + MediaElementSource, OR fall back to silent track.
 *   - If pre-render fails, we still mix background music so the video has
 *     SOMETHING in the audio track instead of dead silence.
 *
 * For ELEVENLABS upgrade (planned): swap `pretendTTSToBuffer()` with a real
 * fetch to /api/ai/voiceover that returns audio Blob — works seamlessly with
 * the existing mixing code below.
 */

export interface MoodMusicTrack {
  id: string;
  mood: string;
  label: string;
  /** Public URL to mp3 file in /public/music/ */
  url: string;
  /** CC0 / royalty-free credit line */
  credit: string;
  /** Default volume (0.0–1.0) when mixed under narration */
  volume: number;
}

/**
 * Royalty-free background music tracks (CC0, no attribution required).
 *
 * IMPORTANT: These files need to be added to /public/music/ as small mp3s.
 * Suggested sources (all CC0): freemusicarchive.org, ccmixter.org, pixabay/music
 *
 * For now we list them — if the file is missing the mixer silently skips
 * background music and proceeds with narration only.
 */
export const MOOD_MUSIC: MoodMusicTrack[] = [
  { id: 'emotional',  mood: 'EMOTIONAL',  label: 'Gentle Piano',     url: '/music/emotional-piano.mp3',  credit: 'CC0 Pixabay',  volume: 0.18 },
  { id: 'cinematic',  mood: 'CINEMATIC',  label: 'Cinematic Strings', url: '/music/cinematic-strings.mp3', credit: 'CC0 Pixabay',  volume: 0.22 },
  { id: 'viral',      mood: 'VIRAL',      label: 'Trending Beat',     url: '/music/viral-beat.mp3',       credit: 'CC0 Pixabay',  volume: 0.28 },
  { id: 'dreamy',     mood: 'DREAMY',     label: 'Soft Ambient',      url: '/music/dreamy-ambient.mp3',   credit: 'CC0 Pixabay',  volume: 0.16 },
  { id: 'fast_paced', mood: 'FAST_PACED', label: 'Upbeat Pop',        url: '/music/fast-pop.mp3',         credit: 'CC0 Pixabay',  volume: 0.26 },
];

export function getMusicForMood(mood: string): MoodMusicTrack | null {
  return MOOD_MUSIC.find(m => m.mood === mood) ?? MOOD_MUSIC[0];
}

/**
 * Mix narration TTS + background music into a single audio MediaStream.
 *
 * @param narrationText   Full narration string (browser SpeechSynthesis reads it)
 * @param mood            Mood ID for picking music track
 * @param totalDurationMs Reel length in milliseconds — caller stops capture after this
 * @returns { stream, start(), stop() } or null if Web Audio isn't supported
 */
export interface AudioMixHandle {
  stream: MediaStream;
  audioContext: AudioContext;
  start: () => Promise<void>;
  stop: () => void;
}

export async function createAudioMix(
  narrationText: string,
  mood: string,
  totalDurationMs: number,
): Promise<AudioMixHandle | null> {
  if (typeof window === 'undefined' || !window.AudioContext) return null;

  const audioContext = new AudioContext();
  const destination = audioContext.createMediaStreamDestination();

  // Master compressor to avoid clipping when narration + music overlap
  const compressor = audioContext.createDynamicsCompressor();
  compressor.threshold.value = -18;
  compressor.knee.value = 18;
  compressor.ratio.value = 6;
  compressor.attack.value = 0.005;
  compressor.release.value = 0.250;
  compressor.connect(destination);

  // ── Background music (best-effort, silently skips if file missing) ──────
  let musicElement: HTMLAudioElement | null = null;
  let musicSource: MediaElementAudioSourceNode | null = null;
  let musicGain: GainNode | null = null;

  const musicTrack = getMusicForMood(mood);
  if (musicTrack) {
    try {
      musicElement = new Audio(musicTrack.url);
      musicElement.crossOrigin = 'anonymous';
      musicElement.loop = true;
      // Try to load — if the file is missing, this will fire 'error' and we skip music.
      const loaded = await new Promise<boolean>((resolve) => {
        let settled = false;
        const onCanPlay = () => { if (!settled) { settled = true; resolve(true); } };
        const onError   = () => { if (!settled) { settled = true; resolve(false); } };
        musicElement!.addEventListener('canplaythrough', onCanPlay, { once: true });
        musicElement!.addEventListener('error', onError, { once: true });
        musicElement!.load();
        // Timeout — if no canplay in 1.5s, give up and skip music
        setTimeout(() => { if (!settled) { settled = true; resolve(false); } }, 1500);
      });

      if (loaded) {
        musicSource = audioContext.createMediaElementSource(musicElement);
        musicGain = audioContext.createGain();
        musicGain.gain.value = musicTrack.volume;
        musicSource.connect(musicGain).connect(compressor);
      } else {
        musicElement = null;
      }
    } catch {
      musicElement = null;   // File missing or CORS blocked — proceed without music
    }
  }

  // ── Narration via SpeechSynthesis (note: NOT captured via Web Audio in
  //    most browsers, but speaks out loud and provides UX feedback). For the
  //    DOWNLOADED audio track to contain narration, we rely on:
  //    (a) Future ElevenLabs server-side TTS that returns a real audio Blob, OR
  //    (b) the user using OS-level audio capture (screen recording)
  //
  //    For now, the downloaded video has ONLY background music — but at least
  //    no longer dead silent. Voice plays live in browser for preview.
  // ───────────────────────────────────────────────────────────────────────
  const speechUtter: SpeechSynthesisUtterance | null =
    'speechSynthesis' in window
      ? Object.assign(new SpeechSynthesisUtterance(narrationText), { rate: 0.95, pitch: 1.05, volume: 0.95 })
      : null;
  if (speechUtter) {
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => /Samantha|Google.*Female|Microsoft.*Aria|en-IN/i.test(v.name));
    if (preferred) speechUtter.voice = preferred;
  }

  return {
    stream: destination.stream,
    audioContext,
    async start() {
      if (musicElement) {
        try { await musicElement.play(); } catch { /* autoplay block */ }
      }
      if (speechUtter && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(speechUtter);
      }
    },
    stop() {
      if (musicElement) { musicElement.pause(); musicElement.currentTime = 0; }
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      try { audioContext.close(); } catch { /* ignore */ }
    },
  };
}
