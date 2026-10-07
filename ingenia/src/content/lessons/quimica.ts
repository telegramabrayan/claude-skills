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
      "• Protones $= Z$.\n• Neutrones $= A − Z$.\n• Electrones $= Z − q$ (q = carga del ion, con signo).\n\nMasa atómica promedio de un elemento con isótopos de masas $m_1, m_2$ y abundancias $\\%_1, \\%_2$:\n\n$M_{prom} = \\frac{m_1·\\%_1 + m_2·\\%_2}{100}$",
      { tag: "matematico", widget: { type: "percent", base: 35, percent: 76 } },
    ),
    board("Pizarra: partículas de un ion", atomoBoard, "Contamos las partículas del ion sulfuro-34."),
    example(
      "Masa atómica del cloro",
      "El cloro tiene Cl-35 (75,77 %) y Cl-37 (24,23 %). Tomando como masa el número másico, ¿cuál es su masa atómica promedio?",
      ["$M_{prom} = (35 · 75,77 + 37 · 24,23) / 100$", "$= (2651,95 + 896,51) / 100$", "$= 35,48$ u"],
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
      "En una especie de carga q: $Σ(subíndice · n.º de oxidación) = q$.\n\nPara un compuesto iónico, el total de cargas debe ser 0: si el catión tiene carga $+a$ y el anión $−b$, la fórmula es $C_bA_a$ simplificada. Si el ion es poliatómico y lleva subíndice, va entre paréntesis: $Ca(NO_3)_2$.",
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
      "$M = Σ(subíndice · masa atómica)$\n\nUn subíndice afuera de un paréntesis multiplica **todo** lo de adentro.\n\nComposición centesimal de un elemento X:\n\n$\\%X = \\frac{n_X · A_X}{M} · 100$\n\nLos porcentajes de todos los elementos suman 100 %.",
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
      "gramos → (÷ $M$) → moles → (× $N_A$) → partículas\n\n$n = \\frac{m}{M}$     $N = n · N_A$\n\nPara átomos de un elemento dentro de un compuesto, multiplicá por su subíndice: en 1 mol de $H_2O$ hay 2 mol de átomos de H.",
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

// ═══════════════════════════ qui-u6: Gases ═══════════════════════════

const gasesBoard: BoardStep[] = [
  { expr: "V₁ = 4 L;  P₁ = 2 atm;  T₁ = 27 °C", note: "estado inicial" },
  { expr: "P₂ = 1,5 atm;  T₂ = 127 °C", note: "estado final" },
  { expr: "T₁ = 300 K;  T₂ = 400 K", note: "siempre a kelvin: +273" },
  { expr: "V₂ = P₁V₁T₂ / (T₁P₂)", note: "despejamos de la ley combinada" },
  { expr: "V₂ = 2 · 4 · 400 / (300 · 1,5) = 7,11 L" },
];

export const quiGasesLesson: Lesson = {
  id: "l-qui-gases",
  title: "Leyes de los gases",
  subtitle: "Boyle, Charles–Gay-Lussac y la ley combinada",
  subjectId: S,
  topicIds: ["t-qui-gases-leyes"],
  estimatedMinutes: 10,
  prerequisites: ["t-despeje", "t-unidades"],
  cards: [
    intro(
      "Apretar y calentar un gas",
      "Predecir cómo cambian presión, volumen y temperatura de una cantidad fija de gas usando las leyes de Boyle, Charles–Gay-Lussac y la ley combinada.",
      "Los gases son el estado más fácil de modelar con números, y estas leyes son la puerta a PV = nRT.",
    ),
    explain(
      "Una jeringa tapada",
      "Tapá la punta de una jeringa y empujá el émbolo: el volumen baja y sentís que la presión sube. Eso es **Boyle**: a temperatura constante, P y V son inversamente proporcionales.\n\nUn globo en el freezer se achica: a presión constante, menos temperatura implica menos volumen. Eso es **Charles**.",
      { tag: "cotidiano" },
    ),
    quiz("Para pensar", {
      id: "q-qui-gases-1",
      subjectId: S,
      topicId: "t-qui-gases-leyes",
      prompt: "Un gas a temperatura constante ocupa 6 L a 1 atm. Si la presión sube a 3 atm, ¿qué volumen ocupa?",
      options: ["2 L", "18 L", "6 L"],
      answer: 0,
      explanation: "P₁V₁ = P₂V₂ ⇒ V₂ = 1·6/3 = 2 L. Triplicar la presión divide el volumen por 3.",
      hints: ["Si apretás más, ¿el volumen sube o baja?", "P·V se mantiene constante.", "V₂ = P₁V₁/P₂."],
      errors: {
        1: ["formula", "Multiplicaste: P y V son INVERSAMENTE proporcionales a T constante."],
        2: ["conceptual", "Si cambia la presión, el volumen también cambia (la temperatura es la que no cambia)."],
      },
    }),
    explain(
      "Las leyes en fórmulas",
      "Para una cantidad fija de gas, con **T en kelvin** ($T = t_{°C} + 273$):\n\n• Boyle (T cte): $P_1V_1 = P_2V_2$\n• Charles (P cte): $\\frac{V_1}{T_1} = \\frac{V_2}{T_2}$\n• Gay-Lussac (V cte): $\\frac{P_1}{T_1} = \\frac{P_2}{T_2}$\n• Combinada: $\\frac{P_1V_1}{T_1} = \\frac{P_2V_2}{T_2}$\n\nAbajo, la hipérbola $P = 6/V$ de Boyle (mirá la rama con V > 0).",
      { tag: "matematico", widget: { type: "plot", mode: "free", initial: "6/x" } },
    ),
    board("Pizarra: ley combinada", gasesBoard),
    example(
      "Charles con °C",
      "Un globo de 3 L a 27 °C se calienta a 127 °C a presión constante. ¿Nuevo volumen?",
      ["$T_1 = 300$ K, $T_2 = 400$ K", "$V_2 = V_1 · T_2/T_1 = 3 · 400/300$", "$V_2 = 4$ L"],
      "4 L (con °C hubieras obtenido 14,1 L: absurdo)",
    ),
    practice("Ejercicio guiado", "qui-gases-combinada", 1, 3, true),
    explain(
      "El error número uno: los °C",
      "Las proporciones de Charles y Gay-Lussac valen con temperatura **absoluta**. Con °C, pasar de 10 °C a 20 °C parecería «duplicar» la temperatura, pero en kelvin es pasar de 283 K a 293 K: apenas un 3,5 % más.\n\nOtros errores: mezclar mmHg con atm (1 atm = 760 mmHg) e invertir el cociente. Chequeo rápido: más presión → menos volumen; más temperatura → más volumen.",
      { tag: "cotidiano" },
    ),
    practice("Tu turno", "qui-gases-combinada", 3, 6),
    practice("Tu turno", "qui-gases-combinada", 4, 9),
    practice("Desafío", "qui-gases-combinada", 6, 14),
    summary([
      "Temperatura SIEMPRE en kelvin: T = t(°C) + 273.",
      "Boyle: P₁V₁ = P₂V₂ (T cte).",
      "Charles: V/T cte (P cte). Gay-Lussac: P/T cte (V cte).",
      "Combinada: P₁V₁/T₁ = P₂V₂/T₂.",
      "Presiones en la misma unidad: 1 atm = 760 mmHg.",
    ]),
  ],
  tutor: {
    normal: "Para una masa fija de gas ideal, P·V/T es constante. Casos particulares: a T constante, PV = cte (Boyle); a P constante, V ∝ T (Charles); a V constante, P ∝ T (Gay-Lussac). La temperatura debe expresarse en escala absoluta.",
    simple: "Pasá la temperatura a kelvin, escribí P₁V₁/T₁ = P₂V₂/T₂, tachá lo que no cambia y despejá lo que te piden.",
    nino: "Es como una pelota inflada: si la apretás, se achica; si la dejás al sol, se agranda; si la metés en la heladera, se desinfla un poco.",
    ejemplo: "2 L a 1 atm y 0 °C → a 2 atm y 273 °C: V₂ = 1·2·546/(273·2) = 2 L.",
    visual: { type: "plot", mode: "free", initial: "6/x" },
    visualText: "Boyle: si V se duplica, P se reduce a la mitad (P·V = cte).",
    fromZero: "Un gas son partículas moviéndose y chocando con las paredes. La presión son esos choques. Si achicás el recipiente, chocan más seguido (más presión). Si calentás, se mueven más rápido (más presión o más volumen).",
    why: "Sirve para predecir qué pasa con neumáticos, aerosoles, globos o reactores cuando cambian las condiciones, y para comparar volúmenes de gas medidos en condiciones distintas.",
    origin: "Boyle midió en el siglo XVII que P·V se mantenía constante. Charles y Gay-Lussac vieron que V y P crecen linealmente con t(°C) y que, extrapolando, se anularían a −273 °C: de ahí la escala Kelvin, donde la relación pasa a ser una proporción directa.",
    board: gasesBoard,
  },
};

const gasIdealBoard: BoardStep[] = [
  { expr: "m = 16 g de O₂;  V = 10 L;  t = 27 °C", note: "datos" },
  { expr: "n = 16 / 32 = 0,5 mol", note: "en PV = nRT van moles" },
  { expr: "T = 27 + 273 = 300 K" },
  { expr: "P = nRT / V", note: "despejamos" },
  { expr: "P = 0,5 · 0,082 · 300 / 10 = 1,23 atm" },
];

export const quiGasIdealLesson: Lesson = {
  id: "l-qui-gas-ideal",
  title: "El gas ideal",
  subtitle: "PV = nRT y mezclas de gases",
  subjectId: S,
  topicIds: ["t-qui-gas-ideal"],
  estimatedMinutes: 11,
  prerequisites: ["t-qui-gases-leyes", "t-qui-mol"],
  cards: [
    intro(
      "Una sola ecuación para todo",
      "Usar la ecuación de estado PV = nRT para calcular presión, volumen, moles, masa o masa molar de un gas, y la ley de Dalton para mezclas.",
      "Es la ecuación que conecta los gases con la estequiometría: te deja pasar de litros de gas a moles.",
    ),
    explain(
      "Contar partículas con un manómetro",
      "En un gas ideal, la presión no depende de **qué** gas es, solo de **cuántas** partículas hay, de su temperatura y del volumen.\n\nPor eso 1 mol de $H_2$ y 1 mol de $CO_2$ en el mismo recipiente y a la misma temperatura ejercen la misma presión, aunque el $CO_2$ pese 22 veces más.",
      { tag: "intuitivo" },
    ),
    quiz("Para pensar", {
      id: "q-qui-gasideal-1",
      subjectId: S,
      topicId: "t-qui-gas-ideal",
      prompt: "En PV = nRT con R = 0,082 atm·L/(mol·K), ¿en qué unidades va la temperatura?",
      options: ["Kelvin", "Grados Celsius", "Da igual, se simplifica"],
      answer: 0,
      explanation: "R tiene K en sus unidades; además T debe ser absoluta (a 0 °C el gas no tiene presión cero).",
      hints: ["Mirá las unidades de R.", "¿Qué pasaría a 0 °C si usaras °C?", "T absoluta."],
      errors: {
        1: ["unidades", "Con °C, a 0 °C la ecuación daría P = 0. La temperatura tiene que ser absoluta (kelvin)."],
        2: ["unidades", "No se simplifica: aparece una sola T, y R está definida con kelvin."],
      },
    }),
    explain(
      "Fórmulas",
      "$PV = nRT$     $R = 0,082\\ \\frac{atm·L}{mol·K}$\n\nCon masa: $n = \\frac{m}{M}$ ⇒ $M = \\frac{mRT}{PV}$.\n\nEn CNPT (0 °C, 1 atm), 1 mol ocupa $V = \\frac{1·0,082·273}{1} ≈ 22,4$ L.\n\n**Dalton**: en una mezcla, $P_i = x_i · P_{total}$ con $x_i = \\frac{n_i}{n_{total}}$, y $P_{total} = Σ P_i$.",
      { tag: "matematico" },
    ),
    board("Pizarra: presión de 16 g de oxígeno", gasIdealBoard),
    example(
      "Masa molar de un gas desconocido",
      "2,86 g de un gas ocupan 1 L a 1 atm y 0 °C. ¿Cuál es su masa molar?",
      ["$n = PV/(RT) = 1·1/(0,082·273) = 0,0447$ mol", "$M = m/n = 2,86 / 0,0447$", "$M ≈ 64$ g/mol (podría ser $SO_2$)"],
      "≈ 64 g/mol",
    ),
    practice("Ejercicio guiado", "qui-gas-ideal", 1, 5, true),
    explain(
      "Errores típicos",
      "• **Gramos en lugar de moles** en PV = nRT.\n• **°C** en lugar de K.\n• **R = 8,314** con atm y L: ese valor es para J (Pa·m³). Con atm y L va 0,082.\n• **mL** en lugar de L.\n• En mezclas, la presión parcial se reparte por **fracción molar**, no por fracción en masa.",
      { tag: "cotidiano" },
    ),
    practice("Tu turno", "qui-presion-parcial", 2, 7),
    practice("Tu turno", "qui-gas-ideal", 4, 10),
    practice("Desafío", "qui-presion-parcial", 6, 15),
    summary([
      "PV = nRT con P en atm, V en L, n en mol, T en K y R = 0,082.",
      "n = m/M; M = mRT/(PV).",
      "En CNPT, 1 mol de gas ocupa 22,4 L.",
      "Dalton: P_i = x_i · P_total, con x_i = n_i / n_total.",
    ]),
  ],
  tutor: {
    normal: "La ecuación de estado del gas ideal PV = nRT resume las leyes de Boyle, Charles y Avogadro. Permite calcular cualquier variable de estado conociendo las demás. En mezclas ideales, cada componente ejerce una presión parcial proporcional a su fracción molar y la presión total es la suma (ley de Dalton).",
    simple: "Ordená los datos: P en atm, V en litros, n en moles, T en kelvin. Reemplazá en PV = nRT y despejá lo que falta.",
    nino: "Es como una sala llena de gente moviéndose: la «presión» sobre las paredes depende de cuánta gente hay, de qué tan rápido se mueven y del tamaño de la sala, no de quiénes son.",
    ejemplo: "1 mol a 27 °C en 24,6 L: P = 1·0,082·300/24,6 = 1 atm.",
    fromZero: "Las leyes de los gases dicen cómo cambian P, V y T. Si además contamos cuántas partículas hay (moles), todo se puede juntar en una sola ecuación con una constante universal R.",
    why: "Medir el volumen de un gas es mucho más fácil que pesarlo. Con PV = nRT, medir P, V y T te dice cuántos moles hay, y eso conecta los gases con las ecuaciones químicas.",
    origin: "Combinando Boyle (V ∝ 1/P), Charles (V ∝ T) y Avogadro (V ∝ n) queda V ∝ nT/P, o sea PV = nRT. R se obtiene sabiendo que 1 mol ocupa 22,4 L a 273 K y 1 atm: R = 1·22,4/(1·273) ≈ 0,082.",
    board: gasIdealBoard,
  },
};

// ═══════════════════════════ qui-u7: Soluciones ═══════════════════════════

const solucionesBoard: BoardStep[] = [
  { expr: "m = 20 g de NaOH;  V = 250 mL", note: "datos" },
  { expr: "M(NaOH) = 23 + 16 + 1 = 40 g/mol", note: "masa molar" },
  { expr: "n = 20 / 40 = 0,5 mol", note: "gramos → moles" },
  { expr: "V = 250 mL = 0,25 L", note: "molaridad es por litro" },
  { expr: "M = 0,5 / 0,25 = 2 M", note: "mol/L" },
];

export const quiSolucionesLesson: Lesson = {
  id: "l-qui-soluciones",
  title: "Soluciones y concentración",
  subtitle: "% m/m, % m/V y molaridad",
  subjectId: S,
  topicIds: ["t-qui-concentracion"],
  estimatedMinutes: 11,
  prerequisites: ["t-qui-mol", "t-porcentajes", "t-unidades"],
  cards: [
    intro(
      "¿Qué tan concentrado está?",
      "Expresar la concentración de una solución en % m/m, % m/V y molaridad, y pasar de una a otra usando la densidad.",
      "Casi toda la química de laboratorio ocurre en solución: sin concentraciones no se puede hacer estequiometría en solución ni calcular pH.",
    ),
    explain(
      "Jugo en polvo",
      "Un sobre de jugo en 1 L de agua queda rico; en medio litro queda empalagoso. La **cantidad de soluto** es la misma; cambia la **concentración**: cuánto soluto hay por cada porción de solución.\n\n**Soluto**: lo que se disuelve. **Solvente**: el que disuelve (en general, agua). **Solución** = soluto + solvente.",
      { tag: "cotidiano" },
    ),
    quiz("Para pensar", {
      id: "q-qui-sol-1",
      subjectId: S,
      topicId: "t-qui-concentracion",
      prompt: "Disolvés 10 g de sal en 90 g de agua. ¿Cuál es la concentración en % m/m?",
      options: ["10 %", "11,1 %", "9 %"],
      answer: 0,
      explanation: "Masa de solución = 10 + 90 = 100 g. % m/m = 10/100·100 = 10 %.",
      hints: ["% m/m: gramos de soluto cada 100 g de SOLUCIÓN.", "¿Cuánto pesa la solución?", "10 + 90 = 100 g."],
      errors: {
        1: ["conceptual", "Dividiste por la masa de agua (solvente). El % m/m se calcula sobre la masa de la solución."],
        2: ["calculo", "Revisá: 10/100·100 = 10."],
      },
    }),
    explain(
      "Tres formas de medir",
      "$\\% m/m = \\frac{m_{soluto}}{m_{solución}}·100$\n\n$\\% m/V = \\frac{m_{soluto}(g)}{V_{solución}(mL)}·100$\n\n$M = \\frac{n_{soluto}}{V_{solución}(L)}$ (mol/L)\n\nLa **densidad de la solución** ($δ = m_{sn}/V_{sn}$) es el puente entre masa y volumen de solución: $\\% m/V = \\% m/m · δ$.",
      { tag: "matematico", widget: { type: "percent", base: 250, percent: 8 } },
    ),
    board("Pizarra: molaridad de una solución de NaOH", solucionesBoard, "Se disuelven 20 g de NaOH hasta 250 mL de solución."),
    example(
      "De % m/m a molaridad",
      "Un HCl comercial es 36 % m/m con densidad 1,18 g/mL. ¿Cuál es su molaridad? (M(HCl) = 36,5 g/mol)",
      ["1 L de solución pesa $1000 · 1,18 = 1180$ g", "Soluto: $0,36 · 1180 = 424,8$ g de HCl", "$n = 424,8 / 36,5 = 11,6$ mol en 1 L"],
      "≈ 11,6 M",
    ),
    practice("Ejercicio guiado", "qui-concentracion-porcentual", 1, 2, true),
    explain(
      "Errores típicos",
      "• **Dividir por el solvente** en vez de por la solución.\n• **mL en la molaridad**: 0,5 mol en 250 mL es 2 M, no 0,002.\n• **Gramos en vez de moles** en la molaridad (eso es g/L).\n• **Olvidar la densidad** al pasar de % m/m a % m/V o a molaridad: 100 g de solución no ocupan 100 mL salvo que δ = 1.",
      { tag: "cotidiano" },
    ),
    practice("Tu turno", "qui-molaridad", 2, 6),
    practice("Tu turno", "qui-concentracion-porcentual", 4, 9),
    practice("Desafío", "qui-molaridad", 6, 13),
    summary([
      "Solución = soluto + solvente.",
      "% m/m: g de soluto / g de solución · 100. % m/V: g / mL de solución · 100.",
      "Molaridad: moles de soluto por litro de solución.",
      "La densidad de la solución conecta masa y volumen: % m/V = % m/m · δ.",
    ]),
  ],
  tutor: {
    normal: "La concentración expresa la proporción de soluto en la solución. Las expresiones más usadas son % m/m, % m/V y molaridad (mol de soluto por litro de solución). Para convertir entre expresiones en masa y en volumen se necesita la densidad de la solución.",
    simple: "Siempre dividís lo que hay de soluto por lo que hay de solución (no de agua sola). En la molaridad, el soluto va en moles y la solución en litros.",
    nino: "Si en un vaso de 200 mL de leche ponés 2 cucharadas de cacao y en otro de 100 mL también 2, el segundo queda más «cargado»: tiene la misma cantidad de cacao en menos leche.",
    ejemplo: "5,85 g de NaCl (0,1 mol) en 500 mL de solución: M = 0,1/0,5 = 0,2 M.",
    visual: { type: "percent", base: 250, percent: 8 },
    visualText: "Un 8 % m/m significa 8 g de soluto cada 100 g de solución: en 250 g hay 20 g.",
    fromZero: "Cuando disolvés algo, la mezcla queda pareja. Para describirla alcanza con decir cuánto soluto hay en cierta cantidad de solución. Hay distintas «monedas» para decirlo (masa, volumen, moles) y se pasa de una a otra con masa molar y densidad.",
    why: "La molaridad es la que se usa en estequiometría de soluciones y en equilibrio, porque cuenta partículas (moles) por volumen. Los porcentajes son los que suelen aparecer en etiquetas.",
    origin: "Todas son proporciones: parte (soluto) sobre todo (solución). La conversión % m/m → M sale de tomar 1 L de solución, calcular su masa con la densidad, la masa de soluto con el porcentaje y los moles con la masa molar.",
    board: solucionesBoard,
  },
};

const dilucionBoard: BoardStep[] = [
  { expr: "C₁ = 6 M;  C₂ = 0,5 M;  V₂ = 300 mL", note: "datos" },
  { expr: "C₁V₁ = C₂V₂", note: "los moles de soluto no cambian" },
  { expr: "V₁ = C₂V₂ / C₁ = 0,5 · 300 / 6", note: "despejamos" },
  { expr: "V₁ = 25 mL", note: "de solución concentrada" },
  { expr: "agua = 300 − 25 = 275 mL", note: "lo que se agrega" },
];

export const quiDilucionesLesson: Lesson = {
  id: "l-qui-diluciones",
  title: "Diluciones",
  subtitle: "Agregar agua sin perder soluto",
  subjectId: S,
  topicIds: ["t-qui-dilucion"],
  estimatedMinutes: 8,
  prerequisites: ["t-qui-concentracion", "t-despeje"],
  cards: [
    intro(
      "Bajar la concentración",
      "Calcular concentraciones y volúmenes en una dilución con C₁V₁ = C₂V₂, incluyendo cuánta agua hay que agregar.",
      "En el laboratorio casi nunca se usa la solución concentrada directamente: se diluye. Es una cuenta corta que se toma mucho.",
    ),
    explain(
      "Rebajar un jugo concentrado",
      "Si a un jugo concentrado le agregás agua, el **azúcar que hay en la jarra no cambia**: solo se reparte en más volumen.\n\nCon las soluciones pasa lo mismo: al diluir, los **moles de soluto** se conservan. Como $n = C·V$, lo que tenías antes es igual a lo que tenés después.",
      { tag: "cotidiano" },
    ),
    quiz("Para pensar", {
      id: "q-qui-dil-1",
      subjectId: S,
      topicId: "t-qui-dilucion",
      prompt: "Tomás 100 mL de una solución 2 M y completás con agua hasta 400 mL. ¿Cuál es la nueva concentración?",
      options: ["0,5 M", "8 M", "2 M"],
      answer: 0,
      explanation: "C₂ = 2·100/400 = 0,5 M: el volumen se cuadruplicó, la concentración bajó a la cuarta parte.",
      hints: ["¿Cuántas veces creció el volumen?", "Los moles son los mismos.", "C₂ = C₁V₁/V₂."],
      errors: {
        1: ["formula", "Invertiste: al agregar agua la concentración BAJA."],
        2: ["conceptual", "La cantidad de soluto se conserva, pero ahora está en más volumen: la concentración cambia."],
      },
    }),
    explain(
      "La ecuación",
      "$C_1V_1 = C_2V_2$\n\nVale con cualquier concentración que sea «cantidad por volumen» (M, % m/V) siempre que uses las **mismas unidades** a ambos lados (los mL se simplifican).\n\nVolumen de agua a agregar (suponiendo volúmenes aditivos): $V_{agua} = V_2 − V_1$.",
      { tag: "matematico" },
    ),
    board("Pizarra: preparar 300 mL 0,5 M desde 6 M", dilucionBoard),
    example(
      "Dilución en dos pasos",
      "Una solución 1 M se diluye 1:10 y la resultante se vuelve a diluir 1:10. ¿Concentración final?",
      ["Primera: $C = 1/10 = 0,1$ M", "Segunda: $C = 0,1/10 = 0,01$ M", "En total se diluyó 100 veces"],
      "0,01 M",
    ),
    practice("Ejercicio guiado", "qui-dilucion", 1, 3, true),
    explain(
      "Errores típicos",
      "• **Invertir** la proporción: el volumen de concentrada es **menor** que el final.\n• Responder **V₂** o **V₁** cuando se pide el **agua** agregada.\n• Mezclar unidades: si V₁ está en mL, V₂ también.\n\nChequeo: $C_2 < C_1$ y $V_2 > V_1$, siempre.",
      { tag: "cotidiano" },
    ),
    practice("Tu turno", "qui-dilucion", 3, 6),
    practice("Tu turno", "qui-dilucion", 4, 8),
    practice("Desafío", "qui-dilucion", 6, 12),
    summary([
      "Al diluir, los moles de soluto se conservan.",
      "C₁V₁ = C₂V₂ (mismas unidades a ambos lados).",
      "Agua agregada = V₂ − V₁ (volúmenes aditivos).",
      "Siempre: C₂ < C₁ y V₂ > V₁.",
    ]),
  ],
  tutor: {
    normal: "En una dilución se agrega solvente y la cantidad de soluto permanece constante. Como n = C·V, se cumple C₁V₁ = C₂V₂. Suponiendo volúmenes aditivos, el solvente agregado es V₂ − V₁.",
    simple: "Lo que tenés de soluto antes (C₁·V₁) es lo mismo que después (C₂·V₂). Despejás lo que falta.",
    nino: "Si tenés una taza de café muy fuerte y la pasás a un jarro con agua, el café es el mismo, pero queda más suave porque está más repartido.",
    ejemplo: "50 mL de HCl 1 M llevados a 250 mL: C₂ = 1·50/250 = 0,2 M.",
    fromZero: "Concentración es «cuánto soluto por cada litro». Si agregás agua, el soluto se reparte en más litros y la concentración baja. Como el soluto no se va a ningún lado, alcanza una igualdad.",
    why: "Las soluciones se guardan concentradas (ocupan menos lugar) y se diluyen justo antes de usarlas. Saber cuánto tomar de la concentrada es una cuenta de todos los días en un laboratorio.",
    origin: "n = C·V antes y después; como n no cambia, C₁V₁ = C₂V₂. No hay más que eso: es conservación de la cantidad de soluto.",
    board: dilucionBoard,
  },
};

// ═══════════════════════════ qui-u8: Reacciones y estequiometría ═══════════════════════════

const balanceoBoard: BoardStep[] = [
  { expr: "C₃H₈ + O₂ → CO₂ + H₂O", note: "esqueleto sin balancear" },
  { expr: "C₃H₈ + O₂ → 3CO₂ + H₂O", note: "C: 3 a la izquierda → 3 CO₂" },
  { expr: "C₃H₈ + O₂ → 3CO₂ + 4H₂O", note: "H: 8 a la izquierda → 4 H₂O" },
  { expr: "C₃H₈ + 5O₂ → 3CO₂ + 4H₂O", note: "O: 6 + 4 = 10 a la derecha → 5 O₂" },
  { expr: "C: 3 = 3;  H: 8 = 8;  O: 10 = 10", note: "control final" },
];

export const quiBalanceoLesson: Lesson = {
  id: "l-qui-balanceo",
  title: "Ecuaciones químicas y balanceo",
  subtitle: "Los átomos no se crean ni se destruyen",
  subjectId: S,
  topicIds: ["t-qui-balanceo"],
  estimatedMinutes: 10,
  prerequisites: ["t-qui-nomenclatura"],
  cards: [
    intro(
      "Balancear por tanteo",
      "Escribir y balancear ecuaciones químicas con los menores coeficientes enteros, sin tocar subíndices.",
      "Una ecuación mal balanceada arruina toda la estequiometría que sigue: es el paso cero de cualquier cálculo con reacciones.",
    ),
    explain(
      "Una receta con piezas de encastre",
      "Una reacción reacomoda átomos como piezas de encastre: desarmás unas figuras y armás otras, pero **no aparecen ni desaparecen piezas**.\n\nBalancear es elegir **cuántas figuras** de cada tipo (coeficientes) para que sobren y falten cero piezas. Lo que **no** podés hacer es cambiar la forma de una figura (los subíndices): eso sería otra sustancia.",
      { tag: "intuitivo" },
    ),
    quiz("Para pensar", {
      id: "q-qui-bal-1",
      subjectId: S,
      topicId: "t-qui-balanceo",
      prompt: "Para balancear $H_2 + O_2 → H_2O$, ¿qué es válido?",
      options: ["Escribir $2H_2 + O_2 → 2H_2O$", "Escribir $H_2 + O_2 → H_2O_2$", "Escribir $H_2 + O → H_2O$"],
      answer: 0,
      explanation: "Solo se cambian coeficientes. H₂O₂ es agua oxigenada (otra sustancia) y el oxígeno gaseoso es O₂, no O.",
      hints: ["¿Qué se puede cambiar: coeficientes o subíndices?", "Cambiar un subíndice cambia la sustancia.", "Contá H y O a cada lado en la primera opción."],
      errors: {
        1: ["conceptual", "Cambiaste un subíndice: H₂O₂ es otra sustancia. Solo se tocan coeficientes."],
        2: ["conceptual", "El oxígeno gaseoso es diatómico (O₂). No se puede cambiar la fórmula de un reactivo."],
      },
    }),
    explain(
      "Método de tanteo, con orden",
      "1. Balanceá primero los elementos que aparecen en **una sola sustancia** de cada lado (metales, C).\n2. Después el **H**.\n3. Al final el **O** (y cualquier elemento que esté solo, como $O_2$ o $H_2$).\n4. Si queda un coeficiente fraccionario (p. ej. $\\frac{7}{2}O_2$), multiplicá todo por el denominador.\n5. Controlá cada elemento y simplificá si todos los coeficientes tienen un divisor común.",
      { tag: "matematico" },
    ),
    board("Pizarra: combustión del propano", balanceoBoard),
    example(
      "Combustión del etano",
      "Balanceá $C_2H_6 + O_2 → CO_2 + H_2O$.",
      ["C: $C_2H_6 + O_2 → 2CO_2 + H_2O$", "H: $C_2H_6 + O_2 → 2CO_2 + 3H_2O$", "O: a la derecha hay 4 + 3 = 7 → $\\frac{7}{2}O_2$", "×2: $2C_2H_6 + 7O_2 → 4CO_2 + 6H_2O$"],
      "2C₂H₆ + 7O₂ → 4CO₂ + 6H₂O",
    ),
    practice("Ejercicio guiado", "qui-balanceo", 1, 2, true),
    explain(
      "Errores típicos",
      "• **Cambiar subíndices** para que «cierre».\n• **Contar átomos en vez de moléculas**: $5O_2$ son 5 moléculas y 10 átomos de O; el coeficiente es 5.\n• **No usar los menores enteros**: $4H_2 + 2O_2 → 4H_2O$ está balanceada pero se simplifica.\n• **Olvidar el coeficiente** al contar: en $3CO_2$ hay 6 O.",
      { tag: "cotidiano" },
    ),
    practice("Tu turno", "qui-balanceo-coeficiente", 2, 5),
    practice("Tu turno", "qui-balanceo", 4, 9),
    practice("Desafío", "qui-balanceo-coeficiente", 6, 13),
    summary([
      "Balancear = misma cantidad de átomos de cada elemento a ambos lados.",
      "Solo se cambian coeficientes, nunca subíndices.",
      "Orden útil: metales/C → H → O.",
      "Coeficientes: los menores enteros posibles.",
    ]),
  ],
  tutor: {
    normal: "Una ecuación química balanceada respeta la ley de conservación de la masa: cada elemento tiene igual número de átomos en reactivos y productos. Los coeficientes estequiométricos indican la proporción en moléculas (o moles) de cada sustancia y se eligen como los menores enteros posibles.",
    simple: "Contá los átomos de cada elemento a la izquierda y a la derecha. Ajustá los números de adelante (coeficientes) hasta que coincidan. Nunca toques los numeritos de abajo.",
    nino: "Es como armar sándwiches: si cada sándwich lleva 2 panes y 1 feta, para 3 sándwiches necesitás 6 panes y 3 fetas. No podés decidir que un pan «vale doble».",
    ejemplo: "N₂ + 3H₂ → 2NH₃: N 2 = 2; H 6 = 6.",
    fromZero: "Una ecuación química es una receta: a la izquierda lo que entra, a la derecha lo que sale. Como la materia no se crea ni se destruye, cada tipo de átomo tiene que estar en la misma cantidad a ambos lados.",
    why: "Los coeficientes son las proporciones que usás en estequiometría. Si están mal, todas las masas y volúmenes calculados después también.",
    origin: "Viene de la ley de conservación de la masa (Lavoisier): en una reacción los átomos se reacomodan, no se crean. Cada elemento da una ecuación «átomos a la izquierda = átomos a la derecha»; el tanteo es una forma ordenada de resolver ese sistema.",
    board: balanceoBoard,
  },
};

const estequioBoard: BoardStep[] = [
  { expr: "N₂ + 3H₂ → 2NH₃;  dato: 12 g de H₂", note: "ecuación balanceada" },
  { expr: "n(H₂) = 12 / 2 = 6 mol", note: "gramos → moles" },
  { expr: "n(NH₃) = 6 · 2/3 = 4 mol", note: "relación de coeficientes 2 : 3" },
  { expr: "m(NH₃) = 4 · 17 = 68 g", note: "moles → gramos" },
  { expr: "V(NH₃, CNPT) = 4 · 22,4 = 89,6 L", note: "si se pide volumen" },
];

export const quiEstequiometriaLesson: Lesson = {
  id: "l-qui-estequiometria",
  title: "Estequiometría",
  subtitle: "Cuánto se forma y cuánto se necesita",
  subjectId: S,
  topicIds: ["t-qui-estequiometria"],
  estimatedMinutes: 11,
  prerequisites: ["t-qui-balanceo", "t-qui-mol", "t-qui-gas-ideal", "t-fracciones"],
  cards: [
    intro(
      "La receta en números",
      "Usar una ecuación balanceada para pasar de la masa de una sustancia a la masa, los moles o el volumen de otra.",
      "Es el tema central de la química general: todo cálculo de «cuánto» pasa por acá.",
    ),
    explain(
      "La receta habla en unidades, no en gramos",
      "Una receta dice «2 huevos por cada taza de harina»: es una relación entre **cantidades de cosas**, no entre pesos.\n\nLos coeficientes de una ecuación son igual: $N_2 + 3H_2 → 2NH_3$ dice «1 mol de $N_2$ con 3 mol de $H_2$ dan 2 mol de $NH_3$». Por eso el camino siempre pasa por **moles**.",
      { tag: "cotidiano" },
    ),
    quiz("Para pensar", {
      id: "q-qui-esteq-1",
      subjectId: S,
      topicId: "t-qui-estequiometria",
      prompt: "Según $2H_2 + O_2 → 2H_2O$, ¿cuántos moles de agua se forman con 3 mol de $O_2$ (y $H_2$ en exceso)?",
      options: ["6 mol", "3 mol", "1,5 mol"],
      answer: 0,
      explanation: "Relación O₂ : H₂O = 1 : 2 ⇒ 3 · 2 = 6 mol de agua.",
      hints: ["Mirá los coeficientes de O₂ y H₂O.", "1 mol de O₂ da 2 mol de H₂O.", "3 · 2/1."],
      errors: {
        1: ["conceptual", "Usaste una relación 1 : 1. Los coeficientes dicen 1 O₂ → 2 H₂O."],
        2: ["formula", "Invertiste la relación: por cada mol de O₂ se forman DOS de agua."],
      },
    }),
    explain(
      "El camino estequiométrico",
      "$m_A$ → (÷ $M_A$) → $n_A$ → (× $\\frac{b}{a}$) → $n_B$ → (× $M_B$) → $m_B$\n\nDonde a y b son los coeficientes de A y B. Si B es un gas:\n• en CNPT: $V_B = n_B · 22,4$ L\n• en otras condiciones: $V_B = \\frac{n_B R T}{P}$",
      { tag: "matematico" },
    ),
    board("Pizarra: amoníaco a partir de hidrógeno", estequioBoard),
    example(
      "Descomposición del carbonato de calcio",
      "¿Qué masa de CaO se obtiene al descomponer 250 g de $CaCO_3$? ($CaCO_3 → CaO + CO_2$; Ca = 40, C = 12, O = 16)",
      ["$M(CaCO_3) = 100$ g/mol ⇒ $n = 250/100 = 2,5$ mol", "Relación 1 : 1 ⇒ $n(CaO) = 2,5$ mol", "$M(CaO) = 56$ g/mol ⇒ $m = 2,5 · 56 = 140$ g"],
      "140 g de CaO",
    ),
    practice("Ejercicio guiado", "qui-estequiometria-masa", 1, 4, true),
    explain(
      "Errores típicos",
      "• **Aplicar los coeficientes a los gramos**: 2 g de $H_2$ NO reaccionan con 1 g de $O_2$.\n• **Relación 1 : 1** cuando no lo es.\n• **Invertir** la relación $\\frac{b}{a}$: chequeá que «moles de lo que busco» queden arriba.\n• **22,4 L/mol fuera de CNPT**: a otra T y P, usá PV = nRT.",
      { tag: "cotidiano" },
    ),
    practice("Tu turno", "qui-estequiometria-masa", 3, 7),
    practice("Tu turno", "qui-estequiometria-masa", 4, 10),
    practice("Desafío", "qui-estequiometria-masa", 6, 16),
    summary([
      "Primero la ecuación balanceada.",
      "Gramos → moles → (relación de coeficientes) → moles → lo que se pida.",
      "Los coeficientes relacionan moles, nunca gramos.",
      "Gas: 22,4 L/mol en CNPT; si no, PV = nRT.",
    ]),
  ],
  tutor: {
    normal: "La estequiometría usa las relaciones molares de la ecuación balanceada para vincular cantidades de reactivos y productos. Las masas se convierten a moles con la masa molar, se aplica el cociente de coeficientes y se vuelve a la magnitud pedida (masa, moles, volumen de gas o partículas).",
    simple: "Pasá el dato a moles, multiplicá por (coeficiente de lo que buscás)/(coeficiente del dato) y pasá el resultado a la unidad que te piden.",
    nino: "Si para una torta necesitás 3 huevos por cada 2 tazas de harina y tenés 6 tazas, necesitás 9 huevos. Primero contás «cuántas tandas» hay y después aplicás la receta.",
    ejemplo: "CH₄ + 2O₂ → CO₂ + 2H₂O. 32 g de CH₄ = 2 mol → 4 mol de H₂O = 72 g.",
    fromZero: "Una ecuación balanceada es una receta en moles. Si sabés cuánto tenés de un ingrediente, la receta te dice cuánto vas a obtener de producto. Lo único que hay que hacer es pasar todo a moles antes de usar la receta.",
    why: "Es la herramienta para planificar: cuánta materia prima comprar, cuánto producto esperar, cuánto gas se va a liberar. En ingeniería es la base de los balances de masa.",
    origin: "Los coeficientes dicen cuántas moléculas de cada sustancia participan; multiplicando todo por N_A, son también moles. Por eso la relación b/a entre coeficientes es la relación entre moles de B y de A.",
    board: estequioBoard,
  },
};

const limitanteBoard: BoardStep[] = [
  { expr: "2H₂ + O₂ → 2H₂O;  8 g H₂ y 32 g O₂", note: "datos" },
  { expr: "n(H₂) = 8/2 = 4 mol;  n(O₂) = 32/32 = 1 mol", note: "todo a moles" },
  { expr: "H₂: 4/2 = 2;  O₂: 1/1 = 1", note: "moles ÷ coeficiente" },
  { expr: "limitante: O₂", note: "el menor cociente" },
  { expr: "n(H₂O) = 1 · 2 = 2 mol → 36 g", note: "producto desde el limitante" },
  { expr: "sobra H₂: 4 − 2 = 2 mol = 4 g", note: "exceso" },
];

export const quiLimitanteLesson: Lesson = {
  id: "l-qui-limitante",
  title: "Reactivo limitante, pureza y rendimiento",
  subtitle: "Lo que de verdad se obtiene",
  subjectId: S,
  topicIds: ["t-qui-limitante"],
  estimatedMinutes: 12,
  prerequisites: ["t-qui-estequiometria", "t-porcentajes"],
  cards: [
    intro(
      "Del ideal a la realidad",
      "Identificar el reactivo limitante, calcular el producto y el exceso, y corregir por pureza de los reactivos y rendimiento de la reacción.",
      "En los parciales casi nunca hay «exceso de todo»: estos tres ajustes son los que separan un ejercicio de 4 de uno de 10.",
    ),
    explain(
      "Panchos y panes",
      "Para un pancho necesitás 1 pan y 1 salchicha. Con 10 panes y 6 salchichas hacés **6** panchos: la salchicha es el **limitante** y sobran 4 panes (**exceso**).\n\nSi además 1 de cada 10 panchos se te cae (rendimiento 90 %), comés menos de lo que «da la cuenta». Y si 2 salchichas estaban vencidas (pureza), arrancás con menos.",
      { tag: "cotidiano" },
    ),
    quiz("Para pensar", {
      id: "q-qui-lim-1",
      subjectId: S,
      topicId: "t-qui-limitante",
      prompt: "Según $N_2 + 3H_2 → 2NH_3$, se mezclan 2 mol de $N_2$ y 3 mol de $H_2$. ¿Cuál es el limitante?",
      options: ["$H_2$", "$N_2$, porque hay menos moles", "Ninguno: están en proporción"],
      answer: 0,
      explanation: "N₂: 2/1 = 2; H₂: 3/3 = 1. El H₂ tiene el menor cociente: se agota primero (para 2 mol de N₂ harían falta 6 de H₂).",
      hints: ["Compará moles divididos por su coeficiente.", "¿Cuánto H₂ necesitarían 2 mol de N₂?", "El que alcanza para menos «tandas» es el limitante."],
      errors: {
        1: ["conceptual", "No es el que tiene menos moles: hay que dividir por el coeficiente. El H₂ se consume de a 3."],
        2: ["calculo", "La proporción es 1 : 3. Para 2 mol de N₂ harían falta 6 mol de H₂, y hay solo 3."],
      },
    }),
    explain(
      "Las fórmulas",
      "**Limitante**: el de menor $\\frac{n_i}{coef_i}$. El producto se calcula **solo** con él.\n\n**Pureza**: $m_{puro} = \\frac{\\%p}{100} · m_{muestra}$\n\n**Rendimiento**: $\\eta = \\frac{m_{real}}{m_{teórica}} · 100$ ⇒ $m_{real} = \\frac{\\eta}{100} · m_{teórica}$\n\nHacia atrás (cuánta muestra necesito), pureza y rendimiento **dividen**.",
      { tag: "matematico", widget: { type: "percent", base: 140, percent: 80 } },
    ),
    board("Pizarra: limitante y exceso", limitanteBoard),
    example(
      "Pureza y rendimiento juntos",
      "200 g de caliza con 80 % de $CaCO_3$ se descomponen ($CaCO_3 → CaO + CO_2$) con rendimiento del 90 %. ¿Cuántos g de CaO se obtienen? (Ca = 40, C = 12, O = 16)",
      ["Puro: $0,80 · 200 = 160$ g de $CaCO_3$ = 1,6 mol", "Teórico: 1,6 mol de CaO · 56 = 89,6 g", "Real: $0,90 · 89,6 = 80,64$ g"],
      "≈ 80,6 g de CaO",
    ),
    practice("Ejercicio guiado", "qui-reactivo-limitante", 1, 3, true),
    explain(
      "Errores típicos",
      "• Elegir como limitante el que tiene **menos gramos**: compará moles ÷ coeficiente.\n• Calcular el producto con el **reactivo en exceso**.\n• **Rendimiento al revés**: real/teórico, nunca más de 100 %.\n• Olvidar la **pureza**: las impurezas no reaccionan.\n• En el exceso, responder lo que **reaccionó** en lugar de lo que **sobra**.",
      { tag: "cotidiano" },
    ),
    practice("Tu turno", "qui-rendimiento-pureza", 2, 6),
    practice("Tu turno", "qui-reactivo-limitante", 5, 9),
    practice("Desafío", "qui-rendimiento-pureza", 6, 14),
    summary([
      "Limitante: menor (moles ÷ coeficiente). Determina el producto.",
      "Exceso que sobra = inicial − lo que reacciona con el limitante.",
      "Pureza: solo reacciona la parte pura.",
      "Rendimiento = real / teórico · 100 (≤ 100 %).",
      "Hacia atrás, pureza y rendimiento dividen.",
    ]),
  ],
  tutor: {
    normal: "Cuando los reactivos no están en proporción estequiométrica, el que se consume primero (limitante) determina la cantidad máxima de producto; el resto queda en exceso. La pureza corrige la masa de reactivo efectivamente disponible y el rendimiento compara el producto obtenido con el teórico.",
    simple: "Pasá todo a moles, dividí por los coeficientes y el más chico es el limitante. Con él calculás el producto. Después: pureza (solo cuenta la parte pura) y rendimiento (obtenés solo un porcentaje de lo teórico).",
    nino: "Si cada bicicleta lleva 2 ruedas y 1 cuadro, con 10 ruedas y 7 cuadros armás 5 bicicletas: las ruedas mandan aunque haya «más» ruedas que cuadros.",
    ejemplo: "Zn + 2HCl → ZnCl₂ + H₂ con 1 mol de Zn y 1 mol de HCl: Zn 1/1 = 1; HCl 1/2 = 0,5 → limitante HCl → 0,5 mol de H₂.",
    visual: { type: "percent", base: 140, percent: 80 },
    visualText: "Un rendimiento del 80 % sobre 140 g teóricos da 112 g reales.",
    fromZero: "La ecuación dice en qué proporción reaccionan las sustancias. Si ponés de más de una, esa sobra; la que se termina primero frena la reacción. En la vida real además hay impurezas y pérdidas, que se corrigen con porcentajes.",
    why: "En la industria nunca se trabaja con reactivos ideales: siempre hay un reactivo más caro que se usa como limitante, materias primas impuras y pérdidas. Estas correcciones dan lo que realmente se produce.",
    origin: "Cada reactivo permitiría (n/coeficiente) «tandas» de reacción; la reacción se detiene cuando se acaba el que permite menos. Pureza y rendimiento son fracciones (porcentajes) aplicadas sobre la masa de reactivo y sobre el producto teórico.",
    board: limitanteBoard,
  },
};

// ═══════════════════════════ qui-u9: Equilibrio químico ═══════════════════════════

const equilibrioBoard: BoardStep[] = [
  { expr: "H₂ + I₂ ⇌ 2HI;  V = 1 L", note: "reacción" },
  { expr: "inicio: 1 | 1 | 0", note: "moles iniciales" },
  { expr: "cambio: −x | −x | +2x", note: "según los coeficientes" },
  { expr: "equilibrio: 0,2 | 0,2 | 1,6", note: "dato: 1,6 mol de HI ⇒ x = 0,8" },
  { expr: "Kc = 1,6² / (0,2 · 0,2) = 64", note: "productos sobre reactivos, con exponentes" },
];

export const quiEquilibrioLesson: Lesson = {
  id: "l-qui-equilibrio",
  title: "Equilibrio químico",
  subtitle: "Kc y el principio de Le Chatelier",
  subjectId: S,
  topicIds: ["t-qui-equilibrio"],
  estimatedMinutes: 12,
  prerequisites: ["t-qui-concentracion", "t-qui-balanceo", "t-potencias"],
  cards: [
    intro(
      "Reacciones que van y vienen",
      "Escribir y calcular la constante de equilibrio Kc (también con tabla inicio/cambio/equilibrio) y predecir hacia dónde se desplaza un equilibrio perturbado.",
      "Es la idea que después sostiene ácido-base y pH: muchas reacciones no se completan, se equilibran.",
    ),
    explain(
      "Una escalera mecánica de ida y vuelta",
      "Imaginá dos escaleras mecánicas entre dos pisos, una que sube y otra que baja. Al rato, la cantidad de gente en cada piso deja de cambiar: no porque nadie se mueva, sino porque **suben tantos como bajan**.\n\nEso es el equilibrio químico: la reacción directa y la inversa siguen ocurriendo a la misma velocidad, y las concentraciones quedan constantes.",
      { tag: "intuitivo" },
    ),
    quiz("Para pensar", {
      id: "q-qui-eq-1",
      subjectId: S,
      topicId: "t-qui-equilibrio",
      prompt: "Para $N_2O_4 ⇌ 2NO_2$, ¿cuál es la expresión de Kc?",
      options: ["$Kc = [NO_2]^2 / [N_2O_4]$", "$Kc = [N_2O_4] / [NO_2]^2$", "$Kc = 2[NO_2] / [N_2O_4]$"],
      answer: 0,
      explanation: "Productos arriba, reactivos abajo, cada concentración elevada a su coeficiente.",
      hints: ["¿Qué va en el numerador?", "Los coeficientes van como exponentes.", "El 2 de NO₂ es un exponente, no un factor."],
      errors: {
        1: ["formula", "Está invertida: en Kc los productos van en el numerador."],
        2: ["potencias", "El coeficiente va como EXPONENTE, no multiplicando."],
      },
    }),
    explain(
      "Kc y Le Chatelier",
      "Para $aA + bB ⇌ cC + dD$ (en solución o gas):\n\n$Kc = \\frac{[C]^c [D]^d}{[A]^a [B]^b}$ (concentraciones de equilibrio, en mol/L)\n\n**Le Chatelier**: si perturbás un equilibrio, el sistema se desplaza para contrarrestar: consume lo agregado, repone lo quitado; más presión favorece el lado con menos moles gaseosos; calentar favorece el sentido endotérmico.\n\n**Solo la temperatura cambia Kc.** Un catalizador no desplaza nada.",
      { tag: "matematico" },
    ),
    board("Pizarra: tabla inicio–cambio–equilibrio", equilibrioBoard),
    example(
      "Kc con moles y volumen",
      "En 2 L hay, en equilibrio, 0,4 mol de $PCl_5$, 0,2 mol de $PCl_3$ y 0,2 mol de $Cl_2$ ($PCl_5 ⇌ PCl_3 + Cl_2$). ¿Kc?",
      ["Concentraciones: [PCl₅] = 0,2 M; [PCl₃] = 0,1 M; [Cl₂] = 0,1 M", "$Kc = 0,1 · 0,1 / 0,2$", "$Kc = 0,05$"],
      "Kc = 0,05",
    ),
    practice("Ejercicio guiado", "qui-kc-calculo", 1, 2, true),
    explain(
      "Errores típicos",
      "• **Invertir** la expresión (reactivos arriba).\n• **Olvidar los exponentes**.\n• **Usar moles** en vez de concentraciones cuando V ≠ 1 L.\n• Usar cantidades **iniciales** en lugar de las de equilibrio.\n• Creer que agregar reactivo **cambia Kc**: cambia la posición, no la constante.",
      { tag: "cotidiano" },
    ),
    practice("Tu turno", "qui-le-chatelier", 3, 5),
    practice("Tu turno", "qui-kc-calculo", 4, 8),
    practice("Desafío", "qui-le-chatelier", 6, 12),
    summary([
      "Equilibrio: velocidades directa e inversa iguales; concentraciones constantes.",
      "Kc = productos^coef / reactivos^coef, con concentraciones de equilibrio.",
      "Tabla inicio / cambio / equilibrio con el avance x.",
      "Le Chatelier: el sistema contrarresta la perturbación.",
      "Kc solo cambia con la temperatura; el catalizador no desplaza.",
    ]),
  ],
  tutor: {
    normal: "En un sistema cerrado, una reacción reversible alcanza un estado de equilibrio dinámico en el que las velocidades directa e inversa se igualan. La ley de acción de masas define Kc, que depende solo de la temperatura. El principio de Le Chatelier predice el desplazamiento frente a cambios de concentración, presión o temperatura.",
    simple: "Kc = productos sobre reactivos, cada uno elevado a su coeficiente. Si tocás el equilibrio, se mueve para el lado que compensa lo que hiciste.",
    nino: "Es como una balanza con dos chicos que se pasan pelotas: si le das más pelotas a uno, va a pasar más al otro hasta que se empareje de nuevo.",
    ejemplo: "N₂ + 3H₂ ⇌ 2NH₃ (exotérmica): al enfriar se forma más NH₃; al aumentar la presión, también (4 moles de gas → 2).",
    fromZero: "Algunas reacciones no se completan: los productos vuelven a formar reactivos. Al final se llega a un punto donde todo parece quieto. Kc es un número que resume ese punto; Le Chatelier dice qué pasa si lo sacás de ahí.",
    why: "Permite saber cuánto producto se puede obtener como máximo y cómo mejorar un proceso (por ejemplo, el de síntesis de amoníaco se hace a alta presión por Le Chatelier).",
    origin: "En equilibrio, velocidad directa = velocidad inversa. Si cada velocidad es proporcional a las concentraciones elevadas a sus coeficientes (reacciones elementales), igualarlas da k_d·[A]^a[B]^b = k_i·[C]^c[D]^d, y el cociente k_d/k_i es Kc.",
    board: equilibrioBoard,
  },
};

// ═══════════════════════════ qui-u10: Ácido-base ═══════════════════════════

const phBoard: BoardStep[] = [
  { expr: "NaOH 0,01 M (base fuerte)", note: "dato" },
  { expr: "[OH⁻] = 0,01 = 10⁻² M", note: "se disocia por completo" },
  { expr: "pOH = −log(10⁻²) = 2", note: "definición" },
  { expr: "pH = 14 − 2 = 12", note: "pH + pOH = 14 a 25 °C" },
];

export const quiPhLesson: Lesson = {
  id: "l-qui-ph",
  title: "Ácidos, bases y pH",
  subtitle: "Fuertes, débiles y la escala logarítmica",
  subjectId: S,
  topicIds: ["t-qui-ph"],
  estimatedMinutes: 12,
  prerequisites: ["t-qui-concentracion", "t-qui-equilibrio", "t-potencias"],
  cards: [
    intro(
      "Medir la acidez",
      "Calcular el pH de soluciones de ácidos y bases fuertes y, con la aproximación √(Ka·C), de ácidos y bases débiles.",
      "El pH aparece en todos lados: agua potable, procesos industriales, biología. Y es un tema que se toma con logaritmos, así que conviene tener la mecánica afilada.",
    ),
    explain(
      "Una escala de a diez",
      "Un **ácido** libera $H^+$; una **base** libera $OH^-$ (o capta $H^+$).\n\nEl pH cuenta potencias de 10: si $[H^+] = 10^{-3}$ M, el pH es 3. Bajar **una** unidad de pH significa **10 veces** más $H^+$. Por eso un pH 2 es diez veces más ácido que un pH 3.\n\npH < 7 ácido; 7 neutro; > 7 básico (a 25 °C).",
      { tag: "intuitivo" },
    ),
    quiz("Para pensar", {
      id: "q-qui-ph-1",
      subjectId: S,
      topicId: "t-qui-ph",
      prompt: "¿Cuál es el pH de HCl 0,001 M (ácido fuerte)?",
      options: ["3", "−3", "11"],
      answer: 0,
      explanation: "[H⁺] = 10⁻³ M ⇒ pH = −log(10⁻³) = 3.",
      hints: ["Ácido fuerte: [H⁺] = C.", "0,001 = 10⁻³.", "pH = −log[H⁺]."],
      errors: {
        1: ["signos", "Te faltó el signo menos de la definición: pH = −log[H⁺]."],
        2: ["conceptual", "11 sería el pH de una BASE 0,001 M. Un ácido tiene pH menor que 7."],
      },
    }),
    explain(
      "Las fórmulas",
      "$pH = −log[H^+]$     $pOH = −log[OH^-]$     $pH + pOH = 14$ (25 °C)\n\n**Fuertes** (HCl, $HNO_3$, NaOH, KOH): se disocian del todo. $[H^+] = C$ o $[OH^-] = C$ (con $Ca(OH)_2$: $[OH^-] = 2C$).\n\n**Débiles**: $HA ⇌ H^+ + A^-$, $K_a = \\frac{x^2}{C − x} ≈ \\frac{x^2}{C}$ ⇒ $[H^+] ≈ √(K_a·C)$ (válido si se disocia poco).",
      { tag: "matematico", widget: { type: "power", base: 10, exponent: -3 } },
    ),
    board("Pizarra: pH de una base fuerte", phBoard),
    example(
      "Ácido acético",
      "pH de ácido acético 0,1 M ($K_a = 1,8·10^{-5}$).",
      ["$[H^+] ≈ √(1,8·10^{-5} · 0,1) = √(1,8·10^{-6})$", "$[H^+] ≈ 1,34·10^{-3}$ M", "$pH = −log(1,34·10^{-3}) ≈ 2,87$"],
      "pH ≈ 2,87 (un ácido fuerte de igual concentración tendría pH 1)",
    ),
    practice("Ejercicio guiado", "qui-ph-fuerte", 1, 2, true),
    explain(
      "Errores típicos",
      "• **pH negativo** por olvidar el «−» del logaritmo.\n• En bases, informar el **pOH** como si fuera el pH.\n• Tratar un ácido **débil** como fuerte ($[H^+] = C$).\n• Olvidar la **raíz**: $x^2 = K_a C$.\n• Hidróxidos con **dos OH⁻**: $[OH^-] = 2C$.\n\nChequeo: ácido → pH < 7; base → pH > 7.",
      { tag: "cotidiano" },
    ),
    practice("Tu turno", "qui-ph-fuerte", 4, 6),
    practice("Tu turno", "qui-ph-debil", 2, 9),
    practice("Desafío", "qui-ph-debil", 5, 13),
    summary([
      "pH = −log[H⁺]; pOH = −log[OH⁻]; pH + pOH = 14 (25 °C).",
      "Fuertes: disociación completa ([H⁺] = C o [OH⁻] = C · número de OH).",
      "Débiles: [H⁺] ≈ √(Ka·C); bases débiles: [OH⁻] ≈ √(Kb·C).",
      "Una unidad de pH = factor 10 en [H⁺].",
    ]),
  ],
  tutor: {
    normal: "Según Arrhenius, los ácidos liberan H⁺ y las bases OH⁻ en agua (Brønsted-Lowry generaliza: ácido dona H⁺, base acepta). El pH es −log[H⁺]; a 25 °C, Kw = [H⁺][OH⁻] = 10⁻¹⁴ y pH + pOH = 14. Los electrolitos fuertes se disocian completamente; los débiles alcanzan un equilibrio caracterizado por Ka o Kb.",
    simple: "Encontrá [H⁺] (o [OH⁻]), sacale el logaritmo y cambiale el signo. Si es base, después hacés 14 menos eso. Si es débil, [H⁺] es la raíz de Ka por C.",
    nino: "El pH es como la escala de picante de una salsa, pero al revés y de a diez: cada número menos es diez veces más «picante» (ácido).",
    ejemplo: "HNO₃ 0,02 M: pH = −log(0,02) = 1,70. KOH 0,02 M: pOH = 1,70 → pH = 12,30.",
    visual: { type: "power", base: 10, exponent: -3 },
    visualText: "10⁻³ = 1/1000: con [H⁺] = 10⁻³ M el pH es 3.",
    fromZero: "En el agua siempre hay un poquito de H⁺ y OH⁻. Los ácidos agregan H⁺ y las bases agregan OH⁻. Como esas concentraciones son números muy chicos (0,001, 0,0000001…), se usa el logaritmo para manejarlos con números cómodos: eso es el pH.",
    why: "La acidez controla la velocidad de muchas reacciones, la corrosión, la vida de los organismos y la calidad del agua. Medirla con un número entre 0 y 14 es práctico.",
    origin: "El agua se autoioniza: H₂O ⇌ H⁺ + OH⁻ con Kw = 10⁻¹⁴ a 25 °C. Tomando −log: pH + pOH = 14. Para un ácido débil, Ka = x²/(C − x); si x ≪ C, queda x² ≈ Ka·C.",
    board: phBoard,
  },
};

// ═══════════════════════════ qui-u11: Óxido-reducción ═══════════════════════════

const redoxBoard: BoardStep[] = [
  { expr: "Zn + Cu²⁺ → Zn²⁺ + Cu", note: "reacción" },
  { expr: "Zn: 0 → +2", note: "sube: se OXIDA (pierde 2 e⁻)" },
  { expr: "Cu: +2 → 0", note: "baja: se REDUCE (gana 2 e⁻)" },
  { expr: "reductor: Zn;  oxidante: Cu²⁺", note: "el agente es el «otro»" },
  { expr: "e⁻ perdidos = e⁻ ganados = 2", note: "control" },
];

export const quiRedoxLesson: Lesson = {
  id: "l-qui-redox",
  title: "Óxido-reducción",
  subtitle: "Quién pierde electrones y quién los gana",
  subjectId: S,
  topicIds: ["t-qui-redox"],
  estimatedMinutes: 10,
  prerequisites: ["t-qui-nomenclatura", "t-qui-balanceo"],
  cards: [
    intro(
      "Transferir electrones",
      "Identificar en una reacción qué especie se oxida, cuál se reduce, cuál es el agente oxidante y el reductor, y contar los electrones transferidos.",
      "Las pilas, la corrosión, la combustión y la respiración son reacciones redox. El vocabulario se presta a confusión y por eso se toma.",
    ),
    explain(
      "Un pase de pelota",
      "En una redox, una especie **le pasa electrones** a otra.\n\n• El que **pierde** electrones **se oxida** (su número de oxidación sube).\n• El que **gana** electrones **se reduce** (su número de oxidación baja).\n\nRegla mnemotécnica: «**P**ierde → **O**xida» (POGR: pierde-oxida, gana-reduce).",
      { tag: "intuitivo" },
    ),
    quiz("Para pensar", {
      id: "q-qui-redox-1",
      subjectId: S,
      topicId: "t-qui-redox",
      prompt: "En $2Na + Cl_2 → 2NaCl$, el sodio pasa de 0 a +1. ¿Qué le pasa al sodio?",
      options: ["Se oxida: pierde un electrón", "Se reduce: gana un electrón", "Nada: no cambia su carga"],
      answer: 0,
      explanation: "El número de oxidación sube (0 → +1): perdió un electrón, se oxidó.",
      hints: ["¿Sube o baja el número de oxidación?", "Perder electrones (negativos) hace la carga más positiva.", "Sube → se oxida."],
      errors: {
        1: ["conceptual", "Invertiste: ganar electrones haría la carga más NEGATIVA. Acá sube a +1: perdió."],
        2: ["conceptual", "Pasa de 0 a +1: cambió, y eso es justamente la oxidación."],
      },
    }),
    explain(
      "Agentes y conteo de electrones",
      "• **Agente oxidante**: la especie que oxida a la otra, o sea, la que **se reduce**.\n• **Agente reductor**: la que **se oxida**.\n\nElectrones por átomo = cambio del número de oxidación. Electrones totales = cambio por átomo · cantidad de átomos (con los coeficientes).\n\nEn una ecuación balanceada: **e⁻ perdidos = e⁻ ganados**.",
      { tag: "matematico" },
    ),
    board("Pizarra: zinc y cobre", redoxBoard),
    example(
      "Óxido de hierro y monóxido de carbono",
      "En $Fe_2O_3 + 3CO → 2Fe + 3CO_2$, ¿quién se oxida y cuántos electrones se transfieren?",
      ["Fe: +3 → 0 (baja, se reduce): gana 3 e⁻ por átomo; hay 2 → 6 e⁻", "C: +2 → +4 (sube, se oxida): pierde 2 e⁻ por átomo; hay 3 → 6 e⁻", "Oxidante: $Fe_2O_3$; reductor: CO"],
      "Se oxida el CO; se transfieren 6 e⁻",
    ),
    practice("Ejercicio guiado", "qui-redox-identificar", 1, 3, true),
    explain(
      "Errores típicos",
      "• Creer que el **oxidante** es el que se oxida: es al revés.\n• Buscar los agentes entre los **productos**: son reactivos.\n• Contar electrones de **un** átomo cuando se piden los totales (multiplicá por los coeficientes).\n• Sumar perdidos + ganados: son los **mismos** electrones, no se cuentan dos veces.",
      { tag: "cotidiano" },
    ),
    practice("Tu turno", "qui-redox-electrones", 2, 5),
    practice("Tu turno", "qui-redox-identificar", 4, 8),
    practice("Desafío", "qui-redox-electrones", 5, 12),
    summary([
      "Oxidación: pierde e⁻, sube el número de oxidación.",
      "Reducción: gana e⁻, baja el número de oxidación.",
      "Agente oxidante = se reduce. Agente reductor = se oxida.",
      "e⁻ perdidos = e⁻ ganados (multiplicando por los coeficientes).",
    ]),
  ],
  tutor: {
    normal: "Una reacción de óxido-reducción implica transferencia de electrones: la especie que se oxida aumenta su número de oxidación y actúa como agente reductor; la que se reduce lo disminuye y actúa como agente oxidante. En la ecuación balanceada, el número de electrones cedidos es igual al de electrones aceptados.",
    simple: "Calculá los números de oxidación antes y después. El que sube se oxida (es el reductor). El que baja se reduce (es el oxidante).",
    nino: "Es como un préstamo: el que da plata (electrones) se queda con menos (se oxida) y el que recibe se queda con más (se reduce). El que «hace que otro pierda» es el oxidante.",
    ejemplo: "Mg + 2H⁺ → Mg²⁺ + H₂: Mg pierde 2 e⁻ (reductor); H⁺ gana 1 e⁻ cada uno (oxidante); total 2 e⁻.",
    fromZero: "Los números de oxidación son cargas «contables» de cada átomo. Si en una reacción algunos cambian, hubo electrones que pasaron de un átomo a otro. Siguiendo esos cambios sabés quién dio y quién recibió.",
    why: "Las pilas y baterías, la corrosión del hierro, la obtención de metales y la combustión son redox. Identificar oxidante y reductor es el primer paso para balancearlas y para entender la electroquímica.",
    origin: "«Oxidación» venía de combinarse con oxígeno (que se queda con electrones); se generalizó a cualquier pérdida de electrones. Como los electrones no aparecen ni desaparecen, todo lo que pierde uno lo gana otro.",
    board: redoxBoard,
  },
};

export const quimicaLessons: Lesson[] = [
  quiSistemasLesson,
  quiAtomoLesson,
  quiTablaLesson,
  quiUnionesLesson,
  quiNomenclaturaLesson,
  quiFuerzasLesson,
  quiMasaMolarLesson,
  quiMolLesson,
  quiGasesLesson,
  quiGasIdealLesson,
  quiSolucionesLesson,
  quiDilucionesLesson,
  quiBalanceoLesson,
  quiEstequiometriaLesson,
  quiLimitanteLesson,
  quiEquilibrioLesson,
  quiPhLesson,
  quiRedoxLesson,
];
