import type { BoardStep, Lesson, LessonCard } from "@/engine/types";
import { example, explain, intro, practice, quiz, summary } from "./helpers";

/**
 * Lecciones de Álgebra A (CBC). Contenido estándar de primer año de Ingeniería;
 * los ejercicios son propios y no reproducen material de ninguna cátedra.
 * La Unidad alg-1 reutiliza además l-vectores y l-producto-escalar (fisica.ts).
 */

const S = "algebra-a";
const board = (title: string, steps: BoardStep[], introText?: string, outro?: string): LessonCard => ({ kind: "board", title, steps, intro: introText, outro });

// ═════════════════════════ alg-con · Conjuntos ═════════════════════════

const conjuntosBoard: BoardStep[] = [
  { expr: "U = {1, 2, …, 8},  A = {1, 2, 3, 4},  B = {3, 4, 5, 6}", note: "Datos: el universal y los dos conjuntos" },
  { expr: "A ∩ B = {3, 4}", note: "Intersección: los que están en los dos" },
  { expr: "A ∪ B = {1, 2, 3, 4, 5, 6}", note: "Unión: todo lo que está en alguno (sin repetir)" },
  { expr: "A − B = {1, 2}", note: "Diferencia: a A le quitamos lo que está en B" },
  { expr: "(A ∪ B)^c = {7, 8}", note: "Complemento: lo que queda afuera dentro de U" },
];

export const conjuntosLesson: Lesson = {
  id: "l-alg-conjuntos",
  title: "Conjuntos y operaciones",
  subtitle: "Unión, intersección, diferencia y complemento",
  subjectId: S,
  topicIds: ["t-alg-conjuntos"],
  estimatedMinutes: 10,
  prerequisites: [],
  cards: [
    intro("Conjuntos", "Qué es un conjunto, cómo se describe y cómo se operan dos conjuntos: unión, intersección, diferencia y complemento.", "Es el lenguaje con el que se escribe todo Álgebra: soluciones de inecuaciones, núcleos, imágenes y planos son conjuntos."),
    explain(
      "Una bolsa de elementos",
      "Un **conjunto** es una colección de objetos, sus **elementos**. No importa el orden ni las repeticiones: $\\{1, 2, 3\\} = \\{3, 1, 2\\}$.\n\nSe puede describir **por extensión** (listando: $A = \\{2, 4, 6\\}$) o **por comprensión** (con una propiedad: $A = \\{x ∈ ℕ : x$ par$, x ≤ 6\\}$). $x ∈ A$ se lee «x pertenece a A».",
      { tag: "cotidiano" },
    ),
    quiz("Para pensar", {
      id: "q-alg-pertenencia",
      subjectId: S,
      topicId: "t-alg-conjuntos",
      prompt: "Si $A = \\{x ∈ ℤ : −2 ≤ x < 3\\}$, ¿cuál es A por extensión?",
      options: ["$\\{−2, −1, 0, 1, 2\\}$", "$\\{−2, −1, 0, 1, 2, 3\\}$", "$\\{−1, 0, 1, 2\\}$"],
      answer: 0,
      explanation: "Los enteros con −2 ≤ x < 3: el −2 entra (≤) y el 3 no (<). Quedan −2, −1, 0, 1, 2.",
      hints: ["Mirá cada desigualdad por separado.", "≤ incluye el extremo, < no.", "¿El 3 cumple x < 3?"],
      errors: { 1: ["conceptual", "El 3 no cumple x < 3: la desigualdad es estricta."], 2: ["conceptual", "El −2 sí cumple −2 ≤ x (el ≤ incluye la igualdad)."] },
    }, true),
    explain(
      "Las cuatro operaciones",
      "Con dos conjuntos $A$ y $B$ dentro de un universal $U$:\n\n• $A ∪ B$: los que están en $A$ **o** en $B$.\n• $A ∩ B$: los que están en $A$ **y** en $B$.\n• $A − B$: los de $A$ que **no** están en $B$.\n• $A^c$: los de $U$ que no están en $A$.\n\nCada operación es una condición lógica sobre cada elemento.",
      { tag: "matematico" },
    ),
    board("Operar paso a paso", conjuntosBoard, "Calculamos todo a partir de la intersección, que es lo primero que conviene mirar.", "Fijate que $(A ∪ B)^c = A^c ∩ B^c$: es una de las **leyes de De Morgan**."),
    example("Ejemplo resuelto", "Con $U = \\{1, …, 6\\}$, $A = \\{1, 2, 5\\}$, $B = \\{2, 3\\}$, calculá $A ∩ B^c$.", ["$B^c = \\{1, 4, 5, 6\\}$", "$A ∩ B^c$: los de A que están en $B^c$", "$= \\{1, 5\\}$, que coincide con $A − B$"], "{1, 5}"),
    practice("Ejercicio guiado", "alg-conjuntos-operacion", 1, 3, true),
    explain(
      "Error típico: el orden en la diferencia",
      "La unión y la intersección no dependen del orden: $A ∪ B = B ∪ A$. La diferencia **sí**: $A − B ≠ B − A$.\n\nOtro clásico es De Morgan mal aplicado: $(A ∪ B)^c$ **no** es $A^c ∪ B^c$. Al complementar, ∪ se transforma en ∩ (y viceversa).",
      { tag: "intuitivo" },
    ),
    practice("Tu turno", "alg-conjuntos-relacionar", 2, 5),
    practice("Tu turno", "alg-conjuntos-operacion", 3, 8),
    practice("Desafío", "alg-conjuntos-operacion", 5, 13),
    summary(["A ∪ B: en A o en B. A ∩ B: en A y en B.", "A − B: en A pero no en B (el orden importa).", "A^c: en U pero no en A.", "De Morgan: (A ∪ B)^c = A^c ∩ B^c y (A ∩ B)^c = A^c ∪ B^c."]),
  ],
  tutor: {
    normal: "Un conjunto queda determinado por sus elementos. La unión reúne los elementos de ambos, la intersección conserva los comunes, la diferencia A − B quita de A los que están en B y el complemento toma lo que falta respecto del universal.",
    simple: "Unión = juntar todo. Intersección = quedarse con lo repetido. A − B = tachar de A lo que también está en B. Complemento = lo que no está.",
    nino: "Dos listas de invitados a dos cumpleaños. La unión es toda la gente que fue a alguno; la intersección, los que fueron a los dos; A − B, los que fueron solo al primero.",
    ejemplo: "A = {1, 2, 3}, B = {2, 3, 4}: A ∪ B = {1, 2, 3, 4}, A ∩ B = {2, 3}, A − B = {1}.",
    fromZero: "Un conjunto es una «bolsa» de cosas. Para saber si algo está, solo preguntás «¿pertenece?». Las operaciones combinan esas preguntas con «o», «y» y «no».",
    why: "Así se escribe con precisión «cuáles cumplen tal cosa»: las soluciones de una ecuación, los puntos de un plano, los vectores que una transformación manda al 0.",
    origin: "Las operaciones vienen de la lógica: ∪ es «o», ∩ es «y», el complemento es «no». De Morgan es la versión en conjuntos de «no (p o q) = (no p) y (no q)».",
    board: conjuntosBoard,
  },
};

