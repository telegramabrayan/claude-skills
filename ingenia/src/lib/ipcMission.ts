/**
 * Modo examen de IPC: preparación por tema (con tus datos reales), plan de
 * las horas que quedan y sesiones (diagnóstico, simulacro, errores).
 */
import type { ProgressState } from "@/engine/progress/state";
import type { Difficulty } from "@/engine/types";
import type { SessionItem } from "@/components/session/Session";
import { getTopic } from "@/content/topics";
import { IPC_EXAM, type IpcParcial, type IpcTopicInfo } from "@/content/ipc/mission";
import { freshGenerator, itemsFor, practiceLevel, topicReadiness } from "./fisicaMission";

export function examTopics(p: IpcParcial): IpcTopicInfo[] {
  return IPC_EXAM[p].topics.filter((t) => getTopic(t.topicId)?.generators.length);
}

/** Preparación del parcial: promedio de los temas ponderado por cuántas preguntas toman. Sin práctica cuenta 0. */
export function ipcReadiness(s: ProgressState, p = s.ipc.parcial): { value: number; coverage: number } {
  const ts = examTopics(p).filter((t) => t.questions > 0);
  const total = ts.reduce((a, t) => a + t.questions, 0) || 1;
  let v = 0;
  let cov = 0;
  for (const t of ts) {
    const r = topicReadiness(s, t.topicId).value;
    if (r !== null) cov += t.questions;
    v += (r ?? 0) * t.questions;
  }
  return { value: v / total, coverage: cov / total };
}

/** Prioridad 1–5: cuánto toman × cuánto te falta. */
export function ipcPriority(s: ProgressState, t: IpcTopicInfo): number {
  const r = topicReadiness(s, t.topicId).value;
  const need = 1 - (r ?? 0.3);
  const w = t.support ? 0.4 : t.questions;
  return Math.max(1, Math.min(5, Math.round(1 + 4 * need * Math.min(1, w / 1.5))));
}

export function rankedIpcTopics(s: ProgressState, p = s.ipc.parcial) {
  return examTopics(p)
    .map((t) => {
      const r = topicReadiness(s, t.topicId).value;
      return { t, r, score: (t.support ? 0.4 : t.questions) * (1 - (r ?? 0.3)) };
    })
    .sort((a, b) => b.score - a.score);
}

// ───────── Plan de las horas que quedan ─────────

export type IpcBlockKind = "diag" | "topic" | "pausa" | "simulacro" | "errores" | "final";

export interface IpcBlock {
  key: string;
  kind: IpcBlockKind;
  title: string;
  detail: string;
  minutes: number;
  icon: string;
  topicId?: string;
}

/**
 * Arma el plan para los minutos que vas a estudiar: diagnóstico (si no lo
 * hiciste), los temas en orden de prioridad (ficha + práctica), un
 * simulacro con su revisión de errores y un repaso final con el checklist.
 * Pausa corta cada dos bloques.
 */
export function buildIpcPlan(s: ProgressState): IpcBlock[] {
  const p = s.ipc.parcial;
  const total = Math.max(30, s.ipc.studyMin);
  const withSim = total >= 60;
  const final: IpcBlock = { key: "final", kind: "final", title: "Repaso final + checklist", detail: "Trampas de tus 3 temas más flojos y la rutina para la opción múltiple.", minutes: 10, icon: "✅" };
  const sim: IpcBlock = { key: "simulacro", kind: "simulacro", title: `Simulacro ${IPC_EXAM[p].title}`, detail: "10 preguntas con cronómetro, ejercicios nuevos con el formato del parcial.", minutes: 20, icon: "📝" };
  const err: IpcBlock = { key: "errores", kind: "errores", title: "Revisar errores", detail: "Los temas que fallaste en el simulacro y en la práctica.", minutes: 10, icon: "❌" };

  let budget = total - final.minutes - (withSim ? sim.minutes + err.minutes : 0);
  const study: IpcBlock[] = [];
  if (!s.ipc.diagDoneAt && budget >= 25) {
    study.push({ key: "diag", kind: "diag", title: "Diagnóstico express", detail: "Una pregunta por tema para saber por dónde empezar.", minutes: 12, icon: "🎯" });
    budget -= 12;
  }
  const ranked = rankedIpcTopics(s, p);
  const queue = [...ranked.filter((x) => (x.r ?? 0) < 0.85), ...ranked.filter((x) => (x.r ?? 0) < 0.65)]; // segunda vuelta a los flojos
  let round = 0;
  for (const x of queue.length ? queue : ranked) {
    if (budget < 12) break;
    const second = study.some((b) => b.topicId === x.t.topicId);
    round++;
    study.push({
      key: `topic:${x.t.topicId}${second ? ":2" : ""}`,
      kind: "topic",
      topicId: x.t.topicId,
      title: `${x.t.icon} ${x.t.short}${second ? " (tipo parcial)" : ""}`,
      detail: second ? "Segunda vuelta, ejercicios más difíciles." : "Ficha (3 min) + 5 ejercicios.",
      minutes: 12,
      icon: x.t.icon,
    });
    budget -= 12;
    if (round % 2 === 0 && budget >= 17) {
      study.push({ key: `pausa:${round}`, kind: "pausa", title: "Pausa", detail: "Levantate, agua, nada de pantallas. 5 minutos.", minutes: 5, icon: "☕" });
      budget -= 5;
    }
  }
  if (study[study.length - 1]?.kind === "pausa") study.pop();
  if (!withSim) return [...study, final];
  const cut = Math.max(1, Math.ceil(study.length * 0.65));
  return [...study.slice(0, cut), sim, err, ...study.slice(cut), final];
}

