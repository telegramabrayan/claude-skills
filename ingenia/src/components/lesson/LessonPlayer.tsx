"use client";
import { useSubjectTheme } from "@/lib/subjectTheme";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Lesson, LessonCard } from "@/engine/types";
import { actions, useProgress } from "@/lib/store";
import { lessonContext, nextLesson, resolveExercise } from "@/lib/learning";
import { unitTopicsMastery } from "@/lib/path";
import { findUnit } from "@/content/curriculum";
import { XP } from "@/engine/progress/rules";
import { Nodo, GuideSay } from "../guide/Nodo";
import { Confetti } from "../ui/Celebrate";
import type { ExerciseOutcome } from "../exercise/ExercisePlayer";
import { getLesson, lessonCards } from "@/content/lessons";
import { getTopic } from "@/content/topics";
import { MathText } from "../math/MathText";
import { Widget } from "../widgets/Widget";
import { ExercisePlayer } from "../exercise/ExercisePlayer";
import { LessonExplain, PrereqCheck, type Strategy } from "../tutor/ExplainPanel";
import { Whiteboard } from "../board/Whiteboard";
import { setStudyContext } from "@/lib/studyContext";
import { ProgressBar } from "../ui/primitives";
import { Icon } from "../ui/Icon";

const TAGS = { intuitivo: "Idea intuitiva", cotidiano: "En la vida real", matematico: "Explicación matemática" } as const;

const CHEERS = ["Bien. Ya entendiste la idea.", "Buen progreso.", "Perfecto. Sigamos.", "Vas muy bien."];

const HELP: { strategy: Strategy; label: string }[] = [
  { strategy: "simple", label: "😵 No entendí" },
  { strategy: "cero", label: "Desde cero" },
  { strategy: "numerico", label: "Otro ejemplo" },
  { strategy: "pasos", label: "Paso a paso" },
  { strategy: "visual", label: "Visualmente" },
  { strategy: "porque", label: "¿Por qué?" },
  { strategy: "origen", label: "¿De dónde sale?" },
  { strategy: "antes", label: "¿Qué necesito antes?" },
  { strategy: "juntos", label: "Practiquemos juntos" },
];

