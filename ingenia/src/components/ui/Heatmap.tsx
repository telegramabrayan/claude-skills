"use client";
import { useState } from "react";
import type { DayStats } from "@/engine/progress/state";
import { addDays, dayKey, parseDay, weekStart } from "@/engine/progress/dates";

const RANGES = [
  { id: "mes", label: "Mes", weeks: 5 },
  { id: "3m", label: "3 meses", weeks: 13 },
  { id: "anio", label: "Año", weeks: 53 },
] as const;

const ROWS = ["L", "", "X", "", "V", "", "D"];

/** Mapa de calor de actividad: una celda por día, más intensa cuantos más minutos. */
export function Heatmap({ days }: { days: Record<string, DayStats> }) {
  const [range, setRange] = useState<(typeof RANGES)[number]["id"]>("3m");
  const weeks = RANGES.find((r) => r.id === range)!.weeks;
  const today = dayKey();
  const start = addDays(weekStart(today), -7 * (weeks - 1));
  const level = (d: string) => {
    const st = days[d];
    if (!st || (!st.seconds && !st.exercises)) return 0;
    const min = st.seconds / 60;
    return min >= 45 ? 4 : min >= 20 ? 3 : min >= 8 ? 2 : 1;
  };
  const active = Array.from({ length: weeks * 7 }, (_, i) => addDays(start, i)).filter((d) => d <= today && level(d) > 0).length;
  const cell = weeks > 20 ? 11 : weeks > 8 ? 16 : 26;
  return (
    <div className="card p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted">
          {active} {active === 1 ? "día activo" : "días activos"}
        </p>
        <div className="flex gap-1" role="radiogroup" aria-label="Período">
          {RANGES.map((r) => (
            <button key={r.id} role="radio" aria-checked={range === r.id} className={`chip !min-h-8 ${range === r.id ? "!bg-primary-soft !text-primary" : ""}`} onClick={() => setRange(r.id)}>
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto pb-1" role="img" aria-label={`Actividad: ${active} días activos en el período`}>
        <div className="flex flex-col gap-[3px] pr-1">
          {ROWS.map((r, i) => (
            <span key={i} className="text-[10px] leading-none text-muted" style={{ height: cell }}>
              {r}
            </span>
          ))}
        </div>
        {Array.from({ length: weeks }, (_, w) => (
          <div key={w} className="flex flex-col gap-[3px]">
            {Array.from({ length: 7 }, (_, d) => {
              const day = addDays(start, w * 7 + d);
              const future = day > today;
              const lv = level(day);
              return (
                <span
                  key={d}
                  title={future ? "" : `${parseDay(day).toLocaleDateString("es-AR")}: ${Math.round((days[day]?.seconds ?? 0) / 60)} min, ${days[day]?.exercises ?? 0} ejercicios`}
                  className="block rounded-[3px]"
                  style={{
                    width: cell,
                    height: cell,
                    background: future ? "transparent" : lv ? `color-mix(in srgb, var(--primary) ${[0, 30, 55, 80, 100][lv]}%, var(--surface-2))` : "var(--surface-2)",
                    outline: day === today ? "2px solid var(--primary)" : undefined,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-muted">
        Menos
        {[0, 1, 2, 3, 4].map((l) => (
          <span key={l} className="inline-block h-2.5 w-2.5 rounded-[2px]" style={{ background: l ? `color-mix(in srgb, var(--primary) ${[0, 30, 55, 80, 100][l]}%, var(--surface-2))` : "var(--surface-2)" }} />
        ))}
        Más
      </div>
    </div>
  );
}
