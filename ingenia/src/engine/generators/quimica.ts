/**
 * Generadores de Química (CBC, Química general de ingreso).
 *
 * Convenciones (se aclaran en cada enunciado que las usa):
 *  - Masas atómicas redondeadas: H 1, C 12, N 14, O 16, Na 23, Mg 24, Al 27,
 *    P 31, S 32, Cl 35,5, K 39, Ca 40, Fe 56, Cu 63,5, Zn 65 (g/mol).
 *  - R = 0,082 atm·L/(mol·K); T(K) = T(°C) + 273; 1 atm = 760 mmHg.
 *  - Volumen molar en CNPT (0 °C, 1 atm): 22,4 L/mol. N_A = 6,02·10²³.
 *  - Kw = 1,0·10⁻¹⁴ a 25 °C (pH + pOH = 14).
 * Los distractores numéricos son errores típicos reales: no pasar °C a K,
 * confundir masa con moles, no balancear, coeficientes vs subíndices, pH con
 * signo, volumen en mL como si fuera L, etc.
 */
import type { Difficulty, ErrorType, Generator, NumericExercise } from "../types";
import { fmt } from "../math/parser";
import { rng, type Rng } from "./rng";
import { base, choice } from "./helpers";

const SUBJ = "quimica";

// ───────────────────────── utilidades numéricas ─────────────────────────

function sig3(x: number): number {
  if (!Number.isFinite(x) || x === 0) return x;
  return Number(x.toPrecision(3));
}

/** Texto con 3 cifras significativas y coma decimal. */
function s3(x: number): string {
  const v = sig3(x);
  if (!Number.isFinite(v)) return "—";
  if (v === 0) return "0";
  const e = Math.floor(Math.log10(Math.abs(v)));
  const dec = Math.max(0, 2 - e);
  return v.toFixed(dec).replace(".", ",").replace("-", "−");
}

/** Dato del enunciado con coma decimal. */
const n = (x: number, d = 3) => fmt(x, d);

/** Potencia de diez legible: 1,8·10^{-5} (para MathText). */
function sci(x: number, digits = 2): string {
  const e = Math.floor(Math.log10(Math.abs(x)));
  const m = x / 10 ** e;
  return `${fmt(Number(m.toPrecision(digits)), 3)}·10^{${e}}`;
}

type Err = [number, ErrorType, string];
type Mode = "sig3" | "int" | "dec1" | "dec2";

interface NumArgs {
  gen: string;
  seed: number;
  d: Difficulty;
  topicId: string;
  prompt: string;
  hints: [string, string, string];
  solution: string[];
  explanation: string;
  unit: string;
  answer: number;
  mode?: Mode;
  errors?: Err[];
}

function roundMode(x: number, mode: Mode): number {
  switch (mode) {
    case "sig3":
      return sig3(x);
    case "int":
      return Math.round(x);
    case "dec1":
      return Math.round(x * 10) / 10;
    case "dec2":
      return Math.round(x * 100) / 100;
  }
}

function tolFor(ans: number, mode: Mode): number {
  switch (mode) {
    case "sig3":
      return Math.max(Math.abs(ans) * 0.01, 1e-9);
    case "int":
      return 0.01;
    case "dec1":
      return Math.max(0.06, Math.abs(ans) * 0.005);
    case "dec2":
      return 0.02;
  }
}

const SUFFIX: Record<Mode, string> = {
  sig3: "Respondé con 3 cifras significativas",
  int: "Respondé con un número entero",
  dec1: "Redondeá a 1 decimal",
  dec2: "Redondeá a 2 decimales",
};

/** Ejercicio numérico: redondea la respuesta según el modo y filtra errores frecuentes que coincidan. */
function num(a: NumArgs): NumericExercise {
  const mode = a.mode ?? "sig3";
  const ans = roundMode(a.answer, mode);
  const tol = tolFor(ans, mode);
  const kept: number[] = [];
  const frequentErrors = (a.errors ?? [])
    .map(([m, type, message]) => ({ match: roundMode(m, mode), type, message }))
    .filter((e) => {
      if (!Number.isFinite(e.match)) return false;
      if (Math.abs(e.match - ans) <= 3 * tol) return false;
      if (kept.some((k) => Math.abs(k - e.match) <= 3 * Math.max(tol, Math.abs(k) * 0.01))) return false;
      kept.push(e.match);
      return true;
    });
  return {
    ...base({
      gen: a.gen,
      seed: a.seed,
      difficulty: a.d,
      subjectId: SUBJ,
      topicId: a.topicId,
      prompt: `${a.prompt} ${SUFFIX[mode]}${a.unit ? `, en ${a.unit}` : ""}.`,
      hints: a.hints,
      solution: a.solution,
      explanation: a.explanation,
      frequentErrors,
    }),
    kind: "numeric",
    answer: ans,
    tolerance: tol,
    ...(a.unit ? { unit: a.unit } : {}),
  };
}

function cbase(gen: string, seed: number, d: Difficulty, topicId: string, prompt: string, hints: [string, string, string], solution: string[], explanation: string) {
  return base({ gen, seed, difficulty: d, subjectId: SUBJ, topicId, prompt, hints, solution, explanation });
}

interface Concept {
  q: string;
  ok: string;
  bad: [string, ErrorType, string][];
  why: string;
}

/** Pregunta conceptual tomada de un banco (cambia con la semilla y la dificultad). */
function conceptChoice(r: Rng, gen: string, seed: number, d: Difficulty, topicId: string, c: Concept, hints: [string, string, string]) {
  return choice(
    r,
    cbase(gen, seed, d, topicId, c.q, hints, [c.why], c.why),
    [{ text: c.ok, correct: true }, ...c.bad.map(([text, type, message]) => ({ text, error: { type, message } }))],
  );
}

// ───────────────────────── datos químicos ─────────────────────────

/** Masas atómicas redondeadas (g/mol). */
export const MASAS: Record<string, number> = {
  H: 1, C: 12, N: 14, O: 16, Na: 23, Mg: 24, Al: 27, P: 31, S: 32, Cl: 35.5, K: 39, Ca: 40, Fe: 56, Cu: 63.5, Zn: 65,
};

/** Números atómicos (para detectar el error «sumé Z en vez de masas»). */
const ZETA: Record<string, number> = { H: 1, C: 6, N: 7, O: 8, Na: 11, Mg: 12, Al: 13, P: 15, S: 16, Cl: 17, K: 19, Ca: 20, Fe: 26, Cu: 29, Zn: 30 };

type Comp = Record<string, number>;

export interface Especie {
  /** Fórmula para MathText (sin $): "H_2SO_4". */
  f: string;
  name: string;
  comp: Comp;
  /** Composición que resulta de olvidar multiplicar lo que está entre paréntesis. */
  parenBad?: Comp;
}

export function masaMolar(c: Comp): number {
  return Object.entries(c).reduce((s, [el, k]) => s + MASAS[el] * k, 0);
}

const mm = masaMolar;

const SP: Record<string, Especie> = {
  H2: { f: "H_2", name: "hidrógeno", comp: { H: 2 } },
  O2: { f: "O_2", name: "oxígeno", comp: { O: 2 } },
  N2: { f: "N_2", name: "nitrógeno", comp: { N: 2 } },
  Cl2: { f: "Cl_2", name: "cloro", comp: { Cl: 2 } },
  H2O: { f: "H_2O", name: "agua", comp: { H: 2, O: 1 } },
  CO2: { f: "CO_2", name: "dióxido de carbono", comp: { C: 1, O: 2 } },
  CO: { f: "CO", name: "monóxido de carbono", comp: { C: 1, O: 1 } },
  NH3: { f: "NH_3", name: "amoníaco", comp: { N: 1, H: 3 } },
  NO: { f: "NO", name: "monóxido de nitrógeno", comp: { N: 1, O: 1 } },
  CH4: { f: "CH_4", name: "metano", comp: { C: 1, H: 4 } },
  C2H6: { f: "C_2H_6", name: "etano", comp: { C: 2, H: 6 } },
  C3H8: { f: "C_3H_8", name: "propano", comp: { C: 3, H: 8 } },
  C4H10: { f: "C_4H_{10}", name: "butano", comp: { C: 4, H: 10 } },
  C6H12O6: { f: "C_6H_{12}O_6", name: "glucosa", comp: { C: 6, H: 12, O: 6 } },
  C2H6O: { f: "C_2H_5OH", name: "etanol", comp: { C: 2, H: 6, O: 1 } },
  NaCl: { f: "NaCl", name: "cloruro de sodio", comp: { Na: 1, Cl: 1 } },
  KCl: { f: "KCl", name: "cloruro de potasio", comp: { K: 1, Cl: 1 } },
  HCl: { f: "HCl", name: "ácido clorhídrico", comp: { H: 1, Cl: 1 } },
  HNO3: { f: "HNO_3", name: "ácido nítrico", comp: { H: 1, N: 1, O: 3 } },
  H2SO4: { f: "H_2SO_4", name: "ácido sulfúrico", comp: { H: 2, S: 1, O: 4 } },
  H3PO4: { f: "H_3PO_4", name: "ácido fosfórico", comp: { H: 3, P: 1, O: 4 } },
  NaOH: { f: "NaOH", name: "hidróxido de sodio", comp: { Na: 1, O: 1, H: 1 } },
  KOH: { f: "KOH", name: "hidróxido de potasio", comp: { K: 1, O: 1, H: 1 } },
  CaOH2: { f: "Ca(OH)_2", name: "hidróxido de calcio", comp: { Ca: 1, O: 2, H: 2 }, parenBad: { Ca: 1, O: 1, H: 2 } },
  CaCO3: { f: "CaCO_3", name: "carbonato de calcio", comp: { Ca: 1, C: 1, O: 3 } },
  CaO: { f: "CaO", name: "óxido de calcio", comp: { Ca: 1, O: 1 } },
  CaCl2: { f: "CaCl_2", name: "cloruro de calcio", comp: { Ca: 1, Cl: 2 } },
  Ca3PO42: { f: "Ca_3(PO_4)_2", name: "fosfato de calcio", comp: { Ca: 3, P: 2, O: 8 }, parenBad: { Ca: 3, P: 1, O: 8 } },
  Na2SO4: { f: "Na_2SO_4", name: "sulfato de sodio", comp: { Na: 2, S: 1, O: 4 } },
  NaHCO3: { f: "NaHCO_3", name: "bicarbonato de sodio", comp: { Na: 1, H: 1, C: 1, O: 3 } },
  MgNO32: { f: "Mg(NO_3)_2", name: "nitrato de magnesio", comp: { Mg: 1, N: 2, O: 6 }, parenBad: { Mg: 1, N: 1, O: 6 } },
  Al2SO43: { f: "Al_2(SO_4)_3", name: "sulfato de aluminio", comp: { Al: 2, S: 3, O: 12 }, parenBad: { Al: 2, S: 1, O: 12 } },
  AlCl3: { f: "AlCl_3", name: "cloruro de aluminio", comp: { Al: 1, Cl: 3 } },
  Fe2O3: { f: "Fe_2O_3", name: "óxido de hierro(III)", comp: { Fe: 2, O: 3 } },
  CuSO4: { f: "CuSO_4", name: "sulfato de cobre(II)", comp: { Cu: 1, S: 1, O: 4 } },
  ZnCl2: { f: "ZnCl_2", name: "cloruro de zinc", comp: { Zn: 1, Cl: 2 } },
  KClO3: { f: "KClO_3", name: "clorato de potasio", comp: { K: 1, Cl: 1, O: 3 } },
  Fe: { f: "Fe", name: "hierro", comp: { Fe: 1 } },
  Al: { f: "Al", name: "aluminio", comp: { Al: 1 } },
  Zn: { f: "Zn", name: "zinc", comp: { Zn: 1 } },
  Na: { f: "Na", name: "sodio", comp: { Na: 1 } },
  Mg: { f: "Mg", name: "magnesio", comp: { Mg: 1 } },
  MgO: { f: "MgO", name: "óxido de magnesio", comp: { Mg: 1, O: 1 } },
  MgCl2: { f: "MgCl_2", name: "cloruro de magnesio", comp: { Mg: 1, Cl: 2 } },
};

/** Lista de masas usadas, para el enunciado. */
function masasTexto(...comps: Comp[]): string {
  const els = new Set<string>();
  comps.forEach((c) => Object.keys(c).forEach((e) => els.add(e)));
  return [...els].map((e) => `${e} = ${n(MASAS[e])}`).join("; ");
}

function masasDe(...sp: Especie[]): string {
  return `Masas atómicas (g/mol): ${masasTexto(...sp.map((s) => s.comp))}.`;
}

/** Desarrollo de la masa molar para la resolución: "2·1 + 1·16 = 18 g/mol". */
function mmSteps(c: Comp): string {
  return `${Object.entries(c).map(([el, k]) => `${k}·${n(MASAS[el])} (${el})`).join(" + ")} = ${n(mm(c))} g/mol`;
}

// ═══════════════════════════ Unidad 1: Sistemas materiales ═══════════════════════════

type Clase = "het" | "sol" | "simple" | "comp";
const CLASE_TXT: Record<Clase, string> = {
  het: "Sistema heterogéneo",
  sol: "Solución (sistema homogéneo de 2 o más componentes)",
  simple: "Sustancia pura simple",
  comp: "Sustancia pura compuesta",
};

const SISTEMAS: { s: string; c: Clase; hard?: boolean }[] = [
  { s: "agua con sal de mesa totalmente disuelta", c: "sol" },
  { s: "agua con arena", c: "het" },
  { s: "oxígeno gaseoso ($O_2$) puro", c: "simple" },
  { s: "agua destilada", c: "comp" },
  { s: "agua con aceite", c: "het" },
  { s: "nitrógeno gaseoso ($N_2$) puro", c: "simple" },
  { s: "azúcar de mesa (sacarosa) pura", c: "comp" },
  { s: "un trozo de hierro puro", c: "simple" },
  { s: "aire filtrado (sin polvo ni gotitas)", c: "sol", hard: true },
  { s: "bronce (aleación uniforme de cobre y estaño)", c: "sol", hard: true },
  { s: "granito (se ven granos de cuarzo, feldespato y mica)", c: "het", hard: true },
  { s: "alcohol medicinal (etanol y agua)", c: "sol", hard: true },
  { s: "dióxido de carbono ($CO_2$) puro", c: "comp", hard: true },
  { s: "ozono ($O_3$) puro", c: "simple", hard: true },
  { s: "leche vista al microscopio (gotitas de grasa dispersas)", c: "het", hard: true },
];

function claseMsg(wrong: Clase, right: Clase): string {
  if (wrong === "het") return "Heterogéneo significa que se distinguen dos o más fases (con superficies de separación visibles, aun con microscopio). Acá hay una sola fase.";
  if (wrong === "sol")
    return right === "het"
      ? "Una solución es homogénea: una sola fase. Acá se distinguen fases distintas."
      : "Una solución tiene DOS o más componentes. Acá hay un único componente: es una sustancia pura.";
  if (wrong === "simple")
    return right === "comp"
      ? "Una sustancia simple está formada por un solo elemento. Esta tiene dos o más elementos combinados químicamente: es compuesta."
      : "Una sustancia pura tiene un solo componente. Acá hay más de uno mezclados (no combinados químicamente).";
  return right === "simple"
    ? "Una sustancia compuesta tiene dos o más elementos distintos. Esta tiene un único elemento (aunque la molécula tenga varios átomos): es simple."
    : "Una sustancia compuesta es UN componente con composición fija. Acá hay varios componentes mezclados que conservan sus propiedades.";
}

export const quiSistemasClasificar: Generator = {
  id: "qui-sistemas-clasificar",
  topicId: "t-qui-sistemas",
  description: "Clasificar un sistema material (heterogéneo, solución, sustancia simple o compuesta)",
  generate(seed, d) {
    const r = rng(seed);
    const pool = d <= 3 ? SISTEMAS.filter((x) => !x.hard) : SISTEMAS;
    const it = pool[(seed * 7 + d) % pool.length];
    const all: Clase[] = ["het", "sol", "simple", "comp"];
    const why =
      it.c === "het"
        ? "Se distinguen dos o más fases: es un sistema heterogéneo."
        : it.c === "sol"
          ? "Tiene una sola fase y más de un componente: es una solución."
          : it.c === "simple"
            ? "Es una sustancia pura formada por un único elemento: sustancia simple."
            : "Es una sustancia pura formada por dos o más elementos combinados en proporción fija: sustancia compuesta.";
    return choice(
      r,
      cbase(this.id, seed, d, this.topicId, `¿Cómo se clasifica el siguiente sistema: **${it.s}**?`, [
        "Primero preguntate: ¿cuántas fases ves (aun con microscopio)?",
        "Si hay una sola fase: ¿tiene un componente o varios? Si es un solo componente, ¿cuántos elementos tiene?",
        "Heterogéneo = 2+ fases. Solución = 1 fase y 2+ componentes. Sustancia simple = 1 elemento. Compuesta = 2+ elementos combinados.",
      ], [why], why),
      all.map((c) => (c === it.c ? { text: CLASE_TXT[c], correct: true } : { text: CLASE_TXT[c], error: { type: "conceptual" as ErrorType, message: claseMsg(c, it.c) } })),
    );
  },
};

const INSOLUBLES = ["arena", "limaduras de hierro", "trocitos de corcho", "carbón en polvo"];
const SOLUBLES = ["sal de mesa (totalmente disuelta)", "azúcar (totalmente disuelta)"];

export const quiFasesComponentes: Generator = {
  id: "qui-fases-componentes",
  topicId: "t-qui-sistemas",
  description: "Contar fases y componentes de un sistema",
  generate(seed, d) {
    const r = rng(seed);
    const hielo = d >= 2 && r.bool();
    const nSol = d <= 1 ? r.int(0, 1) : r.int(0, 2);
    const nIns = d <= 2 ? r.int(1, 2) : r.int(1, 3);
    const aceite = d >= 3 && r.bool();
    const sol = r.shuffle(SOLUBLES).slice(0, nSol);
    const ins = r.shuffle(INSOLUBLES).slice(0, nIns);
    const items = ["agua líquida", ...(hielo ? ["cubitos de hielo"] : []), ...sol, ...ins, ...(aceite ? ["aceite"] : [])];
    const fases = 1 + (hielo ? 1 : 0) + nIns + (aceite ? 1 : 0);
    const comps = 1 + nSol + nIns + (aceite ? 1 : 0);
    const askFases = d <= 2 ? r.bool() : seed % 2 === 0;
    const errors: Err[] = askFases
      ? [
          [fases + nSol, "conceptual", "Contaste lo que está disuelto como una fase aparte. Un sólido totalmente disuelto forma parte de la fase líquida: no se distingue."],
          [fases - (hielo ? 1 : 0), "conceptual", "El hielo y el agua líquida son la misma sustancia pero están en estados distintos: son DOS fases (hay una superficie de separación)."],
          [comps, "conceptual", "Ese es el número de componentes (sustancias). La pregunta es por las fases: porciones con propiedades intensivas uniformes separadas por interfases."],
        ]
      : [
          [comps + (hielo ? 1 : 0), "conceptual", "El hielo es agua: es el mismo componente que el agua líquida, aunque sea otra fase."],
          [comps - nSol, "conceptual", "Lo disuelto no se ve, pero sigue siendo un componente del sistema."],
          [fases, "conceptual", "Ese es el número de fases. Los componentes son las sustancias distintas que hay."],
        ];
    const lista = items.join(", ");
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "", mode: "int", answer: askFases ? fases : comps,
      prompt: `Un recipiente contiene: ${lista}. ¿Cuántas **${askFases ? "fases" : "componentes"}** tiene el sistema? (Ignorá el aire y el recipiente.)`,
      hints: [
        askFases ? "Una fase es cada porción del sistema que se ve distinta y separada de las demás." : "Un componente es cada sustancia distinta, sin importar en qué estado esté.",
        askFases ? "Lo que está totalmente disuelto NO es una fase aparte. Cada sólido que no se disuelve, sí." : "El hielo y el agua líquida son la misma sustancia.",
        askFases ? "El hielo flota y se distingue: es otra fase, aunque sea agua." : "Lo disuelto cuenta como componente aunque no se vea.",
      ],
      solution: askFases
        ? [
            "Fase líquida: el agua junto con todo lo disuelto → 1 fase.",
            ...(hielo ? ["Hielo: 1 fase más (sólida)."] : []),
            `Sólidos insolubles (${ins.join(", ")}): ${nIns} fase(s).`,
            ...(aceite ? ["Aceite: no se mezcla con el agua → 1 fase más."] : []),
            `Total: ${fases} fases.`,
          ]
        : [
            `Agua (líquida${hielo ? " y hielo: es la misma sustancia" : ""}): 1 componente.`,
            ...(nSol ? [`Sustancias disueltas: ${nSol}.`] : []),
            `Sólidos insolubles: ${nIns}.`,
            ...(aceite ? ["Aceite: 1."] : []),
            `Total: ${comps} componentes.`,
          ],
      explanation: "Fases = porciones homogéneas separadas por interfases. Componentes = sustancias distintas. Son conteos independientes.",
      errors,
    });
  },
};

const MATERIALES: { name: string; dens: number }[] = [
  { name: "aluminio", dens: 2.7 },
  { name: "hierro", dens: 7.87 },
  { name: "cobre", dens: 8.96 },
  { name: "etanol", dens: 0.789 },
  { name: "glicerina", dens: 1.26 },
  { name: "aceite de oliva", dens: 0.92 },
  { name: "plomo", dens: 11.3 },
];

