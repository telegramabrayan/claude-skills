/**
 * Lecciones de Análisis Matemático A (CBC). Profundizan lo que l-limites y
 * l-derivadas presentan como introducción, con el estilo de los parciales de
 * la cátedra (ejemplos propios, nunca enunciados copiados).
 */
import type { BoardStep, Lesson, LessonCard } from "@/engine/types";
import { mathFix } from "@/engine/generators/am";
import { example, explain, intro, practice, quiz, summary } from "./helpers";

const board = (title: string, steps: BoardStep[], introText?: string, outro?: string): LessonCard => ({ kind: "board", title, steps, intro: introText, outro });

// ───────────────────────── am-4 · Límites ─────────────────────────

const RAICES_BOARD: BoardStep[] = [
  { expr: "lim (√(4x² + 12x) − 2x)", note: "Con x → +∞ da ∞ − ∞: indeterminación" },
  { expr: "= lim (4x² + 12x − 4x²)/(√(4x² + 12x) + 2x)", note: "Multiplicamos y dividimos por el conjugado" },
  { expr: "= lim 12x/(√(4x² + 12x) + 2x)", note: "Se cancelan los $4x^2$" },
  { expr: "= lim 12x/(x·(√(4 + 12/x) + 2))", note: "Sacamos x de factor común: $√(x^2) = x$ porque x > 0" },
  { expr: "= 12/(2 + 2) = 3", note: "Simplificamos x y usamos que $12/x → 0$" },
];

export const amLimRaices: Lesson = {
  id: "l-am-lim-raices",
  title: "∞ − ∞ y 0/0 con raíces",
  subtitle: "El conjugado como llave",
  subjectId: "am-a",
  topicIds: ["t-am-lim-indeterminadas"],
  estimatedMinutes: 11,
  prerequisites: ["t-limites", "t-factorizacion"],
  cards: [
    intro(
      "Indeterminaciones con raíces",
      "Resolver límites ∞ − ∞ con raíces y límites 0/0 con raíces usando el conjugado.",
      "Son de los límites más pedidos en el primer parcial. La técnica es siempre la misma: una diferencia de cuadrados que «desarma» la raíz.",
    ),
    explain(
      "Dos corredores muy rápidos",
      "Si dos autos van a velocidades enormes, ¿qué distancia hay entre ellos? Que los dos «tiendan a infinito» no dice nada: pueden ir pegados o separarse cada vez más.\n\nPor eso **∞ − ∞ no vale 0**: hay que mirar quién crece más rápido y por cuánto.",
      { tag: "cotidiano" },
    ),
    quiz("Pregunta rápida", {
      id: "q-am-raices-1", subjectId: "am-a", topicId: "t-am-lim-indeterminadas",
      prompt: "Si al reemplazar en un límite obtenés $∞ − ∞$, ¿qué podés concluir?",
      options: ["Nada todavía: es una indeterminación", "El límite es 0", "El límite no existe"],
      answer: 0,
      explanation: "∞ − ∞ es una indeterminación: el resultado puede ser cualquier número, ±∞ o no existir. Hay que transformar la expresión.",
      hints: ["Pensá en $(x + 5) − x$ y en $x^2 − x$ cuando x → ∞.", "El primero da 5 y el segundo da ∞.", "Mismo «∞ − ∞», resultados distintos."],
      errors: { 1: ["limites", "$(x + 5) − x → 5$, no 0. ∞ − ∞ no tiene un valor fijo."], 2: ["limites", "Puede existir: por ejemplo $(x + 5) − x → 5$."] },
    }),
    explain(
      "La herramienta: el conjugado",
      "El conjugado de $√A − B$ es $√A + B$. Multiplicando y dividiendo por él:\n\n$(√A − B)(√A + B) = A − B^2$\n\nLa raíz desaparece del numerador. Si $A$ tiene $x^2$ y $B^2$ también, se cancelan y queda algo que se resuelve sacando x de factor común. Mirá cómo la función se estabiliza en 3:",
      { tag: "matematico", widget: { type: "plot", mode: "free", initial: "sqrt(4x^2 + 12x) - 2x" } },
    ),
    board("Pizarra: ∞ − ∞ con raíz", RAICES_BOARD, "Calculamos $lim_{x→+∞} (√(4x^2 + 12x) − 2x)$.", "Regla útil: $√(k^2x^2 + px + c) − kx → p/(2k)$."),
    example(
      "Ejemplo resuelto: dos raíces",
      "Calculá $lim_{x→+∞} (√(x^2 + 6x) − √(x^2 − 2x + 5))$",
      [
        "Multiplico y divido por $√(x^2 + 6x) + √(x^2 − 2x + 5)$",
        "Numerador: $(x^2 + 6x) − (x^2 − 2x + 5) = 8x − 5$",
        "Saco x: $\\frac{x(8 − 5/x)}{x(√(1 + 6/x) + √(1 − 2/x + 5/x^2))}$",
        "$→ 8/(1 + 1) = 4$",
      ],
      "4",
    ),
    practice("Ejercicio guiado", "am-lim-raices", 1, 5, true),
    explain(
      "0/0 con raíces: el mismo truco",
      "En $lim_{x→4} \\frac{2x − 8}{√(x + 5) − 3}$ reemplazar da 0/0. Multiplicá por $√(x + 5) + 3$:\n\nabajo queda $(x + 5) − 9 = x − 4$, arriba $2(x − 4)(√(x + 5) + 3)$.\n\nSe cancela $(x − 4)$ y queda $2(√(x + 5) + 3) → 2 · 6 = 12$.",
      { tag: "matematico" },
    ),
    practice("Tu turno: 0/0", "am-lim-conjugado", 2, 7),
    explain(
      "Errores típicos",
      "• Decir «∞ − ∞ = 0» o «0/0 = 1».\n• Olvidar que el conjugado **sobrevive**: después de simplificar, $√(x + 5) + 3$ sigue ahí y vale 6, no 3.\n• Sacar $√(4x^2) = 4x$: la raíz también afecta al coeficiente, es $2x$.\n• Si x → −∞, $√(x^2) = |x| = −x$.",
      { tag: "matematico" },
    ),
    practice("Tu turno", "am-lim-raices", 3, 12),
    practice("Mini desafío", "am-lim-raices", 6, 4),
    practice("Desafío 0/0", "am-lim-conjugado", 5, 9),
    summary([
      "∞ − ∞ y 0/0 son indeterminaciones: no tienen valor fijo.",
      "Con raíces, multiplicá y dividí por el conjugado: $(√A − B)(√A + B) = A − B^2$.",
      "En ∞ − ∞, después del conjugado sacá x de factor común.",
      "En 0/0 aparece el factor $(x − a)$ que se cancela; el conjugado queda y se evalúa.",
      "$√(x^2) = |x|$: cuidado con x → −∞.",
    ]),
  ],
  tutor: {
    normal: "Una expresión ∞ − ∞ o 0/0 es una indeterminación: el límite depende de cómo se comparan las partes. Cuando hay raíces, multiplicar y dividir por el conjugado convierte la resta en una diferencia de cuadrados, elimina la raíz del término problemático y deja un cociente que se resuelve factorizando o sacando factor común.",
    simple: "Cuando te da ∞ − ∞ o 0/0, no terminaste: tenés que reescribir. Si hay una raíz restando, multiplicá arriba y abajo por lo mismo pero sumando. La raíz «se va» de un lado y el problema se destraba.",
    nino: "Es como dos personas que suben escaleras mecánicas muy largas: las dos llegan altísimo, pero lo que importa es cuántos escalones de diferencia tienen. El conjugado es la forma de medir esa diferencia sin tener que llegar arriba.",
    ejemplo: "lím (√(x² + 4x) − x) con x → +∞: conjugado → 4x/(√(x² + 4x) + x) → 4/(1 + 1) = 2.",
    visual: { type: "plot", mode: "free", initial: "sqrt(x^2 + 4x) - x" },
    visualText: "Mirá cómo, para x grande, la diferencia se estabiliza en 2 aunque las dos partes crecen sin límite.",
    fromZero: "Un límite pregunta a qué valor se acerca f(x). Si al reemplazar sale un número, listo. Pero hay resultados «trampa»: 0/0, ∞/∞, ∞ − ∞. Se llaman indeterminaciones porque el resultado depende de la expresión concreta. Para resolverlas se reescribe la expresión sin cambiar su valor: factorizar, simplificar o multiplicar por 1 escrito de forma conveniente (el conjugado dividido por sí mismo).",
    why: "Multiplicar y dividir por el conjugado es multiplicar por 1: no cambia la función. Pero transforma √A − B en (A − B²)/(√A + B), donde la resta problemática se cancela de manera exacta.",
    origin: "Sale de la diferencia de cuadrados: (u − v)(u + v) = u² − v². Con u = √A, u² = A y la raíz desaparece.",
    board: RAICES_BOARD,
  },
};

const INF_BOARD: BoardStep[] = [
  { expr: "lim (√(9x² + x) − x)/(2x + 1)", note: "x → −∞: es ∞/∞" },
  { expr: "√(9x² + x) = |x|·√(9 + 1/x)", note: "Sacamos $x^2$ de la raíz: sale $|x|$" },
  { expr: "|x| = −x", note: "Porque x es negativo" },
  { expr: "= lim (−x√(9 + 1/x) − x)/(x(2 + 1/x))", note: "Reemplazamos y sacamos x abajo" },
  { expr: "= lim (−√(9 + 1/x) − 1)/(2 + 1/x)", note: "Simplificamos x" },
  { expr: "= (−3 − 1)/2 = −2", note: "Los términos con 1/x tienden a 0" },
];

export const amLimInfinito: Lesson = {
  id: "l-am-lim-infinito",
  title: "Límites ∞/∞",
  subtitle: "Quién manda cuando x es enorme",
  subjectId: "am-a",
  topicIds: ["t-am-lim-infinito"],
  estimatedMinutes: 10,
  prerequisites: ["t-limites"],
  cards: [
    intro("Límites en el infinito", "Resolver ∞/∞ dividiendo por la mayor potencia, usar «acotada por infinitésimo» y cuidar el signo de √(x²).", "Estos límites deciden asíntotas horizontales y oblicuas, la imagen de una función y la convergencia de series."),
    explain(
      "El término que manda",
      "Con x = 1000, en $3x^2 + 50x$ el primer término vale 3.000.000 y el segundo 50.000. Cuanto más grande x, más irrelevante es el resto.\n\nEn un cociente de polinomios, cuando x → ∞ mandan los términos de **mayor grado** de arriba y de abajo.",
      { tag: "intuitivo" },
    ),
    quiz("Pregunta rápida", {
      id: "q-am-inf-1", subjectId: "am-a", topicId: "t-am-lim-infinito",
      prompt: "¿Cuánto vale $lim_{x→+∞} \\frac{6x^2 − x}{3x^2 + 7}$?",
      options: ["2", "1", "−1/7", "∞"],
      answer: 0,
      explanation: "Mismo grado: cociente de coeficientes principales, 6/3 = 2.",
      hints: ["Dividí todo por $x^2$.", "Quedan $(6 − 1/x)/(3 + 7/x^2)$.", "Los términos con 1/x se van a 0."],
      errors: { 1: ["limites", "∞/∞ no es 1: es una indeterminación."], 2: ["conceptual", "−1/7 sería mirar x → 0. Para x → ∞ mandan las potencias más altas."] },
    }),
    explain(
      "Acotada por infinitésimo",
      "$sen(5x)$ y $cos(5x)$ no tienen límite en ∞: oscilan entre −1 y 1. Pero si los dividís por algo que crece, se apagan:\n\n$\\frac{sen(5x)}{x^2} → 0$ (acotada × algo que tiende a 0).\n\nAsí, $\\frac{5 sen(2x) + 3x^2}{6x^2 − x}$: dividiendo por $x^2$ queda $\\frac{0 + 3}{6} = \\frac{1}{2}$. Mirá la curva acercarse a 0,5:",
      { tag: "matematico", widget: { type: "plot", mode: "free", initial: "(5sin(2x) + 3x^2)/(6x^2 - x)" } },
    ),
    board("Pizarra: raíz con x → −∞", INF_BOARD, "Calculamos $lim_{x→−∞} \\frac{√(9x^2 + x) − x}{2x + 1}$."),
    example(
      "Ejemplo resuelto",
      "Calculá $lim_{x→+∞} \\frac{4x^2 − 3x + 2}{8x^2 + 5}$",
      ["Es ∞/∞: divido por $x^2$", "$\\frac{4 − 3/x + 2/x^2}{8 + 5/x^2}$", "$→ 4/8 = 1/2$"],
      "1/2",
    ),
    practice("Ejercicio guiado", "am-lim-infinito", 1, 3, true),
    explain(
      "Errores típicos",
      "• Decir «∞/∞ = 1».\n• Mirar los términos independientes (eso es x → 0).\n• Concluir «no existe» porque aparece un seno: si está dividido por algo que crece, ese término tiende a 0.\n• Con x → −∞ olvidar que $√(x^2) = −x$.",
      { tag: "matematico" },
    ),
    practice("Tu turno", "am-lim-infinito", 3, 8),
    practice("Tu turno", "am-lim-infinito", 4, 2),
    practice("Mini desafío", "am-lim-infinito", 6, 10),
    summary([
      "∞/∞ es indeterminación: dividí por la mayor potencia del denominador.",
      "Mismo grado → cociente de coeficientes principales; numerador de menor grado → 0.",
      "Acotada × infinitésimo → 0 (por ejemplo $sen(x)/x → 0$ en ∞).",
      "$√(x^2) = |x|$: si x → −∞, sale $−x$.",
    ]),
  ],
  tutor: {
    normal: "Para un cociente ∞/∞ se divide numerador y denominador por la mayor potencia de x que aparece en el denominador; los términos de la forma k/xⁿ tienden a 0. Si aparece una función acotada multiplicada por una que tiende a 0, el producto tiende a 0. Con raíces, √(x²) = |x|, lo que cambia el signo cuando x → −∞.",
    simple: "Cuando x es gigante, solo importan los términos más grandes. Quedate con ellos arriba y abajo y dividí. Si hay un seno o coseno dividido por algo que crece, ese pedazo se hace 0.",
    nino: "Si tenés una montaña de 3 millones de granos de arena y le agregás 50 mil, a lo lejos se ve igual. El término de mayor grado es la montaña; los otros son detalles que dejan de importar.",
    ejemplo: "lím (2x² + 1000x)/(x² − 3) con x → ∞: dividiendo por x² queda (2 + 1000/x)/(1 − 3/x²) → 2.",
    visual: { type: "plot", mode: "free", initial: "(2x^2 + 10x)/(x^2 + 1)" },
    visualText: "Lejos del origen la curva se pega a la recta y = 2: ese es el límite.",
    fromZero: "Una potencia más alta crece mucho más rápido: x² le gana a x, x³ a x². Si dividís un polinomio por la potencia más alta, cada término queda como una constante dividida por alguna potencia de x, y eso se achica a 0. Solo sobreviven los coeficientes de los términos de mayor grado.",
    why: "Dividir arriba y abajo por lo mismo no cambia el cociente, pero convierte todos los términos «chicos» en cosas que tienden a 0 y deja a la vista el resultado.",
    origin: "Viene de que lím k/xⁿ = 0 para n > 0 y de las propiedades del límite de sumas y cocientes. Lo de la acotada sale de encerrarla: −1/x² ≤ sen(x)/x² ≤ 1/x², y ambos extremos tienden a 0.",
    board: INF_BOARD,
  },
};

