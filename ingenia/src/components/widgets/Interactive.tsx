"use client";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { compileFn, fmt, nearlyEqual } from "@/engine/math/parser";
import { linText, sideOf, sidesOf, type Side } from "@/engine/evaluation/steps";
import { Plot } from "../math/Plot";
import { Slider } from "./Simple";

// ───────────────────────── Balanza ─────────────────────────

type Op = "+" | "−" | "×" | "÷";

export function BalanceWidget({ equation }: { equation: string }) {
  const initial = useMemo(() => sidesOf(equation), [equation]);
  const [sides, setSides] = useState<[Side, Side] | null>(initial);
  const [op, setOp] = useState<Op>("−");
  const [amount, setAmount] = useState("5");
  const [history, setHistory] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  if (!sides || !initial) return null;
  const [L, R] = sides;
  const solved = nearlyEqual(L.p, 1) && Math.abs(L.q) < 1e-12 && Math.abs(R.p) < 1e-12;

  const apply = () => {
    setError(null);
    let k: Side | null = null;
    try {
      k = sideOf(amount.trim() || "0");
    } catch {
      k = null;
    }
    if (!k) return setError("Escribí un número (o un término como 2x).");
    if ((op === "×" || op === "÷") && Math.abs(k.p) > 1e-12) return setError("Para multiplicar o dividir usá solo números.");
    if (op === "÷" && Math.abs(k.q) < 1e-12) return setError("No se puede dividir por 0.");
    if (op === "×" && Math.abs(k.q) < 1e-12) return setError("Multiplicar por 0 borra la ecuación: no sirve.");
    const f = (s: Side): Side =>
      op === "+" ? { p: s.p + k!.p, q: s.q + k!.q } : op === "−" ? { p: s.p - k!.p, q: s.q - k!.q } : op === "×" ? { p: s.p * k!.q, q: s.q * k!.q } : { p: s.p / k!.q, q: s.q / k!.q };
    setSides([f(L), f(R)]);
    setHistory((h) => [...h, `${op} ${amount} en ambos lados`]);
  };

  return (
    <div className="space-y-3">
      <svg viewBox="0 0 400 150" className="h-auto w-full" role="img" aria-label={`Balanza en equilibrio: ${linText(L.p, L.q)} = ${linText(R.p, R.q)}`}>
        <polygon points="200,60 185,140 215,140" fill="var(--muted)" />
        <rect x="40" y="56" width="320" height="6" rx="3" fill="var(--text)" />
        <line x1="80" y1="62" x2="80" y2="88" stroke="var(--muted)" />
        <line x1="320" y1="62" x2="320" y2="88" stroke="var(--muted)" />
        <rect x="20" y="88" width="120" height="40" rx="10" fill="var(--primary-soft)" stroke="var(--primary)" />
        <rect x="260" y="88" width="120" height="40" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" />
        <text x="80" y="114" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--text)" className="math">{linText(L.p, L.q)}</text>
        <text x="320" y="114" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--text)" className="math">{linText(R.p, R.q)}</text>
      </svg>
      {solved ? (
        <p className="rounded-lg bg-success-soft p-3 text-center font-semibold text-success">¡La x quedó sola! x = {fmt(R.q)}</p>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <select className="input !w-auto" value={op} onChange={(e) => setOp(e.target.value as Op)} aria-label="Operación">
            <option value="+">Sumar</option>
            <option value="−">Restar</option>
            <option value="×">Multiplicar por</option>
            <option value="÷">Dividir por</option>
          </select>
          <input className="input !w-24 text-center" value={amount} onChange={(e) => setAmount(e.target.value)} aria-label="Cantidad" />
          <button className="btn btn-primary" onClick={apply}>
            Aplicar a ambos lados
          </button>
        </div>
      )}
      {error && <p className="text-center text-sm text-danger">{error}</p>}
      {history.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted">
          <span>{history.join(" → ")}</span>
          <button className="btn btn-ghost !min-h-8" onClick={() => { setSides(initial); setHistory([]); }}>
            Reiniciar
          </button>
        </div>
      )}
    </div>
  );
}

// ───────────────────────── Gráficos ─────────────────────────

