/**
 * Parser y evaluador de expresiones matemáticas escrito a mano (sin dependencias).
 *
 * Acepta la forma en que un estudiante escribe en el teclado o el celular:
 *  - coma o punto decimal: 2,5 · 2.5
 *  - multiplicación implícita: 2x · 3(x+1) · (x+1)(x-1)
 *  - símbolos unicode: − × · ÷ ² ³ √ π
 *  - funciones: sin/sen, cos, tan, sqrt/raiz, ln, log, exp, abs
 *
 * `-2^2` se interpreta como -(2²) = -4, igual que en matemática.
 */

export type Node =
  | { t: "num"; v: number }
  | { t: "var"; name: string }
  | { t: "un"; op: "-"; a: Node }
  | { t: "bin"; op: "+" | "-" | "*" | "/" | "^"; a: Node; b: Node }
  | { t: "fn"; name: string; a: Node };

export class ParseError extends Error {}

const FUNCTIONS: Record<string, (x: number) => number> = {
  sin: Math.sin,
  sen: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  tg: Math.tan,
  sqrt: Math.sqrt,
  raiz: Math.sqrt,
  ln: Math.log,
  log: Math.log10,
  exp: Math.exp,
  abs: Math.abs,
};

const CONSTANTS: Record<string, number> = { pi: Math.PI, e: Math.E };

type Tok =
  | { k: "num"; v: number }
  | { k: "id"; v: string }
  | { k: "op"; v: string };

const SUPERSCRIPTS: Record<string, string> = { "²": "^2", "³": "^3", "⁴": "^4" };

function normalize(src: string): string {
  let s = src.trim();
  s = s.replace(/[²³⁴]/g, (m) => SUPERSCRIPTS[m]);
  s = s.replace(/[−–—]/g, "-").replace(/[×·∙⋅]/g, "*").replace(/÷/g, "/").replace(/:/g, "/");
  s = s.replace(/π/g, "pi").replace(/√/g, "sqrt");
  s = s.replace(/\*\*/g, "^");
  return s;
}

export function tokenize(src: string, variables: string[] = []): Tok[] {
  const s = normalize(src);
  const names = [
    ...Object.keys(FUNCTIONS),
    ...Object.keys(CONSTANTS),
    ...variables,
  ].sort((a, b) => b.length - a.length);
  const toks: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === " ") {
      i++;
      continue;
    }
    if (/[0-9]/.test(c) || ((c === "." || c === ",") && /[0-9]/.test(s[i + 1] ?? ""))) {
      let j = i;
      while (j < s.length && /[0-9]/.test(s[j])) j++;
      if ((s[j] === "." || s[j] === ",") && /[0-9]/.test(s[j + 1] ?? "")) {
        j++;
        while (j < s.length && /[0-9]/.test(s[j])) j++;
      }
      toks.push({ k: "num", v: parseFloat(s.slice(i, j).replace(",", ".")) });
      i = j;
      continue;
    }
    if (/[a-zA-Záéíóú_]/.test(c)) {
      const rest = s.slice(i);
      const known = names.find((n) => rest.startsWith(n));
      if (known) {
        toks.push({ k: "id", v: known });
        i += known.length;
        continue;
      }
      // Letra suelta: variable de una letra (permite "xy" = x·y).
      toks.push({ k: "id", v: c });
      i++;
      continue;
    }
    if ("+-*/^()|".includes(c)) {
      toks.push({ k: "op", v: c });
      i++;
      continue;
    }
    throw new ParseError(`No entiendo el símbolo «${c}».`);
  }
  return toks;
}

class Parser {
  private i = 0;
  constructor(private toks: Tok[]) {}

  parse(): Node {
    if (this.toks.length === 0) throw new ParseError("La expresión está vacía.");
    const n = this.expr();
    if (this.i < this.toks.length) throw new ParseError("Sobra algo al final de la expresión.");
    return n;
  }

  private peek(): Tok | undefined {
    return this.toks[this.i];
  }

