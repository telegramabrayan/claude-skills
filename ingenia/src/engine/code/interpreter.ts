/**
 * Intérprete de un subconjunto educativo de Python 3, con traza paso a paso.
 *
 * Soporta: asignación (=, +=, -=, *=, /=, //=, %=, **=), asignación múltiple y
 * desempaquetado (a, b = 1, 2), print (sep=, end=), if/elif/else, while,
 * for ... in (range, str, list, tuple, dict, .items()), def/return (con valores
 * por defecto), break/continue/pass, del, global.
 * Tipos: int, float (con su repr de CPython), str, bool, None, list, tuple,
 * dict (orden de inserción) y range. Índices negativos, slicing [a:b:c],
 * métodos de str/list/tuple/dict, comparaciones encadenadas, `in`/`not in`,
 * `is`, operador ternario y la semántica de // y % de Python (piso hacia −∞).
 * Los errores llevan el tipo de excepción de Python (TypeError, ValueError, …)
 * con el mismo mensaje que CPython.
 *
 * No ejecuta nada fuera de este lenguaje (no hay imports ni acceso al sistema),
 * así que es seguro correrlo en el navegador. Cada sentencia ejecutada genera
 * una "foto" del estado para el visualizador.
 */

// ───────────────────────── Valores ─────────────────────────

export interface FunctionValue {
  kind: "fn";
  name: string;
  params: string[];
  defaults: (Expr | null)[];
  body: Stmt[];
}
/** float de Python (los int son `number` de JS, siempre enteros). */
export interface PyFloat {
  kind: "float";
  v: number;
}
export interface PyTuple {
  kind: "tuple";
  items: Value[];
}
export interface PyDict {
  kind: "dict";
  /** clave normalizada → [clave original, valor]; el Map conserva el orden de inserción. */
  map: Map<string, [Value, Value]>;
}
export interface PyRange {
  kind: "range";
  start: number;
  stop: number;
  step: number;
}
export interface PyView {
  kind: "view";
  of: "keys" | "values" | "items";
  dict: PyDict;
}
export interface PyType {
  kind: "type";
  name: string;
}

export type Value =
  | number
  | string
  | boolean
  | null
  | Value[]
  | FunctionValue
  | PyFloat
  | PyTuple
  | PyDict
  | PyRange
  | PyView
  | PyType;

export type Expr =
  | { t: "num"; v: Value }
  | { t: "str"; v: string }
  | { t: "const"; v: boolean | null }
  | { t: "name"; v: string }
  | { t: "list"; items: Expr[] }
  | { t: "tuple"; items: Expr[] }
  | { t: "dict"; items: [Expr, Expr][] }
  | { t: "index"; obj: Expr; idx: Expr }
  | { t: "slice"; obj: Expr; lo: Expr | null; hi: Expr | null; step: Expr | null }
  | { t: "call"; fn: string; args: Expr[]; kw: [string, Expr][] }
  | { t: "method"; obj: Expr; name: string; args: Expr[]; kw: [string, Expr][] }
  | { t: "un"; op: "-" | "+" | "not"; a: Expr }
  | { t: "bin"; op: string; a: Expr; b: Expr }
  | { t: "cmp"; first: Expr; rest: [string, Expr][] }
  | { t: "ifexp"; cond: Expr; a: Expr; b: Expr };

export type Stmt =
  | { t: "assign"; line: number; targets: Expr[]; value: Expr }
  | { t: "aug"; line: number; target: Expr; op: string; value: Expr }
  | { t: "expr"; line: number; e: Expr }
  | { t: "if"; line: number; branches: { cond: Expr | null; body: Stmt[]; line: number }[] }
  | { t: "while"; line: number; cond: Expr; body: Stmt[] }
  | { t: "for"; line: number; target: Expr; iter: Expr; body: Stmt[] }
  | { t: "def"; line: number; name: string; params: string[]; defaults: (Expr | null)[]; body: Stmt[] }
  | { t: "return"; line: number; e: Expr | null }
  | { t: "del"; line: number; targets: Expr[] }
  | { t: "global"; line: number; names: string[] }
  | { t: "break"; line: number }
  | { t: "continue"; line: number }
  | { t: "pass"; line: number };

export class CodeError extends Error {
  constructor(
    message: string,
    public line: number,
    public kind: "sintaxis" | "ejecucion",
    /** Tipo de excepción de Python (TypeError, ValueError, …) y su mensaje literal. */
    public pyType?: string,
    public pyMessage?: string,
  ) {
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
  /** Líneas impresas (una por línea de la salida estándar). */
  output: string[];
  /** Salida estándar exacta, con los saltos de línea tal como los produce print. */
  stdout: string;
  /** Variables globales al terminar (los float se exponen como number de JS). */
  globals: Record<string, Value>;
  /** repr de Python de cada variable global al terminar (sin funciones). */
  reprs: Record<string, string>;
  error?: { message: string; line: number; kind: "sintaxis" | "ejecucion"; pyType?: string; pyMessage?: string };
}

// ───────────────────────── Helpers de valores ─────────────────────────

const isObj = (v: Value): v is Exclude<Value, number | string | boolean | null | Value[]> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const isFloat = (v: Value): v is PyFloat => isObj(v) && v.kind === "float";
const isTuple = (v: Value): v is PyTuple => isObj(v) && v.kind === "tuple";
const isDict = (v: Value): v is PyDict => isObj(v) && v.kind === "dict";
const isRange = (v: Value): v is PyRange => isObj(v) && v.kind === "range";
const isView = (v: Value): v is PyView => isObj(v) && v.kind === "view";
const isFn = (v: Value): v is FunctionValue => isObj(v) && v.kind === "fn";
const isNum = (v: Value): boolean => typeof v === "number" || typeof v === "boolean" || isFloat(v);
const isIntLike = (v: Value): boolean => typeof v === "number" || typeof v === "boolean";
const numOf = (v: Value): number => (typeof v === "number" ? v : typeof v === "boolean" ? (v ? 1 : 0) : (v as PyFloat).v);
const mkFloat = (v: number): PyFloat => ({ kind: "float", v });
const mkInt = (v: number): number => (Object.is(v, -0) ? 0 : v);
const tuple = (items: Value[]): PyTuple => ({ kind: "tuple", items });

export function typeName(v: Value): string {
  if (v === null) return "NoneType";
  if (typeof v === "boolean") return "bool";
  if (typeof v === "number") return "int";
  if (typeof v === "string") return "str";
  if (Array.isArray(v)) return "list";
  switch (v.kind) {
    case "float":
      return "float";
    case "tuple":
      return "tuple";
    case "dict":
      return "dict";
    case "range":
      return "range";
    case "view":
      return `dict_${v.of}`;
    case "fn":
      return "function";
    case "type":
      return "type";
  }
}

/** repr de un float igual al de CPython (el más corto que vuelve al mismo número). */
export function floatRepr(x: number): string {
  if (Number.isNaN(x)) return "nan";
  if (!Number.isFinite(x)) return x > 0 ? "inf" : "-inf";
  if (x === 0) return Object.is(x, -0) ? "-0.0" : "0.0";
  const sign = x < 0 ? "-" : "";
  const [mant, expS] = Math.abs(x).toExponential().split("e");
  const exp = parseInt(expS, 10);
  const digits = mant.replace(".", "");
  if (exp >= 16 || exp < -4) {
    const m = digits.length > 1 ? `${digits[0]}.${digits.slice(1)}` : digits;
    return `${sign}${m}e${exp < 0 ? "-" : "+"}${String(Math.abs(exp)).padStart(2, "0")}`;
  }
  if (exp < 0) return `${sign}0.${"0".repeat(-exp - 1)}${digits}`;
  if (digits.length <= exp + 1) return `${sign}${digits}${"0".repeat(exp + 1 - digits.length)}.0`;
  return `${sign}${digits.slice(0, exp + 1)}.${digits.slice(exp + 1)}`;
}

function strRepr(s: string): string {
  const q = s.includes("'") && !s.includes('"') ? '"' : "'";
  let out = q;
  for (const c of s) {
    if (c === "\\") out += "\\\\";
    else if (c === q) out += "\\" + c;
    else if (c === "\n") out += "\\n";
    else if (c === "\t") out += "\\t";
    else if (c === "\r") out += "\\r";
    else if (c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127) out += "\\x" + c.charCodeAt(0).toString(16).padStart(2, "0");
    else out += c;
  }
  return out + q;
}

/** repr() de Python. */
export function pyRepr(v: Value): string {
  if (typeof v === "string") return strRepr(v);
  return pyStr(v);
}

/** str() de Python (lo que muestra print). */
export function pyStr(v: Value): string {
  if (v === null) return "None";
  if (v === true) return "True";
  if (v === false) return "False";
  if (typeof v === "number") return String(mkInt(v));
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return `[${v.map(pyRepr).join(", ")}]`;
  switch (v.kind) {
    case "float":
      return floatRepr(v.v);
    case "tuple":
      return v.items.length === 1 ? `(${pyRepr(v.items[0])},)` : `(${v.items.map(pyRepr).join(", ")})`;
    case "dict":
      return `{${[...v.map.values()].map(([k, x]) => `${pyRepr(k)}: ${pyRepr(x)}`).join(", ")}}`;
    case "range":
      return v.step === 1 ? `range(${v.start}, ${v.stop})` : `range(${v.start}, ${v.stop}, ${v.step})`;
    case "view": {
      const items = viewItems(v);
      return `dict_${v.of}([${items.map(pyRepr).join(", ")}])`;
    }
    case "fn":
      return `<function ${v.name}>`;
    case "type":
      return `<class '${v.name}'>`;
  }
}

/** Compatibilidad: formato de print. */
export const formatValue = pyStr;

function viewItems(v: PyView): Value[] {
  const entries = [...v.dict.map.values()];
  if (v.of === "keys") return entries.map((e) => e[0]);
  if (v.of === "values") return entries.map((e) => e[1]);
  return entries.map((e) => tuple([e[0], e[1]]));
}

function truthy(v: Value): boolean {
  if (v === null) return false;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") return v.length > 0;
  if (Array.isArray(v)) return v.length > 0;
  switch (v.kind) {
    case "float":
      return v.v !== 0;
    case "tuple":
      return v.items.length > 0;
    case "dict":
      return v.map.size > 0;
    case "range":
      return rangeLen(v) > 0;
    case "view":
      return v.dict.map.size > 0;
    default:
      return true;
  }
}

function rangeLen(r: PyRange): number {
  if (r.step > 0) return Math.max(0, Math.ceil((r.stop - r.start) / r.step));
  return Math.max(0, Math.ceil((r.start - r.stop) / -r.step));
}

function pyEq(a: Value, b: Value): boolean {
  if (isNum(a) && isNum(b)) return numOf(a) === numOf(b);
  if (typeof a === "string" || typeof b === "string") return a === b;
  if (a === null || b === null) return a === b;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((x, i) => pyEq(x, b[i]));
  }
  if (!isObj(a) || !isObj(b)) return a === b;
  if (a.kind === "tuple" && b.kind === "tuple") return a.items.length === b.items.length && a.items.every((x, i) => pyEq(x, b.items[i]));
  if (a.kind === "dict" && b.kind === "dict") {
    if (a.map.size !== b.map.size) return false;
    for (const [k, [, v]] of a.map) {
      const o = b.map.get(k);
      if (!o || !pyEq(v, o[1])) return false;
    }
    return true;
  }
  if (a.kind === "range" && b.kind === "range") return pyEq(rangeToList(a), rangeToList(b));
  if (a.kind === "type" && b.kind === "type") return a.name === b.name;
  return a === b;
}

