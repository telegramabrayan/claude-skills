import type { Lesson } from "@/engine/types";
import { aritmeticaLessons } from "./aritmetica";
import { algebraLessons } from "./algebra";
import { funcionesLessons } from "./funciones";
import { fisicaLessons } from "./fisica";
import { codigoLessons } from "./codigo";
import { precalculoLessons } from "./precalculo";
import { fisicaLessons as fisicaV3Lessons } from "./fisica-v3";

/** Todas las lecciones disponibles. Para agregar una, creala en su archivo y sumala acá. */
export const LESSONS: Lesson[] = [...aritmeticaLessons, ...algebraLessons, ...funcionesLessons, ...fisicaLessons, ...codigoLessons, ...precalculoLessons, ...fisicaV3Lessons];

const BY_ID = new Map(LESSONS.map((l) => [l.id, l]));

export function getLesson(id: string): Lesson | undefined {
  return BY_ID.get(id);
}

/**
 * Pantallas de la lección tal como se muestran: si el tema se apoya en otros,
 * después de la introducción va una comprobación rápida de esas bases.
 */
export function lessonCards(lesson: Lesson): Lesson["cards"] {
  if (!lesson.prerequisites.length || lesson.cards.some((c) => c.kind === "check")) return lesson.cards;
  const at = lesson.cards[0]?.kind === "intro" ? 1 : 0;
  return [...lesson.cards.slice(0, at), { kind: "check", title: "¿Tenés las bases?", topics: lesson.prerequisites }, ...lesson.cards.slice(at)];
}
