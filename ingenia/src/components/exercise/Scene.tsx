"use client";
/**
 * Escenas cortas que acompañan algunos ejercicios: la respuesta correcta
 * "hace algo" (la puerta se abre, el cohete despega, la máquina arranca).
 * Duran menos de 1,5 s y no tapan el contenido. En modo estudio no se muestran.
 */
import type { SceneKind } from "@/engine/types";

export function Scene({ kind, state, caption }: { kind: SceneKind; state: "idle" | "win" | "try"; caption?: string }) {
  return (
    <figure className={`scene game-only scene-${state}`} aria-hidden>
      <svg viewBox="0 0 320 120" className="h-28 w-full sm:h-32">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--subj-soft)" />
            <stop offset="1" stopColor="var(--surface)" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="320" height="120" rx="18" fill="url(#sky)" />
        {kind === "door" && <Door />}
        {kind === "rocket" && <Rocket />}
        {kind === "factory" && <Factory />}
        {kind === "bridge" && <Bridge />}
        {kind === "lab" && <Lab />}
      </svg>
      {caption && <figcaption className="sr-only">{caption}</figcaption>}
    </figure>
  );
}

function Door() {
  return (
    <g>
      <rect x="110" y="14" width="100" height="100" rx="10" fill="var(--subj-deep)" />
      <rect x="120" y="22" width="80" height="92" rx="4" fill="#fde68a" className="scene-light" />
      <g className="door-left">
        <rect x="120" y="22" width="40" height="92" fill="var(--subj)" stroke="var(--subj-deep)" strokeWidth="2" />
        <circle cx="153" cy="70" r="3" fill="#fde68a" />
      </g>
      <g className="door-right">
        <rect x="160" y="22" width="40" height="92" fill="var(--subj)" stroke="var(--subj-deep)" strokeWidth="2" />
        <circle cx="167" cy="70" r="3" fill="#fde68a" />
      </g>
      <g className="door-lock">
        <rect x="150" y="56" width="20" height="16" rx="3" fill="#475569" />
        <path d="M154 56 v-6 a6 6 0 0 1 12 0 v6" stroke="#475569" strokeWidth="3" fill="none" />
        <text x="160" y="68" fontSize="9" textAnchor="middle" fill="#fff" fontWeight="900">x</text>
      </g>
      <rect x="0" y="112" width="320" height="8" fill="var(--border)" />
    </g>
  );
}

function Rocket() {
  return (
    <g>
      {[30, 80, 260, 290, 210].map((x, i) => (
        <circle key={x} cx={x} cy={20 + (i * 17) % 50} r="1.8" fill="var(--subj)" opacity=".6" />
      ))}
      <rect x="0" y="108" width="320" height="12" fill="var(--border)" />
      <rect x="140" y="98" width="40" height="10" rx="2" fill="#94a3b8" />
      <g className="rocket">
        <path d="M160 26 C176 40 176 74 170 92 H150 C144 74 144 40 160 26 Z" fill="#f8fafc" stroke="var(--subj-deep)" strokeWidth="2.5" />
        <circle cx="160" cy="56" r="7" fill="var(--subj)" stroke="var(--subj-deep)" strokeWidth="2" />
        <path d="M150 78 L138 96 H150 Z M170 78 L182 96 H170 Z" fill="var(--subj)" />
        <path d="M153 94 Q160 116 167 94 Z" fill="#fb923c" className="flame" />
      </g>
    </g>
  );
}

function Factory() {
  return (
    <g>
      <rect x="20" y="40" width="90" height="70" fill="var(--subj)" opacity=".85" />
      <path d="M20 40 l22 -16 v16 l22 -16 v16 l22 -16 v16 h24" fill="var(--subj)" opacity=".85" />
      <rect x="92" y="8" width="12" height="36" fill="var(--subj-deep)" />
      <g className="gear" style={{ transformOrigin: "66px 78px" }}>
        <circle cx="66" cy="78" r="16" fill="none" stroke="#fff" strokeWidth="6" strokeDasharray="6 4" />
        <circle cx="66" cy="78" r="5" fill="#fff" />
      </g>
      <rect x="110" y="96" width="200" height="8" rx="4" fill="#64748b" />
      {[130, 170, 210, 250, 290].map((x) => (
        <circle key={x} cx={x} cy="100" r="3" fill="#cbd5e1" />
      ))}
      <g className="crate">
        <rect x="120" y="74" width="24" height="22" rx="3" fill="#d97706" stroke="#92400e" strokeWidth="2" />
        <path d="M120 85 h24" stroke="#92400e" strokeWidth="2" />
      </g>
      <rect x="0" y="110" width="320" height="10" fill="var(--border)" />
    </g>
  );
}

function Bridge() {
  return (
    <g>
      <rect x="0" y="70" width="110" height="50" fill="var(--subj)" opacity=".7" />
      <rect x="210" y="70" width="110" height="50" fill="var(--subj)" opacity=".7" />
      <path d="M110 120 Q160 96 210 120" fill="#7dd3fc" opacity=".6" />
      <rect x="110" y="66" width="100" height="8" rx="2" fill="#a16207" className="plank" />
      <g className="car">
        <rect x="20" y="50" width="40" height="16" rx="5" fill="var(--subj-deep)" />
        <rect x="28" y="42" width="22" height="12" rx="4" fill="var(--subj-deep)" />
        <circle cx="30" cy="68" r="5" fill="#1e293b" />
        <circle cx="52" cy="68" r="5" fill="#1e293b" />
      </g>
    </g>
  );
}

function Lab() {
  return (
    <g>
      <rect x="0" y="104" width="320" height="16" fill="var(--border)" />
      <path d="M150 20 h20 M154 20 v26 L132 96 a6 6 0 0 0 5 8 h46 a6 6 0 0 0 5 -8 L166 46 V20" fill="#f8fafc" stroke="var(--subj-deep)" strokeWidth="3" />
      <path d="M140 80 h40 l6 14 a5 5 0 0 1 -4 8 h-44 a5 5 0 0 1 -4 -8 z" className="liquid" fill="var(--warn)" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={152 + i * 8} cy={84} r="3" fill="#fff" className="bubble" style={{ animationDelay: `${i * 0.3}s` }} />
      ))}
    </g>
  );
}
