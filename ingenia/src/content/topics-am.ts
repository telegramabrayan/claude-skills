import type { SkillId, Topic } from "@/engine/types";

const t = (id: string, name: string, skill: SkillId, generators: string[], lessonId: string, prerequisites: string[] = []): Topic => ({
  id,
  name,
  subjectId: "am-a",
  skill,
  generators,
  lessonId,
  prerequisites,
});

/** Temas de Análisis Matemático A (unidades sugeridas en el comentario de cada uno). */
export const AM_TOPICS: Topic[] = [
  // am-4
  t("t-am-lim-indeterminadas", "Límites ∞ − ∞ y 0/0 con raíces", "funciones", ["am-lim-raices", "am-lim-conjugado"], "l-am-lim-raices", ["t-limites", "t-factorizacion"]),
  t("t-am-lim-infinito", "Límites ∞/∞ y funciones acotadas", "funciones", ["am-lim-infinito"], "l-am-lim-infinito", ["t-limites"]),
  t("t-am-lim-e", "Límites 1^∞ y el número e", "funciones", ["am-lim-e"], "l-am-lim-e", ["t-am-lim-infinito", "t-potencias"]),
  t("t-am-continuidad", "Continuidad y funciones partidas", "funciones", ["am-continuidad-param"], "l-am-continuidad", ["t-limites", "t-am-lim-indeterminadas"]),
  t("t-am-asintotas", "Asíntotas", "graficos", ["am-asintotas", "am-asintota-oblicua"], "l-am-asintotas", ["t-am-lim-infinito", "t-dominio"]),
  // am-5
  t("t-am-reglas-derivacion", "Reglas de derivación", "funciones", ["am-derivada-reglas"], "l-am-reglas-derivacion", ["t-derivadas"]),
  t("t-am-recta-tangente", "Recta tangente", "graficos", ["am-tangente", "am-tangente-datos"], "l-am-recta-tangente", ["t-am-reglas-derivacion", "t-recta"]),
  t("t-am-derivabilidad", "Derivabilidad", "funciones", ["am-derivabilidad"], "l-am-derivabilidad", ["t-am-continuidad", "t-am-reglas-derivacion"]),
  // am-6
  t("t-am-lhopital", "Regla de L'Hôpital", "funciones", ["am-lhopital"], "l-am-lhopital", ["t-am-reglas-derivacion", "t-am-lim-indeterminadas"]),
  // am-7
  t("t-am-estudio-funcion", "Estudio de funciones", "graficos", ["am-estudio-funcion"], "l-am-estudio-funcion", ["t-am-reglas-derivacion", "t-dominio", "t-am-asintotas"]),
  t("t-am-extremos-absolutos", "Extremos absolutos", "funciones", ["am-extremos-absolutos"], "l-am-extremos-absolutos", ["t-am-estudio-funcion"]),
  // am-8
  t("t-am-taylor", "Polinomio de Taylor", "funciones", ["am-taylor"], "l-am-taylor", ["t-am-reglas-derivacion"]),
  // am-9
  t("t-am-primitivas", "Primitivas: inmediatas y sustitución", "funciones", ["am-primitivas"], "l-am-primitivas", ["t-am-reglas-derivacion"]),
  t("t-am-partes-fracciones", "Integración por partes y fracciones simples", "funciones", ["am-primitivas-partes"], "l-am-partes-fracciones", ["t-am-primitivas", "t-factorizacion"]),
  // @@TOPICS@@
];
