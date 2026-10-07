"use client";
/**
 * Animaciones con propósito: cada una muestra algo que en papel cuesta ver
 * (cómo crece la velocidad, de dónde sale cada fuerza, cómo se acumula un
 * área, qué le hace una matriz al plano). Todas se pueden pausar, repetir y
 * manipular; con "reducir movimiento" saltan directo al estado final.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { compileFn, fmt } from "@/engine/math/parser";
import { Plot } from "../math/Plot";
import { Slider } from "./Simple";

const G = 9.8;

function prefersReduced() {
  return typeof window !== "undefined" && (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduce");
}

/** Reloj de animación en segundos, de 0 a `duration`. */
function useClock(duration: number, speed = 1) {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const raf = useRef(0);
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = ((now - last) / 1000) * speed;
      last = now;
      setT((p) => {
        const n = p + dt;
        if (n >= duration) {
          setPlaying(false);
          return duration;
        }
        return n;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, duration, speed]);
  const play = useCallback(() => {
    if (prefersReduced()) {
      setT(duration);
      return;
    }
    setT((p) => (p >= duration ? 0 : p));
    setPlaying(true);
  }, [duration]);
  const reset = useCallback(() => {
    setPlaying(false);
    setT(0);
  }, []);
  return { t, setT, playing, play, pause: () => setPlaying(false), reset, done: t >= duration };
}

function PlayBar({ clock, label = "Animar" }: { clock: ReturnType<typeof useClock>; label?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button className="btn btn-primary !min-h-10" onClick={clock.playing ? clock.pause : clock.play}>
        {clock.playing ? "Pausa" : clock.done ? "↺ Repetir" : `▶ ${label}`}
      </button>
      {clock.t > 0 && !clock.playing && (
        <button className="btn btn-ghost !min-h-10" onClick={clock.reset}>
          Volver al inicio
        </button>
      )}
    </div>
  );
}

