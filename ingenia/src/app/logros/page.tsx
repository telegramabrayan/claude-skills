"use client";
import { ACHIEVEMENTS } from "@/content/achievements";
import { currentMissions, type Mission } from "@/content/missions";
import { actions, useProgress } from "@/lib/store";
import { Gate } from "@/components/layout/Gate";
import { PageHeader, ProgressBar, SectionTitle } from "@/components/ui/primitives";

function MissionCard({ m }: { m: Mission }) {
  const complete = m.progress >= m.target;
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold">{m.title}</p>
        <span className="shrink-0 text-sm font-bold text-xp">+{m.xp} XP</span>
      </div>
      <ProgressBar value={m.progress / m.target} className="mt-3" color={complete ? "var(--success)" : "var(--primary)"} label={m.title} />
      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="text-muted">
          {m.progress}/{m.target}
        </span>
        {m.claimed ? (
          <span className="font-semibold text-success">✓ Reclamada</span>
        ) : complete ? (
          <button className="btn btn-primary !min-h-9" onClick={() => actions.claimMission(m.key, m.xp)}>
            Reclamar
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Achievements() {
  const s = useProgress();
  const missions = currentMissions(s);
  const unlocked = ACHIEVEMENTS.filter((a) => s.achievements[a.id]).length;
  return (
    <div>
      <PageHeader title="Logros y misiones" subtitle={`${unlocked} de ${ACHIEVEMENTS.length} logros desbloqueados`} />
      <SectionTitle>Misiones diarias</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-3">{missions.filter((m) => m.kind === "diaria").map((m) => <MissionCard key={m.key} m={m} />)}</div>
      <SectionTitle>Misiones semanales</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2">{missions.filter((m) => m.kind === "semanal").map((m) => <MissionCard key={m.key} m={m} />)}</div>
      <SectionTitle>Desafío especial</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2">{missions.filter((m) => m.kind === "especial").map((m) => <MissionCard key={m.key} m={m} />)}</div>

      <SectionTitle>Logros</SectionTitle>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {ACHIEVEMENTS.map((a) => {
          const date = s.achievements[a.id];
          return (
            <div key={a.id} className={`card flex flex-col items-center p-4 text-center ${date ? "" : "opacity-50 grayscale"}`}>
              <span className="text-4xl" aria-hidden>
                {a.icon}
              </span>
              <span className="mt-2 font-bold leading-tight">{a.title}</span>
              <span className="mt-1 text-xs text-muted">{a.description}</span>
              {date ? <span className="mt-2 text-xs font-semibold text-success">{new Date(date).toLocaleDateString("es-AR")}</span> : <span className="mt-2 text-xs">🔒</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Gate>
      <Achievements />
    </Gate>
  );
}
