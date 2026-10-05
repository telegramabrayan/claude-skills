/** Taller: cosméticos que se compran con engranajes. Nunca bloquea contenido educativo. */
export interface ShopItem {
  id: string;
  kind: "accent" | "freeze" | "guide";
  name: string;
  description: string;
  price: number;
  /** Para colores: valor de data-accent / data-guide. */
  value?: string;
  swatch?: string;
}

export const SHOP: ShopItem[] = [
  { id: "freeze", kind: "freeze", name: "Protector de racha", description: "Si un día no estudiás, la racha sigue. Podés tener hasta 2.", price: 25 },
  { id: "accent-turquesa", kind: "accent", name: "Turquesa", description: "El color original.", price: 0, value: "turquesa", swatch: "#0f766e" },
  { id: "accent-cobalto", kind: "accent", name: "Cobalto", description: "Azul de plano técnico.", price: 40, value: "cobalto", swatch: "#1d4ed8" },
  { id: "accent-ambar", kind: "accent", name: "Ámbar", description: "Cálido, como un osciloscopio viejo.", price: 40, value: "ambar", swatch: "#b45309" },
  { id: "accent-magenta", kind: "accent", name: "Magenta", description: "Para destacar.", price: 40, value: "magenta", swatch: "#be185d" },
  { id: "accent-grafito", kind: "accent", name: "Grafito", description: "Sobrio y sin distracciones.", price: 40, value: "grafito", swatch: "#334155" },
  { id: "guide-noche", kind: "guide", name: "Nodo nocturno", description: "Tu guía en versión oscura.", price: 30, value: "noche", swatch: "#312e81" },
  { id: "guide-cobre", kind: "guide", name: "Nodo de cobre", description: "Tu guía con acabado de cobre.", price: 30, value: "cobre", swatch: "#c2410c" },
];
