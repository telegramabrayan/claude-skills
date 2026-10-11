"use client";
/**
 * «Resolver conmigo»: no se muestra la solución. Te pregunta, en orden,
 * qué datos hay (y cuáles sobran), qué piden, qué modelo físico es, qué
 * relación usar, y recién después resolvés. La ayuda visual (datos
 * resaltados) se va quitando a medida que lo hacés más veces.
 */
import { useMemo, useState } from "react";
import { makeScenario, SCENARIO_KINDS, type FisScenario } from "@/engine/generators/fisica-mision";
import { newSeed } from "@/engine/generators/rng";
import { actions, store, useProgress } from "@/lib/store";
import { topicReadiness, practiceLevel } from "@/lib/fisicaMission";
import { MathText } from "../math/MathText";
import { Whiteboard } from "../board/Whiteboard";
import { GuideSay } from "../guide/Nodo";
import { subjectStyle } from "../ui/SubjectArt";
import { BackToMission } from "./ui";
import { SOLVE_METHOD } from "@/content/fisica/formulas";

type Step = "datos" | "pide" | "modelo" | "formula" | "resolver" | "verificar";
const STEPS: Step[] = ["datos", "pide", "modelo", "formula", "resolver", "verificar"];
const FIS = subjectStyle("fisica");

function parseNum(s: string): number {
  return Number(s.replace(/\s/g, "").replace(",", ".").replace("−", "-"));
}

