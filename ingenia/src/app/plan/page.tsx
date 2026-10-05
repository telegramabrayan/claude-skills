"use client";
import { useState } from "react";
import Link from "next/link";
import { SUBJECTS } from "@/content/curriculum";
import { dayKey, parseDay } from "@/engine/progress/dates";
import { actions, useProgress } from "@/lib/store";
import { buildPlan } from "@/lib/plan";
import { Gate } from "@/components/layout/Gate";
import { GuideSay } from "@/components/guide/Nodo";
import { PageHeader } from "@/components/ui/primitives";

const ICON = { leccion: "📘", repaso: "🔁", simulacro: "📝", practica: "✏️" } as const;
const WEEKDAY = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function Form() {
  const s = useProgress();
  const studyable = SUBJECTS.filter((x) => x.units.some((u) => u.lessonIds.length));
  const [minutes, setMinutes] = useState(s.plan?.minutes ?? s.settings.dailyMinutes);
  const [subjectId, setSubjectId] = useState(s.plan?.subjectId ?? studyable[0]?.id ?? "preparacion");
  const [examDate, setExamDate] = useState(s.plan?.examDate ?? "");
  return (
    <form
      className="card grid gap-4 p-5 sm:grid-cols-3"
      onSubmit={(e) => {
        e.preventDefault();
        actions.setPlan({ minutes, subjectId, examDate: examDate || null });
        actions.updateSettings({ dailyMinutes: minutes });
      }}
    >
      <label className="space-y-1 text-sm font-semibold">
        <span>Minutos por día</span>
        <select className="input" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
          {[10, 15, 20, 30, 45, 60, 90, 120].map((m) => (
            <option key={m} value={m}>
              {m} min
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1 text-sm font-semibold">
        <span>Materia prioritaria</span>
        <select className="input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
          {studyable.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1 text-sm font-semibold">
        <span>Fecha de examen (opcional)</span>
        <input className="input" type="date" value={examDate} min={dayKey()} onChange={(e) => setExamDate(e.target.value)} />
      </label>
      <div className="flex flex-wrap gap-2 sm:col-span-3">
        <button className="btn btn-primary">{s.plan ? "Actualizar plan" : "Armar mi plan"}</button>
        {s.plan && (
          <button type="button" className="btn btn-ghost" onClick={() => actions.setPlan(null)}>
            Borrar plan
          </button>
        )}
      </div>
    </form>
  );
}

function PlanView() {
  const s = useProgress();
  const plan = s.plan;
  const today = dayKey();
  return (
    <div className="space-y-5">
      <PageHeader title="Plan de estudio" subtitle="Decime cuánto tiempo tenés y para cuándo, y reparto las lecciones con repasos y simulacros." />
      <Form />
      {plan &&
        (() => {
          const r = buildPlan(s, plan);
          const subject = SUBJECTS.find((x) => x.id === plan.subjectId);
          return (
            <>
              <GuideSay mood={r.tight ? "thinking" : "happy"}>
                {r.pendingLessons === 0
                  ? `Ya completaste las lecciones cargadas de ${subject?.shortName}. El plan se enfoca en práctica, repaso y simulacros.`
                  : r.tight
                    ? `Te quedan ${r.pendingLessons} lecciones (~${r.pendingMinutes} min) y ${r.daysLeft} días. Con ${plan.minutes} min/día queda justo: si podés, subí el tiempo o priorizá los temas flojos.`
                    : `Te quedan ${r.pendingLessons} lecciones (~${r.pendingMinutes} min)${r.daysLeft !== null ? ` y ${r.daysLeft} días hasta el examen` : ""}. Con ${plan.minutes} min por día llegás bien.`}
              </GuideSay>
              <ol className="space-y-3">
                {r.days.map((d) => {
                  const date = parseDay(d.day);
                  const isToday = d.day === today;
                  return (
                    <li key={d.day} className={`card p-4 ${isToday ? "ring-2 ring-primary" : ""}`}>
                      <p className="mb-2 text-sm font-bold">
                        {isToday ? "Hoy" : WEEKDAY[date.getDay()]} <span className="font-normal text-muted">{date.toLocaleDateString("es-AR", { day: "numeric", month: "short" })}</span>
                      </p>
                      <ul className="space-y-1.5">
                        {d.items.map((it, i) => (
                          <li key={i}>
                            <Link href={it.href} className="flex items-center gap-3 rounded-lg p-1.5 hover:bg-surface-2">
                              <span aria-hidden>{ICON[it.kind]}</span>
                              <span className="flex-1">{it.title}</span>
                              <span className="text-xs text-muted">{it.minutes} min</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                })}
              </ol>
              {r.daysLeft === 0 && <p className="card p-4 text-center font-semibold">¡Hoy es el examen! Repasá el formulario y confiá en lo que practicaste.</p>}
            </>
          );
        })()}
    </div>
  );
}

export default function Page() {
  return (
    <Gate>
      <PlanView />
    </Gate>
  );
}
