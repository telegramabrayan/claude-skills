import type { BoardStep, ErrorType, Lesson, LessonCard } from "@/engine/types";
import { run } from "@/engine/code/interpreter";
import { shown } from "@/engine/generators/pc";
import { explain, intro, practice, quiz, summary } from "./helpers";

/**
 * Lecciones de Pensamiento Computacional (Python) orientadas a la lectura de
 * código del primer parcial. Las respuestas de los quizzes y los resultados de
 * los ejemplos NO están escritos a mano: se obtienen ejecutando el código con el
 * intérprete (verificado contra CPython). Si un distractor coincide con la
 * salida real, la carga del módulo falla (así se detecta el error al testear).
 */

const S = "pensamiento-computacional";
const block = (code: string) => "```\n" + code + "\n```";
const board = (title: string, steps: BoardStep[], introText?: string, outro?: string): LessonCard => ({ kind: "board", title, steps, intro: introText, outro });

function outputOf(code: string): string {
  const r = run(code);
  if (!r.ok) throw new Error(`Código de lección inválido: ${r.error?.message}\n${code}`);
  return r.stdout;
}

/** Texto de opción: salida literal (sin el salto final), o "∅" = no muestra nada, "ERR" = da error. */
const opt = (raw: string) => (raw === "∅" ? "No muestra nada" : raw === "ERR" ? "Da error" : shown(raw + "\n"));

function codeQuiz(
  title: string,
  a: { id: string; topicId: string; code: string; question?: string; wrongs: [string, ErrorType, string][]; pos: number; explanation: string; hints: [string, string, string] },
  guided = false,
): LessonCard {
  const correct = shown(outputOf(a.code));
  const wrongs = a.wrongs.map(([raw, t, m]) => [opt(raw), t, m] as [string, ErrorType, string]);
  wrongs.forEach(([w]) => {
    if (w === correct) throw new Error(`${a.id}: un distractor coincide con la salida real (${w})`);
  });
  const pos = Math.min(a.pos, wrongs.length);
  const options = wrongs.map((w) => w[0]);
  options.splice(pos, 0, correct);
  const errors: Record<number, [ErrorType, string]> = {};
  options.forEach((o, i) => {
    const w = wrongs.find((x) => x[0] === o);
    if (i !== pos && w) errors[i] = [w[1], w[2]];
  });
  return quiz(
    title,
    { id: a.id, subjectId: S, topicId: a.topicId, prompt: `${a.question ?? "¿Qué muestra este programa?"}\n\n${block(a.code)}`, options, answer: pos, explanation: a.explanation, hints: a.hints, errors },
    guided,
  );
}

/** Ejemplo resuelto cuyo resultado sale de ejecutar el código. */
function codeExample(title: string, question: string, code: string, steps: string[]): LessonCard {
  return { kind: "example", title, problem: `${question}\n\n${block(code)}`, steps, result: `Muestra: ${shown(outputOf(code))}` };
}

// ═══════════════════════════ pc-tipos ═══════════════════════════

const tiposBoard: BoardStep[] = [
  { expr: '"7" * 2 = "77"', note: "Texto por entero: repite el texto" },
  { expr: 'int("7") * 2 = 14', note: "Convertimos a número y después multiplicamos" },
  { expr: "7 / 2 = 3.5", note: "`/` siempre da float" },
  { expr: "8 / 4 = 2.0", note: "Aunque sea exacta, sigue siendo float" },
  { expr: "8 // 4 = 2", note: "`//` entre enteros da int" },
  { expr: '"7" + 2 → TypeError', note: "No se puede sumar texto con número" },
];

export const pcTipos: Lesson = {
  id: "l-pc-tipos",
  title: "Tipos de datos y conversiones",
  subtitle: "int, float, str, bool… y cuándo Python da error",
  subjectId: S,
  topicIds: ["t-pc-tipos"],
  estimatedMinutes: 10,
  prerequisites: ["t-variables-codigo"],
  cards: [
    intro(
      "Tipos de datos",
      "Los tipos básicos de Python (int, float, str, bool), qué hace cada operador según el tipo, cómo convertir con int(), float() y str(), y por qué aparece un TypeError.",
      "En el parcial siempre hay una pregunta del estilo «¿cuál de estos programas da error?». Y todo lo que llega con input() es texto: si no lo convertís, las cuentas fallan.",
    ),
    explain(
      "Cada valor tiene un tipo",
      "`7` es un entero (**int**), `7.0` es un decimal (**float**), `\"7\"` es un texto (**str**) y `True` es un booleano (**bool**).\n\nSe parecen, pero se comportan distinto. Pensalo como un cartel que dice «7» y siete manzanas: a las manzanas las podés sumar; al cartel solo lo podés pegar al lado de otro cartel o fotocopiar varias veces.",
      { tag: "cotidiano" },
    ),
    codeQuiz("Rápido", {
      id: "q-pc-tipos-rep", topicId: "t-pc-tipos", pos: 1,
      code: 'x = "4"\nprint(x * 3)',
      wrongs: [["12", "conceptual", "x es un texto (tiene comillas): `\"4\" * 3` repite el texto tres veces."], ["ERR", "programacion", "Texto por un ENTERO es válido: repite el texto. Lo que da error es texto por float o texto por texto."], ["4 4 4", "programacion", "La repetición pega las copias sin espacios."]],
      explanation: "`str * int` repite el texto: `\"4\" * 3` es `\"444\"`.",
      hints: ["¿x es un número o un texto?", "Las comillas indican texto.", "Texto por entero = el texto repetido."],
    }),
    explain(
      "Qué hace cada operador",
      "• `+`: suma números; con dos textos los **pega**.\n• `*`: multiplica números; texto × **entero** lo **repite**.\n• `/` siempre da **float**; `//` y `%` entre int dan int.\n• Texto con número en `+`, `-`, `/`, `//`, o texto × float → **TypeError**.\n\nPara operar, convertí: `int(\"7\")`, `float(\"2.5\")`, `str(10)`. Avanzá paso a paso:",
      { tag: "matematico", widget: { type: "code", code: 'x = "7"\ny = x * 2\nz = int(x) * 2\nw = int(x) / 2\nprint(y, z, w)' } },
    ),
    board("Mismo 7, distintos tipos", tiposBoard, "Fijate cómo el tipo decide el resultado:"),
    codeExample("Ejemplo resuelto", "¿Qué muestra?", 'a = "3"\nb = int(a) + 1\nc = a + "1"\nprint(b, c)', [
      'a es el texto "3".',
      "int(a) convierte a 3; más 1 da 4 (un número).",
      'a + "1" pega dos textos: "31".',
      "print separa con un espacio.",
    ]),
    practice("Ejercicio guiado", "pc-tipos-salida", 1, 3, true),
    explain(
      "Error típico: lo que viene de input()",
      "`input()` **siempre** devuelve texto, aunque el usuario escriba un número. Por eso `edad = input()` y después `edad + 1` da **TypeError**. La solución es convertir: `edad = int(input())`.\n\nOtro clásico: `int(\"2.5\")` da **ValueError** (int no acepta coma decimal). Primero float, después int: `int(float(\"2.5\"))` da 2.\n\nEn los ejercicios, en lugar de input() el valor se escribe directo, por ejemplo `x = \"7\"`.",
    ),
    practice("Tu turno", "pc-tipo-error", 2, 5),
    practice("Más difícil", "pc-tipo-error", 5, 11),
    summary([
      "Tipos básicos: int, float, str, bool.",
      "`+` pega textos; `*` por un entero repite textos.",
      "`/` siempre da float; `//` entre int da int.",
      "Texto con número en una cuenta → TypeError. Convertí con int(), float(), str().",
      "input() siempre devuelve str.",
    ]),
  ],
  tutor: {
    normal: "Cada valor en Python tiene un tipo que determina qué operaciones admite. Los operadores están sobrecargados: `+` suma números y concatena secuencias; `*` multiplica números y repite secuencias por un entero. Combinar tipos incompatibles produce TypeError; convertir textos inválidos produce ValueError.",
    simple: "Un número y un texto no son lo mismo aunque se vean igual. Con números hacés cuentas; con textos los pegás o los repetís. Si mezclás, Python se queja.",
    nino: "Es como la diferencia entre tener 3 billetes y tener un papelito que dice «3». Con los billetes pagás; con el papelito no, aunque diga 3. Para usarlo como plata primero tenés que «canjearlo» (convertir con int).",
    ejemplo: '"5" + "5" da "55"; 5 + 5 da 10; "5" * 2 da "55"; "5" + 5 da TypeError.',
    visual: { type: "code", code: 'texto = "5"\nnumero = int(texto)\nprint(texto * 2, numero * 2)' },
    visualText: "Mirá cómo el mismo 5 se comporta distinto según el tipo.",
    fromZero: "Un programa guarda datos en variables. Cada dato es de un tipo: números enteros (int), números con decimales (float), textos entre comillas (str) o verdadero/falso (bool). Las operaciones dependen del tipo: no es lo mismo «sumar» dos números que «sumar» dos textos.",
    why: "Distinguir tipos evita errores que la computadora no perdona. En el parcial, reconocer qué operación es válida para cada tipo te permite detectar al instante qué programa falla.",
    origin: "Los lenguajes definen operaciones para cada tipo. Python eligió reutilizar `+` y `*` para textos y listas (concatenar y repetir) porque es intuitivo, pero no definió `-` ni `/` para textos: por eso esas combinaciones dan TypeError.",
    board: tiposBoard,
  },
};

// ═══════════════════════════ // y % ═══════════════════════════

