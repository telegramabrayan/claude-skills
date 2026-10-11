/**
 * Motor de la Misión Física: calcula la preparación con datos reales, decide
 * prioridades y arma (y rearma todos los días) el plan hasta el parcial.
 * Nada se guarda como plan fijo: el plan se recalcula con tus resultados, así
 * que si un día no estudiás o avanzás más rápido, se reacomoda solo.
 */
import type { ProgressState } from "@/engine/progress/state";
import type { Difficulty } from "@/engine/types";
import { addDays, dayKey, weekStart } from "@/engine/progress/dates";
import { getTopic } from "@/content/topics";
import { AREAS, AREA_OF, EXAM_DATE, MISSION_TOPICS, areaExamWeight, areasFor, areaImportance, type MissionArea } from "@/content/fisica/mission";
import { EXAM_MODELS } from "@/content/fisica/parciales";
import type { SessionItem } from "@/components/session/Session";

// ───────────── Tiempo ─────────────

export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T12:00:00`) - Date.parse(`${a}T12:00:00`)) / 86400000);
}

/** Días que faltan para el parcial (0 = es hoy). */
export function daysLeft(today = dayKey()): number {
  return daysBetween(today, EXAM_DATE);
}

export type Phase = "construccion" | "recta-final" | "repaso-final" | "pre-parcial" | "dia-parcial" | "dia-1p" | "despues";

export function phaseFor(days: number): Phase {
  if (days < -1) return "despues";
  if (days === -1) return "dia-1p";
  if (days === 0) return "dia-parcial";
  if (days === 1) return "pre-parcial";
  if (days === 2) return "repaso-final";
  if (days <= 7) return "recta-final";
  return "construccion";
}

export const PHASE_INFO: Record<Phase, { title: string; text: string; icon: string }> = {
  construccion: { title: "Construcción", text: "Fundamentos primero, después los temas que más toman y los que más te cuestan.", icon: "🧱" },
  "recta-final": { title: "Recta final", text: "Menos teoría nueva: simulacros, tus errores, temas débiles y velocidad.", icon: "🔥" },
  "repaso-final": { title: "Repaso final (48 h)", text: "Conceptos clave, tus errores y ejercicios que ya deberías poder resolver. Nada de saturarte.", icon: "🧠" },
  "pre-parcial": { title: "Repaso pre-parcial", text: "Sesión corta del 2.º parcial (y un vistazo al 1.º): fórmulas, errores frecuentes, ejercicios, mini test y checklist. Después, a descansar.", icon: "🌙" },
  "dia-parcial": { title: "¡Hoy es el 2.º parcial!", text: "Leé el checklist, respirá y aplicá el método de 6 pasos. A la noche, repaso corto del 1.º y a dormir temprano.", icon: "🍀" },
  "dia-1p": { title: "¡Hoy es el 1.er parcial!", text: "El último esfuerzo: checklist, método de 6 pasos y cuidado con las unidades. Ya hiciste el trabajo.", icon: "🍀" },
  despues: { title: "Parciales rendidos", text: "Podés seguir practicando para el recuperatorio o el final.", icon: "🎓" },
};

// ───────────── Preparación por tema (datos reales) ─────────────

export interface TopicReadiness {
  topicId: string;
  value: number | null;
  attempts: number;
  mastery: number;
  examAccuracy: number | null;
  helpRate: number;
  daysSince: number | null;
}

const MISSION_SET = new Set(MISSION_TOPICS);

/**
 * Preparación de un tema (0..1). Combina: dominio adaptativo, aciertos en
 * ejercicios de nivel parcial (dificultad ≥ 4), uso de ayudas (pistas o
 * solución), resultados en simulacros y cuánto hace que no lo practicás.
 * Sin intentos → null ("sin datos"): no se inventa un número.
 */
export function topicReadiness(s: ProgressState, topicId: string, now = Date.now()): TopicReadiness {
  const ts = s.topics[topicId];
  const atts = s.attempts.filter((a) => a.topicId === topicId);
  const base: TopicReadiness = { topicId, value: null, attempts: atts.length, mastery: ts?.mastery ?? 0, examAccuracy: null, helpRate: 0, daysSince: null };
  const fromExams = s.exams.filter((e) => e.byTopic[topicId]).slice(-3);
  if (!atts.length && !fromExams.length) return base;
  const recent = atts.slice(-12);
  const hard = atts.filter((a) => a.difficulty >= 4).slice(-8);
  const examAccuracy = hard.length ? hard.filter((a) => a.correct && !a.usedSolution).length / hard.length : null;
  const helpRate = recent.length ? recent.filter((a) => a.hints > 0 || a.usedSolution).length / recent.length : 0;
  const simAcc = fromExams.length ? fromExams.reduce((a, e) => a + e.byTopic[topicId].correct / Math.max(1, e.byTopic[topicId].total), 0) / fromExams.length : null;
  const last = atts.length ? atts[atts.length - 1].ts : fromExams[fromExams.length - 1].ts;
  const daysSince = Math.floor((now - last) / 86400000);
  const m = ts?.mastery ?? 0;
  let v = 0.45 * m + 0.25 * (examAccuracy ?? m * 0.7) + 0.1 * (1 - helpRate) + 0.2 * (simAcc ?? m);
  // Retención: si hace mucho que no lo practicás, baja un poco (hasta un 20 %).
  v *= 1 - Math.min(0.2, Math.max(0, daysSince - 3) * 0.015);
  return { ...base, value: Math.max(0, Math.min(1, v)), examAccuracy, helpRate, daysSince };
}

export function areaReadiness(s: ProgressState, area: MissionArea): number | null {
  const vals = area.topics.filter((t) => getTopic(t)).map((t) => topicReadiness(s, t).value).filter((v): v is number => v !== null);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
}

/** Preparación de un parcial: promedio ponderado por cuánto pesa cada área en los modelos. Áreas sin práctica cuentan como 0. */
export function parcialReadiness(s: ProgressState, p: "1P" | "2P"): { value: number; coverage: number } {
  let tot = 0;
  let acc = 0;
  let covered = 0;
  for (const a of areasFor(p)) {
    const w = areaExamWeight(a, p);
    const r = areaReadiness(s, a);
    tot += w;
    acc += w * (r ?? 0);
    if (r !== null) covered += w;
  }
  return { value: tot ? acc / tot : 0, coverage: tot ? covered / tot : 0 };
}

export function globalReadiness(s: ProgressState): number {
  const p1 = parcialReadiness(s, "1P").value;
  const p2 = parcialReadiness(s, "2P").value;
  if (s.fisica.parcial === "1P") return 0.7 * p1 + 0.3 * p2;
  if (s.fisica.parcial === "2P") return 0.3 * p1 + 0.7 * p2;
  return (p1 + p2) / 2;
}

export function readinessLevel(v: number): { key: "baja" | "progreso" | "bueno" | "muy-bueno"; label: string; icon: string; color: string } {
  if (v >= 0.85) return { key: "muy-bueno", label: "Muy buen dominio", icon: "⭐", color: "var(--xp)" };
  if (v >= 0.65) return { key: "bueno", label: "Buen nivel para el parcial", icon: "🟢", color: "var(--success)" };
  if (v >= 0.35) return { key: "progreso", label: "Preparación en progreso", icon: "🟡", color: "var(--warn)" };
  return { key: "baja", label: "Preparación baja", icon: "🔴", color: "var(--danger)" };
}

/** Qué falta para subir de nivel, en concreto. */
export function nextLevelAdvice(s: ProgressState): string[] {
  const out: string[] = [];
  if (!s.fisica.diagDoneAt) out.push("Hacé el diagnóstico «¿Qué tan preparado estás?» para que el plan parta de tu nivel real.");
  const ranked = rankedAreas(s).slice(0, 2);
  for (const r of ranked) out.push(`Subir ${r.area.name.toLowerCase()} (${r.readiness === null ? "sin práctica todavía" : `${Math.round(r.readiness * 100)} %`}).`);
  const sims = s.exams.filter((e) => e.title.startsWith("Física")).length;
  if (sims === 0) out.push("Hacer tu primer simulacro: es la mejor medida de cómo te iría.");
  return out.slice(0, 3);
}

// ───────────── Prioridades ─────────────

function areaDifficulty(area: MissionArea): number {
  const ds = EXAM_MODELS.flatMap((m) => m.exercises).filter((e) => e.items.some((it) => area.topics.includes(it.topicId))).map((e) => e.dificultad);
  return ds.length ? ds.reduce((a, b) => a + b, 0) / ds.length / 5 : 0.5;
}

export function relevantAreas(s: ProgressState): MissionArea[] {
  const p = s.fisica.parcial;
  return p === "ambos" ? AREAS : AREAS.filter((a) => a.parciales.includes(p));
}

/** examPriority (1–5): frecuencia en modelos, importancia conceptual, dificultad y TU nivel. */
export function examPriority(s: ProgressState, area: MissionArea): number {
  const w = Math.max(...area.parciales.map((p) => areaExamWeight(area, p)));
  const r = areaReadiness(s, area);
  const need = r === null ? 0.6 : 1 - r;
  const score = 0.4 * w + 0.2 * area.foundation + 0.15 * areaDifficulty(area) + 0.25 * need;
  return Math.max(1, Math.min(5, Math.round(1 + 4 * score * 1.4)));
}

export function rankedAreas(s: ProgressState) {
  return relevantAreas(s)
    .map((area) => ({ area, readiness: areaReadiness(s, area), priority: examPriority(s, area), importance: areaImportance(area) }))
    .sort((a, b) => b.priority - a.priority || (a.readiness ?? 0) - (b.readiness ?? 0));
}

// ───────────── Plan hasta el parcial ─────────────

export interface PlanDay {
  date: string;
  phase: Phase;
  title: string;
  areas: MissionArea[];
  tasks: string[];
  simulacro?: "1P" | "2P";
  done: boolean;
  isToday: boolean;
  past: boolean;
}

/**
 * Arma el plan día por día desde hoy. Simula tu avance: cada día elige el
 * área con más "necesidad × peso", supone que sube y sigue. Los fundamentos
 * pesan más al principio; cada 6 días hay un simulacro.
 */
export function buildPlan(s: ProgressState, today = dayKey()): PlanDay[] {
  const left = daysLeft(today);
  const areas = relevantAreas(s);
  const projected = new Map(areas.map((a) => [a.id, areaReadiness(s, a) ?? 0.15]));
  const out: PlanDay[] = [];
  const total = Math.max(1, left);
  let simTurn: "1P" | "2P" = s.fisica.parcial === "1P" ? "1P" : "2P";
  const nextSim = () => {
    const v = simTurn;
    if (s.fisica.parcial === "ambos") simTurn = simTurn === "1P" ? "2P" : "1P";
    return v;
  };
  const scheduled = new Set<string>();
  for (let i = 0; i <= left + 1; i++) {
    const date = addDays(today, i);
    const d = left - i;
    const phase = phaseFor(d);
    const done = (s.fisica.done[date]?.length ?? 0) > 0;
    const base = { date, phase, done, isToday: i === 0, past: false };
    if (phase === "dia-1p") {
      out.push({ ...base, title: "1.er parcial", areas: [], tasks: ["Checklist del examen", "Leer todo antes de empezar", "Método de 6 pasos en cada ejercicio"] });
      continue;
    }
    if (phase === "dia-parcial") {
      out.push({ ...base, title: "2.º parcial + repaso del 1.º a la noche", areas: [], tasks: ["Rendir el 2.º parcial", "A la noche (30–40 min): fórmulas y errores del 1.º", "Checklist y a dormir temprano"] });
      continue;
    }
    if (phase === "pre-parcial") {
      out.push({ ...base, title: "Repaso pre-parcial (2.º)", areas: [], tasks: ["Fórmulas del 2.º parcial", "Tus errores frecuentes", "3–5 ejercicios seleccionados", "Vistazo rápido al 1.º", "Checklist del examen"] });
      continue;
    }
    if (phase === "despues") continue;
    if (phase === "repaso-final") {
      const weak = [...areas].sort((a, b) => (projected.get(a.id) ?? 0) - (projected.get(b.id) ?? 0)).slice(0, 2);
      out.push({ ...base, title: "Repaso final", areas: weak, tasks: ["Conceptos clave y fórmulas", "Practicar mis errores", `Ejercicios ya conocidos de ${weak.map((w) => w.name.split(" ")[0].toLowerCase()).join(" y ")}`] });
      continue;
    }
    if (phase === "recta-final") {
      const weak = [...areas].sort((a, b) => (projected.get(a.id) ?? 0) * 1 - (projected.get(b.id) ?? 0)).slice(0, 1);
      const sim = d % 2 === 1 ? nextSim() : undefined;
      out.push({ ...base, title: sim ? `Simulacro ${sim === "1P" ? "1.er" : "2.º"} parcial` : "Errores y temas débiles", areas: weak, simulacro: sim, tasks: sim ? ["Simulacro completo con cronómetro", "Revisar cada error", "Refuerzo del tema más flojo"] : ["Practicar mis errores", `Refuerzo: ${weak[0]?.name ?? "temas débiles"}`, "Problemas tipo parcial"] });
      for (const w of weak) projected.set(w.id, Math.min(1, (projected.get(w.id) ?? 0) + 0.12));
      continue;
    }
    // Construcción.
    if (i > 0 && i % 6 === 5) {
      const sim = nextSim();
      out.push({ ...base, title: `Simulacro de práctica (${sim === "1P" ? "1.er" : "2.º"} parcial)`, areas: [], simulacro: sim, tasks: ["Simulacro en modo aprendizaje o realista", "Plan de recuperación con tus errores"] });
      continue;
    }
    const early = 1 - i / total;
    const ids = new Set(areas.map((a) => a.id));
    const ready = (id: string) => !ids.has(id) || scheduled.has(id) || (projected.get(id) ?? 0) >= 0.45;
    const scored = areas
      .filter((a) => (a.after ?? []).every(ready))
      .map((a) => {
        const need = 1 - (projected.get(a.id) ?? 0);
        const w = Math.max(...a.parciales.map((p) => areaExamWeight(a, p)));
        // Primero que cada área tenga su día; después, volver a las más necesarias.
        return { a, score: need * (0.35 + w) * (1 + early * a.foundation) * (scheduled.has(a.id) ? 1 : 2.5) };
      })
      .sort((x, y) => y.score - x.score);
    const main = scored[0].a;
    scheduled.add(main.id);
    const second = scored.find((x) => x.a.id !== main.id)?.a;
    const picked = second ? [main, second] : [main];
    projected.set(main.id, Math.min(1, (projected.get(main.id) ?? 0) + 0.22));
    if (second) projected.set(second.id, Math.min(1, (projected.get(second.id) ?? 0) + 0.08));
    out.push({ ...base, title: main.name, areas: picked, tasks: [`Intuición y fórmulas de ${main.name.toLowerCase()}`, "Ejercicios de nivel 1 a 3", "Un problema tipo parcial", ...(second ? [`Repaso: ${second.name.toLowerCase()}`] : [])] });
  }
  return out;
}

/** Semana a la que pertenece un día del plan (para agrupar "Semana 1, 2…"). */
export function groupByWeek(days: PlanDay[]): { label: string; days: PlanDay[] }[] {
  const groups: { label: string; days: PlanDay[] }[] = [];
  let current = "";
  for (const d of days) {
    const ws = weekStart(d.date);
    const label = d.phase === "recta-final" ? "Recta final" : d.phase === "repaso-final" || d.phase === "pre-parcial" ? "Últimos días" : ws;
    if (label !== current) {
      groups.push({ label, days: [] });
      current = label;
    }
    groups[groups.length - 1].days.push(d);
  }
  let n = 0;
  return groups.map((g) => (g.label.match(/^\d{4}-/) ? { ...g, label: `Semana ${++n}` } : g));
}

// ───────────── Entrenamiento de hoy ─────────────

export interface TrainingBlock {
  id: "repaso" | "concepto" | "ejercicios" | "parcial" | "simulacro" | "errores" | "formulas" | "checklist" | "quetest";
  title: string;
  icon: string;
  minutes: number;
  detail: string;
  items?: SessionItem[];
  areaId?: string;
  topicId?: string;
  simulacro?: "1P" | "2P";
}

const LEVEL_DIFF: Record<1 | 2 | 3 | 4 | 5, Difficulty> = { 1: 1, 2: 3, 3: 4, 4: 5, 5: 6 };
export const LEVEL_NAMES = ["", "Entender", "Aplicar", "Combinar", "Tipo parcial", "Desafío"];

/** Nivel de práctica (1–5) según la preparación del tema. */
export function practiceLevel(r: number | null): 1 | 2 | 3 | 4 | 5 {
  if (r === null || r < 0.25) return 1;
  if (r < 0.45) return 2;
  if (r < 0.65) return 3;
  if (r < 0.85) return 4;
  return 5;
}

/** Generador menos usado últimamente en el tema: evita aprender un único patrón de memoria. */
export function freshGenerator(s: ProgressState, topicId: string, offset = 0): string | undefined {
  const gens = getTopic(topicId)?.generators ?? [];
  if (!gens.length) return undefined;
  const recent = s.attempts.filter((a) => a.topicId === topicId).slice(-12).map((a) => a.exerciseId.split(":")[0]);
  const ranked = [...gens].sort((a, b) => recent.filter((x) => x === a).length - recent.filter((x) => x === b).length);
  return ranked[offset % ranked.length];
}

export function itemsFor(s: ProgressState, topicId: string, n: number, level: 1 | 2 | 3 | 4 | 5, label?: string, climb = true): SessionItem[] {
  return Array.from({ length: n }, (_, i) => {
    const lv = (climb ? Math.min(5, level + Math.floor(i / Math.max(2, Math.ceil(n / 2)))) : level) as 1 | 2 | 3 | 4 | 5;
    return { topicId, difficulty: LEVEL_DIFF[lv], generator: freshGenerator(s, topicId, i), label: label ?? `Nivel ${lv} · ${LEVEL_NAMES[lv]}` };
  });
}

/** Errores recientes en temas de la misión (los más repetidos primero). */
export function recentErrors(s: ProgressState, days = 30) {
  const since = Date.now() - days * 86400000;
  const wrong = s.attempts.filter((a) => !a.correct && a.ts >= since && MISSION_SET.has(a.topicId));
  const map = new Map<string, { topicId: string; errorType?: string; count: number; last: number }>();
  for (const a of wrong) {
    const k = `${a.topicId}|${a.errorType ?? ""}`;
    const e = map.get(k) ?? { topicId: a.topicId, errorType: a.errorType, count: 0, last: 0 };
    e.count++;
    e.last = Math.max(e.last, a.ts);
    map.set(k, e);
  }
  return [...map.values()].sort((a, b) => b.count - a.count || b.last - a.last);
}

export function errorItems(s: ProgressState, n = 8): SessionItem[] {
  const errs = recentErrors(s);
  if (!errs.length) return [];
  return Array.from({ length: n }, (_, i) => {
    const e = errs[i % errs.length];
    return { topicId: e.topicId, adjust: -1, generator: freshGenerator(s, e.topicId, i), label: "Por un error tuyo" };
  });
}

/** Lo que más toman: las áreas más pesadas en los modelos, a nivel parcial. */
export function importantItems(s: ProgressState, n = 8, parcial?: "1P" | "2P"): SessionItem[] {
  const top = (parcial ? areasFor(parcial) : relevantAreas(s))
    .filter((a) => a.id !== "fundamentos" && a.id !== "trig")
    .sort((a, b) => Math.max(...b.parciales.map((p) => areaExamWeight(b, p))) - Math.max(...a.parciales.map((p) => areaExamWeight(a, p))))
    .slice(0, 4);
  const topics = top.flatMap((a) => a.topics.filter((t) => getTopic(t)?.generators.length));
  return Array.from({ length: n }, (_, i) => ({ topicId: topics[i % topics.length], difficulty: (i < 3 ? 4 : 5) as Difficulty, generator: freshGenerator(s, topics[i % topics.length], i) }));
}

/** Arma el entrenamiento del día para el tiempo disponible. */
export function todayTraining(s: ProgressState, minutes: number): TrainingBlock[] {
  const left = daysLeft();
  const phase = phaseFor(left);
  const plan = buildPlan(s);
  const today = plan[0];
  const errs = errorItems(s, 3);
  const scale = (m: number) => Math.max(1, Math.round((m * minutes) / 35));
  const ex = (m: number) => Math.max(1, Math.round(m / 2.5));

  if (phase === "pre-parcial") {
    return [
      { id: "formulas", title: "Fórmulas importantes", icon: "📄", minutes: 8, detail: "Las del 2.º parcial, con cuándo usar cada una." },
      { id: "errores", title: "Tus errores frecuentes", icon: "❌", minutes: 7, detail: "Lo que más te costó, en ejercicios cortos.", items: errorItems(s, 3).length ? errorItems(s, 3) : importantItems(s, 3, "2P") },
      { id: "parcial", title: "Ejercicios del 2.º + mini test", icon: "🎯", minutes: 15, detail: "5 ejercicios de lo que más toman en el 2.º parcial.", items: importantItems(s, 5, "2P") },
      { id: "parcial", title: "Vistazo al 1.º", icon: "🌊", minutes: 6, detail: "3 ejercicios de lo que más toman en el 1.º (es al día siguiente).", items: importantItems(s, 3, "1P") },
      { id: "checklist", title: "Checklist del examen", icon: "✅", minutes: 3, detail: "La rutina antes de entregar." },
    ];
  }
  if (phase === "dia-parcial" || phase === "dia-1p") {
    // El día del 2.º: repaso nocturno del 1.º. El día del 1.º: solo lo justo.
    return [
      { id: "formulas", title: "Fórmulas del 1.er parcial", icon: "📄", minutes: 8, detail: "Vectores, cinemática, estática, momentos e hidrostática." },
      { id: "parcial", title: phase === "dia-parcial" ? "Repaso nocturno del 1.º" : "Calentamiento", icon: "🌙", minutes: phase === "dia-parcial" ? 20 : 8, detail: "Ejercicios cortos de lo que más toman en el 1.er parcial.", items: importantItems(s, phase === "dia-parcial" ? 5 : 2, "1P") },
      { id: "checklist", title: "Checklist del examen", icon: "✅", minutes: 3, detail: "La rutina antes de entregar." },
    ];
  }

  const focus = today?.areas[0] ?? rankedAreas(s)[0]?.area;
  const focusTopics = (focus?.topics ?? []).filter((t) => getTopic(t)?.generators.length);
  const ranked = focusTopics.map((t) => ({ t, r: topicReadiness(s, t).value })).sort((a, b) => (a.r ?? 0) - (b.r ?? 0));
  const mainTopic = ranked[0]?.t ?? "t-mruv";
  const lvl = practiceLevel(ranked[0]?.r ?? null);

  if (today?.simulacro && minutes >= 45) {
    return [
      { id: "simulacro", title: `Simulacro ${today.simulacro === "1P" ? "1.er" : "2.º"} parcial`, icon: "📝", minutes: Math.min(90, minutes - 10), detail: "Formato de la cátedra, con ejercicios nuevos.", simulacro: today.simulacro },
      { id: "errores", title: "Revisar errores del simulacro", icon: "❌", minutes: 10, detail: "Plan de recuperación al terminar." },
    ];
  }

  const blocks: TrainingBlock[] = [];
  const repasoItems = errs.length ? errs.slice(0, Math.min(2, scale(2))) : itemsFor(s, today?.areas[1]?.topics.find((t) => getTopic(t)?.generators.length) ?? mainTopic, Math.min(2, scale(2)), 2, "Repaso rápido", false);
  blocks.push({ id: "repaso", title: "Repaso rápido", icon: "🧠", minutes: Math.max(3, scale(5)), detail: errs.length ? "Un error tuyo reciente, para que no se repita." : "Para no olvidar lo que ya viste.", items: repasoItems });
  if (phase === "construccion" && minutes >= 15) blocks.push({ id: "concepto", title: `Concepto: ${focus?.name ?? "tema del día"}`, icon: "📖", minutes: Math.max(4, scale(7)), detail: "Qué pasa físicamente → fórmula → cuándo usarla.", areaId: focus?.id, topicId: mainTopic });
  if (minutes >= 20) blocks.push({ id: "quetest", title: "¿Qué usarías?", icon: "🔍", minutes: 3, detail: "Reconocer el modelo y la fórmula antes de resolver.", areaId: focus?.id, topicId: mainTopic });
  const exMin = Math.max(5, scale(phase === "construccion" ? 15 : 12));
  blocks.push({ id: "ejercicios", title: `Ejercicios: ${getTopic(mainTopic)?.name ?? focus?.name ?? ""}`, icon: "🧩", minutes: exMin, detail: `Desde nivel ${lvl} (${LEVEL_NAMES[lvl]}) hacia arriba.`, items: itemsFor(s, mainTopic, ex(exMin), lvl), topicId: mainTopic });
  if (minutes >= 20) {
    const pTopic = focusTopics[1] ?? mainTopic;
    blocks.push({ id: "parcial", title: "Problema tipo parcial", icon: "🎯", minutes: Math.max(6, scale(8)), detail: "Con datos que sobran y dos etapas, como en los modelos.", items: itemsFor(s, pTopic, minutes >= 45 ? 3 : 2, 4, "Tipo parcial", false), topicId: pTopic });
  }
  if (phase !== "construccion" && minutes >= 30) blocks.push({ id: "errores", title: "Practicar mis errores", icon: "❌", minutes: scale(8), detail: "Ejercicios elegidos por tus errores.", items: errorItems(s, 4).length ? errorItems(s, 4) : importantItems(s, 4) });
  return blocks;
}

// ───────────── Objetivos semanales y evolución ─────────────

export function weeklyGoals(s: ProgressState) {
  const ws = weekStart(dayKey());
  const since = Date.parse(`${ws}T00:00:00`);
  const plan = buildPlan(s).filter((d) => weekStart(d.date) === ws);
  const focus = [...new Map(plan.flatMap((d) => d.areas).map((a) => [a.id, a])).values()].slice(0, 2);
  const exercises = s.attempts.filter((a) => a.ts >= since && MISSION_SET.has(a.topicId)).length;
  const sims = s.exams.filter((e) => e.ts >= since && e.title.startsWith("Física")).length;
  const trainingDays = Object.entries(s.fisica.done).filter(([d, v]) => d >= ws && v.length > 0).length;
  return [
    ...focus.map((a) => {
      const r = areaReadiness(s, a) ?? 0;
      return { label: `Llevar ${a.name.toLowerCase()} al 65 %`, progress: Math.min(1, r / 0.65), detail: `${Math.round(r * 100)} %` };
    }),
    { label: "Resolver 25 ejercicios de Física", progress: Math.min(1, exercises / 25), detail: `${exercises}/25` },
    { label: "Completar el entrenamiento 4 días", progress: Math.min(1, trainingDays / 4), detail: `${trainingDays}/4` },
    { label: "Hacer 1 simulacro", progress: Math.min(1, sims), detail: `${sims}/1` },
  ];
}

/** Evolución semanal de la preparación (promedio de lo registrado cada día; solo datos reales). */
export function weeklyEvolution(s: ProgressState): { week: string; value: number }[] {
  const by = new Map<string, number[]>();
  for (const [d, v] of Object.entries(s.fisica.snapshots)) {
    const w = weekStart(d);
    by.set(w, [...(by.get(w) ?? []), v]);
  }
  return [...by.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([week, vs]) => ({ week, value: vs.reduce((a, b) => a + b, 0) / vs.length }));
}

/** ¿Te atrasaste? (para recalcular sin culpas). */
export function missedDays(s: ProgressState): number {
  const days = Object.entries(s.fisica.seconds).filter(([, v]) => v > 0).map(([d]) => d).sort();
  const lastAttempt = s.attempts.filter((a) => MISSION_SET.has(a.topicId)).at(-1);
  const last = [days.at(-1), lastAttempt ? dayKey(new Date(lastAttempt.ts)) : undefined].filter(Boolean).sort().at(-1);
  if (!last) return 0;
  return Math.max(0, daysBetween(last, dayKey()) - 1);
}

export function hoursStudied(s: ProgressState): number {
  return Object.values(s.fisica.seconds).reduce((a, b) => a + b, 0) / 3600;
}

export function masteredCount(s: ProgressState) {
  const topics = relevantAreas(s).flatMap((a) => a.topics).filter((t) => getTopic(t));
  const mastered = topics.filter((t) => (topicReadiness(s, t).value ?? 0) >= 0.75).length;
  const weak = topics.filter((t) => {
    const v = topicReadiness(s, t).value;
    return v !== null && v < 0.45;
  }).length;
  return { mastered, total: topics.length, weak };
}

// ───────────── Diagnóstico ─────────────

/** 16 ejercicios cortos que cubren matemática necesaria y todos los temas de los parciales. */
export const DIAG_TOPICS: { topicId: string; area: string }[] = [
  { topicId: "t-despeje", area: "Despeje de fórmulas" },
  { topicId: "t-unidades", area: "Unidades" },
  { topicId: "t-trigonometria", area: "Trigonometría" },
  { topicId: "t-vec-componentes", area: "Vectores" },
  { topicId: "t-vec-operaciones", area: "Vectores" },
  { topicId: "t-graficos-vt", area: "Interpretación de gráficos" },
  { topicId: "t-encuentro", area: "Cinemática" },
  { topicId: "t-frenado", area: "Cinemática" },
  { topicId: "t-caida-libre", area: "Caída libre y tiro" },
  { topicId: "t-tiro-oblicuo", area: "Caída libre y tiro" },
  { topicId: "t-estatica-particula", area: "Estática y momentos" },
  { topicId: "t-momentos", area: "Estática y momentos" },
  { topicId: "t-presion", area: "Hidrostática" },
  { topicId: "t-arquimedes", area: "Hidrostática" },
  { topicId: "t-newton", area: "Dinámica" },
  { topicId: "t-plano-inclinado", area: "Dinámica" },
  { topicId: "t-energia", area: "Trabajo y energía" },
];

export function diagItems(): SessionItem[] {
  return DIAG_TOPICS.filter((d) => getTopic(d.topicId)).map((d) => ({ topicId: d.topicId, difficulty: 2 as Difficulty, label: "¿Qué tan preparado estás?" }));
}

/** Resultado del diagnóstico por área: primer intento de cada tema después de empezar. */
export function diagResults(s: ProgressState) {
  const start = s.fisica.diagStartedAt;
  if (!start) return null;
  const first = new Map<string, boolean>();
  for (const a of s.attempts) if (a.ts >= start && !first.has(a.topicId) && DIAG_TOPICS.some((d) => d.topicId === a.topicId)) first.set(a.topicId, a.correct && !a.usedSolution && a.hints === 0);
  const areas = new Map<string, { ok: number; total: number }>();
  for (const d of DIAG_TOPICS) {
    if (!first.has(d.topicId)) continue;
    const e = areas.get(d.area) ?? { ok: 0, total: 0 };
    e.total++;
    if (first.get(d.topicId)) e.ok++;
    areas.set(d.area, e);
  }
  return [...areas.entries()].map(([area, v]) => {
    // Combina el diagnóstico con lo que ya practicaste de esa área (si hay datos).
    const topics = DIAG_TOPICS.filter((d) => d.area === area).map((d) => d.topicId);
    const rs = topics.map((t) => topicReadiness(s, t).value).filter((x): x is number => x !== null);
    const practiced = rs.length ? rs.reduce((a, b) => a + b, 0) / rs.length : null;
    const value = practiced === null ? v.ok / v.total : 0.6 * (v.ok / v.total) + 0.4 * practiced;
    return { area, ok: v.ok, total: v.total, value };
  });
}

export function areaOfTopic(topicId: string) {
  return AREA_OF[topicId];
}
