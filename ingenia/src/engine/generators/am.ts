/**
 * Generadores de Análisis Matemático A (CBC, estilo Cátedra Cabana).
 *
 * Ejercicios PROPIOS en el estilo de los parciales (nunca copias de enunciados):
 * límites con indeterminaciones, continuidad, asíntotas, derivadas y recta
 * tangente, L'Hôpital, estudio de funciones, Taylor, primitivas, TFC, áreas,
 * EDO separables y series. Cada distractor es un error típico detectado en las
 * resoluciones de la cátedra, con un mensaje que explica el error.
 */
import type { Difficulty, Exercise, ExerciseBase, ExpressionExercise, FrequentError, Generator, NumericExercise } from "../types";
import { compileFn, equivalent, fmt, fracText } from "../math/parser";
import { rng, type Rng } from "./rng";
import { base, byDifficulty, choice, coef, par, sgn, termX, type BaseArgs } from "./helpers";

// ───────────────────────── utilidades ─────────────────────────

/**
 * MathText lee los grupos de \frac hasta la primera «}»: un exponente con
 * llaves dentro de una fracción (\frac{e^{2x}}{3}) se cortaría. Reescribe esos
 * grupos internos con paréntesis (^{2x} → ^(2x)), que MathText sí anida.
 */
export function mathFix(s: string): string {
  if (!s.includes("\\frac{")) return s;
  const group = (str: string, i: number): number => {
    let depth = 0;
    for (let j = i; j < str.length; j++) {
      if (str[j] === "{") depth++;
      else if (str[j] === "}" && --depth === 0) return j;
    }
    return -1;
  };
  const inner = (g: string): string => {
    let out = "";
    for (let i = 0; i < g.length; i++) {
      if ((g[i] === "^" || g[i] === "_") && g[i + 1] === "{") {
        const end = group(g, i + 1);
        if (end > 0) {
          out += `${g[i]}(${inner(g.slice(i + 2, end))})`;
          i = end;
          continue;
        }
      }
      out += g[i];
    }
    return out;
  };
  let out = "";
  for (let i = 0; i < s.length; ) {
    if (s.startsWith("\\frac{", i)) {
      const e1 = group(s, i + 5);
      const e2 = e1 > 0 && s[e1 + 1] === "{" ? group(s, e1 + 1) : -1;
      if (e1 > 0 && e2 > 0) {
        out += `\\frac{${inner(s.slice(i + 6, e1))}}{${inner(s.slice(e1 + 2, e2))}}`;
        i = e2 + 1;
        continue;
      }
    }
    out += s[i++];
  }
  return out;
}

/** Aplica mathFix a todos los textos visibles de un ejercicio. */
function fixExercise<T extends Exercise>(ex: T): T {
  const out = { ...ex, prompt: mathFix(ex.prompt), hints: ex.hints.map(mathFix) as [string, string, string], solution: ex.solution.map(mathFix), explanation: mathFix(ex.explanation), frequentErrors: ex.frequentErrors.map((f) => ({ ...f, message: mathFix(f.message) })) };
  if (out.kind === "choice") out.options = out.options.map(mathFix);
  return out;
}

type Args = Omit<BaseArgs, "gen" | "seed" | "difficulty" | "subjectId" | "topicId">;
type Mk = (a: Args) => ExerciseBase;

/** Fábrica de generadores: `mk` completa id, semilla, dificultad, materia y tema. */
function gen(id: string, topicId: string, description: string, fn: (r: Rng, d: Difficulty, mk: Mk) => Exercise): Generator {
  return {
    id,
    topicId,
    description,
    generate(seed, d) {
      const r = rng(seed);
      const mk: Mk = (a) => base({ ...a, gen: id, seed, difficulty: d, subjectId: "am-a", topicId });
      return fixExercise(fn(r, d, mk));
    },
  };
}

/** Ejercicio numérico: descarta errores frecuentes que coinciden con la respuesta o están repetidos. */
function num(b: ExerciseBase, answer: number, tolerance?: number): NumericExercise {
  const tol = Math.max(tolerance ?? 0, 1e-6 * Math.max(1, Math.abs(answer)));
  const seen: number[] = [];
  const frequentErrors = b.frequentErrors.filter((fe) => {
    if (typeof fe.match !== "number") return true;
    const m = fe.match;
    if (!Number.isFinite(m) || Math.abs(m - answer) <= tol * 1.5 + 1e-9) return false;
    if (seen.some((s) => Math.abs(s - m) < 1e-9)) return false;
    seen.push(m);
    return true;
  });
  return { ...b, frequentErrors, kind: "numeric", answer, tolerance };
}

/** Ejercicio de expresión en x (se compara por equivalencia numérica). */
function expr(b: ExerciseBase, answer: string, range: [number, number] = [-3, 3]): ExpressionExercise {
  return { ...b, kind: "expression", answer, variables: ["x"], sampleRange: range };
}

/** Polinomio prolijo para mostrar: poly([3, 0, -2]) = "3x^2 − 2". cs[0] es el coeficiente de mayor grado. */
export function poly(cs: number[], v = "x"): string {
  const n = cs.length - 1;
  const parts: string[] = [];
  cs.forEach((c, i) => {
    if (c === 0) return;
    const p = n - i;
    const mono = p === 0 ? "" : p === 1 ? v : `${v}^${p}`;
    const abs = Math.abs(c);
    const body = p === 0 ? fmt(abs) : `${abs === 1 ? "" : fmt(abs)}${mono}`;
    parts.push(parts.length === 0 ? (c < 0 ? `−${body}` : body) : `${c < 0 ? "−" : "+"} ${body}`);
  });
  return parts.length ? parts.join(" ") : "0";
}

/** Polinomio en sintaxis del parser (para respuestas de tipo expresión). */
function polyA(cs: number[]): string {
  const n = cs.length - 1;
  return cs.map((c, i) => `(${c})*x^${n - i}`).join(" + ");
}

/** Fracción irreducible para mostrar (acepta enteros). */
const fr = (n: number, d: number) => fracText(n, d);

/** Opciones distintas: filtra textos repetidos dejando siempre la correcta. */
function uniq<T extends { text: string; correct?: boolean }>(opts: T[]): T[] {
  const seen = new Set<string>();
  const correct = opts.find((o) => o.correct);
  const out: T[] = [];
  for (const o of correct ? [correct, ...opts.filter((x) => x !== correct)] : opts) {
    if (seen.has(o.text)) continue;
    seen.add(o.text);
    out.push(o);
  }
  return out;
}

/** Término c·x listo para multiplicar: cx(−3) = "(−3x)". */
const cx = (c: number) => (c < 0 ? `(${coef(c)}x)` : `${coef(c)}x`);

/**
 * Gancho de verificación (solo lo leen los scripts de validación): los
 * generadores de opción múltiple con primitivas o planteos de área dejan acá
 * la versión evaluable de la respuesta correcta.
 */
export const AM_CHECK: {
  prim?: { f: string; F: string; range: [number, number] };
  area?: { f: string; g: string; pieces: [number, number, "f" | "g"][] };
} = {};

/** Coeficiente fraccionario delante de un término: frac(1, 3, "x") = "\\frac{1}{3}x", frac(−1, 2, "x", true) = "− \\frac{1}{2}x". */
function fracTerm(n: number, d: number, body: string, inner = false): string {
  const neg = n * d < 0;
  const t = fr(Math.abs(n), Math.abs(d));
  const k = t === "1" ? "" : t.includes("/") ? `\\frac{${t.split("/")[0]}}{${t.split("/")[1]}}` : t;
  const core = `${k}${body}`;
  if (inner) return `${neg ? "−" : "+"} ${core}`;
  return `${neg ? "−" : ""}${core}`;
}

/** Término «± k/den» con signo prolijo: overX(−5, "x") = "− \\frac{5}{x}". */
const overX = (k: number, den: string) => `${k < 0 ? "−" : "+"} \\frac{${fmt(Math.abs(k))}}{${den}}`;

const fe = (match: number | string, type: FrequentError["type"], message: string): FrequentError => ({ match, type, message });

// ───────────────────────── 1. Límites: ∞ − ∞ con raíces ─────────────────────────

export const limRaices = gen("am-lim-raices", "t-am-lim-indeterminadas", "Límites ∞ − ∞ con raíces: multiplicar y dividir por el conjugado", (r, d, mk) => {
  const mode = r.pick(byDifficulty(d, [["k1"], ["k1", "dos"], ["dos"], ["k", "dos"], ["menos", "k"], ["param", "menos"]] as const));
  if (mode === "k1" || mode === "k") {
    const k = mode === "k1" ? 1 : r.pick([2, 3]);
    const p = mode === "k1" ? 2 * r.nz(-5, 5) : r.nz(-12, 12);
    const c = r.int(-9, 9);
    const ans = p / (2 * k);
    const rad = poly([k * k, p, c]);
    return num(
      mk({
        prompt: `Calculá $lim_{x→+∞} (√(${rad}) − ${coef(k)}x)$`,
        hints: [
          "Reemplazar da ∞ − ∞: es una indeterminación, no vale 0.",
          `Multiplicá y dividí por el conjugado $√(${rad}) + ${coef(k)}x$: arriba queda una diferencia de cuadrados.`,
          `Arriba queda $${poly([p, c])}$; abajo sacá $x$ de factor común (dentro de la raíz sale como $√(x^2) = x$ para x > 0).`,
        ],
        solution: [
          `Es ∞ − ∞ → multiplico y divido por √(${rad}) + ${coef(k)}x`,
          `Numerador: (${rad}) − ${k * k === 1 ? "" : k * k}x² = ${poly([p, c])}`,
          `Saco x arriba y abajo: x(${fmt(p)}${c ? ` ${sgn(c)}/x` : ""}) / [x(√(${k * k}${p ? ` ${sgn(p)}/x` : ""}${c ? ` ${sgn(c)}/x²` : ""}) + ${k})]`,
          `→ ${fmt(p)}/(${k} + ${k}) = ${fr(p, 2 * k)}`,
        ],
        explanation: "En ∞ − ∞ con raíces se multiplica por el conjugado: la diferencia de cuadrados elimina el término dominante y deja un cociente ∞/∞ que se resuelve sacando x de factor común.",
        frequentErrors: [
          fe(0, "limites", "∞ − ∞ no es 0: las dos partes crecen, pero no necesariamente «igual de rápido». Multiplicá por el conjugado."),
          fe(p / k, "calculo", `Abajo quedan DOS términos que tienden a ${k}: √(${k * k}) + ${k} = ${2 * k}. El denominador es ${2 * k}, no ${k}.`),
          fe(p / (2 * k * k), "potencias", `Al sacar x de la raíz, √(${k * k}x²) = ${k}x (no ${k * k}x). Por eso abajo queda ${k} + ${k} = ${2 * k}.`),
        ],
      }),
      ans,
    );
  }
  if (mode === "dos") {
    const p = r.nz(-9, 9);
    let q = r.int(-9, 9);
    if (q === p) q = p + 2;
    const c = r.int(1, 9);
    const e = r.int(-5, 9);
    const ans = (p - q) / 2;
    return num(
      mk({
        prompt: `Calculá $lim_{x→+∞} (√(${poly([1, p, c])}) − √(${poly([1, q, e])}))$`,
        hints: [
          "Es ∞ − ∞. La herramienta es el conjugado.",
          "Multiplicá y dividí por la SUMA de las dos raíces. Arriba se cancelan los $x^2$.",
          `Arriba queda $${poly([p - q, c - e])}$; abajo, al sacar x, quedan $√1 + √1 = 2$.`,
        ],
        solution: [
          "Multiplico y divido por √(…) + √(…)",
          `Numerador: (${poly([1, p, c])}) − (${poly([1, q, e])}) = ${poly([p - q, c - e])}`,
          `Saco x: x(${fmt(p - q)} + …/x) / [x(√(1 + …) + √(1 + …))]`,
          `→ ${fmt(p - q)}/2 = ${fr(p - q, 2)}`,
        ],
        explanation: "Para √(x² + px + c) − √(x² + qx + d) el resultado es (p − q)/2: lo deciden los términos en x, no las constantes.",
        frequentErrors: [
          fe(0, "limites", "∞ − ∞ no es 0. Multiplicá por el conjugado y mirá qué sobrevive."),
          fe(p - q, "calculo", "Faltó el denominador: cada raíz aporta un 1 al sacar x, así que abajo queda 1 + 1 = 2."),
          fe(c - e, "conceptual", "Las constantes se van: divididas por x tienden a 0. Lo que queda son los coeficientes de x."),
        ],
      }),
      ans,
    );
  }
  if (mode === "menos") {
    const p = 2 * r.nz(-5, 5);
    const c = r.int(1, 9);
    const ans = -p / 2;
    return num(
      mk({
        prompt: `Calculá $lim_{x→−∞} (√(${poly([1, p, c])}) + x)$`,
        hints: [
          "Ojo con el signo: x es negativo, así que $√(x^2) = |x| = −x$.",
          `Multiplicá por el conjugado $√(${poly([1, p, c])}) − x$; arriba queda $${poly([p, c])}$.`,
          "Al sacar x de la raíz aparece $|x| = −x$: abajo queda $x(−√(1 + …) − 1)$.",
        ],
        solution: [
          `Conjugado: arriba (${poly([1, p, c])}) − x² = ${poly([p, c])}`,
          `Abajo: √(${poly([1, p, c])}) − x = |x|√(1 + …) − x = −x(√(1 + …) + 1)`,
          `→ ${fmt(p)}x / (−2x) = ${fmt(ans)}`,
        ],
        explanation: "√(x²) = |x|. Cuando x → −∞, |x| = −x, y ese signo cambia el resultado.",
        frequentErrors: [
          fe(p / 2, "signos", "Usaste √(x²) = x, pero para x negativo √(x²) = |x| = −x. Ese signo invierte el resultado."),
          fe(0, "limites", "∞ − ∞ no es 0: resolvelo con el conjugado."),
        ],
      }),
      ans,
    );
  }
  // param
  const q = r.int(-6, 6);
  const L = r.nz(-4, 5);
  const a = 2 * L + q;
  return num(
    mk({
      prompt: `Hallá $a$ para que $lim_{x→+∞} (√(x^2 + ax + 1) − √(${poly([1, q, 3])})) = ${fmt(L)}$`,
      hints: ["Calculá el límite en función de a, como siempre: conjugado.", "El resultado es (a − (coeficiente de x de la otra raíz))/2.", `Planteá (a ${sgn(-q)})/2 = ${fmt(L)} y despejá.`],
      solution: [`Con el conjugado: lím = (a ${sgn(-q)})/2`, `(a ${sgn(-q)})/2 = ${fmt(L)} → a ${sgn(-q)} = ${fmt(2 * L)}`, `a = ${fmt(a)}`],
      explanation: "Con parámetros se calcula el límite igual que siempre, dejando a como letra, y al final se iguala al dato.",
      frequentErrors: [
        fe(L + q, "calculo", "Te olvidaste del 2 del denominador: (a − q)/2 = L → a = 2L + q."),
        fe(2 * L - q, "signos", `Revisá el signo al despejar: (a ${sgn(-q)})/2 = ${fmt(L)}.`),
      ],
    }),
    a,
  );
});

// ───────────────────────── 2. Límites 0/0 con raíces ─────────────────────────

export const limConjugado = gen("am-lim-conjugado", "t-am-lim-indeterminadas", "Límites 0/0 con raíces: racionalizar", (r, d, mk) => {
  const mode = r.pick(byDifficulty(d, [["num"], ["num", "den"], ["den"], ["den"], ["cuad", "den"], ["cuad"]] as const));
  const s = r.int(1, 4);
  const a = r.nz(-4, 6);
  const b = s * s - a;
  const root = `√(${poly([1, b])})`;
  if (mode === "num") {
    return num(
      mk({
        prompt: `Calculá $lim_{x→${fmt(a)}} \\frac{${root} − ${s}}{${poly([1, -a])}}$`,
        hints: [
          `Reemplazando da 0/0 (porque $√(${s * s}) = ${s}$).`,
          `Multiplicá arriba y abajo por el conjugado $${root} + ${s}$.`,
          `Arriba queda $${poly([1, b])} − ${s * s} = ${poly([1, -a])}$, que se simplifica con el denominador.`,
        ],
        solution: [
          `0/0 → multiplico por (${root} + ${s})`,
          `Numerador: (${poly([1, b])}) − ${s * s} = ${poly([1, -a])}`,
          `Simplifico: 1/(${root} + ${s})`,
          `Reemplazo: 1/(${s} + ${s}) = ${fr(1, 2 * s)}`,
        ],
        explanation: "El conjugado transforma la resta con raíz en una diferencia de cuadrados, que deja a la vista el factor que se cancela.",
        frequentErrors: [
          fe(2 * s, "fracciones", `Quedó al revés: después de simplificar, la raíz queda ABAJO: 1/(${root} + ${s}).`),
          fe(0, "limites", "0/0 no es 0: es una indeterminación. Racionalizá con el conjugado."),
          fe(1 / s, "calculo", `Al reemplazar, el conjugado vale √(${s * s}) + ${s} = ${2 * s}, no ${s}.`),
        ],
      }),
      1 / (2 * s),
    );
  }
  const k = r.pick([1, 2, 3]);
  const den = `${coef(k)}${root} − ${k * s}`;
  if (mode === "den") {
    const m = r.nz(-5, 5);
    const ans = (2 * m * s) / k;
    return num(
      mk({
        prompt: `Calculá $lim_{x→${fmt(a)}} \\frac{${poly([m, -m * a])}}{${den}}$`,
        hints: [
          "Reemplazá: da 0/0.",
          `Sacá factor común en ambos: arriba $${coef(m)}(${poly([1, -a])})$, abajo $${coef(k)}(${root} − ${s})$. Después multiplicá por el conjugado $${root} + ${s}$.`,
          `Abajo queda $${coef(k)}(${poly([1, -a])})$: se cancela con el de arriba y queda $\\frac{${fmt(m)}(${root} + ${s})}{${k}}$.`,
        ],
        solution: [
          `0/0 → ${fmt(m)}(${poly([1, -a])}) / [${k === 1 ? "" : k}(${root} − ${s})]`,
          `Por el conjugado: ${fmt(m)}(${poly([1, -a])})(${root} + ${s}) / [${k === 1 ? "" : k}(${poly([1, -a])})]`,
          `Simplifico: ${fmt(m)}(${root} + ${s})${k === 1 ? "" : `/${k}`}`,
          `Reemplazo x = ${fmt(a)}: ${fmt(m)}·${2 * s}${k === 1 ? "" : `/${k}`} = ${fr(2 * m * s, k)}`,
        ],
        explanation: "En 0/0 con una raíz, el conjugado hace aparecer el mismo factor (x − a) arriba y abajo. Después de simplificarlo se reemplaza.",
        frequentErrors: [
          fe(m / k, "calculo", `Te quedó afuera el conjugado: después de simplificar sobrevive (${root} + ${s}), que vale ${2 * s}.`),
          fe((m * s) / k, "calculo", `El conjugado vale √(${s * s}) + ${s} = ${2 * s}, no ${s}.`),
          fe(0, "limites", "0/0 no es 0: es una indeterminación."),
        ],
      }),
      ans,
    );
  }
  // cuad: (x² − a²)/(k√(x+b) − ks)
  const ans = (4 * a * s) / k;
  return num(
    mk({
      prompt: `Calculá $lim_{x→${fmt(a)}} \\frac{x^2 − ${a * a}}{${den}}$`,
      hints: ["0/0: hay que factorizar y racionalizar.", `$x^2 − ${a * a} = (${poly([1, -a])})(${poly([1, a])})$ y abajo usá el conjugado $${root} + ${s}$.`, `Queda $\\frac{(${poly([1, a])})(${root} + ${s})}{${k}}$.`],
      solution: [
        `x² − ${a * a} = (${poly([1, -a])})(${poly([1, a])})`,
        `Conjugado abajo: ${k}(${root} − ${s})(${root} + ${s}) = ${k}(${poly([1, -a])})`,
        `Simplifico: (${poly([1, a])})(${root} + ${s})/${k}`,
        `x = ${fmt(a)}: ${fmt(2 * a)}·${2 * s}/${k} = ${fr(4 * a * s, k)}`,
      ],
      explanation: "Se combinan dos herramientas: diferencia de cuadrados arriba y conjugado abajo. Ambas hacen aparecer (x − a).",
      frequentErrors: [
        fe((2 * a) / k, "calculo", `Se perdió el conjugado: (${root} + ${s}) sobrevive y vale ${2 * s}.`),
        fe((2 * a * s) / k, "calculo", `El conjugado en x = ${fmt(a)} vale ${s} + ${s} = ${2 * s}.`),
        fe(0, "limites", "0/0 no es 0."),
      ],
    }),
    ans,
  );
});

// ───────────────────────── 3. Límites ∞/∞ ─────────────────────────

