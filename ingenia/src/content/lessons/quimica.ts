import type { BoardStep, Lesson } from "@/engine/types";
import { board, example, explain, intro, practice, quiz, summary } from "./helpers";

/**
 * Lecciones de Química (CBC). Convenciones de toda la materia: masas atómicas
 * redondeadas (H 1, C 12, N 14, O 16, Na 23, Cl 35,5…), R = 0,082 atm·L/(mol·K),
 * T(K) = T(°C) + 273, volumen molar en CNPT 22,4 L/mol, N_A = 6,02·10²³.
 */
const S = "quimica";

// ═══════════════════════════ qui-u1: Sistemas materiales ═══════════════════════════

const sistemasBoard: BoardStep[] = [
  { expr: "agua + sal disuelta + arena + hielo", note: "datos: ¿qué se ve y qué hay?" },
  { expr: "fases: (agua + sal) | arena | hielo = 3", note: "lo disuelto va dentro de la fase líquida" },
  { expr: "componentes: agua, sal, arena = 3", note: "el hielo es agua: no suma componente" },
  { expr: "δ = m / V = 54 g / 20 cm³ = 2,7 g/cm³", note: "densidad de la arena (dato aparte)" },
];

export const quiSistemasLesson: Lesson = {
  id: "l-qui-sistemas",
  title: "Sistemas materiales",
  subtitle: "Fases, componentes, densidad y composición de una mezcla",
  subjectId: S,
  topicIds: ["t-qui-sistemas"],
  estimatedMinutes: 10,
  prerequisites: ["t-porcentajes", "t-unidades"],
  cards: [
    intro(
      "Mirar la materia como un químico",
      "Clasificar un sistema (heterogéneo, solución, sustancia simple o compuesta), contar fases y componentes, y calcular densidad y composición porcentual.",
      "Es el vocabulario con el que empieza toda la materia: si confundís fase con componente, después se mezcla todo.",
    ),
    explain(
      "Fases y componentes: dos preguntas distintas",
      "Pensá en un vaso con agua, hielo y arena.\n\n**¿Cuántas cosas distintas VES?** Agua líquida, hielo, arena: 3 **fases** (porciones separadas por una superficie).\n\n**¿Cuántas SUSTANCIAS hay?** Agua y arena: 2 **componentes** (el hielo también es agua).\n\nSi echás sal y se disuelve, no ves nada nuevo (misma cantidad de fases), pero hay un componente más.",
      { tag: "cotidiano" },
    ),
    quiz("Para pensar", {
      id: "q-qui-sistemas-1",
      subjectId: S,
      topicId: "t-qui-sistemas",
      prompt: "Agua con azúcar totalmente disuelta y dos cubitos de hielo. ¿Cuántas fases hay?",
      options: ["2", "3", "1"],
      answer: 0,
      explanation: "Fase líquida (agua + azúcar disuelta) y fase sólida (hielo): 2 fases. Lo disuelto no forma una fase aparte.",
      hints: ["¿El azúcar disuelto se ve?", "Lo disuelto forma parte de la fase líquida.", "El hielo sí se distingue: es otra fase."],
      errors: {
        1: ["conceptual", "Contaste el azúcar disuelto como fase. Si está totalmente disuelto no se distingue: es parte de la solución."],
        2: ["conceptual", "El hielo es agua, pero en otro estado: se distingue del líquido, así que es otra fase."],
      },
    }),
    explain(
      "Clasificación y dos cuentas",
      "• **Heterogéneo**: 2 o más fases.\n• **Solución**: 1 fase, 2 o más componentes.\n• **Sustancia simple**: 1 componente de un solo elemento ($O_2$, Fe).\n• **Sustancia compuesta**: 1 componente de varios elementos ($H_2O$).\n\nDensidad: $δ = \\frac{m}{V}$ (propiedad intensiva). Composición de una mezcla: $\\%_i = \\frac{m_i}{m_{total}}·100$.",
      { tag: "matematico", widget: { type: "percent", base: 80, percent: 25 } },
    ),
    board("Pizarra: fases, componentes y densidad", sistemasBoard, "Agua con sal disuelta, arena y hielo. Aparte: 54 g de arena ocupan 20 cm³."),
    example(
      "Composición de una mezcla",
      "Una mezcla tiene 12 g de arena, 6 g de sal y 2 g de limaduras de hierro. ¿Qué % en masa de sal tiene?",
      ["Masa total: 12 + 6 + 2 = 20 g", "% sal = 6 / 20 · 100", "= 30 %"],
      "30 % de sal",
    ),
    practice("Ejercicio guiado", "qui-fases-componentes", 1, 3, true),
    explain(
      "El error típico: mezclar los dos conteos",
      "• Lo **disuelto** suma componente, **no** fase.\n• El **hielo** con agua suma fase, **no** componente.\n• En densidad, mirá las unidades: si $δ$ está en g/cm³ y el volumen en litros, primero pasá a cm³ (1 L = 1000 cm³).\n• El porcentaje se calcula sobre el **total**, no sobre otro componente.",
      { tag: "cotidiano" },
    ),
    practice("Tu turno", "qui-sistemas-clasificar", 2, 5),
    practice("Tu turno", "qui-densidad", 3, 8),
    practice("Desafío", "qui-mezcla-porcentaje", 5, 12),
    summary([
      "Fase: porción con propiedades uniformes separada por interfases. Componente: cada sustancia.",
      "Heterogéneo: 2+ fases. Solución: 1 fase y 2+ componentes.",
      "Sustancia simple: un elemento. Compuesta: 2+ elementos combinados.",
      "δ = m/V, con unidades coherentes (1 L = 1000 cm³).",
      "% de un componente = masa del componente / masa total · 100.",
    ]),
  ],
  tutor: {
    normal: "Un sistema material es la porción de materia que se aísla para estudiarla. Se clasifica por la cantidad de fases (homogéneo o heterogéneo) y por la cantidad de componentes (sustancia pura o mezcla). Las sustancias puras pueden ser simples (un elemento) o compuestas. La densidad δ = m/V es una propiedad intensiva y sirve para identificar sustancias.",
    simple: "Fases = lo que se ve separado. Componentes = las sustancias distintas que hay. Si algo está disuelto, no se ve pero cuenta como componente. Densidad = masa dividida volumen.",
    nino: "Pensá en una ensalada de frutas: ves pedazos distintos (como fases) y cada fruta es un ingrediente (como componentes). Un jugo licuado se ve parejo (una fase) aunque tenga varias frutas: eso es una solución.",
    ejemplo: "Agua + aceite + sal disuelta: fases = 2 (agua salada y aceite); componentes = 3 (agua, aceite, sal).",
    visual: { type: "percent", base: 200, percent: 15 },
    visualText: "El porcentaje de un componente es la parte sobre el total: probá cambiar el total y el porcentaje.",
    fromZero: "Todo lo que tiene masa y ocupa lugar es materia. Cuando miramos un pedazo de materia preguntamos dos cosas: ¿se ve igual en todas partes? (si no, tiene varias fases) y ¿está hecha de una sola sustancia o de varias? (componentes). Con esas dos respuestas la clasificamos.",
    why: "Clasificar el sistema define qué métodos sirven para separarlo (filtrar, decantar, destilar) y qué cuentas tienen sentido. Además, densidad y composición son las primeras magnitudes que vas a usar en toda la materia.",
    origin: "La densidad sale de comparar cuánta masa hay en cada unidad de volumen: si un cubo de 1 cm³ de aluminio pesa 2,7 g, su densidad es 2,7 g/cm³, y V cm³ pesan 2,7·V gramos. El porcentaje en masa es una proporción: parte/total escalada a 100.",
    board: sistemasBoard,
  },
};

