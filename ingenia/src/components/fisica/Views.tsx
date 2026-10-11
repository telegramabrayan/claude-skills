"use client";
/** Vistas de la Misión Física (diagnóstico, hoy, plan, simulador, análisis, fórmulas, prácticas). */
import { useMemo, useState } from "react";
import Link from "next/link";
import type { Difficulty } from "@/engine/types";
import { actions, store, useProgress } from "@/lib/store";
import { getTopic } from "@/content/topics";
import { getLesson } from "@/content/lessons";
import { materialFor } from "@/content/material";
import { AREAS, areasFor, areaImportance, type MissionArea } from "@/content/fisica/mission";
import { EXAM_MODELS, distinctModels, featureStats, FEATURE_LABELS, trapStats, type Parcial } from "@/content/fisica/parciales";
import { EXAM_CHECKLIST, FIS_FORMULAS, SIGN_CONVENTIONS, SOLVE_METHOD, type FisFormula } from "@/content/fisica/formulas";
import {
  areaReadiness,
  buildPlan,
  diagItems,
  diagResults,
  errorItems,
  freshGenerator,
  groupByWeek,
  importantItems,
  itemsFor,
  LEVEL_NAMES,
  practiceLevel,
  recentErrors,
  todayTraining,
  topicReadiness,
  type TrainingBlock,
} from "@/lib/fisicaMission";
import { ERROR_LABELS } from "@/content/topics";
import { Session, type SessionItem } from "../session/Session";
import { MathText } from "../math/MathText";
import { Whiteboard } from "../board/Whiteboard";
import { Widget as WidgetView } from "../widgets/Widget";
import { GuideSay, Nodo } from "../guide/Nodo";
import { subjectStyle } from "../ui/SubjectArt";
import { BackToMission, Bar, Flames, SectionCard } from "./ui";
import { ParcialMap } from "./Hub";

const FIS = subjectStyle("fisica");

// ───────────── Fórmulas ─────────────

type FTab = "intuicion" | "significa" | "cuando" | "ejemplo" | "error";