export const limInfinito = gen("am-lim-infinito", "t-am-lim-infinito", "Límites ∞/∞: mayor potencia, acotada por infinitésimo y raíces", (r, d, mk) => {
  const mode = r.pick(byDifficulty(d, [["grado"], ["grado", "menor"], ["acotada", "grado"], ["acotada", "raiz"], ["raiz"], ["raiz", "acotada"]] as const));
  if (mode === "grado" || mode === "menor") {
    const a = r.nz(-6, 6), b = r.int(-7, 7), c = r.nz(-9, 9);
    const e = r.int(1, 5), f = r.int(-7, 7), g = r.nz(-9, 9);
    const top = mode === "grado" ? poly([a, b, c]) : poly([b || 2, c]);
    const ans = mode === "grado" ? a / e : 0;
    return num(
      mk({
        prompt: `Calculá $lim_{x→+∞} \\frac{${top}}{${poly([e, f, g])}}$`,
        hints: ["Es ∞/∞: no vale 1.", "Dividí numerador y denominador por la mayor potencia del DENOMINADOR: $x^2$.", "Todo término $k/x$ o $k/x^2$ tiende a 0."],
        solution:
          mode === "grado"
            ? [`Divido por x²: (${fmt(a)} ${sgn(b)}/x ${sgn(c)}/x²)/(${e} ${sgn(f)}/x ${sgn(g)}/x²)`, `→ ${fmt(a)}/${e} = ${fr(a, e)}`]
            : [`Divido por x²: (${fmt(b || 2)}/x ${sgn(c)}/x²)/(${e} ${sgn(f)}/x ${sgn(g)}/x²)`, `→ 0/${e} = 0`],
        explanation: "En un cociente de polinomios cuando x → ∞ mandan los términos de mayor grado: mismo grado → cociente de coeficientes principales; numerador de menor grado → 0.",
        frequentErrors: [
          fe(1, "limites", "∞/∞ no es 1: es una indeterminación. Dividí por la mayor potencia."),
          fe(c / g, "conceptual", "Esos son los términos independientes: valen cuando x → 0, no cuando x → ∞."),
          ...(mode === "menor" ? [fe((b || 2) / e, "potencias", "Comparaste coeficientes de distinto grado: el numerador es de grado 1 y el denominador de grado 2, así que el cociente tiende a 0.")] : []),
        ],
      }),
      ans,
    );
  }
  if (mode === "acotada") {
    const p = r.int(2, 9), k = r.int(2, 6), a = r.nz(-6, 8), b = r.int(1, 9), e = r.int(1, 5);
    const trig = r.pick(["cos", "sen"]);
    return choice(
      r,
      mk({
        prompt: `Calculá $lim_{x→+∞} \\frac{${p} ${trig}(${k}x) ${sgn(a)}x^2}{${poly([e, b, 0])}}$`,
        hints: [`$${trig}(${k}x)$ no tiene límite, pero está **acotada**: vive entre −1 y 1.`, "Dividí todo por $x^2$.", `Queda $\\frac{${p} ${trig}(${k}x)}{x^2}$: acotada por algo que tiende a 0 → 0.`],
        solution: [`Divido por x²: (${p}·${trig}(${k}x)/x² ${sgn(a)}) / (${e} + ${b}/x)`, `${p}·${trig}(${k}x)·(1/x²) → 0 (acotada × infinitésimo)`, `→ ${fmt(a)}/${e} = ${fr(a, e)}`],
        explanation: "Acotada por infinitésimo tiende a 0. La función trigonométrica no tiene límite en ∞, pero dividida por x² se apaga.",
      }),
      uniq([
        { text: `$${fr(a, e)}$`, correct: true },
        { text: `No existe, porque $${trig}(${k}x)$ no tiene límite`, error: { type: "conceptual", message: `Que ${trig}(${k}x) no tenga límite no impide que el cociente sí: como está acotada, ${trig}(${k}x)/x² → 0.` } },
        { text: "$0$", error: { type: "limites", message: `Solo el término con ${trig} se apaga. El término ${fmt(a)}x² arriba compite con ${e}x² abajo.` } },
        { text: `$${fr(a + p, e)}$`, error: { type: "conceptual", message: `${trig}(${k}x) no tiende a 1 cuando x → ∞: oscila. Lo que tiende a 0 es ${trig}(${k}x)/x².` } },
      ]),
    );
  }
  // raiz: (√(A²x² + Bx) + Cx)/(Dx + E)
  const A = r.int(1, 4), B = r.int(-6, 6), D = r.nz(-4, 5), E = r.int(-6, 6);
  let C = r.nz(-5, 5);
  if (C === A || C === -A) C = A + 1;
  const neg = d >= 5 || r.bool();
  const ans = ((neg ? -A : A) + C) / D;
  return num(
    mk({
      prompt: `Calculá $lim_{x→${neg ? "−" : "+"}∞} \\frac{√(${poly([A * A, B, 0])}) ${termX(C)}}{${poly([D, E])}}$`,
      hints: [
        "Dividí todo por x. Para meter x dentro de la raíz, $x = √(x^2)$ solo si x > 0.",
        neg ? "Si x → −∞, $√(x^2) = |x| = −x$: la raíz dividida por x da $−√(…)$." : "Si x → +∞, $√(x^2) = x$.",
        `$√(${A * A}x^2 + …)/x → ${neg ? `−${A}` : A}$.`,
      ],
      solution: [
        `√(${A * A === 1 ? "" : A * A}x² ${B ? termX(B) : ""}) = |x|·√(${A * A} ${sgn(B)}/x)`,
        neg ? "x → −∞ ⇒ |x| = −x" : "x → +∞ ⇒ |x| = x",
        `Divido por x: (${neg ? "−" : ""}√(${A * A} ${sgn(B)}/x) ${sgn(C)})/(${D} ${sgn(E)}/x)`,
        `→ (${neg ? -A : A} ${sgn(C)})/${D} = ${fr((neg ? -A : A) + C, D)}`,
      ],
      explanation: "√(x²) = |x|. Hacia −∞ el valor absoluto cambia el signo de la raíz al dividir por x.",
      frequentErrors: [
        ...(neg ? [fe((A + C) / D, "signos", "Para x → −∞, √(x²) = |x| = −x. La raíz aporta −" + A + ", no +" + A + ".")] : []),
        fe(C / D, "conceptual", "La raíz no se puede ignorar: √(" + A * A + "x²) crece como " + A + "|x|, igual que los otros términos."),
        fe(((neg ? -1 : 1) * A * A + C) / D, "potencias", `√(${A * A}x²) = ${A}|x|: se saca la raíz del coeficiente también.`),
      ],
    }),
    ans,
  );
});

// ───────────────────────── 4. Límite 1^∞ ─────────────────────────

export const limE = gen("am-lim-e", "t-am-lim-e", "Límites 1^∞: e^{lím (B − 1)·E}, con parámetro", (r, d, mk) => {
  const mode = r.pick(byDifficulty(d, [["lin"], ["lin"], ["lin", "cuad"], ["cuad", "punto"], ["punto", "param"], ["param", "punto"]] as const));
  const H: [string, string, string] = [
    "Si la base tiende a 1 y el exponente a ∞, es 1^∞: NO vale 1.",
    "Usá $lim B^E = e^{lim (B − 1)·E}$.",
    "Calculá $B − 1$ con común denominador y multiplicá por el exponente.",
  ];
  const one = fe(0, "limites", "1^∞ no es 1 (e⁰). Es una indeterminación: el límite es e^{lím (B − 1)·E}.");
  if (mode === "lin" || mode === "param") {
    const a = r.int(-6, 6);
    let b = r.int(-6, 6);
    if (b === a) b = a - 3;
    const c = r.nz(-3, 3);
    const k = c * (a - b);
    const base_ = `(\\frac{${poly([1, a])}}{${poly([1, b])}})^{${coef(c)}x}`;
    if (mode === "param") {
      return num(
        mk({
          prompt: `Hallá $a$ para que $lim_{x→+∞} (\\frac{x + a}{${poly([1, b])}})^{${coef(c)}x} = e^{${fmt(k)}}$`,
          hints: [H[0], "B − 1 = (a − (" + fmt(b) + "))/(x " + sgn(b) + ")", `El límite es $e^{${fmt(c)}(a ${sgn(-b)})}$: igualá los exponentes.`],
          solution: [`B − 1 = (a ${sgn(-b)})/(${poly([1, b])})`, `(B − 1)·${cx(c)} → ${fmt(c)}(a ${sgn(-b)})`, `${fmt(c)}(a ${sgn(-b)}) = ${fmt(k)} → a = ${fmt(a)}`],
          explanation: "Con parámetro: se calcula el exponente del e en función de a y se iguala al dato.",
          frequentErrors: [
            fe(k + b, "calculo", `Faltó dividir por ${fmt(c)}: el exponente es ${fmt(c)}·(a ${sgn(-b)}).`),
            fe(k / c - b, "signos", `Revisá el signo: (a ${sgn(-b)}) = ${fmt(k / c)} → a = ${fmt(k / c)} ${sgn(b)}.`),
          ],
        }),
        a,
      );
    }
    return num(
      mk({
        prompt: `$lim_{x→+∞} ${base_} = e^k$. ¿Cuánto vale $k$?`,
        hints: H,
        solution: [`Base → 1 y exponente → ∞: 1^∞`, `B − 1 = ${fmt(a - b)}/(${poly([1, b])})`, `(B − 1)·${cx(c)} = ${fmt(c * (a - b))}x/(${poly([1, b])}) → ${fmt(k)}`, `El límite es e^${par(k)}`],
        explanation: "lím B^E con B → 1 y E → ∞ es e^{lím (B − 1)E}. Sale de la definición de e = lím (1 + 1/n)^n.",
        frequentErrors: [one, fe(a - b, "calculo", `Faltó multiplicar por el exponente ${coef(c)}x: (B − 1)·E, no solo B − 1 por x.`), fe(c * (b - a), "signos", "B − 1 = (numerador − denominador)/denominador: revisá el orden de la resta.")],
      }),
      k,
    );
  }
  if (mode === "cuad") {
    const a = r.nz(-6, 6), u = r.int(-5, 5), v = r.int(1, 6), c = r.nz(-3, 4);
    const k = c * a;
    return num(
      mk({
        prompt: `$lim_{x→+∞} (\\frac{${poly([1, a, u])}}{${poly([1, 0, v])}})^{${coef(c)}x} = e^k$. ¿Cuánto vale $k$?`,
        hints: H,
        solution: [`B − 1 = (${poly([a, u - v])})/(${poly([1, 0, v])})`, `(B − 1)·${cx(c)} = (${poly([c * a, c * (u - v), 0])})/(${poly([1, 0, v])})`, `Mismo grado: → ${fmt(c * a)}/1 = ${fmt(k)}`],
        explanation: "Primero se arma B − 1 con común denominador; después el producto con el exponente es un ∞/∞ de polinomios.",
        frequentErrors: [one, fe(a, "calculo", `Faltó el factor ${fmt(c)} del exponente.`), fe(c * (u - v), "conceptual", "Las constantes no deciden: al multiplicar por x, el término que sobrevive es el de x², que viene de ax.")],
      }),
      k,
    );
  }
  // punto: ((x² + (rr − x0 − s)x + x0 s)/(rr x))^{1/(x − x0)}
  const x0 = r.pick([1, 2, 3, -1, -2]);
  const rr = r.pick([1, 2, 3]);
  let s = r.int(-4, 4);
  if (s === x0) s = x0 + 2;
  const N = [1, rr - x0 - s, x0 * s];
  const k = (x0 - s) / (rr * x0);
  return num(
    mk({
      prompt: `$lim_{x→${fmt(x0)}} (\\frac{${poly(N)}}{${coef(rr)}x})^{1/(${poly([1, -x0])})} = e^k$. ¿Cuánto vale $k$? (podés escribir una fracción)`,
      hints: [`Verificá: en x = ${fmt(x0)} la base vale 1 y el exponente explota → 1^∞.`, `B − 1 = (${poly([1, -x0 - s, x0 * s])})/(${coef(rr)}x).`, `Ese numerador se factoriza como $(${poly([1, -x0])})(${poly([1, -s])})$ y se cancela con el exponente.`],
      solution: [
        `B − 1 = (${poly(N)} − ${coef(rr)}x)/(${coef(rr)}x) = (${poly([1, -x0 - s, x0 * s])})/(${coef(rr)}x)`,
        `= (${poly([1, -x0])})(${poly([1, -s])})/(${coef(rr)}x)`,
        `(B − 1)·1/(${poly([1, -x0])}) = (${poly([1, -s])})/(${coef(rr)}x) → ${fmt(x0 - s)}/${par(rr * x0)} = ${fr(x0 - s, rr * x0)}`,
      ],
      explanation: "El mismo truco vale en un punto finito: lím B^E = e^{lím (B − 1)E}. Aparece un 0/0 que se resuelve factorizando.",
      frequentErrors: [one, fe(x0 - s, "fracciones", `Faltó el denominador ${coef(rr)}x evaluado en ${fmt(x0)}.`), fe(1, "limites", "No es e¹ por regla general: calculá lím (B − 1)·E.")],
    }),
    k,
  );
});

// ───────────────────────── 5. Continuidad con parámetros ─────────────────────────

export const continuidadParam = gen("am-continuidad-param", "t-am-continuidad", "Continuidad de funciones partidas con parámetros", (r, d, mk) => {
  const mode = r.pick(byDifficulty(d, [["k"], ["k", "sen"], ["dos"], ["dos", "sen"], ["tres"], ["tres"]] as const));
  const p = r.pick([1, 2, 3, 4, -1, -2, -3]);
  const piece1 = `\\frac{x^2 − ${p * p}}{${poly([1, -p])}}`;
  if (mode === "k") {
    return num(
      mk({
        prompt: `Sea $f(x) = ${piece1}$ si $x ≠ ${fmt(p)}$ y $f(${fmt(p)}) = k$. ¿Qué valor de $k$ hace que $f$ sea continua en $x = ${fmt(p)}$?`,
        hints: ["Continua en a significa: existe f(a), existe el límite y son iguales.", `Calculá $lim_{x→${fmt(p)}} ${piece1}$: da 0/0, factorizá.`, `$x^2 − ${p * p} = (${poly([1, -p])})(${poly([1, p])})$.`],
        solution: [`lim = lim (${poly([1, -p])})(${poly([1, p])})/(${poly([1, -p])}) = lim (${poly([1, p])}) = ${fmt(2 * p)}`, `Continuidad: k = f(${fmt(p)}) = lim = ${fmt(2 * p)}`],
        explanation: "f es continua en a si lím_{x→a} f(x) = f(a). El valor k tiene que «tapar el hueco» con el valor del límite.",
        frequentErrors: [fe(0, "limites", "0/0 no es 0: es una indeterminación. Factorizá y simplificá antes de reemplazar."), fe(p, "factorizacion", `Al simplificar queda x ${sgn(p)}, y en x = ${fmt(p)} vale ${fmt(2 * p)}.`)],
      }),
      2 * p,
    );
  }
  if (mode === "sen") {
    const k = r.int(2, 9), m = r.int(1, 4);
    return num(
      mk({
        prompt: `Sea $f(x) = \\frac{sen(${k}x)}{${coef(m)}x}$ si $x ≠ 0$ y $f(0) = A$. Hallá $A$ para que $f$ sea continua en 0.`,
        hints: ["Necesitás $lim_{x→0} f(x) = A$.", "Usá el límite notable $lim_{u→0} \\frac{sen u}{u} = 1$.", `Multiplicá y dividí por ${k}: $\\frac{sen(${k}x)}{${k}x} · \\frac{${k}}{${m}}$.`],
        solution: [`sen(${k}x)/(${coef(m)}x) = [sen(${k}x)/(${k}x)]·${k}/${m}`, `→ 1·${k}/${m} = ${fr(k, m)}`, `A = ${fr(k, m)}`],
        explanation: "sen(u)/u → 1 cuando u → 0. Hay que «armar» el mismo argumento abajo que adentro del seno.",
        frequentErrors: [fe(0, "limites", "sen(0)/0 es 0/0, no 0."), fe(1 / m, "calculo", `El argumento del seno es ${k}x: hay que compensar con ${k}.`), fe(m / k, "fracciones", "Quedó invertido: es k/m.")],
      }),
      k / m,
    );
  }
  if (mode === "dos") {
    const pp = r.pick([1, 2, 3, -1, -2]);
    const a = r.nz(-4, 4);
    const c = 2 * pp - a * pp;
    const pc1 = `\\frac{x^2 − ${pp * pp}}{${poly([1, -pp])}}`;
    return num(
      mk({
        prompt: `Sea $f(x) = ${pc1}$ si $x < ${fmt(pp)}$ y $f(x) = ax ${c ? sgn(c) : ""}$ si $x ≥ ${fmt(pp)}$. Hallá $a$ para que $f$ sea continua en $x = ${fmt(pp)}$.`,
        hints: ["Los límites laterales tienen que coincidir con f(" + fmt(pp) + ").", `Por izquierda: factorizá, el límite es ${fmt(2 * pp)}.`, `Por derecha (y f(${fmt(pp)})): $a·${par(pp)} ${sgn(c)}$. Igualá.`],
        solution: [`lim x→${fmt(pp)}⁻: x ${sgn(pp)} → ${fmt(2 * pp)}`, `f(${fmt(pp)}) = lim x→${fmt(pp)}⁺ = ${fmt(pp)}a ${sgn(c)}`, `${fmt(pp)}a ${sgn(c)} = ${fmt(2 * pp)} → a = ${fmt(a)}`],
        explanation: "En el punto donde cambia la fórmula se comparan los límites laterales con el valor de la función.",
        frequentErrors: [fe(-c / pp, "limites", "Tomaste el límite por izquierda como 0 (0/0 no es 0). Ese límite vale " + fmt(2 * pp) + "."), fe((2 * pp + c) / pp, "signos", `Al despejar, el ${fmt(c)} pasa con signo cambiado.`)],
      }),
      a,
    );
  }
  // tres tramos
  const a = r.nz(-3, 3);
  const c = 2 * p - a * p * p;
  const q = p + r.int(1, 2);
  const m = r.nz(-4, 5);
  const b = a * q * q + c - m * q + a;
  const pz = (A: string, Bv: string) => `$a = ${A}$, $b = ${Bv}$`;
  const a0n = -c, a0d = p * p;
  const b0n = -c * (q * q + 1) + (c - m * q) * p * p;
  return choice(
    r,
    mk({
      prompt: `Sea $f$ definida por:\n\n• $f(x) = ${piece1}$ si $x < ${fmt(p)}$\n• $f(x) = ax^2 ${c ? sgn(c) : ""}$ si $${fmt(p)} ≤ x < ${fmt(q)}$\n• $f(x) = ${poly([m, 0])} − a + b$ si $x ≥ ${fmt(q)}$\n\nHallá $a$ y $b$ para que $f$ sea continua en ℝ.`,
      hints: [
        `Hay dos puntos de empalme: x = ${fmt(p)} (da a) y x = ${fmt(q)} (da b).`,
        `En x = ${fmt(p)}: el límite por izquierda es ${fmt(2 * p)} (factorizá), y tiene que valer $a·${p * p} ${sgn(c)}$.`,
        `En x = ${fmt(q)}: $a·${q * q} ${sgn(c)} = ${fmt(m * q)} − a + b$.`,
      ],
      solution: [
        `x = ${fmt(p)}: lim (x ${sgn(p)}) = ${fmt(2 * p)} = ${p * p}a ${sgn(c)} → a = ${fmt(a)}`,
        `x = ${fmt(q)}: ${fmt(a * q * q)} ${sgn(c)} = ${fmt(m * q)} − (${fmt(a)}) + b`,
        `b = ${fmt(b)}`,
      ],
      explanation: "Una función partida es continua si cada tramo lo es y, en cada punto de empalme, el límite por izquierda, el límite por derecha y el valor coinciden.",
    }),
    uniq([
      { text: pz(fmt(a), fmt(b)), correct: true },
      { text: pz(fr(a0n, a0d), fr(b0n, a0d)), error: { type: "limites", message: `En x = ${fmt(p)} tomaste 0/0 como 0. El límite por izquierda vale ${fmt(2 * p)}: factorizá x² − ${p * p}.` } },
      { text: pz(fmt(a), fmt(b - 2 * a)), error: { type: "despeje", message: "Revisá el despeje de b: en «− a + b» la a está restando; al pasarla al otro lado, suma." } },
      { text: pz(fmt(a), fmt(2 * p - m * p + a)), error: { type: "conceptual", message: `La segunda condición se plantea en x = ${fmt(q)}, donde empalman el segundo y el tercer tramo.` } },
    ]),
  );
});

// ───────────────────────── 6. Asíntota oblicua ─────────────────────────

export const asintotaOblicua = gen("am-asintota-oblicua", "t-am-asintotas", "Asíntota oblicua y = mx + b", (r, d, mk) => {
  if (d === 6 && r.bool()) {
    const p = 2 * r.nz(-4, 4), c = r.int(1, 9);
    return expr(
      mk({
        prompt: `Hallá la asíntota oblicua de $f(x) = √(${poly([1, p, c])})$ para x → +∞. Escribí solo la expresión $mx + b$.`,
        hints: ["m = lím f(x)/x; b = lím (f(x) − mx).", "$√(x^2 + …)/x → 1$, así que m = 1.", `b = lím (√(${poly([1, p, c])}) − x): conjugado.`],
        solution: [`m = lim √(${poly([1, p, c])})/x = 1`, `b = lim (√(${poly([1, p, c])}) − x) = ${fmt(p)}/2 = ${fmt(p / 2)}`, `y = x ${sgn(p / 2)}`],
        explanation: "La asíntota oblicua y = mx + b se obtiene con dos límites: m = lím f/x y b = lím (f − mx).",
        frequentErrors: [fe(`x + ${p}`, "calculo", "En b, después del conjugado, abajo quedan dos términos que tienden a 1: se divide por 2."), fe("x", "conceptual", "Faltó calcular b = lím (f(x) − x); no es 0.")],
      }),
      `x + ${p / 2}`,
    );
  }
  const E = d >= 5 ? r.pick([2, 3]) : 1;
  const m = r.nz(-4, 5), n = r.nz(-6, 6), D = r.nz(-5, 5);
  const A = E * m, B = E * n + m * D;
  let C = r.int(-9, 9);
  if (C === n * D) C += 1;
  const den = poly([E, D]);
  return expr(
    mk({
      prompt: `Hallá la asíntota oblicua de $f(x) = \\frac{${poly([A, B, C])}}{${den}}$. Escribí solo la expresión $mx + b$ (por ejemplo 2x − 1).`,
      hints: ["La pendiente es $m = lim_{x→∞} \\frac{f(x)}{x}$.", `$m = ${fr(A, E)}$. Ahora $b = lim_{x→∞} (f(x) − mx)$: restá con común denominador.`, "También podés dividir los polinomios: el cociente es la asíntota."],
      solution: [
        `m = lim (${poly([A, B, C])})/(x(${den})) = ${fmt(A)}/${E} = ${fmt(m)}`,
        `f(x) − (${poly([m, 0])}) = (${poly([A, B, C])} − (${poly([m, 0])})(${den}))/(${den}) = (${poly([B - m * D, C])})/(${den})`,
        `b = lim (${poly([B - m * D, C])})/(${den}) = ${fmt(B - m * D)}/${E} = ${fmt(n)}`,
        `Asíntota: y = ${poly([m, n])}`,
      ],
      explanation: "Una recta y = mx + b es asíntota oblicua si f(x) − (mx + b) → 0. Por eso m = lím f(x)/x y b = lím (f(x) − mx).",
      frequentErrors: [
        fe(polyA([m, B / E]), "calculo", "Para b no alcanza con mirar el coeficiente de x: hay que calcular lím (f(x) − mx), y ahí aparece la corrección por el término del denominador."),
        fe(polyA([m, (B + m * D) / E]), "signos", "Revisá el signo al restar mx(" + den + "): el término " + fmt(m * D) + "x se resta."),
        fe(`${m}`, "conceptual", "Grado del numerador = grado del denominador + 1: no hay asíntota horizontal, hay oblicua y = mx + b."),
      ],
    }),
    polyA([m, n]),
  );
});

// ───────────────────────── 7. Asíntotas verticales y horizontales ─────────────────────────