// ── Intervalos y valor absoluto ──

const absBoard: BoardStep[] = [
  { expr: "|2x − 6| < 4", note: "Inecuación de partida" },
  { expr: "2·|x − 3| < 4", note: "Sacamos factor común 2 adentro del módulo" },
  { expr: "|x − 3| < 2", note: "Dividimos por 2 en ambos lados" },
  { expr: "−2 < x − 3 < 2", note: "Distancia a 3 menor que 2" },
  { expr: "1 < x < 5", note: "Sumamos 3 en las tres partes" },
  { expr: "S = (1, 5)", note: "Extremos abiertos porque la desigualdad es estricta" },
];

export const valorAbsolutoLesson: Lesson = {
  id: "l-alg-valor-absoluto",
  title: "Intervalos y valor absoluto",
  subtitle: "Inecuaciones como |x − a| < r",
  subjectId: S,
  topicIds: ["t-alg-valor-absoluto"],
  estimatedMinutes: 11,
  prerequisites: ["t-alg-conjuntos", "t-ecuaciones"],
  cards: [
    intro("Intervalos y valor absoluto", "Cómo escribir conjuntos de la recta como intervalos y resolver inecuaciones del tipo |x − a| < r y |x − a| > r.", "Aparecen en dominios, en límites (los famosos ε y δ) y en cualquier problema de tolerancias: «el valor tiene que estar a menos de 0,1 de 5»."),
    explain(
      "Valor absoluto = distancia",
      "$|x − a|$ es la **distancia** entre $x$ y $a$ en la recta.\n\nPensalo como una tolerancia de fabricación: una pieza de 50 mm se acepta si $|x − 50| ≤ 0,2$, es decir, si mide entre 49,8 y 50,2 mm. «Estar cerca» es un intervalo; «estar lejos» son dos semirrectas.",
      { tag: "cotidiano" },
    ),
    quiz("Para pensar", {
      id: "q-alg-abs-distancia",
      subjectId: S,
      topicId: "t-alg-valor-absoluto",
      prompt: "¿Qué significa $|x + 2| < 1$?",
      options: ["x está a menos de 1 de −2", "x está a menos de 1 de 2", "x está a más de 1 de −2"],
      answer: 0,
      explanation: "|x + 2| = |x − (−2)|: es la distancia de x a −2. «< 1» significa a menos de 1. Solución: (−3, −1).",
      hints: ["Escribí x + 2 como x − (algo).", "x + 2 = x − (−2).", "< es «cerca», > es «lejos»."],
      errors: { 1: ["signos", "|x + 2| = |x − (−2)|: el centro es −2, no 2."], 2: ["conceptual", "«< 1» es estar a MENOS de 1 de distancia."] },
    }, true),
    explain(
      "Intervalos",
      "Corchete = extremo incluido; paréntesis = no incluido; con ∞ siempre paréntesis.\n\n• $|x − a| < r$ ⇔ $a − r < x < a + r$ ⇔ $x ∈ (a − r, a + r)$\n• $|x − a| > r$ ⇔ $x < a − r$ o $x > a + r$ ⇔ $x ∈ (−∞, a − r) ∪ (a + r, +∞)$\n\nCon ≤ o ≥, los extremos van con corchete.",
      { tag: "matematico", widget: { type: "numberline", min: -2, max: 8, start: 3 } },
    ),
    board("Resolver |2x − 6| < 4", absBoard, "Cuando hay un coeficiente, primero lo sacamos del módulo."),
    example("Ejemplo resuelto", "Resolvé $|x − 1| ≥ 3$.", ["Distancia de x a 1 mayor o igual que 3.", "$x ≤ 1 − 3 = −2$ o $x ≥ 1 + 3 = 4$", "$S = (−∞, −2] ∪ [4, +∞)$"], "(−∞, −2] ∪ [4, +∞)"),
    practice("Ejercicio guiado", "alg-abs-intervalo", 2, 4, true),
    explain(
      "Error típico: el signo del centro",
      "En $|x + 5| < 2$ el centro es $−5$, no $5$: $|x + 5| = |x − (−5)|$. Solución: $(−7, −3)$.\n\nOtro error: escribir $|x − a| > r$ como un solo intervalo. «Lejos de a» deja dos pedazos, uno a cada lado.",
      { tag: "intuitivo" },
    ),
    practice("Tu turno", "alg-intervalos-operacion", 2, 6),
    practice("Tu turno", "alg-abs-intervalo", 4, 9),
    practice("Desafío", "alg-abs-intervalo", 6, 11),
    summary(["|x − a| es la distancia de x a a.", "|x − a| < r ⇒ (a − r, a + r).", "|x − a| > r ⇒ (−∞, a − r) ∪ (a + r, +∞).", "≤ y ≥ incluyen los extremos (corchetes).", "|kx − b| = |k|·|x − b/k|: sacá el coeficiente primero."]),
  ],
  tutor: {
    normal: "|x − a| representa la distancia entre x y a. La inecuación |x − a| < r describe el intervalo abierto centrado en a de radio r; |x − a| > r describe su complemento sin los extremos, que es la unión de dos semirrectas.",
    simple: "|x − 3| < 2 quiere decir «x está a menos de 2 del 3», o sea entre 1 y 5. Si fuera > 2, sería «más lejos que 2»: menos de 1 o más de 5.",
    nino: "Un perro atado con una correa de 2 metros a un poste en el punto 3 puede estar en cualquier lugar entre 1 y 5. Esa es la solución de |x − 3| ≤ 2.",
    ejemplo: "|x − 4| < 1 ⇒ 3 < x < 5 ⇒ (3, 5).",
    visual: { type: "numberline", min: -2, max: 8, start: 3 },
    visualText: "Ubicá el centro y contá r para cada lado.",
    fromZero: "El valor absoluto de un número es ese número sin signo: |−3| = 3. Por eso |x − a| mide cuánto hay entre x y a, sin importar quién está a la izquierda.",
    why: "Porque así se expresa «estar cerca» con una sola desigualdad. Es la base de las aproximaciones, los errores de medición y la definición de límite.",
    origin: "Como |y| < r ⇔ −r < y < r (los números a menos de r del 0), reemplazando y = x − a y sumando a en las tres partes queda a − r < x < a + r.",
    board: absBoard,
  },
};

