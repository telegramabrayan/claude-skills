/**
 * Router mínimo por hash (#/mapa?tema=x) que reemplaza a next/navigation en la
 * versión de un solo archivo. Si el entorno no permite escribir el hash, sigue
 * funcionando en memoria.
 */
import { useMemo, useSyncExternalStore } from "react";

interface Loc {
  path: string;
  query: string;
}

function parse(hash: string): Loc {
  const raw = decodeURIComponent(hash.replace(/^#/, "")) || "/";
  const noAnchor = raw.split("#")[0] || "/";
  const [path, query = ""] = noAnchor.split("?");
  return { path: path.startsWith("/") ? path : `/${path}`, query };
}

let current: Loc = typeof window === "undefined" ? { path: "/", query: "" } : parse(window.location.hash);
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

if (typeof window !== "undefined") {
  window.addEventListener("hashchange", () => {
    const next = parse(window.location.hash);
    if (next.path !== current.path || next.query !== current.query) {
      current = next;
      emit();
    }
  });
}

export function navigate(href: string, replace = false) {
  current = parse(`#${href}`);
  try {
    if (replace) window.history.replaceState(null, "", `#${href}`);
    else window.location.hash = href;
  } catch {
    /* entorno sin acceso al hash: navegación en memoria */
  }
  emit();
  try {
    window.scrollTo(0, 0);
  } catch {
    /* ignorar */
  }
}

export function useLocation(): Loc {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    () => current,
    () => current,
  );
}

export function usePathname(): string {
  return useLocation().path;
}

export function useSearchParams(): URLSearchParams {
  const { query } = useLocation();
  return useMemo(() => new URLSearchParams(query), [query]);
}

export function useRouter() {
  return {
    push: (href: string) => navigate(href),
    replace: (href: string) => navigate(href, true),
    back: () => window.history.back(),
  };
}

export function notFound(): never {
  throw new Error("not found");
}
