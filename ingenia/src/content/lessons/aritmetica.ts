import type { Lesson } from "@/engine/types";
import { example, explain, intro, practice, quiz, summary } from "./helpers";

const S = "preparacion";

export const comoEstudiar: Lesson = {
  id: "l-como-estudiar",
  title: "Cómo estudiar matemática",
  subtitle: "Antes de empezar: el método",
  subjectId: S,
  topicIds: [],
  estimatedMinutes: 5,
  prerequisites: [],
  cards: [
    intro(
      "Volver a estudiar",
      "Cómo aprovechar esta plataforma, cómo leer los símbolos y qué hacer cuando te equivocás.",
      "Si hace años que no estudiás, lo más difícil no es la matemática: es recuperar el hábito. Un buen método ahorra muchísimo tiempo.",
    ),
    explain(
      "La matemática se aprende haciendo",
      "Leer una explicación da la sensación de entender. Pero la comprensión real aparece cuando **intentás resolver** algo vos.\n\nPor eso cada lección acá alterna: una idea corta → un ejemplo → un ejercicio. No saltees los ejercicios: son la parte que más enseña.",
      { tag: "intuitivo" },
    ),
    explain(
      "Los símbolos son abreviaturas",
      "Cada símbolo es una palabra corta. Tocá cualquier símbolo resaltado para ver qué significa:\n\n$=$ «es igual a» · $≠$ «es distinto de» · $<$ «es menor que» · $>$ «es mayor que» · $·$ «por» · $/$ «dividido» · $√$ «raíz cuadrada».\n\nTambién tenés el **Diccionario** en el menú, con buscador.",
    ),
    explain(
      "Equivocarse es información",
      "Cuando te equivocás, el sistema intenta encontrar **en qué paso** estuvo el problema y de qué tipo fue (signos, despeje, unidades...).\n\nCon eso arma después ejercicios de refuerzo específicos. Un error bien analizado vale más que tres aciertos de suerte.",
      { tag: "cotidiano" },
    ),
    explain(
      "Pistas antes que soluciones",
      "Cada ejercicio tiene **tres pistas**, de menor a mayor ayuda. Pedilas de a una: muchas veces con la primera alcanza.\n\nLa solución completa existe, pero aparece al final. El objetivo es que aprendas a razonar, no a copiar.",
    ),
    explain(
      "La calculadora, con criterio",
      "La calculadora no se equivoca, pero hace exactamente lo que le escribís. Dos trampas clásicas:\n\n1. **Negativos con potencias**: $-3^2$ da $−9$, porque eleva solo el 3. Para $(−3)^2 = 9$ hacen falta paréntesis.\n2. **Modo de ángulos**: para trigonometría con grados, la calculadora tiene que estar en **DEG**, no en RAD.",
      { tag: "matematico" },
    ),
    quiz(
      "Probemos",
      {
        id: "q-estudiar-1",
        subjectId: S,
        topicId: "t-signos",
        prompt: "¿Qué significa $7 > 4$?",
        options: ["7 es mayor que 4", "7 es menor que 4", "7 es igual a 4"],
        answer: 0,
        explanation: "El símbolo > se lee «mayor que». Truco: la parte abierta apunta al número más grande.",
        hints: ["Mirá hacia qué número está «abierto» el símbolo.", "La boca del símbolo apunta al más grande.", "7 está del lado abierto."],
        errors: { 1: ["conceptual", "Es al revés: < es «menor que» y > es «mayor que». La parte abierta apunta al número mayor."] },
      },
      true,
    ),
    quiz("Ahora vos", {
      id: "q-estudiar-2",
      subjectId: S,
      topicId: "t-potencias",
      prompt: "En la calculadora escribís `-3^2` y da $−9$. ¿Por qué?",
      options: ["Porque eleva solo el 3 y después aplica el signo menos", "Porque la calculadora está rota", "Porque (−3)² es −9"],
      answer: 0,
      explanation: "Sin paréntesis, la potencia se hace antes que el signo: −3² = −(3²) = −9. Con paréntesis, (−3)² = 9.",
      hints: ["¿Qué operación va primero: la potencia o el signo?", "La potencia tiene prioridad.", "−3² se lee «menos (3 al cuadrado)»."],
      errors: { 2: ["potencias", "(−3)² = (−3)·(−3) = 9, positivo. Lo que da −9 es −3² sin paréntesis."] },
    }),
    summary([
      "Aprendés resolviendo: no saltees los ejercicios.",
      "Los símbolos son palabras cortas; tocalos para ver su significado.",
      "Un error es información: el sistema lo usa para ayudarte.",
      "Pedí pistas de a una antes de ver la solución.",
    ]),
  ],
  tutor: {
    normal: "Estudiar matemática es practicar: alternar explicaciones cortas con ejercicios, analizar los errores y pedir ayuda de a poco.",
    simple: "Leé poquito, probá mucho, y cuando te equivoques, mirá en qué paso fue.",
    nino: "Es como aprender a andar en bici: nadie aprende mirando un video. Hay que subirse, caerse un poco y volver a intentar.",
    ejemplo: "En vez de leer 10 páginas sobre fracciones, leé una idea, resolvé 3 ejercicios, y si fallás uno, pedí una pista.",
  },
};

