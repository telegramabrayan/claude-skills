import type { ExpressionExercise, Generator, StepsExercise } from "../types";
import { fmt } from "../math/parser";
import { rng } from "./rng";
import { base, byDifficulty, coef, par, sgn, termX } from "./helpers";

const S = "preparacion";

export const evaluarExpresion: Generator = {
  id: "evaluar-expresion",
  topicId: "t-expresiones",
  description: "Reemplazar una variable por un número",
  generate(seed, d) {
    const r = rng(seed);
    const a = r.nz(-4, 5);
    const b = r.nz(-6, 6);
    const c = r.nz(-9, 9);
    const x = d <= 2 ? r.int(1, 5) : r.nz(-4, 4);
    const quad = d >= 3;
    const expr = quad ? `${coef(a)}x^2 ${termX(b)} ${sgn(c)}` : `${coef(a)}x ${sgn(b)}`;
    const ans = quad ? a * x * x + b * x + c : a * x + b;
    const wrongSq = quad ? a * -(x * x) + b * x + c : NaN;
    const sub = quad ? `${a}·${par(x)}^2 ${sgn(b)}·${par(x)} ${sgn(c)}` : `${a}·${par(x)} ${sgn(b)}`;
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Calculá el valor de $${expr}$ cuando $x = ${fmt(x)}$`,
        hints: [
          "Reemplazá cada x por el número, SIEMPRE entre paréntesis.",
          `Queda: ${sub}`,
          quad ? `Primero la potencia: ${par(x)}² = ${x * x}. Después multiplicaciones y al final sumas.` : "Primero la multiplicación y después la suma.",
        ],
        solution: quad
          ? [`${sub}`, `= ${a}·${x * x} ${sgn(b * x)} ${sgn(c)}`, `= ${fmt(ans)}`]
          : [`${sub}`, `= ${fmt(a * x)} ${sgn(b)}`, `= ${fmt(ans)}`],
        explanation: "Una variable es un lugar vacío: se reemplaza por el número y se respeta el orden de las operaciones.",
        frequentErrors:
          quad && x < 0 && wrongSq !== ans
            ? [{ match: wrongSq, type: "signos", message: `El error está en el cuadrado: (${fmt(x)})² = ${x * x}, positivo. Si escribís ${fmt(x)}² sin paréntesis, parece −${x * x}.` }]
            : [],
      }),
      kind: "numeric",
      answer: ans,
    };
  },
};

/** Arma ecuaciones lineales con solución entera conocida y sus pasos esperados. */
export const ecuacionLineal: Generator = {
  id: "ecuacion-lineal",
  topicId: "t-ecuaciones",
  description: "Ecuaciones lineales resueltas paso a paso",
  generate(seed, d) {
    const r = rng(seed);
    const x = d <= 2 ? r.int(1, 9) : r.nz(-9, 9);
    let equation = "";
    let steps: string[] = [];
    let hints: [string, string, string];
    const frequent: StepsExercise["frequentErrors"] = [];
    const form = r.pick(byDifficulty(d, [[0], [1], [1, 2], [3], [4, 5], [5, 6]]));

    switch (form) {
      case 0: {
        const b = r.int(1, 12);
        const c = x + b;
        equation = `x + ${b} = ${c}`;
        steps = [`x = ${c} − ${b}`, `x = ${x}`];
        hints = [`¿Qué número sumado a ${b} da ${c}?`, `Para dejar la x sola hay que sacar el +${b}: restá ${b} en ambos lados.`, `x = ${c} − ${b}`];
        frequent.push({ match: c + b, type: "signos", message: `El +${b} pasa al otro lado restando, no sumando: x = ${c} − ${b}.` });
        break;
      }
      case 1:
      case 2: {
        const a = r.int(2, 6);
        const b = form === 1 ? r.int(1, 12) : -r.int(1, 12);
        const c = a * x + b;
        equation = `${a}x ${sgn(b)} = ${fmt(c)}`;
        steps = [`${a}x = ${fmt(c)} ${sgn(-b)}`, `${a}x = ${fmt(c - b)}`, `x = ${fmt(c - b)} / ${a}`, `x = ${fmt(x)}`];
        hints = [
          "Objetivo: dejar la x sola. Primero sacá el número que está sumando o restando.",
          `Para eliminar ${b > 0 ? "+" : "−"}${Math.abs(b)} hacé la operación opuesta en ambos lados: ${b > 0 ? "restá" : "sumá"} ${Math.abs(b)}.`,
          `Queda ${a}x = ${fmt(c - b)}. Como ${a}x es "${a} por x", ahora dividí ambos lados por ${a}.`,
        ];
        break;
      }
      case 3: {
        const a = r.int(3, 8);
        let cc = r.int(1, a - 1);
        if (cc === a) cc = a - 1;
        const b = r.nz(-10, 10);
        const dd = (a - cc) * x + b;
        equation = `${a}x ${sgn(b)} = ${coef(cc)}x ${sgn(dd)}`;
        steps = [`${a}x − ${coef(cc) || "1"}x ${sgn(b)} = ${fmt(dd)}`, `${a - cc}x ${sgn(b)} = ${fmt(dd)}`, `${a - cc}x = ${fmt(dd - b)}`, `x = ${fmt(x)}`];
        hints = [
          "Juntá todas las x de un lado y todos los números del otro.",
          `Restá ${coef(cc) || "1"}x en ambos lados para que las x queden solo a la izquierda.`,
          `Queda ${a - cc}x ${sgn(b)} = ${fmt(dd)}. Seguí como en una ecuación común.`,
        ];
        break;
      }
      case 4:
      case 5: {
        const a = r.int(2, 5);
        const b = r.nz(-6, 6);
        const c = a * (x + b);
        if (form === 4) {
          equation = `${a}(x ${sgn(b)}) = ${fmt(c)}`;
          steps = [`${a}x ${sgn(a * b)} = ${fmt(c)}`, `${a}x = ${fmt(c - a * b)}`, `x = ${fmt(x)}`];
          hints = [
            "Primero hay que sacar el paréntesis con la propiedad distributiva.",
            `El ${a} multiplica a TODO lo que está dentro: ${a}·x y también ${a}·${par(b)}.`,
            `Queda ${a}x ${sgn(a * b)} = ${fmt(c)}. (Otra forma: dividí primero ambos lados por ${a}.)`,
          ];
          // Error típico: distribuir solo al primer término.
          frequent.push({
            match: (c - b) / a,
            type: "despeje",
            message: `Al aplicar la distributiva, el ${a} multiplica a TODOS los términos del paréntesis: ${a}(x ${sgn(b)}) = ${a}x ${sgn(a * b)}, no ${a}x ${sgn(b)}.`,
          });
        } else {
          const k = r.int(1, a - 1);
          const rhsConst = c - k * x;
          equation = `${a}(x ${sgn(b)}) = ${coef(k)}x ${sgn(rhsConst)}`;
          steps = [`${a}x ${sgn(a * b)} = ${coef(k)}x ${sgn(rhsConst)}`, `${a - k}x ${sgn(a * b)} = ${fmt(rhsConst)}`, `${a - k}x = ${fmt(rhsConst - a * b)}`, `x = ${fmt(x)}`];
          hints = [
            "Primero distributiva, después juntá las x de un lado.",
            `${a}(x ${sgn(b)}) = ${a}x ${sgn(a * b)}.`,
            `Restá ${coef(k) || "1"}x en ambos lados y seguí despejando.`,
          ];
        }
        break;
      }
      default: {
        const a = r.int(2, 5);
        const b = r.nz(-5, 5);
        const xx = a * r.nz(-4, 4);
        const c = xx / a + b;
        equation = `x/${a} ${sgn(b)} = ${fmt(c)}`;
        steps = [`x/${a} = ${fmt(c - b)}`, `x = ${fmt(c - b)} · ${a}`, `x = ${fmt(xx)}`];
        hints = ["Primero sacá el término independiente.", `Queda x/${a} = ${fmt(c - b)}.`, `La x está dividida por ${a}: para despejarla, multiplicá ambos lados por ${a}.`];
        const ex: StepsExercise = {
          ...base({
            gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
            prompt: `Resolvé la ecuación paso a paso: $${equation}$`,
            hints,
            solution: steps,
            explanation: "Despejar es deshacer las operaciones que afectan a la x, en orden inverso, haciendo SIEMPRE lo mismo en ambos lados.",
            frequentErrors: [{ match: (c - b) / a, type: "despeje", message: `Dividiste por ${a}, pero la x ya estaba dividida por ${a}. Para deshacer una división se MULTIPLICA.` }],
          }),
          kind: "steps",
          equation,
          answer: xx,
          expectedSteps: steps,
        };
        return ex;
      }
    }
    const ex: StepsExercise = {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Resolvé la ecuación paso a paso: $${equation}$`,
        hints,
        solution: steps,
        explanation: "Una ecuación es una balanza en equilibrio: lo que hagas de un lado lo tenés que hacer del otro. Despejar es deshacer las operaciones que rodean a la x, en orden inverso.",
        frequentErrors: frequent,
      }),
      kind: "steps",
      equation,
      answer: x,
      expectedSteps: steps,
    };
    return ex;
  },
};