export const asintotas = gen("am-asintotas", "t-am-asintotas", "Asíntotas verticales y horizontales", (r, d, mk) => {
  const mode = r.pick(byDifficulty(d, [["racional"], ["racional"], ["racional", "hueco"], ["hueco"], ["hueco", "ln"], ["ln", "exp", "hueco"]] as const));
  const H = (t: string) => t;
  if (mode === "racional") {
    const a = r.nz(-5, 5);
    const c = r.nz(-5, 5);
    let b = r.int(-9, 9);
    if (a * c + b === 0) b += 1;
    const o = (av: string, ah: string) => `Vertical: $${av}$; horizontal: $${ah}$`;
    return choice(
      r,
      mk({
        prompt: `¿Cuáles son las asíntotas de $f(x) = \\frac{${poly([a, b])}}{${poly([1, -c])}}$?`,
        hints: ["Vertical: donde se anula el denominador y el límite da ±∞.", `Horizontal: $lim_{x→±∞} f(x)$.`, `x = ${fmt(c)} anula el denominador pero no el numerador; y en ∞ el cociente tiende a ${fmt(a)}/1.`],
        solution: [`x − (${fmt(c)}) = 0 → x = ${fmt(c)}; numerador en ${fmt(c)}: ${fmt(a * c + b)} ≠ 0 → lim = ±∞`, `lim x→±∞ = ${fmt(a)} → y = ${fmt(a)}`],
        explanation: "Asíntota vertical x = c si el límite en c es infinito; horizontal y = L si el límite en ±∞ es L.",
      }),
      uniq([
        { text: o(`x = ${fmt(c)}`, `y = ${fmt(a)}`), correct: true },
        { text: o(`x = ${fmt(-c)}`, `y = ${fmt(a)}`), error: { type: "signos", message: `El denominador x ${sgn(-c)} se anula en x = ${fmt(c)}, no en ${fmt(-c)}.` } },
        { text: o(`x = ${fmt(a)}`, `y = ${fmt(c)}`), error: { type: "conceptual", message: "Están invertidas: la vertical sale de anular el DENOMINADOR; la horizontal del límite en el infinito." } },
        { text: o(`x = ${fmt(c)}`, `y = ${fr(-b, c)}`), error: { type: "interpretacion", message: `${fr(-b, c)} es f(0), la ordenada al origen. La horizontal es el límite cuando x → ±∞.` } },
      ]),
    );
  }
  if (mode === "hueco") {
    const p = r.nz(-4, 4);
    let q = r.nz(-5, 5);
    if (q === p || q === -p) q = p + 1 === 0 || p + 1 === -p ? p + 2 : p + 1;
    if (q === 0) q = 3;
    const o = (t: string) => t;
    return choice(
      r,
      mk({
        prompt: `¿Cuáles son las asíntotas de $f(x) = \\frac{x^2 − ${p * p}}{${poly([1, -(p + q), p * q])}}$?`,
        hints: ["Factorizá numerador y denominador antes de decidir.", `Numerador: $(${poly([1, -p])})(${poly([1, p])})$; denominador: $(${poly([1, -p])})(${poly([1, -q])})$.`, `En x = ${fmt(p)} se simplifica: el límite es finito (hay un hueco, no una asíntota).`],
        solution: [
          `f(x) = (${poly([1, -p])})(${poly([1, p])})/[(${poly([1, -p])})(${poly([1, -q])})] = (${poly([1, p])})/(${poly([1, -q])}) si x ≠ ${fmt(p)}`,
          `x → ${fmt(p)}: lim = ${fr(2 * p, p - q)} (finito) → no hay asíntota`,
          `x → ${fmt(q)}: lim = ±∞ → asíntota vertical x = ${fmt(q)}`,
          "x → ±∞: lim = 1 → asíntota horizontal y = 1",
        ],
        explanation: "No todo cero del denominador es asíntota vertical: si también anula al numerador y se simplifica, el límite es finito y hay un hueco.",
      }),
      uniq([
        { text: o(`Vertical solo $x = ${fmt(q)}$; horizontal $y = 1$`), correct: true },
        { text: o(`Verticales $x = ${fmt(p)}$ y $x = ${fmt(q)}$; horizontal $y = 1$`), error: { type: "limites", message: `En x = ${fmt(p)} el límite es finito (${fr(2 * p, p - q)}): es un hueco, no una asíntota. Siempre calculá el límite.` } },
        { text: o(`Vertical solo $x = ${fmt(q)}$; horizontal $y = 0$`), error: { type: "limites", message: "Numerador y denominador tienen el mismo grado: la horizontal es el cociente de coeficientes principales, 1/1." } },
        { text: o(`Vertical solo $x = ${fmt(p)}$; horizontal $y = 1$`), error: { type: "factorizacion", message: `El factor (${poly([1, -p])}) se cancela; el que queda abajo es (${poly([1, -q])}).` } },
      ]),
    );
  }
  if (mode === "ln") {
    const c = r.nz(-4, 4), k = r.int(-5, 5);
    return choice(
      r,
      mk({
        prompt: `¿Qué asíntotas tiene $f(x) = ln(${poly([1, -c])}) ${sgn(k)}$?`,
        hints: ["Primero el dominio: el logaritmo pide argumento positivo.", `Dominio: x > ${fmt(c)}. ¿Qué pasa cuando x → ${fmt(c)}⁺?`, "ln(t) → −∞ cuando t → 0⁺, y ln(t) → +∞ (sin tope) cuando t → ∞."],
        solution: [`Dominio: (${fmt(c)}; +∞)`, `x → ${fmt(c)}⁺: ln → −∞ → asíntota vertical x = ${fmt(c)}`, "x → +∞: f → +∞ → no hay horizontal"],
        explanation: "El logaritmo tiene asíntota vertical donde su argumento se anula y crece sin tope: no tiene asíntota horizontal.",
      }),
      uniq([
        { text: `Vertical $x = ${fmt(c)}$; no tiene horizontal`, correct: true },
        { text: `Vertical $x = ${fmt(c)}$; horizontal $y = ${fmt(k)}$`, error: { type: "conceptual", message: `ln crece sin tope (lentamente, pero sin tope): f → +∞. ${fmt(k)} es solo un corrimiento vertical.` } },
        { text: `Vertical $x = ${fmt(-c)}$; no tiene horizontal`, error: { type: "signos", message: `El argumento x ${sgn(-c)} se anula en x = ${fmt(c)}.` } },
        { text: "No tiene asíntotas", error: { type: "limites", message: `Cuando x → ${fmt(c)}⁺ el logaritmo tiende a −∞: eso es una asíntota vertical.` } },
      ]),
    );
  }
  // exp
  const a = r.int(-5, 5), b = r.nz(-4, 4), k = r.int(1, 3);
  return choice(
    r,
    mk({
      prompt: `¿Qué asíntota horizontal tiene $f(x) = ${fmt(a)} ${sgn(b)}e^{−${k === 1 ? "" : k}x}$?`,
      hints: ["Mirá x → +∞ y x → −∞ por separado.", `x → +∞: $e^{−${k === 1 ? "" : k}x} → 0$.`, `x → −∞: el exponente → +∞ y la exponencial explota.`],
      solution: [`x → +∞: f → ${fmt(a)} → y = ${fmt(a)}`, "x → −∞: f → ±∞ → no hay horizontal por izquierda"],
      explanation: "Una asíntota horizontal puede existir solo de un lado. La exponencial decreciente se apaga hacia +∞ y explota hacia −∞.",
    }),
    uniq([
      { text: H(`$y = ${fmt(a)}$, solo cuando x → +∞`), correct: true },
      { text: `$y = ${fmt(a)}$ cuando x → +∞ y cuando x → −∞`, error: { type: "limites", message: "Hacia −∞ la exponencial e^{−x} crece sin tope: de ese lado no hay asíntota horizontal." } },
      { text: `$y = ${fmt(a + b)}$, solo cuando x → +∞`, error: { type: "interpretacion", message: `${fmt(a + b)} es f(0). La asíntota es el límite: e^{−x} → 0, así que queda ${fmt(a)}.` } },
      { text: `$y = ${fmt(b)}$, solo cuando x → +∞`, error: { type: "limites", message: `El término ${fmt(b)}e^{−x} es el que tiende a 0; el que queda es ${fmt(a)}.` } },
    ]),
  );
});

// ───────────────────────── 8. Reglas de derivación ─────────────────────────

/** Errores de expresión que no coinciden con la respuesta. */
function exprErrors(answer: string, errs: FrequentError[], range: [number, number] = [-3, 3]): FrequentError[] {
  return errs.filter((e) => {
    try {
      return typeof e.match !== "string" || !equivalent(e.match, answer, ["x"], range);
    } catch {
      return false;
    }
  });
}

interface Deriv {
  text: string; // f(x) para mostrar
  src: string; // f(x) en sintaxis del parser
  x0: number;
  value: number; // f′(x0)
  steps: string[];
  rule: string;
  errors: FrequentError[];
}

function derivForm(r: Rng, kind: string): Deriv {
  if (kind === "prod-exp") {
    const a = r.nz(-5, 5), b = r.nz(-6, 6), k = r.nz(-4, 4);
    return {
      text: `(${poly([a, b])}) e^{${coef(k)}x}`, src: `(${a}*x + ${b})*exp(${k}*x)`, x0: 0, value: a + k * b,
      rule: "producto",
      steps: [`f′(x) = ${fmt(a)}·e^{${coef(k)}x} + (${poly([a, b])})·${fmt(k)}e^{${coef(k)}x}`, `f′(0) = ${fmt(a)}·1 + ${par(b)}·${par(k)}·1 = ${fmt(a + k * b)}`],
      errors: [fe(a * k, "derivacion", "La derivada de un producto NO es el producto de las derivadas: (u·v)′ = u′v + uv′."), fe(a, "derivacion", "Faltó el segundo término de la regla del producto: u·v′.")],
    };
  }
  if (kind === "prod-pot") {
    const a = r.int(-5, 5), b = r.nz(-4, 4), x0 = r.nz(-2, 2);
    const v = 2 * x0 * (x0 + b) + (x0 * x0 + a);
    return {
      text: `(${poly([1, 0, a])})(${poly([1, b])})`, src: `(x^2 + ${a})*(x + ${b})`, x0, value: v, rule: "producto",
      steps: [`f′(x) = 2x(${poly([1, b])}) + (${poly([1, 0, a])})·1`, `f′(${fmt(x0)}) = ${fmt(2 * x0)}·${par(x0 + b)} + ${par(x0 * x0 + a)} = ${fmt(v)}`],
      errors: [fe(2 * x0, "derivacion", "La derivada de un producto no es el producto de las derivadas: (u·v)′ = u′v + uv′."), fe(2 * x0 * (x0 + b), "derivacion", "Faltó el término u·v′ de la regla del producto.")],
    };
  }
  if (kind === "coc") {
    const a = r.nz(-5, 5), b = r.int(-5, 5), c = r.int(1, 5);
    const N = a * (1 + c) - 2 * (a + b), D = (1 + c) * (1 + c);
    return {
      text: `\\frac{${poly([a, b])}}{${poly([1, 0, c])}}`, src: `(${a}*x + ${b})/(x^2 + ${c})`, x0: 1, value: N / D, rule: "cociente",
      steps: [`f′(x) = [${fmt(a)}(${poly([1, 0, c])}) − (${poly([a, b])})·2x] / (${poly([1, 0, c])})²`, `f′(1) = [${fmt(a)}·${1 + c} − ${par(a + b)}·2] / ${D} = ${fr(N, D)}`],
      errors: [fe(-N / D, "signos", "En el cociente el orden importa: (u′v − uv′)/v². Lo invertiste."), fe(a / 2, "derivacion", "La derivada de un cociente no es el cociente de las derivadas."), fe((a * (1 + c) + 2 * (a + b)) / D, "signos", "En la regla del cociente va una RESTA: u′v − uv′.")],
    };
  }
  if (kind === "cadena-pot") {
    const a = r.int(-3, 3), b = r.int(-3, 3), n = r.int(2, 4), x0 = r.pick([0, 1, -1]);
    const u = x0 * x0 + a * x0 + b, du = 2 * x0 + a;
    const v = n * u ** (n - 1) * du;
    return {
      text: `(${poly([1, a, b])})^${n}`, src: `(x^2 + ${a}*x + ${b})^${n}`, x0, value: v, rule: "cadena",
      steps: [`f′(x) = ${n}(${poly([1, a, b])})^${n - 1}·(${poly([2, a])})`, `f′(${fmt(x0)}) = ${n}·${par(u)}^${n - 1}·${par(du)} = ${fmt(v)}`],
      errors: [fe(n * u ** (n - 1), "derivacion", `Faltó multiplicar por la derivada de adentro (${poly([2, a])}): regla de la cadena.`), fe(n * du ** (n - 1), "derivacion", "Derivaste adentro y elevaste eso: la cadena es f′(u)·u′, con u sin derivar dentro de la potencia.")],
    };
  }
  if (kind === "cadena-ln") {
    const x0 = r.pick([0, 1, 2]);
    const a = r.int(-4, 4);
    let b = r.int(1, 6);
    if (x0 * x0 + a * x0 + b <= 0) b = 1 - x0 * x0 - a * x0 + r.int(1, 4);
    const u = x0 * x0 + a * x0 + b, du = 2 * x0 + a;
    return {
      text: `ln(${poly([1, a, b])})`, src: `ln(x^2 + ${a}*x + ${b})`, x0, value: du / u, rule: "cadena",
      steps: [`f′(x) = (${poly([2, a])})/(${poly([1, a, b])})`, `f′(${fmt(x0)}) = ${fmt(du)}/${par(u)} = ${fr(du, u)}`],
      errors: [fe(1 / u, "derivacion", "(ln u)′ = u′/u: faltó multiplicar por la derivada de adentro."), fe(du, "derivacion", "Te quedó solo u′; la derivada del logaritmo divide por u.")],
    };
  }
  if (kind === "cadena-raiz" || kind === "comb") {
    const pairs: [number, number, number][] = [[1, 2, 5], [2, 2, 1], [3, 1, 1], [1, 3, 7], [2, 1, 2], [4, 1, 5], [1, 4, 9], [3, 2, 4]];
    const [a, x0abs, b] = r.pick(pairs);
    const x0 = r.bool() ? x0abs : -x0abs;
    const S = Math.sqrt(a * x0 * x0 + b);
    if (kind === "comb") {
      const c = r.nz(-3, 3);
      const v = S + ((x0 + c) * a * x0) / S;
      return {
        text: `(${poly([1, c])})√(${poly([a, 0, b])})`, src: `(x + ${c})*sqrt(${a}*x^2 + ${b})`, x0, value: v, rule: "producto y cadena",
        steps: [`f′(x) = √(${poly([a, 0, b])}) + (${poly([1, c])})·${fmt(2 * a)}x/(2√(${poly([a, 0, b])}))`, `f′(${fmt(x0)}) = ${fmt(S)} + ${par(x0 + c)}·${fmt(a * x0)}/${fmt(S)} = ${fr(S * S + (x0 + c) * a * x0, S)}`],
        errors: [fe((a * x0) / S, "derivacion", "La derivada del producto no es el producto de derivadas: faltó u′·v = 1·√(…)."), fe(S + ((x0 + c) * 2 * a * x0) / S, "derivacion", "(√u)′ = u′/(2√u): faltó el 2 del denominador.")],
      };
    }
    return {
      text: `√(${poly([a, 0, b])})`, src: `sqrt(${a}*x^2 + ${b})`, x0, value: (a * x0) / S, rule: "cadena",
      steps: [`f′(x) = ${fmt(2 * a)}x / (2√(${poly([a, 0, b])}))`, `f′(${fmt(x0)}) = ${fmt(2 * a * x0)}/(2·${fmt(S)}) = ${fr(a * x0, S)}`],
      errors: [fe(1 / (2 * S), "derivacion", "Faltó multiplicar por la derivada de adentro: (√u)′ = u′/(2√u)."), fe((2 * a * x0) / S, "derivacion", "(√u)′ = u′/(2√u): faltó el 2 del denominador.")],
    };
  }
  // cadena-exp: e^{(x − x0)(x + q)} en x0
  const x0 = r.nz(-2, 2), q = r.int(-3, 3);
  const cs = [1, q - x0, -x0 * q];
  return {
    text: `e^{${poly(cs)}}`, src: `exp(x^2 + ${q - x0}*x + ${-x0 * q})`, x0, value: 2 * x0 + q - x0, rule: "cadena",
    steps: [`f′(x) = e^{${poly(cs)}}·(${poly([2, q - x0])})`, `En x = ${fmt(x0)} el exponente vale 0: f′(${fmt(x0)}) = e⁰·${par(x0 + q)} = ${fmt(x0 + q)}`],
    errors: [fe(1, "derivacion", "(e^u)′ = e^u·u′: faltó multiplicar por la derivada del exponente."), fe(2 * x0, "derivacion", `La derivada del exponente es ${poly([2, q - x0])}, completa.`)],
  };
}

export const derivadaReglas = gen("am-derivada-reglas", "t-am-reglas-derivacion", "Producto, cociente y regla de la cadena (derivada en un punto)", (r, d, mk) => {
  const kind = r.pick(byDifficulty(d, [["prod-exp", "cadena-exp"], ["prod-pot", "cadena-pot"], ["coc", "cadena-ln"], ["coc", "cadena-raiz"], ["cadena-ln", "cadena-raiz", "coc"], ["comb"]] as const));
  const D = derivForm(r, kind);
  return num(
    mk({
      prompt: `Si $f(x) = ${D.text}$, calculá $f′(${fmt(D.x0)})$.${Number.isInteger(D.value) ? "" : " (Podés escribir una fracción.)"}`,
      hints: [
        `¿Qué estructura tiene f? Acá manda la regla ${D.rule === "cadena" ? "de la cadena" : D.rule === "producto" ? "del producto" : D.rule === "cociente" ? "del cociente" : "del producto, con una cadena adentro"}.`,
        D.rule === "producto" || D.rule === "producto y cadena" ? "(u·v)′ = u′·v + u·v′" : D.rule === "cociente" ? "(u/v)′ = (u′·v − u·v′)/v²" : "(f(g(x)))′ = f′(g(x))·g′(x): derivás «la de afuera» y multiplicás por la derivada de adentro.",
        D.steps[0],
      ],
      solution: D.steps,
      explanation: "Producto: u′v + uv′. Cociente: (u′v − uv′)/v². Cadena: f′(g(x))·g′(x). Primero se deriva y recién después se reemplaza el punto.",
      frequentErrors: D.errors,
      visual: { type: "plot", functions: [D.src], points: [[D.x0, compileFn(D.src)(D.x0)]] },
    }),
    D.value,
  );
});

// ───────────────────────── 9. Recta tangente (función explícita) ─────────────────────────

const LINE_HINT = "Escribí solo la expresión de la recta, $mx + b$ (sin «y =»).";

export const tangente = gen("am-tangente", "t-am-recta-tangente", "Recta tangente al gráfico de una función en un punto", (r, d, mk) => {
  const mode = r.pick(byDifficulty(d, [["poly"], ["poly"], ["exp", "ln"], ["poly", "coc"], ["coc", "exp"], ["paralela", "coc"]] as const));
  if (mode === "paralela") {
    const a = r.int(-6, 6), m = r.int(-6, 6);
    let mm = m;
    if (mm === a) mm = a + 2;
    const xs = (mm - a) / 2;
    return num(
      mk({
        prompt: `¿En qué valor de x la recta tangente al gráfico de $f(x) = ${poly([1, a, 0])}$ es paralela a $y = ${poly([mm, 7])}$?`,
        hints: ["Rectas paralelas tienen la misma pendiente.", "La pendiente de la tangente en x es f′(x).", `Planteá $f′(x) = ${fmt(mm)}$ con $f′(x) = ${poly([2, a])}$.`],
        solution: [`f′(x) = ${poly([2, a])}`, `${poly([2, a])} = ${fmt(mm)} → x = ${fr(mm - a, 2)}`],
        explanation: "La pendiente de la recta tangente en x₀ es f′(x₀). Paralela a otra recta = misma pendiente.",
        frequentErrors: [fe(mm - a, "despeje", "Al despejar 2x = …, faltó dividir por 2."), fe((a - mm) / 2, "signos", `Revisá el signo: 2x ${sgn(a)} = ${fmt(mm)} → 2x = ${fmt(mm)} ${sgn(-a)}.`)],
        visual: { type: "plot", functions: [`x^2 + ${a}*x`] },
      }),
      xs,
    );
  }
  let text = "", src = "", x0 = 0, f0 = 0, m = 0, steps: string[] = [];
  if (mode === "poly") {
    const a = r.int(-3, 3), b = r.int(-4, 4), c = r.int(-5, 5);
    x0 = d <= 2 ? 1 : r.pick([-1, 1, 2]);
    text = poly([1, a, b, c]);
    src = `x^3 + ${a}*x^2 + ${b}*x + ${c}`;
    f0 = x0 ** 3 + a * x0 ** 2 + b * x0 + c;
    m = 3 * x0 * x0 + 2 * a * x0 + b;
    steps = [`f(${fmt(x0)}) = ${fmt(f0)}`, `f′(x) = ${poly([3, 2 * a, b])} → f′(${fmt(x0)}) = ${fmt(m)}`];
  } else if (mode === "exp") {
    const k = r.nz(-3, 4), c = r.int(-4, 4), q = r.int(-4, 4);
    text = `e^{${coef(k)}x}${c ? ` ${termX(c)}` : ""}${q ? ` ${sgn(q)}` : ""}`;
    src = `exp(${k}*x) + ${c}*x + ${q}`;
    f0 = 1 + q;
    m = k + c;
    steps = [`f(0) = e⁰ ${sgn(q)} = ${fmt(f0)}`, `f′(x) = ${fmt(k)}e^{${coef(k)}x} ${sgn(c)} → f′(0) = ${fmt(m)}`];
  } else if (mode === "ln") {
    const a = r.int(1, 5), b = r.int(-3, 3), q = r.int(-4, 4);
    text = `ln(${poly([a, 1])})${b ? ` ${sgn(b)}x^2` : ""}${q ? ` ${sgn(q)}` : ""}`;
    src = `ln(${a}*x + 1) + ${b}*x^2 + ${q}`;
    f0 = q;
    m = a;
    steps = [`f(0) = ln 1 ${sgn(q)} = ${fmt(q)}`, `f′(x) = ${a}/(${poly([a, 1])})${b ? ` ${sgn(2 * b)}x` : ""} → f′(0) = ${fmt(a)}`];
  } else {
    const t = r.pick([1, -1, 2, -2]), c = r.nz(-6, 6);
    x0 = r.pick([0, 1, 2]);
    const q = t - x0;
    text = `\\frac{${fmt(c)}}{${poly([1, q])}}`;
    src = `${c}/(x + ${q})`;
    f0 = c / t;
    m = -c / (t * t);
    steps = [`f(${fmt(x0)}) = ${fmt(c)}/${par(t)} = ${fr(c, t)}`, `f′(x) = −${par(c)}/(${poly([1, q])})² → f′(${fmt(x0)}) = ${fr(-c, t * t)}`];
  }
  const n = f0 - m * x0;
  const ans = `${m}*x + ${n}`;
  return expr(
    mk({
      prompt: `Hallá la recta tangente al gráfico de $f(x) = ${text}$ en $x_0 = ${fmt(x0)}$. ${LINE_HINT}`,
      hints: ["La tangente pasa por (x₀, f(x₀)) y tiene pendiente f′(x₀).", `Calculá f(${fmt(x0)}) y f′(${fmt(x0)}).`, "Usá y = f′(x₀)(x − x₀) + f(x₀) y distribuí."],
      solution: [...steps, `y = ${fmt(m)}(x ${sgn(-x0)}) ${sgn(f0)}`, `y = ${poly([m, n].map((v) => Math.round(v * 1e6) / 1e6))}`],
      explanation: "Recta tangente en x₀: y = f′(x₀)(x − x₀) + f(x₀). Hacen falta dos datos: el punto y la pendiente.",
      frequentErrors: exprErrors(ans, [
        fe(`${m}*x + ${f0}`, "formula", "Usaste f(x₀) como ordenada al origen. La recta pasa por (x₀, f(x₀)): y = f′(x₀)(x − x₀) + f(x₀)."),
        fe(`${m}*(x + ${x0}) + ${f0}`, "signos", "En y = m(x − x₀) + f(x₀) va x MENOS x₀."),
        fe(`${f0}*x + ${m}`, "conceptual", "Intercambiaste pendiente y valor: la pendiente es f′(x₀), no f(x₀)."),
      ]),
      visual: { type: "plot", functions: [src, ans], points: [[x0, f0]] },
    }),
    ans,
  );
});

// ───────────────────────── 10. Recta tangente con datos de f ─────────────────────────

