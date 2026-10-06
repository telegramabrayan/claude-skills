/**
 * Generadores de Introducción al Pensamiento Científico (IPC 040, UBA XXI,
 * programa 2026, Cátedra A). Ejercicios conceptuales: elegir, relacionar,
 * ordenar y verdadero/falso.
 *
 * Unidad 1 es paramétrica de verdad: los argumentos se arman con plantillas y
 * proposiciones cotidianas o científicas, y los valores de verdad, la validez y
 * la clasificación (tautología / contradicción / contingencia) se CALCULAN
 * con tablas de verdad, nunca se escriben a mano.
 */
import type { Difficulty, ErrorType, Generator, MatchExercise, OrderExercise } from "../types";
import { rng, type Rng } from "./rng";
import { base, choice, type Option } from "./helpers";

const S = "ipc";

// ───────────────────────── Utilidades ─────────────────────────

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** Copia del rng que no mezcla (para opciones con orden fijo, como V/F). */
const fixed = (r: Rng): Rng => ({ ...r, shuffle: <T,>(a: T[]) => [...a] });

/** Toma n elementos distintos de una lista. */
const sample = <T,>(r: Rng, arr: readonly T[], n: number): T[] => r.shuffle([...arr]).slice(0, n);

// ───────────────────────── Fórmulas proposicionales ─────────────────────────

export type F =
  | { t: "var"; v: string }
  | { t: "not"; a: F }
  | { t: "and" | "or" | "xor" | "imp" | "iff"; a: F; b: F };

const V = (v: string): F => ({ t: "var", v });
const not = (a: F): F => ({ t: "not", a });
const and = (a: F, b: F): F => ({ t: "and", a, b });
const or = (a: F, b: F): F => ({ t: "or", a, b });
const xor = (a: F, b: F): F => ({ t: "xor", a, b });
const imp = (a: F, b: F): F => ({ t: "imp", a, b });
const iff = (a: F, b: F): F => ({ t: "iff", a, b });

export function evalF(f: F, env: Record<string, boolean>): boolean {
  switch (f.t) {
    case "var":
      return env[f.v];
    case "not":
      return !evalF(f.a, env);
    case "and":
      return evalF(f.a, env) && evalF(f.b, env);
    case "or":
      return evalF(f.a, env) || evalF(f.b, env);
    case "xor":
      return evalF(f.a, env) !== evalF(f.b, env);
    case "imp":
      return !evalF(f.a, env) || evalF(f.b, env);
    case "iff":
      return evalF(f.a, env) === evalF(f.b, env);
  }
}

function varsOf(f: F, acc = new Set<string>()): Set<string> {
  if (f.t === "var") acc.add(f.v);
  else if (f.t === "not") varsOf(f.a, acc);
  else {
    varsOf(f.a, acc);
    varsOf(f.b, acc);
  }
  return acc;
}

/** Todas las asignaciones de verdad de las variables dadas. */
function assignments(vars: string[]): Record<string, boolean>[] {
  const out: Record<string, boolean>[] = [];
  for (let m = 0; m < 1 << vars.length; m++) {
    const env: Record<string, boolean> = {};
    vars.forEach((v, i) => (env[v] = !((m >> (vars.length - 1 - i)) & 1)));
    out.push(env);
  }
  return out;
}

export type Modal = "tautologia" | "contradiccion" | "contingencia";

export function classify(f: F): Modal {
  const vals = assignments([...varsOf(f)].sort()).map((e) => evalF(f, e));
  if (vals.every(Boolean)) return "tautologia";
  if (vals.every((x) => !x)) return "contradiccion";
  return "contingencia";
}

/** ¿f y g son lógicamente equivalentes? */
function equivalentF(f: F, g: F): boolean {
  const vars = [...new Set([...varsOf(f), ...varsOf(g)])].sort();
  return assignments(vars).every((e) => evalF(f, e) === evalF(g, e));
}

/** ¿f implica lógicamente g? */
function entails(f: F, g: F): boolean {
  const vars = [...new Set([...varsOf(f), ...varsOf(g)])].sort();
  return assignments(vars).every((e) => !evalF(f, e) || evalF(g, e));
}

/** Escribe una fórmula con letras y conectivas en castellano, como la cátedra. */
export function words(f: F, top = true): string {
  const wrap = (s: string) => (top ? s : `(${s})`);
  switch (f.t) {
    case "var":
      return f.v;
    case "not":
      return f.a.t === "var" ? `no ${f.a.v}` : `no es cierto que ${words(f.a, false)}`;
    case "and":
      return wrap(`${words(f.a, false)} y ${words(f.b, false)}`);
    case "or":
      return wrap(`${words(f.a, false)} o ${words(f.b, false)}`);
    case "xor":
      return wrap(`o bien ${words(f.a, false)} o bien ${words(f.b, false)}`);
    case "imp":
      return wrap(`si ${words(f.a, false)}, entonces ${words(f.b, false)}`);
    case "iff":
      return wrap(`${words(f.a, false)} si y solo si ${words(f.b, false)}`);
  }
}

/** Notación simbólica (para la solución): ¬ ∧ ∨ → ↔. */
export function sym(f: F, top = true): string {
  const wrap = (s: string) => (top ? s : `(${s})`);
  switch (f.t) {
    case "var":
      return f.v;
    case "not":
      return `¬${sym(f.a, false)}`;
    case "and":
      return wrap(`${sym(f.a, false)} ∧ ${sym(f.b, false)}`);
    case "or":
      return wrap(`${sym(f.a, false)} ∨ ${sym(f.b, false)}`);
    case "xor":
      return wrap(`${sym(f.a, false)} ⊻ ${sym(f.b, false)}`);
    case "imp":
      return wrap(`${sym(f.a, false)} → ${sym(f.b, false)}`);
    case "iff":
      return wrap(`${sym(f.a, false)} ↔ ${sym(f.b, false)}`);
  }
}

const vf = (b: boolean) => (b ? "V" : "F");

// ───────────────────────── Proposiciones para los argumentos ─────────────────────────

interface P {
  p: string; // afirmativa, en minúscula
  n: string; // negada
}
type Theme = [P, P, P];

const pr = (p: string, n: string): P => ({ p, n });

/** Ternas temáticas: A suele llevar a B y B a C (para encadenar condicionales). */
const THEMES: Theme[] = [
  [pr("llueve", "no llueve"), pr("el partido se suspende", "el partido no se suspende"), pr("el club devuelve las entradas", "el club no devuelve las entradas")],
  [pr("se corta la luz", "no se corta la luz"), pr("la heladera deja de enfriar", "la heladera no deja de enfriar"), pr("la comida se echa a perder", "la comida no se echa a perder")],
  [pr("la muestra está contaminada", "la muestra no está contaminada"), pr("el cultivo da positivo", "el cultivo no da positivo"), pr("el laboratorio repite el análisis", "el laboratorio no repite el análisis")],
  [pr("Ana estudia todos los días", "Ana no estudia todos los días"), pr("Ana aprueba el parcial", "Ana no aprueba el parcial"), pr("Ana promociona la materia", "Ana no promociona la materia")],
  [pr("la planta recibe luz", "la planta no recibe luz"), pr("la planta hace fotosíntesis", "la planta no hace fotosíntesis"), pr("la planta libera oxígeno", "la planta no libera oxígeno")],
  [pr("la ruta se congela", "la ruta no se congela"), pr("se cierra el acceso norte", "no se cierra el acceso norte"), pr("los camiones toman la ruta 3", "los camiones no toman la ruta 3")],
  [pr("el colectivo se demora", "el colectivo no se demora"), pr("Lucas llega tarde", "Lucas no llega tarde"), pr("Lucas pierde el examen", "Lucas no pierde el examen")],
  [pr("el termómetro marca más de 38 °C", "el termómetro no marca más de 38 °C"), pr("Juan tiene fiebre", "Juan no tiene fiebre"), pr("Juan se queda en casa", "Juan no se queda en casa")],
  [pr("el agua del tanque se calienta", "el agua del tanque no se calienta"), pr("el agua se dilata", "el agua no se dilata"), pr("el nivel del tanque sube", "el nivel del tanque no sube")],
];

/** Condicional "si a, b" con distintas formas superficiales equivalentes. */
function condText(a: string, b: string, style: 0 | 1 | 2): string {
  if (style === 1) return `${b} si ${a}`;
  if (style === 2) return `${a} solo si ${b}`;
  return `si ${a}, ${b}`;
}

export type FormId = "MP" | "MT" | "SH" | "SD" | "SIMP" | "ADJ" | "AC" | "NA" | "OR-AFF" | "OR-NOSD";

interface FormInfo {
  name: string;
  valid: boolean;
  schema: string;
  why: string;
}

export const FORMS: Record<FormId, FormInfo> = {
  MP: { name: "Modus ponens", valid: true, schema: "Si A, B; A; por lo tanto, B", why: "Se afirma el antecedente y se concluye el consecuente: si las premisas son verdaderas, la conclusión no puede ser falsa." },
  MT: { name: "Modus tollens", valid: true, schema: "Si A, B; no B; por lo tanto, no A", why: "Se niega el consecuente y se concluye la negación del antecedente: si A fuera verdadera, B también lo sería." },
  SH: { name: "Silogismo hipotético", valid: true, schema: "Si A, B; si B, C; por lo tanto, si A, C", why: "Se encadenan dos condicionales." },
  SD: { name: "Silogismo disyuntivo", valid: true, schema: "A o B; no A; por lo tanto, B", why: "Si al menos una es verdadera y se descarta una, queda la otra." },
  SIMP: { name: "Simplificación", valid: true, schema: "A y B; por lo tanto, A", why: "Si una conjunción es verdadera, cada parte lo es." },
  ADJ: { name: "Adjunción", valid: true, schema: "A; B; por lo tanto, A y B", why: "Dos afirmaciones verdaderas forman una conjunción verdadera." },
  AC: { name: "Falacia de afirmación del consecuente", valid: false, schema: "Si A, B; B; por lo tanto, A", why: "B puede ser verdadera por otra razón aunque A sea falsa: hay casos con premisas V y conclusión F." },
  NA: { name: "Falacia de negación del antecedente", valid: false, schema: "Si A, B; no A; por lo tanto, no B", why: "Que A no ocurra no impide que B ocurra por otra causa." },
  "OR-AFF": { name: "Inválido (afirmar un disyunto)", valid: false, schema: "A o B; A; por lo tanto, no B", why: "La «o» inclusiva admite que ambas sean verdaderas: afirmar una no permite negar la otra." },
  "OR-NOSD": { name: "Inválido (disyunción sin descartar)", valid: false, schema: "A o B; por lo tanto, B", why: "Sin negar A, la disyunción no garantiza B: podría ser verdadera solo A." },
};

interface Arg {
  form: FormId;
  premises: string[];
  conclusion: string;
}

/** Arma un argumento concreto de la forma pedida con las proposiciones de un tema. */
function buildArg(form: FormId, th: Theme, style: 0 | 1 | 2 = 0): Arg {
  const [A, B, C] = th;
  const c = (a: string, b: string) => condText(a, b, style);
  switch (form) {
    case "MP":
      return { form, premises: [c(A.p, B.p), A.p], conclusion: B.p };
    case "MT":
      return { form, premises: [c(A.p, B.p), B.n], conclusion: A.n };
    case "SH":
      return { form, premises: [c(A.p, B.p), c(B.p, C.p)], conclusion: `si ${A.p}, ${C.p}` };
    case "SD":
      return { form, premises: [`${A.p} o ${C.p}`, A.n], conclusion: C.p };
    case "SIMP":
      return { form, premises: [`${A.p} y ${C.p}`], conclusion: A.p };
    case "ADJ":
      return { form, premises: [A.p, C.p], conclusion: `${A.p} y ${C.p}` };
    case "AC":
      return { form, premises: [c(A.p, B.p), B.p], conclusion: A.p };
    case "NA":
      return { form, premises: [c(A.p, B.p), A.n], conclusion: B.n };
    case "OR-AFF":
      return { form, premises: [`${A.p} o ${C.p}`, A.p], conclusion: C.n };
    case "OR-NOSD":
      return { form, premises: [`${A.p} o ${C.p}`], conclusion: C.p };
  }
}

