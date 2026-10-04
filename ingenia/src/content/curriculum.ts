/**
 * Estructura académica: carreras, materias y unidades.
 *
 * REGLA: no se inventan programas ni correlatividades. Cada materia lleva
 * `official.status` y sus fuentes. Lo que no se pudo confirmar contra el plan
 * oficial queda en "pendiente" y la UI lo muestra como tal.
 * Ver docs/ACADEMIC_SOURCES.md para el detalle de la investigación.
 */
import type { Career, OfficialInfo, Subject, Unit } from "@/engine/types";

const CHECKED = "2026-10-04";

const SRC = {
  pcCreacion: {
    label: "Res. CS UBA 2022 — Creación de la asignatura Pensamiento Computacional (CBC)",
    url: "https://cms.fi.uba.ar/uploads/RESCS_2022_9_E_UBA_REC_Creacion_de_asignatura_Pensamiento_computacional_017078f40f.pdf",
  },
  cbcNueva: { label: "FIUBA — «El CBC de Ingeniería con una nueva asignatura»", url: "https://www.fi.uba.ar/noticias/el-cbc-de-ingenieria-con-una-nueva-asignatura" },
  planes2023: { label: "FIUBA — Planes de estudio 2023", url: "https://www.fi.uba.ar/institucional/plan2020/planes-de-estudio-2023" },
  informatica2023: { label: "Res. CD FIUBA 2023/526 — Plan 2023 Ingeniería en Informática", url: "https://cms.fi.uba.ar/uploads/RESCD_2023_526_Informatica_Plan_2023_Aprobacion_15d3cee700.pdf" },
  industrial2023: { label: "Res. CD FIUBA 2023/525 — Plan 2023 Ingeniería Industrial", url: "https://cms.fi.uba.ar/uploads/RESCD_2023_525_Industrial_Plan_2023_Aprobacion_2743f4c98b.pdf" },
  industrialMod: { label: "Res. CS UBA 2024/63 — Modificación Plan 2023 Ingeniería Industrial", url: "https://cms.fi.uba.ar/uploads/RCS_2024_63_MOD_INGENIERIA_INDUSTRIAL_fa83c5599d.pdf" },
  fisicaCbc: { label: "Cátedra de Física — CBC UBA", url: "https://fisica.cbc.uba.ar/materias/" },
  mate66: { label: "Área de Matemática CBC — Análisis Matemático A (66)", url: "https://mate.cbc.uba.ar/66.html" },
  cbcCarreras: { label: "CBC UBA — Carreras", url: "https://www.cbc.uba.ar/carreras" },
};

const official = (status: OfficialInfo["status"], sources: OfficialInfo["sources"], note?: string): OfficialInfo => ({
  status,
  sources,
  lastChecked: CHECKED,
  note,
});

const unit = (id: string, title: string, summary: string, lessonIds: string[] = [], topicIds: string[] = [], icon?: string): Unit => ({
  id,
  icon,
  title,
  summary,
  lessonIds,
  topicIds,
  contentStatus: lessonIds.length === 0 ? "estructura" : "completo",
});

// ───────────────────────── Preparación ─────────────────────────

