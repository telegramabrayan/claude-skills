/**
 * Generadores de Álgebra A (CBC): conjuntos, complejos y polinomios, vectores
 * en ℝ³, rectas y planos, matrices y sistemas, determinantes, transformaciones
 * lineales y cónicas. Todas las respuestas se calculan; nada se escribe a mano.
 */
import type { Difficulty, ExpressionExercise, FrequentError, Generator, MatchExercise, NumericExercise, OrderExercise } from "../types";
import { fmt, fracText, gcd } from "../math/parser";
import { rng, type Rng } from "./rng";
import { base, byDifficulty, choice, par, type Option } from "./helpers";

const S = "algebra-a";

// ───────────────────────── utilidades de formato ─────────────────────────

/** Vector como texto: (1, −2, 3). */
const vec = (v: number[]) => `(${v.map((x) => fmt(x)).join(", ")})`;
/** Vector de fracciones (numeradores con denominador común). */
const vecFrac = (nums: number[], den: number) => `(${nums.map((n) => fracText(n, den)).join(", ")})`;
/** Conjunto ordenado como texto: {1, 3, 5} o ∅. */
const setTxt = (s: number[]) => (s.length ? `{${[...s].sort((a, b) => a - b).join(", ")}}` : "∅");
/** Matriz con filas separadas por «;»: [ 1  2 ; 3  4 ]. */
const mat = (rows: (number | string)[][]) => `[ ${rows.map((r) => r.map((x) => (typeof x === "number" ? fmt(x) : x)).join(" ")).join(" ; ")} ]`;

/** Combinación lineal prolija: linTxt([2, −1, 0], ["x","y","z"]) = "2x − y". */
function linTxt(c: number[], vars: string[]): string {
  let out = "";
  c.forEach((k, i) => {
    if (k === 0) return;
    const abs = Math.abs(k);
    const body = `${abs === 1 ? "" : fmt(abs)}${vars[i]}`;
    if (!out) out = k < 0 ? `−${body}` : body;
    else out += k < 0 ? ` − ${body}` : ` + ${body}`;
  });
  return out || "0";
}
/** p + k·t como texto: "3 − 2t". */
const aff = (p: number, k: number) => (p === 0 ? linTxt([k], ["t"]) : `${fmt(p)}${k === 0 ? "" : `${k > 0 ? " + " : " − "}${Math.abs(k) === 1 ? "" : fmt(Math.abs(k))}t`}`);
/** Ecuación lineal: "2x − y + 3z = 4". */
const eqTxt = (c: number[], rhs: number, vars = ["x", "y", "z"]) => `${linTxt(c, vars)} = ${fmt(rhs)}`;

/** Número complejo a + bi como texto. */
function cx(a: number, b: number): string {
  const im = b === 0 ? "" : `${Math.abs(b) === 1 ? "" : fmt(Math.abs(b))}i`;
  if (b === 0) return fmt(a);
  if (a === 0) return b < 0 ? `−${im}` : im;
  return `${fmt(a)} ${b < 0 ? "−" : "+"} ${im}`;
}

/** Polinomio (coeficientes de mayor a menor grado) como texto. */
function polyTxt(c: number[], v = "x"): string {
  const n = c.length - 1;
  let out = "";
  c.forEach((k, i) => {
    if (k === 0) return;
    const p = n - i;
    const abs = Math.abs(k);
    const lit = p === 0 ? "" : p === 1 ? v : `${v}^${p}`;
    const body = `${abs === 1 && p > 0 ? "" : fmt(abs)}${lit}`;
    if (!out) out = k < 0 ? `−${body}` : body;
    else out += k < 0 ? ` − ${body}` : ` + ${body}`;
  });
  return out || "0";
}
/** Polinomio como expresión evaluable (ASCII). */
const polyExpr = (c: number[]) => {
  const n = c.length - 1;
  const terms = c.map((k, i) => (k === 0 ? "" : `(${k})*x^${n - i}`)).filter(Boolean);
  return terms.length ? terms.join(" + ") : "0";
};
const polyEval = (c: number[], x: number) => c.reduce((acc, k) => acc * x + k, 0);
/** Ruffini: divide c por (x − a). Devuelve [cociente, resto]. */
function ruffini(c: number[], a: number): [number[], number] {
  const q: number[] = [];
  let acc = 0;
  for (let i = 0; i < c.length; i++) {
    acc = acc * a + c[i];
    q.push(acc);
  }
  const rest = q.pop() as number;
  return [q, rest];
}
const polyMul = (p: number[], q: number[]) => {
  const out = Array(p.length + q.length - 1).fill(0);
  p.forEach((a, i) => q.forEach((b, j) => (out[i + j] += a * b)));
  return out;
};
/** Factor (x − r) como texto. */
const factor = (r: number) => (r === 0 ? "x" : r > 0 ? `(x − ${fmt(r)})` : `(x + ${fmt(-r)})`);
/** Divisor x − a como texto (sin paréntesis). */
const divisor = (a: number) => (a >= 0 ? `x − ${fmt(a)}` : `x + ${fmt(-a)}`);

const dot = (u: number[], v: number[]) => u.reduce((s, x, i) => s + x * v[i], 0);
const norm = (u: number[]) => Math.sqrt(dot(u, u));
const cross = (u: number[], v: number[]) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
const add = (u: number[], v: number[], k = 1) => u.map((x, i) => x + k * v[i]);
const isZero = (u: number[]): boolean => u.every((x) => x === 0);
const r2 = (x: number) => Math.round(x * 100) / 100;
const reduceVec = (u: number[]) => {
  const g = u.reduce((acc, x) => gcd(acc, x), 0) || 1;
  const w = u.map((x) => x / g);
  const first = w.find((x) => x !== 0) ?? 1;
  return first < 0 ? w.map((x) => -x || 0) : w;
};
const det2 = (m: number[][]) => m[0][0] * m[1][1] - m[0][1] * m[1][0];
const det3 = (m: number[][]) =>
  m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
const randVec = (r: Rng, n: number, lo: number, hi: number) => Array.from({ length: n }, () => r.int(lo, hi));
/** Filtra errores frecuentes que no sean números finitos distintos de la respuesta. */
const fe = (answer: number, tol: number, list: FrequentError[]) => {
  const seen: number[] = [];
  return list.filter((e) => {
    const m = e.match as number;
    if (!Number.isFinite(m) || Math.abs(m - answer) <= tol || seen.some((s) => Math.abs(s - m) <= tol)) return false;
    seen.push(m);
    return true;
  });
};
const sub = (i: number, j: number) => `_{${i}${j}}`;

// ───────────────────────── alg-con · Conjuntos ─────────────────────────

type SetOp = { label: string; f: (A: Set<number>, B: Set<number>, U: number[]) => number[]; dist: { f: (A: Set<number>, B: Set<number>, U: number[]) => number[]; msg: string }[] };
const uni = (A: Set<number>, B: Set<number>) => [...new Set([...A, ...B])];
const inter = (A: Set<number>, B: Set<number>) => [...A].filter((x) => B.has(x));
const minus = (A: Set<number>, B: Set<number>) => [...A].filter((x) => !B.has(x));
const comp = (X: number[], U: number[]) => U.filter((x) => !X.includes(x));
const symd = (A: Set<number>, B: Set<number>) => [...minus(A, B), ...minus(B, A)];

const SET_OPS: SetOp[] = [
  { label: "A ∪ B", f: uni, dist: [
    { f: inter, msg: "Eso es A ∩ B (lo común). La unión A ∪ B junta TODOS los elementos de A y de B." },
    { f: (A) => [...A], msg: "Te faltaron los elementos de B: la unión incluye todo lo que está en A o en B." },
    { f: symd, msg: "Los elementos comunes también están en la unión (se escriben una sola vez)." },
  ] },
  { label: "A ∩ B", f: inter, dist: [
    { f: uni, msg: "Eso es la unión. La intersección son solo los elementos que están en A y en B a la vez." },
    { f: minus, msg: "Esos están en A pero NO en B: es A − B. La intersección pide estar en los dos." },
    { f: symd, msg: "Elegiste justo los que NO son comunes. La intersección son los comunes." },
  ] },
  { label: "A − B", f: minus, dist: [
    { f: (A, B) => minus(B, A), msg: "Eso es B − A. El orden importa: A − B son los de A que no están en B." },
    { f: inter, msg: "Esos son justamente los que hay que sacar: los de A que también están en B." },
    { f: (A) => [...A], msg: "A − B se obtiene quitándole a A los elementos que están en B." },
  ] },
  { label: "B − A", f: (A, B) => minus(B, A), dist: [
    { f: minus, msg: "Eso es A − B. El orden importa: B − A son los de B que no están en A." },
    { f: inter, msg: "Esos son los comunes, que justamente se quitan." },
    { f: (_A, B) => [...B], msg: "B − A se obtiene quitándole a B los elementos que están en A." },
  ] },
  { label: "A^c", f: (A, _B, U) => comp([...A], U), dist: [
    { f: (A) => [...A], msg: "Eso es A. El complemento son los elementos del universal que NO están en A." },
    { f: (_A, B, U) => comp([...B], U), msg: "Ese es el complemento de B, no el de A." },
    { f: (A, B) => minus(B, A), msg: "Solo miraste los elementos de B. El complemento se toma respecto de TODO el universal U." },
  ] },
  { label: "(A ∪ B)^c", f: (A, B, U) => comp(uni(A, B), U), dist: [
    { f: (A, B, U) => uni(new Set(comp([...A], U)), new Set(comp([...B], U))), msg: "Ojo con De Morgan: (A ∪ B)^c = A^c ∩ B^c, no A^c ∪ B^c." },
    { f: inter, msg: "Eso es A ∩ B. Primero hacé la unión y después tomá lo que queda afuera en U." },
    { f: (A, B, U) => comp(inter(A, B), U), msg: "Eso es (A ∩ B)^c. Acá se complementa la UNIÓN." },
  ] },
  { label: "(A ∩ B)^c", f: (A, B, U) => comp(inter(A, B), U), dist: [
    { f: (A, B, U) => comp(uni(A, B), U), msg: "Ojo con De Morgan: (A ∩ B)^c = A^c ∪ B^c. Solo quedan afuera los comunes." },
    { f: inter, msg: "Eso es A ∩ B sin complementar." },
    { f: uni, msg: "Eso es A ∪ B. El complemento de A ∩ B es todo U menos los comunes." },
  ] },
  { label: "A ∩ B^c", f: minus, dist: [
    { f: (A, B) => minus(B, A), msg: "Eso es B ∩ A^c = B − A. Acá se pide estar en A y NO en B." },
    { f: inter, msg: "Eso es A ∩ B. B^c son los que NO están en B." },
    { f: (A, B, U) => comp(uni(A, B), U), msg: "Eso es A^c ∩ B^c. Acá A va sin complementar." },
  ] },
  { label: "(A − B) ∪ (B − A)", f: symd, dist: [
    { f: uni, msg: "Los comunes no entran: no están en A − B ni en B − A." },
    { f: inter, msg: "Esos son exactamente los que NO entran (los comunes)." },
    { f: minus, msg: "Te faltó la parte B − A." },
  ] },
];

function randomSets(r: Rng, d: Difficulty): { U: number[]; A: Set<number>; B: Set<number> } {
  const N = d <= 3 ? 10 : 12;
  const U = Array.from({ length: N }, (_, i) => i + 1);
  for (;;) {
    const sz = byDifficulty(d, [3, 4, 4, 5, 5, 6]);
    const A = new Set(r.shuffle(U).slice(0, sz));
    const B = new Set(r.shuffle(U).slice(0, sz));
    if (inter(A, B).length && minus(A, B).length && minus(B, A).length && uni(A, B).length < N) return { U, A, B };
  }
}

export const conjuntosOperacion: Generator = {
  id: "alg-conjuntos-operacion",
  topicId: "t-alg-conjuntos",
  description: "Unión, intersección, diferencia y complemento de conjuntos finitos",
  generate(seed, d) {
    const r = rng(seed);
    const { U, A, B } = randomSets(r, d);
    const pool = byDifficulty(d, [[0, 1], [0, 1, 2], [2, 3, 4], [4, 5, 6], [5, 6, 7, 8], [7, 8, 5, 6]]);
    const op = SET_OPS[r.pick(pool)];
    const ans = op.f(A, B, U);
    const usesU = op.label.includes("^c");
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Sean ${usesU ? `$U = \\{1, 2, …, ${U.length}\\}$, ` : ""}$A = ${setTxt([...A])}$ y $B = ${setTxt([...B])}$. Calculá $${op.label}$.`,
        hints: [
          "Leé la operación: ∪ = «o» (en alguno), ∩ = «y» (en los dos), − = «pero no», ^c = «no está».",
          "Recorré los elementos uno por uno y preguntate si cumplen la condición.",
          `Los comunes son ${setTxt(inter(A, B))}; los de A que no están en B, ${setTxt(minus(A, B))}.`,
        ],
        solution: [`A ∩ B = ${setTxt(inter(A, B))}, A − B = ${setTxt(minus(A, B))}, B − A = ${setTxt(minus(B, A))}`, `${op.label} = ${setTxt(ans)}`],
        explanation: "Cada operación es una condición lógica: x ∈ A ∪ B si está en A o en B; x ∈ A ∩ B si está en ambos; x ∈ A − B si está en A y no en B; x ∈ A^c si está en U y no en A.",
      }),
      [
        { text: `$${setTxt(ans)}$`, correct: true },
        ...op.dist.map((x) => ({ text: `$${setTxt(x.f(A, B, U))}$`, error: { type: "conceptual" as const, message: x.msg } })),
      ],
    );
  },
};

export const conjuntosRelacionar: Generator = {
  id: "alg-conjuntos-relacionar",
  topicId: "t-alg-conjuntos",
  description: "Relacionar cada operación de conjuntos con su resultado",
  generate(seed, d) {
    const r = rng(seed);
    const { U, A, B } = randomSets(r, d);
    const labels = d >= 4 ? ["A ∪ B", "A ∩ B", "A − B", "(A ∪ B)^c"] : ["A ∪ B", "A ∩ B", "A − B", "B − A"];
    const ops = labels.map((l) => SET_OPS.find((o) => o.label === l) as SetOp);
    const pairs: [string, string][] = ops.map((o) => [`$${o.label}$`, `$${setTxt(o.f(A, B, U))}$`]);
    const ex: MatchExercise = {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Con ${d >= 4 ? `$U = \\{1, …, ${U.length}\\}$, ` : ""}$A = ${setTxt([...A])}$ y $B = ${setTxt([...B])}$, relacioná cada operación con su resultado.`,
        hints: ["Empezá por A ∩ B: son los elementos que se repiten.", "La unión es el conjunto más grande de todos.", "A − B: tachá de A los comunes."],
        solution: pairs.map(([a, b]) => `${a} → ${b}`),
        explanation: "∪ junta, ∩ se queda con lo común, A − B le quita a A lo de B y el complemento es lo que queda afuera en U.",
      }),
      kind: "match",
      pairs,
    };
    return ex;
  },
};

// ── Intervalos y valor absoluto ──

const iv = (lo: number, loC: boolean, hi: number, hiC: boolean) => `${loC ? "[" : "("}${fmt(lo)}, ${fmt(hi)}${hiC ? "]" : ")"}`;
const outside = (a: number, b: number, closed: boolean) => `(−∞, ${fmt(a)}${closed ? "]" : ")"} ∪ ${closed ? "[" : "("}${fmt(b)}, +∞)`;

