import type { ErrorType, SkillId, Topic } from "@/engine/types";
import { FISICA_TOPICS } from "./topics-fisica";
import { PC_TOPICS } from "./topics-pc";
import { AM_TOPICS } from "./topics-am";
import { ALGEBRA_TOPICS } from "./topics-algebra";
import { IPC_TOPICS } from "./topics-ipc";
import { ICSE_TOPICS } from "./topics-icse";

const t = (id: string, name: string, subjectId: string, skill: SkillId, generators: string[], lessonId: string, prerequisites: string[] = []): Topic => ({
  id,
  name,
  subjectId,
  skill,
  generators,
  lessonId,
  prerequisites,
});

export const TOPICS: Topic[] = [
  t("t-signos", "Números negativos y signos", "preparacion", "aritmetica", ["signos-suma", "signos-producto", "comparar-numeros"], "l-signos"),
  t("t-jerarquia", "Orden de las operaciones", "preparacion", "aritmetica", ["jerarquia"], "l-jerarquia", ["t-signos"]),
  t("t-fracciones", "Fracciones", "preparacion", "aritmetica", ["fracciones-suma", "fracciones-producto"], "l-fracciones", ["t-jerarquia"]),
  t("t-porcentajes", "Porcentajes y regla de tres", "preparacion", "aritmetica", ["porcentaje", "regla-tres"], "l-porcentajes", ["t-fracciones"]),
  t("t-potencias", "Potencias y raíces", "preparacion", "aritmetica", ["potencias", "raices"], "l-potencias", ["t-signos"]),
  t("t-expresiones", "Variables y expresiones", "preparacion", "algebra", ["evaluar-expresion", "factor-comun", "verdadero-falso"], "l-expresiones", ["t-jerarquia", "t-potencias"]),
  t("t-ecuaciones", "Ecuaciones lineales", "preparacion", "algebra", ["ecuacion-lineal", "ordenar-pasos", "encontrar-error"], "l-ecuaciones", ["t-expresiones", "t-signos"]),
  t("t-factorizacion", "Factorización", "preparacion", "algebra", ["factorizar"], "l-factorizacion", ["t-expresiones", "t-potencias"]),
  t("t-cuadratica", "Ecuaciones cuadráticas", "preparacion", "algebra", ["ecuacion-cuadratica"], "l-cuadratica", ["t-factorizacion", "t-ecuaciones"]),
  t("t-pitagoras", "Pitágoras y distancia", "preparacion", "trigonometria", ["pitagoras"], "l-pitagoras", ["t-potencias"]),
  t("t-trigonometria", "Trigonometría básica", "preparacion", "trigonometria", ["trigonometria"], "l-trigonometria", ["t-pitagoras", "t-fracciones"]),
  t("t-despeje", "Despeje de fórmulas", "preparacion", "algebra", ["despeje-formula"], "l-despeje", ["t-ecuaciones"]),
  t("t-funciones", "Funciones", "am-a", "funciones", ["funcion-evaluar", "elegir-grafico"], "l-funciones", ["t-expresiones"]),
  t("t-recta", "Función lineal y pendiente", "am-a", "graficos", ["pendiente", "recta-elementos"], "l-recta", ["t-funciones", "t-fracciones"]),
  t("t-dominio", "Dominio de una función", "am-a", "funciones", ["dominio"], "l-dominio", ["t-funciones", "t-ecuaciones"]),
  t("t-limites", "Límites", "am-a", "funciones", ["limite"], "l-limites", ["t-funciones", "t-factorizacion"]),
  t("t-derivadas", "Derivadas", "am-a", "funciones", ["derivada-potencia"], "l-derivadas", ["t-recta", "t-potencias", "t-limites"]),
  t("t-unidades", "Unidades y notación científica", "fisica", "fisica", ["conversion-unidades", "notacion-cientifica", "relacionar-unidades"], "l-unidades", ["t-potencias"]),
  t("t-vectores", "Vectores", "fisica", "vectores", ["vector-modulo", "vector-suma", "vector-componentes"], "l-vectores", ["t-potencias", "t-signos"]),
  t("t-producto-escalar", "Producto escalar", "algebra-a", "vectores", ["producto-escalar"], "l-producto-escalar", ["t-vectores"]),
  t("t-mru", "Movimiento rectilíneo uniforme", "fisica", "fisica", ["mru", "velocidad-media"], "l-mru", ["t-despeje", "t-unidades"]),
  t("t-mruv", "Movimiento uniformemente variado", "fisica", "fisica", ["mruv", "cinematica-conceptos"], "l-mruv", ["t-mru"]),
  t("t-caida-libre", "Caída libre y tiro vertical", "fisica", "fisica", ["caida-libre"], "l-caida-libre", ["t-mruv"]),
  t("t-variables-codigo", "Variables y asignación", "pensamiento-computacional", "computacional", ["traza-asignacion"], "l-algoritmos"),
  t("t-condicionales", "Condicionales y lógica", "pensamiento-computacional", "logica", ["traza-if", "logica-booleana"], "l-condicionales", ["t-variables-codigo"]),
  t("t-bucles", "Bucles", "pensamiento-computacional", "computacional", ["traza-for", "traza-while"], "l-bucles", ["t-condicionales"]),
  ...FISICA_TOPICS,
  ...PC_TOPICS,
  ...AM_TOPICS,
  ...ALGEBRA_TOPICS,
  ...IPC_TOPICS,
  ...ICSE_TOPICS,
];

const BY_ID = new Map(TOPICS.map((x) => [x.id, x]));

export function getTopic(id: string): Topic | undefined {
  return BY_ID.get(id);
}

export const SKILL_LABELS: Record<SkillId, string> = {
  aritmetica: "Operaciones básicas",
  algebra: "Álgebra",
  funciones: "Funciones",
  graficos: "Interpretación gráfica",
  vectores: "Vectores",
  fisica: "Física",
  logica: "Lógica",
  computacional: "Pensamiento computacional",
  trigonometria: "Trigonometría y geometría",
};

export const ERROR_LABELS: Record<ErrorType, string> = {
  signos: "Signos",
  calculo: "Cálculo",
  conceptual: "Conceptual",
  despeje: "Despejes",
  unidades: "Unidades",
  "velocidad-aceleracion": "Velocidad vs. aceleración",
  vectores: "Vectores",
  derivacion: "Derivación",
  interpretacion: "Interpretación del problema",
  jerarquia: "Orden de operaciones",
  fracciones: "Fracciones",
  potencias: "Potencias",
  formula: "Uso de fórmulas",
  sintaxis: "Sintaxis",
  logica: "Lógica",
  algoritmico: "Algorítmico",
  factorizacion: "Factorización",
  limites: "Límites",
  trigonometria: "Trigonometría",
  programacion: "Programación",
};

/** Tema de refuerzo recomendado para cada tipo de error recurrente. */
export const ERROR_REMEDIATION: Partial<Record<ErrorType, string>> = {
  signos: "t-signos",
  calculo: "t-jerarquia",
  jerarquia: "t-jerarquia",
  fracciones: "t-fracciones",
  potencias: "t-potencias",
  despeje: "t-despeje",
  unidades: "t-unidades",
  vectores: "t-vectores",
  "velocidad-aceleracion": "t-mruv",
  formula: "t-mruv",
  logica: "t-condicionales",
  algoritmico: "t-bucles",
  interpretacion: "t-porcentajes",
  factorizacion: "t-factorizacion",
  limites: "t-limites",
  trigonometria: "t-trigonometria",
  derivacion: "t-derivadas",
  programacion: "t-variables-codigo",
};
