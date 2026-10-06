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

// ───────────────────────── U3 · Términos y enunciados científicos ─────────────────────────

type EnLabel = "basico" | "generalizacion" | "teorico-puro" | "teorico-mixto";
const EN_NAMES: Record<EnLabel, string> = {
  basico: "Empírico básico",
  generalizacion: "Generalización empírica",
  "teorico-puro": "Teórico puro",
  "teorico-mixto": "Teórico mixto",
};

const EN_BANK: Labeled<EnLabel>[] = [
  { text: "La rana del estanque del parque Saavedra tiene manchas verdes en el lomo.", label: "basico", why: "Es singular y solo usa términos observacionales: empírico básico." },
  { text: "Todos los perros que se vacunaron ayer en la veterinaria del barrio ladraron al ver la jeringa.", label: "basico", why: "Habla de un conjunto finito y accesible (muestral) con vocabulario observacional: sigue siendo empírico básico, aunque diga «todos»." },
  { text: "En el frasco 3 del laboratorio hay un líquido turbio de color amarillo.", label: "basico", why: "Singular y observacional: empírico básico." },
  { text: "Las 20 plantas del cantero norte florecieron en octubre.", label: "basico", why: "Muestral (conjunto finito y accesible) con términos observacionales: empírico básico." },
  { text: "Los metales se dilatan cuando se los calienta.", label: "generalizacion", why: "Habla de una clase potencialmente infinita y solo con términos observacionales: generalización empírica (universal)." },
  { text: "Uno de cada 80 embarazos es múltiple.", label: "generalizacion", why: "Generalización empírica estadística: clase abierta, vocabulario observacional." },
  { text: "Existen seres vivos que viven sin oxígeno.", label: "generalizacion", why: "Generalización empírica existencial: observacional y sobre una clase no acotada." },
  { text: "Los cuervos son negros.", label: "generalizacion", why: "Universal sobre una clase abierta, con términos observacionales: generalización empírica." },
  { text: "Los quarks son partículas subatómicas.", label: "teorico-puro", why: "Todos sus términos no lógicos (quark, partícula subatómica) son teóricos: teórico puro." },
  { text: "Los genes están formados por segmentos de ADN.", label: "teorico-puro", why: "Gen y ADN no se observan directamente: teórico puro." },
  { text: "Los electrones tienen carga eléctrica negativa.", label: "teorico-puro", why: "Electrón y carga eléctrica son términos teóricos: teórico puro." },
  { text: "Las partículas subatómicas cargadas dejan un rastro visible en la cámara de niebla.", label: "teorico-mixto", why: "Combina un término teórico (partícula subatómica) con uno observacional (rastro visible): teórico mixto, una regla de correspondencia." },
  { text: "Cuando aumenta la bilirrubina en la sangre, la piel se pone amarilla.", label: "teorico-mixto", why: "Bilirrubina es teórico; piel amarilla, observacional: teórico mixto." },
  { text: "Pablo tiene la piel amarilla por sus altos niveles de bilirrubina.", label: "teorico-mixto", why: "Aunque es singular, incluye un término teórico (bilirrubina): teórico mixto, no básico." },
  { text: "Las personas con una mutación en ese gen tienen los ojos de distinto color.", label: "teorico-mixto", why: "Mezcla un término teórico (mutación, gen) con uno observacional (color de ojos): teórico mixto." },
];

type TermLabel = "observacional" | "teorico" | "logico";
const TERM_NAMES: Record<TermLabel, string> = { observacional: "Término observacional", teorico: "Término teórico", logico: "Término lógico" };
const TERM_BANK: Labeled<TermLabel>[] = [
  ...["balanza", "rojo", "cuello", "mono", "hoja", "termómetro", "lluvia", "piedra"].map((w) => ({ text: w, label: "observacional" as const, why: `«${w}» refiere a algo accesible directamente por los sentidos.` })),
  ...["electrón", "gen", "quark", "bilirrubina", "campo magnético", "átomo", "virus"].map((w) => ({ text: w, label: "teorico" as const, why: `«${w}» refiere a algo accesible solo indirectamente, con instrumentos o teorías.` })),
  ...["todos", "algunos", "y", "si… entonces", "no"].map((w) => ({ text: w, label: "logico" as const, why: `«${w}» es una expresión lógica (conectiva o cuantificador): no refiere a nada del mundo.` })),
];

export const ipcTipoEnunciadoCientifico: Generator = {
  id: "ipc-tipo-enunciado-cientifico",
  topicId: "t-ipc-contrastacion",
  description: "Clasificar términos y enunciados de las teorías científicas",
  generate(seed, d) {
    const r = rng(seed);
    const hints: [string, string, string] = [
      "Primero mirá el vocabulario: ¿hay algún término teórico (gen, electrón, bilirrubina…)?",
      "Si hay teóricos: solo teóricos → puro; teóricos + observacionales → mixto.",
      "Si es todo observacional: singular o muestral (finito y accesible) → básico; clase abierta → generalización empírica.",
    ];
    if (d <= 2 && r.bool()) {
      return classifyChoice(r, {
        gen: this.id, seed, d, topicId: this.topicId, item: r.pick(TERM_BANK), labels: ["observacional", "teorico", "logico"], names: TERM_NAMES,
        prompt: (t) => `¿Qué tipo de término es «${t}»?`,
        hints: ["¿Se puede percibir directamente con los sentidos?", "Los términos teóricos refieren a lo que solo se conoce con instrumentos o teorías.", "Los lógicos son conectivas y cuantificadores."],
        explanation: "Términos lógicos (conectivas, cuantificadores) y no lógicos: observacionales (accesibles por los sentidos) y teóricos (accesibles indirectamente). La frontera entre estos dos es gradual.",
      });
    }
    if (d >= 4 && r.bool()) {
      return matchByLabel(r, {
        gen: this.id, seed, d, topicId: this.topicId, bank: EN_BANK, labels: ["basico", "generalizacion", "teorico-puro", "teorico-mixto"], names: EN_NAMES,
        prompt: "Relacioná cada enunciado con su tipo.", hints,
        explanation: "Básicos y generalizaciones solo tienen vocabulario observacional y se distinguen por su alcance; los teóricos incluyen términos teóricos (puros: solo teóricos; mixtos: teóricos y observacionales).",
      });
    }
    return classifyChoice(r, {
      gen: this.id, seed, d, topicId: this.topicId, item: r.pick(EN_BANK), labels: ["basico", "generalizacion", "teorico-puro", "teorico-mixto"], names: EN_NAMES,
      prompt: (t) => `¿Qué tipo de enunciado es?\n\n«${t}»`, hints,
      explanation: "Básicos y generalizaciones solo tienen vocabulario observacional y se distinguen por su alcance; los teóricos incluyen términos teóricos.",
    });
  },
};

// ───────────────────────── U3 · Contrastación de hipótesis ─────────────────────────

type Role = "H" | "CI" | "HA" | "CO";
const ROLE_NAMES: Record<Role, string> = { H: "Hipótesis a contrastar", CI: "Condición inicial", HA: "Hipótesis auxiliar", CO: "Consecuencia observacional" };
const ROLE_WHY: Record<Role, string> = {
  H: "es el enunciado general que se pone a prueba y del que no se sabe si es verdadero",
  CI: "es un enunciado empírico básico (singular o muestral) que describe la situación concreta de la prueba",
  HA: "es un enunciado general ya aceptado que se presupone (por ejemplo, que el instrumento funciona)",
  CO: "es un enunciado empírico básico que se deduce y describe lo que debería observarse si la hipótesis fuera verdadera",
};

