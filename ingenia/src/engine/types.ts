/**
 * Modelo de datos central de Ingenia.
 *
 * Todo el contenido (carreras, materias, lecciones, ejercicios, fórmulas) se
 * describe con estos tipos y vive en `src/content/`, separado de la interfaz.
 * Las mismas formas están pensadas para mapearse 1:1 a tablas de PostgreSQL
 * (ver `db/schema.sql`) cuando el contenido pase a una base de datos o a un CMS.
 */

// ───────────────────────── Currículo ─────────────────────────

export type CareerId = "industrial" | "informatica";
export type CareerGoal = CareerId | "ambas";

/** Qué tan confirmado está un dato académico contra la fuente oficial. */
export type VerificationStatus =
  | "verificado" // confirmado contra fuente oficial
  | "parcial" // confirmado en parte (p. ej. por fuentes secundarias)
  | "pendiente"; // estructura preparada, falta confirmar contra el plan oficial

export interface SourceRef {
  label: string;
  url?: string;
  note?: string;
}

export interface OfficialInfo {
  status: VerificationStatus;
  sources: SourceRef[];
  /** Fecha ISO de la última revisión manual del dato. */
  lastChecked: string;
  note?: string;
}

export type Cycle = "preparacion" | "cbc" | "segundo-ciclo";

export interface Career {
  id: CareerId;
  name: string;
  shortName: string;
  description: string;
  /** Materias del CBC que exige la carrera (ids de Subject). */
  cbcSubjects: string[];
  /** Materias del ciclo posterior (ids de Subject), en orden orientativo. */
  laterSubjects: string[];
  official: OfficialInfo;
}

export interface Unit {
  id: string;
  title: string;
  summary: string;
  /** Lecciones interactivas disponibles (ids). Una lección puede reutilizarse en varias unidades. */
  lessonIds: string[];
  /** Temas practicables (ids de Topic) asociados a la unidad. */
  topicIds: string[];
  /**
   * Estado interno del contenido de la unidad. "estructura" = el temario está
   * documentado pero todavía no hay lecciones interactivas. Nunca se rellena
   * con contenido inventado.
   */
  contentStatus: "completo" | "parcial" | "estructura";
}

export interface Subject {
  id: string;
  name: string;
  shortName: string;
  cycle: Cycle;
  careers: CareerId[] | "todas";
  icon: string;
  color: string; // token de color: "math" | "physics" | ...
  description: string;
  objectives: string[];
  units: Unit[];
  prerequisites: string[]; // ids de Subject
  bibliography: SourceRef[];
  official: OfficialInfo;
}

// ───────────────────────── Temas y dominio ─────────────────────────

/** Unidad mínima de dominio que se mide, se practica y se repasa. */
export interface Topic {
  id: string;
  name: string;
  subjectId: string;
  /** Habilidad del diagnóstico a la que pertenece. */
  skill: SkillId;
  /** Generadores de ejercicios de este tema. */
  generators: string[];
  /** Lección donde se enseña. */
  lessonId?: string;
  prerequisites: string[]; // ids de Topic
}

export type SkillId =
  | "aritmetica"
  | "algebra"
  | "funciones"
  | "graficos"
  | "vectores"
  | "fisica"
  | "logica"
  | "computacional";

// ───────────────────────── Errores ─────────────────────────

export type ErrorType =
  | "signos"
  | "calculo"
  | "conceptual"
  | "despeje"
  | "unidades"
  | "velocidad-aceleracion"
  | "vectores"
  | "derivacion"
  | "interpretacion"
  | "jerarquia"
  | "fracciones"
  | "potencias"
  | "formula"
  | "sintaxis"
  | "logica"
  | "algoritmico";

/** Error frecuente anticipado: si la respuesta del alumno coincide, se explica el error específico. */
export interface FrequentError {
  /** Valor numérico, expresión o índice de opción que delata el error. */
  match: number | string;
  type: ErrorType;
  message: string;
}

// ───────────────────────── Ejercicios ─────────────────────────

export type Difficulty = 1 | 2 | 3 | 4 | 5 | 6;

export interface ExerciseBase {
  id: string;
  subjectId: string;
  unitId?: string;
  topicId: string;
  difficulty: Difficulty;
  /** Enunciado. Admite el mini-markup de MathText: `$...$` para matemática, `**negrita**`. */
  prompt: string;
  /** Exactamente tres niveles de pista, de menor a mayor ayuda. */
  hints: [string, string, string];
  /** Resolución paso a paso (se revela de a un paso). */
  solution: string[];
  /** Explicación conceptual breve de por qué se resuelve así. */
  explanation: string;
  frequentErrors: FrequentError[];
  prerequisites: string[];
  /** Fórmula utilizada (id de Formula), si aplica. */
  formulaId?: string;
  /** Gráfico opcional asociado. */
  visual?: Visual;
  /** Generador que lo creó (permite pedir "algo parecido"). */
  generator?: string;
  seed?: number;
}