const E_BOARD: BoardStep[] = [
  { expr: "lim ((x² + 3x + 1)/(x² + 2))^(2x)", note: "La base → 1 y el exponente → ∞: es $1^∞$" },
  { expr: "B − 1 = (x² + 3x + 1 − x² − 2)/(x² + 2)", note: "Restamos 1 con común denominador" },
  { expr: "B − 1 = (3x − 1)/(x² + 2)", note: "Simplificamos el numerador" },
  { expr: "(B − 1)·2x = (6x² − 2x)/(x² + 2)", note: "Multiplicamos por el exponente" },
  { expr: "(B − 1)·2x → 6", note: "∞/∞ de igual grado: 6/1" },
  { expr: "lim = e^6", note: "El límite es $e^{lim (B − 1)·E}$" },
];

export const amLimE: Lesson = {
  id: "l-am-lim-e",
  title: "Límites 1^∞",
  subtitle: "Cuando aparece el número e",
  subjectId: "am-a",
  topicIds: ["t-am-lim-e"],
  estimatedMinutes: 10,
  prerequisites: ["t-am-lim-infinito", "t-potencias"],
  cards: [
    intro("La indeterminación 1^∞", "Reconocer 1^∞ y resolverlo con $e^{lim (B − 1)·E}$, también con parámetros.", "Es un clásico del primer parcial, muchas veces con un parámetro a hallar."),
    explain(
      "El interés compuesto",
      "Un banco te da 100 % anual. Si capitaliza una vez, 1 peso se vuelve 2. Si capitaliza 12 veces, $(1 + 1/12)^{12} ≈ 2,61$. Si capitaliza a cada instante, se acerca a $e ≈ 2,718$.\n\nLa base se acerca a 1, pero el exponente crece: el resultado **no es 1**. Eso es $1^∞$.",
      { tag: "cotidiano", widget: { type: "plot", mode: "free", initial: "(1 + 1/x)^x" } },
    ),
    quiz("Pregunta rápida", {
      id: "q-am-e-1", subjectId: "am-a", topicId: "t-am-lim-e",
      prompt: "¿Cuál de estos límites es de la forma $1^∞$ (con x → +∞)?",
      options: ["$(\\frac{x + 2}{x − 1})^{x}$", "$(\\frac{2x + 1}{x})^{x}$", "$(\\frac{x + 2}{x − 1})^{5}$"],
      answer: 0,
      explanation: "En la primera la base tiende a 1 y el exponente a ∞. En la segunda la base tiende a 2 (da ∞); en la tercera el exponente es fijo (da 1⁵ = 1).",
      hints: ["Calculá por separado el límite de la base y el del exponente.", "Base → 1 y exponente → ∞.", "(2x + 1)/x → 2."],
      errors: { 1: ["limites", "La base tiende a 2, no a 1: es 2^∞ = ∞, no hay indeterminación."], 2: ["limites", "El exponente es 5, fijo: el límite es 1⁵ = 1."] },
    }),
    explain(
      "La fórmula",
      "Si $B → 1$ y $E → ∞$:\n\n$lim B^E = e^{lim (B − 1)·E}$\n\nReceta: (1) verificá que es $1^∞$; (2) calculá $B − 1$ con común denominador; (3) multiplicá por $E$ y calculá ese límite (suele ser un ∞/∞ o un 0/0); (4) el resultado es e elevado a ese número.",
      { tag: "matematico" },
    ),
    board("Pizarra: 1^∞", E_BOARD, "Calculamos $lim_{x→+∞} (\\frac{x^2 + 3x + 1}{x^2 + 2})^{2x}$."),
    example(
      "Ejemplo con parámetro",
      "Hallá $a$ para que $lim_{x→+∞} (\\frac{x + a}{x − 2})^{x} = e^5$",
      ["Es $1^∞$", "$B − 1 = \\frac{a + 2}{x − 2}$", "$(B − 1)·x = \\frac{(a + 2)x}{x − 2} → a + 2$", "$e^{a + 2} = e^5$ ⇒ $a + 2 = 5$ ⇒ $a = 3$"],
      "a = 3",
    ),
    practice("Ejercicio guiado", "am-lim-e", 1, 6, true),
    explain(
      "Errores típicos",
      "• «$1^∞ = 1$»: falso, ya viste que $(1 + 1/n)^n → e$.\n• Calcular mal $B − 1$: es (numerador − denominador)/denominador.\n• Olvidarse de multiplicar por el exponente completo (por ejemplo el 2 de $2x$).\n• En un punto finito (x → 2) también vale la fórmula; ahí $(B − 1)·E$ suele ser un 0/0 que se factoriza.",
      { tag: "matematico" },
    ),
    practice("Tu turno", "am-lim-e", 3, 4),
    practice("Tu turno: en un punto", "am-lim-e", 4, 7),
    practice("Mini desafío", "am-lim-e", 6, 9),
    summary([
      "$1^∞$ es indeterminación: no vale 1.",
      "$lim B^E = e^{lim (B − 1)·E}$.",
      "B − 1 con común denominador; después, límite del producto por E.",
      "Con parámetro: igualá el exponente de e al dato y despejá.",
    ]),
  ],
  tutor: {
    normal: "Si B(x) → 1 y E(x) → ∞, el límite de B^E es indeterminado. Escribiendo B = 1 + (B − 1) y usando lím (1 + u)^{1/u} = e cuando u → 0, se obtiene lím B^E = e^{lím (B − 1)·E}, siempre que ese último límite exista.",
    simple: "Cuando la base se acerca a 1 y el exponente se dispara, el resultado es e elevado a algo. Ese «algo» se calcula como (base − 1) por exponente.",
    nino: "Es como ganar un poquito por día durante muchísimos días: cada día casi no cambia nada (base cerca de 1), pero son tantos días que al final juntás bastante. El número e mide exactamente ese crecimiento.",
    ejemplo: "lím ((x + 1)/x)^{3x} = e^{lím (1/x)·3x} = e³.",
    visual: { type: "plot", mode: "free", initial: "(1 + 1/x)^x" },
    visualText: "La curva (1 + 1/x)^x se acerca a e ≈ 2,718, no a 1.",
    fromZero: "El número e ≈ 2,718 se define como el límite de (1 + 1/n)^n cuando n → ∞. Una base que se acerca a 1 elevada a un exponente que crece puede dar cualquier cosa: 1, e, e⁵, ∞… Por eso se llama indeterminación. La fórmula de la e transforma ese problema en un límite común.",
    why: "Porque B^E = [(1 + (B − 1))^{1/(B − 1)}]^{(B − 1)E}. Lo de adentro de los corchetes tiende a e; todo queda reducido a calcular el límite del exponente (B − 1)·E.",
    origin: "De la definición de e: lím_{u→0} (1 + u)^{1/u} = e. Con u = B − 1 → 0 se reescribe la potencia y se usa la continuidad de la exponencial.",
    board: E_BOARD,
  },
};

const CONT_BOARD: BoardStep[] = [
  { expr: "lim_{x→2⁻} (x² − 4)/(x − 2)", note: "Por izquierda vale el primer tramo: reemplazar da 0/0" },
  { expr: "= lim_{x→2⁻} (x − 2)(x + 2)/(x − 2)", note: "Factorizamos la diferencia de cuadrados" },
  { expr: "= lim_{x→2⁻} (x + 2) = 4", note: "Simplificamos y reemplazamos" },
  { expr: "f(2) = 2a + 2", note: "En x = 2 y a la derecha vale el segundo tramo" },
  { expr: "2a + 2 = 4", note: "Continuidad: límite = valor de la función" },
  { expr: "a = 1", note: "Restamos 2 y dividimos por 2 en ambos lados" },
];

export const amContinuidad: Lesson = {
  id: "l-am-continuidad",
  title: "Continuidad",
  subtitle: "Funciones partidas y parámetros",
  subjectId: "am-a",
  topicIds: ["t-am-continuidad"],
  estimatedMinutes: 10,
  prerequisites: ["t-limites", "t-am-lim-indeterminadas"],
  cards: [
    intro("Continuidad", "La definición de continuidad, los límites laterales y cómo elegir parámetros para que una función partida sea continua.", "En el parcial aparece casi siempre como «hallar a y b para que f sea continua», muchas veces combinada con una indeterminación."),
    explain(
      "Dibujar sin levantar el lápiz",
      "Una función es continua en un punto si al dibujarla podés pasar por ahí sin levantar el lápiz: no hay saltos ni huecos.\n\nMirá $|x|/x$: vale −1 a la izquierda de 0 y 1 a la derecha. En 0 hay un **salto**.",
      { tag: "intuitivo", widget: { type: "plot", mode: "free", initial: "abs(x)/x" } },
    ),
    explain(
      "La definición",
      "f es continua en $x = a$ si se cumplen las tres:\n\n1. existe $f(a)$;\n2. existe $lim_{x→a} f(x)$ (los dos laterales coinciden);\n3. $lim_{x→a} f(x) = f(a)$.\n\nEn una función partida, a cada lado del punto de empalme se usa el tramo que corresponde.",
      { tag: "matematico" },
    ),
    quiz("Pregunta rápida", {
      id: "q-am-cont-1", subjectId: "am-a", topicId: "t-am-continuidad",
      prompt: "Si $f(x) = \\frac{x^2 − 9}{x − 3}$ para $x ≠ 3$ y $f(3) = 0$, ¿es continua en 3?",
      options: ["No: el límite es 6 y f(3) = 0", "Sí: 0/0 = 0", "No: el límite no existe"],
      answer: 0,
      explanation: "Simplificando, el límite es lím (x + 3) = 6. Como f(3) = 0 ≠ 6, no es continua (discontinuidad evitable).",
      hints: ["Calculá el límite factorizando.", "$x^2 − 9 = (x − 3)(x + 3)$.", "Compará el límite con f(3)."],
      errors: { 1: ["limites", "0/0 no es 0: es una indeterminación. El límite vale 6."], 2: ["limites", "El límite existe: factorizando queda x + 3 → 6."] },
    }),
    board("Pizarra: hallar el parámetro", CONT_BOARD, "$f(x) = \\frac{x^2 − 4}{x − 2}$ si $x < 2$; $f(x) = ax + 2$ si $x ≥ 2$. Buscamos a."),
    example(
      "Ejemplo resuelto: tres tramos",
      "$f(x) = \\frac{x^2 − 1}{x − 1}$ si $x < 1$; $ax^2 + 1$ si $1 ≤ x < 2$; $2x − a + b$ si $x ≥ 2$. Hallá a y b.",
      ["En x = 1: $lim_{x→1⁻} (x + 1) = 2$ y $f(1) = a + 1$ ⇒ $a = 1$", "En x = 2: por izquierda $4a + 1 = 5$; $f(2) = 4 − a + b = 3 + b$", "$3 + b = 5$ ⇒ $b = 2$"],
      "a = 1, b = 2",
    ),
    practice("Ejercicio guiado", "am-continuidad-param", 1, 2, true),
    explain(
      "Errores típicos",
      "• Tomar 0/0 como 0 en el tramo con fracción: siempre factorizá.\n• Usar el tramo equivocado: a la izquierda del empalme vale la fórmula de «x < a».\n• Plantear las dos condiciones en el mismo punto: cada empalme da su propia ecuación.\n• Despejar mal: en «$− a + b$», la a resta.",
      { tag: "matematico" },
    ),
    practice("Tu turno", "am-continuidad-param", 3, 6),
    practice("Tu turno", "am-continuidad-param", 4, 13),
    practice("Mini desafío", "am-continuidad-param", 6, 5),
    summary([
      "Continua en a: existe f(a), existe el límite y son iguales.",
      "En funciones partidas, calculá los límites laterales con el tramo de cada lado.",
      "Cada punto de empalme da una ecuación para los parámetros.",
      "Si un tramo da 0/0, factorizá antes de reemplazar.",
    ]),
  ],
  tutor: {
    normal: "f es continua en a si f(a) está definida, el límite de f en a existe y coincide con f(a). Para una función definida por tramos, en cada punto de empalme se calculan los límites laterales con la expresión correspondiente a cada lado y se igualan al valor de la función.",
    simple: "En el punto donde cambia la fórmula, lo que viene de la izquierda, lo que viene de la derecha y el valor exacto tienen que dar el mismo número. Si hay letras, esas igualdades son las ecuaciones para encontrarlas.",
    nino: "Es como unir dos tramos de una ruta: si uno termina a 4 metros de altura y el otro empieza a 6, el auto salta. El parámetro es la altura a la que tenés que construir el segundo tramo para que encajen.",
    ejemplo: "f(x) = x + 1 si x < 2 y f(x) = kx si x ≥ 2: por izquierda → 3; f(2) = 2k. Continua si 2k = 3, o sea k = 3/2.",
    visual: { type: "plot", mode: "free", initial: "abs(x)/x" },
    visualText: "Un salto: los límites laterales son −1 y 1, distintos. No hay valor de f(0) que lo arregle.",
    fromZero: "El límite describe hacia dónde van los valores cerca de un punto; el valor f(a) es lo que pasa exactamente en el punto. Continuidad es la coincidencia de ambas cosas. Si los dos lados se acercan a valores distintos hay un salto; si se acercan al mismo pero f(a) es otro (o no existe) hay un hueco.",
    why: "Muchos teoremas (Weierstrass, Bolzano, el cálculo de áreas) necesitan continuidad. Además, en una función continua el límite se calcula reemplazando, lo que simplifica todo.",
    origin: "La definición formaliza la idea de «sin saltos»: los valores cercanos tienen imágenes cercanas. Con límites eso se escribe lím_{x→a} f(x) = f(a).",
    board: CONT_BOARD,
  },
};

const ASIN_BOARD: BoardStep[] = [
  { expr: "f(x) = (2x² + 3x − 1)/(x + 2)", note: "Grado de arriba = grado de abajo + 1: buscamos asíntota oblicua" },
  { expr: "m = lim f(x)/x = lim (2x² + 3x − 1)/(x² + 2x) = 2", note: "Cociente de coeficientes principales" },
  { expr: "f(x) − 2x = (2x² + 3x − 1 − 2x² − 4x)/(x + 2)", note: "Restamos mx con común denominador" },
  { expr: "f(x) − 2x = (−x − 1)/(x + 2)", note: "Simplificamos el numerador" },
  { expr: "b = lim (−x − 1)/(x + 2) = −1", note: "Otra vez ∞/∞ de igual grado" },
  { expr: "y = 2x − 1", note: "La asíntota oblicua es y = mx + b" },
];

