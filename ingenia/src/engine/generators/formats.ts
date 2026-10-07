/** Generadores de formatos variados: ordenar, relacionar, elegir gráfico, encontrar el error, V/F. */
import type { Generator, MatchExercise, OrderExercise } from "../types";
import { fmt } from "../math/parser";
import { rng } from "./rng";
import { base, choice, sgn } from "./helpers";

export const ordenarPasos: Generator = {
  id: "ordenar-pasos",
  topicId: "t-ecuaciones",
  description: "Ordenar los pasos de una resolución",
  generate(seed, d) {
    const r = rng(seed);
    const x = r.nz(-6, 9);
    const a = r.int(2, 6);
    const b = r.nz(-9, 9);
    const c = a * x + b;
    const items = [`${a}x ${sgn(b)} = ${fmt(c)}`, `${a}x = ${fmt(c)} ${sgn(-b)}`, `${a}x = ${fmt(c - b)}`, `x = ${fmt(c - b)} / ${a}`, `x = ${fmt(x)}`].slice(0, d <= 2 ? 3 : 5);
    if (d <= 2) items[2] = `x = ${fmt(x)}`;
    const ex: OrderExercise = {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: "preparacion", topicId: this.topicId,
        prompt: "Ordená los pasos para resolver la ecuación: arrastralos (o usá ▲ ▼) del primero al último.",
        hints: ["El primer paso es la ecuación original.", "Primero se saca el número que suma o resta; después lo que multiplica.", "El último paso tiene la x sola."],
        solution: items,
        explanation: "Despejar es deshacer en orden inverso: primero sumas y restas, después multiplicaciones y divisiones.",
      }),
      kind: "order",
      items: rng(seed + 1).shuffle(items),
      answer: items,
    };
    return ex;
  },
};

export const encontrarError: Generator = {
  id: "encontrar-error",
  topicId: "t-ecuaciones",
  description: "Encontrar el paso equivocado de una resolución",
  generate(seed, d) {
    const r = rng(seed);
    const x = r.nz(-6, 9);
    const a = r.int(2, 6);
    const b = r.nz(-9, 9);
    const c = a * x + b;
    const kind = r.pick(["signo", "division"] as const);
    let steps: string[];
    let wrong: number;
    let why: string;
    if (kind === "signo") {
      const bad = c + b;
      steps = [`${a}x ${sgn(b)} = ${fmt(c)}`, `${a}x = ${fmt(c)} ${sgn(b)}`, `${a}x = ${fmt(bad)}`, `x = ${fmt(bad / a, 3)}`];
      wrong = 1;
      why = `En el paso 2 el ${fmt(b)} pasó al otro lado sin cambiar de signo. Debería ser ${a}x = ${fmt(c)} ${sgn(-b)}.`;
    } else {
      steps = [`${a}x ${sgn(b)} = ${fmt(c)}`, `${a}x = ${fmt(c - b)}`, `x = ${fmt(c - b)} · ${a}`, `x = ${fmt((c - b) * a)}`];
      wrong = 2;
      why = `En el paso 3 se multiplicó por ${a}. Como la x está multiplicada por ${a}, hay que DIVIDIR: x = ${fmt(c - b)} / ${a} = ${fmt(x)}.`;
    }
    // Las opciones son los pasos: se muestran en su orden, sin mezclar.
    return choice(
      { ...r, shuffle: <T,>(a: T[]) => a },
      base({
          gen: this.id, seed, difficulty: d, subjectId: "preparacion", topicId: this.topicId,
          prompt: "Esta resolución tiene **un** error. ¿En qué paso está?",
          hints: ["Revisá cada paso: ¿se hizo lo mismo en ambos lados?", "Lo que suma pasa restando; lo que multiplica pasa dividiendo.", kind === "signo" ? "Mirá qué pasó con el signo del número que se movió." : "Mirá cómo se sacó el número que multiplica a la x."],
          solution: [why],
          explanation: why,
        }),
      steps.map((st, i) => ({ text: `$${st}$`, correct: i === wrong, error: i === wrong ? undefined : { type: "interpretacion" as const, message: i < wrong ? "Ese paso está bien. Seguí revisando los siguientes." : "Ese paso arrastra el error, pero el error se cometió antes." } })),
      "steps",
    );
  },
};