export const quiDensidad: Generator = {
  id: "qui-densidad",
  topicId: "t-qui-sistemas",
  description: "Densidad: δ = m/V con conversión de unidades",
  generate(seed, d) {
    const r = rng(seed);
    const mat = r.pick(MATERIALES);
    const tipo = d <= 2 ? 0 : d <= 4 ? r.pick([0, 1]) : r.pick([1, 2]);
    if (tipo === 0) {
      const V = r.pick([20, 25, 40, 50, 75, 120, 250]);
      const m = Math.round(mat.dens * V * 10) / 10;
      const dens = m / V;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "g/cm³", answer: dens,
        prompt: `Una muestra de ${mat.name} tiene una masa de ${n(m)} g y ocupa ${V} cm³. ¿Cuál es su densidad?`,
        hints: ["La densidad dice cuánta masa hay en cada unidad de volumen.", "δ = m / V.", `δ = ${n(m)} g / ${V} cm³.`],
        solution: [`δ = m / V = ${n(m)} g / ${V} cm³`, `δ = ${s3(dens)} g/cm³`],
        explanation: "La densidad es masa por unidad de volumen; es una propiedad intensiva: no depende del tamaño de la muestra.",
        errors: [[V / m, "formula", "Dividiste al revés: la densidad es masa sobre volumen (g/cm³), no volumen sobre masa."], [m * V, "formula", "Multiplicaste. La densidad es el cociente m/V."]],
      });
    }
    if (tipo === 1) {
      const VL = r.pick([0.25, 0.5, 1.5, 2, 2.5, 0.75]);
      const m = mat.dens * VL * 1000;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "g", answer: m,
        prompt: `La densidad del ${mat.name} es ${n(mat.dens)} g/cm³. ¿Qué masa tienen ${n(VL)} L de ${mat.name}?`,
        hints: ["Las unidades tienen que ser compatibles: la densidad está en g/cm³.", "1 L = 1000 cm³.", "m = δ · V, con V en cm³."],
        solution: [`V = ${n(VL)} L = ${n(VL * 1000)} cm³`, `m = δ · V = ${n(mat.dens)} g/cm³ · ${n(VL * 1000)} cm³`, `m = ${s3(m)} g`],
        explanation: "Antes de multiplicar, el volumen tiene que estar en la misma unidad que aparece en la densidad.",
        errors: [[mat.dens * VL, "unidades", "Te faltó pasar los litros a cm³ (1 L = 1000 cm³). Mirá las unidades: g/cm³ · L no da gramos."], [VL / mat.dens * 1000, "formula", "Dividiste V por δ. De δ = m/V se despeja m = δ·V."]],
      });
    }
    const mkg = r.pick([0.5, 1.2, 2, 3.5, 0.8]);
    const V = (mkg * 1000) / mat.dens;
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "cm³", answer: V,
      prompt: `¿Qué volumen ocupan ${n(mkg)} kg de ${mat.name} (δ = ${n(mat.dens)} g/cm³)?`,
      hints: ["Pasá la masa a gramos para que coincida con la densidad.", "1 kg = 1000 g.", "V = m / δ."],
      solution: [`m = ${n(mkg)} kg = ${n(mkg * 1000)} g`, `V = m / δ = ${n(mkg * 1000)} g / ${n(mat.dens)} g/cm³`, `V = ${s3(V)} cm³`],
      explanation: "Despejando δ = m/V queda V = m/δ, con la masa en las mismas unidades que la densidad.",
      errors: [[mkg / mat.dens, "unidades", "Usaste la masa en kg con una densidad en g/cm³. Pasá a gramos (×1000)."], [mkg * 1000 * mat.dens, "despeje", "Multiplicaste por la densidad. De δ = m/V se despeja V = m/δ."]],
    });
  },
};

export const quiMezclaPorcentaje: Generator = {
  id: "qui-mezcla-porcentaje",
  topicId: "t-qui-sistemas",
  description: "Composición porcentual en masa de una mezcla",
  generate(seed, d) {
    const r = rng(seed);
    const names = r.shuffle(["arena", "sal", "limaduras de hierro", "azufre en polvo"]);
    if (d <= 3) {
      const k = d <= 1 ? 2 : 3;
      const masses = Array.from({ length: k }, () => r.int(2, 30) * (d <= 2 ? 1 : 1.5));
      const tot = masses.reduce((s, x) => s + x, 0);
      const i = r.int(0, k - 1);
      const p = (masses[i] / tot) * 100;
      const other = masses[(i + 1) % k];
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "%", answer: p,
        prompt: `Una mezcla contiene ${masses.map((m, j) => `${n(m)} g de ${names[j]}`).join(", ")}. ¿Qué porcentaje en masa de ${names[i]} tiene?`,
        hints: ["El porcentaje compara una parte con el TOTAL.", "Sumá todas las masas para tener el total.", "% = (masa del componente / masa total) · 100."],
        solution: [`Masa total = ${masses.map((m) => n(m)).join(" + ")} = ${n(tot)} g`, `% ${names[i]} = ${n(masses[i])} / ${n(tot)} · 100`, `= ${s3(p)} %`],
        explanation: "La composición porcentual compara cada componente con la masa total de la mezcla.",
        errors: [[(masses[i] / other) * 100, "conceptual", "Dividiste por la masa de otro componente. El porcentaje se calcula sobre el TOTAL de la mezcla."], [masses[i] / tot, "calculo", "Te faltó multiplicar por 100 para expresarlo como porcentaje."]],
      });
    }
    const tot = r.pick([80, 120, 150, 250, 400]);
    const pa = r.int(10, 40);
    const pb = r.int(10, 40);
    const pc = 100 - pa - pb;
    const m = (tot * pc) / 100;
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "g", answer: m,
      prompt: `${tot} g de una mezcla de ${names[0]}, ${names[1]} y ${names[2]} tienen ${pa} % de ${names[0]} y ${pb} % de ${names[1]} (en masa). ¿Cuántos gramos de ${names[2]} hay?`,
      hints: ["Los porcentajes de todos los componentes suman 100 %.", `% de ${names[2]} = 100 − ${pa} − ${pb}.`, "Masa = porcentaje/100 · masa total."],
      solution: [`% ${names[2]} = 100 − ${pa} − ${pb} = ${pc} %`, `m = ${pc}/100 · ${tot} g = ${s3(m)} g`],
      explanation: "En una mezcla de tres componentes, el tercer porcentaje se obtiene por diferencia a 100 %.",
      errors: [[pc, "interpretacion", "Ese es el porcentaje, no la masa: falta aplicarlo sobre la masa total."], [(tot * (pa + pb)) / 100, "conceptual", "Calculaste la masa de los otros dos componentes juntos."]],
    });
  },
};

// ═══════════════════════════ Unidad 2: Átomo y tabla periódica ═══════════════════════════

const NUCLIDOS: { sym: string; name: string; Z: number; A: number; q: number[] }[] = [
  { sym: "C", name: "carbono", Z: 6, A: 13, q: [0] },
  { sym: "N", name: "nitrógeno", Z: 7, A: 14, q: [0, -3] },
  { sym: "O", name: "oxígeno", Z: 8, A: 18, q: [0, -2] },
  { sym: "Na", name: "sodio", Z: 11, A: 23, q: [0, 1] },
  { sym: "Mg", name: "magnesio", Z: 12, A: 26, q: [0, 2] },
  { sym: "Al", name: "aluminio", Z: 13, A: 27, q: [0, 3] },
  { sym: "S", name: "azufre", Z: 16, A: 34, q: [0, -2] },
  { sym: "Cl", name: "cloro", Z: 17, A: 37, q: [0, -1] },
  { sym: "K", name: "potasio", Z: 19, A: 39, q: [0, 1] },
  { sym: "Ca", name: "calcio", Z: 20, A: 40, q: [0, 2] },
  { sym: "Fe", name: "hierro", Z: 26, A: 56, q: [0, 2, 3] },
  { sym: "Cu", name: "cobre", Z: 29, A: 65, q: [0, 1, 2] },
  { sym: "Zn", name: "zinc", Z: 30, A: 66, q: [0, 2] },
  { sym: "Ag", name: "plata", Z: 47, A: 107, q: [0, 1] },
  { sym: "I", name: "yodo", Z: 53, A: 127, q: [0, -1] },
];

const cargaTxt = (q: number) => (q === 0 ? "" : `^{${Math.abs(q) === 1 ? "" : Math.abs(q)}${q > 0 ? "+" : "-"}}`);

export const quiParticulasSubatomicas: Generator = {
  id: "qui-particulas-subatomicas",
  topicId: "t-qui-atomo",
  description: "Protones, neutrones y electrones de átomos e iones (Z, A, carga)",
  generate(seed, d) {
    const r = rng(seed);
    const nu = r.pick(d <= 2 ? NUCLIDOS : NUCLIDOS.filter((x) => x.q.length > 1));
    const ions = nu.q.filter((q) => q !== 0);
    const q = d <= 2 ? 0 : r.pick(ions);
    const ask: "n" | "e" | "nucleo" = d <= 2 ? r.pick(["n", "e"] as const) : d <= 4 ? r.pick(["n", "e", "e"] as const) : r.pick(["e", "nucleo"] as const);
    const especie = `$${nu.sym}${cargaTxt(q)}$`;
    const neut = nu.A - nu.Z;
    const elec = nu.Z - q;
    const ans = ask === "n" ? neut : ask === "e" ? elec : nu.A;
    const what = ask === "n" ? "neutrones" : ask === "e" ? "electrones" : "partículas en el núcleo (protones + neutrones)";
    const errors: Err[] =
      ask === "n"
        ? [[nu.A, "conceptual", "A es la suma de protones y neutrones. Los neutrones son A − Z."], [nu.A + nu.Z, "calculo", "Sumaste A y Z. Los neutrones son la diferencia: A − Z."], [nu.Z, "conceptual", "Z es el número de protones, no de neutrones."]]
        : ask === "e"
          ? [[nu.Z + q, "signos", "Invertiste el signo de la carga: un catión (+) PERDIÓ electrones (tiene menos que Z) y un anión (−) GANÓ electrones."], [nu.Z, "conceptual", "Z electrones tiene el átomo neutro. Este es un ion: hay que tener en cuenta su carga."], [neut, "conceptual", "Esos son los neutrones (A − Z)."]]
          : [[nu.Z, "conceptual", "En el núcleo están los protones Y los neutrones: eso es A."], [neut, "conceptual", "Te olvidaste de los protones: el núcleo tiene A = Z + N partículas."], [nu.A + elec, "conceptual", "Los electrones no están en el núcleo."]];
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "", mode: "int", answer: ans,
      prompt: `La especie ${especie} del ${nu.name}-${nu.A} tiene Z = ${nu.Z} y A = ${nu.A}${q !== 0 ? ` y carga ${q > 0 ? "+" : "−"}${Math.abs(q)}` : " (átomo neutro)"}. ¿Cuántos **${what}** tiene?`,
      hints: [
        "Z = número de protones. A = protones + neutrones.",
        ask === "e" ? "En un átomo neutro, electrones = protones. La carga indica cuántos electrones se ganaron o perdieron." : "Neutrones = A − Z.",
        ask === "e" ? "Electrones = Z − carga (un +2 tiene 2 electrones menos; un −1, uno más)." : "El núcleo contiene protones y neutrones; los electrones están afuera.",
      ],
      solution:
        ask === "n"
          ? [`N = A − Z = ${nu.A} − ${nu.Z} = ${neut}`]
          : ask === "e"
            ? [`Protones: Z = ${nu.Z}`, q === 0 ? "Átomo neutro: electrones = protones" : `Carga ${q > 0 ? "+" : "−"}${Math.abs(q)}: ${q > 0 ? "perdió" : "ganó"} ${Math.abs(q)} electrón(es)`, `Electrones = ${nu.Z} − (${q}) = ${elec}`]
            : [`Núcleo: Z + N = A = ${nu.A}`],
      explanation: "Z identifica al elemento (protones), A cuenta protones + neutrones y la carga solo cambia la cantidad de electrones.",
      errors,
    });
  },
};

const ISOTOPOS: { el: string; name: string; m1: number; p1: number; m2: number; p2: number }[] = [
  { el: "Cl", name: "cloro", m1: 35, p1: 75.77, m2: 37, p2: 24.23 },
  { el: "Cu", name: "cobre", m1: 63, p1: 69.17, m2: 65, p2: 30.83 },
  { el: "B", name: "boro", m1: 10, p1: 19.9, m2: 11, p2: 80.1 },
  { el: "Li", name: "litio", m1: 6, p1: 7.59, m2: 7, p2: 92.41 },
  { el: "Br", name: "bromo", m1: 79, p1: 50.69, m2: 81, p2: 49.31 },
  { el: "Ga", name: "galio", m1: 69, p1: 60.11, m2: 71, p2: 39.89 },
];

export const quiIsotoposPromedio: Generator = {
  id: "qui-isotopos-promedio",
  topicId: "t-qui-atomo",
  description: "Masa atómica promedio a partir de isótopos y abundancias (y su inversa)",
  generate(seed, d) {
    const r = rng(seed);
    const it = r.pick(ISOTOPOS);
    const prom = (it.m1 * it.p1 + it.m2 * it.p2) / 100;
    if (d <= 3) {
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "u", mode: "dec2", answer: prom,
        prompt: `El ${it.name} natural tiene dos isótopos: ${it.el}-${it.m1} (abundancia ${n(it.p1)} %) y ${it.el}-${it.m2} (${n(it.p2)} %). Tomando como masa de cada isótopo su número másico, ¿cuál es la masa atómica promedio del ${it.name}?`,
        hints: ["No es el promedio simple: el isótopo más abundante pesa más en el resultado.", "Promedio ponderado: cada masa por su fracción de abundancia.", `M = (${it.m1}·${n(it.p1)} + ${it.m2}·${n(it.p2)}) / 100.`],
        solution: [`M = (${it.m1}·${n(it.p1)} + ${it.m2}·${n(it.p2)}) / 100`, `M = ${n(prom, 2)} u`],
        explanation: "La masa atómica de la tabla es un promedio ponderado por la abundancia natural de cada isótopo.",
        errors: [[(it.m1 + it.m2) / 2, "conceptual", "Hiciste el promedio simple. Cada isótopo cuenta según su abundancia: es un promedio ponderado."], [prom * 100, "calculo", "Te faltó dividir por 100 (las abundancias están en porcentaje)."], [(it.m1 * it.p2 + it.m2 * it.p1) / 100, "interpretacion", "Cruzaste las abundancias: cada masa va con SU porcentaje."]],
      });
    }
    const M = Math.round(prom * 100) / 100;
    const x = ((M - it.m2) / (it.m1 - it.m2)) * 100;
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "%", answer: x,
      prompt: `La masa atómica promedio del ${it.name} es ${n(M, 2)} u y tiene dos isótopos, de masas ${it.m1} u y ${it.m2} u. ¿Qué porcentaje de abundancia tiene el isótopo de masa ${it.m1} u?`,
      hints: ["Llamá x a la fracción del isótopo liviano; el otro tiene 1 − x.", `${n(M, 2)} = ${it.m1}·x + ${it.m2}·(1 − x).`, "Despejá x y multiplicá por 100."],
      solution: [`${n(M, 2)} = ${it.m1}x + ${it.m2}(1 − x)`, `${n(M, 2)} − ${it.m2} = (${it.m1} − ${it.m2})x`, `x = ${s3(x / 100)} → ${s3(x)} %`],
      explanation: "Las fracciones de abundancia suman 1, así que con una sola incógnita alcanza para plantear el promedio ponderado.",
      errors: [[100 - x, "interpretacion", "Ese es el porcentaje del OTRO isótopo. Revisá a cuál le pusiste x."], [x / 100, "calculo", "Esa es la fracción; falta pasarla a porcentaje (×100)."]],
    });
  },
};

// Configuración electrónica por la regla de las diagonales (Z ≤ 36).
const SUBNIVELES: [string, number][] = [["1s", 2], ["2s", 2], ["2p", 6], ["3s", 2], ["3p", 6], ["4s", 2], ["3d", 10], ["4p", 6]];
const LINEAL: [string, number][] = [["1s", 2], ["2s", 2], ["2p", 6], ["3s", 2], ["3p", 6], ["3d", 10], ["4s", 2], ["4p", 6]];

function config(Z: number, orden: [string, number][] = SUBNIVELES, cap?: number): string {
  let rest = Z;
  const out: string[] = [];
  for (const [sub, c0] of orden) {
    if (rest <= 0) break;
    const c = cap ?? c0;
    const k = Math.min(c, rest);
    out.push(`${sub}^{${k}}`);
    rest -= k;
  }
  return `$${out.join(" ")}$`;
}

const ELEMENTOS_REP: { sym: string; name: string; Z: number }[] = [
  { sym: "C", name: "carbono", Z: 6 }, { sym: "N", name: "nitrógeno", Z: 7 }, { sym: "O", name: "oxígeno", Z: 8 }, { sym: "F", name: "flúor", Z: 9 },
  { sym: "Na", name: "sodio", Z: 11 }, { sym: "Mg", name: "magnesio", Z: 12 }, { sym: "Al", name: "aluminio", Z: 13 }, { sym: "Si", name: "silicio", Z: 14 },
  { sym: "P", name: "fósforo", Z: 15 }, { sym: "S", name: "azufre", Z: 16 }, { sym: "Cl", name: "cloro", Z: 17 }, { sym: "Ar", name: "argón", Z: 18 },
  { sym: "K", name: "potasio", Z: 19 }, { sym: "Ca", name: "calcio", Z: 20 }, { sym: "Ga", name: "galio", Z: 31 }, { sym: "Ge", name: "germanio", Z: 32 },
  { sym: "As", name: "arsénico", Z: 33 }, { sym: "Se", name: "selenio", Z: 34 }, { sym: "Br", name: "bromo", Z: 35 }, { sym: "Kr", name: "kriptón", Z: 36 },
];

/** Período y grupo (IUPAC 1–18) de un elemento representativo. */
function periodoGrupo(Z: number): { periodo: number; grupo: number; valencia: number } {
  let rest = Z;
  let periodo = 0;
  let s = 0;
  let p = 0;
  for (const [sub, c] of SUBNIVELES) {
    if (rest <= 0) break;
    const k = Math.min(c, rest);
    const nn = Number(sub[0]);
    if (sub[1] !== "d" && nn > periodo) {
      periodo = nn;
      s = 0;
      p = 0;
    }
    if (sub[1] === "s" && nn === periodo) s = k;
    if (sub[1] === "p" && nn === periodo) p = k;
    rest -= k;
  }
  const valencia = s + p;
  const grupo = p === 0 ? s : 12 + p;
  return { periodo, grupo, valencia };
}

export const quiConfiguracionElectronica: Generator = {
  id: "qui-configuracion-electronica",
  topicId: "t-qui-tabla",
  description: "Configuración electrónica (regla de las diagonales) y ubicación en la tabla",
  generate(seed, d) {
    const r = rng(seed);
    const pool = d <= 2 ? ELEMENTOS_REP.filter((e) => e.Z <= 18) : ELEMENTOS_REP;
    const el = r.pick(pool);
    const askUbic = d >= 4 && r.bool();
    if (!askUbic) {
      const correct = config(el.Z);
      const opts = [
        { text: correct, correct: true },
        { text: config(el.Z - 1), error: { type: "calculo" as ErrorType, message: `Te falta un electrón: un átomo neutro tiene tantos electrones como protones (Z = ${el.Z}).` } },
        ...(el.Z <= 16 ? [{ text: config(el.Z, SUBNIVELES, 2), error: { type: "conceptual" as ErrorType, message: "Pusiste 2 electrones en cada subnivel. Capacidades: s → 2, p → 6, d → 10." } }] : []),
        ...(el.Z > 18 ? [{ text: config(el.Z, LINEAL), error: { type: "conceptual" as ErrorType, message: "Llenaste 3d antes que 4s. Por la regla de las diagonales, 4s tiene menor energía y se llena primero." } }] : [{ text: config(el.Z + 1), error: { type: "calculo" as ErrorType, message: `Pusiste un electrón de más: el átomo neutro tiene Z = ${el.Z} electrones.` } }]),
      ];
      return choice(
        r,
        cbase(this.id, seed, d, this.topicId, `¿Cuál es la configuración electrónica del ${el.name} ($${el.sym}$, Z = ${el.Z}) en estado fundamental?`, [
          "El átomo neutro tiene Z electrones: la suma de los exponentes tiene que dar Z.",
          "Capacidades: s → 2, p → 6, d → 10.",
          "Orden de llenado (diagonales): 1s 2s 2p 3s 3p 4s 3d 4p…",
        ], [`Repartimos ${el.Z} electrones siguiendo 1s 2s 2p 3s 3p 4s 3d 4p: ${correct}.`], "Se llenan los subniveles de menor a mayor energía (regla de las diagonales), respetando su capacidad máxima."),
        opts,
      );
    }
    const { periodo, grupo, valencia } = periodoGrupo(el.Z);
    const ok = `Período ${periodo}, grupo ${grupo}`;
    const opts = [
      { text: ok, correct: true },
      { text: `Período ${grupo}, grupo ${periodo}`, error: { type: "interpretacion" as ErrorType, message: "Intercambiaste período y grupo. El período es el nivel más alto ocupado; el grupo sale de los electrones de valencia." } },
      ...(grupo >= 13 ? [{ text: `Período ${periodo}, grupo ${valencia}`, error: { type: "conceptual" as ErrorType, message: `Con la numeración IUPAC (1 a 18), los elementos del bloque p están en el grupo 10 + electrones de valencia: ${grupo}.` } }] : []),
      { text: `Período ${periodo + 1}, grupo ${grupo}`, error: { type: "conceptual" as ErrorType, message: "El período es el número cuántico principal MÁS ALTO que aparece en la configuración." } },
    ];
    return choice(
      r,
      cbase(this.id, seed, d, this.topicId, `El ${el.name} tiene configuración ${config(el.Z)}. ¿En qué período y grupo (numeración 1–18) de la tabla periódica está?`, [
        "El período es el nivel de energía más alto que tiene electrones.",
        "Contá los electrones del último nivel (s + p): son los de valencia.",
        "Bloque s: grupo = electrones de valencia. Bloque p: grupo = 10 + electrones de valencia.",
      ], [`Nivel más alto: ${periodo} → período ${periodo}.`, `Electrones de valencia: ${valencia} → grupo ${grupo}.`], "La configuración electrónica determina la posición en la tabla: el último nivel da el período y los electrones de valencia, el grupo."),
      opts,
    );
  },
};

