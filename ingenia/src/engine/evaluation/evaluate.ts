/**
 * Corrección de respuestas. Regla de oro: nunca devolver un "Incorrecto" seco.
 * Cada evaluación intenta explicar QUÉ salió mal y clasificar el tipo de error,
 * para que el sistema adaptativo pueda reforzar exactamente eso después.
 */
import type { ChoiceExercise, EvaluationResult, Exercise, ExpressionExercise, FrequentError, MatchExercise, NumericExercise, OrderExercise, StepsExercise, TraceExercise, FillExercise, BuildExercise, GraphExercise, FindErrorExercise } from "../types";
import { equivalent, evalNumber, fmt, nearlyEqual, ParseError } from "../math/parser";
import { checkLinearSteps } from "./steps";
import { correctMessage } from "./messages";

export { correctMessage };

export type Answer =
  | { kind: "choice"; index: number }
  | { kind: "numeric"; value: string }
  | { kind: "expression"; value: string }
  | { kind: "steps"; steps: string[]; final: string }
  | { kind: "trace"; values: Record<string, string> }
  | { kind: "order"; order: string[] }
  | { kind: "match"; pairs: Record<string, string> }
  | { kind: "fill"; values: string[] }
  | { kind: "build"; tokens: string[] }
  | { kind: "graph"; x: number; y: number }
  | { kind: "find-error"; index: number };

export function evaluateAnswer(ex: Exercise, answer: Answer): EvaluationResult {
  switch (ex.kind) {
    case "choice":
      return answer.kind === "choice" ? evalChoice(ex, answer.index) : invalid();
    case "numeric":
      return answer.kind === "numeric" ? evalNumeric(ex, answer.value) : invalid();
    case "expression":
      return answer.kind === "expression" ? evalExpression(ex, answer.value) : invalid();
    case "steps":
      return answer.kind === "steps" ? evalSteps(ex, answer.steps, answer.final) : invalid();
    case "trace":
      return answer.kind === "trace" ? evalTrace(ex, answer.values) : invalid();
    case "order":
      return answer.kind === "order" ? evalOrder(ex, answer.order) : invalid();
    case "match":
      return answer.kind === "match" ? evalMatch(ex, answer.pairs) : invalid();
    case "fill":
      return answer.kind === "fill" ? evalFill(ex, answer.values) : invalid();
    case "build":
      return answer.kind === "build" ? evalBuild(ex, answer.tokens) : invalid();
    case "graph":
      return answer.kind === "graph" ? evalGraph(ex, answer.x) : invalid();
    case "find-error":
      return answer.kind === "find-error" ? evalFindError(ex, answer.index) : invalid();
  }
}

function evalOrder(ex: OrderExercise, order: string[]): EvaluationResult {
  if (order.length !== ex.answer.length) return invalid("Ubicá todos los elementos antes de comprobar.");
  const firstWrong = order.findIndex((it, i) => it !== ex.answer[i]);
  if (firstWrong < 0) return { correct: true, message: correctMessage(order.length) };
  return {
    correct: false,
    message: firstWrong === 0 ? "El primer elemento no va ahí." : `Bien hasta el paso ${firstWrong}. El problema empieza en el paso ${firstWrong + 1}.`,
    errorType: "interpretacion",
    diagnosis: `En la posición ${firstWrong + 1} va «${ex.answer[firstWrong]}». ${ex.explanation}`,
  };
}

function evalMatch(ex: MatchExercise, pairs: Record<string, string>): EvaluationResult {
  const missing = ex.pairs.filter(([l]) => !pairs[l]);
  if (missing.length) return invalid("Relacioná todos los elementos antes de comprobar.");
  const wrong = ex.pairs.filter(([l, r]) => pairs[l] !== r);
  if (!wrong.length) return { correct: true, message: correctMessage(ex.pairs.length) };
  return {
    correct: false,
    message: `${ex.pairs.length - wrong.length} de ${ex.pairs.length} bien. Revisemos ${wrong.length === 1 ? "uno" : "algunos"}.`,
    errorType: "conceptual",
    diagnosis: wrong.map(([l, r]) => `${l} → ${r} (pusiste ${pairs[l]})`).join(". ") + `. ${ex.explanation}`,
  };
}

function evalFill(ex: FillExercise, values: string[]): EvaluationResult {
  if (values.length < ex.answer.length || values.some((v) => !v)) return invalid("Completá todos los huecos antes de comprobar.");
  const wrong = ex.answer.findIndex((a, i) => values[i] !== a);
  if (wrong < 0) return { correct: true, message: correctMessage(ex.answer.length) };
  const fe = ex.frequentErrors.find((f) => f.match === values.join("|"));
  return {
    correct: false,
    message: ex.answer.length === 1 ? "Casi. Esa ficha no va ahí." : `Revisemos el hueco ${wrong + 1}.`,
    errorType: fe?.type ?? "conceptual",
    diagnosis: fe?.message ?? `En el hueco ${wrong + 1} pusiste «${values[wrong]}». ${ex.explanation}`,
  };
}

