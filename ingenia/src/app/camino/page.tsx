"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useProgress, actions } from "@/lib/store";
import { buildPath, currentNode, progressLadder, type PathNode, type PathSection } from "@/lib/path";
import { getLesson } from "@/content/lessons";
import { findUnit } from "@/content/curriculum";
import { XP } from "@/engine/progress/rules";
import { Gate } from "@/components/layout/Gate";
import { Nodo } from "@/components/guide/Nodo";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/primitives";

/** Desplazamiento lateral del nodo i: un zigzag suave. */
const OFFSET = [0, 46, 70, 46, 0, -46, -70, -46];

function NodeButton({ node, color, offset, onOpen }: { node: PathNode; color: string; offset: number; onOpen: () => void }) {
  const isBoss = node.kind === "boss";
  const title = node.kind === "lesson" ? getLesson(node.lessonId)?.title ?? "" : "Desafío final";
  const done = node.status === "hecho";
  const current = node.status === "actual";
  const locked = node.status === "bloqueado";
  return (
    <div className="relative mx-auto flex w-fit justify-center" style={{ transform: `translateX(${offset}px)` }}>
      {current && (
        <div className="anim-pop absolute -top-9 z-10 rounded-xl px-3 py-1 text-xs font-black uppercase tracking-wide text-on-primary shadow" style={{ background: "var(--primary)" }}>
          Empezar
        </div>
      )}
      <button
        onClick={onOpen}
        aria-label={`${title}: ${done ? "completado" : current ? "siguiente" : locked ? "bloqueado" : "disponible"}`}
        className={`relative grid place-items-center rounded-full border-b-[6px] transition active:translate-y-0.5 active:border-b-2 ${isBoss ? "h-20 w-20" : "h-[72px] w-[72px]"} ${current ? "node-current" : ""}`}
        style={{
          background: locked ? "var(--surface-2)" : done || current ? color : "var(--surface)",
          borderColor: locked ? "var(--border)" : `color-mix(in srgb, ${color} 70%, black)`,
          color: locked ? "var(--muted)" : done || current ? "#fff" : color,
          outline: !done && !current && !locked ? `3px solid ${color}` : undefined,
        }}
      >
        {isBoss ? (
          <span className="text-3xl" aria-hidden>
            {node.kind === "boss" && node.won ? "👑" : "🏆"}
          </span>
        ) : done ? (
          <Icon name="check" size={34} />
        ) : locked ? (
          <Icon name="lock" size={26} />
        ) : (
          <Icon name="star" size={30} />
        )}
      </button>
    </div>
  );
}

function NodeSheet({ node, section, onClose }: { node: PathNode; section: PathSection; onClose: () => void }) {
  const s = useProgress();
  if (node.kind === "boss") {
    const unit = findUnit(node.unitId)?.unit;
    return (
      <Sheet onClose={onClose}>
        <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: section.color }}>
          {section.title}
        </p>
        <h2 className="text-2xl font-black">👑 Desafío final</h2>
        <p className="mt-2 text-muted">10 ejercicios mezclados de toda la unidad, sin pistas, con 3 vidas. Si lo superás: +{XP.challenge} XP y la unidad queda coronada.</p>
        {node.won && <p className="mt-2 font-semibold text-success">Ya lo superaste. Podés volver a jugarlo para practicar.</p>}
        {node.status === "bloqueado" && <p className="mt-2 rounded-xl bg-surface-2 p-3 text-sm">Conviene terminar primero las lecciones de la unidad ({unit?.lessonIds.filter((l) => s.lessons[l]?.status !== "completada").length} pendientes). Igual podés intentarlo.</p>}
        <Link href={`/desafio?unidad=${node.unitId}`} className="btn btn-primary mt-5 w-full text-lg">
          {node.status === "bloqueado" ? "Intentarlo igual" : "Empezar desafío"}
        </Link>
      </Sheet>
    );
  }
  const lesson = getLesson(node.lessonId)!;
  const ls = s.lessons[node.lessonId];
  return (
    <Sheet onClose={onClose}>
      <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: section.color }}>
        {section.title}
      </p>
      <h2 className="text-2xl font-black">{lesson.title}</h2>
      <p className="text-muted">{lesson.subtitle}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <span className="chip">⏱ {lesson.estimatedMinutes} min</span>
        <span className="chip !bg-xp-soft !text-xp">+{XP.lesson} XP · perfecta +{XP.perfectLesson}</span>
        {ls?.bestAccuracy !== undefined && <span className="chip">Mejor precisión {Math.round(ls.bestAccuracy * 100)}%</span>}
        {ls?.perfect && <span className="chip !bg-success-soft !text-success">Perfecta</span>}
      </div>
      {node.status === "bloqueado" ? (
        <div className="mt-4 rounded-xl bg-surface-2 p-3 text-sm">
          <p>Te recomendamos completar primero la lección anterior del camino. Igual podés entrar: nada está cerrado del todo.</p>
          <Link href={`/leccion/${node.lessonId}`} onClick={() => actions.unlockNode(node.unitId)} className="btn btn-secondary mt-3 w-full">
            Entrar igual
          </Link>
        </div>
      ) : (
        <Link href={`/leccion/${node.lessonId}`} className="btn btn-primary mt-5 w-full text-lg">
          {node.status === "hecho" ? "Repasar lección" : ls ? "Continuar" : "Empezar"} <Icon name="arrowRight" />
        </Link>
      )}
    </Sheet>
  );
}

function Sheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Cerrar" />
      <div className="anim-pop relative w-full max-w-md rounded-t-3xl bg-surface p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:rounded-3xl">
        <button className="btn btn-ghost absolute right-3 top-3 !px-2" onClick={onClose} aria-label="Cerrar">
          <Icon name="x" />
        </button>
        {children}
      </div>
    </div>
  );
}

function Path() {
  const s = useProgress();
  const sections = buildPath(s);
  const current = currentNode(sections);
  const [open, setOpen] = useState<{ node: PathNode; section: PathSection } | null>(null);
  const currentRef = useRef<HTMLDivElement>(null);
  const ladder = progressLadder(s);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, []);

  return (
    <div className="mx-auto max-w-xl overflow-x-clip">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Tu camino</h1>
          <p className="text-muted">Un paso a la vez. Tocá el nodo marcado para seguir.</p>
        </div>
        <Link href="/materias" className="btn btn-secondary !min-h-10 text-sm">
          <Icon name="map" size={18} /> Explorar libremente
        </Link>
      </div>
      <div className="mb-8 grid grid-cols-2 gap-3">
        {ladder.map((l) => (
          <div key={l.label} className="card p-3">
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-semibold">{l.label}</span>
              <span>{Math.round(l.value * 100)}%</span>
            </div>
            <ProgressBar value={l.value} height={6} label={l.label} />
          </div>
        ))}
      </div>

      <div className="space-y-10">
        {sections.map((sec) => (
          <section key={sec.unitId} aria-labelledby={`sec-${sec.unitId}`}>
            <div className="sticky top-14 z-20 mb-8 flex items-center gap-3 rounded-2xl px-4 py-3 text-white shadow-md" style={{ background: sec.color }}>
              <span className="text-2xl" aria-hidden>
                {sec.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide opacity-85">{sec.subjectName}</p>
                <h2 id={`sec-${sec.unitId}`} className="truncate font-black">
                  {sec.title}
                </h2>
              </div>
              <span className="rounded-full bg-black/20 px-2.5 py-1 text-sm font-bold">
                {sec.done}/{sec.total}
              </span>
            </div>
            <div className="space-y-6">
              {sec.nodes.map((node, i) => {
                const isCurrent = current?.id === node.id;
                return (
                  <div key={node.id} ref={isCurrent ? currentRef : undefined} className="relative">
                    <NodeButton node={node} color={sec.color} offset={OFFSET[i % OFFSET.length]} onOpen={() => setOpen({ node, section: sec })} />
                    {isCurrent && (
                      <div className="pointer-events-none absolute top-1 hidden sm:block" style={{ left: `calc(50% + ${OFFSET[i % OFFSET.length]}px + 56px)` }}>
                        <Nodo size={52} mood="happy" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      <p className="mt-12 text-center text-sm text-muted">
        El camino sigue con más unidades a medida que se cargan. Mientras tanto, podés{" "}
        <Link href="/materias" className="font-semibold text-primary">
          explorar todas las materias
        </Link>
        .
      </p>
      {open && <NodeSheet node={open.node} section={open.section} onClose={() => setOpen(null)} />}
    </div>
  );
}

export default function Page() {
  return (
    <Gate>
      <Path />
    </Gate>
  );
}
