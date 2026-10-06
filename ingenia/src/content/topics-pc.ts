import type { Topic } from "@/engine/types";

const S = "pensamiento-computacional";

/**
 * Temas de Pensamiento Computacional (Python) alineados con los "slots" del
 * primer parcial de la cátedra. Unidad sugerida en el comentario de cada uno.
 */
export const PC_TOPICS: Topic[] = [
  // pc-tipos
  { id: "t-pc-tipos", name: "Tipos, conversiones y TypeError", subjectId: S, skill: "computacional", generators: ["pc-tipo-error", "pc-tipos-salida"], lessonId: "l-pc-tipos", prerequisites: ["t-variables-codigo"] },
  { id: "t-pc-aritmetica", name: "// y % con negativos", subjectId: S, skill: "aritmetica", generators: ["pc-div-mod"], lessonId: "l-pc-div-mod", prerequisites: ["t-pc-tipos", "t-signos"] },
  { id: "t-pc-funciones", name: "Funciones y abstracción", subjectId: S, skill: "computacional", generators: ["pc-abstraccion"], lessonId: "l-pc-funciones", prerequisites: ["t-pc-ciclos"] },
  // pc-2
  { id: "t-pc-booleanos", name: "Booleanos, precedencia e in range()", subjectId: S, skill: "logica", generators: ["pc-booleanos", "pc-range"], lessonId: "l-pc-booleanos", prerequisites: ["t-condicionales"] },
  { id: "t-pc-condicionales", name: "Condicionales anidados", subjectId: S, skill: "logica", generators: ["pc-if-anidado"], lessonId: "l-pc-div-mod", prerequisites: ["t-pc-aritmetica", "t-condicionales"] },
  // pc-3
  { id: "t-pc-ciclos", name: "Ciclos: contar vueltas y acumular", subjectId: S, skill: "computacional", generators: ["pc-ciclo-lineas", "pc-ciclo-traza"], lessonId: "l-pc-traza", prerequisites: ["t-bucles"] },
  { id: "t-pc-traza", name: "Traza a mano", subjectId: S, skill: "computacional", generators: ["pc-traza"], lessonId: "l-pc-traza", prerequisites: ["t-variables-codigo"] },
  { id: "t-pc-dibujos", name: "Dibujos con ciclos anidados", subjectId: S, skill: "computacional", generators: ["pc-dibujo"], lessonId: "l-pc-dibujos", prerequisites: ["t-pc-ciclos", "t-pc-print"] },
  // pc-datos
  { id: "t-pc-strings", name: "Strings: índices y slicing", subjectId: S, skill: "computacional", generators: ["pc-slicing", "pc-index-slicing"], lessonId: "l-pc-strings", prerequisites: ["t-pc-tipos"] },
  { id: "t-pc-metodos-str", name: "Métodos de strings", subjectId: S, skill: "computacional", generators: ["pc-func-str", "pc-metodos-str"], lessonId: "l-pc-metodos-str", prerequisites: ["t-pc-strings"] },
  { id: "t-pc-listas", name: "Listas y sus métodos", subjectId: S, skill: "computacional", generators: ["pc-listas"], lessonId: "l-pc-listas", prerequisites: ["t-pc-strings"] },
  { id: "t-pc-tuplas", name: "Tuplas y listas de tuplas", subjectId: S, skill: "computacional", generators: ["pc-tuplas"], lessonId: "l-pc-tuplas", prerequisites: ["t-pc-listas"] },
  { id: "t-pc-dicts", name: "Diccionarios", subjectId: S, skill: "computacional", generators: ["pc-dict-replace", "pc-dos-dicts"], lessonId: "l-pc-dicts", prerequisites: ["t-pc-listas", "t-pc-metodos-str"] },
  // pc-io
  { id: "t-pc-print", name: "print: sep y end", subjectId: S, skill: "computacional", generators: ["pc-print"], lessonId: "l-pc-print", prerequisites: ["t-variables-codigo"] },
];
