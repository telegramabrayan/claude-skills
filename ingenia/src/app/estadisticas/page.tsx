"use client";
import Link from "next/link";
import type { SkillId } from "@/engine/types";
import { accuracy, currentStreak, levelInfo, MASTERED } from "@/engine/progress/rules";
import { formatMinutes, lastDays, parseDay, weekStart, addDays, dayKey } from "@/engine/progress/dates";
import { SUBJECTS } from "@/content/curriculum";
import { TOPICS, getTopic, SKILL_LABELS } from "@/content/topics";
import { ACHIEVEMENTS } from "@/content/achievements";
import { useProgress } from "@/lib/store";
import { Gate } from "@/components/layout/Gate";
import { Heatmap } from "@/components/ui/Heatmap";
import { PageHeader, ProgressBar, SectionTitle, Stat, Empty } from "@/components/ui/primitives";
import { BarChart } from "@/components/ui/BarChart";

const DOW = ["D", "L", "M", "X", "J", "V", "S"];

function Stats() {
  const s = useProgress();
  const totalSeconds = Object.values(s.days).reduce((a, d) => a + d.seconds, 0);
  const correct = s.attempts.filter((a) => a.correct).length;
  const mastered = TOPICS.filter((t) => (s.topics[t.id]?.mastery ?? 0) >= MASTERED).length;
  const { level } = levelInfo(s.xp);
  const week = lastDays(7);
  const month = lastDays(30);

  // Precisión por semana (últimas 6).
  const thisWeek = weekStart(dayKey());
  const weeks = Array.from({ length: 6 }, (_, i) => addDays(thisWeek, -7 * (5 - i)));
  const weekAcc = weeks.map((ws) => {
    const we = addDays(ws, 6);
    const att = s.attempts.filter((a) => {
      const k = dayKey(new Date(a.ts));
      return k >= ws && k <= we;
    });
    return { label: parseDay(ws).toLocaleDateString("es-AR", { day: "numeric", month: "numeric" }), value: att.length ? Math.round((att.filter((a) => a.correct).length / att.length) * 100) : 0 };
  });

  const practiced = TOPICS.filter((t) => (s.topics[t.id]?.attempts ?? 0) > 0);
  const weakest = [...practiced].sort((a, b) => (s.topics[a.id]?.mastery ?? 0) - (s.topics[b.id]?.mastery ?? 0)).slice(0, 4);

  const subjectMastery = SUBJECTS.map((sub) => {
    const ids = [...new Set(sub.units.flatMap((u) => u.topicIds))].filter((t) => s.topics[t]?.attempts);
    const m = ids.length ? ids.reduce((a, t) => a + (s.topics[t]?.mastery ?? 0), 0) / ids.length : null;
    return { sub, m };
  }).filter((x): x is { sub: (typeof SUBJECTS)[number]; m: number } => x.m !== null).sort((a, b) => b.m - a.m);

  const skills = Object.keys(SKILL_LABELS) as SkillId[];
  const skillMastery = (k: SkillId) => {
    const ids = TOPICS.filter((t) => t.skill === k).map((t) => s.topics[t.id]?.mastery ?? 0);
    return ids.reduce((a, b) => a + b, 0) / ids.length;
  };

  return (
    <div>
      <PageHeader title="Estadísticas" subtitle="Tu evolución, en números." />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Tiempo estudiado" value={formatMinutes(totalSeconds)} />
        <Stat label="Ejercicios" value={s.attempts.length} hint={`${correct} correctos`} />
        <Stat label="Precisión" value={`${Math.round(accuracy(s) * 100)}%`} />
        <Stat label="Temas dominados" value={`${mastered}/${TOPICS.length}`} color="var(--xp)" />
        <Stat label="Racha" value={`🔥 ${currentStreak(s)}`} hint={`Máxima: ${s.streak.longest} días`} />
        <Stat label="Nivel" value={level} hint={`${s.xp.toLocaleString("es-AR")} XP totales`} />
        <Stat label="Lecciones" value={Object.values(s.lessons).filter((l) => l.status === "completada").length} />
        <Stat label="Logros" value={`${Object.keys(s.achievements).length}/${ACHIEVEMENTS.length}`} />
      </div>

      <SectionTitle>Constancia</SectionTitle>
      <Heatmap days={s.days} />

      <div className="grid gap-4 md:grid-cols-2">
        <section>
          <SectionTitle>Esta semana · minutos por día</SectionTitle>
          <div className="card p-4">
            <BarChart label="Minutos por día" data={week.map((d) => ({ label: DOW[parseDay(d).getDay()], value: Math.round((s.days[d]?.seconds ?? 0) / 60) }))} unit=" min" />
          </div>
        </section>
        <section>
          <SectionTitle>Últimos 30 días · XP</SectionTitle>
          <div className="card p-4">
            <BarChart label="XP por día" color="var(--xp)" data={month.map((d) => ({ label: String(parseDay(d).getDate()), value: s.days[d]?.xp ?? 0 }))} />
          </div>
        </section>
        <section>
          <SectionTitle>Precisión por semana</SectionTitle>
          <div className="card p-4">
            <BarChart label="Porcentaje de aciertos por semana" color="var(--success)" data={weekAcc} unit="%" />
          </div>
        </section>
        <section>
          <SectionTitle>Por habilidad</SectionTitle>
          <div className="card space-y-3 p-4">
            {skills.map((k) => {
              const m = skillMastery(k);
              const base = s.diagnostic?.skills[k];
              return (
                <div key={k}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{SKILL_LABELS[k]}</span>
                    <span className="text-muted">
                      {Math.round(m * 100)}%{base !== undefined && <> · diagnóstico {Math.round(base * 100)}%</>}
                    </span>
                  </div>
                  <ProgressBar value={m} label={SKILL_LABELS[k]} />
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section>
          <SectionTitle>Mejores materias</SectionTitle>
          {subjectMastery.length ? (
            <div className="card space-y-3 p-4">
              {subjectMastery.map(({ sub, m }) => (
                <div key={sub.id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{sub.name}</span>
                    <span className="text-muted">{Math.round(m * 100)}%</span>
                  </div>
                  <ProgressBar value={m} label={sub.name} />
                </div>
              ))}
            </div>
          ) : (
            <Empty title="Todavía sin datos">Practicá un poco y aparecen acá.</Empty>
          )}
        </section>
        <section>
          <SectionTitle action={<Link href="/errores" className="text-sm font-semibold text-primary">Mis errores</Link>}>Puntos débiles</SectionTitle>
          {weakest.length ? (
            <div className="card divide-y divide-line">
              {weakest.map((t) => (
                <Link key={t.id} href={`/practicar?tema=${t.id}`} className="flex items-center justify-between p-3 hover:bg-surface-2">
                  <span>{getTopic(t.id)?.name}</span>
                  <span className="text-sm font-semibold text-warn">{Math.round((s.topics[t.id]?.mastery ?? 0) * 100)}%</span>
                </Link>
              ))}
            </div>
          ) : (
            <Empty title="Todavía sin datos" />
          )}
        </section>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Gate>
      <Stats />
    </Gate>
  );
}
