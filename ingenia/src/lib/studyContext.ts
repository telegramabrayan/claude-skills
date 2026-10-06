/**
 * Contexto de estudio: qué está mirando el estudiante AHORA (lección,
 * pantalla, ejercicio, su respuesta y la corrección). Lo registran la lección
 * y el reproductor de ejercicios; lo lee el tutor para no pedirle al
 * estudiante que explique todo de nuevo.
 */
import type { EvaluationResult, Exercise } from "@/engine/types";

export interface StudyContext {
  subjectId?: string;
  unitId?: string;
  topicId?: string;
  lessonId?: string;
  /** Texto de la pantalla de lección que está leyendo. */
  reading?: { title: string; text: string };
  exercise?: Exercise;
  /** Lo que respondió (en texto) y cómo se corrigió. */
  answer?: string;
  result?: Pick<EvaluationResult, "correct" | "message" | "diagnosis" | "errorType">;
  updatedAt: number;
}

let ctx: StudyContext = { updatedAt: 0 };
const listeners = new Set<() => void>();

export function setStudyContext(patch: Partial<StudyContext>, replace = false) {
  ctx = { ...(replace ? {} : ctx), ...patch, updatedAt: Date.now() };
  listeners.forEach((l) => l());
}

export function getStudyContext(): StudyContext {
  return ctx;
}

export function subscribeStudyContext(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

// ───── Abrir el profesor desde cualquier lugar ─────
type OpenListener = (question?: string) => void;
const openListeners = new Set<OpenListener>();
export function openTutor(question?: string) {
  openListeners.forEach((l) => l(question));
}
export function onOpenTutor(l: OpenListener) {
  openListeners.add(l);
  return () => {
    openListeners.delete(l);
  };
}