const CASES: Record<Role, string>[] = [
  { H: "Las plantas de lechuga iluminadas con luz LED azul crecen más rápido que las iluminadas con luz blanca.", CI: "Se colocaron 12 plantas de lechuga bajo luz azul y 12 bajo luz blanca, en la misma cámara de cultivo.", HA: "Las lámparas LED de ambos colores emiten la misma cantidad de calor.", CO: "Al cabo de tres semanas, las 12 plantas bajo luz azul miden más que las 12 bajo luz blanca." },
  { H: "El período de un péndulo no depende de la masa que cuelga de él.", CI: "De un hilo de 1 m se colgó primero una pesa de 50 g y luego una de 200 g, y se midieron 20 oscilaciones con cada una.", HA: "El cronómetro digital mide el tiempo con precisión de centésimas de segundo.", CO: "Las 20 oscilaciones duran lo mismo con la pesa de 50 g que con la de 200 g." },
  { H: "El insecticida X desorienta a las abejas melíferas.", CI: "Se expuso a 50 abejas marcadas de una colmena a una dosis baja del insecticida X y se las liberó a 1 km de la colmena.", HA: "Las marcas de pintura no alteran la capacidad de orientación de las abejas.", CO: "Menos de la mitad de las 50 abejas marcadas regresa a la colmena." },
  { H: "Los gorriones urbanos cantan más agudo que los rurales para hacerse oír sobre el ruido de baja frecuencia.", CI: "Se grabó el canto de 15 gorriones en Plaza Once y de 15 gorriones en un campo de Chascomús, en la misma semana.", HA: "Los micrófonos usados registran con igual fidelidad todas las frecuencias del canto.", CO: "La frecuencia promedio de los cantos grabados en Plaza Once es más alta que la de los grabados en Chascomús." },
];

export const ipcComponentesContrastacion: Generator = {
  id: "ipc-componentes-contrastacion",
  topicId: "t-ipc-contrastacion",
  description: "Identificar H, CI, HA y CO, y la lógica de la refutación y la confirmación",
  generate(seed, d) {
    const r = rng(seed);
    const cs = r.pick(CASES);
    const hints: [string, string, string] = [
      "Distinguí lo general (H, HA) de lo singular o muestral (CI, CO).",
      "La HA ya está aceptada y se presupone; la H es lo que se pone a prueba. La CI describe el montaje; la CO, lo que se espera observar.",
      "La CO se deduce de H junto con CI y HA: Si (H y CI y HA), entonces CO.",
    ];
    const story = `Un equipo quiere poner a prueba esta hipótesis: «${cs.H}»`;
    if (d >= 4 && r.bool()) {
      const refuted = r.bool();
      const opts: Option[] = refuted
        ? [
            { text: "Que es falsa la conjunción de H, CI y HA: al menos uno de esos enunciados es falso (modus tollens).", correct: true },
            { text: "Que la hipótesis H es falsa.", error: { type: "logica", message: "El modus tollens refuta la conjunción (H y CI y HA). La lógica no dice cuál de los conyuntos falló: podría fallar una CI o una HA." } },
            { text: "Que la hipótesis auxiliar es falsa y la hipótesis queda a salvo.", error: { type: "logica", message: "Eso sería culpar a la HA sin razón independiente (riesgo de hipótesis ad hoc). La lógica solo dice que algún conyunto es falso." } },
            { text: "Nada: un resultado negativo no tiene valor lógico.", error: { type: "logica", message: "Sí lo tiene: por modus tollens, si no se cumple la CO, la conjunción de H, CI y HA es falsa." } },
          ]
        : [
            { text: "Que la hipótesis no queda probada: concluir H a partir de CO sería afirmar el consecuente.", correct: true },
            { text: "Que la hipótesis queda verificada: es verdadera.", error: { type: "logica", message: "Si (H…) entonces CO; CO; ∴ H es la falacia de afirmación del consecuente. Un resultado favorable no prueba la hipótesis." } },
            { text: "Que la hipótesis es falsa.", error: { type: "logica", message: "Un resultado favorable no refuta nada: la CO se cumplió." } },
            { text: "Que las hipótesis auxiliares son falsas.", error: { type: "logica", message: "No hay nada que lo indique: la CO se cumplió." } },
          ];
      return choice(
        r,
        base({
          gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
          prompt: `${story}\n\nDeducen la consecuencia observacional «${cs.CO}», y al hacer la prueba **${refuted ? "no se cumple" : "se cumple"}**. Desde la lógica, ¿qué se puede concluir?`,
          hints: ["Escribí el esquema: Si (H y CI y HA), entonces CO.", refuted ? "La segunda premisa es «no CO». ¿Qué forma válida usa la negación del consecuente?" : "La segunda premisa es «CO». ¿Qué pasa si concluís el antecedente?", "Refutar = modus tollens (válido). «Confirmar» = afirmación del consecuente (inválido): de ahí la asimetría de la contrastación."],
          solution: refuted
            ? ["Si (H y CI y HA), entonces CO.", "No CO.", "Por lo tanto, no (H y CI y HA): al menos uno es falso, pero la lógica no dice cuál."]
            : ["Si (H y CI y HA), entonces CO.", "CO.", "Concluir H sería afirmar el consecuente: no es válido. La hipótesis no queda verificada."],
          explanation: "Asimetría de la contrastación: una hipótesis universal puede refutarse (modus tollens), pero no verificarse con resultados favorables.",
        }),
        opts,
      );
    }
    if (d >= 3 && r.bool()) {
      const roles: Role[] = ["H", "CI", "HA", "CO"];
      const pairs: [string, string][] = r.shuffle(roles).map((ro) => [cs[ro], ROLE_NAMES[ro]]);
      const ex: MatchExercise = {
        ...base({ gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId, prompt: "Relacioná cada enunciado de esta contrastación con la función que cumple.", hints, solution: roles.map((ro) => `${ROLE_NAMES[ro]}: «${cs[ro]}» — ${ROLE_WHY[ro]}.`), explanation: "Estructura: Si (H y CI y HA), entonces CO. H y HA son generales; CI y CO, empíricas básicas." }),
        kind: "match",
        pairs,
      };
      return ex;
    }
    const role = r.pick(["CI", "HA", "CO"] as const);
    return choice(
      fixed(r),
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `${story}\n\n¿Qué función cumple este enunciado?\n«${cs[role]}»`,
        hints, solution: [`Es ${ROLE_NAMES[role].toLowerCase()}: ${ROLE_WHY[role]}.`],
        explanation: "Si (H y CI y HA), entonces CO. La CI es singular; la HA, general; la CO, empírica básica y deducida.",
      }),
      (["H", "CI", "HA", "CO"] as Role[]).map((ro) => ({
        text: ROLE_NAMES[ro],
        correct: ro === role,
        error: ro === role ? undefined : { type: "conceptual" as ErrorType, message: `No: ese enunciado ${ROLE_WHY[role]}. Una ${ROLE_NAMES[ro].toLowerCase()} ${ROLE_WHY[ro]}.` },
      })),
    );
  },
};

// ───────────────────────── U3 · Positivismo lógico y falsacionismo ─────────────────────────

type Escuela = "pl" | "popper" | "ambos" | "kuhn";
const ESC_NAMES: Record<Escuela, string> = { pl: "Positivismo lógico (inductivismo crítico)", popper: "Falsacionismo (Popper)", ambos: "Ambos (filosofía clásica)", kuhn: "Kuhn" };

