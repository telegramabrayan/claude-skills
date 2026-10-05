/**
 * Sonidos discretos sintetizados con Web Audio (sin archivos). Respetan el
 * interruptor de sonido y solo suenan después de una interacción del usuario.
 */
type Cue = "correct" | "wrong" | "xp" | "unlock" | "achievement" | "levelup" | "complete";

let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(on: boolean) {
  enabled = on;
}

const NOTES: Record<Cue, [number, number][]> = {
  // [frecuencia Hz, inicio s]
  correct: [[660, 0], [880, 0.08]],
  wrong: [[220, 0]],
  xp: [[1046, 0]],
  unlock: [[523, 0], [659, 0.07], [784, 0.14]],
  achievement: [[659, 0], [784, 0.08], [988, 0.16], [1318, 0.26]],
  levelup: [[523, 0], [659, 0.09], [784, 0.18], [1046, 0.3]],
  complete: [[784, 0], [988, 0.1], [1175, 0.2]],
};

export function play(cue: Cue) {
  if (!enabled || typeof window === "undefined") return;
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
    const t0 = ctx.currentTime;
    for (const [freq, start] of NOTES[cue]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = cue === "wrong" ? "triangle" : "sine";
      osc.frequency.value = freq;
      const vol = cue === "wrong" ? 0.05 : 0.07;
      gain.gain.setValueAtTime(0, t0 + start);
      gain.gain.linearRampToValueAtTime(vol, t0 + start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + start + (cue === "wrong" ? 0.22 : 0.18));
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0 + start);
      osc.stop(t0 + start + 0.25);
    }
  } catch {
    /* sin audio disponible: se ignora */
  }
}