/** Flecha SVG con punta. */
function Arrow({ x1, y1, x2, y2, color, label, width = 3, dashed }: { x1: number; y1: number; x2: number; y2: number; color: string; label?: string; width?: number; dashed?: boolean }) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 1) return null;
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const hx = x2 - ux * 9;
  const hy = y2 - uy * 9;
  return (
    <g>
      <line x1={x1} y1={y1} x2={hx} y2={hy} stroke={color} strokeWidth={width} strokeDasharray={dashed ? "5 4" : undefined} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${hx - uy * 5},${hy + ux * 5} ${hx + uy * 5},${hy - ux * 5}`} fill={color} />
      {label && (
        <text x={x2 + ux * 6 + (Math.abs(uy) > 0.7 ? 8 : 0)} y={y2 + uy * 6 + (Math.abs(ux) > 0.7 ? -6 : 4)} fontSize={13} fontWeight={700} fill={color}>
          {label}
        </text>
      )}
    </g>
  );
}

// ───────────────────────── Física ─────────────────────────

/**
 * Movimiento rectilíneo: un móvil deja una marca por segundo. Con velocidad
 * constante las marcas quedan a la misma distancia; con aceleración se van
 * separando. La flecha de velocidad crece (o se achica) en vivo.
 */
export function MotionWidget({ v0: iv, a: ia }: { v0: number; a: number }) {
  const [v0, setV0] = useState(iv);
  const [a, setA] = useState(ia);
  const T = 6;
  const clock = useClock(T, 0.9);
  const x = (t: number) => v0 * t + 0.5 * a * t * t;
  const v = (t: number) => v0 + a * t;
  const xs = Array.from({ length: 61 }, (_, i) => x((i * T) / 60));
  const lo = Math.min(0, ...xs);
  const hi = Math.max(1, ...xs);
  const W = 400;
  const px = (val: number) => 20 + ((val - lo) / (hi - lo || 1)) * (W - 60);
  const marks = Array.from({ length: Math.floor(clock.t) + 1 }, (_, i) => i);
  const vmax = Math.max(1, ...Array.from({ length: 7 }, (_, i) => Math.abs(v(i))));
  const cur = clock.t;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} 130`} className="w-full rounded-xl bg-surface-2" role="img" aria-label={`Móvil en x = ${fmt(x(cur), 1)} m con velocidad ${fmt(v(cur), 1)} m/s`}>
        <line x1={10} x2={W - 10} y1={92} y2={92} stroke="var(--border)" strokeWidth={2} />
        {marks.map((i) => (
          <g key={i}>
            <line x1={px(x(i))} x2={px(x(i))} y1={86} y2={98} stroke="var(--c-physics)" strokeWidth={2} />
            <text x={px(x(i))} y={114} fontSize={10} textAnchor="middle" fill="var(--muted)">
              {i}s
            </text>
          </g>
        ))}
        <rect x={px(x(cur)) - 16} y={70} width={32} height={18} rx={5} fill="var(--primary)" />
        <circle cx={px(x(cur)) - 9} cy={90} r={4} fill="var(--text)" />
        <circle cx={px(x(cur)) + 9} cy={90} r={4} fill="var(--text)" />
        <Arrow x1={px(x(cur))} y1={52} x2={px(x(cur)) + (v(cur) / vmax) * 90} y2={52} color="var(--accent)" label="v" />
        {Math.abs(a) > 1e-9 && <Arrow x1={px(x(cur))} y1={30} x2={px(x(cur)) + Math.sign(a) * 40} y2={30} color="var(--c-physics)" label="a" width={2} />}
      </svg>
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-lg bg-surface-2 p-2">
          t = <b className="font-mono">{fmt(cur, 1)} s</b>
        </div>
        <div className="rounded-lg bg-primary-soft p-2">
          x = <b className="font-mono">{fmt(x(cur), 1)} m</b>
        </div>
        <div className="rounded-lg bg-accent-soft p-2">
          v = <b className="font-mono">{fmt(v(cur), 1)} m/s</b>
        </div>
      </div>
      <p className="text-sm text-muted">
        {Math.abs(a) < 1e-9
          ? "Velocidad constante: en cada segundo recorre la misma distancia (las marcas quedan equidistantes)."
          : a * v0 >= 0
            ? "Aceleración a favor del movimiento: cada segundo recorre más que el anterior (las marcas se separan) y la flecha v crece."
            : "Aceleración en contra: la flecha v se achica, el móvil frena y, si sigue, da la vuelta."}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Velocidad inicial" value={v0} min={-10} max={20} step={0.5} suffix=" m/s" onChange={(n) => { setV0(n); clock.reset(); }} />
        <Slider label="Aceleración" value={a} min={-6} max={6} step={0.5} suffix=" m/s²" onChange={(n) => { setA(n); clock.reset(); }} />
      </div>
      <PlayBar clock={clock} label="Mover" />
    </div>
  );
}

const FORCE_STEPS = ["El cuerpo apoyado en el plano", "1. El peso P = m·g apunta siempre hacia abajo", "2. Descomponemos P: una parte empuja contra el plano (P·cos θ) y otra lo hace bajar (P·sen θ)", "3. El plano responde con la normal N, que equilibra a P·cos θ", "4. El rozamiento se opone a que deslice: Froz ≤ μ·N", "5. La fuerza neta a lo largo del plano decide si acelera"];

