/**
 * MODO EMERGENCIA de IPC: el plan se arma con el TIEMPO QUE QUEDA de verdad
 * y se rearma en cada render (si empezás con 2 h 45 min o con 1 h 20 min,
 * el plan es otro). Prioriza por peso en las claves × lo que no dominás.
 */
import type { ProgressState } from "@/engine/progress/state";
import { CONCEPT, QUICK, type QuickMode } from "@/content/ipc/emergency";
import { IPC_EXAM, type IpcTopicInfo } from "@/content/ipc/mission";
import { topicReadiness } from "./fisicaMission";
import { examTopics, ipcErrors } from "./ipcMission";

/** Nivel de un tema: ejercicios (dominio real) + preguntas rápidas del modo emergencia. */
export function topicLevel(s: ProgressState, topicId: string): number | null {
  const r = topicReadiness(s, topicId).value;
  const q = (s.ipc.qlog ?? []).filter((x) => x.topicId === topicId).slice(-6);
  const qa = q.length ? q.filter((x) => x.ok).length / q.length : null;
  if (r === null && qa === null) return null;
  if (r === null) return qa! * 0.8;
  if (qa === null) return r;
  return 0.6 * r + 0.4 * qa;
}

export type Tier = "urgente" | "repasar" | "dominado" | "sin-datos";
export function tierOf(v: number | null): Tier {
  if (v === null) return "sin-datos";
  return v >= 0.75 ? "dominado" : v >= 0.45 ? "repasar" : "urgente";
}
export const TIER_INFO: Record<Tier, { icon: string; label: string }> = {
  urgente: { icon: "🔴", label: "Urgente" },
  repasar: { icon: "🟡", label: "Repasar" },
  dominado: { icon: "🟢", label: "Dominado" },
  "sin-datos": { icon: "⚪", label: "Sin datos" },
};

/** examPriority 0..1: preguntas en las claves × importancia × lo que falta (sin datos cuenta como flojo). */
export function examPriority(s: ProgressState, t: IpcTopicInfo): number {
  const v = topicLevel(s, t.topicId);
  const tier = CONCEPT[t.topicId]?.tier ?? "conviene";
  const imp = tier === "necesitas" ? 1 : tier === "conviene" ? 0.6 : 0.3;
  const w = t.support ? 0.4 : Math.min(1, t.questions / 1.5 + 0.3);
  return w * imp * (1 - (v ?? 0.35));
}

export function prioritized(s: ProgressState) {
  return examTopics(s.ipc.parcial)
    .map((t) => ({ t, v: topicLevel(s, t.topicId), p: examPriority(s, t), tier: tierOf(topicLevel(s, t.topicId)), need: CONCEPT[t.topicId]?.tier ?? "conviene" }))
    .sort((a, b) => b.p - a.p);
}

export function minutesLeft(s: ProgressState, now = Date.now()): number | null {
  return s.ipc.examAt ? Math.floor((s.ipc.examAt - now) / 60000) : null;
}

export type EPhase = "intensivo" | "recta-final" | "ultra" | "examen";
export function phaseOf(min: number | null): EPhase {
  if (min === null) return "intensivo";
  if (min <= 0) return "examen";
  if (min <= 15) return "ultra";
  if (min <= 30) return "recta-final";
  return "intensivo";
}
export const PHASE: Record<EPhase, { icon: string; title: string; text: string }> = {
  intensivo: { icon: "🔥", title: "Preparación intensiva", text: "Primero lo urgente que más toman; simulacro corto en el medio." },
  "recta-final": { icon: "🚨", title: "Recta final", text: "Nada de temas grandes nuevos: errores, diferencias y preguntas rápidas." },
  ultra: { icon: "🧠", title: "Repaso ultrarrápido", text: "Solo lo imprescindible: el resumen de 5 minutos y tus errores." },
  examen: { icon: "🍀", title: "¡Es la hora!", text: "Respirá. Leé todas las opciones y cuidá las palabras trampa." },
};

export type EKind = "diag" | "topic" | "quick" | "pausa" | "minisim" | "errores" | "simfinal" | "flash" | "resumen";
export interface EBlock {
  key: string;
  kind: EKind;
  title: string;
  detail: string;
  minutes: number;
  icon: string;
  topicId?: string;
  mode?: QuickMode;
}

/**
 * Plan para el tiempo que queda (menos 5 min de margen). Se recalcula
 * siempre: lo hecho no vuelve a aparecer y lo que no entra se cae, empezando
 * por lo de menor prioridad.
 */
