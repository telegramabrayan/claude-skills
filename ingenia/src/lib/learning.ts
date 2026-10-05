/**
 * Lógica pedagógica que combina contenido + progreso:
 * estados del mapa, ruta personalizada, recomendaciones y plan diario.
 */
import type { Difficulty, Exercise, SkillId, Subject, Unit } from "@/engine/types";
import type { ProgressState } from "@/engine/progress/state";
import { dayKey } from "@/engine/progress/dates";
import { isDue, MASTERED, recurringErrors } from "@/engine/progress/rules";
import { generate, newSeed } from "@/engine/generators";
import { rng } from "@/engine/generators/rng";
import { findUnit, getSubject, SUBJECTS } from "@/content/curriculum";
import { MAP, type MapNode } from "@/content/map";
import { getTopic, TOPICS, ERROR_REMEDIATION } from "@/content/topics";
import { getLesson, LESSONS } from "@/content/lessons";
import { DIAGNOSTIC, SKILL_UNIT } from "@/content/diagnostic";

export type NodeStatus = "bloqueado" | "disponible" | "en-progreso" | "completado" | "dominado" | "estructura";

// ───────────────────────── Unidades y mapa ─────────────────────────

export function unitProgress(s: ProgressState, unit: Unit): { done: number; total: number; mastery: number } {
  const done = unit.lessonIds.filter((id) => s.lessons[id]?.status === "completada").length;
  const masteries = unit.topicIds.map((t) => s.topics[t]?.mastery ?? 0);
  const mastery = masteries.length ? masteries.reduce((a, b) => a + b, 0) / masteries.length : 0;
  return { done, total: unit.lessonIds.length, mastery };
}

function rawUnitStatus(s: ProgressState, unit: Unit): Exclude<NodeStatus, "bloqueado"> {
  if (unit.lessonIds.length === 0) return "estructura";
  const { done, total } = unitProgress(s, unit);
  const allDone = done === total;
  if (allDone) {
    const mastered = unit.topicIds.length > 0 && unit.topicIds.every((t) => (s.topics[t]?.mastery ?? 0) >= MASTERED);
    return mastered ? "dominado" : "completado";
  }
  const started = unit.lessonIds.some((id) => s.lessons[id]) || unit.topicIds.some((t) => (s.topics[t]?.attempts ?? 0) > 0);
  return started ? "en-progreso" : "disponible";
}

const NODE_INDEX = new Map<string, MapNode>(MAP.flatMap((sec) => sec.nodes.map((n) => [n.id, n] as const)));

export function nodeStatus(s: ProgressState, nodeId: string): NodeStatus {
  const node = NODE_INDEX.get(nodeId);
  if (node?.kind === "subject") return "estructura";
  const found = findUnit(nodeId);
  if (!found) return "estructura";
  const st = rawUnitStatus(s, found.unit);
  if (st === "estructura" || st === "completado" || st === "dominado") return st;
  // Si ya abrió una lección de la unidad, la unidad está en uso aunque no cumpla los requisitos.
  const lessonStarted = found.unit.lessonIds.some((id) => s.lessons[id]);
  const reqsOk = (node?.requires ?? []).every((r) => ["completado", "dominado"].includes(nodeStatus(s, r)));
  if (!lessonStarted && !reqsOk && !s.unlocked.includes(nodeId)) return "bloqueado";
  return st;
}

/** Qué falta para desbloquear un nodo (para explicarlo en la UI). */
export function missingRequirements(s: ProgressState, nodeId: string): string[] {
  const node = NODE_INDEX.get(nodeId);
  return (node?.requires ?? []).filter((r) => !["completado", "dominado"].includes(nodeStatus(s, r)));
}

export function nodeTitle(nodeId: string): string {
  return findUnit(nodeId)?.unit.title ?? getSubject(nodeId)?.name ?? nodeId;
}

export function subjectProgress(s: ProgressState, subject: Subject): number {
  const lessonIds = [...new Set(subject.units.flatMap((u) => u.lessonIds))];
  if (!lessonIds.length) return 0;
  return lessonIds.filter((id) => s.lessons[id]?.status === "completada").length / lessonIds.length;
}

/** Unidades (con lecciones) que contienen una lección: para otorgar XP de unidad. */
export function unitsWithLessons(): { unitId: string; lessonIds: string[] }[] {
  return SUBJECTS.flatMap((sub) => sub.units.filter((u) => u.lessonIds.length).map((u) => ({ unitId: u.id, lessonIds: u.lessonIds })));
}

// ───────────────────────── Ruta personalizada ─────────────────────────

