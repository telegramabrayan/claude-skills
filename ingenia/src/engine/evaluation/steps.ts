/**
 * Corrector de procedimientos para ecuaciones lineales.
 *
 * Idea: cada paso válido debe ser una ecuación EQUIVALENTE a la original
 * (misma solución). El primer paso cuya solución cambia es donde aparece el
 * error. Luego se comparan hipótesis de errores típicos (signo al transponer,
 * multiplicar en vez de dividir, etc.) contra la solución que produce el paso
 * del alumno para explicar exactamente qué pasó.
 */
import type { EvaluationResult, ErrorType, FrequentError, StepFeedback } from "../types";
import { evaluate, fmt, nearlyEqual, parse, ParseError, solveLinear, splitEquation, variablesOf } from "../math/parser";
import { correctMessage } from "./messages";

interface Side {
  p: number; // coeficiente de x
  q: number; // término independiente
}

export function sideOf(expr: string): Side | null {
  const n = parse(expr, ["x"]);
  for (const v of variablesOf(n)) if (v !== "x") throw new ParseError(`Usá solo la incógnita «x» (apareció «${v}»).`);
  const f = (x: number) => evaluate(n, { x });
  const q = f(0);
  const p = f(1) - q;
  if (!nearlyEqual(f(3), 3 * p + q, 1e-9) || !nearlyEqual(f(-2), -2 * p + q, 1e-9)) return null;
  return { p, q };
}

export type { Side };

/** Coeficientes (p·x + q) de cada lado de una ecuación lineal; null si no es lineal. */
export function sidesOf(eq: string): [Side, Side] | null {
  const [l, r] = splitEquation(eq);
  const L = sideOf(l);
  const R = sideOf(r);
  return L && R ? [L, R] : null;
}

/** Texto de p·x + q con signos prolijos. */
export function linText(p: number, q: number): string {
  const parts: string[] = [];
  if (Math.abs(p) > 1e-12) {
    const coef = nearlyEqual(p, 1) ? "" : nearlyEqual(p, -1) ? "−" : fmt(p);
    parts.push(`${coef}x`);
  }
  if (Math.abs(q) > 1e-12 || parts.length === 0) {
    if (parts.length === 0) parts.push(fmt(q));
    else parts.push(q > 0 ? `+ ${fmt(q)}` : `− ${fmt(-q)}`);
  }
  return parts.join(" ");
}

interface Diagnosis {
  type: ErrorType;
  message: string;
}

/** Busca qué error típico explica que de `prev` se haya llegado a una ecuación con solución `got`. */
function diagnose(prev: string, got: number | null, correctRoot: number, frequent: FrequentError[]): Diagnosis {
  const sides = (() => {
    try {
      return sidesOf(prev);
    } catch {
      return null;
    }
  })();

  if (got !== null) {
    const fe = frequent.find((f) => typeof f.match === "number" && nearlyEqual(got, f.match));
    if (fe) return { type: fe.type, message: fe.message };
  }

  if (sides && got !== null) {
    const [{ p: pL, q: qL }, { p: pR, q: qR }] = sides;
    const P = pL - pR;
    const after = linText(P, 0);

    // 1) Pasar una constante de lado sin cambiarle el signo.
    if (Math.abs(qL) > 1e-12 && Math.abs(P) > 1e-12 && nearlyEqual(got, (qR + qL) / P)) {
      const op = qL > 0 ? `restar ${fmt(qL)}` : `sumar ${fmt(-qL)}`;
      return {
        type: "signos",
        message:
          `El problema está al pasar ${qL > 0 ? "+" : "−"}${fmt(Math.abs(qL))} al otro lado. ` +
          `Para eliminarlo del lado izquierdo hay que ${op} en AMBOS lados (la operación opuesta). ` +
          `Queda: ${linText(pL, 0)} = ${linText(pR, qR - qL)}.`,
      };
    }
    if (Math.abs(qR) > 1e-12 && Math.abs(P) > 1e-12 && Math.abs(pR) > 1e-12 && nearlyEqual(got, -(qL + qR) / P)) {
      return {
        type: "signos",
        message: `Al llevar ${fmt(qR)} del lado derecho al izquierdo hay que cambiarle el signo. Queda: ${linText(pL, qL - qR)} = ${linText(pR, 0)}.`,
      };
    }
    // 2) Pasar el término con x sin cambiarle el signo.
    if (Math.abs(pR) > 1e-12 && Math.abs(pL + pR) > 1e-12 && nearlyEqual(got, (qR - qL) / (pL + pR))) {
      return {
        type: "signos",
        message: `Al pasar ${linText(pR, 0)} del lado derecho al izquierdo hay que restarlo en ambos lados. Queda: ${linText(P, qL)} = ${fmt(qR)}.`,
      };
    }
    // 3) Errores de despeje cuando ya quedaba p·x = q.
    const onlyX = Math.abs(qL) < 1e-12 && Math.abs(pR) < 1e-12 && Math.abs(pL) > 1e-12;
    if (onlyX) {
      const p = pL;
      const q = qR;
      const fix = `Como ${after} significa "${fmt(p)} por x", para despejar x se DIVIDE ambos lados por ${fmt(p)}: x = ${fmt(q)} ÷ ${fmt(p)} = ${fmt(q / p)}.`;
      if (nearlyEqual(got, q * p)) return { type: "despeje", message: `Multiplicaste por ${fmt(p)} en lugar de dividir. ${fix}` };
      if (nearlyEqual(got, q - p)) return { type: "despeje", message: `Restaste ${fmt(p)} en lugar de dividir. ${fix}` };
      if (Math.abs(q) > 1e-12 && nearlyEqual(got, p / q)) return { type: "despeje", message: `Dividiste al revés (${fmt(p)} ÷ ${fmt(q)}). ${fix}` };
    }
  }

  if (got !== null && Math.abs(correctRoot) > 1e-12 && nearlyEqual(got, -correctRoot)) {
    return {
      type: "signos",
      message: "Todo el razonamiento va bien salvo un signo. Revisá este paso: un número cambió de signo (o no lo cambió) al pasar de lado o al dividir por un negativo.",
    };
  }
  return {
    type: "calculo",
    message: "En este paso la igualdad dejó de ser equivalente a la anterior. Revisá la cuenta: lo que hagas de un lado tenés que hacerlo exactamente igual del otro.",
  };
}

