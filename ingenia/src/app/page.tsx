"use client";
import Link from "next/link";
import { useProgress, actions } from "@/lib/store";
import { Gate } from "@/components/layout/Gate";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ProgressBar, SectionTitle } from "@/components/ui/primitives";
import { SubjectArt, subjectStyle } from "@/components/ui/SubjectArt";
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

const PLAY: { href: string; title: string; text: string; icon: string; subject: string }[] = [
  { href: "/juegos", title: "Minijuegos", text: "Contrarreloj, escalera, memoria…", icon: "🎮", subject: "algebra-a" },
  { href: "/repasar", title: "Repasar", text: "Lo que toca hoy", icon: "🔁", subject: "preparacion" },
  { href: "/examenes", title: "Simulacro", text: "Parciales y finales", icon: "📝", subject: "am-a" },
  { href: "/laboratorio", title: "Laboratorio", text: "Experimentar", icon: "🧪", subject: "fisica" },
];

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

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Buenos días" : hour < 20 ? "Buenas tardes" : "Buenas noches";
  const goalDone = goals.filter((g) => g.done).length;
  const studied = Math.min(1, (todayStats?.seconds ?? 0) / (s.settings.dailyMinutes * 60));
  const continueSubject = ctx?.subject.id ?? "preparacion";
  const visibleSubjects = SUBJECTS.filter((sub) => sub.cycle !== "segundo-ciclo");

  return (
    <div className="space-y-8">
      {/* Saludo + Nodo + estadísticas */}
      <section className="anim-rise grid items-center gap-4 sm:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            {greet}
            {s.profile.name ? `, ${s.profile.name}` : ""} <span aria-hidden className="inline-block origin-bottom-right animate-[wave_1.2s_ease-in-out_2]">👋</span>
          </h1>
          <p className="mt-1 text-lg font-semibold text-muted">¿Qué vamos a aprender hoy?</p>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:max-w-md">
            <Link href="/estadisticas" className="tile !min-h-0 flex-col !gap-0 !py-2 text-center" title={`Récord: ${s.streak.longest} días`}>
              <span className="text-2xl font-black text-warn">🔥 {streak}</span>
              <span className="text-xs font-bold text-muted">{streak === 1 ? "día de racha" : "días de racha"}</span>
            </Link>
            <Link href="/logros" className="tile !min-h-0 flex-col !gap-0 !py-2 text-center" title={`${into} / ${needed} XP para el nivel ${level + 1}`}>
              <span className="text-2xl font-black text-xp">⭐ {level}</span>
              <span className="truncate text-xs font-bold text-muted">{levelTitle(level)}</span>
            </Link>
            <Link href="/taller" className="tile !min-h-0 flex-col !gap-0 !py-2 text-center">
              <span className="text-2xl font-black text-primary">⚡ {s.xp >= 10000 ? `${Math.round(s.xp / 1000)}k` : s.xp.toLocaleString("es-AR")}</span>
              <span className="text-xs font-bold text-muted">XP · ⚙️ {s.gears}</span>
            </Link>
          </div>
        </div>
        <div className="game-only hidden items-end gap-2 sm:flex">
          <div className="speech relative order-2 max-w-[15rem] rounded-2xl border-2 border-line bg-surface px-3.5 py-2 text-sm font-semibold shadow-sm" role="status">
            {guide.text}
          </div>
          <Nodo mood={guide.mood === "neutral" ? "encourage" : guide.mood} size={96} body />
        </div>
        <p className="game-only -mt-1 flex items-center gap-2 text-sm font-semibold text-muted sm:hidden">
          <Nodo mood={guide.mood} size={36} /> {guide.text}
        </p>
      </section>

      {/* Continuar aprendiendo */}
      <section aria-labelledby="continuar" className="card-hero anim-rise" style={subjectStyle(continueSubject)}>
        <div className="grid items-center gap-3 p-5 sm:grid-cols-[1fr_220px] sm:p-7">
          <div className="min-w-0">
            <p id="continuar" className="hero-muted text-sm font-black uppercase tracking-wider text-white/85">
              Continuar aprendiendo
            </p>
            {lesson && ctx ? (
              <>
                <p className="hero-muted mt-2 text-sm font-bold text-white/85">
                  {ctx.subject.icon} {ctx.subject.name} · {ctx.unit.title}
                </p>
                <h2 className="mt-1 text-2xl font-black leading-tight sm:text-3xl">{lesson.title}</h2>
                <p className="hero-muted text-white/85">
                  {lesson.subtitle} · ⏱ {lesson.estimatedMinutes} min
                </p>
                {unitPct && (
                  <div className="mt-4 max-w-md">
                    <div className="mb-1 flex justify-between text-sm font-bold">
                      <span>Unidad</span>
                      <span>{Math.round((unitPct.done / Math.max(1, unitPct.total)) * 100)}%</span>
                    </div>
                    <div className="pbar !bg-white/25" role="progressbar" aria-label="Progreso de la unidad" aria-valuenow={Math.round((unitPct.done / Math.max(1, unitPct.total)) * 100)} aria-valuemin={0} aria-valuemax={100}>
                      <span style={{ width: `${Math.max(3, (unitPct.done / Math.max(1, unitPct.total)) * 100)}%`, ["--bar" as string]: "#fff" }} />
                    </div>
                  </div>
                )}
                <Link href={`/leccion/${lesson.id}`} className="btn-3d is-secondary mt-5 !px-8 text-lg">
                  {s.lessons[lesson.id]?.status === "en-curso" ? "CONTINUAR" : "EMPEZAR"} <Icon name="arrowRight" />
                </Link>
              </>
            ) : (
              <p className="mt-2 text-lg font-bold">Completaste todas las lecciones del camino. Seguí practicando y probá los desafíos finales.</p>
            )}
          </div>
          <SubjectArt id={continueSubject} height={170} className="hidden sm:block" />
        </div>
      </section>

      {(!s.diagnostic || !s.settings.fromZero) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {!s.diagnostic && (
            <Link href="/diagnostico" className="tile !items-center">
              <span className="text-3xl" aria-hidden>🧭</span>
              <span className="flex-1">
                <span className="block font-black">Descubramos tu nivel</span>
                <span className="text-sm font-medium text-muted">Diagnóstico de 10 min: saltea lo que ya sabés.</span>
              </span>
              <Icon name="arrowRight" />
            </Link>
          )}
          {!s.settings.fromZero ? (
            <button onClick={() => actions.updateSettings({ fromZero: true })} className="tile text-left">
              <span className="text-3xl" aria-hidden>🌱</span>
              <span className="flex-1">
                <span className="block font-black">¿Hace mucho que no estudiás?</span>
                <span className="text-sm font-medium text-muted">Activá «Enseñame desde cero»: bases primero, explicaciones desde los fundamentos.</span>
              </span>
            </button>
          ) : null}
        </div>
      )}
      {s.settings.fromZero && (
        <p className="-mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="chip !bg-success-soft !text-success">🌱 Modo «Enseñame desde cero» activo</span>
          <button className="text-muted underline" onClick={() => actions.updateSettings({ fromZero: false })}>
            Desactivar
          </button>
        </p>
      )}

      {/* Materias */}
      <section>
        <SectionTitle action={<Link href="/materias" className="text-sm font-bold text-primary">Ver todas</Link>}>Tus materias</SectionTitle>
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {visibleSubjects.map((sub) => {
            const pct = subjectProgress(s, sub);
            const sum = subjectSummary(s, sub);
            const hasLessons = sub.units.some((u) => u.lessonIds.length);
            return (
              <Link key={sub.id} href={`/materias/${sub.id}`} className="card-subject w-[72%] shrink-0 snap-start sm:w-auto" style={subjectStyle(sub.id)}>
                <div className="art-band relative h-24 px-2 pt-2">
                  <SubjectArt id={sub.id} height={84} />
                  <span className="absolute right-2 top-2 rounded-full bg-black/25 px-2 py-0.5 text-xs font-black text-white">{Math.round(pct * 100)}%</span>
                </div>
                <div className="space-y-2 p-4">
                  <p className="flex items-center gap-2 font-black leading-tight">
                    <span aria-hidden>{sub.icon}</span>
                    <span className="truncate">{sub.shortName}</span>
                  </p>
                  {hasLessons ? (
                    <div className="pbar !h-2.5" role="progressbar" aria-label={`Progreso en ${sub.name}`} aria-valuenow={Math.round(pct * 100)} aria-valuemin={0} aria-valuemax={100}>
                      <span style={{ width: `${Math.max(pct * 100, 2)}%`, ["--bar" as string]: "var(--subj)" }} />
                    </div>
                  ) : (
                    <p className="text-sm text-muted">Programa en carga</p>
                  )}
                  <p className="truncate text-xs font-semibold text-muted">{sum.current ? sum.current.title : "Sin unidad en curso"}</p>
                  <p className="flex justify-between text-[11px] text-muted">
                    <span>{sum.avgLevel ? `Nivel ${sum.avgLevel}` : "Sin empezar"}</span>
                    <span>{ago(sum.last)}</span>
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Hoy: objetivo + racha */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <Ring value={goalDone / goals.length} inner={studied} label={`${goalDone}/${goals.length}`} />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-black">🎯 Objetivo de hoy</h2>
              <p className="text-sm text-muted">{goalDone === goals.length ? "¡Cumpliste todo por hoy!" : `${goals.length - goalDone} ${goals.length - goalDone === 1 ? "paso" : "pasos"} para completar el día`}</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2">
            {goals.map((g) => (
              <li key={g.label} className="flex items-center gap-3">
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-black ${g.done ? "bg-success text-white" : "border-2 border-line"}`} aria-hidden>
                  {g.done ? "✓" : ""}
                </span>
                <span className={`flex-1 ${g.done ? "text-muted line-through" : "font-bold"}`}>{g.label}</span>
                <span className="text-xs text-muted">{g.detail}</span>
              </li>
            ))}
          </ul>
          <Link href="/entrenamiento" className="btn-3d is-secondary is-block mt-4">
            Hacer el entrenamiento de hoy
          </Link>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black">🔥 Racha: {streak} {streak === 1 ? "día" : "días"}</h2>
            <span className="text-xs text-muted">Récord: {s.streak.longest}</span>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1.5" aria-label="Días estudiados esta semana">
            {weekDays.map((d, i) => {
              const did = (s.days[d]?.exercises ?? 0) > 0 || (s.days[d]?.lessons ?? 0) > 0;
              const isToday = d === today;
              return (
                <div key={d} className="flex flex-col items-center gap-1">
                  <span className={`text-[11px] font-black ${isToday ? "text-primary" : "text-muted"}`}>{WEEKDAYS[i]}</span>
                  <span className={`grid h-9 w-9 place-items-center rounded-full text-sm font-black ${did ? "bg-warn text-white shadow-[0_3px_0_color-mix(in_srgb,var(--warn)_60%,black)]" : d > today ? "bg-surface-2 opacity-50" : "bg-surface-2"} ${isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-[var(--surface)]" : ""}`} aria-label={`${d}: ${did ? "estudiaste" : "sin estudio"}`}>
                    {did ? "🔥" : ""}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted">
            Protectores: {s.streakFreezes}/2 ·{" "}
            <Link href="/taller" className="font-bold text-primary">Taller</Link>. Si un día no podés, no pasa nada: tu progreso no se pierde.
          </p>
          <div className="mt-4 grid grid-cols-4 gap-2" aria-label="Entrenamiento rápido">
            {[5, 10, 15, 30].map((m) => (
              <Link key={m} href={`/entrenamiento?min=${m}`} className="tile !min-h-0 flex-col !gap-0 !py-1.5 text-center">
                <span className="text-lg font-black">{m}</span>
                <span className="text-[11px] font-bold text-muted">min</span>
              </Link>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">Esta semana: {formatMinutes(weekSeconds)} de estudio.</p>
        </div>
      </section>

      {/* Jugar */}
      <section>
        <SectionTitle>Jugar y practicar</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PLAY.map((g) => (
            <Link key={g.href} href={g.href} className="card-subject p-4" style={subjectStyle(g.subject)}>
              <span className="grid h-12 w-12 place-items-center rounded-2xl text-2xl" style={{ background: "var(--subj-soft)" }} aria-hidden>
                {g.icon}
              </span>
              <span className="mt-2 block font-black leading-tight">{g.title}</span>
              <span className="block text-xs font-semibold text-muted">{g.text}</span>
            </Link>
          ))}
        </div>
      </section>

      {bosses.length > 0 && (
        <section>
          <SectionTitle>🏆 Desafíos finales disponibles</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            {bosses.slice(0, 4).map((b) => (
              <Link key={b.unitId} href={`/desafio?unidad=${b.unitId}`} className="tile min-w-0">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl" style={{ background: b.color }} aria-hidden>
                  🏆
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-muted">{b.subjectName}</span>
                  <span className="block truncate font-black">{b.title}</span>
                  <span className="text-xs font-bold text-xp">+150 XP · medalla</span>
                </span>
                <Icon name="arrowRight" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Reforzar + misiones */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-lg font-black">🩹 Para reforzar</h2>
          {recs.length ? (
            <ol className="mt-3 space-y-1">
              {recs.map((r, i) => (
                <li key={r.topicId}>
                  <Link href={`/practicar?tema=${r.topicId}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-surface-2">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-warn-soft text-sm font-black text-warn">{i + 1}</span>
                    <span className="flex-1">
                      <span className="block font-bold">{getTopic(r.topicId)?.name}</span>
                      <span className="text-xs text-muted">{r.reason}</span>
                    </span>
                    <Icon name="arrowRight" size={18} className="text-muted" />
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-sm text-muted">Cuando practiques, acá aparecen los temas que conviene reforzar según tus errores.</p>
          )}
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black">📜 Misiones de hoy</h2>
            <Link href="/logros" className="text-sm font-bold text-primary">Logros</Link>
          </div>
          <ul className="mt-3 space-y-3">
            {missions.map((m) => {
              const complete = m.progress >= m.target;
              return (
                <li key={m.key}>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-bold">{m.title}</span>
                    {m.claimed ? (
                      <span className="shrink-0 font-bold text-success">✓ +{m.xp}</span>
                    ) : complete ? (
                      <button className="btn-3d !min-h-8 shrink-0 !px-3 !text-xs" onClick={() => actions.claimMission(m.key, m.xp)}>
                        +{m.xp} XP
                      </button>
                    ) : (
                      <span className="shrink-0 text-xs font-bold text-xp">+{m.xp} XP</span>
                    )}
                  </div>
                  <div className="pbar mt-1.5 !h-2.5" role="progressbar" aria-label={m.title} aria-valuenow={m.progress} aria-valuemin={0} aria-valuemax={m.target}>
                    <span style={{ width: `${Math.max(2, Math.min(1, m.progress / m.target) * 100)}%`, ["--bar" as string]: complete ? "var(--success)" : "var(--xp)" }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Más */}
      <details className="card group p-0">
        <summary className="flex cursor-pointer list-none items-center justify-between p-5 font-black">
          Tu progreso y más herramientas <Icon name="arrowRight" size={18} className="transition group-open:rotate-90" />
        </summary>
        <div className="space-y-4 border-t border-line p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {ladder.map((l) => (
              <div key={l.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-bold">{l.label}</span>
                  <span>{Math.round(l.value * 100)}%</span>
                </div>
                <ProgressBar value={l.value} label={l.label} />
                {l.note && <p className="mt-1 text-xs text-muted">{l.note}</p>}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {MODES.map((m) => (
              <Link key={m.title} href={m.href} className="flex items-center gap-3 rounded-xl p-2 hover:bg-surface-2">
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
      </details>
    </div>
  );
}

/** Anillo de progreso del día: afuera los objetivos, adentro los minutos estudiados. */
function Ring({ value, inner, label }: { value: number; inner: number; label: string }) {
  const C = 2 * Math.PI * 26;
  const c = 2 * Math.PI * 18;
  return (
    <svg width="72" height="72" viewBox="0 0 64 64" role="img" aria-label={`Objetivos del día: ${label}`} className="shrink-0">
      <circle cx="32" cy="32" r="26" fill="none" stroke="var(--surface-2)" strokeWidth="7" />
      <circle cx="32" cy="32" r="26" fill="none" stroke="var(--success)" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${C * value} ${C}`} transform="rotate(-90 32 32)" style={{ transition: "stroke-dasharray .6s" }} />
      <circle cx="32" cy="32" r="18" fill="none" stroke="var(--surface-2)" strokeWidth="5" />
      <circle cx="32" cy="32" r="18" fill="none" stroke="var(--xp)" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${c * inner} ${c}`} transform="rotate(-90 32 32)" />
      <text x="32" y="36" textAnchor="middle" fontSize="12" fontWeight="900" fill="var(--text)">{label}</text>
    </svg>
  );
}

export default function Page() {
  return (
    <Gate>
      <Dashboard />
    </Gate>
  );
}