function evalBuild(ex: BuildExercise, tokens: string[]): EvaluationResult {
  if (!tokens.length) return invalid("Armá la respuesta con los bloques antes de comprobar.");
  const same = (a: string[]) => a.length === tokens.length && a.every((t, i) => t === tokens[i]);
  if (same(ex.answer) || (ex.alternatives ?? []).some(same)) return { correct: true, message: correctMessage(tokens.length) };
  const fe = ex.frequentErrors.find((f) => f.match === tokens.join(" "));
  const firstWrong = tokens.findIndex((t, i) => t !== ex.answer[i]);
  return {
    correct: false,
    message: "Casi. Revisemos cómo armaste la respuesta.",
    errorType: fe?.type ?? "formula",
    diagnosis: fe?.message ?? (firstWrong >= 0 && firstWrong < ex.answer.length ? `Bien hasta el bloque ${firstWrong}. Después de eso no va «${tokens[firstWrong]}». ${ex.explanation}` : `Falta o sobra algún bloque. ${ex.explanation}`),
  };
}

function evalGraph(ex: GraphExercise, x: number): EvaluationResult {
  if (!Number.isFinite(x)) return invalid("Tocá o mové el punto sobre el gráfico.");
  if (Math.abs(x - ex.target.x) <= ex.tolerance) return { correct: true, message: correctMessage(1) };
  return {
    correct: false,
    message: x < ex.target.x ? "Casi. El punto está un poco más a la derecha." : "Casi. El punto está un poco más a la izquierda.",
    errorType: "interpretacion",
    diagnosis: `Marcaste x ≈ ${Math.round(x * 100) / 100}. ${ex.explanation}`,
  };
}

function evalFindError(ex: FindErrorExercise, index: number): EvaluationResult {
  if (index < 0) return invalid("Tocá el renglón donde está el error.");
  if (index === ex.wrong) return { correct: true, message: `¡Exacto! El error está en el renglón ${index + 1}. Debería ser: ${ex.fix}` };
  return {
    correct: false,
    message: index < ex.wrong ? `El renglón ${index + 1} está bien. Seguí mirando más abajo.` : `El error aparece antes del renglón ${index + 1}.`,
    errorType: "interpretacion",
    diagnosis: `Comprobá cada renglón contra el anterior: ¿qué operación se hizo y se hizo en los dos lados?`,
  };
}

function invalid(msg = "No pude interpretar la respuesta."): EvaluationResult {
  return { correct: false, message: msg, invalidInput: true };
}

function fromFrequent(fe: FrequentError): EvaluationResult {
  return {
    correct: false,
    message: "Este error es muy común (y tiene arreglo).",
    errorType: fe.type,
    diagnosis: fe.message,
  };
}

function evalChoice(ex: ChoiceExercise, index: number): EvaluationResult {
  if (index === ex.answer) return { correct: true, message: correctMessage(index + ex.id.length) };
  const fe = ex.frequentErrors.find((f) => f.match === index);
  if (fe) return fromFrequent(fe);
  return {
    correct: false,
    message: "No es esa. Pensemos por qué.",
    errorType: "conceptual",
    diagnosis: ex.explanation,
  };
}

export function numericMatches(value: number, target: number, tolerance?: number): boolean {
  if (tolerance !== undefined) return Math.abs(value - target) <= tolerance + 1e-12;
  return nearlyEqual(value, target, 1e-9, 1e-6);
}

