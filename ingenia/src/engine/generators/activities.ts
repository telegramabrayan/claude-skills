/**
 * Motor de actividades: el mismo concepto en formatos distintos para que la
 * práctica no sea siempre "enunciado + casillero". Cada generador elige el
 * formato que mejor muestra el concepto:
 *   procedimiento → ordenar pasos / encontrar el error / completar el operador
 *   fórmula       → construir con bloques
 *   definiciones  → unir con líneas
 *   gráfica       → tocar o mover el punto
 *   aplicación    → situación con contexto (incluida la de Ingeniería Industrial)
 */
import type { BuildExercise, ChoiceExercise, FillExercise, FindErrorExercise, Generator, GraphExercise, MatchExercise, NumericExercise, OrderExercise } from "../types";
import { fmt } from "../math/parser";
import { solveLinearSteps } from "../evaluation/steps";
import { rng } from "./rng";
import { base, choice, sgn } from "./helpers";

const PREP = "preparacion";

// ───────────── Procedimientos: ecuación lineal ─────────────

function linear(seed: number, d: number) {
  const r = rng(seed);
  const x = d <= 2 ? r.int(2, 9) : r.nz(-9, 12);
  const a = d <= 1 ? r.int(2, 5) : r.int(2, 9);
  const b = r.nz(d <= 2 ? 1 : -15, 15);
  return { r, x, a, b, c: a * x + b };
}

/** Completar con el operador que falta al pasar un término de miembro. */
export const actFillOperador: Generator = {
  id: "act-fill-operador",
  topicId: "t-ecuaciones",
  description: "Arrastrar la operación correcta al pasar términos",
  generate(seed, d) {
    const { r, x, a, b, c } = linear(seed, d);
    const second = d >= 3 && r.bool();
    const template = second ? `${a}x = ${fmt(c - b)}  →  x = ${fmt(c - b)} □ ${a}` : `${a}x ${sgn(b)} = ${fmt(c)}  →  ${a}x = ${fmt(c)} □ ${Math.abs(b)}`;
    const ans = second ? "÷" : b > 0 ? "−" : "+";
    const wrongSame = second ? "×" : b > 0 ? "+" : "−";
    const ex: FillExercise = {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: PREP, topicId: this.topicId,
        prompt: "Arrastrá la operación que falta en el hueco para despejar bien.",
        hints: [second ? "La x está multiplicada. ¿Qué operación deshace una multiplicación?" : `El ${Math.abs(b)} está ${b > 0 ? "sumando" : "restando"} del lado de la x.`, "Para mover un término al otro lado se hace la operación opuesta en los dos miembros.", "Opuestas: suma ↔ resta, multiplicación ↔ división."],
        solution: solveLinearSteps(`${a}x ${b < 0 ? "-" : "+"} ${Math.abs(b)} = ${c}`).map((s) => (s.note ? `${s.expr}   (${s.note})` : s.expr)),
        explanation: "Pasar un término «al otro lado» es hacer la operación opuesta en ambos miembros: lo que suma pasa restando, lo que multiplica pasa dividiendo.",
        frequentErrors: [{ match: wrongSame, type: "despeje", message: `Pasó con la misma operación. Si ${second ? "multiplica" : b > 0 ? "suma" : "resta"} de un lado, pasa ${second ? "dividiendo" : b > 0 ? "restando" : "sumando"} al otro.` }],
      }),
      kind: "fill",
      template,
      tokens: ["+", "−", "×", "÷"],
      answer: [ans],
    };
    void x;
    return ex;
  },
};

/** Ordenar los renglones de una resolución (arrastrando). */
export const actOrdenarResolucion: Generator = {
  id: "act-ordenar-resolucion",
  topicId: "t-ecuaciones",
  description: "Ordenar el procedimiento arrastrando",
  generate(seed, d) {
    const { a, b, c } = linear(seed, d);
    const eq = `${a}x ${b < 0 ? "-" : "+"} ${Math.abs(b)} = ${c}`;
    const steps = solveLinearSteps(eq);
    const items = steps.map((s) => s.expr);
    const ex: OrderExercise = {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: PREP, topicId: this.topicId,
        prompt: `Ordená la resolución de $${items[0]}$: arrastrá los renglones (o usá ▲ ▼) del primero al último.`,
        hints: ["El primero es la ecuación tal como está.", "Antes de dividir, hay que dejar sola la parte con x.", "El último renglón tiene la x sola."],
        solution: steps.map((s) => (s.note ? `${s.expr}   (${s.note})` : s.expr)),
        explanation: "Se despeja en orden inverso a como se armó la expresión: primero sumas y restas, después lo que multiplica.",
      }),
      kind: "order",
      items: [...items].reverse(),
      answer: items,
    };
    return ex;
  },
};