// ═══════════════════════════ qui-u2: Estructura atómica ═══════════════════════════

const atomoBoard: BoardStep[] = [
  { expr: "S²⁻: Z = 16, A = 34", note: "datos: ion sulfuro" },
  { expr: "p⁺ = Z = 16", note: "los protones definen el elemento" },
  { expr: "n = A − Z = 34 − 16 = 18", note: "neutrones" },
  { expr: "e⁻ = Z − carga = 16 − (−2) = 18", note: "un anión GANÓ electrones" },
];

export const quiAtomoLesson: Lesson = {
  id: "l-qui-atomo",
  title: "El átomo por dentro",
  subtitle: "Protones, neutrones, electrones, iones e isótopos",
  subjectId: S,
  topicIds: ["t-qui-atomo"],
  estimatedMinutes: 10,
  prerequisites: ["t-porcentajes"],
  cards: [
    intro(
      "Contar partículas",
      "Usar Z (número atómico) y A (número másico) para contar protones, neutrones y electrones de átomos e iones, y calcular la masa atómica promedio a partir de los isótopos.",
      "Es la base para entender la tabla periódica, las uniones y por qué la masa del cloro es 35,5 y no un número entero.",
    ),
    explain(
      "Un núcleo chiquito y una nube",
      "El átomo es casi todo vacío: un **núcleo** con protones (+) y neutrones (sin carga), y alrededor los **electrones** (−).\n\nLos protones son el **DNI** del elemento: todo átomo con 6 protones es carbono. Los neutrones pueden variar (**isótopos**) y los electrones se pueden ganar o perder (**iones**) sin dejar de ser carbono.",
      { tag: "intuitivo" },
    ),
    quiz("Para pensar", {
      id: "q-qui-atomo-1",
      subjectId: S,
      topicId: "t-qui-atomo",
      prompt: "El ion $Mg^{2+}$ (Z = 12). ¿Cuántos electrones tiene?",
      options: ["10", "14", "12"],
      answer: 0,
      explanation: "Carga +2 significa que perdió 2 electrones: 12 − 2 = 10.",
      hints: ["Neutro tendría Z electrones.", "Carga positiva = faltan electrones.", "e⁻ = Z − carga."],
      errors: {
        1: ["signos", "Al revés: un catión (+) PERDIÓ electrones, no ganó."],
        2: ["conceptual", "12 tiene el átomo neutro. El ion tiene carga: cambió su número de electrones."],
      },
    }),
    explain(
      "Las fórmulas",
      "• Protones $= Z$.\n• Neutrones $= A − Z$.\n• Electrones $= Z − q$ (q = carga del ion, con signo).\n\nMasa atómica promedio de un elemento con isótopos de masas $m_1, m_2$ y abundancias $\\%_1, \\%_2$:\n\n$\\bar{M} = \\frac{m_1·\\%_1 + m_2·\\%_2}{100}$",
      { tag: "matematico", widget: { type: "percent", base: 35, percent: 76 } },
    ),
    board("Pizarra: partículas de un ion", atomoBoard, "Contamos las partículas del ion sulfuro-34."),
    example(
      "Masa atómica del cloro",
      "El cloro tiene Cl-35 (75,77 %) y Cl-37 (24,23 %). Tomando como masa el número másico, ¿cuál es su masa atómica promedio?",
      ["$\\bar{M} = (35 · 75,77 + 37 · 24,23) / 100$", "$= (2651,95 + 896,51) / 100$", "$= 35,48$ u"],
      "≈ 35,48 u (la tabla dice 35,45: la diferencia es porque las masas reales no son exactamente enteras)",
    ),
    practice("Ejercicio guiado", "qui-particulas-subatomicas", 1, 2, true),
    explain(
      "Errores típicos",
      "• **Signo de la carga**: $Fe^{3+}$ tiene 26 − 3 = 23 electrones; $Cl^-$ tiene 17 + 1 = 18.\n• **A no son los neutrones**: A = protones + neutrones.\n• **Promedio ponderado, no simple**: el isótopo más abundante «tira» el promedio hacia su masa. Si el resultado no queda entre las dos masas, algo salió mal.",
      { tag: "cotidiano" },
    ),
    practice("Tu turno", "qui-particulas-subatomicas", 3, 6),
    practice("Tu turno", "qui-isotopos-promedio", 2, 9),
    practice("Desafío", "qui-isotopos-promedio", 5, 14),
    summary([
      "Z = protones (identifica al elemento). A = protones + neutrones.",
      "Neutrones = A − Z. Electrones = Z − carga.",
      "Catión (+): perdió electrones. Anión (−): ganó electrones.",
      "Isótopos: mismo Z, distinto A.",
      "Masa atómica = promedio ponderado por la abundancia de los isótopos.",
    ]),
  ],
  tutor: {
    normal: "El átomo consta de un núcleo con Z protones y A − Z neutrones, rodeado de electrones. En un átomo neutro hay Z electrones; un ion de carga q tiene Z − q. Los isótopos de un elemento comparten Z y difieren en A; la masa atómica tabulada es el promedio ponderado de las masas isotópicas según su abundancia natural.",
    simple: "Protones = Z. Neutrones = A menos Z. Electrones = Z, corregido por la carga: si es positiva, restás; si es negativa, sumás.",
    nino: "Es como un equipo de fútbol: los protones son la camiseta (dicen de qué equipo sos), los neutrones son suplentes que pueden variar y los electrones son hinchas que van y vienen: si se van dos, el equipo queda «+2».",
    ejemplo: "Na⁺ (Z = 11, A = 23): 11 protones, 12 neutrones, 10 electrones.",
    visual: { type: "percent", base: 37, percent: 24 },
    visualText: "Cada isótopo aporta su masa multiplicada por su porcentaje de abundancia.",
    fromZero: "Toda la materia está hecha de átomos. Cada átomo tiene partículas positivas (protones) y neutras (neutrones) en el centro, y negativas (electrones) alrededor. Para saber cuántas hay de cada una alcanzan tres datos: Z, A y la carga.",
    why: "Los electrones deciden cómo se une un átomo con otros; los protones, qué elemento es; y los neutrones, su masa. Contarlos bien es el punto de partida de toda la química.",
    origin: "A cuenta las partículas pesadas del núcleo (protones y neutrones pesan casi lo mismo, 1 u cada uno), por eso A − Z son los neutrones. La carga neta es protones − electrones, así que electrones = Z − q. El promedio ponderado sale de pensar en 100 átomos: %₁ tienen masa m₁ y %₂ masa m₂.",
    board: atomoBoard,
  },
};