export const amAsintotas: Lesson = {
  id: "l-am-asintotas",
  title: "Asíntotas",
  subtitle: "Las rectas a las que se pega la curva",
  subjectId: "am-a",
  topicIds: ["t-am-asintotas"],
  estimatedMinutes: 10,
  prerequisites: ["t-am-lim-infinito", "t-dominio"],
  cards: [
    intro("Asíntotas", "Encontrar asíntotas verticales, horizontales y oblicuas con límites.", "Son parte del estudio de funciones y ayudan a decidir la imagen. La oblicua es un ejercicio típico del primer parcial."),
    explain(
      "Rectas guía",
      "Una asíntota es una recta a la que el gráfico se acerca tanto como quieras, sin que haga falta tocarla.\n\nMirá $\\frac{2x^2 + 3x − 1}{x + 2}$: cerca de $x = −2$ se dispara (vertical) y lejos se pega a una recta inclinada (oblicua).",
      { tag: "intuitivo", widget: { type: "plot", mode: "free", initial: "(2x^2 + 3x - 1)/(x + 2)" } },
    ),
    explain(
      "Cómo se detectan",
      "• **Vertical** $x = a$: si $lim_{x→a} f(x) = ±∞$ (candidatos: ceros del denominador, bordes del dominio de un ln).\n• **Horizontal** $y = L$: si $lim_{x→±∞} f(x) = L$.\n• **Oblicua** $y = mx + b$: $m = lim \\frac{f(x)}{x}$ (finito y ≠ 0) y $b = lim (f(x) − mx)$.",
      { tag: "matematico" },
    ),
    quiz("Pregunta rápida", {
      id: "q-am-asin-1", subjectId: "am-a", topicId: "t-am-asintotas",
      prompt: "¿$x = 1$ es asíntota vertical de $f(x) = \\frac{x^2 − 1}{x − 1}$?",
      options: ["No: el límite en 1 es 2 (hay un hueco)", "Sí: el denominador se anula en 1", "Sí: f(1) no existe"],
      answer: 0,
      explanation: "Factorizando, f(x) = x + 1 para x ≠ 1: el límite es 2, finito. No hay asíntota, hay un hueco.",
      hints: ["Una asíntota vertical necesita límite infinito.", "Factorizá el numerador.", "Simplificado queda x + 1."],
      errors: { 1: ["limites", "Anular el denominador no alcanza: hay que calcular el límite. Acá da 2."], 2: ["conceptual", "Que f(1) no exista no implica asíntota: el límite es finito."] },
    }),
    board("Pizarra: asíntota oblicua", ASIN_BOARD),
    example(
      "Ejemplo resuelto",
      "Asíntotas de $f(x) = \\frac{3x − 6}{x + 1}$",
      ["Denominador: $x = −1$; numerador ahí vale $−9 ≠ 0$ ⇒ límite ±∞ ⇒ vertical $x = −1$", "$lim_{x→±∞} f(x) = 3$ ⇒ horizontal $y = 3$", "Como hay horizontal, no hay oblicua"],
      "Vertical x = −1; horizontal y = 3",
    ),
    practice("Ejercicio guiado", "am-asintotas", 1, 4, true),
    explain(
      "Errores típicos",
      "• Declarar asíntota vertical en todo cero del denominador sin calcular el límite.\n• Confundir la horizontal con $f(0)$ (eso es la ordenada al origen).\n• En la oblicua, calcular solo m y olvidarse de $b = lim (f(x) − mx)$.\n• Suponer que una horizontal vale para los dos lados: con exponenciales puede existir solo en uno.",
      { tag: "matematico" },
    ),
    practice("Tu turno: oblicua", "am-asintota-oblicua", 2, 3),
    practice("Tu turno", "am-asintotas", 4, 8),
    practice("Mini desafío", "am-asintota-oblicua", 5, 11),
    summary([
      "Vertical x = a: límite infinito en a (no alcanza con anular el denominador).",
      "Horizontal y = L: límite L en +∞ o en −∞ (puede ser de un solo lado).",
      "Oblicua: m = lím f(x)/x, b = lím (f(x) − mx).",
      "Si hay horizontal hacia un lado, no hay oblicua hacia ese lado.",
    ]),
  ],
  tutor: {
    normal: "Una recta es asíntota del gráfico de f si la distancia entre ambos tiende a 0. Las verticales x = a aparecen donde algún límite lateral es infinito; las horizontales y = L cuando f tiende a L en ±∞; las oblicuas y = mx + b cuando f(x) − (mx + b) → 0, lo que da m = lím f(x)/x y b = lím (f(x) − mx).",
    simple: "Son las rectas que «guían» la curva. Verticales: donde la función se dispara. Horizontales: el valor al que se acerca a lo lejos. Oblicuas: una recta inclinada a la que se pega a lo lejos; su pendiente y su ordenada salen de dos límites.",
    nino: "Pensá en un avión que aterriza: se acerca cada vez más a la pista. La pista es la asíntota del recorrido.",
    ejemplo: "f(x) = (x² + 1)/x = x + 1/x: a lo lejos 1/x → 0, así que la asíntota oblicua es y = x. Y en x = 0 hay una vertical.",
    visual: { type: "plot", mode: "free", initial: "(x^2 + 1)/x" },
    visualText: "Lejos del origen la curva se confunde con la recta y = x.",
    fromZero: "Primero el dominio: los puntos que no están (denominador cero, argumento de un ln no positivo) son candidatos a asíntota vertical. Después se calcula el límite ahí: si es infinito, hay asíntota. Para ver qué pasa lejos se calcula el límite en ±∞: un número da horizontal; si crece como una recta, se busca la oblicua.",
    why: "Las asíntotas describen el comportamiento extremo de la función, que es justo lo que hace falta para saber su imagen y para dibujarla sin calcular infinitos puntos.",
    origin: "Si f(x) − (mx + b) → 0, dividiendo por x se obtiene f(x)/x − m → 0, o sea m = lím f(x)/x; y despejando, b = lím (f(x) − mx).",
    board: ASIN_BOARD,
  },
};

// ───────────────────────── am-5 · Derivadas ─────────────────────────

const REGLAS_BOARD: BoardStep[] = [
  { expr: "f(x) = (2x + 1)·e^(3x)", note: "Es un producto: u = 2x + 1, v = $e^{3x}$" },
  { expr: "f′(x) = 2·e^(3x) + (2x + 1)·(e^(3x))′", note: "Regla del producto: u′v + uv′" },
  { expr: "f′(x) = 2·e^(3x) + (2x + 1)·3e^(3x)", note: "Cadena: la derivada de $e^{3x}$ es $3e^{3x}$" },
  { expr: "f′(0) = 2·1 + 1·3·1", note: "Reemplazamos x = 0 (y $e^0 = 1$)" },
  { expr: "f′(0) = 5", note: "Sumamos" },
];

export const amReglasDerivacion: Lesson = {
  id: "l-am-reglas-derivacion",
  title: "Reglas de derivación",
  subtitle: "Producto, cociente y cadena",
  subjectId: "am-a",
  topicIds: ["t-am-reglas-derivacion"],
  estimatedMinutes: 12,
  prerequisites: ["t-derivadas"],
  cards: [
    intro("Derivar cualquier función", "La tabla de derivadas y las reglas del producto, del cociente y de la cadena.", "Todo lo que sigue (tangentes, L'Hôpital, estudio de funciones, Taylor) se apoya en derivar rápido y sin errores."),
    explain(
      "Piezas de Lego",
      "Las funciones del parcial se arman con piezas simples ($x^n$, $e^x$, $ln x$, $sen x$) unidas de tres formas: multiplicando, dividiendo o metiendo una dentro de otra.\n\nPara cada forma de unir hay una regla. Si sabés derivar las piezas y las tres reglas, derivás todo.",
      { tag: "intuitivo" },
    ),
    explain(
      "Tabla básica",
      "$(x^n)′ = nx^{n−1}$ · $(√x)′ = \\frac{1}{2√x}$\n\n$(e^x)′ = e^x$ · $(ln x)′ = \\frac{1}{x}$\n\n$(sen x)′ = cos x$ · $(cos x)′ = −sen x$\n\nMirá cómo la pendiente de la tangente (abajo) dibuja la derivada mientras recorrés la curva:",
      { tag: "matematico", widget: { type: "tangent-sweep", expr: "x^3 - 3x" } },
    ),
    quiz("Pregunta rápida", {
      id: "q-am-reglas-1", subjectId: "am-a", topicId: "t-am-reglas-derivacion",
      prompt: "¿Cuál es la derivada de $x^2·e^x$?",
      options: ["$2x·e^x + x^2·e^x$", "$2x·e^x$", "$x^2·e^x$"],
      answer: 0,
      explanation: "Regla del producto: (uv)′ = u′v + uv′ = 2x·eˣ + x²·eˣ.",
      hints: ["Es un producto de dos funciones.", "(uv)′ = u′v + uv′.", "u = x², v = eˣ."],
      errors: { 1: ["derivacion", "La derivada de un producto no es el producto de las derivadas: falta el término u·v′."] },
    }),
    explain(
      "Las tres reglas",
      "**Producto:** $(u·v)′ = u′·v + u·v′$\n\n**Cociente:** $(\\frac{u}{v})′ = \\frac{u′·v − u·v′}{v^2}$\n\n**Cadena:** $(f(g(x)))′ = f′(g(x))·g′(x)$: se deriva la de afuera dejando adentro igual, y se multiplica por la derivada de adentro. Por ejemplo $(e^{3x})′ = e^{3x}·3$ y $(ln(x^2 + 1))′ = \\frac{2x}{x^2 + 1}$.",
      { tag: "matematico" },
    ),
    board("Pizarra: producto con cadena", REGLAS_BOARD, "Calculamos $f′(0)$ para $f(x) = (2x + 1)e^{3x}$."),
    example(
      "Ejemplo resuelto: cociente",
      "Si $f(x) = \\frac{3x − 1}{x^2 + 1}$, calculá $f′(1)$",
      ["$f′(x) = \\frac{3(x^2 + 1) − (3x − 1)·2x}{(x^2 + 1)^2}$", "En x = 1: numerador $3·2 − 2·2 = 2$", "Denominador $2^2 = 4$", "$f′(1) = 2/4 = 1/2$"],
      "1/2",
    ),
    practice("Ejercicio guiado", "am-derivada-reglas", 1, 3, true),
    explain(
      "Errores típicos",
      "• Derivar un producto como producto de derivadas.\n• Invertir el orden en el cociente: es $u′v − uv′$, con la derivada del numerador primero.\n• Olvidar la derivada de adentro: $(e^{5x})′ = 5e^{5x}$, no $e^{5x}$.\n• Reemplazar el punto antes de derivar: primero se deriva, después se evalúa.",
      { tag: "matematico" },
    ),
    practice("Tu turno", "am-derivada-reglas", 3, 9),
    practice("Tu turno", "am-derivada-reglas", 4, 14),
    practice("Mini desafío", "am-derivada-reglas", 6, 7),
    summary([
      "Tabla: (xⁿ)′ = nxⁿ⁻¹, (eˣ)′ = eˣ, (ln x)′ = 1/x, (sen x)′ = cos x, (cos x)′ = −sen x.",
      "Producto: u′v + uv′.",
      "Cociente: (u′v − uv′)/v².",
      "Cadena: f′(g(x))·g′(x).",
      "Primero derivar, después reemplazar.",
    ]),
  ],
  tutor: {
    normal: "Las reglas de derivación permiten derivar funciones construidas con operaciones: la derivada de un producto es u′v + uv′, la de un cociente (u′v − uv′)/v² y la de una composición f′(g(x))·g′(x). Junto con la tabla de derivadas de las funciones elementales alcanzan para derivar cualquier función del programa.",
    simple: "Mirá cómo está armada la función. ¿Es algo por algo? Producto. ¿Algo sobre algo? Cociente. ¿Una función con otra adentro? Cadena: derivás la de afuera y multiplicás por la derivada de lo de adentro.",
    nino: "Es como un juego de engranajes: si el engranaje de adentro gira 3 veces más rápido, el de afuera hereda ese ×3. La regla de la cadena multiplica las velocidades de cada engranaje.",
    ejemplo: "f(x) = (x² + 1)³: f′(x) = 3(x² + 1)²·2x. En x = 1: 3·4·2 = 24.",
    visual: { type: "tangent-sweep", expr: "x^3 - 3x" },
    visualText: "La pendiente de la tangente en cada punto es el valor de la derivada: el gráfico de abajo es f′.",
    fromZero: "La derivada mide cuánto cambia una función por cada unidad que cambia x, en un instante. Para funciones simples ya hay fórmulas (la tabla). Las funciones complicadas son combinaciones de simples, y las reglas dicen cómo se combinan las derivadas: no se puede derivar «pedazo por pedazo» multiplicando, hay que seguir la regla.",
    why: "Si u y v cambian a la vez, el producto cambia por dos motivos: porque cambia u (u′v) y porque cambia v (uv′). Por eso son dos términos.",
    origin: "Del cociente incremental: [u(x+h)v(x+h) − u(x)v(x)]/h = [u(x+h) − u(x)]/h·v(x+h) + u(x)·[v(x+h) − v(x)]/h → u′v + uv′. La cadena sale de multiplicar y dividir por g(x+h) − g(x).",
    board: REGLAS_BOARD,
  },
};

const TAN_BOARD: BoardStep[] = [
  { expr: "y = 2x − 1 ⇒ f′(1) = 2, f(1) = 2·1 − 1 = 1", note: "La tangente de f en 1 da la pendiente y el punto" },
  { expr: "h(x) = 2 + f(3x + e^x)", note: "En x = 0 el argumento vale $3·0 + e^0 = 1$" },
  { expr: "h′(x) = f′(3x + e^x)·(3 + e^x)", note: "Regla de la cadena" },
  { expr: "h′(0) = f′(1)·(3 + 1) = 2·4 = 8", note: "Reemplazamos x = 0" },
  { expr: "h(0) = 2 + f(1) = 3", note: "El punto de tangencia es (0, 3)" },
  { expr: "y = 8x + 3", note: "y = h′(0)(x − 0) + h(0)" },
];

