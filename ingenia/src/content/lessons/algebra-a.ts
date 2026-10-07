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

// ═════════════════════════ alg-1 · Vectores en ℝ² y ℝ³ (complemento) ═════════════════════════

const vectorialBoard: BoardStep[] = [
  { expr: "u = (2, −1, 1),  v = (1, 3, 0)", note: "Datos" },
  { expr: "x: (−1)·0 − 1·3 = −3", note: "Tapamos la columna de x: u₂v₃ − u₃v₂" },
  { expr: "y: −(2·0 − 1·1) = 1", note: "Columna de y, con el signo menos adelante" },
  { expr: "z: 2·3 − (−1)·1 = 7", note: "Columna de z: u₁v₂ − u₂v₁" },
  { expr: "u × v = (−3, 1, 7)", note: "Resultado" },
  { expr: "(u × v)·u = −6 − 1 + 7 = 0", note: "Verificación: es perpendicular a u (y también a v)" },
];

export const productoVectorialLesson: Lesson = {
  id: "l-alg-producto-vectorial",
  title: "Producto vectorial",
  subtitle: "Un vector perpendicular a otros dos",
  subjectId: S,
  topicIds: ["t-alg-producto-vectorial"],
  estimatedMinutes: 11,
  prerequisites: ["t-producto-escalar", "t-vec-operaciones"],
  cards: [
    intro("Producto vectorial", "Cómo calcular u × v en ℝ³, qué dirección tiene y cómo da el área de un paralelogramo o un triángulo.", "Es la herramienta para conseguir la normal de un plano, calcular áreas y, en Física, momentos y fuerzas magnéticas."),
    explain(
      "La regla de la mano derecha",
      "Apuntá los dedos de la mano derecha según $u$ y cerralos hacia $v$: el pulgar marca $u × v$. Es como un tornillo: girar de $u$ a $v$ lo hace avanzar en esa dirección.\n\n$u × v$ es **perpendicular** a $u$ y a $v$, y su longitud es el área del paralelogramo que forman.",
      { tag: "cotidiano" },
    ),
    quiz("Para pensar", {
      id: "q-alg-vectorial-orden",
      subjectId: S,
      topicId: "t-alg-producto-vectorial",
      prompt: "Si $u × v = (2, −1, 4)$, ¿cuánto vale $v × u$?",
      options: ["$(−2, 1, −4)$", "$(2, −1, 4)$", "$(4, −1, 2)$"],
      answer: 0,
      explanation: "El producto vectorial es anticonmutativo: v × u = −(u × v). Cambia el sentido (el tornillo gira al revés).",
      hints: ["Pensá en la regla de la mano derecha.", "Si girás de v a u, el pulgar apunta al otro lado.", "v × u = −(u × v)."],
      errors: { 1: ["vectores", "El producto vectorial no es conmutativo: invertir el orden cambia el sentido."], 2: ["vectores", "No se reordenan componentes: se cambia el signo de todas."] },
    }, true),
    explain(
      "La cuenta",
      "Para $u = (u_1, u_2, u_3)$ y $v = (v_1, v_2, v_3)$:\n\n$u × v = (u_2v_3 − u_3v_2, −(u_1v_3 − u_3v_1), u_1v_2 − u_2v_1)$\n\nEs el desarrollo de un determinante con $i, j, k$ en la primera fila. Además $|u × v| = |u||v| sen θ$. En el plano, la flecha de la suma muestra el paralelogramo cuya área mide $|u × v|$.",
      { tag: "matematico", widget: { type: "vector", x: 3, y: 1, showSum: true } },
    ),
    board("Calcular u × v", vectorialBoard),
    example("Ejemplo resuelto", "Área del paralelogramo de lados $u = (2, 0, 0)$ y $v = (1, 3, 0)$.", ["$u × v = (0·0 − 0·3, −(2·0 − 0·1), 2·3 − 0·1) = (0, 0, 6)$", "$|u × v| = 6$", "Tiene sentido: base 2 y altura 3."], "6"),
    practice("Ejercicio guiado", "alg-producto-vectorial", 1, 3, true),
    explain(
      "Errores típicos",
      "1. **El signo de la j**: la componente del medio lleva un menos adelante.\n2. **El orden**: $u × v = −(v × u)$.\n3. **Triángulo vs. paralelogramo**: el triángulo de lados $u$ y $v$ tiene la mitad del área: $|u × v|/2$.\n\nVerificá siempre que el resultado tenga producto escalar 0 con $u$ y con $v$.",
      { tag: "intuitivo" },
    ),
    practice("Tu turno", "alg-producto-vectorial", 3, 6),
    practice("Tu turno", "alg-producto-vectorial", 4, 8),
    practice("Desafío", "alg-producto-vectorial", 6, 12),
    summary(["u × v es perpendicular a u y a v (regla de la mano derecha).", "u × v = (u₂v₃ − u₃v₂, −(u₁v₃ − u₃v₁), u₁v₂ − u₂v₁).", "v × u = −(u × v).", "|u × v| = área del paralelogramo; la mitad es el triángulo.", "u × v = 0 ⇔ u y v son paralelos."]),
  ],
  tutor: {
    normal: "El producto vectorial de u, v ∈ ℝ³ es el vector u × v, ortogonal a ambos, con sentido dado por la regla de la mano derecha y módulo |u||v| sen θ, igual al área del paralelogramo que determinan.",
    simple: "Le das dos vectores y te devuelve un tercero que es perpendicular a los dos. Su largo es el área del paralelogramo que forman.",
    nino: "Al abrir una puerta empujás con la mano y la puerta gira alrededor de las bisagras. El eje de giro (vertical) es perpendicular a tu empujón y a la puerta: eso es lo que calcula el producto vectorial.",
    ejemplo: "(1, 0, 0) × (0, 1, 0) = (0, 0, 1): el eje x «cruz» el eje y da el eje z.",
    visual: { type: "vector", x: 3, y: 1, showSum: true },
    visualText: "Las dos flechas y su suma arman un paralelogramo; |u × v| es su área.",
    fromZero: "En ℝ³ un vector tiene tres componentes. Con dos vectores que no son paralelos podés armar un paralelogramo; el producto vectorial te da una flecha «parada» sobre él, con largo igual a su área.",
    why: "Porque muchas veces necesitás una dirección perpendicular a otras dos: la normal de un plano que pasa por tres puntos, el eje de una rotación o la dirección de un momento.",
    origin: "Se pide un vector w con w·u = 0 y w·v = 0. Resolviendo ese sistema se obtienen las fórmulas de los cofactores; luego se verifica que |w|² = |u|²|v|² − (u·v)² = |u|²|v|² sen²θ.",
    board: vectorialBoard,
  },
};

const proyBoard: BoardStep[] = [
  { expr: "v = (3, 1, 2),  u = (1, 2, 2)", note: "Proyectamos v sobre u" },
  { expr: "v·u = 3 + 2 + 4 = 9", note: "Producto escalar" },
  { expr: "|u|^2 = 1 + 4 + 4 = 9", note: "Norma al cuadrado de u" },
  { expr: "p = (9/9)·(1, 2, 2) = (1, 2, 2)", note: "p = (v·u / |u|²)·u" },
  { expr: "w = v − p = (2, −1, 0)", note: "La parte perpendicular" },
  { expr: "w·u = 2 − 2 + 0 = 0", note: "Comprobación: w es perpendicular a u" },
];

export const anguloProyeccionLesson: Lesson = {
  id: "l-alg-angulo-proyeccion",
  title: "Norma, ángulo y proyección",
  subtitle: "Medir y descomponer vectores con el producto escalar",
  subjectId: S,
  topicIds: ["t-alg-angulo-proyeccion"],
  estimatedMinutes: 11,
  prerequisites: ["t-producto-escalar"],
  cards: [
    intro("Ángulo y proyección", "Cómo calcular la norma de un vector en ℝ³, el ángulo entre dos vectores y la proyección ortogonal de uno sobre otro.", "La proyección es la base de las distancias a rectas y planos, y en Física de descomponer una fuerza en una dirección."),
    explain(
      "La sombra de un vector",
      "Si el sol cae perpendicular sobre una vara inclinada, su **sombra** en el piso es la proyección de la vara sobre el piso.\n\nCon vectores: la proyección de $v$ sobre $u$ es la parte de $v$ que va en la dirección de $u$. Lo que sobra es perpendicular a $u$.",
      { tag: "cotidiano", widget: { type: "vector-components", mag: 5, angle: 35 } },
    ),
    quiz("Para pensar", {
      id: "q-alg-angulo-signo",
      subjectId: S,
      topicId: "t-alg-angulo-proyeccion",
      prompt: "Si $u·v = −4$, ¿cómo es el ángulo entre u y v?",
      options: ["Obtuso (entre 90° y 180°)", "Agudo (menor que 90°)", "Recto"],
      answer: 0,
      explanation: "u·v = |u||v| cos θ y las normas son positivas: el signo de u·v es el de cos θ. Negativo ⇒ θ > 90°.",
      hints: ["u·v = |u||v| cos θ.", "Las normas son positivas.", "¿Cuándo es negativo el coseno?"],
      errors: { 1: ["trigonometria", "Si u·v < 0 entonces cos θ < 0, y eso pasa con ángulos obtusos."], 2: ["vectores", "Recto sería u·v = 0."] },
    }, true),
    explain(
      "Las fórmulas",
      "• Norma: $|v| = √(v_1^2 + v_2^2 + v_3^2)$\n• Ángulo: $cos θ = \\frac{u·v}{|u|·|v|}$, con $0° ≤ θ ≤ 180°$\n• Proyección de $v$ sobre $u$: $p = \\frac{v·u}{|u|^2}·u$\n\nY $w = v − p$ es perpendicular a $u$: así $v = p + w$.",
      { tag: "matematico" },
    ),
    board("Proyectar y descomponer", proyBoard),
    example("Ejemplo resuelto", "Ángulo entre $u = (1, 0, 1)$ y $v = (0, 1, 1)$.", ["$u·v = 0 + 0 + 1 = 1$", "$|u| = √2$, $|v| = √2$", "$cos θ = 1/2$", "$θ = 60°$"], "60°"),
    practice("Ejercicio guiado", "alg-angulo-vectores", 1, 4, true),
    explain(
      "Errores típicos",
      "1. Dividir por $|u|$ en lugar de $|u|^2$ en la proyección (o hacerlo y olvidar el versor).\n2. Confundir proyectar $v$ sobre $u$ con proyectar $u$ sobre $v$: el resultado va en la dirección del vector sobre el que proyectás.\n3. Calculadora en radianes al usar $arccos$.",
      { tag: "intuitivo" },
    ),
    practice("Tu turno", "alg-proyeccion", 2, 5),
    practice("Tu turno", "alg-angulo-vectores", 3, 7),
    practice("Desafío", "alg-proyeccion", 5, 10),
    summary(["|v| = √(v₁² + v₂² + v₃²).", "cos θ = u·v / (|u||v|), θ ∈ [0°, 180°].", "proy_u(v) = (v·u / |u|²)·u.", "v − proy_u(v) es perpendicular a u.", "u·v < 0 ⇒ obtuso; = 0 ⇒ recto; > 0 ⇒ agudo."]),
  ],
  tutor: {
    normal: "De u·v = |u||v| cos θ se obtiene el ángulo entre vectores. La proyección ortogonal de v sobre u es el único múltiplo de u tal que v − p es ortogonal a u, y vale (v·u/|u|²)u.",
    simple: "El producto escalar te dice cuánto apuntan para el mismo lado. Dividiendo por los largos sacás el coseno del ángulo. La proyección es la «sombra» de v sobre la dirección de u.",
    nino: "Si arrastrás una valija tirando de la manija inclinada, solo una parte de tu fuerza la mueve hacia adelante: esa parte es la proyección de tu fuerza sobre el piso.",
    ejemplo: "v = (2, 3), u = (1, 0): proyección = (2, 0); lo que sobra, (0, 3), es perpendicular a u.",
    visual: { type: "vector-components", mag: 5, angle: 35 },
    visualText: "La componente horizontal es la proyección del vector sobre el eje x.",
    fromZero: "Un vector tiene largo (norma) y dirección. Para comparar dos direcciones se usa el ángulo entre ellas, y el producto escalar es la forma de calcularlo sin dibujar.",
    why: "Porque descomponer un vector en «lo que va en una dirección» y «lo perpendicular» simplifica muchísimos problemas: distancias, fuerzas, mínimos cuadrados.",
    origin: "Se busca p = λu con (v − λu)·u = 0. Despejando: v·u − λ|u|² = 0 ⇒ λ = v·u/|u|². La fórmula del ángulo sale del teorema del coseno aplicado al triángulo de lados u, v y u − v.",
    board: proyBoard,
  },
};

