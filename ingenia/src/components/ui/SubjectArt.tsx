/**
 * Ilustraciones de cada materia (SVG livianos, sin imágenes externas). Cada
 * escena usa objetos de la materia: así se reconoce qué estás estudiando
 * antes de leer el título.
 */
import type { CSSProperties } from "react";

/** Paleta por materia: [principal, suave, profunda]. Coincide con --c-* de globals.css. */
export const SUBJECT_THEME: Record<string, { key: string; label: string }> = {
  preparacion: { key: "prep", label: "Preparación" },
  "am-a": { key: "math", label: "Análisis" },
  "algebra-a": { key: "algebra", label: "Álgebra" },
  fisica: { key: "physics", label: "Física" },
  "pensamiento-computacional": { key: "code", label: "Programación" },
  ipc: { key: "ipc", label: "Pensamiento científico" },
  icse: { key: "humanities", label: "Sociedad y Estado" },
  quimica: { key: "chem", label: "Química" },
};

export const subjectKey = (id: string) => SUBJECT_THEME[id]?.key ?? "later";

/** Variables CSS para pintar un bloque con los colores de la materia. */
export function subjectStyle(id: string): CSSProperties {
  const k = subjectKey(id);
  return { "--subj": `var(--c-${k})`, "--subj-soft": `var(--c-${k}-soft)`, "--subj-deep": `var(--c-${k}-deep)` } as CSSProperties;
}

const W = "rgba(255,255,255,.92)";
const W2 = "rgba(255,255,255,.55)";
const W3 = "rgba(255,255,255,.28)";

