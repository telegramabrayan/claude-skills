/**
 * Intérprete de un subconjunto educativo de Python, con traza paso a paso.
 *
 * Soporta: asignación (=, +=, -=, *=, /=), print, if/elif/else, while,
 * for ... in range(...) o en listas/cadenas, def/return, break/continue/pass,
 * listas con índice, len/abs/min/max/round/int/float/str/sum, and/or/not.
 *
 * No ejecuta nada fuera de este lenguaje (no hay imports ni acceso al sistema),
 * así que es seguro correrlo en el navegador. Cada sentencia ejecutada genera
 * una "foto" del estado para el visualizador.
 */

export type Value = number | string | boolean | null | Value[] | FunctionValue;

interface FunctionValue {
  kind: "fn";
  name: string;
  params: string[];
  body: Stmt[];
}

type Expr =
  | { t: "num"; v: number }
  | { t: "str"; v: string }
  | { t: "const"; v: boolean | null }
  | { t: "name"; v: string }
  | { t: "list"; items: Expr[] }
  | { t: "index"; obj: Expr; idx: Expr }
  | { t: "call"; fn: string; args: Expr[] }
  | { t: "un"; op: "-" | "not"; a: Expr }
  | { t: "bin"; op: string; a: Expr; b: Expr };

type Stmt =
  | { t: "assign"; line: number; target: string; index?: Expr; op: string; value: Expr }
  | { t: "expr"; line: number; e: Expr }
  | { t: "if"; line: number; branches: { cond: Expr | null; body: Stmt[]; line: number }[] }
  | { t: "while"; line: number; cond: Expr; body: Stmt[] }
  | { t: "for"; line: number; v: string; iter: Expr; body: Stmt[] }
  | { t: "def"; line: number; name: string; params: string[]; body: Stmt[] }
  | { t: "return"; line: number; e: Expr | null }
  | { t: "break"; line: number }
  | { t: "continue"; line: number }
  | { t: "pass"; line: number };

export class CodeError extends Error {
  constructor(message: string, public line: number, public kind: "sintaxis" | "ejecucion") {
    super(message);
  }
}

export interface TraceStep {
  line: number;
  scope: string;
  vars: Record<string, string>;
  output: string[];
  /** Variables que cambiaron en este paso. */
  changed: string[];
}

export interface RunResult {
  ok: boolean;
  steps: TraceStep[];
  output: string[];
  globals: Record<string, Value>;
  error?: { message: string; line: number; kind: "sintaxis" | "ejecucion" };
}

// ───────────────────────── Léxico de expresiones ─────────────────────────

type Tok = { k: "num" | "str" | "name" | "op"; v: string };

const OPS = ["**", "//", "==", "!=", "<=", ">=", "+", "-", "*", "/", "%", "<", ">", "(", ")", "[", "]", ","];

function lex(src: string, line: number): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === " " || c === "\t") {
      i++;
      continue;
    }
    if (c === "#") break;
    if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(src[i + 1] ?? ""))) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      toks.push({ k: "num", v: src.slice(i, j) });
      i = j;
      continue;
    }
    if (c === '"' || c === "'") {
      const j = src.indexOf(c, i + 1);
      if (j < 0) throw new CodeError("Falta cerrar las comillas del texto.", line, "sintaxis");
      toks.push({ k: "str", v: src.slice(i + 1, j) });
      i = j + 1;
      continue;
    }
    if (/[A-Za-z_áéíóúñ]/.test(c)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_áéíóúñ]/.test(src[j])) j++;
      toks.push({ k: "name", v: src.slice(i, j) });
      i = j;
      continue;
    }
    const op = OPS.find((o) => src.startsWith(o, i));
    if (op) {
      toks.push({ k: "op", v: op });
      i += op.length;
      continue;
    }
    throw new CodeError(`No reconozco el símbolo «${c}».`, line, "sintaxis");
  }
  return toks;
}

class ExprParser {
  private i = 0;
  constructor(private toks: Tok[], private line: number) {}

  parseAll(): Expr {
    const e = this.or();
    if (this.i < this.toks.length) this.fail(`Sobra «${this.toks[this.i].v}».`);
    return e;
  }

  private fail(msg: string): never {
    throw new CodeError(msg, this.line, "sintaxis");
  }

  private peekIs(v: string): boolean {
    const t = this.toks[this.i];
    return !!t && (t.k === "op" || t.k === "name") && t.v === v;
  }

