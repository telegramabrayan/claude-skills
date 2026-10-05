"use client";
import Link from "next/link";
import { useProgress, actions } from "@/lib/store";
import { Gate } from "@/components/layout/Gate";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ProgressBar, SectionTitle, SUBJECT_COLORS } from "@/components/ui/primitives";
import { currentStreak, levelInfo, levelTitle, MASTERED } from "@/engine/progress/rules";
import type { ProgressState } from "@/engine/progress/state";
import type { Subject } from "@/engine/types";
import { addDays, formatMinutes, weekStart, dayKey } from "@/engine/progress/dates";
import { getLesson } from "@/content/lessons";
import { getTopic } from "@/content/topics";
import { SUBJECTS } from "@/content/curriculum";
import { currentMissions } from "@/content/missions";
import { dueTopics, lessonContext, nextLesson, recommendations, subjectProgress, unitProgress } from "@/lib/learning";
import { buildPath, currentNode, progressLadder } from "@/lib/path";
import { homeMessage } from "@/lib/guide";
import { Nodo } from "@/components/guide/Nodo";

const MODES: { href: string; title: string; text: string; icon: IconName }[] = [
  { href: "/camino", title: "Camino", text: "Paso a paso", icon: "path" },
  { href: "/practicar", title: "Practicar", text: "Ejercicios libres", icon: "target" },
  { href: "/repasar", title: "Repasar", text: "Lo que toca hoy", icon: "refresh" },
  { href: "/tarjetas", title: "Tarjetas", text: "Memoria espaciada", icon: "cards" },
  { href: "/examenes", title: "Simulacro", text: "Parciales y finales", icon: "exam" },
  { href: "/laboratorio", title: "Laboratorio", text: "Experimentar", icon: "flask" },
  { href: "/plan", title: "Plan", text: "Calendario de estudio", icon: "calendar" },
  { href: "/guardados", title: "Guardados", text: "Notas y favoritos", icon: "bookmark" },
];

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

function subjectSummary(s: ProgressState, sub: Subject) {
  const topicIds = [...new Set(sub.units.flatMap((u) => u.topicIds))];
  const started = topicIds.filter((t) => s.topics[t]?.attempts);
  const mastered = topicIds.filter((t) => (s.topics[t]?.mastery ?? 0) >= MASTERED).length;
  const avgLevel = started.length ? Math.round(started.reduce((a, t) => a + (s.topics[t]?.level ?? 1), 0) / started.length) : 0;
  const current = sub.units.find((u) => u.lessonIds.length && u.lessonIds.some((l) => s.lessons[l]?.status !== "completada"));
  const last = s.attempts.filter((a) => topicIds.includes(a.topicId)).at(-1)?.ts;
  return { mastered, total: topicIds.length, avgLevel, current, last };
}

function ago(ts?: number) {
  if (!ts) return "Sin actividad todavía";
  const d = Math.floor((Date.now() - ts) / 86400000);
  return d <= 0 ? "Hoy" : d === 1 ? "Ayer" : `Hace ${d} días`;
}

