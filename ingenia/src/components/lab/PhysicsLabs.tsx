"use client";
import { useEffect, useState } from "react";
import { fmt } from "@/engine/math/parser";
import { KinematicsWidget, VectorWidget } from "../widgets/Interactive";
import { Slider } from "../widgets/Simple";
import { Plot } from "../math/Plot";

const G = 9.8;

export function NewtonLab() {
  const [m, setM] = useState(10);
  const [F, setF] = useState(50);
  const [mu, setMu] = useState(0.2);
  const [t, setT] = useState(0);
  const [run, setRun] = useState(false);
  const weight = m * G;
  const maxFriction = mu * weight;
  const moving = F > maxFriction;
  const friction = moving ? maxFriction : F;
  const net = F - friction;
  const a = net / m;
  const x = 0.5 * a * t * t;

  useEffect(() => {
    if (!run) return;
    const id = setInterval(() => setT((v) => Math.min(4, v + 0.05)), 50);
    return () => clearInterval(id);
  }, [run]);
  useEffect(() => {
    if (t >= 4) setRun(false);
  }, [t]);
  useEffect(() => setT(0), [m, F, mu]);

  const pos = Math.min(85, (x / Math.max(1, 0.5 * Math.max(a, 0.01) * 16)) * 85);
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Segunda ley de Newton: la fuerza neta produce aceleración, <span className="math">F_neta = m·a</span>. El rozamiento se opone al movimiento y como máximo vale <span className="math">μ·m·g</span>.
      </p>
      <div className="relative h-28 overflow-hidden rounded-xl bg-surface-2" role="img" aria-label={`Bloque de ${m} kg con fuerza ${F} N`}>
        <div className="absolute inset-x-0 bottom-0 h-4 bg-line" />
        <div className="absolute bottom-4 grid h-14 w-16 place-items-center rounded-md bg-primary font-bold text-on-primary transition-[left] duration-75" style={{ left: `${2 + pos}%` }}>
          {m} kg
        </div>
        <div className="absolute bottom-10 text-sm font-bold text-accent" style={{ left: `${Math.min(80, 12 + pos)}%` }}>
          F = {F} N →
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="Masa" value={m} min={1} max={50} onChange={setM} suffix=" kg" />
        <Slider label="Fuerza aplicada" value={F} min={0} max={300} step={5} onChange={setF} suffix=" N" />
        <Slider label="Coef. de rozamiento μ" value={mu} min={0} max={1} step={0.05} onChange={setMu} />
      </div>
      <div className="grid gap-2 text-sm sm:grid-cols-4">
        <div className="rounded-lg bg-surface-2 p-2">Peso: <strong>{fmt(weight, 1)} N</strong></div>
        <div className="rounded-lg bg-surface-2 p-2">Rozamiento: <strong>{fmt(friction, 1)} N</strong></div>
        <div className="rounded-lg bg-surface-2 p-2">Fuerza neta: <strong>{fmt(net, 1)} N</strong></div>
        <div className="rounded-lg bg-primary-soft p-2">a = F/m = <strong>{fmt(a, 2)} m/s²</strong></div>
      </div>
      <p className="text-sm" aria-live="polite">
        {moving ? "La fuerza supera al rozamiento máximo: el bloque acelera." : "La fuerza no alcanza a vencer el rozamiento: el bloque queda quieto (el rozamiento iguala a la fuerza aplicada)."}
      </p>
      <button className="btn btn-primary" onClick={() => { setT(0); setRun(true); }}>
        Empujar durante 4 s
      </button>
      {t > 0 && <p className="text-sm">t = {fmt(t, 1)} s · recorrió {fmt(x, 2)} m</p>}
    </div>
  );
}

