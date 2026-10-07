"use client";
/**
 * Dibujos de la pizarra. Cada renglón puede traer un dibujo (gráfico, vectores,
 * matriz, código, fuerzas o una figura). Lo que ya estaba en el dibujo del
 * renglón anterior se ve tenue; lo nuevo se dibuja con trazo animado y color,
 * así se ve exactamente qué agregó el paso.
 */
import { useMemo } from "react";
import type { BoardFigure as Fig } from "@/engine/types";
import { compileFn, fmt } from "@/engine/math/parser";

const W = 320;
const H = 200;

const key = (v: unknown) => JSON.stringify(v);
const cls = (isNew: boolean) => (isNew ? "fig-new" : "fig-old");

function Head({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const hx = x2 - ux * 9;
  const hy = y2 - uy * 9;
  return <polygon points={`${x2},${y2} ${hx - uy * 5},${hy + ux * 5} ${hx + uy * 5},${hy - ux * 5}`} fill="currentColor" stroke="none" />;
}

function Arrow({ x1, y1, x2, y2, label, isNew, mid }: { x1: number; y1: number; x2: number; y2: number; label?: string; isNew: boolean; mid?: boolean }) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 2) return null;
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  return (
    <g className={cls(isNew)}>
      <line className="fig-draw" pathLength={1} x1={x1} y1={y1} x2={x2 - ux * 8} y2={y2 - uy * 8} stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
      <Head x1={x1} y1={y1} x2={x2} y2={y2} />
      {label && mid && (
        <text x={(x1 + x2) / 2 - uy * 12} y={(y1 + y2) / 2 + ux * 12 + 4} fontSize={13} fontWeight={700} fill="currentColor" stroke="none" textAnchor="middle">
          {label}
        </text>
      )}
      {label && !mid && (
        <text x={x2 + ux * 8} y={y2 + uy * 8 + 4} fontSize={13} fontWeight={700} fill="currentColor" stroke="none" textAnchor={ux < -0.3 ? "end" : ux > 0.3 ? "start" : "middle"}>
          {label}
        </text>
      )}
    </g>
  );
}

// ───────────── Gráfico de funciones ─────────────

