/**
 * Mapa de aprendizaje: qué nodos se muestran y qué desbloquea a qué.
 * Los nodos de unidad apuntan a unidades del currículo; los de materia, a
 * materias del ciclo posterior. Para sumar una carrera nueva alcanza con
 * agregar su sección acá y sus materias en curriculum.ts.
 *
 * En el segundo ciclo, `requires` solo se usa para correlatividades
 * CONFIRMADAS en el plan oficial; no se infieren.
 */
import type { CareerId } from "@/engine/types";

export interface MapNode {
  id: string; // = unitId o subjectId
  kind: "unit" | "subject";
  requires: string[]; // ids de nodos
}

export interface MapSection {
  id: string;
  title: string;
  subtitle: string;
  nodes: MapNode[];
  career?: CareerId;
}

const u = (id: string, requires: string[] = []): MapNode => ({ id, kind: "unit", requires });
const s = (id: string, requires: string[] = []): MapNode => ({ id, kind: "subject", requires });

export const MAP: MapSection[] = [
  {
    id: "preparacion",
    title: "Preparación para Ingeniería",
    subtitle: "Del secundario al nivel CBC",
    nodes: [
      u("nivel-0"),
      u("nivel-1", ["nivel-0"]),
      u("prep-geo", ["nivel-1"]),
      u("nivel-2", ["nivel-1"]),
      u("prep-uni", ["nivel-2"]),
      u("nivel-3", ["nivel-2"]),
      u("nivel-4", ["nivel-0"]),
    ],
  },
  {
    id: "cbc",
    title: "CBC",
    subtitle: "Ciclo Básico Común · base compartida",
    nodes: [
      u("alg-1", ["nivel-3"]),
      u("am-1", ["nivel-2"]),
      u("am-4", ["am-1", "prep-uni"]),
      u("am-5", ["am-4"]),
      u("fis-0", ["nivel-1"]),
      u("fis-1", ["fis-0", "nivel-3"]),
      u("fis-2", ["fis-1"]),
      u("pc-1", ["nivel-4"]),
      u("pc-2", ["pc-1"]),
      u("pc-3", ["pc-2"]),
    ],
  },
  {
    id: "compartidas",
    title: "Segundo ciclo · materias compartidas",
    subtitle: "Plan 2023 FIUBA (estructura en carga)",
    nodes: [s("analisis-2")],
  },
  {
    id: "informatica",
    title: "Camino Informática",
    subtitle: "Ingeniería en Informática",
    career: "informatica",
    // Única correlatividad cargada: la confirmada en el plan oficial.
    nodes: [s("fund-prog"), s("ayed", ["fund-prog"])],
  },
  {
    id: "industrial",
    title: "Camino Industrial",
    subtitle: "Ingeniería Industrial",
    career: "industrial",
    nodes: [
      s("algebra-lineal"),
      s("fisica-particulas"),
      s("estadistica-aplicada"),
      s("economia"),
      s("desarrollo-economico"),
      s("ingenieria-economica"),
      s("investigacion-operativa"),
      s("materiales-1"),
      s("tp-industrial"),
    ],
  },
];
