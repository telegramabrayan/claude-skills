/**
 * Temas practicables de Introducción al Conocimiento de la Sociedad y el
 * Estado (ICSE, CBC-UBA). Alineados con los tres ejes de los contenidos
 * mínimos del programa analítico: Sociedad (icse-1), Estado (icse-2) y Estado
 * y desarrollo socioeconómico (icse-3). Unidad sugerida en el comentario de
 * cada bloque.
 */
import type { Topic } from "@/engine/types";

const S = "icse";

const t = (id: string, name: string, generators: string[], lessonId: string, prerequisites: string[] = []): Topic => ({
  id,
  name,
  subjectId: S,
  skill: "logica",
  generators,
  lessonId,
  prerequisites,
});

export const ICSE_TOPICS: Topic[] = [
  // ── icse-1: Sociedad ──
  t("t-icse-sociedad", "Conceptos básicos: socialización, instituciones, roles, normas y valores", ["icse-concepto-social", "icse-conceptos-match"], "l-icse-sociedad"),
  t("t-icse-estratificacion", "Estratificación social: casta, estamento, clase y movilidad", ["icse-estratificacion", "icse-movilidad"], "l-icse-estratificacion", ["t-icse-sociedad"]),
  t("t-icse-orden-conflicto", "Orden, cooperación y conflicto", ["icse-orden-conflicto"], "l-icse-orden-conflicto", ["t-icse-sociedad"]),
  t("t-icse-actores", "Actores sociopolíticos, organizaciones y protesta social", ["icse-actores", "icse-actores-match"], "l-icse-actores", ["t-icse-orden-conflicto"]),
  t("t-icse-desigualdad", "Desigualdad, pobreza y exclusión", ["icse-linea-pobreza", "icse-brecha-ingresos", "icse-desigualdad-indicadores"], "l-icse-desigualdad", ["t-icse-estratificacion", "t-porcentajes"]),
  t("t-icse-transformaciones", "Transformaciones contemporáneas: globalización, tecnología y trabajo", ["icse-transformaciones"], "l-icse-transformaciones", ["t-icse-desigualdad"]),

  // ── icse-2: El Estado ──
  t("t-icse-estado", "El Estado: definición, elementos y conceptos afines", ["icse-estado-elementos", "icse-estado-conceptos"], "l-icse-estado"),
  t("t-icse-dominacion", "Poder, legitimidad y tipos de dominación", ["icse-dominacion"], "l-icse-dominacion", ["t-icse-estado"]),
  t("t-icse-tipos-estado", "Tipos históricos de Estado: absolutista, liberal, de bienestar, neoliberal", ["icse-tipo-estado", "icse-tipos-estado-orden"], "l-icse-tipos-estado", ["t-icse-estado"]),
  t("t-icse-estado-argentino", "La formación del Estado argentino (1810–1880)", ["icse-argentina-linea", "icse-argentina-hechos", "icse-estatidad"], "l-icse-estado-argentino", ["t-icse-estado"]),
  t("t-icse-ciudadania", "Ciudadanía: derechos civiles, políticos y sociales", ["icse-ciudadania-marshall", "icse-ciudadania-orden"], "l-icse-ciudadania", ["t-icse-tipos-estado"]),
  t("t-icse-regimenes", "Regímenes políticos: democracia, autoritarismo y totalitarismo", ["icse-regimen"], "l-icse-regimenes", ["t-icse-ciudadania"]),
  t("t-icse-instituciones", "Instituciones de la democracia argentina y reforma de 1994", ["icse-poderes", "icse-balotaje", "icse-reforma-1994"], "l-icse-instituciones", ["t-icse-regimenes", "t-porcentajes"]),

  // ── icse-3: Estado y desarrollo socioeconómico ──
  t("t-icse-modelos-desarrollo", "Modelos de desarrollo: agroexportador, ISI y apertura", ["icse-modelo-desarrollo", "icse-modelos-orden"], "l-icse-modelos-desarrollo", ["t-icse-tipos-estado", "t-icse-estado-argentino"]),
  t("t-icse-politicas-publicas", "Políticas públicas: concepto, ciclo y tipos", ["icse-ciclo-politicas", "icse-tipo-politica"], "l-icse-politicas-publicas", ["t-icse-estado"]),
  t("t-icse-politicas-sectoriales", "Políticas en economía, infraestructura, salud, ciencia y educación", ["icse-politica-sector", "icse-hitos-politicas"], "l-icse-politicas-sectoriales", ["t-icse-politicas-publicas", "t-icse-modelos-desarrollo"]),
];
