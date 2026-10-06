"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MATERIAL, type ExamBlueprint } from "@/content/material";
import { getSubject } from "@/content/curriculum";
import { Gate } from "@/components/layout/Gate";
import { Session } from "@/components/session/Session";
import { PageHeader, SectionTitle, SUBJECT_COLORS } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";

function Library() {
  const params = useSearchParams();
  const only = params.get("materia");
  const [exam, setExam] = useState<{ bp: ExamBlueprint; timed: boolean } | null>(null);

  if (exam) {
    return <Session title={exam.bp.title} items={exam.bp.items} mode="examen" kind="examen" minutes={exam.timed ? exam.bp.minutes : undefined} onExit={() => setExam(null)} />;
  }

  const sets = MATERIAL.filter((m) => !only || m.subjectId === only);
  return (
    <div>
      <PageHeader title="Biblioteca" subtitle="Tu material de estudio, analizado y organizado: qué evalúa cada instancia, qué errores buscan los ejercicios y simulacros con el formato real de cada cátedra." />
      <p className="mb-4 rounded-xl bg-surface-2 p-3 text-sm text-muted">
        Fuente: tu carpeta «Material de estudio» de Google Drive. Los exámenes no se copian acá: Ingenia los usó para saber qué y cómo se evalúa, y genera ejercicios propios del mismo estilo. Tus archivos originales siguen en tu Drive.
      </p>
      {sets.map((m) => {
        const sub = getSubject(m.subjectId);
        const color = sub ? SUBJECT_COLORS[sub.color] : "var(--primary)";
        return (
          <section key={m.subjectId} className="mb-10">
            <div className="flex items-center gap-3 rounded-2xl p-4 text-white" style={{ background: color }}>
              <span className="text-3xl" aria-hidden>
                {sub?.icon}
              </span>
              <div className="min-w-0">
                <h2 className="text-xl font-black">{sub?.name}</h2>
                <p className="text-sm opacity-90">{m.catedra}</p>
              </div>
            </div>
            <p className="mt-3">{m.summary}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {m.files.map((f) => (
                <div key={f.group} className="card flex items-center gap-3 p-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-2 font-black">{f.count}</span>
                  <span className="min-w-0">
                    <span className="block font-semibold">{f.group}</span>
                    <span className="text-sm text-muted">{f.detail}</span>
                  </span>
                </div>
              ))}
            </div>
            <SectionTitle>Qué evalúa cada instancia</SectionTitle>
            <div className="grid gap-3 md:grid-cols-2">
              {m.instances.map((ins) => (
                <div key={ins.name} className="card p-4">
                  <p className="mb-2 font-bold">{ins.name}</p>
                  <ul className="space-y-1 text-sm">
                    {ins.evaluates.map((e) => (
                      <li key={e}>• {e}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {m.notes.length > 0 && (
              <>
                <SectionTitle>Para tener en cuenta</SectionTitle>
                <ul className="card space-y-2 p-4 text-sm">
                  {m.notes.map((n) => (
                    <li key={n}>💡 {n}</li>
                  ))}
                </ul>
              </>
            )}
            <SectionTitle>Simulacros con el formato de la cátedra</SectionTitle>
            <div className="grid gap-3 md:grid-cols-2">
              {m.blueprints.map((bp) => (
                <div key={bp.id} className="card flex flex-col gap-3 p-4">
                  <div>
                    <p className="font-bold">{bp.title}</p>
                    <p className="text-sm text-muted">{bp.note}</p>
                  </div>
                  <ul className="flex flex-wrap gap-1.5 text-xs">
                    {bp.items.map((i, k) => (
                      <li key={k} className="chip">
                        {i.label} · {i.points} pt
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex flex-wrap gap-2">
                    <button className="btn btn-primary !min-h-10" onClick={() => setExam({ bp, timed: true })}>
                      <Icon name="clock" size={16} /> Con tiempo ({bp.minutes} min)
                    </button>
                    <button className="btn btn-secondary !min-h-10" onClick={() => setExam({ bp, timed: false })}>
                      Sin tiempo
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm">
              <Link href={`/materias/${m.subjectId}`} className="font-semibold text-primary">
                Ver las lecciones de {sub?.shortName} →
              </Link>
            </p>
          </section>
        );
      })}
    </div>
  );
}

export default function Page() {
  return (
    <Gate>
      <Suspense>
        <Library />
      </Suspense>
    </Gate>
  );
}
