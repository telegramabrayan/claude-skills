import type { BoardStep, LessonCard, Lesson } from "@/engine/types";
import { example, explain, intro, practice, quiz, summary } from "./helpers";

/** Pizarra: procedimiento modelo renglón por renglón. */
const board = (title: string, steps: BoardStep[], introText?: string, outro?: string): LessonCard => ({ kind: "board", title, intro: introText, steps, outro });

const S = "fisica";

// ═══════════════════════════ Unidad 1: Vectores II ═══════════════════════════

const vecComponentesBoard: BoardStep[] = [
  { expr: "|F| = 40 N,  α = 35° desde +y hacia −x", note: "datos: el ángulo NO está medido desde +x" },
  { expr: "θ = 90° + 35° = 125°", note: "llevamos el ángulo a «desde +x, antihorario»" },
  { expr: "F_x = 40 · cos 125° = −22,9 N", note: "x con coseno (porque θ es desde +x)" },
  { expr: "F_y = 40 · sen 125° = 32,8 N", note: "y con seno" },
  { expr: "F = (−22,9; 32,8) N", note: "control: 2.º cuadrante → x negativa, y positiva ✓" },
];

export const vecComponentesLesson: Lesson = {
  id: "l-vec-componentes",
  title: "Vectores II: componentes y ángulos",
  subtitle: "Ángulos desde cualquier eje, sin confundir seno y coseno",
  subjectId: S,
  topicIds: ["t-vec-componentes"],
  estimatedMinutes: 12,
  prerequisites: ["t-vectores", "t-trigonometria"],
  cards: [
    intro(
      "Componentes con cualquier ángulo",
      "Descomponer un vector cuando el ángulo se mide desde +x, desde +y o desde otro semieje, y recuperar el ángulo a partir de las componentes corrigiendo el cuadrante.",
      "En los parciales los ángulos casi nunca vienen «desde +x». El error más común de la unidad es usar coseno donde va seno.",
    ),
    explain(
      "La sombra del vector",
      "Imaginá una linterna que ilumina la flecha desde arriba: la sombra sobre el eje x es $F_x$. Si la iluminás de costado, la sombra sobre el eje y es $F_y$.\n\nLa componente que queda **pegada al ángulo** (el cateto adyacente) va con **coseno**. La otra, con **seno**.",
      { tag: "intuitivo" },
    ),
    quiz("Para pensar", {
      id: "q-fis3-cos-adyacente",
      subjectId: S,
      topicId: "t-vec-componentes",
      prompt: "Una fuerza de 10 N forma 30° con el semieje **+y** (inclinada hacia +x). ¿Cuánto vale $F_y$?",
      options: ["$10 · cos 30° ≈ 8,66$ N", "$10 · sen 30° = 5$ N", "$10$ N"],
      answer: 0,
      explanation: "El ángulo está pegado al eje y, así que la componente y es el cateto adyacente: F_y = 10·cos 30° ≈ 8,66 N. La x es la opuesta: F_x = 10·sen 30° = 5 N.",
      hints: ["¿Desde qué eje se mide el ángulo?", "El cateto adyacente al ángulo va con coseno.", "Acá el adyacente es el que está sobre el eje y."],
      errors: {
        1: ["trigonometria", "Usaste la regla «y con seno», que vale solo si el ángulo se mide desde +x. Acá se mide desde +y: la y es la adyacente → coseno."],
        2: ["vectores", "El módulo es el largo total de la flecha; la componente es solo su «sombra» sobre el eje."],
      },
    }),
    explain(
      "Dos caminos que dan lo mismo",
      "**Camino 1:** pensá qué cateto es adyacente al ángulo dado → coseno; el otro → seno; los signos salen del cuadrante.\n\n**Camino 2:** convertí el ángulo a $θ$ medido desde +x en sentido antihorario y usá siempre $F_x = |F| cos θ$, $F_y = |F| sen θ$: los signos salen solos.\n\nGirá el vector y mirá cómo se proyecta:",
      { tag: "matematico", widget: { type: "vector-components", mag: 6, angle: 125 } },
    ),
    board("Pizarra: ángulo medido desde +y", vecComponentesBoard, "Una fuerza de 40 N forma 35° con el semieje +y, inclinada hacia −x."),
    example(
      "Del vector al ángulo",
      "¿Qué ángulo forma $V = (−5; −3)$ con +x, en sentido antihorario?",
      ["La calculadora: $arctg(−3 / −5) = arctg(0,6) = 31,0°$", "Pero $V_x < 0$ y $V_y < 0$: está en el 3.er cuadrante", "Corregimos: $θ = 31,0° + 180° = 211°$"],
      "θ ≈ 211°",
    ),
    practice("Ejercicio guiado", "fis-vec-componente", 2, 4, true),
    explain(
      "El error típico: la calculadora no ve cuadrantes",
      "$arctg$ devuelve ángulos entre −90° y 90°: no distingue $(3; 4)$ de $(−3; −4)$.\n\n• $V_x < 0$ → sumá 180°.\n• 4.º cuadrante ($V_x > 0$, $V_y < 0$) → sumá 360° si querés el ángulo entre 0° y 360°.\n\nY antes de usar «x con coseno», preguntate **desde qué eje** está medido el ángulo.",
      { tag: "cotidiano" },
    ),
    practice("Tu turno", "fis-vec-angulo", 3, 9),
    practice("Tu turno", "fis-vec-componente", 4, 13),
    practice("Desafío", "fis-vec-angulo", 5, 21),
    summary([
      "Cateto adyacente al ángulo → coseno; opuesto → seno.",
      "«x con cos, y con sen» solo si θ se mide desde +x.",
      "Los signos salen del cuadrante (o solos, si usás θ desde +x).",
      "θ = arctg(V_y/V_x) y +180° si V_x < 0.",
      "Ángulo con +y: cos α = V_y / |V|.",
    ]),
  ],
  tutor: {
    normal: "Las componentes cartesianas son las proyecciones ortogonales del vector sobre los ejes. Si θ es el ángulo medido desde +x en sentido antihorario, F_x = |F|·cos θ y F_y = |F|·sen θ. Si el ángulo está dado respecto de otro semieje, conviene convertirlo a θ o identificar el cateto adyacente. La operación inversa, θ = arctg(F_y/F_x), requiere corregir el cuadrante.",
    simple: "Primero mirá desde qué eje se mide el ángulo. La componente sobre ese eje va con coseno y la otra con seno. Después poné los signos según hacia dónde apunta la flecha.",
    nino: "Es como la sombra de un palo inclinado al mediodía: la sombra en el piso es la componente horizontal. Si inclinás más el palo hacia el piso, la sombra crece y la «altura» baja. Lo que importa es respecto de qué línea medís la inclinación.",
    ejemplo: "20 N a 30° desde +y hacia +x: F_x = 20·sen 30° = 10 N, F_y = 20·cos 30° = 17,3 N.",
    visual: { type: "vector-components", mag: 5, angle: 60 },
    visualText: "Mové el ángulo y mirá cómo cambian las proyecciones (y sus signos) al pasar de cuadrante.",
    fromZero: "Un vector es una flecha. Para hacer cuentas lo reemplazamos por dos números: cuánto avanza en x y cuánto en y. La flecha y esos dos avances forman un triángulo rectángulo: la flecha es la hipotenusa. En un triángulo rectángulo, cateto adyacente = hipotenusa·cos(ángulo) y cateto opuesto = hipotenusa·sen(ángulo). Todo el tema es identificar cuál cateto es cuál.",
    why: "Las fuerzas y velocidades no se pueden sumar «de a módulos»: se suman componente a componente. Por eso descomponer bien es el primer paso de casi cualquier ejercicio de estática, dinámica o tiro oblicuo.",
    origin: "Sale de la definición de seno y coseno en el triángulo rectángulo: cos α = adyacente/hipotenusa ⇒ adyacente = |F|·cos α. Con θ medido desde +x en la circunferencia trigonométrica, el signo de cos θ y sen θ ya incluye el cuadrante.",
    board: vecComponentesBoard,
  },
};

const vecOperacionesBoard: BoardStep[] = [
  { expr: "A = (4; −1) N,  B = (−2; 5) N", note: "datos" },
  { expr: "B − A = (−2 − 4; 5 − (−1))", note: "restamos componente a componente" },
  { expr: "B − A = (−6; 6) N" },
  { expr: "|B − A| = √(36 + 36) = 8,49 N", note: "Pitágoras" },
  { expr: "(A × B)_z = 4 · 5 − (−1)(−2)", note: "cruzado y restado: A_x·B_y − A_y·B_x" },
  { expr: "(A × B)_z = 20 − 2 = 18 N²" },
];

export const vecOperacionesLesson: Lesson = {
  id: "l-vec-operaciones",
  title: "Resta, equilibrante y producto vectorial",
  subtitle: "Las tres operaciones que más se toman con vectores",
  subjectId: S,
  topicIds: ["t-vec-operaciones"],
  estimatedMinutes: 12,
  prerequisites: ["t-vec-componentes", "t-producto-escalar"],
  cards: [
    intro(
      "Operar con vectores",
      "Restar vectores (B − A), encontrar la fuerza que equilibra un sistema y calcular el producto vectorial en el plano.",
      "La equilibrante es la base de toda la estática, y el producto vectorial es la herramienta del momento de una fuerza.",
    ),
    explain(
      "Restar es sumar el opuesto",
      "$B − A = B + (−A)$: das vuelta la flecha de $A$ y la sumás a $B$. Por componentes:\n\n$B − A = (B_x − A_x; B_y − A_y)$\n\nGeométricamente, $B − A$ es la flecha que va **desde la punta de A hasta la punta de B**. Por eso $A − B$ es la misma flecha al revés.",
      { tag: "intuitivo", widget: { type: "vector", x: -2, y: 5, showSum: true } },
    ),
    quiz("Para pensar", {
      id: "q-fis3-equilibrante",
      subjectId: S,
      topicId: "t-vec-operaciones",
      prompt: "La resultante de varias fuerzas es $R = (6; −8)$ N. ¿Cuál es la equilibrante?",
      options: ["$(−6; 8)$ N", "$(6; −8)$ N", "$10$ N"],
      answer: 0,
      explanation: "La equilibrante anula a la resultante: E = −R = (−6; 8) N. Su módulo es 10 N, pero es un vector: hay que dar dirección y sentido.",
      hints: ["En equilibrio, R + E = 0.", "Despejá E.", "E = −R: cambian de signo las dos componentes."],
      errors: {
        1: ["vectores", "Esa es la resultante. La equilibrante es la que hay que AGREGAR para que todo sume cero: E = −R."],
        2: ["vectores", "10 N es solo el módulo. La equilibrante es un vector: (−6; 8) N."],
      },
    }),
    explain(
      "Producto vectorial en el plano",
      "Para $A = (A_x; A_y)$ y $B = (B_x; B_y)$, el producto vectorial apunta perpendicular al plano (eje z):\n\n$(A × B)_z = A_x B_y − A_y B_x$\n\nTambién: $|A × B| = |A||B| sen φ$. Escalar → coseno y da un número; vectorial → seno y da un vector. Y no es conmutativo: $B × A = −(A × B)$.",
      { tag: "matematico" },
    ),
    board("Pizarra: resta y producto vectorial", vecOperacionesBoard, "Con A = (4; −1) N y B = (−2; 5) N."),
    example(
      "Equilibrante de dos fuerzas",
      "$F_1 = (3; 4)$ N y $F_2 = (5; −7)$ N. ¿Qué fuerza hay que agregar para el equilibrio?",
      ["$R = (3 + 5; 4 − 7) = (8; −3)$ N", "$E = −R = (−8; 3)$ N", "$|E| = √(64 + 9) = 8,54$ N"],
      "E = (−8; 3) N, de módulo 8,54 N",
    ),
    practice("Ejercicio guiado", "fis-vec-resta", 2, 5, true),
    explain(
      "Errores típicos",
      "• Calcular $A − B$ cuando piden $B − A$ (sale el opuesto).\n• Dar la **resultante** cuando piden la **equilibrante**.\n• En $A × B$, hacer «x con x, y con y»: eso es el producto **escalar**.\n• $|B − A| ≠ |B| − |A|$: primero se resta por componentes, después Pitágoras.",
      { tag: "cotidiano" },
    ),
    practice("Tu turno", "fis-vec-equilibrante", 3, 7),
    practice("Tu turno", "fis-vec-producto-vectorial", 3, 12),
    practice("Desafío", "fis-vec-equilibrante", 5, 18),
    summary([
      "B − A = (B_x − A_x; B_y − A_y): de la punta de A a la punta de B.",
      "Equilibrante: E = −R (mismo módulo, sentido opuesto).",
      "(A × B)_z = A_x·B_y − A_y·B_x; B × A = −A × B.",
      "Escalar: número, con coseno. Vectorial: vector, con seno.",
    ]),
  ],
  tutor: {
    normal: "La diferencia B − A se calcula componente a componente y representa el vector que une el extremo de A con el de B. La equilibrante de un sistema de fuerzas es E = −ΣF. El producto vectorial de dos vectores del plano xy tiene solo componente z: (A × B)_z = A_x B_y − A_y B_x = |A||B| sen φ, con signo según el sentido de giro de A hacia B.",
    simple: "Restar: restá x con x e y con y. Equilibrante: la resultante dada vuelta. Producto vectorial: multiplicá cruzado y restá (A_x·B_y menos A_y·B_x).",
    nino: "Si dos chicos tiran de una caja y querés que no se mueva, tenés que tirar vos con la misma fuerza que hacen ellos juntos, pero para el otro lado. Esa es la equilibrante.",
    ejemplo: "A = (1; 2), B = (3; 1): B − A = (2; −1); (A × B)_z = 1·1 − 2·3 = −5.",
    visual: { type: "vector", x: 3, y: -2, showSum: true },
    visualText: "Movés uno de los vectores y ves la suma: la equilibrante sería la flecha de la suma dada vuelta.",
    fromZero: "Un vector se escribe con dos números (x; y). Sumar o restar vectores es sumar o restar esos números por separado. Una fuerza que «equilibra» es la que, sumada a todas las demás, da (0; 0). El producto vectorial es otra forma de combinar dos vectores que mide cuánto «giran» uno respecto del otro.",
    why: "En estática la condición de equilibrio es que la suma de fuerzas sea cero (eso pide la equilibrante) y que la suma de momentos sea cero (y el momento es un producto vectorial r × F).",
    origin: "Del determinante: A × B = det[[i, j, k], [A_x, A_y, 0], [B_x, B_y, 0]] = (A_x B_y − A_y B_x)·k. Con A = |A|(cos α; sen α) y B = |B|(cos β; sen β) queda |A||B|(cos α sen β − sen α cos β) = |A||B| sen(β − α).",
    board: vecOperacionesBoard,
  },
};