export const amRectaTangente: Lesson = {
  id: "l-am-recta-tangente",
  title: "Recta tangente",
  subtitle: "Punto y pendiente, también con datos de f",
  subjectId: "am-a",
  topicIds: ["t-am-recta-tangente"],
  estimatedMinutes: 11,
  prerequisites: ["t-am-reglas-derivacion", "t-recta"],
  cards: [
    intro("Recta tangente", "Escribir la recta tangente a una función, también cuando f no es conocida y solo te dan SU recta tangente.", "Es un ejercicio fijo del primer parcial: combina regla de la cadena con la lectura correcta de los datos."),
    explain(
      "Una lupa muy potente",
      "Si hacés zoom sobre una curva suave en un punto, cada vez se parece más a una recta. Esa recta es la **tangente**: la mejor aproximación lineal de la función cerca del punto.\n\nMové el punto y mirá cómo la tangente acompaña a la curva:",
      { tag: "intuitivo", widget: { type: "tangent", initial: "x^3 - 2x" } },
    ),
    explain(
      "La fórmula",
      "La tangente al gráfico de f en $x_0$ pasa por $(x_0, f(x_0))$ con pendiente $f′(x_0)$:\n\n$y = f′(x_0)(x − x_0) + f(x_0)$\n\nY al revés: si te dicen que la tangente a f en $x_1$ es $y = mx + n$, entonces $f′(x_1) = m$ y $f(x_1) = m·x_1 + n$ (no n).",
      { tag: "matematico" },
    ),
    quiz("Pregunta rápida", {
      id: "q-am-tan-1", subjectId: "am-a", topicId: "t-am-recta-tangente",
      prompt: "La recta tangente a f en $x = 3$ es $y = 2x − 5$. ¿Cuánto vale $f(3)$?",
      options: ["1", "−5", "2"],
      answer: 0,
      explanation: "El punto de tangencia está sobre la recta: f(3) = 2·3 − 5 = 1. La pendiente 2 es f′(3).",
      hints: ["La recta y la función se tocan en x = 3.", "Evaluá la recta en x = 3.", "2·3 − 5."],
      errors: { 1: ["interpretacion", "−5 es el valor de la recta en x = 0, no en x = 3."], 2: ["interpretacion", "2 es la pendiente, o sea f′(3)."] },
    }),
    example(
      "Ejemplo resuelto",
      "Recta tangente a $f(x) = x^3 − 2x$ en $x_0 = 1$",
      ["$f(1) = 1 − 2 = −1$", "$f′(x) = 3x^2 − 2$ ⇒ $f′(1) = 1$", "$y = 1·(x − 1) + (−1)$", "$y = x − 2$"],
      "y = x − 2",
    ),
    board("Pizarra: tangente a una composición", TAN_BOARD, "La tangente a f en $x = 1$ es $y = 2x − 1$. Buscamos la tangente a $h(x) = 2 + f(3x + e^x)$ en $x = 0$."),
    practice("Ejercicio guiado", "am-tangente-datos", 1, 8, true),
    explain(
      "Errores típicos",
      "• Tomar $f(x_1) = n$: n es el valor de la recta en 0.\n• Olvidar la derivada de adentro: $h′(0) = f′(1)·g′(0)$.\n• Derivar $e^{2x}$ como $e^{2x}$ (falta el 2).\n• Escribir $y = f′(x_0)·x + f(x_0)$: falta el $− x_0$.",
      { tag: "matematico" },
    ),
    practice("Tu turno", "am-tangente", 2, 5),
    practice("Tu turno", "am-tangente-datos", 3, 4),
    practice("Mini desafío", "am-tangente-datos", 5, 10),
    summary([
      "Tangente en x₀: y = f′(x₀)(x − x₀) + f(x₀).",
      "Si la tangente a f en x₁ es y = mx + n: f′(x₁) = m y f(x₁) = m·x₁ + n.",
      "Para composiciones: regla de la cadena y buscar dónde el argumento vale x₁.",
      "Tangente horizontal ⇔ f′(x₀) = 0.",
    ]),
  ],
  tutor: {
    normal: "La recta tangente al gráfico de f en x₀ es la recta que pasa por (x₀, f(x₀)) con pendiente f′(x₀): y = f′(x₀)(x − x₀) + f(x₀). Cuando la información de f viene dada por su recta tangente, de ella se obtienen tanto f(x₁) como f′(x₁).",
    simple: "Necesitás dos cosas: un punto y una pendiente. El punto es (x₀, f(x₀)); la pendiente es la derivada en x₀. Con eso armás la recta.",
    nino: "Imaginá una bicicleta sobre una loma. Justo en el punto donde está la rueda, el piso parece una rampa recta. Esa rampa es la tangente: misma altura y misma inclinación que la loma en ese lugar.",
    ejemplo: "f(x) = x² en x₀ = 3: f(3) = 9, f′(3) = 6 → y = 6(x − 3) + 9 = 6x − 9.",
    visual: { type: "tangent", initial: "x^3 - 2x" },
    visualText: "Mové el punto: la recta naranja siempre toca la curva y tiene su misma inclinación.",
    fromZero: "Una recta queda determinada por un punto y una pendiente: y = m(x − x₀) + y₀. Para la tangente, el punto es el de la curva, (x₀, f(x₀)), y la pendiente es la derivada f′(x₀), que mide la inclinación de la curva justo ahí.",
    why: "La tangente es la mejor aproximación lineal de f cerca de x₀: permite estimar valores y es la base del polinomio de Taylor.",
    origin: "La derivada se define como el límite de las pendientes de rectas secantes por (x₀, f(x₀)) y (x₀ + h, f(x₀ + h)). Cuando h → 0, la secante se vuelve tangente y su pendiente es f′(x₀).",
    board: TAN_BOARD,
  },
};

const DERIV_BOARD: BoardStep[] = [
  { expr: "x ≤ 1: f(x) = x² + 1;  x > 1: f(x) = ax + b", note: "Buscamos a y b para que f sea derivable en 1" },
  { expr: "(x² + 1)′ = 2x → 2", note: "Derivada por izquierda en x = 1" },
  { expr: "(ax + b)′ = a", note: "Derivada por derecha" },
  { expr: "a = 2", note: "Las derivadas laterales tienen que coincidir" },
  { expr: "1² + 1 = 2·1 + b", note: "Además tiene que ser continua en 1" },
  { expr: "b = 0", note: "Restamos 2 en ambos lados" },
];

export const amDerivabilidad: Lesson = {
  id: "l-am-derivabilidad",
  title: "Derivabilidad",
  subtitle: "Cuándo existe la derivada",
  subjectId: "am-a",
  topicIds: ["t-am-derivabilidad"],
  estimatedMinutes: 9,
  prerequisites: ["t-am-continuidad", "t-am-reglas-derivacion"],
  cards: [
    intro("Derivabilidad", "Decidir si una función es derivable en un punto: por definición o en el empalme de una función partida.", "Aparece en el parcial con parámetros y, a veces, con funciones donde las reglas no alcanzan y hay que usar la definición."),
    explain(
      "Puntas y saltos",
      "Una función es derivable donde su gráfico es «suave». Si hay un salto, no hay derivada; si hay una **punta** (como $|x − 1|$ en 1), tampoco: desde cada lado la pendiente es distinta.",
      { tag: "intuitivo", widget: { type: "plot", mode: "free", initial: "abs(x - 1)" } },
    ),
    quiz("Pregunta rápida", {
      id: "q-am-deriv-1", subjectId: "am-a", topicId: "t-am-derivabilidad",
      prompt: "¿Es $f(x) = |x − 1|$ derivable en $x = 1$?",
      options: ["No: las pendientes laterales son −1 y 1", "Sí, porque es continua", "Sí, f′(1) = 0"],
      answer: 0,
      explanation: "A la izquierda f(x) = 1 − x (pendiente −1) y a la derecha f(x) = x − 1 (pendiente 1). No coinciden: no es derivable, aunque es continua.",
      hints: ["Escribí |x − 1| sin valor absoluto a cada lado.", "Mirá la pendiente a la izquierda y a la derecha.", "−1 ≠ 1."],
      errors: { 1: ["conceptual", "Continua no implica derivable: |x − 1| es continua pero tiene una punta."], 2: ["derivacion", "En la punta no hay una única pendiente: las laterales son −1 y 1."] },
    }),
    explain(
      "Definición y consecuencia",
      "$f′(a) = lim_{h→0} \\frac{f(a + h) − f(a)}{h}$, si ese límite existe.\n\n**Derivable ⇒ continua.** Por eso, en una función partida con parámetros, pedís dos cosas en el empalme: continuidad y derivadas laterales iguales.\n\nSi las reglas dan algo sin límite (como $cos(1/x)$), usá la definición.",
      { tag: "matematico" },
    ),
    board("Pizarra: parámetros para derivabilidad", DERIV_BOARD),
    example(
      "Ejemplo resuelto: por definición",
      "¿Es derivable en 0 la función $f(x) = x^2 sen(1/x)$ si $x ≠ 0$, $f(0) = 0$?",
      ["$\\frac{f(h) − f(0)}{h} = \\frac{h^2 sen(1/h)}{h} = h·sen(1/h)$", "Acotada por algo que tiende a 0 ⇒ el límite es 0", "Sí: $f′(0) = 0$"],
      "Sí, f′(0) = 0",
    ),
    practice("Ejercicio guiado", "am-derivabilidad", 1, 3, true),
    explain(
      "Errores típicos",
      "• Pedir solo derivadas iguales y olvidar la continuidad (o al revés).\n• Igualar los valores de los tramos cuando se pide igualar sus derivadas.\n• Derivar con reglas $x^2 sen(1/x)$, ver que $cos(1/x)$ no tiene límite y concluir «no es derivable»: por definición sí lo es.",
      { tag: "matematico" },
    ),
    practice("Tu turno", "am-derivabilidad", 3, 7),
    practice("Mini desafío", "am-derivabilidad", 6, 2),
    summary([
      "f′(a) = lím (f(a + h) − f(a))/h, si existe.",
      "Derivable ⇒ continua (no al revés: |x| es continua y no derivable en 0).",
      "Empalme con parámetros: continuidad + derivadas laterales iguales.",
      "Si las reglas no deciden, usá la definición.",
    ]),
  ],
  tutor: {
    normal: "f es derivable en a si existe el límite del cociente incremental [f(a + h) − f(a)]/h cuando h → 0. La derivabilidad implica continuidad. En una función definida por tramos, en el punto de empalme se exige continuidad e igualdad de las derivadas laterales.",
    simple: "Derivable = el gráfico es suave en ese punto: sin saltos y sin puntas. En una función partida: que los tramos se peguen (mismo valor) y que lleguen con la misma inclinación (misma derivada).",
    nino: "Dos tramos de tobogán: si se pegan pero con distinta inclinación, el que baja siente un golpe en la unión. Para que no haya golpe tienen que tener la misma altura Y la misma inclinación.",
    ejemplo: "f(x) = x² si x ≤ 2 y ax + b si x > 2: derivadas 4 = a; continuidad 4 = 2a + b → b = −4.",
    visual: { type: "plot", mode: "free", initial: "abs(x - 1)" },
    visualText: "En x = 1 la curva hace punta: no hay una sola recta tangente.",
    fromZero: "La derivada en un punto es el límite de las pendientes de rectas secantes. Ese límite puede no existir: si hay un salto las secantes se vuelven verticales, y si hay una punta las pendientes de un lado y del otro tienden a números distintos.",
    why: "Muchas propiedades (recta tangente, extremos por f′ = 0, Taylor) necesitan derivabilidad. En las funciones partidas, es la condición para que el empalme sea «suave».",
    origin: "Que derivable implique continua sale de f(a + h) − f(a) = [(f(a + h) − f(a))/h]·h → f′(a)·0 = 0.",
    board: DERIV_BOARD,
  },
};

// ───────────────────────── am-6 · L'Hôpital ─────────────────────────

const LH_BOARD: BoardStep[] = [
  { expr: "lim (cos(4x) − 1)/x²", note: "En x = 0 da (1 − 1)/0 = 0/0" },
  { expr: "= lim (−4 sen(4x))/(2x)", note: "L'Hôpital: derivamos arriba y abajo por separado" },
  { expr: "= lim (−4 sen(4x))/(2x)  → 0/0", note: "Sigue indeterminado: aplicamos otra vez" },
  { expr: "= lim (−16 cos(4x))/2", note: "Derivamos de nuevo: $(sen 4x)′ = 4cos 4x$" },
  { expr: "= −16/2 = −8", note: "Ahora sí reemplazamos x = 0" },
];

export const amLhopital: Lesson = {
  id: "l-am-lhopital",
  title: "Regla de L'Hôpital",
  subtitle: "Derivar para destrabar 0/0 y ∞/∞",
  subjectId: "am-a",
  topicIds: ["t-am-lhopital"],
  estimatedMinutes: 10,
  prerequisites: ["t-am-reglas-derivacion", "t-am-lim-indeterminadas"],
  cards: [
    intro("L'Hôpital", "Usar derivadas para calcular límites 0/0 y ∞/∞, aplicarla dos veces y usarla con parámetros o con f abstracta.", "En los parciales aparece en continuidad con parámetro, en límites con integrales (TFC) y con funciones abstractas."),
    explain(
      "Comparar velocidades",
      "Cuando numerador y denominador tienden a 0 a la vez, el cociente depende de **qué tan rápido** se acerca cada uno. Y la rapidez la mide la derivada.\n\nPor eso, cerca del punto, $\\frac{f(x)}{g(x)} ≈ \\frac{f′(x)}{g′(x)}$.",
      { tag: "intuitivo" },
    ),
    explain(
      "La regla",
      "Si $lim \\frac{f}{g}$ es 0/0 o ∞/∞, y existe $lim \\frac{f′}{g′}$, entonces\n\n$lim \\frac{f}{g} = lim \\frac{f′}{g′}$\n\nSe derivan **por separado** (no es la regla del cociente). Si vuelve a dar 0/0, se aplica de nuevo. Mirá cómo $\\frac{cos(4x) − 1}{x^2}$ se acerca a −8 cerca de 0:",
      { tag: "matematico", widget: { type: "plot", mode: "free", initial: "(cos(4x) - 1)/x^2" } },
    ),
    quiz("Pregunta rápida", {
      id: "q-am-lh-1", subjectId: "am-a", topicId: "t-am-lhopital",
      prompt: "¿Se puede aplicar L'Hôpital a $lim_{x→1} \\frac{x + 1}{x}$?",
      options: ["No: no es indeterminado, el límite es 2", "Sí, y da 1", "Sí, y da 2"],
      answer: 0,
      explanation: "Reemplazando da 2/1 = 2. No hay indeterminación; L'Hôpital daría 1/1 = 1, que es INCORRECTO.",
      hints: ["Primero reemplazá.", "¿Da 0/0 o ∞/∞?", "2/1 no es indeterminado."],
      errors: { 1: ["limites", "Aplicar L'Hôpital sin indeterminación da cualquier cosa: el límite es 2."] },
    }),
    board("Pizarra: L'Hôpital dos veces", LH_BOARD, "Calculamos $lim_{x→0} \\frac{cos(4x) − 1}{x^2}$."),
    example(
      "Ejemplo resuelto",
      "Calculá $lim_{x→0} \\frac{e^{2x} − 1}{sen(3x)}$",
      ["En 0: $\\frac{1 − 1}{0}$ = 0/0", "L'Hôpital: $\\frac{2e^{2x}}{3cos(3x)}$", "En 0: $\\frac{2·1}{3·1} = \\frac{2}{3}$"],
      "2/3",
    ),
    practice("Ejercicio guiado", "am-lhopital", 1, 2, true),
    explain(
      "Errores típicos",
      "• Aplicarla sin verificar la indeterminación.\n• Usar la regla del cociente: se derivan numerador y denominador por separado.\n• Cortar después de una aplicación cuando sigue 0/0.\n• Olvidar la cadena: $(cos 4x)′ = −4 sen 4x$.\n• Con f abstracta: si el límite es finito y el denominador → 0, el numerador también → 0 (eso da f(1) = 0).",
      { tag: "matematico" },
    ),
    practice("Tu turno", "am-lhopital", 3, 6),
    practice("Tu turno", "am-lhopital", 4, 11),
    practice("Mini desafío", "am-lhopital", 6, 3),
    summary([
      "Solo para 0/0 o ∞/∞: verificá siempre antes.",
      "lím f/g = lím f′/g′ (derivadas por separado).",
      "Si sigue 0/0, aplicá de nuevo.",
      "Continuidad con parámetro: el valor en el punto es el límite que calcula L'Hôpital.",
    ]),
  ],
  tutor: {
    normal: "La regla de L'Hôpital afirma que si f(x)/g(x) presenta una indeterminación 0/0 o ∞/∞ en a, y existe el límite de f′(x)/g′(x), entonces ambos límites coinciden. Puede aplicarse reiteradamente mientras persista la indeterminación.",
    simple: "Si al reemplazar te da 0/0 (o ∞/∞), derivás arriba, derivás abajo y volvés a reemplazar. Si sigue 0/0, repetís.",
    nino: "Dos autos llegan a la misma meta al mismo tiempo. Para saber cuál «iba más rápido» al llegar no mirás dónde están (los dos en la meta), mirás sus velocímetros. Las derivadas son esos velocímetros.",
    ejemplo: "lím_{x→0} sen(5x)/x: 0/0 → 5cos(5x)/1 → 5.",
    visual: { type: "plot", mode: "free", initial: "sin(5x)/x" },
    visualText: "Cerca de 0 la curva se acerca a 5, el valor que da L'Hôpital.",
    fromZero: "Un cociente 0/0 puede valer cualquier cosa: depende de cómo se acercan a 0 el numerador y el denominador. Cerca del punto, cada función se parece a su recta tangente: f(x) ≈ f′(a)(x − a) y g(x) ≈ g′(a)(x − a). Al dividir, el (x − a) se cancela y queda f′(a)/g′(a).",
    why: "Reemplaza un límite difícil por otro que suele ser más fácil, usando solo derivadas, que ya sabemos calcular.",
    origin: "Sale de aproximar f y g por sus rectas tangentes (o, formalmente, del teorema del valor medio de Cauchy): [f(x) − f(a)]/[g(x) − g(a)] = f′(c)/g′(c) para algún c entre a y x.",
    board: LH_BOARD,
  },
};

