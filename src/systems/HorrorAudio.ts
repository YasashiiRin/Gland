import { getContext, type SfxSettings } from './SfxSystem';

/**
 * Horror sounds synthesised on the fly with Web Audio (no recorded audio):
 * heartbeat, a low drone, footsteps, whispers, knocks, a distant baby's cry,
 * splashes, and the jump-scare screech. `pan` -1..1 places a sound left/right.
 */

function out(ctx: AudioContext, settings: SfxSettings, gain: number, pan = 0): GainNode | null {
  if (settings.muted || settings.volume <= 0) return null;
  const g = ctx.createGain();
  g.gain.value = gain * settings.volume;
  const p = ctx.createStereoPanner();
  p.pan.value = Math.max(-1, Math.min(1, pan));
  g.connect(p).connect(ctx.destination);
  return g;
}

function noiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function thump(ctx: AudioContext, dest: AudioNode, at: number, freq: number, length: number): void {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(freq, at);
  o.frequency.exponentialRampToValueAtTime(freq * 0.5, at + length);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(1, at + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, at + length);
  o.connect(g).connect(dest);
  o.start(at);
  o.stop(at + length + 0.05);
}

function noiseBurst(ctx: AudioContext, dest: AudioNode, at: number, length: number, filter: BiquadFilterType, freq: number, q = 1): void {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, length);
  const f = ctx.createBiquadFilter();
  f.type = filter;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(1, at + length * 0.2);
  g.gain.exponentialRampToValueAtTime(0.0001, at + length);
  src.connect(f).connect(g).connect(dest);
  src.start(at);
}

/** One "lub-dub". Louder and deeper as dread rises. */
export function playHeartbeat(settings: SfxSettings, intensity: number): void {
  const ctx = getContext();
  const dest = ctx && out(ctx, settings, 0.25 + intensity * 0.45);
  if (!ctx || !dest) return;
  const t = ctx.currentTime;
  thump(ctx, dest, t, 70, 0.18);
  thump(ctx, dest, t + 0.22, 58, 0.22);
}

/** A few seconds of low, beating drone (two detuned sines). */
export function playDrone(settings: SfxSettings, seconds: number, intensity: number): void {
  const ctx = getContext();
  const dest = ctx && out(ctx, settings, 0.06 + intensity * 0.1);
  if (!ctx || !dest) return;
  const t = ctx.currentTime;
  for (const f of [41, 43.5]) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(1, t + seconds * 0.4);
    g.gain.linearRampToValueAtTime(0.0001, t + seconds);
    o.connect(g).connect(dest);
    o.start(t);
    o.stop(t + seconds + 0.1);
  }
}

/** Soft steps on dirt, coming from one side. */
export function playFootsteps(settings: SfxSettings, steps: number, pan: number, interval = 0.48): void {
  const ctx = getContext();
  const dest = ctx && out(ctx, settings, 0.5, pan);
  if (!ctx || !dest) return;
  for (let i = 0; i < steps; i++) noiseBurst(ctx, dest, ctx.currentTime + i * interval, 0.09, 'lowpass', 500);
}

/** Breathy, wavering whisper (band-passed noise with a trembling filter). */
export function playWhisper(settings: SfxSettings, pan: number): void {
  const ctx = getContext();
  const dest = ctx && out(ctx, settings, 0.35, pan);
  if (!ctx || !dest) return;
  const t = ctx.currentTime;
  for (let i = 0; i < 5; i++) noiseBurst(ctx, dest, t + i * 0.28 + Math.random() * 0.1, 0.25, 'bandpass', 1800 + Math.random() * 1600, 4);
}

/** Three knocks on a wooden door, a pause, then three more. */
export function playKnock(settings: SfxSettings): void {
  const ctx = getContext();
  const dest = ctx && out(ctx, settings, 0.7);
  if (!ctx || !dest) return;
  const t = ctx.currentTime;
  [0, 0.3, 0.6, 2.2, 2.4, 2.6].forEach((d) => {
    thump(ctx, dest, t + d, 140, 0.12);
    noiseBurst(ctx, dest, t + d, 0.05, 'bandpass', 900, 2);
  });
}

/** A baby crying somewhere far away: wavering high tones, very quiet. */
export function playBabyCry(settings: SfxSettings, pan: number): void {
  const ctx = getContext();
  const dest = ctx && out(ctx, settings, 0.12, pan);
  if (!ctx || !dest) return;
  const t = ctx.currentTime;
  for (let i = 0; i < 3; i++) {
    const at = t + i * 1.3;
    const o = ctx.createOscillator();
    const vib = ctx.createOscillator();
    const vibGain = ctx.createGain();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(520, at);
    o.frequency.linearRampToValueAtTime(680, at + 0.3);
    o.frequency.linearRampToValueAtTime(430, at + 1.0);
    vib.frequency.value = 7;
    vibGain.gain.value = 25;
    vib.connect(vibGain).connect(o.frequency);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(1, at + 0.15);
    g.gain.linearRampToValueAtTime(0.0001, at + 1.05);
    o.connect(g).connect(dest);
    o.start(at);
    vib.start(at);
    o.stop(at + 1.1);
    vib.stop(at + 1.1);
  }
}

export function playSplash(settings: SfxSettings, pan: number): void {
  const ctx = getContext();
  const dest = ctx && out(ctx, settings, 0.6, pan);
  if (!ctx || !dest) return;
  noiseBurst(ctx, dest, ctx.currentTime, 0.6, 'lowpass', 1200);
}

/** A short dull "whoomp" when something vanishes. */
export function playVanish(settings: SfxSettings): void {
  const ctx = getContext();
  const dest = ctx && out(ctx, settings, 0.5);
  if (!ctx || !dest) return;
  thump(ctx, dest, ctx.currentTime, 110, 0.35);
  noiseBurst(ctx, dest, ctx.currentTime, 0.3, 'highpass', 3000);
}

/** The jump-scare screech: harsh rising sawtooth plus noise. Short, loud. */
export function playScreech(settings: SfxSettings): void {
  const ctx = getContext();
  const dest = ctx && out(ctx, settings, 0.55);
  if (!ctx || !dest) return;
  const t = ctx.currentTime;
  for (const base of [380, 397, 760]) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(base, t);
    o.frequency.exponentialRampToValueAtTime(base * 2.2, t + 0.5);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    o.connect(g).connect(dest);
    o.start(t);
    o.stop(t + 0.75);
  }
  noiseBurst(ctx, dest, t, 0.6, 'highpass', 1500);
}

/** A thin, eerie chime for will-o'-wisps. */
export function playWispChime(settings: SfxSettings): void {
  const ctx = getContext();
  const dest = ctx && out(ctx, settings, 0.12);
  if (!ctx || !dest) return;
  const t = ctx.currentTime;
  [988, 932, 1175].forEach((f, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t + i * 0.5);
    g.gain.exponentialRampToValueAtTime(1, t + i * 0.5 + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.5 + 1.4);
    o.connect(g).connect(dest);
    o.start(t + i * 0.5);
    o.stop(t + i * 0.5 + 1.5);
  });
}
