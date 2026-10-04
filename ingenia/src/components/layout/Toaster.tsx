"use client";
import { useEffect, useState } from "react";
import { store, type UiEvent } from "@/lib/store";
import { ACHIEVEMENTS } from "@/content/achievements";
import { findUnit } from "@/content/curriculum";

/** Notificaciones breves: XP ganada, logros, subidas de nivel y unidades completadas. */
export function Toaster() {
  const [items, setItems] = useState<UiEvent[]>([]);
  useEffect(
    () =>
      store.onEvent((e) => {
        setItems((prev) => [...prev.slice(-3), e]);
        const ms = e.type === "xp" ? 1800 : 4000;
        setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== e.id)), ms);
      }),
    [],
  );
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:items-end lg:pr-6" aria-live="polite">
      {items.map((e) => {
        if (e.type === "xp")
          return (
            <div key={e.id} className="anim-pop rounded-full bg-xp px-4 py-1.5 text-sm font-bold text-surface shadow-lg">
              +{e.amount} XP{e.label ? ` · ${e.label}` : ""}
            </div>
          );
        if (e.type === "achievement") {
          const a = ACHIEVEMENTS.find((x) => x.id === e.achievementId);
          return (
            <div key={e.id} className="anim-pop flex items-center gap-3 rounded-2xl border border-accent bg-surface px-4 py-3 shadow-xl">
              <span className="text-3xl" aria-hidden>
                {a?.icon}
              </span>
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-accent">Logro desbloqueado</div>
                <div className="font-bold">{a?.title}</div>
              </div>
            </div>
          );
        }
        if (e.type === "level")
          return (
            <div key={e.id} className="anim-pop rounded-2xl bg-primary px-5 py-3 font-bold text-on-primary shadow-xl">
              ¡Subiste al nivel {e.level}!
            </div>
          );
        return (
          <div key={e.id} className="anim-pop rounded-2xl border border-success bg-surface px-5 py-3 font-semibold shadow-xl">
            Unidad completada: {findUnit(e.unitId)?.unit.title} · +50 XP
          </div>
        );
      })}
    </div>
  );
}
