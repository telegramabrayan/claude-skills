"use client";
/**
 * Reproductor de ejercicios. Flujo pedagógico:
 *   intentar → corrección que explica el error (nunca un "incorrecto" seco)
 *   → [Intentar nuevamente] [Ver una pista] [Ver explicación] [Practicar algo parecido]
 * Las pistas se revelan de a una (3 niveles) y recién después la solución,
 * también de a un paso. Solo el primer intento cuenta para XP y dominio.
 */
import { useSubjectTheme } from "@/lib/subjectTheme";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Difficulty, EvaluationResult, Exercise } from "@/engine/types";
import { evaluateAnswer, type Answer } from "@/engine/evaluation/evaluate";
import { newSeed } from "@/engine/generators/rng";
import { getGenerator } from "@/engine/generators";
import type { StudyMode } from "@/engine/progress/state";
import { XP } from "@/engine/progress/rules";
import { getTopic, ERROR_LABELS } from "@/content/topics";
import { getLesson } from "@/content/lessons";
import { actions, store, useProgress } from "@/lib/store";
import { play } from "@/lib/sound";
import { exerciseFor, prerequisiteGap } from "@/lib/learning";
import { correctMessage as guideCorrect, wrongMessage as guideWrong } from "@/lib/guide";
import { GuideSay, Nodo } from "../guide/Nodo";
import { BuildInput, FillInput, FindErrorInput, GraphInput, MatchInput, OrderInput, PlotOption, shuffledOrder } from "./Inputs";
import { Scene } from "./Scene";
import { MathText } from "../math/MathText";
import { ExerciseVisual } from "../math/Visuals";
import { Whiteboard } from "../board/Whiteboard";
import { LessonExplain } from "../tutor/ExplainPanel";
import { ErrorComparison } from "./ErrorComparison";
import { openTutor, setStudyContext } from "@/lib/studyContext";
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
  /** Desafío final: sin pistas, sin profesor y sin explicación automática. */
  noHelp?: boolean;
}

const DIFF_LABEL: Record<Difficulty, string> = { 1: "Muy fácil", 2: "Fácil", 3: "Normal", 4: "Difícil", 5: "Nivel parcial", 6: "Desafío" };