export const absIntervalo: Generator = {
  id: "alg-abs-intervalo",
  topicId: "t-alg-valor-absoluto",
  description: "Inecuaciones con valor absoluto escritas como intervalos",
  generate(seed, d) {
    const r = rng(seed);
    const c = d === 1 ? 0 : r.nz(-6, 6);
    const h = r.int(1, 6);
    const k = d >= 5 ? r.pick([2, 3]) : 1;
    const rel = d <= 2 ? r.pick(["<", "≤"]) : d === 3 ? r.pick([">", "≥"]) : r.pick(["<", "≤", ">", "≥"]);
    const closed = rel === "≤" || rel === "≥";
    const inside = rel === "<" || rel === "≤";
    const b = k * c;
    const rr = k * h;
    const lhs = k === 1 ? (c === 0 ? "|x|" : `|x ${c > 0 ? "−" : "+"} ${fmt(Math.abs(c))}|`) : `|${k}x ${b > 0 ? "−" : "+"} ${fmt(Math.abs(b))}|`;
    const sol = (cc: number, hh: number, ins: boolean) => (ins ? iv(cc - hh, closed, cc + hh, closed) : outside(cc - hh, cc + hh, closed));
    const correct = sol(c, h, inside);
    const opts: Option[] = [
      { text: `$${correct}$`, correct: true },
      { text: `$${sol(c, h, !inside)}$`, error: { type: "conceptual", message: inside ? "|x − a| < r significa «estar CERCA de a»: los x entre a − r y a + r. La unión de dos semirrectas es para «>»." : "|x − a| > r significa «estar LEJOS de a»: dos semirrectas, afuera del intervalo (a − r, a + r)." } },
      { text: `$${inside ? iv(c - h, !closed, c + h, !closed) : outside(c - h, c + h, !closed)}$`, error: { type: "conceptual", message: closed ? "Con ≤ o ≥ los extremos SÍ se incluyen: van corchetes." : "Con < o > los extremos no se incluyen (en ellos la distancia es exactamente r): van paréntesis." } },
    ];
    if (c !== 0) opts.push({ text: `$${sol(-c, h, inside)}$`, error: { type: "signos", message: `|x − a| es la distancia de x a a. Por eso ${lhs} mide la distancia a ${fmt(c)}, no a ${fmt(-c)}.` } });
    if (k !== 1) opts.push({ text: `$${sol(b, rr, inside)}$`, error: { type: "despeje", message: `Te faltó dividir por ${k}: |${k}x − ${par(b)}| = ${k}·|x − ${par(c)}|, así que también hay que dividir ${fmt(rr)} por ${k}. El centro es ${fmt(c)} y el radio ${fmt(h)}.` } });
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Escribí como intervalo (o unión de intervalos) el conjunto de los $x ∈ ℝ$ que cumplen $${lhs} ${rel} ${fmt(rr)}$.`,
        hints: [
          k === 1 ? `${lhs} es la distancia entre x y ${fmt(c)} en la recta.` : `Primero pensalo como |${k}x − ${par(b)}| = ${k}·|x − ${par(c)}|.`,
          inside ? `«Distancia ${rel} r» ⇒ x está entre centro − r y centro + r.` : `«Distancia ${rel} r» ⇒ x está afuera: a la izquierda de centro − r o a la derecha de centro + r.`,
          `Centro ${fmt(c)}, radio ${fmt(h)}: los extremos son ${fmt(c - h)} y ${fmt(c + h)}.`,
        ],
        solution: [
          ...(k !== 1 ? [`${lhs} ${rel} ${fmt(rr)} ⇔ ${k}·|x ${c > 0 ? "−" : "+"} ${fmt(Math.abs(c))}| ${rel} ${fmt(rr)} ⇔ |x ${c > 0 ? "−" : "+"} ${fmt(Math.abs(c))}| ${rel} ${fmt(h)}`] : []),
          inside ? `${fmt(c - h)} ${rel} x ${rel} ${fmt(c + h)}` : `x ${rel === ">" ? "<" : "≤"} ${fmt(c - h)} o x ${rel} ${fmt(c + h)}`,
          `Solución: ${correct}`,
        ],
        explanation: "|x − a| es la distancia de x a a. |x − a| < r: x a menos de r de a (un intervalo centrado en a). |x − a| > r: x a más de r (dos semirrectas).",
      }),
      opts,
    );
  },
};

export const intervalosOperacion: Generator = {
  id: "alg-intervalos-operacion",
  topicId: "t-alg-valor-absoluto",
  description: "Intersección, unión y diferencia de intervalos",
  generate(seed, d) {
    const r = rng(seed);
    const a = r.int(-8, 0);
    const c = a + r.int(1, 4);
    const b = c + r.int(1, 4);
    const e = b + r.int(1, 4);
    const [aC, bC, cC, eC] = [r.bool(), r.bool(), r.bool(), r.bool()];
    const op = d <= 2 ? "∩" : d === 3 ? r.pick(["∩", "∪"]) : r.pick(["∩", "∪", "A − B", "B − A"]);
    const A = iv(a, aC, b, bC);
    const B = iv(c, cC, e, eC);
    const res: Record<string, string> = {
      "∩": iv(c, cC, b, bC),
      "∪": iv(a, aC, e, eC),
      "A − B": iv(a, aC, c, !cC),
      "B − A": iv(b, !bC, e, eC),
    };
    const label = op === "∩" ? "A ∩ B" : op === "∪" ? "A ∪ B" : op;
    const flipped: Record<string, string> = {
      "∩": iv(c, !cC, b, bC),
      "∪": iv(a, aC, e, !eC),
      "A − B": iv(a, aC, c, cC),
      "B − A": iv(b, bC, e, eC),
    };
    const opts: Option[] = [
      { text: `$${res[op]}$`, correct: true },
      { text: `$${flipped[op]}$`, error: { type: "conceptual", message: op === "A − B" || op === "B − A" ? "Al restar, el extremo que se quita cambia: si B incluye ese punto, la diferencia NO lo incluye (y al revés)." : "Revisá el corchete de cada extremo: copialo del intervalo de donde sale ese extremo." } },
    ];
    if (op === "∩") opts.push({ text: `$${res["∪"]}$`, error: { type: "conceptual", message: "Eso es la unión. La intersección es el tramo donde los dos intervalos se superponen." } });
    if (op === "∪") opts.push({ text: `$${res["∩"]}$`, error: { type: "conceptual", message: "Eso es la intersección (lo común). La unión va desde el extremo izquierdo de A hasta el derecho de B." } });
    if (op === "A − B") opts.push({ text: `$${res["B − A"]}$`, error: { type: "conceptual", message: "Eso es B − A. A − B son los puntos de A que no están en B." } });
    if (op === "B − A") opts.push({ text: `$${res["A − B"]}$`, error: { type: "conceptual", message: "Eso es A − B. B − A son los puntos de B que no están en A." } });
    opts.push({ text: `$${res[op === "∩" ? "A − B" : "∩"]}$`, error: { type: "conceptual", message: "Dibujá los dos intervalos en la recta y marcá qué tramo pide la operación." } });
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Si $A = ${A}$ y $B = ${B}$, calculá $${label}$.`,
        hints: ["Dibujá los dos intervalos en una misma recta.", "Corchete = el extremo está incluido; paréntesis = no.", `Se superponen entre ${fmt(c)} y ${fmt(b)}.`],
        solution: [`A = ${A}, B = ${B}`, `Se superponen en ${res["∩"]}`, `${label} = ${res[op]}`],
        explanation: "Los intervalos son conjuntos: ∩ es el tramo común, ∪ el tramo total y A − B lo de A que queda al sacar B. Cada extremo conserva el corchete del intervalo de donde proviene (en la diferencia, se invierte el del que se quita).",
        visual: { type: "numberline", min: a - 1, max: e + 1, marks: [a, c, b, e] },
      }),
      opts,
    );
  },
};

// ───────────────────────── alg-cx · Complejos ─────────────────────────

export const complejoOperacion: Generator = {
  id: "alg-complejo-operacion",
  topicId: "t-alg-complejos",
  description: "Suma, resta, producto, conjugado y cuadrado de complejos en forma binómica",
  generate(seed, d) {
    const r = rng(seed);
    const lim = d <= 3 ? 5 : 7;
    const [a, b, c, e] = [r.nz(-lim, lim), r.nz(-lim, lim), r.nz(-lim, lim), r.nz(-lim, lim)];
    const z = cx(a, b);
    const w = cx(c, e);
    const op = byDifficulty(d, ["suma", "resta", "producto", r.pick(["producto", "conj"]), r.pick(["conj", "cuadrado"]), r.pick(["cuadrado", "producto", "conj"])]);
    let label: string, ans: [number, number], dist: { v: [number, number]; type: "signos" | "conceptual" | "potencias" | "calculo"; msg: string }[], steps: string[];
    if (op === "suma") {
      label = "z + w";
      ans = [a + c, b + e];
      dist = [
        { v: [a + c, b - e], type: "signos", msg: "Las partes imaginarias también se suman: (b + d)i." },
        { v: [a * c, b * e], type: "conceptual", msg: "Para sumar no se multiplica: se suman reales con reales e imaginarias con imaginarias." },
      ];
      steps = [`z + w = (${fmt(a)} + ${par(c)}) + (${fmt(b)} + ${par(e)})i`, `= ${cx(...ans)}`];
    } else if (op === "resta") {
      label = "z − w";
      ans = [a - c, b - e];
      dist = [
        { v: [a - c, b + e], type: "signos", msg: "El signo menos afecta a TODO w: −(c + di) = −c − di. También se resta la parte imaginaria." },
        { v: [a + c, b + e], type: "signos", msg: "Sumaste en lugar de restar." },
      ];
      steps = [`z − w = (${fmt(a)} − ${par(c)}) + (${fmt(b)} − ${par(e)})i`, `= ${cx(...ans)}`];
    } else if (op === "producto" || op === "conj") {
      const ee = op === "conj" ? -e : e;
      label = op === "conj" ? "z · w̄" : "z · w";
      ans = [a * c - b * ee, a * ee + b * c];
      dist = [
        { v: [a * c + b * ee, a * ee + b * c], type: "potencias", msg: `i² = −1, así que el término ${fmt(b)}i·${par(ee)}i = ${fmt(b * ee)}i² = ${fmt(-b * ee)} cambia de signo.` },
        { v: [a * c, b * ee], type: "conceptual", msg: "No alcanza con multiplicar real por real e imaginaria por imaginaria: hay que aplicar distributiva (4 productos)." },
      ];
      if (op === "conj") dist.push({ v: [a * c - b * e, a * e + b * c], type: "conceptual", msg: `Te olvidaste de conjugar w: w̄ = ${cx(c, -e)} (cambia el signo de la parte imaginaria).` });
      steps = [
        ...(op === "conj" ? [`w̄ = ${cx(c, ee)}`] : []),
        `(${z})(${cx(c, ee)}) = ${fmt(a)}·${par(c)} + ${fmt(a)}·(${cx(0, ee)}) + (${cx(0, b)})·${par(c)} + (${cx(0, b)})(${cx(0, ee)})`,
        `= ${fmt(a * c)} ${a * ee + b * c >= 0 ? "+" : "−"} ${fmt(Math.abs(a * ee + b * c))}i ${b * ee >= 0 ? "−" : "+"} ${fmt(Math.abs(b * ee))}   (porque i² = −1)`,
        `= ${cx(...ans)}`,
      ];
    } else {
      label = "z^2";
      ans = [a * a - b * b, 2 * a * b];
      dist = [
        { v: [a * a, b * b], type: "potencias", msg: "(a + bi)² ≠ a² + (bi)²: falta el doble producto 2·a·bi, como en (a + b)² = a² + 2ab + b²." },
        { v: [a * a + b * b, 2 * a * b], type: "potencias", msg: `(bi)² = b²·i² = −b². Por eso la parte real es a² − b² = ${fmt(a * a - b * b)}.` },
      ];
      steps = [`z² = (${z})² = ${par(a)}² + 2·${par(a)}·${par(b)}i + (${fmt(b)}i)²`, `= ${fmt(a * a)} + ${par(2 * a * b)}i + ${fmt(b * b)}·i²`, `= ${fmt(a * a)} − ${fmt(b * b)} + ${par(2 * a * b)}i = ${cx(...ans)}`];
    }
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: op === "cuadrado" ? `Si $z = ${z}$, calculá $z^2$ en forma binómica.` : `Si $z = ${z}$ y $w = ${w}$, calculá $${label}$.`,
        hints: [
          "Trabajá como con polinomios en i: distributiva y agrupar.",
          "Recordá que i² = −1.",
          op === "conj" ? `El conjugado de w es ${cx(c, -e)}.` : "Parte real con parte real; parte imaginaria con parte imaginaria.",
        ],
        solution: steps,
        explanation: "En forma binómica se opera como con expresiones algebraicas, reemplazando i² por −1. El conjugado de a + bi es a − bi.",
      }),
      [{ text: `$${cx(...ans)}$`, correct: true }, ...dist.map((x) => ({ text: `$${cx(...x.v)}$`, error: { type: x.type, message: x.msg } }))],
    );
  },
};

