/**
 * El Camino: la ruta principal, un nodo por lección y un desafío final por
 * unidad. Nada queda bloqueado del todo ("Entrar igual"), pero el camino
 * marca siempre un único paso siguiente.
 */
import type { ProgressState } from "@/engine/progress/state";
import { findUnit, SUBJECTS } from "@/content/curriculum";
import { getLesson } from "@/content/lessons";
import { getTopic } from "@/content/topics";
import { SUBJECT_COLORS } from "@/components/ui/primitives";

export type PathNodeStatus = "hecho" | "actual" | "disponible" | "bloqueado";

export type PathNode =
  | { kind: "lesson"; id: string; lessonId: string; unitId: string; status: PathNodeStatus }
  | { kind: "boss"; id: string; unitId: string; status: PathNodeStatus; won: boolean };

export interface PathSection {
  unitId: string;
  title: string;
  subjectName: string;
  color: string;
  icon: string;
  nodes: PathNode[];
  done: number;
  total: number;
}

/** Orden del camino: Preparación completa y después las unidades del CBC con lecciones. */
const PATH_UNITS = [
  "nivel-0", "nivel-1", "prep-geo", "nivel-2", "prep-uni", "nivel-3", "nivel-4",
  // CBC: Análisis
  "am-1", "am-4", "am-5", "am-6", "am-7", "am-8", "am-9", "am-10", "am-11",
  // Álgebra
  "alg-con", "alg-cx", "alg-1", "alg-2", "alg-3", "alg-4", "alg-5", "alg-6",
  // Física (orden de la cátedra: 1.er parcial y después 2.º)
  "fis-1", "fis-2", "fis-est", "fis-5", "fis-2d", "fis-3", "fis-4",
  // Pensamiento Computacional
  "pc-1", "pc-tipos", "pc-2", "pc-3", "pc-datos", "pc-io",
  // IPC
  "ipc-u1", "ipc-u2", "ipc-u3", "ipc-u4",
  "icse-1", "icse-2", "icse-3",
];

/** Materias que tienen camino, en orden. */
export function pathSubjects(): string[] {
  return [...new Set(PATH_UNITS.map((u) => findUnit(u)?.subject.id).filter((x): x is string => !!x))];
}

/** Camino completo, o el de una sola materia (cada materia avanza por su cuenta). */
export function buildPath(s: ProgressState, subjectId?: string): PathSection[] {
  const seen = new Set<string>();
  const sections: PathSection[] = [];
  let prevDone = true;
  let currentAssigned = false;
  const skippedByDiagnostic = (lessonId: string) => s.route.length > 0 && !s.route.includes(lessonId);

  for (const unitId of PATH_UNITS) {
    const found = findUnit(unitId);
    if (!found || !found.unit.lessonIds.length) continue;
    if (subjectId && found.subject.id !== subjectId) continue;
    const { subject, unit } = found;
    const nodes: PathNode[] = [];
    for (const lessonId of unit.lessonIds) {
      if (seen.has(lessonId) || !getLesson(lessonId)) continue;
      seen.add(lessonId);
      const done = s.lessons[lessonId]?.status === "completada";
      const open = done || prevDone || skippedByDiagnostic(lessonId) || !!s.lessons[lessonId] || s.unlocked.includes(unitId);
      let status: PathNodeStatus = done ? "hecho" : open ? "disponible" : "bloqueado";
      if (!done && open && !currentAssigned) {
        status = "actual";
        currentAssigned = true;
      }
      nodes.push({ kind: "lesson", id: `${unitId}:${lessonId}`, lessonId, unitId, status });
      prevDone = done;
    }
    const allLessonsDone = unit.lessonIds.every((l) => s.lessons[l]?.status === "completada");
    const won = !!s.bosses[unitId];
    nodes.push({ kind: "boss", id: `${unitId}:boss`, unitId, won, status: won ? "hecho" : allLessonsDone ? "disponible" : "bloqueado" });
    const lessonNodes = nodes.filter((n) => n.kind === "lesson");
    sections.push({
      unitId,
      title: unit.title,
      subjectName: subject.name,
      color: SUBJECT_COLORS[subject.color] ?? "var(--primary)",
      icon: unit.icon ?? subject.icon,
      nodes,
      done: lessonNodes.filter((n) => n.status === "hecho").length + (won ? 1 : 0),
      total: nodes.length,
    });
  }
  return sections;
}

export function currentNode(sections: PathSection[]): PathNode | undefined {
  return sections.flatMap((x) => x.nodes).find((n) => n.status === "actual");
}

/** Progreso en distintos niveles: lección, unidad, materia, Preparación, CBC. */
export function progressLadder(s: ProgressState, lessonId?: string) {
  const pct = (ids: string[]) => (ids.length ? ids.filter((id) => s.lessons[id]?.status === "completada").length / ids.length : 0);
  const prep = SUBJECTS.find((x) => x.id === "preparacion")!;
  const cbc = SUBJECTS.filter((x) => x.cycle === "cbc");
  const prepLessons = [...new Set(prep.units.flatMap((u) => u.lessonIds))];
  const cbcLessons = [...new Set(cbc.flatMap((x) => x.units.flatMap((u) => u.lessonIds)))];
  const cbcUnits = cbc.flatMap((x) => x.units);
  const out: { label: string; value: number; note?: string }[] = [];
  if (lessonId) {
    const ls = s.lessons[lessonId];
    const total = getLesson(lessonId)?.cards.length ?? 1;
    out.push({ label: "Lección", value: ls?.status === "completada" ? 1 : (ls?.card ?? 0) / total });
    const unit = SUBJECTS.flatMap((x) => x.units).find((u) => u.lessonIds.includes(lessonId));
    if (unit) out.push({ label: "Unidad", value: pct(unit.lessonIds) });
  }
  out.push({ label: "Preparación", value: pct(prepLessons) });
  out.push({
    label: "CBC",
    value: cbcUnits.length ? cbcUnits.reduce((a, u) => a + (u.lessonIds.length ? pct(u.lessonIds) : 0), 0) / cbcUnits.length : 0,
    note: `${cbcLessons.length} lecciones cargadas de ${cbcUnits.length} unidades`,
  });
  return out;
}

/** Temas de una unidad que el estudiante ya domina (para la celebración de fin de unidad). */
export function unitTopicsMastery(s: ProgressState, unitId: string) {
  const unit = findUnit(unitId)?.unit;
  return (unit?.topicIds ?? []).map((t) => ({ id: t, name: getTopic(t)?.name ?? t, mastery: s.topics[t]?.mastery ?? 0 }));
}