/** Encontrar el renglón equivocado (error de signo o de división). */
export const actEncontrarError: Generator = {
  id: "act-encontrar-error",
  topicId: "t-ecuaciones",
  description: "Encontrar el paso equivocado de una resolución",
  generate(seed, d) {
    const { r, a, b, c } = linear(seed, d);
    const good = solveLinearSteps(`${a}x ${b < 0 ? "-" : "+"} ${Math.abs(b)} = ${c}`).map((s) => s.expr);
    // Renglón 1: pasar el término con el signo equivocado; renglón 2: arrastrar el error.
    const kind = d <= 2 ? 0 : r.int(0, 1);
    const steps = [...good];
    let wrong = 1;
    let fix = good[1];
    if (kind === 0 && good.length >= 4) {
      const bad = c + b; // pasó con el mismo signo
      steps[1] = `${a}x = ${fmt(c)} ${b > 0 ? "+" : "−"} ${Math.abs(b)}`;
      steps[2] = `${a}x = ${fmt(bad)}`;
      steps[3] = `x = ${fmt(Math.round((bad / a) * 100) / 100)}`;
      steps.length = 4;
      wrong = 1;
      fix = good[1];
    } else {
      wrong = good.length - 1;
      const val = (c - b) * a;
      steps[wrong] = `x = ${fmt(val)}`;
      fix = good[wrong];
    }
    const ex: FindErrorExercise = {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: PREP, topicId: this.topicId,
        prompt: "Un compañero resolvió esta ecuación y llegó a un resultado incorrecto. **Tocá el renglón donde se equivocó.**",
        hints: ["Compará cada renglón con el anterior: ¿qué operación se hizo?", "Revisá los signos al pasar términos y qué se hace con lo que multiplica a la x.", "Lo que suma pasa restando; lo que multiplica pasa dividiendo."],
        solution: good,
        explanation: kind === 0 ? "Al pasar un término de miembro cambia la operación: si suma, pasa restando (y al revés)." : "Lo que multiplica a la x pasa dividiendo, no multiplicando.",
      }),
      kind: "find-error",
      steps,
      wrong,
      fix,
    };
    return ex;
  },
};

/** La puerta: la ecuación es la cerradura. Opción múltiple con escena. */
export const actPuerta: Generator = {
  id: "act-puerta",
  topicId: "t-ecuaciones",
  description: "Abrir la puerta con el valor de x",
  generate(seed, d) {
    const { r, x, a, b, c } = linear(seed, Math.min(d, 3));
    const ex: ChoiceExercise = {
      ...choice(
        r,
        {
          ...base({
            gen: this.id, seed, difficulty: d, subjectId: PREP, topicId: this.topicId,
            prompt: `$${a}x ${sgn(b)} = ${fmt(c)}$\n\n¿Qué valor de **x** abre la puerta?`,
            hints: [`Primero dejá sola la parte con x: pasá el ${Math.abs(b)}.`, `Te queda $${a}x = ${fmt(c - b)}$.`, "Dividí por el número que multiplica a la x."],
            solution: solveLinearSteps(`${a}x ${b < 0 ? "-" : "+"} ${Math.abs(b)} = ${c}`).map((s) => s.expr),
            explanation: "Despejar es deshacer las operaciones en orden inverso.",
          }),
          scene: "door",
          context: "La cerradura se abre con la solución de la ecuación.",
        },
        [
          { text: fmt(x), correct: true },
          { text: fmt((c + b) / a, 2), error: { type: "signos" as const, message: `Pasaste el ${Math.abs(b)} con el mismo signo: tenía que pasar ${b > 0 ? "restando" : "sumando"}.` } },
          { text: fmt(c - b), error: { type: "despeje" as const, message: `Te faltó dividir por ${a}: $${a}x = ${fmt(c - b)}$ todavía no es x.` } },
          { text: fmt((c - b) * a), error: { type: "despeje" as const, message: `El ${a} multiplica a la x: pasa dividiendo, no multiplicando.` } },
          { text: fmt(x + 1), error: { type: "calculo" as const, message: "Revisá la última cuenta." } },
        ].filter((o, k) => k === 0 || Number.isInteger(Number(o.text.replace(",", ".").replace("−", "-"))) || k === 1).slice(0, 4),
      ),
    };
    return ex;
  },
};