function Scene({ id }: { id: string }) {
  switch (id) {
    case "am-a":
      return (
        <>
          <path d="M8 74 H150 M20 86 V8" stroke={W3} strokeWidth="2" />
          <path className="art-draw" d="M14 70 C40 70 46 18 72 22 S110 72 146 30" stroke={W} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M60 50 L96 14" stroke="#fde68a" strokeWidth="3" strokeLinecap="round" className="art-tangent" />
          <circle cx="76" cy="31" r="5" fill="#fde68a" />
          <text x="118" y="80" fontSize="22" fontWeight="900" fill={W2}>π</text>
          <text x="26" y="24" fontSize="16" fontWeight="900" fill={W2}>∫</text>
        </>
      );
    case "algebra-a":
      return (
        <>
          <path d="M30 20 h-6 v56 h6 M86 20 h6 v56 h-6" stroke={W} strokeWidth="4" fill="none" />
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={34 + c * 18} y={24 + r * 18} width="12" height="12" rx="3" fill={r === c ? "#fde68a" : W2} className={r === c ? "art-blink" : ""} style={{ animationDelay: `${r * 0.4}s` }} />),
          )}
          <path d="M108 66 L138 52 M108 66 L120 30" stroke={W} strokeWidth="4" strokeLinecap="round" />
          <circle cx="108" cy="66" r="4" fill={W} />
          <path d="M120 30 L138 52" stroke={W3} strokeWidth="2" strokeDasharray="4 3" />
        </>
      );
    case "fisica":
      return (
        <>
          <circle cx="118" cy="30" r="16" fill={W2} />
          <ellipse cx="118" cy="30" rx="27" ry="7" fill="none" stroke={W} strokeWidth="2.5" transform="rotate(-18 118 30)" />
          <path d="M10 82 Q60 -6 112 82" stroke={W3} strokeWidth="2.5" strokeDasharray="5 5" fill="none" />
          <g className="art-fly">
            <path d="M0 -9 C7 -4 7 6 0 12 C-7 6 -7 -4 0 -9 Z" fill={W} transform="rotate(35)" />
            <path d="M-6 9 L-11 15 M5 10 L8 16" stroke="#fdba74" strokeWidth="3" strokeLinecap="round" transform="rotate(35)" />
          </g>
          <path d="M20 66 h26" stroke="#fde68a" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M46 66 l-6 -4 v8 z" fill="#fde68a" />
        </>
      );
    case "pensamiento-computacional":
      return (
        <>
          <rect x="14" y="12" width="96" height="62" rx="9" fill="rgba(0,0,0,.22)" stroke={W2} strokeWidth="2" />
          <circle cx="24" cy="21" r="2.5" fill="#fb7185" />
          <circle cx="32" cy="21" r="2.5" fill="#fde68a" />
          <circle cx="40" cy="21" r="2.5" fill="#86efac" />
          <text x="22" y="42" fontSize="11" fontFamily="monospace" fill={W}>for i in range(3):</text>
          <text x="30" y="56" fontSize="11" fontFamily="monospace" fill="#fde68a">print(i)</text>
          <rect x="22" y="61" width="8" height="2.5" fill={W} className="art-blink" />
          <rect x="118" y="36" width="30" height="26" rx="7" fill={W2} />
          <circle cx="128" cy="48" r="3" fill="#0e7490" />
          <circle cx="138" cy="48" r="3" fill="#0e7490" />
          <path d="M133 36 v-8" stroke={W} strokeWidth="2.5" />
          <circle cx="133" cy="26" r="3" fill="#fde68a" className="art-blink" />
        </>
      );
    case "quimica":
      return (
        <>
          <path d="M28 14 h20 M32 14 v22 L16 70 a6 6 0 0 0 5 9 h34 a6 6 0 0 0 5 -9 L44 36 V14" stroke={W} strokeWidth="3.5" fill="none" strokeLinejoin="round" />
          <path d="M22 62 h32 l6 10 a5 5 0 0 1 -4 7 h-36 a5 5 0 0 1 -4 -7 z" fill="#bef264" opacity=".8" />
          <circle cx="34" cy="52" r="3" fill={W} className="art-bubble" />
          <circle cx="42" cy="44" r="2" fill={W} className="art-bubble" style={{ animationDelay: ".7s" }} />
          <g className="art-spin" style={{ transformOrigin: "112px 44px" }}>
            <line x1="112" y1="44" x2="90" y2="26" stroke={W2} strokeWidth="3" />
            <line x1="112" y1="44" x2="136" y2="28" stroke={W2} strokeWidth="3" />
            <circle cx="112" cy="44" r="12" fill="#fb7185" />
            <circle cx="90" cy="26" r="7" fill={W} />
            <circle cx="136" cy="28" r="7" fill={W} />
          </g>
        </>
      );
    case "icse":
      return (
        <>
          <path d="M20 30 L56 12 L92 30 Z" fill={W} />
          {[26, 42, 58, 74].map((x) => (
            <rect key={x} x={x} y="34" width="8" height="34" rx="2" fill={W2} />
          ))}
          <rect x="18" y="68" width="76" height="8" rx="2" fill={W} />
          <path d="M102 50 H150" stroke={W2} strokeWidth="3" />
          {[106, 122, 138].map((x, i) => (
            <circle key={x} cx={x} cy="50" r="5" fill={i === 1 ? "#fde68a" : W} />
          ))}
          <text x="100" y="72" fontSize="10" fontWeight="800" fill={W2}>1853 · 1912 · 1983</text>
        </>
      );
    case "ipc":
      return (
        <>
          <circle cx="58" cy="40" r="22" fill="none" stroke={W} strokeWidth="5" />
          <path d="M74 56 L98 80" stroke={W} strokeWidth="8" strokeLinecap="round" />
          <text x="44" y="48" fontSize="22" fontWeight="900" fill="#fde68a">∴</text>
          <text x="108" y="34" fontSize="13" fontWeight="800" fill={W2}>p → q</text>
          <text x="112" y="56" fontSize="13" fontWeight="800" fill={W2}>¬q</text>
          <path d="M108 62 h34" stroke={W2} strokeWidth="2" />
          <text x="112" y="78" fontSize="13" fontWeight="800" fill={W}>¬p</text>
        </>
      );
    case "preparacion":
      return (
        <>
          <rect x="20" y="14" width="62" height="66" rx="5" fill={W} transform="rotate(-6 50 46)" />
          {[30, 40, 50, 60].map((y) => (
            <path key={y} d={`M28 ${y + 4} h46`} stroke="rgba(15,118,110,.35)" strokeWidth="1.5" transform="rotate(-6 50 46)" />
          ))}
          <text x="30" y="44" fontSize="14" fontWeight="900" fill="#0f766e" transform="rotate(-6 50 46)">2x+3=7</text>
          <g className="art-write">
            <rect x="92" y="20" width="9" height="52" rx="2" fill="#fde68a" transform="rotate(28 96 46)" />
            <path d="M110 66 l-6 12 -2 -13 z" fill="#fca5a5" />
          </g>
          <path d="M112 20 h34 l-34 30 z" fill="none" stroke={W2} strokeWidth="3" strokeLinejoin="round" />
        </>
      );
    default:
      return (
        <>
          <circle cx="78" cy="44" r="22" fill={W2} />
          <text x="66" y="54" fontSize="28" fill={W}>🎓</text>
        </>
      );
  }
}

/** Escena ilustrada de la materia (fondo con su color y objetos animados suaves). */
export function SubjectArt({ id, className = "", height = 96 }: { id: string; className?: string; height?: number }) {
  return (
    <svg viewBox="0 0 160 92" height={height} className={`subject-art ${className}`} role="img" aria-label={`Ilustración de ${SUBJECT_THEME[id]?.label ?? "la materia"}`} preserveAspectRatio="xMidYMid meet">
      <Scene id={id} />
    </svg>
  );
}
