/**
 * Generadores de Pensamiento Computacional (Python 3) al estilo de los parciales
 * de la cátedra: casi todo es «¿qué muestra este programa?».
 *
 * Regla de oro: NINGUNA respuesta se calcula a mano. El programa generado se
 * ejecuta con el intérprete (src/engine/code/interpreter.ts, verificado contra
 * CPython) y los distractores salen de ejecutar versiones "mal leídas" del mismo
 * programa (el error típico: olvidar que range excluye el final, que reverse()
 * devuelve None, que el string no se modifica, etc.).
 */
import type { ChoiceExercise, Difficulty, ErrorType, Generator, NumericExercise, TraceExercise } from "../types";
import { run, type RunResult } from "../code/interpreter";
import { rng, type Rng } from "./rng";
import { base, choice, type Option } from "./helpers";

const S = "pensamiento-computacional";
type Hints = [string, string, string];

// ───────────────────────── Helpers ─────────────────────────

function exec(code: string): RunResult {
  const r = run(code);
  if (!r.ok) throw new Error(`Programa generado inválido: ${r.error?.message}\n${code}`);
  return r;
}

/** Bloque de código para enunciados y opciones. */
const block = (code: string) => "```\n" + code + "\n```";

/** Cómo se muestra una salida como opción de respuesta. */
export function shown(stdout: string): string {
  if (stdout === "") return "No muestra nada";
  const body = stdout.endsWith("\n") ? stdout.slice(0, -1) : stdout;
  if (body === "") return "Una línea en blanco";
  if (body.includes("\n") || /^\s|\s$/.test(body)) return block(body);
  return "`" + body + "`";
}

/** Resolución a partir de la traza real del programa. */
function traceSolution(res: RunResult): string[] {
  const out: string[] = [];
  let prev = "";
  for (const st of res.steps) {
    const parts: string[] = [];
    const ch = st.changed.filter((k) => k in st.vars).map((k) => `${k} = ${st.vars[k]}`);
    if (ch.length) parts.push(ch.join(", "));
    const now = st.output.join("\n");
    if (now !== prev) {
      const last = st.output[st.output.length - 1] ?? "";
      parts.push(`salida: ${last === "" ? "(línea en blanco)" : last}`);
      prev = now;
    }
    if (parts.length) out.push(`Línea ${st.line}: ${parts.join(" · ")}`);
  }
  const lines = out.length > 14 ? [...out.slice(0, 11), "…", ...out.slice(-2)] : out;
  return lines.length ? lines : ["El programa no cambia variables ni muestra nada."];
}

export interface Wrong {
  /** Versión "mal leída" del programa: su salida es el distractor. */
  code?: string;
  /** O directamente el texto del distractor. */
  text?: string;
  type: ErrorType;
  message: string;
}

const FALLBACKS: Wrong[] = [
  { text: "No muestra nada", type: "programacion", message: "Sí muestra algo: hay al menos un `print` que se ejecuta. Seguí el programa línea por línea." },
  { text: "Da error", type: "programacion", message: "El programa no tiene errores: todas las operaciones son válidas para los tipos que se usan." },
];

function wrongText(w: Wrong): string | null {
  if (w.text !== undefined) return w.text;
  if (!w.code) return null;
  const r = run(w.code);
  return r.ok ? shown(r.stdout) : null;
}

/** Arma las 4 opciones: la correcta + hasta 3 distractores distintos (con su diagnóstico). */
function buildOptions(correct: string, wrongs: Wrong[], n = 4): Option[] {
  const opts: Option[] = [{ text: correct, correct: true }];
  const seen = new Set([correct]);
  for (const w of [...wrongs, ...FALLBACKS]) {
    if (opts.length >= n) break;
    const t = wrongText(w);
    if (t === null || seen.has(t)) continue;
    seen.add(t);
    opts.push({ text: t, error: { type: w.type, message: w.message } });
  }
  return opts;
}

interface OutArgs {
  gen: string;
  r: Rng;
  seed: number;
  d: Difficulty;
  topicId: string;
  code: string;
  hints: Hints;
  explanation: string;
  wrongs: Wrong[];
  question?: string;
}

/** «¿Qué muestra este programa?» con la respuesta obtenida ejecutándolo. */
function outputChoice(a: OutArgs): ChoiceExercise {
  const res = exec(a.code);
  const correct = shown(res.stdout);
  const solution = [...traceSolution(res), `Salida completa: ${res.stdout === "" ? "nada" : res.stdout.replace(/\n$/, "").split("\n").join(" ⏎ ")}`];
  return choice(
    a.r,
    base({
      gen: a.gen, seed: a.seed, difficulty: a.d, subjectId: S, topicId: a.topicId,
      prompt: `${a.question ?? "¿Qué muestra este programa?"}\n\n${block(a.code)}`,
      hints: a.hints, solution, explanation: a.explanation,
    }),
    buildOptions(correct, a.wrongs),
  );
}

/** Ejercicio de traza: predecir el valor final de algunas variables. */
function traceEx(a: { gen: string; seed: number; d: Difficulty; topicId: string; code: string; ask: string[]; intro: string; hints: Hints; explanation: string; frequentErrors?: TraceExercise["frequentErrors"] }): TraceExercise {
  const res = exec(a.code);
  const answer: Record<string, number | string | boolean> = {};
  for (const name of a.ask) {
    const v = res.globals[name];
    if (!(typeof v === "number" || typeof v === "string" || typeof v === "boolean")) throw new Error(`traza: ${name} no es simple en\n${a.code}`);
    answer[name] = v;
  }
  return {
    ...base({
      gen: a.gen, seed: a.seed, difficulty: a.d, subjectId: S, topicId: a.topicId,
      prompt: a.intro, hints: a.hints, solution: traceSolution(res), explanation: a.explanation, frequentErrors: a.frequentErrors,
    }),
    kind: "trace",
    code: a.code,
    ask: a.ask,
    answer,
  };
}

const q = (s: string) => JSON.stringify(s);
const pyList = (xs: (number | string)[]) => `[${xs.map((x) => (typeof x === "string" ? q(x) : String(x))).join(", ")}]`;
function distinctInts(r: Rng, n: number, lo: number, hi: number): number[] {
  const out = new Set<number>();
  while (out.size < n) out.add(r.int(lo, hi));
  return [...out];
}

const NOMBRES = ["ana", "juan cruz", "ines", "bruno", "sofia", "martin", "lucia", "tomas", "valentina", "maria jose", "pedro", "carla"];
const PALABRAS = ["programa", "algoritmo", "variable", "computadora", "python", "parcial", "facultad", "funcion", "iterador", "pizarron"];

// ───────────────────────── Slot 01: booleanos, precedencia, range ─────────────────────────

export const pcBooleanos: Generator = {
  id: "pc-booleanos",
  topicId: "t-pc-booleanos",
  description: "Condiciones con and/or/not, precedencia e in range()",
  generate(seed, d) {
    const r = rng(seed);
    const mes = r.int(1, 12), dia = r.int(1, 31);
    const a = r.int(3, 10), a2 = r.int(1, 12), b = r.int(8, 25), lo = r.int(2, 6), hi = lo + r.int(2, 5), st = r.int(2, 4);
    const t = distinctInts(r, 3, 1, 12).sort((x, y) => x - y);
    const L1: [string, string][] = [
      [`mes > ${a} and dia < ${b}`, "Con `and` tienen que ser verdaderas las DOS comparaciones."],
      [`mes > ${a} or dia < ${b}`, "Con `or` alcanza con que UNA comparación sea verdadera."],
      [`not mes == ${mes === a ? a : a2}`, "`not` invierte: primero se evalúa la comparación y después se niega."],
      [`mes in (${t.join(", ")})`, "`in` con una tupla pregunta si el valor es EXACTAMENTE alguno de sus elementos."],
    ];
    const L2: [string, string][] = [
      [`mes in range(${lo}, ${hi})`, `range(${lo}, ${hi}) NO incluye el ${hi}: llega hasta ${hi - 1}.`],
      [`mes not in range(${lo}, ${hi}) or dia == ${b}`, "`not in` es lo contrario de `in`; y con `or` alcanza una sola parte verdadera."],
      [`dia in range(${b % 2 ? 1 : 2}, 32, 2)`, "range con paso 2 salta de a dos: solo incluye uno de cada dos números."],
      [`mes in range(${hi})`, `range(${hi}) genera 0, 1, …, ${hi - 1}.`],
    ];
    const L3: [string, string][] = [
      [`not mes > ${a} and dia < ${b}`, "`not` tiene más prioridad que `and`: se lee `(not mes > …) and (dia < …)`, no `not (… and …)`."],
      [`mes == ${a} or mes == ${a2} and dia > ${b}`, "`and` se evalúa antes que `or`: es `mes == … or (mes == … and dia > …)`."],
      [`mes in range(12, ${lo}, -${st})`, `Con paso negativo, range cuenta hacia ABAJO desde 12 de a ${st} y tampoco incluye el final.`],
      [`dia > ${b} or not mes in (${t.join(", ")})`, "`not mes in (…)` es lo mismo que `mes not in (…)`; y `or` se evalúa al final."],
    ];
    const L4: [string, string][] = [
      [`not (mes < ${a} or dia > ${b})`, "De Morgan: `not (A or B)` equivale a `not A and not B`: tienen que ser falsas las dos."],
      [`not mes < ${a} or dia > ${b}`, "Sin paréntesis, `not` afecta solo a `mes < …`; el `or` se evalúa al final."],
      [`(mes == 12 or mes < 3) and not dia in range(1, ${b})`, "Primero el paréntesis; después `not` sobre el `in`; por último el `and`."],
      [`mes in range(${lo}, 13, ${st}) and not (dia < ${b} and mes > ${a})`, `range(${lo}, 13, ${st}) arranca en ${lo} y salta de a ${st}: no contiene todos los meses.`],
    ];
    const pool = d <= 1 ? L1 : d === 2 ? [...L1, ...L2] : d === 3 ? [...L2, ...L3] : d === 4 ? L3 : [...L3, ...L4];
    const [e1, e2] = r.shuffle(pool).slice(0, 2);
    const code = `mes = ${mes}\ndia = ${dia}\nprint(${e1[0]})\nprint(${e2[0]})`;
    const out = exec(code).output;
    const v = out.map((x) => x === "True");
    const combos: [boolean, boolean][] = [[true, true], [true, false], [false, true], [false, false]];
    const wrongs: Wrong[] = combos
      .filter(([x, y]) => x !== v[0] || y !== v[1])
      .map(([x, y]) => {
        const msgs: string[] = [];
        if (x !== v[0]) msgs.push(`La primera condición da ${v[0] ? "True" : "False"}. ${e1[1]}`);
        if (y !== v[1]) msgs.push(`La segunda condición da ${v[1] ? "True" : "False"}. ${e2[1]}`);
        return { text: shown(`${x ? "True" : "False"}\n${y ? "True" : "False"}\n`), type: "logica" as ErrorType, message: msgs.join(" ") };
      });
    return outputChoice({
      gen: this.id, r, seed, d, topicId: this.topicId, code, wrongs,
      hints: [
        "Reemplazá cada comparación por True o False usando los valores de mes y dia.",
        "Prioridad: primero las comparaciones e `in`, después `not`, después `and` y por último `or`.",
        "range(a, b, c) empieza en a, avanza de a c y NO incluye b (con c negativo cuenta hacia abajo).",
      ],
      explanation: "En Python el orden es: comparaciones (`<`, `==`, `in`) → `not` → `and` → `or`. Los paréntesis cambian ese orden. Y `x in range(a, b)` es verdadero solo si x está entre a y b − 1 (respetando el paso).",
    });
  },
};