const tablaBoard: BoardStep[] = [
  { expr: "Cl: Z = 17", note: "repartimos 17 electrones" },
  { expr: "1s² 2s² 2p⁶ 3s² 3p⁵", note: "orden de llenado: 1s 2s 2p 3s 3p 4s 3d…" },
  { expr: "nivel más alto: n = 3", note: "→ período 3" },
  { expr: "valencia: 3s² 3p⁵ = 7 e⁻", note: "bloque p: grupo = 10 + 7 = 17" },
];

export const quiTablaLesson: Lesson = {
  id: "l-qui-tabla",
  title: "Configuración electrónica y tabla periódica",
  subtitle: "Dónde está cada elemento y qué propiedades cambian",
  subjectId: S,
  topicIds: ["t-qui-tabla"],
  estimatedMinutes: 11,
  prerequisites: ["t-qui-atomo"],
  cards: [
    intro(
      "Ordenar los electrones",
      "Escribir la configuración electrónica con la regla de las diagonales, ubicar período y grupo, y predecir radio, electronegatividad, energía de ionización y carácter metálico.",
      "La tabla periódica es un «mapa» de las configuraciones: si sabés leerla, predecís cómo va a reaccionar un elemento sin memorizar.",
    ),
    explain(
      "Un edificio con pisos y departamentos",
      "Los electrones ocupan **niveles** (pisos: 1, 2, 3…) divididos en **subniveles** (departamentos s, p, d) con capacidad fija: s → 2, p → 6, d → 10.\n\nSe llenan de menor a mayor energía. Ojo: el 4s se llena **antes** que el 3d, como un departamento del 4.º piso más barato que uno del 3.º.",
      { tag: "cotidiano" },
    ),
    quiz("Para pensar", {
      id: "q-qui-tabla-1",
      subjectId: S,
      topicId: "t-qui-tabla",
      prompt: "¿Cuál es la configuración del sodio (Z = 11)?",
      options: ["$1s^2 2s^2 2p^6 3s^1$", "$1s^2 2s^2 2p^7$", "$1s^2 2s^2 2p^6 3s^2$"],
      answer: 0,
      explanation: "2 + 2 + 6 = 10 electrones llenan hasta 2p; el electrón 11 va al 3s: 3s¹.",
      hints: ["La suma de los exponentes debe dar 11.", "Un subnivel p admite como máximo 6.", "Después de 2p sigue 3s."],
      errors: {
        1: ["conceptual", "Un subnivel p tiene capacidad máxima de 6 electrones."],
        2: ["calculo", "Esa configuración tiene 12 electrones (es la del magnesio)."],
      },
    }),
    explain(
      "Leer la tabla",
      "• **Período** = nivel más alto ocupado.\n• **Grupo** (1–18): bloque s → n.º de electrones de valencia; bloque p → 10 + electrones de valencia.\n\n**Tendencias:**\n• Radio y carácter metálico: crecen **hacia abajo** y **hacia la izquierda**.\n• Electronegatividad y energía de ionización: crecen **hacia arriba** y **hacia la derecha** (el flúor es el más electronegativo).",
      { tag: "matematico" },
    ),
    board("Pizarra: del Z a la ubicación", tablaBoard, "Ubicamos el cloro en la tabla a partir de su configuración."),
    example(
      "Comparar radios",
      "Ordená de menor a mayor radio: K, Na, Li (los tres del grupo 1).",
      ["Están en el mismo grupo: comparamos el período", "Li (período 2), Na (3), K (4)", "Bajando se agregan niveles: el radio crece"],
      "Li < Na < K",
    ),
    practice("Ejercicio guiado", "qui-configuracion-electronica", 1, 4, true),
    explain(
      "Errores típicos",
      "• Llenar **3d antes que 4s**: el potasio es $…3p^6 4s^1$, no $…3p^6 3d^1$.\n• Confundir **período y grupo**.\n• **Invertir tendencias**: un átomo más grande retiene peor a sus electrones externos, así que su energía de ionización y su electronegatividad son MENORES.",
      { tag: "cotidiano" },
    ),
    practice("Tu turno", "qui-tendencias-periodicas", 2, 7),
    practice("Tu turno", "qui-configuracion-electronica", 4, 10),
    practice("Desafío", "qui-tendencias-periodicas", 5, 15),
    summary([
      "Capacidades: s → 2, p → 6, d → 10. Orden: 1s 2s 2p 3s 3p 4s 3d 4p.",
      "Período = nivel más alto; grupo = electrones de valencia (bloque p: +10).",
      "Radio y carácter metálico: ↓ y ←.",
      "Electronegatividad y energía de ionización: ↑ y →.",
    ]),
  ],
  tutor: {
    normal: "La configuración electrónica describe la distribución de los electrones en subniveles, llenados en orden creciente de energía (regla de las diagonales o de Madelung) y respetando su capacidad. La posición en la tabla periódica refleja la configuración: el período corresponde al número cuántico principal más alto y el grupo, a los electrones de valencia. De ahí surgen las propiedades periódicas.",
    simple: "Llenás los electrones en orden: 1s, 2s, 2p, 3s, 3p, 4s, 3d… El último nivel da la fila (período); los electrones del último nivel dan la columna (grupo).",
    nino: "Es como ubicar gente en un cine: primero se llenan las filas de adelante. La última fila ocupada te dice el período, y cuántos hay sentados en esa fila te dice el grupo.",
    ejemplo: "Oxígeno (Z = 8): 1s² 2s² 2p⁴ → período 2, 6 electrones de valencia, grupo 16.",
    fromZero: "Los electrones no están en cualquier lado: ocupan «lugares» con distinta energía. Primero ocupan los de menor energía. Escribir la configuración es anotar cuántos electrones hay en cada lugar, como un inventario.",
    why: "Los electrones del último nivel son los que participan en las reacciones. Por eso los elementos de un mismo grupo (misma cantidad de electrones de valencia) se comportan parecido.",
    origin: "El orden de llenado sale de la energía de cada subnivel, que depende de n + l (regla de Madelung): 4s (4 + 0 = 4) tiene menos energía que 3d (3 + 2 = 5). Las tendencias salen de dos efectos: más niveles alejan los electrones (radio mayor) y más protones en el mismo nivel los atraen más (radio menor).",
    board: tablaBoard,
  },
};