// ═══════════════════════════ Unidad 2: MRU / MRUV ═══════════════════════════

const encuentroBoard: BoardStep[] = [
  { expr: "x_A = 90 · t", note: "auto: parte del km 0 a 90 km/h" },
  { expr: "x_B = 45 + 60 · t", note: "camión: parte del km 45 a 60 km/h" },
  { expr: "90 · t = 45 + 60 · t", note: "encuentro: misma posición" },
  { expr: "30 · t = 45", note: "restamos 60·t en ambos lados" },
  { expr: "t = 1,5 h", note: "dividimos por 30" },
  { expr: "x = 90 · 1,5 = 135 km", note: "reemplazamos en cualquiera de las dos" },
];

export const encuentroLesson: Lesson = {
  id: "l-encuentro",
  title: "Encuentro y desfase en MRU",
  subtitle: "Dos móviles, una sola ecuación",
  subjectId: S,
  topicIds: ["t-encuentro"],
  estimatedMinutes: 10,
  prerequisites: ["t-mru", "t-unidades"],
  cards: [
    intro("Problemas de encuentro", "Plantear la posición de dos móviles en un mismo sistema de referencia, igualarlas para hallar dónde y cuándo se encuentran, y calcular desfases de llegada.", "Es un clásico de primer parcial: suele venir con velocidades en km/h, distancias en km y la respuesta pedida en minutos."),
    explain(
      "Igualar posiciones, no distancias",
      "Dos autos se encuentran cuando están **en el mismo lugar al mismo tiempo**. No tienen por qué haber recorrido lo mismo: uno puede haber salido más adelante.\n\nPor eso el truco es escribir la **posición** de cada uno, $x(t) = x_0 + v·t$, con el **mismo origen** y el **mismo sentido positivo**, e igualarlas.",
      { tag: "intuitivo", widget: { type: "motion", v0: 15, a: 0 } },
    ),
    quiz("Para pensar", {
      id: "q-fis3-encuentro-signo",
      subjectId: S,
      topicId: "t-encuentro",
      prompt: "Dos ciudades están a 200 km. Un auto sale de A hacia B a 80 km/h y otro sale de B hacia A a 120 km/h. Con origen en A, ¿cuál es la ecuación del segundo?",
      options: ["$x = 200 − 120·t$", "$x = 200 + 120·t$", "$x = 120·t$"],
      answer: 0,
      explanation: "Parte de x₀ = 200 km y se mueve hacia el origen, o sea en sentido negativo: v = −120 km/h. Entonces x = 200 − 120·t.",
      hints: ["¿Dónde está el segundo auto en t = 0?", "¿Hacia qué lado se mueve respecto del eje elegido?", "Si va hacia el origen, su velocidad es negativa."],
      errors: {
        1: ["signos", "Con el eje apuntando de A hacia B, ir hacia A es moverse en sentido negativo: la velocidad lleva signo menos."],
        2: ["conceptual", "Falta la posición inicial: en t = 0 ese auto está en el km 200, no en el 0."],
      },
    }),
    explain(
      "La fórmula detrás",
      "**Mismo sentido** (A persigue a B, que le lleva $d_0$): $v_A t = d_0 + v_B t$ ⇒ $t = \\frac{d_0}{v_A − v_B}$.\n\n**Sentidos opuestos** (separados $d_0$): $v_A t = d_0 − v_B t$ ⇒ $t = \\frac{d_0}{v_A + v_B}$.\n\n**Desfase** de llegada en un mismo recorrido $d$: $Δt = \\frac{d}{v_{lento}} − \\frac{d}{v_{rápido}}$.",
      { tag: "matematico" },
    ),
    board("Pizarra: encuentro en el mismo sentido", encuentroBoard, "Un auto pasa por el km 0 a 90 km/h; en ese instante un camión pasa por el km 45 a 60 km/h, en el mismo sentido."),
    example(
      "Desfase de llegada",
      "Un micro a 80 km/h y un auto a 100 km/h salen juntos a recorrer 240 km. ¿Cuántos minutos antes llega el auto?",
      ["$t_{micro} = 240/80 = 3$ h", "$t_{auto} = 240/100 = 2,4$ h", "$Δt = 0,6$ h $= 0,6 · 60 = 36$ min"],
      "36 min",
    ),
    practice("Ejercicio guiado", "fis-mru-encuentro", 2, 3, true),
    explain(
      "Errores típicos",
      "• **Sumar las velocidades** cuando van en el mismo sentido (o restarlas cuando van enfrentados).\n• Mezclar km/h con segundos: elegí un sistema y no lo cambies.\n• **2,49 h no son 2 h 49 min**: 0,49 h · 60 = 29,4 min. Los decimales de una hora se multiplican por 60.",
      { tag: "cotidiano" },
    ),
    practice("Tu turno", "fis-mru-desfase", 3, 8),
    practice("Tu turno", "fis-mru-encuentro", 4, 15),
    practice("Desafío", "fis-mru-encuentro", 6, 22),
    summary([
      "Escribí x(t) = x₀ + v·t de cada móvil con el mismo origen y sentido.",
      "Encuentro: x_A(t) = x_B(t).",
      "Mismo sentido: t = d₀/(v_A − v_B). Opuestos: t = d₀/(v_A + v_B).",
      "Desfase: d/v_lento − d/v_rápido.",
      "Horas decimales → minutos: · 60.",
    ]),
  ],
  tutor: {
    normal: "Para resolver un problema de encuentro se plantean las ecuaciones horarias x(t) = x₀ + v·t de ambos móviles en un único sistema de referencia, con los signos de velocidad correspondientes, y se iguala x_A(t) = x_B(t). La solución t es el instante de encuentro y reemplazándola se obtiene la posición.",
    simple: "Escribí dónde está cada uno en cada momento y preguntate: ¿cuándo están en el mismo lugar? Eso es igualar las dos ecuaciones.",
    nino: "Si tu amigo sale caminando y vos salís en bici detrás, lo alcanzás cuando estén en la misma esquina. Cada minuto le descontás la diferencia de velocidades: si te lleva 300 m y le sacás 150 m por minuto, lo alcanzás en 2 minutos.",
    ejemplo: "A en km 0 a 100 km/h, B en km 50 a 75 km/h (mismo sentido): t = 50/25 = 2 h, x = 200 km.",
    visual: { type: "kinematics", x0: 0, v0: 10, a: 0 },
    visualText: "Cada móvil es una recta en el gráfico x–t; el encuentro es donde se cruzan.",
    fromZero: "En MRU la posición crece lo mismo cada hora: x = x₀ + v·t. Si hay dos móviles, cada uno tiene su ecuación. Que «se encuentren» quiere decir que en algún instante sus posiciones son el mismo número. Igualar las dos expresiones da una ecuación lineal en t.",
    why: "Igualar posiciones evita pensar casos: el álgebra se encarga del sentido de cada móvil si los signos de las velocidades están bien puestos.",
    origin: "De x_A = x_B: x₀A + v_A t = x₀B + v_B t ⇒ t = (x₀B − x₀A)/(v_A − v_B). Si van enfrentados, v_B es negativa y el denominador queda v_A + |v_B|.",
    board: encuentroBoard,
  },
};

const frenadoBoard: BoardStep[] = [
  { expr: "v₀ = 90 km/h ÷ 3,6 = 25 m/s", note: "pasamos a m/s" },
  { expr: "d₁ = 25 · 0,8 = 20 m", note: "reacción: MRU (todavía no frena)" },
  { expr: "d₂ = (25 + 0)/2 · 5 = 62,5 m", note: "frenado: velocidad media por tiempo" },
  { expr: "d = 20 + 62,5 = 82,5 m", note: "sumamos los dos tramos" },
  { expr: "a = (0 − 25)/5 = −5 m/s²", note: "aceleración del frenado" },
];

export const frenadoLesson: Lesson = {
  id: "l-frenado-persecucion",
  title: "Reacción, frenado y persecución",
  subtitle: "Cuando un tramo es MRU y otro MRUV",
  subjectId: S,
  topicIds: ["t-frenado"],
  estimatedMinutes: 12,
  prerequisites: ["t-mruv", "t-encuentro"],
  cards: [
    intro("Movimientos combinados", "Resolver problemas con un tiempo de reacción seguido de un frenado, y persecuciones entre un móvil a velocidad constante y otro que acelera desde el reposo.", "Son los problemas de MRUV más tomados: combinan dos modelos y castigan a quien se olvida de un tramo."),
    explain(
      "El pie tarda en llegar al freno",
      "Cuando un conductor ve un peligro, pasa un rato (el **tiempo de reacción**, menos de un segundo a varios) hasta que pisa el freno. Durante ese rato el auto **sigue a la misma velocidad**: es MRU.\n\nRecién después empieza el **frenado**, con aceleración negativa: MRUV hasta $v = 0$.",
      { tag: "cotidiano", widget: { type: "motion", v0: 20, a: -4 } },
    ),
    quiz("Para pensar", {
      id: "q-fis3-persecucion",
      subjectId: S,
      topicId: "t-frenado",
      prompt: "Un auto pasa a 20 m/s junto a una moto detenida, que arranca con $a = 4$ m/s². En $t = 5$ s ambos van a 20 m/s. ¿Qué pasa en ese instante?",
      options: ["Están lo más separados posible", "La moto alcanza al auto", "La moto ya pasó al auto"],
      answer: 0,
      explanation: "Hasta los 5 s el auto es más rápido y se aleja; a partir de ahí la moto es más rápida y empieza a descontar. Igualar velocidades da la máxima separación; el encuentro es en t = 2v/a = 10 s.",
      hints: ["¿Quién es más rápido antes de los 5 s?", "Mientras el auto sea más rápido, la distancia entre ellos crece.", "Igualar velocidades no es igualar posiciones."],
      errors: {
        1: ["velocidad-aceleracion", "Igualaste velocidades, no posiciones. Que vayan igual de rápido no significa que estén en el mismo lugar: en ese instante la distancia entre ellos es máxima."],
        2: ["velocidad-aceleracion", "Hasta ese instante el auto fue más rápido todo el tiempo: la moto todavía no pudo alcanzarlo."],
      },
    }),
    explain(
      "Las cuentas",
      "**Frenado** desde $v_0$ en un tiempo $t_f$: $d = v_0·t_r + \\frac{v_0}{2}·t_f$, con $|a| = v_0 / t_f$. Si te dan la distancia de frenado: $v^2 = v_0^2 + 2aΔx$.\n\n**Persecución** desde el reposo: $v·t = \\frac{1}{2} a t^2$ ⇒ $t = \\frac{2v}{a}$. En ese momento la moto va a $2v$.",
      { tag: "matematico", widget: { type: "kinematics", x0: 0, v0: 0, a: 4 } },
    ),
    board("Pizarra: reacción + frenado", frenadoBoard, "Un auto va a 90 km/h; el conductor tarda 0,8 s en reaccionar y frena hasta detenerse en 5 s."),
    example(
      "Persecución",
      "Un auto pasa a 20 m/s junto a una moto detenida que arranca con 4 m/s². ¿Cuándo y dónde la alcanza?",
      ["$20·t = \\frac{1}{2}·4·t^2 = 2t^2$", "$t(2t − 20) = 0$ ⇒ $t = 10$ s (la otra solución, $t = 0$, es la partida)", "$x = 20 · 10 = 200$ m; la moto va a $4 · 10 = 40$ m/s"],
      "10 s, a 200 m",
    ),
    practice("Ejercicio guiado", "fis-frenado", 2, 6, true),
    explain(
      "Errores típicos",
      "• **Olvidar el tramo de reacción** (y su distancia $v_0·t_r$).\n• Usar $v_0·t$ durante el frenado como si no bajara la velocidad: la distancia es la velocidad **media** por el tiempo.\n• En la persecución, **igualar velocidades** en vez de posiciones.\n• Operar con km/h y segundos a la vez.",
      { tag: "intuitivo" },
    ),
    practice("Tu turno", "fis-persecucion", 3, 10),
    practice("Tu turno", "fis-frenado", 4, 17),
    practice("Desafío", "fis-persecucion", 5, 23),
    summary([
      "Reacción: MRU a v₀. Frenado: MRUV hasta v = 0.",
      "d_frenado = (v₀/2)·t_f; |a| = v₀/t_f; o v² = v₀² + 2aΔx.",
      "Persecución desde el reposo: t = 2v/a.",
      "Igualar velocidades da la máxima separación, no el encuentro.",
      "Siempre pasá km/h a m/s.",
    ]),
  ],
  tutor: {
    normal: "El movimiento se separa en etapas con distinto modelo: durante el tiempo de reacción el móvil mantiene su velocidad (MRU) y luego desacelera uniformemente (MRUV). Las condiciones finales de una etapa son las iniciales de la siguiente. En una persecución se plantean ambas ecuaciones horarias y se igualan posiciones; si una es cuadrática, se usa la resolvente y se descartan las raíces sin sentido físico.",
    simple: "Partí el problema en pedazos: primero sigue igual de rápido (reacción), después frena. Calculá la distancia de cada pedazo y sumalas.",
    nino: "Vas en bici y aparece un perro: primero te das cuenta (seguís igual de rápido un ratito) y recién después apretás los frenos. Por eso hay que dejar distancia: el «darse cuenta» también te hace avanzar.",
    ejemplo: "72 km/h = 20 m/s, reacción 1 s, frena en 4 s: 20 + 10·4 = 60 m.",
    visual: { type: "motion", v0: 20, a: -5 },
    visualText: "Con aceleración negativa la flecha de v se achica hasta que el móvil se detiene.",
    fromZero: "En MRU la distancia es velocidad por tiempo. En MRUV la velocidad cambia de manera pareja, así que la distancia es la velocidad promedio ((inicial + final)/2) por el tiempo. Un frenado completo termina en v = 0, así que el promedio es la mitad de la inicial.",
    why: "Separar en etapas permite usar en cada una el modelo correcto. Un único modelo para todo el recorrido da un resultado equivocado.",
    origin: "Con aceleración constante, v crece linealmente y el área bajo v(t) es un trapecio: Δx = (v₀ + v)/2·t. Con v = 0 queda v₀·t/2. En la persecución, igualar v·t = ½at² y dividir por t (t ≠ 0) da t = 2v/a.",
    board: frenadoBoard,
  },
};