export const pcRange: Generator = {
  id: "pc-range",
  topicId: "t-pc-booleanos",
  description: "Qué números genera range(a, b, c)",
  generate(seed, d) {
    const r = rng(seed);
    let args: string, incl: string, alt: string;
    if (d <= 2) {
      const b = r.int(3, 7);
      const a = d === 1 ? 0 : r.int(1, 3);
      args = d === 1 ? `${b}` : `${a}, ${b}`;
      incl = d === 1 ? `${b + 1}` : `${a}, ${b + 1}`;
      alt = d === 1 ? `1, ${b + 1}` : `${a + 1}, ${b + 1}`;
    } else if (d <= 4) {
      const a = r.int(0, 4), c = r.int(2, 4), b = a + c * r.int(2, 4) + r.int(0, 1);
      args = `${a}, ${b}, ${c}`;
      incl = `${a}, ${b + 1}, ${c}`;
      alt = `${a}, ${b}`;
    } else {
      const a = r.int(10, 20), c = r.int(2, 4), b = a - c * r.int(2, 4) + r.int(-1, 0);
      args = `${a}, ${b}, -${c}`;
      incl = `${a}, ${b - 1}, -${c}`;
      alt = `${a}, ${b}, ${c}`;
    }
    const body = (rg: string, end = true) => `for i in range(${rg}):\n    print(i${end ? ', end=" "' : ""})`;
    const code = body(args);
    return outputChoice({
      gen: this.id, r, seed, d, topicId: this.topicId, code,
      wrongs: [
        { code: body(incl), type: "algoritmico", message: "Incluiste el valor final: range(a, b) se detiene ANTES de llegar a b." },
        { code: body(alt), type: "algoritmico", message: d >= 5 ? "Con paso positivo y un inicio mayor que el final, range no genera nada. Acá el paso es negativo: cuenta hacia abajo." : "Revisá dónde empieza: range(n) arranca en 0 y range(a, b) arranca en a." },
        { code: body(args, false), type: "programacion", message: "Con `end=\" \"` cada print NO salta de línea: todo queda en una sola línea separado por espacios." },
        { code: `print(${q(args.split(", ").slice(0, 2).join(" "))})`, type: "conceptual", message: "range no muestra sus argumentos: genera la secuencia de números que el for recorre." },
      ],
      hints: [
        "range(n) = 0, 1, …, n − 1.",
        "range(a, b, c) empieza en a, suma c cada vez y para ANTES de llegar a b.",
        "`end=\" \"` cambia el salto de línea final de print por un espacio.",
      ],
      explanation: "range nunca incluye el valor final. Con paso negativo cuenta hacia abajo y frena antes de llegar al final. Si el paso no permite acercarse al final, no genera ningún número.",
    });
  },
};

// ───────────────────────── Slot 02: tipos y TypeError ─────────────────────────

export const pcTipoError: Generator = {
  id: "pc-tipo-error",
  topicId: "t-pc-tipos",
  description: "¿Cuál de estos programas da error? (TypeError/ValueError)",
  generate(seed, d) {
    const r = rng(seed);
    const n = r.int(2, 9);
    const m = r.int(2, 5);
    const errs: [string, string][] = [
      [`y = x * x`, "Multiplicar dos textos no tiene sentido: `str * str` da TypeError."],
      [`y = x * ${m}.5`, "Un texto solo se puede repetir un número ENTERO de veces: `str * float` da TypeError."],
      [`y = x / ${m}`, "`/` no está definido para textos: `str / int` da TypeError."],
      [`y = x // ${m}`, "`//` no está definido para textos: `str // int` da TypeError."],
      [`y = x + ${m}`, "No se puede sumar texto con un número: `str + int` da TypeError."],
      [`y = x + ${m}.0`, "No se puede sumar texto con un número: `str + float` da TypeError."],
      [`y = int("${n}.5")`, "int() no convierte un texto con coma decimal: `int(\"2.5\")` da ValueError."],
    ];
    const oks = [
      `y = x * ${m}`,
      `y = x + "${m}"`,
      `y = int(x) / ${m}`,
      `y = float(x) * ${m}.5`,
      `y = str(${m}) + x`,
      `y = int(x) // ${m}`,
      `y = len(x) * ${m}.5`,
      `y = x * int("${m}")`,
      `y = int(float("${n}.5"))`,
      `y = ${m} * x`,
    ];
    const pickErr = d <= 2 ? errs.slice(0, 5) : errs;
    const [errLine, why] = r.pick(pickErr);
    const prog = (line: string) => `x = "${n}"${d >= 4 ? "   # como si viniera de input()" : ""}\n${line}\nprint(y)`;
    const goods = r.shuffle(oks).slice(0, 3);
    const opts: Option[] = [{ text: block(prog(errLine)), correct: true }];
    for (const g of goods) {
      const res = exec(prog(g));
      opts.push({ text: block(prog(g)), error: { type: "programacion", message: `Ese programa funciona: muestra \`${res.output.join(" ")}\`. ${g.includes("x *") || g.includes("* x") ? "Un texto por un ENTERO repite el texto." : "Ahí se convierte el tipo antes de operar, o se combinan tipos compatibles."}` } });
    }
    const bad = run(prog(errLine));
    if (bad.ok) throw new Error("pc-tipo-error: el programa con error no falla");
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: "¿Cuál de estos programas **da error** al ejecutarse?",
        hints: [
          "Fijate de qué tipo es cada valor: `x` tiene comillas, así que es un texto (str).",
          "Con textos valen `+` entre textos y `*` por un ENTERO. `/`, `//`, `-` y `* float` no existen para str.",
          "int() convierte textos que representan enteros: \"7\" sí, \"2.5\" no.",
        ],
        solution: [`El programa con error es el que tiene \`${errLine}\`.`, `Python responde: ${bad.error?.pyType}: ${bad.error?.pyMessage}`, why],
        explanation: "Lo que viene de input() siempre es str. Con textos solo valen `+` (entre textos) y `*` (por un entero); para hacer cuentas hay que convertir con int() o float().",
      }),
      opts,
    );
  },
};

export const pcTiposSalida: Generator = {
  id: "pc-tipos-salida",
  topicId: "t-pc-tipos",
  description: "Qué muestra: / vs //, conversiones y repetición de textos",
  generate(seed, d) {
    const r = rng(seed);
    const n = r.int(2, 9), m = r.int(2, 4);
    const k = r.int(2, 5), mult = r.int(2, 4);
    const forms: { code: string; wrongs: Wrong[] }[] = [
      {
        code: `x = "${n}"\ny = ${m}\nprint(x * y)`,
        wrongs: [
          { code: `print(${n} * ${m})`, type: "conceptual", message: "x es un texto (tiene comillas): `\"7\" * 3` REPITE el texto, no multiplica." },
          { code: `print("${n}" + "${m}")`, type: "conceptual", message: "`*` con un texto repite el texto y veces, no lo concatena con el número." },
        ],
      },
      {
        code: `a = ${k * mult}\nb = ${k}\nprint(a / b, a // b)`,
        wrongs: [
          { code: `print(${mult}, ${mult})`, type: "conceptual", message: "`/` SIEMPRE da float, aunque la división sea exacta: se muestra con `.0`." },
          { code: `print(${mult}.0, ${mult}.0)`, type: "conceptual", message: "`//` entre enteros da un int: no lleva `.0`." },
        ],
      },
      {
        code: `x = "${n}"\nprint(x + x, int(x) + int(x))`,
        wrongs: [
          { code: `print(${2 * n}, ${2 * n})`, type: "conceptual", message: "`x + x` con textos los pega (concatena): no suma." },
          { code: `print("${n}${n}", "${n}${n}")`, type: "conceptual", message: "int(x) convierte a número: `int(x) + int(x)` sí suma." },
        ],
      },
      {
        code: `x = ${n}.${r.pick([5, 6, 7, 2])}\nprint(int(x), x // 1, round(x))`,
        wrongs: [
          { code: `print(${n + 1}, ${n}, ${n + 1})`, type: "conceptual", message: "int() de un float CORTA la parte decimal, no redondea." },
          { code: `print(${n}, ${n}, ${n})`, type: "conceptual", message: "Si un operando es float, `//` devuelve float: `7.6 // 1` es `7.0`." },
        ],
      },
      {
        code: `print(type(${k * mult} / ${k}), type("${n}"), type(${k} // ${m}))`,
        wrongs: [
          { code: `print(type(1), type("a"), type(1))`, type: "conceptual", message: "`/` siempre devuelve float, aunque el resultado sea entero." },
          { code: `print(type(1.0), type(1), type(1))`, type: "conceptual", message: "Lo que está entre comillas es str, aunque sean dígitos." },
        ],
      },
      {
        code: `x = "${n}"\ny = int(x) * ${m}\nz = x * ${m}\nprint(len(z), y)`,
        wrongs: [
          { code: `print(${n * m}, ${n * m})`, type: "conceptual", message: "z es el texto repetido: su largo es la cantidad de caracteres, no el producto." },
          { code: `print(1, ${n * m})`, type: "conceptual", message: `\`x * ${m}\` repite el texto ${m} veces: el largo cambia.` },
        ],
      },
    ];
    const f = forms[d <= 2 ? r.int(0, 2) : d <= 4 ? r.int(1, 4) : r.int(3, 5)];
    return outputChoice({
      gen: this.id, r, seed, d, topicId: this.topicId, code: f.code, wrongs: f.wrongs,
      hints: [
        "Primero identificá el tipo de cada valor: con comillas es str; con punto es float; sin punto, int.",
        "`/` siempre da float; `//` entre int da int; texto * entero repite el texto.",
        "int() corta los decimales; round() redondea al más cercano.",
      ],
      explanation: "El tipo decide qué hace cada operador: `+` suma números pero pega textos; `*` multiplica números pero repite textos; `/` siempre produce un float.",
    });
  },
};

// ───────────────────────── Slot 03: // y % con negativos, condicionales anidados ─────────────────────────