export function ExercisePlayer({ exercise: initial, mode, onDone, exam, diagnostic, record = true, guided, continueLabel = "Continuar", onWrong, noHelp }: Props) {
  const [exercise, setExercise] = useState(initial);
  useEffect(() => setExercise(initial), [initial]);
  useSubjectTheme(exercise.subjectId);

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
  const [order, setOrder] = useState<string[]>(() => (initial.kind === "order" ? shuffledOrder(initial.items, initial.seed ?? 1, initial.answer) : []));
  const [fill, setFill] = useState<string[]>([]);
  const [build, setBuild] = useState<number[]>([]);
  const [graphX, setGraphX] = useState<number | null>(null);
  const [errIdx, setErrIdx] = useState<number | null>(null);
  const [example, setExample] = useState<Exercise | null>(null);
  const [match, setMatch] = useState<Record<string, string>>({});
  const [reviewTopic, setReviewTopic] = useState<string | null>(null);
  const [levelChange, setLevelChange] = useState(0);
  const levelUp = levelChange > 0;
  const [concept, setConcept] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const progress = useProgress();
  const helpless = noHelp || exam || diagnostic;
  const savedLater = progress.later.some((x) => x.id === exercise.id);

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
    setOrder(exercise.kind === "order" ? shuffledOrder(exercise.items, exercise.seed ?? 1, exercise.answer) : []);
    setFill([]);
    setBuild([]);
    setGraphX(null);
    setErrIdx(null);
    setExample(null);
    setMatch({});
    setReviewTopic(null);
    setLevelChange(0);
    setConcept(false);
    setWrongCount(0);
    // El profesor sabe qué ejercicio está en pantalla.
    setStudyContext({ exercise, topicId: exercise.topicId, answer: undefined, result: undefined });
  }, [exercise, guided]);

  const topic = getTopic(exercise.topicId);
  const lessonForTopic = topic?.lessonId ? getLesson(topic.lessonId) : undefined;
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
      case "order":
        return { kind: "order", order };
      case "match":
        return { kind: "match", pairs: match };
      case "fill":
        return { kind: "fill", values: fill };
      case "build":
        return { kind: "build", tokens: build.map((i) => exercise.tokens[i]) };
      case "graph":
        return { kind: "graph", x: graphX ?? NaN, y: 0 };
      case "find-error":
        return { kind: "find-error", index: errIdx ?? -1 };
    }
  };

  const canSubmit = useMemo(() => {
    switch (exercise.kind) {
      case "choice":
        return choiceIdx !== null;
      case "trace":
        return exercise.ask.every((k) => (traceVals[k] ?? "").trim());
      case "order":
        return order.length === exercise.items.length;
      case "match":
        return exercise.pairs.every(([l]) => match[l]);
      case "fill":
        return fill.filter(Boolean).length === exercise.answer.length;
      case "build":
        return build.length > 0;
      case "graph":
        return graphX !== null;
      case "find-error":
        return errIdx !== null;
      default:
        return text.trim().length > 0;
    }
  }, [exercise, choiceIdx, text, traceVals, order, match, fill, build, graphX, errIdx]);

  const submit = (gaveUp = false) => {
    const r: EvaluationResult = gaveUp
      ? { correct: false, message: "Está bien no saberlo: para eso es el diagnóstico." }
      : evaluateAnswer(exercise, answer());
    setResult(r);
    if (r.invalidInput) return;
    if (!r.correct) {
      setWrongCount((n) => n + 1);
      // Si vuelve a fallar, la ayuda sube sola un escalón (nunca salta a la solución).
      if (wrongCount >= 1 && !helpless && hints < 3) setHints((h) => Math.min(3, h + 1));
    }
    setStudyContext({ answer: gaveUp ? "(no sabe)" : answerText(), result: { correct: r.correct, message: r.message, diagnosis: r.diagnosis, errorType: r.errorType } });
    if (!exam && !diagnostic) play(r.correct ? "correct" : "wrong");
    if (!r.correct) {
      setShake(true);
      setTimeout(() => setShake(false), 450);
      onWrong?.();
    }
    if (!recorded) {
      setRecorded(true);
      setFirstCorrect(r.correct);
      if (record) {
        const out = actions.recordAttempt({
          exerciseId: exercise.id,
          topicId: exercise.topicId,
          correct: r.correct,
          errorType: r.errorType,
          hints: Math.max(0, hints - (guided ? 1 : 0)),
          usedSolution,
          difficulty: exercise.difficulty,
          mode,
        });
        setLevelChange(out.levelChange);
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

  /** Respuesta del alumno en texto, para el profesor. */
  const answerText = (): string => {
    switch (exercise.kind) {
      case "choice":
        return choiceIdx === null ? "" : `opción ${String.fromCharCode(65 + choiceIdx)}: ${exercise.options[choiceIdx]}`;
      case "steps":
        return [...steps.filter((x) => x.trim()), `x = ${text}`].join(" ; ");
      case "trace":
        return Object.entries(traceVals).map(([k, v]) => `${k} = ${v}`).join(", ");
      case "order":
        return order.join(" → ");
      case "match":
        return Object.entries(match).map(([a, b]) => `${a} ↔ ${b}`).join(", ");
      case "fill":
        return fill.join(" | ");
      case "build":
        return build.map((i) => exercise.tokens[i]).join(" ");
      case "graph":
        return graphX === null ? "" : `x ≈ ${graphX}`;
      case "find-error":
        return errIdx === null ? "" : `renglón ${errIdx + 1}`;
      default:
        return text;
    }
  };

  /**
   * Ayuda escalonada: pista → pista más clara → el concepto relacionado →
   * recién entonces la solución completa.
   */
  // Escalera: Pista 1 (orientación) → Pista 2 (qué concepto usar) → Pista 3 (el primer paso) → ayuda completa.
  const helpStage: "hint" | "solution" | "done" = hints < 3 ? "hint" : solutionSteps === 0 ? "solution" : "done";
  const helpLabel = { hint: ["💡 Dame una pista", "💡 Otra pista: ¿qué concepto uso?", "💡 Mostrame el primer paso"][hints], solution: "🧑‍🏫 Ayuda completa paso a paso", done: "" }[helpStage];
  const moreHelp = () => {
    if (helpStage === "hint") setHints((h) => h + 1);
    else if (helpStage === "solution") revealSolution();
  };
  const hintText = (i: number) =>
    i === 0 ? exercise.hints[0] : i === 1 ? `${exercise.hints[1]}${exercise.hints[2] ? `\n\n**Concepto:** ${exercise.hints[2]}` : ""}` : `**Primer paso:** ${exercise.solution[0] ?? exercise.hints[2]}`;
  const showExample = () => {
    if (exercise.generator) setExample(getGenerator(exercise.generator).generate(newSeed(), exercise.difficulty));
    else setShowExplanation(true);
  };
  const gameMode = (progress.settings.mode ?? "juego") === "juego";
  const sceneState: "idle" | "win" | "try" = solved ? "win" : result && !result.correct && !result.invalidInput ? "try" : "idle";
  const correctTitle = ["✨ ¡Excelente!", "🎯 ¡Exacto!", "🙌 ¡Muy bien!", "⚡ ¡Impecable!", "🧠 ¡Bien razonado!"][(exercise.seed ?? 0) % 5];
  const shortOptions = exercise.kind === "choice" && exercise.display !== "plot" && exercise.options.every((o) => o.replace(/\$/g, "").length <= 14);
  const xpGain = usedSolution ? 0 : hints > (guided ? 1 : 0) ? XP.correctWithHelp : XP.correct;

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
  const gap = result && !result.correct && !helpless ? prerequisiteGap(store.getState(), exercise, result.errorType) : null;
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
        {!helpless && record && (
          <button
            type="button"
            onClick={() => actions.toggleLater({ id: exercise.id, exercise, topicId: exercise.topicId })}
            className={`chip ml-auto ${savedLater ? "!bg-primary-soft !text-primary" : ""}`}
            aria-pressed={savedLater}
          >
            🔖 {savedLater ? "Para repasar" : "Repasar después"}
          </button>
        )}
      </div>

      {/* ───── Escena (sólo cuando aporta) ───── */}
      {exercise.scene && gameMode && !exam && <Scene kind={exercise.scene} state={sceneState} caption={exercise.context} />}

      {/* ───── Tarjeta de pregunta ───── */}
      <div className="q-card anim-rise p-4 sm:p-5">
        {exercise.context && (
          <div className="mb-3 flex items-center gap-2">
            <Nodo mood={solved ? "celebrate" : result && !result.correct ? "encourage" : "thinking"} size={40} />
            <p className="text-sm font-bold text-muted">{exercise.context}</p>
          </div>
        )}
        <div className="text-lg font-semibold sm:text-xl">
          <MathText text={exercise.prompt} />
        </div>
      </div>

      {/* ───── Entrada ───── */}
      <div className={shake ? "anim-shake" : ""}>
        {exercise.kind === "choice" && (
          <div className={`grid gap-2.5 ${exercise.display === "plot" || shortOptions ? "grid-cols-2" : ""}`} role="radiogroup" aria-label="Opciones">
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
                  className={`tile min-w-0 text-left ${shortOptions ? "!min-h-16 justify-center text-center !text-xl" : ""} ${showRight ? "is-correct" : showWrong ? "is-wrong" : ""}`}
                >
                  {exercise.display === "plot" ? (
                    <PlotOption expr={o} label={`Gráfico ${String.fromCharCode(65 + i)}`} />
                  ) : (
                    <>
                      {!shortOptions && <span className="tile-key">{String.fromCharCode(65 + i)}</span>}
                      <span className="min-w-0 flex-1 overflow-x-auto">{exercise.display === "steps" ? <span className="text-sm">Paso {i + 1}: <MathText text={o} block={false} /></span> : <MathText text={o} block={false} />}</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {(exercise.kind === "numeric" || exercise.kind === "expression") && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {exercise.kind === "expression" && <span className="math shrink-0 text-xl">{exercise.prompt.match(/despejá \*\*(\w+)\*\*/)?.[1] ?? "="} =</span>}
              <input
                ref={(el) => {
                  if (el && !activeInput.current) activeInput.current = el;
                }}
                onFocus={(e) => (activeInput.current = e.currentTarget)}
                className={`input !min-h-14 !rounded-2xl !border-2 font-mono !text-xl ${solved ? "!border-success !bg-success-soft" : ""}`}
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
              {exercise.kind === "numeric" && exercise.unit && <span className="shrink-0 text-lg font-bold text-muted">{exercise.unit}</span>}
            </div>
            {!finished && <SymbolBar onInsert={insert} kind={exercise.kind} />}
          </div>
        )}

        {exercise.kind === "steps" && (
          <div className="board space-y-2 rounded-2xl p-3 sm:p-4">
            {!diagnostic && !exam && <p className="text-sm font-semibold text-[color:var(--board-muted)]">Escribí tu procedimiento en la pizarra, un paso por renglón (por ejemplo «2x = 10»). Con los pasos te digo exactamente dónde está el error.</p>}
            {!diagnostic &&
              !exam &&
              steps.map((st0, i) => {
                const fb = result?.steps?.find((f) => f.index === i);
                const st = st0.trim() ? fb?.status : undefined;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-6 shrink-0 text-right text-sm font-black text-[color:var(--board-muted)]">{i + 1}</span>
                    <input
                      onFocus={(e) => (activeInput.current = e.currentTarget)}
                      className={`input !rounded-xl !border-2 font-mono !text-lg ${st === "error" || st === "invalido" ? "!border-warn" : st === "ok" ? "!border-success" : st === "arrastre" ? "!border-warn" : ""}`}
                      value={st0}
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
                      placeholder={i === 0 ? "Primer paso" : ""}
                      aria-label={`Paso ${i + 1}`}
                      aria-invalid={st === "error" || st === "invalido"}
                    />
                    <span className="w-6 shrink-0 text-center font-black" aria-hidden>
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
              <span className="math w-auto shrink-0 text-xl font-bold">x =</span>
              <input
                onFocus={(e) => (activeInput.current = e.currentTarget)}
                className={`input !min-h-12 !rounded-xl !border-2 font-mono !text-xl ${solved ? "!border-success !bg-success-soft" : ""}`}
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
            </div>
            {!finished && <SymbolBar onInsert={insert} kind="steps" />}
          </div>
        )}

        {exercise.kind === "order" && (
          <OrderInput
            value={order}
            disabled={finished}
            status={result && !result.invalidInput && !exam ? (i) => (order[i] === exercise.answer[i] ? "ok" : result.correct ? "ok" : "bad") : undefined}
            onChange={(v) => {
              setOrder(v);
              if (result && !result.correct) setResult(null);
            }}
          />
        )}

        {exercise.kind === "match" && (
          <MatchInput
            pairs={exercise.pairs}
            value={match}
            seed={exercise.seed ?? 3}
            disabled={finished}
            wrong={result && !result.correct && !result.invalidInput && !exam ? new Set(exercise.pairs.filter(([l, r]) => match[l] !== r).map(([l]) => l)) : undefined}
            onChange={(v) => {
              setMatch(v);
              if (result && !result.correct) setResult(null);
            }}
          />
        )}

        {exercise.kind === "fill" && (
          <FillInput
            template={exercise.template}
            tokens={exercise.tokens}
            value={fill}
            disabled={finished}
            wrongSlot={result && !result.correct && !result.invalidInput && !exam ? exercise.answer.findIndex((a, i) => fill[i] !== a) : undefined}
            onChange={(v) => {
              setFill(v);
              if (result && !result.correct) setResult(null);
            }}
          />
        )}

        {exercise.kind === "build" && (
          <BuildInput
            tokens={exercise.tokens}
            lead={exercise.lead}
            value={build}
            disabled={finished}
            onChange={(v) => {
              setBuild(v);
              if (result && !result.correct) setResult(null);
            }}
          />
        )}

        {exercise.kind === "graph" && (
          <GraphInput
            expr={exercise.expr}
            mode={exercise.mode}
            x={exercise.x}
            y={exercise.y}
            value={graphX}
            disabled={finished}
            reveal={finished && !exam ? exercise.target : undefined}
            onChange={(v) => {
              setGraphX(v);
              if (result && !result.correct) setResult(null);
            }}
          />
        )}

        {exercise.kind === "find-error" && (
          <FindErrorInput
            steps={exercise.steps}
            value={errIdx}
            disabled={finished}
            wrong={finished && !exam ? exercise.wrong : undefined}
            fix={exercise.fix}
            onChange={(i) => {
              setErrIdx(i);
              if (result && !result.correct) setResult(null);
            }}
          />
        )}

        {exercise.kind === "trace" && (
          <div className="space-y-3">
            <pre className="overflow-x-auto rounded-2xl border-2 border-line bg-surface-2 p-3 font-mono text-sm leading-6">
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
                    className="input !rounded-xl !border-2 font-mono"
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
        <p className="rounded-xl bg-warn-soft p-3 text-sm font-semibold" role="status">
          {result.message}
        </p>
      )}

      {/* ───── Pistas (escalera) ───── */}
      {!helpless && hints > 0 && (
        <div className="space-y-2">
          {Array.from({ length: hints }, (_, i) => (
            <div key={i} className="anim-pop flex gap-3 rounded-2xl border-2 border-xp/30 bg-xp-soft/60 p-3">
              <span className="chip h-fit shrink-0 !bg-xp-soft !text-xp">💡 Pista {i + 1}</span>
              <div className="min-w-0 flex-1">
                <MathText text={hintText(i)} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ───── Barra de acción ───── */}
      {!finished && !(result && !result.correct && !result.invalidInput && !exam) && (
        <div className="action-bar space-y-2">
          <button className="btn-3d is-block text-lg tracking-wide" disabled={!canSubmit} onClick={() => submit()}>
            {exam ? "RESPONDER" : "COMPROBAR"}
          </button>
          <div className="flex flex-wrap items-center justify-center gap-1 pr-14 lg:pr-0">
            {diagnostic && (
              <button className="btn btn-ghost" onClick={() => submit(true)}>
                No sé
              </button>
            )}
            {!helpless && (
              <>
                {helpStage !== "done" && (
                  <button className="btn btn-ghost !min-h-10 text-sm font-bold" onClick={moreHelp}>
                    {helpLabel}
                  </button>
                )}
                <button className="btn btn-ghost !min-h-10 text-sm font-bold" onClick={() => openTutor()}>
                  <Icon name="chat" size={18} /> Profesor
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ───── Desafío: corrección breve, sin ayudas ───── */}
      {result && !result.invalidInput && noHelp && !exam && !diagnostic && (
        <div className={`feedback anim-pop flex flex-wrap items-center justify-between gap-3 ${result.correct ? "is-ok" : "is-almost"}`} role="status" aria-live="polite">
          <p className="font-black">{result.correct ? correctTitle : "Esta no. Perdés una vida, pero seguimos."}</p>
          <button className={`btn-3d ${result.correct ? "is-success" : ""}`} autoFocus onClick={() => onDone?.({ correct: result.correct, firstTry: firstCorrect === true, errorType: result.errorType, exercise })}>
            {continueLabel} <Icon name="arrowRight" size={18} />
          </button>
        </div>
      )}

      {/* ───── Correcto ───── */}
      {result && result.correct && !helpless && (
        <div className="feedback is-ok anim-rise" role="status" aria-live="polite">
          <div className="flex items-center gap-3">
            {gameMode && <Nodo mood="celebrate" size={56} />}
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 text-xl font-black text-success">
                {firstCorrect === false ? "✅ ¡Bien, lo corregiste!" : correctTitle}
                {firstCorrect && record && xpGain > 0 && <span className="xp-pop rounded-full bg-xp px-2.5 py-0.5 text-sm text-white">+{xpGain} XP</span>}
              </p>
              <p className="text-sm font-semibold">{levelUp ? "Perfecto. Ahora aumentemos un poco la dificultad." : guideCorrect(exercise.seed ?? 0, false)}</p>
            </div>
          </div>
          {exercise.explanation && <p className="mt-2 text-sm text-muted">{exercise.explanation}</p>}
          {onDone && (
            <button className="btn-3d is-success is-block mt-4 text-lg" onClick={() => onDone({ correct: true, firstTry: firstCorrect === true, exercise })} autoFocus>
              {continueLabel.toUpperCase()} <Icon name="arrowRight" size={18} />
            </button>
          )}
        </div>
      )}

      {/* ───── Casi: qué pasó y cómo seguir ───── */}
      {result && !result.correct && !result.invalidInput && !helpless && (
        <div className="feedback is-almost anim-rise" role="status" aria-live="polite">
          <div className="flex items-start gap-3">
            {gameMode && <Nodo mood="encourage" size={52} />}
            <div className="min-w-0 flex-1 space-y-1.5">
              <p className="text-lg font-black">Casi. Revisemos este paso.</p>
              <p className="font-semibold">{result.message}</p>
              {!result.diagnosis && <p className="text-sm">{guideWrong(exercise.seed ?? 0, false)}</p>}
              {result.diagnosis && !result.comparison && <MathText text={result.diagnosis} />}
              {levelChange < 0 && <p className="rounded-lg bg-surface/70 p-2 text-sm">Este paso todavía genera dificultades. Los próximos ejercicios van a ser un poco más sencillos para afianzarlo.</p>}
              {result.errorType && <p className="text-xs text-muted">Tipo de error: {ERROR_LABELS[result.errorType]} (lo tengo en cuenta para tus próximas prácticas)</p>}
            </div>
          </div>
          {result.comparison && !reviewTopic && (
            <ErrorComparison comparison={result.comparison} step={result.firstWrongStep} problem={result.diagnosis} onSimilar={exercise.generator ? similar : undefined} onRetry={retry} />
          )}
          {gap && !reviewTopic && (
            <div className="mt-4 rounded-xl border border-line bg-surface p-3">
              <GuideSay mood="thinking" size={40}>
                El problema parece estar en <b>{getTopic(gap)?.name.toLowerCase()}</b>, no en {topic?.name.toLowerCase() ?? "este tema"}.
              </GuideSay>
              <button className="btn-3d is-secondary mt-3" onClick={() => setReviewTopic(gap)}>
                Repasar {getTopic(gap)?.name.toLowerCase()} · 5 min
              </button>
            </div>
          )}
          {reviewTopic && (
            <QuickReview
              topicId={reviewTopic}
              onDone={() => {
                setReviewTopic(null);
                retry();
              }}
            />
          )}
          {!reviewTopic && (
            <div className="mt-4 space-y-2">
              <button className="btn-3d is-block text-lg" onClick={retry} autoFocus>
                ✏️ INTENTAR NUEVAMENTE
              </button>
              <div className="grid grid-cols-2 gap-2">
                {helpStage !== "done" && (
                  <button className="help-btn" onClick={moreHelp}>
                    {helpLabel}
                  </button>
                )}
                <button className="help-btn" onClick={() => setConcept(true)} aria-expanded={concept}>
                  📖 Explicámelo
                </button>
                <button className="help-btn" onClick={showExample}>
                  ▶ Ver un ejemplo
                </button>
                <button className="help-btn" onClick={() => openTutor("No entendí este ejercicio. Explicámelo de otra manera, con un ejemplo cotidiano y sin darme la respuesta.")}>
                  🧠 De otra manera
                </button>
                {exercise.generator && (
                  <button className="help-btn" onClick={similar}>
                    🔁 Uno parecido
                  </button>
                )}
                {wrongCount >= 2 && !showExplanation && (
                  <button className="help-btn" onClick={() => setShowExplanation(true)}>
                    ❓ ¿Por qué?
                  </button>
                )}
              </div>
              <button className="btn btn-ghost w-full text-sm" onClick={() => onDone?.({ correct: false, firstTry: false, errorType: result.errorType, exercise })}>
                Seguir sin resolverlo
              </button>
            </div>
          )}
        </div>
      )}

      {/* ───── Explicámelo: el concepto ───── */}
      {!helpless && concept && (
        <div className="anim-pop space-y-3">
          {lessonForTopic ? <LessonExplain lesson={lessonForTopic} initial="simple" onClose={() => setConcept(false)} /> : <MathText text={exercise.explanation} />}
        </div>
      )}

      {/* ───── Ejemplo resuelto parecido ───── */}
      {!helpless && example && (
        <div className="anim-pop space-y-2 rounded-2xl border-2 border-line bg-surface p-4">
          <p className="text-sm font-black uppercase tracking-wide text-primary">▶ Ejemplo resuelto parecido</p>
          <MathText text={example.prompt} />
          <Whiteboard steps={example.solution.map((x) => ({ expr: x }))} title="Así se resuelve" autoPlay />
          <p className="text-sm text-muted">Ahora probá el tuyo con el mismo procedimiento.</p>
        </div>
      )}

      {/* ───── Explicación / ayuda completa ───── */}
      {!helpless && (showExplanation || solutionSteps > 0) && (
        <div className="anim-pop space-y-3 rounded-2xl border-2 border-line bg-surface p-4">
          {showExplanation && (
            <>
              <p className="font-black">¿Por qué?</p>
              <MathText text={exercise.explanation} />
              {exercise.visual && <ExerciseVisual visual={exercise.visual} />}
              {solutionSteps === 0 && (
                <button className="btn-3d is-secondary" onClick={revealSolution}>
                  Ver la resolución paso a paso
                </button>
              )}
            </>
          )}
          {solutionSteps > 0 && (
            <div>
              <Whiteboard steps={exercise.solution.map((x) => ({ expr: x }))} title="🧑‍🏫 Ayuda completa" />
              {!solved && <p className="mt-2 text-sm text-muted">Ahora probá escribirlo vos. No suma XP, pero fija el procedimiento.</p>}
            </div>
          )}
          {exercise.kind === "trace" && (showExplanation || solutionSteps > 0) && <TraceReplay code={exercise.code} />}
        </div>
      )}
    </div>
  );
}

/** Repaso corto de un prerequisito (4 ejercicios) y vuelta al ejercicio original. */
export function QuickReview({ topicId, onDone }: { topicId: string; onDone: () => void }) {
  const [items] = useState(() => Array.from({ length: 4 }, () => exerciseFor(store.getState(), topicId, -1)));
  const [i, setI] = useState(0);
  const name = getTopic(topicId)?.name ?? topicId;
  if (i >= items.length) {
    return (
      <div className="anim-pop mt-4 rounded-xl border border-success/40 bg-surface p-4">
        <GuideSay mood="happy" size={40}>Listo. Volvamos al ejercicio.</GuideSay>
        <button className="btn btn-primary mt-3" onClick={onDone} autoFocus>
          Volver al ejercicio <Icon name="arrowRight" size={18} />
        </button>
      </div>
    );
  }
  return (
    <div className="mt-4 space-y-3 rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold">Repaso rápido: {name}</span>
        <span className="text-muted">
          {i + 1}/{items.length}
        </span>
      </div>
      <ExercisePlayer key={items[i].id + i} exercise={items[i]} mode="repaso" onDone={() => setI((n) => n + 1)} continueLabel="Siguiente" />
      <button className="btn btn-ghost !min-h-9 text-sm" onClick={onDone}>
        Saltar repaso
      </button>
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
