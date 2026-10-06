import type { Topic } from "@/engine/types";

/**
 * Temas de Álgebra A (CBC). Contenido estándar de primer año; no corresponde a
 * ninguna cátedra en particular. Unidad sugerida en el comentario de cada uno.
 */
const t = (id: string, name: string, skill: Topic["skill"], generators: string[], lessonId: string, prerequisites: string[]): Topic => ({
  id,
  name,
  subjectId: "algebra-a",
  skill,
  generators,
  lessonId,
  prerequisites,
});

export const ALGEBRA_TOPICS: Topic[] = [
  // alg-con · Conjuntos
  t("t-alg-conjuntos", "Operaciones entre conjuntos", "logica", ["alg-conjuntos-operacion", "alg-conjuntos-relacionar"], "l-alg-conjuntos", []),
  t("t-alg-valor-absoluto", "Intervalos e inecuaciones con valor absoluto", "algebra", ["alg-abs-intervalo", "alg-intervalos-operacion"], "l-alg-valor-absoluto", ["t-alg-conjuntos", "t-ecuaciones", "t-signos"]),
  // alg-cx · Números complejos y polinomios
  t("t-alg-complejos", "Números complejos en forma binómica", "algebra", ["alg-complejo-operacion", "alg-complejo-cociente", "alg-potencia-i"], "l-alg-complejos", ["t-expresiones", "t-potencias"]),
  t("t-alg-complejos-polar", "Forma trigonométrica y De Moivre", "trigonometria", ["alg-complejo-polar", "alg-de-moivre"], "l-alg-complejos-polar", ["t-alg-complejos", "t-trigonometria", "t-pitagoras"]),
  t("t-alg-polinomios-division", "División de polinomios, Ruffini y teorema del resto", "algebra", ["alg-teorema-resto", "alg-ruffini-cociente"], "l-alg-polinomios-division", ["t-expresiones", "t-potencias"]),
  t("t-alg-polinomios-raices", "Raíces y factorización de polinomios", "algebra", ["alg-polinomio-factorizar"], "l-alg-polinomios-raices", ["t-alg-polinomios-division", "t-cuadratica", "t-factorizacion"]),
];