export const pcDivMod: Generator = {
  id: "pc-div-mod",
  topicId: "t-pc-aritmetica",
  description: "// y % de Python con negativos",
  generate(seed, d) {
    const r = rng(seed);
    let code: string;
    let wrongs: Wrong[];
    if (d <= 2) {
      const k = r.pick([2, 3, 4, 5, 10]);
      const n = d === 1 ? r.int(11, 60) : -r.int(11, 60);
      code = `num = ${n}\nprint(num // ${k}, num % ${k})`;
      wrongs = [
        { code: `num = ${n}\nprint(int(num / ${k}), num - ${k} * int(num / ${k}))`, type: "signos", message: "Eso es truncar hacia cero. En Python, `//` redondea hacia ABAJO (hacia −∞) y el resto toma el signo del divisor." },
        { code: `num = ${n}\nprint(num % ${k}, num // ${k})`, type: "programacion", message: "El orden de los valores es el del print: primero `num // …` y después `num % …`." },
        { code: `num = ${n}\nprint(num / ${k}, num % ${k})`, type: "conceptual", message: "`//` es división ENTERA; `/` sería la división con decimales." },
      ];
    } else if (d <= 4) {
      const n = -r.int(101, 999);
      const k = r.pick([10, 100]);
      code = `num = ${n}\nprint(num % ${k}, num // ${k}, abs(num) % 10)`;
      wrongs = [
        { code: `num = ${n}\nprint(num - ${k} * int(num / ${k}), int(num / ${k}), abs(num) % 10)`, type: "signos", message: `En Python el resto con divisor positivo SIEMPRE es positivo: ${n} % ${k} cuenta cuánto le falta al múltiplo de abajo.` },
        { code: `num = ${n}\nprint(abs(num) % ${k}, num // ${k}, abs(num) % 10)`, type: "signos", message: "No se puede ignorar el signo: `num % …` con num negativo da otro resultado que con su valor absoluto." },
        { code: `num = ${n}\nprint(num % ${k}, int(num / ${k}), abs(num) % 10)`, type: "signos", message: "`//` redondea hacia −∞: con negativos da uno menos que truncar." },
      ];
    } else {
      const a = r.int(5, 15), k = r.pick([2, 3, 4]);
      code = `x = -${a}.5\nprint(x // ${k}, x % ${k})`;
      wrongs = [
        { code: `x = -${a}.5\nprint(float(int(x / ${k})), x - ${k} * int(x / ${k}))`, type: "signos", message: "`//` redondea hacia abajo (hacia −∞), también con float; y el resto lleva el signo del divisor." },
        { code: `x = -${a}.5\nprint(int(x // ${k}), x % ${k})`, type: "conceptual", message: "Con un float, `//` devuelve float (lleva `.0`)." },
        { code: `x = ${a}.5\nprint(x // ${k}, x % ${k})`, type: "signos", message: "El signo importa: con negativos el cociente baja y el resto cambia." },
      ];
    }
    wrongs.push({ code: code.replace(/print\((.*)\)/, (_m, a: string) => `print(${a.split(", ").reverse().join(", ")})`), type: "programacion", message: "Los valores se muestran en el orden en que están escritos en el print." });
    wrongs.push({ code: code.replace(/num = (-?\d+)|x = (-?[\d.]+)/, (m) => m.replace("-", "")), type: "signos", message: "Con el signo cambiado el resultado es otro: en Python `//` redondea hacia −∞." });
    return outputChoice({
      gen: this.id, r, seed, d, topicId: this.topicId, code, wrongs,
      hints: [
        "`a // b` es el entero más grande que es ≤ a / b (redondea hacia −∞).",
        "`a % b` es lo que sobra: a − b·(a // b). Con b positivo, el resto siempre queda entre 0 y b − 1.",
        "Ejemplo: −7 // 2 = −4 (no −3) y −7 % 2 = 1, porque 2·(−4) + 1 = −7.",
      ],
      explanation: "Python garantiza `a == b * (a // b) + a % b`, con `//` hacia −∞. Por eso con negativos el cociente es uno menos que al truncar, y el resto queda con el signo del divisor.",
    });
  },
};

export const pcIfAnidado: Generator = {
  id: "pc-if-anidado",
  topicId: "t-pc-condicionales",
  description: "if/elif/else anidados con // y %",
  generate(seed, d) {
    const r = rng(seed);
    const neg = d >= 2 || r.bool();
    const num = (neg ? -1 : 1) * r.int(11, 99);
    const k = r.pick([3, 4, 5, 6, 7]);
    const lim = r.int(1, k - 1);
    const forms = [
      `if num % 2 == 0:\n    print("par")\nelse:\n    if num > 0:\n        print("impar positivo")\n    else:\n        print("impar negativo")`,
      `if num % ${k} >= ${lim}:\n    print("grupo A")\n    if num // 10 < -5:\n        print("lejos")\nelif num % 2 == 1:\n    print("grupo B")`,
      `if num // 10 > -3:\n    if num % 10 > 4:\n        print("alto")\nif num % ${k} == ${(num % k + k) % k}:\n    print("resto ${(num % k + k) % k}")\nelse:\n    print("otro resto")`,
      `if num > 0:\n    print("positivo")\nelif num % 10 > 5:\n    print("termina alto")\n    if num // 10 % 2 == 0:\n        print("decena par")\nelse:\n    print("termina bajo")`,
    ];
    const body = forms[d <= 1 ? 0 : d <= 3 ? r.int(0, 3) : r.int(1, 3)];
    const prog = (header: string, b = body) => `${header}\n${b}`;
    const code = prog(`num = ${num}`);
    const vals = exec(`num = ${num}\nprint(num % ${k}, num % 10, num % 2, num // 10)`).output[0].split(" ");
    const cuentas = `Con num = ${num}: num % ${k} = ${vals[0]}, num % 10 = ${vals[1]}, num % 2 = ${vals[2]} y num // 10 = ${vals[3]}.`;
    const truncBody = body.replace(/num % (\d+)/g, "(num - $1 * int(num / $1))").replace(/num \/\/ (\d+)/g, "int(num / $1)");
    return outputChoice({
      gen: this.id, r, seed, d, topicId: this.topicId, code,
      wrongs: [
        { code: prog(`num = ${num}`, truncBody), type: "signos", message: "Calculaste `%` y `//` truncando hacia cero (como en otros lenguajes). En Python, con negativos `//` redondea hacia −∞ y el resto con divisor positivo nunca es negativo." },
        { code: prog(`num = ${-num}`), type: "signos", message: "Ese es el resultado para el número positivo. El signo cambia qué condiciones se cumplen." },
        { code: prog(`num = ${num}`, body.replace(/^( *)print\((.*)\)$/gm, "$1print($2, end=\" \")")), type: "programacion", message: "Cada print termina con un salto de línea: si se ejecutan dos prints, la salida ocupa dos líneas." },
        { code: prog(`num = ${num + 5}`), type: "calculo", message: `Revisá las cuentas. ${cuentas}` },
        { code: prog(`num = ${num - 4}`), type: "calculo", message: `Revisá las cuentas. ${cuentas}` },
        { code: prog(`num = ${num + 10}`), type: "calculo", message: `Revisá las cuentas. ${cuentas}` },
        { code: prog(`num = ${num - 13}`), type: "calculo", message: `Revisá las cuentas. ${cuentas}` },
      ],
      hints: [
        "Calculá primero los valores de `num % …` y `num // …` con el número negativo.",
        "Un `if` sin `else` puede no mostrar nada; dos `if` seguidos (no `elif`) se evalúan los dos.",
        "Recordá: −17 % 10 = 3 y −17 // 10 = −2 en Python.",
      ],
      explanation: "Seguí el camino exacto: un if/elif/else ejecuta un solo bloque, pero dos if independientes se evalúan por separado. Y con negativos, `%` y `//` de Python no truncan: redondean hacia −∞.",
    });
  },
};

// ───────────────────────── Slot 04: ciclos ─────────────────────────

export const pcCicloLineas: Generator = {
  id: "pc-ciclo-lineas",
  topicId: "t-pc-ciclos",
  description: "Cuántas líneas muestra un programa con ciclos",
  generate(seed, d) {
    const r = rng(seed);
    const forms: { code: string; wrongs: { code: string; type: ErrorType; message: string }[] }[] = [];
    const n = r.int(2, 5), m = r.int(2, 4);
    forms.push({
      code: `for i in range(${n}):\n    print("*")\n    for j in range(${m}):\n        print("-")`,
      wrongs: [{ code: `for i in range(${n}):\n    for j in range(${m}):\n        print("-")`, type: "algoritmico", message: "Te faltó contar el print del ciclo de afuera: se ejecuta una vez por cada vuelta de i." }],
    });
    const a = r.int(1, 4), c = r.int(2, 3), b = a + c * r.int(2, 4);
    forms.push({
      code: `for i in range(${a}, ${b}, ${c}):\n    for j in range(i):\n        print(i, j)`,
      wrongs: [{ code: `for i in range(${a}, ${b + 1}, ${c}):\n    for j in range(i):\n        print(i, j)`, type: "algoritmico", message: "Incluiste el final del range: range(a, b, c) para ANTES de b." }],
    });
    const s = r.int(5, 12), t = r.int(1, 15), st = r.int(2, 3);
    forms.push({
      code: `i = ${s}\nwhile i < ${t}:\n    print(i)\n    i += ${st}\nprint("fin")`,
      wrongs: [{ code: `i = ${s}\nwhile i <= ${t}:\n    print(i)\n    i += ${st}`, type: "algoritmico", message: "La condición es `<` (estricto) y además hay un print fuera del while que siempre se ejecuta." }],
    });
    const hi = r.int(12, 20), lo = r.int(0, 4), dec = r.int(2, 4);
    forms.push({
      code: `for i in range(${hi}, ${lo}, -${dec}):\n    if i % 2 == 0:\n        print(i)\nprint(i)`,
      wrongs: [
        { code: `for i in range(${hi}, ${lo}, -${dec}):\n    if i % 2 == 0:\n        print(i)`, type: "programacion", message: "El último `print(i)` está fuera del for: se ejecuta una vez más al final, con el último valor que tomó i." },
        { code: `for i in range(${hi}, ${lo - 1}, -${dec}):\n    if i % 2 == 0:\n        print(i)\nprint(i)`, type: "algoritmico", message: "range con paso negativo tampoco incluye el final." },
      ],
    });
    const f = forms[d <= 2 ? r.int(0, 1) : d <= 4 ? r.int(1, 3) : r.int(2, 3)];
    const res = exec(f.code);
    const answer = res.output.length;
    const fe = f.wrongs.map((w) => ({ match: run(w.code).output.length, type: w.type, message: w.message })).filter((x) => x.match !== answer);
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `¿Cuántas líneas muestra este programa?\n\n${block(f.code)}`,
        hints: [
          "Contá cuántas vueltas da cada ciclo; si están anidados, el de adentro se repite completo por cada vuelta del de afuera.",
          "range(a, b, c) para antes de b. Un while cuya condición es falsa al principio no entra nunca.",
          "Cada print (sin end=) produce una línea. Ojo con los print que están FUERA del ciclo.",
        ],
        solution: [...traceSolution(res).slice(0, 8), `Total: ${answer} líneas.`],
        explanation: "Para contar líneas, multiplicá vueltas en los ciclos anidados y sumá los print que están fuera. La variable del for conserva su último valor después del ciclo.",
        frequentErrors: fe,
      }),
      kind: "numeric",
      answer,
    } as NumericExercise;
  },
};