export function FormulaCard({ f, open: initial = false }: { f: FisFormula; open?: boolean }) {
  const [tab, setTab] = useState<FTab | null>(initial ? "intuicion" : null);
  const tabs: [FTab, string][] = [
    ["intuicion", "¿Qué pasa?"],
    ["significa", "¿Qué significa?"],
    ["cuando", "¿Cuándo usar?"],
    ["ejemplo", "Ejemplo"],
    ["error", "Error frecuente"],
  ];
  return (
    <article className="rounded-2xl border-2 border-line bg-surface p-4">
      <p className="text-xs font-black uppercase tracking-wide text-muted">{f.name}</p>
      <div className="my-2 text-xl">
        <MathText text={f.expr} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tabs.map(([k, l]) => (
          <button key={k} className={`chip !min-h-8 !px-2.5 !text-xs ${tab === k ? "!bg-primary !text-on-primary" : ""}`} onClick={() => setTab(tab === k ? null : k)} aria-expanded={tab === k}>
            {l}
          </button>
        ))}
      </div>
      {tab && (
        <div className="anim-pop mt-3 space-y-2 text-sm">
          {tab === "intuicion" && <MathText text={f.intuition} />}
          {tab === "significa" && (
            <>
              <MathText text={f.meaning} />
              <table className="w-full text-sm">
                <tbody>
                  {f.vars.map((v) => (
                    <tr key={v.sym} className="border-t border-line">
                      <td className="py-1 pr-2 font-bold">
                        <MathText text={v.sym} block={false} />
                      </td>
                      <td className="py-1 pr-2">{v.name}</td>
                      <td className="py-1 text-muted">
                        <MathText text={v.unit} block={false} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          {tab === "cuando" && (
            <>
              <p>
                <b>✅ Cuándo:</b> <MathText text={f.when} block={false} />
              </p>
              <p>
                <b>⛔ Cuándo no:</b> <MathText text={f.whenNot} block={false} />
              </p>
              <p>
                <b>🔍 Cómo reconocerla:</b> <MathText text={f.howToRecognize} block={false} />
              </p>
            </>
          )}
          {tab === "ejemplo" && (
            <>
              <MathText text={f.example.problem} />
              <Whiteboard steps={f.example.steps.map((x) => ({ expr: x }))} compact title="Resolución" />
              <p className="font-bold">
                Resultado: <MathText text={f.example.result} block={false} />
              </p>
            </>
          )}
          {tab === "error" && (
            <p className="rounded-xl bg-warn-soft p-3">
              ⚠️ <MathText text={f.commonError} block={false} />
            </p>
          )}
        </div>
      )}
      <Link href={`/fisica?vista=practicar&tema=${f.topicIds[0]}&gen=${f.generator}`} className="btn-3d is-secondary mt-3 !min-h-10 text-sm">
        INTENTAR EJERCICIO
      </Link>
    </article>
  );
}

export function formulasForArea(area: MissionArea | undefined): FisFormula[] {
  if (!area) return [];
  return FIS_FORMULAS.filter((f) => f.topicIds.some((t) => area.topics.includes(t)));
}

export function FormulasView() {
  const s = useProgress();
  const [all, setAll] = useState(false);
  const plan = buildPlan(s);
  const focus = plan[0]?.areas[0];
  const shown = all ? FIS_FORMULAS : formulasForArea(focus).slice(0, 6);
  const byArea = AREAS.map((a) => ({ a, fs: FIS_FORMULAS.filter((f) => f.topicIds.some((t) => a.topics.includes(t))) })).filter((x) => x.fs.length);
  return (
    <div className="space-y-4">
      <BackToMission />
      <h1 className="text-3xl font-black">📄 Fórmulas para el parcial</h1>
      <p className="text-muted">Cada fórmula con qué pasa físicamente, qué significa, cuándo usarla y cuándo no. {!all && focus ? `Primero, las de lo que estudiás hoy: ${focus.name.toLowerCase()}.` : ""}</p>
      {!all ? (
        <>
          <div className="grid gap-3 md:grid-cols-2">{(shown.length ? shown : FIS_FORMULAS.slice(0, 6)).map((f) => <FormulaCard key={f.id} f={f} />)}</div>
          <button className="btn-3d is-secondary" onClick={() => setAll(true)}>
            VER FORMULARIO COMPLETO ({FIS_FORMULAS.length})
          </button>
        </>
      ) : (
        byArea.map(({ a, fs }) => (
          <details key={a.id} className="card p-0" open={a.id === focus?.id}>
            <summary className="cursor-pointer list-none p-4 font-black">
              {a.icon} {a.name} <span className="text-sm text-muted">· {fs.length}</span>
            </summary>
            <div className="grid gap-3 border-t border-line p-4 md:grid-cols-2">
              {fs.map((f) => (
                <FormulaCard key={f.id} f={f} />
              ))}
            </div>
          </details>
        ))
      )}
    </div>
  );
}

// ───────────── Método y checklist ─────────────

export function MethodCard({ compact }: { compact?: boolean }) {
  return (
    <SectionCard title="Método de 6 pasos" icon="🧭">
      <ol className="space-y-2">
        {SOLVE_METHOD.map((m, i) => (
          <li key={m.step} className="flex gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full font-black text-white" style={{ background: "var(--c-physics)" }}>
              {i + 1}
            </span>
            <span>
              <span className="font-black">{m.step}</span>
              {!compact && (
                <span className="block text-sm text-muted">
                  <MathText text={m.detail} block={false} />
                </span>
              )}
              <span className="block text-sm italic">
                <MathText text={m.ask} block={false} />
              </span>
            </span>
          </li>
        ))}
      </ol>
    </SectionCard>
  );
}

export function Checklist({ onDone }: { onDone?: () => void }) {
  const [ok, setOk] = useState<boolean[]>(() => EXAM_CHECKLIST.map(() => false));
  return (
    <SectionCard title="Antes de entregar" icon="✅">
      <ul className="space-y-2">
        {EXAM_CHECKLIST.map((c, i) => (
          <li key={c}>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl p-2 hover:bg-surface-2">
              <input type="checkbox" className="mt-1 h-5 w-5 accent-[var(--c-physics)]" checked={ok[i]} onChange={() => setOk(ok.map((v, j) => (j === i ? !v : v)))} />
              <span className={ok[i] ? "text-muted line-through" : "font-semibold"}>
                <MathText text={c} block={false} />
              </span>
            </label>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-muted">Practicala en cada simulacro: el día del parcial tiene que salir sola.</p>
      {onDone && (
        <button className="btn-3d is-block mt-3" onClick={onDone} disabled={!ok.every(Boolean)}>
          {ok.every(Boolean) ? "PREPARACIÓN TERMINADA" : `Faltan ${ok.filter((v) => !v).length}`}
        </button>
      )}
    </SectionCard>
  );
}

// ───────────── Diagnóstico ─────────────

export function DiagnosticView() {
  const s = useProgress();
  const [stage, setStage] = useState<"intro" | "run" | "result">(s.fisica.diagStartedAt && s.fisica.diagDoneAt ? "result" : "intro");
  const items = useMemo(() => diagItems(), []);
  if (stage === "run")
    return <Session title="¿Qué tan preparado estás?" items={items} mode="diagnostico" onExit={() => setStage("result")} />;
  if (stage === "intro")
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <BackToMission />
        <div className="card p-6 text-center">
          <div className="flex justify-center">
            <Nodo mood="explain" size={100} body />
          </div>
          <h1 className="mt-2 text-3xl font-black">🎯 ¿Qué tan preparado estás?</h1>
          <p className="mt-2 text-muted">17 ejercicios cortos de despeje, unidades, trigonometría, vectores, gráficos, cinemática, estática, hidrostática, dinámica y energía. No es un examen: sirve para que tu plan empiece donde estás.</p>
          <p className="mt-2 text-sm font-semibold">Si no sabés uno, tocá «Seguir sin resolverlo». Contar la verdad hace el plan más útil.</p>
          <button
            className="btn-3d is-subject is-block mt-5 text-lg"
            style={FIS}
            onClick={() => {
              actions.updateFisica({ diagStartedAt: Date.now(), diagDoneAt: null });
              setStage("run");
            }}
          >
            EMPEZAR (≈ 20 MIN)
          </button>
        </div>
      </div>
    );
  const res = diagResults(s) ?? [];
  const hi = res.filter((r) => r.value < 0.4);
  const mid = res.filter((r) => r.value >= 0.4 && r.value < 0.75);
  const ok = res.filter((r) => r.value >= 0.75);
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <BackToMission />
      <h1 className="text-3xl font-black">Tu estado actual</h1>
      {res.length === 0 ? (
        <p className="card p-4">Todavía no hay respuestas del diagnóstico. <button className="font-bold text-primary underline" onClick={() => setStage("intro")}>Empezarlo</button></p>
      ) : (
        <>
          <div className="card space-y-3 p-5">
            {res.map((r) => (
              <Bar key={r.area} value={r.value} label={r.area} sub={`${r.ok} de ${r.total} bien en el diagnóstico`} />
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["🔴 Prioridad alta", hi],
              ["🟡 Necesitás repaso", mid],
              ["🟢 Buen nivel", ok],
            ].map(([t, l]) => (
              <div key={t as string} className="card p-4">
                <p className="font-black">{t as string}</p>
                {(l as typeof res).length ? (l as typeof res).map((r) => <p key={r.area} className="text-sm">{r.area}</p>) : <p className="text-sm text-muted">—</p>}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted">Es una estimación inicial con 1 o 2 ejercicios por área: se ajusta sola con cada cosa que practiques.</p>
          <Link href="/fisica?vista=plan" className="btn-3d is-subject is-block text-lg" style={FIS} onClick={() => actions.updateFisica({ diagDoneAt: Date.now() })}>
            CREAR MI PLAN HASTA EL 5/11
          </Link>
          <button className="btn btn-ghost w-full text-sm" onClick={() => setStage("intro")}>
            Repetir el diagnóstico
          </button>
        </>
      )}
    </div>
  );
}

// ───────────── Plan ─────────────

export function PlanView() {
  const s = useProgress();
  const weeks = groupByWeek(buildPlan(s));
  const fmt = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "numeric" });
  return (
    <div className="space-y-4">
      <BackToMission />
      <h1 className="text-3xl font-black">📅 Mi camino hasta el parcial</h1>
      <p className="text-muted">Se recalcula todos los días con tus resultados: si un tema ya lo dominás, le da menos tiempo; si algo te cuesta, le da más. Si un día no estudiás, se reacomoda solo.</p>
      {weeks.map((w) => (
        <section key={w.label}>
          <h2 className="mb-2 text-lg font-black">{w.label}</h2>
          <div className="space-y-2">
            {w.days.map((d) => (
              <div key={d.date} className={`card flex gap-3 p-4 ${d.isToday ? "!border-[color:var(--c-physics)] ring-2 ring-[color:var(--c-physics)]/30" : ""}`}>
                <div className="w-16 shrink-0 text-center">
                  <p className="text-xs font-black uppercase text-muted">{fmt(d.date)}</p>
                  <p className="text-2xl" aria-hidden>
                    {d.done ? "✅" : d.simulacro ? "📝" : d.areas[0]?.icon ?? "🧠"}
                  </p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-black">
                    {d.isToday && <span className="mr-1 rounded bg-[color:var(--c-physics)] px-1.5 py-0.5 text-xs text-white">HOY</span>}
                    {d.title}
                  </p>
                  <ul className="mt-1 text-sm text-muted">
                    {d.tasks.map((t) => (
                      <li key={t}>• {t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// ───────────── Entrenamiento de hoy ─────────────

const QU_BY_AREA: Record<string, string> = { energia: "fis-que-usarias-energia", hidro: "fis-que-usarias-hidro", dinamica: "fis-que-usarias-dinamica", estatica: "fis-que-usarias-dinamica", rigido: "fis-que-usarias-dinamica", vectores: "fis-que-usarias-dinamica" };

export function queUsariasItems(areaId: string | undefined, n = 3): SessionItem[] {
  const gen = QU_BY_AREA[areaId ?? ""] ?? "fis-que-usarias-cinematica";
  const topic = gen.endsWith("energia") ? "t-energia" : gen.endsWith("hidro") ? "t-presion" : gen.endsWith("dinamica") ? "t-newton" : "t-mruv";
  return Array.from({ length: n }, (_, i) => ({ topicId: topic, generator: gen, difficulty: (2 + i) as Difficulty, label: "¿Qué usarías?" }));
}

export function TodayView({ minutes }: { minutes: number }) {
  const s = useProgress();
  const blocks = useMemo(() => todayTraining(store.getState(), minutes), [minutes]); // eslint-disable-line react-hooks/exhaustive-deps
  const today = buildPlan(s)[0]?.date;
  const doneToday = s.fisica.done[today ?? ""] ?? [];
  const [i, setI] = useState(() => Math.max(0, blocks.findIndex((b) => !doneToday.includes(b.id))));
  const next = () => {
    actions.markFisicaStep(blocks[i].id);
    setI((n) => n + 1);
  };
  if (i >= blocks.length || i < 0)
    return (
      <div className="mx-auto max-w-xl space-y-4 text-center">
        <div className="card p-6">
          <div className="flex justify-center">
            <Nodo mood="celebrate" size={110} body />
          </div>
          <h1 className="mt-2 text-3xl font-black">¡Entrenamiento de hoy completo!</h1>
          <p className="mt-2 text-muted">Lo que hiciste ya está en tu preparación. Mañana el plan se ajusta con estos resultados.</p>
          <Link href="/fisica" className="btn-3d is-subject mt-4" style={FIS}>
            VOLVER A LA MISIÓN
          </Link>
        </div>
      </div>
    );
  const b = blocks[i];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/fisica" className="btn btn-ghost !px-2" aria-label="Salir">
          ✕
        </Link>
        <div className="flex flex-1 gap-1" aria-label={`Paso ${i + 1} de ${blocks.length}`}>
          {blocks.map((x, k) => (
            <span key={x.id} className="h-2.5 flex-1 rounded-full" style={{ background: k < i ? "var(--c-physics)" : k === i ? "color-mix(in srgb, var(--c-physics) 50%, transparent)" : "var(--surface-2)" }} />
          ))}
        </div>
      </div>
      <p className="text-sm font-black uppercase tracking-wide text-muted">
        {b.icon} Paso {i + 1} de {blocks.length} · {b.title} · {b.minutes} min
      </p>
      <BlockRunner key={`${b.id}-${i}`} b={b} onDone={next} />
    </div>
  );
}

function BlockRunner({ b, onDone }: { b: TrainingBlock; onDone: () => void }) {
  if (b.items?.length) return <Session title={b.title} items={b.items} mode="practica" onExit={onDone} />;
  if (b.id === "quetest") return <Session title="¿Qué usarías?" items={queUsariasItems(b.areaId)} mode="practica" onExit={onDone} />;
  if (b.id === "checklist") return <Checklist onDone={onDone} />;
  if (b.id === "simulacro")
    return (
      <div className="card space-y-3 p-5">
        <p>Hoy toca simulacro. Hacelo en modo realista o examen y, al terminar, volvé para el plan de recuperación.</p>
        <Link href={`/fisica?vista=simulacro&parcial=${b.simulacro}`} className="btn-3d is-subject" style={FIS} onClick={onDone}>
          IR AL SIMULADOR
        </Link>
      </div>
    );
  // Concepto / fórmulas: intuición → fórmula → cuándo usarla.
  const area = AREAS.find((a) => a.id === b.areaId);
  const fs = b.id === "formulas" ? FIS_FORMULAS.filter((f) => f.parcial.length).slice(0, 8) : formulasForArea(area).slice(0, 3);
  const lesson = b.topicId ? getLesson(getTopic(b.topicId)?.lessonId ?? "") : undefined;
  return (
    <div className="space-y-3">
      {area && (
        <GuideSay mood="explain" size={48}>
          Primero entendamos qué pasa físicamente en <b>{area.name.toLowerCase()}</b>. Tocá «¿Qué pasa?» en cada fórmula antes de mirarla.
        </GuideSay>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        {fs.map((f, k) => (
          <FormulaCard key={f.id} f={f} open={k === 0} />
        ))}
      </div>
      {lesson && (
        <Link href={`/leccion/${lesson.id}`} className="tile">
          📖 <span className="flex-1 font-bold">Lección completa: {lesson.title}</span> <span className="text-sm text-muted">{lesson.estimatedMinutes} min</span>
        </Link>
      )}
      <button className="btn-3d is-subject is-block" style={FIS} onClick={onDone}>
        ENTENDIDO, SIGAMOS
      </button>
    </div>
  );
}

// ───────────── Simulador ─────────────

type SimMode = "aprendizaje" | "realista" | "examen";

export function SimulatorView({ parcial: p0 }: { parcial?: string }) {
  const s = useProgress();
  const [parcial, setParcial] = useState<"1P" | "2P" | "sorpresa">(p0 === "2P" ? "2P" : p0 === "sorpresa" ? "sorpresa" : "1P");
  const [mode, setMode] = useState<SimMode>("realista");
  const [run, setRun] = useState<{ items: SessionItem[]; title: string; minutes: number } | null>(null);
  const mat = materialFor("fisica");
  const build = () => {
    const st = store.getState();
    const bp = (id: string) => mat?.blueprints?.find((b) => b.id === id);
    let items: SessionItem[];
    let minutes = 90;
    if (parcial === "sorpresa") {
      const pool = [...(bp("fis-1p")?.items ?? []), ...(bp("fis-2p")?.items ?? [])];
      items = [...pool].sort(() => Math.random() - 0.5).slice(0, 8).map((it) => ({ topicId: it.topicId, difficulty: 5 as Difficulty, points: it.points, generator: freshGenerator(st, it.topicId, Math.floor(Math.random() * 5)) }));
    } else {
      const b = bp(parcial === "1P" ? "fis-1p" : "fis-2p");
      minutes = b?.minutes ?? 90;
      items = (b?.items ?? []).map((it, k) => ({ topicId: it.topicId, label: mode === "aprendizaje" ? it.label : undefined, points: it.points, difficulty: (k % 3 === 2 ? 6 : 5) as Difficulty, generator: freshGenerator(st, it.topicId, k) }));
    }
    setRun({ items, minutes, title: `Física · Simulacro ${parcial === "sorpresa" ? "sorpresa" : parcial} · ${mode}` });
  };
  if (run)
    return (
      <Session
        title={run.title}
        items={run.items}
        mode="examen"
        kind={mode === "examen" ? "examen" : "practica"}
        minutes={mode === "examen" ? run.minutes : undefined}
        noHelp={mode === "realista"}
        saveRecord
        exitHref="/fisica"
        recovery={{ href: "/fisica?vista=errores", label: "COMENZAR REFUERZO" }}
      />
    );
  const history = s.exams.filter((e) => e.title.startsWith("Física")).slice(-5).reverse();
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <BackToMission />
      <h1 className="text-3xl font-black">📝 Simulador de parcial</h1>
      <p className="text-muted">Parciales nuevos con la estructura, los temas y los puntajes de los modelos de la cátedra. Ningún ejercicio es copia de un examen.</p>
      <div className="card space-y-4 p-5">
        <div>
          <p className="mb-2 font-black">¿Qué parcial?</p>
          <div className="grid grid-cols-3 gap-2" role="radiogroup">
            {(
              [
                ["1P", "1.er parcial"],
                ["2P", "2.º parcial"],
                ["sorpresa", "🎲 Sorpresa"],
              ] as const
            ).map(([k, l]) => (
              <button key={k} role="radio" aria-checked={parcial === k} className="tile justify-center !text-sm" onClick={() => setParcial(k)}>
                {l}
              </button>
            ))}
          </div>
          {parcial === "sorpresa" && <p className="mt-2 text-xs text-muted">Mezcla temas de los dos parciales sin decirte cuáles: así no sabés qué fórmula usar por estar en una unidad.</p>}
        </div>
        <div>
          <p className="mb-2 font-black">Modo</p>
          <div className="grid gap-2 sm:grid-cols-3" role="radiogroup">
            {(
              [
                ["aprendizaje", "Aprendizaje", "Con pistas y explicaciones"],
                ["realista", "Realista", "Sin pistas, sin reloj"],
                ["examen", "Examen", "Cronómetro + sin ayudas"],
              ] as const
            ).map(([k, l, d]) => (
              <button key={k} role="radio" aria-checked={mode === k} className="tile !items-start flex-col !gap-0 text-left" onClick={() => setMode(k)}>
                <span className="font-black">{l}</span>
                <span className="text-xs text-muted">{d}</span>
              </button>
            ))}
          </div>
        </div>
        <button className="btn-3d is-subject is-block text-lg" style={FIS} onClick={build}>
          EMPEZAR SIMULACRO
        </button>
      </div>
      {history.length > 0 && (
        <SectionCard title="Tus simulacros" icon="📊">
          <ul className="space-y-1 text-sm">
            {history.map((e) => (
              <li key={e.id} className="flex justify-between">
                <span>{e.title.replace("Física · ", "")}</span>
                <span className="font-black">
                  {e.score}/10 · {Math.round(e.seconds / 60)} min
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </div>
  );
}

// ───────────── Análisis de parciales ─────────────

function areaShare(area: MissionArea, p?: Parcial) {
  const ms = distinctModels(p);
  const n = ms.filter((m) => m.exercises.some((e) => e.items.some((it) => area.topics.includes(it.topicId)))).length;
  return { n, total: ms.length };
}

export function ModelsView() {
  const [open, setOpen] = useState<string | null>(null);
  const [p, setP] = useState<Parcial | undefined>(undefined);
  const areas = AREAS.filter((a) => a.id !== "fundamentos" && a.id !== "trig")
    .map((a) => ({ a, ...areaShare(a, p) }))
    .filter((x) => x.n > 0)
    .sort((x, y) => y.n - x.n);
  const feats = featureStats(p);
  const traps = trapStats(p);
  return (
    <div className="space-y-5">
      <BackToMission />
      <h1 className="text-3xl font-black">🧠 Análisis de los parciales</h1>
      <p className="text-muted">
        Calculado sobre los {EXAM_MODELS.length} modelos cargados (claves de la cátedra Torti, 2023): {distinctModels().length} exámenes distintos, porque algunos temas son el mismo examen con otros números. Es material de 2023: la cátedra 2026 puede cambiar algo.
      </p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Parcial">
        {(
          [
            [undefined, "Todos"],
            ["1P", "1.er parcial"],
            ["2P", "2.º parcial"],
            ["final", "Final"],
          ] as const
        ).map(([k, l]) => (
          <button key={l} role="radio" aria-checked={p === k} className="tile !min-h-9 !px-3 !py-1 text-sm" onClick={() => setP(k)}>
            {l}
          </button>
        ))}
      </div>
      <SectionCard title="Lo que más aparece" icon="🔥">
        <div className="space-y-2">
          {areas.map(({ a, n, total }) => (
            <Bar key={a.id} value={n / total} label={`${a.icon} ${a.name}`} right={`${n}/${total} · ${Math.round((n / total) * 100)} %`} color="var(--c-physics)" />
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Cómo son los ejercicios" icon="🧩">
        <ul className="space-y-1.5 text-sm">
          {feats.filter((f) => f.count > 0).map((f) => (
            <li key={f.feature} className="flex justify-between gap-2">
              <span>{FEATURE_LABELS[f.feature]}</span>
              <span className="shrink-0 font-black">
                {f.count}/{f.total} ({Math.round(f.share * 100)} %)
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted">Sobre los ejercicios de exámenes distintos. Conclusión: entrená leer datos en figuras, convertir unidades y usar un resultado en el ítem siguiente.</p>
      </SectionCard>
      <SectionCard title="Trampas frecuentes" icon="⚠️">
        <ul className="space-y-2">
          {traps.map((t) => (
            <li key={t.key} className="flex items-center justify-between gap-2 text-sm">
              <span>{t.label}</span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="font-black">{t.count} ej.</span>
                {getTopic(t.topic) && (
                  <Link className="chip hover:!bg-primary-soft" href={`/fisica?vista=practicar&tema=${t.topic}`}>
                    Entrenar
                  </Link>
                )}
              </span>
            </li>
          ))}
        </ul>
      </SectionCard>
      <SectionCard title="Aprender con cada parcial" icon="📚">
        <ul className="space-y-2">
          {EXAM_MODELS.filter((m) => !m.twinOf && (!p || m.parcial === p)).map((m) => (
            <li key={m.id} className="rounded-xl border-2 border-line">
              <button className="flex w-full items-center justify-between p-3 text-left font-black" onClick={() => setOpen(open === m.id ? null : m.id)} aria-expanded={open === m.id}>
                {m.titulo} <span className="text-sm text-muted">{m.exercises.length} ej. ▾</span>
              </button>
              {open === m.id && (
                <div className="space-y-3 border-t border-line p-3">
                  {m.exercises.map((e) => (
                    <div key={e.n} className="rounded-xl bg-surface-2 p-3 text-sm">
                      <p className="font-black">
                        Ejercicio {e.n} · {e.subtema}
                      </p>
                      <p className="italic text-muted">{e.resumen}</p>
                      <p className="mt-1">
                        <b>Qué evalúa:</b> {e.items.map((it) => it.pide).join("; ")}.
                      </p>
                      <p>
                        <b>Cómo reconocerlo y estrategia:</b> {e.razonamiento}
                      </p>
                      <p>
                        <b>Relaciones:</b> {e.formulas.join(" · ")}
                      </p>
                      <p>
                        <b>Necesitás antes:</b> {e.previos.map((t) => getTopic(t)?.name ?? t).join(", ")}
                      </p>
                      <p>
                        <b>Errores frecuentes:</b> {e.trampas.join("; ")}.
                      </p>
                      <p className="text-xs text-muted">
                        Dificultad {e.dificultad}/5 · {e.pasos} pasos · unidades: {e.unidades.join(", ")}
                      </p>
                      <Link className="btn-3d is-secondary mt-2 !min-h-9 text-xs" href={`/fisica?vista=practicar&tema=${e.items[0].topicId}&nivel=4`}>
                        RESOLVER UNO EQUIVALENTE
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}

// ───────────── Tema (área) ─────────────

const AREA_WIDGET: Record<string, Parameters<typeof WidgetView>[0]["widget"]> = {
  vectores: { type: "vector-components", mag: 40, angle: 125 },
  mru: { type: "motion", v0: 15, a: 0 },
  mruv: { type: "motion", v0: 0, a: 2 },
  caida: { type: "projectile", v0: 15, angle: 90, h0: 0 },
  tiro: { type: "projectile", v0: 20, angle: 40, h0: 1.5 },
  dinamica: { type: "forces", angle: 30, mu: 0.3, mass: 5 },
  hidro: { type: "buoyancy", body: 0.6, liquid: 1 },
};

export function AreaView({ id }: { id: string }) {
  const s = useProgress();
  const area = AREAS.find((a) => a.id === id);
  if (!area) return <p>Tema no encontrado.</p>;
  const r = areaReadiness(s, area);
  const w = AREA_WIDGET[area.id];
  return (
    <div className="space-y-4">
      <BackToMission />
      <header className="card-hero p-5" style={FIS}>
        <p className="hero-muted text-sm font-black uppercase text-white/85">{area.parciales.map((p) => (p === "1P" ? "1.er parcial" : "2.º parcial")).join(" · ")}</p>
        <h1 className="text-3xl font-black">
          {area.icon} {area.name}
        </h1>
        <p className="mt-1 text-sm font-bold">
          Importancia <Flames n={areaImportance(area)} /> · Tu nivel: {r === null ? "sin datos" : `${Math.round(r * 100)} %`}
        </p>
        {area.note && <p className="hero-muted mt-1 text-sm text-white/85">{area.note}</p>}
        {area.needsVerification && <p className="hero-muted text-xs text-white/85">* Ubicación en el parcial a verificar con la cátedra 2026.</p>}
      </header>
      {w && (
        <SectionCard title="Primero, mirá qué pasa" icon="🧪">
          <WidgetView widget={w} />
        </SectionCard>
      )}
      <SectionCard title="Practicar por niveles" icon="🪜">
        <div className="space-y-4">
          {area.topics.filter((t) => getTopic(t)).map((t) => {
            const tr = topicReadiness(s, t);
            const rec = practiceLevel(tr.value);
            const lesson = getLesson(getTopic(t)?.lessonId ?? "");
            return (
              <div key={t}>
                <Bar value={tr.value} label={getTopic(t)?.name} sub={tr.attempts ? `${tr.attempts} ejercicios hechos` : "Todavía no practicaste este tema"} />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Link key={n} href={`/fisica?vista=practicar&tema=${t}&nivel=${n}`} className={`tile !min-h-9 !px-2.5 !py-1 text-xs ${n === rec ? "is-selected" : ""}`}>
                      N{n} · {LEVEL_NAMES[n]}
                    </Link>
                  ))}
                  {lesson && (
                    <Link href={`/leccion/${lesson.id}`} className="tile !min-h-9 !px-2.5 !py-1 text-xs">
                      📖 Lección
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted">N1 entender · N2 aplicar · N3 combinar · N4 tipo parcial · N5 desafío. Si resolvés N5, N4 se siente manejable.</p>
      </SectionCard>
      <SectionCard title="Fórmulas del tema" icon="📄">
        <div className="grid gap-3 md:grid-cols-2">
          {formulasForArea(area).map((f) => (
            <FormulaCard key={f.id} f={f} />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ───────────── Prácticas ─────────────

export function PracticeView({ tema, nivel, gen }: { tema: string; nivel?: number; gen?: string }) {
  const items = useMemo(() => {
    const st = store.getState();
    const lvl = (nivel ?? practiceLevel(topicReadiness(st, tema).value)) as 1 | 2 | 3 | 4 | 5;
    const base = itemsFor(st, tema, 6, lvl, undefined, !nivel);
    return gen ? base.map((it, i) => ({ ...it, generator: i < 3 ? gen : it.generator })) : base;
  }, [tema, nivel, gen]);
  if (!getTopic(tema)) return <p>Tema no encontrado.</p>;
  return <Session title={getTopic(tema)?.name ?? "Práctica"} items={items} mode="practica" exitHref="/fisica" />;
}

export function ErrorsView() {
  const s = useProgress();
  const [go, setGo] = useState(false);
  const errs = recentErrors(s);
  const items = useMemo(() => errorItems(store.getState(), 10), [go]); // eslint-disable-line react-hooks/exhaustive-deps
  if (go && items.length) return <Session title="Practicar mis errores" items={items} mode="repaso" exitHref="/fisica" />;
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <BackToMission />
      <h1 className="text-3xl font-black">❌ Practicar mis errores</h1>
      {errs.length ? (
        <>
          <ul className="card space-y-2 p-4">
            {errs.slice(0, 8).map((e) => (
              <li key={`${e.topicId}${e.errorType}`} className="flex justify-between gap-2 text-sm">
                <span>
                  <b>{getTopic(e.topicId)?.name}</b>
                  {e.errorType && <span className="text-muted"> · {ERROR_LABELS[e.errorType as keyof typeof ERROR_LABELS] ?? e.errorType}</span>}
                </span>
                <span className="font-black">{e.count}×</span>
              </li>
            ))}
          </ul>
          <button className="btn-3d is-subject is-block text-lg" style={FIS} onClick={() => setGo(true)}>
            PRACTICAR (10 EJERCICIOS)
          </button>
        </>
      ) : (
        <GuideSay mood="happy">Todavía no tenés errores registrados en Física (últimos 30 días). Cuando te equivoques, acá aparecen ejercicios elegidos para corregirlo.</GuideSay>
      )}
    </div>
  );
}

export function QuickSessionView({ kind }: { kind: "importante" | "5min" | "queusarias" | "signos" | "unidades" | "graficos" }) {
  const items = useMemo((): SessionItem[] => {
    const st = store.getState();
    switch (kind) {
      case "importante":
        return importantItems(st, 10);
      case "5min": {
        const errs = errorItems(st, 1);
        return [...queUsariasItems(buildPlan(st)[0]?.areas[0]?.id, 1), ...importantItems(st, 2), ...(errs.length ? errs : importantItems(st, 1))];
      }
      case "queusarias":
        return [...queUsariasItems("mruv", 2), ...queUsariasItems("dinamica", 2), ...queUsariasItems("energia", 2), ...queUsariasItems("hidro", 2)];
      case "signos":
        return getTopic("t-fis-signos") ? itemsFor(st, "t-fis-signos", 6, 1) : itemsFor(st, "t-mruv", 6, 2);
      case "unidades":
        return itemsFor(st, "t-unidades", 8, 1);
      case "graficos":
        return itemsFor(st, "t-graficos-vt", 8, 1);
    }
  }, [kind]);
  const title = { importante: "🔥 Lo más importante", "5min": "⚡ 5 minutos", queusarias: "🔍 ¿Qué usarías?", signos: "± Signos", unidades: "📏 Unidades", graficos: "📈 Gráficos x(t) y v(t)" }[kind];
  if (kind === "signos") return <SignsView items={items} />;
  return <Session title={title} items={items} mode="practica" exitHref="/fisica" />;
}

function SignsView({ items }: { items: SessionItem[] }) {
  const [go, setGo] = useState(false);
  if (go) return <Session title="± Signos" items={items} mode="practica" exitHref="/fisica" />;
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <BackToMission />
      <h1 className="text-3xl font-black">± ¿Por qué cambian los signos?</h1>
      {SIGN_CONVENTIONS.map((c) => (
        <div key={c.title} className="card p-4">
          <p className="font-black">{c.title}</p>
          <MathText text={c.body} />
        </div>
      ))}
      <button className="btn-3d is-subject is-block text-lg" style={FIS} onClick={() => setGo(true)}>
        PRACTICAR SIGNOS
      </button>
    </div>
  );
}

export function SimulationsView() {
  const list: { title: string; text: string; widget: Parameters<typeof WidgetView>[0]["widget"] }[] = [
    { title: "MRU y MRUV", text: "Marcas cada segundo: iguales si la velocidad es constante, cada vez más separadas si acelera.", widget: { type: "motion", v0: 4, a: 2 } },
    { title: "Caída libre y tiro vertical", text: "Lanzá hacia arriba: la velocidad baja 9,80 m/s cada segundo, se anula arriba y vuelve.", widget: { type: "projectile", v0: 15, angle: 90, h0: 0 } },
    { title: "Tiro oblicuo", text: "Separado en x (velocidad constante) e y (caída libre).", widget: { type: "projectile", v0: 20, angle: 40, h0: 2 } },
    { title: "Vectores y componentes", text: "Cambiá módulo y ángulo: Fx = F·cos θ, Fy = F·sen θ.", widget: { type: "vector-components", mag: 40, angle: 35 } },
    { title: "Fuerzas en el plano inclinado", text: "Peso, normal y rozamiento: cuándo arranca y con qué aceleración.", widget: { type: "forces", angle: 30, mu: 0.3, mass: 5 } },
    { title: "Flotación", text: "Fracción sumergida = densidad del cuerpo / densidad del líquido.", widget: { type: "buoyancy", body: 0.75, liquid: 1 } },
  ];
  return (
    <div className="space-y-4">
      <BackToMission />
      <h1 className="text-3xl font-black">🧪 Simulaciones del parcial</h1>
      {list.map((x) => (
        <SectionCard key={x.title} title={x.title}>
          <p className="mb-3 text-sm text-muted">{x.text}</p>
          <WidgetView widget={x.widget} />
        </SectionCard>
      ))}
    </div>
  );
}

export function MaterialView() {
  const s = useProgress();
  const sims = s.exams.filter((e) => e.title.startsWith("Física"));
  const errs = recentErrors(s);
  return (
    <div className="space-y-4">
      <BackToMission />
      <h1 className="text-3xl font-black">📚 Material para el parcial</h1>
      {(["1P", "2P"] as const).map((p) => (
        <SectionCard key={p} title={p === "1P" ? "Primer parcial" : "Segundo parcial"} icon="🗂️">
          <ul className="space-y-3">
            {areasFor(p).map((a) => (
              <li key={a.id} className="rounded-xl bg-surface-2 p-3">
                <p className="font-black">
                  {a.icon} {a.name}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                  <Link className="chip" href={`/fisica?vista=tema&id=${a.id}`}>Teoría y niveles</Link>
                  {a.topics.map((t) => {
                    const l = getLesson(getTopic(t)?.lessonId ?? "");
                    return l ? (
                      <Link key={t} className="chip" href={`/leccion/${l.id}`}>
                        📖 {l.title}
                      </Link>
                    ) : null;
                  })}
                  <span className="chip">📄 {formulasForArea(a).length} fórmulas</span>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      ))}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/fisica?vista=formulas" className="tile">📄 Formulario completo</Link>
        <Link href="/fisica?vista=modelos" className="tile">🧠 Modelos analizados ({EXAM_MODELS.length})</Link>
        <Link href="/fisica?vista=errores" className="tile">❌ Mis errores ({errs.length})</Link>
        <Link href="/fisica?vista=simulacro" className="tile">📝 Simulacros hechos ({sims.length})</Link>
        <Link href="/guardados" className="tile">📝 Mis notas y guardados</Link>
        <Link href="/biblioteca?materia=fisica" className="tile">📚 Biblioteca de la cátedra</Link>
      </div>
    </div>
  );
}

export function PreparcialMap() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ParcialMap p="1P" />
      <ParcialMap p="2P" />
    </div>
  );
}

export { Flames };
