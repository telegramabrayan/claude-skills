"use client";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { actions, useProgress } from "@/lib/store";
import { FORMULAS } from "@/content/formulas";
import { getSubject } from "@/content/curriculum";
import { normalize } from "@/lib/search";
import { PageHeader } from "@/components/ui/primitives";
import { MathText } from "@/components/math/MathText";
import { Icon } from "@/components/ui/Icon";

function FormulaStar({ id, name }: { id: string; name: string }) {
  const saved = useProgress().saved.some((x) => x.kind === "formula" && x.id === id);
  return (
    <button
      className="btn btn-ghost !min-h-9 !px-2"
      aria-pressed={saved}
      aria-label={saved ? `Quitar ${name} de guardados` : `Guardar ${name}`}
      onClick={() => actions.toggleSaved({ kind: "formula", id, title: name, href: `/formulas?q=${encodeURIComponent(name)}` })}
    >
      <span aria-hidden>{saved ? "⭐" : "☆"}</span>
    </button>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Formulas />
    </Suspense>
  );
}

function Formulas() {
  const [q, setQ] = useState(useSearchParams().get("q") ?? "");
  const list = useMemo(() => {
    const n = normalize(q);
    return FORMULAS.filter((f) => !n || normalize(`${f.name} ${f.expression} ${f.meaning} ${f.tags.join(" ")}`).includes(n));
  }, [q]);
  return (
    <div>
      <PageHeader title="Formulario" subtitle="Cada fórmula con su significado, cuándo usarla, qué es cada variable, sus unidades y los errores más comunes." />
      <label className="relative mb-5 block">
        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input className="input !pl-10" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar fórmula (ej.: velocidad, vector, presión)" aria-label="Buscar fórmula" />
      </label>
      <div className="space-y-4">
        {list.map((f) => (
          <article key={f.id} id={f.id} className="card scroll-mt-24 p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs text-muted">{getSubject(f.subjectId)?.shortName}</p>
                <h2 className="text-lg font-bold">{f.name}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <FormulaStar id={f.id} name={f.name} />
                {f.tags.map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <p className="math my-4 rounded-xl bg-surface-2 p-4 text-center text-2xl">{f.expression}</p>
            <div className="grid gap-4 text-sm md:grid-cols-2">
              <div>
                <p className="font-bold">Qué significa</p>
                <MathText text={f.meaning} />
                <p className="mt-3 font-bold">Cuándo usarla</p>
                <MathText text={f.whenToUse} />
                <p className="mt-3 font-bold">Ejemplo</p>
                <p className="math">{f.example}</p>
              </div>
              <div>
                {f.variables.length > 0 && (
                  <>
                    <p className="font-bold">Variables</p>
                    <table className="mt-1 w-full">
                      <tbody>
                        {f.variables.map((v) => (
                          <tr key={v.symbol} className="border-b border-line last:border-0">
                            <td className="math py-1 pr-2 font-bold">{v.symbol}</td>
                            <td className="py-1">{v.meaning}</td>
                            <td className="py-1 text-right text-muted">{v.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
                <p className="mt-3 font-bold text-warn">Errores habituales</p>
                <ul className="list-disc pl-5">
                  {f.commonErrors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