export const pcCicloTraza: Generator = {
  id: "pc-ciclo-traza",
  topicId: "t-pc-ciclos",
  description: "Valor final de acumuladores y de la variable del for",
  generate(seed, d) {
    const r = rng(seed);
    const a = r.int(0, 3), c = r.int(2, 3), b = a + c * r.int(2, 4) + r.int(1, 2);
    const N = r.int(1000, 9999);
    const xs = Array.from({ length: 5 }, () => r.int(1, 9));
    const x0 = r.int(0, 3), y0 = r.int(1, 4);
    const forms: { code: string; ask: string[]; expl: string }[] = [
      { code: `s = 0\nfor i in range(${a}, ${b}, ${c}):\n    s += i`, ask: ["s", "i"], expl: "Después del for, i conserva el ÚLTIMO valor que tomó (no el final del range)." },
      { code: `c = 0\nn = ${N}\nwhile n > 0:\n    c += n % 10\n    n //= 10`, ask: ["c", "n"], expl: "`n % 10` es la última cifra y `n //= 10` la elimina: el ciclo suma las cifras." },
      { code: `p = 1\nk = 0\nfor x in ${pyList(xs)}:\n    if x % 2 == 1:\n        p *= x\n        k += 1`, ask: ["p", "k"], expl: "Solo entran al if los impares (x % 2 == 1): p multiplica esos y k los cuenta." },
      { code: `a = ${x0}\nb = ${y0}\nfor i in range(${r.int(3, 5)}):\n    a, b = b, a + b`, ask: ["a", "b"], expl: "En `a, b = b, a + b` se calcula TODO el lado derecho con los valores viejos y después se asigna." },
    ];
    const f = forms[d <= 2 ? r.int(0, 1) : d <= 4 ? r.int(0, 2) : r.int(2, 3)];
    return traceEx({
      gen: this.id, seed, d, topicId: this.topicId, code: f.code, ask: f.ask,
      intro: "¿Qué valores tienen las variables al terminar el programa?",
      hints: [
        "Armá una tabla con una columna por variable y una fila por vuelta.",
        "El for asigna a su variable cada elemento en orden; al terminar, la variable queda con el último.",
        f.expl,
      ],
      explanation: f.expl,
    });
  },
};

// ───────────────────────── Slots 05–06: strings ─────────────────────────

export const pcSlicing: Generator = {
  id: "pc-slicing",
  topicId: "t-pc-strings",
  description: "Índices (también negativos) y slicing [a:b:c]",
  generate(seed, d) {
    const r = rng(seed);
    const w = r.pick(PALABRAS);
    const L = w.length;
    const a = r.int(1, 3), b = a + r.int(2, 3), k = r.int(2, 4);
    const forms: { expr: string; wrongs: [string, ErrorType, string][] }[] = [
      { expr: `s[0], s[-1]`, wrongs: [[`s[1], s[-2]`, "programacion", "Los índices empiezan en 0: s[0] es la PRIMERA letra; s[-1] es la última."], [`s[1], s[${L - 2}]`, "programacion", "s[-1] es la última letra (índice len − 1)."]] },
      { expr: `s[${a}:${b}]`, wrongs: [[`s[${a}:${b + 1}]`, "algoritmico", `El slice [${a}:${b}] NO incluye el índice ${b}.`], [`s[${a - 1}:${b - 1}]`, "programacion", "Contaste las posiciones desde 1: en Python el primer índice es 0."], [`s[${a}:${a + b}]`, "programacion", "El segundo número es la posición donde TERMINA, no la cantidad de letras."]] },
      { expr: `s[::-1]`, wrongs: [[`s`, "programacion", "`[::-1]` recorre de atrás hacia adelante: invierte el texto."], [`s[:-1]`, "programacion", "`[:-1]` sacaría la última letra; `[::-1]` (con dos puntos) invierte."]] },
      { expr: `s[-${k}:]`, wrongs: [[`s[:${k}]`, "programacion", `s[-${k}:] toma las últimas ${k} letras.`], [`s[-${k + 1}:]`, "algoritmico", `s[-${k}] es la ${k}ª letra desde el final: de ahí hasta el final hay ${k} letras.`]] },
      { expr: `s[${a}::2]`, wrongs: [[`s[${a}:]`, "programacion", "El tercer número es el paso: de a 2 salta una letra sí y una no."], [`s[${a + 1}::2]`, "programacion", `Arranca en el índice ${a}, que es la letra número ${a + 1}.`]] },
      { expr: `s[${b}:${a}:-1]`, wrongs: [[`s[${a}:${b}][::-1]`, "algoritmico", `Con paso −1 se empieza en ${b} (incluido) y se para antes de ${a}.`], [`""`, "programacion", "Con paso negativo, un inicio mayor que el final SÍ genera letras: va hacia atrás."]] },
      { expr: `s[-1] + s[1:-1] + s[0]`, wrongs: [[`s[0] + s[1:-1] + s[-1]`, "programacion", "s[-1] es la ÚLTIMA letra: va al principio del resultado."], [`s[-1] + s[1:] + s[0]`, "algoritmico", "s[1:-1] no incluye la última letra."]] },
    ];
    const f = forms[d <= 1 ? r.int(0, 1) : d <= 3 ? r.int(1, 4) : r.int(3, 6)];
    const code = (e: string) => `s = ${q(w)}\nprint(${e})`;
    return outputChoice({
      gen: this.id, r, seed, d, topicId: this.topicId, code: code(f.expr),
      wrongs: f.wrongs.map(([e, type, message]) => ({ code: code(e), type, message })),
      hints: [
        `Escribí el texto con su índice debajo de cada letra: 0 a ${L - 1} (y −1 a −${L} desde el final).`,
        "s[a:b] va desde a (incluido) hasta b (EXCLUIDO). Si falta a, desde el principio; si falta b, hasta el final.",
        "El tercer número es el paso; con paso negativo se recorre hacia atrás.",
      ],
      explanation: "Los índices empiezan en 0 y los negativos cuentan desde el final (−1 es la última). Un slice [a:b:c] incluye a, excluye b y avanza de a c.",
    });
  },
};

export const pcIndexSlicing: Generator = {
  id: "pc-index-slicing",
  topicId: "t-pc-strings",
  description: "index() (primera aparición) combinado con slicing",
  generate(seed, d) {
    const r = rng(seed);
    const frases = ["la casa azul", "banana split", "mi mama me mima", "pensar antes de programar", "la tarea de la tarde", "un dato y otro dato"];
    const s = r.pick(frases);
    const reps = [...new Set(s.replace(/ /g, ""))].filter((c) => s.split(c).length > 2);
    const c = r.pick(reps);
    const forms = [
      `i = s.index(${q(c)})\nprint(s[:i])`,
      `i = s.index(${q(c)})\nprint(s[:i])\nprint(s[i + 1:])`,
      `i = s.index(${q(c)})\nj = s.index(${q(c)}, i + 1)\nprint(s[i:j + 1])`,
      `i = s.index(${q(c)})\nprint(s[i + 1:].upper(), len(s[:i]))`,
    ];
    const body = forms[d <= 1 ? 0 : d <= 3 ? r.int(1, 2) : r.int(2, 3)];
    const code = `s = ${q(s)}\n${body}`;
    return outputChoice({
      gen: this.id, r, seed, d, topicId: this.topicId, code,
      wrongs: [
        { code: code.replace(`s.index(${q(c)})`, `s.rfind(${q(c)})`), type: "programacion", message: `index() devuelve la PRIMERA aparición de ${q(c)}, no la última.` },
        { code: code.replace(`i = s.index(${q(c)})`, `i = s.index(${q(c)}) + 1`), type: "algoritmico", message: "index() devuelve la posición contando desde 0, y s[:i] NO incluye la posición i." },
        { code: code.replace(`i = s.index(${q(c)})`, `i = s.index(${q(c)}) - 1`), type: "algoritmico", message: "Revisá el índice: es la posición de la letra contando desde 0 (los espacios también cuentan)." },
      ],
      hints: [
        "index() busca de izquierda a derecha y devuelve la posición de la PRIMERA aparición.",
        "Los espacios también ocupan una posición.",
        "s[:i] es todo lo anterior a la posición i; s[i + 1:] es todo lo posterior.",
      ],
      explanation: "`s.index(x)` devuelve la primera posición de x (desde 0). Con esa posición, `s[:i]` toma lo que está antes y `s[i+1:]` lo que está después, sin la letra encontrada.",
    });
  },
};

