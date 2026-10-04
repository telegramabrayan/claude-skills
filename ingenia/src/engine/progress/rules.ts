/**
 * Reglas de juego: XP, niveles, racha, dominio, dificultad adaptativa y
 * repetición espaciada. Todo es puro (estado → estado) para poder testearlo
 * y moverlo al servidor si algún día hace falta.
 */
import type { Difficulty, ErrorType } from "../types";
import { addDays, dayKey, daysBetween } from "./dates";
import { MAX_ATTEMPTS, newTopicState, type Attempt, type DayStats, type ProgressState, type TopicState } from "./state";

export const XP = {
  correct: 10,
  correctWithHelp: 5,
  lesson: 25,
  unit: 50,
  challenge: 100,
  /** Bonus por racha en la primera actividad del día: 5 XP por día de racha, hasta 50. */
  streakPerDay: 5,
  streakMax: 50,
};

export const MASTERED = 0.85;
const SR_LADDER = [1, 2, 4, 8, 16, 32]; // días

// ───────────────────────── Niveles ─────────────────────────

/** XP necesaria para pasar del nivel n al n+1. */
export function xpForNext(level: number): number {
  return 100 + 50 * (level - 1);
}

export function levelInfo(xp: number): { level: number; into: number; needed: number } {
  let level = 1;
  let rest = xp;
  while (rest >= xpForNext(level)) {
    rest -= xpForNext(level);
    level++;
  }
  return { level, into: rest, needed: xpForNext(level) };
}

// ───────────────────────── Actividad diaria ─────────────────────────

function emptyDay(): DayStats {
  return { xp: 0, seconds: 0, exercises: 0, correct: 0, lessons: 0 };
}

function withDay(s: ProgressState, today: string, patch: (d: DayStats) => DayStats): ProgressState {
  return { ...s, days: { ...s.days, [today]: patch(s.days[today] ?? emptyDay()) } };
}

/** Marca actividad de hoy, actualiza la racha y devuelve el bonus de racha si es la primera del día. */
function touchStreak(s: ProgressState, today: string): { state: ProgressState; bonus: number } {
  const last = s.streak.lastDay;
  if (last === today) return { state: s, bonus: 0 };
  const gap = last ? daysBetween(last, today) : Infinity;
  const current = gap === 1 ? s.streak.current + 1 : 1;
  const bonus = current > 1 ? Math.min(XP.streakMax, XP.streakPerDay * current) : 0;
  return {
    state: { ...s, streak: { current, longest: Math.max(s.streak.longest, current), lastDay: today } },
    bonus,
  };
}

/** Racha visible: si ayer no se estudió, la racha ya está cortada. */
export function currentStreak(s: ProgressState, today = dayKey()): number {
  const last = s.streak.lastDay;
  if (!last) return 0;
  return daysBetween(last, today) <= 1 ? s.streak.current : 0;
}

export function addXp(s: ProgressState, amount: number, today = dayKey()): ProgressState {
  if (amount <= 0) return s;
  const next = withDay(s, today, (d) => ({ ...d, xp: d.xp + amount }));
  return { ...next, xp: s.xp + amount };
}

export function addStudyTime(s: ProgressState, seconds: number, today = dayKey()): ProgressState {
  return withDay(s, today, (d) => ({ ...d, seconds: d.seconds + seconds }));
}

// ───────────────────────── Temas ─────────────────────────

/**
 * Actualiza el dominio de un tema. Un acierto sin ayuda en dificultad alta
 * empuja el dominio hacia 1; con pistas o viendo la solución empuja menos.
 */
export function updateTopic(t: TopicState, a: { correct: boolean; hints: number; usedSolution: boolean; difficulty: Difficulty }, today: string): TopicState {
  const help = a.usedSolution ? 0.3 : a.hints > 0 ? Math.max(0.5, 1 - 0.15 * a.hints) : 1;
  const target = a.correct ? Math.min(1, 0.5 + 0.1 * a.difficulty) * help : 0;
  const mastery = t.mastery + 0.3 * (target - t.mastery);

  let level = t.level;
  let streak = t.streak;
  let wrongStreak = t.wrongStreak;
  if (a.correct && a.hints === 0 && !a.usedSolution) {
    streak++;
    wrongStreak = 0;
    if (streak >= 3) {
      level = Math.min(6, level + 1) as Difficulty;
      streak = 0;
    }
  } else if (a.correct) {
    wrongStreak = 0;
  } else {
    streak = 0;
    wrongStreak++;
    // Nunca dejar al estudiante atrapado: dos errores seguidos bajan la dificultad.
    if (wrongStreak >= 2) {
      level = Math.max(1, level - 1) as Difficulty;
      wrongStreak = 0;
    }
  }

  // Repetición espaciada (Leitner): sube de caja como mucho una vez por día.
  let box = t.box;
  if (!a.correct) box = 0;
  else if (t.lastSeen !== today || t.attempts === 0) box = Math.min(SR_LADDER.length - 1, box + (a.hints === 0 && !a.usedSolution ? 1 : 0));
  const due = addDays(today, SR_LADDER[box]);

  return {
    mastery: Math.max(0, Math.min(1, mastery)),
    attempts: t.attempts + 1,
    correct: t.correct + (a.correct ? 1 : 0),
    level,
    streak,
    wrongStreak,
    lastSeen: today,
    box,
    due,
  };
}

