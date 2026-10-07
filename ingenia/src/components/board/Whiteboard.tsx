"use client";
/**
 * Pizarra: muestra un procedimiento renglón por renglón, como si un profesor
 * lo escribiera. Cada renglón nuevo se "escribe" de izquierda a derecha, lo
 * que cambió respecto del anterior queda resaltado y al costado aparece qué
 * operación se hizo y por qué.
 */
import { useEffect, useState } from "react";
import type { BoardStep } from "@/engine/types";
import { MathText } from "../math/MathText";
import { Icon } from "../ui/Icon";
import { BoardFigure } from "./BoardFigure";

/** ¿Es un renglón puramente matemático (sin palabras)? Entonces se muestra con tipografía matemática. */
function isMath(s: string) {
  return !s.includes("$") && !/[a-záéíóúñ]{4,}/i.test(s);
}

/** Separa el renglón en [igual al anterior, distinto, igual al anterior] (prefijo y sufijo comunes). */
export function diffParts(prev: string | undefined, cur: string): [string, string, string] {
  if (!prev) return ["", cur, ""];
  let a = 0;
  while (a < prev.length && a < cur.length && prev[a] === cur[a]) a++;
  let b = 0;
  while (b < prev.length - a && b < cur.length - a && prev[prev.length - 1 - b] === cur[cur.length - 1 - b]) b++;
  // No cortar en medio de un número o una palabra.
  while (a > 0 && /[\w.,]/.test(cur[a - 1]) && /[\w.,]/.test(cur[a] ?? "")) a--;
  while (b > 0 && /[\w.,]/.test(cur[cur.length - b]) && /[\w.,]/.test(cur[cur.length - b - 1] ?? "")) b--;
  return [cur.slice(0, a), cur.slice(a, cur.length - b), cur.slice(cur.length - b)];
}

function Line({ step, prev, fresh, index }: { step: BoardStep; prev?: string; fresh: boolean; index: number }) {
  const math = isMath(step.expr);
  const [same1, changed, same2] = math ? diffParts(prev, step.expr) : ["", step.expr, ""];
  const wrap = (t: string) => (t ? (math ? `$${t}$` : t) : "");
  return (
    <li className={`board-line grid grid-cols-[1.75rem_1fr] items-baseline gap-x-2 ${fresh ? "board-write" : ""}`}>
      <span className="text-xs font-bold text-[color:var(--board-muted)]">{index + 1}</span>
      <div className="min-w-0">
        {step.expr && (
        <span className="board-expr text-xl sm:text-2xl">
          {same1 && <MathText text={wrap(same1)} block={false} />}
          {changed && (
            <mark className={prev && math ? "board-changed" : "bg-transparent text-inherit"}>
              <MathText text={wrap(changed)} block={false} />
            </mark>
          )}
          {same2 && <MathText text={wrap(same2)} block={false} />}
        </span>
        )}
        {step.note && (
          <span className={`board-note mt-1 block text-sm ${fresh ? "board-note-in" : ""}`}>
            ↳ <MathText text={step.note} block={false} />
          </span>
        )}
      </div>
    </li>
  );
}

export function Whiteboard({
  steps,
  title,
  autoPlay = false,
  intervalMs = 1600,
  onDone,
  compact,
}: {
  steps: BoardStep[];
  title?: string;
  autoPlay?: boolean;
  intervalMs?: number;
  onDone?: () => void;
  compact?: boolean;
}) {
  const [shown, setShown] = useState(1);
  const [playing, setPlaying] = useState(autoPlay);
  const done = shown >= steps.length;
  // El dibujo evoluciona con los pasos: se muestra el último y se compara con el anterior.
  const figIdx = steps.slice(0, shown).flatMap((st, i) => (st.figure ? [i] : []));
  const figure = figIdx.length ? steps[figIdx[figIdx.length - 1]].figure : undefined;
  const prevFigure = figIdx.length > 1 ? steps[figIdx[figIdx.length - 2]].figure : undefined;

  useEffect(() => {
    setShown(1);
    setPlaying(autoPlay);
  }, [steps, autoPlay]);

  useEffect(() => {
    if (!playing || done) return;
    const id = setTimeout(() => setShown((n) => n + 1), intervalMs);
    return () => clearTimeout(id);
  }, [playing, shown, done, intervalMs]);

  useEffect(() => {
    if (done) {
      setPlaying(false);
      onDone?.();
    }
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`board rounded-2xl ${compact ? "p-3" : "p-4 sm:p-5"}`} role="group" aria-label={title ?? "Pizarra"}>
      {title && <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[color:var(--board-muted)]">{title}</p>}
      <ol className="space-y-3" aria-live="polite">
        {steps.slice(0, shown).map((st, i) => (
          <Line key={i} step={st} prev={i > 0 ? steps[i - 1].expr : undefined} fresh={i === shown - 1 && i > 0} index={i} />
        ))}
      </ol>
      {figure && <BoardFigure key={figIdx[figIdx.length - 1]} figure={figure} prev={prevFigure} />}
      {steps.length > 1 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {!done ? (
            <>
              <button className="board-btn" onClick={() => setShown((n) => n + 1)} autoFocus={!autoPlay}>
                Siguiente paso <Icon name="arrowRight" size={16} />
              </button>
              <button className="board-btn board-btn-ghost" onClick={() => setPlaying((p) => !p)} aria-pressed={playing}>
                {playing ? "Pausa" : "▶ Reproducir"}
              </button>
              <button className="board-btn board-btn-ghost" onClick={() => setShown(steps.length)}>
                Ver todo
              </button>
            </>
          ) : (
            <button className="board-btn board-btn-ghost" onClick={() => setShown(1)}>
              <Icon name="refresh" size={16} /> Repetir desde el principio
            </button>
          )}
          <span className="ml-auto text-xs text-[color:var(--board-muted)]">
            {shown}/{steps.length}
          </span>
        </div>
      )}
    </div>
  );
}
