import type { Lesson } from "@/engine/types";
import { example, explain, intro, practice, quiz, summary } from "./helpers";

const S = "pensamiento-computacional";

export const algoritmos: Lesson = {
  id: "l-algoritmos",
  title: "Algoritmos y variables",
  subtitle: "Instrucciones precisas para una máquina",
  subjectId: S,
  topicIds: ["t-variables-codigo"],
  estimatedMinutes: 12,
  prerequisites: [],
  cards: [
    intro("Algoritmos", "Qué es un algoritmo, qué es una variable en programación y cómo seguir la ejecución de un programa línea por línea.", "Pensamiento Computacional es materia del CBC para Ingeniería, y programar es una herramienta de todo ingeniero. La habilidad central es saber qué hace un programa SIN ejecutarlo."),
    explain(
      "Un algoritmo",
      "Un **algoritmo** es una secuencia finita de pasos precisos para resolver un problema. Una receta es casi un algoritmo; lo que le falta es precisión: «sal a gusto» no es una instrucción que una computadora pueda seguir.\n\nPensar algorítmicamente es **descomponer** el problema en pasos tan claros que no admitan dudas.",
      { tag: "cotidiano" },
    ),
    explain(
      "Variables en programación",
      "En un programa, una variable es una **caja con nombre** que guarda un valor. `x = 5` significa «guardá 5 en la caja x».\n\n¡Ojo! El `=` de programación **no** es el igual de matemática: es una **orden** («asigná»). Por eso `x = x + 1` tiene sentido: «calculá x + 1 y guardalo en x».",
      { tag: "intuitivo" },
    ),
    explain(
      "Seguir la ejecución",
      "El programa se ejecuta de arriba hacia abajo. Usá los botones para avanzar paso a paso y mirá cómo cambian las variables:",
      { widget: { type: "code", code: "x = 5\ny = 3\nresultado = x + y\nx = x * 2\nprint(resultado, x)" } },
    ),
    example("Ejemplo resuelto", "¿Qué valores quedan?\n`a = 4`\n`b = a + 1`\n`a = 10`", ["Línea 1: a = 4", "Línea 2: b = 4 + 1 = 5", "Línea 3: a = 10 (b NO cambia: guardó un 5 y ahí sigue)"], "a = 10, b = 5"),
    practice("Ejercicio guiado", "traza-asignacion", 1, 2, true),
    explain(
      "Intercambiar dos variables",
      "¿Cómo intercambiar los valores de `a` y `b`? Si hacés `a = b` y después `b = a`, el valor original de `a` **se perdió** en el primer paso.\n\nSolución: una variable auxiliar.\n`aux = a`\n`a = b`\n`b = aux`",
      { widget: { type: "code", code: "a = 1\nb = 2\naux = a\na = b\nb = aux" } },
    ),
    practice("Tu turno", "traza-asignacion", 3, 7),
    practice("Mini desafío", "traza-asignacion", 5, 13),
    summary(["Algoritmo: pasos finitos, precisos y ordenados.", "Variable: caja con nombre que guarda un valor.", "`=` en programación significa «asignar», no «es igual».", "Seguí un programa con una tabla: una columna por variable."]),
  ],
  tutor: {
    normal: "Un algoritmo es una secuencia finita y ordenada de instrucciones no ambiguas. Una variable es un nombre asociado a un valor que puede cambiar; la asignación evalúa la expresión de la derecha y guarda el resultado en la variable de la izquierda.",
    simple: "Un programa son instrucciones que se hacen una por una, de arriba hacia abajo. Las variables son cajitas donde se guardan números.",
    nino: "Es como darle instrucciones a un robot muy obediente pero que no entiende nada que no le digas exactamente.",
    ejemplo: "x = 2, después x = x + 3 → ahora x vale 5. El valor 2 se reemplazó.",
    visual: { type: "code", code: "contador = 0\ncontador = contador + 1\ncontador = contador + 1\nprint(contador)" },
  },
};