// ═════════════════════════ alg-cx · Complejos y polinomios ═════════════════════════

const complejosBoard: BoardStep[] = [
  { expr: "(2 + 3i)(1 − 4i)", note: "Producto en forma binómica" },
  { expr: "2·1 + 2·(−4i) + 3i·1 + 3i·(−4i)", note: "Distributiva: cuatro productos" },
  { expr: "2 − 8i + 3i − 12i²", note: "Resolvemos cada producto" },
  { expr: "2 − 8i + 3i + 12", note: "Reemplazamos i² = −1" },
  { expr: "14 − 5i", note: "Agrupamos parte real e imaginaria" },
];

export const complejosLesson: Lesson = {
  id: "l-alg-complejos",
  title: "Números complejos",
  subtitle: "Forma binómica, operaciones y conjugado",
  subjectId: S,
  topicIds: ["t-alg-complejos"],
  estimatedMinutes: 12,
  prerequisites: ["t-expresiones", "t-potencias"],
  cards: [
    intro("Números complejos", "Qué es i, cómo se escribe un complejo a + bi y cómo se suma, multiplica y divide (con el conjugado).", "Permiten resolver cualquier ecuación polinómica, y en Ingeniería se usan para circuitos de corriente alterna y señales."),
    explain(
      "Un número nuevo",
      "En los reales $x^2 = −1$ no tiene solución. Se inventa un número $i$ con $i^2 = −1$ y se trabaja con los **complejos** $z = a + bi$, con $a, b ∈ ℝ$.\n\n$a = Re(z)$ es la **parte real** y $b = Im(z)$ la **parte imaginaria** (sin la i). Cada complejo es un punto $(a, b)$ del plano.",
      { tag: "intuitivo", widget: { type: "vector", x: 3, y: 2 } },
    ),
    quiz("Para pensar", {
      id: "q-alg-parte-imag",
      subjectId: S,
      topicId: "t-alg-complejos",
      prompt: "¿Cuál es la parte imaginaria de $z = 4 − 7i$?",
      options: ["$−7$", "$−7i$", "$7$"],
      answer: 0,
      explanation: "Im(a + bi) = b: es un número real. Para 4 − 7i, b = −7.",
      hints: ["Escribilo como a + bi.", "4 − 7i = 4 + (−7)i.", "La parte imaginaria es el número que acompaña a la i."],
      errors: { 1: ["conceptual", "La parte imaginaria es el número real b, sin la i."], 2: ["signos", "El signo forma parte de b: 4 − 7i = 4 + (−7)i."] },
    }, true),
    explain(
      "Operar",
      "Se opera como con polinomios en $i$, cambiando $i^2$ por $−1$:\n\n• Suma: $(a + bi) + (c + di) = (a + c) + (b + d)i$\n• Producto: $(a + bi)(c + di) = (ac − bd) + (ad + bc)i$\n• **Conjugado**: $z̄ = a − bi$, y $z·z̄ = a^2 + b^2$ (¡real!).\n\nPara dividir, multiplicá arriba y abajo por el conjugado del denominador.",
      { tag: "matematico" },
    ),
    board("Multiplicar dos complejos", complejosBoard),
    example("Ejemplo resuelto: cociente", "Calculá $\\frac{5 + 5i}{1 + 2i}$.", ["Multiplicamos por $\\frac{1 − 2i}{1 − 2i}$.", "Numerador: $(5 + 5i)(1 − 2i) = 5 − 10i + 5i − 10i^2 = 15 − 5i$", "Denominador: $1^2 + 2^2 = 5$", "$\\frac{15 − 5i}{5} = 3 − i$"], "3 − i"),
    practice("Ejercicio guiado", "alg-complejo-operacion", 1, 2, true),
    explain(
      "Potencias de i",
      "$i^1 = i$, $i^2 = −1$, $i^3 = −i$, $i^4 = 1$ y después se repite. Para $i^n$ alcanza el **resto de dividir n por 4**: $i^{27} = i^3 = −i$ porque $27 = 4·6 + 3$.\n\nError típico: olvidar que $i^2 = −1$ en el producto. En $(2i)(3i) = 6i^2 = −6$, el resultado es real y negativo.",
      { tag: "intuitivo" },
    ),
    practice("Tu turno", "alg-potencia-i", 2, 7),
    practice("Tu turno", "alg-complejo-operacion", 3, 10),
    practice("Desafío", "alg-complejo-cociente", 4, 12),
    summary(["z = a + bi, con i² = −1.", "Re(z) = a, Im(z) = b (sin la i).", "Se opera como polinomios cambiando i² por −1.", "Conjugado: a − bi; z·z̄ = a² + b².", "Dividir: multiplicar por el conjugado del denominador.", "iⁿ depende del resto de n ÷ 4."]),
  ],
  tutor: {
    normal: "El conjunto ℂ = {a + bi : a, b ∈ ℝ}, con i² = −1, extiende a los reales. Suma y producto se definen extendiendo las reglas algebraicas; el conjugado permite dividir porque z·z̄ = |z|² es real.",
    simple: "Un complejo tiene dos partes: una real y una que acompaña a i. Sumás parte con parte; para multiplicar hacés distributiva y donde aparece i² ponés −1.",
    nino: "Es como tener una cuenta en pesos y otra en dólares: al sumar, juntás pesos con pesos y dólares con dólares. La i es la «moneda» especial que al elevarla al cuadrado se convierte en −1 peso.",
    ejemplo: "(1 + i) + (2 − 3i) = 3 − 2i; (1 + i)(1 − i) = 1 − i² = 2.",
    visual: { type: "vector", x: 3, y: 2 },
    visualText: "El complejo 3 + 2i es el punto (3, 2): parte real en el eje horizontal, imaginaria en el vertical.",
    fromZero: "Los números reales están en una recta. Los complejos agregan una segunda dirección, la de i. Así cada número es un punto del plano: cuánto avanza en la dirección real y cuánto en la imaginaria.",
    why: "Porque con ellos toda ecuación polinómica tiene solución (Teorema Fundamental del Álgebra), y porque rotaciones y oscilaciones se describen muy fácil multiplicando complejos.",
    origin: "El producto sale de la distributiva: (a + bi)(c + di) = ac + adi + bci + bdi² = (ac − bd) + (ad + bc)i, usando i² = −1.",
    board: complejosBoard,
  },
};