// ═════════════════════════ alg-2 · Rectas y planos ═════════════════════════

const rectaBoard: BoardStep[] = [
  { expr: "P = (1, −2, 3),  Q = (4, 0, 2)", note: "Dos puntos de la recta" },
  { expr: "d = Q − P = (3, 2, −1)", note: "Vector director" },
  { expr: "X = (1, −2, 3) + t·(3, 2, −1)", note: "Ecuación vectorial" },
  { expr: "x = 1 + 3t,  y = −2 + 2t,  z = 3 − t", note: "Paramétricas: una ecuación por coordenada" },
  { expr: "t = 2  ⇒  (7, 2, 1)", note: "Cada valor de t da un punto de la recta" },
];

export const rectasLesson: Lesson = {
  id: "l-alg-rectas",
  title: "Rectas en ℝ³",
  subtitle: "Ecuación vectorial y paramétrica",
  subjectId: S,
  topicIds: ["t-alg-rectas"],
  estimatedMinutes: 10,
  prerequisites: ["t-vectores"],
  cards: [
    intro("Rectas en el espacio", "Cómo escribir una recta con un punto y un vector director, y cómo saber si un punto está en ella.", "En ℝ³ una recta no tiene «pendiente»: se describe con un punto y una dirección. Es la base de toda la geometría de la unidad."),
    explain(
      "Punto de partida y dirección",
      "Un dron sale del punto $P$ y vuela siempre en la dirección $d$. Después de $t$ segundos está en $P + t·d$.\n\nTodos los lugares por donde pasa (con $t$ positivo, negativo o cero) forman una **recta**. $P$ es un punto de paso y $d$ el **vector director**.",
      { tag: "cotidiano", widget: { type: "vector", x: 2, y: 1, showSum: true } },
    ),
    quiz("Para pensar", {
      id: "q-alg-director",
      subjectId: S,
      topicId: "t-alg-rectas",
      prompt: "¿Qué vector director tiene la recta que pasa por $A = (1, 1, 0)$ y $B = (3, 0, 2)$?",
      options: ["$(2, −1, 2)$", "$(4, 1, 2)$", "$(1, 1, 0)$"],
      answer: 0,
      explanation: "El director es B − A = (3 − 1, 0 − 1, 2 − 0) = (2, −1, 2) (o cualquier múltiplo no nulo).",
      hints: ["La dirección va de un punto al otro.", "Restá coordenada a coordenada.", "B − A."],
      errors: { 1: ["vectores", "Sumaste los puntos. La dirección de A a B es B − A."], 2: ["vectores", "Ese es el punto A, no una dirección."] },
    }, true),
    explain(
      "Ecuaciones de la recta",
      "**Vectorial**: $X = P + t·d$, con $t ∈ ℝ$.\n\n**Paramétricas**: $x = p_1 + t d_1$, $y = p_2 + t d_2$, $z = p_3 + t d_3$.\n\n**Simétrica** (si $d_i ≠ 0$): $\\frac{x − p_1}{d_1} = \\frac{y − p_2}{d_2} = \\frac{z − p_3}{d_3}$.\n\nUn punto está en la recta si existe **un mismo** $t$ que da sus tres coordenadas.",
      { tag: "matematico" },
    ),
    board("Recta por dos puntos", rectaBoard),
    example("Ejemplo resuelto", "¿El punto $(4, 1, 2)$ está en $X = (1, −2, 3) + t·(3, 2, −1)$?", ["x: $1 + 3t = 4 ⇒ t = 1$", "y: $−2 + 2·1 = 0 ≠ 1$", "No hay un mismo t para todas las coordenadas."], "No pertenece"),
    practice("Ejercicio guiado", "alg-recta-pertenencia", 1, 2, true),
    explain(
      "Error típico: un t distinto por coordenada",
      "Para que un punto esté en la recta, el valor de $t$ tiene que ser **el mismo** en las tres ecuaciones. Si de $x$ sale $t = 1$ y de $y$ sale $t = 2$, el punto no está.\n\nOtro error: confundir el punto de paso con el director. El director es una **diferencia** de puntos.",
      { tag: "intuitivo" },
    ),
    practice("Tu turno", "alg-recta-pertenencia", 3, 5),
    practice("Tu turno", "alg-recta-pertenencia", 4, 8),
    practice("Desafío", "alg-recta-pertenencia", 6, 11),
    summary(["Recta = punto de paso P + dirección d.", "Vectorial: X = P + t·d.", "Paramétricas: una ecuación por coordenada.", "Director por dos puntos: d = Q − P.", "Pertenencia: el mismo t para las tres coordenadas."]),
  ],
  tutor: {
    normal: "Una recta en ℝ³ es el conjunto {P + t·d : t ∈ ℝ}, con P un punto y d ≠ 0 un vector director. Las ecuaciones paramétricas se obtienen igualando coordenada a coordenada.",
    simple: "Elegís un punto donde empieza y una flecha que marca hacia dónde va. Moviendo t te desplazás por la recta.",
    nino: "Un tren que sale de la estación P y avanza siempre por la misma vía: con t indicás cuántos «tramos» avanzó (o retrocedió, si t es negativo).",
    ejemplo: "X = (0, 0, 0) + t·(1, 1, 1): para t = 2 da (2, 2, 2).",
    visual: { type: "vector", x: 2, y: 1, showSum: true },
    visualText: "Pensalo en el plano: sumarle al punto de partida varias veces el director te mueve por la recta.",
    fromZero: "Un punto en el espacio tiene tres coordenadas. Una dirección también se describe con tres números (un vector). Sumándole al punto múltiplos de esa dirección se recorre la recta.",
    why: "En el espacio una sola ecuación como y = mx + b no alcanza para describir una recta; con un punto y una dirección se describe cualquier recta, en cualquier dimensión.",
    origin: "Un punto X está en la recta si X − P es paralelo a d, es decir, X − P = t·d para algún t. Despejando X queda la ecuación vectorial.",
    board: rectaBoard,
  },
};

const planoBoard: BoardStep[] = [
  { expr: "P = (1, 2, −1),  n = (2, −1, 3)", note: "Punto del plano y vector normal" },
  { expr: "n·(X − P) = 0", note: "X − P está en el plano, entonces es perpendicular a n" },
  { expr: "2x − y + 3z = d", note: "Los coeficientes son la normal" },
  { expr: "d = 2·1 − 2 + 3·(−1) = −3", note: "Reemplazamos el punto P" },
  { expr: "π: 2x − y + 3z = −3", note: "Ecuación del plano" },
];