export const signos: Lesson = {
  id: "l-signos",
  title: "Números negativos y signos",
  subtitle: "La recta numérica y la regla de los signos",
  subjectId: S,
  topicIds: ["t-signos"],
  estimatedMinutes: 10,
  prerequisites: [],
  cards: [
    intro(
      "Números negativos",
      "Sumar, restar, multiplicar y dividir con números negativos sin confundirte con los signos.",
      "Los errores de signo son el error más común de todo el CBC: aparecen en álgebra, en física, en derivadas... Dominarlos ahora te ahorra muchos puntos después.",
    ),
    explain(
      "La recta numérica",
      "Imaginá una línea con el 0 en el medio: a la derecha los positivos, a la izquierda los negativos.\n\n**Sumar** un positivo = moverse a la derecha. **Restar** un positivo = moverse a la izquierda.\n\nMové el punto y probá:",
      { widget: { type: "numberline", min: -10, max: 10, start: 3, step: 1 }, tag: "intuitivo" },
    ),
    explain(
      "Deudas y ahorros",
      "Pensá los negativos como deudas. Si tenés $5$ pesos y gastás $8$, quedás debiendo $3$: $5 − 8 = −3$.\n\n¿Cuál es mayor, $−2$ o $−7$? Deber 2 es mejor que deber 7, así que $−2 > −7$. Entre negativos, el mayor es el más cercano al cero.",
      { tag: "cotidiano" },
    ),
    explain(
      "Dos signos seguidos",
      "Cuando aparecen dos signos juntos, se combinan:\n\n$+(+3) = +3$ · $+(−3) = −3$ · $−(+3) = −3$ · $−(−3) = +3$\n\n**Restar un negativo es sumar.** Sacarte una deuda es como recibir plata.",
      { tag: "matematico" },
    ),
    example("Ejemplo resuelto", "Calculá $4 − (−6) + (−3)$", ["$−(−6)$ se convierte en $+6$", "$+(−3)$ se convierte en $−3$", "Queda $4 + 6 − 3$", "$= 7$"], "7"),
    practice("Ejercicio guiado", "signos-suma", 2, 11, true),
    explain(
      "Multiplicar y dividir",
      "La **regla de los signos**:\n\n$(+)·(+) = +$ · $(−)·(−) = +$ · $(+)·(−) = −$ · $(−)·(+) = −$\n\nSignos **iguales** → positivo. Signos **distintos** → negativo. Para dividir es igual.",
      { tag: "matematico" },
    ),
    example("Ejemplo resuelto", "Calculá $(−4)·(−5)$ y $(−18) ÷ 3$", ["$4·5 = 20$; signos iguales → $+20$", "$18 ÷ 3 = 6$; signos distintos → $−6$"], "20 y −6"),
    practice("Tu turno", "signos-producto", 2, 23),
    practice("Tu turno", "signos-suma", 3, 37),
    practice("Mini desafío", "signos-suma", 5, 41),
    summary([
      "Sumar → derecha en la recta; restar → izquierda.",
      "−(−a) = +a: restar un negativo es sumar.",
      "Entre negativos, el mayor es el más cercano a 0.",
      "Multiplicar/dividir: signos iguales → +, distintos → −.",
    ]),
  ],
  tutor: {
    normal: "Un número negativo está a la izquierda del cero. Sumar mueve a la derecha y restar a la izquierda. Para multiplicar o dividir: signos iguales dan positivo, distintos dan negativo.",
    simple: "Pensá en plata: positivo es lo que tenés, negativo lo que debés. Restar una deuda es como recibir plata, por eso −(−3) = +3.",
    nino: "Imaginá un termómetro. Si hace −2 grados y sube 5, llegás a 3. Si hace 4 y baja 6, llegás a −2.",
    ejemplo: "3 − 8: empezás en 3 y te movés 8 lugares a la izquierda: 2, 1, 0, −1, −2, −3, −4, −5. Resultado: −5.",
    visual: { type: "numberline", min: -10, max: 10, start: 0, step: 1 },
    visualText: "Mové el punto por la recta: cada paso a la derecha suma 1, cada paso a la izquierda resta 1.",
  },
};