const polarBoard: BoardStep[] = [
  { expr: "z = 1 + i", note: "Queremos calcular z^8" },
  { expr: "|z| = √(1^2 + 1^2) = √2", note: "Módulo: distancia al origen" },
  { expr: "θ = 45°", note: "Primer cuadrante, tg θ = 1/1" },
  { expr: "z^8 = (√2)^8 (cos 360° + i sen 360°)", note: "De Moivre: módulo a la 8, ángulo por 8" },
  { expr: "z^8 = 16(1 + 0i) = 16", note: "cos 360° = 1, sen 360° = 0" },
];

export const complejosPolarLesson: Lesson = {
  id: "l-alg-complejos-polar",
  title: "Forma trigonométrica y De Moivre",
  subtitle: "Módulo, argumento y potencias",
  subjectId: S,
  topicIds: ["t-alg-complejos-polar"],
  estimatedMinutes: 12,
  prerequisites: ["t-alg-complejos", "t-trigonometria"],
  cards: [
    intro("Forma trigonométrica", "Cómo describir un complejo por su módulo y su ángulo, y cómo eso convierte las potencias en una cuenta corta (De Moivre).", "Calcular (1 + i)^8 desarrollando es eterno; en forma trigonométrica son dos renglones."),
    explain(
      "Distancia y dirección",
      "Un complejo $z = a + bi$ es un punto del plano. En vez de dar sus coordenadas, podés decir **a qué distancia** del origen está (el módulo $|z|$) y **en qué dirección** (el argumento $θ$, medido desde el semieje real positivo).\n\nEs como indicar un lugar con «5 cuadras en dirección noreste».",
      { tag: "cotidiano" },
    ),
    quiz("Para pensar", {
      id: "q-alg-cuadrante",
      subjectId: S,
      topicId: "t-alg-complejos-polar",
      prompt: "¿En qué cuadrante está $z = −2 + 2i$ y cuál es su argumento?",
      options: ["2.º cuadrante, 135°", "4.º cuadrante, −45°", "1.er cuadrante, 45°"],
      answer: 0,
      explanation: "Parte real negativa e imaginaria positiva: segundo cuadrante. El ángulo de referencia es 45°, así que θ = 180° − 45° = 135°.",
      hints: ["Ubicá el punto (−2, 2).", "x negativo, y positivo.", "El ángulo de referencia es arctg(2/2) = 45°."],
      errors: { 1: ["trigonometria", "−45° es lo que da arctg(2/(−2)) en la calculadora, pero el punto está en el 2.º cuadrante: hay que sumar 180°."] },
    }, true),
    explain(
      "Módulo, argumento y De Moivre",
      "$|z| = √(a^2 + b^2)$ y $tg θ = b/a$ (corrigiendo según el cuadrante). Entonces\n\n$z = |z|(cos θ + i sen θ)$\n\nAl multiplicar, los módulos se multiplican y los argumentos se **suman**. Por eso (De Moivre):\n\n$[r(cos θ + i sen θ)]^n = r^n(cos nθ + i sen nθ)$",
      { tag: "matematico", widget: { type: "vector-components", mag: 2, angle: 60 } },
    ),
    board("Calcular (1 + i)^8", polarBoard),
    example("Ejemplo resuelto", "Escribí $z = −√3 + i$ en forma trigonométrica.", ["$|z| = √(3 + 1) = 2$", "Ángulo de referencia: $arctg(1/√3) = 30°$", "Segundo cuadrante: $θ = 180° − 30° = 150°$", "$z = 2(cos 150° + i sen 150°)$"], "2(cos 150° + i sen 150°)"),
    practice("Ejercicio guiado", "alg-complejo-polar", 1, 3, true),
    explain(
      "Error típico: la calculadora y el cuadrante",
      "$arctg(b/a)$ solo devuelve ángulos entre $−90°$ y $90°$. Si $a < 0$, sumá $180°$; si el resultado es negativo, sumá $360°$ para quedar en $[0°, 360°)$.\n\nSiempre ubicá el punto en el plano antes de confiar en la calculadora.",
      { tag: "intuitivo" },
    ),
    practice("Tu turno", "alg-complejo-polar", 3, 5),
    practice("Tu turno", "alg-de-moivre", 2, 8),
    practice("Desafío", "alg-de-moivre", 5, 14),
    summary(["|z| = √(a² + b²): distancia al origen.", "θ: ángulo con el semieje real positivo, corregido por cuadrante.", "z = |z|(cos θ + i sen θ).", "Producto: módulos se multiplican, argumentos se suman.", "De Moivre: zⁿ = rⁿ(cos nθ + i sen nθ)."]),
  ],
  tutor: {
    normal: "Todo complejo no nulo se escribe z = r(cos θ + i sen θ), con r = |z| y θ = arg(z). En esta forma el producto multiplica módulos y suma argumentos, de donde se deduce la fórmula de De Moivre para potencias.",
    simple: "En vez de «a + bi» decís «a qué distancia y con qué ángulo». Para elevar a la n: la distancia se eleva a la n y el ángulo se multiplica por n.",
    nino: "Es como una aguja de reloj que además puede estirarse: multiplicar por un complejo la gira cierto ángulo y la estira cierta cantidad. Elevar a la 3 es hacer ese giro y ese estiramiento tres veces.",
    ejemplo: "z = 2(cos 30° + i sen 30°) ⇒ z³ = 8(cos 90° + i sen 90°) = 8i.",
    visual: { type: "vector-components", mag: 2, angle: 60 },
    visualText: "La flecha de largo 2 y ángulo 60° es el complejo 2(cos 60° + i sen 60°) = 1 + √3 i.",
    fromZero: "Un punto del plano se puede ubicar con coordenadas (a, b) o con una distancia y un ángulo. Con trigonometría se pasa de una forma a la otra: a = r cos θ, b = r sen θ.",
    why: "Porque multiplicar en forma binómica es pesado, pero en forma trigonométrica es sumar ángulos. Así las potencias y las raíces de complejos salen en un par de renglones.",
    origin: "Multiplicando r(cos α + i sen α)·s(cos β + i sen β) y usando las fórmulas del coseno y del seno de una suma queda rs(cos(α + β) + i sen(α + β)). Repitiendo n veces se obtiene De Moivre.",
    board: polarBoard,
  },
};