// Tendencias periódicas (comparaciones dentro de un mismo grupo o período, sin casos anómalos).
const TP: Record<string, { name: string; per: number; grp: number }> = {
  Li: { name: "litio", per: 2, grp: 1 }, Be: { name: "berilio", per: 2, grp: 2 }, C: { name: "carbono", per: 2, grp: 14 }, N: { name: "nitrógeno", per: 2, grp: 15 }, O: { name: "oxígeno", per: 2, grp: 16 }, F: { name: "flúor", per: 2, grp: 17 },
  Na: { name: "sodio", per: 3, grp: 1 }, Mg: { name: "magnesio", per: 3, grp: 2 }, Si: { name: "silicio", per: 3, grp: 14 }, P: { name: "fósforo", per: 3, grp: 15 }, S: { name: "azufre", per: 3, grp: 16 }, Cl: { name: "cloro", per: 3, grp: 17 },
  K: { name: "potasio", per: 4, grp: 1 }, Ca: { name: "calcio", per: 4, grp: 2 }, Br: { name: "bromo", per: 4, grp: 17 },
  Rb: { name: "rubidio", per: 5, grp: 1 }, I: { name: "yodo", per: 5, grp: 17 }, Cs: { name: "cesio", per: 6, grp: 1 },
};

const GRUPOS_TP: string[][] = [["Li", "Na", "K", "Cs"], ["Be", "Mg", "Ca"], ["F", "Cl", "Br", "I"]];
const PERIODOS_TP: string[][] = [["Li", "Be", "C", "F"], ["Na", "Mg", "Si", "Cl"], ["K", "Ca", "Br"]];

type Prop = "radio" | "en" | "ei" | "metal";
const PROP_TXT: Record<Prop, string> = {
  radio: "mayor radio atómico",
  en: "mayor electronegatividad",
  ei: "mayor energía de ionización",
  metal: "mayor carácter metálico",
};

export const quiTendenciasPeriodicas: Generator = {
  id: "qui-tendencias-periodicas",
  topicId: "t-qui-tabla",
  description: "Tendencias periódicas: radio, electronegatividad, energía de ionización, carácter metálico",
  generate(seed, d) {
    const r = rng(seed);
    const mismoGrupo = r.bool();
    const fam = r.pick(mismoGrupo ? GRUPOS_TP : PERIODOS_TP);
    const k = d <= 3 ? 2 : Math.min(3, fam.length);
    const els = r.shuffle(fam).slice(0, k);
    const prop = r.pick(["radio", "en", "ei", "metal"] as Prop[]);
    // Valor de «posición»: crece hacia abajo (grupo) o hacia la derecha (período).
    const pos = (s: string) => (mismoGrupo ? TP[s].per : TP[s].grp);
    // radio y carácter metálico crecen hacia abajo y hacia la izquierda; EN y EI al revés.
    const crece = (prop === "radio" || prop === "metal") === mismoGrupo;
    const sorted = [...els].sort((a, b) => pos(a) - pos(b));
    const best = crece ? sorted[sorted.length - 1] : sorted[0];
    const worst = crece ? sorted[0] : sorted[sorted.length - 1];
    const lista = els.map((s) => `${TP[s].name} ($${s}$)`).join(", ");
    const dir = mismoGrupo ? "Están en el mismo grupo" : "Están en el mismo período";
    const regla =
      prop === "radio" || prop === "metal"
        ? "aumenta hacia abajo en un grupo y hacia la izquierda en un período"
        : "aumenta hacia arriba en un grupo y hacia la derecha en un período";
    const opts = els.map((s) =>
      s === best
        ? { text: `${TP[s].name} ($${s}$)`, correct: true }
        : {
            text: `${TP[s].name} ($${s}$)`,
            error: {
              type: "conceptual" as ErrorType,
              message: s === worst ? `Invertiste la tendencia: ${PROP_TXT[prop].replace("mayor ", "")} ${regla}.` : `Está en el medio de la serie. ${PROP_TXT[prop].replace("mayor ", "")} ${regla}: buscá el extremo.`,
            },
          },
    );
    return choice(
      r,
      cbase(this.id, seed, d, this.topicId, `Entre ${lista}, ¿cuál tiene **${PROP_TXT[prop]}**?`, [
        "Ubicá cada elemento en la tabla: ¿comparten grupo (columna) o período (fila)?",
        mismoGrupo ? "Bajando en un grupo se agregan niveles: los electrones externos quedan más lejos del núcleo." : "Avanzando en un período aumenta la carga nuclear con el mismo número de niveles: los electrones quedan más atraídos.",
        `${PROP_TXT[prop].replace("mayor ", "").replace(/^./, (c) => c.toUpperCase())} ${regla}.`,
      ], [`${dir}.`, `${PROP_TXT[prop].replace("mayor ", "").replace(/^./, (c) => c.toUpperCase())} ${regla}.`, `→ ${TP[best].name}.`], "Radio y carácter metálico crecen hacia abajo y a la izquierda; electronegatividad y energía de ionización, hacia arriba y a la derecha."),
      opts,
    );
  },
};

// ═══════════════════════════ Unidad 3: Uniones y nomenclatura ═══════════════════════════

type Union = "ionica" | "polar" | "nopolar" | "metalica";
const UNION_TXT: Record<Union, string> = {
  ionica: "Iónica",
  polar: "Covalente polar",
  nopolar: "Covalente no polar",
  metalica: "Metálica",
};

const UNIONES: { f: string; a: [string, number]; b?: [string, number]; t: Union; hard?: boolean; note?: string }[] = [
  { f: "NaCl", a: ["Na", 0.93], b: ["Cl", 3.16], t: "ionica" },
  { f: "KCl", a: ["K", 0.82], b: ["Cl", 3.16], t: "ionica" },
  { f: "MgO", a: ["Mg", 1.31], b: ["O", 3.44], t: "ionica" },
  { f: "CaO", a: ["Ca", 1.0], b: ["O", 3.44], t: "ionica" },
  { f: "LiF", a: ["Li", 0.98], b: ["F", 3.98], t: "ionica" },
  { f: "HCl", a: ["H", 2.2], b: ["Cl", 3.16], t: "polar" },
  { f: "H_2O", a: ["H", 2.2], b: ["O", 3.44], t: "polar" },
  { f: "NH_3", a: ["H", 2.2], b: ["N", 3.04], t: "polar" },
  { f: "Cl_2", a: ["Cl", 3.16], b: ["Cl", 3.16], t: "nopolar" },
  { f: "O_2", a: ["O", 3.44], b: ["O", 3.44], t: "nopolar" },
  { f: "N_2", a: ["N", 3.04], b: ["N", 3.04], t: "nopolar" },
  { f: "Cu", a: ["Cu", 1.9], t: "metalica" },
  { f: "Fe", a: ["Fe", 1.83], t: "metalica" },
  { f: "CH_4", a: ["C", 2.55], b: ["H", 2.2], t: "nopolar", hard: true, note: "ΔEN = 0,35 < 0,4: los enlaces C–H se consideran no polares." },
  { f: "CO_2", a: ["C", 2.55], b: ["O", 3.44], t: "polar", hard: true, note: "Cada enlace C=O es polar (ΔEN = 0,89), aunque la MOLÉCULA sea no polar por su simetría: no confundas enlace con molécula." },
  { f: "PCl_3", a: ["P", 2.19], b: ["Cl", 3.16], t: "polar", hard: true },
];

function unionMsg(w: Union, ok: Union): string {
  if (w === "ionica") return "Para unión iónica la diferencia de electronegatividad tiene que ser grande (≥ 1,7, típico de metal + no metal). Acá no lo es.";
  if (w === "metalica") return "La unión metálica es entre átomos de metales. Acá hay no metales.";
  if (w === "nopolar") return ok === "polar" ? "Los átomos son distintos y ΔEN ≥ 0,4: el par de electrones queda corrido hacia el más electronegativo → polar." : "La diferencia de electronegatividad es grande: los electrones se transfieren (iónica), no se comparten por igual.";
  return ok === "nopolar" ? "Si ΔEN < 0,4 (o los átomos son iguales), los electrones se comparten de forma pareja: no polar." : ok === "metalica" ? "Entre átomos de un metal no hay enlaces covalentes localizados: es unión metálica." : "Con ΔEN ≥ 1,7 (metal + no metal) los electrones se transfieren: unión iónica.";
}

export const quiTipoUnion: Generator = {
  id: "qui-tipo-union",
  topicId: "t-qui-uniones",
  description: "Tipo de unión química según la diferencia de electronegatividad",
  generate(seed, d) {
    const r = rng(seed);
    const pool = d <= 3 ? UNIONES.filter((u) => !u.hard) : UNIONES;
    const u = pool[(seed * 5 + d * 3) % pool.length];
    const dEN = u.b ? Math.abs(u.a[1] - u.b[1]) : 0;
    const datos = u.b ? `Electronegatividades (Pauling): ${u.a[0]} = ${n(u.a[1])}${u.a[0] !== u.b[0] ? `; ${u.b[0]} = ${n(u.b[1])}` : ""}.` : `El ${u.a[0]} es un metal.`;
    const why = u.b ? `ΔEN = ${n(dEN, 2)} → ${UNION_TXT[u.t].toLowerCase()}.${u.note ? " " + u.note : ""}` : `Átomos de un mismo metal: unión metálica.`;
    return choice(
      r,
      cbase(this.id, seed, d, this.topicId, `¿Qué tipo de unión hay entre los átomos de $${u.f}$? ${datos} Criterio orientativo: ΔEN ≥ 1,7 iónica; 0,4 ≤ ΔEN < 1,7 covalente polar; ΔEN < 0,4 covalente no polar; metal–metal, metálica.`, [
        "¿Son metales, no metales o una combinación?",
        "Calculá la diferencia de electronegatividad entre los átomos unidos.",
        "Ubicá ΔEN en el criterio del enunciado.",
      ], [why], why),
      (Object.keys(UNION_TXT) as Union[]).map((t) => (t === u.t ? { text: UNION_TXT[t], correct: true } : { text: UNION_TXT[t], error: { type: "conceptual" as ErrorType, message: unionMsg(t, u.t) } })),
    );
  },
};

const OXID: { f: string; name: string; c: string; nc: number; others: [string, number, number][]; q: number; hard?: boolean }[] = [
  { f: "H_2SO_4", name: "ácido sulfúrico", c: "S", nc: 1, others: [["H", 2, 1], ["O", 4, -2]], q: 0 },
  { f: "SO_2", name: "dióxido de azufre", c: "S", nc: 1, others: [["O", 2, -2]], q: 0 },
  { f: "H_2S", name: "sulfuro de hidrógeno", c: "S", nc: 1, others: [["H", 2, 1]], q: 0 },
  { f: "HNO_3", name: "ácido nítrico", c: "N", nc: 1, others: [["H", 1, 1], ["O", 3, -2]], q: 0 },
  { f: "HNO_2", name: "ácido nitroso", c: "N", nc: 1, others: [["H", 1, 1], ["O", 2, -2]], q: 0 },
  { f: "NH_3", name: "amoníaco", c: "N", nc: 1, others: [["H", 3, 1]], q: 0 },
  { f: "Fe_2O_3", name: "óxido de hierro", c: "Fe", nc: 2, others: [["O", 3, -2]], q: 0 },
  { f: "H_3PO_4", name: "ácido fosfórico", c: "P", nc: 1, others: [["H", 3, 1], ["O", 4, -2]], q: 0 },
  { f: "HClO_4", name: "ácido perclórico", c: "Cl", nc: 1, others: [["H", 1, 1], ["O", 4, -2]], q: 0 },
  { f: "HClO", name: "ácido hipocloroso", c: "Cl", nc: 1, others: [["H", 1, 1], ["O", 1, -2]], q: 0 },
  { f: "CO", name: "monóxido de carbono", c: "C", nc: 1, others: [["O", 1, -2]], q: 0 },
  { f: "CH_4", name: "metano", c: "C", nc: 1, others: [["H", 4, 1]], q: 0 },
  { f: "KMnO_4", name: "permanganato de potasio", c: "Mn", nc: 1, others: [["K", 1, 1], ["O", 4, -2]], q: 0, hard: true },
  { f: "K_2Cr_2O_7", name: "dicromato de potasio", c: "Cr", nc: 2, others: [["K", 2, 1], ["O", 7, -2]], q: 0, hard: true },
  { f: "SO_4^{2-}", name: "ion sulfato", c: "S", nc: 1, others: [["O", 4, -2]], q: -2, hard: true },
  { f: "NO_3^{-}", name: "ion nitrato", c: "N", nc: 1, others: [["O", 3, -2]], q: -1, hard: true },
  { f: "NH_4^{+}", name: "ion amonio", c: "N", nc: 1, others: [["H", 4, 1]], q: 1, hard: true },
  { f: "Cr_2O_7^{2-}", name: "ion dicromato", c: "Cr", nc: 2, others: [["O", 7, -2]], q: -2, hard: true },
  { f: "PO_4^{3-}", name: "ion fosfato", c: "P", nc: 1, others: [["O", 4, -2]], q: -3, hard: true },
  { f: "Na_2SO_3", name: "sulfito de sodio", c: "S", nc: 1, others: [["Na", 2, 1], ["O", 3, -2]], q: 0, hard: true },
];

export const quiNumeroOxidacion: Generator = {
  id: "qui-numero-oxidacion",
  topicId: "t-qui-nomenclatura",
  description: "Número de oxidación de un elemento en un compuesto o ion",
  generate(seed, d) {
    const r = rng(seed);
    const pool = d <= 2 ? OXID.filter((o) => !o.hard) : d >= 5 ? OXID.filter((o) => o.hard) : OXID;
    const o = r.pick(pool);
    const sumOthers = o.others.reduce((s, [, k, ox]) => s + k * ox, 0);
    const x = (o.q - sumOthers) / o.nc;
    const noSub = (o.q - o.others.reduce((s, [, , ox]) => s + ox, 0)) / o.nc;
    const noCharge = (0 - sumOthers) / o.nc;
    const errors: Err[] = [
      [noSub, "conceptual", "Te olvidaste de multiplicar por los subíndices: cada átomo de O aporta −2 (4 oxígenos aportan −8)."],
      [-x, "signos", "Te quedó el signo invertido: la suma de todos los números de oxidación tiene que dar la carga total."],
      ...(o.q !== 0 ? [[noCharge, "conceptual", `Es un ion: la suma de los números de oxidación es igual a su carga (${o.q}), no a cero.`] as Err] : []),
      ...(o.nc > 1 ? [[o.q - sumOthers, "calculo", `Hay ${o.nc} átomos de ${o.c}: dividí el total entre ${o.nc}.`] as Err] : []),
    ];
    const plantea = `${o.nc > 1 ? o.nc : ""}x ${o.others.map(([el, k, ox]) => `+ ${k}·(${ox > 0 ? "+" : ""}${ox})`).join(" ")} = ${o.q}`;
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "", mode: "int", answer: x,
      prompt: `¿Cuál es el número de oxidación del **${o.c}** en $${o.f}$ (${o.name})? Usá H = +1, O = −2 y metales alcalinos = +1. Escribilo con su signo.`,
      hints: [
        o.q === 0 ? "En un compuesto neutro, la suma de los números de oxidación es 0." : `En un ion, la suma de los números de oxidación es igual a la carga (${o.q}).`,
        "Multiplicá el número de oxidación de cada elemento por su subíndice.",
        `Planteá: ${plantea} y despejá x.`,
      ],
      solution: [plantea, `x = ${x > 0 ? "+" : ""}${x}`],
      explanation: "La suma de los números de oxidación (cada uno por su subíndice) es igual a la carga total de la especie.",
      errors,
    });
  },
};

const CATIONES: { s: string; name: string; q: number; poly?: boolean }[] = [
  { s: "Na", name: "sodio", q: 1 }, { s: "K", name: "potasio", q: 1 }, { s: "Ca", name: "calcio", q: 2 }, { s: "Mg", name: "magnesio", q: 2 },
  { s: "Al", name: "aluminio", q: 3 }, { s: "Fe", name: "hierro(III)", q: 3 }, { s: "Fe", name: "hierro(II)", q: 2 }, { s: "NH_4", name: "amonio", q: 1, poly: true },
];
const ANIONES: { s: string; name: string; q: number; poly?: boolean }[] = [
  { s: "Cl", name: "cloruro", q: 1 }, { s: "O", name: "óxido", q: 2 }, { s: "S", name: "sulfuro", q: 2 }, { s: "SO_4", name: "sulfato", q: 2, poly: true },
  { s: "NO_3", name: "nitrato", q: 1, poly: true }, { s: "PO_4", name: "fosfato", q: 3, poly: true }, { s: "OH", name: "hidróxido", q: 1, poly: true }, { s: "CO_3", name: "carbonato", q: 2, poly: true },
];

const gcdI = (a: number, b: number): number => (b === 0 ? a : gcdI(b, a % b));

function parte(s: string, poly: boolean | undefined, k: number, paren = true): string {
  if (k === 1) return s;
  if (poly && paren) return `(${s})_${k}`;
  // Sin paréntesis (error típico): el subíndice queda pegado al último átomo, p. ej. NO₃₃.
  return /_\d+$/.test(s) ? s.replace(/_(\d+)$/, `_{$1${k}}`) : `${s}_${k}`;
}

function formula(c: (typeof CATIONES)[number], a: (typeof ANIONES)[number], kc: number, ka: number, paren = true): string {
  return `$${parte(c.s, c.poly, kc, paren)}${parte(a.s, a.poly, ka, paren)}$`;
}

export const quiFormulaCompuesto: Generator = {
  id: "qui-formula-compuesto",
  topicId: "t-qui-nomenclatura",
  description: "Fórmula de un compuesto iónico a partir de sus iones (y su nombre)",
  generate(seed, d) {
    const r = rng(seed);
    const pares: [(typeof CATIONES)[number], (typeof ANIONES)[number]][] = [];
    for (const c0 of CATIONES)
      for (const a0 of ANIONES) {
        if (c0.q === a0.q) continue;
        if (c0.s === "NH_4" && (a0.s === "O" || a0.s === "OH" || a0.s === "S")) continue;
        const poly = c0.poly || a0.poly;
        if (d <= 2 ? poly : d >= 5 ? !poly : false) continue;
        pares.push([c0, a0]);
      }
    const [c, a] = r.pick(pares);
    const g = gcdI(c.q, a.q);
    const kc = a.q / g;
    const ka = c.q / g;
    const ok = formula(c, a, kc, ka);
    const sup = (q: number, neg: boolean) => `^{${q === 1 ? "" : q}${neg ? "-" : "+"}}`;
    const opts = [
      { text: ok, correct: true },
      { text: formula(c, a, 1, 1), error: { type: "conceptual" as ErrorType, message: "Así las cargas no se compensan. El compuesto tiene que ser neutro: (carga del catión)·(cantidad) = (carga del anión)·(cantidad)." } },
      { text: formula(c, a, ka, kc), error: { type: "formula" as ErrorType, message: "Cruzaste mal: la carga del ANIÓN es el subíndice del CATIÓN y viceversa." } },
      ...(g > 1 ? [{ text: formula(c, a, a.q, c.q), error: { type: "fracciones" as ErrorType, message: "Las fórmulas de compuestos iónicos se escriben con la menor relación entera: simplificá los subíndices." } }] : []),
      ...((a.poly && ka > 1) || (c.poly && kc > 1) ? [{ text: formula(c, a, kc, ka, false), error: { type: "sintaxis" as ErrorType, message: "Falta el paréntesis: el subíndice afecta a TODO el ion poliatómico, no solo al último átomo." } }] : []),
    ];
    const nombre = `${a.name} de ${c.name}`;
    return choice(
      r,
      cbase(this.id, seed, d, this.topicId, `¿Cuál es la fórmula del **${nombre}**? Iones: $${c.s}${sup(c.q, false)}$ y $${a.s}${sup(a.q, true)}$.`, [
        "El compuesto tiene que ser eléctricamente neutro.",
        "Buscá cuántos de cada ion hacen falta para que las cargas positivas y negativas se compensen.",
        "Truco: la carga de uno pasa como subíndice del otro; después simplificá. Si el ion es poliatómico, va entre paréntesis.",
      ], [`Cargas: +${c.q} y −${a.q}.`, `${kc} · (+${c.q}) + ${ka} · (−${a.q}) = 0`, `Fórmula: ${ok}`], "En un compuesto iónico la carga total es cero; los subíndices indican la menor relación entera de iones que lo logra."),
      opts,
    );
  },
};

// ═══════════════════════════ Unidad 4: Geometría y fuerzas intermoleculares ═══════════════════════════

const MOLECULAS: { f: string; geom: string; polar: boolean; lp: number; elec?: string; naive?: string; alt?: string }[] = [
  { f: "CO_2", geom: "lineal", polar: false, lp: 0, alt: "angular" },
  { f: "H_2O", geom: "angular", polar: true, lp: 2, elec: "tetraédrica", naive: "lineal" },
  { f: "NH_3", geom: "piramidal", polar: true, lp: 1, elec: "tetraédrica", naive: "trigonal plana" },
  { f: "CH_4", geom: "tetraédrica", polar: false, lp: 0, alt: "plana cuadrada" },
  { f: "BF_3", geom: "trigonal plana", polar: false, lp: 0, alt: "piramidal" },
  { f: "CCl_4", geom: "tetraédrica", polar: false, lp: 0, alt: "plana cuadrada" },
  { f: "CHCl_3", geom: "tetraédrica", polar: true, lp: 0, alt: "plana cuadrada" },
  { f: "SO_2", geom: "angular", polar: true, lp: 1, elec: "trigonal plana", naive: "lineal" },
  { f: "H_2S", geom: "angular", polar: true, lp: 2, elec: "tetraédrica", naive: "lineal" },
  { f: "PCl_3", geom: "piramidal", polar: true, lp: 1, elec: "tetraédrica", naive: "trigonal plana" },
  { f: "HCN", geom: "lineal", polar: true, lp: 0, alt: "angular" },
  { f: "BeCl_2", geom: "lineal", polar: false, lp: 0, alt: "angular" },
];

const polTxt = (p: boolean) => (p ? "polar" : "no polar");

