import type { Lesson } from "@/engine/types";
import { example, explain, intro, practice, quiz, summary } from "./helpers";

export const unidades: Lesson = {
  id: "l-unidades",
  title: "Unidades y notación científica",
  subtitle: "Medir y convertir sin perderse",
  subjectId: "fisica",
  topicIds: ["t-unidades"],
  estimatedMinutes: 12,
  prerequisites: ["t-potencias"],
  cards: [
    intro("Unidades", "El Sistema Internacional, cómo convertir unidades y cómo escribir números muy grandes o muy chicos.", "En Física, un resultado sin unidad está incompleto y una unidad mal convertida arruina todo el ejercicio. Es uno de los errores más frecuentes del CBC."),
    explain(
      "Un número no alcanza",
      "«La distancia es 5» no dice nada. ¿5 metros? ¿5 kilómetros? Una **magnitud física** es número + unidad.\n\nEl **Sistema Internacional (SI)** usa: metro (m) para longitud, segundo (s) para tiempo, kilogramo (kg) para masa. Las demás se arman con estas: velocidad en m/s, aceleración en m/s².",
      { tag: "intuitivo" },
    ),
    explain(
      "Convertir = multiplicar por 1",
      "Como 1 km = 1000 m, la fracción (1000 m)/(1 km) vale 1. Multiplicar por 1 no cambia la cantidad, pero cambia la unidad:\n\n3 km · (1000 m)/(1 km) = 3000 m\n\nLos «km» se cancelan como en una fracción.",
      { tag: "matematico" },
    ),
    explain(
      "km/h ↔ m/s",
      "$72$ km/h $= 72 · 1000$ m $/ 3600$ s $= 20$ m/s.\n\nComo $1000/3600 = 1/3,6$: de km/h a m/s se **divide por 3,6**; de m/s a km/h se **multiplica por 3,6**.\n\nControl de sentido común: m/s siempre da un número más chico que km/h.",
      { widget: { type: "units", value: 72 }, tag: "cotidiano" },
    ),
    example("Ejemplo resuelto", "Pasá 90 km/h a m/s", ["$90 · 1000 = 90 000$ m", "1 h $= 3600$ s", "$90 000 / 3600 = 25$ m/s", "Atajo: $90 / 3,6 = 25$ ✓"], "25 m/s"),
    practice("Ejercicio guiado", "conversion-unidades", 2, 3, true),
    practice("Tu turno", "conversion-unidades", 3, 11),
    explain(
      "Notación científica",
      "La distancia Tierra–Sol es unos $150 000 000 000$ m. Más cómodo: $1,5 × 10^{11}$ m.\n\nForma: $a × 10^n$ con $1 ≤ a < 10$. Números grandes → $n$ positivo. Números chicos → $n$ negativo: $0,0003 = 3 × 10^{−4}$.",
      { tag: "matematico" },
    ),
    practice("Tu turno", "notacion-cientifica", 3, 5),
    practice("Mini desafío", "conversion-unidades", 4, 19),
    summary(["Magnitud = número + unidad.", "Convertir es multiplicar por fracciones que valen 1.", "km/h → m/s: ÷ 3,6. m/s → km/h: · 3,6.", "Notación científica: a × 10ⁿ con 1 ≤ a < 10."]),
  ],
  tutor: {
    normal: "Toda magnitud física se expresa como valor numérico y unidad. Para convertir se multiplica por factores de conversión iguales a 1, de modo que las unidades no deseadas se cancelen.",
    simple: "Para pasar a una unidad más chica, el número crece (2 km = 2000 m). Para pasar a una más grande, el número se achica (500 g = 0,5 kg).",
    nino: "Si medís una mesa en metros te da 2, y en centímetros te da 200. La mesa no cambió: cambió la regla.",
    ejemplo: "36 km/h = 10 m/s (dividido 3,6). 1,5 h = 90 min (por 60).",
    visual: { type: "units", value: 36 },
  },
};

