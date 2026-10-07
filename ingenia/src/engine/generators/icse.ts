/**
 * Generadores de Introducción al Conocimiento de la Sociedad y el Estado
 * (ICSE, CBC-UBA). Ejes de los contenidos mínimos del programa analítico:
 * Sociedad (icse-1), Estado (icse-2) y Estado y desarrollo socioeconómico
 * (icse-3).
 *
 * Ejercicios conceptuales: clasificar casos, relacionar conceptos con
 * definiciones y ordenar líneas de tiempo. Los pocos ejercicios con números
 * (líneas de pobreza, brecha de ingresos, balotaje) CALCULAN la respuesta.
 * Los montos son ficticios. Las fechas usadas son hechos ampliamente
 * documentados; no se atribuyen posiciones a la cátedra.
 */
import type { Difficulty, ErrorType, Generator, MatchExercise, NumericExercise, OrderExercise } from "../types";
import { rng, type Rng } from "./rng";
import { base, byDifficulty, choice, type Option } from "./helpers";

const S = "icse";

// ───────────────────────── Utilidades ─────────────────────────

/** Copia del rng que no mezcla (para opciones con orden fijo, como V/F). */
const fixed = (r: Rng): Rng => ({ ...r, shuffle: <T,>(a: T[]) => [...a] });
const sample = <T,>(r: Rng, arr: readonly T[], n: number): T[] => r.shuffle([...arr]).slice(0, n);
/** Miles con punto, al estilo argentino. */
const miles = (n: number): string => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
/** Número con coma decimal. */
const dec = (n: number, d = 1): string => n.toFixed(d).replace(".", ",");

type Hints = [string, string, string];

// ───────────────────────── Fábricas ─────────────────────────

interface Item<L extends string> {
  text: string;
  label: L;
  why: string;
  /** 1 = definición directa, 2 = caso, 3 = caso con matices. */
  lvl: 1 | 2 | 3;
}

interface ClassifyCfg<L extends string> {
  id: string;
  topicId: string;
  description: string;
  labels: Record<L, { name: string; def: string }>;
  bank: Item<L>[];
  ask: string;
  /** Pregunta para el modo inverso: «¿Cuál de estos casos es {name}?». */
  inverseAsk?: (name: string) => string;
  hints: Hints;
  explanation: string;
}

/** Clasificar un caso o una definición en una de varias categorías. */
function classifyGen<L extends string>(cfg: ClassifyCfg<L>): Generator {
  const keys = Object.keys(cfg.labels) as L[];
  return {
    id: cfg.id,
    topicId: cfg.topicId,
    description: cfg.description,
    generate(seed, d) {
      const r = rng(seed);
      const target = d <= 2 ? 1 : d <= 4 ? 2 : 3;
      let pool = cfg.bank.filter((i) => i.lvl === target);
      if (pool.length === 0) pool = cfg.bank.filter((i) => i.lvl <= target);
      const nOpts = Math.min(keys.length, byDifficulty(d, [3, 3, 4, 4, 5, 5]));
      // Modo inverso: dada la categoría, elegir el caso que le corresponde.
      if (cfg.inverseAsk && d >= 5 && r.bool()) {
        const item = r.pick(cfg.bank.filter((i) => i.lvl >= 2));
        const others = keys.filter((k) => k !== item.label);
        const distract = sample(r, others, Math.min(3, others.length)).map((k) => r.pick(cfg.bank.filter((i) => i.label === k)));
        return choice(
          r,
          base({
            gen: cfg.id, seed, difficulty: d, subjectId: S, topicId: cfg.topicId,
            prompt: cfg.inverseAsk(cfg.labels[item.label].name),
            hints: cfg.hints,
            solution: [`«${item.text}» → ${cfg.labels[item.label].name}: ${item.why}`, `${cfg.labels[item.label].name}: ${cfg.labels[item.label].def}.`],
            explanation: cfg.explanation,
          }),
          [
            { text: item.text, correct: true },
            ...distract.map((o) => ({ text: o.text, error: { type: "conceptual" as ErrorType, message: `Ese caso corresponde a «${cfg.labels[o.label].name}»: ${o.why}` } })),
          ],
        );
      }
      const item = r.pick(pool);
      const others = sample(r, keys.filter((k) => k !== item.label), nOpts - 1);
      return choice(
        r,
        base({
          gen: cfg.id, seed, difficulty: d, subjectId: S, topicId: cfg.topicId,
          prompt: `${cfg.ask}\n\n«${item.text}»`,
          hints: cfg.hints,
          solution: [`Corresponde a ${cfg.labels[item.label].name}: ${item.why}`, `${cfg.labels[item.label].name}: ${cfg.labels[item.label].def}.`],
          explanation: cfg.explanation,
        }),
        [
          { text: cfg.labels[item.label].name, correct: true },
          ...others.map((o) => ({
            text: cfg.labels[o].name,
            error: { type: "conceptual" as ErrorType, message: `No es «${cfg.labels[o].name}» (${cfg.labels[o].def}). ${item.why.charAt(0).toUpperCase()}${item.why.slice(1)}` },
          })),
        ],
      );
    },
  };
}

interface VF {
  text: string;
  value: boolean;
  why: string;
}

function vfChoice(r: Rng, a: { gen: string; seed: number; d: Difficulty; topicId: string; st: VF; hints: Hints; explanation: string }) {
  const { st } = a;
  return choice(
    fixed(r),
    base({ gen: a.gen, seed: a.seed, difficulty: a.d, subjectId: S, topicId: a.topicId, prompt: `¿Verdadero o falso?\n\n«${st.text}»`, hints: a.hints, solution: [`${st.value ? "Verdadero" : "Falso"}: ${st.why}`], explanation: a.explanation }),
    [
      { text: "Verdadero", correct: st.value, error: st.value ? undefined : { type: "conceptual", message: `Es falso: ${st.why}` } },
      { text: "Falso", correct: !st.value, error: !st.value ? undefined : { type: "conceptual", message: `Es verdadero: ${st.why}` } },
    ],
  );
}

/** Relacionar: n pares de un banco (lados derechos únicos). */
function matchFrom(r: Rng, a: { gen: string; seed: number; d: Difficulty; topicId: string; bank: [string, string][]; prompt: string; hints: Hints; explanation: string }): MatchExercise {
  const n = Math.min(a.bank.length, byDifficulty(a.d, [3, 3, 4, 4, 5, 6]));
  const pairs = sample(r, a.bank, n);
  return {
    ...base({ gen: a.gen, seed: a.seed, difficulty: a.d, subjectId: S, topicId: a.topicId, prompt: a.prompt, hints: a.hints, solution: pairs.map(([x, y]) => `${x} → ${y}`), explanation: a.explanation }),
    kind: "match",
    pairs,
  };
}

interface Ev {
  text: string;
  year: number;
  /** Año como se muestra (p. ej. "c. 1880" o "1865–1870"). */
  shown?: string;
}

/** Ordenar cronológicamente n hechos con años distintos. */
function orderFrom(r: Rng, a: { gen: string; seed: number; d: Difficulty; topicId: string; bank: Ev[]; prompt: string; hints: Hints; explanation: string; n?: number }): OrderExercise {
  const n = a.n ?? byDifficulty(a.d, [3, 4, 4, 5, 5, 6]);
  const picked: Ev[] = [];
  for (const e of r.shuffle([...a.bank])) {
    if (picked.length >= n) break;
    // Años bien separados en los niveles bajos; más cercanos en los altos.
    const gap = a.d <= 2 ? 3 : 1;
    if (picked.every((p) => Math.abs(p.year - e.year) >= gap)) picked.push(e);
  }
  const sorted = [...picked].sort((x, y) => x.year - y.year);
  const answer = sorted.map((e) => e.text);
  let items = r.shuffle([...answer]);
  if (items.every((t, i) => t === answer[i])) items = [...answer].reverse();
  return {
    ...base({ gen: a.gen, seed: a.seed, difficulty: a.d, subjectId: S, topicId: a.topicId, prompt: a.prompt, hints: a.hints, solution: sorted.map((e) => `${e.shown ?? e.year}: ${e.text}`), explanation: a.explanation }),
    kind: "order",
    items,
    answer,
  };
}

// ═══════════════════════ icse-1 · Sociedad ═══════════════════════