const divModBoard: BoardStep[] = [
  { expr: "−17 / 5 = −3.4", note: "La división común" },
  { expr: "−17 // 5 = −4", note: "Redondeamos hacia abajo (hacia −∞), no hacia el cero" },
  { expr: "5 · (−4) = −20", note: "El múltiplo de 5 que queda justo debajo" },
  { expr: "−17 − (−20) = 3", note: "Lo que sobra" },
  { expr: "−17 % 5 = 3", note: "Con divisor positivo, el resto nunca es negativo" },
];

export const pcDivMod: Lesson = {
  id: "l-pc-div-mod",
  title: "// y %, también con negativos",
  subtitle: "División entera, resto y condicionales anidados",
  subjectId: S,
  topicIds: ["t-pc-aritmetica", "t-pc-condicionales"],
  estimatedMinutes: 11,
  prerequisites: ["t-pc-tipos", "t-condicionales"],
  cards: [
    intro(
      "División entera y resto",
      "Qué calculan `//` y `%`, cómo se comportan con números negativos en Python y cómo seguir condicionales anidados que los usan.",
      "Con `%` se decide si un número es par, cuál es su última cifra o si es múltiplo de otro. Y con negativos Python NO hace lo mismo que la calculadora: es una trampa clásica del parcial.",
    ),
    explain(
      "Repartir caramelos",
      "Tenés 17 caramelos para 5 chicos. A cada uno le tocan **3** y sobran **2**.\n\nEso es exactamente: `17 // 5` → 3 (cuántos le tocan a cada uno) y `17 % 5` → 2 (cuántos sobran).\n\nUsos típicos: `n % 2 == 0` (¿es par?), `n % 10` (última cifra), `n // 10` (sacar la última cifra).",
      { tag: "cotidiano" },
    ),
    codeQuiz("Rápido", {
      id: "q-pc-divmod-pos", topicId: "t-pc-aritmetica", pos: 0,
      code: "print(23 // 4, 23 % 4)",
      wrongs: [["5.75 3", "conceptual", "`//` es división entera: descarta los decimales."], ["3 5", "programacion", "Respetá el orden del print: primero `//`, después `%`."], ["6 1", "calculo", "4 × 6 = 24 se pasa de 23: entran 5 veces y sobran 3."]],
      explanation: "23 = 4 · 5 + 3: el cociente entero es 5 y el resto 3.",
      hints: ["¿Cuántas veces entra 4 en 23?", "4 · 5 = 20.", "Lo que sobra es 23 − 20."],
    }),
    explain(
      "Con negativos: hacia −∞",
      "Python garantiza que `a == b * (a // b) + a % b`, y `//` siempre redondea **hacia abajo** (hacia −∞).\n\n−17 / 5 = −3.4 → hacia abajo es **−4** (no −3). Entonces el resto es −17 − 5·(−4) = **3**.\n\nRegla práctica: con divisor positivo, `%` da siempre un valor entre 0 y el divisor − 1.",
      { tag: "matematico", widget: { type: "code", code: "a = -17\nq = a // 5\nr = a % 5\nprint(q, r)\nprint(5 * q + r)" } },
    ),
    board("Calcular −17 // 5 y −17 % 5", divModBoard),
    codeExample("Ejemplo resuelto", "¿Qué muestra?", "num = -103\nprint(num % 100, num // 100)", [
      "−103 / 100 = −1.03 → hacia abajo: num // 100 = −2.",
      "100 · (−2) = −200.",
      "num % 100 = −103 − (−200) = 97.",
      "Se muestra primero el resto y después el cociente.",
    ]),
    practice("Ejercicio guiado", "pc-div-mod", 1, 2, true),
    explain(
      "Condicionales anidados",
      "Un `if` puede estar **dentro** de otro: solo se evalúa si se entró al de afuera. Ojo con tres cosas:\n\n• Un `if` sin `else` puede **no mostrar nada**.\n• Dos `if` seguidos (no `elif`) se evalúan **los dos**.\n• Con `if/elif/else` se ejecuta **un solo** bloque.\n\nError típico: calcular `%` con negativos como la calculadora (truncando). −17 % 10 es **3**, no −7.",
      { widget: { type: "code", code: 'num = -17\nif num % 10 > 5:\n    print("termina alto")\nelse:\n    if num // 10 < -1:\n        print("decena chica")\nif num % 2 == 1:\n    print("impar")' } },
    ),
    practice("Tu turno", "pc-div-mod", 3, 8),
    practice("Condicionales", "pc-if-anidado", 3, 4),
    practice("Más difícil", "pc-if-anidado", 5, 9),
    summary([
      "`a // b`: cociente entero, redondeando hacia −∞.",
      "`a % b`: resto; con b positivo, entre 0 y b − 1.",
      "Siempre vale a == b·(a // b) + a % b.",
      "−17 // 5 = −4 y −17 % 5 = 3 (no −3 y −2).",
      "Un if sin else puede no mostrar nada; dos if separados se evalúan los dos.",
    ]),
  ],
  tutor: {
    normal: "La división entera `//` devuelve el piso del cociente (redondeo hacia −∞) y `%` devuelve el resto correspondiente, de modo que a = b·(a // b) + a % b. Así, con divisor positivo, el resto pertenece a [0, b).",
    simple: "`//` te dice cuántas veces entra un número en otro, y `%` lo que sobra. Con negativos, Python redondea hacia abajo, así que el resto queda positivo.",
    nino: "Si tenés que devolver 17 pesos con billetes de 5, das 3 billetes y quedan 2 sueltos. Con deudas (negativos) es como «pasarte»: para cubrir −17 necesitás −4 billetes (−20) y te quedan 3 a favor.",
    ejemplo: "17 // 5 = 3 y 17 % 5 = 2; −17 // 5 = −4 y −17 % 5 = 3.",
    visual: { type: "code", code: "for n in [17, -17, 103, -103]:\n    print(n, n // 10, n % 10)" },
    visualText: "Compará los resultados con positivos y negativos.",
    fromZero: "Dividir 17 por 5 da 3.4. La parte entera de esa división (cuántas veces entra 5 en 17) es 3, y lo que sobra es 2, porque 5·3 + 2 = 17. En Python, la parte entera se pide con `//` y lo que sobra con `%`.",
    why: "El resto sirve para preguntar cosas sobre números: si es par (resto 0 al dividir por 2), cuál es su última cifra (resto al dividir por 10), si es múltiplo de otro. Son las herramientas básicas para trabajar con dígitos y ciclos.",
    origin: "Es la división entera de la aritmética: para enteros a y b > 0 existen únicos q y r con a = b·q + r y 0 ≤ r < b. Python eligió extender esa definición a negativos (q = piso de a/b), por eso el resto queda en [0, b).",
    board: divModBoard,
  },
};

// ═══════════════════════════ booleanos ═══════════════════════════

const boolBoard: BoardStep[] = [
  { expr: "not 4 > 6 and 20 < 15 or 4 == 12", note: "Con mes = 4 y dia = 20" },
  { expr: "not False and False or False", note: "Primero las comparaciones" },
  { expr: "True and False or False", note: "Después `not`" },
  { expr: "False or False", note: "Después `and`" },
  { expr: "False", note: "Por último `or`" },
];