// ───────────────────────── am-7 · Estudio de funciones ─────────────────────────

const ESTUDIO_BOARD: BoardStep[] = [
  { expr: "f(x) = ln(x − 1) + 3/(x − 1)", note: "Dominio: $x − 1 > 0$, o sea $(1; +∞)$", figure: { kind: "plot", x: [0, 10], y: [-1, 7], fns: [{ expr: "ln(x-1)+3/(x-1)", label: "f" }] } },
  { expr: "f′(x) = 1/(x − 1) − 3/(x − 1)²", note: "Derivamos cada término" },
  { expr: "f′(x) = (x − 4)/(x − 1)²", note: "Común denominador" },
  { expr: "f′ < 0 en (1; 4),  f′ > 0 en (4; +∞)", note: "El denominador es positivo: manda x − 4" },
  { expr: "f(4) = ln 3 + 1", note: "Mínimo local en x = 4: evaluamos f", figure: { kind: "plot", x: [0, 10], y: [-1, 7], fns: [{ expr: "ln(x-1)+3/(x-1)", label: "f" }], points: [{ x: 4, y: 2.0986, label: "mínimo (4; 1 + ln 3)" }], tangent: { expr: "ln(x-1)+3/(x-1)", x: 4 } } },
  { expr: "x → 1⁺: f → +∞;  x → +∞: f → +∞", note: "Límites en los bordes del dominio" },
  { expr: "Im f = [1 + ln 3; +∞)", note: "El mínimo se alcanza: corchete" },
];

export const amEstudioFuncion: Lesson = {
  id: "l-am-estudio-funcion",
  title: "Estudio de funciones",
  subtitle: "Dominio, crecimiento, extremos e imagen",
  subjectId: "am-a",
  topicIds: ["t-am-estudio-funcion"],
  estimatedMinutes: 12,
  prerequisites: ["t-am-reglas-derivacion", "t-dominio", "t-am-asintotas"],
  cards: [
    intro("Estudio de función", "Con f′ decidir dónde crece y decrece f, sus extremos, su imagen y cuántas veces corta una recta horizontal.", "Es el ejercicio más pesado del primer parcial (varios puntos, en opción múltiple). Los distractores salen de saltear un paso."),
    explain(
      "Subidas y bajadas",
      "Recorré la curva de izquierda a derecha. Donde la tangente sube, $f′ > 0$ y la función **crece**; donde baja, $f′ < 0$ y **decrece**. Donde cambia de subir a bajar hay un máximo; de bajar a subir, un mínimo.",
      { tag: "intuitivo", widget: { type: "tangent-sweep", expr: "4x/(x^2 + 4)" } },
    ),
    explain(
      "El procedimiento",
      "1. **Dominio** (log: argumento > 0; denominador ≠ 0).\n2. **f′**, factorizada o como una sola fracción.\n3. **Ceros de f′** y tabla de signos (solo dentro del dominio).\n4. **Extremos**: abscisa x₀ y valor f(x₀).\n5. **Límites** en los bordes del dominio.\n6. **Imagen**, combinando 4 y 5.",
      { tag: "matematico" },
    ),
    quiz("Pregunta rápida", {
      id: "q-am-est-1", subjectId: "am-a", topicId: "t-am-estudio-funcion",
      prompt: "f tiene un mínimo en $x = 6$ con $f(6) = 3$, y tiende a +∞ en los dos bordes de su dominio. ¿Cuál es su imagen?",
      options: ["$[3; +∞)$", "$[6; +∞)$", "$(3; +∞)$"],
      answer: 0,
      explanation: "La imagen son valores de f: arranca en el valor mínimo 3 (que se alcanza, corchete) y sube sin tope.",
      hints: ["La imagen está formada por valores de f, no de x.", "El valor mínimo es f(6).", "Si se alcanza, va con corchete."],
      errors: { 1: ["interpretacion", "6 es la abscisa del mínimo. La imagen empieza en el VALOR f(6) = 3."], 2: ["limites", "El mínimo se alcanza en x = 6: el 3 pertenece a la imagen."] },
    }),
    board("Pizarra: estudio completo", ESTUDIO_BOARD),
    example(
      "Ejemplo resuelto",
      "Estudiá $f(x) = \\frac{4x}{x^2 + 4}$",
      ["Dominio ℝ. $f′(x) = \\frac{4(4 − x^2)}{(x^2 + 4)^2}$", "Crece en $(−2; 2)$; decrece en $(−∞; −2)$ y $(2; +∞)$", "Mín. en x = −2 ($f = −1$); máx. en x = 2 ($f = 1$)", "$lim_{x→±∞} f = 0$ ⇒ Im f = $[−1; 1]$", "La recta y = 1 la corta una vez; y = 0,5 dos veces; y = 2 ninguna"],
      "Im f = [−1; 1]",
    ),
    practice("Ejercicio guiado", "am-estudio-funcion", 1, 4, true),
    explain(
      "Las trampas del parcial",
      "• Intervalos que se salen del dominio, como $(−∞; 4)$ si el dominio es $(1; +∞)$.\n• Confundir abscisa con ordenada: $[4; +∞)$ en vez de $[f(4); +∞)$.\n• Bordes: un límite en ±∞ **no se alcanza** (paréntesis); un extremo sí (corchete).\n• Un máximo local no es absoluto si f → +∞ en algún borde.",
      { tag: "matematico" },
    ),
    practice("Tu turno", "am-estudio-funcion", 3, 7),
    practice("Tu turno", "am-estudio-funcion", 4, 12),
    practice("Mini desafío: cortes", "am-estudio-funcion", 6, 5),
    summary([
      "Siempre empezá por el dominio.",
      "f′ > 0: crece; f′ < 0: decrece. Los cambios de signo dan los extremos.",
      "Extremo = abscisa x₀ y valor f(x₀): no los confundas.",
      "Imagen: valores en los extremos + límites en los bordes (que no se alcanzan).",
      "Cortes con y = c: ubicá c respecto de los valores extremos y de los límites.",
    ]),
  ],
  tutor: {
    normal: "El signo de f′ determina la monotonía: si f′ > 0 en un intervalo, f es creciente allí; si f′ < 0, decreciente. Los puntos críticos donde f′ cambia de signo son extremos locales. La imagen se obtiene combinando los valores en los extremos con los límites en los bordes del dominio.",
    simple: "Sacás el dominio, derivás, ves dónde la derivada es positiva (sube) o negativa (baja). Donde cambia hay un pico o un pozo; calculás cuánto vale ahí. Después mirás qué pasa en las puntas del dominio y armás la imagen.",
    nino: "Es como describir una caminata por la montaña: dónde subiste, dónde bajaste, cuál fue la cima, cuál el valle y entre qué alturas anduviste. La derivada te dice si en cada momento subías o bajabas.",
    ejemplo: "f(x) = x² − 4x: f′ = 2x − 4, negativa si x < 2 y positiva si x > 2. Mínimo en x = 2 con f(2) = −4. Imagen [−4; +∞).",
    visual: { type: "tangent-sweep", expr: "4x/(x^2 + 4)" },
    visualText: "Arriba la función, abajo su derivada: donde f′ cruza el cero, f tiene un máximo o un mínimo.",
    fromZero: "Una función crece si al aumentar x aumenta f(x). La derivada es la pendiente de la tangente: positiva significa que la curva sube. Por eso alcanza con estudiar el signo de f′, que suele ser una fracción: se buscan sus ceros y se prueba un valor en cada tramo.",
    why: "Con unos pocos cálculos se conoce la forma completa de la función sin graficar punto por punto, y eso permite responder preguntas como «¿cuántas soluciones tiene f(x) = c?».",
    origin: "Del teorema del valor medio: f(b) − f(a) = f′(c)(b − a). Si f′ > 0 en todo el intervalo, b > a implica f(b) > f(a), o sea f crece.",
    board: ESTUDIO_BOARD,
  },
};

const ABS_BOARD: BoardStep[] = [
  { expr: "f(x) = x² − 6 ln x  en [1; e]", note: "Continua en un cerrado: Weierstrass garantiza máximo y mínimo" },
  { expr: "f′(x) = 2x − 6/x = 0", note: "Buscamos puntos críticos" },
  { expr: "x² = 3  →  x = √3 ≈ 1,73", note: "$−√3$ no está en el intervalo" },
  { expr: "f(1) = 1", note: "Evaluamos el borde izquierdo" },
  { expr: "f(√3) = 3 − 3 ln 3 ≈ −0,30", note: "Evaluamos el punto crítico" },
  { expr: "f(e) = e² − 6 ≈ 1,39", note: "Evaluamos el borde derecho" },
  { expr: "máx en x = e;  mín en x = √3", note: "Comparamos los tres valores" },
];

export const amExtremosAbsolutos: Lesson = {
  id: "l-am-extremos-absolutos",
  title: "Extremos absolutos",
  subtitle: "Máximo y mínimo en un intervalo cerrado",
  subjectId: "am-a",
  topicIds: ["t-am-extremos-absolutos"],
  estimatedMinutes: 8,
  prerequisites: ["t-am-estudio-funcion"],
  cards: [
    intro("Extremos absolutos", "Encontrar el mayor y el menor valor de una función continua en [a; b].", "Es un ejercicio corto y frecuente del primer parcial, con una trampa: muchas veces el máximo está en un borde."),
    explain(
      "El punto más alto del recorrido",
      "Si caminás por un sendero entre dos carteles, el punto más alto puede ser una cima… o uno de los carteles, si el camino sube todo el tiempo hacia ese lado.\n\nPor eso no alcanza con buscar donde $f′ = 0$: también hay que mirar los **bordes**.",
      { tag: "cotidiano", widget: { type: "plot", mode: "free", initial: "x^2 - 6ln(x)" } },
    ),
    explain(
      "El método",
      "**Weierstrass:** si f es continua en $[a; b]$, alcanza un máximo y un mínimo absolutos.\n\n1. Puntos críticos de f **dentro** de $(a; b)$.\n2. Evaluá f en esos puntos y en $a$ y $b$.\n3. El mayor valor es el máximo; el menor, el mínimo.\n\nNo hace falta la tabla de signos.",
      { tag: "matematico" },
    ),
    quiz("Pregunta rápida", {
      id: "q-am-abs-1", subjectId: "am-a", topicId: "t-am-extremos-absolutos",
      prompt: "En $[0; 3]$: $f(0) = 0$, $f(1) = −2$ (único punto crítico) y $f(3) = 18$. ¿Dónde está el máximo absoluto?",
      options: ["En x = 3", "En x = 1", "No tiene"],
      answer: 0,
      explanation: "De los candidatos, el mayor valor es f(3) = 18. El punto crítico x = 1 es el mínimo.",
      hints: ["Compará los tres valores.", "¿Cuál es el mayor?", "18 > 0 > −2."],
      errors: { 1: ["conceptual", "En x = 1 está el MÍNIMO (vale −2). El máximo puede estar en un borde."], 2: ["conceptual", "Continua en un intervalo cerrado: Weierstrass garantiza que existe."] },
    }),
    board("Pizarra: comparar candidatos", ABS_BOARD),
    example("Ejemplo resuelto", "Extremos absolutos de $f(x) = x^3 − 3x$ en $[0; 3]$", ["$f′(x) = 3x^2 − 3 = 0$ ⇒ $x = ±1$; solo $x = 1$ está en el intervalo", "$f(0) = 0$, $f(1) = −2$, $f(3) = 18$", "Máximo absoluto 18 en x = 3; mínimo absoluto −2 en x = 1"], "máx en x = 3; mín en x = 1"),
    practice("Ejercicio guiado", "am-extremos-absolutos", 1, 3, true),
    explain(
      "Errores típicos",
      "• Olvidar los bordes del intervalo.\n• Incluir puntos críticos que no están en $[a; b]$.\n• Responder el valor cuando piden la abscisa (o al revés).\n• Suponer que un punto crítico es máximo porque «f′ = 0»: puede ser mínimo.",
      { tag: "matematico" },
    ),
    practice("Tu turno", "am-extremos-absolutos", 3, 9),
    practice("Mini desafío", "am-extremos-absolutos", 5, 4),
    summary([
      "Weierstrass: continua en [a; b] ⇒ hay máximo y mínimo absolutos.",
      "Candidatos: críticos interiores + los dos bordes.",
      "Evaluá f en todos y compará.",
      "Distinguí abscisa (dónde) de valor (cuánto).",
    ]),
  ],
  tutor: {
    normal: "Por el teorema de Weierstrass, una función continua en un intervalo cerrado y acotado alcanza máximo y mínimo absolutos. Estos se encuentran entre los puntos críticos interiores y los extremos del intervalo, por lo que basta evaluar f en esos candidatos y comparar.",
    simple: "Hacé la lista de candidatos: donde f′ = 0 (si está dentro del intervalo) y las dos puntas. Calculá f en cada uno. El más grande es el máximo; el más chico, el mínimo.",
    nino: "Querés saber la foto más alta que sacaste en una excursión entre dos paradas. Revisás las fotos de las cimas y también las de las dos paradas: la más alta de todas gana.",
    ejemplo: "f(x) = x² en [−1; 3]: crítico x = 0 (f = 0); bordes f(−1) = 1, f(3) = 9. Máx 9 en x = 3, mín 0 en x = 0.",
    visual: { type: "plot", mode: "free", initial: "x^2 - 6ln(x)" },
    visualText: "Entre 1 y e el valle está en √3, pero el punto más alto es el borde derecho.",
    fromZero: "Un extremo absoluto es el valor más alto (o más bajo) de toda la función en el intervalo. Si está en el interior y la función es derivable, ahí la tangente es horizontal (f′ = 0). Si no, está en un borde. No hay más lugares posibles: por eso la lista de candidatos es completa.",
    why: "Evita estudiar el signo de f′ en todo el intervalo: con unas pocas evaluaciones se tiene la respuesta.",
    origin: "Teorema de Fermat: en un extremo interior de una función derivable, f′ = 0. Weierstrass asegura que el extremo existe; Fermat dice dónde buscarlo.",
    board: ABS_BOARD,
  },
};

// ───────────────────────── am-8 · Taylor ─────────────────────────