export const jerarquiaLesson: Lesson = {
  id: "l-jerarquia",
  title: "Orden de las operaciones",
  subtitle: "Qué se calcula primero",
  subjectId: S,
  topicIds: ["t-jerarquia"],
  estimatedMinutes: 8,
  prerequisites: ["t-signos"],
  cards: [
    intro("Jerarquía de operaciones", "En qué orden se resuelve una cuenta con varias operaciones.", "Si dos personas resuelven la misma cuenta en distinto orden, obtienen resultados distintos. La jerarquía es el acuerdo que evita eso, y es la base de todo el álgebra."),
    explain(
      "El problema",
      "¿Cuánto es $2 + 3 · 4$?\n\nSi sumás primero: $5 · 4 = 20$. Si multiplicás primero: $2 + 12 = 14$.\n\nLa respuesta correcta es **14**. La multiplicación tiene prioridad sobre la suma.",
      { tag: "intuitivo" },
    ),
    explain(
      "El orden",
      "1. **Paréntesis** (y corchetes, llaves)\n2. **Potencias y raíces**\n3. **Multiplicaciones y divisiones**, de izquierda a derecha\n4. **Sumas y restas**, de izquierda a derecha\n\nLos signos $+$ y $−$ separan la cuenta en «términos»: resolvé cada término y al final sumá.",
      { tag: "matematico" },
    ),
    explain(
      "Una analogía",
      "En una compra: «2 alfajores de \\$300 más un agua de \\$500». Nadie calcula $(2 + 300) · 500$. Primero el precio de los alfajores ($2 · 300$) y después sumás el agua. La jerarquía formaliza ese sentido común.",
      { tag: "cotidiano" },
    ),
    example("Ejemplo resuelto", "Calculá $20 − 2 · 3^2 + (4 + 1)$", ["Paréntesis: $(4 + 1) = 5$", "Potencia: $3^2 = 9$", "Multiplicación: $2 · 9 = 18$", "Sumas y restas de izquierda a derecha: $20 − 18 + 5 = 7$"], "7"),
    practice("Ejercicio guiado", "jerarquia", 1, 5, true),
    practice("Tu turno", "jerarquia", 3, 17),
    practice("Tu turno", "jerarquia", 4, 29),
    practice("Mini desafío", "jerarquia", 5, 31),
    summary(["Paréntesis → potencias → multiplicación/división → suma/resta.", "Mismo nivel: de izquierda a derecha.", "Los + y − separan términos: resolvé cada término primero."]),
  ],
  tutor: {
    normal: "Se resuelve primero lo que está entre paréntesis, después potencias y raíces, después multiplicaciones y divisiones (de izquierda a derecha) y al final sumas y restas.",
    simple: "Las sumas y restas son las últimas. Antes, todo lo demás: paréntesis, potencias, multiplicar y dividir.",
    nino: "Es como vestirse: primero las medias y después las zapatillas. Si lo hacés al revés, no funciona.",
    ejemplo: "3 + 2 · 5: primero 2 · 5 = 10, después 3 + 10 = 13. No es 5 · 5 = 25.",
  },
};