const PREP_UNITS = ["nivel-0", "nivel-1", "prep-geo", "nivel-2", "prep-uni", "nivel-3", "nivel-4"];
const DEFAULT_ROUTE_UNITS = [...PREP_UNITS, "fis-2", "alg-1"];

/** Ruta completa desde cero: todas las lecciones en orden pedagógico. */
export function fullRoute(): string[] {
  const ids = DEFAULT_ROUTE_UNITS.flatMap((u) => findUnit(u)?.unit.lessonIds ?? []);
  return [...new Set(ids)];
}

export interface DiagnosticOutcome {
  skills: Partial<Record<SkillId, number>>;
  route: string[];
  unlocked: string[];
  /** Nivel de dificultad inicial y dominio estimado por tema. */
  topicSeeds: Record<string, { level: Difficulty; mastery: number }>;
}

/**
 * A partir del puntaje por habilidad arma la ruta: las lecciones de habilidades
 * ya dominadas (≥ 80 %) se saltean de la ruta (siguen accesibles) y sus
 * unidades se desbloquean.
 */
export function routeFromDiagnostic(skills: Partial<Record<SkillId, number>>): DiagnosticOutcome {
  const unitScore = new Map<string, number[]>();
  for (const [skill, score] of Object.entries(skills) as [SkillId, number][]) {
    const u = SKILL_UNIT[skill];
    unitScore.set(u, [...(unitScore.get(u) ?? []), score]);
  }
  const avg = (u: string) => {
    const v = unitScore.get(u);
    return v ? v.reduce((a, b) => a + b, 0) / v.length : 0;
  };
  const skip = new Set<string>();
  const unlocked: string[] = [];
  for (const u of PREP_UNITS) {
    if (avg(u) >= 0.8) skip.add(u);
    if (avg(u) >= 0.7) unlocked.push(u);
  }
  // Desbloquear también el siguiente nivel al último dominado, para que no tenga que "rendir" lo que ya sabe.
  const order = ["nivel-0", "nivel-1", "nivel-2", "prep-uni", "nivel-3"];
  order.forEach((u, i) => {
    if (skip.has(u) && order[i + 1]) unlocked.push(order[i + 1]);
  });

  const route = fullRoute().filter((lessonId) => {
    const unitIds = DEFAULT_ROUTE_UNITS.filter((u) => findUnit(u)?.unit.lessonIds.includes(lessonId));
    return !unitIds.every((u) => skip.has(u));
  });
  if (route.length === 0) route.push(...fullRoute().slice(-3));

  const topicSeeds: DiagnosticOutcome["topicSeeds"] = {};
  for (const t of TOPICS) {
    const score = skills[t.skill];
    if (score === undefined) continue;
    const level = (score >= 0.8 ? 4 : score >= 0.5 ? 3 : score >= 0.2 ? 2 : 1) as Difficulty;
    topicSeeds[t.id] = { level, mastery: Math.min(0.6, score * 0.6) };
  }
  return { skills, route, unlocked: [...new Set(unlocked)], topicSeeds };
}

export function diagnosticSkillScore(items: { weight: number; correct: boolean }[], totalWeight: number): number {
  const got = items.filter((i) => i.correct).reduce((a, b) => a + b.weight, 0);
  return totalWeight ? got / totalWeight : 0;
}

export const DIAGNOSTIC_TOTAL_WEIGHT = Object.fromEntries(DIAGNOSTIC.map((d) => [d.skill, d.items.reduce((a, b) => a + b.weight, 0)])) as Record<SkillId, number>;

/** Próxima lección recomendada: la primera de la ruta que no está completada. */
export function nextLesson(s: ProgressState): string | undefined {
  const route = s.route.length ? s.route : fullRoute();
  return route.find((id) => s.lessons[id]?.status !== "completada") ?? LESSONS.find((l) => s.lessons[l.id]?.status !== "completada")?.id;
}

/** Unidad y materia de una lección, priorizando Preparación y luego el CBC. */
export function lessonContext(lessonId: string): { subject: Subject; unit: Unit } | undefined {
  for (const subject of SUBJECTS) {
    const unit = subject.units.find((u) => u.lessonIds.includes(lessonId));
    if (unit) return { subject, unit };
  }
  return undefined;
}

// ───────────────────────── Recomendaciones ─────────────────────────

export interface Recommendation {
  topicId: string;
  reason: string;
}