const TAYLOR_BOARD: BoardStep[] = [
  { expr: "f(x) = e^(2x),  x₀ = 0", note: "Buscamos $P_3$" },
  { expr: "f(0) = 1,  f′(0) = 2,  f″(0) = 4,  f‴(0) = 8", note: "Cada derivada saca un factor 2" },
  { expr: "P₃ = 1 + 2x + (4/2!)x² + (8/3!)x³", note: "Cada coeficiente es $f^{(k)}(0)/k!$" },
  { expr: "P₃ = 1 + 2x + 2x² + (4/3)x³", note: "2! = 2 y 3! = 6" },
];

export const amTaylor: Lesson = {
  id: "l-am-taylor",
  title: "Polinomio de Taylor",
  subtitle: "Aproximar una función con un polinomio",
  subjectId: "am-a",
  topicIds: ["t-am-taylor"],
  estimatedMinutes: 11,
  prerequisites: ["t-am-reglas-derivacion"],
  cards: [
    intro("Taylor", "Armar el polinomio de Taylor de una función, leer datos de él y hallar parámetros.", "Es el primer ejercicio del segundo parcial casi siempre: un Pₙ con parámetros a encontrar."),
    explain(
      "Imitar a una función",
      "La recta tangente imita a f en un punto: mismo valor y misma pendiente. Si además pedís la misma **curvatura** (f″), obtenés una parábola que la imita mejor; con f‴, todavía mejor.\n\nEso es el polinomio de Taylor: un polinomio que copia las derivadas de f en $x_0$. Mové el punto y mirá la primera aproximación, la tangente:",
      { tag: "intuitivo", widget: { type: "tangent", initial: "exp(x)" } },
    ),
    explain(
      "La fórmula",
      "$P_n(x) = f(x_0) + f′(x_0)(x − x_0) + \\frac{f″(x_0)}{2!}(x − x_0)^2 + … + \\frac{f^{(n)}(x_0)}{n!}(x − x_0)^n$\n\nLeída al revés: en un $P_n$ dado, el término independiente es $f(x_0)$, el coeficiente de $(x − x_0)$ es $f′(x_0)$ y el de $(x − x_0)^2$ es $f″(x_0)/2$.",
      { tag: "matematico" },
    ),
    quiz("Pregunta rápida", {
      id: "q-am-tay-1", subjectId: "am-a", topicId: "t-am-taylor",
      prompt: "El polinomio de Taylor de orden 2 de f en $x_0 = 1$ es $5 − 3(x − 1) + 4(x − 1)^2$. ¿Cuánto vale $f″(1)$?",
      options: ["8", "4", "2"],
      answer: 0,
      explanation: "El coeficiente de (x − 1)² es f″(1)/2! = 4, así que f″(1) = 8.",
      hints: ["Comparalo con la fórmula de P₂.", "El coeficiente de (x − 1)² es f″(1)/2.", "f″(1)/2 = 4."],
      errors: { 1: ["formula", "4 es f″(1)/2!, no f″(1). Multiplicá por 2."], 2: ["formula", "Al revés: f″(1) = 2·4."] },
    }),
    board("Pizarra: P₃ de una exponencial", TAYLOR_BOARD),
    example(
      "Ejemplo con parámetros",
      "$f(x) = (ax + b)^{3/2}$, con a, b > 0, tiene $P_1(x) = 8 + 6(x − 1)$ en $x_0 = 1$. Hallá a y b.",
      ["$f(1) = (a + b)^{3/2} = 8$ ⇒ $a + b = 4$", "$f′(x) = \\frac{3}{2}a(ax + b)^{1/2}$ ⇒ $f′(1) = \\frac{3}{2}a·2 = 3a$", "$3a = 6$ ⇒ $a = 2$; $b = 4 − 2 = 2$"],
      "a = 2, b = 2",
    ),
    practice("Ejercicio guiado", "am-taylor", 1, 5, true),
    explain(
      "Errores típicos",
      "• Olvidar el $1/k!$: el coeficiente de $x^3$ de $e^{2x}$ es $8/6$, no 8.\n• Olvidar la cadena: en $(ax + b)^{3/2}$ cada derivada saca un factor a.\n• Confundir $f(x_0)$ con la raíz: si $(a + b)^{3/2} = 8$, entonces $a + b = 4$.\n• Desarrollar $(x − x_0)^k$: dejalo así, es la forma que pide el parcial.",
      { tag: "matematico" },
    ),
    practice("Tu turno", "am-taylor", 3, 8),
    practice("Tu turno: parámetros", "am-taylor", 4, 2),
    practice("Mini desafío", "am-taylor", 6, 11),
    summary([
      "Pₙ copia f(x₀), f′(x₀), …, f⁽ⁿ⁾(x₀).",
      "Coeficiente de (x − x₀)ᵏ = f⁽ᵏ⁾(x₀)/k!.",
      "Con parámetros: igualá término a término y resolvé el sistema.",
      "Si f viene de una ecuación diferencial, derivá la ecuación para obtener f″, f‴.",
    ]),
  ],
  tutor: {
    normal: "El polinomio de Taylor de orden n de f centrado en x₀ es el único polinomio de grado ≤ n que coincide con f y sus primeras n derivadas en x₀: Pₙ(x) = Σ f⁽ᵏ⁾(x₀)/k!·(x − x₀)ᵏ. Aproxima a f cerca de x₀.",
    simple: "Es un polinomio que «se hace pasar» por f cerca de un punto: tiene su mismo valor, su misma pendiente, su misma curvatura… Cada coeficiente es una derivada en el punto dividida por un factorial.",
    nino: "Es como dibujar a alguien con trazos simples: primero la silueta (el valor), después hacia dónde mira (la pendiente), después la forma de la cara (la curvatura). Cuantos más trazos, más se parece.",
    ejemplo: "eˣ en 0: todas las derivadas valen 1, así que P₃ = 1 + x + x²/2 + x³/6. Con x = 0,1 da 1,10517, y e⁰'¹ = 1,10517…",
    visual: { type: "tangent", initial: "exp(x)" },
    visualText: "La tangente es P₁. Taylor le agrega términos para seguir mejor a la curva.",
    fromZero: "Un polinomio a + b(x − x₀) + c(x − x₀)² tiene en x₀ valor a, derivada b y segunda derivada 2c. Si queremos que coincida con f, hay que elegir a = f(x₀), b = f′(x₀), c = f″(x₀)/2. Con más términos aparecen 3!, 4!… porque derivar (x − x₀)ᵏ k veces da k!.",
    why: "Los polinomios son fáciles de evaluar, derivar e integrar. Taylor permite reemplazar una función complicada por uno, controlando el error cerca del punto.",
    origin: "Derivar k veces (x − x₀)ᵏ da k·(k−1)·…·1 = k!. Para que la k-ésima derivada del polinomio en x₀ sea f⁽ᵏ⁾(x₀), su coeficiente tiene que ser f⁽ᵏ⁾(x₀)/k!.",
    board: TAYLOR_BOARD,
  },
};

// ───────────────────────── am-9 · Primitivas ─────────────────────────

const PRIM_BOARD: BoardStep[] = [
  { expr: "∫ ln²(2x + 1)/(2x + 1) dx", note: "La derivada de ln(2x + 1) aparece dividiendo" },
  { expr: "u = ln(2x + 1),  du = 2/(2x + 1) dx", note: "Elegimos u y calculamos du" },
  { expr: "dx/(2x + 1) = du/2", note: "Despejamos lo que hay en la integral" },
  { expr: "∫ u² du/2 = u³/6", note: "Integral inmediata" },
  { expr: "= ln³(2x + 1)/6 + C", note: "Volvemos a x y sumamos C" },
];

export const amPrimitivas: Lesson = {
  id: "l-am-primitivas",
  title: "Primitivas",
  subtitle: "Integrales inmediatas y sustitución",
  subjectId: "am-a",
  topicIds: ["t-am-primitivas"],
  estimatedMinutes: 11,
  prerequisites: ["t-am-reglas-derivacion"],
  cards: [
    intro("Primitivas", "Encontrar una función cuya derivada sea la dada: tabla de inmediatas y método de sustitución.", "Las primitivas son la mitad del segundo parcial: se piden directamente y se usan para áreas y ecuaciones diferenciales."),
    explain(
      "Derivar al revés",
      "Derivar: de la posición a la velocidad. Integrar: de la velocidad a la posición.\n\nUna **primitiva** de f es una F con $F′ = f$. Recorré la curva de abajo: es la derivada de la de arriba. Integrar es reconstruir la de arriba sabiendo la de abajo.",
      { tag: "intuitivo", widget: { type: "tangent-sweep", expr: "x^3/3 - x" } },
    ),
    explain(
      "Tabla y + C",
      "$∫x^n dx = \\frac{x^{n+1}}{n+1} + C$ (n ≠ −1) · $∫\\frac{1}{x} dx = ln|x| + C$\n\n$∫e^x dx = e^x + C$ · $∫cos x dx = sen x + C$ · $∫sen x dx = −cos x + C$\n\nLa C aparece porque las constantes tienen derivada 0: si F es primitiva, F + 5 también.",
      { tag: "matematico" },
    ),
    quiz("Pregunta rápida", {
      id: "q-am-prim-1", subjectId: "am-a", topicId: "t-am-primitivas",
      prompt: "¿Cuál es una primitiva de $6x^2$?",
      options: ["$2x^3 + C$", "$12x + C$", "$6x^3 + C$"],
      answer: 0,
      explanation: "∫6x² dx = 6·x³/3 = 2x³. Verificación: (2x³)′ = 6x² ✓.",
      hints: ["Subí el exponente y dividí por el nuevo.", "x³/3.", "6/3 = 2."],
      errors: { 1: ["derivacion", "12x es la derivada de 6x², no su primitiva."], 2: ["formula", "Faltó dividir por el nuevo exponente: (6x³)′ = 18x²."] },
    }),
    explain(
      "Sustitución",
      "Si en la integral aparece una función **y su derivada**, llamá u a esa función:\n\n$∫ f(g(x))·g′(x) dx = ∫ f(u) du$ con $u = g(x)$.\n\nEjemplo: $∫ \\frac{2x}{x^2 + 1} dx$: $u = x^2 + 1$, $du = 2x dx$ ⇒ $∫\\frac{du}{u} = ln|x^2 + 1| + C$.",
      { tag: "matematico" },
    ),
    board("Pizarra: sustitución", PRIM_BOARD),
    example("Ejemplo resuelto", "Calculá $∫ x(x^2 + 1)^3 dx$", ["$u = x^2 + 1$, $du = 2x dx$ ⇒ $x dx = du/2$", "$∫ u^3 \\frac{du}{2} = \\frac{u^4}{8}$", "$= \\frac{(x^2 + 1)^4}{8} + C$", "Verifico: derivando da $\\frac{4(x^2 + 1)^3·2x}{8} = x(x^2 + 1)^3$ ✓"], "(x² + 1)⁴/8 + C"),
    practice("Ejercicio guiado", "am-primitivas", 1, 6, true),
    explain(
      "Errores típicos",
      "• Dar la derivada en lugar de la primitiva.\n• Olvidar dividir por la constante de du: $∫e^{3x} dx = \\frac{e^{3x}}{3}$.\n• Aplicar la regla de la potencia a $1/x$.\n• Dejar una x suelta después de sustituir: todo tiene que quedar en u.\n• **Siempre se puede verificar derivando.**",
      { tag: "matematico" },
    ),
    practice("Tu turno", "am-primitivas", 3, 10),
    practice("Tu turno", "am-primitivas", 4, 3),
    practice("Mini desafío", "am-primitivas", 6, 8),
    summary([
      "Primitiva: F′ = f. Todas difieren en una constante C.",
      "Tabla de inmediatas: xⁿ, 1/x, eˣ, sen, cos.",
      "Sustitución: si aparece g(x) y g′(x), u = g(x).",
      "Verificá derivando.",
    ]),
  ],
  tutor: {
    normal: "F es primitiva de f en un intervalo si F′ = f. Dos primitivas difieren en una constante, por eso se escribe ∫f(x) dx = F(x) + C. El método de sustitución invierte la regla de la cadena: ∫f(g(x))g′(x) dx = F(g(x)) + C.",
    simple: "Integrar es buscar una función que, al derivarla, te dé la que tenés. Si ves «algo» y también su derivada, cambiá ese algo por u y la integral se vuelve simple.",
    nino: "Te muestran las huellas que dejó alguien caminando y tenés que adivinar por dónde fue. La derivada son las huellas; la primitiva, el camino.",
    ejemplo: "∫ 3x² dx = x³ + C, porque (x³)′ = 3x². ∫ cos(5x) dx = sen(5x)/5 + C.",
    visual: { type: "tangent-sweep", expr: "x^3/3 - x" },
    visualText: "Arriba F(x) = x³/3 − x; abajo, su derivada x² − 1. F es una primitiva de x² − 1.",
    fromZero: "La derivada transforma una función en otra. Integrar es deshacer esa transformación. Como derivar borra las constantes, al deshacer no sabemos cuál era: por eso se agrega + C. La tabla de primitivas es la tabla de derivadas leída al revés.",
    why: "Con primitivas se calculan áreas (Barrow), se resuelven ecuaciones diferenciales y se recupera una posición a partir de una velocidad.",
    origin: "La sustitución es la regla de la cadena al revés: (F(g(x)))′ = F′(g(x))·g′(x) = f(g(x))·g′(x).",
    board: PRIM_BOARD,
  },
};

const PARTES_BOARD: BoardStep[] = [
  { expr: "∫ x·e^(3x) dx", note: "Producto: usamos partes" },
  { expr: "u = x,  dv = e^(3x) dx", note: "Derivamos lo que se simplifica (x)" },
  { expr: "du = dx,  v = e^(3x)/3", note: "Integramos dv" },
  { expr: "= x·e^(3x)/3 − ∫ e^(3x)/3 dx", note: "Partes: $uv − ∫v du$" },
  { expr: "= x·e^(3x)/3 − e^(3x)/9 + C", note: "Otra vez se divide por 3" },
];

