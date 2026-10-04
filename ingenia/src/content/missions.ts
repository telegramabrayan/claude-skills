import type { ProgressState } from "@/engine/progress/state";
import { addDays, dayKey, weekStart } from "@/engine/progress/dates";
import { getTopic } from "./topics";

export interface Mission {
  key: string; // única por período: "d:2026-10-04:ejercicios-5"
  kind: "diaria" | "semanal" | "especial";
  title: string;
  target: number;
  progress: number;
  xp: number;
  claimed: boolean;
}

interface Template {
  id: string;
  title: string;
  target: number;
  xp: number;
  measure: (s: ProgressState, from: string, to: string) => number;
}

const attemptsBetween = (s: ProgressState, from: string, to: string) =>
  s.attempts.filter((a) => {
    const k = dayKey(new Date(a.ts));
    return k >= from && k <= to;
  });

const sumDays = (s: ProgressState, from: string, to: string, f: (d: ProgressState["days"][string]) => number) =>
  Object.entries(s.days).reduce((acc, [k, d]) => (k >= from && k <= to ? acc + f(d) : acc), 0);

const DAILY: Template[] = [
  { id: "ejercicios-5", title: "Resolvé 5 ejercicios correctamente", target: 5, xp: 20, measure: (s, f, t) => attemptsBetween(s, f, t).filter((a) => a.correct).length },
  { id: "leccion-1", title: "Completá 1 lección", target: 1, xp: 20, measure: (s, f, t) => sumDays(s, f, t, (d) => d.lessons) },
  { id: "xp-50", title: "Ganá 50 XP", target: 50, xp: 15, measure: (s, f, t) => sumDays(s, f, t, (d) => d.xp) },
  { id: "minutos-15", title: "Estudiá 15 minutos", target: 15, xp: 20, measure: (s, f, t) => Math.floor(sumDays(s, f, t, (d) => d.seconds) / 60) },
  { id: "repaso-3", title: "Repasá 3 ejercicios de temas anteriores", target: 3, xp: 20, measure: (s, f, t) => attemptsBetween(s, f, t).filter((a) => a.mode === "repaso" || a.mode === "entrenamiento").length },
  { id: "sin-ayuda-3", title: "Resolvé 3 ejercicios sin pistas", target: 3, xp: 15, measure: (s, f, t) => attemptsBetween(s, f, t).filter((a) => a.correct && a.hints === 0 && !a.usedSolution).length },
  { id: "algebra-5", title: "Resolvé 5 ejercicios de álgebra", target: 5, xp: 20, measure: (s, f, t) => attemptsBetween(s, f, t).filter((a) => a.correct && getTopic(a.topicId)?.skill === "algebra").length },
];

const WEEKLY: Template[] = [
  { id: "dias-4", title: "Estudiá 4 días esta semana", target: 4, xp: 60, measure: (s, f, t) => Object.entries(s.days).filter(([k, d]) => k >= f && k <= t && (d.exercises > 0 || d.lessons > 0)).length },
  { id: "ejercicios-40", title: "Resolvé 40 ejercicios", target: 40, xp: 60, measure: (s, f, t) => attemptsBetween(s, f, t).filter((a) => a.correct).length },
  { id: "unidad-1", title: "Completá una unidad", target: 1, xp: 80, measure: (s, f, t) => Object.values(s.units).filter((k) => k >= f && k <= t).length },
  { id: "examen-1", title: "Hacé un examen o un mini test", target: 1, xp: 50, measure: (s, f, t) => s.exams.filter((e) => { const k = dayKey(new Date(e.ts)); return k >= f && k <= t; }).length },
];

function longestNoSolutionRun(s: ProgressState): number {
  let best = 0, run = 0;
  for (const a of s.attempts) {
    if (a.correct && !a.usedSolution) best = Math.max(best, ++run);
    else run = 0;
  }
  return best;
}

/** Elige 3 misiones diarias distintas de forma determinística según la fecha. */
function pickDaily(today: string): Template[] {
  let h = 0;
  for (const c of today) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const pool = [...DAILY];
  const out: Template[] = [];
  for (let i = 0; i < 3; i++) out.push(pool.splice((h >> (i * 3)) % pool.length, 1)[0]);
  return out;
}

export function currentMissions(s: ProgressState, today = dayKey()): Mission[] {
  const ws = weekStart(today);
  const we = addDays(ws, 6);
  const daily = pickDaily(today).map((t) => {
    const key = `d:${today}:${t.id}`;
    return { key, kind: "diaria" as const, title: t.title, target: t.target, xp: t.xp, progress: Math.min(t.target, t.measure(s, today, today)), claimed: !!s.missions[key] };
  });
  const weekly = WEEKLY.map((t) => {
    const key = `w:${ws}:${t.id}`;
    return { key, kind: "semanal" as const, title: t.title, target: t.target, xp: t.xp, progress: Math.min(t.target, t.measure(s, ws, we)), claimed: !!s.missions[key] };
  });
  const special: Mission = {
    key: "e:sin-solucion-10",
    kind: "especial",
    title: "Resolvé 10 ejercicios seguidos sin pedir la solución",
    target: 10,
    xp: 100,
    progress: Math.min(10, longestNoSolutionRun(s)),
    claimed: !!s.missions["e:sin-solucion-10"],
  };
  return [...daily, ...weekly, special];
}