// ───────────── Fórmulas: construir con bloques ─────────────

const FORMULAS: { topic: string; subject: string; lead: string; answer: string[]; extra: string[]; name: string; why: string; alt?: string[][] }[] = [
  { topic: "t-mru", subject: "fisica", lead: "velocidad =", answer: ["distancia", "÷", "tiempo"], extra: ["×", "velocidad", "+"], name: "la velocidad media", why: "La velocidad dice cuánta distancia se recorre por cada unidad de tiempo: distancia dividida tiempo (m/s)." },
  { topic: "t-mruv", subject: "fisica", lead: "a =", answer: ["Δv", "÷", "Δt"], extra: ["×", "Δx", "v₀"], name: "la aceleración media", why: "La aceleración mide cuánto cambia la velocidad por segundo: Δv / Δt (m/s²)." },
  { topic: "t-newton", subject: "fisica", lead: "F =", answer: ["m", "×", "a"], extra: ["÷", "v", "+"], alt: [["a", "×", "m"]], name: "la segunda ley de Newton", why: "La fuerza neta es masa por aceleración: el doble de masa necesita el doble de fuerza para acelerar igual." },
  { topic: "t-presion", subject: "fisica", lead: "p =", answer: ["F", "÷", "S"], extra: ["×", "m", "δ"], name: "la presión", why: "La presión es fuerza repartida en una superficie: F / S (Pa = N/m²)." },
  { topic: "t-energia", subject: "fisica", lead: "Ec =", answer: ["½", "×", "m", "×", "v²"], extra: ["v", "g", "÷"], alt: [["½", "×", "v²", "×", "m"], ["m", "×", "v²", "×", "½"]], name: "la energía cinética", why: "La energía cinética crece con el cuadrado de la velocidad: Ec = ½ m v²." },
  { topic: "t-qui-concentracion", subject: "quimica", lead: "M =", answer: ["n", "÷", "V"], extra: ["×", "m", "M_m"], name: "la molaridad", why: "La molaridad es moles de soluto por litro de solución: n / V (mol/L)." },
  { topic: "t-qui-mol", subject: "quimica", lead: "n =", answer: ["m", "÷", "M"], extra: ["×", "V", "N_A"], name: "la cantidad de moles", why: "Moles = masa / masa molar: cuántos «paquetes» de M gramos entran en la muestra." },
];

function buildFormula(gen: string, idx: number, seed: number, d: Parameters<Generator["generate"]>[1]): BuildExercise {
  const r = rng(seed);
  const f = FORMULAS[idx];
  const tokens = r.shuffle([...f.answer, ...f.extra.slice(0, d <= 2 ? 1 : 3)]);
  return {
    ...base({
      gen, seed, difficulty: d, subjectId: f.subject, topicId: f.topic,
      prompt: `Construí la fórmula de **${f.name}** tocando los bloques en orden.`,
      hints: ["Pensá en las unidades: ¿qué se divide por qué?", "Sobran bloques: no hay que usarlos todos.", f.why],
      solution: [`${f.lead} ${f.answer.join(" ")}`],
      explanation: f.why,
    }),
    kind: "build",
    tokens,
    answer: f.answer,
    alternatives: f.alt,
    lead: f.lead,
  };
}

/** Un generador de "construir la fórmula" por tema. */
function formulaFor(topic: string): Generator {
  const idx = FORMULAS.findIndex((f) => f.topic === topic);
  const id = `act-formula-${topic.replace(/^t-/, "")}`;
  return { id, topicId: topic, description: "Construir la fórmula con bloques", generate: (seed, d) => buildFormula(id, idx, seed, d) };
}

// ───────────── Definiciones: unir con líneas ─────────────

const UNITS: [string, string][] = [
  ["Velocidad", "m/s"],
  ["Fuerza", "N"],
  ["Presión", "Pa"],
  ["Energía", "J"],
  ["Potencia", "W"],
  ["Aceleración", "m/s²"],
  ["Densidad", "kg/m³"],
  ["Masa", "kg"],
];