export const pcBooleanos: Lesson = {
  id: "l-pc-booleanos",
  title: "Booleanos, precedencia y range",
  subtitle: "and, or, not… en qué orden se evalúan",
  subjectId: S,
  topicIds: ["t-pc-booleanos"],
  estimatedMinutes: 10,
  prerequisites: ["t-condicionales"],
  cards: [
    intro(
      "Expresiones booleanas",
      "Cómo evaluar condiciones con `and`, `or` y `not`, en qué orden las resuelve Python, y cómo preguntar si un número está en un `range` o en una tupla.",
      "Toda decisión de un programa es una condición True/False. El primer ejercicio del parcial suele ser exactamente esto: evaluar una condición con mes y día.",
    ),
    explain(
      "Condiciones cotidianas",
      "«Promocionás si tenés 7 o más **y** asistencia de 75 % o más»: `nota >= 7 and asis >= 75`. Tienen que cumplirse las dos.\n\n«Entrás gratis si sos menor de 12 **o** jubilado»: `edad < 12 or jubilado`. Alcanza con una.\n\n«**No** llueve»: `not llueve` invierte el valor.",
      { tag: "cotidiano" },
    ),
    codeQuiz("Rápido", {
      id: "q-pc-bool-not", topicId: "t-pc-booleanos", pos: 0,
      code: "mes = 4\nprint(not mes > 6 and mes < 5)",
      wrongs: [["False", "jerarquia", "`not` se aplica solo a `mes > 6` (que es False), así que da True; y `mes < 5` también es True."], ["ERR", "sintaxis", "Es una expresión válida: `not` puede ir delante de una comparación."]],
      explanation: "Se lee `(not mes > 6) and (mes < 5)` = `True and True` = True.",
      hints: ["Evaluá primero las comparaciones.", "`not` tiene más prioridad que `and`.", "not False = True."],
    }),
    explain(
      "El orden de evaluación",
      "Python evalúa en este orden:\n1. cuentas (`+`, `%`, …)\n2. comparaciones e `in` (`<`, `==`, `in`, `not in`)\n3. `not`\n4. `and`\n5. `or`\n\nEntonces `not a or b and c` es `(not a) or (b and c)`. Los paréntesis cambian el orden.\n\n`x in range(a, b, c)` es True si x es uno de los números que genera el range (sin incluir b).",
      { tag: "matematico", widget: { type: "code", code: "mes = 4\ndia = 20\nr1 = not mes > 6 and dia < 15 or mes == 12\nr2 = mes in range(1, 4)\nr3 = dia in range(30, 0, -5)\nprint(r1, r2, r3)" } },
    ),
    board("Evaluar paso a paso", boolBoard),
    codeExample("Ejemplo resuelto", "¿Qué muestra?", "print(7 in range(1, 7), 4 in range(10, 0, -3))", [
      "range(1, 7) genera 1, 2, 3, 4, 5, 6: el 7 no está → False.",
      "range(10, 0, −3) genera 10, 7, 4, 1 → el 4 está → True.",
    ]),
    practice("Ejercicio guiado", "pc-booleanos", 1, 6, true),
    explain(
      "Error típico: `mes == 1 or 2`",
      "Parece «mes es 1 o 2», pero Python lo lee como `(mes == 1) or 2`, y `2` cuenta como verdadero: ¡la condición es verdadera siempre! Lo correcto es `mes == 1 or mes == 2`, o mejor `mes in (1, 2)`.\n\nOtro clásico es De Morgan: `not (A or B)` es lo mismo que `not A and not B`; y `not (A and B)` es `not A or not B`.",
    ),
    practice("Tu turno", "pc-range", 3, 12),
    practice("Más difícil", "pc-booleanos", 5, 21),
    summary([
      "and: las dos; or: alcanza una; not: invierte.",
      "Orden: comparaciones → not → and → or.",
      "range(a, b, c) no incluye b; con c negativo cuenta hacia abajo.",
      "`mes == 1 or 2` está mal: escribí `mes in (1, 2)`.",
      "De Morgan: not (A or B) = not A and not B.",
    ]),
  ],
  tutor: {
    normal: "Las expresiones booleanas combinan comparaciones con los operadores lógicos not, and y or, cuya precedencia es decreciente en ese orden (y menor que la de las comparaciones). and y or se evalúan en cortocircuito.",
    simple: "Primero resolvé cada comparación (True o False). Después aplicá los not, después los and y al final los or.",
    nino: "Es como las reglas de un juego: «podés pasar si tenés la llave Y la puerta está abierta, O si te abre el portero». Primero ves cada cosa por separado y después las combinás.",
    ejemplo: "Con mes = 4: `mes > 6 or mes < 5` → False or True → True.",
    visual: { type: "code", code: "a = True\nb = False\nprint(not a or b)\nprint(not (a or b))" },
    visualText: "Fijate cómo los paréntesis cambian el resultado.",
    fromZero: "Una comparación como `5 > 3` responde True (verdadero) o False (falso). Para combinar varias preguntas se usan and (las dos), or (alguna) y not (lo contrario). Cuando hay varias juntas, Python sigue un orden fijo, como en las cuentas la multiplicación va antes que la suma.",
    why: "Los programas toman decisiones con condiciones. Leerlas mal (por ejemplo, olvidar que and va antes que or) cambia por completo lo que hace el programa.",
    origin: "Viene del álgebra de Boole: la conjunción (and) se comporta como un producto y la disyunción (or) como una suma, por eso and tiene más prioridad, igual que · antes que +.",
    board: boolBoard,
  },
};

// ═══════════════════════════ strings: índices y slicing ═══════════════════════════

const slicingBoard: BoardStep[] = [
  { expr: 's = "python"', note: "Índices: p=0, y=1, t=2, h=3, o=4, n=5" },
  { expr: 's[1:4] = "yth"', note: "Del 1 al 3: el 4 NO se incluye" },
  { expr: 's[-3:] = "hon"', note: "Las últimas 3 letras" },
  { expr: 's[::2] = "pto"', note: "De a 2: índices 0, 2, 4" },
  { expr: 's[::-1] = "nohtyp"', note: "Paso −1: al revés" },
];

export const pcStrings: Lesson = {
  id: "l-pc-strings",
  title: "Strings: índices y slicing",
  subtitle: "Cortar textos con [a:b:c]",
  subjectId: S,
  topicIds: ["t-pc-strings"],
  estimatedMinutes: 10,
  prerequisites: ["t-pc-tipos"],
  cards: [
    intro(
      "Índices y slicing",
      "Cómo acceder a una letra de un texto (también desde el final) y cómo recortar pedazos con `s[a:b:c]`.",
      "Recortar textos aparece en casi todos los ejercicios: iniciales, últimas letras, invertir una palabra, partir en una posición encontrada con index().",
    ),
    explain(
      "Una fila de casilleros",
      "Un texto es una fila de casilleros numerados **desde 0**. En `s = \"parcial\"`: `s[0]` es \"p\", `s[1]` es \"a\".\n\nTambién se cuenta desde el final con negativos: `s[-1]` es la **última** letra (\"l\") y `s[-2]` la anteúltima.\n\n`len(s)` da la cantidad de letras: 7. El último índice positivo es `len(s) − 1`.",
      { tag: "intuitivo" },
    ),
    codeQuiz("Rápido", {
      id: "q-pc-str-idx", topicId: "t-pc-strings", pos: 2,
      code: 's = "parcial"\nprint(s[2], s[-2])',
      wrongs: [["a i", "programacion", "Los índices empiezan en 0: s[2] es la TERCERA letra."], ["r l", "programacion", "s[-2] es la anteúltima, no la última."], ["a a", "programacion", "Contá desde 0: p(0) a(1) r(2)."]],
      explanation: "s[2] es \"r\" (p=0, a=1, r=2) y s[-2] es \"a\" (l=−1, a=−2).",
      hints: ["El primer índice es 0.", "Los negativos cuentan desde el final: −1 es la última.", "Escribí el índice debajo de cada letra."],
    }),
    explain(
      "Slicing: s[a:b:c]",
      "`s[a:b]` toma desde el índice **a (incluido)** hasta **b (excluido)**. Si falta a, empieza al principio; si falta b, sigue hasta el final.\n\nEl tercer número es el **paso**: `s[::2]` toma una sí y una no; `s[::-1]` recorre al revés (invierte).\n\nUn slice fuera de rango no da error: se recorta hasta donde hay. Probalo:",
      { tag: "matematico", widget: { type: "code", code: 's = "python"\na = s[1:4]\nb = s[-3:]\nc = s[::2]\nd = s[::-1]\nprint(a, b, c, d)' } },
    ),
    board("Recortes de \"python\"", slicingBoard),
    codeExample("Ejemplo resuelto", "¿Qué muestra?", 's = "banana split"\ni = s.index("n")\nprint(s[:i], s[i + 1:])', [
      "index devuelve la PRIMERA aparición: la n está en la posición 2.",
      "s[:2] = \"ba\" (posiciones 0 y 1).",
      "s[3:] = \"ana split\" (desde la posición 3).",
    ]),
    practice("Ejercicio guiado", "pc-slicing", 1, 4, true),
    explain(
      "Errores típicos",
      "• Pensar que `s[1:4]` incluye la posición 4: **no** la incluye (son 4 − 1 = 3 letras).\n• Contar desde 1: el primer índice es **0**.\n• Querer cambiar una letra con `s[0] = \"P\"`: los textos son **inmutables** y eso da TypeError. Hay que armar un texto nuevo: `s = \"P\" + s[1:]`.\n• `s[10]` fuera de rango da IndexError, pero `s[2:10]` no.",
    ),
    practice("Tu turno", "pc-slicing", 3, 9),
    practice("Más difícil", "pc-index-slicing", 4, 14),
    summary([
      "Índices desde 0; −1 es la última letra.",
      "s[a:b] incluye a y excluye b.",
      "s[::-1] invierte; s[::2] salta de a dos.",
      "index() devuelve la primera aparición.",
      "Los textos no se pueden modificar: se arma uno nuevo.",
    ]),
  ],
  tutor: {
    normal: "Un str es una secuencia indexada desde 0; los índices negativos se interpretan como len(s) + i. El slicing s[a:b:c] produce un nuevo str con los caracteres de índices a, a+c, … mientras no se alcance b; los extremos omitidos y fuera de rango se ajustan.",
    simple: "Cada letra tiene un número de posición empezando en 0. Con [a:b] cortás desde a hasta antes de b.",
    nino: "Es como una fila de asientos en el cine: el primero es el asiento 0. «Del asiento 2 al 5» quiere decir 2, 3 y 4: el 5 es donde te frenás.",
    ejemplo: '"python"[1:4] = "yth"; "python"[::-1] = "nohtyp".',
    visual: { type: "code", code: 's = "hola"\nfor i in range(len(s)):\n    print(i, s[i], s[-1 - i])' },
    visualText: "Cada letra con su índice positivo y su espejo desde el final.",
    fromZero: "Un texto (string) es una secuencia de caracteres en orden. Python numera cada posición empezando en 0. Con s[i] obtenés el carácter de la posición i y con s[a:b] un pedazo del texto.",
    why: "Casi cualquier procesamiento de texto (nombres, códigos, fechas) consiste en extraer partes. El slicing permite hacerlo en una línea, sin ciclos.",
    origin: "El intervalo semiabierto [a, b) hace que len(s[a:b]) = b − a y que s[:k] + s[k:] == s siempre: por eso Python excluye el final.",
    board: slicingBoard,
  },
};

// ═══════════════════════════ métodos de strings ═══════════════════════════