export const planosLesson: Lesson = {
  id: "l-alg-planos",
  title: "Planos en ℝ³",
  subtitle: "La normal manda",
  subjectId: S,
  topicIds: ["t-alg-planos"],
  estimatedMinutes: 11,
  prerequisites: ["t-alg-rectas", "t-producto-escalar"],
  cards: [
    intro("Planos", "Cómo escribir la ecuación de un plano a partir de un punto y su vector normal, y cómo intersecar un plano con una recta.", "La ecuación ax + by + cz = d es el plano en ℝ³; vas a usarla en sistemas lineales, distancias y transformaciones."),
    explain(
      "Una mesa y su pata",
      "Una mesa es un plano y una pata bien derecha es perpendicular a ella. Esa dirección perpendicular es el **vector normal** $n$.\n\nUn plano queda determinado por un punto $P$ y su normal: son todos los puntos $X$ tales que la flecha de $P$ a $X$ es perpendicular a $n$.",
      { tag: "cotidiano" },
    ),
    quiz("Para pensar", {
      id: "q-alg-normal",
      subjectId: S,
      topicId: "t-alg-planos",
      prompt: "¿Cuál es un vector normal del plano $3x − y + 5z = 2$?",
      options: ["$(3, −1, 5)$", "$(3, −1, 5, 2)$", "$(2, 0, 0)$"],
      answer: 0,
      explanation: "En ax + by + cz = d, la normal es (a, b, c): los coeficientes de x, y, z.",
      hints: ["La normal está escondida en la ecuación.", "Mirá los coeficientes de x, y, z.", "El término independiente no forma parte de la normal."],
      errors: { 1: ["vectores", "La normal tiene 3 componentes (estamos en ℝ³): el término independiente no va."], 2: ["vectores", "El 2 es el término independiente; la normal son los coeficientes."] },
    }, true),
    explain(
      "Ecuación del plano",
      "$n·(X − P) = 0$ ⇔ $ax + by + cz = d$, con $(a, b, c) = n$ y $d = n·P$.\n\n• Si pasa por tres puntos $A, B, C$: $n = AB × AC$.\n• Para cortar con la recta $X = P_0 + t·v$: reemplazá $x, y, z$ en función de $t$ y despejá $t$.",
      { tag: "matematico", widget: { type: "vector", x: 0, y: 3 } },
    ),
    board("Plano por un punto con normal dada", planoBoard),
    example("Ejemplo resuelto: recta y plano", "Intersección de $L: X = (1, 0, 2) + t·(1, 1, −1)$ con $π: x + 2y + z = 9$.", ["Punto genérico: $(1 + t, t, 2 − t)$", "$(1 + t) + 2t + (2 − t) = 9$", "$3 + 2t = 9 ⇒ t = 3$", "$Q = (4, 3, −1)$"], "(4, 3, −1)"),
    practice("Ejercicio guiado", "alg-plano-ecuacion", 1, 3, true),
    explain(
      "Errores típicos",
      "1. Usar el término independiente como parte de la normal.\n2. En planos paralelos, copiar también el $d$: la normal es la misma pero el $d$ se recalcula con el punto.\n3. En la intersección, contestar el valor de $t$ en lugar del punto: hay que reemplazarlo en la recta.",
      { tag: "intuitivo" },
    ),
    practice("Tu turno", "alg-recta-plano-interseccion", 2, 5),
    practice("Tu turno", "alg-plano-ecuacion", 3, 7),
    practice("Desafío", "alg-plano-ecuacion", 6, 10),
    summary(["Plano: punto P + normal n.", "π: ax + by + cz = d, con (a, b, c) = n y d = n·P.", "Por tres puntos: n = AB × AC.", "Paralelos: misma normal.", "Recta ∩ plano: reemplazar la paramétrica y despejar t."]),
  ],
  tutor: {
    normal: "El plano que pasa por P con normal n ≠ 0 es {X ∈ ℝ³ : n·(X − P) = 0}. Desarrollando el producto escalar se obtiene la ecuación implícita ax + by + cz = d.",
    simple: "La ecuación del plano tiene adelante de x, y, z las componentes de la normal. El número d se encuentra reemplazando un punto del plano.",
    nino: "Una pared y un clavo clavado derecho: el clavo marca la dirección normal. Cualquier punto de la pared, unido con el agujero del clavo, forma ángulo recto con el clavo.",
    ejemplo: "Normal (1, 1, 1) y punto (1, 2, 3): x + y + z = 6.",
    visual: { type: "vector", x: 0, y: 3 },
    visualText: "En el plano xy, la flecha vertical sería normal a la «recta» horizontal; en ℝ³ pasa lo mismo con planos.",
    fromZero: "Un plano es una superficie chata infinita, como un piso. Para describirla alcanza con un punto del piso y la dirección perpendicular a él.",
    why: "Porque una sola ecuación lineal en x, y, z describe un plano completo; por eso los sistemas de tres ecuaciones con tres incógnitas son intersecciones de planos.",
    origin: "X está en el plano si X − P es perpendicular a n, es decir, si n·(X − P) = 0. Distribuyendo: n·X = n·P, que escrito en coordenadas es ax + by + cz = d.",
    board: planoBoard,
  },
};

const distBoard: BoardStep[] = [
  { expr: "P = (2, 1, −1),  π: 2x − y + 2z = 6", note: "Punto y plano" },
  { expr: "n·P − d = 4 − 1 − 2 − 6 = −5", note: "Reemplazamos P en ax + by + cz − d" },
  { expr: "|n| = √(4 + 1 + 4) = 3", note: "Norma de la normal" },
  { expr: "d(P, π) = |−5| / 3 = 5/3", note: "Valor absoluto y dividimos" },
  { expr: "d(P, π) ≈ 1,67", note: "Resultado" },
];

export const posicionesDistanciasLesson: Lesson = {
  id: "l-alg-posiciones-distancias",
  title: "Posiciones relativas y distancias",
  subtitle: "Paralelos, perpendiculares y qué tan lejos",
  subjectId: S,
  topicIds: ["t-alg-posiciones-distancias"],
  estimatedMinutes: 12,
  prerequisites: ["t-alg-planos"],
  cards: [
    intro("Posiciones y distancias", "Cómo decidir si dos planos (o una recta y un plano) son paralelos, perpendiculares o se cortan, y cómo medir la distancia de un punto a un plano.", "Todo se decide comparando vectores normales y directores con el producto escalar y el paralelismo: no hace falta dibujar en 3D."),
    explain(
      "Mirá las flechas, no los planos",
      "Dos planos son paralelos si sus normales apuntan igual (son múltiplos). Son perpendiculares si sus normales lo son ($n_1·n_2 = 0$).\n\nPara una recta y un plano: si el director $d$ es perpendicular a la normal ($d·n = 0$), la recta «corre» a lo largo del plano: o está adentro o es paralela.",
      { tag: "intuitivo" },
    ),
    quiz("Para pensar", {
      id: "q-alg-planos-paralelos",
      subjectId: S,
      topicId: "t-alg-posiciones-distancias",
      prompt: "¿Cómo son $π_1: x + 2y − z = 3$ y $π_2: 2x + 4y − 2z = 5$?",
      options: ["Paralelos, no coincidentes", "Coincidentes", "Perpendiculares"],
      answer: 0,
      explanation: "n₂ = 2·n₁: normales paralelas. Pero 5 ≠ 2·3 = 6, así que no es la misma ecuación: son paralelos distintos.",
      hints: ["Compará las normales.", "(2, 4, −2) = 2·(1, 2, −1).", "¿También el término independiente es el doble?"],
      errors: { 1: ["vectores", "Para ser coincidentes, toda la ecuación tiene que ser proporcional: 5 debería ser 6."], 2: ["vectores", "n₁·n₂ = 2 + 8 + 2 = 12 ≠ 0: no son perpendiculares."] },
    }, true),
    explain(
      "Distancia punto–plano",
      "La distancia más corta de $P = (x_0, y_0, z_0)$ al plano $ax + by + cz = d$ se mide sobre la normal:\n\n$d(P, π) = \\frac{|a x_0 + b y_0 + c z_0 − d|}{√(a^2 + b^2 + c^2)}$\n\nEntre dos planos paralelos $n·X = d_1$ y $n·X = d_2$: $\\frac{|d_1 − d_2|}{|n|}$.",
      { tag: "matematico", widget: { type: "vector-components", mag: 4, angle: 50 } },
    ),
    board("Distancia de un punto a un plano", distBoard),
    example("Ejemplo resuelto", "Posición de $L: X = (1, 0, 0) + t·(1, 1, 0)$ y $π: x − y + 2z = 1$.", ["$d·n = 1 − 1 + 0 = 0$: paralela o contenida.", "¿$(1, 0, 0)$ cumple la ecuación? $1 − 0 + 0 = 1$ ✓", "La recta está contenida en el plano."], "Contenida"),
    practice("Ejercicio guiado", "alg-distancia-punto-plano", 1, 2, true),
    explain(
      "Errores típicos",
      "1. Olvidar dividir por $|n|$ (o dividir por $|n|^2$).\n2. Olvidar el valor absoluto: una distancia nunca es negativa.\n3. Declarar «coincidentes» solo porque las normales son proporcionales: falta comparar el término independiente.\n4. Recta perpendicular al plano: $d$ paralelo a $n$, no $d·n = 0$.",
      { tag: "intuitivo" },
    ),
    practice("Tu turno", "alg-posicion-relativa", 2, 4),
    practice("Tu turno", "alg-posicion-relativa", 4, 7),
    practice("Desafío", "alg-distancia-punto-plano", 6, 9),
    summary(["Planos: normales proporcionales ⇒ paralelos o coincidentes.", "n₁·n₂ = 0 ⇒ planos perpendiculares.", "Recta–plano: d·n = 0 ⇒ paralela o contenida; d ∥ n ⇒ perpendicular.", "d(P, π) = |ax₀ + by₀ + cz₀ − d| / |n|.", "Planos paralelos: |d₁ − d₂| / |n|."]),
  ],
  tutor: {
    normal: "Las posiciones relativas se deciden con los vectores asociados: normales para planos, directores para rectas. La distancia de P a π es la longitud de la proyección de P − P₀ sobre n, con P₀ ∈ π, lo que da |n·P − d|/|n|.",
    simple: "Para saber cómo están dos planos, mirás sus normales: si son múltiplos, son paralelos; si su producto escalar da 0, son perpendiculares. Para la distancia, reemplazás el punto en la ecuación y dividís por el largo de la normal.",
    nino: "La distancia de una lámpara al techo se mide con una cinta bien vertical, no inclinada: esa dirección vertical es la normal del techo.",
    ejemplo: "P = (0, 0, 5) y π: z = 0: |5 − 0| / 1 = 5.",
    visual: { type: "vector-components", mag: 4, angle: 50 },
    visualText: "La distancia es solo la componente en la dirección perpendicular.",
    fromZero: "Dos planos en el espacio pueden ser el mismo, no tocarse nunca (paralelos) o cortarse a lo largo de una recta. Las normales te dicen cuál de las tres cosas pasa.",
    why: "Porque comparar vectores es una cuenta, y dibujar en 3D es difícil y engañoso. La distancia sobre la normal es la mínima, como la perpendicular en el plano.",
    origin: "Tomando P₀ en el plano, la distancia es |proy_n(P − P₀)| = |n·(P − P₀)|/|n| = |n·P − n·P₀|/|n| = |n·P − d|/|n|.",
    board: distBoard,
  },
};

// ═════════════════════════ alg-3 · Matrices y sistemas lineales ═════════════════════════