function rangeToList(r: PyRange): number[] {
  const n = rangeLen(r);
  if (n > 1_000_000) throw new Error("range demasiado grande");
  return Array.from({ length: n }, (_, i) => r.start + i * r.step);
}

// ───────────────────────── Léxico ─────────────────────────

type Tok = { k: "num" | "str" | "name" | "op"; v: string };

const OPS = [
  "**=", "//=", "...",
  "**", "//", "==", "!=", "<=", ">=", "+=", "-=", "*=", "/=", "%=", "->",
  "+", "-", "*", "/", "%", "<", ">", "(", ")", "[", "]", "{", "}", ",", ":", ".", "=", ";",
];
const AUG = ["+=", "-=", "*=", "/=", "//=", "%=", "**="];

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
      const m = /^(\d[\d_]*\.?[\d_]*|\.\d[\d_]*)([eE][+-]?\d+)?/.exec(src.slice(i))!;
      toks.push({ k: "num", v: m[0].replace(/_/g, "") });
      i += m[0].length;
      continue;
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      let s = "";
      for (;;) {
        if (j >= src.length) throw new CodeError("Falta cerrar las comillas del texto.", line, "sintaxis", "SyntaxError", "unterminated string literal");
        const d = src[j];
        if (d === c) break;
        if (d === "\\" && j + 1 < src.length) {
          const e = src[j + 1];
          const map: Record<string, string> = { n: "\n", t: "\t", r: "\r", "\\": "\\", "'": "'", '"': '"', "0": "\0" };
          s += e in map ? map[e] : "\\" + e;
          j += 2;
          continue;
        }
        s += d;
        j++;
      }
      toks.push({ k: "str", v: s });
      i = j + 1;
      continue;
    }
    if (/[\p{L}_]/u.test(c)) {
      let j = i;
      while (j < src.length && /[\p{L}\p{N}_]/u.test(src[j])) j++;
      const word = src.slice(i, j);
      // f-strings y prefijos no se soportan: avisamos con claridad
      if ((src[j] === '"' || src[j] === "'") && /^[fFrRbBuU]{1,2}$/.test(word))
        throw new CodeError(`Los textos con prefijo «${word}» (por ejemplo f-strings) no están disponibles en este intérprete.`, line, "sintaxis");
      toks.push({ k: "name", v: word });
      i = j;
      continue;
    }
    const op = OPS.find((o) => src.startsWith(o, i));
    if (op) {
      toks.push({ k: "op", v: op });
      i += op.length;
      continue;
    }
    throw new CodeError(`No reconozco el símbolo «${c}».`, line, "sintaxis", "SyntaxError", "invalid syntax");
  }
  return toks;
}

const KEYWORDS = new Set(["and", "or", "not", "in", "is", "if", "else", "elif", "for", "while", "def", "return", "True", "False", "None", "del", "global", "pass", "break", "continue", "lambda", "import", "from", "class", "try", "except"]);

class ExprParser {
  i = 0;
  constructor(private toks: Tok[], private line: number) {}

  done() {
    return this.i >= this.toks.length;
  }

  fail(msg: string): never {
    throw new CodeError(msg, this.line, "sintaxis", "SyntaxError", "invalid syntax");
  }

  peekIs(v: string, off = 0): boolean {
    const t = this.toks[this.i + off];
    return !!t && (t.k === "op" || t.k === "name") && t.v === v;
  }

  eat(v: string) {
    if (!this.peekIs(v)) {
      const closing: Record<string, string> = { ")": "Falta cerrar un paréntesis.", "]": "Falta cerrar un corchete «]».", "}": "Falta cerrar una llave «}»." };
      this.fail(closing[v] ?? `Se esperaba «${v}».`);
    }
    this.i++;
  }

  /** Lista de expresiones separadas por coma: con alguna coma, es una tupla. */
  exprList(): Expr {
    const first = this.test();
    if (!this.peekIs(",")) return first;
    const items = [first];
    while (this.peekIs(",")) {
      this.i++;
      if (this.done() || this.peekIs("=") || this.peekIs(")") || this.peekIs(":") || AUG.some((a) => this.peekIs(a))) break;
      items.push(this.test());
    }
    return { t: "tuple", items };
  }

  parseAll(): Expr {
    const e = this.exprList();
    if (!this.done()) this.fail(`Sobra «${this.toks[this.i].v}».`);
    return e;
  }

  test(): Expr {
    const a = this.or();
    if (this.peekIs("if")) {
      this.i++;
      const cond = this.or();
      this.eat("else");
      return { t: "ifexp", cond, a, b: this.test() };
    }
    return a;
  }

  or(): Expr {
    let a = this.and();
    while (this.peekIs("or")) {
      this.i++;
      a = { t: "bin", op: "or", a, b: this.and() };
    }
    return a;
  }

  and(): Expr {
    let a = this.not();
    while (this.peekIs("and")) {
      this.i++;
      a = { t: "bin", op: "and", a, b: this.not() };
    }
    return a;
  }

  not(): Expr {
    if (this.peekIs("not")) {
      this.i++;
      return { t: "un", op: "not", a: this.not() };
    }
    return this.cmp();
  }

  cmpOp(): string | null {
    for (const o of ["==", "!=", "<", "<=", ">", ">=", "in"]) if (this.peekIs(o)) return (this.i++, o);
    if (this.peekIs("not") && this.peekIs("in", 1)) return (this.i += 2, "not in");
    if (this.peekIs("is")) {
      this.i++;
      if (this.peekIs("not")) return (this.i++, "is not");
      return "is";
    }
    return null;
  }

  cmp(): Expr {
    const first = this.add();
    const rest: [string, Expr][] = [];
    for (let op = this.cmpOp(); op; op = this.cmpOp()) rest.push([op, this.add()]);
    return rest.length ? { t: "cmp", first, rest } : first;
  }

  add(): Expr {
    let a = this.mul();
    while (this.peekIs("+") || this.peekIs("-")) {
      const op = this.toks[this.i++].v;
      a = { t: "bin", op, a, b: this.mul() };
    }
    return a;
  }

  mul(): Expr {
    let a = this.unary();
    while (["*", "/", "//", "%"].some((o) => this.peekIs(o))) {
      const op = this.toks[this.i++].v;
      a = { t: "bin", op, a, b: this.unary() };
    }
    return a;
  }

  unary(): Expr {
    if (this.peekIs("-") || this.peekIs("+")) {
      const op = this.toks[this.i++].v as "-" | "+";
      return { t: "un", op, a: this.unary() };
    }
    return this.pow();
  }

  pow(): Expr {
    const a = this.postfix();
    if (this.peekIs("**")) {
      this.i++;
      return { t: "bin", op: "**", a, b: this.unary() };
    }
    return a;
  }

  args(): { args: Expr[]; kw: [string, Expr][] } {
    const args: Expr[] = [];
    const kw: [string, Expr][] = [];
    while (!this.peekIs(")")) {
      const t = this.toks[this.i];
      if (t && t.k === "name" && this.peekIs("=", 1)) {
        this.i += 2;
        kw.push([t.v, this.test()]);
      } else {
        if (kw.length) this.fail("Los argumentos con nombre (como sep=) van al final.");
        args.push(this.test());
      }
      if (!this.peekIs(",")) break;
      this.i++;
    }
    this.eat(")");
    return { args, kw };
  }

  postfix(): Expr {
    let e = this.primary();
    for (;;) {
      if (this.peekIs("[")) {
        this.i++;
        let lo: Expr | null = null;
        if (!this.peekIs(":")) {
          lo = this.exprList();
          if (this.peekIs("]")) {
            this.i++;
            e = { t: "index", obj: e, idx: lo };
            continue;
          }
        }
        this.eat(":");
        const hi = this.peekIs(":") || this.peekIs("]") ? null : this.test();
        let step: Expr | null = null;
        if (this.peekIs(":")) {
          this.i++;
          if (!this.peekIs("]")) step = this.test();
        }
        this.eat("]");
        e = { t: "slice", obj: e, lo, hi, step };
      } else if (this.peekIs(".")) {
        this.i++;
        const t = this.toks[this.i++];
        if (!t || t.k !== "name") this.fail("Después del punto va el nombre de un método.");
        if (!this.peekIs("(")) this.fail(`Este intérprete solo admite llamar métodos: ${t.v}(…).`);
        this.i++;
        const { args, kw } = this.args();
        e = { t: "method", obj: e, name: t.v, args, kw };
      } else if (this.peekIs("(") && e.t !== "name") {
        this.fail("Solo se pueden llamar funciones por su nombre.");
      } else return e;
    }
  }