export const vectores: Lesson = {
  id: "l-vectores",
  title: "Vectores",
  subtitle: "Flechas con dirección",
  subjectId: "fisica",
  topicIds: ["t-vectores"],
  estimatedMinutes: 15,
  prerequisites: ["t-potencias", "t-signos"],
  cards: [
    intro("Vectores", "Qué es un vector, sus componentes, cómo calcular su módulo y cómo sumarlos.", "Velocidad, aceleración y fuerza son vectores. La Unidad 1 de Física y la Unidad 1 de Álgebra A empiezan exactamente acá."),
    explain(
      "No alcanza con «cuánto»",
      "Si te digo «caminá 5 cuadras», no sabés a dónde llegás. Hace falta **hacia dónde**.\n\nUn **vector** tiene módulo (cuánto) y dirección y sentido (hacia dónde). Se dibuja como una flecha. La temperatura, en cambio, es un **escalar**: solo un número.",
      { tag: "cotidiano" },
    ),
    explain(
      "Componentes",
      "En el plano, una flecha se describe con dos números: cuánto avanza en $x$ y cuánto en $y$. Se escribe $v = (3, 4)$.\n\nArrastrá la punta del vector y mirá cómo cambian sus componentes y su módulo:",
      { widget: { type: "vector", x: 3, y: 4 }, tag: "intuitivo" },
    ),
    explain(
      "Módulo: Pitágoras",
      "Las componentes y la flecha forman un triángulo rectángulo. El largo de la flecha es la hipotenusa:\n\n$|v| = √(x^2 + y^2)$\n\nPara $(3, 4)$: $√(9 + 16) = √25 = 5$. El módulo siempre es positivo (es un largo).",
      { tag: "matematico" },
    ),
    example("Ejemplo resuelto", "Módulo de $v = (−6, 8)$", ["$|v| = √((−6)^2 + 8^2)$", "$= √(36 + 64)$", "$= √100 = 10$"], "10"),
    practice("Ejercicio guiado", "vector-modulo", 2, 4, true),
    practice("Tu turno", "vector-modulo", 4, 12),
    explain(
      "Sumar vectores",
      "Se suma **componente a componente**: $(1, 3) + (4, −1) = (5, 2)$.\n\nGeométricamente: ponés una flecha a continuación de la otra; la suma va del inicio de la primera a la punta de la segunda.",
      { widget: { type: "vector", x: 4, y: -1, showSum: true }, tag: "intuitivo" },
    ),
    practice("Tu turno", "vector-suma", 2, 8),
    explain(
      "Componentes desde un ángulo",
      "Si conocés el módulo $|v|$ y el ángulo $θ$ con el eje $x$:\n\n$v_x = |v|·cos(θ)$ · $v_y = |v|·sen(θ)$\n\nCoseno va con el cateto **adyacente** al ángulo (el eje x), seno con el **opuesto**.",
      { tag: "matematico" },
    ),
    practice("Tu turno", "vector-componentes", 3, 6),
    practice("Mini desafío", "vector-suma", 5, 16),
    summary(["Vector = módulo + dirección + sentido.", "v = (x, y): componentes.", "|v| = √(x² + y²).", "Suma: componente a componente.", "vx = |v|cos θ, vy = |v|sen θ."]),
  ],
  tutor: {
    normal: "Un vector es una magnitud con módulo, dirección y sentido. En el plano se representa por sus componentes (x, y); su módulo es √(x² + y²) y se suma componente a componente.",
    simple: "Un vector es una flecha. (3, 4) significa «3 a la derecha y 4 para arriba». Su largo se calcula con Pitágoras.",
    nino: "Un mapa del tesoro: «3 pasos al este y 4 al norte». Si fueras en línea recta, caminarías 5 pasos.",
    ejemplo: "(2, 1) + (1, 3) = (3, 4), y |(3, 4)| = 5.",
    visual: { type: "vector", x: 3, y: 4 },
    visualText: "Arrastrá la punta: el módulo se recalcula solo.",
  },
};

