/**
 * Material de estudio aportado por el estudiante (carpeta «Material de estudio»
 * de su Drive), analizado y organizado. Acá NO se reproducen los exámenes: se
 * guarda qué hay, qué evalúa cada instancia y cómo practicar cada tipo de
 * ejercicio con los generadores propios de Ingenia.
 */
import type { SessionItem } from "@/components/session/Session";

export interface ExamBlueprint {
  id: string;
  title: string;
  /** Duración real aproximada (minutos). */
  minutes: number;
  note: string;
  items: (SessionItem & { label: string; points: number })[];
}

export interface MaterialSet {
  subjectId: string;
  catedra: string;
  summary: string;
  files: { group: string; count: number; detail: string }[];
  /** Qué evalúa cada instancia según el material. */
  instances: { name: string; evaluates: string[] }[];
  /** Observaciones útiles (erratas de las claves, formato, convenciones). */
  notes: string[];
  blueprints: ExamBlueprint[];
}

const it = (topicId: string, label: string, points: number, difficulty: SessionItem["difficulty"] = 4) => ({ topicId, label, points, difficulty });

export const MATERIAL: MaterialSet[] = [
  {
    subjectId: "am-a",
    catedra: "Análisis Matemático A (66) — Cátedra Cabana",
    summary: "22 claves y resoluciones de 2023 (11 exámenes distintos: cada par de temas es el mismo examen con otros números u opciones permutadas). Tu ZIP «Álgebra» resultó ser una copia exacta de este: no hay material de Álgebra.",
    files: [
      { group: "1.er parcial", count: 12, detail: "1.er cuatrimestre (temas 1–6) y 2.º cuatrimestre (temas 1–6)" },
      { group: "Recuperatorio 1.er parcial", count: 2, detail: "Temas 7 y 8" },
      { group: "2.º parcial", count: 4, detail: "1.er cuatrimestre, temas 1–4" },
      { group: "Recuperatorio 2.º parcial", count: 2, detail: "Temas 5 y 6" },
      { group: "Final", count: 2, detail: "Julio 2023, temas 1 y 2" },
    ],
    instances: [
      { name: "1.er parcial", evaluates: ["Estudio de función por opción múltiple (siempre, 3–4 de 10 puntos)", "Límites: ∞ − ∞ con raíces, 0/0, ∞/∞ con acotadas, 1^∞", "Continuidad con parámetros y L'Hôpital", "Regla de la cadena y recta tangente", "Extremos absolutos en [a, b]", "Asíntota oblicua y derivabilidad"] },
      { name: "2.º parcial", evaluates: ["Polinomio de Taylor", "Serie de potencias: intervalo de convergencia", "Área con parámetro", "Primitivas: sustitución, partes, fracciones simples", "Teorema fundamental del cálculo", "Planteo de área entre curvas"] },
      { name: "Final", evaluates: ["Límite con TFC y L'Hôpital", "Serie geométrica con parámetro", "Recta tangente con parámetros", "Integral de una función impar", "Planteo de área", "Ecuación diferencial separable"] },
    ],
    notes: [
      "Dato clave de recta tangente: si la tangente a f en x₁ es y = mx + n, entonces f′(x₁) = m y f(x₁) = m·x₁ + n (no n).",
      "En el estudio de función los distractores usan intervalos fuera del dominio y confunden abscisa con ordenada: la imagen es [f(6); +∞), no [6; +∞).",
      "En series, la diferencia entre opciones suele estar en los extremos del intervalo: siempre analizalos aparte.",
      "Hay erratas en algunas claves (por ejemplo, el 2.º parcial tema 4 escribe a = 19, b = 9 en la resolución cuando la respuesta es a = 29, b = 16).",
    ],
    blueprints: [
      {
        id: "am-1p",
        title: "1.er parcial (formato de la cátedra)",
        minutes: 120,
        note: "Extremos 2 · límite 2 · cadena y tangente 2 · continuidad 1 · estudio de función 3.",
        items: [it("t-am-extremos-absolutos", "Extremos absolutos", 2), it("t-am-lim-indeterminadas", "Límite", 2), it("t-am-recta-tangente", "Cadena y recta tangente", 2), it("t-am-continuidad", "Continuidad", 1), it("t-am-estudio-funcion", "Estudio de función (a)", 1), it("t-am-estudio-funcion", "Estudio de función (b)", 1), it("t-am-estudio-funcion", "Estudio de función (c)", 1)],
      },
      {
        id: "am-2p",
        title: "2.º parcial (formato de la cátedra)",
        minutes: 120,
        note: "Taylor 2 · serie 2 · área con parámetro 1 · primitivas 2 · TFC 1 · planteo de área 2.",
        items: [it("t-am-taylor", "Taylor", 2), it("t-am-series", "Serie de potencias", 2), it("t-am-integral-area", "Área con parámetro", 1), it("t-am-primitivas", "Primitiva (sustitución)", 1), it("t-am-partes-fracciones", "Primitiva (partes)", 1), it("t-am-tfc", "TFC", 1), it("t-am-integral-area", "Planteo de área", 2)],
      },
      {
        id: "am-final",
        title: "Final (formato de la cátedra)",
        minutes: 120,
        note: "Límite con L'Hôpital 2 · serie 2 · tangente 2 · integral 1 · área 2 · EDO 1.",
        items: [it("t-am-lhopital", "Límite con L'Hôpital", 2), it("t-am-series", "Serie geométrica", 2), it("t-am-recta-tangente", "Recta tangente", 2), it("t-am-integral-area", "Integral definida", 1), it("t-am-integral-area", "Planteo de área", 2), it("t-am-edo", "EDO separable", 1)],
      },
    ],
  },
  {
    subjectId: "fisica",
    catedra: "Física (03) — Cátedra Torti, UBA XXI",
    summary: "14 claves de corrección de 2023: primeros y segundos parciales, recuperatorios y el final de julio. Todos usan g = 9,80 m/s², piden 3 cifras significativas y la unidad.",
    files: [
      { group: "1.er parcial", count: 5, detail: "2023-1 (temas 2 y 4) y 2023-2 (temas 2, 4 y 6)" },
      { group: "Recuperatorio 1.er parcial", count: 2, detail: "2023-1, temas 1 y 2 (con resolución)" },
      { group: "2.º parcial", count: 3, detail: "2023-1, temas 1, 2 y 4" },
      { group: "Recuperatorio 2.º parcial", count: 2, detail: "2023-1, temas 1 y 2 (con resolución)" },
      { group: "Final", count: 2, detail: "Julio 2023, temas 1 y 2" },
    ],
    instances: [
      { name: "1.er parcial", evaluates: ["Vectores (componentes, resta, equilibrante, producto vectorial)", "MRU y MRUV (encuentro, frenado, gráficos v–t)", "Estática de partícula y cuerpo rígido (momentos)", "Hidrostática (presión, Pascal, Arquímedes)"] },
      { name: "2.º parcial", evaluates: ["Caída libre", "Tiro oblicuo", "Plano inclinado con rozamiento", "Cuerpos vinculados", "Trabajo y energía"] },
      { name: "Final", evaluates: ["Dos problemas integradores de 5 ítems (cohete; caja con resorte y potencia)"] },
    ],
    notes: [
      "El movimiento circular figura en la hoja de fórmulas, pero no se evaluó en ningún examen del material.",
      "Muchos datos están solo en las figuras (ángulos, alturas, cotas): entrená leerlos.",
      "Errores típicos que buscan los ejercicios: seno ↔ coseno según desde dónde se mide el ángulo, diámetro tomado como radio, olvidar el peso, μ estático ↔ dinámico, no sumar la altura inicial.",
    ],
    blueprints: [
      {
        id: "fis-1p",
        title: "1.er parcial (formato de la cátedra)",
        minutes: 90,
        note: "Misma distribución de temas y puntajes que los primeros parciales del material, con ejercicios propios de Ingenia.",
        items: [it("t-vec-operaciones", "Vectores", 1), it("t-vec-componentes", "Vectores", 1), it("t-encuentro", "MRU", 1.5), it("t-frenado", "MRUV", 1), it("t-estatica-particula", "Estática", 1.5), it("t-momentos", "Cuerpo rígido", 1.5), it("t-presion", "Presión y Pascal", 1), it("t-arquimedes", "Flotación", 1.5)],
      },
      {
        id: "fis-2p",
        title: "2.º parcial (formato de la cátedra)",
        minutes: 90,
        note: "Cinemática en 2D, dinámica y energía con la distribución del material.",
        items: [it("t-caida-libre", "Caída libre", 1.5), it("t-tiro-oblicuo", "Tiro oblicuo", 1.5), it("t-tiro-altura", "Tiro desde una altura", 1), it("t-plano-inclinado", "Plano inclinado", 2), it("t-vinculados", "Vinculados", 1.5), it("t-energia", "Trabajo y energía", 2), it("t-resorte-potencia", "Resorte y potencia", 0.5)],
      },
    ],
  },
  {
    subjectId: "pensamiento-computacional",
    catedra: "Pensamiento Computacional (90) — Cátedra Camejo",
    summary: "8 claves del primer parcial (temas 1 a 8). Todo el parcial es de opción múltiple: leer código Python y predecir qué muestra. Ejercicios 1 a 9 valen 1 punto; 10 y 11, 2 puntos (13 en total).",
    files: [{ group: "1.er parcial", count: 8, detail: "Temas 1 a 8, mismos 11 tipos de ejercicio con otros datos" }],
    instances: [
      {
        name: "1.er parcial",
        evaluates: [
          "Expresiones booleanas, precedencia y range",
          "Tipos e input: qué programa da TypeError",
          "Condicionales anidados con % y //",
          "Ciclos: cantidad de líneas y acumuladores",
          "Funciones con strings (count, split, join)",
          "¿Qué hace el programa? / index y slicing",
          "Listas",
          "Diccionario + replace encadenado",
          "Listas de tuplas e índices anidados",
          "Dibujos con ciclos anidados (2 pts)",
          "Dos diccionarios combinados (2 pts)",
        ],
      },
    ],
    notes: [
      "Ojo: dos claves oficiales tienen la respuesta mal marcada (tema 2 ej. 9: la correcta es la opción 3; tema 4 ej. 10: la correcta es la opción 1). En Ingenia las respuestas se calculan ejecutando el código.",
      "No aparecen archivos, recursión, excepciones ni comprensiones de listas.",
      "La habilidad central es hacer la traza a mano con una tabla de variables.",
    ],
    blueprints: [
      {
        id: "pc-1p",
        title: "1.er parcial (los 11 tipos de ejercicio)",
        minutes: 90,
        note: "Un ejercicio de cada tipo, en el mismo orden y con el mismo puntaje que el parcial de la cátedra.",
        items: [
          it("t-pc-booleanos", "Ej. 1 · Booleanos", 1),
          it("t-pc-tipos", "Ej. 2 · Tipos y errores", 1),
          it("t-pc-condicionales", "Ej. 3 · Condicionales", 1),
          it("t-pc-ciclos", "Ej. 4 · Ciclos", 1),
          it("t-pc-metodos-str", "Ej. 5 · Funciones con strings", 1),
          it("t-pc-strings", "Ej. 6 · Índices y slicing", 1),
          it("t-pc-listas", "Ej. 7 · Listas", 1),
          it("t-pc-dicts", "Ej. 8 · Diccionarios", 1),
          it("t-pc-tuplas", "Ej. 9 · Listas de tuplas", 1),
          it("t-pc-dibujos", "Ej. 10 · Dibujos", 2),
          it("t-pc-dicts", "Ej. 11 · Dos diccionarios", 2),
        ],
      },
    ],
  },
];