const CONC_IND = ["Por lo tanto", "Luego", "En consecuencia", "Por consiguiente"];
const PREM_IND = ["ya que", "puesto que", "dado que"];

/** Texto del argumento. layout 0: premisas → conclusión; 1: conclusión primero con indicador de premisa. */
function argText(r: Rng, a: Arg, layout: 0 | 1): string {
  const prem = a.premises.map((p) => `${cap(p)}.`).join(" ");
  if (layout === 0) return `${prem} ${r.pick(CONC_IND)}, ${a.conclusion}.`;
  const [first, ...rest] = a.premises;
  return `${cap(a.conclusion)}, ${r.pick(PREM_IND)} ${first}${rest.length ? `. Además, ${rest.join(". Además, ")}` : ""}.`;
}

// ───────────────────────── U1 · Reconocer argumentos ─────────────────────────

const INSTRUCTIONS = [
  "Precalentá el horno, mezclá la harina con los huevos y horneá la masa durante 30 minutos.",
  "Para inscribirte, entrá al campus, elegí la materia y confirmá la comisión antes del viernes.",
  "Colocá la muestra en el portaobjetos, agregá una gota de colorante y observá con el objetivo de 40x.",
];

const DESCRIPTIONS = [
  "La biblioteca abre a las nueve. Tiene tres pisos y una sala de lectura silenciosa en el último.",
  "El Beagle zarpó de Plymouth en 1831. El viaje duró casi cinco años y recorrió las costas de Sudamérica.",
  "El cobre es un metal rojizo. Se usa en cables eléctricos y en cañerías.",
  "Ayer hizo calor en Buenos Aires. Por la tarde hubo tormenta y se cortó el tránsito en algunas avenidas.",
];

export const ipcEsArgumento: Generator = {
  id: "ipc-es-argumento",
  topicId: "t-ipc-argumentos",
  description: "Reconocer cuál fragmento es (o no es) un argumento",
  generate(seed, d) {
    const r = rng(seed);
    const [t1, t2, t3] = sample(r, THEMES, 3);
    const inverse = d >= 4 && r.bool();
    const arg = (th: Theme) => argText(r, buildArg(r.pick(["MP", "MT", "SH"] as const), th, 0), d >= 3 && r.bool() ? 1 : 0);
    const lone = (th: Theme) => `${cap(condText(th[0].p, th[1].p, 0))}.`;
    const list = (th: Theme) => `${cap(th[0].p)}. ${cap(th[1].p)}. ${cap(th[2].p)}.`;
    const condMsg = "Un condicional solo no es un argumento: relaciona dos enunciados pero no afirma ninguno ni concluye nada.";
    const listMsg = "Es una lista de afirmaciones: ninguna se ofrece como razón para otra.";
    const infoMsg = "Es discurso informativo (describe o da instrucciones): ningún enunciado se apoya en otro.";
    let opts: Option[];
    let prompt: string;
    if (!inverse) {
      prompt = "¿Cuál de estos fragmentos es un **argumento**?";
      opts = [
        { text: arg(t1), correct: true },
        { text: lone(t2), error: { type: "logica", message: condMsg } },
        { text: list(t3), error: { type: "interpretacion", message: listMsg } },
        { text: r.bool() ? r.pick(INSTRUCTIONS) : r.pick(DESCRIPTIONS), error: { type: "interpretacion", message: infoMsg } },
      ];
    } else {
      prompt = "¿Cuál de estos fragmentos **no** es un argumento?";
      const wrongArg = "Ese sí es un argumento: hay un enunciado (la conclusión) que se apoya en otros (las premisas).";
      opts = [
        { text: r.bool() ? lone(t1) : r.pick(DESCRIPTIONS), correct: true },
        { text: arg(t2), error: { type: "interpretacion", message: wrongArg } },
        { text: arg(t3), error: { type: "interpretacion", message: wrongArg } },
        { text: argText(r, buildArg("AC", t1, 0), 0), error: { type: "logica", message: "Es un argumento, aunque sea inválido (afirmación del consecuente). Ser argumento no depende de ser bueno." } },
      ];
    }
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt,
        hints: [
          "Un argumento tiene una conclusión que se pretende apoyar en otros enunciados.",
          "Buscá indicadores: «por lo tanto», «luego», «ya que», «puesto que». Ayudan, aunque no siempre están.",
          "Descartá los condicionales sueltos («si…, …»), las listas de datos y las instrucciones: ahí nada se apoya en nada.",
        ],
        solution: [
          "Un argumento es un conjunto de enunciados en el que uno (la conclusión) se apoya en otros (las premisas).",
          "Un condicional suelto, una descripción o una receta no ofrecen razones para ninguna afirmación.",
        ],
        explanation: "Lo que define a un argumento es la pretensión de apoyar una afirmación en otras, no que sea verdadero ni válido.",
      }),
      opts,
    );
  },
};

export const ipcConclusion: Generator = {
  id: "ipc-conclusion",
  topicId: "t-ipc-argumentos",
  description: "Identificar la conclusión completa de un argumento",
  generate(seed, d) {
    const r = rng(seed);
    const th = r.pick(THEMES);
    const form = r.pick(d <= 2 ? (["MP", "MT"] as const) : (["MP", "MT", "SH", "AC", "NA"] as const));
    const a = buildArg(form, th, 0);
    const layout: 0 | 1 = d >= 3 && r.bool() ? 1 : 0;
    const text = argText(r, a, layout);
    const ind = layout === 0 ? text.match(/(Por lo tanto|Luego|En consecuencia|Por consiguiente)/)?.[1] ?? "Por lo tanto" : "Por lo tanto";
    const opts: Option[] = [
      { text: `${cap(a.conclusion)}.`, correct: true },
      ...a.premises.map((p) => ({ text: `${cap(p)}.`, error: { type: "interpretacion" as const, message: "Esa es una premisa: se ofrece como razón, no es lo que se quiere establecer." } })),
      { text: `${ind}, ${a.conclusion}.`, error: { type: "interpretacion" as const, message: "Los indicadores («por lo tanto», «luego»…) señalan la conclusión pero no forman parte de ella." } },
    ];
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `¿Cuál es la conclusión de este argumento?\n\n«${text}»`,
        hints: [
          "Preguntate: ¿qué se quiere probar? ¿Qué se ofrece como razón?",
          layout === 1 ? "«Ya que», «puesto que» y «dado que» introducen premisas: lo que está antes es la conclusión." : "Lo que sigue a «por lo tanto», «luego» o «en consecuencia» es la conclusión.",
          "Escribila completa y sin el indicador.",
        ],
        solution: [`Premisas: ${a.premises.map((p) => `«${cap(p)}»`).join(" y ")}.`, `Conclusión: «${cap(a.conclusion)}».`],
        explanation: "La conclusión es el enunciado que se pretende apoyar en los demás. Puede ir al principio, en el medio o al final, y el indicador no forma parte de ella.",
      }),
      opts,
    );
  },
};

// ───────────────────────── U1 · Tipos de enunciados ─────────────────────────

type Alcance = "singular" | "universal" | "existencial" | "estadistico";

const ALCANCE_LABEL: Record<Alcance, string> = {
  singular: "Singular",
  universal: "Universal",
  existencial: "Existencial",
  estadistico: "Estadístico (probabilístico)",
};

/** Sujetos y predicados para armar enunciados de distinto alcance. */
const SCOPE_BANK: { ind: string; sing: string; plural: string; predS: string; predP: string }[] = [
  { ind: "Plutón", sing: "planeta enano", plural: "planetas enanos", predS: "tiene una órbita muy excéntrica", predP: "tienen órbitas muy excéntricas" },
  { ind: "El cobre", sing: "metal", plural: "metales", predS: "se dilata al calentarse", predP: "se dilatan al calentarse" },
  { ind: "La ballena azul", sing: "mamífero", plural: "mamíferos", predS: "respira con pulmones", predP: "respiran con pulmones" },
  { ind: "Rocío", sing: "estudiante de la comisión", plural: "estudiantes de la comisión", predS: "aprobó el primer parcial", predP: "aprobaron el primer parcial" },
  { ind: "El pinzón de la isla Española", sing: "pinzón de Galápagos", plural: "pinzones de Galápagos", predS: "tiene el pico largo", predP: "tienen el pico largo" },
  { ind: "La paciente del box 3", sing: "paciente vacunado", plural: "pacientes vacunados", predS: "desarrolló anticuerpos", predP: "desarrollaron anticuerpos" },
];

function scopeSentence(r: Rng, k: Alcance, e: (typeof SCOPE_BANK)[number]): string {
  switch (k) {
    case "singular":
      return `${e.ind} ${e.predS}.`;
    case "universal":
      return r.pick([`Todos los ${e.plural} ${e.predP}.`, `Cualquier ${e.sing} ${e.predS}.`]);
    case "existencial":
      return r.pick([`Algunos ${e.plural} ${e.predP}.`, `Hay ${e.plural} que ${e.predP}.`, `Existe al menos un ${e.sing} que ${e.predS}.`]);
    case "estadistico":
      return r.pick([`El ${r.int(55, 95)}% de los ${e.plural} ${e.predP}.`, `La mayoría de los ${e.plural} ${e.predP}.`]);
  }
}

const NON_PROPOSITIONS = [
  "¿Cuántos parciales tiene la materia?",
  "Cerrá la puerta del laboratorio.",
  "¡Ojalá apruebe el parcial!",
  "Por favor, traé el informe mañana.",
];

export const ipcAlcanceEnunciado: Generator = {
  id: "ipc-alcance-enunciado",
  topicId: "t-ipc-enunciados",
  description: "Clasificar enunciados por su alcance y reconocer cuáles expresan proposiciones",
  generate(seed, d) {
    const r = rng(seed);
    const e = r.pick(SCOPE_BANK);
    const hints: [string, string, string] = [
      "Fijate de cuántos individuos habla: ¿uno, todos, algunos, una proporción?",
      "«Todos» → universal; «algunos», «hay», «existe» → existencial; porcentajes o «la mayoría» → estadístico.",
      "Si habla de un individuo con nombre propio o descripción única, es singular.",
    ];
    if (d >= 4 && r.bool()) {
      // ¿Qué enunciado se refuta con un único contraejemplo?
      const k: Alcance = "universal";
      const opts: Option[] = (["universal", "existencial", "estadistico", "singular"] as Alcance[]).map((a) => ({
        text: scopeSentence(r, a, e),
        correct: a === k,
        error:
          a === k
            ? undefined
            : {
                type: "conceptual" as ErrorType,
                message:
                  a === "existencial"
                    ? "Para que un existencial sea falso hay que revisar TODO el conjunto y no encontrar ningún caso: un contraejemplo no alcanza."
                    : a === "estadistico"
                      ? "Un enunciado estadístico admite excepciones: un caso en contra no lo refuta."
                      : "Un singular habla de un individuo: no hay «contraejemplo» que buscar entre otros casos; se decide mirando a ese individuo.",
              },
      }));
      return choice(
        r,
        base({
          gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
          prompt: "¿Cuál de estos enunciados queda **refutado** si encontramos un solo caso que no cumple la propiedad?",
          hints,
          solution: ["Un universal afirma que todos cumplen la propiedad: basta un contraejemplo para que sea falso.", "Al revés, un existencial se verifica con un caso, pero para refutarlo hay que revisar todo el conjunto."],
          explanation: "Universal: refutable con un contraejemplo, no verificable caso por caso si el conjunto es infinito. Existencial: verificable con un caso. Estadístico: ni un caso a favor ni uno en contra lo deciden.",
        }),
        opts,
      );
    }
    if (d >= 3 && r.bool()) {
      // ¿Expresa una proposición?
      const decl = scopeSentence(r, r.pick(["singular", "universal", "existencial", "estadistico"] as const), e);
      const non = sample(r, NON_PROPOSITIONS, 3);
      return choice(
        r,
        base({
          gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
          prompt: "¿Cuál de estas oraciones expresa una **proposición** (algo que puede ser verdadero o falso)?",
          hints: ["Preguntate: ¿tiene sentido decir «eso es verdad» o «eso es falso»?", "Las preguntas, las órdenes y los deseos no afirman nada.", "Solo las oraciones declarativas expresan proposiciones."],
          solution: [`«${decl}» es declarativa: afirma algo que puede ser V o F.`, "Las preguntas, órdenes y expresiones de deseo no son ni verdaderas ni falsas."],
          explanation: "La oración es el soporte material (las palabras); la proposición es lo que una oración declarativa afirma, y es lo que se evalúa como verdadero o falso.",
        }),
        [{ text: decl, correct: true }, ...non.map((n) => ({ text: n, error: { type: "conceptual" as ErrorType, message: "No es declarativa: no afirma nada, así que no puede ser verdadera ni falsa." } }))],
      );
    }
    const k = r.pick(["singular", "universal", "existencial", "estadistico"] as const);
    const sent = scopeSentence(r, k, e);
    const msgs: Record<Alcance, string> = {
      singular: "Singular habla de un único individuo determinado.",
      universal: "Universal habla de TODOS los miembros de una clase («todos», «ningún»).",
      existencial: "Existencial afirma que hay AL MENOS UNO («algunos», «hay», «existe»).",
      estadistico: "Estadístico habla de una proporción o probabilidad («el 80%», «la mayoría»).",
    };
    return choice(
      fixed(r),
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `¿Qué tipo de enunciado es, según su alcance?\n\n«${sent}»`,
        hints,
        solution: [msgs[k]],
        explanation: "Por alcance, un enunciado puede ser singular, universal, existencial o estadístico. Esto importa para saber cómo se lo verifica o refuta.",
      }),
      (["singular", "universal", "existencial", "estadistico"] as Alcance[]).map((a) => ({
        text: ALCANCE_LABEL[a],
        correct: a === k,
        error: a === k ? undefined : { type: "conceptual" as ErrorType, message: `${msgs[a]} ${msgs[k]}` },
      })),
    );
  },
};

