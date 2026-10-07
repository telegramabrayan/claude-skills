"use client";
/**
 * Entradas interactivas de los ejercicios. Todas se pueden usar de tres
 * formas: arrastrando (mouse o dedo), tocando (tocar ficha → tocar lugar) y
 * con teclado. Arrastrar es un atajo, nunca la única manera.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { MathText } from "../math/MathText";
import { Plot } from "../math/Plot";
import { compileFn, fmt } from "@/engine/math/parser";

const isMathy = (s: string) => !/[a-záéíóúñ]{4,}/i.test(s) && !s.includes("`");
const Txt = ({ s }: { s: string }) => <MathText text={isMathy(s) && !s.includes("$") ? `$${s}$` : s} block={false} />;

// ───────────────────────── Arrastre genérico ─────────────────────────

/**
 * Arrastre con Pointer Events (funciona con dedo y mouse). Al soltar busca el
 * elemento con `data-drop` que quedó debajo del puntero.
 */
function useDrag(onDrop: (id: string, target: HTMLElement | null, e: PointerEvent) => void, onMove?: (id: string, e: PointerEvent) => void) {
  const st = useRef<{ el: HTMLElement; id: string; x0: number; y0: number; moved: boolean } | null>(null);
  const dragged = useRef(false);
  const hover = useRef<HTMLElement | null>(null);
  const setHover = (el: HTMLElement | null) => {
    if (hover.current === el) return;
    hover.current?.classList.remove("drop-hover");
    el?.classList.add("drop-hover");
    hover.current = el;
  };
  const under = (e: PointerEvent, el: HTMLElement) => {
    el.style.pointerEvents = "none";
    const t = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>("[data-drop]") ?? null;
    el.style.pointerEvents = "";
    return t;
  };
  const bind = useCallback(
    (id: string, disabled?: boolean) => ({
      onPointerDown: (e: RPointerEvent<HTMLElement>) => {
        if (disabled || e.button !== 0) return;
        st.current = { el: e.currentTarget, id, x0: e.clientX, y0: e.clientY, moved: false };
        e.currentTarget.setPointerCapture(e.pointerId);
      },
      onPointerMove: (e: RPointerEvent<HTMLElement>) => {
        const s = st.current;
        if (!s) return;
        const dx = e.clientX - s.x0;
        const dy = e.clientY - s.y0;
        if (!s.moved && Math.hypot(dx, dy) < 7) return;
        s.moved = true;
        s.el.style.transform = `translate(${dx}px, ${dy}px) scale(1.06) rotate(-2deg)`;
        s.el.classList.add("is-dragging");
        setHover(under(e.nativeEvent, s.el));
        onMove?.(s.id, e.nativeEvent);
      },
      onPointerUp: (e: RPointerEvent<HTMLElement>) => {
        const s = st.current;
        st.current = null;
        if (!s) return;
        s.el.style.transform = "";
        s.el.classList.remove("is-dragging");
        setHover(null);
        if (s.moved) {
          dragged.current = true;
          setTimeout(() => (dragged.current = false), 0);
          onDrop(s.id, under(e.nativeEvent, s.el), e.nativeEvent);
        }
      },
      onPointerCancel: () => {
        const s = st.current;
        st.current = null;
        if (s) {
          s.el.style.transform = "";
          s.el.classList.remove("is-dragging");
        }
        setHover(null);
      },
    }),
    [onDrop, onMove], // eslint-disable-line react-hooks/exhaustive-deps
  );
  return { bind, wasDrag: () => dragged.current };
}

// ───────────────────────── Ordenar ─────────────────────────

/** Mezcla determinística que nunca deja el orden correcto. */
export function shuffledOrder(items: string[], seed = 1, avoid: string[] = items): string[] {
  const arr = items.map((v, i) => ({ v, k: Math.sin(seed * 9301 + i * 49297) }));
  const out = arr.sort((a, b) => a.k - b.k).map((x) => x.v);
  if (out.length > 1 && out.every((v, i) => v === avoid[i])) [out[0], out[1]] = [out[1], out[0]];
  return out;
}