export const complejoCociente: Generator = {
  id: "alg-complejo-cociente",
  topicId: "t-alg-complejos",
  description: "Cociente de complejos multiplicando por el conjugado",
  generate(seed, d) {
    const r = rng(seed);
    const lim = d <= 3 ? 3 : 5;
    const [p, q] = [r.int(-lim, lim), r.nz(-lim, lim)];
    const [c, e] = [r.nz(-3, 3), r.nz(-3, 3)];
    const a = p * c - q * e;
    const b = p * e + q * c;
    const askRe = d <= 2 ? true : r.bool();
    const n2 = c * c + e * e;
    const numRe = a * c + b * e;
    const numIm = b * c - a * e;
    const ans = askRe ? p : q;
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Calculá $\\frac{${cx(a, b)}}{${cx(c, e)}}$ y escribí su parte ${askRe ? "**real**" : "**imaginaria**"}.`,
        hints: [
          "Multiplicá numerador y denominador por el conjugado del denominador.",
          `El conjugado de ${cx(c, e)} es ${cx(c, -e)}; el denominador queda ${fmt(c * c)} + ${fmt(e * e)} = ${n2}.`,
          `Numerador: (${cx(a, b)})(${cx(c, -e)}) = ${cx(numRe, numIm)}.`,
        ],
        solution: [
          `\\frac{${cx(a, b)}}{${cx(c, e)}} · \\frac{${cx(c, -e)}}{${cx(c, -e)}}`,
          `= \\frac{${cx(numRe, numIm)}}{${n2}}`,
          `= ${cx(p, q)}`,
          `Parte ${askRe ? "real" : "imaginaria"}: ${fmt(ans)}`,
        ],
        explanation: "Como (c + di)(c − di) = c² + d² es real, multiplicar arriba y abajo por el conjugado deja el denominador real y permite separar parte real e imaginaria.",
        frequentErrors: fe(ans, 1e-9, [
          { match: askRe ? numRe : numIm, type: "calculo", message: `Te faltó dividir por |w|² = ${n2}.` },
          { match: askRe ? a / c : b / e, type: "conceptual", message: "No se puede dividir parte real por parte real: hay que multiplicar por el conjugado del denominador." },
          { match: askRe ? q : p, type: "interpretacion", message: `Esa es la parte ${askRe ? "imaginaria" : "real"}. Se pide la otra.` },
        ]),
      }),
      kind: "numeric",
      answer: ans,
    } as NumericExercise;
  },
};

const UNITS_I: [number, number][] = [[1, 0], [0, 1], [-1, 0], [0, -1]];
const iPow = (n: number) => UNITS_I[((n % 4) + 4) % 4];

export const potenciaI: Generator = {
  id: "alg-potencia-i",
  topicId: "t-alg-complejos",
  description: "Potencias de la unidad imaginaria i",
  generate(seed, d) {
    const r = rng(seed);
    const n = r.int(...byDifficulty(d, [[2, 12], [5, 50], [20, 400], [1, 30], [5, 99], [5, 999]] as [[number, number], [number, number], [number, number], [number, number], [number, number], [number, number]]));
    const m = r.int(1, 60);
    const mode = d === 4 ? "neg" : d === 5 ? "prod" : d === 6 ? "suma" : "pow";
    let prompt: string, ans: [number, number], steps: string[];
    const opts: Option[] = [];
    if (mode === "suma") {
      const [x1, y1] = iPow(n);
      const [x2, y2] = iPow(m);
      ans = [x1 + x2, y1 + y2];
      prompt = `Calculá $i^{${n}} + i^{${m}}$.`;
      steps = [`${n} = 4·${Math.floor(n / 4)} + ${n % 4} ⇒ i^{${n}} = i^{${n % 4}} = ${cx(x1, y1)}`, `${m} = 4·${Math.floor(m / 4)} + ${m % 4} ⇒ i^{${m}} = i^{${m % 4}} = ${cx(x2, y2)}`, `Suma: ${cx(...ans)}`];
      const pr = iPow(n + m);
      opts.push({ text: `$${cx(...ans)}$`, correct: true });
      opts.push({ text: `$${cx(...pr)}$`, error: { type: "potencias", message: "Ese es i^{n+m} = i^n · i^m (el producto). Acá se pide la suma: calculá cada potencia por separado." } });
      opts.push({ text: `$${cx(-ans[0], -ans[1])}$`, error: { type: "signos", message: "Revisá los signos del ciclo: i⁰ = 1, i¹ = i, i² = −1, i³ = −i." } });
      opts.push({ text: "$2$", error: { type: "potencias", message: "No todas las potencias de i valen 1: calculá el resto de cada exponente al dividir por 4." } });
      opts.push({ text: "$1 + i$", error: { type: "potencias", message: "Calculá cada potencia por separado con el resto de dividir por 4; después sumá." } });
      opts.push({ text: `$${cx(...iPow(n % 4 + (m % 4)))}$`, error: { type: "potencias", message: "Sumaste los restos como si fuera un producto. Calculá cada potencia y después sumá los resultados." } });
    } else {
      const e = mode === "neg" ? -n : mode === "prod" ? n + m : n;
      ans = iPow(e) as [number, number];
      prompt = mode === "neg" ? `Calculá $i^{−${n}}$.` : mode === "prod" ? `Calculá $i^{${n}} · i^{${m}}$.` : `Calculá $i^{${n}}$.`;
      const k = ((e % 4) + 4) % 4;
      steps =
        mode === "neg"
          ? [`i^{−${n}} = \\frac{1}{i^{${n}}}`, `${n} = 4·${Math.floor(n / 4)} + ${n % 4} ⇒ i^{${n}} = ${cx(...iPow(n))}`, `\\frac{1}{${cx(...iPow(n))}} = ${cx(...ans)}   (equivale a i^{${k}})`]
          : mode === "prod"
            ? [`i^{${n}} · i^{${m}} = i^{${n + m}}`, `${n + m} = 4·${Math.floor((n + m) / 4)} + ${k}`, `i^{${n + m}} = i^{${k}} = ${cx(...ans)}`]
            : [`${n} = 4·${Math.floor(n / 4)} + ${k}`, `i^{${n}} = (i^4)^{${Math.floor(n / 4)}} · i^{${k}} = i^{${k}}`, `= ${cx(...ans)}`];
      for (const u of UNITS_I) {
        const t = cx(u[0], u[1]);
        if (u[0] === ans[0] && u[1] === ans[1]) opts.push({ text: `$${t}$`, correct: true });
        else if (mode === "neg" && u[0] === iPow(n)[0] && u[1] === iPow(n)[1]) opts.push({ text: `$${t}$`, error: { type: "potencias", message: "Ese es i^n, no i^{−n} = 1/i^n. Por ejemplo, 1/i = −i (multiplicá arriba y abajo por −i)." } });
        else if (mode === "prod" && u[0] === iPow(n * m)[0] && u[1] === iPow(n * m)[1]) opts.push({ text: `$${t}$`, error: { type: "potencias", message: "Con igual base los exponentes se SUMAN: i^n · i^m = i^{n+m}." } });
        else opts.push({ text: `$${t}$`, error: { type: "potencias", message: `Como i⁴ = 1, solo importa el resto de dividir el exponente por 4 (acá, ${k}). Ciclo: i⁰ = 1, i¹ = i, i² = −1, i³ = −i.` } });
      }
    }
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt,
        hints: ["Las potencias de i se repiten cada 4: 1, i, −1, −i.", "Dividí el exponente por 4 y mirá el resto.", "i^n = i^{resto}, porque i⁴ = 1."],
        solution: steps,
        explanation: "Como i⁴ = 1, las potencias de i son cíclicas de período 4: i^n = i^r, con r el resto de dividir n por 4.",
      }),
      opts,
    );
  },
};

const NICE_ARGS: { x: (k: number) => [string, string]; ang: number; v: [number, number] }[] = [
  { x: () => ["k", "0"], ang: 0, v: [1, 0] },
  { x: () => ["0", "k"], ang: 90, v: [0, 1] },
  { x: () => ["−k", "0"], ang: 180, v: [-1, 0] },
  { x: () => ["0", "−k"], ang: 270, v: [0, -1] },
  { x: () => ["k", "k"], ang: 45, v: [1, 1] },
  { x: () => ["−k", "k"], ang: 135, v: [-1, 1] },
  { x: () => ["−k", "−k"], ang: 225, v: [-1, -1] },
  { x: () => ["k", "−k"], ang: 315, v: [1, -1] },
  { x: () => ["k√3", "k"], ang: 30, v: [Math.sqrt(3), 1] },
  { x: () => ["k", "k√3"], ang: 60, v: [1, Math.sqrt(3)] },
  { x: () => ["−k", "k√3"], ang: 120, v: [-1, Math.sqrt(3)] },
  { x: () => ["−k√3", "k"], ang: 150, v: [-Math.sqrt(3), 1] },
  { x: () => ["−k√3", "−k"], ang: 210, v: [-Math.sqrt(3), -1] },
  { x: () => ["−k", "−k√3"], ang: 240, v: [-1, -Math.sqrt(3)] },
  { x: () => ["k", "−k√3"], ang: 300, v: [1, -Math.sqrt(3)] },
  { x: () => ["k√3", "−k"], ang: 330, v: [Math.sqrt(3), -1] },
];
/** Texto de un complejo con partes "k", "k√3", etc. */
function cxSym(re: string, im: string, k: number): string {
  const put = (s: string) => s.replace("k√3", k === 1 ? "√3" : `${k}√3`).replace("k", String(k));
  const R = put(re);
  const neg = im.startsWith("−");
  const I0 = put(im.replace("−", ""));
  const I = I0 === "1" ? "i" : I0.includes("√") ? `${I0.replace("√3", "")}i√3`.replace(/^i/, "i") : `${I0}i`;
  if (im === "0") return R;
  if (re === "0") return neg ? `−${I}` : I;
  return `${R} ${neg ? "−" : "+"} ${I}`;
}

export const complejoPolar: Generator = {
  id: "alg-complejo-polar",
  topicId: "t-alg-complejos-polar",
  description: "Módulo y argumento de un número complejo",
  generate(seed, d) {
    const r = rng(seed);
    const askMod = d <= 2 ? true : d === 3 ? false : r.bool();
    if (askMod) {
      let a: number, b: number;
      if (d <= 3) {
        [a, b] = r.pick([[3, 4], [4, 3], [5, 12], [12, 5], [6, 8], [8, 6], [8, 15]]);
        if (d >= 2) {
          if (r.bool()) a = -a;
          if (r.bool()) b = -b;
        }
      } else {
        a = r.nz(-7, 7);
        b = r.nz(-7, 7);
      }
      const power = d >= 5 ? r.pick([2, 3]) : 1;
      const m = Math.hypot(a, b);
      const ans = r2(m ** power);
      const exact = Number.isInteger(Math.round(m ** power * 1e6) / 1e6);
      return {
        ...base({
          gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
          prompt: power === 1 ? `Calculá el módulo de $z = ${cx(a, b)}$.${exact ? "" : " (redondeá a 2 decimales)"}` : `Si $z = ${cx(a, b)}$, calculá $|z^{${power}}|$.${exact ? "" : " (redondeá a 2 decimales)"}`,
          hints: [
            "El módulo es la distancia del punto (a, b) al origen.",
            "|a + bi| = √(a² + b²): la parte imaginaria va SIN la i.",
            power === 1 ? `√(${par(a)}² + ${par(b)}²) = √${a * a + b * b}` : `|z^n| = |z|^n, con |z| = √${a * a + b * b}.`,
          ],
          solution: [`|z| = √(${par(a)}² + ${par(b)}²) = √${a * a + b * b}${Number.isInteger(m) ? ` = ${m}` : ` ≈ ${fmt(m, 2)}`}`, ...(power > 1 ? [`|z^{${power}}| = |z|^{${power}} = ${fmt(ans, 2)}`] : [])],
          explanation: "El módulo |z| = √(a² + b²) es la distancia al origen en el plano complejo. Además |z·w| = |z|·|w|, por eso |z^n| = |z|^n.",
          frequentErrors: fe(ans, 0.011, [
            { match: a * a + b * b, type: "calculo", message: "Te faltó la raíz cuadrada." },
            { match: Math.abs(a) + Math.abs(b), type: "conceptual", message: "El módulo no es la suma de las partes: es √(a² + b²) (Pitágoras)." },
            { match: r2(power * m), type: "potencias", message: "|z^n| = |z|^n: el módulo se eleva, no se multiplica por n." },
          ]),
        }),
        kind: "numeric",
        answer: ans,
        tolerance: exact ? undefined : 0.011,
      } as NumericExercise;
    }
    const pool = d <= 4 ? NICE_ARGS.slice(0, 8) : NICE_ARGS;
    const item = r.pick(pool);
    const k = r.int(1, 4);
    const [re, im] = item.x(k);
    const z = cxSym(re, im, k);
    const ans = item.ang;
    const naive = item.v[0] !== 0 ? Math.round((Math.atan(item.v[1] / item.v[0]) * 180) / Math.PI) : NaN;
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Hallá el argumento de $z = ${z}$, en grados, dentro de $[0°, 360°)$.`,
        hints: [
          "Ubicá el punto en el plano: ¿en qué cuadrante (o eje) está?",
          "tg θ = b/a da el ángulo de referencia; después corregilo según el cuadrante.",
          `El punto tiene parte real ${item.v[0] > 0 ? "positiva" : item.v[0] < 0 ? "negativa" : "nula"} e imaginaria ${item.v[1] > 0 ? "positiva" : item.v[1] < 0 ? "negativa" : "nula"}.`,
        ],
        solution: [`z está en ${item.ang % 90 === 0 ? "un eje" : `el cuadrante ${Math.floor(item.ang / 90) + 1}`}`, ...(item.v[0] !== 0 && item.v[1] !== 0 ? [`ángulo de referencia: arctg(${fmt(Math.abs(item.v[1] / item.v[0]), 3)}) = ${fmt(Math.abs(naive))}°`] : []), `arg(z) = ${ans}°`],
        explanation: "El argumento es el ángulo que forma z con el semieje real positivo. La calculadora con arctg(b/a) solo devuelve ángulos entre −90° y 90°: si a < 0, hay que sumar 180°; si da negativo, sumar 360°.",
        frequentErrors: fe(ans, 1e-9, [
          { match: naive, type: "trigonometria", message: "Eso es lo que da arctg(b/a) en la calculadora, pero no tiene en cuenta el cuadrante. Ubicá el punto y corregí (sumando 180° o 360°)." },
          { match: ans - 360, type: "interpretacion", message: "Es el mismo ángulo, pero se pidió en [0°, 360°): sumale 360°." },
          { match: (ans * Math.PI) / 180, type: "unidades", message: "Ese valor está en radianes; se pidió en grados." },
        ]),
      }),
      kind: "numeric",
      answer: ans,
    } as NumericExercise;
  },
};

const mod360 = (x: number) => ((x % 360) + 360) % 360;
const trigTxt = (R: number, ang: number) => `${fmt(R)}(cos ${ang}° + i sen ${ang}°)`;

export const deMoivre: Generator = {
  id: "alg-de-moivre",
  topicId: "t-alg-complejos-polar",
  description: "Potencias de complejos en forma trigonométrica (De Moivre)",
  generate(seed, d) {
    const r = rng(seed);
    const R = byDifficulty(d, [1, 2, r.pick([1, 2]), r.pick([2, 3]), r.pick([2, 3]), r.pick([2, 3])]);
    let theta = 0;
    let n = 2;
    do {
      theta = r.pick(d <= 2 ? [30, 45, 60, 90] : [30, 45, 60, 120, 135, 150, 210, 225, 300, 315]);
      n = r.int(2, R === 3 ? 4 : 6);
    } while (((n - 1) * theta) % 360 === 0);
    const ang = mod360(n * theta);
    const Rn = R ** n;
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Si $z = ${trigTxt(R, theta)}$, ¿cuánto vale $z^{${n}}$? (argumento en $[0°, 360°)$)`,
        hints: ["Usá la fórmula de De Moivre.", "[r(cos θ + i sen θ)]^n = r^n (cos nθ + i sen nθ).", `Módulo: ${R}^${n} = ${Rn}; argumento: ${n}·${theta}° = ${n * theta}°${n * theta >= 360 ? `, que equivale a ${ang}°` : ""}.`],
        solution: [`z^{${n}} = ${R}^{${n}} (cos(${n}·${theta}°) + i sen(${n}·${theta}°))`, `= ${trigTxt(Rn, n * theta)}`, ...(n * theta >= 360 ? [`${n * theta}° − ${n * theta - ang}° = ${ang}°`] : []), `z^{${n}} = ${trigTxt(Rn, ang)}`],
        explanation: "Al multiplicar complejos, los módulos se multiplican y los argumentos se suman. Elevar a la n es multiplicar n veces: el módulo queda elevado a la n y el argumento multiplicado por n.",
      }),
      [
        { text: `$${trigTxt(Rn, ang)}$`, correct: true },
        { text: `$${trigTxt(R * n, ang)}$`, error: { type: "potencias", message: `El módulo se ELEVA a la n: ${R}^${n} = ${Rn}, no ${R}·${n}.` } },
        { text: `$${trigTxt(Rn, theta)}$`, error: { type: "potencias", message: "El argumento también cambia: se multiplica por n." } },
        { text: `$${trigTxt(Rn, mod360(theta + n))}$`, error: { type: "potencias", message: "Al argumento no se le suma n: se lo multiplica por n." } },
      ],
    );
  },
};

// ── Polinomios ──

function randomPoly(r: Rng, deg: number, lim: number): number[] {
  const c = [r.nz(1, 3) * (r.bool() ? 1 : -1)];
  for (let i = 0; i < deg; i++) c.push(r.int(-lim, lim));
  return c;
}

export const teoremaResto: Generator = {
  id: "alg-teorema-resto",
  topicId: "t-alg-polinomios-division",
  description: "Resto de dividir un polinomio por (x − a) con el teorema del resto",
  generate(seed, d) {
    const r = rng(seed);
    const P = randomPoly(r, d <= 3 ? 3 : 4, d <= 2 ? 3 : 5);
    const a = r.nz(d <= 2 ? 1 : -3, 3);
    const lin = d === 6 ? r.pick([2, 3]) : 1;
    const div = lin === 1 ? divisor(a) : `${lin}x ${a > 0 ? "−" : "+"} ${fmt(Math.abs(lin * a))}`;
    const ans = polyEval(P, a);
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Sin hacer la división, hallá el resto de dividir $P(x) = ${polyTxt(P)}$ por $${div}$.`,
        hints: [
          "Teorema del resto: el resto de dividir P(x) por (x − a) es P(a).",
          lin === 1 ? `¿Qué valor de x anula el divisor ${div}?` : `El divisor se anula en x = ${fmt(a)}; el resto (un número) sigue siendo P(${fmt(a)}).`,
          `Calculá P(${fmt(a)}).`,
        ],
        solution: [`${div} = 0 ⇔ x = ${fmt(a)}`, `R = P(${fmt(a)}) = ${P.map((k, i) => `${par(k)}·${par(a)}^${P.length - 1 - i}`).join(" + ")}`, `R = ${fmt(ans)}`],
        explanation: "Si P(x) = (x − a)·Q(x) + R, al reemplazar x = a el primer término se anula y queda P(a) = R.",
        frequentErrors: fe(ans, 1e-9, [{ match: polyEval(P, -a), type: "signos", message: `Reemplazaste x = ${fmt(-a)}. El divisor ${div} se anula en x = ${fmt(a)}.` }]),
      }),
      kind: "numeric",
      answer: ans,
    } as NumericExercise;
  },
};

export const ruffiniCociente: Generator = {
  id: "alg-ruffini-cociente",
  topicId: "t-alg-polinomios-division",
  description: "Cociente de la división por (x − a) con la regla de Ruffini",
  generate(seed, d) {
    const r = rng(seed);
    const Q = randomPoly(r, d <= 3 ? 2 : 3, d <= 2 ? 3 : 5);
    const a = r.nz(d <= 2 ? 1 : -3, 3);
    const R = d <= 2 ? 0 : r.int(-6, 6);
    const P = polyMul([1, -a], Q);
    P[P.length - 1] += R;
    const [q, rest] = ruffini(P, a);
    const [qWrong] = ruffini(P, -a);
    const ex: ExpressionExercise = {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Dividí $P(x) = ${polyTxt(P)}$ por $${divisor(a)}$ usando la regla de Ruffini. Escribí el **cociente** $Q(x)$.`,
        hints: [
          `Escribí los coeficientes de P en orden (con 0 si falta algún grado) y a la izquierda el ${fmt(a)}.`,
          `Bajá el primer coeficiente; multiplicalo por ${fmt(a)}, sumalo al siguiente, y repetí.`,
          `Los números de abajo son ${q.map((x) => fmt(x)).join(", ")} y el último es el resto (${fmt(rest)}).`,
        ],
        solution: [
          `Coeficientes: ${P.map((x) => fmt(x)).join(", ")}; a = ${fmt(a)}`,
          `Fila de abajo: ${[...q, rest].map((x) => fmt(x)).join(", ")}`,
          `Q(x) = ${polyTxt(q)}, resto ${fmt(rest)}`,
        ],
        explanation: "Ruffini es la división por (x − a) abreviada: cada número de abajo es el anterior por a más el coeficiente de arriba. El cociente tiene un grado menos que P y el último número es el resto (= P(a)).",
        frequentErrors: polyExpr(qWrong) !== polyExpr(q) ? [{ match: polyExpr(qWrong), type: "signos", message: `Usaste ${fmt(-a)} en lugar de ${fmt(a)}. Para dividir por (${divisor(a)}) se pone a = ${fmt(a)} (el valor que anula el divisor).` }] : [],
      }),
      kind: "expression",
      answer: polyExpr(q),
      variables: ["x"],
    };
    return ex;
  },
};

export const polinomioFactorizar: Generator = {
  id: "alg-polinomio-factorizar",
  topicId: "t-alg-polinomios-raices",
  description: "Factorizar un polinomio a partir de sus raíces enteras",
  generate(seed, d) {
    const r = rng(seed);
    const deg = d <= 2 ? 2 : 3;
    const L = d <= 3 ? 1 : r.pick([2, -1, 3, -2]);
    let roots: number[] = [];
    while (roots.length < deg) {
      const x = r.nz(-4, 4);
      if (!roots.some((y) => Math.abs(y) === Math.abs(x))) roots.push(x);
    }
    roots = roots.sort((a, b) => a - b);
    let P = [L];
    for (const x of roots) P = polyMul(P, [1, -x]);
    const lead = L === 1 ? "" : L === -1 ? "−" : fmt(L);
    const fact = (rs: number[], l = lead) => `${l}${[...rs].sort((a, b) => a - b).map(factor).join("")}`;
    let other = roots[0] + 1;
    while (roots.includes(other) || other === 0 || roots.includes(-other)) other++;
    const wrongRoots = [...roots.slice(1), other];
    const known = roots[deg - 1];
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Factorizá $P(x) = ${polyTxt(P)}$${deg === 3 ? ` sabiendo que $x = ${fmt(known)}$ es raíz` : ""}.`,
        hints: [
          deg === 3 ? `Dividí P por (${divisor(known)}) con Ruffini para bajar el grado.` : "Buscá las raíces con la fórmula resolvente (o probando divisores del término independiente).",
          "Si r es raíz, (x − r) es un factor.",
          `P(x) = a·(x − x₁)(x − x₂)${deg === 3 ? "(x − x₃)" : ""}, con a = ${fmt(L)} el coeficiente principal.`,
        ],
        solution: [
          ...(deg === 3 ? [`Ruffini con ${fmt(known)}: P(x) = ${factor(known)}·(${polyTxt(ruffini(P, known)[0])})`] : []),
          `Raíces: ${roots.map((x) => fmt(x)).join(", ")}`,
          `P(x) = ${fact(roots)}`,
        ],
        explanation: "Todo polinomio con raíces x₁, …, xₙ se escribe P(x) = a(x − x₁)…(x − xₙ), donde a es el coeficiente principal. Podés verificar multiplicando.",
      }),
      [
        { text: `$${fact(roots)}$`, correct: true },
        { text: `$${fact(roots.map((x) => -x))}$`, error: { type: "signos", message: "Si r es raíz, el factor es (x − r): para la raíz 2 va (x − 2), para la raíz −3 va (x + 3)." } },
        ...(L !== 1 ? [{ text: `$${fact(roots, "")}$`, error: { type: "factorizacion" as const, message: `Falta el coeficiente principal ${fmt(L)} adelante: sin él, el polinomio no es el mismo.` } }] : []),
        { text: `$${fact(wrongRoots)}$`, error: { type: "factorizacion", message: `${fmt(other)} no es raíz: P(${fmt(other)}) = ${fmt(polyEval(P, other))} ≠ 0. Verificá cada raíz reemplazando.` } },
      ],
    );
  },
};