export const quiGeometriaPolaridad: Generator = {
  id: "qui-geometria-polaridad",
  topicId: "t-qui-fuerzas",
  description: "Geometría molecular (TRePEV) y polaridad de la molécula",
  generate(seed, d) {
    const r = rng(seed);
    const m = MOLECULAS[(seed * 3 + d) % MOLECULAS.length];
    const ok = `${m.geom}, ${polTxt(m.polar)}`;
    const opts = [
      { text: ok, correct: true },
      { text: `${m.geom}, ${polTxt(!m.polar)}`, error: { type: "conceptual" as ErrorType, message: m.polar ? "La molécula no es simétrica (o tiene átomos distintos alrededor del central): los dipolos de enlace NO se cancelan → polar." : "Los enlaces son polares, pero la geometría es simétrica y los dipolos se cancelan: la molécula es no polar." } },
      ...(m.lp > 0
        ? [
            { text: `${m.elec}, ${polTxt(m.polar)}`, error: { type: "conceptual" as ErrorType, message: `Esa es la geometría ELECTRÓNICA (cuenta los pares libres). La geometría molecular describe solo la posición de los átomos: ${m.geom}.` } },
            { text: `${m.naive}, no polar`, error: { type: "conceptual" as ErrorType, message: `Ignoraste los ${m.lp} par(es) libre(s) del átomo central: también repelen y doblan la molécula.` } },
          ]
        : [{ text: `${m.alt}, ${polTxt(m.polar)}`, error: { type: "conceptual" as ErrorType, message: "El átomo central no tiene pares libres: los pares enlazantes se ubican lo más lejos posible entre sí." } }]),
    ];
    return choice(
      r,
      cbase(this.id, seed, d, this.topicId, `Según la TRePEV, ¿qué geometría molecular tiene $${m.f}$ y es polar o no polar?${d >= 4 ? "" : ` (El átomo central ${m.lp === 0 ? "no tiene pares libres" : `tiene ${m.lp} par(es) de electrones libres`}.)`}`, [
        "Dibujá la estructura de Lewis y contá las zonas de electrones alrededor del átomo central.",
        "Los pares libres también ocupan lugar, pero la geometría MOLECULAR solo nombra la posición de los átomos.",
        "Polar si los dipolos de enlace no se cancelan (molécula asimétrica o átomos distintos alrededor).",
      ], [`Pares libres en el central: ${m.lp}.`, `Geometría molecular: ${m.geom}.`, `Dipolos ${m.polar ? "no se cancelan → polar" : "se cancelan → no polar"}.`], "La TRePEV ubica los pares de electrones del átomo central lo más lejos posible; la polaridad depende de la geometría y de la polaridad de los enlaces."),
      opts,
    );
  },
};

const EBULLICION: Concept[] = [
  {
    q: "¿Cuál tiene mayor punto de ebullición: $H_2O$ (18 g/mol) o $H_2S$ (34 g/mol)?",
    ok: "$H_2O$, porque forma puentes de hidrógeno",
    bad: [["$H_2S$, porque tiene mayor masa molar", "conceptual", "Mayor masa da fuerzas de London más intensas, pero los puentes de hidrógeno del agua son mucho más fuertes."], ["Ambos igual: son moléculas angulares parecidas", "conceptual", "La forma es parecida, pero solo el agua tiene H unido a un átomo muy electronegativo (O) → puentes de H."]],
    why: "El agua forma puentes de hidrógeno (H unido a O); el H₂S solo tiene dipolo-dipolo y London. Por eso el agua hierve a 100 °C y el H₂S a unos −60 °C.",
  },
  {
    q: "¿Cuál tiene mayor punto de ebullición: $F_2$, $Cl_2$ o $Br_2$?",
    ok: "$Br_2$, por fuerzas de London más intensas (más electrones)",
    bad: [["$F_2$, porque el flúor es el más electronegativo", "conceptual", "En una molécula de dos átomos iguales no hay dipolo: la electronegatividad no genera atracción entre moléculas. Mandan las fuerzas de London."], ["Los tres igual: son todas moléculas no polares", "conceptual", "Las tres son no polares, pero las fuerzas de London crecen con el tamaño de la nube electrónica."]],
    why: "Son no polares: solo hay fuerzas de London, que aumentan con la cantidad de electrones (y la masa). El Br₂ es incluso líquido a temperatura ambiente.",
  },
  {
    q: "¿Cuál tiene mayor punto de ebullición: $NH_3$ o $CH_4$ (masas molares parecidas)?",
    ok: "$NH_3$, por puentes de hidrógeno",
    bad: [["$CH_4$, porque tiene más átomos de H", "conceptual", "Tener muchos H no alcanza: para puente de H el H tiene que estar unido a N, O o F."], ["Ninguno: los dos son gases, hierven igual", "conceptual", "Ser gas a temperatura ambiente no significa hervir a la misma temperatura: NH₃ hierve a −33 °C y CH₄ a −162 °C."]],
    why: "En el NH₃ el H está unido a N, entonces hay puentes de hidrógeno. El CH₄ es no polar: solo London.",
  },
  {
    q: "Etanol ($C_2H_5OH$) y dimetiléter ($CH_3OCH_3$) tienen la misma fórmula molecular. ¿Cuál hierve a mayor temperatura?",
    ok: "El etanol, porque tiene un grupo O–H que forma puentes de hidrógeno",
    bad: [["Igual: tienen la misma masa molar", "conceptual", "Misma masa, pero distintas fuerzas intermoleculares: solo el etanol tiene H unido a O."], ["El dimetiléter, porque tiene dos grupos CH₃", "conceptual", "Los CH₃ solo aportan fuerzas de London. El O–H del etanol permite puentes de hidrógeno, mucho más intensos."]],
    why: "El etanol (hierve a 78 °C) forma puentes de H por su O–H; el éter (−24 °C) no tiene H unido a O.",
  },
  {
    q: "$HCl$ (36,5 g/mol) y $F_2$ (38 g/mol) tienen masas parecidas. ¿Cuál hierve a mayor temperatura?",
    ok: "$HCl$, porque es polar y suma fuerzas dipolo-dipolo",
    bad: [["$F_2$, porque tiene un poco más de masa", "conceptual", "Con masas tan parecidas las fuerzas de London son similares; lo que decide es que el HCl además es polar."], ["$HCl$, por puentes de hidrógeno", "conceptual", "El Cl no es lo suficientemente pequeño y electronegativo: los puentes de H se forman con H unido a N, O o F."]],
    why: "Con London parecidas, el HCl agrega interacciones dipolo-dipolo por ser polar.",
  },
  {
    q: "¿Cuál tiene mayor punto de ebullición: metano ($CH_4$), etano ($C_2H_6$) o butano ($C_4H_{10}$)?",
    ok: "Butano, porque las fuerzas de London crecen con el tamaño de la molécula",
    bad: [["Metano, porque es la molécula más simple", "conceptual", "Una molécula más chica tiene MENOS superficie y electrones: London más débil, hierve antes."], ["Los tres igual: son hidrocarburos no polares", "conceptual", "Son todos no polares, pero London depende del tamaño: a mayor cadena, mayor punto de ebullición."]],
    why: "En hidrocarburos no polares solo actúan las fuerzas de London, que aumentan con la cantidad de electrones y la superficie de contacto.",
  },
  {
    q: "¿Por qué el $NaCl$ funde a 801 °C y el $HCl$ ya es gas a temperatura ambiente?",
    ok: "Porque el NaCl es una red iónica: hay que romper uniones iónicas, mucho más fuertes que las fuerzas entre moléculas de HCl",
    bad: [["Porque el NaCl tiene puentes de hidrógeno", "conceptual", "El NaCl no tiene H. Es un sólido iónico: lo mantienen unido las atracciones entre iones."], ["Porque el NaCl tiene mayor masa molar", "conceptual", "La masa influye en London, pero acá la diferencia es de TIPO de unión: red iónica vs moléculas."]],
    why: "Fundir NaCl exige vencer atracciones electrostáticas entre iones en toda la red; separar moléculas de HCl solo exige vencer fuerzas intermoleculares.",
  },
];

export const quiFuerzasEbullicion: Generator = {
  id: "qui-fuerzas-ebullicion",
  topicId: "t-qui-fuerzas",
  description: "Fuerzas intermoleculares y punto de ebullición",
  generate(seed, d) {
    const r = rng(seed);
    const c = EBULLICION[(seed + d) % EBULLICION.length];
    return conceptChoice(r, this.id, seed, d, this.topicId, c, [
      "Identificá qué fuerzas intermoleculares tiene cada sustancia.",
      "Orden de intensidad: puente de H > dipolo-dipolo > London (a masas parecidas).",
      "Puente de H: H unido a N, O o F. London: crece con el tamaño de la molécula.",
    ]);
  },
};

// ═══════════════════════════ Unidad 5: Magnitudes atómico-moleculares ═══════════════════════════

const MM_FACIL = ["H2O", "CO2", "NH3", "CH4", "NaCl", "HCl", "NaOH", "CaO", "MgO", "KCl"];
const MM_MEDIO = ["H2SO4", "CaCO3", "HNO3", "C6H12O6", "C2H6O", "Na2SO4", "NaHCO3", "CuSO4", "Fe2O3", "AlCl3", "C3H8"];
const MM_PAREN = ["CaOH2", "MgNO32", "Al2SO43", "Ca3PO42"];

const sumaUno = (c: Comp) => Object.keys(c).reduce((s, el) => s + MASAS[el], 0);
const sumaZ = (c: Comp) => Object.entries(c).reduce((s, [el, k]) => s + ZETA[el] * k, 0);

export const quiMasaMolar: Generator = {
  id: "qui-masa-molar",
  topicId: "t-qui-masa-molar",
  description: "Masa molar de un compuesto (con subíndices y paréntesis)",
  generate(seed, d) {
    const r = rng(seed);
    const key = r.pick(d <= 2 ? MM_FACIL : d <= 4 ? MM_MEDIO : [...MM_PAREN, ...MM_MEDIO.slice(0, 4)]);
    const sp = SP[key];
    const M = mm(sp.comp);
    const errors: Err[] = [
      [sumaUno(sp.comp), "formula", "Sumaste cada elemento una sola vez. Cada masa atómica se multiplica por su subíndice."],
      [sumaZ(sp.comp), "conceptual", "Usaste los números atómicos (Z). La masa molar se calcula con las MASAS atómicas."],
      ...(sp.parenBad ? [[mm(sp.parenBad), "formula", "El subíndice que está afuera del paréntesis multiplica a TODOS los átomos de adentro."] as Err] : []),
    ];
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "g/mol", mode: "dec1", answer: M,
      prompt: `¿Cuál es la masa molar del ${sp.name} ($${sp.f}$)? ${masasDe(sp)}`,
      hints: ["La masa molar es la masa de 1 mol: se suman las masas de todos los átomos de la fórmula.", "Cada masa atómica se multiplica por la cantidad de veces que aparece el átomo (su subíndice).", "Un subíndice afuera de un paréntesis multiplica todo lo de adentro."],
      solution: [`Átomos por fórmula: ${Object.entries(sp.comp).map(([el, k]) => `${el}: ${k}`).join(", ")}`, `M = ${mmSteps(sp.comp)}`],
      explanation: "La masa molar (g/mol) es numéricamente igual a la masa de la fórmula en unidades de masa atómica.",
      errors,
    });
  },
};

export const quiComposicionCentesimal: Generator = {
  id: "qui-composicion-centesimal",
  topicId: "t-qui-masa-molar",
  description: "Composición centesimal de un compuesto y masa de un elemento en una muestra",
  generate(seed, d) {
    const r = rng(seed);
    const key = r.pick(d <= 2 ? ["H2O", "CO2", "NH3", "CH4", "NaCl", "CaO"] : ["H2SO4", "CaCO3", "HNO3", "C6H12O6", "Fe2O3", "Na2SO4", "C2H6O", "CaOH2", "Al2SO43"]);
    const sp = SP[key];
    const M = mm(sp.comp);
    const els = Object.keys(sp.comp);
    const el = d <= 2 ? els[els.length - 1] : r.pick(els.filter((e) => sp.comp[e] > 1).length ? els.filter((e) => sp.comp[e] > 1) : els);
    const k = sp.comp[el];
    const pct = ((k * MASAS[el]) / M) * 100;
    const atomos = Object.values(sp.comp).reduce((s, x) => s + x, 0);
    if (d <= 4) {
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "%", answer: pct,
        prompt: `¿Qué porcentaje en masa de **${el}** tiene el ${sp.name} ($${sp.f}$)? ${masasDe(sp)}`,
        hints: ["Primero calculá la masa molar del compuesto.", `¿Cuántos gramos de ${el} hay en 1 mol del compuesto? (Ojo con el subíndice.)`, `% ${el} = (subíndice · masa de ${el}) / M · 100.`],
        solution: [`M = ${mmSteps(sp.comp)}`, `Masa de ${el} en 1 mol: ${k}·${n(MASAS[el])} = ${n(k * MASAS[el])} g`, `% ${el} = ${n(k * MASAS[el])} / ${n(M)} · 100 = ${s3(pct)} %`],
        explanation: "La composición centesimal compara la masa de cada elemento en un mol con la masa molar del compuesto.",
        errors: [[(MASAS[el] / M) * 100, "formula", `Te olvidaste del subíndice: en cada fórmula hay ${k} átomos de ${el}.`], [(k / atomos) * 100, "conceptual", "Calculaste el porcentaje de ÁTOMOS, no de masa. Cada átomo pesa distinto."]],
      });
    }
    const m = r.pick([50, 75, 120, 200, 250, 500]);
    const mEl = (m * k * MASAS[el]) / M;
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "g", answer: mEl,
      prompt: `¿Cuántos gramos de **${el}** hay en ${m} g de ${sp.name} ($${sp.f}$)? ${masasDe(sp)}`,
      hints: ["En cada mol de compuesto hay una cantidad fija de gramos del elemento.", `En ${n(M)} g de compuesto hay ${k}·${n(MASAS[el])} g de ${el}.`, "Regla de tres (o fracción en masa · masa de la muestra)."],
      solution: [`M = ${n(M)} g/mol`, `${n(M)} g de compuesto → ${n(k * MASAS[el])} g de ${el}`, `${m} g → ${m}·${n(k * MASAS[el])}/${n(M)} = ${s3(mEl)} g`],
      explanation: "La fracción en masa de un elemento es la misma en cualquier muestra del compuesto (ley de las proporciones definidas).",
      errors: [[(m * MASAS[el]) / M, "formula", `Te olvidaste del subíndice ${k}.`], [(k * MASAS[el] / M) * 100, "interpretacion", "Ese es el porcentaje, no la masa en la muestra."]],
    });
  },
};

export const quiMolesMasa: Generator = {
  id: "qui-moles-masa",
  topicId: "t-qui-mol",
  description: "Conversión masa ↔ moles (n = m/M), incluso moles de átomos",
  generate(seed, d) {
    const r = rng(seed);
    const key = r.pick(d <= 3 ? MM_FACIL : MM_MEDIO);
    const sp = SP[key];
    const M = mm(sp.comp);
    const tipo = d <= 2 ? r.pick([0, 1]) : d <= 4 ? r.pick([0, 1, 2]) : r.pick([2, 3]);
    if (tipo === 0) {
      const m = r.pick([9, 22, 36, 45, 88, 100, 150, 250]);
      const nn = m / M;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "mol", answer: nn,
        prompt: `¿Cuántos moles hay en ${m} g de ${sp.name} ($${sp.f}$)? ${masasDe(sp)}`,
        hints: ["Calculá la masa molar: cuántos gramos pesa 1 mol.", "n = m / M.", `n = ${m} g / ${n(M)} g/mol.`],
        solution: [`M = ${mmSteps(sp.comp)}`, `n = ${m} / ${n(M)} = ${s3(nn)} mol`],
        explanation: "La masa molar es el factor que convierte gramos en moles.",
        errors: [[m * M, "formula", "Multiplicaste. Para pasar de gramos a moles se DIVIDE por la masa molar: n = m/M."], [M / m, "formula", "Dividiste al revés: n = m/M (gramos sobre gramos por mol)."]],
      });
    }
    if (tipo === 1) {
      const nn = r.pick([0.25, 0.5, 1.5, 2, 2.5, 3, 0.1]);
      const m = nn * M;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "g", answer: m,
        prompt: `¿Qué masa tienen ${n(nn)} mol de ${sp.name} ($${sp.f}$)? ${masasDe(sp)}`,
        hints: ["Primero la masa molar.", "m = n · M.", `m = ${n(nn)} mol · ${n(M)} g/mol.`],
        solution: [`M = ${n(M)} g/mol`, `m = ${n(nn)} · ${n(M)} = ${s3(m)} g`],
        explanation: "Cada mol pesa M gramos; n moles pesan n·M gramos.",
        errors: [[nn / M, "formula", "Dividiste. Si 1 mol pesa M gramos, n moles pesan n·M."], [M, "conceptual", "Esa es la masa de 1 mol; falta multiplicar por la cantidad de moles."]],
      });
    }
    if (tipo === 2) {
      const mkg = r.pick([0.5, 1.2, 2, 0.25, 1.5]);
      const nn = (mkg * 1000) / M;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "mol", answer: nn,
        prompt: `¿Cuántos moles hay en ${n(mkg)} kg de ${sp.name} ($${sp.f}$)? ${masasDe(sp)}`,
        hints: ["La masa molar está en g/mol: pasá la masa a gramos.", "1 kg = 1000 g.", "n = m (en g) / M."],
        solution: [`m = ${n(mkg)} kg = ${n(mkg * 1000)} g`, `n = ${n(mkg * 1000)} / ${n(M)} = ${s3(nn)} mol`],
        explanation: "Las unidades tienen que ser coherentes: gramos con g/mol.",
        errors: [[mkg / M, "unidades", "Usaste kg con una masa molar en g/mol. Pasá a gramos (×1000)."], [mkg * 1000 * M, "formula", "Multiplicaste por la masa molar: n = m/M."]],
      });
    }
    const opts = Object.keys(sp.comp).filter((e) => sp.comp[e] > 1);
    const el = opts.length ? r.pick(opts) : Object.keys(sp.comp)[0];
    const k = sp.comp[el];
    const m = r.pick([20, 40, 60, 98, 120, 150]);
    const nAt = (m / M) * k;
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "mol", answer: nAt,
      prompt: `¿Cuántos moles de **átomos de ${el}** hay en ${m} g de ${sp.name} ($${sp.f}$)? ${masasDe(sp)}`,
      hints: ["Primero calculá los moles del compuesto.", `Cada fórmula de $${sp.f}$ tiene ${k} átomos de ${el}.`, `Moles de ${el} = moles de compuesto · ${k}.`],
      solution: [`n(compuesto) = ${m} / ${n(M)} = ${s3(m / M)} mol`, `n(${el}) = ${s3(m / M)} · ${k} = ${s3(nAt)} mol`],
      explanation: "Los subíndices de la fórmula también valen como relación entre moles: 1 mol de compuesto contiene k moles de ese átomo.",
      errors: [[m / M, "conceptual", `Esos son los moles de compuesto. Cada uno tiene ${k} átomos de ${el}.`], [m / MASAS[el], "conceptual", `Dividiste la masa del COMPUESTO por la masa atómica del ${el}: esa masa no es toda de ${el}.`]],
    });
  },
};

const NA = 6.02;

export const quiAvogadro: Generator = {
  id: "qui-avogadro",
  topicId: "t-qui-mol",
  description: "Número de Avogadro: moléculas y átomos en una masa dada (y viceversa)",
  generate(seed, d) {
    const r = rng(seed);
    const key = r.pick(d <= 3 ? ["H2O", "CO2", "NH3", "CH4", "O2", "N2"] : ["H2SO4", "C6H12O6", "C2H6O", "CaCO3", "C3H8", "NH3", "H2O"]);
    const sp = SP[key];
    const M = mm(sp.comp);
    const tipo = d <= 2 ? 0 : d <= 4 ? r.pick([0, 1]) : r.pick([1, 2]);
    const unidad = "unidades de 10²³ (si obtenés 3,01·10²³, escribí 3,01)";
    if (tipo === 0) {
      const m = r.pick([4, 8, 9, 18, 22, 32, 44, 51]);
      const N = (m / M) * NA;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "", answer: N,
        prompt: `¿Cuántas moléculas hay en ${m} g de $${sp.f}$? Usá $N_A = 6,02·10^{23}$. ${masasDe(sp)} Expresá el resultado en ${unidad}.`,
        hints: ["Pasá de gramos a moles con la masa molar.", "Cada mol tiene $6,02·10^{23}$ moléculas.", "N = (m/M) · N_A."],
        solution: [`n = ${m} / ${n(M)} = ${s3(m / M)} mol`, `N = ${s3(m / M)} · 6,02·10^23 = ${s3(N)}·10^23 moléculas`],
        explanation: "El mol es un «paquete» de 6,02·10²³ partículas: de moles a partículas se multiplica por N_A.",
        errors: [[m * NA, "conceptual", "Multiplicaste los GRAMOS por N_A. Primero hay que pasar a moles."], [m * M * NA, "formula", "Multiplicaste por la masa molar: n = m/M."], [M / m * NA, "formula", "Invertiste el cociente: n = m/M."]],
      });
    }
    if (tipo === 1) {
      const els = Object.keys(sp.comp);
      const el = r.pick(els);
      const k = sp.comp[el];
      const m = r.pick([9, 18, 36, 50, 90, 100]);
      const N = (m / M) * k * NA;
      const tot = Object.values(sp.comp).reduce((s, x) => s + x, 0);
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "", answer: N,
        prompt: `¿Cuántos **átomos de ${el}** hay en ${m} g de $${sp.f}$? Usá $N_A = 6,02·10^{23}$. ${masasDe(sp)} Expresá el resultado en ${unidad}.`,
        hints: ["Primero las moléculas (o moles de moléculas).", `Cada molécula de $${sp.f}$ tiene ${k} átomo(s) de ${el}.`, `N(${el}) = (m/M) · ${k} · N_A.`],
        solution: [`n = ${m} / ${n(M)} = ${s3(m / M)} mol de moléculas`, `n(${el}) = ${s3(m / M)} · ${k} = ${s3((m / M) * k)} mol`, `N = ${s3((m / M) * k)} · 6,02·10^23 = ${s3(N)}·10^23 átomos`],
        explanation: "Moléculas → átomos: se multiplica por la cantidad de ese átomo en la fórmula.",
        errors: [[(m / M) * NA, "conceptual", `Esas son las moléculas. Cada una tiene ${k} átomo(s) de ${el}.`], [(m / M) * tot * NA, "interpretacion", "Contaste TODOS los átomos de la molécula, no solo los del elemento pedido."]],
      });
    }
    const N = r.pick([1.2, 3.01, 4.5, 9.03, 12.04, 0.602]);
    const m = (N / NA) * M;
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "g", answer: m,
      prompt: `¿Qué masa tienen $${n(N)}·10^{23}$ moléculas de $${sp.f}$? Usá $N_A = 6,02·10^{23}$. ${masasDe(sp)}`,
      hints: ["Pasá de moléculas a moles dividiendo por N_A.", "Después, de moles a gramos multiplicando por M.", `m = (${n(N)}·10^23 / 6,02·10^23) · ${n(M)}.`],
      solution: [`n = ${n(N)}·10^23 / 6,02·10^23 = ${s3(N / NA)} mol`, `m = ${s3(N / NA)} · ${n(M)} = ${s3(m)} g`],
      explanation: "Partículas → moles (÷ N_A) → gramos (× M).",
      errors: [[N / NA, "interpretacion", "Esos son los moles. Falta pasar a gramos multiplicando por la masa molar."], [N * NA * M, "formula", "Multiplicaste por N_A: para ir de partículas a moles se divide."]],
    });
  },
};