function PlotFig({ f, prev }: { f: Extract<Fig, { kind: "plot" }>; prev?: Extract<Fig, { kind: "plot" }> }) {
  const [x0, x1] = f.x ?? [-5, 5];
  const exprs = [...(f.fns ?? []).map((g) => g.expr), ...(f.area ? [f.area.expr] : []), ...(f.tangent ? [f.tangent.expr] : []), ...(f.area?.lower ? [f.area.lower] : [])];
  const fns = useMemo(() => exprs.map((e) => compileFn(e)), [exprs.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps
  const [y0, y1] = useMemo(() => {
    if (f.y) return f.y;
    let lo = Infinity;
    let hi = -Infinity;
    for (const g of fns)
      for (let i = 0; i <= 80; i++) {
        const v = g(x0 + ((x1 - x0) * i) / 80);
        if (Number.isFinite(v)) {
          lo = Math.min(lo, v);
          hi = Math.max(hi, v);
        }
      }
    for (const p of f.points ?? []) {
      lo = Math.min(lo, p.y);
      hi = Math.max(hi, p.y);
    }
    if (!Number.isFinite(lo)) return [-5, 5] as [number, number];
    lo = Math.min(lo, 0);
    hi = Math.max(hi, 0);
    const pad = (hi - lo || 2) * 0.12;
    return [Math.max(lo - pad, -50), Math.min(hi + pad, 50)] as [number, number];
  }, [fns, f.y, f.points, x0, x1]);
  const sx = (x: number) => ((x - x0) / (x1 - x0)) * W;
  const sy = (y: number) => H - ((y - y0) / (y1 - y0)) * H;
  const path = (g: (x: number) => number, a = x0, b = x1) => {
    let d = "";
    let pen = false;
    for (let i = 0; i <= 120; i++) {
      const x = a + ((b - a) * i) / 120;
      const y = g(x);
      if (!Number.isFinite(y) || y < y0 - (y1 - y0) || y > y1 + (y1 - y0)) {
        pen = false;
        continue;
      }
      d += `${pen ? "L" : "M"}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`;
      pen = true;
    }
    return d;
  };
  const had = (k: string, list?: unknown[]) => (list ?? []).some((v) => key(v) === k);
  const tick = (a: number, b: number) => {
    const span = b - a;
    const step = span <= 12 ? 1 : span <= 30 ? 5 : 10;
    const out: number[] = [];
    for (let v = Math.ceil(a / step) * step; v <= b; v += step) if (v !== 0) out.push(v);
    return out;
  };
  let fi = 0;
  return (
    <svg viewBox={`-6 -6 ${W + 12} ${H + 12}`} className="fig-svg" role="img" aria-label="Gráfico">
      {tick(x0, x1).map((v) => (
        <g key={`x${v}`}>
          <line x1={sx(v)} y1={0} x2={sx(v)} y2={H} stroke="var(--board-line)" />
          <text x={sx(v)} y={Math.min(Math.max(sy(0) + 13, 12), H - 2)} fontSize={9} textAnchor="middle" fill="var(--board-muted)">{v}</text>
        </g>
      ))}
      {tick(y0, y1).map((v) => (
        <g key={`y${v}`}>
          <line x1={0} y1={sy(v)} x2={W} y2={sy(v)} stroke="var(--board-line)" />
          <text x={Math.min(Math.max(sx(0) - 4, 14), W)} y={sy(v) + 3} fontSize={9} textAnchor="end" fill="var(--board-muted)">{v}</text>
        </g>
      ))}
      {y0 <= 0 && y1 >= 0 && <line x1={0} y1={sy(0)} x2={W} y2={sy(0)} stroke="var(--board-muted)" strokeWidth={1.2} />}
      {x0 <= 0 && x1 >= 0 && <line x1={sx(0)} y1={0} x2={sx(0)} y2={H} stroke="var(--board-muted)" strokeWidth={1.2} />}
      {f.area &&
        (() => {
          const g = fns[(f.fns ?? []).length];
          const isNew = key(f.area) !== key(prev?.area);
          const { a, b, rects } = f.area;
          if (rects) {
            const dx = (b - a) / rects;
            return (
              <g className={cls(isNew)}>
                {Array.from({ length: rects }, (_, i) => {
                  const xl = a + i * dx;
                  const v = g(xl + dx / 2);
                  return <rect key={i} className="fig-fade" x={sx(xl)} y={Math.min(sy(v), sy(0))} width={Math.max(sx(xl + dx) - sx(xl), 0.5)} height={Math.abs(sy(v) - sy(0))} fill="currentColor" fillOpacity={0.22} stroke="currentColor" strokeWidth={0.8} />;
                })}
              </g>
            );
          }
          const low = f.area.lower ? fns[fns.length - 1] : () => 0;
          const back = Array.from({ length: 61 }, (_, i) => b - ((b - a) * i) / 60).map((x) => `L${sx(x).toFixed(1)},${sy(low(x)).toFixed(1)}`).join("");
          return <path className={`${cls(isNew)} fig-fade`} d={`${path(g, a, b)}${back}Z`} fill="currentColor" fillOpacity={0.22} stroke="none" />;
        })()}
      {(f.fns ?? []).map((g, i) => {
        const isNew = !had(key(g), prev?.fns);
        const d = path(fns[fi++]);
        return (
          <g key={`f${i}`} className={cls(isNew)}>
            <path className="fig-draw" pathLength={1} d={d} fill="none" stroke="currentColor" strokeWidth={2.5} />
            {g.label && (
              <text x={W - 4} y={14 + i * 14} fontSize={11} fontWeight={700} textAnchor="end" fill="currentColor">{g.label}</text>
            )}
          </g>
        );
      })}
      {f.tangent &&
        (() => {
          const g = fns[(f.fns ?? []).length + (f.area ? 1 : 0)];
          const { x } = f.tangent;
          const h = 1e-4;
          const m = (g(x + h) - g(x - h)) / (2 * h);
          const y = g(x);
          const isNew = key(f.tangent) !== key(prev?.tangent);
          return (
            <g className={cls(isNew)}>
              <line className="fig-draw" pathLength={1} x1={sx(x0)} y1={sy(y + m * (x0 - x))} x2={sx(x1)} y2={sy(y + m * (x1 - x))} stroke="currentColor" strokeWidth={2} strokeDasharray={isNew ? undefined : "5 4"} />
              <circle cx={sx(x)} cy={sy(y)} r={4.5} fill="currentColor" />
              <text x={sx(x) + 6} y={sy(y) - 8} fontSize={11} fontWeight={700} fill="currentColor">m = {fmt(m, 2)}</text>
            </g>
          );
        })()}
      {(f.points ?? []).map((p, i) => {
        const isNew = !had(key(p), prev?.points);
        return (
          <g key={`p${i}`} className={`${cls(isNew)} fig-fade`}>
            <circle cx={sx(p.x)} cy={sy(p.y)} r={4.5} fill="currentColor" />
            {p.label && <text x={sx(p.x) + 7} y={sy(p.y) - 7} fontSize={11} fontWeight={700} fill="currentColor">{p.label}</text>}
          </g>
        );
      })}
    </svg>
  );
}

// ───────────── Vectores ─────────────

function VectorsFig({ f, prev }: { f: Extract<Fig, { kind: "vectors" }>; prev?: Extract<Fig, { kind: "vectors" }> }) {
  const all = f.vecs.flatMap((v) => [v.x + (v.from?.[0] ?? 0), v.y + (v.from?.[1] ?? 0), v.from?.[0] ?? 0, v.from?.[1] ?? 0]);
  const size = f.size ?? Math.max(3, Math.ceil(Math.max(...all.map(Math.abs)) + 1));
  const S = 200;
  const s = (v: number) => (v / size) * (S / 2);
  const c = S / 2;
  return (
    <svg viewBox={`-10 -10 ${S + 20} ${S + 20}`} className="fig-svg fig-square" role="img" aria-label="Vectores">
      {Array.from({ length: size * 2 + 1 }, (_, i) => i - size).map((v) => (
        <g key={v}>
          <line x1={c + s(v)} y1={0} x2={c + s(v)} y2={S} stroke="var(--board-line)" />
          <line x1={0} y1={c - s(v)} x2={S} y2={c - s(v)} stroke="var(--board-line)" />
        </g>
      ))}
      <line x1={0} y1={c} x2={S} y2={c} stroke="var(--board-muted)" />
      <line x1={c} y1={0} x2={c} y2={S} stroke="var(--board-muted)" />
      {f.vecs.map((v, i) => {
        const [fx, fy] = v.from ?? [0, 0];
        const isNew = !(prev?.vecs ?? []).some((p) => key(p) === key(v));
        return <Arrow key={i} x1={c + s(fx)} y1={c - s(fy)} x2={c + s(fx + v.x)} y2={c - s(fy + v.y)} label={v.label} isNew={isNew} mid={!!v.from} />;
      })}
    </svg>
  );
}

// ───────────── Matriz ─────────────

function MatrixFig({ f, prev }: { f: Extract<Fig, { kind: "matrix" }>; prev?: Extract<Fig, { kind: "matrix" }> }) {
  const marked = (r: number, c: number) => f.markRow === r || (f.mark ?? []).some(([a, b]) => a === r && b === c);
  return (
    <div className="flex items-center gap-2 font-mono">
      {f.label && <span className="text-lg font-bold">{f.label} =</span>}
      <div className="fig-matrix">
        <table>
          <tbody>
            {f.rows.map((row, r) => (
              <tr key={r}>
                {row.map((v, c) => {
                  const changed = prev && String(prev.rows[r]?.[c]) !== String(v);
                  return (
                    <td key={c} className={`${marked(r, c) ? "fig-cell-mark" : ""} ${changed ? "fig-cell-new" : ""}`}>
                      {typeof v === "number" ? fmt(v, 3) : v}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ───────────── Código ─────────────

function CodeFig({ f, prev }: { f: Extract<Fig, { kind: "code" }>; prev?: Extract<Fig, { kind: "code" }> }) {
  const lines = f.code.split("\n");
  return (
    <div className="fig-code">
      <pre>
        {lines.map((l, i) => (
          <div key={i} className={f.line === i + 1 ? "fig-code-line" : ""}>
            <span className="fig-code-n">{i + 1}</span>
            {l || " "}
            {f.line === i + 1 && <span className="fig-code-arrow"> ◀</span>}
          </div>
        ))}
      </pre>
      {f.vars && Object.keys(f.vars).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2" aria-label="Variables">
          {Object.entries(f.vars).map(([k, v]) => (
            <span key={k} className={`fig-var ${prev?.vars?.[k] !== v ? "fig-var-new" : ""}`}>
              <b>{k}</b> = {v}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ───────────── Fuerzas (diagrama de cuerpo libre) ─────────────

function ForcesFig({ f, prev }: { f: Extract<Fig, { kind: "forces" }>; prev?: Extract<Fig, { kind: "forces" }> }) {
  const inc = f.incline ?? 0;
  const rad = (inc * Math.PI) / 180;
  const cx = 160 - Math.sin(rad) * 22;
  const cy = inc > 0 ? 190 - 140 * Math.tan(rad) - Math.cos(rad) * 22 : 112;
  const L = 74;
  return (
    <svg viewBox="0 0 320 210" className="fig-svg" role="img" aria-label="Diagrama de cuerpo libre">
      {inc > 0 ? (
        <polygon points={`20,190 300,190 300,${190 - 280 * Math.tan(rad)}`} fill="var(--board-line)" stroke="var(--board-muted)" />
      ) : (
        <line x1={20} y1={134} x2={300} y2={134} stroke="var(--board-muted)" strokeWidth={2} />
      )}
      <g transform={`translate(${cx} ${cy}) rotate(${-inc})`}>
        <rect x={-22} y={-22} width={44} height={44} rx={4} fill="var(--board-bg)" stroke="var(--board-ink)" strokeWidth={2} />
      </g>
      {f.forces.map((F, i) => {
        const a = (F.angle * Math.PI) / 180;
        const len = L * (F.size ?? 1);
        const isNew = !(prev?.forces ?? []).some((p) => key(p) === key(F));
        return <Arrow key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * len} y2={cy - Math.sin(a) * len} label={F.label} isNew={isNew} />;
      })}
      {inc > 0 && (
        <text x={42} y={184} fontSize={12} fill="var(--board-muted)">{inc}°</text>
      )}
    </svg>
  );
}

// ───────────── Figuras geométricas ─────────────

function ShapeFig({ f }: { f: Extract<Fig, { kind: "shape" }> }) {
  const [a, b, c] = f.labels ?? [];
  const t = (x: number, y: number, s?: string, anchor: "start" | "middle" | "end" = "middle") =>
    s ? (
      <text x={x} y={y} fontSize={14} fontWeight={700} textAnchor={anchor} fill="currentColor">{s}</text>
    ) : null;
  return (
    <svg viewBox="0 0 320 180" className="fig-svg fig-new" role="img" aria-label="Figura">
      {f.shape === "triangle" && (
        <>
          <polygon className="fig-draw" pathLength={1} points="60,150 260,150 60,30" fill="none" stroke="currentColor" strokeWidth={2.5} />
          <rect x={60} y={136} width={14} height={14} fill="none" stroke="currentColor" />
          {t(160, 170, a)}
          {t(50, 95, b, "end")}
          {t(172, 82, c, "start")}
        </>
      )}
      {f.shape === "rect" && (
        <>
          <rect className="fig-draw" pathLength={1} x={70} y={40} width={180} height={100} fill="none" stroke="currentColor" strokeWidth={2.5} />
          {t(160, 162, a)}
          {t(60, 95, b, "end")}
        </>
      )}
      {f.shape === "circle" && (
        <>
          <circle className="fig-draw" pathLength={1} cx={160} cy={90} r={70} fill="none" stroke="currentColor" strokeWidth={2.5} />
          <line x1={160} y1={90} x2={230} y2={90} stroke="currentColor" strokeWidth={2} />
          <circle cx={160} cy={90} r={3} fill="currentColor" />
          {t(195, 82, a)}
        </>
      )}
    </svg>
  );
}

export function BoardFigure({ figure, prev }: { figure: Fig; prev?: Fig }) {
  const same = prev && prev.kind === figure.kind ? prev : undefined;
  return (
    <div className="board-figure mt-2">
      {figure.kind === "plot" && <PlotFig f={figure} prev={same as Extract<Fig, { kind: "plot" }> | undefined} />}
      {figure.kind === "vectors" && <VectorsFig f={figure} prev={same as Extract<Fig, { kind: "vectors" }> | undefined} />}
      {figure.kind === "matrix" && <MatrixFig f={figure} prev={same as Extract<Fig, { kind: "matrix" }> | undefined} />}
      {figure.kind === "code" && <CodeFig f={figure} prev={same as Extract<Fig, { kind: "code" }> | undefined} />}
      {figure.kind === "forces" && <ForcesFig f={figure} prev={same as Extract<Fig, { kind: "forces" }> | undefined} />}
      {figure.kind === "shape" && <ShapeFig f={figure} />}
    </div>
  );
}