  private eat(v: string) {
    if (!this.peekIs(v)) this.fail(v === ")" ? "Falta cerrar un paréntesis." : `Se esperaba «${v}».`);
    this.i++;
  }

  private or(): Expr {
    let a = this.and();
    while (this.peekIs("or")) {
      this.i++;
      a = { t: "bin", op: "or", a, b: this.and() };
    }
    return a;
  }

  private and(): Expr {
    let a = this.not();
    while (this.peekIs("and")) {
      this.i++;
      a = { t: "bin", op: "and", a, b: this.not() };
    }
    return a;
  }

  private not(): Expr {
    if (this.peekIs("not")) {
      this.i++;
      return { t: "un", op: "not", a: this.not() };
    }
    return this.cmp();
  }

  private cmp(): Expr {
    let a = this.add();
    while (["==", "!=", "<", "<=", ">", ">="].some((o) => this.peekIs(o))) {
      const op = this.toks[this.i++].v;
      a = { t: "bin", op, a, b: this.add() };
    }
    return a;
  }

  private add(): Expr {
    let a = this.mul();
    while (this.peekIs("+") || this.peekIs("-")) {
      const op = this.toks[this.i++].v;
      a = { t: "bin", op, a, b: this.mul() };
    }
    return a;
  }

  private mul(): Expr {
    let a = this.unary();
    while (["*", "/", "//", "%"].some((o) => this.peekIs(o))) {
      const op = this.toks[this.i++].v;
      a = { t: "bin", op, a, b: this.unary() };
    }
    return a;
  }

  private unary(): Expr {
    if (this.peekIs("-")) {
      this.i++;
      return { t: "un", op: "-", a: this.unary() };
    }
    if (this.peekIs("+")) {
      this.i++;
      return this.unary();
    }
    return this.pow();
  }

  private pow(): Expr {
    const a = this.postfix();
    if (this.peekIs("**")) {
      this.i++;
      return { t: "bin", op: "**", a, b: this.unary() };
    }
    return a;
  }

  private postfix(): Expr {
    let e = this.primary();
    while (this.peekIs("[")) {
      this.i++;
      const idx = this.or();
      this.eat("]");
      e = { t: "index", obj: e, idx };
    }
    return e;
  }

  private primary(): Expr {
    const t = this.toks[this.i];
    if (!t) this.fail("La expresión está incompleta.");
    if (t.k === "num") {
      this.i++;
      return { t: "num", v: parseFloat(t.v) };
    }
    if (t.k === "str") {
      this.i++;
      return { t: "str", v: t.v };
    }
    if (t.k === "name") {
      this.i++;
      if (t.v === "True" || t.v === "False") return { t: "const", v: t.v === "True" };
      if (t.v === "None") return { t: "const", v: null };
      if (this.peekIs("(")) {
        this.i++;
        const args: Expr[] = [];
        if (!this.peekIs(")")) {
          args.push(this.or());
          while (this.peekIs(",")) {
            this.i++;
            args.push(this.or());
          }
        }
        this.eat(")");
        return { t: "call", fn: t.v, args };
      }
      return { t: "name", v: t.v };
    }
    if (t.v === "(") {
      this.i++;
      const e = this.or();
      this.eat(")");
      return e;
    }
    if (t.v === "[") {
      this.i++;
      const items: Expr[] = [];
      if (!this.peekIs("]")) {
        items.push(this.or());
        while (this.peekIs(",")) {
          this.i++;
          items.push(this.or());
        }
      }
      this.eat("]");
      return { t: "list", items };
    }
    this.fail(`No esperaba «${t.v}» acá.`);
  }
}

function parseExpr(src: string, line: number): Expr {
  if (!src.trim()) throw new CodeError("Falta una expresión.", line, "sintaxis");
  return new ExprParser(lex(src, line), line).parseAll();
}

// ───────────────────────── Sentencias ─────────────────────────

interface Line {
  no: number;
  indent: number;
  text: string;
}

function stripComment(s: string): string {
  let q: string | null = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === q) q = null;
    } else if (c === '"' || c === "'") q = c;
    else if (c === "#") return s.slice(0, i);
  }
  return s;
}

function toLines(src: string): Line[] {
  const out: Line[] = [];
  src.replace(/\t/g, "    ").split("\n").forEach((raw, idx) => {
    const text = stripComment(raw).replace(/\s+$/, "");
    if (!text.trim()) return;
    out.push({ no: idx + 1, indent: text.length - text.trimStart().length, text: text.trim() });
  });
  return out;
}

