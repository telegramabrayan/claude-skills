/** Qué dice Nodo según el contexto. Frases cortas, sin tono infantil. */
import type { ProgressState } from "@/engine/progress/state";
import { currentStreak, recurringErrors } from "@/engine/progress/rules";
import { addDays, dayKey } from "@/engine/progress/dates";
import { ERROR_LABELS, ERROR_REMEDIATION, getTopic } from "@/content/topics";
import type { Mood } from "@/components/guide/Nodo";

const pick = <T,>(arr: T[], seed: number): T => arr[Math.abs(seed) % arr.length];

export function homeMessage(s: ProgressState): { text: string; mood: Mood } {
  const today = dayKey();
  const todayStats = s.days[today];
  const streak = currentStreak(s);
  const recurring = recurringErrors(s)[0];
  if (recurring && ERROR_REMEDIATION[recurring]) {
    return { text: `Parece que los errores de ${ERROR_LABELS[recurring].toLowerCase()} te están complicando. Te recomiendo un repaso rápido de ${getTopic(ERROR_REMEDIATION[recurring]!)?.name.toLowerCase()}.`, mood: "thinking" };
  }
  if (!s.attempts.length && !Object.keys(s.lessons).length) return { text: "Arranquemos con algo corto. Una lección son unos 10 minutos.", mood: "happy" };
  if (todayStats && todayStats.exercises >= 5) return { text: pick(["Buen trabajo hoy.", "Hoy ya sumaste práctica real. Si querés, un repaso corto cierra el día.", "Muy buen ritmo."], todayStats.exercises), mood: "happy" };
  if (streak > 0 && s.streak.lastDay === addDays(today, -1)) return { text: `Llevás ${streak} ${streak === 1 ? "día" : "días"} de racha. Una lección corta la mantiene.`, mood: "neutral" };
  if (streak === 0 && s.streak.longest > 0) return { text: "Volviste. Tu progreso sigue intacto: retomemos donde quedaste.", mood: "happy" };
  return { text: "Sigamos por el camino: el próximo paso ya está marcado.", mood: "neutral" };
}

export function correctMessage(seed: number, levelUp: boolean): string {
  if (levelUp) return "Probemos uno un poco más difícil.";
  return pick(["Bien.", "Correcto.", "Eso es.", "Exacto.", "Buen razonamiento."], seed);
}

export function wrongMessage(seed: number, common: boolean): string {
  if (common) return "Este error es muy común. Veamos dónde está.";
  return pick(["Casi. Revisemos juntos.", "No pasa nada: equivocarse es parte del proceso.", "Este ejercicio suele confundir."], seed);
}