// ───────────────────────── alg-1 · Vectores en ℝ³ ─────────────────────────

export const productoVectorial: Generator = {
  id: "alg-producto-vectorial",
  topicId: "t-alg-producto-vectorial",
  description: "Producto vectorial en ℝ³ y áreas de paralelogramos y triángulos",
  generate(seed, d) {
    const r = rng(seed);
    let u: number[], v: number[], w: number[];
    do {
      u = randVec(r, 3, d <= 2 ? 0 : -3, 3);
      v = randVec(r, 3, d <= 2 ? -1 : -3, 3);
      w = cross(u, v);
    } while (isZero(w));
    const sol = [
      `u × v = (${par(u[1])}·${par(v[2])} − ${par(u[2])}·${par(v[1])}, −(${par(u[0])}·${par(v[2])} − ${par(u[2])}·${par(v[0])}), ${par(u[0])}·${par(v[1])} − ${par(u[1])}·${par(v[0])})`,
      `u × v = ${vec(w)}`,
    ];
    if (d <= 3) {
      return choice(
        r,
        base({
          gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
          prompt: `Calculá $u × v$ para $u = ${vec(u)}$ y $v = ${vec(v)}$.`,
          hints: [
            "Armá el determinante con i, j, k en la primera fila, u en la segunda y v en la tercera.",
            "Componente x: u₂v₃ − u₃v₂; componente z: u₁v₂ − u₂v₁.",
            "La componente del medio lleva un signo menos adelante: −(u₁v₃ − u₃v₁).",
          ],
          solution: sol,
          explanation: "u × v es un vector perpendicular a u y a v. Se calcula desarrollando el «determinante» de i, j, k; podés verificar que (u × v)·u = 0 y (u × v)·v = 0.",
        }),
        [
          { text: `$${vec(w)}$`, correct: true },
          { text: `$${vec(w.map((x) => -x || 0))}$`, error: { type: "vectores", message: "Calculaste v × u. El producto vectorial no es conmutativo: v × u = −(u × v)." } },
          { text: `$${vec([w[0], -w[1] || 0, w[2]])}$`, error: { type: "signos", message: "Falta el signo menos de la componente del medio (la j va con −)." } },
          { text: `$${vec(u.map((x, i) => x * v[i]))}$`, error: { type: "vectores", message: "Multiplicar componente a componente no es ningún producto de vectores. El vectorial combina componentes cruzadas." } },
        ],
      );
    }
    const tri = d >= 5;
    const val = tri ? norm(w) / 2 : norm(w);
    const ans = r2(val);
    const exact = Math.abs(val - ans) < 1e-9;
    let prompt: string;
    let pre: string[] = [];
    if (d === 6) {
      const A = randVec(r, 3, -3, 3);
      const B = add(A, u);
      const C = add(A, v);
      prompt = `Calculá el área del triángulo de vértices $A = ${vec(A)}$, $B = ${vec(B)}$ y $C = ${vec(C)}$.`;
      pre = [`AB = B − A = ${vec(u)}, AC = C − A = ${vec(v)}`];
    } else prompt = tri ? `Calculá el área del triángulo determinado por $u = ${vec(u)}$ y $v = ${vec(v)}$.` : `Calculá el área del paralelogramo determinado por $u = ${vec(u)}$ y $v = ${vec(v)}$.`;
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: prompt + (exact ? "" : " (redondeá a 2 decimales)"),
        hints: [
          "El área del paralelogramo es |u × v|.",
          tri ? "El triángulo es la mitad del paralelogramo." : "Primero calculá u × v y después su norma.",
          `u × v = ${vec(w)}.`,
        ],
        solution: [...pre, ...sol, `|u × v| = √${dot(w, w)}${Number.isInteger(norm(w)) ? ` = ${norm(w)}` : ` ≈ ${fmt(norm(w), 2)}`}`, ...(tri ? [`Área = |u × v| / 2 ≈ ${fmt(ans, 2)}`] : [])],
        explanation: "|u × v| = |u|·|v|·sen θ, que es base por altura del paralelogramo que forman u y v. El triángulo es la mitad.",
        frequentErrors: fe(ans, 0.011, [
          { match: tri ? r2(norm(w)) : r2(norm(w) / 2), type: "formula", message: tri ? "Ese es el área del paralelogramo; el triángulo es la mitad." : "Dividiste por 2: eso sería un triángulo. El paralelogramo es |u × v|." },
          { match: dot(w, w), type: "calculo", message: "Te faltó la raíz: |w| = √(w₁² + w₂² + w₃²)." },
          { match: Math.abs(dot(u, v)), type: "vectores", message: "Eso es el producto escalar. El área sale del producto VECTORIAL." },
        ]),
      }),
      kind: "numeric",
      answer: ans,
      tolerance: exact ? undefined : 0.011,
    } as NumericExercise;
  },
};

export const anguloVectores: Generator = {
  id: "alg-angulo-vectores",
  topicId: "t-alg-angulo-proyeccion",
  description: "Ángulo entre dos vectores con el producto escalar",
  generate(seed, d) {
    const r = rng(seed);
    const dim = d <= 2 ? 2 : 3;
    let u: number[], v: number[];
    if (d === 1) {
      [u, v] = r.pick([[[1, 0], [1, 1]], [[2, 0], [0, 3]], [[1, 1], [-1, 1]], [[3, 0], [-2, 0]], [[0, 2], [1, 1]], [[1, 1], [2, 0]]]);
    } else {
      do {
        u = randVec(r, dim, -4, 4);
        v = randVec(r, dim, -4, 4);
      } while (isZero(u) || isZero(v));
    }
    const p = dot(u, v);
    const c = p / (norm(u) * norm(v));
    const deg = (Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI;
    const ans = Math.round(deg * 10) / 10;
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Hallá el ángulo entre $u = ${vec(u)}$ y $v = ${vec(v)}$, en grados (redondeá a 1 decimal).`,
        hints: ["cos θ = (u·v) / (|u|·|v|).", `u·v = ${fmt(p)}; |u| = √${dot(u, u)}; |v| = √${dot(v, v)}.`, "θ = arccos(...) con la calculadora en grados; da entre 0° y 180°."],
        solution: [`u·v = ${u.map((x, i) => `${par(x)}·${par(v[i])}`).join(" + ")} = ${fmt(p)}`, `|u| = √${dot(u, u)}, |v| = √${dot(v, v)}`, `cos θ = ${fmt(p)} / (√${dot(u, u)}·√${dot(v, v)}) ≈ ${fmt(c, 4)}`, `θ ≈ ${fmt(ans, 1)}°`],
        explanation: "De u·v = |u||v| cos θ se despeja cos θ. El ángulo entre vectores está siempre entre 0° y 180°: si u·v < 0 es obtuso; si u·v = 0, recto.",
        frequentErrors: fe(ans, 0.15, [
          { match: r2((deg * Math.PI) / 180), type: "unidades", message: "Ese valor está en radianes. Poné la calculadora en grados (DEG)." },
          { match: Math.round((180 - deg) * 10) / 10, type: "signos", message: "Revisá el signo de u·v: si el producto escalar es negativo, el ángulo es obtuso." },
        ]),
      }),
      kind: "numeric",
      answer: ans,
      tolerance: 0.15,
    } as NumericExercise;
  },
};

const INT_NORM: number[][] = [[3, 4], [4, 3], [1, 2, 2], [2, 1, 2], [2, 2, 1], [2, 3, 6], [0, 3, 4], [4, 0, 3], [1, 0, 0], [0, 1, 0]];

export const proyeccion: Generator = {
  id: "alg-proyeccion",
  topicId: "t-alg-angulo-proyeccion",
  description: "Proyección ortogonal de un vector sobre otro",
  generate(seed, d) {
    const r = rng(seed);
    const pool = d <= 2 ? INT_NORM.filter((x) => x.length === 2).concat([[1, 0], [0, 1]].map((x) => x)) : INT_NORM.filter((x) => x.length === 3);
    let u = [...r.pick(pool)];
    if (u.length === 2 && u.every((x) => x === 0)) u = [3, 4];
    u = u.map((x) => (r.bool() ? -x : x) || 0);
    let v: number[];
    do v = randVec(r, u.length, -5, 5);
    while (dot(u, v) === 0 || isZero(v));
    const p = dot(u, v);
    const n2 = dot(u, u);
    const nu = Math.round(norm(u));
    const orto = d >= 5;
    const projNums = u.map((x) => p * x);
    const proj = vecFrac(projNums, n2);
    const perp = vecFrac(v.map((x, i) => x * n2 - projNums[i]), n2);
    const wrongNorm = vecFrac(projNums, nu);
    const vv = dot(v, v);
    const swapped = vecFrac(v.map((x) => p * x), vv);
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: orto
          ? `Descomponé $v = ${vec(v)}$ como $v = p + w$, con $p$ paralelo a $u = ${vec(u)}$ y $w$ perpendicular a $u$. ¿Cuánto vale $w$?`
          : `Calculá la proyección ortogonal de $v = ${vec(v)}$ sobre $u = ${vec(u)}$.`,
        hints: ["proy_u(v) = (v·u / |u|²) · u.", `v·u = ${fmt(p)} y |u|² = ${n2}.`, orto ? `p = proy_u(v) = ${proj}; después w = v − p.` : `Multiplicá u por ${fracText(p, n2)}.`],
        solution: [`v·u = ${fmt(p)}, |u|² = ${n2}`, `proy_u(v) = ${fracText(p, n2)}·${vec(u)} = ${proj}`, ...(orto ? [`w = v − p = ${perp}`] : [])],
        explanation: "La proyección es la «sombra» de v sobre la recta de u: un vector en la dirección de u de longitud |v| cos θ. Lo que sobra, v − proy, es perpendicular a u.",
      }),
      orto
        ? [
            { text: `$${perp}$`, correct: true },
            { text: `$${proj}$`, error: { type: "vectores", message: "Ese es p, la parte paralela a u. w = v − p es la parte perpendicular." } },
            { text: `$${vecFrac(v.map((x, i) => x * n2 + projNums[i]), n2)}$`, error: { type: "signos", message: "w = v − p, no v + p." } },
          ]
        : [
            { text: `$${proj}$`, correct: true },
            { text: `$${wrongNorm}$`, error: { type: "formula", message: `Se divide por |u|² = ${n2}, no por |u| = ${nu}. Si dividís por |u| tenés que multiplicar por el versor u/|u|.` } },
            { text: `$${swapped}$`, error: { type: "vectores", message: "Proyectaste u sobre v. La proyección de v sobre u tiene la dirección de u." } },
            { text: `$${fracText(p, n2)}$`, error: { type: "conceptual", message: "Ese es solo el coeficiente: la proyección es un vector, ese número por u." } },
          ],
    );
  },
};

// ───────────────────────── alg-2 · Rectas y planos ─────────────────────────

export const rectaPertenencia: Generator = {
  id: "alg-recta-pertenencia",
  topicId: "t-alg-rectas",
  description: "Puntos de una recta en ℝ³ dada en forma vectorial o paramétrica",
  generate(seed, d) {
    const r = rng(seed);
    const P = randVec(r, 3, -4, 4);
    const D = [r.nz(-3, 3), r.int(-3, 3), r.nz(-3, 3)];
    const t0 = r.nz(-3, 3);
    const R = add(P, D, t0);
    const form = d <= 2 ? "vec" : d <= 4 ? "param" : "sim";
    if (form === "sim" && D[1] === 0) D[1] = r.pick([1, -1, 2]);
    const R2 = add(P, D, t0);
    R[1] = R2[1];
    const shift = (v: string, p: number) => (p === 0 ? v : `${v} ${p > 0 ? "−" : "+"} ${fmt(Math.abs(p))}`);
    const lt =
      form === "vec"
        ? `$L: X = ${vec(P)} + t·${vec(D)}$`
        : form === "param"
          ? `$L: x = ${aff(P[0], D[0])}, y = ${aff(P[1], D[1])}, z = ${aff(P[2], D[2])}$`
          : `$L: \\frac{${shift("x", P[0])}}{${fmt(D[0])}} = \\frac{${shift("y", P[1])}}{${fmt(D[1])}} = \\frac{${shift("z", P[2])}}{${fmt(D[2])}}$`;
    const ans = R[1];
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Sea ${lt}. ¿Qué valor de $k$ hace que el punto $(${fmt(R[0])}, k, ${fmt(R[2])})$ pertenezca a L?`,
        hints: [
          "Un punto está en L si existe un valor de t que da sus tres coordenadas.",
          `Usá la coordenada x: ${fmt(P[0])} + ${par(D[0])}t = ${fmt(R[0])}.`,
          `Con ese t (t = ${fmt(t0)}), calculá y = ${fmt(P[1])} + ${par(D[1])}·t.`,
        ],
        solution: [`x: ${fmt(P[0])} + ${par(D[0])}t = ${fmt(R[0])} ⇒ t = ${fmt(t0)}`, `z: ${fmt(P[2])} + ${par(D[2])}·${par(t0)} = ${fmt(R[2])} ✓ (es consistente)`, `y: k = ${fmt(P[1])} + ${par(D[1])}·${par(t0)} = ${fmt(ans)}`],
        explanation: "En X = P + tD, cada valor del parámetro t da un punto de la recta. Para saber si un punto está, se busca el t que lo produce; ese mismo t tiene que servir para las tres coordenadas.",
        frequentErrors: fe(ans, 1e-9, [
          { match: t0, type: "interpretacion", message: `Ese es el valor del parámetro t. Lo que se pide es la coordenada y del punto: y = ${fmt(P[1])} + ${par(D[1])}·t.` },
          { match: P[1] + D[1], type: "conceptual", message: "Usaste t = 1. El valor de t se obtiene de la coordenada x (o z) del punto." },
        ]),
      }),
      kind: "numeric",
      answer: ans,
    } as NumericExercise;
  },
};

export const planoEcuacion: Generator = {
  id: "alg-plano-ecuacion",
  topicId: "t-alg-planos",
  description: "Ecuación del plano a partir de un punto y una normal",
  generate(seed, d) {
    const r = rng(seed);
    let n: number[];
    do n = randVec(r, 3, -4, 4);
    while (isZero(n) || n.filter((x) => x !== 0).length < (d <= 2 ? 1 : 2));
    const P = randVec(r, 3, -4, 4);
    let ctx: string;
    let pre: string[] = [];
    let copied = NaN;
    if (d <= 2) ctx = `pasa por $P = ${vec(P)}$ y tiene vector normal $n = ${vec(n)}$`;
    else if (d <= 4) {
      const e = dot(n, P) + r.nz(-6, 6);
      copied = e;
      ctx = `pasa por $P = ${vec(P)}$ y es paralelo al plano $${eqTxt(n, e)}$`;
      pre = [`Planos paralelos tienen la misma normal: n = ${vec(n)}`];
    } else if (d === 5) {
      const Q = randVec(r, 3, -3, 3);
      ctx = `pasa por $P = ${vec(P)}$ y es perpendicular a la recta $X = ${vec(Q)} + t·${vec(n)}$`;
      pre = [`La dirección de la recta sirve como normal: n = ${vec(n)}`];
    } else {
      let u: number[], v: number[];
      do {
        u = randVec(r, 3, -2, 2);
        v = randVec(r, 3, -2, 2);
        n = cross(u, v);
      } while (isZero(n));
      ctx = `pasa por $A = ${vec(P)}$, $B = ${vec(add(P, u))}$ y $C = ${vec(add(P, v))}$. Usá como normal $n = AB × AC$`;
      pre = [`AB = ${vec(u)}, AC = ${vec(v)}`, `n = AB × AC = ${vec(n)}`];
    }
    const ans = dot(n, P);
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `El plano π ${ctx}. Escrito como $ax + by + cz = d$ con $(a, b, c) = n$, ¿cuánto vale $d$?`,
        hints: [
          "Ecuación del plano: n·X = n·P (todos los X con X − P perpendicular a n).",
          d <= 2 ? "La normal ya la tenés: falta d." : d <= 4 ? "Dos planos paralelos tienen la misma normal (pero otro d)." : d === 5 ? "Si el plano es perpendicular a la recta, el director de la recta es normal al plano." : "La normal es perpendicular a AB y a AC: el producto vectorial.",
          "Reemplazá el punto en ax + by + cz: eso es d.",
        ],
        solution: [...pre, `π: ${linTxt(n, ["x", "y", "z"])} = d`, `d = ${n.map((x, i) => `${par(x)}·${par(P[i])}`).join(" + ")} = ${fmt(ans)}`, `π: ${eqTxt(n, ans)}`],
        explanation: "Un punto X está en el plano si X − P es perpendicular a la normal: n·(X − P) = 0, o sea n·X = n·P. Los coeficientes de x, y, z son las componentes de la normal.",
        frequentErrors: fe(ans, 1e-9, [{ match: copied, type: "conceptual", message: "Copiaste el d del otro plano. Si fuera el mismo d serían el mismo plano: recalculalo con el punto P." }]),
      }),
      kind: "numeric",
      answer: ans,
    } as NumericExercise;
  },
};