class StmtParser {
  private i = 0;
  constructor(private lines: Line[]) {}

  parseProgram(): Stmt[] {
    if (this.lines.length && this.lines[0].indent !== 0)
      throw new CodeError("La primera línea no debería tener sangría.", this.lines[0].no, "sintaxis");
    const body = this.block(0);
    if (this.i < this.lines.length) {
      const l = this.lines[this.i];
      throw new CodeError("Sangría inesperada.", l.no, "sintaxis");
    }
    return body;
  }

  private block(indent: number): Stmt[] {
    const out: Stmt[] = [];
    while (this.i < this.lines.length) {
      const l = this.lines[this.i];
      if (l.indent < indent) break;
      if (l.indent > indent) throw new CodeError("Sangría inesperada: esta línea está más adentro que las anteriores.", l.no, "sintaxis");
      out.push(this.statement());
    }
    return out;
  }

  private body(header: Line): Stmt[] {
    const next = this.lines[this.i];
    if (!next || next.indent <= header.indent)
      throw new CodeError("Después de «:» el bloque tiene que ir con sangría (4 espacios).", header.no, "sintaxis");
    return this.block(next.indent);
  }

  private header(l: Line, kw: string): string {
    if (!l.text.endsWith(":")) throw new CodeError(`Falta «:» al final del «${kw}».`, l.no, "sintaxis");
    return l.text.slice(kw.length, -1).trim();
  }

  private statement(): Stmt {
    const l = this.lines[this.i++];
    const t = l.text;
    const word = t.split(/[\s(:]/)[0];

    if (word === "if") {
      const branches: { cond: Expr | null; body: Stmt[]; line: number }[] = [];
      branches.push({ cond: parseExpr(this.header(l, "if"), l.no), body: this.body(l), line: l.no });
      while (this.i < this.lines.length && this.lines[this.i].indent === l.indent) {
        const n = this.lines[this.i];
        const w = n.text.split(/[\s:]/)[0];
        if (w === "elif") {
          this.i++;
          branches.push({ cond: parseExpr(this.header(n, "elif"), n.no), body: this.body(n), line: n.no });
        } else if (w === "else") {
          this.i++;
          this.header(n, "else");
          branches.push({ cond: null, body: this.body(n), line: n.no });
          break;
        } else break;
      }
      return { t: "if", line: l.no, branches };
    }
    if (word === "elif" || word === "else")
      throw new CodeError(`«${word}» tiene que ir justo después de un «if».`, l.no, "sintaxis");
    if (word === "while") {
      return { t: "while", line: l.no, cond: parseExpr(this.header(l, "while"), l.no), body: this.body(l) };
    }
    if (word === "for") {
      const h = this.header(l, "for");
      const m = h.match(/^([A-Za-z_]\w*)\s+in\s+(.+)$/);
      if (!m) throw new CodeError("El for se escribe así: for i in range(5):", l.no, "sintaxis");
      return { t: "for", line: l.no, v: m[1], iter: parseExpr(m[2], l.no), body: this.body(l) };
    }
    if (word === "def") {
      const h = this.header(l, "def");
      const m = h.match(/^([A-Za-z_]\w*)\s*\(([^)]*)\)$/);
      if (!m) throw new CodeError("Una función se define así: def nombre(a, b):", l.no, "sintaxis");
      const params = m[2].split(",").map((p) => p.trim()).filter(Boolean);
      return { t: "def", line: l.no, name: m[1], params, body: this.body(l) };
    }
    if (word === "return") {
      const rest = t.slice(6).trim();
      return { t: "return", line: l.no, e: rest ? parseExpr(rest, l.no) : null };
    }
    if (t === "break") return { t: "break", line: l.no };
    if (t === "continue") return { t: "continue", line: l.no };
    if (t === "pass") return { t: "pass", line: l.no };
    if (t.endsWith(":")) throw new CodeError(`No reconozco la instrucción «${word}».`, l.no, "sintaxis");

    const am = t.match(/^([A-Za-z_áéíóúñ]\w*)\s*(\[(.+)\])?\s*(\+=|-=|\*=|\/=|=)(?!=)\s*(.*)$/);
    if (am) {
      if (!am[5].trim()) throw new CodeError("Falta el valor a la derecha del «=».", l.no, "sintaxis");
      return {
        t: "assign",
        line: l.no,
        target: am[1],
        index: am[3] ? parseExpr(am[3], l.no) : undefined,
        op: am[4],
        value: parseExpr(am[5], l.no),
      };
    }
    return { t: "expr", line: l.no, e: parseExpr(t, l.no) };
  }
}

