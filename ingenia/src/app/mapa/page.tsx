"use client";
import { useState } from "react";
import Link from "next/link";
import { MAP, type MapSection } from "@/content/map";
import { findUnit, getSubject } from "@/content/curriculum";
import { getLesson } from "@/content/lessons";
import { actions, useProgress } from "@/lib/store";
import { missingRequirements, nodeStatus, nodeTitle, unitProgress, type NodeStatus } from "@/lib/learning";
import type { ProgressState } from "@/engine/progress/state";
import { Gate } from "@/components/layout/Gate";
import { PageHeader, ProgressBar } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";

const STATUS: Record<NodeStatus, { icon: string; label: string; ring: string; bg: string }> = {
  bloqueado: { icon: "🔒", label: "Bloqueado", ring: "var(--border)", bg: "var(--surface-2)" },
  disponible: { icon: "⚪", label: "Disponible", ring: "var(--primary)", bg: "var(--surface)" },
  "en-progreso": { icon: "🟡", label: "En progreso", ring: "var(--xp)", bg: "var(--xp-soft)" },
  completado: { icon: "🟢", label: "Completado", ring: "var(--success)", bg: "var(--success-soft)" },
  dominado: { icon: "⭐", label: "Dominado", ring: "var(--xp)", bg: "var(--xp-soft)" },
  estructura: { icon: "📋", label: "Programa en carga", ring: "var(--border)", bg: "var(--surface-2)" },
};

function Node({ id, status, offset, onOpen }: { id: string; status: NodeStatus; offset: number; onOpen: () => void }) {
  const st = STATUS[status];
  const unit = findUnit(id);
  const s = useProgress();
  const pct = unit ? unitProgress(s, unit.unit) : null;
  return (
    <div className="flex justify-center" style={{ transform: `translateX(${offset}px)` }}>
      <button onClick={onOpen} className="group flex flex-col items-center gap-2" aria-label={`${nodeTitle(id)}: ${st.label}`}>
        <span
          className={`relative grid h-20 w-20 place-items-center rounded-full border-4 text-3xl shadow-md transition group-hover:scale-105 ${status === "estructura" ? "border-dashed" : ""} ${status === "disponible" ? "animate-[pulse_2.5s_ease-in-out_infinite]" : ""}`}
          style={{ borderColor: st.ring, background: st.bg }}
        >
          <span aria-hidden>{status === "bloqueado" || status === "estructura" ? st.icon : unit?.unit.icon ?? unit?.subject.icon ?? getSubject(id)?.icon}</span>
          {status !== "bloqueado" && status !== "estructura" && (
            <span className="absolute -right-1 -top-1 text-lg" aria-hidden>
              {st.icon}
            </span>
          )}
        </span>
        <span className="max-w-40 text-center text-sm font-semibold leading-tight">{nodeTitle(id).replace(/^Nivel (\d) · /, "N$1 · ")}</span>
        {pct && pct.total > 0 && status !== "bloqueado" && (
          <span className="text-xs text-muted">
            {pct.done}/{pct.total} lecciones
          </span>
        )}
      </button>
    </div>
  );
}

function Section({ section, s, onOpen }: { section: MapSection; s: ProgressState; onOpen: (id: string) => void }) {
  const offsets = [0, 60, 90, 60, 0, -60, -90, -60];
  return (
    <section className="card p-5" aria-labelledby={`sec-${section.id}`}>
      <h2 id={`sec-${section.id}`} className="text-lg font-bold">
        {section.title}
      </h2>
      <p className="text-sm text-muted">{section.subtitle}</p>
      <div className="relative mt-6 space-y-6">
        <div className="absolute bottom-10 left-1/2 top-10 w-1 -translate-x-1/2 rounded-full bg-line" aria-hidden />
        {section.nodes.map((n, i) => (
          <div key={n.id} className="relative">
            <Node id={n.id} status={nodeStatus(s, n.id)} offset={section.nodes.length > 2 ? offsets[i % offsets.length] * 0.7 : 0} onOpen={() => onOpen(n.id)} />
          </div>
        ))}
      </div>
    </section>
  );
}