export const amPartesFracciones: Lesson = {
  id: "l-am-partes-fracciones",
  title: "Partes y fracciones simples",
  subtitle: "Dos métodos para productos y cocientes",
  subjectId: "am-a",
  topicIds: ["t-am-partes-fracciones"],
  estimatedMinutes: 12,
  prerequisites: ["t-am-primitivas", "t-factorizacion"],
  cards: [
    intro("Más métodos de integración", "Integrar productos (por partes) y cocientes de polinomios (por fracciones simples).", "El segundo parcial suele pedir una primitiva por partes y otra por fracciones simples o sustitución."),
    explain(
      "La regla del producto, al revés",
      "Como $(uv)′ = u′v + uv′$, integrando: $uv = ∫u′v + ∫uv′$. Despejando:\n\n$∫u dv = uv − ∫v du$\n\nLa idea: elegir u para que al derivarla se simplifique (x, ln x) y dv que se pueda integrar fácil ($e^{kx}$, $x^n$). Regla práctica **LIATE**: Logaritmos, Inversas, Algebraicas, Trigonométricas, Exponenciales (en ese orden para u).",
      { tag: "matematico" },
    ),
    quiz("Pregunta rápida", {
      id: "q-am-partes-1", subjectId: "am-a", topicId: "t-am-partes-fracciones",
      prompt: "Para $∫ x^2 ln x dx$, ¿qué conviene tomar como u?",
      options: ["$u = ln x$", "$u = x^2$", "Da lo mismo"],
      answer: 0,
      explanation: "Derivar ln x lo simplifica (1/x) e integrar x² es fácil. Al revés habría que integrar ln x, que es más difícil.",
      hints: ["¿Cuál de los dos se simplifica al derivar?", "LIATE: logaritmos primero.", "(ln x)′ = 1/x."],
      errors: { 1: ["conceptual", "Con u = x² tendrías que integrar ln x (dv), que es más trabajoso. LIATE: el logaritmo va como u."] },
    }),
    board("Pizarra: por partes", PARTES_BOARD),
    practice("Ejercicio guiado", "am-primitivas-partes", 1, 4, true),
    explain(
      "Fracciones simples",
      "Para $∫\\frac{px + q}{(x − r_1)(x − r_2)} dx$ con raíces distintas, escribí\n\n$\\frac{px + q}{(x − r_1)(x − r_2)} = \\frac{A}{x − r_1} + \\frac{B}{x − r_2}$\n\nMultiplicando: $px + q = A(x − r_2) + B(x − r_1)$. Reemplazar $x = r_1$ da A; $x = r_2$ da B. Y cada término integra a un logaritmo.",
      { tag: "matematico" },
    ),
    example(
      "Ejemplo resuelto",
      "Calculá $∫ \\frac{x + 4}{x^2 − x − 2} dx$",
      ["$x^2 − x − 2 = (x − 2)(x + 1)$", "$x + 4 = A(x + 1) + B(x − 2)$", "x = 2: $6 = 3A$ ⇒ $A = 2$; x = −1: $3 = −3B$ ⇒ $B = −1$", "$∫ = 2ln|x − 2| − ln|x + 1| + C$"],
      "2 ln|x − 2| − ln|x + 1| + C",
    ),
    explain(
      "Errores típicos",
      "• En partes, el segundo término RESTA: $uv − ∫v du$.\n• Al integrar $e^{kx}$ dos veces se divide dos veces por k.\n• Integrar factor por factor: $∫ f·g ≠ ∫f·∫g$.\n• En fracciones simples, cambiar el signo de las raíces: si $x^2 − x − 2 = (x − 2)(x + 1)$, los logaritmos son de $x − 2$ y $x + 1$.",
      { tag: "matematico" },
    ),
    practice("Tu turno", "am-primitivas-partes", 3, 9),
    practice("Tu turno", "am-primitivas-partes", 4, 5),
    practice("Mini desafío", "am-primitivas-partes", 6, 12),
    summary([
      "Partes: ∫u dv = uv − ∫v du (LIATE para elegir u).",
      "∫ x e^{kx} dx = x e^{kx}/k − e^{kx}/k² + C.",
      "Fracciones simples: A/(x − r₁) + B/(x − r₂); A y B reemplazando las raíces.",
      "∫ A/(x − r) dx = A ln|x − r| + C.",
    ]),
  ],
  tutor: {
    normal: "La integración por partes, ∫u dv = uv − ∫v du, proviene de la regla del producto y permite integrar productos de funciones. La descomposición en fracciones simples escribe un cociente de polinomios como suma de fracciones con denominadores lineales, cuyas primitivas son logaritmos.",
    simple: "Partes: si tenés un producto, derivás uno (el que se simplifica) e integrás el otro, y aplicás la fórmula. Fracciones simples: partís la fracción en dos más chiquitas, cada una con un factor del denominador, y cada una da un logaritmo.",
    nino: "Partes es como intercambiar tareas: «yo derivo esto que se vuelve fácil y vos integrás aquello». Fracciones simples es separar una mezcla en sus dos ingredientes para cocinar cada uno por su lado.",
    ejemplo: "∫ x eˣ dx: u = x, dv = eˣ dx → x eˣ − ∫eˣ dx = x eˣ − eˣ + C.",
    visual: { type: "tangent-sweep", expr: "x*exp(x) - exp(x)" },
    visualText: "La derivada de x eˣ − eˣ (abajo) es x eˣ: por eso es una primitiva.",
    fromZero: "No hay una regla para integrar un producto como la hay para derivarlo. Partes aprovecha la regla del producto al revés para cambiar una integral difícil por otra más fácil. Para cocientes de polinomios, se separan en sumas de fracciones con denominador lineal, porque ∫ 1/(x − r) dx = ln|x − r| es inmediata.",
    why: "Son las dos técnicas que, junto con la sustitución, alcanzan para todas las primitivas del programa.",
    origin: "Partes: integrar (uv)′ = u′v + uv′ da uv = ∫u′v dx + ∫uv′ dx. Fracciones simples: al sumar A/(x − r₁) + B/(x − r₂) con común denominador se obtiene [A(x − r₂) + B(x − r₁)]/[(x − r₁)(x − r₂)], así que basta igualar numeradores.",
    board: PARTES_BOARD,
  },
};

const TFC_BOARD: BoardStep[] = [
  { expr: "F(x) = ∫_0^(x² + 2x) √(t + 1) dt", note: "El límite superior es una función de x: u(x) = x² + 2x" },
  { expr: "F′(x) = √(x² + 2x + 1)·(2x + 2)", note: "TFC: integrando evaluado en u(x), por u′(x)" },
  { expr: "F′(1) = √4·4", note: "Reemplazamos x = 1: u(1) = 3, u′(1) = 4" },
  { expr: "F′(1) = 8", note: "√4 = 2" },
];

export const amTfc: Lesson = {
  id: "l-am-tfc",
  title: "Teorema fundamental del cálculo",
  subtitle: "Derivar una integral",
  subjectId: "am-a",
  topicIds: ["t-am-tfc"],
  estimatedMinutes: 9,
  prerequisites: ["t-am-primitivas", "t-am-reglas-derivacion"],
  cards: [
    intro("TFC", "Derivar funciones definidas como integrales con límites variables, y usarlo en límites con L'Hôpital.", "Vale un punto fijo en el segundo parcial y aparece combinado con L'Hôpital en el final."),
    explain(
      "La función área",
      "Definí $F(x)$ como el área bajo una curva g desde 0 hasta x. Si corrés x un poquito, el área crece una tira finita de altura $g(x)$.\n\nPor eso **la velocidad a la que crece el área es la altura de la curva**: $F′(x) = g(x)$. Mirá cómo el área se arma con rectángulos:",
      { tag: "intuitivo", widget: { type: "riemann", expr: "sqrt(x + 1)", a: 0, b: 3 } },
    ),
    explain(
      "El teorema, con cadena",
      "Si g es continua y $F(x) = ∫_a^{u(x)} g(t) dt$, entonces\n\n$F′(x) = g(u(x))·u′(x)$\n\nSi la x está en el límite **inferior**, cambia el signo: $(∫_{u(x)}^{b} g)′ = −g(u(x))·u′(x)$. No hace falta calcular la integral.",
      { tag: "matematico" },
    ),
    quiz("Pregunta rápida", {
      id: "q-am-tfc-1", subjectId: "am-a", topicId: "t-am-tfc",
      prompt: "Si $F(x) = ∫_0^{x^2} cos(t) dt$, ¿cuánto vale $F′(x)$?",
      options: ["$cos(x^2)·2x$", "$cos(x^2)$", "$sen(x^2)$"],
      answer: 0,
      explanation: "TFC con cadena: g(u(x))·u′(x) = cos(x²)·2x.",
      hints: ["El límite superior es u(x) = x².", "Evaluá el integrando en u(x).", "Multiplicá por u′(x) = 2x."],
      errors: { 1: ["derivacion", "Faltó multiplicar por la derivada del límite superior (2x)."], 2: ["conceptual", "Eso es (casi) la integral, no su derivada. El TFC dice que la derivada es el integrando."] },
    }),
    board("Pizarra: TFC con regla de la cadena", TFC_BOARD),
    example("Ejemplo: límite con integral", "Calculá $lim_{x→0} \\frac{∫_0^x sen(3t) dt}{x^2}$", ["Arriba y abajo → 0: es 0/0", "L'Hôpital + TFC: $\\frac{sen(3x)}{2x}$", "$= \\frac{3}{2}·\\frac{sen(3x)}{3x} → \\frac{3}{2}$"], "3/2"),
    practice("Ejercicio guiado", "am-tfc", 1, 3, true),
    explain(
      "Errores típicos",
      "• Calcular la integral cuando solo piden la derivada.\n• Olvidar el factor $u′(x)$.\n• Evaluar el integrando en x en lugar de en $u(x)$.\n• Olvidar el signo menos cuando la variable está abajo.",
      { tag: "matematico" },
    ),
    practice("Tu turno", "am-tfc", 3, 7),
    practice("Mini desafío", "am-tfc", 5, 10),
    summary([
      "(∫_a^x g)′ = g(x).",
      "(∫_a^{u(x)} g)′ = g(u(x))·u′(x).",
      "Variable abajo: signo menos.",
      "En límites 0/0 con integrales: L'Hôpital + TFC.",
    ]),
  ],
  tutor: {
    normal: "Teorema fundamental del cálculo: si g es continua, F(x) = ∫_a^x g(t) dt es derivable y F′(x) = g(x). Combinado con la regla de la cadena, (∫_a^{u(x)} g(t) dt)′ = g(u(x))·u′(x).",
    simple: "Derivar una integral «deshace» la integral: te queda la función de adentro evaluada en el límite de arriba. Si ese límite es una función de x, multiplicás por su derivada.",
    nino: "Si llenás un balde con una canilla, la velocidad a la que sube el agua depende de cuánto abriste la canilla en ese momento, no de cuánta agua juntaste antes.",
    ejemplo: "F(x) = ∫_1^{3x} t² dt: F′(x) = (3x)²·3 = 27x².",
    visual: { type: "riemann", expr: "sqrt(x + 1)", a: 0, b: 3 },
    visualText: "El área acumulada crece, en cada x, a razón de la altura de la curva.",
    fromZero: "Una integral definida con un límite variable es una función: a cada x le asigna un área. El teorema fundamental dice cómo cambia esa área: la derivada es la altura de la curva en el borde que se mueve. Por eso derivar e integrar son operaciones inversas.",
    why: "Conecta derivadas e integrales: justifica Barrow (calcular áreas con primitivas) y permite derivar funciones que no se pueden integrar en forma explícita, como ∫ e^{t²} dt.",
    origin: "[F(x + h) − F(x)]/h es el área de una tira de ancho h dividida por h, o sea la altura promedio de g en [x, x + h], que tiende a g(x) por continuidad.",
    board: TFC_BOARD,
  },
};

// ───────────────────────── am-10 · Integrales, áreas y EDO ─────────────────────────

const AREA_BOARD: BoardStep[] = [
  { expr: "x² = 2x", note: "Igualamos para hallar los cortes", figure: { kind: "plot", x: [-1, 3], y: [-1, 6], fns: [{ expr: "x^2", label: "y = x²" }, { expr: "2x", label: "y = 2x" }] } },
  { expr: "x(x − 2) = 0  →  x = 0,  x = 2", note: "Factor común", figure: { kind: "plot", x: [-1, 3], y: [-1, 6], fns: [{ expr: "x^2", label: "y = x²" }, { expr: "2x", label: "y = 2x" }], points: [{ x: 0, y: 0, label: "(0; 0)" }, { x: 2, y: 4, label: "(2; 4)" }] } },
  { expr: "x = 1:  1² = 1 < 2·1 = 2", note: "Probamos un punto: la recta está arriba" },
  { expr: "A = ∫_0^2 (2x − x²) dx", note: "Arriba menos abajo, entre los cortes", figure: { kind: "plot", x: [-1, 3], y: [-1, 6], fns: [{ expr: "x^2", label: "y = x²" }, { expr: "2x", label: "y = 2x" }], points: [{ x: 0, y: 0, label: "(0; 0)" }, { x: 2, y: 4, label: "(2; 4)" }], area: { expr: "2x", lower: "x^2", a: 0, b: 2 } } },
  { expr: "A = [x² − x³/3]_0^2 = 4 − 8/3", note: "Barrow" },
  { expr: "A = 4/3", note: "Restamos" },
];

export const amArea: Lesson = {
  id: "l-am-area",
  title: "Integral definida y áreas",
  subtitle: "Barrow, áreas entre curvas y parámetros",
  subjectId: "am-a",
  topicIds: ["t-am-integral-area"],
  estimatedMinutes: 12,
  prerequisites: ["t-am-primitivas"],
  cards: [
    intro("Áreas", "Calcular integrales definidas con Barrow, plantear el área entre dos curvas y hallar un parámetro a partir de un área.", "El segundo parcial siempre trae un planteo de área (opción múltiple) y un área con parámetro."),
    explain(
      "Sumar rectángulos",
      "El área bajo una curva se aproxima con rectángulos. Con más y más finos, la suma se acerca al valor exacto: la **integral definida**.\n\nAumentá la cantidad de rectángulos:",
      { tag: "intuitivo", widget: { type: "riemann", expr: "x^2", a: 0, b: 2 } },
    ),
    explain(
      "Barrow",
      "Si F es primitiva de f: $∫_a^b f(x) dx = F(b) − F(a)$.\n\nOjo: si f es negativa, la integral da negativo. El **área** entre dos curvas es $∫ (arriba − abajo)$, partiendo en los puntos de corte cuando cambian de posición.\n\nY si f es **impar**, $∫_{−L}^0 f = −∫_0^L f$.",
      { tag: "matematico" },
    ),
    quiz("Pregunta rápida", {
      id: "q-am-area-1", subjectId: "am-a", topicId: "t-am-integral-area",
      prompt: "f es impar y $∫_0^3 f(x) dx = 5$. ¿Cuánto vale $∫_{−3}^{3} f(x) dx$?",
      options: ["0", "10", "−5"],
      answer: 0,
      explanation: "Para f impar, ∫_{−3}^0 f = −5, y sumado a ∫_0^3 f = 5 da 0.",
      hints: ["Impar: simétrica respecto del origen.", "∫_{−3}^0 f = −∫_0^3 f.", "−5 + 5."],
      errors: { 1: ["conceptual", "Duplicar vale para funciones PARES. Las impares se cancelan."], 2: ["conceptual", "−5 es solo la mitad izquierda."] },
    }),
    board("Pizarra: área entre curvas", AREA_BOARD, "Área entre $y = x^2$ e $y = 2x$."),
    example("Ejemplo: área con parámetro", "Hallá $a > 0$ tal que el área bajo $f(x) = \\frac{a}{√x}$ entre $x = 1$ y $x = 4$ sea 6.", ["$∫_1^4 a x^{−1/2} dx = 2a√x |_1^4$", "$= 2a(2 − 1) = 2a$", "$2a = 6$ ⇒ $a = 3$"], "a = 3"),
    practice("Ejercicio guiado", "am-area-planteo", 1, 3, true),
    explain(
      "Errores típicos",
      "• Integrar f − g sin ver quién está arriba (da negativo o se cancela).\n• No partir en los cortes cuando las curvas se cruzan.\n• Usar límites que no son los puntos de corte.\n• Con $x·(…)$, recordar que multiplicar una desigualdad por x negativo la invierte.\n• Olvidar restar F(a), sobre todo si F(a) ≠ 0 (como $e^0 = 1$).",
      { tag: "matematico" },
    ),
    practice("Tu turno: Barrow", "am-integral-definida", 2, 6),
    practice("Tu turno: parámetro", "am-area-param", 3, 4),
    practice("Mini desafío: planteo", "am-area-planteo", 5, 9),
    summary([
      "∫_a^b f = F(b) − F(a).",
      "Área entre curvas: cortes → quién está arriba en cada tramo → ∫ (arriba − abajo).",
      "f impar: ∫_{−L}^0 f = −∫_0^L f; ∫_{−L}^L f = 0.",
      "Con parámetro: calculá el área en función del parámetro e igualá.",
    ]),
  ],
  tutor: {
    normal: "La integral definida ∫_a^b f es el límite de sumas de Riemann y, por la regla de Barrow, vale F(b) − F(a) para cualquier primitiva F. El área entre dos curvas se obtiene integrando la diferencia (superior − inferior) en cada intervalo determinado por los puntos de corte.",
    simple: "Para un área: buscá dónde se cortan las curvas, fijate cuál está arriba en cada tramo y integrá «la de arriba menos la de abajo». Para calcular la integral, usás una primitiva y restás sus valores en los extremos.",
    nino: "Querés saber cuánta pintura necesitás para una pared con forma rara: la cortás en tiritas finitas, sumás el área de cada una y, cuanto más finas, más exacto.",
    ejemplo: "∫_0^3 x² dx = [x³/3]_0^3 = 9.",
    visual: { type: "riemann", expr: "x^2", a: 0, b: 2 },
    visualText: "Con más rectángulos, la suma se acerca a 8/3, el valor exacto de la integral.",
    fromZero: "El área bajo una curva se aproxima sumando rectángulos de base pequeña y altura igual a la función. La integral definida es el valor al que tienden esas sumas. Barrow dice que no hace falta sumar: alcanza con una primitiva evaluada en los extremos.",
    why: "Las áreas modelan acumulaciones: distancia a partir de la velocidad, trabajo, volúmenes. Y Barrow convierte un límite de sumas en una resta.",
    origin: "Del teorema fundamental: si A(x) = ∫_a^x f, entonces A′ = f, así que A = F + C. Como A(a) = 0, C = −F(a) y A(b) = F(b) − F(a).",
    board: AREA_BOARD,
  },
};

