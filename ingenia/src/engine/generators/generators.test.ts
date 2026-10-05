import { describe, expect, it } from "vitest";
import { GENERATORS } from "./index";
import { evaluateAnswer } from "../evaluation/evaluate";
import { checkLinearSteps } from "../evaluation/steps";
import { fmt, solveLinear } from "../math/parser";
import type { Difficulty } from "../types";

const DIFFS: Difficulty[] = [1, 2, 3, 4, 5, 6];

describe.each(GENERATORS.map((g) => [g.id, g] as const))("generador %s", (_id, g) => {
  it("produce ejercicios válidos que reconocen su propia respuesta", () => {
    for (const d of DIFFS) {
      for (let seed = 1; seed <= 40; seed++) {
        const ex = g.generate(seed * 7919, d);
        expect(ex.hints).toHaveLength(3);
        expect(ex.solution.length).toBeGreaterThan(0);
        expect(ex.prompt).not.toMatch(/NaN|undefined|Infinity/);
        switch (ex.kind) {
          case "numeric": {
            expect(Number.isFinite(ex.answer)).toBe(true);
            const r = evaluateAnswer(ex, { kind: "numeric", value: String(ex.answer) });
            expect(r.correct, `${ex.id} ${ex.prompt}`).toBe(true);
            // El formato con coma también tiene que aceptarse.
            expect(evaluateAnswer(ex, { kind: "numeric", value: fmt(ex.answer, 6) }).correct).toBe(true);
            for (const fe of ex.frequentErrors) {
              if (typeof fe.match === "number")
                expect(Math.abs(fe.match - ex.answer) > (ex.tolerance ?? 1e-9), `${ex.id}: error frecuente igual a la respuesta`).toBe(true);
            }
            break;
          }
          case "choice":
            expect(ex.answer).toBeGreaterThanOrEqual(0);
            expect(ex.answer).toBeLessThan(ex.options.length);
            expect(new Set(ex.options).size).toBe(ex.options.length);
            expect(evaluateAnswer(ex, { kind: "choice", index: ex.answer }).correct).toBe(true);
            break;
          case "expression":
            expect(evaluateAnswer(ex, { kind: "expression", value: ex.answer }).correct).toBe(true);
            break;
          case "steps": {
            expect(solveLinear(ex.equation)).toBeCloseTo(ex.answer, 9);
            const r = checkLinearSteps(ex.equation, ex.expectedSteps, String(ex.answer));
            expect(r.correct, `${ex.equation} :: ${ex.expectedSteps.join(" | ")} :: ${JSON.stringify(r.steps)}`).toBe(true);
            break;
          }
          case "order":
            expect(new Set(ex.items).size).toBe(ex.items.length);
            expect([...ex.items].sort()).toEqual([...ex.answer].sort());
            expect(evaluateAnswer(ex, { kind: "order", order: ex.answer }).correct).toBe(true);
            break;
          case "match":
            expect(evaluateAnswer(ex, { kind: "match", pairs: Object.fromEntries(ex.pairs) }).correct).toBe(true);
            expect(new Set(ex.pairs.map((p) => p[1])).size).toBe(ex.pairs.length);
            break;
          case "trace": {
            const values = Object.fromEntries(Object.entries(ex.answer).map(([k, v]) => [k, typeof v === "boolean" ? (v ? "True" : "False") : String(v)]));
            expect(evaluateAnswer(ex, { kind: "trace", values }).correct, ex.code).toBe(true);
            break;
          }
        }
      }
    }
  });
});
