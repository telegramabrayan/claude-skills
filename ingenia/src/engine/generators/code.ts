import type { Generator, TraceExercise } from "../types";
import { run } from "../code/interpreter";
import { rng } from "./rng";
import { base, choice } from "./helpers";

const S = "pensamiento-computacional";

/** Ejecuta el programa generado para conocer la respuesta exacta: el generador nunca "adivina". */
function traceExercise(args: {
  gen: string; seed: number; difficulty: TraceExercise["difficulty"]; topicId: string;
  code: string; ask: string[]; intro: string; hints: [string, string, string]; explanation: string;
  frequentErrors?: TraceExercise["frequentErrors"];
}): TraceExercise {
  const res = run(args.code);
  if (!res.ok) throw new Error(`Programa generado inválido (${args.gen}): ${res.error?.message}`);
  const answer: Record<string, number | string | boolean> = {};
  for (const name of args.ask) {
    const v = res.globals[name];
    answer[name] = typeof v === "number" || typeof v === "string" || typeof v === "boolean" ? v : String(v);
  }
  const lines = res.steps.map((s) => `Línea ${s.line}: ${Object.entries(s.vars).map(([k, v]) => `${k} = ${v}`).join(", ")}`);
  return {
    ...base({
      gen: args.gen, seed: args.seed, difficulty: args.difficulty, subjectId: S, topicId: args.topicId,
      prompt: args.intro,
      hints: args.hints,
      solution: lines.length > 12 ? [...lines.slice(0, 10), "…", lines[lines.length - 1]] : lines,
      explanation: args.explanation,
      frequentErrors: args.frequentErrors,
    }),
    kind: "trace",
    code: args.code,
    ask: args.ask,
    answer,
  };
}

export const trazaAsignacion: Generator = {
  id: "traza-asignacion",
  topicId: "t-variables-codigo",
  description: "Seguir asignaciones de variables",
  generate(seed, d) {
    const r = rng(seed);
    const a = r.int(1, 9), b = r.int(1, 9), k = r.int(2, 4);
    const forms = [
      `a = ${a}\nb = ${b}\na = a + b\nb = a * ${k}`,
      `a = ${a}\nb = ${b}\na = b\nb = a`,
      `a = ${a}\nb = ${b}\naux = a\na = b\nb = aux`,
      `x = ${a}\nx = x + ${b}\nx = x * ${k}\ny = x - ${a}`,
      `a = ${a}\nb = ${b}\na = a + b\nb = a - b\na = a - b`,
    ];
    const idx = d <= 1 ? r.pick([0, 3]) : d <= 3 ? r.pick([0, 1, 2, 3]) : r.pick([1, 2, 4]);
    const code = forms[idx];
    const ask = idx === 3 ? ["x", "y"] : ["a", "b"];
    const swapTrap = idx === 1;
    return traceExercise({
      gen: this.id, seed, difficulty: d, topicId: this.topicId, code, ask,
      intro: "¿Qué valores tienen las variables al terminar el programa?",
      hints: [
        "El programa se ejecuta de arriba hacia abajo, una línea por vez.",
        "En `a = expresión`, primero se calcula la derecha con los valores ACTUALES y después se guarda en a (el valor viejo se pierde).",
        "Hacé una tabla con una columna por variable y actualizala línea por línea.",
      ],
      explanation: swapTrap
        ? "Después de `a = b`, el valor original de a se perdió. Por eso para intercambiar dos variables hace falta una variable auxiliar."
        : "Una asignación reemplaza el valor anterior de la variable por el nuevo.",
      frequentErrors: swapTrap ? [{ match: b, type: "logica", message: "Parece que intercambiaste los valores, pero `a = b` borra el valor viejo de a. Cuando se ejecuta `b = a`, a ya vale lo mismo que b." }] : [],
    });
  },
};

export const trazaCondicional: Generator = {
  id: "traza-if",
  topicId: "t-condicionales",
  description: "Seguir condicionales if/elif/else",
  generate(seed, d) {
    const r = rng(seed);
    const n = r.int(-5, 20);
    const lim = r.int(5, 12);
    const code =
      d <= 2
        ? `nota = ${n}\nif nota >= ${lim}:\n    resultado = "aprobado"\nelse:\n    resultado = "desaprobado"`
        : `x = ${n}\nif x < 0:\n    signo = -1\nelif x == 0:\n    signo = 0\nelse:\n    signo = 1\nif x % 2 == 0:\n    par = True\nelse:\n    par = False`;
    return traceExercise({
      gen: this.id, seed, difficulty: d, topicId: this.topicId, code,
      ask: d <= 2 ? ["resultado"] : ["signo", "par"],
      intro: "¿Qué valor queda en las variables? (para textos escribí la palabra; para booleanos, True o False)",
      hints: [
        "Evaluá la condición del if con los valores concretos.",
        "Si la condición es verdadera se ejecuta ese bloque y se saltean los elif/else; si es falsa, se prueba la siguiente.",
        d <= 2 ? `¿Es ${n} >= ${lim}?` : `x vale ${n}. ¿Es negativo, cero o positivo? Y ${n} % 2 es el resto de dividir por 2.`,
      ],
      explanation: "Un if elige UN solo camino: el primero cuya condición sea verdadera (o el else si ninguna lo es).",
    });
  },
};