const matricesBoard: BoardStep[] = [
  { expr: "A = [1  2 ; 3  4],  B = [0  1 ; 2  −1]", note: "Filas separadas por «;»", figure: { kind: "matrix", label: "A·B", rows: [["?", "?"], ["?", "?"]] } },
  { expr: "c₁₁ = 1·0 + 2·2 = 4", note: "Fila 1 de A por columna 1 de B", figure: { kind: "matrix", label: "A·B", rows: [[4, "?"], ["?", "?"]], mark: [[0, 0]] } },
  { expr: "c₁₂ = 1·1 + 2·(−1) = −1", note: "Fila 1 por columna 2", figure: { kind: "matrix", label: "A·B", rows: [[4, -1], ["?", "?"]], mark: [[0, 1]] } },
  { expr: "c₂₁ = 3·0 + 4·2 = 8", note: "Fila 2 por columna 1", figure: { kind: "matrix", label: "A·B", rows: [[4, -1], [8, "?"]], mark: [[1, 0]] } },
  { expr: "c₂₂ = 3·1 + 4·(−1) = −1", note: "Fila 2 por columna 2", figure: { kind: "matrix", label: "A·B", rows: [[4, -1], [8, -1]], mark: [[1, 1]] } },
  { expr: "A·B = [4  −1 ; 8  −1]", note: "Resultado (y B·A = [3 4 ; −1 0]: ¡distinto!)" },
];

export const matricesLesson: Lesson = {
  id: "l-alg-matrices",
  title: "Matrices y operaciones",
  subtitle: "Suma, producto por escalar y producto de matrices",
  subjectId: S,
  topicIds: ["t-alg-matrices"],
  estimatedMinutes: 10,
  prerequisites: ["t-producto-escalar"],
  cards: [
    intro("Matrices", "Qué es una matriz, cómo se suman y cómo se multiplican (fila por columna).", "Las matrices ordenan los coeficientes de un sistema lineal y representan transformaciones: son el objeto central de la segunda mitad de la materia."),
    explain(
      "Una tabla de números",
      "Una **matriz** $m×n$ es una tabla con $m$ filas y $n$ columnas. $a_{ij}$ es el elemento de la fila $i$ y la columna $j$.\n\nComo una planilla de notas: cada fila es un estudiante, cada columna un parcial. En el texto escribimos las filas separadas por «;»: $[1  2 ; 3  4]$.",
      { tag: "cotidiano" },
    ),
    quiz("Para pensar", {
      id: "q-alg-dimension-producto",
      subjectId: S,
      topicId: "t-alg-matrices",
      prompt: "Si A es 2×3 y B es 3×4, ¿qué tamaño tiene A·B?",
      options: ["2×4", "3×3", "No se puede multiplicar"],
      answer: 0,
      explanation: "Se puede porque las columnas de A (3) coinciden con las filas de B (3). El resultado tiene las filas de A y las columnas de B: 2×4.",
      hints: ["Para multiplicar, columnas de A = filas de B.", "(2×3)·(3×4): los «del medio» coinciden.", "Quedan los de afuera."],
      errors: { 1: ["conceptual", "Los números que coinciden (3 y 3) «se cancelan»; quedan los de afuera: 2×4."], 2: ["conceptual", "Sí se puede: columnas de A (3) = filas de B (3)."] },
    }, true),
    explain(
      "Operaciones",
      "• **Suma**: elemento a elemento (mismo tamaño).\n• **Escalar**: $k·A$ multiplica cada elemento.\n• **Producto**: $c_{ij}$ = fila $i$ de $A$ · columna $j$ de $B$ (como un producto escalar).\n\nEl producto **no es conmutativo**: en general $A·B ≠ B·A$. Probá cambiar los números de la matriz y mirá cómo transforma la grilla.",
      { tag: "matematico", widget: { type: "matrix", a: 1, b: 2, c: 3, d: 4 } },
    ),
    board("Multiplicar dos matrices 2×2", matricesBoard),
    example("Ejemplo resuelto", "Calculá $2A − B$ con $A = [1  0 ; −1  3]$ y $B = [2  2 ; 0  1]$.", ["$2A = [2  0 ; −2  6]$", "$2A − B = [2 − 2   0 − 2 ; −2 − 0   6 − 1]$", "$= [0  −2 ; −2  5]$"], "[0 −2 ; −2 5]"),
    practice("Ejercicio guiado", "alg-matriz-producto", 1, 3, true),
    explain(
      "Errores típicos",
      "1. Multiplicar elemento a elemento: así **no** se multiplican matrices.\n2. Hacer fila por fila: es fila de la primera por **columna** de la segunda.\n3. Dar vuelta el orden: $A·B$ y $B·A$ suelen ser distintos (y a veces uno ni existe).",
      { tag: "intuitivo" },
    ),
    practice("Tu turno", "alg-matriz-producto", 3, 5),
    practice("Tu turno", "alg-matriz-producto", 4, 8),
    practice("Desafío", "alg-matriz-producto", 6, 11),
    summary(["A es m×n: m filas, n columnas; a_ij en fila i, columna j.", "Suma y escalar: elemento a elemento.", "A·B existe si columnas de A = filas de B; el resultado es (filas de A)×(columnas de B).", "c_ij = fila i de A · columna j de B.", "A·B ≠ B·A en general."]),
  ],
  tutor: {
    normal: "El producto de A (m×n) por B (n×p) es la matriz C (m×p) con c_ij = Σ a_ik b_kj. Corresponde a componer las transformaciones lineales asociadas, por eso no es conmutativo.",
    simple: "Para cada casillero del resultado, tomás una fila de la primera y una columna de la segunda, multiplicás uno a uno y sumás.",
    nino: "En un kiosco, una matriz dice cuántas unidades de cada producto vendiste por día y otra el precio de cada producto. Fila por columna te da cuánto facturaste cada día.",
    ejemplo: "[1 2] · [3 ; 4] = 1·3 + 2·4 = 11.",
    visual: { type: "matrix", a: 1, b: 2, c: 3, d: 4 },
    visualText: "Cada matriz 2×2 deforma la grilla del plano; multiplicar matrices es aplicar una deformación después de otra.",
    fromZero: "Una matriz es solo una tabla de números ordenada en filas y columnas. Las operaciones son reglas para combinar tablas.",
    why: "El producto «fila por columna» es exactamente lo que hace falta para escribir un sistema de ecuaciones como A·X = B y para encadenar transformaciones.",
    origin: "Si y = A·x y x = B·t, reemplazando y agrupando los coeficientes de t se obtiene y = (A·B)·t con c_ij = Σ a_ik b_kj: así se definió el producto.",
    board: matricesBoard,
  },
};

const gaussBoard: BoardStep[] = [
  { expr: "x + y + z = 6 ; 2x + 3y + z = 11 ; x − y + 2z = 5", note: "Sistema original" },
  { expr: "F₂ − 2F₁:  y − z = −1", note: "Eliminamos x de la segunda" },
  { expr: "F₃ − F₁:  −2y + z = −1", note: "Eliminamos x de la tercera" },
  { expr: "F₃ + 2F₂:  −z = −3", note: "Eliminamos y de la tercera" },
  { expr: "z = 3,  y = −1 + 3 = 2", note: "Sustitución hacia atrás" },
  { expr: "x = 6 − 2 − 3 = 1", note: "Solución (1, 2, 3)" },
];

export const gaussLesson: Lesson = {
  id: "l-alg-gauss",
  title: "Sistemas lineales: método de Gauss",
  subtitle: "Escalonar y despejar de abajo hacia arriba",
  subjectId: S,
  topicIds: ["t-alg-gauss"],
  estimatedMinutes: 12,
  prerequisites: ["t-ecuaciones", "t-alg-matrices"],
  cards: [
    intro("Método de Gauss", "Cómo resolver un sistema lineal con operaciones entre filas hasta dejarlo escalonado.", "Es el método que funciona siempre, con cualquier cantidad de ecuaciones e incógnitas; lo vas a usar para núcleos, inversas y mucho más."),
    explain(
      "Eliminar una incógnita por vez",
      "Si sabés que 2 cafés y 1 medialuna cuestan 7, y 1 café y 1 medialuna cuestan 4, restando las dos cuentas ves que 1 café cuesta 3. Eso es Gauss: **combinar ecuaciones para eliminar incógnitas**.\n\nSe trabaja con la matriz ampliada $(A | B)$: los coeficientes y, separados por una barra, los términos independientes.",
      { tag: "cotidiano" },
    ),
    quiz("Para pensar", {
      id: "q-alg-op-elemental",
      subjectId: S,
      topicId: "t-alg-gauss",
      prompt: "¿Cuál de estas operaciones **no** está permitida en Gauss?",
      options: ["Multiplicar una fila por 0", "Restarle a una fila el doble de otra", "Intercambiar dos filas"],
      answer: 0,
      explanation: "Multiplicar por 0 borra una ecuación y cambia las soluciones. Se permite multiplicar por un número distinto de 0, sumar a una fila un múltiplo de otra e intercambiar filas.",
      hints: ["Las operaciones válidas no cambian las soluciones.", "¿Qué pasa con la información de una ecuación multiplicada por 0?", "Queda 0 = 0."],
      errors: { 1: ["conceptual", "Sumar a una fila un múltiplo de otra es LA operación de Gauss."], 2: ["conceptual", "Intercambiar filas está permitido: el sistema es el mismo."] },
    }, true),
    explain(
      "Escalonar",
      "Con la fila 1 eliminás la $x$ de las demás ($F_i → F_i − k·F_1$). Con la fila 2, la $y$ de las de abajo. Queda un sistema **escalonado** (triangular):\n\n$a x + b y + c z = d$\n$  e y + f z = g$\n$    h z = i$\n\nY se despeja de abajo hacia arriba.",
      { tag: "matematico" },
    ),
    board("Gauss en un sistema 3×3", gaussBoard),
    example("Ejemplo resuelto", "Resolvé $2x + y = 7$, $x − y = 2$.", ["Intercambiamos filas: $x − y = 2$ ; $2x + y = 7$", "$F_2 − 2F_1$: $3y = 3$ ⇒ $y = 1$", "$x = 2 + 1 = 3$"], "x = 3, y = 1"),
    practice("Ejercicio guiado", "alg-gauss", 1, 2, true),
    explain(
      "Errores típicos",
      "1. Operar solo los coeficientes y olvidar el término independiente: la operación se aplica a **toda** la fila.\n2. Errores de signo al restar un múltiplo negativo.\n3. No verificar: reemplazá la solución en las ecuaciones **originales**.",
      { tag: "intuitivo" },
    ),
    practice("Tu turno", "alg-gauss", 2, 6),
    practice("Tu turno", "alg-gauss", 3, 9),
    practice("Desafío", "alg-gauss", 5, 12),
    summary(["Matriz ampliada (A | B).", "Operaciones: F_i → F_i − k·F_j, multiplicar por k ≠ 0, intercambiar filas.", "Objetivo: forma escalonada (triangular).", "Sustitución hacia atrás: de la última ecuación a la primera.", "Verificá en el sistema original."]),
  ],
  tutor: {
    normal: "Las operaciones elementales de fila producen sistemas equivalentes. El método de Gauss las usa para llevar la matriz ampliada a forma escalonada, desde la cual el sistema se resuelve por sustitución regresiva.",
    simple: "Usás una ecuación para «limpiar» una incógnita de las otras, hasta que la última ecuación tiene una sola incógnita. Despejás y vas subiendo.",
    nino: "Es como una balanza doble: si a dos balanzas equilibradas les sacás lo mismo de cada lado, siguen equilibradas, y cada vez quedan menos cosas desconocidas.",
    ejemplo: "x + y = 5, x − y = 1: restando, 2y = 4 ⇒ y = 2, x = 3.",
    fromZero: "Un sistema es un conjunto de ecuaciones que se tienen que cumplir a la vez. Si sumás o restás ecuaciones verdaderas, obtenés otra ecuación verdadera; Gauss aprovecha eso para ir eliminando incógnitas.",
    why: "Porque un sistema triangular se resuelve despejando de a una incógnita. Gauss es la forma sistemática de llegar ahí sin cambiar las soluciones.",
    origin: "Si (x, y, z) cumple dos ecuaciones, también cumple cualquier combinación de ellas; y como las operaciones se pueden deshacer, no se ganan ni se pierden soluciones.",
    board: gaussBoard,
  },
};

