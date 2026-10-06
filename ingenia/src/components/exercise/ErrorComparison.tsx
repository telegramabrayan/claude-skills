"use client";
/** Convierte el error en una explicación: lo que hiciste, el problema y cómo sigue correctamente. */
import type { EvaluationResult } from "@/engine/types";
import { MathText } from "../math/MathText";
import { Whiteboard } from "../board/Whiteboard";

export function ErrorComparison({
  comparison,
  step,
  problem,
  onSimilar,
  onRetry,
}: {
  comparison: NonNullable<EvaluationResult["comparison"]>;
  step?: number;
  problem?: string;
  onSimilar?: () => void;
  onRetry: () => void;
}) {
  const where =
    step === undefined
      ? "Tus pasos están bien; el problema aparece al final, al despejar."
      : step === 0
        ? "Tu planteo inicial está bien, pero el error aparece en el primer paso."
        : `Tus primeros ${step} ${step === 1 ? "paso está bien" : "pasos están bien"}; el error aparece en el paso ${step + 1}.`;
  return (
    <div className="mt-4 space-y-3 rounded-xl border border-line bg-surface p-4">
      <p className="font-semibold">{where}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-danger">Lo que hiciste</p>
          <div className="space-y-1 rounded-lg bg-danger-soft p-3 text-lg">
            <MathText text={`$${comparison.previous}$`} />
            <p className="flex items-center gap-2">
              <MathText text={`$${comparison.yours}$`} block={false} /> <span aria-label="paso con error">✗</span>
            </p>
          </div>
        </div>
        {problem && (
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-warn">Problema</p>
            <div className="rounded-lg bg-warn-soft p-3 text-sm">
              <MathText text={problem} />
            </div>
          </div>
        )}
      </div>
      {comparison.correct.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-success">Correcto</p>
          <Whiteboard steps={[{ expr: comparison.previous }, ...comparison.correct]} autoPlay compact />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <p className="mr-2 font-semibold">¿Querés intentar otro parecido?</p>
        {onSimilar && (
          <button className="btn btn-primary !min-h-10" onClick={onSimilar}>
            Sí, otro parecido
          </button>
        )}
        <button className="btn btn-secondary !min-h-10" onClick={onRetry}>
          Corregir este
        </button>
      </div>
    </div>
  );
}