// ═══════════════════════════ Unidad 6: Gases ═══════════════════════════

const R = 0.082;
const K = (c: number) => c + 273;

export const quiGasesCombinada: Generator = {
  id: "qui-gases-combinada",
  topicId: "t-qui-gases-leyes",
  description: "Leyes de los gases: Boyle, Charles–Gay-Lussac y ley combinada",
  generate(seed, d) {
    const r = rng(seed);
    const tipo = d <= 2 ? 0 : d <= 3 ? 1 : 2;
    if (tipo === 0) {
      const P1 = r.pick([1, 1.5, 2, 2.5, 3]);
      const V1 = r.pick([2, 4, 5, 6, 10, 12]);
      const P2 = r.pick([0.5, 1, 2, 4, 5, 6].filter((x) => x !== P1));
      const V2 = (P1 * V1) / P2;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "L", answer: V2,
        prompt: `Un gas ocupa ${n(V1)} L a ${n(P1)} atm. Si la temperatura no cambia, ¿qué volumen ocupa a ${n(P2)} atm?`,
        hints: ["A temperatura constante, si la presión sube el volumen baja (ley de Boyle).", "$P_1V_1 = P_2V_2$.", `$V_2 = P_1V_1 / P_2$.`],
        solution: [`P₁V₁ = P₂V₂`, `V₂ = ${n(P1)} · ${n(V1)} / ${n(P2)}`, `V₂ = ${s3(V2)} L`],
        explanation: "Con T y n constantes, el producto P·V se mantiene: presión y volumen son inversamente proporcionales.",
        errors: [[(V1 * P2) / P1, "formula", "Usaste una proporción directa. En la ley de Boyle P y V son INVERSAMENTE proporcionales: si P aumenta, V disminuye."]],
      });
    }
    if (tipo === 1) {
      const V1 = r.pick([2, 3, 5, 8, 10]);
      const t1 = r.pick([0, 17, 27, 47, 77]);
      const t2 = r.pick([127, 177, 227, 327, -73].filter((x) => x !== t1));
      const V2 = (V1 * K(t2)) / K(t1);
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "L", answer: V2,
        prompt: `Un globo con ${n(V1)} L de gas a ${t1} °C se lleva a ${t2} °C a presión constante. ¿Cuál es su nuevo volumen? (T(K) = T(°C) + 273)`,
        hints: ["A presión constante, V es proporcional a la temperatura ABSOLUTA.", "Pasá las temperaturas a kelvin.", "$V_1/T_1 = V_2/T_2$."],
        solution: [`T₁ = ${t1} + 273 = ${K(t1)} K;  T₂ = ${t2} + 273 = ${K(t2)} K`, `V₂ = V₁ · T₂/T₁ = ${n(V1)} · ${K(t2)}/${K(t1)}`, `V₂ = ${s3(V2)} L`],
        explanation: "Las leyes de los gases usan temperatura absoluta: en °C el cero no significa «sin agitación térmica».",
        errors: [...(t1 !== 0 ? [[(V1 * t2) / t1, "unidades", "Usaste las temperaturas en °C. Las leyes de los gases exigen kelvin."] as Err] : []), [(V1 * K(t1)) / K(t2), "formula", "Invertiste la proporción: si la temperatura sube a P constante, el volumen AUMENTA."]],
      });
    }
    const P1mm = d >= 5 ? r.pick([380, 570, 700, 740, 1140]) : 0;
    const P1 = d >= 5 ? P1mm / 760 : r.pick([1, 1.2, 2, 2.5, 3]);
    const V1 = r.pick([1.5, 2, 4, 5, 6]);
    const t1 = r.pick([20, 25, 27, 30, 37]);
    const P2 = r.pick([0.8, 1, 1.5, 2, 4]);
    const t2 = r.pick([0, 50, 100, 127, 200]);
    const V2 = (P1 * V1 * K(t2)) / (K(t1) * P2);
    const P1txt = d >= 5 ? `${P1mm} mmHg` : `${n(P1)} atm`;
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "L", answer: V2,
      prompt: `Una muestra de gas ocupa ${n(V1)} L a ${P1txt} y ${t1} °C. ¿Qué volumen ocupa a ${n(P2)} atm y ${t2} °C?${d >= 5 ? " (1 atm = 760 mmHg)" : ""}`,
      hints: ["Usá la ley combinada: $P_1V_1/T_1 = P_2V_2/T_2$.", d >= 5 ? "Pasá las presiones a la misma unidad (atm) y las temperaturas a kelvin." : "Las temperaturas, en kelvin.", "$V_2 = P_1V_1T_2 / (T_1P_2)$."],
      solution: [
        ...(d >= 5 ? [`P₁ = ${P1mm}/760 = ${s3(P1)} atm`] : []),
        `T₁ = ${K(t1)} K;  T₂ = ${K(t2)} K`,
        `V₂ = ${s3(P1)} · ${n(V1)} · ${K(t2)} / (${K(t1)} · ${n(P2)})`,
        `V₂ = ${s3(V2)} L`,
      ],
      explanation: "Con la cantidad de gas fija, P·V/T es constante.",
      errors: [
        ...(t2 !== 0 ? [[(P1 * V1 * t2) / (t1 * P2), "unidades", "Usaste °C. Las leyes de los gases necesitan kelvin."] as Err] : []),
        ...(d >= 5 ? [[(P1mm * V1 * K(t2)) / (K(t1) * P2), "unidades", "Mezclaste mmHg con atm. Pasá P₁ a atm (÷ 760) antes de reemplazar."] as Err] : []),
        [(P2 * V1 * K(t2)) / (K(t1) * P1), "formula", "Invertiste las presiones: si la presión aumenta, el volumen baja."],
      ],
    });
  },
};

export const quiGasIdeal: Generator = {
  id: "qui-gas-ideal",
  topicId: "t-qui-gas-ideal",
  description: "Ecuación de estado del gas ideal PV = nRT (P, V, n, masa, masa molar)",
  generate(seed, d) {
    const r = rng(seed);
    const key = r.pick(["O2", "N2", "CO2", "CH4", "NH3", "H2"]);
    const sp = SP[key];
    const M = mm(sp.comp);
    const t = r.pick([0, 25, 27, 37, 100, 127]);
    const T = K(t);
    const tipo = d <= 2 ? r.pick([0, 1]) : d <= 4 ? r.pick([1, 2]) : r.pick([2, 3]);
    const RTtxt = "R = 0,082 atm·L/(mol·K)";
    if (tipo === 0) {
      const nn = r.pick([0.5, 1, 1.5, 2, 2.5]);
      const V = r.pick([5, 10, 20, 25, 50]);
      const P = (nn * R * T) / V;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "atm", answer: P,
        prompt: `¿Qué presión ejercen ${n(nn)} mol de $${sp.f}$ en un recipiente de ${V} L a ${t} °C? (${RTtxt})`,
        hints: ["Gas ideal: PV = nRT.", "T en kelvin: sumá 273.", "P = nRT / V."],
        solution: [`T = ${t} + 273 = ${T} K`, `P = ${n(nn)} · 0,082 · ${T} / ${V}`, `P = ${s3(P)} atm`],
        explanation: "La ecuación de estado relaciona las cuatro variables de un gas ideal; R fija las unidades (atm, L, mol, K).",
        errors: [...(t !== 0 ? [[(nn * R * t) / V, "unidades", "Usaste la temperatura en °C. En PV = nRT va en kelvin."] as Err] : []), [(nn * 8.314 * T) / V, "unidades", "Usaste R = 8,314 (unidades J/(mol·K)). Con atm y L va R = 0,082."]],
      });
    }
    if (tipo === 1) {
      const nn = r.pick([0.25, 0.5, 1, 2, 3]);
      const P = r.pick([0.5, 1, 1.5, 2, 3]);
      const V = (nn * R * T) / P;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "L", answer: V,
        prompt: `¿Qué volumen ocupan ${n(nn)} mol de $${sp.f}$ a ${n(P)} atm y ${t} °C? (${RTtxt})`,
        hints: ["PV = nRT.", "Temperatura en kelvin.", "V = nRT / P."],
        solution: [`T = ${T} K`, `V = ${n(nn)} · 0,082 · ${T} / ${n(P)}`, `V = ${s3(V)} L`],
        explanation: "Despejando V de PV = nRT.",
        errors: [...(t !== 0 ? [[(nn * R * t) / P, "unidades", "La temperatura va en kelvin, no en °C."] as Err] : []), [(nn * R * T) * P, "despeje", "Multiplicaste por P. De PV = nRT se despeja V = nRT/P."]],
      });
    }
    if (tipo === 2) {
      const m = r.pick([4, 8, 16, 32, 44, 64]);
      const P = r.pick([1, 1.5, 2, 2.5]);
      const nn = m / M;
      const V = (nn * R * T) / P;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "L", answer: V,
        prompt: `¿Qué volumen ocupan ${m} g de ${sp.name} ($${sp.f}$) a ${n(P)} atm y ${t} °C? (${RTtxt}) ${masasDe(sp)}`,
        hints: ["En PV = nRT, n son MOLES, no gramos.", "n = m / M.", "Después V = nRT/P con T en kelvin."],
        solution: [`M = ${n(M)} g/mol → n = ${m}/${n(M)} = ${s3(nn)} mol`, `T = ${T} K`, `V = ${s3(nn)} · 0,082 · ${T} / ${n(P)} = ${s3(V)} L`],
        explanation: "La ecuación de gases cuenta partículas (moles): la masa hay que convertirla.",
        errors: [[(m * R * T) / P, "conceptual", "Usaste los gramos como si fueran moles. Primero n = m/M."], ...(t !== 0 ? [[(nn * R * t) / P, "unidades", "Temperatura en kelvin."] as Err] : [])],
      });
    }
    // masa molar a partir de datos experimentales
    const P = r.pick([0.8, 1, 1.2, 1.5]);
    const V = r.pick([1, 2, 2.5, 5]);
    const nn = (P * V) / (R * T);
    const m = Math.round(nn * M * 100) / 100;
    const Mexp = (m * R * T) / (P * V);
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "g/mol", answer: Mexp,
      prompt: `Una muestra de ${n(m, 2)} g de un gas desconocido ocupa ${n(V)} L a ${n(P)} atm y ${t} °C. ¿Cuál es su masa molar? (${RTtxt})`,
      hints: ["Con P, V y T podés calcular los moles.", "n = PV / (RT).", "M = m / n."],
      solution: [`T = ${T} K`, `n = ${n(P)} · ${n(V)} / (0,082 · ${T}) = ${s3(nn)} mol`, `M = ${n(m, 2)} / ${s3(nn)} = ${s3(Mexp)} g/mol`],
      explanation: "Midiendo masa, P, V y T de un gas se puede obtener su masa molar: M = mRT/(PV).",
      errors: [[(P * V) / (R * T), "interpretacion", "Esos son los moles; falta dividir la masa por ellos."], ...(t !== 0 ? [[(m * R * t) / (P * V), "unidades", "La temperatura va en kelvin."] as Err] : [])],
    });
  },
};

export const quiPresionParcial: Generator = {
  id: "qui-presion-parcial",
  topicId: "t-qui-gas-ideal",
  description: "Mezclas gaseosas: fracción molar y ley de Dalton",
  generate(seed, d) {
    const r = rng(seed);
    const [ka, kb] = r.shuffle(["O2", "N2", "CO2", "CH4", "H2"]).slice(0, 2);
    const A = SP[ka];
    const B = SP[kb];
    if (d <= 3) {
      const na = r.pick([0.5, 1, 1.5, 2, 3]);
      const nb = r.pick([0.5, 1, 2, 2.5, 4]);
      const PT = r.pick([2, 3, 4, 5, 6]);
      const Pa = (na / (na + nb)) * PT;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "atm", answer: Pa,
        prompt: `Una mezcla contiene ${n(na)} mol de $${A.f}$ y ${n(nb)} mol de $${B.f}$ a una presión total de ${PT} atm. ¿Cuál es la presión parcial del $${A.f}$?`,
        hints: ["Cada gas aporta a la presión según su proporción de moles.", "Fracción molar: $x_A = n_A / n_{total}$.", "$P_A = x_A · P_{total}$."],
        solution: [`n_total = ${n(na)} + ${n(nb)} = ${n(na + nb)} mol`, `x_A = ${n(na)}/${n(na + nb)} = ${s3(na / (na + nb))}`, `P_A = ${s3(na / (na + nb))} · ${PT} = ${s3(Pa)} atm`],
        explanation: "Ley de Dalton: en una mezcla ideal, cada gas ejerce la presión que tendría solo, proporcional a su fracción molar.",
        errors: [[(na / nb) * PT, "conceptual", "Dividiste por los moles del otro gas. La fracción molar se calcula sobre el TOTAL de moles."], [PT / 2, "conceptual", "No se reparte en partes iguales: depende de cuántos moles hay de cada gas."]],
      });
    }
    const ma = r.pick([8, 16, 32, 44, 56]);
    const mb = r.pick([7, 14, 28, 40, 64]);
    const V = r.pick([10, 20, 25]);
    const t = r.pick([0, 27, 127]);
    const na = ma / mm(A.comp);
    const nb = mb / mm(B.comp);
    const ask = d <= 5 ? "parcial" : "total";
    const Pa = (na * R * K(t)) / V;
    const PT = ((na + nb) * R * K(t)) / V;
    const ans = ask === "parcial" ? Pa : PT;
    const massFrac = (ma / (ma + mb)) * PT;
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "atm", answer: ans,
      prompt: `En un recipiente de ${V} L a ${t} °C hay ${ma} g de $${A.f}$ y ${mb} g de $${B.f}$. ¿Cuál es la presión ${ask === "parcial" ? `parcial del $${A.f}$` : "total"}? (R = 0,082 atm·L/(mol·K)) ${masasDe(A, B)}`,
      hints: ["Pasá cada masa a moles.", ask === "parcial" ? "Cada gas se comporta como si estuviera solo: $P_A = n_ART/V$." : "$P_{total} = n_{total}RT/V$.", "T en kelvin."],
      solution: [`n(${A.f}) = ${ma}/${n(mm(A.comp))} = ${s3(na)} mol;  n(${B.f}) = ${mb}/${n(mm(B.comp))} = ${s3(nb)} mol`, `T = ${K(t)} K`, ask === "parcial" ? `P_A = ${s3(na)} · 0,082 · ${K(t)} / ${V} = ${s3(Pa)} atm` : `P_T = ${s3(na + nb)} · 0,082 · ${K(t)} / ${V} = ${s3(PT)} atm`],
      explanation: "En una mezcla de gases ideales, cada gas ejerce su presión parcial y la total es la suma (Dalton).",
      errors: [
        ...(ask === "parcial" ? [[massFrac, "conceptual", "Usaste la fracción en MASA. La presión parcial depende de la fracción MOLAR."] as Err] : []),
        [((ask === "parcial" ? ma : ma + mb) * R * K(t)) / V, "conceptual", "Usaste gramos en lugar de moles en PV = nRT."],
        ...(t !== 0 ? [[((ask === "parcial" ? na : na + nb) * R * t) / V, "unidades", "La temperatura va en kelvin."] as Err] : []),
      ],
    });
  },
};

// ═══════════════════════════ Unidad 7: Soluciones ═══════════════════════════

const SOLUTOS = ["NaCl", "NaOH", "KCl", "CaCl2", "C6H12O6", "CuSO4", "Na2SO4", "HCl", "KOH"];

export const quiConcentracionPorcentual: Generator = {
  id: "qui-concentracion-porcentual",
  topicId: "t-qui-concentracion",
  description: "Concentración %m/m y %m/V (con densidad de la solución)",
  generate(seed, d) {
    const r = rng(seed);
    const sp = SP[r.pick(SOLUTOS)];
    const tipo = d <= 2 ? 0 : d <= 4 ? r.pick([0, 1]) : 2;
    if (tipo === 0) {
      const ms = r.pick([5, 8, 10, 12, 15, 20, 25]);
      const mv = r.pick([45, 80, 90, 100, 150, 185, 200]);
      const p = (ms / (ms + mv)) * 100;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "% m/m", answer: p,
        prompt: `Se disuelven ${ms} g de ${sp.name} en ${mv} g de agua. ¿Cuál es la concentración en % m/m?`,
        hints: ["% m/m = gramos de soluto cada 100 g de SOLUCIÓN.", "Masa de solución = soluto + solvente.", `% m/m = ${ms} / (${ms} + ${mv}) · 100.`],
        solution: [`m(solución) = ${ms} + ${mv} = ${ms + mv} g`, `% m/m = ${ms}/${ms + mv} · 100 = ${s3(p)} %`],
        explanation: "La concentración porcentual se refiere a la solución completa, no solo al solvente.",
        errors: [[(ms / mv) * 100, "conceptual", "Dividiste por la masa del SOLVENTE. El % m/m se calcula sobre la masa de la solución (soluto + solvente)."], [ms / (ms + mv), "calculo", "Falta multiplicar por 100."]],
      });
    }
    if (tipo === 1) {
      const ms = r.pick([2, 4, 5, 7.5, 9, 12]);
      const V = r.pick([50, 100, 150, 250, 500]);
      const p = (ms / V) * 100;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "% m/V", answer: p,
        prompt: `Se preparan ${V} mL de solución disolviendo ${n(ms)} g de ${sp.name}. ¿Cuál es su concentración en % m/V?`,
        hints: ["% m/V = gramos de soluto cada 100 mL de solución.", "Usá el volumen de SOLUCIÓN.", `% m/V = ${n(ms)} / ${V} · 100.`],
        solution: [`% m/V = ${n(ms)} g / ${V} mL · 100 = ${s3(p)} %`],
        explanation: "En % m/V la referencia son 100 mL de solución.",
        errors: [[ms / V, "calculo", "Ese es el cociente g/mL; falta multiplicar por 100."], [(ms / V) * 1000, "unidades", "Calculaste gramos por litro (g/L). El % m/V es por cada 100 mL."]],
      });
    }
    const pmm = r.pick([10, 12, 20, 25, 30, 36]);
    const dens = r.pick([1.05, 1.08, 1.1, 1.15, 1.2]);
    const pmv = pmm * dens;
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "% m/V", answer: pmv,
      prompt: `Una solución acuosa de ${sp.name} es ${pmm} % m/m y su densidad es ${n(dens)} g/mL. ¿Cuál es su concentración en % m/V?`,
      hints: ["Tomá 100 g de solución: contienen " + pmm + " g de soluto.", "Con la densidad, calculá qué volumen ocupan esos 100 g de solución.", "% m/V = g de soluto / mL de solución · 100."],
      solution: [`100 g de solución → ${pmm} g de soluto`, `V = 100 g / ${n(dens)} g/mL = ${s3(100 / dens)} mL`, `% m/V = ${pmm} / ${s3(100 / dens)} · 100 = ${s3(pmv)} %`],
      explanation: "La densidad de la SOLUCIÓN es el puente entre masa y volumen de solución: % m/V = % m/m · δ.",
      errors: [[pmm / dens, "formula", "Dividiste por la densidad. 100 g de solución ocupan MENOS de 100 mL (si δ > 1), así que el % m/V es mayor que el % m/m."], [pmm, "conceptual", "% m/m y % m/V no son iguales salvo que la densidad sea 1 g/mL."]],
    });
  },
};