export const rectaPlanoInterseccion: Generator = {
  id: "alg-recta-plano-interseccion",
  topicId: "t-alg-planos",
  description: "Intersección de una recta y un plano en ℝ³",
  generate(seed, d) {
    const r = rng(seed);
    let n: number[], D: number[];
    do {
      n = randVec(r, 3, -3, 3);
      D = randVec(r, 3, -3, 3);
    } while (isZero(n) || isZero(D) || dot(n, D) === 0);
    const P = randVec(r, 3, -4, 4);
    const t0 = r.nz(-3, 3);
    const Q = add(P, D, t0);
    const k = dot(n, Q);
    const askT = d === 1;
    const coord = askT ? -1 : r.int(0, 2);
    const name = ["x", "y", "z"][coord] ?? "t";
    const ans = askT ? t0 : Q[coord];
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `La recta $L: X = ${vec(P)} + t·${vec(D)}$ corta al plano $π: ${eqTxt(n, k)}$ en un punto Q. ${askT ? "¿Para qué valor de t?" : `¿Cuál es la coordenada ${name} de Q?`}`,
        hints: [
          "Escribí el punto genérico de L: (x, y, z) en función de t.",
          "Reemplazalo en la ecuación del plano: queda una ecuación en t.",
          `Debería darte ${fmt(dot(n, D))}t ${dot(n, P) >= 0 ? "+" : "−"} ${fmt(Math.abs(dot(n, P)))} = ${fmt(k)}.`,
        ],
        solution: [
          `Punto de L: (${aff(P[0], D[0])}, ${aff(P[1], D[1])}, ${aff(P[2], D[2])})`,
          `En π: ${fmt(dot(n, D))}t + ${par(dot(n, P))} = ${fmt(k)} ⇒ t = ${fmt(t0)}`,
          `Q = ${vec(Q)}`,
          ...(askT ? [] : [`Coordenada ${name}: ${fmt(ans)}`]),
        ],
        explanation: "Los puntos de la recta dependen de t; el que está en el plano es el que cumple su ecuación. Si n·D = 0 la recta es paralela al plano (o está contenida) y no hay un único punto.",
        frequentErrors: fe(ans, 1e-9, askT ? [] : [
          { match: t0, type: "interpretacion", message: `Ese es el valor de t. Reemplazalo en la recta para obtener Q y su coordenada ${name}.` },
          { match: P[coord], type: "conceptual", message: "Esa coordenada es la del punto de paso P (t = 0), que no está en el plano." },
        ]),
      }),
      kind: "numeric",
      answer: ans,
    } as NumericExercise;
  },
};

const POS_PP = ["Paralelos (no coincidentes)", "Coincidentes (el mismo plano)", "Perpendiculares", "Se cortan en una recta, sin ser perpendiculares"];
const POS_LP = ["La recta está contenida en el plano", "La recta es paralela al plano (no lo toca)", "La recta es perpendicular al plano", "La recta corta al plano en un punto, sin ser perpendicular"];

export const posicionRelativa: Generator = {
  id: "alg-posicion-relativa",
  topicId: "t-alg-posiciones-distancias",
  description: "Posición relativa de dos planos o de una recta y un plano",
  generate(seed, d) {
    const r = rng(seed);
    let n: number[];
    do n = randVec(r, 3, -3, 3);
    while (n.filter((x) => x !== 0).length < 2);
    const e = r.int(-6, 6);
    const kind = r.int(0, 3);
    const lp = d >= 4 && (d <= 5 || r.bool());
    let prompt: string, why: string;
    const lam = r.pick([2, -1, 3, -2]);
    if (!lp) {
      let n2: number[], e2: number;
      if (kind <= 1) {
        n2 = n.map((x) => lam * x);
        e2 = kind === 1 ? lam * e : lam * e + r.nz(-3, 3);
        why = `n₂ = ${fmt(lam)}·n₁: normales paralelas. ${kind === 1 ? `Además ${fmt(e2)} = ${fmt(lam)}·${par(e)}: es la misma ecuación multiplicada.` : `Pero ${fmt(e2)} ≠ ${fmt(lam)}·${par(e)}: no es la misma ecuación.`}`;
      } else if (kind === 2) {
        let w: number[];
        do {
          w = randVec(r, 3, -2, 2);
          n2 = reduceVec(cross(n, w));
        } while (isZero(n2));
        e2 = r.int(-6, 6);
        why = `n₁·n₂ = 0: las normales son perpendiculares.`;
      } else {
        do n2 = randVec(r, 3, -3, 3);
        while (isZero(n2) || isZero(cross(n, n2)) || dot(n, n2) === 0);
        e2 = r.int(-6, 6);
        why = `Las normales no son paralelas (no son múltiplo una de otra) y n₁·n₂ = ${fmt(dot(n, n2))} ≠ 0.`;
      }
      prompt = `¿Cuál es la posición relativa de $π_1: ${eqTxt(n, e)}$ y $π_2: ${eqTxt(n2, e2)}$?`;
      const msgs = [
        "Paralelos requiere normales proporcionales y ecuaciones NO proporcionales.",
        "Coincidentes requiere que TODA la ecuación (incluido el término independiente) sea proporcional.",
        "Son perpendiculares si el producto escalar de las normales da 0.",
        "Se cortan en una recta cuando las normales no son paralelas; y no son perpendiculares si n₁·n₂ ≠ 0.",
      ];
      return choice(
        r,
        base({
          gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
          prompt,
          hints: ["Leé las normales: son los coeficientes de x, y, z.", "¿Son múltiplo una de la otra? Si sí: paralelos o coincidentes.", "Si no, calculá n₁·n₂: si da 0, perpendiculares."],
          solution: [`n₁ = ${vec(n)}, n₂ = ${vec(n2)}`, why, `Respuesta: ${POS_PP[kind]}`],
          explanation: "La posición de dos planos se decide con sus normales: proporcionales ⇒ paralelos o coincidentes (según el término independiente); si no, se cortan en una recta, perpendiculares cuando n₁·n₂ = 0.",
        }),
        POS_PP.map((t, i) => (i === kind ? { text: t, correct: true } : { text: t, error: { type: "vectores" as const, message: msgs[i] } })),
      );
    }
    let D: number[];
    const P = randVec(r, 3, -3, 3);
    let k = dot(n, P);
    if (kind <= 1) {
      let w: number[];
      do {
        w = randVec(r, 3, -2, 2);
        D = reduceVec(cross(n, w));
      } while (isZero(D));
      if (kind === 1) k += r.nz(-4, 4);
      why = `d·n = ${fmt(dot(D, n))} = 0: la recta es paralela al plano. ${kind === 0 ? `Su punto ${vec(P)} cumple la ecuación (${fmt(dot(n, P))} = ${fmt(k)}): está contenida.` : `Su punto ${vec(P)} no cumple la ecuación (${fmt(dot(n, P))} ≠ ${fmt(k)}).`}`;
    } else if (kind === 2) {
      D = n.map((x) => lam * x);
      k += r.nz(-4, 4);
      why = `d = ${fmt(lam)}·n: la dirección de la recta es la de la normal.`;
    } else {
      do D = randVec(r, 3, -3, 3);
      while (isZero(D) || dot(D, n) === 0 || isZero(cross(D, n)));
      k += r.nz(-4, 4);
      why = `d·n = ${fmt(dot(D, n))} ≠ 0 (la corta) y d no es múltiplo de n (no es perpendicular).`;
    }
    const msgs = [
      "Contenida requiere d·n = 0 Y que un punto de la recta cumpla la ecuación del plano.",
      "Paralela requiere d·n = 0 y que el punto de la recta NO cumpla la ecuación del plano.",
      "Perpendicular al plano significa que d es paralelo a la normal (múltiplo de n).",
      "Si d·n ≠ 0 la recta corta al plano; es perpendicular solo si d es múltiplo de n.",
    ];
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `¿Cuál es la posición relativa de $L: X = ${vec(P)} + t·${vec(D)}$ y $π: ${eqTxt(n, k)}$?`,
        hints: ["Compará el director d de la recta con la normal n del plano.", "d·n = 0 ⇒ la recta es paralela al plano (o está contenida).", "d múltiplo de n ⇒ perpendicular."],
        solution: [`d = ${vec(D)}, n = ${vec(n)}`, why, `Respuesta: ${POS_LP[kind]}`],
        explanation: "Si d·n = 0 la recta va «a lo largo» del plano: contenida si un punto suyo está en el plano, paralela si no. Si d ∥ n, es perpendicular. En otro caso lo corta en un único punto.",
      }),
      POS_LP.map((t, i) => (i === kind ? { text: t, correct: true } : { text: t, error: { type: "vectores" as const, message: msgs[i] } })),
    );
  },
};

const NICE_NORMALS: number[][] = [[1, 2, 2], [2, 1, 2], [2, 2, 1], [2, 3, 6], [0, 3, 4], [4, 0, 3], [1, 4, 8], [6, 2, 3], [0, 0, 1], [3, 0, 4]];

export const distanciaPuntoPlano: Generator = {
  id: "alg-distancia-punto-plano",
  topicId: "t-alg-posiciones-distancias",
  description: "Distancia de un punto a un plano y entre planos paralelos",
  generate(seed, d) {
    const r = rng(seed);
    let n: number[];
    if (d <= 3) n = r.pick(NICE_NORMALS).map((x) => (r.bool() ? -x : x) || 0);
    else
      do n = randVec(r, 3, -4, 4);
      while (n.filter((x) => x !== 0).length < 2);
    const P = randVec(r, 3, -5, 5);
    let e = r.int(-8, 8);
    if (dot(n, P) === e) e += 1;
    const parallel = d === 6;
    const num = Math.abs(dot(n, P) - e);
    const nn = norm(n);
    const val = num / nn;
    const ans = r2(val);
    const exact = Math.abs(val - ans) < 1e-9;
    const e1 = dot(n, P);
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: (parallel
          ? `Calculá la distancia entre los planos paralelos $${eqTxt(n, e1)}$ y $${eqTxt(n, e)}$.`
          : `Calculá la distancia del punto $P = ${vec(P)}$ al plano $π: ${eqTxt(n, e)}$.`) + (exact ? "" : " (redondeá a 2 decimales)"),
        hints: [
          "d(P, π) = |a·x₀ + b·y₀ + c·z₀ − d| / √(a² + b² + c²).",
          parallel ? "Elegí un punto de un plano y medí su distancia al otro; o usá |d₁ − d₂| / |n|." : `Numerador: |${fmt(e1)} − ${par(e)}| = ${fmt(num)}.`,
          `|n| = √${dot(n, n)}${Number.isInteger(nn) ? ` = ${nn}` : ""}.`,
        ],
        solution: [parallel ? `|d₁ − d₂| = |${fmt(e1)} − ${par(e)}| = ${fmt(num)}` : `n·P − d = ${fmt(e1)} − ${par(e)} = ${fmt(e1 - e)}`, `|n| = √${dot(n, n)}${Number.isInteger(nn) ? ` = ${nn}` : ""}`, `distancia = ${fmt(num)} / √${dot(n, n)} ${exact ? "=" : "≈"} ${fmt(ans, 2)}`],
        explanation: "La distancia más corta se mide sobre la perpendicular, es decir, en la dirección de n. Por eso se proyecta el vector entre P y un punto del plano sobre la normal: |n·P − d| / |n|.",
        frequentErrors: fe(ans, 0.011, [
          { match: num, type: "formula", message: `Te faltó dividir por |n| = √${dot(n, n)}.` },
          { match: r2(num / dot(n, n)), type: "formula", message: "Se divide por |n| (con raíz), no por |n|²." },
          { match: r2((e1 + e) / nn), type: "signos", message: "En el numerador va n·P − d (con el d pasado al mismo lado), no n·P + d." },
        ]),
      }),
      kind: "numeric",
      answer: ans,
      tolerance: exact ? undefined : 0.011,
    } as NumericExercise;
  },
};

// ───────────────────────── alg-3 · Matrices y sistemas ─────────────────────────

const randMat = (r: Rng, m: number, n: number, lo: number, hi: number) => Array.from({ length: m }, () => randVec(r, n, lo, hi));
const matMul = (A: number[][], B: number[][]) => A.map((row) => B[0].map((_, j) => row.reduce((s, a, k) => s + a * B[k][j], 0)));

export const matrizProducto: Generator = {
  id: "alg-matriz-producto",
  topicId: "t-alg-matrices",
  description: "Elemento de un producto de matrices (fila por columna)",
  generate(seed, d) {
    const r = rng(seed);
    const [m, n, p] = byDifficulty(d, [[2, 2, 2], [2, 2, 2], [2, 3, 2], [3, 2, 3], [3, 3, 3], [2, 3, 3]] as [[number, number, number], [number, number, number], [number, number, number], [number, number, number], [number, number, number], [number, number, number]]);
    const lim = d <= 2 ? 3 : 4;
    const A = randMat(r, m, n, d === 1 ? 0 : -lim, lim);
    const B = randMat(r, n, p, d === 1 ? 0 : -lim, lim);
    const i = r.int(1, m);
    const j = r.int(1, p);
    const C = matMul(A, B);
    const ans = C[i - 1][j - 1];
    const row = A[i - 1];
    const col = B.map((x) => x[j - 1]);
    const errs: FrequentError[] = [];
    if (m === n && n === p) {
      errs.push({ match: A[i - 1][j - 1] * B[i - 1][j - 1], type: "conceptual", message: "El producto de matrices no es elemento a elemento: c_ij es la fila i de A por la columna j de B." });
      errs.push({ match: dot(A[i - 1], B[j - 1]), type: "conceptual", message: "Multiplicaste fila por fila. Es fila i de A por COLUMNA j de B." });
      errs.push({ match: matMul(B, A)[i - 1][j - 1], type: "conceptual", message: "Calculaste B·A. El producto de matrices no es conmutativo: A·B ≠ B·A en general." });
    }
    if (j <= m && i <= p) errs.push({ match: C[j - 1][i - 1], type: "interpretacion", message: `Ese es c${sub(j, i)}. El primer subíndice es la fila y el segundo la columna.` });
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Sean $A = ${mat(A)}$ (${m}×${n}) y $B = ${mat(B)}$ (${n}×${p}), con las filas separadas por «;». Si $C = A·B$, ¿cuánto vale $c${sub(i, j)}$?`,
        hints: [
          `c${sub(i, j)} usa la fila ${i} de A y la columna ${j} de B.`,
          `Fila ${i} de A: ${vec(row)}; columna ${j} de B: ${vec(col)}.`,
          "Multiplicá elemento a elemento y sumá (como un producto escalar).",
        ],
        solution: [`Fila ${i} de A: ${vec(row)}`, `Columna ${j} de B: ${vec(col)}`, `c${sub(i, j)} = ${row.map((x, k) => `${par(x)}·${par(col[k])}`).join(" + ")} = ${fmt(ans)}`],
        explanation: "En A·B, cada elemento c_ij es el producto escalar de la fila i de A con la columna j de B. Por eso hace falta que las columnas de A sean tantas como las filas de B.",
        frequentErrors: fe(ans, 1e-9, errs),
      }),
      kind: "numeric",
      answer: ans,
    } as NumericExercise;
  },
};

/** Arma A = L·U con L unitaria inferior y U triangular superior, para que Gauss dé enteros. */
function luSystem(r: Rng, n: number) {
  const U = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (j < i ? 0 : j === i ? r.pick([1, 1, -1, 2]) : r.int(-3, 3))));
  const L = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (j === i ? 1 : j < i ? r.int(-2, 2) : 0)));
  const A = matMul(L, U);
  const x = randVec(r, n, -4, 4);
  const b = A.map((row) => dot(row, x));
  const c = U.map((row) => dot(row, x));
  return { L, U, A, x, b, c };
}

export const gaussSistema: Generator = {
  id: "alg-gauss",
  topicId: "t-alg-gauss",
  description: "Resolver un sistema lineal por eliminación de Gauss",
  generate(seed, d) {
    const r = rng(seed);
    const n = d <= 2 ? 2 : 3;
    const vars = n === 2 ? ["x", "y"] : ["x", "y", "z"];
    let sys = luSystem(r, n);
    while (sys.A.some((row) => row.every((x) => x === 0))) sys = luSystem(r, n);
    const { L, U, A, x, b, c } = sys;
    const k = d <= 2 ? n - 1 : r.int(0, n - 1);
    const ans = x[k];
    const ops: string[] = [];
    for (let j = 0; j < n; j++)
      for (let i = j + 1; i < n; i++) if (L[i][j] !== 0) ops.push(`F${i + 1} → F${i + 1} ${L[i][j] > 0 ? "−" : "+"} ${Math.abs(L[i][j]) === 1 ? "" : `${Math.abs(L[i][j])}·`}F${j + 1}`);
    const errs: FrequentError[] = x.map((v, idx) => ({ match: v, type: "interpretacion" as const, message: `Ese es el valor de ${vars[idx]}. Se pide ${vars[k]}.` })).filter((_, idx) => idx !== k);
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Resolvé por Gauss el sistema $\\{ ${A.map((row, i) => eqTxt(row, b[i], vars)).join(" ; ")} \\}$ y escribí el valor de $${vars[k]}$.`,
        hints: [
          "Usá la primera ecuación para eliminar la x de las demás (restando múltiplos de la fila 1).",
          n === 3 ? "Después usá la segunda para eliminar la y de la tercera: queda un sistema triangular." : "La segunda ecuación queda con una sola incógnita.",
          `Sistema escalonado: ${U.map((row, i) => eqTxt(row, c[i], vars)).join(" ; ")}. Despejá de abajo hacia arriba.`,
        ],
        solution: [...(ops.length ? [`Operaciones: ${ops.join(", ")}`] : ["El sistema ya está escalonado"]), `Escalonado: ${U.map((row, i) => eqTxt(row, c[i], vars)).join(" ; ")}`, `Sustitución hacia atrás: ${vars.map((v, i) => `${v} = ${fmt(x[i])}`).join(", ")}`, `${vars[k]} = ${fmt(ans)}`],
        explanation: "Las operaciones elementales (sumar a una fila un múltiplo de otra, multiplicar una fila por un número no nulo, intercambiar filas) no cambian las soluciones. Gauss las usa para llegar a un sistema triangular, que se resuelve de abajo hacia arriba.",
        frequentErrors: fe(ans, 1e-9, errs),
      }),
      kind: "numeric",
      answer: ans,
    } as NumericExercise;
  },
};