MATERIAL.push({
  subjectId: "ipc",
  catedra: "Introducción al Pensamiento Científico (040) — UBA XXI, Cátedra A",
  summary: "Programa oficial 2026, claves del 1.er parcial (2023 y 2024), resúmenes y respuestas de lecciones. Bibliografía obligatoria: «Desenredando la ciencia» (Eudeba, 2022).",
  files: [
    { group: "Programa 2026", count: 1, detail: "Unidades, bibliografía y régimen de promoción (fuente de la estructura de la materia)" },
    { group: "Claves de 1.er parcial", count: 8, detail: "2023 y 1.er cuatrimestre 2024 (temas 1 a 12)" },
    { group: "Resúmenes y lecciones", count: 20, detail: "Resúmenes de 1.er y 2.º parcial, cuadros conceptuales y respuestas de lecciones (algunos de programas anteriores)" },
  ],
  instances: [
    { name: "1.er parcial (según claves 2024)", evaluates: ["Unidad 1: argumentos, enunciados, conectivas, condiciones necesarias y suficientes, validez, formas válidas e inválidas, inducción", "Unidad 2: la revolución darwiniana"] },
    { name: "2.º parcial (inferido de los resúmenes)", evaluates: ["Unidad 3: contrastación, positivismo lógico, Popper, explicación científica, Kuhn, epistemología feminista", "Unidad 4: ética y políticas científicas"] },
  ],
  notes: [
    "El formato del 1.er parcial es de 10 preguntas de opción múltiple, 1 punto cada una, sin puntaje parcial.",
    "Parte del material corresponde a programas anteriores (sistemas axiomáticos, geometrías no euclidianas, Copérnico): no entra en el programa 2026.",
    "Ojo con algunos resúmenes de estudiantes: hay uno que define el modus tollens con la forma de la falacia de afirmación del consecuente. En Ingenia está corregido.",
  ],
  blueprints: [
    {
      id: "ipc-1p",
      title: "1.er parcial (10 preguntas, formato de las claves)",
      minutes: 75,
      note: "Ocho preguntas de la Unidad 1 y dos de Darwin, como en las claves 2024.",
      items: [it("t-ipc-argumentos", "Argumentos", 1), it("t-ipc-enunciados", "Enunciados", 1), it("t-ipc-conectivas", "Conectivas", 1), it("t-ipc-condiciones", "Condiciones", 1), it("t-ipc-tautologias", "Tautologías", 1), it("t-ipc-validez", "Validez", 1), it("t-ipc-formas", "Formas de razonamiento", 1), it("t-ipc-inductivos", "Inductivos", 1), it("t-ipc-pre-darwin", "Darwin I", 1), it("t-ipc-seleccion-natural", "Darwin II", 1)],
    },
    {
      id: "ipc-2p",
      title: "2.º parcial (práctica de unidades 3 y 4)",
      minutes: 75,
      note: "Formato inferido: no hay claves de 2.º parcial en el material.",
      items: [it("t-ipc-contrastacion", "Contrastación", 1), it("t-ipc-contrastacion", "Contrastación", 1), it("t-ipc-pl-popper", "Positivismo y Popper", 1), it("t-ipc-pl-popper", "Popper", 1), it("t-ipc-explicacion", "Explicación", 1), it("t-ipc-kuhn", "Kuhn", 1), it("t-ipc-kuhn", "Kuhn", 1), it("t-ipc-feminismo", "Epistemología feminista", 1), it("t-ipc-etica", "Ética", 1), it("t-ipc-politicas", "Políticas científicas", 1)],
    },
  ],
});

export function materialFor(subjectId: string): MaterialSet | undefined {
  return MATERIAL.find((m) => m.subjectId === subjectId);
}