// ═══════════════════════════ qui-u3: Uniones químicas ═══════════════════════════

const unionesBoard: BoardStep[] = [
  { expr: "MgO:  EN(Mg) = 1,31;  EN(O) = 3,44", note: "datos" },
  { expr: "ΔEN = 3,44 − 1,31 = 2,13", note: "diferencia de electronegatividad" },
  { expr: "2,13 ≥ 1,7", note: "metal + no metal, diferencia grande" },
  { expr: "Mg²⁺ O²⁻  →  unión iónica", note: "el Mg cede 2 electrones al O" },
];

export const quiUnionesLesson: Lesson = {
  id: "l-qui-uniones",
  title: "Uniones químicas",
  subtitle: "Iónica, covalente (polar o no polar) y metálica",
  subjectId: S,
  topicIds: ["t-qui-uniones"],
  estimatedMinutes: 9,
  prerequisites: ["t-qui-tabla"],
  cards: [
    intro(
      "Cómo se pegan los átomos",
      "Distinguir unión iónica, covalente polar, covalente no polar y metálica usando la diferencia de electronegatividad.",
      "El tipo de unión explica por qué la sal es un sólido duro que funde a 801 °C y el oxígeno es un gas.",
    ),
    explain(
      "Una cinchada por los electrones",
      "La **electronegatividad** es la fuerza con que un átomo tira de los electrones de la unión.\n\n• Fuerzas iguales → se comparten parejo: **covalente no polar** ($Cl_2$).\n• Uno tira más → se comparten corridos: **covalente polar** ($HCl$).\n• Uno tira muchísimo más → se los queda: se forman iones, **unión iónica** ($NaCl$).\n• Entre metales: electrones compartidos por todos, como un «mar»: **metálica**.",
      { tag: "intuitivo" },
    ),
    quiz("Para pensar", {
      id: "q-qui-uniones-1",
      subjectId: S,
      topicId: "t-qui-uniones",
      prompt: "¿Qué tipo de unión hay en $O_2$?",
      options: ["Covalente no polar", "Covalente polar", "Iónica"],
      answer: 0,
      explanation: "Dos átomos iguales tienen la misma electronegatividad (ΔEN = 0): comparten los electrones de forma pareja.",
      hints: ["¿Los dos átomos son iguales?", "Si son iguales, ¿quién tira más?", "ΔEN = 0 → no polar."],
      errors: {
        1: ["conceptual", "Para que sea polar, un átomo tiene que tirar más que el otro. Acá son idénticos."],
        2: ["conceptual", "La unión iónica necesita una gran diferencia de electronegatividad (metal + no metal)."],
      },
    }),
    explain(
      "Criterio con números",
      "Calculá $ΔEN = |EN_A − EN_B|$ (escala de Pauling). Un criterio orientativo muy usado:\n\n• $ΔEN < 0,4$ → covalente no polar\n• $0,4 ≤ ΔEN < 1,7$ → covalente polar\n• $ΔEN ≥ 1,7$ → iónica\n• metal con metal → metálica\n\nEs un criterio aproximado: los límites cambian un poco según el libro. Si tu cátedra usa otro, seguí el suyo.",
      { tag: "matematico" },
    ),
    board("Pizarra: clasificar MgO", unionesBoard),
    example(
      "Agua",
      "¿Qué tipo de unión es O–H en el agua? EN(H) = 2,20; EN(O) = 3,44.",
      ["ΔEN = 3,44 − 2,20 = 1,24", "0,4 ≤ 1,24 < 1,7", "Covalente polar: el par de electrones está corrido hacia el O"],
      "Covalente polar",
    ),
    practice("Ejercicio guiado", "qui-tipo-union", 1, 3, true),
    explain(
      "Error típico: enlace vs molécula",
      "En $CO_2$ cada enlace C=O es **polar** (ΔEN = 0,89), pero la **molécula** es no polar porque es lineal y simétrica: los dos dipolos se anulan.\n\nUna cosa es el tipo de **enlace** (esta lección) y otra la polaridad de la **molécula** (depende de la geometría, lo ves en fuerzas intermoleculares).",
      { tag: "cotidiano" },
    ),
    practice("Tu turno", "qui-tipo-union", 3, 8),
    practice("Tu turno", "qui-tipo-union", 4, 11),
    practice("Desafío", "qui-tipo-union", 6, 17),
    summary([
      "Electronegatividad: cuánto tira un átomo de los electrones de la unión.",
      "ΔEN chico → covalente no polar; intermedio → polar; grande → iónica.",
      "Metal + metal → unión metálica.",
      "No confundas la polaridad del enlace con la de la molécula.",
    ]),
  ],
  tutor: {
    normal: "Los átomos se unen para alcanzar configuraciones más estables. Si la diferencia de electronegatividad es grande, hay transferencia de electrones y se forman iones que se atraen (unión iónica). Si es moderada o nula, los electrones se comparten (covalente polar o no polar). Entre metales, los electrones de valencia quedan deslocalizados en la red (unión metálica).",
    simple: "Restá las electronegatividades. Si da casi cero, comparten parejo (no polar). Si da intermedio, comparten corrido (polar). Si da mucho, uno se queda los electrones (iónica).",
    nino: "Es una cinchada: si los dos tiran igual, la soga queda en el medio (no polar); si uno es un poco más fuerte, la soga se corre (polar); si uno es mucho más fuerte, se lleva la soga (iónica).",
    ejemplo: "KCl: ΔEN = 3,16 − 0,82 = 2,34 → iónica. NH₃: ΔEN = 3,04 − 2,20 = 0,84 → covalente polar.",
    fromZero: "Los átomos tienen electrones afuera que pueden compartir o ceder. Que dos átomos queden «pegados» es justamente eso: una unión química. Para saber de qué tipo es, comparamos cuánto atrae cada átomo a esos electrones.",
    why: "El tipo de unión determina las propiedades: los compuestos iónicos son sólidos de alto punto de fusión que conducen fundidos; los covalentes suelen ser gases o líquidos; los metales conducen la electricidad.",
    origin: "La electronegatividad de Pauling se construyó comparando energías de enlace: cuanto más distintas son dos electronegatividades, más carácter iónico tiene la unión. Los cortes 0,4 y 1,7 son convenciones que dividen ese continuo.",
    board: unionesBoard,
  },
};