const CLASES = ["SCD: solución única", "SCI: infinitas soluciones", "SI: no tiene solución"];
const CLASE_MSG = [
  "Para que sea SCD tiene que quedar un pivote en cada incógnita (ninguna fila 0 = 0 ni 0 = k).",
  "SCI aparece cuando una fila se anula por completo (0 = 0) y quedan menos ecuaciones útiles que incógnitas, sin contradicciones.",
  "SI aparece cuando se llega a una contradicción del tipo 0 = k con k ≠ 0.",
];

export const sistemaClasificar: Generator = {
  id: "alg-sistema-clasificar",
  topicId: "t-alg-sistemas-clasificacion",
  description: "Clasificar sistemas lineales en SCD, SCI o SI",
  generate(seed, d) {
    const r = rng(seed);
    const kind = r.int(0, 2);
    let prompt: string, sol: string[];
    if (d <= 3) {
      const p1 = r.nz(-3, 3), p2 = r.nz(-3, 3), p3 = r.nz(-3, 3);
      const rows = [[p1, r.int(-3, 3), r.int(-3, 3)], [0, p2, r.int(-3, 3)]];
      const rhs = [r.int(-6, 6), r.int(-6, 6)];
      const last = kind === 0 ? `${linTxt([0, 0, p3], ["x", "y", "z"])} = ${fmt(r.int(-6, 6))}` : kind === 1 ? "0z = 0" : `0z = ${fmt(r.nz(-6, 6))}`;
      prompt = `Después de aplicar Gauss, un sistema quedó así: $\\{ ${eqTxt(rows[0], rhs[0])} ; ${eqTxt(rows[1], rhs[1])} ; ${last} \\}$. ¿Cómo se clasifica?`;
      sol = [kind === 0 ? `La última ecuación tiene pivote (${fmt(p3)} ≠ 0): z queda determinada, y luego y y x.` : kind === 1 ? "La última ecuación es 0 = 0: no aporta nada. Quedan 2 ecuaciones útiles para 3 incógnitas: z queda libre." : "La última ecuación dice 0 = número distinto de 0: contradicción."];
    } else if (d <= 4) {
      const a = r.nz(-4, 4), b = r.nz(-4, 4), c = r.int(-6, 6);
      const lam = r.pick([2, -1, 3, -2]);
      let row2: number[], c2: number;
      if (kind === 0) {
        do row2 = [r.nz(-4, 4), r.nz(-4, 4)];
        while (a * row2[1] - b * row2[0] === 0);
        c2 = r.int(-6, 6);
      } else {
        row2 = [lam * a, lam * b];
        c2 = kind === 1 ? lam * c : lam * c + r.nz(-3, 3);
      }
      prompt = `Clasificá el sistema $\\{ ${eqTxt([a, b], c, ["x", "y"])} ; ${eqTxt(row2, c2, ["x", "y"])} \\}$.`;
      sol = [kind === 0 ? `Los coeficientes no son proporcionales (det = ${fmt(a * row2[1] - b * row2[0])} ≠ 0): rectas que se cortan en un punto.` : `La segunda fila de coeficientes es ${fmt(lam)} veces la primera. ${kind === 1 ? `Y ${fmt(c2)} = ${fmt(lam)}·${par(c)}: es la misma recta.` : `Pero ${fmt(c2)} ≠ ${fmt(lam)}·${par(c)}: rectas paralelas distintas.`}`];
    } else {
      let r1: number[], r2v: number[];
      do {
        r1 = randVec(r, 3, -3, 3);
        r2v = randVec(r, 3, -3, 3);
      } while (isZero(cross(r1, r2v)));
      const c1 = r.int(-5, 5), c2 = r.int(-5, 5);
      let r3: number[], c3: number;
      if (kind === 0) {
        do r3 = randVec(r, 3, -3, 3);
        while (det3([r1, r2v, r3]) === 0);
        c3 = r.int(-5, 5);
      } else {
        const al = r.pick([1, 2, -1]), be = r.pick([1, -1, 2]);
        r3 = r1.map((x, i) => al * x + be * r2v[i]);
        c3 = al * c1 + be * c2 + (kind === 2 ? r.nz(-3, 3) : 0);
        if (isZero(r3)) r3 = add(r1, r2v);
      }
      if (kind !== 0 && isZero(r3)) return sistemaClasificar.generate(seed + 1, d);
      prompt = `Clasificá el sistema $\\{ ${eqTxt(r1, c1)} ; ${eqTxt(r2v, c2)} ; ${eqTxt(r3, c3)} \\}$.`;
      sol =
        kind === 0
          ? [`El determinante de la matriz de coeficientes es ${fmt(det3([r1, r2v, r3]))} ≠ 0.`, "Gauss deja un pivote por incógnita."]
          : ["La tercera fila de coeficientes es combinación de las dos primeras: al escalonar se anula.", kind === 1 ? "El término independiente también se anula: queda 0 = 0." : "Pero el término independiente no: queda 0 = k con k ≠ 0."];
    }
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt,
        hints: ["Escalonalo (si no lo está) y mirá las últimas filas.", "Una fila 0 = 0 no aporta información; una fila 0 = k (k ≠ 0) es una contradicción.", "Si hay un pivote por incógnita y ninguna contradicción, la solución es única."],
        solution: [...sol, `Clasificación: ${CLASES[kind]}`],
        explanation: "SCD (compatible determinado): una única solución. SCI (compatible indeterminado): infinitas, con al menos una variable libre. SI (incompatible): ninguna, aparece una contradicción 0 = k.",
      }),
      CLASES.map((t, i) => (i === kind ? { text: t, correct: true } : { text: t, error: { type: "conceptual" as const, message: CLASE_MSG[i] } })),
    );
  },
};

export const sistemaParametro: Generator = {
  id: "alg-sistema-parametro",
  topicId: "t-alg-sistemas-clasificacion",
  description: "Sistemas lineales 2×2 con un parámetro k",
  generate(seed, d) {
    const r = rng(seed);
    const a = r.nz(-4, 4), b = r.nz(-4, 4), c = r.int(-6, 6);
    const lam = r.pick([2, -1, 3, -2, 4]);
    const k0 = lam * b;
    const da = lam * a;
    const consistent = r.bool();
    const e = consistent ? lam * c : lam * c + r.nz(-4, 4);
    const sysTxt = `\\{ ${eqTxt([a, b], c, ["x", "y"])} ; ${linTxt([da], ["x"])} + ky = ${fmt(e)} \\}`;
    if (d <= 3) {
      return {
        ...base({
          gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
          prompt: `¿Para qué valor de $k$ el sistema $${sysTxt}$ **no** tiene solución única?`,
          hints: ["No hay solución única cuando el determinante de los coeficientes es 0.", `det = ${par(a)}·k − ${par(b)}·${par(da)}.`, `Igualá a 0: ${fmt(a)}k = ${fmt(b * da)}.`],
          solution: [`det = ${par(a)}·k − ${par(b)}·${par(da)} = ${linTxt([a], ["k"])} ${b * da > 0 ? "−" : "+"} ${fmt(Math.abs(b * da))}`, `det = 0 ⇔ k = ${fmt(b * da)} / ${par(a)} = ${fmt(k0)}`, `Para k = ${fmt(k0)} las filas de coeficientes son proporcionales; para k ≠ ${fmt(k0)} es SCD.`],
          explanation: "Un sistema cuadrado tiene solución única exactamente cuando el determinante de la matriz de coeficientes es distinto de 0. Si det = 0, es SCI o SI según los términos independientes.",
          frequentErrors: fe(k0, 1e-9, [{ match: b, type: "conceptual", message: `Copiaste el coeficiente de y de la primera fila. Como la x de la segunda es ${fmt(lam)} veces la de la primera, k tiene que ser ${fmt(lam)}·${par(b)}.` }]),
        }),
        kind: "numeric",
        answer: k0,
      } as NumericExercise;
    }
    const kVal = d === 6 && r.bool() ? k0 + r.nz(-2, 2) : k0;
    const kind = kVal !== k0 ? 0 : consistent ? 1 : 2;
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Dado el sistema $${sysTxt}$, ¿cómo se clasifica para $k = ${fmt(kVal)}$?`,
        hints: ["Calculá el determinante de los coeficientes para ese k.", "Si det ≠ 0 es SCD. Si det = 0, compará los términos independientes.", `Para k = ${fmt(k0)} la segunda fila de coeficientes es ${fmt(lam)} veces la primera.`],
        solution: [
          `det = ${fmt(a)}·${par(kVal)} − ${par(b)}·${par(da)} = ${fmt(a * kVal - b * da)}`,
          ...(kind === 0 ? ["det ≠ 0 ⇒ solución única"] : [`det = 0. ¿Es ${fmt(e)} = ${fmt(lam)}·${par(c)} = ${fmt(lam * c)}? ${kind === 1 ? "Sí ⇒ ecuaciones equivalentes" : "No ⇒ contradicción"}`]),
          `Clasificación: ${CLASES[kind]}`,
        ],
        explanation: "Primero se busca qué valores anulan el determinante: para el resto el sistema es SCD. Para esos valores se analiza aparte si las ecuaciones son equivalentes (SCI) o contradictorias (SI).",
      }),
      CLASES.map((t, i) => (i === kind ? { text: t, correct: true } : { text: t, error: { type: "conceptual" as const, message: CLASE_MSG[i] } })),
    );
  },
};

// ───────────────────────── alg-4 · Determinantes ─────────────────────────

export const determinante: Generator = {
  id: "alg-determinante",
  topicId: "t-alg-determinantes",
  description: "Determinantes de matrices 2×2 y 3×3",
  generate(seed, d) {
    const r = rng(seed);
    if (d <= 2) {
      const M = randMat(r, 2, 2, d === 1 ? 0 : -6, 6);
      const ans = det2(M);
      return {
        ...base({
          gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
          prompt: `Calculá $det(A)$ para $A = ${mat(M)}$.`,
          hints: ["det [a b ; c d] = a·d − b·c.", "Diagonal principal menos diagonal secundaria.", `${par(M[0][0])}·${par(M[1][1])} − ${par(M[0][1])}·${par(M[1][0])}.`],
          solution: [`det(A) = ${par(M[0][0])}·${par(M[1][1])} − ${par(M[0][1])}·${par(M[1][0])}`, `= ${fmt(M[0][0] * M[1][1])} − ${par(M[0][1] * M[1][0])} = ${fmt(ans)}`],
          explanation: "El determinante 2×2 es ad − bc. Su valor absoluto es el área del paralelogramo formado por las columnas.",
          frequentErrors: fe(ans, 1e-9, [
            { match: M[0][0] * M[1][1] + M[0][1] * M[1][0], type: "signos", message: "Es una RESTA: diagonal principal menos diagonal secundaria." },
            { match: M[0][0] * M[1][0] - M[0][1] * M[1][1], type: "calculo", message: "Multiplicaste por columnas. Son las diagonales: a·d − b·c." },
          ]),
        }),
        kind: "numeric",
        answer: ans,
      } as NumericExercise;
    }
    const lim = d <= 4 ? 3 : 4;
    const M = randMat(r, 3, 3, -lim, lim);
    if (d === 3) M[1][0] = M[2][0] = 0;
    const ans = det3(M);
    const diag = [M[0][0] * M[1][1] * M[2][2], M[0][1] * M[1][2] * M[2][0], M[0][2] * M[1][0] * M[2][1]];
    const anti = [M[0][2] * M[1][1] * M[2][0], M[0][0] * M[1][2] * M[2][1], M[0][1] * M[1][0] * M[2][2]];
    const sum = (v: number[]) => v.reduce((s, x) => s + x, 0);
    const c = [M[1][1] * M[2][2] - M[1][2] * M[2][1], M[1][0] * M[2][2] - M[1][2] * M[2][0], M[1][0] * M[2][1] - M[1][1] * M[2][0]];
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Calculá $det(A)$ para $A = ${mat(M)}$.`,
        hints: [
          d === 3 ? "La primera columna tiene dos ceros: desarrollá por ella." : "Podés usar Sarrus o desarrollar por cofactores de la primera fila.",
          "Por cofactores: a₁₁·M₁₁ − a₁₂·M₁₂ + a₁₃·M₁₃ (signos alternados).",
          `Los menores de la primera fila son ${c.map((x) => fmt(x)).join(", ")}.`,
        ],
        solution: [
          `det(A) = ${par(M[0][0])}·(${fmt(c[0])}) − ${par(M[0][1])}·(${fmt(c[1])}) + ${par(M[0][2])}·(${fmt(c[2])})`,
          `Por Sarrus: (${diag.map((x) => fmt(x)).join(" + ")}) − (${anti.map((x) => fmt(x)).join(" + ")})`,
          `det(A) = ${fmt(ans)}`,
        ],
        explanation: "Desarrollo por cofactores: se elige una fila o columna, se multiplica cada elemento por su menor (el determinante 2×2 que queda al tachar su fila y su columna) con signos alternados + − +. Sarrus es un atajo que solo vale para 3×3.",
        frequentErrors: fe(ans, 1e-9, [
          { match: sum(diag) + sum(anti), type: "signos", message: "En Sarrus, las diagonales que bajan hacia la izquierda se RESTAN." },
          { match: M[0][0] * c[0] + M[0][1] * c[1] + M[0][2] * c[2], type: "signos", message: "En los cofactores los signos se alternan: + − +. El segundo término se resta." },
          { match: sum(diag), type: "calculo", message: "Te faltó restar las tres diagonales secundarias." },
        ]),
      }),
      kind: "numeric",
      answer: ans,
    } as NumericExercise;
  },
};

export const detPropiedades: Generator = {
  id: "alg-det-propiedades",
  topicId: "t-alg-determinantes",
  description: "Propiedades del determinante: escalar, transpuesta, inversa, producto, filas",
  generate(seed, d) {
    const r = rng(seed);
    const n = d <= 2 ? 2 : r.pick([2, 3]);
    const D = r.pick([2, 3, -2, 4, 5, -3]);
    const E = r.pick([2, -1, 3, -2]);
    const k = r.pick([2, 3, -2]);
    const kinds = byDifficulty(d, [["T", "swap"], ["kA", "swap", "T"], ["kA", "sq", "AB"], ["kA", "inv", "AB"], ["inv", "kinv", "kA"], ["kinv", "combo", "kA"]] as [string[], string[], string[], string[], string[], string[]]);
    const kind = r.pick(kinds);
    let q: string, ans: number, steps: string[];
    const errs: FrequentError[] = [];
    switch (kind) {
      case "T":
        q = "det(A^T)";
        ans = D;
        steps = ["Transponer no cambia el determinante.", `det(A^T) = det(A) = ${fmt(D)}`];
        break;
      case "swap":
        q = "el determinante de la matriz que se obtiene intercambiando dos filas de A";
        ans = -D;
        steps = ["Intercambiar dos filas cambia el signo del determinante.", `${fmt(-D)}`];
        errs.push({ match: D, type: "signos", message: "Intercambiar dos filas cambia el signo." });
        break;
      case "kA":
        q = `det(${fmt(k)}A)`;
        ans = k ** n * D;
        steps = [`${fmt(k)}A multiplica por ${fmt(k)} cada una de las ${n} filas.`, `det(${fmt(k)}A) = ${par(k)}^${n}·det(A) = ${fmt(k ** n)}·${par(D)} = ${fmt(ans)}`];
        errs.push({ match: k * D, type: "potencias", message: `Multiplicar la matriz por ${k} multiplica CADA fila por ${k}: el determinante queda multiplicado por ${k}^${n}, no por ${k}.` });
        break;
      case "sq":
        q = "det(A^2)";
        ans = D * D;
        steps = ["det(A·B) = det(A)·det(B).", `det(A²) = det(A)² = ${fmt(ans)}`];
        errs.push({ match: 2 * D, type: "potencias", message: "det(A²) = det(A)·det(A), no 2·det(A)." });
        break;
      case "AB":
        q = `det(A·B), si $det(B) = ${fmt(E)}$`;
        ans = D * E;
        steps = ["det(A·B) = det(A)·det(B).", `= ${par(D)}·${par(E)} = ${fmt(ans)}`];
        errs.push({ match: D + E, type: "conceptual", message: "El determinante del producto es el producto de los determinantes, no la suma." });
        break;
      case "inv":
        q = "det(A^{−1})";
        ans = 1 / D;
        steps = ["A·A^{−1} = I ⇒ det(A)·det(A^{−1}) = 1.", `det(A^{−1}) = 1/${par(D)}`];
        errs.push({ match: -D, type: "conceptual", message: "La inversa no cambia el signo: invierte el número. det(A⁻¹) = 1/det(A)." });
        break;
      case "kinv":
        q = `det(${fmt(k)}A^{−1})`;
        ans = k ** n / D;
        steps = [`det(${fmt(k)}A^{−1}) = ${par(k)}^${n}·det(A^{−1})`, `= ${fmt(k ** n)}·(1/${par(D)}) = ${fracText(k ** n, D)}`];
        errs.push({ match: k / D, type: "potencias", message: `El ${k} multiplica las ${n} filas: aparece ${k}^${n}.` });
        errs.push({ match: k ** n * D, type: "conceptual", message: "det(A⁻¹) = 1/det(A): hay que dividir por det(A)." });
        break;
      default:
        q = `det(${fmt(k)}·A^T·B), si $det(B) = ${fmt(E)}$`;
        ans = k ** n * D * E;
        steps = [`det(${fmt(k)}·A^T·B) = ${par(k)}^${n}·det(A^T)·det(B)`, `= ${fmt(k ** n)}·${par(D)}·${par(E)} = ${fmt(ans)}`];
        errs.push({ match: k * D * E, type: "potencias", message: `El escalar ${k} sale elevado a ${n} (una vez por fila).` });
    }
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Sea $A$ una matriz ${n}×${n} con $det(A) = ${fmt(D)}$. Calculá ${q.startsWith("det") ? `$${q.replace(/, si \$/, "$, si $")}$` : q}.${Number.isInteger(ans) ? "" : " (Podés escribir una fracción, como 3/4.)"}`.replace("$$", "$"),
        hints: [
          "No hace falta conocer A: alcanzan las propiedades del determinante.",
          "det(kA) = kⁿ·det(A); det(AB) = det(A)·det(B); det(Aᵀ) = det(A); det(A⁻¹) = 1/det(A).",
          steps[0],
        ],
        solution: steps,
        explanation: "El determinante es multiplicativo (det(AB) = det A · det B), no cambia al transponer, cambia de signo al intercambiar filas y se multiplica por k al multiplicar UNA fila por k (por eso kA, que multiplica las n filas, da kⁿ).",
        frequentErrors: fe(ans, 1e-9, errs),
      }),
      kind: "numeric",
      answer: ans,
    } as NumericExercise;
  },
};

export const inversa2x2: Generator = {
  id: "alg-inversa-2x2",
  topicId: "t-alg-inversa",
  description: "Inversa de una matriz 2×2",
  generate(seed, d) {
    const r = rng(seed);
    let a: number, b: number, c: number, e: number, D: number;
    const allowed = d <= 2 ? [1, -1] : d <= 4 ? [1, -1, 2, -2] : [2, -2, 3, -3, 4, 5];
    do {
      [a, b, c, e] = [r.int(-5, 5), r.nz(-5, 5), r.nz(-5, 5), r.int(-5, 5)];
      D = a * e - b * c;
    } while (!allowed.includes(D) || a === e);
    const M = (p: number, q: number, s: number, t: number, den: number) => mat([[fracText(p, den), fracText(q, den)], [fracText(s, den), fracText(t, den)]]);
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Calculá la inversa de $A = ${mat([[a, b], [c, e]])}$.`,
        hints: [`Primero el determinante: ${par(a)}·${par(e)} − ${par(b)}·${par(c)} = ${fmt(D)}.`, "A⁻¹ = (1/det)·[d −b ; −c a]: se intercambian los de la diagonal y se cambia el signo de los otros dos.", `Dividí cada elemento por ${fmt(D)}.`],
        solution: [`det(A) = ${fmt(D)} ≠ 0 ⇒ A es inversible`, `A^{−1} = (1/${par(D)})·${mat([[e, -b], [-c, a]])}`, `A^{−1} = ${M(e, -b, -c, a, D)}`, "Verificación: A·A^{−1} = I"],
        explanation: "Para A = [a b ; c d] con ad − bc ≠ 0, A⁻¹ = 1/(ad − bc)·[d −b ; −c a]. Se puede comprobar multiplicando: da la identidad.",
      }),
      [
        { text: `$${M(e, -b, -c, a, D)}$`, correct: true },
        { text: `$${M(a, -b, -c, e, D)}$`, error: { type: "conceptual", message: "Hay que intercambiar los elementos de la diagonal principal (a y d)." } },
        { text: `$${M(e, b, c, a, D)}$`, error: { type: "signos", message: "Los elementos de la diagonal secundaria cambian de signo: −b y −c." } },
        ...(D !== 1 ? [{ text: `$${M(e, -b, -c, a, 1)}$`, error: { type: "calculo" as const, message: `Falta dividir todo por el determinante (${fmt(D)}).` } }] : []),
        { text: `$${M(e, -c, -b, a, D)}$`, error: { type: "conceptual", message: "No se transpone: los elementos b y c quedan en su lugar, solo cambian de signo." } },
      ],
    );
  },
};

