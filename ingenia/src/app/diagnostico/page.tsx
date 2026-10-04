"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import type { SkillId } from "@/engine/types";
import { generate } from "@/engine/generators";
import { DIAGNOSTIC } from "@/content/diagnostic";
import { SKILL_LABELS } from "@/content/topics";
import { getLesson } from "@/content/lessons";
import { actions, useProgress } from "@/lib/store";
import { diagnosticSkillScore, DIAGNOSTIC_TOTAL_WEIGHT } from "@/lib/learning";
import { Gate } from "@/components/layout/Gate";
import { ExercisePlayer } from "@/components/exercise/ExercisePlayer";
import { ProgressBar } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";

type Results = Partial<Record<SkillId, { weight: number; correct: boolean }[]>>;

function band(p: number): { label: string; color: string } {
  if (p >= 0.8) return { label: "Fuerte", color: "var(--success)" };
  if (p >= 0.5) return { label: "En camino", color: "var(--primary)" };
  if (p >= 0.2) return { label: "A reforzar", color: "var(--warn)" };
  return { label: "Desde cero", color: "var(--danger)" };
}

function Diagnostic() {
  const s = useProgress();
  const [started, setStarted] = useState(false);
  const [skillIdx, setSkillIdx] = useState(0);
  const [itemIdx, setItemIdx] = useState(0);
  const [results, setResults] = useState<Results>({});
  const [finished, setFinished] = useState(false);
  const [answered, setAnswered] = useState(false);

  const section = DIAGNOSTIC[skillIdx];
  const item = section?.items[itemIdx];
  const exercise = useMemo(() => (item ? generate(item.generator, item.difficulty, item.seed) : null), [item]);
  const totalItems = DIAGNOSTIC.reduce((a, d) => a + d.items.length, 0);
  const doneItems = DIAGNOSTIC.slice(0, skillIdx).reduce((a, d) => a + d.items.length, 0) + itemIdx;

  const scores = useMemo(() => {
    const out: Partial<Record<SkillId, number>> = {};
    for (const d of DIAGNOSTIC) out[d.skill] = diagnosticSkillScore(results[d.skill] ?? [], DIAGNOSTIC_TOTAL_WEIGHT[d.skill]);
    return out;
  }, [results]);

  const advance = (correct: boolean) => {
    const next: Results = { ...results, [section.skill]: [...(results[section.skill] ?? []), { weight: item.weight, correct }] };
    setResults(next);
    setAnswered(false);
    // Si falla, no mostramos los ítems más difíciles de esta habilidad.
    if (correct && itemIdx + 1 < section.items.length) {
      setItemIdx(itemIdx + 1);
      return;
    }
    if (skillIdx + 1 < DIAGNOSTIC.length) {
      setSkillIdx(skillIdx + 1);
      setItemIdx(0);
      return;
    }
    const final: Partial<Record<SkillId, number>> = {};
    for (const d of DIAGNOSTIC) final[d.skill] = diagnosticSkillScore(next[d.skill] ?? [], DIAGNOSTIC_TOTAL_WEIGHT[d.skill]);
    actions.saveDiagnostic(final);
    setFinished(true);
  };

  if (finished || (!started && s.diagnostic)) {
    const sk = finished ? scores : s.diagnostic!.skills;
    const route = s.route.slice(0, 6);
    return (
      <div className="anim-pop mx-auto max-w-2xl space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Resultado del diagnóstico</p>
          <h1 className="text-3xl font-black">Tu punto de partida</h1>
          <p className="mt-2 text-muted">Cada habilidad se mide por separado. No es una nota: es un mapa de por dónde conviene empezar.</p>
        </div>
        <div className="card space-y-4 p-5">
          {DIAGNOSTIC.map((d) => {
            const p = sk[d.skill] ?? 0;
            const b = band(p);
            return (
              <div key={d.skill}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-semibold">{SKILL_LABELS[d.skill]}</span>
                  <span>
                    <span className="mr-2 font-bold">{Math.round(p * 100)}%</span>
                    <span className="chip" style={{ color: b.color }}>
                      {b.label}
                    </span>
                  </span>
                </div>
                <ProgressBar value={p} color={b.color} label={SKILL_LABELS[d.skill]} />
              </div>
            );
          })}
        </div>
        <div className="card p-5">
          <h2 className="font-bold">Tu ruta personalizada</h2>
          <p className="mt-1 text-sm text-muted">Las habilidades donde te fue muy bien quedan desbloqueadas y salen de la ruta (siempre podés entrar igual). Empezamos por acá:</p>
          <ol className="mt-3 space-y-2">
            {route.map((id, i) => (
              <li key={id} className="flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-primary-soft text-sm font-bold text-primary">{i + 1}</span>
                {getLesson(id)?.title}
              </li>
            ))}
          </ol>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={route[0] ? `/leccion/${route[0]}` : "/"} className="btn btn-primary">
              Empezar mi ruta <Icon name="arrowRight" />
            </Link>
            <Link href="/mapa" className="btn btn-secondary">
              Ver el mapa
            </Link>
          </div>
        </div>
        {!finished && (
          <button className="btn btn-ghost" onClick={() => { setStarted(true); setResults({}); setSkillIdx(0); setItemIdx(0); }}>
            Repetir el diagnóstico
          </button>
        )}
      </div>
    );
  }

  if (!started) {
    return (
      <div className="anim-pop mx-auto max-w-2xl space-y-6">
        <h1 className="text-3xl font-black">Descubramos desde dónde empezar</h1>
        <p className="text-lg">Te voy a mostrar algunas preguntas cortas de 8 áreas: cuentas, álgebra, funciones, gráficos, vectores, física, lógica y pensamiento computacional.</p>
        <ul className="space-y-2 text-muted">
          <li>• No hay nota ni tiempo límite.</li>
          <li>• Si no sabés algo, tocá <strong>«No sé»</strong>: es información útil, no un error.</li>
          <li>• Si una pregunta te cuesta, salteamos las más difíciles de esa área.</li>
          <li>• Podés usar papel y lápiz (y calculadora).</li>
        </ul>
        <button className="btn btn-primary text-lg" onClick={() => setStarted(true)}>
          Empezar <Icon name="arrowRight" />
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <div className="mb-1 flex justify-between text-sm">
          <span className="font-semibold">
            {SKILL_LABELS[section.skill]} · área {skillIdx + 1} de {DIAGNOSTIC.length}
          </span>
          <span className="text-muted">≈ {Math.round((doneItems / totalItems) * 100)}%</span>
        </div>
        <ProgressBar value={doneItems / totalItems} label="Avance del diagnóstico" />
      </div>
      {itemIdx === 0 && <p className="text-muted">{section.intro}</p>}
      <div className="card p-5 sm:p-6">
        {exercise && (
          <ExercisePlayer
            key={exercise.id}
            exercise={exercise}
            mode="diagnostico"
            diagnostic
            onDone={(o) => {
              if (answered) return;
              setAnswered(true);
              setTimeout(() => advance(o.correct), 250);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Gate>
      <Diagnostic />
    </Gate>
  );
}