export const PREPARACION: Subject = {
  id: "preparacion",
  name: "Preparación para Ingeniería",
  shortName: "Preparación",
  cycle: "preparacion",
  careers: "todas",
  icon: "🧭",
  color: "prep",
  description:
    "Recupera, desde cero y sin apuro, lo que el CBC da por sabido del secundario: números, álgebra, funciones, la matemática de la física y las primeras ideas de programación.",
  objectives: [
    "Operar con seguridad con negativos, fracciones, porcentajes y potencias.",
    "Resolver ecuaciones y despejar fórmulas entendiendo por qué cada paso es válido.",
    "Leer y construir funciones y gráficos.",
    "Usar unidades, vectores y las ecuaciones del movimiento.",
    "Pensar un problema como algoritmo y seguir la ejecución de un programa.",
  ],
  units: [
    unit("nivel-0", "Nivel 0 · Volviendo a estudiar", "Cómo estudiar matemática, signos, orden de operaciones, fracciones, porcentajes y potencias.", ["l-como-estudiar", "l-signos", "l-jerarquia", "l-fracciones", "l-porcentajes", "l-potencias"], ["t-signos", "t-jerarquia", "t-fracciones", "t-porcentajes", "t-potencias"], "🧮"),
    unit("nivel-1", "Nivel 1 · Fundamentos algebraicos", "Variables, expresiones, ecuaciones lineales y despeje de fórmulas.", ["l-expresiones", "l-ecuaciones", "l-despeje"], ["t-expresiones", "t-ecuaciones", "t-despeje"], "⚖️"),
    {
      ...unit("nivel-2", "Nivel 2 · Matemática pre-universitaria", "Funciones, plano cartesiano, función lineal y dominio. (Trigonometría, exponenciales, logaritmos y límites: próximas lecciones.)", ["l-funciones", "l-recta", "l-dominio"], ["t-funciones", "t-recta", "t-dominio"], "📈"),
      contentStatus: "parcial",
    },
    unit("nivel-3", "Nivel 3 · Preparación para Física", "Unidades, notación científica, vectores y movimiento.", ["l-unidades", "l-vectores", "l-mru", "l-mruv"], ["t-unidades", "t-vectores", "t-mru", "t-mruv"], "🚀"),
    unit("nivel-4", "Nivel 4 · Preparación computacional", "Algoritmos, variables, condiciones y bucles con un lenguaje real (Python).", ["l-algoritmos", "l-condicionales", "l-bucles"], ["t-variables-codigo", "t-condicionales", "t-bucles"], "💻"),
  ],
  prerequisites: [],
  bibliography: [],
  official: official("verificado", [], "Sección propia de Ingenia (no es una materia oficial): diseñada para cubrir los prerrequisitos del CBC."),
};

// ───────────────────────── CBC ─────────────────────────

export const AM_A: Subject = {
  id: "am-a",
  name: "Análisis Matemático A",
  shortName: "Análisis A",
  cycle: "cbc",
  careers: "todas",
  icon: "∫",
  color: "math",
  description: "Funciones de una variable, límites, derivadas, integrales y series: el lenguaje del cambio que usa toda la ingeniería.",
  objectives: [
    "Comprender funciones reales y sus gráficos.",
    "Calcular e interpretar límites y continuidad.",
    "Derivar y usar la derivada para estudiar funciones y optimizar.",
    "Integrar y aplicar la integral al cálculo de áreas.",
  ],
  units: [
    { ...unit("am-1", "Funciones", "Dominio, imagen, gráficos y función lineal.", ["l-funciones", "l-recta", "l-dominio"], ["t-funciones", "t-recta", "t-dominio"]), contentStatus: "parcial" },
    unit("am-2", "Números reales", "Propiedades de los reales, intervalos, valor absoluto."),
    unit("am-3", "Sucesiones", "Sucesiones y sus límites."),
    unit("am-4", "Límites y continuidad", "Límite de funciones, asíntotas, continuidad."),
    unit("am-5", "Derivadas", "Definición, reglas de derivación, recta tangente."),
    unit("am-6", "Teorema del valor medio y regla de L'Hôpital", ""),
    unit("am-7", "Estudio de funciones y optimización", "Crecimiento, extremos, concavidad, problemas de optimización."),
    unit("am-8", "Teorema de Taylor", "Polinomio de Taylor y aproximación."),
    unit("am-9", "Integrales", "Integral indefinida y definida, métodos de integración."),
    unit("am-10", "Área entre curvas y ecuaciones diferenciales", ""),
    unit("am-11", "Series", "Series numéricas y de potencias."),
  ],
  prerequisites: ["preparacion"],
  bibliography: [{ label: "Guías de trabajos prácticos de la cátedra (publicadas por el CBC)", url: SRC.mate66.url }],
  official: official(
    "parcial",
    [SRC.mate66],
    "Las 11 unidades siguen la organización en prácticas del curso 66 relevada en fuentes secundarias; confirmar contra el programa vigente de la cátedra (cbc.uba.ar estaba inaccesible al momento de la carga).",
  ),
};