  private isOp(v: string): boolean {
    const t = this.peek();
    return !!t && t.k === "op" && t.v === v;
  }

  private expr(): Node {
    let n = this.term();
    while (this.isOp("+") || this.isOp("-")) {
      const op = (this.toks[this.i++] as { v: "+" | "-" }).v;
      n = { t: "bin", op, a: n, b: this.term() };
    }
    return n;
  }

  private startsFactor(): boolean {
    const t = this.peek();
    if (!t) return false;
    return t.k === "num" || t.k === "id" || (t.k === "op" && t.v === "(");
  }

  private term(): Node {
    let n = this.unary();
    for (;;) {
      if (this.isOp("*") || this.isOp("/")) {
        const op = (this.toks[this.i++] as { v: "*" | "/" }).v;
        n = { t: "bin", op, a: n, b: this.unary() };
      } else if (this.startsFactor()) {
        n = { t: "bin", op: "*", a: n, b: this.power() };
      } else break;
    }
    return n;
  }

  private unary(): Node {
    if (this.isOp("-")) {
      this.i++;
      return { t: "un", op: "-", a: this.unary() };
    }
    if (this.isOp("+")) {
      this.i++;
      return this.unary();
    }
    return this.power();
  }

  private power(): Node {
    const base = this.primary();
    if (this.isOp("^")) {
      this.i++;
      return { t: "bin", op: "^", a: base, b: this.unary() };
    }
    return base;
  }

  private primary(): Node {
    const t = this.peek();
    if (!t) throw new ParseError("La expresión termina antes de tiempo.");
    if (t.k === "num") {
      this.i++;
      return { t: "num", v: t.v };
    }
    if (t.k === "id") {
      this.i++;
      if (FUNCTIONS[t.v]) {
        if (this.isOp("(")) {
          this.i++;
          const a = this.expr();
          this.expect(")");
          return { t: "fn", name: t.v, a };
        }
        return { t: "fn", name: t.v, a: this.power() };
      }
      if (CONSTANTS[t.v] !== undefined) return { t: "num", v: CONSTANTS[t.v] };
      return { t: "var", name: t.v };
    }
    if (t.v === "(") {
      this.i++;
      const n = this.expr();
      this.expect(")");
      return n;
    }
    if (t.v === "|") {
      this.i++;
      const n = this.expr();
      this.expect("|");
      return { t: "fn", name: "abs", a: n };
    }
    throw new ParseError(`No esperaba «${t.v}» en ese lugar.`);
  }

  private expect(v: string) {
    if (!this.isOp(v)) throw new ParseError(v === ")" ? "Falta cerrar un paréntesis." : `Falta «${v}».`);
    this.i++;
  }
}

export function parse(src: string, variables: string[] = []): Node {
  return new Parser(tokenize(src, variables)).parse();
}

export function evaluate(n: Node, env: Record<string, number> = {}): number {
  switch (n.t) {
    case "num":
      return n.v;
    case "var": {
      const v = env[n.name];
      if (v === undefined) throw new ParseError(`La variable «${n.name}» no tiene valor.`);
      return v;
    }
    case "un":
      return -evaluate(n.a, env);
    case "fn":
      return FUNCTIONS[n.name](evaluate(n.a, env));
    case "bin": {
      const a = evaluate(n.a, env);
      const b = evaluate(n.b, env);
      switch (n.op) {
        case "+":
          return a + b;
        case "-":
          return a - b;
        case "*":
          return a * b;
        case "/":
          return a / b;
        case "^":
          return Math.pow(a, b);
      }
    }
  }
}

export function variablesOf(n: Node, out = new Set<string>()): Set<string> {
  if (n.t === "var") out.add(n.name);
  else if (n.t === "un" || n.t === "fn") variablesOf(n.a, out);
  else if (n.t === "bin") {
    variablesOf(n.a, out);
    variablesOf(n.b, out);
  }
  return out;
}

