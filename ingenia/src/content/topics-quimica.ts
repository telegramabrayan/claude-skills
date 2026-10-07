import type { Topic } from "@/engine/types";

/**
 * Temas de Química (CBC). Unidad sugerida en el comentario de cada grupo.
 * Las unidades qui-u1..qui-u5 siguen los títulos de los contenidos mínimos
 * encontrados para la materia; qui-u6..qui-u11 son temas estándar de
 * Química general pendientes de verificar contra el programa oficial.
 */
const t = (id: string, name: string, skill: Topic["skill"], generators: string[], lessonId: string, prerequisites: string[]): Topic => ({
  id,
  name,
  subjectId: "quimica",
  skill,
  generators,
  lessonId,
  prerequisites,
});

export const QUIMICA_TOPICS: Topic[] = [
  // qui-u1: Sistemas materiales
  t("t-qui-sistemas", "Sistemas materiales: fases, componentes, densidad y composición", "logica", ["qui-sistemas-clasificar", "qui-fases-componentes", "qui-densidad", "qui-mezcla-porcentaje"], "l-qui-sistemas", ["t-porcentajes", "t-unidades"]),
  // qui-u2: Estructura atómica y tabla periódica
  t("t-qui-atomo", "Estructura atómica: Z, A, iones e isótopos", "aritmetica", ["qui-particulas-subatomicas", "qui-isotopos-promedio"], "l-qui-atomo", ["t-porcentajes"]),
  t("t-qui-tabla", "Configuración electrónica y tabla periódica", "logica", ["qui-configuracion-electronica", "qui-tendencias-periodicas"], "l-qui-tabla", ["t-qui-atomo"]),
  // qui-u3: Uniones químicas y nomenclatura
  t("t-qui-uniones", "Uniones químicas: iónica, covalente y metálica", "logica", ["qui-tipo-union"], "l-qui-uniones", ["t-qui-tabla"]),
  t("t-qui-nomenclatura", "Número de oxidación y fórmulas de compuestos", "algebra", ["qui-numero-oxidacion", "qui-formula-compuesto"], "l-qui-nomenclatura", ["t-qui-uniones", "t-signos", "t-ecuaciones"]),
  // qui-u4: Fuerzas intermoleculares
  t("t-qui-fuerzas", "Geometría molecular, polaridad y fuerzas intermoleculares", "logica", ["qui-geometria-polaridad", "qui-fuerzas-ebullicion"], "l-qui-fuerzas", ["t-qui-uniones"]),
  // qui-u5: Magnitudes atómico-moleculares
  t("t-qui-masa-molar", "Masa molar y composición centesimal", "aritmetica", ["qui-masa-molar", "qui-composicion-centesimal"], "l-qui-masa-molar", ["t-qui-nomenclatura", "t-porcentajes"]),
  t("t-qui-mol", "El mol: masa, moles y número de partículas", "aritmetica", ["qui-moles-masa", "qui-avogadro"], "l-qui-mol", ["t-qui-masa-molar", "t-potencias", "t-unidades"]),
  // qui-u6: Gases
  t("t-qui-gases-leyes", "Leyes de los gases (Boyle, Charles, combinada)", "algebra", ["qui-gases-combinada"], "l-qui-gases", ["t-despeje", "t-unidades"]),
  t("t-qui-gas-ideal", "Gas ideal (PV = nRT) y mezclas gaseosas", "algebra", ["qui-gas-ideal", "qui-presion-parcial"], "l-qui-gas-ideal", ["t-qui-gases-leyes", "t-qui-mol"]),
  // qui-u7: Soluciones
  t("t-qui-concentracion", "Soluciones: % m/m, % m/V y molaridad", "aritmetica", ["qui-concentracion-porcentual", "qui-molaridad"], "l-qui-soluciones", ["t-qui-mol", "t-porcentajes", "t-unidades"]),
  t("t-qui-dilucion", "Diluciones", "algebra", ["qui-dilucion"], "l-qui-diluciones", ["t-qui-concentracion", "t-despeje"]),
  // qui-u8: Reacciones y estequiometría
  t("t-qui-balanceo", "Ecuaciones químicas y balanceo", "logica", ["qui-balanceo", "qui-balanceo-coeficiente"], "l-qui-balanceo", ["t-qui-nomenclatura"]),
  t("t-qui-estequiometria", "Estequiometría: masa, moles y volumen", "aritmetica", ["qui-estequiometria-masa"], "l-qui-estequiometria", ["t-qui-balanceo", "t-qui-mol", "t-qui-gas-ideal", "t-fracciones"]),
  t("t-qui-limitante", "Reactivo limitante, pureza y rendimiento", "aritmetica", ["qui-reactivo-limitante", "qui-rendimiento-pureza"], "l-qui-limitante", ["t-qui-estequiometria", "t-porcentajes"]),
  // qui-u9: Equilibrio químico
  t("t-qui-equilibrio", "Equilibrio químico: Kc y principio de Le Chatelier", "algebra", ["qui-kc-calculo", "qui-le-chatelier"], "l-qui-equilibrio", ["t-qui-concentracion", "t-qui-balanceo", "t-potencias"]),
  // qui-u10: Ácido-base
  t("t-qui-ph", "Ácidos, bases y pH", "algebra", ["qui-ph-fuerte", "qui-ph-debil"], "l-qui-ph", ["t-qui-concentracion", "t-qui-equilibrio", "t-potencias"]),
  // qui-u11: Óxido-reducción
  t("t-qui-redox", "Reacciones de óxido-reducción", "logica", ["qui-redox-identificar", "qui-redox-electrones"], "l-qui-redox", ["t-qui-nomenclatura", "t-qui-balanceo"]),
];
