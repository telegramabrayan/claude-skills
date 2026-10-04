"use client";
import Link from "next/link";
import type { CareerGoal } from "@/engine/types";
import { currentStreak, levelInfo, MASTERED } from "@/engine/progress/rules";
import { formatMinutes } from "@/engine/progress/dates";
import { ACHIEVEMENTS } from "@/content/achievements";
import { SKILL_LABELS, TOPICS } from "@/content/topics";
import { actions, useProgress } from "@/lib/store";
import { Gate } from "@/components/layout/Gate";
import { PageHeader, ProgressBar, SectionTitle, Ring } from "@/components/ui/primitives";

const GOALS: { id: CareerGoal; label: string }[] = [
  { id: "industrial", label: "Ingeniería Industrial" },
  { id: "informatica", label: "Ingeniería Informática" },
  { id: "ambas", label: "Ambas" },
];

function Profile() {
  const s = useProgress();
  const { level, into, needed } = levelInfo(s.xp);
  const seconds = Object.values(s.days).reduce((a, d) => a + d.seconds, 0);
  const recentAch = ACHIEVEMENTS.filter((a) => s.achievements[a.id]).sort((a, b) => s.achievements[b.id].localeCompare(s.achievements[a.id])).slice(0, 4);
  return (
    <div>
      <PageHeader title="Perfil" />
      <div className="card flex flex-wrap items-center gap-5 p-5">
        <Ring value={into / needed} size={88} stroke={8} color="var(--xp)">
          <span className="text-xl">{level}</span>
        </Ring>
        <div className="min-w-0 flex-1">
          <label className="block">
            <span className="sr-only">Nombre</span>
            <input className="input !min-h-10 max-w-xs text-xl font-bold" defaultValue={s.profile.name} placeholder="Tu nombre" onBlur={(e) => actions.setName(e.target.value.trim())} aria-label="Nombre" />
          </label>
          <p className="mt-1 text-sm text-muted">
            Nivel {level} · {s.xp.toLocaleString("es-AR")} XP · 🔥 {currentStreak(s)} días · {formatMinutes(seconds)} de estudio
          </p>
          <p className="text-xs text-muted">Estudiando desde el {new Date(s.profile.createdAt).toLocaleDateString("es-AR")}</p>
        </div>
      </div>

      <SectionTitle>Objetivo</SectionTitle>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Carrera objetivo">
        {GOALS.map((g) => (
          <button key={g.id} role="radio" aria-checked={s.profile.goal === g.id} onClick={() => actions.setGoal(g.id)} className={`btn ${s.profile.goal === g.id ? "btn-primary" : "btn-secondary"}`}>
            {g.label}
          </button>
        ))}
      </div>

      <SectionTitle action={<Link href="/diagnostico" className="text-sm font-semibold text-primary">{s.diagnostic ? "Ver / repetir" : "Hacer diagnóstico"}</Link>}>Diagnóstico inicial</SectionTitle>
      {s.diagnostic ? (
        <div className="card space-y-3 p-4">
          {(Object.entries(s.diagnostic.skills) as [keyof typeof SKILL_LABELS, number][]).map(([k, v]) => (
            <div key={k}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{SKILL_LABELS[k]}</span>
                <span>{Math.round(v * 100)}%</span>
              </div>
              <ProgressBar value={v} label={SKILL_LABELS[k]} />
            </div>
          ))}
          <p className="text-xs text-muted">Realizado el {new Date(s.diagnostic.completedAt).toLocaleDateString("es-AR")}</p>
        </div>
      ) : (
        <p className="text-muted">Todavía no hiciste el diagnóstico.</p>
      )}

      <SectionTitle>Temas dominados</SectionTitle>
      <div className="flex flex-wrap gap-2">
        {TOPICS.filter((t) => (s.topics[t.id]?.mastery ?? 0) >= MASTERED).map((t) => (
          <span key={t.id} className="chip !bg-xp-soft !text-xp">
            ⭐ {t.name}
          </span>
        ))}
        {!TOPICS.some((t) => (s.topics[t.id]?.mastery ?? 0) >= MASTERED) && <p className="text-sm text-muted">Un tema se domina con 85 % de dominio (aciertos sin ayuda en dificultad alta).</p>}
      </div>

      <SectionTitle action={<Link href="/logros" className="text-sm font-semibold text-primary">Todos</Link>}>Últimos logros</SectionTitle>
      <div className="flex flex-wrap gap-3">
        {recentAch.length ? recentAch.map((a) => (
          <span key={a.id} className="card flex items-center gap-2 px-3 py-2">
            <span className="text-2xl">{a.icon}</span>
            <span className="font-semibold">{a.title}</span>
          </span>
        )) : <p className="text-sm text-muted">Todavía ninguno.</p>}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Gate>
      <Profile />
    </Gate>
  );
}