export const quiMolaridad: Generator = {
  id: "qui-molaridad",
  topicId: "t-qui-concentracion",
  description: "Molaridad: M = n/V(L); masa necesaria; desde % m/m y densidad",
  generate(seed, d) {
    const r = rng(seed);
    const sp = SP[r.pick(SOLUTOS)];
    const Mm = mm(sp.comp);
    const tipo = d <= 2 ? 0 : d <= 4 ? r.pick([0, 1]) : d === 5 ? 1 : 2;
    if (tipo === 0) {
      const m = r.pick([5, 10, 11.7, 20, 29.25, 40]);
      const V = r.pick([100, 200, 250, 500, 750]);
      const nn = m / Mm;
      const Mol = nn / (V / 1000);
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "M", answer: Mol,
        prompt: `Se disuelven ${n(m)} g de ${sp.name} ($${sp.f}$) en agua hasta completar ${V} mL de solución. ¿Cuál es la molaridad? ${masasDe(sp)}`,
        hints: ["Molaridad = moles de soluto por LITRO de solución.", "Pasá la masa a moles y el volumen a litros.", "M = n / V(L)."],
        solution: [`n = ${n(m)} / ${n(Mm)} = ${s3(nn)} mol`, `V = ${V} mL = ${n(V / 1000)} L`, `M = ${s3(nn)} / ${n(V / 1000)} = ${s3(Mol)} M`],
        explanation: "La molaridad cuenta moles (no gramos) por litro de solución.",
        errors: [[nn / V, "unidades", "Usaste el volumen en mL. La molaridad es mol/L: pasá a litros."], [m / (V / 1000), "conceptual", "Eso es g/L: te faltó pasar los gramos a moles."]],
      });
    }
    if (tipo === 1) {
      const Mol = r.pick([0.1, 0.2, 0.25, 0.5, 1, 1.5]);
      const V = r.pick([100, 250, 500, 750, 1500]);
      const m = Mol * (V / 1000) * Mm;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "g", answer: m,
        prompt: `¿Cuántos gramos de ${sp.name} ($${sp.f}$) hacen falta para preparar ${V} mL de solución ${n(Mol)} M? ${masasDe(sp)}`,
        hints: ["Primero los moles: n = M · V(L).", "Volumen en litros.", "Después m = n · masa molar."],
        solution: [`n = ${n(Mol)} mol/L · ${n(V / 1000)} L = ${s3(Mol * (V / 1000))} mol`, `m = ${s3(Mol * (V / 1000))} · ${n(Mm)} = ${s3(m)} g`],
        explanation: "Molaridad × volumen da moles; moles × masa molar da gramos.",
        errors: [[Mol * V * Mm, "unidades", "Usaste el volumen en mL. Pasalo a litros antes de multiplicar."], [Mol * (V / 1000), "interpretacion", "Esos son los moles; falta pasar a gramos con la masa molar."]],
      });
    }
    const pmm = r.pick([10, 20, 25, 30, 36, 40]);
    const dens = r.pick([1.1, 1.15, 1.18, 1.2, 1.3]);
    const Mol = (pmm * dens * 10) / Mm;
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "M", answer: Mol,
      prompt: `Una solución de ${sp.name} ($${sp.f}$) es ${pmm} % m/m y tiene densidad ${n(dens)} g/mL. ¿Cuál es su molaridad? ${masasDe(sp)}`,
      hints: ["Tomá 1 L (1000 mL) de solución y calculá su masa con la densidad.", `De esa masa, el ${pmm} % es soluto.`, "Pasá el soluto a moles: esos son los moles por litro."],
      solution: [`1 L de solución pesa 1000 · ${n(dens)} = ${n(1000 * dens)} g`, `Soluto: ${pmm}/100 · ${n(1000 * dens)} = ${s3(pmm * dens * 10)} g`, `n = ${s3(pmm * dens * 10)} / ${n(Mm)} = ${s3(Mol)} mol → ${s3(Mol)} M`],
      explanation: "Para pasar de % m/m a molaridad hace falta la densidad de la solución (relaciona masa y volumen de solución).",
      errors: [[(pmm * 10) / Mm, "conceptual", "Supusiste que 1 L de solución pesa 1000 g: te faltó usar la densidad."], [(pmm * dens) / Mm, "unidades", "Trabajaste con 100 mL en lugar de 1 L. La molaridad es por LITRO."]],
    });
  },
};

export const quiDilucion: Generator = {
  id: "qui-dilucion",
  topicId: "t-qui-dilucion",
  description: "Diluciones: C₁V₁ = C₂V₂ y volumen de agua agregado",
  generate(seed, d) {
    const r = rng(seed);
    const sp = SP[r.pick(["HCl", "NaOH", "H2SO4", "NaCl", "HNO3"])];
    const C1 = r.pick([0.5, 1, 2, 3, 6, 12]);
    const tipo = d <= 2 ? 0 : d <= 4 ? r.pick([0, 1]) : r.pick([1, 2]);
    if (tipo === 0) {
      const V1 = r.pick([10, 20, 25, 50, 100]);
      const V2 = r.pick([100, 250, 500, 1000].filter((x) => x > V1));
      const C2 = (C1 * V1) / V2;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "M", answer: C2,
        prompt: `Se toman ${V1} mL de una solución ${n(C1)} M de ${sp.name} y se diluyen con agua hasta ${V2} mL. ¿Cuál es la nueva concentración?`,
        hints: ["Al diluir, los moles de soluto no cambian.", "$C_1V_1 = C_2V_2$.", "$C_2 = C_1V_1/V_2$ (los mL se simplifican)."],
        solution: [`C₁V₁ = C₂V₂`, `C₂ = ${n(C1)} · ${V1} / ${V2}`, `C₂ = ${s3(C2)} M`],
        explanation: "Agregar agua no cambia la cantidad de soluto: n = C₁V₁ = C₂V₂.",
        errors: [[(C1 * V2) / V1, "formula", "Invertiste los volúmenes: al diluir la concentración BAJA."]],
      });
    }
    const C2 = r.pick([0.05, 0.1, 0.2, 0.25, 0.5].filter((x) => x < C1));
    const V2 = r.pick([250, 500, 1000, 2000]);
    const V1 = (C2 * V2) / C1;
    if (tipo === 1) {
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "mL", answer: V1,
        prompt: `¿Qué volumen de una solución ${n(C1)} M de ${sp.name} hace falta para preparar ${V2} mL de solución ${n(C2)} M?`,
        hints: ["Los moles que necesitás en la solución final salen de la concentrada.", "$C_1V_1 = C_2V_2$.", "$V_1 = C_2V_2/C_1$."],
        solution: [`V₁ = ${n(C2)} · ${V2} / ${n(C1)}`, `V₁ = ${s3(V1)} mL`],
        explanation: "Se toma la alícuota de solución concentrada que contiene los moles pedidos y se completa con agua.",
        errors: [[(C1 * V2) / C2, "formula", "Invertiste las concentraciones: de la solución concentrada se necesita MENOS volumen que el final."], [V2 - V1, "interpretacion", "Ese es el volumen de agua a agregar; se pedía el de solución concentrada."]],
      });
    }
    const agua = V2 - V1;
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "mL", answer: agua,
      prompt: `Querés preparar ${V2} mL de ${sp.name} ${n(C2)} M a partir de una solución ${n(C1)} M. ¿Cuántos mL de **agua** tenés que agregar? (Suponé volúmenes aditivos.)`,
      hints: ["Primero calculá cuánto de la solución concentrada necesitás.", "$V_1 = C_2V_2/C_1$.", "Agua = volumen final − volumen de concentrada."],
      solution: [`V₁ = ${n(C2)} · ${V2} / ${n(C1)} = ${s3(V1)} mL de concentrada`, `Agua = ${V2} − ${s3(V1)} = ${s3(agua)} mL`],
      explanation: "La dilución se completa con agua hasta el volumen final.",
      errors: [[V1, "interpretacion", "Ese es el volumen de solución concentrada. El agua es lo que falta para llegar al volumen final."], [V2, "interpretacion", "Ese es el volumen final total, no el agua agregada."]],
    });
  },
};

// ═══════════════════════════ Unidad 8: Reacciones y estequiometría ═══════════════════════════

type Term = [number, string];
export interface Reaccion {
  r: Term[];
  p: Term[];
  /** Para el distractor «cambié subíndices»: ecuación «balanceada» tocando fórmulas. */
  subBad?: string;
}

export const REACCIONES: Reaccion[] = [
  { r: [[2, "H2"], [1, "O2"]], p: [[2, "H2O"]], subBad: "$H_2 + O_2 → H_2O_2$" },
  { r: [[1, "N2"], [3, "H2"]], p: [[2, "NH3"]], subBad: "$N + H_3 → NH_3$" },
  { r: [[1, "CH4"], [2, "O2"]], p: [[1, "CO2"], [2, "H2O"]] },
  { r: [[1, "C3H8"], [5, "O2"]], p: [[3, "CO2"], [4, "H2O"]] },
  { r: [[2, "C2H6"], [7, "O2"]], p: [[4, "CO2"], [6, "H2O"]] },
  { r: [[4, "Fe"], [3, "O2"]], p: [[2, "Fe2O3"]], subBad: "$Fe_2 + O_3 → Fe_2O_3$" },
  { r: [[2, "Al"], [6, "HCl"]], p: [[2, "AlCl3"], [3, "H2"]] },
  { r: [[1, "CaCO3"]], p: [[1, "CaO"], [1, "CO2"]] },
  { r: [[2, "KClO3"]], p: [[2, "KCl"], [3, "O2"]], subBad: "$KClO_3 → KCl + O_3$" },
  { r: [[1, "Zn"], [2, "HCl"]], p: [[1, "ZnCl2"], [1, "H2"]], subBad: "$Zn + H_2Cl_2 → ZnCl_2 + H_2$" },
  { r: [[2, "NaOH"], [1, "H2SO4"]], p: [[1, "Na2SO4"], [2, "H2O"]] },
  { r: [[1, "C6H12O6"], [6, "O2"]], p: [[6, "CO2"], [6, "H2O"]] },
  { r: [[4, "NH3"], [5, "O2"]], p: [[4, "NO"], [6, "H2O"]] },
  { r: [[2, "Na"], [2, "H2O"]], p: [[2, "NaOH"], [1, "H2"]] },
  { r: [[1, "CaOH2"], [2, "HCl"]], p: [[1, "CaCl2"], [2, "H2O"]] },
  { r: [[3, "CaOH2"], [2, "H3PO4"]], p: [[1, "Ca3PO42"], [6, "H2O"]] },
  { r: [[2, "C4H10"], [13, "O2"]], p: [[8, "CO2"], [10, "H2O"]] },
  { r: [[1, "Fe2O3"], [3, "CO"]], p: [[2, "Fe"], [3, "CO2"]] },
  { r: [[2, "Mg"], [1, "O2"]], p: [[2, "MgO"]], subBad: "$Mg + O_2 → MgO_2$" },
  { r: [[1, "Mg"], [2, "HCl"]], p: [[1, "MgCl2"], [1, "H2"]] },
];

const GASES = new Set(["H2", "O2", "N2", "CO2", "NH3", "NO", "CH4", "C3H8", "C2H6", "C4H10", "CO", "Cl2"]);

/** Cuenta átomos de cada lado con coeficientes dados. */
function atomos(terms: Term[], coefs: number[]): Comp {
  const out: Comp = {};
  terms.forEach(([, k], i) => Object.entries(SP[k].comp).forEach(([el, x]) => (out[el] = (out[el] ?? 0) + x * coefs[i])));
  return out;
}

export function balanceada(rx: Reaccion, coefs?: number[]): boolean {
  const all = [...rx.r, ...rx.p];
  const c = coefs ?? all.map(([k]) => k);
  const L = atomos(rx.r, c.slice(0, rx.r.length));
  const Rr = atomos(rx.p, c.slice(rx.r.length));
  const els = new Set([...Object.keys(L), ...Object.keys(Rr)]);
  return [...els].every((e) => (L[e] ?? 0) === (Rr[e] ?? 0));
}

function ecuacion(rx: Reaccion, coefs?: number[], mostrarUno = false): string {
  const all = [...rx.r, ...rx.p];
  const c = coefs ?? all.map(([k]) => k);
  const t = all.map(([, key], i) => `${c[i] === 1 && !mostrarUno ? "" : c[i]}${SP[key].f}`);
  return `$${t.slice(0, rx.r.length).join(" + ")} → ${t.slice(rx.r.length).join(" + ")}$`;
}

const esqueleto = (rx: Reaccion) => `$${rx.r.map(([, k]) => SP[k].f).join(" + ")} → ${rx.p.map(([, k]) => SP[k].f).join(" + ")}$`;

export const quiBalanceo: Generator = {
  id: "qui-balanceo",
  topicId: "t-qui-balanceo",
  description: "Elegir la ecuación correctamente balanceada (menores enteros)",
  generate(seed, d) {
    const r = rng(seed);
    const pool = d <= 2 ? REACCIONES.slice(0, 10) : REACCIONES;
    const rx = pool[(seed * 3 + d * 7) % pool.length];
    const coefs = [...rx.r, ...rx.p].map(([k]) => k);
    const opts: { text: string; correct?: boolean; error?: { type: ErrorType; message: string } }[] = [{ text: ecuacion(rx), correct: true }];
    opts.push({ text: ecuacion(rx, coefs.map((c) => c * 2)), error: { type: "conceptual", message: "Está balanceada, pero no con los MENORES enteros: todos los coeficientes se pueden dividir por 2." } });
    // Variantes desbalanceadas: tocar un coeficiente.
    for (let tries = 0; tries < 6 && opts.length < 4; tries++) {
      const i = r.int(0, coefs.length - 1);
      const alt = [...coefs];
      alt[i] = alt[i] + (r.bool() || alt[i] === 1 ? 1 : -1);
      const txt = ecuacion(rx, alt);
      if (!balanceada(rx, alt) && !opts.some((o) => o.text === txt))
        opts.push({ text: txt, error: { type: "calculo", message: "Contá los átomos de cada elemento a cada lado: con estos coeficientes no coinciden." } });
    }
    if (rx.subBad && d >= 3) opts.push({ text: rx.subBad, error: { type: "conceptual", message: "Cambiaste SUBÍNDICES: eso cambia las sustancias. Para balancear solo se modifican los coeficientes." } });
    return choice(
      r,
      cbase(this.id, seed, d, this.topicId, `¿Cuál es la ecuación correctamente balanceada (con los menores coeficientes enteros) para ${esqueleto(rx)}?`, [
        "Contá los átomos de cada elemento a la izquierda y a la derecha.",
        "Solo se pueden cambiar los coeficientes, nunca los subíndices.",
        "Conviene balancear al final el H y el O (y los elementos que aparecen solos, como O₂ o H₂).",
      ], [`Ecuación balanceada: ${ecuacion(rx)}.`, "Cada elemento tiene la misma cantidad de átomos a ambos lados."], "Una ecuación balanceada respeta la conservación de la masa: los átomos no se crean ni se destruyen."),
      opts,
    );
  },
};

export const quiBalanceoCoeficiente: Generator = {
  id: "qui-balanceo-coeficiente",
  topicId: "t-qui-balanceo",
  description: "Coeficiente estequiométrico de una especie al balancear",
  generate(seed, d) {
    const r = rng(seed);
    const pool = d <= 2 ? REACCIONES.filter((x) => x.r.length + x.p.length <= 3 && [...x.r, ...x.p].some(([c]) => c > 1)) : d <= 4 ? REACCIONES.slice(0, 14) : REACCIONES.slice(10);
    const rx = r.pick(pool);
    const all = [...rx.r, ...rx.p];
    const cands = all.map((t, i) => [t, i] as const).filter(([[c]]) => c > 1);
    const [[c, key]] = cands.length ? r.pick(cands) : [all[0], 0];
    const sp = SP[key];
    const atomsPer = Object.values(sp.comp).reduce((s, x) => s + x, 0);
    const otros = all.filter(([, k]) => k !== key).map(([cc]) => cc);
    const errors: Err[] = [
      ...(atomsPer > 1 ? [[c * atomsPer, "conceptual", `Contaste átomos en lugar de moléculas: el coeficiente indica cuántas unidades de $${sp.f}$ hay, y cada una tiene ${atomsPer} átomos.`] as Err] : []),
      [c * 2, "conceptual", "Está balanceada, pero no con los MENORES enteros posibles: simplificá."],
      ...otros.filter((o) => o !== c).slice(0, 1).map((o) => [o, "interpretacion", "Ese es el coeficiente de otra sustancia de la ecuación."] as Err),
    ];
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "", mode: "int", answer: c,
      prompt: `Balanceá con los menores coeficientes enteros: ${esqueleto(rx)}. ¿Cuál es el coeficiente de $${sp.f}$?`,
      hints: ["Empezá por el elemento que aparece en menos sustancias (dejá H y O para el final).", "Solo se cambian coeficientes, nunca subíndices.", "Si te queda un coeficiente fraccionario (como 7/2), multiplicá todo por 2."],
      solution: [`Ecuación balanceada: ${ecuacion(rx)}`, `Coeficiente de ${sp.f}: ${c}`],
      explanation: "Los coeficientes indican la proporción en moles (o moléculas) en que reaccionan y se forman las sustancias.",
      errors,
    });
  },
};

/** Pares reactivo→sustancia para estequiometría simple (el otro reactivo, en exceso). */
function parEstequio(r: Rng, rx: Reaccion) {
  const A = r.pick(rx.r);
  const otros = [...rx.r, ...rx.p].filter(([, k]) => k !== A[1]);
  const prods = rx.p;
  const B = r.bool() ? r.pick(prods) : r.pick(otros);
  return { A, B };
}

export const quiEstequiometriaMasa: Generator = {
  id: "qui-estequiometria-masa",
  topicId: "t-qui-estequiometria",
  description: "Estequiometría masa–masa, masa–volumen (CNPT) y masa–volumen con PV = nRT",
  generate(seed, d) {
    const r = rng(seed);
    const pool = d <= 2 ? REACCIONES.filter((x) => x.r.length + x.p.length <= 3 || x.r.length === 1) : REACCIONES;
    let rx = r.pick(pool);
    let { A, B } = parEstequio(r, rx);
    const wantGas = d >= 4;
    for (let i = 0; i < 30 && wantGas && !GASES.has(B[1]); i++) {
      rx = r.pick(pool);
      ({ A, B } = parEstequio(r, rx));
    }
    const [a, ka] = A;
    const [b, kb] = B;
    const SA = SP[ka];
    const SB = SP[kb];
    const MA = mm(SA.comp);
    const MB = mm(SB.comp);
    const mA = r.pick([10, 20, 25, 50, 64, 100, 150]);
    const nA = mA / MA;
    const nB = (nA * b) / a;
    const gasMode = wantGas && GASES.has(kb) ? (d >= 6 ? "ntp" : "cnpt") : "masa";
    const eq = ecuacion(rx);
    const masas = masasDe(...[...rx.r, ...rx.p].map(([, k]) => SP[k]));
    if (gasMode === "masa") {
      const mB = nB * MB;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "g", answer: mB,
        prompt: `Según ${eq}, ¿qué masa de ${SB.name} ($${SB.f}$) ${rx.r.some(([, k]) => k === kb) ? "reacciona" : "se forma"} a partir de ${mA} g de ${SA.name} ($${SA.f}$)? (Los demás reactivos, en exceso.) ${masas}`,
        hints: ["Los coeficientes relacionan MOLES, no gramos.", `Pasá ${mA} g de ${SA.f} a moles y usá la relación ${b}/${a}.`, "Después pasá los moles a gramos con la masa molar."],
        solution: [`n(${SA.f}) = ${mA} / ${n(MA)} = ${s3(nA)} mol`, `n(${SB.f}) = ${s3(nA)} · ${b}/${a} = ${s3(nB)} mol`, `m(${SB.f}) = ${s3(nB)} · ${n(MB)} = ${s3(mB)} g`],
        explanation: "Camino estequiométrico: gramos → moles → relación de coeficientes → moles → gramos.",
        errors: [
          [nA * MB, "conceptual", "Usaste una relación 1 : 1. Los coeficientes de la ecuación balanceada dan la proporción en moles."],
          [(nA * a * MB) / b, "formula", `Invertiste la relación de coeficientes: por cada ${a} mol de ${SA.f} hay ${b} mol de ${SB.f}.`],
          [(mA * b) / a, "conceptual", "Aplicaste los coeficientes directamente a los GRAMOS. Primero hay que pasar a moles."],
        ],
      });
    }
    if (gasMode === "cnpt") {
      const V = nB * 22.4;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "L", answer: V,
        prompt: `Según ${eq}, ¿qué volumen de $${SB.f}$ medido en CNPT ${rx.r.some(([, k]) => k === kb) ? "se consume" : "se obtiene"} a partir de ${mA} g de $${SA.f}$? (Volumen molar en CNPT: 22,4 L/mol.) ${masas}`,
        hints: ["Primero moles del dato.", `Relación ${b}/${a} entre los coeficientes.`, "En CNPT, 1 mol de gas ocupa 22,4 L."],
        solution: [`n(${SA.f}) = ${mA} / ${n(MA)} = ${s3(nA)} mol`, `n(${SB.f}) = ${s3(nA)} · ${b}/${a} = ${s3(nB)} mol`, `V = ${s3(nB)} · 22,4 = ${s3(V)} L`],
        explanation: "En CNPT cualquier gas ideal ocupa 22,4 L por mol.",
        errors: [[nA * 22.4, "conceptual", "Usaste relación 1 : 1; aplicá los coeficientes."], [nB * MB, "interpretacion", "Calculaste la masa; se pedía el volumen del gas."], [(nA * a * 22.4) / b, "formula", "Invertiste la relación de coeficientes."]],
      });
    }
    const t = r.pick([27, 37, 127]);
    const P = r.pick([1, 1.5, 2]);
    const V = (nB * R * K(t)) / P;
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "L", answer: V,
      prompt: `Según ${eq}, ¿qué volumen de $${SB.f}$, medido a ${t} °C y ${n(P)} atm, ${rx.r.some(([, k]) => k === kb) ? "se consume" : "se obtiene"} a partir de ${mA} g de $${SA.f}$? (R = 0,082 atm·L/(mol·K).) ${masas}`,
      hints: ["Moles del dato y relación de coeficientes.", "Con los moles del gas, usá PV = nRT.", "T en kelvin."],
      solution: [`n(${SB.f}) = ${mA}/${n(MA)} · ${b}/${a} = ${s3(nB)} mol`, `V = nRT/P = ${s3(nB)} · 0,082 · ${K(t)} / ${n(P)} = ${s3(V)} L`],
      explanation: "La estequiometría da los moles; la ecuación de estado los convierte en volumen a esas condiciones.",
      errors: [[nB * 22.4, "conceptual", "22,4 L/mol vale solo en CNPT (0 °C y 1 atm). Acá usá PV = nRT."], [(nB * R * t) / P, "unidades", "La temperatura va en kelvin."], [(nA * R * K(t)) / P, "conceptual", "Te faltó la relación de coeficientes."]],
    });
  },
};

const DOS_REACTIVOS = REACCIONES.filter((x) => x.r.length === 2);

