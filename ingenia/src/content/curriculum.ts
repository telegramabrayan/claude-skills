/**
 * Estructura académica: carreras, materias y unidades.
 *
 * REGLA: no se inventan programas ni correlatividades. Cada materia lleva
 * `official.status` y sus fuentes. Lo que no se pudo confirmar contra el plan
 * oficial queda en "pendiente" y la UI lo muestra como tal.
 * Ver docs/ACADEMIC_SOURCES.md para el detalle de la investigación.
 */
import type { Career, OfficialInfo, Subject, Unit } from "@/engine/types";

const CHECKED = "2026-10-05";

const SRC = {
  pcSitio: { label: "Pensamiento Computacional — material de la cátedra", url: "https://pensamientocomputacional.dev.ar/" },
  ipc2026: { label: "Campus CBC — Programa IPC 1º C 2026", url: "https://cbccampusvirtual.uba.ar/pluginfile.php/1914271/mod_resource/content/13/Programa%20IPC%201%C2%BA%20C%202026.pdf" },
  icseProg: { label: "Programa analítico ICSE (CBC) publicado por FFyB-UBA", url: "https://www.ffyb.uba.ar/wp-content/uploads/2024/08/03.-Programa-Analitico-de-Introduccion-al-Conocimiento-de-la-Sociedad-y-el-Estado-CBC.pdf" },
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

/** Unidad cuyo orden o alcance no se pudo confirmar contra el programa oficial. */
const unverified = (u: Unit): Unit => ({ ...u, needsVerification: true });

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
    unit("nivel-0", "Recuperando las bases", "Cómo estudiar matemática, signos, orden de operaciones, fracciones, porcentajes y potencias.", ["l-como-estudiar", "l-signos", "l-jerarquia", "l-fracciones", "l-porcentajes", "l-potencias"], ["t-signos", "t-jerarquia", "t-fracciones", "t-porcentajes", "t-potencias"], "🧮"),
    unit("nivel-1", "Álgebra básica", "Variables, expresiones, factorización, ecuaciones lineales y cuadráticas, despeje de fórmulas.", ["l-expresiones", "l-ecuaciones", "l-factorizacion", "l-cuadratica", "l-despeje"], ["t-expresiones", "t-ecuaciones", "t-factorizacion", "t-cuadratica", "t-despeje"], "⚖️"),
    unit("prep-geo", "Geometría y trigonometría", "Pitágoras, distancia entre puntos, seno, coseno, tangente, grados y radianes.", ["l-pitagoras", "l-trigonometria"], ["t-pitagoras", "t-trigonometria"], "📐"),
    unit("nivel-2", "Funciones", "Qué es una función, plano cartesiano, función lineal, dominio e imagen.", ["l-funciones", "l-recta", "l-dominio"], ["t-funciones", "t-recta", "t-dominio"], "📈"),
    unit("prep-uni", "Hacia la universidad", "La idea de límite y la derivada como pendiente: el puente al CBC.", ["l-limites", "l-derivadas"], ["t-limites", "t-derivadas"], "🎓"),
    unit("nivel-3", "Kit matemático para Física", "Unidades, notación científica, vectores y movimiento.", ["l-unidades", "l-vectores", "l-mru", "l-mruv"], ["t-unidades", "t-vectores", "t-mru", "t-mruv"], "🚀"),
    unit("nivel-4", "Pensar como programador", "Algoritmos, variables, condiciones y bucles con un lenguaje real (Python).", ["l-algoritmos", "l-condicionales", "l-bucles"], ["t-variables-codigo", "t-condicionales", "t-bucles"], "💻"),
  ],
  prerequisites: [],
  bibliography: [],
  official: official("verificado", [], "Sección propia de Ingenia (no es una materia oficial): diseñada para cubrir los prerrequisitos del CBC."),
  contentLevel: "partial",
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
    { ...unit("am-4", "Límites y continuidad", "Límite de funciones, indeterminaciones, asíntotas, continuidad.", ["l-limites"], ["t-limites"]), contentStatus: "parcial" },
    { ...unit("am-5", "Derivadas", "Definición, reglas de derivación, recta tangente.", ["l-derivadas"], ["t-derivadas"]), contentStatus: "parcial" },
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
    [SRC.mate66, { label: "Claves y resoluciones 2023 de la cátedra Cabana (1.er y 2.º parcial, recuperatorios y final; material aportado por el estudiante)" }],
    "Según las claves 2023 de la cátedra Cabana: el 1.er parcial evalúa límites, continuidad, derivadas y recta tangente, L'Hôpital, extremos y estudio de función; el 2.º, Taylor, series, primitivas, TFC e integrales/áreas. Las 11 unidades siguen la organización en prácticas del curso 66 relevada en fuentes secundarias; confirmar contra el programa vigente de la cátedra (cbc.uba.ar estaba inaccesible al momento de la carga).",
  ),
  contentLevel: "partial",
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
    unverified(unit("alg-con", "Conjuntos", "Definición por comprensión y por extensión, pertenencia, inclusión, unión, intersección, diferencia y complemento.")),
    unverified(unit("alg-cx", "Números complejos y polinomios", "Forma binómica y trigonométrica, operaciones, teorema de De Moivre; polinomios, división, raíces y factorización.")),
    { ...unit("alg-1", "Vectores en ℝ² y ℝ³", "Operaciones, norma, producto escalar, ángulo y ortogonalidad, producto vectorial y mixto.", ["l-vectores", "l-producto-escalar"], ["t-vectores", "t-producto-escalar"]), contentStatus: "parcial" },
    unverified(unit("alg-2", "Rectas y planos", "Ecuaciones vectoriales y paramétricas, posiciones relativas, proyección ortogonal, distancias de punto a recta y a plano.")),
    unverified(unit("alg-3", "Matrices y sistemas lineales", "Suma y producto de matrices, eliminación de Gauss-Jordan, rango, teorema de Rouché-Frobenius.")),
    unverified(unit("alg-4", "Determinantes", "Definición, propiedades, cálculo y aplicaciones.")),
    unit("alg-5", "Transformaciones lineales", "Forma matricial y funcional, imagen, núcleo, clasificación."),
    unit("alg-6", "Cónicas", "Circunferencia, parábola, elipse e hipérbola."),
  ],
  prerequisites: ["preparacion"],
  bibliography: [],
  official: official(
    "parcial",
    [SRC.cbcCarreras],
    "Unidades relevadas en programas de cátedra (fuentes secundarias): conjuntos; números complejos y polinomios; vectores, rectas y planos; matrices y sistemas; determinantes; transformaciones lineales; cónicas. El orden exacto depende de la cátedra y está marcado para verificar.",
  ),
  contentLevel: "partial",
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
    unit("fis-0", "Kit matemático para Física", "Despeje de fórmulas, unidades y notación científica.", ["l-despeje", "l-unidades"], ["t-despeje", "t-unidades"]),
    unit("fis-1", "Magnitudes físicas y vectores", "Magnitudes escalares y vectoriales, componentes, módulo, suma.", ["l-unidades", "l-vectores", "l-vec-componentes", "l-vec-operaciones"], ["t-unidades", "t-vectores", "t-vec-componentes", "t-vec-operaciones"]),
    unit("fis-est", "Estática", "Fuerzas, momento de una fuerza, cuerpos puntuales y extensos, centro de gravedad, condiciones de equilibrio.", ["l-estatica-particula", "l-momentos"], ["t-estatica-particula", "t-momentos"]),
    unit("fis-2", "Cinemática en una dimensión", "MRU, MRUV, caída libre y tiro vertical.", ["l-mru", "l-mruv", "l-caida-libre", "l-encuentro", "l-frenado-persecucion", "l-graficos-vt"], ["t-mru", "t-mruv", "t-caida-libre", "t-encuentro", "t-frenado", "t-graficos-vt"]),
    unit("fis-2d", "Cinemática en dos dimensiones", "Movimiento vectorial en el plano, tiro oblicuo, aceleración tangencial y normal, movimiento circular, movimiento relativo.", ["l-tiro-oblicuo", "l-tiro-altura"], ["t-tiro-oblicuo", "t-tiro-altura"]),
    unit("fis-3", "Dinámica", "Fuerzas y leyes de Newton, rozamiento, planos inclinados, movimiento circular.", ["l-newton", "l-plano-inclinado", "l-vinculados"], ["t-newton", "t-plano-inclinado", "t-vinculados"]),
    unverified(unit("fis-osc", "Movimiento oscilatorio", "Movimiento armónico simple.")),
    unit("fis-4", "Trabajo y energía", "Trabajo, energía cinética y potencial, conservación, potencia.", ["l-trabajo-energia", "l-resorte-potencia"], ["t-energia", "t-resorte-potencia"]),
    unit("fis-5", "Hidrostática", "Densidad, presión, principio de Pascal, teorema fundamental, Arquímedes.", ["l-presion-pascal", "l-arquimedes"], ["t-presion", "t-arquimedes"]),
  ],
  prerequisites: ["preparacion"],
  bibliography: [{ label: "Guías de la cátedra de Física del CBC", url: SRC.fisicaCbc.url }],
  official: official(
    "parcial",
    [SRC.fisicaCbc, { label: "Claves de corrección 2023 de la cátedra Torti (UBA XXI): 1.er y 2.º parcial, recuperatorios y final (material aportado por el estudiante)" }],
    "Según las claves 2023 de la cátedra Torti: el 1.er parcial evalúa vectores, cinemática en una dimensión, estática (partícula y cuerpo rígido) e hidrostática; el 2.º, caída libre, tiro oblicuo, dinámica con rozamiento, cuerpos vinculados y trabajo-energía; el final, problemas integradores. Movimiento circular y oscilatorio no aparecieron evaluados. Otras cátedras pueden ordenar distinto. El kit matemático es un repaso agregado por Ingenia.",
  ),
  contentLevel: "partial",
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
    unit("pc-1", "Introducción a la algoritmia y la programación", "Qué es un algoritmo, variables, asignación, secuencia.", ["l-algoritmos"], ["t-variables-codigo"]),
    unverified(unit("pc-tipos", "Tipos de datos, expresiones y funciones", "Números, cadenas y booleanos, operadores, definición y uso de funciones.", ["l-pc-tipos", "l-pc-div-mod", "l-pc-funciones"], ["t-pc-tipos", "t-pc-aritmetica", "t-pc-funciones"])),
    { ...unit("pc-2", "Estructuras de control: condicionales", "if / elif / else, expresiones booleanas.", ["l-condicionales", "l-pc-booleanos"], ["t-condicionales", "t-pc-booleanos", "t-pc-condicionales"]), needsVerification: true },
    { ...unit("pc-3", "Estructuras de control: repetición", "Bucles for y while, acumuladores y contadores.", ["l-bucles", "l-pc-traza", "l-pc-dibujos"], ["t-bucles", "t-pc-ciclos", "t-pc-traza", "t-pc-dibujos"]), needsVerification: true },
    unit("pc-datos", "Estructuras de datos", "Listas, tuplas, diccionarios y cadenas de texto.", ["l-pc-strings", "l-pc-metodos-str", "l-pc-listas", "l-pc-tuplas", "l-pc-dicts"], ["t-pc-strings", "t-pc-metodos-str", "t-pc-listas", "t-pc-tuplas", "t-pc-dicts"]),
    unit("pc-io", "Entrada y salida", "Lectura de datos y archivos.", ["l-pc-print"], ["t-pc-print"]),
    unit("pc-libs", "Bibliotecas de Python", "NumPy, Pandas y Matplotlib para cálculo y gráficos."),
  ],
  prerequisites: ["preparacion"],
  bibliography: [],
  official: official(
    "parcial",
    [SRC.pcCreacion, SRC.cbcNueva, SRC.pcSitio],
    "Materia del CBC obligatoria para ingresantes a FIUBA desde 2023. Se programa en Python. Unidades relevadas en el programa de UBA XXI (fuente secundaria): algoritmia y programación; tipos de datos, expresiones y funciones; estructuras de datos; entrada/salida; bibliotecas. La ubicación de las estructuras de control está marcada para verificar.",
  ),
  contentLevel: "partial",
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
  contentLevel: "draft",
});