type Soc = "socializacion" | "institucion" | "rol" | "estatus" | "norma" | "valor" | "grupo";
const SOC_LABELS: Record<Soc, { name: string; def: string }> = {
  socializacion: { name: "Socialización", def: "el proceso por el que las personas incorporan las normas, valores y pautas de su sociedad" },
  institucion: { name: "Institución social", def: "una pauta estable y organizada que regula un aspecto de la vida social, como la familia o la escuela" },
  rol: { name: "Rol", def: "el conjunto de conductas que se esperan de quien ocupa una posición" },
  estatus: { name: "Estatus", def: "la posición que ocupa una persona en la estructura social, adscripta o adquirida" },
  norma: { name: "Norma social", def: "una regla que prescribe o prohíbe conductas y se respalda con sanciones" },
  valor: { name: "Valor", def: "una idea compartida sobre lo que es deseable o valioso" },
  grupo: { name: "Grupo social", def: "un conjunto de personas que interactúan y comparten un sentido de pertenencia" },
};
const SOC_BANK: Item<Soc>[] = [
  { lvl: 1, label: "socializacion", text: "Proceso por el que una persona aprende las pautas de comportamiento de su sociedad.", why: "es la definición de socialización: se aprende a ser parte de una sociedad." },
  { lvl: 1, label: "institucion", text: "Forma organizada y duradera de regular un área de la vida social, que persiste aunque cambien sus integrantes.", why: "eso define a una institución: es estable y trasciende a las personas concretas." },
  { lvl: 1, label: "rol", text: "Comportamiento que los demás esperan de quien ocupa una determinada posición.", why: "las expectativas de conducta asociadas a una posición son el rol." },
  { lvl: 1, label: "estatus", text: "Lugar que ocupa una persona dentro de la estructura social.", why: "la posición en sí es el estatus; lo que se espera de ella es el rol." },
  { lvl: 1, label: "norma", text: "Regla compartida que indica qué conductas son esperables y cuáles se sancionan.", why: "una regla de conducta con sanciones es una norma." },
  { lvl: 1, label: "valor", text: "Criterio compartido sobre lo que una sociedad considera deseable.", why: "lo deseable en general (no una regla concreta) es un valor." },
  { lvl: 1, label: "grupo", text: "Conjunto de personas que interactúan con cierta regularidad y se reconocen como parte de algo común.", why: "interacción más pertenencia definen a un grupo social." },
  { lvl: 2, label: "socializacion", text: "En el jardín, una nena aprende a esperar su turno y a compartir los juguetes.", why: "está incorporando pautas de convivencia: es socialización (primaria y secundaria se combinan en la infancia)." },
  { lvl: 2, label: "rol", text: "Se espera que una médica guarde el secreto sobre lo que le cuentan sus pacientes.", why: "es una expectativa de conducta ligada a la posición de médica: un rol." },
  { lvl: 2, label: "estatus", text: "Lucía se recibió de ingeniera y en su barrio pasó a ser «la ingeniera».", why: "describe la posición alcanzada (un estatus adquirido), no una conducta esperada." },
  { lvl: 2, label: "norma", text: "Quien se cuela en la fila del colectivo recibe reproches de los demás pasajeros.", why: "hay una regla compartida (respetar la fila) y una sanción informal (los reproches): es una norma." },
  { lvl: 2, label: "institucion", text: "La escuela sigue funcionando con su organización aunque cada año cambien alumnos y docentes.", why: "una estructura que persiste más allá de sus integrantes es una institución." },
  { lvl: 2, label: "valor", text: "En una encuesta, la mayoría considera que la solidaridad es algo importante.", why: "se habla de algo deseable en general, no de una regla concreta: es un valor." },
  { lvl: 2, label: "grupo", text: "Doce vecinos que juegan al fútbol todos los sábados y tienen su propio grupo de mensajes.", why: "interactúan con regularidad y se sienten parte de algo común: un grupo social." },
  { lvl: 3, label: "estatus", text: "En el siglo XVII, nacer en una familia noble daba una posición privilegiada de por vida.", why: "es una posición dada por nacimiento: un estatus adscripto." },
  { lvl: 3, label: "socializacion", text: "Un empleado nuevo aprende las costumbres no escritas de su oficina en sus primeras semanas.", why: "es socialización secundaria: se incorporan pautas de un ámbito específico en la vida adulta." },
  { lvl: 3, label: "norma", text: "Una ley prohíbe fumar en lugares cerrados y prevé multas para quien lo haga.", why: "una regla formal con sanción establecida es una norma (en este caso, jurídica)." },
  { lvl: 3, label: "rol", text: "Como presidente del club, Marta debe convocar a asamblea una vez por año.", why: "es una obligación esperada por ocupar un cargo: forma parte del rol." },
];

const genConceptoSocial = classifyGen({
  id: "icse-concepto-social",
  topicId: "t-icse-sociedad",
  description: "Clasificar definiciones y casos en conceptos sociológicos básicos",
  labels: SOC_LABELS,
  bank: SOC_BANK,
  ask: "¿Qué concepto sociológico describe mejor esto?",
  inverseAsk: (n) => `¿Cuál de estos casos ilustra mejor el concepto de **${n.toLowerCase()}**?`,
  hints: [
    "Preguntate si se habla de una posición, de una conducta esperada, de una regla o de un proceso.",
    "Posición = estatus; lo que se espera de esa posición = rol. Regla con sanción = norma; lo deseable en general = valor.",
    "Socialización es un proceso de aprendizaje; institución es una estructura estable que persiste.",
  ],
  explanation: "Los conceptos básicos permiten describir cualquier sociedad: posiciones (estatus), expectativas (roles), reglas (normas), ideales (valores), estructuras estables (instituciones) y el proceso por el que todo eso se aprende (socialización).",
});

const genConceptosMatch: Generator = {
  id: "icse-conceptos-match",
  topicId: "t-icse-sociedad",
  description: "Relacionar conceptos sociológicos básicos con su definición",
  generate(seed, d) {
    const r = rng(seed);
    const bank = (Object.keys(SOC_LABELS) as Soc[]).map((k) => [SOC_LABELS[k].name, SOC_LABELS[k].def.charAt(0).toUpperCase() + SOC_LABELS[k].def.slice(1)] as [string, string]);
    return matchFrom(r, {
      gen: this.id, seed, d, topicId: this.topicId, bank,
      prompt: "Relacioná cada concepto con su definición.",
      hints: ["Empezá por los que te resulten más seguros.", "Rol y estatus van juntos pero no son lo mismo: uno es la posición, el otro lo que se espera de ella.", "Norma = regla con sanción; valor = lo deseable en general."],
      explanation: "Estos conceptos son las herramientas básicas para describir cualquier sociedad.",
    });
  },
};

// ── Estratificación ──
type Estr = "casta" | "estamento" | "clase";
const ESTR_LABELS: Record<Estr, { name: string; def: string }> = {
  casta: { name: "Casta", def: "posición fijada por nacimiento, con matrimonio dentro del grupo y justificación religiosa; movilidad prácticamente nula" },
  estamento: { name: "Estamento", def: "grupos con derechos y obligaciones distintos fijados por la ley o la costumbre, como en el Antiguo Régimen europeo; movilidad muy limitada" },
  clase: { name: "Clase social", def: "posición basada en lo económico (propiedad, ingresos, ocupación) con igualdad jurídica formal; la movilidad es posible" },
};
const ESTR_BANK: Item<Estr>[] = [
  { lvl: 1, label: "casta", text: "Sistema cerrado: se pertenece al grupo por nacimiento, se debe casar dentro de él y el orden se justifica en creencias religiosas.", why: "nacimiento, endogamia y legitimación religiosa son rasgos de la casta." },
  { lvl: 1, label: "estamento", text: "Sistema en el que nobleza, clero y plebeyos tienen privilegios y obligaciones distintos reconocidos jurídicamente.", why: "la desigualdad reconocida por la ley entre órdenes es propia de los estamentos." },
  { lvl: 1, label: "clase", text: "Sistema abierto en el que todos son iguales ante la ley y la posición depende sobre todo de factores económicos.", why: "igualdad jurídica y desigualdad económica caracterizan al sistema de clases." },
  { lvl: 2, label: "casta", text: "En el sistema tradicional de la India, el oficio y el matrimonio dependían del grupo en que se nacía.", why: "es el ejemplo clásico de sistema de castas." },
  { lvl: 2, label: "estamento", text: "En la Francia anterior a 1789, la nobleza no pagaba ciertos impuestos que sí pagaba el tercer estado.", why: "privilegios distintos fijados por la ley: sociedad estamental." },
  { lvl: 2, label: "clase", text: "En una ciudad actual, una obrera y un empresario votan igual, pero sus ingresos y su propiedad son muy distintos.", why: "igualdad legal con desigualdad económica: sistema de clases." },
  { lvl: 3, label: "clase", text: "Una hija de trabajadores rurales llega a ser gerente de un banco sin que ninguna ley se lo impida.", why: "la movilidad social (aunque desigualmente distribuida) es posible en un sistema de clases." },
  { lvl: 3, label: "estamento", text: "Un comerciante enriquecido compra un título de nobleza porque su riqueza sola no le daba los privilegios de la nobleza.", why: "la riqueza no alcanzaba: la posición dependía del orden jurídico, como en los estamentos." },
  { lvl: 3, label: "casta", text: "Un joven no puede cambiar de oficio ni casarse con alguien de otro grupo, aunque gane mucho dinero, porque así lo establece la tradición religiosa.", why: "la riqueza no altera la posición, fijada por nacimiento y religión: casta." },
];
const genEstratificacion = classifyGen({
  id: "icse-estratificacion",
  topicId: "t-icse-estratificacion",
  description: "Reconocer sistemas de estratificación: casta, estamento, clase",
  labels: ESTR_LABELS,
  bank: ESTR_BANK,
  ask: "¿Qué sistema de estratificación describe esto?",
  inverseAsk: (n) => `¿Cuál de estas situaciones corresponde a un sistema de **${n.toLowerCase()}**?`,
  hints: [
    "Fijate qué define la posición: el nacimiento, la ley o lo económico.",
    "Si hay privilegios reconocidos por ley, pensá en estamentos; si hay religión y endogamia, en castas.",
    "En las clases todos son iguales ante la ley: la desigualdad es económica y la movilidad es posible.",
  ],
  explanation: "La estratificación es la forma en que una sociedad distribuye desigualmente recursos, prestigio y poder entre grupos jerarquizados. Casta, estamento y clase se distinguen por qué tan cerrado es el sistema y qué fundamenta la posición.",
});