const clasifBoard: BoardStep[] = [
  { expr: "x + y + z = 2 ; x + 2y − z = 1 ; 2x + 3y = 3", note: "Sistema" },
  { expr: "F₂ − F₁:  y − 2z = −1", note: "Eliminamos x" },
  { expr: "F₃ − 2F₁:  y − 2z = −1", note: "Eliminamos x de la tercera" },
  { expr: "F₃ − F₂:  0 = 0", note: "La tercera ecuación no aportaba nada" },
  { expr: "z = t,  y = 2t − 1,  x = 3 − 3t", note: "z queda libre: SCI" },
];

export const sistemasClasificacionLesson: Lesson = {
  id: "l-alg-sistemas-clasificacion",
  title: "Clasificación de sistemas",
  subtitle: "SCD, SCI, SI y sistemas con parámetro",
  subjectId: S,
  topicIds: ["t-alg-sistemas-clasificacion"],
  estimatedMinutes: 12,
  prerequisites: ["t-alg-gauss"],
  cards: [
    intro("Clasificar sistemas", "Cómo saber si un sistema tiene una solución, infinitas o ninguna, y cómo analizarlo cuando depende de un parámetro k.", "En los parciales es muy común «clasificar según los valores de k»: es el mismo Gauss, mirando qué filas se anulan."),
    explain(
      "Tres finales posibles",
      "Dos rectas en el plano pueden cortarse en **un punto**, ser **la misma recta** (infinitos puntos en común) o ser **paralelas** (ninguno). Con más ecuaciones pasa lo mismo:\n\n• **SCD**: compatible determinado, solución única.\n• **SCI**: compatible indeterminado, infinitas.\n• **SI**: incompatible, ninguna.",
      { tag: "intuitivo", widget: { type: "plot", mode: "linear", initial: "2x+1" } },
    ),
    quiz("Para pensar", {
      id: "q-alg-fila-contradiccion",
      subjectId: S,
      topicId: "t-alg-sistemas-clasificacion",
      prompt: "Al escalonar, la última fila quedó $0x + 0y + 0z = 4$. ¿Qué podés afirmar?",
      options: ["El sistema es incompatible (SI)", "Tiene infinitas soluciones", "z = 4"],
      answer: 0,
      explanation: "La fila dice 0 = 4, que es falso para cualquier (x, y, z): no hay solución.",
      hints: ["¿Qué valor de x, y, z cumple 0 = 4?", "Ninguno.", "Una contradicción ⇒ SI."],
      errors: { 1: ["conceptual", "Infinitas soluciones aparece con 0 = 0, no con 0 = 4."], 2: ["conceptual", "El coeficiente de z es 0: la fila no dice nada de z, dice 0 = 4."] },
    }, true),
    explain(
      "Cómo decidir",
      "Escalonás y mirás:\n\n• Aparece $0 = k$ con $k ≠ 0$ ⇒ **SI**.\n• No hay contradicción y hay un pivote por incógnita ⇒ **SCD**.\n• No hay contradicción pero sobran incógnitas (filas $0 = 0$) ⇒ **SCI**, con variables libres.\n\nCon parámetro: buscá los $k$ que anulan un pivote (o el determinante) y analizalos aparte.",
      { tag: "matematico" },
    ),
    board("Un sistema SCI", clasifBoard),
    example("Ejemplo resuelto: con parámetro", "Clasificá $x + 2y = 3$, $2x + ky = 6$ según k.", ["$F_2 − 2F_1$: $(k − 4)y = 0$", "Si $k ≠ 4$: $y = 0$, $x = 3$ ⇒ SCD.", "Si $k = 4$: queda $0 = 0$ ⇒ SCI."], "k ≠ 4: SCD; k = 4: SCI"),
    practice("Ejercicio guiado", "alg-sistema-clasificar", 1, 2, true),
    explain(
      "Error típico: dividir por algo que puede ser 0",
      "En $(k − 4)y = 0$ no se puede «pasar dividiendo» $(k − 4)$ sin aclarar que $k ≠ 4$. El caso $k = 4$ hay que estudiarlo **por separado**.\n\nOtro error: decir SCI con solo ver una fila $0 = 0$. Primero fijate que no haya otra fila con $0 = k$.",
      { tag: "intuitivo" },
    ),
    practice("Tu turno", "alg-sistema-parametro", 2, 5),
    practice("Tu turno", "alg-sistema-clasificar", 4, 8),
    practice("Desafío", "alg-sistema-parametro", 5, 11),
    summary(["SCD: única; SCI: infinitas; SI: ninguna.", "0 = k (k ≠ 0) ⇒ SI.", "Filas 0 = 0 y menos pivotes que incógnitas ⇒ SCI.", "Con parámetro: estudiá aparte los k que anulan un pivote.", "Sistema cuadrado: det ≠ 0 ⇔ SCD."]),
  ],
  tutor: {
    normal: "Un sistema lineal es compatible determinado, compatible indeterminado o incompatible. La forma escalonada lo decide: una fila 0 = k ≠ 0 lo hace incompatible; si es compatible, la cantidad de variables libres es el número de incógnitas menos el de pivotes.",
    simple: "Hacés Gauss. Si aparece algo imposible (0 = 5) no tiene solución. Si todo cierra y cada incógnita tiene su escalón, hay una sola. Si sobran incógnitas, hay infinitas.",
    nino: "Tres pistas para adivinar tres números. Si las pistas se contradicen, no hay respuesta. Si una pista repite lo que ya decían otras, te faltan datos y hay muchas respuestas posibles.",
    ejemplo: "x + y = 2 y 2x + 2y = 4: la segunda es el doble de la primera ⇒ SCI.",
    visual: { type: "plot", mode: "linear", initial: "2x+1" },
    visualText: "Cada ecuación de dos incógnitas es una recta: cortarse, coincidir o ser paralelas son los tres casos.",
    fromZero: "Resolver un sistema es encontrar los valores que cumplen todas las ecuaciones juntas. Puede haber uno, ninguno o infinitos, y Gauss te dice cuál de los tres casos es.",
    why: "Antes de buscar «la» solución conviene saber si existe y si es única: en Ingeniería, un sistema SCI significa que faltan datos y uno SI que los datos son inconsistentes.",
    origin: "Las operaciones de Gauss no cambian las soluciones. En la forma escalonada se ve directamente si hay una ecuación imposible o variables sin pivote (libres).",
    board: clasifBoard,
  },
};

// ═════════════════════════ alg-4 · Determinantes ═════════════════════════

const detBoard: BoardStep[] = [
  { expr: "A = [2  1  3 ; 0  −1  4 ; 1  2  0]", note: "Desarrollamos por la primera fila" },
  { expr: "det A = 2·M₁₁ − 1·M₁₂ + 3·M₁₃", note: "Signos alternados + − +" },
  { expr: "M₁₁ = (−1)·0 − 4·2 = −8", note: "Tapamos fila 1 y columna 1" },
  { expr: "M₁₂ = 0·0 − 4·1 = −4", note: "Tapamos fila 1 y columna 2" },
  { expr: "M₁₃ = 0·2 − (−1)·1 = 1", note: "Tapamos fila 1 y columna 3" },
  { expr: "det A = 2·(−8) − 1·(−4) + 3·1 = −9", note: "Resultado" },
];

