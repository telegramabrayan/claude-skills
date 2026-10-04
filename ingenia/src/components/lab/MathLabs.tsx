"use client";
import { useMemo, useState } from "react";
import { compileFn, fmt } from "@/engine/math/parser";
import { Plot } from "../math/Plot";
import { Slider } from "../widgets/Simple";

function useFn(expr: string) {
  return useMemo(() => {
    try {
      return { fn: compileFn(expr), ok: true };
    } catch {
      return { fn: () => NaN, ok: false };
    }
  }, [expr]);
}

const PRESETS = ["x^2", "x^3", "sin(x)", "cos(x)", "e^x", "ln(x)", "1/x", "sqrt(x)", "|x|", "x^2 - 4"];

export function FunctionLab() {
  const [exprs, setExprs] = useState(["x^2", ""]);
  const valid = exprs.filter((e) => {
    if (!e.trim()) return false;
    try {
      compileFn(e);
      return true;
    } catch {
      return false;
    }
  });
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Escribí una o dos funciones de x para compararlas. Probá cambiar un número y mirá qué le pasa al gráfico.</p>
      {exprs.map((e, i) => (
        <label key={i} className="flex items-center gap-2">
          <span className="math w-14 shrink-0 text-lg" style={{ color: i === 0 ? "var(--primary)" : "var(--accent)" }}>
            {i === 0 ? "f(x) =" : "g(x) ="}
          </span>
          <input className="input font-mono" value={e} onChange={(ev) => setExprs(exprs.map((x, j) => (j === i ? ev.target.value : x)))} placeholder={i === 1 ? "(opcional) por ejemplo 2x + 1" : ""} aria-label={i === 0 ? "Función f" : "Función g"} />
        </label>
      ))}
      <Plot fns={valid.map((expr) => ({ expr }))} xRange={[-6, 6]} />
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button key={p} className="chip !text-sm" onClick={() => setExprs([p, exprs[1]])}>
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

export function LimitLab() {
  const [expr, setExpr] = useState("(x^2 - 1)/(x - 1)");
  const [a, setA] = useState(1);
  const { fn, ok } = useFn(expr);
  const hs = [1, 0.1, 0.01, 0.001];
  const right = hs.map((h) => fn(a + h));
  const left = hs.map((h) => fn(a - h));
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        El límite pregunta a qué valor se <strong>acerca</strong> f(x) cuando x se acerca a a, aunque f(a) no exista. Mirá la tabla: x se acerca a a por izquierda y por derecha.
      </p>
      <div className="flex flex-wrap gap-2">
        {["(x^2 - 1)/(x - 1)", "sin(x)/x", "(x^2 - 4)/(x - 2)", "1/x"].map((p, i) => (
          <button key={p} className="chip !text-sm" onClick={() => { setExpr(p); setA([1, 0, 2, 0][i]); }}>
            {p}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2">
        <span className="math shrink-0">f(x) =</span>
        <input className="input font-mono" value={expr} onChange={(e) => setExpr(e.target.value)} aria-label="Función" />
      </label>
      <Slider label="x se acerca a" value={a} min={-3} max={3} step={0.5} onChange={setA} />
      {ok && (
        <>
          <Plot fns={[{ expr }]} xRange={[a - 4, a + 4]} marker={a} />
          <div className="overflow-x-auto">
            <table className="w-full text-center font-mono text-sm">
              <thead>
                <tr className="text-muted">
                  <th className="p-1">x</th>
                  {hs.map((h) => <th key={`l${h}`} className="p-1">{fmt(a - h, 3)}</th>)}
                  <th className="p-1 text-accent">→ {fmt(a)} ←</th>
                  {[...hs].reverse().map((h) => <th key={`r${h}`} className="p-1">{fmt(a + h, 3)}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-1 text-muted">f(x)</td>
                  {left.map((v, i) => <td key={i} className="p-1">{fmt(v, 4)}</td>)}
                  <td className="p-1 font-bold text-accent">{Number.isFinite(fn(a)) ? fmt(fn(a), 4) : "no existe"}</td>
                  {[...right].reverse().map((v, i) => <td key={i} className="p-1">{fmt(v, 4)}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export function DerivativeLab() {
  const [expr, setExpr] = useState("x^2");
  const [a, setA] = useState(1);
  const { fn, ok } = useFn(expr);
  const h = 1e-5;
  const slope = (fn(a + h) - fn(a - h)) / (2 * h);
  const fa = fn(a);
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        La derivada en un punto es la <strong>pendiente de la recta tangente</strong>: cuánto cambia f por cada pequeño cambio de x. Mové el punto y mirá cómo cambia la pendiente.
      </p>
      <div className="flex flex-wrap gap-2">
        {["x^2", "x^3", "sin(x)", "e^x"].map((p) => (
          <button key={p} className="chip !text-sm" onClick={() => setExpr(p)}>
            {p}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2">
        <span className="math shrink-0">f(x) =</span>
        <input className="input font-mono" value={expr} onChange={(e) => setExpr(e.target.value)} aria-label="Función" />
      </label>
      <Slider label="Punto a" value={a} min={-3} max={3} step={0.1} onChange={setA} />
      {ok && Number.isFinite(slope) && (
        <>
          <Plot fns={[{ expr, label: "f" }, { fn: (x) => fa + slope * (x - a), color: "var(--accent)", label: "tangente" }]} xRange={[-4, 4]} points={[[a, fa]]} />
          <p className="math rounded-lg bg-surface-2 p-3 text-center text-lg" aria-live="polite">
            pendiente de la tangente en x = {fmt(a, 1)}: <strong className="text-accent">{fmt(slope, 3)}</strong>
          </p>
          {expr === "x^2" && <p className="text-center text-sm text-muted">¿Notás un patrón? Para x² la pendiente siempre da 2·a. Eso es la derivada: f′(x) = 2x.</p>}
        </>
      )}
    </div>
  );
}

export function IntegralLab() {
  const [expr, setExpr] = useState("x^2");
  const [lo, setLo] = useState(0);
  const [hi, setHi] = useState(2);
  const [n, setN] = useState(6);
  const { fn, ok } = useFn(expr);
  const dx = (hi - lo) / n;
  const rects = Array.from({ length: n }, (_, i) => lo + (i + 0.5) * dx);
  const approx = rects.reduce((s, x) => s + fn(x) * dx, 0);
  const fine = Array.from({ length: 4000 }, (_, i) => lo + (i + 0.5) * ((hi - lo) / 4000)).reduce((s, x) => s + fn(x) * ((hi - lo) / 4000), 0);
  const step = (x: number) => {
    if (x < lo || x > hi) return NaN;
    const k = Math.min(n - 1, Math.floor((x - lo) / dx));
    return fn(lo + (k + 0.5) * dx);
  };
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        La integral definida mide el área (con signo) bajo la curva. Se puede aproximar con rectángulos: cuantos más rectángulos, mejor la aproximación.
      </p>
      <label className="flex items-center gap-2">
        <span className="math shrink-0">f(x) =</span>
        <input className="input font-mono" value={expr} onChange={(e) => setExpr(e.target.value)} aria-label="Función" />
      </label>
      {ok && <Plot fns={[{ expr }, { fn: step, color: "var(--accent)" }]} xRange={[Math.min(lo, -1) - 1, Math.max(hi, 1) + 1]} />}
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="Desde a" value={lo} min={-3} max={hi - 0.5} step={0.5} onChange={setLo} />
        <Slider label="Hasta b" value={hi} min={lo + 0.5} max={4} step={0.5} onChange={setHi} />
        <Slider label="Rectángulos" value={n} min={1} max={60} onChange={setN} />
      </div>
      <p className="rounded-lg bg-surface-2 p-3 text-center" aria-live="polite">
        Con {n} rectángulos: <strong>{fmt(approx, 4)}</strong> · valor (muy aproximado): <strong className="text-primary">{fmt(fine, 4)}</strong>
      </p>
    </div>
  );
}

export function SystemLab() {
  const [c, setC] = useState({ a1: 1, b1: 1, c1: 5, a2: 2, b2: -1, c2: 1 });
  const det = c.a1 * c.b2 - c.a2 * c.b1;
  const x = det !== 0 ? (c.c1 * c.b2 - c.c2 * c.b1) / det : NaN;
  const y = det !== 0 ? (c.a1 * c.c2 - c.a2 * c.c1) / det : NaN;
  const line = (a: number, b: number, k: number) => (xx: number) => (b !== 0 ? (k - a * xx) / b : NaN);
  const field = (key: keyof typeof c, label: string) => (
    <input type="number" className="input !w-16 !px-1 text-center" value={c[key]} onChange={(e) => setC({ ...c, [key]: Number(e.target.value) })} aria-label={label} />
  );
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Cada ecuación de un sistema 2×2 es una recta. La solución es el punto donde se cortan. Si son paralelas, no hay solución; si coinciden, hay infinitas.</p>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1">{field("a1", "a1")}<span className="math">x +</span>{field("b1", "b1")}<span className="math">y =</span>{field("c1", "c1")}</div>
        <div className="flex flex-wrap items-center gap-1">{field("a2", "a2")}<span className="math">x +</span>{field("b2", "b2")}<span className="math">y =</span>{field("c2", "c2")}</div>
      </div>
      <Plot fns={[{ fn: line(c.a1, c.b1, c.c1) }, { fn: line(c.a2, c.b2, c.c2), color: "var(--accent)" }]} xRange={[-8, 8]} yRange={[-8, 8]} points={Number.isFinite(x) ? [[x, y]] : []} />
      <p className="rounded-lg bg-surface-2 p-3 text-center" aria-live="polite">
        {det !== 0 ? (
          <>
            Solución única: <strong className="math">x = {fmt(x, 3)}, y = {fmt(y, 3)}</strong> (determinante {fmt(det)} ≠ 0)
          </>
        ) : (
          <>El determinante es 0: las rectas son paralelas o coinciden (sin solución única).</>
        )}
      </p>
    </div>
  );
}
