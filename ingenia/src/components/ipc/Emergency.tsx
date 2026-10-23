"use client";
/**
 * 🚨 MODO EMERGENCIA IPC: entrenador intensivo para un examen en horas.
 * Abre directo en «AHORA ESTUDIÁ ESTO»; el plan se rearma con el tiempo real.
 */
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { actions, useProgress } from "@/lib/store";
import { openTutor, setStudyContext } from "@/lib/studyContext";
import { getTopic } from "@/content/topics";
import { getLesson } from "@/content/lessons";
import { IPC_CHECKLIST, IPC_EXAM, type IpcParcial } from "@/content/ipc/mission";
import { AUTHORS, CONCEPT, DIFFERENCES, MAPS, QUICK, type QuickMode, type QuickQ } from "@/content/ipc/emergency";
import { readinessLevel } from "@/lib/fisicaMission";
import { defaultExamAt, examTopics, fmtClock, fmtLeft, ipcErrorItems, ipcErrors, ipcReadiness, ipcSimItems, ipcTopicItems } from "@/lib/ipcMission";
import { emergencyPlan, minutesLeft, PHASE, phaseOf, prioritized, quickQuestions, TIER_INFO, topicLevel, type EBlock } from "@/lib/ipcEmergency";
import { Session } from "../session/Session";
import { MathText } from "../math/MathText";
import { subjectStyle } from "../ui/SubjectArt";
import { Bar } from "../fisica/ui";

const IPC = subjectStyle("ipc");
const MODE_TITLE: Record<QuickMode | "errores", string> = { vf: "⚡ Verdadero o falso", quien: "👤 ¿De quién es esta idea?", error: "🔍 Encontrá el error", trampa: "🪤 Palabra trampa", mc: "📝 Opción múltiple", errores: "🔥 Repasar mis errores" };

function useNow(ms = 20000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

function Back() {
  return (
    <Link href="/ipc" className="btn btn-ghost mb-1 !px-2 text-sm">
      ← Misión IPC
    </Link>
  );
}

function toLocalInput(ms: number) {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

const href = (b: EBlock) => `/ipc?vista=bloque&k=${encodeURIComponent(b.key)}`;

// ───────────────────────── Tarjeta del inicio ─────────────────────────

export function EmergencyCard() {
  const s = useProgress();
  const now = useNow();
  const at = s.ipc.examAt;
  if (!at || at < now - 2 * 3600000 || at > now + 36 * 3600000) return null;
  const r = ipcReadiness(s);
  const pr = prioritized(s);
  return (
    <section className="card-hero" style={IPC} aria-labelledby="mision-ipc">
      <div className="space-y-3 p-5">
        <p id="mision-ipc" className="hero-muted text-sm font-black uppercase tracking-wider text-white/85">
          🚨 Misión IPC — examen
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            ["⏱", at > now ? fmtLeft(at - now) : "¡ya!", "restante"],
            ["📊", `${Math.round(r.value * 100)} %`, "preparación"],
            ["🧠", `${pr.filter((x) => x.tier === "dominado").length}/${pr.length}`, "dominados"],
            ["⚠️", `${pr.filter((x) => x.tier === "urgente").length}`, "débiles"],
            ["🔥", pr[0]?.t.short ?? "—", "prioridad"],
            ["📝", `${s.exams.filter((e) => e.title.startsWith("IPC")).length}`, "simulacros"],
          ].map(([i, v, l]) => (
            <div key={l} className="min-w-0 rounded-xl bg-white/15 px-3 py-2">
              <p className="truncate font-black">
                <span aria-hidden>{i}</span> {v}
              </p>
              <p className="hero-muted text-xs font-bold text-white/85">{l}</p>
            </div>
          ))}
        </div>
        <Link href="/ipc" className="btn-3d is-secondary !px-6">
          COMENZAR PREPARACIÓN INTENSIVA →
        </Link>
      </div>
    </section>
  );
}

// ───────────────────────── Centro de mando ─────────────────────────