// ── Movilidad social (caso armado y clasificado por cálculo) ──
interface Job {
  name: string;
  lvl: 1 | 2 | 3;
}
const JOBS: Job[] = [
  { name: "peón rural", lvl: 1 },
  { name: "empleada de limpieza", lvl: 1 },
  { name: "repartidor", lvl: 1 },
  { name: "empleado administrativo", lvl: 2 },
  { name: "docente", lvl: 2 },
  { name: "técnica electricista", lvl: 2 },
  { name: "gerente de una empresa", lvl: 3 },
  { name: "médica con consultorio propio", lvl: 3 },
  { name: "dueño de una empresa mediana", lvl: 3 },
];
const LVL_TXT = ["", "ingresos bajos", "ingresos medios", "ingresos altos"];
const NAMES = ["Sofía", "Martín", "Camila", "Joaquín", "Valentina", "Tomás", "Lucía", "Mateo"];

const genMovilidad: Generator = {
  id: "icse-movilidad",
  topicId: "t-icse-estratificacion",
  description: "Clasificar casos de movilidad social (inter/intrageneracional, ascendente/descendente/horizontal)",
  generate(seed, d) {
    const r = rng(seed);
    const allowH = d >= 3;
    const dir = r.pick(allowH ? (["asc", "desc", "hor"] as const) : (["asc", "desc"] as const));
    const inter = r.bool();
    let a: Job, b: Job;
    do {
      a = r.pick(JOBS);
      b = r.pick(JOBS);
    } while (a.name === b.name || (dir === "asc" ? b.lvl <= a.lvl : dir === "desc" ? b.lvl >= a.lvl : b.lvl !== a.lvl));
    const who = r.pick(NAMES);
    const showLvl = d <= 4; // en los niveles altos hay que inferir el nivel de la ocupación
    const ja = showLvl ? `${a.name} (${LVL_TXT[a.lvl]})` : a.name;
    const jb = showLvl ? `${b.name} (${LVL_TXT[b.lvl]})` : b.name;
    const story = inter
      ? `${who} creció en un hogar donde el principal sostén trabajaba como ${ja}. Hoy ${who} trabaja como ${jb}.`
      : `${who} empezó su vida laboral como ${ja}. Veinte años después trabaja como ${jb}.`;
    const dirName = { asc: "ascendente", desc: "descendente", hor: "horizontal" } as const;
    const genName = inter ? "intergeneracional" : "intrageneracional";
    const opts: Option[] = [];
    for (const g of ["intergeneracional", "intrageneracional"] as const) {
      for (const dd of (allowH ? ["asc", "desc", "hor"] : ["asc", "desc"]) as ("asc" | "desc" | "hor")[]) {
        const text = `Movilidad ${g} ${dirName[dd]}`;
        if (g === genName && dd === dir) opts.push({ text, correct: true });
        else {
          const errs: string[] = [];
          if (g !== genName) errs.push(inter ? "se compara la posición de una persona con la del hogar en que creció: eso es intergeneracional" : "se compara la misma persona en dos momentos de su vida: eso es intrageneracional");
          if (dd !== dir) errs.push(dir === "hor" ? "el cambio es de ocupación pero dentro del mismo nivel: es horizontal" : `la posición ${dir === "asc" ? "mejora" : "empeora"}: es ${dirName[dir]}`);
          opts.push({ text, error: { type: "conceptual", message: `No: ${errs.join("; y ")}.` } });
        }
      }
    }
    const kept = [opts.find((o) => o.correct)!, ...sample(r, opts.filter((o) => !o.correct), byDifficulty(d, [3, 3, 3, 4, 5, 5]))];
    return choice(
      r,
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `${story}\n\n¿Qué tipo de movilidad social muestra el caso?`,
        hints: [
          "Primero: ¿se compara a la persona con su hogar de origen o consigo misma en otro momento?",
          "Después: ¿la nueva posición es más alta, más baja o del mismo nivel?",
          "Inter = entre generaciones; intra = dentro de una vida. Vertical (ascendente/descendente) cambia de nivel; horizontal, no.",
        ],
        solution: [
          inter ? "Se compara con el hogar de origen → intergeneracional." : "Se compara la misma persona en dos momentos → intrageneracional.",
          `De ${a.name} (${LVL_TXT[a.lvl]}) a ${b.name} (${LVL_TXT[b.lvl]}) → ${dirName[dir]}.`,
        ],
        explanation: "La movilidad social es el desplazamiento de personas o grupos entre posiciones de la estructura social. Se clasifica según el período comparado (inter o intrageneracional) y la dirección (vertical ascendente/descendente u horizontal).",
      }),
      kept,
    );
  },
};

// ── Orden, cooperación y conflicto ──
type Persp = "consenso" | "conflicto";
const PERSP_LABELS: Record<Persp, { name: string; def: string }> = {
  consenso: { name: "Perspectiva del consenso (funcionalista)", def: "ve el orden social como resultado de valores compartidos y de la integración de las partes" },
  conflicto: { name: "Perspectiva del conflicto", def: "ve el orden como resultado de relaciones de poder entre grupos con intereses opuestos" },
};
const PERSP_BANK: Item<Persp>[] = [
  { lvl: 1, label: "consenso", text: "La sociedad funciona como un organismo: cada institución cumple una función que contribuye a la estabilidad del conjunto.", why: "la analogía con un organismo y la idea de función son centrales en el funcionalismo." },
  { lvl: 1, label: "conflicto", text: "El orden social expresa el predominio de unos grupos sobre otros, y el cambio surge de la lucha entre ellos.", why: "dominación y lucha como motor del cambio son ideas de la perspectiva del conflicto." },
  { lvl: 1, label: "consenso", text: "Lo que mantiene unida a una sociedad son las normas y valores que la mayoría comparte.", why: "poner el acento en los valores compartidos es propio de la perspectiva del consenso." },
  { lvl: 1, label: "conflicto", text: "Las desigualdades no son accidentales: benefician a quienes controlan los recursos.", why: "explicar la desigualdad por intereses de grupos dominantes es propio del conflicto." },
  { lvl: 2, label: "consenso", text: "Una huelga muy prolongada se analiza como una disfunción que el sistema tiende a corregir para recuperar el equilibrio.", why: "el conflicto aparece como desajuste transitorio de un sistema que tiende al equilibrio: mirada funcionalista." },
  { lvl: 2, label: "conflicto", text: "La escuela no solo transmite saberes: también reproduce las ventajas de las familias con más recursos.", why: "mostrar cómo una institución reproduce desigualdades es típico de la perspectiva del conflicto." },
  { lvl: 2, label: "consenso", text: "La educación prepara a cada persona para ocupar un lugar útil en la división del trabajo.", why: "destaca la función integradora de la educación: perspectiva del consenso." },
  { lvl: 2, label: "conflicto", text: "Las leyes laborales fueron conquistas logradas a través de huelgas y organización sindical.", why: "los derechos aparecen como resultado de la lucha entre grupos: perspectiva del conflicto." },
  { lvl: 3, label: "consenso", text: "Ante una crisis, la cooperación entre sindicatos, empresas y Estado restablece la cohesión social.", why: "el énfasis en la cooperación y la cohesión es propio de la perspectiva del consenso." },
  { lvl: 3, label: "conflicto", text: "Cuando un grupo logra que sus intereses particulares se presenten como «interés general», su dominio se vuelve más estable.", why: "el consenso mismo se interpreta como resultado de la dominación: perspectiva del conflicto." },
];
const PERSP_VF: VF[] = [
  { text: "La perspectiva del consenso sostiene que en la sociedad no existen conflictos.", value: false, why: "los reconoce, pero los interpreta como disfunciones o desajustes que el sistema tiende a corregir." },
  { text: "La perspectiva del conflicto considera que el cambio social surge de la lucha entre grupos con intereses opuestos.", value: true, why: "el conflicto es, para esta mirada, el motor del cambio." },
  { text: "Para la perspectiva del consenso, los valores compartidos son la base del orden social.", value: true, why: "la integración normativa es lo que explica el orden en esta perspectiva." },
  { text: "La perspectiva del conflicto niega que exista cualquier forma de cooperación en la sociedad.", value: false, why: "admite la cooperación, pero la analiza dentro de relaciones de poder desiguales." },
  { text: "Orden y conflicto pueden coexistir: una sociedad estable puede contener conflictos institucionalizados.", value: true, why: "por ejemplo, la negociación colectiva canaliza un conflicto dentro de reglas aceptadas." },
];
const perspClassify = classifyGen({
  id: "icse-orden-conflicto",
  topicId: "t-icse-orden-conflicto",
  description: "Distinguir las perspectivas del consenso y del conflicto",
  labels: PERSP_LABELS,
  bank: PERSP_BANK,
  ask: "¿Desde qué perspectiva se formula esta afirmación?",
  hints: [
    "Buscá la palabra clave: ¿valores compartidos, función, equilibrio… o poder, intereses, lucha?",
    "El consenso explica el orden por la integración; el conflicto, por la dominación.",
    "Las dos perspectivas hablan de orden y de conflicto: lo que cambia es cuál consideran básico.",
  ],
  explanation: "Como referencia general, la sociología clásica ofrece dos grandes miradas sobre el orden: una lo explica por el consenso en torno a valores (tradición asociada a Durkheim y al funcionalismo) y otra por el conflicto de intereses (tradición asociada a Marx). Ninguna es «la correcta»: iluminan aspectos distintos.",
});
const genOrdenConflicto: Generator = {
  ...perspClassify,
  generate(seed, d) {
    if (d >= 3 && seed % 3 === 0) {
      const r = rng(seed);
      return vfChoice(r, {
        gen: this.id, seed, d, topicId: this.topicId, st: PERSP_VF[(seed + d) % PERSP_VF.length],
        hints: ["Desconfiá de las afirmaciones absolutas («no existen», «niega cualquier»).", "Ambas perspectivas reconocen orden y conflicto; difieren en cuál es lo básico.", "Consenso: el conflicto es disfunción. Conflicto: el conflicto es motor del cambio."],
        explanation: "Las perspectivas del consenso y del conflicto difieren en el énfasis, no en negar por completo el otro fenómeno.",
      });
    }
    return perspClassify.generate(seed, d);
  },
};

