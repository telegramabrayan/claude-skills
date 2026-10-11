/**
 * Misión Física: qué entra en cada parcial, en qué orden conviene estudiarlo
 * y cómo se agrupan los temas. La asignación a cada parcial sale del análisis
 * de los modelos cargados (parciales.ts, cátedra Torti 2023). Cuando un tema
 * apareció en los dos parciales o en un solo modelo, queda marcado con
 * needsVerification: la distribución de 2026 podría cambiar.
 */
import { topicStats, featureStats, type Parcial } from "./parciales";

/** Fechas elegidas por el estudiante: primero el 2.º parcial y al día siguiente el 1.º. */
export const EXAM_2P = "2026-11-05";
export const EXAM_1P = "2026-11-06";
/** Primera fecha de examen (la cuenta regresiva apunta acá). */
export const EXAM_DATE = EXAM_2P;
export const CATEDRA = "Cátedra Torti (UBA XXI)";

export interface MissionArea {
  id: string;
  name: string;
  icon: string;
  topics: string[];
  parciales: ("1P" | "2P")[];
  /** Importancia conceptual: cuántos temas del parcial se apoyan en este (0..1). */
  foundation: number;
  needsVerification?: boolean;
  note?: string;
  /** Áreas que conviene tener encaminadas antes. */
  after?: string[];
}

/** Áreas en el orden de estudio recomendado (de fundamentos a integradores). */
export const AREAS: MissionArea[] = [
  { id: "fundamentos", name: "Fundamentos: unidades, despeje y signos", icon: "🧰", topics: ["t-unidades", "t-despeje", "t-fis-signos"], parciales: ["1P", "2P"], foundation: 1, note: "No es un tema de los parciales, pero el 42 % de los ejercicios exige convertir unidades y casi todos despejar." },
  { id: "trig", after: ["fundamentos"], name: "Trigonometría para Física", icon: "📐", topics: ["t-trigonometria"], parciales: ["1P", "2P"], foundation: 0.8, note: "Un tercio de los ejercicios pide descomponer con seno y coseno." },
  { id: "vectores", after: ["fundamentos", "trig"], name: "Vectores", icon: "➡️", topics: ["t-vec-componentes", "t-vec-operaciones"], parciales: ["1P"], foundation: 0.7 },
  { id: "mru", after: ["fundamentos"], name: "MRU y encuentro", icon: "🚗", topics: ["t-encuentro"], parciales: ["1P"], foundation: 0.5 },
  { id: "mruv", after: ["mru"], name: "MRUV, frenado y gráficos", icon: "📈", topics: ["t-mruv", "t-frenado", "t-graficos-vt"], parciales: ["1P"], foundation: 0.7, needsVerification: true, note: "En el material, MRUV aparece en el 1.er parcial y como base del final." },
  { id: "caida", after: ["mruv"], name: "Caída libre y tiro vertical", icon: "🪂", topics: ["t-caida-libre"], parciales: ["1P", "2P"], foundation: 0.5, needsVerification: true, note: "Apareció en un 1.er parcial (2023-2) y en el 2.º parcial (2023-1)." },
  { id: "estatica", after: ["vectores"], name: "Estática de la partícula", icon: "🪢", topics: ["t-estatica-particula"], parciales: ["1P"], foundation: 0.4 },
  { id: "rigido", after: ["estatica"], name: "Cuerpo rígido (momentos)", icon: "🏗️", topics: ["t-momentos"], parciales: ["1P"], foundation: 0.2 },
  { id: "hidro", after: ["fundamentos"], name: "Hidrostática (presión y empuje)", icon: "🌊", topics: ["t-presion", "t-arquimedes"], parciales: ["1P"], foundation: 0.2 },
  { id: "tiro", after: ["caida", "trig"], name: "Tiro oblicuo", icon: "🏀", topics: ["t-tiro-oblicuo", "t-tiro-altura"], parciales: ["2P"], foundation: 0.3, needsVerification: true, note: "«Tiro desde una altura» incluye la caída en otro astro, que apareció en un 1.er parcial." },
  { id: "dinamica", after: ["vectores", "mruv"], name: "Dinámica: Newton, plano inclinado y vinculados", icon: "🧲", topics: ["t-newton", "t-plano-inclinado", "t-vinculados"], parciales: ["2P"], foundation: 0.6, needsVerification: true, note: "Peso y masa (Newton) aparecen también en el 1.er parcial." },
  { id: "energia", after: ["dinamica"], name: "Trabajo y energía", icon: "⚡", topics: ["t-energia", "t-resorte-potencia"], parciales: ["2P"], foundation: 0.3 },
];

export const AREA_OF: Record<string, MissionArea> = Object.fromEntries(AREAS.flatMap((a) => a.topics.map((t) => [t, a])));

export const MISSION_TOPICS = AREAS.flatMap((a) => a.topics);

export function areasFor(p: "1P" | "2P"): MissionArea[] {
  return AREAS.filter((a) => a.parciales.includes(p));
}

/**
 * Peso de examen de cada área en un parcial (0..1), calculado de los modelos:
 * fracción de exámenes distintos donde aparece, más la fracción de puntaje.
 * Para fundamentos y trigonometría se usa la fracción de ejercicios que los exige.
 */
export function areaExamWeight(area: MissionArea, p: "1P" | "2P"): number {
  if (!area.parciales.includes(p)) return 0;
  if (area.id === "fundamentos") return featureStats(p as Parcial).find((f) => f.feature === "conversion")?.share ?? 0.4;
  if (area.id === "trig") return featureStats(p as Parcial).find((f) => f.feature === "trig")?.share ?? 0.3;
  const stats = topicStats(p as Parcial).filter((s) => area.topics.includes(s.topicId));
  if (!stats.length) return 0.1;
  const share = Math.max(...stats.map((s) => s.share));
  const totalPts = topicStats(p as Parcial).reduce((a, s) => a + s.points, 0);
  const pts = stats.reduce((a, s) => a + s.points, 0) / totalPts;
  return Math.min(1, 0.7 * share + 1.5 * pts);
}

/** Importancia (1 a 5 llamas) de un área: frecuencia en los modelos + importancia conceptual. No depende de tus resultados. */
export function areaImportance(area: MissionArea): number {
  const w = Math.max(...area.parciales.map((p) => areaExamWeight(area, p)));
  return Math.max(1, Math.min(5, Math.round(1 + 4 * (0.65 * w + 0.35 * area.foundation))));
}
