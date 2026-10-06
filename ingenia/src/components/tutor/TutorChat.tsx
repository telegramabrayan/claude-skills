"use client";
/**
 * El profesor, siempre a mano: un panel lateral que sabe qué estás
 * estudiando (lección, pantalla, ejercicio, tu respuesta y tus errores
 * recientes). Dentro de claude.ai responde con IA; fuera, con el contenido
 * curado de la plataforma.
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { store } from "@/lib/store";
import { aiErrorMessage, describeContext, getSample, TUTOR_RULES, type AiError } from "@/lib/ai";
import { getStudyContext, onOpenTutor, subscribeStudyContext } from "@/lib/studyContext";
import { localTutor, type TutorAnswer } from "@/lib/tutor";
import { getTopic } from "@/content/topics";
import { MathText } from "../math/MathText";
import { Nodo } from "../guide/Nodo";
import { Icon } from "../ui/Icon";

interface Turn {
  role: "user" | "assistant";
  content: string;
}

const QUICK = ["No entendí", "¿Por qué se hace esto?", "Dame una pista", "Explicámelo desde cero", "Dame otro ejemplo", "¿Qué necesito saber antes?"];

export function TutorChat() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ai, setAi] = useState<"unknown" | "yes" | "no">("unknown");
  const [local, setLocal] = useState<TutorAnswer | null>(null);
  const [ctxLabel, setCtxLabel] = useState("");
  const ctl = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    getSample().then((s) => alive && setAi(s ? "yes" : "no"));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const upd = () => {
      const c = getStudyContext();
      const t = c.exercise ? getTopic(c.exercise.topicId) : c.topicId ? getTopic(c.topicId) : undefined;
      setCtxLabel(c.exercise ? `Ejercicio de ${t?.name ?? "práctica"}` : c.reading ? c.reading.title : t?.name ?? "");
    };
    upd();
    return subscribeStudyContext(upd);
  }, []);

  useEffect(
    () =>
      onOpenTutor((q) => {
        setOpen(true);
        if (q) void ask(q);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [turns, ai],
  );

  useEffect(() => endRef.current?.scrollIntoView({ block: "end" }), [turns, streaming, local]);

  async function ask(q: string) {
    const question = q.trim();
    if (!question || streaming !== null) return;
    setInput("");
    setError(null);
    const sample = await getSample();
    if (!sample) {
      setAi("no");
      setTurns((t) => [...t, { role: "user", content: question }]);
      setLocal(await localTutor.ask(question));
      return;
    }
    const context = describeContext(store.getState(), getStudyContext());
    const history = [...turns, { role: "user" as const, content: question }].slice(-10);
    const first = `${TUTOR_RULES}\n\nCONTEXTO ACTUAL DEL ESTUDIANTE (usalo para entender a qué se refiere sin pedirle que lo repita):\n${context || "(todavía no abrió ninguna lección ni ejercicio)"}`;
    const input: Turn[] = [{ role: "user", content: first }, ...history];
    setTurns(history);
    setStreaming("");
    ctl.current = new AbortController();
    try {
      const { text } = await sample(input, { cache: false, signal: ctl.current.signal, onText: ({ text }: { text: string }) => setStreaming(text) });
      setTurns((t) => [...t, { role: "assistant", content: text }]);
    } catch (e) {
      const err = e as AiError;
      if (err.text) setTurns((t) => [...t, { role: "assistant", content: err.text + " …" }]);
      const msg = aiErrorMessage(err);
      if (msg) setError(msg);
      if (["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"].includes(err.code)) setAi("no");
    } finally {
      setStreaming(null);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-primary py-2 pl-2 pr-4 font-bold text-on-primary shadow-lg transition hover:scale-105 lg:bottom-6"
        aria-label="Preguntarle al profesor"
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-surface/90">
          <Nodo size={30} bob={false} />
        </span>
        <span className="hidden sm:inline">Profesor</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Profesor">
          <button className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} aria-label="Cerrar profesor" />
          <div className="anim-pop relative flex h-full w-full max-w-md flex-col bg-surface shadow-2xl">
            <div className="flex items-center gap-3 border-b border-line p-3">
              <Nodo size={40} mood="happy" />
              <div className="min-w-0 flex-1">
                <p className="font-black">Profesor</p>
                <p className="truncate text-xs text-muted">{ctxLabel ? `Sé que estás en: ${ctxLabel}` : "Preguntame lo que quieras"}</p>
              </div>
              {turns.length > 0 && (
                <button
                  className="btn btn-ghost !min-h-9 !px-2 text-xs"
                  onClick={() => {
                    ctl.current?.abort();
                    setTurns([]);
                    setLocal(null);
                    setError(null);
                  }}
                >
                  Nueva charla
                </button>
              )}
              <button className="btn btn-ghost !px-2" onClick={() => setOpen(false)} aria-label="Cerrar">
                <Icon name="x" />
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {turns.length === 0 && (
                <div className="space-y-3 text-sm">
                  <p>
                    Preguntame sobre lo que estás viendo, sin repetir el enunciado: ya sé {ctxLabel ? <b>{ctxLabel.toLowerCase()}</b> : "qué estás estudiando"} y cómo te viene yendo.
                  </p>
                  {ai === "no" && (
                    <p className="rounded-xl bg-surface-2 p-3 text-muted">
                      En esta vista el profesor responde con el contenido de la plataforma. Abriendo Ingenia dentro de claude.ai, responde con IA y conversa con vos.
                    </p>
                  )}
                </div>
              )}
              {turns.map((t, i) => (
                <div key={i} className={t.role === "user" ? "ml-8 rounded-2xl rounded-br-sm bg-primary-soft p-3" : "mr-4 rounded-2xl rounded-bl-sm border border-line p-3"}>
                  <MathText text={t.content} />
                </div>
              ))}
              {streaming !== null && (
                <div className="mr-4 rounded-2xl rounded-bl-sm border border-line p-3">
                  {streaming ? <MathText text={streaming} /> : <p className="animate-pulse text-sm text-muted">Pensando…</p>}
                </div>
              )}
              {local && (
                <div className="mr-4 space-y-2 rounded-2xl border border-line p-3 text-sm">
                  <p>{local.intro}</p>
                  {local.results.map((r) => (
                    <Link key={r.href + r.title} href={r.href} className="block rounded-lg bg-surface-2 p-2 hover:bg-primary-soft" onClick={() => setOpen(false)}>
                      <b>{r.title}</b>
                      <span className="block text-xs text-muted">{r.path}</span>
                    </Link>
                  ))}
                </div>
              )}
              {error && <p className="rounded-xl bg-warn-soft p-3 text-sm">{error}</p>}
              <div ref={endRef} />
            </div>
            <div className="border-t border-line p-3">
              <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
                {QUICK.map((q) => (
                  <button key={q} className="chip shrink-0 !py-1.5 hover:!bg-primary-soft" onClick={() => ask(q)} disabled={streaming !== null}>
                    {q}
                  </button>
                ))}
              </div>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  void ask(input);
                }}
              >
                <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ej.: ¿por qué acá da infinito?" aria-label="Tu pregunta" />
                {streaming !== null ? (
                  <button type="button" className="btn btn-secondary shrink-0" onClick={() => ctl.current?.abort()}>
                    Parar
                  </button>
                ) : (
                  <button className="btn btn-primary shrink-0" disabled={!input.trim()}>
                    Enviar
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
