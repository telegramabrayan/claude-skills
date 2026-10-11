"use client";
/** Piezas visuales compartidas por la Misión Física. */
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { EXAM_DATE } from "@/content/fisica/mission";
import { readinessLevel } from "@/lib/fisicaMission";

export function Bar({ value, label, right, color, sub }: { value: number | null; label: ReactNode; right?: ReactNode; color?: string; sub?: ReactNode }) {
  const pct = value === null ? 0 : Math.round(value * 100);
  const lvl = value === null ? null : readinessLevel(value);
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
        <span className="min-w-0 font-bold">{label}</span>
        <span className="shrink-0 font-black" style={{ color: color ?? lvl?.color }}>
          {right ?? (value === null ? <span className="text-xs font-semibold text-muted">sin datos</span> : `${pct} %`)}
        </span>
      </div>
      <div className="pbar !h-3" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={typeof label === "string" ? label : undefined}>
        <span style={{ width: `${Math.max(value === null ? 0 : 2, pct)}%`, ["--bar" as string]: color ?? lvl?.color ?? "var(--border)" }} />
      </div>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}

export function Flames({ n }: { n: number }) {
  return (
    <span aria-label={`Importancia ${n} de 5`} title={`Importancia ${n} de 5`}>
      {"🔥".repeat(n)}
      <span className="opacity-20">{"🔥".repeat(5 - n)}</span>
    </span>
  );
}

/** Cuenta regresiva dinámica hasta el parcial. */
export function Countdown({ big }: { big?: boolean }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);
  const target = new Date(`${EXAM_DATE}T08:00:00`).getTime();
  const ms = target - now;
  if (ms <= 0) return <span className="font-black">{ms > -86400000 ? "¡Es hoy!" : "Parcial rendido"}</span>;
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  return (
    <span className={big ? "text-4xl font-black sm:text-5xl" : "font-black"} aria-label={`Faltan ${days} días y ${hours} horas`}>
      {days} <span className={big ? "text-xl" : ""}>días</span> {hours} <span className={big ? "text-xl" : ""}>h</span>
    </span>
  );
}

export function LevelBadge({ value }: { value: number }) {
  const l = readinessLevel(value);
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black" style={{ background: `color-mix(in srgb, ${l.color} 18%, transparent)`, color: l.color }}>
      {l.icon} {l.label}
    </span>
  );
}

export function BackToMission() {
  return (
    <Link href="/fisica" className="btn btn-ghost mb-2 !px-2 text-sm">
      ← Misión Física
    </Link>
  );
}

export function SectionCard({ title, icon, children, action }: { title: string; icon?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="card p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-lg font-black">
          {icon && <span aria-hidden>{icon} </span>}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