export const actUnidadesMatch: Generator = {
  id: "act-unidades-match",
  topicId: "t-unidades",
  description: "Unir cada magnitud con su unidad",
  generate(seed, d) {
    const r = rng(seed);
    const pairs = r.shuffle(UNITS).slice(0, d <= 2 ? 3 : d <= 4 ? 4 : 5);
    const ex: MatchExercise = {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: "fisica", topicId: this.topicId,
        prompt: "Uní cada magnitud con su unidad del Sistema Internacional.",
        hints: ["Pensá en la fórmula de cada magnitud.", "N = kg·m/s², Pa = N/m², J = N·m, W = J/s.", "Las unidades salen de las fórmulas: v = d/t → m/s."],
        solution: pairs.map(([a, b]) => `${a} → ${b}`),
        explanation: "Cada unidad se deduce de la fórmula de la magnitud. Por ejemplo, presión = fuerza/superficie → N/m² = Pa.",
      }),
      kind: "match",
      pairs,
    };
    return ex;
  },
};

// ───────────── Gráficas: tocar y mover ─────────────

export const actGraficoVertice: Generator = {
  id: "act-grafico-vertice",
  topicId: "t-cuadratica",
  description: "Tocar el máximo o el mínimo de una parábola",
  generate(seed, d) {
    const r = rng(seed);
    const h = r.int(-3, 3);
    const k = r.int(-2, 4);
    const a = r.pick(d <= 2 ? [-1, 1] : [-2, -1, 1, 2, 0.5, -0.5]);
    const expr = `${a}*(x-(${h}))^2+(${k})`;
    const isMax = a < 0;
    const b2 = -2 * a * h;
    const c2 = a * h * h + k;
    const shown = `${fmt(a)}x^2 ${sgn(b2)}x ${sgn(c2)}`.replace("1x^2", "x^2").replace("+ 0x ", "").replace(" + 0", "");
    const ex: GraphExercise = {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: PREP, topicId: this.topicId,
        prompt: `Tocá en el gráfico el punto donde $f(x) = ${shown}$ alcanza su **${isMax ? "máximo" : "mínimo"}**.`,
        hints: [`La parábola ${isMax ? "abre hacia abajo: tiene un punto más alto" : "abre hacia arriba: tiene un punto más bajo"}.`, "Ese punto es el vértice.", `El vértice está en $x_v = −b/(2a)$.`],
        solution: [`a = ${fmt(a)}, b = ${fmt(b2)}`, `x_v = −b/(2a) = ${fmt(h)}`, `f(${fmt(h)}) = ${fmt(k)}`, `${isMax ? "Máximo" : "Mínimo"} en (${fmt(h)}; ${fmt(k)})`],
        explanation: "El vértice es el extremo de la parábola: máximo si a < 0, mínimo si a > 0. Está en x = −b/(2a).",
      }),
      kind: "graph",
      expr,
      mode: "tap",
      target: { x: h, y: k },
      tolerance: 0.35,
      x: [-6, 6],
      y: [Math.min(-4, k - 5), Math.max(6, k + 5)],
    };
    return ex;
  },
};

export const actGraficoTangente: Generator = {
  id: "act-grafico-tangente",
  topicId: "t-derivadas",
  description: "Mover el punto hasta donde la pendiente es cero",
  generate(seed, d) {
    const r = rng(seed);
    const p = r.int(-2, 3);
    const q = r.int(-1, 3);
    const expr = `(x-(${p}))^2+(${q})`;
    const ex: GraphExercise = {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: PREP, topicId: this.topicId,
        prompt: "Arrastrá el punto sobre la curva hasta donde la **recta tangente es horizontal** (pendiente cero).",
        hints: ["Donde la tangente es horizontal la función deja de bajar y empieza a subir.", "Ahí la derivada vale 0.", `$f′(x) = 2(x − ${p})$: igualala a 0.`],
        solution: [`f′(x) = 2(x − ${fmt(p)})`, `2(x − ${fmt(p)}) = 0`, `x = ${fmt(p)}`],
        explanation: "La derivada es la pendiente de la tangente. Pendiente cero = tangente horizontal = posible máximo o mínimo.",
      }),
      kind: "graph",
      expr,
      mode: "drag",
      target: { x: p, y: q },
      tolerance: 0.3,
      x: [-5, 6],
      y: [-2, 12],
    };
    void d;
    return ex;
  },
};