export const tangenteDatos = gen("am-tangente-datos", "t-am-recta-tangente", "Recta tangente a una composición o producto a partir de la tangente de f", (r, d, mk) => {
  const mode = r.pick(byDifficulty(d, [["dato"], ["dato", "comp"], ["comp"], ["comp-recta"], ["prod", "comp-recta"], ["horizontal", "prod"]] as const));
  const x1 = r.pick([1, 2, 3, -1]);
  const m = r.nz(-5, 5), n = r.nz(-6, 6);
  const tanTxt = `y = ${poly([m, n])}`;
  const H0 = `Si la recta tangente a f en x₁ es y = mx + n, entonces f′(x₁) = m y f(x₁) = m·x₁ + n (el punto está sobre la recta).`;
  if (mode === "dato") {
    const askValue = r.bool();
    return num(
      mk({
        prompt: `La recta tangente al gráfico de f en $x = ${fmt(x1)}$ es $${tanTxt}$. ¿Cuánto vale $${askValue ? `f(${fmt(x1)})` : `f′(${fmt(x1)})`}$?`,
        hints: ["La recta tangente toca al gráfico en el punto y tiene su misma pendiente.", H0, askValue ? `Evaluá la recta en x = ${fmt(x1)}.` : "Es la pendiente de la recta."],
        solution: askValue ? [`f(${fmt(x1)}) = ${fmt(m)}·${par(x1)} ${sgn(n)} = ${fmt(m * x1 + n)}`] : [`f′(${fmt(x1)}) = pendiente = ${fmt(m)}`],
        explanation: "La tangente en x₁ comparte con f el punto (x₁, f(x₁)) y la pendiente f′(x₁).",
        frequentErrors: askValue
          ? [fe(n, "interpretacion", `n es la ordenada al origen de la recta (su valor en x = 0). f(${fmt(x1)}) es la recta evaluada en x = ${fmt(x1)}.`), fe(m, "interpretacion", "Esa es la pendiente, o sea f′(x₁), no f(x₁).")]
          : [fe(m * x1 + n, "interpretacion", "Ese es f(x₁). La derivada es la pendiente de la recta."), fe(n, "interpretacion", "n es la ordenada al origen; la derivada es la pendiente m.")],
      }),
      askValue ? m * x1 + n : m,
    );
  }
  if (mode === "comp" || mode === "comp-recta") {
    const p = r.nz(-4, 6), q = r.nz(-3, 3), c = r.int(-5, 5);
    const slope = m * (p + q);
    const h0 = c + m + n;
    const inner = `${coef(p)}x + e^{${coef(q)}x}`;
    const prompt = `Sea $h(x) = ${c ? `${fmt(c)} + ` : ""}f(${inner})$. La recta tangente al gráfico de f en $x = 1$ es $y = ${poly([m, n])}$. `;
    const hints: [string, string, string] = [
      `Fijate que el argumento vale 1 cuando x = 0: $${p}·0 + e^0 = 1$.`,
      "De la tangente de f: f′(1) = " + fmt(m) + " y f(1) = " + fmt(m) + " + " + par(n) + " = " + fmt(m + n) + ".",
      `Regla de la cadena: $h′(x) = f′(${inner})·(${fmt(p)} + ${fmt(q)}e^{${coef(q)}x})$.`,
    ];
    const sol = [`f′(1) = ${fmt(m)}, f(1) = ${fmt(m + n)}`, `h′(0) = f′(1)·(${fmt(p)} ${sgn(q)}) = ${fmt(m)}·${par(p + q)} = ${fmt(slope)}`];
    if (mode === "comp") {
      return num(
        mk({
          prompt: prompt + "Calculá $h′(0)$.",
          hints,
          solution: sol,
          explanation: "Para derivar f(g(x)) se usa la regla de la cadena: f′(g(x))·g′(x). La tangente de f da f′ en el punto que necesitás.",
          frequentErrors: [
            fe(m, "derivacion", "Faltó multiplicar por la derivada de adentro (regla de la cadena)."),
            fe(m * (p + 1), "derivacion", `La derivada de e^{${coef(q)}x} es ${fmt(q)}e^{${coef(q)}x}: no te olvides del ${fmt(q)}.`),
            fe(m * p, "derivacion", `Faltó derivar e^{${coef(q)}x}: aporta ${fmt(q)} en x = 0.`),
          ],
        }),
        slope,
      );
    }
    const ans = `${slope}*x + ${h0}`;
    return expr(
      mk({
        prompt: prompt + `Hallá la recta tangente al gráfico de h en $x = 0$. ${LINE_HINT}`,
        hints,
        solution: [...sol, `h(0) = ${c ? `${fmt(c)} + ` : ""}f(1) = ${fmt(h0)}`, `y = ${poly([slope, h0])}`],
        explanation: "Pendiente: h′(0) por regla de la cadena. Punto: (0, h(0)), con f(1) sacado de la recta tangente de f.",
        frequentErrors: exprErrors(ans, [
          fe(`${slope}*x + ${c + n}`, "interpretacion", `f(1) no es ${fmt(n)}: es la recta evaluada en x = 1, o sea ${fmt(m)} + ${par(n)} = ${fmt(m + n)}.`),
          fe(`${m}*x + ${h0}`, "derivacion", "La pendiente es h′(0) = f′(1)·g′(0): faltó la regla de la cadena."),
        ]),
      }),
      ans,
    );
  }
  if (mode === "prod") {
    const k = r.int(2, 4);
    const f1 = m + n;
    const slope = k * f1 + m;
    const ans = `${slope}*x + ${f1 - slope}`;
    return expr(
      mk({
        prompt: `Sea $g(x) = x^${k}·f(x)$. La recta tangente al gráfico de f en $x = 1$ es $y = ${poly([m, n])}$. Hallá la recta tangente al gráfico de g en $x = 1$. ${LINE_HINT}`,
        hints: [H0, `Regla del producto: $g′(x) = ${k}x^${k - 1}·f(x) + x^${k}·f′(x)$.`, `g(1) = f(1) = ${fmt(f1)}; g′(1) = ${k}·${par(f1)} + ${par(m)}.`],
        solution: [`f(1) = ${fmt(f1)}, f′(1) = ${fmt(m)}`, `g(1) = 1·f(1) = ${fmt(f1)}`, `g′(1) = ${k}·${par(f1)} + 1·${par(m)} = ${fmt(slope)}`, `y = ${fmt(slope)}(x − 1) ${sgn(f1)} = ${poly([slope, f1 - slope])}`],
        explanation: "Regla del producto con los datos de la tangente de f: f(1) y f′(1).",
        frequentErrors: exprErrors(ans, [
          fe(`${k * m}*x + ${f1 - k * m}`, "derivacion", "La derivada del producto no es el producto de las derivadas: g′ = (x^k)′·f + x^k·f′."),
          fe(`${k * n + m}*x + ${n - k * n - m}`, "interpretacion", `f(1) = ${fmt(m)}·1 + ${par(n)} = ${fmt(f1)}, no ${fmt(n)}.`),
        ]),
      }),
      ans,
    );
  }
  // horizontal: f(x) = b x/(x² + a²), máximo en x = a con valor b/(2a)
  const a = r.int(1, 4), b = 2 * a * r.int(1, 3);
  return num(
    mk({
      prompt: `La función $f(x) = \\frac{${b}x}{x^2 + ${a * a}}$ tiene recta tangente horizontal en un punto con $x > 0$. ¿Cuál es la **ordenada** de ese punto?`,
      hints: ["Tangente horizontal ⇔ pendiente 0 ⇔ f′(x) = 0.", `$f′(x) = \\frac{${b}(${a * a} − x^2)}{(x^2 + ${a * a})^2}$.`, `f′ = 0 en x = ${a}; la ordenada es f(${a}).`],
      solution: [`f′(x) = ${b}(${a * a} − x²)/(x² + ${a * a})² = 0 → x = ±${a}`, `x > 0: x = ${a}`, `f(${a}) = ${b * a}/${2 * a * a} = ${fr(b, 2 * a)}`],
      explanation: "La tangente es horizontal donde la derivada se anula. El punto es (x₀, f(x₀)): la ordenada es el valor de f.",
      frequentErrors: [fe(a, "interpretacion", "Esa es la abscisa (el valor de x). La ordenada es f(" + a + ")."), fe(b / (a * a), "calculo", `En el denominador va x² + ${a * a} = ${2 * a * a}.`)],
    }),
    b / (2 * a),
  );
});

// ───────────────────────── 11. Derivabilidad ─────────────────────────

export const derivabilidad = gen("am-derivabilidad", "t-am-derivabilidad", "Derivabilidad de funciones partidas y por definición", (r, d, mk) => {
  const mode = r.pick(byDifficulty(d, [["a"], ["a"], ["a", "b"], ["b"], ["par", "b"], ["def", "par"]] as const));
  if (mode === "def") {
    const k = r.nz(-6, 6);
    return choice(
      r,
      mk({
        prompt: `Sea $f(x) = x^2 sen(1/x) ${termX(k)}$ si $x > 0$ y $f(x) = ax + b$ si $x ≤ 0$. ¿Para qué valores f es derivable en 0?`,
        hints: ["Derivable implica continua: primero el límite en 0⁺ tiene que valer f(0) = b.", "$x^2 sen(1/x) → 0$ (acotada × infinitésimo), así que b = 0.", `Por definición: $\\frac{f(h) − f(0)}{h} = h·sen(1/h) ${termX(k, "")} → ${fmt(k)}$ para h → 0⁺; por izquierda da a.`],
        solution: [`Continuidad: lim x→0⁺ (x² sen(1/x) ${termX(k)}) = 0 = b`, `Derivada por derecha: lim (h² sen(1/h) ${termX(k, "h")})/h = lim (h sen(1/h) ${sgn(k)}) = ${fmt(k)}`, `Derivada por izquierda: a. Derivable ⇔ a = ${fmt(k)}, b = 0`],
        explanation: "Cuando la regla de derivación da algo sin límite (como cos(1/x)), hay que usar la definición: el cociente incremental puede tener límite igual.",
      }),
      uniq([
        { text: `$a = ${fmt(k)}$, $b = 0$`, correct: true },
        { text: "Para ningún valor: $cos(1/x)$ no tiene límite", error: { type: "derivacion", message: "Derivar con reglas para x > 0 y tomar límite no decide la derivabilidad en 0. Por definición, (h² sen(1/h) + kh)/h = h sen(1/h) + k → k." } },
        { text: `$a = ${fmt(k)}$, $b = ${fmt(k)}$`, error: { type: "conceptual", message: "Para ser derivable primero tiene que ser continua: el límite por derecha en 0 es 0, así que b = 0." } },
        { text: `$a = ${fmt(k + 1)}$, $b = 0$`, error: { type: "limites", message: "h·sen(1/h) → 0 (acotada × infinitésimo), no 1." } },
      ]),
    );
  }
  const p = r.pick([1, 2, 3, -1, -2]);
  const s = r.int(-4, 4), t = r.int(-5, 5);
  const a = 2 * p + s, b = t - p * p;
  const f1 = `x^2 ${s ? termX(s) : ""} ${t ? sgn(t) : ""}`.replace(/\s+/g, " ").trim();
  const prompt = `Sea $f(x) = ${f1}$ si $x ≤ ${fmt(p)}$ y $f(x) = ax + b$ si $x > ${fmt(p)}$.`;
  const hints: [string, string, string] = [
    "Derivable en el empalme ⇒ continua y con derivadas laterales iguales.",
    `Derivadas: a la izquierda $${poly([2, s])}$, a la derecha a. En x = ${fmt(p)}: a = ${fmt(a)}.`,
    `Continuidad: $${p * p + s * p + t} = ${fmt(p)}a + b$.`,
  ];
  const sol = [`Derivadas laterales: ${poly([2, s])} en x = ${fmt(p)} da ${fmt(a)} → a = ${fmt(a)}`, `Continuidad: f(${fmt(p)}) = ${fmt(p * p + s * p + t)} = ${fmt(p)}·${par(a)} + b → b = ${fmt(b)}`];
  const expl = "Para que una función partida sea derivable en el empalme tiene que ser continua ahí (una ecuación) y las derivadas laterales tienen que coincidir (otra ecuación).";
  if (mode === "a")
    return num(
      mk({ prompt: prompt + " Hallá $a$ para que f sea derivable en $x = " + fmt(p) + "$.", hints, solution: sol, explanation: expl, frequentErrors: [fe(p * p + s * p + t, "derivacion", "Igualaste los valores de la función; para la derivabilidad se igualan las DERIVADAS laterales."), fe(p * p, "derivacion", "La derivada de x² es 2x: en x = " + fmt(p) + " vale " + fmt(2 * p) + ".")] }),
      a,
    );
  if (mode === "b")
    return num(
      mk({ prompt: prompt + " Hallá $b$ para que f sea derivable en $x = " + fmt(p) + "$.", hints, solution: sol, explanation: expl, frequentErrors: [fe(t, "conceptual", "b no es el término independiente del primer tramo: sale de la condición de continuidad en x = " + fmt(p) + "."), fe(t + p * p + 2 * s * p, "signos", "Al despejar b, el término a·" + par(p) + " pasa restando.")] }),
      b,
    );
  return choice(
    r,
    mk({ prompt: prompt + " ¿Para qué valores es derivable en $x = " + fmt(p) + "$?", hints, solution: sol, explanation: expl }),
    uniq([
      { text: `$a = ${fmt(a)}$, $b = ${fmt(b)}$`, correct: true },
      { text: `$a = ${fmt(a)}$, $b = ${fmt(t)}$`, error: { type: "conceptual", message: "b sale de la continuidad en el empalme, no del término independiente." } },
      { text: `$a = ${fmt(2 * p)}$, $b = ${fmt(p * p + s * p + t - 2 * p * p)}$`, error: { type: "derivacion", message: `La derivada del primer tramo es ${poly([2, s])}: faltó derivar el término ${termX(s)}.` } },
      { text: "No es derivable para ningún valor", error: { type: "conceptual", message: "Hay dos incógnitas y dos condiciones (continuidad y derivadas iguales): siempre se pueden cumplir acá." } },
    ]),
  );
});

// ───────────────────────── 12. L'Hôpital ─────────────────────────

export const lhopital = gen("am-lhopital", "t-am-lhopital", "Regla de L'Hôpital: 0/0, aplicación doble, continuidad y f abstracta", (r, d, mk) => {
  const mode = r.pick(byDifficulty(d, [["exp"], ["exp", "pot"], ["cos", "ln"], ["cos", "doble"], ["doble", "cont"], ["abstracta", "cont"]] as const));
  const H1 = "Verificá que es 0/0 (o ∞/∞): solo ahí vale L'Hôpital.";
  const H2 = "Derivá numerador y denominador POR SEPARADO (no es la regla del cociente).";
  if (mode === "exp") {
    const k = r.nz(-5, 5), m = r.int(1, 4);
    return num(
      mk({
        prompt: `Calculá $lim_{x→0} \\frac{e^{${coef(k)}x} − 1}{${coef(m)}x}$`,
        hints: [H1, H2, `Queda $\\frac{${fmt(k)}e^{${coef(k)}x}}{${m}}$; reemplazá x = 0.`],
        solution: [`En 0: (1 − 1)/0 → 0/0`, `L'H: ${fmt(k)}e^{${coef(k)}x}/${m}`, `→ ${fmt(k)}/${m} = ${fr(k, m)}`],
        explanation: "L'Hôpital: si f/g da 0/0 o ∞/∞, lím f/g = lím f′/g′ (si este último existe).",
        frequentErrors: [fe(0, "limites", "0/0 no es 0: es una indeterminación."), fe(1 / m, "derivacion", `La derivada de e^{${coef(k)}x} es ${fmt(k)}e^{${coef(k)}x}: faltó la cadena.`), fe(m / k, "fracciones", "Quedó invertido: arriba va la derivada del numerador.")],
      }),
      k / m,
    );
  }
  if (mode === "pot") {
    const n = r.int(2, 5), c = r.nz(-2, 3);
    const v = n * c ** (n - 1);
    return num(
      mk({
        prompt: `Calculá $lim_{x→${fmt(c)}} \\frac{x^${n} − ${fmt(c ** n)}}{${poly([1, -c])}}$`,
        hints: [H1, H2, `Queda $${n}x^${n - 1}/1$.`],
        solution: ["0/0", `L'H: ${n}x^${n - 1}/1`, `→ ${n}·${par(c)}^${n - 1} = ${fmt(v)}`],
        explanation: "Ese límite es la definición de la derivada de xⁿ en c: por eso da n·cⁿ⁻¹.",
        frequentErrors: [fe(0, "limites", "0/0 no es 0."), fe(c ** (n - 1), "derivacion", `(x^${n})′ = ${n}x^${n - 1}: faltó bajar el exponente.`), fe(n * c ** n, "derivacion", "Al derivar, el exponente baja y se le resta 1.")],
      }),
      v,
    );
  }
  if (mode === "ln") {
    const a = r.nz(-6, 6), b = r.int(1, 5);
    return num(
      mk({
        prompt: `Calculá $lim_{x→0} \\frac{ln(${poly([a, 1])})}{sen(${coef(b)}x)}$`,
        hints: [H1, H2, `Queda $\\frac{${fmt(a)}/(${poly([a, 1])})}{${b} cos(${coef(b)}x)}$.`],
        solution: ["ln 1 / sen 0 = 0/0", `L'H: [${fmt(a)}/(${poly([a, 1])})] / [${b}cos(${coef(b)}x)]`, `→ ${fmt(a)}/${b} = ${fr(a, b)}`],
        explanation: "Derivando arriba y abajo: (ln(1 + ax))′ = a/(1 + ax) y (sen bx)′ = b cos bx.",
        frequentErrors: [fe(0, "limites", "0/0 no es 0."), fe(b / a, "fracciones", "Quedó invertido."), fe(a, "derivacion", `La derivada de sen(${coef(b)}x) es ${b}cos(${coef(b)}x): faltó el ${b}.`)],
      }),
      a / b,
    );
  }
  if (mode === "cos" || mode === "cont") {
    const k = r.int(2, 6), m = mode === "cont" ? r.int(1, 3) : 1;
    const v = -(k * k) / (2 * m);
    const lim = `\\frac{cos(${k}x) − 1}{${coef(m)}x^2}`;
    return num(
      mk({
        prompt: mode === "cos" ? `Calculá $lim_{x→0} ${lim}$` : `Sea $f(x) = ${lim}$ si $x ≠ 0$ y $f(0) = A$. Hallá $A$ para que f sea continua en 0.`,
        hints: [mode === "cont" ? "Continuidad: A tiene que ser el límite en 0. Es 0/0." : H1, `Primera vez: $\\frac{−${k}sen(${k}x)}{${2 * m}x}$, sigue siendo 0/0.`, `Segunda vez: $\\frac{−${k * k}cos(${k}x)}{${2 * m}}$.`],
        solution: ["0/0", `L'H: −${k}sen(${k}x)/(${2 * m}x) → 0/0 otra vez`, `L'H: −${k * k}cos(${k}x)/${2 * m} → ${fr(-k * k, 2 * m)}`, ...(mode === "cont" ? [`A = ${fr(-k * k, 2 * m)}`] : [])],
        explanation: "Si después de aplicar L'Hôpital sigue 0/0, se aplica de nuevo. Cada vez se derivan numerador y denominador por separado.",
        frequentErrors: [fe(0, "limites", "Después de la primera derivada sigue 0/0: hay que aplicar L'Hôpital otra vez, no cortar ahí."), fe(-(k * k) / m, "derivacion", `La derivada de ${coef(m)}x² es ${2 * m}x: faltó el 2.`), fe((k * k) / (2 * m), "signos", "(cos u)′ = −sen u·u′: el signo menos se mantiene."), fe(-k / (2 * m), "derivacion", `Cada derivada de cos(${k}x) o sen(${k}x) saca un ${k}: al derivar dos veces queda ${k * k}.`)],
      }),
      v,
    );
  }
  if (mode === "doble") {
    const a = r.nz(-4, 4);
    return num(
      mk({
        prompt: `Calculá $lim_{x→0} \\frac{e^{${coef(a)}x} − 1 ${termX(-a)}}{x^2}$`,
        hints: [H1, `Primera: $\\frac{${fmt(a)}e^{${coef(a)}x} ${sgn(-a)}}{2x}$: sigue 0/0.`, `Segunda: $\\frac{${a * a}e^{${coef(a)}x}}{2}$.`],
        solution: ["0/0", `L'H: (${fmt(a)}e^{${coef(a)}x} ${sgn(-a)})/(2x) → 0/0`, `L'H: ${a * a}e^{${coef(a)}x}/2 → ${fr(a * a, 2)}`],
        explanation: "Aplicación doble de L'Hôpital. El término lineal está justo para que la primera derivada vuelva a dar 0/0.",
        frequentErrors: [fe(0, "limites", "Después de la primera derivada sigue 0/0: aplicá L'Hôpital de nuevo."), fe(a * a, "derivacion", "La segunda derivada de x² es 2: faltó dividir por 2."), fe(a / 2, "derivacion", `Cada derivada de e^{${coef(a)}x} saca un ${fmt(a)}: queda ${a * a}.`)],
      }),
      (a * a) / 2,
    );
  }
  // abstracta: lím f(e^{px})/sen(qx) = L ⇒ f(1) = 0 y f′(1)·p/q = L
  const p = r.int(1, 4), q = r.int(1, 4), v = r.nz(-6, 6);
  const L = (v * p) / q;
  return num(
    mk({
      prompt: `f es derivable y $lim_{x→0} \\frac{f(e^{${coef(p)}x})}{sen(${coef(q)}x)} = ${fr(v * p, q)}$. ¿Cuánto vale $f′(1)$?`,
      hints: ["El denominador tiende a 0 y el límite es finito: el numerador también tiene que tender a 0, o sea f(1) = 0.", `Entonces es 0/0. L'Hôpital: $\\frac{f′(e^{${coef(p)}x})·${p}e^{${coef(p)}x}}{${q}cos(${coef(q)}x)}$.`, `En x = 0 eso vale $f′(1)·${p}/${q}$: igualalo al dato.`],
      solution: ["Denominador → 0 y límite finito ⇒ f(1) = 0 ⇒ 0/0", `L'H: f′(e^{${coef(p)}x})·${p}e^{${coef(p)}x} / (${q}cos(${coef(q)}x)) → f′(1)·${p}/${q}`, `f′(1)·${p}/${q} = ${fr(v * p, q)} → f′(1) = ${fmt(v)}`],
      explanation: "Con f abstracta, L'Hôpital usa la regla de la cadena: (f(g(x)))′ = f′(g(x))·g′(x).",
      frequentErrors: [fe(L, "derivacion", `Faltó la cadena: la derivada de f(e^{${coef(p)}x}) incluye el factor ${p}e^{${coef(p)}x}.`), fe((L * p) / q, "fracciones", "Despejaste al revés: f′(1)·p/q = L ⇒ f′(1) = L·q/p.")],
    }),
    v,
  );
});

// ───────────────────────── 13. Estudio de funciones (opción múltiple) ─────────────────────────

const inf = "+∞";
const iv = (a: string, b: string, l = "(", rr = ")") => `$${l}${a}; ${b}${rr}$`;

