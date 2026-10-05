"use client";
import { useMemo } from "react";

const COLORS = ["var(--primary)", "var(--accent)", "var(--xp)", "var(--success)", "var(--c-physics)"];

/** Pequeña explosión de papelitos (CSS puro). Se desactiva con prefers-reduced-motion. */
export function Confetti({ count = 28 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const dist = 70 + ((i * 37) % 60);
        return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist - 30, color: COLORS[i % COLORS.length], delay: (i % 5) * 0.03 };
      }),
    [count],
  );
  return (
    <div className="pointer-events-none absolute left-1/2 top-12 h-0 w-0" aria-hidden>
      {pieces.map((p, i) => (
        <span key={i} className="confetti-piece" style={{ background: p.color, animationDelay: `${p.delay}s`, ["--dx" as string]: `${p.dx}px`, ["--dy" as string]: `${p.dy}px` }} />
      ))}
    </div>
  );
}