interface FormulaCase {
  formula: string;
  solveFor: string;
  answer: string;
  vars: string[];
  wrong: { expr: string; type: "despeje" | "signos"; message: string }[];
  context: string;
  steps: string[];
}

const DESPEJES: FormulaCase[] = [
  {
    formula: "d = v·t", solveFor: "t", answer: "d/v", vars: ["d", "v", "t"], context: "distancia = velocidad · tiempo",
    steps: ["d = v·t", "Dividimos ambos lados por v: d/v = t", "t = d/v"],
    wrong: [
      { expr: "d*v", type: "despeje", message: "La t está multiplicada por v; para deshacer una multiplicación se DIVIDE por v." },
      { expr: "v/d", type: "despeje", message: "Dividiste al revés. Si d = v·t, al dividir ambos lados por v queda d/v = t." },
    ],
  },
  {
    formula: "F = m·a", solveFor: "a", answer: "F/m", vars: ["F", "m", "a"], context: "segunda ley de Newton",
    steps: ["F = m·a", "Dividimos ambos lados por m", "a = F/m"],
    wrong: [{ expr: "F*m", type: "despeje", message: "La a está multiplicada por m: hay que dividir por m, no multiplicar." }, { expr: "m/F", type: "despeje", message: "Está invertido: a = F/m." }],
  },
  {
    formula: "v = v0 + a·t", solveFor: "a", answer: "(v - v0)/t", vars: ["v", "v0", "a", "t"], context: "velocidad en MRUV",
    steps: ["v = v0 + a·t", "Restamos v0 en ambos lados: v − v0 = a·t", "Dividimos por t: a = (v − v0)/t"],
    wrong: [
      { expr: "v - v0/t", type: "despeje", message: "Faltan paréntesis: hay que dividir TODA la resta (v − v0) por t, no solo v0." },
      { expr: "(v + v0)/t", type: "signos", message: "v0 está sumando, así que pasa restando: v − v0." },
    ],
  },
  {
    formula: "v = v0 + a·t", solveFor: "t", answer: "(v - v0)/a", vars: ["v", "v0", "a", "t"], context: "tiempo en MRUV",
    steps: ["v = v0 + a·t", "v − v0 = a·t", "t = (v − v0)/a"],
    wrong: [{ expr: "v - v0/a", type: "despeje", message: "Hay que dividir toda la resta (v − v0) por a: usá paréntesis." }, { expr: "(v + v0)/a", type: "signos", message: "v0 está sumando: pasa restando." }],
  },
  {
    formula: "A = b·h/2", solveFor: "h", answer: "2*A/b", vars: ["A", "b", "h"], context: "área de un triángulo",
    steps: ["A = b·h/2", "Multiplicamos por 2: 2A = b·h", "Dividimos por b: h = 2A/b"],
    wrong: [{ expr: "A/(2*b)", type: "despeje", message: "El 2 está dividiendo a b·h: para deshacerlo se multiplica por 2. Queda h = 2A/b." }, { expr: "A/b", type: "despeje", message: "Te olvidaste del 2. Primero multiplicá ambos lados por 2: 2A = b·h." }],
  },
  {
    formula: "x = x0 + v·t", solveFor: "v", answer: "(x - x0)/t", vars: ["x", "x0", "v", "t"], context: "posición en MRU",
    steps: ["x = x0 + v·t", "x − x0 = v·t", "v = (x − x0)/t"],
    wrong: [{ expr: "x - x0/t", type: "despeje", message: "Faltan paréntesis: (x − x0)/t." }, { expr: "(x + x0)/t", type: "signos", message: "x0 está sumando, pasa restando." }],
  },
  {
    formula: "E = m·g·h", solveFor: "h", answer: "E/(m*g)", vars: ["E", "m", "g", "h"], context: "energía potencial gravitatoria",
    steps: ["E = m·g·h", "Dividimos por m y por g", "h = E/(m·g)"],
    wrong: [{ expr: "E/m*g", type: "despeje", message: "Hay que dividir por el producto m·g completo: E/(m·g)." }, { expr: "E*m*g", type: "despeje", message: "h está multiplicada: hay que dividir." }],
  },
  {
    formula: "P = F/A", solveFor: "A", answer: "F/P", vars: ["P", "F", "A"], context: "presión",
    steps: ["P = F/A", "Multiplicamos por A: P·A = F", "Dividimos por P: A = F/P"],
    wrong: [{ expr: "P*F", type: "despeje", message: "A está en el denominador. Multiplicá ambos lados por A y después dividí por P." }, { expr: "P/F", type: "despeje", message: "Está invertido: A = F/P." }],
  },
];

