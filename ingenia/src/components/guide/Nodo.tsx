"use client";
import type { ReactNode } from "react";

export type Mood = "neutral" | "happy" | "thinking" | "focus" | "celebrate" | "surprised" | "explain" | "encourage" | "sleepy";

/** Ojos y boca en la "pantalla" de la cara (coordenadas del viewBox 0 0 120 140). */
function Face({ mood }: { mood: Mood }) {
  const c = "var(--guide-face)";
  const sw = { stroke: c, strokeWidth: 3.2, fill: "none", strokeLinecap: "round" as const };
  const eyes = (() => {
    switch (mood) {
      case "happy":
      case "celebrate":
      case "encourage":
        return (
          <>
            <path d="M44 50 q5 -7 10 0" {...sw} />
            <path d="M66 50 q5 -7 10 0" {...sw} />
          </>
        );
      case "thinking":
        return (
          <>
            <circle cx="49" cy="48" r="4" fill={c} className="nodo-eye" />
            <path d="M65 47 h11" {...sw} />
          </>
        );
      case "surprised":
        return (
          <>
            <circle cx="49" cy="48" r="5.5" fill="none" stroke={c} strokeWidth="3" />
            <circle cx="71" cy="48" r="5.5" fill="none" stroke={c} strokeWidth="3" />
            <circle cx="49" cy="48" r="2" fill={c} />
            <circle cx="71" cy="48" r="2" fill={c} />
          </>
        );
      case "sleepy":
        return (
          <>
            <path d="M44 49 h10" {...sw} />
            <path d="M66 49 h10" {...sw} />
          </>
        );
      case "focus":
        return (
          <>
            <path d="M43 42 l10 3" {...sw} />
            <path d="M77 42 l-10 3" {...sw} />
            <circle cx="49" cy="50" r="3.6" fill={c} className="nodo-eye" />
            <circle cx="71" cy="50" r="3.6" fill={c} className="nodo-eye" />
          </>
        );
      default:
        return (
          <>
            <circle cx="49" cy="48" r="4.2" fill={c} className="nodo-eye" />
            <circle cx="71" cy="48" r="4.2" fill={c} className="nodo-eye" />
          </>
        );
    }
  })();
  const mouth =
    mood === "celebrate" ? (
      <path d="M50 58 q10 11 20 0 z" fill={c} />
    ) : mood === "happy" || mood === "encourage" || mood === "explain" ? (
      <path d="M51 59 q9 7 18 0" {...sw} />
    ) : mood === "surprised" ? (
      <ellipse cx="60" cy="61" rx="4" ry="5" fill={c} />
    ) : mood === "thinking" || mood === "focus" ? (
      <path d="M53 61 h12" {...sw} />
    ) : mood === "sleepy" ? (
      <path d="M55 61 q5 3 10 0" {...sw} />
    ) : (
      <path d="M52 59 q8 5 16 0" {...sw} />
    );
  return (
    <>
      {eyes}
      {mouth}
    </>
  );
}

/** Brazos según el estado de ánimo: festejar, explicar con la pizarra, pensar, dar ánimo… */
function Arms({ mood }: { mood: Mood }) {
  const arm = { stroke: "var(--guide-body)", strokeWidth: 7, fill: "none", strokeLinecap: "round" as const };
  const hand = (x: number, y: number) => <circle cx={x} cy={y} r="5.5" fill="var(--guide-hand)" />;
  switch (mood) {
    case "celebrate":
      return (
        <g className="nodo-arms-up">
          <path d="M36 88 Q22 76 20 60" {...arm} />
          {hand(20, 58)}
          <path d="M84 88 Q98 76 100 60" {...arm} />
          {hand(100, 58)}
        </g>
      );
    case "explain":
      return (
        <>
          <path d="M36 90 Q26 100 30 112" {...arm} />
          {hand(30, 113)}
          <g className="nodo-point">
            <path d="M84 88 Q96 84 104 76" {...arm} />
            {hand(105, 75)}
          </g>
        </>
      );
    case "thinking":
      return (
        <>
          <path d="M36 90 Q26 100 30 112" {...arm} />
          {hand(30, 113)}
          <path d="M84 90 Q86 76 74 70" {...arm} />
          {hand(72, 70)}
        </>
      );
    case "encourage":
      return (
        <>
          <path d="M36 90 Q26 100 30 112" {...arm} />
          {hand(30, 113)}
          <g className="nodo-wave">
            <path d="M84 88 Q98 82 98 66" {...arm} />
            {hand(98, 64)}
            <rect x="95.5" y="52" width="5" height="10" rx="2.5" fill="var(--guide-hand)" />
          </g>
        </>
      );
    case "surprised":
      return (
        <>
          <path d="M36 88 Q22 86 16 76" {...arm} />
          {hand(15, 74)}
          <path d="M84 88 Q98 86 104 76" {...arm} />
          {hand(105, 74)}
        </>
      );
    default:
      return (
        <>
          <path d="M36 90 Q26 100 30 112" {...arm} />
          {hand(30, 113)}
          <path d="M84 90 Q94 100 90 112" {...arm} />
          {hand(90, 113)}
        </>
      );
  }
}