const graficosBoard: BoardStep[] = [
  { expr: "(0; 2) → (4; 10) → (10; 10) → (14; 0)", note: "puntos del gráfico v–t (s; m/s)" },
  { expr: "a₁ = (10 − 2)/(4 − 0) = 2 m/s²", note: "pendiente del primer tramo" },
  { expr: "A₁ = (2 + 10)/2 · 4 = 24 m", note: "trapecio" },
  { expr: "A₂ = 10 · 6 = 60 m", note: "rectángulo" },
  { expr: "A₃ = 10 · 4 / 2 = 20 m", note: "triángulo" },
  { expr: "Δx = 24 + 60 + 20 = 104 m", note: "desplazamiento total" },
];

export const graficosVtLesson: Lesson = {
  id: "l-graficos-vt",
  title: "Gráficos velocidad–tiempo",
  subtitle: "La pendiente es la aceleración; el área, el desplazamiento",
  subjectId: S,
  topicIds: ["t-graficos-vt"],
  estimatedMinutes: 10,
  prerequisites: ["t-mruv", "t-recta"],
  cards: [
    intro("Leer un gráfico v–t", "Sacar la aceleración de la pendiente y la distancia del área bajo la curva, tramo por tramo.", "En los parciales suelen dar un gráfico de varios tramos y preguntar la aceleración en uno y la distancia en otro intervalo."),
    explain(
      "Qué mirar",
      "En un gráfico de velocidad en función del tiempo:\n\n• **Recta horizontal**: velocidad constante (MRU).\n• **Recta inclinada**: velocidad que cambia parejo (MRUV). Cuanto más empinada, más aceleración.\n• **Altura**: qué tan rápido va. **No** dónde está.",
      { tag: "intuitivo" },
    ),
    quiz("Para pensar", {
      id: "q-fis3-vt-area",
      subjectId: S,
      topicId: "t-graficos-vt",
      prompt: "En un gráfico v–t, la velocidad se mantiene en 10 m/s entre $t = 2$ s y $t = 6$ s. ¿Qué distancia recorre en ese intervalo?",
      options: ["40 m", "60 m", "0 m: no tiene aceleración"],
      answer: 0,
      explanation: "El área del rectángulo es 10 m/s · (6 − 2) s = 40 m. El área bajo el gráfico v–t es el desplazamiento.",
      hints: ["¿Qué representa el área bajo un gráfico v–t?", "La base es el intervalo de tiempo.", "Base: 6 − 2 = 4 s."],
      errors: {
        1: ["conceptual", "Tomaste como base el instante final (6 s). La base es el intervalo: 6 − 2 = 4 s."],
        2: ["velocidad-aceleracion", "Sin aceleración no significa quieto: va a 10 m/s todo el intervalo."],
      },
    }),
    explain(
      "Pendiente y área",
      "**Pendiente** $= \\frac{Δv}{Δt} = a$.\n\n**Área** bajo la curva $= Δx$ (si $v$ cambia de signo, el área por debajo del eje cuenta negativa).\n\nLas figuras son siempre rectángulos, triángulos o trapecios: $A_{trapecio} = \\frac{v_1 + v_2}{2}·Δt$. Fijate que es la misma fórmula que $Δx = v_{media}·Δt$ del MRUV.",
      { tag: "matematico", widget: { type: "kinematics", x0: 0, v0: 2, a: 2 } },
    ),
    board("Pizarra: gráfico de tres tramos", graficosBoard),
    example(
      "Velocidad media",
      "Con el mismo gráfico (104 m en 14 s), ¿cuál es la velocidad media?",
      ["$v_m = Δx / Δt$", "$v_m = 104 / 14$", "$v_m = 7,43$ m/s"],
      "7,43 m/s",
    ),
    practice("Ejercicio guiado", "fis-grafico-vt", 2, 4, true),
    explain(
      "Errores típicos",
      "• Calcular la pendiente como $v/t$ en vez de $Δv/Δt$.\n• Usar un rectángulo de altura máxima en un tramo inclinado (es triángulo o trapecio).\n• Tomar como base el instante final en lugar del **intervalo**.\n• Promediar velocidades para la velocidad media: es $Δx/Δt$.",
      { tag: "cotidiano" },
    ),
    practice("Tu turno", "fis-grafico-vt", 3, 9),
    practice("Tu turno", "fis-grafico-vt", 4, 14),
    practice("Desafío", "fis-grafico-vt", 6, 25),
    summary([
      "Pendiente del gráfico v–t = aceleración (Δv/Δt).",
      "Área bajo el gráfico v–t = desplazamiento.",
      "Trapecio: (v₁ + v₂)/2 · Δt.",
      "Velocidad media = Δx/Δt (no el promedio de velocidades).",
    ]),
  ],
  tutor: {
    normal: "En el gráfico v(t), la pendiente de la recta en cada tramo es la aceleración media del intervalo, a = Δv/Δt, y el área encerrada entre la curva y el eje del tiempo es el desplazamiento Δx (con signo). La velocidad media es Δx total dividido el intervalo total.",
    simple: "Inclinación de la línea = aceleración. Superficie debajo de la línea = metros recorridos. Partí la superficie en rectángulos y triángulos.",
    nino: "Si en el auto el velocímetro marca 60 km/h durante 2 horas, hiciste 120 km: es el «rectángulo» 60 × 2. Si el velocímetro va subiendo de 0 a 60 en 2 horas, hiciste la mitad: el triángulo.",
    ejemplo: "De (0; 0) a (5; 10): a = 2 m/s², Δx = 5·10/2 = 25 m.",
    visual: { type: "kinematics", x0: 0, v0: 0, a: 2 },
    visualText: "Mirá el gráfico de velocidad: es una recta cuya pendiente es la aceleración elegida.",
    fromZero: "Un gráfico tiene el tiempo en el eje horizontal y la velocidad en el vertical. Si la velocidad no cambia, es una línea horizontal; si cambia de a poco y parejo, es una recta inclinada. «Pendiente» es cuánto sube la recta por cada segundo, y eso es justamente la aceleración.",
    why: "Muchos problemas dan el movimiento como gráfico en lugar de fórmulas. Leer pendientes y áreas permite resolverlos sin plantear ecuaciones horarias.",
    origin: "Si v es constante, Δx = v·Δt: el área de un rectángulo. Si v varía linealmente, la distancia es la velocidad media por Δt, que coincide con el área del trapecio. En general, sumar rectangulitos v·dt da la integral: el área bajo la curva.",
    board: graficosBoard,
  },
};

// ═══════════════════════════ Unidad 2d: tiro oblicuo ═══════════════════════════

const tiroBoard: BoardStep[] = [
  { expr: "v₀x = 30 · cos 40° = 23,0 m/s", note: "horizontal: MRU" },
  { expr: "v₀y = 30 · sen 40° = 19,3 m/s", note: "vertical: tiro vertical" },
  { expr: "t_s = 19,3 / 9,80 = 1,97 s", note: "en la altura máxima v_y = 0" },
  { expr: "h_máx = 19,3² / (2 · 9,80) = 19,0 m" },
  { expr: "t_v = 2 · 1,97 = 3,94 s", note: "cae al mismo nivel: subida = bajada" },
  { expr: "x = 23,0 · 3,94 = 90,4 m", note: "alcance = v₀x · t_v" },
];

export const tiroOblicuoLesson: Lesson = {
  id: "l-tiro-oblicuo",
  title: "Tiro oblicuo",
  subtitle: "Un MRU y un tiro vertical al mismo tiempo",
  subjectId: S,
  topicIds: ["t-tiro-oblicuo"],
  estimatedMinutes: 12,
  prerequisites: ["t-caida-libre", "t-vec-componentes"],
  cards: [
    intro("Tiro oblicuo desde el suelo", "Separar el lanzamiento en un movimiento horizontal (MRU) y uno vertical (tiro vertical) para calcular altura máxima, tiempo de vuelo y alcance.", "Es el tema central del segundo parcial: aparece en casi todos los temas, a veces dentro de un problema integrador."),
    explain(
      "Dos movimientos independientes",
      "Si tirás una pelota en diagonal, la gravedad **solo tira hacia abajo**. Entonces:\n\n• En **horizontal** nada la frena: avanza siempre a la misma velocidad (MRU).\n• En **vertical** es un tiro vertical: sube frenándose, se detiene arriba y vuelve a caer.\n\nEl tiempo es lo único que comparten.",
      { tag: "intuitivo", widget: { type: "projectile", v0: 20, angle: 45, h0: 0 } },
    ),
    quiz("Para pensar", {
      id: "q-fis3-tiro-hmax",
      subjectId: S,
      topicId: "t-tiro-oblicuo",
      prompt: "En el punto más alto de un tiro oblicuo, ¿cuánto vale la velocidad?",
      options: ["Solo queda la componente horizontal $v_{0x}$", "Cero", "$v_0$, la misma que al salir"],
      answer: 0,
      explanation: "Arriba se anula solo la componente vertical. La horizontal nunca cambia, así que la velocidad es v₀x (no cero).",
      hints: ["¿Qué componente frena la gravedad?", "La horizontal no tiene aceleración.", "En la altura máxima, v_y = 0."],
      errors: {
        1: ["vectores", "Eso pasa en un tiro VERTICAL. En el oblicuo la pelota sigue avanzando: v_x = v₀x no se anula."],
        2: ["velocidad-aceleracion", "La componente vertical sí cambió: arriba vale 0. Solo queda v₀x, que es menor que v₀."],
      },
    }),
    explain(
      "Las ecuaciones",
      "Con $θ$ medido desde la horizontal: $v_{0x} = v_0 cos θ$, $v_{0y} = v_0 sen θ$.\n\n$x(t) = v_{0x}·t$   $y(t) = v_{0y}·t − \\frac{1}{2} g t^2$   $v_y(t) = v_{0y} − g t$\n\nDe ahí: $t_s = \\frac{v_{0y}}{g}$, $h_{máx} = \\frac{v_{0y}^2}{2g}$, $t_v = 2 t_s$, alcance $= v_{0x}·t_v$.",
      { tag: "matematico" },
    ),
    board("Pizarra: tiro desde el suelo", tiroBoard, "Una pelota sale del suelo a 30 m/s formando 40° con la horizontal (g = 9,80 m/s²)."),
    example(
      "Rapidez en un instante",
      "Con el mismo tiro (v₀x = 23,0 m/s, v₀y = 19,3 m/s), ¿qué rapidez tiene a los 3 s?",
      ["$v_y = 19,3 − 9,80 · 3 = −10,1$ m/s (ya baja)", "$v_x = 23,0$ m/s (no cambia)", "$|v| = √(23,0^2 + 10,1^2) = 25,1$ m/s"],
      "25,1 m/s",
    ),
    practice("Ejercicio guiado", "fis-tiro-oblicuo", 2, 5, true),
    explain(
      "Errores típicos",
      "• **sen ↔ cos**: con θ desde la horizontal, la vertical va con **seno**.\n• Usar $v_0$ entera para la altura máxima (solo cuenta $v_{0y}$).\n• Calcular el alcance con el tiempo de **subida** en vez del de vuelo.\n• Restarle $g·t$ a la rapidez total: la gravedad solo cambia $v_y$.",
      { tag: "cotidiano" },
    ),
    practice("Tu turno", "fis-tiro-oblicuo", 3, 11),
    practice("Tu turno", "fis-tiro-oblicuo", 4, 16),
    practice("Desafío", "fis-tiro-oblicuo", 6, 29),
    summary([
      "Horizontal: MRU con v₀x = v₀ cos θ.",
      "Vertical: tiro vertical con v₀y = v₀ sen θ.",
      "h_máx = v₀y²/(2g); t_s = v₀y/g; t_v = 2t_s (mismo nivel).",
      "Alcance = v₀x · t_v.",
      "Arriba v = v₀x, no cero.",
    ]),
  ],
  tutor: {
    normal: "El tiro oblicuo es un movimiento en el plano con aceleración constante g vertical. Por el principio de independencia, se descompone en un MRU horizontal con v₀x = v₀ cos θ y un MRUV vertical con v₀y = v₀ sen θ y a = −g. Ambos comparten el tiempo; la trayectoria resultante es una parábola.",
    simple: "Partí el tiro en dos: de costado avanza siempre igual; para arriba sube, se frena y baja. Calculá cada parte por separado y unilas con el tiempo.",
    nino: "Si vas en un tren a velocidad constante y tirás una pelota para arriba, te vuelve a la mano: para vos sube y baja, pero alguien desde el andén la ve hacer una curva porque además avanza con el tren. Eso es un tiro oblicuo.",
    ejemplo: "v₀ = 20 m/s a 30°: v₀y = 10 m/s → h_máx = 100/19,6 = 5,10 m; t_v = 2,04 s; alcance = 17,3·2,04 = 35,3 m.",
    visual: { type: "projectile", v0: 25, angle: 40, h0: 0 },
    visualText: "Fijate que la flecha de v_x no cambia nunca, mientras v_y se achica, se anula y crece hacia abajo.",
    fromZero: "Cuando algo se mueve en diagonal, podemos describir su movimiento con dos números en cada instante: cuánto avanzó de costado (x) y a qué altura está (y). La gravedad solo empuja hacia abajo, así que solo afecta a y. Para x usamos la fórmula de velocidad constante; para y, la de caída libre.",
    why: "Separar en componentes transforma un problema en el plano (difícil) en dos problemas en línea recta que ya sabés resolver.",
    origin: "Con a = (0; −g), integrar da v(t) = (v₀x; v₀y − g t) y r(t) = (v₀x t; v₀y t − ½ g t²). Con v_y = 0 sale t_s = v₀y/g, y reemplazando en y(t): h_máx = v₀y²/(2g).",
    board: tiroBoard,
  },
};

