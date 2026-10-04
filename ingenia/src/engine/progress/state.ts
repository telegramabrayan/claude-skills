/**
 * Estado persistente del estudiante. Es un único objeto serializable para
 * que hoy viva en localStorage y mañana en PostgreSQL/Supabase sin cambios
 * en la lógica (ver db/schema.sql: cada sección es una tabla).
 */
import type { CareerGoal, Difficulty, ErrorType, SkillId } from "../types";

export interface DayStats {
  xp: number;
  seconds: number;
  exercises: number;
  correct: number;
  lessons: number;
}

export interface TopicState {
  /** 0..1, media móvil ponderada por dificultad y ayuda usada. */
  mastery: number;
  attempts: number;
  correct: number;
  /** Dificultad adaptativa actual (1..6). */
  level: Difficulty;
  streak: number;
  wrongStreak: number;
  lastSeen: string | null; // YYYY-MM-DD
  /** Caja de repetición espaciada (Leitner). */
  box: number;
  due: string | null; // YYYY-MM-DD
}

export type StudyMode = "leccion" | "practica" | "repaso" | "desafio" | "examen" | "diagnostico" | "rapido" | "profundo" | "entrenamiento";

export interface Attempt {
  ts: number;
  exerciseId: string;
  topicId: string;
  correct: boolean;
  errorType?: ErrorType;
  hints: number;
  usedSolution: boolean;
  difficulty: Difficulty;
  mode: StudyMode;
}

export interface ExamRecord {
  id: string;
  title: string;
  ts: number;
  score: number; // 0..10
  correct: number;
  total: number;
  seconds: number;
  byTopic: Record<string, { correct: number; total: number }>;
  errors: Partial<Record<ErrorType, number>>;
}

export interface LessonState {
  status: "en-curso" | "completada";
  card: number;
  completedAt?: string;
}

export interface ProgressState {
  version: 1;
  profile: {
    name: string;
    goal: CareerGoal | null;
    onboarded: boolean;
    startMode: "diagnostico" | "cero" | null;
    createdAt: string;
  };
  settings: {
    theme: "system" | "light" | "dark";
    hearts: boolean;
    dailyMinutes: number;
  };
  xp: number;
  streak: { current: number; longest: number; lastDay: string | null };
  days: Record<string, DayStats>;
  lessons: Record<string, LessonState>;
  units: Record<string, string>; // unitId → fecha de completado
  topics: Record<string, TopicState>;
  attempts: Attempt[];
  diagnostic: { completedAt: string; skills: Partial<Record<SkillId, number>> } | null;
  route: string[];
  unlocked: string[]; // unidades desbloqueadas manualmente o por diagnóstico
  exams: ExamRecord[];
  achievements: Record<string, string>;
  missions: Record<string, string>; // clave de misión → fecha reclamada
  challengesWon: number;
}

export const MAX_ATTEMPTS = 3000;

export function initialState(): ProgressState {
  return {
    version: 1,
    profile: { name: "", goal: null, onboarded: false, startMode: null, createdAt: new Date().toISOString() },
    settings: { theme: "system", hearts: true, dailyMinutes: 15 },
    xp: 0,
    streak: { current: 0, longest: 0, lastDay: null },
    days: {},
    lessons: {},
    units: {},
    topics: {},
    attempts: [],
    diagnostic: null,
    route: [],
    unlocked: [],
    exams: [],
    achievements: {},
    missions: {},
    challengesWon: 0,
  };
}

export function newTopicState(level: Difficulty = 2): TopicState {
  return { mastery: 0, attempts: 0, correct: 0, level, streak: 0, wrongStreak: 0, lastSeen: null, box: 0, due: null };
}

/** Fusiona un estado cargado con los valores por defecto (migración tolerante a campos nuevos). */
export function hydrate(raw: unknown): ProgressState {
  const base = initialState();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<ProgressState>;
  return {
    ...base,
    ...r,
    profile: { ...base.profile, ...(r.profile ?? {}) },
    settings: { ...base.settings, ...(r.settings ?? {}) },
    streak: { ...base.streak, ...(r.streak ?? {}) },
    version: 1,
  };
}
