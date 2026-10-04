/** RNG determinístico (mulberry32): la misma semilla produce siempre el mismo ejercicio. */
export function rng(seed: number) {
  let a = seed >>> 0 || 1;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (lo: number, hi: number) => lo + Math.floor(next() * (hi - lo + 1));
  return {
    next,
    int,
    /** Entero en [lo, hi] distinto de cero. */
    nz: (lo: number, hi: number) => {
      let v = 0;
      while (v === 0) v = int(lo, hi);
      return v;
    },
    pick: <T,>(arr: readonly T[]): T => arr[Math.floor(next() * arr.length)],
    bool: () => next() < 0.5,
    shuffle: <T,>(arr: T[]): T[] => {
      const out = [...arr];
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
  };
}

export type Rng = ReturnType<typeof rng>;

export function newSeed(): number {
  return Math.floor(Math.random() * 2 ** 31);
}