const nomenclaturaBoard: BoardStep[] = [
  { expr: "H₂SO₄:  2·(+1) + x + 4·(−2) = 0", note: "la suma de los números de oxidación es 0" },
  { expr: "2 + x − 8 = 0", note: "operamos" },
  { expr: "x = +6", note: "número de oxidación del S" },
  { expr: "Al³⁺ + SO₄²⁻ → Al₂(SO₄)₃", note: "cruzamos cargas: 2·(+3) + 3·(−2) = 0" },
];

export const quiNomenclaturaLesson: Lesson = {
  id: "l-qui-nomenclatura",
  title: "Números de oxidación y fórmulas",
  subtitle: "La contabilidad de cargas detrás de cada fórmula",
  subjectId: S,
  topicIds: ["t-qui-nomenclatura"],
  estimatedMinutes: 10,
  prerequisites: ["t-qui-uniones", "t-signos", "t-ecuaciones"],
  cards: [
    intro(
      "Escribir y leer fórmulas",
      "Calcular el número de oxidación de un elemento en un compuesto o ion, y armar la fórmula de un compuesto iónico a partir de sus iones y su nombre.",
      "Sin fórmulas correctas no se puede balancear ni hacer estequiometría: un subíndice mal puesto cambia la sustancia.",
    ),
    explain(
      "Una cuenta que siempre cierra",
      "El **número de oxidación** es la carga que tendría cada átomo si todas sus uniones fueran iónicas. Es contabilidad: la suma de todos tiene que dar la carga total.\n\nReglas de base: H = +1, O = −2, metales alcalinos (Na, K) = +1, elementos sin combinar = 0. Lo que falta se despeja.",
      { tag: "intuitivo" },
    ),
    quiz("Para pensar", {
      id: "q-qui-nomen-1",
      subjectId: S,
      topicId: "t-qui-nomenclatura",
      prompt: "¿Cuál es el número de oxidación del N en $HNO_3$?",
      options: ["+5", "+3", "−5"],
      answer: 0,
      explanation: "+1 + x + 3·(−2) = 0 ⇒ x = +5.",
      hints: ["La suma debe dar 0 (es neutro).", "H aporta +1 y cada O −2.", "1 + x − 6 = 0."],
      errors: {
        1: ["conceptual", "Ese sería el del N en HNO₂ (2 oxígenos). Acá hay 3: multiplicá −2 por 3."],
        2: ["signos", "Revisá el despeje: x = 6 − 1 = +5."],
      },
    }),
    explain(
      "La regla general y la fórmula de un compuesto iónico",
      "En una especie de carga q: $\\sum (\\text{subíndice} · \\text{n.º de oxidación}) = q$.\n\nPara un compuesto iónico, el total de cargas debe ser 0: si el catión tiene carga $+a$ y el anión $−b$, la fórmula es $C_bA_a$ simplificada. Si el ion es poliatómico y lleva subíndice, va entre paréntesis: $Ca(NO_3)_2$.",
      { tag: "matematico" },
    ),
    board("Pizarra: número de oxidación y fórmula", nomenclaturaBoard),
    example(
      "Ion dicromato",
      "¿Cuál es el número de oxidación del Cr en $Cr_2O_7^{2-}$?",
      ["Suma = carga del ion: $2x + 7·(−2) = −2$", "$2x − 14 = −2$", "$2x = 12$ ⇒ $x = +6$"],
      "Cr: +6",
    ),
    practice("Ejercicio guiado", "qui-numero-oxidacion", 1, 5, true),
    explain(
      "Errores típicos",
      "• **Olvidar el subíndice**: en $H_2SO_4$ los 4 oxígenos aportan −8, no −2.\n• **Iones**: la suma da la carga, no 0.\n• **Paréntesis**: $Al_2(SO_4)_3$ tiene 12 oxígenos. Escribir $Al_2SO_{43}$ es otra cosa (y no existe).\n• **Simplificar**: $Ca_2O_2$ se escribe $CaO$.",
      { tag: "cotidiano" },
    ),
    practice("Tu turno", "qui-formula-compuesto", 2, 6),
    practice("Tu turno", "qui-numero-oxidacion", 4, 9),
    practice("Desafío", "qui-formula-compuesto", 5, 13),
    summary([
      "H = +1, O = −2, alcalinos = +1, elemento libre = 0.",
      "Σ(subíndice · número de oxidación) = carga total.",
      "Compuesto iónico neutro: la carga de uno pasa como subíndice del otro, después simplificás.",
      "Iones poliatómicos con subíndice: entre paréntesis.",
    ]),
  ],
  tutor: {
    normal: "El número de oxidación es una carga formal asignada a cada átomo suponiendo uniones iónicas. Se rige por reglas (H +1, O −2, alcalinos +1, elementos libres 0) y por la condición de que la suma ponderada por subíndices sea igual a la carga de la especie. Para compuestos iónicos, la electroneutralidad determina la relación de iones.",
    simple: "Sumá las cargas de todos los átomos (cada una por su subíndice) e igualá a la carga total. Lo que no sabés es la x que despejás.",
    nino: "Es como dividir una cuenta en un restaurante: sabés cuánto pagó cada uno menos uno, y sabés el total; lo que falta lo pone el último.",
    ejemplo: "SO₂: x + 2·(−2) = 0 ⇒ S = +4. Fosfato de calcio: Ca²⁺ y PO₄³⁻ → Ca₃(PO₄)₂.",
    fromZero: "Cada átomo en un compuesto «lleva» una carga ficticia. Conocemos la de algunos (el oxígeno casi siempre −2, el hidrógeno +1). Como el total tiene que dar la carga de la especie, se arma una ecuación de primer grado.",
    why: "Los números de oxidación sirven para nombrar compuestos, escribir fórmulas correctas y, más adelante, identificar qué se oxida y qué se reduce en una reacción redox.",
    origin: "La regla de la suma sale de la conservación de la carga: si cada átomo tuviera su carga formal, la suma sería exactamente la carga real de la especie. La fórmula iónica sale de pedir carga total cero: a·(cantidad de cationes) = b·(cantidad de aniones).",
    board: nomenclaturaBoard,
  },
};