export const productoEscalarLesson: Lesson = {
  id: "l-producto-escalar",
  title: "Producto escalar",
  subtitle: "Multiplicar vectores y obtener un número",
  subjectId: "algebra-a",
  topicIds: ["t-producto-escalar"],
  estimatedMinutes: 10,
  prerequisites: ["t-vectores"],
  cards: [
    intro("Producto escalar", "Cómo se calcula el producto escalar en ℝ² y ℝ³ y qué dice sobre el ángulo entre dos vectores.", "Es uno de los primeros temas de Álgebra A: sirve para calcular ángulos, detectar perpendicularidad y, en Física, para calcular el trabajo de una fuerza."),
    explain(
      "La cuenta",
      "Para $u = (u_1, u_2)$ y $v = (v_1, v_2)$:\n\n$u · v = u_1 v_1 + u_2 v_2$\n\nEn $ℝ^3$ se agrega $+ u_3 v_3$. El resultado es un **número** (un escalar), no un vector.",
      { tag: "matematico" },
    ),
    example("Ejemplo resuelto", "Calculá $(2, −1, 3) · (4, 5, −2)$", ["$2·4 = 8$", "$(−1)·5 = −5$", "$3·(−2) = −6$", "$8 − 5 − 6 = −3$"], "−3"),
    explain(
      "Qué significa",
      "$u · v = |u|·|v|·cos(θ)$, donde $θ$ es el ángulo entre ellos. Entonces:\n\n• $u·v > 0$: ángulo agudo (apuntan «parecido»).\n• $u·v = 0$: **perpendiculares** (ortogonales).\n• $u·v < 0$: ángulo obtuso.",
      { tag: "intuitivo" },
    ),
    quiz("Para pensar", {
      id: "q-ortogonal",
      subjectId: "algebra-a",
      topicId: "t-producto-escalar",
      prompt: "¿Son perpendiculares $u = (3, 2)$ y $v = (−2, 3)$?",
      options: ["Sí, porque u·v = 0", "No, porque u·v = 12", "No se puede saber sin dibujar"],
      answer: 0,
      explanation: "u·v = 3·(−2) + 2·3 = −6 + 6 = 0. Producto escalar cero ⇔ vectores perpendiculares.",
      hints: ["Calculá el producto escalar.", "3·(−2) + 2·3.", "¿Qué significa que dé 0?"],
      errors: { 1: ["vectores", "Multiplicaste cruzado. Es x con x e y con y: 3·(−2) + 2·3 = 0."] },
    }, true),
    practice("Tu turno", "producto-escalar", 2, 3),
    practice("Tu turno", "producto-escalar", 4, 9),
    summary(["u·v = u₁v₁ + u₂v₂ (+ u₃v₃).", "El resultado es un número.", "u·v = 0 ⇔ perpendiculares.", "u·v = |u||v|cos θ."]),
  ],
  tutor: {
    normal: "El producto escalar (o interno) de dos vectores es la suma de los productos de sus componentes. Equivale a |u||v|cos θ, por lo que indica el ángulo entre ellos.",
    simple: "Multiplicá x con x, y con y, y sumá. Si da cero, los vectores forman un ángulo recto.",
    nino: "Mide cuánto «apuntan para el mismo lado» dos flechas. Si son perpendiculares, nada: da 0.",
    ejemplo: "(1, 2)·(3, 4) = 3 + 8 = 11.",
  },
};

export const mruLesson: Lesson = {
  id: "l-mru",
  title: "Movimiento rectilíneo uniforme",
  subtitle: "Velocidad constante",
  subjectId: "fisica",
  topicIds: ["t-mru"],
  estimatedMinutes: 12,
  prerequisites: ["t-despeje", "t-unidades"],
  cards: [
    intro("MRU", "Describir un movimiento en línea recta a velocidad constante con una ecuación y un gráfico.", "Es el primer modelo de la Cinemática (Unidad 2 de Física). Todo lo que viene después (MRUV, tiro vertical) se construye sobre esta idea."),
    explain(
      "Posición, tiempo y velocidad",
      "Elegimos un eje (una recta con un 0 y un sentido positivo). La **posición** $x$ dice dónde está el móvil. La **velocidad** $v$ dice cuántos metros cambia la posición por segundo.\n\nSi $v$ es negativa, el móvil va en el sentido negativo del eje.",
      { tag: "intuitivo" },
    ),
    explain(
      "La ecuación",
      "Si la velocidad no cambia:\n\n$x(t) = x_0 + v·t$\n\n$x_0$: posición inicial (en $t = 0$). $v·t$: cuánto se desplazó. Es una **función lineal** del tiempo: la pendiente es la velocidad.",
      { tag: "matematico" },
    ),
    explain(
      "Simulación",
      "Ajustá la posición inicial y la velocidad (dejá la aceleración en 0) y mirá el movimiento y su gráfico $x(t)$:",
      { widget: { type: "kinematics", x0: 0, v0: 5, a: 0 } },
    ),
    example("Ejemplo resuelto", "Un auto está en $x_0 = 20$ m y se mueve a $v = 15$ m/s. ¿Dónde está a los 4 s?", ["$x(4) = 20 + 15·4$", "$= 20 + 60$", "$= 80$ m"], "80 m"),
    practice("Ejercicio guiado", "mru", 2, 6, true),
    practice("Tu turno", "mru", 3, 14),
    quiz("Para pensar", {
      id: "q-mru-signo",
      subjectId: "fisica",
      topicId: "t-mru",
      prompt: "Un móvil tiene $x(t) = 50 − 10t$ (en m y s). ¿Qué está pasando?",
      options: ["Arranca en 50 m y se mueve hacia el sentido negativo a 10 m/s", "Arranca en 10 m y avanza a 50 m/s", "Está frenando"],
      answer: 0,
      explanation: "Comparando con x = x₀ + v·t: x₀ = 50 m y v = −10 m/s. Velocidad negativa = se mueve hacia el sentido negativo del eje, a velocidad constante (no frena).",
      hints: ["Compará con x(t) = x₀ + v·t.", "¿Qué número está solo y cuál multiplica a t?", "v = −10: ¿qué indica el signo?"],
      errors: { 2: ["velocidad-aceleracion", "Una velocidad negativa NO significa frenar: significa ir hacia el sentido negativo. Frenar sería que la velocidad cambie, y en el MRU no cambia."] },
    }),
    practice("Mini desafío", "mru", 5, 27),
    summary(["MRU: la velocidad es constante.", "x(t) = x₀ + v·t.", "En el gráfico x(t), la pendiente es la velocidad.", "v negativa = sentido negativo, no «frenar»."]),
  ],
  tutor: {
    normal: "En el MRU la velocidad es constante, por lo que la posición es una función lineal del tiempo: x(t) = x₀ + v·t. El desplazamiento en un intervalo es v·Δt.",
    simple: "Si vas siempre a la misma velocidad, cada segundo avanzás lo mismo. Posición = dónde empezaste + lo que avanzaste.",
    nino: "Una cinta transportadora: cada segundo mueve tu valija 2 metros. Si la valija empezó en el metro 3, a los 5 segundos está en 3 + 2·5 = 13.",
    ejemplo: "x₀ = 0, v = 20 m/s. A los 3 s: x = 60 m. A los 10 s: x = 200 m.",
    visual: { type: "kinematics", x0: 0, v0: 4, a: 0 },
  },
};

