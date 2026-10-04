"use client";
import { useEffect, useMemo, useState } from "react";
import { run } from "@/engine/code/interpreter";
import { Icon } from "../ui/Icon";

/** Ejecuta un programa y permite recorrerlo paso a paso viendo cómo cambian las variables. */
export function CodeStepper({ code, autoStart = false, onRun }: { code: string; autoStart?: boolean; onRun?: (ok: boolean) => void }) {
  const result = useMemo(() => run(code), [code]);
  const [step, setStep] = useState(autoStart ? 0 : -1);
  const [playing, setPlaying] = useState(false);
  const total = result.steps.length;

  useEffect(() => {
    setStep(autoStart ? 0 : -1);
    setPlaying(false);
  }, [code, autoStart]);

  useEffect(() => {
    onRun?.(result.ok);
    // solo cuando cambia el resultado
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  useEffect(() => {
    if (!playing) return;
    if (step >= total - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), 650);
    return () => clearTimeout(t);
  }, [playing, step, total]);

  const current = step >= 0 ? result.steps[step] : undefined;
  const lines = code.split("\n");
  const finished = step === total - 1;
  const showError = result.error && (finished || total === 0);

  return (
    <div className="grid gap-3 md:grid-cols-[1.4fr_1fr]">
      <div className="overflow-hidden rounded-xl border border-line bg-surface-2">
        <pre className="overflow-x-auto py-2 font-mono text-sm leading-6" aria-label="Código">
          {lines.map((l, i) => {
            const active = current?.line === i + 1;
            const errLine = showError && result.error?.line === i + 1;
            return (
              <div key={i} className={`flex px-2 ${active ? "bg-primary-soft" : ""} ${errLine ? "bg-danger-soft" : ""}`} aria-current={active ? "step" : undefined}>
                <span className="mr-3 w-6 shrink-0 select-none text-right text-muted">{i + 1}</span>
                <span className="whitespace-pre">{l || " "}</span>
                {active && <span className="ml-auto pl-2 text-primary">◀</span>}
              </div>
            );
          })}
        </pre>
        <div className="flex flex-wrap items-center gap-1 border-t border-line p-2">
          <button className="btn btn-ghost !min-h-9 !px-2" onClick={() => { setPlaying(false); setStep(-1); }} aria-label="Reiniciar">⏮</button>
          <button className="btn btn-ghost !min-h-9 !px-2" onClick={() => { setPlaying(false); setStep((s) => Math.max(-1, s - 1)); }} disabled={step < 0} aria-label="Paso anterior">◀</button>
          <button className="btn btn-secondary !min-h-9" onClick={() => { setPlaying(false); setStep((s) => Math.min(total - 1, s + 1)); }} disabled={finished || total === 0}>
            Paso {Math.max(0, step + 1)}/{total}
          </button>
          <button className="btn btn-ghost !min-h-9 !px-2" onClick={() => { setPlaying(false); setStep((s) => Math.min(total - 1, s + 1)); }} disabled={finished || total === 0} aria-label="Paso siguiente">▶</button>
          <button className="btn btn-ghost !min-h-9 !px-2" onClick={() => setPlaying((p) => !p)} disabled={total === 0} aria-label={playing ? "Pausar" : "Reproducir"}>
            {playing ? "⏸" : <Icon name="play" size={16} />}
          </button>
          <button className="btn btn-ghost !min-h-9 !px-2" onClick={() => { setPlaying(false); setStep(total - 1); }} disabled={total === 0} aria-label="Ir al final">⏭</button>
        </div>
      </div>
      <div className="space-y-3">
        <div className="rounded-xl border border-line p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Variables {current && current.scope !== "global" ? `(dentro de ${current.scope})` : ""}
          </div>
          {current && Object.keys(current.vars).length > 0 ? (
            <table className="w-full font-mono text-sm">
              <tbody>
                {Object.entries(current.vars).map(([k, v]) => {
                  const changed = current.changed.includes(k);
                  return (
                    <tr key={k} className={changed ? "anim-pop" : ""}>
                      <td className="py-0.5 pr-2 font-semibold">{k}</td>
                      <td className="py-0.5 text-muted">→</td>
                      <td className={`py-0.5 pl-2 ${changed ? "font-bold text-primary" : ""}`}>{v}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-muted">{step < 0 ? "Tocá «Paso» para empezar." : "Todavía no hay variables."}</p>
          )}
        </div>
        <div className="rounded-xl border border-line p-3">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Salida (print)</div>
          <pre className="min-h-6 whitespace-pre-wrap font-mono text-sm">{current?.output.join("\n") || " "}</pre>
        </div>
        {showError && result.error && (
          <div className="rounded-xl bg-danger-soft p-3 text-sm" role="alert">
            <strong>{result.error.kind === "sintaxis" ? "Error de sintaxis" : "Error de ejecución"} en la línea {result.error.line}:</strong> {result.error.message}
          </div>
        )}
      </div>
    </div>
  );
}