export const quiReactivoLimitante: Generator = {
  id: "qui-reactivo-limitante",
  topicId: "t-qui-limitante",
  description: "Reactivo limitante: producto formado y exceso remanente",
  generate(seed, d) {
    const r = rng(seed);
    const rx = r.pick(d <= 2 ? DOS_REACTIVOS.slice(0, 6) : DOS_REACTIVOS);
    const [[a, ka], [b, kb]] = rx.r;
    const [c, kc] = r.pick(rx.p);
    const SA = SP[ka], SB = SP[kb], SC = SP[kc];
    const MA = mm(SA.comp), MB = mm(SB.comp), MC = mm(SC.comp);
    const mA = r.pick([10, 20, 30, 40, 50, 80, 100]);
    let mB = r.pick([10, 20, 30, 40, 50, 80, 100]);
    let qA = mA / MA / a;
    let qB = mB / MB / b;
    if (Math.abs(qA - qB) / Math.max(qA, qB) < 0.08) {
      mB = mB * 2;
      qB = mB / MB / b;
    }
    const limA = qA < qB;
    const lim = limA ? SA : SB;
    const exc = limA ? SB : SA;
    const qLim = Math.min(qA, qB);
    const qExc = Math.max(qA, qB);
    const mC = qLim * c * MC;
    const masas = masasDe(SA, SB, SC);
    const eq = ecuacion(rx);
    if (d <= 4) {
      const errors: Err[] = [
        [qExc * c * MC, "conceptual", `Calculaste con el ${exc.name}, que está en exceso. El producto lo limita el reactivo que se agota primero: ${lim.name}.`],
        [(mA / MA + mB / MB) * c * MC, "conceptual", "Sumaste los moles de los dos reactivos. El producto se calcula solo con el limitante."],
      ];
      const menorMasa = mA < mB ? qA : qB;
      if (menorMasa !== qLim) errors.push([menorMasa * c * MC, "conceptual", "El limitante no es el que tiene menos GRAMOS: hay que comparar moles divididos por su coeficiente."]);
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "g", answer: mC,
        prompt: `Según ${eq}, se mezclan ${mA} g de $${SA.f}$ y ${mB} g de $${SB.f}$. ¿Qué masa de $${SC.f}$ se forma como máximo? ${masas}`,
        hints: ["Pasá las dos masas a moles.", "Dividí los moles de cada reactivo por su coeficiente: el menor cociente es el limitante.", "Calculá el producto a partir del limitante."],
        solution: [
          `n(${SA.f}) = ${mA}/${n(MA)} = ${s3(mA / MA)} mol → ÷${a} = ${s3(qA)}`,
          `n(${SB.f}) = ${mB}/${n(MB)} = ${s3(mB / MB)} mol → ÷${b} = ${s3(qB)}`,
          `Limitante: ${lim.f} (menor cociente)`,
          `n(${SC.f}) = ${s3(qLim)} · ${c} = ${s3(qLim * c)} mol → m = ${s3(mC)} g`,
        ],
        explanation: "El reactivo limitante se consume por completo y determina cuánto producto se forma; el otro sobra.",
        errors,
      });
    }
    const ce = limA ? b : a;
    const ME = limA ? MB : MA;
    const mE0 = limA ? mB : mA;
    const reacc = qLim * ce * ME;
    const sobra = mE0 - reacc;
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "g", answer: sobra,
      prompt: `Según ${eq}, se mezclan ${mA} g de $${SA.f}$ y ${mB} g de $${SB.f}$. ¿Qué masa del reactivo en exceso queda sin reaccionar? ${masas}`,
      hints: ["Primero encontrá el limitante (moles ÷ coeficiente, el menor).", "Con el limitante, calculá cuántos moles del otro reactivo se consumen.", "Sobrante = masa inicial − masa que reaccionó."],
      solution: [
        `Cocientes: ${SA.f} → ${s3(qA)}; ${SB.f} → ${s3(qB)}. Limitante: ${lim.f}`,
        `Reacciona de ${exc.f}: ${s3(qLim)} · ${ce} · ${n(ME)} = ${s3(reacc)} g`,
        `Sobra: ${mE0} − ${s3(reacc)} = ${s3(sobra)} g`,
      ],
      explanation: "El exceso es lo que queda del reactivo no limitante una vez que el limitante se agotó.",
      errors: [[reacc, "interpretacion", "Esa es la masa que REACCIONA del exceso; falta restarla de la masa inicial."], [mE0 - qLim * ME, "conceptual", "Te faltó el coeficiente del reactivo en exceso en la relación molar."]],
    });
  },
};

const UN_REACTIVO: { rx: Reaccion; A: string; P: string; impureza: string }[] = [
  { rx: REACCIONES[7], A: "CaCO3", P: "CaO", impureza: "piedra caliza" },
  { rx: REACCIONES[7], A: "CaCO3", P: "CO2", impureza: "piedra caliza" },
  { rx: REACCIONES[8], A: "KClO3", P: "O2", impureza: "clorato de potasio comercial" },
  { rx: REACCIONES[9], A: "Zn", P: "ZnCl2", impureza: "zinc impuro" },
  { rx: REACCIONES[9], A: "Zn", P: "H2", impureza: "zinc impuro" },
  { rx: REACCIONES[17], A: "Fe2O3", P: "Fe", impureza: "mineral de hierro" },
  { rx: REACCIONES[6], A: "Al", P: "AlCl3", impureza: "aluminio impuro" },
  { rx: REACCIONES[19], A: "Mg", P: "MgCl2", impureza: "magnesio impuro" },
];

export const quiRendimientoPureza: Generator = {
  id: "qui-rendimiento-pureza",
  topicId: "t-qui-limitante",
  description: "Pureza de reactivos y rendimiento de reacción",
  generate(seed, d) {
    const r = rng(seed);
    const it = r.pick(UN_REACTIVO);
    const term = (k: string) => [...it.rx.r, ...it.rx.p].find(([, x]) => x === k)!;
    const [a] = term(it.A);
    const [p] = term(it.P);
    const SA = SP[it.A], SPp = SP[it.P];
    const MA = mm(SA.comp), MP = mm(SPp.comp);
    const factor = (p / a) * (MP / MA); // g de producto por g de A puro
    const eq = ecuacion(it.rx);
    const masas = masasDe(SA, SPp);
    const tipo = d <= 2 ? 0 : d <= 3 ? 1 : d <= 5 ? 2 : 3;
    if (tipo === 0) {
      const m = r.pick([20, 50, 100, 200, 250]);
      const eta = r.pick([60, 70, 75, 80, 85, 90]);
      const teo = m * factor;
      const real = Math.round(teo * eta) / 100;
      const rend = (real / teo) * 100;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "%", answer: rend,
        prompt: `Según ${eq}, a partir de ${m} g de $${SA.f}$ puro se obtienen ${n(real, 2)} g de $${SPp.f}$. ¿Cuál es el rendimiento de la reacción? ${masas}`,
        hints: ["Calculá la masa teórica: lo que se formaría si todo reaccionara.", "Rendimiento = masa real / masa teórica · 100.", "La masa real es la que se obtuvo en el laboratorio."],
        solution: [`Teórico: ${m}/${n(MA)} · ${p}/${a} · ${n(MP)} = ${s3(teo)} g`, `Rendimiento = ${n(real, 2)} / ${s3(teo)} · 100 = ${s3(rend)} %`],
        explanation: "El rendimiento compara lo obtenido con el máximo posible según la estequiometría; siempre es ≤ 100 %.",
        errors: [[(teo / real) * 100, "formula", "Dividiste al revés: el rendimiento es real/teórico (no puede superar 100 %)."], [(real / m) * 100, "conceptual", "Comparaste con la masa de REACTIVO. Hay que comparar con la masa teórica de producto."]],
      });
    }
    if (tipo === 1) {
      const m = r.pick([50, 80, 100, 200, 500]);
      const pur = r.pick([60, 75, 80, 85, 90, 95]);
      const mP = m * (pur / 100) * factor;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "g", answer: mP,
        prompt: `Según ${eq}, ¿qué masa de $${SPp.f}$ se obtiene a partir de ${m} g de ${it.impureza} con ${pur} % de pureza en $${SA.f}$? (Rendimiento 100 %; las impurezas no reaccionan.) ${masas}`,
        hints: ["Solo reacciona la parte pura de la muestra.", `Masa pura = ${pur}/100 · ${m} g.`, "Con la masa pura hacé el cálculo estequiométrico."],
        solution: [`m(${SA.f}) pura = ${pur}/100 · ${m} = ${n((m * pur) / 100)} g`, `m(${SPp.f}) = ${n((m * pur) / 100)}/${n(MA)} · ${p}/${a} · ${n(MP)} = ${s3(mP)} g`],
        explanation: "La pureza indica qué fracción de la muestra es realmente el reactivo.",
        errors: [[m * factor, "conceptual", "No tuviste en cuenta la pureza: las impurezas no reaccionan."], [(m / (pur / 100)) * factor, "formula", "Dividiste por la pureza. La masa pura es MENOR que la de la muestra: se multiplica."]],
      });
    }
    const pur = r.pick([70, 80, 85, 90, 95]);
    const eta = r.pick([60, 75, 80, 90]);
    if (tipo === 2) {
      const m = r.pick([100, 200, 250, 500]);
      const mP = m * (pur / 100) * factor * (eta / 100);
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "g", answer: mP,
        prompt: `Según ${eq}, se usan ${m} g de ${it.impureza} (${pur} % de $${SA.f}$) y la reacción tiene un rendimiento del ${eta} %. ¿Qué masa de $${SPp.f}$ se obtiene? ${masas}`,
        hints: ["Primero la masa pura.", "Después la masa teórica de producto.", "Por último aplicá el rendimiento (se obtiene MENOS que lo teórico)."],
        solution: [`Pura: ${pur}/100 · ${m} = ${n((m * pur) / 100)} g`, `Teórico: ${s3(m * (pur / 100) * factor)} g`, `Real: ${s3(m * (pur / 100) * factor)} · ${eta}/100 = ${s3(mP)} g`],
        explanation: "Pureza y rendimiento se aplican ambos como factores menores que 1.",
        errors: [[m * (pur / 100) * factor, "conceptual", "Te faltó aplicar el rendimiento."], [m * factor * (eta / 100), "conceptual", "Te faltó aplicar la pureza."], [(m * (pur / 100) * factor) / (eta / 100), "formula", "Dividiste por el rendimiento: lo real es menor que lo teórico, se multiplica."]],
      });
    }
    const target = r.pick([10, 25, 50, 100]);
    const need = target / (eta / 100) / factor / (pur / 100);
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "g", answer: need,
      prompt: `Según ${eq}, querés obtener ${target} g de $${SPp.f}$. Si la reacción rinde ${eta} % y el ${it.impureza} tiene ${pur} % de pureza en $${SA.f}$, ¿qué masa de muestra necesitás? ${masas}`,
      hints: ["Pensá hacia atrás: si rinde menos de 100 %, tenés que planear producir MÁS.", `Teórico necesario = ${target} / (${eta}/100).`, "Pasá a masa pura de reactivo y después dividí por la pureza."],
      solution: [`Teórico: ${target} / ${n(eta / 100)} = ${s3(target / (eta / 100))} g de ${SPp.f}`, `Reactivo puro: ${s3(target / (eta / 100))} / ${n(MP)} · ${a}/${p} · ${n(MA)} = ${s3(target / (eta / 100) / factor)} g`, `Muestra: ${s3(target / (eta / 100) / factor)} / ${n(pur / 100)} = ${s3(need)} g`],
      explanation: "Hacia atrás, rendimiento y pureza DIVIDEN: necesitás más muestra para compensar pérdidas e impurezas.",
      errors: [[(target * (eta / 100)) / factor / (pur / 100), "formula", "Multiplicaste por el rendimiento. Si se pierde parte, hay que partir de MÁS reactivo: se divide."], [target / factor, "conceptual", "Te faltó considerar el rendimiento y la pureza."], [target / (eta / 100) / factor, "conceptual", "Esa es la masa de reactivo PURO; falta pasar a masa de muestra con la pureza."]],
    });
  },
};

// ═══════════════════════════ Unidad 9: Equilibrio químico ═══════════════════════════

interface Eq {
  r: [number, string][];
  p: [number, string][];
  dH: 1 | -1;
}

const EQUILIBRIOS: Eq[] = [
  { r: [[1, "N_2"], [3, "H_2"]], p: [[2, "NH_3"]], dH: -1 },
  { r: [[1, "H_2"], [1, "I_2"]], p: [[2, "HI"]], dH: -1 },
  { r: [[2, "SO_2"], [1, "O_2"]], p: [[2, "SO_3"]], dH: -1 },
  { r: [[1, "N_2O_4"]], p: [[2, "NO_2"]], dH: 1 },
  { r: [[1, "PCl_5"]], p: [[1, "PCl_3"], [1, "Cl_2"]], dH: 1 },
  { r: [[1, "CO"], [1, "H_2O"]], p: [[1, "CO_2"], [1, "H_2"]], dH: -1 },
];

const eqTxt = (e: Eq) => {
  const t = (xs: [number, string][]) => xs.map(([c, f]) => `${c === 1 ? "" : c}${f}`).join(" + ");
  return `$${t(e.r)} ⇌ ${t(e.p)}$`;
};
const dnGas = (e: Eq) => e.p.reduce((s, [c]) => s + c, 0) - e.r.reduce((s, [c]) => s + c, 0);
const kcExpr = (e: Eq) => {
  const t = (xs: [number, string][]) => xs.map(([c, f]) => `[${f}]${c === 1 ? "" : `^${c}`}`).join("·");
  return `Kc = ${t(e.p)} / (${t(e.r)})`;
};
const prodPow = (xs: [number, string][], conc: Record<string, number>, usePow = true) => xs.reduce((s, [c, f]) => s * conc[f] ** (usePow ? c : 1), 1);

export const quiKcCalculo: Generator = {
  id: "qui-kc-calculo",
  topicId: "t-qui-equilibrio",
  description: "Constante de equilibrio Kc: con concentraciones, con moles y volumen, y con tabla de avance",
  generate(seed, d) {
    const r = rng(seed);
    const e = r.pick(EQUILIBRIOS);
    const all = [...e.r, ...e.p];
    const tipo = d <= 3 ? 0 : d === 4 ? 1 : 2;
    let conc: Record<string, number> = {};
    let V = 1;
    let datos = "";
    let pasos: string[] = [];
    let concSinV: Record<string, number> | null = null;
    let concIni: Record<string, number> | null = null;
    if (tipo === 0) {
      all.forEach(([, f]) => (conc[f] = r.pick([0.1, 0.2, 0.25, 0.4, 0.5, 0.8, 1, 1.2, 1.5, 2])));
      datos = `En el equilibrio: ${all.map(([, f]) => `$[${f}] = ${n(conc[f])}$ M`).join(", ")}.`;
    } else if (tipo === 1) {
      V = r.pick([2, 4, 5, 10]);
      const moles: Record<string, number> = {};
      all.forEach(([, f]) => (moles[f] = r.pick([0.2, 0.4, 0.5, 0.8, 1, 1.5, 2, 3])));
      all.forEach(([, f]) => (conc[f] = moles[f] / V));
      concSinV = moles;
      datos = `En un recipiente de ${V} L, en el equilibrio hay: ${all.map(([, f]) => `${n(moles[f])} mol de $${f}$`).join(", ")}.`;
      pasos.push(`Concentraciones (n/V): ${all.map(([, f]) => `[${f}] = ${n(moles[f])}/${V} = ${n(conc[f])} M`).join("; ")}`);
    } else {
      V = r.pick([1, 2, 5]);
      const ini: Record<string, number> = {};
      e.r.forEach(([, f]) => (ini[f] = r.pick([1, 2, 3, 4])));
      const maxX = Math.min(...e.r.map(([c, f]) => ini[f] / c));
      const x = Math.round(maxX * r.pick([0.2, 0.3, 0.4, 0.5, 0.6]) * 100) / 100;
      const [cp, fp] = e.p[0];
      const nEqP = cp * x;
      const nEq: Record<string, number> = {};
      e.r.forEach(([c, f]) => (nEq[f] = ini[f] - c * x));
      e.p.forEach(([c, f]) => (nEq[f] = c * x));
      all.forEach(([, f]) => (conc[f] = nEq[f] / V));
      concIni = {};
      e.r.forEach(([, f]) => (concIni![f] = ini[f] / V));
      e.p.forEach(([c, f]) => (concIni![f] = (c * x) / V));
      datos = `En un recipiente de ${V} L se colocan ${e.r.map(([, f]) => `${n(ini[f])} mol de $${f}$`).join(" y ")} (sin productos). Al llegar al equilibrio hay ${n(nEqP)} mol de $${fp}$.`;
      pasos.push(`Avance: x = ${n(nEqP)}/${cp} = ${n(x)} mol`);
      pasos.push(`Moles en el equilibrio: ${all.map(([, f]) => `${f}: ${n(nEq[f])}`).join("; ")}`);
      pasos.push(`Concentraciones (÷ ${V} L): ${all.map(([, f]) => `[${f}] = ${n(conc[f], 4)}`).join("; ")}`);
    }
    const Kc = prodPow(e.p, conc) / prodPow(e.r, conc);
    const errors: Err[] = [
      [1 / Kc, "formula", "Invertiste la expresión: en Kc los productos van en el numerador y los reactivos en el denominador."],
      [prodPow(e.p, conc, false) / prodPow(e.r, conc, false), "potencias", "Te olvidaste de elevar cada concentración a su coeficiente estequiométrico."],
      ...(concSinV ? [[prodPow(e.p, concSinV) / prodPow(e.r, concSinV), "unidades", "Usaste moles en lugar de concentraciones: dividí cada cantidad por el volumen."] as Err] : []),
      ...(concIni ? [[prodPow(e.p, concIni) / prodPow(e.r, concIni), "conceptual", "Usaste las cantidades INICIALES de los reactivos. En Kc van las de equilibrio (iniciales menos lo que reaccionó)."] as Err] : []),
    ];
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "", answer: Kc,
      prompt: `Para el equilibrio ${eqTxt(e)} (todas las especies gaseosas): ${datos} ¿Cuánto vale Kc?`,
      hints: ["Kc = productos sobre reactivos, en concentraciones molares de equilibrio.", "Cada concentración va elevada a su coeficiente.", tipo === 2 ? "Armá la tabla inicial / cambio / equilibrio con el avance x." : tipo === 1 ? "Primero pasá los moles a molaridad dividiendo por el volumen." : `Escribí ${kcExpr(e)} y reemplazá.`],
      solution: [kcExpr(e), ...pasos, `Kc = ${s3(Kc)}`],
      explanation: "Kc relaciona las concentraciones de equilibrio; a una temperatura dada es constante.",
      errors,
    });
  },
};

type Pert = "addR" | "remP" | "addP" | "subeP" | "bajaP" | "subeT" | "bajaT" | "cat" | "inerte";
type Dir = "der" | "izq" | "no";
const DIR_TXT: Record<Dir, string> = { der: "Se desplaza hacia los productos (derecha)", izq: "Se desplaza hacia los reactivos (izquierda)", no: "No se desplaza" };

export const quiLeChatelier: Generator = {
  id: "qui-le-chatelier",
  topicId: "t-qui-equilibrio",
  description: "Principio de Le Chatelier (concentración, presión, temperatura, catalizador) y efecto sobre Kc",
  generate(seed, d) {
    const r = rng(seed);
    const e = r.pick(EQUILIBRIOS);
    const dn = dnGas(e);
    const pool: Pert[] = d <= 2 ? ["addR", "remP", "addP"] : d <= 4 ? ["addR", "remP", "addP", "subeP", "bajaP", "subeT", "bajaT"] : ["subeP", "bajaP", "subeT", "bajaT", "cat", "inerte"];
    const pert = r.pick(pool);
    const R0 = e.r[0][1];
    const P0 = e.p[0][1];
    const termo = e.dH < 0 ? "exotérmica (ΔH < 0)" : "endotérmica (ΔH > 0)";
    const pertTxt: Record<Pert, string> = {
      addR: `se agrega $${R0}$`,
      remP: `se retira $${P0}$`,
      addP: `se agrega $${P0}$`,
      subeP: "se aumenta la presión reduciendo el volumen del recipiente",
      bajaP: "se disminuye la presión aumentando el volumen del recipiente",
      subeT: "se aumenta la temperatura",
      bajaT: "se disminuye la temperatura",
      cat: "se agrega un catalizador",
      inerte: "se agrega un gas inerte (argón) a volumen constante",
    };
    let dir: Dir;
    let why: string;
    switch (pert) {
      case "addR":
      case "remP":
        dir = "der";
        why = "El sistema consume lo agregado (o repone lo retirado): se forman más productos.";
        break;
      case "addP":
        dir = "izq";
        why = "El sistema consume el producto agregado: se forma más reactivo.";
        break;
      case "subeP":
        dir = dn === 0 ? "no" : dn < 0 ? "der" : "izq";
        why = dn === 0 ? "Hay la misma cantidad de moles gaseosos a cada lado: la presión no lo desplaza." : "Al aumentar la presión, se favorece el lado con MENOS moles gaseosos.";
        break;
      case "bajaP":
        dir = dn === 0 ? "no" : dn > 0 ? "der" : "izq";
        why = dn === 0 ? "Igual cantidad de moles gaseosos a cada lado: no se desplaza." : "Al bajar la presión, se favorece el lado con MÁS moles gaseosos.";
        break;
      case "subeT":
        dir = e.dH > 0 ? "der" : "izq";
        why = "Al calentar se favorece el sentido endotérmico (el que absorbe calor).";
        break;
      case "bajaT":
        dir = e.dH > 0 ? "izq" : "der";
        why = "Al enfriar se favorece el sentido exotérmico (el que libera calor).";
        break;
      default:
        dir = "no";
        why = pert === "cat" ? "El catalizador acelera por igual la reacción directa y la inversa: se llega antes al equilibrio, pero no cambia su posición." : "A volumen constante, el gas inerte no cambia las concentraciones (ni las presiones parciales) de las especies: no hay desplazamiento.";
    }
    const askK = d >= 5 && (pert === "subeT" || pert === "bajaT" || pert === "cat") && r.bool();
    const dnTxt = `Moles gaseosos: ${e.r.reduce((s, [c]) => s + c, 0)} (reactivos) y ${e.p.reduce((s, [c]) => s + c, 0)} (productos).`;
    const hints: [string, string, string] = [
      "Le Chatelier: el sistema responde contrarrestando el cambio.",
      pert === "subeP" || pert === "bajaP" ? dnTxt : pert === "subeT" || pert === "bajaT" ? `La reacción directa es ${termo}: tratá el calor como un reactivo o un producto.` : "Si agregás algo, el sistema lo consume; si lo retirás, lo repone.",
      "Kc solo cambia con la temperatura.",
    ];
    if (askK) {
      const kDir = pert === "cat" ? "no" : dir === "der" ? "aumenta" : "disminuye";
      const kOk = kDir === "no" ? "Kc no cambia" : `Kc ${kDir}`;
      const why2 = pert === "cat" ? "Un catalizador no modifica Kc." : `${why} Como la temperatura cambia, Kc también cambia: ${kOk.toLowerCase()}.`;
      return choice(
        r,
        cbase(this.id, seed, d, this.topicId, `Para ${eqTxt(e)}, reacción ${termo}, ${pertTxt[pert]}. ¿Qué pasa con Kc?`, hints, [why2], why2),
        [
          { text: kOk, correct: true },
          ...(["Kc aumenta", "Kc disminuye", "Kc no cambia"].filter((t) => t !== kOk).map((t) => ({
            text: t,
            error: { type: "conceptual" as ErrorType, message: t === "Kc no cambia" ? "Kc es constante solo a temperatura constante: al cambiar T, cambia Kc." : pert === "cat" ? "El catalizador no cambia Kc: acelera ambos sentidos por igual." : "Pensá hacia dónde se desplaza: si se forman más productos, el cociente productos/reactivos (Kc) crece." },
          }))),
        ],
      );
    }
    const wrongMsg = (w: Dir): string => {
      if (pert === "cat") return "Un catalizador no desplaza el equilibrio: acelera ambas reacciones por igual.";
      if (pert === "inerte") return "A volumen constante, el gas inerte no cambia las concentraciones de las especies que reaccionan.";
      if (w === "no") return "Esta perturbación sí altera el equilibrio: el sistema reacciona para contrarrestarla.";
      if (pert === "subeP" || pert === "bajaP") return dn === 0 ? "Hay igual cantidad de moles gaseosos a cada lado: la presión no favorece a ninguno." : `Contá los moles gaseosos: ${dnTxt} ${pert === "subeP" ? "Más presión favorece el lado con MENOS moles." : "Menos presión favorece el lado con MÁS moles."}`;
      if (pert === "subeT" || pert === "bajaT") return `La reacción directa es ${termo}. ${pert === "subeT" ? "Al calentar se favorece el sentido que ABSORBE calor." : "Al enfriar se favorece el sentido que LIBERA calor."}`;
      return "Invertiste el sentido: el sistema tiende a consumir lo que se agrega y a reponer lo que se quita.";
    };
    return choice(
      r,
      cbase(this.id, seed, d, this.topicId, `Para el equilibrio ${eqTxt(e)} (todo gaseoso; la reacción directa es ${termo}), ${pertTxt[pert]}. ¿Qué hace el equilibrio?`, hints, [why], why),
      (["der", "izq", "no"] as Dir[]).map((x) => (x === dir ? { text: DIR_TXT[x], correct: true } : { text: DIR_TXT[x], error: { type: "conceptual" as ErrorType, message: wrongMsg(x) } })),
    );
  },
};

