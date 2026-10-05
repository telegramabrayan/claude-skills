"use client";
/**
 * Reproductor de ejercicios. Flujo pedagógico:
 *   intentar → corrección que explica el error (nunca un "incorrecto" seco)
 *   → [Intentar nuevamente] [Ver una pista] [Ver explicación] [Practicar algo parecido]
 * Las pistas se revelan de a una (3 niveles) y recién después la solución,
 * también de a un paso. Solo el primer intento cuenta para XP y dominio.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import type { Difficulty, EvaluationResult, Exercise } from "@/engine/types";
import { evaluateAnswer, type Answer } from "@/engine/evaluation/evaluate";
import { newSeed } from "@/engine/generators/rng";
import { getGenerator } from "@/engine/generators";
import type { StudyMode } from "@/engine/progress/state";
import { XP } from "@/engine/progress/rules";
import { getTopic, ERROR_LABELS } from "@/content/topics";
import { getLesson } from "@/content/lessons";
import { actions } from "@/lib/store";
import { MathText } from "../math/MathText";
import { ExerciseVisual } from "../math/Visuals";
import { TutorPanel } from "../tutor/TutorPanel";
import { Icon } from "../ui/Icon";
import { SymbolBar } from "./SymbolBar";

export interface ExerciseOutcome {
  correct: boolean;
  firstTry: boolean;
  errorType?: EvaluationResult["errorType"];
  exercise: Exercise;
}

interface Props {
  exercise: Exercise;
  mode: StudyMode;
  onDone?: (o: ExerciseOutcome) => void;
  /** Examen: sin pistas ni corrección hasta el final. */
  exam?: boolean;
  /** Diagnóstico: interfaz mínima con opción "No sé". */
  diagnostic?: boolean;
  /** Si es false no registra intentos (p. ej. ejemplos dentro del profesor). */
  record?: boolean;
  guided?: boolean;
  continueLabel?: string;
  onWrong?: () => void;
}

const DIFF_LABEL: Record<Difficulty, string> = { 1: "Muy fácil", 2: "Fácil", 3: "Normal", 4: "Difícil", 5: "Nivel parcial", 6: "Desafío" };

