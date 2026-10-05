"use client";
import { useState } from "react";
import { SHOP, type ShopItem } from "@/content/shop";
import { GEARS } from "@/engine/progress/rules";
import { actions, useProgress } from "@/lib/store";
import { Gate } from "@/components/layout/Gate";
import { Nodo } from "@/components/guide/Nodo";
import { PageHeader } from "@/components/ui/primitives";

function Item({ item }: { item: ShopItem }) {
  const s = useProgress();
  const [msg, setMsg] = useState<string | null>(null);
  const owned = item.price === 0 || s.owned.includes(item.id);
  const active =
    (item.kind === "accent" && s.settings.accent === item.value) || (item.kind === "guide" && s.settings.guide === item.value);
  const apply = () => {
    if (item.kind === "accent") actions.updateSettings({ accent: item.value! });
    if (item.kind === "guide") actions.updateSettings({ guide: active ? "" : item.value! });
  };
  const buy = () => {
    const err = actions.buy(item.id);
    setMsg(err ?? (item.kind === "freeze" ? "Protector listo." : "¡Es tuyo!"));
    if (!err && item.kind !== "freeze") apply();
  };
  return (
    <div className={`card flex flex-col gap-3 p-4 ${active ? "ring-2 ring-primary" : ""}`}>
      <div className="flex items-center gap-3">
        {item.kind === "guide" ? (
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-surface-2">
            <span className="guide-preview" data-guide={item.value}>
              <Nodo size={40} bob={false} />
            </span>
          </span>
        ) : item.kind === "freeze" ? (
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-warn-soft text-2xl" aria-hidden>
            🧊
          </span>
        ) : (
          <span className="h-12 w-12 rounded-xl" style={{ background: item.swatch }} aria-hidden />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-bold">{item.name}</p>
          <p className="text-sm text-muted">{item.description}</p>
        </div>
      </div>
      {item.kind === "freeze" ? (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted">Tenés {s.streakFreezes}/2</span>
          <button className="btn btn-secondary !min-h-10" onClick={buy} disabled={s.streakFreezes >= 2}>
            ⚙️ {item.price}
          </button>
        </div>
      ) : owned ? (
        <button className={`btn !min-h-10 ${active ? "btn-primary" : "btn-secondary"}`} onClick={apply} aria-pressed={active}>
          {active ? (item.kind === "guide" ? "En uso (tocar para quitar)" : "En uso") : "Usar"}
        </button>
      ) : (
        <button className="btn btn-secondary !min-h-10" onClick={buy}>
          Comprar · ⚙️ {item.price}
        </button>
      )}
      {msg && <p className="text-sm" role="status">{msg}</p>}
    </div>
  );
}

function Shop() {
  const s = useProgress();
  const groups: { title: string; kind: ShopItem["kind"] }[] = [
    { title: "Racha", kind: "freeze" },
    { title: "Color de la app", kind: "accent" },
    { title: "Estilo del guía", kind: "guide" },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Taller" subtitle="Los engranajes se ganan estudiando y solo sirven para cosas estéticas: nunca bloquean contenido." />
      <div className="card flex items-center gap-4 p-4">
        <span className="text-4xl" aria-hidden>
          ⚙️
        </span>
        <div>
          <p className="text-3xl font-black">{s.gears}</p>
          <p className="text-sm text-muted">
            engranajes · +{GEARS.correct} por ejercicio, +{GEARS.lesson} por lección, +{GEARS.challenge} por desafío
          </p>
        </div>
      </div>
      {groups.map((g) => (
        <section key={g.kind}>
          <h2 className="mb-3 text-lg font-bold">{g.title}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {SHOP.filter((i) => i.kind === g.kind).map((i) => (
              <Item key={i.id} item={i} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <Gate>
      <Shop />
    </Gate>
  );
}
