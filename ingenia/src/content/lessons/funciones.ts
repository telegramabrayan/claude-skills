import type { Lesson } from "@/engine/types";
import { example, explain, intro, practice, quiz, summary } from "./helpers";

const S = "am-a";

export const funcionesLesson: Lesson = {
  id: "l-funciones",
  title: "¿Qué es una función?",
  subtitle: "Máquinas que transforman números",
  subjectId: S,
  topicIds: ["t-funciones"],
  estimatedMinutes: 12,
  prerequisites: ["t-expresiones"],
  cards: [
    intro("Funciones", "Qué es una función, cómo se evalúa y cómo se dibuja en el plano cartesiano.", "Análisis Matemático A empieza por funciones y todo lo demás (límites, derivadas, integrales) se hace SOBRE funciones. Es la idea más importante del CBC."),
    explain(
      "Una máquina",
      "Una función es una máquina: entra un número $x$ y sale **exactamente un** número $f(x)$.\n\nSi $f(x) = 2x + 1$: entra 3, sale $2·3 + 1 = 7$. Se escribe $f(3) = 7$.\n\nLa clave es «exactamente uno»: para cada entrada, una única salida.",
      { tag: "intuitivo" },
    ),
    explain(
      "En la vida real",
      "El precio de un viaje depende de los kilómetros. La temperatura depende de la hora. La posición de un auto depende del tiempo.\n\nCada vez que decís «**depende de**», hay una función escondida. La variable de la que depende ($x$, $t$) es la **variable independiente**.",
      { tag: "cotidiano" },
    ),
    explain(
      "El plano cartesiano",
      "Para dibujar una función se usan dos ejes: el horizontal ($x$, la entrada) y el vertical ($y$, la salida).\n\nCada par $(x, f(x))$ es un **punto**. Uniendo muchos puntos aparece el gráfico. Probá cambiar la fórmula:",
      { widget: { type: "plot", mode: "free", initial: "x^2" }, tag: "matematico" },
    ),
    example("Ejemplo resuelto", "Si $f(x) = x^2 − 3$, calculá $f(−2)$", ["Reemplazo $x$ por $(−2)$: $f(−2) = (−2)^2 − 3$", "$(−2)^2 = 4$", "$f(−2) = 4 − 3 = 1$", "En el gráfico: el punto $(−2, 1)$"], "1"),
    practice("Ejercicio guiado", "funcion-evaluar", 2, 4, true),
    practice("Tu turno", "funcion-evaluar", 3, 10),
    quiz("Para pensar", {
      id: "q-funcion-def",
      subjectId: S,
      topicId: "t-funciones",
      prompt: "¿Cuál de estas relaciones **no** es una función de $x$ en $y$?",
      options: ["Un mismo x tiene dos valores de y distintos", "Dos x distintos tienen el mismo valor de y", "Cada x tiene un único y"],
      answer: 0,
      explanation: "Una función asigna a cada x UN ÚNICO y. Que dos x compartan la misma salida está permitido (por ejemplo, x² da 4 tanto en 2 como en −2).",
      hints: ["Recordá la condición «exactamente una salida».", "¿Puede una máquina dar dos resultados distintos con la misma entrada?", "Que dos entradas distintas den la misma salida sí está permitido."],
      errors: { 1: ["conceptual", "Eso sí está permitido: f(x) = x² da f(2) = f(−2) = 4 y es una función. Lo prohibido es que UNA entrada tenga DOS salidas."] },
    }),
    practice("Mini desafío", "funcion-evaluar", 5, 21),
    summary(["Una función asigna a cada entrada x una única salida f(x).", "f(3) significa «reemplazá x por 3».", "El gráfico es el conjunto de puntos (x, f(x)).", "«Depende de» → hay una función."]),
  ],
  tutor: {
    normal: "Una función f de A en B asigna a cada elemento x de A un único elemento f(x) de B. Su gráfico es el conjunto de puntos (x, f(x)) del plano.",
    simple: "Una función es una regla: le das un número y te devuelve otro, siempre el mismo para la misma entrada.",
    nino: "Una máquina expendedora: apretás el botón 3 y sale siempre el mismo chocolate. Si a veces saliera otra cosa, no sería una función.",
    ejemplo: "f(x) = x + 10. f(0) = 10, f(5) = 15, f(−3) = 7.",
    visual: { type: "plot", mode: "free", initial: "2x + 1" },
    visualText: "Cambiá la fórmula y mirá cómo cambia el dibujo.",
  },
};

