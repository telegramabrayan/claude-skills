import type { Topic } from "@/engine/types";

/**
 * Temas de Física (v3): vectores II, cinemática 1D y 2D, estática, dinámica,
 * trabajo y energía, hidrostática. Unidad sugerida en el comentario de cada uno.
 */
const t = (id: string, name: string, skill: Topic["skill"], generators: string[], lessonId: string, prerequisites: string[]): Topic => ({
  id,
  name,
  subjectId: "fisica",
  skill,
  generators,
  lessonId,
  prerequisites,
});

export const FISICA_TOPICS: Topic[] = [
  // fis-1
  t("t-vec-componentes", "Componentes y ángulo de un vector", "vectores", ["fis-vec-componente", "fis-vec-angulo"], "l-vec-componentes", ["t-vectores", "t-trigonometria"]),
  t("t-vec-operaciones", "Resta, equilibrante y producto vectorial", "vectores", ["fis-vec-resta", "fis-vec-equilibrante", "fis-vec-producto-vectorial"], "l-vec-operaciones", ["t-vec-componentes", "t-producto-escalar"]),
  // fis-2
  t("t-encuentro", "Encuentro y desfase en MRU", "fisica", ["fis-mru-encuentro", "fis-mru-desfase"], "l-encuentro", ["t-mru", "t-unidades"]),
  t("t-frenado", "Reacción, frenado y persecución", "fisica", ["fis-frenado", "fis-persecucion"], "l-frenado-persecucion", ["t-mruv", "t-encuentro", "t-cuadratica"]),
  t("t-graficos-vt", "Gráficos velocidad–tiempo", "graficos", ["fis-grafico-vt"], "l-graficos-vt", ["t-mruv", "t-recta"]),
  // fis-2d
  t("t-tiro-oblicuo", "Tiro oblicuo desde el suelo", "fisica", ["fis-tiro-oblicuo"], "l-tiro-oblicuo", ["t-caida-libre", "t-vec-componentes"]),
  t("t-tiro-altura", "Tiro desde una altura y caída en otros astros", "fisica", ["fis-tiro-altura", "fis-caida-astros"], "l-tiro-altura", ["t-tiro-oblicuo", "t-cuadratica"]),
  // fis-est
  t("t-estatica-particula", "Equilibrio de una partícula (nudos y cuerdas)", "fisica", ["fis-estatica-nudo"], "l-estatica-particula", ["t-vec-componentes", "t-vec-operaciones"]),
  t("t-momentos", "Cuerpo rígido: momentos y centro de masa", "fisica", ["fis-viga-cuerda", "fis-momentos-apoyos"], "l-momentos", ["t-estatica-particula", "t-vec-operaciones"]),
  // fis-3
  t("t-newton", "Leyes de Newton: peso, masa y fuerza neta", "fisica", ["fis-newton", "fis-dinamica-conceptos"], "l-newton", ["t-mruv", "t-vec-operaciones"]),
  t("t-plano-inclinado", "Plano inclinado con rozamiento", "fisica", ["fis-plano-inclinado"], "l-plano-inclinado", ["t-newton", "t-vec-componentes"]),
  t("t-vinculados", "Cuerpos vinculados", "fisica", ["fis-vinculados"], "l-vinculados", ["t-plano-inclinado"]),
  // fis-4
  t("t-energia", "Trabajo y energía mecánica", "fisica", ["fis-energia"], "l-trabajo-energia", ["t-newton", "t-unidades"]),
  t("t-resorte-potencia", "Resortes y potencia", "fisica", ["fis-resorte", "fis-potencia"], "l-resorte-potencia", ["t-energia"]),
  // fis-5
  t("t-presion", "Presión hidrostática y principio de Pascal", "fisica", ["fis-presion", "fis-prensa"], "l-presion-pascal", ["t-unidades", "t-newton"]),
  t("t-arquimedes", "Empuje, flotación y Arquímedes", "fisica", ["fis-flotacion", "fis-hidro-conceptos"], "l-arquimedes", ["t-presion", "t-porcentajes"]),
];