const ruffiniBoard: BoardStep[] = [
  { expr: "P(x) = 2x^3 − 3x^2 − 5x + 6,  a = 2", note: "Dividimos por (x − 2): usamos a = 2" },
  { expr: "2 | −3 | −5 | 6", note: "Coeficientes en orden (con 0 si falta un grado)" },
  { expr: "2", note: "Bajamos el primero" },
  { expr: "2·2 − 3 = 1", note: "Multiplicamos por a y sumamos al siguiente" },
  { expr: "1·2 − 5 = −3", note: "Repetimos" },
  { expr: "−3·2 + 6 = 0", note: "El último número es el resto" },
  { expr: "Q(x) = 2x^2 + x − 3,  R = 0", note: "El cociente tiene un grado menos" },
];

export const polinomiosDivisionLesson: Lesson = {
  id: "l-alg-polinomios-division",
  title: "División de polinomios y Ruffini",
  subtitle: "Cociente, resto y teorema del resto",
  subjectId: S,
  topicIds: ["t-alg-polinomios-division"],
  estimatedMinutes: 11,
  prerequisites: ["t-expresiones", "t-potencias"],
  cards: [
    intro("División de polinomios", "Qué significa dividir polinomios, cómo dividir por (x − a) con la regla de Ruffini y cómo obtener el resto sin dividir.", "Es la herramienta para encontrar raíces y factorizar, y aparece en límites, integrales y ecuaciones."),
    explain(
      "Como dividir números",
      "$17 ÷ 5$ da cociente 3 y resto 2 porque $17 = 5·3 + 2$. Con polinomios es igual:\n\n$P(x) = D(x)·Q(x) + R(x)$\n\ncon el resto de grado menor que el divisor. Si dividís por $(x − a)$, el resto es **un número**.",
      { tag: "intuitivo" },
    ),
    quiz("Para pensar", {
      id: "q-alg-grado-cociente",
      subjectId: S,
      topicId: "t-alg-polinomios-division",
      prompt: "Si dividís un polinomio de grado 5 por $(x − 3)$, ¿qué grado tiene el cociente?",
      options: ["4", "5", "2"],
      answer: 0,
      explanation: "Grado del cociente = grado del dividendo − grado del divisor = 5 − 1 = 4.",
      hints: ["¿Qué grado tiene x − 3?", "Los grados se restan al dividir.", "5 − 1."],
      errors: { 1: ["potencias", "Al dividir por un polinomio de grado 1, el grado baja en 1."], 2: ["potencias", "Se resta el grado del divisor (1), no el número 3."] },
    }, true),
    explain(
      "Teorema del resto",
      "Si $P(x) = (x − a)Q(x) + R$, reemplazando $x = a$:\n\n$P(a) = 0·Q(a) + R = R$\n\nEl resto de dividir por $(x − a)$ es $P(a)$. Ojo: para $(x + 2)$ el valor es $a = −2$.\n\nEl gráfico muestra $P(x) = 2x^3 − 3x^2 − 5x + 6$: corta al eje en $x = 2$, por eso el resto de dividir por $(x − 2)$ es 0.",
      { tag: "matematico", widget: { type: "plot", mode: "free", initial: "2x^3-3x^2-5x+6" } },
    ),
    board("Regla de Ruffini", ruffiniBoard),
    example("Ejemplo resuelto", "Hallá el resto de dividir $P(x) = x^4 − 3x^2 + 2x − 1$ por $x + 1$.", ["El divisor se anula en $x = −1$.", "$P(−1) = 1 − 3 − 2 − 1$", "$= −5$"], "−5"),
    practice("Ejercicio guiado", "alg-teorema-resto", 1, 2, true),
    explain(
      "Errores típicos",
      "1. **El signo de a**: para dividir por $x + 3$ se usa $a = −3$ (el valor que anula el divisor).\n2. **Grados faltantes**: en $x^3 − 2x + 1$ falta $x^2$. En Ruffini hay que poner un 0 en su lugar: $1 \\| 0 \\| −2 \\| 1$. Si no, todo se corre.",
      { tag: "intuitivo" },
    ),
    practice("Tu turno", "alg-ruffini-cociente", 1, 4),
    practice("Tu turno", "alg-teorema-resto", 3, 6),
    practice("Desafío", "alg-ruffini-cociente", 5, 9),
    summary(["P = D·Q + R, con grado(R) < grado(D).", "Ruffini: divide por (x − a); se baja, se multiplica por a y se suma.", "Completá con 0 los grados que faltan.", "Teorema del resto: el resto de P ÷ (x − a) es P(a).", "Si P(a) = 0, (x − a) divide a P."]),
  ],
  tutor: {
    normal: "Dados P y D ≠ 0 existen únicos Q y R con P = D·Q + R y grado(R) < grado(D) (o R = 0). Para D = x − a, la regla de Ruffini calcula Q y R, y el teorema del resto afirma que R = P(a).",
    simple: "Dividir por (x − a) con Ruffini: bajás el primer coeficiente, lo multiplicás por a, lo sumás al siguiente, y así. El último número es el resto, que también podés calcular reemplazando x por a.",
    nino: "Es como repartir caramelos: sabés cuántos le tocan a cada uno (el cociente) y cuántos sobran (el resto). El teorema del resto es un atajo para saber cuántos sobran sin hacer todo el reparto.",
    ejemplo: "(x² + 5x + 7) ÷ (x + 2): Ruffini con −2 da 1, 3 | 1, o sea Q = x + 3 y R = 1 = P(−2).",
    visual: { type: "plot", mode: "free", initial: "2x^3-3x^2-5x+6" },
    visualText: "Donde el gráfico corta al eje x, el resto de dividir por (x − a) es cero.",
    fromZero: "Un polinomio es una suma de términos como 3x² o −5x. Dividirlo por (x − a) es escribirlo como (x − a) por otro polinomio, más algo que sobra.",
    why: "Porque así se baja el grado: si encontrás una raíz, dividís y te queda un polinomio más chico, que ya sabés resolver.",
    origin: "Ruffini es la división larga de polinomios escrita solo con los coeficientes, aprovechando que el divisor x − a tiene coeficiente principal 1. El teorema del resto sale de reemplazar x = a en P = (x − a)Q + R.",
    board: ruffiniBoard,
  },
};