export const actGraficoValor: Generator = {
  id: "act-grafico-valor",
  topicId: "t-funciones",
  description: "Mover el punto hasta x pedido y leer f(x)",
  generate(seed, d) {
    const r = rng(seed);
    const m = r.pick([-2, -1, 1, 2, 0.5]);
    const b = r.int(-3, 3);
    const target = r.int(-3, 4);
    const ex: GraphExercise = {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: PREP, topicId: this.topicId,
        prompt: `Mové el punto sobre $f(x) = ${fmt(m)}x ${sgn(b)}$ hasta que **x = ${target}**. Mirá cuánto vale f ahí.`,
        hints: ["Mirá el valor de x que aparece debajo del gráfico mientras movés.", "Podés usar las flechas del teclado para ajustar fino.", `Después calculá: f(${target}) = ${fmt(m)}·${target} ${sgn(b)}.`],
        solution: [`x = ${target}`, `f(${target}) = ${fmt(m)}·(${target}) ${sgn(b)} = ${fmt(m * target + b)}`],
        explanation: "Cada punto del gráfico es un par (x; f(x)): la altura del punto es el valor de la función.",
      }),
      kind: "graph",
      expr: `${m}*x+(${b})`,
      mode: "drag",
      target: { x: target, y: m * target + b },
      tolerance: 0.2,
      x: [-6, 6],
      y: [-8, 8],
    };
    return ex;
  },
};

// ───────────── Aplicaciones con contexto (Ingeniería Industrial) ─────────────

export const actFabricaCostos: Generator = {
  id: "act-fabrica-costos",
  topicId: "t-ecuaciones",
  description: "Costo fijo + variable: cuántas unidades se producen con un presupuesto",
  generate(seed, d) {
    const r = rng(seed);
    const fijo = r.int(4, 30) * 100;
    const unit = r.int(3, 25) * (d >= 4 ? 10 : 5);
    const q = r.int(20, 160);
    const total = fijo + unit * q;
    const item = r.pick(["sillas", "botellas", "piezas de motor", "cajas", "ruedas"]);
    const ex: NumericExercise = {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: PREP, topicId: this.topicId,
        prompt: `Una planta que fabrica ${item} tiene un costo fijo de $${fmt(fijo)} por día y cada unidad cuesta $${fmt(unit)}. Si el presupuesto diario es $${fmt(total)}, ¿cuántas ${item} puede producir?`,
        hints: ["Armá la ecuación: costo total = fijo + costo por unidad × cantidad.", `$${fmt(fijo)} + ${fmt(unit)}·q = ${fmt(total)}$`, "Restá el costo fijo y dividí por el costo unitario."],
        solution: [`${fmt(fijo)} + ${fmt(unit)}q = ${fmt(total)}`, `${fmt(unit)}q = ${fmt(total - fijo)}`, `q = ${fmt(q)}`],
        explanation: "Es una ecuación lineal: el costo total crece en línea recta con la cantidad producida (la pendiente es el costo unitario).",
        frequentErrors: [
          { match: Math.round(total / unit), type: "despeje" as const, message: "Dividiste el total por el costo unitario sin restar antes el costo fijo." },
          { match: unit * q, type: "interpretacion" as const, message: "Ese es el costo variable, no la cantidad de unidades." },
        ].filter((f) => f.match !== q),
      }),
      scene: "factory",
      context: "Producción en una planta: costo fijo + costo por unidad.",
      kind: "numeric",
      answer: q,
      unit: item,
    };
    return ex;
  },
};