export const pcFuncStr: Generator = {
  id: "pc-func-str",
  topicId: "t-pc-metodos-str",
  description: "Valor que devuelve una función con count/split/join/in",
  generate(seed, d) {
    const r = rng(seed);
    const forms: { code: string; wrongs: Wrong[] }[] = [];
    const reps = r.int(2, 4);
    const t1 = "ana".repeat(reps) + r.pick(["", "na", "s"]);
    forms.push({
      code: `def f(t):\n    return t.count("ana")\n\nprint(f(${q(t1)}))`,
      wrongs: [
        { code: `def f(t):\n    c = 0\n    for i in range(len(t)):\n        if t[i:i + 3] == "ana":\n            c += 1\n    return c\n\nprint(f(${q(t1)}))`, type: "programacion", message: "count() cuenta apariciones que NO se superponen: después de encontrar una, sigue buscando a partir del final de esa." },
        { code: `print(${q(t1)}.count("a"))`, type: "programacion", message: "Se busca el texto \"ana\" completo, no la letra a." },
      ],
    });
    const words = r.shuffle(["hola", "que", "tal", "todo", "bien", "che"]).slice(0, r.int(3, 4));
    const spaced = words.join(r.pick(["  ", "   "]));
    forms.push({
      code: `def f(t):\n    return len(t.split())\n\nprint(f(${q(" " + spaced + " ")}))`,
      wrongs: [
        { code: `print(len(${q(" " + spaced + " ")}.split(" ")))`, type: "programacion", message: "split() SIN argumentos separa por cualquier cantidad de espacios y descarta los vacíos." },
        { code: `print(len(${q(" " + spaced + " ")}))`, type: "programacion", message: "len(t) contaría caracteres; len(t.split()) cuenta palabras." },
      ],
    });
    forms.push({
      code: `def f(t):\n    p = t.split()\n    return "-".join(p)\n\nprint(f(${q(spaced)}))`,
      wrongs: [
        { code: `print(${q(spaced)}.replace(" ", "-"))`, type: "programacion", message: "Después de split() ya no quedan espacios repetidos: join pone UN guion entre cada palabra." },
        { code: `print(${q(words.join(""))})`, type: "programacion", message: "join pone el separador \"-\" entre los elementos." },
      ],
    });
    const word = r.pick(["Casa", "Mesa", "Lapiz", "Banco"]);
    const frase = `la ${word.toLowerCase()} de ${r.pick(["ana", "juan", "ines"])}`;
    forms.push({
      code: `def f(t):\n    return ${q(word)} in t\n\nprint(f(${q(frase)}))`,
      wrongs: [
        { text: "`True`", type: "programacion", message: "`in` compara EXACTAMENTE: mayúsculas y minúsculas son caracteres distintos." },
        { text: "`None`", type: "programacion", message: "La función tiene return: devuelve el resultado de la comparación (True o False)." },
      ],
    });
    const t5 = r.pick(["programacion", "computadora", "algoritmo", "abracadabra"]);
    const letra = r.pick([...new Set(t5)]);
    forms.push({
      code: `def f(t):\n    c = 0\n    for x in t:\n        if x == ${q(letra)}:\n            c += 1\n    return c > len(t) // 4\n\nprint(f(${q(t5)}))`,
      wrongs: [
        { code: `print(${q(t5)}.count(${q(letra)}))`, type: "programacion", message: "La función no devuelve la cantidad: devuelve el resultado de la comparación `c > len(t) // 4` (un booleano)." },
        { code: `print(not (${q(t5)}.count(${q(letra)}) > len(${q(t5)}) // 4))`, type: "calculo", message: "Contá bien: compará la cantidad de apariciones con len(t) // 4 (división entera)." },
      ],
    });
    forms.push({
      code: `def f(t):\n    p = t.split()\n    return p[-1] + p[0]\n\nprint(f(${q(spaced)}))`,
      wrongs: [
        { code: `print(${q(words[0] + words[words.length - 1])})`, type: "programacion", message: "p[-1] es la ÚLTIMA palabra, y va primero en la suma." },
        { code: `print(${q(words[words.length - 1] + " " + words[0])})`, type: "programacion", message: "`+` entre textos los pega sin agregar espacio." },
      ],
    });
    const f = forms[d <= 2 ? r.int(1, 3) : d <= 4 ? r.int(0, 4) : r.pick([0, 4, 5])];
    return outputChoice({
      gen: this.id, r, seed, d, topicId: this.topicId, code: f.code, wrongs: f.wrongs,
      question: "¿Qué muestra este programa (es decir, qué devuelve la función)?",
      hints: [
        "Reemplazá el parámetro t por el texto de la llamada y ejecutá el cuerpo de la función.",
        "count() no cuenta superposiciones; split() sin argumentos separa por cualquier cantidad de espacios.",
        "`in` y `==` distinguen mayúsculas de minúsculas. Lo que se muestra es lo que devuelve el return.",
      ],
      explanation: "La función recibe el texto en t, lo procesa y devuelve un valor con return; print muestra ese valor. Fijate en el TIPO de lo que se devuelve: puede ser un número, un texto o un booleano.",
    });
  },
};

export const pcMetodosStr: Generator = {
  id: "pc-metodos-str",
  topicId: "t-pc-metodos-str",
  description: "upper, title, capitalize, replace: los strings no se modifican",
  generate(seed, d) {
    const r = rng(seed);
    const s = r.pick(NOMBRES.filter((x) => x.includes(" "))) + " " + r.pick(["perez", "gomez", "diaz"]);
    const mixed = s.split(" ").map((w, i) => (i === 1 ? w.toUpperCase() : w)).join(" ");
    const a = r.pick([...new Set(s.replace(/ /g, ""))]);
    const forms: { code: string; wrongs: Wrong[] }[] = [
      {
        code: `s = ${q(s)}\ns.upper()\nprint(s)`,
        wrongs: [
          { code: `print(${q(s)}.upper())`, type: "programacion", message: "Los strings son inmutables: `s.upper()` crea un texto NUEVO que acá se pierde porque no se guarda. s no cambia." },
          { code: `print(${q(s)}.title())`, type: "programacion", message: "upper() pondría todo en mayúsculas; pero igual s no se modifica porque el resultado no se asignó." },
        ],
      },
      {
        code: `s = ${q(mixed)}\nprint(s.title())\nprint(s.capitalize())`,
        wrongs: [
          { code: `print(${q(mixed)}.capitalize())\nprint(${q(mixed)}.title())`, type: "programacion", message: "title() pone en mayúscula la primera letra de CADA palabra; capitalize() solo la del principio (y el resto en minúscula)." },
          { code: `print(${q(mixed)}.title())\nprint(${q(mixed[0].toUpperCase() + mixed.slice(1))})`, type: "programacion", message: "capitalize() además pasa a minúscula todo lo demás." },
        ],
      },
      {
        code: `s = ${q(s)}\nt = s.replace(${q(a)}, "*").upper()\nprint(t)\nprint(s)`,
        wrongs: [
          { code: `t = ${q(s)}.replace(${q(a)}, "*").upper()\nprint(t)\nprint(t)`, type: "programacion", message: "replace() y upper() devuelven textos nuevos: s sigue igual." },
          { code: `t = ${q(s)}.replace(${q(a)}, "*", 1).upper()\nprint(t)\nprint(${q(s)})`, type: "programacion", message: "replace() reemplaza TODAS las apariciones (salvo que se le pase una cantidad)." },
        ],
      },
      {
        code: `s = ${q(mixed)}\ns = s.lower().replace(${q(a)}, ${q(a.toUpperCase())})\nprint(s.count(${q(a)}), s)`,
        wrongs: [
          { code: `s = ${q(mixed)}.lower()\nprint(s.count(${q(a)}), s.replace(${q(a)}, ${q(a.toUpperCase())}))`, type: "programacion", message: "Después del replace ya no quedan letras minúsculas iguales a la buscada: count() distingue mayúsculas." },
          { code: `s = ${q(mixed)}.replace(${q(a)}, ${q(a.toUpperCase())})\nprint(s.count(${q(a)}), s)`, type: "programacion", message: "Primero se aplica lower() y DESPUÉS replace(): los métodos encadenados se ejecutan de izquierda a derecha." },
        ],
      },
    ];
    const f = forms[d <= 2 ? r.int(0, 1) : d <= 4 ? r.int(1, 2) : r.int(2, 3)];
    return outputChoice({
      gen: this.id, r, seed, d, topicId: this.topicId, code: f.code, wrongs: f.wrongs,
      hints: [
        "Los métodos de str NO modifican el texto: devuelven uno nuevo. Solo cambia la variable si se reasigna (s = s.upper()).",
        "title(): mayúscula al inicio de cada palabra. capitalize(): solo la primera letra del texto, el resto en minúscula.",
        "Métodos encadenados (s.lower().replace(…)) se aplican de izquierda a derecha.",
      ],
      explanation: "Los strings son inmutables. `s.upper()` sola no cambia nada: hay que guardar el resultado. Y title/capitalize/upper/lower generan textos distintos que conviene distinguir bien.",
    });
  },
};

// ───────────────────────── Slot 06: abstracción ─────────────────────────

export const pcAbstraccion: Generator = {
  id: "pc-abstraccion",
  topicId: "t-pc-funciones",
  description: "¿Qué hace este programa? (describir el algoritmo)",
  generate(seed, d) {
    const r = rng(seed);
    type Desc = { text: string; f: (xs: number[]) => number | string };
    const countIf = (p: (x: number) => boolean) => (xs: number[]) => xs.filter(p).length;
    const sumIf = (p: (x: number) => boolean) => (xs: number[]) => xs.filter(p).reduce((a, b) => a + b, 0);
    const odd = (x: number) => x % 2 === 1, even = (x: number) => x % 2 === 0, two = (x: number) => x >= 10 && x <= 99, big = (x: number) => x >= 10;
    const forms: { code: string; ok: Desc; others: Desc[]; small?: boolean }[] = [
      { code: "c = 0\nfor n in datos:\n    c += n % 2\nprint(c)", ok: { text: "Cuenta cuántos números impares hay", f: countIf(odd) }, others: [{ text: "Suma los números impares", f: sumIf(odd) }, { text: "Cuenta cuántos números pares hay", f: countIf(even) }, { text: "Suma los restos de dividir por 2 de los pares", f: () => 0 }] },
      { code: "c = 0\nfor n in datos:\n    c += n % 2 * n\nprint(c)", ok: { text: "Suma los números impares", f: sumIf(odd) }, others: [{ text: "Cuenta cuántos números impares hay", f: countIf(odd) }, { text: "Suma los números pares", f: sumIf(even) }, { text: "Suma todos los números", f: sumIf(() => true) }] },
      { code: "c = 0\nfor n in datos:\n    if n // 10 > 0 and n // 100 == 0:\n        c += 1\nprint(c)", ok: { text: "Cuenta cuántos números tienen exactamente dos cifras", f: countIf(two) }, others: [{ text: "Cuenta cuántos números tienen dos cifras o más", f: countIf(big) }, { text: "Cuenta cuántos números son múltiplos de 10", f: countIf((x) => x % 10 === 0) }, { text: "Suma los números de dos cifras", f: sumIf(two) }] },
      { code: "r = []\nfor x in datos:\n    r.append(4 - x)\nprint(r)", small: true, ok: { text: "Reemplaza cada número x por 4 − x", f: (xs) => JSON.stringify(xs.map((x) => 4 - x)) }, others: [{ text: "Le resta 4 a cada número", f: (xs) => JSON.stringify(xs.map((x) => x - 4)) }, { text: "Invierte el orden de la lista", f: (xs) => JSON.stringify([...xs].reverse()) }, { text: "Deja la lista como estaba", f: (xs) => JSON.stringify(xs) }] },
      { code: "m = datos[0]\nfor x in datos:\n    if x < m:\n        m = x\nprint(m)", ok: { text: "Muestra el menor número de la lista", f: (xs) => Math.min(...xs) }, others: [{ text: "Muestra el mayor número de la lista", f: (xs) => Math.max(...xs) }, { text: "Muestra el primer número de la lista", f: (xs) => xs[0] }, { text: "Muestra el último número de la lista", f: (xs) => xs[xs.length - 1] }] },
    ];
    const f = forms[d <= 2 ? r.int(0, 1) : d <= 4 ? r.int(0, 3) : r.int(1, 4)];
    // datos con los que TODAS las descripciones dan resultados distintos (así el ejemplo distingue)
    let datos: number[] = [];
    for (let tries = 0; tries < 200; tries++) {
      datos = Array.from({ length: r.int(4, 6) }, () => (f.small ? r.int(0, 4) : r.int(1, 3) === 1 ? r.int(100, 300) : r.int(1, 60)));
      const vals = [f.ok, ...f.others].map((x) => String(x.f(datos)));
      if (new Set(vals).size === vals.length) break;
    }
    const code = `datos = ${pyList(datos)}\n${f.code}`;
    const res = exec(code);
    const expected = f.small ? `[${datos.map((x) => 4 - x).join(", ")}]` : String(f.ok.f(datos));
    if (res.output[0] !== expected) throw new Error(`pc-abstraccion: descripción no verificada (${res.output[0]} vs ${expected})`);
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `¿Qué hace este programa para **cualquier** lista \`datos\` de enteros positivos? (Con estos datos muestra \`${res.output[0]}\`.)\n\n${block(code)}`,
        hints: [
          "Probá el programa con una lista chiquita inventada por vos, por ejemplo [3, 4].",
          "`n % 2` vale 1 si n es impar y 0 si es par. Entonces `n % 2 * n` vale n si es impar y 0 si es par.",
          "Comprobá cada descripción con los datos del ejemplo: solo una da el valor que se muestra.",
        ],
        solution: [...traceSolution(res).slice(0, 8), `Con estos datos: ${f.ok.text.toLowerCase()} → ${res.output[0]}.`],
        explanation: "Para abstraer, mirá qué se acumula en cada vuelta y en qué casos. Probar con datos chiquitos y comparar con cada descripción es la forma más segura de decidir.",
      }),
      [{ text: f.ok.text, correct: true }, ...f.others.map((o) => ({ text: o.text, error: { type: "algoritmico" as ErrorType, message: `Con estos datos, «${o.text.toLowerCase()}» daría ${String(o.f(datos)).replace(/,/g, ", ")}, pero el programa muestra ${res.output[0]}.` } }))],
    );
  },
};