// ───────────────────────── U1 · Valor de verdad ─────────────────────────

const CONN_RULE: Record<F["t"], string> = {
  var: "",
  not: "La negación invierte el valor de verdad.",
  and: "La conjunción es V solo si ambas partes son V.",
  or: "La disyunción inclusiva es F solo si ambas partes son F.",
  xor: "La disyunción exclusiva es V si exactamente una parte es V.",
  imp: "El condicional es F solo si el antecedente es V y el consecuente F.",
  iff: "El bicondicional es V cuando ambas partes tienen el mismo valor.",
};

function randFormula(r: Rng, vars: string[], depth: number): F {
  if (depth === 0) return r.bool() || vars.length === 1 ? V(r.pick(vars)) : not(V(r.pick(vars)));
  const k = r.pick(["and", "or", "xor", "imp", "iff", "imp", "not"] as const);
  if (k === "not") return not(randFormula(r, vars, depth - 1));
  const a = randFormula(r, vars, depth - 1);
  let b = randFormula(r, vars, r.int(0, depth - 1));
  for (let i = 0; i < 4 && JSON.stringify(a) === JSON.stringify(b); i++) b = randFormula(r, vars, 0);
  return { t: k, a, b };
}

/** Pasos de evaluación de las subfórmulas (de adentro hacia afuera). */
function evalSteps(f: F, env: Record<string, boolean>, out: string[] = []): string[] {
  if (f.t === "var") return out;
  if (f.t === "not") evalSteps(f.a, env, out);
  else {
    evalSteps(f.a, env, out);
    evalSteps(f.b, env, out);
  }
  if (f.t === "not" && f.a.t === "var") out.push(`no ${f.a.v} = ${vf(evalF(f, env))}`);
  else out.push(`${words(f)} → ${vf(evalF(f, env))}. ${CONN_RULE[f.t]}`);
  return out;
}

