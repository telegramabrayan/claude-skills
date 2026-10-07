import type { ReactNode } from "react";

export function ProgressBar({ value, color = "var(--primary)", label, className = "", height = 8 }: { value: number; color?: string; label?: string; className?: string; height?: number }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-surface-2 ${className}`}
      style={{ height }}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className="relative h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, background: color }}>
        {height >= 12 && pct > 4 && <span className="absolute inset-x-2 top-[22%] h-[22%] rounded-full bg-white/35" />}
      </div>
    </div>
  );
}

export function Ring({ value, size = 56, stroke = 6, color = "var(--primary)", children }: { value: number; size?: number; stroke?: number; color?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--surface-2)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeDasharray={c} strokeDashoffset={c * (1 - v)} strokeLinecap="round" className="transition-[stroke-dashoffset] duration-700" />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-xs font-bold">{children}</div>
    </div>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: ReactNode; children?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      </div>
      {children}
    </header>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 mt-8 flex items-center justify-between gap-2">
      <h2 className="text-lg font-bold">{children}</h2>
      {action}
    </div>
  );
}

export function Stat({ label, value, hint, color }: { label: string; value: ReactNode; hint?: ReactNode; color?: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-2xl font-bold" style={color ? { color } : undefined}>
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="card p-6 text-center">
      <p className="font-semibold">{title}</p>
      {children && <div className="mt-2 text-sm text-muted">{children}</div>}
    </div>
  );
}

export function Loading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Cargando">
      <div className="h-8 w-1/3 animate-pulse rounded-lg bg-surface-2" />
      <div className="h-40 animate-pulse rounded-2xl bg-surface-2" />
      <div className="h-24 animate-pulse rounded-2xl bg-surface-2" />
    </div>
  );
}

export const SUBJECT_COLORS: Record<string, string> = {
  prep: "var(--c-prep)",
  math: "var(--c-math)",
  algebra: "var(--c-algebra)",
  physics: "var(--c-physics)",
  code: "var(--c-code)",
  humanities: "var(--c-humanities)",
  chem: "var(--c-chem)",
  later: "var(--c-later)",
};