const tiroAlturaBoard: BoardStep[] = [
  { expr: "v₀x = 15 · cos 30° = 13,0 m/s,  v₀y = 15 · sen 30° = 7,5 m/s", note: "componentes" },
  { expr: "y(t) = 10 + 7,5 t − 4,9 t²", note: "origen en el piso: y₀ = h₀ = 10 m" },
  { expr: "0 = 10 + 7,5 t − 4,9 t²", note: "llega al piso: y = 0" },
  { expr: "t = (7,5 + √(7,5² + 4 · 4,9 · 10)) / 9,8", note: "resolvente; raíz positiva" },
  { expr: "t = 2,39 s" },
  { expr: "x = 13,0 · 2,39 = 31,0 m", note: "alcance" },
  { expr: "h_máx = 10 + 7,5² / 19,6 = 12,9 m", note: "¡sumar h₀!" },
];

export const tiroAlturaLesson: Lesson = {
  id: "l-tiro-altura",
  title: "Tiro desde una altura y otros astros",
  subtitle: "Cuando el piso no está donde empezaste",
  subjectId: S,
  topicIds: ["t-tiro-altura"],
  estimatedMinutes: 12,
  prerequisites: ["t-tiro-oblicuo", "t-cuadratica"],
  cards: [
    intro("Lanzar desde arriba", "Resolver tiros horizontales y oblicuos que parten de una altura h₀ usando la resolvente, y caídas en astros con otra gravedad.", "Las fórmulas cortas (t = 2v₀y/g) dejan de valer si el piso está más abajo que el punto de lanzamiento. Es una trampa clásica."),
    explain(
      "El piso está más lejos",
      "Si tirás una pelota desde una terraza, sube un poco, vuelve a pasar por la altura de tu mano… y **todavía le falta caer** hasta el piso.\n\nPor eso el tiempo de vuelo es mayor que $2v_{0y}/g$, y la altura máxima respecto del piso es $h_0$ **más** lo que sube.",
      { tag: "cotidiano", widget: { type: "projectile", v0: 15, angle: 30, h0: 10 } },
    ),
    quiz("Para pensar", {
      id: "q-fis3-tiro-h0",
      subjectId: S,
      topicId: "t-tiro-altura",
      prompt: "Desde 20 m de altura se lanza una piedra con $v_{0y} = 5$ m/s. Con $v_{0y}^2/(2g) ≈ 1,28$ m, ¿cuál es la altura máxima respecto del piso?",
      options: ["21,3 m", "1,28 m", "20 m"],
      answer: 0,
      explanation: "v₀y²/(2g) = 1,28 m es lo que sube por encima del punto de lanzamiento. Respecto del piso: 20 + 1,28 = 21,3 m.",
      hints: ["¿Desde dónde se mide lo que sube?", "v₀y²/(2g) es la subida por encima de la mano.", "Sumá la altura inicial."],
      errors: {
        1: ["conceptual", "Eso es cuánto sube por encima del punto de lanzamiento. Falta sumar los 20 m iniciales."],
        2: ["conceptual", "Con v₀y > 0 la piedra sube un poco antes de caer: la altura máxima supera los 20 m."],
      },
    }),
    explain(
      "Plantear y(t) = 0",
      "Con el origen en el piso: $y(t) = h_0 + v_{0y} t − \\frac{1}{2} g t^2$. Llega al piso cuando $y = 0$:\n\n$t = \\frac{v_{0y} + √(v_{0y}^2 + 2 g h_0)}{g}$\n\nLa otra raíz es negativa (un instante «antes» de lanzar) y se descarta. **Tiro horizontal** ($v_{0y} = 0$): $t = √(2h_0/g)$.\n\n**Otros astros:** mismas fórmulas, otra $g$. Si se suelta desde $h$ y tarda $t$: $g = 2h/t^2$.",
      { tag: "matematico" },
    ),
    board("Pizarra: tiro desde 10 m", tiroAlturaBoard, "Se lanza una pelota a 15 m/s, 30° sobre la horizontal, desde 10 m de altura."),
    example(
      "Gravedad de la Luna",
      "Un astronauta suelta un martillo desde 2,00 m y tarda 1,57 s en llegar al suelo. ¿Cuánto vale g en la Luna? ¿Cuánto tardaría en caer desde 20 m?",
      ["$2,00 = \\frac{1}{2} g · 1,57^2$ ⇒ $g = 4,00 / 2,46 = 1,62$ m/s²", "$t = √(2 · 20 / 1,62)$", "$t = 4,97$ s"],
      "g = 1,62 m/s²; 4,97 s",
    ),
    practice("Ejercicio guiado", "fis-tiro-altura", 2, 7, true),
    explain(
      "Errores típicos",
      "• **No sumar h₀** a la altura máxima.\n• Usar $t = 2v_{0y}/g$: ese es el tiempo para volver a la altura de partida.\n• Quedarse con la raíz negativa de la resolvente.\n• En otro astro, usar 9,80 m/s² por costumbre.",
      { tag: "intuitivo" },
    ),
    practice("Tu turno", "fis-caida-astros", 3, 12),
    practice("Tu turno", "fis-tiro-altura", 4, 18),
    practice("Desafío", "fis-tiro-altura", 6, 27),
    summary([
      "Origen en el piso: y(t) = h₀ + v₀y t − ½ g t².",
      "Llega al piso: y = 0 → resolvente, raíz positiva.",
      "h_máx (desde el piso) = h₀ + v₀y²/(2g).",
      "Horizontal: t = √(2h₀/g); alcance = v₀·t.",
      "Otro astro: mismas fórmulas, otra g (g = 2h/t²).",
    ]),
  ],
  tutor: {
    normal: "Cuando el lanzamiento parte de una altura h₀, la condición de llegada al suelo es y(t) = 0 en la ecuación horaria vertical y(t) = h₀ + v₀y t − ½ g t², una cuadrática en t. Se resuelve con la fórmula resolvente y se elige la raíz positiva. Las magnitudes horizontales se obtienen luego con ese tiempo. En otro cuerpo celeste solo se reemplaza el valor de g.",
    simple: "Poné el cero en el piso, escribí la altura en función del tiempo y preguntá: ¿cuándo la altura es 0? Eso da una cuadrática; la respuesta es la raíz positiva.",
    nino: "Tirar una pelota desde un balcón es como tirarla en la vereda, pero con un «extra» de caída al final. Por eso tarda más y llega más lejos.",
    ejemplo: "Horizontal desde 4,9 m a 10 m/s: t = √(2·4,9/9,8) = 1 s; cae a 10 m de la base.",
    visual: { type: "projectile", v0: 12, angle: 0, h0: 15 },
    visualText: "Probá con ángulo 0 (tiro horizontal) y después subí la altura: el alcance crece.",
    fromZero: "Una ecuación cuadrática a t² + b t + c = 0 se resuelve con t = (−b ± √(b² − 4ac))/(2a). En la caída, a = −g/2, b = v₀y y c = h₀. De las dos soluciones, una da negativa: correspondería a un tiempo antes de lanzar, así que se descarta.",
    why: "Las fórmulas cortas del tiro oblicuo suponen que sale y llega al mismo nivel. Plantear y(t) = 0 funciona siempre, con cualquier altura inicial.",
    origin: "Multiplicando 0 = h₀ + v₀y t − ½ g t² por −1: ½ g t² − v₀y t − h₀ = 0. La resolvente da t = [v₀y ± √(v₀y² + 2 g h₀)]/g. Como la raíz es mayor que v₀y, el signo «−» da un t negativo.",
    board: tiroAlturaBoard,
  },
};

// ═══════════════════════════ Estática ═══════════════════════════

const nudoBoard: BoardStep[] = [
  { expr: "P = 8 · 9,80 = 78,4 N", note: "peso del cuerpo colgado" },
  { expr: "T₁ · sen 40° = T₂ · sen 60°", note: "ΣF_x = 0 (ángulos con la vertical → horizontal con seno)" },
  { expr: "T₁ · cos 40° + T₂ · cos 60° = 78,4", note: "ΣF_y = 0 (vertical con coseno)" },
  { expr: "T₁ = 1,347 · T₂", note: "despejamos T₁ de la primera" },
  { expr: "(1,347 · 0,766 + 0,5) · T₂ = 78,4", note: "reemplazamos en la segunda" },
  { expr: "T₂ = 51,2 N,  T₁ = 68,9 N" },
];

export const estaticaParticulaLesson: Lesson = {
  id: "l-estatica-particula",
  title: "Equilibrio de una partícula",
  subtitle: "Nudos, cuerdas y el sistema de dos ecuaciones",
  subjectId: S,
  topicIds: ["t-estatica-particula"],
  estimatedMinutes: 12,
  prerequisites: ["t-vec-componentes", "t-vec-operaciones"],
  cards: [
    intro("Cuerpos colgados en equilibrio", "Dibujar el diagrama de cuerpo libre de un nudo y plantear ΣF_x = 0 y ΣF_y = 0 para hallar tensiones, con ángulos medidos desde la vertical o desde la horizontal.", "Es el ejercicio de estática que aparece en todos los primeros parciales, y el lugar donde más se confunden seno y coseno."),
    explain(
      "El nudo no se mueve",
      "Si un cuadro cuelga quieto, el punto donde se juntan las cuerdas está en equilibrio: todo lo que tira hacia la izquierda se compensa con lo que tira hacia la derecha, y lo que tira hacia arriba compensa el peso.\n\nPor eso: **ΣF_x = 0** y **ΣF_y = 0**. Dos ecuaciones, dos tensiones incógnita.",
      { tag: "intuitivo" },
    ),
    quiz("Para pensar", {
      id: "q-fis3-cuadro",
      subjectId: S,
      topicId: "t-estatica-particula",
      prompt: "Un cuadro de peso P cuelga de dos tramos de cuerda iguales e inclinados. ¿Cuánto vale la tensión de cada tramo?",
      options: ["Más que P/2", "Exactamente P/2", "Menos que P/2"],
      answer: 0,
      explanation: "Solo la componente vertical de cada tensión sostiene el cuadro: 2·T·cos α = P ⇒ T = P/(2 cos α), que es mayor que P/2 porque cos α < 1. Cuanto más abiertas, más tensión.",
      hints: ["¿Qué parte de cada tensión sostiene el peso?", "Solo la componente vertical.", "2·T·cos α = P."],
      errors: {
        1: ["conceptual", "P/2 sería con cuerdas verticales. Inclinadas, solo una parte de la tensión (la vertical) sostiene: T tiene que ser mayor."],
        2: ["conceptual", "Al revés: como solo una parte de T sostiene el peso, T tiene que ser mayor que P/2."],
      },
    }),
    explain(
      "¿Seno o coseno?",
      "Preguntate siempre **desde qué línea** se mide el ángulo:\n\n• Desde la **vertical**: componente vertical $= T cos α$; horizontal $= T sen α$.\n• Desde la **horizontal**: horizontal $= T cos α$; vertical $= T sen α$.\n\nTruco: si el ángulo es chico, la cuerda está casi pegada a esa línea, y la componente sobre esa línea es casi toda la tensión (coseno ≈ 1).",
      { tag: "matematico", widget: { type: "vector-components", mag: 6, angle: 60 } },
    ),
    board("Pizarra: nudo con dos cuerdas", nudoBoard, "Un cuerpo de 8 kg cuelga de dos cuerdas que forman 40° (cuerda 1) y 60° (cuerda 2) con la vertical."),
    example(
      "Tres hebras",
      "Una maceta de 50 kg cuelga de una hebra vertical unida a un nudo; del nudo sale una hebra horizontal a la pared y otra al techo que forma 35° con la pared. Tensiones:",
      ["Hebra vertical: $T = P = 50 · 9,80 = 490$ N", "Oblicua: $T_{ob} · cos 35° = 490$ ⇒ $T_{ob} = 598$ N", "Horizontal: $T_h = T_{ob} · sen 35° = 343$ N"],
      "490 N; 598 N; 343 N",
    ),
    practice("Ejercicio guiado", "fis-estatica-nudo", 2, 3, true),
    explain(
      "Errores típicos",
      "• Usar «y con seno» sin mirar desde dónde se mide el ángulo.\n• Repartir el peso en mitades (**T = P/2**) aunque las cuerdas estén inclinadas o sean distintas.\n• Usar la masa en kg como si fuera una fuerza: $P = m·g$.\n\nControl: la cuerda **más cercana a la vertical** es la que más tensión soporta.",
      { tag: "cotidiano" },
    ),
    practice("Tu turno", "fis-estatica-nudo", 3, 10),
    practice("Tu turno", "fis-estatica-nudo", 4, 19),
    practice("Desafío", "fis-estatica-nudo", 6, 26),
    summary([
      "Nudo en equilibrio: ΣF_x = 0 y ΣF_y = 0.",
      "Ángulo desde la vertical: vertical con cos; desde la horizontal: vertical con sen.",
      "Dos cuerdas simétricas: T = P/(2 cos α) > P/2.",
      "Tres hebras: la oblicua sostiene todo el peso con su componente vertical.",
      "La cuerda más vertical es la más tensa.",
    ]),
  ],
  tutor: {
    normal: "Una partícula está en equilibrio de traslación cuando la resultante de las fuerzas que actúan sobre ella es nula: ΣF_x = 0 y ΣF_y = 0. Para un nudo, las fuerzas son las tensiones de las cuerdas (dirigidas a lo largo de cada cuerda, alejándose del nudo) y el peso transmitido por la cuerda vertical. Se proyecta cada tensión según el ángulo dado y se resuelve el sistema lineal.",
    simple: "Dibujá las flechas que tiran del nudo. Separá cada una en «parte horizontal» y «parte vertical». Las horizontales se tienen que cancelar y las verticales tienen que igualar el peso.",
    nino: "Es como una cinchada a tres bandas en la que nadie gana: las fuerzas se cancelan. Si una cuerda está casi vertical, hace casi todo el trabajo de sostener; si está casi horizontal, casi no sostiene nada aunque esté muy tensa.",
    ejemplo: "Cuadro de 5 kg con dos tramos a 40° de la vertical: T = 49/(2·cos 40°) = 32,0 N.",
    visual: { type: "vector-components", mag: 5, angle: 70 },
    visualText: "Al girar la tensión, mirá cómo cambia su parte vertical (la que sostiene) y su parte horizontal.",
    fromZero: "Una fuerza es un vector: tiene tamaño y dirección. Si algo está quieto, la suma de todas las fuerzas sobre él es cero. Como sumar vectores es sumar sus componentes, eso significa dos cosas a la vez: las componentes x suman cero y las componentes y suman cero.",
    why: "Las tensiones son las incógnitas y tienen direcciones distintas: la única manera de compararlas es proyectarlas sobre los mismos ejes.",
    origin: "Del sistema T₁ sen α = T₂ sen β y T₁ cos α + T₂ cos β = P (ángulos con la vertical) se despeja T₁ = P sen β / sen(α + β), usando sen α cos β + cos α sen β = sen(α + β).",
    board: nudoBoard,
  },
};