/** Diagrama de cuerpo libre en un plano inclinado, construido de a una fuerza. */
export function ForcesWidget({ angle: ia, mu: imu, mass: im }: { angle: number; mu: number; mass: number }) {
  const [angle, setAngle] = useState(ia);
  const [mu, setMu] = useState(imu);
  const [m] = useState(im);
  const [step, setStep] = useState(0);
  const th = (angle * Math.PI) / 180;
  const P = m * G;
  const Ppar = P * Math.sin(th);
  const Pper = P * Math.cos(th);
  const N = Pper;
  const frMax = mu * N;
  const slides = Ppar > frMax;
  const Fr = slides ? frMax : Ppar;
  const net = Ppar - Fr;
  // Geometría: plano que baja hacia la derecha, con el ángulo real.
  const W = 400;
  const H = 240;
  const ox = 30;
  const L = Math.min(340, 180 / Math.max(0.05, Math.tan(th)));
  const topY = 30;
  const lineY = (xx: number) => topY + (xx - ox) * Math.tan(th);
  const ux = Math.cos(th); // dirección "plano abajo"
  const uy = Math.sin(th);
  const bx = ox + L * 0.45;
  const by = lineY(bx) - 14 / Math.cos(th);
  const scale = 80 / P;
  const nx = Math.sin(th);
  const ny = -Math.cos(th);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl bg-surface-2" role="img" aria-label={`Plano inclinado de ${angle} grados con sus fuerzas`}>
        <polygon points={`${ox},${lineY(ox)} ${ox + L},${lineY(ox + L)} ${ox},${lineY(ox + L)}`} fill="color-mix(in srgb, var(--muted) 18%, transparent)" stroke="var(--muted)" />
        <g transform={`rotate(${angle} ${bx} ${by})`}>
          <rect x={bx - 22} y={by - 13} width={44} height={26} rx={3} fill="var(--primary)" opacity={0.9} />
        </g>
        {step >= 1 && <Arrow x1={bx} y1={by} x2={bx} y2={by + P * scale} color="var(--danger)" label="P" />}
        {step >= 2 && (
          <>
            <Arrow x1={bx} y1={by} x2={bx + ux * Ppar * scale} y2={by + uy * Ppar * scale} color="var(--c-math)" label="P·sen θ" width={2} dashed />
            <Arrow x1={bx} y1={by} x2={bx - nx * Pper * scale} y2={by - ny * Pper * scale} color="var(--c-math)" label="P·cos θ" width={2} dashed />
          </>
        )}
        {step >= 3 && <Arrow x1={bx} y1={by} x2={bx + nx * N * scale} y2={by + ny * N * scale} color="var(--success)" label="N" />}
        {step >= 4 && Fr > 0.01 && <Arrow x1={bx} y1={by} x2={bx - ux * Fr * scale} y2={by - uy * Fr * scale} color="var(--c-physics)" label="Froz" />}
        <text x={ox + L - 60} y={lineY(ox + L) - 6} fontSize={12} fill="var(--muted)">
          θ = {angle}°
        </text>
      </svg>
      <p className="min-h-12 rounded-lg bg-surface-2 p-2 text-sm" aria-live="polite">
        {FORCE_STEPS[step]}
        {step >= 5 && (
          <b className="block pt-1">
            {slides ? `P·sen θ = ${fmt(Ppar, 1)} N supera a μ·N = ${fmt(frMax, 1)} N → desliza con a = ${fmt(net / m, 2)} m/s².` : `P·sen θ = ${fmt(Ppar, 1)} N no alcanza a vencer μ·N = ${fmt(frMax, 1)} N → queda en reposo (el rozamiento vale ${fmt(Fr, 1)} N).`}
          </b>
        )}
      </p>
      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary !min-h-10" onClick={() => setStep((s) => Math.min(FORCE_STEPS.length - 1, s + 1))} disabled={step >= FORCE_STEPS.length - 1}>
          Siguiente fuerza
        </button>
        <button className="btn btn-ghost !min-h-10" onClick={() => setStep(0)}>
          Empezar de nuevo
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Ángulo θ" value={angle} min={5} max={60} suffix="°" onChange={setAngle} />
        <Slider label="Coeficiente μ" value={mu} min={0} max={1} step={0.05} onChange={setMu} />
      </div>
      <p className="text-xs text-muted">Masa {m} kg · g = 9,8 m/s² · P = {fmt(P, 1)} N</p>
    </div>
  );
}