export const rectaLesson: Lesson = {
  id: "l-recta",
  title: "Función lineal y pendiente",
  subtitle: "y = m·x + b",
  subjectId: S,
  topicIds: ["t-recta"],
  estimatedMinutes: 12,
  prerequisites: ["t-funciones", "t-fracciones"],
  cards: [
    intro("Función lineal", "Qué significan la pendiente y la ordenada al origen, cómo calcular la pendiente entre dos puntos y dónde corta una recta al eje x.", "La función lineal modela cualquier cosa que cambia a ritmo constante: MRU, costos, conversiones. Y la derivada (Análisis A) es, en el fondo, una pendiente."),
    explain(
      "Dos números lo definen todo",
      "En $y = m·x + b$:\n\n• $m$ es la **pendiente**: cuánto sube $y$ por cada paso de 1 en $x$.\n• $b$ es la **ordenada al origen**: dónde corta al eje $y$.\n\nMové los controles y mirá qué hace cada uno:",
      { widget: { type: "plot", mode: "linear" }, tag: "intuitivo" },
    ),
    explain(
      "La pendiente en la vida real",
      "Una pendiente de $0,08$ en una calle significa: por cada metro horizontal, sube 8 cm. En un gráfico de posición-tiempo, la pendiente es la **velocidad**.\n\n$m > 0$ sube · $m < 0$ baja · $m = 0$ horizontal.",
      { tag: "cotidiano" },
    ),
    explain(
      "Pendiente entre dos puntos",
      "Dados $(x_1, y_1)$ y $(x_2, y_2)$:\n\n$m = (y_2 − y_1)/(x_2 − x_1)$\n\n«Cuánto cambió $y$» dividido «cuánto cambió $x$». El cambio se escribe con la letra griega $Δ$ (delta): $m = Δy/Δx$.",
      { tag: "matematico" },
    ),
    example("Ejemplo resuelto", "Pendiente de la recta por $(1, 2)$ y $(4, 11)$", ["$Δy = 11 − 2 = 9$", "$Δx = 4 − 1 = 3$", "$m = 9/3 = 3$", "Por cada paso a la derecha, sube 3"], "m = 3"),
    practice("Ejercicio guiado", "pendiente", 2, 2, true),
    practice("Tu turno", "recta-elementos", 2, 7),
    practice("Tu turno", "pendiente", 3, 18),
    explain(
      "La raíz: donde corta al eje x",
      "Sobre el eje $x$ la altura es 0. Para encontrar dónde corta, igualá a cero:\n\n$2x − 6 = 0$ → $x = 3$. La recta corta al eje $x$ en $(3, 0)$.\n\nA ese valor se lo llama **raíz** o **cero** de la función.",
    ),
    practice("Tu turno", "recta-elementos", 4, 13),
    practice("Mini desafío", "pendiente", 5, 26),
    summary(["y = mx + b: m es la pendiente, b la ordenada al origen.", "m = Δy/Δx = (y₂ − y₁)/(x₂ − x₁).", "m > 0 sube, m < 0 baja, m = 0 horizontal.", "La raíz se encuentra igualando a 0."]),
  ],
  tutor: {
    normal: "Una función lineal f(x) = mx + b tiene como gráfico una recta. La pendiente m es la razón de cambio Δy/Δx, constante en toda la recta; b es el valor en x = 0.",
    simple: "La pendiente dice cuánto sube la recta cuando avanzás un paso a la derecha. La ordenada al origen dice a qué altura arranca.",
    nino: "Subís una escalera: si cada escalón te sube 2 cm por cada cm que avanzás, la pendiente es 2. Si empezás parado en una caja de 5 cm, b = 5.",
    ejemplo: "y = 3x − 2: arranca en −2 (eje y) y sube 3 por cada paso. Puntos: (0, −2), (1, 1), (2, 4).",
    visual: { type: "plot", mode: "linear" },
    visualText: "Mové m y b para ver cómo cambia la recta.",
  },
};

