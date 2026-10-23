/**
 * Tutor con IA. Dentro de claude.ai el artifact puede consultar a Claude
 * (capacidad `sample`, con el consentimiento del estudiante y su propia
 * cuenta). Fuera de claude.ai no hay IA: la app usa el tutor local con el
 * contenido curado. Nunca se llama a la IA sin una acción explícita.
 */
import { examTopics } from "./ipcMission";
import { daysLeft, globalReadiness, parcialReadiness, recentErrors, topicReadiness } from "./fisicaMission";
import type { ProgressState } from "@/engine/progress/state";
import { recurringErrors } from "@/engine/progress/rules";
import { ERROR_LABELS, getTopic } from "@/content/topics";
import { findUnit, getSubject } from "@/content/curriculum";
import { getLesson } from "@/content/lessons";
import type { StudyContext } from "./studyContext";

type SampleFn = ((input: string | { role: "user" | "assistant"; content: string }[], opts?: Record<string, unknown>) => Promise<{ text: string; truncated: boolean }>) & {
  json?: unknown;
};

let samplePromise: Promise<SampleFn | null> | null = null;

/** Resuelve la función de IA o null (fuera de claude.ai, o sin permiso). */
export function getSample(): Promise<SampleFn | null> {
  if (samplePromise) return samplePromise;
  samplePromise = (async () => {
    try {
      const c = (globalThis as unknown as { claude?: { use?: (n: string) => Promise<unknown> } }).claude;
      if (!c?.use) return null;
      const s = await c.use("sample");
      return typeof s === "function" ? (s as SampleFn) : null;
    } catch {
      return null;
    }
  })();
  // Si no se pudo, se vuelve a intentar la próxima vez (permiso recién dado, conexión lenta).
  const p = samplePromise;
  void p.then((s) => {
    if (!s && samplePromise === p) samplePromise = null;
  });
  return p;
}

/** Link del Artifact: desde ahí el profesor con IA y el guardado en la nube funcionan. */
export const ARTIFACT_URL = "https://claude.ai/artifact/CmCweve6PC39qtQaeDAZGu";

export type AiAvailability = "outside" | "prompt" | "denied" | "unavailable" | "granted";

type Perms = { state(n: string): Promise<string>; request(n?: readonly string[]): Promise<Record<string, string>>; manage(): Promise<void> };

async function perms(): Promise<Perms | null> {
  const c = (globalThis as unknown as { claude?: { use?: (n: string) => Promise<unknown> } }).claude;
  if (!c?.use) return null;
  try {
    return (await c.use("permissions")) as Perms | null;
  } catch {
    return null;
  }
}

/** Por qué el profesor con IA no responde (o si se puede activar). */
export async function aiAvailability(): Promise<AiAvailability> {
  const c = (globalThis as unknown as { claude?: { use?: unknown } }).claude;
  let framed = false;
  try {
    framed = window.self !== window.top;
  } catch {
    framed = true;
  }
  if (!c?.use || !framed) return "outside";
  const p = await perms();
  if (!p) return "unavailable";
  try {
    const st = await p.state("sample");
    return st === "granted" || st === "prompt" || st === "denied" ? st : "unavailable";
  } catch {
    return "unavailable";
  }
}

/** Pide el permiso del profesor (un solo diálogo). */
export async function requestAi(): Promise<AiAvailability> {
  const p = await perms();
  if (!p) return "unavailable";
  const r = await p.request(["sample"]).catch(() => ({}) as Record<string, string>);
  const st = r.sample;
  return st === "granted" || st === "prompt" || st === "denied" ? st : "unavailable";
}

/** Abre el panel de permisos de claude.ai. false si no se pudo abrir. */
export async function managePermissions(): Promise<boolean> {
  const p = await perms();
  if (!p) return false;
  try {
    await p.manage();
    return true;
  } catch {
    return false;
  }
}

export type AiError = { code: string; message?: string; text?: string };