const momentosBoard: BoardStep[] = [
  { expr: "Σ M_A = 0", note: "momentos respecto de la articulación A" },
  { expr: "T · sen 30° · 3 = 10 · 9,8 · 1,5 + 20 · 9,8 · 2", note: "cuerda = peso de la viga (en L/2) + carga" },
  { expr: "1,5 · T = 147 + 392", note: "calculamos cada término" },
  { expr: "1,5 · T = 539" },
  { expr: "T = 359 N", note: "dividimos por 1,5" },
];

export const momentosLesson: Lesson = {
  id: "l-momentos",
  title: "Cuerpo rígido: momentos",
  subtitle: "Que no se traslade y que no gire",
  subjectId: S,
  topicIds: ["t-momentos"],
  estimatedMinutes: 12,
  prerequisites: ["t-estatica-particula"],
  cards: [
    intro("Momento de una fuerza", "Calcular momentos, elegir el punto conveniente y resolver vigas articuladas, trampolines y problemas de centro de masa.", "Los cuerpos extensos (vigas, tablas, escaleras) además de no trasladarse no deben girar. Es el segundo ejercicio fijo de estática."),
    explain(
      "Por qué la manija está lejos de la bisagra",
      "Empujar una puerta cerca de la bisagra cuesta muchísimo; en la manija, nada. Lo que hace girar no es solo la fuerza, sino **fuerza × distancia al eje** (el brazo). Eso es el **momento**.\n\nY empujar «de canto», paralelo a la puerta, no la gira: cuenta solo la parte **perpendicular** de la fuerza.",
      { tag: "cotidiano" },
    ),
    quiz("Para pensar", {
      id: "q-fis3-momento-punto",
      subjectId: S,
      topicId: "t-momentos",
      prompt: "Una viga está articulada a la pared y sostenida por una cuerda. ¿Respecto de qué punto conviene tomar momentos para hallar la tensión?",
      options: ["La articulación", "El centro de la viga", "El punto donde cuelga la carga"],
      answer: 0,
      explanation: "En la articulación actúa una fuerza desconocida (la de la pared). Tomando momentos ahí, su brazo es cero y desaparece de la ecuación: queda una sola incógnita, T.",
      hints: ["¿Qué fuerzas no conocés?", "Una fuerza aplicada en el centro de momentos no hace momento.", "Elegí el punto donde está la fuerza que no te interesa."],
      errors: {
        1: ["conceptual", "Desde el centro aparecerían la tensión Y la fuerza de la pared: dos incógnitas en una ecuación."],
        2: ["conceptual", "Desde ahí también aparece la fuerza de la articulación, que no conocés. Conviene eliminarla."],
      },
    }),
    explain(
      "Las condiciones de equilibrio",
      "Momento de $F$ respecto de O: $M = F · d · sen φ$, con $φ$ el ángulo entre la fuerza y la barra (o $F$ por la distancia perpendicular). Es el producto vectorial $r × F$.\n\n**Equilibrio del cuerpo rígido:** $ΣF_x = 0$, $ΣF_y = 0$ y $ΣM_O = 0$ para cualquier punto O.\n\nEl peso de una barra homogénea actúa en su **centro** ($L/2$).",
      { tag: "matematico" },
    ),
    board("Pizarra: viga articulada con cuerda", momentosBoard, "Viga de 3 m y 10 kg articulada en A; en la punta, una cuerda a 30° con la viga; a 2 m de A cuelgan 20 kg."),
    example(
      "Trampolín",
      "Trampolín de 4 m y 40 kg sujeto por un perno en B y apoyado en A, a 1 m de B. Una persona de 60 kg está en la punta. ¿Fuerzas en A y en B?",
      ["$Σ M_B = 0$: $N_A · 1 = 40 · 9,8 · 2 + 60 · 9,8 · 4 = 3136$", "$N_A = 3,14 × 10^3$ N (hacia arriba)", "$ΣF_y = 0$: $F_B = 3136 − 980 = 2,16 × 10^3$ N (hacia abajo)"],
      "N_A ≈ 3,14 × 10³ N; F_B ≈ 2,16 × 10³ N",
    ),
    practice("Ejercicio guiado", "fis-viga-cuerda", 2, 4, true),
    explain(
      "Errores típicos",
      "• **Olvidar el peso propio** de la viga o del trampolín.\n• Usar $T·L$ sin el seno: solo la componente perpendicular gira.\n• Poner el peso de la barra en la punta en lugar del centro.\n• Tomar momentos donde quedan dos incógnitas.",
      { tag: "intuitivo" },
    ),
    practice("Tu turno", "fis-momentos-apoyos", 3, 8),
    practice("Tu turno", "fis-viga-cuerda", 4, 13),
    practice("Desafío", "fis-momentos-apoyos", 5, 20),
    summary([
      "Momento: M = F·d·sen φ (fuerza por brazo perpendicular).",
      "Cuerpo rígido en equilibrio: ΣF = 0 y ΣM = 0.",
      "Tomá momentos donde está la fuerza desconocida que no te piden.",
      "Peso de una barra homogénea: en L/2.",
      "Centro de masa: más cerca del apoyo que soporta más.",
    ]),
  ],
  tutor: {
    normal: "El momento de una fuerza respecto de un punto O es M = r × F, de módulo F·d·sen φ, donde d es la distancia de O al punto de aplicación y φ el ángulo entre r y F. Un cuerpo rígido está en equilibrio si la resultante de fuerzas y la suma de momentos respecto de cualquier punto son nulas. Elegir O sobre una fuerza incógnita la elimina de la ecuación.",
    simple: "Algo hace girar más cuanto más fuerte empujás y más lejos del eje. Para que una tabla no gire, lo que la hace girar para un lado tiene que igualar lo que la hace girar para el otro.",
    nino: "En un subibaja, un adulto cerca del centro puede equilibrar a un chico sentado en la punta: el que pesa más se pone más cerca. Peso × distancia tiene que dar lo mismo de cada lado.",
    ejemplo: "Barra de masa despreciable de 2 m, articulada en un extremo, cuerda vertical en el otro y 10 kg colgando en el medio: T·2 = 98·1 ⇒ T = 49 N.",
    visual: { type: "vector-components", mag: 6, angle: 30 },
    visualText: "Pensá la flecha como la tensión de la cuerda y el eje x como la viga: la parte vertical es la que hace girar.",
    fromZero: "Hasta ahora alcanzaba con que las fuerzas sumaran cero. Pero una regla con dos fuerzas iguales y opuestas en sus puntas, una arriba y otra abajo, gira aunque la suma dé cero. Por eso a los cuerpos que tienen tamaño se les pide además que la suma de los «efectos de giro» (momentos) sea cero.",
    why: "La condición de momentos agrega la ecuación que falta cuando hay más incógnitas, y elegir bien el punto la vuelve una ecuación con una sola incógnita.",
    origin: "Del producto vectorial: con r a lo largo de la barra y F formando φ con ella, |r × F| = r·F·sen φ. Equivale a multiplicar la fuerza por la distancia perpendicular desde el punto hasta su recta de acción.",
    board: momentosBoard,
  },
};

// ═══════════════════════════ Dinámica ═══════════════════════════

const newtonBoard: BoardStep[] = [
  { expr: "P = 50 · 9,80 = 490 N", note: "peso de la carga" },
  { expr: "ΣF = m · a", note: "segunda ley, positivo hacia arriba" },
  { expr: "T − 490 = 50 · 2", note: "fuerza NETA = tensión menos peso" },
  { expr: "T = 490 + 100", note: "sumamos 490 en ambos lados" },
  { expr: "T = 590 N", note: "mayor que el peso: acelera hacia arriba" },
];

export const newtonLesson: Lesson = {
  id: "l-newton",
  title: "Leyes de Newton",
  subtitle: "Peso, masa y fuerza neta",
  subjectId: S,
  topicIds: ["t-newton"],
  estimatedMinutes: 10,
  prerequisites: ["t-mruv", "t-vec-operaciones"],
  cards: [
    intro("Fuerza y aceleración", "Distinguir masa de peso, aplicar ΣF = m·a con la fuerza neta y resolver cuerpos que suben o bajan acelerando (cables, ascensores, cohetes).", "Toda la dinámica del segundo parcial se apoya en esta ley. El error más caro es olvidarse del peso al plantear F = m·a."),
    explain(
      "Masa no es peso",
      "La **masa** (kg) es cuánta materia tiene un cuerpo: es la misma en la Tierra, en la Luna o en el espacio.\n\nEl **peso** (N) es la fuerza con que un astro lo atrae: $P = m·g$. En la Luna ($g ≈ 1,62$ m/s²) pesás unas seis veces menos… pero sos igual de difícil de empujar.",
      { tag: "cotidiano" },
    ),
    quiz("Para pensar", {
      id: "q-fis3-cable",
      subjectId: S,
      topicId: "t-newton",
      prompt: "Una grúa sube una carga de peso P con **velocidad constante**. ¿Cuánto vale la tensión del cable?",
      options: ["T = P", "T > P", "T < P"],
      answer: 0,
      explanation: "Velocidad constante ⇒ a = 0 ⇒ fuerza neta nula ⇒ T = P. Que se mueva hacia arriba no exige una fuerza neta hacia arriba (primera ley).",
      hints: ["¿Cuánto vale la aceleración?", "Si a = 0, ¿cuánto vale la fuerza neta?", "T − P = m·0."],
      errors: {
        1: ["velocidad-aceleracion", "Hace falta T > P para ACELERAR hacia arriba. Para mantener la velocidad, alcanza con T = P (primera ley)."],
        2: ["velocidad-aceleracion", "Con T < P la carga aceleraría hacia abajo (iría frenando su subida)."],
      },
    }),
    explain(
      "La segunda ley, bien usada",
      "$ΣF = m·a$: la suma (vectorial) de **todas** las fuerzas es la que acelera.\n\nPara algo que se mueve en vertical con un cable o un motor:\n\n• sube acelerando: $T − m g = m a$ ⇒ $T = m(g + a)$\n• baja acelerando: $m g − T = m a$ ⇒ $T = m(g − a)$\n\nElegí positivo el sentido de la aceleración y respetalo.",
      { tag: "matematico", widget: { type: "motion", v0: 0, a: 2 } },
    ),
    board("Pizarra: cable que acelera una carga", newtonBoard, "Una grúa sube 50 kg acelerando a 2 m/s²."),
    example(
      "Un cohete",
      "Un cohete de 80 kg despega con un empuje de 1200 N. ¿Qué aceleración tiene?",
      ["$P = 80 · 9,80 = 784$ N", "$1200 − 784 = 80 · a$", "$a = 416 / 80 = 5,20$ m/s²"],
      "5,20 m/s²",
    ),
    practice("Ejercicio guiado", "fis-newton", 2, 3, true),
    explain(
      "El error típico: F = m·a sin el peso",
      "En $F = m·a$, la $F$ es la fuerza **neta**. Si un motor empuja con 1200 N hacia arriba, no acelera 1200/80: primero tiene que vencer su propio peso.\n\nAntes de escribir la ecuación, hacé el **diagrama de cuerpo libre** y listá todas las fuerzas: peso, normal, tensiones, rozamiento, empujes.",
      { tag: "intuitivo" },
    ),
    practice("Tu turno", "fis-dinamica-conceptos", 2, 8),
    practice("Tu turno", "fis-newton", 4, 14),
    practice("Desafío", "fis-newton", 5, 22),
    summary([
      "Masa (kg) no cambia; peso P = m·g (N) depende del lugar.",
      "ΣF = m·a con la fuerza NETA.",
      "Sube acelerando: T = m(g + a); baja acelerando: T = m(g − a).",
      "Velocidad constante ⇒ fuerza neta cero.",
      "Siempre empezá por el diagrama de cuerpo libre.",
    ]),
  ],
  tutor: {
    normal: "La segunda ley de Newton establece que la resultante de las fuerzas sobre un cuerpo es igual al producto de su masa por su aceleración: ΣF = m·a. La masa es una medida de la inercia; el peso es la fuerza gravitatoria P = m·g. Si la aceleración es nula, la resultante es nula aunque el cuerpo se mueva (primera ley).",
    simple: "Sumá todas las fuerzas con su signo. Lo que sobra es lo que acelera al cuerpo: fuerza que sobra = masa × aceleración.",
    nino: "Empujar un changuito vacío o uno lleno: con la misma fuerza, el lleno acelera menos porque tiene más masa. Y si alguien tira del otro lado, solo cuenta lo que vos le ganás.",
    ejemplo: "Caja de 10 kg colgada de una soga que la sube con a = 1 m/s²: T = 10·(9,80 + 1) = 108 N.",
    visual: { type: "motion", v0: 0, a: 3 },
    visualText: "Una fuerza neta constante produce una aceleración constante: la velocidad crece parejo.",
    fromZero: "Una fuerza es un empujón o un tirón, medido en newtons. Un newton es la fuerza que hace que 1 kg aumente su velocidad 1 m/s cada segundo. Si sobre un cuerpo actúan varias fuerzas, se suman (con su sentido) y el resultado decide cómo cambia su velocidad.",
    why: "Plantear ΣF = m·a con todas las fuerzas permite calcular cualquier incógnita (una tensión, una aceleración, una fuerza de motor) sin memorizar casos.",
    origin: "Es una ley experimental: la aceleración es proporcional a la fuerza neta e inversamente proporcional a la masa. El peso P = m·g sale de aplicarla a la caída libre, donde la única fuerza es el peso y la aceleración es g.",
    board: newtonBoard,
  },
};

