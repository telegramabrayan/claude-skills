"use client";
import Link from "next/link";
import { useProgress, actions } from "@/lib/store";
import { Gate } from "@/components/layout/Gate";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ProgressBar, SectionTitle, SUBJECT_COLORS } from "@/components/ui/primitives";
import { currentStreak, levelInfo } from "@/engine/progress/rules";
import { formatMinutes, lastDays, weekStart, dayKey } from "@/engine/progress/dates";
import { getLesson } from "@/content/lessons";
import { getTopic } from "@/content/topics";
import { SUBJECTS } from "@/content/curriculum";
import { currentMissions } from "@/content/missions";
import { lessonContext, nextLesson, recommendations, subjectProgress, unitProgress, dailyPlan } from "@/lib/learning";

const MODES: { href: string; title: string; text: string; icon: IconName }[] = [
  { href: "/mapa", title: "Aprender", text: "Lecciones guiadas", icon: "book" },
  { href: "/practicar", title: "Practicar", text: "Ejercicios libres", icon: "target" },
  { href: "/repasar", title: "Repasar", text: "Lo que toca hoy", icon: "refresh" },
  { href: "/practicar?modo=desafio", title: "Desafío", text: "Más difícil, con ❤️", icon: "bolt" },
  { href: "/examenes", title: "Examen", text: "Simulacros", icon: "exam" },
  { href: "/laboratorio", title: "Laboratorio", text: "Experimentar", icon: "flask" },
  { href: "/practicar?modo=rapido", title: "Modo rápido", text: "5 minutos", icon: "clock" },
  { href: "/practicar?modo=profundo", title: "Modo profundo", text: "Sesión larga", icon: "sparkle" },
];

