"use client";
/**
 * Modo examen de IPC: clase intensiva para un examen en pocas horas.
 * Misma lógica que la Misión Física (preparación con datos reales, plan,
 * diagnóstico, simulacro, errores), comprimida en horas en vez de semanas.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { actions, useProgress } from "@/lib/store";
import { getTopic } from "@/content/topics";
import { getLesson } from "@/content/lessons";
import { IPC_CHECKLIST, IPC_EXAM, type IpcParcial } from "@/content/ipc/mission";
import { readinessLevel, topicReadiness } from "@/lib/fisicaMission";
import {
  buildIpcPlan,
  defaultExamAt,
  examTopics,
  fmtClock,
  fmtLeft,
  ipcDiagItems,
  ipcErrorItems,
  ipcErrors,
  ipcImportantItems,
  ipcPriority,
  ipcReadiness,
  ipcSimItems,
  ipcTopicItems,
  rankedIpcTopics,
  type IpcBlock,
} from "@/lib/ipcMission";
import { Session } from "../session/Session";
import { GuideSay } from "../guide/Nodo";
import { MathText } from "../math/MathText";
import { subjectStyle } from "../ui/SubjectArt";
import { Bar, Flames, LevelBadge } from "../fisica/ui";

const IPC = subjectStyle("ipc");

export function BackToIpc() {
  return (
    <Link href="/ipc" className="btn btn-ghost mb-2 !px-2 text-sm">
      ← Modo examen IPC
    </Link>
  );
}

function useNow(ms = 30000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

/** Fija la hora del examen la primera vez (dentro de 6 h; se puede cambiar). */
function useExamAt(): number {
  const s = useProgress();
  useEffect(() => {
    if (!s.ipc.examAt) actions.updateIpc({ examAt: defaultExamAt() });
  }, [s.ipc.examAt]);
  return s.ipc.examAt ?? defaultExamAt();
}