export const ALGEBRA_A: Subject = {
  id: "algebra-a",
  name: "Álgebra A",
  shortName: "Álgebra A",
  cycle: "cbc",
  careers: "todas",
  icon: "⟨⟩",
  color: "algebra",
  description: "Vectores, rectas y planos, sistemas lineales, matrices y transformaciones: la base del álgebra lineal.",
  objectives: ["Operar con vectores en ℝⁿ y usar el producto escalar.", "Resolver sistemas de ecuaciones lineales.", "Trabajar con matrices, determinantes y transformaciones lineales."],
  units: [
    { ...unit("alg-1", "Vectores en ℝⁿ", "Conjuntos, ℝⁿ, operaciones con vectores, producto escalar, norma, distancia, ángulo y ortogonalidad.", ["l-vectores", "l-producto-escalar"], ["t-vectores", "t-producto-escalar"]), contentStatus: "parcial" },
    unit("alg-2", "Rectas y planos", "Ecuaciones vectoriales y paramétricas."),
    unit("alg-3", "Sistemas de ecuaciones lineales", "Método de eliminación de Gauss."),
    unit("alg-4", "Matrices y determinantes", ""),
    unit("alg-5", "Transformaciones lineales", "Forma matricial y funcional, imagen, núcleo, clasificación."),
    unit("alg-6", "Cónicas", ""),
  ],
  prerequisites: ["preparacion"],
  bibliography: [],
  official: official(
    "parcial",
    [SRC.cbcCarreras],
    "Unidad 1, transformaciones lineales, determinantes y cónicas confirmadas en fuentes secundarias del programa; 'Rectas y planos' y 'Sistemas' cargadas como estructura habitual del curso 62, pendientes de verificar.",
  ),
};

export const FISICA: Subject = {
  id: "fisica",
  name: "Física",
  shortName: "Física",
  cycle: "cbc",
  careers: "todas",
  icon: "🚀",
  color: "physics",
  description: "Magnitudes, vectores, cinemática, dinámica, trabajo y energía e hidrostática: describir y predecir el movimiento.",
  objectives: ["Modelar movimientos con ecuaciones y gráficos.", "Aplicar las leyes de Newton.", "Usar trabajo y energía para resolver problemas.", "Comprender presión e hidrostática."],
  units: [
    unit("fis-0", "Unidad 0 · Repaso matemático", "Despeje de fórmulas, unidades y notación científica.", ["l-despeje", "l-unidades"], ["t-despeje", "t-unidades"]),
    unit("fis-1", "Unidad 1 · Magnitudes físicas y vectores", "Magnitudes escalares y vectoriales, componentes, módulo, suma.", ["l-unidades", "l-vectores"], ["t-unidades", "t-vectores"]),
    unit("fis-2", "Unidad 2 · Cinemática", "MRU, MRUV, caída libre y tiro vertical.", ["l-mru", "l-mruv", "l-caida-libre"], ["t-mru", "t-mruv", "t-caida-libre"]),
    unit("fis-3", "Unidad 3 · Dinámica", "Fuerzas y leyes de Newton."),
    unit("fis-4", "Unidad 4 · Trabajo y energía", ""),
    unit("fis-5", "Unidad 5 · Hidrostática", "Presión, principio de Pascal y de Arquímedes."),
  ],
  prerequisites: ["preparacion"],
  bibliography: [{ label: "Guías de la cátedra de Física del CBC", url: SRC.fisicaCbc.url }],
  official: official("parcial", [SRC.fisicaCbc], "Las guías 1-5 (magnitudes y vectores, cinemática, dinámica, trabajo y energía, hidrostática) figuran en el campus del CBC; la Unidad 0 es un repaso agregado por Ingenia."),
};