const planoBoard: BoardStep[] = [
  { expr: "P = 4 · 9,80 = 39,2 N" },
  { expr: "N = P · cos 30° = 33,9 N", note: "perpendicular al plano no hay aceleración" },
  { expr: "F_roz = 0,25 · 33,9 = 8,49 N", note: "rozamiento dinámico μd·N" },
  { expr: "m · a = P · sen 30° − F_roz", note: "paralelo al plano, positivo hacia abajo" },
  { expr: "4 · a = 19,6 − 8,49", note: "reemplazamos" },
  { expr: "a = 2,78 m/s²", note: "= g(sen θ − μd cos θ)" },
];

export const planoInclinadoLesson: Lesson = {
  id: "l-plano-inclinado",
  title: "Plano inclinado con rozamiento",
  subtitle: "Descomponer el peso y elegir bien el μ",
  subjectId: S,
  topicIds: ["t-plano-inclinado"],
  estimatedMinutes: 12,
  prerequisites: ["t-newton", "t-vec-componentes"],
  cards: [
    intro("Bloques en rampas", "Calcular la normal, el coeficiente estático mínimo para que un bloque no deslice y la aceleración con rozamiento dinámico.", "Es el problema de dinámica más tomado del segundo parcial, y suele seguir con trabajo y energía sobre el mismo plano."),
    explain(
      "Ejes inclinados",
      "En una rampa conviene girar los ejes: uno **paralelo** al plano y otro **perpendicular**. Así la normal y el rozamiento quedan sobre un eje cada uno, y solo hay que descomponer el **peso**:\n\n• paralela: $P·sen θ$ (la «fuerza impulsora»)\n• perpendicular: $P·cos θ$\n\nMové el ángulo y el μ y mirá cómo cambian las flechas:",
      { tag: "intuitivo", widget: { type: "forces", angle: 30, mu: 0.25, mass: 4 } },
    ),
    quiz("Para pensar", {
      id: "q-fis3-mus-mud",
      subjectId: S,
      topicId: "t-plano-inclinado",
      prompt: "Te piden el coeficiente mínimo para que una caja **no empiece a deslizar**. ¿Cuál usás?",
      options: ["El estático μs", "El dinámico μd", "Cualquiera, son iguales"],
      answer: 0,
      explanation: "Mientras la caja está quieta actúa el rozamiento estático, que puede valer como máximo μs·N. El dinámico μd·N actúa recién cuando ya desliza.",
      hints: ["¿La caja se mueve o está quieta?", "Quieta → rozamiento estático.", "En el límite de arrancar: F_roz = μs·N."],
      errors: {
        1: ["conceptual", "μd es para cuando ya desliza. Para «que no arranque» manda el rozamiento estático máximo μs·N."],
        2: ["conceptual", "Casi siempre μs > μd: cuesta más arrancar algo que mantenerlo deslizando."],
      },
    }),
    explain(
      "Las tres fórmulas",
      "$N = m g cos θ$\n\n**En reposo** (límite): $μ_s m g cos θ = m g sen θ$ ⇒ $μ_{s,mín} = tg θ$.\n\n**Bajando con rozamiento**: $m a = m g sen θ − μ_d m g cos θ$ ⇒ $a = g(sen θ − μ_d cos θ)$.\n\nLa masa se simplifica en las dos últimas.",
      { tag: "matematico" },
    ),
    board("Pizarra: bloque que baja con rozamiento", planoBoard, "Un bloque de 4 kg baja por un plano de 30° con μd = 0,25."),
    example(
      "Coeficiente mínimo",
      "¿Qué μs mínimo necesita una caja para quedarse quieta en un plano de 30°?",
      ["Límite: $μ_s · m g cos 30° = m g sen 30°$", "$μ_s = tg 30°$", "$μ_s = 0,577$"],
      "μs ≥ 0,577",
    ),
    practice("Ejercicio guiado", "fis-plano-inclinado", 2, 6, true),
    explain(
      "Errores típicos",
      "• Usar **N = m·g** en el plano (vale m·g·cos θ).\n• Cambiar seno por coseno: la componente paralela es la que lleva **seno**.\n• Usar **μd** para «que no deslice» o μs para «mientras desliza».\n• Dar el trabajo del rozamiento positivo: se opone al movimiento, $W < 0$.",
      { tag: "cotidiano" },
    ),
    practice("Tu turno", "fis-plano-inclinado", 3, 11),
    practice("Tu turno", "fis-plano-inclinado", 4, 17),
    practice("Desafío", "fis-plano-inclinado", 6, 24),
    summary([
      "Ejes paralelo y perpendicular al plano.",
      "N = m·g·cos θ; fuerza impulsora = m·g·sen θ.",
      "μs mínimo para el reposo = tg θ.",
      "a = g(sen θ − μd cos θ) al bajar.",
      "Quieto → μs (máximo); deslizando → μd.",
    ]),
  ],
  tutor: {
    normal: "En el plano inclinado se eligen ejes paralelo y perpendicular a la superficie. El peso se descompone en m g sen θ (paralela) y m g cos θ (perpendicular). La normal equilibra la componente perpendicular, N = m g cos θ. El rozamiento estático se ajusta hasta μs·N; el dinámico vale μd·N y se opone al deslizamiento. De la segunda ley sobre el eje paralelo se obtiene la aceleración.",
    simple: "Partí el peso en dos: una parte empuja el bloque rampa abajo (P·sen θ) y otra lo aprieta contra la rampa (P·cos θ). El rozamiento depende de cuánto lo aprieta.",
    nino: "En un tobogán poco inclinado te quedás sentado; si es muy empinado, te deslizás. Lo que decide es si la parte del peso que te tira para abajo le gana al «agarre» del tobogán.",
    ejemplo: "10 kg en 37° con μd = 0,2: a = 9,80·(0,602 − 0,2·0,799) = 4,33 m/s².",
    visual: { type: "forces", angle: 35, mu: 0.3, mass: 5 },
    visualText: "Subí el ángulo hasta que la componente paralela supere al rozamiento máximo: ahí empieza a deslizar.",
    fromZero: "El peso siempre apunta hacia abajo, pero en una rampa nos interesa qué parte de esa fuerza apunta a lo largo de la rampa. Con un triángulo rectángulo cuyo ángulo es el de la rampa: la parte a lo largo es P·sen θ y la parte que aprieta contra la superficie es P·cos θ.",
    why: "Con ejes inclinados, la aceleración tiene una sola componente (a lo largo del plano) y cada ecuación tiene pocas incógnitas.",
    origin: "El ángulo entre el peso y la normal al plano es igual a la inclinación θ (lados mutuamente perpendiculares). De ΣF_⊥ = 0 sale N = m g cos θ, y de ΣF_∥ = m a, con F_roz = μ N, sale a = g(sen θ − μd cos θ). En el límite del reposo, a = 0 da μs = tg θ.",
    board: planoBoard,
  },
};

const vinculadosBoard: BoardStep[] = [
  { expr: "A:  3 · 9,8 − T = 3 · a", note: "A cuelga: el peso lo baja, la cuerda lo frena" },
  { expr: "B:  T − 0,2 · 5 · 9,8 = 5 · a", note: "B arrastra: la cuerda tira, el rozamiento frena" },
  { expr: "29,4 − 9,8 = 8 · a", note: "sumamos las dos: T se cancela" },
  { expr: "a = 2,45 m/s²" },
  { expr: "T = 3 · (9,8 − 2,45) = 22,1 N", note: "volvemos a la ecuación de A" },
];

export const vinculadosLesson: Lesson = {
  id: "l-vinculados",
  title: "Cuerpos vinculados",
  subtitle: "Una cuerda, una polea, dos ecuaciones",
  subjectId: S,
  topicIds: ["t-vinculados"],
  estimatedMinutes: 12,
  prerequisites: ["t-plano-inclinado"],
  cards: [
    intro("Sistemas con poleas", "Plantear la segunda ley para cada cuerpo de un sistema unido por una cuerda, encontrar la aceleración común, la tensión y la masa mínima para el equilibrio.", "Es el ejercicio «difícil» de dinámica del segundo parcial: combina rozamiento, planos inclinados y un sistema de ecuaciones."),
    explain(
      "Se mueven juntos",
      "Si la cuerda no se estira y la polea es ideal:\n\n• los dos cuerpos tienen la **misma aceleración** (en módulo);\n• la cuerda tira con la **misma tensión** en los dos extremos.\n\nPero la tensión **no** es el peso del que cuelga: si ese cuerpo baja acelerando, la cuerda lo sostiene con menos que su peso.",
      { tag: "intuitivo" },
    ),
    quiz("Para pensar", {
      id: "q-fis3-tension",
      subjectId: S,
      topicId: "t-vinculados",
      prompt: "Un bloque A cuelga de una cuerda que pasa por una polea y arrastra a B sobre una mesa. A baja acelerando. Comparada con el peso de A, la tensión es…",
      options: ["Menor", "Igual", "Mayor"],
      answer: 0,
      explanation: "Para A: m_A·g − T = m_A·a con a > 0 ⇒ T < m_A·g. Si fueran iguales, A no aceleraría.",
      hints: ["Hacé el DCL de A.", "La fuerza neta sobre A apunta hacia abajo.", "m_A·g − T = m_A·a > 0."],
      errors: {
        1: ["conceptual", "Si T fuera igual al peso de A, la fuerza neta sobre A sería cero y no aceleraría."],
        2: ["conceptual", "Con T mayor que el peso, A aceleraría hacia arriba."],
      },
    }),
    explain(
      "El método",
      "1. Elegí un sentido positivo **de movimiento** para el sistema.\n2. Escribí $ΣF = m·a$ para cada cuerpo en su dirección de movimiento.\n3. **Sumá** las ecuaciones: la tensión se cancela y queda\n$a = \\frac{F_{impulsora} − F_{roz}}{m_A + m_B}$\n4. Volvé a una ecuación para sacar $T$.\n\nPara que **no se mueva**, el rozamiento estático máximo tiene que alcanzar: $μ_s m_B g ≥$ fuerza impulsora.",
      { tag: "matematico" },
    ),
    board("Pizarra: bloque colgante y bloque con rozamiento", vinculadosBoard, "A (3 kg) cuelga; B (5 kg) está sobre una mesa con μd = 0,2."),
    example(
      "Masa mínima",
      "A (10 kg) está en un plano liso de 30°, unido a B sobre un piso con μs = 0,4. ¿Qué masa mínima tiene que tener B para que nada se mueva?",
      ["Lo que tira A: $10 · 9,80 · sen 30° = 49,0$ N", "Rozamiento estático máximo de B: $0,4 · m_B · 9,80$", "$m_B = 49,0 / 3,92 = 12,5$ kg"],
      "12,5 kg",
    ),
    practice("Ejercicio guiado", "fis-vinculados", 2, 4, true),
    explain(
      "Errores típicos",
      "• Suponer **T = peso del que cuelga**.\n• Dividir por una sola masa: la fuerza neta acelera a **todo** el sistema.\n• Olvidar el rozamiento sobre el bloque que arrastra.\n• Usar μd para «que no se mueva» (va μs).",
      { tag: "cotidiano" },
    ),
    practice("Tu turno", "fis-vinculados", 3, 9),
    practice("Tu turno", "fis-vinculados", 5, 15),
    practice("Desafío", "fis-vinculados", 6, 21),
    summary([
      "Misma aceleración y misma tensión en toda la cuerda.",
      "Una ecuación ΣF = m·a por cuerpo; sumarlas elimina T.",
      "a = (impulsora − rozamientos)/(m_A + m_B).",
      "T ≠ peso del que cuelga si hay aceleración.",
      "Equilibrio: μs·m_B·g ≥ fuerza impulsora.",
    ]),
  ],
  tutor: {
    normal: "En un sistema de cuerpos vinculados por una cuerda inextensible y de masa despreciable que pasa por una polea ideal, todos los cuerpos tienen el mismo módulo de aceleración y la tensión es la misma en ambos extremos. Se plantea la segunda ley para cada cuerpo en su dirección de movimiento y se resuelve el sistema; sumar las ecuaciones elimina la tensión.",
    simple: "Escribí «fuerzas a favor menos fuerzas en contra = masa × aceleración» para cada bloque. Sumalas: la tensión se va y despejás la aceleración. Después sacás la tensión con cualquiera de las dos.",
    nino: "Dos chicos atados con una soga, uno colgando por el borde de una pileta y otro arriba sobre el piso: el que cuelga arrastra al otro, pero más despacio que si cayera solo, porque tiene que «llevar» al compañero y vencer el roce.",
    ejemplo: "A = 2 kg colgando, B = 6 kg en mesa lisa: a = 2·9,80/8 = 2,45 m/s²; T = 6·2,45 = 14,7 N.",
    visual: { type: "forces", angle: 30, mu: 0, mass: 10 },
    visualText: "En el plano liso, la fuerza que tira de la cuerda es la componente paralela del peso, P·sen θ.",
    fromZero: "Una cuerda tensa transmite un tirón: tira de cada cuerpo hacia la polea con la misma fuerza T. Como la cuerda no se estira, si un bloque avanza 1 m, el otro también: se mueven juntos y tienen la misma aceleración.",
    why: "Plantear un cuerpo por vez evita olvidar fuerzas, y sumar las ecuaciones da directamente la aceleración del conjunto.",
    origin: "Con A: m_A g − T = m_A a y B: T − μ m_B g = m_B a, la suma da m_A g − μ m_B g = (m_A + m_B) a. Es lo mismo que tratar al sistema como un solo cuerpo de masa m_A + m_B sobre el que actúan solo las fuerzas externas.",
    board: vinculadosBoard,
  },
};

