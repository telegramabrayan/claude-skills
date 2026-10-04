"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import type { ErrorType, Exercise } from "@/engine/types";
import { errorCounts, recurringErrors } from "@/engine/progress/rules";
import { fromId } from "@/engine/generators";
import { ERROR_LABELS, ERROR_REMEDIATION, getTopic } from "@/content/topics";
import { useProgress } from "@/lib/store";
import { Gate } from "@/components/layout/Gate";
import { PageHeader, SectionTitle, Empty } from "@/components/ui/primitives";
import { BarChart } from "@/components/ui/BarChart";
import { ExercisePlayer } from "@/components/exercise/ExercisePlayer";
import { MathText } from "@/components/math/MathText";

function trendText(type: ErrorType, now: number, before: number): string | null {
  if (before === 0) return null;
  const change = Math.round(((now - before) / before) * 100);
  if (change <= -10) return `Los errores de ${ERROR_LABELS[type].toLowerCase()} disminuyeron un ${-change}%.`;
  if (change >= 10) return `Los errores de ${ERROR_LABELS[type].toLowerCase()} aumentaron un ${change}%: conviene reforzarlo.`;
  return null;
}

function Errors() {
  const s = useProgress();
  const [redo, setRedo] = useState<Exercise | null>(null);
  const last30 = errorCounts(s, 30);
  const prev15 = errorCounts(s, 30, 15);
  const last15 = errorCounts(s, 15);
  const entries = (Object.entries(last30) as [ErrorType, number][]).sort((a, b) => b[1] - a[1]);
  const recurring = recurringErrors(s);
  const recent = useMemo(() => s.attempts.filter((a) => !a.correct).slice(-12).reverse(), [s.attempts]);
  const trends = (Object.keys({ ...prev15, ...last15 }) as ErrorType[]).map((t) => trendText(t, last15[t] ?? 0, prev15[t] ?? 0)).filter(Boolean) as string[];

  if (redo) {
    return (
      <div className="mx-auto max-w-3xl">
        <button className="btn btn-ghost mb-3" onClick={() => setRedo(null)}>
          ← Volver a mis errores
        </button>
        <div className="card p-5">
          <ExercisePlayer exercise={redo} mode="repaso" onDone={() => setRedo(null)} continueLabel="Listo" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Mis errores" subtitle="Cada error queda clasificado. No es para castigarte: es el mapa más preciso de qué practicar." />
      {entries.length === 0 ? (
        <Empty title="Sin errores en los últimos 30 días">O todavía no practicaste, o vas perfecto. 😉</Empty>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card p-4">
              <p className="mb-2 font-bold">Errores · últimos 30 días</p>
              <ul className="space-y-1">
                {entries.map(([t, n]) => (
                  <li key={t} className="flex justify-between">
                    <span>{ERROR_LABELS[t]}</span>
                    <strong>{n}</strong>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-4">
              <BarChart label="Errores por tipo" color="var(--warn)" data={entries.slice(0, 6).map(([t, n]) => ({ label: ERROR_LABELS[t].split(" ")[0], value: n }))} />
            </div>
          </div>
          {trends.length > 0 && (
            <div className="card mt-4 space-y-1 p-4">
              <p className="font-bold">Evolución (últimos 15 días vs. los 15 anteriores)</p>
              {trends.map((t) => (
                <p key={t} className="text-sm">
                  {t}
                </p>
              ))}
            </div>
          )}
        </>
      )}

      {recurring.length > 0 && (
        <>
          <SectionTitle>Refuerzo recomendado</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            {recurring.map((e) => {
              const t = ERROR_REMEDIATION[e];
              return (
                <div key={e} className="card p-4">
                  <p className="font-bold">Errores de {ERROR_LABELS[e].toLowerCase()} repetidos</p>
                  <p className="mt-1 text-sm text-muted">Aparecieron varias veces en tus últimos ejercicios. Unos minutos de práctica específica suelen alcanzar.</p>
                  {t && (
                    <Link href={`/practicar?tema=${t}`} className="btn btn-secondary mt-3">
                      Practicar {getTopic(t)?.name}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {recent.length > 0 && (
        <>
          <SectionTitle>Últimos ejercicios con error</SectionTitle>
          <div className="space-y-2">
            {recent.map((a) => {
              const ex = fromId(a.exerciseId);
              return (
                <div key={`${a.ts}-${a.exerciseId}`} className="card flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted">
                      {getTopic(a.topicId)?.name} · {new Date(a.ts).toLocaleDateString("es-AR")} {a.errorType && `· ${ERROR_LABELS[a.errorType]}`}
                    </p>
                    {ex ? <MathText text={ex.prompt} className="line-clamp-2" /> : <p className="text-sm">Ejercicio de lección</p>}
                  </div>
                  {ex && (
                    <button className="btn btn-secondary" onClick={() => setRedo(ex)}>
                      Rehacer
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Gate>
      <Errors />
    </Gate>
  );
}