export function EnergyLab() {
  const [m, setM] = useState(2);
  const [h0, setH0] = useState(20);
  const [h, setH] = useState(20);
  useEffect(() => setH(h0), [h0]);
  const Ep = m * G * h;
  const Ec = m * G * (h0 - h);
  const E = m * G * h0;
  const v = Math.sqrt(2 * G * (h0 - h));
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Sin rozamiento, la energía mecánica se conserva: lo que pierde la energía potencial <span className="math">E_p = m·g·h</span> lo gana la cinética <span className="math">E_c = ½·m·v^2</span>.
      </p>
      <div className="grid gap-4 sm:grid-cols-[100px_1fr]">
        <div className="relative h-56 rounded-xl bg-surface-2" role="img" aria-label={`Altura ${fmt(h, 1)} m`}>
          <div className="absolute inset-x-0 bottom-0 h-2 rounded-b-xl bg-line" />
          <div className="absolute left-1/2 h-7 w-7 -translate-x-1/2 rounded-full bg-accent" style={{ bottom: `calc(${(h / h0) * 85}% + 8px)` }} />
        </div>
        <div className="space-y-3">
          {[
            { label: "Energía potencial", val: Ep, color: "var(--primary)" },
            { label: "Energía cinética", val: Ec, color: "var(--accent)" },
            { label: "Energía total", val: E, color: "var(--xp)" },
          ].map((b) => (
            <div key={b.label}>
              <div className="flex justify-between text-sm">
                <span>{b.label}</span>
                <strong>{fmt(b.val, 1)} J</strong>
              </div>
              <div className="h-4 overflow-hidden rounded bg-surface-2">
                <div className="h-full" style={{ width: `${(b.val / E) * 100}%`, background: b.color }} />
              </div>
            </div>
          ))}
          <p className="text-sm">Velocidad: <strong>{fmt(v, 2)} m/s</strong></p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="Masa" value={m} min={0.5} max={10} step={0.5} onChange={setM} suffix=" kg" />
        <Slider label="Altura inicial" value={h0} min={1} max={50} onChange={setH0} suffix=" m" />
        <Slider label="Altura actual" value={Math.round(h * 10) / 10} min={0} max={h0} step={0.1} onChange={setH} suffix=" m" />
      </div>
    </div>
  );
}

const FLUIDS = [
  { name: "Agua", rho: 1000 },
  { name: "Agua de mar", rho: 1025 },
  { name: "Aceite", rho: 920 },
  { name: "Mercurio", rho: 13600 },
];

export function PressureLab() {
  const [depth, setDepth] = useState(5);
  const [fluid, setFluid] = useState(0);
  const rho = FLUIDS[fluid].rho;
  const P0 = 101300;
  const Ph = rho * G * depth;
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Presión hidrostática: <span className="math">P = P_0 + ρ·g·h</span>. Solo depende de la profundidad y de la densidad del fluido, no de la forma del recipiente.
      </p>
      <div className="flex flex-wrap gap-2">
        {FLUIDS.map((f, i) => (
          <button key={f.name} onClick={() => setFluid(i)} className={`chip !text-sm ${i === fluid ? "!bg-primary !text-on-primary" : ""}`}>
            {f.name} ({f.rho} kg/m³)
          </button>
        ))}
      </div>
      <Slider label="Profundidad h" value={depth} min={0} max={20} step={0.5} onChange={setDepth} suffix=" m" />
      <div className="grid gap-2 text-sm sm:grid-cols-3">
        <div className="rounded-lg bg-surface-2 p-2">Atmosférica: <strong>{fmt(P0 / 1000, 1)} kPa</strong></div>
        <div className="rounded-lg bg-surface-2 p-2">Por el fluido: <strong>{fmt(Ph / 1000, 1)} kPa</strong></div>
        <div className="rounded-lg bg-primary-soft p-2">Total: <strong>{fmt((P0 + Ph) / 1000, 1)} kPa</strong></div>
      </div>
      <Plot fns={[{ fn: (x) => (P0 + rho * G * x) / 1000 }]} xRange={[0, 20]} marker={depth} xLabel="h (m)" yLabel="P (kPa)" height={200} />
    </div>
  );
}

const PRESETS = {
  mru: { x0: 0, v0: 5, a: 0, label: "MRU" },
  mruv: { x0: 0, v0: 0, a: 2, label: "MRUV (arranque)" },
  frenado: { x0: 0, v0: 20, a: -4, label: "Frenado" },
  tiro: { x0: 0, v0: 19.6, a: -9.8, label: "Tiro vertical" },
};

export function KinematicsLab() {
  const [preset, setPreset] = useState<keyof typeof PRESETS>("mru");
  const p = PRESETS[preset];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(PRESETS) as (keyof typeof PRESETS)[]).map((k) => (
          <button key={k} onClick={() => setPreset(k)} className={`chip !text-sm ${k === preset ? "!bg-primary !text-on-primary" : ""}`}>
            {PRESETS[k].label}
          </button>
        ))}
      </div>
      {preset === "tiro" && <p className="text-sm text-muted">Interpretá la posición como altura (eje hacia arriba). La aceleración es la gravedad: −9,8 m/s².</p>}
      <KinematicsWidget key={preset} x0={p.x0} v0={p.v0} a={p.a} question />
    </div>
  );
}

export function VectorsLab() {
  return (
    <div className="space-y-6">
      <VectorWidget x={3} y={4} />
      <div className="border-t border-line pt-4">
        <p className="mb-3 font-semibold">Suma de vectores (método del polígono)</p>
        <VectorWidget x={2} y={1} showSum />
      </div>
    </div>
  );
}