function readFinal(final: string): number | null {
  const s = final.replace(/^\s*x\s*=\s*/i, "");
  if (!s.trim()) return null;
  try {
    const n = parse(s);
    if (variablesOf(n).size > 0) return null;
    const v = evaluate(n);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

export function checkLinearSteps(
  equation: string,
  rawSteps: string[],
  final: string,
  frequent: FrequentError[] = [],
): EvaluationResult {
  const root = solveLinear(equation);
  if (root === null) throw new Error(`La ecuación del ejercicio no es lineal con solución única: ${equation}`);

  const steps = rawSteps.map((s) => s.trim()).filter(Boolean);
  const feedback: StepFeedback[] = [];
  let firstWrong: number | undefined;
  let diagnosis: Diagnosis | undefined;
  let lastGood = equation;
  let wrongRoot: number | null = null;

  for (let i = 0; i < steps.length; i++) {
    let r: number | null;
    try {
      r = solveLinear(steps[i]);
    } catch (e) {
      const msg = e instanceof ParseError ? e.message : "No pude leer este paso.";
      feedback.push({ index: i, status: "invalido", message: msg });
      return {
        correct: false,
        invalidInput: true,
        message: `No pude leer el paso ${i + 1}. ${msg}`,
        steps: feedback,
        firstWrongStep: i,
      };
    }
    if (firstWrong === undefined) {
      if (r !== null && nearlyEqual(r, root)) {
        feedback.push({ index: i, status: "ok" });
        lastGood = steps[i];
      } else {
        firstWrong = i;
        wrongRoot = r;
        diagnosis = r === null
          ? { type: "calculo", message: "En este paso desapareció la x o quedó una igualdad imposible. Revisá cómo agrupaste los términos." }
          : diagnose(lastGood, r, root, frequent);
        feedback.push({ index: i, status: "error", message: diagnosis.message });
      }
    } else {
      const consistent = r !== null && wrongRoot !== null && nearlyEqual(r, wrongRoot);
      feedback.push({
        index: i,
        status: consistent ? "arrastre" : "error",
        message: consistent ? `Este paso está bien hecho, pero arrastra el error del paso ${firstWrong + 1}.` : undefined,
      });
      if (consistent) wrongRoot = r;
    }
  }

  const finalValue = readFinal(final);
  if (finalValue === null) {
    return {
      correct: false,
      invalidInput: true,
      message: "Escribí el valor final de x (por ejemplo: 5, −2 o 3/4).",
      steps: feedback,
      firstWrongStep: firstWrong,
    };
  }
  const finalOk = nearlyEqual(finalValue, root);

  if (firstWrong === undefined && finalOk) {
    return { correct: true, message: correctMessage(steps.length), steps: feedback };
  }

  if (firstWrong === undefined && !finalOk) {
    // Pasos bien, respuesta final mal: el error está en el último paso (el que no escribió).
    const d = diagnose(lastGood, finalValue, root, frequent);
    return {
      correct: false,
      message: steps.length ? "Casi. Todos tus pasos están bien; el problema está al final." : "Casi. Veamos dónde está el problema.",
      errorType: d.type,
      diagnosis: d.message,
      steps: feedback,
    };
  }

  // Hubo un paso con error.
  const idx = firstWrong as number;
  return {
    correct: false,
    message: finalOk
      ? `Llegaste al resultado, pero el paso ${idx + 1} no es correcto (dos errores se compensaron).`
      : `Casi. El problema ocurrió en el paso ${idx + 1}.`,
    errorType: diagnosis?.type,
    diagnosis: diagnosis?.message,
    steps: feedback,
    firstWrongStep: idx,
  };
}
