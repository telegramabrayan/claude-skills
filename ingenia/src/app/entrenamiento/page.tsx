"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getLesson } from "@/content/lessons";
import { getTopic } from "@/content/topics";
import { store, useProgress } from "@/lib/store";
import { activeTopics, dailyPlan, dueTopics, recommendations, type QueueItem } from "@/lib/learning";
import type { SessionItem } from "@/components/session/Session";
import { Gate } from "@/components/layout/Gate";
import { Session } from "@/components/session/Session";
import { PageHeader } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";

function Training() {
  const s = useProgress();
  const [plan] = useState<QueueItem[]>(() => dailyPlan(store.getState()));
  const [running, setRunning] = useState(false);
  const [exercisesDone, setExercisesDone] = useState(false);
  const exercises = plan.filter((p): p is Extract<QueueItem, { type: "exercise" }> => p.type === "exercise");
  const lesson = plan.find((p): p is Extract<QueueItem, { type: "lesson" }> => p.type === "lesson");
  const lessonDone = lesson ? s.lessons[lesson.lessonId]?.status === "completada" : true;

  if (running) {
    return (
      <Session
        title="Tu entrenamiento de hoy"
        items={exercises.map((e) => ({ topicId: e.topicId, adjust: e.adjust, label: e.label }))}
        mode="entrenamiento"
        onExit={() => {
          setRunning(false);
          setExercisesDone(true);
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Tu entrenamiento de hoy" subtitle="10 a 20 minutos, armados con lo que te toca repasar, tu próxima lección y tus temas flojos." />
      <ol className="space-y-3">
        {lesson && (
          <li className="card flex items-center gap-4 p-4">
            <span className="text-2xl" aria-hidden>
              {lessonDone ? "✅" : "📘"}
            </span>
            <span className="flex-1">
              <span className="block text-xs font-semibold uppercase text-muted">{lesson.label}</span>
              <span className="block font-bold">{getLesson(lesson.lessonId)?.title}</span>
            </span>
            {!lessonDone && (
              <Link href={`/leccion/${lesson.lessonId}`} className="btn btn-secondary">
                Abrir
              </Link>
            )}
          </li>
        )}
        <li className="card p-4">
          <div className="flex items-center gap-4">
            <span className="text-2xl" aria-hidden>
              {exercisesDone ? "✅" : "✏️"}
            </span>
            <span className="flex-1">
              <span className="block text-xs font-semibold uppercase text-muted">Ejercicios</span>
              <span className="block font-bold">{exercises.length} ejercicios adaptados</span>
            </span>
          </div>
          <ul className="mt-3 space-y-1 pl-12 text-sm text-muted">
            {exercises.map((e, i) => (
              <li key={i}>
                {e.label === "Repaso" ? "🔁" : e.label === "Desafío" ? "⚔️" : "•"} {e.label}: {getTopic(e.topicId)?.name}
              </li>
            ))}
          </ul>
          <button className="btn btn-primary mt-4 w-full" onClick={() => setRunning(true)}>
            {exercisesDone ? "Hacer otra ronda" : "Empezar ejercicios"} <Icon name="arrowRight" />
          </button>
        </li>
      </ol>
      {exercisesDone && lessonDone && <p className="anim-pop mt-5 rounded-xl bg-success-soft p-4 text-center font-semibold">Entrenamiento de hoy completo. Mañana el plan se arma de nuevo con lo que toque repasar.</p>}
    </div>
  );
}

const COUNT: Record<number, number> = { 5: 4, 10: 8, 15: 12, 30: 20 };

/** Entrenamiento rápido: repasos vencidos primero, después temas flojos y lo que estás viendo. */
function quickItems(n: number): SessionItem[] {
  const st = store.getState();
  const due = dueTopics(st).map((t) => ({ topicId: t, label: "Repaso" }));
  const weak = recommendations(st, 4).map((r) => ({ topicId: r.topicId, label: "Reforzar" }));
  const active = activeTopics(st).map((t) => ({ topicId: t, label: "Práctica" }));
  const pool = [...due, ...weak, ...active].filter((x) => getTopic(x.topicId)?.generators.length);
  const base = pool.length ? pool : [{ topicId: "t-signos", label: "Práctica" }, { topicId: "t-fracciones", label: "Práctica" }, { topicId: "t-ecuaciones", label: "Práctica" }];
  return Array.from({ length: n }, (_, i) => ({ ...base[i % base.length], adjust: i >= n - Math.ceil(n / 5) ? 1 : 0 }));
}

function Quick({ minutes }: { minutes: number }) {
  const n = COUNT[minutes] ?? Math.max(3, Math.round(minutes * 0.75));
  const [items] = useState(() => quickItems(n));
  return <Session title={`Entrenamiento de ${minutes} min`} items={items} mode="rapido" exitHref="/" />;
}

function Router() {
  const min = Number(useSearchParams().get("min"));
  return min > 0 ? <Quick minutes={Math.min(60, min)} /> : <Training />;
}

export default function Page() {
  return (
    <Gate>
      <Suspense>
        <Router />
      </Suspense>
    </Gate>
  );
}