  primary(): Expr {
    const t = this.toks[this.i];
    if (!t) this.fail("La expresión está incompleta.");
    if (t.k === "num") {
      this.i++;
      const isF = /[.eE]/.test(t.v);
      return { t: "num", v: isF ? mkFloat(parseFloat(t.v)) : parseInt(t.v, 10) };
    }
    if (t.k === "str") {
      this.i++;
      let s = t.v;
      // literales adyacentes se concatenan: "ab" "cd"
      while (this.toks[this.i]?.k === "str") s += this.toks[this.i++].v;
      return { t: "str", v: s };
    }
    if (t.k === "name") {
      if (t.v === "True" || t.v === "False") return (this.i++, { t: "const", v: t.v === "True" });
      if (t.v === "None") return (this.i++, { t: "const", v: null });
      if (KEYWORDS.has(t.v)) this.fail(`No esperaba «${t.v}» acá.`);
      this.i++;
      if (this.peekIs("(")) {
        this.i++;
        const { args, kw } = this.args();
        return { t: "call", fn: t.v, args, kw };
      }
      return { t: "name", v: t.v };
    }
    if (t.v === "(") {
      this.i++;
      if (this.peekIs(")")) return (this.i++, { t: "tuple", items: [] });
      const e = this.exprList();
      this.eat(")");
      return e;
    }
    if (t.v === "[") {
      this.i++;
      const items: Expr[] = [];
      while (!this.peekIs("]")) {
        items.push(this.test());
        if (!this.peekIs(",")) break;
        this.i++;
      }
      this.eat("]");
      return { t: "list", items };
    }
    if (t.v === "{") {
      this.i++;
      const items: [Expr, Expr][] = [];
      while (!this.peekIs("}")) {
        const k = this.test();
        if (!this.peekIs(":")) this.fail("Los conjuntos {a, b} no están disponibles: en un diccionario cada clave lleva «:» y su valor.");
        this.i++;
        items.push([k, this.test()]);
        if (!this.peekIs(",")) break;
        this.i++;
      }
      this.eat("}");
      return { t: "dict", items };
    }
    this.fail(`No esperaba «${t.v}» acá.`);
  }
}

function parseTokens(toks: Tok[], line: number): Expr {
  if (!toks.length) throw new CodeError("Falta una expresión.", line, "sintaxis", "SyntaxError", "invalid syntax");
  return new ExprParser(toks, line).parseAll();
}

function parseExpr(src: string, line: number): Expr {
  return parseTokens(lex(src, line), line);
}

// ───────────────────────── Sentencias ─────────────────────────

interface Line {
  no: number;
  indent: number;
  text: string;
}

/** Quita el comentario y devuelve también cuántos paréntesis/corchetes/llaves quedan abiertos. */
function scanLine(s: string, depth0: number): { text: string; depth: number } {
  let q: string | null = null;
  let depth = depth0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === "\\") i++;
      else if (c === q) q = null;
    } else if (c === '"' || c === "'") q = c;
    else if (c === "#") return { text: s.slice(0, i), depth };
    else if ("([{".includes(c)) depth++;
    else if (")]}".includes(c)) depth = Math.max(0, depth - 1);
  }
  return { text: s, depth };
}

function toLines(src: string): Line[] {
  const out: Line[] = [];
  const raw = src.replace(/\t/g, "    ").replace(/\r/g, "").split("\n");
  for (let idx = 0; idx < raw.length; idx++) {
    let { text, depth } = scanLine(raw[idx], 0);
    const no = idx + 1;
    // líneas lógicas: si quedó un paréntesis/corchete abierto, se une con las siguientes
    while (depth > 0 && idx + 1 < raw.length) {
      idx++;
      const next = scanLine(raw[idx], depth);
      text += " " + next.text.trim();
      depth = next.depth;
    }
    text = text.replace(/\s+$/, "");
    if (!text.trim()) continue;
    out.push({ no, indent: text.length - text.trimStart().length, text: text.trim() });
  }
  return out;
}

/** Índices de tokens en profundidad 0 que cumplen el predicado. */
function topLevel(toks: Tok[], pred: (t: Tok) => boolean): number[] {
  const out: number[] = [];
  let depth = 0;
  toks.forEach((t, i) => {
    if (t.k === "op" && "([{".includes(t.v)) depth++;
    else if (t.k === "op" && ")]}".includes(t.v)) depth--;
    else if (depth === 0 && pred(t)) out.push(i);
  });
  return out;
}

function checkTarget(e: Expr, line: number): Expr {
  if (e.t === "name" || e.t === "index") return e;
  if (e.t === "tuple" || e.t === "list") {
    e.items.forEach((x) => checkTarget(x, line));
    return e;
  }
  if (e.t === "call") throw new CodeError("No se puede asignar a una llamada a función. ¿Quisiste comparar con «==»?", line, "sintaxis", "SyntaxError", "cannot assign to function call");
  throw new CodeError("A la izquierda del «=» tiene que ir una variable. ¿Quisiste comparar con «==»?", line, "sintaxis", "SyntaxError", "cannot assign to expression");
}

class StmtParser {
  private i = 0;
  constructor(private lines: Line[]) {}

  parseProgram(): Stmt[] {
    if (this.lines.length && this.lines[0].indent !== 0)
      throw new CodeError("La primera línea no debería tener sangría.", this.lines[0].no, "sintaxis", "IndentationError", "unexpected indent");
    const body = this.block(0);
    if (this.i < this.lines.length) {
      const l = this.lines[this.i];
      throw new CodeError("Sangría inesperada.", l.no, "sintaxis", "IndentationError", "unexpected indent");
    }
    return body;
  }

  private block(indent: number): Stmt[] {
    const out: Stmt[] = [];
    while (this.i < this.lines.length) {
      const l = this.lines[this.i];
      if (l.indent < indent) break;
      if (l.indent > indent) throw new CodeError("Sangría inesperada: esta línea está más adentro que las anteriores.", l.no, "sintaxis", "IndentationError", "unexpected indent");
      out.push(...this.statement());
    }
    return out;
  }

  /** Separa «cabecera: resto». Si hay algo después de «:», es un cuerpo de una sola línea. */
  private header(l: Line, toks: Tok[], kw: string): { head: Tok[]; inline: Tok[] | null } {
    const colons = topLevel(toks, (t) => t.k === "op" && t.v === ":");
    if (!colons.length) throw new CodeError(`Falta «:» al final del «${kw}».`, l.no, "sintaxis", "SyntaxError", "expected ':'");
    const c = colons[0];
    const rest = toks.slice(c + 1);
    return { head: toks.slice(1, c), inline: rest.length ? rest : null };
  }

  private body(l: Line, inline: Tok[] | null): Stmt[] {
    if (inline) return this.simple(inline, l.no);
    const next = this.lines[this.i];
    if (!next || next.indent <= l.indent)
      throw new CodeError("Después de «:» el bloque tiene que ir con sangría (4 espacios).", l.no, "sintaxis", "IndentationError", "expected an indented block");
    return this.block(next.indent);
  }

  private statement(): Stmt[] {
    const l = this.lines[this.i++];
    const toks = lex(l.text, l.no);
    const word = toks[0]?.k === "name" ? toks[0].v : "";

    if (word === "if") {
      const branches: { cond: Expr | null; body: Stmt[]; line: number }[] = [];
      const h = this.header(l, toks, "if");
      branches.push({ cond: parseTokens(h.head, l.no), body: this.body(l, h.inline), line: l.no });
      while (this.i < this.lines.length && this.lines[this.i].indent === l.indent) {
        const n = this.lines[this.i];
        const nt = lex(n.text, n.no);
        const w = nt[0]?.k === "name" ? nt[0].v : "";
        if (w === "elif") {
          this.i++;
          const hh = this.header(n, nt, "elif");
          branches.push({ cond: parseTokens(hh.head, n.no), body: this.body(n, hh.inline), line: n.no });
        } else if (w === "else") {
          this.i++;
          const hh = this.header(n, nt, "else");
          if (hh.head.length) throw new CodeError("El «else» no lleva condición. Si querés una condición, usá «elif».", n.no, "sintaxis", "SyntaxError", "expected ':'");
          branches.push({ cond: null, body: this.body(n, hh.inline), line: n.no });
          break;
        } else break;
      }
      return [{ t: "if", line: l.no, branches }];
    }
    if (word === "elif" || word === "else")
      throw new CodeError(`«${word}» tiene que ir justo después de un «if».`, l.no, "sintaxis", "SyntaxError", "invalid syntax");
    if (word === "while") {
      const h = this.header(l, toks, "while");
      return [{ t: "while", line: l.no, cond: parseTokens(h.head, l.no), body: this.body(l, h.inline) }];
    }
    if (word === "for") {
      const h = this.header(l, toks, "for");
      const ins = topLevel(h.head, (t) => t.k === "name" && t.v === "in");
      if (!ins.length) throw new CodeError("El for se escribe así: for i in range(5):", l.no, "sintaxis", "SyntaxError", "invalid syntax");
      const target = checkTarget(parseTokens(h.head.slice(0, ins[0]), l.no), l.no);
      return [{ t: "for", line: l.no, target, iter: parseTokens(h.head.slice(ins[0] + 1), l.no), body: this.body(l, h.inline) }];
    }
    if (word === "def") {
      const h = this.header(l, toks, "def");
      const name = h.head[0];
      if (!name || name.k !== "name" || h.head[1]?.v !== "(" || h.head[h.head.length - 1]?.v !== ")")
        throw new CodeError("Una función se define así: def nombre(a, b):", l.no, "sintaxis", "SyntaxError", "invalid syntax");
      const inner = h.head.slice(2, -1);
      const params: string[] = [];
      const defaults: (Expr | null)[] = [];
      let cur: Tok[] = [];
      const flush = () => {
        if (!cur.length) return;
        if (cur[0].k !== "name") throw new CodeError("Los parámetros tienen que ser nombres.", l.no, "sintaxis", "SyntaxError", "invalid syntax");
        params.push(cur[0].v);
        defaults.push(cur.length > 2 && cur[1].v === "=" ? parseTokens(cur.slice(2), l.no) : null);
        cur = [];
      };
      const commas = new Set(topLevel(inner, (t) => t.k === "op" && t.v === ","));
      inner.forEach((t, idx) => (commas.has(idx) ? flush() : cur.push(t)));
      flush();
      return [{ t: "def", line: l.no, name: name.v, params, defaults, body: this.body(l, h.inline) }];
    }
    if (l.text.endsWith(":") && ["class", "try", "except", "with", "lambda", "finally"].includes(word))
      throw new CodeError(`«${word}» no está disponible en este intérprete.`, l.no, "sintaxis");
    return this.simple(toks, l.no);
  }