export const ipcValorVerdad: Generator = {
  id: "ipc-valor-verdad",
  topicId: "t-ipc-conectivas",
  description: "Calcular el valor de verdad de enunciados complejos",
  generate(seed, d) {
    const r = rng(seed);
    const vars = d <= 4 ? ["A", "B"] : ["A", "B", "C"];
    const env: Record<string, boolean> = {};
    vars.forEach((v) => (env[v] = r.bool()));
    const given = vars.map((v) => `${v} es ${env[v] ? "verdadera" : "falsa"}`).join(", ");
    const hints: [string, string, string] = [
      "Reemplazá cada letra por su valor (V o F) y resolvé de adentro hacia afuera.",
      "Ojo con las trampas: «o bien… o bien» con ambas V da F; un condicional con antecedente F es V.",
      "Condicional: F solo en V→F. Bicondicional: V si coinciden. Conjunción: V solo si ambas V. Disyunción: F solo si ambas F.",
    ];
    if (d <= 2) {
      const k = r.pick(["and", "or", "xor", "imp", "iff", "imp"] as const);
      const f: F = d === 1 ? { t: k, a: V("A"), b: V("B") } : { t: k, a: r.bool() ? not(V("A")) : V("A"), b: r.bool() ? V("B") : not(V("B")) };
      const val = evalF(f, env);
      const why = evalSteps(f, env);
      return choice(
        fixed(r),
        base({
          gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
          prompt: `Si ${given}, ¿qué valor tiene «${cap(words(f))}»?`,
          hints,
          solution: why,
          explanation: CONN_RULE[f.t],
        }),
        [
          { text: "Verdadero", correct: val, error: val ? undefined : { type: "logica", message: `Es falso. ${why.at(-1)}` } },
          { text: "Falso", correct: !val, error: !val ? undefined : { type: "logica", message: `Es verdadero. ${why.at(-1)}` } },
        ],
      );
    }
    // Varias fórmulas: exactamente una con el valor pedido.
    const target = r.bool();
    const depth = d <= 4 ? 1 : 2;
    let good: F | null = null;
    const bad: F[] = [];
    for (let i = 0; i < 200 && (!good || bad.length < 3); i++) {
      const f = randFormula(r, vars, depth);
      if (f.t === "var" || (f.t === "not" && f.a.t === "var")) continue;
      const w = words(f);
      if (good && words(good) === w) continue;
      if (bad.some((b) => words(b) === w)) continue;
      if (evalF(f, env) === target) {
        if (!good) good = f;
      } else if (bad.length < 3) bad.push(f);
    }
    // Respaldo determinístico (prácticamente nunca hace falta).
    if (!good) good = target === evalF(and(V("A"), V("B")), env) ? and(V("A"), V("B")) : not(and(V("A"), V("B")));
    const opts: Option[] = [
      { text: cap(words(good)), correct: true },
      ...bad.map((b) => ({ text: cap(words(b)), error: { type: "logica" as ErrorType, message: `Esa es ${target ? "falsa" : "verdadera"}: ${evalSteps(b, env).join(" ")}` } })),
    ];
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Si ${given}, ¿cuál de estos enunciados es **${target ? "verdadero" : "falso"}**?`,
        hints,
        solution: evalSteps(good, env),
        explanation: "Los valores de verdad de un enunciado complejo dependen solo de los valores de sus partes y de las tablas de las conectivas.",
      }),
      opts,
    );
  },
};

// ───────────────────────── U1 · Condiciones necesarias y suficientes ─────────────────────────

export const ipcNecSuf: Generator = {
  id: "ipc-nec-suf",
  topicId: "t-ipc-condiciones",
  description: "Traducir «si», «solo si» y «si y solo si»; condición necesaria y suficiente",
  generate(seed, d) {
    const r = rng(seed);
    const th = r.pick(THEMES);
    // X y Y: dos proposiciones del tema (en algún orden).
    const [X, Y] = r.bool() ? [th[0], th[1]] : [th[1], th[2]];
    const fx = V("X");
    const fy = V("Y");
    // Formas superficiales: cada una con su fórmula (X→Y, Y→X o X↔Y).
    const surfaces: { text: string; f: F }[] = [
      { text: `Si ${X.p}, ${Y.p}.`, f: imp(fx, fy) },
      { text: `${cap(Y.p)} si ${X.p}.`, f: imp(fx, fy) },
      { text: `${cap(X.p)} solo si ${Y.p}.`, f: imp(fx, fy) },
      { text: `Solo si ${Y.p}, ${X.p}.`, f: imp(fx, fy) },
      { text: `Únicamente si ${X.p}, ${Y.p}.`, f: imp(fy, fx) },
      { text: `${cap(X.p)} si y solo si ${Y.p}.`, f: iff(fx, fy) },
    ];
    const pool = d <= 2 ? surfaces.slice(0, 3) : surfaces;
    const sf = r.pick(pool);
    const nameF = (f: F) => {
      const a = (z: F) => (z.t === "var" ? (z.v === "X" ? X.p : Y.p) : z.t === "not" && z.a.t === "var" ? (z.a.v === "X" ? X.n : Y.n) : "");
      if (f.t === "imp") return `Si ${a(f.a)}, ${a(f.b)}.`;
      if (f.t === "iff") return `${cap(a(f.a))} si y solo si ${a(f.b)}.`;
      return "";
    };
    const solution = [
      "«Si A, B» y «B si A» → A es condición suficiente de B: Si A, entonces B.",
      "«A solo si B» y «Solo si B, A» → B es condición necesaria de A: también se escribe Si A, entonces B.",
      "«Si y solo si» → condición necesaria y suficiente (bicondicional).",
      `Acá: «${sf.text}» equivale a ${sym(sf.f).replace(/X/g, "X").replace(/Y/g, "Y")}, con X = «${X.p}» e Y = «${Y.p}».`,
    ];
    const hints: [string, string, string] = [
      "Pasá la oración a la forma «Si …, entonces …».",
      "«Solo si» introduce la condición NECESARIA, que va en el consecuente: «A solo si B» = «Si A, B».",
      "Lo que va después de «si» (solo) es condición suficiente y va en el antecedente.",
    ];
    const mode = d >= 4 && sf.f.t === "imp" ? r.pick([0, 1, 2] as const) : d >= 3 && sf.f.t === "imp" ? r.pick([0, 1] as const) : 0;

    if (mode === 0) {
      const cands: F[] = [imp(fx, fy), imp(fy, fx), iff(fx, fy), imp(not(fx), not(fy)), imp(not(fy), not(fx))];
      const eq = cands.filter((c) => equivalentF(c, sf.f));
      const neq = cands.filter((c) => !equivalentF(c, sf.f));
      // A dificultad alta, la correcta puede ser el contrarrecíproco.
      const correct = d >= 5 && eq.length > 1 ? eq[1] : eq[0];
      const opts: Option[] = [
        { text: nameF(correct), correct: true },
        ...sample(r, neq, 3).map((c) => ({
          text: nameF(c),
          error: {
            type: "logica" as ErrorType,
            message:
              c.t === "iff"
                ? "El bicondicional dice más que la oración original: agrega la condición en el otro sentido."
                : sf.f.t === "iff"
                  ? "Un bicondicional afirma la relación en los dos sentidos; un condicional solo afirma uno."
                  : "Esa invierte la relación: confunde la condición necesaria con la suficiente.",
          },
        })),
      ];
      return choice(
        r,
        base({
          gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
          prompt: `¿Cuál de estas oraciones dice **lo mismo** que:\n\n«${sf.text}»`,
          hints,
          solution,
          explanation: "En «Si A, entonces B», A es condición suficiente de B y B es condición necesaria de A. Un condicional equivale a su contrarrecíproco (Si no B, entonces no A), pero NO a su recíproco (Si B, entonces A).",
        }),
        opts,
      );
    }
    // Antecedente y consecuente reales del condicional.
    const ant = sf.f.t === "imp" && sf.f.a.t === "var" && sf.f.a.v === "X" ? X : Y;
    const con = ant === X ? Y : X;
    if (mode === 1) {
      const stmts = [
        { text: `«${cap(ant.p)}» es condición suficiente de «${con.p}».`, ok: true },
        { text: `«${cap(con.p)}» es condición necesaria de «${ant.p}».`, ok: true },
        { text: `«${cap(ant.p)}» es condición necesaria de «${con.p}».`, ok: false },
        { text: `«${cap(con.p)}» es condición suficiente de «${ant.p}».`, ok: false },
        { text: `«${cap(ant.p)}» es condición necesaria y suficiente de «${con.p}».`, ok: false },
      ];
      const good = r.pick(stmts.filter((s) => s.ok));
      const opts: Option[] = [
        { text: good.text, correct: true },
        ...sample(r, stmts.filter((s) => !s.ok), 3).map((s) => ({
          text: s.text,
          error: { type: "logica" as ErrorType, message: s.text.includes("y suficiente") ? "Eso sería un bicondicional; la oración solo afirma un condicional." : "Está invertido: el antecedente es la condición suficiente y el consecuente la necesaria." },
        })),
      ];
      return choice(
        r,
        base({
          gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
          prompt: `Según la oración «${sf.text}», ¿qué afirmación es correcta?`,
          hints,
          solution: [...solution, `Antecedente: «${ant.p}» (suficiente). Consecuente: «${con.p}» (necesaria).`],
          explanation: "En «Si A, entonces B»: A es suficiente para B (alcanza con A para que B), y B es necesaria para A (sin B no hay A).",
        }),
        opts,
      );
    }
    // mode 2: la única situación que vuelve falsa la oración.
    const situations = [
      { text: `${cap(ant.p)} y ${con.n}.`, ok: true },
      { text: `${cap(ant.n)} y ${con.p}.`, ok: false },
      { text: `${cap(ant.p)} y ${con.p}.`, ok: false },
      { text: `${cap(ant.n)} y ${con.n}.`, ok: false },
    ];
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `¿Cuál es la **única** situación que vuelve falsa esta oración?\n\n«${sf.text}»`,
        hints,
        solution: [...solution, "Un condicional es falso solo con antecedente V y consecuente F.", `Acá: ${ant.p} (V) pero ${con.n}.`],
        explanation: "Para hallar lo que falsea un «solo si», primero pasalo a «Si A, entonces B» y buscá el caso A verdadero y B falso.",
      }),
      situations.map((s) => ({
        text: s.text,
        correct: s.ok,
        error: s.ok ? undefined : { type: "logica" as ErrorType, message: "En esa situación el condicional es verdadero: solo es falso con el antecedente verdadero y el consecuente falso. ¿Ubicaste bien cuál es el antecedente?" },
      })),
    );
  },
};

// ───────────────────────── U1 · Tautología, contradicción, contingencia ─────────────────────────

const MODAL_LABEL: Record<Modal, string> = { tautologia: "Tautología", contradiccion: "Contradicción", contingencia: "Contingencia" };
const MODAL_DEF: Record<Modal, string> = {
  tautologia: "Una tautología es verdadera en todas las filas de su tabla: por su forma.",
  contradiccion: "Una contradicción es falsa en todas las filas de su tabla: por su forma.",
  contingencia: "Una contingencia es verdadera en algunas filas y falsa en otras: su verdad depende de cómo es el mundo.",
};

function formulaOfClass(r: Rng, target: Modal, vars: string[]): F {
  const sub = () => randFormula(r, vars, r.int(0, 1));
  for (let i = 0; i < 60; i++) {
    let f: F;
    const X = sub();
    const Y = sub();
    if (target === "tautologia") {
      f = r.pick([or(X, not(X)), imp(X, X), imp(and(X, Y), X), imp(X, or(X, Y)), not(and(X, not(X))), iff(X, not(not(X)))]);
    } else if (target === "contradiccion") {
      f = r.pick([and(X, not(X)), not(or(X, not(X))), and(and(X, Y), not(X)), not(imp(X, X)), iff(X, not(X))]);
    } else {
      f = randFormula(r, vars, 2);
    }
    if (classify(f) === target) return f;
  }
  return target === "tautologia" ? or(V("A"), not(V("A"))) : target === "contradiccion" ? and(V("A"), not(V("A"))) : imp(V("A"), V("B"));
}

/** Tabla de verdad compacta de una fórmula (para la solución). */
function tableLines(f: F): string[] {
  const vars = [...varsOf(f)].sort();
  return assignments(vars).map((e) => `${vars.map((v) => `${v}=${vf(e[v])}`).join(", ")} → ${vf(evalF(f, e))}`);
}

export const ipcTautologia: Generator = {
  id: "ipc-tautologia",
  topicId: "t-ipc-tautologias",
  description: "Clasificar enunciados en tautologías, contradicciones y contingencias (calculado)",
  generate(seed, d) {
    const r = rng(seed);
    const target = r.pick(["tautologia", "contradiccion", "contingencia"] as const);
    let prompt: string;
    let f: F;
    let solution: string[];
    if (d <= 2) {
      const th = r.pick(THEMES);
      const P = th[r.int(0, 2)];
      const Q = th.find((x) => x !== P)!;
      const nl: Record<Modal, { text: string; f: F }[]> = {
        tautologia: [
          { text: `${cap(P.p)} o ${P.n}.`, f: or(V("A"), not(V("A"))) },
          { text: `Si ${P.p}, entonces ${P.p}.`, f: imp(V("A"), V("A")) },
          { text: `No es cierto que ${P.p} y ${P.n}.`, f: not(and(V("A"), not(V("A")))) },
        ],
        contradiccion: [
          { text: `${cap(P.p)} y ${P.n}.`, f: and(V("A"), not(V("A"))) },
          { text: `${cap(P.p)}, pero ${P.n}.`, f: and(V("A"), not(V("A"))) },
        ],
        contingencia: [
          { text: `${cap(P.p)} y ${Q.p}.`, f: and(V("A"), V("B")) },
          { text: `Si ${P.p}, ${Q.p}.`, f: imp(V("A"), V("B")) },
          { text: `${cap(P.p)}.`, f: V("A") },
          { text: `${cap(P.p)} o ${Q.n}.`, f: or(V("A"), not(V("B"))) },
        ],
      };
      const pick = r.pick(nl[target]);
      f = pick.f;
      prompt = `¿Qué tipo de enunciado es?\n\n«${pick.text}»`;
      solution = [`Forma lógica: ${words(f)} (A = «${P.p}»${varsOf(f).has("B") ? `, B = «${Q.p}»` : ""}).`, ...tableLines(f), MODAL_DEF[classify(f)]];
    } else {
      f = formulaOfClass(r, target, d <= 4 ? ["A", "B"] : ["A", "B", "C"]);
      prompt = `Clasificá este enunciado según su forma:\n\n«${cap(words(f))}»`;
      solution = ["Armamos la tabla de verdad:", ...tableLines(f), MODAL_DEF[classify(f)]];
    }
    const k = classify(f);
    return choice(
      fixed(r),
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt,
        hints: [
          "Preguntate: ¿puede ser falso? ¿puede ser verdadero? Pensalo solo por su forma.",
          "Armá la tabla de verdad con todas las combinaciones de V y F de las letras.",
          "Todas V → tautología; todas F → contradicción; de las dos → contingencia.",
        ],
        solution,
        explanation: "La clasificación depende solo de la forma. Ojo: un enunciado obviamente verdadero («Buenos Aires es la capital de la Argentina») sigue siendo contingente.",
      }),
      (["tautologia", "contradiccion", "contingencia"] as Modal[]).map((m) => ({
        text: MODAL_LABEL[m],
        correct: m === k,
        error: m === k ? undefined : { type: "logica" as ErrorType, message: `No. ${MODAL_DEF[k]} Mirá la tabla: ${tableLines(f).join("; ")}.` },
      })),
    );
  },
};

// ───────────────────────── U1 · Validez, verdad y solidez ─────────────────────────

const VALIDITY_FACTS: { text: string; value: boolean; why: string }[] = [
  { text: "Si un argumento es válido y sus premisas son verdaderas, su conclusión es verdadera.", value: true, why: "Eso es preservar la verdad: en un argumento válido es imposible tener premisas V y conclusión F." },
  { text: "Si un argumento tiene premisas verdaderas y conclusión verdadera, entonces es válido.", value: false, why: "Un argumento inválido también puede tener premisas y conclusión verdaderas (por ejemplo, una afirmación del consecuente). La validez depende de la forma." },
  { text: "Un argumento válido puede tener premisas falsas.", value: true, why: "La validez no exige premisas verdaderas: solo que, SI lo fueran, la conclusión también lo sería." },
  { text: "Todo argumento válido es sólido.", value: false, why: "Sólido = válido Y con premisas verdaderas. Un válido con alguna premisa falsa no es sólido." },
  { text: "Todo argumento sólido es válido.", value: true, why: "La solidez incluye la validez por definición." },
  { text: "Existen argumentos sólidos inválidos.", value: false, why: "No: para ser sólido hay que ser válido." },
  { text: "Si un argumento es válido y su conclusión es falsa, al menos una premisa es falsa.", value: true, why: "Si todas las premisas fueran V, la conclusión tendría que ser V. Como es F, alguna premisa es F." },
  { text: "Si un argumento es inválido, su conclusión es falsa.", value: false, why: "Un argumento inválido puede tener conclusión verdadera: lo que falla es la conexión, no necesariamente el contenido." },
  { text: "Un argumento con premisas verdaderas y conclusión falsa es inválido.", value: true, why: "Esa combinación es justamente un contraejemplo: muestra que la forma no preserva la verdad." },
  { text: "La validez de un argumento depende de que sus premisas sean verdaderas.", value: false, why: "La validez depende SOLO de la forma, no de la verdad real de las premisas." },
  { text: "Una premisa puede ser válida o inválida.", value: false, why: "Las oraciones son verdaderas o falsas; la validez se predica de argumentos." },
  { text: "Un argumento sólido tiene conclusión verdadera.", value: true, why: "Es válido y sus premisas son verdaderas, así que la verdad se preserva hasta la conclusión." },
];

export const ipcValidezVerdad: Generator = {
  id: "ipc-validez-verdad",
  topicId: "t-ipc-validez",
  description: "Relación entre validez, verdad de premisas y conclusión, y solidez",
  generate(seed, d) {
    const r = rng(seed);
    const hints: [string, string, string] = [
      "Validez: es imposible que las premisas sean V y la conclusión F.",
      "La validez depende solo de la forma; la verdad, del contenido. Son planos distintos.",
      "Sólido = válido + premisas verdaderas. «Válido» e «inválido» se dicen de argumentos, no de oraciones.",
    ];
    if (d <= 3 && r.bool()) {
      const premV = r.bool();
      const concV = r.bool();
      const asksValid = d <= 2 || r.bool();
      const possible = asksValid ? !(premV && !concV) : true;
      const combo = `premisas ${premV ? "todas verdaderas" : "con alguna falsa"} y conclusión ${concV ? "verdadera" : "falsa"}`;
      const why = asksValid
        ? possible
          ? `Sí: un argumento válido solo excluye la combinación premisas V / conclusión F. Con ${combo} puede ser válido.`
          : "No: premisas verdaderas con conclusión falsa es exactamente lo que un argumento válido no puede tener."
        : "Sí: un argumento inválido puede tener cualquier combinación de valores de verdad; lo que lo hace inválido es la forma.";
      return choice(
        fixed(r),
        base({
          gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
          prompt: `¿Puede existir un argumento **${asksValid ? "válido" : "inválido"}** con ${combo}?`,
          hints,
          solution: [why],
          explanation: "Para un argumento válido hay una sola combinación imposible: premisas verdaderas y conclusión falsa.",
        }),
        [
          { text: "Sí, puede existir", correct: possible, error: possible ? undefined : { type: "logica", message: why } },
          { text: "No, es imposible", correct: !possible, error: !possible ? undefined : { type: "logica", message: why } },
        ],
      );
    }
    if (d >= 4 && r.bool()) {
      // Elegir la única afirmación verdadera entre varias.
      const trues = VALIDITY_FACTS.filter((f) => f.value);
      const falses = VALIDITY_FACTS.filter((f) => !f.value);
      const good = r.pick(trues);
      return choice(
        r,
        base({
          gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
          prompt: "¿Cuál de estas afirmaciones es **correcta**?",
          hints,
          solution: [good.why],
          explanation: "Válido: imposible premisas V y conclusión F. Sólido: válido y con premisas V. La verdad de premisas y conclusión no decide la validez.",
        }),
        [{ text: good.text, correct: true }, ...sample(r, falses, 3).map((f) => ({ text: f.text, error: { type: "logica" as ErrorType, message: f.why } }))],
      );
    }
    const st = VALIDITY_FACTS[(seed + d) % VALIDITY_FACTS.length];
    return choice(
      fixed(r),
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `¿Verdadero o falso?\n\n«${st.text}»`,
        hints,
        solution: [st.why],
        explanation: st.why,
      }),
      [
        { text: "Verdadero", correct: st.value, error: st.value ? undefined : { type: "logica", message: st.why } },
        { text: "Falso", correct: !st.value, error: !st.value ? undefined : { type: "logica", message: st.why } },
      ],
    );
  },
};

// ───────────────────────── U1 · Formas de argumento ─────────────────────────

/** Fórmulas de cada forma (premisas → conclusión) para verificar validez por tabla. */
const FORM_F: Record<FormId, { prem: F[]; conc: F }> = {
  MP: { prem: [imp(V("A"), V("B")), V("A")], conc: V("B") },
  MT: { prem: [imp(V("A"), V("B")), not(V("B"))], conc: not(V("A")) },
  SH: { prem: [imp(V("A"), V("B")), imp(V("B"), V("C"))], conc: imp(V("A"), V("C")) },
  SD: { prem: [or(V("A"), V("C")), not(V("A"))], conc: V("C") },
  SIMP: { prem: [and(V("A"), V("C"))], conc: V("A") },
  ADJ: { prem: [V("A"), V("C")], conc: and(V("A"), V("C")) },
  AC: { prem: [imp(V("A"), V("B")), V("B")], conc: V("A") },
  NA: { prem: [imp(V("A"), V("B")), not(V("A"))], conc: not(V("B")) },
  "OR-AFF": { prem: [or(V("A"), V("C")), V("A")], conc: not(V("C")) },
  "OR-NOSD": { prem: [or(V("A"), V("C"))], conc: V("C") },
};

/** Validez calculada por tabla de verdad: ninguna fila con premisas V y conclusión F. */
export function isValidForm(id: FormId): boolean {
  const { prem, conc } = FORM_F[id];
  return entails(prem.reduce((acc, p) => and(acc, p)), conc);
}

/** Contraejemplo (fila con premisas V y conclusión F), si existe. */
function counterRow(id: FormId): string | null {
  const { prem, conc } = FORM_F[id];
  const all = prem.reduce((acc, p) => and(acc, p));
  const vars = [...new Set([...varsOf(all), ...varsOf(conc)])].sort();
  const row = assignments(vars).find((e) => evalF(all, e) && !evalF(conc, e));
  return row ? vars.map((v) => `${v}=${vf(row[v])}`).join(", ") : null;
}

export const ipcFormaArgumento: Generator = {
  id: "ipc-forma-argumento",
  topicId: "t-ipc-formas",
  description: "Reconocer la forma de un argumento y si es válido",
  generate(seed, d) {
    const r = rng(seed);
    const pool: FormId[] =
      d <= 2 ? ["MP", "MT", "AC", "NA"] : d <= 4 ? ["MP", "MT", "AC", "NA", "SH", "SD", "SIMP", "ADJ"] : ["MP", "MT", "AC", "NA", "SH", "SD", "OR-AFF", "OR-NOSD"];
    const form = r.pick(pool);
    const th = r.pick(THEMES);
    const style: 0 | 1 | 2 = d >= 6 ? r.pick([0, 1, 2] as const) : d >= 5 ? r.pick([0, 1] as const) : 0;
    const a = buildArg(form, th, style);
    if (d >= 5) a.premises = r.shuffle(a.premises);
    const text = argText(r, a, d >= 4 && r.bool() ? 1 : 0);
    const label = (f: FormId) => `${FORMS[f].name} — ${isValidForm(f) ? "válido" : "inválido"}`;
    // Distractores: las formas más confundibles con la correcta.
    const confusable: Record<FormId, FormId[]> = {
      MP: ["AC", "MT", "NA"],
      MT: ["NA", "AC", "MP"],
      AC: ["MP", "MT", "NA"],
      NA: ["MT", "AC", "MP"],
      SH: ["MP", "AC", "SD"],
      SD: ["OR-AFF", "MT", "SIMP"],
      SIMP: ["ADJ", "SD", "MP"],
      ADJ: ["SIMP", "SD", "MP"],
      "OR-AFF": ["SD", "OR-NOSD", "NA"],
      "OR-NOSD": ["SD", "OR-AFF", "SIMP"],
    };
    const ce = counterRow(form);
    const opts: Option[] = [
      { text: label(form), correct: true },
      ...confusable[form].map((f) => ({
        text: label(f),
        error: { type: "logica" as ErrorType, message: `Esa forma es «${FORMS[f].schema}». La de este argumento es «${FORMS[form].schema}».` },
      })),
    ];
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `¿Qué forma tiene este argumento?\n\n«${text}»`,
        hints: [
          "Reemplazá cada oración simple por una letra (A, B, C) y escribí el esquema.",
          style === 2 ? "Ojo: «A solo si B» se escribe «Si A, B»." : "Fijate si se afirma o se niega el antecedente o el consecuente del condicional.",
          "Válidas: modus ponens (afirma antecedente), modus tollens (niega consecuente). Falacias: afirmar el consecuente, negar el antecedente.",
        ],
        solution: [
          `A = «${th[0].p}», B = «${th[1].p}»${form === "SH" || form === "SD" || form === "SIMP" || form === "ADJ" || form.startsWith("OR") ? `, C = «${th[2].p}»` : ""}.`,
          `Esquema: ${FORMS[form].schema}.`,
          `${FORMS[form].name}: ${FORMS[form].why}`,
          ce ? `Contraejemplo por tabla: con ${ce} las premisas son V y la conclusión F.` : "Por tabla de verdad: no hay ninguna fila con premisas V y conclusión F.",
        ],
        explanation: "La validez depende de la forma: si la forma es válida, cualquier argumento con esa forma lo es; si existe un contraejemplo, la forma es inválida.",
      }),
      opts,
    );
  },
};

export const ipcCualValido: Generator = {
  id: "ipc-cual-valido",
  topicId: "t-ipc-formas",
  description: "Elegir el único argumento válido (o inválido) entre varios",
  generate(seed, d) {
    const r = rng(seed);
    const askValid = d <= 2 || r.bool();
    const validPool: FormId[] = d <= 3 ? ["MP", "MT"] : ["MP", "MT", "SH", "SD"];
    const invalidPool: FormId[] = d <= 3 ? ["AC", "NA"] : ["AC", "NA", "OR-AFF", "OR-NOSD"];
    const themes = sample(r, THEMES, 4);
    let forms: FormId[];
    if (askValid) forms = [r.pick(validPool), ...sample(r, invalidPool, 3).concat(sample(r, invalidPool, 3)).slice(0, 3)];
    else forms = [r.pick(invalidPool), ...sample(r, validPool, Math.min(3, validPool.length)).concat(validPool).slice(0, 3)];
    const opts: Option[] = forms.map((f, i) => {
      const a = buildArg(f, themes[i], d >= 5 ? r.pick([0, 2] as const) : 0);
      const ok = isValidForm(f) === askValid;
      return {
        text: argText(r, a, 0),
        correct: i === 0 && ok,
        error: i === 0 ? undefined : { type: "logica" as ErrorType, message: `Ese tiene la forma «${FORMS[f].schema}»: ${FORMS[f].name.toLowerCase()}, ${isValidForm(f) ? "válido" : "inválido"}. ${FORMS[f].why}` },
      };
    });
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `¿Cuál de estos argumentos es **${askValid ? "válido" : "inválido"}**?`,
        hints: [
          "Esquematizá cada uno con letras; no te dejes llevar por si las oraciones te parecen verdaderas.",
          "Mirá qué se afirma o se niega en la segunda premisa: ¿el antecedente o el consecuente?",
          "Válidas: Si A, B; A ∴ B · Si A, B; no B ∴ no A. Inválidas: Si A, B; B ∴ A · Si A, B; no A ∴ no B.",
        ],
        solution: [`El ${askValid ? "válido" : "inválido"} es el de forma «${FORMS[forms[0]].schema}» (${FORMS[forms[0]].name}).`, FORMS[forms[0]].why],
        explanation: "Para decidir la validez no importa si las oraciones son verdaderas en el mundo: importa la forma.",
      }),
      opts,
    );
  },
};

// ───────────────────────── U1 · Reglas de inferencia y pruebas ─────────────────────────

type Rule = "MP" | "MT" | "SH" | "SD" | "SIMP" | "ADJ";
const RULE_NAME: Record<Rule, string> = {
  MP: "Modus ponens",
  MT: "Modus tollens",
  SH: "Silogismo hipotético",
  SD: "Silogismo disyuntivo",
  SIMP: "Simplificación",
  ADJ: "Adjunción",
};

interface ProofLine {
  text: string;
  just: string;
  rule?: Rule;
}

function proofTemplate(k: number, th: Theme): { lines: ProofLine[]; goal: string } {
  const [A, B, C] = th;
  switch (k) {
    case 0:
      return {
        goal: C.p,
        lines: [
          { text: `Si ${A.p}, ${B.p}`, just: "Premisa" },
          { text: `Si ${B.p}, ${C.p}`, just: "Premisa" },
          { text: A.p, just: "Premisa" },
          { text: B.p, just: "MP 1, 3", rule: "MP" },
          { text: C.p, just: "MP 2, 4", rule: "MP" },
        ],
      };
    case 1:
      return {
        goal: A.n,
        lines: [
          { text: `Si ${A.p}, ${B.p}`, just: "Premisa" },
          { text: `Si ${B.p}, ${C.p}`, just: "Premisa" },
          { text: C.n, just: "Premisa" },
          { text: `Si ${A.p}, ${C.p}`, just: "SH 1, 2", rule: "SH" },
          { text: A.n, just: "MT 4, 3", rule: "MT" },
        ],
      };
    case 2:
      return {
        goal: C.p,
        lines: [
          { text: `${A.p} o ${C.p}`, just: "Premisa" },
          { text: `Si ${B.p}, ${A.n}`, just: "Premisa" },
          { text: B.p, just: "Premisa" },
          { text: A.n, just: "MP 2, 3", rule: "MP" },
          { text: C.p, just: "SD 1, 4", rule: "SD" },
        ],
      };
    case 3:
      return {
        goal: `${C.p} y ${B.p}`,
        lines: [
          { text: `${A.p} y ${B.p}`, just: "Premisa" },
          { text: `Si ${A.p}, ${C.p}`, just: "Premisa" },
          { text: A.p, just: "Simp 1", rule: "SIMP" },
          { text: C.p, just: "MP 2, 3", rule: "MP" },
          { text: B.p, just: "Simp 1", rule: "SIMP" },
          { text: `${C.p} y ${B.p}`, just: "Adj 4, 5", rule: "ADJ" },
        ],
      };
    default:
      return {
        goal: `${A.n} y ${C.p}`,
        lines: [
          { text: `Si ${A.p}, ${B.p}`, just: "Premisa" },
          { text: `${B.n} y ${C.p}`, just: "Premisa" },
          { text: B.n, just: "Simp 2", rule: "SIMP" },
          { text: A.n, just: "MT 1, 3", rule: "MT" },
          { text: C.p, just: "Simp 2", rule: "SIMP" },
          { text: `${A.n} y ${C.p}`, just: "Adj 4, 5", rule: "ADJ" },
        ],
      };
  }
}

export const ipcReglaInferencia: Generator = {
  id: "ipc-regla-inferencia",
  topicId: "t-ipc-pruebas",
  description: "Justificar pasos de una prueba directa y ordenar una prueba indirecta",
  generate(seed, d) {
    const r = rng(seed);
    const th = r.pick(THEMES);
    if (d >= 4 && r.bool()) {
      const [A, B, C] = th;
      const items = [
        `Supongamos que ${A.p} (supuesto provisional)`,
        `Entonces ${B.p} (MP con la premisa 1)`,
        `Entonces ${C.p} (MP con la premisa 2)`,
        `${cap(C.p)} y ${C.n}: contradicción (Adj con la premisa 3)`,
        `Por lo tanto, ${A.n} (se rechaza el supuesto)`,
      ];
      const ex: OrderExercise = {
        ...base({
          gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
          prompt: `Premisas: (1) Si ${A.p}, ${B.p}. (2) Si ${B.p}, ${C.p}. (3) ${cap(C.n)}.\n\nQueremos probar **por el absurdo** que ${A.n}. Ordená los pasos de la prueba indirecta.`,
          hints: [
            "Una prueba indirecta empieza suponiendo lo contrario de lo que se quiere probar.",
            "Desde el supuesto, aplicá las premisas hasta chocar con otra premisa.",
            "Al llegar a una contradicción (algo y su negación), se rechaza el supuesto.",
          ],
          solution: items,
          explanation: "Prueba indirecta (por el absurdo): se supone la negación de lo que se quiere probar, se deriva una contradicción y se concluye que el supuesto es falso.",
        }),
        kind: "order",
        items: rng(seed + 11).shuffle(items),
        answer: items,
      };
      return ex;
    }
    const k = d <= 2 ? r.pick([0, 1, 2] as const) : r.int(0, 4);
    const { lines, goal } = proofTemplate(k, th);
    const derived = lines.map((l, i) => ({ ...l, i })).filter((l) => l.rule);
    const target = r.pick(derived);
    const shown = lines.map((l, i) => `${i + 1}. ${cap(l.text)} — ${i === target.i ? "¿?" : l.just}`).join("\n");
    const rules: Rule[] = ["MP", "MT", "SH", "SD", "SIMP", "ADJ"];
    const others = sample(r, rules.filter((x) => x !== target.rule), 3);
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `En esta prueba directa de «${goal}», ¿qué regla justifica el paso ${target.i + 1}?\n\n${shown}`,
        hints: [
          "Mirá de qué líneas anteriores puede salir ese paso.",
          "¿Se usó un condicional y su antecedente? ¿Un condicional y la negación del consecuente? ¿Una disyunción y la negación de una parte? ¿Una conjunción?",
          "MP: Si A, B; A ∴ B. MT: Si A, B; no B ∴ no A. SH: encadena condicionales. SD: A o B; no A ∴ B. Simp: A y B ∴ A. Adj: A; B ∴ A y B.",
        ],
        solution: lines.map((l, i) => `${i + 1}. ${cap(l.text)} — ${l.just}`),
        explanation: "En una prueba directa cada línea es una premisa o se obtiene de líneas anteriores por una regla de inferencia válida.",
      }),
      [
        { text: RULE_NAME[target.rule!], correct: true },
        ...others.map((o) => ({ text: RULE_NAME[o], error: { type: "logica" as ErrorType, message: `${RULE_NAME[o]} no encaja: el paso ${target.i + 1} sale por ${RULE_NAME[target.rule!]} (${target.just}).` } })),
      ],
    );
  },
};

// ───────────────────────── U1 · Argumentos inductivos ─────────────────────────

interface IndTheme {
  clase: string; // plural, con artículo implícito: "los ___"
  miembro: string; // predicado de pertenencia: "es un labrador"
  ind: string[]; // individuos
  propS: string;
  propP: string;
  rasgos: [string, string];
  irrelevante: string;
}

const IND_THEMES: IndTheme[] = [
  { clase: "perros de raza labrador del refugio", miembro: "es un labrador del refugio", ind: ["Toby", "Lola", "Rocco", "Nina", "Simón"], propS: "es buen nadador", propP: "son buenos nadadores", rasgos: ["tiene pelo corto", "es de tamaño grande"], irrelevante: "se llama con un nombre de dos sílabas" },
  { clase: "estudiantes que hicieron todas las autoevaluaciones", miembro: "hizo todas las autoevaluaciones", ind: ["Rocío", "Martín", "Lucía", "Tomás", "Camila"], propS: "aprobó el primer parcial", propP: "aprobaron el primer parcial", rasgos: ["asistió a los encuentros sincrónicos", "usó el foro de consultas"], irrelevante: "vive en un departamento" },
  { clase: "pacientes del ensayo que recibieron la vacuna", miembro: "recibió la vacuna en el ensayo", ind: ["Ana", "Bruno", "Carla", "Diego", "Elena"], propS: "desarrolló anticuerpos", propP: "desarrollaron anticuerpos", rasgos: ["tiene entre 30 y 40 años", "no tiene enfermedades previas"], irrelevante: "prefiere el café al té" },
  { clase: "departamentos del edificio de la calle Rivadavia", miembro: "es un departamento del edificio de la calle Rivadavia", ind: ["El 1.º A", "El 2.º B", "El 3.º A", "El 4.º C", "El 5.º B"], propS: "tiene humedad en las paredes", propP: "tienen humedad en las paredes", rasgos: ["da al contrafrente", "tiene las cañerías originales"], irrelevante: "tiene la puerta pintada de verde" },
  { clase: "plantas de tomate del invernadero", miembro: "es una planta de tomate del invernadero", ind: ["La planta 1", "La planta 2", "La planta 3", "La planta 4", "La planta 5"], propS: "dio frutos en enero", propP: "dieron frutos en enero", rasgos: ["recibió riego por goteo", "está del lado más soleado"], irrelevante: "tiene una etiqueta azul" },
];

type IndKind = "analogia" | "enumeracion" | "silogismo" | "deductivo";
const IND_LABEL: Record<IndKind, string> = {
  analogia: "Por analogía",
  enumeracion: "Por enumeración incompleta",
  silogismo: "Silogismo inductivo",
  deductivo: "No es inductivo: es deductivo",
};

function inductiveText(r: Rng, k: IndKind, t: IndTheme, n: number): { text: string; deductiveVariant?: string } {
  const ind = sample(r, t.ind, n + 1);
  const [r1, r2] = t.rasgos;
  switch (k) {
    case "analogia": {
      const cases = ind.slice(0, n).map((x) => `${x} ${r1}, ${r2} y ${t.propS}.`);
      const xn = ind[n];
      return { text: `${cases.join(" ")} ${xn} ${r1} y ${r2}. Por lo tanto, ${xn.charAt(0).toLowerCase() === xn.charAt(0) ? xn : xn.replace(/^El /, "el ").replace(/^La /, "la ")} ${t.propS}.` };
    }
    case "enumeracion": {
      const cases = ind.slice(0, n).map((x) => `${x} ${t.miembro} y ${t.propS}.`);
      return { text: `${cases.join(" ")} Por lo tanto, todos los ${t.clase} ${t.propP}.` };
    }
    case "silogismo": {
      const x = ind[0];
      return { text: `El ${r.int(70, 95)}% de los ${t.clase} ${t.propP}. ${x} ${t.miembro}. Por lo tanto, ${lowerName(x)} ${t.propS}.` };
    }
    case "deductivo": {
      const x = ind[0];
      if (r.bool()) return { text: `Todos los ${t.clase} ${t.propP}. ${x} ${t.miembro}. Por lo tanto, ${lowerName(x)} ${t.propS}.`, deductiveVariant: "instanciación del universal" };
      const cases = ind.slice(0, 3);
      return {
        text: `${cases.map((c) => `${c} ${t.propS}.`).join(" ")} ${cases.slice(0, -1).join(", ")} y ${lowerName(cases[2])} son los únicos ${t.clase}. Por lo tanto, todos los ${t.clase} ${t.propP}.`,
        deductiveVariant: "enumeración completa",
      };
    }
  }
}

function lowerName(x: string): string {
  return x.replace(/^El /, "el ").replace(/^La /, "la ");
}

export const ipcTipoInductivo: Generator = {
  id: "ipc-tipo-inductivo",
  topicId: "t-ipc-inductivos",
  description: "Reconocer el tipo de argumento inductivo",
  generate(seed, d) {
    const r = rng(seed);
    const t = r.pick(IND_THEMES);
    const kinds: IndKind[] = d >= 4 ? ["analogia", "enumeracion", "silogismo", "deductivo"] : ["analogia", "enumeracion", "silogismo"];
    const k = r.pick(kinds);
    const { text, deductiveVariant } = inductiveText(r, k, t, d <= 2 ? 2 : 3);
    const why: Record<IndKind, string> = {
      analogia: "La conclusión es singular y se apoya en que ese individuo se parece a otros casos que tienen la propiedad: es una analogía.",
      enumeracion: "La conclusión generaliza a «todos» a partir de algunos casos observados: enumeración incompleta.",
      silogismo: "Una premisa da una frecuencia («el n%», «la mayoría») y la conclusión aplica eso a un caso: silogismo inductivo.",
      deductivo: deductiveVariant === "instanciación del universal" ? "Con «todos» (100%) ya no es silogismo inductivo: es instanciación del universal, que es deductiva y válida." : "Si los casos son TODOS los miembros de la clase, la enumeración es completa y la conclusión se sigue necesariamente: es deductivo.",
    };
    return choice(
      fixed(r),
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `¿Qué tipo de argumento es?\n\n«${text}»`,
        hints: [
          "Mirá primero la conclusión: ¿habla de todos o de un caso?",
          "«Todos» en la conclusión → enumeración. Caso singular + porcentaje → silogismo inductivo. Caso singular + semejanzas con otros casos → analogía.",
          "Si una premisa dice «todos» o «son los únicos», la conclusión se sigue necesariamente: deja de ser inductivo.",
        ],
        solution: [why[k]],
        explanation: "Todo argumento inductivo es inválido en sentido deductivo: su conclusión va más allá de las premisas. Se los evalúa por su fuerza.",
      }),
      kinds.map((x) => ({ text: IND_LABEL[x], correct: x === k, error: x === k ? undefined : { type: "logica" as ErrorType, message: why[k] } })),
    );
  },
};

export const ipcFortalecerInductivo: Generator = {
  id: "ipc-fortalecer-inductivo",
  topicId: "t-ipc-inductivos",
  description: "Fortalecer un argumento inductivo sin cambiar su tipo",
  generate(seed, d) {
    const r = rng(seed);
    const t = r.pick(IND_THEMES);
    const k = r.pick(["analogia", "enumeracion", "silogismo"] as const);
    const ind = sample(r, t.ind, 5);
    const [r1, r2] = t.rasgos;
    let text: string;
    let opts: Option[];
    const changeType = "Eso cambia el tipo de argumento: con «todos» o «son los únicos», la conclusión se sigue necesariamente y deja de ser inductivo.";
    if (k === "silogismo") {
      const pct = r.int(60, 80);
      const up = r.int(pct + 8, 97);
      text = `El ${pct}% de los ${t.clase} ${t.propP}. ${ind[0]} ${t.miembro}. Por lo tanto, ${lowerName(ind[0])} ${t.propS}.`;
      opts = [
        { text: `Reemplazar la primera premisa por: «El ${up}% de los ${t.clase} ${t.propP}».`, correct: true },
        { text: `Reemplazar la primera premisa por: «Todos los ${t.clase} ${t.propP}».`, error: { type: "logica", message: changeType } },
        { text: `Reemplazar la primera premisa por: «El ${r.int(30, pct - 10)}% de los ${t.clase} ${t.propP}».`, error: { type: "logica", message: "Bajar la frecuencia relativa debilita el silogismo inductivo." } },
        { text: `Agregar: «${ind[0]} ${t.irrelevante}».`, error: { type: "logica", message: "Es información irrelevante para la propiedad que se infiere: no aporta fuerza." } },
      ];
    } else if (k === "enumeracion") {
      const n = d <= 2 ? 2 : 3;
      text = `${ind.slice(0, n).map((x) => `${x} ${t.miembro} y ${t.propS}.`).join(" ")} Por lo tanto, todos los ${t.clase} ${t.propP}.`;
      const nx = ind[n];
      opts = [
        { text: `Agregar: «${nx} ${t.miembro} y ${t.propS}».`, correct: true },
        { text: `Agregar: «${nx} ${t.propS}».`, error: { type: "logica", message: "Caso incompleto: no dice que pertenezca a la clase, así que no suma evidencia sobre ella." } },
        { text: `Agregar: «${nx} ${t.miembro}».`, error: { type: "logica", message: "Caso incompleto: no dice si tiene la propiedad." } },
        { text: `Agregar: «${ind.slice(0, n).join(", ").replace(/, ([^,]*)$/, " y $1")} son los únicos ${t.clase}».`, error: { type: "logica", message: changeType } },
      ];
    } else {
      text = `${ind[0]} ${r1}, ${r2} y ${t.propS}. ${ind[1]} ${r1}, ${r2} y ${t.propS}. ${ind[4]} ${r1} y ${r2}. Por lo tanto, ${lowerName(ind[4])} ${t.propS}.`;
      opts = [
        { text: `Agregar: «${ind[2]} ${r1}, ${r2} y ${t.propS}».`, correct: true },
        { text: `Agregar: «${ind[2]} ${t.propS}».`, error: { type: "logica", message: "No muestra semejanzas con el caso a inferir: no fortalece la analogía." } },
        { text: `Agregar: «${ind[0]} y ${lowerName(ind[4])} ${t.irrelevante.replace(/^se llama/, "se llaman").replace(/^vive/, "viven").replace(/^prefiere/, "prefieren").replace(/^tiene/, "tienen")}».`, error: { type: "logica", message: "Es una semejanza irrelevante para la propiedad inferida: la relevancia es el primer criterio de la analogía." } },
        { text: `Agregar: «Todos los individuos que ${r1} y ${r2} ${t.propP.replace(/^son /, "son ").replace(/^aprobaron/, "aprueban")}».`, error: { type: "logica", message: changeType } },
      ];
    }
    const crit: Record<typeof k, string> = {
      analogia: "Analogía: relevancia de las semejanzas, cantidad de aspectos compartidos y cantidad de casos comparados.",
      enumeracion: "Enumeración incompleta: cantidad de casos y representatividad (variedad) de la muestra.",
      silogismo: "Silogismo inductivo: frecuencia relativa alta (sin llegar a 100%) y evidencia total disponible.",
    };
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `¿Qué modificación **fortalece** este argumento sin que deje de ser ${IND_LABEL[k].toLowerCase().replace("por ", "un argumento por ")}?\n\n«${text}»`,
        hints: ["Primero identificá el tipo de argumento.", "Pensá en sus criterios de fortaleza.", crit[k]],
        solution: [crit[k], "Cuidado con las modificaciones que lo vuelven deductivo («todos», «los únicos», 100%)."],
        explanation: "Los inductivos se evalúan por grados de fuerza. Se los fortalece según el criterio de su tipo, sin convertirlos en deductivos.",
      }),
      opts,
    );
  },
};

const U1: Generator[] = [
  ipcEsArgumento,
  ipcConclusion,
  ipcAlcanceEnunciado,
  ipcValorVerdad,
  ipcNecSuf,
  ipcTautologia,
  ipcValidezVerdad,
  ipcFormaArgumento,
  ipcCualValido,
  ipcReglaInferencia,
  ipcTipoInductivo,
  ipcFortalecerInductivo,
];

// ───────────────────────── Ayudas para bancos conceptuales ─────────────────────────

interface Labeled<L extends string> {
  text: string;
  label: L;
  why: string;
}

/** Clasificar un enunciado del banco: opciones = etiquetas en orden fijo. */
function classifyChoice<L extends string>(
  r: Rng,
  args: { gen: string; seed: number; d: Difficulty; topicId: string; prompt: (text: string) => string; item: Labeled<L>; labels: L[]; names: Record<L, string>; hints: [string, string, string]; explanation: string; errorType?: ErrorType },
) {
  const { item } = args;
  return choice(
    fixed(r),
    base({ gen: args.gen, seed: args.seed, difficulty: args.d, subjectId: S, topicId: args.topicId, prompt: args.prompt(item.text), hints: args.hints, solution: [item.why], explanation: args.explanation }),
    args.labels.map((l) => ({
      text: args.names[l],
      correct: l === item.label,
      error: l === item.label ? undefined : { type: args.errorType ?? "conceptual", message: `No: ${item.why}` },
    })),
  );
}

/** Relacionar n enunciados con etiquetas distintas (una por etiqueta). */
function matchByLabel<L extends string>(
  r: Rng,
  args: { gen: string; seed: number; d: Difficulty; topicId: string; prompt: string; bank: Labeled<L>[]; labels: L[]; names: Record<L, string>; hints: [string, string, string]; explanation: string },
): MatchExercise {
  const pairs: [string, string][] = sample(r, args.labels, args.labels.length).map((l) => {
    const it = r.pick(args.bank.filter((b) => b.label === l));
    return [it.text, args.names[l]];
  });
  return {
    ...base({ gen: args.gen, seed: args.seed, difficulty: args.d, subjectId: S, topicId: args.topicId, prompt: args.prompt, hints: args.hints, solution: pairs.map(([a, b]) => `${a} → ${b}`), explanation: args.explanation }),
    kind: "match",
    pairs,
  };
}

/** Verdadero/falso de un banco. */
function vfChoice(r: Rng, args: { gen: string; seed: number; d: Difficulty; topicId: string; st: { text: string; value: boolean; why: string }; hints: [string, string, string]; intro?: string }) {
  const { st } = args;
  return choice(
    fixed(r),
    base({ gen: args.gen, seed: args.seed, difficulty: args.d, subjectId: S, topicId: args.topicId, prompt: `¿Verdadero o falso?${args.intro ? ` ${args.intro}` : ""}\n\n«${st.text}»`, hints: args.hints, solution: [st.why], explanation: st.why }),
    [
      { text: "Verdadero", correct: st.value, error: st.value ? undefined : { type: "conceptual", message: st.why } },
      { text: "Falso", correct: !st.value, error: !st.value ? undefined : { type: "conceptual", message: st.why } },
    ],
  );
}

// ───────────────────────── U2 · Antes de Darwin ─────────────────────────

type PreLabel = "creacionismo" | "fijismo" | "lamarck" | "lyell" | "malthus" | "cuvier" | "darwin";
const PRE_NAMES: Record<PreLabel, string> = {
  creacionismo: "Creacionismo",
  fijismo: "Fijismo",
  lamarck: "Lamarck",
  lyell: "Lyell",
  malthus: "Malthus",
  cuvier: "Cuvier (catastrofismo)",
  darwin: "Darwin",
};

const PRE_BANK: Labeled<PreLabel>[] = [
  { text: "Las especies y su adecuación al medio son obra de un diseño inteligente, según un plan divino.", label: "creacionismo", why: "Explicar la adaptación por diseño de un creador es la tesis creacionista." },
  { text: "Los organismos encajan con su ambiente porque fueron hechos así desde el principio, con un propósito.", label: "creacionismo", why: "Apelar a un propósito puesto por un creador es creacionismo." },
  { text: "Las especies que vemos hoy son las mismas que existieron siempre: no cambian.", label: "fijismo", why: "La inmutabilidad de las especies es el fijismo." },
  { text: "Cada especie tiene propiedades esenciales que no varían a lo largo del tiempo.", label: "fijismo", why: "Especies con esencias inmutables: fijismo (sobre supuestos aristotélicos, como en Linneo)." },
  { text: "El uso frecuente de un órgano lo desarrolla, el desuso lo atrofia, y esos cambios se heredan.", label: "lamarck", why: "Uso y desuso más herencia de caracteres adquiridos: Lamarck." },
  { text: "Lo que un organismo adquiere durante su vida por esfuerzo o costumbre pasa a su descendencia.", label: "lamarck", why: "La herencia de caracteres adquiridos es la tesis de Lamarck." },
  { text: "Para explicar el relieve basta con suponer que las causas que actúan hoy (erosión, sedimentación) actuaron igual durante muchísimo tiempo.", label: "lyell", why: "Actualismo y gradualismo en tiempos enormes: Lyell." },
  { text: "La Tierra cambió lentamente, por acumulación de pequeños cambios a lo largo de tiempos enormes.", label: "lyell", why: "El gradualismo geológico con tiempo profundo es de Lyell." },
  { text: "La población tiende a crecer más rápido que los alimentos disponibles, lo que genera una lucha por la existencia.", label: "malthus", why: "Población que crece más que los recursos: Malthus." },
  { text: "Los grandes cambios de la superficie terrestre se debieron a catástrofes breves y violentas.", label: "cuvier", why: "Cambios bruscos y violentos: catastrofismo de Cuvier, lo opuesto a Lyell." },
  { text: "Entre los individuos de una población hay variaciones; los que tienen rasgos ventajosos dejan más descendencia, y así cambia la población.", label: "darwin", why: "Variación, ventaja, más descendencia y herencia: selección natural, de Darwin." },
  { text: "Las semejanzas entre especies distintas se deben a que descienden de un ancestro común.", label: "darwin", why: "Descendencia con modificación desde un ancestro común: Darwin." },
];

const PRE_MATCH: [string, string][] = [
  ["Lamarck", "Uso y desuso de los órganos y herencia de caracteres adquiridos"],
  ["Lyell", "Gradualismo y actualismo: las mismas causas de hoy, durante tiempos enormes"],
  ["Malthus", "La población crece más rápido que los alimentos: lucha por la existencia"],
  ["Cuvier", "Catastrofismo: cambios bruscos y violentos"],
  ["Linneo", "Clasificación jerárquica de especies por propiedades esenciales"],
  ["Owen", "Homologías entendidas como variaciones de arquetipos de un plan divino"],
  ["Los criadores", "Selección artificial: elegir qué individuos se reproducen"],
];

const LAMARCK_DARWIN: { text: string; value: boolean; why: string }[] = [
  { text: "Lamarck y Darwin coinciden en que las especies cambian (evolucionan).", value: true, why: "Ambos son evolucionistas: rechazan el fijismo." },
  { text: "Lamarck y Darwin coinciden en que hace falta la herencia para que los cambios perduren.", value: true, why: "Ambos necesitan que los rasgos pasen a la descendencia; difieren en cómo surge la variación." },
  { text: "Darwin acepta que los rasgos adquiridos por uso y desuso se heredan, igual que Lamarck.", value: false, why: "Darwin toma de Lamarck la idea de evolución, pero no ese mecanismo: la variación no surge por el esfuerzo del organismo." },
  { text: "Para Lamarck, los rasgos nuevos aparecen en respuesta a las necesidades que impone el ambiente.", value: true, why: "En Lamarck el cambio responde a la necesidad y al uso; en Darwin la variación no está dirigida por el ambiente." },
  { text: "Para Darwin, los rasgos nuevos aparecen porque el organismo los necesita.", value: false, why: "Eso es lamarckiano. Para Darwin la variación no está dirigida: puede ser ventajosa, neutra o perjudicial." },
  { text: "El fijismo sostiene que las especies no cambian a lo largo del tiempo.", value: true, why: "Esa es justamente la tesis fijista." },
  { text: "Lyell sostenía que la Tierra se formó por catástrofes breves y violentas.", value: false, why: "Eso es el catastrofismo de Cuvier. Lyell defendía el gradualismo y el actualismo." },
  { text: "De Malthus, Darwin tomó la idea de que no todos los individuos que nacen logran sobrevivir y reproducirse.", value: true, why: "La población crece más que los recursos: hay competencia, lucha por la existencia." },
];

export const ipcAntecedentesDarwin: Generator = {
  id: "ipc-antecedentes-darwin",
  topicId: "t-ipc-pre-darwin",
  description: "Creacionismo, fijismo, Lamarck y las influencias de Darwin",
  generate(seed, d) {
    const r = rng(seed);
    const hints: [string, string, string] = [
      "Preguntate si la tesis habla de un creador, de especies inmutables, de esfuerzo y herencia, de geología o de población.",
      "Lamarck: uso y desuso + herencia de lo adquirido. Lyell: cambios lentos con las causas de hoy. Malthus: población vs alimentos.",
      "Cuvier: catástrofes. Creacionismo: diseño. Fijismo: las especies no cambian. Darwin: variación + selección + herencia.",
    ];
    const mode = d <= 2 ? 0 : d <= 4 ? r.pick([0, 1, 2] as const) : r.pick([1, 2] as const);
    if (mode === 1) {
      const pairs = sample(r, PRE_MATCH, 4);
      const ex: MatchExercise = {
        ...base({ gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId, prompt: "Relacioná cada autor con la idea que lo caracteriza.", hints, solution: pairs.map(([a, b]) => `${a} → ${b}`), explanation: "Darwin integró ideas de distintas fuentes: la evolución (Lamarck), el tiempo profundo (Lyell), la lucha por la existencia (Malthus) y la selección artificial (criadores)." }),
        kind: "match",
        pairs,
      };
      return ex;
    }
    if (mode === 2) return vfChoice(r, { gen: this.id, seed, d, topicId: this.topicId, st: LAMARCK_DARWIN[(seed + d) % LAMARCK_DARWIN.length], hints });
    const item = r.pick(PRE_BANK);
    const others = sample(r, (Object.keys(PRE_NAMES) as PreLabel[]).filter((l) => l !== item.label), 3);
    return choice(
      r,
      base({ gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId, prompt: `¿A qué posición o autor corresponde esta idea?\n\n«${item.text}»`, hints, solution: [item.why], explanation: "Ubicar a cada antecedente ayuda a ver qué tomó Darwin y qué rechazó." }),
      [{ text: PRE_NAMES[item.label], correct: true }, ...others.map((o) => ({ text: PRE_NAMES[o], error: { type: "conceptual" as ErrorType, message: item.why } }))],
    );
  },
};

// ───────────────────────── U2 · Selección natural ─────────────────────────

interface Trait {
  desc: string;
  org: string; // "las jirafas"
  creados: string; // "creadas" | "creados"
  anc: string;
  rasgoVar: string;
  ventaja: string;
  uso: string;
  rasgo: string;
  fin: string;
}

const TRAITS: Trait[] = [
  { desc: "Las jirafas tienen el cuello muy largo, lo que les permite alcanzar las hojas altas de las acacias.", org: "las jirafas", creados: "creadas", anc: "los ancestros de las jirafas", rasgoVar: "el cuello algo más largo que el resto", ventaja: "alcanzaban más alimento cuando escaseaban las hojas bajas", uso: "estiraban el cuello para llegar a las hojas altas y, de tanto usarlo, se les fue alargando", rasgo: "el cuello largo", fin: "alimentarse de las hojas altas" },
  { desc: "Los cactus tienen espinas en lugar de hojas anchas, lo que reduce la pérdida de agua en el desierto.", org: "los cactus", creados: "creados", anc: "los ancestros de los cactus", rasgoVar: "hojas más reducidas", ventaja: "perdían menos agua en ambientes secos", uso: "al pasar mucha sed fueron afinando sus hojas hasta volverlas espinas", rasgo: "las espinas", fin: "vivir en el desierto" },
  { desc: "La liebre ártica tiene el pelaje blanco, lo que la camufla en la nieve.", org: "las liebres árticas", creados: "creadas", anc: "las liebres ancestrales de la región", rasgoVar: "el pelaje más claro", ventaja: "los depredadores las detectaban menos sobre la nieve", uso: "se esforzaban por esconderse en la nieve y su pelaje se fue aclarando", rasgo: "el pelaje blanco", fin: "camuflarse en la nieve" },
  { desc: "En una isla donde abundan las semillas duras, los pinzones tienen el pico grueso y fuerte.", org: "estos pinzones", creados: "creados", anc: "los pinzones que colonizaron la isla", rasgoVar: "el pico un poco más grueso", ventaja: "podían romper las semillas duras y comer más", uso: "picaban semillas duras con tanta fuerza que su pico se fue engrosando", rasgo: "el pico grueso", fin: "romper semillas duras" },
  { desc: "En un hospital, muchas bacterias de cierta especie ya no mueren con el antibiótico que antes las eliminaba.", org: "estas bacterias", creados: "creadas", anc: "la población original de bacterias", rasgoVar: "una resistencia algo mayor al antibiótico", ventaja: "sobrevivían a los tratamientos", uso: "se fueron acostumbrando al antibiótico de tanto estar en contacto con él", rasgo: "la resistencia al antibiótico", fin: "resistir los tratamientos" },
  { desc: "En zonas industriales contaminadas, la mayoría de las polillas de cierta especie son de color oscuro.", org: "estas polillas", creados: "creadas", anc: "las polillas de la región", rasgoVar: "alas más oscuras", ventaja: "pasaban desapercibidas para las aves sobre los troncos ennegrecidos por el hollín", uso: "se fueron oscureciendo al posarse una y otra vez sobre troncos sucios", rasgo: "el color oscuro", fin: "esconderse sobre troncos oscuros" },
];

type EvoKind = "darwin" | "lamarck" | "creacion" | "azar" | "progreso";
const EVO_MSG: Record<EvoKind, string> = {
  darwin: "Variación previa, ventaja en un ambiente, más descendencia y herencia: selección natural.",
  lamarck: "Es lamarckiana: el rasgo aparece por el uso o el esfuerzo y se hereda lo adquirido.",
  creacion: "Es creacionista: apela a un diseño con un fin («para…», «en armonía»).",
  azar: "Confunde variación aleatoria con ausencia de selección: para Darwin la variación es aleatoria, pero la selección no.",
  progreso: "Supone que la evolución tiene dirección o meta; para Darwin la selección es ciega y no apunta a un «ideal».",
};

function evoText(k: EvoKind, t: Trait): string {
  switch (k) {
    case "darwin":
      return `Entre ${t.anc} había individuos con ${t.rasgoVar}; como ${t.ventaja}, sobrevivían y dejaban más descendencia, que heredaba ese rasgo, y su proporción en la población aumentó generación tras generación.`;
    case "lamarck":
      return `${cap(t.anc)} ${t.uso}, y ese rasgo adquirido pasó a sus descendientes.`;
    case "creacion":
      return `${cap(t.org)} fueron ${t.creados} con ${t.rasgo} para ${t.fin}, en armonía con su entorno.`;
    case "azar":
      return `${cap(t.rasgo)} es pura lotería: apareció por azar y se mantuvo sin ninguna relación con el ambiente en que viven ${t.org}.`;
    case "progreso":
      return `La evolución avanza necesariamente hacia formas cada vez más perfectas; ${t.rasgo} es un paso más en ese progreso.`;
  }
}

export const ipcExplicacionEvolutiva: Generator = {
  id: "ipc-explicacion-evolutiva",
  topicId: "t-ipc-seleccion-natural",
  description: "Elegir la explicación darwiniana de un rasgo (o reconocer la lamarckiana, creacionista…)",
  generate(seed, d) {
    const r = rng(seed);
    const t = r.pick(TRAITS);
    const kinds: EvoKind[] = ["darwin", "lamarck", "creacion", "azar", "progreso"];
    const target: EvoKind = d >= 4 && r.bool() ? r.pick(["lamarck", "creacion", "azar"] as const) : "darwin";
    const others = sample(r, kinds.filter((k) => k !== target), 3);
    const ask: Record<EvoKind, string> = {
      darwin: "¿Qué opción lo explica según la teoría de la **selección natural**?",
      lamarck: "¿Cuál de estas explicaciones es **lamarckiana**?",
      creacion: "¿Cuál de estas explicaciones es **creacionista**?",
      azar: "¿Cuál de estas explicaciones confunde la variación aleatoria con **ausencia de selección**?",
      progreso: "",
    };
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `${t.desc}\n\n${ask[target]}`,
        hints: [
          "La explicación darwiniana mira a los ANCESTROS: había variación antes de que el rasgo fuera útil.",
          "Buscá los cuatro ingredientes: variación previa, ventaja en ese ambiente, más descendencia y herencia.",
          "Lamarck: «de tanto usar…, lo adquirieron y lo heredaron». Creacionismo: «fueron creados para…». Azar puro: «sin relación con el ambiente».",
        ],
        solution: [evoText(target, t), EVO_MSG[target]],
        explanation: "La selección natural explica la adaptación sin finalidad ni diseño: variación no dirigida + herencia + diferencias en supervivencia y reproducción.",
      }),
      [
        { text: evoText(target, t), correct: true },
        ...others.map((k) => ({ text: evoText(k, t), error: { type: "conceptual" as ErrorType, message: EVO_MSG[k] } })),
      ],
    );
  },
};

interface VFJ {
  text: string;
  value: boolean;
  why: string;
  wrong: [string, string];
}

const DARWIN_VF: VFJ[] = [
  { text: "Los rasgos nuevos que aparecen por variación siempre mejoran la aptitud.", value: false, why: "la variación no está dirigida: un rasgo nuevo puede ser beneficioso, neutro o perjudicial", wrong: ["la selección natural solo produce rasgos útiles", "el ambiente provoca los rasgos que el organismo necesita"] },
  { text: "Los descendientes heredan solo los rasgos útiles de sus progenitores.", value: false, why: "se heredan muchos rasgos, útiles o no; la selección actúa después, sobre la supervivencia y la reproducción", wrong: ["los rasgos inútiles desaparecen en cuanto aparecen", "solo se transmite lo que el organismo usa"] },
  { text: "La descendencia no es idéntica a sus progenitores.", value: true, why: "hay herencia de muchos rasgos, pero en cada generación aparecen variaciones nuevas", wrong: ["los hijos heredan los rasgos adquiridos por esfuerzo de sus padres", "cada generación es creada de nuevo"] },
  { text: "Los rasgos que aparecen por variación responden a las necesidades que impone el ambiente.", value: false, why: "la variación es aleatoria en el sentido de no dirigida: no surge porque el organismo la necesite", wrong: ["el uso intensivo de un órgano lo desarrolla y ese cambio se hereda", "todos los rasgos nuevos aumentan la aptitud"] },
  { text: "La aptitud de un rasgo depende del ambiente.", value: true, why: "el mismo rasgo puede ser ventajoso en un medio e inútil o perjudicial en otro", wrong: ["los rasgos son buenos o malos en sí mismos", "la aptitud se mide en relación con otras especies"] },
  { text: "Que la variación sea aleatoria significa que no tiene ninguna causa.", value: false, why: "«aleatoria» significa que no está dirigida por las necesidades del ambiente, no que carezca de causa", wrong: ["la teoría de Darwin renuncia a explicar la variación", "todo en la evolución es azar, incluida la selección"] },
  { text: "Según Darwin, la evolución avanza necesariamente de lo simple a lo complejo, con el ser humano como cima.", value: false, why: "la selección es ciega: no tiene dirección ni meta", wrong: ["las especies complejas están mejor diseñadas", "la naturaleza tiende siempre a lo mejor"] },
  { text: "En una población, la proporción de individuos con un rasgo ventajoso tiende a aumentar generación tras generación.", value: true, why: "quienes lo tienen dejan más descendencia, que hereda el rasgo", wrong: ["los individuos adquieren el rasgo a lo largo de su vida", "el rasgo aparece a la vez en todos los individuos"] },
  { text: "La teoría sintética de la evolución explica la variación mediante mutaciones en el material genético.", value: true, why: "integra a Darwin con la genética: las mutaciones (errores de copia del ADN) son fuente de variación", wrong: ["la teoría sintética retoma la herencia de caracteres adquiridos", "las mutaciones aparecen cuando el organismo las necesita"] },
];

export const ipcDarwinVF: Generator = {
  id: "ipc-darwin-vf",
  topicId: "t-ipc-seleccion-natural",
  description: "Verdadero o falso (con justificación) sobre la selección natural",
  generate(seed, d) {
    const r = rng(seed);
    const it = DARWIN_VF[(seed * 3 + d) % DARWIN_VF.length];
    const hints: [string, string, string] = [
      "Repasá los ingredientes: variación no dirigida, herencia, lucha por la existencia, selección.",
      "«Aleatoria» = no dirigida por las necesidades; la herencia no filtra rasgos útiles; la aptitud es relativa al ambiente.",
      "Desconfiá de «siempre», «solo» y de cualquier idea de meta o progreso.",
    ];
    if (d <= 2) return vfChoice(r, { gen: this.id, seed, d, topicId: this.topicId, st: { text: it.text, value: it.value, why: cap(it.why) + "." }, hints, intro: "Según la teoría de Darwin:" });
    const V = it.value ? "Verdadero" : "Falso";
    const NV = it.value ? "Falso" : "Verdadero";
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Según la teoría de Darwin: «${it.text}»\n\nElegí el valor de verdad **y** la justificación correctos.`,
        hints,
        solution: [`${V}, porque ${it.why}.`],
        explanation: "En los ítems con justificación, tienen que estar bien las dos partes: el valor de verdad y la razón.",
      }),
      [
        { text: `${V}, porque ${it.why}.`, correct: true },
        { text: `${V}, porque ${it.wrong[0]}.`, error: { type: "conceptual", message: `El valor es correcto, pero la razón no: ${it.why}.` } },
        { text: `${NV}, porque ${it.wrong[1]}.`, error: { type: "conceptual", message: `Es ${V.toLowerCase()}: ${it.why}.` } },
        { text: `${NV}, porque ${it.wrong[0]}.`, error: { type: "conceptual", message: `Es ${V.toLowerCase()}: ${it.why}.` } },
      ],
    );
  },
};

const U2: Generator[] = [ipcAntecedentesDarwin, ipcExplicacionEvolutiva, ipcDarwinVF];

// @@U3-U4@@


export const IPC_GENERATORS: Generator[] = [...U1, ...U2];