export function aiErrorMessage(e: AiError): string {
  switch (e.code) {
    case "not_granted":
    case "sampling_disabled":
    case "not_declared":
    case "capability_disabled":
    case "capability_removed":
      return "El profesor con IA no está habilitado en esta vista. Seguí con las explicaciones de la lección.";
    case "rate_limited":
      return "Hubo muchas consultas seguidas. Esperá un momento y volvé a preguntar.";
    case "session_expired":
      return "Tu sesión de Claude venció: volvé a iniciar sesión.";
    case "refused":
      return "No pude responder eso. Probá preguntarlo de otra forma.";
    case "cancelled":
      return "";
    default:
      return "Se cortó la conexión. Probá de nuevo.";
  }
}

/** Instrucciones fijas del profesor. */
export const TUTOR_RULES = `Sos el profesor particular de Ingenia, una plataforma para preparar materias del CBC de la UBA (Ingeniería).
El estudiante terminó la secundaria hace tiempo: no asumas conocimientos previos, pero no lo trates como a un chico.
Reglas:
- Español rioplatense, claro y cálido. Frases cortas. Bloques breves separados por una línea en blanco.
- El objetivo es que ENTIENDA el porqué, no darle la respuesta. Si está resolviendo un ejercicio, guialo con una pregunta o una pista antes de resolverlo, salvo que pida explícitamente la solución.
- Si dice que no entendió, NO repitas la misma explicación: cambiá de estrategia (más simple, una analogía cotidiana, un ejemplo numérico chico, un dibujo descripto paso a paso, o descomponer en conocimientos previos y preguntarle cuál le cuesta).
- Matemática: escribí las expresiones entre signos $ ... $ (por ejemplo $2x + 5 = 15$). Usá ^ para potencias, sqrt() para raíces, \\frac{a}{b} para fracciones. Nada de LaTeX complejo.
- Procedimientos: un paso por renglón y explicá qué operación hacés y por qué.
- Si detectás un error en lo que hizo, señalá exactamente en qué paso empieza y por qué.
- No inventes datos sobre la UBA (fechas, programas, correlatividades). Si no sabés, decilo.
- Respuestas de hasta ~180 palabras salvo que pida más.`;