// ───────────────────────── Slot 07: listas ─────────────────────────

export const pcListas: Generator = {
  id: "pc-listas",
  topicId: "t-pc-listas",
  description: "append, insert(0, x), reverse(), pop(), slicing de listas",
  generate(seed, d) {
    const r = rng(seed);
    const a = distinctInts(r, r.int(4, 6), 1, 20);
    const A = pyList(a);
    const forms: { code: string; wrongs: Wrong[] }[] = [
      {
        code: `a = ${A}\nb = []\nfor x in a:\n    b.insert(0, x)\nprint(b)`,
        wrongs: [
          { code: `print(${A})`, type: "programacion", message: "insert(0, x) mete cada elemento ADELANTE: el último que entra queda primero, así que la lista queda invertida." },
          { code: `print(${pyList(a.slice(1))})`, type: "programacion", message: "No se pierde ningún elemento: se insertan todos." },
        ],
      },
      {
        code: `a = ${A}\nr = a.reverse()\nprint(r)\nprint(a)`,
        wrongs: [
          { code: `print(${pyList([...a].reverse())})\nprint(${A})`, type: "programacion", message: "reverse() da vuelta la lista ORIGINAL (en el lugar) y devuelve None." },
          { code: `print(${pyList([...a].reverse())})\nprint(${pyList([...a].reverse())})`, type: "programacion", message: "reverse() no devuelve la lista: devuelve None. Por eso r vale None." },
          { code: `print(None)\nprint(${A})`, type: "programacion", message: "Aunque devuelva None, reverse() SÍ modifica a." },
        ],
      },
      {
        code: `a = ${A}\nx = a.pop()\ny = a.pop(0)\nprint(x, y, a)`,
        wrongs: [
          { code: `print(${a[0]}, ${a[a.length - 1]}, ${pyList(a.slice(1, -1))})`, type: "programacion", message: "pop() sin argumento saca el ÚLTIMO; pop(0) saca el primero." },
          { code: `print(${a[a.length - 1]}, ${a[0]}, ${A})`, type: "programacion", message: "pop() además de devolver el elemento lo SACA de la lista." },
        ],
      },
      {
        code: `a = ${A}\nb = []\nfor i in range(0, len(a), 2):\n    b.append(a[len(a) - (1 + i)])\nprint(b)`,
        wrongs: [
          { code: `a = ${A}\nb = []\nfor i in range(0, len(a), 2):\n    b.append(a[i])\nprint(b)`, type: "algoritmico", message: "El índice es len(a) − (1 + i): recorre desde el final hacia el principio." },
          { code: `a = ${A}\nb = []\nfor i in range(len(a)):\n    b.append(a[len(a) - (1 + i)])\nprint(b)`, type: "algoritmico", message: "range(0, len(a), 2) avanza de a 2: solo toma la mitad de las posiciones." },
        ],
      },
      {
        code: `a = ${A}\nb = a[:3] + a[-2:]\nprint(b, len(b))`,
        wrongs: [
          { code: `print(${pyList(a.slice(0, 4))} + ${pyList(a.slice(-2))}, ${a.slice(0, 4).length + 2})`, type: "algoritmico", message: "a[:3] son los índices 0, 1 y 2 (el 3 no se incluye)." },
          { code: `print(${a.slice(0, 3).reduce((x, y) => x + y, 0) + a.slice(-2).reduce((x, y) => x + y, 0)}, 5)`, type: "programacion", message: "`+` entre listas las une (concatena); no suma los números." },
        ],
      },
      {
        code: `a = ${A}\nb = a\nb.append(${a.length * 10})\nc = a[::-1]\nc.pop()\nprint(a)\nprint(c)`,
        wrongs: [
          { code: `print(${A})\nprint(${pyList([a.length * 10, ...[...a].reverse()].slice(0, -1))})`, type: "programacion", message: "`b = a` NO copia: b y a son la MISMA lista, así que append la modifica para los dos." },
          { code: `print(${pyList([...a, a.length * 10])})\nprint(${pyList([a.length * 10, ...[...a].reverse()])})`, type: "programacion", message: "`a[::-1]` sí es una copia nueva; pop() le saca el último a c (no a a)." },
        ],
      },
    ];
    const f = forms[d <= 1 ? r.pick([0, 2]) : d <= 3 ? r.int(0, 4) : r.int(1, 5)];
    return outputChoice({
      gen: this.id, r, seed, d, topicId: this.topicId, code: f.code, wrongs: f.wrongs,
      hints: [
        "Dibujá la lista con sus índices y actualizala después de cada línea.",
        "append agrega al final; insert(0, x) agrega al principio; pop() saca el último y lo devuelve; reverse() la invierte en el lugar y devuelve None.",
        "Un slice (a[:3], a[::-1]) crea una lista NUEVA; `b = a` no copia, solo pone otro nombre a la misma lista.",
      ],
      explanation: "Las listas SÍ se modifican (son mutables). Los métodos append/insert/pop/reverse/sort cambian la lista original; los slices crean listas nuevas.",
    });
  },
};

// ───────────────────────── Slot 09: listas de tuplas, índices anidados ─────────────────────────

export const pcTuplas: Generator = {
  id: "pc-tuplas",
  topicId: "t-pc-tuplas",
  description: "Listas de tuplas, índices anidados y sort",
  generate(seed, d) {
    const r = rng(seed);
    const names = r.shuffle(NOMBRES).slice(0, r.int(3, 4));
    const ages = distinctInts(r, names.length, 16, 25);
    const datos = `[${names.map((n, i) => `(${q(n)}, ${ages[i]})`).join(", ")}]`;
    const k = r.int(1, 2);
    const forms: { code: string; wrongs: Wrong[] }[] = [
      {
        code: `datos = ${datos}\nfor i in range(len(datos)):\n    print(datos[i][0][${k}])`,
        wrongs: [
          { code: `datos = ${datos}\nfor i in range(len(datos)):\n    print(datos[i][0][${k - 1}])`, type: "programacion", message: `[${k}] es la letra en la posición ${k} contando desde 0.` },
          { code: `datos = ${datos}\nfor i in range(len(datos)):\n    print(datos[i][0][${k}], end="")`, type: "programacion", message: "Cada print termina con salto de línea: una letra por línea." },
        ],
      },
      {
        code: `datos = ${datos}\nr = []\nfor n, e in datos:\n    if e >= 18:\n        r.append((n.title(), e))\nprint(r)`,
        wrongs: [
          { code: `datos = ${datos}\nr = []\nfor n, e in datos:\n    if e >= 18:\n        r.append(n.title())\n        r.append(e)\nprint(r)`, type: "programacion", message: "Se agrega UNA tupla (nombre, edad) por persona: la lista queda de tuplas, no plana." },
          { code: `datos = ${datos}\nr = []\nfor n, e in datos:\n    if e >= 18:\n        r.append((n.capitalize(), e))\nprint(r)`, type: "programacion", message: "title() pone mayúscula en CADA palabra (\"Juan Cruz\"); capitalize() solo en la primera." },
          { code: `datos = ${datos}\nr = []\nfor n, e in datos:\n    r.append((n.title(), e))\nprint(r)`, type: "logica", message: "El if filtra: solo entran los de edad ≥ 18." },
        ],
      },
      {
        code: `nombres = ${pyList(names)}\nedades = ${pyList(ages)}\nnombres.sort()\nfor i in range(${d >= 5 ? 2 : 0}, len(nombres)):\n    print(nombres[i], edades[i])`,
        wrongs: [
          { code: `datos = sorted(${datos})\nfor i in range(${d >= 5 ? 2 : 0}, len(datos)):\n    print(datos[i][0], datos[i][1])`, type: "logica", message: "sort() ordena SOLO la lista de nombres: las edades quedan en su orden original, así que se rompe la correspondencia." },
          { code: `nombres = ${pyList(names)}\nedades = ${pyList(ages)}\nfor i in range(${d >= 5 ? 2 : 0}, len(nombres)):\n    print(nombres[i], edades[i])`, type: "programacion", message: "sort() sí modifica la lista nombres (la ordena alfabéticamente)." },
        ],
      },
      {
        code: `datos = ${datos.replace(/\(/g, "[").replace(/\)/g, "]")}\ndatos.sort()\nprint(datos[0])\nprint(datos[-1][0].upper()[:3])`,
        wrongs: [
          { code: `datos = ${datos}\ndatos.sort()\nprint(datos[0])\nprint(datos[-1][0].upper()[:3])`, type: "programacion", message: "Los datos son listas (corchetes), no tuplas: se muestran con [ ]." },
          { code: `datos = ${datos.replace(/\(/g, "[").replace(/\)/g, "]")}\nprint(datos[0])\nprint(datos[-1][0].upper()[:3])`, type: "programacion", message: "sort() ordena por el primer elemento (el nombre) alfabéticamente." },
        ],
      },
    ];
    const f = forms[d <= 1 ? 0 : d <= 3 ? r.int(0, 2) : r.int(1, 3)];
    f.wrongs.push(
      { code: f.code.replace(/print\((.*)\)$/m, "print($1, end=\" \")"), type: "programacion", message: "Cada print termina con un salto de línea: no queda todo en una línea." },
      { code: f.code.replace(/\]\n/, "][::-1]\n"), type: "algoritmico", message: "La lista se recorre desde el índice 0, en el orden en que está escrita." },
    );
    return outputChoice({
      gen: this.id, r, seed, d, topicId: this.topicId, code: f.code, wrongs: f.wrongs,
      hints: [
        "datos[i] es la tupla i; datos[i][0] es su primer elemento (el nombre); datos[i][0][k] es la letra k del nombre.",
        "`for n, e in datos:` desarma cada tupla en dos variables.",
        "Ordenar una lista no reordena otra lista \"paralela\": la correspondencia por posición se rompe.",
      ],
      explanation: "Los índices anidados se leen de izquierda a derecha: primero el elemento de la lista, después el elemento de la tupla, después la letra. Y ojo: ( ) es tupla, [ ] es lista, y así se muestran.",
    });
  },
};