function Dashboard() {
  const s = useProgress();
  const { level, into, needed } = levelInfo(s.xp);
  const streak = currentStreak(s);
  const today = dayKey();
  const ws = weekStart(today);
  const weekSeconds = Object.entries(s.days).filter(([k]) => k >= ws).reduce((a, [, d]) => a + d.seconds, 0);
  const sections = buildPath(s);
  const node = currentNode(sections);
  const next = node?.kind === "lesson" ? node.lessonId : nextLesson(s);
  const lesson = next ? getLesson(next) : undefined;
  const ctx = next ? lessonContext(next) : undefined;
  const unitPct = ctx ? unitProgress(s, ctx.unit) : null;
  const recs = recommendations(s);
  const missions = currentMissions(s).filter((m) => m.kind === "diaria");
  const todayStats = s.days[today];
  const due = dueTopics(s).length;
  const guide = homeMessage(s);
  const hello = s.profile.name ? `Hola, ${s.profile.name}` : "Hola";
  const bosses = sections.filter((sec) => sec.nodes.some((n) => n.kind === "boss" && n.status === "disponible"));
  const ladder = progressLadder(s);

  const goals = [
    { label: `Estudiar ${s.settings.dailyMinutes} minutos`, done: (todayStats?.seconds ?? 0) >= s.settings.dailyMinutes * 60, detail: formatMinutes(todayStats?.seconds ?? 0) },
    { label: "Completar 1 lección", done: (todayStats?.lessons ?? 0) >= 1, detail: `${todayStats?.lessons ?? 0}/1` },
    { label: due ? `Repasar ${due} ${due === 1 ? "tema" : "temas"}` : "Hacer 5 ejercicios", done: due ? false : (todayStats?.exercises ?? 0) >= 5, detail: due ? "pendiente" : `${Math.min(5, todayStats?.exercises ?? 0)}/5` },
  ];
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(ws, i));

  return (
    <div className="space-y-2">
      {/* Saludo + guía */}
      <div className="flex flex-wrap items-center gap-4">
        <Nodo mood={guide.mood} size={64} />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{hello}</h1>
          <p className="text-muted">{guide.text}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 pt-2 text-sm font-semibold">
        <span className="chip !bg-warn-soft !text-warn">🔥 {streak} {streak === 1 ? "día" : "días"}</span>
        <span className="chip !bg-xp-soft !text-xp">⭐ Nivel {level} · {levelTitle(level)}</span>
        <span className="chip">⚡ {s.xp.toLocaleString("es-AR")} XP</span>
        <Link href="/taller" className="chip hover:!bg-primary-soft">⚙️ {s.gears}</Link>
      </div>

      {!s.diagnostic && (
        <Link href="/diagnostico" className="card mt-4 flex items-center gap-4 border-accent/50 bg-accent-soft/50 p-4">
          <span className="text-3xl">🧭</span>
          <span className="flex-1">
            <span className="block font-bold">Descubramos tu nivel</span>
            <span className="text-sm text-muted">Un diagnóstico corto arma tu mapa actual y saltea lo que ya sabés. Unos 10 minutos.</span>
          </span>
          <Icon name="arrowRight" />
        </Link>
      )}

      {/* Continuar */}
      <section className="card mt-4 overflow-hidden" aria-labelledby="continuar">
        <div className="p-5 sm:p-6">
          <p id="continuar" className="text-sm font-semibold uppercase tracking-wide text-primary">
            Continuar
          </p>
          {lesson && ctx ? (
            <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-muted">
                  {ctx.subject.name} · {ctx.unit.title}
                </p>
                <h2 className="mt-1 text-2xl font-bold">{lesson.title}</h2>
                <p className="text-muted">
                  {lesson.subtitle} · ⏱ {lesson.estimatedMinutes} min
                </p>
                {unitPct && (
                  <div className="mt-3 max-w-md">
                    <div className="mb-1 flex justify-between text-sm">
                      <span>Unidad</span>
                      <span className="font-semibold">{Math.round((unitPct.done / Math.max(1, unitPct.total)) * 100)}%</span>
                    </div>
                    <ProgressBar value={unitPct.done / Math.max(1, unitPct.total)} label="Progreso de la unidad" />
                  </div>
                )}
              </div>
              <Link href={`/leccion/${lesson.id}`} className="btn btn-primary text-lg">
                {s.lessons[lesson.id]?.status === "en-curso" ? "Continuar" : "Empezar"} <Icon name="arrowRight" />
              </Link>
            </div>
          ) : (
            <p className="mt-2">Completaste todas las lecciones del camino. Seguí practicando y probá los desafíos finales.</p>
          )}
        </div>
        <ProgressBar value={into / needed} color="var(--xp)" height={6} className="!rounded-none" label="XP para el siguiente nivel" />
        <p className="px-5 py-2 text-xs text-muted">
          {into.toLocaleString("es-AR")} / {needed.toLocaleString("es-AR")} XP para el nivel {level + 1}
        </p>
      </section>

      <div className="grid gap-4 pt-4 md:grid-cols-2">
        {/* Objetivo de hoy */}
        <div className="card p-5">
          <span className="text-sm font-semibold uppercase tracking-wide text-accent">Objetivo de hoy</span>
          <ul className="mt-3 space-y-2">
            {goals.map((g) => (
              <li key={g.label} className="flex items-center gap-3">
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm ${g.done ? "bg-success text-surface" : "border-2 border-line"}`} aria-hidden>
                  {g.done ? "✓" : ""}
                </span>
                <span className={`flex-1 ${g.done ? "text-muted line-through" : "font-semibold"}`}>{g.label}</span>
                <span className="text-xs text-muted">{g.detail}</span>
              </li>
            ))}
          </ul>
          <Link href="/entrenamiento" className="btn btn-secondary mt-4 w-full">
            Hacer el entrenamiento de hoy
          </Link>
        </div>

        {/* Racha */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-wide text-warn">Racha</span>
            <span className="text-xs text-muted">Récord: {s.streak.longest} {s.streak.longest === 1 ? "día" : "días"}</span>
          </div>
          <p className="mt-1 text-3xl font-black">🔥 {streak}</p>
          <div className="mt-3 grid grid-cols-7 gap-1.5" aria-label="Días estudiados esta semana">
            {weekDays.map((d, i) => {
              const studied = (s.days[d]?.exercises ?? 0) > 0 || (s.days[d]?.lessons ?? 0) > 0;
              const isToday = d === today;
              return (
                <div key={d} className="flex flex-col items-center gap-1">
                  <span className={`text-[11px] font-bold ${isToday ? "text-primary" : "text-muted"}`}>{WEEKDAYS[i]}</span>
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-full text-sm ${studied ? "bg-warn text-surface" : d > today ? "bg-surface-2 opacity-50" : "bg-surface-2"} ${isToday ? "ring-2 ring-primary" : ""}`}
                    aria-label={`${d}: ${studied ? "estudiaste" : "sin estudio"}`}
                  >
                    {studied ? "✓" : ""}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted">
            Protectores de racha: {s.streakFreezes}/2 ·{" "}
            <Link href="/taller" className="font-semibold text-primary">
              Taller
            </Link>
            . Si un día no podés, no pasa nada: tu progreso no se pierde.
          </p>
        </div>

        {/* Necesitás reforzar */}
        <div className="card p-5">
          <span className="text-sm font-semibold uppercase tracking-wide text-warn">Necesitás reforzar</span>
          {recs.length ? (
            <ol className="mt-3 space-y-2">
              {recs.map((r, i) => (
                <li key={r.topicId}>
                  <Link href={`/practicar?tema=${r.topicId}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-surface-2">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-warn-soft text-sm font-bold text-warn">{i + 1}</span>
                    <span className="flex-1">
                      <span className="block font-semibold">{getTopic(r.topicId)?.name}</span>
                      <span className="text-xs text-muted">{r.reason}</span>
                    </span>
                    <Icon name="arrowRight" size={18} className="text-muted" />
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-sm text-muted">Cuando practiques, acá van a aparecer los temas que conviene reforzar, según tus errores.</p>
          )}
        </div>

        {/* Entrenamiento rápido */}
        <div className="card p-5">
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">Entrenamiento rápido</span>
          <p className="mt-1 text-sm text-muted">¿Cuánto tiempo tenés? Armo una sesión a tu medida.</p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[5, 10, 15, 30].map((m) => (
              <Link key={m} href={`/entrenamiento?min=${m}`} className="btn btn-secondary flex-col !gap-0 !py-2">
                <span className="text-xl font-black">{m}</span>
                <span className="text-xs">min</span>
              </Link>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">Esta semana: {formatMinutes(weekSeconds)} de estudio.</p>
        </div>
      </div>

      {bosses.length > 0 && (
        <>
          <SectionTitle>Desafíos disponibles</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            {bosses.slice(0, 4).map((b) => (
              <Link key={b.unitId} href={`/desafio?unidad=${b.unitId}`} className="card flex min-w-0 items-center gap-3 p-4 transition hover:-translate-y-0.5">
                <span className="grid h-12 w-12 place-items-center rounded-xl text-2xl" style={{ background: b.color }} aria-hidden>
                  🏆
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-muted">{b.subjectName}</span>
                  <span className="block truncate font-bold">{b.title}</span>
                  <span className="text-xs text-xp">+150 XP · 3 vidas</span>
                </span>
                <Icon name="arrowRight" />
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Misiones */}
      <SectionTitle action={<Link href="/logros" className="text-sm font-semibold text-primary">Ver todas</Link>}>Misiones de hoy</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-3">
        {missions.map((m) => {
          const complete = m.progress >= m.target;
          return (
            <div key={m.key} className="card p-4">
              <p className="text-sm font-semibold">{m.title}</p>
              <ProgressBar value={m.progress / m.target} className="mt-3" color={complete ? "var(--success)" : "var(--primary)"} label={m.title} />
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-muted">
                  {m.progress}/{m.target}
                </span>
                {m.claimed ? (
                  <span className="font-semibold text-success">✓ +{m.xp} XP</span>
                ) : complete ? (
                  <button className="btn btn-primary !min-h-8 !px-3 !text-xs" onClick={() => actions.claimMission(m.key, m.xp)}>
                    Reclamar +{m.xp} XP
                  </button>
                ) : (
                  <span className="text-xp">+{m.xp} XP</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Materias */}
      <SectionTitle action={<Link href="/materias" className="text-sm font-semibold text-primary">Todas</Link>}>Tus materias</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SUBJECTS.filter((sub) => sub.cycle !== "segundo-ciclo").map((sub) => {
          const pct = subjectProgress(s, sub);
          const sum = subjectSummary(s, sub);
          const color = SUBJECT_COLORS[sub.color];
          const hasLessons = sub.units.some((u) => u.lessonIds.length);
          return (
            <Link key={sub.id} href={`/materias/${sub.id}`} className="card min-w-0 overflow-hidden transition hover:-translate-y-0.5">
              <div className="flex items-center gap-3 p-4 text-white" style={{ background: color }}>
                <span className="text-2xl" aria-hidden>
                  {sub.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-black">{sub.shortName}</span>
                  <span className="block text-xs opacity-90">{sum.avgLevel ? `Nivel ${sum.avgLevel}` : "Sin empezar"}</span>
                </span>
                <span className="text-lg font-black">{Math.round(pct * 100)}%</span>
              </div>
              <div className="space-y-2 p-4 text-sm">
                {hasLessons ? <ProgressBar value={pct} color={color} height={6} label={`Progreso en ${sub.name}`} /> : <p className="text-muted">Programa en carga</p>}
                {sum.current && <p className="truncate">Unidad actual: <b>{sum.current.title}</b></p>}
                <p className="flex justify-between text-xs text-muted">
                  <span>
                    {sum.mastered}/{sum.total} temas dominados
                  </span>
                  <span>{ago(sum.last)}</span>
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Progreso */}
      <SectionTitle>Tu progreso</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        {ladder.map((l) => (
          <div key={l.label} className="card p-4">
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-semibold">{l.label}</span>
              <span>{Math.round(l.value * 100)}%</span>
            </div>
            <ProgressBar value={l.value} label={l.label} />
            {l.note && <p className="mt-1 text-xs text-muted">{l.note}</p>}
          </div>
        ))}
      </div>

      {/* Modos */}
      <SectionTitle>Modos de estudio</SectionTitle>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MODES.map((m) => (
          <Link key={m.title} href={m.href} className="card flex items-center gap-3 p-3 transition hover:border-primary">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
              <Icon name={m.icon} />
            </span>
            <span>
              <span className="block text-sm font-bold">{m.title}</span>
              <span className="block text-xs text-muted">{m.text}</span>
            </span>
          </Link>
        ))}
      </div>

    </div>
  );
}

export default function Page() {
  return (
    <Gate>
      <Dashboard />
    </Gate>
  );
}
