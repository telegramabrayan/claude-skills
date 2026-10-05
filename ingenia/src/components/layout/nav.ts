import type { IconName } from "../ui/Icon";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

export const NAV_MAIN: NavItem[] = [
  { href: "/", label: "Inicio", icon: "home" },
  { href: "/camino", label: "Camino", icon: "path" },
  { href: "/materias", label: "Materias", icon: "book" },
  { href: "/mapa", label: "Mapa de carrera", icon: "map" },
  { href: "/practicar", label: "Practicar", icon: "target" },
  { href: "/laboratorio", label: "Laboratorio", icon: "flask" },
  { href: "/examenes", label: "Exámenes", icon: "exam" },
  { href: "/repasar", label: "Repasar", icon: "refresh" },
  { href: "/tarjetas", label: "Tarjetas", icon: "cards" },
  { href: "/profesor", label: "Profesor", icon: "chat" },
];

export const NAV_SECONDARY: NavItem[] = [
  { href: "/plan", label: "Plan de estudio", icon: "calendar" },
  { href: "/guardados", label: "Guardados", icon: "bookmark" },
  { href: "/taller", label: "Taller", icon: "gear" },
  { href: "/estadisticas", label: "Estadísticas", icon: "chart" },
  { href: "/errores", label: "Mis errores", icon: "alert" },
  { href: "/logros", label: "Logros y misiones", icon: "trophy" },
  { href: "/formulas", label: "Fórmulas", icon: "formula" },
  { href: "/diccionario", label: "Diccionario", icon: "sigma" },
  { href: "/perfil", label: "Perfil", icon: "user" },
  { href: "/configuracion", label: "Configuración", icon: "settings" },
];

export const NAV_MOBILE: NavItem[] = [
  { href: "/", label: "Inicio", icon: "home" },
  { href: "/camino", label: "Camino", icon: "path" },
  { href: "/practicar", label: "Practicar", icon: "target" },
  { href: "/repasar", label: "Repasar", icon: "refresh" },
];

export function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
