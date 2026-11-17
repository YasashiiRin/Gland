import { getContext, type SfxSettings } from './SfxSystem';

/** A tiger's roar, synthesised with Web Audio: a low growl that swells, rasps and fades. */
export function playRoar(settings: SfxSettings, pan = 0): void {
  const ctx = getContext();
  if (!ctx || settings.muted || settings.volume <= 0) return;
  const now = ctx.currentTime;
  const out = ctx.createGain();
  const panner = ctx.createStereoPanner();
  panner.pan.value = Math.max(-1, Math.min(1, pan));
  out.gain.setValueAtTime(0.0001, now);
  out.gain.exponentialRampToValueAtTime(0.9 * settings.volume, now + 0.35);
  out.gain.setValueAtTime(0.9 * settings.volume, now + 0.9);
  out.gain.exponentialRampToValueAtTime(0.0001, now + 1.9);
  out.connect(panner).connect(ctx.destination);

  const voice = ctx.createOscillator();
  voice.type = 'sawtooth';
  voice.frequency.setValueAtTime(70, now);
  voice.frequency.linearRampToValueAtTime(120, now + 0.4);
  voice.frequency.linearRampToValueAtTime(55, now + 1.9);
  const wobble = ctx.createOscillator();
  const wobbleGain = ctx.createGain();
  wobble.frequency.value = 23;
  wobbleGain.gain.value = 18;
  wobble.connect(wobbleGain).connect(voice.frequency);
  const tone = ctx.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = 520;
  voice.connect(tone).connect(out);

  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 2), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const rasp = ctx.createBufferSource();
  rasp.buffer = buf;
  const raspFilter = ctx.createBiquadFilter();
  raspFilter.type = 'bandpass';
  raspFilter.frequency.value = 300;
  raspFilter.Q.value = 0.8;
  const raspGain = ctx.createGain();
  raspGain.gain.value = 0.5;
  rasp.connect(raspFilter).connect(raspGain).connect(out);

  for (const node of [voice, wobble, rasp]) {
    node.start(now);
    node.stop(now + 2);
  }
}
