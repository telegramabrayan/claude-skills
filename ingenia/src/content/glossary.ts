import type { GlossaryEntry } from "@/engine/types";

/** Diccionario matemático: cada símbolo que aparece resaltado en la app se puede tocar para ver esta definición. */
export const GLOSSARY: GlossaryEntry[] = [
  { symbol: "=", name: "Igual", meaning: "Los dos lados valen lo mismo. En programación, en cambio, `=` significa «asignar».", example: "2 + 3 = 5" },
  { symbol: "≠", name: "Distinto", meaning: "Los dos lados NO valen lo mismo.", example: "x ≠ 0: x puede ser cualquier número menos 0", aliases: ["!="] },
  { symbol: "<", name: "Menor que", meaning: "El de la izquierda es más chico. La parte abierta apunta al mayor.", example: "−5 < 2" },
  { symbol: ">", name: "Mayor que", meaning: "El de la izquierda es más grande.", example: "7 > 4" },
  { symbol: "≤", name: "Menor o igual", meaning: "Más chico o igual.", example: "x ≤ 3 incluye al 3", aliases: ["<="] },
  { symbol: "≥", name: "Mayor o igual", meaning: "Más grande o igual.", example: "x ≥ 0: ceros y positivos", aliases: [">="] },
  { symbol: "·", name: "Por (multiplicación)", meaning: "Multiplicación. En álgebra suele omitirse: 3x = 3·x.", example: "4·5 = 20", aliases: ["×", "*"] },
  { symbol: "÷", name: "Dividido", meaning: "División. También se escribe con / o como fracción.", example: "12 ÷ 3 = 4", aliases: ["/"] },
  { symbol: "√", name: "Raíz cuadrada", meaning: "El número no negativo que, multiplicado por sí mismo, da lo de adentro.", example: "√49 = 7" },
  { symbol: "π", name: "Pi", meaning: "La relación entre la longitud de una circunferencia y su diámetro. Vale aproximadamente 3,14159.", example: "Perímetro de un círculo: 2πr" },
  { symbol: "∞", name: "Infinito", meaning: "No es un número: indica que algo crece sin límite.", example: "[0, +∞): todos los números desde 0 en adelante" },
  { symbol: "Δ", name: "Delta (mayúscula)", meaning: "Indica una variación o cambio: valor final menos valor inicial.", example: "Δx = x₂ − x₁; Δt = 5 s − 2 s = 3 s" },
  { symbol: "Σ", name: "Sigma (sumatoria)", meaning: "Representa la suma de varios términos que siguen un patrón.", example: "Σ de i=1 a 4 de i = 1 + 2 + 3 + 4 = 10", aliases: ["∑"] },
  { symbol: "∫", name: "Integral", meaning: "Representa una suma continua; se usa, por ejemplo, para calcular áreas bajo una curva. Se ve en Análisis Matemático A.", example: "∫ de 0 a 1 de x dx = 1/2" },
  { symbol: "dx", name: "Diferencial de x", meaning: "Un cambio infinitamente pequeño en x. Aparece en derivadas (dy/dx) e integrales (∫ f(x) dx).", example: "dy/dx: cuánto cambia y por cada cambio pequeñísimo en x", aliases: ["dy"] },
  { symbol: "lim", name: "Límite", meaning: "El valor al que se acerca una expresión cuando la variable se acerca a un número (sin necesariamente llegar).", example: "lim x→0 de (sen x)/x = 1" },
  { symbol: "→", name: "Tiende a / implica", meaning: "En límites: «se acerca a». En lógica: «entonces».", example: "x → 2: x se acerca a 2" },
  { symbol: "∀", name: "Para todo", meaning: "Cuantificador universal: lo que sigue vale para todos los elementos.", example: "∀x ∈ ℝ, x² ≥ 0" },
  { symbol: "∃", name: "Existe", meaning: "Cuantificador existencial: hay al menos un elemento que cumple lo que sigue.", example: "∃x ∈ ℝ tal que x² = 4 (por ejemplo, x = 2)" },
  { symbol: "∈", name: "Pertenece", meaning: "El elemento de la izquierda está en el conjunto de la derecha.", example: "3 ∈ ℕ" },
  { symbol: "∉", name: "No pertenece", meaning: "El elemento NO está en el conjunto.", example: "−1 ∉ ℕ" },
  { symbol: "ℕ", name: "Números naturales", meaning: "Los números para contar: 1, 2, 3, … (según la convención, a veces incluye el 0).", example: "5 ∈ ℕ" },
  { symbol: "ℤ", name: "Números enteros", meaning: "Naturales, sus opuestos y el cero: …, −2, −1, 0, 1, 2, …", example: "−7 ∈ ℤ" },
  { symbol: "ℚ", name: "Números racionales", meaning: "Los que se pueden escribir como fracción a/b de enteros (b ≠ 0).", example: "0,75 = 3/4 ∈ ℚ" },
  { symbol: "ℝ", name: "Números reales", meaning: "Todos los números de la recta numérica: racionales e irracionales (como √2 o π).", example: "√2 ∈ ℝ" },
  { symbol: "ℝⁿ", name: "Espacio de n coordenadas", meaning: "Conjunto de listas de n números reales. ℝ² es el plano, ℝ³ el espacio.", example: "(1, 2, 3) ∈ ℝ³", aliases: ["R^n", "ℝ²", "ℝ³"] },
  { symbol: "∪", name: "Unión", meaning: "Los elementos que están en uno u otro conjunto (o en ambos).", example: "{1, 2} ∪ {2, 3} = {1, 2, 3}" },
  { symbol: "∩", name: "Intersección", meaning: "Los elementos que están en ambos conjuntos.", example: "{1, 2} ∩ {2, 3} = {2}" },
  { symbol: "|x|", name: "Valor absoluto / módulo", meaning: "La distancia al cero (siempre ≥ 0). Para un vector, su largo.", example: "|−4| = 4; |(3, 4)| = 5" },
  { symbol: "f(x)", name: "Función evaluada", meaning: "El valor que devuelve la función f cuando la entrada es x.", example: "Si f(x) = x², f(3) = 9" },
  { symbol: "θ", name: "Theta", meaning: "Letra griega muy usada para nombrar ángulos.", example: "vx = |v|·cos θ" },
  { symbol: "α", name: "Alfa", meaning: "Letra griega usada para ángulos y constantes.", example: "Ángulo α = 30°" },
  { symbol: "ε", name: "Épsilon", meaning: "Letra griega que en Análisis suele representar una cantidad positiva muy pequeña (tan chica como se quiera).", example: "«para todo ε > 0…» aparece en la definición de límite" },
  { symbol: "δ", name: "Delta (minúscula)", meaning: "Como ε, una cantidad positiva pequeña; aparece junto a ε en la definición formal de límite.", example: "|x − a| < δ" },
  { symbol: "°", name: "Grados", meaning: "Unidad de ángulo: una vuelta completa son 360°.", example: "Ángulo recto: 90°" },
  { symbol: "%", name: "Por ciento", meaning: "De cada 100.", example: "25% = 25/100 = 0,25" },
  { symbol: "v₀", name: "Subíndice 0", meaning: "El 0 abajo indica «valor inicial» (en t = 0).", example: "v₀ = velocidad inicial, x₀ = posición inicial", aliases: ["x₀", "y₀", "v_0", "x_0"] },
  { symbol: "²", name: "Al cuadrado", meaning: "Exponente 2: el número multiplicado por sí mismo.", example: "5² = 25; m² (metros cuadrados) es unidad de área" },
  { symbol: "≈", name: "Aproximadamente", meaning: "Casi igual: se usa al redondear.", example: "π ≈ 3,14" },
  { symbol: "⇔", name: "Si y solo si", meaning: "Las dos afirmaciones son equivalentes: una vale exactamente cuando vale la otra.", example: "u·v = 0 ⇔ u y v son perpendiculares" },
];

export const GLOSSARY_SYMBOLS = new Map<string, GlossaryEntry>();
for (const g of GLOSSARY) {
  GLOSSARY_SYMBOLS.set(g.symbol, g);
  g.aliases?.forEach((a) => GLOSSARY_SYMBOLS.set(a, g));
}
