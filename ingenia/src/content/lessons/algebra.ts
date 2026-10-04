import type { Lesson } from "@/engine/types";
import { example, explain, intro, practice, quiz, summary } from "./helpers";

const S = "preparacion";

export const expresiones: Lesson = {
  id: "l-expresiones",
  title: "Variables y expresiones",
  subtitle: "Letras que guardan números",
  subjectId: S,
  topicIds: ["t-expresiones"],
  estimatedMinutes: 10,
  prerequisites: ["t-jerarquia", "t-potencias"],
  cards: [
    intro("Variables", "Qué es una variable, cómo evaluar una expresión y la propiedad distributiva.", "Todo el álgebra, la física y la programación se escriben con variables. Es el idioma de la ingeniería."),
    explain(
      "Una caja con un número adentro",
      "Una **variable** es un lugar que guarda un número que todavía no conocemos o que puede cambiar. Se suele escribir con una letra: $x$, $t$, $v$.\n\n$3x$ significa «3 por x». Si $x = 4$, entonces $3x = 12$.",
      { tag: "intuitivo" },
    ),
    explain(
      "Ejemplo cotidiano",
      "Un remis cobra \\$800 de bajada de bandera más \\$300 por kilómetro. El precio de un viaje de $k$ kilómetros es:\n\n$P = 800 + 300k$\n\nPara 5 km: $P = 800 + 300·5 = 2300$. La fórmula sirve para **cualquier** distancia.",
      { tag: "cotidiano" },
    ),
    explain(
      "Evaluar: reemplazar con paréntesis",
      "Para evaluar $2x^2 − 3x$ en $x = −1$, reemplazá **con paréntesis**:\n\n$2·(−1)^2 − 3·(−1) = 2·1 + 3 = 5$\n\nSin paréntesis es fácil confundir $(−1)^2 = 1$ con $−1^2 = −1$.",
      { tag: "matematico" },
    ),
    example("Ejemplo resuelto", "Calculá $x^2 − 4x + 1$ para $x = −2$", ["Reemplazo: $(−2)^2 − 4·(−2) + 1$", "Potencia: $(−2)^2 = 4$", "Producto: $−4·(−2) = +8$", "$4 + 8 + 1 = 13$"], "13"),
    practice("Ejercicio guiado", "evaluar-expresion", 2, 3, true),
    practice("Tu turno", "evaluar-expresion", 4, 8),
    explain(
      "Propiedad distributiva",
      "$3(x + 2) = 3x + 6$. El número de afuera multiplica a **cada** término de adentro.\n\nError clásico: escribir $3x + 2$. Pensalo así: 3 bolsas con $x$ caramelos y 2 chupetines cada una tienen $3x$ caramelos **y** $6$ chupetines.\n\nSacar **factor común** es la operación inversa: $4x + 12 = 4(x + 3)$.",
    ),
    practice("Tu turno", "factor-comun", 2, 12),
    practice("Mini desafío", "factor-comun", 5, 6),
    summary(["Una variable guarda un número.", "Al evaluar, reemplazá SIEMPRE con paréntesis.", "a(b + c) = ab + ac: se multiplica a todos los términos.", "Factor común = distributiva al revés."]),
  ],
  tutor: {
    normal: "Una variable representa un número desconocido o que cambia. Una expresión algebraica combina variables y números; evaluarla es reemplazar la variable por un valor.",
    simple: "La x es un espacio en blanco. Cuando te dicen cuánto vale, la reemplazás (entre paréntesis) y hacés la cuenta.",
    nino: "Es como una receta: «x huevos por persona». Si vienen 4 personas, x es 4.",
    ejemplo: "Si x = 5, entonces 2x + 1 = 2·5 + 1 = 11.",
  },
};

