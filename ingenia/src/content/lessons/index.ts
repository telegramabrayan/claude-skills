import type { Lesson } from "@/engine/types";
import { aritmeticaLessons } from "./aritmetica";
import { algebraLessons } from "./algebra";
import { funcionesLessons } from "./funciones";
import { fisicaLessons } from "./fisica";
import { codigoLessons } from "./codigo";
import { precalculoLessons } from "./precalculo";

/** Todas las lecciones disponibles. Para agregar una, creala en su archivo y sumala acá. */
export const LESSONS: Lesson[] = [...aritmeticaLessons, ...algebraLessons, ...funcionesLessons, ...fisicaLessons, ...codigoLessons, ...precalculoLessons];

const BY_ID = new Map(LESSONS.map((l) => [l.id, l]));

export function getLesson(id: string): Lesson | undefined {
  return BY_ID.get(id);
}