const metodosBoard: BoardStep[] = [
  { expr: 't = "bananana"', note: "Buscamos \"ana\" con count" },
  { expr: 'b[ana]nana', note: "Primera aparición: empieza en 1, termina en 3" },
  { expr: 'bana[ana]', note: "Se sigue buscando DESPUÉS: desde 4 → encuentra en 5" },
  { expr: 't.count("ana") = 2', note: "No cuenta las superpuestas (la del índice 3)" },
];

export const pcMetodosStr: Lesson = {
  id: "l-pc-metodos-str",
  title: "Métodos de strings",
  subtitle: "upper, title, count, replace, split, join…",
  subjectId: S,
  topicIds: ["t-pc-metodos-str"],
  estimatedMinutes: 11,
  prerequisites: ["t-pc-strings"],
  cards: [
    intro(
      "Métodos de strings",
      "Los métodos más usados de los textos y qué devuelve cada uno: mayúsculas, contar, reemplazar, partir y unir.",
      "Las funciones del parcial con textos se arman con estos métodos. Y hay dos trampas fijas: los textos no se modifican y las mayúsculas importan.",
    ),
    explain(
      "Transformar",
      "`s.upper()` → todo en MAYÚSCULAS; `s.lower()` → minúsculas.\n`s.title()` → Mayúscula Al Inicio De Cada Palabra.\n`s.capitalize()` → Solo la primera, el resto en minúscula.\n`s.replace(\"a\", \"o\")` → reemplaza **todas** las apariciones.\n`s.strip()` → saca espacios del principio y del final.\n\nTodos **devuelven un texto nuevo**: `s` queda igual salvo que hagas `s = s.upper()`.",
      { tag: "intuitivo" },
    ),
    codeQuiz("Rápido", {
      id: "q-pc-str-inmutable", topicId: "t-pc-metodos-str", pos: 3,
      code: 's = "juan cruz"\ns.upper()\nprint(s)',
      wrongs: [["JUAN CRUZ", "programacion", "upper() devuelve un texto NUEVO; como no se guarda, s no cambia."], ["Juan Cruz", "programacion", "Eso haría title(), y además s no se modifica."], ["ERR", "programacion", "No hay error: la línea `s.upper()` es válida, solo que su resultado se pierde."]],
      explanation: "Los strings son inmutables: `s.upper()` sin asignar no tiene efecto sobre s.",
      hints: ["¿Se guarda el resultado de s.upper() en alguna variable?", "Los métodos de str no modifican el texto original.", "Para cambiar s haría falta `s = s.upper()`."],
    }),
    explain(
      "Buscar, contar, partir y unir",
      "`s.count(\"x\")` cuenta apariciones **sin superponer**. `s.index(\"x\")` y `s.find(\"x\")` dan la primera posición (si no está: index da error, find da −1). `x in s` pregunta si aparece.\n\n`s.split()` parte por espacios (cualquier cantidad) y devuelve una **lista**; `s.split(\",\")` parte por comas. `\"-\".join(lista)` une con guiones.",
      { tag: "matematico", widget: { type: "code", code: 't = "  hola   que tal "\np = t.split()\nu = "-".join(p)\nn = t.count("a")\nprint(p, u, n)' } },
    ),
    board("count no superpone", metodosBoard),
    codeExample("Ejemplo resuelto", "¿Qué muestra?", 'def f(t):\n    return len(t.split()) > 2\n\nprint(f("  hola   que tal "))', [
      "split() sin argumentos ignora los espacios repetidos: [\"hola\", \"que\", \"tal\"].",
      "len de esa lista es 3.",
      "3 > 2 es True: la función devuelve un booleano.",
    ]),
    practice("Ejercicio guiado", "pc-metodos-str", 1, 5, true),
    explain(
      "Errores típicos",
      "• Creer que `s.upper()` cambia s: **no**, hay que reasignar.\n• Olvidar que las mayúsculas importan: `\"Casa\" in \"la casa\"` es **False**.\n• Contar superposiciones: `\"aaaa\".count(\"aa\")` es 2, no 3.\n• Confundir `split()` con `split(\" \")`: el segundo deja textos vacíos si hay espacios repetidos.\n• Confundir title() con capitalize().",
    ),
    practice("Tu turno", "pc-func-str", 3, 6),
    practice("Más difícil", "pc-func-str", 5, 15),
    summary([
      "Los métodos de str devuelven un texto nuevo; s no cambia.",
      "title: cada palabra; capitalize: solo la primera.",
      "count no cuenta superposiciones.",
      "split() → lista de palabras; join → une una lista con un separador.",
      "Las comparaciones distinguen mayúsculas.",
    ]),
  ],
  tutor: {
    normal: "Los métodos de str (upper, lower, title, capitalize, replace, strip, count, index, find, split, join, startswith, endswith, isdigit) no modifican el objeto: los strings son inmutables y cada método devuelve un nuevo valor.",
    simple: "Los textos tienen «herramientas» (métodos) que se usan con un punto: s.upper(). Te devuelven un texto nuevo; el original queda igual.",
    nino: "Es como pedirle a una fotocopiadora una copia agrandada: te da una hoja nueva, pero tu hoja original sigue igual en tu mano.",
    ejemplo: '"hola mundo".title() = "Hola Mundo"; "hola mundo".split() = ["hola", "mundo"].',
    visual: { type: "code", code: 's = "hola mundo"\nt = s.title()\nprint(s)\nprint(t)' },
    visualText: "s sigue igual; el resultado quedó en t.",
    fromZero: "Un método es una función que «pertenece» a un valor y se llama con un punto: texto.metodo(). Los textos traen muchos métodos para transformarlos, buscar cosas dentro y partirlos en pedazos.",
    why: "Procesar texto es una de las tareas más comunes. Conocer los métodos te ahorra escribir ciclos y, en el parcial, te permite predecir rápido lo que devuelve una función.",
    origin: "Python hizo los strings inmutables para que sean seguros de compartir y se puedan usar como claves de diccionarios; por eso todo método «modificador» en realidad devuelve un string nuevo.",
    board: metodosBoard,
  },
};

// ═══════════════════════════ listas ═══════════════════════════

const listasBoard: BoardStep[] = [
  { expr: "a = [1, 2, 3]" },
  { expr: "a.append(4) → [1, 2, 3, 4]", note: "Agrega al final" },
  { expr: "a.insert(0, 9) → [9, 1, 2, 3, 4]", note: "Agrega en la posición 0" },
  { expr: "x = a.pop() → x = 4, a = [9, 1, 2, 3]", note: "Saca el último y lo devuelve" },
  { expr: "a.reverse() → [3, 2, 1, 9]", note: "Invierte la MISMA lista; devuelve None" },
];

export const pcListas: Lesson = {
  id: "l-pc-listas",
  title: "Listas y sus métodos",
  subtitle: "append, insert, pop, reverse, sort, slicing",
  subjectId: S,
  topicIds: ["t-pc-listas"],
  estimatedMinutes: 11,
  prerequisites: ["t-pc-strings"],
  cards: [
    intro(
      "Listas",
      "Cómo se crean y se modifican las listas, qué devuelve cada método y en qué se diferencian de los textos.",
      "Las listas guardan colecciones de datos (notas, nombres, mediciones). En el parcial hay un ejercicio fijo de listas con append, insert, reverse, pop y slicing.",
    ),
    explain(
      "Una lista de compras",
      "Una lista es como la lista del súper: tiene un orden, podés **agregar** al final, **meter** algo adelante, **tachar** el último o darla vuelta.\n\nA diferencia de los textos, las listas **sí se modifican**: `a.append(5)` cambia la propia lista `a`.\n\nSe indexan y recortan igual que los textos: `a[0]`, `a[-1]`, `a[1:3]`, `a[::-1]`.",
      { tag: "cotidiano" },
    ),
    codeQuiz("Rápido", {
      id: "q-pc-reverse-none", topicId: "t-pc-listas", pos: 1,
      code: "a = [3, 1, 2]\nr = a.reverse()\nprint(r)",
      wrongs: [["[2, 1, 3]", "programacion", "reverse() da vuelta la lista a, pero devuelve None: eso es lo que queda en r."], ["[1, 2, 3]", "programacion", "reverse() invierte el orden; no ordena. Y además devuelve None."], ["∅", "programacion", "print(None) muestra la palabra None."]],
      explanation: "Los métodos que modifican la lista (append, insert, reverse, sort) devuelven None.",
      hints: ["¿Qué DEVUELVE reverse()?", "reverse() modifica la lista en el lugar.", "Los métodos que modifican devuelven None."],
    }),
    explain(
      "Los métodos",
      "• `append(x)`: agrega al final.\n• `insert(i, x)`: agrega en la posición i (`insert(0, x)` = adelante).\n• `pop()`: saca y **devuelve** el último; `pop(0)`, el primero.\n• `remove(x)`: saca la primera aparición de x.\n• `reverse()` y `sort()`: modifican la lista y devuelven **None**. `sort(reverse=True)` ordena de mayor a menor.\n• `index(x)`, `count(x)`, `len(a)`, `x in a`.",
      { tag: "matematico", widget: { type: "code", code: "a = [1, 2, 3]\na.append(4)\na.insert(0, 9)\nx = a.pop()\na.reverse()\nprint(a, x)" } },
    ),
    board("Una lista que cambia", listasBoard),
    codeExample("Ejemplo resuelto", "¿Qué muestra?", "b = []\nfor x in [4, 7, 1]:\n    b.insert(0, x)\nprint(b)", [
      "Vuelta 1: b = [4].",
      "Vuelta 2: el 7 entra adelante → [7, 4].",
      "Vuelta 3: el 1 entra adelante → [1, 7, 4].",
      "insert(0, x) en un ciclo invierte el orden.",
    ]),
    practice("Ejercicio guiado", "pc-listas", 1, 3, true),
    explain(
      "Errores típicos",
      "• `r = a.reverse()` deja **None** en r (a sí queda invertida). Si querés una copia invertida: `r = a[::-1]`.\n• `b = a` **no copia**: es la misma lista con otro nombre; si modificás b, cambia a. Para copiar: `b = a[:]`.\n• `a + b` une dos listas (no suma los números).\n• `pop()` además de devolver, **saca** el elemento.",
    ),
    practice("Tu turno", "pc-listas", 3, 10),
    practice("Más difícil", "pc-listas", 5, 16),
    summary([
      "Las listas se modifican; los textos no.",
      "append al final, insert(0, x) adelante, pop() saca el último.",
      "reverse() y sort() modifican y devuelven None.",
      "Los slices (a[::-1], a[:3]) crean listas nuevas.",
      "`b = a` no copia: comparten la misma lista.",
    ]),
  ],
  tutor: {
    normal: "Una lista es una secuencia mutable. Sus métodos modificadores (append, insert, pop, remove, reverse, sort) actúan sobre el mismo objeto; los que solo modifican devuelven None. El slicing produce una lista nueva (copia superficial).",
    simple: "Una lista guarda varios valores en orden y la podés cambiar: agregar, sacar, dar vuelta. Ojo: los métodos que cambian la lista no te la devuelven.",
    nino: "Es como una fila de figuritas en tu álbum: podés pegar una al final, meter una al principio o despegar la última. Pero si le pedís a tu amigo «dala vuelta», él da vuelta el álbum y te contesta «listo» (None), no te da otro álbum.",
    ejemplo: "a = [1, 2]; a.append(3) → [1, 2, 3]; a.pop() devuelve 3 y a queda [1, 2].",
    visual: { type: "code", code: "a = [5, 6, 7]\nb = a\nc = a[:]\nb.append(8)\nprint(a, b, c)" },
    visualText: "b es la misma lista que a; c es una copia.",
    fromZero: "Una lista se escribe entre corchetes con valores separados por comas: [3, 1, 2]. Cada elemento tiene un índice desde 0, como las letras de un texto. A diferencia del texto, se le pueden agregar, quitar y cambiar elementos.",
    why: "Casi todos los programas trabajan con colecciones de datos. Saber exactamente qué devuelve y qué modifica cada método evita los errores más comunes (y las trampas del parcial).",
    origin: "La convención de Python es que un método que modifica el objeto devuelve None, para que no se confunda con uno que devuelve una copia (como sorted() o un slice).",
    board: listasBoard,
  },
};

