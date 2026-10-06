/**
 * Temas practicables de Introducción al Pensamiento Científico (IPC 040,
 * UBA XXI, programa 2026, Cátedra A). Unidades sugeridas en el comentario de
 * cada bloque: ipc-u1 … ipc-u4.
 */
import type { Topic } from "@/engine/types";

const S = "ipc";

const t = (id: string, name: string, generators: string[], lessonId: string, prerequisites: string[] = []): Topic => ({
  id,
  name,
  subjectId: S,
  skill: "logica",
  generators,
  lessonId,
  prerequisites,
});

export const IPC_TOPICS: Topic[] = [
  // ── ipc-u1: La argumentación ──
  t("t-ipc-argumentos", "Reconocer argumentos: premisas, conclusión e indicadores", ["ipc-es-argumento", "ipc-conclusion"], "l-ipc-argumentos"),
  t("t-ipc-enunciados", "Oraciones, proposiciones y tipos de enunciados", ["ipc-alcance-enunciado"], "l-ipc-enunciados", ["t-ipc-argumentos"]),
  t("t-ipc-conectivas", "Conectivas y condiciones de verdad", ["ipc-valor-verdad"], "l-ipc-conectivas", ["t-ipc-enunciados"]),
  t("t-ipc-condiciones", "Condiciones necesarias y suficientes", ["ipc-nec-suf"], "l-ipc-condiciones", ["t-ipc-conectivas"]),
  t("t-ipc-tautologias", "Tautologías, contradicciones y contingencias", ["ipc-tautologia"], "l-ipc-tautologias", ["t-ipc-conectivas"]),
  t("t-ipc-validez", "Validez, verdad y solidez", ["ipc-validez-verdad"], "l-ipc-validez", ["t-ipc-argumentos", "t-ipc-conectivas"]),
  t("t-ipc-formas", "Formas válidas y falacias formales", ["ipc-forma-argumento", "ipc-cual-valido"], "l-ipc-formas", ["t-ipc-validez", "t-ipc-condiciones"]),
  t("t-ipc-pruebas", "Reglas de inferencia y pruebas directas e indirectas", ["ipc-regla-inferencia"], "l-ipc-pruebas", ["t-ipc-formas"]),
  t("t-ipc-inductivos", "Argumentos inductivos y su evaluación", ["ipc-tipo-inductivo", "ipc-fortalecer-inductivo"], "l-ipc-inductivos", ["t-ipc-validez"]),

  // ── ipc-u2: La ciencia y su historia (revolución darwiniana) ──
  t("t-ipc-pre-darwin", "Creacionismo, fijismo, Lamarck y los antecedentes de Darwin", ["ipc-antecedentes-darwin"], "l-ipc-pre-darwin"),
  t("t-ipc-seleccion-natural", "Darwin y la evolución por selección natural", ["ipc-explicacion-evolutiva", "ipc-darwin-vf"], "l-ipc-seleccion-natural", ["t-ipc-pre-darwin"]),

  // ── ipc-u3: El cambio científico ──
  t("t-ipc-contrastacion", "Términos, enunciados y contrastación de hipótesis", ["ipc-tipo-enunciado-cientifico", "ipc-componentes-contrastacion"], "l-ipc-contrastacion", ["t-ipc-formas", "t-ipc-enunciados"]),
  t("t-ipc-pl-popper", "Positivismo lógico y falsacionismo", ["ipc-pl-popper", "ipc-falsador"], "l-ipc-pl-popper", ["t-ipc-contrastacion", "t-ipc-inductivos"]),
  t("t-ipc-explicacion", "La explicación científica: modelo de cobertura legal", ["ipc-explicacion-cientifica"], "l-ipc-explicacion", ["t-ipc-contrastacion"]),
  t("t-ipc-kuhn", "Kuhn: paradigmas, ciencia normal y revoluciones", ["ipc-kuhn"], "l-ipc-kuhn", ["t-ipc-pl-popper"]),
  t("t-ipc-feminismo", "Ciencia y género: epistemología feminista", ["ipc-feminismo"], "l-ipc-feminismo", ["t-ipc-kuhn"]),

  // ── ipc-u4: La dimensión ético-política de la ciencia ──
  t("t-ipc-etica", "Ética de la investigación, responsabilidad y cientificismo", ["ipc-etica-ciencia"], "l-ipc-etica"),
  t("t-ipc-politicas", "Políticas científicas y financiamiento", ["ipc-politicas-cientificas"], "l-ipc-politicas", ["t-ipc-etica"]),
];