/** «Necesitás reforzar»: errores recurrentes, temas vencidos y temas flojos. */
export function recommendations(s: ProgressState, limit = 3): Recommendation[] {
  const out: Recommendation[] = [];
  const add = (topicId: string, reason: string) => {
    if (!out.some((r) => r.topicId === topicId) && getTopic(topicId)) out.push({ topicId, reason });
  };
  for (const e of recurringErrors(s)) {
    const t = ERROR_REMEDIATION[e];
    if (t) add(t, "Aparecen errores repetidos de este tipo");
  }
  const practiced = TOPICS.filter((t) => (s.topics[t.id]?.attempts ?? 0) > 0);
  practiced
    .filter((t) => (s.topics[t.id]?.mastery ?? 0) < 0.6)
    .sort((a, b) => (s.topics[a.id]?.mastery ?? 0) - (s.topics[b.id]?.mastery ?? 0))
    .forEach((t) => add(t.id, `Dominio ${Math.round((s.topics[t.id]?.mastery ?? 0) * 100)} %`));
  practiced.filter((t) => isDue(s.topics[t.id])).forEach((t) => add(t.id, "Toca repasarlo para no olvidarlo"));
  return out.slice(0, limit);
}

export function dueTopics(s: ProgressState, today = dayKey()): string[] {
  return TOPICS.filter((t) => isDue(s.topics[t.id], today))
    .sort((a, b) => (s.topics[a.id]?.mastery ?? 0) - (s.topics[b.id]?.mastery ?? 0))
    .map((t) => t.id);
}

/** Temas «activos»: practicados o de lecciones completadas. */
export function activeTopics(s: ProgressState): string[] {
  const fromLessons = Object.entries(s.lessons)
    .filter(([, l]) => l.status === "completada")
    .flatMap(([id]) => getLesson(id)?.topicIds ?? []);
  const practiced = Object.entries(s.topics).filter(([, t]) => t.attempts > 0).map(([id]) => id);
  return [...new Set([...fromLessons, ...practiced])].filter((id) => getTopic(id));
}

// ───────────────────────── Ejercicios ─────────────────────────

export function topicLevel(s: ProgressState, topicId: string): Difficulty {
  return s.topics[topicId]?.level ?? 2;
}

/** Genera un ejercicio de un tema a la dificultad adaptativa del estudiante (± ajuste). */
export function exerciseFor(s: ProgressState, topicId: string, adjust = 0, seed = newSeed()): Exercise {
  const topic = getTopic(topicId);
  if (!topic) throw new Error(`Tema desconocido: ${topicId}`);
  const r = rng(seed);
  const gen = r.pick(topic.generators);
  const level = Math.min(6, Math.max(1, topicLevel(s, topicId) + adjust)) as Difficulty;
  return generate(gen, level, seed);
}

/** Ejercicio de una tarjeta de lección: fijo o generado con semilla fija. */
export function resolveExercise(e: Exercise | { generator: string; difficulty: Difficulty; seed: number }): Exercise {
  return "kind" in e ? e : generate(e.generator, e.difficulty, e.seed);
}

export type QueueItem =
  | { type: "exercise"; topicId: string; adjust: number; label: string }
  | { type: "lesson"; lessonId: string; label: string };

/**
 * «Tu entrenamiento de hoy» (10-20 min): 2 repasos, 1 lección, 5 ejercicios
 * de temas flojos y 1 desafío. Se adapta a lo que el estudiante ya vio.
 */
export function dailyPlan(s: ProgressState): QueueItem[] {
  const items: QueueItem[] = [];
  const active = activeTopics(s);
  const due = dueTopics(s);

  const reviewPool = due.length ? due : active;
  reviewPool.slice(0, 2).forEach((t) => items.push({ type: "exercise", topicId: t, adjust: -1, label: "Repaso" }));

  const lesson = nextLesson(s);
  if (lesson) items.push({ type: "lesson", lessonId: lesson, label: "Lección nueva" });

  const weak = recommendations(s, 5).map((r) => r.topicId);
  const lessonTopics = lesson ? getLesson(lesson)?.topicIds ?? [] : [];
  const pool = [...weak, ...active, ...lessonTopics].filter((t, i, arr) => arr.indexOf(t) === i);
  const practicePool = pool.length ? pool : ["t-signos"];
  for (let i = 0; i < 5; i++) items.push({ type: "exercise", topicId: practicePool[i % practicePool.length], adjust: 0, label: "Práctica" });

  const strongest = [...active].sort((a, b) => (s.topics[b]?.mastery ?? 0) - (s.topics[a]?.mastery ?? 0))[0] ?? practicePool[0];
  items.push({ type: "exercise", topicId: strongest, adjust: 1, label: "Desafío" });
  return items;
}
