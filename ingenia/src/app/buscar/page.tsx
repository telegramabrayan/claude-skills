"use client";
import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { search } from "@/lib/search";
import { PageHeader } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";

const SUGGESTIONS = ["aceleración", "pendiente", "fracciones", "vectores", "bucle", "dominio", "Σ", "despejar"];

function SearchPage() {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const results = useMemo(() => search(q), [q]);
  return (
    <div>
      <PageHeader title="Buscar" subtitle="Materias, unidades, lecciones, temas, fórmulas, definiciones y ejercicios." />
      <label className="relative block">
        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input className="input !pl-10 text-lg" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej.: aceleración" autoFocus aria-label="Buscar" />
      </label>
      {!q && (
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="chip !text-sm" onClick={() => setQ(s)}>
              {s}
            </button>
          ))}
        </div>
      )}
      {q && (
        <p className="mt-4 text-sm text-muted" aria-live="polite">
          {results.length} resultado{results.length === 1 ? "" : "s"}
        </p>
      )}
      <ul className="mt-2 space-y-2">
        {results.map((r) => (
          <li key={`${r.type}-${r.title}-${r.href}`}>
            <Link href={r.href} className="card flex items-center gap-3 p-4 hover:border-primary">
              <span className="chip w-24 shrink-0 justify-center">{r.type}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{r.title}</span>
                {r.path && <span className="text-sm text-muted">{r.path}</span>}
              </span>
              <Icon name="arrowRight" size={18} className="text-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <SearchPage />
    </Suspense>
  );
}