// ═══════════════════════════ Trabajo y energía ═══════════════════════════

const energiaBoard: BoardStep[] = [
  { expr: "v_A = 90 / 3,6 = 25 m/s,  v_B = 54 / 3,6 = 15 m/s", note: "pasamos a m/s" },
  { expr: "ΔEc = ½ · 1000 · (15² − 25²) = −200 000 J", note: "pierde energía cinética" },
  { expr: "ΔEp = 1000 · 9,8 · (−10) = −98 000 J", note: "baja 10 m: también pierde potencial" },
  { expr: "W_roz = ΔEc + ΔEp", note: "trabajo no conservativo = ΔEm" },
  { expr: "W_roz = −298 000 J = −298 kJ" },
];

export const energiaLesson: Lesson = {
  id: "l-trabajo-energia",
  title: "Trabajo y energía mecánica",
  subtitle: "Cinética, potencial y lo que se lleva el rozamiento",
  subjectId: S,
  topicIds: ["t-energia"],
  estimatedMinutes: 12,
  prerequisites: ["t-newton", "t-unidades"],
  cards: [
    intro("Energía", "Calcular trabajo, energía cinética y potencial; usar la conservación de la energía mecánica sin rozamiento y W_roz = ΔEm cuando hay rozamiento.", "Con energía se resuelven en dos renglones problemas que con Newton llevarían una página. Es el cierre del segundo parcial y aparece en los integradores del final."),
    explain(
      "Una cuenta bancaria de energía",
      "Pensá la energía mecánica como plata en dos cuentas: **cinética** (por moverse, $\\frac{1}{2} m v^2$) y **potencial** (por estar alto, $m g h$).\n\nSin rozamiento, la plata solo pasa de una cuenta a la otra: el total **no cambia**. El rozamiento es una comisión: se lleva una parte, y esa parte es su **trabajo** (negativo).",
      { tag: "cotidiano" },
    ),
    quiz("Para pensar", {
      id: "q-fis3-forma-pista",
      subjectId: S,
      topicId: "t-energia",
      prompt: "Dos carritos parten del reposo desde 5 m de altura por pistas lisas: una recta y otra con curvas. ¿Cuál llega más rápido abajo?",
      options: ["Llegan con la misma rapidez", "El de la pista recta", "El de la pista con curvas"],
      answer: 0,
      explanation: "Sin rozamiento, ½mv² = mgh: la rapidez final solo depende del desnivel, no de la forma del camino. (Pueden tardar distinto, pero llegan igual de rápido.)",
      hints: ["¿Hay rozamiento?", "Se conserva la energía mecánica.", "½v² = g·h: ¿aparece la forma de la pista?"],
      errors: {
        1: ["conceptual", "La forma de la pista cambia el tiempo, no la rapidez final: sin rozamiento solo importa el desnivel."],
        2: ["conceptual", "Sin rozamiento, la energía final es la misma: ½mv² = mgh en los dos casos."],
      },
    }),
    explain(
      "Las fórmulas",
      "$W = F · d · cos α$ (α entre fuerza y desplazamiento)\n\n$E_c = \\frac{1}{2} m v^2$   $E_p = m g h$   $E_m = E_c + E_p$\n\n**Sin fuerzas no conservativas:** $E_{m,A} = E_{m,B}$.\n**Con rozamiento:** $W_{roz} = ΔE_m = ΔE_c + ΔE_p$ (y es negativo).\n\nMirá cómo se reparte la energía en un tobogán:",
      { tag: "matematico", widget: { type: "projectile", v0: 10, angle: 0, h0: 5 } },
    ),
    board("Pizarra: auto que baja frenando", energiaBoard, "Un auto de 1000 kg baja una pendiente: pasa de 90 a 54 km/h mientras desciende 10 m."),
    example(
      "Tobogán",
      "Un carrito de 2 kg parte del reposo a 5 m de altura. Sin rozamiento, ¿con qué rapidez llega abajo? Si en realidad llega a 8 m/s, ¿cuánto trabajó el rozamiento?",
      ["$m g h = \\frac{1}{2} m v^2$ ⇒ $v = √(2 · 9,80 · 5) = 9,90$ m/s", "Con rozamiento: $ΔE_c = \\frac{1}{2} · 2 · 8^2 = 64$ J; $ΔE_p = −2 · 9,80 · 5 = −98$ J", "$W_{roz} = 64 − 98 = −34,0$ J"],
      "9,90 m/s; W_roz = −34,0 J",
    ),
    practice("Ejercicio guiado", "fis-energia", 2, 5, true),
    explain(
      "Errores típicos",
      "• **Omitir $m g Δh$** cuando además de frenar el cuerpo sube o baja.\n• El signo de $Δh$: si **baja**, $ΔE_p < 0$.\n• **km/h sin convertir**: como $v$ va al cuadrado, el error es enorme.\n• Sumar velocidades: lo que se suma son **energías** ($v^2 = v_0^2 + 2 g Δh$).",
      { tag: "intuitivo" },
    ),
    practice("Tu turno", "fis-energia", 3, 12),
    practice("Tu turno", "fis-energia", 4, 18),
    practice("Desafío", "fis-energia", 6, 27),
    summary([
      "W = F·d·cos α; el rozamiento hace trabajo negativo.",
      "Ec = ½mv²; Ep = mgh; Em = Ec + Ep.",
      "Sin rozamiento: Em se conserva.",
      "Con rozamiento: W_roz = ΔEc + ΔEp.",
      "Velocidades en m/s; Δh con signo.",
    ]),
  ],
  tutor: {
    normal: "El trabajo de una fuerza constante es W = F·d·cos α. El teorema del trabajo y la energía cinética establece W_neto = ΔEc. Separando el trabajo del peso (conservativo, igual a −ΔEp), el trabajo de las fuerzas no conservativas resulta igual a la variación de la energía mecánica: W_nc = ΔEc + ΔEp. Si W_nc = 0, la energía mecánica se conserva.",
    simple: "Sumá la energía de movimiento (½mv²) y la de altura (mgh) al principio y al final. Si no hay rozamiento, dan lo mismo. Si hay, la diferencia es lo que se llevó el rozamiento.",
    nino: "Una pelota que rebota: cada vez sube un poco menos. La energía no desaparece de golpe: en cada rebote una parte se va en calor y ruido. Esa «pérdida» es el trabajo de las fuerzas que frenan.",
    ejemplo: "Piedra de 1 kg soltada desde 20 m: abajo tiene Ec = 1·9,80·20 = 196 J, v = √392 = 19,8 m/s.",
    visual: { type: "projectile", v0: 8, angle: 0, h0: 12 },
    visualText: "Mientras baja, la energía potencial (altura) se convierte en cinética (rapidez).",
    fromZero: "La energía es la capacidad de producir cambios. Algo que se mueve tiene energía cinética; algo que está alto tiene energía potencial porque al caer va a ganar velocidad. Hacer trabajo es transferir energía empujando algo a lo largo de un camino.",
    why: "Con energía no hace falta conocer la aceleración en cada punto ni la forma del recorrido: alcanza con comparar el principio y el final.",
    origin: "Con F constante y MRUV: v² = v₀² + 2aΔx; multiplicando por m/2, ½mv² − ½mv₀² = m·a·Δx = F·Δx = W. Para el peso, W_P = −m g Δh, así que W_neto = W_nc − ΔEp = ΔEc ⇒ W_nc = ΔEc + ΔEp.",
    board: energiaBoard,
  },
};

const resorteBoard: BoardStep[] = [
  { expr: "Δx = 10 cm = 0,10 m", note: "siempre en metros" },
  { expr: "E_el = ½ · 400 · 0,10² = 2,00 J", note: "energía guardada en el resorte" },
  { expr: "½ · 0,5 · v² = 2,00", note: "sin rozamiento: elástica → cinética" },
  { expr: "v² = 8,00", note: "despejamos" },
  { expr: "v = 2,83 m/s" },
];

export const resortePotenciaLesson: Lesson = {
  id: "l-resorte-potencia",
  title: "Resortes y potencia",
  subtitle: "Hooke, energía elástica y qué tan rápido se trabaja",
  subjectId: S,
  topicIds: ["t-resorte-potencia"],
  estimatedMinutes: 11,
  prerequisites: ["t-energia"],
  cards: [
    intro("Resortes y potencia", "Usar la ley de Hooke, calcular energía elástica e incorporarla a la conservación de la energía; calcular potencia como W/t y como F·v.", "Los problemas integradores del final combinan una caja, un resorte y la potencia de quien empuja."),
    explain(
      "El resorte devuelve lo que le das",
      "Cuanto más estirás un resorte, más fuerte tira: **el doble de estiramiento, el doble de fuerza**. Eso es la ley de Hooke.\n\nY la energía que le pusiste al comprimirlo queda guardada: al soltarlo, la devuelve (por ejemplo, lanzando un bloque).",
      { tag: "cotidiano" },
    ),
    quiz("Para pensar", {
      id: "q-fis3-resorte-doble",
      subjectId: S,
      topicId: "t-resorte-potencia",
      prompt: "Si comprimís un resorte el doble, la energía elástica que guarda…",
      options: ["Se cuadruplica", "Se duplica", "No cambia"],
      answer: 0,
      explanation: "E = ½kΔx²: con 2Δx queda ½k(2Δx)² = 4·½kΔx². La fuerza se duplica, pero la energía se cuadruplica.",
      hints: ["Mirá la fórmula de la energía elástica.", "Δx está al cuadrado.", "(2Δx)² = 4Δx²."],
      errors: {
        1: ["potencias", "Lo que se duplica es la FUERZA (F = kΔx). La energía tiene Δx al cuadrado: se cuadruplica."],
        2: ["conceptual", "Más compresión significa más energía guardada: E = ½kΔx²."],
      },
    }),
    explain(
      "Las fórmulas",
      "**Hooke:** $F = −k Δx$ (k en N/m, Δx en **metros**).\n\n**Energía elástica:** $E_{el} = \\frac{1}{2} k Δx^2$. Se suma a la mecánica: $E_m = E_c + E_p + E_{el}$.\n\n**Potencia media:** $P = \\frac{W}{t}$ (W = J/s). A velocidad constante: $P = F · v$. $1$ kW $= 1000$ W.",
      { tag: "matematico" },
    ),
    board("Pizarra: resorte que lanza un bloque", resorteBoard, "Un resorte de k = 400 N/m comprimido 10 cm lanza un bloque de 0,5 kg sobre una mesa lisa."),
    example(
      "Montacargas",
      "Un montacargas sube 300 kg a 12 m de altura en 20 s a velocidad constante. ¿Qué potencia media desarrolla?",
      ["$W = m g h = 300 · 9,80 · 12 = 35 280$ J", "$P = W / t = 35 280 / 20$", "$P = 1764$ W $≈ 1,76$ kW"],
      "1,76 kW",
    ),
    practice("Ejercicio guiado", "fis-resorte", 2, 3, true),
    explain(
      "Errores típicos",
      "• Usar Δx en **centímetros** (con k en N/m).\n• Olvidar el **½** o el cuadrado en $E_{el}$.\n• Confundir trabajo (J) con potencia (W): falta dividir por el tiempo.\n• En $P = F·v$, usar km/h.",
      { tag: "intuitivo" },
    ),
    practice("Tu turno", "fis-potencia", 3, 9),
    practice("Tu turno", "fis-resorte", 4, 14),
    practice("Desafío", "fis-resorte", 6, 21),
    summary([
      "Hooke: F = k·Δx (Δx en m).",
      "E_el = ½·k·Δx².",
      "Resorte que lanza: ½kΔx² = ½mv².",
      "Potencia: P = W/t = F·v; 1 W = 1 J/s.",
      "Arranque de una caja empujada por un resorte: kΔx = μs·m·g.",
    ]),
  ],
  tutor: {
    normal: "Un resorte ideal ejerce una fuerza proporcional a su deformación y opuesta a ella, F = −kΔx (ley de Hooke). La energía potencial elástica almacenada es ½kΔx² y forma parte de la energía mecánica. La potencia media es el trabajo realizado por unidad de tiempo, P = W/Δt; para una fuerza constante paralela a una velocidad constante, P = F·v.",
    simple: "Un resorte tira más cuanto más lo estirás (F = k·Δx) y guarda energía (½·k·Δx²). La potencia es cuánto trabajo hacés por segundo.",
    nino: "Subir una escalera caminando o corriendo te cuesta el mismo trabajo (subís la misma altura), pero corriendo lo hacés en menos tiempo: usás más potencia. Por eso cansa más.",
    ejemplo: "k = 200 N/m, Δx = 5 cm: F = 10 N, E = ½·200·0,0025 = 0,25 J.",
    visual: { type: "motion", v0: 3, a: 0 },
    visualText: "Después de que el resorte lo suelta, sin rozamiento, el bloque sigue con velocidad constante.",
    fromZero: "Un resorte tiene un largo natural. Si lo estirás o comprimís una distancia Δx, hace una fuerza para volver. La constante k dice qué tan duro es: cuántos newtons hacen falta para deformarlo un metro. La potencia, en cambio, no es un tipo de energía: es la rapidez con que se transfiere.",
    why: "El resorte permite guardar energía y devolverla, y la potencia es lo que limita en la práctica a motores y personas: no cuánto trabajo, sino en cuánto tiempo.",
    origin: "El trabajo para comprimir un resorte es el área bajo F(x) = kx entre 0 y Δx: un triángulo de base Δx y altura kΔx, o sea ½kΔx². La potencia P = W/t con W = F·d da P = F·(d/t) = F·v.",
    board: resorteBoard,
  },
};

// ═══════════════════════════ Hidrostática ═══════════════════════════

