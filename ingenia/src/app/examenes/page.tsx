"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Difficulty, Subject } from "@/engine/types";
import { fmt } from "@/engine/math/parser";
import { SUBJECTS } from "@/content/curriculum";
import { getTopic, TOPICS } from "@/content/topics";
import { useProgress } from "@/lib/store";
import { Gate } from "@/components/layout/Gate";
import { Session, type SessionItem } from "@/components/session/Session";
import { PageHeader, SectionTitle, Empty } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";

interface ExamSpec {
  title: string;
  items: SessionItem[];
  minutes?: number;
}

type ExamKind = "p1" | "p2" | "final";
const KIND: Record<ExamKind, { label: string; n: number; minutes: number }> = {
  p1: { label: "1.er parcial", n: 10, minutes: 60 },
  p2: { label: "2.º parcial", n: 10, minutes: 60 },
  final: { label: "Final", n: 14, minutes: 90 },
};

/** Temas que entran: 1.er parcial = primera mitad de las unidades con ejercicios; 2.º = segunda mitad; final = todo. */
function examTopics(sub: Subject, kind: ExamKind): string[] {
  const units = sub.units.filter((u) => u.topicIds.length);
  const half = Math.ceil(units.length / 2);
  const chosen = kind === "p1" ? units.slice(0, half) : kind === "p2" ? units.slice(half) : units;
  const topics = [...new Set((chosen.length ? chosen : units).flatMap((u) => u.topicIds))];
  return topics.filter((t) => getTopic(t)?.generators.length);
}