export const actInventario: Generator = {
  id: "act-inventario",
  topicId: "t-porcentajes",
  description: "Inventario: porcentaje que queda después de los despachos",
  generate(seed, d) {
    const r = rng(seed);
    const stock = r.int(8, 60) * 50;
    const pct = r.pick(d <= 2 ? [10, 20, 25, 50] : [12, 15, 30, 35, 40, 45]);
    const left = stock * (1 - pct / 100);
    const ex: NumericExercise = {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: PREP, topicId: this.topicId,
        prompt: `Un depósito tiene ${fmt(stock)} unidades en inventario. Hoy se despacha el ${pct} % del stock. ¿Cuántas unidades quedan?`,
        hints: [`Calculá el ${pct} % de ${fmt(stock)}.`, `Queda el ${100 - pct} % del stock.`, `${fmt(stock)} · ${fmt((100 - pct) / 100)}`],
        solution: [`Despachado: ${fmt(stock)} · ${fmt(pct / 100)} = ${fmt((stock * pct) / 100)}`, `Queda: ${fmt(stock)} − ${fmt((stock * pct) / 100)} = ${fmt(left)}`],
        explanation: `Si sale el ${pct} %, queda el ${100 - pct} %: multiplicar por ${fmt((100 - pct) / 100)} lo resuelve en un paso.`,
        frequentErrors: [{ match: (stock * pct) / 100, type: "interpretacion", message: "Ese es lo que se despachó, no lo que queda." }],
      }),
      scene: "factory",
      context: "Gestión de inventario en un depósito.",
      kind: "numeric",
      answer: left,
      unit: "unidades",
    };
    return ex;
  },
};

export const actCohete: Generator = {
  id: "act-cohete",
  topicId: "t-mruv",
  description: "Despegue: velocidad después de acelerar",
  generate(seed, d) {
    const r = rng(seed);
    const a = r.int(2, 12);
    const t = r.int(3, 15);
    const v0 = d <= 2 ? 0 : r.int(5, 40);
    const v = v0 + a * t;
    const ex: NumericExercise = {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: "fisica", topicId: this.topicId,
        prompt: `Un cohete ${v0 ? `que ya sube a ${v0} m/s` : "parte del reposo y"} acelera a ${a} m/s² durante ${t} s. ¿Qué velocidad alcanza?`,
        hints: ["La aceleración dice cuánto aumenta la velocidad cada segundo.", "v = v₀ + a·t", `v = ${v0} + ${a}·${t}`],
        solution: [`v = v₀ + a·t`, `v = ${v0} + ${a}·${t}`, `v = ${v} m/s`],
        explanation: "En MRUV la velocidad cambia lo mismo cada segundo: v = v₀ + a·t.",
        frequentErrors: [{ match: a * t * t, type: "formula" as const, message: "Usaste t² : eso aparece en la posición, no en la velocidad." }, ...(v0 ? [{ match: a * t, type: "formula" as const, message: "Te olvidaste de la velocidad inicial v₀." }] : [])].filter((f) => f.match !== v),
      }),
      scene: "rocket",
      context: "Despegue: la velocidad crece segundo a segundo.",
      kind: "numeric",
      answer: v,
      unit: "m/s",
    };
    return ex;
  },
};

// ───────────── Programación: armar el algoritmo ─────────────

export const actAlgoritmo: Generator = {
  id: "act-algoritmo",
  topicId: "t-bucles",
  description: "Ordenar las líneas de un programa",
  generate(seed, d) {
    const r = rng(seed);
    const n = r.int(3, 9);
    const variants = [
      { lines: ["total = 0", `for i in range(1, ${n + 1}):`, "    total = total + i", "print(total)"], what: `la suma de 1 a ${n}` },
      { lines: ["cont = 0", `for i in range(${n}):`, "    if i % 2 == 0:", "        cont = cont + 1", "print(cont)"], what: `cuántos pares hay entre 0 y ${n - 1}` },
      { lines: ["mayor = numeros[0]", "for x in numeros:", "    if x > mayor:", "        mayor = x", "print(mayor)"], what: "el mayor de una lista" },
    ];
    const v = variants[d <= 2 ? 0 : seed % variants.length];
    const ex: OrderExercise = {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: "pensamiento-computacional", topicId: this.topicId,
        prompt: `Ordená las líneas para armar un programa que calcule **${v.what}**.`,
        hints: ["Primero se inicializa la variable que acumula.", "El ciclo va antes de lo que se repite (que está indentado).", "El print va al final, sin indentar: se ejecuta una vez."],
        solution: v.lines,
        explanation: "Patrón acumulador: inicializar → recorrer → actualizar dentro del ciclo → mostrar al final.",
      }),
      kind: "order",
      items: r.shuffle(v.lines),
      answer: v.lines,
    };
    return ex;
  },
};

// ───────────── Química: laboratorio ─────────────