// ═══════════════════════════ tuplas ═══════════════════════════

const tuplasBoard: BoardStep[] = [
  { expr: 'datos = [("ana", 17), ("juan", 19)]' },
  { expr: 'datos[1] → ("juan", 19)', note: "El elemento 1 de la lista: una tupla" },
  { expr: 'datos[1][0] → "juan"', note: "El elemento 0 de la tupla: el nombre" },
  { expr: 'datos[1][0][2] → "a"', note: "La letra 2 del nombre" },
];

export const pcTuplas: Lesson = {
  id: "l-pc-tuplas",
  title: "Tuplas y listas de tuplas",
  subtitle: "Datos agrupados e índices anidados",
  subjectId: S,
  topicIds: ["t-pc-tuplas"],
  estimatedMinutes: 9,
  prerequisites: ["t-pc-listas"],
  cards: [
    intro(
      "Tuplas",
      "Qué es una tupla, cómo se desarma en variables y cómo leer índices anidados como `datos[i][0][2]`.",
      "Los registros (nombre, edad) se guardan como tuplas dentro de listas. En el parcial aparecen con índices anidados y con sort.",
    ),
    explain(
      "Una ficha que no se edita",
      "Una tupla agrupa datos relacionados: `(\"Ana\", 17)` es una ficha con nombre y edad. Se escribe con **paréntesis** y, a diferencia de la lista, **no se puede modificar**.\n\nSe indexa igual: `t[0]` es \"Ana\". Y se desarma en variables: `nombre, edad = t`.\n\nOjo: `(5)` es solo el número 5; la tupla de un elemento lleva coma: `(5,)`.",
      { tag: "cotidiano" },
    ),
    codeQuiz("Rápido", {
      id: "q-pc-tupla-uno", topicId: "t-pc-tuplas", pos: 2,
      code: "t = (5)\nu = (5,)\nprint(t, u)",
      wrongs: [["(5) (5,)", "programacion", "Los paréntesis solos no hacen una tupla: `(5)` es el número 5."], ["(5,) (5,)", "programacion", "Sin coma no es tupla: t es el entero 5."], ["5 5", "programacion", "u sí es una tupla de un elemento: se muestra (5,)."]],
      explanation: "Lo que crea la tupla es la coma. `(5)` es 5; `(5,)` es una tupla.",
      hints: ["¿Qué hace que algo sea una tupla, los paréntesis o la coma?", "(5) son solo paréntesis de agrupar.", "Las tuplas de un elemento se muestran con coma."],
    }),
    explain(
      "Listas de tuplas",
      "`datos = [(\"ana\", 17), (\"juan\", 19)]` es una lista cuyos elementos son tuplas. Los índices se leen **de izquierda a derecha**: `datos[1]` es la tupla de juan, `datos[1][0]` su nombre y `datos[1][0][2]` la tercera letra del nombre.\n\nEn un for se pueden desarmar: `for nombre, edad in datos:`.",
      { tag: "matematico", widget: { type: "code", code: 'datos = [("ana", 17), ("juan", 19)]\nfor nombre, edad in datos:\n    print(nombre.title(), edad)\nprint(datos[1][0][2])' } },
    ),
    board("Leer índices anidados", tuplasBoard),
    codeExample("Ejemplo resuelto", "¿Qué muestra?", 'nombres = ["luis", "ana", "eva"]\nedades = [20, 18, 19]\nnombres.sort()\nprint(nombres[0], edades[0])', [
      "sort() ordena alfabéticamente SOLO la lista nombres: [\"ana\", \"eva\", \"luis\"].",
      "edades no se tocó: sigue [20, 18, 19].",
      "La correspondencia se rompió: se muestra ana con la edad de luis.",
    ]),
    practice("Ejercicio guiado", "pc-tuplas", 1, 2, true),
    explain(
      "Errores típicos",
      "• Ordenar una lista y creer que la otra lista «paralela» también se reordena. Si ordenás una **lista de tuplas**, cada ficha viaja entera y se ordena por su primer elemento.\n• Confundir cómo se muestran: `[\"ana\", 17]` es una lista y `(\"ana\", 17)` es una tupla.\n• Intentar `t[0] = 3` en una tupla: TypeError.",
    ),
    practice("Tu turno", "pc-tuplas", 3, 7),
    practice("Más difícil", "pc-tuplas", 5, 13),
    summary([
      "Tupla: datos agrupados, con paréntesis, inmutable.",
      "La coma hace la tupla: (5,) sí, (5) no.",
      "`a, b = t` desarma una tupla.",
      "datos[i][0][2]: se lee de izquierda a derecha.",
      "Ordenar una lista no reordena otra lista paralela.",
    ]),
  ],
  tutor: {
    normal: "Una tupla es una secuencia inmutable, habitualmente usada como registro de campos heterogéneos. Admite indexado, slicing, iteración, `in` y desempaquetado en asignaciones y en la cabecera del for.",
    simple: "Una tupla es como una lista que no se puede cambiar. Sirve para juntar datos de una misma cosa: (nombre, edad).",
    nino: "Es como la ficha de un jugador en un álbum: tiene nombre y número, y no se tacha. Una lista de tuplas es el álbum entero.",
    ejemplo: 't = ("Ana", 17); t[0] es "Ana"; nombre, edad = t deja nombre = "Ana" y edad = 17.',
    visual: { type: "code", code: 'p = (3, 4)\nx, y = p\nprint(x * y, len(p))' },
    visualText: "Desarmamos la tupla en dos variables.",
    fromZero: "A veces un dato tiene varias partes: una persona tiene nombre y edad. Python permite agruparlas en una tupla, escribiendo los valores entre paréntesis separados por comas. Después se accede a cada parte por su posición.",
    why: "Agrupar datos relacionados evita perder la correspondencia entre ellos (como pasa con dos listas paralelas al ordenar una sola).",
    origin: "Las tuplas vienen de la matemática (pares ordenados, n-uplas): un punto (x, y) es una tupla. Python las hizo inmutables para que puedan ser claves de diccionarios.",
    board: tuplasBoard,
  },
};

// ═══════════════════════════ diccionarios ═══════════════════════════

const dictsBoard: BoardStep[] = [
  { expr: 'reemp = {"a": "e", "e": "i"}', note: "Se recorre en orden de inserción" },
  { expr: 't = "casa"' },
  { expr: 't = "cese"', note: "Primer reemplazo: a → e" },
  { expr: 't = "cisi"', note: "Segundo reemplazo: e → i (¡también las e nuevas!)" },
];