export const detParametro: Generator = {
  id: "alg-det-parametro",
  topicId: "t-alg-inversa",
  description: "Valor del parámetro que hace no inversible a una matriz",
  generate(seed, d) {
    const r = rng(seed);
    const k0 = r.nz(-6, 6);
    const b = r.nz(-4, 4);
    const s = r.pick([2, -1, 3, -2]);
    const n3 = d >= 4;
    if (!n3) {
      const A = [["k", b], [k0 * s, b * s]] as (number | string)[][];
      return {
        ...base({
          gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
          prompt: `¿Para qué valor de $k$ la matriz $A = ${mat(A)}$ **no** es inversible?`,
          hints: ["A es inversible ⇔ det(A) ≠ 0.", `det(A) = k·${par(b * s)} − ${par(b)}·${par(k0 * s)}.`, "Igualá a 0 y despejá k."],
          solution: [`det(A) = ${linTxt([b * s], ["k"])} − ${par(b * k0 * s)}`, `det(A) = 0 ⇔ k = ${fmt(b * k0 * s)} / ${par(b * s)} = ${fmt(k0)}`],
          explanation: "Una matriz cuadrada es inversible si y solo si su determinante es distinto de 0. El valor de k que anula el determinante hace las filas proporcionales.",
          frequentErrors: fe(k0, 1e-9, [{ match: -k0, type: "signos", message: "Revisá el signo al despejar." }, { match: b * k0 * s, type: "despeje", message: `Te faltó dividir por ${fmt(b * s)}.` }]),
        }),
        kind: "numeric",
        answer: k0,
      } as NumericExercise;
    }
    // 3×3 triangular con un parámetro en la diagonal: det = p·q·(k − k0)
    const p = r.nz(-3, 3), q = r.nz(-3, 3);
    const A = [[p, r.int(-3, 3), r.int(-3, 3)], [0, q, r.int(-3, 3)], [0, 0, `k ${k0 > 0 ? "−" : "+"} ${Math.abs(k0)}`]] as (number | string)[][];
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `¿Para qué valor de $k$ el sistema $A·X = B$ con $A = ${mat(A)}$ **no** tiene solución única (para cualquier B)?`,
        hints: ["Solución única ⇔ det(A) ≠ 0.", "A es triangular: su determinante es el producto de la diagonal.", `det(A) = ${par(p)}·${par(q)}·(k ${k0 > 0 ? "−" : "+"} ${Math.abs(k0)}).`],
        solution: [`det(A) = ${fmt(p * q)}·(k ${k0 > 0 ? "−" : "+"} ${Math.abs(k0)})`, `det(A) = 0 ⇔ k = ${fmt(k0)}`, `Para k ≠ ${fmt(k0)} el sistema es SCD.`],
        explanation: "Para un sistema cuadrado: det(A) ≠ 0 ⇔ A es inversible ⇔ el sistema tiene solución única X = A⁻¹B. Si det(A) = 0, el sistema es SCI o SI según B.",
        frequentErrors: fe(k0, 1e-9, [{ match: -k0, type: "signos", message: `k − ${par(k0)} se anula en k = ${fmt(k0)}: revisá el signo.` }]),
      }),
      kind: "numeric",
      answer: k0,
    } as NumericExercise;
  },
};

// ───────────────────────── alg-5 · Transformaciones lineales ─────────────────────────

export const tlImagen: Generator = {
  id: "alg-tl-imagen",
  topicId: "t-alg-transformaciones",
  description: "Imagen de un vector y matriz asociada de una transformación lineal",
  generate(seed, d) {
    const r = rng(seed);
    if (d <= 3) {
      let M: number[][];
      do M = randMat(r, 2, 2, -4, 4);
      while (M[0][1] === M[1][0] || M.some((row) => isZero(row)));
      const v = [r.nz(-3, 3), r.nz(-3, 3)];
      const img = [dot(M[0], v), dot(M[1], v)];
      const tr = [M[0][0] * v[0] + M[1][0] * v[1], M[0][1] * v[0] + M[1][1] * v[1]];
      const def = d <= 2 ? `$T(x, y) = (${linTxt(M[0], ["x", "y"])}, ${linTxt(M[1], ["y", "y"].map((_, i) => ["x", "y"][i]))})$` : `$T(X) = A·X$ con $A = ${mat(M)}$`;
      return choice(
        r,
        base({
          gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
          prompt: `Sea $T: ℝ^2 → ℝ^2$, ${def}. Calculá $T${vec(v)}$.`,
          hints: [d <= 2 ? "Reemplazá x e y por las coordenadas del vector." : "Multiplicá la matriz por el vector columna: fila por columna.", `Primera coordenada: ${par(M[0][0])}·${par(v[0])} + ${par(M[0][1])}·${par(v[1])}.`, `Segunda: ${par(M[1][0])}·${par(v[0])} + ${par(M[1][1])}·${par(v[1])}.`],
          solution: [`T${vec(v)} = (${par(M[0][0])}·${par(v[0])} + ${par(M[0][1])}·${par(v[1])}, ${par(M[1][0])}·${par(v[0])} + ${par(M[1][1])}·${par(v[1])})`, `= ${vec(img)}`],
          explanation: "Una transformación lineal del plano es multiplicar por una matriz: la fila i de la matriz da la coordenada i de la imagen.",
        }),
        [
          { text: `$${vec(img)}$`, correct: true },
          { text: `$${vec(tr)}$`, error: { type: "conceptual", message: "Usaste las columnas como si fueran filas (multiplicaste por la transpuesta). Cada coordenada de la imagen sale de una FILA por el vector." } },
          { text: `$${vec([M[0][0] * v[0], M[1][1] * v[1]])}$`, error: { type: "calculo", message: "Cada coordenada usa las dos componentes del vector: fila completa por columna." } },
          { text: `$${vec([img[1], img[0]])}$`, error: { type: "interpretacion", message: "Invertiste el orden de las coordenadas: la primera fila da la primera coordenada." } },
        ],
      );
    }
    if (d <= 5) {
      const M = randMat(r, 2, 3, -4, 4);
      if (isZero(M[0])) M[0][0] = 1;
      if (isZero(M[1])) M[1][2] = 2;
      const i = r.int(1, 2), j = r.int(1, 3);
      const ans = M[i - 1][j - 1];
      return {
        ...base({
          gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
          prompt: `Sea $T: ℝ^3 → ℝ^2$, $T(x, y, z) = (${linTxt(M[0], ["x", "y", "z"])}, ${linTxt(M[1], ["x", "y", "z"])})$. Si $A$ es su matriz asociada (2×3), ¿cuánto vale $a${sub(i, j)}$?`,
          hints: ["La matriz tiene una fila por cada coordenada de la imagen y una columna por cada variable.", `Fila ${i}: los coeficientes de la coordenada ${i} de T.`, `Columna ${j}: el coeficiente de ${["x", "y", "z"][j - 1]} (0 si no aparece).`],
          solution: [`A = ${mat(M)}`, `a${sub(i, j)} = ${fmt(ans)}`],
          explanation: "La columna j de la matriz asociada es T(e_j), la imagen del j-ésimo vector canónico. Equivalentemente, la fila i son los coeficientes de la i-ésima coordenada.",
          frequentErrors: fe(ans, 1e-9, j <= 2 && i <= 3 ? [{ match: M[j - 1]?.[i - 1] ?? NaN, type: "interpretacion", message: "Cambiaste fila por columna: a_ij está en la fila i y la columna j." }] : []),
        }),
        kind: "numeric",
        answer: ans,
      } as NumericExercise;
    }
    const e1 = [r.int(-4, 4), r.int(-4, 4)], e2 = [r.int(-4, 4), r.int(-4, 4)];
    const v = [r.nz(-3, 3), r.nz(-3, 3)];
    const comp = r.int(0, 1);
    const ans = v[0] * e1[comp] + v[1] * e2[comp];
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `$T: ℝ^2 → ℝ^2$ es lineal, con $T(1, 0) = ${vec(e1)}$ y $T(0, 1) = ${vec(e2)}$. ¿Cuál es la ${comp === 0 ? "primera" : "segunda"} coordenada de $T${vec(v)}$?`,
        hints: [`${vec(v)} = ${fmt(v[0])}·(1, 0) + ${par(v[1])}·(0, 1).`, "Por linealidad: T(a·e₁ + b·e₂) = a·T(e₁) + b·T(e₂).", `${fmt(v[0])}·${vec(e1)} + ${par(v[1])}·${vec(e2)}.`],
        solution: [`T${vec(v)} = ${fmt(v[0])}·T(1, 0) + ${par(v[1])}·T(0, 1)`, `= ${vec(add(e1.map((x) => x * v[0]), e2.map((x) => x * v[1])))}`, `Coordenada pedida: ${fmt(ans)}`],
        explanation: "Una transformación lineal queda determinada por las imágenes de una base: T(a·e₁ + b·e₂) = a·T(e₁) + b·T(e₂). Esas imágenes son las columnas de su matriz.",
        frequentErrors: fe(ans, 1e-9, [{ match: v[0] * e1[1 - comp] + v[1] * e2[1 - comp], type: "interpretacion", message: "Esa es la otra coordenada." }, { match: v[0] * e1[comp] + v[1] * e1[1 - comp], type: "conceptual", message: "Usaste solo T(1, 0). Cada componente del vector multiplica a la imagen de su vector canónico." }]),
      }),
      kind: "numeric",
      answer: ans,
    } as NumericExercise;
  },
};

const genTxt = (v: number[]) => `gen\\{${vec(v)}\\}`;
const genPlain = (v: number[]) => `gen{${vec(v)}}`;

