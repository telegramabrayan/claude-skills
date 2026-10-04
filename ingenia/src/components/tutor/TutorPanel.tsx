"use client";
import { useState } from "react";
import type { TutorScript } from "@/engine/types";
import { MathText } from "../math/MathText";
import { Widget } from "../widgets/Widget";
import { Icon } from "../ui/Icon";

export type TutorMode = "normal" | "simple" | "nino" | "ejemplo" | "visual" | "pista" | "pasos" | "yo";

const MODES: { id: TutorMode; label: string }[] = [
  { id: "normal", label: "Explicámelo normalmente" },
  { id: "simple", label: "Explicámelo más fácil" },
  { id: "nino", label: "Como si tuviera 12 años" },
  { id: "ejemplo", label: "Dame un ejemplo" },
  { id: "visual", label: "Mostrame gráficamente" },
  { id: "pista", label: "Dame una pista" },
  { id: "pasos", label: "Resolvelo paso a paso" },
  { id: "yo", label: "Dejame intentarlo yo" },
];

interface Props {
  script?: TutorScript;
  topicName?: string;
  /** Para ejercicios: el profesor comparte las pistas y la solución con el ejercicio. */
  onHint?: () => string | null;
  onSolve?: () => void;
  onClose?: () => void;
  hasExercise?: boolean;
}

/**
 * El profesor: explica el concepto de varias maneras. Las respuestas salen
 * del contenido curado de cada lección (no inventa); la interfaz está
 * preparada para sumar un proveedor conversacional (ver lib/tutor.ts).
 */
export function TutorPanel({ script, topicName, onHint, onSolve, onClose, hasExercise }: Props) {
  const [mode, setMode] = useState<TutorMode | null>(null);
  const [hintText, setHintText] = useState<string | null>(null);

  const choose = (m: TutorMode) => {
    if (m === "yo") {
      onClose?.();
      return;
    }
    if (m === "pista" && onHint) setHintText(onHint());
    if (m === "pasos") onSolve?.();
    setMode(m);
  };

  const modes = MODES.filter((m) => hasExercise || !["pista", "pasos", "yo"].includes(m.id));

  let body: React.ReactNode = null;
  if (mode && script) {
    if (mode === "visual") {
      body = script.visual ? (
        <div className="space-y-3">
          {script.visualText && <p className="text-sm text-muted">{script.visualText}</p>}
          <Widget widget={script.visual} />
        </div>
      ) : (
        <MathText text={script.ejemplo} />
      );
    } else if (mode === "pista") {
      body = <MathText text={hintText ?? "Ya viste todas las pistas. Si querés, pedime que lo resuelva paso a paso."} />;
    } else if (mode === "pasos") {
      body = <p>Te muestro la solución de a un paso, debajo del ejercicio. Intentá adivinar cada paso antes de verlo.</p>;
    } else {
      body = <MathText text={script[mode as "normal" | "simple" | "nino" | "ejemplo"]} />;
    }
  } else if (mode && !script) {
    body = <p className="text-muted">Para este tema todavía no hay explicaciones alternativas cargadas.</p>;
  }

  return (
    <div className="anim-pop rounded-2xl border border-accent/40 bg-accent-soft/40 p-4" role="region" aria-label="Profesor">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-sm text-surface" aria-hidden>
            Δ
          </span>
          Profesor {topicName && <span className="font-normal text-muted">· {topicName}</span>}
        </div>
        {onClose && (
          <button className="btn btn-ghost !min-h-9 !px-2" onClick={onClose} aria-label="Cerrar profesor">
            <Icon name="x" size={18} />
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {modes.map((m) => (
          <button key={m.id} onClick={() => choose(m.id)} className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${mode === m.id ? "border-accent bg-accent text-surface" : "border-line bg-surface hover:border-accent"}`}>
            {m.label}
          </button>
        ))}
      </div>
      {body && <div className="mt-4 rounded-xl bg-surface p-4">{body}</div>}
    </div>
  );
}