/** Tiro oblicuo: la trayectoria se dibuja mientras las componentes de la velocidad se ven en vivo (vx fija, vy cambia). */
export function ProjectileWidget({ v0: iv, angle: ia, h0: ih }: { v0: number; angle: number; h0: number }) {
  const [v0, setV0] = useState(iv);
  const [angle, setAngle] = useState(ia);
  const [h0, setH0] = useState(ih);
  const th = (angle * Math.PI) / 180;
  const vx = v0 * Math.cos(th);
  const vy0 = v0 * Math.sin(th);
  const tf = (vy0 + Math.sqrt(vy0 * vy0 + 2 * G * h0)) / G;
  const clock = useClock(tf, Math.max(0.6, tf / 3.5));
  const t = clock.t;
  const X = (tt: number) => vx * tt;
  const Y = (tt: number) => h0 + vy0 * tt - 0.5 * G * tt * tt;
  const range = X(tf);
  const hmax = h0 + (vy0 * vy0) / (2 * G);
  const W = 400;
  const H = 220;
  const sx = (x: number) => 20 + (x / Math.max(1, range)) * (W - 40);
  const sy = (y: number) => H - 20 - (y / Math.max(1, hmax)) * (H - 50);
  const pts = Array.from({ length: 50 }, (_, i) => (i / 49) * t).map((tt) => `${sx(X(tt)).toFixed(1)},${sy(Y(tt)).toFixed(1)}`);
  const vyt = vy0 - G * t;
  const k = 2.2;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl bg-surface-2" role="img" aria-label="Trayectoria de un tiro oblicuo">
        <line x1={0} x2={W} y1={sy(0)} y2={sy(0)} stroke="var(--muted)" />
        {h0 > 0 && <rect x={8} y={sy(h0)} width={14} height={sy(0) - sy(h0)} fill="var(--border)" />}
        <polyline points={pts.join(" ")} fill="none" stroke="var(--primary)" strokeWidth={2.5} strokeDasharray="1 0" />
        <circle cx={sx(X(t))} cy={sy(Y(t))} r={7} fill="var(--primary)" />
        <Arrow x1={sx(X(t))} y1={sy(Y(t))} x2={sx(X(t)) + vx * k} y2={sy(Y(t))} color="var(--accent)" label="vx" width={2} />
        <Arrow x1={sx(X(t))} y1={sy(Y(t))} x2={sx(X(t))} y2={sy(Y(t)) - vyt * k} color="var(--c-physics)" label="vy" width={2} />
      </svg>
      <div className="grid grid-cols-2 gap-2 text-center text-sm sm:grid-cols-4">
        <div className="rounded-lg bg-surface-2 p-2">t = <b className="font-mono">{fmt(t, 2)} s</b></div>
        <div className="rounded-lg bg-accent-soft p-2">vx = <b className="font-mono">{fmt(vx, 1)}</b> (fija)</div>
        <div className="rounded-lg bg-surface-2 p-2">vy = <b className="font-mono">{fmt(vyt, 1)}</b></div>
        <div className="rounded-lg bg-primary-soft p-2">h máx = <b className="font-mono">{fmt(hmax, 1)} m</b></div>
      </div>
      <p className="text-sm text-muted">En horizontal no hay aceleración: vx no cambia. En vertical actúa g: vy baja 9,8 m/s cada segundo, se anula en la altura máxima y después crece hacia abajo. Alcance: {fmt(range, 1)} m.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="Rapidez v₀" value={v0} min={5} max={40} suffix=" m/s" onChange={(n) => { setV0(n); clock.reset(); }} />
        <Slider label="Ángulo" value={angle} min={5} max={85} suffix="°" onChange={(n) => { setAngle(n); clock.reset(); }} />
        <Slider label="Altura inicial" value={h0} min={0} max={20} suffix=" m" onChange={(n) => { setH0(n); clock.reset(); }} />
      </div>
      <PlayBar clock={clock} label="Lanzar" />
    </div>
  );
}

/** Flotación: el cuerpo se hunde hasta que el empuje iguala al peso. Fracción sumergida = δ cuerpo / δ líquido. */
export function BuoyancyWidget({ body: ib, liquid: il }: { body: number; liquid: number }) {
  const [body, setBody] = useState(ib);
  const [liquid, setLiquid] = useState(il);
  const frac = Math.min(1, body / liquid);
  const sinks = body > liquid;
  const clock = useClock(1.6);
  useEffect(() => {
    clock.reset();
    const id = setTimeout(clock.play, 50);
    return () => clearTimeout(id);
  }, [body, liquid]); // eslint-disable-line react-hooks/exhaustive-deps
  const p = clock.t / 1.6;
  const ease = 1 - Math.pow(1 - p, 3);
  const side = 70;
  const surf = 90;
  const finalTop = sinks ? 200 - side : surf - side * (1 - frac);
  const top = 20 + (finalTop - 20) * ease;
  const sub = Math.max(0, Math.min(side, top + side - surf)) / side;
  const E = sub * liquid;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 300 210" className="w-full rounded-xl bg-surface-2" role="img" aria-label={`Cuerpo con ${Math.round(frac * 100)} % sumergido`}>
        <rect x={20} y={surf} width={260} height={110} fill="color-mix(in srgb, #38bdf8 35%, transparent)" />
        <rect x={115} y={top} width={side} height={side} rx={4} fill="var(--c-physics)" opacity={0.9} />
        <Arrow x1={150} y1={top + side / 2} x2={150} y2={top + side / 2 + 50} color="var(--danger)" label="P" />
        {E > 0.01 && <Arrow x1={170} y1={top + side / 2} x2={170} y2={top + side / 2 - (E / body) * 50} color="var(--success)" label="E" />}
      </svg>
      <p className="text-sm" aria-live="polite">
        {sinks
          ? `El cuerpo es más denso que el líquido (${fmt(body, 2)} > ${fmt(liquid, 2)} g/cm³): aun totalmente sumergido, E < P y se hunde.`
          : `Flota con ${Math.round(frac * 100)} % sumergido (${Math.round((1 - frac) * 100)} % afuera): se hunde justo hasta que el empuje iguala al peso. Fracción sumergida = δ cuerpo / δ líquido = ${fmt(body, 2)} / ${fmt(liquid, 2)}.`}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Densidad del cuerpo" value={body} min={0.1} max={3} step={0.05} suffix=" g/cm³" onChange={setBody} />
        <Slider label="Densidad del líquido" value={liquid} min={0.6} max={13.6} step={0.1} suffix=" g/cm³" onChange={setLiquid} />
      </div>
    </div>
  );
}