export const dominioLesson: Lesson = {
  id: "l-dominio",
  title: "Dominio e imagen",
  subtitle: "Qué números pueden entrar",
  subjectId: S,
  topicIds: ["t-dominio"],
  estimatedMinutes: 10,
  prerequisites: ["t-funciones", "t-ecuaciones"],
  cards: [
    intro("Dominio", "Qué valores de x se pueden usar en una función y cuáles salen.", "En Análisis A, lo primero que se pide al estudiar una función es su dominio. Y muchas «trampas» de parcial están justamente ahí."),
    explain(
      "Entradas permitidas",
      "El **dominio** son todos los $x$ que se pueden reemplazar sin que la cuenta sea imposible. La **imagen** son todos los valores que efectivamente salen.\n\nEn los números reales ($ℝ$) hay dos operaciones prohibidas:\n1. **Dividir por cero.**\n2. **Raíz cuadrada (o de índice par) de un negativo.**",
      { tag: "matematico" },
    ),
    explain(
      "Por qué no se divide por cero",
      "$6/2 = 3$ porque $3·2 = 6$. ¿Cuánto sería $6/0$? Un número que multiplicado por 0 dé 6. No existe: todo número por 0 da 0.\n\nMirá el gráfico de $1/x$: cerca de $x = 0$ se dispara hacia arriba y hacia abajo.",
      { widget: { type: "plot", mode: "free", initial: "1/x" }, tag: "intuitivo" },
    ),
    example("Ejemplo resuelto", "Dominio de $f(x) = 5/(x − 3)$", ["El denominador no puede ser 0: $x − 3 ≠ 0$", "$x ≠ 3$", "Dominio: $ℝ − \\{3\\}$ (todos los reales menos el 3)"], "ℝ − {3}"),
    example("Ejemplo resuelto", "Dominio de $g(x) = √(x + 4)$", ["Lo de adentro de la raíz tiene que ser ≥ 0: $x + 4 ≥ 0$", "$x ≥ −4$", "Dominio: $[−4, +∞)$ — el corchete indica que −4 está incluido"], "[−4, +∞)"),
    practice("Ejercicio guiado", "dominio", 2, 3, true),
    practice("Tu turno", "dominio", 4, 8),
    practice("Mini desafío", "dominio", 5, 15),
    summary(["Dominio: los x permitidos. Imagen: los y que salen.", "Prohibido: dividir por 0 y raíz par de negativos.", "Para encontrar el dominio: planteá la condición y resolvé.", "[ incluye el extremo, ( lo excluye."]),
  ],
  tutor: {
    normal: "El dominio de una función real es el mayor subconjunto de ℝ donde la fórmula está definida. Se excluyen los x que anulan denominadores y los que hacen negativo el radicando de una raíz de índice par.",
    simple: "Preguntate: ¿hay algún número que rompa la cuenta? Si hay una división, el de abajo no puede ser 0. Si hay una raíz cuadrada, lo de adentro no puede ser negativo.",
    nino: "Es como una máquina de jugo que no acepta piedras: hay entradas que la rompen. El dominio es la lista de cosas que sí puede recibir.",
    ejemplo: "f(x) = 1/x no acepta x = 0. f(x) = √x no acepta negativos: su dominio es [0, +∞).",
  },
};

export const funcionesLessons = [funcionesLesson, rectaLesson, dominioLesson];