function Dashboard() {
  const s = useProgress();
  const { level, into, needed } = levelInfo(s.xp);
  const streak = currentStreak(s);
  const ws = weekStart(dayKey());
  const weekSeconds = Object.entries(s.days).filter(([k]) => k >= ws).reduce((a, [, d]) => a + d.seconds, 0);
  const next = nextLesson(s);
  const lesson = next ? getLesson(next) : undefined;
  const ctx = next ? lessonContext(next) : undefined;
  const unitPct = ctx ? unitProgress(s, ctx.unit) : null;
  const recs = recommendations(s);
  const missions = currentMissions(s).filter((m) => m.kind === "diaria");
  const plan = dailyPlan(s);
  const todayXp = s.days[dayKey()]?.xp ?? 0;
  const week = lastDays(7).map((d) => s.days[d]?.exercises ?? 0);
  const hello = s.profile.name ? `Hola, ${s.profile.name}` : "Hola";

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{hello} 👋</h1>
      <p className="text-muted">{todayXp > 0 ? `Hoy ya sumaste ${todayXp} XP. Buen ritmo.` : "Unos minutos hoy valen más que muchas horas una vez por semana."}</p>

      {s.profile.startMode === "diagnostico" && !s.diagnostic && (
        <Link href="/diagnostico" className="card mt-4 flex items-center gap-4 border-accent/50 bg-accent-soft/50 p-4">
          <span className="text-3xl">🧭</span>
          <span className="flex-1">
            <span className="block font-bold">Descubramos desde dónde empezar</span>
            <span className="text-sm text-muted">El diagnóstico arma tu ruta personalizada. Unos 10 minutos.</span>
          </span>
          <Icon name="arrowRight" />
        </Link>
      )}

      {/* Continuar aprendiendo */}
      <section className="card mt-4 overflow-hidden" aria-labelledby="continuar">
        <div className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:p-6">
          <div>
            <p id="continuar" className="text-sm font-semibold uppercase tracking-wide text-primary">
              Continuar aprendiendo
            </p>
            {lesson && ctx ? (
              <>
                <p className="mt-2 text-sm text-muted">
                  {ctx.subject.name} · {ctx.unit.title}
                </p>
                <h2 className="mt-1 text-2xl font-bold">{lesson.title}</h2>
                <p className="text-muted">{lesson.subtitle}</p>
                {unitPct && (
                  <div className="mt-4 max-w-md">
                    <div className="mb-1 flex justify-between text-sm">
                      <span>Progreso de la unidad</span>
                      <span className="font-semibold">{Math.round((unitPct.done / Math.max(1, unitPct.total)) * 100)}%</span>
                    </div>
                    <ProgressBar value={unitPct.done / Math.max(1, unitPct.total)} label="Progreso de la unidad" />
                  </div>
                )}
                <Link href={`/leccion/${lesson.id}`} className="btn btn-primary mt-5 text-lg">
                  {s.lessons[lesson.id]?.status === "en-curso" ? "Continuar" : "Empezar"} <Icon name="arrowRight" />
                </Link>
              </>
            ) : (
              <p className="mt-2">¡Completaste todas las lecciones disponibles! Seguí practicando para dominar cada tema.</p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-1 sm:gap-2 sm:text-right">
            <div>
              <div className="text-xs text-muted">Racha</div>
              <div className="text-xl font-bold text-warn">🔥 {streak} {streak === 1 ? "día" : "días"}</div>
            </div>
            <div>
              <div className="text-xs text-muted">Nivel</div>
              <div className="text-xl font-bold">{level}</div>
              <div className="text-xs text-muted">
                {into.toLocaleString("es-AR")} / {needed.toLocaleString("es-AR")} XP
              </div>
            </div>
            <div>
              <div className="text-xs text-muted">Esta semana</div>
              <div className="text-xl font-bold">{formatMinutes(weekSeconds)}</div>
            </div>
          </div>
        </div>
        <ProgressBar value={into / needed} color="var(--xp)" height={6} className="!rounded-none" label="XP para el siguiente nivel" />
      </section>

      <div className="grid gap-4 pt-4 md:grid-cols-2">
        {/* Entrenamiento de hoy */}
        <Link href="/entrenamiento" className="card group flex flex-col p-5 transition hover:border-primary">
          <span className="text-sm font-semibold uppercase tracking-wide text-accent">Tu entrenamiento de hoy</span>
          <span className="mt-1 text-lg font-bold">10-20 minutos adaptados a vos</span>
          <ul className="mt-3 space-y-1 text-sm text-muted">
            <li>🔁 {plan.filter((p) => p.type === "exercise" && p.label === "Repaso").length} repasos</li>
            <li>📘 {plan.filter((p) => p.type === "lesson").length} lección</li>
            <li>✏️ {plan.filter((p) => p.type === "exercise" && p.label === "Práctica").length} ejercicios</li>
            <li>⚔️ 1 desafío</li>
          </ul>
          <span className="mt-auto pt-4 font-semibold text-primary group-hover:underline">Empezar entrenamiento →</span>
        </Link>

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
      </div>

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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {SUBJECTS.filter((sub) => sub.cycle !== "segundo-ciclo").map((sub) => {
          const pct = subjectProgress(s, sub);
          return (
            <Link key={sub.id} href={`/materias/${sub.id}`} className="card flex flex-col gap-2 p-4 transition hover:-translate-y-0.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl text-lg font-bold text-surface" style={{ background: SUBJECT_COLORS[sub.color] }} aria-hidden>
                {sub.icon}
              </span>
              <span className="font-semibold leading-tight">{sub.shortName}</span>
              {sub.units.some((u) => u.lessonIds.length) ? (
                <ProgressBar value={pct} color={SUBJECT_COLORS[sub.color]} height={6} label={`Progreso en ${sub.name}`} />
              ) : (
                <span className="text-xs text-muted">Programa en carga</span>
              )}
            </Link>
          );
        })}
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

      <SectionTitle>Últimos 7 días</SectionTitle>
      <div className="card flex h-28 items-end gap-2 p-4" role="img" aria-label={`Ejercicios por día en la última semana: ${week.join(", ")}`}>
        {week.map((n, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div className="w-full rounded-t-md bg-primary/80" style={{ height: `${Math.max(4, (n / Math.max(1, ...week)) * 64)}px` }} />
            <span className="text-[10px] text-muted">{["L", "M", "X", "J", "V", "S", "D"][(new Date(Date.now() - (6 - i) * 86400000).getDay() + 6) % 7]}</span>
          </div>
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