export const ecuaciones: Lesson = {
  id: "l-ecuaciones",
  title: "Ecuaciones lineales",
  subtitle: "La balanza en equilibrio",
  subjectId: S,
  topicIds: ["t-ecuaciones"],
  estimatedMinutes: 15,
  prerequisites: ["t-expresiones"],
  cards: [
    intro("Ecuaciones", "Resolver ecuaciones de primer grado, entendiendo por qué cada paso es válido.", "Resolver ecuaciones es la herramienta que más vas a usar en el CBC: en física para encontrar tiempos y velocidades, en análisis para encontrar raíces, en álgebra para sistemas."),
    explain(
      "Una balanza",
      "Una ecuación es una **balanza en equilibrio**: lo de la izquierda pesa lo mismo que lo de la derecha.\n\nSi sacás 5 de un platillo, para que siga equilibrada tenés que sacar 5 del otro. **Todo lo que hagas de un lado, hacelo del otro.**",
      { widget: { type: "balance", equation: "2x + 5 = 15" }, tag: "intuitivo" },
    ),
    explain(
      "Despejar = deshacer",
      "En $2x + 5 = 15$, a la $x$ le hicieron dos cosas: la multiplicaron por 2 y le sumaron 5.\n\nPara liberarla, se deshace en **orden inverso**:\n1. Deshacer el $+5$: restar 5 en ambos lados → $2x = 10$\n2. Deshacer el $·2$: dividir por 2 en ambos lados → $x = 5$",
      { tag: "matematico" },
    ),
    explain(
      "«Pasar al otro lado»",
      "Seguramente escuchaste «lo que suma pasa restando». Es un **atajo** de la regla de la balanza: restar 5 en ambos lados hace que el 5 «desaparezca» de la izquierda y aparezca como $−5$ a la derecha.\n\nEl error más común es pasar el número **sin cambiarle el signo**. Si dudás, volvé a la balanza.",
    ),
    example("Ejemplo resuelto", "Resolvé $3x − 4 = 11$", ["Sumo 4 en ambos lados: $3x = 11 + 4$", "$3x = 15$", "Divido por 3 en ambos lados: $x = 15/3$", "$x = 5$", "Verifico: $3·5 − 4 = 11$ ✓"], "x = 5"),
    explain(
      "Escribí los pasos",
      "En los próximos ejercicios podés escribir **cada paso** de tu procedimiento. Si algo sale mal, el sistema te muestra **en qué paso** estuvo el error y por qué, sin regalarte la respuesta.\n\nCada paso tiene que ser una igualdad, por ejemplo: `2x = 10`.",
    ),
    practice("Ejercicio guiado", "ecuacion-lineal", 2, 5, true),
    practice("Tu turno", "ecuacion-lineal", 3, 14),
    explain(
      "x de los dos lados",
      "En $5x + 3 = 2x + 12$ hay x de ambos lados. Primero juntalas: restá $2x$ en ambos lados.\n\n$3x + 3 = 12$ → $3x = 9$ → $x = 3$.\n\nY si hay paréntesis, primero distributiva: $2(x − 1) = 8$ → $2x − 2 = 8$.",
    ),
    practice("Tu turno", "ecuacion-lineal", 4, 22),
    practice("Mini desafío", "ecuacion-lineal", 5, 9),
    quiz("Para pensar", {
      id: "q-ecuaciones-verificar",
      subjectId: S,
      topicId: "t-ecuaciones",
      prompt: "Resolviste una ecuación y obtuviste $x = 4$. ¿Cuál es la forma más segura de saber si está bien?",
      options: ["Reemplazar x = 4 en la ecuación original y ver si se cumple la igualdad", "Volver a resolverla igual", "Mirar si el número es entero"],
      answer: 0,
      explanation: "Verificar es reemplazar la solución en la ecuación ORIGINAL: si ambos lados dan lo mismo, la solución es correcta. Es la mejor herramienta en un parcial.",
      hints: ["¿Qué significa que x = 4 sea solución?", "Significa que hace verdadera la igualdad.", "Reemplazá y fijate si los dos lados dan igual."],
      errors: { 1: ["conceptual", "Si repetís el mismo procedimiento es fácil repetir el mismo error. Verificar reemplazando es independiente del procedimiento."] },
    }),
    summary(["Lo que hagas de un lado, hacelo del otro.", "Despejar es deshacer en orden inverso.", "Lo que suma pasa restando; lo que multiplica pasa dividiendo.", "Verificá reemplazando en la ecuación original."]),
  ],
  tutor: {
    normal: "Una ecuación lineal se resuelve aplicando la misma operación a ambos miembros hasta aislar la incógnita. Cada paso produce una ecuación equivalente: con la misma solución.",
    simple: "Sacá primero lo que está sumando o restando a la x (haciendo lo contrario en los dos lados). Después sacá lo que la multiplica (dividiendo los dos lados).",
    nino: "Hay una caja con x caramelos. Dos cajas iguales más 5 caramelos sueltos son 15 caramelos. Si sacás los 5 sueltos quedan 10 en las dos cajas; entonces cada caja tiene 5.",
    ejemplo: "x + 7 = 10 → x = 10 − 7 = 3. Verificación: 3 + 7 = 10 ✓",
    visual: { type: "balance", equation: "2x + 5 = 15" },
    visualText: "La balanza: cada operación se aplica a los dos platillos a la vez.",
  },
};

