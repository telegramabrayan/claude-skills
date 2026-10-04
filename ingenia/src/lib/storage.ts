/**
 * Persistencia del progreso detrás de una interfaz: hoy localStorage,
 * mañana un repositorio remoto (Supabase/PostgreSQL) que implemente lo mismo.
 */
import { hydrate, type ProgressState } from "@/engine/progress/state";

export interface ProgressRepository {
  load(): Promise<ProgressState | null>;
  save(state: ProgressState): Promise<void>;
  clear(): Promise<void>;
}

const KEY = "ingenia:progress:v1";
export const THEME_KEY = "ingenia:theme";

export class LocalStorageRepository implements ProgressRepository {
  async load(): Promise<ProgressState | null> {
    try {
      const raw = window.localStorage.getItem(KEY);
      return raw ? hydrate(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  }

  async save(state: ProgressState): Promise<void> {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
      window.localStorage.setItem(THEME_KEY, state.settings.theme);
    } catch {
      /* almacenamiento lleno o bloqueado: el progreso sigue en memoria */
    }
  }

  async clear(): Promise<void> {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignorar */
    }
  }
}

export const repository: ProgressRepository = new LocalStorageRepository();

export function exportJson(state: ProgressState): string {
  return JSON.stringify(state, null, 2);
}

export function importJson(text: string): ProgressState {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== "object" || !("profile" in parsed)) throw new Error("El archivo no parece un respaldo de Ingenia.");
  return hydrate(parsed);
}