// ── Actores sociopolíticos ──
type Actor = "partido" | "sindicato" | "interes" | "movimiento" | "osc";
const ACTOR_LABELS: Record<Actor, { name: string; def: string }> = {
  partido: { name: "Partido político", def: "organización que compite en elecciones para acceder al gobierno" },
  sindicato: { name: "Sindicato", def: "organización que representa a trabajadores ante empleadores y el Estado" },
  interes: { name: "Grupo de interés o de presión", def: "organización que busca influir en decisiones públicas a favor de un sector, sin aspirar a gobernar" },
  movimiento: { name: "Movimiento social", def: "acción colectiva sostenida, poco institucionalizada, en torno a una demanda o identidad compartida" },
  osc: { name: "Organización de la sociedad civil (ONG)", def: "asociación sin fines de lucro que presta servicios o promueve una causa" },
};
const ACTOR_BANK: Item<Actor>[] = [
  { lvl: 1, label: "partido", text: "Organización que presenta candidatos en las elecciones con el objetivo de gobernar.", why: "competir electoralmente por el gobierno es lo que define a un partido." },
  { lvl: 1, label: "sindicato", text: "Organización que negocia salarios y condiciones de trabajo en nombre de los trabajadores de una actividad.", why: "la representación de trabajadores y la negociación colectiva definen al sindicato." },
  { lvl: 1, label: "interes", text: "Cámara que agrupa a empresas de un sector y gestiona ante el gobierno medidas favorables para ellas.", why: "busca influir sin presentar candidatos: es un grupo de interés." },
  { lvl: 1, label: "movimiento", text: "Conjunto amplio de personas y agrupaciones que se movilizan durante años por una misma demanda, sin una estructura formal única.", why: "acción colectiva sostenida y poco institucionalizada: movimiento social." },
  { lvl: 1, label: "osc", text: "Asociación sin fines de lucro que gestiona un comedor comunitario y apoyo escolar en un barrio.", why: "presta un servicio a la comunidad sin fines de lucro: organización de la sociedad civil." },
  { lvl: 2, label: "partido", text: "Una agrupación junta avales, se inscribe ante la justicia electoral y arma listas de diputados.", why: "inscribirse y presentar listas es la actividad propia de un partido." },
  { lvl: 2, label: "sindicato", text: "Una organización convoca a un paro de la actividad tras fracasar la paritaria.", why: "la paritaria y el paro son herramientas sindicales." },
  { lvl: 2, label: "interes", text: "Una federación de productores agropecuarios se reúne con legisladores para pedir cambios en un impuesto.", why: "presiona por un interés sectorial sin buscar gobernar: grupo de interés." },
  { lvl: 2, label: "movimiento", text: "Miles de personas de distintas organizaciones marchan cada año por una misma causa de derechos, con consignas compartidas.", why: "redes diversas movilizadas por una causa común forman un movimiento social." },
  { lvl: 2, label: "osc", text: "Una fundación capacita a voluntarios y publica informes sobre acceso al agua potable.", why: "una fundación sin fines de lucro que promueve una causa es una OSC." },
  { lvl: 3, label: "interes", text: "Una asociación de bancos financia estudios y hace declaraciones públicas contra un proyecto de ley que regula tasas.", why: "influye en la decisión sin competir por cargos: es un grupo de presión." },
  { lvl: 3, label: "movimiento", text: "Trabajadores desocupados organizan cortes de ruta para reclamar empleo y asistencia, coordinándose en asambleas barriales.", why: "acción colectiva con repertorio de protesta y organización de base: movimiento social." },
  { lvl: 3, label: "partido", text: "Una fuerza nacida de un movimiento de protesta decide presentarse a elecciones para disputar bancas.", why: "al competir por cargos electivos pasa a funcionar como partido político." },
];
const genActores = classifyGen({
  id: "icse-actores",
  topicId: "t-icse-actores",
  description: "Reconocer actores sociopolíticos y sus organizaciones",
  labels: ACTOR_LABELS,
  bank: ACTOR_BANK,
  ask: "¿Qué tipo de actor sociopolítico aparece en esta situación?",
  inverseAsk: (n) => `¿Cuál de estas situaciones muestra a un actor del tipo **${n.toLowerCase()}**?`,
  hints: [
    "Preguntate qué busca el actor: ¿gobernar, negociar por trabajadores, influir para un sector, movilizar por una causa o prestar un servicio?",
    "Solo los partidos compiten en elecciones para ocupar cargos.",
    "Grupo de interés: presiona sin gobernar. Movimiento social: acción colectiva sostenida y poco formal.",
  ],
  explanation: "Los actores sociopolíticos son sujetos colectivos que intervienen en la vida pública. Se distinguen por su objetivo (gobernar, representar, influir, movilizar) y por su grado de institucionalización.",
});

const PROTESTA: [string, string][] = [
  ["Huelga", "Abstención colectiva del trabajo para presionar por una demanda"],
  ["Piquete", "Bloqueo de una calle o ruta para visibilizar un reclamo"],
  ["Cacerolazo", "Protesta en la que se golpean cacerolas en la vía pública"],
  ["Toma", "Ocupación de un establecimiento (fábrica, escuela) por quienes reclaman"],
  ["Petitorio", "Reclamo escrito con firmas, presentado ante una autoridad"],
  ["Movilización", "Marcha masiva hacia un lugar simbólico o una sede de gobierno"],
];
const ACTOR_PAIRS: [string, string][] = (Object.keys(ACTOR_LABELS) as Actor[]).map((k) => [ACTOR_LABELS[k].name, ACTOR_LABELS[k].def.charAt(0).toUpperCase() + ACTOR_LABELS[k].def.slice(1)]);
const genProtestaMatch: Generator = {
  id: "icse-actores-match",
  topicId: "t-icse-actores",
  description: "Relacionar actores sociopolíticos y formas de protesta con su definición",
  generate(seed, d) {
    const r = rng(seed);
    const useProt = d >= 3 ? r.bool() : false;
    return matchFrom(r, {
      gen: this.id, seed, d, topicId: this.topicId,
      bank: useProt ? PROTESTA : ACTOR_PAIRS,
      prompt: useProt ? "Relacioná cada forma de protesta social con su descripción." : "Relacioná cada actor sociopolítico con lo que lo caracteriza.",
      hints: useProt
        ? ["Pensá en qué hace concretamente quien protesta.", "Huelga: dejar de trabajar. Toma: ocupar un lugar. Piquete: cortar el paso.", "El repertorio de protesta son las formas de acción disponibles en una época."]
        : ["Mirá el objetivo de cada organización.", "Solo uno compite en elecciones.", "Grupo de interés: influye sin gobernar; movimiento: acción colectiva poco institucionalizada."],
      explanation: useProt
        ? "La protesta social usa un «repertorio» de formas de acción que cambia históricamente; en Argentina, por ejemplo, el piquete se difundió con fuerza en los años noventa."
        : "Los actores se distinguen por su objetivo y su grado de institucionalización.",
    });
  },
};