  private simple(toks: Tok[], line: number): Stmt[] {
    // varias sentencias en una línea separadas por «;»
    const semis = topLevel(toks, (t) => t.k === "op" && t.v === ";");
    if (semis.length) {
      const out: Stmt[] = [];
      let start = 0;
      for (const s of [...semis, toks.length]) {
        if (s > start) out.push(...this.simple(toks.slice(start, s), line));
        start = s + 1;
      }
      return out;
    }
    const word = toks[0]?.k === "name" ? toks[0].v : "";
    if (word === "return") return [{ t: "return", line, e: toks.length > 1 ? parseTokens(toks.slice(1), line) : null }];
    if (word === "pass" && toks.length === 1) return [{ t: "pass", line }];
    if (word === "break" && toks.length === 1) return [{ t: "break", line }];
    if (word === "continue" && toks.length === 1) return [{ t: "continue", line }];
    if (word === "del") {
      const e = parseTokens(toks.slice(1), line);
      const targets = e.t === "tuple" ? e.items : [e];
      return [{ t: "del", line, targets }];
    }
    if (word === "global") return [{ t: "global", line, names: toks.slice(1).filter((t) => t.k === "name").map((t) => t.v) }];
    if (["import", "from", "class", "try", "lambda", "with"].includes(word))
      throw new CodeError(`«${word}» no está disponible en este intérprete.`, line, "sintaxis");

    const aug = topLevel(toks, (t) => t.k === "op" && AUG.includes(t.v));
    if (aug.length) {
      const k = aug[0];
      if (k === 0 || k === toks.length - 1) throw new CodeError("Falta el valor a la derecha del operador.", line, "sintaxis", "SyntaxError", "invalid syntax");
      const target = parseTokens(toks.slice(0, k), line);
      if (target.t !== "name" && target.t !== "index") throw new CodeError("Con «+=» la izquierda tiene que ser una sola variable.", line, "sintaxis", "SyntaxError", "illegal expression for augmented assignment");
      return [{ t: "aug", line, target, op: toks[k].v.slice(0, -1), value: parseTokens(toks.slice(k + 1), line) }];
    }
    const eqs = topLevel(toks, (t) => t.k === "op" && t.v === "=");
    if (eqs.length) {
      const parts: Tok[][] = [];
      let start = 0;
      for (const e of [...eqs, toks.length]) {
        parts.push(toks.slice(start, e));
        start = e + 1;
      }
      if (!parts[parts.length - 1].length) throw new CodeError("Falta el valor a la derecha del «=».", line, "sintaxis", "SyntaxError", "invalid syntax");
      const value = parseTokens(parts.pop()!, line);
      const targets = parts.map((p) => checkTarget(parseTokens(p, line), line));
      return [{ t: "assign", line, targets, value }];
    }
    return [{ t: "expr", line, e: parseTokens(toks, line) }];
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

/** Valor de una variable tal como se muestra en el visualizador (los textos van entre comillas dobles). */
function reprValue(v: Value): string {
  return typeof v === "string" ? `"${v}"` : pyStr(v);
}

/** Convierte los float internos en number de JS (para quien consume `globals`). */
function exportValue(v: Value, seen = new Map<object, Value>()): Value {
  if (!isObj(v) && !Array.isArray(v)) return v;
  if (seen.has(v as object)) return seen.get(v as object)!;
  if (Array.isArray(v)) {
    const out: Value[] = [];
    seen.set(v, out);
    v.forEach((x) => out.push(exportValue(x, seen)));
    return out;
  }
  switch (v.kind) {
    case "float":
      return v.v;
    case "tuple":
      return tuple(v.items.map((x) => exportValue(x, seen)));
    case "dict": {
      const m = new Map<string, [Value, Value]>();
      for (const [k, [a, b]] of v.map) m.set(k, [exportValue(a, seen), exportValue(b, seen)]);
      return { kind: "dict", map: m };
    }
    default:
      return v;
  }
}

const MAX_STEPS = 3000;
const MAX_SIZE = 1_000_000;

const TYPE_NAMES = new Set(["int", "float", "str", "bool", "list", "tuple", "dict", "range"]);

export function run(src: string, opts: { maxSteps?: number } = {}): RunResult {
  const maxSteps = opts.maxSteps ?? MAX_STEPS;
  const globals: Record<string, Value> = {};
  const steps: TraceStep[] = [];
  const lines: string[] = [];
  let cur = "";
  let stdout = "";
  const frames: { name: string; vars: Record<string, Value>; globalNames: Set<string> }[] = [{ name: "global", vars: globals, globalNames: new Set() }];
  let prevSnapshot: Record<string, string> = {};

  const frame = () => frames[frames.length - 1];
  const output = () => (cur === "" ? [...lines] : [...lines, cur]);

  const write = (s: string) => {
    stdout += s;
    const parts = s.split("\n");
    cur += parts[0];
    for (let k = 1; k < parts.length; k++) {
      lines.push(cur);
      cur = parts[k];
    }
  };

  /** Error de ejecución con el tipo y el mensaje de Python, más una explicación en castellano. */
  const pyErr = (type: string, msg: string, line: number, es?: string): never => {
    throw new CodeError(es ? `${es} (${type}: ${msg})` : `${type}: ${msg}`, line, "ejecucion", type, msg);
  };

  const snapshot = (line: number) => {
    const vars: Record<string, string> = {};
    const f = frame();
    for (const [k, v] of Object.entries(f.vars)) {
      if (isFn(v)) continue;
      vars[k] = reprValue(v);
    }
    const changed = Object.keys(vars).filter((k) => prevSnapshot[k] !== vars[k]);
    prevSnapshot = vars;
    steps.push({ line, scope: f.name, vars, output: output(), changed });
    if (steps.length > maxSteps)
      throw new CodeError(
        `El programa superó ${maxSteps} pasos. ¿Hay un bucle que nunca termina? Revisá que la condición del while llegue a ser falsa.`,
        line,
        "ejecucion",
      );
  };

  const lookup = (name: string, line: number): Value => {
    const f = frame();
    if (name in f.vars && !f.globalNames.has(name)) return f.vars[name];
    if (name in globals) return globals[name];
    if (TYPE_NAMES.has(name)) return { kind: "type", name };
    return pyErr("NameError", `name '${name}' is not defined`, line, `La variable «${name}» no está definida todavía.`);
  };

  const hashKey = (k: Value, line: number): string => {
    if (k === null) return "None";
    if (isNum(k)) return `n:${numOf(k)}`;
    if (typeof k === "string") return `s:${k}`;
    if (isTuple(k)) return `t:(${k.items.map((x) => hashKey(x, line)).join(",")})`;
    return pyErr("TypeError", `unhashable type: '${typeName(k)}'`, line, "Las listas y los diccionarios no pueden ser claves de un diccionario.");
  };

  const dictGet = (d: PyDict, k: Value, line: number): Value => {
    const e = d.map.get(hashKey(k, line));
    if (!e) return pyErr("KeyError", pyRepr(k), line, `La clave ${pyRepr(k)} no está en el diccionario.`);
    return e[1];
  };
  const dictSet = (d: PyDict, k: Value, v: Value, line: number) => {
    const h = hashKey(k, line);
    const e = d.map.get(h);
    if (e) e[1] = v;
    else d.map.set(h, [k, v]);
  };

  /** Elementos que produce un iterable (para for, list(), join, sum, …). */
  const iterItems = (v: Value, line: number): Value[] => {
    if (typeof v === "string") return v.split("");
    if (Array.isArray(v)) return v;
    if (isTuple(v)) return v.items;
    if (isDict(v)) return [...v.map.values()].map((e) => e[0]);
    if (isRange(v)) {
      if (rangeLen(v) > MAX_SIZE) return pyErr("MemoryError", "", line, "El range es demasiado grande para este intérprete.");
      return rangeToList(v);
    }
    if (isView(v)) return viewItems(v);
    return pyErr("TypeError", `'${typeName(v)}' object is not iterable`, line, `No se puede recorrer un valor de tipo ${typeName(v)}.`);
  };

  const intArg = (v: Value, line: number, what: string): number => {
    if (isIntLike(v)) return numOf(v);
    return pyErr("TypeError", `'${typeName(v)}' object cannot be interpreted as an integer`, line, `${what} necesita números enteros.`);
  };

  const unsupported = (op: string, a: Value, b: Value, line: number): never => {
    const es =
      typeof a === "string" || typeof b === "string"
        ? `No se puede usar «${op}» entre ${typeName(a)} y ${typeName(b)}. ¿Te olvidaste de convertir con int() o float()?`
        : `No se puede usar «${op}» entre ${typeName(a)} y ${typeName(b)}.`;
    return pyErr("TypeError", `unsupported operand type(s) for ${op}: '${typeName(a)}' and '${typeName(b)}'`, line, es);
  };

  const arith = (op: string, a: Value, b: Value, line: number): Value => {
    const fl = isFloat(a) || isFloat(b);
    const x = numOf(a);
    const y = numOf(b);
    const res = (n: number) => (fl ? mkFloat(n) : mkInt(n));
    switch (op) {
      case "+":
        return res(x + y);
      case "-":
        return res(x - y);
      case "*":
        return res(x * y);
      case "/":
        if (y === 0) return pyErr("ZeroDivisionError", fl ? "float division by zero" : "division by zero", line, "División por cero.");
        return mkFloat(x / y);
      case "//":
      case "%": {
        if (y === 0)
          return pyErr("ZeroDivisionError", fl ? (op === "//" ? "float floor division by zero" : "float modulo") : op === "//" ? "integer division or modulo by zero" : "integer modulo by zero", line, "División por cero.");
        if (!fl) {
          const q = Math.floor(x / y);
          return op === "//" ? mkInt(q) : mkInt(x - q * y);
        }
        // algoritmo de CPython (float_divmod)
        let mod = x % y;
        let div = (x - mod) / y;
        if (mod) {
          if (y < 0 !== mod < 0) {
            mod += y;
            div -= 1;
          }
        } else mod = y < 0 ? -0 : 0;
        let fd: number;
        if (div) {
          fd = Math.floor(div);
          if (div - fd > 0.5) fd += 1;
        } else fd = x / y < 0 ? -0 : 0;
        return mkFloat(op === "//" ? fd : mod);
      }
      case "**": {
        if (!fl && y >= 0) return mkInt(x ** y);
        if (x === 0 && y < 0) return pyErr("ZeroDivisionError", "0.0 cannot be raised to a negative power", line, "No se puede elevar 0 a una potencia negativa.");
        const r = x ** y;
        if (Number.isNaN(r)) return pyErr("ValueError", "math domain error", line, "La potencia de un negativo con exponente fraccionario no es un número real.");
        return mkFloat(r);
      }
    }
    return pyErr("TypeError", `operador ${op}`, line);
  };

  const repeat = (seq: Value, n: Value, line: number): Value => {
    const k = Math.max(0, numOf(n));
    const len = typeof seq === "string" ? seq.length : Array.isArray(seq) ? seq.length : (seq as PyTuple).items.length;
    if (len * k > MAX_SIZE) return pyErr("MemoryError", "", line, "El resultado sería demasiado grande.");
    if (typeof seq === "string") return seq.repeat(k);
    const items = Array.isArray(seq) ? seq : (seq as PyTuple).items;
    const out: Value[] = [];
    for (let i = 0; i < k; i++) out.push(...items);
    return Array.isArray(seq) ? out : tuple(out);
  };

  const isSeq = (v: Value) => typeof v === "string" || Array.isArray(v) || isTuple(v);

  const binop = (op: string, a: Value, b: Value, line: number): Value => {
    if (isNum(a) && isNum(b)) return arith(op, a, b, line);
    switch (op) {
      case "+":
        if (typeof a === "string" && typeof b === "string") return a + b;
        if (Array.isArray(a) && Array.isArray(b)) return [...a, ...b];
        if (isTuple(a) && isTuple(b)) return tuple([...a.items, ...b.items]);
        if (typeof a === "string")
          return pyErr("TypeError", `can only concatenate str (not "${typeName(b)}") to str`, line, "No se puede sumar texto con números. Usá str(numero) para convertirlo.");
        if (Array.isArray(a)) return pyErr("TypeError", `can only concatenate list (not "${typeName(b)}") to list`, line, "Solo se puede sumar una lista con otra lista.");
        if (isTuple(a)) return pyErr("TypeError", `can only concatenate tuple (not "${typeName(b)}") to tuple`, line, "Solo se puede sumar una tupla con otra tupla.");
        return unsupported("+", a, b, line);
      case "*":
        if (isSeq(a) && isIntLike(b)) return repeat(a, b, line);
        if (isIntLike(a) && isSeq(b)) return repeat(b, a, line);
        if (isSeq(a) && (isNum(b) || isSeq(b)))
          return pyErr("TypeError", `can't multiply sequence by non-int of type '${typeName(b)}'`, line, `Un texto o una lista solo se pueden multiplicar por un entero (int), no por ${typeName(b)}.`);
        if (isSeq(b) && isNum(a))
          return pyErr("TypeError", `can't multiply sequence by non-int of type '${typeName(a)}'`, line, `Un texto o una lista solo se pueden multiplicar por un entero (int), no por ${typeName(a)}.`);
        return unsupported("*", a, b, line);
      case "%":
        if (typeof a === "string") {
          if (!a.includes("%")) return pyErr("TypeError", "not all arguments converted during string formatting", line, "El operador % con textos es para formato, no para calcular un resto.");
          throw new CodeError("El formato con % no está disponible en este intérprete.", line, "ejecucion");
        }
        return unsupported(op, a, b, line);
      default:
        return unsupported(op, a, b, line);
    }
  };

  /** a < b al estilo de Python (TypeError si los tipos no se pueden ordenar). */
  const less = (a: Value, b: Value, line: number, op = "<"): boolean => {
    if (isNum(a) && isNum(b)) return numOf(a) < numOf(b);
    if (typeof a === "string" && typeof b === "string") return a < b;
    const la = Array.isArray(a) ? a : isTuple(a) && isTuple(b) ? a.items : null;
    const lb = Array.isArray(b) ? b : isTuple(b) && isTuple(a) ? b.items : null;
    if (la && lb && Array.isArray(a) === Array.isArray(b)) {
      for (let i = 0; i < Math.min(la.length, lb.length); i++) {
        if (!pyEq(la[i], lb[i])) return less(la[i], lb[i], line, op);
      }
      return la.length < lb.length;
    }
    return pyErr("TypeError", `'${op}' not supported between instances of '${typeName(a)}' and '${typeName(b)}'`, line, `No se puede comparar con «${op}» un ${typeName(a)} con un ${typeName(b)}.`);
  };

  const contains = (container: Value, x: Value, line: number): boolean => {
    if (typeof container === "string") {
      if (typeof x !== "string") return pyErr("TypeError", `'in <string>' requires string as left operand, not ${typeName(x)}`, line, "Para buscar dentro de un texto, lo que buscás también tiene que ser texto.");
      return container.includes(x);
    }
    if (isDict(container)) return container.map.has(hashKey(x, line));
    if (isRange(container)) {
      if (!isNum(x) || !Number.isInteger(numOf(x))) return false;
      const n = numOf(x);
      const { start, stop, step } = container;
      const inside = step > 0 ? n >= start && n < stop : n <= start && n > stop;
      return inside && (n - start) % step === 0;
    }
    if (Array.isArray(container) || isTuple(container) || isView(container)) return iterItems(container, line).some((y) => pyEq(y, x));
    return pyErr("TypeError", `argument of type '${typeName(container)}' is not iterable`, line, `No se puede buscar con «in» dentro de un ${typeName(container)}.`);
  };

  const compare = (op: string, a: Value, b: Value, line: number): boolean => {
    switch (op) {
      case "==":
        return pyEq(a, b);
      case "!=":
        return !pyEq(a, b);
      case "<":
        return less(a, b, line, "<");
      case ">":
        return less(b, a, line, ">");
      case "<=":
        if (isNum(a) && isNum(b)) return numOf(a) <= numOf(b);
        return pyEq(a, b) && typeName(a) === typeName(b) ? true : less(a, b, line, "<=");
      case ">=":
        if (isNum(a) && isNum(b)) return numOf(a) >= numOf(b);
        return pyEq(a, b) && typeName(a) === typeName(b) ? true : less(b, a, line, ">=");
      case "in":
        return contains(b, a, line);
      case "not in":
        return !contains(b, a, line);
      case "is":
      case "is not": {
        const same = isObj(a) || Array.isArray(a) ? a === b : a === b || (typeof a === "number" && isNum(b) && !isFloat(b) && typeof b !== "boolean" && a === b);
        return op === "is" ? same : !same;
      }
    }
    return false;
  };

  /** Índices de un slice, como PySlice_AdjustIndices. */
  const sliceIdx = (len: number, lo: Value, hi: Value, st: Value, line: number): number[] => {
    const step = st === null ? 1 : intArg(st, line, "El paso del slice");
    if (step === 0) return pyErr("ValueError", "slice step cannot be zero", line, "El paso de un slice no puede ser 0.");
    const adj = (v: Value, def: number, lower: number, upper: number) => {
      if (v === null) return def;
      let n = intArg(v, line, "Un slice");
      if (n < 0) n = Math.max(n + len, lower);
      else n = Math.min(n, upper);
      return n;
    };
    const start = step > 0 ? adj(lo, 0, 0, len) : adj(lo, len - 1, -1, len - 1);
    const stop = step > 0 ? adj(hi, len, 0, len) : adj(hi, -1, -1, len - 1);
    const out: number[] = [];
    for (let i = start; step > 0 ? i < stop : i > stop; i += step) out.push(i);
    return out;
  };

  const index = (o: Value, iv: Value, line: number): Value => {
    if (isDict(o)) return dictGet(o, iv, line);
    const tn = typeName(o);
    if (typeof o === "string" || Array.isArray(o) || isTuple(o) || isRange(o)) {
      if (!isIntLike(iv)) {
        const msg = typeof o === "string" ? `string indices must be integers, not '${typeName(iv)}'` : `${tn} indices must be integers or slices, not ${typeName(iv)}`;
        return pyErr("TypeError", msg, line, "Los índices tienen que ser números enteros.");
      }
      const items: ArrayLike<Value> = typeof o === "string" ? o : Array.isArray(o) ? o : isTuple(o) ? o.items : rangeToList(o);
      const i = numOf(iv);
      const k = i < 0 ? items.length + i : i;
      if (k < 0 || k >= items.length) {
        const what = typeof o === "string" ? "string" : tn === "range" ? "range object" : tn;
        return pyErr("IndexError", `${what} index out of range`, line, `Índice ${i} fuera de rango (hay ${items.length} elementos, del 0 al ${items.length - 1}).`);
      }
      return items[k];
    }
    return pyErr("TypeError", `'${tn}' object is not subscriptable`, line, `No se puede usar [ ] sobre un valor de tipo ${tn}.`);
  };

  const slice = (o: Value, lo: Value, hi: Value, st: Value, line: number): Value => {
    if (typeof o === "string") return sliceIdx(o.length, lo, hi, st, line).map((i) => o[i]).join("");
    if (Array.isArray(o)) return sliceIdx(o.length, lo, hi, st, line).map((i) => o[i]);
    if (isTuple(o)) return tuple(sliceIdx(o.items.length, lo, hi, st, line).map((i) => o.items[i]));
    if (isRange(o)) return sliceIdx(rangeLen(o), lo, hi, st, line).map((i) => o.start + i * o.step);
    return pyErr("TypeError", `'${typeName(o)}' object is not subscriptable`, line, `No se puede usar [ : ] sobre un valor de tipo ${typeName(o)}.`);
  };

  const pyLen = (v: Value, line: number): number => {
    if (typeof v === "string" || Array.isArray(v)) return v.length;
    if (isTuple(v)) return v.items.length;
    if (isDict(v) || isView(v)) return isDict(v) ? v.map.size : v.dict.map.size;
    if (isRange(v)) return rangeLen(v);
    return pyErr("TypeError", `object of type '${typeName(v)}' has no len()`, line, `len() necesita un texto, una lista, una tupla o un diccionario; recibió ${typeName(v)}.`);
  };

  const pyRound = (x: number, nd: number): number => {
    const sign = x < 0 ? -1 : 1;
    const ax = Math.abs(x);
    if (nd >= 0) {
      if (nd > 20) return x;
      const exact = ax.toFixed(Math.min(100, nd + 60));
      const cut = exact.indexOf(".") + 1 + nd;
      const rest = exact.slice(cut);
      let s = ax.toFixed(nd);
      if (/^50*$/.test(rest)) {
        // empate exacto: redondeo al par (como Python)
        const down = exact.slice(0, nd === 0 ? cut - 1 : cut);
        const lastDigit = Number(down.replace(".", "").slice(-1));
        if (lastDigit % 2 === 0) s = down;
      }
      return sign * parseFloat(s);
    }
    const p = 10 ** -nd;
    const q = ax / p;
    const fl = Math.floor(q);
    const diff = q - fl;
    const r = diff > 0.5 || (diff === 0.5 && fl % 2 === 1) ? fl + 1 : fl;
    return sign * r * p;
  };

  const sortList = (arr: Value[], reverse: boolean, line: number) => {
    const copy = [...arr];
    copy.sort((a, b) => (reverse ? (less(b, a, line) ? -1 : less(a, b, line) ? 1 : 0) : less(a, b, line) ? -1 : less(b, a, line) ? 1 : 0));
    arr.splice(0, arr.length, ...copy);
  };

  const kwArgs = (kw: [string, Value][], allowed: string[], fname: string, line: number): Record<string, Value> => {
    const out: Record<string, Value> = {};
    for (const [k, v] of kw) {
      if (!allowed.includes(k)) pyErr("TypeError", `'${k}' is an invalid keyword argument for ${fname}()`, line, `${fname}() no acepta el argumento «${k}=».`);
      out[k] = v;
    }
    return out;
  };

  const minmax = (name: "min" | "max", args: Value[], line: number): Value => {
    const items = args.length === 1 ? iterItems(args[0], line) : args;
    if (!items.length) return pyErr("ValueError", `${name}() arg is an empty sequence`, line, `${name}() de una secuencia vacía.`);
    let best = items[0];
    for (const x of items.slice(1)) if (name === "max" ? less(best, x, line, "<") : less(x, best, line, "<")) best = x;
    return best;
  };

  const toInt = (v: Value, line: number): Value => {
    if (typeof v === "string") {
      const s = v.trim().replace(/_/g, "");
      if (!/^[+-]?\d+$/.test(s)) return pyErr("ValueError", `invalid literal for int() with base 10: ${pyRepr(v)}`, line, `El texto ${pyRepr(v)} no representa un número entero.`);
      return mkInt(parseInt(s, 10));
    }
    if (isNum(v)) {
      const n = numOf(v);
      if (!Number.isFinite(n)) return pyErr(Number.isNaN(n) ? "ValueError" : "OverflowError", Number.isNaN(n) ? "cannot convert float NaN to integer" : "cannot convert float infinity to integer", line);
      return mkInt(Math.trunc(n));
    }
    return pyErr("TypeError", `int() argument must be a string, a bytes-like object or a real number, not '${typeName(v)}'`, line, `int() no puede convertir un ${typeName(v)}.`);
  };

  const toFloat = (v: Value, line: number): Value => {
    if (typeof v === "string") {
      const s = v.trim().toLowerCase();
      if (/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/.test(s)) return mkFloat(parseFloat(s));
      if (/^[+-]?(inf|infinity)$/.test(s)) return mkFloat(s.startsWith("-") ? -Infinity : Infinity);
      if (/^[+-]?nan$/.test(s)) return mkFloat(NaN);
      return pyErr("ValueError", `could not convert string to float: ${pyRepr(v)}`, line, `El texto ${pyRepr(v)} no representa un número.`);
    }
    if (isNum(v)) return mkFloat(numOf(v));
    return pyErr("TypeError", `float() argument must be a string or a real number, not '${typeName(v)}'`, line, `float() no puede convertir un ${typeName(v)}.`);
  };

  const builtins: Record<string, (args: Value[], line: number, kw: [string, Value][]) => Value> = {
    print: (args, line, kw) => {
      const o = kwArgs(kw, ["sep", "end"], "print", line);
      const sep = o.sep === undefined || o.sep === null ? " " : o.sep;
      const end = o.end === undefined || o.end === null ? "\n" : o.end;
      if (typeof sep !== "string") pyErr("TypeError", `sep must be None or a string, not ${typeName(sep)}`, line);
      if (typeof end !== "string") pyErr("TypeError", `end must be None or a string, not ${typeName(end)}`, line);
      write(args.map(pyStr).join(sep as string) + (end as string));
      return null;
    },
    input: (_a, line) => {
      throw new CodeError("input() no está disponible acá: definí el valor directamente en una variable (por ejemplo, nombre = \"Ana\").", line, "ejecucion");
    },
    len: (a, l) => pyLen(a[0], l),
    abs: (a, l) => {
      if (!isNum(a[0])) return pyErr("TypeError", `bad operand type for abs(): '${typeName(a[0])}'`, l, "abs() necesita un número.");
      return isFloat(a[0]) ? mkFloat(Math.abs(a[0].v)) : Math.abs(numOf(a[0]));
    },
    round: (a, l) => {
      const x = a[0];
      if (!isNum(x)) return pyErr("TypeError", `type ${typeName(x)} doesn't define __round__ method`, l, "round() necesita un número.");
      if (a.length < 2 || a[1] === null) {
        if (!isFloat(x)) return numOf(x);
        return mkInt(pyRound(x.v, 0));
      }
      const nd = intArg(a[1], l, "round()");
      if (!isFloat(x)) return nd >= 0 ? numOf(x) : mkInt(pyRound(numOf(x), nd));
      return mkFloat(pyRound(x.v, nd));
    },
    int: (a, l) => (a.length ? toInt(a[0], l) : 0),
    float: (a, l) => (a.length ? toFloat(a[0], l) : mkFloat(0)),
    str: (a) => (a.length ? pyStr(a[0]) : ""),
    bool: (a) => (a.length ? truthy(a[0]) : false),
    list: (a, l) => (a.length ? [...iterItems(a[0], l)] : []),
    tuple: (a, l) => tuple(a.length ? [...iterItems(a[0], l)] : []),
    dict: (a, l) => {
      const d: PyDict = { kind: "dict", map: new Map() };
      if (a.length) {
        if (isDict(a[0])) for (const [h, e] of a[0].map) d.map.set(h, [e[0], e[1]]);
        else
          for (const p of iterItems(a[0], l)) {
            const kv = iterItems(p, l);
            dictSet(d, kv[0], kv[1], l);
          }
      }
      return d;
    },
    type: (a) => ({ kind: "type", name: typeName(a[0]) }),
    min: (a, l) => minmax("min", a, l),
    max: (a, l) => minmax("max", a, l),
    sum: (a, l) => {
      let s: Value = a.length > 1 ? a[1] : 0;
      for (const x of iterItems(a[0], l)) s = binop("+", s, x, l);
      return s;
    },
    sorted: (a, l, kw) => {
      const o = kwArgs(kw, ["reverse"], "sorted", l);
      const out = [...iterItems(a[0], l)];
      sortList(out, truthy(o.reverse ?? false), l);
      return out;
    },
    range: (a, l) => {
      if (!a.length || a.length > 3) return pyErr("TypeError", `range expected at least 1 argument, got ${a.length}`, l);
      const n = a.map((x) => intArg(x, l, "range()"));
      const [start, stop, step] = n.length === 1 ? [0, n[0], 1] : [n[0], n[1], n[2] ?? 1];
      if (step === 0) return pyErr("ValueError", "range() arg 3 must not be zero", l, "range() no puede avanzar de a 0.");
      return { kind: "range", start, stop, step };
    },
    chr: (a, l) => String.fromCharCode(intArg(a[0], l, "chr()")),
    ord: (a, l) => {
      if (typeof a[0] !== "string" || a[0].length !== 1) return pyErr("TypeError", "ord() expected a character", l);
      return a[0].charCodeAt(0);
    },
  };

  const WS = " \t\n\r\x0b\x0c";
  const stripChars = (s: string, chars: Value, left: boolean, right: boolean): string => {
    const set = chars === null || chars === undefined ? WS : (chars as string);
    let a = 0;
    let b = s.length;
    if (left) while (a < b && set.includes(s[a])) a++;
    if (right) while (b > a && set.includes(s[b - 1])) b--;
    return s.slice(a, b);
  };

  const isCased = (c: string) => c.toLowerCase() !== c.toUpperCase();

  const strMethod = (s: string, name: string, a: Value[], line: number): Value => {
    const needStr = (v: Value, what: string): string => {
      if (typeof v !== "string") return pyErr("TypeError", `must be str, not ${typeName(v)}`, line, `${what} necesita un texto, no un ${typeName(v)}.`);
      return v;
    };
    switch (name) {
      case "upper":
        return s.toUpperCase();
      case "lower":
        return s.toLowerCase();
      case "swapcase":
        return s.split("").map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join("");
      case "title": {
        let out = "";
        let prevCased = false;
        for (const c of s) {
          out += prevCased ? c.toLowerCase() : c.toUpperCase();
          prevCased = isCased(c);
        }
        return out;
      }
      case "capitalize":
        return s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : s;
      case "count": {
        const sub = needStr(a[0], "count()");
        if (sub === "") return s.length + 1;
        return s.split(sub).length - 1;
      }
      case "replace": {
        const old = needStr(a[0], "replace()");
        const nw = needStr(a[1], "replace()");
        const max = a.length > 2 ? intArg(a[2], line, "replace()") : -1;
        if (max < 0) return old === "" ? s.replaceAll("", nw) : s.split(old).join(nw);
        let out = "";
        let rest = s;
        for (let k = 0; k < max; k++) {
          const p = rest.indexOf(old);
          if (p < 0) break;
          out += rest.slice(0, p) + nw;
          rest = rest.slice(p + old.length);
          if (old === "") {
            if (!rest) break;
            out += rest[0];
            rest = rest.slice(1);
          }
        }
        return out + rest;
      }
      case "find":
      case "index":
      case "rfind":
      case "rindex": {
        const sub = needStr(a[0], `${name}()`);
        const start = a.length > 1 ? intArg(a[1], line, name) : 0;
        const from = start < 0 ? Math.max(0, s.length + start) : start;
        const p = name.startsWith("r") ? s.lastIndexOf(sub) : s.indexOf(sub, from);
        if (p < 0 && name.endsWith("index")) return pyErr("ValueError", "substring not found", line, `${pyRepr(sub)} no aparece en el texto.`);
        return p;
      }
      case "split": {
        const sep = a.length ? a[0] : null;
        const max = a.length > 1 ? intArg(a[1], line, "split()") : -1;
        if (sep === null) {
          const parts: string[] = [];
          let rest = stripChars(s, null, true, false);
          while (rest) {
            if (max >= 0 && parts.length === max) {
              parts.push(stripChars(rest, null, false, true));
              break;
            }
            let k = 0;
            while (k < rest.length && !WS.includes(rest[k])) k++;
            parts.push(rest.slice(0, k));
            rest = stripChars(rest.slice(k), null, true, false);
          }
          return parts;
        }
        const sp = needStr(sep, "split()");
        if (sp === "") return pyErr("ValueError", "empty separator", line, "split() no acepta un separador vacío.");
        const all = s.split(sp);
        if (max >= 0 && all.length > max + 1) return [...all.slice(0, max), all.slice(max).join(sp)];
        return all;
      }
      case "join": {
        const items = iterItems(a[0], line);
        items.forEach((x, k) => {
          if (typeof x !== "string") pyErr("TypeError", `sequence item ${k}: expected str instance, ${typeName(x)} found`, line, "join() solo une textos: convertí los números con str().");
        });
        return items.join(s);
      }
      case "strip":
        return stripChars(s, a[0] ?? null, true, true);
      case "lstrip":
        return stripChars(s, a[0] ?? null, true, false);
      case "rstrip":
        return stripChars(s, a[0] ?? null, false, true);
      case "startswith":
      case "endswith": {
        const opts = isTuple(a[0]) ? a[0].items : [a[0]];
        return opts.some((o) => {
          const p = needStr(o, `${name}()`);
          return name === "startswith" ? s.startsWith(p) : s.endsWith(p);
        });
      }
      case "isdigit":
        return s.length > 0 && /^[0-9]+$/.test(s);
      case "isnumeric":
      case "isdecimal":
        return s.length > 0 && /^\p{N}+$/u.test(s);
      case "isalpha":
        return s.length > 0 && /^\p{L}+$/u.test(s);
      case "isalnum":
        return s.length > 0 && /^[\p{L}\p{N}]+$/u.test(s);
      case "isspace":
        return s.length > 0 && [...s].every((c) => WS.includes(c));
      case "isupper":
      case "islower": {
        const cased = [...s].filter(isCased);
        return cased.length > 0 && cased.every((c) => (name === "isupper" ? c === c.toUpperCase() : c === c.toLowerCase()));
      }
      case "center":
      case "ljust":
      case "rjust": {
        const w = intArg(a[0], line, name);
        const fill = a.length > 1 ? needStr(a[1], name) : " ";
        if (s.length >= w) return s;
        const total = w - s.length;
        if (name === "ljust") return s + fill.repeat(total);
        if (name === "rjust") return fill.repeat(total) + s;
        const left = Math.floor(total / 2) + (total & w & 1);
        return fill.repeat(left) + s + fill.repeat(total - left);
      }
      case "zfill": {
        const w = intArg(a[0], line, name);
        if (s.length >= w) return s;
        const signed = s[0] === "-" || s[0] === "+";
        return signed ? s[0] + "0".repeat(w - s.length) + s.slice(1) : "0".repeat(w - s.length) + s;
      }
    }
    return pyErr("AttributeError", `'str' object has no attribute '${name}'`, line, `Los textos no tienen el método ${name}().`);
  };

  const listMethod = (lst: Value[], name: string, a: Value[], line: number, kw: [string, Value][]): Value => {
    switch (name) {
      case "append":
        if (lst.length >= MAX_SIZE) return pyErr("MemoryError", "", line, "La lista es demasiado grande.");
        lst.push(a[0]);
        return null;
      case "extend":
        lst.push(...iterItems(a[0], line));
        return null;
      case "insert": {
        let i = intArg(a[0], line, "insert()");
        if (i < 0) i = Math.max(0, lst.length + i);
        lst.splice(Math.min(i, lst.length), 0, a[1]);
        return null;
      }
      case "pop": {
        if (!lst.length) return pyErr("IndexError", "pop from empty list", line, "No se puede sacar (pop) de una lista vacía.");
        const i = a.length ? intArg(a[0], line, "pop()") : -1;
        const k = i < 0 ? lst.length + i : i;
        if (k < 0 || k >= lst.length) return pyErr("IndexError", "pop index out of range", line, `pop(${i}): ese índice no existe.`);
        return lst.splice(k, 1)[0];
      }
      case "remove": {
        const k = lst.findIndex((x) => pyEq(x, a[0]));
        if (k < 0) return pyErr("ValueError", "list.remove(x): x not in list", line, `${pyRepr(a[0])} no está en la lista.`);
        lst.splice(k, 1);
        return null;
      }
      case "index": {
        const k = lst.findIndex((x) => pyEq(x, a[0]));
        if (k < 0) return pyErr("ValueError", `${pyRepr(a[0])} is not in list`, line, `${pyRepr(a[0])} no está en la lista.`);
        return k;
      }
      case "count":
        return lst.filter((x) => pyEq(x, a[0])).length;
      case "reverse":
        lst.reverse();
        return null;
      case "sort": {
        const o = kwArgs(kw, ["reverse"], "sort", line);
        sortList(lst, truthy(o.reverse ?? false), line);
        return null;
      }
      case "copy":
        return [...lst];
      case "clear":
        lst.length = 0;
        return null;
    }
    return pyErr("AttributeError", `'list' object has no attribute '${name}'`, line, `Las listas no tienen el método ${name}().`);
  };

  const dictMethod = (d: PyDict, name: string, a: Value[], line: number): Value => {
    switch (name) {
      case "keys":
      case "values":
      case "items":
        return { kind: "view", of: name, dict: d };
      case "get": {
        const e = d.map.get(hashKey(a[0], line));
        return e ? e[1] : a.length > 1 ? a[1] : null;
      }
      case "pop": {
        const h = hashKey(a[0], line);
        const e = d.map.get(h);
        if (!e) return a.length > 1 ? a[1] : pyErr("KeyError", pyRepr(a[0]), line, `La clave ${pyRepr(a[0])} no está en el diccionario.`);
        d.map.delete(h);
        return e[1];
      }
      case "update": {
        const src = a[0];
        if (isDict(src)) for (const [, [k, v]] of src.map) dictSet(d, k, v, line);
        else for (const p of iterItems(src, line)) {
          const kv = iterItems(p, line);
          dictSet(d, kv[0], kv[1], line);
        }
        return null;
      }
      case "setdefault": {
        const e = d.map.get(hashKey(a[0], line));
        if (e) return e[1];
        const v = a.length > 1 ? a[1] : null;
        dictSet(d, a[0], v, line);
        return v;
      }
      case "copy":
        return { kind: "dict", map: new Map([...d.map].map(([h, [k, v]]) => [h, [k, v]])) };
      case "clear":
        d.map.clear();
        return null;
    }
    return pyErr("AttributeError", `'dict' object has no attribute '${name}'`, line, `Los diccionarios no tienen el método ${name}().`);
  };

  const callMethod = (obj: Value, name: string, args: Value[], kw: [string, Value][], line: number): Value => {
    if (typeof obj === "string") return strMethod(obj, name, args, line);
    if (Array.isArray(obj)) return listMethod(obj, name, args, line, kw);
    if (isDict(obj)) return dictMethod(obj, name, args, line);
    if (isTuple(obj)) {
      if (name === "count") return obj.items.filter((x) => pyEq(x, args[0])).length;
      if (name === "index") {
        const k = obj.items.findIndex((x) => pyEq(x, args[0]));
        if (k < 0) return pyErr("ValueError", "tuple.index(x): x not in tuple", line, `${pyRepr(args[0])} no está en la tupla.`);
        return k;
      }
    }
    return pyErr("AttributeError", `'${typeName(obj)}' object has no attribute '${name}'`, line, `Un valor de tipo ${typeName(obj)} no tiene el método ${name}().`);
  };

  const callUser = (fn: FunctionValue, args: Value[], kw: [string, Value][], line: number): Value => {
    if (args.length > fn.params.length) {
      const n = fn.params.length;
      return pyErr("TypeError", `${fn.name}() takes ${n} positional argument${n === 1 ? "" : "s"} but ${args.length} ${args.length === 1 ? "was" : "were"} given`, line, `${fn.name}() espera ${n} valores y recibió ${args.length}.`);
    }
    const vars: Record<string, Value> = {};
    fn.params.forEach((p, idx) => {
      if (idx < args.length) vars[p] = args[idx];
    });
    for (const [k, v] of kw) {
      if (!fn.params.includes(k)) pyErr("TypeError", `${fn.name}() got an unexpected keyword argument '${k}'`, line, `${fn.name}() no tiene un parámetro llamado «${k}».`);
      vars[k] = v;
    }
    const missing = fn.params.filter((p, idx) => !(p in vars) && !fn.defaults[idx]);
    if (missing.length) {
      const list = missing.map((m) => `'${m}'`);
      const txt = list.length === 1 ? list[0] : `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;
      return pyErr("TypeError", `${fn.name}() missing ${missing.length} required positional argument${missing.length === 1 ? "" : "s"}: ${txt}`, line, `${fn.name}() espera ${fn.params.length} valores y recibió ${args.length + kw.length}.`);
    }
    fn.params.forEach((p, idx) => {
      if (!(p in vars)) vars[p] = evalE(fn.defaults[idx]!, line);
    });
    if (frames.length > 100) return pyErr("RecursionError", "maximum recursion depth exceeded", line, "Demasiadas llamadas anidadas (¿recursión sin caso base?).");
    frames.push({ name: fn.name, vars, globalNames: new Set() });
    prevSnapshot = {};
    let result: Value = null;
    try {
      execBlock(fn.body);
    } catch (s) {
      if (s instanceof ReturnSignal) result = s.value;
      else throw s;
    } finally {
      frames.pop();
      prevSnapshot = {};
    }
    return result;
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
      case "tuple":
        return tuple(e.items.map((x) => evalE(x, line)));
      case "dict": {
        const d: PyDict = { kind: "dict", map: new Map() };
        for (const [k, v] of e.items) {
          const kv = evalE(k, line);
          dictSet(d, kv, evalE(v, line), line);
        }
        return d;
      }
      case "index":
        return index(evalE(e.obj, line), evalE(e.idx, line), line);
      case "slice": {
        const o = evalE(e.obj, line);
        const ev = (x: Expr | null) => (x ? evalE(x, line) : null);
        return slice(o, ev(e.lo), ev(e.hi), ev(e.step), line);
      }
      case "un": {
        const a = evalE(e.a, line);
        if (e.op === "not") return !truthy(a);
        if (!isNum(a)) return pyErr("TypeError", `bad operand type for unary ${e.op}: '${typeName(a)}'`, line, `El signo ${e.op} necesita un número.`);
        if (isFloat(a)) return mkFloat(e.op === "-" ? -a.v : a.v);
        return mkInt(e.op === "-" ? -numOf(a) : numOf(a));
      }
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
      case "cmp": {
        let left = evalE(e.first, line);
        for (const [op, ex] of e.rest) {
          const right = evalE(ex, line);
          if (!compare(op, left, right, line)) return false;
          left = right;
        }
        return true;
      }
      case "ifexp":
        return truthy(evalE(e.cond, line)) ? evalE(e.a, line) : evalE(e.b, line);
      case "method": {
        const obj = evalE(e.obj, line);
        const args = e.args.map((a) => evalE(a, line));
        const kw = e.kw.map(([k, v]) => [k, evalE(v, line)] as [string, Value]);
        return callMethod(obj, e.name, args, kw, line);
      }
      case "call": {
        const args = e.args.map((a) => evalE(a, line));
        const kw = e.kw.map(([k, v]) => [k, evalE(v, line)] as [string, Value]);
        const f = frame();
        const user = e.fn in f.vars ? f.vars[e.fn] : globals[e.fn];
        if (user !== undefined) {
          if (isFn(user)) return callUser(user, args, kw, line);
          if (!(isObj(user) && user.kind === "type"))
            return pyErr("TypeError", `'${typeName(user)}' object is not callable`, line, `«${e.fn}» es una variable, no una función.`);
        }
        const b = builtins[e.fn];
        if (!b) return pyErr("NameError", `name '${e.fn}' is not defined`, line, `No existe la función «${e.fn}».`);
        return b(args, line, kw);
      }
    }
  };

  const assignTo = (target: Expr, v: Value, line: number) => {
    if (target.t === "name") {
      const f = frame();
      if (f.globalNames.has(target.v)) globals[target.v] = v;
      else f.vars[target.v] = v;
      return;
    }
    if (target.t === "index") return setItem(evalE(target.obj, line), evalE(target.idx, line), v, line);
    if (target.t === "tuple" || target.t === "list") {
      const items = iterItems(v, line);
      const n = target.items.length;
      if (items.length > n) return pyErr("ValueError", `too many values to unpack (expected ${n})`, line, `Hay ${items.length} valores para ${n} variables.`);
      if (items.length < n) return pyErr("ValueError", `not enough values to unpack (expected ${n}, got ${items.length})`, line, `Hay ${items.length} valores para ${n} variables.`);
      target.items.forEach((t, k) => assignTo(t, items[k], line));
    }
  };

  const setItem = (o: Value, iv: Value, v: Value, line: number) => {
    {
      if (isDict(o)) return dictSet(o, iv, v, line);
      if (Array.isArray(o)) {
        if (!isIntLike(iv)) return pyErr("TypeError", `list indices must be integers or slices, not ${typeName(iv)}`, line, "Los índices tienen que ser números enteros.");
        const i = numOf(iv);
        const k = i < 0 ? o.length + i : i;
        if (k < 0 || k >= o.length) return pyErr("IndexError", "list assignment index out of range", line, `Índice ${i} fuera de rango.`);
        o[k] = v;
        return;
      }
      return pyErr("TypeError", `'${typeName(o)}' object does not support item assignment`, line, `Un ${typeName(o)} no se puede modificar: es inmutable.`);
    }
  };

  const execBlock = (stmts: Stmt[]) => {
    for (const s of stmts) exec(s);
  };

  const exec = (s: Stmt) => {
    switch (s.t) {
      case "assign": {
        const v = evalE(s.value, s.line);
        for (const t of s.targets) assignTo(t, v, s.line);
        snapshot(s.line);
        return;
      }
      case "aug": {
        const v = evalE(s.value, s.line);
        if (s.target.t === "name") {
          const old = lookup(s.target.v, s.line);
          if (Array.isArray(old) && s.op === "+") old.push(...iterItems(v, s.line));
          else assignTo(s.target, binop(s.op, old, v, s.line), s.line);
        } else if (s.target.t === "index") {
          const o = evalE(s.target.obj, s.line);
          const iv = evalE(s.target.idx, s.line);
          const old = index(o, iv, s.line);
          if (Array.isArray(old) && s.op === "+") old.push(...iterItems(v, s.line));
          else setItem(o, iv, binop(s.op, old, v, s.line), s.line);
        }
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
        // las listas se recorren "en vivo" (como Python); el resto, una copia
        const live = Array.isArray(it);
        const items = live ? it : iterItems(it, s.line);
        for (let k = 0; k < items.length; k++) {
          assignTo(s.target, items[k], s.line);
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
        frame().vars[s.name] = { kind: "fn", name: s.name, params: s.params, defaults: s.defaults, body: s.body };
        snapshot(s.line);
        return;
      case "return":
        snapshot(s.line);
        throw new ReturnSignal(s.e ? evalE(s.e, s.line) : null);
      case "del":
        for (const t of s.targets) {
          if (t.t === "name") {
            lookup(t.v, s.line);
            delete frame().vars[t.v];
          } else if (t.t === "index") {
            const o = evalE(t.obj, s.line);
            const iv = evalE(t.idx, s.line);
            if (isDict(o)) {
              const h = hashKey(iv, s.line);
              if (!o.map.has(h)) pyErr("KeyError", pyRepr(iv), s.line, `La clave ${pyRepr(iv)} no está en el diccionario.`);
              o.map.delete(h);
            } else if (Array.isArray(o)) {
              const i = intArg(iv, s.line, "del");
              const k = i < 0 ? o.length + i : i;
              if (k < 0 || k >= o.length) pyErr("IndexError", "list assignment index out of range", s.line, `Índice ${i} fuera de rango.`);
              o.splice(k, 1);
            } else pyErr("TypeError", `'${typeName(o)}' object doesn't support item deletion`, s.line);
          }
        }
        snapshot(s.line);
        return;
      case "global":
        s.names.forEach((n) => frame().globalNames.add(n));
        snapshot(s.line);
        return;
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

  const finish = (ok: boolean, error?: RunResult["error"]): RunResult => {
    const exported: Record<string, Value> = {};
    const reprs: Record<string, string> = {};
    for (const [k, v] of Object.entries(globals)) {
      exported[k] = exportValue(v);
      if (!isFn(v)) reprs[k] = pyRepr(v);
    }
    return { ok, steps, output: output(), stdout, globals: exported, reprs, error };
  };

  try {
    const program = parseProgram(src);
    execBlock(program);
    return finish(true);
  } catch (e) {
    if (e instanceof CodeError) {
      return finish(false, { message: e.message, line: e.line, kind: e.kind, pyType: e.pyType, pyMessage: e.pyMessage });
    }
    if (e instanceof ReturnSignal || e instanceof BreakSignal || e instanceof ContinueSignal) {
      const what = e instanceof ReturnSignal ? "return" : e instanceof BreakSignal ? "break" : "continue";
      return finish(false, {
        message: `«${what}» solo se puede usar dentro de ${what === "return" ? "una función" : "un bucle"}.`,
        line: steps.at(-1)?.line ?? 1,
        kind: "sintaxis",
        pyType: "SyntaxError",
      });
    }
    if (e instanceof RangeError) {
      return finish(false, { message: "El programa se quedó sin memoria (¿una recursión o una estructura demasiado grande?).", line: steps.at(-1)?.line ?? 1, kind: "ejecucion", pyType: "RecursionError" });
    }
    throw e;
  }
}
