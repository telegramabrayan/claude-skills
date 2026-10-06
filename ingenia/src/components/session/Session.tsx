"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Difficulty, ErrorType, Exercise } from "@/engine/types";
import type { ExamRecord, StudyMode } from "@/engine/progress/state";
import { generate, newSeed } from "@/engine/generators";
import { rng } from "@/engine/generators/rng";
import { fmt } from "@/engine/math/parser";
import { getTopic, ERROR_LABELS, ERROR_REMEDIATION } from "@/content/topics";
import { actions, store } from "@/lib/store";
import { exerciseFor } from "@/lib/learning";
import { ExercisePlayer, type ExerciseOutcome } from "../exercise/ExercisePlayer";
import { ProgressBar } from "../ui/primitives";
import { Icon } from "../ui/Icon";
import { Confetti } from "../ui/Celebrate";

export interface SessionItem {
  topicId: string;
  /** Ajuste relativo a la dificultad adaptativa del estudiante. */
  adjust?: number;
  /** Dificultad fija (exámenes). */
  difficulty?: Difficulty;
  label?: string;
}

interface Props {
  title: string;
  items: SessionItem[];
  mode: StudyMode;
  kind?: "practica" | "desafio" | "examen";
  /** Duración del examen en minutos. */
  minutes?: number;
  onExit?: () => void;
  exitHref?: string;
  /** Vidas fijas (desafío final): se usan aunque los corazones estén apagados en la configuración. */
  lives?: number;
  /** Sin pistas, profesor ni explicaciones. */
  noHelp?: boolean;
  /** Reemplaza la recompensa estándar del desafío (p. ej. coronar una unidad). */
  onWin?: () => void;
  /** Práctica guiada: cada ejercicio arranca con la primera pista a la vista. */
  guided?: boolean;
}

interface Log {
  exercise: Exercise;
  correct: boolean;
  errorType?: ErrorType;
}

function buildExercise(item: SessionItem): Exercise {
  if (item.difficulty) {
    const topic = getTopic(item.topicId);
    const seed = newSeed();
    const gen = rng(seed).pick(topic?.generators ?? []);
    return generate(gen, item.difficulty, seed);
  }
  return exerciseFor(store.getState(), item.topicId, item.adjust ?? 0);
}