export const condicionales: Lesson = {
  id: "l-condicionales",
  title: "Condicionales y lógica",
  subtitle: "Tomar decisiones",
  subjectId: S,
  topicIds: ["t-condicionales"],
  estimatedMinutes: 12,
  prerequisites: ["t-variables-codigo"],
  cards: [
    intro("Condicionales", "Cómo un programa elige entre caminos con if / elif / else, y cómo combinar condiciones con and, or, not.", "Toda la lógica de un programa (y de un circuito digital) se basa en decisiones de verdadero/falso."),
    explain(
      "Verdadero o falso",
      "Una **condición** es una pregunta que se responde con `True` (verdadero) o `False` (falso):\n\n`5 > 3` → True · `2 == 7` → False · `x != 0` → «¿x es distinto de 0?»\n\nOjo: `==` **compara**; `=` **asigna**.",
      { tag: "matematico" },
    ),
    explain(
      "if / elif / else",
      "El programa elige **un solo** camino: el primero cuya condición sea verdadera.\n\nAvanzá paso a paso y fijate qué líneas se saltean:",
      { widget: { type: "code", code: "temperatura = 31\nif temperatura > 30:\n    consejo = \"hace calor\"\nelif temperatura > 15:\n    consejo = \"templado\"\nelse:\n    consejo = \"abrigate\"\nprint(consejo)" } },
    ),
    practice("Ejercicio guiado", "traza-if", 2, 3, true),
    explain(
      "and, or, not",
      "• `A and B`: verdadero solo si **ambas** lo son.\n• `A or B`: verdadero si **al menos una** lo es.\n• `not A`: lo contrario.\n\nEjemplo: para aprobar hace falta `nota >= 4 and asistencia >= 75`.",
      { tag: "cotidiano" },
    ),
    practice("Tu turno", "logica-booleana", 2, 5),
    practice("Tu turno", "traza-if", 4, 11),
    quiz("Para pensar", {
      id: "q-if-orden",
      subjectId: S,
      topicId: "t-condicionales",
      prompt: "Con `nota = 9`, ¿qué imprime?\n`if nota >= 4:`\n`    print(\"aprobado\")`\n`elif nota >= 7:`\n`    print(\"promocionado\")`",
      options: ["aprobado", "promocionado", "aprobado y promocionado"],
      answer: 0,
      explanation: "La primera condición (9 >= 4) ya es verdadera, así que se ejecuta ese bloque y los elif se saltean. El orden de las condiciones importa: las más exigentes deberían ir primero.",
      hints: ["El if elige UN solo camino.", "¿Cuál es la primera condición verdadera?", "Después de ejecutar un bloque, los elif/else se saltean."],
      errors: { 1: ["logica", "Aunque 9 >= 7 es verdadero, nunca se llega a evaluar: la primera condición ya fue verdadera."], 2: ["logica", "Un if/elif ejecuta un solo bloque."] },
    }),
    practice("Mini desafío", "logica-booleana", 5, 9),
    summary(["Una condición vale True o False.", "`==` compara, `=` asigna.", "if/elif/else ejecuta UN solo bloque: el primero verdadero.", "and: ambas; or: alguna; not: lo contrario."]),
  ],
  tutor: {
    normal: "Una estructura condicional evalúa expresiones booleanas en orden y ejecuta el bloque de la primera que resulte verdadera; si ninguna lo es, ejecuta el else.",
    simple: "«Si pasa esto, hacé aquello; si no, hacé otra cosa». El programa revisa las condiciones de arriba hacia abajo y entra en la primera que se cumple.",
    nino: "Si llueve, llevo paraguas. Si no, si hace sol, llevo gorra. Si no, no llevo nada.",
    ejemplo: "x = −3 → `if x < 0:` es verdadero, así que entra ahí y no mira el else.",
  },
};

export const bucles: Lesson = {
  id: "l-bucles",
  title: "Bucles",
  subtitle: "Repetir sin copiar y pegar",
  subjectId: S,
  topicIds: ["t-bucles"],
  estimatedMinutes: 15,
  prerequisites: ["t-condicionales"],
  cards: [
    intro("Bucles", "Repetir instrucciones con for y while, y usar acumuladores y contadores.", "Los bucles son lo que hace poderosa a una computadora: repetir millones de veces sin cansarse. Y los errores de «una vuelta de más o de menos» son de los más comunes en programación."),
    explain(
      "for con range",
      "`for i in range(5):` repite el bloque 5 veces, con `i` valiendo **0, 1, 2, 3, 4**.\n\n`range(a, b)` va de `a` hasta `b − 1`: **el último no se incluye**. `range(1, 4)` → 1, 2, 3.",
      { tag: "matematico" },
    ),
    explain(
      "Acumuladores",
      "Para sumar muchos números, se usa una variable que empieza en 0 y en cada vuelta suma algo. Avanzá y mirá cómo crece `suma`:",
      { widget: { type: "code", code: "suma = 0\nfor i in range(1, 6):\n    suma = suma + i\nprint(suma)" } },
    ),
    example("Ejemplo resuelto", "¿Cuánto vale `total` al final?\n`total = 0`\n`for i in range(3):`\n`    total += 10`", ["range(3) genera 0, 1, 2: son 3 vueltas", "Cada vuelta suma 10", "0 + 10 + 10 + 10 = 30"], "30"),
    practice("Ejercicio guiado", "traza-for", 1, 4, true),
    practice("Tu turno", "traza-for", 3, 10),
    explain(
      "while: repetir mientras...",
      "`while condición:` repite mientras la condición sea verdadera. Se usa cuando **no sabés de antemano** cuántas vueltas hacen falta.\n\nPeligro: si nada dentro del bucle cambia la condición, **nunca termina** (bucle infinito).",
      { widget: { type: "code", code: "n = 100\npasos = 0\nwhile n > 1:\n    n = n // 2\n    pasos += 1\nprint(pasos)" } },
    ),
    practice("Tu turno", "traza-while", 2, 3),
    practice("Mini desafío", "traza-for", 5, 17),
    summary(["for i in range(n): n vueltas, i de 0 a n−1.", "range(a, b) NO incluye b.", "Acumulador: empieza en 0 (suma) o 1 (producto).", "while: repite mientras la condición sea verdadera; asegurate de que en algún momento sea falsa."]),
  ],
  tutor: {
    normal: "Un bucle for itera sobre una secuencia (como range(a, b), que genera a, …, b−1); un while repite mientras su condición sea verdadera. Los acumuladores combinan valores a lo largo de las iteraciones.",
    simple: "Un bucle repite un pedazo de código. Con for decís cuántas veces; con while decís hasta cuándo.",
    nino: "«Hacé 10 sentadillas» es un for. «Corré hasta que te canses» es un while.",
    ejemplo: "for i in range(4): print(i) imprime 0, 1, 2, 3 (cuatro números, sin el 4).",
    visual: { type: "code", code: "for i in range(3):\n    print(\"vuelta\", i)" },
  },
};

export const codigoLessons = [algoritmos, condicionales, bucles];
