// Dapur Kilat — tiny synthesized sound effects.
// No audio files are shipped: every blip is a short WebAudio oscillator
// envelope, so the game stays silent on disk and still answers at once.

export function makeSounds(getMuted) {
  let audio = null;

  function context() {
    if (!audio) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      audio = new Ctor();
    }
    if (audio.state === 'suspended') audio.resume();
    return audio;
  }

  function tone(freq, dur, type, vol, when = 0) {
    if (getMuted()) return;
    const ctx = context();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime + when);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + when + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + when + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + when);
    osc.stop(ctx.currentTime + when + dur + 0.05);
  }

  return {
    // A soft pop when an ingredient lands on the plate.
    pick() {
      tone(520, 0.09, 'sine', 0.12);
      tone(780, 0.07, 'sine', 0.08, 0.04);
    },
    // A happy two-note chime when a dish is served.
    served() {
      tone(660, 0.12, 'triangle', 0.14);
      tone(880, 0.18, 'triangle', 0.14, 0.09);
      tone(1320, 0.14, 'sine', 0.06, 0.18);
    },
    // A low buzz for a wrong serve or a full plate.
    error() {
      tone(180, 0.16, 'sawtooth', 0.08);
      tone(140, 0.2, 'sawtooth', 0.08, 0.08);
    },
    // A rising arpeggio when the shift starts.
    start() {
      tone(440, 0.1, 'triangle', 0.12);
      tone(554, 0.1, 'triangle', 0.12, 0.08);
      tone(659, 0.16, 'triangle', 0.12, 0.16);
    },
  };
}