export const determinantesLesson: Lesson = {
  id: "l-alg-determinantes",
  title: "Determinantes",
  subtitle: "2×2, 3×3 (Sarrus y cofactores) y propiedades",
  subjectId: S,
  topicIds: ["t-alg-determinantes"],
  estimatedMinutes: 12,
  prerequisites: ["t-alg-matrices"],
  cards: [
    intro("Determinantes", "Cómo calcular el determinante de matrices 2×2 y 3×3 y cómo usar sus propiedades para no hacer cuentas de más.", "El determinante dice en un número si una matriz es inversible y si un sistema tiene solución única."),
    explain(
      "Un factor de área",
      "Una matriz 2×2 transforma el cuadrado unidad en un paralelogramo. El **determinante** es el área de ese paralelogramo, con signo (negativo si «da vuelta» la figura).\n\nSi $det = 0$, el cuadrado se aplasta en un segmento: la transformación pierde información. Probá con $[2  1 ; 4  2]$.",
      { tag: "intuitivo", widget: { type: "matrix", a: 2, b: 1, c: 1, d: 3 } },
    ),
    quiz("Para pensar", {
      id: "q-alg-det2",
      subjectId: S,
      topicId: "t-alg-determinantes",
      prompt: "¿Cuánto vale $det [3  2 ; 4  5]$?",
      options: ["7", "23", "−7"],
      answer: 0,
      explanation: "det = 3·5 − 2·4 = 15 − 8 = 7.",
      hints: ["ad − bc.", "Diagonal principal: 3·5.", "Diagonal secundaria: 2·4."],
      errors: { 1: ["signos", "Es una resta: 15 − 8, no 15 + 8."], 2: ["signos", "Es diagonal principal menos secundaria: 15 − 8."] },
    }, true),
    explain(
      "3×3 y propiedades",
      "**Cofactores**: elegís una fila, multiplicás cada elemento por el determinante 2×2 que queda al tachar su fila y columna, con signos $+ − +$. **Sarrus** (solo 3×3): tres diagonales que bajan a la derecha menos tres que bajan a la izquierda.\n\nPropiedades ($A$ de $n×n$): $det(A^T) = det A$; $det(AB) = det A·det B$; $det(kA) = k^n det A$; intercambiar filas cambia el signo; una fila nula o dos filas proporcionales ⇒ $det = 0$.",
      { tag: "matematico" },
    ),
    board("Determinante 3×3 por cofactores", detBoard),
    example("Ejemplo resuelto: propiedades", "Si A es 3×3 con $det A = 2$, calculá $det(3A)$.", ["$3A$ multiplica por 3 cada una de las 3 filas.", "$det(3A) = 3^3·det A$", "$= 27·2 = 54$"], "54"),
    practice("Ejercicio guiado", "alg-determinante", 1, 3, true),
    explain(
      "Errores típicos",
      "1. $det(kA) = k·det A$: **falso**, es $k^n·det A$.\n2. $det(A + B) = det A + det B$: **falso** en general.\n3. En cofactores, olvidar el signo menos del segundo término.\n\nConsejo: desarrollá por la fila o columna con más ceros.",
      { tag: "intuitivo" },
    ),
    practice("Tu turno", "alg-determinante", 3, 6),
    practice("Tu turno", "alg-det-propiedades", 2, 8),
    practice("Desafío", "alg-det-propiedades", 5, 12),
    summary(["det [a b ; c d] = ad − bc.", "3×3: cofactores (+ − +) o Sarrus.", "det(AB) = det A·det B; det(Aᵀ) = det A.", "det(kA) = kⁿ det A.", "Intercambiar filas cambia el signo; filas proporcionales ⇒ 0."]),
  ],
  tutor: {
    normal: "El determinante es una función de las matrices cuadradas, lineal en cada fila, alternada e igual a 1 en la identidad. Se calcula por desarrollo en cofactores y mide el factor de cambio de área (o volumen) con orientación.",
    simple: "Para 2×2: diagonal principal menos diagonal secundaria. Para 3×3: elegís una fila y la desarrollás con signos + − +, usando determinantes 2×2.",
    nino: "Si estirás una foto en una impresora, el determinante dice por cuánto se multiplicó el área. Si da 0, la foto quedó aplastada en una línea y no se puede recuperar.",
    ejemplo: "det [2 0 ; 0 3] = 6: el cuadrado unidad se vuelve un rectángulo de 2 por 3.",
    visual: { type: "matrix", a: 2, b: 1, c: 1, d: 3 },
    visualText: "El área del paralelogramo transformado es |det|.",
    fromZero: "Una matriz cuadrada tiene asociado un número, su determinante. Para 2×2 la cuenta es ad − bc; para matrices más grandes se arma con determinantes más chicos.",
    why: "Porque resume en un solo número si la matriz «pierde dimensión»: det = 0 significa filas dependientes, sistema sin solución única y matriz sin inversa.",
    origin: "Resolviendo ax + by = e, cx + dy = f por eliminación aparece en el denominador ad − bc: ese número decide si se puede despejar. El 3×3 se obtiene igual y se organiza en cofactores.",
    board: detBoard,
  },
};

const inversaBoard: BoardStep[] = [
  { expr: "A = [3  1 ; 5  2]", note: "Matriz a invertir" },
  { expr: "det A = 3·2 − 1·5 = 1", note: "Como det ≠ 0, existe la inversa" },
  { expr: "[2  −1 ; −5  3]", note: "Intercambiamos la diagonal y cambiamos el signo de los otros dos" },
  { expr: "A⁻¹ = (1/1)·[2  −1 ; −5  3]", note: "Dividimos por el determinante" },
  { expr: "A·A⁻¹ = [6 − 5   −3 + 3 ; 10 − 10   −5 + 6] = I", note: "Verificación" },
];

export const inversaLesson: Lesson = {
  id: "l-alg-inversa",
  title: "Matriz inversa y solución única",
  subtitle: "det ≠ 0 ⇔ hay inversa ⇔ solución única",
  subjectId: S,
  topicIds: ["t-alg-inversa"],
  estimatedMinutes: 10,
  prerequisites: ["t-alg-determinantes", "t-alg-sistemas-clasificacion"],
  cards: [
    intro("Inversa y determinante", "Cómo calcular la inversa de una matriz 2×2 y por qué det ≠ 0 equivale a que un sistema tenga solución única.", "Une las dos unidades anteriores: con la inversa, A·X = B se resuelve como X = A⁻¹·B."),
    explain(
      "Deshacer una transformación",
      "Si una matriz es una «máquina» que transforma vectores, su **inversa** es la máquina que los devuelve a su lugar: $A^{−1}·A = I$.\n\nComo una cerradura: si girás la llave a la derecha, la inversa es girar a la izquierda. Pero si la máquina aplasta el plano (det = 0), no hay forma de deshacerlo.",
      { tag: "cotidiano", widget: { type: "matrix", a: 3, b: 1, c: 5, d: 2 } },
    ),
    quiz("Para pensar", {
      id: "q-alg-inversible",
      subjectId: S,
      topicId: "t-alg-inversa",
      prompt: "¿Cuál de estas matrices **no** tiene inversa?",
      options: ["$[2  4 ; 1  2]$", "$[2  4 ; 1  3]$", "$[1  0 ; 0  −1]$"],
      answer: 0,
      explanation: "det [2 4 ; 1 2] = 4 − 4 = 0: las filas son proporcionales y la matriz no es inversible.",
      hints: ["Calculá los determinantes.", "Una matriz es inversible ⇔ det ≠ 0.", "¿Alguna tiene filas proporcionales?"],
      errors: { 1: ["calculo", "det = 2·3 − 4·1 = 2 ≠ 0: sí es inversible."], 2: ["calculo", "det = −1 ≠ 0: sí es inversible (es una simetría)."] },
    }, true),
    explain(
      "Inversa 2×2 y el teorema",
      "Si $A = [a  b ; c  d]$ y $det A ≠ 0$:\n\n$A^{−1} = \\frac{1}{ad − bc}·[d  −b ; −c  a]$\n\nPara $A$ cuadrada, son equivalentes: $det A ≠ 0$ ⇔ $A$ inversible ⇔ $A·X = B$ tiene **solución única** $X = A^{−1}B$ ⇔ $A·X = 0$ solo tiene la solución nula.",
      { tag: "matematico" },
    ),
    board("Inversa de una matriz 2×2", inversaBoard),
    example("Ejemplo resuelto", "Invertí $A = [2  4 ; 1  3]$.", ["$det A = 6 − 4 = 2$", "$[3  −4 ; −1  2]$ (intercambio y signos)", "$A^{−1} = [3/2  −2 ; −1/2  1]$"], "[3/2 −2 ; −1/2 1]"),
    practice("Ejercicio guiado", "alg-inversa-2x2", 1, 4, true),
    explain(
      "Errores típicos",
      "1. Cambiar de signo la diagonal principal en lugar de intercambiarla.\n2. Olvidar dividir por el determinante.\n3. Intentar invertir con $det = 0$: si el determinante da 0, la respuesta es «no existe».\n\nVerificá siempre que $A·A^{−1}$ dé la identidad.",
      { tag: "intuitivo" },
    ),
    practice("Tu turno", "alg-det-parametro", 2, 5),
    practice("Tu turno", "alg-inversa-2x2", 3, 7),
    practice("Desafío", "alg-det-parametro", 5, 10),
    summary(["A⁻¹ existe ⇔ det A ≠ 0.", "2×2: A⁻¹ = 1/(ad − bc)·[d −b ; −c a].", "A·X = B con det A ≠ 0 ⇒ X = A⁻¹B (solución única).", "det A = 0 ⇒ SCI o SI, según B.", "Verificá: A·A⁻¹ = I."]),
  ],
  tutor: {
    normal: "Una matriz cuadrada A es inversible si existe B con AB = BA = I. Esto ocurre si y solo si det A ≠ 0, condición que también equivale a que el sistema A·X = B tenga solución única para todo B.",
    simple: "Si el determinante no es cero, la matriz tiene inversa y el sistema tiene una sola solución. Para 2×2: intercambiás a y d, cambiás el signo de b y c, y dividís todo por el determinante.",
    nino: "Ponerse y sacarse las medias: una cosa deshace la otra. Una matriz con determinante 0 es como licuar fruta: no hay manera de volver atrás.",
    ejemplo: "A = [2 0 ; 0 4] ⇒ A⁻¹ = [1/2 0 ; 0 1/4].",
    visual: { type: "matrix", a: 3, b: 1, c: 5, d: 2 },
    visualText: "Esta matriz tiene det = 1: deforma el cuadrado pero conserva el área, y se puede deshacer.",
    fromZero: "Con números, el inverso de 5 es 1/5 porque 5·(1/5) = 1. Con matrices, el papel del 1 lo juega la identidad I, y no todas las matrices tienen «inverso».",
    why: "Porque permite despejar matrices: de A·X = B se pasa a X = A⁻¹·B, igual que de 5x = 10 se pasa a x = 10/5.",
    origin: "Multiplicando [a b ; c d]·[d −b ; −c a] se obtiene (ad − bc)·I. Dividiendo por ad − bc (si no es 0) aparece la identidad: esa es la fórmula.",
    board: inversaBoard,
  },
};

