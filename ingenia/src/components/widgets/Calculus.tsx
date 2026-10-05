"use client";
import { useMemo, useState } from "react";
import { compileFn, fmt } from "@/engine/math/parser";
import { Plot } from "../math/Plot";
import { Slider } from "./Simple";

/** Triángulo rectángulo con ángulo e hipotenusa ajustables: muestra seno, coseno y tangente. */
export function TrigWidget({ angle: a0, hyp: h0 }: { angle: number; hyp: number }) {
  const [ang, setAng] = useState(a0);
  const [h, setH] = useState(h0);
  const rad = (ang * Math.PI) / 180;
  const adj = h * Math.cos(rad);
  const opp = h * Math.sin(rad);
  const W = 320, H = 200, pad = 24;
  const scale = Math.min((W - 2 * pad) / Math.max(adj, 1), (H - 2 * pad) / Math.max(opp, 1)) * 0.95;
  const A = [pad, H - pad], B = [pad + adj * scale, H - pad], C = [pad + adj * scale, H - pad - opp * scale];
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full max-w-md rounded-xl bg-surface-2" role="img" aria-label={`Triángulo con ángulo ${ang} grados e hipotenusa ${h}`}>
        <polygon points={`${A} ${B} ${C}`} fill="var(--primary-soft)" stroke="var(--primary)" strokeWidth={2} />
        <rect x={B[0] - 10} y={B[1] - 10} width={10} height={10} fill="none" stroke="var(--muted)" />
        <path d={`M ${A[0] + 28} ${A[1]} A 28 28 0 0 0 ${A[0] + 28 * Math.cos(rad)} ${A[1] - 28 * Math.sin(rad)}`} fill="none" stroke="var(--accent)" strokeWidth={2} />
        <text x={A[0] + 34} y={A[1] - 8} fontSize={12} fill="var(--accent)" fontWeight={700}>α</text>
        <text x={(A[0] + B[0]) / 2} y={A[1] + 16} fontSize={11} textAnchor="middle" fill="var(--text)">adyacente {fmt(adj, 2)}</text>
        <text x={B[0] + 4} y={(B[1] + C[1]) / 2} fontSize={11} fill="var(--text)">opuesto {fmt(opp, 2)}</text>
        <text x={(A[0] + C[0]) / 2 - 8} y={(A[1] + C[1]) / 2 - 8} fontSize={11} textAnchor="end" fill="var(--text)">h = {fmt(h, 1)}</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Ángulo α" value={ang} min={5} max={85} onChange={setAng} suffix="°" />
        <Slider label="Hipotenusa" value={h} min={1} max={20} onChange={setH} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-sm" aria-live="polite">
        <div className="rounded-lg bg-surface-2 p-2"><div className="text-muted">sen α</div><div className="font-mono font-bold">{fmt(Math.sin(rad), 3)}</div><div className="text-xs text-muted">opuesto/h</div></div>
        <div className="rounded-lg bg-surface-2 p-2"><div className="text-muted">cos α</div><div className="font-mono font-bold">{fmt(Math.cos(rad), 3)}</div><div className="text-xs text-muted">adyacente/h</div></div>
        <div className="rounded-lg bg-surface-2 p-2"><div className="text-muted">tan α</div><div className="font-mono font-bold">{fmt(Math.tan(rad), 3)}</div><div className="text-xs text-muted">opuesto/adyacente</div></div>
      </div>
      <p className="text-center text-xs text-muted">Cambiá la hipotenusa: los lados cambian, pero sen, cos y tan dependen solo del ángulo.</p>
    </div>
  );
}

/** Recta tangente móvil sobre una función: la pendiente es la derivada. */
export function TangentWidget({ initial }: { initial: string }) {
  const [a, setA] = useState(1);
  const fn = useMemo(() => compileFn(initial), [initial]);
  const h = 1e-5;
  const slope = (fn(a + h) - fn(a - h)) / (2 * h);
  const fa = fn(a);
  return (
    <div className="space-y-3">
      <Plot fns={[{ expr: initial, label: "f" }, { fn: (x) => fa + slope * (x - a), color: "var(--accent)", label: "tangente" }]} xRange={[-4, 4]} yRange={[-4, 10]} points={[[a, fa]]} />
      <Slider label="Punto x" value={a} min={-3} max={3} step={0.1} onChange={setA} />
      <p className="rounded-lg bg-surface-2 p-2 text-center" aria-live="polite">
        Pendiente de la tangente en x = {fmt(a, 1)}: <strong className="text-accent">{fmt(slope, 2)}</strong>
        <span className="ml-2 text-sm text-muted">{Math.abs(slope) < 0.05 ? "(horizontal)" : slope > 0 ? "(la función sube)" : "(la función baja)"}</span>
      </p>
    </div>
  );
}

/** Mover x y ver el punto (x, f(x)) sobre el gráfico. */
export function FunctionPointWidget({ expr }: { expr: string }) {
  const [x, setX] = useState(-2);
  const fn = useMemo(() => compileFn(expr), [expr]);
  const y = fn(x);
  return (
    <div className="space-y-3">
      <Plot fns={[{ expr }]} xRange={[-4, 4]} points={[[x, y]]} />
      <Slider label="x" value={x} min={-3} max={3} step={0.5} onChange={setX} />
      <p className="math rounded-lg bg-surface-2 p-2 text-center text-lg" aria-live="polite">
        x = {fmt(x, 1)} → f({fmt(x, 1)}) = <strong className="text-primary">{fmt(y, 2)}</strong> → punto ({fmt(x, 1)}; {fmt(y, 2)})
      </p>
    </div>
  );
}