export const pcDicts: Lesson = {
  id: "l-pc-dicts",
  title: "Diccionarios",
  subtitle: "Claves, valores y orden de inserción",
  subjectId: S,
  topicIds: ["t-pc-dicts"],
  estimatedMinutes: 11,
  prerequisites: ["t-pc-listas", "t-pc-metodos-str"],
  cards: [
    intro(
      "Diccionarios",
      "Cómo guardar datos por clave, cómo recorrer un diccionario (en qué orden) y cómo combinar dos diccionarios que comparten claves.",
      "En el parcial hay dos ejercicios con diccionarios: uno de reemplazos encadenados y otro que combina dos diccionarios por código.",
    ),
    explain(
      "Una agenda",
      "Un diccionario es como una agenda: buscás por **nombre** (la clave) y obtenés el **teléfono** (el valor).\n\n`tel = {\"ana\": 4567, \"juan\": 1234}`\n`tel[\"ana\"]` → 4567. `tel[\"eva\"] = 999` agrega una entrada; si la clave ya existe, **reemplaza** su valor.\n\nBuscar una clave que no está da **KeyError**; `tel.get(\"x\", 0)` devuelve 0 en ese caso.",
      { tag: "cotidiano" },
    ),
    codeQuiz("Rápido", {
      id: "q-pc-dict-orden", topicId: "t-pc-dicts", pos: 0,
      code: 'd = {"b": 2, "a": 1}\nd["c"] = 3\nd["b"] = 5\nfor k in d:\n    print(k, d[k])',
      wrongs: [["a 1\nb 5\nc 3", "algoritmico", "Un diccionario no se ordena solo: se recorre en el orden en que se CARGARON las claves."], ["b 2\na 1\nc 3", "programacion", "`d[\"b\"] = 5` reemplaza el valor de b (la clave conserva su lugar)."], ["a 1\nc 3\nb 5", "algoritmico", "Cambiar el valor de una clave existente no la mueve al final."]],
      explanation: "El orden es el de inserción (b, a, c). Reasignar d[\"b\"] cambia su valor pero no su posición.",
      hints: ["¿En qué orden se agregaron las claves?", "Reasignar una clave existente no la agrega de nuevo.", "for k in d recorre las claves."],
    }),
    explain(
      "Recorrer y combinar",
      "`for k in d:` recorre las **claves** en orden de inserción. También: `d.keys()`, `d.values()` y `for k, v in d.items():`.\n\n`k in d` pregunta si existe la **clave** (no el valor).\n\nPara contar apariciones: `cont[x] = cont.get(x, 0) + 1`.\n\nSi dos diccionarios comparten claves (por ejemplo, códigos de alumno), recorrés uno y buscás en el otro: `nombres[cod]`.",
      { tag: "matematico", widget: { type: "code", code: 'cont = {}\nfor c in "banana":\n    cont[c] = cont.get(c, 0) + 1\nprint(cont)\nfor k, v in cont.items():\n    print(k, v)' } },
    ),
    board("Reemplazos encadenados", dictsBoard),
    codeExample("Ejemplo resuelto", "¿Qué muestra?", 'nombres = {101: "ana lopez", 205: "JUAN perez"}\nnotas = {205: [7, 9], 101: [4]}\nfor cod in notas:\n    print(nombres[cod].capitalize()[:4], notas[cod][:1])', [
      "Se recorre notas: primero 205, después 101.",
      "205 → \"JUAN perez\".capitalize() = \"Juan perez\" → [:4] = \"Juan\"; notas[205][:1] = [7] (un slice es una lista).",
      "101 → \"Ana lopez\"[:4] = \"Ana \" (el espacio cuenta, y print agrega otro: quedan dos); notas[101][:1] = [4].",
    ]),
    practice("Ejercicio guiado", "pc-dict-replace", 1, 3, true),
    explain(
      "Errores típicos",
      "• Pensar que el diccionario se recorre ordenado: va en **orden de inserción**.\n• En reemplazos encadenados, olvidar que cada replace trabaja sobre el texto **ya modificado**.\n• replace busca coincidencias **exactas**: \"Gato\" no coincide con \"gato\".\n• `d[\"x\"]` con una clave inexistente da KeyError.",
    ),
    practice("Tu turno", "pc-dict-replace", 4, 8),
    practice("Más difícil", "pc-dos-dicts", 4, 12),
    summary([
      "dict: clave → valor; d[k] lee, d[k] = v agrega o reemplaza.",
      "Se recorre en orden de inserción.",
      "`k in d` busca entre las claves.",
      "items() da pares (clave, valor) para desarmar en el for.",
      "Los reemplazos en un ciclo se encadenan.",
    ]),
  ],
  tutor: {
    normal: "Un dict asocia claves (hashables: int, str, tuplas) con valores. Desde Python 3.7 preserva el orden de inserción; reasignar una clave existente actualiza el valor sin cambiar su posición. La iteración recorre las claves.",
    simple: "Un diccionario guarda pares «clave: valor». Buscás por la clave y te da el valor. Se recorre en el orden en que lo fuiste armando.",
    nino: "Es como el diccionario de verdad: buscás una palabra (clave) y encontrás su significado (valor). Si escribís otra definición para la misma palabra, la vieja se borra.",
    ejemplo: 'd = {"a": 1}; d["b"] = 2; d["a"] = 9 → {"a": 9, "b": 2}.',
    visual: { type: "code", code: 'precios = {"pan": 900, "leche": 1200}\nprecios["pan"] = 950\nfor p, v in precios.items():\n    print(p, v)' },
    visualText: "Actualizamos un precio y recorremos los pares.",
    fromZero: "En una lista buscás por posición (0, 1, 2…). En un diccionario buscás por un nombre que vos elegís, la clave. Se escribe entre llaves: {clave: valor, clave: valor}.",
    why: "Muchísimos problemas son de la forma «para cada X, guardá Y»: el precio de cada producto, las notas de cada alumno, cuántas veces aparece cada letra. El diccionario los resuelve directo.",
    origin: "Internamente es una tabla de hash: la clave se transforma en un número que indica dónde guardar el valor, por eso buscar es muy rápido y las claves tienen que ser inmutables.",
    board: dictsBoard,
  },
};

// ═══════════════════════════ funciones ═══════════════════════════

const funcBoard: BoardStep[] = [
  { expr: "f(3, 5)", note: "def f(a, b): return a * 2 − b" },
  { expr: "a = 3, b = 5", note: "Los argumentos se copian en orden a los parámetros" },
  { expr: "3 · 2 − 5", note: "Se ejecuta el cuerpo" },
  { expr: "= 1", note: "return devuelve 1 y la función termina" },
];

export const pcFunciones: Lesson = {
  id: "l-pc-funciones",
  title: "Funciones y abstracción",
  subtitle: "def, parámetros, return… y «¿qué hace este programa?»",
  subjectId: S,
  topicIds: ["t-pc-funciones"],
  estimatedMinutes: 10,
  prerequisites: ["t-pc-ciclos"],
  cards: [
    intro(
      "Funciones",
      "Cómo se define y se llama una función, la diferencia entre devolver (return) y mostrar (print), y cómo describir en una frase qué hace un algoritmo.",
      "Las funciones permiten reutilizar código. Y una pregunta fija del parcial es «¿qué hace este programa?»: hay que abstraer, no solo ejecutar.",
    ),
    explain(
      "Una máquina con entrada y salida",
      "Una función es como una máquina de jugo: le das naranjas (los **argumentos**), hace su trabajo y te **devuelve** el jugo (el `return`).\n\n`def doble(n):` define la máquina; `n` es el **parámetro**. `doble(4)` la usa: n vale 4 y la función devuelve 8.\n\nSi la función no tiene `return`, devuelve **None**.",
      { tag: "cotidiano" },
    ),
    codeQuiz("Rápido", {
      id: "q-pc-func-none", topicId: "t-pc-funciones", pos: 3,
      code: "def f(n):\n    n = n * 2\n\nx = f(4)\nprint(x)",
      wrongs: [["8", "programacion", "La función calcula 8 pero no lo devuelve: no tiene return."], ["4", "programacion", "x guarda lo que DEVUELVE f, no el argumento."], ["ERR", "programacion", "No es un error: una función sin return devuelve None."]],
      explanation: "Sin return, la función devuelve None; el cálculo interno se pierde.",
      hints: ["¿Qué devuelve la función?", "¿Hay un return?", "Sin return, se devuelve None."],
    }),
    explain(
      "return vs print",
      "`return valor` **termina** la función y entrega el valor a quien la llamó. `print` solo **muestra** en pantalla; no entrega nada.\n\nLos parámetros reciben los argumentos **en orden**: en `f(y, x)`, el primer parámetro recibe y.\n\nUn `return` dentro de un for corta el ciclo y la función en ese momento.",
      { tag: "matematico", widget: { type: "code", code: "def f(a, b):\n    return a * 2 - b\n\nx = 3\ny = 5\nr1 = f(x, y)\nr2 = f(y, x)\nprint(r1, r2)" } },
    ),
    board("Una llamada paso a paso", funcBoard),
    codeExample("Ejemplo: ¿qué hace?", "¿Qué muestra y qué hace este programa en general?", "datos = [3, 8, 5, 10, 7]\nc = 0\nfor n in datos:\n    c += n % 2\nprint(c)", [
      "n % 2 vale 1 si n es impar y 0 si es par.",
      "Se suma 1 por cada impar: 3, 5 y 7 → c = 3.",
      "En general: cuenta cuántos números impares hay.",
      "Si fuera c += n % 2 * n, sumaría los impares (3 + 5 + 7 = 15).",
    ]),
    practice("Ejercicio guiado", "pc-abstraccion", 1, 2, true),
    explain(
      "Errores típicos",
      "• Usar print dentro de la función y creer que devuelve algo: devuelve None.\n• Confundir el nombre del argumento con el del parámetro: importa la **posición**.\n• Para «¿qué hace?», no adivines por un caso: probá con una lista chiquita inventada y compará con cada opción.",
    ),
    practice("Tu turno", "pc-abstraccion", 3, 5),
    practice("Más difícil", "pc-abstraccion", 5, 11),
    summary([
      "def nombre(parámetros): define; nombre(argumentos) llama.",
      "return devuelve y termina; sin return se devuelve None.",
      "print muestra, return entrega.",
      "Los argumentos se asignan en orden.",
      "Para abstraer: qué se acumula y en qué casos.",
    ]),
  ],
  tutor: {
    normal: "Una función encapsula un algoritmo parametrizado. Al llamarla, los argumentos se ligan a los parámetros por posición (o por nombre), se ejecuta el cuerpo en un ámbito local y return devuelve un valor (None por defecto).",
    simple: "Una función es un pedazo de código con nombre que recibe datos, hace algo y devuelve un resultado con return.",
    nino: "Es como una receta con ingredientes variables: «hacé un licuado con ___ frutas». Cada vez que la usás, ponés las frutas que tengas y te devuelve un licuado distinto.",
    ejemplo: "def cuadrado(x): return x * x → cuadrado(5) devuelve 25.",
    visual: { type: "code", code: "def es_par(n):\n    return n % 2 == 0\n\nprint(es_par(4), es_par(7))" },
    visualText: "Mirá cómo cambia de ámbito al entrar a la función.",
    fromZero: "Cuando un cálculo se repite, conviene escribirlo una vez y ponerle nombre. Eso es una función: se define con def, se le dan valores al llamarla, y devuelve un resultado con return.",
    why: "Dividir un problema en funciones (descomposición) y describir qué hace cada parte sin mirar los detalles (abstracción) son dos pilares del pensamiento computacional.",
    origin: "La idea viene de la función matemática f(x): una regla que a cada entrada le asigna una salida. En programación, además, la función puede tener pasos intermedios.",
    board: funcBoard,
  },
};