/** Un vector y sus componentes: las proyecciones "caen" sobre los ejes. */
export function VectorComponentsWidget({ mag: im, angle: ia }: { mag: number; angle: number }) {
  const [mag, setMag] = useState(im);
  const [angle, setAngle] = useState(ia);
  const clock = useClock(1.2);
  const th = (angle * Math.PI) / 180;
  const vx = mag * Math.cos(th);
  const vy = mag * Math.sin(th);
  const s = 14;
  const O = { x: 150, y: 150 };
  const tip = { x: O.x + vx * s, y: O.y - vy * s };
  const p = clock.t / 1.2;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 300 300" className="mx-auto w-full max-w-sm rounded-xl bg-surface-2" role="img" aria-label={`Vector de módulo ${mag} a ${angle} grados`}>
        <line x1={10} x2={290} y1={O.y} y2={O.y} stroke="var(--muted)" />
        <line y1={10} y2={290} x1={O.x} x2={O.x} stroke="var(--muted)" />
        <text x={282} y={O.y - 6} fontSize={11} fill="var(--muted)">x</text>
        <text x={O.x + 6} y={18} fontSize={11} fill="var(--muted)">y</text>
        {p > 0 && (
          <>
            <line x1={tip.x} y1={tip.y} x2={tip.x} y2={tip.y + (O.y - tip.y) * p} stroke="var(--muted)" strokeDasharray="4 3" />
            <line x1={tip.x} y1={tip.y} x2={tip.x + (O.x - tip.x) * p} y2={tip.y} stroke="var(--muted)" strokeDasharray="4 3" />
          </>
        )}
        {p >= 1 && (
          <>
            <Arrow x1={O.x} y1={O.y} x2={tip.x} y2={O.y} color="var(--accent)" label="Vx" />
            <Arrow x1={O.x} y1={O.y} x2={O.x} y2={tip.y} color="var(--c-physics)" label="Vy" />
          </>
        )}
        <Arrow x1={O.x} y1={O.y} x2={tip.x} y2={tip.y} color="var(--primary)" label="V" width={3.5} />
        <path d={`M ${O.x + 28} ${O.y} A 28 28 0 0 ${angle > 0 ? 0 : 1} ${O.x + 28 * Math.cos(th)} ${O.y - 28 * Math.sin(th)}`} fill="none" stroke="var(--primary)" />
      </svg>
      <div className="grid grid-cols-2 gap-2 text-center text-sm">
        <div className="rounded-lg bg-accent-soft p-2">Vx = |V|·cos θ = <b className="font-mono">{fmt(vx, 2)}</b></div>
        <div className="rounded-lg bg-surface-2 p-2">Vy = |V|·sen θ = <b className="font-mono">{fmt(vy, 2)}</b></div>
      </div>
      <p className="text-sm text-muted">El ángulo θ se mide desde el eje +x. Si te lo dan desde otro eje (por ejemplo, desde la vertical), seno y coseno se intercambian: es el error más común en los parciales.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Módulo |V|" value={mag} min={1} max={9} step={0.5} onChange={(n) => { setMag(n); clock.reset(); }} />
        <Slider label="Ángulo θ" value={angle} min={-180} max={180} step={5} suffix="°" onChange={(n) => { setAngle(n); clock.reset(); }} />
      </div>
      <PlayBar clock={clock} label="Proyectar sobre los ejes" />
    </div>
  );
}