export const estudioFuncion = gen("am-estudio-funcion", "t-am-estudio-funcion", "Estudio de funciones: crecimiento, extremos, imagen y cortes (opción múltiple)", (r, d, mk) => {
  const fam = r.pick(byDifficulty(d, [["cub"], ["cub", "camp"], ["camp", "log"], ["log", "camp"], ["log", "camp", "exp"], ["exp", "log"]] as const));
  const ask = r.pick(byDifficulty(d, [["crece", "decrece"], ["crece", "extremo"], ["extremo", "imagen"], ["imagen", "crece"], ["imagen", "cortes"], ["cortes", "imagen"]] as const));
  const H: [string, string, string] = ["Primero el dominio. Después f′ y su signo.", "", "Para la imagen: valores en los extremos locales y límites en los bordes del dominio."];
  const cortes = (n: number, why: string) =>
    uniq(
      [
        { n: 0, t: "Ninguno" },
        { n: 1, t: "Exactamente uno" },
        { n: 2, t: "Exactamente dos" },
        { n: 3, t: "Exactamente tres" },
      ].map((o) => (o.n === n ? { text: o.t, correct: true } : { text: o.t, error: { type: "interpretacion" as const, message: why } })),
    );
  let fText = "", dom = "", fp = "", sol: string[] = [];
  let options: { text: string; correct?: boolean; error?: { type: "interpretacion" | "conceptual" | "signos" | "limites" | "derivacion"; message: string } }[] = [];
  let q = "";
  if (fam === "cub") {
    const p = r.pick([1, 2]), c = r.int(-4, 4);
    const M = 2 * p ** 3 + c, m = -2 * p ** 3 + c;
    fText = `x^3 − ${3 * p * p}x ${c ? sgn(c) : ""}`;
    dom = "ℝ";
    fp = `3x^2 − ${3 * p * p} = 3(x − ${p})(x + ${p})`;
    sol = [`Dom f = ℝ; f′(x) = ${fp}`, `f′ > 0 en (−∞; −${p}) ∪ (${p}; +∞); f′ < 0 en (−${p}; ${p})`, `Máx. local en x = −${p} (f = ${fmt(M)}); mín. local en x = ${p} (f = ${fmt(m)})`, "lim x→±∞ f = ±∞ ⇒ Im f = ℝ"];
    if (ask === "crece" || ask === "decrece") {
      const up = ask === "crece";
      q = `¿En qué intervalo(s) ${up ? "crece" : "decrece"} f?`;
      options = [
        { text: up ? `$(−∞; −${p}) ∪ (${p}; +∞)$` : iv(`−${p}`, `${p}`), correct: true },
        { text: up ? iv(`−${p}`, `${p}`) : `$(−∞; −${p}) ∪ (${p}; +∞)$`, error: { type: "signos", message: "Esos son los intervalos donde hace lo contrario. Revisá el signo de f′ en cada tramo (probá un valor)." } },
        { text: up ? iv(`${p}`, inf) : iv("0", `${p}`), error: { type: "interpretacion", message: "Falta una parte: mirá TODOS los tramos que determinan los ceros de f′." } },
        { text: iv(fmt(m), fmt(M)), error: { type: "interpretacion", message: "Esos son valores de f (ordenadas). Los intervalos de crecimiento son de x." } },
      ];
    } else if (ask === "extremo") {
      q = "¿Qué afirmación es correcta?";
      options = [
        { text: `Máximo local en $x = −${p}$ y mínimo local en $x = ${p}$`, correct: true },
        { text: `Mínimo local en $x = −${p}$ y máximo local en $x = ${p}$`, error: { type: "signos", message: `Antes de −${p} f′ > 0 (sube) y después f′ < 0 (baja): eso es un máximo.` } },
        { text: `Máximo absoluto en $x = −${p}$`, error: { type: "conceptual", message: "Es un máximo LOCAL: como f → +∞, hay valores mayores. No hay máximo absoluto." } },
        { text: `Máximo local en $x = ${fmt(M)}$`, error: { type: "interpretacion", message: `${fmt(M)} es el valor del máximo (ordenada), no su abscisa.` } },
      ];
    } else if (ask === "imagen") {
      q = "¿Cuál es la imagen de f?";
      options = [
        { text: "$ℝ$", correct: true },
        { text: `$[${fmt(m)}; ${fmt(M)}]$`, error: { type: "limites", message: "Los extremos son locales: f → ±∞ en los bordes, así que toma todos los valores." } },
        { text: `$[${fmt(m)}; +∞)$`, error: { type: "limites", message: "Cuando x → −∞, f → −∞: también toma valores menores." } },
      ];
    } else {
      const y0 = r.pick([c, M + 1, M]);
      const n = y0 === c ? 3 : y0 === M ? 2 : 1;
      q = `¿Cuántas veces corta el gráfico de f a la recta $y = ${fmt(y0)}$?`;
      options = cortes(n, `Ubicá ${fmt(y0)} respecto del máximo local (${fmt(M)}) y el mínimo local (${fmt(m)}), y recordá que f → ±∞ en los bordes.`);
    }
    H[1] = `$f′(x) = ${fp}$.`;
  } else if (fam === "camp") {
    const a = r.int(1, 4), h = r.int(1, 3), c = r.int(-3, 3);
    const b = 2 * a * h;
    fText = `\\frac{${b}x}{x^2 + ${a * a}} ${c ? sgn(c) : ""}`;
    dom = "ℝ";
    fp = `\\frac{${b}(${a * a} − x^2)}{(x^2 + ${a * a})^2}`;
    sol = [`Dom f = ℝ; f′(x) = ${b}(${a * a} − x²)/(x² + ${a * a})²`, `f′ > 0 en (−${a}; ${a}); f′ < 0 en (−∞; −${a}) ∪ (${a}; +∞)`, `Mín. en x = −${a} (f = ${fmt(c - h)}); máx. en x = ${a} (f = ${fmt(c + h)})`, `lim x→±∞ f = ${fmt(c)} (no se alcanza en los bordes) ⇒ Im f = [${fmt(c - h)}; ${fmt(c + h)}]`];
    if (ask === "crece" || ask === "decrece") {
      q = "¿En qué intervalo crece f?";
      options = [
        { text: iv(`−${a}`, `${a}`), correct: true },
        { text: `$(−∞; −${a}) ∪ (${a}; +∞)$`, error: { type: "signos", message: "Ahí f′ < 0: decrece. Probá x = 0 en f′: da positivo." } },
        { text: iv(fmt(c - h), fmt(c + h)), error: { type: "interpretacion", message: "Esos son valores de f (es la imagen). El crecimiento se describe con intervalos de x." } },
        { text: iv("0", inf), error: { type: "signos", message: `f′ cambia de signo en ±${a}, no en 0.` } },
      ];
    } else if (ask === "extremo") {
      q = "¿Qué afirmación es correcta?";
      options = [
        { text: `Máximo en $x = ${a}$, de valor ${fmt(c + h)}`, correct: true },
        { text: `Máximo en $x = ${fmt(c + h)}$, de valor ${a}`, error: { type: "interpretacion", message: "Intercambiaste abscisa y ordenada: el máximo está en x = " + a + " y vale f(" + a + ") = " + fmt(c + h) + "." } },
        { text: `Mínimo en $x = ${a}$, de valor ${fmt(c + h)}`, error: { type: "signos", message: "A la izquierda de " + a + " f′ > 0 y a la derecha f′ < 0: es un máximo." } },
        { text: `Máximo en $x = −${a}$, de valor ${fmt(c - h)}`, error: { type: "signos", message: "En x = −" + a + " f pasa de decrecer a crecer: es un mínimo." } },
      ];
    } else if (ask === "imagen") {
      q = "¿Cuál es la imagen de f?";
      options = [
        { text: `$[${fmt(c - h)}; ${fmt(c + h)}]$`, correct: true },
        { text: `$(${fmt(c - h)}; ${fmt(c + h)})$`, error: { type: "limites", message: "Los valores extremos SÍ se alcanzan (en x = ±" + a + "): van con corchete." } },
        { text: `$[−${a}; ${a}]$`, error: { type: "interpretacion", message: "Esas son las abscisas de los extremos. La imagen se arma con los VALORES de f." } },
        { text: `$[${fmt(c - h)}; ${fmt(c)})$`, error: { type: "limites", message: `${fmt(c)} es el límite en ±∞, pero f lo supera: en x = ${a} vale ${fmt(c + h)}.` } },
      ];
    } else {
      const y0 = r.pick([c, c + h, c + 2 * h]);
      const n = y0 === c ? 1 : y0 === c + h ? 1 : 0;
      q = `¿Cuántas veces corta el gráfico de f a la recta $y = ${fmt(y0)}$?`;
      options = cortes(
        n,
        y0 === c
          ? `f(x) = ${fmt(c)} solo si x = 0. El límite en ±∞ es ${fmt(c)}, pero los bordes no se alcanzan: no suman cortes.`
          : `Imagen = [${fmt(c - h)}; ${fmt(c + h)}]. ${fmt(y0)} ${y0 > c + h ? "queda afuera" : "es el máximo, que se alcanza en un solo punto"}.`,
      );
    }
    H[1] = `$f′(x) = ${fp}$.`;
  } else if (fam === "log") {
    const a = r.int(-1, 3), k = r.int(2, 5), c = r.int(-3, 3);
    const v = 1 + c === 0 ? `ln ${k}` : `${fmt(1 + c)} + ln ${k}`;
    const vNum = 1 + c + Math.log(k);
    fText = `ln(${poly([1, -a])}) + \\frac{${k}}{${poly([1, -a])}} ${c ? sgn(c) : ""}`;
    dom = `(${fmt(a)}; +∞)`;
    fp = `\\frac{x ${sgn(-a - k)}}{(${poly([1, -a])})^2}`;
    sol = [`Dom f = (${fmt(a)}; +∞)`, `f′(x) = 1/(${poly([1, -a])}) − ${k}/(${poly([1, -a])})² = (${poly([1, -a - k])})/(${poly([1, -a])})²`, `f′ < 0 en (${fmt(a)}; ${fmt(a + k)}), f′ > 0 en (${fmt(a + k)}; +∞) ⇒ mín. en x = ${fmt(a + k)}, f = ${v}`, `lim x→${fmt(a)}⁺ f = +∞ y lim x→+∞ f = +∞ ⇒ Im f = [${v}; +∞)`];
    if (ask === "crece" || ask === "decrece") {
      q = "¿En qué intervalo crece f?";
      options = [
        { text: iv(fmt(a + k), inf), correct: true },
        { text: iv(fmt(a), fmt(a + k)), error: { type: "signos", message: "Ahí f′ < 0: decrece." } },
        { text: iv("−∞", fmt(a + k)), error: { type: "conceptual", message: `Ese intervalo incluye valores fuera del dominio: f solo existe para x > ${fmt(a)}.` } },
        { text: iv(fmt(a), inf), error: { type: "signos", message: `f′ es negativa entre ${fmt(a)} y ${fmt(a + k)}: no crece en todo el dominio.` } },
      ];
    } else if (ask === "extremo") {
      q = "¿Qué afirmación es correcta?";
      options = [
        { text: `Mínimo local en $x = ${fmt(a + k)}$`, correct: true },
        { text: `Máximo local en $x = ${fmt(a + k)}$`, error: { type: "signos", message: "f′ pasa de negativa a positiva: f baja y después sube, es un mínimo." } },
        { text: `Mínimo local en $x = ${fmt(a)}$`, error: { type: "conceptual", message: `x = ${fmt(a)} no está en el dominio (es una asíntota vertical).` } },
        { text: "No tiene extremos locales", error: { type: "derivacion", message: `f′ se anula y cambia de signo en x = ${fmt(a + k)}.` } },
      ];
    } else if (ask === "imagen") {
      q = "¿Cuál es la imagen de f?";
      options = [
        { text: `$[${v}; +∞)$`, correct: true },
        { text: iv(fmt(a + k), inf, "["), error: { type: "interpretacion", message: `${fmt(a + k)} es la abscisa del mínimo. La imagen empieza en el VALOR mínimo, f(${fmt(a + k)}) = ${v}.` } },
        { text: `$(${v}; +∞)$`, error: { type: "limites", message: "El mínimo se alcanza en x = " + fmt(a + k) + ": va con corchete." } },
        { text: "$ℝ$", error: { type: "limites", message: "Hacia los dos bordes del dominio f → +∞: nunca baja del mínimo." } },
      ];
    } else {
      const y0 = r.pick([Math.ceil(vNum) + 1, Math.floor(vNum)]);
      const n = y0 > vNum ? 2 : 0;
      q = `¿Cuántas veces corta el gráfico de f a la recta $y = ${fmt(y0)}$? (ln ${k} ≈ ${fmt(Math.log(k), 2)})`;
      options = cortes(n, `El mínimo vale ${v} ≈ ${fmt(vNum, 2)} y f → +∞ en ambos bordes. Compará ${fmt(y0)} con ese mínimo.`);
    }
    H[1] = `$f′(x) = ${fp}$.`;
  } else {
    const k = r.pick([1, 2, 3]);
    fText = `x e^{−${k === 1 ? "" : k}x}`.replace("{−x}", "{−x}");
    if (k > 1) fText = `x e^{−x/${k}}`;
    dom = "ℝ";
    const kv = k === 1 ? "1/e" : `${k}/e`;
    sol = [`f′(x) = e^{−x/${k}}(1 − x/${k})`, `f′ > 0 si x < ${k}; f′ < 0 si x > ${k} ⇒ máx. en x = ${k}, f = ${kv}`, "lim x→−∞ f = −∞; lim x→+∞ f = 0 (positivo, no se alcanza)", `Im f = (−∞; ${kv}]`];
    if (ask === "crece" || ask === "decrece") {
      q = "¿En qué intervalo crece f?";
      options = [
        { text: iv("−∞", String(k)), correct: true },
        { text: iv(String(k), inf), error: { type: "signos", message: "Ahí f′ < 0: decrece." } },
        { text: iv("0", String(k)), error: { type: "conceptual", message: "El dominio es ℝ: f también crece para x < 0." } },
        { text: iv("−∞", kv), error: { type: "interpretacion", message: `${kv} es el valor máximo (ordenada). El intervalo de crecimiento termina en x = ${k}.` } },
      ];
    } else if (ask === "extremo") {
      q = "¿Qué afirmación es correcta?";
      options = [
        { text: `Máximo local en $x = ${k}$, de valor $${kv}$`, correct: true },
        { text: `Mínimo local en $x = ${k}$`, error: { type: "signos", message: "f′ pasa de positiva a negativa: máximo." } },
        { text: `Máximo local en $x = ${kv}$`, error: { type: "interpretacion", message: `${kv} es el valor; la abscisa es ${k}.` } },
        { text: "Mínimo en x = 0", error: { type: "derivacion", message: "f′(0) = 1 ≠ 0: en 0 no hay extremo." } },
      ];
    } else if (ask === "imagen") {
      q = "¿Cuál es la imagen de f?";
      options = [
        { text: `$(−∞; ${kv}]$`, correct: true },
        { text: `$(0; ${kv}]$`, error: { type: "limites", message: "El 0 es el límite hacia +∞, pero hacia −∞ f toma valores negativos sin tope: la imagen baja hasta −∞." } },
        { text: `$(−∞; ${k}]$`, error: { type: "interpretacion", message: `${k} es la abscisa del máximo; el valor máximo es ${kv}.` } },
        { text: `$(−∞; ${kv})$`, error: { type: "limites", message: `El máximo se alcanza en x = ${k}: va con corchete.` } },
      ];
    } else {
      const pos = r.bool();
      q = pos ? `¿Cuántas veces corta el gráfico de f a la recta $y = \\frac{${k}}{2e}$?` : "¿Cuántas veces corta el gráfico de f a la recta $y = −1$?";
      options = cortes(pos ? 2 : 1, pos ? `${k}/(2e) está entre 0 y el máximo ${kv}: lo alcanza una vez subiendo (x < ${k}) y otra bajando hacia 0 (x > ${k}).` : "Para valores negativos solo sirve x < 0, donde f crece de −∞ a 0: un único corte.");
    }
    H[1] = `$f′(x) = e^{−x/${k}}(1 − \\frac{x}{${k}})$.`;
  }
  return choice(
    r,
    mk({
      prompt: `Sea $f(x) = ${fText.replace(/\s+/g, " ").trim()}$. ${q}`,
      hints: [`Dom f = ${dom}. ${H[0]}`, H[1], H[2]],
      solution: sol,
      explanation: "Estudio de función: dominio → f′ y su signo → extremos (con sus valores) → límites en los bordes del dominio → imagen. Cada distractor del parcial sale de saltear uno de esos pasos.",
    }),
    uniq(options),
  );
});

// ───────────────────────── 14. Extremos absolutos (Weierstrass) ─────────────────────────

const LOGS: [number, number, number][] = [[1, 8, 2], [2, 9, 1.5], [2, 16, 2], [3, 24, 2], [4, 18, 1.5], [2, 25, 2.5]];

export const extremosAbsolutos = gen("am-extremos-absolutos", "t-am-extremos-absolutos", "Máximo y mínimo absolutos en un intervalo cerrado", (r, d, mk) => {
  const fam = r.pick(byDifficulty(d, [["poly"], ["poly"], ["poly", "log"], ["log"], ["log", "poly"], ["log"]] as const));
  const wantMax = r.bool();
  const H: [string, string, string] = ["Weierstrass: una función continua en [a; b] alcanza máximo y mínimo absolutos.", "Candidatos: los puntos críticos DENTRO del intervalo y los dos extremos del intervalo.", "Evaluá f en todos los candidatos y compará."];
  if (fam === "poly") {
    const s = r.pick([1, 2]), c = r.int(-3, 3);
    const f = (x: number) => x ** 3 - 3 * s * s * x + c;
    for (let tries = 0; tries < 20; tries++) {
      const L = r.int(-3 * s, 0), R = r.int(1, 3 * s);
      const cands = [L, R, -s, s].filter((x, i, arr) => x >= L && x <= R && arr.indexOf(x) === i);
      const vals = cands.map(f);
      const target = wantMax ? Math.max(...vals) : Math.min(...vals);
      const at = cands.filter((x) => f(x) === target);
      if (at.length !== 1) continue;
      const x0 = at[0];
      const local = wantMax ? -s : s;
      const askX = d <= 2 || r.bool();
      return num(
        mk({
          prompt: `Sea $f(x) = ${poly([1, 0, -3 * s * s, c])}$ en $[${fmt(L)}; ${fmt(R)}]$. ${askX ? `¿En qué x alcanza su ${wantMax ? "máximo" : "mínimo"} absoluto?` : `¿Cuál es el valor ${wantMax ? "máximo" : "mínimo"} absoluto de f?`}`,
          hints: H,
          solution: [`f′(x) = 3x² − ${3 * s * s} = 0 → x = ±${s}`, `Candidatos: ${cands.map((x) => `f(${fmt(x)}) = ${fmt(f(x))}`).join("; ")}`, `${wantMax ? "Máximo" : "Mínimo"} absoluto: f(${fmt(x0)}) = ${fmt(target)}`],
          explanation: "En un intervalo cerrado los extremos absolutos están en puntos críticos interiores o en los bordes: hay que evaluar todos.",
          frequentErrors: askX
            ? [fe(target, "interpretacion", "Ese es el valor de f; te piden la abscisa x."), fe(local, "conceptual", `x = ${fmt(local)} es un extremo LOCAL; en el intervalo cerrado puede ganarle un borde. Compará con f en los extremos del intervalo.`)]
            : [fe(x0, "interpretacion", "Esa es la abscisa; te piden el valor de f."), fe(f(local), "conceptual", "Ese es el extremo local; compará también con los bordes del intervalo.")],
        }),
        askX ? x0 : target,
      );
    }
  }
  const [a, b, cc] = r.pick(LOGS);
  const f = (x: number) => a * x * x - b * Math.log(x);
  const f1 = f(1), fe_ = f(Math.E), fc = f(cc);
  const xmax = f1 > fe_ ? 1 : Math.E;
  const askX = wantMax || d < 6;
  if (wantMax) {
    return num(
      mk({
        prompt: `Sea $f(x) = ${coef(a)}x^2 − ${b} ln x$ en $[1; e]$. ¿En qué x alcanza su máximo absoluto? (si es e, escribí e)`,
        hints: H,
        solution: [`f′(x) = ${2 * a}x − ${b}/x = 0 → x² = ${fmt(b / (2 * a))} → x = ${fmt(cc)} (−${fmt(cc)} no está en el intervalo)`, `f(1) = ${fmt(f1, 2)}; f(${fmt(cc)}) ≈ ${fmt(fc, 2)}; f(e) = ${coef(a)}e² − ${b} ≈ ${fmt(fe_, 2)}`, `Máximo absoluto en x = ${xmax === 1 ? "1" : "e"}`],
        explanation: "El punto crítico es un mínimo; el máximo absoluto está en uno de los bordes. Hay que evaluar los dos.",
        frequentErrors: [fe(cc, "conceptual", `En x = ${fmt(cc)} hay un mínimo (f′ pasa de − a +). El máximo está en un borde.`), fe(xmax === 1 ? Math.E : 1, "calculo", `Compará bien: f(1) ≈ ${fmt(f1, 2)} y f(e) ≈ ${fmt(fe_, 2)}.`), fe(Math.max(f1, fe_), "interpretacion", "Ese es el valor máximo; te piden la abscisa.")],
      }),
      xmax,
      1e-3,
    );
  }
  return num(
    mk({
      prompt: `Sea $f(x) = ${coef(a)}x^2 − ${b} ln x$ en $[1; e]$. ${askX ? "¿En qué x alcanza su mínimo absoluto?" : "¿Cuál es el valor mínimo absoluto? (2 decimales)"}`,
      hints: H,
      solution: [`f′(x) = ${2 * a}x − ${b}/x = 0 → x = ${fmt(cc)}`, `f(1) = ${fmt(f1, 2)}; f(${fmt(cc)}) ≈ ${fmt(fc, 2)}; f(e) ≈ ${fmt(fe_, 2)}`, `Mínimo absoluto en x = ${fmt(cc)}, valor ≈ ${fmt(fc, 2)}`],
      explanation: "El candidato interior gana para el mínimo, pero solo lo sabés comparando con los bordes.",
      frequentErrors: askX ? [fe(fc, "interpretacion", "Ese es el valor; te piden la abscisa."), fe(1, "conceptual", "f′ < 0 a la derecha de 1: f sigue bajando, el mínimo está más adelante.")] : [fe(cc, "interpretacion", "Esa es la abscisa; te piden el valor de f.")],
    }),
    askX ? cc : fc,
    askX ? undefined : 0.011,
  );
});

// ───────────────────────── 15. Polinomio de Taylor ─────────────────────────

const FACT = [1, 1, 2, 6, 24, 120];

