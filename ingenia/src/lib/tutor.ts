/**
 * Proveedor del profesor. Hoy responde con el contenido curado de la
 * plataforma (determinístico, sin inventar). La interfaz permite enchufar
 * más adelante un proveedor conversacional (por ejemplo, un modelo de lenguaje
 * detrás de una API propia) sin tocar la UI: basta con implementar `ask`.
 */
import { search, type SearchEntry } from "./search";

export interface TutorAnswer {
  intro: string;
  results: SearchEntry[];
}

export interface TutorProvider {
  ask(question: string): Promise<TutorAnswer>;
}

const STOP = /\b(que|qué|es|un|una|el|la|los|las|de|del|como|cómo|para|por|me|explicas|explicame|explicámelo|significa|sirve|cuando|cuándo|se|usa|y|o|en)\b/gi;

export const localTutor: TutorProvider = {
  async ask(question) {
    const keywords = question
      .replace(/[¿?¡!.,]/g, " ")
      .replace(STOP, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3 || /[ΣΔ∫ℝℕℤℚπθαεδ√∞∀∃∈→]/.test(w))
      .join(" ");
    const results = search(keywords || question, 6);
    return {
      intro: results.length
        ? "Esto es lo que tengo en la plataforma sobre eso. Elegí por dónde seguir:"
        : "Todavía no tengo contenido sobre eso. Probá con otras palabras (por ejemplo «pendiente», «vectores», «bucle») o buscá en el diccionario.",
      results,
    };
  },
};