export const fracciones: Lesson = {
  id: "l-fracciones",
  title: "Fracciones",
  subtitle: "Partes de un entero",
  subjectId: S,
  topicIds: ["t-fracciones"],
  estimatedMinutes: 12,
  prerequisites: ["t-jerarquia"],
  cards: [
    intro("Fracciones", "Qué es una fracción, cómo compararlas y cómo sumarlas, multiplicarlas y dividirlas.", "Las fracciones aparecen en todas partes: pendientes, probabilidades, despejes, unidades. Y la mayoría de los resultados exactos del CBC se escriben como fracción."),
    explain(
      "Qué es una fracción",
      "$3/4$ significa: dividí un entero en **4 partes iguales** y tomá **3**.\n\nEl de abajo (**denominador**) dice el tamaño de cada parte. El de arriba (**numerador**) cuántas partes tomás.",
      { widget: { type: "fraction-bars", a: 3, b: 4, c: 1, d: 2 }, tag: "intuitivo" },
    ),
    explain(
      "Fracciones equivalentes",
      "$1/2 = 2/4 = 3/6$: es la misma cantidad cortada en más pedazos.\n\nSi multiplicás (o dividís) numerador y denominador por el mismo número, la fracción no cambia. **Simplificar** es dividir arriba y abajo por un divisor común: $6/8 = 3/4$.",
      { tag: "matematico" },
    ),
    explain(
      "Sumar: el tamaño de las partes importa",
      "$1/2 + 1/3$ **no** es $2/5$. No se pueden sumar pedazos de distinto tamaño.\n\nPrimero se cortan ambas en partes iguales (denominador común): $1/2 = 3/6$ y $1/3 = 2/6$. Ahora sí: $3/6 + 2/6 = 5/6$.\n\nCompará las barras:",
      { widget: { type: "fraction-bars", a: 1, b: 2, c: 1, d: 3 }, tag: "intuitivo" },
    ),
    example("Ejemplo resuelto", "Calculá $2/3 + 1/4$", ["Denominador común: $3 · 4 = 12$", "$2/3 = 8/12$ (multiplico arriba y abajo por 4)", "$1/4 = 3/12$ (multiplico arriba y abajo por 3)", "$8/12 + 3/12 = 11/12$"], "11/12"),
    practice("Ejercicio guiado", "fracciones-suma", 2, 7, true),
    practice("Tu turno", "fracciones-suma", 3, 19),
    explain(
      "Multiplicar y dividir",
      "**Multiplicar** es más fácil que sumar: arriba por arriba, abajo por abajo. $2/3 · 4/5 = 8/15$.\n\n**Dividir** es multiplicar por la inversa (dar vuelta la segunda): $2/3 ÷ 4/5 = 2/3 · 5/4 = 10/12 = 5/6$.",
      { tag: "matematico" },
    ),
    practice("Tu turno", "fracciones-producto", 3, 43),
    practice("Mini desafío", "fracciones-suma", 5, 47),
    summary(["El denominador es el tamaño de las partes; el numerador cuántas tomás.", "Para sumar o restar: denominador común primero.", "Multiplicar: directo. Dividir: multiplicar por la inversa.", "Simplificá al final dividiendo arriba y abajo por lo mismo."]),
  ],
  tutor: {
    normal: "Una fracción a/b representa a partes de un entero dividido en b partes iguales. Para sumar se necesita denominador común; para multiplicar se multiplica en línea; para dividir se multiplica por la inversa.",
    simple: "Para sumar fracciones, primero hacé que los «pedazos» sean del mismo tamaño (mismo número abajo). Después sumás solo los de arriba.",
    nino: "Si tenés media pizza y un tercio de otra pizza igual, no podés decir «tengo 2/5». Cortá las dos en 6 porciones: tenés 3 + 2 = 5 porciones de 6, o sea 5/6.",
    ejemplo: "1/4 + 2/4 = 3/4 (mismo tamaño de pedazo). 1/2 + 1/4 = 2/4 + 1/4 = 3/4 (primero pasé 1/2 a cuartos).",
    visual: { type: "fraction-bars", a: 1, b: 2, c: 1, d: 4 },
    visualText: "Mirá las barras: cuando los pedazos son de distinto tamaño, primero hay que cortarlos igual.",
  },
};