// ───────── Sesiones ─────────

export function ipcDiagItems(p: IpcParcial): SessionItem[] {
  return examTopics(p)
    .filter((t) => t.questions > 0)
    .map((t) => ({ topicId: t.topicId, difficulty: 3 as Difficulty, label: t.short }));
}

export function ipcSimItems(s: ProgressState, p: IpcParcial): SessionItem[] {
  const out: SessionItem[] = [];
  for (const t of examTopics(p))
    for (let i = 0; i < t.questions; i++) out.push({ topicId: t.topicId, difficulty: (out.length % 3 === 2 ? 6 : 5) as Difficulty, generator: freshGenerator(s, t.topicId, i + 1), label: t.short, points: 1 });
  return out;
}

export function ipcTopicItems(s: ProgressState, topicId: string, hard = false): SessionItem[] {
  const r = topicReadiness(s, topicId).value;
  const lvl = hard ? 4 : Math.min(3, practiceLevel(r));
  return itemsFor(s, topicId, 5, lvl as 1 | 2 | 3 | 4 | 5);
}

const IPC_SET = new Set([...IPC_EXAM["1P"].topics, ...IPC_EXAM["2P"].topics].map((t) => t.topicId));

export function ipcErrors(s: ProgressState, days = 7) {
  const since = Date.now() - days * 86400000;
  const map = new Map<string, number>();
  for (const a of s.attempts) if (!a.correct && a.ts >= since && IPC_SET.has(a.topicId)) map.set(a.topicId, (map.get(a.topicId) ?? 0) + 1);
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

export function ipcErrorItems(s: ProgressState, n = 8): SessionItem[] {
  const errs = ipcErrors(s);
  if (!errs.length) return [];
  return Array.from({ length: n }, (_, i) => {
    const [topicId] = errs[i % errs.length];
    return { topicId, adjust: -1, generator: freshGenerator(s, topicId, i), label: "Por un error tuyo" };
  });
}

/** Lo más importante: los temas con más prioridad, 2 ejercicios de nivel parcial cada uno. */
export function ipcImportantItems(s: ProgressState, n = 8): SessionItem[] {
  const top = rankedIpcTopics(s).filter((x) => !x.t.support).slice(0, Math.ceil(n / 2));
  return Array.from({ length: n }, (_, i) => {
    const t = top[i % top.length].t;
    return { topicId: t.topicId, difficulty: 5 as Difficulty, generator: freshGenerator(s, t.topicId, i), label: t.short };
  });
}

// ───────── Tiempo ─────────

/** Examen por defecto: dentro de 6 h, redondeado a la media hora siguiente. */
export function defaultExamAt(now = Date.now()): number {
  const t = now + 6 * 3600000;
  return Math.ceil(t / 1800000) * 1800000;
}

export function fmtClock(ms: number): string {
  return new Date(ms).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
}

export function fmtLeft(ms: number): string {
  if (ms <= 0) return "¡ya!";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h ? `${h} h ${String(m).padStart(2, "0")} min` : `${m} min`;
}