const raicesBoard: BoardStep[] = [
  { expr: "P(x) = x^3 − 2x^2 − 5x + 6", note: "Buscamos raíces entre los divisores de 6" },
  { expr: "P(1) = 1 − 2 − 5 + 6 = 0", note: "x = 1 es raíz" },
  { expr: "P(x) = (x − 1)(x^2 − x − 6)", note: "Ruffini con a = 1" },
  { expr: "x^2 − x − 6 = 0  ⇒  x = 3,  x = −2", note: "Resolvente para el cuadrático" },
  { expr: "P(x) = (x − 1)(x − 3)(x + 2)", note: "Factorización completa" },
];

export const polinomiosRaicesLesson: Lesson = {
  id: "l-alg-polinomios-raices",
  title: "Raíces y factorización",
  subtitle: "De las raíces a los factores",
  subjectId: S,
  topicIds: ["t-alg-polinomios-raices"],
  estimatedMinutes: 10,
  prerequisites: ["t-alg-polinomios-division", "t-cuadratica"],
  cards: [
    intro("Raíces y factorización", "Cómo encontrar raíces de un polinomio y escribirlo como producto de factores (x − r).", "Factorizar permite simplificar expresiones, estudiar signos y resolver ecuaciones de grado alto."),
    explain(
      "Raíz = donde se anula",
      "$r$ es **raíz** de $P$ si $P(r) = 0$. Por el teorema del resto, eso pasa exactamente cuando $(x − r)$ divide a $P$.\n\nEs como encontrar una pieza que encaja: cada raíz que descubrís «saca» un factor y deja un polinomio más chico.",
      { tag: "intuitivo", widget: { type: "plot", mode: "free", initial: "x^3-2x^2-5x+6" } },
    ),
    quiz("Para pensar", {
      id: "q-alg-factor",
      subjectId: S,
      topicId: "t-alg-polinomios-raices",
      prompt: "Si $x = −4$ es raíz de $P$, ¿qué factor tiene P seguro?",
      options: ["$(x + 4)$", "$(x − 4)$", "$(4x)$"],
      answer: 0,
      explanation: "Raíz r ⇒ factor (x − r). Con r = −4: x − (−4) = x + 4.",
      hints: ["El factor es (x − r).", "Reemplazá r = −4.", "x − (−4) = ?"],
      errors: { 1: ["signos", "Si r es raíz el factor es (x − r); con r = −4 queda (x + 4)."] },
    }, true),
    explain(
      "Factorizar",
      "Si $P$ tiene grado $n$, coeficiente principal $a_n$ y raíces $x_1, …, x_n$:\n\n$P(x) = a_n(x − x_1)(x − x_2)…(x − x_n)$\n\nPara polinomios con coeficientes enteros, las raíces enteras dividen al término independiente: probá esos divisores primero.",
      { tag: "matematico" },
    ),
    board("Factorizar un polinomio de grado 3", raicesBoard),
    example("Ejemplo resuelto", "Factorizá $P(x) = 2x^2 − 2x − 12$.", ["Sacamos el coeficiente principal: $2(x^2 − x − 6)$", "Raíces de $x^2 − x − 6$: $x = 3$ y $x = −2$", "$P(x) = 2(x − 3)(x + 2)$"], "2(x − 3)(x + 2)"),
    practice("Ejercicio guiado", "alg-polinomio-factorizar", 1, 3, true),
    explain(
      "Error típico: perder el coeficiente principal",
      "$2x^2 − 2x − 12$ y $(x − 3)(x + 2)$ tienen las mismas raíces, pero **no** son el mismo polinomio: el segundo da $x^2 − x − 6$. El coeficiente principal va adelante.\n\nVerificá siempre multiplicando o evaluando en un número cómodo, como $x = 0$.",
      { tag: "intuitivo" },
    ),
    practice("Tu turno", "alg-polinomio-factorizar", 3, 6),
    practice("Tu turno", "alg-teorema-resto", 4, 9),
    practice("Desafío", "alg-polinomio-factorizar", 5, 11),
    summary(["r es raíz ⇔ P(r) = 0 ⇔ (x − r) divide a P.", "Cada raíz baja un grado (Ruffini).", "P(x) = aₙ(x − x₁)…(x − xₙ).", "Raíces enteras: divisores del término independiente.", "No olvides el coeficiente principal."]),
  ],
  tutor: {
    normal: "Si r es raíz de P, por el teorema del resto (x − r) divide a P. Aplicando esto reiteradamente, un polinomio con todas sus raíces reales se escribe como su coeficiente principal por el producto de los factores (x − xᵢ).",
    simple: "Encontrás un número que hace P = 0, dividís por (x − ese número) y seguís con lo que queda. Al final escribís todo como producto.",
    nino: "Es como desarmar un mueble en piezas: cada raíz es una pieza que sacás. Cuando terminás, sabés de qué piezas estaba hecho y cómo volver a armarlo multiplicando.",
    ejemplo: "x² − 5x + 6 tiene raíces 2 y 3 ⇒ x² − 5x + 6 = (x − 2)(x − 3).",
    visual: { type: "plot", mode: "free", initial: "x^3-2x^2-5x+6" },
    visualText: "Los cortes con el eje x son las raíces: −2, 1 y 3.",
    fromZero: "Factorizar es escribir algo como multiplicación, como 12 = 2·2·3. Con polinomios, los «números primos» son los factores (x − r).",
    why: "Un producto es cero solo si algún factor es cero. Por eso, factorizado, P(x) = 0 se resuelve mirando cada factor.",
    origin: "Del teorema del resto: P(r) = 0 implica P(x) = (x − r)Q(x). Repitiendo con Q se llega a la factorización completa.",
    board: raicesBoard,
  },
};

export const algebraALessons: Lesson[] = [conjuntosLesson, valorAbsolutoLesson, complejosLesson, complejosPolarLesson, polinomiosDivisionLesson, polinomiosRaicesLesson];
