import type { Generator } from "../types";
import { fmt, fracText } from "../math/parser";
import { rng } from "./rng";
import { base, choice, coef, par, sgn, termX } from "./helpers";

const S = "am-a";

export const funcionEvaluar: Generator = {
  id: "funcion-evaluar",
  topicId: "t-funciones",
  description: "Evaluar una función en un punto",
  generate(seed, d) {
    const r = rng(seed);
    const quad = d >= 3;
    const a = r.nz(-3, 3), b = r.nz(-5, 5), c = r.nz(-6, 6);
    const k = d <= 2 ? r.int(0, 4) : r.nz(-3, 3);
    const f = quad ? `${coef(a)}x^2 ${termX(b)} ${sgn(c)}` : `${coef(a)}x ${sgn(b)}`;
    const fn = quad ? `${a}*x^2 + ${b}*x + ${c}` : `${a}*x + ${b}`;
    const val = quad ? a * k * k + b * k + c : a * k + b;
    const wrong = quad ? a * -(k * k) + b * k + c : NaN;
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Si $f(x) = ${f}$, ¿cuánto vale $f(${fmt(k)})$?`,
        hints: [
          `f(${fmt(k)}) significa: "reemplazá x por ${fmt(k)}".`,
          `Escribí la fórmula con ${par(k)} en cada lugar donde había una x.`,
          quad ? `${par(k)}² = ${k * k}. Ojo con los signos.` : `${a}·${par(k)} = ${a * k}.`,
        ],
        solution: quad
          ? [`f(${fmt(k)}) = ${a}·${par(k)}² ${sgn(b)}·${par(k)} ${sgn(c)}`, `= ${a * k * k} ${sgn(b * k)} ${sgn(c)}`, `= ${fmt(val)}`]
          : [`f(${fmt(k)}) = ${a}·${par(k)} ${sgn(b)}`, `= ${fmt(a * k)} ${sgn(b)} = ${fmt(val)}`],
        explanation: "Una función es una máquina: entra un número x, sale f(x). Evaluar es reemplazar x por el número.",
        frequentErrors: quad && k < 0 && wrong !== val ? [{ match: wrong, type: "signos", message: `(${fmt(k)})² = ${k * k} es positivo.` }] : [],
        visual: { type: "plot", functions: [fn], points: [[k, val]] },
      }),
      kind: "numeric",
      answer: val,
    };
  },
};

export const pendiente: Generator = {
  id: "pendiente",
  topicId: "t-recta",
  description: "Pendiente de la recta que pasa por dos puntos",
  generate(seed, d) {
    const r = rng(seed);
    const x1 = r.int(-4, 3);
    const dx = r.int(1, 4);
    const x2 = x1 + dx;
    const m = d <= 2 ? r.int(1, 3) : r.nz(-3, 3);
    const dy = d >= 4 ? m * dx + r.pick([1, -1]) : m * dx;
    const y1 = r.int(-3, 4);
    const y2 = y1 + dy;
    const slope = dy / dx;
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `¿Cuál es la pendiente de la recta que pasa por $(${fmt(x1)}, ${fmt(y1)})$ y $(${fmt(x2)}, ${fmt(y2)})$?`,
        hints: [
          "La pendiente mide cuánto sube (o baja) la recta por cada paso hacia la derecha.",
          "m = (y₂ − y₁) / (x₂ − x₁): cambio en y dividido cambio en x.",
          `Cambio en y: ${fmt(y2)} − ${par(y1)} = ${fmt(dy)}. Cambio en x: ${fmt(x2)} − ${par(x1)} = ${fmt(dx)}.`,
        ],
        solution: [`m = (${fmt(y2)} − ${par(y1)}) / (${fmt(x2)} − ${par(x1)})`, `m = ${fmt(dy)} / ${fmt(dx)}`, `m = ${fracText(dy, dx)}`],
        explanation: "La pendiente es Δy/Δx. Si es positiva la recta sube, si es negativa baja.",
        frequentErrors: [
          { match: dx / dy, type: "conceptual", message: "Lo dividiste al revés. La pendiente es el cambio en y (vertical) sobre el cambio en x (horizontal): Δy/Δx." },
          { match: (y2 + y1) / (x2 + x1 || 0.5), type: "calculo", message: "Sumaste las coordenadas. La pendiente usa DIFERENCIAS: y₂ − y₁ y x₂ − x₁." },
        ].filter((e) => Number.isFinite(e.match) && Math.abs((e.match as number) - slope) > 1e-9),
        visual: { type: "plot", functions: [`${slope}*(x - ${x1}) + ${y1}`], points: [[x1, y1], [x2, y2]] },
      }),
      kind: "numeric",
      answer: slope,
    };
  },
};

export const rectaElementos: Generator = {
  id: "recta-elementos",
  topicId: "t-recta",
  description: "Pendiente, ordenada al origen y raíz de una función lineal",
  generate(seed, d) {
    const r = rng(seed);
    const m = r.nz(-4, 4);
    const b = r.nz(-6, 6);
    const ask = d <= 2 ? r.pick(["pendiente", "ordenada"] as const) : r.pick(["pendiente", "ordenada", "raiz"] as const);
    const reordered = d >= 3 && r.bool();
    const formula = reordered ? `y = ${fmt(b)} ${termX(m)}` : `y = ${coef(m)}x ${sgn(b)}`;
    const visual = { type: "plot" as const, functions: [`${m}*x + ${b}`] };
    if (ask === "raiz") {
      const root = -b / m;
      return {
        ...base({
          gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
          prompt: `¿En qué valor de x la recta $${formula}$ corta al eje x (su raíz)?`,
          hints: ["Sobre el eje x, la altura y vale 0.", `Planteá 0 = ${coef(m)}x ${sgn(b)}.`, `Despejá: ${coef(m)}x = ${fmt(-b)}.`],
          solution: [`0 = ${coef(m)}x ${sgn(b)}`, `${coef(m)}x = ${fmt(-b)}`, `x = ${fracText(-b, m)}`],
          explanation: "La raíz (o cero) es el x donde f(x) = 0: el punto donde la recta toca el eje horizontal.",
          frequentErrors: [{ match: b / m, type: "signos", message: `Al pasar ${fmt(b)} al otro lado cambia de signo: ${coef(m)}x = ${fmt(-b)}.` }],
          visual,
        }),
        kind: "numeric",
        answer: root,
      };
    }
    const isSlope = ask === "pendiente";
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `En la función $${formula}$, ¿cuál es ${isSlope ? "la **pendiente**" : "la **ordenada al origen**"}?`,
        hints: isSlope
          ? ["La pendiente es el número que multiplica a x.", "No importa en qué orden estén escritos los términos.", `Buscá el término con x: ${termX(m)}.`]
          : ["La ordenada al origen es dónde la recta corta al eje y, o sea el valor de y cuando x = 0.", "Reemplazá x = 0.", "Es el término que no tiene x."],
        solution: isSlope ? [`El número que acompaña a x es ${fmt(m)}.`] : [`Con x = 0: y = ${fmt(b)}.`],
        explanation: "En y = m·x + b, m es la pendiente (inclinación) y b la ordenada al origen (corte con el eje y).",
        visual,
      }),
      [
        { text: fmt(isSlope ? m : b), correct: true },
        { text: fmt(isSlope ? b : m), error: { type: "conceptual", message: isSlope ? "Ese es el término independiente (ordenada al origen). La pendiente es el número que multiplica a x." : "Esa es la pendiente (multiplica a x). La ordenada al origen es el valor de y cuando x = 0." } },
        { text: fmt(isSlope ? -m : -b), error: { type: "signos", message: "El número es ese pero con el signo que tiene en la fórmula." } },
        { text: fmt(isSlope ? m + b : b - m) },
      ],
    );
  },
};

export const dominio: Generator = {
  id: "dominio",
  topicId: "t-dominio",
  description: "Dominio de funciones con divisiones y raíces",
  generate(seed, d) {
    const r = rng(seed);
    const a = r.nz(-5, 5);
    const kind = d <= 3 ? "division" : r.pick(["division", "raiz"] as const);
    if (kind === "division") {
      return choice(
        r,
        base({
          gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
          prompt: `¿Cuál es el dominio de $f(x) = 1/(x ${sgn(-a)})$?`,
          hints: ["El dominio son todos los x que se pueden reemplazar sin que la cuenta \"explote\".", "No se puede dividir por cero.", `¿Para qué x vale cero el denominador x ${sgn(-a)}?`],
          solution: [`x ${sgn(-a)} = 0  →  x = ${fmt(a)}`, `Dominio: todos los reales salvo ${fmt(a)}: ℝ − {${fmt(a)}}`],
          explanation: "En una división, el denominador no puede valer 0. Se excluyen los x que lo anulan.",
          visual: { type: "plot", functions: [`1/(x - ${a})`], yRange: [-6, 6] },
        }),
        [
          { text: `ℝ − {${fmt(a)}}`, correct: true },
          { text: `ℝ − {${fmt(-a)}}`, error: { type: "signos", message: `El denominador se anula cuando x ${sgn(-a)} = 0, es decir x = ${fmt(a)}.` } },
          { text: "ℝ", error: { type: "conceptual", message: "Hay un valor de x que hace cero el denominador; ese hay que excluirlo." } },
          { text: `x > ${fmt(a)}`, error: { type: "conceptual", message: "Solo hay que excluir el punto donde se divide por cero, no toda una mitad." } },
        ],
      );
    }
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `¿Cuál es el dominio de $f(x) = √(x ${sgn(-a)})$?`,
        hints: ["En los números reales no existe la raíz cuadrada de un número negativo.", `Lo de adentro tiene que ser ≥ 0: x ${sgn(-a)} ≥ 0.`, `Despejá: x ≥ ${fmt(a)}.`],
        solution: [`x ${sgn(-a)} ≥ 0`, `x ≥ ${fmt(a)}`, `Dominio: [${fmt(a)}, +∞)`],
        explanation: "Para raíces de índice par, el radicando debe ser mayor o igual que 0.",
        visual: { type: "plot", functions: [`sqrt(x - ${a})`] },
      }),
      [
        { text: `[${fmt(a)}, +∞)`, correct: true },
        { text: `(${fmt(a)}, +∞)`, error: { type: "conceptual", message: `La raíz de 0 sí existe (√0 = 0), así que x = ${fmt(a)} está incluido: intervalo cerrado [.` } },
        { text: `[${fmt(-a)}, +∞)`, error: { type: "signos", message: `x ${sgn(-a)} ≥ 0 da x ≥ ${fmt(a)}.` } },
        { text: "ℝ", error: { type: "conceptual", message: "No existe la raíz cuadrada real de un negativo; hay que excluir esos x." } },
      ],
    );
  },
};

export const functionGenerators = [funcionEvaluar, pendiente, rectaElementos, dominio];
