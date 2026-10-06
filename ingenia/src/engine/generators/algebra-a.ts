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
    if (k !== 1) opts.push({ text: `$${sol(b, rr, inside)}$`, error: { type: "despeje", message: `Te faltó dividir por ${k}: de ${fmt(b - rr)} ${inside ? "<" : ">"} ${k}x ... hay que despejar x dividiendo todo por ${k}.` } });
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

// @@PART2@@

export const ALGEBRA_GENERATORS: Generator[] = [conjuntosOperacion, conjuntosRelacionar, absIntervalo, intervalosOperacion];
void dd;
void polyExpr; void polyEval; void ruffini; void polyMul; void factor; void divisor; void dot; void norm; void cross; void add; void isZero; void r2; void reduceVec; void det2; void det3; void randVec; void fe; void sub; void cx; void polyTxt; void eqTxt; void vec; void vecFrac; void mat;
export type { ExpressionExercise, NumericExercise, OrderExercise };