// ── Desigualdad, pobreza y exclusión ──
const genLineaPobreza: Generator = {
  id: "icse-linea-pobreza",
  topicId: "t-icse-desigualdad",
  description: "Clasificar un hogar según las líneas de pobreza e indigencia (método del ingreso)",
  generate(seed, d) {
    const r = rng(seed);
    // Montos ficticios, redondeados a $1.000.
    const units = d <= 2 ? 1 : r.pick([2, 2.5, 3, 3.5, 4]);
    const cbaAdulto = r.int(15, 40) * 10000; // CBA por adulto equivalente
    const engel = d >= 5 ? r.pick([2.1, 2.2, 2.3, 2.4]) : 0;
    const cbtAdulto = d >= 5 ? Math.round(cbaAdulto * engel) : Math.round(cbaAdulto * r.pick([2.1, 2.2, 2.3, 2.4]));
    const CBA = Math.round(cbaAdulto * units);
    const CBT = Math.round(cbtAdulto * units);
    const cat = r.pick(["ind", "pob", "no"] as const);
    let ingreso = 0;
    if (cat === "ind") ingreso = Math.round((CBA * (0.55 + 0.35 * r.next())) / 1000) * 1000;
    else if (cat === "pob") ingreso = Math.round((CBA + (CBT - CBA) * (0.15 + 0.7 * r.next())) / 1000) * 1000;
    else ingreso = Math.round((CBT * (1.08 + 0.6 * r.next())) / 1000) * 1000;
    const real = ingreso < CBA ? "ind" : ingreso < CBT ? "pob" : "no";
    const datos =
      d <= 2
        ? `Canasta básica alimentaria (CBA) del hogar: $${miles(CBA)}. Canasta básica total (CBT) del hogar: $${miles(CBT)}.`
        : d <= 4
          ? `CBA por adulto equivalente: $${miles(cbaAdulto)}. CBT por adulto equivalente: $${miles(cbtAdulto)}. El hogar equivale a ${dec(units)} adultos equivalentes.`
          : `CBA por adulto equivalente: $${miles(cbaAdulto)}. Inversa del coeficiente de Engel: ${dec(engel)}. El hogar equivale a ${dec(units)} adultos equivalentes.`;
    const NAMES_CAT = { ind: "Indigente (bajo la línea de indigencia)", pob: "Pobre no indigente", no: "No pobre" } as const;
    const steps = [
      ...(d >= 5 ? [`CBT por adulto equivalente = CBA × inversa de Engel = $${miles(cbaAdulto)} × ${dec(engel)} = $${miles(cbtAdulto)}.`] : []),
      ...(d >= 3 ? [`Líneas del hogar: CBA = $${miles(cbaAdulto)} × ${dec(units)} = $${miles(CBA)}; CBT = $${miles(cbtAdulto)} × ${dec(units)} = $${miles(CBT)}.`] : []),
      `Ingreso $${miles(ingreso)} ${ingreso < CBA ? "<" : "≥"} CBA $${miles(CBA)}${ingreso >= CBA ? ` y ${ingreso < CBT ? "<" : "≥"} CBT $${miles(CBT)}` : ""}.`,
      `→ ${NAMES_CAT[real]}.`,
    ];
    const msg: Record<"ind" | "pob" | "no", string> = {
      ind: "Para ser indigente el ingreso tiene que ser menor que la CBA (no alcanza ni para los alimentos básicos).",
      pob: "Pobre no indigente: el ingreso cubre la CBA pero no la CBT.",
      no: "No pobre: el ingreso alcanza para cubrir la CBT completa.",
    };
    const extra = d >= 3 ? " Ojo: las canastas se multiplican por los adultos equivalentes del hogar antes de comparar." : "";
    return choice(
      fixed(r),
      base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId,
        prompt: `Un hogar tiene un ingreso mensual total de $${miles(ingreso)} (valores ficticios).\n${datos}\n\nSegún el método de la línea de pobreza, ¿cómo se clasifica el hogar?`,
        hints: [
          "Compará el ingreso del hogar con las dos canastas del hogar.",
          d >= 3 ? "Primero calculá las canastas del hogar: valor por adulto equivalente × cantidad de adultos equivalentes." : "La CBA (alimentos) marca la indigencia; la CBT (alimentos + otros bienes y servicios) marca la pobreza.",
          "Ingreso < CBA → indigente. CBA ≤ ingreso < CBT → pobre no indigente. Ingreso ≥ CBT → no pobre.",
        ],
        solution: steps,
        explanation: "El método de la línea de pobreza mide la pobreza por ingresos: compara el ingreso del hogar con el costo de una canasta básica alimentaria (indigencia) y de una canasta básica total (pobreza). Es distinto del método de necesidades básicas insatisfechas (NBI), que mira condiciones estructurales como vivienda o escolaridad.",
      }),
      (["ind", "pob", "no"] as const).map((c) => (c === real ? { text: NAMES_CAT[c], correct: true } : { text: NAMES_CAT[c], error: { type: "interpretacion" as ErrorType, message: `${msg[c]} Acá el ingreso es $${miles(ingreso)}, la CBA $${miles(CBA)} y la CBT $${miles(CBT)}.${extra}` } })),
    );
  },
};

const genBrecha: Generator = {
  id: "icse-brecha-ingresos",
  topicId: "t-icse-desigualdad",
  description: "Calcular la brecha de ingresos entre el grupo más rico y el más pobre",
  generate(seed, d): NumericExercise {
    const r = rng(seed);
    let prompt: string, answer: number, wrongInv: number, wrongDiff: number | null, sol: string[];
    if (d <= 3) {
      const low = r.int(4, 15) * 10000;
      const k = d === 1 ? r.int(5, 20) : r.int(80, 300) / 10;
      const high = Math.round((low * k) / 1000) * 1000;
      answer = Math.round((high / low) * 10) / 10;
      wrongInv = Math.round((low / high) * 100) / 100;
      wrongDiff = high - low;
      prompt = `En un país (datos ficticios), el ingreso medio mensual del 10% más rico de la población es $${miles(high)} y el del 10% más pobre es $${miles(low)}.\n\n¿Cuántas veces más gana, en promedio, el decil más rico que el más pobre? Redondeá a 1 decimal.`;
      sol = [`Brecha = ingreso medio decil 10 / ingreso medio decil 1`, `= ${miles(high)} / ${miles(low)} ≈ ${dec(answer)}`, `El 10% más rico gana unas ${dec(answer)} veces lo que el 10% más pobre.`];
    } else {
      const s1 = r.int(30, 70) / 10; // % del ingreso del quintil 1
      const s5 = r.int(400, 560) / 10; // % del ingreso del quintil 5
      answer = Math.round((s5 / s1) * 10) / 10;
      wrongInv = Math.round((s1 / s5) * 100) / 100;
      wrongDiff = Math.round((s5 - s1) * 10) / 10;
      if (d === 6) {
        const total = r.int(20, 90) * 1000; // millones
        const m1 = Math.round((total * s1) / 100);
        const m5 = Math.round((total * s5) / 100);
        answer = Math.round((m5 / m1) * 10) / 10;
        wrongInv = Math.round((m1 / m5) * 100) / 100;
        wrongDiff = m5 - m1;
        prompt = `En una sociedad ficticia, el ingreso total anual de todos los hogares es de ${miles(total)} millones. El 20% de hogares más pobre recibe ${miles(m1)} millones y el 20% más rico, ${miles(m5)} millones.\n\n¿Cuántas veces más recibe el quintil más rico que el más pobre? Redondeá a 1 decimal.`;
        sol = [`Se comparan los dos quintiles: ${miles(m5)} / ${miles(m1)} ≈ ${dec(answer)}.`, "El ingreso total no hace falta: la brecha es un cociente entre los dos grupos."];
      } else {
        prompt = `En un país (datos ficticios), el 20% de los hogares más pobre recibe el ${dec(s1)}% del ingreso total y el 20% más rico recibe el ${dec(s5)}%.\n\n¿Cuántas veces mayor es la participación del quintil más rico que la del más pobre? Redondeá a 1 decimal.`;
        sol = [`Brecha = participación quintil 5 / participación quintil 1`, `= ${dec(s5)} / ${dec(s1)} ≈ ${dec(answer)}`];
      }
    }
    const frequentErrors = [{ match: wrongInv, type: "interpretacion" as ErrorType, message: "Dividiste al revés: así obtenés qué fracción del ingreso del grupo rico recibe el pobre. La brecha se expresa como «cuántas veces más»: rico / pobre." }];
    if (wrongDiff !== null && Math.abs(wrongDiff - answer) > 0.05) frequentErrors.push({ match: wrongDiff, type: "conceptual" as ErrorType, message: "Restaste: la diferencia dice cuánto más en pesos (o puntos), pero la brecha es un cociente: cuántas veces más." });
    return {
      ...base({
        gen: this.id, seed, difficulty: d, subjectId: S, topicId: this.topicId, prompt,
        hints: ["La brecha compara dos grupos con un cociente.", "Poné arriba el grupo más rico y abajo el más pobre.", "Brecha = ingreso (o participación) del grupo rico / del grupo pobre."],
        solution: sol,
        explanation: "La brecha entre deciles o quintiles es una medida sencilla de desigualdad en la distribución del ingreso. Otra medida muy usada es el coeficiente de Gini, que va de 0 (igualdad perfecta) a 1 (máxima desigualdad).",
        frequentErrors,
      }),
      kind: "numeric",
      answer,
      tolerance: 0.051,
      unit: "veces",
    };
  },
};