/** Resumen del contexto de estudio en texto, para que el profesor sepa de qué se habla. */
export function describeContext(s: ProgressState, c: StudyContext): string {
  const lines: string[] = [];
  const topic = c.topicId ? getTopic(c.topicId) : c.exercise ? getTopic(c.exercise.topicId) : undefined;
  const lesson = c.lessonId ? getLesson(c.lessonId) : topic?.lessonId ? getLesson(topic.lessonId) : undefined;
  const unit = c.unitId ? findUnit(c.unitId) : undefined;
  const subject = c.subjectId ? getSubject(c.subjectId) : unit?.subject ?? (lesson ? getSubject(lesson.subjectId) : undefined);
  if (subject) lines.push(`Materia: ${subject.name}`);
  if (unit) lines.push(`Unidad: ${unit.unit.title}`);
  if (topic) lines.push(`Tema: ${topic.name}`);
  if (lesson) lines.push(`Lección: ${lesson.title}`);
  if (c.reading) lines.push(`Lo que está leyendo ahora («${c.reading.title}»):\n${c.reading.text.slice(0, 1500)}`);
  if (c.exercise) {
    const e = c.exercise;
    lines.push(`Ejercicio en pantalla: ${e.prompt}`);
    if (e.kind === "choice") lines.push(`Opciones: ${e.options.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join(" | ")}`);
    if (e.kind === "trace") lines.push(`Código:\n${e.code}`);
    if (c.answer) lines.push(`Respuesta del estudiante: ${c.answer}`);
    if (c.result) {
      lines.push(`Corrección: ${c.result.correct ? "correcta" : "incorrecta"}. ${c.result.message}${c.result.diagnosis ? " " + c.result.diagnosis : ""}`);
      if (c.result.errorType) lines.push(`Tipo de error detectado: ${ERROR_LABELS[c.result.errorType]}`);
    }
    lines.push(`(Solución de referencia, NO se la des sin que la pida: ${e.solution.join(" → ")})`);
  }
  const recent = s.attempts.slice(-12);
  if (recent.length) {
    lines.push(
      `Últimos ejercicios: ${recent
        .map((a) => `${getTopic(a.topicId)?.name ?? a.topicId}: ${a.correct ? "bien" : `mal${a.errorType ? ` (${ERROR_LABELS[a.errorType]})` : ""}`}`)
        .join("; ")}`,
    );
  }
  const strong = Object.entries(s.topics)
    .filter(([, t]) => t.attempts >= 3 && t.mastery >= 0.75)
    .map(([id]) => getTopic(id)?.name)
    .filter(Boolean);
  const weak = Object.entries(s.topics)
    .filter(([, t]) => t.attempts >= 2 && t.mastery < 0.45)
    .map(([id]) => getTopic(id)?.name)
    .filter(Boolean);
  // Misión Física: el estudiante prepara el parcial del 5/11.
  if (subject?.id === "ipc" || (typeof location !== "undefined" && /[#/]ipc/.test(location.href))) {
    const left = s.ipc.examAt ? Math.round((s.ipc.examAt - Date.now()) / 60000) : null;
    const weak = examTopics(s.ipc.parcial)
      .map((t) => ({ t, v: topicReadiness(s, t.topicId).value }))
      .filter((x) => x.v === null || x.v < 0.5)
      .map((x) => x.t.short)
      .slice(0, 5);
    const qerr = (s.ipc.qlog ?? []).filter((x) => !x.ok).slice(-5).map((x) => x.id);
    lines.push(
      `MODO EMERGENCIA IPC: rinde el ${s.ipc.parcial === "1P" ? "1.er" : "2.º"} parcial de IPC (040, UBA XXI, Cátedra A, programa 2026; bibliografía «Desenredando la ciencia»)${left !== null ? ` en ${left} minutos` : ""}. Formato del 1.er parcial según las claves cargadas: 10 preguntas de opción múltiple, 1 punto cada una, sin puntaje parcial. Temas flojos o sin datos: ${weak.join(", ") || "ninguno"}.${qerr.length ? ` Preguntas que falló hace poco: ${qerr.join(", ")}.` : ""}` +
        " Respondé MUY corto (es el día del examen): primero la idea en una frase, después un ejemplo cotidiano si hace falta, y cómo aparecería en una pregunta de opción múltiple. Si pregunta por qué una opción está mal, explicá esa opción concreta (está en «Lo que está leyendo»). Usá solo autores y conceptos del programa (Darwin, Lamarck, Lyell, Cuvier, Malthus; positivismo lógico, Popper, Hempel, Kuhn, epistemología feminista, ética y políticas científicas). No inventes preguntas «reales» de examen ni probabilidades de aprobar.",
    );
  }
  if (subject?.id === "fisica" || (typeof document !== "undefined" && document.documentElement.dataset.subject === "physics")) {
    const left = daysLeft();
    const errs = recentErrors(s).slice(0, 4);
    lines.push(
      `MISIÓN FÍSICA: rinde el 2.º parcial de Física el 5/11/2026 y el 1.er parcial al día siguiente, el 6/11 (faltan ${left} días para el primero de los dos). Cátedra Torti (UBA XXI): g = 9,80 m/s², 3 cifras significativas, unidades SI. Preparación actual ${Math.round(globalReadiness(s) * 100)} % (1.er parcial ${Math.round(parcialReadiness(s, "1P").value * 100)} %, 2.º ${Math.round(parcialReadiness(s, "2P").value * 100)} %).` +
        (errs.length ? ` Errores recientes: ${errs.map((e) => `${getTopic(e.topicId)?.name ?? e.topicId}${e.errorType ? ` (${ERROR_LABELS[e.errorType as keyof typeof ERROR_LABELS] ?? e.errorType})` : ""} ×${e.count}`).join("; ")}.` : "") +
        " Enseñá con el método de 6 pasos (leer, datos, dibujo, qué piden, relaciones, resolver y verificar unidades), explicá el porqué de los signos y ayudalo a reconocer qué fórmula usar. No inventes probabilidades de aprobar.",
    );
  }
  if (strong.length) lines.push(`Domina: ${strong.slice(0, 8).join(", ")}`);
  if (weak.length) lines.push(`Le cuesta: ${weak.slice(0, 8).join(", ")}`);
  const rec = recurringErrors(s).slice(0, 3);
  if (rec.length) lines.push(`Errores que repite: ${rec.map((e) => ERROR_LABELS[e]).join(", ")}`);
  if (s.settings.fromZero) lines.push("Modo «Enseñame desde cero» activado: explicá desde los fundamentos.");
  return lines.join("\n");
}