const ESC_BANK: Labeled<Escuela>[] = [
  { text: "Cada caso favorable aumenta el grado de probabilidad (confirmación) de una hipótesis.", label: "pl", why: "La confirmación probabilística es la tesis del inductivismo crítico (Hempel, Carnap)." },
  { text: "Un enunciado tiene sentido cognoscitivo solo si es formal o traducible a un lenguaje observacional.", label: "pl", why: "El criterio de demarcación del positivismo lógico es a la vez criterio de sentido." },
  { text: "La metafísica carece de sentido: no es ni verdadera ni falsa.", label: "pl", why: "Para el positivismo lógico, lo no traducible a lo observacional es un sinsentido." },
  { text: "La inducción no cumple ningún papel en la ciencia, ni en el descubrimiento ni en la justificación.", label: "popper", why: "Popper rechaza la inducción en todas sus instancias." },
  { text: "Una hipótesis es científica si se pueden formular enunciados básicos incompatibles con ella.", label: "popper", why: "La falsabilidad como criterio de demarcación es de Popper." },
  { text: "Que una hipótesis resista un intento de refutación no la vuelve más probable: solo queda corroborada, de modo provisorio.", label: "popper", why: "La corroboración es un concepto negativo, no probabilístico: Popper." },
  { text: "Los enunciados básicos se aceptan por decisión de la comunidad: la experiencia motiva esa decisión pero no la justifica.", label: "popper", why: "La falibilidad de la base empírica es una tesis de Popper." },
  { text: "Lo que no es ciencia empírica puede tener sentido; simplemente no es ciencia.", label: "popper", why: "El criterio de Popper no es criterio de sentido." },
  { text: "La ciencia progresa por acumulación: las teorías nuevas conservan y amplían el contenido verdadero de las anteriores.", label: "pl", why: "El progreso acumulativo y continuo es la imagen del positivismo lógico." },
  { text: "Hay que distinguir el contexto de descubrimiento del contexto de justificación.", label: "ambos", why: "Es un rasgo compartido por toda la filosofía clásica de la ciencia." },
  { text: "No hay una lógica que reglamente cómo se inventan las hipótesis.", label: "ambos", why: "Ambos ubican la invención de hipótesis en el contexto de descubrimiento, sin reglas lógicas." },
  { text: "Las teorías son sistemas de enunciados que pueden reconstruirse lógicamente, y su cambio se explica sin factores extracientíficos.", label: "ambos", why: "Reconstrucción racional y cambio sin factores extracientíficos: rasgos de toda la filosofía clásica." },
  { text: "Toda observación está cargada de teoría, y los criterios de racionalidad cambian históricamente.", label: "kuhn", why: "La carga teórica y la racionalidad históricamente situada son críticas de Kuhn a la filosofía clásica." },
  { text: "El agente de la ciencia es la comunidad científica, y la historia de la ciencia es imprescindible para entenderla.", label: "kuhn", why: "Es el giro historicista de la nueva filosofía de la ciencia (Kuhn)." },
];

interface FalsCase {
  h: string;
  fals: string;
  compat: string;
  prob: string;
  univ: string;
}
const FALS_CASES: FalsCase[] = [
  { h: "Todos los metales se dilatan al ser calentados.", fals: "En el laboratorio 3 de la facultad, el 5 de mayo a las 10 h, hay una barra de cobre que, al ser calentada, no se dilató.", compat: "En el laboratorio 3 de la facultad, el 5 de mayo a las 10 h, hay una barra de cobre que, al ser calentada, se dilató.", prob: "Es muy probable que los metales se dilaten al ser calentados.", univ: "Ningún metal se dilata al ser calentado." },
  { h: "Todos los cisnes son blancos.", fals: "En la laguna de Chascomús, el 3 de marzo a las 8 h, hay un cisne negro.", compat: "En la laguna de Chascomús, el 3 de marzo a las 8 h, hay un cisne blanco.", prob: "La mayoría de los cisnes son blancos.", univ: "Ningún cisne es blanco." },
  { h: "Todos los mamíferos respiran con pulmones.", fals: "En el acuario de Mar del Plata, el 12 de enero, hay un mamífero que respira sin pulmones.", compat: "En el acuario de Mar del Plata, el 12 de enero, hay un delfín que respira con pulmones.", prob: "El 99% de los mamíferos respiran con pulmones.", univ: "Ningún mamífero respira con pulmones." },
  { h: "El agua pura, a nivel del mar, hierve a 100 °C.", fals: "En la cocina de la escuela de Quilmes, el 2 de junio a las 15 h, hay una muestra de agua pura a nivel del mar que hierve a 90 °C.", compat: "En la cocina de la escuela de Quilmes, el 2 de junio a las 15 h, hay una muestra de agua pura a nivel del mar que hierve a 100 °C.", prob: "Probablemente el agua pura hierva a 100 °C a nivel del mar.", univ: "El agua pura nunca hierve a 100 °C." },
];

const FALSABLE: { text: string; value: boolean; why: string }[] = [
  { text: "Mañana lloverá o no lloverá en Rosario.", value: false, why: "Es una tautología: ningún enunciado básico lógicamente posible la contradice." },
  { text: "Todos los planetas giran alrededor de una estrella.", value: true, why: "Es universal: se puede formular un falsador potencial (un planeta, en tal lugar y momento, que no gira alrededor de una estrella)." },
  { text: "El 70% de los fumadores desarrolla alguna enfermedad respiratoria.", value: false, why: "Es probabilístico: ningún caso aislado lo contradice, así que no tiene falsadores potenciales." },
  { text: "Detrás de los fenómenos hay una fuerza vital imperceptible que no deja ninguna huella observable.", value: false, why: "Ningún enunciado básico observacional es incompatible con ella: es metafísica, no ciencia empírica." },
  { text: "El hierro se oxida al estar expuesto a la humedad.", value: true, why: "Prohíbe algo observable: un trozo de hierro expuesto a la humedad que no se oxida." },
  { text: "Todo lo que ocurre, ocurre por alguna razón.", value: false, why: "No prohíbe ningún hecho observable: no hay falsadores potenciales." },
];

export const ipcPlPopper: Generator = {
  id: "ipc-pl-popper",
  topicId: "t-ipc-pl-popper",
  description: "Atribuir tesis al positivismo lógico, a Popper o a ambos",
  generate(seed, d) {
    const r = rng(seed);
    const labels: Escuela[] = d >= 4 ? ["pl", "popper", "ambos", "kuhn"] : ["pl", "popper", "ambos"];
    const item = r.pick(ESC_BANK.filter((e) => labels.includes(e.label)));
    return classifyChoice(r, {
      gen: this.id, seed, d, topicId: this.topicId, item, labels, names: ESC_NAMES,
      prompt: (t) => `¿Quién sostiene esta tesis?\n\n«${t}»`,
      hints: [
        "Inducción y confirmación probabilística → positivismo lógico. Falsabilidad, corroboración, rechazo total de la inducción → Popper.",
        "Criterio de SENTIDO → positivismo lógico; el de Popper no niega sentido a lo no científico.",
        "Descubrimiento/justificación, reconstrucción lógica y cobertura legal son compartidos.",
      ],
      explanation: "Positivismo lógico: confirmación inductiva y demarcación como criterio de sentido. Popper: falsabilidad, corroboración, base empírica falible. Ambos: reconstrucción racional, distinción descubrimiento/justificación.",
    });
  },
};

function falsableItem(r: Rng) {
  const f = r.pick(FALSABLE);
  return { text: `Este enunciado es falsable según Popper: ${f.text}`, value: f.value, why: f.why };
}