// ───────────────────────── Matemática ─────────────────────────

/** La recta tangente recorre la curva sola: se ve cómo cambia la pendiente (la derivada). */
export function TangentSweepWidget({ expr }: { expr: string }) {
  const fn = useMemo(() => compileFn(expr), [expr]);
  const clock = useClock(6, 1);
  const a = -3 + clock.t;
  const h = 1e-5;
  const m = (fn(a + h) - fn(a - h)) / (2 * h);
  const fa = fn(a);
  const trail = useMemo(() => Array.from({ length: 25 }, (_, i) => -3 + (i / 24) * 6), []);
  const derivPts = trail.filter((x) => x <= a).map((x) => [x, (fn(x + h) - fn(x - h)) / (2 * h)] as [number, number]);
  return (
    <div className="space-y-3">
      <Plot fns={[{ fn, label: "f" }, { fn: (x) => fa + m * (x - a), color: "var(--accent)", label: "tangente" }]} xRange={[-3.5, 3.5]} yRange={[-5, 9]} points={[[a, fa]]} />
      <Plot fns={[]} xRange={[-3.5, 3.5]} yRange={[-8, 8]} points={derivPts} height={150} yLabel="f′(x)" />
      <p className="rounded-lg bg-surface-2 p-2 text-center text-sm" aria-live="polite">
        En x = {fmt(a, 2)} la pendiente es <b className="text-accent">{fmt(m, 2)}</b>. Abajo, cada punto anota esa pendiente: así se dibuja la función derivada.
      </p>
      <PlayBar clock={clock} label="Recorrer la curva" />
    </div>
  );
}

/** Sumas de Riemann: cada vez más rectángulos más finos y el área converge a la integral. */
export function RiemannWidget({ expr, a, b }: { expr: string; a: number; b: number }) {
  const fn = useMemo(() => compileFn(expr), [expr]);
  const [n, setN] = useState(4);
  const [auto, setAuto] = useState(false);
  useEffect(() => {
    if (!auto) return;
    if (prefersReduced()) {
      setN(64);
      setAuto(false);
      return;
    }
    const id = setInterval(() => setN((k) => (k >= 64 ? (setAuto(false), 64) : k * 2)), 900);
    return () => clearInterval(id);
  }, [auto]);
  const dx = (b - a) / n;
  const rects = Array.from({ length: n }, (_, i) => a + (i + 0.5) * dx);
  const sum = rects.reduce((s, x) => s + fn(x) * dx, 0);
  const exact = useMemo(() => {
    const N = 4000;
    let s = 0;
    for (let i = 0; i < N; i++) s += fn(a + ((i + 0.5) * (b - a)) / N) * ((b - a) / N);
    return s;
  }, [fn, a, b]);
  const W = 400;
  const H = 230;
  const xs = [a - 0.5, b + 0.5];
  const ys = useMemo(() => {
    const v = Array.from({ length: 50 }, (_, i) => fn(xs[0] + (i / 49) * (xs[1] - xs[0])));
    return [Math.min(0, ...v), Math.max(0.5, ...v) * 1.1];
  }, [fn]); // eslint-disable-line react-hooks/exhaustive-deps
  const sx = (x: number) => ((x - xs[0]) / (xs[1] - xs[0])) * W;
  const sy = (y: number) => H - 14 - ((y - ys[0]) / (ys[1] - ys[0])) * (H - 24);
  const path = Array.from({ length: 120 }, (_, i) => xs[0] + (i / 119) * (xs[1] - xs[0])).map((x, i) => `${i ? "L" : "M"}${sx(x).toFixed(1)},${sy(fn(x)).toFixed(1)}`).join("");
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl bg-surface-2" role="img" aria-label={`Área aproximada con ${n} rectángulos`}>
        <line x1={0} x2={W} y1={sy(0)} y2={sy(0)} stroke="var(--muted)" />
        {rects.map((x, i) => (
          <rect key={`${n}-${i}`} className="anim-pop" x={sx(x - dx / 2)} y={Math.min(sy(fn(x)), sy(0))} width={Math.max(0.5, sx(x + dx / 2) - sx(x - dx / 2) - (n > 32 ? 0 : 1))} height={Math.abs(sy(fn(x)) - sy(0))} fill="color-mix(in srgb, var(--primary) 35%, transparent)" stroke="var(--primary)" strokeWidth={n > 32 ? 0 : 0.8} />
        ))}
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth={2.5} />
      </svg>
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-lg bg-surface-2 p-2">n = <b>{n}</b></div>
        <div className="rounded-lg bg-primary-soft p-2">Suma ≈ <b className="font-mono">{fmt(sum, 4)}</b></div>
        <div className="rounded-lg bg-accent-soft p-2">Área exacta ≈ <b className="font-mono">{fmt(exact, 4)}</b></div>
      </div>
      <p className="text-sm text-muted">
        Cada rectángulo tiene base Δx = {fmt(dx, 3)} y altura f(x) en el medio de su base. Cuanto más finos, menos error: la integral de {fmt(a, 2)} a {fmt(b, 2)} es el valor al que se acercan estas sumas.
      </p>
      <Slider label="Cantidad de rectángulos" value={n} min={1} max={64} onChange={(k) => setN(Math.max(1, Math.round(k)))} />
      <div className="flex gap-2">
        <button className="btn btn-primary !min-h-10" onClick={() => { setN(1); setAuto(true); }}>
          ▶ Acumular rectángulos
        </button>
      </div>
    </div>
  );
}

