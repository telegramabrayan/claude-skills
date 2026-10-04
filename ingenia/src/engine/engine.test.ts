import { describe, expect, it } from "vitest";
import { equivalent, evalNumber, parse, evaluate, solveLinear } from "./math/parser";
import { checkLinearSteps } from "./evaluation/steps";
import { run } from "./code/interpreter";

describe("parser", () => {
  it("respeta jerarquía y signos", () => {
    expect(evalNumber("2+3*4")).toBe(14);
    expect(evalNumber("-2^2")).toBe(-4);
    expect(evalNumber("(-2)^2")).toBe(4);
    expect(evalNumber("2,5·2")).toBe(5);
    expect(evalNumber("3/4")).toBe(0.75);
    expect(evalNumber("√16")).toBe(4);
    expect(evalNumber("2³")).toBe(8);
    expect(evalNumber("10 − 3")).toBe(7);
  });
  it("multiplicación implícita", () => {
    expect(evaluate(parse("2x", ["x"]), { x: 3 })).toBe(6);
    expect(evaluate(parse("3(x+1)", ["x"]), { x: 1 })).toBe(6);
    expect(evaluate(parse("(x+1)(x-1)", ["x"]), { x: 3 })).toBe(8);
    expect(evaluate(parse("v0*t", ["v0", "t"]), { v0: 2, t: 5 })).toBe(10);
    expect(evaluate(parse("sen(x)", ["x"]), { x: 0 })).toBe(0);
  });
  it("equivalencia de expresiones", () => {
    expect(equivalent("(x+1)^2", "x^2+2x+1", ["x"])).toBe(true);
    expect(equivalent("(x+1)^2", "x^2+1", ["x"])).toBe(false);
    expect(equivalent("d/v", "d*v^-1", ["d", "v"], [1, 10])).toBe(true);
  });
  it("ecuaciones lineales", () => {
    expect(solveLinear("2x + 5 = 15")).toBe(5);
    expect(solveLinear("3(x-2) = 12")).toBe(6);
    expect(solveLinear("7 - 2x = 15")).toBe(-4);
  });
});

describe("corrector de pasos", () => {
  it("detecta el error de signo al transponer (ejemplo del enunciado)", () => {
    const r = checkLinearSteps("2x + 5 = 15", ["2x = 15 + 5", "2x = 20", "x = 10"], "10");
    expect(r.correct).toBe(false);
    expect(r.firstWrongStep).toBe(0);
    expect(r.errorType).toBe("signos");
    expect(r.diagnosis).toContain("restar 5");
    expect(r.diagnosis).toContain("2x = 10");
    expect(r.steps?.[1].status).toBe("arrastre");
  });
  it("acepta un procedimiento correcto", () => {
    const r = checkLinearSteps("2x + 5 = 15", ["2x = 10", "x = 5"], "5");
    expect(r.correct).toBe(true);
  });
  it("detecta multiplicar en lugar de dividir", () => {
    const r = checkLinearSteps("3x = 12", ["x = 36"], "36");
    expect(r.errorType).toBe("despeje");
  });
  it("diagnostica sin pasos", () => {
    const r = checkLinearSteps("2x + 5 = 15", [], "10");
    expect(r.errorType).toBe("signos");
  });
});

describe("intérprete", () => {
  it("ejecuta y traza variables", () => {
    const r = run("x = 5\ny = 3\nresultado = x + y\nprint(resultado)");
    expect(r.ok).toBe(true);
    expect(r.output).toEqual(["8"]);
    expect(r.steps.at(-1)?.vars.resultado).toBe("8");
  });
  it("bucles, condicionales y funciones", () => {
    const src = `def doble(n):
    return n * 2

suma = 0
for i in range(1, 5):
    if i % 2 == 0:
        suma += doble(i)
    else:
        suma += i
print(suma)`;
    const r = run(src);
    expect(r.ok).toBe(true);
    expect(r.output).toEqual(["16"]);
  });
  it("detecta bucles infinitos", () => {
    const r = run("i = 0\nwhile i < 5:\n    print(i)");
    expect(r.ok).toBe(false);
    expect(r.error?.message).toMatch(/bucle/);
  });
  it("errores de sintaxis con línea", () => {
    const r = run("x = 3\nif x > 2\n    print(x)");
    expect(r.ok).toBe(false);
    expect(r.error?.line).toBe(2);
  });
});
