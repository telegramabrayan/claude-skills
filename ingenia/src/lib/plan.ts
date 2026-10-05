/**
 * Plan de estudio: con minutos por día, materia prioritaria y (opcional) fecha
 * de examen, reparte las lecciones pendientes y deja los últimos días para
 * repaso y simulacros. Determinístico: el mismo estado da el mismo plan.
 */
import type { ProgressState, StudyPlan } from "@/engine/progress/state";
import { addDays, daysBetween, dayKey } from "@/engine/progress/dates";
import { getSubject } from "@/content/curriculum";
import { getLesson } from "@/content/lessons";

export interface PlanDay {
  day: string;
  items: { kind: "leccion" | "repaso" | "simulacro" | "practica"; title: string; href: string; minutes: number }[];
}

export interface PlanResult {
  days: PlanDay[];
  pendingLessons: number;
  pendingMinutes: number;
  daysLeft: number | null;
  /** true si al ritmo elegido no llegan a verse todas las lecciones antes del examen. */
  tight: boolean;
}

export function buildPlan(s: ProgressState, plan: StudyPlan, horizon = 14, today = dayKey()): PlanResult {
  const subject = getSubject(plan.subjectId);
  const pending = [...new Set((subject?.units ?? []).flatMap((u) => u.lessonIds))]
    .filter((id) => s.lessons[id]?.status !== "completada")
    .map((id) => getLesson(id))
    .filter((l): l is NonNullable<typeof l> => !!l);
  const pendingMinutes = pending.reduce((a, l) => a + l.estimatedMinutes, 0);
  const daysLeft = plan.examDate ? Math.max(0, daysBetween(today, plan.examDate)) : null;
  // Los últimos días antes del examen se reservan para repaso y simulacros.
  const reserve = daysLeft === null ? 0 : Math.min(3, Math.max(1, Math.floor(daysLeft / 5)));
  const studyDays = daysLeft === null ? horizon : Math.max(0, daysLeft - reserve);
  const tight = daysLeft !== null && pendingMinutes > studyDays * plan.minutes * 0.7;
  const span = Math.min(horizon, daysLeft ?? horizon);

  const days: PlanDay[] = [];
  let li = 0;
  for (let i = 0; i < span; i++) {
    const day = addDays(today, i);
    const items: PlanDay["items"] = [];
    const examZone = daysLeft !== null && i >= daysLeft - reserve;
    let budget = plan.minutes;
    if (examZone) {
      items.push({ kind: "simulacro", title: `Simulacro de ${subject?.shortName ?? "examen"}`, href: "/examenes", minutes: Math.min(budget, 40) });
      budget -= Math.min(budget, 40);
      if (budget > 0) items.push({ kind: "repaso", title: "Repaso de temas flojos", href: "/repasar", minutes: budget });
    } else {
      // ~70 % lección nueva, ~30 % repaso: aprender sin olvidar lo anterior.
      const review = Math.max(5, Math.round(plan.minutes * 0.3));
      while (li < pending.length && budget - review >= Math.min(pending[li].estimatedMinutes, 8)) {
        items.push({ kind: "leccion", title: pending[li].title, href: `/leccion/${pending[li].id}`, minutes: pending[li].estimatedMinutes });
        budget -= pending[li].estimatedMinutes;
        li++;
      }
      if (li >= pending.length && budget > review) {
        items.push({ kind: "practica", title: `Práctica de ${subject?.shortName ?? "la materia"}`, href: `/materias/${plan.subjectId}`, minutes: budget - review });
        budget = review;
      }
      items.push({ kind: "repaso", title: "Repaso espaciado", href: "/repasar", minutes: Math.max(5, budget) });
    }
    days.push({ day, items });
  }
  return { days, pendingLessons: pending.length, pendingMinutes, daysLeft, tight };
}