const ELEMENTS: [string, string][] = [
  ["H", "Hidrógeno"],
  ["O", "Oxígeno"],
  ["C", "Carbono"],
  ["N", "Nitrógeno"],
  ["Na", "Sodio"],
  ["Cl", "Cloro"],
  ["Fe", "Hierro"],
  ["Ca", "Calcio"],
  ["K", "Potasio"],
  ["S", "Azufre"],
];

export const actSimbolos: Generator = {
  id: "act-simbolos",
  topicId: "t-qui-atomo",
  description: "Unir símbolo químico con el elemento",
  generate(seed, d) {
    const r = rng(seed);
    const pairs = r.shuffle(ELEMENTS.slice(0, d <= 2 ? 6 : 10)).slice(0, d <= 2 ? 4 : 5);
    const ex: MatchExercise = {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: "quimica", topicId: this.topicId,
        prompt: "Uní cada símbolo con su elemento.",
        hints: ["Muchos símbolos son la inicial del nombre.", "Algunos vienen del latín: Na (natrium), K (kalium), Fe (ferrum).", "La primera letra va en mayúscula y la segunda en minúscula."],
        solution: pairs.map(([s, n]) => `${s} → ${n}`),
        explanation: "Los símbolos químicos son abreviaturas internacionales; varios vienen del nombre en latín.",
      }),
      kind: "match",
      pairs,
    };
    return ex;
  },
};

export const actAgua: Generator = {
  id: "act-agua",
  topicId: "t-qui-nomenclatura",
  description: "Qué sustancia es una fórmula conocida",
  generate(seed, d) {
    const r = rng(seed);
    const list = [
      { f: "H₂O", ok: "Agua", bad: ["Hidrógeno", "Oxígeno", "Peróxido de hidrógeno"] },
      { f: "CO₂", ok: "Dióxido de carbono", bad: ["Monóxido de carbono", "Carbono", "Oxígeno"] },
      { f: "NaCl", ok: "Cloruro de sodio", bad: ["Sodio", "Cloro", "Hipoclorito de sodio"] },
      { f: "NH₃", ok: "Amoníaco", bad: ["Nitrógeno", "Ácido nítrico", "Hidrógeno"] },
      { f: "H₂SO₄", ok: "Ácido sulfúrico", bad: ["Ácido sulfuroso", "Azufre", "Sulfato de hidrógeno gaseoso"] },
    ];
    const it = list[seed % list.length];
    const ex: ChoiceExercise = {
      ...choice(
        r,
        {
          ...base({
            gen: this.id, seed, difficulty: d, subjectId: "quimica", topicId: this.topicId,
            prompt: `¿Qué es **${it.f}**?`,
            hints: ["Mirá qué elementos aparecen y cuántos átomos de cada uno.", "Un elemento solo (H, O) no es un compuesto.", "Los subíndices indican cuántos átomos hay de cada elemento."],
            solution: [`${it.f} = ${it.ok}`],
            explanation: "Una fórmula indica qué elementos forman la sustancia y en qué proporción. Un compuesto tiene dos o más elementos distintos.",
          }),
          scene: "lab",
        },
        [{ text: it.ok, correct: true }, ...it.bad.map((b) => ({ text: b, error: { type: "conceptual" as const, message: `${b} no corresponde a ${it.f}: mirá qué elementos aparecen y cuántos átomos de cada uno.` } }))],
      ),
    };
    void d;
    return ex;
  },
};

export const ACTIVITY_GENERATORS: Generator[] = [
  actFillOperador,
  actOrdenarResolucion,
  actEncontrarError,
  actPuerta,
  ...["t-mru", "t-mruv", "t-newton", "t-presion", "t-energia", "t-qui-concentracion", "t-qui-mol"].map(formulaFor),
  actUnidadesMatch,
  actGraficoVertice,
  actGraficoTangente,
  actGraficoValor,
  actFabricaCostos,
  actInventario,
  actCohete,
  actAlgoritmo,
  actSimbolos,
  actAgua,
];

/** Qué generadores de actividad suma cada tema (para alternar formatos en la práctica). */
export const ACTIVITY_BY_TOPIC: Record<string, string[]> = ACTIVITY_GENERATORS.reduce<Record<string, string[]>>((acc, g) => {
  (acc[g.topicId] ??= []).push(g.id);
  return acc;
}, {});