type Ind = "lp" | "nbi" | "gini" | "brecha" | "exclusion";
const IND_LABELS: Record<Ind, { name: string; def: string }> = {
  lp: { name: "Pobreza por ingresos (línea de pobreza)", def: "compara el ingreso del hogar con el costo de una canasta básica" },
  nbi: { name: "Necesidades básicas insatisfechas (NBI)", def: "mira carencias estructurales: vivienda, hacinamiento, servicios sanitarios, escolaridad, capacidad de subsistencia" },
  gini: { name: "Coeficiente de Gini", def: "resume la desigualdad de la distribución del ingreso entre 0 (igualdad perfecta) y 1 (máxima desigualdad)" },
  brecha: { name: "Brecha de ingresos", def: "cociente entre el ingreso del grupo más rico y el del más pobre (deciles o quintiles)" },
  exclusion: { name: "Exclusión social", def: "quedar fuera de vínculos e instituciones básicas (trabajo, educación, salud, participación), no solo tener pocos ingresos" },
};
const IND_BANK: Item<Ind>[] = [
  { lvl: 1, label: "lp", text: "Indicador que considera pobre a un hogar cuyo ingreso no alcanza para comprar una canasta de bienes y servicios básicos.", why: "comparar ingreso con canasta es el método de la línea de pobreza." },
  { lvl: 1, label: "nbi", text: "Indicador que considera pobre a un hogar si vive en una vivienda precaria o con hacinamiento, aunque su ingreso del mes sea suficiente.", why: "mira condiciones estructurales de vida, no el ingreso: NBI." },
  { lvl: 1, label: "gini", text: "Número entre 0 y 1 que resume qué tan desigual es la distribución del ingreso.", why: "esa escala de 0 a 1 es la del coeficiente de Gini." },
  { lvl: 1, label: "brecha", text: "Cuántas veces más gana el 10% más rico que el 10% más pobre.", why: "es un cociente entre deciles extremos: la brecha de ingresos." },
  { lvl: 1, label: "exclusion", text: "Situación de quien queda desconectado del trabajo, la educación y las redes de participación social.", why: "la exclusión es multidimensional: no se reduce al ingreso." },
  { lvl: 2, label: "gini", text: "Un informe dice que en el país A el indicador pasó de 0,45 a 0,41: la distribución se volvió menos desigual.", why: "un valor de 0 a 1 que baja cuando la distribución se iguala es el Gini." },
  { lvl: 2, label: "nbi", text: "Un censo detecta hogares con chicos en edad escolar que no asisten a la escuela y viviendas sin baño.", why: "asistencia escolar y condiciones sanitarias son componentes de NBI, que se mide con datos censales." },
  { lvl: 2, label: "lp", text: "Una encuesta trimestral releva ingresos y concluye qué porcentaje de personas vive en hogares que no cubren la CBT.", why: "la CBT es la línea de pobreza: método del ingreso." },
  { lvl: 2, label: "brecha", text: "Un estudio informa que el quintil más rico recibe 12 veces más ingreso que el quintil más pobre.", why: "comparar quintiles extremos con un cociente es medir la brecha." },
  { lvl: 3, label: "exclusion", text: "Un joven que no estudia ni trabaja, sin cobertura de salud y sin redes de apoyo, aunque su familia supere la línea de pobreza.", why: "puede no ser pobre por ingresos y, aun así, estar excluido: la exclusión es multidimensional." },
  { lvl: 3, label: "nbi", text: "Un hogar recibe un aumento de ingresos este mes, pero sigue viviendo en una casilla con cuatro personas por cuarto.", why: "el ingreso mejoró pero la carencia estructural (hacinamiento) persiste: NBI la detecta." },
  { lvl: 3, label: "lp", text: "Una suba fuerte de precios de los alimentos hace que, en pocos meses, más hogares caigan por debajo de la canasta, sin cambios en sus viviendas.", why: "es un efecto coyuntural sobre el ingreso real: lo capta la línea de pobreza." },
];
const genIndicadores = classifyGen({
  id: "icse-desigualdad-indicadores",
  topicId: "t-icse-desigualdad",
  description: "Distinguir indicadores de pobreza, desigualdad y exclusión",
  labels: IND_LABELS,
  bank: IND_BANK,
  ask: "¿Qué concepto o indicador corresponde a esta descripción?",
  hints: [
    "¿Se mide la situación de un hogar (pobreza) o cómo se reparte el ingreso entre todos (desigualdad)?",
    "Ingreso vs canasta = línea de pobreza; vivienda, hacinamiento, escolaridad = NBI.",
    "Gini: de 0 a 1. Brecha: cociente rico/pobre. Exclusión: quedar fuera de instituciones y vínculos.",
  ],
  explanation: "Pobreza y desigualdad no son lo mismo: la pobreza mira si un hogar alcanza ciertos mínimos; la desigualdad, cómo se distribuyen los recursos. Un país puede reducir la pobreza sin reducir la desigualdad, y viceversa.",
});

// ── Transformaciones contemporáneas ──
type Transf = "globalizacion" | "tecnologica" | "precarizacion" | "informalidad" | "demografica";
const TR_LABELS: Record<Transf, { name: string; def: string }> = {
  globalizacion: { name: "Globalización", def: "intensificación de los flujos mundiales de comercio, capitales, información y personas" },
  tecnologica: { name: "Revolución tecnológica e informacional", def: "difusión de la informática, internet y la automatización en la producción y la vida cotidiana" },
  precarizacion: { name: "Precarización laboral", def: "empleos inestables, con menos protecciones y derechos" },
  informalidad: { name: "Informalidad laboral", def: "trabajo no registrado, sin aportes ni protección de la seguridad social" },
  demografica: { name: "Envejecimiento poblacional", def: "aumento de la proporción de personas mayores por más esperanza de vida y menos nacimientos" },
};
const TR_BANK: Item<Transf>[] = [
  { lvl: 1, label: "globalizacion", text: "Una crisis financiera en un país se transmite en pocos días a mercados de todo el mundo.", why: "la interconexión mundial de los flujos financieros es un rasgo de la globalización." },
  { lvl: 1, label: "tecnologica", text: "Una fábrica reemplaza parte de su línea de montaje por robots controlados por software.", why: "la automatización informatizada es parte de la revolución tecnológica." },
  { lvl: 1, label: "informalidad", text: "Un albañil trabaja sin recibo de sueldo, sin aportes jubilatorios ni obra social.", why: "trabajo no registrado: informalidad." },
  { lvl: 1, label: "demografica", text: "Cada vez hay más personas mayores de 65 años en relación con la población en edad de trabajar.", why: "la mayor proporción de personas mayores es el envejecimiento poblacional." },
  { lvl: 1, label: "precarizacion", text: "Una empresa reemplaza contratos por tiempo indeterminado por contratos de tres meses que se renuevan o no.", why: "la inestabilidad del vínculo laboral es precarización." },
  { lvl: 2, label: "globalizacion", text: "Una prenda se diseña en un país, se fabrica en otro y se vende en cincuenta.", why: "la producción organizada en cadenas globales es un rasgo de la globalización." },
  { lvl: 2, label: "tecnologica", text: "Los trámites que antes exigían ir a una oficina hoy se hacen desde el teléfono.", why: "la digitalización de la vida cotidiana es parte de la revolución informacional." },
  { lvl: 2, label: "precarizacion", text: "Un trabajador registrado ve cómo, al cambiar de empresa, pierde antigüedad, estabilidad y parte de sus beneficios.", why: "está registrado (no es informal), pero sus condiciones se volvieron más inestables: precarización." },
  { lvl: 2, label: "demografica", text: "El sistema previsional debe financiar a una cantidad creciente de jubilados por cada aportante.", why: "es una consecuencia del envejecimiento de la población." },
  { lvl: 3, label: "informalidad", text: "Una vendedora ambulante gana más que algunos empleados formales, pero no tiene cobertura ante una enfermedad.", why: "lo que define la informalidad no es el ingreso sino la falta de registro y protección." },
  { lvl: 3, label: "tecnologica", text: "Una aplicación coordina a miles de repartidores mediante un algoritmo que asigna pedidos.", why: "la organización del trabajo por plataformas digitales es parte de la transformación tecnológica (y abre debates sobre la relación laboral)." },
  { lvl: 3, label: "globalizacion", text: "Una decisión de la tasa de interés de un banco central extranjero afecta el tipo de cambio local.", why: "la interdependencia financiera internacional es globalización." },
];
const TR_VF: VF[] = [
  { text: "Informalidad y precarización son lo mismo.", value: false, why: "la informalidad es falta de registro; la precarización puede darse también en empleos registrados (contratos inestables, menos derechos)." },
  { text: "La globalización afecta solo al comercio de bienes.", value: false, why: "abarca también flujos financieros, información, cultura y personas." },
  { text: "El envejecimiento poblacional se relaciona con el aumento de la esperanza de vida y la baja de la natalidad.", value: true, why: "ambos procesos aumentan la proporción de personas mayores." },
  { text: "Las transformaciones tecnológicas pueden crear empleos nuevos y, al mismo tiempo, volver obsoletos otros.", value: true, why: "el efecto sobre el empleo es doble, y su balance es materia de debate." },
];
const trClassify = classifyGen({
  id: "icse-transformaciones",
  topicId: "t-icse-transformaciones",
  description: "Reconocer transformaciones sociales contemporáneas",
  labels: TR_LABELS,
  bank: TR_BANK,
  ask: "¿Qué transformación contemporánea ilustra este caso?",
  inverseAsk: (n) => `¿Cuál de estos casos ilustra mejor **${n.toLowerCase()}**?`,
  hints: [
    "Buscá el proceso de fondo: ¿conexión mundial, tecnología, condiciones de trabajo o población?",
    "Informalidad = sin registro. Precarización = inestabilidad y pérdida de derechos (puede haber registro).",
    "Globalización: flujos mundiales. Revolución tecnológica: informática, internet, automatización.",
  ],
  explanation: "Las sociedades contemporáneas atraviesan cambios científicos, tecnológicos, económicos y culturales que transforman el trabajo, las desigualdades y las formas de vida. Se los analiza desde distintas perspectivas, con ganadores y perdedores en debate.",
});
const genTransformaciones: Generator = {
  ...trClassify,
  generate(seed, d) {
    if (d >= 3 && seed % 4 === 0) {
      return vfChoice(rng(seed), {
        gen: this.id, seed, d, topicId: this.topicId, st: TR_VF[(seed + d) % TR_VF.length],
        hints: ["Desconfiá de «solo» y de «son lo mismo».", "Pensá en un ejemplo concreto que confirme o refute la frase.", "Informalidad ≠ precarización; globalización ≠ solo comercio."],
        explanation: "Las transformaciones contemporáneas son procesos multidimensionales.",
      });
    }
    return trClassify.generate(seed, d);
  },
};

