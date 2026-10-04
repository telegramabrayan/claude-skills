"use client";
import { useMemo } from "react";
import { compileFn, fmt } from "@/engine/math/parser";

export interface PlotFn {
  expr?: string;
  fn?: (x: number) => number;
  color?: string;
  label?: string;
}

interface Props {
  fns: PlotFn[];
  xRange?: [number, number];
  yRange?: [number, number];
  points?: [number, number][];
  height?: number;
  xLabel?: string;
  yLabel?: string;
  /** Línea vertical opcional (p. ej. el instante actual de una simulación). */
  marker?: number;
}

const W = 400;
const PALETTE = ["var(--primary)", "var(--accent)", "var(--c-physics)", "var(--c-math)"];

function niceStep(span: number): number {
  const raw = span / 8;
  const p = 10 ** Math.floor(Math.log10(raw));
  const m = raw / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}

export function Plot({ fns, xRange = [-6, 6], yRange, points = [], height = 260, xLabel = "x", yLabel = "y", marker }: Props) {
  const compiled = useMemo(
    () =>
      fns.map((f, i) => {
        let fn = f.fn;
        if (!fn && f.expr) {
          try {
            fn = compileFn(f.expr);
          } catch {
            fn = () => NaN;
          }
        }
        return { fn: fn ?? (() => NaN), color: f.color ?? PALETTE[i % PALETTE.length], label: f.label };
      }),
    [fns],
  );

  const H = (height / 260) * 260;
  const [x0, x1] = xRange;
  const samples = 240;

  const [y0, y1] = useMemo(() => {
    if (yRange) return yRange;
    const ys: number[] = [];
    for (const c of compiled)
      for (let k = 0; k <= samples; k++) {
        const v = c.fn(x0 + ((x1 - x0) * k) / samples);
        if (Number.isFinite(v)) ys.push(v);
      }
    points.forEach((p) => ys.push(p[1]));
    if (!ys.length) return [-6, 6] as [number, number];
    ys.sort((a, b) => a - b);
    let lo = ys[Math.floor(ys.length * 0.03)];
    let hi = ys[Math.ceil(ys.length * 0.97) - 1];
    lo = Math.min(lo, 0, ...points.map((p) => p[1]));
    hi = Math.max(hi, 0, ...points.map((p) => p[1]));
    if (hi - lo < 1e-6) {
      lo -= 1;
      hi += 1;
    }
    const pad = (hi - lo) * 0.12;
    return [lo - pad, hi + pad] as [number, number];
  }, [compiled, x0, x1, yRange, points]);

  const sx = (x: number) => ((x - x0) / (x1 - x0)) * W;
  const sy = (y: number) => H - ((y - y0) / (y1 - y0)) * H;

  const paths = compiled.map((c) => {
    let d = "";
    let pen = false;
    let prevY = 0;
    for (let k = 0; k <= samples; k++) {
      const x = x0 + ((x1 - x0) * k) / samples;
      const y = c.fn(x);
      const ok = Number.isFinite(y) && Math.abs(y - y0) < (y1 - y0) * 20;
      const jump = pen && Math.abs(y - prevY) > (y1 - y0) * 1.5;
      if (!ok || jump) {
        pen = false;
        if (!ok) continue;
      }
      d += `${pen ? "L" : "M"}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`;
      pen = true;
      prevY = y;
    }
    return { d, color: c.color };
  });

  const xs = niceStep(x1 - x0);
  const ys = niceStep(y1 - y0);
  const xTicks: number[] = [];
  for (let v = Math.ceil(x0 / xs) * xs; v <= x1 + 1e-9; v += xs) xTicks.push(Math.round(v * 1e6) / 1e6);
  const yTicks: number[] = [];
  for (let v = Math.ceil(y0 / ys) * ys; v <= y1 + 1e-9; v += ys) yTicks.push(Math.round(v * 1e6) / 1e6);

  const axisX = y0 <= 0 && y1 >= 0 ? sy(0) : H;
  const axisY = x0 <= 0 && x1 >= 0 ? sx(0) : 0;
  const description = fns.map((f) => f.label ?? f.expr).filter(Boolean).join(", ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full touch-none select-none rounded-xl bg-surface-2" role="img" aria-label={`Gráfico de ${description || "funciones"}`}>
      {xTicks.map((t) => (
        <line key={`gx${t}`} x1={sx(t)} x2={sx(t)} y1={0} y2={H} stroke="var(--border)" strokeWidth={0.6} />
      ))}
      {yTicks.map((t) => (
        <line key={`gy${t}`} y1={sy(t)} y2={sy(t)} x1={0} x2={W} stroke="var(--border)" strokeWidth={0.6} />
      ))}
      <line x1={0} x2={W} y1={axisX} y2={axisX} stroke="var(--muted)" strokeWidth={1.2} />
      <line y1={0} y2={H} x1={axisY} x2={axisY} stroke="var(--muted)" strokeWidth={1.2} />
      {xTicks.filter((t) => t !== 0).map((t) => (
        <text key={`lx${t}`} x={sx(t)} y={Math.min(H - 3, axisX + 12)} fontSize={9} textAnchor="middle" fill="var(--muted)">
          {fmt(t, 2)}
        </text>
      ))}
      {yTicks.filter((t) => t !== 0).map((t) => (
        <text key={`ly${t}`} x={Math.max(3, axisY - 4)} y={sy(t) + 3} fontSize={9} textAnchor={axisY > 20 ? "end" : "start"} fill="var(--muted)">
          {fmt(t, 2)}
        </text>
      ))}
      <text x={W - 4} y={axisX - 5} fontSize={10} textAnchor="end" fill="var(--muted)" fontStyle="italic">
        {xLabel}
      </text>
      <text x={axisY + 5} y={11} fontSize={10} fill="var(--muted)" fontStyle="italic">
        {yLabel}
      </text>
      {marker !== undefined && <line x1={sx(marker)} x2={sx(marker)} y1={0} y2={H} stroke="var(--accent)" strokeDasharray="4 3" strokeWidth={1.2} />}
      {paths.map((p, i) => (
        <path key={i} d={p.d} fill="none" stroke={p.color} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" />
      ))}
      {points.map(([px, py], i) => (
        <g key={i}>
          <circle cx={sx(px)} cy={sy(py)} r={4.5} fill="var(--accent)" stroke="var(--surface)" strokeWidth={1.5} />
          <text x={sx(px) + 7} y={sy(py) - 7} fontSize={10} fill="var(--text)" fontWeight={600}>
            ({fmt(px, 2)}; {fmt(py, 2)})
          </text>
        </g>
      ))}
    </svg>
  );
}