export function ResolveWithMe({ kind: k0 }: { kind?: string }) {
  const s = useProgress();
  const [kind, setKind] = useState<string>(() => k0 && SCENARIO_KINDS.some((x) => x.kind === k0) ? k0 : SCENARIO_KINDS[Math.floor(Math.random() * SCENARIO_KINDS.length)].kind);
  const [seed, setSeed] = useState(() => newSeed());
  const meta = SCENARIO_KINDS.find((x) => x.kind === kind)!;
  const diff = Math.min(6, practiceLevel(topicReadiness(store.getState(), meta.topicId).value) + 1) as 1 | 2 | 3 | 4 | 5 | 6;
  const sc: FisScenario = useMemo(() => makeScenario(kind, seed, diff), [kind, seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const scaffold = s.fisica.guided < 4; // las primeras veces, los números del enunciado se resaltan
  const [step, setStep] = useState<Step>("datos");
  const [picked, setPicked] = useState<number[]>([]);
  const [choice, setChoice] = useState<number | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [tries, setTries] = useState(0);
  const idx = STEPS.indexOf(step);

  const reset = (nk = kind) => {
    setKind(nk);
    setSeed(newSeed());
    setStep("datos");
    setPicked([]);
    setChoice(null);
    setAnswer("");
    setFeedback(null);
    setTries(0);
  };
  const advance = () => {
    setFeedback(null);
    setChoice(null);
    setTries(0);
    const n = STEPS[idx + 1];
    if (n) setStep(n);
  };

  const checkDatos = () => {
    const relevant = sc.datos.map((d, i) => (d.relevante ? i : -1)).filter((i) => i >= 0);
    const missing = relevant.filter((i) => !picked.includes(i));
    const extra = picked.filter((i) => !sc.datos[i].relevante);
    if (!missing.length && !extra.length) setFeedback({ ok: true, text: "Exacto: esos son los datos que se usan." + (sc.datos.some((d) => !d.relevante) ? " Lo demás sobra (en los parciales siempre hay datos de más)." : "") });
    else setFeedback({ ok: false, text: `${missing.length ? `Te falta ${missing.length === 1 ? "un dato" : `${missing.length} datos`}. ` : ""}${extra.length ? `${extra.map((i) => sc.datos[i].label).join(", ")} no se usa para lo que piden.` : ""}` });
    setTries((t) => t + 1);
  };
  const checkChoice = (q: { options: string[]; answer: number; why?: string }) => {
    if (choice === null) return;
    const ok = choice === q.answer;
    setFeedback({ ok, text: ok ? q.why ?? "¡Bien!" : `No es esa. ${tries >= 1 ? `Es «${q.options[q.answer]}». ${q.why ?? ""}` : "Releé el enunciado: ¿qué condición describe el movimiento o la situación?"}` });
    setTries((t) => t + 1);
  };
  const checkAnswer = () => {
    const v = parseNum(answer);
    const ok = Number.isFinite(v) && Math.abs(v - sc.respuesta) <= sc.tolerance;
    setFeedback({ ok, text: ok ? `¡Correcto! ${sc.respuesta.toLocaleString("es-AR", { maximumSignificantDigits: 3 })} ${sc.unidad}.` : Number.isFinite(v) ? "No da. Revisá conversiones, signos y el despeje." : "Escribí un número (con coma o punto)." });
    setTries((t) => t + 1);
    if (ok) actions.updateFisica({ guided: s.fisica.guided + 1 });
  };

  const q = step === "pide" ? sc.pide : step === "modelo" ? sc.modelo : step === "formula" ? sc.formula : null;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <BackToMission />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-black">🪜 Resolver conmigo</h1>
        <select className="input !w-auto !min-h-10 text-sm" value={kind} onChange={(e) => reset(e.target.value)} aria-label="Tipo de problema">
          {SCENARIO_KINDS.map((x) => (
            <option key={x.kind} value={x.kind}>
              {x.title}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-1" aria-label={`Paso ${idx + 1} de ${STEPS.length}`}>
        {STEPS.map((x, k) => (
          <span key={x} className="h-2.5 flex-1 rounded-full" style={{ background: k <= idx ? "var(--c-physics)" : "var(--surface-2)" }} />
        ))}
      </div>
      <div className="q-card p-4 sm:p-5">
        <p className="mb-1 text-xs font-black uppercase text-muted">📘 Enunciado</p>
        <div className={`text-lg font-semibold ${scaffold ? "[&_.math]:rounded [&_.math]:bg-[color:var(--board-hl)]/60 [&_.math]:px-0.5" : ""}`}>
          <MathText text={sc.enunciado} />
        </div>
      </div>

      <div className="card space-y-3 p-4">
        <p className="text-xs font-black uppercase text-muted">
          Paso {idx + 1} · {SOLVE_METHOD[Math.min(idx + 1, SOLVE_METHOD.length - 1)]?.step}
        </p>
        {step === "datos" && (
          <>
            <GuideSay mood="thinking" size={40}>
              ¿Qué datos encontrás? Tocá los que <b>sirven</b> para resolver.
            </GuideSay>
            <div className="flex flex-wrap gap-2">
              {sc.datos.map((d, i) => (
                <button key={i} aria-pressed={picked.includes(i)} className="tile !min-h-11 !py-1 text-sm" onClick={() => setPicked(picked.includes(i) ? picked.filter((x) => x !== i) : [...picked, i])}>
                  <MathText text={`${d.label}: $${d.sym} = ${d.value}$`} block={false} />
                </button>
              ))}
            </div>
            {sc.conversion && feedback?.ok && <p className="rounded-xl bg-xp-soft/60 p-2 text-sm">🔁 Ojo con las unidades: <MathText text={sc.conversion} block={false} /></p>}
            {!feedback?.ok && (
              <button className="btn-3d is-block" disabled={!picked.length} onClick={checkDatos}>
                COMPROBAR DATOS
              </button>
            )}
          </>
        )}
        {q && (
          <>
            <GuideSay mood="thinking" size={40}>
              {step === "pide" ? "¿Qué nos están pidiendo?" : step === "modelo" ? "¿Qué tipo de situación o movimiento es?" : "¿Qué relación (fórmula) usarías?"}
            </GuideSay>
            <div className="grid gap-2" role="radiogroup">
              {q.options.map((o, i) => (
                <button key={i} role="radio" aria-checked={choice === i} disabled={!!feedback?.ok} className={`tile text-left ${feedback?.ok && i === q.answer ? "is-correct" : ""}`} onClick={() => { setChoice(i); setFeedback(null); }}>
                  <MathText text={o} block={false} />
                </button>
              ))}
            </div>
            {!feedback?.ok && (
              <button className="btn-3d is-block" disabled={choice === null} onClick={() => checkChoice(q)}>
                COMPROBAR
              </button>
            )}
          </>
        )}
        {step === "resolver" && (
          <>
            <GuideSay mood="encourage" size={40}>
              Ahora resolvé vos con la relación elegida. Respuesta en <b>{sc.unidad}</b>, con 3 cifras.
            </GuideSay>
            <div className="flex items-center gap-2">
              <input className="input !min-h-14 !rounded-2xl !border-2 font-mono !text-xl" value={answer} onChange={(e) => { setAnswer(e.target.value); setFeedback(null); }} onKeyDown={(e) => e.key === "Enter" && checkAnswer()} placeholder="Tu resultado" aria-label="Resultado" inputMode="decimal" />
              <span className="font-bold text-muted">{sc.unidad}</span>
            </div>
            {!feedback?.ok && (
              <button className="btn-3d is-block" disabled={!answer.trim()} onClick={checkAnswer}>
                COMPROBAR
              </button>
            )}
            {(tries >= 2 || feedback?.ok) && <Whiteboard steps={sc.pasos.map((x) => ({ expr: x }))} title={feedback?.ok ? "Procedimiento recomendado" : "Resolvámoslo juntos"} />}
          </>
        )}
        {step === "verificar" && (
          <>
            <GuideSay mood="happy" size={40}>
              Último paso: ¿el resultado tiene sentido?
            </GuideSay>
            <p className="rounded-xl bg-surface-2 p-3 text-sm">
              <MathText text={sc.verificacion} />
            </p>
            <div className="flex flex-wrap gap-2">
              <button className="btn-3d is-subject" style={FIS} onClick={() => reset()}>
                OTRO PROBLEMA
              </button>
              <button className="btn-3d is-secondary" onClick={() => reset(SCENARIO_KINDS[(SCENARIO_KINDS.findIndex((x) => x.kind === kind) + 1) % SCENARIO_KINDS.length].kind)}>
                OTRO TIPO
              </button>
            </div>
          </>
        )}
        {feedback && (
          <div className={`feedback anim-rise ${feedback.ok ? "is-ok" : "is-almost"}`} role="status">
            <p className="font-bold">
              {feedback.ok ? "✨ " : "Casi. "}
              <MathText text={feedback.text} block={false} />
            </p>
            {feedback.ok && step !== "verificar" && (
              <button className="btn-3d is-success is-block mt-3" onClick={advance} autoFocus>
                SIGUIENTE PASO
              </button>
            )}
          </div>
        )}
      </div>
      {!scaffold && <p className="text-xs text-muted">Ya no resaltamos los datos: como en el parcial, los encontrás vos.</p>}
    </div>
  );
}