const GRAPHS: { expr: string; label: string; hint: string }[] = [
  { expr: "x^2", label: "x²", hint: "Una parábola con vértice en el origen, abierta hacia arriba." },
  { expr: "x^3", label: "x³", hint: "Pasa por el origen, negativa a la izquierda y positiva a la derecha." },
  { expr: "2x + 1", label: "2x + 1", hint: "Una recta que sube y corta al eje y en 1." },
  { expr: "-x + 2", label: "−x + 2", hint: "Una recta que baja y corta al eje y en 2." },
  { expr: "abs(x)", label: "|x|", hint: "Forma de V con el vértice en el origen." },
  { expr: "sqrt(x)", label: "√x", hint: "Solo existe para x ≥ 0 y crece cada vez más despacio." },
  { expr: "1/x", label: "1/x", hint: "Dos ramas: no existe en x = 0." },
  { expr: "sin(x)", label: "sen x", hint: "Una onda que oscila entre −1 y 1." },
  { expr: "-x^2 + 4", label: "−x² + 4", hint: "Parábola abierta hacia abajo con vértice en (0, 4)." },
  { expr: "2^x", label: "2ˣ", hint: "Crece cada vez más rápido y nunca toca el eje x." },
];

export const elegirGrafico: Generator = {
  id: "elegir-grafico",
  topicId: "t-funciones",
  description: "Reconocer el gráfico de una función",
  generate(seed, d) {
    const r = rng(seed);
    const pool = r.shuffle(d <= 2 ? GRAPHS.slice(0, 6) : GRAPHS);
    const target = pool[0];
    return choice(
      r,
      base({
          gen: this.id, seed, difficulty: d, subjectId: "am-a", topicId: this.topicId,
          prompt: `¿Cuál es el gráfico de $f(x) = ${target.label}$?`,
          hints: ["Calculá algunos puntos: f(0), f(1), f(−1).", "Fijate si la función existe para todos los x.", target.hint],
          solution: [target.hint],
          explanation: "Para reconocer un gráfico conviene evaluar puntos fáciles y mirar el comportamiento: si sube o baja, dónde corta los ejes, si tiene huecos.",
        }),
      pool.slice(0, 4).map((g, i) => ({ text: g.expr, correct: i === 0, error: i === 0 ? undefined : { type: "interpretacion" as const, message: `Ese es el gráfico de ${g.label}. ${target.hint}` } })),
      "plot",
    );
  },
};

const UNITS: [string, string][] = [
  ["Velocidad", "m/s"],
  ["Aceleración", "m/s²"],
  ["Fuerza", "N (newton)"],
  ["Energía", "J (joule)"],
  ["Presión", "Pa (pascal)"],
  ["Potencia", "W (watt)"],
  ["Densidad", "kg/m³"],
  ["Masa", "kg"],
];

export const relacionarUnidades: Generator = {
  id: "relacionar-unidades",
  topicId: "t-unidades",
  description: "Relacionar magnitudes con sus unidades",
  generate(seed, d) {
    const r = rng(seed);
    const pairs = r.shuffle(d <= 2 ? UNITS.slice(0, 5) : UNITS).slice(0, 4);
    const ex: MatchExercise = {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: "fisica", topicId: this.topicId,
        prompt: "Relacioná cada magnitud con su unidad en el Sistema Internacional.",
        hints: ["Pensá en la definición: la velocidad es distancia sobre tiempo.", "La aceleración es cuánto cambia la velocidad por segundo: (m/s)/s.", "Las unidades con nombre propio (newton, joule, pascal, watt) vienen de fuerza, energía, presión y potencia."],
        solution: pairs.map(([a, b]) => `${a} → ${b}`),
        explanation: "Cada unidad sale de la definición de la magnitud: v = Δx/Δt → m/s; a = Δv/Δt → m/s²; F = m·a → kg·m/s² = N.",
      }),
      kind: "match",
      pairs,
    };
    return ex;
  },
};