export const despeje: Lesson = {
  id: "l-despeje",
  title: "Despejar fórmulas",
  subtitle: "Ecuaciones con letras",
  subjectId: S,
  topicIds: ["t-despeje"],
  estimatedMinutes: 10,
  prerequisites: ["t-ecuaciones"],
  cards: [
    intro("Despeje de fórmulas", "Aislar cualquier variable de una fórmula física o geométrica.", "En Física casi nunca te dan la fórmula «lista»: tenés $d = v·t$ pero te piden el tiempo. Despejar bien es la mitad de cada ejercicio."),
    explain(
      "Igual que una ecuación",
      "Despejar $t$ de $d = v·t$ es lo mismo que resolver $10 = 2t$, pero con letras.\n\nLa $t$ está multiplicada por $v$ → dividí ambos lados por $v$:\n\n$d/v = t$",
      { tag: "matematico" },
    ),
    explain(
      "Truco: probá con números",
      "Si dudás, reemplazá por números fáciles. Si un auto va a 2 m/s durante 5 s, recorre 10 m. ¿El tiempo es $d/v = 10/2 = 5$? ✓ ¿O $v/d = 2/10$? ✗\n\nCon números chicos podés **verificar** cualquier despeje.",
      { tag: "cotidiano" },
    ),
    example("Ejemplo resuelto", "Despejá $a$ de $v = v_0 + a·t$", ["Resto $v_0$ en ambos lados: $v − v_0 = a·t$", "Divido por $t$ en ambos lados: $(v − v_0)/t = a$", "Los paréntesis son obligatorios: se divide toda la resta"], "a = (v − v₀)/t"),
    practice("Ejercicio guiado", "despeje-formula", 2, 1, true),
    practice("Tu turno", "despeje-formula", 3, 2),
    practice("Tu turno", "despeje-formula", 4, 6),
    practice("Mini desafío", "despeje-formula", 5, 4),
    summary(["Despejar una fórmula = resolver una ecuación con letras.", "Deshacé las operaciones en orden inverso.", "Usá paréntesis cuando dividas una suma o resta completa.", "Verificá con números fáciles."]),
  ],
  tutor: {
    normal: "Despejar una variable es aislarla aplicando operaciones inversas en ambos miembros, igual que en una ecuación numérica.",
    simple: "Fijate qué le está haciendo cada cosa a la letra que querés (sumar, multiplicar, dividir) y hacé lo contrario de los dos lados.",
    nino: "Si sabés que «distancia = velocidad por tiempo», y querés el tiempo, dividís la distancia por la velocidad: 100 km a 50 km/h son 2 horas.",
    ejemplo: "F = m·a. Si querés m: m = F/a. Verificación con números: 10 = 2·5 → m = 10/5 = 2 ✓",
  },
};

export const algebraLessons = [expresiones, ecuaciones, despeje];