const EDO_BOARD: BoardStep[] = [
  { expr: "f′ = (2x − 4)·f,  f(0) = 3", note: "Ecuación separable" },
  { expr: "f′/f = 2x − 4", note: "Dividimos por f: separamos variables" },
  { expr: "ln|f| = x² − 4x + K", note: "Integramos ambos lados" },
  { expr: "f = C·e^(x² − 4x)", note: "Aplicamos exponencial: $C = ±e^K$" },
  { expr: "f(0) = C = 3", note: "Condición inicial" },
  { expr: "f = 3e^(x² − 4x)", note: "Solución" },
];

export const amEdo: Lesson = {
  id: "l-am-edo",
  title: "Ecuaciones diferenciales separables",
  subtitle: "Encontrar f a partir de f′",
  subjectId: "am-a",
  topicIds: ["t-am-edo"],
  estimatedMinutes: 8,
  prerequisites: ["t-am-primitivas"],
  cards: [
    intro("EDO separables", "Resolver ecuaciones como f′ = (αx + β)·f con una condición inicial.", "Aparecen en el final y modelan crecimiento poblacional, enfriamiento, desintegración radiactiva y circuitos."),
    explain(
      "Crecer en proporción",
      "Una población que crece 3 % por año crece más cuanto más grande es: $f′ = 0,03·f$. Ecuaciones así relacionan una función con su propia derivada.\n\nSu solución es una exponencial. Mové los parámetros y mirá cómo cambia:",
      { tag: "cotidiano", widget: { type: "param-function", family: "exponencial" } },
    ),
    explain(
      "El método",
      "Si $f′ = g(x)·f$:\n\n1. Separá: $\\frac{f′}{f} = g(x)$.\n2. Integrá: $ln|f| = G(x) + K$, con G primitiva de g.\n3. Despejá: $f(x) = C·e^{G(x)}$.\n4. Usá la condición inicial para hallar C.",
      { tag: "matematico" },
    ),
    quiz("Pregunta rápida", {
      id: "q-am-edo-1", subjectId: "am-a", topicId: "t-am-edo",
      prompt: "¿Cuál es la solución de $f′ = 5f$ con $f(0) = 2$?",
      options: ["$f(x) = 2e^{5x}$", "$f(x) = e^{5x} + 2$", "$f(x) = 5e^{2x}$"],
      answer: 0,
      explanation: "f′/f = 5 ⇒ ln|f| = 5x + K ⇒ f = Ce^{5x}; f(0) = C = 2.",
      hints: ["Separá: f′/f = 5.", "Integrá: ln|f| = 5x + K.", "f = Ce^{5x} y usá f(0)."],
      errors: { 1: ["conceptual", "La constante multiplica: (e^{5x} + 2)′ = 5e^{5x}, que no es 5·f."], 2: ["conceptual", "Intercambiaste los números: el 5 va en el exponente y el 2 = f(0) multiplica."] },
    }),
    board("Pizarra: EDO separable", EDO_BOARD),
    example("Ejemplo resuelto", "$f′ = 3f$, $f(0) = 2$. Calculá $f(1)$.", ["$f(x) = Ce^{3x}$", "$f(0) = C = 2$", "$f(1) = 2e^3 ≈ 40,17$"], "2e³ ≈ 40,17"),
    practice("Ejercicio guiado", "am-edo-separable", 1, 4, true),
    explain(
      "Errores típicos",
      "• Escribir la constante sumando: es $Ce^{G(x)}$, no $e^{G(x)} + C$.\n• Copiar $αx + β$ en el exponente sin integrarlo.\n• Integrar mal: $∫ 2x dx = x^2$ (se divide por 2).\n• Verificá siempre: derivá tu f y comprobá que da $g(x)·f$.",
      { tag: "matematico" },
    ),
    practice("Tu turno", "am-edo-separable", 4, 6),
    practice("Mini desafío", "am-edo-separable", 6, 2),
    summary([
      "f′ = g(x)·f ⇒ f = C·e^{G(x)}, con G′ = g.",
      "C sale de la condición inicial (C = f(0) si G(0) = 0).",
      "La constante multiplica a la exponencial.",
      "Verificá derivando.",
    ]),
  ],
  tutor: {
    normal: "Una ecuación diferencial separable de la forma f′ = g(x)·f se resuelve dividiendo por f e integrando: ln|f| = G(x) + K, de donde f(x) = C·e^{G(x)}. La condición inicial determina C.",
    simple: "Pasás la f dividiendo, integrás los dos lados (a la izquierda queda ln f) y despejás con la exponencial. El número del dato inicial te dice cuánto vale la constante.",
    nino: "Una bola de nieve que rueda junta más nieve cuanto más grande es. Si sabés cuánto crece según su tamaño y cuánto medía al principio, podés saber cuánto mide en cualquier momento.",
    ejemplo: "f′ = 2x·f, f(0) = 4: ln|f| = x² + K ⇒ f = 4e^{x²}.",
    visual: { type: "param-function", family: "exponencial" },
    visualText: "Las soluciones de f′ = k·f son exponenciales: k decide qué tan rápido crecen o decrecen.",
    fromZero: "Una ecuación diferencial pide encontrar una función a partir de una relación con su derivada. En las separables, f′/f depende solo de x. Como (ln|f|)′ = f′/f, alcanza con integrar esa expresión de x y despejar f.",
    why: "Muchísimos fenómenos dicen «la velocidad de cambio es proporcional a la cantidad»: este método los resuelve.",
    origin: "Por la regla de la cadena, (ln|f(x)|)′ = f′(x)/f(x). Si eso es g(x), entonces ln|f| es una primitiva de g, y aplicando exponencial se obtiene f.",
    board: EDO_BOARD,
  },
};

// ───────────────────────── am-11 · Series ─────────────────────────

const SERIES_BOARD: BoardStep[] = [
  { expr: "Σ (x − 1)^n/(n·3^n)", note: "Serie de potencias centrada en 1" },
  { expr: "ⁿ√(|x − 1|^n/(n·3^n)) → |x − 1|/3", note: "Criterio de la raíz: $ⁿ√n → 1$" },
  { expr: "|x − 1|/3 < 1  →  −2 < x < 4", note: "Converge en el abierto" },
  { expr: "x = 4:  Σ 1/n", note: "Armónica: diverge" },
  { expr: "x = −2:  Σ (−1)^n/n", note: "Alternada: converge por Leibniz" },
  { expr: "[−2; 4)", note: "Intervalo de convergencia" },
];

export const amSeries: Lesson = {
  id: "l-am-series",
  title: "Series",
  subtitle: "Geométricas y de potencias",
  subjectId: "am-a",
  topicIds: ["t-am-series"],
  estimatedMinutes: 12,
  prerequisites: ["t-am-lim-infinito"],
  cards: [
    intro("Series", "Sumar series geométricas y hallar dónde converge una serie de potencias con el criterio de la raíz y el análisis de los extremos.", "El segundo parcial trae una serie de potencias en opción múltiple, y el final suele traer una geométrica con parámetro."),
    explain(
      "Sumar infinitas cosas",
      "Caminá la mitad de la distancia a una pared, después la mitad de lo que queda, y así: $\\frac{1}{2} + \\frac{1}{4} + \\frac{1}{8} + …$ Infinitos pasos, pero nunca pasás la pared: la suma es **1**.\n\nUna serie converge si sus sumas parciales se acercan a un número.",
      { tag: "cotidiano" },
    ),
    explain(
      "Geométrica",
      "$Σ_{n=0}^{∞} r^n = \\frac{1}{1 − r}$ si $|r| < 1$; si $|r| ≥ 1$, diverge.\n\nEn general: **suma = primer término / (1 − r)**. Por ejemplo $Σ_{n=0}^{∞} 3(\\frac{2}{5})^n = \\frac{3}{1 − 2/5} = 5$. Mirá cómo $\\frac{1}{1 − x}$ explota en $x = 1$:",
      { tag: "matematico", widget: { type: "plot", mode: "free", initial: "1/(1 - x)" } },
    ),
    quiz("Pregunta rápida", {
      id: "q-am-ser-1", subjectId: "am-a", topicId: "t-am-series",
      prompt: "¿Cuánto vale $Σ_{n=1}^{∞} (\\frac{1}{3})^n$?",
      options: ["1/2", "3/2", "Diverge"],
      answer: 0,
      explanation: "Empieza en n = 1: primer término 1/3. Suma = (1/3)/(1 − 1/3) = 1/2.",
      hints: ["¿Cuál es el primer término?", "Con n = 1: 1/3.", "Suma = primer término/(1 − r)."],
      errors: { 1: ["formula", "3/2 sería empezando en n = 0. Acá el primer término es 1/3."], 2: ["limites", "|r| = 1/3 < 1: converge."] },
    }),
    explain(
      "Series de potencias",
      "Para $Σ a_n (x − c)^n$ usá el **criterio de la raíz**: si $ⁿ√|término| → L$, converge cuando $L < 1$ y diverge si $L > 1$.\n\nEso da un intervalo abierto. En los **extremos** el criterio no decide: reemplazá x y estudiá la serie numérica (armónica $Σ 1/n$ diverge; $Σ 1/n^2$ converge; alternada $Σ (−1)^n/n$ converge por Leibniz; si el término no tiende a 0, diverge).",
      { tag: "matematico" },
    ),
    board("Pizarra: intervalo de convergencia", SERIES_BOARD),
    example("Ejemplo: geométrica con parámetro", "Hallá $a > 0$ con $Σ_{n=0}^{∞} \\frac{2^{n+1}}{a^{2n}} = \\frac{8}{3}$", ["$= 2·Σ(\\frac{2}{a^2})^n = \\frac{2}{1 − 2/a^2} = \\frac{2a^2}{a^2 − 2}$", "$\\frac{2a^2}{a^2 − 2} = \\frac{8}{3}$ ⇒ $6a^2 = 8a^2 − 16$ ⇒ $a^2 = 8$", "$a = √8 = 2√2$ (y $|r| = 2/8 < 1$ ✓)"], "a = 2√2"),
    practice("Ejercicio guiado", "am-serie-geometrica", 1, 4, true),
    explain(
      "Errores típicos",
      "• Usar $\\frac{1}{1 − r}$ cuando la serie empieza en n = 1.\n• Incluir extremos donde $|r| = 1$ en una geométrica (ahí diverge).\n• No analizar los extremos de una serie de potencias.\n• Invertir el radio: $\\frac{2|x|}{5} < 1$ ⇒ $|x| < \\frac{5}{2}$.\n• Si x está en el denominador, la región queda afuera de un intervalo.",
      { tag: "matematico" },
    ),
    practice("Tu turno", "am-serie-potencias", 2, 6),
    practice("Tu turno", "am-serie-geometrica", 4, 9),
    practice("Mini desafío", "am-serie-potencias", 6, 3),
    summary([
      "Geométrica: primer término/(1 − r), solo si |r| < 1.",
      "Potencias: criterio de la raíz → intervalo abierto.",
      "Extremos: reemplazar y comparar con series conocidas (armónica, 1/n², Leibniz).",
      "Si el término general no tiende a 0, la serie diverge.",
    ]),
  ],
  tutor: {
    normal: "Una serie Σaₙ converge si la sucesión de sumas parciales tiene límite. La geométrica Σrⁿ converge a 1/(1 − r) si |r| < 1. Para series de potencias, el criterio de la raíz determina un intervalo abierto de convergencia; los extremos se analizan por separado.",
    simple: "Sumar infinitos términos puede dar un número si los términos se achican lo suficientemente rápido. La geométrica tiene fórmula. Para las de potencias, el criterio de la raíz te da los x que sirven, y los dos bordes los revisás a mano.",
    nino: "Si cada día comés la mitad de lo que queda de una torta, nunca te comés más de una torta entera, aunque sigas para siempre.",
    ejemplo: "Σ_{n=0}^{∞} (1/2)ⁿ = 1/(1 − 1/2) = 2.",
    visual: { type: "plot", mode: "free", initial: "1/(1 - x)" },
    visualText: "1/(1 − x) es la suma de Σxⁿ para |x| < 1; en x = 1 explota.",
    fromZero: "Una serie es una suma de infinitos términos. Para darle sentido se suman los primeros n y se mira si eso se acerca a un número cuando n crece. En la geométrica, la suma de los primeros n es (1 − rⁿ)/(1 − r), y si |r| < 1, rⁿ → 0.",
    why: "Las series permiten escribir funciones como «polinomios infinitos» (Taylor) y calcular valores con la precisión que haga falta.",
    origin: "S = 1 + r + … + rⁿ⁻¹ y rS = r + … + rⁿ; restando, S(1 − r) = 1 − rⁿ. El criterio de la raíz compara con una geométrica de razón L.",
    board: SERIES_BOARD,
  },
};


/** Normaliza el markup matemático de todos los textos de una lección (ver mathFix). */
function fixLesson(l: Lesson): Lesson {
  const fix = (v: unknown): unknown => (typeof v === "string" ? mathFix(v) : Array.isArray(v) ? v.map(fix) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fix(x)])) : v);
  return fix(l) as Lesson;
}

export const amLessons: Lesson[] = [amLimRaices, amLimInfinito, amLimE, amContinuidad, amAsintotas, amReglasDerivacion, amRectaTangente, amDerivabilidad, amLhopital, amEstudioFuncion, amExtremosAbsolutos, amTaylor, amPrimitivas, amPartesFracciones, amTfc, amArea, amEdo, amSeries].map(fixLesson);