// ═══════════════════════════ qui-u4: Fuerzas intermoleculares ═══════════════════════════

const fuerzasBoard: BoardStep[] = [
  { expr: "H₂O:  O central, 2 enlaces + 2 pares libres", note: "estructura de Lewis" },
  { expr: "4 zonas → electrónica tetraédrica", note: "TRePEV: se alejan al máximo" },
  { expr: "2 átomos + 2 pares → angular", note: "geometría molecular" },
  { expr: "dipolos no se anulan → polar", note: "molécula asimétrica" },
  { expr: "H unido a O → puente de H", note: "por eso hierve a 100 °C" },
];

export const quiFuerzasLesson: Lesson = {
  id: "l-qui-fuerzas",
  title: "Geometría y fuerzas intermoleculares",
  subtitle: "Por qué el agua hierve a 100 °C y el metano a −162 °C",
  subjectId: S,
  topicIds: ["t-qui-fuerzas"],
  estimatedMinutes: 11,
  prerequisites: ["t-qui-uniones"],
  cards: [
    intro(
      "De la forma a las propiedades",
      "Predecir la geometría molecular con la TRePEV, decidir si la molécula es polar y comparar puntos de ebullición según las fuerzas intermoleculares.",
      "Es el puente entre lo microscópico (enlaces) y lo que medís (estado, punto de ebullición, solubilidad).",
    ),
    explain(
      "Globos atados de un nudo",
      "Atá 2, 3 o 4 globos por el nudo: solos se acomodan lo más separados posible (lineal, triángulo, tetraedro).\n\nCon los pares de electrones alrededor de un átomo central pasa lo mismo (**TRePEV**). Los **pares libres** también son globos: ocupan lugar y doblan la molécula, aunque al nombrar la forma solo miramos los átomos.",
      { tag: "intuitivo" },
    ),
    quiz("Para pensar", {
      id: "q-qui-fuerzas-1",
      subjectId: S,
      topicId: "t-qui-fuerzas",
      prompt: "El $CO_2$ es lineal y sus enlaces C=O son polares. ¿La molécula es polar?",
      options: ["No: los dos dipolos son iguales y opuestos, se anulan", "Sí: tiene enlaces polares", "Sí: el oxígeno es muy electronegativo"],
      answer: 0,
      explanation: "En una molécula lineal y simétrica los dipolos de enlace apuntan en sentidos opuestos y se cancelan.",
      hints: ["Dibujá los dos dipolos como flechas.", "¿Hacia dónde apunta cada uno?", "Si se cancelan, la molécula es no polar."],
      errors: {
        1: ["conceptual", "Tener enlaces polares no alcanza: depende de si los dipolos se suman o se cancelan por la geometría."],
        2: ["conceptual", "La electronegatividad hace polares a los ENLACES; la polaridad de la molécula depende de la geometría."],
      },
    }),
    explain(
      "Tabla de geometrías y fuerzas",
      "Zonas alrededor del central (enlazados + libres):\n• 2 + 0 → lineal • 3 + 0 → trigonal plana • 2 + 1 → angular\n• 4 + 0 → tetraédrica • 3 + 1 → piramidal • 2 + 2 → angular\n\nFuerzas entre moléculas (de mayor a menor, a masas parecidas): **puente de H** (H unido a N, O o F) > **dipolo-dipolo** (moléculas polares) > **London** (todas; crecen con el tamaño).",
      { tag: "matematico" },
    ),
    board("Pizarra: el agua de punta a punta", fuerzasBoard),
    example(
      "Comparar puntos de ebullición",
      "Ordená de menor a mayor punto de ebullición: $CH_4$, $H_2O$, $H_2S$.",
      ["CH₄: no polar, solo London (y chica)", "H₂S: polar → dipolo-dipolo + London", "H₂O: puentes de hidrógeno"],
      "CH₄ (−162 °C) < H₂S (≈ −60 °C) < H₂O (100 °C)",
    ),
    practice("Ejercicio guiado", "qui-geometria-polaridad", 1, 2, true),
    explain(
      "Errores típicos",
      "• Confundir geometría **electrónica** (tetraédrica en el agua) con **molecular** (angular).\n• Olvidar los **pares libres**: el $NH_3$ es piramidal, no trigonal plano.\n• Creer que más masa siempre gana: el $H_2O$ (18 g/mol) hierve muy por encima del $H_2S$ (34 g/mol) por los puentes de H.\n• Las fuerzas intermoleculares actúan **entre** moléculas; no son los enlaces de adentro.",
      { tag: "cotidiano" },
    ),
    practice("Tu turno", "qui-fuerzas-ebullicion", 2, 4),
    practice("Tu turno", "qui-geometria-polaridad", 4, 7),
    practice("Desafío", "qui-fuerzas-ebullicion", 5, 11),
    summary([
      "TRePEV: los pares del átomo central se alejan al máximo; los libres también cuentan.",
      "Geometría molecular: solo la posición de los átomos.",
      "Polar si los dipolos no se cancelan.",
      "Puente de H > dipolo-dipolo > London (a masas parecidas). London crece con el tamaño.",
      "Fuerzas más intensas → mayor punto de ebullición.",
    ]),
  ],
  tutor: {
    normal: "Según la TRePEV, los pares electrónicos del átomo central adoptan la disposición de mínima repulsión; la geometría molecular describe la ubicación de los núcleos. La polaridad molecular resulta de la suma vectorial de los dipolos de enlace. Las fuerzas intermoleculares (London, dipolo-dipolo, puente de hidrógeno) determinan propiedades físicas como el punto de ebullición.",
    simple: "Contá enlaces y pares libres del átomo central para saber la forma. Si es simétrica, los dipolos se anulan (no polar). Moléculas que se atraen más entre sí hierven a mayor temperatura.",
    nino: "Las moléculas son como personas en una fiesta: algunas se agarran de las manos fuerte (puentes de H), otras se dan la mano (dipolo-dipolo) y otras apenas se rozan (London). Para separarlas (hervir) hay que darles más energía cuanto más fuerte se agarran.",
    ejemplo: "NH₃: 3 enlaces + 1 par libre → piramidal, polar, con puentes de H: hierve a −33 °C, muy por encima del CH₄ (−162 °C).",
    fromZero: "Las moléculas tienen forma, y esa forma depende de cómo se reparten los electrones alrededor del átomo del centro. Según la forma, una molécula puede tener un lado más negativo y otro más positivo (polar). Esas cargas parciales hacen que las moléculas se atraigan entre sí.",
    why: "La forma y las fuerzas intermoleculares explican si una sustancia es gas, líquido o sólido a temperatura ambiente, si se disuelve en agua y cuánto cuesta evaporarla.",
    origin: "La TRePEV parte de una idea simple: los pares de electrones se repelen, entonces se ubican lo más lejos posible. Para 4 pares eso es un tetraedro (109,5°). Las fuerzas intermoleculares vienen de atracciones eléctricas entre cargas parciales, permanentes (dipolos) o instantáneas (London).",
    board: fuerzasBoard,
  },
};