// ═════════════════════════ alg-5 · Transformaciones lineales ═════════════════════════

const tlBoard: BoardStep[] = [
  { expr: "T(x, y) = (2x − y, x + 3y)", note: "Transformación dada por fórmula" },
  { expr: "T(1, 0) = (2, 1)", note: "Imagen del primer vector canónico" },
  { expr: "T(0, 1) = (−1, 3)", note: "Imagen del segundo" },
  { expr: "M_T = [2  −1 ; 1  3]", note: "Esas imágenes son las columnas de la matriz" },
  { expr: "T(2, 1) = (2·2 − 1, 2 + 3·1) = (3, 5)", note: "Imagen de un vector cualquiera" },
];

export const transformacionesLesson: Lesson = {
  id: "l-alg-transformaciones",
  title: "Transformaciones lineales",
  subtitle: "Matriz asociada, núcleo, imagen y el plano en movimiento",
  subjectId: S,
  topicIds: ["t-alg-transformaciones"],
  estimatedMinutes: 12,
  prerequisites: ["t-alg-matrices", "t-alg-determinantes"],
  cards: [
    intro("Transformaciones lineales", "Qué es una transformación lineal, cómo se escribe con una matriz y cómo encontrar su núcleo e imagen en casos simples.", "Rotar, reflejar o escalar una figura en computación gráfica son transformaciones lineales: todo se reduce a multiplicar por una matriz."),
    explain(
      "Mover todo el plano",
      "Una **transformación lineal** $T$ mueve los vectores respetando sumas y escalas: $T(u + v) = T(u) + T(v)$ y $T(k·u) = k·T(u)$. Las rectas siguen siendo rectas y el origen queda fijo.\n\nEsta matriz es una **rotación de 90°**: mirá cómo gira la grilla. Cambiá los números para ver simetrías y escalas.",
      { tag: "intuitivo", widget: { type: "matrix", a: 0, b: -1, c: 1, d: 0 } },
    ),
    quiz("Para pensar", {
      id: "q-alg-tl-lineal",
      subjectId: S,
      topicId: "t-alg-transformaciones",
      prompt: "¿Cuál de estas **no** es una transformación lineal?",
      options: ["$T(x, y) = (x + 1, y)$", "$T(x, y) = (2x, −y)$", "$T(x, y) = (y, x)$"],
      answer: 0,
      explanation: "Una transformación lineal manda el (0, 0) al (0, 0). Pero T(0, 0) = (1, 0): una traslación no es lineal.",
      hints: ["Probá con el vector nulo.", "Una TL siempre cumple T(0) = 0.", "¿Cuánto vale T(0, 0) en cada caso?"],
      errors: { 1: ["conceptual", "(2x, −y) es una escala combinada con una simetría: sí es lineal."], 2: ["conceptual", "(y, x) es la simetría respecto de y = x: sí es lineal."] },
    }, true),
    explain(
      "Matriz, núcleo e imagen",
      "Las columnas de la matriz asociada son $T(e_1)$ y $T(e_2)$. Entonces $T(v) = M·v$.\n\n• **Núcleo** $Nu(T)$: los $v$ con $T(v) = 0$ (sistema homogéneo).\n• **Imagen** $Im(T)$: todos los $T(v)$, generada por las columnas.\n• $dim Nu + dim Im = dim$ del dominio.\n\nSi $det M ≠ 0$: $Nu = \\{0\\}$ e $Im = ℝ^2$.",
      { tag: "matematico", widget: { type: "matrix", a: 1, b: 2, c: 2, d: 4 } },
    ),
    board("Matriz asociada y una imagen", tlBoard),
    example("Ejemplo resuelto: núcleo e imagen", "$T(x, y) = (x − 2y, 2x − 4y)$.", ["Matriz $[1  −2 ; 2  −4]$, det = 0.", "$T(x, y) = 0$ ⇔ $x − 2y = 0$ ⇔ $x = 2y$ ⇒ $Nu(T) = gen\\{(2, 1)\\}$", "Columnas $(1, 2)$ y $(−2, −4)$ ⇒ $Im(T) = gen\\{(1, 2)\\}$", "Dimensiones: 1 + 1 = 2 ✓"], "Nu = gen{(2, 1)}, Im = gen{(1, 2)}"),
    practice("Ejercicio guiado", "alg-tl-imagen", 1, 2, true),
    explain(
      "Errores típicos",
      "1. Poner las imágenes como **filas** en lugar de columnas.\n2. Confundir núcleo con imagen: el núcleo vive en el dominio (lo que va a 0), la imagen en el codominio (lo que se alcanza).\n3. Creer que $Nu = \\{0\\}$ siempre: solo si $det ≠ 0$.",
      { tag: "intuitivo" },
    ),
    practice("Tu turno", "alg-tl-plano", 2, 5),
    practice("Tu turno", "alg-tl-nucleo", 3, 8),
    practice("Desafío", "alg-tl-imagen", 6, 11),
    summary(["T lineal: respeta sumas y escalas; T(0) = 0.", "Columnas de la matriz = imágenes de la base canónica.", "Nu(T) = {v : T(v) = 0}; Im(T) = generada por las columnas.", "dim Nu + dim Im = dim del dominio.", "Rotación 90°: [0 −1 ; 1 0]; simetría eje x: [1 0 ; 0 −1]; escala k: [k 0 ; 0 k]."]),
  ],
  tutor: {
    normal: "Una transformación lineal T: ℝⁿ → ℝᵐ preserva combinaciones lineales y queda determinada por las imágenes de una base; su matriz asociada tiene esas imágenes como columnas. El núcleo y la imagen son subespacios y cumplen el teorema de la dimensión.",
    simple: "Es una regla que mueve todos los vectores multiplicándolos por una matriz. El núcleo son los vectores que terminan en el origen; la imagen, todos los lugares a los que se puede llegar.",
    nino: "Pensá en un dibujo en una hoja de goma: podés girarla, estirarla o darla vuelta, pero el centro no se mueve y las líneas rectas siguen rectas. Si la aplastás hasta que quede una línea, algunos puntos se juntan en el centro: ese es el núcleo.",
    ejemplo: "La simetría respecto del eje x, T(x, y) = (x, −y), tiene matriz [1 0 ; 0 −1].",
    visual: { type: "matrix", a: 0, b: -1, c: 1, d: 0 },
    visualText: "Rotación de 90°: (1, 0) va a (0, 1) y (0, 1) va a (−1, 0).",
    fromZero: "Una función toma un número y devuelve otro. Una transformación toma un vector y devuelve otro vector. Las lineales son las más simples: se calculan multiplicando por una matriz.",
    why: "Porque conociendo qué le pasa a dos vectores (la base) sabés qué le pasa a todos. Eso convierte geometría (rotar, reflejar) en cuentas con matrices.",
    origin: "Todo v = (x, y) es x·e₁ + y·e₂. Por linealidad T(v) = x·T(e₁) + y·T(e₂), que es exactamente la matriz de columnas T(e₁), T(e₂) multiplicada por (x, y).",
    board: tlBoard,
  },
};

// ═════════════════════════ alg-6 · Cónicas ═════════════════════════

const circBoard: BoardStep[] = [
  { expr: "x^2 + y^2 − 4x + 6y − 3 = 0", note: "Ecuación general" },
  { expr: "(x^2 − 4x) + (y^2 + 6y) = 3", note: "Agrupamos y pasamos el término independiente" },
  { expr: "(x^2 − 4x + 4) + (y^2 + 6y + 9) = 3 + 4 + 9", note: "Completamos cuadrados: sumamos (b/2)² en ambos lados" },
  { expr: "(x − 2)^2 + (y + 3)^2 = 16", note: "Forma canónica" },
  { expr: "C = (2, −3),  r = 4", note: "Centro y radio" },
];

