"use client";
import Link from "next/link";
import { getSubject } from "@/content/curriculum";
import { getLesson } from "@/content/lessons";
import { getTopic } from "@/content/topics";
import { useProgress } from "@/lib/store";
import { subjectProgress, unitProgress } from "@/lib/learning";
import { Gate } from "@/components/layout/Gate";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar, SectionTitle, SUBJECT_COLORS } from "@/components/ui/primitives";
import { OfficialBox } from "@/components/subject/OfficialBox";
import { materialFor } from "@/content/material";

const CYCLE = { preparacion: "Preparación", cbc: "CBC", "segundo-ciclo": "Segundo ciclo" } as const;
const CONTENT = {
  completo: { text: "Lecciones disponibles", cls: "!bg-success-soft !text-success" },
  parcial: { text: "Lecciones parciales", cls: "!bg-warn-soft !text-warn" },
  estructura: { text: "Temario · lecciones en preparación", cls: "" },
} as const;

function Subject({ id }: { id: string }) {
  const s = useProgress();
  const sub = getSubject(id)!;
  const color = SUBJECT_COLORS[sub.color];
  const pct = subjectProgress(s, sub);
  const hasLessons = sub.units.some((u) => u.lessonIds.length);
  return (
    <div>
      <Link href="/materias" className="btn btn-ghost mb-3 !px-2 text-sm">
        <Icon name="arrowLeft" size={18} /> Materias
      </Link>
      <header className="card overflow-hidden">
        <div className="h-2" style={{ background: color }} />
        <div className="flex flex-wrap items-start gap-4 p-5">
          <span className="grid h-14 w-14 place-items-center rounded-2xl text-2xl font-bold text-surface" style={{ background: color }} aria-hidden>
            {sub.icon}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted">{CYCLE[sub.cycle]}</p>
            <h1 className="text-2xl font-black sm:text-3xl">{sub.name}</h1>
            <p className="mt-2 text-muted">{sub.description || "Descripción pendiente de cargar desde el programa oficial."}</p>
            {hasLessons && (
              <div className="mt-4 max-w-sm">
                <div className="mb-1 flex justify-between text-sm">
                  <span>Progreso</span>
                  <span className="font-semibold">{Math.round(pct * 100)}%</span>
                </div>
                <ProgressBar value={pct} color={color} label={`Progreso en ${sub.name}`} />
              </div>
            )}
          </div>
        </div>
      </header>

      {sub.objectives.length > 0 && (
        <>
          <SectionTitle>Objetivos</SectionTitle>
          <ul className="card space-y-2 p-5">
            {sub.objectives.map((o) => (
              <li key={o} className="flex gap-2">
                <span className="text-success" aria-hidden>
                  <Icon name="check" size={18} />
                </span>
                {o}
              </li>
            ))}
          </ul>
        </>
      )}

      {sub.prerequisites.length > 0 && (
        <p className="mt-4 text-sm text-muted">
          Conviene haber pasado por:{" "}
          {sub.prerequisites.map((p, i) => (
            <span key={p}>
              {i > 0 && ", "}
              <Link className="font-semibold text-primary" href={`/materias/${p}`}>
                {getSubject(p)?.name}
              </Link>
            </span>
          ))}
        </p>
      )}

      <SectionTitle>Unidades</SectionTitle>
      {sub.units.length === 0 ? (
        <div className="card p-5 text-muted">El programa de esta materia todavía no se cargó. No se muestran unidades inventadas: se agregan cuando se verifiquen contra la fuente oficial.</div>
      ) : (
        <div className="space-y-3">
          {sub.units.map((u, i) => {
            const up = unitProgress(s, u);
            const c = CONTENT[u.contentStatus];
            return (
              <details key={u.id} className="card group p-0" open={i === 0 && u.lessonIds.length > 0}>
                <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-bold">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{u.title}</span>
                    <span className={`chip mt-1 !text-[10px] ${c.cls}`}>{c.text}</span>
                  </span>
                  {u.lessonIds.length > 0 && (
                    <span className="text-sm text-muted">
                      {up.done}/{up.total}
                    </span>
                  )}
                  <Icon name="arrowRight" size={18} className="transition group-open:rotate-90" />
                </summary>
                <div className="space-y-3 border-t border-line p-4">
                  {u.summary && <p className="text-sm text-muted">{u.summary}</p>}
                  {u.lessonIds.map((lid) => {
                    const l = getLesson(lid);
                    const st = s.lessons[lid]?.status;
                    return (
                      <Link key={lid} href={`/leccion/${lid}`} className="flex items-center gap-3 rounded-xl border border-line p-3 hover:border-primary">
                        <span aria-hidden>{st === "completada" ? "🟢" : st ? "🟡" : "⚪"}</span>
                        <span className="flex-1 font-semibold">{l?.title}</span>
                        <span className="text-xs text-muted">{l?.estimatedMinutes} min</span>
                      </Link>
                    );
                  })}
                  {u.topicIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {u.topicIds.map((t) => (
                        <Link key={t} href={`/practicar?tema=${t}`} className="chip hover:!bg-primary-soft hover:!text-primary">
                          Practicar {getTopic(t)?.name} · {Math.round((s.topics[t]?.mastery ?? 0) * 100)}%
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </details>
            );
          })}
        </div>
      )}

      {hasLessons && (
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/examenes?materia=${sub.id}`} className="btn btn-secondary">
            <Icon name="exam" size={18} /> Exámenes de esta materia
          </Link>
        </div>
      )}

      {sub.bibliography.length > 0 && (
        <>
          <SectionTitle>Bibliografía y material</SectionTitle>
          <ul className="card space-y-1 p-5 text-sm">
            {sub.bibliography.map((b) => (
              <li key={b.label}>{b.url ? <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">{b.label}</a> : b.label}</li>
            ))}
          </ul>
        </>
      )}

      {materialFor(sub.id) && (
        <Link href={`/biblioteca?materia=${sub.id}`} className="card mt-6 flex items-center gap-4 border-accent/40 p-4 hover:border-accent">
          <span className="text-3xl" aria-hidden>
            📚
          </span>
          <span className="flex-1">
            <span className="block font-bold">Tu material de {sub.shortName}</span>
            <span className="text-sm text-muted">{materialFor(sub.id)!.catedra}: qué evalúa cada parcial, errores típicos y simulacros con el formato real.</span>
          </span>
          <Icon name="arrowRight" />
        </Link>
      )}

      <SectionTitle>Fuente</SectionTitle>
      <OfficialBox info={sub.official} />
    </div>
  );
}

export function SubjectView({ id }: { id: string }) {
  return (
    <Gate>
      <Subject id={id} />
    </Gate>
  );
}