// ───────────────────────── Slot 08 y 11: diccionarios ─────────────────────────

export const pcDictReplace: Generator = {
  id: "pc-dict-replace",
  topicId: "t-pc-dicts",
  description: "Recorrer un diccionario aplicando replace encadenado",
  generate(seed, d) {
    const r = rng(seed);
    let code: string, sim: string, rev: string, plain: string;
    const extra: Wrong[] = [];
    const fin = d >= 3 ? r.pick([".upper()", ".lower()"]) : "";
    if (d <= 4) {
      const vocales = r.shuffle(["a", "e", "i", "o", "u"]);
      const k1 = vocales[0], v1 = vocales[1], v2 = vocales[2];
      const pares: [string, string][] = d <= 1 ? [[k1, v1]] : [[k1, v1], [v1, v2]];
      const texto = r.pick(["banana fiel", "el pino de oro", "una tarde de sol", "mi auto es rojo", "la isla azul"]) + (d >= 3 ? r.pick([" Ana", " Eva", " Ema"]) : "");
      const dict = `{${pares.map(([a, b]) => `${q(a)}: ${q(b)}`).join(", ")}}`;
      const head = `reemp = ${dict}\nt = ${q(texto)}\n`;
      code = `${head}for k in reemp:\n    t = t.replace(k, reemp[k])\nprint(t${fin})`;
      sim = `${head}r = ""\nfor c in t:\n    if c in reemp:\n        r += reemp[c]\n    else:\n        r += c\nprint(r${fin})`;
      rev = `${head}for k in list(reemp.keys())[::-1]:\n    t = t.replace(k, reemp[k])\nprint(t${fin})`;
      plain = `${head}for k in reemp:\n    t = t.replace(k, reemp[k])\nprint(t)`;
      extra.push({ code: `${head}print(t${fin})`, type: "programacion", message: "replace() devuelve un texto nuevo, pero acá se reasigna en t: el texto SÍ cambia." });
      extra.push({ code: `${head}t = t.replace(${q(pares[0][0])}, ${q(pares[0][1])})\nprint(t${fin === ".upper()" ? ".lower()" : ".upper()"})`, type: "programacion", message: "Revisá el método del final y aplicá TODOS los reemplazos del diccionario." });
    } else {
      const animals = r.shuffle(["perro", "gato", "raton", "loro"]);
      const [a1, a2, a3] = animals;
      const texto = `el ${a1} mira al ${a2.charAt(0).toUpperCase() + a2.slice(1)} y al ${a2}`;
      const head = `reemp = {${q(a1)}: ${q(a2)}, ${q(a2)}: ${q(a3)}}\nt = ${q(texto)}\n`;
      code = `${head}for k, v in reemp.items():\n    t = t.replace(k, v)\nprint(t${fin})`;
      sim = `${head}r = []\nfor w in t.split():\n    r.append(reemp.get(w, w))\nprint(" ".join(r)${fin})`;
      rev = `${head}for k in list(reemp.keys())[::-1]:\n    t = t.replace(k, reemp[k])\nprint(t${fin})`;
      plain = `${head}for k, v in reemp.items():\n    t = t.replace(k.lower(), v)\n    t = t.replace(k.title(), v)\nprint(t${fin})`;
      extra.push({ code: `${head}print(t${fin})`, type: "programacion", message: "Cada replace se guarda en t: el texto sí cambia." });
    }
    return outputChoice({
      gen: this.id, r, seed, d, topicId: this.topicId, code,
      wrongs: [
        { code: sim, type: "algoritmico", message: "Los reemplazos se hacen UNO DESPUÉS DEL OTRO sobre el texto ya modificado: lo que cambió el primero puede volver a cambiar con el segundo." },
        { code: rev, type: "algoritmico", message: "Un diccionario se recorre en el ORDEN EN QUE SE CARGARON las claves." },
        { code: plain, type: "programacion", message: d >= 5 ? "replace() busca coincidencias EXACTAS: una palabra con mayúscula no coincide con la clave en minúscula." : "Falta aplicar el método final del print (upper/lower)." },
        ...extra,
      ],
      hints: [
        "Recorré el diccionario en el orden en que está escrito y aplicá cada replace al texto que va quedando.",
        "replace() reemplaza todas las apariciones, pero solo las que coinciden exactamente (mayúsculas, tildes).",
        "Después de todos los reemplazos, mirá si el print aplica upper() o lower().",
      ],
      explanation: "Recorrer un dict da sus claves en orden de inserción. Como cada replace trabaja sobre el resultado del anterior, los reemplazos se encadenan: si 'a'→'e' y después 'e'→'i', una 'a' original termina siendo 'i'.",
    });
  },
};

export const pcDosDicts: Generator = {
  id: "pc-dos-dicts",
  topicId: "t-pc-dicts",
  description: "Dos diccionarios combinados (código → nombre, código → notas)",
  generate(seed, d) {
    const r = rng(seed);
    const n = r.int(3, 4);
    const codes = distinctInts(r, n, 100, 299);
    const names = r.shuffle(NOMBRES).slice(0, n).map((x) => (r.bool() ? x.toUpperCase() : x));
    const notas = codes.map(() => distinctInts(r, r.int(1, 4), 2, 10));
    const order = r.shuffle(codes.map((_, i) => i));
    const nomD = `{${codes.map((c, i) => `${c}: ${q(names[i])}`).join(", ")}}`;
    const notD = `{${order.map((i) => `${codes[i]}: ${pyList(notas[i])}`).join(", ")}}`;
    const nameExpr = d <= 3 ? "nombres[cod].capitalize()[:4]" : r.pick(["nombres[cod].capitalize()[:4]", "nombres[cod][:2].upper()"]);
    const rev = d >= 4;
    const body = (loop: string, nm: string, sl: string, filtro = true, rv = rev) =>
      `nombres = ${nomD}\nnotas = ${notD}\nprint("Alumno", "Notas")\nfor cod in ${loop}:\n    lista = notas[cod]\n${rv ? "    lista.reverse()\n" : ""}${filtro ? "    if len(lista) > 1:\n    " : ""}    print(${nm}, ${sl})`;
    const sl = d <= 2 ? "lista[0]" : "lista[:2]";
    const code = body("notas", nameExpr, sl);
    return outputChoice({
      gen: this.id, r, seed, d, topicId: this.topicId, code,
      wrongs: [
        { code: body("nombres", nameExpr, sl), type: "algoritmico", message: "El for recorre `notas`: el orden es el de inserción de ESE diccionario, no el de nombres." },
        { code: body("notas", nameExpr, sl, false), type: "logica", message: "El if deja pasar solo a quienes tienen más de una nota." },
        { code: body("notas", "nombres[cod]", sl), type: "programacion", message: `Se muestra \`${nameExpr.replace("nombres[cod]", "nombre")}\`, no el nombre completo.` },
        { code: body("notas", nameExpr, sl === "lista[0]" ? "lista[:1]" : "lista[1]", true), type: "programacion", message: "Un slice de una lista devuelve una LISTA (con corchetes); un índice devuelve un elemento." },
        ...(rev ? [{ code: body("notas", nameExpr, sl, true, false), type: "programacion" as ErrorType, message: "reverse() da vuelta la lista de notas antes de mostrarla." }] : []),
      ],
      hints: [
        "El for recorre las claves (códigos) del diccionario `notas`, en el orden en que fueron cargadas.",
        "Con cada código se busca el nombre en el otro diccionario: nombres[cod].",
        "capitalize() deja solo la primera letra en mayúscula; [:4] toma 4 caracteres; lista[:2] es una lista.",
      ],
      explanation: "Al combinar dos diccionarios por su clave, el orden de la salida lo decide el diccionario que se recorre. Después, cada transformación (capitalize, slicing, reverse) se aplica en el orden en que está escrita.",
    });
  },
};

// ───────────────────────── Slot 10: dibujos con ciclos anidados ─────────────────────────