export function ExercisePlayer({ exercise: initial, mode, onDone, exam, diagnostic, record = true, guided, continueLabel = "Continuar", onWrong }: Props) {
  const [exercise, setExercise] = useState(initial);
  useEffect(() => setExercise(initial), [initial]);

  const [choiceIdx, setChoiceIdx] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [steps, setSteps] = useState<string[]>(["", ""]);
  const [traceVals, setTraceVals] = useState<Record<string, string>>({});
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [hints, setHints] = useState(guided ? 1 : 0);
  const [solutionSteps, setSolutionSteps] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showTutor, setShowTutor] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [firstCorrect, setFirstCorrect] = useState<boolean | null>(null);
  const [shake, setShake] = useState(false);
  const activeInput = useRef<HTMLInputElement | null>(null);

  // Reiniciar todo al cambiar de ejercicio.
  useEffect(() => {
    setChoiceIdx(null);
    setText("");
    setSteps(["", ""]);
    setTraceVals({});
    setResult(null);
    setHints(guided ? 1 : 0);
    setSolutionSteps(0);
    setShowExplanation(false);
    setShowTutor(false);
    setRecorded(false);
    setFirstCorrect(null);
  }, [exercise, guided]);

  const topic = getTopic(exercise.topicId);
  const tutorScript = topic?.lessonId ? getLesson(topic.lessonId)?.tutor : undefined;
  const usedSolution = solutionSteps > 0;
  const solved = result?.correct === true;
  const finished = solved || (exam && result !== null);

  const answer = (): Answer => {
    switch (exercise.kind) {
      case "choice":
        return { kind: "choice", index: choiceIdx ?? -1 };
      case "numeric":
        return { kind: "numeric", value: text };
      case "expression":
        return { kind: "expression", value: text };
      case "steps":
        return { kind: "steps", steps, final: text };
      case "trace":
        return { kind: "trace", values: traceVals };
      default:
        return { kind: "order", order: [] };
    }
  };

  const canSubmit = useMemo(() => {
    switch (exercise.kind) {
      case "choice":
        return choiceIdx !== null;
      case "trace":
        return exercise.ask.every((k) => (traceVals[k] ?? "").trim());
      default:
        return text.trim().length > 0;
    }
  }, [exercise, choiceIdx, text, traceVals]);

  const submit = (gaveUp = false) => {
    const r: EvaluationResult = gaveUp
      ? { correct: false, message: "Está bien no saberlo: para eso es el diagnóstico." }
      : evaluateAnswer(exercise, answer());
    setResult(r);
    if (r.invalidInput) return;
    if (!r.correct) {
      setShake(true);
      setTimeout(() => setShake(false), 450);
      onWrong?.();
    }
    if (!recorded) {
      setRecorded(true);
      setFirstCorrect(r.correct);
      if (record) {
        actions.recordAttempt({
          exerciseId: exercise.id,
          topicId: exercise.topicId,
          correct: r.correct,
          errorType: r.errorType,
          hints: Math.max(0, hints - (guided ? 1 : 0)),
          usedSolution,
          difficulty: exercise.difficulty,
          mode,
        });
      }
      if (exam || diagnostic) onDone?.({ correct: r.correct, firstTry: true, errorType: r.errorType, exercise });
    }
  };

  const retry = () => {
    setResult(null);
    setShowExplanation(false);
  };

  const nextHint = (): string | null => {
    if (hints < 3) {
      setHints((h) => h + 1);
      return exercise.hints[hints];
    }
    return null;
  };

  const revealSolution = () => setSolutionSteps((n) => Math.max(1, n));

  const similar = () => {
    if (!exercise.generator) return;
    const g = getGenerator(exercise.generator);
    setExercise(g.generate(newSeed(), exercise.difficulty));
  };

  const insert = (sym: string) => {
    const el = activeInput.current;
    if (!el) return;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const value = el.value.slice(0, start) + sym + el.value.slice(end);
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    setter?.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + sym.length, start + sym.length);
    });
  };

  const locked = finished;
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canSubmit && !finished) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {topic && <span className="chip">{topic.name}</span>}
        {!diagnostic && <span className="chip">{DIFF_LABEL[exercise.difficulty]}</span>}
        {guided && <span className="chip !bg-accent-soft !text-accent">Guiado</span>}
      </div>

      <div className="text-lg">
        <MathText text={exercise.prompt} />
      </div>

      {/* ───── Entrada ───── */}
      <div className={shake ? "anim-shake" : ""}>
        {exercise.kind === "choice" && (
          <div className="grid gap-2" role="radiogroup" aria-label="Opciones">
            {exercise.options.map((o, i) => {
              const picked = choiceIdx === i;
              const showRight = finished && !exam && i === exercise.answer;
              const showWrong = result && !result.correct && !result.invalidInput && picked && !exam;
              return (
                <button
                  key={i}
                  role="radio"
                  aria-checked={picked}
                  disabled={locked}
                  onClick={() => {
                    setChoiceIdx(i);
                    if (result && !result.correct) setResult(null);
                  }}
                  className={`flex min-h-12 items-center gap-3 rounded-xl border-2 px-4 py-2 text-left transition ${
                    showRight ? "border-success bg-success-soft" : showWrong ? "border-danger bg-danger-soft" : picked ? "border-primary bg-primary-soft" : "border-line bg-surface hover:border-primary/60"
                  }`}
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-surface-2 text-sm font-bold">{String.fromCharCode(65 + i)}</span>
                  <MathText text={o} block={false} />
                </button>
              );
            })}
          </div>
        )}

        {(exercise.kind === "numeric" || exercise.kind === "expression") && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {exercise.kind === "expression" && <span className="math shrink-0 text-lg">{exercise.prompt.match(/despejá \*\*(\w+)\*\*/)?.[1] ?? "="} =</span>}
              <input
                ref={(el) => {
                  if (el && !activeInput.current) activeInput.current = el;
                }}
                onFocus={(e) => (activeInput.current = e.currentTarget)}
                className="input font-mono text-lg"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  if (result?.invalidInput) setResult(null);
                }}
                onKeyDown={onKey}
                disabled={finished}
                inputMode="text"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                placeholder={exercise.kind === "numeric" ? "Tu respuesta" : "Escribí la expresión"}
                aria-label="Respuesta"
              />
              {exercise.kind === "numeric" && exercise.unit && <span className="shrink-0 font-semibold text-muted">{exercise.unit}</span>}
            </div>
            {!finished && <SymbolBar onInsert={insert} kind={exercise.kind} />}
          </div>
        )}

        {exercise.kind === "steps" && (
          <div className="space-y-2">
            {!diagnostic && !exam && (
              <p className="text-sm text-muted">Escribí tu procedimiento, un paso por renglón (por ejemplo «2x = 10»). Los pasos son opcionales, pero con ellos puedo decirte exactamente dónde está el error.</p>
            )}
            {!diagnostic &&
              !exam &&
              steps.map((s, i) => {
                const fb = result?.steps?.find((f) => f.index === i);
                const st = s.trim() ? fb?.status : undefined;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-16 shrink-0 text-sm font-semibold text-muted">Paso {i + 1}</span>
                    <input
                      onFocus={(e) => (activeInput.current = e.currentTarget)}
                      className={`input font-mono ${st === "error" || st === "invalido" ? "!border-danger" : st === "ok" ? "!border-success" : st === "arrastre" ? "!border-warn" : ""}`}
                      value={s}
                      disabled={finished}
                      onChange={(e) => {
                        const v = [...steps];
                        v[i] = e.target.value;
                        setSteps(v);
                        if (result && !result.correct) setResult(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (i === steps.length - 1 && steps.length < 8) setSteps([...steps, ""]);
                        }
                      }}
                      autoComplete="off"
                      spellCheck={false}
                      aria-label={`Paso ${i + 1}`}
                      aria-invalid={st === "error" || st === "invalido"}
                    />
                    <span className="w-6 shrink-0 text-center" aria-hidden>
                      {st === "ok" ? "✓" : st === "error" || st === "invalido" ? "✗" : st === "arrastre" ? "↳" : ""}
                    </span>
                  </div>
                );
              })}
            {!diagnostic && !exam && !finished && steps.length < 8 && (
              <button className="btn btn-ghost !min-h-9 text-sm" onClick={() => setSteps([...steps, ""])}>
                + Agregar paso
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="w-16 shrink-0 text-sm font-bold">x =</span>
              <input
                onFocus={(e) => (activeInput.current = e.currentTarget)}
                className="input font-mono text-lg"
                value={text}
                disabled={finished}
                onChange={(e) => {
                  setText(e.target.value);
                  if (result && !result.correct) setResult(null);
                }}
                onKeyDown={onKey}
                autoComplete="off"
                placeholder="Respuesta final"
                aria-label="Respuesta final: x ="
              />
              <span className="w-6" />
            </div>
            {!finished && <SymbolBar onInsert={insert} kind="steps" />}
          </div>
        )}

        {exercise.kind === "trace" && (
          <div className="space-y-3">
            <pre className="overflow-x-auto rounded-xl border border-line bg-surface-2 p-3 font-mono text-sm leading-6">
              {exercise.code.split("\n").map((l, i) => (
                <div key={i}>
                  <span className="mr-3 inline-block w-5 select-none text-right text-muted">{i + 1}</span>
                  {l}
                </div>
              ))}
            </pre>
            <div className="grid gap-2 sm:grid-cols-2">
              {exercise.ask.map((k) => (
                <label key={k} className="flex items-center gap-2">
                  <span className="shrink-0 font-mono font-bold">{k} =</span>
                  <input
                    className="input font-mono"
                    value={traceVals[k] ?? ""}
                    disabled={finished}
                    onChange={(e) => {
                      setTraceVals({ ...traceVals, [k]: e.target.value });
                      if (result && !result.correct) setResult(null);
                    }}
                    onKeyDown={onKey}
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    aria-label={`Valor final de ${k}`}
                  />
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ───── Mensaje de entrada inválida ───── */}
      {result?.invalidInput && (
        <p className="rounded-lg bg-warn-soft p-3 text-sm" role="status">
          {result.message}
        </p>
      )}

      {/* ───── Acciones principales ───── */}
      {!finished && !(result && !result.correct && !result.invalidInput && !exam) && (
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn btn-primary min-w-36" disabled={!canSubmit} onClick={() => submit()}>
            {exam ? "Responder" : "Comprobar"}
          </button>
          {diagnostic && (
            <button className="btn btn-ghost" onClick={() => submit(true)}>
              No sé
            </button>
          )}
          {!exam && !diagnostic && (
            <>
              <button className="btn btn-secondary" onClick={() => nextHint()} disabled={hints >= 3}>
                <Icon name="bulb" size={18} /> Pista {hints < 3 ? `(${hints}/3)` : ""}
              </button>
              <button className="btn btn-ghost" onClick={() => setShowTutor((v) => !v)}>
                <Icon name="chat" size={18} /> Preguntarle al profesor
              </button>
            </>
          )}
        </div>
      )}

      {/* ───── Corrección ───── */}
      {result && !result.invalidInput && !exam && !diagnostic && (
        <div className={`anim-pop rounded-2xl border p-4 ${result.correct ? "border-success/40 bg-success-soft" : "border-warn/40 bg-warn-soft"}`} role="status" aria-live="polite">
          <div className="flex items-start gap-3">
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${result.correct ? "bg-success text-surface" : "bg-warn text-surface"}`} aria-hidden>
              <Icon name={result.correct ? "check" : "bulb"} size={20} />
            </span>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="font-bold">
                {result.correct && firstCorrect === false ? "Bien, lo corregiste." : result.message}
                {result.correct && firstCorrect && record && (
                  <span className="ml-2 rounded-full bg-xp-soft px-2 py-0.5 text-sm text-xp">+{usedSolution ? 0 : hints > (guided ? 1 : 0) ? XP.correctWithHelp : XP.correct} XP</span>
                )}
              </p>
              {!result.correct && result.diagnosis && <MathText text={result.diagnosis} />}
              {!result.correct && result.errorType && <p className="text-xs text-muted">Tipo de error: {ERROR_LABELS[result.errorType]} (lo voy a tener en cuenta para tus próximas prácticas)</p>}
              {result.correct && exercise.explanation && <p className="text-sm text-muted">{exercise.explanation}</p>}
            </div>
          </div>
          {!result.correct && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="btn btn-primary" onClick={retry}>
                Intentar nuevamente
              </button>
              <button className="btn btn-secondary" onClick={() => nextHint()} disabled={hints >= 3}>
                Ver una pista
              </button>
              <button className="btn btn-secondary" onClick={() => setShowExplanation(true)}>
                Ver explicación
              </button>
              {exercise.generator && (
                <button className="btn btn-secondary" onClick={similar}>
                  Practicar algo parecido
                </button>
              )}
              <button className="btn btn-ghost" onClick={() => onDone?.({ correct: false, firstTry: false, errorType: result.errorType, exercise })}>
                Seguir
              </button>
            </div>
          )}
          {result.correct && onDone && (
            <div className="mt-4">
              <button className="btn btn-primary" onClick={() => onDone({ correct: true, firstTry: firstCorrect === true, exercise })} autoFocus>
                {continueLabel} <Icon name="arrowRight" size={18} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ───── Pistas ───── */}
      {!exam && !diagnostic && hints > 0 && (
        <div className="space-y-2">
          {exercise.hints.slice(0, hints).map((h, i) => (
            <div key={i} className="anim-pop flex gap-3 rounded-xl border border-line bg-surface p-3">
              <span className="chip shrink-0 !bg-xp-soft !text-xp">Pista {i + 1}</span>
              <MathText text={h} />
            </div>
          ))}
          {hints >= 3 && solutionSteps === 0 && !solved && (
            <button className="btn btn-secondary" onClick={revealSolution}>
              Ver solución paso a paso
            </button>
          )}
        </div>
      )}

      {/* ───── Explicación / solución ───── */}
      {!exam && !diagnostic && (showExplanation || solutionSteps > 0) && (
        <div className="anim-pop space-y-3 rounded-2xl border border-line bg-surface p-4">
          {showExplanation && (
            <>
              <p className="font-bold">¿Por qué?</p>
              <MathText text={exercise.explanation} />
              {exercise.visual && <ExerciseVisual visual={exercise.visual} />}
              {solutionSteps === 0 && (
                <button className="btn btn-secondary" onClick={revealSolution}>
                  Ver la resolución paso a paso
                </button>
              )}
            </>
          )}
          {solutionSteps > 0 && (
            <div>
              <p className="mb-2 font-bold">Resolución</p>
              <ol className="space-y-2">
                {exercise.solution.slice(0, solutionSteps).map((s, i) => (
                  <li key={i} className="anim-pop flex gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">{i + 1}</span>
                    <MathText text={asMath(s)} />
                  </li>
                ))}
              </ol>
              {solutionSteps < exercise.solution.length && (
                <button className="btn btn-ghost mt-2" onClick={() => setSolutionSteps((n) => n + 1)}>
                  Siguiente paso →
                </button>
              )}
              {solutionSteps >= exercise.solution.length && !solved && <p className="mt-2 text-sm text-muted">Ahora probá escribirlo vos. No suma XP, pero fija el procedimiento.</p>}
            </div>
          )}
          {exercise.kind === "trace" && (showExplanation || solutionSteps > 0) && <TraceReplay code={exercise.code} />}
        </div>
      )}

      {showTutor && !exam && !diagnostic && (
        <TutorPanel script={tutorScript} topicName={topic?.name} hasExercise onHint={nextHint} onSolve={revealSolution} onClose={() => setShowTutor(false)} />
      )}
    </div>
  );
}

/** Un paso de solución que es pura matemática se muestra con tipografía matemática. */
function asMath(s: string): string {
  if (s.includes("$") || /[a-záéíóúñ]{4,}/i.test(s)) return s;
  return `$${s}$`;
}

function TraceReplay({ code }: { code: string }) {
  const [open, setOpen] = useState(false);
  // Carga diferida para no ejecutar el intérprete hasta que se pida.
  const [Stepper, setStepper] = useState<null | typeof import("../code/CodeStepper").CodeStepper>(null);
  useEffect(() => {
    if (open && !Stepper) import("../code/CodeStepper").then((m) => setStepper(() => m.CodeStepper));
  }, [open, Stepper]);
  return open ? (
    Stepper ? <Stepper code={code} autoStart /> : null
  ) : (
    <button className="btn btn-secondary" onClick={() => setOpen(true)}>
      Ver la ejecución paso a paso
    </button>
  );
}
