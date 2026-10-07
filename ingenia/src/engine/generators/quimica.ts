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
    const nu = r.pick(NUCLIDOS);
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
        { text: config(el.Z, SUBNIVELES, 2), error: { type: "conceptual" as ErrorType, message: "Pusiste 2 electrones en cada subnivel. Capacidades: s → 2, p → 6, d → 10." } },
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
