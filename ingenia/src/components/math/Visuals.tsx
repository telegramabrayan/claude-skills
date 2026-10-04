"use client";
import type { Visual } from "@/engine/types";
import { fmt } from "@/engine/math/parser";
import { Plot } from "./Plot";

const COLORS = ["var(--primary)", "var(--accent)", "var(--c-physics)"];

export function VectorView({ vectors, size = 260 }: { vectors: { x: number; y: number; label?: string }[]; size?: number }) {
  const max = Math.max(4, ...vectors.flatMap((v) => [Math.abs(v.x), Math.abs(v.y)])) * 1.2;
  const s = (v: number) => (v / max) * (size / 2);
  const c = size / 2;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-auto w-full max-w-xs rounded-xl bg-surface-2" role="img" aria-label={`Vectores: ${vectors.map((v) => `${v.label ?? ""} (${fmt(v.x, 2)}, ${fmt(v.y, 2)})`).join(", ")}`}>
      <defs>
        {COLORS.map((col, i) => (
          <marker key={i} id={`arrow-${i}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={col} />
          </marker>
        ))}
      </defs>
      <line x1={0} x2={size} y1={c} y2={c} stroke="var(--muted)" strokeWidth={1} />
      <line y1={0} y2={size} x1={c} x2={c} stroke="var(--muted)" strokeWidth={1} />
      {vectors.map((v, i) => (
        <g key={i}>
          <line x1={c} y1={c} x2={c + s(v.x)} y2={c - s(v.y)} stroke={COLORS[i % 3]} strokeWidth={3} markerEnd={`url(#arrow-${i % 3})`} />
          <text x={c + s(v.x) + 6} y={c - s(v.y) - 6} fontSize={12} fill={COLORS[i % 3]} fontWeight={700}>
            {v.label ?? ""}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function NumberLineView({ min, max, marks = [] }: { min: number; max: number; marks?: number[] }) {
  const W = 400;
  const span = max - min;
  const step = span > 30 ? 5 : span > 15 ? 2 : 1;
  const sx = (v: number) => 20 + ((v - min) / span) * (W - 40);
  const ticks: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max; v += step) ticks.push(v);
  return (
    <svg viewBox={`0 0 ${W} 70`} className="h-auto w-full rounded-xl bg-surface-2" role="img" aria-label={`Recta numérica de ${min} a ${max}`}>
      <line x1={10} x2={W - 10} y1={35} y2={35} stroke="var(--muted)" strokeWidth={1.5} />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={sx(t)} x2={sx(t)} y1={30} y2={40} stroke="var(--muted)" />
          <text x={sx(t)} y={56} fontSize={10} textAnchor="middle" fill={t === 0 ? "var(--text)" : "var(--muted)"} fontWeight={t === 0 ? 700 : 400}>
            {fmt(t)}
          </text>
        </g>
      ))}
      {marks.map((m, i) => (
        <circle key={i} cx={sx(m)} cy={35} r={6} fill={i === 0 ? "var(--accent)" : "var(--primary)"} stroke="var(--surface)" strokeWidth={2} />
      ))}
    </svg>
  );
}

/** Visual opcional que acompaña a un ejercicio. */
export function ExerciseVisual({ visual }: { visual: Visual }) {
  if (visual.type === "plot") {
    const xs = visual.points?.map((p) => p[0]) ?? [];
    const xRange = visual.xRange ?? ([Math.min(-6, ...xs.map((x) => x - 2)), Math.max(6, ...xs.map((x) => x + 2))] as [number, number]);
    return <Plot fns={visual.functions.map((expr) => ({ expr }))} xRange={xRange} yRange={visual.yRange} points={visual.points} height={220} />;
  }
  if (visual.type === "vector") return <VectorView vectors={visual.vectors} />;
  return <NumberLineView min={visual.min} max={visual.max} marks={visual.marks} />;
}
