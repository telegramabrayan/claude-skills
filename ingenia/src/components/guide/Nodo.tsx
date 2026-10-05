"use client";
import type { ReactNode } from "react";

export type Mood = "neutral" | "happy" | "thinking" | "focus";

/**
 * Nodo: el guía de Ingenia. Un pequeño robot hexagonal (como una tuerca o un
 * nodo de un grafo). Habla poco y en tono adulto.
 */
export function Nodo({ mood = "neutral", size = 56, bob = true }: { mood?: Mood; size?: number; bob?: boolean }) {
  const eyes =
    mood === "happy" ? (
      <>
        <path d="M21 30 q3 -4 6 0" stroke="var(--guide-face)" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <path d="M37 30 q3 -4 6 0" stroke="var(--guide-face)" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      </>
    ) : mood === "thinking" ? (
      <>
        <circle cx="24" cy="29" r="2.8" fill="var(--guide-face)" />
        <rect x="36" y="28" width="7" height="2.6" rx="1.3" fill="var(--guide-face)" />
      </>
    ) : (
      <>
        <circle cx="24" cy="29" r="3" fill="var(--guide-face)" />
        <circle cx="40" cy="29" r="3" fill="var(--guide-face)" />
      </>
    );
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={bob ? "guide-bob shrink-0" : "shrink-0"} role="img" aria-label="Nodo, tu guía">
      <line x1="32" y1="4" x2="32" y2="12" stroke="var(--guide-body)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="4" r="3" fill="var(--xp)" />
      <polygon points="32,10 54,22 54,46 32,58 10,46 10,22" fill="var(--guide-body)" />
      <polygon points="32,16 48,25 48,43 32,52 16,43 16,25" fill="none" stroke="var(--guide-face)" strokeOpacity="0.35" strokeWidth="1.5" />
      {eyes}
      {mood === "happy" ? (
        <path d="M26 39 q6 5 12 0" stroke="var(--guide-face)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      ) : mood === "thinking" ? (
        <line x1="27" y1="40" x2="37" y2="40" stroke="var(--guide-face)" strokeWidth="2.4" strokeLinecap="round" />
      ) : (
        <path d="M27 39 q5 3 10 0" stroke="var(--guide-face)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
}

/** Nodo con un globo de diálogo corto. */
export function GuideSay({ children, mood = "neutral", size = 48, className = "" }: { children: ReactNode; mood?: Mood; size?: number; className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Nodo mood={mood} size={size} />
      <div className="relative rounded-2xl rounded-bl-sm border border-line bg-surface px-3.5 py-2 text-[0.95rem] shadow-sm" role="status">
        {children}
      </div>
    </div>
  );
}