export const IPC: Subject = {
  ...pendingSubject("ipc", "Introducción al Pensamiento Científico", "IPC", "🔬", "humanities", "Cómo se argumenta, cómo cambia la ciencia y qué responsabilidades tiene: lógica, la revolución darwiniana, epistemología y ética."),
  objectives: [
    "Reconocer y evaluar argumentos deductivos e inductivos.",
    "Distinguir tipos de enunciados, condiciones de verdad y condiciones necesarias y suficientes.",
    "Comprender la revolución darwiniana y su impacto en el modo de concebir la ciencia y el mundo.",
    "Conocer y abordar críticamente las corrientes epistemológicas (empirismo lógico, falsacionismo, Kuhn, epistemología feminista).",
    "Problematizar la dimensión ético-política de la práctica científica.",
  ],
  units: [
    unit("ipc-u1", "La argumentación", "Discurso argumentativo, estructura de un argumento, enunciados y condiciones de verdad, condiciones necesarias y suficientes, validez, formas válidas y reglas de inferencia, argumentos inductivos y su evaluación.", [], [], "🧩"),
    unit("ipc-u2", "La ciencia y su historia", "La revolución darwiniana: creacionismo y fijismo, Lamarck, Darwin y la selección natural, actualidad.", [], [], "🐢"),
    unit("ipc-u3", "El cambio científico", "Estructura de las teorías y contrastación de hipótesis, positivismo lógico, falsacionismo, explicación científica, Kuhn, ciencia y género.", [], [], "🔄"),
    unit("ipc-u4", "La dimensión ético-política de la ciencia", "Ética de la investigación y de los usos de la ciencia, responsabilidad, cientificismo y anti-cientificismo, políticas científicas.", [], [], "⚖️"),
  ],
  official: official(
    "verificado",
    [{ label: "Programa analítico IPC (040) 2026 — UBA XXI, Cátedra A (aportado por el estudiante)" }, SRC.ipc2026],
    "Unidades tomadas textualmente del programa 2026 de UBA XXI (Cátedra A, bibliografía: Desenredando la ciencia, Eudeba 2022). En el CBC presencial otras cátedras usan programas distintos: si cursás en otra, avisá y se agrega su programa. El programa no dice qué unidades entran en cada parcial; las claves 2024 sugieren 1.er parcial = U1 + U2 y 2.º parcial = U3 + U4.",
  ),
  contentLevel: "partial",
};
export const ICSE: Subject = {
  ...pendingSubject("icse", "Introducción al Conocimiento de la Sociedad y el Estado", "ICSE", "🏛️", "humanities", "Sociedad, Estado y su relación a lo largo del tiempo, con perspectivas histórica, sociológica y política."),
  units: [
    unit("icse-1", "Sociedad", "Conceptos básicos, estratificación, orden, cooperación y conflicto, actores sociopolíticos, desigualdad, transformaciones contemporáneas."),
    unit("icse-2", "El Estado", "Definiciones y tipos, origen y evolución, formación del Estado argentino, ciudadanía, regímenes políticos, instituciones democráticas."),
    unit("icse-3", "Estado y desarrollo socioeconómico", "Políticas públicas en economía, infraestructura, salud, ciencia, tecnología y educación."),
  ],
  official: official("parcial", [SRC.icseProg], "Tres ejes de los contenidos mínimos del programa analítico. Los contenidos específicos, autores y períodos dependen de la cátedra."),
  contentLevel: "draft",
};
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
  contentLevel: "draft",
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
    planVersion: "2023",
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
    planVersion: "2023 (mod. 2024)",
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