export function parseProgram(src: string): Stmt[] {
  return new StmtParser(toLines(src)).parseProgram();
}

// ───────────────────────── Ejecución ─────────────────────────

class BreakSignal {}
class ContinueSignal {}
class ReturnSignal {
  constructor(public value: Value) {}
}

export function formatValue(v: Value): string {
  if (v === null) return "None";
  if (v === true) return "True";
  if (v === false) return "False";
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : String(Math.round(v * 1e10) / 1e10);
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return `[${v.map((x) => (typeof x === "string" ? `'${x}'` : formatValue(x))).join(", ")}]`;
  return `<función ${v.name}>`;
}

function reprValue(v: Value): string {
  return typeof v === "string" ? `"${v}"` : formatValue(v);
}

function truthy(v: Value): boolean {
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object" && v !== null) return true;
  return !!v;
}

const MAX_STEPS = 3000;

export function run(src: string, opts: { maxSteps?: number } = {}): RunResult {
  const maxSteps = opts.maxSteps ?? MAX_STEPS;
  const globals: Record<string, Value> = {};
  const steps: TraceStep[] = [];
  const output: string[] = [];
  const frames: { name: string; vars: Record<string, Value> }[] = [{ name: "global", vars: globals }];
  let prevSnapshot: Record<string, string> = {};

  const frame = () => frames[frames.length - 1];

  const snapshot = (line: number) => {
    const vars: Record<string, string> = {};
    const f = frame();
    for (const [k, v] of Object.entries(f.vars)) {
      if (typeof v === "object" && v !== null && !Array.isArray(v)) continue;
      vars[k] = reprValue(v);
    }
    const changed = Object.keys(vars).filter((k) => prevSnapshot[k] !== vars[k]);
    prevSnapshot = vars;
    steps.push({ line, scope: f.name, vars, output: [...output], changed });
    if (steps.length > maxSteps)
      throw new CodeError(
        `El programa superó ${maxSteps} pasos. ¿Hay un bucle que nunca termina? Revisá que la condición del while llegue a ser falsa.`,
        line,
        "ejecucion",
      );
  };

  const lookup = (name: string, line: number): Value => {
    const f = frame();
    if (name in f.vars) return f.vars[name];
    if (name in globals) return globals[name];
    throw new CodeError(`La variable «${name}» no está definida todavía.`, line, "ejecucion");
  };

  const num = (v: Value, line: number, what: string): number => {
    if (typeof v === "number") return v;
    if (typeof v === "boolean") return v ? 1 : 0;
    throw new CodeError(`${what} necesita números y recibió ${reprValue(v)}.`, line, "ejecucion");
  };

  const builtins: Record<string, (args: Value[], line: number) => Value> = {
    print: (args) => {
      output.push(args.map(formatValue).join(" "));
      return null;
    },
    len: (args, line) => {
      const v = args[0];
      if (typeof v === "string" || Array.isArray(v)) return v.length;
      throw new CodeError("len() necesita un texto o una lista.", line, "ejecucion");
    },
    abs: (a, l) => Math.abs(num(a[0], l, "abs()")),
    round: (a, l) => {
      const x = num(a[0], l, "round()");
      const d = a[1] === undefined ? 0 : num(a[1], l, "round()");
      return Math.round(x * 10 ** d) / 10 ** d;
    },
    int: (a, l) => (typeof a[0] === "string" ? parseInt(a[0], 10) : Math.trunc(num(a[0], l, "int()"))),
    float: (a, l) => (typeof a[0] === "string" ? parseFloat(a[0]) : num(a[0], l, "float()")),
    str: (a) => formatValue(a[0]),
    min: (a, l) => Math.min(...(Array.isArray(a[0]) ? a[0] : a).map((x) => num(x, l, "min()"))),
    max: (a, l) => Math.max(...(Array.isArray(a[0]) ? a[0] : a).map((x) => num(x, l, "max()"))),
    sum: (a, l) => (Array.isArray(a[0]) ? a[0] : []).reduce<number>((s, x) => s + num(x, l, "sum()"), 0),
    range: (a, l) => {
      const n = a.map((x) => num(x, l, "range()"));
      const [start, stop, step] = n.length === 1 ? [0, n[0], 1] : [n[0], n[1], n[2] ?? 1];
      if (step === 0) throw new CodeError("range() no puede avanzar de a 0.", l, "ejecucion");
      const out: number[] = [];
      for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
        out.push(i);
        if (out.length > 10000) break;
      }
      return out;
    },
  };

  const binop = (op: string, a: Value, b: Value, line: number): Value => {
    switch (op) {
      case "+":
        if (typeof a === "string" && typeof b === "string") return a + b;
        if (Array.isArray(a) && Array.isArray(b)) return [...a, ...b];
        if (typeof a === "string" || typeof b === "string")
          throw new CodeError("No se puede sumar texto con números. Usá str(numero) para convertirlo.", line, "ejecucion");
        return num(a, line, "+") + num(b, line, "+");
      case "-":
        return num(a, line, "-") - num(b, line, "-");
      case "*":
        if (typeof a === "string" && typeof b === "number") return a.repeat(Math.max(0, b));
        return num(a, line, "*") * num(b, line, "*");
      case "/": {
        const d = num(b, line, "/");
        if (d === 0) throw new CodeError("División por cero.", line, "ejecucion");
        return num(a, line, "/") / d;
      }
      case "//": {
        const d = num(b, line, "//");
        if (d === 0) throw new CodeError("División por cero.", line, "ejecucion");
        return Math.floor(num(a, line, "//") / d);
      }
      case "%": {
        const d = num(b, line, "%");
        if (d === 0) throw new CodeError("Resto de una división por cero.", line, "ejecucion");
        const x = num(a, line, "%");
        return ((x % d) + d) % d;
      }
      case "**":
        return num(a, line, "**") ** num(b, line, "**");
      case "==":
        return formatValue(a) === formatValue(b) && typeof a === typeof b;
      case "!=":
        return !(formatValue(a) === formatValue(b) && typeof a === typeof b);
      case "<":
      case "<=":
      case ">":
      case ">=": {
        if (typeof a === "string" && typeof b === "string") {
          return op === "<" ? a < b : op === "<=" ? a <= b : op === ">" ? a > b : a >= b;
        }
        const x = num(a, line, op);
        const y = num(b, line, op);
        return op === "<" ? x < y : op === "<=" ? x <= y : op === ">" ? x > y : x >= y;
      }
    }
    throw new CodeError(`Operador desconocido ${op}.`, line, "ejecucion");
  };

  const evalE = (e: Expr, line: number): Value => {
    switch (e.t) {
      case "num":
        return e.v;
      case "str":
        return e.v;
      case "const":
        return e.v;
      case "name":
        return lookup(e.v, line);
      case "list":
        return e.items.map((x) => evalE(x, line));
      case "index": {
        const o = evalE(e.obj, line);
        const i = num(evalE(e.idx, line), line, "El índice");
        if (typeof o !== "string" && !Array.isArray(o))
          throw new CodeError("Solo se puede indexar un texto o una lista.", line, "ejecucion");
        const k = i < 0 ? o.length + i : i;
        if (k < 0 || k >= o.length)
          throw new CodeError(`Índice ${i} fuera de rango (la lista tiene ${o.length} elementos, del 0 al ${o.length - 1}).`, line, "ejecucion");
        return o[k];
      }
      case "un":
        if (e.op === "not") return !truthy(evalE(e.a, line));
        return -num(evalE(e.a, line), line, "El signo menos");
      case "bin":
        if (e.op === "and") {
          const a = evalE(e.a, line);
          return truthy(a) ? evalE(e.b, line) : a;
        }
        if (e.op === "or") {
          const a = evalE(e.a, line);
          return truthy(a) ? a : evalE(e.b, line);
        }
        return binop(e.op, evalE(e.a, line), evalE(e.b, line), line);
      case "call": {
        const args = e.args.map((a) => evalE(a, line));
        const user = frame().vars[e.fn] ?? globals[e.fn];
        if (user && typeof user === "object" && !Array.isArray(user) && user.kind === "fn") {
          if (args.length !== user.params.length)
            throw new CodeError(`${user.name}() espera ${user.params.length} valores y recibió ${args.length}.`, line, "ejecucion");
          if (frames.length > 100) throw new CodeError("Demasiadas llamadas anidadas (¿recursión sin caso base?).", line, "ejecucion");
          const vars: Record<string, Value> = {};
          user.params.forEach((p, idx) => (vars[p] = args[idx]));
          frames.push({ name: user.name, vars });
          prevSnapshot = {};
          let result: Value = null;
          try {
            execBlock(user.body);
          } catch (s) {
            if (s instanceof ReturnSignal) result = s.value;
            else throw s;
          } finally {
            frames.pop();
            prevSnapshot = {};
          }
          return result;
        }
        const b = builtins[e.fn];
        if (!b) throw new CodeError(`No existe la función «${e.fn}».`, line, "ejecucion");
        return b(args, line);
      }
    }
  };

  const execBlock = (stmts: Stmt[]) => {
    for (const s of stmts) exec(s);
  };

  const exec = (s: Stmt) => {
    switch (s.t) {
      case "assign": {
        const f = frame();
        const v = evalE(s.value, s.line);
        if (s.index) {
          const list = lookup(s.target, s.line);
          if (!Array.isArray(list)) throw new CodeError(`«${s.target}» no es una lista.`, s.line, "ejecucion");
          const i = num(evalE(s.index, s.line), s.line, "El índice");
          const k = i < 0 ? list.length + i : i;
          if (k < 0 || k >= list.length) throw new CodeError(`Índice ${i} fuera de rango.`, s.line, "ejecucion");
          list[k] = s.op === "=" ? v : binop(s.op[0], list[k], v, s.line);
        } else if (s.op === "=") f.vars[s.target] = v;
        else f.vars[s.target] = binop(s.op[0], lookup(s.target, s.line), v, s.line);
        snapshot(s.line);
        return;
      }
      case "expr":
        evalE(s.e, s.line);
        snapshot(s.line);
        return;
      case "if":
        for (const b of s.branches) {
          if (b.cond === null || truthy(evalE(b.cond, b.line))) {
            snapshot(b.line);
            execBlock(b.body);
            return;
          }
        }
        snapshot(s.line);
        return;
      case "while":
        for (;;) {
          const c = truthy(evalE(s.cond, s.line));
          snapshot(s.line);
          if (!c) break;
          try {
            execBlock(s.body);
          } catch (sig) {
            if (sig instanceof BreakSignal) break;
            if (sig instanceof ContinueSignal) continue;
            throw sig;
          }
        }
        return;
      case "for": {
        const it = evalE(s.iter, s.line);
        const items: Value[] = typeof it === "string" ? it.split("") : Array.isArray(it) ? [...it] : [];
        if (typeof it !== "string" && !Array.isArray(it))
          throw new CodeError("El for necesita recorrer un range(), una lista o un texto.", s.line, "ejecucion");
        for (const item of items) {
          frame().vars[s.v] = item;
          snapshot(s.line);
          try {
            execBlock(s.body);
          } catch (sig) {
            if (sig instanceof BreakSignal) break;
            if (sig instanceof ContinueSignal) continue;
            throw sig;
          }
        }
        return;
      }
      case "def":
        frame().vars[s.name] = { kind: "fn", name: s.name, params: s.params, body: s.body };
        snapshot(s.line);
        return;
      case "return":
        snapshot(s.line);
        throw new ReturnSignal(s.e ? evalE(s.e, s.line) : null);
      case "break":
        snapshot(s.line);
        throw new BreakSignal();
      case "continue":
        snapshot(s.line);
        throw new ContinueSignal();
      case "pass":
        snapshot(s.line);
        return;
    }
  };

  try {
    const program = parseProgram(src);
    execBlock(program);
    return { ok: true, steps, output, globals };
  } catch (e) {
    if (e instanceof CodeError) {
      return { ok: false, steps, output, globals, error: { message: e.message, line: e.line, kind: e.kind } };
    }
    if (e instanceof ReturnSignal || e instanceof BreakSignal || e instanceof ContinueSignal) {
      const what = e instanceof ReturnSignal ? "return" : e instanceof BreakSignal ? "break" : "continue";
      return {
        ok: false,
        steps,
        output,
        globals,
        error: { message: `«${what}» solo se puede usar dentro de ${what === "return" ? "una función" : "un bucle"}.`, line: steps.at(-1)?.line ?? 1, kind: "sintaxis" },
      };
    }
    throw e;
  }
}