export function emergencyPlan(s: ProgressState, now = Date.now()): EBlock[] {
  const left = minutesLeft(s, now);
  const avail = Math.max(10, Math.min(240, (left ?? 180) - 5));
  const done = new Set(s.ipc.done);
  const phase = phaseOf(left);
  const P = IPC_EXAM[s.ipc.parcial].title;
  const errs = ipcErrors(s).length + (s.ipc.qlog ?? []).filter((x) => !x.ok).length;
  const out: EBlock[] = [];
  const add = (b: EBlock) => {
    if (!done.has(b.key)) out.push(b);
  };
  const resumen: EBlock = { key: "resumen", kind: "resumen", title: "IPC en 5 minutos", detail: "Solo lo imprescindible + tus errores de hoy.", minutes: 5, icon: "⚡" };
  if (phase === "ultra" || phase === "examen") {
    add(resumen);
    if (errs) add({ key: "flash-final", kind: "flash", title: "Tarjetas de tus errores", detail: "Recordar sin mirar, después comprobar.", minutes: 5, icon: "🃏" });
    return out;
  }
  const tail: EBlock[] = [];
  // Recta final (los últimos ~30 min).
  if (avail >= 50) tail.push({ key: "simfinal", kind: "simfinal", title: `Simulacro final · ${P}`, detail: "Generado a partir de los patrones de las claves cargadas. Sin ayudas.", minutes: 20, icon: "🎯" });
  tail.push({ key: "errores-final", kind: "errores", title: "Repasar mis errores", detail: "Solo lo que respondiste mal hoy.", minutes: 8, icon: "🔥" });
  tail.push({ key: "flash", kind: "flash", title: "Flashcards de emergencia", detail: "Autores, diferencias y confusiones.", minutes: 6, icon: "🃏" });
  tail.push(resumen);
  let budget = avail - tail.filter((b) => !done.has(b.key)).reduce((a, b) => a + b.minutes, 0);
  if (phase === "recta-final") {
    add({ key: "quick-vf-final", kind: "quick", mode: "vf", title: "Verdadero o falso rápido", detail: "Muchos conceptos en pocos minutos.", minutes: 5, icon: "⚡" });
    tail.forEach((b) => b.kind !== "simfinal" && add(b));
    return out;
  }
  if (!s.ipc.diagDoneAt && budget >= 40) {
    add({ key: "diag", kind: "diag", title: "Diagnóstico express", detail: "Una pregunta por tema (10–12 min). Con esto se ordena todo lo demás.", minutes: 12, icon: "⚡" });
    budget -= 12;
  }
  const ranked = prioritized(s).filter((x) => x.tier !== "dominado" || x.need === "necesitas");
  const topics = ranked.filter((x) => x.tier !== "dominado");
  const retention = ranked.filter((x) => x.tier === "dominado").slice(0, 1); // comprobar que lo seguís sabiendo
  const queue = [...topics, ...retention];
  const quickModes: [QuickMode, string, string][] = [
    ["quien", "¿De quién es esta idea?", "Diferenciar autores."],
    ["trampa", "Palabra trampa", "«Siempre», «puede», «necesariamente»…"],
    ["error", "Encontrá el error", "Afirmaciones casi correctas."],
  ];
  let i = 0;
  let sinceBreak = 0;
  let miniDone = done.has("minisim");
  const minisimAt = Math.max(2, Math.round(queue.length * 0.4));
  for (const x of queue) {
    const isRet = x.tier === "dominado";
    const m = isRet ? 4 : 8;
    if (budget < m) break;
    add({ key: `topic:${x.t.topicId}`, kind: "topic", topicId: x.t.topicId, title: `${x.t.icon} ${x.t.short}`, detail: isRet ? "Ya lo dominás: 2 preguntas para comprobar que lo recordás." : `${TIER_INFO[x.tier].icon} ${CONCEPT[x.t.topicId]?.tier === "necesitas" ? "NECESITÁS saberlo" : "Conviene saberlo"} · explicación rápida + preguntas.`, minutes: m, icon: x.t.icon });
    budget -= m;
    sinceBreak += m;
    i++;
    if (i % 2 === 0 && quickModes.length && budget >= 6) {
      const [mode, t, d] = quickModes.shift()!;
      add({ key: `quick-${mode}`, kind: "quick", mode, title: t, detail: d, minutes: 5, icon: "⚡" });
      budget -= 5;
      sinceBreak += 5;
    }
    if (!miniDone && i === minisimAt && budget >= 25) {
      add({ key: "minisim", kind: "minisim", title: "Mini simulacro", detail: "10 preguntas sin ayudas. Después te digo qué priorizar.", minutes: 15, icon: "📝" });
      add({ key: "errores-1", kind: "errores", title: "Corregir lo del mini simulacro", detail: "Tus errores, explicados.", minutes: 8, icon: "❌" });
      budget -= 23;
      miniDone = true;
      sinceBreak += 23;
    }
    if (sinceBreak >= 35 && budget >= 15) {
      add({ key: `pausa-${i}`, kind: "pausa", title: "Pausa", detail: "5 minutos: levantate, agua, sin pantallas.", minutes: 5, icon: "☕" });
      budget -= 5;
      sinceBreak = 0;
    }
  }
  tail.forEach(add);
  return out;
}

/** Preguntas rápidas del parcial elegido, con las falladas recientes primero. */
export function quickQuestions(s: ProgressState, mode?: QuickMode | "errores", topicId?: string) {
  const log = s.ipc.qlog ?? [];
  const wrong = new Set(log.filter((x) => !x.ok).map((x) => x.id));
  const okRecent = new Set(log.filter((x) => x.ok && Date.now() - x.ts < 3600000).map((x) => x.id));
  let qs = QUICK.filter((q) => q.parcial === s.ipc.parcial);
  if (mode === "errores") qs = QUICK.filter((q) => wrong.has(q.id) && !okRecent.has(q.id));
  else if (mode) qs = qs.filter((q) => q.mode === mode);
  if (topicId) qs = QUICK.filter((q) => q.topicId === topicId);
  return [...qs].sort((a, b) => Number(wrong.has(b.id)) - Number(wrong.has(a.id)) || Number(okRecent.has(a.id)) - Number(okRecent.has(b.id)));
}
