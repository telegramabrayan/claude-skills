import type { ChoiceExercise, Difficulty, ErrorType, ExerciseBase, FrequentError } from "../types";
import { fmt } from "../math/parser";
import type { Rng } from "./rng";

/** Número listo para mostrar dentro de una expresión: los negativos van entre paréntesis. */
export function par(n: number): string {
  return n < 0 ? `(${fmt(n)})` : fmt(n);
}

/** Término "±k" para escribir expresiones prolijas: sgn(5) = "+ 5", sgn(-3) = "− 3". */
export function sgn(n: number): string {
  return n < 0 ? `− ${fmt(-n)}` : `+ ${fmt(n)}`;
}

/** Término con variable con su signo: termX(1) = "+ x", termX(-3) = "− 3x". */
export function termX(n: number, v = "x"): string {
  if (n === 1) return `+ ${v}`;
  if (n === -1) return `− ${v}`;
  return `${sgn(n)}${v}`;
}

/** Coeficiente delante de una variable: 1 → "", -1 → "−", 3 → "3". */
export function coef(n: number): string {
  return n === 1 ? "" : n === -1 ? "−" : fmt(n);
}

export interface BaseArgs {
  gen: string;
  seed: number;
  difficulty: Difficulty;
  subjectId: string;
  topicId: string;
  unitId?: string;
  prompt: string;
  hints: [string, string, string];
  solution: string[];
  explanation: string;
  frequentErrors?: FrequentError[];
  prerequisites?: string[];
  formulaId?: string;
  visual?: ExerciseBase["visual"];
}

export function base(a: BaseArgs): ExerciseBase {
  return {
    id: `${a.gen}:${a.seed}:${a.difficulty}`,
    generator: a.gen,
    seed: a.seed,
    subjectId: a.subjectId,
    unitId: a.unitId,
    topicId: a.topicId,
    difficulty: a.difficulty,
    prompt: a.prompt,
    hints: a.hints,
    solution: a.solution,
    explanation: a.explanation,
    frequentErrors: a.frequentErrors ?? [],
    prerequisites: a.prerequisites ?? [],
    formulaId: a.formulaId,
    visual: a.visual,
  };
}

export interface Option {
  text: string;
  correct?: boolean;
  error?: { type: ErrorType; message: string };
}

/** Arma un ejercicio de opción múltiple barajando opciones y conservando el diagnóstico de cada distractor. */
export function choice(r: Rng, b: ExerciseBase, options: Option[]): ChoiceExercise {
  const seen = new Set<string>();
  const unique = options.filter((o) => {
    if (seen.has(o.text)) return false;
    seen.add(o.text);
    return true;
  });
  const shuffled = r.shuffle(unique);
  const answer = shuffled.findIndex((o) => o.correct);
  const frequentErrors: FrequentError[] = [...b.frequentErrors];
  shuffled.forEach((o, i) => {
    if (o.error) frequentErrors.push({ match: i, type: o.error.type, message: o.error.message });
  });
  return { ...b, kind: "choice", options: shuffled.map((o) => o.text), answer, frequentErrors };
}

/** Elige el rango de números según la dificultad. */
export function byDifficulty<T>(d: Difficulty, levels: [T, T, T, T, T, T]): T {
  return levels[d - 1];
}