// ═══════════════════════ icse-2 · El Estado ═══════════════════════

type Elem = "poblacion" | "territorio" | "poder" | "soberania";
const ELEM_LABELS: Record<Elem, { name: string; def: string }> = {
  poblacion: { name: "Población", def: "el conjunto de personas sobre las que el Estado ejerce su autoridad" },
  territorio: { name: "Territorio", def: "el espacio físico (tierra, aguas, espacio aéreo) donde el Estado ejerce su autoridad" },
  poder: { name: "Poder (aparato institucional y coerción)", def: "la capacidad de tomar decisiones obligatorias y hacerlas cumplir, incluso por la fuerza legítima" },
  soberania: { name: "Soberanía", def: "la autoridad suprema hacia adentro e independiente hacia afuera; no reconoce un poder superior" },
};
const ELEM_BANK: Item<Elem>[] = [
  { lvl: 1, label: "poblacion", text: "Las personas que habitan el país y quedan sujetas a sus leyes.", why: "las personas sometidas a la autoridad estatal son la población." },
  { lvl: 1, label: "territorio", text: "El ámbito espacial delimitado por fronteras dentro del cual rigen las leyes del Estado.", why: "el espacio delimitado es el territorio." },
  { lvl: 1, label: "poder", text: "La capacidad de dictar normas obligatorias y hacerlas cumplir mediante instituciones y, si hace falta, la fuerza.", why: "eso es el poder estatal, que se apoya en el monopolio de la coerción legítima." },
  { lvl: 1, label: "soberania", text: "La cualidad de no estar subordinado a ninguna autoridad superior, ni interna ni externa.", why: "esa supremacía e independencia es la soberanía." },
  { lvl: 2, label: "territorio", text: "Un Estado reclama derechos sobre el mar adyacente a sus costas y su plataforma continental.", why: "se discute el alcance espacial de la autoridad: territorio." },
  { lvl: 2, label: "poder", text: "La policía detiene a una persona en cumplimiento de una orden judicial.", why: "es el uso legítimo de la coerción por parte del aparato estatal: poder." },
  { lvl: 2, label: "soberania", text: "Un país rechaza que otro Estado decida cómo deben organizarse sus elecciones.", why: "defiende su independencia frente a autoridades externas: soberanía." },
  { lvl: 2, label: "poblacion", text: "Un censo cuenta a todos los habitantes, incluidos los extranjeros residentes.", why: "el censo releva a la población sobre la que se ejerce la autoridad." },
  { lvl: 3, label: "soberania", text: "Al ratificar un tratado internacional, un Estado acepta obligaciones decidiendo por sí mismo hacerlo.", why: "la soberanía incluye la capacidad de obligarse voluntariamente frente a otros Estados." },
  { lvl: 3, label: "poder", text: "Un grupo armado controla una zona y cobra «impuestos», pero nadie reconoce esa autoridad como legítima.", why: "muestra que el poder estatal no es cualquier fuerza: requiere pretensión de legitimidad (monopolio de la coerción legítima)." },
];
const genEstadoElementos = classifyGen({
  id: "icse-estado-elementos",
  topicId: "t-icse-estado",
  description: "Reconocer los elementos constitutivos del Estado",
  labels: ELEM_LABELS,
  bank: ELEM_BANK,
  ask: "¿Qué elemento del Estado se pone en juego?",
  inverseAsk: (n) => `¿Cuál de estas situaciones pone en juego, sobre todo, el elemento **${n.toLowerCase()}** del Estado?`,
  hints: [
    "Preguntate: ¿se habla de personas, de un espacio, de la capacidad de mandar o de la independencia?",
    "La soberanía mira la relación con otras autoridades: no tener un poder superior.",
    "El poder estatal se apoya en la coerción legítima: no toda fuerza es poder estatal.",
  ],
  explanation: "Es habitual describir al Estado por sus elementos: población, territorio, poder (gobierno y aparato institucional) y soberanía. Como referencia general, Max Weber lo definió como la comunidad humana que, dentro de un territorio, reclama con éxito el monopolio de la coerción física legítima.",
});

const ESTADO_PAIRS: [string, string][] = [
  ["Estado", "Asociación política que, en un territorio, reclama con éxito el monopolio de la coerción física legítima"],
  ["Gobierno", "Personas que ocupan transitoriamente los cargos de conducción del Estado"],
  ["Nación", "Comunidad que se reconoce con una identidad común (historia, cultura, proyecto compartido)"],
  ["Régimen político", "Reglas e instituciones que regulan el acceso al poder y su ejercicio"],
  ["Administración pública", "Aparato de funcionarios permanentes que ejecuta las decisiones estatales"],
  ["Sociedad civil", "Ámbito de organizaciones y relaciones sociales no estatales"],
];
const ESTADO_VF: VF[] = [
  { text: "Cuando cambia el gobierno, cambia el Estado.", value: false, why: "el Estado permanece; lo que cambia son las personas que ocupan transitoriamente los cargos de conducción." },
  { text: "Puede haber naciones sin un Estado propio.", value: true, why: "una comunidad puede tener identidad nacional sin contar con un Estado soberano (hay muchos casos históricos y actuales)." },
  { text: "Un cambio de régimen político implica un cambio en las reglas de acceso al poder.", value: true, why: "eso es justamente lo que define al régimen: por ejemplo, pasar de una dictadura a una democracia." },
  { text: "Para Weber, el Estado se define por los fines que persigue, como el bien común.", value: false, why: "Weber lo define por un medio específico, la coerción física legítima monopolizada, porque los fines estatales varían mucho históricamente." },
  { text: "La administración pública cambia por completo con cada elección.", value: false, why: "gran parte de la burocracia es permanente; cambian sobre todo los cargos políticos." },
];
const genEstadoConceptos: Generator = {
  id: "icse-estado-conceptos",
  topicId: "t-icse-estado",
  description: "Distinguir Estado, gobierno, nación, régimen y administración",
  generate(seed, d) {
    const r = rng(seed);
    const hints: Hints = [
      "Pensá qué permanece y qué cambia: ¿qué sigue igual después de una elección?",
      "El gobierno es transitorio; el Estado, permanente. El régimen son las reglas del juego.",
      "Nación = identidad compartida; Estado = organización política con monopolio de la coerción legítima.",
    ];
    if (d >= 4 && r.bool())
      return vfChoice(r, { gen: this.id, seed, d, topicId: this.topicId, st: ESTADO_VF[(seed + d) % ESTADO_VF.length], hints, explanation: "Estado, gobierno, nación y régimen se confunden en el habla cotidiana, pero no son lo mismo." });
    return matchFrom(r, { gen: this.id, seed, d, topicId: this.topicId, bank: ESTADO_PAIRS, prompt: "Relacioná cada concepto con su definición.", hints, explanation: "Estado, gobierno, nación y régimen se confunden en el habla cotidiana, pero no son lo mismo." });
  },
};