const STATEMENTS: { text: string; value: boolean; why: string; type: "signos" | "potencias" | "fracciones" | "conceptual" }[] = [
  { text: "$(a + b)^2 = a^2 + b^2$", value: false, why: "(a + b)² = a² + 2ab + b². La potencia no se distribuye en una suma.", type: "potencias" },
  { text: "$−3^2 = 9$", value: false, why: "Sin paréntesis, −3² = −(3²) = −9.", type: "signos" },
  { text: "$a^0 = 1$ para todo $a ≠ 0$", value: true, why: "Cualquier número distinto de cero elevado a 0 da 1.", type: "potencias" },
  { text: "$2(x + 3) = 2x + 6$", value: true, why: "Distributiva: el 2 multiplica a los dos términos.", type: "conceptual" },
  { text: "$√(a + b) = √a + √b$", value: false, why: "√(9 + 16) = √25 = 5, pero √9 + √16 = 7. La raíz no se distribuye en una suma.", type: "potencias" },
  { text: "$(−2)^3 = −8$", value: true, why: "Base negativa con exponente impar da negativo.", type: "signos" },
  { text: "$1/2 + 1/3 = 2/5$", value: false, why: "1/2 + 1/3 = 3/6 + 2/6 = 5/6. No se suman numeradores y denominadores.", type: "fracciones" },
  { text: "$−(−5) = 5$", value: true, why: "Restar un negativo es sumar.", type: "signos" },
  { text: "$x/x = 1$ para todo $x$", value: false, why: "Vale para x ≠ 0: 0/0 no está definido.", type: "conceptual" },
  { text: "$2^3 · 2^4 = 2^7$", value: true, why: "Igual base: los exponentes se suman.", type: "potencias" },
];

export const verdaderoFalso: Generator = {
  id: "verdadero-falso",
  topicId: "t-expresiones",
  description: "Verdadero o falso sobre reglas algebraicas",
  generate(seed, d) {
    const r = rng(seed);
    const st = STATEMENTS[seed % STATEMENTS.length];
    return choice(
      { ...r, shuffle: <T,>(a: T[]) => a },
      base({
        gen: this.id, seed, difficulty: d, subjectId: "preparacion", topicId: this.topicId,
        prompt: `¿Verdadero o falso? ${st.text}`,
        hints: ["Probá con números concretos.", "Si encontrás UN caso donde no se cumple, es falso.", "Por ejemplo, reemplazá a = 1 y b = 2."],
        solution: [st.why],
        explanation: st.why,
      }),
      [
        { text: "Verdadero", correct: st.value, error: st.value ? undefined : { type: st.type, message: st.why } },
        { text: "Falso", correct: !st.value, error: !st.value ? undefined : { type: st.type, message: st.why } },
      ],
    );
  },
};

export const velocidadMedia: Generator = {
  id: "velocidad-media",
  topicId: "t-mru",
  description: "Pregunta rápida de velocidad media",
  generate(seed, d) {
    const r = rng(seed);
    const t = r.pick([2, 4, 5, 10, 20]);
    const v = r.pick([2, 3, 5, 8, 10, 12]);
    const dist = v * t;
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: "fisica", topicId: this.topicId,
        prompt: `Si recorrés ${dist} m en ${t} s, ¿cuál fue tu velocidad media?`,
        hints: ["La velocidad media es cuánto cambió la posición dividido el tiempo.", "v = Δx / Δt.", `${dist} / ${t}.`],
        solution: [`v = ${dist} m / ${t} s = ${v} m/s`],
        explanation: "v = Δx/Δt: metros recorridos por cada segundo.",
      }),
      [
        { text: `${v} m/s`, correct: true },
        { text: `${dist * t} m/s`, error: { type: "formula", message: "Multiplicaste. La velocidad es distancia DIVIDIDA tiempo." } },
        { text: `${fmt(t / dist, 3)} m/s`, error: { type: "formula", message: "Lo dividiste al revés: es distancia sobre tiempo." } },
        { text: `${dist} m/s`, error: { type: "formula", message: "Esa es la distancia; falta dividir por el tiempo." } },
      ],
    );
  },
};

export const formatGenerators = [ordenarPasos, encontrarError, elegirGrafico, relacionarUnidades, verdaderoFalso, velocidadMedia];
