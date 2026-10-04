import type { Difficulty, SkillId } from "@/engine/types";

/**
 * Diagnóstico inicial: por cada habilidad, tres ítems de dificultad creciente.
 * Si el estudiante falla uno, no se le muestran los más difíciles de esa
 * habilidad (evita frustración y acorta la prueba).
 */
export interface DiagnosticItem {
  generator: string;
  difficulty: Difficulty;
  seed: number;
  weight: number;
}

export const DIAGNOSTIC: { skill: SkillId; intro: string; items: DiagnosticItem[] }[] = [
  { skill: "aritmetica", intro: "Empecemos con cuentas.", items: [
    { generator: "signos-suma", difficulty: 2, seed: 101, weight: 1 },
    { generator: "fracciones-suma", difficulty: 3, seed: 102, weight: 2 },
    { generator: "potencias", difficulty: 4, seed: 103, weight: 3 },
  ] },
  { skill: "algebra", intro: "Ahora un poco de álgebra.", items: [
    { generator: "ecuacion-lineal", difficulty: 2, seed: 201, weight: 1 },
    { generator: "ecuacion-lineal", difficulty: 4, seed: 202, weight: 2 },
    { generator: "despeje-formula", difficulty: 3, seed: 203, weight: 3 },
  ] },
  { skill: "funciones", intro: "Funciones.", items: [
    { generator: "funcion-evaluar", difficulty: 2, seed: 301, weight: 1 },
    { generator: "funcion-evaluar", difficulty: 4, seed: 302, weight: 2 },
    { generator: "dominio", difficulty: 4, seed: 303, weight: 3 },
  ] },
  { skill: "graficos", intro: "Gráficos y rectas.", items: [
    { generator: "recta-elementos", difficulty: 2, seed: 401, weight: 1 },
    { generator: "pendiente", difficulty: 3, seed: 402, weight: 2 },
    { generator: "recta-elementos", difficulty: 4, seed: 403, weight: 3 },
  ] },
  { skill: "vectores", intro: "Vectores.", items: [
    { generator: "vector-modulo", difficulty: 1, seed: 501, weight: 1 },
    { generator: "vector-suma", difficulty: 3, seed: 502, weight: 2 },
    { generator: "vector-componentes", difficulty: 4, seed: 503, weight: 3 },
  ] },
  { skill: "fisica", intro: "Un poco de física.", items: [
    { generator: "conversion-unidades", difficulty: 3, seed: 601, weight: 1 },
    { generator: "mru", difficulty: 2, seed: 602, weight: 2 },
    { generator: "mruv", difficulty: 4, seed: 603, weight: 3 },
  ] },
  { skill: "logica", intro: "Lógica.", items: [
    { generator: "logica-booleana", difficulty: 1, seed: 701, weight: 1 },
    { generator: "traza-if", difficulty: 2, seed: 702, weight: 2 },
    { generator: "logica-booleana", difficulty: 4, seed: 703, weight: 3 },
  ] },
  { skill: "computacional", intro: "Y por último, pensamiento computacional.", items: [
    { generator: "traza-asignacion", difficulty: 1, seed: 801, weight: 1 },
    { generator: "traza-for", difficulty: 2, seed: 802, weight: 2 },
    { generator: "traza-while", difficulty: 3, seed: 803, weight: 3 },
  ] },
];

/** Unidad de Preparación que cubre cada habilidad. */
export const SKILL_UNIT: Record<SkillId, string> = {
  aritmetica: "nivel-0",
  algebra: "nivel-1",
  funciones: "nivel-2",
  graficos: "nivel-2",
  vectores: "nivel-3",
  fisica: "nivel-3",
  logica: "nivel-4",
  computacional: "nivel-4",
};