function Simulator({ subjects, onStart }: { subjects: Subject[]; onStart: (e: ExamSpec) => void }) {
  const s = useProgress();
  const [subjectId, setSubjectId] = useState(s.plan?.subjectId && subjects.some((x) => x.id === s.plan?.subjectId) ? s.plan.subjectId : subjects[0]?.id);
  const [kind, setKind] = useState<ExamKind>("p1");
  const [timed, setTimed] = useState(true);
  const sub = subjects.find((x) => x.id === subjectId);
  if (!sub) return null;
  const topics = examTopics(sub, kind);
  const units = sub.units.filter((u) => u.topicIds.length);
  const half = Math.ceil(units.length / 2);
  const included = kind === "p1" ? units.slice(0, half) : kind === "p2" ? units.slice(half) : units;
  const k = KIND[kind];
  return (
    <div className="card space-y-4 p-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="space-y-1 text-sm font-semibold">
          <span>Materia</span>
          <select className="input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            {subjects.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </label>
        <div className="space-y-1 text-sm font-semibold">
          <span>Tipo</span>
          <div className="grid grid-cols-3 gap-1" role="radiogroup" aria-label="Tipo de examen">
            {(Object.keys(KIND) as ExamKind[]).map((x) => (
              <button key={x} type="button" role="radio" aria-checked={kind === x} className={`btn !min-h-10 !px-2 text-xs ${kind === x ? "btn-primary" : "btn-secondary"}`} onClick={() => setKind(x)}>
                {KIND[x].label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1 text-sm font-semibold">
          <span>Tiempo</span>
          <div className="grid grid-cols-2 gap-1" role="radiogroup" aria-label="Con o sin tiempo">
            <button type="button" role="radio" aria-checked={timed} className={`btn !min-h-10 text-xs ${timed ? "btn-primary" : "btn-secondary"}`} onClick={() => setTimed(true)}>
              {k.minutes} min
            </button>
            <button type="button" role="radio" aria-checked={!timed} className={`btn !min-h-10 text-xs ${!timed ? "btn-primary" : "btn-secondary"}`} onClick={() => setTimed(false)}>
              Sin tiempo
            </button>
          </div>
        </div>
      </div>
      <p className="text-sm text-muted">
        Entran: {included.map((u) => u.title).join(" · ") || "las unidades con ejercicios"}. {k.n} ejercicios de nivel parcial.
        {kind !== "final" && " La división en 1.er y 2.º parcial es orientativa: cada cátedra define qué entra en cada uno."}
      </p>
      <button
        className="btn btn-primary w-full sm:w-auto"
        disabled={!topics.length}
        onClick={() => onStart({ title: `${k.label} · ${sub.shortName}`, items: spread(topics, k.n, [4, 5, 4, 3, 5, 6]), minutes: timed ? k.minutes : undefined })}
      >
        Empezar simulacro <Icon name="play" size={18} />
      </button>
    </div>
  );
}

function spread(topicIds: string[], n: number, difficulties: Difficulty[]): SessionItem[] {
  return Array.from({ length: n }, (_, i) => ({ topicId: topicIds[i % topicIds.length], difficulty: difficulties[i % difficulties.length] }));
}

function subjectTopics(sub: Subject): string[] {
  return [...new Set(sub.units.flatMap((u) => u.topicIds))];
}

function Exams() {
  const params = useSearchParams();
  const s = useProgress();
  const [exam, setExam] = useState<ExamSpec | null>(null);
  const filter = params.get("materia");
  const subjects = SUBJECTS.filter((sub) => subjectTopics(sub).length > 0 && (!filter || sub.id === filter));

  if (exam) return <Session title={exam.title} items={exam.items} mode="examen" kind="examen" minutes={exam.minutes} onExit={() => setExam(null)} />;

  return (
    <div>
      <PageHeader title="Exámenes" subtitle="Sin pistas ni corrección hasta el final, con tiempo. Al terminar ves tu nota, tus errores, temas fuertes y débiles, y un plan." />
      <p className="mb-2 rounded-xl bg-surface-2 p-3 text-sm text-muted">
        Los simulacros usan ejercicios generados por Ingenia en el estilo de los temas del programa. No reproducen parciales oficiales de la UBA: ese material solo se incorporará si su uso está permitido.
      </p>

      <SectionTitle>Simulador de parcial</SectionTitle>
      <Simulator subjects={subjects} onStart={setExam} />

      <SectionTitle>Exámenes por unidad</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        {subjects.flatMap((sub) =>
          sub.units
            .filter((u) => u.topicIds.length)
            .map((u) => (
              <button key={`${sub.id}-${u.id}`} className="card p-4 text-left hover:border-primary" onClick={() => setExam({ title: `Examen · ${u.title}`, items: spread(u.topicIds, 8, [3, 4, 3, 4]), minutes: 25 })}>
                <span className="block text-xs text-muted">{sub.shortName}</span>
                <span className="block font-bold">{u.title}</span>
                <span className="text-sm text-muted">8 ejercicios · 25 min</span>
              </button>
            )),
        )}
      </div>

      <SectionTitle>Mini tests</SectionTitle>
      <div className="flex flex-wrap gap-2">
        {TOPICS.filter((t) => !filter || subjects.some((sub) => subjectTopics(sub).includes(t.id))).map((t) => (
          <button key={t.id} className="chip !min-h-9 !text-sm hover:!bg-primary-soft hover:!text-primary" onClick={() => setExam({ title: `Mini test · ${t.name}`, items: spread([t.id], 5, [2, 3, 3, 4, 4]), minutes: 10 })}>
            {t.name}
          </button>
        ))}
      </div>

      <SectionTitle>Historial</SectionTitle>
      {s.exams.length === 0 ? (
        <Empty title="Todavía no hiciste exámenes">Empezá con un mini test: 5 ejercicios, 10 minutos.</Empty>
      ) : (
        <div className="card divide-y divide-line">
          {[...s.exams].reverse().slice(0, 20).map((e) => (
            <div key={e.id} className="flex flex-wrap items-center gap-3 p-4">
              <span className="w-14 text-2xl font-black" style={{ color: e.score >= 4 ? "var(--success)" : "var(--danger)" }}>
                {fmt(e.score, 1)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{e.title}</span>
                <span className="text-xs text-muted">
                  {new Date(e.ts).toLocaleDateString("es-AR")} · {e.correct}/{e.total} · {Math.round(e.seconds / 60)} min
                </span>
              </span>
              <span className="text-xs text-muted">
                {Object.entries(e.byTopic)
                  .filter(([, v]) => v.correct / v.total < 0.6)
                  .map(([t]) => getTopic(t)?.name)
                  .join(", ") || "Sin temas débiles"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Gate>
      <Suspense>
        <Exams />
      </Suspense>
    </Gate>
  );
}