export interface ChoiceExercise extends ExerciseBase {
  kind: "choice";
  options: string[];
  answer: number; // índice correcto
}

export interface NumericExercise extends ExerciseBase {
  kind: "numeric";
  answer: number;
  /** Tolerancia absoluta. Si falta se usa una relativa de 1e-6. */
  tolerance?: number;
  unit?: string;
}

export interface ExpressionExercise extends ExerciseBase {
  kind: "expression";
  /** Expresión correcta; se compara por equivalencia numérica. */
  answer: string;
  variables: string[];
  /** Rango de muestreo para comparar expresiones. */
  sampleRange?: [number, number];
}

/** Ecuación lineal en x resuelta paso a paso; se valida cada paso. */
export interface StepsExercise extends ExerciseBase {
  kind: "steps";
  equation: string;
  answer: number;
  /** Procedimiento esperado (referencia, no se exige que coincida textualmente). */
  expectedSteps: string[];
}

/** Seguimiento de código: predecir el valor final de variables. */
export interface TraceExercise extends ExerciseBase {
  kind: "trace";
  code: string;
  ask: string[]; // nombres de variables a predecir
  answer: Record<string, number | string | boolean>;
}

export type Exercise =
  | ChoiceExercise
  | NumericExercise
  | ExpressionExercise
  | StepsExercise
  | TraceExercise;

export type Visual =
  | { type: "plot"; functions: string[]; xRange?: [number, number]; yRange?: [number, number]; points?: [number, number][] }
  | { type: "vector"; vectors: { x: number; y: number; label?: string }[] }
  | { type: "numberline"; min: number; max: number; marks?: number[] };

/** Un generador produce variantes infinitas de un mismo concepto y siempre conoce la solución. */
export interface Generator {
  id: string;
  topicId: string;
  description: string;
  generate(seed: number, difficulty: Difficulty): Exercise;
}

// ───────────────────────── Evaluación ─────────────────────────

export interface StepFeedback {
  index: number;
  /** ok = equivalente a la ecuación original; arrastre = sigue bien desde un paso equivocado. */
  status: "ok" | "error" | "arrastre" | "invalido";
  message?: string;
}

export interface EvaluationResult {
  correct: boolean;
  /** Mensaje principal: nunca un "Incorrecto" seco. */
  message: string;
  errorType?: ErrorType;
  /** Para ejercicios por pasos: diagnóstico de cada paso. */
  steps?: StepFeedback[];
  /** Primer paso con error (índice), si se detectó. */
  firstWrongStep?: number;
  /** Explicación del error específico, si se pudo diagnosticar. */
  diagnosis?: string;
  /** La respuesta no se pudo interpretar (no cuenta como intento fallido). */
  invalidInput?: boolean;
}

// ───────────────────────── Lecciones ─────────────────────────

/** Widgets interactivos que puede incluir una tarjeta de lección. */
export type Widget =
  | { type: "numberline"; min: number; max: number; start: number; step?: number }
  | { type: "fraction-bars"; a: number; b: number; c: number; d: number }
  | { type: "balance"; equation: string }
  | { type: "plot"; mode: "free" | "linear"; initial?: string }
  | { type: "vector"; x: number; y: number; showSum?: boolean }
  | { type: "kinematics"; x0: number; v0: number; a: number }
  | { type: "code"; code: string }
  | { type: "percent"; base: number; percent: number }
  | { type: "power"; base: number; exponent: number }
  | { type: "units"; value: number };

export type LessonCard =
  | { kind: "intro"; title: string; learn: string; why: string }
  | { kind: "explain"; title: string; body: string; widget?: Widget; tag?: "intuitivo" | "cotidiano" | "matematico" }
  | { kind: "example"; title: string; problem: string; steps: string[]; result: string }
  | { kind: "exercise"; title: string; exercise: Exercise | { generator: string; difficulty: Difficulty; seed: number }; guided?: boolean }
  | { kind: "summary"; title: string; points: string[] };

/** Explicaciones del profesor para un concepto, en distintos registros. */
export interface TutorScript {
  normal: string;
  simple: string;
  nino: string; // "como si tuviera 12 años"
  ejemplo: string;
  visual?: Widget;
  visualText?: string;
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  subjectId: string;
  topicIds: string[];
  estimatedMinutes: number;
  cards: LessonCard[];
  tutor: TutorScript;
  /** Temas que conviene repasar antes. */
  prerequisites: string[];
}

// ───────────────────────── Referencia ─────────────────────────

export interface Formula {
  id: string;
  name: string;
  expression: string;
  subjectId: string;
  meaning: string;
  whenToUse: string;
  variables: { symbol: string; meaning: string; unit?: string }[];
  example: string;
  commonErrors: string[];
  tags: string[];
}

export interface GlossaryEntry {
  symbol: string;
  name: string;
  meaning: string;
  example?: string;
  aliases?: string[];
}
