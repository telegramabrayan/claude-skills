/**
 * Guardado en la nube: cuando la app se abre como Artifact de claude.ai, el
 * progreso se copia a la base privada de quien la usa (`data/users/<id>/…`),
 * así no se pierde al cambiar de navegador o de dispositivo. Fuera de
 * claude.ai (o sin permiso) todo sigue funcionando solo con el navegador.
 *
 * Gana la copia más reciente (`savedAt`). Se escribe como mucho una vez cada
 * pocos segundos, una escritura a la vez, y al salir de la pestaña.
 */
import { hydrate, type ProgressState } from "@/engine/progress/state";

type DocSnap = { exists: boolean; data(): Record<string, unknown> | undefined };
type DocRef = { get(): Promise<DocSnap>; set(d: Record<string, unknown>): Promise<void> };
type DB = { doc(path: string): DocRef };
type User = { id(): Promise<string | null> };
type ClaudeLike = { use?: (n: string) => Promise<unknown> };

export type CloudStatus = "off" | "connecting" | "synced" | "saving" | "error" | "full";

const MAX_BYTES = 240_000; // límite del documento: 256 KiB
const DEBOUNCE_MS = 4000;

let ref: DocRef | null = null;
let status: CloudStatus = "off";
let lastSavedAt: string | null = null;
let lastError = "";
const listeners = new Set<() => void>();

function setStatus(s: CloudStatus, err = "") {
  status = s;
  lastError = err;
  listeners.forEach((l) => l());
}

export const cloud = {
  status: () => status,
  lastSavedAt: () => lastSavedAt,
  lastError: () => lastError,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};

// ───────── Serialización (comprimida si el navegador puede) ─────────

async function gzipB64(text: string): Promise<string | null> {
  if (typeof CompressionStream === "undefined") return null;
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"));
  const buf = new Uint8Array(await new Response(stream).arrayBuffer());
  let bin = "";
  for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return btoa(bin);
}

async function gunzipB64(b64: string): Promise<string> {
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  const stream = new Blob([buf]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Response(stream).text();
}

async function encode(state: ProgressState): Promise<Record<string, unknown> | null> {
  let s = state;
  // Si no entra, se recortan los intentos más viejos (el dominio por tema ya los resume).
  for (let keep = s.attempts.length; ; keep = Math.floor(keep / 2)) {
    if (keep < s.attempts.length) s = { ...state, attempts: state.attempts.slice(-keep) };
    const json = JSON.stringify(s);
    const z = await gzipB64(json);
    const body = z ? { z } : { json };
    if ((z ?? json).length <= MAX_BYTES) return body;
    if (keep === 0) return null;
  }
}

async function decode(d: Record<string, unknown>): Promise<ProgressState | null> {
  try {
    const text = typeof d.z === "string" ? await gunzipB64(d.z) : typeof d.json === "string" ? d.json : null;
    return text ? hydrate(JSON.parse(text)) : null;
  } catch {
    return null;
  }
}

// ───────── Conexión ─────────

/**
 * Conecta con la base de claude.ai. Devuelve la copia de la nube si existe,
 * con su fecha de guardado, o null si no hay nube o está vacía.
 */
export async function connectCloud(): Promise<{ state: ProgressState; savedAt: string } | null> {
  const c = (globalThis as unknown as { claude?: ClaudeLike }).claude;
  if (!c?.use) return null;
  setStatus("connecting");
  try {
    const [db, user] = (await Promise.all([c.use("db"), c.use("user")])) as [DB | null, User | null];
    const uid = db && user ? await user.id() : null;
    if (!db || !uid) {
      setStatus("off");
      return null;
    }
    ref = db.doc(`data/users/${uid}/ingenia`);
    const remote = await fetchRemote();
    setStatus("synced");
    return remote;
  } catch (e) {
    ref = null;
    setStatus("off", errText(e));
    return null;
  }
}

/** Lee la copia de la nube (para cuando volvés a la pestaña desde otro dispositivo). */
export async function fetchRemote(): Promise<{ state: ProgressState; savedAt: string } | null> {
  if (!ref) return null;
  const snap = await ref.get();
  const d = snap.exists ? snap.data() : undefined;
  if (!d || typeof d.savedAt !== "string") return null;
  const state = await decode(d);
  if (!state) return null;
  lastSavedAt = d.savedAt;
  return { state, savedAt: d.savedAt };
}

// ───────── Guardado ─────────

let timer: ReturnType<typeof setTimeout> | null = null;
let pending: { state: ProgressState; savedAt: string } | null = null;
let writing: Promise<void> | null = null;

/** Programa un guardado en la nube (agrupa los cambios de unos segundos). */
export function queueCloudSave(state: ProgressState, savedAt: string) {
  if (!ref) return;
  pending = { state, savedAt };
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => void flushCloud(), DEBOUNCE_MS);
}

/** Guarda ya lo pendiente (al salir de la pestaña). */
export async function flushCloud(): Promise<void> {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (!ref || !pending) return;
  if (writing) {
    await writing; // una escritura a la vez
    if (!pending) return;
  }
  const job = pending;
  pending = null;
  writing = (async () => {
    setStatus("saving");
    try {
      const body = await encode(job.state);
      if (!body) {
        setStatus("full", "El progreso es demasiado grande para guardarlo en la nube.");
        return;
      }
      await ref!.set({ v: 1, savedAt: job.savedAt, ...body });
      lastSavedAt = job.savedAt;
      setStatus("synced");
    } catch (e) {
      const code = (e as { code?: string })?.code;
      if (code === "unavailable" && !pending) pending = job; // se reintenta en el próximo cambio o al salir
      setStatus(code === "quota_exceeded" ? "full" : "error", errText(e));
    }
  })();
  await writing;
  writing = null;
}

function errText(e: unknown): string {
  const x = e as { code?: string; message?: string };
  return x?.message || x?.code || "";
}
