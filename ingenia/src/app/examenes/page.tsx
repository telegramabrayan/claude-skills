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
  minutes: number;
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

      <SectionTitle>Simulacros de parcial</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        {subjects.map((sub) => {
          const topics = subjectTopics(sub);
          return (
            <button
              key={sub.id}
              className="card flex items-center gap-4 p-4 text-left hover:border-primary"
              onClick={() => setExam({ title: `Simulacro · ${sub.shortName}`, items: spread(topics, 10, [4, 5, 4, 3, 5]), minutes: 40 })}
            >
              <span className="text-2xl" aria-hidden>
                {sub.icon}
              </span>
              <span className="flex-1">
                <span className="block font-bold">{sub.name}</span>
                <span className="text-sm text-muted">10 ejercicios · nivel parcial · 40 min</span>
              </span>
              <Icon name="play" size={18} className="text-primary" />
            </button>
          );
        })}
      </div>

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