/** Evalúa una expresión sin variables (p. ej. "3/4" o "2,5·10^3"). Devuelve null si no es válida. */
export function evalNumber(src: string): number | null {
  try {
    const n = parse(src);
    if (variablesOf(n).size > 0) return null;
    const v = evaluate(n);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

/** Compila una expresión de una variable para graficar. */
export function compileFn(src: string, variable = "x"): (x: number) => number {
  const n = parse(src, [variable]);
  return (x: number) => {
    try {
      return evaluate(n, { [variable]: x });
    } catch {
      return NaN;
    }
  };
}

function frac(x: number): number {
  return ((x % 1) + 1) % 1;
}

export function nearlyEqual(a: number, b: number, absTol = 1e-9, relTol = 1e-6): boolean {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  return Math.abs(a - b) <= Math.max(absTol, relTol * Math.max(Math.abs(a), Math.abs(b)));
}

/** Equivalencia de expresiones por muestreo numérico (robusto para álgebra escolar). */
export function equivalent(
  a: string,
  b: string,
  variables: string[],
  range: [number, number] = [-5, 5],
): boolean {
  const na = parse(a, variables);
  const nb = parse(b, variables);
  const samples = 12;
  let compared = 0;
  for (let k = 0; k < samples; k++) {
    const env: Record<string, number> = {};
    // Puntos no enteros y distintos por variable, para evitar coincidencias.
    variables.forEach((v, idx) => {
      env[v] = range[0] + (range[1] - range[0]) * frac(k * 0.6180339887 + idx * 0.3772 + 0.137);
    });
    let va: number, vb: number;
    try {
      va = evaluate(na, env);
      vb = evaluate(nb, env);
    } catch {
      return false;
    }
    if (!Number.isFinite(va) && !Number.isFinite(vb)) continue;
    if (!nearlyEqual(va, vb, 1e-7, 1e-6)) return false;
    compared++;
  }
  return compared >= 4;
}

// ───────────────────────── Ecuaciones lineales ─────────────────────────

export interface LinearForm {
  /** a·x + b = 0 (lado izquierdo menos lado derecho). */
  a: number;
  b: number;
  linear: boolean;
}

export function splitEquation(src: string): [string, string] {
  const parts = normalize(src).split("=");
  if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim())
    throw new ParseError("Un paso tiene que ser una igualdad, por ejemplo «2x = 10».");
  return [parts[0], parts[1]];
}

export function linearForm(src: string, variable = "x"): LinearForm {
  const [l, r] = splitEquation(src);
  const nl = parse(l, [variable]);
  const nr = parse(r, [variable]);
  for (const name of [...variablesOf(nl), ...variablesOf(nr)]) {
    if (name !== variable) throw new ParseError(`Usá solo la incógnita «${variable}».`);
  }
  const f = (x: number) => evaluate(nl, { [variable]: x }) - evaluate(nr, { [variable]: x });
  const b = f(0);
  const a = f(1) - b;
  const linear = nearlyEqual(f(2), 2 * a + b, 1e-9) && nearlyEqual(f(-3), -3 * a + b, 1e-9);
  return { a, b, linear };
}

/** Solución de una ecuación lineal; null si no tiene solución única. */
export function solveLinear(src: string, variable = "x"): number | null {
  const { a, b, linear } = linearForm(src, variable);
  if (!linear || Math.abs(a) < 1e-12) return null;
  return -b / a;
}

// ───────────────────────── Formato ─────────────────────────

/** Formatea un número al estilo argentino (coma decimal). */
export function fmt(n: number, maxDecimals = 4): string {
  if (!Number.isFinite(n)) return "—";
  const r = Math.round(n * 10 ** maxDecimals) / 10 ** maxDecimals;
  const s = Object.is(r, -0) ? "0" : String(r);
  return s.replace(".", ",").replace("-", "−");
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Fracción irreducible como texto ("7/12", "−3/4", "5"). */
export function fracText(num: number, den: number): string {
  const g = gcd(num, den);
  let n = num / g;
  let d = den / g;
  if (d < 0) {
    n = -n;
    d = -d;
  }
  return d === 1 ? fmt(n) : `${fmt(n)}/${d}`;
}