export const taylor = gen("am-taylor", "t-am-taylor", "Polinomio de Taylor: coeficientes, parámetros y P₃ desde una EDO", (r, d, mk) => {
  const mode = r.pick(byDifficulty(d, [["exp-coef"], ["exp-coef", "ln-coef"], ["exp-poly", "ln-coef"], ["param"], ["param-b", "param-p2"], ["edo", "param-p2"]] as const));
  const H0 = "Pₙ(x) = Σ f⁽ᵏ⁾(x₀)/k! · (x − x₀)ᵏ: cada coeficiente es la derivada k-ésima en x₀ dividida por k!.";
  if (mode === "exp-coef" || mode === "ln-coef") {
    const k = r.nz(-3, 3), n = r.pick([2, 3]);
    const isExp = mode === "exp-coef";
    const nn = isExp ? n : 3;
    const val = isExp ? k ** nn / FACT[nn] : k ** 3 / 3;
    return num(
      mk({
        prompt: `¿Cuál es el coeficiente de $x^${nn}$ en el polinomio de Taylor de orden ${nn} de $f(x) = ${isExp ? `e^{${coef(k)}x}` : `ln(${poly([k, 1])})`}$ centrado en $x_0 = 0$? (podés escribir una fracción)`,
        hints: [H0, isExp ? `Las derivadas de $e^{${coef(k)}x}$ van sacando factores ${fmt(k)}: $f^{(${nn})}(0) = ${par(k)}^${nn}$.` : `$f′ = \\frac{${fmt(k)}}{${poly([k, 1])}}$, $f″ = \\frac{−${k * k}}{(${poly([k, 1])})^2}$, $f‴ = \\frac{${2 * k ** 3}}{(${poly([k, 1])})^3}$.`, `Dividí por ${nn}! = ${FACT[nn]}.`],
        solution: isExp ? [`f⁽${nn}⁾(x) = ${par(k)}^${nn}·e^{${coef(k)}x} → f⁽${nn}⁾(0) = ${fmt(k ** nn)}`, `Coeficiente: ${fmt(k ** nn)}/${FACT[nn]} = ${fr(k ** nn, FACT[nn])}`] : [`f‴(0) = ${fmt(2 * k ** 3)}`, `Coeficiente: ${fmt(2 * k ** 3)}/3! = ${fr(k ** 3, 3)}`],
        explanation: "El coeficiente de (x − x₀)ᵏ no es la derivada sola: es la derivada dividida por k!.",
        frequentErrors: [fe(isExp ? k ** nn : 2 * k ** 3, "formula", `Faltó dividir por ${nn}! = ${FACT[nn]}.`), fe(isExp ? k ** nn / nn : (2 * k ** 3) / 3, "formula", `Se divide por ${nn}! (factorial), no por ${nn}.`), fe(-val, "signos", "Revisá los signos de las derivadas sucesivas.")],
      }),
      val,
    );
  }
  if (mode === "exp-poly") {
    const k = r.nz(-3, 3), m = r.int(-3, 3);
    const ans = `1 + ${k + m}*x + ${(k * k) / 2}*x^2`;
    return expr(
      mk({
        prompt: `Escribí el polinomio de Taylor de orden 2 de $f(x) = e^{${coef(k)}x}${m ? ` ${termX(m)}` : ""}$ centrado en $x_0 = 0$.`,
        hints: [H0, `f(0) = 1; f′(x) = ${fmt(k)}e^{${coef(k)}x}${m ? ` ${sgn(m)}` : ""}; f″(x) = ${k * k}e^{${coef(k)}x}.`, `P₂ = f(0) + f′(0)x + \\frac{f″(0)}{2}x².`],
        solution: [`f(0) = 1, f′(0) = ${fmt(k + m)}, f″(0) = ${k * k}`, `P₂(x) = 1 ${termX(k + m)} + ${fr(k * k, 2)}x²`],
        explanation: "P₂ aproxima f cerca de x₀ con una parábola que comparte valor, pendiente y curvatura.",
        frequentErrors: exprErrors(ans, [fe(`1 + ${k + m}*x + ${k * k}*x^2`, "formula", "Faltó dividir por 2! el término de x²."), fe(`1 + ${k}*x + ${(k * k) / 2}*x^2`, "derivacion", `La derivada de ${termX(m)} también suma en f′(0).`)], [-2, 2]),
      }),
      ans,
      [-2, 2],
    );
  }
  if (mode === "edo") {
    const p = r.nz(-3, 3);
    const ans = `x + ${(p + 1) / 2}*x^2 + ${(p + 2) / 6}*x^3`;
    return expr(
      mk({
        prompt: `f cumple $f′(x) = ${coef(p)}x + e^{f(x)}$ y $f(0) = 0$. Escribí su polinomio de Taylor de orden 3 centrado en 0.`,
        hints: ["No hace falta conocer f: las derivadas salen de la ecuación.", `$f″ = ${fmt(p)} + e^f·f′$ y $f‴ = e^f·(f′)^2 + e^f·f″$.`, `En 0: f′(0) = 1, f″(0) = ${p + 1}, f‴(0) = ${p + 2}. Dividí por 2! y 3!.`],
        solution: [`f′(0) = 0 + e⁰ = 1`, `f″(0) = ${fmt(p)} + 1·1 = ${fmt(p + 1)}`, `f‴(0) = 1·1² + 1·${par(p + 1)} = ${fmt(p + 2)}`, `P₃(x) = x + ${fr(p + 1, 2)}x² + ${fr(p + 2, 6)}x³`],
        explanation: "Derivando la ecuación diferencial se obtienen todas las derivadas en el punto, que es lo único que necesita Taylor.",
        frequentErrors: exprErrors(ans, [fe(`x + ${p + 1}*x^2 + ${p + 2}*x^3`, "formula", "Faltaron los factoriales: los coeficientes son f″(0)/2! y f‴(0)/3!."), fe(`x + ${(p + 1) / 2}*x^2 + ${(p + 2) / 2}*x^3`, "formula", "El de x³ se divide por 3! = 6, no por 3 ni por 2.")], [-2, 2]),
      }),
      ans,
      [-2, 2],
    );
  }
  // (ax + b)^{3/2}, P₁ en x0 = s³ + c1(x − x0)
  const opts: [number, number][] = [[2, 3], [2, 1], [4, 1], [3, 2], [3, 4], [4, 3], [2, 2]];
  const [s0, a] = r.pick(opts);
  const x0 = r.pick([1, 2]);
  const b = s0 * s0 - a * x0;
  const c1 = (3 * a * s0) / 2;
  const P1 = `${s0 ** 3} + ${fmt(c1)}(x − ${x0})`;
  const H: [string, string, string] = ["P₁(x) = f(x₀) + f′(x₀)(x − x₀): leé f(x₀) y f′(x₀) del dato.", `$f(${x0}) = (${x0}a + b)^{3/2} = ${s0 ** 3}$ ⇒ $${x0}a + b = ${s0 * s0}$.`, `$f′(x) = \\frac{3}{2}a(ax + b)^{1/2}$ ⇒ $f′(${x0}) = \\frac{3}{2}a·${s0} = ${fmt(c1)}$.`];
  const sol = [`f(${x0}) = ${s0 ** 3} ⇒ ${x0}a + b = ${s0 * s0}`, `f′(${x0}) = (3/2)·a·${s0} = ${fmt(c1)} ⇒ a = ${a}`, `b = ${s0 * s0} − ${x0}·${a} = ${b}`];
  const prompt = `Sea $f(x) = (ax + b)^{3/2}$ con a, b > 0. Su polinomio de Taylor de orden 1 centrado en $x_0 = ${x0}$ es $P(x) = ${P1}$.`;
  if (mode === "param")
    return num(mk({ prompt: prompt + " Hallá $a$.", hints: H, solution: sol, explanation: "Igualar Taylor con el dato da un sistema: el término independiente es f(x₀) y el coeficiente de (x − x₀) es f′(x₀).", frequentErrors: [fe(c1 / s0, "derivacion", "La derivada de u^{3/2} es (3/2)u^{1/2}·u′: faltó el 3/2."), fe((2 * c1) / (3 * s0 * s0 * s0), "conceptual", `Usaste f(x₀) = ${s0 ** 3} en lugar de su raíz: (ax₀ + b)^{1/2} = ${s0}.`)] }), a);
  if (mode === "param-b")
    return num(mk({ prompt: prompt + " Hallá $b$.", hints: H, solution: sol, explanation: "Primero a con la derivada, después b con el valor.", frequentErrors: [fe(s0 ** 3 - a * x0, "potencias", `(ax₀ + b)^{3/2} = ${s0 ** 3} ⇒ ax₀ + b = ${s0 ** 3}^{2/3} = ${s0 * s0}, no ${s0 ** 3}.`), fe(s0 * s0 + a * x0, "signos", "Al despejar b, el término a·x₀ pasa restando.")] }), b);
  const c2 = (3 * a * a) / (8 * s0);
  return num(
    mk({
      prompt: prompt + ` Con esos a y b, ¿cuál es el coeficiente de $(x − ${x0})^2$ en el polinomio de orden 2? (podés escribir una fracción)`,
      hints: [H[2], `$f″(x) = \\frac{3}{4}a^2(ax + b)^{−1/2}$.`, "El coeficiente es f″(x₀)/2!."],
      solution: [...sol, `f″(${x0}) = (3/4)·${a * a}/${s0} = ${fr(3 * a * a, 4 * s0)}`, `Coeficiente: f″(${x0})/2 = ${fr(3 * a * a, 8 * s0)}`],
      explanation: "El coeficiente de (x − x₀)² es f″(x₀)/2!, no f″(x₀).",
      frequentErrors: [fe((3 * a * a) / (4 * s0), "formula", "Faltó dividir por 2! = 2."), fe((3 * a) / (8 * s0), "derivacion", "Al derivar (ax + b)^{1/2} sale otra vez el factor a (regla de la cadena): queda a².")],
    }),
    c2,
  );
});

// ───────────────────────── 16. Primitivas: inmediatas y sustitución ─────────────────────────

export const primitivas = gen("am-primitivas", "t-am-primitivas", "Primitivas inmediatas y por sustitución (opción múltiple)", (r, d, mk) => {
  const mode = r.pick(byDifficulty(d, [["inmediata"], ["inmediata", "sust-ln"], ["sust-ln", "sust-pot"], ["sust-pot", "sust-exp"], ["sust-exp", "sust-lnpow"], ["sust-lnpow", "sust-exk"]] as const));
  const C = " + C";
  const HS: [string, string, string] = ["¿Hay una función cuya derivada aparece multiplicando? Esa es la pista de la sustitución.", "", "Al final volvé a la variable x y sumá la constante C. Podés verificar derivando."];
  let integrand = "", ok = "", F = "", f = "", range: [number, number] = [0.5, 3];
  let wrong: Opt[] = [];
  let sol: string[] = [];
  if (mode === "inmediata") {
    const a = r.nz(-4, 6), n = r.int(1, 4), b = r.nz(-5, 5), c = r.nz(-5, 5);
    integrand = `${poly([a, ...Array(n).fill(0)])} ${termX(b, "e^x")} ${overX(c, "x")}`;
    ok = `${fracTerm(a, n + 1, `x^${n + 1}`)} ${termX(b, "e^x")} ${termX(c, "ln|x|")}`;
    f = `${a}*x^${n} + ${b}*exp(x) + ${c}/x`;
    F = `${a}*x^${n + 1}/${n + 1} + ${b}*exp(x) + ${c}*ln(abs(x))`;
    sol = [`∫ x^${n} dx = x^${n + 1}/${n + 1}; ∫ eˣ dx = eˣ; ∫ 1/x dx = ln|x|`, `${ok}${C}`];
    HS[1] = "Tabla: $∫x^n dx = \\frac{x^{n+1}}{n+1}$, $∫e^x dx = e^x$, $∫\\frac{1}{x} dx = ln|x|$.";
    wrong = [
      { text: `$${poly([a * n, ...Array(n - 1).fill(0)])} ${termX(b, "e^x")} ${overX(-c, "x^2")}${C}$`, error: { type: "derivacion", message: "Eso es la DERIVADA. Una primitiva es al revés: una función cuya derivada sea el integrando." } },
      { text: `$${coef(a)}x^${n + 1} ${termX(b, "e^x")} ${termX(c, "ln|x|")}${C}$`, error: { type: "formula", message: `∫xⁿ dx = xⁿ⁺¹/(n + 1): faltó dividir por ${n + 1}. Verificá derivando.` } },
      { text: `$${fracTerm(a, n + 1, `x^${n + 1}`)} ${termX(b, "e^x")} ${overX(c, "x^2")}${C}$`, error: { type: "formula", message: "∫ 1/x dx = ln|x|: la regla de la potencia no sirve para n = −1." } },
    ];
  } else if (mode === "sust-ln") {
    const a = r.int(-4, 4), b = r.int(1, 6), k = r.nz(-4, 5);
    const den = poly([1, a, b]);
    integrand = `\\frac{${poly([2 * k, k * a])}}{${den}}`;
    ok = `${coef(k)}ln|${den}|`;
    f = `(${2 * k}*x + ${k * a})/(x^2 + ${a}*x + ${b})`;
    F = `${k}*ln(abs(x^2 + ${a}*x + ${b}))`;
    range = [-3, 3];
    sol = [`u = ${den} ⇒ du = (${poly([2, a])}) dx`, `∫ ${fmt(k)} du/u = ${fmt(k)} ln|u|`, `= ${ok}${C}`];
    HS[1] = `Probá $u = ${den}$: $du = (${poly([2, a])})dx$, y el numerador es ${fmt(k)}·du.`;
    wrong = [
      { text: `$${coef(k)}ln|${den}|·(${poly([2, a])})${C}$`, error: { type: "conceptual", message: "El factor u′ ya se usó al cambiar dx por du: no vuelve a aparecer multiplicando." } },
      { text: `$\\frac{${fmt(-k)}}{${den}}${C}$`, error: { type: "formula", message: "∫ du/u = ln|u|, no −1/u (esa sería la primitiva de 1/u²)." } },
      { text: `$${coef(k)}ln|${poly([2, a])}|${C}$`, error: { type: "conceptual", message: "El logaritmo va del DENOMINADOR (u), no de su derivada." } },
    ];
  } else if (mode === "sust-pot") {
    const c = r.nz(-5, 5), n = r.int(2, 5), m = r.pick([1, 2, 3, 4]);
    integrand = `${coef(m)}x(${poly([1, 0, c])})^${n}`;
    ok = `${fracTerm(m, 2 * (n + 1), `(${poly([1, 0, c])})^${n + 1}`)}`;
    f = `${m}*x*(x^2 + ${c})^${n}`;
    F = `${m}*(x^2 + ${c})^${n + 1}/${2 * (n + 1)}`;
    range = [-2, 2];
    sol = [`u = x² ${sgn(c)} ⇒ du = 2x dx ⇒ x dx = du/2`, `∫ ${fmt(m)}·u^${n}·du/2 = ${fmt(m)}·u^${n + 1}/${2 * (n + 1)}`, `= ${ok}${C}`];
    HS[1] = `$u = x^2 ${sgn(c)}$, $du = 2x dx$: el x que sobra es casi du (falta un 2).`;
    wrong = [
      { text: `$${fracTerm(m, n + 1, `(${poly([1, 0, c])})^${n + 1}`)}${C}$`, error: { type: "calculo", message: "x dx = du/2: faltó el 1/2. Derivá tu respuesta y vas a obtener el doble del integrando." } },
      { text: `$${fracTerm(m, 2 * (n + 1), `x^2(${poly([1, 0, c])})^${n + 1}`)}${C}$`, error: { type: "conceptual", message: "La x ya se usó en du = 2x dx: no queda una x afuera." } },
      { text: `$${coef(m * n * 2)}x^2(${poly([1, 0, c])})^${n - 1}${C}$`, error: { type: "derivacion", message: "Eso se parece a derivar; para integrar el exponente SUBE y se divide por el nuevo exponente." } },
    ];
  } else if (mode === "sust-exp") {
    const k = r.nz(-3, 3), m = r.pick([1, 2, 4, 6]);
    integrand = `${coef(m)}x e^{${coef(k)}x^2}`;
    ok = fracTerm(m, 2 * k, `e^{${coef(k)}x^2}`);
    f = `${m}*x*exp(${k}*x^2)`;
    F = `${m}*exp(${k}*x^2)/${2 * k}`;
    range = [-1.5, 1.5];
    sol = [`u = ${coef(k)}x² ⇒ du = ${2 * k}x dx`, `∫ ${fmt(m)} eᵘ du/${2 * k} = ${fr(m, 2 * k)} eᵘ`, `= ${ok}${C}`];
    HS[1] = `$u = ${coef(k)}x^2$, $du = ${2 * k}x dx$.`;
    wrong = [
      { text: `$${fracTerm(m, k, `e^{${coef(k)}x^2}`)}${C}$`, error: { type: "calculo", message: `du = ${2 * k}x dx: hay que dividir por ${2 * k}, no por ${k}.` } },
      { text: `$${fracTerm(m, 2, `x^2e^{${coef(k)}x^2}`)}${C}$`, error: { type: "conceptual", message: "No se integra «por partes separadas»: la x es la que forma du." } },
      { text: `$${coef(2 * k * m)}x e^{${coef(k)}x^2}·x${C}$`, error: { type: "derivacion", message: "Eso es multiplicar por la derivada de adentro: al integrar se DIVIDE." } },
    ];
  } else if (mode === "sust-lnpow") {
    const n = r.int(1, 3), p = r.int(2, 5), q = r.int(1, 5);
    const lin = poly([p, q]);
    integrand = `\\frac{ln^${n}(${lin})}{${lin}}`;
    ok = fracTerm(1, p * (n + 1), `ln^${n + 1}(${lin})`);
    f = `ln(${p}*x + ${q})^${n}/(${p}*x + ${q})`;
    F = `ln(${p}*x + ${q})^${n + 1}/${p * (n + 1)}`;
    sol = [`u = ln(${lin}) ⇒ du = ${p}/(${lin}) dx`, `∫ u^${n} du/${p} = u^${n + 1}/${p * (n + 1)}`, `= ${ok}${C}`];
    HS[1] = `$u = ln(${lin})$, $du = \\frac{${p}}{${lin}}dx$.`;
    wrong = [
      { text: `$${fracTerm(1, n + 1, `ln^${n + 1}(${lin})`)}${C}$`, error: { type: "calculo", message: `du = ${p}/(${lin}) dx: faltó dividir por ${p} (la derivada de adentro).` } },
      { text: `$${fracTerm(p, n + 1, `ln^${n + 1}(${lin})`)}${C}$`, error: { type: "calculo", message: `El ${p} divide, no multiplica: (1/${p})·du = dx/(${lin}).` } },
      { text: `$${fracTerm(1, n + 1, `\\frac{ln^${n + 1}(${lin})}{${lin}}`)}${C}$`, error: { type: "conceptual", message: `El 1/(${lin}) ya forma parte de du: no queda dividiendo.` } },
    ];
    void p;
  } else {
    const m = r.pick([1, 2]), k = r.nz(-5, 6);
    const den = `e^x − ${m === 1 ? "" : m}x`;
    integrand = `\\frac{${coef(k)}e^x ${sgn(-k * m)}}{${den}}`;
    ok = `${coef(k)}ln|${den}|`;
    f = `(${k}*exp(x) - ${k * m})/(exp(x) - ${m}*x)`;
    F = `${k}*ln(abs(exp(x) - ${m}*x))`;
    range = [-2, 2];
    sol = [`u = ${den} ⇒ du = (eˣ − ${m}) dx`, `Numerador = ${fmt(k)}(eˣ − ${m}) = ${fmt(k)}·u′`, `∫ ${fmt(k)} du/u = ${ok}${C}`];
    HS[1] = `Sacá factor común en el numerador: $${fmt(k)}(e^x − ${m})$. ¿De qué es derivada?`;
    wrong = [
      { text: `$${coef(k)}ln|e^x − ${m}|${C}$`, error: { type: "conceptual", message: "El logaritmo es del denominador (u). El numerador es su derivada." } },
      { text: `$\\frac{${fmt(k)}}{2}(${den})^2${C}$`, error: { type: "formula", message: "∫ u′/u = ln|u|, no u²/2 (esa es la primitiva de u·u′)." } },
      { text: `$\\frac{${fmt(-k)}}{${den}}${C}$`, error: { type: "formula", message: "∫ du/u = ln|u|; −1/u es la primitiva de 1/u²." } },
    ];
  }
  AM_CHECK.prim = { f, F, range };
  return choice(
    r,
    mk({
      prompt: `¿Cuál es una primitiva de $${integrand}$? (es decir, $∫ ${integrand.startsWith("\\frac") ? integrand : `(${integrand})`} dx$)`,
      hints: [HS[0], HS[1] || "Revisá la tabla de integrales inmediatas.", HS[2]],
      solution: sol,
      explanation: "Una primitiva F cumple F′ = f. Cualquier opción se puede verificar derivándola: tiene que dar exactamente el integrando.",
    }),
    uniq([{ text: `$${ok}${C}$`, correct: true }, ...wrong]),
  );
});

type Opt = { text: string; correct?: boolean; error?: { type: FrequentError["type"]; message: string } };

// ───────────────────────── 17. Primitivas: partes y fracciones simples ─────────────────────────

export const primitivasPartes = gen("am-primitivas-partes", "t-am-partes-fracciones", "Integración por partes y por fracciones simples (opción múltiple)", (r, d, mk) => {
  const mode = r.pick(byDifficulty(d, [["ln"], ["exp", "ln"], ["exp", "frac"], ["frac", "xln"], ["xln", "exp", "frac"], ["frac", "xln"]] as const));
  const C = " + C";
  let integrand = "", ok = "", f = "", F = "", range: [number, number] = [0.5, 3];
  let wrong: Opt[] = [];
  let sol: string[] = [];
  let hints: [string, string, string];
  if (mode === "ln") {
    const a = r.nz(-4, 5);
    integrand = `${coef(a)}ln x`;
    ok = `${coef(a)}(x ln x − x)`;
    f = `${a}*ln(x)`;
    F = `${a}*(x*ln(x) - x)`;
    hints = ["Truco: ln x = 1·ln x. Partes con u = ln x, dv = dx.", "du = dx/x, v = x.", "∫u dv = uv − ∫v du = x ln x − ∫ x·(1/x) dx."];
    sol = ["u = ln x, dv = dx ⇒ du = dx/x, v = x", "∫ ln x dx = x ln x − ∫ 1 dx = x ln x − x", `${ok}${C}`];
    wrong = [
      { text: `$\\frac{${fmt(a)}}{x}${C}$`, error: { type: "derivacion", message: "1/x es la DERIVADA de ln x, no una primitiva." } },
      { text: `$${coef(a)}(x ln x + x)${C}$`, error: { type: "signos", message: "Partes: uv − ∫v du. El segundo término resta." } },
      { text: `$${coef(a)}x ln x${C}$`, error: { type: "calculo", message: "Faltó el − ∫ v du = − x. Derivá x ln x: da ln x + 1, sobra el 1." } },
    ];
  } else if (mode === "exp") {
    const k = r.pick([1, -1, 2, -2, 3, -3]);
    const E = `e^{${coef(k)}x}`;
    integrand = `x${E}`;
    ok = `${fracTerm(1, k, `x${E}`)} ${fracTerm(-1, k * k, E, true)}`;
    f = `x*exp(${k}*x)`;
    F = `x*exp(${k}*x)/${k} - exp(${k}*x)/${k * k}`;
    range = [-1.5, 1.5];
    hints = ["Partes: ∫u dv = uv − ∫v du. Elegí u = x (se simplifica al derivar).", `u = x, dv = ${E}dx ⇒ du = dx, v = ${fr(1, k)}·${E}.`, `Queda $${fracTerm(1, k, `x${E}`)} − ∫ ${fracTerm(1, k, E)} dx$.`];
    sol = [`u = x, dv = ${E} dx ⇒ du = dx, v = (1/${par(k)})${E}`, `∫ = (x/${par(k)})${E} − ∫ (1/${par(k)})${E} dx`, `= ${ok}${C}`];
    wrong = [
      { text: `$${fracTerm(1, k, `x${E}`)} ${fracTerm(1, k * k, E, true)}${C}$`, error: { type: "signos", message: "uv − ∫v du: el segundo término va restando." } },
      { text: `$${fracTerm(1, k, `x${E}`)} ${fracTerm(-1, k, E, true)}${C}$`, error: { type: "calculo", message: `∫ (1/${par(k)})${E} dx = (1/${k * k})${E}: al integrar de nuevo se divide otra vez por ${fmt(k)}.` } },
      { text: `$${fracTerm(1, 2 * k, `x^2${E}`)}${C}$`, error: { type: "conceptual", message: "No se integra cada factor por separado: ∫ f·g ≠ ∫f · ∫g. Para productos se usa partes." } },
    ];
  } else if (mode === "xln") {
    const n = r.int(1, 3);
    integrand = `x^${n} ln x`;
    ok = `${fracTerm(1, n + 1, `x^${n + 1} ln x`)} ${fracTerm(-1, (n + 1) ** 2, `x^${n + 1}`, true)}`;
    f = `x^${n}*ln(x)`;
    F = `x^${n + 1}*ln(x)/${n + 1} - x^${n + 1}/${(n + 1) ** 2}`;
    hints = ["LIATE: el logaritmo conviene derivarlo. u = ln x, dv = xⁿ dx.", `du = dx/x, v = x^${n + 1}/${n + 1}.`, `Queda $${fracTerm(1, n + 1, `x^${n + 1} ln x`)} − ∫ ${fracTerm(1, n + 1, `x^${n}`)} dx$.`];
    sol = [`u = ln x, dv = x^${n} dx ⇒ du = dx/x, v = x^${n + 1}/${n + 1}`, `∫ = (x^${n + 1}/${n + 1}) ln x − ∫ x^${n}/${n + 1} dx`, `= ${ok}${C}`];
    wrong = [
      { text: `$${fracTerm(1, n + 1, `x^${n + 1} ln x`)} ${fracTerm(1, (n + 1) ** 2, `x^${n + 1}`, true)}${C}$`, error: { type: "signos", message: "uv − ∫v du: va restando." } },
      { text: `$${fracTerm(1, n + 1, `x^${n + 1} ln x`)} ${fracTerm(-1, n + 1, `x^${n + 1}`, true)}${C}$`, error: { type: "calculo", message: `∫ x^${n}/${n + 1} dx = x^${n + 1}/${(n + 1) ** 2}: al integrar se divide de nuevo por ${n + 1}.` } },
      { text: `$${fracTerm(1, n + 1, `x^${n + 1}`)}(x ln x − x)${C}$`, error: { type: "conceptual", message: "No se integra cada factor por separado y se multiplica: eso no es partes." } },
    ];
  } else {
    let r1 = r.nz(-4, 4), r2 = r.nz(-4, 4);
    if (r2 === r1) r2 = r1 > 0 ? -r1 : r1 + 5;
    const A = r.nz(-4, 4);
    let B = r.nz(-4, 4);
    if (B === A) B = -A === A ? A + 1 : -A;
    const al = A + B, be = -(A * r2 + B * r1);
    const den = poly([1, -(r1 + r2), r1 * r2]);
    const L = (k: number, root: number) => `${coef(k)}ln|${poly([1, -root])}|`;
    const sum = (k1: number, x1: number, k2: number, x2: number) => `${L(k1, x1)} ${k2 < 0 ? "−" : "+"} ${L(Math.abs(k2), x2)}`;
    integrand = `\\frac{${poly([al, be])}}{${den}}`;
    ok = sum(A, r1, B, r2);
    f = `(${al}*x + ${be})/((x - ${r1})*(x - ${r2}))`;
    F = `${A}*ln(abs(x - ${r1})) + ${B}*ln(abs(x - ${r2}))`;
    range = [-6, 6];
    hints = [`Factorizá el denominador: $(${poly([1, -r1])})(${poly([1, -r2])})$.`, `Buscá A y B con $\\frac{${poly([al, be])}}{(${poly([1, -r1])})(${poly([1, -r2])})} = \\frac{A}{${poly([1, -r1])}} + \\frac{B}{${poly([1, -r2])}}$.`, `Truco: x = ${fmt(r1)} da A; x = ${fmt(r2)} da B. Después, ∫ A/(x − r) dx = A ln|x − r|.`];
    sol = [`${den} = (${poly([1, -r1])})(${poly([1, -r2])})`, `${poly([al, be])} = A(${poly([1, -r2])}) + B(${poly([1, -r1])})`, `x = ${fmt(r1)}: ${fmt(al * r1 + be)} = A·${par(r1 - r2)} ⇒ A = ${fmt(A)}; x = ${fmt(r2)}: B = ${fmt(B)}`, `∫ = ${ok}${C}`];
    wrong = [
      { text: `$${sum(B, r1, A, r2)}${C}$`, error: { type: "factorizacion", message: `Intercambiaste A y B. Para A reemplazá x = ${fmt(r1)} (anula el otro factor).` } },
      { text: `$${sum(A, -r1, B, -r2)}${C}$`, error: { type: "signos", message: `Las raíces del denominador son ${fmt(r1)} y ${fmt(r2)}: los factores son (x ${sgn(-r1)}) y (x ${sgn(-r2)}).` } },
      { text: `$${coef(al) || "1"}ln|${den}|${C}$`.replace("$1ln", "$ln"), error: { type: "formula", message: "El numerador no es la derivada del denominador: no es un ln directo. Hay que descomponer en fracciones simples." } },
    ];
  }
  AM_CHECK.prim = { f, F, range };
  return choice(
    r,
    mk({
      prompt: `¿Cuál es una primitiva de $${integrand}$?`,
      hints,
      solution: sol,
      explanation: mode === "frac" ? "Fracciones simples: si el denominador tiene dos raíces distintas, el cociente se escribe A/(x − r₁) + B/(x − r₂) y cada término integra a un logaritmo." : "Partes: ∫u dv = uv − ∫v du. Conviene derivar lo que se simplifica (logaritmos, polinomios) e integrar lo que no se complica (exponenciales, potencias).",
    }),
    uniq([{ text: `$${ok}${C}$`, correct: true }, ...wrong]),
  );
});