export const despejeFormula: Generator = {
  id: "despeje-formula",
  topicId: "t-despeje",
  description: "Despejar una variable de una fórmula",
  generate(seed, d) {
    const r = rng(seed);
    const pool = d <= 2 ? DESPEJES.filter((c) => c.vars.length === 3 && !c.formula.includes("/")) : d <= 3 ? DESPEJES.slice(0, 6) : DESPEJES;
    const c = r.pick(pool);
    const ex: ExpressionExercise = {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `En la fórmula $${c.formula}$ (${c.context}), despejá **${c.solveFor}**. Escribí ${c.solveFor} = ...`,
        hints: [
          `Mirá qué operaciones "rodean" a ${c.solveFor} y deshacelas en orden inverso.`,
          "Lo que suma pasa restando, lo que multiplica pasa dividiendo (y al revés).",
          c.steps[1],
        ],
        solution: c.steps,
        explanation: "Despejar una fórmula es igual que resolver una ecuación: se hacen las mismas operaciones en ambos lados hasta dejar sola la variable.",
        frequentErrors: c.wrong.map((w) => ({ match: w.expr, type: w.type, message: w.message })),
      }),
      kind: "expression",
      answer: c.answer,
      variables: c.vars.filter((v) => v !== c.solveFor),
      sampleRange: [1, 9],
    };
    return ex;
  },
};