function evalNumeric(ex: NumericExercise, raw: string): EvaluationResult {
  if (!raw.trim()) return invalid("Escribí un número para responder.");
  // Si el alumno escribió la unidad, la ignoramos para leer el número.
  const cleaned = ex.unit ? raw.replace(ex.unit, "").replace(/[a-zA-Z/²³]+\s*$/, "").trim() : raw;
  const v = evalNumber(cleaned);
  if (v === null)
    return invalid("No pude leer ese número. Podés escribir enteros, decimales con coma (2,5) o fracciones (3/4).");
  // Sin tolerancia explícita, un decimal correctamente redondeado (≥ 2 decimales)
  // cuenta como correcto: 1/7 ≈ 0,14 o 0,143.
  const decimals = /^-?\s*\d*[.,](\d+)\s*$/.exec(cleaned.replace("−", "-"))?.[1].length ?? 0;
  const tol = ex.tolerance ?? (decimals >= 2 && !Number.isInteger(ex.answer) ? 0.5 * 10 ** -decimals + 1e-12 : undefined);
  if (numericMatches(v, ex.answer, tol)) return { correct: true, message: correctMessage(Math.round(v * 7)) };

  const fe = ex.frequentErrors.find(
    (f) => typeof f.match === "number" && numericMatches(v, f.match, tol),
  );
  if (fe) return fromFrequent(fe);

  // Diagnósticos genéricos que valen para cualquier ejercicio numérico.
  if (ex.answer !== 0 && numericMatches(v, -ex.answer, tol)) {
    return {
      correct: false,
      message: "Casi. El valor está bien pero el signo no.",
      errorType: "signos",
      diagnosis: `Obtuviste ${fmt(v)} y el resultado es ${fmt(ex.answer)}. Revisá en qué paso cambió el signo: suele pasar al restar un negativo o al pasar un término de lado.`,
    };
  }
  if (ex.answer !== 0) {
    const ratio = v / ex.answer;
    if (ex.unit && (nearlyEqual(ratio, 3.6, 0, 1e-3) || nearlyEqual(ratio, 1 / 3.6, 0, 1e-3))) {
      return {
        correct: false,
        message: "El número tiene sentido, pero la conversión de unidades no.",
        errorType: "unidades",
        diagnosis: "Para pasar de km/h a m/s se divide por 3,6; para pasar de m/s a km/h se multiplica por 3,6.",
      };
    }
    for (const p of [10, 100, 1000, 0.1, 0.01, 0.001]) {
      if (nearlyEqual(ratio, p, 0, 1e-6)) {
        return {
          correct: false,
          message: "Los dígitos están bien, pero la escala no.",
          errorType: ex.unit ? "unidades" : "calculo",
          diagnosis: `Tu resultado es ${fmt(ratio)} veces el correcto. Revisá la posición de la coma o una conversión por potencias de 10.`,
        };
      }
    }
  }
  return {
    correct: false,
    message: "Todavía no. Revisemos el razonamiento.",
    errorType: "calculo",
    diagnosis: ex.explanation,
  };
}

function evalExpression(ex: ExpressionExercise, raw: string): EvaluationResult {
  if (!raw.trim()) return invalid("Escribí una expresión para responder.");
  try {
    if (equivalent(raw, ex.answer, ex.variables, ex.sampleRange))
      return { correct: true, message: correctMessage(raw.length) };
  } catch (e) {
    if (e instanceof ParseError) return invalid(`No pude leer la expresión: ${e.message}`);
    return invalid();
  }
  for (const fe of ex.frequentErrors) {
    if (typeof fe.match !== "string") continue;
    try {
      if (equivalent(raw, fe.match, ex.variables, ex.sampleRange)) return fromFrequent(fe);
    } catch {
      /* el error frecuente mal escrito no debe romper la corrección */
    }
  }
  try {
    if (equivalent(raw, `-(${ex.answer})`, ex.variables, ex.sampleRange)) {
      return {
        correct: false,
        message: "Casi: tu expresión es la correcta pero con el signo cambiado.",
        errorType: "signos",
        diagnosis: "Revisá los signos al pasar términos o al distribuir un signo menos.",
      };
    }
  } catch {
    /* ignorar */
  }
  return {
    correct: false,
    message: "Todavía no es equivalente a la respuesta. Revisemos.",
    errorType: "despeje",
    diagnosis: ex.explanation,
  };
}

function evalSteps(ex: StepsExercise, steps: string[], final: string): EvaluationResult {
  const report = checkLinearSteps(ex.equation, steps, final, ex.frequentErrors);
  return report;
}

function normalizeValue(v: string): string {
  return v.trim().replace(/^["']|["']$/g, "").toLowerCase();
}

function evalTrace(ex: TraceExercise, values: Record<string, string>): EvaluationResult {
  const wrong: string[] = [];
  for (const name of ex.ask) {
    const expected = ex.answer[name];
    const given = values[name] ?? "";
    if (!given.trim()) return invalid(`Falta el valor de «${name}».`);
    let ok: boolean;
    if (typeof expected === "number") {
      const n = evalNumber(given);
      ok = n !== null && nearlyEqual(n, expected);
    } else if (typeof expected === "boolean") {
      ok = ["true", "verdadero", "v"].includes(normalizeValue(given)) === expected &&
        ["true", "verdadero", "v", "false", "falso", "f"].includes(normalizeValue(given));
    } else {
      ok = normalizeValue(given) === normalizeValue(String(expected));
    }
    if (!ok) wrong.push(name);
  }
  if (wrong.length === 0) return { correct: true, message: correctMessage(ex.code.length) };

  const fe = ex.frequentErrors.find((f) => {
    const name = ex.ask[0];
    const n = evalNumber(values[name] ?? "");
    return typeof f.match === "number" && n !== null && nearlyEqual(n, f.match);
  });
  if (fe) return fromFrequent(fe);
  return {
    correct: false,
    message: `Revisemos ${wrong.length === 1 ? `el valor de «${wrong[0]}»` : `los valores de ${wrong.map((w) => `«${w}»`).join(", ")}`}.`,
    errorType: "logica",
    diagnosis: "Ejecutá el programa línea por línea con el visualizador y anotá cómo cambia cada variable.",
  };
}