function CardView({ card, lesson, onNext, isLast }: { card: LessonCard; lesson: Lesson; onNext: (o?: ExerciseOutcome) => void; isLast: boolean }) {
  const [revealed, setRevealed] = useState(1);
  const [tutor, setTutor] = useState<Strategy | null>(null);
  const [boardDone, setBoardDone] = useState(false);
  const prog = useProgress();
  const basesOk = card.kind === "check" && !prog.settings.fromZero && card.topics.every((t) => (prog.topics[t]?.mastery ?? 0) >= 0.75);
  const helps = HELP.filter((h) => (h.strategy !== "pasos" || lesson.tutor.board) && (h.strategy !== "origen" || lesson.tutor.origin) && (h.strategy !== "visual" || lesson.tutor.visual || lesson.tutor.board));

  // El profesor sabe qué pantalla está leyendo.
  useEffect(() => {
    const text =
      card.kind === "explain" ? card.body : card.kind === "example" ? `${card.problem}\n${card.steps.join("\n")}\nResultado: ${card.result}` : card.kind === "summary" ? card.points.join("\n") : card.kind === "board" ? card.steps.map((x) => `${x.expr}${x.note ? ` (${x.note})` : ""}`).join("\n") : card.kind === "intro" ? `${card.learn}\n${card.why}` : "";
    const ctx = lessonContext(lesson.id);
    setStudyContext({ lessonId: lesson.id, subjectId: ctx?.subject.id, unitId: ctx?.unit.id, topicId: lesson.topicIds[0], reading: { title: card.title, text }, exercise: undefined, answer: undefined, result: undefined }, true);
  }, [card, lesson]);
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
          <button className="btn btn-primary text-lg" onClick={() => onNext()} autoFocus>
            Empezar <Icon name="arrowRight" />
          </button>
        </div>
      );
    case "explain":
      return (
        <div className="space-y-4">
          {prog.settings.fromZero && lesson.tutor.fromZero && card === lesson.cards.find((c) => c.kind === "explain") && (
            <details className="rounded-2xl border border-accent/40 bg-accent-soft/40 p-4" open>
              <summary className="cursor-pointer font-bold text-accent">Antes de empezar, desde cero</summary>
              <MathText text={lesson.tutor.fromZero} className="mt-2" />
            </details>
          )}
          {card.tag && <span className="chip">{TAGS[card.tag]}</span>}
          <h2 className="text-2xl font-bold">{card.title}</h2>
          <MathText text={card.body} className="text-lg" />
          {card.widget && (
            <div className="rounded-2xl border border-line p-4">
              <Widget widget={card.widget} />
            </div>
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            <button className="btn btn-primary" onClick={() => onNext()} autoFocus>
              Entendido <Icon name="arrowRight" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5" aria-label="Otras formas de explicarlo">
            {helps.map((h) => (
              <button key={h.strategy} className={`chip !py-1.5 hover:!bg-primary-soft ${tutor === h.strategy ? "!bg-primary-soft !text-primary" : ""}`} onClick={() => setTutor(tutor === h.strategy ? null : h.strategy === "simple" && prog.settings.fromZero ? "cero" : h.strategy)}>
                {h.label}
              </button>
            ))}
          </div>
          {tutor && <LessonExplain key={tutor} lesson={lesson} initial={tutor} onClose={() => setTutor(null)} />}
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
          <Whiteboard steps={card.steps.map((x) => ({ expr: x }))} title="Resolución" onDone={() => setRevealed(card.steps.length)} />
          {revealed >= card.steps.length && (
            <>
              <p className="anim-pop rounded-xl bg-success-soft p-3 font-semibold">
                Resultado: <MathText text={card.result} block={false} />
              </p>
              <button className="btn btn-primary" onClick={() => onNext()} autoFocus>
                Continuar <Icon name="arrowRight" />
              </button>
            </>
          )}
        </div>
      );
    case "board":
      return (
        <div className="space-y-4">
          <span className="chip">Pizarra</span>
          <h2 className="text-2xl font-bold">{card.title}</h2>
          {card.intro && <MathText text={card.intro} className="text-lg" />}
          <Whiteboard steps={card.steps} onDone={() => setBoardDone(true)} />
          {boardDone && card.outro && <MathText text={card.outro} className="anim-pop" />}
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-primary" onClick={() => onNext()} disabled={!boardDone} autoFocus={boardDone}>
              Continuar <Icon name="arrowRight" />
            </button>
            <button className="btn btn-ghost" onClick={() => setTutor(tutor ? null : "simple")}>
              😵 No entendí
            </button>
          </div>
          {tutor && <LessonExplain key={tutor} lesson={lesson} initial={tutor} onClose={() => setTutor(null)} />}
        </div>
      );
    case "check":
      return (
        <div className="space-y-4">
          <span className="chip">Antes de empezar</span>
          <h2 className="text-2xl font-bold">{card.title}</h2>
          <p className="text-muted">Unas preguntas rápidas sobre lo que este tema necesita. Si alguna falla, la repasamos antes de seguir: así no te perdés después.</p>
          {basesOk ? (
            <>
              <GuideSay mood="happy">Ya dominás lo que este tema necesita ({card.topics.map((t) => getTopic(t)?.name.toLowerCase()).filter(Boolean).join(", ")}). Seguimos.</GuideSay>
              <button className="btn btn-primary" onClick={() => onNext()} autoFocus>
                Continuar <Icon name="arrowRight" />
              </button>
            </>
          ) : (
            <>
              <PrereqCheck prereqs={card.topics} onPassed={() => onNext()} />
              <button className="btn btn-ghost" onClick={() => onNext()}>
                Saltar comprobación
              </button>
            </>
          )}
        </div>
      );
    case "exercise":
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">{card.title}</h2>
          {exercise && <ExercisePlayer exercise={exercise} mode="leccion" guided={card.guided} onDone={(o) => onNext(o)} continueLabel={isLast ? "Terminar" : "Continuar"} />}
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
          <button className="btn btn-primary text-lg" onClick={() => onNext()} autoFocus>
            Terminar lección <Icon name="check" />
          </button>
        </div>
      );
  }
}

interface Done {
  xp: number;
  units: string[];
  accuracy: number;
  seconds: number;
  perfect: boolean;
}