// ═══════════════════════════ dibujos ═══════════════════════════

const dibujoBoard: BoardStep[] = [
  { expr: "n = 3", note: "Triángulo con range(i + 1)" },
  { expr: "i = 0: range(1) → *", note: "Un carácter y salto de línea" },
  { expr: "i = 1: range(2) → **" },
  { expr: "i = 2: range(3) → ***", note: "La fila i tiene i + 1 caracteres" },
];

export const pcDibujos: Lesson = {
  id: "l-pc-dibujos",
  title: "Ciclos anidados y dibujos",
  subtitle: "Filas, columnas y print(c, end=\"\")",
  subjectId: S,
  topicIds: ["t-pc-dibujos"],
  estimatedMinutes: 10,
  prerequisites: ["t-pc-ciclos", "t-pc-print"],
  cards: [
    intro(
      "Dibujar con ciclos",
      "Cómo un ciclo dentro de otro recorre filas y columnas, y cómo predecir la figura que dibuja.",
      "Es el ejercicio que más vale en el parcial (2 puntos) y se resuelve con método: fila por fila.",
    ),
    explain(
      "Bordar punto por punto",
      "Imaginá que bordás una figura: recorrés cada **fila** y en cada fila ponés los **puntos** uno al lado del otro; al terminar la fila, bajás.\n\nEn código: el for de afuera (i) son las filas; el de adentro (j) escribe cada carácter con `print(c, end=\"\")` (sin saltar de línea); el `print()` vacío al final de la fila es «bajar».",
      { tag: "cotidiano" },
    ),
    codeQuiz("Rápido", {
      id: "q-pc-end-vacio", topicId: "t-pc-dibujos", pos: 1,
      code: 'for i in range(3):\n    print("*", end="")\nprint()',
      wrongs: [["*\n*\n*", "programacion", "Con end=\"\" el print NO salta de línea: los tres asteriscos quedan juntos."], ["* * *", "programacion", "end=\"\" no agrega nada, ni siquiera un espacio."], ["∅", "programacion", "Sí muestra: el for se ejecuta 3 veces."]],
      explanation: "end=\"\" reemplaza el salto de línea por nada; el print() final termina la línea.",
      hints: ["¿Qué pone print al final si le decís end=\"\"?", "Nada: el siguiente print sigue en la misma línea.", "El print() del final hace el único salto."],
    }),
    explain(
      "Leer la condición",
      "Muchas figuras usan una condición sobre i (fila) y j (columna):\n• `i == 0` → primera fila; `j == 0` → primera columna.\n• `i == j` → diagonal; `i + j == n - 1` → la otra diagonal.\n• `range(i + 1)` → filas que crecen; `range(n - i)` → filas que se achican.\n\nAvanzá paso a paso y mirá la salida:",
      { tag: "matematico", widget: { type: "code", code: 'n = 3\nfor i in range(n):\n    for j in range(i + 1):\n        print("*", end="")\n    print()' } },
    ),
    board("Triángulo fila por fila", dibujoBoard),
    codeExample("Ejemplo resuelto", "¿Qué dibuja?", 'n = 3\nfor i in range(n):\n    for j in range(n):\n        if i == 0 or j == 0:\n            print("*", end="")\n        else:\n            print(".", end="")\n    print()', [
      "Fila i = 0: la condición es verdadera para toda j → ***.",
      "Fila i = 1: solo j = 0 cumple → *..",
      "Fila i = 2: igual → *..",
    ]),
    practice("Ejercicio guiado", "pc-dibujo", 1, 2, true),
    explain(
      "Errores típicos",
      "• Olvidar el `print()` de fin de fila: todo queda **en una sola línea**.\n• Confundir range(i + 1) (crece) con range(n − i) (se achica): probá la fila 0.\n• Confundir `or` con `and`: con or alcanza una de las dos.\n• Invertir la figura: i = 0 es la fila de **arriba**.\n\nMétodo: hacé a mano las filas 0 y 1; con eso ya descartás casi todas las opciones.",
    ),
    practice("Tu turno", "pc-dibujo", 3, 6),
    practice("Más difícil", "pc-dibujo", 5, 10),
    summary([
      "for de afuera = filas; for de adentro = columnas.",
      "print(c, end=\"\") escribe sin saltar; print() termina la fila.",
      "range(i + 1) crece; range(n − i) se achica.",
      "i = 0 es la fila de arriba; j = 0 la columna de la izquierda.",
      "Hacé a mano las primeras dos filas.",
    ]),
  ],
  tutor: {
    normal: "En dos ciclos anidados, el ciclo interno completa todas sus iteraciones por cada iteración del externo. Con print(..., end=\"\") se construye una fila sin salto de línea y con print() se la termina; las condiciones sobre (i, j) seleccionan qué celdas se dibujan.",
    simple: "El ciclo de afuera elige la fila; el de adentro escribe los caracteres de esa fila uno al lado del otro. Al final de cada fila, print() salta de línea.",
    nino: "Es como pintar azulejos de una pared: recorrés la primera hilera de izquierda a derecha, después bajás a la segunda, y así. La regla te dice de qué color va cada azulejo.",
    ejemplo: "Con n = 3 y range(i + 1): *, **, ***.",
    visual: { type: "code", code: 'for i in range(3):\n    for j in range(3):\n        print(i * 3 + j, end=" ")\n    print()' },
    visualText: "Cada número muestra en qué orden se escribe cada celda.",
    fromZero: "Un for repite algo varias veces. Si dentro de un for ponés otro for, el de adentro se repite completo en cada vuelta del de afuera. Así se recorre una grilla: filas y columnas.",
    why: "Recorrer grillas (tablas, imágenes, tableros) es muy común. Predecir un dibujo entrena exactamente la habilidad de seguir dos variables a la vez.",
    origin: "Es la forma de recorrer una matriz por filas: cada celda tiene coordenadas (i, j), como un punto en un plano, y las condiciones son ecuaciones sobre esas coordenadas (por ejemplo, i = j es la diagonal).",
    board: dibujoBoard,
  },
};

// ═══════════════════════════ traza a mano ═══════════════════════════

const trazaBoard: BoardStep[] = [
  { expr: "s = 0", note: "Antes del ciclo" },
  { expr: "i = 1, s = 1", note: "range(1, 5): primera vuelta" },
  { expr: "i = 2, s = 3" },
  { expr: "i = 3, s = 6" },
  { expr: "i = 4, s = 10", note: "Última vuelta: i queda en 4 después del for" },
];