export function EmergencyHub() {
  const s = useProgress();
  const now = useNow();
  useEffect(() => {
    if (!s.ipc.examAt) actions.updateIpc({ examAt: defaultExamAt() });
  }, [s.ipc.examAt]);
  const left = minutesLeft(s, now);
  const phase = phaseOf(left);
  const plan = emergencyPlan(s, now);
  const next = plan[0];
  const r = ipcReadiness(s);
  const lvl = readinessLevel(r.value);
  const pr = prioritized(s);
  const lastSim = [...s.exams].reverse().find((e) => e.title.startsWith("IPC"));
  const p = s.ipc.parcial;
  const examAt = s.ipc.examAt ?? defaultExamAt(now);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Estado */}
      <section className="card-hero" style={IPC}>
        <div className="space-y-3 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="hero-muted text-xs font-black uppercase tracking-wider text-white/85">🚨 IPC — examen · {IPC_EXAM[p].title}</p>
              <p className="text-4xl font-black">⏱ {left === null ? "—" : fmtLeft(left * 60000)}</p>
              <p className="hero-muted text-sm text-white/85">
                {PHASE[phase].icon} {PHASE[phase].title}
              </p>
            </div>
            <label className="text-sm font-bold">
              <span className="hero-muted block text-xs uppercase text-white/85">Hora del examen</span>
              <input
                type="datetime-local"
                className="input !min-h-10 !w-auto !bg-white/95 !text-[color:var(--text)]"
                value={toLocalInput(examAt)}
                onChange={(e) => {
                  const v = Date.parse(e.target.value);
                  if (Number.isFinite(v)) actions.updateIpc({ examAt: v });
                }}
              />
              <span className="mt-1 flex gap-1">
                {[60, 120, 180].map((m) => (
                  <button key={m} className="rounded-full bg-white/20 px-2 py-0.5 text-xs" onClick={() => actions.updateIpc({ examAt: Date.now() + m * 60000 })}>
                    en {m / 60} h
                  </button>
                ))}
              </span>
            </label>
          </div>
          <div className="rounded-xl bg-white/15 p-3">
            <div className="flex items-center justify-between text-sm font-bold">
              <span>Preparación</span>
              <span>
                {lvl.icon} {lvl.label}
              </span>
            </div>
            <div className="mt-1 h-3 overflow-hidden rounded-full bg-white/25">
              <div className="h-full rounded-full bg-white" style={{ width: `${Math.max(2, Math.round(r.value * 100))}%` }} />
            </div>
            <p className="hero-muted mt-1 text-xs text-white/85">
              {Math.round(r.value * 100)} % · calculado con tus respuestas (no es una probabilidad de aprobar)
              {pr[0] && ` · 🔥 Prioridad: ${pr[0].t.short}`}
              {pr.find((x) => x.tier === "urgente") && ` · ⚠️ Debilidad: ${pr.find((x) => x.tier === "urgente")!.t.short}`}
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2 text-sm" role="radiogroup" aria-label="Qué parcial rendís">
        <span className="font-bold">Rindo el:</span>
        {(["1P", "2P"] as IpcParcial[]).map((k) => (
          <button key={k} role="radio" aria-checked={p === k} className="tile !min-h-9 !px-3 !py-1 text-sm" onClick={() => actions.updateIpc({ parcial: k, diagDoneAt: null })}>
            {IPC_EXAM[k].title}
          </button>
        ))}
      </div>

      {/* AHORA */}
      {next && (
        <section className="card border-2 p-5" style={{ borderColor: "var(--c-humanities)" }}>
          <p className="text-xs font-black uppercase text-muted">🔥 Ahora estudiá esto</p>
          <p className="mt-1 text-2xl font-black">
            {next.kind === "topic" ? "" : `${next.icon} `}
            {next.title}
          </p>
          <p className="text-sm text-muted">
            {next.detail} · {next.minutes} min
          </p>
          <Link href={href(next)} className="btn-3d is-subject is-block mt-3 text-lg" style={IPC}>
            CONTINUAR →
          </Link>
        </section>
      )}

      {/* Después del simulacro */}
      {lastSim && Date.now() - lastSim.ts < 3 * 3600000 && (
        <section className="card p-4">
          <p className="font-black">
            📝 Último simulacro: {lastSim.correct}/{lastSim.total}
          </p>
          <p className="mt-1 text-sm font-bold">🚨 Prioridad para los próximos 30 min:</p>
          <ol className="list-decimal pl-5 text-sm">
            {Object.entries(lastSim.byTopic)
              .map(([t, v]) => ({ t, acc: v.correct / Math.max(1, v.total) }))
              .filter((x) => x.acc < 1)
              .sort((a, b) => a.acc - b.acc)
              .slice(0, 3)
              .map((x) => (
                <li key={x.t}>
                  <Link className="font-semibold hover:underline" href={`/ipc?vista=concepto&id=${x.t}`}>
                    {examTopics(p).find((y) => y.topicId === x.t)?.short ?? getTopic(x.t)?.name}
                  </Link>
                </li>
              ))}
          </ol>
        </section>
      )}

      {/* Accesos rápidos */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {[
          ["🔥", "Lo más tomado", "/ipc?vista=top"],
          ["❌", "Mis errores", "/ipc?vista=quick&modo=errores"],
          ["📝", "Simulacro", "/ipc?vista=bloque&k=simfinal"],
          ["⚡", "Resumen 5 min", "/ipc?vista=resumen"],
          ["🃏", "Flashcards", "/ipc?vista=flash"],
          ["⚡", "V o F", "/ipc?vista=quick&modo=vf"],
        ].map(([i, t, h]) => (
          <Link key={t} href={h} className="card-subject !p-2.5 text-center" style={IPC}>
            <span className="block text-xl" aria-hidden>
              {i}
            </span>
            <span className="block text-xs font-black">{t}</span>
          </Link>
        ))}
      </div>

      {/* Plan */}
      <section className="card p-4">
        <h2 className="mb-1 text-lg font-black">⏱ Plan para el tiempo que queda</h2>
        <p className="mb-2 text-xs text-muted">{PHASE[phase].text} Se recalcula solo con el reloj y tus resultados.</p>
        <ol className="space-y-1">
          {(() => {
            let t = now;
            return plan.map((b, i) => {
              const start = t;
              t += b.minutes * 60000;
              return (
                <li key={b.key}>
                  <Link href={href(b)} className={`flex items-center gap-2 rounded-xl p-2 ${i === 0 ? "bg-[color:var(--c-humanities-soft,var(--surface-2))]" : "bg-surface-2"}`}>
                    <span className="w-11 shrink-0 text-xs font-black text-muted">{fmtClock(start)}</span>
                    <span className="min-w-0 flex-1 text-sm font-bold">
                      {b.kind === "topic" ? "" : `${b.icon} `}
                      {b.title}
                      <span className="block text-xs font-normal text-muted">{b.detail}</span>
                    </span>
                    <span className="shrink-0 text-xs text-muted">{b.minutes}′</span>
                  </Link>
                </li>
              );
            });
          })()}
        </ol>
      </section>

      {/* Necesitás / conviene / si queda tiempo */}
      <section className="card space-y-2 p-4">
        <h2 className="text-lg font-black">🎯 Qué saber</h2>
        {(["necesitas", "conviene", "si-queda"] as const).map((tier) => {
          const xs = pr.filter((x) => x.need === tier);
          if (!xs.length) return null;
          return (
            <div key={tier}>
              <p className="text-xs font-black uppercase text-muted">{tier === "necesitas" ? "Necesitás saber esto" : tier === "conviene" ? "Conviene saber esto" : "Si queda tiempo"}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {xs.map((x) => (
                  <Link key={x.t.topicId} href={`/ipc?vista=concepto&id=${x.t.topicId}`} className="chip !py-1 text-sm">
                    {TIER_INFO[x.tier].icon} {x.t.short}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
        <p className="text-xs text-muted">🔴 urgente · 🟡 repasar · 🟢 dominado · ⚪ sin datos (hacé el diagnóstico)</p>
      </section>

      {/* Herramientas */}
      <section>
        <h2 className="mb-2 text-lg font-black">Herramientas</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            ["👤", "Autores", "/ipc?vista=autores"],
            ["⚔️", "Autor vs autor", "/ipc?vista=comparar"],
            ["🔀", "Diferencia entre…", "/ipc?vista=diferencias"],
            ["🗺️", "Mapas", "/ipc?vista=mapas"],
            ["👤", "¿De quién es?", "/ipc?vista=quick&modo=quien"],
            ["🔍", "Encontrá el error", "/ipc?vista=quick&modo=error"],
            ["🪤", "Palabra trampa", "/ipc?vista=quick&modo=trampa"],
            ["✅", "Checklist", "/ipc?vista=checklist"],
          ].map(([i, t, h]) => (
            <Link key={h} href={h} className="card-subject p-3" style={IPC}>
              <span aria-hidden>{i}</span> <span className="font-black">{t}</span>
            </Link>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">
          Modo clásico (plan por horas, fichas, trampas):{" "}
          <Link href="/ipc?vista=clasico" className="font-semibold text-primary">
            abrir
          </Link>
          . Todas las preguntas de este modo son de práctica generada; ninguna figura como pregunta real de examen.
        </p>
      </section>
    </div>
  );
}

// ───────────────────────── Bloques ─────────────────────────

export function EBlockView({ k }: { k: string }) {
  const s = useProgress();
  const router = useRouter();
  const [b] = useState(() => emergencyPlan(s).find((x) => x.key === k) ?? fallbackBlock(k));
  const finish = () => {
    actions.markIpcBlock(k);
    if (b?.kind === "diag") actions.updateIpc({ diagDoneAt: Date.now() });
    router.push("/ipc");
  };
  if (!b)
    return (
      <div className="mx-auto max-w-xl">
        <Back />
        <p className="card p-5">Ese bloque ya no está en el plan (se reordenó con el tiempo y tus resultados).</p>
      </div>
    );
  const p = s.ipc.parcial;
  switch (b.kind) {
    case "diag":
      return <Session title="⚡ Diagnóstico express · IPC" items={examTopics(p).filter((t) => t.questions > 0).map((t) => ({ topicId: t.topicId, difficulty: 3 as const, label: t.short }))} mode="diagnostico" onExit={finish} />;
    case "minisim":
    case "simfinal":
      return <SimRun final={b.kind === "simfinal"} onDone={finish} />;
    case "errores":
      return <ErrorsRun onDone={finish} />;
    case "quick":
      return <QuickQuiz title={MODE_TITLE[b.mode ?? "vf"]} qs={quickQuestions(s, b.mode).slice(0, 8)} onDone={finish} />;
    case "flash":
      return <Flashcards onDone={finish} />;
    case "resumen":
      return <Resumen5 onDone={finish} />;
    case "pausa":
      return (
        <div className="mx-auto max-w-xl space-y-4">
          <Back />
          <div className="card p-5 text-lg">☕ Pausa de 5 minutos: levantate, tomá agua, sin pantallas. Volvé y seguimos.</div>
          <button className="btn-3d is-subject is-block" style={IPC} onClick={finish}>
            VOLVÍ
          </button>
        </div>
      );
    default:
      return <TopicBlock topicId={b.topicId!} retention={b.detail.startsWith("Ya lo dominás")} onDone={finish} />;
  }
}

function fallbackBlock(k: string): EBlock | undefined {
  if (k === "simfinal") return { key: k, kind: "simfinal", title: "Simulacro", detail: "", minutes: 20, icon: "🎯" };
  return undefined;
}

function TopicBlock({ topicId, retention, onDone }: { topicId: string; retention: boolean; onDone: () => void }) {
  const s = useProgress();
  const [stage, setStage] = useState<"concepto" | "practica">(retention ? "practica" : "concepto");
  const [items] = useState(() => ipcTopicItems(s, topicId).slice(0, retention ? 2 : 4));
  if (stage === "concepto")
    return (
      <div className="mx-auto max-w-2xl space-y-3">
        <Back />
        <ConceptCard topicId={topicId} onTry={() => setStage("practica")} />
      </div>
    );
  return <Session title={getTopic(topicId)?.name ?? "IPC"} items={items} mode="practica" onExit={onDone} />;
}

// ───────────────────────── Concepto: explicación rápida ─────────────────────────

export function ConceptCard({ topicId, onTry }: { topicId: string; onTry?: () => void }) {
  const [depth, setDepth] = useState<"30" | "60" | "180">("60");
  const [zero, setZero] = useState(false);
  const [recall, setRecall] = useState(false);
  const topic = getTopic(topicId);
  const lesson = topic?.lessonId ? getLesson(topic.lessonId) : undefined;
  const sum = lesson?.cards.find((c) => c.kind === "summary");
  const points = sum && sum.kind === "summary" ? sum.points : [];
  const c = CONCEPT[topicId];
  const info = [...IPC_EXAM["1P"].topics, ...IPC_EXAM["2P"].topics].find((t) => t.topicId === topicId);
  const authors = AUTHORS.filter((a) => a.topicId === topicId);
  const diffs = DIFFERENCES.filter((d) => d.topicId === topicId);
  const level = topicLevel(useProgress(), topicId);
  useEffect(() => {
    setStudyContext({ subjectId: "ipc", topicId, reading: { title: info?.short ?? topic?.name ?? "IPC", text: [c?.frase, ...points, ...(info?.traps ?? [])].filter(Boolean).join("\n") } }, true);
  }, [topicId]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <article className="card space-y-3 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-black">
          {info?.icon} {info?.short ?? topic?.name}
        </h1>
        <span className="text-sm font-bold">{level === null ? "⚪ sin datos" : `${TIER_INFO[level >= 0.75 ? "dominado" : level >= 0.45 ? "repasar" : "urgente"].icon} ${Math.round(level * 100)} %`}</span>
      </div>
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Explicación rápida">
        <span className="self-center text-xs font-black uppercase text-muted">⚡ Explicación</span>
        {([["30", "30 s"], ["60", "1 min"], ["180", "3 min"]] as const).map(([k, l]) => (
          <button key={k} role="radio" aria-checked={depth === k} className="tile !min-h-8 !px-3 !py-0.5 text-sm" onClick={() => setDepth(k)}>
            {l}
          </button>
        ))}
        <button className="btn btn-secondary !min-h-8 !px-3 text-sm" aria-pressed={zero} onClick={() => setZero(!zero)}>
          😵 No entiendo
        </button>
      </div>
      {c && (
        <p className="rounded-xl bg-surface-2 p-3 text-lg font-semibold">
          🧠 <MathText text={c.frase} block={false} />
        </p>
      )}
      {zero && lesson && (
        <div className="space-y-2 rounded-xl border-2 border-dashed border-line p-3">
          <p className="text-xs font-black uppercase text-muted">Desde cero, con palabras de todos los días</p>
          {lesson.tutor.fromZero && <p><MathText text={lesson.tutor.fromZero} block={false} /></p>}
          {lesson.tutor.nino && <p>🏠 <MathText text={lesson.tutor.nino} block={false} /></p>}
          {lesson.tutor.simple && <p>📘 En términos de IPC: <MathText text={lesson.tutor.simple} block={false} /></p>}
        </div>
      )}
      {depth !== "30" && (
        <>
          {lesson?.tutor.simple && !zero && (
            <p>
              <b>Simple: </b>
              <MathText text={lesson.tutor.simple} block={false} />
            </p>
          )}
          {lesson?.tutor.ejemplo && (
            <p className="text-sm">
              <b>Ejemplo: </b>
              <MathText text={lesson.tutor.ejemplo} block={false} />
            </p>
          )}
          {info && (
            <div className="rounded-xl p-3" style={{ background: "color-mix(in srgb, #d97706 12%, transparent)" }}>
              <p className="text-xs font-black uppercase">⚠️ Confusión frecuente</p>
              <ul className="mt-1 space-y-1 text-sm">
                {(depth === "60" ? info.traps.slice(0, 2) : info.traps).map((x) => (
                  <li key={x}>• {x}</li>
                ))}
              </ul>
            </div>
          )}
          {c && (
            <p className="text-sm">
              <b>❓ Qué podrían preguntar: </b>
              {c.preguntan}
            </p>
          )}
        </>
      )}
      {depth === "180" && (
        <>
          {lesson?.tutor.normal && (
            <p className="text-sm">
              <MathText text={lesson.tutor.normal} block={false} />
            </p>
          )}
          {points.length > 0 && (
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {points.map((x) => (
                <li key={x}>
                  <MathText text={x} block={false} />
                </li>
              ))}
            </ul>
          )}
          {diffs.map((d) => (
            <DiffCard key={d.id} d={d} />
          ))}
          {authors.map((a) => (
            <p key={a.id} className="text-sm">
              👤 <b>{a.name}:</b> {a.idea} <i>«{a.frase}»</i>
            </p>
          ))}
        </>
      )}
      {recall ? (
        <div className="rounded-xl bg-surface-2 p-3 text-sm">
          <p className="font-black">🧠 Para recordarlo</p>
          {authors.map((a) => (
            <p key={a.id}>
              <b>{a.name}</b>: «{a.frase}» · palabras clave: {a.claves.map((x) => x.k).join(", ")}
            </p>
          ))}
          {diffs.slice(0, 2).map((d) => (
            <p key={d.id}>
              🔀 {d.a[0]} ≠ {d.b[0]}: {d.key}
            </p>
          ))}
          {!authors.length && !diffs.length && c && <p>Quedate con la frase: «{c.frase}»</p>}
        </div>
      ) : (
        <button className="btn btn-ghost !min-h-8 !px-2 text-sm" onClick={() => setRecall(true)}>
          🧠 Ayudame a recordarlo
        </button>
      )}
      <div className="flex flex-wrap gap-2">
        {onTry ? (
          <button className="btn-3d is-subject" style={IPC} onClick={onTry}>
            PROBAR PREGUNTAS →
          </button>
        ) : (
          <Link href={`/ipc?vista=quick&tema=${topicId}`} className="btn-3d is-subject" style={IPC}>
            PROBAR PREGUNTA
          </Link>
        )}
        <button className="btn btn-secondary text-sm" onClick={() => openTutor(`Explicame ${info?.short ?? "este tema"} en una frase y con un ejemplo, para el parcial de IPC.`)}>
          Preguntarle al profesor
        </button>
      </div>
    </article>
  );
}

export function ConceptView({ id }: { id: string }) {
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <Back />
      <ConceptCard topicId={id} />
    </div>
  );
}

// ───────────────────────── Preguntas rápidas ─────────────────────────

export function QuickQuiz({ title, qs, onDone }: { title: string; qs: QuickQ[]; onDone?: () => void }) {
  const [queue, setQueue] = useState(qs);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState({ ok: 0, total: 0 });
  const q = queue[i];
  useEffect(() => {
    if (!q) return;
    setStudyContext(
      {
        subjectId: "ipc",
        topicId: q.topicId,
        reading: { title: `Pregunta de práctica (${title})`, text: `${q.q}\n${q.options.map((o, k) => `${"ABCD"[k]}) ${o}`).join("\n")}${pick !== null ? `\nEl estudiante eligió ${"ABCD"[pick]}). Correcta: ${"ABCD"[q.answer]}).` : ""}` },
      },
      true,
    );
  }, [q, pick, title]);
  if (!queue.length)
    return (
      <div className="mx-auto max-w-xl space-y-3">
        <Back />
        <p className="card p-5">No hay preguntas para mostrar acá todavía. {title.includes("errores") ? "¡No tenés errores pendientes!" : ""}</p>
      </div>
    );
  if (!q)
    return (
      <div className="mx-auto max-w-xl space-y-3">
        <Back />
        <div className="card space-y-2 p-5 text-center">
          <p className="text-3xl font-black">
            {score.ok}/{score.total}
          </p>
          <p className="text-muted">Lo que fallaste vuelve en «Mis errores» y en el repaso final.</p>
          {onDone ? (
            <button className="btn-3d is-subject is-block" style={IPC} onClick={onDone}>
              SEGUIR CON EL PLAN
            </button>
          ) : (
            <Link href="/ipc" className="btn-3d is-subject is-block" style={IPC}>
              VOLVER
            </Link>
          )}
        </div>
      </div>
    );
  const answered = pick !== null;
  const ok = pick === q.answer;
  const choose = (k: number) => {
    if (answered) return;
    setPick(k);
    setScore((x) => ({ ok: x.ok + (k === q.answer ? 1 : 0), total: x.total + 1 }));
    actions.logIpcQuick({ id: q.id, topicId: q.topicId, ok: k === q.answer, kind: q.errorKind });
    // Si falla, vuelve unas preguntas después (no inmediatamente).
    if (k !== q.answer && !queue.slice(i + 1).includes(q)) setQueue((Q) => [...Q.slice(0, i + 4), q, ...Q.slice(i + 4)]);
  };
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <div className="flex items-center gap-2">
        <Link href="/ipc" className="btn btn-ghost !px-2" aria-label="Salir">
          ✕
        </Link>
        <div className="pbar flex-1">
          <span style={{ width: `${Math.round((i / queue.length) * 100)}%` }} />
        </div>
        <span className="text-xs font-bold text-muted">
          {i + 1}/{queue.length}
        </span>
      </div>
      <p className="text-xs font-black uppercase text-muted">
        {title} · práctica generada{queue.indexOf(q) !== i ? "" : ""}
      </p>
      <div className="q-card p-4 text-lg font-semibold">
        <MathText text={q.q} />
      </div>
      <div className="grid gap-2" role="radiogroup">
        {q.options.map((o, k) => (
          <button key={k} role="radio" aria-checked={pick === k} disabled={answered} className={`tile !items-start flex-col text-left ${answered && k === q.answer ? "is-correct" : answered && k === pick ? "is-wrong" : ""}`} onClick={() => choose(k)}>
            <span className="font-bold">
              {q.options.length > 2 ? `${"ABCD"[k]}) ` : ""}
              {o}
            </span>
            {answered && <span className="text-sm font-medium text-muted">{q.why[k]}</span>}
          </button>
        ))}
      </div>
      {answered && (
        <div className={`feedback ${ok ? "is-ok" : "is-almost"}`} role="status">
          <p className="font-bold">{ok ? "✅ Correcta." : `❌ Incorrecta. Era «${q.options[q.answer]}».`}</p>
          <p className="text-sm">{q.why[q.answer]}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button className="btn-3d is-success" autoFocus onClick={() => (setPick(null), setI(i + 1))}>
              SIGUIENTE
            </button>
            {!ok && (
              <button className="btn btn-secondary text-sm" onClick={() => openTutor(`No entiendo por qué la ${"ABCD"[pick!]}) está mal y la correcta es la ${"ABCD"[q.answer]}).`)}>
                ¿Por qué está mal?
              </button>
            )}
            <Link href={`/ipc?vista=concepto&id=${q.topicId}`} className="btn btn-ghost text-sm">
              Ver el concepto
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export function QuickView({ modo, tema }: { modo?: string; tema?: string }) {
  const s = useProgress();
  const [qs] = useState(() => (tema ? quickQuestions(s, undefined, tema) : quickQuestions(s, (modo as QuickMode | "errores") ?? "vf")));
  if (modo === "errores") {
    const items = ipcErrorItems(s, 6);
    return <ErrorsCombined qs={qs} items={items} />;
  }
  return <QuickQuiz title={tema ? `Preguntas: ${getTopic(tema)?.name ?? ""}` : MODE_TITLE[(modo as QuickMode) ?? "vf"]} qs={qs} />;
}

function ErrorsCombined({ qs, items }: { qs: QuickQ[]; items: ReturnType<typeof ipcErrorItems> }) {
  const [stage, setStage] = useState<"quick" | "ex">(qs.length ? "quick" : "ex");
  if (stage === "quick" && qs.length) return <QuickQuiz title={MODE_TITLE.errores} qs={qs} onDone={() => setStage("ex")} />;
  if (items.length) return <Session title="🔥 Mis errores en ejercicios" items={items} mode="repaso" exitHref="/ipc" />;
  return <QuickQuiz title={MODE_TITLE.errores} qs={[]} />;
}

function ErrorsRun({ onDone }: { onDone: () => void }) {
  const s = useProgress();
  const [qs] = useState(() => quickQuestions(s, "errores").slice(0, 6));
  const [items] = useState(() => ipcErrorItems(s, 5));
  const [stage, setStage] = useState<"quick" | "ex">(qs.length ? "quick" : "ex");
  if (stage === "quick") return <QuickQuiz title={MODE_TITLE.errores} qs={qs} onDone={() => (items.length ? setStage("ex") : onDone())} />;
  if (items.length) return <Session title="❌ Tus errores" items={items} mode="repaso" onExit={onDone} />;
  return (
    <div className="mx-auto max-w-xl space-y-3">
      <Back />
      <p className="card p-5">No tenés errores pendientes. 🟢 Seguí con el plan.</p>
      <button className="btn-3d is-subject is-block" style={IPC} onClick={onDone}>
        SEGUIR
      </button>
    </div>
  );
}

// ───────────────────────── Simulacros ─────────────────────────

function SimRun({ final, onDone }: { final: boolean; onDone: () => void }) {
  const s = useProgress();
  const [items] = useState(() => ipcSimItems(s, s.ipc.parcial));
  const [go, setGo] = useState(false);
  if (go)
    return (
      <Session
        title={`IPC · ${final ? "Simulacro final" : "Mini simulacro"} ${IPC_EXAM[s.ipc.parcial].title}`}
        items={items}
        mode="examen"
        kind="examen"
        minutes={final ? 20 : 15}
        noHelp
        saveRecord
        onExit={onDone}
        recovery={{ href: "/ipc", label: "VER PRIORIDADES" }}
      />
    );
  return (
    <div className="mx-auto max-w-xl space-y-3">
      <Back />
      <h1 className="text-2xl font-black">{final ? "🎯 Simulacro final" : "📝 Mini simulacro"}</h1>
      <p>
        {items.length} preguntas · {final ? 20 : 15} minutos · sin ayudas.
      </p>
      <p className="rounded-xl bg-surface-2 p-3 text-sm">Simulacro generado a partir de los patrones observados en los materiales disponibles ({IPC_EXAM[s.ipc.parcial].source}). No es un examen oficial y sus preguntas no son copias de exámenes.</p>
      <button className="btn-3d is-subject is-block" style={IPC} onClick={() => setGo(true)}>
        EMPEZAR
      </button>
    </div>
  );
}

// ───────────────────────── Flashcards ─────────────────────────

function useCards() {
  const s = useProgress();
  return useMemo(() => {
    const p = s.ipc.parcial;
    const wrongTopics = new Set([...(s.ipc.qlog ?? []).filter((x) => !x.ok).map((x) => x.topicId), ...ipcErrors(s).map(([t]) => t)]);
    const cards: { f: string; b: string; topicId: string }[] = [
      ...DIFFERENCES.filter((d) => d.parcial === p).map((d) => ({ f: `¿Diferencia entre ${d.a[0].toLowerCase()} y ${d.b[0].toLowerCase()}?`, b: d.key, topicId: d.topicId })),
      ...AUTHORS.filter((a) => a.parcial === p).map((a) => ({ f: `${a.name}: ¿idea central?`, b: `${a.idea} No confundir: ${a.confusion}`, topicId: a.topicId })),
      ...examTopics(p).map((t) => ({ f: `${t.short}: ¿la trampa clásica?`, b: t.traps[0], topicId: t.topicId })),
    ];
    return cards.sort((a, b) => Number(wrongTopics.has(b.topicId)) - Number(wrongTopics.has(a.topicId)) || (topicLevel(s, a.topicId) ?? 0) - (topicLevel(s, b.topicId) ?? 0)).slice(0, 20);
  }, [s]);
}

function Flashcards({ onDone }: { onDone?: () => void }) {
  const initial = useCards();
  const [cards, setCards] = useState(initial);
  const [i, setI] = useState(0);
  const [show, setShow] = useState(false);
  const c = cards[i];
  if (!c)
    return (
      <div className="mx-auto max-w-xl space-y-3">
        <Back />
        <p className="card p-5">¡Listo! Repasaste {cards.length} tarjetas.</p>
        {onDone && (
          <button className="btn-3d is-subject is-block" style={IPC} onClick={onDone}>
            SEGUIR CON EL PLAN
          </button>
        )}
      </div>
    );
  const next = (knew: boolean) => {
    actions.logIpcQuick({ id: `card:${i}:${c.f.slice(0, 20)}`, topicId: c.topicId, ok: knew, kind: "memoria" });
    if (!knew && !cards.slice(i + 1).includes(c)) setCards((C) => [...C.slice(0, i + 4), c, ...C.slice(i + 4)]);
    setShow(false);
    setI(i + 1);
  };
  return (
    <div className="mx-auto max-w-xl space-y-3">
      <Back />
      <p className="text-xs font-black uppercase text-muted">
        🃏 Flashcards de emergencia · {i + 1}/{cards.length}
      </p>
      <button className="card flex min-h-48 w-full flex-col items-center justify-center gap-3 p-6 text-center" onClick={() => setShow(true)}>
        <p className="text-xl font-black">{c.f}</p>
        {show ? <p className="text-base">{c.b}</p> : <p className="text-sm text-muted">Intentá recordarlo y tocá para ver la respuesta</p>}
      </button>
      {show && (
        <div className="grid grid-cols-2 gap-2">
          <button className="btn-3d is-secondary" onClick={() => next(false)}>
            No me acordaba
          </button>
          <button className="btn-3d is-success" onClick={() => next(true)}>
            Lo sabía
          </button>
        </div>
      )}
    </div>
  );
}

export function FlashView() {
  return <Flashcards />;
}

// ───────────────────────── Resumen de 5 minutos ─────────────────────────

function Resumen5({ onDone }: { onDone?: () => void }) {
  const s = useProgress();
  const p = s.ipc.parcial;
  const wrong = [...new Set((s.ipc.qlog ?? []).filter((x) => !x.ok).map((x) => x.id))].map((id) => QUICK.find((q) => q.id === id)).filter(Boolean) as QuickQ[];
  const errTopics = ipcErrors(s).slice(0, 4);
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <Back />
      <h1 className="text-2xl font-black">⚡ IPC en 5 minutos · {IPC_EXAM[p].title}</h1>
      {AUTHORS.filter((a) => a.parcial === p).map((a) => (
        <div key={a.id} className="card p-3 text-sm">
          <b>👤 {a.name}</b> — {a.frase}
          <br />
          <span className="text-muted">No confundir: {a.confusion}</span>
        </div>
      ))}
      <div className="card space-y-1 p-3 text-sm">
        <p className="font-black">🔀 Diferencias</p>
        {DIFFERENCES.filter((d) => d.parcial === p).map((d) => (
          <p key={d.id}>
            <b>
              {d.a[0]} ≠ {d.b[0]}
            </b>
            : {d.key}
          </p>
        ))}
      </div>
      <div className="card space-y-1 p-3 text-sm">
        <p className="font-black">🧠 Conceptos en una frase</p>
        {examTopics(p)
          .filter((t) => !t.support)
          .map((t) => (
            <p key={t.topicId}>
              <b>{t.short}:</b> {CONCEPT[t.topicId]?.frase}
            </p>
          ))}
      </div>
      {(wrong.length > 0 || errTopics.length > 0) && (
        <div className="card space-y-1 p-3 text-sm" style={{ background: "color-mix(in srgb, #d97706 10%, var(--surface))" }}>
          <p className="font-black">❌ Errores que cometiste hoy</p>
          {wrong.slice(0, 6).map((q) => (
            <p key={q.id}>• {q.why[q.answer]}</p>
          ))}
          {errTopics.map(([t, n]) => (
            <p key={t}>
              • {examTopics(p).find((x) => x.topicId === t)?.short ?? getTopic(t)?.name}: {n} {n === 1 ? "error" : "errores"} en ejercicios
            </p>
          ))}
        </div>
      )}
      <div className="card p-3 text-sm">
        <p className="font-black">✅ En el examen</p>
        {IPC_CHECKLIST.slice(0, 5).map((x) => (
          <p key={x}>• {x}</p>
        ))}
      </div>
      {onDone && (
        <button className="btn-3d is-subject is-block" style={IPC} onClick={onDone}>
          LISTO
        </button>
      )}
    </div>
  );
}

export function ResumenView() {
  return <Resumen5 />;
}

// ───────────────────────── Lo más tomado ─────────────────────────

export function TopView() {
  const s = useProgress();
  const p = s.ipc.parcial;
  const ts = examTopics(p).filter((t) => t.questions > 0);
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <Back />
      <h1 className="text-2xl font-black">🔥 Lo más tomado · {IPC_EXAM[p].title}</h1>
      <p className="rounded-xl bg-surface-2 p-3 text-sm">
        {p === "1P"
          ? "En las claves de 1.er parcial cargadas (2023 y 1.er cuatrimestre 2024) el formato es fijo: 10 preguntas de opción múltiple, una por tema, 8 de la Unidad 1 y 2 de Darwin. Todos estos temas aparecen en cada examen; el orden de abajo lo da TU nivel."
          : "⚠️ No hay claves de 2.º parcial cargadas: estos pesos son inferidos de los resúmenes, no medidos en exámenes."}{" "}
        Las preguntas reales de esas claves no están guardadas en la plataforma (solo su clasificación por tema); todo lo que practicás acá es generado.
      </p>
      <ol className="space-y-1.5">
        {prioritized(s)
          .filter((x) => !x.t.support)
          .map((x, i) => (
            <li key={x.t.topicId} className="card flex items-center gap-3 p-3">
              <span className="text-lg font-black text-muted">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="font-bold">
                  {x.t.icon} {x.t.short}
                </span>
                <span className="block text-xs text-muted">
                  {x.t.questions} {x.t.questions === 1 ? "pregunta" : "preguntas"} por examen{p === "2P" ? " (inferido)" : ""} · {TIER_INFO[x.tier].icon} {TIER_INFO[x.tier].label}
                </span>
              </span>
              <Link href={`/ipc?vista=concepto&id=${x.t.topicId}`} className="btn btn-secondary !min-h-9 text-sm">
                Entrenar
              </Link>
            </li>
          ))}
      </ol>
      <Link href={`/ipc?vista=bloque&k=${encodeURIComponent(emergencyPlan(s).find((b) => b.kind === "topic")?.key ?? "simfinal")}`} className="btn-3d is-subject is-block" style={IPC}>
        ENTRENAR ESTOS TEMAS
      </Link>
      <p className="text-xs text-muted">Total de preguntas en el formato: {ts.reduce((a, t) => a + t.questions, 0)}.</p>
    </div>
  );
}

// ───────────────────────── Autores, comparador, diferencias, mapas ─────────────────────────

export function AuthorsView() {
  const s = useProgress();
  const list = AUTHORS.filter((a) => a.parcial === s.ipc.parcial);
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <Back />
      <h1 className="text-2xl font-black">👤 Autores · {IPC_EXAM[s.ipc.parcial].title}</h1>
      <p className="text-xs text-muted">Solo autores que aparecen en tu material (programa 2026, Cátedra A).</p>
      {list.map((a) => (
        <article key={a.id} className="card space-y-2 p-4 text-sm">
          <h2 className="text-lg font-black">{a.name}</h2>
          <p className="text-base font-semibold">💡 {a.idea}</p>
          <div>
            <p className="text-xs font-black uppercase text-muted">🔑 Palabras clave (y por qué)</p>
            {a.claves.map((k) => (
              <p key={k.k}>
                <b>{k.k}</b>: {k.why}
              </p>
            ))}
          </div>
          <p>
            <b>✅ Defiende:</b> {a.defiende}
          </p>
          <p>
            <b>🚫 No defiende:</b> {a.noDefiende}
          </p>
          <p>
            <b>⚠️ Se confunde con:</b> {a.confusion}
          </p>
          <p>
            <b>❓ Posible pregunta:</b> {a.pregunta}
          </p>
          <p className="rounded-lg bg-surface-2 p-2 font-bold">🧠 {a.frase}</p>
        </article>
      ))}
    </div>
  );
}

export function CompareView() {
  const s = useProgress();
  const list = AUTHORS.filter((a) => a.parcial === s.ipc.parcial);
  const [A, setA] = useState(list[0]?.id);
  const [B, setB] = useState(list[1]?.id);
  const a = AUTHORS.find((x) => x.id === A);
  const b = AUTHORS.find((x) => x.id === B);
  const rows: [string, (x: (typeof AUTHORS)[number]) => string][] = [
    ["Idea principal", (x) => x.idea],
    ["Conceptos característicos", (x) => x.claves.map((k) => k.k).join(" · ")],
    ["Defiende", (x) => x.defiende],
    ["No defiende", (x) => x.noDefiende],
    ["Error frecuente", (x) => x.confusion],
    ["Para recordar", (x) => x.frase],
  ];
  const diff = DIFFERENCES.find((d) => a && b && [d.a[0], d.b[0]].some((n) => n.includes(a.name.split(" ")[0])) && [d.a[0], d.b[0]].some((n) => n.includes(b.name.split(" ")[0])));
  return (
    <div className="mx-auto max-w-3xl space-y-3">
      <Back />
      <h1 className="text-2xl font-black">⚔️ Autor vs autor</h1>
      <div className="flex flex-wrap gap-2">
        {[
          [A, setA],
          [B, setB],
        ].map(([v, set], k) => (
          <select key={k} className="input !w-auto" value={v as string} onChange={(e) => (set as (x: string) => void)(e.target.value)} aria-label={`Autor ${k + 1}`}>
            {list.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        ))}
      </div>
      {a && b && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr>
                <th className="w-32" />
                <th className="p-2 text-left font-black">{a.name}</th>
                <th className="p-2 text-left font-black">{b.name}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([l, f]) => (
                <tr key={l} className="border-t border-line align-top">
                  <th className="p-2 text-left text-xs font-black uppercase text-muted">{l}</th>
                  <td className="p-2">{f(a)}</td>
                  <td className="p-2">{f(b)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {diff && <DiffCard d={diff} />}
    </div>
  );
}

function DiffCard({ d }: { d: (typeof DIFFERENCES)[number] }) {
  return (
    <div className="card space-y-2 p-4 text-sm">
      <div className="grid gap-2 sm:grid-cols-2">
        {[d.a, d.b].map(([t, x]) => (
          <div key={t} className="rounded-lg bg-surface-2 p-2">
            <p className="font-black">{t}</p>
            <p>{x}</p>
          </div>
        ))}
      </div>
      <p>
        <b>🔀 Diferencia fundamental:</b> {d.key}
      </p>
      <p className="text-muted">
        <b>❓ Pregunta típica:</b> {d.pregunta}
      </p>
    </div>
  );
}

export function DiffsView() {
  const s = useProgress();
  const [hide, setHide] = useState(true);
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <Back />
      <h1 className="text-2xl font-black">🔀 Diferencia entre…</h1>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={hide} onChange={(e) => setHide(e.target.checked)} /> Recuperación activa: ocultar la diferencia hasta que intente recordarla
      </label>
      {DIFFERENCES.filter((d) => d.parcial === s.ipc.parcial).map((d) => (hide ? <RecallDiff key={d.id} d={d} /> : <DiffCard key={d.id} d={d} />))}
    </div>
  );
}

function RecallDiff({ d }: { d: (typeof DIFFERENCES)[number] }) {
  const [open, setOpen] = useState(false);
  if (open) return <DiffCard d={d} />;
  return (
    <button className="card w-full p-4 text-left" onClick={() => setOpen(true)}>
      <p className="font-black">
        ¿Cuál es la diferencia principal entre {d.a[0].toLowerCase()} y {d.b[0].toLowerCase()}?
      </p>
      <p className="text-sm text-muted">Pensalo y tocá para comprobar.</p>
    </button>
  );
}

export function MapsView() {
  const s = useProgress();
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <Back />
      <h1 className="text-2xl font-black">🗺️ Mapas</h1>
      {MAPS.filter((m) => m.parcial === s.ipc.parcial).map((m) => (
        <section key={m.id} className="card p-4">
          <h2 className="mb-2 font-black">{m.title}</h2>
          <div className="flex flex-col items-center gap-1">
            {m.steps.map((x, i) => (
              <div key={x} className="flex w-full flex-col items-center">
                {i > 0 && <span className="text-muted">↓</span>}
                <span className="w-full max-w-md rounded-xl bg-surface-2 p-2 text-center text-sm font-semibold">{x}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-sm text-muted">{m.note}</p>
        </section>
      ))}
    </div>
  );
}

export function EChecklist() {
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <Back />
      <section className="card p-5">
        <h1 className="mb-2 text-xl font-black">✅ Checklist del examen</h1>
        <ul className="space-y-2">
          {IPC_CHECKLIST.map((x) => (
            <li key={x}>☐ {x}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export { Bar };