export const ipcFalsador: Generator = {
  id: "ipc-falsador",
  topicId: "t-ipc-pl-popper",
  description: "Reconocer falsadores potenciales y enunciados falsables",
  generate(seed, d) {
    const r = rng(seed);
    if (d >= 3 && r.bool()) {
      return vfChoice(r, {
        gen: this.id, seed, d, topicId: this.topicId,
        st: falsableItem(r),
        hints: ["Preguntate: ¿qué observación concreta lo contradiría?", "Si ninguna observación lógicamente posible lo contradice, no es falsable.", "Tautologías, enunciados probabilísticos y metafísica no tienen falsadores potenciales."],
      });
    }
    const c = r.pick(FALS_CASES);
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Hipótesis: «${c.h}»\n\n¿Cuál es un **falsador potencial** de esta hipótesis?`,
        hints: [
          "Un falsador potencial es un enunciado básico: singular (lugar y momento), existencial («hay un…») y observacional.",
          "Además tiene que ser lógicamente posible e INCOMPATIBLE con la hipótesis.",
          "Descartá lo compatible, lo probabilístico y lo general.",
        ],
        solution: [`«${c.fals}»: es singular, existencial, observacional, lógicamente posible e incompatible con la hipótesis.`],
        explanation: "Para Popper, una hipótesis es empírica si tiene falsadores potenciales. Demarcar es un análisis lógico: no hace falta observar nada.",
      }),
      [
        { text: c.fals, correct: true },
        { text: c.compat, error: { type: "conceptual", message: "Es un enunciado básico, pero COMPATIBLE con la hipótesis: no podría refutarla." } },
        { text: c.prob, error: { type: "conceptual", message: "Es probabilístico (o general), no un enunciado básico singular: no puede funcionar como falsador." } },
        { text: c.univ, error: { type: "conceptual", message: "No es singular ni se refiere a un lugar y momento: no es un enunciado básico." } },
      ],
    );
  },
};

// ───────────────────────── U3 · Explicación científica ─────────────────────────

type ExpRole = "ley" | "condicion" | "explanandum" | "irrelevante";
const EXP_NAMES: Record<ExpRole, string> = { ley: "Ley (en el explanans)", condicion: "Condición antecedente (en el explanans)", explanandum: "Explanandum", irrelevante: "No forma parte de la explicación" };
const EXP_CASES: Record<ExpRole, string>[] = [
  { explanandum: "El agua de la botella que quedó en el freezer se congeló.", ley: "El agua a presión normal se congela por debajo de 0 °C.", condicion: "La botella estuvo seis horas en un freezer a −18 °C, a presión normal.", irrelevante: "La botella era de plástico verde." },
  { explanandum: "La barra de hierro del puente se alargó unos milímetros al mediodía.", ley: "Los metales se dilatan cuando aumenta su temperatura.", condicion: "Al mediodía, la barra de hierro pasó de 15 °C a 35 °C.", irrelevante: "El puente se inauguró en 1990." },
  { explanandum: "Los glóbulos rojos de la muestra se hincharon.", ley: "Las células animales colocadas en agua destilada absorben agua y se hinchan.", condicion: "La muestra de glóbulos rojos se colocó en agua destilada.", irrelevante: "La muestra se tomó un martes." },
  { explanandum: "La manteca que quedó sobre la mesada se derritió.", ley: "La manteca se derrite a temperaturas superiores a unos 32 °C.", condicion: "La mesada estuvo toda la tarde a 36 °C.", irrelevante: "La manteca era de una marca nacional." },
];

const EXP_FAILS: { text: string; fail: string }[] = [
  { text: "Bajó la cantidad de turistas en la costa porque bajaron los turistas extranjeros, los de otras provincias y todos los que visitan la costa.", fail: "peticion" },
  { text: "La cosecha fue mala porque los espíritus del campo estaban enojados con el productor.", fail: "empirico" },
  { text: "El vidrio de la ventana se rompió porque ayer cayó granizo del tamaño de una nuez.", fail: "ley" },
  { text: "La manteca se derritió porque la manteca se derrite a más de 32 °C.", fail: "condicion" },
  { text: "El paciente se recuperó porque una fuerza curativa invisible, que no deja rastros, actuó sobre él.", fail: "empirico" },
  { text: "El hielo del vaso se derritió porque el agua congelada que había en el vaso pasó al estado líquido.", fail: "peticion" },
];
const FAIL_NAMES: Record<string, string> = {
  peticion: "Petición de principio: el explanandum ya está en el explanans",
  empirico: "Falta de contenido empírico en el explanans",
  ley: "No hay ninguna ley en el explanans",
  condicion: "Faltan condiciones antecedentes: el explanandum no se deduce",
};
const FAIL_WHY: Record<string, string> = {
  peticion: "El explanandum reaparece (tal cual o reformulado) en el explanans: hay deducción, pero no explicación.",
  empirico: "El explanans apela a entidades no contrastables: no tiene contenido empírico.",
  ley: "Solo hay un dato particular (una condición); sin una ley general no hay explicación por cobertura legal.",
  condicion: "Hay una ley, pero falta el dato particular que diga que el caso cumplió las condiciones: el explanandum no se sigue.",
};

const EXP_VF: { text: string; value: boolean; why: string }[] = [
  { text: "Según el modelo de cobertura legal, explicación y predicción tienen la misma estructura lógica.", value: true, why: "La diferencia es temporal: en la predicción el explanandum todavía no ocurrió o no se conoce." },
  { text: "El explanans debe contener al menos una ley.", value: true, why: "Explicar es mostrar el hecho como caso de una ley." },
  { text: "Para explicar una regularidad siempre hacen falta condiciones antecedentes.", value: false, why: "Una regularidad puede explicarse subsumiéndola en leyes más generales, sin condiciones antecedentes." },
  { text: "En una explicación, se desconoce si el explanandum ocurrió.", value: false, why: "En la explicación el explanandum se sabe ocurrido; si todavía no ocurrió, es una predicción." },
  { text: "Los enunciados del explanans deben tener contenido empírico.", value: true, why: "Es uno de los requisitos: nada de entidades no contrastables." },
  { text: "En una explicación inductivo-estadística, el explanans hace solo probable el explanandum.", value: true, why: "Usa al menos una ley estadística: el vínculo no es deductivo." },
];

export const ipcExplicacionCientifica: Generator = {
  id: "ipc-explicacion-cientifica",
  topicId: "t-ipc-explicacion",
  description: "Componentes y requisitos del modelo de cobertura legal",
  generate(seed, d) {
    const r = rng(seed);
    const hints: [string, string, string] = [
      "El explanandum describe lo que se quiere explicar; el explanans, lo que lo explica.",
      "En el explanans hay leyes (generales) y condiciones antecedentes (datos particulares del caso).",
      "Requisitos: al menos una ley, relevancia, contenido empírico, verdad (o alta confirmación) y, en las nomológico-deductivas, deducción.",
    ];
    const mode = d <= 2 ? 0 : d <= 4 ? r.pick([0, 1, 2] as const) : r.pick([1, 2, 3] as const);
    const cs = r.pick(EXP_CASES);
    if (mode === 1) {
      return matchByLabel(r, {
        gen: this.id, seed, d, topicId: this.topicId,
        bank: (Object.keys(cs) as ExpRole[]).map((k) => ({ text: cs[k], label: k, why: "" })),
        labels: ["ley", "condicion", "explanandum", "irrelevante"], names: EXP_NAMES,
        prompt: "Relacioná cada enunciado con el lugar que ocupa en una explicación nomológico-deductiva.", hints,
        explanation: "Explanans = leyes + condiciones antecedentes; explanandum = el hecho que se explica. Lo que no contribuye a deducirlo no forma parte de la explicación.",
      });
    }
    if (mode === 2) {
      const f = r.pick(EXP_FAILS);
      return choice(
        fixed(r),
        base({ gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId, prompt: `¿Qué requisito del modelo de cobertura legal **no** cumple esta explicación?\n\n«${f.text}»`, hints, solution: [FAIL_WHY[f.fail]], explanation: "Una explicación por cobertura legal muestra el hecho como caso de una ley, con condiciones antecedentes, contenido empírico y sin repetir el explanandum." }),
        Object.keys(FAIL_NAMES).map((k) => ({ text: FAIL_NAMES[k], correct: k === f.fail, error: k === f.fail ? undefined : { type: "conceptual" as ErrorType, message: FAIL_WHY[f.fail] } })),
      );
    }
    if (mode === 3) return vfChoice(r, { gen: this.id, seed, d, topicId: this.topicId, st: EXP_VF[(seed + d) % EXP_VF.length], hints });
    const role = r.pick(["ley", "condicion", "irrelevante"] as const);
    return classifyChoice(r, {
      gen: this.id, seed, d, topicId: this.topicId,
      item: { text: cs[role], label: role, why: role === "ley" ? "Es un enunciado general que expresa una regularidad: una ley." : role === "condicion" ? "Es un dato particular del caso, sin el cual el hecho no habría ocurrido: condición antecedente." : "No contribuye a deducir el explanandum: es irrelevante." },
      labels: ["ley", "condicion", "explanandum", "irrelevante"], names: EXP_NAMES,
      prompt: (t) => `Queremos explicar por qué «${cs.explanandum}»\n\n¿Qué lugar ocupa este enunciado?\n«${t}»`,
      hints, explanation: "Explanans = leyes + condiciones antecedentes; explanandum = el hecho que se explica.",
    });
  },
};

// ───────────────────────── U3 · Kuhn ─────────────────────────

type KuhnLabel = "pre" | "normal" | "anomalia" | "crisis" | "revolucion" | "incon";
const KUHN_NAMES: Record<KuhnLabel, string> = { pre: "Período preparadigmático", normal: "Ciencia normal (resolución de enigmas)", anomalia: "Anomalía", crisis: "Crisis", revolucion: "Revolución científica", incon: "Inconmensurabilidad" };
const KUHN_BANK: Labeled<KuhnLabel>[] = [
  { text: "Varias escuelas compiten sin ponerse de acuerdo en qué estudiar ni cómo, y cada investigador empieza desde los cimientos.", label: "pre", why: "Sin consenso en supuestos, métodos ni problemas: período preparadigmático." },
  { text: "Una astrónoma no logra que sus cálculos coincidan con las observaciones; la comunidad atribuye el fracaso a errores de ella y nadie duda de la teoría vigente.", label: "normal", why: "Se culpa al científico y no al paradigma: es un enigma de la ciencia normal." },
  { text: "Los investigadores aplican las soluciones modelo de los manuales para resolver problemas nuevos con resultado asegurado.", label: "normal", why: "Resolver enigmas imitando ejemplares es la actividad de la ciencia normal." },
  { text: "Un fenómeno se resiste persistentemente a ser explicado con el paradigma vigente y viola sus expectativas.", label: "anomalia", why: "Eso es una anomalía: algo que el paradigma no logra absorber." },
  { text: "Se acumulan anomalías, la comunidad pierde confianza en el paradigma y aparecen teorías alternativas aisladas.", label: "crisis", why: "Acumulación de anomalías, escepticismo e inseguridad profesional: crisis." },
  { text: "La comunidad abandona el viejo paradigma y adopta uno nuevo e incompatible; Kuhn lo compara con una conversión.", label: "revolucion", why: "Reemplazo no acumulativo de un paradigma por otro: revolución científica." },
  { text: "Un mismo término, como «masa», cambia de significado de un paradigma a otro y no hay una medida neutral para compararlos.", label: "incon", why: "Sin medida común y con cambio de significado: inconmensurabilidad (lingüística)." },
  { text: "Partidarios de paradigmas distintos «ven» cosas distintas al mirar el mismo fenómeno, como en una figura ambigua.", label: "incon", why: "Es el aspecto perceptual de la inconmensurabilidad." },
];
const KUHN_ORDER = ["Período preparadigmático", "Ciencia normal", "Anomalías", "Crisis", "Revolución científica", "Nueva ciencia normal"];
const MATRIZ: [string, string][] = [
  ["«F = m·a»", "Generalización simbólica"],
  ["Pensar el átomo como un sistema solar en miniatura", "Modelo"],
  ["Preferir teorías con predicciones cuantitativas", "Valor"],
  ["El mundo está formado por partículas en movimiento", "Principio metafísico (ontológico)"],
];

export const ipcKuhn: Generator = {
  id: "ipc-kuhn",
  topicId: "t-ipc-kuhn",
  description: "Etapas del desarrollo científico, matriz disciplinar e inconmensurabilidad según Kuhn",
  generate(seed, d) {
    const r = rng(seed);
    const hints: [string, string, string] = [
      "¿Hay un paradigma aceptado? ¿Se culpa al científico o al paradigma?",
      "Enigma: tiene solución dentro del paradigma. Anomalía: se resiste y viola expectativas. Crisis: se acumulan anomalías.",
      "Revolución: cambio no acumulativo a un paradigma incompatible. Inconmensurabilidad: no hay medida neutral para comparar.",
    ];
    const mode = d <= 2 ? 0 : d <= 4 ? r.pick([0, 0, 1] as const) : r.pick([0, 1, 2] as const);
    if (mode === 1) {
      const ex: OrderExercise = {
        ...base({ gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId, prompt: "Ordená las etapas del desarrollo de una disciplina según Kuhn.", hints, solution: KUHN_ORDER, explanation: "Preciencia → ciencia normal → anomalías → crisis → revolución → nueva ciencia normal. El progreso es acumulativo dentro de un paradigma, pero no entre paradigmas." }),
        kind: "order",
        items: rng(seed + 5).shuffle(KUHN_ORDER),
        answer: KUHN_ORDER,
      };
      return ex;
    }
    if (mode === 2) {
      const ex: MatchExercise = {
        ...base({ gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId, prompt: "Relacioná cada ejemplo con el componente de la matriz disciplinar al que pertenece.", hints: ["La matriz disciplinar es el paradigma en sentido sociológico.", "Generalizaciones: leyes formalizables. Modelos: analogías. Valores: cómo debe ser una buena teoría.", "Principios metafísicos: qué hay en el mundo."], solution: MATRIZ.map(([a, b]) => `${a} → ${b}`), explanation: "Componentes de la matriz disciplinar: generalizaciones simbólicas, modelos, valores y principios metafísicos." }),
        kind: "match",
        pairs: r.shuffle(MATRIZ),
      };
      return ex;
    }
    const labels: KuhnLabel[] = ["pre", "normal", "anomalia", "crisis", "revolucion", "incon"];
    const item = r.pick(KUHN_BANK);
    const opts = [item.label, ...sample(r, labels.filter((l) => l !== item.label), 3)];
    return choice(
      r,
      base({ gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId, prompt: `Desde Kuhn, ¿cómo se describe mejor esta situación?\n\n«${item.text}»`, hints, solution: [item.why], explanation: "Kuhn describe la ciencia como una práctica histórica de comunidades que comparten un paradigma." }),
      opts.map((l, i) => ({ text: KUHN_NAMES[l], correct: i === 0, error: i === 0 ? undefined : { type: "conceptual" as ErrorType, message: item.why } })),
    );
  },
};

// ───────────────────────── U3 · Epistemología feminista ─────────────────────────

type Trad = "punto" | "posmo" | "empirismo";
const TRAD_NAMES: Record<Trad, string> = { punto: "Teoría del punto de vista", posmo: "Posmodernismo feminista", empirismo: "Empirismo feminista" };
const TRAD_BANK: Labeled<Trad>[] = [
  { text: "La perspectiva de los grupos desfavorecidos es epistémicamente privilegiada para estudiar los fenómenos sociales que los involucran.", label: "punto", why: "El privilegio epistémico de los grupos oprimidos es la tesis de la teoría del punto de vista." },
  { text: "Quienes ocupan posiciones desfavorecidas pueden ver como contingente lo que el orden dominante presenta como natural.", label: "punto", why: "Es uno de los argumentos de la teoría del punto de vista." },
  { text: "Las identidades son inestables y múltiples; no hay un concepto unitario de «mujer», y hay que atender a la interseccionalidad.", label: "posmo", why: "El rechazo de una identidad unitaria y la interseccionalidad caracterizan al posmodernismo feminista." },
  { text: "El conocimiento es una construcción discursiva plural, y elegir un lenguaje es ejercer poder.", label: "posmo", why: "Es una tesis del posmodernismo feminista." },
  { text: "La objetividad es intersubjetividad crítica: requiere ámbitos públicos de crítica, respuesta a la crítica y igualdad de autoridad intelectual.", label: "empirismo", why: "Es la propuesta de Longino, dentro del empirismo feminista." },
  { text: "Se mantienen la evidencia y la lógica, pero el sujeto del conocimiento es la comunidad y los valores que guían la elección de teorías deben revisarse.", label: "empirismo", why: "Mantener el empirismo reconociendo la carga teórica y el sujeto comunitario es el empirismo feminista." },
];

type Manif = "omision" | "exclusion" | "aplicacion" | "teoria" | "concepto";
const MANIF_NAMES: Record<Manif, string> = { omision: "Omisiones selectivas en la historia de la ciencia", exclusion: "Exclusión y marginación de las mujeres", aplicacion: "Aplicaciones sexistas", teoria: "Teorías o estereotipos sexistas", concepto: "Conceptualizaciones sexistas" };
const MANIF_BANK: Labeled<Manif>[] = [
  { text: "El aporte decisivo de una investigadora a un descubrimiento se atribuye a sus colegas varones, que reciben el premio.", label: "omision", why: "Atribuir a varones el trabajo de mujeres (efecto Matilda) es una omisión selectiva en la historia de la ciencia." },
  { text: "Hasta entrado el siglo XX, las universidades no admitían mujeres en ciertas carreras.", label: "exclusion", why: "Es un mecanismo institucional explícito de exclusión." },
  { text: "En un instituto, a las investigadoras se les asignan sistemáticamente tareas secundarias y casi no llegan a cargos de dirección.", label: "exclusion", why: "Mecanismos implícitos y techo de cristal: exclusión y marginación." },
  { text: "Los síntomas de un infarto se describen tomando como modelo el cuerpo masculino, y en mujeres se diagnostica tarde.", label: "aplicacion", why: "Es una aplicación sexista del conocimiento: diagnósticos basados en cuerpos masculinos." },
  { text: "Una teoría sobre la evolución humana atribuye todos los avances técnicos a la caza practicada por los varones y presenta a las mujeres como pasivas.", label: "teoria", why: "Es una teoría sexista (como la del «hombre cazador»)." },
  { text: "Un manual describe la menopausia como un «fallo funcional total» del organismo.", label: "concepto", why: "Es una conceptualización sexista: una metáfora que patologiza un tránsito vital." },
];

const SITUADO_VF: { text: string; value: boolean; why: string }[] = [
  { text: "Que el conocimiento sea situado implica que todas las perspectivas valen lo mismo.", value: false, why: "Como advierte Elizabeth Anderson, conocimiento situado no implica relativismo." },
  { text: "El género es un modo de situación social.", value: true, why: "Resulta de cómo una sociedad opera con las diferencias sexuales y distribuye roles y poder." },
  { text: "Reconocer que el conocimiento es situado obliga a abandonar la objetividad como meta.", value: false, why: "No: conocimiento situado no implica que la objetividad sea indeseable." },
  { text: "La epistemología feminista profundiza el análisis de factores extracientíficos que habilitó la crítica de Kuhn.", value: true, why: "Kuhn mostró que la racionalidad está históricamente situada; eso habilitó el análisis de sesgos como los de género." },
];

export const ipcFeminismo: Generator = {
  id: "ipc-feminismo",
  topicId: "t-ipc-feminismo",
  description: "Tradiciones de la epistemología feminista, manifestaciones del sexismo y conocimiento situado",
  generate(seed, d) {
    const r = rng(seed);
    const mode = d <= 2 ? r.pick([0, 1] as const) : r.pick([0, 1, 2] as const);
    if (mode === 0) {
      return classifyChoice(r, {
        gen: this.id, seed, d, topicId: this.topicId, item: r.pick(TRAD_BANK), labels: ["punto", "posmo", "empirismo"], names: TRAD_NAMES,
        prompt: (t) => `¿Qué tradición de la epistemología feminista sostiene esta tesis?\n\n«${t}»`,
        hints: ["Privilegio epistémico de los grupos desfavorecidos → punto de vista.", "Identidades inestables, interseccionalidad, discurso y poder → posmodernismo.", "Evidencia, comunidad como sujeto, objetividad como crítica intersubjetiva (Longino) → empirismo feminista."],
        explanation: "Las tres tradiciones (según Sandra Harding) comparten hoy el pluralismo y la situacionalidad del conocimiento.",
      });
    }
    if (mode === 1) {
      const item = r.pick(MANIF_BANK);
      const labels: Manif[] = ["omision", "exclusion", "aplicacion", "teoria", "concepto"];
      const opts = [item.label, ...sample(r, labels.filter((l) => l !== item.label), 3)];
      return choice(
        r,
        base({ gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId, prompt: `¿Qué manifestación del sexismo o el androcentrismo en la ciencia ilustra este caso?\n\n«${item.text}»`, hints: ["¿Afecta a la historia, a quiénes pueden investigar, a los usos del conocimiento o al contenido de las teorías?", "Historia → omisiones. Acceso y carrera → exclusión. Usos → aplicaciones. Contenido → teorías o conceptos.", "Las conceptualizaciones sexistas son metáforas o definiciones que desvalorizan."], solution: [item.why], explanation: "La epistemología feminista busca visibilizar el sexismo y el androcentrismo en la producción, validación y aplicación del conocimiento." }),
        opts.map((l, i) => ({ text: MANIF_NAMES[l], correct: i === 0, error: i === 0 ? undefined : { type: "conceptual" as ErrorType, message: item.why } })),
      );
    }
    return vfChoice(r, { gen: this.id, seed, d, topicId: this.topicId, st: SITUADO_VF[(seed + d) % SITUADO_VF.length], hints: ["Pensá en la idea de cognoscente situado.", "La situación social (y el género) influye en lo que se conoce.", "Situado no significa relativista."] });
  },
};

const U3: Generator[] = [ipcTipoEnunciadoCientifico, ipcComponentesContrastacion, ipcPlPopper, ipcFalsador, ipcExplicacionCientifica, ipcKuhn, ipcFeminismo];

// ───────────────────────── U4 · Ética de la ciencia ─────────────────────────

type Postura = "cientificismo" | "anticientificismo";
const POST_NAMES: Record<Postura, string> = { cientificismo: "Cientificismo", anticientificismo: "Anticientificismo" };
const POST_BANK: Labeled<Postura>[] = [
  { text: "Los químicos que estudiaron las reacciones de combustión no son responsables de que se fabriquen explosivos con ese conocimiento.", label: "cientificismo", why: "Ubicar la responsabilidad solo en quienes usan el conocimiento es la tesis cientificista." },
  { text: "El conocimiento científico es como un martillo: no es bueno ni malo, depende de quién lo empuñe.", label: "cientificismo", why: "Es la imagen de la «ciencia martillo», con la que el anticientificismo caricaturiza al cientificismo." },
  { text: "La ciencia pura busca conocimiento de manera desinteresada y es valorativamente neutral; la tecnología sí debe someterse a controles morales.", label: "cientificismo", why: "Neutralidad de la ciencia pura y control ético solo para la tecnología: cientificismo (Bunge)." },
  { text: "La búsqueda de la verdad y la búsqueda de utilidad son independientes.", label: "cientificismo", why: "Separar ciencia pura de aplicaciones es la tesis cientificista." },
  { text: "La agenda de qué se investiga está orientada desde el comienzo por los intereses de quienes financian la investigación.", label: "anticientificismo", why: "Afirmar que la investigación está atravesada por intereses es anticientificista." },
  { text: "Distinguir entre ciencia básica, aplicada y tecnología es una abstracción: se trata de una sola tecnociencia orientada al control de la naturaleza.", label: "anticientificismo", why: "La noción de tecnociencia es de la crítica anticientificista (Marí)." },
  { text: "Los científicos, junto con otros actores, son responsables de los usos y consecuencias previsibles de lo que investigan.", label: "anticientificismo", why: "Extender la responsabilidad a los científicos es la posición anticientificista." },
  { text: "La ciencia es una institución de saber y poder, y no puede considerarse neutral.", label: "anticientificismo", why: "Negar la neutralidad valorativa es la tesis anticientificista." },
];

type Enfoque = "internalista" | "externalista";
const ENF_NAMES: Record<Enfoque, string> = { internalista: "Enfoque internalista (ética de la investigación)", externalista: "Enfoque externalista (ética de los usos y del impacto social)" };
const ENF_BANK: Labeled<Enfoque>[] = [
  { text: "Un comité discute si un investigador debe declarar que su estudio sobre un edulcorante fue pagado por la empresa que lo fabrica.", label: "internalista", why: "Los conflictos de interés durante la investigación son un tema internalista." },
  { text: "Una revista retira un artículo porque se comprobó que los datos habían sido fabricados.", label: "internalista", why: "El fraude es una falta a la integridad científica durante la investigación: enfoque internalista." },
  { text: "Se debate si es aceptable engañar a los participantes de un experimento psicológico sobre su verdadero propósito.", label: "internalista", why: "La ética de la investigación con personas mira la conducta durante el proceso de investigar." },
  { text: "Se discute quién debe figurar como autor de un trabajo y cómo reconocer el aporte de cada integrante del equipo.", label: "internalista", why: "El reconocimiento de méritos dentro de la comunidad es internalista." },
  { text: "Una mesa de diálogo analiza los efectos de la automatización sobre el empleo en una región.", label: "externalista", why: "El impacto social de la ciencia y la tecnología es el tema del enfoque externalista." },
  { text: "Organizaciones vecinales reclaman participar en la evaluación de riesgos de una nueva planta de energía.", label: "externalista", why: "El impacto social y la participación de actores no técnicos son temas externalistas." },
  { text: "Se discute si deben permitirse los usos militares de un desarrollo en inteligencia artificial.", label: "externalista", why: "Los usos de la ciencia y sus consecuencias sociales: enfoque externalista." },
];

const ETICA_VF: { text: string; value: boolean; why: string }[] = [
  { text: "Ser responsable de algo es lo mismo que ser culpable.", value: false, why: "Responsabilidad no es culpabilidad: se puede responder por las consecuencias de los propios actos sin que eso implique culpa." },
  { text: "Para atribuir responsabilidad hace falta un agente capaz de prever consecuencias y con libertad para actuar de otro modo.", value: true, why: "La responsabilidad requiere un agente intencional y libertad." },
  { text: "Concluir que los padres no deben criar a sus hijos porque en cierta especie los machos no crían es una inferencia correcta.", value: false, why: "Es una falacia naturalista: deriva una conclusión normativa (qué se debe hacer) de un hecho natural." },
  { text: "El cientificismo niega que la tecnología deba someterse a cualquier control ético.", value: false, why: "El cientificismo acepta controles morales y sociales para la tecnología; lo que considera neutral es la ciencia pura." },
  { text: "Se puede hacer ciencia sin ser cientificista.", value: true, why: "El cientificismo es una posición filosófica sobre la ciencia, no una condición para hacerla." },
  { text: "La presión por publicar mucho puede funcionar como un incentivo perverso que afecta la integridad científica.", value: true, why: "Es uno de los problemas éticos asociados al sistema de publicación y revisión por pares." },
];

export const ipcEticaCiencia: Generator = {
  id: "ipc-etica-ciencia",
  topicId: "t-ipc-etica",
  description: "Cientificismo vs anticientificismo, enfoques internalista y externalista, responsabilidad",
  generate(seed, d) {
    const r = rng(seed);
    const mode = d <= 2 ? r.pick([0, 1] as const) : r.pick([0, 1, 2] as const);
    if (mode === 0) {
      return classifyChoice(r, {
        gen: this.id, seed, d, topicId: this.topicId, item: r.pick(POST_BANK), labels: ["cientificismo", "anticientificismo"], names: POST_NAMES,
        prompt: (t) => `¿Quién sostendría esta afirmación?\n\n«${t}»`,
        hints: ["¿Afirma que la ciencia es neutral o que está atravesada por intereses?", "Cientificismo: ciencia pura neutral, responsables son quienes la usan. Anticientificismo: tecnociencia, ciencia como saber/poder.", "Ojo: la imagen del martillo es la caricatura que el anticientificismo hace del cientificismo."],
        explanation: "Cientificismo (Bunge): la ciencia pura es neutral; la responsabilidad está en los usos. Anticientificismo (Marí): no hay neutralidad y los científicos también son responsables.",
      });
    }
    if (mode === 1) {
      return classifyChoice(r, {
        gen: this.id, seed, d, topicId: this.topicId, item: r.pick(ENF_BANK), labels: ["internalista", "externalista"], names: ENF_NAMES,
        prompt: (t) => `¿Qué enfoque ético corresponde a esta discusión?\n\n«${t}»`,
        hints: ["¿Mira la conducta de quienes investigan o el impacto de la ciencia en la sociedad?", "Internalista: honestidad, fraude, plagio, conflictos de interés, trato a participantes.", "Externalista: usos, riesgos y consecuencias sociales de la ciencia y la tecnología."],
        explanation: "El enfoque internalista mira la conducta durante la investigación; el externalista, el impacto social de la ciencia y la tecnología.",
      });
    }
    return vfChoice(r, { gen: this.id, seed, d, topicId: this.topicId, st: ETICA_VF[(seed + d) % ETICA_VF.length], hints: ["Separá los planos: describir hechos no es decir qué se debe hacer.", "Responsabilidad requiere agente intencional y libertad.", "El cientificismo distingue ciencia pura (neutral) de tecnología (controlable)."] });
  },
};

// ───────────────────────── U4 · Políticas científicas ─────────────────────────

type PolLabel = "practicista" | "cientificista";
const POL_NAMES: Record<PolLabel, string> = { practicista: "Postura practicista", cientificista: "Postura cientificista" };
const POL_BANK: Labeled<PolLabel>[] = [
  { text: "Con recursos escasos, la investigación debe dirigirse a resolver los problemas sanitarios y productivos urgentes del país.", label: "practicista", why: "Priorizar la ciencia aplicada a las demandas sociales es practicista." },
  { text: "La ciencia básica que la hagan los países ricos; nosotros tenemos que aplicar ese conocimiento.", label: "practicista", why: "Dejar la ciencia básica a los países centrales es la tesis practicista." },
  { text: "La autonomía de los científicos debe subordinarse a las necesidades sociales y económicas del país.", label: "practicista", why: "Subordinar la autonomía a las demandas sociales es practicista." },
  { text: "Hay que financiar prioritariamente la ciencia básica, porque de ella surgen beneficios futuros que no pueden anticiparse.", label: "cientificista", why: "Priorizar la ciencia básica por sus beneficios no especificados es la postura cientificista (Bunge)." },
  { text: "Muchos de los avances más importantes surgieron de investigaciones que no buscaban ninguna aplicación inmediata.", label: "cientificista", why: "Es un argumento cientificista contra el practicismo." },
  { text: "Si un país periférico solo aplica ciencia ajena, queda dependiente de agendas definidas en otros países.", label: "cientificista", why: "El argumento de la dependencia defiende la ciencia básica también en países periféricos." },
];

type InvLabel = "basica" | "aplicada";
const INV_NAMES: Record<InvLabel, string> = { basica: "Ciencia básica", aplicada: "Ciencia aplicada" };
const INV_BANK: Labeled<InvLabel>[] = [
  { text: "Descubrir que una proteína del organismo favorece el crecimiento de ciertos tumores.", label: "basica", why: "Busca conocimiento sobre cómo funciona algo, sin una aplicación práctica inmediata: ciencia básica." },
  { text: "Desarrollar un anticuerpo que bloquee esa proteína para usarlo en un tratamiento.", label: "aplicada", why: "Aplica conocimiento previo a un problema práctico: ciencia aplicada." },
  { text: "Estudiar cómo se comunican entre sí las neuronas de un gusano microscópico.", label: "basica", why: "Busca comprender un fenómeno: ciencia básica." },
  { text: "Mejorar una variedad de trigo para que resista sequías en la región pampeana.", label: "aplicada", why: "Orientada a resolver un problema productivo concreto: ciencia aplicada." },
  { text: "Investigar las propiedades radiactivas de un mineral recién descubierto.", label: "basica", why: "Estudio de propiedades de la naturaleza sin un fin práctico definido: ciencia básica." },
  { text: "Diseñar un método para potabilizar el agua de pozos contaminados con arsénico.", label: "aplicada", why: "Usa conocimientos disponibles para resolver un problema práctico: ciencia aplicada." },
];

const LINEAL = ["Ciencia básica", "Ciencia aplicada", "Desarrollo tecnológico", "Bienestar social"];

export const ipcPoliticasCientificas: Generator = {
  id: "ipc-politicas-cientificas",
  topicId: "t-ipc-politicas",
  description: "Practicismo vs cientificismo, ciencia básica vs aplicada, modelo lineal e inversión relativa",
  generate(seed, d) {
    const r = rng(seed);
    const mode = d <= 2 ? r.pick([0, 1] as const) : r.pick([0, 1, 2, 3, 3] as const);
    if (mode === 0) {
      return classifyChoice(r, {
        gen: this.id, seed, d, topicId: this.topicId, item: r.pick(POL_BANK), labels: ["practicista", "cientificista"], names: POL_NAMES,
        prompt: (t) => `¿Qué postura sobre el financiamiento de la ciencia expresa esta afirmación?\n\n«${t}»`,
        hints: ["¿Prioriza lo aplicado y urgente o la ciencia básica?", "Practicista: ciencia aplicada al servicio de los problemas del país.", "Cientificista: prioridad de la básica por sus beneficios futuros no especificados."],
        explanation: "La discusión sobre qué financiar enfrenta al practicismo (prioridad de lo aplicado) y al cientificismo (prioridad de lo básico).",
      });
    }
    if (mode === 1) {
      return classifyChoice(r, {
        gen: this.id, seed, d, topicId: this.topicId, item: r.pick(INV_BANK), labels: ["basica", "aplicada"], names: INV_NAMES,
        prompt: (t) => `¿Qué tipo de investigación es?\n\n«${t}»`,
        hints: ["¿Busca entender algo o resolver un problema práctico concreto?", "La básica amplía el conocimiento sin una aplicación inmediata.", "La aplicada usa conocimiento previo para un fin práctico."],
        explanation: "La ciencia básica busca conocimiento; la aplicada lo usa para resolver problemas prácticos.",
      });
    }
    if (mode === 2) {
      const ex: OrderExercise = {
        ...base({ gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId, prompt: "Según el **modelo lineal** (Vannevar Bush, *Ciencia, la frontera sin fin*, 1945), ordená cómo se pasaría de la investigación al bienestar.", hints: ["El modelo justifica financiar primero la investigación sin fines prácticos.", "De lo básico se pasa a lo aplicado.", "Lo último es el beneficio para la sociedad."], solution: LINEAL, explanation: "El modelo lineal supone que la ciencia básica lleva a la aplicada, luego a la tecnología y finalmente al bienestar; por eso recomienda financiar prioritariamente la básica." }),
        kind: "order",
        items: rng(seed + 3).shuffle(LINEAL),
        answer: LINEAL,
      };
      return ex;
    }
    // Medida absoluta vs relativa: inversión en I+D como % del PBI (calculado).
    let a: { inv: number; pbi: number };
    let b: { inv: number; pbi: number };
    let pa: number;
    let pb: number;
    let guard = 0;
    do {
      a = { inv: r.int(2, 30) * 100, pbi: r.int(5, 60) * 10000 };
      b = { inv: r.int(2, 30) * 100, pbi: r.int(5, 60) * 10000 };
      pa = (100 * a.inv) / a.pbi;
      pb = (100 * b.inv) / b.pbi;
      guard++;
      // Interesante: el que invierte más en términos absolutos invierte menos en términos relativos.
    } while (guard < 200 && (Math.abs(pa - pb) < 0.2 || pa > 5 || pb > 5 || pa < 0.1 || pb < 0.1 || (d >= 4 && (a.inv > b.inv) === (pa > pb)) || a.inv === b.inv));
    const fmtN = (n: number) => n.toLocaleString("es-AR");
    const fmtP = (n: number) => (Math.round(n * 100) / 100).toString().replace(".", ",");
    const relA = pa > pb;
    const absA = a.inv > b.inv;
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `El país A invierte ${fmtN(a.inv)} millones en I+D y tiene un PBI de ${fmtN(a.pbi)} millones. El país B invierte ${fmtN(b.inv)} millones con un PBI de ${fmtN(b.pbi)} millones. ¿Qué afirmación es correcta?`,
        hints: ["Medida absoluta: el dinero total invertido. Medida relativa: el porcentaje del PBI.", "Porcentaje del PBI = inversión / PBI × 100.", `A: ${fmtN(a.inv)} / ${fmtN(a.pbi)} × 100. B: ${fmtN(b.inv)} / ${fmtN(b.pbi)} × 100.`],
        solution: [`A: ${fmtN(a.inv)} / ${fmtN(a.pbi)} × 100 ≈ ${fmtP(pa)}% del PBI.`, `B: ${fmtN(b.inv)} / ${fmtN(b.pbi)} × 100 ≈ ${fmtP(pb)}% del PBI.`, `En términos relativos invierte más ${relA ? "A" : "B"}; en términos absolutos, ${absA ? "A" : "B"}.`],
        explanation: "La medida relativa (porcentaje del PBI) permite comparar el esfuerzo de países de distinto tamaño; la absoluta solo mira el monto total.",
      }),
      ([
        { text: `${relA ? "A" : "B"} invierte relativamente más (${fmtP(relA ? pa : pb)}% del PBI contra ${fmtP(relA ? pb : pa)}%).`, correct: true },
        { text: `${relA ? "B" : "A"} invierte relativamente más (${fmtP(relA ? pb : pa)}% del PBI contra ${fmtP(relA ? pa : pb)}%).`, error: { type: "calculo", message: `Revisá la cuenta: A invierte ${fmtP(pa)}% y B ${fmtP(pb)}% de su PBI.` } },
        { text: `${absA ? "A" : "B"} invierte relativamente más, porque invierte más dinero.`, correct: false, error: absA === relA ? undefined : { type: "interpretacion", message: "Invertir más dinero (medida absoluta) no implica invertir más en proporción al PBI (medida relativa)." } },
        { text: "Invierten relativamente lo mismo.", error: { type: "calculo", message: `No: A invierte ${fmtP(pa)}% y B ${fmtP(pb)}% de su PBI.` } },
      ] as Option[]).filter((o) => o.correct || o.error),
    );
  },
};

const U4: Generator[] = [ipcEticaCiencia, ipcPoliticasCientificas];




export const IPC_GENERATORS: Generator[] = [...U1, ...U2, ...U3, ...U4];