export const PENSAMIENTO_COMPUTACIONAL: Subject = {
  id: "pensamiento-computacional",
  name: "Pensamiento Computacional",
  shortName: "Pens. Computacional",
  cycle: "cbc",
  careers: "todas",
  icon: "⌘",
  color: "code",
  description: "Descomposición, abstracción, reconocimiento de patrones y algoritmos, programando en un lenguaje real.",
  objectives: ["Formular problemas de forma que una computadora pueda resolverlos.", "Diseñar algoritmos y traducirlos a código.", "Leer, ejecutar mentalmente y depurar programas."],
  units: [
    unit("pc-1", "Algoritmos y variables", "Qué es un algoritmo, variables, asignación, entrada y salida.", ["l-algoritmos"], ["t-variables-codigo"]),
    unit("pc-2", "Condicionales y lógica", "if / elif / else, expresiones booleanas.", ["l-condicionales"], ["t-condicionales"]),
    unit("pc-3", "Repetición", "Bucles for y while, acumuladores y contadores.", ["l-bucles"], ["t-bucles"]),
    unit("pc-4", "Funciones", "Descomposición de problemas en funciones."),
    unit("pc-5", "Listas y estructuras de datos", ""),
  ],
  prerequisites: ["preparacion"],
  bibliography: [],
  official: official(
    "parcial",
    [SRC.pcCreacion, SRC.cbcNueva],
    "Materia del CBC obligatoria para ingresantes a FIUBA desde 2023. El programa vigente no pudo consultarse; las unidades son una organización provisoria basada en los ejes de la resolución de creación (descomposición, abstracción, patrones, algoritmos).",
  ),
};

const pendingSubject = (id: string, name: string, shortName: string, icon: string, color: string, description: string, careers: Subject["careers"] = "todas"): Subject => ({
  id,
  name,
  shortName,
  cycle: "cbc",
  careers,
  icon,
  color,
  description,
  objectives: [],
  units: [],
  prerequisites: [],
  bibliography: [],
  official: official("pendiente", [SRC.cbcCarreras], "Materia del CBC de Ingeniería. Programa pendiente de cargar desde la fuente oficial: no se agregan unidades inventadas."),
});

export const IPC = pendingSubject("ipc", "Introducción al Pensamiento Científico", "IPC", "🔬", "humanities", "Qué es el conocimiento científico, cómo se construye y cómo se pone a prueba.");
export const ICSE = pendingSubject("icse", "Introducción al Conocimiento de la Sociedad y el Estado", "ICSE", "🏛️", "humanities", "Sociedad, Estado y su relación, con foco en la historia argentina.");
export const QUIMICA = pendingSubject("quimica", "Química", "Química", "⚗️", "chem", "Estructura de la materia, reacciones y estequiometría.");

// ───────────────────────── Segundo ciclo ─────────────────────────

const later = (id: string, name: string, careers: Subject["careers"], prerequisites: string[], src: OfficialInfo["sources"], note: string): Subject => ({
  id,
  name,
  shortName: name,
  cycle: "segundo-ciclo",
  careers,
  icon: "🎓",
  color: "later",
  description: "",
  objectives: [],
  units: [],
  prerequisites,
  bibliography: [],
  official: official("parcial", src, note),
});

const NOTE_NAME = "Nombre confirmado en el plan 2023 (fuentes de búsqueda sobre la resolución oficial). Programa, ubicación y correlatividades pendientes de cargar.";