/** Ordenar: arrastrá los renglones (o usá ↑ ↓) hasta que el procedimiento quede bien. */
export function OrderInput({ value, onChange, disabled, status }: { value: string[]; onChange: (v: string[]) => void; disabled?: boolean; status?: (i: number) => "ok" | "bad" | undefined }) {
  const listRef = useRef<HTMLOListElement>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length || from === to) return;
    const v = [...value];
    const [x] = v.splice(from, 1);
    v.splice(to, 0, x);
    onChange(v);
  };
  const st = useRef<{ i: number; y0: number; el: HTMLElement; h: number } | null>(null);
  return (
    <ol ref={listRef} className="space-y-2" aria-label="Arrastrá para ordenar">
      {value.map((it, i) => {
        const s = status?.(i);
        return (
          <li
            key={it}
            className={`tile !cursor-grab select-none !py-2 ${dragIdx === i ? "is-dragging is-selected" : ""} ${s === "ok" ? "is-correct" : s === "bad" ? "is-wrong" : ""}`}
            style={{ touchAction: disabled ? "auto" : "none" }}
            onPointerDown={(e) => {
              if (disabled || (e.target as HTMLElement).closest("button")) return;
              st.current = { i, y0: e.clientY, el: e.currentTarget, h: e.currentTarget.getBoundingClientRect().height + 8 };
              e.currentTarget.setPointerCapture(e.pointerId);
              setDragIdx(i);
            }}
            onPointerMove={(e) => {
              const d = st.current;
              if (!d) return;
              const dy = e.clientY - d.y0;
              const steps = Math.round(dy / d.h);
              if (steps !== 0) {
                const to = Math.max(0, Math.min(value.length - 1, d.i + steps));
                if (to !== d.i) {
                  move(d.i, to);
                  d.y0 += (to - d.i) * d.h;
                  d.i = to;
                  setDragIdx(to);
                }
              }
            }}
            onPointerUp={() => {
              st.current = null;
              setDragIdx(null);
            }}
            onPointerCancel={() => {
              st.current = null;
              setDragIdx(null);
            }}
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-black text-on-primary" aria-hidden>
              {i + 1}
            </span>
            <span className="min-w-0 flex-1 overflow-x-auto">
              <Txt s={it} />
            </span>
            {!disabled && (
              <span className="flex shrink-0 flex-col">
                <button type="button" className="px-2 text-muted hover:text-primary disabled:opacity-30" disabled={i === 0} onClick={() => move(i, i - 1)} aria-label={`Subir «${it}»`}>
                  ▲
                </button>
                <button type="button" className="px-2 text-muted hover:text-primary disabled:opacity-30" disabled={i === value.length - 1} onClick={() => move(i, i + 1)} aria-label={`Bajar «${it}»`}>
                  ▼
                </button>
              </span>
            )}
            <span className="text-muted" aria-hidden>
              ⠿
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// ───────────────────────── Relacionar con líneas ─────────────────────────

const LINE_COLORS = ["var(--c-math)", "var(--c-physics)", "var(--c-algebra)", "var(--c-chem)", "var(--c-humanities)", "var(--c-code)", "var(--xp)", "var(--c-ipc)"];

/** Relacionar: uní cada elemento de la izquierda con su pareja (tocando o arrastrando). Se dibujan líneas. */
export function MatchInput({ pairs, value, onChange, disabled, seed, wrong }: { pairs: [string, string][]; value: Record<string, string>; onChange: (v: Record<string, string>) => void; disabled?: boolean; seed: number; wrong?: Set<string> }) {
  const [active, setActive] = useState<string | null>(null);
  const rights = useMemo(() => shuffledOrder(pairs.map((p) => p[1]), seed + 7), [pairs, seed]);
  const box = useRef<HTMLDivElement>(null);
  const leftRefs = useRef<Record<string, HTMLElement | null>>({});
  const rightRefs = useRef<Record<string, HTMLElement | null>>({});
  const [lines, setLines] = useState<{ l: string; x1: number; y1: number; x2: number; y2: number }[]>([]);
  const [ghost, setGhost] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const leftIndex = (l: string) => pairs.findIndex((p) => p[0] === l);

  const measure = useCallback(() => {
    const b = box.current?.getBoundingClientRect();
    if (!b) return;
    setLines(
      Object.entries(value).flatMap(([l, r]) => {
        const a = leftRefs.current[l]?.getBoundingClientRect();
        const c = rightRefs.current[r]?.getBoundingClientRect();
        if (!a || !c) return [];
        return [{ l, x1: a.right - b.left, y1: a.top + a.height / 2 - b.top, x2: c.left - b.left, y2: c.top + c.height / 2 - b.top }];
      }),
    );
  }, [value]);
  useLayoutEffect(measure, [measure]);
  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const connect = (l: string, r: string) => {
    const next = Object.fromEntries(Object.entries(value).filter(([k, v]) => v !== r && k !== l));
    next[l] = r;
    onChange(next);
    setActive(null);
  };

  const { bind, wasDrag } = useDrag(
    (l, target) => {
      setGhost(null);
      const r = target?.dataset.drop;
      if (r) connect(l, r);
    },
    (l, e) => {
      const b = box.current?.getBoundingClientRect();
      const a = leftRefs.current[l]?.getBoundingClientRect();
      if (b && a) setGhost({ x1: a.right - b.left, y1: a.top + a.height / 2 - b.top, x2: e.clientX - b.left, y2: e.clientY - b.top });
    },
  );

  return (
    <div ref={box} className="relative">
      <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible" aria-hidden>
        {lines.map((ln) => (
          <g key={ln.l} className="match-line">
            <path d={`M${ln.x1},${ln.y1} C${ln.x1 + 30},${ln.y1} ${ln.x2 - 30},${ln.y2} ${ln.x2},${ln.y2}`} stroke={wrong?.has(ln.l) ? "var(--warn)" : LINE_COLORS[leftIndex(ln.l) % LINE_COLORS.length]} strokeWidth="4" fill="none" strokeLinecap="round" />
            <circle cx={ln.x1} cy={ln.y1} r="5" fill={LINE_COLORS[leftIndex(ln.l) % LINE_COLORS.length]} />
            <circle cx={ln.x2} cy={ln.y2} r="5" fill={LINE_COLORS[leftIndex(ln.l) % LINE_COLORS.length]} />
          </g>
        ))}
        {ghost && <path d={`M${ghost.x1},${ghost.y1} L${ghost.x2},${ghost.y2}`} stroke="var(--primary)" strokeWidth="3" strokeDasharray="6 5" fill="none" />}
      </svg>
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:gap-x-16">
        <div className="space-y-2">
          {pairs.map(([l]) => (
            <button
              key={l}
              ref={(el) => {
                leftRefs.current[l] = el;
              }}
              type="button"
              disabled={disabled}
              {...bind(l, disabled)}
              onClick={() => !wasDrag() && setActive(active === l ? null : l)}
              style={{ touchAction: "none", borderLeft: `6px solid ${LINE_COLORS[leftIndex(l) % LINE_COLORS.length]}` }}
              className={`tile w-full !min-h-12 !py-2 text-left text-sm ${active === l ? "is-selected" : ""} ${wrong?.has(l) ? "is-wrong" : ""}`}
              aria-pressed={active === l}
              aria-label={`${l}${value[l] ? `, unido con ${value[l]}` : ""}`}
            >
              <Txt s={l} />
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {rights.map((r) => {
            const used = Object.values(value).includes(r);
            return (
              <button
                key={r}
                ref={(el) => {
                  rightRefs.current[r] = el;
                }}
                data-drop={r}
                type="button"
                disabled={disabled || !active}
                onClick={() => active && connect(active, r)}
                className={`tile w-full !min-h-12 !py-2 text-left text-sm ${used ? "!bg-surface-2" : ""} ${active ? "ring-2 ring-primary/30" : ""}`}
              >
                <Txt s={r} />
              </button>
            );
          })}
        </div>
      </div>
      <p className="mt-3 text-xs font-semibold text-muted">{active ? `Ahora tocá la pareja de «${active}».` : "Arrastrá desde la izquierda hasta su pareja, o tocá uno y después el otro."}</p>
    </div>
  );
}

// ───────────────────────── Completar huecos ─────────────────────────

/** Completar: arrastrá (o tocá) fichas hasta los huecos «□» del enunciado. */
export function FillInput({ template, tokens, value, onChange, disabled, wrongSlot }: { template: string; tokens: string[]; value: string[]; onChange: (v: string[]) => void; disabled?: boolean; wrongSlot?: number }) {
  const parts = template.split("□");
  const slots = parts.length - 1;
  const place = (tok: string, slot?: number) => {
    const v = [...value];
    while (v.length < slots) v.push("");
    const target = slot ?? v.findIndex((x) => !x);
    if (target < 0) return;
    v[target] = tok;
    onChange(v);
  };
  const { bind, wasDrag } = useDrag((id, target) => {
    const slot = target?.dataset.drop;
    if (slot !== undefined && slot !== null) place(tokens[Number(id)], Number(slot));
  });
  return (
    <div className="space-y-5">
      <div className="board flex flex-wrap items-center justify-center gap-x-1.5 gap-y-3 rounded-2xl p-4 text-xl sm:text-2xl">
        {parts.map((p, i) => (
          <span key={i} className="contents">
            {p.trim() && <Txt s={p.trim()} />}
            {i < slots && (
              <button
                type="button"
                data-drop={i}
                disabled={disabled}
                onClick={() => {
                  if (!value[i]) return;
                  const v = [...value];
                  v[i] = "";
                  onChange(v);
                }}
                className={`grid min-h-12 min-w-14 place-items-center rounded-xl border-2 border-dashed px-3 font-black transition ${value[i] ? "border-primary bg-primary-soft text-ink" : "border-muted/50 bg-surface"} ${wrongSlot === i ? "!border-warn !bg-warn-soft" : ""}`}
                aria-label={value[i] ? `Hueco ${i + 1}: ${value[i]}. Tocá para sacarlo` : `Hueco ${i + 1} vacío`}
              >
                {value[i] ? <Txt s={value[i]} /> : <span className="text-muted">?</span>}
              </button>
            )}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2" aria-label="Fichas">
        {tokens.map((t, i) => {
          const usedCount = value.filter((v) => v === t).length;
          const avail = tokens.slice(0, i + 1).filter((x) => x === t).length > usedCount;
          return avail ? (
            <button key={i} type="button" disabled={disabled} {...bind(String(i), disabled)} onClick={() => !wasDrag() && place(t)} className="tile !min-w-14 justify-center !text-xl" style={{ touchAction: "none" }}>
              <Txt s={t} />
            </button>
          ) : (
            <span key={i} className="tile is-ghost !min-w-14" aria-hidden>
              {t}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ───────────────────────── Construir la respuesta ─────────────────────────

/** Construir: tocá (o arrastrá) bloques para armar la respuesta sobre el renglón. */
export function BuildInput({ tokens, lead, value, onChange, disabled }: { tokens: string[]; lead?: string; value: number[]; onChange: (v: number[]) => void; disabled?: boolean }) {
  const { bind, wasDrag } = useDrag((id, target) => {
    if (target?.dataset.drop === "answer" && !value.includes(Number(id))) onChange([...value, Number(id)]);
  });
  return (
    <div className="space-y-5">
      <div data-drop="answer" className="flex min-h-[4.5rem] flex-wrap items-center gap-2 border-y-2 border-line py-3" aria-label="Tu respuesta" aria-live="polite">
        {lead && (
          <span className="px-1 text-xl font-black">
            <Txt s={lead} />
          </span>
        )}
        {value.length === 0 && <span className="text-sm font-semibold text-muted">Tocá los bloques en orden…</span>}
        {value.map((ti, k) => (
          <button key={`${ti}-${k}`} type="button" disabled={disabled} onClick={() => onChange(value.filter((_, j) => j !== k))} className="tile anim-pop !min-h-11 !px-3 !py-1 !text-lg" aria-label={`${tokens[ti]}. Tocá para sacarlo`}>
            <Txt s={tokens[ti]} />
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2" aria-label="Bloques disponibles">
        {tokens.map((t, i) =>
          value.includes(i) ? (
            <span key={i} className="tile is-ghost !min-h-11 !px-3 !py-1 !text-lg" aria-hidden>
              {t}
            </span>
          ) : (
            <button key={i} type="button" disabled={disabled} {...bind(String(i), disabled)} onClick={() => !wasDrag() && onChange([...value, i])} className="tile !min-h-11 !px-3 !py-1 !text-lg" style={{ touchAction: "none" }}>
              <Txt s={t} />
            </button>
          ),
        )}
      </div>
    </div>
  );
}

// ───────────────────────── Gráfico interactivo ─────────────────────────

/** Tocá el punto pedido o mové el punto sobre la curva. El gráfico responde en vivo. */
export function GraphInput({ expr, mode, x: xr, y: yr, value, onChange, disabled, reveal }: { expr: string; mode: "tap" | "drag"; x: [number, number]; y: [number, number]; value: number | null; onChange: (x: number) => void; disabled?: boolean; reveal?: { x: number; y: number } }) {
  const f = useMemo(() => compileFn(expr), [expr]);
  const W = 340;
  const H = 230;
  const sx = (x: number) => ((x - xr[0]) / (xr[1] - xr[0])) * W;
  const sy = (y: number) => H - ((y - yr[0]) / (yr[1] - yr[0])) * H;
  const ix = (px: number) => xr[0] + (px / W) * (xr[1] - xr[0]);
  const svg = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const fromEvent = (e: { clientX: number }) => {
    const r = svg.current!.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    return Math.max(xr[0], Math.min(xr[1], Math.round(ix(px) * 20) / 20));
  };
  let d = "";
  for (let i = 0; i <= 160; i++) {
    const x = xr[0] + ((xr[1] - xr[0]) * i) / 160;
    const y = f(x);
    if (!Number.isFinite(y) || y < yr[0] - 50 || y > yr[1] + 50) continue;
    d += `${d ? "L" : "M"}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`;
  }
  const px = value ?? (mode === "drag" ? xr[0] + (xr[1] - xr[0]) * 0.15 : null);
  const py = px !== null ? f(px) : null;
  const ticks = (a: number, b: number) => {
    const step = b - a <= 12 ? 1 : b - a <= 30 ? 5 : 10;
    const out: number[] = [];
    for (let v = Math.ceil(a / step) * step; v <= b; v += step) out.push(v);
    return out;
  };
  return (
    <div className="board rounded-2xl p-2">
      <svg
        ref={svg}
        viewBox={`-4 -4 ${W + 8} ${H + 8}`}
        className="w-full cursor-crosshair select-none"
        style={{ touchAction: "none" }}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={`Punto sobre la curva y = ${expr}`}
        aria-valuemin={xr[0]}
        aria-valuemax={xr[1]}
        aria-valuenow={px ?? undefined}
        aria-valuetext={px !== null ? `x = ${fmt(px, 2)}, y = ${fmt(py ?? NaN, 2)}` : "sin punto"}
        onKeyDown={(e) => {
          if (disabled) return;
          const step = (xr[1] - xr[0]) / 100;
          if (e.key === "ArrowRight" || e.key === "ArrowUp") onChange(Math.min(xr[1], (px ?? xr[0]) + step));
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") onChange(Math.max(xr[0], (px ?? xr[0]) - step));
        }}
        onPointerDown={(e) => {
          if (disabled) return;
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          onChange(fromEvent(e));
        }}
        onPointerMove={(e) => dragging.current && !disabled && mode === "drag" && onChange(fromEvent(e))}
        onPointerUp={() => (dragging.current = false)}
      >
        {ticks(xr[0], xr[1]).map((v) => (
          <g key={`x${v}`}>
            <line x1={sx(v)} y1={0} x2={sx(v)} y2={H} stroke="var(--board-line)" />
            {v !== 0 && <text x={sx(v)} y={Math.min(H - 2, Math.max(10, sy(0) + 12))} fontSize="9" textAnchor="middle" fill="var(--board-muted)">{v}</text>}
          </g>
        ))}
        {ticks(yr[0], yr[1]).map((v) => (
          <g key={`y${v}`}>
            <line x1={0} y1={sy(v)} x2={W} y2={sy(v)} stroke="var(--board-line)" />
            {v !== 0 && <text x={Math.max(12, Math.min(W - 2, sx(0) - 3))} y={sy(v) + 3} fontSize="9" textAnchor="end" fill="var(--board-muted)">{v}</text>}
          </g>
        ))}
        {yr[0] <= 0 && yr[1] >= 0 && <line x1={0} y1={sy(0)} x2={W} y2={sy(0)} stroke="var(--board-muted)" strokeWidth="1.3" />}
        {xr[0] <= 0 && xr[1] >= 0 && <line x1={sx(0)} y1={0} x2={sx(0)} y2={H} stroke="var(--board-muted)" strokeWidth="1.3" />}
        <path d={d} fill="none" stroke="var(--subj, var(--primary))" strokeWidth="3" />
        {reveal && (
          <g>
            <circle cx={sx(reveal.x)} cy={sy(reveal.y)} r="9" fill="none" stroke="var(--success)" strokeWidth="3" className="anim-pop" />
          </g>
        )}
        {px !== null && py !== null && Number.isFinite(py) && (
          <g>
            <line x1={sx(px)} y1={sy(py)} x2={sx(px)} y2={sy(0)} stroke="var(--primary)" strokeDasharray="4 3" />
            <circle cx={sx(px)} cy={sy(py)} r={mode === "drag" ? 10 : 7} fill="var(--primary)" stroke="var(--board-bg)" strokeWidth="3" />
          </g>
        )}
      </svg>
      <p className="px-2 pb-1 text-center font-mono text-sm font-bold" aria-hidden>
        {px !== null && py !== null ? `x = ${fmt(px, 2)}   f(x) = ${fmt(py, 2)}` : mode === "tap" ? "Tocá el gráfico" : "Arrastrá el punto"}
      </p>
    </div>
  );
}

// ───────────────────────── Encontrá el error ─────────────────────────

export function FindErrorInput({ steps, value, onChange, disabled, wrong, fix }: { steps: string[]; value: number | null; onChange: (i: number) => void; disabled?: boolean; wrong?: number; fix?: string }) {
  return (
    <ol className="board space-y-2 rounded-2xl p-3" role="radiogroup" aria-label="Renglones de la resolución">
      {steps.map((s, i) => (
        <li key={i}>
          <button
            type="button"
            role="radio"
            aria-checked={value === i}
            disabled={disabled}
            onClick={() => onChange(i)}
            className={`tile w-full !min-h-12 !py-2 text-left !text-lg ${wrong === i ? "is-wrong" : ""}`}
          >
            <span className="tile-key">{i + 1}</span>
            <span className="min-w-0 flex-1 overflow-x-auto">
              <Txt s={s} />
              {wrong === i && fix && (
                <span className="mt-1 block text-sm font-bold text-success">
                  ✓ <Txt s={fix} />
                </span>
              )}
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}

/** Opción de "elegir el gráfico": un mini-gráfico tocable. */
export function PlotOption({ expr, label }: { expr: string; label: string }) {
  return (
    <span className="block w-full">
      <span className="mb-1 block text-xs font-bold text-muted">{label}</span>
      <Plot fns={[{ expr }]} xRange={[-4, 4]} yRange={[-4, 6]} height={150} />
    </span>
  );
}