type Family = "parabola" | "lineal" | "seno" | "exponencial";
const FAMILIES: Record<Family, { label: string; params: { k: string; label: string; min: number; max: number; init: number }[]; expr: (p: Record<string, number>) => string; explain: string }> = {
  parabola: {
    label: "y = a(x − h)² + k",
    params: [
      { k: "a", label: "a (abre / cierra, da vuelta)", min: -3, max: 3, init: 1 },
      { k: "h", label: "h (corre a izquierda/derecha)", min: -4, max: 4, init: 0 },
      { k: "k", label: "k (sube / baja)", min: -4, max: 4, init: 0 },
    ],
    expr: (p) => `${p.a}*(x-(${p.h}))^2+(${p.k})`,
    explain: "El vértice está en (h, k). Si a > 0 abre hacia arriba; si a < 0, hacia abajo; cuanto mayor |a|, más cerrada.",
  },
  lineal: {
    label: "y = m·x + b",
    params: [
      { k: "m", label: "m (pendiente)", min: -4, max: 4, init: 1 },
      { k: "b", label: "b (ordenada al origen)", min: -5, max: 5, init: 0 },
    ],
    expr: (p) => `${p.m}*x+(${p.b})`,
    explain: "m dice cuánto sube y por cada paso de x; b es donde la recta corta al eje y.",
  },
  seno: {
    label: "y = A·sen(B·x)",
    params: [
      { k: "A", label: "A (amplitud)", min: -3, max: 3, init: 1 },
      { k: "B", label: "B (frecuencia)", min: 0.25, max: 4, init: 1 },
    ],
    expr: (p) => `${p.A}*sin(${p.B}*x)`,
    explain: "A estira la onda en vertical; B la comprime en horizontal: el período es 2π/B.",
  },
  exponencial: {
    label: "y = a·bˣ",
    params: [
      { k: "a", label: "a (valor en x = 0)", min: -3, max: 3, init: 1 },
      { k: "b", label: "b (base)", min: 0.2, max: 3, init: 2 },
    ],
    expr: (p) => `${p.a}*(${p.b})^x`,
    explain: "Si b > 1 crece; si 0 < b < 1 decrece. Siempre pasa por (0, a).",
  },
};