export const pcTraza: Lesson = {
  id: "l-pc-traza",
  title: "Cómo hacer una traza a mano",
  subtitle: "La tabla de variables: el método del parcial",
  subjectId: S,
  topicIds: ["t-pc-traza", "t-pc-ciclos"],
  estimatedMinutes: 10,
  prerequisites: ["t-bucles"],
  cards: [
    intro(
      "La traza",
      "Un método para seguir cualquier programa sin computadora: una tabla con una columna por variable y otra para la salida.",
      "Todo el primer parcial es «¿qué muestra este programa?». La traza es la herramienta que hace que no dependas de la intuición.",
    ),
    explain(
      "Anotar como en el truco",
      "En el truco anotás los puntos de cada uno en una columna y los vas actualizando. La traza es igual: una **columna por variable**, una columna de **salida**, y una fila nueva cada vez que algo cambia.\n\nLa regla de oro: en `x = expresión`, calculás la derecha con los valores **actuales** y recién después actualizás x.",
      { tag: "cotidiano" },
    ),
    codeQuiz("Rápido", {
      id: "q-pc-for-persiste", topicId: "t-pc-ciclos", pos: 2,
      code: "s = 0\nfor i in range(1, 5):\n    s += i\nprint(s, i)",
      wrongs: [["15 5", "algoritmico", "range(1, 5) NO incluye el 5: las vueltas son 1, 2, 3 y 4."], ["10 5", "algoritmico", "Después del for, i queda con el ÚLTIMO valor que tomó (4), no con el final del range."], ["6 3", "algoritmico", "Contá bien las vueltas: son cuatro (1, 2, 3, 4)."]],
      explanation: "s = 1 + 2 + 3 + 4 = 10 e i conserva su último valor, 4.",
      hints: ["¿Qué valores toma i?", "range(1, 5) = 1, 2, 3, 4.", "La variable del for no se borra al terminar."],
    }),
    explain(
      "El método",
      "1. Escribí las variables como columnas, más «salida».\n2. Recorré línea por línea; si es un ciclo, una fila por vuelta.\n3. En un while, chequeá la condición **antes** de cada vuelta (puede no entrar nunca).\n4. En un print, anotá exactamente lo que se escribe.\n\nEl visualizador hace lo mismo: avanzá y compará con tu tabla.",
      { tag: "matematico", widget: { type: "code", code: "n = 4096\nc = 0\nwhile n > 0:\n    c += n % 10\n    n //= 10\nprint(c)" } },
    ),
    board("Tabla de la suma", trazaBoard),
    codeExample("Ejemplo resuelto", "¿Qué muestra?", 'i = 10\nwhile i < 5:\n    print(i)\n    i += 1\nprint("fin", i)', [
      "La condición 10 < 5 es falsa desde el principio.",
      "El while no entra ni una vez: su bloque no se ejecuta.",
      "Se ejecuta el print de afuera: fin 10.",
    ]),
    practice("Ejercicio guiado", "pc-ciclo-traza", 1, 3, true),
    explain(
      "Errores típicos",
      "• Pensar que la variable del for desaparece: queda con su **último** valor.\n• Incluir el final de range.\n• Olvidar que un while puede no entrar.\n• En ciclos anidados, el de adentro **reinicia** en cada vuelta del de afuera.\n• En `a, b = b, a + b`, usar el a nuevo: se calcula todo con los valores **viejos**.",
    ),
    practice("Tu turno", "pc-ciclo-lineas", 3, 5),
    practice("Más difícil", "pc-traza", 5, 8),
    summary([
      "Una columna por variable y una para la salida.",
      "Primero se calcula la derecha, después se asigna.",
      "La variable del for conserva su último valor.",
      "Un while puede no ejecutarse nunca.",
      "a, b = b, a + b usa los valores viejos.",
    ]),
  ],
  tutor: {
    normal: "Una traza (o prueba de escritorio) registra el estado del programa —valor de cada variable y salida— después de cada sentencia ejecutada, siguiendo el flujo de control real, incluidas las iteraciones.",
    simple: "Hacé una tabla: arriba los nombres de las variables. Cada vez que una cambia, escribís su valor nuevo debajo. Así no te perdés.",
    nino: "Es como anotar el marcador de un partido jugada por jugada: si te distraés, mirás la tabla y sabés exactamente cómo va.",
    ejemplo: "x = 2; x = x + 3; x = x * 2 → tabla: 2, 5, 10.",
    visual: { type: "code", code: "a = 1\nb = 1\nfor k in range(4):\n    a, b = b, a + b\nprint(a, b)" },
    visualText: "Mirá cómo cambian a y b en cada vuelta.",
    fromZero: "La computadora ejecuta una instrucción por vez y guarda valores en variables. Si anotás en papel lo mismo que ella guarda, después de cada instrucción, podés saber qué va a mostrar sin ejecutarlo.",
    why: "Leer código es más difícil que escribirlo. La traza te da un procedimiento seguro para no confundirte, especialmente en ciclos y condicionales.",
    origin: "Es la «prueba de escritorio» clásica de la programación: simular a mano la máquina para verificar un algoritmo antes de ejecutarlo.",
    board: trazaBoard,
  },
};

// ═══════════════════════════ print: sep y end ═══════════════════════════

const printBoard: BoardStep[] = [
  { expr: 'print("a", "b", sep="-")', note: "Entre argumentos va sep" },
  { expr: "a-b⏎", note: "Al final va end (por defecto, salto de línea ⏎)" },
  { expr: 'print("c", end="!")' },
  { expr: "c!", note: "Sin salto: lo próximo sigue en la misma línea" },
];

export const pcPrint: Lesson = {
  id: "l-pc-print",
  title: "print: sep y end",
  subtitle: "Controlar exactamente lo que se muestra",
  subjectId: S,
  topicIds: ["t-pc-print"],
  estimatedMinutes: 7,
  prerequisites: ["t-variables-codigo"],
  cards: [
    intro(
      "print a fondo",
      "Cómo print separa varios argumentos, qué hacen sep= y end=, y cómo se muestran los textos, listas y tuplas.",
      "Muchas opciones del parcial difieren solo en un espacio o un salto de línea: hay que saber exactamente qué escribe print.",
    ),
    explain(
      "Lo que hace print",
      "`print(a, b, c)` escribe a, un **espacio**, b, un espacio, c y al final un **salto de línea**.\n\nLos textos se muestran sin comillas; pero dentro de una lista o tupla sí llevan comillas: `print([\"a\", 1])` muestra `['a', 1]`.\n\n`print()` sin nada escribe solo un salto de línea (una línea en blanco).",
      { tag: "intuitivo" },
    ),
    codeQuiz("Rápido", {
      id: "q-pc-print-sep-end", topicId: "t-pc-print", pos: 0,
      code: 'print("a", "b", sep="")\nprint("c", end="-")\nprint("d")',
      wrongs: [["a b\nc-d", "programacion", "sep=\"\" pega los argumentos sin espacio."], ["ab\nc-\nd", "programacion", "end=\"-\" reemplaza el salto de línea: d queda en la misma línea."], ["ab c-d", "programacion", "El primer print termina con su salto de línea normal."]],
      explanation: "sep reemplaza el espacio entre argumentos; end reemplaza el salto de línea final.",
      hints: ["¿Qué va entre \"a\" y \"b\"?", "¿Con qué termina el segundo print?", "Si no termina en salto de línea, el tercero sigue en la misma línea."],
    }),
    explain(
      "sep y end",
      "• `sep=` cambia lo que va **entre** argumentos (por defecto, un espacio).\n• `end=` cambia lo que va **al final** (por defecto, un salto de línea).\n\n`end=\"\"` es la clave de los dibujos: permite escribir varias cosas en la misma línea. Con un solo argumento, sep no tiene ningún efecto.",
      { tag: "matematico", widget: { type: "code", code: 'for i in range(3):\n    print(i, end=", ")\nprint("fin")\nprint("x", "y", "z", sep="/")' } },
    ),
    board("sep y end", printBoard),
    codeExample("Ejemplo resuelto", "¿Qué muestra?", 'x = 3\nprint("x", "=", x, sep="")\nprint("doble:", x * 2, end=" ")\nprint("listo")', [
      "Primer print: sep vacío → x=3.",
      "Segundo print: \"doble:\" espacio 6 y termina con un espacio (no salta).",
      "Tercer print: sigue en la misma línea → doble: 6 listo.",
    ]),
    practice("Ejercicio guiado", "pc-print", 1, 2, true),
    explain(
      "Errores típicos",
      "• Olvidar el espacio que print pone entre argumentos.\n• Creer que `end=` afecta al print siguiente: afecta al **final del mismo** print, y por eso lo siguiente queda pegado.\n• Esperar comillas en `print(\"hola\")`: no las muestra. Pero en `print([\"hola\"])`, sí.",
    ),
    practice("Tu turno", "pc-print", 3, 7),
    practice("Más difícil", "pc-print", 5, 13),
    summary([
      "print separa con espacio y termina con salto de línea.",
      "sep= cambia el separador; end= el final.",
      "end=\"\" deja lo siguiente en la misma línea.",
      "Los textos dentro de listas y tuplas se muestran con comillas.",
    ]),
  ],
  tutor: {
    normal: "print(*objetos, sep=' ', end='\\n') convierte cada objeto con str(), los une con sep y escribe end al final. Los contenedores usan repr() para sus elementos, por eso los strings internos aparecen entre comillas.",
    simple: "print escribe lo que le pasás separado por espacios y después baja de línea. sep cambia el separador y end cambia lo que pone al final.",
    nino: "Es como escribir en el pizarrón: entre palabra y palabra dejás un espacio (sep) y al terminar la oración bajás de renglón (end). Podés decidir no bajar.",
    ejemplo: 'print(1, 2, 3, sep="-") muestra 1-2-3.',
    visual: { type: "code", code: 'print("uno", end=" ")\nprint("dos")\nprint(["uno", 2])' },
    visualText: "Fijate dónde aparecen las comillas.",
    fromZero: "print es la instrucción que muestra cosas en la pantalla. Si le pasás varias cosas separadas por comas, las muestra en la misma línea separadas por un espacio, y al final pasa a la línea siguiente.",
    why: "Predecir la salida exacta (espacios, saltos, comillas) es lo que distingue las opciones correctas de las casi correctas en el parcial.",
    origin: "Los valores por defecto (espacio y salto de línea) son la forma más común de mostrar datos; sep y end existen para los casos en que necesitás otro formato sin armar el texto a mano.",
    board: printBoard,
  },
};

export const pcLessons: Lesson[] = [pcTipos, pcDivMod, pcBooleanos, pcStrings, pcMetodosStr, pcListas, pcTuplas, pcDicts, pcFunciones, pcDibujos, pcTraza, pcPrint];
