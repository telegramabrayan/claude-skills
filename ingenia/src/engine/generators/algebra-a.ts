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
const isZero = (u: number[]) => u.every((x) => x === 0);
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
const dd = (d: Difficulty) => d;

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
    const n = r.int(...byDifficulty(d, [[2, 12], [5, 50], [20, 400], [1, 30], [5, 99], [5, 999]] as [number, number][]));
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

// @@PART3@@

export const ALGEBRA_GENERATORS: Generator[] = [conjuntosOperacion, conjuntosRelacionar, absIntervalo, intervalosOperacion, complejoOperacion, complejoCociente, potenciaI, complejoPolar, deMoivre, teoremaResto, ruffiniCociente, polinomioFactorizar];
void dd;
void polyExpr; void polyEval; void ruffini; void polyMul; void factor; void divisor; void dot; void norm; void cross; void add; void isZero; void r2; void reduceVec; void det2; void det3; void randVec; void fe; void sub; void cx; void polyTxt; void eqTxt; void vec; void vecFrac; void mat;
export type { ExpressionExercise, NumericExercise, OrderExercise };