// ── Dominación legítima (Weber) ──
type Dom = "tradicional" | "carismatica" | "legal";
const DOM_LABELS: Record<Dom, { name: string; def: string }> = {
  tradicional: { name: "Dominación tradicional", def: "se obedece porque «siempre fue así»: la autoridad descansa en costumbres heredadas" },
  carismatica: { name: "Dominación carismática", def: "se obedece por las cualidades extraordinarias que se atribuyen a un líder" },
  legal: { name: "Dominación legal-racional", def: "se obedece a normas impersonales y a quien ocupa un cargo según esas normas" },
};
const DOM_BANK: Item<Dom>[] = [
  { lvl: 1, label: "tradicional", text: "Se obedece al jefe porque su familia ejerció ese mando por generaciones.", why: "la legitimidad descansa en la costumbre heredada: tradicional." },
  { lvl: 1, label: "carismatica", text: "Los seguidores obedecen porque consideran que su líder tiene dotes excepcionales.", why: "la legitimidad descansa en cualidades personales extraordinarias: carismática." },
  { lvl: 1, label: "legal", text: "Se obedece a la funcionaria porque fue designada según un procedimiento establecido por ley.", why: "la legitimidad descansa en normas impersonales: legal-racional." },
  { lvl: 2, label: "legal", text: "Cuando termina su mandato, el intendente deja el cargo y nadie le debe obediencia, aunque siga siendo popular.", why: "la obediencia es al cargo definido por normas, no a la persona: legal-racional." },
  { lvl: 2, label: "carismatica", text: "Un movimiento nace alrededor de un líder cuya palabra pesa más que cualquier reglamento.", why: "la autoridad personal está por encima de las reglas: carismática." },
  { lvl: 2, label: "tradicional", text: "En una comunidad, el consejo de ancianos resuelve los conflictos según usos transmitidos oralmente.", why: "la costumbre transmitida es la fuente de autoridad: tradicional." },
  { lvl: 3, label: "carismatica", text: "Tras la muerte del fundador, sus seguidores redactan estatutos y crean cargos para que la organización continúe.", why: "describe la «rutinización del carisma»: la autoridad carismática tiende a transformarse en tradicional o legal para perdurar. El punto de partida es carismático." },
  { lvl: 3, label: "legal", text: "Un empleado público cumple una orden de su superior porque está dentro de las competencias que fija el reglamento.", why: "la obediencia está acotada por competencias normadas: burocracia, la forma típica de la dominación legal." },
];
const genDominacion = classifyGen({
  id: "icse-dominacion",
  topicId: "t-icse-dominacion",
  description: "Clasificar casos según los tipos de dominación legítima de Weber",
  labels: DOM_LABELS,
  bank: DOM_BANK,
  ask: "¿Qué tipo de dominación legítima (en el sentido de Weber) describe este caso?",
  inverseAsk: (n) => `¿Cuál de estos casos ilustra la **${n.toLowerCase()}**?`,
  hints: [
    "Preguntate por qué se obedece, no a quién.",
    "Costumbre → tradicional; cualidades del líder → carismática; normas impersonales → legal-racional.",
    "En la dominación legal se obedece al cargo; en la carismática, a la persona.",
  ],
  explanation: "Como referencia general, Weber distinguió tres tipos ideales de dominación según el fundamento de su legitimidad. En la realidad suelen aparecer combinados.",
});

// ── Tipos de Estado ──
type TEst = "absolutista" | "liberal" | "bienestar" | "neoliberal";
const TEST_LABELS: Record<TEst, { name: string; def: string }> = {
  absolutista: { name: "Estado absolutista", def: "poder concentrado en el monarca, legitimado por derecho divino (siglos XVI–XVIII en Europa)" },
  liberal: { name: "Estado liberal", def: "garantiza derechos individuales, división de poderes e intervención económica limitada (siglo XIX)" },
  bienestar: { name: "Estado de bienestar", def: "interviene en la economía y garantiza derechos sociales (salud, previsión, empleo) (posguerra, desde 1945)" },
  neoliberal: { name: "Estado neoliberal", def: "reduce su intervención: privatizaciones, desregulación, apertura y prioridad al equilibrio fiscal (desde fines de los años setenta)" },
};
const TEST_BANK: Item<TEst>[] = [
  { lvl: 1, label: "absolutista", text: "El rey concentra el poder de hacer leyes, juzgar y gobernar, y dice recibir su autoridad de Dios.", why: "concentración del poder y derecho divino: absolutismo." },
  { lvl: 1, label: "liberal", text: "El Estado se limita a garantizar la seguridad, la propiedad y los contratos; el mercado regula la economía.", why: "el «Estado gendarme» que garantiza libertades y no interviene en la economía es el liberal clásico." },
  { lvl: 1, label: "bienestar", text: "El Estado garantiza jubilaciones, salud pública y busca el pleno empleo con políticas activas.", why: "derechos sociales e intervención económica: Estado de bienestar." },
  { lvl: 1, label: "neoliberal", text: "Se privatizan empresas públicas, se desregulan mercados y se abre la economía al comercio y los capitales.", why: "privatización, desregulación y apertura son rasgos del modelo neoliberal." },
  { lvl: 2, label: "liberal", text: "Una constitución consagra la división de poderes y la libertad de comercio, pero el voto está restringido a una minoría.", why: "el liberalismo del siglo XIX garantizó libertades civiles antes de ampliar los derechos políticos." },
  { lvl: 2, label: "bienestar", text: "Tras la crisis de 1929 y la Segunda Guerra, se aplican políticas keynesianas para sostener la demanda.", why: "el keynesianismo de posguerra es la base económica del Estado de bienestar." },
  { lvl: 2, label: "neoliberal", text: "Se sostiene que el déficit fiscal y la inflación son los problemas centrales y que la intervención estatal distorsiona los mercados.", why: "prioridad al equilibrio fiscal y crítica a la intervención: diagnóstico neoliberal." },
  { lvl: 2, label: "absolutista", text: "Un monarca crea un ejército permanente y una burocracia de funcionarios que responden solo a él.", why: "centralizar ejército y administración en el rey es característico del absolutismo." },
  { lvl: 3, label: "bienestar", text: "Se considera que la ciudadanía incluye el derecho a un nivel mínimo de bienestar, garantizado por el Estado.", why: "la idea de derechos sociales garantizados es el núcleo del Estado de bienestar." },
  { lvl: 3, label: "neoliberal", text: "Las funciones de salud y educación se descentralizan y parte de los servicios pasa a prestadores privados.", why: "descentralización y participación privada en servicios públicos son políticas asociadas al modelo neoliberal." },
  { lvl: 3, label: "liberal", text: "Se proclama que todos son iguales ante la ley y se suprimen los privilegios de nacimiento.", why: "la igualdad jurídica contra los privilegios estamentales es una conquista del liberalismo." },
];
const genTipoEstado = classifyGen({
  id: "icse-tipo-estado",
  topicId: "t-icse-tipos-estado",
  description: "Reconocer los tipos históricos de Estado",
  labels: TEST_LABELS,
  bank: TEST_BANK,
  ask: "¿Qué tipo de Estado describe esta situación?",
  inverseAsk: (n) => `¿Cuál de estas situaciones corresponde mejor a un **${n.toLowerCase()}**?`,
  hints: [
    "Fijate cuánto interviene el Estado y en qué.",
    "Rey con poder concentrado → absolutista. Libertades + poca intervención → liberal.",
    "Derechos sociales + keynesianismo → bienestar. Privatizar, desregular, abrir → neoliberal.",
  ],
  explanation: "Los tipos de Estado son modelos que resumen grandes tendencias históricas; cada uno surgió como respuesta a problemas de su época y fue objeto de críticas desde otras posiciones.",
});
const TEST_EVENTS: Ev[] = [
  { text: "Estado absolutista: el monarca concentra el poder", year: 1650, shown: "siglos XVI–XVIII" },
  { text: "Estado liberal: división de poderes y libertades individuales", year: 1850, shown: "siglo XIX" },
  { text: "Estado de bienestar: derechos sociales y keynesianismo", year: 1950, shown: "posguerra, desde 1945" },
  { text: "Estado neoliberal: privatizaciones, desregulación y apertura", year: 1985, shown: "desde fines de los años setenta" },
];
const TEST_HITOS: Ev[] = [
  { text: "Revolución Francesa: Declaración de los Derechos del Hombre y del Ciudadano", year: 1789 },
  { text: "Crisis económica mundial («crac» de Wall Street)", year: 1929 },
  { text: "Fin de la Segunda Guerra Mundial", year: 1945 },
  { text: "Crisis del petróleo que golpea a las economías de posguerra", year: 1973 },
  { text: "Caída del Muro de Berlín", year: 1989 },
];
const genTiposEstadoOrden: Generator = {
  id: "icse-tipos-estado-orden",
  topicId: "t-icse-tipos-estado",
  description: "Ordenar cronológicamente los tipos de Estado y los hitos que marcan sus transiciones",
  generate(seed, d) {
    const r = rng(seed);
    const bank = d <= 2 ? TEST_EVENTS : d <= 4 ? [...TEST_EVENTS.slice(1), ...TEST_HITOS.slice(1, 4)] : [...TEST_EVENTS, ...TEST_HITOS];
    return orderFrom(r, {
      gen: this.id, seed, d, topicId: this.topicId, bank,
      n: byDifficulty(d, [3, 4, 4, 5, 5, 6]),
      prompt: "Ordená de lo más antiguo a lo más reciente.",
      hints: ["Ubicá primero el absolutismo, antes de las revoluciones liberales.", "El Estado de bienestar se consolida después de la Segunda Guerra; el neoliberal, después de la crisis de los setenta.", "Secuencia: absolutista → liberal (desde 1789) → bienestar (desde 1945) → neoliberal (desde fines de los setenta)."],
      explanation: "Cada tipo de Estado surge en respuesta a crisis del anterior: las revoluciones liberales contra el absolutismo, la crisis de 1929 y la posguerra contra el liberalismo clásico, y la crisis de los setenta contra el Estado de bienestar.",
    });
  },
};