export interface AttemptInput {
  exerciseId: string;
  topicId: string;
  correct: boolean;
  errorType?: ErrorType;
  hints: number;
  usedSolution: boolean;
  difficulty: Difficulty;
  mode: Attempt["mode"];
}

export interface AttemptOutcome {
  state: ProgressState;
  xpGained: number;
  streakBonus: number;
  levelUp: boolean;
  levelChange: number; // cambio en la dificultad adaptativa del tema
}

export function recordAttempt(s: ProgressState, input: AttemptInput, now = Date.now()): AttemptOutcome {
  const today = dayKey(new Date(now));
  const { state: afterStreak, bonus } = touchStreak(s, today);
  const prevTopic = afterStreak.topics[input.topicId] ?? newTopicState();
  const topic = updateTopic(prevTopic, input, today);
  const xpGain = input.correct ? (input.usedSolution ? 0 : input.hints > 0 ? XP.correctWithHelp : XP.correct) : 0;

  const attempts = [...afterStreak.attempts, { ...input, ts: now }];
  let next: ProgressState = {
    ...afterStreak,
    topics: { ...afterStreak.topics, [input.topicId]: topic },
    attempts: attempts.length > MAX_ATTEMPTS ? attempts.slice(-MAX_ATTEMPTS) : attempts,
  };
  next = withDay(next, today, (d) => ({ ...d, exercises: d.exercises + 1, correct: d.correct + (input.correct ? 1 : 0) }));
  const beforeLevel = levelInfo(next.xp).level;
  next = addXp(next, xpGain + bonus, today);
  return {
    state: next,
    xpGained: xpGain,
    streakBonus: bonus,
    levelUp: levelInfo(next.xp).level > beforeLevel,
    levelChange: topic.level - prevTopic.level,
  };
}

export function completeLesson(s: ProgressState, lessonId: string, unitLessons: { unitId: string; lessonIds: string[] }[], now = Date.now()): { state: ProgressState; xpGained: number; unitsCompleted: string[] } {
  const today = dayKey(new Date(now));
  const already = s.lessons[lessonId]?.status === "completada";
  let next: ProgressState = {
    ...s,
    lessons: { ...s.lessons, [lessonId]: { status: "completada", card: 0, completedAt: s.lessons[lessonId]?.completedAt ?? new Date(now).toISOString() } },
  };
  if (already) return { state: next, xpGained: 0, unitsCompleted: [] };
  next = touchStreak(next, today).state;
  next = withDay(next, today, (d) => ({ ...d, lessons: d.lessons + 1 }));
  let xp = XP.lesson;
  const unitsCompleted: string[] = [];
  for (const u of unitLessons) {
    if (next.units[u.unitId] || !u.lessonIds.includes(lessonId)) continue;
    if (u.lessonIds.every((id) => next.lessons[id]?.status === "completada")) {
      unitsCompleted.push(u.unitId);
      next = { ...next, units: { ...next.units, [u.unitId]: today } };
      xp += XP.unit;
    }
  }
  next = addXp(next, xp, today);
  return { state: next, xpGained: xp, unitsCompleted };
}

export function saveLessonCard(s: ProgressState, lessonId: string, card: number): ProgressState {
  const prev = s.lessons[lessonId];
  if (prev?.status === "completada") return s;
  return { ...s, lessons: { ...s.lessons, [lessonId]: { status: "en-curso", card } } };
}

// ───────────────────────── Consultas ─────────────────────────

export function isDue(t: TopicState | undefined, today = dayKey()): boolean {
  return !!t && t.attempts > 0 && !!t.due && t.due <= today;
}

export function accuracy(s: ProgressState): number {
  const total = s.attempts.length;
  if (!total) return 0;
  return s.attempts.filter((a) => a.correct).length / total;
}

/** Conteo de errores por tipo en una ventana de días. */
export function errorCounts(s: ProgressState, fromDaysAgo: number, toDaysAgo = 0, now = Date.now()): Partial<Record<ErrorType, number>> {
  const from = now - fromDaysAgo * 86400000;
  const to = now - toDaysAgo * 86400000;
  const out: Partial<Record<ErrorType, number>> = {};
  for (const a of s.attempts) {
    if (a.correct || !a.errorType || a.ts < from || a.ts > to) continue;
    out[a.errorType] = (out[a.errorType] ?? 0) + 1;
  }
  return out;
}

/** Errores que se repiten en los intentos recientes (≥ 3 en los últimos 40 intentos). */
export function recurringErrors(s: ProgressState): ErrorType[] {
  const recent = s.attempts.slice(-40);
  const counts = new Map<ErrorType, number>();
  for (const a of recent) if (!a.correct && a.errorType) counts.set(a.errorType, (counts.get(a.errorType) ?? 0) + 1);
  return [...counts.entries()].filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1]).map(([t]) => t);
}
