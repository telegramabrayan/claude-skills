"use client";
/** Tarjeta destacada del inicio: ⚡ MISIÓN: APROBAR FÍSICA. */
import Link from "next/link";
import { useProgress } from "@/lib/store";
import { currentStreak } from "@/engine/progress/rules";
import { daysLeft, globalReadiness, hoursStudied, masteredCount, phaseFor, PHASE_INFO } from "@/lib/fisicaMission";
import { subjectStyle } from "../ui/SubjectArt";
import { Countdown, LevelBadge } from "./ui";

export function MissionCard() {
  const s = useProgress();
  const left = daysLeft();
  if (left < -1) return null;
  const r = globalReadiness(s);
  const { mastered, total, weak } = masteredCount(s);
  const phase = phaseFor(left);
  const streak = currentStreak(s);
  return (
    <section className="card-hero anim-rise" style={subjectStyle("fisica")} aria-labelledby="mision-fisica">
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p id="mision-fisica" className="hero-muted text-sm font-black uppercase tracking-wider text-white/85">
              ⚡ Misión: aprobar Física
            </p>
            <p className="mt-1 text-lg font-black">📅 2.º parcial: 5/11 · 1.er parcial: 6/11</p>
            <p className="hero-muted text-sm text-white/85">🎯 Objetivo: aprobar los dos parciales · Cátedra Torti</p>
          </div>
          <div className="text-right">
            <p className="hero-muted text-xs font-bold uppercase text-white/85">Faltan</p>
            <Countdown />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            ["📊", `${Math.round(r * 100)} %`, "preparación"],
            ["🔥", `${streak}`, streak === 1 ? "día seguido" : "días seguidos"],
            ["⏱", `${hoursStudied(s).toFixed(1).replace(".", ",")} h`, "de Física"],
            ["✅", `${mastered}/${total}`, `dominados · ${weak} a reforzar`],
          ].map(([i, v, l]) => (
            <div key={l} className="rounded-xl bg-white/15 px-3 py-2">
              <p className="text-xl font-black">
                <span aria-hidden>{i}</span> {v}
              </p>
              <p className="hero-muted text-xs font-bold text-white/85">{l}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link href="/fisica" className="btn-3d is-secondary !px-6 text-lg">
            CONTINUAR PREPARACIÓN →
          </Link>
          <span className="rounded-full bg-white/90 px-1 py-0.5">
            <LevelBadge value={r} />
          </span>
          <span className="hero-muted text-xs font-bold text-white/85">
            {PHASE_INFO[phase].icon} Fase: {PHASE_INFO[phase].title}
          </span>
        </div>
      </div>
    </section>
  );
}
