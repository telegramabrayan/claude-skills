import { describe, expect, it } from "vitest";
import { initialState } from "@/engine/progress/state";
import { buildPath, currentNode } from "./path";
import { buildPlan } from "./plan";
import { prerequisiteGap } from "./learning";
import { generate } from "@/engine/generators";

describe("camino", () => {
  it("marca un único nodo actual y empieza por la primera lección", () => {
    const sections = buildPath(initialState());
    const current = sections.flatMap((s) => s.nodes).filter((n) => n.status === "actual");
    expect(current).toHaveLength(1);
    expect(currentNode(sections)?.id).toBe(sections[0].nodes[0].id);
    // Cada unidad termina en un desafío final.
    for (const s of sections) expect(s.nodes.at(-1)?.kind).toBe("boss");
  });

  it("al completar una lección el actual avanza", () => {
    const s = initialState();
    const first = buildPath(s)[0].nodes[0];
    if (first.kind !== "lesson") throw new Error("se esperaba lección");
    s.lessons[first.lessonId] = { status: "completada", card: 0 };
    const now = currentNode(buildPath(s));
    expect(now?.id).not.toBe(first.id);
  });
});

describe("plan de estudio", () => {
  it("reparte lecciones y reserva los últimos días para simulacros", () => {
    const r = buildPlan(initialState(), { minutes: 30, subjectId: "preparacion", examDate: "2026-10-20" }, 14, "2026-10-05");
    expect(r.daysLeft).toBe(15);
    expect(r.days).toHaveLength(14);
    expect(r.days[0].items.some((i) => i.kind === "leccion")).toBe(true);
    expect(r.days.at(-1)!.items.some((i) => i.kind === "simulacro")).toBe(true);
    // Nunca se pasa demasiado del tiempo elegido.
    for (const d of r.days) expect(d.items.reduce((a, i) => a + i.minutes, 0)).toBeLessThanOrEqual(30 + 15);
  });

  it("avisa cuando el tiempo no alcanza", () => {
    const r = buildPlan(initialState(), { minutes: 10, subjectId: "preparacion", examDate: "2026-10-08" }, 14, "2026-10-05");
    expect(r.tight).toBe(true);
  });
});

describe("remediación por prerrequisito", () => {
  it("un error de factorización en un límite manda a repasar factorización", () => {
    const ex = generate("limite", 3, 7);
    expect(prerequisiteGap(initialState(), ex, "factorizacion")).toBe("t-factorizacion");
  });
});