export const circunferenciaLesson: Lesson = {
  id: "l-alg-circunferencia",
  title: "Circunferencia",
  subtitle: "Completar cuadrados para hallar centro y radio",
  subjectId: S,
  topicIds: ["t-alg-circunferencia"],
  estimatedMinutes: 10,
  prerequisites: ["t-pitagoras", "t-factorizacion"],
  cards: [
    intro("Circunferencia", "La ecuación de la circunferencia y cómo pasar de la forma general a la canónica completando cuadrados.", "Completar cuadrados es la técnica para reconocer todas las cónicas, y la vas a volver a usar en Análisis."),
    explain(
      "Todos a la misma distancia",
      "Un compás marca todos los puntos a la misma distancia $r$ de la punta. Por Pitágoras, $(x, y)$ está a distancia $r$ de $(h, k)$ si\n\n$(x − h)^2 + (y − k)^2 = r^2$\n\nEsa es la **forma canónica**: el centro y el radio se leen directo.",
      { tag: "cotidiano", widget: { type: "plot", mode: "free", initial: "sqrt(16-(x-2)^2)-3" } },
    ),
    quiz("Para pensar", {
      id: "q-alg-centro",
      subjectId: S,
      topicId: "t-alg-circunferencia",
      prompt: "¿Centro y radio de $(x + 1)^2 + (y − 5)^2 = 49$?",
      options: ["Centro (−1, 5), radio 7", "Centro (1, −5), radio 7", "Centro (−1, 5), radio 49"],
      answer: 0,
      explanation: "(x + 1)² = (x − (−1))² ⇒ h = −1; (y − 5)² ⇒ k = 5; r² = 49 ⇒ r = 7.",
      hints: ["Compará con (x − h)² + (y − k)² = r².", "x + 1 = x − (−1).", "El número de la derecha es r²."],
      errors: { 1: ["signos", "El centro tiene los signos opuestos a los del paréntesis: (x + 1) ⇒ h = −1."], 2: ["potencias", "49 es r²: el radio es √49 = 7."] },
    }, true),
    explain(
      "Completar cuadrados",
      "En la forma general $x^2 + y^2 + Dx + Ey + F = 0$ el centro no se ve. La clave:\n\n$x^2 + bx = (x + \\frac{b}{2})^2 − (\\frac{b}{2})^2$\n\nSe agrupan $x$ con $x$ e $y$ con $y$, se suma $(b/2)^2$ **en ambos lados** y queda la forma canónica. Si $x^2$ e $y^2$ tienen coeficiente $a ≠ 1$, primero se divide todo por $a$.",
      { tag: "matematico" },
    ),
    board("De la forma general a la canónica", circBoard),
    example("Ejemplo resuelto", "Centro y radio de $x^2 + y^2 + 2x − 8y + 8 = 0$.", ["$(x^2 + 2x + 1) + (y^2 − 8y + 16) = −8 + 1 + 16$", "$(x + 1)^2 + (y − 4)^2 = 9$", "Centro $(−1, 4)$, radio 3"], "C = (−1, 4), r = 3"),
    practice("Ejercicio guiado", "alg-circunferencia", 1, 2, true),
    explain(
      "Errores típicos",
      "1. Sumar $(b/2)^2$ solo de un lado: la ecuación cambia.\n2. Leer mal el signo del centro: $(x − 3)^2$ ⇒ $h = 3$; $(x + 3)^2$ ⇒ $h = −3$.\n3. Dar $r^2$ como radio.\n4. Si a la derecha queda un número negativo, no hay circunferencia (ningún punto la cumple).",
      { tag: "intuitivo" },
    ),
    practice("Tu turno", "alg-ordenar-circunferencia", 3, 5),
    practice("Tu turno", "alg-circunferencia", 3, 8),
    practice("Desafío", "alg-circunferencia", 5, 11),
    summary(["(x − h)² + (y − k)² = r²: centro (h, k), radio r.", "x² + bx = (x + b/2)² − (b/2)².", "Lo que se suma de un lado se suma del otro.", "Si x² e y² tienen coeficiente a, dividí por a.", "El radio es la raíz del número de la derecha."]),
  ],
  tutor: {
    normal: "La circunferencia de centro (h, k) y radio r es el lugar geométrico de los puntos a distancia r del centro: (x − h)² + (y − k)² = r². Desarrollada da x² + y² + Dx + Ey + F = 0, y completando cuadrados se vuelve a la forma canónica.",
    simple: "Agrupás las x, agrupás las y, y a cada grupo le sumás lo que le falta para ser un cuadrado perfecto (lo mismo del otro lado). Así aparecen el centro y el radio.",
    nino: "Una cabra atada a una estaca con una soga de 4 metros puede pastar en un círculo: todos los puntos del borde están a 4 metros de la estaca. La ecuación dice exactamente eso.",
    ejemplo: "x² + y² − 6x = 0 ⇒ (x − 3)² + y² = 9: centro (3, 0), radio 3.",
    visual: { type: "plot", mode: "free", initial: "sqrt(16-(x-2)^2)-3" },
    visualText: "La mitad de arriba de la circunferencia de centro (2, −3) y radio 4.",
    fromZero: "La distancia entre dos puntos sale de Pitágoras: √((x − h)² + (y − k)²). Pedir que esa distancia sea r, y elevar al cuadrado, da la ecuación de la circunferencia.",
    why: "Porque en la forma general el centro y el radio están «escondidos». Completar cuadrados los hace visibles, y la misma técnica sirve para elipses, hipérbolas y parábolas.",
    origin: "Desarrollando (x + b/2)² = x² + bx + (b/2)² se ve que a x² + bx solo le falta (b/2)² para ser un cuadrado perfecto.",
    board: circBoard,
  },
};

const conicasBoard: BoardStep[] = [
  { expr: "4x^2 + 9y^2 − 16x + 18y − 11 = 0", note: "Ecuación general" },
  { expr: "4(x^2 − 4x) + 9(y^2 + 2y) = 11", note: "Agrupamos y sacamos factor común" },
  { expr: "4(x − 2)^2 − 16 + 9(y + 1)^2 − 9 = 11", note: "Completamos cuadrados (multiplicados por 4 y por 9)" },
  { expr: "4(x − 2)^2 + 9(y + 1)^2 = 36", note: "Pasamos los números a la derecha" },
  { expr: "(x − 2)^2/9 + (y + 1)^2/4 = 1", note: "Dividimos por 36: elipse de centro (2, −1)" },
  { expr: "a = 3,  b = 2,  c = √(9 − 4) = √5", note: "Semiejes y distancia focal" },
];

export const conicasLesson: Lesson = {
  id: "l-alg-conicas",
  title: "Elipse, hipérbola y parábola",
  subtitle: "Formas canónicas y sus elementos",
  subjectId: S,
  topicIds: ["t-alg-conicas"],
  estimatedMinutes: 12,
  prerequisites: ["t-alg-circunferencia"],
  cards: [
    intro("Cónicas", "Cómo reconocer una elipse, una hipérbola o una parábola por su ecuación y cómo leer centro, semiejes, focos y directriz.", "Las órbitas son elipses, las antenas son parábolas y la navegación por diferencia de distancias usa hipérbolas."),
    explain(
      "Definiciones con distancias",
      "• **Elipse**: la **suma** de distancias a dos focos es constante (una soga atada a dos clavos).\n• **Hipérbola**: la **diferencia** de distancias a dos focos es constante.\n• **Parábola**: misma distancia a un foco y a una recta (la directriz).\n\nPor eso una antena parabólica concentra todo en el foco.",
      { tag: "cotidiano", widget: { type: "param-function", family: "parabola" } },
    ),
    quiz("Para pensar", {
      id: "q-alg-identificar-conica",
      subjectId: S,
      topicId: "t-alg-conicas",
      prompt: "¿Qué cónica es $\\frac{x^2}{16} − \\frac{y^2}{9} = 1$?",
      options: ["Hipérbola", "Elipse", "Parábola"],
      answer: 0,
      explanation: "x² e y² aparecen con signos opuestos: hipérbola.",
      hints: ["Mirá los signos de los términos cuadráticos.", "Mismo signo: elipse (o circunferencia).", "Signos opuestos: hipérbola."],
      errors: { 1: ["conceptual", "En la elipse los dos cuadrados se SUMAN."], 2: ["conceptual", "En la parábola solo una variable está al cuadrado."] },
    }, true),
    explain(
      "Formas canónicas (centro en el origen)",
      "• Elipse: $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$, con $a > b$: focos $(±c, 0)$, $c^2 = a^2 − b^2$.\n• Hipérbola: $\\frac{x^2}{a^2} − \\frac{y^2}{b^2} = 1$: focos $(±c, 0)$, $c^2 = a^2 + b^2$.\n• Parábola: $x^2 = 4py$: foco $(0, p)$, directriz $y = −p$.\n\nCon centro $(h, k)$, se cambia $x$ por $x − h$ e $y$ por $y − k$.",
      { tag: "matematico", widget: { type: "plot", mode: "free", initial: "3*sqrt(1-x^2/25)" } },
    ),
    board("Llevar una elipse a la forma canónica", conicasBoard),
    example("Ejemplo resuelto", "Focos de la elipse $\\frac{x^2}{25} + \\frac{y^2}{9} = 1$.", ["$a^2 = 25$, $b^2 = 9$", "$c^2 = 25 − 9 = 16$ ⇒ $c = 4$", "Focos $(−4, 0)$ y $(4, 0)$"], "(±4, 0)"),
    practice("Ejercicio guiado", "alg-conica-identificar", 1, 3, true),
    explain(
      "Errores típicos",
      "1. Usar $c^2 = a^2 + b^2$ en la elipse (es la de la hipérbola).\n2. Leer $a$ y $b$ como los denominadores: los denominadores son $a^2$ y $b^2$.\n3. En $x^2 = 8y$, decir que $p = 8$: es $4p = 8$, así que $p = 2$.",
      { tag: "intuitivo" },
    ),
    practice("Tu turno", "alg-conica-elementos", 2, 5),
    practice("Tu turno", "alg-conica-identificar", 4, 8),
    practice("Desafío", "alg-conica-elementos", 5, 11),
    summary(["Elipse: suma de distancias constante; c² = a² − b².", "Hipérbola: diferencia constante; c² = a² + b².", "Parábola: (x − h)² = 4p(y − k); foco a distancia p del vértice, directriz del otro lado.", "Identificar: mismo signo ⇒ elipse; signos opuestos ⇒ hipérbola; un solo cuadrado ⇒ parábola.", "Forma general → canónica: completar cuadrados."]),
  ],
  tutor: {
    normal: "Las cónicas son las curvas de segundo grado en x e y. Sin término xy, completando cuadrados toda ecuación no degenerada se lleva a una forma canónica de circunferencia, elipse, hipérbola o parábola, de la que se leen centro (o vértice), semiejes, focos y directriz.",
    simple: "Mirás los términos al cuadrado: si están los dos sumando, es elipse (o circunferencia si tienen el mismo número); si uno resta, hipérbola; si hay uno solo, parábola. Después completás cuadrados para ver los datos.",
    nino: "Si atás una soga a dos clavos y la recorrés con un lápiz bien tirante, dibujás una elipse. Las órbitas de los planetas tienen esa forma, con el Sol en uno de los clavos.",
    ejemplo: "x²/9 + y²/4 = 1: elipse con a = 3, b = 2, c = √5 ≈ 2,24.",
    visual: { type: "plot", mode: "free", initial: "3*sqrt(1-x^2/25)" },
    visualText: "Mitad de arriba de la elipse x²/25 + y²/9 = 1: corta el eje x en ±5 y el eje y en 3.",
    fromZero: "Las cónicas se definen con distancias: a un punto (foco), a dos puntos, o a un punto y una recta. Escribiendo esas distancias con Pitágoras y simplificando aparecen sus ecuaciones.",
    why: "Porque así se reconoce de un vistazo qué curva es y dónde están sus puntos importantes, que son los que importan en las aplicaciones (focos de antenas, órbitas, lentes).",
    origin: "Para la parábola: la distancia de (x, y) al foco (0, p) es √(x² + (y − p)²) y a la directriz y = −p es |y + p|. Igualando y elevando al cuadrado: x² = 4py. La elipse y la hipérbola salen igual con dos focos.",
    board: conicasBoard,
  },
};

export const algebraALessons: Lesson[] = [conjuntosLesson, valorAbsolutoLesson, complejosLesson, complejosPolarLesson, polinomiosDivisionLesson, polinomiosRaicesLesson, productoVectorialLesson, anguloProyeccionLesson, rectasLesson, planosLesson, posicionesDistanciasLesson,
  matricesLesson, gaussLesson, sistemasClasificacionLesson, determinantesLesson, inversaLesson, transformacionesLesson, circunferenciaLesson, conicasLesson];
