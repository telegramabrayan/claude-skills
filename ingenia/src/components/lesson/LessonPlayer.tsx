"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import type { Lesson, LessonCard } from "@/engine/types";
import { actions, useProgress } from "@/lib/store";
import { lessonContext, nextLesson, resolveExercise } from "@/lib/learning";
import { getLesson } from "@/content/lessons";
import { MathText } from "../math/MathText";
import { Widget } from "../widgets/Widget";
import { ExercisePlayer } from "../exercise/ExercisePlayer";
import { TutorPanel } from "../tutor/TutorPanel";
import { ProgressBar } from "../ui/primitives";
import { Icon } from "../ui/Icon";

const TAGS = { intuitivo: "Idea intuitiva", cotidiano: "En la vida real", matematico: "Explicación matemática" } as const;

const CHEERS = ["Bien. Ya entendiste la idea.", "Buen progreso.", "Perfecto. Sigamos.", "Vas muy bien."];

function CardView({ card, lesson, onNext, isLast }: { card: LessonCard; lesson: Lesson; onNext: () => void; isLast: boolean }) {
  const [revealed, setRevealed] = useState(1);
  const [tutor, setTutor] = useState(false);
  const exercise = useMemo(() => (card.kind === "exercise" ? resolveExercise(card.exercise) : null), [card]);

  switch (card.kind) {
    case "intro":
      return (
        <div className="space-y-5">
          <h1 className="text-3xl font-black tracking-tight">{lesson.title}</h1>
          <div className="rounded-2xl bg-primary-soft p-4">
            <p className="text-sm font-bold uppercase tracking-wide text-primary">¿Qué vamos a aprender?</p>
            <MathText text={card.learn} className="mt-1" />
          </div>
          <div className="rounded-2xl bg-accent-soft p-4">
            <p className="text-sm font-bold uppercase tracking-wide text-accent">¿Para qué sirve?</p>
            <MathText text={card.why} className="mt-1" />
          </div>
          <p className="text-sm text-muted">⏱ Unos {lesson.estimatedMinutes} minutos · {lesson.cards.length} pantallas cortas</p>
          <button className="btn btn-primary text-lg" onClick={onNext} autoFocus>
            Empezar <Icon name="arrowRight" />
          </button>
        </div>
      );
    case "explain":
      return (
        <div className="space-y-4">
          {card.tag && <span className="chip">{TAGS[card.tag]}</span>}
          <h2 className="text-2xl font-bold">{card.title}</h2>
          <MathText text={card.body} className="text-lg" />
          {card.widget && (
            <div className="rounded-2xl border border-line p-4">
              <Widget widget={card.widget} />
            </div>
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            <button className="btn btn-primary" onClick={onNext} autoFocus>
              Entendido <Icon name="arrowRight" />
            </button>
            <button className="btn btn-ghost" onClick={() => setTutor((t) => !t)}>
              <Icon name="chat" size={18} /> No me quedó claro
            </button>
          </div>
          {tutor && <TutorPanel script={lesson.tutor} topicName={lesson.title} onClose={() => setTutor(false)} />}
        </div>
      );
    case "example":
      return (
        <div className="space-y-4">
          <span className="chip">Ejemplo resuelto</span>
          <h2 className="text-2xl font-bold">{card.title}</h2>
          <div className="rounded-xl bg-surface-2 p-4 text-lg">
            <MathText text={card.problem} />
          </div>
          <ol className="space-y-2">
            {card.steps.slice(0, revealed).map((st, i) => (
              <li key={i} className="anim-pop flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-bold text-primary">{i + 1}</span>
                <MathText text={st} />
              </li>
            ))}
          </ol>
          {revealed < card.steps.length ? (
            <button className="btn btn-secondary" onClick={() => setRevealed((r) => r + 1)} autoFocus>
              Siguiente paso
            </button>
          ) : (
            <>
              <p className="anim-pop rounded-xl bg-success-soft p-3 font-semibold">
                Resultado: <MathText text={card.result} block={false} />
              </p>
              <button className="btn btn-primary" onClick={onNext} autoFocus>
                Continuar <Icon name="arrowRight" />
              </button>
            </>
          )}
        </div>
      );
    case "exercise":
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">{card.title}</h2>
          {exercise && <ExercisePlayer exercise={exercise} mode="leccion" guided={card.guided} onDone={onNext} continueLabel={isLast ? "Terminar" : "Continuar"} />}
        </div>
      );
    case "summary":
      return (
        <div className="space-y-4">
          <span className="chip">Resumen</span>
          <h2 className="text-2xl font-bold">Lo importante</h2>
          <ul className="space-y-3">
            {card.points.map((p, i) => (
              <li key={i} className="flex gap-3 text-lg">
                <span className="mt-1 text-success" aria-hidden>
                  <Icon name="check" />
                </span>
                <MathText text={p} />
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted">Este tema va a volver a aparecer en tus repasos para que no se olvide.</p>
          <button className="btn btn-primary text-lg" onClick={onNext} autoFocus>
            Terminar lección <Icon name="check" />
          </button>
        </div>
      );
  }
}

export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const s = useProgress();
  const saved = s.lessons[lesson.id];
  const [index, setIndex] = useState(saved?.status === "en-curso" ? Math.min(saved.card, lesson.cards.length - 1) : 0);
  const [done, setDone] = useState<null | { xp: number; units: string[] }>(null);
  const [cheer, setCheer] = useState<string | null>(null);
  const ctx = lessonContext(lesson.id);

  const next = () => {
    const prev = lesson.cards[index];
    if (index + 1 >= lesson.cards.length) {
      const r = actions.completeLesson(lesson.id);
      setDone({ xp: r.xpGained, units: r.unitsCompleted });
      return;
    }
    if (prev.kind === "exercise") {
      setCheer(CHEERS[index % CHEERS.length]);
      setTimeout(() => setCheer(null), 1400);
    }
    actions.saveLessonCard(lesson.id, index + 1);
    setIndex(index + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (done) {
    const nl = nextLesson({ ...s });
    const nextL = nl ? getLesson(nl) : undefined;
    return (
      <div className="anim-pop mx-auto max-w-xl space-y-5 text-center">
        <div className="text-6xl" aria-hidden>
          🎉
        </div>
        <h1 className="text-3xl font-black">¡Lección completada!</h1>
        <p className="text-lg text-muted">{lesson.title}</p>
        {done.xp > 0 ? <p className="text-2xl font-bold text-xp">+{done.xp} XP</p> : <p className="text-muted">Ya la habías completado: repasar también suma (en los ejercicios).</p>}
        {done.units.length > 0 && <p className="rounded-xl bg-success-soft p-3 font-semibold">¡Completaste una unidad entera!</p>}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {nextL && nextL.id !== lesson.id && (
            <Link href={`/leccion/${nextL.id}`} className="btn btn-primary">
              Siguiente: {nextL.title} <Icon name="arrowRight" />
            </Link>
          )}
          {lesson.topicIds[0] && (
            <Link href={`/practicar?tema=${lesson.topicIds[0]}`} className="btn btn-secondary">
              Practicar este tema
            </Link>
          )}
          <Link href="/mapa" className="btn btn-ghost">
            Volver al mapa
          </Link>
        </div>
      </div>
    );
  }

  const card = lesson.cards[index];
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/mapa" className="btn btn-ghost !px-2" aria-label="Salir de la lección">
          <Icon name="x" />
        </Link>
        <div className="flex-1">
          <div className="mb-1 flex justify-between gap-2 text-xs text-muted">
            <span className="truncate">{ctx ? `${ctx.subject.shortName} · ${ctx.unit.title}` : lesson.subtitle}</span>
            <span>
              {index + 1}/{lesson.cards.length}
            </span>
          </div>
          <ProgressBar value={(index + 1) / lesson.cards.length} label="Progreso de la lección" />
        </div>
        {index > 0 && (
          <button className="btn btn-ghost !px-2" onClick={() => setIndex(index - 1)} aria-label="Pantalla anterior">
            <Icon name="arrowLeft" />
          </button>
        )}
      </div>
      {cheer && <p className="anim-pop mb-3 text-center font-semibold text-success">{cheer}</p>}
      <div key={index} className="anim-pop card p-5 sm:p-8">
        <CardView card={card} lesson={lesson} onNext={next} isLast={index === lesson.cards.length - 1} />
      </div>
    </div>
  );
}