function Detail({ id, onClose }: { id: string; onClose: () => void }) {
  const s = useProgress();
  const status = nodeStatus(s, id);
  const unit = findUnit(id);
  const subject = unit?.subject ?? getSubject(id);
  const missing = missingRequirements(s, id);
  const pct = unit ? unitProgress(s, unit.unit) : null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="detalle-titulo">
      <button className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Cerrar" />
      <div className="anim-pop relative max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-surface p-6 sm:rounded-3xl">
        <button className="btn btn-ghost absolute right-3 top-3 !px-2" onClick={onClose} aria-label="Cerrar">
          <Icon name="x" />
        </button>
        <p className="text-sm text-muted">{subject?.name}</p>
        <h2 id="detalle-titulo" className="pr-8 text-2xl font-bold">
          {nodeTitle(id)}
        </h2>
        <span className="chip mt-2">
          {STATUS[status].icon} {STATUS[status].label}
        </span>
        {unit && <p className="mt-3 text-muted">{unit.unit.summary}</p>}

        {status === "bloqueado" && (
          <div className="mt-4 rounded-xl bg-surface-2 p-4 text-sm">
            <p>
              Te recomendamos completar primero: <strong>{missing.map(nodeTitle).join(", ")}</strong>.
            </p>
            <p className="mt-1 text-muted">Igual podés entrar: nada está bloqueado del todo.</p>
            <button className="btn btn-secondary mt-3" onClick={() => actions.unlockNode(id)}>
              Entrar igual
            </button>
          </div>
        )}

        {unit && status !== "bloqueado" && unit.unit.lessonIds.length > 0 && (
          <>
            {pct && <ProgressBar value={pct.done / Math.max(1, pct.total)} className="mt-4" label="Progreso de la unidad" />}
            <ol className="mt-4 space-y-2">
              {unit.unit.lessonIds.map((lid) => {
                const l = getLesson(lid);
                const ls = s.lessons[lid];
                return (
                  <li key={lid}>
                    <Link href={`/leccion/${lid}`} className="flex items-center gap-3 rounded-xl border border-line p-3 hover:border-primary">
                      <span aria-hidden>{ls?.status === "completada" ? "🟢" : ls ? "🟡" : "⚪"}</span>
                      <span className="flex-1">
                        <span className="block font-semibold">{l?.title}</span>
                        <span className="text-xs text-muted">{l?.estimatedMinutes} min · {l?.subtitle}</span>
                      </span>
                      <Icon name="arrowRight" size={18} />
                    </Link>
                  </li>
                );
              })}
            </ol>
            {unit.unit.topicIds.length > 0 && (
              <Link href={`/practicar?unidad=${unit.unit.id}`} className="btn btn-secondary mt-4 w-full">
                Practicar esta unidad
              </Link>
            )}
          </>
        )}

        {status === "estructura" && subject && (
          <div className="mt-4 space-y-3 text-sm">
            <p className="rounded-xl bg-surface-2 p-3">{subject.official.note}</p>
            <Link href={`/materias/${subject.id}`} className="btn btn-secondary w-full">
              Ver información de la materia
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function MapPage() {
  const s = useProgress();
  const [open, setOpen] = useState<string | null>(null);
  const goal = s.profile.goal ?? "ambas";
  const base = MAP.filter((sec) => !sec.career);
  const careers = MAP.filter((sec) => sec.career).sort((a, b) => Number(b.career === goal) - Number(a.career === goal));
  return (
    <div>
      <PageHeader title="Mapa de aprendizaje" subtitle="Tocá cada nodo para ver sus lecciones. El camino sugiere un orden, pero podés explorar libremente." />
      <div className="mb-5 flex flex-wrap gap-2 text-xs">
        {(Object.keys(STATUS) as NodeStatus[]).map((k) => (
          <span key={k} className="chip">
            {STATUS[k].icon} {STATUS[k].label}
          </span>
        ))}
      </div>
      <div className="space-y-5">
        {base.map((sec) => (
          <Section key={sec.id} section={sec} s={s} onOpen={setOpen} />
        ))}
        <div className="grid gap-5 md:grid-cols-2">
          {careers.map((sec) => (
            <div key={sec.id} className={goal !== "ambas" && sec.career !== goal ? "opacity-70" : ""}>
              <Section section={sec} s={s} onOpen={setOpen} />
            </div>
          ))}
        </div>
      </div>
      {open && <Detail id={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

export default function Page() {
  return (
    <Gate>
      <MapPage />
    </Gate>
  );
}
