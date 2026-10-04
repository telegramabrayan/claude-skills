"use client";
import { useState } from "react";
import { fmt, gcd } from "@/engine/math/parser";
import { NumberLineView } from "../math/Visuals";

export function Slider({ label, value, min, max, step = 1, onChange, suffix = "" }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <label className="block">
      <span className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-mono font-bold">
          {fmt(value, 2)}
          {suffix}
        </span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 w-full accent-[var(--primary)]" aria-label={label} />
    </label>
  );
}

export function NumberLineWidget({ min, max, start }: { min: number; max: number; start: number }) {
  const [a, setA] = useState(start);
  const [b, setB] = useState(-5);
  const r = a + b;
  const outOfRange = r < min || r > max;
  return (
    <div className="space-y-3">
      <NumberLineView min={min} max={max} marks={outOfRange ? [a] : [a, r]} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Punto de partida" value={a} min={min} max={max} onChange={setA} />
        <Slider label="Cuánto sumo (negativo = resto)" value={b} min={-10} max={10} onChange={setB} />
      </div>
      <p className="math rounded-lg bg-surface-2 p-2 text-center text-lg" aria-live="polite">
        {fmt(a)} {b >= 0 ? "+" : "−"} {fmt(Math.abs(b))} = <strong className="text-primary">{fmt(r)}</strong>
        <span className="ml-2 font-sans text-sm text-muted">({b >= 0 ? "a la derecha" : "a la izquierda"} {Math.abs(b)} lugares)</span>
      </p>
    </div>
  );
}

function Bar({ num, den, color }: { num: number; den: number; color: string }) {
  return (
    <div className="flex h-9 overflow-hidden rounded-lg border border-line" role="img" aria-label={`${num} de ${den} partes`}>
      {Array.from({ length: den }, (_, i) => (
        <div key={i} className="flex-1 border-r border-line last:border-r-0" style={{ background: i < num ? color : "transparent" }} />
      ))}
    </div>
  );
}

export function FractionBarsWidget({ a: a0, b: b0, c: c0, d: d0 }: { a: number; b: number; c: number; d: number }) {
  const [a, setA] = useState(a0);
  const [b, setB] = useState(b0);
  const [c, setC] = useState(c0);
  const [d, setD] = useState(d0);
  const den = (b * d) / gcd(b, d);
  const na = a * (den / b);
  const nc = c * (den / d);
  const sum = na + nc;
  const g = gcd(sum, den);
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-[auto_1fr] sm:items-center">
        <span className="math font-bold">{a}/{b}</span>
        <Bar num={Math.min(a, b)} den={b} color="var(--primary)" />
        <span className="math font-bold">{c}/{d}</span>
        <Bar num={Math.min(c, d)} den={d} color="var(--accent)" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Slider label="a" value={a} min={0} max={b} onChange={setA} />
        <Slider label="b" value={b} min={1} max={12} onChange={(v) => { setB(v); setA((x) => Math.min(x, v)); }} />
        <Slider label="c" value={c} min={0} max={d} onChange={setC} />
        <Slider label="d" value={d} min={1} max={12} onChange={(v) => { setD(v); setC((x) => Math.min(x, v)); }} />
      </div>
      <div className="rounded-lg bg-surface-2 p-3 text-sm">
        <p>
          Con partes del mismo tamaño (denominador común <strong>{den}</strong>):
        </p>
        <div className="mt-2 flex h-9 overflow-hidden rounded-lg border border-line" role="img" aria-label={`Suma: ${sum} de ${den}`}>
          {Array.from({ length: den }, (_, i) => (
            <div key={i} className="flex-1 border-r border-line last:border-r-0" style={{ background: i < na ? "var(--primary)" : i < sum ? "var(--accent)" : "transparent" }} />
          ))}
        </div>
        <p className="math mt-2 text-center text-lg" aria-live="polite">
          {a}/{b} + {c}/{d} = {na}/{den} + {nc}/{den} = <strong className="text-primary">{sum}/{den}</strong>
          {g > 1 && sum > 0 && <> = {sum / g}/{den / g}</>}
        </p>
      </div>
    </div>
  );
}

export function PercentWidget({ base: b0, percent: p0 }: { base: number; percent: number }) {
  const [base, setBase] = useState(b0);
  const [p, setP] = useState(p0);
  const part = (base * p) / 100;
  return (
    <div className="space-y-3">
      <div className="h-8 overflow-hidden rounded-lg bg-surface-2" role="img" aria-label={`${p}%`}>
        <div className="h-full bg-primary transition-[width]" style={{ width: `${Math.min(100, p)}%` }} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Total" value={base} min={10} max={1000} step={10} onChange={setBase} />
        <Slider label="Porcentaje" value={p} min={0} max={100} onChange={setP} suffix="%" />
      </div>
      <p className="math rounded-lg bg-surface-2 p-2 text-center text-lg" aria-live="polite">
        {p}% de {fmt(base)} = {p}/100 · {fmt(base)} = <strong className="text-primary">{fmt(part, 2)}</strong>
      </p>
    </div>
  );
}

export function PowerWidget({ base: b0, exponent: e0 }: { base: number; exponent: number }) {
  const [b, setB] = useState(b0);
  const [e, setE] = useState(e0);
  const value = b ** e;
  const expansion = e > 0 ? Array(e).fill(b).join(" · ") : e === 0 ? "1 (exponente 0)" : `1 / (${Array(-e).fill(b).join(" · ")})`;
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Base" value={b} min={1} max={10} onChange={setB} />
        <Slider label="Exponente" value={e} min={-3} max={8} onChange={setE} />
      </div>
      <p className="math rounded-lg bg-surface-2 p-3 text-center text-lg" aria-live="polite">
        {b}
        <sup>{e}</sup> = {expansion} = <strong className="text-primary">{e < 0 ? `1/${b ** -e}` : fmt(value)}</strong>
      </p>
      <p className="text-center text-sm text-muted">
        Compará: {b} · {e} = {b * e}. No es lo mismo.
      </p>
    </div>
  );
}

export function UnitsWidget({ value: v0 }: { value: number }) {
  const [kmh, setKmh] = useState(v0);
  return (
    <div className="space-y-3">
      <Slider label="Velocidad en km/h" value={kmh} min={0} max={180} step={3.6} onChange={(v) => setKmh(Math.round(v * 10) / 10)} />
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-lg bg-surface-2 p-3">
          <div className="text-2xl font-bold">{fmt(kmh, 1)}</div>
          <div className="text-sm text-muted">km/h</div>
        </div>
        <div className="rounded-lg bg-primary-soft p-3">
          <div className="text-2xl font-bold text-primary">{fmt(kmh / 3.6, 2)}</div>
          <div className="text-sm text-muted">m/s</div>
        </div>
      </div>
      <p className="math text-center text-sm">
        {fmt(kmh, 1)} km/h = {fmt(kmh, 1)} · 1000 m / 3600 s = {fmt(kmh, 1)} / 3,6 m/s
      </p>
    </div>
  );
}
