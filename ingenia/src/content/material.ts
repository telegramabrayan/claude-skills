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

export function materialFor(subjectId: string): MaterialSet | undefined {
  return MATERIAL.find((m) => m.subjectId === subjectId);
}
