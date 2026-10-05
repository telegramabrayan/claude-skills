import { describe, expect, it } from "vitest";
import { SUBJECTS, CAREERS, findUnit, getSubject } from "./curriculum";
import { TOPICS, getTopic } from "./topics";
import { LESSONS, getLesson } from "./lessons";
import { FORMULAS } from "./formulas";
import { DIAGNOSTIC } from "./diagnostic";
import { MAP } from "./map";
import { getGenerator } from "@/engine/generators";
import { evaluateAnswer } from "@/engine/evaluation/evaluate";
import { run } from "@/engine/code/interpreter";
import { compileFn } from "@/engine/math/parser";
import { initialState } from "@/engine/progress/state";
import { recordAttempt, completeLesson, levelInfo } from "@/engine/progress/rules";
import { resolveExercise, dailyPlan, routeFromDiagnostic, nodeStatus, unitsWithLessons, fullRoute } from "@/lib/learning";

describe("integridad del contenido", () => {
  it("las unidades referencian lecciones y temas existentes", () => {
    for (const s of SUBJECTS) {
      for (const u of s.units) {
        u.lessonIds.forEach((id) => expect(getLesson(id), `${u.id} → ${id}`).toBeDefined());
        u.topicIds.forEach((id) => expect(getTopic(id), `${u.id} → ${id}`).toBeDefined());
      }
      s.prerequisites.forEach((p) => expect(getSubject(p)).toBeDefined());
    }
    for (const c of CAREERS) [...c.cbcSubjects, ...c.laterSubjects].forEach((id) => expect(getSubject(id), id).toBeDefined());
  });

  it("los ids de unidades y materias no se repiten", () => {
    const ids = [...SUBJECTS.map((s) => s.id), ...SUBJECTS.flatMap((s) => s.units.map((u) => u.id))];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("los temas apuntan a generadores y lecciones válidos", () => {
    for (const t of TOPICS) {
      t.generators.forEach((g) => expect(() => getGenerator(g)).not.toThrow());
      if (t.lessonId) expect(getLesson(t.lessonId), t.id).toBeDefined();
      t.prerequisites.forEach((p) => expect(getTopic(p), `${t.id} → ${p}`).toBeDefined());
      expect(getGenerator(t.generators[0]).topicId === t.id || t.generators.some((g) => getGenerator(g).topicId === t.id)).toBe(true);
    }
  });

  it("cada lección sigue la estructura pedagógica y sus ejercicios son válidos", () => {
    for (const l of LESSONS) {
      expect(l.cards[0].kind, l.id).toBe("intro");
      expect(l.cards.at(-1)?.kind, l.id).toBe("summary");
      expect(l.cards.some((c) => c.kind === "exercise"), l.id).toBe(true);
      l.topicIds.forEach((t) => expect(getTopic(t)).toBeDefined());
      for (const c of l.cards) {
        if (c.kind === "exercise") {
          const ex = resolveExercise(c.exercise);
          if (ex.kind === "choice") expect(evaluateAnswer(ex, { kind: "choice", index: ex.answer }).correct).toBe(true);
          expect(ex.hints).toHaveLength(3);
        }
        if (c.kind === "explain" && c.widget?.type === "code") expect(run(c.widget.code).ok, `${l.id}: ${c.widget.code}`).toBe(true);
        if (c.kind === "explain" && c.widget?.type === "plot" && c.widget.initial) expect(() => compileFn(c.widget!.type === "plot" ? (c.widget.initial ?? "x") : "x")).not.toThrow();
      }
      if (l.tutor.visual?.type === "code") expect(run(l.tutor.visual.code).ok).toBe(true);
    }
  });

  it("fórmulas, diagnóstico y mapa son consistentes", () => {
    FORMULAS.forEach((f) => expect(getSubject(f.subjectId), f.id).toBeDefined());
    DIAGNOSTIC.forEach((d) => d.items.forEach((i) => expect(() => getGenerator(i.generator).generate(i.seed, i.difficulty)).not.toThrow()));
    for (const sec of MAP) for (const n of sec.nodes) {
      expect(n.kind === "unit" ? findUnit(n.id) : getSubject(n.id), n.id).toBeDefined();
    }
  });
});

describe("progreso", () => {
  it("XP, nivel y dominio", () => {
    let s = initialState();
    for (let i = 0; i < 12; i++) {
      s = recordAttempt(s, { exerciseId: `x${i}`, topicId: "t-signos", correct: true, hints: 0, usedSolution: false, difficulty: 3, mode: "practica" }).state;
    }
    expect(s.xp).toBe(60);
    expect(levelInfo(s.xp).level).toBe(2);
    expect(s.gears).toBe(12);
    expect(s.topics["t-signos"].mastery).toBeGreaterThan(0.6);
    expect(s.topics["t-signos"].level).toBeGreaterThan(2);
    expect(s.streak.current).toBe(1);
  });

  it("dos errores seguidos bajan la dificultad", () => {
    let s = initialState();
    const wrong = { exerciseId: "y", topicId: "t-ecuaciones", correct: false, hints: 0, usedSolution: false, difficulty: 2 as const, mode: "practica" as const, errorType: "signos" as const };
    s = recordAttempt(s, wrong).state;
    s = recordAttempt(s, wrong).state;
    expect(s.topics["t-ecuaciones"].level).toBe(1);
  });

  it("completar todas las lecciones de una unidad otorga la unidad", () => {
    let s = initialState();
    const unit = findUnit("nivel-1")!.unit;
    let gained = 0;
    for (const id of unit.lessonIds) {
      const r = completeLesson(s, id, unitsWithLessons());
      s = r.state;
      gained += r.xpGained;
    }
    expect(s.units["nivel-1"]).toBeDefined();
    expect(gained).toBe(unit.lessonIds.length * 30 + 100);
    expect(nodeStatus(s, "nivel-2")).toBe("disponible");
    expect(nodeStatus(s, "nivel-3")).toBe("bloqueado");
  });

  it("la ruta del diagnóstico saltea lo dominado y el plan diario no queda vacío", () => {
    const out = routeFromDiagnostic({ aritmetica: 1, algebra: 0.9, funciones: 0.2, graficos: 0.1, vectores: 0, fisica: 0, logica: 0.5, computacional: 0.4 });
    expect(out.route).not.toContain("l-signos");
    expect(out.route).toContain("l-funciones");
    expect(out.unlocked).toContain("nivel-2");
    expect(fullRoute().length).toBeGreaterThan(15);
    const plan = dailyPlan(initialState());
    expect(plan.filter((p) => p.type === "exercise").length).toBeGreaterThanOrEqual(6);
  });
});