const PRESETS = ["x^2", "x^3", "2x + 1", "sin(x)", "e^x", "1/x", "sqrt(x)", "|x|", "ln(x)"];

export function PlotWidget({ mode, initial = "x^2" }: { mode: "free" | "linear"; initial?: string }) {
  const [expr, setExpr] = useState(initial);
  const [m, setM] = useState(1);
  const [b, setB] = useState(0);
  const valid = useMemo(() => {
    try {
      compileFn(expr);
      return true;
    } catch {
      return false;
    }
  }, [expr]);

  if (mode === "linear") {
    return (
      <div className="space-y-3">
        <p className="math text-center text-xl">
          y = {fmt(m, 1)}·x {b >= 0 ? "+" : "−"} {fmt(Math.abs(b), 1)}
        </p>
        <Plot fns={[{ fn: (x) => m * x + b }]} xRange={[-6, 6]} yRange={[-8, 8]} points={[[0, b]]} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Slider label="m (pendiente)" value={m} min={-4} max={4} step={0.5} onChange={setM} />
          <Slider label="b (ordenada al origen)" value={b} min={-5} max={5} step={0.5} onChange={setB} />
        </div>
        <p className="text-center text-sm text-muted" aria-live="polite">
          {m > 0 ? "Pendiente positiva: la recta sube." : m < 0 ? "Pendiente negativa: la recta baja." : "Pendiente 0: recta horizontal."} Corta al eje y en {fmt(b, 1)}.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2">
        <span className="math text-lg">f(x) =</span>
        <input className="input font-mono" value={expr} onChange={(e) => setExpr(e.target.value)} aria-label="Fórmula de la función" />
      </label>
      {valid ? <Plot fns={[{ expr }]} xRange={[-6, 6]} /> : <p className="rounded-lg bg-warn-soft p-3 text-sm">Esa fórmula todavía no se puede leer. Probá con algo como x^2 + 1.</p>}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button key={p} onClick={() => setExpr(p)} className={`chip !text-sm ${expr === p ? "!bg-primary !text-on-primary" : ""}`}>
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

// ───────────────────────── Vectores ─────────────────────────

function useDrag(size: number, scale: number, onMove: (x: number, y: number) => void) {
  const ref = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const toCoords = (e: PointerEvent<SVGSVGElement>) => {
    const rect = ref.current!.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * size;
    const py = ((e.clientY - rect.top) / rect.height) * size;
    return [Math.round((px - size / 2) / scale), Math.round((size / 2 - py) / scale)] as const;
  };
  return {
    ref,
    onPointerDown: (e: PointerEvent<SVGSVGElement>) => {
      dragging.current = true;
      ref.current?.setPointerCapture(e.pointerId);
      const [x, y] = toCoords(e);
      onMove(x, y);
    },
    onPointerMove: (e: PointerEvent<SVGSVGElement>) => {
      if (!dragging.current) return;
      const [x, y] = toCoords(e);
      onMove(x, y);
    },
    onPointerUp: () => {
      dragging.current = false;
    },
  };
}

export function VectorWidget({ x: x0, y: y0, showSum }: { x: number; y: number; showSum?: boolean }) {
  const SIZE = 300;
  const N = 8;
  const S = SIZE / 2 / N;
  const [u, setU] = useState({ x: x0, y: y0 });
  const [v] = useState({ x: 1, y: 3 });
  const clamp = (n: number) => Math.max(-N + 1, Math.min(N - 1, n));
  const drag = useDrag(SIZE, S, (x, y) => setU({ x: clamp(x), y: clamp(y) }));
  const c = SIZE / 2;
  const mod = Math.hypot(u.x, u.y);
  const ang = (Math.atan2(u.y, u.x) * 180) / Math.PI;
  const sum = { x: u.x + v.x, y: u.y + v.y };
  const P = (p: { x: number; y: number }, o = { x: 0, y: 0 }) => [c + (p.x + o.x) * S, c - (p.y + o.y) * S] as const;

  const nudge = (dx: number, dy: number) => setU((p) => ({ x: clamp(p.x + dx), y: clamp(p.y + dy) }));

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_auto]">
      <svg
        {...drag}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-auto w-full max-w-sm cursor-crosshair touch-none select-none rounded-xl bg-surface-2"
        role="application"
        aria-label={`Vector u = (${u.x}, ${u.y}). Usá las flechas del teclado para moverlo.`}
        tabIndex={0}
        onKeyDown={(e) => {
          const map: Record<string, [number, number]> = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
          if (map[e.key]) {
            e.preventDefault();
            nudge(...map[e.key]);
          }
        }}
      >
        <defs>
          {["var(--primary)", "var(--accent)", "var(--c-physics)"].map((col, i) => (
            <marker key={i} id={`vw-${i}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill={col} />
            </marker>
          ))}
        </defs>
        {Array.from({ length: 2 * N + 1 }, (_, i) => (
          <g key={i}>
            <line x1={i * S} x2={i * S} y1={0} y2={SIZE} stroke="var(--border)" strokeWidth={i === N ? 1.5 : 0.5} />
            <line y1={i * S} y2={i * S} x1={0} x2={SIZE} stroke="var(--border)" strokeWidth={i === N ? 1.5 : 0.5} />
          </g>
        ))}
        {!showSum && (
          <>
            <line x1={c} y1={c} x2={P(u)[0]} y2={c} stroke="var(--primary)" strokeDasharray="4 3" opacity={0.6} />
            <line x1={P(u)[0]} y1={c} x2={P(u)[0]} y2={P(u)[1]} stroke="var(--primary)" strokeDasharray="4 3" opacity={0.6} />
          </>
        )}
        <line x1={c} y1={c} x2={P(u)[0]} y2={P(u)[1]} stroke="var(--primary)" strokeWidth={3} markerEnd="url(#vw-0)" />
        {showSum && (
          <>
            <line x1={P(u)[0]} y1={P(u)[1]} x2={P(v, u)[0]} y2={P(v, u)[1]} stroke="var(--accent)" strokeWidth={3} markerEnd="url(#vw-1)" />
            <line x1={c} y1={c} x2={P(sum)[0]} y2={P(sum)[1]} stroke="var(--c-physics)" strokeWidth={3} strokeDasharray="6 3" markerEnd="url(#vw-2)" />
          </>
        )}
        <circle cx={P(u)[0]} cy={P(u)[1]} r={9} fill="var(--primary)" opacity={0.25} />
      </svg>
      <div className="min-w-48 space-y-2 text-sm" aria-live="polite">
        <p className="text-muted">Arrastrá la punta (o usá las flechas del teclado).</p>
        <p className="math text-lg">
          u = ({u.x}, {u.y})
        </p>
        {showSum ? (
          <>
            <p className="math text-lg text-accent">v = (1, 3)</p>
            <p className="math text-lg" style={{ color: "var(--c-physics)" }}>
              u + v = ({sum.x}, {sum.y})
            </p>
          </>
        ) : (
          <>
            <p>
              Componente x: <strong>{u.x}</strong> · Componente y: <strong>{u.y}</strong>
            </p>
            <p className="math">
              |u| = √({u.x}² + {u.y}²) = √{u.x * u.x + u.y * u.y} ≈ <strong className="text-primary">{fmt(mod, 2)}</strong>
            </p>
            <p>Ángulo con el eje x: {fmt(ang, 1)}°</p>
          </>
        )}
      </div>
    </div>
  );
}

// ───────────────────────── Cinemática ─────────────────────────

export function KinematicsWidget({ x0: ix0, v0: iv0, a: ia, question }: { x0: number; v0: number; a: number; question?: boolean }) {
  const [x0, setX0] = useState(ix0);
  const [v0, setV0] = useState(iv0);
  const [a, setA] = useState(ia);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const T = 8;
  const pos = (tt: number) => x0 + v0 * tt + 0.5 * a * tt * tt;
  const vel = (tt: number) => v0 + a * tt;

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setT((prev) => {
        const nt = prev + dt;
        if (nt >= T) {
          setPlaying(false);
          return T;
        }
        return nt;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const samples = Array.from({ length: 41 }, (_, i) => pos((i * T) / 40));
  const lo = Math.min(...samples, 0);
  const hi = Math.max(...samples, 1);
  const track = (x: number) => 4 + ((x - lo) / (hi - lo || 1)) * 92;

  return (
    <div className="space-y-4">
      <div className="relative h-14 rounded-xl bg-surface-2" role="img" aria-label={`Posición ${fmt(pos(t), 1)} metros en t = ${fmt(t, 1)} s`}>
        <div className="absolute inset-x-3 top-1/2 h-0.5 bg-line" />
        {[lo, (lo + hi) / 2, hi].map((m) => (
          <span key={m} className="absolute bottom-0 -translate-x-1/2 text-[10px] text-muted" style={{ left: `${track(m)}%` }}>
            {fmt(m, 0)} m
          </span>
        ))}
        <div className="absolute top-1/2 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary text-on-primary shadow-lg" style={{ left: `${track(pos(t))}%` }} aria-hidden>
          ●
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-lg bg-surface-2 p-2">
          <div className="text-muted">t</div>
          <div className="font-mono text-lg font-bold">{fmt(t, 1)} s</div>
        </div>
        <div className="rounded-lg bg-primary-soft p-2">
          <div className="text-muted">x(t)</div>
          <div className="font-mono text-lg font-bold">{fmt(pos(t), 1)} m</div>
        </div>
        <div className="rounded-lg bg-accent-soft p-2">
          <div className="text-muted">v(t)</div>
          <div className="font-mono text-lg font-bold">{fmt(vel(t), 1)} m/s</div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Plot fns={[{ fn: pos, label: "x(t)" }]} xRange={[0, T]} marker={t} xLabel="t (s)" yLabel="x (m)" height={200} />
        <Plot fns={[{ fn: vel, label: "v(t)", color: "var(--accent)" }]} xRange={[0, T]} marker={t} xLabel="t (s)" yLabel="v (m/s)" height={200} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="Posición inicial x₀" value={x0} min={-20} max={20} onChange={(v) => { setX0(v); setT(0); }} suffix=" m" />
        <Slider label="Velocidad inicial v₀" value={v0} min={-20} max={30} step={0.2} onChange={(v) => { setV0(v); setT(0); }} suffix=" m/s" />
        <Slider label="Aceleración a" value={a} min={-10} max={10} step={0.2} onChange={(v) => { setA(v); setT(0); }} suffix=" m/s²" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn btn-primary" onClick={() => { if (t >= T) setT(0); setPlaying((p) => !p); }}>
          {playing ? "Pausar" : t >= T ? "Repetir" : "Simular"}
        </button>
        <div className="min-w-48 flex-1">
          <Slider label="Tiempo" value={Math.round(t * 10) / 10} min={0} max={T} step={0.1} onChange={(v) => { setPlaying(false); setT(v); }} suffix=" s" />
        </div>
      </div>
      {question && <KinematicsQuestion x={pos(2)} params={{ x0, v0, a }} />}
    </div>
  );
}

function KinematicsQuestion({ x, params }: { x: number; params: { x0: number; v0: number; a: number } }) {
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState<null | boolean>(null);
  useEffect(() => {
    setChecked(null);
    setAnswer("");
  }, [params.x0, params.v0, params.a]);
  const check = () => {
    const n = Number(answer.replace(",", ".").replace("−", "-"));
    setChecked(Number.isFinite(n) && Math.abs(n - x) <= 0.05 + Math.abs(x) * 0.005);
  };
  return (
    <div className="rounded-xl border border-line p-4">
      <p className="font-semibold">Antes de mover el tiempo: ¿dónde estará el objeto a los 2 segundos?</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input className="input !w-32" inputMode="decimal" value={answer} onChange={(e) => setAnswer(e.target.value)} aria-label="Posición a los 2 s" />
        <span>m</span>
        <button className="btn btn-secondary" onClick={check}>
          Comprobar
        </button>
      </div>
      {checked !== null && (
        <p className={`mt-2 text-sm ${checked ? "text-success" : "text-danger"}`} role="status">
          {checked
            ? "¡Exacto! Mové el tiempo a 2 s para confirmarlo."
            : `Todavía no. Usá x(2) = x₀ + v₀·2 + ½·a·2² = ${fmt(params.x0)} + ${fmt(params.v0 * 2, 2)} + ${fmt(2 * params.a, 2)}.`}
        </p>
      )}
    </div>
  );
}