/** Familias de funciones: mover (o animar) un parámetro y ver cómo cambia la gráfica. */
export function ParamFunctionWidget({ family }: { family: Family }) {
  const F = FAMILIES[family];
  const [p, setP] = useState<Record<string, number>>(() => Object.fromEntries(F.params.map((q) => [q.k, q.init])));
  const [anim, setAnim] = useState<string | null>(null);
  const base = useMemo(() => F.expr(Object.fromEntries(F.params.map((q) => [q.k, q.init]))), [F]);
  useEffect(() => {
    if (!anim) return;
    const q = F.params.find((x) => x.k === anim)!;
    if (prefersReduced()) {
      setAnim(null);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const s = (now - start) / 3000;
      const val = q.min + (q.max - q.min) * (0.5 - 0.5 * Math.cos(Math.min(1, s) * 2 * Math.PI));
      setP((old) => ({ ...old, [q.k]: Math.round(val * 100) / 100 }));
      if (s < 1) raf = requestAnimationFrame(tick);
      else setAnim(null);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [anim, F]);
  return (
    <div className="space-y-3">
      <p className="text-center font-mono text-lg">{F.label}</p>
      <Plot fns={[{ expr: base, color: "var(--border)", label: "original" }, { expr: F.expr(p), label: "f" }]} xRange={[-6, 6]} yRange={[-6, 6]} />
      <div className="space-y-2">
        {F.params.map((q) => (
          <div key={q.k} className="flex items-end gap-2">
            <div className="flex-1">
              <Slider label={q.label} value={p[q.k]} min={q.min} max={q.max} step={0.05} onChange={(v) => setP((o) => ({ ...o, [q.k]: v }))} />
            </div>
            <button className="btn btn-secondary !min-h-9 !px-3 text-xs" onClick={() => setAnim(q.k)} disabled={!!anim} aria-label={`Animar ${q.k}`}>
              ▶ {q.k}
            </button>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted">{F.explain}</p>
    </div>
  );
}

/** Una matriz 2×2 transforma el plano: la cuadrícula y los vectores e₁, e₂ se deforman de a poco. */
export function MatrixWidget({ a: ia, b: ib, c: ic, d: id }: { a: number; b: number; c: number; d: number }) {
  const [M, setM] = useState({ a: ia, b: ib, c: ic, d: id });
  const clock = useClock(1.5);
  const t = clock.t / 1.5;
  const L = (x: number, y: number) => {
    const A = 1 + (M.a - 1) * t;
    const B = M.b * t;
    const C = M.c * t;
    const D = 1 + (M.d - 1) * t;
    return [A * x + B * y, C * x + D * y];
  };
  const s = 26;
  const O = 150;
  const P = (x: number, y: number) => {
    const [u, v] = L(x, y);
    return `${(O + u * s).toFixed(1)},${(O - v * s).toFixed(1)}`;
  };
  const det = M.a * M.d - M.b * M.c;
  const grid: string[] = [];
  for (let k = -4; k <= 4; k++) {
    grid.push(`M${P(k, -4)}L${P(k, 4)}`);
    grid.push(`M${P(-4, k)}L${P(4, k)}`);
  }
  const [e1x, e1y] = L(1, 0);
  const [e2x, e2y] = L(0, 1);
  const set = (k: keyof typeof M, v: string) => {
    const n = Number(v.replace(",", "."));
    if (Number.isFinite(n)) {
      setM((m) => ({ ...m, [k]: n }));
      clock.reset();
    }
  };
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 300 300" className="mx-auto w-full max-w-sm rounded-xl bg-surface-2" role="img" aria-label="Transformación del plano por una matriz">
        <path d={grid.join("")} stroke="var(--border)" strokeWidth={1} fill="none" />
        <polygon points={`${P(0, 0)} ${P(1, 0)} ${P(1, 1)} ${P(0, 1)}`} fill="color-mix(in srgb, var(--primary) 25%, transparent)" />
        <Arrow x1={O} y1={O} x2={O + e1x * s} y2={O - e1y * s} color="var(--accent)" label="e₁" />
        <Arrow x1={O} y1={O} x2={O + e2x * s} y2={O - e2y * s} color="var(--c-physics)" label="e₂" />
      </svg>
      <div className="mx-auto grid w-40 grid-cols-2 gap-2" aria-label="Matriz">
        {(["a", "b", "c", "d"] as const).map((k) => (
          <input key={k} className="input text-center font-mono" defaultValue={String(M[k])} onBlur={(e) => set(k, e.target.value)} onKeyDown={(e) => e.key === "Enter" && set(k, (e.target as HTMLInputElement).value)} aria-label={`Elemento ${k}`} inputMode="decimal" />
        ))}
      </div>
      <p className="text-sm">
        Las columnas de la matriz son a dónde van e₁ = (1, 0) y e₂ = (0, 1). El cuadrado sombreado (área 1) termina con área |det| = <b>{fmt(Math.abs(det), 2)}</b>
        {det < 0 ? " y dado vuelta (det negativo)" : ""}
        {Math.abs(det) < 1e-9 ? ": el plano se aplasta sobre una recta, por eso la matriz no tiene inversa" : ""}.
      </p>
      <PlayBar clock={clock} label="Aplicar la matriz" />
    </div>
  );
}