export const trazaFor: Generator = {
  id: "traza-for",
  topicId: "t-bucles",
  description: "Bucles for con range y acumuladores",
  generate(seed, d) {
    const r = rng(seed);
    const a = r.int(0, 3), b = a + r.int(3, 6);
    const forms = [
      { code: `suma = 0\nfor i in range(${b}):\n    suma = suma + i`, wrong: (b * (b + 1)) / 2, start: 0 },
      { code: `suma = 0\nfor i in range(${a}, ${b}):\n    suma += i`, wrong: ((b + a) * (b - a + 1)) / 2, start: a },
      { code: `producto = 1\nfor i in range(1, ${Math.min(b, 6)}):\n    producto = producto * i`, wrong: NaN, start: 1 },
      { code: `cuenta = 0\nfor i in range(${b * 2}):\n    if i % 3 == 0:\n        cuenta += 1`, wrong: NaN, start: 0 },
    ];
    const f = forms[d <= 2 ? r.int(0, 1) : r.int(0, 3)];
    const ask = [f.code.split(" =")[0]];
    return traceExercise({
      gen: this.id, seed, difficulty: d, topicId: this.topicId, code: f.code, ask,
      intro: `¿Cuánto vale \`${ask[0]}\` al terminar el bucle?`,
      hints: [
        "range(n) genera 0, 1, 2, …, n−1: el último número NO se incluye.",
        "range(a, b) genera a, a+1, …, b−1.",
        "Escribí en una tabla el valor de i y de la variable acumuladora en cada vuelta.",
      ],
      explanation: "Un acumulador empieza en un valor neutro (0 para sumar, 1 para multiplicar) y se actualiza en cada vuelta del bucle.",
      frequentErrors: Number.isFinite(f.wrong)
        ? [{ match: f.wrong, type: "algoritmico", message: "Incluiste el último número del range. range(…, b) termina en b − 1: es el clásico error \"off-by-one\" (pasarse por uno)." }]
        : [],
    });
  },
};

export const trazaWhile: Generator = {
  id: "traza-while",
  topicId: "t-bucles",
  description: "Bucles while",
  generate(seed, d) {
    const r = rng(seed);
    const n = r.pick([16, 20, 37, 50, 64, 100]);
    const k = r.int(2, 3);
    const code =
      d <= 3
        ? `n = ${n}\npasos = 0\nwhile n > 1:\n    n = n // ${k}\n    pasos += 1`
        : `n = ${r.int(10, 30)}\npasos = 0\nwhile n != 1:\n    if n % 2 == 0:\n        n = n // 2\n    else:\n        n = 3 * n + 1\n    pasos += 1`;
    return traceExercise({
      gen: this.id, seed, difficulty: d, topicId: this.topicId, code, ask: ["pasos"],
      intro: "¿Cuántas vueltas da el bucle? (valor final de `pasos`)",
      hints: [
        "El while repite mientras la condición sea verdadera; se chequea ANTES de cada vuelta.",
        "`//` es división entera: 7 // 2 = 3 (se descarta el resto).",
        "Anotá el valor de n después de cada vuelta hasta que la condición sea falsa.",
      ],
      explanation: "Un while necesita que algo cambie dentro del bucle para que la condición en algún momento sea falsa; si no, el bucle es infinito.",
    });
  },
};

export const logicaBooleana: Generator = {
  id: "logica-booleana",
  topicId: "t-condicionales",
  description: "Evaluar expresiones lógicas con and, or, not",
  generate(seed, d) {
    const r = rng(seed);
    const x = r.int(0, 10), y = r.int(0, 10);
    const forms = [
      `x > 3 and y < 5`,
      `x > 3 or y < 5`,
      `not (x == y)`,
      `(x > 5 and y > 5) or x == ${x}`,
      `not (x > 2) or (y % 2 == 0 and x < 8)`,
    ];
    const expr = forms[Math.min(forms.length - 1, d - 1 + r.int(0, 1))];
    const res = run(`x = ${x}\ny = ${y}\nr = ${expr}`);
    const value = res.globals.r === true;
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Con \`x = ${x}\` e \`y = ${y}\`, ¿qué da \`${expr}\`?`,
        hints: [
          "Evaluá cada comparación por separado y reemplazala por True o False.",
          "`and` es verdadero solo si AMBAS partes lo son; `or` es verdadero si AL MENOS UNA lo es.",
          "`not` invierte: not True = False. Los paréntesis se resuelven primero.",
        ],
        solution: [`x = ${x}, y = ${y}`, `${expr} → ${value ? "True" : "False"}`],
        explanation: "and: las dos verdaderas. or: alcanza con una. not: lo contrario.",
      }),
      [
        { text: "True", correct: value, error: value ? undefined : { type: "logica", message: "Revisá cada parte: con `and` alcanza que UNA sea falsa para que todo sea False." } },
        { text: "False", correct: !value, error: !value ? undefined : { type: "logica", message: "Con `or` alcanza que UNA parte sea verdadera para que todo sea True." } },
      ],
    );
  },
};

export const codeGenerators = [trazaAsignacion, trazaCondicional, trazaFor, trazaWhile, logicaBooleana];
