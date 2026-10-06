import type { BoardStep, ChoiceExercise, Difficulty, ErrorType, LessonCard, Widget } from "@/engine/types";

export const intro = (title: string, learn: string, why: string): LessonCard => ({ kind: "intro", title, learn, why });

export const explain = (title: string, body: string, opts: { widget?: Widget; tag?: "intuitivo" | "cotidiano" | "matematico" } = {}): LessonCard => ({
  kind: "explain",
  title,
  body,
  ...opts,
});

export const example = (title: string, problem: string, steps: string[], result: string): LessonCard => ({ kind: "example", title, problem, steps, result });

/** Ejercicio generado con semilla fija (siempre el mismo dentro de la lección). */
export const practice = (title: string, generator: string, difficulty: Difficulty, seed: number, guided = false): LessonCard => ({
  kind: "exercise",
  title,
  guided,
  exercise: { generator, difficulty, seed },
});

export const summary = (points: string[]): LessonCard => ({ kind: "summary", title: "Resumen", points });

interface QuizArgs {
  id: string;
  subjectId: string;
  topicId: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  hints: [string, string, string];
  /** Diagnóstico por opción incorrecta: índice → [tipo, mensaje]. */
  errors?: Record<number, [ErrorType, string]>;
  difficulty?: Difficulty;
}

/** Pregunta conceptual escrita a mano dentro de una lección. */
export const quiz = (title: string, a: QuizArgs, guided = false): LessonCard => {
  const ex: ChoiceExercise = {
    kind: "choice",
    id: a.id,
    subjectId: a.subjectId,
    topicId: a.topicId,
    difficulty: a.difficulty ?? 2,
    prompt: a.prompt,
    options: a.options,
    answer: a.answer,
    hints: a.hints,
    solution: [a.explanation],
    explanation: a.explanation,
    frequentErrors: Object.entries(a.errors ?? {}).map(([i, [type, message]]) => ({ match: Number(i), type, message })),
    prerequisites: [],
  };
  return { kind: "exercise", title, guided, exercise: ex };
};

/** Pizarra: un procedimiento renglón por renglón ({expr, note}). */
export const board = (title: string, steps: BoardStep[], intro?: string, outro?: string): LessonCard => ({
  kind: "board",
  title,
  steps,
  ...(intro ? { intro } : {}),
  ...(outro ? { outro } : {}),
});

/** Atajo para un renglón de pizarra. */
export const row = (expr: string, note?: string): BoardStep => (note ? { expr, note } : { expr });
