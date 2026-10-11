"use client";
/** Centro de la Misión Física: "HOY TE TOCA ESTO" y todo lo demás a un toque. */
import { useEffect, useState } from "react";
import Link from "next/link";
import { actions, useProgress } from "@/lib/store";
import { currentStreak } from "@/engine/progress/rules";
import { getTopic } from "@/content/topics";
import { AREAS, areaImportance, areasFor } from "@/content/fisica/mission";
import {
  areaReadiness,
  buildPlan,
  daysLeft,
  globalReadiness,
  hoursStudied,
  masteredCount,
  missedDays,
  nextLevelAdvice,
  parcialReadiness,
  phaseFor,
  PHASE_INFO,
  rankedAreas,
  todayTraining,
  weeklyEvolution,
  weeklyGoals,
} from "@/lib/fisicaMission";
import { subjectStyle } from "../ui/SubjectArt";
import { Nodo } from "../guide/Nodo";
import { useSubjectTheme } from "@/lib/subjectTheme";
import { Bar, Countdown, Flames, LevelBadge, SectionCard } from "./ui";

const MINUTES = [10, 20, 30, 45, 60, 90];

function readMinutes(): number {
  try {
    return Number(localStorage.getItem("ingenia:fisica:min")) || 35;
  } catch {
    return 35;
  }
}