// ═══════════════════════════ Unidad 10: Ácido-base y pH ═══════════════════════════

const log10 = Math.log10;

export const quiPhFuerte: Generator = {
  id: "qui-ph-fuerte",
  topicId: "t-qui-ph",
  description: "pH de ácidos y bases fuertes (incluye hidróxidos con 2 OH⁻ y datos en masa)",
  generate(seed, d) {
    const r = rng(seed);
    const C = r.pick([0.1, 0.01, 0.001, 0.05, 0.02, 0.005, 0.0025, 0.2, 0.004]);
    const tipo = d <= 2 ? 0 : d === 3 ? r.pick([0, 1]) : d === 4 ? r.pick([1, 2]) : r.pick([2, 3]);
    if (tipo === 0) {
      const ac = r.pick(["HCl", "HNO3"]);
      const pH = -log10(C);
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "", mode: "dec2", answer: pH,
        prompt: `¿Cuál es el pH de una solución ${n(C, 4)} M de ${SP[ac].name} ($${SP[ac].f}$), un ácido fuerte?`,
        hints: ["Un ácido fuerte monoprótico se disocia por completo: $[H^+] = C$.", "pH = −log[H⁺].", "El pH de un ácido es menor que 7 y positivo (para C < 1 M)."],
        solution: [`[H⁺] = ${n(C, 4)} M`, `pH = −log(${n(C, 4)}) = ${n(pH, 2)}`],
        explanation: "En un ácido fuerte toda la concentración se convierte en H⁺; el pH es −log de esa concentración.",
        errors: [[log10(C), "signos", "Te faltó el signo menos: pH = −log[H⁺]. Como [H⁺] < 1, el log es negativo y el pH queda positivo."], [14 + log10(C), "conceptual", "Calculaste como si fuera una base. Un ácido da pH < 7."]],
      });
    }
    if (tipo === 1) {
      const b = r.pick(["NaOH", "KOH"]);
      const pOH = -log10(C);
      const pH = 14 - pOH;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "", mode: "dec2", answer: pH,
        prompt: `¿Cuál es el pH de una solución ${n(C, 4)} M de ${SP[b].name} ($${SP[b].f}$), una base fuerte? (A 25 °C, pH + pOH = 14.)`,
        hints: ["Una base fuerte libera todo su OH⁻: $[OH^-] = C$.", "pOH = −log[OH⁻].", "pH = 14 − pOH."],
        solution: [`[OH⁻] = ${n(C, 4)} M`, `pOH = −log(${n(C, 4)}) = ${n(pOH, 2)}`, `pH = 14 − ${n(pOH, 2)} = ${n(pH, 2)}`],
        explanation: "Con bases se calcula primero el pOH y después el pH, usando pH + pOH = 14.",
        errors: [[pOH, "conceptual", "Ese es el pOH. Te falta hacer pH = 14 − pOH (una base tiene pH > 7)."], [-pH, "signos", "Revisá los signos: pH = 14 − pOH, positivo y mayor que 7."]],
      });
    }
    if (tipo === 2) {
      const met = r.pick(["Ca", "Ba"]);
      const b = `${met}(OH)_2`;
      const C2 = r.pick([0.005, 0.01, 0.025, 0.0005, 0.002]);
      const OH = 2 * C2;
      const pH = 14 + log10(OH);
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "", mode: "dec2", answer: pH,
        prompt: `¿Cuál es el pH de una solución ${n(C2, 4)} M de $${b}$? Suponé disociación completa: $${b} → ${met}^{2+} + 2OH^-$. (pH + pOH = 14.)`,
        hints: ["Cada unidad de fórmula libera DOS OH⁻.", `$[OH^-] = 2 · ${n(C2, 4)}$.`, "pOH = −log[OH⁻] y pH = 14 − pOH."],
        solution: [`[OH⁻] = 2 · ${n(C2, 4)} = ${n(OH, 4)} M`, `pOH = ${n(-log10(OH), 2)}`, `pH = 14 − ${n(-log10(OH), 2)} = ${n(pH, 2)}`],
        explanation: "La estequiometría de la disociación fija cuántos OH⁻ aporta cada mol de base.",
        errors: [[14 + log10(C2), "conceptual", "Te olvidaste del 2: cada $M(OH)_2$ libera dos OH⁻."], [-log10(OH), "conceptual", "Ese es el pOH; falta pH = 14 − pOH."]],
      });
    }
    const m = r.pick([0.2, 0.4, 0.8, 1, 2]);
    const V = r.pick([250, 500, 1000, 2000]);
    const Cn = m / 40 / (V / 1000);
    const pH = 14 + log10(Cn);
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "", mode: "dec2", answer: pH,
      prompt: `Se disuelven ${n(m)} g de $NaOH$ en agua hasta ${V} mL de solución. ¿Cuál es el pH? (Masa molar NaOH = 40 g/mol; pH + pOH = 14.)`,
      hints: ["Calculá la molaridad: moles / litros.", "Base fuerte: [OH⁻] = molaridad.", "pOH = −log[OH⁻]; pH = 14 − pOH."],
      solution: [`n = ${n(m)}/40 = ${n(m / 40, 4)} mol`, `[OH⁻] = ${n(m / 40, 4)} / ${n(V / 1000)} L = ${n(Cn, 4)} M`, `pOH = ${n(-log10(Cn), 2)} → pH = ${n(pH, 2)}`],
      explanation: "Masa → moles → molaridad → pOH → pH.",
      errors: [[14 + log10(m / 40 / V), "unidades", "Usaste el volumen en mL: la molaridad es mol/L."], [-log10(Cn), "conceptual", "Ese es el pOH."]],
    });
  },
};

const DEBILES: { name: string; f: string; K: number; base?: boolean }[] = [
  { name: "ácido acético", f: "CH_3COOH", K: 1.8e-5 },
  { name: "ácido fórmico", f: "HCOOH", K: 1.8e-4 },
  { name: "ácido benzoico", f: "C_6H_5COOH", K: 6.3e-5 },
  { name: "ácido hipocloroso", f: "HClO", K: 3.0e-8 },
  { name: "ácido cianhídrico", f: "HCN", K: 6.2e-10 },
  { name: "amoníaco", f: "NH_3", K: 1.8e-5, base: true },
];

export const quiPhDebil: Generator = {
  id: "qui-ph-debil",
  topicId: "t-qui-ph",
  description: "pH de ácidos y bases débiles con la aproximación [H⁺] ≈ √(Ka·C); grado de disociación",
  generate(seed, d) {
    const r = rng(seed);
    const pool = d <= 3 ? DEBILES.filter((x) => !x.base) : DEBILES;
    let sp = r.pick(pool);
    let C = r.pick([0.1, 0.2, 0.5, 1, 0.05, 0.01]);
    for (let i = 0; i < 30 && Math.sqrt(sp.K / C) >= 0.05; i++) {
      sp = r.pick(pool);
      C = r.pick([0.1, 0.2, 0.5, 1, 0.05, 0.01]);
    }
    if (Math.sqrt(sp.K / C) >= 0.05) {
      sp = DEBILES[0];
      C = 0.1;
    }
    const x = Math.sqrt(sp.K * C);
    const Ksym = sp.base ? "K_b" : "K_a";
    if (d >= 5 && r.bool()) {
      const alfa = (x / C) * 100;
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "%", answer: alfa,
        prompt: `¿Qué porcentaje de las moléculas de ${sp.name} ($${sp.f}$) está ionizado en una solución ${n(C)} M? ($${Ksym} = ${sci(sp.K)}$; usá la aproximación $x ≈ \\sqrt{${Ksym}·C}$.)`,
        hints: ["Calculá x = concentración ionizada.", `$x ≈ \\sqrt{${Ksym}·C}$.`, "Porcentaje de ionización = x / C · 100."],
        solution: [`x = √(${sci(sp.K)} · ${n(C)}) = ${sci(x, 3)} M`, `α = x/C · 100 = ${s3(alfa)} %`],
        explanation: "Un electrolito débil se ioniza solo en una pequeña fracción; esa fracción aumenta al diluir.",
        errors: [[100, "conceptual", "Eso supone ionización total (electrolito fuerte)."], [x / C, "calculo", "Esa es la fracción; multiplicá por 100 para el porcentaje."]],
      });
    }
    if (!sp.base) {
      const pH = -log10(x);
      return num({
        gen: this.id, seed, d, topicId: this.topicId, unit: "", mode: "dec2", answer: pH,
        prompt: `Calculá el pH de una solución ${n(C)} M de ${sp.name} ($${sp.f}$), $K_a = ${sci(sp.K)}$. Usá la aproximación $[H^+] ≈ \\sqrt{K_a·C}$.`,
        hints: ["Es un ácido DÉBIL: no se disocia por completo, [H⁺] ≠ C.", "$[H^+] ≈ \\sqrt{K_a·C}$ (vale si se disocia poco).", "pH = −log[H⁺]."],
        solution: [`[H⁺] ≈ √(${sci(sp.K)} · ${n(C)}) = ${sci(x, 3)} M`, `pH = −log[H⁺] = ${n(pH, 2)}`],
        explanation: "Del equilibrio HA ⇌ H⁺ + A⁻: Ka = x²/(C − x) ≈ x²/C si x ≪ C, entonces x = √(Ka·C).",
        errors: [[-log10(C), "conceptual", "Lo trataste como ácido fuerte ([H⁺] = C). Un ácido débil se disocia muy poco."], [-log10(sp.K * C), "formula", "Te faltó la raíz cuadrada: x² = Ka·C, así que x = √(Ka·C)."], [log10(x), "signos", "Te faltó el signo menos del pH."]],
      });
    }
    const pOH = -log10(x);
    const pH = 14 - pOH;
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "", mode: "dec2", answer: pH,
      prompt: `Calculá el pH de una solución ${n(C)} M de amoníaco ($NH_3$), $K_b = ${sci(sp.K)}$. Usá $[OH^-] ≈ \\sqrt{K_b·C}$ y pH + pOH = 14.`,
      hints: ["Es una base débil: calculá primero [OH⁻].", "$[OH^-] ≈ \\sqrt{K_b·C}$.", "pOH = −log[OH⁻] y pH = 14 − pOH."],
      solution: [`[OH⁻] ≈ √(${sci(sp.K)} · ${n(C)}) = ${sci(x, 3)} M`, `pOH = ${n(pOH, 2)}`, `pH = 14 − ${n(pOH, 2)} = ${n(pH, 2)}`],
      explanation: "Para una base débil B + H₂O ⇌ BH⁺ + OH⁻, con Kb = x²/(C − x) ≈ x²/C.",
      errors: [[pOH, "conceptual", "Ese es el pOH; falta pH = 14 − pOH."], [14 + log10(C), "conceptual", "La trataste como base fuerte."], [-log10(x), "conceptual", "Usaste [OH⁻] como si fuera [H⁺]."]],
    });
  },
};

// ═══════════════════════════ Unidad 11: Óxido-reducción ═══════════════════════════

const REDOX: { eq: string; ox: string; red: string; prods: string[]; e: number; atomo: string; porAtomo: number; nAtomos: number }[] = [
  { eq: "$Zn + Cu^{2+} → Zn^{2+} + Cu$", ox: "$Cu^{2+}$", red: "$Zn$", prods: ["$Zn^{2+}$", "$Cu$"], e: 2, atomo: "Zn", porAtomo: 2, nAtomos: 1 },
  { eq: "$2Al + 3Cu^{2+} → 2Al^{3+} + 3Cu$", ox: "$Cu^{2+}$", red: "$Al$", prods: ["$Al^{3+}$", "$Cu$"], e: 6, atomo: "Al", porAtomo: 3, nAtomos: 2 },
  { eq: "$Fe_2O_3 + 3CO → 2Fe + 3CO_2$", ox: "$Fe_2O_3$", red: "$CO$", prods: ["$Fe$", "$CO_2$"], e: 6, atomo: "C", porAtomo: 2, nAtomos: 3 },
  { eq: "$2Na + Cl_2 → 2NaCl$", ox: "$Cl_2$", red: "$Na$", prods: ["$NaCl$"], e: 2, atomo: "Na", porAtomo: 1, nAtomos: 2 },
  { eq: "$Cu + 2Ag^+ → Cu^{2+} + 2Ag$", ox: "$Ag^+$", red: "$Cu$", prods: ["$Cu^{2+}$", "$Ag$"], e: 2, atomo: "Cu", porAtomo: 2, nAtomos: 1 },
  { eq: "$2H_2 + O_2 → 2H_2O$", ox: "$O_2$", red: "$H_2$", prods: ["$H_2O$"], e: 4, atomo: "H", porAtomo: 1, nAtomos: 4 },
  { eq: "$CH_4 + 2O_2 → CO_2 + 2H_2O$", ox: "$O_2$", red: "$CH_4$", prods: ["$CO_2$", "$H_2O$"], e: 8, atomo: "C", porAtomo: 8, nAtomos: 1 },
  { eq: "$Cl_2 + 2Br^- → 2Cl^- + Br_2$", ox: "$Cl_2$", red: "$Br^-$", prods: ["$Cl^-$", "$Br_2$"], e: 2, atomo: "Br", porAtomo: 1, nAtomos: 2 },
  { eq: "$4Fe + 3O_2 → 2Fe_2O_3$", ox: "$O_2$", red: "$Fe$", prods: ["$Fe_2O_3$"], e: 12, atomo: "Fe", porAtomo: 3, nAtomos: 4 },
  { eq: "$Mg + 2H^+ → Mg^{2+} + H_2$", ox: "$H^+$", red: "$Mg$", prods: ["$Mg^{2+}$", "$H_2$"], e: 2, atomo: "Mg", porAtomo: 2, nAtomos: 1 },
];

export const quiRedoxIdentificar: Generator = {
  id: "qui-redox-identificar",
  topicId: "t-qui-redox",
  description: "Identificar agente oxidante, agente reductor, especie que se oxida y que se reduce",
  generate(seed, d) {
    const r = rng(seed);
    const it = r.pick(d <= 2 ? REDOX.slice(0, 5) : REDOX);
    const ask = r.pick(["oxidante", "reductor", "seOxida", "seReduce"] as const);
    const ok = ask === "oxidante" || ask === "seReduce" ? it.ox : it.red;
    const other = ok === it.ox ? it.red : it.ox;
    const pregunta = { oxidante: "el **agente oxidante**", reductor: "el **agente reductor**", seOxida: "la especie que **se oxida**", seReduce: "la especie que **se reduce**" }[ask];
    const why = `${it.red} pierde electrones (se oxida): es el reductor. ${it.ox} gana electrones (se reduce): es el oxidante.`;
    return choice(
      r,
      cbase(this.id, seed, d, this.topicId, `En la reacción ${it.eq}, ¿cuál es ${pregunta}?`, [
        "Asigná números de oxidación a cada elemento antes y después.",
        "Se oxida el que AUMENTA su número de oxidación (pierde e⁻); se reduce el que lo DISMINUYE (gana e⁻).",
        "El agente oxidante es el que se reduce; el agente reductor es el que se oxida.",
      ], [why], why),
      [
        { text: ok, correct: true },
        {
          text: other,
          error: {
            type: "conceptual",
            message: ask === "oxidante" || ask === "reductor" ? "Confundiste el agente con el proceso: el agente OXIDANTE oxida al otro y él mismo SE REDUCE (gana electrones)." : "Invertiste: oxidarse es PERDER electrones (sube el número de oxidación); reducirse es GANARLOS.",
          },
        },
        ...it.prods.slice(0, 2).map((p) => ({ text: p, error: { type: "interpretacion" as ErrorType, message: "Ese es un producto. El oxidante, el reductor y lo que se oxida o reduce se identifican entre los REACTIVOS." } })),
      ],
    );
  },
};

export const quiRedoxElectrones: Generator = {
  id: "qui-redox-electrones",
  topicId: "t-qui-redox",
  description: "Electrones transferidos por átomo y en total en una reacción redox balanceada",
  generate(seed, d) {
    const r = rng(seed);
    const it = r.pick(REDOX);
    const porAtomo = d <= 2;
    const ans = porAtomo ? it.porAtomo : it.e;
    return num({
      gen: this.id, seed, d, topicId: this.topicId, unit: "", mode: "int", answer: ans,
      prompt: porAtomo
        ? `En la reacción ${it.eq}, ¿cuántos electrones pierde **cada átomo** de ${it.atomo}?`
        : `En la reacción balanceada ${it.eq}, ¿cuántos electrones se transfieren **en total** (tal como está escrita la ecuación)?`,
      hints: [
        `Calculá el número de oxidación del ${it.atomo} antes y después.`,
        "La diferencia es la cantidad de electrones que pierde cada átomo.",
        porAtomo ? "Los electrones perdidos = aumento del número de oxidación." : `Multiplicá por la cantidad de átomos de ${it.atomo} que reaccionan según los coeficientes (${it.nAtomos}). Lo que pierde el reductor lo gana el oxidante: no se suma dos veces.`,
      ],
      solution: porAtomo
        ? [`Cada ${it.atomo} sube su número de oxidación en ${it.porAtomo}: pierde ${it.porAtomo} e⁻`]
        : [`Cada ${it.atomo} pierde ${it.porAtomo} e⁻`, `Átomos de ${it.atomo} en la ecuación: ${it.nAtomos}`, `Total: ${it.porAtomo} · ${it.nAtomos} = ${it.e} e⁻ (los mismos que gana el oxidante)`],
      explanation: "En una redox balanceada, los electrones perdidos por el reductor son exactamente los ganados por el oxidante.",
      errors: porAtomo
        ? [[it.e, "interpretacion", "Ese es el total de la ecuación. Se pedía por átomo."], [-it.porAtomo, "signos", "La cantidad de electrones es un número positivo; el signo del número de oxidación no se copia."]]
        : [[it.porAtomo, "conceptual", `Ese es el cambio de UN átomo. En la ecuación reaccionan ${it.nAtomos} átomos de ${it.atomo}.`], [2 * it.e, "conceptual", "Sumaste los perdidos y los ganados: son los MISMOS electrones contados dos veces."]],
    });
  },
};

export const QUIMICA_GENERATORS: Generator[] = [
  quiSistemasClasificar,
  quiFasesComponentes,
  quiDensidad,
  quiMezclaPorcentaje,
  quiParticulasSubatomicas,
  quiIsotoposPromedio,
  quiConfiguracionElectronica,
  quiTendenciasPeriodicas,
  quiTipoUnion,
  quiNumeroOxidacion,
  quiFormulaCompuesto,
  quiGeometriaPolaridad,
  quiFuerzasEbullicion,
  quiMasaMolar,
  quiComposicionCentesimal,
  quiMolesMasa,
  quiAvogadro,
  quiGasesCombinada,
  quiGasIdeal,
  quiPresionParcial,
  quiConcentracionPorcentual,
  quiMolaridad,
  quiDilucion,
  quiBalanceo,
  quiBalanceoCoeficiente,
  quiEstequiometriaMasa,
  quiReactivoLimitante,
  quiRendimientoPureza,
  quiKcCalculo,
  quiLeChatelier,
  quiPhFuerte,
  quiPhDebil,
  quiRedoxIdentificar,
  quiRedoxElectrones,
];