export const LATER_SUBJECTS: Subject[] = [
  later("analisis-2", "Análisis Matemático II", ["informatica", "industrial"], [], [SRC.informatica2023, SRC.industrial2023], NOTE_NAME),
  later("fund-prog", "Fundamentos de Programación", ["informatica"], [], [SRC.informatica2023], NOTE_NAME),
  later("ayed", "Algoritmos y Estructuras de Datos", ["informatica"], ["fund-prog"], [SRC.informatica2023], "Nombre y correlativa (Fundamentos de Programación) confirmados en el plan 2023. Programa pendiente."),
  later("algebra-lineal", "Álgebra Lineal", ["industrial"], [], [SRC.industrial2023, SRC.industrialMod], NOTE_NAME),
  later("fisica-particulas", "Física de los Sistemas de Partículas", ["industrial"], [], [SRC.industrial2023], NOTE_NAME),
  later("estadistica-aplicada", "Estadística Aplicada", ["industrial"], [], [SRC.industrial2023], NOTE_NAME),
  later("economia", "Economía", ["industrial"], [], [SRC.industrial2023], NOTE_NAME),
  later("desarrollo-economico", "Desarrollo Económico", ["industrial"], [], [SRC.industrial2023], NOTE_NAME),
  later("ingenieria-economica", "Ingeniería Económica", ["industrial"], [], [SRC.industrial2023], NOTE_NAME),
  later("investigacion-operativa", "Investigación Operativa", ["industrial"], [], [SRC.industrial2023], NOTE_NAME),
  later("materiales-1", "Materiales y Aplicaciones I", ["industrial"], [], [SRC.industrial2023], NOTE_NAME),
  later("tp-industrial", "Trabajo Profesional de Ingeniería Industrial", ["industrial"], [], [SRC.industrial2023], NOTE_NAME),
];

export const SUBJECTS: Subject[] = [PREPARACION, ALGEBRA_A, AM_A, FISICA, PENSAMIENTO_COMPUTACIONAL, IPC, ICSE, QUIMICA, ...LATER_SUBJECTS];

// ───────────────────────── Carreras ─────────────────────────

export const CBC_RULE =
  "El CBC de Ingeniería tiene seis materias: Análisis Matemático A, Álgebra A, IPC e ICSE, más dos de un grupo formado por Física, Química y Pensamiento Computacional, según la carrera.";

export const CAREERS: Career[] = [
  {
    id: "informatica",
    name: "Ingeniería en Informática",
    shortName: "Informática",
    description: "Diseño y construcción de sistemas de software: algoritmos, programación, sistemas operativos, redes, bases de datos.",
    cbcSubjects: ["am-a", "algebra-a", "fisica", "pensamiento-computacional", "ipc", "icse"],
    laterSubjects: LATER_SUBJECTS.filter((s) => s.careers !== "todas" && s.careers.includes("informatica")).map((s) => s.id),
    official: official(
      "parcial",
      [SRC.informatica2023, SRC.planes2023, SRC.cbcNueva],
      "Plan 2023 aprobado (10 cuatrimestres, 3616 h). Qué dos materias del grupo Física/Química/Pensamiento Computacional exige la carrera: verificar en el plan oficial. El listado completo del ciclo posterior está pendiente de carga.",
    ),
  },
  {
    id: "industrial",
    name: "Ingeniería Industrial",
    shortName: "Industrial",
    description: "Diseño, gestión y mejora de sistemas productivos y organizaciones: operaciones, economía, estadística, logística.",
    cbcSubjects: ["am-a", "algebra-a", "fisica", "quimica", "ipc", "icse"],
    laterSubjects: LATER_SUBJECTS.filter((s) => s.careers !== "todas" && s.careers.includes("industrial")).map((s) => s.id),
    official: official(
      "parcial",
      [SRC.industrial2023, SRC.industrialMod, SRC.planes2023],
      "Plan 2023 con modificación 2024. Qué dos materias del grupo Física/Química/Pensamiento Computacional exige la carrera: verificar en el plan oficial. El listado completo del ciclo posterior está pendiente de carga.",
    ),
  },
];

const SUBJECT_BY_ID = new Map(SUBJECTS.map((s) => [s.id, s]));

export function getSubject(id: string): Subject | undefined {
  return SUBJECT_BY_ID.get(id);
}

export function findUnit(unitId: string): { subject: Subject; unit: Unit } | undefined {
  for (const subject of SUBJECTS) {
    const u = subject.units.find((x) => x.id === unitId);
    if (u) return { subject, unit: u };
  }
  return undefined;
}

export function subjectsForGoal(goal: "industrial" | "informatica" | "ambas"): Subject[] {
  const careers = goal === "ambas" ? ["industrial", "informatica"] : [goal];
  return SUBJECTS.filter((s) => s.careers === "todas" || s.careers.some((c) => careers.includes(c)));
}