export function FisicaHub() {
  const s = useProgress();
  useSubjectTheme("fisica");
  const [minutes, setMinutes] = useState(35);
  useEffect(() => setMinutes(readMinutes()), []);
  const g = globalReadiness(s);
  useEffect(() => actions.snapshotFisica(Math.round(g * 1000) / 1000), [g]);
  const left = daysLeft();
  const phase = phaseFor(left);
  const blocks = todayTraining(s, minutes);
  const plan = buildPlan(s);
  const today = plan[0];
  const p1 = parcialReadiness(s, "1P");
  const p2 = parcialReadiness(s, "2P");
  const { mastered, total, weak } = masteredCount(s);
  const missed = missedDays(s);
  const doneToday = s.fisica.done[plan[0]?.date ?? ""] ?? [];
  const evo = weeklyEvolution(s);
  const pick = (m: number) => {
    setMinutes(m);
    try {
      localStorage.setItem("ingenia:fisica:min", String(m));
    } catch {
      /* sin almacenamiento */
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <section className="card-hero" style={subjectStyle("fisica")}>
        <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:p-7">
          <div>
            <p className="hero-muted text-sm font-black uppercase tracking-wider text-white/85">⚡ Física — 2.º parcial 5/11 · 1.er parcial 6/11</p>
            <h1 className="mt-1 text-3xl font-black leading-tight sm:text-4xl">Misión: aprobar Física</h1>
            <p className="hero-muted mt-1 max-w-prose text-white/85">Prepararte desde tu nivel actual para llegar al 5/11 (2.º parcial) y al 6/11 (1.er parcial) con los conocimientos y la práctica necesarios. Cátedra Torti. Primero entender, después practicar como en el parcial.</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-bold">
              <span className="rounded-full bg-white/15 px-3 py-1">🔥 {currentStreak(s)} días seguidos</span>
              <span className="rounded-full bg-white/15 px-3 py-1">⏱ {hoursStudied(s).toFixed(1).replace(".", ",")} h de Física</span>
              <span className="rounded-full bg-white/15 px-3 py-1">✅ {mastered}/{total} temas dominados</span>
              <span className="rounded-full bg-white/15 px-3 py-1">🩹 {weak} a reforzar</span>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="hero-muted text-xs font-black uppercase text-white/85">Faltan</p>
            <Countdown big />
            <p className="hero-muted mt-1 text-sm font-bold text-white/85">
              {PHASE_INFO[phase].icon} {PHASE_INFO[phase].title}
            </p>
          </div>
        </div>
      </section>

      <ExamDates />

      {missed > 0 && (
        <p className="flex items-center gap-2 rounded-2xl border-2 border-line bg-surface p-3 text-sm font-semibold">
          <Nodo mood="encourage" size={36} /> Cambiamos un poco el plan para aprovechar los días que quedan. Seguimos desde acá.
        </p>
      )}

      {!s.fisica.diagDoneAt && (
        <Link href="/fisica?vista=diagnostico" className="tile !items-center !border-[color:var(--c-physics)]">
          <span className="text-3xl" aria-hidden>🎯</span>
          <span className="flex-1">
            <span className="block text-lg font-black">¿Qué tan preparado estás?</span>
            <span className="text-sm font-medium text-muted">Antes de armar tu plan: 17 ejercicios cortos (unos 20 min). No es un examen: sirve para saber por dónde empezar.</span>
          </span>
          <span className="btn-3d is-subject" style={subjectStyle("fisica")}>EMPEZAR</span>
        </Link>
      )}

      {/* Hoy te toca */}
      <SectionCard title={phase === "pre-parcial" ? "Repaso pre-parcial" : "Entrenamiento de hoy"} icon="⚡">
        <p className="mb-3 text-sm font-semibold text-muted">
          {today ? `Plan de hoy: ${today.title}.` : ""} {PHASE_INFO[phase].text}
        </p>
        <div className="mb-3">
          <p className="mb-1 text-xs font-black uppercase text-muted">¿Cuánto tiempo tenés hoy?</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Minutos disponibles">
            {MINUTES.map((m) => (
              <button key={m} role="radio" aria-checked={minutes === m} onClick={() => pick(m)} className="tile !min-h-10 !px-3 !py-1 text-sm">
                {m < 60 ? `${m} min` : m === 60 ? "1 hora" : "90 min"}
              </button>
            ))}
          </div>
        </div>
        <ol className="space-y-2">
          {blocks.map((b) => (
            <li key={`${b.id}-${b.title}`} className="flex items-center gap-3 rounded-xl bg-surface-2 p-3">
              <span className="text-2xl" aria-hidden>{b.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-black">{b.title}</span>
                <span className="text-xs text-muted">{b.detail}</span>
              </span>
              <span className="shrink-0 text-sm font-bold text-muted">{doneToday.includes(b.id) ? "✓" : `${b.minutes} min`}</span>
            </li>
          ))}
        </ol>
        <p className="mt-2 text-xs text-muted">Tiempo estimado: {blocks.reduce((a, b) => a + b.minutes, 0)} minutos.</p>
        <Link href={`/fisica?vista=hoy&min=${minutes}`} className="btn-3d is-subject is-block mt-4 text-lg" style={subjectStyle("fisica")}>
          {doneToday.length ? "SEGUIR CON LO DE HOY" : "COMENZAR"}
        </Link>
      </SectionCard>

      {/* Preparación */}
      <SectionCard title="Preparación para el parcial" icon="🎯" action={<LevelBadge value={g} />}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Bar value={p1.value} label="Primer parcial" sub={`${Math.round(p1.coverage * 100)} % de los temas con práctica`} />
          <Bar value={p2.value} label="Segundo parcial" sub={`${Math.round(p2.coverage * 100)} % de los temas con práctica`} />
          <Bar value={g} label="Global" />
        </div>
        <div className="mt-4 rounded-xl bg-surface-2 p-3 text-sm">
          <p className="font-black">Para subir de nivel:</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            {nextLevelAdvice(s).map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">Se calcula con tus resultados reales: dominio, ejercicios tipo parcial, simulacros, ayudas usadas y cuánto hace que no practicás cada tema. No es una probabilidad de aprobar.</p>
        </div>
      </SectionCard>

      {/* Modos */}
      <section>
        <h2 className="mb-3 text-lg font-black">Entrenar</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {MODES.map((m) => (
            <Link key={m.href} href={m.href} className="tile !items-start flex-col !gap-0.5">
              <span className="text-2xl" aria-hidden>{m.icon}</span>
              <span className="font-black leading-tight">{m.title}</span>
              <span className="text-xs font-semibold text-muted">{m.text}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Objetivos semanales */}
      <SectionCard title="Esta semana" icon="📋">
        <ul className="space-y-3">
          {weeklyGoals(s).map((w) => (
            <li key={w.label}>
              <Bar value={w.progress} label={`${w.progress >= 1 ? "☑" : "☐"} ${w.label}`} right={w.detail} color={w.progress >= 1 ? "var(--success)" : "var(--c-physics)"} />
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Mapas */}
      <div className="grid gap-4 md:grid-cols-2">
        <ParcialMap p="1P" />
        <ParcialMap p="2P" />
      </div>

      {/* Importancia */}
      <SectionCard title="Qué tan importante es" icon="🔥" action={<Link href="/fisica?vista=modelos" className="text-sm font-bold text-primary">Cómo se calcula</Link>}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-muted">
                <th className="py-1 pr-2">Tema</th>
                <th className="py-1 pr-2">Importancia</th>
                <th className="py-1 pr-2">Mi nivel</th>
                <th className="py-1">Prioridad</th>
              </tr>
            </thead>
            <tbody>
              {rankedAreas(s).map((r) => (
                <tr key={r.area.id} className="border-t border-line">
                  <td className="py-2 pr-2">
                    <Link href={`/fisica?vista=tema&id=${r.area.id}`} className="font-bold hover:text-primary">
                      {r.area.icon} {r.area.name}
                    </Link>
                    {r.area.needsVerification && <span className="ml-1 text-xs text-warn" title="Ubicación en el parcial a verificar">*</span>}
                  </td>
                  <td className="whitespace-nowrap py-2 pr-2">
                    <Flames n={r.importance} />
                  </td>
                  <td className="py-2 pr-2 font-bold">{r.readiness === null ? <span className="text-muted">sin datos</span> : `${Math.round(r.readiness * 100)} %`}</td>
                  <td className="py-2 font-black">{r.priority}/5</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted">Importancia: frecuencia en los 10 exámenes distintos cargados + cuánto se apoyan otros temas en este. Prioridad: además, tu nivel. * Ubicación en el parcial a verificar con tu cátedra 2026.</p>
      </SectionCard>

      {/* Evolución */}
      <SectionCard title="Mi preparación semana a semana" icon="📈">
        {evo.length ? (
          <div className="space-y-2">
            {evo.map((e, i) => (
              <Bar key={e.week} value={e.value} label={`Semana ${i + 1}`} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">Se va a llenar a medida que estudies: cada día que abrís la misión se registra tu preparación real.</p>
        )}
      </SectionCard>
    </div>
  );
}

const MODES = [
  { href: "/fisica?vista=plan", icon: "📅", title: "Mi camino al parcial", text: "Plan día por día" },
  { href: "/fisica?vista=simulacro", icon: "📝", title: "Simulador de parcial", text: "Aprendizaje, realista o examen" },
  { href: "/fisica?vista=errores", icon: "❌", title: "Practicar mis errores", text: "Ejercicios según tus fallas" },
  { href: "/fisica?vista=importante", icon: "🔥", title: "Lo más importante", text: "Lo que más toman" },
  { href: "/fisica?vista=5min", icon: "⚡", title: "5 minutos", text: "Algo útil igual" },
  { href: "/fisica?vista=resolver", icon: "🪜", title: "Resolver conmigo", text: "Datos → modelo → fórmula" },
  { href: "/fisica?vista=queusarias", icon: "🔍", title: "¿Qué usarías?", text: "Reconocer la fórmula" },
  { href: "/fisica?vista=sorpresa", icon: "🎲", title: "Parcial sorpresa", text: "Sin saber los temas" },
  { href: "/fisica?vista=modelos", icon: "🧠", title: "Análisis de parciales", text: "Qué toman y trampas" },
  { href: "/fisica?vista=formulas", icon: "📄", title: "Fórmulas del parcial", text: "Con cuándo usarlas" },
  { href: "/fisica?vista=signos", icon: "±", title: "Signos", text: "Por qué g es negativa" },
  { href: "/fisica?vista=unidades", icon: "📏", title: "Unidades", text: "km/h, N, J, Pa…" },
  { href: "/fisica?vista=graficos", icon: "📈", title: "Gráficos x(t), v(t)", text: "Pendiente y área" },
  { href: "/fisica?vista=simulaciones", icon: "🧪", title: "Simulaciones", text: "Para entender" },
  { href: "/fisica?vista=material", icon: "📚", title: "Material para el parcial", text: "Todo ordenado" },
  { href: "/fisica?vista=checklist", icon: "✅", title: "Checklist del examen", text: "Antes de entregar" },
];

function ExamDates() {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {[
        ["📅 Jueves 5/11", "2.º parcial", "Dinámica, energía, tiro y caída libre*"],
        ["📅 Viernes 6/11", "1.er parcial", "Vectores, cinemática, estática, momentos e hidrostática"],
      ].map(([d, p, t]) => (
        <div key={p} className="card flex items-center gap-3 p-3">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase text-muted">{d}</p>
            <p className="font-black">{p}</p>
            <p className="text-xs text-muted">{t}</p>
          </div>
        </div>
      ))}
      <p className="text-xs text-muted sm:col-span-2">
        Como el 1.º es al día siguiente, el plan deja los dos listos antes del 5/11 y la noche del 5/11 es un repaso corto del 1.º. * Temas a confirmar con la cátedra Torti 2026.
      </p>
    </div>
  );
}

/** Mapa visual de un parcial con los temas reales detectados. */
export function ParcialMap({ p }: { p: "1P" | "2P" }) {
  const s = useProgress();
  const areas = areasFor(p);
  const r = parcialReadiness(s, p);
  return (
    <SectionCard title={p === "1P" ? "Primer parcial" : "Segundo parcial"} icon="🗺️" action={<span className="text-sm font-black">{Math.round(r.value * 100)} %</span>}>
      <ol className="relative space-y-1 pl-6 before:absolute before:bottom-3 before:left-[0.55rem] before:top-3 before:w-0.5 before:bg-line">
        {areas.map((a) => {
          const v = areaReadiness(s, a);
          const dot = v === null ? "var(--border)" : v >= 0.75 ? "var(--success)" : v >= 0.45 ? "var(--warn)" : "var(--danger)";
          return (
            <li key={a.id} className="relative">
              <span className="absolute -left-6 top-2.5 h-4 w-4 rounded-full border-2 border-surface" style={{ background: dot }} aria-hidden />
              <Link href={`/fisica?vista=tema&id=${a.id}`} className="flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 hover:bg-surface-2">
                <span className="text-sm font-bold">
                  {a.icon} {a.name}
                  {a.needsVerification && <span className="text-warn"> *</span>}
                </span>
                <span className="text-xs font-bold text-muted">{v === null ? "—" : `${Math.round(v * 100)} %`}</span>
              </Link>
            </li>
          );
        })}
        <li className="relative">
          <span className="absolute -left-[1.6rem] top-1.5 text-base" aria-hidden>👑</span>
          <Link href={`/fisica?vista=simulacro&parcial=${p}`} className="block rounded-xl px-2 py-1.5 text-sm font-black text-primary hover:bg-surface-2">
            Simulacro del {p === "1P" ? "1.er" : "2.º"} parcial
          </Link>
        </li>
      </ol>
      <p className="mt-2 text-xs text-muted">Temas detectados en los modelos {p === "1P" ? "de 1.er parcial y su recuperatorio" : "de 2.º parcial y su recuperatorio"} (2023).</p>
    </SectionCard>
  );
}

export { AREAS, areaImportance, getTopic };