// ═══════════════════════════ qui-u5: Magnitudes atómico-moleculares ═══════════════════════════

const masaMolarBoard: BoardStep[] = [
  { expr: "Ca(OH)₂", note: "el 2 multiplica a O y a H" },
  { expr: "Ca: 1 · 40 = 40", note: "masa atómica · cantidad de átomos" },
  { expr: "O: 2 · 16 = 32" },
  { expr: "H: 2 · 1 = 2" },
  { expr: "M = 40 + 32 + 2 = 74 g/mol", note: "sumamos" },
  { expr: "%Ca = 40 / 74 · 100 = 54,1 %", note: "composición centesimal" },
];

export const quiMasaMolarLesson: Lesson = {
  id: "l-qui-masa-molar",
  title: "Masa molar y composición centesimal",
  subtitle: "Cuánto pesa un mol y qué parte es de cada elemento",
  subjectId: S,
  topicIds: ["t-qui-masa-molar"],
  estimatedMinutes: 9,
  prerequisites: ["t-qui-nomenclatura", "t-porcentajes"],
  cards: [
    intro(
      "Pesar fórmulas",
      "Calcular la masa molar de un compuesto (con subíndices y paréntesis) y su composición centesimal.",
      "La masa molar es el conversor entre gramos (lo que pesás) y moles (lo que cuenta la química). Aparece en casi todos los ejercicios.",
    ),
    explain(
      "Como sumar el precio de un combo",
      "Si una hamburguesa cuesta 40 y una gaseosa 16, un combo con 1 hamburguesa y 2 gaseosas cuesta 40 + 2·16 = 72.\n\nCon una fórmula es igual: cada elemento tiene su «precio» (masa atómica) y el subíndice dice cuántas unidades hay. La suma es la **masa molar** en g/mol.",
      { tag: "cotidiano" },
    ),
    quiz("Para pensar", {
      id: "q-qui-mm-1",
      subjectId: S,
      topicId: "t-qui-masa-molar",
      prompt: "¿Cuál es la masa molar del $CO_2$? (C = 12, O = 16)",
      options: ["44 g/mol", "28 g/mol", "22 g/mol"],
      answer: 0,
      explanation: "12 + 2·16 = 44 g/mol.",
      hints: ["¿Cuántos O hay?", "Cada O pesa 16.", "12 + 2·16."],
      errors: {
        1: ["formula", "Contaste un solo oxígeno (eso es el CO). El subíndice 2 multiplica la masa del O."],
        2: ["conceptual", "22 son los protones (6 + 2·8). La masa molar usa las masas atómicas."],
      },
    }),
    explain(
      "Las fórmulas",
      "$M = \\sum (\\text{subíndice} · \\text{masa atómica})$\n\nUn subíndice afuera de un paréntesis multiplica **todo** lo de adentro.\n\nComposición centesimal de un elemento X:\n\n$\\%X = \\frac{n_X · A_X}{M} · 100$\n\nLos porcentajes de todos los elementos suman 100 %.",
      { tag: "matematico", widget: { type: "percent", base: 74, percent: 54 } },
    ),
    board("Pizarra: hidróxido de calcio", masaMolarBoard, "Masas: Ca = 40; O = 16; H = 1."),
    example(
      "Ácido sulfúrico",
      "Masa molar del $H_2SO_4$ y % de oxígeno (H = 1, S = 32, O = 16).",
      ["$M = 2·1 + 32 + 4·16 = 98$ g/mol", "Oxígeno en 1 mol: $4·16 = 64$ g", "$\\%O = 64/98 · 100 = 65,3$ %"],
      "M = 98 g/mol; 65,3 % de O",
    ),
    practice("Ejercicio guiado", "qui-masa-molar", 1, 3, true),
    explain(
      "Errores típicos",
      "• **Sin subíndices**: sumar cada elemento una sola vez.\n• **Paréntesis**: en $Mg(NO_3)_2$ hay 2 N y 6 O.\n• **Usar Z** (número atómico) en lugar de la masa atómica.\n• **% de átomos no es % en masa**: en el agua 2 de 3 átomos son H, pero el H es solo el 11 % de la masa.",
      { tag: "cotidiano" },
    ),
    practice("Tu turno", "qui-masa-molar", 4, 6),
    practice("Tu turno", "qui-composicion-centesimal", 3, 8),
    practice("Desafío", "qui-composicion-centesimal", 5, 12),
    summary([
      "Masa molar = Σ subíndice · masa atómica (en g/mol).",
      "Un subíndice fuera del paréntesis multiplica todo lo de adentro.",
      "%X = (n·A_X / M) · 100; todos los % suman 100.",
      "La proporción en masa es la misma en cualquier muestra del compuesto.",
    ]),
  ],
  tutor: {
    normal: "La masa molar de un compuesto es la masa de un mol de sus unidades fórmula; se obtiene sumando las masas atómicas multiplicadas por los subíndices. La composición centesimal expresa la fracción en masa de cada elemento, constante para el compuesto por la ley de las proporciones definidas.",
    simple: "Multiplicá la masa de cada átomo por cuántas veces aparece y sumá todo. Para el porcentaje, dividí lo que aporta un elemento por el total y multiplicá por 100.",
    nino: "Es como armar un sándwich: sabés cuánto pesa cada ingrediente y cuántas fetas pusiste. El peso total es la suma; y el porcentaje de jamón es cuánto del peso total es jamón.",
    ejemplo: "NaCl: 23 + 35,5 = 58,5 g/mol; %Na = 23/58,5·100 = 39,3 %.",
    visual: { type: "percent", base: 98, percent: 65 },
    visualText: "En el H₂SO₄, el oxígeno es cerca del 65 % de la masa.",
    fromZero: "Cada elemento tiene una masa atómica (está en la tabla). Una fórmula dice cuántos átomos de cada elemento hay. Multiplicar y sumar da la masa de la fórmula; expresada en gramos, es la masa de un mol.",
    why: "No se pueden contar moléculas, pero sí pesarlas. La masa molar convierte una medición en balanza en una cantidad de partículas (moles).",
    origin: "Las masas atómicas están definidas en relación al carbono-12 (12 u exactas). Un mol tiene tantas partículas como átomos hay en 12 g de C-12; por eso una masa en u es numéricamente igual a la masa molar en g/mol.",
    board: masaMolarBoard,
  },
};