// ───────────────────────── 18. Teorema fundamental del cálculo ─────────────────────────

const SQ: [number, number][] = [[1, 1], [2, 4], [3, 9], [4, 16]];

export const tfc = gen("am-tfc", "t-am-tfc", "Teorema fundamental: derivar ∫ con límites variables y límites con integrales", (r, d, mk) => {
  const mode = r.pick(byDifficulty(d, [["simple"], ["comp"], ["comp", "inferior"], ["inferior", "lim"], ["lim", "tan"], ["tan", "lim"]] as const));
  const TH = "TFC: si $F(x) = ∫_a^{u(x)} g(t) dt$ con g continua, entonces $F′(x) = g(u(x))·u′(x)$.";
  if (mode === "simple") {
    const k = r.int(-4, 4), x0 = r.nz(-2, 3);
    const v = x0 ** 3 + k * x0;
    return num(
      mk({
        prompt: `Sea $F(x) = ∫_0^x (t^3 ${k ? termX(k, "t") : ""}) dt$. Calculá $F′(${fmt(x0)})$.`,
        hints: ["No hace falta integrar.", TH, `Con u(x) = x, $F′(x) = x^3 ${k ? termX(k) : ""}$.`],
        solution: [`F′(x) = x³ ${k ? termX(k) : ""}`, `F′(${fmt(x0)}) = ${fmt(v)}`],
        explanation: "Derivar una integral con límite superior x devuelve el integrando evaluado en x.",
        frequentErrors: [fe(x0 ** 4 / 4 + (k * x0 * x0) / 2, "conceptual", "Ese es F(x₀), la integral. Te piden la derivada, que por el TFC es el integrando en x₀.")],
      }),
      v,
    );
  }
  const [sq, s2] = r.pick(SQ);
  const x0 = r.pick([1, 2, -1]), p = r.int(-3, 3);
  const u0 = x0 * x0 + p * x0, du = 2 * x0 + p;
  const c = s2 - u0;
  const g = `√(t ${c ? sgn(c) : ""})`;
  const up = poly([1, p, 0]);
  if (mode === "comp" || mode === "inferior") {
    const lower = mode === "inferior";
    const v = (lower ? -1 : 1) * sq * du;
    return num(
      mk({
        prompt: lower ? `Sea $F(x) = ∫_{${up}}^{${fmt(u0 + 7)}} ${g} dt$. Calculá $F′(${fmt(x0)})$.` : `Sea $F(x) = ∫_{${fmt(-c)}}^{${up}} ${g} dt$. Calculá $F′(${fmt(x0)})$.`,
        hints: [lower ? "La variable está en el límite INFERIOR: invertí los límites y aparece un signo menos." : "La variable está en el límite superior y es una función de x: regla de la cadena.", TH, `$u(${fmt(x0)}) = ${fmt(u0)}$ y $u′(${fmt(x0)}) = ${fmt(du)}$.`],
        solution: [lower ? `F(x) = −∫_{${fmt(u0 + 7)}}^{${up}} ${g} dt` : `u(x) = ${up}, u′(x) = ${poly([2, p])}`, `F′(x) = ${lower ? "−" : ""}√(u(x) ${c ? sgn(c) : ""})·(${poly([2, p])})`, `F′(${fmt(x0)}) = ${lower ? "−" : ""}√(${fmt(s2)})·${par(du)} = ${fmt(v)}`],
        explanation: "TFC + regla de la cadena: (∫_a^{u(x)} g)′ = g(u(x))·u′(x). Si la x está abajo, cambia el signo.",
        frequentErrors: [
          fe((lower ? -1 : 1) * sq, "derivacion", "Faltó multiplicar por u′(x): el límite es una función de x (regla de la cadena)."),
          ...(lower ? [fe(sq * du, "signos", "Con la variable en el límite inferior, F′ = −g(u(x))·u′(x).")] : []),
          ...(x0 + c >= 0 ? [fe((lower ? -1 : 1) * Math.sqrt(x0 + c) * du, "conceptual", `El integrando se evalúa en u(x₀) = ${fmt(u0)}, no en x₀ = ${fmt(x0)}.`)] : []),
        ],
      }),
      v,
    );
  }
  if (mode === "tan") {
    const m = sq * du;
    const ans = `${m}*(x - ${x0})`;
    return expr(
      mk({
        prompt: `Sea $F(x) = ∫_{${fmt(u0)}}^{${up}} ${g} dt$. Hallá la recta tangente al gráfico de F en $x = ${fmt(x0)}$. Escribí solo la expresión de la recta.`,
        hints: [`En x = ${fmt(x0)} los dos límites coinciden: $F(${fmt(x0)}) = 0$.`, TH, `$F′(${fmt(x0)}) = √(${fmt(s2)})·${par(du)}$.`],
        solution: [`F(${fmt(x0)}) = ∫_{${fmt(u0)}}^{${fmt(u0)}} … = 0`, `F′(${fmt(x0)}) = √(${fmt(u0)} ${sgn(c)})·(${fmt(du)}) = ${fmt(m)}`, `y = ${fmt(m)}(x ${sgn(-x0)})`],
        explanation: "Una integral entre dos límites iguales vale 0; la pendiente sale del TFC con regla de la cadena.",
        frequentErrors: exprErrors(ans, [fe(`${m}*x`, "formula", `La recta pasa por (${fmt(x0)}; 0), no por el origen: y = m(x − x₀).`), fe(`${sq}*(x - ${x0})`, "derivacion", "Faltó el factor u′(x₀) de la regla de la cadena.")]),
      }),
      ans,
    );
  }
  // lim
  const k = r.nz(-4, 5);
  const useExp = r.bool();
  const v = useExp ? k / 3 : k / 2;
  return num(
    mk({
      prompt: useExp ? `Calculá $lim_{x→0} \\frac{∫_0^x (e^{${coef(k)}t^2} − 1) dt}{x^3}$` : `Calculá $lim_{x→0} \\frac{∫_0^x sen(${coef(k)}t) dt}{x^2}$`,
      hints: ["Arriba y abajo tienden a 0: es 0/0, usá L'Hôpital.", "La derivada de ∫₀ˣ g(t) dt es g(x) (TFC).", useExp ? `Queda $\\frac{e^{${coef(k)}x^2} − 1}{3x^2}$, otra vez 0/0.` : `Queda $\\frac{sen(${coef(k)}x)}{2x}$.`],
      solution: useExp ? ["0/0 → L'H + TFC", `(e^{${coef(k)}x²} − 1)/(3x²) → 0/0`, `L'H: ${2 * k}x e^{${coef(k)}x²}/(6x) → ${fr(2 * k, 6)}`] : ["0/0 → L'H + TFC", `sen(${coef(k)}x)/(2x)`, `→ ${fmt(k)}/2 = ${fr(k, 2)}`],
      explanation: "L'Hôpital con una integral: el TFC da la derivada del numerador sin calcular la integral.",
      frequentErrors: [fe(k, "derivacion", useExp ? "La derivada de x³ es 3x²: queda dividido por 3." : "La derivada de x² es 2x: queda dividido por 2."), fe(0, "limites", "0/0 no es 0.")],
    }),
    v,
  );
});

// ───────────────────────── 19. Integral definida ─────────────────────────

export const integralDefinida = gen("am-integral-definida", "t-am-integral-area", "Integral definida (Barrow), sustitución, partes y funciones impares", (r, d, mk) => {
  const mode = r.pick(byDifficulty(d, [["poly"], ["poly", "raiz"], ["raiz", "exp"], ["lnx", "exp"], ["impar", "lnx"], ["partes", "impar"]] as const));
  const BH = "Barrow: $∫_a^b f(x) dx = F(b) − F(a)$, con F primitiva de f.";
  if (mode === "poly") {
    const c = r.nz(-3, 3), e = r.int(-4, 4), a = r.int(-2, 1), b = a + r.int(1, 3);
    const F = (x: number) => c * x ** 3 + (e * x * x) / 2;
    const f = poly([3 * c, e, 0]);
    return num(
      mk({
        prompt: `Calculá $∫_{${fmt(a)}}^{${fmt(b)}} (${f}) dx$`,
        hints: [BH, `Una primitiva: $F(x) = ${poly([c, e / 2, 0, 0])}$.`, `F(${fmt(b)}) − F(${fmt(a)}).`],
        solution: [`F(x) = ${poly([c, e / 2, 0, 0])}`, `F(${fmt(b)}) = ${fmt(F(b))}; F(${fmt(a)}) = ${fmt(F(a))}`, `∫ = ${fmt(F(b) - F(a))}`],
        explanation: "La integral definida es un número: la diferencia de una primitiva entre los extremos. La C se cancela.",
        frequentErrors: [fe(F(b), "calculo", `Faltó restar F(${fmt(a)}).`), fe(F(a) - F(b), "signos", "Es F(b) − F(a): superior menos inferior.")],
      }),
      F(b) - F(a),
    );
  }
  if (mode === "raiz") {
    const k = r.nz(-5, 6), pp = r.int(1, 3), qq = pp + r.int(1, 3);
    return num(
      mk({
        prompt: `Calculá $∫_{${pp * pp}}^{${qq * qq}} \\frac{${fmt(k)}}{√x} dx$`,
        hints: [BH, "$\\frac{1}{√x} = x^{−1/2}$: su primitiva es $\\frac{x^{1/2}}{1/2} = 2√x$.", `$${fmt(2 * k)}(√${qq * qq} − √${pp * pp})$.`],
        solution: [`F(x) = ${fmt(2 * k)}√x`, `F(${qq * qq}) − F(${pp * pp}) = ${fmt(2 * k)}(${qq} − ${pp}) = ${fmt(2 * k * (qq - pp))}`],
        explanation: "∫ x^{−1/2} dx = 2x^{1/2}: el exponente sube a 1/2 y se divide por 1/2.",
        frequentErrors: [fe(k * (qq - pp), "formula", "∫ x^{−1/2} dx = 2√x: dividir por 1/2 es multiplicar por 2."), fe(2 * k * (qq * qq - pp * pp), "calculo", "Faltó la raíz al evaluar: 2√x en los extremos.")],
      }),
      2 * k * (qq - pp),
    );
  }
  if (mode === "exp") {
    const k = r.nz(-4, 6), m = r.pick([1, 2, -1]), L = r.int(1, 2);
    const v = (k / m) * (Math.exp(m * L) - 1);
    return num(
      mk({
        prompt: `Calculá $∫_0^{${L}} ${fmt(k)}e^{${coef(m)}x} dx$ (2 decimales)`,
        hints: [BH, `Una primitiva de $e^{${coef(m)}x}$ es $\\frac{e^{${coef(m)}x}}{${fmt(m)}}$.`, "No te olvides de restar F(0): e⁰ = 1."],
        solution: [`F(x) = ${fr(k, m)}·e^{${coef(m)}x}`, `F(${L}) − F(0) = ${fr(k, m)}(e^{${m * L}} − 1) ≈ ${fmt(v, 2)}`],
        explanation: "La primitiva de e^{mx} es e^{mx}/m, y F(0) no es 0: vale 1/m.",
        frequentErrors: [fe(k * (Math.exp(m * L) - 1), "calculo", `Faltó dividir por ${fmt(m)}.`), fe((k / m) * Math.exp(m * L), "calculo", "Faltó restar F(0) = k/m·e⁰, que no es 0.")],
      }),
      v,
      0.011,
    );
  }
  if (mode === "lnx") {
    const n = r.int(1, 4), k = r.nz(-3, 4);
    return num(
      mk({
        prompt: `Calculá $∫_1^{e^${n}} \\frac{${fmt(k)} ln x}{x} dx$`,
        hints: ["Sustitución: u = ln x, du = dx/x.", "Los límites cambian: x = 1 → u = 0; x = eⁿ → u = n.", `Queda $∫_0^${n} ${fmt(k)}u du$.`],
        solution: [`u = ln x: ∫_0^${n} ${fmt(k)}u du`, `= ${fmt(k)}·u²/2 |₀^${n} = ${fmt(k)}·${n * n}/2 = ${fr(k * n * n, 2)}`],
        explanation: "En una sustitución dentro de una integral definida, conviene cambiar también los límites.",
        frequentErrors: [fe(k * n * n, "formula", "∫ u du = u²/2: faltó el 1/2."), fe((k * (Math.exp(2 * n) - 1)) / 2, "conceptual", `Si cambiás a u, los límites también cambian: u va de 0 a ${n}, no de 1 a e^${n}.`)],
      }),
      (k * n * n) / 2,
    );
  }
  if (mode === "impar") {
    const L = r.int(1, 5), A = r.nz(-9, 9), c = r.int(0, 4);
    const whole = r.bool() && c > 0;
    return num(
      mk({
        prompt: whole
          ? `f es impar y $∫_0^${L} f(x) dx = ${fmt(A)}$. Calculá $∫_{−${L}}^{${L}} (f(x) + ${c}) dx$.`
          : `f es impar y $∫_0^${L} f(x) dx = ${fmt(A)}$. Calculá $∫_{−${L}}^0 f(x) dx$.`,
        hints: ["Impar: f(−x) = −f(x). El gráfico es simétrico respecto del origen.", "Del lado negativo el área queda con el signo contrario.", whole ? `∫_{−L}^{L} f = 0; y ∫_{−${L}}^{${L}} ${c} dx = ${c}·${2 * L}.` : `$∫_{−${L}}^0 f = −∫_0^${L} f$.`],
        solution: whole ? [`∫_{−${L}}^{${L}} f = −${par(A)} + ${par(A)} = 0`, `∫_{−${L}}^{${L}} ${c} dx = ${2 * L * c}`, `Total: ${2 * L * c}`] : [`Por imparidad: ∫_{−${L}}^0 f = −∫_0^${L} f = ${fmt(-A)}`],
        explanation: "Para f impar, ∫_{−L}^0 f = −∫_0^L f, y por lo tanto ∫_{−L}^{L} f = 0.",
        frequentErrors: whole ? [fe(2 * A + 2 * L * c, "conceptual", "Para f impar, las dos mitades se cancelan: ∫_{−L}^{L} f = 0, no 2A."), fe(c * L, "calculo", `∫_{−${L}}^{${L}} ${c} dx = ${c}·(${L} − (−${L})) = ${2 * L * c}.`)] : [fe(A, "conceptual", "Eso valdría si f fuera PAR. Impar invierte el signo."), fe(0, "conceptual", "La que da 0 es la integral de −L a L, no la de una mitad.")],
      }),
      whole ? 2 * L * c : -A,
    );
  }
  // partes: ∫_1^e x^n ln x dx = (n e^{n+1} + 1)/(n + 1)^2
  const n = r.int(1, 2);
  const v = (n * Math.exp(n + 1) + 1) / (n + 1) ** 2;
  return num(
    mk({
      prompt: `Calculá $∫_1^e x^${n} ln x dx$ (2 decimales)`,
      hints: ["Partes: u = ln x, dv = xⁿ dx.", `Primitiva: $\\frac{x^${n + 1} ln x}{${n + 1}} − \\frac{x^${n + 1}}{${(n + 1) ** 2}}$.`, "En x = 1, ln 1 = 0; en x = e, ln e = 1."],
      solution: [`F(x) = x^${n + 1} ln x/${n + 1} − x^${n + 1}/${(n + 1) ** 2}`, `F(e) = e^${n + 1}/${n + 1} − e^${n + 1}/${(n + 1) ** 2}; F(1) = −1/${(n + 1) ** 2}`, `∫ = (${n}e^${n + 1} + 1)/${(n + 1) ** 2} ≈ ${fmt(v, 2)}`],
      explanation: "Partes en una integral definida: se halla la primitiva y se aplica Barrow.",
      frequentErrors: [fe(Math.exp(n + 1) / (n + 1) - Math.exp(n + 1) / (n + 1) ** 2, "calculo", "Faltó restar F(1) = −1/(n + 1)², que no es 0."), fe(Math.exp(n + 1) / (n + 1), "signos", "Faltó el segundo término de partes (− ∫ v du).")],
    }),
    v,
    0.011,
  );
});

// ───────────────────────── 20. Área con parámetro ─────────────────────────

export const areaParam = gen("am-area-param", "t-am-integral-area", "Hallar un parámetro a partir del valor de un área", (r, d, mk) => {
  const mode = r.pick(byDifficulty(d, [["raiz"], ["raiz"], ["parab", "raiz"], ["parab"], ["entre", "parab"], ["entre"]] as const));
  if (mode === "raiz") {
    const a = r.int(1, 6), pp = r.int(1, 3), qq = pp + r.int(1, 3);
    const S = 2 * a * (qq - pp);
    return num(
      mk({
        prompt: `Hallá $a > 0$ tal que el área entre el gráfico de $f(x) = \\frac{a}{√x}$, el eje x y las rectas $x = ${pp * pp}$, $x = ${qq * qq}$ sea ${S}.`,
        hints: ["Como f > 0, el área es la integral.", "$∫ \\frac{a}{√x} dx = 2a√x$.", `$2a(${qq} − ${pp}) = ${S}$.`],
        solution: [`Área = ∫_{${pp * pp}}^{${qq * qq}} a/√x dx = 2a(√${qq * qq} − √${pp * pp}) = ${2 * (qq - pp)}a`, `${2 * (qq - pp)}a = ${S} → a = ${a}`],
        explanation: "Se calcula el área dejando el parámetro como letra y se iguala al dato.",
        frequentErrors: [fe(S / (qq - pp), "formula", "∫ x^{−1/2} dx = 2√x: faltó el 2."), fe(S / (2 * (qq * qq - pp * pp)), "calculo", "Evaluá 2a√x: hay que sacar la raíz de los extremos.")],
      }),
      a,
    );
  }
  if (mode === "parab") {
    const c = r.int(1, 3), a = r.int(1, 6);
    const S = (a * c ** 3) / 6;
    return num(
      mk({
        prompt: `Hallá $a > 0$ tal que el área encerrada entre $f(x) = ax(${c} − x)$ y el eje x sea ${fr(a * c ** 3, 6)}.`,
        hints: [`f se anula en x = 0 y x = ${c}, y es positiva entre ellos.`, `Área = $∫_0^${c} (${c}ax − ax^2) dx$.`, `$= a(\\frac{${c}·${c * c}}{2} − \\frac{${c ** 3}}{3}) = \\frac{${c ** 3}a}{6}$.`],
        solution: [`Cortes con el eje: x = 0 y x = ${c}`, `Área = a·[${c}x²/2 − x³/3]₀^${c} = a·${fr(c ** 3, 6)}`, `a·${fr(c ** 3, 6)} = ${fr(a * c ** 3, 6)} → a = ${a}`],
        explanation: "Primero los cortes con el eje (los límites), después la integral con a como letra, y al final se despeja.",
        frequentErrors: [fe(S / c ** 3, "calculo", "La integral da a·c³/6, no a·c³: falta el 1/6 (1/2 − 1/3)."), fe((6 * S) / (c * c), "calculo", `Revisá la potencia: ∫_0^${c} queda ${c}³ = ${c ** 3}.`)],
      }),
      a,
    );
  }
  const k = r.int(1, 6);
  const S = k ** 3 / 6;
  return num(
    mk({
      prompt: `Hallá $k > 0$ tal que el área entre $y = x^2$ e $y = kx$ sea ${fr(k ** 3, 6)}.`,
      hints: ["Cortes: x² = kx ⇒ x = 0 o x = k.", "Entre 0 y k la recta está arriba.", "$∫_0^k (kx − x^2) dx = \\frac{k^3}{6}$."],
      solution: ["Cortes: x = 0 y x = k", "Área = ∫_0^k (kx − x²) dx = k³/2 − k³/3 = k³/6", `k³/6 = ${fr(k ** 3, 6)} → k³ = ${k ** 3} → k = ${k}`],
      explanation: "Con el parámetro en los límites y en el integrando: se calcula todo en función de k y se despeja.",
      frequentErrors: [fe(Math.cbrt(S), "calculo", "El área es k³/6: faltó multiplicar por 6 antes de sacar la raíz cúbica."), fe(k ** 3, "despeje", "Ese es k³; falta la raíz cúbica.")],
    }),
    k,
  );
});

// ───────────────────────── 21. Planteo de área entre curvas ─────────────────────────