export const mruvLesson: Lesson = {
  id: "l-mruv",
  title: "Movimiento uniformemente variado",
  subtitle: "Cuando la velocidad cambia",
  subjectId: "fisica",
  topicIds: ["t-mruv"],
  estimatedMinutes: 15,
  prerequisites: ["t-mru"],
  cards: [
    intro("MRUV", "Qué es la aceleración y las dos ecuaciones del movimiento con aceleración constante.", "El MRUV es el corazón de la Cinemática del CBC: caída libre, tiro vertical, frenadas y arranques se resuelven con estas ecuaciones."),
    explain(
      "Aceleración",
      "La **aceleración** dice cuánto cambia la **velocidad** por segundo. $a = 2$ m/s² significa: cada segundo, la velocidad aumenta 2 m/s.\n\n¡No confundas! La velocidad cambia la **posición**; la aceleración cambia la **velocidad**.",
      { tag: "intuitivo" },
    ),
    explain(
      "Las dos ecuaciones",
      "Con aceleración constante:\n\n$v(t) = v_0 + a·t$\n$x(t) = x_0 + v_0·t + ½·a·t^2$\n\nLa posición tiene $t^2$ porque la velocidad va creciendo: cada segundo se avanza un poco más que el anterior. El gráfico $x(t)$ es una **parábola**.",
      { tag: "matematico" },
    ),
    explain(
      "Simulación",
      "Ahora poné una aceleración distinta de cero. Probá: velocidad inicial positiva y aceleración negativa. ¿Qué pasa?",
      { widget: { type: "kinematics", x0: 0, v0: 10, a: -2 } },
    ),
    example("Ejemplo resuelto", "Un auto parte del reposo ($v_0 = 0$) con $a = 3$ m/s². ¿Velocidad y posición a los 4 s?", ["$v(4) = 0 + 3·4 = 12$ m/s", "$x(4) = 0 + 0·4 + ½·3·4^2$", "$= ½·3·16 = 24$ m"], "12 m/s y 24 m"),
    practice("Ejercicio guiado", "mruv", 1, 3, true),
    practice("Tu turno", "mruv", 3, 7),
    explain(
      "Frenar o acelerar",
      "Si $v$ y $a$ tienen el **mismo signo**, el móvil va cada vez más rápido. Si tienen **signos opuestos**, frena.\n\nUn auto que va a 20 m/s y frena con $a = −4$ m/s² se detiene cuando $v = 0$: $0 = 20 − 4t$ → $t = 5$ s.",
    ),
    practice("Tu turno", "cinematica-conceptos", 3, 1),
    practice("Tu turno", "mruv", 4, 15),
    practice("Mini desafío", "mruv", 5, 20),
    summary(["La aceleración cambia la velocidad; la velocidad cambia la posición.", "v = v₀ + a·t.", "x = x₀ + v₀·t + ½·a·t².", "Mismo signo v y a: acelera. Signos opuestos: frena."]),
  ],
  tutor: {
    normal: "En el MRUV la aceleración es constante: la velocidad varía linealmente (v = v₀ + at) y la posición cuadráticamente (x = x₀ + v₀t + ½at²).",
    simple: "La aceleración es «cuánto sube la velocidad por segundo». Si a = 2, la velocidad va 0, 2, 4, 6... y la distancia recorrida crece cada vez más rápido.",
    nino: "Cuando bajás en bici por una cuesta, cada segundo vas un poquito más rápido que antes. Eso es aceleración.",
    ejemplo: "v₀ = 5 m/s, a = 2 m/s². A los 3 s: v = 5 + 6 = 11 m/s; x = 15 + 9 = 24 m.",
    visual: { type: "kinematics", x0: 0, v0: 0, a: 2 },
  },
};

