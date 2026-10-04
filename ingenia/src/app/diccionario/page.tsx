"use client";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GLOSSARY } from "@/content/glossary";
import { normalize } from "@/lib/search";
import { PageHeader } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";

function Dictionary() {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const list = useMemo(() => {
    const n = normalize(q);
    if (!q) return GLOSSARY;
    return GLOSSARY.filter((g) => g.symbol === q || g.aliases?.includes(q) || normalize(`${g.name} ${g.meaning} ${g.symbol}`).includes(n));
  }, [q]);
  return (
    <div>
      <PageHeader title="Diccionario matemático" subtitle="Cada símbolo, en palabras. También podés tocar los símbolos subrayados en cualquier lección." />
      <label className="relative mb-5 block">
        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input className="input !pl-10" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscá un símbolo o una palabra (ej.: Σ, pertenece, límite)" aria-label="Buscar en el diccionario" />
      </label>
      <dl className="grid gap-3 sm:grid-cols-2">
        {list.map((g) => (
          <div key={g.symbol} className="card flex gap-4 p-4">
            <dt className="math grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-primary-soft text-2xl text-primary">{g.symbol}</dt>
            <dd className="min-w-0">
              <p className="font-bold">{g.name}</p>
              <p className="text-sm text-muted">{g.meaning}</p>
              {g.example && <p className="math mt-1 text-sm">{g.example}</p>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Dictionary />
    </Suspense>
  );
}