export const pcDibujo: Generator = {
  id: "pc-dibujo",
  topicId: "t-pc-dibujos",
  description: "¿Qué dibuja? Ciclos anidados con print(c, end='')",
  generate(seed, d) {
    const r = rng(seed);
    const n = r.int(3, d >= 4 ? 5 : 4);
    const c = r.pick(["*", "#", "o", "+"]);
    const draw = (inner: string, rows = `range(${n})`, nl = true) =>
      `n = ${n}\nfor i in ${rows}:\n${inner}${nl ? "\n    print()" : ""}`;
    const cell = (cond: string) => `    for j in range(n):\n        if ${cond}:\n            print(${q(c)}, end="")\n        else:\n            print(".", end="")`;
    const tri = (rg: string) => `    for j in ${rg}:\n        print(${q(c)}, end="")`;
    const forms: { code: string; wrongs: Wrong[] }[] = [
      { code: draw(tri("range(i + 1)")), wrongs: [{ code: draw(tri("range(n - i)")), type: "algoritmico", message: "En la primera fila i vale 0, así que range(i + 1) dibuja UN carácter: el triángulo crece hacia abajo." }, { code: draw(tri("range(i)")), type: "algoritmico", message: "range(i + 1) tiene i + 1 vueltas: la primera fila ya tiene un carácter." }, { code: draw(tri("range(i + 1)"), `range(${n})`, false), type: "programacion", message: "El `print()` después del ciclo de adentro hace el salto de línea: sin él todo quedaría en una sola línea." }] },
      { code: draw(tri("range(n - i)")), wrongs: [{ code: draw(tri("range(i + 1)")), type: "algoritmico", message: "En la primera fila i = 0, así que range(n − i) dibuja n caracteres: el triángulo se achica." }, { code: draw(tri("range(n - i)"), `range(${n})`, false), type: "programacion", message: "El `print()` vacío termina cada fila." }] },
      { code: draw(cell("i == 0 or j == 0")), wrongs: [{ code: draw(cell("i == 0 and j == 0")), type: "logica", message: "Con `or` alcanza con estar en la primera fila O en la primera columna." }, { code: draw(cell("i == n - 1 or j == n - 1")), type: "algoritmico", message: "i == 0 es la PRIMERA fila (arriba) y j == 0 la primera columna (izquierda)." }, { code: draw(cell("i == 0 or j == 0"), `range(${n})`, false), type: "programacion", message: "Sin el print() final de cada fila, todo saldría en una línea." }] },
      { code: draw(cell("i == j or i + j == n - 1")), wrongs: [{ code: draw(cell("i == j")), type: "logica", message: "La condición tiene dos partes unidas con `or`: también se dibuja la otra diagonal (i + j == n − 1)." }, { code: draw(cell("i != j and i + j != n - 1")), type: "logica", message: "Se dibuja el carácter cuando la condición es VERDADERA; los puntos van en el else." }] },
      { code: `n = ${n}\nfor i in range(n):\n    print(${q(c)} * (i + 1))\n    if i % 2 == 0:\n        print()`, wrongs: [{ code: `n = ${n}\nfor i in range(n):\n    print(${q(c)} * (i + 1))`, type: "programacion", message: "El `print()` dentro del if agrega una línea en blanco después de las filas pares (i = 0, 2, …)." }, { code: `n = ${n}\nfor i in range(n):\n    print(${q(c)} * (i + 1))\n    if i % 2 == 1:\n        print()`, type: "algoritmico", message: "i empieza en 0, que es par: la primera línea en blanco aparece después de la primera fila." }] },
      { code: draw(`    for j in range(n - i - 1):\n        print(".", end="")\n    for j in range(2 * i + 1):\n        print(${q(c)}, end="")`), wrongs: [{ code: draw(`    for j in range(2 * i + 1):\n        print(${q(c)}, end="")\n    for j in range(n - i - 1):\n        print(".", end="")`), type: "algoritmico", message: "Primero se dibujan los puntos y DESPUÉS los caracteres: la figura queda centrada." }, { code: draw(`    for j in range(n - i):\n        print(".", end="")\n    for j in range(2 * i):\n        print(${q(c)}, end="")`), type: "algoritmico", message: "Contá las vueltas: range(2·i + 1) da 1, 3, 5, … caracteres." }] },
    ];
    const f = forms[d <= 2 ? r.int(0, 1) : d <= 4 ? r.int(0, 4) : r.int(2, 5)];
    return outputChoice({
      gen: this.id, r, seed, d, topicId: this.topicId, code: f.code, wrongs: f.wrongs,
      question: "¿Qué dibuja este programa? (los puntos son caracteres que se imprimen)",
      hints: [
        "La variable i es la fila y j la columna; ambas empiezan en 0.",
        "`print(x, end=\"\")` escribe sin saltar de línea; el `print()` vacío termina la fila.",
        "Hacé la primera fila (i = 0) y la segunda (i = 1) a mano: con eso ya se ve la forma.",
      ],
      explanation: "En un dibujo con ciclos anidados, el ciclo de afuera recorre filas y el de adentro escribe cada carácter de la fila sin saltar de línea; el print() final corta la fila. Probá las primeras filas a mano.",
    });
  },
};

// ───────────────────────── print: sep y end ─────────────────────────

export const pcPrint: Generator = {
  id: "pc-print",
  topicId: "t-pc-print",
  description: "print con varios argumentos, sep= y end=",
  generate(seed, d) {
    const r = rng(seed);
    const w = r.shuffle(["sol", "mar", "pan", "luz", "red", "dia"]).slice(0, 3);
    const n = r.int(2, 4);
    const sep = r.pick(["-", ", ", "", "/"]);
    const end = r.pick(["!", " ", "...", ""]);
    const forms: { code: string; wrongs: Wrong[] }[] = [
      {
        code: `print(${q(w[0])}, ${q(w[1])}, ${n})\nprint(${q(w[2])})`,
        wrongs: [
          { code: `print(${q(w[0] + w[1] + n)})\nprint(${q(w[2])})`, type: "programacion", message: "Con varios argumentos, print los separa con UN espacio." },
          { code: `print(${q(w[0])}, ${q(w[1])}, ${n}, ${q(w[2])})`, type: "programacion", message: "Cada print termina con un salto de línea: son dos líneas." },
        ],
      },
      {
        code: `print(${q(w[0])}, ${q(w[1])}, sep=${q(sep)})\nprint(${q(w[2])}, end=${q(end)})\nprint(${n})`,
        wrongs: [
          { code: `print(${q(w[0])}, ${q(w[1])})\nprint(${q(w[2])}, end=${q(end)})\nprint(${n})`, type: "programacion", message: "`sep=` cambia lo que va ENTRE los argumentos (en vez del espacio)." },
          { code: `print(${q(w[0])}, ${q(w[1])}, sep=${q(sep)})\nprint(${q(w[2])})\nprint(${n})`, type: "programacion", message: "`end=` reemplaza el salto de línea: lo que sigue se escribe en la MISMA línea." },
          { code: `print(${q(w[0])}, ${q(w[1])}, sep=${q(sep)})\nprint(${q(w[2] + end)})\nprint(${n})`, type: "programacion", message: "Después de `end=` no hay salto de línea, así que el próximo print sigue en la misma línea." },
        ],
      },
      {
        code: `for i in range(${n}):\n    print(i, end=${q(sep || ",")})\nprint("fin")`,
        wrongs: [
          { code: `for i in range(${n}):\n    print(i)\nprint("fin")`, type: "programacion", message: "Con `end=` los números NO van en líneas separadas." },
          { code: `for i in range(${n}):\n    print(i, end=${q(sep || ",")})\nprint()\nprint("fin")`, type: "programacion", message: "\"fin\" se escribe pegado a lo anterior: no hay ningún salto de línea antes." },
          { code: `for i in range(1, ${n + 1}):\n    print(i, end=${q(sep || ",")})\nprint("fin")`, type: "algoritmico", message: `range(${n}) empieza en 0.` },
        ],
      },
      {
        code: `x = ${n}\nprint("x", "=", x, sep="")\nprint("x =", x * 2, end=${q(end)})\nprint("x" * x, sep="-")`,
        wrongs: [
          { code: `x = ${n}\nprint("x = ${n}")\nprint("x =", x * 2, end=${q(end)})\nprint("x" * x, sep="-")`, type: "programacion", message: "`sep=\"\"` pega los argumentos sin espacios." },
          { code: `x = ${n}\nprint("x", "=", x, sep="")\nprint("x =", x * 2, end=${q(end)})\nprint("-".join("x" * x))`, type: "programacion", message: "sep solo actúa ENTRE argumentos: con un único argumento no agrega nada." },
        ],
      },
    ];
    const f = forms[d <= 1 ? 0 : d <= 3 ? r.int(1, 2) : r.int(2, 3)];
    return outputChoice({
      gen: this.id, r, seed, d, topicId: this.topicId, code: f.code, wrongs: f.wrongs,
      hints: [
        "print separa sus argumentos con un espacio y termina con un salto de línea.",
        "`sep=` reemplaza el espacio entre argumentos; `end=` reemplaza el salto de línea final.",
        "Si un print termina con end distinto de \"\\n\", el siguiente print continúa en la misma línea.",
      ],
      explanation: "print(a, b, sep=S, end=E) escribe a, después S, después b y al final E. Por defecto S es un espacio y E es un salto de línea.",
    });
  },
};

// ───────────────────────── Traza a mano ─────────────────────────

export const pcTraza: Generator = {
  id: "pc-traza",
  topicId: "t-pc-traza",
  description: "Traza a mano con tabla de variables (funciones, strings, listas)",
  generate(seed, d) {
    const r = rng(seed);
    const A = r.int(2, 9), B = r.int(2, 9), k = r.int(2, 3);
    const w = r.pick(PALABRAS);
    const xs = distinctInts(r, r.int(5, 7), 1, 30);
    const forms: { code: string; ask: string[]; expl: string }[] = [
      { code: `def f(a, b):\n    return a * ${k} - b\n\nx = ${A}\ny = ${B}\nx = f(y, x)\ny = f(x, y)`, ask: ["x", "y"], expl: "En f(y, x) el PRIMER argumento (y) se guarda en el parámetro a y el segundo (x) en b: importa el orden, no el nombre." },
      { code: `s = ""\nfor c in ${q(w)}:\n    if c not in "aeiou":\n        s = s + c\nn = len(s)`, ask: ["s", "n"], expl: "s acumula las consonantes en el mismo orden en que aparecen." },
      { code: `s = ""\nfor c in ${q(w)}:\n    s = c + s\nultima = s[0]`, ask: ["s", "ultima"], expl: "`s = c + s` pone cada letra ADELANTE: el texto queda invertido." },
      { code: `a = ${pyList(xs)}\nwhile len(a) > ${k}:\n    a.pop(0)\nn = len(a)\nprimero = a[0]`, ask: ["n", "primero"], expl: `El while saca el primer elemento hasta que quedan ${k}.` },
      { code: `a = ${pyList(xs)}\nm = 0\npos = 0\nfor i in range(len(a)):\n    if a[i] > m:\n        m = a[i]\n        pos = i`, ask: ["m", "pos"], expl: "m guarda el mayor visto hasta el momento y pos su índice (desde 0)." },
    ];
    const f = forms[d <= 2 ? r.int(1, 2) : d <= 4 ? r.int(0, 3) : r.pick([0, 3, 4])];
    return traceEx({
      gen: this.id, seed, d, topicId: this.topicId, code: f.code, ask: f.ask,
      intro: "Hacé la traza (tabla de variables) y escribí los valores finales. Para textos, escribí el texto sin comillas.",
      hints: [
        "Una columna por variable; una fila cada vez que alguna cambia.",
        "En una llamada a función, los valores se copian a los parámetros en orden.",
        f.expl,
      ],
      explanation: f.expl,
    });
  },
};

export const PC_GENERATORS: Generator[] = [
  pcBooleanos,
  pcRange,
  pcTipoError,
  pcTiposSalida,
  pcDivMod,
  pcIfAnidado,
  pcCicloLineas,
  pcCicloTraza,
  pcSlicing,
  pcIndexSlicing,
  pcFuncStr,
  pcMetodosStr,
  pcAbstraccion,
  pcListas,
  pcTuplas,
  pcDictReplace,
  pcDosDicts,
  pcDibujo,
  pcPrint,
  pcTraza,
];