export const porcentajes: Lesson = {
  id: "l-porcentajes",
  title: "Porcentajes y regla de tres",
  subtitle: "Proporciones del día a día",
  subjectId: S,
  topicIds: ["t-porcentajes"],
  estimatedMinutes: 10,
  prerequisites: ["t-fracciones"],
  cards: [
    intro("Porcentajes", "Calcular porcentajes, aumentos, descuentos y resolver proporciones con regla de tres.", "Aparecen en economía, estadística, eficiencia de máquinas y errores de medición. En Ingeniería Industrial, todo el tiempo."),
    explain(
      "«Por ciento» = «de cada 100»",
      "$25\\%$ significa 25 de cada 100, o sea $25/100 = 0,25$.\n\nEl $p\\%$ de un número $N$ es $p/100 · N$. Probá cambiando los valores:",
      { widget: { type: "percent", base: 200, percent: 15 }, tag: "intuitivo" },
    ),
    explain(
      "Aumentos y descuentos",
      "Un aumento del $20\\%$ sobre \\$500: el aumento es $0,20 · 500 = 100$, el precio nuevo es $600$.\n\n**Atajo**: aumentar un $p\\%$ es multiplicar por $(1 + p/100)$. $500 · 1,20 = 600$. Descontar es multiplicar por $(1 − p/100)$.",
      { tag: "cotidiano" },
    ),
    practice("Ejercicio guiado", "porcentaje", 1, 3, true),
    practice("Tu turno", "porcentaje", 3, 13),
    explain(
      "Regla de tres directa",
      "Si 3 kg cuestan \\$900, ¿cuánto cuestan 5 kg?\n\nMás kilos → más plata: es **directa**. Lo más claro es pasar por la unidad: 1 kg cuesta $900 ÷ 3 = 300$; 5 kg cuestan $5 · 300 = 1500$.",
      { tag: "matematico" },
    ),
    explain(
      "Regla de tres inversa",
      "Si 4 personas pintan una pared en 6 horas, ¿cuánto tardan 8?\n\nMás personas → **menos** tiempo: es **inversa**. El trabajo total es $4 · 6 = 24$ «horas-persona»; repartido entre 8: $24 ÷ 8 = 3$ horas.\n\nAntes de calcular, preguntate siempre: ¿si una crece, la otra crece o achica?",
    ),
    practice("Tu turno", "regla-tres", 2, 21),
    practice("Mini desafío", "regla-tres", 4, 4),
    summary(["p% de N = p/100 · N.", "Aumento p% → ·(1 + p/100); descuento → ·(1 − p/100).", "Directa: ambas crecen juntas. Inversa: una crece y la otra achica.", "Pasar por la unidad evita errores."]),
  ],
  tutor: {
    normal: "Un porcentaje es una fracción con denominador 100. La regla de tres resuelve proporciones: directas (crecen juntas) o inversas (el producto se mantiene constante).",
    simple: "El 10% es dividir por 10. El 50% es la mitad. El 25% es la cuarta parte. Con eso podés calcular casi todo mentalmente.",
    nino: "Si en una clase de 100 chicos 30 usan anteojos, el 30% usa anteojos. Si la clase es de 20, el 30% son 6.",
    ejemplo: "15% de 80: 10% es 8, 5% es 4 (la mitad), entonces 15% = 8 + 4 = 12.",
    visual: { type: "percent", base: 100, percent: 30 },
  },
};