export function LessonPlayer({ lesson: raw }: { lesson: Lesson }) {
  const lesson = useMemo(() => ({ ...raw, cards: lessonCards(raw) }), [raw]);
  useSubjectTheme(raw.subjectId);
  const s = useProgress();
  const saved = s.lessons[lesson.id];
  const [index, setIndex] = useState(saved?.status === "en-curso" ? Math.min(saved.card, lesson.cards.length - 1) : 0);
  const [done, setDone] = useState<Done | null>(null);
  const [cheer, setCheer] = useState<string | null>(null);
  const [notes, setNotes] = useState(false);
  const started = useRef(Date.now());
  /** Resultado en el primer intento de cada ejercicio de la lección (por índice de tarjeta). */
  const firstTries = useRef<Record<number, boolean>>({});
  const ctx = lessonContext(lesson.id);
  const isSaved = s.saved.some((x) => x.kind === "leccion" && x.id === lesson.id);

  const next = (o?: ExerciseOutcome) => {
    const prev = lesson.cards[index];
    if (o && prev.kind === "exercise" && !(index in firstTries.current)) firstTries.current[index] = o.firstTry && o.correct;
    if (index + 1 >= lesson.cards.length) {
      const vals = Object.values(firstTries.current);
      const exerciseCount = lesson.cards.filter((c) => c.kind === "exercise").length;
      // Los ejercicios salteados (volviendo atrás) cuentan como no respondidos.
      const accuracy = exerciseCount ? vals.filter(Boolean).length / Math.max(exerciseCount, vals.length) : 1;
      const r = actions.completeLesson(lesson.id, accuracy);
      setDone({ xp: r.xpGained, units: r.unitsCompleted, accuracy, seconds: Math.round((Date.now() - started.current) / 1000), perfect: r.perfect });
      window.scrollTo({ top: 0, behavior: "smooth" });
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

  if (done) return <LessonComplete lesson={lesson} done={done} />;

  const card = lesson.cards[index];
  const noteKey = `leccion:${lesson.id}`;
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-1.5 sm:gap-3">
        <Link href="/camino" className="btn btn-ghost !px-2" aria-label="Salir de la lección">
          <Icon name="x" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex justify-between gap-2 text-xs text-muted">
            <span className="truncate">{ctx ? `${ctx.subject.shortName} · ${ctx.unit.title}` : lesson.subtitle}</span>
            <span>
              {index + 1}/{lesson.cards.length}
            </span>
          </div>
          <ProgressBar value={(index + 1) / lesson.cards.length} label="Progreso de la lección" />
        </div>
        <button
          className="btn btn-ghost !px-2"
          aria-pressed={isSaved}
          aria-label={isSaved ? "Quitar de guardados" : "Guardar lección"}
          title="Guardar"
          onClick={() => actions.toggleSaved({ kind: "leccion", id: lesson.id, title: lesson.title, href: `/leccion/${lesson.id}` })}
        >
          <span aria-hidden>{isSaved ? "⭐" : "☆"}</span>
        </button>
        <button className="btn btn-ghost !px-2" aria-label="Mis notas" title="Mis notas" aria-pressed={notes} onClick={() => setNotes((v) => !v)}>
          <span aria-hidden>📝</span>
        </button>
        {index > 0 && (
          <button className="btn btn-ghost !px-2" onClick={() => setIndex(index - 1)} aria-label="Pantalla anterior">
            <Icon name="arrowLeft" />
          </button>
        )}
      </div>
      {notes && <NoteBox noteKey={noteKey} title={lesson.title} />}
      {cheer && <p className="anim-pop mb-3 text-center font-semibold text-success">{cheer}</p>}
      <div key={index} className="anim-pop card p-5 sm:p-8">
        <CardView card={card} lesson={lesson} onNext={next} isLast={index === lesson.cards.length - 1} />
      </div>
    </div>
  );
}

/** Notas personales asociadas a una lección o concepto. Se guardan solas. */
export function NoteBox({ noteKey, title }: { noteKey: string; title: string }) {
  const s = useProgress();
  const [text, setText] = useState(s.notes[noteKey]?.text ?? "");
  return (
    <div className="anim-pop card mb-4 p-4">
      <label className="mb-1 block text-sm font-bold" htmlFor={`note-${noteKey}`}>
        📝 Mis notas · {title}
      </label>
      <textarea
        id={`note-${noteKey}`}
        className="input min-h-24 w-full"
        value={text}
        placeholder="Escribí lo que quieras recordar con tus palabras."
        onChange={(e) => setText(e.target.value)}
        onBlur={() => actions.saveNote(noteKey, text)}
      />
      <p className="mt-1 text-xs text-muted">Se guarda al salir del campo. Las encontrás en Guardados.</p>
    </div>
  );
}

function fmtTime(sec: number) {
  const m = Math.floor(sec / 60);
  const r = sec % 60;
  return m ? `${m} min ${r.toString().padStart(2, "0")} s` : `${r} s`;
}

function LessonComplete({ lesson, done }: { lesson: Lesson; done: Done }) {
  const s = useProgress();
  const [stage, setStage] = useState<"lesson" | "unit">("lesson");
  const nl = nextLesson(s);
  const nextL = nl && nl !== lesson.id ? getLesson(nl) : undefined;
  const unitId = done.units[0];
  const unit = unitId ? findUnit(unitId)?.unit : undefined;

  if (stage === "unit" && unit) {
    const topics = unitTopicsMastery(s, unit.id);
    return (
      <div className="anim-pop relative mx-auto max-w-xl space-y-5 text-center">
        <Confetti count={40} />
        <div className="flex justify-center">
          <Nodo mood="happy" size={96} />
        </div>
        <p className="text-sm font-bold uppercase tracking-wide text-primary">Unidad completada</p>
        <h1 className="text-3xl font-black">{unit.title}</h1>
        <p className="text-2xl font-bold text-xp">+{XP.unit} XP</p>
        {topics.length > 0 && (
          <div className="card p-4 text-left">
            <p className="mb-2 font-bold">Lo que trabajaste</p>
            <ul className="space-y-2">
              {topics.map((t) => (
                <li key={t.id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{t.name}</span>
                    <span className="text-muted">{Math.round(t.mastery * 100)}% dominio</span>
                  </div>
                  <ProgressBar value={t.mastery} height={6} label={t.name} />
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href={`/desafio?unidad=${unit.id}`} className="btn btn-primary">
            👑 Desafío final (+{XP.challenge} XP)
          </Link>
          {nextL && (
            <Link href={`/leccion/${nextL.id}`} className="btn btn-secondary">
              Siguiente unidad <Icon name="arrowRight" />
            </Link>
          )}
          <Link href="/camino" className="btn btn-ghost">
            Ver el camino
          </Link>
        </div>
      </div>
    );
  }

  const pct = Math.round(done.accuracy * 100);
  return (
    <div className="anim-pop relative mx-auto max-w-xl space-y-5 text-center">
      <Confetti />
      <div className="flex justify-center">
        <Nodo mood={"happy"} size={88} />
      </div>
      <h1 className="text-3xl font-black">{done.perfect ? "¡Lección perfecta!" : "¡Lección completada!"}</h1>
      <p className="text-lg text-muted">{lesson.title}</p>
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3">
          <p className="text-xs font-bold uppercase text-muted">XP</p>
          <p className="anim-pop text-2xl font-black text-xp">+{done.xp}</p>
        </div>
        <div className="card p-3">
          <p className="text-xs font-bold uppercase text-muted">Precisión</p>
          <p className={`text-2xl font-black ${pct >= 80 ? "text-success" : ""}`}>{pct}%</p>
        </div>
        <div className="card p-3">
          <p className="text-xs font-bold uppercase text-muted">Tiempo</p>
          <p className="text-lg font-black">{fmtTime(done.seconds)}</p>
        </div>
      </div>
      {done.xp === 0 && <p className="text-sm text-muted">Ya la habías completado: repasar fija lo aprendido (los ejercicios siguen sumando).</p>}
      {!done.perfect && pct < 100 && <GuideSay className="justify-center text-left">Para que sea perfecta hace falta acertar todo al primer intento. Podés repetirla cuando quieras: suma +{XP.perfectLesson} XP.</GuideSay>}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        {unit ? (
          <button className="btn btn-primary" onClick={() => setStage("unit")} autoFocus>
            Continuar <Icon name="arrowRight" />
          </button>
        ) : nextL ? (
          <Link href={`/leccion/${nextL.id}`} className="btn btn-primary" autoFocus>
            Siguiente: {nextL.title} <Icon name="arrowRight" />
          </Link>
        ) : null}
        {lesson.topicIds[0] && (
          <Link href={`/practicar?tema=${lesson.topicIds[0]}`} className="btn btn-secondary">
            Practicar este tema
          </Link>
        )}
        <Link href="/camino" className="btn btn-ghost">
          Volver al camino
        </Link>
      </div>
    </div>
  );
}