export const caidaLibreLesson: Lesson = {
  id: "l-caida-libre",
  title: "Caída libre y tiro vertical",
  subtitle: "MRUV con g = 9,8 m/s²",
  subjectId: "fisica",
  topicIds: ["t-caida-libre"],
  estimatedMinutes: 12,
  prerequisites: ["t-mruv"],
  cards: [
    intro("Caída libre", "Aplicar el MRUV a objetos que caen o se lanzan verticalmente.", "Es un clásico de los parciales de Física: altura máxima, tiempo de vuelo, velocidad al tocar el suelo."),
    explain(
      "Es un MRUV",
      "Sin rozamiento del aire, todo objeto cerca de la superficie terrestre tiene la misma aceleración: $g ≈ 9,8$ m/s², hacia abajo.\n\nSi tomamos el eje $y$ hacia arriba: $a = −9,8$ m/s². Las ecuaciones son las del MRUV:\n\n$v(t) = v_0 − 9,8·t$\n$y(t) = y_0 + v_0·t − 4,9·t^2$",
      { tag: "matematico" },
    ),
    explain(
      "Simulación: tiro vertical",
      "Interpretá el eje como vertical: lanzá hacia arriba con $v_0 = 19,6$ m/s y $a = −9,8$ m/s². ¿Cuándo llega arriba? ¿Cuándo vuelve al punto de partida?",
      { widget: { type: "kinematics", x0: 0, v0: 19.6, a: -9.8 } },
    ),
    explain(
      "La altura máxima",
      "Arriba de todo, la pelota deja de subir: su **velocidad es 0**. Pero la gravedad sigue actuando: su **aceleración sigue siendo −9,8 m/s²**.\n\nTiempo de subida: $0 = v_0 − 9,8t$ → $t = v_0/9,8$. Reemplazando en $y(t)$: $h_{máx} = v_0^2/(2·9,8)$.",
      { tag: "intuitivo" },
    ),
    example("Ejemplo resuelto", "Se lanza hacia arriba a 29,4 m/s. ¿Tiempo de subida y altura máxima?", ["$0 = 29,4 − 9,8·t$ → $t = 3$ s", "$y(3) = 29,4·3 − 4,9·3^2$", "$= 88,2 − 44,1 = 44,1$ m"], "3 s y 44,1 m"),
    practice("Ejercicio guiado", "caida-libre", 2, 2, true),
    practice("Tu turno", "caida-libre", 3, 9),
    practice("Tu turno", "cinematica-conceptos", 3, 5),
    practice("Mini desafío", "caida-libre", 5, 12),
    summary(["Caída libre = MRUV con a = −9,8 m/s² (eje hacia arriba).", "En la altura máxima v = 0, pero a = −9,8 m/s².", "t_subida = v₀/g; h_máx = v₀²/(2g).", "Sin aire, todos los cuerpos caen igual."]),
  ],
  tutor: {
    normal: "La caída libre es un MRUV con aceleración g ≈ 9,8 m/s² dirigida hacia abajo, independiente de la masa. El tiro vertical es el mismo movimiento con velocidad inicial vertical.",
    simple: "Cuando tirás algo para arriba, cada segundo pierde 9,8 m/s de velocidad. Cuando la velocidad llega a 0, está arriba de todo, y empieza a caer.",
    nino: "Tirás una pelota hacia arriba a 20 m/s. Después de 1 s va a 10,2 m/s; después de 2 s, a 0,4 m/s; un poquito después se frena del todo y empieza a bajar.",
    ejemplo: "v₀ = 9,8 m/s: sube durante 1 s y llega a 4,9 m de altura.",
    visual: { type: "kinematics", x0: 0, v0: 14.7, a: -9.8 },
  },
};

export const fisicaLessons = [unidades, vectores, productoEscalarLesson, mruLesson, mruvLesson, caidaLibreLesson];