export const potenciasLesson: Lesson = {
  id: "l-potencias",
  title: "Potencias y raíces",
  subtitle: "Multiplicaciones repetidas y su inversa",
  subjectId: S,
  topicIds: ["t-potencias"],
  estimatedMinutes: 12,
  prerequisites: ["t-signos"],
  cards: [
    intro("Potencias", "Qué significa un exponente (positivo, cero y negativo), sus propiedades y las raíces.", "Las potencias están en la notación científica, en las unidades (m², m/s²), en polinomios, exponenciales y derivadas."),
    explain(
      "Multiplicación repetida",
      "$2^5 = 2·2·2·2·2 = 32$. La **base** (2) se multiplica por sí misma tantas veces como dice el **exponente** (5).\n\nOjo: $2^5$ **no** es $2·5$. Probá:",
      { widget: { type: "power", base: 2, exponent: 5 }, tag: "intuitivo" },
    ),
    explain(
      "Signos y paréntesis",
      "$(−2)^4 = 16$: la base es $−2$ y exponente par → positivo.\n$(−2)^3 = −8$: exponente impar → negativo.\n$−2^4 = −16$: ¡sin paréntesis la base es solo el 2!",
      { tag: "matematico" },
    ),
    explain(
      "Exponente 0 y negativo",
      "Mirá el patrón: $2^3 = 8$, $2^2 = 4$, $2^1 = 2$. Cada vez se **divide por 2**. Siguiendo:\n\n$2^0 = 1$ · $2^{−1} = 1/2$ · $2^{−2} = 1/4$\n\nUn exponente negativo **no** da un número negativo: indica el inverso. $a^{−n} = 1/a^n$.",
      { tag: "intuitivo" },
    ),
    explain(
      "Propiedades",
      "Con la **misma base**:\n\n$a^m · a^n = a^{m+n}$ (se suman)\n$a^m ÷ a^n = a^{m−n}$ (se restan)\n$(a^m)^n = a^{m·n}$ (se multiplican)\n\n**Cuidado**: $(a + b)^2 ≠ a^2 + b^2$. La potencia no se distribuye en la suma.",
      { tag: "matematico" },
    ),
    example("Ejemplo resuelto", "Simplificá $3^4 · 3^2 ÷ 3^3$", ["Producto de igual base: $3^4 · 3^2 = 3^6$", "División de igual base: $3^6 ÷ 3^3 = 3^3$", "$3^3 = 27$"], "27"),
    practice("Ejercicio guiado", "potencias", 2, 9, true),
    practice("Tu turno", "potencias", 4, 15),
    explain(
      "Raíces",
      "La raíz es la operación inversa: $√25 = 5$ porque $5^2 = 25$. La raíz cúbica de $8$ es $2$ porque $2^3 = 8$.\n\nLa raíz cuadrada de un negativo **no existe** en los números reales (ningún número al cuadrado da negativo). La cúbica sí: la raíz cúbica de $−8$ es $−2$.",
    ),
    practice("Tu turno", "raices", 3, 27),
    practice("Mini desafío", "potencias", 5, 33),
    summary(["aⁿ = a·a·…·a (n veces).", "(−a)ⁿ: par → +, impar → −. Sin paréntesis, −aⁿ = −(aⁿ).", "a⁰ = 1 y a⁻ⁿ = 1/aⁿ.", "Igual base: producto suma exponentes, división los resta.", "La raíz deshace la potencia."]),
  ],
  tutor: {
    normal: "Una potencia aⁿ es multiplicar a por sí misma n veces. El exponente 0 da 1, el negativo indica el inverso. La raíz es la operación inversa de la potencia.",
    simple: "El número de arriba cuenta cuántas veces multiplicás el de abajo: 3² = 3·3 = 9; 3³ = 3·3·3 = 27.",
    nino: "Si cada bacteria se divide en 2 cada hora, después de 5 horas tenés 2·2·2·2·2 = 2⁵ = 32 bacterias.",
    ejemplo: "10³ = 1000 (un 1 con tres ceros). 10⁻² = 1/100 = 0,01.",
    visual: { type: "power", base: 2, exponent: 4 },
  },
};

export const aritmeticaLessons = [comoEstudiar, signos, jerarquiaLesson, fracciones, porcentajes, potenciasLesson];