function toLocalInput(ms: number) {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

// ───────────────────────── Tarjeta del inicio ─────────────────────────

export function IpcExamCard() {
  const s = useProgress();
  const now = useNow();
  const at = useExamAt();
  if ( at < now - 3 * 3600000 || at > now + 3 * 86400000) return null;
  const r = ipcReadiness(s);
  return (
    <section className="card-hero anim-rise" style={IPC} aria-labelledby="modo-ipc">
      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="min-w-0">
          <p id="modo-ipc" className="hero-muted text-sm font-black uppercase tracking-wider text-white/85">
            ⚡ Modo examen: IPC · {IPC_EXAM[s.ipc.parcial].title}
          </p>
          <p className="mt-1 text-2xl font-black">{at > now ? `Faltan ${fmtLeft(at - now)}` : "¡Es ahora!"}</p>
          <p className="hero-muted text-sm text-white/85">
            Examen a las {fmtClock(at)} · preparación {Math.round(r.value * 100)} %
          </p>
        </div>
        <Link href="/ipc" className="btn-3d is-secondary !px-6 text-lg">
          SEGUIR LA CLASE →
        </Link>
      </div>
    </section>
  );
}

// ───────────────────────── Centro de mando ─────────────────────────

export function IpcHub() {
  const s = useProgress();
  const now = useNow();
  const examAt = useExamAt();
  const p = s.ipc.parcial;
  const left = examAt - now;
  const r = ipcReadiness(s);
  const lvl = readinessLevel(r.value);
  const plan = buildIpcPlan(s);
  const next = plan.find((b) => !s.ipc.done.includes(b.key));
  const studyEnd = now + plan.filter((b) => !s.ipc.done.includes(b.key)).reduce((a, b) => a + b.minutes, 0) * 60000;
  const free = examAt - studyEnd;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <section className="card-hero" style={IPC}>
        <div className="p-5 sm:p-6">
          <p className="hero-muted text-sm font-black uppercase tracking-wider text-white/85">⚡ IPC — Clase intensiva</p>
          <h1 className="mt-1 text-3xl font-black sm:text-4xl">Modo examen</h1>
          <p className="hero-muted mt-1 max-w-prose text-white/85">Lo justo y lo más importante para el examen: primero lo que más toman y peor te sale, después un simulacro y un repaso final.</p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="hero-muted text-xs font-black uppercase text-white/85">Faltan</p>
              <p className="text-4xl font-black">{fmtLeft(left)}</p>
            </div>
            <label className="text-sm font-bold">
              <span className="hero-muted block text-xs uppercase text-white/85">Hora del examen</span>
              <input
                type="datetime-local"
                className="input !min-h-10 !w-auto !bg-white/95 !text-[color:var(--text)]"
                value={toLocalInput(examAt)}
                onChange={(e) => {
                  const v = Date.parse(e.target.value);
                  if (Number.isFinite(v)) actions.updateIpc({ examAt: v, done: [] });
                }}
              />
            </label>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Qué parcial rendís">
        <span className="font-bold">Rindo el:</span>
        {(["1P", "2P"] as IpcParcial[]).map((k) => (
          <button key={k} role="radio" aria-checked={p === k} className="tile !min-h-9 !px-3 !py-1 text-sm" onClick={() => actions.updateIpc({ parcial: k, done: [], diagDoneAt: null })}>
            {IPC_EXAM[k].title}
          </button>
        ))}
        <span className="text-xs text-muted">{IPC_EXAM[p].source}</span>
      </div>

      {/* Lo que toca ahora */}
      {next && (
        <section className="card border-2 p-5" style={{ borderColor: "var(--c-humanities)" }}>
          <p className="text-xs font-black uppercase text-muted">Ahora te toca</p>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xl font-black">
                {next.kind === "topic" ? "" : `${next.icon} `}
                {next.title}
              </p>
              <p className="text-sm text-muted">
                {next.detail} · {next.minutes} min
              </p>
            </div>
            <Link href={`/ipc?vista=bloque&k=${encodeURIComponent(next.key)}`} className="btn-3d is-subject !px-6" style={IPC}>
              {s.ipc.done.length ? "CONTINUAR" : "EMPEZAR"}
            </Link>
          </div>
        </section>
      )}

      {/* Plan */}
      <section className="card p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-black">🗓️ Tu plan hasta el examen</h2>
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Cuánto vas a estudiar">
            {[60, 120, 180, 240].map((m) => (
              <button key={m} role="radio" aria-checked={s.ipc.studyMin === m} className="tile !min-h-9 !px-3 !py-1 text-sm" onClick={() => actions.updateIpc({ studyMin: m })}>
                {m / 60} h
              </button>
            ))}
          </div>
        </div>
        <ol className="space-y-1.5">
          {(() => {
            let t = now;
            return plan.map((b) => {
              const done = s.ipc.done.includes(b.key);
              const start = t;
              if (!done) t += b.minutes * 60000;
              return (
                <li key={b.key}>
                  <Link
                    href={b.kind === "pausa" ? "#" : `/ipc?vista=bloque&k=${encodeURIComponent(b.key)}`}
                    onClick={(e) => {
                      if (b.kind === "pausa") {
                        e.preventDefault();
                        actions.markIpcBlock(b.key);
                      }
                    }}
                    className={`flex items-center gap-3 rounded-xl p-2.5 ${done ? "opacity-55" : b === next ? "bg-[color:var(--c-humanities-soft,var(--surface-2))]" : "bg-surface-2"}`}
                  >
                    <span className="w-12 shrink-0 text-xs font-black text-muted">{done ? "✔" : fmtClock(start)}</span>
                    <span className="min-w-0 flex-1">
                      <span className={`block font-bold ${done ? "line-through" : ""}`}>
                        {b.kind === "topic" ? "" : `${b.icon} `}
                        {b.title}
                      </span>
                      <span className="block text-xs text-muted">{b.detail}</span>
                    </span>
                    <span className="shrink-0 text-xs font-bold text-muted">{b.minutes} min</span>
                  </Link>
                </li>
              );
            });
          })()}
        </ol>
        {free > 45 * 60000 && (
          <p className="mt-3 rounded-xl bg-surface-2 p-3 text-sm">
            😴 Si seguís el plan terminás cerca de las <b>{fmtClock(studyEnd)}</b> y te quedan <b>{fmtLeft(free)}</b> antes del examen. Dormir aunque sea un rato ayuda a fijar lo que estudiaste: la memoria se consolida durmiendo.
          </p>
        )}
        {free < 0 && <p className="mt-3 rounded-xl bg-surface-2 p-3 text-sm">⏱ El plan es más largo que el tiempo que queda: elegí menos horas y se reordena para dejar lo más importante.</p>}
      </section>

      {/* Preparación */}
      <section className="card space-y-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-black">🎯 Preparación para el {IPC_EXAM[p].title}</h2>
          <LevelBadge value={r.value} />
        </div>
        <Bar value={r.value} label="Global" color={lvl.color} sub={`${Math.round(r.coverage * 100)} % de las preguntas con práctica tuya. Se calcula con tus resultados reales (dominio, ejercicios difíciles, simulacros y ayudas). No es una probabilidad de aprobar.`} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-muted">
                <th className="py-1">Tema</th>
                <th className="py-1">Importancia</th>
                <th className="py-1">Mi nivel</th>
              </tr>
            </thead>
            <tbody>
              {rankedIpcTopics(s).map(({ t, r: tr }) => (
                <tr key={t.topicId} className="border-t border-line">
                  <td className="py-1.5 pr-2">
                    <Link href={`/ipc?vista=ficha&id=${t.topicId}`} className="font-bold hover:underline">
                      {t.icon} {t.short}
                    </Link>
                    {t.support && <span className="block text-xs text-muted">apoyo (sin pregunta propia)</span>}
                  </td>
                  <td className="py-1.5 pr-2 whitespace-nowrap">
                    <Flames n={ipcPriority(s, t)} />
                  </td>
                  <td className="py-1.5 whitespace-nowrap">{tr === null ? <span className="text-xs text-muted">sin datos</span> : `${readinessLevel(tr).icon} ${Math.round(tr * 100)} %`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {IPC_EXAM[p].needsVerification && <p className="text-xs text-muted">⚠️ El formato del 2.º parcial es inferido de los resúmenes (no hay claves en el material).</p>}
      </section>

      {/* Modos */}
      <section>
        <h2 className="mb-2 text-lg font-black">Entrenar</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            ["🎯", "Diagnóstico", "Una por tema", "/ipc?vista=diagnostico"],
            ["📝", "Simulacro", "10 preguntas", "/ipc?vista=simulacro"],
            ["📄", "Fichas", "Resumen + trampas", "/ipc?vista=fichas"],
            ["🔥", "Lo más importante", "Lo que más toman", "/ipc?vista=importante"],
            ["❌", "Mis errores", "Lo que fallaste", "/ipc?vista=errores"],
            ["⚡", "5 minutos", "Algo útil igual", "/ipc?vista=5min"],
            ["🪤", "Trampas", "Las clásicas", "/ipc?vista=trampas"],
            ["✅", "Checklist", "Antes de entrar", "/ipc?vista=checklist"],
          ].map(([i, t, d, h]) => (
            <Link key={h} href={h} className="card-subject p-3" style={IPC}>
              <span className="text-2xl" aria-hidden>
                {i}
              </span>
              <span className="mt-1 block font-black">{t}</span>
              <span className="block text-xs text-muted">{d}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

// ───────────────────────── Bloques del plan ─────────────────────────

export function IpcBlockView({ k }: { k: string }) {
  const s = useProgress();
  const plan = buildIpcPlan(s);
  const b = plan.find((x) => x.key === k);
  const [stage, setStage] = useState<"ficha" | "run">("ficha");
  const router = useRouter();
  if (!b)
    return (
      <div className="mx-auto max-w-xl">
        <BackToIpc />
        <p className="card p-5">Ese bloque ya no está en el plan (se reordenó con tus resultados).</p>
      </div>
    );
  const done = () => {
    actions.markIpcBlock(b.key);
    if (b.kind === "diag") actions.updateIpc({ diagDoneAt: Date.now() });
    router.push("/ipc");
  };
  const exit = "/ipc";
  if (b.kind === "diag") return <Session title="Diagnóstico express · IPC" items={ipcDiagItems(s.ipc.parcial)} mode="diagnostico" onExit={done} exitHref={exit} />;
  if (b.kind === "simulacro") return <IpcSimulator onDone={done} />;
  if (b.kind === "errores") {
    const items = ipcErrorItems(s, 6);
    return items.length ? <Session title="Revisar errores · IPC" items={items} mode="repaso" onExit={done} exitHref={exit} /> : <Nothing text="No tenés errores recientes en IPC. ¡Bien! Pasá al siguiente bloque." onDone={done} />;
  }
  if (b.kind === "final") return <FinalReview onDone={done} />;
  if (b.kind === "pausa") return <Nothing text="Pausa de 5 minutos: levantate, tomá agua, sin pantallas." onDone={done} />;
  const hard = b.key.endsWith(":2");
  if (stage === "ficha")
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <BackToIpc />
        <Ficha topicId={b.topicId!} noActions />
        <button className="btn-3d is-subject is-block" style={IPC} onClick={() => setStage("run")}>
          PRACTICAR (5 EJERCICIOS)
        </button>
      </div>
    );
  return <Session title={getTopic(b.topicId!)?.name ?? "IPC"} items={ipcTopicItems(s, b.topicId!, hard)} mode="practica" onExit={done} exitHref={exit} />;
}

function Nothing({ text, onDone }: { text: string; onDone: () => void }) {
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <BackToIpc />
      <div className="card p-5">
        <GuideSay mood="happy">{text}</GuideSay>
      </div>
      <Link href="/ipc" className="btn-3d is-subject is-block" style={IPC} onClick={onDone}>
        LISTO
      </Link>
    </div>
  );
}

// ───────────────────────── Fichas ─────────────────────────

const ALL_TOPICS = [...IPC_EXAM["1P"].topics, ...IPC_EXAM["2P"].topics];

export function Ficha({ topicId, compact, noActions }: { topicId: string; compact?: boolean; noActions?: boolean }) {
  const info = ALL_TOPICS.find((t) => t.topicId === topicId);
  const topic = getTopic(topicId);
  const lesson = topic?.lessonId ? getLesson(topic.lessonId) : undefined;
  const sum = lesson?.cards.find((c) => c.kind === "summary");
  const points = sum && sum.kind === "summary" ? sum.points : [];
  const r = topicReadiness(useProgress(), topicId).value;
  return (
    <article className="card space-y-3 p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="text-xl font-black">
          {info?.icon} {info?.short ?? topic?.name}
        </h2>
        {r !== null && <LevelBadge value={r} />}
      </div>
      {!compact && lesson?.tutor.normal && (
        <p className="rounded-xl bg-surface-2 p-3">
          <b>La idea: </b>
          <MathText text={lesson.tutor.normal} block={false} />
        </p>
      )}
      {points.length > 0 && (
        <div>
          <p className="text-xs font-black uppercase text-muted">Lo que tenés que saber</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {points.map((x) => (
              <li key={x}>
                <MathText text={x} block={false} />
              </li>
            ))}
          </ul>
        </div>
      )}
      {info && (
        <div className="rounded-xl p-3" style={{ background: "color-mix(in srgb, var(--warn, #d97706) 12%, transparent)" }}>
          <p className="text-xs font-black uppercase">🪤 Trampas de examen</p>
          <ul className="mt-1 space-y-1">
            {info.traps.map((x) => (
              <li key={x} className="text-sm">
                • <MathText text={x} block={false} />
              </li>
            ))}
          </ul>
        </div>
      )}
      {!compact && lesson?.tutor.ejemplo && (
        <p className="text-sm">
          <b>Ejemplo: </b>
          <MathText text={lesson.tutor.ejemplo ?? ""} block={false} />
        </p>
      )}
      {!compact && !noActions && topic && (
        <div className="flex flex-wrap gap-2">
          <Link href={`/ipc?vista=practicar&id=${topicId}`} className="btn-3d is-subject !min-h-10 !px-4 text-sm" style={IPC}>
            PRACTICAR ESTE TEMA
          </Link>
          <Link href={`/leccion/${topic.lessonId}`} className="btn btn-secondary !min-h-10 text-sm">
            Ver la lección completa
          </Link>
        </div>
      )}
    </article>
  );
}

export function FichasView() {
  const s = useProgress();
  const [p, setP] = useState<IpcParcial>(s.ipc.parcial);
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <BackToIpc />
      <h1 className="text-2xl font-black">📄 Fichas de repaso</h1>
      <div className="flex gap-2" role="radiogroup" aria-label="Parcial">
        {(["1P", "2P"] as IpcParcial[]).map((k) => (
          <button key={k} role="radio" aria-checked={p === k} className="tile !min-h-9 !px-3 !py-1 text-sm" onClick={() => setP(k)}>
            {IPC_EXAM[k].title}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted">Ordenadas por prioridad (lo que más toman y peor te sale, primero).</p>
      {rankedIpcTopics(s, p).map(({ t }) => (
        <Ficha key={t.topicId} topicId={t.topicId} />
      ))}
    </div>
  );
}

export function FichaView({ id }: { id: string }) {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <BackToIpc />
      <Ficha topicId={id} />
    </div>
  );
}

export function TrapsView() {
  const s = useProgress();
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <BackToIpc />
      <h1 className="text-2xl font-black">🪤 Trampas clásicas · {IPC_EXAM[s.ipc.parcial].title}</h1>
      {examTopics(s.ipc.parcial).map((t) => (
        <section key={t.topicId} className="card p-4">
          <p className="font-black">
            {t.icon} {t.short}
          </p>
          <ul className="mt-1 space-y-1 text-sm">
            {t.traps.map((x) => (
              <li key={x}>• {x}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function IpcChecklist({ onDone }: { onDone?: () => void }) {
  const [checked, setChecked] = useState<number[]>([]);
  return (
    <section className="card p-5">
      <h2 className="mb-2 text-lg font-black">✅ Checklist del examen (opción múltiple)</h2>
      <ul className="space-y-2">
        {IPC_CHECKLIST.map((x, i) => (
          <li key={x}>
            <label className="flex items-start gap-3">
              <input type="checkbox" className="mt-1 h-5 w-5 accent-[var(--primary)]" checked={checked.includes(i)} onChange={() => setChecked(checked.includes(i) ? checked.filter((c) => c !== i) : [...checked, i])} />
              <span>{x}</span>
            </label>
          </li>
        ))}
      </ul>
      {onDone && (
        <Link href="/ipc" className="btn-3d is-subject is-block mt-4" style={IPC} onClick={onDone}>
          TERMINAR
        </Link>
      )}
    </section>
  );
}

function FinalReview({ onDone }: { onDone: () => void }) {
  const s = useProgress();
  const weak = rankedIpcTopics(s).filter((x) => !x.t.support).slice(0, 3);
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <BackToIpc />
      <h1 className="text-2xl font-black">✅ Repaso final</h1>
      <GuideSay mood="encourage">Nada nuevo ahora: leé las trampas de tus temas más flojos y la rutina del examen. Después, a descansar.</GuideSay>
      {weak.map(({ t }) => (
        <Ficha key={t.topicId} topicId={t.topicId} compact />
      ))}
      <IpcChecklist onDone={onDone} />
    </div>
  );
}

// ───────────────────────── Sesiones sueltas ─────────────────────────

export function IpcSimulator({ onDone }: { onDone?: () => void }) {
  const s = useProgress();
  const [mode, setMode] = useState<"realista" | "aprendizaje" | null>(null);
  const [items] = useState(() => ipcSimItems(s, s.ipc.parcial));
  if (mode)
    return (
      <Session
        title={`IPC · Simulacro ${IPC_EXAM[s.ipc.parcial].title} · ${mode}`}
        items={items}
        mode="examen"
        kind={mode === "realista" ? "examen" : "practica"}
        minutes={mode === "realista" ? 25 : undefined}
        noHelp={mode === "realista"}
        saveRecord
        onExit={onDone}
        exitHref="/ipc"
        recovery={{ href: "/ipc?vista=errores", label: "REPASAR MIS ERRORES" }}
      />
    );
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <BackToIpc />
      <h1 className="text-2xl font-black">📝 Simulacro · {IPC_EXAM[s.ipc.parcial].title}</h1>
      <p className="text-muted">
        {items.length} preguntas nuevas con la estructura del parcial ({IPC_EXAM[s.ipc.parcial].source}). Ninguna es copia de un examen.
      </p>
      <div className="grid gap-2">
        <button className="tile !items-start flex-col text-left" onClick={() => setMode("realista")}>
          <span className="font-black">⏱ Realista</span>
          <span className="text-sm text-muted">25 minutos, sin pistas. Como el examen.</span>
        </button>
        <button className="tile !items-start flex-col text-left" onClick={() => setMode("aprendizaje")}>
          <span className="font-black">📖 Aprendizaje</span>
          <span className="text-sm text-muted">Sin reloj, con pistas y explicaciones.</span>
        </button>
      </div>
    </div>
  );
}

export function IpcQuick({ kind }: { kind: "importante" | "5min" | "errores" | "diagnostico" }) {
  const s = useProgress();
  const router = useRouter();
  const [items] = useState(() =>
    kind === "importante" ? ipcImportantItems(s, 8) : kind === "5min" ? ipcImportantItems(s, 4) : kind === "errores" ? ipcErrorItems(s, 8) : ipcDiagItems(s.ipc.parcial),
  );
  if (kind === "errores" && !items.length)
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <BackToIpc />
        <div className="card p-5">
          <GuideSay mood="happy">Todavía no tenés errores en IPC. Hacé el diagnóstico o un simulacro y acá vas a poder practicarlos.</GuideSay>
        </div>
      </div>
    );
  const title = kind === "importante" ? "Lo más importante · IPC" : kind === "5min" ? "5 minutos · IPC" : kind === "errores" ? `Mis errores · IPC (${ipcErrors(s).length} temas)` : "Diagnóstico express · IPC";
  return (
    <Session
      title={title}
      items={items}
      mode={kind === "diagnostico" ? "diagnostico" : kind === "errores" ? "repaso" : "practica"}
      exitHref="/ipc"
      onExit={
        kind === "diagnostico"
          ? () => {
              actions.updateIpc({ diagDoneAt: Date.now() });
              router.push("/ipc");
            }
          : undefined
      }
    />
  );
}

export function IpcPractice({ id }: { id: string }) {
  const s = useProgress();
  const [items] = useState(() => ipcTopicItems(s, id));
  return <Session title={getTopic(id)?.name ?? "IPC"} items={items} mode="practica" exitHref="/ipc" />;
}

export type { IpcBlock };
