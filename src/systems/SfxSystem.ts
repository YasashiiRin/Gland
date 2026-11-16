/**
 * Simple procedural sound effects via the raw Web Audio API — no audio files
 * needed. Each effect is just one or two short oscillator tones, which keeps
 * this entirely original (no sampled or licensed sound assets).
 */

let sharedContext: AudioContext | null = null;

export function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!sharedContext) sharedContext = new AC();
  return sharedContext;
}

export interface SfxSettings {
  muted: boolean;
  volume: number; // 0-1
}

function tone(ctx: AudioContext, freq: number, startAt: number, duration: number, gainPeak: number, type: OscillatorType): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(gainPeak, startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.02);
}

function play(settings: SfxSettings, notes: { freq: number; delay: number; duration: number; type?: OscillatorType }[]): void {
  if (settings.muted || settings.volume <= 0) return;
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const peak = 0.18 * settings.volume;
  for (const n of notes) {
    tone(ctx, n.freq, now + n.delay, n.duration, peak, n.type ?? 'sine');
  }
}

export function playUseTool(settings: SfxSettings): void {
  play(settings, [{ freq: 220, delay: 0, duration: 0.1, type: 'square' }]);
}

export function playPickup(settings: SfxSettings): void {
  play(settings, [
    { freq: 523, delay: 0, duration: 0.08, type: 'triangle' },
    { freq: 784, delay: 0.06, duration: 0.1, type: 'triangle' },
  ]);
}

export function playClick(settings: SfxSettings): void {
  play(settings, [{ freq: 440, delay: 0, duration: 0.05, type: 'square' }]);
}

export function playDayChime(settings: SfxSettings): void {
  play(settings, [
    { freq: 392, delay: 0, duration: 0.25, type: 'sine' },
    { freq: 523, delay: 0.1, duration: 0.3, type: 'sine' },
    { freq: 659, delay: 0.2, duration: 0.4, type: 'sine' },
  ]);
}

export function playHit(settings: SfxSettings): void {
  play(settings, [{ freq: 150, delay: 0, duration: 0.12, type: 'sawtooth' }]);
}