export const factorComun: Generator = {
  id: "factor-comun",
  topicId: "t-expresiones",
  description: "Distributiva y factor común",
  generate(seed, d) {
    const r = rng(seed);
    const a = r.int(2, 7);
    const b = r.nz(-9, 9);
    const expand = d <= 3 || r.bool();
    if (expand) {
      const ex: ExpressionExercise = {
        ...base({
          gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
          prompt: `Aplicá la propiedad distributiva y escribí sin paréntesis: $${a}(x ${sgn(b)})$`,
          hints: ["El número de afuera multiplica a cada término de adentro.", `${a} · x y también ${a} · ${par(b)}.`, `${a}·x = ${a}x y ${a}·${par(b)} = ${fmt(a * b)}.`],
          solution: [`${a}(x ${sgn(b)}) = ${a}·x + ${a}·${par(b)}`, `= ${a}x ${sgn(a * b)}`],
          explanation: "Propiedad distributiva: a(b + c) = a·b + a·c.",
          frequentErrors: [{ match: `${a}*x + ${b}`, type: "calculo", message: `El ${a} tiene que multiplicar también al ${fmt(b)}: ${a}·${par(b)} = ${fmt(a * b)}.` }],
        }),
        kind: "expression",
        answer: `${a}*x + ${a * b}`,
        variables: ["x"],
      };
      return ex;
    }
    const ex: ExpressionExercise = {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Sacá factor común: $${a}x ${sgn(a * b)}$  (escribilo como número·(...))`,
        hints: ["Buscá un número que divida a los dos términos.", `Los dos términos son múltiplos de ${a}.`, `${a}x ÷ ${a} = x y ${fmt(a * b)} ÷ ${a} = ${fmt(b)}.`],
        solution: [`${a}x ${sgn(a * b)} = ${a}·x + ${a}·${par(b)}`, `= ${a}(x ${sgn(b)})`],
        explanation: "Sacar factor común es la distributiva al revés.",
        frequentErrors: [],
      }),
      kind: "expression",
      answer: `${a}*(x + ${b})`,
      variables: ["x"],
    };
    return ex;
  },
};

export const algebraGenerators = [evaluarExpresion, factorComun, ecuacionLineal, despejeFormula];