export function Session({ title, items, mode, kind = "practica", minutes, onExit, exitHref = "/", lives, noHelp, onWin, guided }: Props) {
  const maxHearts = lives ?? 5;
  const hearts0 = lives ?? (kind === "desafio" && store.getState().settings.hearts ? 5 : null);
  const [index, setIndex] = useState(0);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [log, setLog] = useState<Log[]>([]);
  const [hearts, setHearts] = useState<number | null>(hearts0);
  const [done, setDone] = useState(false);
  const xpStart = useRef(store.getState().xp);
  const started = useRef(Date.now());
  const [now, setNow] = useState(Date.now());
  const saved = useRef(false);

  useEffect(() => {
    if (index < items.length) setExercise(buildExercise(items[index]));
  }, [index, items]);

  useEffect(() => {
    if (kind !== "examen" || done) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [kind, done]);

  const remaining = minutes ? Math.max(0, minutes * 60 - Math.floor((now - started.current) / 1000)) : null;
  useEffect(() => {
    if (remaining === 0 && !done) setDone(true);
  }, [remaining, done]);

  const advance = (entry: Log) => {
    const nextLog = [...log, entry];
    setLog(nextLog);
    if (index + 1 >= items.length) setDone(true);
    else setIndex(index + 1);
  };

  const onDone = (o: ExerciseOutcome) => {
    // Solo cuenta la primera respuesta (el reproductor ya registró el intento).
    if (log.length > index) return;
    advance({ exercise: o.exercise, correct: o.firstTry && o.correct, errorType: o.errorType });
  };

  const heartLostAt = useRef(-1);
  const onWrong = () => {
    // Un corazón por ejercicio como máximo: reintentar no castiga.
    if (hearts === null || heartLostAt.current === index) return;
    heartLostAt.current = index;
    const h = hearts - 1;
    setHearts(h);
    if (h <= 0) setTimeout(() => setDone(true), 900);
  };

  const correct = log.filter((l) => l.correct).length;
  const total = kind === "examen" ? items.length : log.length;

  // Guardado de resultados al terminar.
  useEffect(() => {
    if (!done || saved.current) return;
    saved.current = true;
    if (kind === "desafio") {
      const won = hearts === null ? correct >= Math.ceil(items.length * 0.7) : hearts > 0 && log.length === items.length;
      if (won) (onWin ?? actions.winChallenge)();
    }
    if (kind === "examen") {
      const byTopic: ExamRecord["byTopic"] = {};
      const errors: ExamRecord["errors"] = {};
      items.forEach((it, i) => {
        const l = log[i];
        const t = (byTopic[it.topicId] ??= { correct: 0, total: 0 });
        t.total++;
        if (l?.correct) t.correct++;
        if (l && !l.correct && l.errorType) errors[l.errorType] = (errors[l.errorType] ?? 0) + 1;
      });
      actions.saveExam({
        id: `${Date.now()}`,
        title,
        ts: Date.now(),
        score: Math.round((correct / items.length) * 100) / 10,
        correct,
        total: items.length,
        seconds: Math.round((Date.now() - started.current) / 1000),
        byTopic,
        errors,
      });
    }
  }, [done, kind, correct, hearts, items, log, title, onWin]);

  if (done) {
    return <Summary title={title} log={log} items={items} kind={kind} hearts={hearts} xp={store.getState().xp - xpStart.current} seconds={Math.round((Date.now() - started.current) / 1000)} onExit={onExit} exitHref={exitHref} />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        {onExit ? (
          <button className="btn btn-ghost !px-2" onClick={onExit} aria-label="Salir de la sesión">
            <Icon name="x" />
          </button>
        ) : (
          <Link href={exitHref} className="btn btn-ghost !px-2" aria-label="Salir de la sesión">
            <Icon name="x" />
          </Link>
        )}
        <div className="flex-1">
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-semibold">{title}</span>
            <span className="text-muted">
              {Math.min(index + 1, items.length)}/{items.length}
            </span>
          </div>
          <ProgressBar value={index / items.length} label="Progreso de la sesión" />
        </div>
        {hearts !== null && (
          <span className="flex items-center gap-0.5 text-danger" aria-label={`${hearts} corazones`}>
            {Array.from({ length: maxHearts }, (_, i) => (
              <Icon key={i} name="heart" size={18} className={i < hearts ? "fill-current" : "opacity-30"} />
            ))}
          </span>
        )}
        {remaining !== null && (
          <span className={`flex items-center gap-1 font-mono text-sm font-bold ${remaining < 60 ? "text-danger" : ""}`} aria-label="Tiempo restante">
            <Icon name="clock" size={16} /> {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
          </span>
        )}
      </div>
      {items[index]?.label && <span className="chip">{items[index].label}</span>}
      <div className="card p-5 sm:p-6">
        {exercise && (
          <ExercisePlayer key={`${index}-${exercise.id}`} exercise={exercise} mode={mode} onDone={onDone} onWrong={onWrong} exam={kind === "examen"} noHelp={noHelp} guided={guided} continueLabel={index + 1 >= items.length ? "Terminar" : "Siguiente"} />
        )}
        {noHelp && kind !== "examen" && <p className="mt-4 text-xs text-muted">Desafío: sin pistas ni explicaciones. Al final ves qué repasar.</p>}
        {kind === "examen" && (
          <p className="mt-4 text-xs text-muted">Modo examen: sin pistas ni corrección hasta el final. Si no sabés, escribí tu mejor intento y seguí.</p>
        )}
      </div>
    </div>
  );
}

function Summary({ title, log, items, kind, hearts, xp, seconds, onExit, exitHref }: { title: string; log: Log[]; items: SessionItem[]; kind: string; hearts: number | null; xp: number; seconds: number; onExit?: () => void; exitHref: string }) {
  const correct = log.filter((l) => l.correct).length;
  const total = kind === "examen" ? items.length : log.length;
  const pct = total ? correct / total : 0;
  const errorCounts = useMemo(() => {
    const m = new Map<ErrorType, number>();
    log.forEach((l) => !l.correct && l.errorType && m.set(l.errorType, (m.get(l.errorType) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [log]);
  const byTopic = useMemo(() => {
    const m = new Map<string, { c: number; t: number }>();
    items.forEach((it, i) => {
      const e = m.get(it.topicId) ?? { c: 0, t: 0 };
      e.t++;
      if (log[i]?.correct) e.c++;
      m.set(it.topicId, e);
    });
    return [...m.entries()];
  }, [items, log]);
  const weak = byTopic.filter(([, v]) => v.c / v.t < 0.6).map(([t]) => t);
  const strong = byTopic.filter(([, v]) => v.c / v.t >= 0.8).map(([t]) => t);
  const remediation = errorCounts.map(([e]) => ERROR_REMEDIATION[e]).filter((t): t is string => !!t && !weak.includes(t));
  const outOfHearts = hearts !== null && hearts <= 0;
  const wonChallenge = kind === "desafio" && hearts !== null && !outOfHearts && log.length === items.length;
  const message = outOfHearts
    ? "Te quedaste sin vidas. Es parte del desafío: repasá los temas marcados y volvé a intentarlo."
    : wonChallenge
      ? "¡Desafío superado! Demostraste que podés resolver la unidad sin ayuda."
    : pct >= 0.9
      ? "Excelente. Estás listo para subir la dificultad."
      : pct >= 0.6
        ? "Buen progreso. Revisá los errores y seguí practicando."
        : "Esta sesión costó, y está bien: los errores muestran exactamente qué reforzar.";

  return (
    <div className="anim-pop relative mx-auto max-w-2xl space-y-5">
      {wonChallenge && <Confetti count={40} />}
      <div className="card p-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">{title}</p>
        {kind === "examen" ? (
          <p className="mt-2 text-5xl font-black" style={{ color: pct >= 0.4 ? "var(--success)" : "var(--danger)" }}>
            {fmt(Math.round(pct * 100) / 10, 1)}
            <span className="text-2xl text-muted">/10</span>
          </p>
        ) : (
          <p className="mt-2 text-5xl font-black">
            {correct}/{total}
          </p>
        )}
        <p className="mt-3">{message}</p>
        <div className="mt-4 flex justify-center gap-3 text-sm">
          <span className="chip !bg-xp-soft !text-xp">+{xp} XP</span>
          <span className="chip">
            <Icon name="clock" size={14} /> {Math.floor(seconds / 60)} min {seconds % 60} s
          </span>
        </div>
      </div>
      {kind === "examen" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="card p-4">
            <p className="mb-2 font-bold">Temas fuertes</p>
            {strong.length ? strong.map((t) => <p key={t} className="text-sm">✓ {getTopic(t)?.name}</p>) : <p className="text-sm text-muted">Todavía ninguno con 80 % o más.</p>}
          </div>
          <div className="card p-4">
            <p className="mb-2 font-bold">Temas débiles</p>
            {weak.length ? weak.map((t) => <p key={t} className="text-sm">• {getTopic(t)?.name}</p>) : <p className="text-sm text-muted">Ninguno por debajo del 60 %.</p>}
          </div>
        </div>
      )}
      {errorCounts.length > 0 && (
        <div className="card p-4">
          <p className="mb-2 font-bold">Errores de esta sesión</p>
          <div className="flex flex-wrap gap-2">
            {errorCounts.map(([e, n]) => (
              <span key={e} className="chip !bg-warn-soft !text-warn">
                {ERROR_LABELS[e]}: {n}
              </span>
            ))}
          </div>
        </div>
      )}
      {(weak.length > 0 || remediation.length > 0) && (
        <div className="card p-4">
          <p className="mb-2 font-bold">Plan recomendado</p>
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            {[...weak, ...remediation].slice(0, 4).map((t) => (
              <li key={t}>
                <Link className="font-semibold text-primary" href={`/practicar?tema=${t}`}>
                  Practicar {getTopic(t)?.name}
                </Link>
                {getTopic(t)?.lessonId && (
                  <>
                    {" "}o{" "}
                    <Link className="text-primary underline" href={`/leccion/${getTopic(t)?.lessonId}`}>
                      repasar la lección
                    </Link>
                  </>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
      <div className="flex justify-center gap-3">
        {onExit ? (
          <button className="btn btn-primary" onClick={onExit}>
            Volver
          </button>
        ) : (
          <Link className="btn btn-primary" href={exitHref}>
            Volver
          </Link>
        )}
      </div>
    </div>
  );
}