export const areaPlanteo = gen("am-area-planteo", "t-am-integral-area", "Área entre curvas: cortes, quién está arriba y planteo", (r, d, mk) => {
  const mode = r.pick(byDifficulty(d, [["calc"], ["calc", "parab"], ["parab"], ["cubica", "parab"], ["cubica", "exp"], ["exp"]] as const));
  const I = (a: string | number, b: string | number, body: string) => `∫_{${typeof a === "number" ? fmt(a) : a}}^{${typeof b === "number" ? fmt(b) : b}} (${body}) dx`;
  const H: [string, string, string] = ["Primero los puntos de corte: igualá las dos funciones.", "En cada tramo entre cortes, probá un valor para ver qué curva está arriba.", "Área = ∫ (arriba − abajo), sumando los tramos."];
  if (mode === "calc" || mode === "parab") {
    const r1 = r.int(-3, 1), r2 = r1 + r.int(1, 4);
    const S1 = r1 + r2, P1 = r1 * r2;
    const ftxt = "x^2", gtxt = poly([S1, -P1]);
    AM_CHECK.area = { f: "x^2", g: `${S1}*x + ${-P1}`, pieces: [[r1, r2, "g"]] };
    if (mode === "calc") {
      const A = (r2 - r1) ** 3 / 6;
      return num(
        mk({
          prompt: `Calculá el área encerrada entre $y = x^2$ e $y = ${gtxt}$.`,
          hints: H,
          solution: [`x² = ${gtxt} ⇒ x² ${termX(-S1)} ${sgn(P1)} = 0 ⇒ x = ${fmt(r1)}, x = ${fmt(r2)}`, `En (${fmt(r1)}; ${fmt(r2)}) la recta está arriba`, `Área = ∫ (${gtxt} − x²) dx = ${fr((r2 - r1) ** 3, 6)}`],
          explanation: "Área entre curvas = integral de (la de arriba − la de abajo) entre los cortes.",
          frequentErrors: [fe((r2 ** 3 - r1 ** 3) / 3, "conceptual", "Esa es solo el área bajo la parábola. El área entre curvas es ∫ (arriba − abajo).")],
        }),
        A,
      );
    }
    return choice(
      r,
      mk({ prompt: `¿Qué integral da el área encerrada entre $y = ${ftxt}$ e $y = ${gtxt}$?`, hints: H, solution: [`Cortes: x = ${fmt(r1)} y x = ${fmt(r2)}`, `Con x = ${fmt((r1 + r2) / 2)}: la recta vale más que la parábola`, `Área = ${I(r1, r2, `${gtxt} − x^2`)}`], explanation: "El área siempre es positiva: (arriba − abajo) entre los cortes." }),
      uniq([
        { text: `$${I(r1, r2, `${gtxt} − x^2`)}$`, correct: true },
        { text: `$${I(r1, r2, `x^2 − (${gtxt})`)}$`, error: { type: "conceptual", message: "Así da negativo: entre los cortes la recta está ARRIBA. Probá un punto intermedio." } },
        { text: `$${r1 !== 0 && r2 !== 0 ? I(0, r2, `${gtxt} − x^2`) : I(r1 - 1, r2 + 1, `${gtxt} − x^2`)}$`, error: { type: "conceptual", message: `Los límites son los puntos de corte (${fmt(r1)} y ${fmt(r2)}): hay que igualar las funciones.` } },
        { text: `$${I(r1, r2, gtxt)}$`, error: { type: "conceptual", message: "Eso es el área bajo la recta hasta el eje x; falta restar la parábola." } },
      ]),
    );
  }
  if (mode === "cubica") {
    const k = r.int(1, 3);
    AM_CHECK.area = { f: "x^3", g: `${k * k}*x`, pieces: [[-k, 0, "f"], [0, k, "g"]] };
    const g = `${k * k === 1 ? "" : k * k}x`;
    return choice(
      r,
      mk({ prompt: `¿Qué expresión da el área encerrada entre $y = x^3$ e $y = ${g}$?`, hints: H, solution: [`x³ = ${g} ⇒ x(x² − ${k * k}) = 0 ⇒ x = −${k}, 0, ${k}`, `En (−${k}; 0) arriba está x³; en (0; ${k}) arriba está ${g}`, `Área = ${I(-k, 0, `x^3 − ${g}`)} + ${I(0, k, `${g} − x^3`)}`], explanation: "Si las curvas se cruzan, hay que partir en los cortes: en cada tramo cambia quién está arriba." }),
      uniq([
        { text: `$${I(-k, 0, `x^3 − ${g}`)} + ${I(0, k, `${g} − x^3`)}$`, correct: true },
        { text: `$${I(-k, k, `${g} − x^3`)}$`, error: { type: "conceptual", message: "Así los dos tramos se cancelan (da 0): las curvas se cruzan en x = 0 y cambia cuál está arriba." } },
        { text: `$${I(-k, 0, `${g} − x^3`)} + ${I(0, k, `x^3 − ${g}`)}$`, error: { type: "signos", message: `Probá x = −${k / 2}: x³ = ${fmt(-(k ** 3) / 8)} y ${g} = ${fmt(-(k ** 3) / 2)}. En (−${k}; 0) arriba está x³.` } },
        { text: `$${I(0, k, `${g} − x^3`)}$`, error: { type: "conceptual", message: `Falta el tramo entre −${k} y 0: también encierra área.` } },
      ]),
    );
  }
  const [cc, s1, t1] = r.pick([[2, 2, 1], [6, 3, 2], [12, 4, 3]] as const);
  const f = "xe^{x^2}", g = `xe^{x + ${cc}}`;
  AM_CHECK.area = { f: "x*exp(x^2)", g: `x*exp(x + ${cc})`, pieces: [[-t1, 0, "f"], [0, s1, "g"]] };
  return choice(
    r,
    mk({
      prompt: `¿Qué expresión da el área encerrada entre $y = ${f}$ e $y = ${g}$?`,
      hints: [`Igualá: $x(e^{x^2} − e^{x + ${cc}}) = 0$ ⇒ x = 0 o $x^2 = x + ${cc}$.`, `Cortes: x = −${t1}, 0, ${s1}. Para ver quién está arriba, mirá el signo de x y de $x^2 − (x + ${cc})$.`, "Si x < 0 y e^{x²} < e^{x+c}, al multiplicar por x se invierte la desigualdad."],
      solution: [`Cortes: x = −${t1}, x = 0, x = ${s1}`, `En (−${t1}; 0): x < 0 y x² < x + ${cc} ⇒ ${f} > ${g}`, `En (0; ${s1}): x > 0 ⇒ ${g} > ${f}`, `Área = ${I(-t1, 0, `${f} − ${g}`)} + ${I(0, s1, `${g} − ${f}`)}`],
      explanation: "Multiplicar una desigualdad por x negativo la invierte: por eso cambia quién está arriba en cada tramo.",
    }),
    uniq([
      { text: `$${I(-t1, 0, `${f} − ${g}`)} + ${I(0, s1, `${g} − ${f}`)}$`, correct: true },
      { text: `$${I(-t1, 0, `${g} − ${f}`)} + ${I(0, s1, `${f} − ${g}`)}$`, error: { type: "signos", message: "Están invertidas: para x < 0, como e^{x²} < e^{x+c}, multiplicar por x (negativo) da x·e^{x²} > x·e^{x+c}." } },
      { text: `$${I(-t1, s1, `${g} − ${f}`)}$`, error: { type: "conceptual", message: "Las curvas se cruzan en x = 0: en un tramo una está arriba y en el otro, la otra. Hay que partir." } },
      { text: `$${I(-s1, t1, `${g} − ${f}`)}$`, error: { type: "signos", message: `Revisá los cortes: x² − x − ${cc} = (x − ${s1})(x + ${t1}).` } },
    ]),
  );
});

// ───────────────────────── 22. EDO separable ─────────────────────────

export const edoSeparable = gen("am-edo-separable", "t-am-edo", "Ecuaciones diferenciales separables f′ = (αx + β)·f", (r, d, mk) => {
  const mode = r.pick(byDifficulty(d, [["formula"], ["formula"], ["formula", "valor"], ["valor"], ["valor", "param"], ["param"]] as const));
  const h = r.nz(-2, 2), be = r.int(-4, 4), C = r.pick([1, 2, 3, 5, -2]);
  const al = 2 * h;
  const qText = poly([h, be, 0]);
  const fpText = `f′(x) = (${poly([al, be])})·f(x)`;
  const H: [string, string, string] = ["Separá: $\\frac{f′}{f} = αx + β$.", "Integrá los dos lados: $ln|f| = \\frac{α}{2}x^2 + βx + K$.", "Despejá: $f = Ce^{…}$, y la condición inicial da C."];
  const sol = [`f′/f = ${poly([al, be])}`, `ln|f| = ${qText} + K`, `f(x) = C·e^{${qText}}`, `f(0) = C = ${fmt(C)}`];
  if (mode === "formula") {
    return choice(
      r,
      mk({ prompt: `Hallá f tal que $${fpText}$ y $f(0) = ${fmt(C)}$.`, hints: H, solution: [...sol, `f(x) = ${coef(C)}e^{${qText}}`], explanation: "En una EDO separable se pasa todo lo de f a un lado y todo lo de x al otro, y se integra." }),
      uniq([
        { text: `$f(x) = ${coef(C)}e^{${qText}}$`, correct: true },
        { text: C === 1 ? `$f(x) = e^{${qText}} + C$` : `$f(x) = e^{${qText}} ${sgn(C - 1)}$`, error: { type: "conceptual", message: "La constante no queda sumando: de ln|f| = q(x) + K sale f = e^K·e^{q(x)}, multiplicando." } },
        { text: `$f(x) = ${coef(C)}e^{${poly([al, be])}}$`, error: { type: "conceptual", message: "Hay que INTEGRAR αx + β, no copiarlo en el exponente." } },
        { text: `$f(x) = ${coef(C)}e^{${poly([al, be, 0])}}$`, error: { type: "formula", message: `∫ ${coef(al)}x dx = ${coef(h)}x²: al integrar se divide por 2.` } },
      ]),
    );
  }
  if (mode === "valor") {
    let x1 = r.pick([1, 2, -1]);
    if (Math.abs(h * x1 * x1 + be * x1) > 5) x1 = 1;
    const q1 = h * x1 * x1 + be * x1;
    const v = C * Math.exp(q1);
    return num(
      mk({
        prompt: `f cumple $${fpText}$ y $f(0) = ${fmt(C)}$. Calculá $f(${fmt(x1)})$ (podés escribir algo como 3e^(2) o un decimal con 2 cifras).`,
        hints: H,
        solution: [...sol, `f(${fmt(x1)}) = ${fmt(C)}e^{${fmt(q1)}} ≈ ${fmt(v, 3)}`],
        explanation: "La solución de f′ = g(x)·f es f = C·e^{G(x)}, con G primitiva de g.",
        frequentErrors: [fe(Math.exp(q1) + C - 1, "conceptual", "La constante multiplica a la exponencial; no se suma."), fe(C * Math.exp(al * x1 + be), "conceptual", "Hay que integrar αx + β antes de ponerlo en el exponente.")],
      }),
      v,
      Math.max(0.011, Math.abs(v) * 0.005),
    );
  }
  const K = r.nz(-4, 5);
  return num(
    mk({
      prompt: `f cumple $f′(x) = (2x + β)·f(x)$, $f(0) = ${fmt(C)}$ y $f(1) = ${fmt(C)}e^{${fmt(K)}}$. Hallá β.`,
      hints: H,
      solution: ["f(x) = C·e^{x² + βx}, con C = f(0) = " + fmt(C), `f(1) = ${fmt(C)}e^{1 + β} = ${fmt(C)}e^{${fmt(K)}}`, `1 + β = ${fmt(K)} → β = ${fmt(K - 1)}`],
      explanation: "Con la solución general escrita, la condición extra da una ecuación para el parámetro.",
      frequentErrors: [fe(K, "formula", "∫ 2x dx = x²: en x = 1 suma 1 al exponente."), fe(K - 2, "formula", "∫ 2x dx = x², no 2x².")],
    }),
    K - 1,
  );
});

// ───────────────────────── 23. Serie geométrica ─────────────────────────

export const serieGeometrica = gen("am-serie-geometrica", "t-am-series", "Serie geométrica: suma, convergencia y parámetro", (r, d, mk) => {
  const mode = r.pick(byDifficulty(d, [["suma0"], ["suma0", "suma1"], ["suma1", "converge"], ["mixta", "converge"], ["param", "mixta"], ["param"]] as const));
  const SH = "Geométrica: $Σ_{n=0}^{∞} r^n = \\frac{1}{1 − r}$ si $|r| < 1$ (si no, diverge).";
  const q = r.int(2, 6);
  let p = r.nz(-(q - 1), q - 1);
  if (Math.abs(p) >= q) p = 1;
  if (mode === "suma0" || mode === "suma1") {
    const c = r.nz(-5, 6);
    const start = mode === "suma0" ? 0 : 1;
    const v = (c * (start === 0 ? q : p)) / (q - p);
    return num(
      mk({
        prompt: `Calculá $Σ_{n=${start}}^{∞} ${c === 1 ? "" : fmt(c)}(\\frac{${fmt(p)}}{${q}})^n$`,
        hints: [SH, `La razón es r = ${fr(p, q)}, con |r| < 1: converge.`, start === 0 ? "El primer término (n = 0) es " + fmt(c) + "." : `Empieza en n = 1: el primer término es ${fmt(c)}·${fr(p, q)}. Suma = primer término/(1 − r).`],
        solution: [`r = ${fr(p, q)}, |r| < 1`, `Suma = (primer término)/(1 − r) = ${start === 0 ? fmt(c) : `${fmt(c)}·${fr(p, q)}`}/(1 − ${par(p)}/${q})`, `= ${fr(c * (start === 0 ? q : p), q - p)}`],
        explanation: "Una serie geométrica convergente suma (primer término)/(1 − razón). Mirá bien desde qué n empieza.",
        frequentErrors: [fe(start === 0 ? (c * p) / (q - p) : (c * q) / (q - p), "formula", start === 0 ? "Empezando en n = 0 el primer término es r⁰ = 1 (por c), no r." : "Empieza en n = 1: falta restar el término n = 0 (o usar r/(1 − r))."), fe((c * q) / (q + p), "signos", "Es 1 − r en el denominador.")],
      }),
      v,
    );
  }
  if (mode === "converge") {
    const c = r.int(-4, 4), k = r.int(2, 5);
    return choice(
      r,
      mk({
        prompt: `¿Para qué valores de x converge $Σ_{n=0}^{∞} \\frac{(${poly([1, -c])})^n}{${k}^n}$?`,
        hints: [SH, `La razón es $r = \\frac{${poly([1, -c])}}{${k}}$.`, `$|${poly([1, -c])}| < ${k}$.`],
        solution: [`r = (${poly([1, -c])})/${k}`, `|r| < 1 ⇔ |${poly([1, -c])}| < ${k} ⇔ ${fmt(c - k)} < x < ${fmt(c + k)}`, `En los extremos |r| = 1: diverge (el término no tiende a 0)`],
        explanation: "La geométrica converge solo si |r| < 1, con desigualdad estricta: en |r| = 1 el término general no tiende a 0.",
      }),
      uniq([
        { text: iv(fmt(c - k), fmt(c + k)), correct: true },
        { text: iv(fmt(c - k), fmt(c + k), "[", "]"), error: { type: "limites", message: "En |r| = 1 la geométrica diverge: el término general no tiende a 0. Los extremos no van." } },
        { text: iv(`−${k}`, `${k}`), error: { type: "signos", message: `El centro es x = ${fmt(c)}: |x ${sgn(-c)}| < ${k}.` } },
        { text: iv(fmt(c - 1 / k, 3), fmt(c + 1 / k, 3)), error: { type: "despeje", message: `|x ${sgn(-c)}|/${k} < 1 ⇒ |x ${sgn(-c)}| < ${k}: se multiplica por ${k}.` } },
      ]),
    );
  }
  if (mode === "mixta") {
    const a = r.int(2, 4), b = a + r.int(1, 3);
    return num(
      mk({
        prompt: `Calculá $Σ_{n=0}^{∞} \\frac{${a}^{n+1}}{${b}^n}$`,
        hints: [SH, `Escribí $\\frac{${a}^{n+1}}{${b}^n} = ${a}·(\\frac{${a}}{${b}})^n$.`, `Suma = ${a}/(1 − ${a}/${b}).`],
        solution: [`= ${a}·Σ (${a}/${b})^n`, `= ${a}/(1 − ${a}/${b}) = ${fr(a * b, b - a)}`],
        explanation: "Para reconocer la geométrica, separá las potencias que no dependen de n.",
        frequentErrors: [fe(b / (b - a), "calculo", `Falta el factor ${a}: ${a}^{n+1} = ${a}·${a}^n.`), fe((a * a) / (b - a), "formula", "El primer término (n = 0) es " + a + ", no " + (a * a) + "/" + b + ".")],
      }),
      (a * b) / (b - a),
    );
  }
  const bb = r.pick([2, 3, 5]);
  const a = r.int(2, 4);
  const Snum = bb * a * a, Sden = a * a - bb;
  return num(
    mk({
      prompt: `Hallá $a > 0$ tal que $Σ_{n=0}^{∞} \\frac{${bb}^{n+1}}{a^{2n}} = ${fr(Snum, Sden)}$`,
      hints: [SH, `Es ${bb}·Σ (${bb}/a²)^n = $\\frac{${bb}}{1 − ${bb}/a^2}$ (si a² > ${bb}).`, `Despejá: $\\frac{${bb}a^2}{a^2 − ${bb}} = ${fr(Snum, Sden)}$.`],
      solution: [`Σ = ${bb}/(1 − ${bb}/a²) = ${bb}a²/(a² − ${bb})`, `${bb}a²/(a² − ${bb}) = ${fr(Snum, Sden)} → a² = ${a * a}`, `a > 0 → a = ${a}`],
      explanation: "Con parámetro: se suma la geométrica en función de a, se iguala y se verifica que |r| < 1.",
      frequentErrors: [fe(a * a, "despeje", "Ese es a²: falta la raíz."), fe(Math.sqrt((Snum / Sden) / (Snum / Sden - 1)), "calculo", `Falta el factor ${bb} del primer término (${bb}^{n+1} = ${bb}·${bb}^n).`)],
    }),
    a,
  );
});

// ───────────────────────── 24. Series de potencias ─────────────────────────

export const seriePotencias = gen("am-serie-potencias", "t-am-series", "Series de potencias: criterio de la raíz y análisis de extremos", (r, d, mk) => {
  const mode = r.pick(byDifficulty(d, [["mas1"], ["mas1", "n"], ["n", "n2"], ["n", "n2"], ["inv", "n"], ["inv"]] as const));
  const RH = "Criterio de la raíz: $lim \\sqrt[n]{|a_n|}$ < 1 ⇒ converge; > 1 ⇒ diverge; = 1 no decide (hay que mirar los extremos aparte).";
  const RH2 = "Raíz n-ésima: $\\sqrt[n]{n} → 1$, $\\sqrt[n]{n^2} → 1$, $\\sqrt[n]{k^n + 1} → k$.";
  const k = r.int(2, 5), c = r.int(-3, 3);
  const L = fmt(c - k), R = fmt(c + k);
  if (mode === "mas1") {
    const kk = r.int(2, 4), m = r.int(2, 6);
    const rad = fr(m, kk);
    const end = fr(-m, kk);
    return choice(
      r,
      mk({
        prompt: `¿Para qué valores de x converge $Σ_{n=1}^{∞} \\frac{${kk}^n x^n}{${m}^n + 1}$?`,
        hints: [RH.replace("\\sqrt[n]", "ⁿ√").replace("\\sqrt[n]", "ⁿ√"), `$ⁿ√(\\frac{${kk}^n|x|^n}{${m}^n + 1}) → \\frac{${kk}|x|}{${m}}$.`, `Extremos: con $x = ±${rad}$ el término es $\\frac{(±1)^n ${m}^n}{${m}^n + 1}$, que no tiende a 0.`],
        solution: [`ⁿ√|aₙ| → ${kk}|x|/${m} < 1 ⇔ |x| < ${rad}`, `x = ±${rad}: |término| = ${m}ⁿ/(${m}ⁿ + 1) → 1 ≠ 0 ⇒ diverge`, `Converge en (${end}; ${rad})`],
        explanation: "El criterio de la raíz da el intervalo abierto; los extremos se estudian reemplazando x en la serie.",
      }),
      uniq([
        { text: iv(end, rad), correct: true },
        { text: iv(end, rad, "[", "]"), error: { type: "limites", message: `En x = ±${rad} el término general tiende a ±1 (no a 0): diverge. Siempre probá los extremos.` } },
        { text: iv(fr(-kk, m), fr(kk, m)), error: { type: "despeje", message: `${kk}|x|/${m} < 1 ⇒ |x| < ${m}/${kk}: quedó invertido.` } },
        { text: iv(end, rad, "(", "]"), error: { type: "limites", message: `En x = ${rad} el término tiende a 1, no a 0: diverge.` } },
      ]),
    );
  }
  const xc = poly([1, -c]);
  if (mode === "n" || mode === "n2") {
    const sq = mode === "n2";
    return choice(
      r,
      mk({
        prompt: `¿Para qué valores de x converge $Σ_{n=1}^{∞} \\frac{${c ? `(${xc})` : "x"}^n}{${sq ? "n^2" : "n"}·${k}^n}$?`,
        hints: [RH.replace("\\sqrt[n]", "ⁿ√").replace("\\sqrt[n]", "ⁿ√"), `$ⁿ√(\\frac{|${xc}|^n}{${sq ? "n^2" : "n"}·${k}^n}) → \\frac{|${xc}|}{${k}}$: el intervalo abierto es (${L}; ${R}).`, sq ? `En los extremos queda $Σ \\frac{(±1)^n}{n^2}$: converge (absolutamente).` : `En x = ${R} queda $Σ \\frac{1}{n}$ (diverge); en x = ${L}, $Σ \\frac{(−1)^n}{n}$ (Leibniz: converge).`],
        solution: [`|${xc}|/${k} < 1 ⇔ ${L} < x < ${R}`, sq ? "Extremos: Σ 1/n² y Σ (−1)ⁿ/n² convergen" : `x = ${R}: Σ 1/n diverge; x = ${L}: Σ (−1)ⁿ/n converge (Leibniz)`, sq ? `Converge en [${L}; ${R}]` : `Converge en [${L}; ${R})`],
        explanation: "En los extremos el criterio de la raíz da 1 y no decide: se reemplaza x y se usan series conocidas (armónica, p-series, Leibniz).",
      }),
      uniq([
        { text: sq ? iv(L, R, "[", "]") : iv(L, R, "[", ")"), correct: true },
        { text: iv(L, R), error: { type: "limites", message: "Faltó analizar los extremos: el criterio de la raíz no decide ahí, hay que reemplazar." } },
        { text: sq ? iv(L, R, "[", ")") : iv(L, R, "(", "]"), error: { type: "limites", message: sq ? `En x = ${R} queda Σ 1/n², que converge (p = 2 > 1).` : `Está al revés: en x = ${R} queda la armónica (diverge) y en x = ${L} la alternada (converge).` } },
        { text: sq ? iv(`−${k}`, `${k}`, "[", "]") : iv(`−${k}`, `${k}`, "[", ")"), error: { type: "signos", message: `El centro de la serie es x = ${fmt(c)}, no 0.` } },
      ]),
    );
  }
  // inv: Σ k^n/((n + 3)(x − c)^n)
  const ans = `$(−∞; ${L}] ∪ (${R}; +∞)$`;
  return choice(
    r,
    mk({
      prompt: `¿Para qué valores de x converge $Σ_{n=1}^{∞} \\frac{${k}^n}{(n + 3)${c ? `(${xc})` : "x"}^n}$?`,
      hints: [RH.replace("\\sqrt[n]", "ⁿ√").replace("\\sqrt[n]", "ⁿ√"), `$ⁿ√|a_n| → \\frac{${k}}{|${xc}|} < 1$ ⇔ $|${xc}| > ${k}$.`, `Extremos: $x − (${fmt(c)}) = ${k}$ da $Σ \\frac{1}{n + 3}$ (diverge); $= −${k}$ da $Σ \\frac{(−1)^n}{n + 3}$ (Leibniz: converge).`],
      solution: [`ⁿ√|aₙ| → ${k}/|${xc}| < 1 ⇔ |${xc}| > ${k} ⇔ x < ${L} o x > ${R}`, `x = ${R}: Σ 1/(n + 3) diverge; x = ${L}: Σ (−1)ⁿ/(n + 3) converge`, `Converge en (−∞; ${L}] ∪ (${R}; +∞)`],
      explanation: "Cuando x está en el denominador, la condición |…| < 1 se da vuelta: la región de convergencia queda AFUERA de un intervalo.",
    }),
    uniq([
      { text: ans, correct: true },
      { text: iv(L, R), error: { type: "despeje", message: `x está en el denominador: ${k}/|${xc}| < 1 ⇔ |${xc}| > ${k}. La región queda afuera del intervalo.` } },
      { text: `$(−∞; ${L}) ∪ (${R}; +∞)$`, error: { type: "limites", message: `Faltó el extremo x = ${L}: ahí queda Σ (−1)ⁿ/(n + 3), que converge por Leibniz.` } },
      { text: `$(−∞; ${L}) ∪ [${R}; +∞)$`, error: { type: "limites", message: `Al revés: en x = ${R} queda Σ 1/(n + 3) (diverge) y en x = ${L} la alternada (converge).` } },
    ]),
  );
});


export const AM_GENERATORS: Generator[] = [limRaices, limConjugado, limInfinito, limE, continuidadParam, asintotaOblicua, asintotas, derivadaReglas, tangente, tangenteDatos, derivabilidad, lhopital, estudioFuncion, extremosAbsolutos, taylor, primitivas, primitivasPartes, tfc, integralDefinida, areaParam, areaPlanteo, edoSeparable, serieGeometrica, seriePotencias];
