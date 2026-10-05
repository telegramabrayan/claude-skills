"use client";
import { useMemo, useState } from "react";
import { MathText } from "../math/MathText";
import { Plot } from "../math/Plot";

/** Ordenar: tocás los elementos en el orden correcto (cómodo en el celular, sin arrastrar). */
export function OrderInput({ items, value, onChange, disabled }: { items: string[]; value: string[]; onChange: (v: string[]) => void; disabled?: boolean }) {
  const remaining = items.filter((it) => !value.includes(it));
  return (
    <div className="space-y-3">
      <ol className="min-h-16 space-y-2 rounded-xl border-2 border-dashed border-line p-2" aria-label="Tu orden">
        {value.length === 0 && <li className="p-2 text-sm text-muted">Tocá abajo el primer paso.</li>}
        {value.map((it, i) => (
          <li key={it}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange(value.filter((x) => x !== it))}
              className="flex w-full items-center gap-3 rounded-lg border border-primary bg-primary-soft px-3 py-2 text-left"
              aria-label={`Paso ${i + 1}: ${it}. Tocá para quitarlo`}
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-on-primary">{i + 1}</span>
              <MathText text={`$${it}$`} block={false} />
            </button>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2" aria-label="Elementos disponibles">
        {remaining.map((it) => (
          <button key={it} type="button" disabled={disabled} onClick={() => onChange([...value, it])} className="rounded-lg border border-line bg-surface px-3 py-2 hover:border-primary">
            <MathText text={`$${it}$`} block={false} />
          </button>
        ))}
      </div>
    </div>
  );
}

/** Relacionar: elegís un elemento de la izquierda y después su pareja. */
export function MatchInput({ pairs, value, onChange, disabled, seed }: { pairs: [string, string][]; value: Record<string, string>; onChange: (v: Record<string, string>) => void; disabled?: boolean; seed: number }) {
  const [active, setActive] = useState<string | null>(null);
  const rights = useMemo(() => {
    const arr = pairs.map((p) => p[1]);
    // mezcla determinística para que no queden alineadas
    return arr.map((v, i) => ({ v, k: (i * 7 + seed) % 11 })).sort((a, b) => a.k - b.k).map((x) => x.v);
  }, [pairs, seed]);
  const usedRight = new Set(Object.values(value));
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        {pairs.map(([l]) => (
          <button
            key={l}
            type="button"
            disabled={disabled}
            onClick={() => setActive(active === l ? null : l)}
            className={`w-full rounded-lg border-2 px-3 py-2 text-left text-sm font-semibold ${active === l ? "border-primary bg-primary-soft" : value[l] ? "border-success/60 bg-success-soft" : "border-line bg-surface"}`}
            aria-pressed={active === l}
          >
            {l}
            {value[l] && <span className="block text-xs font-normal text-muted">→ {value[l]}</span>}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {rights.map((r) => (
          <button
            key={r}
            type="button"
            disabled={disabled || !active}
            onClick={() => {
              if (!active) return;
              const next = Object.fromEntries(Object.entries(value).filter(([, v]) => v !== r));
              next[active] = r;
              onChange(next);
              setActive(null);
            }}
            className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${usedRight.has(r) ? "border-line bg-surface-2 text-muted" : "border-line bg-surface hover:border-primary"} ${active ? "" : "opacity-80"}`}
          >
            {r}
          </button>
        ))}
      </div>
      <p className="col-span-2 text-xs text-muted">{active ? `Elegí la pareja de «${active}».` : "Tocá un elemento de la izquierda y después su pareja."}</p>
    </div>
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