const presionBoard: BoardStep[] = [
  { expr: "δ = 1,03 g/cm³ = 1030 kg/m³", note: "pasamos a SI (× 1000)" },
  { expr: "p = δ · g · h", note: "teorema fundamental de la hidrostática" },
  { expr: "p = 1030 · 9,80 · 12", note: "reemplazamos (h en metros)" },
  { expr: "p = 121 128 Pa ≈ 121 kPa", note: "presión manométrica" },
  { expr: "p_abs = 101,3 + 121 = 222 kPa", note: "absoluta: sumamos la atmosférica" },
];

export const presionPascalLesson: Lesson = {
  id: "l-presion-pascal",
  title: "Presión y principio de Pascal",
  subtitle: "Por qué duelen los oídos en el fondo de la pileta",
  subjectId: S,
  topicIds: ["t-presion"],
  estimatedMinutes: 11,
  prerequisites: ["t-unidades", "t-newton"],
  cards: [
    intro("Presión en líquidos", "Calcular la presión a una profundidad (manométrica y absoluta) y usar el principio de Pascal en la prensa hidráulica.", "La hidrostática cierra el primer parcial. Las cuentas son cortas; los errores están casi siempre en las unidades (cm, g/cm³, kPa)."),
    explain(
      "El peso del agua de arriba",
      "Cuando te sumergís, toda la columna de agua que tenés encima empuja: cuanto más hondo, más agua arriba, más presión. Por eso cada ~10 m de agua se suma casi una atmósfera.\n\nLa presión es **fuerza por unidad de área**: $p = F/A$, en pascales (1 Pa = 1 N/m²).",
      { tag: "cotidiano" },
    ),
    quiz("Para pensar", {
      id: "q-fis3-forma-recipiente",
      subjectId: S,
      topicId: "t-presion",
      prompt: "Un tanque ancho y un caño angosto tienen agua hasta la misma altura. ¿Dónde es mayor la presión en el fondo?",
      options: ["Es igual en los dos", "En el tanque ancho", "En el caño angosto"],
      answer: 0,
      explanation: "p = δ·g·h depende solo de la profundidad, no de la cantidad de agua ni de la forma del recipiente.",
      hints: ["Mirá la fórmula de la presión hidrostática.", "¿Aparece el área o el volumen?", "p = δ·g·h."],
      errors: {
        1: ["conceptual", "Hay más agua, pero también más área de fondo: la presión (fuerza por área) solo depende de h."],
        2: ["conceptual", "La forma del recipiente no influye: p = δ·g·h."],
      },
    }),
    explain(
      "Las fórmulas",
      "**Teorema fundamental:** $p = p_{atm} + δ g h$. La parte $δ g h$ es la **manométrica**.\n\nEn SI: $δ$ en kg/m³ ($1$ g/cm³ $= 1000$ kg/m³), $h$ en m, $p$ en Pa.\n\n**Pascal:** una presión aplicada a un líquido encerrado se transmite igual a todos lados. En la prensa: $\\frac{F_1}{A_1} = \\frac{F_2}{A_2}$ ⇒ $F_1 = F_2 · (d_1/d_2)^2$.",
      { tag: "matematico" },
    ),
    board("Pizarra: presión de un buzo", presionBoard, "Un buzo está a 12 m de profundidad en agua de mar (δ = 1,03 g/cm³)."),
    example(
      "Prensa hidráulica",
      "Pistones de 4 cm y 40 cm de diámetro. ¿Qué fuerza sostiene un auto de 1200 kg sobre el grande? ¿Qué presión hay en el líquido?",
      ["$F_2 = 1200 · 9,80 = 11 760$ N", "$F_1 = 11 760 · (4/40)^2 = 118$ N", "$p = F_2 / A_2 = 11 760 / (π · 0,20^2) = 9,36 × 10^4$ Pa $≈ 93,6$ kPa"],
      "F₁ ≈ 118 N; p ≈ 93,6 kPa",
    ),
    practice("Ejercicio guiado", "fis-presion", 2, 4, true),
    explain(
      "Errores típicos",
      "• Usar la densidad en g/cm³ o la profundidad en cm sin pasar a SI.\n• Sumar (o no) la presión atmosférica: leé si piden **absoluta** o **manométrica**.\n• **Diámetro como radio**: $A = π r^2$ con $r = d/2$.\n• En la prensa, usar la razón de diámetros sin elevarla **al cuadrado**.",
      { tag: "intuitivo" },
    ),
    practice("Tu turno", "fis-prensa", 2, 9),
    practice("Tu turno", "fis-presion", 4, 15),
    practice("Desafío", "fis-prensa", 5, 21),
    summary([
      "p = F/A; 1 Pa = 1 N/m².",
      "p = p_atm + δ·g·h (manométrica: solo δ·g·h).",
      "No depende de la forma del recipiente.",
      "Pascal: F₁/A₁ = F₂/A₂; F₁ = F₂·(d₁/d₂)².",
      "SI: δ en kg/m³, h en m, área con el radio.",
    ]),
  ],
  tutor: {
    normal: "La presión hidrostática en un punto de un líquido en reposo es p = p₀ + δ g h, donde h es la profundidad respecto de la superficie libre y p₀ la presión sobre ella (en general la atmosférica). El principio de Pascal establece que un incremento de presión en un fluido incompresible encerrado se transmite íntegramente a todos sus puntos; en la prensa hidráulica, F₁/A₁ = F₂/A₂.",
    simple: "Cuanto más hondo, más presión: p = densidad × g × profundidad. En una prensa, la presión es la misma en los dos pistones, así que el pistón grande hace más fuerza porque tiene más área.",
    nino: "Apretá una jeringa llena de agua tapada con el dedo: el empujón del émbolo se siente en todo el líquido, también en tu dedo. La prensa hidráulica aprovecha eso con un pistón chico y uno grande.",
    ejemplo: "A 5 m en agua: p = 1000·9,80·5 = 49 000 Pa = 49,0 kPa (manométrica).",
    visual: { type: "buoyancy", body: 2.7, liquid: 1 },
    visualText: "Las flechas muestran que el líquido empuja más desde abajo (más profundo) que desde arriba.",
    fromZero: "Presión es cuánta fuerza se reparte en cada metro cuadrado. Un líquido pesa: la capa de abajo sostiene a todas las de arriba. Una columna de líquido de altura h y base A tiene masa δ·A·h y pesa δ·A·h·g; repartido en el área A da δ·g·h.",
    why: "Con la presión se diseñan represas, se calcula cuánto aguanta un buzo y se multiplican fuerzas con sistemas hidráulicos (frenos, gatos, elevadores).",
    origin: "Peso de la columna sobre un área A: P = δ (A h) g; presión = P/A = δ g h. Para Pascal: p₁ = p₂ ⇒ F₁/A₁ = F₂/A₂, y como A = π d²/4, A₁/A₂ = (d₁/d₂)².",
    board: presionBoard,
  },
};

const arquimedesBoard: BoardStep[] = [
  { expr: "V = 2,5 L = 0,0025 m³", note: "volumen de la piedra (toda sumergida)" },
  { expr: "E = 1000 · 0,0025 · 9,80 = 24,5 N", note: "empuje: peso del agua desalojada" },
  { expr: "P = 6 · 9,80 = 58,8 N", note: "peso de la piedra" },
  { expr: "N + E = P", note: "equilibrio en el fondo" },
  { expr: "N = 58,8 − 24,5 = 34,3 N", note: "lo que sostiene el fondo" },
];

export const arquimedesLesson: Lesson = {
  id: "l-arquimedes",
  title: "Empuje y flotación",
  subtitle: "Arquímedes, sin bañadera",
  subjectId: S,
  topicIds: ["t-arquimedes"],
  estimatedMinutes: 12,
  prerequisites: ["t-presion", "t-porcentajes"],
  cards: [
    intro("El principio de Arquímedes", "Calcular el empuje, decidir si un cuerpo flota, qué fracción queda sumergida y qué fuerza hace el fondo sobre un cuerpo apoyado.", "Siempre hay un ítem de flotación en el primer parcial, y suele preguntar el porcentaje emergido (no el sumergido)."),
    explain(
      "El agua empuja hacia arriba",
      "Todo cuerpo sumergido recibe del líquido una fuerza hacia arriba, el **empuje**, igual al **peso del líquido que desaloja**.\n\nSi el empuje con el cuerpo entero adentro supera su peso, sube y **flota**; si no, se hunde. Moviendo las densidades vas a ver cuánto queda afuera:",
      { tag: "intuitivo", widget: { type: "buoyancy", body: 0.6, liquid: 1 } },
    ),
    quiz("Para pensar", {
      id: "q-fis3-flota",
      subjectId: S,
      topicId: "t-arquimedes",
      prompt: "Un cubo de 0,75 g/cm³ flota en agua. ¿Qué porcentaje de su volumen queda **afuera**?",
      options: ["25 %", "75 %", "0 %: se hunde"],
      answer: 0,
      explanation: "Fracción sumergida = δ_c/δ_L = 0,75 ⇒ 75 % adentro y 25 % afuera.",
      hints: ["Flotando: empuje = peso.", "V_sum/V = δ_cuerpo/δ_líquido.", "Te piden lo que queda AFUERA."],
      errors: {
        1: ["interpretacion", "75 % es lo sumergido. Afuera queda 100 % − 75 % = 25 %."],
        2: ["conceptual", "Es menos denso que el agua: flota."],
      },
    }),
    explain(
      "Las fórmulas",
      "**Empuje:** $E = δ_L · V_{sum} · g$ (densidad del **líquido**, volumen **sumergido**).\n\n**Flota** (equilibrio): $E = P$ ⇒ $\\frac{V_{sum}}{V} = \\frac{δ_c}{δ_L}$ y $V_{sum} = \\frac{m}{δ_L}$.\n\n**Apoyado en el fondo:** $N = P − E$. **Colgado de un dinamómetro:** $T = P − E$ (peso aparente).\n\nTotalmente sumergido, $E$ no depende de la profundidad.",
      { tag: "matematico", widget: { type: "buoyancy", body: 2.5, liquid: 1 } },
    ),
    board("Pizarra: piedra en el fondo", arquimedesBoard, "Una piedra de 6 kg y 2,5 L está apoyada en el fondo de un tanque con agua."),
    example(
      "Bloque de madera",
      "Un bloque de 0,750 g/cm³ y 2 L flota en agua. ¿Qué empuje recibe y qué volumen queda sumergido?",
      ["Masa: $m = 0,750 · 2 = 1,50$ kg ⇒ $P = 14,7$ N", "Flota: $E = P = 14,7$ N", "$V_{sum} = m/δ_L = 1,50$ L (el 75 %)"],
      "E = 14,7 N; V_sum = 1,50 L",
    ),
    practice("Ejercicio guiado", "fis-flotacion", 2, 6, true),
    explain(
      "Errores típicos",
      "• Responder el % **sumergido** cuando piden el **emergido** (o al revés).\n• Usar la densidad del **cuerpo** en el empuje: va la del **líquido**.\n• Usar el volumen total cuando el cuerpo flota (va el sumergido).\n• Olvidar el empuje en un cuerpo apoyado en el fondo: $N ≠ P$.\n• Litros sin pasar a m³ (1 L = 0,001 m³).",
      { tag: "cotidiano" },
    ),
    practice("Tu turno", "fis-hidro-conceptos", 3, 10),
    practice("Tu turno", "fis-flotacion", 4, 16),
    practice("Desafío", "fis-flotacion", 5, 23),
    summary([
      "E = δ_L·V_sum·g: el peso del líquido desalojado.",
      "Flota: E = P; fracción sumergida = δ_c/δ_L.",
      "Emergido = 100 % − sumergido.",
      "En el fondo: N = P − E. Dinamómetro: T = P − E.",
      "Totalmente sumergido, E no cambia con la profundidad.",
    ]),
  ],
  tutor: {
    normal: "Todo cuerpo total o parcialmente sumergido en un fluido en reposo recibe una fuerza vertical hacia arriba igual al peso del fluido desalojado: E = δ_L·V_sum·g. Un cuerpo flota en equilibrio cuando E = P, lo que implica V_sum/V = δ_c/δ_L. Si apoya en el fondo, la normal completa el equilibrio: N = P − E.",
    simple: "El líquido empuja para arriba con una fuerza igual al peso del líquido que corriste. Si el cuerpo es menos denso que el líquido, flota, y la parte que queda adentro es el cociente de densidades.",
    nino: "Cuando te metés en una pileta llena hasta el borde, se derrama agua. El agua te empuja hacia arriba con la misma fuerza que pesa esa agua derramada. Por eso en la pileta te sentís más liviano.",
    ejemplo: "Hielo (0,92 g/cm³) en agua: 92 % sumergido, 8 % afuera.",
    visual: { type: "buoyancy", body: 0.8, liquid: 1 },
    visualText: "Variá la densidad del cuerpo: cuando supera la del líquido, se hunde; si es menor, flota con una fracción δ_c/δ_L adentro.",
    fromZero: "La presión en un líquido aumenta con la profundidad. Un cuerpo sumergido tiene su cara de abajo más profunda que la de arriba, así que el líquido lo empuja más fuerte desde abajo que desde arriba. Esa diferencia es el empuje. Densidad es masa por volumen: 1 g/cm³ es lo mismo que 1 kg/L.",
    why: "El empuje explica por qué flotan los barcos (de acero, pero huecos), cómo funcionan los submarinos y por qué los objetos «pesan menos» bajo el agua.",
    origin: "Para un cubo de área A y altura H sumergido: la cara inferior soporta δ g (h + H) A y la superior δ g h A. La diferencia es δ g H A = δ g V: el peso de un volumen de líquido igual al del cuerpo. Con E = P: δ_L V_sum g = δ_c V g ⇒ V_sum/V = δ_c/δ_L.",
    board: arquimedesBoard,
  },
};

export const fisicaLessons: Lesson[] = [
  vecComponentesLesson,
  vecOperacionesLesson,
  encuentroLesson,
  frenadoLesson,
  graficosVtLesson,
  tiroOblicuoLesson,
  tiroAlturaLesson,
  estaticaParticulaLesson,
  momentosLesson,
  newtonLesson,
  planoInclinadoLesson,
  vinculadosLesson,
  energiaLesson,
  resortePotenciaLesson,
  presionPascalLesson,
  arquimedesLesson,
];