/**
 * Nodo: el guía de Ingenia. Un robot con cabeza de hexágono (como una tuerca o
 * el nodo de un grafo), antena con lamparita y una pantalla por cara. Habla
 * poco y en tono adulto. `body` lo muestra de cuerpo entero, con brazos que
 * cambian según el momento (festejar, explicar, pensar, dar ánimo).
 */
export function Nodo({ mood = "neutral", size = 56, bob = true, body = false }: { mood?: Mood; size?: number; bob?: boolean; body?: boolean }) {
  const anim = mood === "celebrate" ? "nodo-jump" : mood === "surprised" ? "nodo-pop" : bob ? "guide-bob" : "";
  if (!body) {
    return (
      <svg width={size} height={size} viewBox="18 4 84 84" className={`mascot shrink-0 ${anim}`} role="img" aria-label="Nodo, tu guía">
        <Head mood={mood} />
      </svg>
    );
  }
  return (
    <svg width={size} height={(size * 140) / 120} viewBox="0 0 120 140" className={`mascot shrink-0 ${anim}`} role="img" aria-label="Nodo, tu guía">
      <ellipse cx="60" cy="135" rx="26" ry="4" fill="currentColor" opacity="0.12" />
      {mood === "explain" && (
        <g>
          <rect x="88" y="40" width="30" height="24" rx="3" fill="var(--board-bg)" stroke="var(--guide-body)" strokeWidth="2" />
          <path d="M93 56 q5 -10 10 -2 t10 -6" stroke="var(--primary)" strokeWidth="2" fill="none" />
        </g>
      )}
      {/* piernas */}
      <rect x="46" y="112" width="9" height="16" rx="4" fill="var(--guide-deep)" />
      <rect x="65" y="112" width="9" height="16" rx="4" fill="var(--guide-deep)" />
      <rect x="42" y="125" width="16" height="7" rx="3.5" fill="var(--guide-deep)" />
      <rect x="62" y="125" width="16" height="7" rx="3.5" fill="var(--guide-deep)" />
      {/* cuerpo */}
      <rect x="36" y="78" width="48" height="38" rx="14" fill="var(--guide-body)" />
      <circle cx="60" cy="96" r="8" fill="none" stroke="var(--guide-face)" strokeWidth="2.5" strokeDasharray="4 2.3" opacity="0.8" />
      <circle cx="60" cy="96" r="3" fill="var(--xp)" />
      <Arms mood={mood} />
      <Head mood={mood} />
    </svg>
  );
}

function Head({ mood }: { mood: Mood }) {
  return (
    <g>
      <line x1="60" y1="10" x2="60" y2="20" stroke="var(--guide-deep)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="60" cy="9" r="5" fill="var(--xp)" className={mood === "thinking" || mood === "celebrate" ? "nodo-bulb" : ""} />
      <polygon points="60,16 92,34 92,70 60,88 28,70 28,34" fill="var(--guide-body)" stroke="var(--guide-deep)" strokeWidth="2" strokeLinejoin="round" />
      <rect x="37" y="34" width="46" height="36" rx="12" fill="var(--guide-screen)" />
      <Face mood={mood} />
      {(mood === "happy" || mood === "celebrate") && (
        <>
          <circle cx="40" cy="60" r="3.5" fill="#fb7185" opacity="0.55" />
          <circle cx="80" cy="60" r="3.5" fill="#fb7185" opacity="0.55" />
        </>
      )}
    </g>
  );
}

/** Nodo con un globo de diálogo corto. */
export function GuideSay({ children, mood = "neutral", size = 48, className = "", body = false }: { children: ReactNode; mood?: Mood; size?: number; className?: string; body?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Nodo mood={mood} size={size} body={body} />
      <div className="speech relative rounded-2xl border-2 border-line bg-surface px-3.5 py-2 text-[0.95rem] font-semibold shadow-sm" role="status">
        {children}
      </div>
    </div>
  );
}
