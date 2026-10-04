import type { ProgressState } from "@/engine/progress/state";
import { levelInfo, MASTERED } from "@/engine/progress/rules";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  /** Si no tiene `check`, se otorga por un evento explícito (p. ej. desde el laboratorio). */
  check?: (s: ProgressState) => boolean;
}

const mastered = (s: ProgressState, topic: string) => (s.topics[topic]?.mastery ?? 0) >= MASTERED;

function longestCleanRun(s: ProgressState): number {
  let best = 0;
  let run = 0;
  for (const a of s.attempts) {
    if (a.correct && a.hints === 0 && !a.usedSolution) best = Math.max(best, ++run);
    else run = 0;
  }
  return best;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "punto-partida", title: "Punto de partida", description: "Completaste el diagnóstico inicial.", icon: "🧭", check: (s) => !!s.diagnostic },
  { id: "primer-acierto", title: "Primer paso", description: "Resolviste tu primer ejercicio.", icon: "👣", check: (s) => s.attempts.some((a) => a.correct) },
  { id: "primera-leccion", title: "Arrancamos", description: "Completaste tu primera lección.", icon: "📘", check: (s) => Object.values(s.lessons).some((l) => l.status === "completada") },
  { id: "aprender-del-error", title: "Aprender del error", description: "Acertaste un tema justo después de equivocarte en él.", icon: "🔁", check: (s) => s.attempts.some((a, i) => i > 0 && a.correct && !s.attempts[i - 1].correct && s.attempts[i - 1].topicId === a.topicId) },
  { id: "diez-sin-errores", title: "10 ejercicios sin errores", description: "Diez aciertos seguidos sin pistas.", icon: "🎯", check: (s) => longestCleanRun(s) >= 10 },
  { id: "cien-ejercicios", title: "100 ejercicios resueltos", description: "Cien ejercicios correctos en total.", icon: "💯", check: (s) => s.attempts.filter((a) => a.correct).length >= 100 },
  { id: "racha-7", title: "7 días estudiando", description: "Una semana de racha.", icon: "🔥", check: (s) => s.streak.longest >= 7 },
  { id: "racha-30", title: "Un mes sin cortar", description: "30 días de racha.", icon: "🌋", check: (s) => s.streak.longest >= 30 },
  { id: "signos-domados", title: "Signos domados", description: "Dominás los números negativos.", icon: "➖", check: (s) => mastered(s, "t-signos") },
  { id: "balanza", title: "Maestro de la balanza", description: "Dominás las ecuaciones lineales.", icon: "⚖️", check: (s) => mastered(s, "t-ecuaciones") },
  { id: "sobreviviste-despeje", title: "Sobreviviste al álgebra", description: "Completaste el Nivel 1 de Preparación.", icon: "🧗", check: (s) => !!s.units["nivel-1"] },
  { id: "dominador-vectores", title: "Dominador de vectores", description: "Dominás el tema vectores.", icon: "🏹", check: (s) => mastered(s, "t-vectores") },
  { id: "cinematica", title: "En movimiento", description: "Completaste la Unidad de Cinemática.", icon: "🏎️", check: (s) => !!s.units["fis-2"] },
  { id: "preparado", title: "Listo para el CBC", description: "Completaste los cinco niveles de Preparación.", icon: "🎓", check: (s) => ["nivel-0", "nivel-1", "nivel-2", "nivel-3", "nivel-4"].every((u) => s.units[u]) },
  { id: "primer-programa", title: "Hola, mundo", description: "Ejecutaste tu primer programa en el laboratorio.", icon: "💻" },
  { id: "primera-funcion", title: "Primera función programada", description: "Definiste y usaste una función con def.", icon: "🧩" },
  { id: "retador", title: "Retador", description: "Superaste tu primer desafío.", icon: "⚔️", check: (s) => s.challengesWon >= 1 },
  { id: "examen-aprobado", title: "Aprobado", description: "Sacaste 4 o más en un examen.", icon: "📝", check: (s) => s.exams.some((e) => e.score >= 4) },
  { id: "diez", title: "Diez", description: "Sacaste un 10 en un examen.", icon: "🏆", check: (s) => s.exams.some((e) => e.score >= 10) },
  { id: "nivel-5", title: "Nivel 5", description: "Llegaste al nivel 5.", icon: "⭐", check: (s) => levelInfo(s.xp).level >= 5 },
  { id: "nivel-10", title: "Nivel 10", description: "Llegaste al nivel 10.", icon: "🌟", check: (s) => levelInfo(s.xp).level >= 10 },
];

/** Logros nuevos que el estado actual habilita. */
export function newlyUnlocked(s: ProgressState): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.check && !s.achievements[a.id] && a.check(s));
}