export const tlNucleo: Generator = {
  id: "alg-tl-nucleo",
  topicId: "t-alg-transformaciones",
  description: "Núcleo e imagen de transformaciones lineales del plano",
  generate(seed, d) {
    const r = rng(seed);
    const singular = d <= 2 ? true : r.int(0, 3) > 0;
    const askIm = d >= 4 && r.bool();
    let a: number, b: number;
    do [a, b] = [r.int(-4, 4), r.int(-4, 4)];
    while ((a === 0 && b === 0) || gcd(a, b) > 1 && r.bool());
    const lam = r.pick([2, -1, 3, -2]);
    let M: number[][];
    if (singular) M = [[a, b], [lam * a, lam * b]];
    else {
      let c: number, e: number;
      do [c, e] = [r.int(-4, 4), r.int(-4, 4)];
      while (a * e - b * c === 0);
      M = [[a, b], [c, e]];
    }
    const nu = reduceVec([b, -a]);
    const row = reduceVec([a, b]);
    const colDir = reduceVec(a !== 0 ? [1, lam] : [1, lam]);
    const T = `$T(x, y) = (${linTxt(M[0], ["x", "y"])}, ${linTxt(M[1], ["x", "y"])})$`;
    const zero = "\\{(0, 0)\\}";
    const R2 = "ℝ^2";
    let correct: string;
    const opts: Option[] = [];
    if (!askIm) {
      correct = singular ? genTxt(nu) : zero;
      opts.push({ text: `$${correct}$`, correct: true });
      if (singular) {
        opts.push({ text: `$${zero}$`, error: { type: "conceptual", message: "Nu(T) = {0} solo si det ≠ 0. Acá las filas son proporcionales (det = 0): hay infinitos vectores que van al 0." } });
        opts.push({ text: `$${genTxt(row)}$`, error: { type: "vectores", message: "Ese es el vector de coeficientes de la fila. El núcleo son los (x, y) que la anulan: los perpendiculares a la fila." } });
      } else {
        opts.push({ text: `$${genTxt(nu)}$`, error: { type: "conceptual", message: "Ese vector anula la primera coordenada, pero no la segunda. Como det ≠ 0, la única solución de T(v) = 0 es v = 0." } });
      }
      opts.push({ text: `$${R2}$`, error: { type: "conceptual", message: "Nu(T) = ℝ² solo si T manda todo al 0 (la transformación nula)." } });
    } else {
      correct = singular ? genTxt(colDir) : R2;
      opts.push({ text: `$${correct}$`, correct: true });
      opts.push({ text: `$${singular ? R2 : genTxt(reduceVec([M[0][0], M[1][0]]))}$`, error: { type: "conceptual", message: singular ? "Si det = 0 la imagen no es todo ℝ²: dim Im = 2 − dim Nu = 1." : "Con det ≠ 0, dim Nu = 0 y la imagen es todo ℝ² (dim Im = 2)." } });
      if (singular) opts.push({ text: `$${genTxt(nu)}$`, error: { type: "conceptual", message: "Ese es el núcleo. La imagen está generada por las COLUMNAS de la matriz." } });
      opts.push({ text: `$${zero}$`, error: { type: "conceptual", message: "La imagen es {0} solo para la transformación nula." } });
    }
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Sea ${T}. ¿Cuál es ${askIm ? "la imagen" : "el núcleo"} de T?`,
        hints: [
          askIm ? "La imagen está generada por las columnas de la matriz de T." : "Nu(T) = {v : T(v) = 0}: planteá el sistema T(x, y) = (0, 0).",
          `det = ${fmt(det2(M))}: ${det2(M) === 0 ? "las filas son proporcionales" : "la matriz es inversible"}.`,
          "Teorema de la dimensión: dim Nu(T) + dim Im(T) = 2.",
        ],
        solution: [
          `Matriz: ${mat(M)}, det = ${fmt(det2(M))}`,
          singular ? `T(x, y) = 0 ⇔ ${linTxt(M[0], ["x", "y"])} = 0 ⇒ Nu(T) = ${genPlain(nu)}` : "det ≠ 0 ⇒ T(x, y) = 0 solo para (0, 0) ⇒ Nu(T) = {(0, 0)}",
          singular ? `Columnas: ${vec([M[0][0], M[1][0]])} y ${vec([M[0][1], M[1][1]])}, múltiplos de ${vec(colDir)} ⇒ Im(T) = ${genPlain(colDir)}` : "dim Im = 2 − 0 = 2 ⇒ Im(T) = ℝ²",
        ],
        explanation: "El núcleo son los vectores que T manda al 0 (solución de un sistema homogéneo); la imagen, todos los resultados posibles (generada por las columnas). Siempre dim Nu + dim Im = dimensión del dominio.",
      }),
      opts,
    );
  },
};

const PLANE_MAPS: [string, number[]][] = [
  ["Rotación de 90° (antihoraria)", [0, -1, 1, 0]],
  ["Simetría respecto del eje x", [1, 0, 0, -1]],
  ["Simetría respecto del eje y", [-1, 0, 0, 1]],
  ["Simetría respecto de la recta y = x", [0, 1, 1, 0]],
  ["Rotación de 180°", [-1, 0, 0, -1]],
  ["Proyección sobre el eje x", [1, 0, 0, 0]],
  ["Rotación de 90° (horaria)", [0, 1, -1, 0]],
];

export const tlPlano: Generator = {
  id: "alg-tl-plano",
  topicId: "t-alg-transformaciones",
  description: "Relacionar transformaciones del plano con su matriz",
  generate(seed, d) {
    const r = rng(seed);
    const k = r.pick([2, 3]);
    const pool: [string, number[]][] = [...(d <= 2 ? PLANE_MAPS.slice(0, 5) : PLANE_MAPS), [`Homotecia (escala) de factor ${k}`, [k, 0, 0, k]]];
    const pick = r.shuffle(pool).slice(0, 4);
    const pairs: [string, string][] = pick.map(([name, m]) => [name, `$${mat([[m[0], m[1]], [m[2], m[3]]])}$`]);
    const ex: MatchExercise = {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: "Relacioná cada transformación del plano con su matriz (filas separadas por «;»).",
        hints: ["Las columnas de la matriz son las imágenes de (1, 0) y (0, 1).", "Preguntate a dónde va (1, 0) con cada transformación: esa es la primera columna.", "Por ejemplo, la rotación de 90° antihoraria manda (1, 0) a (0, 1) y (0, 1) a (−1, 0)."],
        solution: pairs.map(([a, b]) => `${a} → ${b}`),
        explanation: "La matriz de una transformación lineal tiene como columnas a T(1, 0) y T(0, 1). Basta ver qué le hace la transformación a los dos vectores canónicos.",
      }),
      kind: "match",
      pairs,
    };
    return ex;
  },
};

// ───────────────────────── alg-6 · Cónicas ─────────────────────────

export const circunferencia: Generator = {
  id: "alg-circunferencia",
  topicId: "t-alg-circunferencia",
  description: "Centro y radio de una circunferencia completando cuadrados",
  generate(seed, d) {
    const r = rng(seed);
    const h = r.nz(-5, 5), k = r.nz(-5, 5);
    const nonSquare = d === 6;
    const R2v = nonSquare ? r.pick([2, 3, 5, 7, 8, 10, 13]) : (r.int(1, 6)) ** 2;
    const factor = d === 5 ? r.pick([2, 3]) : 1;
    const D = -2 * h, E = -2 * k, F = h * h + k * k - R2v;
    const coeffs = [factor, factor, factor * D, factor * E, factor * F];
    const eqStr = `${linTxt(coeffs.slice(0, 4), ["x^2", "y^2", "x", "y"])} ${F === 0 ? "" : `${factor * F > 0 ? "+" : "−"} ${fmt(Math.abs(factor * F))} `}= 0`;
    const ask = d <= 2 ? "r" : d === 3 ? r.pick(["h", "k"]) : "r";
    const rad = Math.sqrt(R2v);
    const ans = ask === "r" ? r2(rad) : ask === "h" ? h : k;
    const exact = ask !== "r" || Number.isInteger(rad);
    const errs: FrequentError[] = [];
    if (ask === "r") {
      errs.push({ match: R2v, type: "potencias", message: "Ese es r². El radio es su raíz cuadrada." });
      if (factor !== 1) {
        const wh = factor * D / 2, wk = factor * E / 2;
        const wr = Math.sqrt(wh * wh + wk * wk - factor * F);
        errs.push({ match: r2(wr), type: "conceptual", message: `Primero hay que dividir toda la ecuación por ${factor} para que x² e y² tengan coeficiente 1.` });
      }
    } else errs.push({ match: ask === "h" ? -h : -k, type: "signos", message: "Si el término es (x − h)², el centro tiene coordenada h: (x + 3)² corresponde a h = −3." });
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `La circunferencia $${eqStr}$ tiene centro $(h, k)$ y radio $r$. ¿Cuánto vale $${ask}$?${exact ? "" : " (redondeá a 2 decimales)"}`,
        hints: [
          factor !== 1 ? `Dividí toda la ecuación por ${factor}.` : "Agrupá los términos en x y los términos en y.",
          `Completá cuadrados: x² ${D > 0 ? "+" : "−"} ${fmt(Math.abs(D))}x = (x ${-h > 0 ? "+" : "−"} ${fmt(Math.abs(h))})² − ${fmt(h * h)}.`,
          "Llevalo a la forma (x − h)² + (y − k)² = r².",
        ],
        solution: [
          ...(factor !== 1 ? [`Dividimos por ${factor}: x² + y² ${D > 0 ? "+" : "−"} ${fmt(Math.abs(D))}x ${E > 0 ? "+" : "−"} ${fmt(Math.abs(E))}y ${F >= 0 ? "+" : "−"} ${fmt(Math.abs(F))} = 0`] : []),
          `(x ${-h > 0 ? "+" : "−"} ${fmt(Math.abs(h))})² − ${fmt(h * h)} + (y ${-k > 0 ? "+" : "−"} ${fmt(Math.abs(k))})² − ${fmt(k * k)} ${F >= 0 ? "+" : "−"} ${fmt(Math.abs(F))} = 0`,
          `(x ${-h > 0 ? "+" : "−"} ${fmt(Math.abs(h))})² + (y ${-k > 0 ? "+" : "−"} ${fmt(Math.abs(k))})² = ${fmt(R2v)}`,
          `Centro (${fmt(h)}, ${fmt(k)}), radio √${R2v}${Number.isInteger(rad) ? ` = ${rad}` : ` ≈ ${fmt(rad, 2)}`}`,
        ],
        explanation: "Completar cuadrados: x² + bx = (x + b/2)² − (b/2)². Así la ecuación general se lleva a (x − h)² + (y − k)² = r², donde se leen el centro y el radio.",
        frequentErrors: fe(ans, exact ? 1e-9 : 0.011, errs),
      }),
      kind: "numeric",
      answer: ans,
      tolerance: exact ? undefined : 0.011,
    } as NumericExercise;
  },
};

export const ordenarCircunferencia: Generator = {
  id: "alg-ordenar-circunferencia",
  topicId: "t-alg-circunferencia",
  description: "Ordenar los pasos para llevar una circunferencia a su forma canónica",
  generate(seed, d) {
    const r = rng(seed);
    const h = r.nz(-5, 5), k = r.nz(-5, 5), rad = r.int(1, 6);
    const D = -2 * h, E = -2 * k, F = h * h + k * k - rad * rad;
    const sx = (c: number, v: string) => `${v}^2 ${c > 0 ? "+" : "−"} ${Math.abs(c)}${v}`;
    const sq = (c: number, v: string) => `(${v} ${c > 0 ? "−" : "+"} ${Math.abs(c)})^2`;
    const items = [
      `$x^2 + y^2 ${D > 0 ? "+" : "−"} ${Math.abs(D)}x ${E > 0 ? "+" : "−"} ${Math.abs(E)}y ${F >= 0 ? "+" : "−"} ${Math.abs(F)} = 0$`,
      `$${sx(D, "x")} + ${sx(E, "y")} = ${fmt(-F)}$`,
      `$(${sx(D, "x")} + ${h * h}) + (${sx(E, "y")} + ${k * k}) = ${fmt(-F)} + ${h * h} + ${k * k}$`,
      `$${sq(h, "x")} + ${sq(k, "y")} = ${rad * rad}$`,
      `Centro $(${fmt(h)}, ${fmt(k)})$, radio ${rad}`,
    ];
    const used = d <= 2 ? items.slice(1) : items;
    const ex: OrderExercise = {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: "Ordená los pasos para encontrar el centro y el radio de la circunferencia.",
        hints: ["Primero se agrupan x con x e y con y, y el término independiente pasa al otro lado.", "Después se completan cuadrados sumando lo mismo en ambos miembros.", "Al final se lee el centro y el radio de la forma (x − h)² + (y − k)² = r²."],
        solution: used,
        explanation: "Completar cuadrados es sumar (b/2)² para formar un trinomio cuadrado perfecto; para no cambiar la ecuación, se suma lo mismo del otro lado.",
      }),
      kind: "order",
      items: rng(seed + 1).shuffle(used),
      answer: used,
    };
    return ex;
  },
};

const CONICAS = ["Circunferencia", "Elipse", "Parábola", "Hipérbola"];
const CONICA_MSG = [
  "En la circunferencia x² e y² tienen el MISMO coeficiente.",
  "En la elipse x² e y² tienen coeficientes del mismo signo pero distintos.",
  "En la parábola solo una de las variables está al cuadrado.",
  "En la hipérbola x² e y² tienen coeficientes de signos opuestos.",
];

export const conicaIdentificar: Generator = {
  id: "alg-conica-identificar",
  topicId: "t-alg-conicas",
  description: "Identificar el tipo de cónica a partir de su ecuación",
  generate(seed, d) {
    const r = rng(seed);
    const kind = r.int(0, 3);
    const h = d <= 2 ? 0 : r.int(-4, 4), k = d <= 2 ? 0 : r.int(-4, 4);
    const [a, b] = r.pick([[2, 3], [3, 2], [4, 2], [2, 5], [5, 3], [3, 4]]);
    let eq: string;
    // coeficientes de A x² + C y² + D x + E y + F = 0
    let A = 0, C = 0, D = 0, E = 0, F = 0;
    if (kind === 0) {
      A = C = 1; D = -2 * h; E = -2 * k; F = h * h + k * k - a * a;
    } else if (kind === 1 || kind === 3) {
      const s = kind === 1 ? 1 : -1;
      const flip = kind === 3 && r.bool();
      A = (flip ? -s : 1) * b * b; C = (flip ? 1 : s) * a * a;
      D = -2 * h * A; E = -2 * k * C; F = A * h * h + C * k * k - a * a * b * b;
    } else {
      const p = r.nz(-3, 3);
      if (r.bool()) { A = 1; D = -2 * h; E = -4 * p; F = h * h + 4 * p * k; }
      else { C = 1; E = -2 * k; D = -4 * p; F = k * k + 4 * p * h; }
    }
    if (d <= 2) {
      eq = kind === 0 ? `x^2 + y^2 = ${a * a}` : kind === 1 ? `\\frac{x^2}{${a * a}} + \\frac{y^2}{${b * b}} = 1` : kind === 3 ? `\\frac{x^2}{${a * a}} − \\frac{y^2}{${b * b}} = 1` : A === 1 ? `x^2 = ${fmt(-E)}y` : `y^2 = ${fmt(-D)}x`;
    } else {
      eq = `${linTxt([A, C, D, E], ["x^2", "y^2", "x", "y"])} ${F === 0 ? "" : `${F > 0 ? "+" : "−"} ${fmt(Math.abs(F))} `}= 0`;
    }
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `¿Qué cónica representa $${eq}$?`,
        hints: ["Mirá qué variables aparecen al cuadrado.", "Si las dos están al cuadrado, compará sus coeficientes: ¿iguales? ¿mismo signo? ¿signos opuestos?", "Una sola variable al cuadrado ⇒ parábola."],
        solution: [kind === 2 ? "Solo una variable está al cuadrado." : `Escrita como Ax² + Cy² + … = 0, los coeficientes de x² e y² son ${fmt(A)} y ${fmt(C)}.`, `Es una ${CONICAS[kind].toLowerCase()}.`],
        explanation: "Sin término xy, la cónica Ax² + Cy² + Dx + Ey + F = 0 es (salvo casos degenerados) circunferencia si A = C, elipse si A y C tienen igual signo, hipérbola si tienen signos opuestos y parábola si uno de los dos es 0.",
      }),
      CONICAS.map((t, i) => (i === kind ? { text: t, correct: true } : { text: t, error: { type: "conceptual" as const, message: CONICA_MSG[i] } })),
    );
  },
};

export const conicaElementos: Generator = {
  id: "alg-conica-elementos",
  topicId: "t-alg-conicas",
  description: "Focos, semiejes y directriz de elipses, hipérbolas y parábolas",
  generate(seed, d) {
    const r = rng(seed);
    const mode = byDifficulty(d, ["parabola", "elipse", "hiperbola", "elipse", "hiperbola", "parabola"]);
    const shifted = d >= 4;
    const h = shifted ? r.nz(-4, 4) : 0, k = shifted ? r.nz(-4, 4) : 0;
    const X = h === 0 ? "x^2" : `(x ${h > 0 ? "−" : "+"} ${Math.abs(h)})^2`;
    const Y = k === 0 ? "y^2" : `(y ${k > 0 ? "−" : "+"} ${Math.abs(k)})^2`;
    const Yl = k === 0 ? "y" : `(y ${k > 0 ? "−" : "+"} ${Math.abs(k)})`;
    let prompt: string, ans: number, sol: string[], hints: [string, string, string];
    const errs: FrequentError[] = [];
    if (mode === "parabola") {
      const p = r.nz(-3, 3);
      const directriz = d === 6;
      ans = directriz ? k - p : k + p;
      prompt = `La parábola $${X} = ${fmt(4 * p)}${Yl}$ tiene vértice $(${fmt(h)}, ${fmt(k)})$. ${directriz ? "Su directriz es $y = c$: ¿cuánto vale c?" : "¿Cuál es la coordenada y de su foco?"}`;
      hints = ["Comparala con (x − h)² = 4p(y − k).", `4p = ${fmt(4 * p)} ⇒ p = ${fmt(p)}.`, directriz ? "La directriz está a distancia |p| del vértice, del lado opuesto al foco: y = k − p." : "El foco está en (h, k + p)."];
      sol = [`4p = ${fmt(4 * p)} ⇒ p = ${fmt(p)}`, directriz ? `Directriz: y = k − p = ${fmt(k)} − ${par(p)} = ${fmt(ans)}` : `Foco: (h, k + p) = (${fmt(h)}, ${fmt(ans)})`];
      errs.push({ match: directriz ? k - 4 * p : k + 4 * p, type: "formula", message: "Usaste 4p en lugar de p. El número que acompaña es 4p: hay que dividirlo por 4." });
      errs.push({ match: directriz ? k + p : k - p, type: "signos", message: directriz ? "Eso es el foco. La directriz está del otro lado del vértice: y = k − p." : "Eso es la directriz. El foco está en k + p." });
    } else {
      const ell = mode === "elipse";
      const [A, B, Cc] = ell ? r.pick([[5, 4, 3], [5, 3, 4], [13, 12, 5], [10, 8, 6], [10, 6, 8], [17, 15, 8]]) : r.pick([[3, 4, 5], [4, 3, 5], [5, 12, 13], [6, 8, 10], [8, 6, 10], [12, 5, 13]]);
      const sign = ell ? "+" : "−";
      const eq = `\\frac{${X}}{${A * A}} ${sign} \\frac{${Y}}{${B * B}} = 1`;
      const askDist = d === 4;
      const askFocus = d === 5;
      ans = askDist ? 2 * Cc : askFocus ? h + Cc : Cc;
      prompt = `Para la ${ell ? "elipse" : "hipérbola"} $${eq}$, ${askDist ? "¿cuál es la distancia entre sus focos?" : askFocus ? "¿cuál es la coordenada x del foco de la derecha?" : "¿cuánto vale c (la distancia del centro a cada foco)?"}`;
      hints = [
        `a² = ${A * A} y b² = ${B * B}, con centro (${fmt(h)}, ${fmt(k)}).`,
        ell ? "En la elipse: c² = a² − b² (a es el semieje mayor)." : "En la hipérbola: c² = a² + b².",
        `c² = ${ell ? `${A * A} − ${B * B}` : `${A * A} + ${B * B}`} = ${Cc * Cc}.`,
      ];
      sol = [`a = ${A}, b = ${B}`, `c² = ${ell ? `${A * A} − ${B * B}` : `${A * A} + ${B * B}`} = ${Cc * Cc} ⇒ c = ${Cc}`, ...(askDist ? [`Distancia entre focos: 2c = ${2 * Cc}`] : askFocus ? [`Focos: (h ± c, k) ⇒ foco derecho en x = ${fmt(h)} + ${Cc} = ${fmt(ans)}`] : [])];
      errs.push({ match: askDist ? 2 * Cc * Cc : askFocus ? h + Cc * Cc : Cc * Cc, type: "potencias", message: "Ese es c². Te faltó la raíz." });
      if (askDist) errs.push({ match: Cc, type: "interpretacion", message: "c es la distancia del centro a UN foco; entre los dos focos hay 2c." });
      if (askFocus) errs.push({ match: Cc, type: "interpretacion", message: "El centro no está en el origen: el foco está en h + c." });
    }
    return {
      ...base({ gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId, prompt, hints, solution: sol, explanation: "En forma canónica se leen todos los elementos: en la elipse c² = a² − b², en la hipérbola c² = a² + b², y en la parábola (x − h)² = 4p(y − k) el foco está a distancia p del vértice y la directriz a distancia p del otro lado.", frequentErrors: fe(ans, 1e-9, errs) }),
      kind: "numeric",
      answer: ans,
    } as NumericExercise;
  },
};


export const ALGEBRA_GENERATORS: Generator[] = [conjuntosOperacion, conjuntosRelacionar, absIntervalo, intervalosOperacion, complejoOperacion, complejoCociente, potenciaI, complejoPolar, deMoivre, teoremaResto, ruffiniCociente, polinomioFactorizar, productoVectorial, anguloVectores, proyeccion, rectaPertenencia, planoEcuacion, rectaPlanoInterseccion, posicionRelativa, distanciaPuntoPlano,
  matrizProducto, gaussSistema, sistemaClasificar, sistemaParametro, determinante, detPropiedades, inversa2x2, detParametro,
  tlImagen, tlNucleo, tlPlano, circunferencia, ordenarCircunferencia, conicaIdentificar, conicaElementos];