const molBoard: BoardStep[] = [
  { expr: "m = 36 g de H₂O;  M = 18 g/mol", note: "datos" },
  { expr: "n = m / M = 36 / 18 = 2 mol", note: "gramos → moles" },
  { expr: "N = n · N_A = 2 · 6,02·10²³", note: "moles → moléculas" },
  { expr: "N = 12,04·10²³ = 1,20·10²⁴", note: "moléculas de agua" },
  { expr: "N(H) = 2 · 1,20·10²⁴ = 2,41·10²⁴", note: "2 átomos de H por molécula" },
];

export const quiMolLesson: Lesson = {
  id: "l-qui-mol",
  title: "El mol",
  subtitle: "Gramos, moles y partículas",
  subjectId: S,
  topicIds: ["t-qui-mol"],
  estimatedMinutes: 10,
  prerequisites: ["t-qui-masa-molar", "t-potencias", "t-unidades"],
  cards: [
    intro(
      "Contar pesando",
      "Pasar de gramos a moles y a número de partículas (y al revés), incluyendo moles de átomos dentro de un compuesto.",
      "El mol es la unidad con la que «cuenta» la química: todas las ecuaciones hablan en moles.",
    ),
    explain(
      "Una docena gigante",
      "Una **docena** son 12 cosas; un **mol** son $6,02·10^{23}$ cosas (número de Avogadro). Es enorme porque los átomos son diminutos.\n\nLa clave: 1 mol de cualquier sustancia pesa su **masa molar** en gramos. 1 mol de agua (18 g) y 1 mol de glucosa (180 g) tienen la misma cantidad de moléculas, aunque pesen distinto.",
      { tag: "cotidiano" },
    ),
    quiz("Para pensar", {
      id: "q-qui-mol-1",
      subjectId: S,
      topicId: "t-qui-mol",
      prompt: "¿Qué tiene más moléculas: 18 g de agua ($M = 18$) o 44 g de $CO_2$ ($M = 44$)?",
      options: ["Tienen la misma cantidad: 1 mol cada uno", "El CO₂, porque pesa más", "El agua, porque sus moléculas son más chicas"],
      answer: 0,
      explanation: "18 g de agua = 1 mol y 44 g de CO₂ = 1 mol: los dos tienen 6,02·10²³ moléculas.",
      hints: ["Calculá los moles de cada uno.", "n = m/M.", "Mismos moles → mismas moléculas."],
      errors: {
        1: ["conceptual", "Más masa no significa más moléculas: cada molécula de CO₂ pesa más. Hay que comparar moles."],
        2: ["conceptual", "Que las moléculas sean más chicas solo importa si comparás iguales MASAS. Acá cada muestra es justo 1 mol."],
      },
    }),
    explain(
      "El camino de conversiones",
      "$\\text{gramos} \\xrightarrow{÷M} \\text{moles} \\xrightarrow{× N_A} \\text{partículas}$\n\n$n = \\frac{m}{M}$     $N = n · N_A$\n\nPara átomos de un elemento dentro de un compuesto, multiplicá por su subíndice: en 1 mol de $H_2O$ hay 2 mol de átomos de H.",
      { tag: "matematico", widget: { type: "power", base: 10, exponent: 3 } },
    ),
    board("Pizarra: de gramos a átomos", molBoard),
    example(
      "Masa de un número de moléculas",
      "¿Qué masa tienen $3,01·10^{23}$ moléculas de $NH_3$? (N = 14, H = 1)",
      ["$n = 3,01·10^{23} / 6,02·10^{23} = 0,5$ mol", "$M = 14 + 3 = 17$ g/mol", "$m = 0,5 · 17 = 8,5$ g"],
      "8,5 g",
    ),
    practice("Ejercicio guiado", "qui-moles-masa", 1, 4, true),
    explain(
      "Errores típicos",
      "• **Multiplicar en vez de dividir**: de gramos a moles se divide por M. Chequeo: 36 g de agua no pueden ser 648 moles.\n• **kg con g/mol**: pasá a gramos.\n• **Moléculas vs átomos**: 1 molécula de $C_6H_{12}O_6$ tiene 6 átomos de C.\n• Con potencias de 10: $12,04·10^{23} = 1,204·10^{24}$.",
      { tag: "cotidiano" },
    ),
    practice("Tu turno", "qui-avogadro", 2, 7),
    practice("Tu turno", "qui-moles-masa", 4, 10),
    practice("Desafío", "qui-avogadro", 5, 13),
    summary([
      "1 mol = 6,02·10²³ partículas y pesa M gramos.",
      "n = m/M; N = n·N_A.",
      "Átomos de un elemento = moles (o moléculas) del compuesto · subíndice.",
      "Unidades coherentes: masa en g con M en g/mol.",
    ]),
  ],
  tutor: {
    normal: "El mol es la unidad SI de cantidad de sustancia: contiene N_A = 6,02·10²³ entidades. La masa molar M vincula masa y cantidad (n = m/M). Los subíndices de una fórmula indican la relación entre moles de átomos y moles de unidades fórmula.",
    simple: "Para pasar de gramos a moles dividís por la masa molar. Para pasar de moles a partículas multiplicás por 6,02·10²³.",
    nino: "Si sabés que un paquete de arroz de 1 kg tiene unos 50 000 granos, podés saber cuántos granos hay en 3 kg sin contarlos. El mol hace lo mismo con átomos: los «contás» pesándolos.",
    ejemplo: "22 g de CO₂: n = 22/44 = 0,5 mol → 0,5·6,02·10²³ = 3,01·10²³ moléculas.",
    visual: { type: "power", base: 10, exponent: 3 },
    visualText: "Las potencias de 10 te dejan escribir números enormes, como 6,02·10²³, sin llenar la hoja de ceros.",
    fromZero: "Las partículas son demasiado chicas para contarlas una por una. Entonces se define un «paquete» con muchísimas: el mol. Lo bueno es que un paquete de cualquier sustancia pesa exactamente su masa molar en gramos.",
    why: "Las reacciones químicas ocurren partícula a partícula, así que las proporciones de una ecuación son proporciones de cantidad de partículas (moles), no de masas.",
    origin: "N_A se eligió para que 12 g de carbono-12 sean exactamente 1 mol. Como las masas atómicas se miden relativas al C-12, 1 mol de cualquier elemento pesa su masa atómica en gramos.",
    board: molBoard,
  },
};
